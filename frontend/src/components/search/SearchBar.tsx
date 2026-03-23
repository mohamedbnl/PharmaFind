'use client';
import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useMedicationAutocomplete, type AutocompleteResult } from '@/hooks/useMedications';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Search, MapPin, Sparkles } from 'lucide-react';

interface Props {
  initialQuery?: string;
  className?: string;
  onAIToggle?: () => void;
}

export function SearchBar({ initialQuery = '', className, onAIToggle }: Props) {
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
      } catch {}
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('q', selectedMed?.nameFr ?? query);
    params.set('qLabel', selectedMed?.nameFr ?? query);
    if (finalLat) params.set('lat', String(finalLat));
    if (finalLng) params.set('lng', String(finalLng));

    router.push(`/${locale}/search?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className={cn('relative w-full z-40', className)}>
      <div className="relative group flex items-center bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md focus-within:shadow-md focus-within:ring-4 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all duration-300 p-1.5 min-h-[60px]">
        {/* Search icon */}
        <div className="flex items-center justify-center w-12 text-gray-400">
          <Search className="w-5 h-5" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelectedMed(null); setOpen(true); }}
          onFocus={() => { if (query.length >= 2) setOpen(true); }}
          placeholder={t('searchPlaceholder')}
          className="flex-1 bg-transparent border-none outline-none text-gray-900 text-base placeholder:text-gray-400 w-full ps-2 pe-4 py-2"
          aria-autocomplete="list"
          aria-expanded={open}
          autoComplete="off"
        />

        <div className="flex items-center gap-2 px-2 shrink-0">
          <button
            type="button"
            onClick={requestLocation}
            className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 bg-white rounded-xl transition-colors duration-200"
            title={t('locationPrompt')}
          >
            <MapPin className="w-5 h-5" />
          </button>
          
          <div className="w-[1px] h-8 bg-gray-200 mx-1 hidden sm:block"></div>

          {onAIToggle && (
            <button
              type="button"
              onClick={onAIToggle}
              className="hidden sm:flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-200 hover:scale-[1.02]"
              title={t('feature1Title')}
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden md:inline">{t('feature1Title')}</span>
              <span className="inline md:hidden">IA</span>
            </button>
          )}

          <button type="submit" className="flex items-center justify-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors duration-200">
            {t('searchButton')}
          </button>
        </div>
      </div>

      {/* Autocomplete dropdown */}
      {open && (query.length >= 2) && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-2 w-full rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden py-2"
          role="listbox"
        >
          {isFetching && (
            <li className="px-5 py-4 text-sm text-gray-400 flex items-center justify-center">
               <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </li>
          )}
          {!isFetching && suggestions.length === 0 && (
            <li className="px-5 py-4 text-sm text-gray-500 text-center">Aucun résultat trouvé</li>
          )}
          {suggestions.map((med) => (
            <li
              key={med.id}
              role="option"
              aria-selected={selectedMed?.id === med.id}
              onMouseDown={() => handleSelect(med)}
              className="flex cursor-pointer items-center justify-between gap-4 px-5 py-3 text-sm hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate text-base">{med.nameFr}</div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 mt-1">
                  {med.nameAr && <span className="font-arabic font-medium">{med.nameAr}</span>}
                  {med.nameAr && <span className="text-gray-300">•</span>}
                  <span className="font-medium bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{med.form}</span>
                  {med.dosage && <span className="font-medium bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{med.dosage}</span>}
                  {med.dci && <span className="truncate text-gray-400">• {med.dci}</span>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
