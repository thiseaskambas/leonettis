import { listingsData } from '@/app/lib/mock-data/listings-data';
import ListingCard from '@/app/ui/ListingCard';

export default function Buy() {
  const listings = listingsData;
  return (
    <main>
      <h1>Buy</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </main>
  );
}
