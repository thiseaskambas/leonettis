'use client';

import { Suspense } from 'react';

import ListingForm from '@/app/admin/components/ListingForm';

export default function NewListingPage() {
  return (
    <Suspense fallback={null}>
      <ListingForm mode="create" />
    </Suspense>
  );
}
