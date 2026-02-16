'use client';
import { Bath, Bed, MapPin, Maximize } from 'lucide-react';
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
      <Image
        src={blurSrc}
        alt={alt}
        fill
        className="scale-[1.02] object-cover blur-lg"
        sizes="(max-width: 768px) 100vw, 50vw"
        priority={priority}
      />
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
  const {
    title,
    images,
    price,
    address,
    bedrooms,
    bathrooms,
    squareMetersTotal,
  } = listing;
  const [loadedIndices, setLoadedIndices] = useState<number[]>([0, 1]);

  const handleSlideChange = (swiper: SwiperType) => {
    const currentIndex = swiper.activeIndex;
    const nextIndex = currentIndex + 1;
    if (
      nextIndex < (images?.length || 0) &&
      !loadedIndices.includes(nextIndex)
    ) {
      setLoadedIndices((prev) => [...prev, nextIndex]);
    }
  };

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <div className="group relative w-full min-w-0 overflow-hidden rounded-2xl shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
      {/* Price Tag (Top Right) */}
      <div className="bg-glass-no-border absolute top-3 right-3 z-20 rounded-full px-3 py-1 text-sm font-semibold text-gray-900 dark:text-white">
        {formattedPrice}
      </div>

      {/* Aspect Ratio Container */}
      <div className="relative aspect-3/4 w-full md:aspect-4/3">
        <Swiper
          rewind={true}
          onSlideChange={handleSlideChange}
          slidesPerView={1}
          spaceBetween={30}
          pagination={{
            type: 'progressbar',
          }}
          navigation={true}
          modules={[Keyboard, Pagination, Navigation]}
          className="mySwiper swiper-pagination-only-mobile swiper-pagination-progressbar swiper-pagination-progressbar-fill block h-full! w-full! cursor-default">
          {images?.map((image, index) => (
            <SwiperSlide
              key={index}
              className="h-full! w-full! overflow-hidden">
              <div className="relative h-full w-full transition-transform duration-700 group-hover:scale-105">
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

      {/* Glass Overlay Link */}
      <Link
        href={`/property/${listing.slug}`}
        className="bg-glass-no-border absolute right-0 bottom-0 left-0 z-10 m-3 flex flex-col gap-2 rounded-xl border border-white/20 p-4 shadow-lg transition-all duration-300 hover:bg-white/40 dark:hover:bg-black/40">
        {/* Title & Location */}
        <div>
          <h3 className="truncate text-lg font-medium tracking-wide text-gray-900 dark:text-white">
            {title}
          </h3>
          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
            <MapPin className="h-3 w-3" />
            <span className="truncate">
              {address.city}, {address.region}
            </span>
          </div>
        </div>

        {/* Specs Row */}
        <div className="flex items-center gap-4 border-t border-gray-200/20 pt-2 text-xs font-medium text-gray-700 dark:text-gray-200">
          {bedrooms && (
            <div className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" />
              <span>{bedrooms} Beds</span>
            </div>
          )}
          {bathrooms && (
            <div className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              <span>{bathrooms} Baths</span>
            </div>
          )}
          {squareMetersTotal && (
            <div className="flex items-center gap-1">
              <Maximize className="h-3.5 w-3.5" />
              <span>{squareMetersTotal}m²</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
