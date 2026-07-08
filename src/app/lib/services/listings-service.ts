import { getListingsCollection } from '../db/mongodb';
import {
  Listing,
  ListingCategory,
  ListingStatus,
  PropertyType,
} from '../definitions/listing.types';
import { getAntiparochiQueryValues } from '../helpers/listing-antiparochi-helpers';
import { ListingSearchParams } from '../helpers/listing-search-params';
import { buildPublicListingStatusQuery } from '../helpers/listing-status-helpers';

export type AdminSortField = 'updatedAt' | 'publishedAt' | 'price' | 'title.en';

export type AdminSortDirection = 'asc' | 'desc';

export interface AdminListingsParams {
  status?: ListingStatus;
  listingType?: 'buy' | 'rent';
  category?: ListingCategory;
  propertyType?: PropertyType;
  sortField?: AdminSortField;
  sortDirection?: AdminSortDirection;
  page?: number;
}

const ADMIN_PAGE_SIZE = 50;

export interface PaginatedListings {
  listings: Listing[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type SitemapListing = Pick<
  Listing,
  | 'slug'
  | 'title'
  | 'description'
  | 'images'
  | 'videos'
  | 'publishedAt'
  | 'updatedAt'
>;

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

function buildPropertyTypesQuery(propertyTypes: PropertyType[]) {
  return {
    $or: [
      { propertyTypes: { $in: propertyTypes } },
      { propertyType: { $in: propertyTypes } },
    ],
  };
}

export async function searchListings(
  params: ListingSearchParams
): Promise<PaginatedListings> {
  const page = params.page ?? DEFAULT_PAGE;
  const limit = params.limit ?? DEFAULT_LIMIT;
  const query: Record<string, unknown> = {
    listingType: params.listingType,
    status: buildPublicListingStatusQuery(),
  };

  if (params.category?.length) query.category = { $in: params.category };
  if (params.propertyType?.length)
    Object.assign(
      query,
      buildPropertyTypesQuery(params.propertyType as PropertyType[])
    );
  if (params.condition?.length) query.condition = { $in: params.condition };
  if (params.furnishing?.length) query.furnishing = { $in: params.furnishing };
  if (params.energyRating?.length)
    query.energyRating = { $in: params.energyRating };
  if (params.viewType?.length) query.view = { $in: params.viewType };
  if (params.features?.length) query.features = { $in: params.features };
  if (params.amenities?.length) query.amenities = { $in: params.amenities };
  if (params.suitableFor?.length)
    query.suitableFor = { $in: params.suitableFor };
  const antiparochiValues = getAntiparochiQueryValues(params.antiparochi);
  if (antiparochiValues.length) query.antiparochi = { $in: antiparochiValues };

  if (params.minPrice != null || params.maxPrice != null) {
    query.price = {
      ...(params.minPrice != null ? { $gte: params.minPrice } : {}),
      ...(params.maxPrice != null ? { $lte: params.maxPrice } : {}),
    };
  }

  const collection = await getListingsCollection();
  const total = await collection.countDocuments(query);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const skip = (page - 1) * limit;

  const listings = await collection
    .find(query, { projection: { _id: 0 } })
    .skip(skip)
    .limit(limit)
    .toArray();

  return { listings: listings as Listing[], total, page, limit, totalPages };
}

export async function getAdminListings(
  params: AdminListingsParams
): Promise<PaginatedListings> {
  const page = params.page ?? DEFAULT_PAGE;
  const limit = ADMIN_PAGE_SIZE;
  const query: Record<string, unknown> = {};

  if (params.status) query.status = params.status;
  if (params.listingType) query.listingType = params.listingType;
  if (params.category) query.category = { $in: [params.category] };
  if (params.propertyType)
    Object.assign(query, buildPropertyTypesQuery([params.propertyType]));

  const sortField = params.sortField ?? 'updatedAt';
  const sortDir: 1 | -1 = params.sortDirection === 'asc' ? 1 : -1;

  const collection = await getListingsCollection();
  const total = await collection.countDocuments(query);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const listings = await collection
    .find(query, { projection: { _id: 0 } })
    .sort({ [sortField]: sortDir })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();

  return { listings: listings as Listing[], total, page, limit, totalPages };
}

export async function getAllPublishedSlugs(): Promise<string[]> {
  const collection = await getListingsCollection();
  const filter: Record<string, unknown> = {
    status: buildPublicListingStatusQuery(),
  };
  const docs = await collection
    .find(filter, { projection: { slug: 1, _id: 0 } })
    .toArray();
  return docs.map((d) => d.slug as string);
}

export async function getSitemapListings(): Promise<SitemapListing[]> {
  const collection = await getListingsCollection();
  const filter: Record<string, unknown> = {
    status: buildPublicListingStatusQuery(),
  };
  const docs = await collection
    .find(filter, {
      projection: {
        slug: 1,
        title: 1,
        description: 1,
        images: 1,
        videos: 1,
        publishedAt: 1,
        updatedAt: 1,
        _id: 0,
      },
    })
    .sort({ slug: 1 })
    .toArray();
  return docs as SitemapListing[];
}
