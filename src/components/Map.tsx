import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

type Hospital = {
  id: string;
  name: string;
  city: string;
  lga: string;
  address: string;
  latitude: number;
  longitude: number;
};

type Props = {
  hospitals: Hospital[];
  selectedId?: string | null;
};

export default function MapView({ hospitals }: Props) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());

  // Initialise map once
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [3.3792, 6.5244],
      zoom: 10,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
  }, []);

  // Re-render markers
  useEffect(() => {
    if (!map.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    hospitals.forEach((h) => {
      if (!h.latitude || !h.longitude) return;

      // red pin
      const el = document.createElement("div");
      el.style.cursor = "pointer";
      el.style.width = "28px";
      el.style.height = "36px";
      el.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
          <ellipse cx="14" cy="34" rx="5" ry="2" fill="rgba(0,0,0,0.2)" />
          <path
            d="M14 0C8.477 0 4 4.477 4 10c0 7.5 10 26 10 26S24 17.5 24 10C24 4.477 19.523 0 14 0z"
            fill="#e53e3e"
            stroke="#fff"
            stroke-width="1.5"
          />
          <!-- white cross / plus -->
          <rect x="12.5" y="6" width="3" height="8" rx="1" fill="#fff" />
          <rect x="10" y="8.5" width="8" height="3" rx="1" fill="#fff" />
        </svg>
      `;

      const popup = new mapboxgl.Popup({
        offset: 38,
        closeButton: true,
        maxWidth: "220px",
      }).setHTML(`
        <div style="font-family: system-ui, sans-serif; padding: 2px;">
          <p style="font-weight: 600; font-size: 13px; margin: 0 0 4px; color: #1a1613; line-height: 1.3;">
            ${h.name}
          </p>
          <p style="font-size: 11px; margin: 0 0 2px; color: #5c5449;">
            📍 ${h.address}
          </p>
          <p style="font-size: 11px; margin: 0; color: #5c5449;">
            ${h.city} &bull; ${h.lga} LGA
          </p>
        </div>
      `);

      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([h.longitude, h.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.set(h.id, marker);
    });

    // to fit all on screen
    const withCoords = hospitals.filter((h) => h.latitude && h.longitude);
    if (withCoords.length > 0 && map.current) {
      const bounds = new mapboxgl.LngLatBounds();
      withCoords.forEach((h) => bounds.extend([h.longitude, h.latitude]));
      map.current.fitBounds(bounds, { padding: 60, maxZoom: 14 });
    }
  }, [hospitals]);


  return <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />;
}
