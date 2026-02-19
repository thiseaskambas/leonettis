'use client';

import type { Key, Selection } from '@heroui/react';
import {
  Accordion,
  Button,
  Checkbox,
  CheckboxGroup,
  Description,
  Label,
  Radio,
  RadioGroup,
} from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
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

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchBar = ({ isOpen, onClose }: SearchBarProps) => {
  const t = useTranslations('search-bar');
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selections, setSelections] = useState<Record<string, Selection>>({});
  const [expandedKeys, setExpandedKeys] = useState<Set<Key>>(new Set());
  const [listingType, setListingType] = useState<'buy' | 'rent'>('buy');

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

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setMounted(true);
    return () => setMounted(false);
  }, []);

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

  const handleSearch = useCallback(() => {
    const params = selectionsToParams(listingType, selections);
    const route = listingType === 'rent' ? '/rent' : '/buy';
    onClose();
    router.push(`${route}?${params.toString()}`);
  }, [listingType, selections, onClose, router]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-100 bg-black/50 backdrop-blur-sm"
        />
      )}
      {isOpen && (
        <motion.div
          key="panel"
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-glass-no-border fixed inset-y-0 left-0 z-150 w-full shadow-2xl md:w-[400px]">
          <div className="flex h-full flex-col">
            <Button
              className="m-1 self-end"
              isIconOnly
              variant="ghost"
              onPress={onClose}
              aria-label={t('close')}>
              <X className="size-6" />
            </Button>

            <h2 className="text-center text-lg font-semibold">{t('title')}</h2>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 text-lg">
              <RadioGroup
                value={listingType}
                onChange={(value) => setListingType(value as 'buy' | 'rent')}
                name="listing-type"
                className="p-4">
                <Label className="text-base">{t('listing-type-label')}</Label>
                <div className="flex gap-4">
                  <Radio value="buy" className="group">
                    <Radio.Control>
                      <Radio.Indicator className="radio-indicator-brand" />
                    </Radio.Control>
                    <Radio.Content>
                      <Label className="text-base">{t('buy-label')}</Label>
                      <Description className="dark:text-muted/50 text-white/90">
                        {t('buy-description')}
                      </Description>
                    </Radio.Content>
                  </Radio>
                  <Radio value="rent" className="group">
                    <Radio.Control>
                      <Radio.Indicator className="radio-indicator-brand" />
                    </Radio.Control>
                    <Radio.Content>
                      <Label className="text-base">{t('rent-label')}</Label>
                      <Description className="dark:text-muted/50 text-white/90">
                        {t('rent-description')}
                      </Description>
                    </Radio.Content>
                  </Radio>
                </div>
              </RadioGroup>

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
                            <span className="text-brand-primary h-5 text-base font-normal">
                              {hasSelection && summary}
                            </span>
                          </div>
                          <Accordion.Indicator className="dark:text-muted/50 text-white/90" />
                        </Accordion.Trigger>
                      </Accordion.Heading>
                      <Accordion.Panel>
                        <Accordion.Body>
                          {filter.selectionMode === 'single' ? (
                            <RadioGroup
                              value={
                                getSelectedIds(selections[filter.id])[0] ?? ''
                              }
                              onChange={(value) =>
                                handleSingleSelect(filter.id, value)
                              }
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
            </div>

            <div className="border-t border-white/10 p-4">
              <Button
                className="bg-brand-primary w-full text-base font-semibold text-white"
                onPress={handleSearch}>
                <Search className="size-5" />
                {t('search-button')}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default SearchBar;
