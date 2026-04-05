import { getTranslations } from 'next-intl/server';

import ContactForm from './ContactForm';

export default async function ContactPage() {
  const t = await getTranslations('contact');

  return (
    <main className="from-tiff-gray-50 via-tiff-gray-100 to-leon-blue-50 dark:from-tiff-gray-950 dark:via-leon-blue-950 dark:to-tiff-gray-900 min-h-screen bg-linear-to-br p-5 pt-32 sm:px-10 md:pt-52">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-leon-blue-950 dark:text-tiff-gray-50 mb-2 text-3xl font-bold tracking-tight">
          {t('title')}
        </h1>
        <p className="text-tiff-gray-700 dark:text-tiff-gray-300 mb-8">
          {t('subtitle')}
        </p>
        <div className="bg-glass border-tiff-gray-200/90 rounded-2xl border p-6 md:p-8 dark:border-white/10">
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
