'use client';

import HeroCarousel from './HeroCarousel';
import HeroSearchOverlayDesktop from './HeroSearchOverlayDesktop';
import HeroSearchOverlayMobile from './HeroSearchOverlayMobile';

export default function HomeClient() {
  const slides: { type: 'image' | 'video'; src: string }[] = [
    { type: 'video', src: 'homepage/lowflight.mov' },
    { type: 'video', src: 'homepage/makronisi.mov' },
    { type: 'video', src: 'homepage/drios.mov' },
    { type: 'video', src: 'homepage/marpissa.mov' },
  ];

  return (
    <main className="dark:bg-tiff-gray-950 min-h-screen">
      <div className="relative">
        <HeroCarousel slides={slides} />
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
