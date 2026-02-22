'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeLogo() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait until mounted to avoid hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Show a placeholder or the default logo during SSR/hydration to prevent layout shift
  if (!mounted) {
    return (
      <div className="h-12 w-[120px] md:h-[80.3px] md:w-[200px]" aria-hidden />
    );
  }

  return (
    <Image
      alt="Leonetti logo"
      src={resolvedTheme === 'dark' ? '/logo-lg-dark.png' : '/logo-lg.png'}
      width={200}
      className="min-h-12 w-[120px] min-w-[120px] object-contain md:h-[80.3px] md:min-h-[80.3px] md:w-[200px] md:min-w-[200px]"
      height={80.3}
      priority
    />
  );
}
