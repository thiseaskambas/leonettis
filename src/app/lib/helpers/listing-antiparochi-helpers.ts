import type {
  AntiparochiOption,
  Listing,
  PropertyType,
} from '@/app/lib/definitions/listing.types';

export const ANTIPAROCHI_PROPERTY_TYPES: PropertyType[] = [
  'land',
  'field',
  'building',
  'house',
];

const ANTIPAROCHI_OPTIONS = new Set<AntiparochiOption>(['only', 'negotiable']);

export function supportsAntiparochi(
  listingType: Listing['listingType'],
  propertyType: PropertyType
): boolean {
  return (
    listingType === 'buy' && ANTIPAROCHI_PROPERTY_TYPES.includes(propertyType)
  );
}

export function sanitizeAntiparochi(value: unknown): AntiparochiOption | null {
  if (value === 'only' || value === 'negotiable') return value;
  return null;
}

export function isAntiparochiOption(
  value: unknown
): value is AntiparochiOption {
  return (
    typeof value === 'string' &&
    ANTIPAROCHI_OPTIONS.has(value as AntiparochiOption)
  );
}
