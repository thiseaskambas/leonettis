'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';

import {
  getCustomListingValues,
  mergeListingArrayValues,
  parseCommaSeparatedValues,
  removeListingArrayValue,
} from '@/app/admin/components/listing-form-array-utils';
import {
  clearMediaFiles,
  formatFileSize,
  getMediaFileKey,
  mergeMediaFiles,
  removeMediaFileByKey,
} from '@/app/admin/components/listing-form-media-utils';
import {
  buildUrlWithoutMediaUploadParam,
  uploadCreateMediaBatch,
} from '@/app/admin/components/listing-form-upload-utils';
import type {
  Listing,
  ListingImage,
  ListingVideo,
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

const CATEGORY_OPTIONS: Listing['category'] = [
  'commercial',
  'residential',
  'industrial',
  'agricultural',
];

const FEATURE_OPTIONS = [
  'air conditioning',
  'heating',
  'fireplace',
  'stove',
  'balcony',
  'terrace',
  'garden',
  'parking',
  'garage',
];

const AMENITY_OPTIONS = [
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
];

const VIEW_OPTIONS = [
  'sea',
  'mountain',
  'city',
  'countryside',
  'lake',
  'river',
  'forest',
  'park',
  'beach',
];

const SUITABLE_FOR_OPTIONS = [
  'family',
  'couple',
  'single',
  'business',
  'students',
  'investment',
  'embassy',
  'vacation home',
];

const FURNISHING_OPTIONS: NonNullable<Listing['furnishing']>[] = [
  'furnished',
  'unfurnished',
  'partially furnished',
  'other',
];

const CONDITION_OPTIONS: NonNullable<Listing['condition']>[] = [
  'new',
  'used',
  'renovated',
  'partially renovated',
  'renovation needed',
  'other',
];

const ENERGY_RATING_OPTIONS: NonNullable<Listing['energyRating']>[] = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
];

const STATUS_OPTIONS: NonNullable<Listing['status']>[] = [
  'active',
  'sold',
  'rented',
  'pending',
  'under_offer',
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
  | 'isFeatured'
  | 'urgent'
  | 'availableNow'
  | 'availableUponRequest';

const BOOLEAN_FIELDS: { key: BooleanListingField; label: string }[] = [
  { key: 'isFeatured', label: 'Featured' },
  { key: 'urgent', label: 'Urgent' },
  { key: 'availableNow', label: 'Available now' },
  { key: 'availableUponRequest', label: 'Available upon request' },
];

const MAX_MEDIA_FILE_SIZE_BYTES = 500 * 1024 * 1024;

function toggleArrayValue<T extends string>(
  values: T[] | undefined,
  value: T,
  checked: boolean
): T[] {
  const current = values ?? [];
  if (checked) {
    return current.includes(value) ? current : [...current, value];
  }

  return current.filter((item) => item !== value);
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

function getMediaKey(media: { key?: string; url: string }): string {
  if (media.key) return media.key;

  try {
    const parsed = new URL(media.url);
    return parsed.pathname.replace(/^\//, '');
  } catch {
    return media.url.replace(/^\//, '');
  }
}

function normalizeListingVideos(videos: unknown): ListingVideo[] {
  if (!Array.isArray(videos)) return [];

  return videos
    .map((video) => {
      if (!video) return null;
      if (typeof video === 'string') {
        const trimmed = video.trim();
        if (!trimmed) return null;
        const fallbackName =
          trimmed.split('/').filter(Boolean).at(-1) || 'video';
        return { url: trimmed, name: fallbackName };
      }

      const url = typeof video.url === 'string' ? video.url.trim() : '';
      const name = typeof video.name === 'string' ? video.name.trim() : '';
      if (!url || !name) return null;

      return {
        url,
        name,
        key:
          typeof video.key === 'string' && video.key.trim()
            ? video.key.trim()
            : undefined,
        description:
          typeof video.description === 'string' ? video.description : undefined,
        contentType:
          typeof video.contentType === 'string' ? video.contentType : undefined,
      };
    })
    .filter(Boolean) as ListingVideo[];
}

function baseLocalizedText() {
  return { en: '', fr: '', gr: '', de: '', it: '' };
}

function getInitialListing(initialListing?: Listing): Listing {
  if (initialListing) {
    return {
      ...initialListing,
      videos: normalizeListingVideos(initialListing.videos),
    };
  }

  const now = new Date().toISOString();
  return {
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
    status: 'active',
    isFeatured: false,
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
  };
}

interface ListingFormProps {
  mode: 'create' | 'edit';
  initialListing?: Listing;
  initialMediaUploadWarning?: boolean;
}

type CustomArrayField =
  | 'features'
  | 'amenities'
  | 'view'
  | 'suitableFor'
  | 'tags';

export default function ListingForm({
  mode,
  initialListing,
  initialMediaUploadWarning = false,
}: ListingFormProps) {
  type UploadedMedia = {
    url: string;
    key: string;
    name: string;
    mediaType: 'image' | 'video';
  };

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeLocale, setActiveLocale] = useState<LocaleCode>('en');
  const [listing, setListing] = useState<Listing>(() =>
    getInitialListing(initialListing)
  );
  const [customArrayInputs, setCustomArrayInputs] = useState<
    Record<CustomArrayField, string>
  >({
    features: '',
    amenities: '',
    view: '',
    suitableFor: '',
    tags: '',
  });
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [translatingTitle, setTranslatingTitle] = useState(false);
  const [translatingDescription, setTranslatingDescription] = useState(false);
  const [improvingDescription, setImprovingDescription] = useState(false);
  const [descriptionPreview, setDescriptionPreview] = useState<string | null>(
    null
  );
  const [uploadingMediaName, setUploadingMediaName] = useState<string | null>(
    null
  );

  const formTitle = useMemo(
    () =>
      mode === 'create'
        ? 'Create Listing'
        : `Edit Listing: ${listing.title.en}`,
    [listing.title.en, mode]
  );
  const showMediaUploadWarning = mode === 'edit' && initialMediaUploadWarning;

  useEffect(() => {
    if (!showMediaUploadWarning) return;
    if (!searchParams.get('mediaUpload')) return;

    router.replace(buildUrlWithoutMediaUploadParam(pathname, searchParams));
  }, [pathname, router, searchParams, showMediaUploadWarning]);

  const uploadListingMediaDirectly = async (
    listingId: string,
    file: File
  ): Promise<UploadedMedia> => {
    const isVideo = file.type.startsWith('video/');
    if (file.size > MAX_MEDIA_FILE_SIZE_BYTES) {
      throw new Error(
        `${isVideo ? 'Video' : 'Image'} exceeds 500MB maximum size`
      );
    }

    if (!isVideo) {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`/api/admin/listings/${listingId}/images`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Image upload failed');
      const body = (await res.json()) as { media?: UploadedMedia };
      if (!body.media) throw new Error('Image upload response missing media');
      return body.media;
    }

    const presignResponse = await fetch(
      `/api/admin/listings/${listingId}/media/presign`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
          size: file.size,
        }),
      }
    );

    if (!presignResponse.ok) {
      throw new Error('Failed to prepare direct media upload');
    }

    const presignBody = (await presignResponse.json()) as {
      uploadUrl?: string;
      media?: UploadedMedia;
    };
    if (!presignBody.uploadUrl || !presignBody.media) {
      throw new Error('Invalid presign response');
    }

    const uploadResponse = await fetch(presignBody.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
      },
      body: file,
    });
    if (!uploadResponse.ok) {
      throw new Error('Direct media upload failed');
    }

    const finalizeResponse = await fetch(
      `/api/admin/listings/${listingId}/media/finalize`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...presignBody.media,
        }),
      }
    );
    if (!finalizeResponse.ok) {
      throw new Error('Failed to finalize uploaded media');
    }

    const finalizeBody = (await finalizeResponse.json()) as {
      media?: UploadedMedia;
    };
    if (!finalizeBody.media) {
      throw new Error('Finalize response is missing media metadata');
    }

    return finalizeBody.media;
  };

  const uploadMediaForListing = async (
    listingId: string,
    file: File
  ): Promise<UploadedMedia> => {
    return uploadListingMediaDirectly(listingId, file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const slug = buildSlug(listing.title.en || listing.slug);
    const payload: Listing = {
      ...listing,
      slug,
    };

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
        const createdListing = body.listing;
        let mediaUploadFailed = false;

        if (mediaFiles.length > 0) {
          setUploading(true);
          try {
            const uploadResult = await uploadCreateMediaBatch({
              files: mediaFiles,
              onFileStart: (file) => {
                setUploadingMediaName(file.name);
              },
              uploadFile: async (file) => {
                await uploadMediaForListing(createdListing.id, file);
              },
            });

            mediaUploadFailed = uploadResult.failed > 0;
          } finally {
            setUploadingMediaName(null);
            setUploading(false);
          }
        }

        router.replace(
          `/admin/listings/${createdListing.id}/edit${
            mediaUploadFailed ? '?mediaUpload=failed' : ''
          }`
        );
      } else {
        router.refresh();
      }
    } catch {
      setError('Failed to save listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const translateField = async (field: 'title' | 'description') => {
    const text =
      field === 'title'
        ? (listing.title[activeLocale] ?? '')
        : (listing.description?.[activeLocale] ?? '');
    if (!text.trim()) return;

    const setLoading =
      field === 'title' ? setTranslatingTitle : setTranslatingDescription;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          sourceLocale: activeLocale,
          field,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error ?? 'Translation failed');
      }

      const body = (await response.json()) as {
        translations?: Partial<Record<LocaleCode, string>>;
      };
      const translations = body.translations;

      if (!translations || typeof translations !== 'object') {
        throw new Error('Translation response is invalid');
      }

      setListing((previous) => {
        if (field === 'title') {
          return {
            ...previous,
            title: {
              ...previous.title,
              ...translations,
            },
          };
        }

        return {
          ...previous,
          description: {
            ...(previous.description ?? baseLocalizedText()),
            ...translations,
          },
        };
      });
    } catch (translateError) {
      const message =
        translateError instanceof Error
          ? translateError.message
          : 'Translation failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const improveDescription = async () => {
    const text = listing.description?.[activeLocale] ?? '';
    if (!text.trim()) return;

    setImprovingDescription(true);
    setError(null);
    setDescriptionPreview(null);

    try {
      const response = await fetch('/api/admin/improve-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          locale: activeLocale,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error ?? 'Improvement failed');
      }

      const body = (await response.json()) as { improved?: string };
      if (!body.improved) {
        throw new Error('Empty response from improve API');
      }

      setDescriptionPreview(body.improved);
    } catch (improveError) {
      const message =
        improveError instanceof Error
          ? improveError.message
          : 'Improvement failed';
      setError(message);
    } finally {
      setImprovingDescription(false);
    }
  };

  const handleMediaUpload = async (file: File | null) => {
    if (!file || !listing.id) return;
    setUploading(true);
    setError(null);
    setUploadingMediaName(file.name);

    try {
      const media = await uploadMediaForListing(listing.id, file);

      setListing((prev) => {
        if (media.mediaType === 'image') {
          const image: ListingImage = {
            url: media.url,
            name: media.name,
            key: media.key,
          };
          return {
            ...prev,
            images: [...(prev.images ?? []), image],
          };
        }

        const video: ListingVideo = {
          url: media.url,
          name: media.name,
          key: media.key,
        };
        return {
          ...prev,
          videos: [...(prev.videos ?? []), video],
        };
      });
    } catch {
      setError('Media upload failed');
    } finally {
      setUploadingMediaName(null);
      setUploading(false);
    }
  };

  const handleMediaDelete = async (
    mediaType: 'image' | 'video',
    media: ListingImage | ListingVideo
  ) => {
    if (!listing.id) return;
    const key = getMediaKey(media);
    if (!key) {
      setError('Cannot delete media without a storage key');
      return;
    }

    const response = await fetch('/api/admin/listings/images', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listingId: listing.id,
        mediaType,
        mediaUrl: media.url,
        mediaKey: key,
      }),
    });

    if (!response.ok) {
      setError('Failed to delete media');
      return;
    }

    setListing((prev) => ({
      ...prev,
      images:
        mediaType === 'image'
          ? (prev.images ?? []).filter((item) => item.url !== media.url)
          : prev.images,
      videos:
        mediaType === 'video'
          ? (prev.videos ?? []).filter((item) => item.url !== media.url)
          : prev.videos,
    }));
  };

  const handleMediaFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length === 0) return;

    setMediaFiles((previous) => mergeMediaFiles(previous, selectedFiles));
    // Reset native input value so selecting additional files is always additive.
    event.target.value = '';
  };

  const handleRemoveMediaFile = (fileKey: string) => {
    setMediaFiles((previous) => removeMediaFileByKey(previous, fileKey));
  };

  const handleAddCustomArrayValues = (
    field: CustomArrayField,
    predefinedOptions: readonly string[]
  ) => {
    const input = customArrayInputs[field];
    const parsedValues = parseCommaSeparatedValues(input);
    if (parsedValues.length === 0) return;

    setListing((previous) => ({
      ...previous,
      [field]: mergeListingArrayValues(
        previous[field] as string[] | undefined,
        parsedValues,
        predefinedOptions
      ),
    }));
    setCustomArrayInputs((previous) => ({ ...previous, [field]: '' }));
  };

  const handleRemoveCustomArrayValue = (
    field: CustomArrayField,
    valueToRemove: string
  ) => {
    setListing((previous) => ({
      ...previous,
      [field]: removeListingArrayValue(
        previous[field] as string[] | undefined,
        valueToRemove
      ),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <h1 className="text-2xl font-semibold">{formTitle}</h1>
      {showMediaUploadWarning && (
        <p className="rounded bg-amber-50 p-3 text-sm text-amber-800">
          Some media files failed to upload during listing creation. Successful
          uploads were kept and you can retry failed files below.
        </p>
      )}
      {error && (
        <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <section className="space-y-3 rounded border border-gray-200 p-4">
        <h2 className="mb-3 border-b border-gray-100 pb-2 text-base font-semibold text-gray-700">
          Localized Content
        </h2>
        <div className="flex flex-wrap gap-2">
          {LOCALES.map((locale) => (
            <button
              key={locale}
              type="button"
              onClick={() => {
                setActiveLocale(locale);
                setDescriptionPreview(null);
              }}
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
            {(listing.title[activeLocale] ?? '').trim() && (
              <button
                type="button"
                onClick={() => {
                  void translateField('title');
                }}
                disabled={translatingTitle}
                className="mt-2 rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60">
                {translatingTitle
                  ? 'Translating...'
                  : `Translate title from ${activeLocale.toUpperCase()} →`}
              </button>
            )}
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
            {(listing.description?.[activeLocale] ?? '').trim() && (
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    void improveDescription();
                  }}
                  disabled={improvingDescription || translatingDescription}
                  className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60">
                  {improvingDescription
                    ? 'Improving...'
                    : `Improve (${activeLocale.toUpperCase()})`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void translateField('description');
                  }}
                  disabled={translatingDescription || improvingDescription}
                  className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60">
                  {translatingDescription
                    ? 'Translating...'
                    : `Translate description from ${activeLocale.toUpperCase()} →`}
                </button>
              </div>
            )}
            {descriptionPreview !== null && (
              <div className="mt-3 rounded border border-blue-200 bg-blue-50 p-3 text-sm text-gray-700">
                <p className="mb-1 text-xs font-semibold uppercase text-blue-500">
                  Preview
                </p>
                <p className="whitespace-pre-wrap">{descriptionPreview}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setListing((prev) => ({
                        ...prev,
                        description: {
                          ...(prev.description ?? baseLocalizedText()),
                          [activeLocale]: descriptionPreview,
                        },
                      }));
                      setDescriptionPreview(null);
                    }}
                    className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700">
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => setDescriptionPreview(null)}
                    className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50">
                    Discard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded border border-gray-200 p-4">
        <h2 className="mb-3 border-b border-gray-100 pb-2 text-base font-semibold text-gray-700">
          Core Fields
        </h2>
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
            <p className="mb-2 block text-sm">Category</p>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {CATEGORY_OPTIONS.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 rounded border border-gray-200 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={listing.category.includes(option)}
                    onChange={(event) =>
                      setListing((prev) => ({
                        ...prev,
                        category: toggleArrayValue(
                          prev.category,
                          option,
                          event.target.checked
                        ),
                      }))
                    }
                  />
                  <span className="capitalize">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded border border-gray-200 p-4">
        <h2 className="mb-3 border-b border-gray-100 pb-2 text-base font-semibold text-gray-700">
          Address
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm">City</label>
            <input
              value={listing.address.city}
              onChange={(event) =>
                setListing((prev) => ({
                  ...prev,
                  address: { ...prev.address, city: event.target.value },
                }))
              }
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Zip code</label>
            <input
              value={listing.address.zipCode}
              onChange={(event) =>
                setListing((prev) => ({
                  ...prev,
                  address: { ...prev.address, zipCode: event.target.value },
                }))
              }
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Country</label>
            <input
              value={listing.address.country}
              onChange={(event) =>
                setListing((prev) => ({
                  ...prev,
                  address: { ...prev.address, country: event.target.value },
                }))
              }
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <div className="md:col-span-3">
            <label className="mb-1 block text-sm">Display address</label>
            <input
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
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Latitude</label>
            <input
              type="number"
              step="any"
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
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Longitude</label>
            <input
              type="number"
              step="any"
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
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded border border-gray-200 p-4">
        <h2 className="mb-3 border-b border-gray-100 pb-2 text-base font-semibold text-gray-700">
          Property Details
        </h2>
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
            <select
              value={listing.furnishing ?? ''}
              onChange={(event) =>
                setListing((prev) => ({
                  ...prev,
                  furnishing:
                    event.target.value === ''
                      ? undefined
                      : (event.target.value as Listing['furnishing']),
                }))
              }
              className="w-full rounded border border-gray-300 px-3 py-2">
              <option value="">-</option>
              {FURNISHING_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm">Condition</label>
            <select
              value={listing.condition ?? ''}
              onChange={(event) =>
                setListing((prev) => ({
                  ...prev,
                  condition:
                    event.target.value === ''
                      ? undefined
                      : (event.target.value as Listing['condition']),
                }))
              }
              className="w-full rounded border border-gray-300 px-3 py-2">
              <option value="">-</option>
              {CONDITION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm">Energy Rating</label>
            <select
              value={listing.energyRating ?? ''}
              onChange={(event) =>
                setListing((prev) => ({
                  ...prev,
                  energyRating:
                    event.target.value === ''
                      ? undefined
                      : (event.target.value as Listing['energyRating']),
                }))
              }
              className="w-full rounded border border-gray-300 px-3 py-2">
              <option value="">-</option>
              {ENERGY_RATING_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
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
        <h2 className="mb-3 border-b border-gray-100 pb-2 text-base font-semibold text-gray-700">
          Multi-select Arrays
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="mb-2 block text-sm">Features</p>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {FEATURE_OPTIONS.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 rounded border border-gray-200 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(listing.features?.includes(option))}
                    onChange={(event) =>
                      setListing((prev) => ({
                        ...prev,
                        features: toggleArrayValue(
                          prev.features as string[] | undefined,
                          option,
                          event.target.checked
                        ),
                      }))
                    }
                  />
                  {option}
                </label>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              <label className="mb-1 block text-sm text-gray-600">
                Other (comma separated)
              </label>
              <div className="flex gap-2">
                <input
                  placeholder="Add custom values, comma separated"
                  value={customArrayInputs.features}
                  onChange={(event) =>
                    setCustomArrayInputs((prev) => ({
                      ...prev,
                      features: event.target.value,
                    }))
                  }
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter') return;
                    event.preventDefault();
                    handleAddCustomArrayValues('features', FEATURE_OPTIONS);
                  }}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleAddCustomArrayValues('features', FEATURE_OPTIONS)
                  }
                  className="rounded border border-cyan-300 bg-cyan-50 px-3 py-2 text-sm text-cyan-700">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {getCustomListingValues(listing.features, FEATURE_OPTIONS).map(
                  (value) => (
                    <span
                      key={value.toLowerCase()}
                      className="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-800">
                      {value}
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveCustomArrayValue('features', value)
                        }
                        aria-label={`Remove custom feature ${value}`}
                        className="rounded-full bg-cyan-200 px-1 text-cyan-800">
                        x
                      </button>
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
          <div>
            <p className="mb-2 block text-sm">Amenities</p>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {AMENITY_OPTIONS.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 rounded border border-gray-200 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(listing.amenities?.includes(option))}
                    onChange={(event) =>
                      setListing((prev) => ({
                        ...prev,
                        amenities: toggleArrayValue(
                          prev.amenities as string[] | undefined,
                          option,
                          event.target.checked
                        ),
                      }))
                    }
                  />
                  {option}
                </label>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              <label className="mb-1 block text-sm text-gray-600">
                Other (comma separated)
              </label>
              <div className="flex gap-2">
                <input
                  placeholder="Add custom values, comma separated"
                  value={customArrayInputs.amenities}
                  onChange={(event) =>
                    setCustomArrayInputs((prev) => ({
                      ...prev,
                      amenities: event.target.value,
                    }))
                  }
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter') return;
                    event.preventDefault();
                    handleAddCustomArrayValues('amenities', AMENITY_OPTIONS);
                  }}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleAddCustomArrayValues('amenities', AMENITY_OPTIONS)
                  }
                  className="rounded border border-violet-300 bg-violet-50 px-3 py-2 text-sm text-violet-700">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {getCustomListingValues(listing.amenities, AMENITY_OPTIONS).map(
                  (value) => (
                    <span
                      key={value.toLowerCase()}
                      className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-800">
                      {value}
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveCustomArrayValue('amenities', value)
                        }
                        aria-label={`Remove custom amenity ${value}`}
                        className="rounded-full bg-violet-200 px-1 text-violet-800">
                        x
                      </button>
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
          <div>
            <p className="mb-2 block text-sm">Views</p>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {VIEW_OPTIONS.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 rounded border border-gray-200 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(listing.view?.includes(option))}
                    onChange={(event) =>
                      setListing((prev) => ({
                        ...prev,
                        view: toggleArrayValue(
                          prev.view as string[] | undefined,
                          option,
                          event.target.checked
                        ),
                      }))
                    }
                  />
                  {option}
                </label>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              <label className="mb-1 block text-sm text-gray-600">
                Other (comma separated)
              </label>
              <div className="flex gap-2">
                <input
                  placeholder="Add custom values, comma separated"
                  value={customArrayInputs.view}
                  onChange={(event) =>
                    setCustomArrayInputs((prev) => ({
                      ...prev,
                      view: event.target.value,
                    }))
                  }
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter') return;
                    event.preventDefault();
                    handleAddCustomArrayValues('view', VIEW_OPTIONS);
                  }}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleAddCustomArrayValues('view', VIEW_OPTIONS)
                  }
                  className="rounded border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {getCustomListingValues(listing.view, VIEW_OPTIONS).map(
                  (value) => (
                    <span
                      key={value.toLowerCase()}
                      className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                      {value}
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveCustomArrayValue('view', value)
                        }
                        aria-label={`Remove custom view ${value}`}
                        className="rounded-full bg-emerald-200 px-1 text-emerald-800">
                        x
                      </button>
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
          <div>
            <p className="mb-2 block text-sm">Suitable for</p>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {SUITABLE_FOR_OPTIONS.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 rounded border border-gray-200 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(listing.suitableFor?.includes(option))}
                    onChange={(event) =>
                      setListing((prev) => ({
                        ...prev,
                        suitableFor: toggleArrayValue(
                          prev.suitableFor as string[] | undefined,
                          option,
                          event.target.checked
                        ),
                      }))
                    }
                  />
                  {option}
                </label>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              <label className="mb-1 block text-sm text-gray-600">
                Other (comma separated)
              </label>
              <div className="flex gap-2">
                <input
                  placeholder="Add custom values, comma separated"
                  value={customArrayInputs.suitableFor}
                  onChange={(event) =>
                    setCustomArrayInputs((prev) => ({
                      ...prev,
                      suitableFor: event.target.value,
                    }))
                  }
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter') return;
                    event.preventDefault();
                    handleAddCustomArrayValues(
                      'suitableFor',
                      SUITABLE_FOR_OPTIONS
                    );
                  }}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleAddCustomArrayValues(
                      'suitableFor',
                      SUITABLE_FOR_OPTIONS
                    )
                  }
                  className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {getCustomListingValues(
                  listing.suitableFor,
                  SUITABLE_FOR_OPTIONS
                ).map((value) => (
                  <span
                    key={value.toLowerCase()}
                    className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                    {value}
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveCustomArrayValue('suitableFor', value)
                      }
                      aria-label={`Remove custom suitable for ${value}`}
                      className="rounded-full bg-amber-200 px-1 text-amber-800">
                      x
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div>
            <p className="mb-2 block text-sm">Tags</p>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  placeholder="Add custom values, comma separated"
                  value={customArrayInputs.tags}
                  onChange={(event) =>
                    setCustomArrayInputs((prev) => ({
                      ...prev,
                      tags: event.target.value,
                    }))
                  }
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter') return;
                    event.preventDefault();
                    handleAddCustomArrayValues('tags', []);
                  }}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomArrayValues('tags', [])}
                  className="rounded border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {getCustomListingValues(listing.tags, []).map((value) => (
                  <span
                    key={value.toLowerCase()}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-800">
                    {value}
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveCustomArrayValue('tags', value)
                      }
                      aria-label={`Remove tag ${value}`}
                      className="rounded-full bg-slate-200 px-1 text-slate-800">
                      x
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded border border-gray-200 p-4">
        <h2 className="mb-3 border-b border-gray-100 pb-2 text-base font-semibold text-gray-700">
          Media
        </h2>
        {mode === 'create' ? (
          <>
            <label className="mb-2 block text-sm text-gray-600">
              Choose photos and videos (uploaded to Sevalla after listing
              creation)
            </label>
            <p className="text-xs text-gray-500">
              Media files up to {formatFileSize(MAX_MEDIA_FILE_SIZE_BYTES)} are
              allowed.
            </p>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleMediaFilesChange}
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
            {mediaFiles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {mediaFiles.length} file{mediaFiles.length === 1 ? '' : 's'}{' '}
                    selected
                  </p>
                  <button
                    type="button"
                    onClick={() => setMediaFiles(clearMediaFiles())}
                    className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50">
                    Clear all
                  </button>
                </div>
                <ul className="space-y-2">
                  {mediaFiles.map((file) => {
                    const fileKey = getMediaFileKey(file);
                    return (
                      <li
                        key={fileKey}
                        className="flex items-center justify-between rounded border border-gray-200 px-3 py-2 text-sm">
                        <div className="min-w-0">
                          <p className="truncate text-gray-800">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {file.type || 'unknown'} -{' '}
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMediaFile(fileKey)}
                          className="ml-3 rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                          aria-label={`Remove ${file.name}`}>
                          x
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        ) : (
          <>
            <label className="flex cursor-pointer items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm text-gray-600 hover:bg-gray-100">
              <span>
                {uploading ? 'Uploading media...' : 'Click to upload media'}
              </span>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  if (files.length === 0) return;
                  void (async () => {
                    for (const file of files) {
                      await handleMediaUpload(file);
                    }
                    event.target.value = '';
                  })();
                }}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500">
              Media files up to {formatFileSize(MAX_MEDIA_FILE_SIZE_BYTES)} are
              allowed.
            </p>
            {uploadingMediaName ? (
              <p className="text-xs text-gray-500">
                Uploading:{' '}
                <span className="font-medium">{uploadingMediaName}</span>
              </p>
            ) : null}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Images</h3>
              {(listing.images ?? []).length === 0 ? (
                <p className="text-sm text-gray-500">No images uploaded.</p>
              ) : (
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
                        onClick={() => handleMediaDelete('image', image)}
                        className="rounded border border-red-300 px-2 py-1 text-xs text-red-600">
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Videos</h3>
              {(listing.videos ?? []).length === 0 ? (
                <p className="text-sm text-gray-500">No videos uploaded.</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {(listing.videos ?? []).map((video) => (
                    <div
                      key={video.url}
                      className="rounded border border-gray-200 p-3">
                      <video
                        src={video.url}
                        controls
                        className="mb-2 h-28 w-full rounded object-cover"
                      />
                      <p className="mb-2 truncate text-sm">{video.name}</p>
                      <button
                        type="button"
                        onClick={() => handleMediaDelete('video', video)}
                        className="rounded border border-red-300 px-2 py-1 text-xs text-red-600">
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </section>

      <section className="space-y-3 rounded border border-gray-200 p-4">
        <h2 className="mb-3 border-b border-gray-100 pb-2 text-base font-semibold text-gray-700">
          Status
        </h2>
        <div>
          <label className="mb-1 block text-sm">Listing status</label>
          <select
            value={listing.status ?? 'active'}
            onChange={(event) =>
              setListing((prev) => ({
                ...prev,
                status: event.target.value as Listing['status'],
              }))
            }
            className="w-full rounded border border-gray-300 px-3 py-2 md:w-80">
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
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

      <button
        type="submit"
        disabled={isSubmitting || uploading}
        className="rounded bg-black px-5 py-2 text-white disabled:opacity-60">
        {isSubmitting || uploading
          ? uploading
            ? uploadingMediaName
              ? `Uploading ${uploadingMediaName}...`
              : 'Uploading media...'
            : 'Saving...'
          : mode === 'create'
            ? 'Create Listing'
            : 'Save Changes'}
      </button>
    </form>
  );
}
