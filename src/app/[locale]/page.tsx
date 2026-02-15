'use client';

import HeroCarousel from './components/HeroCarousel';
import HeroSearchOverlay from './components/HeroSearchOverlay';

export default function Home() {
  const slides: { type: 'image' | 'video'; src: string }[] = [
    { type: 'image', src: 'images/leonettis/homepage/1.webp' },
    { type: 'video', src: 'images/leonettis/homepage/1.mov' },
    { type: 'video', src: 'images/leonettis/homepage/2.mov' },
    { type: 'image', src: 'images/leonettis/homepage/2.webp' },
    { type: 'image', src: 'images/leonettis/homepage/3.webp' },
  ];

  return (
    <main className="dark:bg-tiff-gray-950 min-h-screen">
      <div className="relative">
        <HeroCarousel slides={slides} />
        {/* Overlay: centered on top of Swiper */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <HeroSearchOverlay />
        </div>
      </div>
    </main>
  );
}
