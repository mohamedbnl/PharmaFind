'use client';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export function Footer() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <p>© 2026 {isAr ? 'فارمافايند' : 'PharmaFind'}</p>
        <div className="flex gap-4">
          <Link href={`/${locale}/on-duty`} className="hover:text-brand-600 transition">
            {isAr ? 'صيدليات الحراسة' : 'De garde'}
          </Link>
          <Link href={`/${locale}/auth/register`} className="hover:text-brand-600 transition">
            {isAr ? 'تسجيل صيدلية' : 'Inscrire ma pharmacie'}
          </Link>
        </div>
      </div>
    </footer>
  );
}
