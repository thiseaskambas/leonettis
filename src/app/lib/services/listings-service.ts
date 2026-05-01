import { getListingsCollection } from '../db/mongodb';
import { Listing } from '../definitions/listing.types';
import { ListingSearchParams } from '../helpers/listing-search-params';

export interface PaginatedListings {
  listings: Listing[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export async function searchListings(
  params: ListingSearchParams
): Promise<PaginatedListings> {
  const page = params.page ?? DEFAULT_PAGE;
  const limit = params.limit ?? DEFAULT_LIMIT;
  const query: Record<string, unknown> = {
    listingType: params.listingType,
    status: { $exists: true, $ne: null },
  };

  if (params.category?.length) query.category = { $in: params.category };
  if (params.propertyType?.length)
    query.propertyType = { $in: params.propertyType };
  if (params.condition?.length) query.condition = { $in: params.condition };
  if (params.furnishing?.length) query.furnishing = { $in: params.furnishing };
  if (params.energyRating?.length)
    query.energyRating = { $in: params.energyRating };
  if (params.viewType?.length) query.view = { $in: params.viewType };
  if (params.features?.length) query.features = { $in: params.features };
  if (params.amenities?.length) query.amenities = { $in: params.amenities };
  if (params.suitableFor?.length)
    query.suitableFor = { $in: params.suitableFor };

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
