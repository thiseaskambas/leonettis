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

const CONTAINER_CLASS =
  'mx-auto w-full max-w-7xl px-4 md:mx-4 md:px-6 lg:mx-auto lg:px-8';

export function NavBarClient({ navLinks }: NavBarClientProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-0 right-0 left-0 z-50 w-full">
      {/* Desktop: contained navbar - Logo left, Nav center, Contact + utilities right */}
      <div
        className={`hidden items-center justify-between ${CONTAINER_CLASS} py-3 md:flex ${!isOpen ? 'bg-glass-no-border rounded-2xl shadow-lg md:mt-4' : ''}`}>
        <div className="relative flex shrink-0 items-center">
          <div className="absolute inset-0 rounded-full bg-white/50 blur-xl dark:bg-black/30" />
          <NavigationLink
            underline={false}
            className="relative z-10 drop-shadow-md"
            href="/">
            <ThemeLogo />
          </NavigationLink>
        </div>

        <nav className="text-leon-blue-950 dark:text-leon-blue-50 flex flex-1 items-center justify-center gap-8 font-light md:gap-10">
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
        </nav>

        <div className="flex shrink-0 items-center justify-end gap-2">
          <LocaleDropDown />
          <ThemeSwitch />
        </div>
      </div>

      {/* Mobile: contained bar + bottom-sheet menu */}
      <MobileNavBar isOpen={isOpen} setIsOpen={setIsOpen} navItems={navLinks}>
        <LocaleDropDown />
        <ThemeSwitch />
      </MobileNavBar>
    </div>
  );
}
