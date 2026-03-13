import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useDebounce } from './useDebounce';

export interface AutocompleteResult {
  id: string;
  nameFr: string;
  nameAr?: string;
  dci?: string;
  form: string;
  dosage?: string;
}

export function useMedicationAutocomplete(query: string) {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery<AutocompleteResult[]>({
    queryKey: ['medications', 'autocomplete', debouncedQuery],
    queryFn: async () => {
      const { data } = await api.get('/medications/autocomplete', { params: { q: debouncedQuery } });
      return data.data;
    },
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 60 * 1000,
  });
}

export interface MedicationDetail {
  id: string; nameFr: string; nameAr?: string; dci?: string; form: string;
  dosage?: string; requiresPrescription: boolean; isControlled: boolean;
}

export function useMedication(id: string) {
  return useQuery<MedicationDetail>({
    queryKey: ['medications', id],
    queryFn: async () => {
      const { data } = await api.get(`/medications/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}
