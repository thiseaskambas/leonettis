'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { getMediaUrl } from '@/app/lib/helpers/media-helpers';

interface PropertyGalleryProps {
  images: string[];
  title: string;
  galleryLabel: string;
  closeLabel: string;
}

export default function PropertyGallery({
  images,
  title,
  galleryLabel,
  closeLabel,
}: PropertyGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const goToPrev = useCallback(() => {
    setSelectedIndex((prev) =>
      prev === null ? null : (prev - 1 + images.length) % images.length
    );
  }, [images.length]);

  const goToNext = useCallback(() => {
    setSelectedIndex((prev) =>
      prev === null ? null : (prev + 1) % images.length
    );
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedIndex, goToPrev, goToNext]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedIndex]);

  if (!images.length) return null;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xs font-semibold tracking-widest text-gray-400 uppercase dark:text-gray-500">
        {galleryLabel}
      </h2>

      {/* Desktop: 3-column grid */}
      <div className="hidden grid-cols-3 gap-3 md:grid">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => openLightbox(index)}
            className="group relative aspect-4/3 w-full cursor-pointer overflow-hidden rounded-xl focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:outline-none dark:focus-visible:ring-white">
            <Image
              src={getMediaUrl(image)}
              alt={`${title} — ${index + 1}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 1280px) 33vw, 400px"
              loading={index < 6 ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
          </button>
        ))}
      </div>

      {/* Mobile: card-style Swiper (shows peek of next slide) */}
      <div className="md:hidden">
        <Swiper
          slidesPerView={1.25}
          spaceBetween={12}
          centeredSlides={false}
          pagination={{ clickable: true, dynamicBullets: true }}
          navigation={false}
          modules={[Pagination, Navigation]}
          className="mySwiper pb-8!">
          {images.map((image, index) => (
            <SwiperSlide key={index} className="h-auto!">
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl">
                <Image
                  src={getMediaUrl(image)}
                  alt={`${title} — ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80vw"
                  loading={index < 3 ? 'eager' : 'lazy'}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Lightbox (desktop only) */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 hidden items-center justify-center bg-black/92 md:flex"
          onClick={closeLightbox}>
          {/* Close button */}
          <button
            onClick={closeLightbox}
            aria-label={closeLabel}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25">
            <X className="h-5 w-5" />
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            {selectedIndex + 1} / {images.length}
          </div>

          {/* Prev button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            aria-label="Previous image"
            className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25">
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Main image */}
          <div
            className="relative max-h-[90vh] max-w-[90vw] flex-shrink-0"
            style={{ aspectRatio: 'auto' }}
            onClick={(e) => e.stopPropagation()}>
            <Image
              src={getMediaUrl(images[selectedIndex])}
              alt={`${title} — ${selectedIndex + 1}`}
              width={1600}
              height={1200}
              className="max-h-[90vh] w-auto max-w-[90vw] rounded-xl object-contain shadow-2xl"
              priority
            />
          </div>

          {/* Next button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            aria-label="Next image"
            className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25">
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
}
