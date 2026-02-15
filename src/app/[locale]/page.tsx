'use client';

import { useMediaQuery } from '@heroui/react';

import HeroCarousel from './components/HeroCarousel';
import HeroSearchOverlayDesktop from './components/HeroSearchOverlayDesktop';
import HeroSearchOverlayMobile from './components/HeroSearchOverlayMobile';

export default function Home() {
  const slides: { type: 'image' | 'video'; src: string }[] = [
    { type: 'image', src: 'images/leonettis/homepage/1.webp' },
    { type: 'video', src: 'images/leonettis/homepage/1.mov' },
    { type: 'video', src: 'images/leonettis/homepage/2.mov' },
    { type: 'image', src: 'images/leonettis/homepage/2.webp' },
    { type: 'image', src: 'images/leonettis/homepage/3.webp' },
  ];

  const isDesktop = useMediaQuery('(min-width: 768px)');

  // Prevent hydration mismatch: render nothing or a neutral placeholder until we know
  if (isDesktop === null) {
    return <div className="pointer-events-auto -mt-52 h-24" />; // placeholder to avoid layout shift
  }

  return (
    <main className="dark:bg-tiff-gray-950 min-h-screen">
      <div className="relative">
        <HeroCarousel slides={slides} />
        {/* Overlay: centered on top of Swiper */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          {isDesktop ? (
            <HeroSearchOverlayDesktop />
          ) : (
            <HeroSearchOverlayMobile />
          )}
        </div>
      </div>
    </main>
  );
}
