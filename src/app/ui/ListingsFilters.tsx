'use client';

import type { Key, Selection } from '@heroui/react';
import {
  Accordion,
  Button,
  Checkbox,
  CheckboxGroup,
  Label,
  Radio,
  RadioGroup,
  Slider,
} from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { useRouter } from '@/i18n/navigation';

import type { FilterDef } from '../lib/definitions/search-filters';
import {
  FILTERS,
  getSelectedIds,
  getVisibleOptions,
  pruneSelections,
  selectionsToParams,
} from '../lib/definitions/search-filters';
import { parseSearchParams } from '../lib/helpers/listing-search-params';

const PRICE_MAX = 2_000_000;
const PRICE_STEP = 10_000;

const FILTER_KEYS = [
  'category',
  'propertyType',
  'condition',
  'furnishing',
  'energyRating',
  'viewType',
  'features',
  'amenities',
  'suitableFor',
] as const;

interface ListingsFiltersProps {
  listingType: 'buy' | 'rent';
  initialSearchParams?: Record<string, string | string[] | undefined>;
}

function initFromParams(
  raw: Record<string, string | string[] | undefined> | undefined,
  listingType: 'buy' | 'rent'
): { selections: Record<string, Selection>; priceRange: number[] } {
  if (!raw) return { selections: {}, priceRange: [0, PRICE_MAX] };
  const parsed = parseSearchParams({ ...raw, listingType });
  const selections: Record<string, Selection> = {};
  for (const key of FILTER_KEYS) {
    const val = parsed[key];
    if (val && val.length > 0) {
      selections[key] = new Set(val) as Selection;
    }
  }
  return {
    selections,
    priceRange: [parsed.minPrice ?? 0, parsed.maxPrice ?? PRICE_MAX],
  };
}

const ListingsFilters = ({
  listingType,
  initialSearchParams,
}: ListingsFiltersProps) => {
  const t = useTranslations('search-bar');
  const router = useRouter();

  const [selections, setSelections] = useState<Record<string, Selection>>(
    () => initFromParams(initialSearchParams, listingType).selections
  );
  const [priceRange, setPriceRange] = useState<number[]>(
    () => initFromParams(initialSearchParams, listingType).priceRange
  );
  const [expandedKeys, setExpandedKeys] = useState<Set<Key>>(new Set());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const getFilterLabel = useCallback(
    (filterId: string) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      t(`filters.${filterId}.label` as any),
    [t]
  );

  const getOptionLabel = useCallback(
    (filterId: string, optionId: string) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      t(`filters.${filterId}.${optionId.replace(/ /g, '-')}` as any),
    [t]
  );

  const getSummary = useCallback(
    (filter: FilterDef, selection: Selection | undefined) => {
      const ids = getSelectedIds(selection);
      const filterLabel = getFilterLabel(filter.id);
      if (ids.length === 0) return { label: filterLabel, hasSelection: false };
      const labels = filter.options
        .filter((opt) => ids.includes(opt.id))
        .map((opt) => getOptionLabel(filter.id, opt.id));
      const displayLabel =
        labels.length <= 2
          ? labels.join(', ')
          : t('selected-count', { count: labels.length });
      return { label: displayLabel, hasSelection: true };
    },
    [getFilterLabel, getOptionLabel, t]
  );

  const handleSingleSelect = useCallback((filterId: string, value: string) => {
    setSelections((prev) =>
      pruneSelections({ ...prev, [filterId]: new Set([value]) as Selection })
    );
  }, []);

  const handleMultiSelect = useCallback(
    (filterId: string, values: string[]) => {
      setSelections((prev) =>
        pruneSelections({ ...prev, [filterId]: new Set(values) as Selection })
      );
    },
    []
  );

  const activeFilterCount = Object.values(selections).filter(
    (sel) => sel !== 'all' && (sel as Set<Key>).size > 0
  ).length;
  const hasActivePriceFilter = priceRange[0] > 0 || priceRange[1] < PRICE_MAX;
  const hasActiveFilters = activeFilterCount > 0 || hasActivePriceFilter;
  const totalActiveCount = activeFilterCount + (hasActivePriceFilter ? 1 : 0);

  const handleReset = useCallback(() => {
    setSelections({});
    setPriceRange([0, PRICE_MAX]);
    setExpandedKeys(new Set());
    setIsDrawerOpen(false);
    router.replace(`/${listingType}`);
  }, [listingType, router]);

  const handleSearch = useCallback(() => {
    const params = selectionsToParams(listingType, selections);
    if (priceRange[0] > 0) params.set('minPrice', String(priceRange[0]));
    if (priceRange[1] < PRICE_MAX)
      params.set('maxPrice', String(priceRange[1]));
    setIsDrawerOpen(false);
    router.replace(`/${listingType}?${params.toString()}`);
  }, [listingType, selections, priceRange, router]);

  const filterContent = (
    <>
      <Slider
        value={priceRange}
        onChange={(v) => setPriceRange(v as number[])}
        minValue={0}
        maxValue={PRICE_MAX}
        step={PRICE_STEP}
        formatOptions={{
          style: 'currency',
          currency: 'EUR',
          maximumFractionDigits: 0,
        }}
        className="px-4 pb-2">
        <div className="flex items-center justify-between">
          <Label className="text-base">{t('price-range')}</Label>
          <Slider.Output className="dark:text-brand-primary text-tiff-700 text-sm font-medium">
            {({ state }) => {
              const min = state.getThumbValueLabel(0);
              const max =
                priceRange[1] >= PRICE_MAX
                  ? t('price-no-limit')
                  : state.getThumbValueLabel(1);
              return `${min} – ${max}`;
            }}
          </Slider.Output>
        </div>
        <Slider.Track>
          {({ state }) => (
            <>
              <Slider.Fill className="dark:bg-brand-primary bg-tiff-700" />
              {state.values.map((_, i) => (
                <Slider.Thumb
                  key={i}
                  index={i}
                  className="dark:border-brand-primary border-tiff-700 bg-background"
                />
              ))}
            </>
          )}
        </Slider.Track>
      </Slider>

      <Accordion
        allowsMultipleExpanded
        expandedKeys={expandedKeys}
        onExpandedChange={(keys) => setExpandedKeys(keys as Set<Key>)}>
        {FILTERS.map((filter) => {
          const visibleOptions = getVisibleOptions(
            filter.id,
            filter.options,
            selections
          );
          const { label: summary, hasSelection } = getSummary(
            filter,
            selections[filter.id]
          );

          return (
            <Accordion.Item key={filter.id} id={filter.id}>
              <Accordion.Heading>
                <Accordion.Trigger
                  className={expandedKeys.has(filter.id) ? 'pb-0' : ''}>
                  <div className="flex flex-col items-start">
                    <span className="text-base">
                      {getFilterLabel(filter.id)}
                    </span>
                    <span className="text-tiff-700 dark:text-brand-primary h-5 text-base font-normal">
                      {hasSelection && summary}
                    </span>
                  </div>
                  <ChevronDown
                    className={`text-tiff-gray-500 dark:text-tiff-gray-400 size-5 shrink-0 transition-transform duration-200 ${expandedKeys.has(filter.id) ? 'rotate-180' : ''}`}
                  />
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body>
                  {filter.selectionMode === 'single' ? (
                    <RadioGroup
                      value={getSelectedIds(selections[filter.id])[0] ?? ''}
                      onChange={(value) => handleSingleSelect(filter.id, value)}
                      name={`filter-${filter.id}`}>
                      {visibleOptions.map((option) => (
                        <Radio
                          key={option.id}
                          value={option.id}
                          className="group">
                          <Radio.Control>
                            <Radio.Indicator className="radio-indicator-brand" />
                          </Radio.Control>
                          <Radio.Content>
                            <Label className="text-base">
                              {getOptionLabel(filter.id, option.id)}
                            </Label>
                          </Radio.Content>
                        </Radio>
                      ))}
                    </RadioGroup>
                  ) : (
                    <CheckboxGroup
                      value={getSelectedIds(selections[filter.id])}
                      onChange={(values) =>
                        handleMultiSelect(filter.id, values)
                      }>
                      {visibleOptions.map((option) => (
                        <Checkbox
                          key={option.id}
                          value={option.id}
                          className="group">
                          <Checkbox.Control className="checkbox-control-brand">
                            <Checkbox.Indicator className="checkbox-indicator-brand" />
                          </Checkbox.Control>
                          <Checkbox.Content>
                            <Label className="text-base">
                              {getOptionLabel(filter.id, option.id)}
                            </Label>
                          </Checkbox.Content>
                        </Checkbox>
                      ))}
                    </CheckboxGroup>
                  )}
                </Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="bg-glass-no-border text-tiff-gray-900 dark:text-tiff-gray-50 hidden w-72 shrink-0 flex-col rounded-xl md:flex">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-lg font-semibold">{t('title')}</h2>
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="text-tiff-700 hover:text-tiff-gray-900 dark:text-tiff-gray-400 dark:hover:text-tiff-gray-100 text-sm underline underline-offset-2 transition-colors">
              {t('reset-filters')}
            </button>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-4 p-4">{filterContent}</div>
        <div className="border-tiff-gray-200 border-t p-4 dark:border-white/10">
          <Button
            className="bg-tiff-700 dark:bg-brand-primary w-full text-base font-semibold text-white"
            onPress={handleSearch}>
            <Search className="size-5" />
            {t('search-button')}
          </Button>
        </div>
      </aside>

      {/* Mobile trigger */}
      <div className="mb-4 flex items-center gap-3 md:hidden">
        <Button
          onPress={() => setIsDrawerOpen(true)}
          className="bg-tiff-700 dark:bg-brand-primary flex items-center gap-2 text-base font-semibold text-white">
          <SlidersHorizontal className="size-5" />
          {t('filters-button')}
          {hasActiveFilters && (
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-sm font-bold">
              {totalActiveCount}
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-tiff-700 hover:text-tiff-gray-900 dark:text-tiff-gray-400 dark:hover:text-tiff-gray-100 text-sm underline underline-offset-2 transition-colors">
            {t('reset-filters')}
          </button>
        )}
      </div>

      {/* Mobile drawer portal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isDrawerOpen && (
              <>
                <motion.div
                  key="backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsDrawerOpen(false)}
                  className="fixed inset-0 z-100 bg-black/50 backdrop-blur-sm"
                />
                <motion.div
                  key="panel"
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="bg-glass-no-border fixed inset-y-0 left-0 z-150 w-full shadow-2xl md:w-[400px]">
                  <div className="text-tiff-gray-900 dark:text-tiff-gray-50 flex h-full flex-col">
                    <Button
                      className="m-1 self-end"
                      isIconOnly
                      variant="ghost"
                      onPress={() => setIsDrawerOpen(false)}
                      aria-label={t('close')}>
                      <X className="size-6" />
                    </Button>
                    <div className="flex items-center justify-center gap-3 px-4">
                      <h2 className="text-center text-lg font-semibold">
                        {t('title')}
                      </h2>
                      {hasActiveFilters && (
                        <button
                          onClick={handleReset}
                          className="text-tiff-700 hover:text-tiff-gray-900 dark:text-tiff-gray-400 dark:hover:text-tiff-gray-100 text-sm underline underline-offset-2 transition-colors">
                          {t('reset-filters')}
                        </button>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 text-lg">
                      {filterContent}
                    </div>
                    <div className="border-tiff-gray-200 border-t p-4 dark:border-white/10">
                      <Button
                        className="bg-tiff-700 dark:bg-brand-primary w-full text-base font-semibold text-white"
                        onPress={handleSearch}>
                        <Search className="size-5" />
                        {t('search-button')}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};

export default ListingsFilters;
