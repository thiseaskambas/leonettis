'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

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
  children?: React.ReactNode;
}

const CONTAINER_CLASS =
  'mx-auto w-full max-w-7xl px-4 md:mx-4 md:px-6 lg:mx-auto lg:px-8';

export function MobileNavBar({
  navItems,
  children,
  isOpen,
  setIsOpen,
}: MobileNavBarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    return () => setMounted(false);
  }, []);

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

  const closeMenu = () => setIsOpen(false);

  const closedBar = (
    <div
      className={`flex w-full items-center justify-between pt-4 md:hidden ${CONTAINER_CLASS}`}>
      <div className="bg-glass-no-border flex flex-1 items-center justify-between rounded-2xl px-4 py-3 shadow-lg">
        <NavigationLink
          underline={false}
          href="/"
          className="relative z-10 drop-shadow-md">
          <ThemeLogo />
        </NavigationLink>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Open menu"
          aria-expanded={isOpen}
          className="text-leon-blue-950 dark:text-leon-blue-50 flex items-center justify-center p-2">
          <Menu size={28} />
        </button>
      </div>
    </div>
  );

  const mobileMenuPortal =
    mounted &&
    createPortal(
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
            />
            <motion.div
              key="mobile-panel"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-glass-no-border fixed inset-x-4 top-auto bottom-0 z-50 flex h-[92dvh] flex-col overflow-hidden rounded-t-2xl shadow-2xl md:hidden">
              {/* Navbar row at top - merged with panel */}
              <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 dark:border-black/20">
                <NavigationLink
                  underline={false}
                  href="/"
                  onClick={closeMenu}
                  className="relative z-10 drop-shadow-md">
                  <ThemeLogo />
                </NavigationLink>
                <button
                  onClick={closeMenu}
                  aria-label="Close menu"
                  className="text-leon-blue-950 dark:text-leon-blue-50 flex items-center justify-center rounded-full p-2 transition-colors hover:bg-white/20 dark:hover:bg-black/20">
                  <X size={28} />
                </button>
              </div>

              {/* Menu content */}
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto py-6">
                <nav className="text-leon-blue-950 dark:text-leon-blue-50 flex flex-col gap-1 px-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className="hover:text-brand-primary border-b border-white/10 py-4 text-left text-lg font-medium tracking-wide transition-colors last:border-b-0 dark:border-black/20">
                      {item.label}
                    </Link>
                  ))}
                </nav>

                {/* Language and theme selectors at bottom */}
                <div className="flex shrink-0 items-center justify-center gap-4 border-t border-white/10 px-6 py-4 dark:border-black/20">
                  {children}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
    );

  return (
    <div className="w-full md:hidden">
      {!isOpen && closedBar}
      {mobileMenuPortal}
    </div>
  );
}
