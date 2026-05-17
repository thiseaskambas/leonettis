import { Suspense } from 'react';

import { getAdminListings } from '@/app/lib/services/listings-service';

import { parseAdminParams } from './admin-params';
import AdminListingsClient from './components/AdminListingsClient';
import AdminPagination from './components/AdminPagination';

export const dynamic = 'force-dynamic';

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const raw = await searchParams;
  const params = parseAdminParams(raw);
  const { listings, total, page, totalPages } = await getAdminListings(params);

  return (
    <>
      <AdminListingsClient
        listings={listings}
        total={total}
        page={page}
        totalPages={totalPages}
      />
      <div className="mt-4">
        <Suspense fallback={null}>
          <AdminPagination currentPage={page} totalPages={totalPages} />
        </Suspense>
      </div>
    </>
  );
}
