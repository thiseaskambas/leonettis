import { Bath, Bed, MapPin, Maximize, Phone } from 'lucide-react';

import { LocalizedListing } from '@/app/lib/definitions/listing.types';
import { Link } from '@/i18n/navigation';

interface PropertyDetailsTranslations {
  bedrooms: string;
  bathrooms: string;
  area: string;
  interior: string;
  outdoor: string;
  total: string;
  pricePerMonth: string;
  address: string;
  propertyType: string;
  category: string;
  condition: string;
  energyRating: string;
  yearBuilt: string;
  furnishing: string;
  features: string;
  amenities: string;
  views: string;
  suitableFor: string;
  description: string;
  contact: string;
  availableNow: string;
  availableFrom: string;
}

interface PropertyDetailsProps {
  listing: LocalizedListing;
  translations: PropertyDetailsTranslations;
  filterTranslations: {
    propertyType: Record<string, string>;
    condition: Record<string, string>;
    furnishing: Record<string, string>;
    features: Record<string, string>;
    amenities: Record<string, string>;
    viewType: Record<string, string>;
    suitableFor: Record<string, string>;
    category: Record<string, string>;
  };
}

function Chip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-gray-200 bg-white/60 px-3 py-1 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-white/5 dark:text-gray-300">
      {label}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </dt>
      <dd className="text-sm font-medium text-gray-900 dark:text-white">
        {value}
      </dd>
    </div>
  );
}

export default function PropertyDetails({
  listing,
  translations,
  filterTranslations,
}: PropertyDetailsProps) {
  const {
    price,
    listingType,
    description,
    bedrooms,
    bathrooms,
    squareMetersInterior,
    squareMetersOutdoor,
    squareMetersTotal,
    propertyType,
    category,
    condition,
    furnishing,
    energyRating,
    yearBuilt,
    features,
    amenities,
    view,
    suitableFor,
    address,
    availableNow,
    availableFrom,
  } = listing;

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price);

  const displayAddress =
    address.displayAddress ??
    [
      address.streetNumber,
      address.streetName,
      address.city,
      address.region,
      address.state,
      address.country,
    ]
      .filter(Boolean)
      .join(', ');

  // Normalize chip labels — replace spaces/underscores with hyphens for lookup
  const normalizeKey = (s: string) => s.replace(/ /g, '-');

  return (
    <div className="flex flex-col gap-10">
      {/* Price */}
      <div className="flex flex-wrap items-end gap-4">
        <p className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          {formattedPrice}
          {listingType === 'rent' && (
            <span className="ml-1 text-xl font-normal text-gray-500 dark:text-gray-400">
              {translations.pricePerMonth}
            </span>
          )}
        </p>
        {availableNow && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-400">
            {translations.availableNow}
          </span>
        )}
        {availableFrom && !availableNow && (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            {translations.availableFrom}: {availableFrom}
          </span>
        )}
      </div>

      {/* Key specs */}
      {(!!bedrooms || !!bathrooms || !!squareMetersTotal || !!squareMetersInterior) && (
        <div className="flex flex-wrap gap-6 border-b border-gray-200/60 pb-8 dark:border-gray-700/60">
          {!!bedrooms && (
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Bed className="h-5 w-5 text-gray-400" />
              <span className="text-lg font-semibold">{bedrooms}</span>
              <span className="text-sm">{translations.bedrooms}</span>
            </div>
          )}
          {!!bathrooms && (
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Bath className="h-5 w-5 text-gray-400" />
              <span className="text-lg font-semibold">{bathrooms}</span>
              <span className="text-sm">{translations.bathrooms}</span>
            </div>
          )}
          {!!squareMetersTotal && (
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Maximize className="h-5 w-5 text-gray-400" />
              <span className="text-lg font-semibold">{squareMetersTotal}m²</span>
              <span className="text-sm">{translations.total}</span>
            </div>
          )}
          {!!squareMetersInterior && (
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Maximize className="h-5 w-5 text-gray-400" />
              <span className="text-lg font-semibold">{squareMetersInterior}m²</span>
              <span className="text-sm">{translations.interior}</span>
            </div>
          )}
          {!!squareMetersOutdoor && (
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Maximize className="h-5 w-5 text-gray-400" />
              <span className="text-lg font-semibold">{squareMetersOutdoor}m²</span>
              <span className="text-sm">{translations.outdoor}</span>
            </div>
          )}
        </div>
      )}

      {/* Description */}
      {description && (
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            {translations.description}
          </h2>
          <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
            {description}
          </p>
        </div>
      )}

      {/* Property details grid */}
      <div className="grid grid-cols-2 gap-6 rounded-2xl border border-gray-200/60 bg-white/40 p-6 dark:border-gray-700/40 dark:bg-white/5 md:grid-cols-3">
        <DetailRow
          label={translations.propertyType}
          value={filterTranslations.propertyType[propertyType] ?? propertyType}
        />
        <DetailRow
          label={translations.category}
          value={filterTranslations.category[category] ?? category}
        />
        {condition && (
          <DetailRow
            label={translations.condition}
            value={
              filterTranslations.condition[normalizeKey(condition)] ?? condition
            }
          />
        )}
        {furnishing && (
          <DetailRow
            label={translations.furnishing}
            value={
              filterTranslations.furnishing[normalizeKey(furnishing)] ??
              furnishing
            }
          />
        )}
        {energyRating && (
          <DetailRow
            label={translations.energyRating}
            value={energyRating}
          />
        )}
        {yearBuilt && !!yearBuilt && (
          <DetailRow
            label={translations.yearBuilt}
            value={String(yearBuilt)}
          />
        )}
      </div>

      {/* Chips sections */}
      {features && features.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            {translations.features}
          </h2>
          <div className="flex flex-wrap gap-2">
            {features.map((f) => (
              <Chip
                key={f}
                label={filterTranslations.features[normalizeKey(f)] ?? f}
              />
            ))}
          </div>
        </div>
      )}

      {amenities && amenities.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            {translations.amenities}
          </h2>
          <div className="flex flex-wrap gap-2">
            {amenities.map((a) => (
              <Chip
                key={a}
                label={filterTranslations.amenities[normalizeKey(a)] ?? a}
              />
            ))}
          </div>
        </div>
      )}

      {view && view.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            {translations.views}
          </h2>
          <div className="flex flex-wrap gap-2">
            {view.map((v) => (
              <Chip
                key={v}
                label={filterTranslations.viewType[v] ?? v}
              />
            ))}
          </div>
        </div>
      )}

      {suitableFor && suitableFor.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            {translations.suitableFor}
          </h2>
          <div className="flex flex-wrap gap-2">
            {suitableFor.map((s) => (
              <Chip
                key={s}
                label={
                  filterTranslations.suitableFor[normalizeKey(s)] ?? s
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Location */}
      {displayAddress && (
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            {translations.address}
          </h2>
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
            <span>{displayAddress}</span>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="pt-2">
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-8 py-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200">
          <Phone className="h-4 w-4" />
          {translations.contact}
        </Link>
      </div>
    </div>
  );
}
