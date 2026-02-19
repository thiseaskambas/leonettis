import { getLocale, getTranslations } from 'next-intl/server';

import { LocalizedListing } from '@/app/lib/definitions/listing.types';
import { getLocalizedListing } from '@/app/lib/helpers/listing-helpers';
import {
  parseSearchParams,
  searchListings,
} from '@/app/lib/services/listings-service';
import ListingCard from '@/app/ui/ListingCard';
import { Locale } from '@/i18n/routing';

interface RentPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Rent({ searchParams }: RentPageProps) {
  const t = await getTranslations('rent');
  const locale = await getLocale();
  const raw = await searchParams;

  const params = parseSearchParams({ ...raw, listingType: 'rent' });
  const { listings: rawListings } = await searchListings(params);

  const listings: LocalizedListing[] = rawListings.map((listing) =>
    getLocalizedListing(listing, locale as Locale)
  );

  return (
    <main className="dark:bg-tiff-gray-950 mt-40 min-h-screen p-5 md:p-10">
      <h1 className="text-center text-2xl font-light">{t('title')}</h1>
      <p className="text-center font-light text-gray-600 dark:text-gray-400">
        {t('description')}
      </p>
      <div className="mt-10 grid min-w-0 grid-cols-1 gap-8 md:grid-cols-2">
        {listings.map((listing, index) => (
          <ListingCard key={index} listing={listing} />
        ))}
      </div>
    </main>
  );
}
