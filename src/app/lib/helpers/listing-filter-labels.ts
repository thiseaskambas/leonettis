import enMessages from '../../../../messages/en.json';
import grMessages from '../../../../messages/gr.json';

/** Same normalization as public property detail chips (spaces/underscores → hyphens). */
export function normalizeListingLabelKey(value: string): string {
  return value.replace(/ /g, '-').replace(/_/g, '-');
}

type MessageFilters = (typeof grMessages)['search-bar']['filters'];

function labelFromSection(
  section: Record<string, string>,
  dbValue: string
): string | undefined {
  const key = normalizeListingLabelKey(dbValue);
  return section[key];
}

function buildOptionMap(
  section: Record<string, string>,
  dbValues: readonly string[]
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const value of dbValues) {
    const label = labelFromSection(section, value);
    if (label) out[value] = label;
  }
  return out;
}

const PROPERTY_TYPE_DB_VALUES = [
  'apartment',
  'field',
  'house',
  'land',
  'business',
  'garage',
  'building',
  'office',
  'warehouse',
] as const;

const CATEGORY_DB_VALUES = [
  'commercial',
  'residential',
  'industrial',
  'agricultural',
] as const;

const FURNISHING_DB_VALUES = [
  'furnished',
  'unfurnished',
  'partially furnished',
  'other',
] as const;

const CONDITION_DB_VALUES = [
  'new',
  'used',
  'renovated',
  'partially renovated',
  'renovation needed',
  'other',
] as const;

const FEATURE_DB_VALUES = [
  'air conditioning',
  'heating',
  'fireplace',
  'stove',
  'balcony',
  'terrace',
  'garden',
  'parking',
  'garage',
] as const;

const AMENITY_DB_VALUES = [
  'swimming pool',
  'gym',
  'jacuzzi',
  'sauna',
  'steam room',
  'tennis court',
  'golf course',
  'parking',
  'garage',
  'terrace',
] as const;

const VIEW_DB_VALUES = [
  'sea',
  'mountain',
  'city',
  'countryside',
  'lake',
  'river',
  'forest',
  'park',
  'beach',
] as const;

const SUITABLE_FOR_DB_VALUES = [
  'family',
  'couple',
  'single',
  'business',
  'students',
  'investment',
  'embassy',
  'vacation home',
] as const;

function buildMapsFromMessages(messages: typeof grMessages) {
  const filters = messages['search-bar'].filters as MessageFilters;
  const searchBar = messages['search-bar'];
  const propertyStatus = messages.property.status;

  const propertyTypes: Record<string, string> = {};
  for (const value of PROPERTY_TYPE_DB_VALUES) {
    propertyTypes[value] =
      filters.propertyType[value] ?? messages['property-type'][value];
  }

  const listingStatuses: Record<string, string> = {
    sold: propertyStatus.sold,
    rented: propertyStatus.rented,
    pending: propertyStatus.pending,
    under_offer: propertyStatus.under_offer,
  };

  return {
    listingTypes: {
      buy: searchBar['buy-label'],
      rent: searchBar['rent-label'],
    },
    categories: buildOptionMap(filters.category, CATEGORY_DB_VALUES),
    propertyTypes,
    statuses: listingStatuses,
    furnishingOptions: buildOptionMap(filters.furnishing, FURNISHING_DB_VALUES),
    conditionOptions: buildOptionMap(filters.condition, CONDITION_DB_VALUES),
    featureOptions: buildOptionMap(filters.features, FEATURE_DB_VALUES),
    amenityOptions: buildOptionMap(filters.amenities, AMENITY_DB_VALUES),
    viewOptions: buildOptionMap(filters.viewType, VIEW_DB_VALUES),
    suitableForOptions: buildOptionMap(
      filters.suitableFor,
      SUITABLE_FOR_DB_VALUES
    ),
    statusOptions: listingStatuses,
  };
}

const enMaps = buildMapsFromMessages(enMessages);
const grMaps = buildMapsFromMessages(grMessages);

/** Option display labels keyed by stored English DB values. */
export function getListingOptionLabels(locale: 'en' | 'gr'): typeof enMaps {
  return locale === 'gr' ? grMaps : enMaps;
}
