This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

Styled with :
https://v3.heroui.com/

Internationalization with :
https://next-intl.dev

## Project Notes

- Listings use `category` as a multi-value array in the listing model (`ListingCategory[]`), for example `['residential']` or `['residential', 'commercial']`.
- Category filtering matches listings when any listing category overlaps with selected category filters.

## Admin + MongoDB Setup

Install required packages:

```bash
npm install mongodb jose @aws-sdk/client-s3
```

### Required env vars

Set these in `.env.local` and in your Vercel project:

```bash
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=leonettis
ADMIN_PASSWORD=...
ADMIN_JWT_SECRET=... # 32+ characters
SEVALLA_ENDPOINT=https://...
SEVALLA_BUCKET=leonettis
SEVALLA_ACCESS_KEY=...
SEVALLA_SECRET_KEY=...
SEVALLA_PUBLIC_URL=https://...
```

### Routes

- Public localized pages continue to use `/{locale}/...`.
- Admin UI is not locale-prefixed:
  - `/admin/login`
  - `/admin`
  - `/admin/listings/new`
  - `/admin/listings/:id/edit`
- Admin APIs:
  - `POST /api/admin/auth/login`
  - `POST /api/admin/auth/logout`
  - `GET/POST /api/admin/listings`
  - `GET/PUT/DELETE /api/admin/listings/:id`
  - `POST /api/admin/listings/:id/images`
  - `POST /api/admin/listings/:id/media/presign`
  - `POST /api/admin/listings/:id/media/finalize`
  - `DELETE /api/admin/listings/images`
  - `POST /api/admin/seed`

### Seed MongoDB

Use the one-time seed endpoint after login:

```bash
curl -X POST http://localhost:3000/api/admin/seed --cookie "admin_token=..."
```

It inserts records from `src/app/lib/mock-data/listings-data.ts` if the listing `id` is not already present.

### API contract

OpenAPI spec for admin endpoints:

- `openapi/admin-api.yaml`

### Admin update behavior

- Sending `[]` for admin listing array fields in `PUT /api/admin/listings/:id` clears the stored values (for example `tags`, `features`, `amenities`, `view`, `suitableFor`, and `videos`).
- On `/admin/listings/new` and `/admin/listings/:id/edit`, Features/Amenities/Views/Suitable for keep predefined checkboxes and also support custom comma-separated values as removable chips (saved in the same arrays as string values).
- Listing image metadata preserves `images[].key` during listing create/update requests so uploaded object keys remain available for future deletes.
- `POST /api/admin/listings/:id/images` remains available for server-side uploads, accepts all image/video MIME types (with filename-extension fallback when `File.type` is missing), and persists `{ url, name, key, contentType? }` metadata.
- Large video uploads now use direct browser upload flow: `POST /api/admin/listings/:id/media/presign` -> browser `PUT` to signed Sevalla URL -> `POST /api/admin/listings/:id/media/finalize`.
- Direct upload presign enforces a hard 500MB max file size (`524288000` bytes).
- Compression/transcoding is intentionally deferred to a follow-up pipeline; the quick win focuses on reliable large upload transport + metadata persistence.
- The listing form uses a unified `Media` section: create mode keeps additive/deduplicated queueing before submit, while edit mode supports immediate image/video uploads and per-item delete for both media types.
- In create mode, media uploads are resilient per file: a failed file does not stop remaining selected files from being attempted.
- After create-mode partial media failures, redirect to edit includes `?mediaUpload=failed` and edit mode shows a non-blocking warning while keeping already uploaded files.
- `DELETE /api/admin/listings/images` removes image/video references from MongoDB and deletes the matching object from the Sevalla bucket.
- Property detail pages now render both a Photo Gallery and a dedicated Video Gallery section below it.

### Verification checklist

1. `npm run dev`
2. Login at `/admin/login`.
3. Create, edit, and delete a listing from `/admin`.
4. Create a listing from `/admin/listings/new` with mixed photo/video file selection and verify media appears after redirect to edit mode.
5. Force one file upload failure during create and verify later files are still attempted and successful uploads persist.
6. Verify `?mediaUpload=failed` appears only when at least one create-time upload fails and that edit mode shows a warning banner.
7. Delete both an image and a video in edit mode and verify DB reference cleanup plus Sevalla object deletion through API logs/tests.
8. Upload a large video (near 500MB) and verify direct upload + finalize flow succeeds without app-server buffering failures.
9. Confirm unauthorized calls to `/api/admin/*` return `401`.

Color palette link :
https://www.tints.dev/palette/v1:dGlmZnw4MUQ4RDB8MzAwfHB8MHwwfDB8MTAwfGF-dGlmZi1zYXR8MDBBREEyfDQwMHxwfDB8MHwwfDEwMHxhfnRpZmYtZ3JheXxFOEYzRjF8NTAwfHB8MHwwfDB8MTAwfG1-dGlmZi1waW5rfEYwNTVCMXw0MDB8cHwwfDB8MHwxMDB8YX5sZW9ufDdFRDhFMHwyMDB8cHwwfDB8MHwxMDB8YX5sZW9uLXBpbmt8Zjc2NmEwfDQwMHxwfDB8MHwwfDEwMHxhfmxlb24tc2F0fDU4ZTRlMHwyMDB8cHwwfDB8MHwxMDB8YX5sZW9uLWJsdWV8Mjk0ZWEwfDgwMHxwfDB8MHwwfDEwMHxh

Some buttons :
https://github.com/ibelick/buttons

Icons:
https://lucide.dev/
