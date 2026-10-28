import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Layers, 
  Globe2, 
  Compass, 
  Search, 
  Filter, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  Maximize2, 
  Minimize2, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  ChevronRight, 
  ChevronLeft, 
  TableProperties, 
  Activity, 
  Info,
  Check,
  Share2
} from 'lucide-react';
import { InstrumenPemetaanBahasaData, SurveyRecord } from '../../types/linguistic';

// Distinct accessible thematic colors for lexical variants
const VARIANT_PALETTE = [
  '#2563eb', // Blue
  '#059669', // Emerald
  '#d97706', // Amber
  '#e11d48', // Rose
  '#7c3aed', // Purple
  '#0891b2', // Cyan
  '#ea580c', // Orange
  '#db2777', // Pink
  '#4f46e5', // Indigo
  '#16a34a'  // Green
];

export interface PointGeoData {
  id: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  bahasa: string;
  lat: number;
  lng: number;
  data: InstrumenPemetaanBahasaData;
  isVerified?: boolean;
}

export interface GlossAnalysisItem {
  id: string;
  nomorGlos: number;
  glosIndonesia: string;
  kategori: 'swadesh' | 'budaya';
  subkategori?: string;
  tpValues: {
    tpId: string;
    desa: string;
    provinsi: string;
    bahasa: string;
    bentukLokal: string;
    transkripsiFonetis: string;
    audioUrl?: string;
    catatan?: string;
  }[];
  uniqueForms: {
    bentuk: string;
    count: number;
    percentage: number;
    tpList: string[];
  }[];
  statusKesamaan: 'homogen' | 'variasi' | 'isolat';
  dominantPercentage: number;
  totalFilledTP: number;
}

export interface PetaVirtualIsoglosViewProps {
  points: PointGeoData[];
  glossList: GlossAnalysisItem[];
  initialGlossId?: string;
  onSelectGloss?: (glossId: string) => void;
  onOpenTableView?: () => void;
}

/**
 * Calculates perpendicular bisector segment between two coordinates.
 */
function computePerpendicularBisector(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  spanKm: number = 25
): [number, number][] {
  const midLat = (lat1 + lat2) / 2;
  const midLng = (lng1 + lng2) / 2;

  const dLat = lat2 - lat1;
  const latRad = (midLat * Math.PI) / 180;
  const cosLat = Math.max(0.2, Math.cos(latRad));
  const dLng = (lng2 - lng1) * cosLat;

  const len = Math.sqrt(dLat * dLat + dLng * dLng);
  if (len === 0) return [[midLat, midLng], [midLat, midLng]];

  const normLat = -dLng / len;
  const normLng = dLat / len / cosLat;

  const spanDeg = spanKm / 111.32;

  return [
    [midLat - normLat * spanDeg, midLng - normLng * spanDeg],
    [midLat + normLat * spanDeg, midLng + normLng * spanDeg]
  ];
}

/**
 * Monotone chain algorithm for 2D convex hull.
 */
function getConvexHull(points: [number, number][]): [number, number][] {
  if (points.length < 3) return points;

  const sorted = [...points].sort((a, b) => a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]);

  function cross(o: [number, number], a: [number, number], b: [number, number]) {
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  }

  const lower: [number, number][] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper: [number, number][] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

export const PetaVirtualIsoglosView: React.FC<PetaVirtualIsoglosViewProps> = ({
  points,
  glossList,
  initialGlossId,
  onSelectGloss,
  onOpenTableView
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const initTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Active Gloss selection state
  const [selectedGlossId, setSelectedGlossId] = useState<string>(() => {
    if (initialGlossId && glossList.some(g => g.id === initialGlossId)) {
      return initialGlossId;
    }
    return glossList[0]?.id || '';
  });

  // Visualization modes:
  // 'kata-terpilih': Single gloss isogloss & co-lexical networks
  // 'berkas-global': Complete bundle of isoglosses across entire corpus
  // 'jaringan-kesamaan': Concordance network between points
  const [mapMode, setMapMode] = useState<'kata-terpilih' | 'berkas-global' | 'jaringan-kesamaan'>('kata-terpilih');

  // Layer toggles
  const [showSharedLines, setShowSharedLines] = useState<boolean>(true);
  const [showBoundaryBisectors, setShowBoundaryBisectors] = useState<boolean>(true);
  const [showTerritoryPolygons, setShowTerritoryPolygons] = useState<boolean>(true);
  const [showPointLabels, setShowPointLabels] = useState<boolean>(true);

  // Basemap style: 'light' | 'dark' | 'osm' | 'topo'
  const [basemapStyle, setBasemapStyle] = useState<'light' | 'dark' | 'osm' | 'topo'>('light');

  // Search & filter for gloss picker
  const [searchGlosQuery, setSearchGlosQuery] = useState<string>('');
  const [glosKategoriFilter, setGlosKategoriFilter] = useState<'all' | 'swadesh' | 'budaya'>('all');
  const [swadeshRangeFilter, setSwadeshRangeFilter] = useState<'all' | '1-50' | '51-100' | '101-150' | '151-200'>('all');

  // Interactive Tour / Auto-Play state
  const [isPlayingTour, setIsPlayingTour] = useState<boolean>(false);
  const tourIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Detail Drawer state
  const [selectedPointForDetail, setSelectedPointForDetail] = useState<PointGeoData | null>(null);
  const [selectedPairForDetail, setSelectedPairForDetail] = useState<{
    pA: PointGeoData;
    pB: PointGeoData;
    distKm: number;
    totalTested: number;
    sameCount: number;
    diffCount: number;
    diffPct: number;
    sameWords: string[];
    diffWords: { glos: string; wA: string; wB: string }[];
  } | null>(null);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Audio synthesis state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const playAudio = (id: string, text: string) => {
    setPlayingAudioId(id);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const clean = text.replace(/\[|\]|\/|\.|\-/g, '').trim() || 'kata';
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = 'id-ID';
      u.rate = 0.85;
      u.onend = () => setPlayingAudioId(null);
      u.onerror = () => setPlayingAudioId(null);
      window.speechSynthesis.speak(u);
    } else {
      setTimeout(() => setPlayingAudioId(null), 1000);
    }
  };

  // Find active gloss object
  const activeGloss = useMemo(() => {
    return glossList.find(g => g.id === selectedGlossId) || glossList[0];
  }, [glossList, selectedGlossId]);

  // Filtered gloss list for selector dropdown/search
  const filteredGlossOptions = useMemo(() => {
    return glossList.filter(g => {
      if (glosKategoriFilter !== 'all' && g.kategori !== glosKategoriFilter) return false;
      if (g.kategori === 'swadesh' && swadeshRangeFilter !== 'all') {
        const no = g.nomorGlos;
        if (swadeshRangeFilter === '1-50' && (no < 1 || no > 50)) return false;
        if (swadeshRangeFilter === '51-100' && (no < 51 || no > 100)) return false;
        if (swadeshRangeFilter === '101-150' && (no < 101 || no > 150)) return false;
        if (swadeshRangeFilter === '151-200' && (no < 151 || no > 200)) return false;
      }
      if (searchGlosQuery.trim()) {
        const q = searchGlosQuery.toLowerCase().trim();
        const matchIndo = g.glosIndonesia.toLowerCase().includes(q);
        const matchNo = String(g.nomorGlos).includes(q);
        const matchForms = g.tpValues.some(v => v.bentukLokal.toLowerCase().includes(q));
        if (!matchIndo && !matchNo && !matchForms) return false;
      }
      return true;
    });
  }, [glossList, glosKategoriFilter, swadeshRangeFilter, searchGlosQuery]);

  // Compute Pairwise Corpus Bundles across ALL Glosses for Mode 2 & 3
  const pairwiseBundles = useMemo(() => {
    const list: {
      pA: PointGeoData;
      pB: PointGeoData;
      distKm: number;
      totalTested: number;
      sameCount: number;
      diffCount: number;
      diffPct: number;
      sameWords: string[];
      diffWords: { glos: string; wA: string; wB: string }[];
      bisector: [number, number][];
      directLine: [number, number][];
      midpoint: [number, number];
    }[] = [];

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const pA = points[i];
        const pB = points[j];

        let same = 0;
        let diff = 0;
        const sameWords: string[] = [];
        const diffWords: { glos: string; wA: string; wB: string }[] = [];

        glossList.forEach(item => {
          const valA = item.tpValues.find(v => v.tpId === pA.id)?.bentukLokal?.toLowerCase().trim();
          const valB = item.tpValues.find(v => v.tpId === pB.id)?.bentukLokal?.toLowerCase().trim();

          if (valA && valB) {
            if (valA === valB) {
              same++;
              sameWords.push(item.glosIndonesia);
            } else {
              diff++;
              diffWords.push({
                glos: item.glosIndonesia,
                wA: valA,
                wB: valB
              });
            }
          }
        });

        const total = same + diff;
        const diffPct = total > 0 ? Math.round((diff / total) * 100) : 0;

        // Approx distance in KM
        const dLat = (pB.lat - pA.lat) * 111.32;
        const dLng = (pB.lng - pA.lng) * 111.32 * Math.cos(((pA.lat + pB.lat) / 2 * Math.PI) / 180);
        const distKm = Math.round(Math.sqrt(dLat * dLat + dLng * dLng));

        const bisector = computePerpendicularBisector(pA.lat, pA.lng, pB.lat, pB.lng, Math.min(35, Math.max(15, distKm * 0.4)));
        const directLine: [number, number][] = [[pA.lat, pA.lng], [pB.lat, pB.lng]];
        const midpoint: [number, number] = [(pA.lat + pB.lat) / 2, (pA.lng + pB.lng) / 2];

        list.push({
          pA,
          pB,
          distKm,
          totalTested: total,
          sameCount: same,
          diffCount: diff,
          diffPct,
          sameWords,
          diffWords,
          bisector,
          directLine,
          midpoint
        });
      }
    }

    return list;
  }, [points, glossList]);

  // Group active gloss values by lexical variant form
  const activeVariants = useMemo(() => {
    if (!activeGloss) return [];

    const variantMap = new Map<string, {
      bentuk: string;
      color: string;
      tpItems: {
        point: PointGeoData;
        tpValue: GlossAnalysisItem['tpValues'][0];
      }[];
    }>();

    let colorIdx = 0;
    activeGloss.tpValues.forEach(val => {
      const normForm = val.bentukLokal.toLowerCase().trim();
      const point = points.find(p => p.id === val.tpId);
      if (!point) return;

      if (!variantMap.has(normForm)) {
        variantMap.set(normForm, {
          bentuk: val.bentukLokal,
          color: VARIANT_PALETTE[colorIdx % VARIANT_PALETTE.length],
          tpItems: []
        });
        colorIdx++;
      }

      variantMap.get(normForm)!.tpItems.push({
        point,
        tpValue: val
      });
    });

    return Array.from(variantMap.values());
  }, [activeGloss, points]);

  // Auto-Play tour effect
  useEffect(() => {
    if (isPlayingTour && filteredGlossOptions.length > 0) {
      tourIntervalRef.current = setInterval(() => {
        setSelectedGlossId(prevId => {
          const currentIndex = filteredGlossOptions.findIndex(g => g.id === prevId);
          const nextIndex = (currentIndex + 1) % filteredGlossOptions.length;
          return filteredGlossOptions[nextIndex].id;
        });
      }, 2600);
    } else {
      if (tourIntervalRef.current) clearInterval(tourIntervalRef.current);
    }

    return () => {
      if (tourIntervalRef.current) clearInterval(tourIntervalRef.current);
    };
  }, [isPlayingTour, filteredGlossOptions]);

  // Initialize Leaflet Map once on mount
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const container = mapContainerRef.current;
    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }

    // Center on West Java by default
    const map = L.map(container, {
      center: [-7.1, 107.5],
      zoom: 8,
      zoomControl: false,
      attributionControl: false
    });

    // Custom Zoom Control top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial base layer
    const initialTile = L.tileLayer('/api/carto/tiles/positron/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);
    tileLayerRef.current = initialTile;

    layersGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    initTimerRef.current = setTimeout(() => {
      if (mapInstanceRef.current) {
        try {
          map.invalidateSize();
          const validPoints = points.filter(p => typeof p.lat === 'number' && typeof p.lng === 'number' && !isNaN(p.lat) && !isNaN(p.lng) && Math.abs(p.lat) > 0.01);
          if (validPoints.length > 0) {
            const bounds = L.latLngBounds(validPoints.map(p => [p.lat, p.lng]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10, animate: false });
          }
        } catch (e) {
          // safe fallback
        }
      }
    }, 250);

    return () => {
      if (initTimerRef.current) clearTimeout(initTimerRef.current);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.stop();
          mapInstanceRef.current.closePopup();
          mapInstanceRef.current.closeTooltip();
          mapInstanceRef.current.remove();
        } catch (e) {
          // ignore
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map bounds when points change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || points.length === 0) return;
    const validPoints = points.filter(p => typeof p.lat === 'number' && typeof p.lng === 'number' && !isNaN(p.lat) && !isNaN(p.lng) && Math.abs(p.lat) > 0.01);
    if (validPoints.length > 0) {
      try {
        const bounds = L.latLngBounds(validPoints.map(p => [p.lat, p.lng]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
      } catch (e) {
        // safe fallback
      }
    }
  }, [points]);

  // Update Basemap Layer safely
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      try {
        map.removeLayer(tileLayerRef.current);
      } catch (e) {
        // ignore
      }
      tileLayerRef.current = null;
    }

    let tileUrl = '/api/carto/tiles/positron/{z}/{x}/{y}.png';
    let maxZoom = 19;

    if (basemapStyle === 'dark') {
      tileUrl = '/api/carto/tiles/dark_matter/{z}/{x}/{y}.png';
    } else if (basemapStyle === 'osm') {
      tileUrl = '/api/carto/tiles/voyager/{z}/{x}/{y}.png';
    } else if (basemapStyle === 'topo') {
      tileUrl = '/api/carto/tiles/positron/{z}/{x}/{y}.png';
      maxZoom = 17;
    }

    try {
      const newLayer = L.tileLayer(tileUrl, {
        maxZoom,
        subdomains: 'abcd'
      }).addTo(map);
      tileLayerRef.current = newLayer;
    } catch (e) {
      console.warn('Failed to add tile layer', e);
    }
  }, [basemapStyle]);

  // Render Map Features (Markers, Co-lexical links, Isogloss bundles, and Territory hulls)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layersGroupRef.current;
    if (!map || !group) return;

    try {
      map.closePopup();
      map.closeTooltip();
      group.clearLayers();
    } catch (e) {
      // safe ignore
    }

    // =========================================================================
    // MODE 1: ISOGLOS KATA TERPILIH (Single Selected Gloss Distribution)
    // =========================================================================
    if (mapMode === 'kata-terpilih') {
      // 1. Garis Jaringan Kosakata Sama & Zona Poligon per Varian
      activeVariants.forEach(variant => {
        const variantPoints = variant.tpItems.map(item => item.point);
        const coords: [number, number][] = variantPoints.map(p => [p.lat, p.lng]);

        // A. ZONA POLIGON WILAYAH KOSAKATA SAMA (Convex Hull)
        if (showTerritoryPolygons && coords.length >= 2) {
          if (coords.length >= 3) {
            const hull = getConvexHull(coords);
            const polygon = L.polygon(hull, {
              color: variant.color,
              weight: 2,
              dashArray: '5, 5',
              fillColor: variant.color,
              fillOpacity: 0.14
            });
            polygon.bindTooltip(`Wilayah Isoglos: <b>${variant.bentuk}</b> (${coords.length} Desa)`, {
              direction: 'center',
              className: 'custom-leaflet-tooltip'
            });
            group.addLayer(polygon);
          } else if (coords.length === 2) {
            // Buffer line for 2 points
            const lineCapsule = L.polyline(coords, {
              color: variant.color,
              weight: 16,
              opacity: 0.16,
              lineCap: 'round'
            });
            group.addLayer(lineCapsule);
          }
        }

        // B. GARIS JARINGAN KESAMAAN KOSAKATA ANTAR-TP (Co-lexical Linkages)
        if (showSharedLines && coords.length >= 2) {
          for (let i = 0; i < coords.length; i++) {
            for (let j = i + 1; j < coords.length; j++) {
              const link = L.polyline([coords[i], coords[j]], {
                color: variant.color,
                weight: 4,
                opacity: 0.9,
                dashArray: '8, 8'
              });

              link.bindTooltip(
                `<div class="p-1 text-xs">
                  <div class="font-bold text-emerald-600">✓ Kosakata Sama Persis</div>
                  <div>Glos: <b>${activeGloss?.glosIndonesia}</b></div>
                  <div>Bentuk: <b>${variant.bentuk}</b></div>
                  <div class="text-[10px] text-slate-500">${variantPoints[i].desa} ↔ ${variantPoints[j].desa}</div>
                </div>`,
                { direction: 'top', className: 'custom-leaflet-tooltip' }
              );

              group.addLayer(link);
            }
          }
        }
      });

      // C. GARIS PEMBATAS ISOGLOS (Perpendicular Bisector antara TP dengan kata berbeda)
      if (showBoundaryBisectors && activeVariants.length >= 2) {
        for (let i = 0; i < activeVariants.length; i++) {
          for (let j = i + 1; j < activeVariants.length; j++) {
            const varA = activeVariants[i];
            const varB = activeVariants[j];

            varA.tpItems.forEach(itemA => {
              varB.tpItems.forEach(itemB => {
                const bisector = computePerpendicularBisector(
                  itemA.point.lat, itemA.point.lng,
                  itemB.point.lat, itemB.point.lng,
                  20
                );

                const isoLine = L.polyline(bisector, {
                  color: '#ef4444',
                  weight: 3.5,
                  opacity: 0.85,
                  dashArray: '4, 4'
                });

                isoLine.bindTooltip(
                  `<div class="p-1 text-xs">
                    <div class="font-bold text-rose-600">Batas Isoglos Pemisah</div>
                    <div>Glos: <b>${activeGloss?.glosIndonesia}</b></div>
                    <div>${itemA.point.desa}: <span class="font-bold text-blue-600">${varA.bentuk}</span></div>
                    <div>${itemB.point.desa}: <span class="font-bold text-amber-600">${varB.bentuk}</span></div>
                  </div>`,
                  { direction: 'top', className: 'custom-leaflet-tooltip' }
                );

                group.addLayer(isoLine);
              });
            });
          }
        }
      }

      // D. MARKER TITIK PENGAMATAN DENGAN BENTUK KOSAKATA LOKAL
      points.forEach(point => {
        const val = activeGloss?.tpValues.find(v => v.tpId === point.id);
        const normForm = val?.bentukLokal?.toLowerCase().trim();
        const variant = activeVariants.find(v => v.bentuk.toLowerCase().trim() === normForm);
        const pinColor = variant ? variant.color : '#64748b';
        const displayWord = val?.bentukLokal || '—';
        const displayIpa = val?.transkripsiFonetis ? `[${val.transkripsiFonetis}]` : '';

        const iconHtml = `
          <div class="custom-isogloss-pin cursor-pointer flex flex-col items-center">
            ${showPointLabels ? `
              <div class="px-2.5 py-1 rounded-full text-[11px] font-extrabold shadow-md border flex items-center gap-1.5 whitespace-nowrap transition-transform hover:scale-105" 
                   style="background-color: ${pinColor}; color: #ffffff; border-color: ${pinColor};">
                <span class="w-1.5 h-1.5 rounded-full bg-white shrink-0 animate-ping"></span>
                <span class="max-w-[120px] truncate">${displayWord}</span>
              </div>
            ` : ''}
            <div class="w-4 h-4 rounded-full border-2 border-white shadow-md mt-0.5" style="background-color: ${pinColor};"></div>
            <div class="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs mt-0.5 whitespace-nowrap">
              ${point.desa}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: iconHtml,
          className: 'isogloss-div-icon',
          iconSize: [140, 50],
          iconAnchor: [70, 30]
        });

        const marker = L.marker([point.lat, point.lng], { icon });

        marker.on('click', () => {
          setSelectedPointForDetail(point);
          if (val?.audioUrl) {
            playAudio(point.id, val.audioUrl);
          }
        });

        marker.bindTooltip(
          `<div class="p-1.5 text-xs">
            <div class="font-bold text-slate-900">${point.desa} (${point.kabupaten})</div>
            <div class="text-[11px] text-slate-600">${point.bahasa}</div>
            <div class="mt-1 pt-1 border-t border-slate-200 font-semibold" style="color: ${pinColor};">
              Kata: ${displayWord} ${displayIpa}
            </div>
            <div class="text-[10px] text-blue-600 mt-0.5 font-bold">Klik untuk detail lengkap & audio →</div>
          </div>`,
          { direction: 'top', offset: [0, -10], className: 'custom-leaflet-tooltip' }
        );

        group.addLayer(marker);
      });
    }

    // =========================================================================
    // MODE 2: BERKAS ISOGLOS KOMPARATIF (Isogloss Bundles across Entire Corpus)
    // =========================================================================
    else if (mapMode === 'berkas-global') {
      pairwiseBundles.forEach(bundle => {
        // Line weight based on diff count (the more differences, the thicker the bundle of isoglosses)
        let weight = 2;
        let color = '#06b6d4'; // Light cyan for subtle dialect variation (<20%)

        if (bundle.diffPct >= 70) {
          weight = 7;
          color = '#e11d48'; // Thick red bundle: major language boundary
        } else if (bundle.diffPct >= 45) {
          weight = 5;
          color = '#ea580c'; // Thick orange bundle: strong sub-language boundary
        } else if (bundle.diffPct >= 20) {
          weight = 3.5;
          color = '#f59e0b'; // Amber bundle: dialect boundary
        }

        // Bisector line representing the bundle of isoglosses
        const bundleLine = L.polyline(bundle.bisector, {
          color,
          weight,
          opacity: 0.85,
          lineCap: 'round'
        });

        bundleLine.on('click', () => {
          setSelectedPairForDetail(bundle);
        });

        bundleLine.bindTooltip(
          `<div class="p-1.5 text-xs">
            <div class="font-bold" style="color: ${color};">Berkas Isoglos: ${bundle.diffCount} Kata Berbeda (${bundle.diffPct}%)</div>
            <div class="text-[11px] text-slate-700">${bundle.pA.desa} ↔ ${bundle.pB.desa} (${bundle.distKm} km)</div>
            <div class="text-[10px] text-slate-500 mt-1">Sama: ${bundle.sameCount} kata • Beda: ${bundle.diffCount} kata</div>
            <div class="text-[10px] text-blue-600 font-bold mt-0.5">Klik untuk melihat daftar kata berbeda →</div>
          </div>`,
          { direction: 'top', className: 'custom-leaflet-tooltip' }
        );

        group.addLayer(bundleLine);

        // Midpoint badge indicating bundle thickness
        const badgeHtml = `
          <div class="px-2 py-0.5 rounded-full text-[10px] font-extrabold shadow-md border text-white cursor-pointer"
               style="background-color: ${color}; border-color: ${color};">
            ${bundle.diffCount} Glos
          </div>
        `;

        const badgeIcon = L.divIcon({
          html: badgeHtml,
          className: 'isogloss-badge-icon',
          iconSize: [60, 24],
          iconAnchor: [30, 12]
        });

        const badgeMarker = L.marker(bundle.midpoint, { icon: badgeIcon });
        badgeMarker.on('click', () => {
          setSelectedPairForDetail(bundle);
        });
        group.addLayer(badgeMarker);
      });

      // Markers in bundle mode
      points.forEach(point => {
        const iconHtml = `
          <div class="flex flex-col items-center">
            <div class="w-4 h-4 rounded-full bg-slate-900 border-2 border-white shadow-md"></div>
            <div class="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs mt-0.5 whitespace-nowrap">
              ${point.desa}
            </div>
          </div>
        `;
        const icon = L.divIcon({
          html: iconHtml,
          className: 'isogloss-point-marker',
          iconSize: [100, 35],
          iconAnchor: [50, 15]
        });
        const marker = L.marker([point.lat, point.lng], { icon });
        marker.on('click', () => setSelectedPointForDetail(point));
        group.addLayer(marker);
      });
    }

    // =========================================================================
    // MODE 3: JARINGAN KESAMAAN KOSAKATA (Co-lexical Concordance Network)
    // =========================================================================
    else if (mapMode === 'jaringan-kesamaan') {
      pairwiseBundles.forEach(bundle => {
        const concordancePct = 100 - bundle.diffPct;
        const weight = Math.max(1.5, (concordancePct / 100) * 8);

        const link = L.polyline(bundle.directLine, {
          color: '#10b981',
          weight,
          opacity: 0.75
        });

        link.on('click', () => {
          setSelectedPairForDetail(bundle);
        });

        link.bindTooltip(
          `<div class="p-1.5 text-xs">
            <div class="font-bold text-emerald-600">Kesamaan Leksikal: ${concordancePct}%</div>
            <div>${bundle.pA.desa} ↔ ${bundle.pB.desa}</div>
            <div class="text-[10px] text-slate-500">${bundle.sameCount} kosakata identik dari ${bundle.totalTested} glos</div>
            <div class="text-[10px] text-blue-600 font-bold mt-0.5">Klik untuk lihat daftar kata sama →</div>
          </div>`,
          { direction: 'top', className: 'custom-leaflet-tooltip' }
        );

        group.addLayer(link);
      });

      // Markers
      points.forEach(point => {
        const iconHtml = `
          <div class="flex flex-col items-center">
            <div class="w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow-md"></div>
            <div class="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs mt-0.5 whitespace-nowrap">
              ${point.desa}
            </div>
          </div>
        `;
        const icon = L.divIcon({
          html: iconHtml,
          className: 'isogloss-point-marker',
          iconSize: [100, 35],
          iconAnchor: [50, 15]
        });
        const marker = L.marker([point.lat, point.lng], { icon });
        marker.on('click', () => setSelectedPointForDetail(point));
        group.addLayer(marker);
      });
    }
  }, [
    mapMode, 
    points, 
    activeGloss, 
    activeVariants, 
    pairwiseBundles, 
    showSharedLines, 
    showBoundaryBisectors, 
    showTerritoryPolygons, 
    showPointLabels
  ]);

  // Zoom bounds helper
  const handleFitBounds = () => {
    const map = mapInstanceRef.current;
    if (!map || points.length === 0) return;
    const validPoints = points.filter(p => typeof p.lat === 'number' && typeof p.lng === 'number' && !isNaN(p.lat) && !isNaN(p.lng) && Math.abs(p.lat) > 0.01);
    if (validPoints.length > 0) {
      try {
        const bounds = L.latLngBounds(validPoints.map(p => [p.lat, p.lng]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
      } catch (e) {
        // safe fallback
      }
    }
  };

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-4 sm:p-6 overflow-y-auto' : ''}`}>
      
      {/* 1. TOP HEADER & MAP CONTROLS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-sky-400">
                <Globe2 className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Peta Virtual Interaktif Berkas Isoglos Kosakata
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-sky-300 border border-blue-200 dark:border-blue-800">
                {points.length} Titik Pengamatan
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Visualisasi geolinguistik garis berkas isoglos dan jaringan kesamaan kosakata antar-desa pengamatan.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setMapMode('kata-terpilih')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                mapMode === 'kata-terpilih'
                  ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-sky-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Isoglos Kata Terpilih</span>
            </button>

            <button
              type="button"
              onClick={() => setMapMode('berkas-global')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                mapMode === 'berkas-global'
                  ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-rose-600" />
              <span>Berkas Isoglos 200 Kata</span>
            </button>

            <button
              type="button"
              onClick={() => setMapMode('jaringan-kesamaan')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                mapMode === 'jaringan-kesamaan'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>Jaringan Kesamaan TP</span>
            </button>
          </div>
        </div>

        {/* 2. GLOSS SELECTOR BAR & QUICK JUMP */}
        {mapMode === 'kata-terpilih' && (
          <div className="space-y-3 pt-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              
              {/* Gloss Search & Selector Dropdown */}
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchGlosQuery}
                    onChange={(e) => setSearchGlosQuery(e.target.value)}
                    placeholder="Cari kosakata: air, makan, batu, kabéh..."
                    className="w-full pl-9 pr-7 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-600 focus:outline-hidden text-slate-800 dark:text-slate-200"
                  />
                  {searchGlosQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchGlosQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <select
                  value={selectedGlossId}
                  onChange={(e) => {
                    setSelectedGlossId(e.target.value);
                    if (onSelectGloss) onSelectGloss(e.target.value);
                  }}
                  className="max-w-xs px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer truncate"
                >
                  {filteredGlossOptions.map((g) => (
                    <option key={g.id} value={g.id}>
                      #{g.nomorGlos} {g.glosIndonesia.toUpperCase()} ({g.statusKesamaan === 'homogen' ? '100% Sama' : `${g.uniqueForms.length} Bentuk`})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tour / Auto-Play button & Audio Button */}
              <div className="flex items-center gap-2 self-start md:self-center">
                <button
                  type="button"
                  onClick={() => setIsPlayingTour(!isPlayingTour)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isPlayingTour
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100'
                  }`}
                  title="Putar tur otomatis melintasi 200 kosakata Swadesh"
                >
                  {isPlayingTour ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlayingTour ? 'Jeda Tur Isoglos' : 'Tur Otomatis 200 Kata'}</span>
                </button>

                {onOpenTableView && (
                  <button
                    type="button"
                    onClick={onOpenTableView}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                    title="Buka kembali tabel analisis kosakata"
                  >
                    <TableProperties className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Tabel Matriks</span>
                  </button>
                )}
              </div>
            </div>

            {/* Range Pills for Swadesh 200 */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Rentang:</span>
              {[
                { id: 'all', label: 'Semua 200 Glos' },
                { id: '1-50', label: '#1 - #50' },
                { id: '51-100', label: '#51 - #100' },
                { id: '101-150', label: '#101 - #150' },
                { id: '151-200', label: '#151 - #200' },
              ].map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSwadeshRangeFilter(r.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    swadeshRangeFilter === r.id
                      ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-900 shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. INTERACTIVE MAP VIEWER CONTAINER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col">
        
        {/* Map Top Ribbon Info */}
        <div className="p-3 sm:px-5 sm:py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Active Word summary badge */}
          {mapMode === 'kata-terpilih' && activeGloss ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                #{activeGloss.nomorGlos}
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {activeGloss.glosIndonesia.toUpperCase()}
              </span>
              <span className="text-xs text-slate-500">
                ({activeGloss.statusKesamaan === 'homogen' ? '100% Seragam di Semua TP' : `${activeVariants.length} variasi kata`})
              </span>

              {/* Variants chip list */}
              <div className="flex flex-wrap items-center gap-1.5 ml-2">
                {activeVariants.map(v => (
                  <span
                    key={v.bentuk}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold text-white shadow-2xs"
                    style={{ backgroundColor: v.color }}
                  >
                    <span>{v.bentuk}</span>
                    <span className="bg-black/20 px-1 rounded-full text-[9px]">{v.tpItems.length} TP</span>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <Activity className="w-4 h-4 text-rose-600" />
              <span>
                {mapMode === 'berkas-global' 
                  ? 'Garis Berkas Isoglos Antar-Titik Pengamatan (Ketebalan = Jumlah Perbedaan Kata)'
                  : 'Jaringan Kesamaan Leksikal Antar-Titik Pengamatan (Ketebalan = Derajat Kesamaan)'}
              </span>
            </div>
          )}

          {/* Map display layer controls */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Basemap switch */}
            <select
              value={basemapStyle}
              onChange={(e) => setBasemapStyle(e.target.value as any)}
              className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
            >
              <option value="light">Peta Terang (Carto)</option>
              <option value="dark">Peta Gelap (Dark)</option>
              <option value="osm">OpenStreetMap</option>
              <option value="topo">Topografi (Relief)</option>
            </select>

            <button
              type="button"
              onClick={handleFitBounds}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
              title="Pusatkan peta ke semua titik pengamatan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
              title="Layar Penuh"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Map Canvas */}
        <div className="relative">
          <div 
            ref={mapContainerRef} 
            className="w-full h-[520px] sm:h-[620px] z-0" 
          />

          {/* Floating Map Legend & Layer Toggles overlay */}
          <div className="absolute bottom-4 left-4 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-lg max-w-xs text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5 font-bold text-slate-900 dark:text-white">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Legenda & Lapisan</span>
              </span>
            </div>

            {mapMode === 'kata-terpilih' ? (
              <div className="space-y-1.5 text-[11px]">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={showSharedLines}
                    onChange={(e) => setShowSharedLines(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span>Garis Jaringan Kosakata Sama (Putus-putus)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={showBoundaryBisectors}
                    onChange={(e) => setShowBoundaryBisectors(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-0"
                  />
                  <span>Garis Isoglos Pembatas (Merah)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={showTerritoryPolygons}
                    onChange={(e) => setShowTerritoryPolygons(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-0"
                  />
                  <span>Zona Wilayah Isoglos (Arsiran)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={showPointLabels}
                    onChange={(e) => setShowPointLabels(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span>Label Kata pada Marker Desa</span>
                </label>
              </div>
            ) : (
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-1.5 rounded-full bg-rose-600"></span>
                  <span>Berkas Tebal (&gt;70% Beda: Bahasa Berbeda)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-1.5 rounded-full bg-orange-500"></span>
                  <span>Berkas Sedang (45-70% Beda: Sub-Bahasa)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-1 rounded-full bg-amber-500"></span>
                  <span>Berkas Tipis (20-45% Beda: Dialek)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-0.5 rounded-full bg-cyan-500"></span>
                  <span>Variasi Wicara (&lt;20% Beda)</span>
                </div>
              </div>
            )}
          </div>

          {/* Selected Point Detail Drawer Overlay */}
          {selectedPointForDetail && (
            <div className="absolute top-4 right-4 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl max-w-sm w-full text-xs space-y-3">
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {selectedPointForDetail.desa}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {selectedPointForDetail.kecamatan ? `${selectedPointForDetail.kecamatan}, ` : ''}{selectedPointForDetail.kabupaten} • {selectedPointForDetail.provinsi}
                  </p>
                  <p className="text-[11px] text-blue-600 font-semibold mt-0.5">
                    Bahasa: {selectedPointForDetail.bahasa}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPointForDetail(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Word value for active gloss */}
              {activeGloss && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Glos Terpilih: #{activeGloss.nomorGlos} {activeGloss.glosIndonesia}
                  </span>
                  
                  {(() => {
                    const val = activeGloss.tpValues.find(v => v.tpId === selectedPointForDetail.id);
                    if (!val) {
                      return <p className="text-slate-400 italic">Belum terisi di titik ini.</p>;
                    }
                    return (
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-base font-extrabold text-blue-600 dark:text-sky-400">
                            {val.bentukLokal}
                          </span>
                          <button
                            type="button"
                            onClick={() => playAudio(selectedPointForDetail.id, val.bentukLokal)}
                            className="p-1 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200"
                            title="Dengarkan pengucapan kata"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {val.transkripsiFonetis && (
                          <span className="text-[11px] font-mono text-slate-500">
                            [{val.transkripsiFonetis}]
                          </span>
                        )}
                        {val.catatan && (
                          <p className="text-[10px] text-slate-400 mt-1 italic">
                            Catatan: {val.catatan}
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Same words found in other observation points */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Titik Lain dengan Kosakata yang Sama:
                </span>
                {(() => {
                  const val = activeGloss?.tpValues.find(v => v.tpId === selectedPointForDetail.id);
                  if (!val) return null;
                  const matchingTPs = activeGloss?.tpValues.filter(
                    v => v.tpId !== selectedPointForDetail.id && v.bentukLokal.toLowerCase().trim() === val.bentukLokal.toLowerCase().trim()
                  );

                  if (!matchingTPs || matchingTPs.length === 0) {
                    return (
                      <span className="text-[11px] text-amber-600 italic">
                        Bentuk unik/isolat, tidak ditemukan di titik lain.
                      </span>
                    );
                  }

                  return (
                    <div className="flex flex-wrap gap-1">
                      {matchingTPs.map(m => (
                        <span key={m.tpId} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {m.desa}
                        </span>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Selected Pair Bundle Detail Drawer Overlay */}
          {selectedPairForDetail && (
            <div className="absolute top-4 right-4 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl max-w-md w-full text-xs space-y-3 max-h-[500px] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Berkas Isoglos: {selectedPairForDetail.pA.desa} ↔ {selectedPairForDetail.pB.desa}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Jarak: ~{selectedPairForDetail.distKm} km • Perbedaan: <strong>{selectedPairForDetail.diffPct}%</strong> ({selectedPairForDetail.diffCount} dari {selectedPairForDetail.totalTested} kata)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPairForDetail(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Difference breakdown table */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Daftar Kosakata Pembentuk Berkas Isoglos ({selectedPairForDetail.diffWords.length} kata berbeda):
                </span>
                <div className="max-h-56 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                  {selectedPairForDetail.diffWords.slice(0, 30).map((w, idx) => (
                    <div key={idx} className="p-2 flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 w-24 truncate">
                        {w.glos}
                      </span>
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-sky-300 font-bold">
                          {w.wA}
                        </span>
                        <span className="text-slate-400">vs</span>
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-bold">
                          {w.wB}
                        </span>
                      </div>
                    </div>
                  ))}
                  {selectedPairForDetail.diffWords.length > 30 && (
                    <div className="p-2 text-center text-slate-400 text-[10px]">
                      + {selectedPairForDetail.diffWords.length - 30} kosakata berbeda lainnya
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. BOTTOM HORIZONTAL STRIP: 200 SWADESH QUICK JUMP & ANALYSIS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Jelajahi Berkas Isoglos 200 Kosakata Dasar:</span>
            </span>
            <span className="text-xs text-slate-500">
              (Klik kata di bawah untuk langsung memperbarui peta isoglos)
            </span>
          </div>
          
          <span className="text-[11px] font-bold text-blue-600 dark:text-sky-400">
            {filteredGlossOptions.length} kata siap dianalisis
          </span>
        </div>

        {/* Scrollable buttons for Swadesh glosses */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {filteredGlossOptions.slice(0, 50).map(g => (
            <button
              key={g.id}
              type="button"
              onClick={() => {
                setSelectedGlossId(g.id);
                if (mapMode !== 'kata-terpilih') setMapMode('kata-terpilih');
              }}
              className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                selectedGlossId === g.id && mapMode === 'kata-terpilih'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <span className="font-mono text-[10px] opacity-75">#{g.nomorGlos}</span>
              <span>{g.glosIndonesia}</span>
              <span className={`w-2 h-2 rounded-full ${g.statusKesamaan === 'homogen' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
