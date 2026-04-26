'use client';

import { MapPin } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import type {
  Address,
  ListingImage,
  ListingStatus,
  ListingVideo,
} from '@/app/lib/definitions/listing.types';
import { getMediaUrl } from '@/app/lib/helpers/media-helpers';

type HeroSlide =
  | { type: 'image'; src: string; name: string; description?: string }
  | { type: 'video'; src: string; name: string; contentType?: string };

interface PropertyHeroProps {
  images?: ListingImage[];
  videos?: ListingVideo[];
  title: string;
  address: Address;
  status?: ListingStatus;
}

export default function PropertyHero({
  images,
  videos,
  title,
  address,
  status,
}: PropertyHeroProps) {
  const t = useTranslations('property');
  const statusColors: Partial<Record<ListingStatus, string>> = {
    sold: 'bg-red-600',
    rented: 'bg-leon-blue-500',
    pending: 'bg-amber-500',
    under_offer: 'bg-purple-600',
  };
  const statusKey = status && status !== 'active' ? status : null;
  const statusColor = statusKey ? statusColors[statusKey] : undefined;
  const displayAddress =
    address.displayAddress ??
    [address.city, address.region, address.state].filter(Boolean).join(', ');

  const slides: HeroSlide[] = [
    ...(images?.map((img) => ({
      type: 'image' as const,
      src: img.url,
      name: img.name,
      description: img.description,
    })) ?? []),
    ...(videos?.map((video) => ({
      type: 'video' as const,
      src: video.url,
      name: video.name,
      contentType: video.contentType,
    })) ?? []),
  ];

  const infoOverlay = (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-wide text-gray-900 md:text-2xl lg:text-3xl dark:text-white">
          {title}
        </h1>
        {displayAddress && (
          <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{displayAddress}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative w-full">
      {/* Swiper carousel */}
      <div className="relative h-[55vw] min-h-80 w-full md:h-[65vh]">
        {statusKey && statusColor && (
          <div
            className={`absolute top-0 right-0 left-0 z-30 py-2 text-center text-sm font-bold tracking-widest text-white uppercase ${statusColor}`}>
            {t(`status.${statusKey}`)}
          </div>
        )}
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
                    <source
                      src={getMediaUrl(slide.src)}
                      type={slide.contentType || undefined}
                    />
                  </video>
                ) : (
                  <Image
                    src={getMediaUrl(slide.src)}
                    alt={slide.name}
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
          {infoOverlay}
        </div>

        {/* Gradient fade at bottom for desktop overlay readability */}
        <div className="pointer-events-none absolute right-0 bottom-0 left-0 hidden h-48 bg-linear-to-t from-black/40 to-transparent md:block" />
      </div>

      {/* Mobile info block — below the slideshow (title + address only; price & specs in PropertyDetails) */}
      <div className="from-tiff-gray-50 to-tiff-gray-100 dark:from-tiff-gray-950 dark:to-tiff-gray-900 bg-linear-to-b px-5 py-6 md:hidden">
        {/*{statusKey && statusColor && (
          <div
            className={`mb-3 inline-flex rounded-full px-3 py-1 text-xs font-bold tracking-wide text-white uppercase ${statusColor}`}>
            {t(`status.${statusKey}`)}
          </div>
        )}*/}
        {infoOverlay}
      </div>
    </div>
  );
}
