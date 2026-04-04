'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
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

function LightboxDialog({
  images,
  title,
  initialIndex,
  closeLabel,
  onClose,
}: {
  images: ListingImage[];
  title: string;
  initialIndex: number;
  closeLabel: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    return () => {
      dialog.close();
    };
  }, []);

  const handleClose = useCallback(() => {
    dialogRef.current?.close();
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
      if (e.key === 'ArrowLeft') swiperRef.current?.slidePrev();
      if (e.key === 'ArrowRight') swiperRef.current?.slideNext();
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleClose]);

  return (
    <dialog
      ref={dialogRef}
      className="m-0 h-dvh max-h-dvh w-dvw max-w-dvw border-none bg-black/92 p-0 backdrop:bg-transparent"
      onClick={(e) => {
        if (e.target === dialogRef.current) handleClose();
      }}>
      {/* Swiper */}
      <Swiper
        onSwiper={(s) => {
          swiperRef.current = s;
        }}
        initialSlide={initialIndex}
        onSlideChange={(s) => setCurrentIndex(s.realIndex)}
        slidesPerView={1}
        spaceBetween={0}
        grabCursor
        loop={images.length > 1}
        modules={[]}
        className="h-full w-full">
        {images.map((image, index) => (
          <SwiperSlide
            key={index}
            className="flex! h-full! flex-col items-center justify-center">
            <Image
              src={getMediaUrl(image.url)}
              alt={image.name || `${title} — ${index + 1}`}
              width={1600}
              height={1200}
              className="max-h-[90vh] w-auto max-w-[90vw] rounded-xl object-contain shadow-2xl"
              priority={index === initialIndex}
            />
            {image.description?.trim() ? (
              <p className="mt-4 max-w-[90vw] text-center text-sm text-white/90">
                {image.description}
              </p>
            ) : null}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Close button */}
      <button
        type="button"
        onClick={handleClose}
        aria-label={closeLabel}
        className="absolute top-4 right-4 z-10 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25">
        <X className="h-6 w-6" />
      </button>

      {/* Image counter */}
      <div className="absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Prev button — desktop only */}
      <button
        type="button"
        onClick={() => swiperRef.current?.slidePrev()}
        aria-label="Previous image"
        className="absolute top-1/2 left-4 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25 md:flex">
        <ChevronLeft className="h-6 w-6" />
      </button>

      {/* Next button — desktop only */}
      <button
        type="button"
        onClick={() => swiperRef.current?.slideNext()}
        aria-label="Next image"
        className="absolute top-1/2 right-4 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25 md:flex">
        <ChevronRight className="h-6 w-6" />
      </button>
    </dialog>
  );
}

export default function PropertyGallery({
  images,
  title,
  galleryLabel,
  closeLabel,
}: PropertyGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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
            onClick={() => setSelectedIndex(index)}
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
                onClick={() => setSelectedIndex(index)}
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

      {/* Lightbox — uses native <dialog> which renders in the browser's top layer */}
      {selectedIndex !== null && (
        <LightboxDialog
          images={images}
          title={title}
          initialIndex={selectedIndex}
          closeLabel={closeLabel}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </div>
  );
}
