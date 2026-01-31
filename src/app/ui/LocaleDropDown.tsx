'use client';

import { Button, Dropdown, Label, Selection } from '@heroui/react';
import { useLocale } from 'next-intl';
import { useState } from 'react';

import { usePathname, useRouter } from '@/i18n/navigation';
import { locales } from '@/i18n/routing';

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
  const handleSelectionChange = (keys: Selection) => {
    setSelected(keys);
    const newLocale = Object.values(locales).find(
      (locale) => locale.short === Array.from(keys)[0]
    );
    console.log(newLocale);
    if (newLocale) {
      router.replace(pathname, { locale: newLocale.value });
    }
  };

  return (
    <Dropdown>
      <Button aria-label="Menu" variant="secondary">
        {selected}
      </Button>
      <Dropdown.Popover>
        <Dropdown.Menu
          selectedKeys={selected}
          selectionMode="single"
          disallowEmptySelection
          onSelectionChange={handleSelectionChange}
          onAction={(key) => console.log(`Selected: ${key}`)}>
          {Object.values(locales).map((locale) => (
            <Dropdown.Item
              key={locale.short}
              id={locale.short}
              textValue={locale.label}>
              <Label className="flex items-center gap-2">
                {locale.icon} {locale.label}
              </Label>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
