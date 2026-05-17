'use client';

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
} from 'react';

import { type AdminLang, adminT } from './admin-translations';

const STORAGE_KEY = 'admin-lang';

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): AdminLang {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === 'en' || saved === 'gr' ? saved : 'en';
}

function getServerSnapshot(): AdminLang {
  return 'en';
}

const AdminLangContext = createContext<{
  lang: AdminLang;
  toggle: () => void;
}>({ lang: 'en', toggle: () => {} });

export function AdminLangProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = lang === 'gr' ? 'el' : 'en';
  }, [lang]);

  function toggle() {
    const next: AdminLang = lang === 'en' ? 'gr' : 'en';
    localStorage.setItem(STORAGE_KEY, next);
    emitChange();
  }

  return (
    <AdminLangContext.Provider value={{ lang, toggle }}>
      {children}
    </AdminLangContext.Provider>
  );
}

export function useAdminLang() {
  return useContext(AdminLangContext);
}

export function useAdminT() {
  const { lang } = useAdminLang();
  return adminT[lang];
}
