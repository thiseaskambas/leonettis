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
- Listing image metadata preserves `images[].key` during listing create/update requests so uploaded object keys remain available for future deletes.

### Verification checklist

1. `npm run dev`
2. Login at `/admin/login`.
3. Create, edit, and delete a listing from `/admin`.
4. Upload and remove listing images in edit mode.
5. Confirm unauthorized calls to `/api/admin/*` return `401`.

Color palette link :
https://www.tints.dev/palette/v1:dGlmZnw4MUQ4RDB8MzAwfHB8MHwwfDB8MTAwfGF-dGlmZi1zYXR8MDBBREEyfDQwMHxwfDB8MHwwfDEwMHxhfnRpZmYtZ3JheXxFOEYzRjF8NTAwfHB8MHwwfDB8MTAwfG1-dGlmZi1waW5rfEYwNTVCMXw0MDB8cHwwfDB8MHwxMDB8YX5sZW9ufDdFRDhFMHwyMDB8cHwwfDB8MHwxMDB8YX5sZW9uLXBpbmt8Zjc2NmEwfDQwMHxwfDB8MHwwfDEwMHxhfmxlb24tc2F0fDU4ZTRlMHwyMDB8cHwwfDB8MHwxMDB8YX5sZW9uLWJsdWV8Mjk0ZWEwfDgwMHxwfDB8MHwwfDEwMHxh

Some buttons :
https://github.com/ibelick/buttons

Icons:
https://lucide.dev/
