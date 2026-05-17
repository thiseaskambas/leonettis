import '../globals.css';

import AdminHeader from './components/AdminHeader';
import { AdminLangProvider } from './lib/admin-lang-context';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        <AdminLangProvider>
          <AdminHeader />
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </AdminLangProvider>
      </body>
    </html>
  );
}
