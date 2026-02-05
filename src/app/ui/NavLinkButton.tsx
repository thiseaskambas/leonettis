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
    ' text-white px-4 py-2 rounded-md hover:bg-brand-accent-hover active:',
    'relative overflow-hidden rounded-md bg-brand-primary dark:bg-brand-accent px-5 py-2.5  text-white transition-all duration-300 [transition-timing-function:cubic-bezier(0.175,0.885,0.32,1.275)] active:-translate-y-1 active:scale-x-90 active:scale-y-110',
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
