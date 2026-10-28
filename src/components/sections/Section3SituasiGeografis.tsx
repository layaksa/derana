import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Mountain, 
  MapPin, 
  Waves, 
  Globe, 
  Satellite, 
  Layers, 
  Compass, 
  Maximize2, 
  Minimize2, 
  Crosshair, 
  ExternalLink, 
  Copy, 
  Check, 
  Info, 
  Sparkles, 
  Navigation, 
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Sun,
  Moon
} from 'lucide-react';
import { SituasiGeografis, TitikPengamatan } from '../../types/linguistic';
import { ValidatedInput } from '../common/ValidatedInput';
import { FormValidationStatus } from '../common/FormValidationStatus';
import { validateSection3 } from '../../utils/formValidation';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

export interface Section3Props {
  data: SituasiGeografis;
  onChange: (field: keyof SituasiGeografis, value: any) => void;
  titikPengamatan?: TitikPengamatan;
}

export type BaseLayerType = 'satellite' | 'topo' | 'terrain' | 'osm';

interface BaseLayerConfig {
  id: BaseLayerType;
  name: string;
  nameEn: string;
  badge: string;
  url: string;
  attribution: string;
  maxZoom: number;
  description: string;
  descriptionEn: string;
}

const BASE_LAYERS: Record<BaseLayerType, BaseLayerConfig> = {
  satellite: {
    id: 'satellite',
    name: 'Citra Satelit Beresolusi Tinggi',
    nameEn: 'High-Res Satellite Imagery',
    badge: 'Satelit',
    url: '/api/carto/tiles/dark_matter/{z}/{x}/{y}.png',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, GIS User Community',
    maxZoom: 19,
    description: 'Citra foto satelit resolusi tinggi untuk memverifikasi pemukiman, vegetasi, muara sungai, dan garis pantai nyata.',
    descriptionEn: 'High-resolution aerial satellite imagery for visual verification of settlements, coastline, and actual terrain.'
  },
  topo: {
    id: 'topo',
    name: 'Topografi & Garis Kontur Relief',
    nameEn: 'Topography & Elevation Contours',
    badge: 'Topografi',
    url: '/api/carto/tiles/positron/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>)',
    maxZoom: 17,
    description: 'Garis kontur elevasi dan arsir relief medan untuk memverifikasi akurasi morfologi dataran rendah vs pegunungan.',
    descriptionEn: 'Elevation contour lines and hillshade relief to accurately verify lowland vs mountainous morphology.'
  },
  terrain: {
    id: 'terrain',
    name: 'Topografi Medan (Terrain Relief)',
    nameEn: 'Terrain Relief Shading',
    badge: 'Medan Topo',
    url: '/api/carto/tiles/voyager/{z}/{x}/{y}.png',
    attribution: 'Tiles &copy; Esri &mdash; Esri, USGS, Garmin, METI/NASA',
    maxZoom: 19,
    description: 'Peta fisik terpadu dengan arsiran relief lereng gunung dan jaringan hidrologi alami.',
    descriptionEn: 'Integrated terrain relief with mountain slope shading and natural drainage networks.'
  },
  osm: {
    id: 'osm',
    name: 'Peta Standar (Jalan & Batas)',
    nameEn: 'Standard Map (Streets & Borders)',
    badge: 'Jalan & Batas',
    url: '/api/carto/tiles/voyager/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    description: 'Peta kartografi jalan, batas administratif toponimi desa, dan fasilitas umum.',
    descriptionEn: 'Standard cartographic map featuring streets, administrative village borders, and place names.'
  }
};

// Convert decimal coordinate to Degrees Minutes Seconds (DMS) format
function toDMS(val: number, isLat: boolean): string {
  const absVal = Math.abs(val);
  const degrees = Math.floor(absVal);
  const minutesNotTruncated = (absVal - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = Math.floor((minutesNotTruncated - minutes) * 60 * 10) / 10;
  const direction = isLat ? (val >= 0 ? 'LU' : 'LS') : (val >= 0 ? 'BT' : 'BB');
  return `${degrees}°${minutes}'${seconds.toFixed(1)}" ${direction}`;
}

export const Section3SituasiGeografis: React.FC<Section3Props> = ({ 
  data, 
  onChange,
  titikPengamatan 
}) => {
  const { language } = useLanguage();
  const { theme, isDark, toggleTheme } = useTheme();
  const isEn = language === 'en';
  const errors = validateSection3(data);

  // Map state
  const [activeBaseLayer, setActiveBaseLayer] = useState<BaseLayerType>('satellite');
  const [isLayerLoading, setIsLayerLoading] = useState<boolean>(false);
  const [showMap, setShowMap] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isLocatingGPS, setIsLocatingGPS] = useState<boolean>(false);

  // Map DOM and instance refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const fullscreenMapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Parse coordinate values safely
  const latNum = parseFloat(String(data.koordinatLintang || ''));
  const lngNum = parseFloat(String(data.koordinatBujur || ''));
  const hasValidCoordinates = 
    !isNaN(latNum) && 
    !isNaN(lngNum) && 
    latNum >= -90 && 
    latNum <= 90 && 
    lngNum >= -180 && 
    lngNum <= 180;

  // Fallback map center when coordinates are empty: West Java center (Garut/Kuningan/Bandung area)
  const effectiveLat = hasValidCoordinates ? latNum : -7.15;
  const effectiveLng = hasValidCoordinates ? lngNum : 107.85;

  const villageName = titikPengamatan?.namaDesa || 'Titik Pengamatan';
  const kecamatan = titikPengamatan?.kecamatan || '';
  const kabupaten = titikPengamatan?.kabupatenKota || '';
  const lokasiLengkap = [villageName, kecamatan, kabupaten].filter(Boolean).join(', ');

  // Morphology label helper
  const getMorphologyLabel = (m: string) => {
    switch (m) {
      case 'dataran': return isEn ? 'Lowland / Alluvial Plains' : 'Dataran Rendah / Aluvial';
      case 'pegunungan': return isEn ? 'High Mountainous' : 'Pegunungan Tinggi';
      case 'perbukitan': return isEn ? 'Hills / Terraced Slopes' : 'Perbukitan / Undak-undakan';
      case 'pesisir': return isEn ? 'Coastal / Estuary' : 'Pesisir / Muara Pantai';
      case 'lainnya': return isEn ? 'Other / River Basin' : 'Lainnya / Daerah Aliran Sungai';
      default: return m || '-';
    }
  };

  // Create custom HTML DivIcon for observation point marker
  const createMarkerIcon = (isPinned: boolean) => {
    const pulseHtml = isPinned ? '<span class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75"></span>' : '';
    const iconHtml = `
      <div class="relative flex flex-col items-center group cursor-pointer">
        <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-700 via-indigo-600 to-sky-400 text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-indigo-500/40 transform transition-transform group-hover:scale-110">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          ${pulseHtml}
        </div>
        <div class="mt-1 px-2 py-0.5 rounded-md bg-slate-900/90 text-white text-[10px] font-bold shadow-md whitespace-nowrap border border-white/20 backdrop-blur-xs">
          ${villageName}
        </div>
      </div>
    `;

    return L.divIcon({
      className: 'section3-observation-marker',
      html: iconHtml,
      iconSize: [42, 54],
      iconAnchor: [21, 38],
      popupAnchor: [0, -38]
    });
  };

  // Popup content generator
  const getPopupContent = (lat: number, lng: number) => {
    const dmsLat = toDMS(lat, true);
    const dmsLng = toDMS(lng, false);
    const morphText = getMorphologyLabel(data.morfologi);
    const coastText = data.letakPantai === 'pantai' 
      ? (isEn ? 'Coastal Location' : 'Lokasi Pantai') 
      : (isEn ? 'Inland Location' : 'Lokasi Pedalaman');
    const distText = data.jarakDariPantaiKm 
      ? `${data.jarakDariPantaiKm} km ${isEn ? 'from coast' : 'dari pantai'}` 
      : '';

    return `
      <div class="p-3 text-slate-800 font-sans min-w-[210px] space-y-2">
        <div class="border-b border-slate-200 pb-2">
          <div class="flex items-center gap-1.5 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <span>📍 ${isEn ? 'Observation Point' : 'Titik Pengamatan'}</span>
          </div>
          <h4 class="font-bold text-sm text-slate-900 mt-0.5">${lokasiLengkap}</h4>
        </div>
        <div class="text-xs space-y-1 text-slate-600">
          <div><span class="font-semibold text-slate-700">GPS Dec:</span> <code class="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono text-indigo-700">${lat.toFixed(5)}, ${lng.toFixed(5)}</code></div>
          <div><span class="font-semibold text-slate-700">GPS DMS:</span> <span class="text-[11px] text-slate-700">${dmsLat}, ${dmsLng}</span></div>
          <div><span class="font-semibold text-slate-700">${isEn ? 'Terrain:' : 'Morfologi:'}</span> ${morphText}</div>
          <div><span class="font-semibold text-slate-700">${isEn ? 'Position:' : 'Posisi:'}</span> ${coastText} ${distText ? `(${distText})` : ''}</div>
        </div>
        <div class="pt-1.5 border-t border-slate-100 text-[10px] text-slate-400 italic">
          ${isEn ? 'Drag pin or click map to reposition' : 'Geser pin atau klik peta untuk menyesuaikan posisi'}
        </div>
      </div>
    `;
  };

  // Initialize or re-target map container
  useEffect(() => {
    if (!showMap) return;

    const targetContainer = isFullscreen 
      ? fullscreenMapContainerRef.current 
      : mapContainerRef.current;

    if (!targetContainer) return;

    // Destroy prior map instance if container target changed
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      tileLayerRef.current = null;
      markerRef.current = null;
    }

    const map = L.map(targetContainer, {
      center: [effectiveLat, effectiveLng],
      zoom: hasValidCoordinates ? 13 : 9,
      zoomControl: false,
      attributionControl: true
    });

    // Custom zoom control in bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial tile layer
    const config = BASE_LAYERS[activeBaseLayer];
    setIsLayerLoading(true);
    const tiles = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
      className: 'transition-opacity duration-300'
    });

    tiles.on('loading', () => setIsLayerLoading(true));
    tiles.on('load', () => setIsLayerLoading(false));
    tiles.on('tileerror', () => setIsLayerLoading(false));

    tiles.addTo(map);
    tileLayerRef.current = tiles;

    // Add marker
    const marker = L.marker([effectiveLat, effectiveLng], {
      icon: createMarkerIcon(hasValidCoordinates),
      draggable: true,
      autoPan: true
    }).addTo(map);

    marker.bindPopup(getPopupContent(effectiveLat, effectiveLng));
    markerRef.current = marker;

    // Handle marker drag event to update coordinates
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      const roundedLat = Math.round(pos.lat * 1000000) / 1000000;
      const roundedLng = Math.round(pos.lng * 1000000) / 1000000;

      onChange('koordinatLintang', roundedLat);
      onChange('koordinatBujur', roundedLng);

      marker.setIcon(createMarkerIcon(true));
      marker.setPopupContent(getPopupContent(roundedLat, roundedLng));

      const msg = isEn
        ? `Coordinates updated via dragged pin: ${roundedLat}, ${roundedLng}`
        : `Koordinat diperbarui dari pin: ${roundedLat}, ${roundedLng}`;
      setActionNotice(msg);
      setTimeout(() => setActionNotice(null), 4000);
    });

    // Handle click on map to reposition marker
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const roundedLat = Math.round(lat * 1000000) / 1000000;
      const roundedLng = Math.round(lng * 1000000) / 1000000;

      onChange('koordinatLintang', roundedLat);
      onChange('koordinatBujur', roundedLng);

      if (markerRef.current) {
        markerRef.current.setLatLng([roundedLat, roundedLng]);
        markerRef.current.setIcon(createMarkerIcon(true));
        markerRef.current.setPopupContent(getPopupContent(roundedLat, roundedLng));
        markerRef.current.openPopup();
      }

      const msg = isEn
        ? `Coordinates set to clicked location: ${roundedLat}, ${roundedLng}`
        : `Koordinat disesuaikan ke titik klik: ${roundedLat}, ${roundedLng}`;
      setActionNotice(msg);
      setTimeout(() => setActionNotice(null), 4000);
    });

    mapInstanceRef.current = map;

    // Force map to resize correctly after initial render
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        tileLayerRef.current = null;
        markerRef.current = null;
      }
    };
  }, [showMap, isFullscreen]);

  // Update base tile layer dynamically when activeBaseLayer changes with smooth crossfade and loading state
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const oldLayer = tileLayerRef.current;

    setIsLayerLoading(true);
    const config = BASE_LAYERS[activeBaseLayer];
    const newTiles = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
      className: 'transition-opacity duration-300'
    });

    let loadTimeout: NodeJS.Timeout | null = setTimeout(() => {
      setIsLayerLoading(false);
    }, 4000);

    newTiles.on('loading', () => {
      setIsLayerLoading(true);
    });

    newTiles.on('load', () => {
      if (loadTimeout) clearTimeout(loadTimeout);
      setIsLayerLoading(false);
      // Remove old layer after new layer tiles have rendered to avoid flickering
      if (oldLayer && map.hasLayer(oldLayer)) {
        setTimeout(() => {
          try {
            map.removeLayer(oldLayer);
          } catch {
            // ignore
          }
        }, 150);
      }
    });

    newTiles.on('tileerror', () => {
      if (loadTimeout) clearTimeout(loadTimeout);
      setIsLayerLoading(false);
      if (oldLayer && map.hasLayer(oldLayer)) {
        try {
          map.removeLayer(oldLayer);
        } catch {
          // ignore
        }
      }
    });

    newTiles.addTo(map);
    tileLayerRef.current = newTiles;

    return () => {
      if (loadTimeout) clearTimeout(loadTimeout);
    };
  }, [activeBaseLayer]);

  // Sync marker position when inputs change externally
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;

    if (hasValidCoordinates) {
      markerRef.current.setLatLng([latNum, lngNum]);
      markerRef.current.setIcon(createMarkerIcon(true));
      markerRef.current.setPopupContent(getPopupContent(latNum, lngNum));
    }
  }, [data.koordinatLintang, data.koordinatBujur, villageName, data.morfologi, data.letakPantai, data.jarakDariPantaiKm]);

  // Center map on observation point
  const handleCenterOnPoint = () => {
    if (!mapInstanceRef.current) return;
    if (hasValidCoordinates) {
      mapInstanceRef.current.flyTo([latNum, lngNum], 14, { duration: 1.2 });
      if (markerRef.current) {
        markerRef.current.openPopup();
      }
    } else {
      mapInstanceRef.current.flyTo([effectiveLat, effectiveLng], 10, { duration: 1.0 });
    }
  };

  // Copy coordinates string
  const handleCopyCoordinates = () => {
    if (!hasValidCoordinates) return;
    const text = `${latNum}, ${lngNum}`;
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  // Fetch current GPS from device
  const handleFetchDeviceGPS = () => {
    if (!navigator.geolocation) {
      alert(isEn ? 'Geolocation is not supported by your browser' : 'Geolocation tidak didukung oleh browser Anda');
      return;
    }

    setIsLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingGPS(false);
        const { latitude, longitude } = pos.coords;
        const roundedLat = Math.round(latitude * 1000000) / 1000000;
        const roundedLng = Math.round(longitude * 1000000) / 1000000;

        onChange('koordinatLintang', roundedLat);
        onChange('koordinatBujur', roundedLng);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([roundedLat, roundedLng], 14, { duration: 1.2 });
        }

        const msg = isEn 
          ? `Device GPS location applied: ${roundedLat}, ${roundedLng}`
          : `Lokasi GPS perangkat berhasil diterapkan: ${roundedLat}, ${roundedLng}`;
        setActionNotice(msg);
        setTimeout(() => setActionNotice(null), 4500);
      },
      (err) => {
        setIsLocatingGPS(false);
        alert(isEn ? `GPS Error: ${err.message}` : `Gagal memperoleh GPS: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Reusable Map Control Bar
  const renderMapToolbar = (compact: boolean = false) => (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-950/95 text-slate-800 dark:text-white backdrop-blur-md rounded-t-xl border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      {/* Base Layer Switchers */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mr-1">
          <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="hidden sm:inline">{isEn ? 'Base Layer:' : 'Peta Dasar:'}</span>
        </span>

        {/* Loading Spinner Badge */}
        {isLayerLoading && (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 animate-pulse mr-1">
            <Loader2 className="w-3 h-3 animate-spin text-amber-600 dark:text-amber-400" />
            <span>{isEn ? 'Loading map tiles...' : 'Memuat ubin peta...'}</span>
          </span>
        )}

        {/* Satelit Button */}
        <button
          type="button"
          onClick={() => setActiveBaseLayer('satellite')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeBaseLayer === 'satellite'
              ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/30'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white dark:border-slate-700'
          }`}
          title={isEn ? 'Esri World Imagery High-Resolution Satellite' : 'Citra Satelit Resolusi Tinggi Esri'}
        >
          <Satellite className={`w-3.5 h-3.5 ${activeBaseLayer === 'satellite' ? 'text-white' : 'text-emerald-600 dark:text-emerald-300'}`} />
          <span>{isEn ? 'Satellite' : 'Satelit'}</span>
        </button>

        {/* Topografi Relief Button */}
        <button
          type="button"
          onClick={() => setActiveBaseLayer('topo')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeBaseLayer === 'topo'
              ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-500/30'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white dark:border-slate-700'
          }`}
          title={isEn ? 'OpenTopoMap Contour Lines & Elevation Relief' : 'Garis Kontur Ketinggian & Arsir Relief Topografi'}
        >
          <Mountain className={`w-3.5 h-3.5 ${activeBaseLayer === 'topo' ? 'text-white' : 'text-amber-600 dark:text-amber-300'}`} />
          <span>{isEn ? 'Topography' : 'Topografi'}</span>
        </button>

        {/* Terrain Topo Button */}
        <button
          type="button"
          onClick={() => setActiveBaseLayer('terrain')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeBaseLayer === 'terrain'
              ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-500/30'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white dark:border-slate-700'
          }`}
          title={isEn ? 'Esri World Topo Terrain Shading' : 'Peta Topografi Medan Berarsir Esri'}
        >
          <Compass className={`w-3.5 h-3.5 ${activeBaseLayer === 'terrain' ? 'text-white' : 'text-indigo-600 dark:text-indigo-300'}`} />
          <span>{isEn ? 'Terrain' : 'Medan'}</span>
        </button>

        {/* OpenStreetMap Standard Button */}
        <button
          type="button"
          onClick={() => setActiveBaseLayer('osm')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeBaseLayer === 'osm'
              ? 'bg-sky-600 text-white shadow-xs ring-2 ring-sky-500/30'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white dark:border-slate-700'
          }`}
          title={isEn ? 'Standard OpenStreetMap Cartography' : 'Peta Jalan & Batas Wilayah OpenStreetMap'}
        >
          <Globe className={`w-3.5 h-3.5 ${activeBaseLayer === 'osm' ? 'text-white' : 'text-sky-600 dark:text-sky-300'}`} />
          <span>{isEn ? 'Streets / OSM' : 'Jalan / OSM'}</span>
        </button>
      </div>

      {/* Action Tools */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Quick Theme Toggle (Terang / Gelap) */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 transition-colors shadow-2xs cursor-pointer"
          title={isDark ? (isEn ? 'Switch to Light Mode' : 'Beralih ke Tampilan Mode Terang') : (isEn ? 'Switch to Dark Mode' : 'Beralih ke Tampilan Mode Gelap')}
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Terang</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Gelap</span>
            </>
          )}
        </button>

        {/* Recenter Button */}
        <button
          type="button"
          onClick={handleCenterOnPoint}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 transition-colors shadow-2xs cursor-pointer"
          title={isEn ? 'Center map on observation point' : 'Pusatkan peta ke titik pengamatan'}
        >
          <Crosshair className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span className="hidden sm:inline">{isEn ? 'Recenter' : 'Pusatkan'}</span>
        </button>

        {/* Fetch Device GPS Button */}
        <button
          type="button"
          onClick={handleFetchDeviceGPS}
          disabled={isLocatingGPS}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/60 dark:hover:bg-indigo-800 dark:text-indigo-200 dark:border-indigo-700/50 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
          title={isEn ? 'Fetch current device GPS' : 'Ambil posisi GPS perangkat saat ini'}
        >
          <Navigation className={`w-3.5 h-3.5 text-indigo-600 dark:text-indigo-300 ${isLocatingGPS ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isLocatingGPS ? 'GPS...' : (isEn ? 'My GPS' : 'GPS Saya')}</span>
        </button>

        {/* Copy Coordinates */}
        {hasValidCoordinates && (
          <button
            type="button"
            onClick={handleCopyCoordinates}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 transition-colors shadow-2xs cursor-pointer"
            title={isEn ? 'Copy coordinates to clipboard' : 'Salin koordinat ke clipboard'}
          >
            {copiedNotification ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">{isEn ? 'Copied' : 'Tersalin'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span className="hidden md:inline">{isEn ? 'Copy' : 'Salin'}</span>
              </>
            )}
          </button>
        )}

        {/* External Map Verification */}
        {hasValidCoordinates && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${latNum},${lngNum}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 transition-colors shadow-2xs"
            title={isEn ? 'Open in Google Maps' : 'Buka di Google Maps'}
          >
            <ExternalLink className="w-3 h-3 text-slate-500 dark:text-slate-400" />
            <span className="hidden lg:inline">Google Maps</span>
          </a>
        )}

        {/* Fullscreen Toggle */}
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-indigo-600 dark:text-slate-200 dark:hover:text-white dark:border-slate-700 transition-all shadow-2xs ml-1 cursor-pointer"
          title={isFullscreen ? (isEn ? 'Exit fullscreen' : 'Keluar layar penuh') : (isEn ? 'Fullscreen map' : 'Layar penuh peta')}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5" />
              <span>{isEn ? 'Exit' : 'Kecilkan'}</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{isEn ? 'Fullscreen' : 'Layar Penuh'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <section id="section-3" className="scroll-mt-36 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs p-5 md:p-6 transition-all space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-100 dark:border-indigo-900/50 shadow-2xs shrink-0">
            3
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>{isEn ? 'Geographic Situation & Morphology' : 'Situasi Geografis & Morfologi'}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {isEn ? 'Satellite & Topo Verified' : 'Diverifikasi Satelit & Topo'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEn 
                ? 'Village terrain characteristics, coastal distance, morphology, and high-precision geographic coordinates.'
                : 'Karakteristik bentang alam desa, jarak pantai, topografi, dan koordinat lintang serta bujur.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Toggle Map Display */}
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              showMap
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            {showMap ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{showMap ? (isEn ? 'Map Visible' : 'Peta Aktif') : (isEn ? 'Show Map' : 'Buka Peta')}</span>
          </button>

          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
            <Mountain className="w-3.5 h-3.5 text-amber-500" />
            Topografi & GPS
          </span>
        </div>
      </div>

      {/* Section Validation Status */}
      <FormValidationStatus 
        errors={errors} 
        sectionTitle="Situasi Geografis" 
        className="mb-2" 
      />

      {/* Primary Input Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Letak Pantai / Pedalaman */}
        <div className="space-y-3 p-4 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
            {isEn ? 'Geographic Coastal Position' : 'Posisi Geografis terhadap Pantai'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id="btn-geografis-pantai"
              onClick={() => onChange('letakPantai', 'pantai')}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                data.letakPantai === 'pantai'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800 font-semibold shadow-2xs ring-1 ring-blue-500/30'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <Waves className="w-4 h-4 text-blue-500" />
              <span>{isEn ? 'On Coast' : 'Di Pantai'}</span>
            </button>
            <button
              type="button"
              id="btn-geografis-pedalaman"
              onClick={() => onChange('letakPantai', 'pedalaman')}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                data.letakPantai === 'pedalaman'
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 font-semibold shadow-2xs ring-1 ring-amber-500/30'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <Mountain className="w-4 h-4 text-amber-500" />
              <span>{isEn ? 'Inland' : 'Di Pedalaman'}</span>
            </button>
          </div>

          <div>
            <ValidatedInput
              id="geo-jarak-pantai"
              label={isEn ? 'Distance from Coast (KM)' : 'Berapa KM Jarak dari Pantai?'}
              type="number"
              min={0}
              step="0.1"
              value={data.jarakDariPantaiKm}
              onChange={(val) => onChange('jarakDariPantaiKm', val)}
              placeholder="Contoh: 0.8 atau 25"
              addonRight={
                <span className="px-2.5 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-700">
                  KM
                </span>
              }
            />
          </div>
        </div>

        {/* Morfologi Wilayah */}
        <div className="space-y-3 p-4 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
          <label htmlFor="geo-morfologi" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
            {isEn ? 'Landscape Morphology / Relief' : 'Morfologi / Bentang Alam Wilayah'}
          </label>
          <select
            id="geo-morfologi"
            value={data.morfologi}
            onChange={(e) => onChange('morfologi', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs"
          >
            <option value="dataran">{isEn ? 'Lowland / Alluvial Plains' : 'Dataran Rendah / Aluvial'}</option>
            <option value="pegunungan">{isEn ? 'High Mountains' : 'Pegunungan Tinggi'}</option>
            <option value="perbukitan">{isEn ? 'Hills / Terraces' : 'Perbukitan / Undak-undakan'}</option>
            <option value="pesisir">{isEn ? 'Coastal / Estuary' : 'Pesisir / Muara Pantai'}</option>
            <option value="lainnya">{isEn ? 'Other / River Basin' : 'Lainnya / Daerah Aliran Sungai'}</option>
          </select>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed bg-indigo-50/60 dark:bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/40 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
            <span>
              {isEn 
                ? 'Tip: Switch to the Topography layer on the map below to verify contour lines and confirm elevation steepness.'
                : 'Tips: Beralih ke lapisan Topografi pada peta di bawah untuk melihat garis kontur ketinggian dan memverifikasi kecuraman lereng.'}
            </span>
          </div>
        </div>

        {/* Koordinat Geografis Inputs */}
        <div className="space-y-3 p-4 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span>{isEn ? 'GPS Coordinates (Decimal)' : 'Koordinat Geografis (GPS)'}</span>
            </label>
            {hasValidCoordinates && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3" />
                Valid
              </span>
            )}
          </div>
          <div className="space-y-3">
            <ValidatedInput
              id="geo-lat"
              label={isEn ? 'Latitude (Decimal)' : 'Koordinat Lintang (Latitude Decimal)'}
              value={data.koordinatLintang}
              coordinateType="lat"
              onChange={(val) => onChange('koordinatLintang', val)}
              placeholder="Contoh: -7.4982 (LS)"
              helperText={isEn ? 'Valid range: -90.0 to +90.0' : 'Rentang valid: -90.0 hingga +90.0'}
            />
            <ValidatedInput
              id="geo-lng"
              label={isEn ? 'Longitude (Decimal)' : 'Koordinat Bujur (Longitude Decimal)'}
              value={data.koordinatBujur}
              coordinateType="lng"
              onChange={(val) => onChange('koordinatBujur', val)}
              placeholder="Contoh: 107.3485 (BT)"
              helperText={isEn ? 'Valid range: -180.0 to +180.0' : 'Rentang valid: -180.0 hingga +180.0'}
            />
          </div>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-medium animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setActionNotice(null)}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-bold ml-2"
          >
            &times;
          </button>
        </div>
      )}

      {/* INTERACTIVE GEOGRAPHIC VERIFICATION MAP (SATELLITE & TOPOGRAPHY) */}
      {showMap && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden bg-white dark:bg-slate-900 transition-all">
          {/* Map Toolbar */}
          {renderMapToolbar(false)}

          {/* Active Layer Description Banner */}
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition-colors">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                {isEn ? 'Active Layer:' : 'Lapisan Aktif:'}
              </span>
              <span className="font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] border border-slate-200 dark:border-slate-700 shadow-2xs">
                {isEn ? BASE_LAYERS[activeBaseLayer].nameEn : BASE_LAYERS[activeBaseLayer].name}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:inline">
                — {isEn ? BASE_LAYERS[activeBaseLayer].descriptionEn : BASE_LAYERS[activeBaseLayer].description}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-300 shrink-0">
              <span className="flex items-center gap-1 font-semibold text-blue-700 dark:text-sky-300">
                <MapPin className="w-3.5 h-3.5" />
                {hasValidCoordinates ? `${latNum.toFixed(4)}, ${lngNum.toFixed(4)}` : (isEn ? 'Click map to place pin' : 'Klik peta untuk letakkan pin')}
              </span>
              {hasValidCoordinates && (
                <span className="text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">
                  {toDMS(latNum, true)} • {toDMS(lngNum, false)}
                </span>
              )}
            </div>
          </div>

          {/* Map Container with Smooth Crossfade & Loading Overlay */}
          <div className="relative w-full h-[420px] md:h-[480px] bg-slate-100 dark:bg-slate-950 z-0 overflow-hidden">
            <div 
              ref={mapContainerRef} 
              className="w-full h-full"
              style={{ minHeight: '400px' }}
            />

            {/* Subtle Loading Overlay Indicator */}
            {isLayerLoading && (
              <div className="absolute top-3 right-3 z-20 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/90 text-slate-800 dark:text-white backdrop-blur-md border border-slate-200 dark:border-slate-700/80 shadow-lg text-xs animate-in fade-in duration-200">
                <Loader2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {isEn ? `Loading ${BASE_LAYERS[activeBaseLayer].nameEn}...` : `Memuat ${BASE_LAYERS[activeBaseLayer].badge}...`}
                </span>
              </div>
            )}
          </div>

          {/* Footer Guide & Verification Context */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs transition-colors">
            <div className="flex items-start sm:items-center gap-2 text-slate-600 dark:text-slate-300">
              <Info className="w-4 h-4 text-blue-600 dark:text-indigo-400 shrink-0 mt-0.5 sm:mt-0" />
              <span className="leading-relaxed">
                {isEn ? (
                  <>
                    <strong className="text-slate-900 dark:text-white">Verification Guide:</strong> Use the <strong className="text-emerald-700 dark:text-emerald-300">Satellite</strong> layer to check coastal boundaries and settlements. Use the <strong className="text-amber-700 dark:text-amber-300">Topography</strong> layer to inspect elevation contours, valleys, and mountain peaks. Drag the pin or click anywhere on the map to recalibrate coordinates.
                  </>
                ) : (
                  <>
                    <strong className="text-slate-900 dark:text-white">Panduan Verifikasi:</strong> Gunakan layer <strong className="text-emerald-700 dark:text-emerald-300 font-semibold">Satelit</strong> untuk mengecek garis pantai dan tutupan lahan. Gunakan layer <strong className="text-amber-700 dark:text-amber-300 font-semibold">Topografi</strong> untuk memeriksa garis kontur ketinggian dan kecuraman lereng. Geser pin atau klik peta untuk menyesuaikan koordinat secara instan.
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
                {isEn ? 'Selected Terrain:' : 'Morfologi:'} <strong className="text-slate-900 dark:text-white capitalize">{data.morfologi || 'dataran'}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
                {data.letakPantai === 'pantai' ? (isEn ? 'Coast' : 'Pantai') : (isEn ? 'Inland' : 'Pedalaman')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN MODAL MAP */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/80 dark:bg-black/90 backdrop-blur-md flex flex-col animate-fadeIn">
          {/* Fullscreen Header */}
          <div className="p-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-200 dark:border-slate-800 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{isEn ? 'Full Screen Geographic Verification Map' : 'Peta Verifikasi Geografis Layar Penuh'}</span>
                  <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">({lokasiLengkap})</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isEn 
                    ? 'Inspect terrain relief, satellite aerials, and coordinates in high-detail widescreen view.'
                    : 'Periksa bentang alam, citra satelit resolusi tinggi, dan garis kontur dalam pandangan luas terperinci.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-md cursor-pointer"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>{isEn ? 'Exit Full Screen (ESC)' : 'Tutup Layar Penuh (ESC)'}</span>
              </button>
            </div>
          </div>

          {/* Map Toolbar inside Fullscreen */}
          {renderMapToolbar(true)}

          {/* Fullscreen Map Body with Smooth Loading Overlay */}
          <div className="flex-1 w-full bg-slate-100 dark:bg-slate-950 relative overflow-hidden">
            <div 
              ref={fullscreenMapContainerRef} 
              className="w-full h-full"
            />

            {/* Fullscreen Loading Overlay Indicator */}
            {isLayerLoading && (
              <div className="absolute top-4 right-4 z-20 pointer-events-none flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 dark:bg-slate-900/90 text-slate-800 dark:text-white backdrop-blur-md border border-slate-200 dark:border-slate-700/80 shadow-xl text-xs animate-in fade-in duration-200">
                <Loader2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {isEn ? `Loading ${BASE_LAYERS[activeBaseLayer].nameEn}...` : `Memuat ${BASE_LAYERS[activeBaseLayer].name}...`}
                </span>
              </div>
            )}
          </div>

          {/* Fullscreen Bottom Bar */}
          <div className="p-3 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs transition-colors">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>
                {isEn 
                  ? 'Click anywhere on the satellite or topographic map to relocate the observation point.'
                  : 'Klik di mana saja pada peta satelit atau topografi untuk memindahkan titik pengamatan.'}
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
              <span>LAT: {hasValidCoordinates ? latNum.toFixed(6) : '-'}</span>
              <span>LNG: {hasValidCoordinates ? lngNum.toFixed(6) : '-'}</span>
              {hasValidCoordinates && (
                <span className="text-blue-700 dark:text-sky-300 font-semibold">
                  {toDMS(latNum, true)} / {toDMS(lngNum, false)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
