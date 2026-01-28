export interface Address {
  streetNumber: string;
  streetName: string;
  city: string;
  region?: string;
  zipCode: string;
  country: string;

  coordinates: {
    lat: number;
    lng: number;
  };

  displayAddress?: string;
}

export interface Listing {
  title: string;
  slug: string;
  address: Address;
  listingType: 'buy' | 'rent';
  propertyType: 'house' | 'apartment' | 'villa' | 'land' | 'commercial';
  id: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareMeters: number;
  description: string;
  images: string[];
  features: string[];
  amenities: string[];
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
