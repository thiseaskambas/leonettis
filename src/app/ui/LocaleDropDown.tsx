'use client';

import { Button, Dropdown, Label, Selection } from '@heroui/react';
import { FR, GB, GR } from 'country-flag-icons/react/3x2';
import { useLocale } from 'next-intl';
import { useState } from 'react';

import { usePathname, useRouter } from '@/i18n/navigation';
import { locales } from '@/i18n/routing';

const FlagIcons = {
  en: GB,
  fr: FR,
  gr: GR,
};

export function LocaleDropDown() {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const currentLocaleObject = Object.values(locales).find(
    (locale) => locale.value === currentLocale
  );
  const [selected, setSelected] = useState<Selection>(
    new Set([currentLocaleObject?.short ?? ''])
  );
  const selectedShort = Array.from(selected)[0];
  const selectedItem = Object.values(locales).find(
    (locale) => locale.short === selectedShort
  );
  const SelectedFlag = selectedItem ? FlagIcons[selectedItem.value] : GB;
  const handleSelectionChange = (keys: Selection) => {
    setSelected(keys);
    const newLocale = Object.values(locales).find(
      (locale) => locale.short === Array.from(keys)[0]
    );
    if (newLocale) {
      router.replace(pathname, { locale: newLocale.value });
    }
  };

  return (
    <Dropdown>
      <Button
        className="text-brand-tertiary bg-surface dark:bg-leon-900 rounded-none"
        aria-label="select language">
        <SelectedFlag className="h-5 w-5" />
      </Button>
      <Dropdown.Popover className="bg-surface dark:bg-leon-900 rounded-none border-none shadow-none">
        <Dropdown.Menu
          selectedKeys={selected}
          selectionMode="single"
          disallowEmptySelection
          onSelectionChange={handleSelectionChange}>
          {Object.values(locales).map((locale) => {
            const Flag = FlagIcons[locale.value];
            return (
              <Dropdown.Item
                className="rounded-none"
                key={locale.short}
                id={locale.short}
                textValue={locale.label}>
                <Label className="flex items-center gap-2">
                  <Flag className="h-5 w-5" /> {locale.label}
                </Label>
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
