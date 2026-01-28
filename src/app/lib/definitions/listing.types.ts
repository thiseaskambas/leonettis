// src/app/lib/definitions.ts

export interface Address {
  streetNumber: string;
  streetName: string;
  city: string;
  region?: string;
  zipCode: string;
  country: string;

  // CRITICAL for maps: Store these directly
  coordinates: {
    lat: number;
    lng: number;
  };

  // Optional: Useful for privacy (e.g. "Near Central Park" instead of exact address)
  displayAddress?: string;
}

export interface Listing {
  listingType: 'buy' | 'rent';
  propertyType: 'house' | 'apartment' | 'villa' | 'land' | 'commercial';
  title: string;
  id: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareMeters: number;
  description: string;
  images: string[];
  features: string[];
  amenities: string[];
  address: Address;
  publishedAt: Date;
  updatedAt: Date;
  isFeatured?: boolean;
  isActive?: boolean;
  isSold?: boolean;
  isRented?: boolean;
  swimmingPool?: boolean;
  garden?: boolean;
  parking?: boolean;
  garage?: boolean;
  terrace?: boolean;
  tags: string[];
  favorite?: boolean;
  urgent?: boolean;
  new?: boolean;
  yearBuilt?: number;
  energyRating?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  yearRenovated?: number;
  needsRenovation?: boolean;
  availableNow?: boolean;
  availableFrom?: Date;
  availableTo?: Date;
  leaseDuration?: number;
  leaseDurationUnit?: 'month' | 'year';
  leaseDurationType?: 'fixed' | 'flexible';
}
