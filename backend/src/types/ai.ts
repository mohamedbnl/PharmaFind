export interface MedicationExtraction {
  rawText: string;
  cleanedName: string;
  dosage?: string;
  name_fr?: string;
  name_ar?: string;
}

export interface ExtractionResult {
  detectedLanguage: string;
  medications: MedicationExtraction[];
}

export interface SearchedMedication extends MedicationExtraction {
  available: boolean;
  pharmacies: Array<{
    id: string;
    nameFr: string;
    nameAr: string | null;
    addressFr: string;
    distance_km: number | null;
    latitude: number;
    longitude: number;
    stockStatus: string;
  }>;
}

export interface Scenario {
  type: 'single_pharmacy' | 'multiple_pharmacies' | 'not_found';
  pharmacyIds: string[];
  message: string;
  totalDistanceKm: number | null;
}

export interface AIResponse {
  success: boolean;
  inputType: 'text' | 'image';
  detectedLanguage: string;
  summary: string;
  medications: SearchedMedication[];
  recommendedScenario: Scenario | null;
  alternativeScenarios: Scenario[];
  unavailableMedications: {
    rawText: string;
    cleanedName: string;
  }[];
  generatedRequestDraft: {
    language: string;
    message: string;
  } | null;
}
