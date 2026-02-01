import { getTranslations } from 'next-intl/server';

import { LocaleDropDown } from './LocaleDropDown';
import NavigationLink from './NavigationLink';
import ThemeSwitch from './ThemeSwitcher';

export async function NavBar() {
  const t = await getTranslations('nav');
  return (
    <nav className="bg-surface dark:bg-surface-raised flex items-center justify-between">
      <NavigationLink href="/">{t('home')}</NavigationLink>
      <NavigationLink href="/buy">{t('buy')}</NavigationLink>
      <NavigationLink href="/rent">{t('rent')}</NavigationLink>
      <NavigationLink href="/list-a-property">
        {t('list-a-property')}
      </NavigationLink>
      <NavigationLink href="/blog">{t('blog')}</NavigationLink>
      <NavigationLink href="/about">{t('about')}</NavigationLink>
      <NavigationLink href="/contact">{t('contact')}</NavigationLink>
      <ThemeSwitch />
      <LocaleDropDown />
    </nav>
  );
}
