/**
 * URL query keys for `/admin` listings:
 * - `status`, `listingType`, `category`, `propertyType` — filters
 * - `page` — 1-based page index
 * - `sort` — AdminSortField (`updatedAt`, `publishedAt`, `price`, `title.en`)
 * - `dir` — `asc` | `desc`
 */

import type {
  ListingCategory,
  ListingStatus,
  PropertyType,
} from '@/app/lib/definitions/listing.types';
import type {
  AdminListingsParams,
  AdminSortDirection,
  AdminSortField,
} from '@/app/lib/services/listings-service';

export const LISTING_STATUSES = [
  'active',
  'sold',
  'rented',
  'pending',
  'under_offer',
] as const satisfies readonly ListingStatus[];

export const LISTING_TYPES = ['buy', 'rent'] as const satisfies readonly (
  | 'buy'
  | 'rent'
)[];

export const LISTING_CATEGORIES = [
  'commercial',
  'residential',
  'industrial',
  'agricultural',
] as const satisfies readonly ListingCategory[];

export const PROPERTY_TYPES = [
  'apartment',
  'field',
  'house',
  'land',
  'business',
  'garage',
  'building',
  'office',
  'warehouse',
] as const satisfies readonly PropertyType[];

const ADMIN_SORT_FIELDS = [
  'updatedAt',
  'publishedAt',
  'price',
  'title.en',
] as const satisfies readonly AdminSortField[];

export const SORT_OPTIONS: ReadonlyArray<{
  value: string;
  label: string;
}> = [
  { value: 'updatedAt_desc', label: 'Updated (newest first)' },
  { value: 'updatedAt_asc', label: 'Updated (oldest first)' },
  { value: 'publishedAt_desc', label: 'Published (newest first)' },
  { value: 'publishedAt_asc', label: 'Published (oldest first)' },
  { value: 'price_desc', label: 'Price (high to low)' },
  { value: 'price_asc', label: 'Price (low to high)' },
  { value: 'title.en_asc', label: 'Title A–Z' },
  { value: 'title.en_desc', label: 'Title Z–A' },
] as const;

export function isListingStatus(v: unknown): v is ListingStatus {
  return (
    typeof v === 'string' &&
    (LISTING_STATUSES as readonly string[]).includes(v)
  );
}

export function isListingType(v: unknown): v is 'buy' | 'rent' {
  return v === 'buy' || v === 'rent';
}

export function isListingCategory(v: unknown): v is ListingCategory {
  return (
    typeof v === 'string' &&
    (LISTING_CATEGORIES as readonly string[]).includes(v)
  );
}

export function isPropertyType(v: unknown): v is PropertyType {
  return (
    typeof v === 'string' &&
    (PROPERTY_TYPES as readonly string[]).includes(v)
  );
}

export function isAdminSortField(v: unknown): v is AdminSortField {
  return (
    typeof v === 'string' &&
    (ADMIN_SORT_FIELDS as readonly string[]).includes(v)
  );
}

export function isAdminSortDir(v: unknown): v is AdminSortDirection {
  return v === 'asc' || v === 'desc';
}

/**
 * Parses combined sort `<select>` values. Uses the last `_` so `title.en_desc`
 * splits into field `title.en` and direction `desc`.
 */
export function splitSortOptionValue(
  value: string
): { field: AdminSortField; dir: AdminSortDirection } | null {
  const i = value.lastIndexOf('_');
  if (i <= 0 || i >= value.length - 1) return null;
  const field = value.slice(0, i);
  const dir = value.slice(i + 1);
  if (!isAdminSortField(field) || !isAdminSortDir(dir)) return null;
  return { field, dir };
}

export function currentSortSelectValue(
  sort: string | null,
  dir: string | null
): string {
  const field = sort && isAdminSortField(sort) ? sort : 'updatedAt';
  const d = dir && isAdminSortDir(dir) ? dir : 'desc';
  return `${field}_${d}`;
}

export function parseAdminParams(
  raw: Record<string, string | undefined>
): AdminListingsParams {
  const out: AdminListingsParams = {};

  const status = raw.status;
  if (status && isListingStatus(status)) out.status = status;

  const listingType = raw.listingType;
  if (listingType && isListingType(listingType)) {
    out.listingType = listingType;
  }

  const category = raw.category;
  if (category && isListingCategory(category)) out.category = category;

  const propertyType = raw.propertyType;
  if (propertyType && isPropertyType(propertyType)) {
    out.propertyType = propertyType;
  }

  const pageRaw = raw.page;
  if (pageRaw != null && pageRaw !== '') {
    const n = Number.parseInt(pageRaw, 10);
    if (Number.isFinite(n) && n >= 1) out.page = n;
  }

  const sort = raw.sort;
  if (sort && isAdminSortField(sort)) out.sortField = sort;

  const dir = raw.dir;
  if (dir && isAdminSortDir(dir)) out.sortDirection = dir;

  return out;
}

export function hasActiveFilterParams(
  params: URLSearchParams | Record<string, string | undefined>
): boolean {
  const get = (k: string) =>
    params instanceof URLSearchParams ? params.get(k) : params[k];

  return Boolean(
    get('status') ||
      get('listingType') ||
      get('category') ||
      get('propertyType')
  );
}
