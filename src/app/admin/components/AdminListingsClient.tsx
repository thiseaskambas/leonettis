'use client';

import Link from 'next/link';
import { Suspense } from 'react';

import { useAdminT } from '@/app/admin/lib/admin-lang-context';
import { labelFor } from '@/app/admin/lib/admin-translations';
import type { Listing } from '@/app/lib/definitions/listing.types';

import {
  getListingCategoryLabel,
  getListingTitleEn,
} from '../listing-row-utils';
import AdminFiltersBar from './AdminFiltersBar';
import DeleteListingButton from './DeleteListingButton';

type ListingStatusKey =
  | 'sold'
  | 'rented'
  | 'pending'
  | 'under_offer'
  | 'paused'
  | 'featured'
  | 'active'
  | 'inactive';

function getListingStatusKey(listing: {
  status?: Listing['status'];
  isFeatured?: boolean;
}): { key: ListingStatusKey; className: string } {
  if (listing.status === 'sold') {
    return { key: 'sold', className: 'bg-red-100 text-red-700' };
  }
  if (listing.status === 'rented') {
    return { key: 'rented', className: 'bg-orange-100 text-orange-700' };
  }
  if (listing.status === 'pending') {
    return { key: 'pending', className: 'bg-amber-100 text-amber-700' };
  }
  if (listing.status === 'under_offer') {
    return { key: 'under_offer', className: 'bg-purple-100 text-purple-700' };
  }
  if (listing.status === 'paused') {
    return { key: 'paused', className: 'bg-slate-100 text-slate-700' };
  }
  if (listing.isFeatured) {
    return { key: 'featured', className: 'bg-blue-100 text-blue-700' };
  }
  if (listing.status === 'active') {
    return { key: 'active', className: 'bg-green-100 text-green-700' };
  }
  return { key: 'inactive', className: 'bg-gray-100 text-gray-500' };
}

function displayTitle(listing: { title?: unknown }, untitled: string): string {
  const raw = getListingTitleEn(listing);
  return raw === 'Untitled listing' ? untitled : raw;
}

function displayCategory(
  listing: { category?: unknown },
  na: string,
  categories: Record<string, string>
): string {
  const raw = getListingCategoryLabel(listing);
  if (raw === 'N/A') return na;
  return raw
    .split(', ')
    .map((part) => labelFor(categories, part.trim()))
    .join(', ');
}

export default function AdminListingsClient({
  listings,
  total,
}: {
  listings: Listing[];
  total: number;
  page: number;
  totalPages: number;
}) {
  const t = useAdminT();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {t.listings.heading}
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({total} {t.listings.total})
          </span>
        </h1>
        <Link
          href="/admin/listings/new"
          className="rounded bg-black px-4 py-2 text-sm text-white">
          {t.listings.newListing}
        </Link>
      </div>

      <div className="mb-4">
        <Suspense fallback={<div className="h-9" />}>
          <AdminFiltersBar />
        </Suspense>
      </div>

      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="w-12 px-3 py-2">{t.listings.colImage}</th>
              <th className="px-3 py-2">{t.listings.colTitle}</th>
              <th className="px-3 py-2">{t.listings.colType}</th>
              <th className="px-3 py-2">{t.listings.colCategory}</th>
              <th className="px-3 py-2">{t.listings.colPrice}</th>
              <th className="px-3 py-2">{t.listings.colStatus}</th>
              <th className="px-3 py-2">{t.listings.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => {
              const status = getListingStatusKey(listing);
              const titleEn = displayTitle(listing, t.listings.untitled);
              const categoryLabel = displayCategory(
                listing,
                t.listings.na,
                t.filters.categories
              );
              const listingTypeLabel = labelFor(
                t.filters.listingTypes,
                listing.listingType
              );
              const thumbnailImage =
                Array.isArray(listing.images) &&
                listing.images.length > 0 &&
                typeof listing.images[0] === 'object' &&
                listing.images[0] !== null &&
                'url' in listing.images[0] &&
                typeof listing.images[0].url === 'string'
                  ? listing.images[0].url
                  : undefined;

              return (
                <tr
                  key={listing.id}
                  className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-3 py-2">
                    {thumbnailImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumbnailImage}
                        alt={titleEn}
                        className="h-8 w-8 rounded object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded bg-gray-100" />
                    )}
                  </td>
                  <td className="px-3 py-2">{titleEn}</td>
                  <td className="px-3 py-2">{listingTypeLabel}</td>
                  <td className="px-3 py-2">{categoryLabel}</td>
                  <td className="px-3 py-2">
                    {listing.price != null
                      ? `€${listing.price}`
                      : t.listings.na}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
                      {t.listings.status[status.key]}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/listings/${listing.id}/edit`}
                        className="rounded border border-gray-300 px-2 py-1 hover:bg-gray-50">
                        {t.listings.edit}
                      </Link>
                      <DeleteListingButton id={listing.id} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {listings.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-gray-500" colSpan={7}>
                  {t.listings.noListings}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
