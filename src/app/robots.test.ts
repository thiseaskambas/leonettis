import { afterEach, describe, expect, it } from 'vitest';

import robots from './robots';

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

describe('robots', () => {
  afterEach(() => {
    if (originalSiteUrl == null) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
    }
  });

  it('allows public crawling, blocks admin and API routes, and points to the sitemap', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://www.leonettis.com/';

    expect(robots()).toEqual({
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
      sitemap: 'https://www.leonettis.com/sitemap.xml',
    });
  });

  it('uses the non-production localhost fallback when no site URL is configured', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;

    expect(robots().sitemap).toBe('http://localhost:3000/sitemap.xml');
  });
});
