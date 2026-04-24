import { notFound } from 'next/navigation';

import ListingForm from '@/app/admin/components/ListingForm';
import { getListingsCollection } from '@/app/lib/db/mongodb';

export const dynamic = 'force-dynamic';

export default async function EditListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mediaUpload?: string }>;
}) {
  const { id } = await params;
  const { mediaUpload } = await searchParams;
  const collection = await getListingsCollection();
  const listing = await collection.findOne({ id }, { projection: { _id: 0 } });

  if (!listing) {
    notFound();
  }

  return (
    <ListingForm
      mode="edit"
      initialListing={listing}
      initialMediaUploadWarning={mediaUpload === 'failed'}
    />
  );
}
