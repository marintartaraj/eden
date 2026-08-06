"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export type PropertyMapMarker = {
  lat: number;
  lng: number;
  href?: string;
  label?: string;
};

// CARTO's free raster basemap tiles — no API key or account needed, unlike
// Mapbox/MapTiler/Google Maps. Attribution required (included below).
// Note: {r} (Leaflet's retina-tile placeholder) is NOT a MapLibre template
// token — MapLibre only substitutes {z}/{x}/{y}, so including {r} here sends
// it through literally as part of the URL.
const TILE_URLS = [
  "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
  "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
  "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
  "https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
];

export function PropertyMap({
  markers,
  className,
}: {
  markers: PropertyMapMarker[];
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || markers.length === 0) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          carto: {
            type: "raster",
            tiles: TILE_URLS,
            tileSize: 256,
            attribution:
              '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>',
          },
        },
        layers: [{ id: "carto-tiles", type: "raster", source: "carto" }],
      },
      center: [markers[0].lng, markers[0].lat],
      zoom: markers.length === 1 ? 14 : 11,
      attributionControl: false,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }));
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    for (const marker of markers) {
      const el = document.createElement(marker.href ? "a" : "div");
      el.className = "block h-7 w-7 -translate-y-1/2 cursor-pointer rounded-full border-2 border-card bg-accent shadow-md";
      if (marker.href) {
        (el as HTMLAnchorElement).href = marker.href;
      }
      if (marker.label) el.title = marker.label;

      new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([marker.lng, marker.lat])
        .addTo(map);
    }

    if (markers.length > 1) {
      const bounds = new maplibregl.LngLatBounds();
      markers.forEach((m) => bounds.extend([m.lng, m.lat]));
      map.fitBounds(bounds, { padding: 60, maxZoom: 14 });
    }

    return () => map.remove();
  }, [markers]);

  if (markers.length === 0) return null;

  return <div ref={containerRef} className={className} />;
}
