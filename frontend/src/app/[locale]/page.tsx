'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { SearchBar } from '@/components/search/SearchBar';

function HomeContent() {
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-700 text-white px-4 py-16 sm:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-3 leading-tight">
            {isAr ? 'جد دواءك الآن' : 'Trouvez votre médicament'}
          </h1>
          <p className="text-brand-100 text-lg mb-8">
            {isAr
              ? 'ابحث عن الأدوية المتوفرة في الصيدليات القريبة منك في المغرب'
              : 'Localisez vos médicaments dans les pharmacies proches de vous au Maroc'}
          </p>
          <div className="bg-white rounded-xl p-2 shadow-lg">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="max-w-4xl mx-auto px-4 py-10 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href={`/${locale}/on-duty`}
            className="card hover:shadow-md transition-shadow text-center py-6"
          >
            <p className="text-3xl mb-2">🌙</p>
            <p className="font-semibold text-gray-800">
              {isAr ? 'صيدليات الحراسة' : 'Pharmacies de garde'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {isAr ? 'الصيدليات المفتوحة الآن' : 'Ouvertes en ce moment'}
            </p>
          </Link>

          <div className="card text-center py-6">
            <p className="text-3xl mb-2">💊</p>
            <p className="font-semibold text-gray-800">
              {isAr ? '2,839 دواء' : '2 839 médicaments'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {isAr ? 'في الكتالوج الوطني' : 'Dans le catalogue national'}
            </p>
          </div>

          <Link
            href={`/${locale}/auth/register`}
            className="card hover:shadow-md transition-shadow text-center py-6"
          >
            <p className="text-3xl mb-2">🏪</p>
            <p className="font-semibold text-gray-800">
              {isAr ? 'أنت صيدلي؟' : 'Vous êtes pharmacien ?'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {isAr ? 'سجّل صيدليتك مجاناً' : 'Inscrivez votre pharmacie gratuitement'}
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
