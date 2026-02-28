import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';

import {
  getListingBySlug,
  getLocalizedListing,
} from '@/app/lib/helpers/listing-helpers';
import { Locale } from '@/i18n/routing';

import PropertyBreadcrumb from './components/PropertyBreadcrumb';
import PropertyDetails from './components/PropertyDetails';
import PropertyGallery from './components/PropertyGallery';
import PropertyHero from './components/PropertyHero';

interface PropertyPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations('property');
  const tFilters = await getTranslations('search-bar.filters');

  const raw = getListingBySlug(slug);
  if (!raw) notFound();

  const listing = getLocalizedListing(raw, locale as Locale);

  const filterTranslations = {
    propertyType: {
      apartment: tFilters('propertyType.apartment'),
      house: tFilters('propertyType.house'),
      building: tFilters('propertyType.building'),
      office: tFilters('propertyType.office'),
      business: tFilters('propertyType.business'),
      warehouse: tFilters('propertyType.warehouse'),
      field: tFilters('propertyType.field'),
      land: tFilters('propertyType.land'),
      garage: tFilters('propertyType.garage'),
    },
    category: {
      residential: tFilters('category.residential'),
      commercial: tFilters('category.commercial'),
      industrial: tFilters('category.industrial'),
      agricultural: tFilters('category.agricultural'),
    },
    condition: {
      new: tFilters('condition.new'),
      used: tFilters('condition.used'),
      renovated: tFilters('condition.renovated'),
      'partially-renovated': tFilters('condition.partially-renovated'),
      'renovation-needed': tFilters('condition.renovation-needed'),
      other: tFilters('condition.other'),
    },
    furnishing: {
      furnished: tFilters('furnishing.furnished'),
      unfurnished: tFilters('furnishing.unfurnished'),
      'partially-furnished': tFilters('furnishing.partially-furnished'),
      other: tFilters('furnishing.other'),
    },
    features: {
      'air-conditioning': tFilters('features.air-conditioning'),
      heating: tFilters('features.heating'),
      fireplace: tFilters('features.fireplace'),
      stove: tFilters('features.stove'),
      balcony: tFilters('features.balcony'),
      terrace: tFilters('features.terrace'),
      garden: tFilters('features.garden'),
      parking: tFilters('features.parking'),
      garage: tFilters('features.garage'),
      other: tFilters('features.other'),
    },
    amenities: {
      'swimming-pool': tFilters('amenities.swimming-pool'),
      gym: tFilters('amenities.gym'),
      jacuzzi: tFilters('amenities.jacuzzi'),
      sauna: tFilters('amenities.sauna'),
      'steam-room': tFilters('amenities.steam-room'),
      'tennis-court': tFilters('amenities.tennis-court'),
      'golf-course': tFilters('amenities.golf-course'),
      parking: tFilters('amenities.parking'),
      garage: tFilters('amenities.garage'),
      terrace: tFilters('amenities.terrace'),
      other: tFilters('amenities.other'),
    },
    viewType: {
      sea: tFilters('viewType.sea'),
      mountain: tFilters('viewType.mountain'),
      city: tFilters('viewType.city'),
      countryside: tFilters('viewType.countryside'),
      lake: tFilters('viewType.lake'),
      river: tFilters('viewType.river'),
      forest: tFilters('viewType.forest'),
      park: tFilters('viewType.park'),
      beach: tFilters('viewType.beach'),
      other: tFilters('viewType.other'),
    },
    suitableFor: {
      family: tFilters('suitableFor.family'),
      couple: tFilters('suitableFor.couple'),
      single: tFilters('suitableFor.single'),
      business: tFilters('suitableFor.business'),
      students: tFilters('suitableFor.students'),
      investment: tFilters('suitableFor.investment'),
      embassy: tFilters('suitableFor.embassy'),
      'vacation-home': tFilters('suitableFor.vacation-home'),
      other: tFilters('suitableFor.other'),
    },
  };

  const heroTranslations = {
    pricePerMonth: t('pricePerMonth'),
    bedrooms: t('bedrooms'),
    bathrooms: t('bathrooms'),
    area: t('area'),
  };

  const detailsTranslations = {
    bedrooms: t('bedrooms'),
    bathrooms: t('bathrooms'),
    area: t('area'),
    interior: t('interior'),
    outdoor: t('outdoor'),
    total: t('total'),
    pricePerMonth: t('pricePerMonth'),
    address: t('address'),
    propertyType: t('propertyType'),
    category: t('category'),
    condition: t('condition'),
    energyRating: t('energyRating'),
    yearBuilt: t('yearBuilt'),
    furnishing: t('furnishing'),
    features: t('features'),
    amenities: t('amenities'),
    views: t('views'),
    suitableFor: t('suitableFor'),
    description: t('description'),
    contact: t('contact'),
    availableNow: t('availableNow'),
    availableFrom: t('availableFrom'),
  };

  const breadcrumbTranslations = {
    home: t('breadcrumb.home'),
    forSale: t('breadcrumb.forSale'),
    forRent: t('breadcrumb.forRent'),
  };

  return (
    <div className="from-tiff-gray-50 via-tiff-gray-100 to-leon-blue-50 dark:from-tiff-gray-950 dark:via-leon-blue-950 dark:to-tiff-gray-900 min-h-screen bg-linear-to-br">
      {/* Hero — full width, no top margin (sits under the navbar) */}
      <div className="pt-16 md:pt-20">
        <PropertyHero
          images={listing.images}
          videos={listing.videos}
          title={listing.title}
          address={listing.address}
          price={listing.price}
          bedrooms={listing.bedrooms}
          bathrooms={listing.bathrooms}
          squareMetersTotal={listing.squareMetersTotal}
          listingType={listing.listingType}
          translations={heroTranslations}
        />
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-5 py-10 md:px-10 md:py-14">
        {/* Breadcrumb — desktop only */}
        <div className="mb-8">
          <PropertyBreadcrumb
            listingType={listing.listingType}
            title={listing.title}
            translations={breadcrumbTranslations}
          />
        </div>

        {/* Details */}
        <PropertyDetails
          listing={listing}
          translations={detailsTranslations}
          filterTranslations={filterTranslations}
        />

        {/* Gallery */}
        {listing.images && listing.images.length > 0 && (
          <div className="mt-16">
            <PropertyGallery
              images={listing.images}
              title={listing.title}
              galleryLabel={t('gallery')}
              closeLabel={t('close')}
            />
          </div>
        )}
      </main>
    </div>
  );
}
