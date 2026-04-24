import Link from 'next/link';

import AdminLogoutButton from './components/AdminLogoutButton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        <header className="border-b border-gray-200">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/admin" className="text-lg font-semibold">
              Leonettis Admin
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">
                Listings
              </Link>
              <AdminLogoutButton />
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
