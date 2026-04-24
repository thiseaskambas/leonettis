'use client';

import { useRouter } from 'next/navigation';

export default function DeleteListingButton({ id }: { id: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Delete this listing?')) return;

    const response = await fetch(`/api/admin/listings/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      alert('Failed to delete listing');
      return;
    }

    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="rounded border border-red-300 px-2 py-1 text-red-600 hover:bg-red-50">
      Delete
    </button>
  );
}
