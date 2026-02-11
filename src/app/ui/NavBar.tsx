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
    <div className="bg-surface dark:bg-leon-blue-950">
      <div className="hidden w-full items-center px-5 md:flex">
        <div className="flex-1" aria-hidden />
        <NavigationLink className="hidden self-center md:block" href="/">
          <ThemeLogo />
        </NavigationLink>
        <div className="flex flex-1 items-center justify-end gap-2 md:flex">
          <LocaleDropDown />
          <ThemeSwitch />
        </div>
      </div>
      <nav className="text-tiff-gray-950 dark:text-leon-blue-50 flex w-full items-end justify-around gap-10 font-light shadow-xs md:px-2 md:pb-3 dark:shadow-none">
        <div className="hidden items-end gap-10 md:flex">
          {navLinks.map((link) =>
            link.href === '/contact' ? (
              <NavLinkButton
                className="font-medium"
                key={link.href}
                href={link.href}>
                {link.label}
              </NavLinkButton>
            ) : (
              <NavigationLink key={link.href} href={link.href}>
                {link.label}
              </NavigationLink>
            )
          )}
        </div>

        <MobileNavBar navItems={navLinks}>
          <LocaleDropDown />
          <ThemeSwitch />
        </MobileNavBar>
      </nav>
    </div>
  );
}
