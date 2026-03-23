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
import { AIResponse } from '@/types/ai';
import { Bot, Map as MapIcon, Menu } from 'lucide-react';

const PharmacyMap = dynamic(
  () => import('@/components/map/PharmacyMap').then((m) => m.PharmacyMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50/50 text-gray-400">
        <MapIcon className="w-12 h-12 mb-3 text-gray-300" />
        <p className="text-sm font-medium">Chargement de la carte interactive…</p>
      </div>
    ),
  },
);

class MapErrorBoundary extends Component<{ children: ReactNode }, { crashed: boolean }> {
  state = { crashed: false };
  static getDerivedStateFromError() { return { crashed: true }; }
  render() {
    if (this.state.crashed) {
      return (
        <div className="h-full flex items-center justify-center bg-gray-50 text-gray-400 text-sm border-s border-gray-200">
          La carte n'est pas disponible pour l'instant
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
    <div className="bg-white flex flex-col h-[calc(100vh-80px)] overflow-hidden">
      
      {/* Universal 40/60 Split Pane layout */}
      <div className="flex-1 flex flex-col lg:flex-row shadow-sm min-h-0">
        
        {/* Left pane: Search Form + Results List */}
        <div className="w-full lg:w-[40%] flex flex-col bg-slate-50 relative flex-shrink-0 border-e border-gray-200 z-10 min-h-0">
          
          {searchMode === 'standard' && (
            <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-gray-100 p-5 shadow-sm">
              <SearchBar initialQuery={qLabel} onAIToggle={() => setSearchMode('ai')} />
            </div>
          )}

          {searchMode === 'ai' && (
            <div className="sticky top-0 z-20 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100 p-5 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex justify-center items-center shrink-0 ring-2 ring-indigo-50/50">
                  <Bot className="w-5 h-5 text-indigo-700" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 leading-tight">Assistant IA</h2>
                  <p className="text-xs text-gray-500">Musa'id IA interactif</p>
                </div>
              </div>
              <button 
                onClick={() => setSearchMode('standard')} 
                className="px-4 py-2 bg-white hover:bg-gray-50 text-indigo-600 text-sm font-bold rounded-lg border border-indigo-100 shadow-sm transition-colors"
              >
                Retour
              </button>
            </div>
          )}

          {/* Scrollable List Container under Search Header */}
          <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
            {searchMode === 'ai' && (
              <div className="space-y-6">
                <AIAssistantPanel 
                  onResults={(res) => { setAiResponse(res); setAiError(null); }}
                  onError={(err) => setAiError(err)}
                  onClear={() => { setAiResponse(null); setAiError(null); }}
                />

                {aiError && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
                    {aiError.message || "Une erreur s'est produite lors du traitement."}
                  </div>
                )}

                {aiResponse && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-4 border-t border-indigo-100">
                    <AISummaryCard summary={aiResponse.summary} detectedLanguage={aiResponse.detectedLanguage} />
                    
                    {aiResponse.recommendedScenario && (
                      <ScenarioCard scenario={aiResponse.recommendedScenario} language={aiResponse.detectedLanguage} />
                    )}

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
                       <h3 className="font-bold text-gray-900 border-b pb-2 mb-2">Médicaments traduits</h3>
                       <div className="flex flex-wrap gap-2">
                         {aiResponse.medications.map((m, i) => (
                           <span key={i} className={`px-3 py-1.5 text-xs font-semibold rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-200`}>
                             {m.cleanedName} {m.dosage && `(${m.dosage})`}
                           </span>
                         ))}
                         {aiResponse.unavailableMedications.map((m, i) => (
                           <span key={`u-${i}`} className={`px-3 py-1.5 text-xs font-semibold rounded-lg border bg-red-50 text-red-700 border-red-200 line-through decoration-red-400`}>
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

                {aiResponse && mapResults.length > 0 && (
                  <div className="pt-8 border-t border-gray-200">
                     <h3 className="font-bold text-xl text-gray-900 mb-5">Pharmacies Optimales</h3>
                     <SearchResults
                        results={mapResults}
                        isLoading={false}
                        error={null}
                        query={""}
                      />
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
          </div>
        </div>

        {/* Right pane: Sticky Map Component occupying remaining 60% */}
        <div className="hidden lg:block lg:w-[60%] flex-shrink-0 relative bg-gray-100/50 backdrop-blur-sm z-0">
          {(searchMode === 'standard' && !isLoading && sortedResults.length > 0) || (searchMode === 'ai' && mapResults.length > 0) ? (
            <MapErrorBoundary>
              <PharmacyMap results={searchMode === 'standard' ? sortedResults : mapResults} userLat={lat} userLng={lng} />
            </MapErrorBoundary>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 pointer-events-none opacity-50 select-none">
              <MapIcon className="w-24 h-24 mb-6 stroke-[1]" />
              <p className="text-xl font-light">La zone de recherche interactive</p>
            </div>
          )}
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
