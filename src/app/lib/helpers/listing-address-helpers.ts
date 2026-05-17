import type { Address } from '@/app/lib/definitions/listing.types';

export function formatPublicAddress(address: Address): string {
  return [address.city, address.region, address.state]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ');
}
