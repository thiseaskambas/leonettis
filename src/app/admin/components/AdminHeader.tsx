'use client';

import Link from 'next/link';

import { useAdminLang, useAdminT } from '@/app/admin/lib/admin-lang-context';

import AdminLogoutButton from './AdminLogoutButton';

export default function AdminHeader() {
  const { lang, toggle } = useAdminLang();
  const t = useAdminT();

  return (
    <header className="border-b border-gray-200">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/admin" className="text-lg font-semibold">
          Leonettis Admin
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">
            {t.layout.navListings}
          </Link>
          <button
            type="button"
            onClick={toggle}
            className="flex items-center gap-1 rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
            aria-label="Toggle language">
            <span className={lang === 'en' ? 'font-semibold' : 'text-gray-400'}>
              EN
            </span>
            <span className="text-gray-300">|</span>
            <span className={lang === 'gr' ? 'font-semibold' : 'text-gray-400'}>
              GR
            </span>
          </button>
          <AdminLogoutButton />
        </div>
      </nav>
    </header>
  );
}
