'use client';
import { Suspense, Component, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { useSearch } from '@/hooks/useSearch';
import { AIAssistantPanel } from '@/components/ai/AIAssistantPanel';
import { AISummaryCard } from '@/components/ai/AISummaryCard';
import { ScenarioCard } from '@/components/ai/ScenarioCard';
import { UnavailableDraftEditor } from '@/components/ai/UnavailableDraftEditor';
import { AIResponse, SearchedMedication } from '@/types/ai';
import { Bot, Search } from 'lucide-react';

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
  const [searchMode, setSearchMode] = useState<'standard' | 'ai'>('standard');
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [aiError, setAiError] = useState<Error | null>(null);

  const q = searchParams.get('q') ?? '';
  const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
  const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;
  const radius = searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : 5;
  const status = searchParams.get('status') ?? undefined;
  const qLabel = searchParams.get('qLabel') ?? q;

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

  // Transform AI results into the format expected by SearchResults and Map
  const mapResults = useMemo(() => {
    if (searchMode === 'standard') return sortedResults;
    if (!aiResponse) return [];

    const allPharmacies = new Map();
    
    aiResponse.medications.forEach(med => {
      med.pharmacies.forEach(p => {
        if (!allPharmacies.has(p.id)) {
          allPharmacies.set(p.id, {
            pharmacy: { ...p, is24h: false, operatingHours: null, phone: null },
            stock: { status: p.stockStatus, lastConfirmedAt: new Date().toISOString() },
            distanceKm: p.distance_km,
            isOpen: true
          });
        }
      });
    });

    return Array.from(allPharmacies.values());
  }, [searchMode, sortedResults, aiResponse]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Mode Toggle */}
      <div className="bg-white border-b shadow-sm relative z-10">
        <div className="max-w-6xl mx-auto px-4 flex">
          <button
            onClick={() => setSearchMode('standard')}
            className={`px-4 py-3 flex items-center gap-2 font-medium text-sm border-b-2 transition-colors ${
              searchMode === 'standard' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Search className="w-4 h-4" />
            Recherche Standard
          </button>
          <button
            onClick={() => setSearchMode('ai')}
            className={`px-4 py-3 flex items-center gap-2 font-medium text-sm border-b-2 transition-colors ${
              searchMode === 'ai' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Bot className="w-4 h-4" />
            Assistant IA
          </button>
        </div>
      </div>

      {searchMode === 'standard' && (
        <div className="bg-white border-b shadow-sm px-4 py-3 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto">
            <SearchBar initialQuery={qLabel} />
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-4" style={{ height: 'calc(100vh - 128px)' }}>
          {/* Results list */}
          <div className="w-full lg:w-1/2 overflow-y-auto space-y-4 pr-2 pb-20">
            {searchMode === 'ai' && (
              <div className="space-y-4">
                <AIAssistantPanel 
                  onResults={(res) => { setAiResponse(res); setAiError(null); }}
                  onError={(err) => setAiError(err)}
                  onClear={() => { setAiResponse(null); setAiError(null); }}
                />

                {aiError && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
                    {aiError.message || "Une erreur s'est produite."}
                  </div>
                )}

                {aiResponse && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <AISummaryCard summary={aiResponse.summary} detectedLanguage={aiResponse.detectedLanguage} />
                    
                    {aiResponse.recommendedScenario && (
                      <ScenarioCard scenario={aiResponse.recommendedScenario} language={aiResponse.detectedLanguage} />
                    )}

                    <div className="bg-white rounded-xl shadow-sm border p-4 space-y-2">
                       <h3 className="font-semibold text-gray-900">Médicaments détectés</h3>
                       <div className="flex flex-wrap gap-2">
                         {aiResponse.medications.map((m, i) => (
                           <span key={i} className={`px-2 py-1 text-xs rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200`}>
                             {m.cleanedName} {m.dosage && `(${m.dosage})`}
                           </span>
                         ))}
                         {aiResponse.unavailableMedications.map((m, i) => (
                           <span key={`u-${i}`} className={`px-2 py-1 text-xs rounded-full border bg-red-50 text-red-700 border-red-200 line-through decoration-red-400`}>
                             {m.cleanedName}
                           </span>
                         ))}
                       </div>
                    </div>

                    {aiResponse.generatedRequestDraft && aiResponse.unavailableMedications.length > 0 && (
                      <UnavailableDraftEditor draft={aiResponse.generatedRequestDraft} language={aiResponse.detectedLanguage} />
                    )}
                  </div>
                )}
              </div>
            )}

            {searchMode === 'standard' && (
              <SearchResults
                results={sortedResults}
                isLoading={isLoading}
                error={sortedResults.length === 0 ? (error as Error | null) : null}
                query={q}
              />
            )}
            
            {searchMode === 'ai' && aiResponse && mapResults.length > 0 && (
              <div className="pt-4 border-t">
                 <h3 className="font-semibold text-gray-900 mb-4">Pharmacies recommandées</h3>
                 <SearchResults
                    results={mapResults}
                    isLoading={false}
                    error={null}
                    query={""}
                  />
              </div>
            )}
          </div>

          {/* Map panel — wrapped in error boundary so Leaflet crashes stay contained */}
          <div className="hidden lg:block lg:w-1/2 h-full rounded-xl overflow-hidden relative z-0">
            {searchMode === 'standard' && !isLoading && sortedResults.length > 0 && (
              <MapErrorBoundary>
                <PharmacyMap results={sortedResults} userLat={lat} userLng={lng} />
              </MapErrorBoundary>
            )}
            {searchMode === 'ai' && mapResults.length > 0 && (
               <MapErrorBoundary>
                 <PharmacyMap results={mapResults} userLat={lat} userLng={lng} />
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
