import { getTranslations } from 'next-intl/server';

import { LocaleDropDown } from './LocaleDropDown';
import { MobileNavBar } from './MobileNavBar'; // Import the new component
import NavigationLink from './NavigationLink';
import NavLinkButton from './NavLinkButton';
import { ThemeLogo } from './ThemeLogo';
import ThemeSwitch from './ThemeSwitcher';

export async function NavBar() {
  const t = await getTranslations('nav');

  // Define links data here to share or pass to mobile
  const navLinks = [
    { href: '/buy', label: t('buy') },
    { href: '/rent', label: t('rent') },
    { href: '/list-a-property', label: t('list-a-property') },
    { href: '/blog', label: t('blog') },
    { href: '/about', label: t('about') },
    { href: '/contact', label: t('contact') },
  ];

  return (
    <nav className="dark:bg-leon-blue-950 text-leon-blue-950 dark:text-leon-blue-50 bg-surface flex w-full items-end justify-between gap-10 font-medium shadow-xs md:px-2 md:pb-3 dark:shadow-none">
      <NavigationLink className="ml-0 hidden self-start md:block" href="/">
        <ThemeLogo />
      </NavigationLink>

      <div className="hidden items-center gap-10 md:flex">
        {navLinks.map((link) =>
          link.href === '/contact' ? (
            <NavLinkButton key={link.href} href={link.href}>
              {link.label}
            </NavLinkButton>
          ) : (
            <NavigationLink key={link.href} href={link.href}>
              {link.label}
            </NavigationLink>
          )
        )}
      </div>

      <div className="hidden items-center gap-2 self-start md:flex">
        <LocaleDropDown />
        <ThemeSwitch />
      </div>

      <MobileNavBar navItems={navLinks}>
        <LocaleDropDown />
        <ThemeSwitch />
      </MobileNavBar>
    </nav>
  );
}
