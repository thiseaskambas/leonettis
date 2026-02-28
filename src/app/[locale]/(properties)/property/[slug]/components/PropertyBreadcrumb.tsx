import { ChevronRight } from 'lucide-react';

import { Link } from '@/i18n/navigation';

interface PropertyBreadcrumbProps {
  listingType: 'buy' | 'rent';
  title: string;
  translations: {
    home: string;
    forSale: string;
    forRent: string;
  };
}

export default function PropertyBreadcrumb({
  listingType,
  title,
  translations,
}: PropertyBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="hidden items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 md:flex">
      <Link
        href="/"
        className="hover:text-gray-900 dark:hover:text-white transition-colors">
        {translations.home}
      </Link>
      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
      <Link
        href={listingType === 'buy' ? '/buy' : '/rent'}
        className="hover:text-gray-900 dark:hover:text-white transition-colors">
        {listingType === 'buy' ? translations.forSale : translations.forRent}
      </Link>
      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
      <span className="max-w-xs truncate text-gray-900 dark:text-white font-medium">
        {title}
      </span>
    </nav>
  );
}
