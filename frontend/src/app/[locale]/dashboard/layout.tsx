'use client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useLocale } from 'next-intl';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/${locale}/auth/login`);
    }
  }, [isAuthenticated, isLoading, router, locale]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!isAuthenticated) return null;

  return <div className="min-h-screen flex">{children}</div>;
}
