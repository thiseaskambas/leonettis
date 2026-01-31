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

type ListingCategory =
  | 'commercial'
  | 'residential'
  | 'industrial'
  | 'agricultural'
  | 'other';

type PropertyType =
  | 'house'
  | 'apartment'
  | 'villa'
  | 'land'
  | 'bungalow'
  | 'studio'
  | 'penthouse'
  | 'chalet'
  | 'farmhouse'
  | 'cottage'
  | 'townhouse'
  | 'loft'
  | 'commercial'
  | 'industrial'
  | 'agricultural'
  | 'other';

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
  title: string;
  slug: string;
  address: Address;
  listingType: 'buy' | 'rent';
  category: ListingCategory;
  propertyType: PropertyType;
  id: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareMeters: number;
  description: string;
  images: string[];
  features: Features[];
  furnishing: Furnishing;
  amenities: Amenities[];
  suitableFor: SuitableFor[];
  view: ViewType[];
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
