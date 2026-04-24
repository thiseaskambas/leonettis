'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';

import type {
  Listing,
  ListingImage,
} from '@/app/lib/definitions/listing.types';

const LOCALES = ['en', 'fr', 'gr', 'de', 'it'] as const;
type LocaleCode = (typeof LOCALES)[number];

const PROPERTY_TYPES: Listing['propertyType'][] = [
  'apartment',
  'field',
  'house',
  'land',
  'business',
  'garage',
  'building',
  'office',
  'warehouse',
];

type NumericListingField =
  | 'bedrooms'
  | 'bathrooms'
  | 'squareMetersInterior'
  | 'squareMetersOutdoor'
  | 'squareMetersTotal'
  | 'yearBuilt'
  | 'yearRenovated'
  | 'leaseDuration';

const NUMERIC_FIELDS: { label: string; key: NumericListingField }[] = [
  { label: 'Bedrooms', key: 'bedrooms' },
  { label: 'Bathrooms', key: 'bathrooms' },
  { label: 'Sqm interior', key: 'squareMetersInterior' },
  { label: 'Sqm outdoor', key: 'squareMetersOutdoor' },
  { label: 'Sqm total', key: 'squareMetersTotal' },
  { label: 'Year built', key: 'yearBuilt' },
  { label: 'Year renovated', key: 'yearRenovated' },
  { label: 'Lease duration', key: 'leaseDuration' },
];

type BooleanListingField =
  | 'isActive'
  | 'isFeatured'
  | 'isSold'
  | 'isRented'
  | 'urgent'
  | 'availableNow'
  | 'availableUponRequest';

const BOOLEAN_FIELDS: { key: BooleanListingField; label: string }[] = [
  { key: 'isActive', label: 'Active' },
  { key: 'isFeatured', label: 'Featured' },
  { key: 'isSold', label: 'Sold' },
  { key: 'isRented', label: 'Rented' },
  { key: 'urgent', label: 'Urgent' },
  { key: 'availableNow', label: 'Available now' },
  { key: 'availableUponRequest', label: 'Available upon request' },
];

function toCsv(values: string[] | undefined): string {
  return values?.join(', ') ?? '';
}

function fromCsv(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function getImageKey(image: ListingImage): string {
  if (image.key) return image.key;

  try {
    const parsed = new URL(image.url);
    return parsed.pathname.replace(/^\//, '');
  } catch {
    return image.url.replace(/^\//, '');
  }
}

function baseLocalizedText() {
  return { en: '', fr: '', gr: '', de: '', it: '' };
}

function getInitialListing(initialListing?: Listing): Listing {
  const now = new Date().toISOString();
  return (
    initialListing ?? {
      id: '',
      title: baseLocalizedText(),
      description: baseLocalizedText(),
      slug: '',
      address: {
        city: '',
        zipCode: '',
        country: '',
        coordinates: { lat: 0, lng: 0 },
        displayAddress: '',
      },
      listingType: 'buy',
      category: ['residential'],
      propertyType: 'house',
      price: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      squareMetersInterior: undefined,
      squareMetersOutdoor: undefined,
      squareMetersTotal: undefined,
      images: [],
      mainImage: '',
      videos: [],
      features: [],
      furnishing: undefined,
      amenities: [],
      suitableFor: [],
      view: [],
      publishedAt: now,
      updatedAt: now,
      isFeatured: false,
      isActive: true,
      isSold: false,
      isRented: false,
      tags: [],
      favorite: false,
      urgent: false,
      condition: undefined,
      yearBuilt: undefined,
      energyRating: undefined,
      yearRenovated: undefined,
      availableNow: false,
      availableUponRequest: false,
      availableFrom: '',
      availableTo: '',
      leaseDuration: undefined,
      leaseDurationUnit: undefined,
      leaseDurationType: undefined,
    }
  );
}

interface ListingFormProps {
  mode: 'create' | 'edit';
  initialListing?: Listing;
}

export default function ListingForm({
  mode,
  initialListing,
}: ListingFormProps) {
  const router = useRouter();
  const [activeLocale, setActiveLocale] = useState<LocaleCode>('en');
  const [listing, setListing] = useState<Listing>(() =>
    getInitialListing(initialListing)
  );
  const [categoryCsv, setCategoryCsv] = useState(() => toCsv(listing.category));
  const [featuresCsv, setFeaturesCsv] = useState(() => toCsv(listing.features));
  const [amenitiesCsv, setAmenitiesCsv] = useState(() =>
    toCsv(listing.amenities)
  );
  const [viewCsv, setViewCsv] = useState(() => toCsv(listing.view));
  const [suitableForCsv, setSuitableForCsv] = useState(() =>
    toCsv(listing.suitableFor)
  );
  const [tagsCsv, setTagsCsv] = useState(() => toCsv(listing.tags));
  const [videosCsv, setVideosCsv] = useState(() => toCsv(listing.videos));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const formTitle = useMemo(
    () =>
      mode === 'create'
        ? 'Create Listing'
        : `Edit Listing: ${listing.title.en}`,
    [listing.title.en, mode]
  );

  const syncArrayFields = (): Listing => ({
    ...listing,
    category: fromCsv(categoryCsv) as Listing['category'],
    features: fromCsv(featuresCsv) as Listing['features'],
    amenities: fromCsv(amenitiesCsv) as Listing['amenities'],
    view: fromCsv(viewCsv) as Listing['view'],
    suitableFor: fromCsv(suitableForCsv) as Listing['suitableFor'],
    tags: fromCsv(tagsCsv),
    videos: fromCsv(videosCsv),
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const next = syncArrayFields();
    const slug = buildSlug(next.title.en || next.slug);
    const payload = { ...next, slug };

    try {
      const endpoint =
        mode === 'create'
          ? '/api/admin/listings'
          : `/api/admin/listings/${listing.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(body.error ?? 'Failed to save listing');
        return;
      }

      if (mode === 'create') {
        const body = (await response.json()) as { listing: Listing };
        router.replace(`/admin/listings/${body.listing.id}/edit`);
      } else {
        router.refresh();
      }
    } catch {
      setError('Failed to save listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file || !listing.id) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set('file', file);
      const response = await fetch(`/api/admin/listings/${listing.id}/images`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        setError('Image upload failed');
        return;
      }

      const body = (await response.json()) as { image: ListingImage };
      setListing((prev) => ({
        ...prev,
        images: [...(prev.images ?? []), body.image],
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = async (image: ListingImage) => {
    if (!listing.id) return;

    const response = await fetch('/api/admin/listings/images', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listingId: listing.id,
        imageUrl: image.url,
        imageKey: getImageKey(image),
      }),
    });

    if (!response.ok) {
      setError('Failed to delete image');
      return;
    }

    setListing((prev) => ({
      ...prev,
      images: (prev.images ?? []).filter((item) => item.url !== image.url),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <h1 className="text-2xl font-semibold">{formTitle}</h1>
      {error && (
        <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <section className="space-y-3 rounded border border-gray-200 p-4">
        <h2 className="font-medium">Localized Content</h2>
        <div className="flex flex-wrap gap-2">
          {LOCALES.map((locale) => (
            <button
              key={locale}
              type="button"
              onClick={() => setActiveLocale(locale)}
              className={`rounded border px-3 py-1 text-sm ${
                activeLocale === locale
                  ? 'bg-black text-white'
                  : 'border-gray-300'
              }`}>
              {locale.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm">Title ({activeLocale})</label>
            <input
              value={listing.title[activeLocale] ?? ''}
              onChange={(event) =>
                setListing((prev) => ({
                  ...prev,
                  title: { ...prev.title, [activeLocale]: event.target.value },
                  slug:
                    activeLocale === 'en'
                      ? buildSlug(event.target.value)
                      : buildSlug(prev.title.en),
                }))
              }
              className="w-full rounded border border-gray-300 px-3 py-2"
              required={activeLocale === 'en'}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Slug</label>
            <input
              value={listing.slug}
              onChange={(event) =>
                setListing((prev) => ({ ...prev, slug: event.target.value }))
              }
              className="w-full rounded border border-gray-300 px-3 py-2"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm">
              Description ({activeLocale})
            </label>
            <textarea
              value={listing.description?.[activeLocale] ?? ''}
              onChange={(event) =>
                setListing((prev) => ({
                  ...prev,
                  description: {
                    ...(prev.description ?? baseLocalizedText()),
                    [activeLocale]: event.target.value,
                  },
                }))
              }
              rows={4}
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded border border-gray-200 p-4">
        <h2 className="font-medium">Core Fields</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm">Listing Type</label>
            <select
              value={listing.listingType}
              onChange={(event) =>
                setListing((prev) => ({
                  ...prev,
                  listingType: event.target.value as Listing['listingType'],
                }))
              }
              className="w-full rounded border border-gray-300 px-3 py-2">
              <option value="buy">buy</option>
              <option value="rent">rent</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm">Property Type</label>
            <select
              value={listing.propertyType}
              onChange={(event) =>
                setListing((prev) => ({
                  ...prev,
                  propertyType: event.target.value as Listing['propertyType'],
                }))
              }
              className="w-full rounded border border-gray-300 px-3 py-2">
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm">Price</label>
            <input
              type="number"
              value={listing.price ?? ''}
              onChange={(event) =>
                setListing((prev) => ({
                  ...prev,
                  price: event.target.value
                    ? Number(event.target.value)
                    : undefined,
                }))
              }
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <div className="md:col-span-3">
            <label className="mb-1 block text-sm">
              Category[] (comma separated)
            </label>
            <input
              value={categoryCsv}
              onChange={(event) => setCategoryCsv(event.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded border border-gray-200 p-4">
        <h2 className="font-medium">Address</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <input
            placeholder="City"
            value={listing.address.city}
            onChange={(event) =>
              setListing((prev) => ({
                ...prev,
                address: { ...prev.address, city: event.target.value },
              }))
            }
            className="rounded border border-gray-300 px-3 py-2"
          />
          <input
            placeholder="Zip code"
            value={listing.address.zipCode}
            onChange={(event) =>
              setListing((prev) => ({
                ...prev,
                address: { ...prev.address, zipCode: event.target.value },
              }))
            }
            className="rounded border border-gray-300 px-3 py-2"
          />
          <input
            placeholder="Country"
            value={listing.address.country}
            onChange={(event) =>
              setListing((prev) => ({
                ...prev,
                address: { ...prev.address, country: event.target.value },
              }))
            }
            className="rounded border border-gray-300 px-3 py-2"
          />
          <input
            placeholder="Display address"
            value={listing.address.displayAddress ?? ''}
            onChange={(event) =>
              setListing((prev) => ({
                ...prev,
                address: {
                  ...prev.address,
                  displayAddress: event.target.value,
                },
              }))
            }
            className="rounded border border-gray-300 px-3 py-2 md:col-span-3"
          />
          <input
            type="number"
            step="any"
            placeholder="Latitude"
            value={listing.address.coordinates.lat}
            onChange={(event) =>
              setListing((prev) => ({
                ...prev,
                address: {
                  ...prev.address,
                  coordinates: {
                    ...prev.address.coordinates,
                    lat: Number(event.target.value || 0),
                  },
                },
              }))
            }
            className="rounded border border-gray-300 px-3 py-2"
          />
          <input
            type="number"
            step="any"
            placeholder="Longitude"
            value={listing.address.coordinates.lng}
            onChange={(event) =>
              setListing((prev) => ({
                ...prev,
                address: {
                  ...prev.address,
                  coordinates: {
                    ...prev.address.coordinates,
                    lng: Number(event.target.value || 0),
                  },
                },
              }))
            }
            className="rounded border border-gray-300 px-3 py-2"
          />
        </div>
      </section>

      <section className="space-y-3 rounded border border-gray-200 p-4">
        <h2 className="font-medium">Property Details</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {NUMERIC_FIELDS.map(({ label, key }) => (
            <div key={key}>
              <label className="mb-1 block text-sm">{label}</label>
              <input
                type="number"
                value={listing[key] ?? ''}
                onChange={(event) =>
                  setListing((prev) => ({
                    ...prev,
                    [key]: event.target.value
                      ? Number(event.target.value)
                      : undefined,
                  }))
                }
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>
          ))}
          <div>
            <label className="mb-1 block text-sm">Furnishing</label>
            <input
              value={listing.furnishing ?? ''}
              onChange={(event) =>
                setListing((prev) => ({
                  ...prev,
                  furnishing: event.target.value as Listing['furnishing'],
                }))
              }
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Condition</label>
            <input
              value={listing.condition ?? ''}
              onChange={(event) =>
                setListing((prev) => ({
                  ...prev,
                  condition: event.target.value as Listing['condition'],
                }))
              }
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Energy Rating</label>
            <input
              value={listing.energyRating ?? ''}
              onChange={(event) =>
                setListing((prev) => ({
                  ...prev,
                  energyRating: event.target.value as Listing['energyRating'],
                }))
              }
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Lease Unit</label>
            <select
              value={listing.leaseDurationUnit ?? ''}
              onChange={(event) =>
                setListing((prev) => ({
                  ...prev,
                  leaseDurationUnit:
                    event.target.value === ''
                      ? undefined
                      : (event.target.value as Listing['leaseDurationUnit']),
                }))
              }
              className="w-full rounded border border-gray-300 px-3 py-2">
              <option value="">-</option>
              <option value="month">month</option>
              <option value="year">year</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm">Lease Type</label>
            <select
              value={listing.leaseDurationType ?? ''}
              onChange={(event) =>
                setListing((prev) => ({
                  ...prev,
                  leaseDurationType:
                    event.target.value === ''
                      ? undefined
                      : (event.target.value as Listing['leaseDurationType']),
                }))
              }
              className="w-full rounded border border-gray-300 px-3 py-2">
              <option value="">-</option>
              <option value="fixed">fixed</option>
              <option value="flexible">flexible</option>
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded border border-gray-200 p-4">
        <h2 className="font-medium">Multi-select Arrays (comma separated)</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            placeholder="Features"
            value={featuresCsv}
            onChange={(event) => setFeaturesCsv(event.target.value)}
            className="rounded border border-gray-300 px-3 py-2"
          />
          <input
            placeholder="Amenities"
            value={amenitiesCsv}
            onChange={(event) => setAmenitiesCsv(event.target.value)}
            className="rounded border border-gray-300 px-3 py-2"
          />
          <input
            placeholder="Views"
            value={viewCsv}
            onChange={(event) => setViewCsv(event.target.value)}
            className="rounded border border-gray-300 px-3 py-2"
          />
          <input
            placeholder="Suitable for"
            value={suitableForCsv}
            onChange={(event) => setSuitableForCsv(event.target.value)}
            className="rounded border border-gray-300 px-3 py-2"
          />
          <input
            placeholder="Tags"
            value={tagsCsv}
            onChange={(event) => setTagsCsv(event.target.value)}
            className="rounded border border-gray-300 px-3 py-2"
          />
          <input
            placeholder="Videos"
            value={videosCsv}
            onChange={(event) => setVideosCsv(event.target.value)}
            className="rounded border border-gray-300 px-3 py-2"
          />
        </div>
      </section>

      <section className="space-y-3 rounded border border-gray-200 p-4">
        <h2 className="font-medium">Status</h2>
        <div className="grid gap-2 md:grid-cols-3">
          {BOOLEAN_FIELDS.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(listing[key])}
                onChange={(event) =>
                  setListing((prev) => ({
                    ...prev,
                    [key]: event.target.checked,
                  }))
                }
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      {mode === 'edit' && (
        <section className="space-y-3 rounded border border-gray-200 p-4">
          <h2 className="font-medium">Images</h2>
          <input
            type="file"
            accept="image/*"
            onChange={(event) =>
              handleImageUpload(event.target.files?.[0] ?? null)
            }
            disabled={uploading}
          />
          <div className="grid gap-3 md:grid-cols-3">
            {(listing.images ?? []).map((image) => (
              <div
                key={image.url}
                className="rounded border border-gray-200 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.name}
                  className="mb-2 h-28 w-full rounded object-cover"
                />
                <p className="mb-2 truncate text-sm">{image.name}</p>
                <button
                  type="button"
                  onClick={() => handleImageDelete(image)}
                  className="rounded border border-red-300 px-2 py-1 text-xs text-red-600">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-black px-5 py-2 text-white disabled:opacity-60">
        {isSubmitting
          ? 'Saving...'
          : mode === 'create'
            ? 'Create Listing'
            : 'Save Changes'}
      </button>
    </form>
  );
}
