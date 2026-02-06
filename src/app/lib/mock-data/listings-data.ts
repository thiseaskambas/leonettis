import { Listing } from '../definitions/listing.types';

export const listingsData: Listing[] = [
  {
    id: '1',
    title: 'Listing 1',
    slug: 'listing-1',
    address: {
      streetNumber: '123',
      streetName: 'Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      coordinates: {
        lat: 40.7128,
        lng: -74.006,
      },
    },
    listingType: 'buy',
    category: 'residential',
    propertyType: 'house',
    price: 100000,
    bedrooms: 3,
    bathrooms: 2,
    squareMeters: 100,
    features: ['air conditioning', 'heating', 'fireplace'],
    furnishing: 'furnished',
    amenities: ['swimming pool', 'gym', 'jacuzzi'],
    suitableFor: ['family', 'couple', 'single'],
    view: ['sea', 'mountain', 'city'],
    publishedAt: new Date(),
    updatedAt: new Date(),
    isFeatured: true,
    isActive: true,
    tags: ['tag1', 'tag2', 'tag3'],
    images: [
      'https://placehold.co/600x400',
      'https://placehold.co/600x400',
      'https://placehold.co/600x400',
    ],
    description: 'Description 1',
  },
];
