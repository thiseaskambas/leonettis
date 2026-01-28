// src/app/[locale]/layout.tsx
import '../globals.css'; // Import global styles here since this will be the root layout

import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';

import { routing } from '@/i18n/routing';

import NavigationLink from '../ui/NavigationLink';
import ThemeSwitch from '../ui/ThemeSwitcher';

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
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  // Get messages for the provider
  const messages = await getMessages();
  const t = await getTranslations('nav');

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            themes={['light', 'dark']}
            storageKey="theme">
            <nav>
              <NavigationLink href="/">{t('home')}</NavigationLink>
              <NavigationLink href="/buy">{t('buy')}</NavigationLink>
              <NavigationLink href="/rent">{t('rent')}</NavigationLink>
              <NavigationLink href="/sell">{t('sell')}</NavigationLink>
              <NavigationLink href="/blog">{t('blog')}</NavigationLink>
              <NavigationLink href="/about">{t('about')}</NavigationLink>
              <NavigationLink href="/contact">{t('contact')}</NavigationLink>
              <ThemeSwitch />
            </nav>
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
