import { listingsData } from '@/app/lib/mock-data/listings-data';
import ListingCard from '@/app/ui/ListingCard';

export default function Buy() {
  const listings = listingsData;
  return (
    <main className="dark:bg-tiff-gray-950 min-h-screen p-5 md:p-10">
      <div className="grid min-w-0 grid-cols-1 gap-8 md:grid-cols-2">
        {listings.map((listing, index) => (
          <ListingCard key={index} listing={listing} />
        ))}
      </div>
    </main>
  );
}
