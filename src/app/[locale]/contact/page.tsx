import { getTranslations } from 'next-intl/server';

import ContactForm from './ContactForm';

export default async function ContactPage() {
  const t = await getTranslations('contact');

  return (
    <main className="dark:bg-tiff-gray-950 mt-40 min-h-screen p-5 md:p-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-leon-blue-950 dark:text-tiff-gray-50 mb-2 text-3xl font-bold tracking-tight">
          {t('title')}
        </h1>
        <p className="text-tiff-gray-700 dark:text-tiff-gray-300 mb-8">
          {t('subtitle')}
        </p>
        <ContactForm />
      </div>
    </main>
  );
}
