'use client';
import { useLocale } from 'next-intl';
import { getFreshnessLevel } from '@/lib/freshness';

const FRESHNESS_CONFIG = {
  verified:          { fr: 'Vérifié',             ar: 'مؤكد',           color: 'text-green-600' },
  recent:            { fr: 'Récent',              ar: 'حديث',           color: 'text-yellow-600' },
  possibly_outdated: { fr: 'Peut-être obsolète',  ar: 'قد يكون قديماً', color: 'text-orange-500' },
  unverified:        { fr: 'Non vérifié',         ar: 'غير مؤكد',       color: 'text-red-500' },
};

export function FreshnessBadge({ lastConfirmedAt }: { lastConfirmedAt: string }) {
  const locale = useLocale();
  const level = getFreshnessLevel(lastConfirmedAt);
  const config = FRESHNESS_CONFIG[level];
  return (
    <span className={`text-xs ${config.color}`}>
      ● {locale === 'ar' ? config.ar : config.fr}
    </span>
  );
}
