
import React from 'react';
import { Route, MapPin } from 'lucide-react';
import { Scenario } from '@/types/ai';

interface ScenarioCardProps {
  scenario: Scenario;
  language?: string;
}

export function ScenarioCard({ scenario, language = 'fr' }: ScenarioCardProps) {
  if (!scenario) return null;

  const isRTL = language === 'ar';

  return (
    <div className={`bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-4 items-start ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-emerald-100 p-2 rounded-full shrink-0">
        <Route className="w-6 h-6 text-emerald-600" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-emerald-900 mb-1">
          {isRTL ? 'أفضل مسار مقترح' : 'Meilleur itinéraire recommandé'}
        </h3>
        <p className="text-emerald-800 text-sm mb-2">
          {scenario.message}
        </p>

        {scenario.totalDistanceKm !== null && (
          <div className="flex items-center gap-1 text-emerald-700 text-sm font-medium mt-2">
            <MapPin className="w-4 h-4" />
            <span>
              {isRTL ? 'المسافة الإجمالية:' : 'Distance totale:'} {scenario.totalDistanceKm.toFixed(1)} km
            </span>
          </div>
        )}

          </div>
        </div>
        );
}
