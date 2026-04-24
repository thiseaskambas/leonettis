import Link from 'next/link';

import { getListingsCollection } from '@/app/lib/db/mongodb';

import DeleteListingButton from './components/DeleteListingButton';

export const dynamic = 'force-dynamic';

export default async function AdminListingsPage() {
  const collection = await getListingsCollection();
  const listings = await collection
    .find({}, { projection: { _id: 0 } })
    .sort({ updatedAt: -1 })
    .toArray();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Listings</h1>
        <Link
          href="/admin/listings/new"
          className="rounded bg-black px-4 py-2 text-sm text-white">
          New Listing
        </Link>
      </div>
      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2">Title (en)</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing.id} className="border-t border-gray-200">
                <td className="px-3 py-2">{listing.title.en}</td>
                <td className="px-3 py-2">{listing.listingType}</td>
                <td className="px-3 py-2">{listing.category.join(', ')}</td>
                <td className="px-3 py-2">
                  {listing.price != null ? `€${listing.price}` : 'N/A'}
                </td>
                <td className="px-3 py-2">
                  {listing.isSold
                    ? 'sold'
                    : listing.isFeatured
                      ? 'featured'
                      : listing.isActive
                        ? 'active'
                        : 'inactive'}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/listings/${listing.id}/edit`}
                      className="rounded border border-gray-300 px-2 py-1 hover:bg-gray-50">
                      Edit
                    </Link>
                    <DeleteListingButton id={listing.id} />
                  </div>
                </td>
              </tr>
            ))}
            {listings.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-gray-500" colSpan={6}>
                  No listings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
