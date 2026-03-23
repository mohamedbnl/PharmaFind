'use client';
import { useEffect, useState } from 'react';
import { useMyPharmacy } from '@/hooks/usePharmacies';

export function usePharmacyId() {
  const [id, setId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('pharmacyId');
  });
  const { data } = useMyPharmacy();

  useEffect(() => {
    if (!data?.id) return;
    localStorage.setItem('pharmacyId', data.id);
    setId(data.id);
  }, [data]);

  return id ?? '';
}
