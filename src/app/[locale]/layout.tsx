// src/app/[locale]/layout.tsx
import '../globals.css'; // Import global styles here since this will be the root layout

import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';

import { routing } from '@/i18n/routing';

import NavigationLink from '../ui/NavigationLink';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Await params (required in Next.js 15+)
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Get messages for the provider
  const messages = await getMessages();
  const t = await getTranslations('nav');

  return (
    <html lang={locale}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <nav>
            <NavigationLink href="/">{t('home')}</NavigationLink>
            <NavigationLink href="/about">{t('about')}</NavigationLink>
            <NavigationLink href="/buy">{t('buy')}</NavigationLink>
            <NavigationLink href="/rent">{t('rent')}</NavigationLink>
            <NavigationLink href="/sell">{t('sell')}</NavigationLink>
            <NavigationLink href="/blog">{t('blog')}</NavigationLink>
            <NavigationLink href="/contact">{t('contact')}</NavigationLink>
          </nav>
          <main>{children}</main>
          <footer>
            <p>Copyright 2026 Leonetti&apos;s</p>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
