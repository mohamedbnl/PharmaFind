'use client';
import { useLocale } from 'next-intl';
import { PharmacyCard } from './PharmacyCard';
import type { SearchResult } from '@/hooks/useSearch';

interface Props {
  results?: SearchResult[];
  isLoading: boolean;
  error: Error | null;
  query: string;
}

export function SearchResults({ results, isLoading, error, query }: Props) {
  const locale = useLocale();
  const isAr = locale === 'ar';

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-8">
        <p className="text-red-500 mb-3">
          {isAr ? 'حدث خطأ أثناء البحث' : 'Une erreur est survenue lors de la recherche'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary text-sm px-4 py-2"
        >
          {isAr ? 'إعادة المحاولة' : 'Réessayer'}
        </button>
      </div>
    );
  }

  if (!query.trim()) {
    return (
      <div className="card text-center py-8 text-gray-400">
        <p className="text-3xl mb-2">🔍</p>
        <p>{isAr ? 'ابحث عن دواء للبدء' : 'Recherchez un médicament pour commencer'}</p>
      </div>
    );
  }

  if (!results?.length) {
    return (
      <div className="card text-center py-8 text-gray-500">
        <p className="text-3xl mb-2">💊</p>
        <p className="font-medium mb-1">
          {isAr ? `لم يتم العثور على "${query}"` : `"${query}" introuvable`}
        </p>
        <p className="text-sm text-gray-400">
          {isAr
            ? 'جرب توسيع نطاق البحث أو تفعيل الموقع'
            : "Essayez d'élargir votre rayon ou activez la géolocalisation"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 px-1">
        {results.length} {isAr ? 'نتيجة' : 'résultat(s)'}
        {query && ` ${isAr ? 'لـ' : 'pour'} "${query}"`}
      </p>
      {results.map((result) => (
        <PharmacyCard key={result.stock.id} result={result} />
      ))}
    </div>
  );
}
