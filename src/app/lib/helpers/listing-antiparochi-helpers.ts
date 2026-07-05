import type {
  AntiparochiOption,
  Listing,
  PropertyType,
} from '@/app/lib/definitions/listing.types';

type LegacyAntiparochiOption = 'only' | 'negotiable';
type SupportedAntiparochiOption = AntiparochiOption | LegacyAntiparochiOption;

export const ANTIPAROCHI_PROPERTY_TYPES: PropertyType[] = [
  'land',
  'field',
  'building',
  'house',
];

export const ANTIPAROCHI_OPTION: AntiparochiOption = 'accepted';

export const ANTIPAROCHI_ACCEPTED_VALUES: SupportedAntiparochiOption[] = [
  ANTIPAROCHI_OPTION,
  'only',
  'negotiable',
];

const ANTIPAROCHI_OPTIONS = new Set<SupportedAntiparochiOption>(
  ANTIPAROCHI_ACCEPTED_VALUES
);

export function supportsAntiparochi(
  listingType: Listing['listingType'],
  propertyType: PropertyType
): boolean {
  return (
    listingType === 'buy' && ANTIPAROCHI_PROPERTY_TYPES.includes(propertyType)
  );
}

export function sanitizeAntiparochi(value: unknown): AntiparochiOption | null {
  if (isAntiparochiOption(value)) return ANTIPAROCHI_OPTION;
  return null;
}

export function isAntiparochiOption(
  value: unknown
): value is SupportedAntiparochiOption {
  return (
    typeof value === 'string' &&
    ANTIPAROCHI_OPTIONS.has(value as SupportedAntiparochiOption)
  );
}

export function normalizeAntiparochiSearchValues(
  values: string[] | undefined
): AntiparochiOption[] | undefined {
  if (!values?.some(isAntiparochiOption)) return undefined;
  return [ANTIPAROCHI_OPTION];
}

export function getAntiparochiQueryValues(
  values: string[] | undefined
): string[] {
  if (!normalizeAntiparochiSearchValues(values)) return [];
  return [...ANTIPAROCHI_ACCEPTED_VALUES];
}
