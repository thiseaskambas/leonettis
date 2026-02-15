'use client';
import Image from 'next/image';
import { useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Keyboard, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { LocalizedListing } from '@/app/lib/definitions/listing.types';
import { Link } from '@/i18n/navigation';

import { getMediaBlurDataURL, getMediaUrl } from '../lib/helpers/media-helpers';

const ListingImage = ({
  src,
  blurSrc,
  alt,
  priority,
  loading,
}: {
  src: string;
  blurSrc: string;
  alt: string;
  priority: boolean;
  loading: 'eager' | 'lazy';
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      {/* 1. Low-Res Placeholder (Visible initially) */}
      <Image
        src={blurSrc}
        alt={alt}
        fill
        className="scale-[1.02] object-cover blur-lg" // Add blur-lg for the effect
        sizes="(max-width: 768px) 100vw, 50vw"
        priority={priority} // Load placeholder fast
      />

      {/* 2. Main Image (Fades in on top) */}
      <Image
        src={src}
        alt={alt}
        fill
        className={`scale-[1.02] object-cover transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        sizes="(max-width: 768px) 100vw, 50vw"
        priority={priority}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
      />
    </>
  );
};

export default function ListingCard({
  listing,
}: {
  listing: LocalizedListing;
}) {
  const { title, images } = listing;
  // State to track which images should be forced to load
  // Initialize with [0, 1] to ensure first two are ready
  const [loadedIndices, setLoadedIndices] = useState<number[]>([0, 1]);

  const handleSlideChange = (swiper: SwiperType) => {
    const currentIndex = swiper.activeIndex;
    const nextIndex = currentIndex + 1;

    // If the next image hasn't been marked for loading yet, add it
    if (
      nextIndex < (images?.length || 0) &&
      !loadedIndices.includes(nextIndex)
    ) {
      setLoadedIndices((prev) => [...prev, nextIndex]);
    }
  };

  return (
    <div className="dark:border-leon-blue-900 w-full min-w-0 overflow-hidden rounded-xl border border-gray-200 transition-shadow duration-300 hover:cursor-pointer hover:shadow-md">
      {/* Aspect Ratio Container */}
      <div className="relative aspect-4/3 w-full">
        <Swiper
          rewind={true}
          onSlideChange={handleSlideChange}
          slidesPerView={1}
          spaceBetween={30}
          pagination={{
            clickable: true,
          }}
          navigation={true}
          modules={[Keyboard, Pagination, Navigation]}
          className="mySwiper block h-full! w-full! cursor-default">
          {images?.map((image, index) => (
            <SwiperSlide key={index} className="h-full! w-full!">
              <div className="relative h-full w-full">
                <ListingImage
                  src={getMediaUrl(image)}
                  blurSrc={getMediaBlurDataURL(image)}
                  alt={title}
                  priority={index === 0}
                  loading={
                    index === 0 || loadedIndices.includes(index)
                      ? 'eager'
                      : 'lazy'
                  }
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <Link
        href={`/property/${listing.slug}`}
        className="bg-surface-raised dark:bg-leon-blue-950 block p-4">
        <h3 className="text-base font-medium">{title}</h3>
        {/* You can add more details here like price, address, etc. */}
      </Link>
    </div>
  );
}
