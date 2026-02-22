'use client';

import { ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

import { Link, usePathname } from '@/i18n/navigation';

const variantStyles = {
  solid:
    'bg-brand-primary dark:bg-brand-accent text-white hover:bg-brand-primary-hover dark:hover:bg-brand-accent-hover',
  soft: 'border-2 border-leon-400 dark:border-leon-300 bg-transparent text-leon-800 dark:text-leon-200 hover:bg-leon-200/20 dark:hover:bg-leon-800/20',
};

export default function NavLinkButton({
  href,
  className,
  children,
  variant = 'solid',
  ...rest
}: ComponentProps<typeof Link> & { variant?: 'solid' | 'soft' }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  const classes = twMerge(
    'relative overflow-hidden rounded-md px-5 py-2.5 font-medium transition-all duration-300 [transition-timing-function:cubic-bezier(0.175,0.885,0.32,1.275)] active:-translate-y-0.5 active:scale-[0.98]',
    variantStyles[variant],
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
