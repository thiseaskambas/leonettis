import { getDictionary, Locale } from '../lib/dictionaries';
import LocalizedLink from '../ui/LocalizedLink';

// app/[locale]/layout.tsx
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return (
    <>
      <nav>
        <LocalizedLink href="/">{dict.nav.home}</LocalizedLink>
        <LocalizedLink href="/about">{dict.nav.about}</LocalizedLink>
        <LocalizedLink href="/buy">{dict.nav.buy}</LocalizedLink>
        <LocalizedLink href="/rent">{dict.nav.rent}</LocalizedLink>
        <LocalizedLink href="/sell">{dict.nav.sell}</LocalizedLink>
        <LocalizedLink href="/blog">{dict.nav.blog}</LocalizedLink>
        <LocalizedLink href="/contact">{dict.nav.contact}</LocalizedLink>
      </nav>
      <main>{children}</main>
      <footer>
        <p>Copyright 2026 Leonetti&apos;s</p>
      </footer>
    </>
  );
}
