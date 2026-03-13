import { AIResponse } from '../types/ai';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export async function analyzeText(text: string, lat?: number, lng?: number): Promise<AIResponse> {
  const response = await fetch(`${API_URL}/ai/text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, lat, lng }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to analyze text request');
  }

  return response.json();
}

export async function analyzeImage(file: File, lat?: number, lng?: number): Promise<AIResponse> {
  const formData = new FormData();
  formData.append('image', file);
  if (lat) formData.append('lat', lat.toString());
  if (lng) formData.append('lng', lng.toString());

  const response = await fetch(`${API_URL}/ai/image`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to analyze image request');
  }

  return response.json();
}
