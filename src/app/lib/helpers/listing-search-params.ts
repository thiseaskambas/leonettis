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
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

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
    minPrice: raw.minPrice ? Number(raw.minPrice) : undefined,
    maxPrice: raw.maxPrice ? Number(raw.maxPrice) : undefined,
    page: raw.page ? Number(raw.page) : undefined,
    limit: raw.limit ? Number(raw.limit) : undefined,
  };
}
