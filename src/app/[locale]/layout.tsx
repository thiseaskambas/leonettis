import { getTranslations } from 'next-intl/server';

import NavigationLink from '../ui/NavigationLink';

// app/[locale]/layout.tsx
export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const t = await getTranslations('nav');

  return (
    <>
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
    </>
  );
}
