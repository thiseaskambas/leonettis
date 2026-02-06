'use client';
import Image from 'next/image';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { Listing } from '@/app/lib/definitions/listing.types';

export default function ListingCard({ listing }: { listing: Listing }) {
  const { title, address, price, bedrooms, bathrooms, squareMeters, images } =
    listing;
  return (
    <div className="h-80 w-96 rounded-lg border border-gray-200 p-4 shadow-md">
      <h3 className="text-lg font-bold">{title}</h3>
      <Swiper
        pagination={{
          type: 'fraction',
        }}
        navigation={true}
        modules={[Pagination, Navigation]}
        className="mySwiper">
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <Image
              unoptimized
              src={image}
              alt={title}
              width={600}
              height={400}
              className="object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
