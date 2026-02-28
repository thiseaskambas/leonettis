'use client';

import { Bath, Bed, MapPin, Maximize } from 'lucide-react';
import Image from 'next/image';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { getMediaUrl } from '@/app/lib/helpers/media-helpers';
import { Address } from '@/app/lib/definitions/listing.types';

interface PropertyHeroProps {
  images?: string[];
  videos?: string[];
  title: string;
  address: Address;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  squareMetersTotal?: number;
  listingType: 'buy' | 'rent';
  translations: {
    pricePerMonth: string;
    bedrooms: string;
    bathrooms: string;
    area: string;
  };
}

export default function PropertyHero({
  images,
  videos,
  title,
  address,
  price,
  bedrooms,
  bathrooms,
  squareMetersTotal,
  listingType,
  translations,
}: PropertyHeroProps) {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price);

  const displayAddress =
    address.displayAddress ??
    [address.city, address.region, address.state]
      .filter(Boolean)
      .join(', ');

  const slides = [
    ...(images?.map((src) => ({ type: 'image' as const, src })) ?? []),
    ...(videos?.map((src) => ({ type: 'video' as const, src })) ?? []),
  ];

  const InfoOverlay = () => (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-wide text-gray-900 dark:text-white md:text-2xl lg:text-3xl">
          {title}
        </h1>
        {displayAddress && (
          <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{displayAddress}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-gray-200/30 pt-3 text-sm font-medium text-gray-800 dark:text-gray-200">
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          {formattedPrice}
          {listingType === 'rent' && (
            <span className="ml-0.5 text-sm font-normal text-gray-600 dark:text-gray-400">
              {translations.pricePerMonth}
            </span>
          )}
        </span>

        <div className="flex items-center gap-4">
          {!!bedrooms && (
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>
                {bedrooms} {translations.bedrooms}
              </span>
            </div>
          )}
          {!!bathrooms && (
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>
                {bathrooms} {translations.bathrooms}
              </span>
            </div>
          )}
          {!!squareMetersTotal && (
            <div className="flex items-center gap-1">
              <Maximize className="h-4 w-4" />
              <span>
                {squareMetersTotal}m² {translations.area}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full">
      {/* Swiper carousel */}
      <div className="relative h-[55vw] min-h-[320px] w-full md:h-[65vh]">
        <Swiper
          slidesPerView={1}
          spaceBetween={0}
          pagination={{ clickable: true }}
          navigation={true}
          modules={[Pagination, Navigation]}
          className="mySwiper swiper-controls-desktop h-full w-full">
          {slides.map((slide, index) => (
            <SwiperSlide key={index} className="h-full! w-full!">
              <div className="relative h-full w-full">
                {slide.type === 'video' ? (
                  <video
                    className="h-full w-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    suppressHydrationWarning
                    preload="auto">
                    <source src={getMediaUrl(slide.src)} type="video/mp4" />
                  </video>
                ) : (
                  <Image
                    src={getMediaUrl(slide.src)}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    priority={index === 0}
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Desktop overlay — bottom-left glass card */}
        <div className="bg-glass-no-border absolute bottom-6 left-6 z-20 hidden max-w-lg rounded-2xl border border-white/20 p-5 shadow-xl md:block">
          <InfoOverlay />
        </div>

        {/* Gradient fade at bottom for desktop overlay readability */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 hidden h-48 bg-gradient-to-t from-black/40 to-transparent md:block" />
      </div>

      {/* Mobile info block — below the slideshow */}
      <div className="from-tiff-gray-50 to-tiff-gray-100 dark:from-tiff-gray-950 dark:to-tiff-gray-900 bg-linear-to-b px-5 py-6 md:hidden">
        <InfoOverlay />
      </div>
    </div>
  );
}
