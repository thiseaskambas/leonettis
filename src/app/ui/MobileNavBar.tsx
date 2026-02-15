'use client';

import { Menu, X } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect } from 'react';

import { Link } from '@/i18n/navigation';

import NavigationLink from './NavigationLink';
import { ThemeLogo } from './ThemeLogo';

interface NavItem {
  label: string;
  href: string;
}

interface MobileNavBarProps {
  navItems: NavItem[];
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  children?: React.ReactNode; // For ThemeSwitcher / LocaleDropDown if you want them inside
}

export function MobileNavBar({
  navItems,
  children,
  isOpen,
  setIsOpen,
}: MobileNavBarProps) {
  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'unset';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div className="w-full md:hidden">
      <div className={`flex justify-between p-2 ${isOpen ? 'hidden' : ''}`}>
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-white/50 blur-xl dark:bg-black/30" />
          <NavigationLink href="/" className="relative z-10 drop-shadow-md">
            <ThemeLogo />
          </NavigationLink>
        </div>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          className="text-leon-blue-950 dark:text-leon-blue-50 flex items-center justify-center p-2">
          <Menu size={32} />
        </button>
      </div>

      {isOpen && (
        <div className="bg-glass-no-border fixed inset-0 z-50 h-screen w-full">
          <div className="flex justify-between p-2">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-white/50 blur-xl dark:bg-black/30" />
              <NavigationLink
                href="/"
                onClick={() => setIsOpen(false)}
                className="relative z-10 drop-shadow-md">
                <ThemeLogo />
              </NavigationLink>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
              className="text-leon-blue-950 dark:text-leon-blue-50 flex items-center justify-center p-2">
              <X className="flex items-center justify-center" size={32} />
            </button>
          </div>
          {/* Links Container */}
          <div className="mt-8 flex items-center justify-center gap-4">
            {children}
          </div>
          <div className="text-leon-blue-950 dark:text-leon-blue-50 mt-12 flex flex-1 flex-col items-center gap-8 text-2xl font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="hover:text-brand-primary transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
