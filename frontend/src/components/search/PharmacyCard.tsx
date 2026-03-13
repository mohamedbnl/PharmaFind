'use client';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { StockBadge } from './StockBadge';
import { FreshnessBadge } from './FreshnessBadge';
import type { SearchResult } from '@/hooks/useSearch';

interface Props {
  result: SearchResult;
  userLocation?: { latitude: number; longitude: number };
  highlighted?: boolean;
}

export function PharmacyCard({ result, userLocation, highlighted }: Props) {
  const locale = useLocale();
  const { pharmacy, stock, medication, distanceKm, isOpen: open } = result;
  const name = locale === 'ar' && pharmacy.nameAr ? pharmacy.nameAr : pharmacy.nameFr;
  const isAr = locale === 'ar';
  const directionUrl = (() => {
    const base = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`;
    if (userLocation?.latitude != null && userLocation?.longitude != null) {
      return `${base}&origin=${userLocation.latitude},${userLocation.longitude}`;
    }
    return base;
  })();

  return (
    <div className={`card transition-shadow ${highlighted ? 'ring-2 ring-brand-200 shadow-md' : 'group hover:shadow-md'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link href={`/${locale}/pharmacy/${pharmacy.id}`} className="font-semibold text-gray-900 truncate hover:text-brand-700">
              {name}
            </Link>
            {highlighted && (
              <span className="text-xs px-2 py-1 rounded-full bg-brand-50 text-brand-700 font-semibold">
                {isAr ? 'الأقرب المفتوحة' : 'Plus proche ouverte'}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 truncate mt-0.5">{pharmacy.addressFr}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <StockBadge status={stock.status} />
          <span className={`text-xs font-medium ${open ? 'text-green-600' : 'text-red-500'}`}>
            {open ? (isAr ? 'مفتوح' : 'Ouvert') : (isAr ? 'مغلق' : 'Fermé')}
          </span>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
        {distanceKm != null && (
          <span className="font-medium text-gray-700">{distanceKm.toFixed(1)} km</span>
        )}
        <FreshnessBadge lastConfirmedAt={stock.lastConfirmedAt} />
        {pharmacy.is24h && (
          <span className="font-medium text-brand-600">24h</span>
        )}
      </div>

      <div className="mt-2 flex items-center gap-3">
        {medication.requiresPrescription && (
          <span className="text-xs text-purple-600 font-medium">
            {isAr ? '⚕ يتطلب وصفة طبية' : '⚕ Ordonnance requise'}
          </span>
        )}
        {pharmacy.whatsapp && (
          <a
            href={`https://wa.me/${pharmacy.whatsapp.replace(/\D/g, '')}`}
            className="text-xs text-green-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            WhatsApp
          </a>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link href={`/${locale}/pharmacy/${pharmacy.id}`} className="btn-secondary text-xs px-3 py-2">
          {isAr ? 'عرض التفاصيل' : 'Voir la fiche'}
        </Link>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            window.open(directionUrl, '_blank');
          }}
          className="btn-primary text-xs px-3 py-2"
        >
          {isAr ? 'مسار الوصول' : 'Itinéraire'}
        </button>
      </div>
    </div>
  );
}
