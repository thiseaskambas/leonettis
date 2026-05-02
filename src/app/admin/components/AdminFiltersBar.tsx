'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import {
  currentSortSelectValue,
  hasActiveFilterParams,
  LISTING_CATEGORIES,
  LISTING_STATUSES,
  LISTING_TYPES,
  PROPERTY_TYPES,
  SORT_OPTIONS,
  splitSortOptionValue,
} from '../admin-params';

const selectClass =
  'text-sm border border-gray-200 rounded px-2 py-1 bg-white text-gray-900';

export default function AdminFiltersBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    const q = next.toString();
    router.replace(q ? `/admin?${q}` : '/admin');
  }

  function clearFilters() {
    const next = new URLSearchParams(searchParams.toString());
    for (const k of [
      'status',
      'listingType',
      'category',
      'propertyType',
      'page',
    ]) {
      next.delete(k);
    }
    const q = next.toString();
    router.replace(q ? `/admin?${q}` : '/admin');
  }

  function onSortChange(value: string) {
    const parsed = splitSortOptionValue(value);
    if (!parsed) return;
    const next = new URLSearchParams(searchParams.toString());
    next.set('sort', parsed.field);
    next.set('dir', parsed.dir);
    next.delete('page');
    const q = next.toString();
    router.replace(q ? `/admin?${q}` : '/admin');
  }

  const showClear = hasActiveFilterParams(searchParams);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-1.5 text-sm text-gray-600">
        <span className="whitespace-nowrap">Status</span>
        <select
          className={selectClass}
          value={searchParams.get('status') ?? ''}
          onChange={(e) => update('status', e.target.value)}>
          <option value="">All</option>
          {LISTING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-1.5 text-sm text-gray-600">
        <span className="whitespace-nowrap">Listing type</span>
        <select
          className={selectClass}
          value={searchParams.get('listingType') ?? ''}
          onChange={(e) => update('listingType', e.target.value)}>
          <option value="">All</option>
          {LISTING_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-1.5 text-sm text-gray-600">
        <span className="whitespace-nowrap">Category</span>
        <select
          className={selectClass}
          value={searchParams.get('category') ?? ''}
          onChange={(e) => update('category', e.target.value)}>
          <option value="">All</option>
          {LISTING_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-1.5 text-sm text-gray-600">
        <span className="whitespace-nowrap">Property type</span>
        <select
          className={selectClass}
          value={searchParams.get('propertyType') ?? ''}
          onChange={(e) => update('propertyType', e.target.value)}>
          <option value="">All</option>
          {PROPERTY_TYPES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-1.5 text-sm text-gray-600">
        <span className="whitespace-nowrap">Sort</span>
        <select
          className={selectClass}
          value={currentSortSelectValue(
            searchParams.get('sort'),
            searchParams.get('dir')
          )}
          onChange={(e) => onSortChange(e.target.value)}>
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      {showClear && (
        <button
          type="button"
          className="text-sm text-gray-600 underline hover:text-gray-900"
          onClick={clearFilters}>
          Clear filters
        </button>
      )}
    </div>
  );
}
