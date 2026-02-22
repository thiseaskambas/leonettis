'use client';

import { useState } from 'react';

import { MobileNavBar } from './MobileNavBar';
import { MobileSettingsSection } from './MobileSettingsSection';
import NavigationLink from './NavigationLink';
import { SettingsMenu } from './SettingsMenu';
import { ThemeLogo } from './ThemeLogo';

interface NavLink {
  href: string;
  label: string;
}

interface NavBarClientProps {
  navLinks: NavLink[];
}

const CONTAINER_CLASS =
  'mx-auto w-full max-w-7xl px-4 md:mx-4 md:px-6 lg:mx-auto lg:px-8';

const KEEP_MENU_OPEN_KEY = 'keepMobileMenuOpen';

export function NavBarClient({ navLinks }: NavBarClientProps) {
  const [state, setState] = useState<{
    isOpen: boolean;
    skipEnterAnimation: boolean;
  }>(() => {
    if (typeof window === 'undefined')
      return { isOpen: false, skipEnterAnimation: false };
    const shouldKeepOpen =
      sessionStorage.getItem(KEEP_MENU_OPEN_KEY) === 'true';
    if (shouldKeepOpen) sessionStorage.removeItem(KEEP_MENU_OPEN_KEY);
    return {
      isOpen: shouldKeepOpen,
      skipEnterAnimation: shouldKeepOpen,
    };
  });

  const setIsOpen = (value: boolean | ((prev: boolean) => boolean)) => {
    setState((prev) => ({
      isOpen: typeof value === 'function' ? value(prev.isOpen) : value,
      skipEnterAnimation: false,
    }));
  };

  return (
    <div className="fixed top-0 right-0 left-0 z-50 w-full">
      {/* Desktop: contained navbar - Logo left, Nav center, Contact + utilities right */}
      <div
        className={`hidden grid-cols-[1fr_auto_1fr] items-center ${CONTAINER_CLASS} py-0 md:grid ${!state.isOpen ? 'bg-glass-no-border rounded-2xl shadow-lg md:mt-4' : ''}`}>
        <div className="relative flex items-center justify-start">
          <div className="absolute inset-0 rounded-full bg-white/50 blur-xl dark:bg-black/30" />
          <NavigationLink
            underline={false}
            className="relative z-10 drop-shadow-md"
            href="/">
            <ThemeLogo />
          </NavigationLink>
        </div>

        <nav className="text-leon-blue-950 dark:text-leon-blue-50 flex items-center justify-center gap-8 text-[14px] font-medium md:gap-10">
          {navLinks.map((link) =>
            link.href === '/contact' ? (
              <NavigationLink
                key={link.href}
                href={link.href}
                className="text-leon-600 dark:text-leon-300 font-bold">
                {link.label}
              </NavigationLink>
            ) : (
              <NavigationLink key={link.href} href={link.href}>
                {link.label}
              </NavigationLink>
            )
          )}
        </nav>

        <div className="flex items-center justify-end">
          <SettingsMenu />
        </div>
      </div>

      {/* Mobile: contained bar + bottom-sheet menu */}
      <MobileNavBar
        isOpen={state.isOpen}
        setIsOpen={setIsOpen}
        navItems={navLinks}
        skipEnterAnimation={state.skipEnterAnimation}>
        <MobileSettingsSection />
      </MobileNavBar>
    </div>
  );
}
