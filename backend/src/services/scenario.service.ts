export interface ScenarioPharmacy {
  id: string;
  distanceKm: number | null;
}

export interface ScenarioInputMedication {
  id: string;
  pharmacyIds: string[];
}

export interface ScenarioResult {
  type: 'single_pharmacy' | 'multi_pharmacy' | 'partial';
  pharmacyIds: string[];
  totalDistanceKm: number | null;
  message: string;
}

function totalDistance(pharmacies: ScenarioPharmacy[], selected: string[]) {
  const map = new Map(pharmacies.map((p) => [p.id, p.distanceKm]));
  const distances = selected
    .map((id) => map.get(id))
    .filter((d): d is number => typeof d === 'number');
  if (!distances.length) return null;
  return distances.reduce((a, b) => a + b, 0);
}

export function computeScenario(params: {
  medications: ScenarioInputMedication[];
  pharmacies: ScenarioPharmacy[];
}): { recommended: ScenarioResult; alternatives: ScenarioResult[] } {
  const { medications, pharmacies } = params;
  if (!medications.length) {
    return {
      recommended: {
        type: 'partial',
        pharmacyIds: [],
        totalDistanceKm: null,
        message: 'No medications detected',
      },
      alternatives: [],
    };
  }

  const coverageByPharmacy = new Map<string, Set<string>>();
  for (const med of medications) {
    for (const pid of med.pharmacyIds) {
      if (!coverageByPharmacy.has(pid)) coverageByPharmacy.set(pid, new Set());
      coverageByPharmacy.get(pid)!.add(med.id);
    }
  }

  const allMedIds = new Set(medications.map((m) => m.id));
  const candidates = Array.from(coverageByPharmacy.entries())
    .filter(([, meds]) => meds.size === allMedIds.size)
    .map(([id]) => id);

  if (candidates.length) {
    const sorted = candidates.sort((a, b) => {
      const da = pharmacies.find((p) => p.id === a)?.distanceKm ?? 9999;
      const db = pharmacies.find((p) => p.id === b)?.distanceKm ?? 9999;
      return da - db;
    });
    const recommendedId = sorted[0];
    const recommended = {
      type: 'single_pharmacy' as const,
      pharmacyIds: [recommendedId],
      totalDistanceKm: totalDistance(pharmacies, [recommendedId]),
      message: 'All medications available in one pharmacy',
    };
    const alternatives = sorted.slice(1, 3).map((id) => ({
      type: 'single_pharmacy' as const,
      pharmacyIds: [id],
      totalDistanceKm: totalDistance(pharmacies, [id]),
      message: 'Alternative single pharmacy option',
    }));
    return { recommended, alternatives };
  }

  const remaining = new Set(allMedIds);
  const selected: string[] = [];
  while (remaining.size > 0) {
    let bestId: string | null = null;
    let bestCoverage = 0;
    let bestDistance = 9999;
    for (const [pid, meds] of coverageByPharmacy.entries()) {
      let count = 0;
      for (const medId of meds) if (remaining.has(medId)) count += 1;
      if (count === 0) continue;
      const dist = pharmacies.find((p) => p.id === pid)?.distanceKm ?? 9999;
      if (count > bestCoverage || (count === bestCoverage && dist < bestDistance)) {
        bestCoverage = count;
        bestId = pid;
        bestDistance = dist;
      }
    }
    if (!bestId) break;
    selected.push(bestId);
    const covered = coverageByPharmacy.get(bestId);
    if (covered) {
      for (const medId of covered) remaining.delete(medId);
    }
  }

  const type = remaining.size === 0 ? 'multi_pharmacy' : 'partial';
  const message = type === 'partial'
    ? 'Some medications are unavailable nearby'
    : 'Multiple pharmacies needed to cover all medications';

  return {
    recommended: {
      type,
      pharmacyIds: selected,
      totalDistanceKm: totalDistance(pharmacies, selected),
      message,
    },
    alternatives: [],
  };
}
