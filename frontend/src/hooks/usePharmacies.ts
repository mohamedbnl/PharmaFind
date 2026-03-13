import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface StockItem {
  id: string;
  status: string;
  quantite: number;
  estimatedRestockHours: number;
  lastConfirmedAt: string;
  notes: string | null;
  medication: {
    id: string;
    nameFr: string;
    nameAr: string | null;
    dci: string | null;
    form: string;
    dosage: string | null;
    requiresPrescription: boolean;
  };
}

export interface PharmacyDetail {
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
  email: string | null;
  is24h: boolean;
  operatingHours: Record<string, { open: string; close: string; open2?: string; close2?: string } | null>;
  photoUrl: string | null;
  stock: StockItem[];
}

export function usePharmacy(id: string) {
  return useQuery<PharmacyDetail>({
    queryKey: ['pharmacy', id],
    queryFn: async () => {
      const { data } = await api.get(`/pharmacies/${id}`);
      return data.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyPharmacy() {
  return useQuery<PharmacyDetail | null>({
    queryKey: ['pharmacy', 'me'],
    queryFn: async () => {
      const { data } = await api.get('/pharmacies/me');
      return data.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}
