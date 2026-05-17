import type { Address } from '@/app/lib/definitions/listing.types';

export function resolveAddressCoordinates(
  coordinates?: Address['coordinates']
): { lat: number; lng: number } {
  return {
    lat: coordinates?.lat ?? 0,
    lng: coordinates?.lng ?? 0,
  };
}

export function formatPublicAddress(address: Address): string {
  return [address.city, address.region, address.state]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ');
}
