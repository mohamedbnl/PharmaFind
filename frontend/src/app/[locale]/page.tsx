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
          <div className="bg-white rounded-xl p-3 shadow-lg space-y-3">
            <SearchBar />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/${locale}/search#assistant`}
                className="btn-primary w-full sm:w-auto px-5 py-2.5 text-base font-semibold shadow-md"
              >
                {isAr ? 'المساعد الذكي' : 'Assistant IA'}
              </Link>
              <p className="text-sm text-gray-600 sm:text-left max-w-sm">
                {isAr
                  ? 'حلل وصفة أو نصاً للوصول لأقرب صيدلية لديها الدواء.'
                  : 'Analysez une ordonnance ou un texte et laissez l’IA trouver la pharmacie la plus proche.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* First-entry choice */}
      <section className="max-w-5xl mx-auto px-4 -mt-10 sm:-mt-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card shadow-md border-brand-100/60">
            <p className="text-xs uppercase tracking-wide text-brand-600 font-semibold mb-1">
              {isAr ? 'لمن يبحث عن دواء' : 'Pour les clients'}
            </p>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {isAr ? 'ابدأ البحث أو التحليل' : 'Client : trouvez votre traitement'}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {isAr
                ? 'ابحث مباشرة أو دع المساعد الذكي يستخرج الأدوية ويوجهك.'
                : 'Lancez une recherche ou laissez l’assistant IA extraire vos médicaments et vous guider.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/${locale}/search`} className="btn-primary w-full sm:w-auto">
                {isAr ? 'بحث سريع' : 'Commencer la recherche'}
              </Link>
              <Link href={`/${locale}/search#assistant`} className="btn-secondary w-full sm:w-auto">
                {isAr ? 'تحليل بالذكاء الاصطناعي' : 'Analyse intelligente'}
              </Link>
            </div>
          </div>

          <div className="card shadow-md border-gray-100">
            <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
              {isAr ? 'لأصحاب الصيدليات' : 'Pour les pharmacies'}
            </p>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {isAr ? 'انضم وأدر مخزونك' : 'Pharmacie : rejoignez la plateforme'}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {isAr
                ? 'سجّل صيدليتك، أدر المخزون وكن مرئياً للمرضى القريبين.'
                : 'Inscrivez votre pharmacie, gérez votre stock et rendez-vous visible auprès des patients proches.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/${locale}/auth/login`} className="btn-secondary w-full sm:w-auto">
                {isAr ? 'تسجيل الدخول' : 'Connexion pharmacie'}
              </Link>
              <Link href={`/${locale}/auth/register`} className="btn-primary w-full sm:w-auto">
                {isAr ? 'إنشاء حساب' : 'Créer un compte'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="max-w-5xl mx-auto px-4 py-12 w-full space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {isAr ? 'اختصارات سريعة' : 'Actions rapides'}
          </h3>
          <Link href={`/${locale}/search`} className="text-sm text-brand-600 hover:underline">
            {isAr ? 'عرض كل النتائج' : 'Voir toutes les pharmacies'}
          </Link>
        </div>
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
