'use client';

import { Button } from '@heroui/react';
import { Search } from 'lucide-react';
import { useState } from 'react';

import SearchBar from '../../ui/SearchBar';

export default function HeroSearchOverlayMobile() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        size="lg"
        onPress={() => setIsOpen(true)}
        className="bg-brand-primary hover:bg-brand-primary-hover pointer-events-auto cursor-pointer text-white">
        <Search className="size-6 text-white" />
        Search
      </Button>
      <SearchBar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
