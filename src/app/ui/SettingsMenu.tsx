'use client';

import { Button, Popover } from '@heroui/react';
import { DE, FR, GB, GR, IT } from 'country-flag-icons/react/1x1';
import { Settings } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';

import { usePathname, useRouter } from '@/i18n/navigation';
import { locales } from '@/i18n/routing';

import ThemeSwitch from './ThemeSwitcher';

const FlagIcons = {
  en: GB,
  fr: FR,
  gr: GR,
  de: DE,
  it: IT,
};

export function SettingsMenu() {
  const t = useTranslations('nav');
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleLocaleChange = (localeValue: string) => {
    const locale = Object.values(locales).find((l) => l.value === localeValue);
    if (locale) {
      router.replace(pathname, { locale: locale.value });
    }
  };

  return (
    <Popover>
      <Button
        isIconOnly
        aria-label={t('settings')}
        className="bg-transparent"
        variant="ghost">
        <Settings className="text-leon-blue-950 dark:text-leon-blue-50 size-5" />
      </Button>
      <Popover.Content className="bg-glass min-w-48 p-0">
        <div className="flex flex-col gap-4 px-4 py-3">
          <div className="flex flex-col gap-2">
            <span className="text-leon-blue-950 dark:text-leon-blue-50 text-xs font-medium tracking-wider uppercase">
              {t('language')}
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.values(locales).map((locale) => {
                const Flag = FlagIcons[locale.value];
                const isSelected = currentLocale === locale.value;
                return (
                  <button
                    key={locale.value}
                    type="button"
                    onClick={() => handleLocaleChange(locale.value)}
                    aria-label={locale.label}
                    aria-pressed={isSelected}
                    className={`hover:bg-leon-200/30 dark:hover:bg-leon-800/30 cursor-pointer rounded-full p-1 transition-colors ${
                      isSelected
                        ? 'ring-brand-primary ring-2 ring-offset-2 dark:ring-offset-gray-900'
                        : ''
                    }`}>
                    <Flag className="size-7 rounded-full" />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="border-divider flex flex-col gap-2 border-t pt-3">
            <span className="text-leon-blue-950 dark:text-leon-blue-50 text-xs font-medium tracking-wider uppercase">
              {t('theme')}
            </span>
            <ThemeSwitch />
          </div>
        </div>
      </Popover.Content>
    </Popover>
  );
}
