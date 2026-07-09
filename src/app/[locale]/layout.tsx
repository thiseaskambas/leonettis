import '../globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from 'next-intl/server';
import { ThemeProvider } from 'next-themes';

import { buildSharedMetadata } from '@/app/lib/helpers/metadata-helpers';
import { getLocaleLanguageTag, isValidLocale } from '@/i18n/routing';

import GlassSVG from '../ui/GlassSVG';
import { NavBar } from '../ui/NavBar';

const inter = Inter({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const title = t('title.default');
  const description = t('description.default');

  return {
    title: {
      default: title,
      template: t('title.template'),
    },
    ...buildSharedMetadata({
      locale,
      title,
      description,
    }),
  };
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
    <html
      lang={getLocaleLanguageTag(locale)}
      className={inter.variable}
      suppressHydrationWarning>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            themes={['light', 'dark']}
            storageKey="theme">
            <NavBar />
            {children}
            <footer>
              <p>Copyright 2026 Leonetti&apos;s</p>
            </footer>
          </ThemeProvider>
        </NextIntlClientProvider>
        <GlassSVG />
      </body>
    </html>
  );
}
