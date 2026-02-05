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
    return <div style={{ width: 150, height: 60.5 }} />;
  }

  return (
    <Image
      alt="Leonetti logo"
      src={resolvedTheme === 'dark' ? '/logo-lg-dark.png' : '/logo-lg.png'}
      width={150}
      className="min-h-[60.5px] min-w-[150px] object-contain"
      height={60.5}
      priority
    />
  );
}
