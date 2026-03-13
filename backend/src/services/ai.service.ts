import { AppError } from '../utils/errors';
import { extractFromImage, extractFromText } from './medicationExtraction.service';
import { searchMedications } from './search.service';
import { computeScenario } from './scenario.service';
import { buildRequestDraft, buildSummary, pickPharmacyName } from '../utils/aiResponse';
import { normalizeLanguage } from '../utils/language';

export interface AiAnalyzeInput {
  text?: string;
  image?: { buffer: Buffer; mimeType: string };
  userLocation?: { latitude: number; longitude: number };
  language?: string;
}

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function analyzeMedications(input: AiAnalyzeInput) {
  const hasText = Boolean(input.text?.trim());
  const hasImage = Boolean(input.image);
  if (!hasText && !hasImage) {
    throw new AppError('MISSING_INPUT', 400, 'Text or image is required');
  }

  if (input.image && !ALLOWED_IMAGE_TYPES.has(input.image.mimeType)) {
    throw new AppError('INVALID_IMAGE', 400, 'Unsupported image type');
  }

  const extraction = hasImage
    ? await extractFromImage({
      imageBuffer: input.image!.buffer,
      mimeType: input.image!.mimeType,
      hintText: input.text,
    })
    : await extractFromText(input.text!);

  const detectedLanguage = normalizeLanguage(input.language ?? extraction.detectedLanguage);
  const meds = extraction.medications ?? [];

  const medicationResults = await Promise.all(meds.map(async (med, index) => {
    try {
      const query = med.cleanedName || med.rawText;
      const results = await searchMedications({
        q: query,
        lat: input.userLocation?.latitude,
        lng: input.userLocation?.longitude,
      });
      return { index, med, results, error: null as Error | null };
    } catch (error) {
      return { index, med, results: [], error: error as Error };
    }
  }));

  const combinedResults = medicationResults.flatMap((r) => r.results);

  const medications = medicationResults.map(({ med, results }) => ({
    rawText: med.rawText,
    cleanedName: med.cleanedName,
    dosage: med.dosage ?? null,
    name_fr: med.name_fr ?? null,
    name_ar: med.name_ar ?? null,
    available: results.length > 0,
    pharmacies: results.map((r) => ({
      id: r.pharmacy.id,
      name: pickPharmacyName(detectedLanguage, r.pharmacy.nameFr, r.pharmacy.nameAr),
      address: r.pharmacy.addressFr,
      distance_km: r.distanceKm,
      latitude: r.pharmacy.latitude,
      longitude: r.pharmacy.longitude,
      stockStatus: r.stock.status,
    })),
  }));

  const unavailableMedications = medications
    .filter((m) => !m.available)
    .map((m) => ({ rawText: m.rawText, cleanedName: m.cleanedName }));

  const scenarioInput = meds.map((med, idx) => ({
    id: String(idx),
    pharmacyIds: medicationResults[idx]?.results.map((r) => r.pharmacy.id) ?? [],
  }));
  const pharmaciesForScenario = Array.from(
    new Map(
      combinedResults.map((r) => [
        r.pharmacy.id,
        { id: r.pharmacy.id, distanceKm: r.distanceKm },
      ]),
    ).values(),
  );

  const scenario = computeScenario({
    medications: scenarioInput,
    pharmacies: pharmaciesForScenario,
  });

  const summary = buildSummary({
    language: detectedLanguage,
    total: medications.length,
    found: medications.filter((m) => m.available).length,
    unavailable: unavailableMedications.length,
    scenarioType: scenario.recommended.type,
  });

  const generatedRequestDraft = unavailableMedications.length
    ? buildRequestDraft({
      language: detectedLanguage,
      items: unavailableMedications.map((m) => m.cleanedName || m.rawText),
    })
    : null;

  return {
    success: true,
    inputType: hasImage ? 'image' : 'text',
    detectedLanguage,
    summary,
    medications,
    recommendedScenario: scenario.recommended,
    alternativeScenarios: scenario.alternatives,
    unavailableMedications,
    generatedRequestDraft,
    combinedResults,
  };
}
