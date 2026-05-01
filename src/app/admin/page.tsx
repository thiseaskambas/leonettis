import Link from 'next/link';

import { getListingsCollection } from '@/app/lib/db/mongodb';

import DeleteListingButton from './components/DeleteListingButton';

export const dynamic = 'force-dynamic';

function getListingStatus(listing: {
  status?: 'active' | 'sold' | 'rented' | 'pending' | 'under_offer';
  isFeatured?: boolean;
}) {
  if (listing.status === 'sold') {
    return { label: 'sold', className: 'bg-red-100 text-red-700' };
  }

  if (listing.status === 'rented') {
    return { label: 'rented', className: 'bg-orange-100 text-orange-700' };
  }

  if (listing.status === 'pending') {
    return { label: 'pending', className: 'bg-amber-100 text-amber-700' };
  }

  if (listing.status === 'under_offer') {
    return { label: 'under offer', className: 'bg-purple-100 text-purple-700' };
  }

  if (listing.isFeatured) {
    return { label: 'featured', className: 'bg-blue-100 text-blue-700' };
  }

  if (listing.status === 'active') {
    return { label: 'active', className: 'bg-green-100 text-green-700' };
  }

  return { label: 'inactive', className: 'bg-gray-100 text-gray-500' };
}

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
              <th className="w-12 px-3 py-2">Image</th>
              <th className="px-3 py-2">Title (en)</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => {
              const status = getListingStatus(listing);
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
                        alt={listing.title.en}
                        className="h-8 w-8 rounded object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded bg-gray-100" />
                    )}
                  </td>
                  <td className="px-3 py-2">{listing.title.en}</td>
                  <td className="px-3 py-2">{listing.listingType}</td>
                  <td className="px-3 py-2">{listing.category.join(', ')}</td>
                  <td className="px-3 py-2">
                    {listing.price != null ? `€${listing.price}` : 'N/A'}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
                      {status.label}
                    </span>
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
              );
            })}
            {listings.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-gray-500" colSpan={7}>
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
