'use client';

import type { Selection } from '@heroui/react';
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
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import type { FilterDef } from '../lib/definitions/search-filters';
import {
  FILTERS,
  getSelectedIds,
  getVisibleOptions,
  pruneSelections,
} from '../lib/definitions/search-filters';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchBar = ({ isOpen, onClose }: SearchBarProps) => {
  const t = useTranslations('search-bar');
  const [mounted, setMounted] = useState(false);
  const [selections, setSelections] = useState<Record<string, Selection>>({});

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
                defaultValue="buy"
                name="listing-type"
                className="p-4">
                <Label className="text-base">{t('listing-type-label')}</Label>
                <div className="flex gap-4">
                  <Radio value="buy">
                    <Radio.Control>
                      <Radio.Indicator />
                    </Radio.Control>
                    <Radio.Content>
                      <Label className="text-base">{t('buy-label')}</Label>
                      <Description className="dark:text-muted/50 text-white/90">
                        {t('buy-description')}
                      </Description>
                    </Radio.Content>
                  </Radio>
                  <Radio value="rent">
                    <Radio.Control>
                      <Radio.Indicator />
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

              <Accordion allowsMultipleExpanded>
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
                        <Accordion.Trigger>
                          <div className="flex flex-col items-start">
                            <span className="text-base">
                              {getFilterLabel(filter.id)}
                            </span>
                            {hasSelection && (
                              <span className="text-brand-primary text-base font-normal">
                                {summary}
                              </span>
                            )}
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
                                <Radio key={option.id} value={option.id}>
                                  <Radio.Control>
                                    <Radio.Indicator />
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
                                <Checkbox key={option.id} value={option.id}>
                                  <Checkbox.Control>
                                    <Checkbox.Indicator />
                                  </Checkbox.Control>
                                  <Checkbox.Content>
                                    <Label>
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default SearchBar;
