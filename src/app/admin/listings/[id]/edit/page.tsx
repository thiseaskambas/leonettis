import { notFound } from 'next/navigation';

import ListingForm from '@/app/admin/components/ListingForm';
import { getListingsCollection } from '@/app/lib/db/mongodb';

export const dynamic = 'force-dynamic';

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = await getListingsCollection();
  const listing = await collection.findOne({ id }, { projection: { _id: 0 } });

  if (!listing) {
    notFound();
  }

  return <ListingForm mode="edit" initialListing={listing} />;
}
