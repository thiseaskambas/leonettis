'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import type { ListingImage } from '@/app/lib/definitions/listing.types';
import { getMediaUrl } from '@/app/lib/helpers/media-helpers';

interface PropertyGalleryProps {
  images: ListingImage[];
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
  const swiperRef = useRef<SwiperType | null>(null);

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  // Keyboard navigation
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') swiperRef.current?.slidePrev();
      if (e.key === 'ArrowRight') swiperRef.current?.slideNext();
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedIndex]);

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
              src={getMediaUrl(image.url)}
              alt={image.name || `${title} — ${index + 1}`}
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
              <button
                type="button"
                onClick={() => openLightbox(index)}
                className="group relative aspect-4/3 w-full cursor-pointer overflow-hidden rounded-xl focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:outline-none dark:focus-visible:ring-white">
                <Image
                  src={getMediaUrl(image.url)}
                  alt={image.name || `${title} — ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80vw"
                  loading={index < 3 ? 'eager' : 'lazy'}
                />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/92"
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
              swiperRef.current?.slidePrev();
            }}
            aria-label="Previous image"
            className="absolute left-4 z-10 hidden h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25 md:flex">
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Main image */}
          <Swiper
            onSwiper={(s) => {
              swiperRef.current = s;
            }}
            initialSlide={selectedIndex}
            onSlideChange={(s) => setSelectedIndex(s.realIndex)}
            slidesPerView={1}
            spaceBetween={0}
            grabCursor
            loop={images.length > 1}
            modules={[]}
            className="h-full w-full"
            onClick={(_, e) => e.stopPropagation()}>
            {images.map((image, index) => (
              <SwiperSlide
                key={index}
                className="flex flex-col items-center justify-center"
                onClick={(e) => e.stopPropagation()}>
                <Image
                  src={getMediaUrl(image.url)}
                  alt={image.name || `${title} — ${index + 1}`}
                  width={1600}
                  height={1200}
                  className="max-h-[90vh] w-auto max-w-[90vw] rounded-xl object-contain shadow-2xl"
                  priority={index === selectedIndex}
                />
                {image.description?.trim() ? (
                  <p className="mt-4 max-w-[90vw] text-center text-sm text-white/90">
                    {image.description}
                  </p>
                ) : null}
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Next button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              swiperRef.current?.slideNext();
            }}
            aria-label="Next image"
            className="absolute right-4 z-10 hidden h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25 md:flex">
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
}
