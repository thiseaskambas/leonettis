import type {
  Listing,
  PropertyType,
} from '@/app/lib/definitions/listing.types';

type PropertyTypeFields = Pick<
  Partial<Listing>,
  'propertyType' | 'propertyTypes'
>;

export function normalizePropertyTypes(
  listing: PropertyTypeFields
): PropertyType[] {
  const propertyTypes = Array.isArray(listing.propertyTypes)
    ? listing.propertyTypes.filter(
        (value): value is PropertyType =>
          typeof value === 'string' && value.trim().length > 0
      )
    : [];

  if (propertyTypes.length === 0 && listing.propertyType) {
    propertyTypes.push(listing.propertyType);
  }

  return Array.from(new Set(propertyTypes));
}

export function getPrimaryPropertyType(
  listing: PropertyTypeFields,
  fallback?: PropertyType
): PropertyType | undefined {
  return normalizePropertyTypes(listing)[0] ?? listing.propertyType ?? fallback;
}
