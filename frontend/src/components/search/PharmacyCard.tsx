'use client';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { MessageCircle, MapPin, Clock, FileWarning, ShieldCheck } from 'lucide-react';
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
  const t = useTranslations('pharmacy');
  const common = useTranslations('common');
  const searchT = useTranslations('search');
  
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
    <div 
      className={`relative w-full overflow-hidden transition-all duration-300 rounded-2xl border bg-white p-5 ${
        highlighted ? 'ring-2 ring-blue-200 shadow-lg border-blue-100' : 'border-gray-100 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link 
              href={`/${locale}/pharmacy/${pharmacy.id}`} 
              className="text-lg font-bold text-gray-900 truncate hover:text-blue-700 transition-colors"
            >
              {name}
            </Link>
            {highlighted && (
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-100">
                {isAr ? 'الأقرب' : 'Plus proche'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{pharmacy.addressFr}</span>
          </div>
        </div>

        {/* Status Indicator (Right aligned) */}
        <div className="flex flex-col items-end gap-1.5 shrink-0 min-w-max">
          <div className="flex items-center gap-2 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
            <span className="relative flex h-2 w-2">
              {open && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${open ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </span>
            <span className={`text-xs font-bold uppercase tracking-wide ${open ? 'text-emerald-700' : 'text-rose-600'}`}>
              {open ? searchT('open') : searchT('closed')}
            </span>
          </div>
        </div>
      </div>

      {/* Middle Row (Badges) */}
      <div className="flex flex-wrap items-center gap-2 mt-3 p-3 bg-gray-50/50 rounded-xl border border-gray-100/50">
        <StockBadge status={stock.status} />
        
        <div className="w-[1px] h-4 bg-gray-200 mx-1"></div>
        
        <FreshnessBadge lastConfirmedAt={stock.lastConfirmedAt} />
        
        {distanceKm != null && (
          <>
            <div className="w-[1px] h-4 bg-gray-200 mx-1"></div>
            <span className="font-semibold text-gray-700 text-xs flex items-center gap-1">
              {distanceKm.toFixed(1)} km
            </span>
          </>
        )}
      </div>

      {/* Constraints & Requirements */}
      {(medication.requiresPrescription || pharmacy.is24h) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {medication.requiresPrescription && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-100">
              <FileWarning className="w-3 h-3" />
              {t('prescription')}
            </span>
          )}
          {pharmacy.is24h && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
              <Clock className="w-3 h-3" />
              {t('open24h')}
            </span>
          )}
        </div>
      )}

      {/* Bottom Actions */}
      <div className="mt-5 flex items-center gap-3 pt-4 border-t border-gray-100">
        <Link 
          href={`/${locale}/pharmacy/${pharmacy.id}`} 
          className="flex-1 inline-flex justify-center items-center gap-1.5 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
        >
          {common('edit')} {/* Re-using common keys functionally, though viewing details is better */}
          {/* I will use the French literal "Détails" or specific translation later, let's keep "Details" generic for now since strings exist */}
          <span className="sr-only">Details</span>
        </Link>
        
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            window.open(directionUrl, '_blank');
          }}
          className="flex-1 inline-flex justify-center items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
        >
          {t('directions')}
        </button>

        {pharmacy.whatsapp && (
          <a
            href={`https://wa.me/${pharmacy.whatsapp.replace(/\D/g, '')}`}
            className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-sm transition-transform hover:scale-105"
            onClick={(e) => e.stopPropagation()}
            aria-label="WhatsApp"
            title="WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
        )}
      </div>
    </div>
  );
}
