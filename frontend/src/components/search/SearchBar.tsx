'use client';
import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useMedicationAutocomplete, type AutocompleteResult } from '@/hooks/useMedications';
import { useGeolocation } from '@/hooks/useGeolocation';

interface Props {
  initialQuery?: string;
  className?: string;
}

export function SearchBar({ initialQuery = '', className }: Props) {
  const t = useTranslations('home');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState<AutocompleteResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const { lat, lng, requestLocation } = useGeolocation();

  const { data: suggestions = [], isFetching } = useMedicationAutocomplete(query);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!inputRef.current?.parentElement?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleSelect(med: AutocompleteResult) {
    setSelectedMed(med);
    setQuery(med.nameFr);
    setOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    let finalLat = lat;
    let finalLng = lng;

    // Auto-request location if not yet obtained
    if (!finalLat || !finalLng) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
          }),
        );
        finalLat = pos.coords.latitude;
        finalLng = pos.coords.longitude;
      } catch {
        // denied or unavailable — proceed without location
      }
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('q', selectedMed?.nameFr ?? query);
    params.set('qLabel', selectedMed?.nameFr ?? query);
    if (finalLat) params.set('lat', String(finalLat));
    if (finalLng) params.set('lng', String(finalLng));

    router.push(`/${locale}/search?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className={cn('relative w-full', className)}>
      <div className="relative flex items-center">
        {/* Search icon */}
        <span className="pointer-events-none absolute start-3 text-gray-400">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelectedMed(null); setOpen(true); }}
          onFocus={() => { if (query.length >= 2) setOpen(true); }}
          placeholder={t('searchPlaceholder')}
          className="input-field input-with-icon-start pe-36 py-3 text-base"
          aria-autocomplete="list"
          aria-expanded={open}
          autoComplete="off"
        />

        <button
          type="button"
          onClick={requestLocation}
          className="absolute end-24 p-2 text-gray-400 hover:text-brand-600 transition"
          title={t('locationPrompt')}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <button type="submit" className="absolute end-1 btn-primary px-3 py-2 text-sm">
          {t('searchButton')}
        </button>
      </div>

      {/* Autocomplete dropdown */}
      {open && (query.length >= 2) && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg"
          role="listbox"
        >
          {isFetching && (
            <li className="px-4 py-3 text-sm text-gray-400">Recherche…</li>
          )}
          {!isFetching && suggestions.length === 0 && (
            <li className="px-4 py-3 text-sm text-gray-400">Aucun résultat</li>
          )}
          {suggestions.map((med) => (
            <li
              key={med.id}
              role="option"
              aria-selected={selectedMed?.id === med.id}
              onMouseDown={() => handleSelect(med)}
              className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{med.nameFr}</div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {med.nameAr && <span className="font-arabic">{med.nameAr}</span>}
                  {med.nameAr && <span>·</span>}
                  <span>{med.form}</span>
                  {med.dosage && <span>· {med.dosage}</span>}
                  {med.dci && <span className="truncate">· {med.dci}</span>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
