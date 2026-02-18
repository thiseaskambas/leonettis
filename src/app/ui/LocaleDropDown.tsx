'use client';

import { Button, Dropdown, Label, Selection } from '@heroui/react';
import { DE, FR, GB, GR, IT } from 'country-flag-icons/react/1x1';
import { useLocale } from 'next-intl';
import { useState } from 'react';

import { usePathname, useRouter } from '@/i18n/navigation';
import { locales } from '@/i18n/routing';

const FlagIcons = {
  en: GB,
  fr: FR,
  gr: GR,
  de: DE,
  it: IT,
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
        className="rounded-none bg-transparent"
        aria-label="select language">
        <SelectedFlag className="size-8 rounded-full md:size-7" />
      </Button>
      <Dropdown.Popover className="-ml-4 h-screen w-screen min-w-screen rounded-none border-none bg-transparent px-4 py-12 shadow-none backdrop-blur-md md:relative md:top-auto md:ml-0 md:h-auto md:w-auto md:min-w-auto md:p-0 md:px-0">
        <Dropdown.Menu
          selectedKeys={selected}
          selectionMode="single"
          disallowEmptySelection
          className="items-center gap-4 bg-none md:items-start md:gap-0"
          onSelectionChange={handleSelectionChange}>
          {Object.values(locales)
            .filter((locale) => locale.value !== currentLocale)
            .map((locale) => {
              const Flag = FlagIcons[locale.value];
              return (
                <Dropdown.Item
                  className="dark:hover:bg-brand-accent hover:bg-surface-hover justify-center rounded-none md:justify-start"
                  key={locale.short}
                  id={locale.short}
                  textValue={locale.label}>
                  <Label className="flex w-36 items-center justify-start gap-4 md:w-auto md:gap-2">
                    <Flag className="size-8 shrink-0 rounded-full md:size-7" />
                    <span className="text-left text-xl">{locale.label}</span>
                  </Label>
                </Dropdown.Item>
              );
            })}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
