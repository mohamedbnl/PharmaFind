import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface SearchResult {
  pharmacy: {
    id: string;
    nameFr: string;
    nameAr: string;
    slug: string;
    addressFr: string;
    city: string;
    latitude: number;
    longitude: number;
    phone: string;
    whatsapp: string | null;
    is24h: boolean;
    operatingHours: Record<string, { open: string; close: string; open2?: string; close2?: string } | null>;
    photoUrl: string | null;
  };
  stock: {
    id: string;
    status: string;
    quantite: number;
    estimatedRestockHours: number;
    lastConfirmedAt: string;
    notes: string | null;
  };
  medication: {
    id: string;
    nameFr: string;
    nameAr: string | null;
    dci: string | null;
    form: string;
    dosage: string | null;
    requiresPrescription: boolean;
  };
  distanceKm: number | null;
  trgmScore: number;
}

interface SearchParams {
  q: string;
  lat?: number;
  lng?: number;
  radius?: number;
  status?: string;
}

export function useSearch(params: SearchParams) {
  return useQuery<SearchResult[]>({
    queryKey: ['search', params],
    queryFn: async () => {
      const { data } = await api.get('/search', { params });
      return data.data;
    },
    enabled: params.q.trim().length >= 2,
    staleTime: 2 * 60 * 1000,
  });
}
