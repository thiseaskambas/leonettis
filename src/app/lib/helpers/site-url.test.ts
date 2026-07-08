import { describe, expect, it } from 'vitest';

import { getSiteUrl } from './site-url';

describe('getSiteUrl', () => {
  it('requires an absolute http(s) site origin and strips trailing slashes', () => {
    expect(getSiteUrl({ rawSiteUrl: ' https://www.leonettis.com/// ' })).toBe(
      'https://www.leonettis.com'
    );
    expect(getSiteUrl({ rawSiteUrl: 'http://localhost:3000/' })).toBe(
      'http://localhost:3000'
    );
    expect(() => getSiteUrl({ rawSiteUrl: 'ftp://www.leonettis.com' })).toThrow(
      'NEXT_PUBLIC_SITE_URL must be an absolute http(s) URL'
    );
    expect(() =>
      getSiteUrl({ rawSiteUrl: 'https://www.leonettis.com/properties' })
    ).toThrow(
      'NEXT_PUBLIC_SITE_URL must be an origin without path, query, or hash'
    );
    expect(() =>
      getSiteUrl({ rawSiteUrl: 'https://www.leonettis.com?preview=1' })
    ).toThrow(
      'NEXT_PUBLIC_SITE_URL must be an origin without path, query, or hash'
    );
  });

  it('falls back to localhost outside production when missing', () => {
    expect(getSiteUrl({ rawSiteUrl: undefined, nodeEnv: 'test' })).toBe(
      'http://localhost:3000'
    );
  });

  it('throws a clear production error when missing', () => {
    expect(() =>
      getSiteUrl({ rawSiteUrl: undefined, nodeEnv: 'production' })
    ).toThrow('NEXT_PUBLIC_SITE_URL is not configured');
  });
});
