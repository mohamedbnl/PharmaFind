import type { AiScenario } from '@/types/ai';

type Props = {
  scenario: AiScenario;
  title: string;
  typeLabel: string;
  distanceLabel: string;
  pharmacyLabel: string;
};

export function ScenarioCard({ scenario, title, typeLabel, distanceLabel, pharmacyLabel }: Props) {
  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-700 mt-2">{scenario.message}</p>
      <div className="text-xs text-gray-500 mt-2 flex flex-wrap gap-3">
        <span>{typeLabel}: {scenario.type}</span>
        {scenario.totalDistanceKm != null && (
          <span>{distanceLabel}: {scenario.totalDistanceKm.toFixed(1)} km</span>
        )}
        <span>{pharmacyLabel}: {scenario.pharmacyIds.length}</span>
      </div>
    </div>
  );
}
