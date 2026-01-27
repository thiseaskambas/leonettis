'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ComponentProps } from 'react';

type Props = ComponentProps<typeof Link>;

export default function LocalizedLink({ href, children, ...props }: Props) {
  const { lang } = useParams();

  // Ensure we don't double up the slash if href is already absolute
  const isExternal = href.toString().startsWith('http');

  if (isExternal) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }

  // Construct the new path: /en/contact, /fr/listings, etc.
  const localizedHref = `/${lang}${href.toString().startsWith('/') ? '' : '/'}${href}`;

  return (
    <Link href={localizedHref} {...props}>
      {children}
    </Link>
  );
}
