'use client';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useOnDuty } from '@/hooks/useOnDuty';
import { useGeolocation } from '@/hooks/useGeolocation';

export default function OnDutyPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const { lat, lng, isLoading: locLoading, requestLocation } = useGeolocation();
  const { data: entries = [], isLoading, error } = useOnDuty({ lat, lng });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {isAr ? 'صيدليات الحراسة' : 'Pharmacies de garde'}
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        {isAr
          ? 'الصيدليات المناوبة المتاحة الآن في منطقتك'
          : 'Pharmacies actuellement de garde dans votre zone'}
      </p>

      {/* Location prompt */}
      {!lat && (
        <div className="card mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {isAr ? 'فعّل موقعك للعثور على أقرب صيدلية' : 'Activez votre position pour trouver la plus proche'}
          </p>
          <button
            onClick={requestLocation}
            disabled={locLoading}
            className="btn-primary text-sm px-4 py-2 ms-4 shrink-0"
          >
            {locLoading ? '…' : (isAr ? 'تفعيل' : 'Activer')}
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card text-center py-6 text-red-500">
          {isAr ? 'حدث خطأ' : 'Une erreur est survenue'}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && entries.length === 0 && (
        <div className="card text-center py-8 text-gray-400">
          <p className="text-3xl mb-2">🌙</p>
          <p>{isAr ? 'لا توجد صيدليات مناوبة مسجلة لليوم' : 'Aucune pharmacie de garde enregistrée pour aujourd\'hui'}</p>
        </div>
      )}

      {/* Results */}
      {!isLoading && entries.length > 0 && (
        <div className="space-y-3">
          {entries.map((entry) => {
            const name = isAr && entry.pharmacy.nameAr ? entry.pharmacy.nameAr : entry.pharmacy.nameFr;
            const waNumber = entry.pharmacy.whatsapp?.replace(/\D/g, '');
            return (
              <div key={entry.scheduleId} className="card">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/${locale}/pharmacy/${entry.pharmacy.id}`}
                      className="font-semibold text-gray-900 hover:text-brand-600"
                    >
                      {name}
                    </Link>
                    <p className="text-sm text-gray-500 mt-0.5">{entry.pharmacy.addressFr}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {isAr ? 'الحراسة:' : 'Garde:'} {entry.startTime} – {entry.endTime}
                      {entry.isOvernight && (isAr ? ' (ليلي)' : ' (nuit)')}
                    </p>
                  </div>
                  {entry.distanceKm != null && (
                    <span className="text-sm font-medium text-gray-600 shrink-0">
                      {entry.distanceKm.toFixed(1)} km
                    </span>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <a href={`tel:${entry.pharmacy.phone}`} className="btn-secondary text-sm px-3 py-1.5">
                    📞 {entry.pharmacy.phone}
                  </a>
                  {waNumber && (
                    <a
                      href={`https://wa.me/${waNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-sm px-3 py-1.5 text-green-700"
                    >
                      💬 WhatsApp
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
