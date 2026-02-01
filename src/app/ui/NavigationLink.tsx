'use client';

import { ComponentProps } from 'react';

import { Link, usePathname } from '@/i18n/navigation';

export default function NavigationLink({
  href,
  ...rest
}: ComponentProps<typeof Link>) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      href={href}
      className={isActive ? 'underline' : ''}
      {...rest}
    />
  );
}
