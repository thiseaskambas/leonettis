'use client';

import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import type { ListingVideo } from '@/app/lib/definitions/listing.types';
import { getMediaUrl } from '@/app/lib/helpers/media-helpers';

interface PropertyVideoGalleryProps {
  videos: ListingVideo[];
  galleryLabel: string;
  closeLabel: string;
}

function VideoLightboxDialog({
  videos,
  initialIndex,
  closeLabel,
  onClose,
}: {
  videos: ListingVideo[];
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
      <Swiper
        onSwiper={(s) => {
          swiperRef.current = s;
        }}
        initialSlide={initialIndex}
        onSlideChange={(s) => setCurrentIndex(s.realIndex)}
        slidesPerView={1}
        spaceBetween={0}
        grabCursor
        loop={videos.length > 1}
        modules={[]}
        className="h-full w-full">
        {videos.map((video, index) => (
          <SwiperSlide
            key={index}
            className="flex! h-full! flex-col items-center justify-center">
            <video
              src={getMediaUrl(video.url)}
              controls
              autoPlay={index === initialIndex}
              playsInline
              preload="metadata"
              className="max-h-[90vh] w-auto max-w-[90vw] rounded-xl object-contain shadow-2xl"
            />
            {video.description?.trim() ? (
              <p className="mt-4 max-w-[90vw] text-center text-sm text-white/90">
                {video.description}
              </p>
            ) : null}
          </SwiperSlide>
        ))}
      </Swiper>

      <button
        type="button"
        onClick={handleClose}
        aria-label={closeLabel}
        className="absolute top-4 right-4 z-10 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25">
        <X className="h-6 w-6" />
      </button>

      <div className="absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
        {currentIndex + 1} / {videos.length}
      </div>

      <button
        type="button"
        onClick={() => swiperRef.current?.slidePrev()}
        aria-label="Previous video"
        className="absolute top-1/2 left-4 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25 md:flex">
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        type="button"
        onClick={() => swiperRef.current?.slideNext()}
        aria-label="Next video"
        className="absolute top-1/2 right-4 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25 md:flex">
        <ChevronRight className="h-6 w-6" />
      </button>
    </dialog>
  );
}

export default function PropertyVideoGallery({
  videos,
  galleryLabel,
  closeLabel,
}: PropertyVideoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!videos.length) return null;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xs font-semibold tracking-widest text-gray-400 uppercase dark:text-gray-500">
        {galleryLabel}
      </h2>

      <div className="hidden grid-cols-3 gap-3 md:grid">
        {videos.map((video, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className="group relative aspect-4/3 w-full cursor-pointer overflow-hidden rounded-xl bg-black focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:outline-none dark:focus-visible:ring-white">
            <video
              src={getMediaUrl(video.url)}
              muted
              playsInline
              preload="metadata"
              className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-white/80 p-2 text-black shadow-md">
                <Play className="h-5 w-5 fill-current" />
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="md:hidden">
        <Swiper
          slidesPerView={1.25}
          spaceBetween={12}
          centeredSlides={false}
          pagination={{ clickable: true, dynamicBullets: true }}
          navigation={false}
          modules={[Pagination, Navigation]}
          className="mySwiper pb-8!">
          {videos.map((video, index) => (
            <SwiperSlide key={index} className="h-auto!">
              <button
                type="button"
                onClick={() => setSelectedIndex(index)}
                className="group relative aspect-4/3 w-full cursor-pointer overflow-hidden rounded-xl bg-black focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:outline-none dark:focus-visible:ring-white">
                <video
                  src={getMediaUrl(video.url)}
                  muted
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-black/25" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="rounded-full bg-white/80 p-2 text-black shadow-md">
                    <Play className="h-5 w-5 fill-current" />
                  </span>
                </div>
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {selectedIndex !== null && (
        <VideoLightboxDialog
          videos={videos}
          initialIndex={selectedIndex}
          closeLabel={closeLabel}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </div>
  );
}
