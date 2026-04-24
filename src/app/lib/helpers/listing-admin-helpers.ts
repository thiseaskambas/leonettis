import type { Listing } from '@/app/lib/definitions/listing.types';
import { type Locale, locales } from '@/i18n/routing';

const allLocales = Object.keys(locales) as Locale[];

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function buildListingSlug(listing: Partial<Listing>): string {
  const titleEn = listing.title?.en ?? '';
  const slug = slugify(titleEn);
  if (slug) return slug;

  if (listing.slug?.trim()) return slugify(listing.slug);
  return `listing-${crypto.randomUUID()}`;
}

function sanitizeLocaleRecord(
  value: unknown
): Record<Locale, string> | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const result = {} as Record<Locale, string>;
  for (const locale of allLocales) {
    const item = (value as Record<string, unknown>)[locale];
    result[locale] = typeof item === 'string' ? item : '';
  }

  return result;
}

function sanitizeStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const values = value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);

  return values;
}

function sanitizeNumber(value: unknown): number | undefined {
  if (typeof value !== 'number') return undefined;
  if (Number.isNaN(value)) return undefined;
  return value;
}

function sanitizeBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function inferMediaNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split('/').filter(Boolean).at(-1);
    if (filename) return decodeURIComponent(filename);
  } catch {
    // Fallback to raw string parsing for non-URL values.
  }

  const fallback = url.split('/').filter(Boolean).at(-1);
  return fallback ? decodeURIComponent(fallback) : 'video';
}

function sanitizeVideoItem(
  item: unknown
): NonNullable<Listing['videos']>[number] | null {
  if (typeof item === 'string') {
    const url = item.trim();
    if (!url) return null;
    return {
      url,
      name: inferMediaNameFromUrl(url),
    };
  }

  if (!item || typeof item !== 'object') return null;
  const video = item as Record<string, unknown>;
  if (typeof video.url !== 'string') return null;
  const url = video.url.trim();
  if (!url) return null;

  const name =
    typeof video.name === 'string' && video.name.trim()
      ? video.name.trim()
      : inferMediaNameFromUrl(url);

  return {
    url,
    name,
    key:
      typeof video.key === 'string' && video.key.trim()
        ? video.key.trim()
        : undefined,
    description:
      typeof video.description === 'string' ? video.description : undefined,
    contentType:
      typeof video.contentType === 'string' ? video.contentType : undefined,
  };
}

export function sanitizeListingInput(payload: unknown): Partial<Listing> {
  const data = payload && typeof payload === 'object' ? payload : {};
  const raw = data as Record<string, unknown>;

  const title = sanitizeLocaleRecord(raw.title);
  const description = sanitizeLocaleRecord(raw.description);

  const listing: Partial<Listing> = {
    id: typeof raw.id === 'string' ? raw.id : undefined,
    title,
    description,
    slug: typeof raw.slug === 'string' ? raw.slug : undefined,
    listingType:
      raw.listingType === 'buy' || raw.listingType === 'rent'
        ? raw.listingType
        : undefined,
    category: sanitizeStringArray(raw.category) as Listing['category'],
    propertyType:
      typeof raw.propertyType === 'string'
        ? (raw.propertyType as Listing['propertyType'])
        : undefined,
    price: sanitizeNumber(raw.price),
    bedrooms: sanitizeNumber(raw.bedrooms),
    bathrooms: sanitizeNumber(raw.bathrooms),
    squareMetersInterior: sanitizeNumber(raw.squareMetersInterior),
    squareMetersOutdoor: sanitizeNumber(raw.squareMetersOutdoor),
    squareMetersTotal: sanitizeNumber(raw.squareMetersTotal),
    mainImage: typeof raw.mainImage === 'string' ? raw.mainImage : undefined,
    videos: Array.isArray(raw.videos)
      ? (raw.videos
          .map((item) => sanitizeVideoItem(item))
          .filter(Boolean) as Listing['videos'])
      : undefined,
    features: sanitizeStringArray(raw.features) as Listing['features'],
    furnishing:
      typeof raw.furnishing === 'string'
        ? (raw.furnishing as Listing['furnishing'])
        : undefined,
    amenities: sanitizeStringArray(raw.amenities) as Listing['amenities'],
    suitableFor: sanitizeStringArray(raw.suitableFor) as Listing['suitableFor'],
    view: sanitizeStringArray(raw.view) as Listing['view'],
    isFeatured: sanitizeBoolean(raw.isFeatured),
    isActive: sanitizeBoolean(raw.isActive),
    isSold: sanitizeBoolean(raw.isSold),
    isRented: sanitizeBoolean(raw.isRented),
    tags: sanitizeStringArray(raw.tags),
    favorite: sanitizeBoolean(raw.favorite),
    urgent: sanitizeBoolean(raw.urgent),
    condition:
      typeof raw.condition === 'string'
        ? (raw.condition as Listing['condition'])
        : undefined,
    yearBuilt: sanitizeNumber(raw.yearBuilt),
    energyRating:
      typeof raw.energyRating === 'string'
        ? (raw.energyRating as Listing['energyRating'])
        : undefined,
    yearRenovated: sanitizeNumber(raw.yearRenovated),
    availableNow: sanitizeBoolean(raw.availableNow),
    availableUponRequest: sanitizeBoolean(raw.availableUponRequest),
    availableFrom:
      typeof raw.availableFrom === 'string' ? raw.availableFrom : undefined,
    availableTo:
      typeof raw.availableTo === 'string' ? raw.availableTo : undefined,
    leaseDuration: sanitizeNumber(raw.leaseDuration),
    leaseDurationUnit:
      raw.leaseDurationUnit === 'month' || raw.leaseDurationUnit === 'year'
        ? raw.leaseDurationUnit
        : undefined,
    leaseDurationType:
      raw.leaseDurationType === 'fixed' || raw.leaseDurationType === 'flexible'
        ? raw.leaseDurationType
        : undefined,
    images: Array.isArray(raw.images)
      ? (raw.images
          .map((item) => {
            if (!item || typeof item !== 'object') return null;
            const image = item as Record<string, unknown>;
            if (
              typeof image.url !== 'string' ||
              typeof image.name !== 'string'
            ) {
              return null;
            }

            return {
              url: image.url,
              name: image.name,
              key:
                typeof image.key === 'string' && image.key.trim()
                  ? image.key.trim()
                  : undefined,
              description:
                typeof image.description === 'string'
                  ? image.description
                  : undefined,
            };
          })
          .filter(Boolean) as Listing['images'])
      : undefined,
  };

  const rawAddress = raw.address;
  if (rawAddress && typeof rawAddress === 'object') {
    const address = rawAddress as Record<string, unknown>;
    const coordinates =
      address.coordinates && typeof address.coordinates === 'object'
        ? (address.coordinates as Record<string, unknown>)
        : {};

    listing.address = {
      streetNumber:
        typeof address.streetNumber === 'string'
          ? address.streetNumber
          : undefined,
      streetName:
        typeof address.streetName === 'string' ? address.streetName : '',
      city: typeof address.city === 'string' ? address.city : '',
      state: typeof address.state === 'string' ? address.state : undefined,
      region: typeof address.region === 'string' ? address.region : undefined,
      zipCode: typeof address.zipCode === 'string' ? address.zipCode : '',
      country: typeof address.country === 'string' ? address.country : '',
      displayAddress:
        typeof address.displayAddress === 'string'
          ? address.displayAddress
          : undefined,
      coordinates: {
        lat: sanitizeNumber(coordinates.lat) ?? 0,
        lng: sanitizeNumber(coordinates.lng) ?? 0,
      },
    };
  }

  return listing;
}
