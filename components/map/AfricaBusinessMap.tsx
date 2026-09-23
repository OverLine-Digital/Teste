"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Africa Business Map — carte interactive du commerce africain.
 *
 * Choix technique : Leaflet est chargé depuis /public/vendor/leaflet
 * (fichiers fournis directement, version 1.9.4 stable) via une balise
 * <script> classique plutôt que le paquet npm "react-leaflet". Ça évite
 * une dépendance supplémentaire à installer et garantit qu'on utilise
 * exactement les fichiers vérifiés, sans divergence de version.
 *
 * Tuiles : OpenStreetMap, gratuit, sans clé API, sans limite de requêtes.
 */

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  kind: "entreprise" | "opportunite" | "corridor";
};

type Props = {
  markers: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
};

// Déclaration minimale pour éviter d'ajouter les types npm "@types/leaflet"
declare global {
  interface Window {
    L?: any;
  }
}

const AFRICA_CENTER: [number, number] = [1.5, 17.5];
const AFRICA_DEFAULT_ZOOM = 3;

const MARKER_COLORS: Record<MapMarker["kind"], string> = {
  entreprise: "#2B3A67", // indigo — une entreprise vérifiée
  opportunite: "#C08A28", // or — une opportunité commerciale ouverte
  corridor: "#1E6F5C", // teal — un corridor logistique actif
};

function loadLeafletAssets(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.L) {
      resolve();
      return;
    }

    const existingScript = document.getElementById("leaflet-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/vendor/leaflet/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.id = "leaflet-script";
    script.src = "/vendor/leaflet/leaflet.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Impossible de charger Leaflet depuis /vendor/leaflet"));
    document.body.appendChild(script);
  });
}

export default function AfricaBusinessMap({ markers, onMarkerClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  // Initialisation de la carte — une seule fois
  useEffect(() => {
    let cancelled = false;

    loadLeafletAssets()
      .then(() => {
        if (cancelled || !containerRef.current || mapInstanceRef.current) return;

        const L = window.L;

        // Corrige le chemin des icônes par défaut de Leaflet, qui pointent
        // sinon vers des URLs relatives cassées une fois bundlé par Next.js.
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "/vendor/leaflet/images/marker-icon-2x.png",
          iconUrl: "/vendor/leaflet/images/marker-icon.png",
          shadowUrl: "/vendor/leaflet/images/marker-shadow.png",
        });

        const map = L.map(containerRef.current, {
          center: AFRICA_CENTER,
          zoom: AFRICA_DEFAULT_ZOOM,
          minZoom: 2,
          maxZoom: 12,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        markerLayerRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;
        setStatus("ready");
      })
      .catch(() => setStatus("error"));

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Mise à jour des marqueurs quand la liste change
  useEffect(() => {
    if (status !== "ready" || !window.L || !markerLayerRef.current) return;

    const L = window.L;
    markerLayerRef.current.clearLayers();

    for (const marker of markers) {
      const circleMarker = L.circleMarker([marker.lat, marker.lng], {
        radius: 8,
        fillColor: MARKER_COLORS[marker.kind],
        color: "#EFEDE6",
        weight: 2,
        fillOpacity: 0.9,
      }).bindPopup(marker.label);

      if (onMarkerClick) {
        circleMarker.on("click", () => onMarkerClick(marker));
      }

      circleMarker.addTo(markerLayerRef.current);
    }
  }, [markers, status, onMarkerClick]);

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-lg overflow-hidden border border-line">
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone text-ink/60 font-sans text-sm z-10">
          Chargement de la carte…
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone text-clay font-sans text-sm z-10 px-6 text-center">
          Impossible de charger la carte. Vérifiez que les fichiers Leaflet
          sont bien présents dans /public/vendor/leaflet.
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
