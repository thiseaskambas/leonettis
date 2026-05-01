# Leonettis — Architecture

Real estate listing platform for properties in Paros, Greece. Supports browsing, filtering, and viewing property listings across 5 locales, plus a password-protected admin backend for managing listings, images, and data.

---

## Tech Stack

| Layer          | Technology                                                             |
| -------------- | ---------------------------------------------------------------------- |
| Framework      | Next.js 16 (App Router)                                                |
| Language       | TypeScript                                                             |
| UI             | React 19, HeroUI v3 (RAC-based), Tailwind CSS 4, Framer Motion, Swiper |
| Database       | MongoDB (via `mongodb` driver)                                         |
| Object storage | Sevalla (S3-compatible), `@aws-sdk/client-s3`                          |
| Auth           | `jose` — HS256 JWT stored in httpOnly cookie                           |
| i18n           | next-intl 4, 5 locales (en / fr / gr / de / it)                        |
| Email          | Resend                                                                 |
| AI translation | OpenAI (`gpt-4o-mini`)                                                 |
| Testing        | Vitest (Node environment)                                              |
| Icons          | lucide-react                                                           |

---

## Repository Layout

```
src/
  app/
    [locale]/                   # Public locale-scoped pages
      (properties)/
        buy/                    # Listings for sale
        rent/                   # Listings for rent
        property/[slug]/        # Property detail page
      contact/                  # Contact form + API
    admin/                      # Admin UI (password-protected)
      components/               # ListingForm, DeleteListingButton, AdminLogoutButton
      listings/[id]/edit/       # Edit listing page
      listings/new/             # Create listing page
      login/                    # Login page
    api/
      admin/                    # Admin REST API
        auth/login/             # POST — issue JWT cookie
        auth/logout/            # POST — clear JWT cookie
        listings/               # GET all, POST create
        listings/[id]/          # GET one, PUT update, DELETE
        listings/[id]/images/   # POST upload image
        listings/images/        # DELETE image
        seed/                   # POST seed from mock data
        translate/              # POST AI translation for admin form fields
      contact/                  # POST — send email via Resend
    lib/
      db/
        mongodb.ts              # MongoDB connection + collection helper
      definitions/
        listing.types.ts        # All TypeScript types
      helpers/
        admin-auth.ts           # JWT sign/verify, password check
        listing-admin-helpers.ts # Input sanitization, slug generation
        listing-helpers.ts      # DB lookups by slug/id, localization
        listing-search-params.ts # URL query param parser
        media-helpers.ts        # getMediaUrl, getMediaBlurDataURL
        sevalla-storage.ts      # S3 upload/delete
      services/
        listings-service.ts     # searchListings() with MongoDB query builder
    ui/
      ListingsFilters.tsx       # Client filter sidebar + mobile drawer
  i18n/
    routing.ts                  # Locale definitions and routing config
    navigation.ts               # Locale-aware Link, useRouter, redirect
messages/                       # Translation files: en.json, fr.json, gr.json, de.json, it.json
openapi/
  admin-api.yaml               # OpenAPI 3.1.0 spec for admin routes
proxy.ts                        # Next.js middleware — auth guard + i18n routing
```

---

## Environment Variables

Copy `.example.env` to `.env.local` and fill in all values before running locally.

### MongoDB

| Variable          | Required | Description                          |
| ----------------- | -------- | ------------------------------------ |
| `MONGODB_URI`     | Yes      | MongoDB Atlas connection string      |
| `MONGODB_DB_NAME` | No       | Database name (default: `leonettis`) |

### Admin authentication

| Variable           | Required | Description                                      |
| ------------------ | -------- | ------------------------------------------------ |
| `ADMIN_PASSWORD`   | Yes      | Plain-text password for admin login              |
| `ADMIN_JWT_SECRET` | Yes      | Secret for signing JWTs — must be 32+ characters |
| `OPENAI_API_KEY`   | Yes (translation endpoint) | API key for `/api/admin/translate` |

### Sevalla media storage

| Variable             | Required | Description                                  |
| -------------------- | -------- | -------------------------------------------- |
| `SEVALLA_ENDPOINT`   | Yes      | S3-compatible API endpoint URL               |
| `SEVALLA_BUCKET`     | Yes      | Bucket name                                  |
| `SEVALLA_ACCESS_KEY` | Yes      | S3 access key ID                             |
| `SEVALLA_SECRET_KEY` | Yes      | S3 secret access key                         |
| `SEVALLA_PUBLIC_URL` | Yes      | Public CDN/bucket base URL for serving media |

### Email

| Variable           | Required           | Description                               |
| ------------------ | ------------------ | ----------------------------------------- |
| `RESEND_API_KEY`   | Yes (contact form) | Resend API key                            |
| `CONTACT_EMAIL_TO` | Yes (contact form) | Recipient address for contact submissions |

### Media

| Variable                     | Required | Description                                                    |
| ---------------------------- | -------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_MEDIA_BASE_URL` | No       | Optional CDN base URL used by `getMediaUrl()` in media-helpers |

> The `SEVALLA_PUBLIC_URL` hostname is also added dynamically to `next.config.ts` `remotePatterns` so Next.js image optimization works with Sevalla-hosted images.

---

## Public-Facing App

### Routing & i18n

Locales are defined in [src/i18n/routing.ts](src/i18n/routing.ts):

| Code | Language          |
| ---- | ----------------- |
| `en` | English (default) |
| `fr` | Français          |
| `gr` | Ελληνικά          |
| `de` | Deutsch           |
| `it` | Italiano          |

`localePrefix: 'always'` means every public URL includes the locale segment, e.g. `/en/buy`, `/fr/rent`.

Always use `Link`, `useRouter`, and `redirect` from [src/i18n/navigation.ts](src/i18n/navigation.ts) — these are locale-aware wrappers. Never import from `next/navigation` or `next/link` directly in public pages.

**Translation pattern:**

- Server components: `const t = await getTranslations('namespace')`
- Client components: `const t = useTranslations('namespace')`

**Translation namespaces:**

| Namespace         | Used in              |
| ----------------- | -------------------- |
| `nav`             | Navigation / header  |
| `buy`             | Buy listings page    |
| `rent`            | Rent listings page   |
| `list-a-property` | List a property page |
| `property-type`   | Property type labels |
| `search-bar`      | Search bar component |
| `property`        | Property detail page |
| `contact`         | Contact form         |

### Buy and Rent Listing Pages

Both [src/app/[locale]/(properties)/buy/page.tsx](<src/app/[locale]/(properties)/buy/page.tsx>) and [src/app/[locale]/(properties)/rent/page.tsx](<src/app/[locale]/(properties)/rent/page.tsx>) follow the same pattern:

- Server components with `export const dynamic = 'force-dynamic'`
- Receive `searchParams` as a `Promise` (Next.js 16 async params)
- Call `parseSearchParams()` to normalize URL query params
- Call `searchListings()` to query MongoDB directly (no API hop)
- Localize each listing before rendering

```
URL ?category=residential&minPrice=100000
         │
         ▼
parseSearchParams(raw)               [listing-search-params.ts]
  normalizes string|string[]|undefined → typed ListingSearchParams
         │
         ▼
searchListings(params)               [listings-service.ts]
  builds MongoDB query with $in / $gte / $lte operators
         │
         ▼
MongoDB  listings collection
  .find(query).skip(skip).limit(limit).toArray()
         │
         ▼
getLocalizedListing(listing, locale) [listing-helpers.ts]
  resolves title/description for the current locale (fallback: en)
         │
         ▼
<ListingCard /> × N  +  <ListingsFilters />
```

### Property Detail Page

[src/app/[locale]/(properties)/property/[slug]/page.tsx](<src/app/[locale]/(properties)/property/[slug]/page.tsx>):

1. Calls `getListingBySlug(slug)` — returns `null` → `notFound()`
2. Builds translation maps for all enum labels (features, amenities, conditions, etc.) server-side
3. Renders five components: `PropertyHero`, `PropertyBreadcrumb`, `PropertyDetails`, `PropertyGallery`, `PropertyVideoGallery`

### Filter Component

[src/app/ui/ListingsFilters.tsx](src/app/ui/ListingsFilters.tsx) is a client component (`'use client'`).

**9 filter keys:** `category`, `propertyType`, `condition`, `furnishing`, `energyRating`, `viewType`, `features`, `amenities`, `suitableFor`

**Plus:** price range slider (0–2,000,000 EUR, step 10,000)

Filter state is read from the URL via `parseSearchParams()` on mount and written back via `router.push()` when the user applies filters. This makes filters bookmarkable and shareable.

Responsive layout: desktop sidebar / mobile Framer Motion portal drawer.

---

## Data Layer

### MongoDB Connection

[src/app/lib/db/mongodb.ts](src/app/lib/db/mongodb.ts)

- Uses a global cache (`globalThis.__mongoCache`) to share a single `MongoClient` across hot reloads in development and across serverless function invocations in production.
- Indexes are created once per process lifecycle (`indexesEnsured` flag): unique index on `slug` and unique index on `id`.
- Export: `getListingsCollection()` — returns a typed `Collection<Listing>`.

### Listing Schema

Defined in [src/app/lib/definitions/listing.types.ts](src/app/lib/definitions/listing.types.ts).

**Required fields on `Listing`:**

| Field          | Type                     | Notes                                          |
| -------------- | ------------------------ | ---------------------------------------------- |
| `id`           | `string`                 | UUID, generated on create                      |
| `slug`         | `string`                 | URL-safe, generated from `title.en`            |
| `title`        | `Record<Locale, string>` | One string per locale                          |
| `address`      | `Address`                | city, country, zipCode, coordinates required   |
| `listingType`  | `'buy' \| 'rent'`        |                                                |
| `category`     | `ListingCategory[]`      | Array — a listing can span multiple categories |
| `propertyType` | `PropertyType`           | Single value                                   |
| `publishedAt`  | `string`                 | ISO 8601                                       |
| `updatedAt`    | `string`                 | ISO 8601                                       |
| `tags`         | `string[]`               | Can be empty array                             |

**Key union types:**

| Type              | Values                                                                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `ListingCategory` | `commercial`, `residential`, `industrial`, `agricultural`                                                                        |
| `PropertyType`    | `apartment`, `field`, `house`, `land`, `business`, `garage`, `building`, `office`, `warehouse`                                   |
| `ViewType`        | Canonical values: `sea`, `mountain`, `city`, `countryside`, `lake`, `river`, `forest`, `park`, `beach`, `other`                   |
| `Amenities`       | Canonical values: `swimming pool`, `gym`, `jacuzzi`, `sauna`, `steam room`, `tennis court`, `golf course`, `parking`, `garage`, `terrace`, `other` |
| `Features`        | Canonical values: `air conditioning`, `heating`, `fireplace`, `stove`, `balcony`, `terrace`, `garden`, `parking`, `garage`, `other` |
| `Furnishing`      | `furnished`, `unfurnished`, `partially furnished`, `other`                                                                       |
| `SuitableFor`     | Canonical values: `family`, `couple`, `single`, `business`, `students`, `investment`, `embassy`, `vacation home`, `other`         |
| `EnergyRating`    | `A`–`G`                                                                                                                          |
| `Condition`       | `new`, `used`, `renovated`, `partially renovated`, `renovation needed`, `other`                                                  |

For admin-managed array fields (`features`, `amenities`, `view`, `suitableFor`), listings may also store custom free-text values in addition to these canonical options.

**`LocalizedListing`** extends `Listing` but with `title: string` and `description?: string` instead of `Record<Locale, string>`. Use this type whenever a component receives a listing that's already been localized.

**`ListingImage`:** `{ url: string; name: string; key?: string; description?: string }`.

**`ListingVideo`:** `{ url: string; name: string; key?: string; description?: string }`.

The `key` is the S3 object key for media uploaded through admin and is used for delete operations.

### Service Layer

**`searchListings(params: ListingSearchParams)`** — [src/app/lib/services/listings-service.ts](src/app/lib/services/listings-service.ts)

Builds a MongoDB filter from typed search params and returns a `PaginatedListings` object:

```typescript
interface PaginatedListings {
  listings: Listing[];
  total: number; // total matching documents
  page: number;
  limit: number;
  totalPages: number;
}
```

Defaults: page 1, limit 20. The `_id` field is projected out of all results.

**`getListingBySlug(slug)`** / **`getListingById(id)`** — [src/app/lib/helpers/listing-helpers.ts](src/app/lib/helpers/listing-helpers.ts)

Direct DB lookups. Return `null` if not found.

**`getLocalizedListing(listing, locale)`** — [src/app/lib/helpers/listing-helpers.ts](src/app/lib/helpers/listing-helpers.ts)

Synchronous. Spreads the `Listing` and resolves `title` and `description` to plain strings for the given locale, falling back to English.

---

## Admin System

### Middleware

[src/proxy.ts](src/proxy.ts) is the Next.js middleware (exported as `proxy`, registered via `middleware.ts` convention).

**Matcher:** all paths except `/_next`, `/_vercel`, and paths containing a dot (static assets).

**Routing logic:**

```
Incoming request
        │
        ├─ /admin/* or /api/admin/*
        │        │
        │        ├─ public path? (/admin/login, /api/admin/auth/login, /api/admin/auth/logout)
        │        │       └─ pass through
        │        │
        │        └─ read admin_token cookie → verifyAdminToken()
        │                 ├─ valid   → pass through
        │                 ├─ invalid + UI route  → redirect to /admin/login
        │                 └─ invalid + API route → 401 { error: 'Unauthorized' }
        │
        ├─ /api/* (non-admin)
        │       └─ pass through (no i18n processing)
        │
        └─ everything else
                └─ next-intl middleware (locale detection + prefix routing)
```

### Authentication Flow

[src/app/lib/helpers/admin-auth.ts](src/app/lib/helpers/admin-auth.ts)

```
POST /api/admin/auth/login  { password: "..." }
        │
        ▼
isValidAdminPassword(password)
  plain string comparison vs process.env.ADMIN_PASSWORD
        │ ✓ match
        ▼
signAdminToken()
  new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)                       ← ADMIN_JWT_SECRET (min 32 chars)
        │
        ▼
Set-Cookie: admin_token=<jwt>
  httpOnly: true
  sameSite: lax
  secure: true (production only)
  path: /
  maxAge: 7 days
        │
        ▼
Subsequent requests: middleware reads cookie → verifyAdminToken(token)
  jwtVerify(token, secret) → boolean
```

Logout clears the cookie by setting `maxAge: 0`.

### Admin CRUD API

All routes live under `/api/admin/`. The middleware protects all of them except login and logout.

#### Auth routes

| Method | Path                     | Body                   | Response                         |
| ------ | ------------------------ | ---------------------- | -------------------------------- |
| POST   | `/api/admin/auth/login`  | `{ password: string }` | `200 { ok: true }` + sets cookie |
| POST   | `/api/admin/auth/logout` | —                      | `200` + clears cookie            |

#### Listing routes

| Method | Path                       | Notes                                                                                                                                                                                                                                                       |
| ------ | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/admin/listings`      | All listings sorted by `publishedAt` desc. No pagination.                                                                                                                                                                                                   |
| POST   | `/api/admin/listings`      | Create. Required: `title.en`, `listingType`, `propertyType`. Generates `id` (UUID), `slug`, `publishedAt`, `updatedAt`. Defaults: `status: active`, `isFeatured/favorite/urgent: false`, arrays default to `[]`. Returns `201 { listing }`. |
| GET    | `/api/admin/listings/[id]` | Fetch single by custom `id` field (not MongoDB `_id`). Returns `404` if not found.                                                                                                                                                                          |
| PUT    | `/api/admin/listings/[id]` | Partial update. Sanitizes input. If `title.en` changed, regenerates slug. Updates `updatedAt`. Uses `findOneAndUpdate` with `returnDocument: 'after'`. Returns updated listing.                                                                             |
| DELETE | `/api/admin/listings/[id]` | Hard delete. Returns `204`.                                                                                                                                                                                                                                 |

#### Image routes

| Method | Path                              | Notes                                                                                                                                                                                                                                                                                 |
| ------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/admin/listings/[id]/images` | **Primary path for images** from the admin UI: `multipart/form-data` field `file`. Non-SVG raster images are resized (max width 1920px), encoded as WebP (quality 85), then uploaded to Sevalla; a tiny WebP blur sibling (`ico-{same-stem}.webp`, ~2% dimensions) is uploaded alongside for lazy-load placeholders. SVG images and videos are uploaded raw on this route if used. Max file size `500MB` (same as presign). Videos from the admin UI still use presign + direct PUT + finalize. |
| POST   | `/api/admin/listings/[id]/media/presign` | Validates `filename`, `contentType`, `size`, and listing existence. Enforces max file size `500MB` (`524288000` bytes). Returns signed Sevalla PUT URL + media metadata (`url`, `name`, `key`, `mediaType`) for direct browser upload.                                              |
| POST   | `/api/admin/listings/[id]/media/finalize` | Persists uploaded media metadata on listing after successful direct browser upload. Supports both images and videos.                                                                                                                                                              |
| DELETE | `/api/admin/listings/images`      | Body: `{ listingId, mediaType, mediaUrl, mediaKey }`. Removes the media reference from MongoDB and deletes the object from Sevalla by key. For images, also attempts deletion of the matching `ico-*` key (non-fatal if absent). Returns `200` with an explicit lifecycle confirmation message.                                                                                           |

#### Seed route

| Method | Path              | Notes                                                                                                                                                   |
| ------ | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/admin/seed` | One-time data import. Iterates `listingsData` mock array, skips existing listings (matched by `id`), inserts new ones. Returns `{ inserted, skipped }`. |

#### Translation route

| Method | Path                    | Notes                                                                                                                                                                                                                           |
| ------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/admin/translate`  | Body: `{ text, sourceLocale, field }`. Validates non-empty text and supported locale/field, calls OpenAI `gpt-4o-mini` in JSON mode, and returns `{ translations }` for all non-source locales (always overwrite behavior). |
| POST   | `/api/admin/improve-description` | Body: `{ text, locale }`. Validates non-empty text and supported locale, calls OpenAI `gpt-4o-mini`, and returns `{ improved }` in the same language as the input locale for preview-first acceptance in the admin form. |

### Media Upload Flow

```
Admin UI creates listing first, then uploads selected files.

Images (raster, not SVG):
  selection UX: additive picker, dedupe by file metadata, per-file remove, clear-all
  create-mode upload execution: each file is attempted independently; one failure does not short-circuit later files
              │
              ▼
POST /api/admin/listings/[id]/images  (multipart/form-data, field "file")
  validate type + size (<=500MB) + listing exists
  Sharp: resize max width 1920, WebP q85 → buffer (+ optional tiny ico-* WebP for blur)
  key: listings/{id}/images/{timestamp}-{basename}.webp
              │
              ▼
uploadToSevalla(key, webpBuffer, image/webp)   [sevalla-storage.ts]
  best-effort: upload ico-{timestamp}-{basename}.webp
              │
              ▼
MongoDB $push image { url, name, key } on listing

Videos (and any caller still using direct upload for images):
              │
              ▼
POST /api/admin/listings/[id]/media/presign
  validate file metadata (type + <=500MB + listing exists)
  create signed PutObject URL and deterministic media key
              │
              ▼
Browser PUT signedUploadUrl (file bytes sent directly to Sevalla)
              │
              ▼
POST /api/admin/listings/[id]/media/finalize
  persist { url, name, key, mediaType, contentType? } on listing

Server upload (same route handles SVG / video if posted as multipart):
POST /api/admin/listings/[id]/images
  validate file type: image/* or video/* (fallback to extension when File.type is missing)
  sanitize filename: lowercase, spaces→dashes, strip unsafe chars
              │
              ▼
uploadToSevalla(key, buffer, contentType)   [sevalla-storage.ts]
  key format: listings/{listingId}/{images|videos}/{Date.now()}-{sanitizedFilename}
  S3Client.send(PutObjectCommand)
              │
              ▼
Sevalla S3 bucket stores the object
  returns: `${SEVALLA_PUBLIC_URL}/${key}`
              │
              ▼
MongoDB:
  - image file: $push to listing.images[] as { url, name, key }
  - video file: $push to listing.videos[] as { url, name, key, contentType? }
              │
              ▼
DELETE /api/admin/listings/images:
  validates listing/media match, deletes object from Sevalla, then $pulls image/video reference by URL
              │
              ▼
Create redirect behavior:
  - if all uploads succeed -> /admin/listings/{id}/edit
  - if any upload fails   -> /admin/listings/{id}/edit?mediaUpload=failed
Edit form then shows a non-blocking warning banner and clears the query param.
```

### Compression Follow-up Scope

Direct upload for image/video transport is the quick win and does not include compression/transcoding.
Follow-up work should add:
- async transcoding worker (FFmpeg or managed service),
- video processing state on listing media (`pending`, `processing`, `ready`, `failed`),
- automatic swap from original upload key/URL to compressed delivery output.

### Input Sanitization

[src/app/lib/helpers/listing-admin-helpers.ts](src/app/lib/helpers/listing-admin-helpers.ts)

`sanitizeListingInput(payload: unknown): Partial<Listing>` processes every field of the raw JSON body from admin API routes before any DB operation.

**Per-field sanitizers:**

| Helper                    | Behaviour                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------ |
| `sanitizeLocaleRecord(v)` | Accepts object, extracts a string for each locale. Missing keys become empty string. |
| `sanitizeStringArray(v)`  | Accepts array, trims strings, filters empty. Returns `undefined` for non-arrays.     |
| `sanitizeNumber(v)`       | Rejects non-numbers and `NaN`.                                                       |
| `sanitizeBoolean(v)`      | Only passes through actual booleans.                                                 |

**Key rules:**

- Returns `Partial<Listing>` — undefined fields are omitted, making it safe to spread into a MongoDB `$set` for partial updates.
- Empty arrays (`[]`) are preserved, which signals the intent to clear a field.
- Image and video entries require both `url` and `name` as strings; invalid entries are dropped. The `key` field is preserved so S3 objects can still be deleted later. Video entries also preserve optional `contentType` so clients can render without hardcoded MIME assumptions.
- Legacy `videos: string[]` payloads are still accepted and normalized into `{ url, name }` objects during sanitization.

**`buildListingSlug(listing: Partial<Listing>): string`**

Generates a URL-safe slug from `title.en` (lowercase, spaces to dashes, special chars stripped). Falls back to a UUID-based slug if the title is empty.

### Admin UI Pages

All pages are inside [src/app/admin/](src/app/admin/).

| Path                        | Component type          | Description                                                                                                |
| --------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| `/admin`                    | Server, `force-dynamic` | Listings dashboard — table of all listings sorted by `updatedAt` desc. Direct MongoDB query.               |
| `/admin/login`              | Client                  | Password form. POSTs to `/api/admin/auth/login`. On success: `router.refresh()` + `router.push('/admin')`. |
| `/admin/listings/new`       | Server (shell)          | Renders empty `<ListingForm>`. Submission POSTs to `/api/admin/listings`.                                  |
| `/admin/listings/[id]/edit` | Server, fetches listing | Renders pre-populated `<ListingForm>`. Submission PUTs to `/api/admin/listings/[id]`.                      |

**Shared components:**

- **`ListingForm.tsx`** — large client component covering the full `Listing` schema: multi-locale text inputs, numeric fields, enum selects, boolean toggles, checkbox groups for enum arrays, and unified media upload/delete UI. Features, Amenities, Views, and Suitable for keep predefined checkboxes and also support custom comma-separated entries rendered as removable chips. Create mode keeps additive media queueing with dedupe/remove/clear before submit, attempts each queued upload independently, and redirects with a warning query signal on partial failures; edit mode supports immediate image/video uploads, per-item delete for both types, and shows a non-blocking warning when redirected from a partial create upload failure. The localized title input includes `Translate from <LOCALE> →` controls that call `/api/admin/translate` and overwrite all other locales, while the localized description input supports both `Improve (<LOCALE>)` preview-first rewriting via `/api/admin/improve-description` and `Translate description from <LOCALE> →` propagation.
- **`DeleteListingButton.tsx`** — inline confirm UI that calls `DELETE /api/admin/listings/[id]` and refreshes the dashboard on success.
- **`AdminLogoutButton.tsx`** — calls `POST /api/admin/auth/logout`, then redirects to `/admin/login`.

### Sevalla Storage Helper

[src/app/lib/helpers/sevalla-storage.ts](src/app/lib/helpers/sevalla-storage.ts)

- `S3Client` is a module-level singleton (created on first use, reused across calls).
- Config is validated lazily on first call — missing env vars throw immediately with a descriptive message.
- `forcePathStyle: true` is required for S3-compatible APIs that are not AWS.
- Public URL trailing slashes are stripped to ensure consistent key concatenation: `${publicUrl}/${key}`.

---

## Testing

**Runner:** Vitest, configured in [vitest.config.ts](vitest.config.ts).

- Environment: Node
- Glob: `src/**/*.test.ts`
- Globals enabled (no need to import `describe`, `it`, `expect`, `vi`)
- Path alias `@` resolves to `./src`

**Mocking pattern:** MongoDB is mocked at the module boundary via `vi.mock('@/app/lib/db/mongodb')`. Tests provide a fake collection with `vi.fn()` implementations of `findOne`, `insertOne`, `find`, etc.

**Test coverage by file:**

| File                                      | What's tested                                                                                                                                  |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `admin-auth.test.ts`                      | `isValidAdminPassword` (correct/incorrect/missing env), JWT sign→verify round-trip                                                             |
| `listing-admin-helpers.test.ts`           | `buildListingSlug` (normal, empty, existing slug, UUID fallback), `sanitizeListingInput` (field types, array clearing, image key preservation) |
| `listings-service.test.ts`                | `searchListings` — query construction for each filter type, price range, pagination math                                                       |
| `api/admin/listings/route.test.ts`        | POST create — required fields validation, 201 response shape                                                                                   |
| `api/admin/listings/[id]/route.test.ts`   | GET one, PUT update (slug regeneration), DELETE                                                                                                |
| `api/admin/listings/images/route.test.ts` | DELETE image — Sevalla + MongoDB cleanup                                                                                                       |
| `api/admin/auth/login/route.test.ts`      | Login — correct/incorrect password, cookie set                                                                                                 |
| `api/admin/seed/route.test.ts`            | Seed — insert/skip logic                                                                                                                       |
| `api/admin/translate/route.test.ts`       | Translation endpoint — payload validation, successful translation mapping, malformed model output handling                                     |

Run tests:

```bash
npx vitest run          # single run
npx vitest              # watch mode
```

---

## OpenAPI Spec

[openapi/admin-api.yaml](openapi/admin-api.yaml) — OpenAPI 3.1.0.

Covers all admin routes with request/response schemas, required fields, and enum values. Security scheme: `cookieAuth` (cookie name `admin_token`).

Schema components: `Listing`, `ListingInput`, `ListingImage`, `ListingImageWithKey`.

Use any OpenAPI viewer (Swagger UI, Scalar, Redoc) to browse it locally.

---

## Adding a New Listing Field

1. Add the type/union to [src/app/lib/definitions/listing.types.ts](src/app/lib/definitions/listing.types.ts).
2. Add sanitization logic to `sanitizeListingInput` in [src/app/lib/helpers/listing-admin-helpers.ts](src/app/lib/helpers/listing-admin-helpers.ts).
3. Add the field to the `listing` object constructed in the POST route [src/app/api/admin/listings/route.ts](src/app/api/admin/listings/route.ts).
4. Add a UI input to `ListingForm.tsx` in [src/app/admin/components/ListingForm.tsx](src/app/admin/components/ListingForm.tsx).
5. If filterable: add to `ListingSearchParams` in [src/app/lib/helpers/listing-search-params.ts](src/app/lib/helpers/listing-search-params.ts), add a `$in` clause in `searchListings`, and add a filter definition in `ListingsFilters.tsx`.
6. Update [openapi/admin-api.yaml](openapi/admin-api.yaml).
7. Add translations to all 5 `messages/*.json` files if the field has user-visible labels.
