import type { Metadata } from 'next';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';

import { LocalizedListing } from '@/app/lib/definitions/listing.types';
import { getLocalizedListing } from '@/app/lib/helpers/listing-helpers';
import { parseSearchParams } from '@/app/lib/helpers/listing-search-params';
import { searchListings } from '@/app/lib/services/listings-service';
import ListingCard from '@/app/ui/ListingCard';
import ListingsFilters from '@/app/ui/ListingsFilters';
import { isValidLocale, Locale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

interface BuyPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

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
  const t = await getTranslations('buy');
  return { title: t('title') };
}

export default async function Buy({ searchParams }: BuyPageProps) {
  const t = await getTranslations('buy');
  const locale = await getLocale();
  const raw = await searchParams;

  const params = parseSearchParams({ ...raw, listingType: 'buy' });
  const { listings: rawListings } = await searchListings(params);

  const listings: LocalizedListing[] = rawListings.map((listing) =>
    getLocalizedListing(listing, locale as Locale)
  );

  return (
    <main className="from-tiff-gray-50 via-tiff-gray-100 to-leon-blue-50 dark:from-tiff-gray-950 dark:via-leon-blue-950 dark:to-tiff-gray-900 min-h-screen bg-linear-to-br p-5 pt-32 sm:px-10 md:pt-52">
      <h1 className="text-center text-2xl font-light tracking-wider">
        {t('title')}
      </h1>
      <p className="text-center font-light tracking-wide text-gray-600 dark:text-gray-400">
        {t('description')}
      </p>
      <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-start">
        <ListingsFilters listingType="buy" initialSearchParams={raw} />
        <div className="grid min-w-0 flex-1 grid-cols-1 gap-10 xl:grid-cols-2">
          {listings.map((listing, index) => (
            <ListingCard key={index} listing={listing} />
          ))}
        </div>
      </div>
    </main>
  );
}
