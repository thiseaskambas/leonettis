'use client';

import { useRouter } from 'next/navigation';

export default function AdminLogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.replace('/admin/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">
      Logout
    </button>
  );
}
