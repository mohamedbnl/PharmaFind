'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  const locale = useLocale();
  const isAr = locale === 'ar';

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl mb-4">⚠️</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {isAr ? 'حدث خطأ غير متوقع' : 'Une erreur inattendue est survenue'}
      </h1>
      <p className="text-gray-500 mb-6 max-w-sm">
        {isAr
          ? 'نعتذر عن الإزعاج. يرجى المحاولة مجدداً.'
          : 'Nous nous excusons pour la gêne. Veuillez réessayer.'}
      </p>
      <div className="flex gap-3">
        <button onClick={reset} className="btn-primary px-6 py-2">
          {isAr ? 'إعادة المحاولة' : 'Réessayer'}
        </button>
        <Link href={`/${locale}`} className="btn-secondary px-6 py-2">
          {isAr ? 'الرئيسية' : 'Accueil'}
        </Link>
      </div>
    </div>
  );
}
