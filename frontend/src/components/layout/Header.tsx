'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Header() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const isAr = locale === 'ar';
  const [menuOpen, setMenuOpen] = useState(false);

  function switchLocale() {
    const next = isAr ? 'fr' : 'ar';
    // Replace locale prefix in path
    const newPath = pathname.replace(`/${locale}`, `/${next}`);
    router.push(newPath + window.location.search);
  }

  const nav = [
    { href: `/${locale}`, label: isAr ? 'الرئيسية' : 'Accueil' },
    { href: `/${locale}/on-duty`, label: isAr ? 'صيدليات الحراسة' : 'De garde' },
    { href: `/${locale}/dashboard`, label: isAr ? 'لوحة التحكم' : 'Dashboard' },
  ];

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="font-bold text-xl text-brand-600 shrink-0">
          {isAr ? 'فارمافايند' : 'PharmaFind'}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-brand-600',
                pathname === item.href ? 'text-brand-600' : 'text-gray-600',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: locale switcher + mobile menu */}
        <div className="flex items-center gap-3">
          <button
            onClick={switchLocale}
            className="text-sm text-gray-500 hover:text-brand-600 border border-gray-200 rounded px-2 py-1 transition"
          >
            {isAr ? 'FR' : 'ع'}
          </button>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1 text-gray-500 hover:text-gray-800"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
          >
            {menuOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b last:border-0"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
