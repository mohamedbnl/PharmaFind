import { GoogleGenerativeAI } from '@google/generative-ai';
import { AppError } from '../utils/errors';

let client: GoogleGenerativeAI | null = null;

export function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AppError('MISSING_GEMINI_KEY', 500, 'GEMINI_API_KEY is required');
  }
  const modelName = process.env.GEMINI_MODEL ?? 'gemini-3-flash-preview';
  if (!client) client = new GoogleGenerativeAI(apiKey);
  return client.getGenerativeModel({ model: modelName });
}
