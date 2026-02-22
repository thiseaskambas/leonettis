'use client';

import { ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

import { Link, usePathname } from '@/i18n/navigation';

export default function NavigationLink({
  href,
  className,
  underline = true,
  ...rest
}: ComponentProps<typeof Link> & { underline?: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  const classes = twMerge(
    'font-brand-primary relative px-1 py-1',
    underline &&
      'after:bg-brand-primary after:absolute after:bottom-[-10px] after:left-0 after:h-[2px] after:w-full after:origin-right after:scale-x-0 after:transition-transform after:duration-300 after:ease-in-out hover:after:origin-left hover:after:scale-x-100',
    className
  );

  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      href={href}
      className={classes}
      {...rest}
    />
  );
}
