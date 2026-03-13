import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { cn } from '@/lib/utils';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: { default: 'PharmaFind — Trouvez votre médicament', template: '%s | PharmaFind' },
  description: 'Trouvez vos médicaments dans les pharmacies proches de chez vous au Maroc.',
  openGraph: {
    type: 'website',
    siteName: 'PharmaFind',
    title: 'PharmaFind — Trouvez votre médicament au Maroc',
    description: 'Localisez vos médicaments dans les pharmacies proches de chez vous au Maroc.',
  },
  twitter: { card: 'summary', title: 'PharmaFind', description: 'Trouvez vos médicaments au Maroc.' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

const locales = ['fr', 'ar'] as const;
type Locale = (typeof locales)[number];

interface Props {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function LocaleLayout({ children, params: { locale } }: Props) {
  if (!locales.includes(locale as Locale)) notFound();

  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <head>
        <link rel="preconnect" href="https://tile.openstreetmap.org" />
        <link rel="dns-prefetch" href="https://tile.openstreetmap.org" />
        <link rel="preconnect" href="https://unpkg.com" />
      </head>
      <body className={cn('font-sans antialiased flex flex-col min-h-screen bg-gray-50', locale === 'ar' && 'font-arabic')}>
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <AuthProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </AuthProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
