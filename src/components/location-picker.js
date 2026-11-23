"use client";

import { useEffect, useRef, useState } from "react";

const CORO_CENTER = { lat: 11.4061, lng: -69.6751 };
const LEAFLET_PROMISE_KEY = "__comidasTopLeafletPromise";

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (window[LEAFLET_PROMISE_KEY]) return window[LEAFLET_PROMISE_KEY];

  window[LEAFLET_PROMISE_KEY] = new Promise((resolve, reject) => {
    if (!document.querySelector('link[data-comidastop-leaflet="styles"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "/vendor/leaflet/leaflet.css";
      link.dataset.comidastopLeaflet = "styles";
      document.head.appendChild(link);
    }

    const script = document.createElement("script");
    script.src = "/vendor/leaflet/leaflet.js";
    script.async = true;
    script.onload = () => {
      if (window.L) resolve(window.L);
      else reject(new Error("Leaflet no quedó disponible en el navegador."));
    };
    script.onerror = () => {
      delete window[LEAFLET_PROMISE_KEY];
      reject(new Error("No se pudo cargar el mapa."));
    };
    document.body.appendChild(script);
  });

  return window[LEAFLET_PROMISE_KEY];
}

function pinIcon(leaflet) {
  return leaflet.divIcon({
    className: "",
    html: '<span class="block h-6 w-6 rounded-full border-4 border-white bg-accent shadow-lg"></span>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

export function LocationPicker({ value, onChange }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const leafletRef = useRef(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState("");

  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    let active = true;

    loadLeaflet().then((leaflet) => {
      if (!active || !containerRef.current) return;
      leafletRef.current = leaflet;

      const start = valueRef.current || CORO_CENTER;
      const map = leaflet.map(containerRef.current).setView(
        [start.lat, start.lng],
        valueRef.current ? 17 : 14,
      );
      leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);
      mapRef.current = map;
      setMapReady(true);

      const placeMarker = (lat, lng, notify) => {
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          const marker = leaflet.marker([lat, lng], {
            draggable: true,
            icon: pinIcon(leaflet),
          }).addTo(map);
          marker.on("dragend", () => {
            const point = marker.getLatLng();
            onChangeRef.current?.({ lat: point.lat, lng: point.lng });
          });
          markerRef.current = marker;
        }
        if (notify) onChangeRef.current?.({ lat, lng });
      };

      map.on("click", (event) => {
        placeMarker(event.latlng.lat, event.latlng.lng, true);
      });

      if (valueRef.current) {
        placeMarker(start.lat, start.lng, false);
      }
    }).catch(() => {
      if (active) setMapError("No se pudo cargar el mapa. Recarga la página o intenta más tarde.");
    });

    return () => {
      active = false;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const leaflet = leafletRef.current;
    const map = mapRef.current;
    if (!leaflet || !map || !value) return;

    const marker = markerRef.current;
    const current = marker?.getLatLng();
    if (
      current &&
      Math.abs(current.lat - value.lat) < 1e-7 &&
      Math.abs(current.lng - value.lng) < 1e-7
    ) {
      return;
    }

    if (marker) {
      marker.setLatLng([value.lat, value.lng]);
    } else {
      const created = leaflet.marker([value.lat, value.lng], {
        draggable: true,
        icon: pinIcon(leaflet),
      }).addTo(map);
      created.on("dragend", () => {
        const point = created.getLatLng();
        onChangeRef.current?.({ lat: point.lat, lng: point.lng });
      });
      markerRef.current = created;
    }
    map.setView([value.lat, value.lng], Math.max(map.getZoom(), 16));
  }, [value]);

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="Mapa para marcar la ubicación del negocio"
      aria-busy={!mapReady && !mapError}
      className="relative isolate z-0 h-[280px] w-full overflow-hidden rounded-[20px] border border-line bg-soft"
    >
      {!mapReady ? (
        <div className="pointer-events-none absolute inset-0 z-[1000] flex items-center justify-center bg-soft/90 px-4 text-center text-sm text-muted">
          {mapError || "Cargando mapa…"}
        </div>
      ) : null}
    </div>
  );
}
