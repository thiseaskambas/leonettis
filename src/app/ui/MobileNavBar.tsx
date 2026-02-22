'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

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
  skipEnterAnimation?: boolean;
  children?: React.ReactNode;
}

const springTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 28,
} as const;

export function MobileNavBar({
  navItems,
  children,
  isOpen,
  setIsOpen,
  skipEnterAnimation = false,
}: MobileNavBarProps) {
  // Keep the container expanded (bottom-0) until the exit animation fully
  // completes — otherwise the panel's flex-1 height collapses to zero mid-slide
  // and y:'100%' becomes a no-op, leaving the panel stuck on screen.
  // Set to true via onAnimationStart (panel enter), false via onExitComplete.
  const [containerExpanded, setContainerExpanded] =
    useState(skipEnterAnimation);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <div
      className={`fixed top-0 right-0 left-0 z-50 flex flex-col md:hidden ${containerExpanded ? 'bottom-0' : ''}`}>
      {/* Dimmed backdrop sits behind bar + panel via negative z */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-backdrop"
            initial={skipEnterAnimation ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMenu}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            style={{ zIndex: -1 }}
          />
        )}
      </AnimatePresence>

      {/* Bar — always visible, animates pill → full-width */}
      <motion.div
        className="relative z-10 w-full"
        animate={
          isOpen
            ? { paddingTop: 0, paddingLeft: 0, paddingRight: 0 }
            : { paddingTop: 16, paddingLeft: 16, paddingRight: 16 }
        }
        transition={springTransition}>
        <motion.div
          animate={isOpen ? { borderRadius: 0 } : { borderRadius: 16 }}
          transition={springTransition}
          className="bg-glass-no-border flex items-center justify-between px-4 py-0 shadow-lg">
          <NavigationLink
            underline={false}
            href="/"
            className="relative z-10 drop-shadow-md">
            <ThemeLogo />
          </NavigationLink>
          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.button
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={closeMenu}
                aria-label="Close menu"
                className="text-leon-blue-950 dark:text-leon-blue-50 flex items-center justify-center rounded-full p-2 transition-colors hover:bg-white/20 dark:hover:bg-black/20">
                <X size={28} />
              </motion.button>
            ) : (
              <motion.button
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => setIsOpen(true)}
                aria-label="Open menu"
                aria-expanded={false}
                className="text-leon-blue-950 dark:text-leon-blue-50 flex items-center justify-center p-2">
                <Menu size={28} />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Panel — flex-1 sibling of bar, slides up from below */}
      <AnimatePresence onExitComplete={() => setContainerExpanded(false)}>
        {isOpen && (
          <motion.div
            key="mobile-panel"
            initial={skipEnterAnimation ? false : { y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            onAnimationStart={() => setContainerExpanded(true)}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-glass-no-border relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-6">
              <nav className="text-leon-blue-950 dark:text-leon-blue-50 flex flex-col gap-1">
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

              <div className="border-t border-white/10 pt-6 dark:border-black/20">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
