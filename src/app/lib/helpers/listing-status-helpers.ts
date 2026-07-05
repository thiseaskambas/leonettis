import type { ListingStatus } from '@/app/lib/definitions/listing.types';

export const LISTING_STATUS_VALUES = [
  'active',
  'sold',
  'rented',
  'pending',
  'under_offer',
  'paused',
] as const satisfies readonly ListingStatus[];

const HIDDEN_PUBLIC_LISTING_STATUSES = [
  'paused',
] as const satisfies readonly ListingStatus[];

export function isListingStatus(value: unknown): value is ListingStatus {
  return (
    typeof value === 'string' &&
    (LISTING_STATUS_VALUES as readonly string[]).includes(value)
  );
}

export function buildPublicListingStatusQuery(): Record<string, unknown> {
  return {
    $exists: true,
    $nin: [null, ...HIDDEN_PUBLIC_LISTING_STATUSES],
  };
}

export function isPublicListingStatus(
  status: ListingStatus | null | undefined
): status is Exclude<ListingStatus, 'paused'> {
  return (
    status != null &&
    !(HIDDEN_PUBLIC_LISTING_STATUSES as readonly string[]).includes(status)
  );
}
