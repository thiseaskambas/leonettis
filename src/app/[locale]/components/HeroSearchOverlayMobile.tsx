'use client';

import { Button } from '@heroui/react';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import SearchBar from '../../ui/SearchBar';

export default function HeroSearchOverlayMobile() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('search-bar');

  return (
    <>
      <Button
        size="lg"
        onPress={() => setIsOpen(true)}
        className="bg-brand-primary hover:bg-brand-primary-hover pointer-events-auto cursor-pointer text-white">
        <Search className="size-6 text-white" />
        {t('title')}
      </Button>
      <SearchBar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
