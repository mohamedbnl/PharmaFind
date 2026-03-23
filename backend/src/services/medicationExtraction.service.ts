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
    'You are a medical extraction assistant for Morocco.',
    'Detect if the input is French or Arabic (default to French when unsure).',
    'Extract medications and dosages. Reply with JSON only in this shape:',
    '{ "detectedLanguage": "fr|ar", "medications": [',
    '  { "rawText": "", "cleanedName": "", "dosage": "", "name_fr": "", "name_ar": "" }',
    '] }',
    'Rules:',
    '- Keep cleanedName concise (drug name + dosage if present).',
    '- If a field is unknown, set it to null.',
    '- Do not include extra keys, prose, or comments.',
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
    throw wrapGeminiError(error);
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
    throw wrapGeminiError(error);
  }
}

function wrapGeminiError(error: unknown) {
  if (error instanceof AppError) return error;
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();
  if (lower.includes('api key') || lower.includes('invalid api key')) {
    return new AppError('INVALID_GEMINI_KEY', 401, 'Gemini API key is invalid or expired', [message]);
  }
  if (lower.includes('not found') || lower.includes('model')) {
    return new AppError('INVALID_GEMINI_MODEL', 400, 'Gemini model is invalid', [message]);
  }
  return new AppError('AI_EXTRACTION_FAILED', 502, `Gemini extraction failed: ${message}`, [message]);
}
