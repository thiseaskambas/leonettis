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
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  FILTERS,
  getButtonLabel,
  getSelectedIds,
  getVisibleOptions,
  pruneSelections,
} from '../lib/definitions/search-filters';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchBar = ({ isOpen, onClose }: SearchBarProps) => {
  const [mounted, setMounted] = useState(false);
  const [selections, setSelections] = useState<Record<string, Selection>>({});

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
              className="self-end"
              isIconOnly
              variant="ghost"
              onPress={onClose}
              aria-label="Close search">
              <X className="size-5" />
            </Button>

            <h2 className="text-center text-lg font-semibold">Search</h2>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
              <RadioGroup
                defaultValue="buy"
                name="listing-type"
                orientation="horizontal">
                <Label>Listing Type</Label>
                <Radio value="buy">
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  <Radio.Content>
                    <Label>Buy</Label>
                    <Description>Properties for sale</Description>
                  </Radio.Content>
                </Radio>
                <Radio value="rent">
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  <Radio.Content>
                    <Label>Rent</Label>
                    <Description>Properties for rent</Description>
                  </Radio.Content>
                </Radio>
              </RadioGroup>

              <Accordion allowsMultipleExpanded>
                {FILTERS.map((filter) => {
                  const visibleOptions = getVisibleOptions(
                    filter.id,
                    filter.options,
                    selections
                  );
                  const summary = getButtonLabel(filter, selections[filter.id]);
                  const hasSelection = summary !== filter.label;

                  return (
                    <Accordion.Item key={filter.id} id={filter.id}>
                      <Accordion.Heading>
                        <Accordion.Trigger>
                          <div className="flex flex-col items-start">
                            <span>{filter.label}</span>
                            {hasSelection && (
                              <span className="text-brand-primary text-sm font-normal">
                                {summary}
                              </span>
                            )}
                          </div>
                          <Accordion.Indicator />
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
                                    <Label>{option.label}</Label>
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
                                    <Label>{option.label}</Label>
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
