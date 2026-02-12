import { listingsData } from '@/app/lib/mock-data/listings-data';
import ListingCard from '@/app/ui/ListingCard';

export default function Buy() {
  const listings = listingsData;
  return (
    <>
      <h1>Buy</h1>
      <div className="grid min-w-0 grid-cols-1 gap-8 md:grid-cols-2">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </>
  );
}
