'use client';

import HeroCarousel from './components/HeroCarousel';
import HeroSearchOverlayDesktop from './components/HeroSearchOverlayDesktop';
import HeroSearchOverlayMobile from './components/HeroSearchOverlayMobile';

export default function Home() {
  const slides: { type: 'image' | 'video'; src: string }[] = [
    { type: 'video', src: 'homepage/lowflight.mov' },
    { type: 'video', src: 'homepage/makronisi.mov' },
    { type: 'video', src: 'homepage/drios.mov' },
  ];

  return (
    <main className="dark:bg-tiff-gray-950 min-h-screen">
      <div className="relative">
        <HeroCarousel slides={slides} />
        {/* Overlay: centered on top of Swiper */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="hidden md:block">
            <HeroSearchOverlayDesktop />
          </div>
          <div className="md:hidden">
            <HeroSearchOverlayMobile />
          </div>
        </div>
      </div>
    </main>
  );
}
