'use client';
import { useEffect, useState } from 'react';

const TOP_THRESHOLD = 80; // px — always show nav near top of page
const DELTA_THRESHOLD = 5; // px — ignore micro-jitters

export function useScrollDirection(): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let lastY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY < TOP_THRESHOLD) {
        setVisible(true);
        lastY = currentY;
        return;
      }

      const delta = currentY - lastY;
      if (Math.abs(delta) < DELTA_THRESHOLD) return;

      setVisible(delta < 0); // negative delta = scrolling up
      lastY = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return visible;
}
