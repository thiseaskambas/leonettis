import Image from 'next/image';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { getMediaUrl } from '@/app/lib/helpers/media-helpers';

export default function HeroCarousel({
  slides,
}: {
  slides: { type: 'image' | 'video'; src: string }[];
}) {
  return (
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
      className="mySwiper swiper-controls-desktop h-screen w-full">
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
                alt=""
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
  );
}
