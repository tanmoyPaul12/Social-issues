"use client";

import React, { useEffect, useRef, useState } from "react";

export const JHARKHAND_DISTRICT_COORDINATES: Record<string, { lat: number; lng: number; zoom: number }> = {
  "Bokaro": { lat: 23.6693, lng: 86.1511, zoom: 12 },
  "Chatra": { lat: 24.2093, lng: 84.8711, zoom: 12 },
  "Deoghar": { lat: 24.4826, lng: 86.7001, zoom: 12 },
  "Dhanbad": { lat: 23.7957, lng: 86.4304, zoom: 12 },
  "Dumka": { lat: 24.2676, lng: 87.2486, zoom: 12 },
  "East Singhbhum": { lat: 22.8046, lng: 86.2029, zoom: 12 },
  "Garhwa": { lat: 24.1611, lng: 83.8106, zoom: 12 },
  "Giridih": { lat: 24.1853, lng: 86.3075, zoom: 12 },
  "Godda": { lat: 24.8267, lng: 87.2131, zoom: 12 },
  "Gumla": { lat: 23.0439, lng: 84.5414, zoom: 12 },
  "Hazaribagh": { lat: 23.9925, lng: 85.3637, zoom: 12 },
  "Jamtara": { lat: 23.9629, lng: 86.8029, zoom: 12 },
  "Khunti": { lat: 23.0725, lng: 85.2789, zoom: 12 },
  "Koderma": { lat: 24.4673, lng: 85.5939, zoom: 12 },
  "Latehar": { lat: 23.7441, lng: 84.4989, zoom: 12 },
  "Lohardaga": { lat: 23.4356, lng: 84.6822, zoom: 12 },
  "Pakur": { lat: 24.6344, lng: 87.8486, zoom: 12 },
  "Palamu": { lat: 24.0425, lng: 84.0725, zoom: 12 },
  "Ramgarh": { lat: 23.6315, lng: 85.5186, zoom: 12 },
  "Ranchi": { lat: 23.3441, lng: 85.3096, zoom: 12 },
  "Sahibganj": { lat: 25.2425, lng: 87.6436, zoom: 12 },
  "Saraikela Kharsawan": { lat: 22.6997, lng: 85.9328, zoom: 12 },
  "Simdega": { lat: 22.6167, lng: 84.5000, zoom: 12 },
  "West Singhbhum": { lat: 22.5667, lng: 85.8000, zoom: 12 },
};

interface GeocodeResult {
  formattedAddress?: string;
  block?: string;
  villageOrWard?: string;
  district?: string;
}

interface MapPickerProps {
  district?: string;
  latitude: number | null;
  longitude: number | null;
  onChangeLocation: (lat: number, lng: number, geocodeInfo?: GeocodeResult) => void;
}

declare global {
  interface Window {
    L?: any;
  }
}

export function GoogleMapPicker({
  district,
  latitude,
  longitude,
  onChangeLocation
}: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [isLeafletReady, setIsLeafletReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [activeAddress, setActiveAddress] = useState<string>("");

  // Step 1: Inject Leaflet CSS and JS (Zero-Setup, Free, No API Key needed)
  useEffect(() => {
    if (window.L) {
      setIsLeafletReady(true);
      return;
    }

    // Add Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Add Leaflet JS
    if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => {
        setIsLeafletReady(true);
      };
      document.head.appendChild(script);
    } else {
      const checkInterval = setInterval(() => {
        if (window.L) {
          setIsLeafletReady(true);
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }
  }, []);

  // Step 2: Initialize Leaflet Map once loaded
  useEffect(() => {
    if (!isLeafletReady || !mapContainerRef.current || leafletMapRef.current) return;

    const L = window.L;
    if (!L) return;

    const defaultCenter = district && JHARKHAND_DISTRICT_COORDINATES[district]
      ? JHARKHAND_DISTRICT_COORDINATES[district]
      : { lat: 23.3441, lng: 85.3096, zoom: 12 };

    const initialLat = latitude ?? defaultCenter.lat;
    const initialLng = longitude ?? defaultCenter.lng;
    const initialZoom = latitude ? 14 : defaultCenter.zoom;

    // Custom modern red marker icon
    const customIcon = L.divIcon({
      className: "custom-map-pin",
      html: `
        <div style="position: relative; transform: translate(-50%, -100%);">
          <svg width="34" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 7 13 8 14 1-1 8-8.75 8-14 0-4.42-3.58-8-8-8z" fill="#DC2626"/>
            <circle cx="12" cy="8" r="3.5" fill="#FFFFFF"/>
          </svg>
        </div>
      `,
      iconSize: [34, 42],
      iconAnchor: [17, 42]
    });

    // Create Map
    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: true,
      attributionControl: false
    });

    // Add High-Quality OpenStreetMap Tile Layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      subdomains: ["a", "b", "c"]
    }).addTo(map);

    // Create Draggable Marker
    const marker = L.marker([initialLat, initialLng], {
      icon: customIcon,
      draggable: true
    }).addTo(map);

    leafletMapRef.current = map;
    markerRef.current = marker;

    // Click map -> Move pin & reverse geocode
    map.on("click", (e: any) => {
      const clickedLat = parseFloat(e.latlng.lat.toFixed(6));
      const clickedLng = parseFloat(e.latlng.lng.toFixed(6));
      marker.setLatLng([clickedLat, clickedLng]);
      triggerReverseGeocode(clickedLat, clickedLng);
    });

    // Drag pin -> Update location
    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      const draggedLat = parseFloat(pos.lat.toFixed(6));
      const draggedLng = parseFloat(pos.lng.toFixed(6));
      triggerReverseGeocode(draggedLat, draggedLng);
    });

    // Initial reverse geocode
    if (latitude && longitude) {
      triggerReverseGeocode(latitude, longitude);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [isLeafletReady]);

  // Step 3: Handle District Change
  useEffect(() => {
    if (!leafletMapRef.current || !district) return;
    const preset = JHARKHAND_DISTRICT_COORDINATES[district];
    if (preset && (!latitude || !longitude)) {
      leafletMapRef.current.setView([preset.lat, preset.lng], preset.zoom);
      if (markerRef.current) {
        markerRef.current.setLatLng([preset.lat, preset.lng]);
      }
      onChangeLocation(preset.lat, preset.lng);
    }
  }, [district]);

  // Free Reverse Geocoding (OpenStreetMap Nominatim API - No Key Required)
  const triggerReverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      if (res.ok) {
        const data = await res.json();
        const displayName = data.display_name || "";
        setActiveAddress(displayName);

        const addr = data.address || {};
        const geocodeInfo: GeocodeResult = {
          formattedAddress: displayName,
          villageOrWard: addr.village || addr.suburb || addr.neighbourhood || addr.hamlet || addr.ward,
          block: addr.county || addr.subdistrict || addr.state_district || addr.town || addr.city,
          district: addr.state_district || addr.county
        };

        onChangeLocation(lat, lng, geocodeInfo);
        return;
      }
    } catch (e) {
      console.warn("Reverse geocode fetch failed:", e);
    }
    onChangeLocation(lat, lng);
  };

  // Free Location Search (OpenStreetMap Nominatim API)
  const handleSearch = async (e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const q = encodeURIComponent(`${searchQuery.trim()}, Jharkhand, India`);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${q}&countrycodes=in&limit=5&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (err) {
      console.error("Nominatim search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: any) => {
    const targetLat = parseFloat(parseFloat(result.lat).toFixed(6));
    const targetLng = parseFloat(parseFloat(result.lon).toFixed(6));

    if (leafletMapRef.current) {
      leafletMapRef.current.setView([targetLat, targetLng], 15);
    }
    if (markerRef.current) {
      markerRef.current.setLatLng([targetLat, targetLng]);
    }

    setSearchResults([]);
    setSearchQuery(result.display_name);
    setActiveAddress(result.display_name);

    const addr = result.address || {};
    const geocodeInfo: GeocodeResult = {
      formattedAddress: result.display_name,
      villageOrWard: addr.village || addr.suburb || addr.neighbourhood || addr.hamlet,
      block: addr.county || addr.subdistrict || addr.state_district || addr.town || addr.city,
      district: addr.state_district || addr.county
    };

    onChangeLocation(targetLat, targetLng, geocodeInfo);
  };

  // 1-Click Device GPS Locating
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = parseFloat(pos.coords.latitude.toFixed(6));
        const userLng = parseFloat(pos.coords.longitude.toFixed(6));

        if (leafletMapRef.current) {
          leafletMapRef.current.setView([userLat, userLng], 16);
        }
        if (markerRef.current) {
          markerRef.current.setLatLng([userLat, userLng]);
        }

        triggerReverseGeocode(userLat, userLng);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        alert(`Could not get GPS location: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2">
      {/* Top Search & GPS Actions Bar */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSearch();
                }
              }}
              placeholder="🔍 Search village, block, dam, road or landmark in Jharkhand..."
              className="w-full px-3 py-1.5 text-xs bg-white text-slate-900 border border-slate-300 rounded shadow-xs outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(""); setSearchResults([]); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="px-3 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded cursor-pointer transition-colors flex-shrink-0"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>

          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="px-3 py-1.5 text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 flex items-center justify-center gap-1 cursor-pointer transition-colors flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{isLocating ? "GPS..." : " Auto-Pin GPS"}</span>
          </button>
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded shadow-lg border border-slate-200 max-h-48 overflow-y-auto divide-y divide-slate-100">
            {searchResults.map((res, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectSearchResult(res)}
                className="p-2 hover:bg-blue-50 cursor-pointer text-xs text-slate-800 transition-colors"
              >
                <div className="font-bold text-slate-900">{res.name || res.display_name.split(",")[0]}</div>
                <div className="text-[10px] text-slate-500 truncate">{res.display_name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Map Canvas Container */}
      <div className="relative w-full h-56 sm:h-64 rounded-md overflow-hidden border border-slate-300 shadow-inner bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {!isLeafletReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-600 text-xs font-bold">
            <span className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin mr-2" />
            Loading Interactive Map...
          </div>
        )}

        {/* Selected Address Overlay */}
        <div className="absolute bottom-2 left-2 right-2 sm:right-auto z-[400] bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded shadow-md border border-slate-200 text-[11px] text-slate-700 flex items-center gap-2 max-w-sm">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse flex-shrink-0" />
          <span className="truncate">
            {activeAddress ? activeAddress : "Click map or drag marker to pin problem location"}
          </span>
        </div>
      </div>

      {/* Coordinate Status Display */}
      <div className="flex items-center justify-between text-[11px] bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-500 uppercase tracking-wide">Target GPS:</span>
          {latitude && longitude ? (
            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Lat: {latitude}, Lng: {longitude}
            </span>
          ) : (
            <span className="text-slate-400 italic">Click on map or search locality to pin coordinates</span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 font-medium">Zero Setup • OpenStreetMap</span>
      </div>
    </div>
  );
}

// Alias export for seamless backward compatibility
export const InteractiveMapPicker = GoogleMapPicker;
