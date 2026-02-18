import { getLocale, getTranslations } from 'next-intl/server';

import { LocalizedListing } from '@/app/lib/definitions/listing.types';
import { getLocalizedListing } from '@/app/lib/helpers/listing-helpers';
import { listingsData } from '@/app/lib/mock-data/listings-data';
import ListingCard from '@/app/ui/ListingCard';
import { Locale } from '@/i18n/routing';

export default async function Buy() {
  const t = await getTranslations('buy');
  const locale = await getLocale();
  const listings: LocalizedListing[] = listingsData
    .map((listing) => getLocalizedListing(listing, locale as Locale))
    .filter((listing) => listing.listingType === 'buy');
  return (
    <main className="from-tiff-gray-50 via-tiff-gray-100 to-leon-blue-50 dark:from-tiff-gray-950 dark:via-leon-blue-950 dark:to-tiff-gray-900 min-h-screen bg-linear-to-br p-5 pt-32 sm:px-10 md:px-32 md:pt-52">
      <h1 className="text-center text-2xl font-light tracking-wider">
        {t('title')}
      </h1>
      <p className="text-center font-light tracking-wide text-gray-600 dark:text-gray-400">
        {t('description')}
      </p>
      <div className=""></div>
      <div className="mt-10 grid min-w-0 grid-cols-1 gap-10 lg:grid-cols-2">
        {listings.map((listing, index) => (
          <ListingCard key={index} listing={listing} />
        ))}
      </div>
    </main>
  );
}
