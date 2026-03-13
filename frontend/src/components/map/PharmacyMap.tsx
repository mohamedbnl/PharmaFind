'use client';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { SearchResult } from '@/hooks/useSearch';

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const DEFAULT_CENTER: [number, number] = [35.7595, -5.834];

// OSRM public API — free, no key required (lng,lat order)
const OSRM_URL = (fromLng: number, fromLat: number, toLng: number, toLat: number) =>
  `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?geometries=geojson&overview=full`;

// Colored circle divIcon for pharmacy markers — visually distinct from the blue user dot
const pharmacyIcon = (color: string) =>
  L.divIcon({
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
  });

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE:     '#16a34a', // green
  LOW_STOCK:     '#f59e0b', // amber
  ARRIVING_SOON: '#7c3aed', // purple
  OUT_OF_STOCK:  '#dc2626', // red
};
const STATUS_LABELS: Record<string, string> = {
  AVAILABLE:     'Disponible',
  LOW_STOCK:     'Stock faible',
  ARRIVING_SOON: 'Sur commande',
  OUT_OF_STOCK:  'Indisponible',
};

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findClosest(fromLat: number, fromLng: number, list: SearchResult[]): SearchResult | null {
  if (!list.length) return null;
  return list.reduce((best, r) => {
    const d = haversineKm(fromLat, fromLng, r.pharmacy.latitude, r.pharmacy.longitude);
    const dBest = haversineKm(fromLat, fromLng, best.pharmacy.latitude, best.pharmacy.longitude);
    return d < dBest ? r : best;
  });
}

// Route to the closest OPEN pharmacy (24h pharmacies ensure at least one is always open)
function findBestRoute(fromLat: number, fromLng: number, list: SearchResult[]): SearchResult | null {
  const open = list.filter((r) => r.isOpen);
  return findClosest(fromLat, fromLng, open);
}

interface Props {
  results: SearchResult[];
  userLat?: number;
  userLng?: number;
}

export function PharmacyMap({ results, userLat, userLng }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const hasUser = userLat != null && userLng != null;
    const firstResult = results[0];
    const center: [number, number] = hasUser
      ? [userLat!, userLng!]
      : firstResult
      ? [firstResult.pharmacy.latitude, firstResult.pharmacy.longitude]
      : DEFAULT_CENTER;

    const map = L.map(containerRef.current).setView(center, 13);
    L.tileLayer(TILE_URL, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    let userMarker: L.CircleMarker | null = null;
    let routeLayer: L.GeoJSON | null = null;
    let currentUserLat: number | null = null;
    let currentUserLng: number | null = null;
    let aborted = false;

    async function drawRoute(fromLat: number, fromLng: number, toLat: number, toLng: number) {
      routeLayer?.remove();
      routeLayer = null;
      try {
        const res = await fetch(OSRM_URL(fromLng, fromLat, toLng, toLat));
        const data = await res.json();
        if (aborted) return;
        if (data.routes?.[0]?.geometry) {
          routeLayer = L.geoJSON(data.routes[0].geometry, {
            style: { color: '#2563eb', weight: 5, opacity: 0.75 },
          }).addTo(map);
          map.fitBounds(
            L.latLngBounds([[fromLat, fromLng], [toLat, toLng]]),
            { padding: [50, 50] },
          );
        }
      } catch {
        // OSRM unavailable — skip route silently
      }
    }

    function placeUserAndRoute(lat: number, lng: number, targetResult?: SearchResult) {
      currentUserLat = lat;
      currentUserLng = lng;

      userMarker?.remove();
      // Blue filled circle — distinct from all pharmacy marker colors
      userMarker = L.circleMarker([lat, lng], {
        radius: 9,
        fillColor: '#2563eb',
        color: '#ffffff',
        weight: 3,
        fillOpacity: 1,
      })
        .addTo(map)
        .bindPopup('<strong style="font-size:13px">Votre position</strong>');

      // Route to the closest open pharmacy
      const dest = targetResult ?? findBestRoute(lat, lng, results);
      if (dest) {
        drawRoute(lat, lng, dest.pharmacy.latitude, dest.pharmacy.longitude);
      }
    }

    // Pharmacy markers — colored by stock status
    results.forEach((r) => {
      const color = STATUS_COLORS[r.stock.status] ?? '#6b7280';
      const label = STATUS_LABELS[r.stock.status] ?? r.stock.status;

      const tooltipHtml = `
        <div style="font-size:13px;min-width:160px;line-height:1.5">
          <p style="font-weight:600;color:#111827;margin:0 0 2px">${r.pharmacy.nameFr}</p>
          <p style="color:#6b7280;font-size:11px;margin:0 0 6px">${r.pharmacy.addressFr}</p>
          <span style="background:${color}22;color:${color};font-size:11px;font-weight:600;padding:2px 8px;border-radius:999px">${label}</span>
          <span style="font-size:11px;font-weight:600;margin-left:6px;color:${r.isOpen ? '#16a34a' : '#dc2626'}">${r.isOpen ? 'Ouvert' : 'Fermé'}</span>
          ${r.distanceKm != null ? `<p style="color:#9ca3af;font-size:11px;margin:6px 0 0">${r.distanceKm.toFixed(1)} km</p>` : ''}
          ${r.pharmacy.phone ? `<a href="tel:${r.pharmacy.phone}" style="color:#16a34a;font-size:11px;display:block;margin-top:4px">${r.pharmacy.phone}</a>` : ''}
        </div>`;

      const marker = L.marker([r.pharmacy.latitude, r.pharmacy.longitude], {
        icon: pharmacyIcon(color),
      })
        .addTo(map)
        .bindTooltip(tooltipHtml, { permanent: false, direction: 'top', offset: [0, -10], opacity: 1 });

      // Click → route from current user position to this pharmacy
      marker.on('click', () => {
        if (currentUserLat != null && currentUserLng != null) {
          drawRoute(currentUserLat, currentUserLng, r.pharmacy.latitude, r.pharmacy.longitude);
        }
      });
    });

    // If user position came from URL params
    if (hasUser) {
      placeUserAndRoute(userLat!, userLng!);
    }

    // "Locate me" button
    map.on('locationfound', (e: L.LocationEvent) => {
      placeUserAndRoute(e.latlng.lat, e.latlng.lng);
    });
    map.on('locationerror', () => { /* browser denied — nothing to do */ });

    const locateControl = L.control({ position: 'topleft' });
    locateControl.onAdd = () => {
      const div = L.DomUtil.create('div', 'leaflet-bar');
      const a = L.DomUtil.create('a', '', div) as HTMLAnchorElement;
      a.href = '#';
      a.title = 'Ma position';
      a.style.cssText =
        'display:flex;align-items:center;justify-content:center;width:30px;height:30px;color:#374151;';
      a.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>`;
      L.DomEvent.on(a, 'click', (e) => {
        L.DomEvent.preventDefault(e);
        L.DomEvent.stopPropagation(e);
        map.locate({ setView: false, enableHighAccuracy: true });
      });
      return div;
    };
    locateControl.addTo(map);

    return () => {
      aborted = true;
      map.remove();
    };
  }, [results, userLat, userLng]);

  return <div ref={containerRef} className="h-full w-full rounded-xl" />;
}
