import { GoogleGenAI } from '@google/genai';
import { env } from './env';

if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️ GEMINI_API_KEY is not set. AI Assistant features will not work.');
}

export const geminiClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'MISSING_API_KEY',
});

// Use gemini-1.5-flash as the default model if not provided
export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
