import { createNavigation } from 'next-intl/navigation';

import { routing } from './routing';

// Lightweight wrappers around Next.js' navigation
// APIs that consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

//NOTE: Next.js will automatically pick up the locale from the URL and pass it to the server component as a prop.
