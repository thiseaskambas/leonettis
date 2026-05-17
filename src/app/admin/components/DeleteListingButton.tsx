'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAdminT } from '@/app/admin/lib/admin-lang-context';

export default function DeleteListingButton({ id }: { id: string }) {
  const router = useRouter();
  const t = useAdminT();
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    setError(null);
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/listings/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        setError(t.delete.failed);
        return;
      }

      router.refresh();
    } catch {
      setError(t.delete.failed);
    } finally {
      setIsDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <div>
      {confirming ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-700">{t.delete.confirm}</span>
          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="rounded border border-red-300 px-2 py-1 text-red-600 hover:bg-red-50 disabled:opacity-60">
            {isDeleting ? t.delete.deleting : t.delete.yes}
          </button>
          <button
            type="button"
            onClick={() => {
              setConfirming(false);
              setError(null);
            }}
            disabled={isDeleting}
            className="rounded border border-gray-300 px-2 py-1 text-gray-700 hover:bg-gray-50 disabled:opacity-60">
            {t.delete.cancel}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setError(null);
            setConfirming(true);
          }}
          className="rounded border border-red-300 px-2 py-1 text-red-600 hover:bg-red-50">
          {t.delete.delete}
        </button>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
