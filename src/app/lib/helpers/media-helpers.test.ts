import { afterEach, describe, expect, it } from 'vitest';

import { getMediaBlurDataURL, getMediaUrl } from './media-helpers';

const originalMediaBaseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

afterEach(() => {
  if (originalMediaBaseUrl === undefined) {
    delete process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
    return;
  }

  process.env.NEXT_PUBLIC_MEDIA_BASE_URL = originalMediaBaseUrl;
});

describe('media-helpers', () => {
  it('returns absolute media URLs unchanged', () => {
    process.env.NEXT_PUBLIC_MEDIA_BASE_URL =
      'https://blogfeed-ar0uj.sevalla.storage';

    expect(
      getMediaUrl(
        'https://leonettis-lwqcz.sevalla.storage/listings/id/images/photo.jpg'
      )
    ).toBe(
      'https://leonettis-lwqcz.sevalla.storage/listings/id/images/photo.jpg'
    );
  });

  it('builds media URL from relative path when base URL is configured', () => {
    process.env.NEXT_PUBLIC_MEDIA_BASE_URL =
      'https://blogfeed-ar0uj.sevalla.storage/';

    expect(getMediaUrl('/listings/id/images/photo.jpg')).toBe(
      'https://blogfeed-ar0uj.sevalla.storage/listings/id/images/photo.jpg'
    );
  });

  it('builds blur URL for relative path using configured base URL', () => {
    process.env.NEXT_PUBLIC_MEDIA_BASE_URL =
      'https://blogfeed-ar0uj.sevalla.storage/';

    expect(getMediaBlurDataURL('/listings/id/images/photo.jpg')).toBe(
      'https://blogfeed-ar0uj.sevalla.storage/listings/id/images/ico-photo.jpg'
    );
  });

  it('builds blur URL for absolute path without re-prefixing base URL', () => {
    process.env.NEXT_PUBLIC_MEDIA_BASE_URL =
      'https://blogfeed-ar0uj.sevalla.storage/';

    expect(
      getMediaBlurDataURL(
        'https://leonettis-lwqcz.sevalla.storage/listings/id/images/photo.jpg'
      )
    ).toBe(
      'https://leonettis-lwqcz.sevalla.storage/listings/id/images/ico-photo.jpg'
    );
  });
});
