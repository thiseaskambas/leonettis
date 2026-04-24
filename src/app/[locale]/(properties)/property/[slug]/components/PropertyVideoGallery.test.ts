import { renderToStaticMarkup } from 'react-dom/server';
import { createElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('swiper/react', () => ({
  Swiper: ({ children }: { children: ReactNode }) => createElement('div', null, children),
  SwiperSlide: ({ children }: { children: ReactNode }) =>
    createElement('div', null, children),
}));

vi.mock('swiper/modules', () => ({
  Navigation: {},
  Pagination: {},
}));

vi.mock('lucide-react', () => ({
  ChevronLeft: () => null,
  ChevronRight: () => null,
  Play: () => null,
  X: () => null,
}));

vi.mock('@/app/lib/helpers/media-helpers', () => ({
  getMediaUrl: (path: string) => `https://media.example.com/${path.replace(/^\//, '')}`,
}));

import PropertyVideoGallery from './PropertyVideoGallery';

describe('PropertyVideoGallery', () => {
  it('renders nothing when videos array is empty', () => {
    const html = renderToStaticMarkup(
      createElement(PropertyVideoGallery, {
        videos: [],
        galleryLabel: 'Video Gallery',
        closeLabel: 'Close',
      })
    );

    expect(html).toBe('');
  });

  it('renders gallery label and video markup', () => {
    const html = renderToStaticMarkup(
      createElement(PropertyVideoGallery, {
        videos: [
          {
            url: 'videos/clip.webm',
            name: 'clip.webm',
            contentType: 'video/webm',
          },
        ],
        galleryLabel: 'Video Gallery',
        closeLabel: 'Close',
      })
    );

    expect(html).toContain('Video Gallery');
    expect(html).toContain('https://media.example.com/videos/clip.webm');
    expect(html).toContain('<video');
  });
});
