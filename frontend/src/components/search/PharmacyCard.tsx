'use client';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { StockBadge } from './StockBadge';
import { FreshnessBadge } from './FreshnessBadge';
import type { SearchResult } from '@/hooks/useSearch';

export function PharmacyCard({ result }: { result: SearchResult }) {
  const locale = useLocale();
  const { pharmacy, stock, medication, distanceKm, isOpen: open } = result;
  const name = locale === 'ar' && pharmacy.nameAr ? pharmacy.nameAr : pharmacy.nameFr;
  const isAr = locale === 'ar';

  return (
    <Link href={`/${locale}/pharmacy/${pharmacy.id}`} className="block group">
      <div className="card group-hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
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
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-green-600 hover:underline"
            >
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </Link>
  );
}
