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
      className="after:bg-brand-primary font-brand-primary relative px-1 py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-right after:scale-x-0 after:transition-transform after:duration-300 after:ease-in-out hover:after:origin-left hover:after:scale-x-100"
      {...rest}
    />
  );
}
