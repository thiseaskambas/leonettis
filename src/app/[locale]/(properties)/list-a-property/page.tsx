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
  const t = await getTranslations({ locale, namespace: 'list-a-property' });
  const title = t('title');
  const description = t('description');

  return {
    title,
    ...buildSharedMetadata({
      locale,
      path: '/list-a-property',
      title,
      description,
    }),
  };
}

export default function ListAProperty() {
  return (
    <main className="dark:bg-tiff-gray-950 min-h-screen p-5 pt-40 md:p-10 md:pt-40">
      <h1>List a Property</h1>
    </main>
  );
}
