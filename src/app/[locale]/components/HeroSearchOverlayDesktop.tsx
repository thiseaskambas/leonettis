import { Button, Label, ListBox, Select } from '@heroui/react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import type { Key } from 'react-aria-components';

import { PropertyType } from '@/app/lib/definitions/listing.types';
import { useRouter } from '@/i18n/navigation';

const PROPERTY_TYPES: PropertyType[] = [
  'house',
  'apartment',
  'field',
  'land',
  'business',
  'garage',
  'building',
  'office',
  'warehouse',
];

export default function HeroSearchOverlayDesktop() {
  const t = useTranslations('property-type');
  const router = useRouter();
  const listingTypes = PROPERTY_TYPES.map((key) => ({
    name: t(key),
    id: key,
  }));

  const tBuy = useTranslations('buy');
  const tRent = useTranslations('rent');

  const [selectedPropertyType, setSelectedPropertyType] = useState<Key | null>(
    'house'
  );

  const [activeTab, setActiveTab] = useState<'buy' | 'rent'>('buy');

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (selectedPropertyType) {
      params.set('propertyType', String(selectedPropertyType));
    }
    const route = activeTab === 'rent' ? '/rent' : '/buy';
    const qs = params.toString();
    router.push(qs ? `${route}?${qs}` : route);
  }, [activeTab, selectedPropertyType, router]);

  return (
    <div className="pointer-events-auto -mt-52">
      <div className="bg-glass-no-border flex h-16 items-center gap-6 rounded-2xl px-5 py-3 shadow-lg">
        {/* Pill-style segmented control */}
        <div className="relative flex rounded-full bg-white/20 p-1 dark:bg-black/20">
          <button
            onClick={() => setActiveTab('buy')}
            className={`text-leon-blue-950 dark:text-leon-blue-50 relative z-10 rounded-full px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'buy' ? 'text-leon-blue-900 dark:text-leon-blue-100' : 'hover:bg-white/10 dark:hover:bg-black/10'}`}>
            {activeTab === 'buy' && (
              <motion.div
                layoutId="search-tab-indicator"
                className="absolute inset-0 rounded-full bg-white shadow-sm dark:bg-black"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tBuy('cta')}</span>
          </button>
          <button
            onClick={() => setActiveTab('rent')}
            className={`text-leon-blue-950 dark:text-leon-blue-50 relative z-10 rounded-full px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'rent' ? 'text-leon-blue-900 dark:text-leon-blue-100' : 'hover:bg-white/10 dark:hover:bg-black/10'}`}>
            {activeTab === 'rent' && (
              <motion.div
                layoutId="search-tab-indicator"
                className="absolute inset-0 rounded-full bg-white shadow-sm dark:bg-black"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tRent('cta')}</span>
          </button>
        </div>

        {/* Property type Select */}
        <Select
          className="h-10 w-[200px] min-w-0 shrink bg-transparent"
          value={selectedPropertyType}
          onChange={(value) => setSelectedPropertyType(value)}>
          <Label className="hidden">Property Type</Label>
          <Select.Trigger className="h-10 min-h-10 bg-white/10 dark:bg-black/10">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover className="bg-transparent backdrop-blur-md">
            <ListBox className="bg-glass">
              {listingTypes.map((filterOption) => (
                <ListBox.Item
                  key={filterOption.id}
                  id={filterOption.id}
                  textValue={filterOption.name}>
                  {filterOption.name}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        {/* Search button */}
        <motion.div
          initial={{ x: -100, rotate: -360, opacity: 0 }}
          animate={{ x: 0, rotate: 0, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 50,
            damping: 10,
            delay: 0.2,
          }}
          className="ml-auto shrink-0">
          <Button
            onPress={handleSearch}
            className="bg-brand-primary hover:bg-brand-primary-hover flex h-12 w-12 min-w-12 items-center justify-center rounded-full p-0 shadow-md transition-transform hover:scale-105">
            <Search className="size-6 text-white" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
