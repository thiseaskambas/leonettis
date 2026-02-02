'use client';

import { ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

import { Link, usePathname } from '@/i18n/navigation';

export default function NavigationLink({
  href,
  className,
  children,
  ...rest
}: ComponentProps<typeof Link>) {
  const pathname = usePathname();
  const isActive = pathname === href;

  const classes = twMerge(
    'bg-brand-primary dark:bg-brand-accent  text-white px-4 py-2 rounded-md hover:bg-brand-accent-hover',
    className
  );

  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      className={classes}
      href={href}
      {...rest}>
      {children}
    </Link>
  );
}
