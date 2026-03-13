'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { usePharmacy } from '@/hooks/usePharmacies';
import { StockBadge } from '@/components/search/StockBadge';
import { FreshnessBadge } from '@/components/search/FreshnessBadge';
import { isPharmacyOpen } from '@/lib/freshness';
import { AccuracyFeedback } from '@/components/feedback/AccuracyFeedback';

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const DAYS_KEY = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function PharmacyDetailContent({ id }: { id: string }) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const { data: pharmacy, isLoading, error } = usePharmacy(id);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="card space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-4 bg-gray-200 rounded" />)}
        </div>
      </div>
    );
  }

  if (error || !pharmacy) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p className="text-red-500">{isAr ? 'الصيدلية غير موجودة' : 'Pharmacie introuvable'}</p>
        <Link href={`/${locale}`} className="text-brand-600 hover:underline text-sm mt-2 inline-block">
          {isAr ? 'العودة للبحث' : 'Retour à la recherche'}
        </Link>
      </div>
    );
  }

  const open = isPharmacyOpen(pharmacy.operatingHours, pharmacy.is24h);
  const name = isAr && pharmacy.nameAr ? pharmacy.nameAr : pharmacy.nameFr;
  const waNumber = pharmacy.whatsapp?.replace(/\D/g, '');

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Back link */}
      <Link href={`/${locale}/search`} className="text-sm text-brand-600 hover:underline">
        ← {isAr ? 'العودة للنتائج' : 'Retour aux résultats'}
      </Link>

      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{name}</h1>
            <p className="text-gray-500 mt-1">{pharmacy.addressFr}</p>
            <p className="text-sm text-gray-400">{pharmacy.city}</p>
          </div>
          <span className={`text-sm font-semibold px-2 py-1 rounded ${open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {open ? (isAr ? 'مفتوح' : 'Ouvert') : (isAr ? 'مغلق' : 'Fermé')}
          </span>
        </div>

        {/* Contact */}
        <div className="mt-4 flex flex-wrap gap-3">
          <a href={`tel:${pharmacy.phone}`} className="btn-secondary text-sm px-4 py-2">
            📞 {pharmacy.phone}
          </a>
          {waNumber && (
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm px-4 py-2 text-green-700"
            >
              💬 WhatsApp
            </a>
          )}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm px-4 py-2"
          >
            🗺 {isAr ? 'الاتجاهات' : 'Itinéraire'}
          </a>
        </div>
      </div>

      {/* Operating hours */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-3">
          {isAr ? 'ساعات العمل' : 'Horaires d\'ouverture'}
        </h2>
        {pharmacy.is24h ? (
          <p className="text-green-600 font-medium">{isAr ? 'مفتوح 24 ساعة' : 'Ouvert 24h/24'}</p>
        ) : (
          <div className="space-y-1">
            {DAYS_KEY.map((day, i) => {
              const schedule = pharmacy.operatingHours[day];
              return (
                <div key={day} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                  <span className="text-gray-600">{DAYS_FR[i]}</span>
                  {schedule ? (
                    <span className="text-gray-800">
                      {schedule.open}–{schedule.close}
                      {schedule.open2 && ` / ${schedule.open2}–${schedule.close2}`}
                    </span>
                  ) : (
                    <span className="text-red-400">{isAr ? 'مغلق' : 'Fermé'}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stock list */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-3">
          {isAr ? 'المخزون المتاح' : 'Stock disponible'} ({pharmacy.stock.length})
        </h2>
        {pharmacy.stock.length === 0 ? (
          <p className="text-gray-400 text-sm">{isAr ? 'لا توجد بيانات مخزون' : 'Aucune donnée de stock'}</p>
        ) : (
          <div className="space-y-2">
            {pharmacy.stock.map((item) => {
              const medName = isAr && item.medication.nameAr ? item.medication.nameAr : item.medication.nameFr;
              return (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{medName}</p>
                    <p className="text-xs text-gray-400">
                      {item.medication.form}
                      {item.medication.dosage && ` · ${item.medication.dosage}`}
                      {item.medication.dci && ` · ${item.medication.dci}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 ms-3">
                    <StockBadge status={item.status} />
                    <FreshnessBadge lastConfirmedAt={item.lastConfirmedAt} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Accuracy feedback */}
      <AccuracyFeedback pharmacyId={pharmacy.id} />
    </div>
  );
}

type ParamsInput = { id: string } | Promise<{ id: string }>;

export default function PharmacyDetailPage({ params }: { params: ParamsInput }) {
  const [pharmacyId, setPharmacyId] = useState<string | null>(() =>
    typeof params === 'object' && 'id' in params ? (params as { id: string }).id : null,
  );

  useEffect(() => {
    let mounted = true;
    Promise.resolve(params).then((value: { id: string }) => {
      if (mounted && value?.id) setPharmacyId(value.id);
    });
    return () => { mounted = false; };
  }, [params]);

  if (!pharmacyId) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse mb-4" />
        <div className="card space-y-3 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <Suspense>
      <PharmacyDetailContent id={pharmacyId} />
    </Suspense>
  );
}
