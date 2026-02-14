'use client';
import { Label, ListBox, Select } from '@heroui/react';
import Image from 'next/image';
import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { PropertyType } from '../lib/definitions/listing.types';
import { getMediaUrl } from '../lib/helpers/media-helpers';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'buy' | 'rent'>('buy');
  const slides = [
    { type: 'image', src: 'images/leonettis/homepage/1.webp' },
    { type: 'video', src: 'images/leonettis/homepage/1.mov' },
    { type: 'video', src: 'images/leonettis/homepage/2.mov' },
    { type: 'image', src: 'images/leonettis/homepage/2.webp' },
    { type: 'image', src: 'images/leonettis/homepage/3.webp' },
  ];
  const propertyTypes: { name: string; id: PropertyType }[] = [
    { name: 'Apartment', id: 'apartment' },
    { name: 'House', id: 'house' },
    { name: 'Villa', id: 'villa' },
    { name: 'Land', id: 'land' },
    { name: 'Bungalow', id: 'bungalow' },
    { name: 'Garage', id: 'garage' },
    { name: 'Office', id: 'office' },
    { name: 'Warehouse', id: 'warehouse' },
    { name: 'Shop', id: 'shop' },
  ];

  const [selectedPropertyType, setSelectedPropertyType] = useState<Key | null>(
    'house'
  );

  return (
    <main className="dark:bg-tiff-gray-950 min-h-screen">
      <div className="relative">
        <Swiper
          spaceBetween={0}
          centeredSlides={true}
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          navigation={true}
          modules={[Autoplay, Pagination, Navigation]}
          className="mySwiper swiper-controls-desktop h-[85vh] w-full md:h-[calc(100vh-145px)]">
          {slides.map((slide, index) => (
            <SwiperSlide
              key={index}
              className="h-full! w-full!"
              data-swiper-autoplay={slide.type === 'video' ? '5000' : '2000'}>
              <div className="relative h-full w-full">
                {slide.type === 'video' ? (
                  <video
                    className="h-full w-full object-cover object-top"
                    autoPlay
                    muted
                    loop
                    playsInline
                    suppressHydrationWarning>
                    <source src={getMediaUrl(slide.src)} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <Image
                    src={getMediaUrl(slide.src)}
                    alt="Property Image"
                    fill
                    className="object-cover object-top"
                    sizes="100vw"
                    priority={true}
                  />
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        {/* Overlay: centered on top of Swiper */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="pointer-events-auto">
            <div className="flex rounded-xl">
              <button
                onClick={() => setActiveTab('buy')}
                className={`cursor-pointer rounded-tl-xl px-4 py-2 text-white transition-all duration-300 ${activeTab === 'buy' ? 'bg-leon-blue-900' : 'bg-leon-blue-800 hover:bg-leon-blue-700'}`}>
                <span
                  className={
                    activeTab === 'buy' ? 'border-b border-white pb-1' : ''
                  }>
                  Buy
                </span>
              </button>
              <button
                onClick={() => setActiveTab('rent')}
                className={`cursor-pointer rounded-tr-xl px-4 py-2 text-white transition-all duration-300 ${activeTab === 'rent' ? 'bg-leon-blue-900' : 'bg-leon-blue-800 hover:bg-leon-blue-700'}`}>
                <span
                  className={
                    activeTab === 'rent' ? 'border-b border-white pb-1' : ''
                  }>
                  Rent
                </span>
              </button>
            </div>
            <div className="bg-surface-raised/90 w-56 rounded-r-full p-4">
              {activeTab === 'buy' ? (
                <Select
                  className="w-[200px]"
                  placeholder="Select a property type"
                  value={selectedPropertyType}
                  onChange={(value) => setSelectedPropertyType(value)}>
                  <Label>Property Type</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover className="bg-surface-raised">
                    <ListBox>
                      {propertyTypes.map((propertyType) => (
                        <ListBox.Item
                          key={propertyType.id}
                          id={propertyType.id}
                          textValue={propertyType.name}>
                          {propertyType.name}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              ) : (
                <div>Rent</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
