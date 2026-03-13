'use client';
import { useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Analytics {
  totalSearches: number;
  recentSearches: number;
  stockCount: number;
  topQueries: Array<{ query: string; count: number }>;
}

export default function AnalyticsPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const pharmacyId = typeof window !== 'undefined' ? (localStorage.getItem('pharmacyId') ?? '') : '';

  const { data, isLoading, error } = useQuery<Analytics>({
    queryKey: ['analytics', pharmacyId],
    queryFn: async () => {
      const { data } = await api.get(`/pharmacies/${pharmacyId}/analytics`);
      return data.data;
    },
    enabled: !!pharmacyId,
    staleTime: 5 * 60 * 1000,
  });

  if (!pharmacyId) return <div className="max-w-2xl mx-auto px-4 py-8 text-gray-400 text-center">{isAr ? 'لا توجد صيدلية' : 'Aucune pharmacie'}</div>;

  if (isLoading) return (
    <div className="max-w-2xl mx-auto px-4 py-8 grid grid-cols-2 gap-4">
      {[1,2,3,4].map(i => <div key={i} className="card animate-pulse h-24" />)}
    </div>
  );

  if (error || !data) return <div className="max-w-2xl mx-auto px-4 py-8 text-red-500 text-center">{isAr ? 'حدث خطأ' : 'Erreur'}</div>;

  const stats = [
    { label_fr: 'Recherches (7 jours)', label_ar: 'بحث (7 أيام)', value: data.recentSearches, color: 'text-brand-600' },
    { label_fr: 'Recherches total', label_ar: 'إجمالي البحث', value: data.totalSearches, color: 'text-gray-700' },
    { label_fr: 'Médicaments en stock', label_ar: 'أدوية في المخزون', value: data.stockCount, color: 'text-green-600' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{isAr ? 'الإحصائيات' : 'Statistiques'}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label_fr, label_ar, value, color }) => (
          <div key={label_fr} className="card text-center py-5">
            <p className={`text-4xl font-bold ${color}`}>{value}</p>
            <p className="text-sm text-gray-500 mt-1">{isAr ? label_ar : label_fr}</p>
          </div>
        ))}
      </div>

      {data.topQueries.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-3">{isAr ? 'أكثر الأدوية بحثاً (7 أيام)' : 'Médicaments les plus recherchés (7 jours)'}</h2>
          <ol className="space-y-2">
            {data.topQueries.map(({ query, count }, i) => (
              <li key={query} className="flex items-center justify-between text-sm">
                <span className="text-gray-700"><span className="font-bold text-brand-600 me-2">{i + 1}.</span>{query}</span>
                <span className="text-gray-400">{count} {isAr ? 'مرة' : 'fois'}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
