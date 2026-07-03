import Image from 'next/image';
import type { Swiper as SwiperType } from 'swiper';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { getMediaUrl } from '@/app/lib/helpers/media-helpers';

function syncHeroVideos(swiper: SwiperType) {
  swiper.slides.forEach((slideEl, index) => {
    const video = slideEl.querySelector('video');
    if (!video) return;

    if (index === swiper.activeIndex) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  });
}

export default function HeroCarousel({
  slides,
}: {
  slides: { type: 'image' | 'video'; src: string; poster?: string }[];
}) {
  return (
    <Swiper
      speed={1000}
      spaceBetween={0}
      autoplay={{
        delay: 8000,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      navigation={true}
      modules={[Autoplay, Pagination, Navigation]}
      onSwiper={syncHeroVideos}
      onSlideChange={syncHeroVideos}
      className="mySwiper swiper-controls-desktop h-screen w-full">
      {slides.map((slide, index) => (
        <SwiperSlide
          key={index}
          className="h-full! w-full!"
          data-swiper-autoplay={slide.type === 'video' ? '8000' : '5000'}>
          <div className="relative h-full w-full">
            {slide.type === 'video' ? (
              <video
                className="h-full w-full object-cover object-top"
                muted
                loop
                playsInline
                suppressHydrationWarning
                preload="auto"
                poster={slide.poster ? getMediaUrl(slide.poster) : undefined}>
                <source src={getMediaUrl(slide.src)} type="video/mp4" />
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
