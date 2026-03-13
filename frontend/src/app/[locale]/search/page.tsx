'use client';
import { Suspense, Component, useMemo } from 'react';
import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { useSearch } from '@/hooks/useSearch';
import { AIAssistantPanel } from '@/components/ai/AIAssistantPanel';

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

// Error boundary so a Leaflet crash never takes down the results list
class MapErrorBoundary extends Component<{ children: ReactNode }, { crashed: boolean }> {
  state = { crashed: false };
  static getDerivedStateFromError() { return { crashed: true }; }
  render() {
    if (this.state.crashed) {
      return (
        <div className="h-full flex items-center justify-center bg-gray-100 rounded-xl text-gray-400 text-sm">
          Carte indisponible
        </div>
      );
    }
    return this.props.children;
  }
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const isAr = locale === 'ar';

  const q = searchParams.get('q') ?? '';
  const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
  const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;
  const radius = searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : 5;
  const status = searchParams.get('status') ?? undefined;
  const qLabel = searchParams.get('qLabel') ?? q;
  const userLocation = lat != null && lng != null ? { latitude: lat, longitude: lng } : undefined;

  const { data: results = [], isLoading, error } = useSearch({ q, lat, lng, radius, status });

  // Client-side sort: open first → closest distance → most recent confirmation
  // Guards against edge cases where the backend sorted by freshness (no location in original query)
  const sortedResults = useMemo(() => {
    if (!results.length) return results;
    return [...results].sort((a, b) => {
      const openDiff = (a.isOpen ? 0 : 1) - (b.isOpen ? 0 : 1);
      if (openDiff !== 0) return openDiff;
      if (a.distanceKm != null && b.distanceKm != null) {
        const dd = a.distanceKm - b.distanceKm;
        if (Math.abs(dd) > 0.2) return dd;
      }
      return new Date(b.stock.lastConfirmedAt).getTime() - new Date(a.stock.lastConfirmedAt).getTime();
    });
  }, [results]);

  const nearestOpen = useMemo(() => {
    if (!userLocation || !sortedResults.length) return null;
    const candidates = sortedResults.filter(
      (r) => r.isOpen && r.stock.status !== 'OUT_OF_STOCK',
    );
    if (!candidates.length) return null;
    return candidates.reduce((best, r) => {
      const dist = r.distanceKm ?? Number.POSITIVE_INFINITY;
      const bestDist = best.distanceKm ?? Number.POSITIVE_INFINITY;
      return dist < bestDist ? r : best;
    }, candidates[0]);
  }, [sortedResults, userLocation]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky top search bar */}
      <div className="bg-white border-b shadow-sm px-4 py-3 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <SearchBar initialQuery={qLabel} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="mb-4" id="assistant">
          <AIAssistantPanel userLocation={userLocation} />
        </div>
        <div className="flex flex-col lg:flex-row gap-4" style={{ height: 'calc(100vh - 128px)' }}>
          {/* Results list */}
          <div className="w-full lg:w-1/2 overflow-y-auto">
            {nearestOpen && (
              <div className="card mb-3 border-brand-100 bg-brand-50/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase font-semibold text-brand-600 mb-1">
                      {isAr ? 'أقرب صيدلية مفتوحة' : 'Pharmacie ouverte la plus proche'}
                    </p>
                    <p className="font-semibold text-gray-900">{isAr && nearestOpen.pharmacy.nameAr ? nearestOpen.pharmacy.nameAr : nearestOpen.pharmacy.nameFr}</p>
                    <p className="text-sm text-gray-600">
                      {isAr ? 'بالمخزون المطلوب' : 'Avec le médicament recherché'}
                      {nearestOpen.distanceKm != null && ` • ${nearestOpen.distanceKm.toFixed(1)} km`}
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${nearestOpen.pharmacy.latitude},${nearestOpen.pharmacy.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-xs px-3 py-2"
                  >
                    {isAr ? 'عرض المسار' : 'Voir l’itinéraire'}
                  </a>
                </div>
              </div>
            )}
            <SearchResults
              results={sortedResults}
              isLoading={isLoading}
              error={sortedResults.length === 0 ? (error as Error | null) : null}
              query={q}
              userLocation={userLocation}
              highlightedId={nearestOpen?.pharmacy.id}
            />
          </div>

          {/* Map panel — wrapped in error boundary so Leaflet crashes stay contained */}
          <div className="hidden lg:block lg:w-1/2 h-full rounded-xl overflow-hidden">
            {!isLoading && sortedResults.length > 0 && (
              <MapErrorBoundary>
                <PharmacyMap results={sortedResults} userLat={lat} userLng={lng} />
              </MapErrorBoundary>
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
