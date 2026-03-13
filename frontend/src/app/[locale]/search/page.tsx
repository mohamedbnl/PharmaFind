'use client';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { useSearch } from '@/hooks/useSearch';

// Leaflet must be loaded client-side only
const PharmacyMap = dynamic(
  () => import('@/components/map/PharmacyMap').then((m) => m.PharmacyMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center bg-gray-100 rounded-xl text-gray-400 text-sm">
        Chargement de la carte…
      </div>
    ),
  },
);

function SearchPageContent() {
  const searchParams = useSearchParams();

  const q = searchParams.get('q') ?? '';
  const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
  const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;
  const radius = searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : 5;
  const status = searchParams.get('status') ?? undefined;
  const qLabel = searchParams.get('qLabel') ?? q;

  const { data: results = [], isLoading, error } = useSearch({ q, lat, lng, radius, status });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky top search bar */}
      <div className="bg-white border-b shadow-sm px-4 py-3 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <SearchBar initialQuery={qLabel} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-4" style={{ height: 'calc(100vh - 128px)' }}>
          {/* Results list */}
          <div className="w-full lg:w-1/2 overflow-y-auto">
            <SearchResults
              results={results}
              isLoading={isLoading}
              error={error as Error | null}
              query={q}
            />
          </div>

          {/* Map panel */}
          <div className="hidden lg:block lg:w-1/2 rounded-xl overflow-hidden">
            {!isLoading && (
              <PharmacyMap results={results} userLat={lat} userLng={lng} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageContent />
    </Suspense>
  );
}
