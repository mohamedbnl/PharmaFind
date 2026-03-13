import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface OnDutyEntry {
  scheduleId: string;
  dutyDate: string;
  startTime: string;
  endTime: string;
  isOvernight: boolean;
  distanceKm: number | null;
  pharmacy: {
    id: string;
    nameFr: string;
    nameAr: string;
    slug: string;
    addressFr: string;
    city: string;
    phone: string;
    whatsapp: string | null;
    latitude: number;
    longitude: number;
    is24h: boolean;
  };
}

interface Params {
  lat?: number | null;
  lng?: number | null;
  city?: string;
  date?: string;
}

export function useOnDuty(params: Params) {
  return useQuery<OnDutyEntry[]>({
    queryKey: ['on-duty', params],
    queryFn: async () => {
      const { data } = await api.get('/on-duty/now', {
        params: {
          lat: params.lat ?? undefined,
          lng: params.lng ?? undefined,
          city: params.city,
          date: params.date,
        },
      });
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
