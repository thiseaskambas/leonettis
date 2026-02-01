import '../globals.css';

import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';

import { routing } from '@/i18n/routing';

import { NavBar } from '../ui/NavBar';

const inter = Inter({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
});

function isValidLocale(
  locale: unknown
): locale is (typeof routing.locales)[number] {
  return routing.locales.includes(locale as (typeof routing.locales)[number]);
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            themes={['light', 'dark']}
            storageKey="theme">
            <NavBar />
            <main>{children}</main>
            <footer>
              <p>Copyright 2026 Leonetti&apos;s</p>
            </footer>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
