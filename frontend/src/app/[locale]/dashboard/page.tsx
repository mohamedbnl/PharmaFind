'use client';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { OnboardingWizard } from '@/components/dashboard/OnboardingWizard';

export default function DashboardPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {isAr ? `مرحباً، ${user?.fullName}` : `Bienvenue, ${user?.fullName}`}
        </h1>
        <p className="text-gray-500 mt-1">
          {isAr ? 'لوحة تحكم الصيدلية' : 'Tableau de bord de votre pharmacie'}
        </p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link href={`/${locale}/dashboard/stock`} className="card hover:shadow-md transition text-center py-5">
          <p className="text-2xl mb-1">📦</p>
          <p className="font-semibold">{isAr ? 'إدارة المخزون' : 'Gérer le stock'}</p>
        </Link>
        <Link href={`/${locale}/dashboard/profile`} className="card hover:shadow-md transition text-center py-5">
          <p className="text-2xl mb-1">⚙️</p>
          <p className="font-semibold">{isAr ? 'الملف الشخصي' : 'Mon profil'}</p>
        </Link>
        <Link href={`/${locale}/dashboard/analytics`} className="card hover:shadow-md transition text-center py-5">
          <p className="text-2xl mb-1">📊</p>
          <p className="font-semibold">{isAr ? 'الإحصائيات' : 'Statistiques'}</p>
        </Link>
      </div>

      {/* Onboarding wizard if no pharmacy yet */}
      <div className="mb-4">
        <h2 className="font-semibold text-gray-800 mb-4">
          {isAr ? 'تسجيل صيدليتك' : 'Enregistrer votre pharmacie'}
        </h2>
        <OnboardingWizard />
      </div>
    </div>
  );
}
