import { Button, Label, ListBox, Select } from '@heroui/react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Key } from 'react-aria-components';

import { PropertyType } from '@/app/lib/definitions/listing.types';

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

  return (
    <div className="pointer-events-auto -mt-52">
      <div className="flex rounded-xl">
        <button
          onClick={() => setActiveTab('buy')}
          className={`cursor-pointer rounded-tl-xl px-4 py-2 text-white transition-all duration-300 ${activeTab === 'buy' ? 'bg-leon-blue-900' : 'bg-leon-blue-800 hover:bg-leon-blue-700'}`}>
          <span
            className={activeTab === 'buy' ? 'border-b border-white pb-1' : ''}>
            {tBuy('cta')}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('rent')}
          className={`cursor-pointer rounded-tr-xl px-4 py-2 text-white transition-all duration-300 ${activeTab === 'rent' ? 'bg-leon-blue-900' : 'bg-leon-blue-800 hover:bg-leon-blue-700'}`}>
          <span
            className={
              activeTab === 'rent' ? 'border-b border-white pb-1' : ''
            }>
            {tRent('cta')}
          </span>
        </button>
      </div>
      <div className="bg-surface-raised/90 flex h-16 gap-2 rounded-r-full">
        <Select
          className="my-auto ml-4 w-[200px]"
          value={selectedPropertyType}
          onChange={(value) => setSelectedPropertyType(value)}>
          <Label className="hidden">Property Type</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover className="bg-surface-raised">
            <ListBox>
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
        <div className="flex w-40 items-center justify-end">
          <motion.div
            initial={{ x: -100, rotate: -360, opacity: 0 }}
            animate={{ x: 0, rotate: 0, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 50,
              damping: 10,
              delay: 0.4,
            }}
            className="aspect-square h-full">
            <Button className="bg-brand-primary hover:bg-brand-primary-hover flex h-full w-full min-w-0 items-center justify-center rounded-full p-0">
              <Search className="size-6 text-white" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
