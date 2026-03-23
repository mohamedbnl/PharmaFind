
import { geminiClient, GEMINI_MODEL } from '../config/gemini';
import { ExtractionResult, SearchedMedication, Scenario, AIResponse } from '../types/ai';
import { searchMedications } from './search.service';
import { AppError } from '../utils/errors';

export async function processAITextRequest(text: string, lat?: number, lng?: number, radius?: number): Promise<AIResponse> {
  const extractionResult = await extractMedicationsFromText(text);
  return processExtractionResult(extractionResult, 'text', lat, lng, radius);
}

export async function processAIImageRequest(imageBuffer: Buffer, mimeType: string, lat?: number, lng?: number, radius?: number): Promise<AIResponse> {
  const extractionResult = await extractMedicationsFromImage(imageBuffer, mimeType);
  return processExtractionResult(extractionResult, 'image', lat, lng, radius);
}

async function extractMedicationsFromText(text: string): Promise<ExtractionResult> {
  const prompt = `
    Analyze the following text which contains a request to find medications.
    Extract the medication names, their dosages, and try to normalize them to French and Arabic names.
    Also, detect the main language of the text.

    Text: "${text}"
    
    Return a strictly formatted JSON object matching this schema without markdown wrapper:
    {
      "detectedLanguage": "fr" | "ar" | "en",
      "medications": [
        {
          "rawText": "string",
          "cleanedName": "string",
          "dosage": "string (optional)",
          "name_fr": "string (optional)",
          "name_ar": "string (optional)"
        }
      ]
    }
  `;

  try {
    const response = await geminiClient.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    if (!response.text) {
      throw new AppError('AI_EXTRACTION_FAILED', 500, "Failed to extract text from AI response");
    }

    return JSON.parse(response.text) as ExtractionResult;
  } catch (error: any) {
    console.error('Gemini text extraction error:', error);
    const msg = error?.message || error?.statusText || 'Could not analyze text using AI assistant.';
    throw new AppError('AI_EXTRACTION_FAILED', 500, `AI Error: ${msg}`);
  }
}

async function extractMedicationsFromImage(imageBuffer: Buffer, mimeType: string): Promise<ExtractionResult> {
  const prompt = `
    Analyze this image of a medical prescription. 
    Extract the medication names, their dosages, and try to normalize them to French and Arabic names.
    Detect the main language of the prescription.

    Return a strictly formatted JSON object matching this schema without markdown wrapper:
    {
      "detectedLanguage": "fr" | "ar" | "en",
      "medications": [
        {
          "rawText": "string",
          "cleanedName": "string",
          "dosage": "string (optional)",
          "name_fr": "string (optional)",
          "name_ar": "string (optional)"
        }
      ]
    }
  `;

  try {
    const response = await geminiClient.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          inlineData: {
            data: imageBuffer.toString("base64"),
            mimeType
          }
        },
        prompt
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    if (!response.text) {
      throw new AppError('AI_EXTRACTION_FAILED', 500, "Failed to extract text from AI response");
    }

    return JSON.parse(response.text) as ExtractionResult;
  } catch (error: any) {
    console.error('Gemini image extraction error:', error);
    const msg = error?.message || error?.statusText || 'Could not analyze image using AI assistant.';
    throw new AppError('AI_EXTRACTION_FAILED', 500, `AI Error: ${msg}`);
  }
}

async function processExtractionResult(
  extraction: ExtractionResult,
  inputType: 'text' | 'image',
  lat?: number,
  lng?: number,
  radius?: number
): Promise<AIResponse> {
  const searchedMedications: SearchedMedication[] = [];
  const unavailableMedications: { rawText: string; cleanedName: string }[] = [];

  // Search each medication
  for (const med of extraction.medications) {
    const query = med.cleanedName;
    try {
      const results = await searchMedications({ q: query, lat, lng, radius, limit: 10 });

      if (results && results.length > 0) {
        searchedMedications.push({
          ...med,
          available: true,
          pharmacies: results.map((r: any) => ({
            id: r.pharmacy.id,
            nameFr: r.pharmacy.nameFr,
            nameAr: r.pharmacy.nameAr,
            addressFr: r.pharmacy.addressFr,
            distance_km: r.distanceKm,
            latitude: r.pharmacy.latitude,
            longitude: r.pharmacy.longitude,
            stockStatus: r.stock.status,
          })),
        });
      } else {
        unavailableMedications.push({
          rawText: med.rawText,
          cleanedName: med.cleanedName,
        });
      }
    } catch (e) {
      console.error(`Search error for ${query}:`, e);
      unavailableMedications.push({
        rawText: med.rawText,
        cleanedName: med.cleanedName,
      });
    }
  }

  // Compute scenario
  const { recommendedScenario, alternativeScenarios } = computeScenarios(searchedMedications, lat, lng);

  // Generate summary
  const summary = generateSummary(
    extraction.detectedLanguage,
    searchedMedications.length,
    unavailableMedications.length,
    recommendedScenario?.type
  );

  // Generate draft if needed
  let generatedRequestDraft = null;
  if (unavailableMedications.length > 0) {
    generatedRequestDraft = generateRequestDraft(extraction.detectedLanguage, unavailableMedications);
  }

  return {
    success: true,
    inputType,
    detectedLanguage: extraction.detectedLanguage,
    summary,
    medications: searchedMedications,
    recommendedScenario,
    alternativeScenarios,
    unavailableMedications,
    generatedRequestDraft,
  };
}

function computeScenarios(medications: SearchedMedication[], lat?: number, lng?: number): { recommendedScenario: Scenario | null; alternativeScenarios: Scenario[] } {
  if (medications.length === 0) {
    return {
      recommendedScenario: null,
      alternativeScenarios: []
    }
  }

  const allNeededMedsIds = medications.map(m => m.cleanedName);

  // Count pharmacies that have all meds
  const pharmacyAvailabilityMap: Record<string, { id: string, distanceKm: number | null, medsCount: number }> = {};

  medications.forEach(med => {
    med.pharmacies.forEach(p => {
      if (!pharmacyAvailabilityMap[p.id]) {
        pharmacyAvailabilityMap[p.id] = { id: p.id, distanceKm: p.distance_km, medsCount: 0 };
      }
      pharmacyAvailabilityMap[p.id].medsCount++;
    });
  });

  const singlePharmacies = Object.values(pharmacyAvailabilityMap).filter(p => p.medsCount === medications.length);

  // If we have single pharmacies, sort by distance
  if (singlePharmacies.length > 0) {
    singlePharmacies.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));

    const best = singlePharmacies[0];
    const scenario: Scenario = {
      type: 'single_pharmacy',
      pharmacyIds: [best.id],
      message: 'Toutes les prescriptions sont disponibles dans une seule pharmacie proche.',
      totalDistanceKm: best.distanceKm
    }
    return { recommendedScenario: scenario, alternativeScenarios: [] };
  }

  // Default to fallback multiple pharmacies (naïve approach: just collect top 1 from each med)
  const fallbackPharmacyIds = new Set<string>();
  let fallbackTotalDistance = 0;

  medications.forEach(med => {
    if (med.pharmacies.length > 0) {
      const bestP = med.pharmacies[0];
      fallbackPharmacyIds.add(bestP.id);
      fallbackTotalDistance += (bestP.distance_km || 0); // Roughly additive for multi-stops
    }
  });

  const scenario: Scenario = {
    type: 'multiple_pharmacies',
    pharmacyIds: Array.from(fallbackPharmacyIds),
    message: 'Vous devrez visiter plusieurs pharmacies pour compléter cette ordonnance.',
    totalDistanceKm: fallbackTotalDistance
  }

  return { recommendedScenario: scenario, alternativeScenarios: [] };
}

function generateSummary(lang: string, foundCount: number, missingCount: number, scenarioType?: string): string {
  const total = foundCount + missingCount;
  if (lang === 'ar') {
    if (missingCount === 0) return `لقد وجدنا جميع الأدوية الـ ${total} المطلوبة.`;
    if (foundCount === 0) return `عذراً، لم نتمكن من العثور على الأدوية المطلوبة. يمكنك استخدام الطلب الجاهز أدناه.`;
    return `لقد وجدنا ${foundCount} أدوية من أصل ${total}. بعض الأدوية غير متوفرة.`;
  }

  // Default FR/EN
  if (missingCount === 0) return `Nous avons trouvé tous les ${total} médicaments prescrits. ${scenarioType === 'single_pharmacy' ? 'Idéalement, vous pouvez les récupérer au même endroit.' : ''}`;
  if (foundCount === 0) return `Désolé, nous n'avons trouvé aucun des médicaments. Vous pouvez utiliser le brouillon ci-dessous pour les demander à une pharmacie.`;
  return `Nous avons trouvé ${foundCount} médicament(s) sur ${total}. Certains ne sont pas disponibles pour le moment.`;
}

function generateRequestDraft(lang: string, missing: { rawText: string, cleanedName: string }[]): { language: string, message: string } {
  const medNames = missing.map(m => m.cleanedName).join(', ');
  if (lang === 'ar') {
    return {
      language: 'ar',
      message: `السلام عليكم، هل هذه الأدوية متوفرة لديكم؟\n${medNames}\nشكراً لكم.`
    }
  }
  return {
    language: 'fr',
    message: `Bonjour, je cherche ces médicaments : ${medNames}. Sont-ils disponibles dans votre pharmacie ? Merci.`
  }
}

