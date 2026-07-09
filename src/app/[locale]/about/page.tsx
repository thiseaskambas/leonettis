import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { buildSharedMetadata } from '@/app/lib/helpers/metadata-helpers';
import { isValidLocale } from '@/i18n/routing';

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
  const [metadataT, navT] = await Promise.all([
    getTranslations({ locale, namespace: 'metadata' }),
    getTranslations({ locale, namespace: 'nav' }),
  ]);
  const title = navT('about');
  const description = metadataT('description.default');

  return {
    title,
    ...buildSharedMetadata({
      locale,
      path: '/about',
      title,
      description,
    }),
  };
}

export default function About() {
  return (
    <main className="dark:bg-tiff-gray-950 min-h-screen p-5 pt-40 md:p-10 md:pt-40">
      <h1>About</h1>
    </main>
  );
}
