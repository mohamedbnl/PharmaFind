import type { SearchResult } from '@/hooks/useSearch';

export type AiLanguage = 'fr' | 'ar';

export interface AiRequestPayload {
  text?: string;
  image?: File | null;
  userLocation?: { latitude: number; longitude: number };
  language?: AiLanguage;
}

export interface AiMedication {
  rawText: string;
  cleanedName: string;
  dosage: string | null;
  name_fr: string | null;
  name_ar: string | null;
  available: boolean;
  pharmacies: {
    id: string;
    name: string;
    address: string;
    distance_km: number | null;
    latitude: number;
    longitude: number;
    stockStatus: string;
  }[];
}

export interface AiScenario {
  type: 'single_pharmacy' | 'multi_pharmacy' | 'partial';
  pharmacyIds: string[];
  message: string;
  totalDistanceKm: number | null;
}

export interface AiResponse {
  success: true;
  inputType: 'text' | 'image';
  detectedLanguage: AiLanguage;
  summary: string;
  medications: AiMedication[];
  recommendedScenario: AiScenario;
  alternativeScenarios: AiScenario[];
  unavailableMedications: { rawText: string; cleanedName: string }[];
  generatedRequestDraft: { language: AiLanguage; message: string } | null;
  combinedResults: SearchResult[];
}
