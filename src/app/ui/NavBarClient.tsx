'use client';

import { useState } from 'react';

import { LocaleDropDown } from './LocaleDropDown';
import { MobileNavBar } from './MobileNavBar';
import NavigationLink from './NavigationLink';
import NavLinkButton from './NavLinkButton';
import { ThemeLogo } from './ThemeLogo';
import ThemeSwitch from './ThemeSwitcher';

interface NavLink {
  href: string;
  label: string;
}

interface NavBarClientProps {
  navLinks: NavLink[];
}

export function NavBarClient({ navLinks }: NavBarClientProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="glass-adaptive-no-border animate-liquid absolute top-0 left-0 z-50 w-full bg-linear-to-r from-white/5 via-white/20 to-white/5 bg-size-[200%_200%] backdrop-blur-md [--bg:white] dark:from-black/5 dark:via-black/20 dark:to-black/5 dark:[--bg:black]">
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

      <nav className="text-leon-blue-950 dark:text-leon-blue-50 flex w-full items-end justify-around gap-10 font-light shadow-xs md:px-2 md:pb-3 dark:shadow-none">
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

        {/* MobileNavBar handles its own visibility trigger */}
        <MobileNavBar isOpen={isOpen} setIsOpen={setIsOpen} navItems={navLinks}>
          <LocaleDropDown />
          <ThemeSwitch />
        </MobileNavBar>
      </nav>
    </div>
  );
}
