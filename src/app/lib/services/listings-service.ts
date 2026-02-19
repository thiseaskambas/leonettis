import { Listing } from '../definitions/listing.types';
import { listingsData } from '../mock-data/listings-data';

export interface ListingSearchParams {
  listingType: 'buy' | 'rent';
  category?: string[];
  propertyType?: string[];
  condition?: string[];
  furnishing?: string[];
  energyRating?: string[];
  viewType?: string[];
  features?: string[];
  amenities?: string[];
  suitableFor?: string[];
  page?: number;
  limit?: number;
}

export interface PaginatedListings {
  listings: Listing[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

function toArray(v: string | string[] | undefined): string[] | undefined {
  if (!v) return undefined;
  return Array.isArray(v) ? v : [v];
}

export function parseSearchParams(
  raw: Record<string, string | string[] | undefined>
): ListingSearchParams {
  return {
    listingType: (raw.listingType as 'buy' | 'rent') ?? 'buy',
    category: toArray(raw.category),
    propertyType: toArray(raw.propertyType),
    condition: toArray(raw.condition),
    furnishing: toArray(raw.furnishing),
    energyRating: toArray(raw.energyRating),
    viewType: toArray(raw.viewType),
    features: toArray(raw.features),
    amenities: toArray(raw.amenities),
    suitableFor: toArray(raw.suitableFor),
    page: raw.page ? Number(raw.page) : undefined,
    limit: raw.limit ? Number(raw.limit) : undefined,
  };
}

/**
 * Search and filter listings. Currently uses local mock data;
 * swap this implementation with an API call later.
 */
export async function searchListings(
  params: ListingSearchParams
): Promise<PaginatedListings> {
  let results: Listing[] = listingsData.filter(
    (l) => l.listingType === params.listingType
  );

  if (params.category?.length) {
    results = results.filter((l) => params.category!.includes(l.category));
  }

  if (params.propertyType?.length) {
    results = results.filter((l) =>
      params.propertyType!.includes(l.propertyType)
    );
  }

  if (params.condition?.length) {
    results = results.filter(
      (l) => l.condition && params.condition!.includes(l.condition)
    );
  }

  if (params.furnishing?.length) {
    results = results.filter(
      (l) => l.furnishing && params.furnishing!.includes(l.furnishing)
    );
  }

  if (params.energyRating?.length) {
    results = results.filter(
      (l) => l.energyRating && params.energyRating!.includes(l.energyRating)
    );
  }

  if (params.viewType?.length) {
    results = results.filter((l) =>
      l.view?.some((v) => params.viewType!.includes(v))
    );
  }

  if (params.features?.length) {
    results = results.filter((l) =>
      l.features?.some((f) => params.features!.includes(f))
    );
  }

  if (params.amenities?.length) {
    results = results.filter((l) =>
      l.amenities?.some((a) => params.amenities!.includes(a))
    );
  }

  if (params.suitableFor?.length) {
    results = results.filter((l) =>
      l.suitableFor?.some((s) => params.suitableFor!.includes(s))
    );
  }

  const page = params.page ?? DEFAULT_PAGE;
  const limit = params.limit ?? DEFAULT_LIMIT;
  const total = results.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const paged = results.slice(start, start + limit);

  return { listings: paged, total, page, limit, totalPages };
}
