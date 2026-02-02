import { getTranslations } from 'next-intl/server';

import { LocaleDropDown } from './LocaleDropDown';
import NavigationLink from './NavigationLink';
import NavLinkButton from './NavLinkButton';
import { ThemeLogo } from './ThemeLogo';
import ThemeSwitch from './ThemeSwitcher';

export async function NavBar() {
  const t = await getTranslations('nav');
  return (
    <nav className="dark:bg-leon-blue-950 text-leon-blue-950 dark:text-leon-blue-50 flex w-full items-end justify-between gap-10 bg-white px-2 pb-2 font-medium">
      <NavigationLink className="ml-0 self-start" href="/">
        <ThemeLogo />
      </NavigationLink>
      <div className="flex items-center gap-10">
        <NavigationLink href="/buy">{t('buy')}</NavigationLink>
        <NavigationLink href="/rent">{t('rent')}</NavigationLink>
        <NavigationLink href="/list-a-property">
          {t('list-a-property')}
        </NavigationLink>
        <NavigationLink href="/blog">{t('blog')}</NavigationLink>
        <NavigationLink href="/about">{t('about')}</NavigationLink>
        <NavLinkButton href="/contact">{t('contact')}</NavLinkButton>
      </div>
      <div className="flex items-center gap-2 self-start">
        <LocaleDropDown />
        <ThemeSwitch />
      </div>
    </nav>
  );
}
