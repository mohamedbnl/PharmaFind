'use client';
import { useLocale, useTranslations } from 'next-intl';
import { PharmacyCard } from './PharmacyCard';
import { EmptyState } from '@/components/layout/EmptyState';
import { SearchX, PackageX, AlertCircle } from 'lucide-react';
import type { SearchResult } from '@/hooks/useSearch';

interface Props {
  results?: SearchResult[];
  isLoading: boolean;
  error: Error | null;
  query: string;
  userLocation?: { latitude: number; longitude: number };
  highlightedId?: string;
}

export function SearchResults({ results, isLoading, error, query, userLocation, highlightedId }: Props) {
  const locale = useLocale();
  const isAr = locale === 'ar';

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse shadow-sm h-32 flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div className="w-1/2 h-5 bg-gray-200 rounded"></div>
               <div className="w-16 h-5 bg-gray-200 rounded-full"></div>
            </div>
            <div className="w-3/4 h-4 bg-gray-100 rounded"></div>
            <div className="w-1/4 h-4 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title={isAr ? 'حدث خطأ أثناء البحث' : 'Une erreur est survenue lors de la recherche'}
        description={error.message || ''}
        action={(
          <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-semibold rounded-xl transition-colors">
            {isAr ? 'إعادة المحاولة' : 'Réessayer'}
          </button>
        )}
      />
    );
  }

  if (!query.trim()) {
    return (
      <EmptyState
        icon={SearchX}
        title={isAr ? 'ابحث عن دواء للبدء' : 'Recherchez un médicament pour commencer'}
        description={isAr ? 'اكتب اسم الدواء في شريط البحث أعلاه لرؤية أقرب صيدليات تتوفر عليه' : 'Saisissez le nom du médicament dans la barre de recherche ci-dessus pour découvrir les pharmacies proches pertinentes.'}
      />
    );
  }

  if (!results?.length) {
    return (
      <EmptyState
        icon={PackageX}
        title={isAr ? `لم يتم العثور على "${query}"` : `"${query}" introuvable`}
        description={isAr ? 'جرب توسيع نطاق البحث أو تفعيل الموقع' : "Essayez d'élargir votre rayon de recherche ou naviguez vers une autre localisation."}
      />
    );
  }

  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-center justify-between px-2">
        <p className="text-sm font-medium text-gray-500">
          <span className="text-gray-900 font-bold">{results.length}</span> {isAr ? 'نتيجة' : 'résultat(s)'}
          {query && ` ${isAr ? 'لـ' : 'pour'} "${query}"`}
        </p>
      </div>
      {results.map((result) => (
        <PharmacyCard
          key={result.stock.id}
          result={result}
          userLocation={userLocation}
          highlighted={highlightedId === result.pharmacy.id}
        />
      ))}
    </div>
  );
}
