import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface StockItem {
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

export function usePharmacyStock(pharmacyId: string | undefined) {
  return useQuery<StockItem[]>({
    queryKey: ['stock', pharmacyId],
    queryFn: async () => {
      const { data } = await api.get(`/stock/${pharmacyId}`);
      return data.data;
    },
    enabled: !!pharmacyId,
    staleTime: 60 * 1000,
  });
}

export function useUpdateStock(pharmacyId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/stock/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stock', pharmacyId] }),
  });
}

export function useBulkUpdateStock(pharmacyId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates: Array<{ id: string; status: string }>) =>
      api.put('/stock/bulk-update', { pharmacyId, updates }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stock', pharmacyId] }),
  });
}

export function useConfirmAllStock(pharmacyId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/stock/confirm-all', { pharmacyId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stock', pharmacyId] }),
  });
}

export function useAddStock(pharmacyId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { medicationId: string; status: string; quantite?: number }) =>
      api.post('/stock', { pharmacyId, ...data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stock', pharmacyId] }),
  });
}

export function useRemoveStock(pharmacyId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/stock/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stock', pharmacyId] }),
  });
}
