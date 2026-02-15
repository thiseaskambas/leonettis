import { Locale } from '@/i18n/routing';

export interface Address {
  streetNumber?: string;
  streetName?: string;
  city: string;
  state?: string;
  region?: string;
  zipCode: string;
  country: string;

  coordinates: {
    lat: number;
    lng: number;
  };

  displayAddress?: string;
}

type ListingCategory =
  | 'commercial'
  | 'residential'
  | 'industrial'
  | 'agricultural';

export type PropertyType =
  | 'apartment'
  | 'field'
  | 'house'
  | 'land'
  | 'business'
  | 'garage'
  | 'building'
  | 'office'
  | 'warehouse';

type ViewType =
  | 'sea'
  | 'mountain'
  | 'city'
  | 'countryside'
  | 'lake'
  | 'river'
  | 'forest'
  | 'park'
  | 'beach'
  | 'other';

type Amenities =
  | 'swimming pool'
  | 'gym'
  | 'jacuzzi'
  | 'sauna'
  | 'steam room'
  | 'tennis court'
  | 'golf course'
  | 'parking'
  | 'garage'
  | 'terrace'
  | 'other';

type Features =
  | 'air conditioning'
  | 'heating'
  | 'fireplace'
  | 'stove'
  | 'balcony'
  | 'terrace'
  | 'garden'
  | 'parking'
  | 'garage'
  | 'other';

type Furnishing = 'furnished' | 'unfurnished' | 'partially furnished' | 'other';

type SuitableFor =
  | 'family'
  | 'couple'
  | 'single'
  | 'business'
  | 'students'
  | 'investment'
  | 'embassy'
  | 'vacation home'
  | 'other';

type EnergyRating = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

type Condition =
  | 'new'
  | 'used'
  | 'renovated'
  | 'partially renovated'
  | 'renovation needed'
  | 'other';

export interface Listing {
  title: Record<Locale, string>;
  description?: Record<Locale, string>;
  slug: string;
  address: Address;
  listingType: 'buy' | 'rent';
  category: ListingCategory;
  propertyType: PropertyType;
  id: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  squareMetersInterior?: number;
  squareMetersOutdoor?: number;
  squareMetersTotal?: number;
  images?: string[];
  mainImage?: string;
  videos?: string[];
  features?: Features[];
  furnishing?: Furnishing;
  amenities?: Amenities[];
  suitableFor?: SuitableFor[];
  view?: ViewType[];
  publishedAt: Date;
  updatedAt: Date;
  isFeatured?: boolean;
  isActive?: boolean;
  isSold?: boolean;
  isRented?: boolean;
  tags: string[];
  favorite?: boolean;
  urgent?: boolean;
  condition?: Condition;
  yearBuilt?: number;
  energyRating?: EnergyRating;
  yearRenovated?: number;
  availableNow?: boolean;
  availableFrom?: Date;
  availableTo?: Date;
  leaseDuration?: number;
  leaseDurationUnit?: 'month' | 'year';
  leaseDurationType?: 'fixed' | 'flexible';
}

export interface LocalizedListing extends Omit<
  Listing,
  'title' | 'description'
> {
  title: string;
  description?: string;
}
