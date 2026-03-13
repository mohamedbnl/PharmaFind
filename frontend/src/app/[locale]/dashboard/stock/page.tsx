'use client';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { usePharmacyStock, useAddStock } from '@/hooks/useStock';
import { usePharmacyId } from '@/hooks/usePharmacyId';
import { useMedicationAutocomplete } from '@/hooks/useMedications';
import { StockTable } from '@/components/dashboard/StockTable';

function AddMedicationForm({ pharmacyId }: { pharmacyId: string }) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data: suggestions = [] } = useMedicationAutocomplete(query);
  const { mutate: addStock, isPending } = useAddStock(pharmacyId);

  function handleAdd() {
    if (!selectedId) return;
    addStock({ medicationId: selectedId, status: 'AVAILABLE' });
    setQuery('');
    setSelectedId('');
    setSelectedName('');
  }

  return (
    <div className="card">
      <h3 className="font-semibold mb-3">{isAr ? 'إضافة دواء' : 'Ajouter un médicament'}</h3>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={selectedName || query}
            onChange={(e) => { setQuery(e.target.value); setSelectedId(''); setSelectedName(''); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={isAr ? 'ابحث عن دواء…' : 'Rechercher un médicament…'}
            className="input-field w-full"
          />
          {showSuggestions && suggestions.length > 0 && !selectedId && (
            <ul className="absolute z-20 mt-1 w-full bg-white rounded-lg border shadow-lg max-h-48 overflow-y-auto">
              {suggestions.map((med) => (
                <li
                  key={med.id}
                  onMouseDown={() => { setSelectedId(med.id); setSelectedName(med.nameFr); setQuery(''); setShowSuggestions(false); }}
                  className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                >
                  <span className="font-medium">{med.nameFr}</span>
                  {med.dosage && <span className="text-gray-400"> · {med.dosage}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={handleAdd}
          disabled={!selectedId || isPending}
          className="btn-primary px-4 py-2 text-sm shrink-0"
        >
          {isPending ? '…' : (isAr ? 'إضافة' : 'Ajouter')}
        </button>
      </div>
    </div>
  );
}

export default function StockPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';

  const pharmacyId = usePharmacyId();

  const { data: stock = [], isLoading, error } = usePharmacyStock(pharmacyId || undefined);

  if (!pharmacyId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-500">
        <p>{isAr ? 'لم يتم العثور على صيدلية.' : 'Aucune pharmacie associée à votre compte.'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {isAr ? 'إدارة المخزون' : 'Gestion du stock'}
      </h1>
      <AddMedicationForm pharmacyId={pharmacyId} />
      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="card animate-pulse h-12" />)}
        </div>
      )}
      {error && (
        <div className="card text-red-500 text-center py-4">
          {isAr ? 'حدث خطأ' : 'Erreur lors du chargement'}
        </div>
      )}
      {!isLoading && !error && (
        <StockTable items={stock} pharmacyId={pharmacyId} />
      )}
    </div>
  );
}
