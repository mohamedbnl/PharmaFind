'use client';
import { useLocale } from 'next-intl';

const STATUS_CONFIG = {
  AVAILABLE:     { fr: 'Disponible',    ar: 'متوفر',          color: 'bg-green-100 text-green-700' },
  LOW_STOCK:     { fr: 'Stock faible',  ar: 'مخزون منخفض',    color: 'bg-yellow-100 text-yellow-700' },
  OUT_OF_STOCK:  { fr: 'Indisponible',  ar: 'غير متوفر',      color: 'bg-red-100 text-red-700' },
  ARRIVING_SOON: { fr: 'Sur commande',  ar: 'قيد الطلب',      color: 'bg-blue-100 text-blue-700' },
} as const;

export function StockBadge({ status }: { status: string }) {
  const locale = useLocale();
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
  if (!config) return null;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {locale === 'ar' ? config.ar : config.fr}
    </span>
  );
}
