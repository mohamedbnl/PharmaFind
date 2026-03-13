import { z } from 'zod';
import { getGeminiModel } from '../config/gemini';
import { AppError } from '../utils/errors';
import { extractJson } from '../utils/aiResponse';

const MedicationSchema = z.object({
  rawText: z.string().min(1),
  cleanedName: z.string().min(1),
  dosage: z.string().optional().nullable(),
  name_fr: z.string().optional().nullable(),
  name_ar: z.string().optional().nullable(),
});

const ExtractionSchema = z.object({
  detectedLanguage: z.string().optional().nullable(),
  medications: z.array(MedicationSchema).default([]),
});

export type ExtractedMedication = z.infer<typeof MedicationSchema>;
export type ExtractionResult = z.infer<typeof ExtractionSchema>;

function buildPrompt() {
  return [
    'You are a medical extraction assistant.',
    'Extract medications and dosages from the input and return JSON only.',
    'Return shape:',
    '{ "detectedLanguage": "fr|ar|en|darija", "medications": [',
    '  { "rawText": "", "cleanedName": "", "dosage": "", "name_fr": "", "name_ar": "" }',
    '] }',
    'Rules:',
    '- Keep cleanedName concise (drug name + dosage if present).',
    '- If a field is unknown, set it to null.',
    '- Do not include extra keys or commentary.',
  ].join('\n');
}

export async function extractFromText(text: string): Promise<ExtractionResult> {
  const model = getGeminiModel();
  try {
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: buildPrompt() }, { text: `INPUT:\n${text}` }],
      }],
      generationConfig: { responseMimeType: 'application/json' },
    });
    const raw = result.response.text();
    const parsed = extractJson(raw);
    return ExtractionSchema.parse(parsed);
  } catch (error) {
    if (error instanceof AppError) throw error;
    const message = error instanceof Error ? error.message : String(error);
    throw new AppError('AI_EXTRACTION_FAILED', 502, `Gemini extraction failed: ${message}`, [message]);
  }
}

export async function extractFromImage(params: {
  imageBuffer: Buffer;
  mimeType: string;
  hintText?: string;
}): Promise<ExtractionResult> {
  const model = getGeminiModel();
  const base64 = params.imageBuffer.toString('base64');
  try {
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { text: buildPrompt() },
          { text: params.hintText ? `HINT:\n${params.hintText}` : 'HINT:\nPrescription image' },
          { inlineData: { data: base64, mimeType: params.mimeType } },
        ],
      }],
      generationConfig: { responseMimeType: 'application/json' },
    });
    const raw = result.response.text();
    const parsed = extractJson(raw);
    return ExtractionSchema.parse(parsed);
  } catch (error) {
    if (error instanceof AppError) throw error;
    const message = error instanceof Error ? error.message : String(error);
    throw new AppError('AI_EXTRACTION_FAILED', 502, `Gemini extraction failed: ${message}`, [message]);
  }
}
