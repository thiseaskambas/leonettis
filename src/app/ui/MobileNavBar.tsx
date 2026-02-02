'use client';

import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Link } from '@/i18n/navigation';

import NavigationLink from './NavigationLink';
import { ThemeLogo } from './ThemeLogo';

interface NavItem {
  label: string;
  href: string;
}

interface MobileNavBarProps {
  navItems: NavItem[];
  children?: React.ReactNode; // For ThemeSwitcher / LocaleDropDown if you want them inside
}

export function MobileNavBar({ navItems, children }: MobileNavBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div className="w-full md:hidden">
      {/* Burger Button */}
      <div className="flex p-2">
        <NavigationLink href="/">
          <ThemeLogo />
        </NavigationLink>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          className="text-leon-blue-950 dark:text-leon-blue-50 flex items-center justify-center p-2">
          <Menu size={32} />
        </button>
      </div>
      {/* Fullscreen Overlay */}
      {isOpen && (
        <div className="dark:bg-leon-blue-950 fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex p-2">
            <NavigationLink href="/" onClick={() => setIsOpen(false)}>
              <ThemeLogo />
            </NavigationLink>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
              className="text-leon-blue-950 dark:text-leon-blue-50 flex items-center justify-center p-2">
              <X className="flex items-center justify-center" size={32} />
            </button>
          </div>
          {/* Links Container */}
          <div className="text-leon-blue-950 dark:text-leon-blue-50 flex flex-1 flex-col items-center justify-center gap-8 text-2xl font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="hover:text-brand-primary transition-colors">
                {item.label}
              </Link>
            ))}

            <div className="mt-8 flex gap-4">{children}</div>
          </div>
        </div>
      )}
    </div>
  );
}
