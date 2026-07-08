import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { getSitemapListings } = vi.hoisted(() => ({
  getSitemapListings: vi.fn(),
}));

vi.mock('@/app/lib/services/listings-service', () => ({
  getSitemapListings,
}));

import sitemap, {
  buildLanguageAlternates,
  buildPropertySitemapEntries,
  buildStaticSitemapEntries,
  getRequiredSiteUrl,
  resolveAbsoluteHttpUrl,
} from './sitemap';

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const originalMediaBaseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

const localizedTitle = {
  en: 'Paros Villa',
  fr: 'Villa a Paros',
  gr: 'Βίλα στην Πάρο',
  de: 'Villa auf Paros',
  it: 'Villa a Paros',
};

const localizedDescription = {
  en: 'Sea view villa',
  fr: 'Villa avec vue mer',
  gr: 'Βίλα με θέα στη θάλασσα',
  de: 'Villa mit Meerblick',
  it: 'Villa vista mare',
};

describe('sitemap helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  });

  afterEach(() => {
    if (originalSiteUrl == null) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
    }

    if (originalMediaBaseUrl == null) {
      delete process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
    } else {
      process.env.NEXT_PUBLIC_MEDIA_BASE_URL = originalMediaBaseUrl;
    }
  });

  it('requires an absolute http(s) site URL and strips trailing slashes', () => {
    expect(getRequiredSiteUrl(' https://www.leonettis.com/// ')).toBe(
      'https://www.leonettis.com'
    );
    expect(() => getRequiredSiteUrl()).toThrow(
      'NEXT_PUBLIC_SITE_URL is not configured'
    );
    expect(() => getRequiredSiteUrl('ftp://www.leonettis.com')).toThrow(
      'NEXT_PUBLIC_SITE_URL must be an absolute http(s) URL'
    );
    expect(() =>
      getRequiredSiteUrl('https://www.leonettis.com?preview=1')
    ).toThrow('NEXT_PUBLIC_SITE_URL must not include query or hash');
  });

  it('builds hreflang alternates with el-GR and x-default', () => {
    expect(
      buildLanguageAlternates(
        'https://www.leonettis.com',
        '/property/paros-villa'
      )
    ).toEqual({
      en: 'https://www.leonettis.com/en/property/paros-villa',
      fr: 'https://www.leonettis.com/fr/property/paros-villa',
      'el-GR': 'https://www.leonettis.com/gr/property/paros-villa',
      de: 'https://www.leonettis.com/de/property/paros-villa',
      it: 'https://www.leonettis.com/it/property/paros-villa',
      'x-default': 'https://www.leonettis.com/en/property/paros-villa',
    });
  });

  it('expands only live localized static pages', () => {
    const entries = buildStaticSitemapEntries('https://www.leonettis.com');

    expect(entries).toHaveLength(30);
    expect(entries.map((entry) => entry.url)).toContain(
      'https://www.leonettis.com/en'
    );
    expect(entries.map((entry) => entry.url)).toContain(
      'https://www.leonettis.com/it/list-a-property'
    );
    expect(entries.some((entry) => entry.url.includes('/blog'))).toBe(false);
    expect(entries.some((entry) => entry.url.includes('/admin'))).toBe(false);
  });

  it('resolves media URLs to absolute http(s) URLs', () => {
    process.env.NEXT_PUBLIC_MEDIA_BASE_URL =
      'https://media.leonettis.com/base/';

    expect(
      resolveAbsoluteHttpUrl('/photos/home.jpg', 'https://www.leonettis.com')
    ).toBe('https://media.leonettis.com/base/photos/home.jpg');
    expect(
      resolveAbsoluteHttpUrl('https://cdn.example.com/a.jpg', 'https://x.test')
    ).toBe('https://cdn.example.com/a.jpg');
    expect(
      resolveAbsoluteHttpUrl('javascript:alert(1)', 'https://x.test')
    ).toBeNull();
  });

  it('expands property pages with dates, alternates, images, and eligible videos', () => {
    const entries = buildPropertySitemapEntries('https://www.leonettis.com', [
      {
        slug: 'paros-villa',
        title: localizedTitle,
        description: localizedDescription,
        updatedAt: '2026-01-02T00:00:00.000Z',
        publishedAt: '2026-01-01T00:00:00.000Z',
        images: [
          { url: 'https://cdn.example.com/house.jpg', name: 'house.jpg' },
          { url: '/photos/local.jpg', name: 'local.jpg' },
          { url: 'javascript:alert(1)', name: 'bad.jpg' },
        ],
        videos: [
          { url: 'https://cdn.example.com/tour.mp4', name: 'tour.mp4' },
          { url: 'ftp://cdn.example.com/bad.mp4', name: 'bad.mp4' },
        ],
      },
    ]);

    expect(entries).toHaveLength(5);

    const greekEntry = entries.find(
      (entry) =>
        entry.url === 'https://www.leonettis.com/gr/property/paros-villa'
    );

    expect(greekEntry).toMatchObject({
      lastModified: '2026-01-02T00:00:00.000Z',
      images: [
        'https://cdn.example.com/house.jpg',
        'https://www.leonettis.com/photos/local.jpg',
      ],
      videos: [
        {
          title: 'Βίλα στην Πάρο',
          description: 'Βίλα με θέα στη θάλασσα',
          thumbnail_loc: 'https://cdn.example.com/house.jpg',
          content_loc: 'https://cdn.example.com/tour.mp4',
        },
      ],
    });
    expect(greekEntry?.alternates?.languages?.['el-GR']).toBe(
      'https://www.leonettis.com/gr/property/paros-villa'
    );
  });

  it('falls back to publishedAt and omits videos without a thumbnail image', () => {
    const [entry] = buildPropertySitemapEntries('https://www.leonettis.com', [
      {
        slug: 'no-media',
        title: localizedTitle,
        description: undefined,
        updatedAt: '',
        publishedAt: '2026-02-01T00:00:00.000Z',
        videos: [{ url: 'https://cdn.example.com/tour.mp4', name: 'tour.mp4' }],
      },
    ]);

    expect(entry.lastModified).toBe('2026-02-01T00:00:00.000Z');
    expect(entry.videos).toBeUndefined();
  });

  it('builds the default sitemap without a live database in tests', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://www.leonettis.com/';
    getSitemapListings.mockResolvedValueOnce([
      {
        slug: 'paros-villa',
        title: localizedTitle,
        description: localizedDescription,
        updatedAt: '2026-01-02T00:00:00.000Z',
        publishedAt: '2026-01-01T00:00:00.000Z',
      },
    ]);

    const entries = await sitemap();

    expect(getSitemapListings).toHaveBeenCalledTimes(1);
    expect(entries).toHaveLength(35);
    expect(entries.map((entry) => entry.url)).toContain(
      'https://www.leonettis.com/en/property/paros-villa'
    );
  });
});
