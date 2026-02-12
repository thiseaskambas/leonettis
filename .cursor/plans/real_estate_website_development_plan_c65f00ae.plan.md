---
name: Real Estate Website Development Plan
overview: A comprehensive plan to build a multilingual, responsive real estate website with dark/light mode, SEO optimization, and content management via JSON files.
todos:
  - id: setup-config
    content: Install dependencies (next-themes, lucide-react) and configure providers
    status: pending
  - id: data-layer
    content: Define TypeScript interfaces and mock JSON data for Listings and Blog
    status: pending
  - id: ui-layout
    content: Create Layout components (NavBar, Footer, ThemeSwitcher)
    status: pending
  - id: ui-cards
    content: Implement Listing and Blog card components
    status: pending
  - id: pages-dev
    content: Develop Pages (Home, Buy, Rent, Sell, Blog, About, Contact)
    status: pending
  - id: seo-setup
    content: Implement SEO metadata and sitemap
    status: pending
isProject: false
---

# Real Estate Website Development Plan

## 1. Project Setup & Configuration

- **Dependencies:** Install `next-themes` for color modes and `lucide-react` for icons.
- **Theming:**
- Configure `next-themes` with `ThemeProvider` to handle Light/Dark modes.
- Setup HeroUI provider.
- Define color palettes in Tailwind config to support future "color themes" (e.g., using CSS variables).
- **SEO:** Configure `next-sitemap` or a basic `sitemap.ts` and `robots.ts`.

## 2. Data Structure (Content Layer)

- **Types:** Define TypeScript interfaces in `src/app/lib/definitions.ts`:
- `Listing` (id, type [buy/rent], price, location, specs, description, images, etc.)
- `BlogPost` (slug, title, date, author, content, excerpt, tags)
- **Data:** Populate `src/app/lib/listings-data.ts` and `src/app/lib/blog-data.ts` with sample JSON data.
- **Accessors:** Create helper functions to fetch/filter data (e.g., `getListings({ type: 'buy' })`).

## 3. UI Components Implementation

- **Layout:**
- `NavBar`: Responsive navigation with Locale Switcher and Theme Switcher.
- `Footer`: Links, copyright, social icons.
- `ThemeSwitcher`: Component to toggle between Light/Dark modes.
- **Features:**
- `PropertyCard`: To display listing previews (Image, Price, Address, Specs).
- `BlogCard`: For blog post previews.
- `FilterBar`: Basic filtering for the properties page (Price range, etc. - _Basic version for now_).

## 4. Page Development

- **Home (`/`)**: Hero section, Featured Listings, Latest Blog Posts.
- **Properties (`/buy`, `/rent`)**: Grid of `PropertyCard`s filtered by type.
- **Sell (`/sell`)**: Informational page with a contact form/CTA.
- **Blog (`/blog`)**: List of blog posts.
- **Blog Post (`/blog/[slug]`)**: Individual blog post page.
- **Static Pages (`/about`, `/contact`)**: Content with i18n support.

## 5. SEO & Optimization

- Implement Next.js `Metadata` API for dynamic titles and descriptions per page/locale.
- Ensure semantic HTML tags for accessibility and SEO.
- Verify Responsive Design on mobile/tablet/desktop.

## 6. Future-Proofing (PWA & API preparation)

- Ensure data fetching functions are isolated so they can be easily swapped for API calls later.
- Add manifest file for basic PWA readiness.
