'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { SearchResult } from '@/hooks/useSearch';
import { StockBadge } from '@/components/search/StockBadge';

// Fix webpack default marker icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
// Tanger city center
const DEFAULT_CENTER: [number, number] = [35.7595, -5.834];

function FlyToLocation({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 14, { duration: 1.2 });
  }, [map, lat, lng]);
  return null;
}

interface Props {
  results: SearchResult[];
  userLat?: number;
  userLng?: number;
}

export function PharmacyMap({ results, userLat, userLng }: Props) {
  const hasUser = userLat != null && userLng != null;
  const firstResult = results[0];
  const center: [number, number] = hasUser
    ? [userLat!, userLng!]
    : firstResult
    ? [firstResult.pharmacy.latitude, firstResult.pharmacy.longitude]
    : DEFAULT_CENTER;

  return (
    <MapContainer center={center} zoom={13} className="h-full w-full rounded-xl" scrollWheelZoom>
      <TileLayer
        url={TILE_URL}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {hasUser && <FlyToLocation lat={userLat!} lng={userLng!} />}

      {results.map((r) => (
        <Marker key={r.stock.id} position={[r.pharmacy.latitude, r.pharmacy.longitude]}>
          <Popup>
            <div className="text-sm min-w-[160px]">
              <p className="font-semibold text-gray-900">{r.pharmacy.nameFr}</p>
              <p className="text-gray-500 text-xs mt-0.5">{r.pharmacy.addressFr}</p>
              <div className="mt-1.5">
                <StockBadge status={r.stock.status} />
              </div>
              {r.distanceKm != null && (
                <p className="text-xs text-gray-400 mt-1">{r.distanceKm.toFixed(1)} km</p>
              )}
              {r.pharmacy.phone && (
                <a href={`tel:${r.pharmacy.phone}`} className="text-xs text-brand-600 hover:underline block mt-1">
                  {r.pharmacy.phone}
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
