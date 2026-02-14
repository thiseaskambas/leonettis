'use client';
import { Button, Label, ListBox, Select } from '@heroui/react';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { PropertyType } from '../lib/definitions/listing.types';
import { getMediaUrl } from '../lib/helpers/media-helpers';

const PROPERTY_TYPES: PropertyType[] = [
  'house',
  'apartment',
  'field',
  'land',
  'business',
  'garage/parking',
  'building',
  'office',
  'warehouse',
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'buy' | 'rent'>('buy');
  const slides = [
    { type: 'image', src: 'images/leonettis/homepage/1.webp' },
    { type: 'video', src: 'images/leonettis/homepage/1.mov' },
    { type: 'video', src: 'images/leonettis/homepage/2.mov' },
    { type: 'image', src: 'images/leonettis/homepage/2.webp' },
    { type: 'image', src: 'images/leonettis/homepage/3.webp' },
  ];
  const t = useTranslations('property-type');
  const listingTypes = PROPERTY_TYPES.map((key) => ({
    name: t(key),
    id: key,
  }));

  const tBuy = useTranslations('buy');
  const tRent = useTranslations('rent');

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
          <div className="pointer-events-auto -mt-52">
            <div className="flex rounded-xl">
              <button
                onClick={() => setActiveTab('buy')}
                className={`cursor-pointer rounded-tl-xl px-4 py-2 text-white transition-all duration-300 ${activeTab === 'buy' ? 'bg-leon-blue-900' : 'bg-leon-blue-800 hover:bg-leon-blue-700'}`}>
                <span
                  className={
                    activeTab === 'buy' ? 'border-b border-white pb-1' : ''
                  }>
                  {tBuy('cta')}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('rent')}
                className={`cursor-pointer rounded-tr-xl px-4 py-2 text-white transition-all duration-300 ${activeTab === 'rent' ? 'bg-leon-blue-900' : 'bg-leon-blue-800 hover:bg-leon-blue-700'}`}>
                <span
                  className={
                    activeTab === 'rent' ? 'border-b border-white pb-1' : ''
                  }>
                  {tRent('cta')}
                </span>
              </button>
            </div>
            <div className="bg-surface-raised/90 flex gap-2 rounded-r-full">
              <Select
                className="w-[200px] p-4"
                placeholder="Select a property type"
                value={selectedPropertyType}
                onChange={(value) => setSelectedPropertyType(value)}>
                <Label className="hidden">Property Type</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover className="bg-surface-raised">
                  <ListBox>
                    {listingTypes.map((filterOption) => (
                      <ListBox.Item
                        key={filterOption.id}
                        id={filterOption.id}
                        textValue={filterOption.name}>
                        {filterOption.name}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
              <div className="flex w-40 items-center justify-end">
                <Button className="bg-brand-primary hover:bg-brand-primary-hover aspect-square h-full rounded-full">
                  <Search className="size-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
