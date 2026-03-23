import axios from 'axios';
import { api } from '@/lib/api';
import type { AiRequestPayload, AiResponse } from '@/types/ai';

export async function analyzeMedications(payload: AiRequestPayload) {
  const formData = new FormData();
  if (payload.text?.trim()) formData.append('text', payload.text.trim());
  if (payload.image) formData.append('image', payload.image);
  if (payload.language) formData.append('language', payload.language);
  if (payload.userLocation) {
    formData.append('userLocation', JSON.stringify(payload.userLocation));
  }

  try {
    const { data } = await api.post<AiResponse>('/ai/analyze-medications', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiMessage: string =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message;
      const lower = apiMessage.toLowerCase();
      if (lower.includes('missing') && lower.includes('api key')) {
        throw new Error('Gemini API key is missing');
      }
      if (lower.includes('invalid') && lower.includes('api key')) {
        throw new Error('Gemini API key is invalid or expired');
      }
      throw new Error(apiMessage || 'AI analysis failed, please try again');
    }
    throw new Error('AI analysis failed, please try again');
  }
}
