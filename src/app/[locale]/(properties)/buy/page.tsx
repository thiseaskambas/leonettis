import { getTranslations } from 'next-intl/server';

import { listingsData } from '@/app/lib/mock-data/listings-data';
import ListingCard from '@/app/ui/ListingCard';

export default async function Buy() {
  const t = await getTranslations('buy');
  const listings = listingsData;
  return (
    <main className="dark:bg-tiff-gray-950 min-h-screen p-5 md:p-10">
      <h1 className="text-center text-2xl font-light">{t('title')}</h1>
      <p className="text-center font-light text-gray-600">{t('description')}</p>
      <div className="mt-10 grid min-w-0 grid-cols-1 gap-8 md:grid-cols-2">
        {listings.map((listing, index) => (
          <ListingCard key={index} listing={listing} />
        ))}
      </div>
    </main>
  );
}
