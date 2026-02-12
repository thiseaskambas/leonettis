'use client';
import Image from 'next/image';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

export default function Home() {
  const slides = [
    { type: 'image', src: 'homepage/1.webp' },
    { type: 'video', src: 'homepage/1.mov' },
    { type: 'video', src: 'homepage/2.mov' },
    { type: 'image', src: 'homepage/2.webp' },
    { type: 'image', src: 'homepage/3.webp' },
  ];

  return (
    <main className="dark:bg-tiff-gray-950 min-h-screen">
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
        className="mySwiper swiper-controls-desktop h-[85vh] w-full md:h-[50vh]">
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
                  <source src={slide.src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <Image
                  unoptimized
                  src={slide.src}
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
    </main>
  );
}
