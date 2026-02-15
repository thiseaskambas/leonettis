import { getTranslations } from 'next-intl/server';

import { NavBarClient } from './NavBarClient';

export async function NavBar() {
  const t = await getTranslations('nav');

  const navLinks = [
    { href: '/buy', label: t('buy') },
    { href: '/rent', label: t('rent') },
    { href: '/list-a-property', label: t('list-a-property') },
    { href: '/blog', label: t('blog') },
    { href: '/about', label: t('about') },
    { href: '/contact', label: t('contact') },
  ];

  return <NavBarClient navLinks={navLinks} />;
}
