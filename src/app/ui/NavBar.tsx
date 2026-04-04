import { getTranslations } from 'next-intl/server';

import { NavBarClient } from './NavBarClient';

export async function NavBar() {
  const t = await getTranslations('nav');

  const navLinks = [
    { href: '/buy', label: t('buy'), ariaLabel: t('buy-aria') },
    { href: '/rent', label: t('rent'), ariaLabel: t('rent-aria') },
    { href: '/contact', label: t('list-a-property') },
    { href: '/blog', label: t('blog') },
    { href: '/about', label: t('about') },
    { href: '/contact', label: t('contact') },
  ];

  return <NavBarClient navLinks={navLinks} />;
}
