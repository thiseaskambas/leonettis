'use client';
import Image from 'next/image';
import { Keyboard, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { LocalizedListing } from '@/app/lib/definitions/listing.types';

import { getMediaUrl } from '../lib/helpers/media-helpers';

export default function ListingCard({
  listing,
}: {
  listing: LocalizedListing;
}) {
  const { title, images } = listing;

  return (
    <div className="dark:border-leon-blue-900 w-full min-w-0 overflow-hidden rounded-xl border border-gray-200 transition-shadow duration-300 hover:cursor-pointer hover:shadow-md">
      {/* Aspect Ratio Container */}
      <div className="relative aspect-4/3 w-full">
        <Swiper
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
                <Image
                  src={getMediaUrl(image)}
                  alt={title}
                  fill
                  className="scale-[1.02] object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="bg-surface-raised dark:bg-leon-blue-950 p-4">
        <h3 className="text-lg font-bold">{title}</h3>
        {/* You can add more details here like price, address, etc. */}
      </div>
    </div>
  );
}
