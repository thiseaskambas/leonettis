'use client';

import { Accordion } from '@heroui/react';
import { DE, FR, GB, GR, IT } from 'country-flag-icons/react/1x1';
import { Check } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

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

export function MobileSettingsSection() {
  const t = useTranslations('nav');
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const handleLocaleChange = (localeValue: string) => {
    const locale = Object.values(locales).find((l) => l.value === localeValue);
    if (locale) {
      router.replace(pathname, { locale: locale.value });
    }
  };

  return (
    <Accordion
      className="text-leon-blue-950 dark:text-leon-blue-50 w-full [&_.accordion__body-inner]:px-0 [&_[data-slot=accordion-trigger]]:px-0"
      expandedKeys={expandedKeys}
      onExpandedChange={(keys) => setExpandedKeys(keys as Set<string>)}>
      <Accordion.Item key="settings" id="settings">
        <Accordion.Heading>
          <Accordion.Trigger className="hover:text-brand-primary w-full justify-between border-b border-white/10 px-0 py-4 text-left text-lg font-medium tracking-wide transition-colors data-expanded:border-b-0 dark:border-black/20">
            {t('settings')}
            <Accordion.Indicator className="shrink-0" />
          </Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <Accordion.Body className="px-0 pt-0 pb-0">
            <div className="flex flex-col">
              {/* Language block */}
              <div role="group" aria-labelledby="language-section-label">
                <span
                  id="language-section-label"
                  className="text-leon-blue-950/70 dark:text-leon-blue-50/70 mb-2 block pt-4 text-xs font-medium tracking-wider uppercase">
                  {t('language')}
                </span>
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
                      className={`flex w-full items-center justify-between border-b border-white/10 py-4 text-left transition-colors last:border-b-0 hover:bg-white/10 dark:border-black/20 dark:hover:bg-black/10 ${
                        isSelected
                          ? 'text-leon-blue-950 dark:text-leon-blue-50 bg-white/10 dark:bg-black/10'
                          : 'text-leon-blue-950 dark:text-leon-blue-50'
                      }`}>
                      <span className="flex items-center gap-3">
                        <Flag className="size-6 shrink-0 rounded-full" />
                        <span className="text-lg font-medium tracking-wide">
                          {locale.label}
                        </span>
                      </span>
                      {isSelected && (
                        <Check className="text-brand-primary size-5 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Theme block */}
              <div role="group" aria-labelledby="theme-section-label">
                <span
                  id="theme-section-label"
                  className="text-leon-blue-950/70 dark:text-leon-blue-50/70 mb-2 block pt-4 text-xs font-medium tracking-wider uppercase">
                  {t('theme')}
                </span>
                <div className="flex w-full items-center justify-between border-b border-white/10 py-4 last:border-b-0 dark:border-black/20">
                  <span className="text-lg font-medium tracking-wide">
                    {t('theme')}
                  </span>
                  <ThemeSwitch />
                </div>
              </div>
            </div>
          </Accordion.Body>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
