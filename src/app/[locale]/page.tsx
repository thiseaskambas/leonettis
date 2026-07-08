import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { buildSharedMetadata } from '@/app/lib/helpers/metadata-helpers';
import { isValidLocale } from '@/i18n/routing';

import HomeClient from './components/HomeClient';

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
    title,
    ...buildSharedMetadata({
      locale,
      path: '',
      title,
      description,
    }),
  };
}

export default function Home() {
  return <HomeClient />;
}
