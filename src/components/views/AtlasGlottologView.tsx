import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { Delaunay } from 'd3';
import 'leaflet/dist/leaflet.css';
import '../../utils/leafletPatch';
import { 
  Globe, 
  MapPin, 
  Layers, 
  Search, 
  Filter, 
  Compass, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Sparkles, 
  BookOpen, 
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Map as MapIcon,
  Table as TableIcon,
  X,
  Palette,
  Eye,
  Activity
} from 'lucide-react';
import { GLOTTOLOG_LANGUAGES, GLOTTOLOG_ISLAND_OPTIONS, GlottologLanguage } from '../../data/glottologLanguages';

interface AtlasGlottologViewProps {
  onNavigateToView?: (viewKey: string) => void;
}

type BasemapStyle = 'light' | 'dark' | 'osm' | 'satellite';
type PolygonDisplayMode = 'voronoi' | 'buffer' | 'curated';
type PolygonColorScheme = 'family' | 'island' | 'glottocode';

type CsvLanguageRow = {
  glottocode: string;
  name: string;
  isocodes: string;
  level: 'family' | 'language' | 'dialect';
  familyId: string;
  parentId: string;
  macroarea: string;
  childLanguageCount: number;
  childDialectCount: number;
  latitude: number;
  longitude: number;
};

const parseCsvLine = (line: string): string[] => {
  const values: string[] = [];
  let value = '';
  let quoted = false;
  for (const char of line) {
    if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { values.push(value.trim()); value = ''; }
    else value += char;
  }
  values.push(value.trim());
  return values;
};

const parseLanguageCsv = (csv: string): CsvLanguageRow[] => {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = parseCsvLine(lines.shift() ?? '');
  return lines.map((line) => {
    const values = parseCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
    return {
      glottocode: row.glottocode || row.id || '',
      name: row.name || '',
      isocodes: row.isocodes || row.iso639P3code || '',
      level: (row.level === 'family' ? 'family' : row.level === 'dialect' ? 'dialect' : 'language') as 'family' | 'language' | 'dialect',
      familyId: String(row.family_id ?? row.parent_id ?? ''),
      parentId: String(row.parent_id ?? ''),
      macroarea: String(row.country_ids ?? row.macroarea ?? ''),
      childLanguageCount: Number(row.child_language_count) || 0,
      childDialectCount: Number(row.child_dialect_count) || 0,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude)
    };
  }).filter((row) => row.glottocode && row.name && (row.level === 'family' || (Number.isFinite(row.latitude) && Number.isFinite(row.longitude))));
};

const getIslandFromCoords = (lat: number, lon: number): 'Sumatera' | 'Jawa & Bali' | 'Kalimantan' | 'Sulawesi' | 'Nusa Tenggara' | 'Maluku' | 'Papua' | 'Lainnya' => {
  if (lon < 106.0 && lat > -6.0) return 'Sumatera';
  if (lon >= 105.0 && lon <= 116.0 && lat <= -5.5 && lat >= -9.0) return 'Jawa & Bali';
  if (lon >= 108.5 && lon <= 119.5 && lat >= -4.5 && lat <= 4.5) return 'Kalimantan';
  if (lon >= 118.5 && lon <= 125.5 && lat >= -6.0 && lat <= 2.5) return 'Sulawesi';
  if (lon >= 115.5 && lon <= 128.0 && lat <= -8.0 && lat >= -11.5) return 'Nusa Tenggara';
  if (lon >= 125.0 && lon <= 132.5 && lat >= -8.5 && lat <= 3.0) return 'Maluku';
  if (lon >= 130.0 && lat >= -9.5 && lat <= 1.0) return 'Papua';
  return 'Lainnya';
};

const directionFromBearing = (bearing: number) => ['utara', 'timur laut', 'timur', 'tenggara', 'selatan', 'barat daya', 'barat', 'barat laut'][Math.round(bearing / 45) % 8];

const distanceAndBearing = (from: GlottologLanguage, to: GlottologLanguage) => {
  const earthRadiusKm = 6371;
  const lat1 = (from.latitude * Math.PI) / 180;
  const lat2 = (to.latitude * Math.PI) / 180;
  const deltaLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const deltaLon = ((to.longitude - from.longitude) * Math.PI) / 180;
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  const distanceKm = earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const bearing = (Math.atan2(Math.sin(deltaLon) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon)) * 180 / Math.PI + 360) % 360;
  return { distanceKm, direction: directionFromBearing(bearing) };
};

// Generates smooth natural circular/elliptical buffer polygon centered around coordinates
export const createBufferPolygon = (lat: number, lon: number, radiusKm: number = 40, numPoints: number = 24): [number, number][] => {
  const coords: [number, number][] = [];
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;
  const safeRadius = Math.max(12, Math.min(radiusKm || 35, 110));
  const dRad = safeRadius / 6371;

  for (let i = 0; i < numPoints; i++) {
    const bearing = (i * 2 * Math.PI) / numPoints;
    const ptLatRad = Math.asin(
      Math.sin(latRad) * Math.cos(dRad) +
      Math.cos(latRad) * Math.sin(dRad) * Math.cos(bearing)
    );
    const ptLonRad = lonRad + Math.atan2(
      Math.sin(bearing) * Math.sin(dRad) * Math.cos(latRad),
      Math.cos(dRad) - Math.sin(latRad) * Math.sin(ptLatRad)
    );
    coords.push([(ptLatRad * 180) / Math.PI, (ptLonRad * 180) / Math.PI]);
  }
  coords.push(coords[0]);
  return coords;
};

// Generates Voronoi tessellation polygons for linguistic territorial partitioning across Indonesia
export const createVoronoiTerritories = (languages: GlottologLanguage[]): Map<string, [number, number][]> => {
  const points = languages.filter((l) => Number.isFinite(l.latitude) && Number.isFinite(l.longitude));
  if (points.length < 3) return new Map();

  // Add deterministic tiny micro-jitter for coincident coordinates to ensure Delaunay constructs cells for all languages
  const adjusted = points.map((p, idx) => ({
    ...p,
    lng: p.longitude + ((idx % 7) - 3) * 0.0003,
    lat: p.latitude + (((idx * 3) % 7) - 3) * 0.0003
  }));

  try {
    const delaunay = Delaunay.from(adjusted, (p) => p.lng, (p) => p.lat);
    const voronoi = delaunay.voronoi([94, -12, 142, 8]);
    const map = new Map<string, [number, number][]>();
    points.forEach((p, idx) => {
      const polygon = voronoi.cellPolygon(idx);
      if (polygon && polygon.length > 2) {
        map.set(p.glottocode, polygon.map(([lng, lat]) => [lat, lng] as [number, number]));
      } else {
        // Fallback to organic buffer
        map.set(p.glottocode, createBufferPolygon(p.latitude, p.longitude, p.estimatedRadiusKm || 35));
      }
    });
    return map;
  } catch (err) {
    console.warn('Voronoi calculation error:', err);
    return new Map();
  }
};

const LANGUAGE_TERRITORY_COLORS = [
  '#2563eb', '#0891b2', '#0d9488', '#16a34a', '#65a30d', '#ca8a04',
  '#ea580c', '#dc2626', '#db2777', '#9333ea', '#7c3aed', '#4f46e5'
];

const territoryColorFor = (glottocode: string) => {
  const hash = Array.from(glottocode || '').reduce((total, character) => total + character.charCodeAt(0), 0);
  return LANGUAGE_TERRITORY_COLORS[hash % LANGUAGE_TERRITORY_COLORS.length];
};

const FAMILY_COLORS: Record<string, string> = {
  'austronesian': '#2563eb',
  'malayo-polynesian': '#0284c7',
  'trans-new guinea': '#10b981',
  'timor-alor-pantar': '#f59e0b',
  'north halmahera': '#8b5cf6',
  'south bougainville': '#ec4899',
  'west papuan': '#06b6d4',
  'tor-kwerba': '#14b8a6',
  'lakes plain': '#84cc16',
  'border': '#f97316',
  'skou': '#d946ef',
  'geelvink bay': '#6366f1',
  'kra-dai': '#ea580c',
  'sino-tibetan': '#dc2626',
  'isolate': '#64748b'
};

const getFamilyColor = (familyStr: string): string => {
  if (!familyStr) return '#64748b';
  const lower = familyStr.toLowerCase();
  for (const [key, color] of Object.entries(FAMILY_COLORS)) {
    if (lower.includes(key)) {
      return color;
    }
  }
  return territoryColorFor(familyStr);
};

const ISLAND_COLORS: Record<string, { stroke: string; fill: string; badge: string; text: string }> = {
  'Sumatera': { stroke: '#059669', fill: '#10b981', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300', text: 'text-emerald-600 dark:text-emerald-400' },
  'Jawa & Bali': { stroke: '#4f46e5', fill: '#6366f1', badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300', text: 'text-indigo-600 dark:text-indigo-400' },
  'Kalimantan': { stroke: '#d97706', fill: '#f59e0b', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300', text: 'text-amber-600 dark:text-amber-400' },
  'Sulawesi': { stroke: '#7c3aed', fill: '#8b5cf6', badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300', text: 'text-purple-600 dark:text-purple-400' },
  'Nusa Tenggara': { stroke: '#e11d48', fill: '#f43f5e', badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300', text: 'text-rose-600 dark:text-rose-400' },
  'Maluku': { stroke: '#0891b2', fill: '#06b6d4', badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300', text: 'text-cyan-600 dark:text-cyan-400' },
  'Papua': { stroke: '#2563eb', fill: '#3b82f6', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300', text: 'text-blue-600 dark:text-blue-400' },
  'Lainnya': { stroke: '#64748b', fill: '#94a3b8', badge: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300', text: 'text-slate-600 dark:text-slate-400' }
};

export const AtlasGlottologView: React.FC<AtlasGlottologViewProps> = ({ onNavigateToView }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const polygonLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const labelLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markerLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const circleLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const legendControlRef = useRef<L.Control | null>(null);

  // Filters & View State
  const [selectedIsland, setSelectedIsland] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<GlottologLanguage | null>(null);
  const [hoveredLanguage, setHoveredLanguage] = useState<GlottologLanguage | null>(null);
  const [basemapStyle, setBasemapStyle] = useState<BasemapStyle>('light');
  
  // Polygon Customization States
  const [showPolygons, setShowPolygons] = useState<boolean>(true);
  const [polygonMode, setPolygonMode] = useState<PolygonDisplayMode>('voronoi');
  const [colorScheme, setColorScheme] = useState<PolygonColorScheme>('family');
  const [polygonOpacity, setPolygonOpacity] = useState<number>(0.38);
  const [polygonBorderWeight, setPolygonBorderWeight] = useState<number>(1.5);
  const [showPolygonLabels, setShowPolygonLabels] = useState<boolean>(false);
  const [showRadiusCircles, setShowRadiusCircles] = useState<boolean>(false);
  const [showMarkers, setShowMarkers] = useState<boolean>(true);
  const [showSettingsPanel, setShowSettingsPanel] = useState<boolean>(false);

  // General App States
  const [isMapReady, setIsMapReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showTable, setShowTable] = useState<boolean>(false);
  const [copiedCoords, setCopiedCoords] = useState<boolean>(false);
  const [csvLanguages, setCsvLanguages] = useState<GlottologLanguage[]>([]);
  const [familyRows, setFamilyRows] = useState<CsvLanguageRow[]>([]);

  // Load Glottolog Datasets from CSV (Languoid & Languages)
  useEffect(() => {
    Promise.all([
      fetch('/data/languages_and_dialects_geo.csv').then((r) => r.text()).catch(() => ''),
      fetch('/data/languoid.csv').then((r) => r.text()).catch(() => '')
    ])
      .then(([languageCsv, familyCsv]) => {
        const hierarchyRows = familyCsv ? parseLanguageCsv(familyCsv) : [];
        const familiesMap = new Map<string, string>();
        hierarchyRows.filter((r) => r.level === 'family').forEach((f) => familiesMap.set(f.glottocode, f.name));

        // Filter Indonesian languages from languoid.csv (country_ids contains 'ID')
        const indonesiaLanguoids = hierarchyRows.filter((row) =>
          String(row.macroarea ?? '')
            .split(/[;,\s]+/)
            .map((c) => c.trim().toUpperCase())
            .includes('ID')
        );

        if (indonesiaLanguoids.length > 0) {
          setFamilyRows(hierarchyRows.filter((row) => row.level === 'family'));
          setCsvLanguages(indonesiaLanguoids.map((row) => {
            const familyName = familiesMap.get(row.familyId) || (row.familyId ? row.familyId : 'Unclassified');
            const island = getIslandFromCoords(row.latitude, row.longitude);
            return {
              glottocode: row.glottocode,
              name: row.name,
              isocode: String(row.isocodes ?? '').split(',')[0] ?? '',
              level: row.level,
              island: island,
              isNational: true,
              isFromCsv: true,
              latitude: row.latitude,
              longitude: row.longitude,
              province: island,
              family: familyName,
              macroarea: 'Papunesia',
              estimatedRadiusKm: 35,
              estimatedAreaKm2: Math.round(Math.PI * 35 * 35),
              boundaryPolygon: createBufferPolygon(row.latitude, row.longitude, 35),
              neighbors: []
            };
          }));
        }
      })
      .catch((error) => console.warn('Gagal memuat data Glottolog CSV:', error));
  }, []);

  // Merge CSV languages with curated GLOTTOLOG_LANGUAGES
  const atlasLanguages = useMemo(() => {
    if (csvLanguages.length === 0) return GLOTTOLOG_LANGUAGES;
    const curatedMap = new Map(GLOTTOLOG_LANGUAGES.map((l) => [l.glottocode, l]));
    const merged: GlottologLanguage[] = [];
    const seen = new Set<string>();

    // Add all curated entries first (rich metadata)
    for (const item of GLOTTOLOG_LANGUAGES) {
      merged.push(item);
      seen.add(item.glottocode);
    }

    // Append any additional Indonesian language from CSV
    for (const csvItem of csvLanguages) {
      if (!seen.has(csvItem.glottocode)) {
        merged.push(csvItem);
        seen.add(csvItem.glottocode);
      }
    }
    return merged;
  }, [csvLanguages]);

  // Compute Voronoi and Buffer Territories across all languages
  const voronoiTerritories = useMemo(() => createVoronoiTerritories(atlasLanguages), [atlasLanguages]);

  // Attach dynamic polygon geometry based on selected PolygonDisplayMode
  const mappedLanguages = useMemo(() => {
    return atlasLanguages.map((lang) => {
      let poly: [number, number][] = [];
      if (polygonMode === 'voronoi') {
        poly = voronoiTerritories.get(lang.glottocode) || lang.boundaryPolygon;
      } else if (polygonMode === 'buffer') {
        poly = createBufferPolygon(lang.latitude, lang.longitude, lang.estimatedRadiusKm || 38);
      } else {
        // 'curated'
        poly = lang.boundaryPolygon && lang.boundaryPolygon.length > 2 
          ? lang.boundaryPolygon 
          : (voronoiTerritories.get(lang.glottocode) || createBufferPolygon(lang.latitude, lang.longitude, 35));
      }
      return {
        ...lang,
        activeDisplayPolygon: poly
      };
    });
  }, [atlasLanguages, polygonMode, voronoiTerritories]);

  // Filtered languages according to current UI selections
  const filteredLanguages = useMemo(() => {
    return mappedLanguages.filter((item) => {
      // Island / Scope Filter
      if (selectedIsland === 'all') {
        if (!item.isNational) return false;
      } else if (selectedIsland === 'csv') {
        if (!item.isFromCsv) return false;
      } else if (selectedIsland === 'global') {
        // all
      } else {
        if (item.island !== selectedIsland) return false;
      }

      // Level Filter
      if (selectedLevel !== 'all' && item.level !== selectedLevel) {
        return false;
      }

      // Search Filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesGlotto = item.glottocode.toLowerCase().includes(q);
        const matchesIso = item.isocode.toLowerCase().includes(q);
        const matchesProv = (item.province || '').toLowerCase().includes(q);
        const matchesFamily = String(item.family ?? '').toLowerCase().includes(q);
        if (!matchesName && !matchesGlotto && !matchesIso && !matchesProv && !matchesFamily) {
          return false;
        }
      }

      return true;
    });
  }, [mappedLanguages, selectedIsland, selectedLevel, searchTerm]);

  // Dynamic color resolution helper
  const getColorForLanguage = (lang: GlottologLanguage) => {
    if (colorScheme === 'family') {
      return getFamilyColor(lang.family);
    }
    if (colorScheme === 'island') {
      return ISLAND_COLORS[lang.island]?.stroke || '#64748b';
    }
    return territoryColorFor(lang.glottocode);
  };

  // Stats calculation
  const totalAreaEstimated = useMemo(() => {
    return filteredLanguages.reduce((sum, item) => sum + (item.estimatedAreaKm2 || 4000), 0);
  }, [filteredLanguages]);

  const totalFamilies = useMemo(() => {
    const families = new Set(
      filteredLanguages
        .map((language) => String(language.family ?? '').trim())
        .filter(Boolean)
        .map((family) => family.split(' ')[0])
    );
    return families.size;
  }, [filteredLanguages]);

  // Map Tile Layer URL
  const getCartoTileUrl = (style: 'dark' | 'light') => (
    style === 'dark'
      ? '/api/carto/tiles/dark_matter/{z}/{x}/{y}.png'
      : '/api/carto/tiles/voyager/{z}/{x}/{y}.png'
  );

  const getTileUrl = (style: BasemapStyle) => {
    switch (style) {
      case 'dark':
        return getCartoTileUrl('dark');
      case 'satellite':
        return '/api/carto/tiles/dark_matter/{z}/{x}/{y}.png';
      case 'osm':
        return '/api/carto/tiles/voyager/{z}/{x}/{y}.png';
      case 'light':
      default:
        return getCartoTileUrl('light');
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [-2.5, 118.0],
      zoom: 5,
      minZoom: 3,
      maxZoom: 18,
      zoomControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    const tileLayer = L.tileLayer(getTileUrl(basemapStyle), {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Layer groups in specific visual stacking order
    polygonLayerGroupRef.current = L.layerGroup().addTo(map);
    circleLayerGroupRef.current = L.layerGroup().addTo(map);
    labelLayerGroupRef.current = L.layerGroup().addTo(map);
    markerLayerGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    setIsMapReady(true);
    const invalidateFrame = requestAnimationFrame(() => {
      if (mapInstanceRef.current === map && (map as any)._loaded) map.invalidateSize();
    });

    return () => {
      cancelAnimationFrame(invalidateFrame);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Basemap Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    tileLayerRef.current.setUrl(getTileUrl(basemapStyle));
  }, [basemapStyle]);


  // Update Polygon Boundaries & Markers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const polyGroup = polygonLayerGroupRef.current;
    const circleGroup = circleLayerGroupRef.current;
    const labelGroup = labelLayerGroupRef.current;
    const markerGroup = markerLayerGroupRef.current;

    if (polyGroup) polyGroup.clearLayers();
    if (circleGroup) circleGroup.clearLayers();
    if (labelGroup) labelGroup.clearLayers();
    if (markerGroup) markerGroup.clearLayers();

    filteredLanguages.forEach((lang) => {
      const activeColor = getColorForLanguage(lang);
      const isSelected = selectedLanguage?.glottocode === lang.glottocode;
      const polyCoords = lang.activeDisplayPolygon || lang.boundaryPolygon;

      // 1. RENDER POLYGON BOUNDARY (Batas Wilayah Poligon Penggunaan Bahasa)
      if (showPolygons && polyGroup && polyCoords && polyCoords.length > 2) {
        const polygon = L.polygon(polyCoords, {
          color: isSelected ? '#f59e0b' : activeColor,
          weight: isSelected ? 3.8 : polygonBorderWeight,
          fillColor: isSelected ? '#f59e0b' : activeColor,
          fillOpacity: isSelected ? Math.min(polygonOpacity + 0.25, 0.85) : polygonOpacity,
          dashArray: polygonMode === 'voronoi' ? undefined : (polygonMode === 'buffer' ? '4, 4' : undefined)
        });

        polygon.on('mouseover', () => {
          setHoveredLanguage(lang);
          polygon.setStyle({
            weight: isSelected ? 4 : polygonBorderWeight + 1.2,
            fillOpacity: Math.min(polygonOpacity + 0.22, 0.9)
          });
        });

        polygon.on('mouseout', () => {
          setHoveredLanguage(null);
          if (!isSelected) {
            polygon.setStyle({
              weight: polygonBorderWeight,
              fillOpacity: polygonOpacity,
              color: activeColor,
              fillColor: activeColor
            });
          }
        });

        polygon.on('click', () => {
          setSelectedLanguage(lang);
          map.fitBounds(polygon.getBounds(), { padding: [60, 60], maxZoom: 10 });
        });

        polygon.bindTooltip(
          `<div class="p-2 text-xs font-sans space-y-1">
            <div class="flex items-center gap-1.5 justify-between">
              <span class="font-bold text-slate-900">${lang.name}</span>
              <span class="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-blue-100 text-blue-800">${lang.glottocode}</span>
            </div>
            <div class="text-[11px] text-slate-600 font-medium">Rumpun: ${lang.family}</div>
            <div class="text-[10px] text-slate-500 font-mono">Pusat: ${lang.latitude.toFixed(4)}°, ${lang.longitude.toFixed(4)}° (${lang.island})</div>
            <div class="text-[10px] text-blue-700 font-semibold bg-blue-50/80 px-1 py-0.5 rounded">
              Batas Poligon: ~${(lang.estimatedAreaKm2 || 4200).toLocaleString('id-ID')} km²
            </div>
          </div>`,
          { sticky: true, className: 'leaflet-custom-tooltip' }
        );

        polygon.addTo(polyGroup);

        // Optional Centroid Text Label on Polygon
        if (showPolygonLabels && labelGroup) {
          const center = polygon.getBounds().getCenter();
          const labelIcon = L.divIcon({
            className: 'custom-polygon-label',
            html: `
              <div class="px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-900 bg-white/80 border border-slate-300 shadow-xs pointer-events-none whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2">
                ${lang.name}
              </div>
            `,
            iconSize: [0, 0]
          });
          L.marker(center, { icon: labelIcon, interactive: false }).addTo(labelGroup);
        }
      }

      // 2. RADIUS BUFFER CIRCLE LAYER
      if (showRadiusCircles && circleGroup) {
        const circle = L.circle([lang.latitude, lang.longitude], {
          radius: (lang.estimatedRadiusKm || 35) * 1000,
          color: activeColor,
          weight: 1,
          dashArray: '2, 6',
          fillColor: activeColor,
          fillOpacity: 0.08
        });
        circle.addTo(circleGroup);
      }

      // 3. CENTER POINT PIN MARKER
      if (showMarkers && markerGroup) {
        const markerIcon = L.divIcon({
          className: 'custom-glotto-marker',
          html: `
            <div class="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] text-white shadow-md transition-transform hover:scale-125 cursor-pointer border-2 ${
              isSelected ? 'ring-4 ring-amber-400 scale-115' : ''
            }" style="background-color: ${activeColor}; border-color: #ffffff;">
              ${lang.name.slice(0, 2).toUpperCase()}
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([lang.latitude, lang.longitude], { icon: markerIcon });

        marker.on('click', () => {
          setSelectedLanguage(lang);
          map.setView([lang.latitude, lang.longitude], 8, { animate: true });
        });

        marker.bindPopup(`
          <div class="p-2 text-xs font-sans space-y-1.5 min-w-[220px]">
            <div class="flex items-center justify-between border-b pb-1">
              <span class="font-bold text-sm text-slate-900">${lang.name}</span>
              <span class="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800">${lang.glottocode}</span>
            </div>
            ${lang.isFromCsv ? '<div class="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Basis Data Glottolog Resmi</div>' : ''}
            <div class="text-[11px] text-slate-600">
              <span class="font-semibold">Wilayah:</span> ${lang.province} (${lang.island})
            </div>
            <div class="text-[11px] text-slate-600">
              <span class="font-semibold">Rumpun:</span> ${lang.family}
            </div>
            <div class="text-[11px] text-slate-600">
              <span class="font-semibold">Koordinat:</span> ${lang.latitude.toFixed(4)}, ${lang.longitude.toFixed(4)}
            </div>
            <div class="text-[11px] text-blue-700 font-semibold bg-blue-50 p-1 rounded">
              Estimasi Poligon Batas: ~${(lang.estimatedAreaKm2 || 4000).toLocaleString('id-ID')} km²
            </div>
          </div>
        `);

        marker.addTo(markerGroup);
      }
    });

  }, [
    isMapReady, 
    filteredLanguages, 
    showPolygons, 
    polygonMode, 
    colorScheme, 
    polygonOpacity, 
    polygonBorderWeight, 
    showPolygonLabels, 
    showRadiusCircles, 
    showMarkers, 
    selectedLanguage
  ]);

  // Keep an interactive legend visible on bottom-right of the map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    legendControlRef.current?.remove();
    legendControlRef.current = null;
    if (!showPolygons) return;

    const languages = filteredLanguages
      .filter((language) => language.level !== 'family')
      .slice(0, 7);
    if (!languages.length) return;

    const legend = new L.Control({ position: 'bottomright' });
    legend.onAdd = () => {
      const container = L.DomUtil.create('div', 'leaflet-control glottolog-legend');
      container.style.cssText = 'background:rgba(255,255,255,.95);border:1px solid rgba(148,163,184,.35);border-radius:12px;padding:10px 14px;box-shadow:0 4px 20px rgba(15,23,42,.15);max-width:230px;backdrop-filter:blur(6px);';
      
      const title = document.createElement('div');
      title.textContent = `Poligon Bahasa (${polygonMode === 'voronoi' ? 'Voronoi' : polygonMode === 'buffer' ? 'Buffer' : 'Terkurasi'})`;
      title.style.cssText = 'font:700 11px/1.2 Inter,system-ui,sans-serif;color:#1e293b;margin-bottom:6px;display:flex;align-items:center;gap:4px;';
      container.appendChild(title);

      languages.forEach((language) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:8px;margin-top:4px;font:500 11px/1.2 Inter,system-ui,sans-serif;color:#475569;cursor:pointer;';
        const swatch = document.createElement('span');
        const color = getColorForLanguage(language);
        swatch.style.cssText = `display:inline-block;width:12px;height:12px;border-radius:3px;background:${color};opacity:${Math.max(0.65, polygonOpacity)};border:1px solid rgba(0,0,0,.15);shrink:0;`;
        const label = document.createElement('span');
        label.textContent = language.name;
        label.style.cssText = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:160px;';
        row.append(swatch, label);
        row.onclick = () => handleSelectLanguage(language);
        container.appendChild(row);
      });

      L.DomEvent.disableClickPropagation(container);
      return container;
    };
    legend.addTo(map);
    legendControlRef.current = legend;

    return () => {
      legend.remove();
      if (legendControlRef.current === legend) legendControlRef.current = null;
    };
  }, [filteredLanguages, isMapReady, showPolygons, polygonMode, colorScheme, polygonOpacity]);

  // Auto-fit map when island or scope filter changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || filteredLanguages.length === 0) return;

    if (selectedIsland === 'all') {
      map.setView([-2.5, 118.0], 5, { animate: true });
    } else {
      const bounds = L.latLngBounds(filteredLanguages.map(l => [l.latitude, l.longitude]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: selectedIsland === 'csv' ? 6 : 8 });
      }
    }
  }, [selectedIsland]);

  // Center on selected language
  const handleSelectLanguage = (lang: GlottologLanguage) => {
    setSelectedLanguage(lang);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lang.latitude, lang.longitude], 8, { animate: true });
    }
  };

  const handleResetMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([-2.5, 118.0], 5, { animate: true });
    }
  };

  const handleCopyCoordinates = (lat: number, lon: number) => {
    navigator.clipboard.writeText(`${lat.toFixed(5)}, ${lon.toFixed(5)}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  // Export Polygons to Standard GeoJSON Format (Compatible with QGIS, ArcGIS, Google Earth)
  const handleExportGeoJSON = () => {
    const geojson = {
      type: 'FeatureCollection',
      features: filteredLanguages.map((l) => {
        const poly = l.activeDisplayPolygon || l.boundaryPolygon;
        return {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [poly.map(([lat, lon]) => [lon, lat])]
          },
          properties: {
            glottocode: l.glottocode,
            name: l.name,
            isocode: l.isocode,
            island: l.island,
            province: l.province,
            family: l.family,
            polygonMode: polygonMode,
            centerLatitude: l.latitude,
            centerLongitude: l.longitude,
            estimatedRadiusKm: l.estimatedRadiusKm,
            estimatedAreaKm2: l.estimatedAreaKm2
          }
        };
      })
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `peta-glottolog-poligon-${polygonMode}-${selectedIsland}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ['glottocode', 'name', 'isocodes', 'level', 'macroarea', 'island', 'province', 'family', 'latitude', 'longitude', 'polygonMode', 'estimatedRadiusKm', 'estimatedAreaKm2'];
    const rows = filteredLanguages.map(l => [
      l.glottocode,
      `"${l.name}"`,
      l.isocode,
      l.level,
      l.macroarea,
      `"${l.island}"`,
      `"${l.province}"`,
      `"${l.family}"`,
      l.latitude,
      l.longitude,
      polygonMode,
      l.estimatedRadiusKm,
      l.estimatedAreaKm2
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `peta-glottolog-katalog-${selectedIsland}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const directionalDistances = useMemo(() => {
    if (!selectedLanguage) return [];
    const nearestByDirection = new Map<string, { language: GlottologLanguage; distanceKm: number }>();
    atlasLanguages.forEach((language) => {
      if (language.glottocode === selectedLanguage.glottocode) return;
      const { direction, distanceKm } = distanceAndBearing(selectedLanguage, language);
      const current = nearestByDirection.get(direction);
      if (!current || distanceKm < current.distanceKm) nearestByDirection.set(direction, { language, distanceKm });
    });
    return ['timur', 'tenggara', 'selatan', 'barat daya', 'barat', 'barat laut', 'utara', 'timur laut']
      .map((direction) => ({ direction, ...nearestByDirection.get(direction) }))
      .filter((item): item is { direction: string; language: GlottologLanguage; distanceKm: number } => Boolean(item.language));
  }, [atlasLanguages, selectedLanguage]);

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      
      {/* =========================================================================
          HERO BANNER
          ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900 p-6 sm:p-8 shadow-xs transition-colors">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-5">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-2xs">
                <Globe className="w-3.5 h-3.5" />
                <span>Peta Glottolog Nasional</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span>Tampilan Poligon Aktif ({polygonMode.toUpperCase()})</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <MapIcon className="w-3.5 h-3.5" />
                <span>Batas Wilayah Tutur Geospasial</span>
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Visualisasi Poligon Peta Glottolog Nasional
            </h1>

            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Visualisasi komprehensif poligon batas wilayah penggunaan bahasa-bahasa Nusantara berdasarkan data geospasial resmi Glottolog. Menampilkan partisi teritorial poligon Voronoi, buffer pengaruh bahasa, dan keterhubungan spasial antar-bahasa.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start flex-wrap">
            <button
              type="button"
              onClick={handleExportGeoJSON}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
              title="Ekspor batas poligon wilayah ke format GeoJSON (QGIS / GIS)"
            >
              <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Unduh Poligon GeoJSON</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
              title="Ekspor data tabel ke berkas CSV"
            >
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>

        {/* Island filter tabs */}
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {GLOTTOLOG_ISLAND_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedIsland(opt.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedIsland === opt.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>{opt.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                selectedIsland === opt.id ? 'bg-white/20 text-white' : 'bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {filteredLanguages.filter(l => opt.id === 'all' ? l.isNational : (opt.id === 'csv' ? l.isFromCsv : l.island === opt.id)).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          KEY STATS ROW (4 Cards)
          ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Bahasa Terdata */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="font-semibold">Poligon Bahasa Aktif</span>
            <Globe className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {filteredLanguages.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Dari {atlasLanguages.length} entri Glottolog nasional
          </div>
        </div>

        {/* Stat 2: Luas Wilayah Teritorial */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="font-semibold">Cakupan Poligon Teritorial</span>
            <MapIcon className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            ~{Math.round(totalAreaEstimated / 1000).toLocaleString('id-ID')} rb km²
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
            Mode Poligon: {polygonMode === 'voronoi' ? 'Voronoi Tessellation' : polygonMode === 'buffer' ? 'Buffer Pengaruh' : 'Batas Terkurasi'}
          </div>
        </div>

        {/* Stat 3: Rumpun Bahasa */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="font-semibold">Rumpun & Subkeluarga</span>
            <BookOpen className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {totalFamilies} Rumpun
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 font-semibold">
            Austronesia, Papuan, Timor-Alor, dll.
          </div>
        </div>

        {/* Stat 4: Presisi Geospasial */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="font-semibold">Format Geometri</span>
            <Compass className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            WGS84 GeoJSON
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Lintang & Bujur Standar Glottolog
          </div>
        </div>
      </div>

      {/* =========================================================================
          POLYGON CONFIGURATION CONTROLS PANEL (Sticky Bar)
          ========================================================================= */}
      <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-slate-900/90 p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <MapIcon className="w-4 h-4 text-blue-600" />
              <span>Mode Tampilan Poligon:</span>
            </span>

            {/* Mode 1: Voronoi */}
            <button
              type="button"
              onClick={() => setPolygonMode('voronoi')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                polygonMode === 'voronoi'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>Poligon Teritori Voronoi (Thiessen)</span>
            </button>

            {/* Mode 2: Buffer Alamiah */}
            <button
              type="button"
              onClick={() => setPolygonMode('buffer')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                polygonMode === 'buffer'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>Buffer Lingkup Tutur Organik</span>
            </button>

            {/* Mode 3: Curated */}
            <button
              type="button"
              onClick={() => setPolygonMode('curated')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                polygonMode === 'curated'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>Batas Poligon Terkurasi</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowSettingsPanel(!showSettingsPanel)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            <span>Kustomisasi Tampilan Poligon</span>
            {showSettingsPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expandable Advanced Polygon Styling Panel */}
        {showSettingsPanel && (
          <div className="pt-3 border-t border-blue-200/60 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-200 text-xs">
            {/* Setting 1: Skema Pewarnaan Poligon */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-blue-500" />
                <span>Pewarnaan Poligon:</span>
              </label>
              <select
                value={colorScheme}
                onChange={(e) => setColorScheme(e.target.value as PolygonColorScheme)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="family">Berdasarkan Rumpun Bahasa</option>
                <option value="island">Berdasarkan Wilayah Pulau</option>
                <option value="glottocode">Palet Unik Glottocode</option>
              </select>
            </div>

            {/* Setting 2: Slider Opasitas Poligon */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Opasitas Poligon:</span>
                </span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                  {Math.round(polygonOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.80"
                step="0.05"
                value={polygonOpacity}
                onChange={(e) => setPolygonOpacity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Setting 3: Ketebalan Garis Batas Poligon */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Ketebalan Garis Batas Poligon:
              </label>
              <div className="flex items-center gap-2">
                {[1, 1.5, 2.5, 3.5].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setPolygonBorderWeight(w)}
                    className={`flex-1 py-1 rounded-lg border font-mono font-semibold transition-all cursor-pointer ${
                      polygonBorderWeight === w
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {w}px
                  </button>
                ))}
              </div>
            </div>

            {/* Setting 4: Overlay & Label Toggles */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Lapisan Tambahan:
              </label>
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPolygonLabels}
                    onChange={(e) => setShowPolygonLabels(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Label Nama Bahasa di Poligon</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          INTERACTIVE MAP & INSPECTION DRAWER CONTAINER
          ========================================================================= */}
      <div className={`relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}>
        
        {/* Map Toolbar Controls */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex flex-wrap items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative min-w-[240px] sm:min-w-[280px] flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama bahasa, glottocode, ISO, pulau, rumpun..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Layer and style controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Level selector */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="bg-transparent text-slate-700 dark:text-slate-300 font-semibold focus:outline-hidden cursor-pointer"
              >
                <option value="all">Semua Level Bahasa</option>
                <option value="language">Bahasa (Language)</option>
                <option value="dialect">Dialek (Dialect)</option>
                <option value="family">Rumpun (Family)</option>
              </select>
            </div>

            {/* Basemap selector */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-400 font-medium">Peta Dasar:</span>
              <select
                value={basemapStyle}
                onChange={(e) => setBasemapStyle(e.target.value as BasemapStyle)}
                className="bg-transparent text-slate-700 dark:text-slate-300 font-semibold focus:outline-hidden cursor-pointer"
              >
                <option value="light">Carto Light</option>
                <option value="dark">Carto Dark</option>
                <option value="osm">OpenStreetMap</option>
                <option value="satellite">Satelit Esri</option>
              </select>
            </div>

            {/* Polygon Layer Toggle Button */}
            <button
              type="button"
              onClick={() => setShowPolygons(!showPolygons)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                showPolygons 
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
              }`}
              title="Tampilkan / Sembunyikan Lapisan Poligon Batas Wilayah"
            >
              <span className={`w-2 h-2 rounded-full ${showPolygons ? 'bg-blue-600' : 'bg-slate-400'}`} />
              <span>Poligon Wilayah</span>
            </button>

            {/* Markers Toggle */}
            <button
              type="button"
              onClick={() => setShowMarkers(!showMarkers)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                showMarkers 
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
              }`}
              title="Tampilkan / Sembunyikan Titik Pin Pusat Koordinat"
            >
              <span className={`w-2 h-2 rounded-full ${showMarkers ? 'bg-blue-600' : 'bg-slate-400'}`} />
              <span>Pin Pusat</span>
            </button>

            {/* Reset Map View */}
            <button
              type="button"
              onClick={handleResetMap}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs"
              title="Kembalikan posisi peta ke seluruh Indonesia"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs"
              title={isFullscreen ? 'Keluar dari layar penuh' : 'Tampilan layar penuh'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Map Body and Side Drawer */}
        <div className="relative flex flex-col lg:flex-row h-[580px] sm:h-[660px] w-full">
          {/* Leaflet Map Canvas */}
          <div ref={mapContainerRef} className="flex-1 w-full h-full z-0" />

          {/* Selected Language Details Drawer */}
          {selectedLanguage && (
            <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-5 overflow-y-auto space-y-4 shadow-xl z-10 transition-all animate-in slide-in-from-right-4 duration-200">
              <div className="flex items-start justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      ISLAND_COLORS[selectedLanguage.island]?.badge || ISLAND_COLORS['Lainnya'].badge
                    }`}>
                      {selectedLanguage.island}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      ISO: {selectedLanguage.isocode || '—'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      Poligon Aktif
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
                    {selectedLanguage.name}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Glottocode: <span className="font-bold text-blue-600 dark:text-blue-400">{selectedLanguage.glottocode}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedLanguage(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Geographic Coordinates Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="font-semibold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span>Pusat Geospasial:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCoordinates(selectedLanguage.latitude, selectedLanguage.longitude)}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCoords ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCoords ? 'Tersalin' : 'Salin Koordinat'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[9px]">LINTANG (LAT):</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedLanguage.latitude.toFixed(5)}°</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[9px]">BUJUR (LON):</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedLanguage.longitude.toFixed(5)}°</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 dark:text-slate-300 pt-1">
                  <span className="text-slate-400">Lokasi / Wilayah:</span> {selectedLanguage.province || selectedLanguage.island}
                </div>
              </div>

              {/* Territorial Polygon Specs */}
              <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 space-y-2.5 text-xs">
                <h4 className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Spesifikasi Poligon Wilayah Tutur</span>
                </h4>

                <div className="space-y-1.5 text-slate-700 dark:text-slate-300 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span>Estimasi Luas Poligon:</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">
                      ~{(selectedLanguage.estimatedAreaKm2 || 4000).toLocaleString('id-ID')} km²
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Radius Pengaruh Tutur:</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">
                      {selectedLanguage.estimatedRadiusKm || 35} km
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Rumpun Kebahasaan:</span>
                    <span className="font-semibold text-slate-900 dark:text-white text-right max-w-[170px] truncate">
                      {selectedLanguage.family}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Mode Poligon:</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400 uppercase font-bold text-[10px]">
                      {polygonMode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Nearest Languages by Compass Direction */}
              {directionalDistances.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Bahasa Terdekat Berdasarkan Arah</span>
                    <span className="text-[10px] text-slate-400">Jarak Spasial</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {directionalDistances.map(({ direction, language, distanceKm }) => (
                      <button 
                        key={direction} 
                        type="button" 
                        onClick={() => handleSelectLanguage(language)} 
                        className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-2 text-left hover:border-blue-400 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 transition-colors"
                      >
                        <span className="min-w-0">
                          <span className="block text-[10px] uppercase tracking-wide text-slate-400">{direction}</span>
                          <span className="block truncate text-xs font-semibold text-slate-700 dark:text-slate-200">{language.name}</span>
                        </span>
                        <span className="ml-2 shrink-0 text-[10px] font-mono text-blue-600 dark:text-blue-300">{Math.round(distanceKm)} km</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Neighboring Languages with boundary proximity */}
              {selectedLanguage.neighbors && selectedLanguage.neighbors.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>Bahasa Tetangga Perbatasan Poligon:</span>
                    <span className="text-[10px] text-slate-400">Jarak</span>
                  </div>

                  <div className="space-y-1.5">
                    {selectedLanguage.neighbors.map((nb) => {
                      const nbObj = atlasLanguages.find(l => l.glottocode === nb.glottocode);
                      return (
                        <button
                          key={nb.glottocode}
                          type="button"
                          onClick={() => nbObj && handleSelectLanguage(nbObj)}
                          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200/70 dark:border-slate-700 text-left transition-colors flex items-center justify-between text-xs cursor-pointer group"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate block">
                              {nb.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {nb.glottocode}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono font-semibold text-slate-500 group-hover:text-blue-600 shrink-0">
                            ~{nb.distanceKm} km →
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* External Link */}
              <div className="pt-2">
                <a
                  href={`https://glottolog.org/resource/languoid/id/${selectedLanguage.glottocode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <span>Buka Glottolog Resmi</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Bottom map status bar */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Menampilkan {filteredLanguages.length} poligon bahasa
            </span>
            <span>•</span>
            <span>Mode: {polygonMode === 'voronoi' ? 'Voronoi Tessellation' : polygonMode === 'buffer' ? 'Buffer Pengaruh' : 'Poligon Terkurasi'}</span>
            <span>•</span>
            <span>Klik poligon pada peta untuk zoom dan inspeksi detail teritorial.</span>
          </div>

          <button
            type="button"
            onClick={() => setShowTable(!showTable)}
            className="inline-flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer self-start sm:self-auto"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>{showTable ? 'Tutup Tabel Bahasa' : 'Buka Tabel Katalog Bahasa'}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TABULAR VIEW OF GLOTTOLOG LANGUAGES (Optional / Expandable)
          ========================================================================= */}
      {showTable && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Katalog Geospasial Poligon Bahasa Glottolog
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Daftar lengkap inventarisasi bahasa Nusantara beserta luas estimasi poligon wilayah tutur
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {filteredLanguages.length} Bahasa
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
            <div className="overflow-x-auto max-h-96 scrollbar-thin">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 tracking-wider sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th className="py-3 px-4">Nama Bahasa</th>
                    <th className="py-3 px-3">Glottocode</th>
                    <th className="py-3 px-3">ISO 639-3</th>
                    <th className="py-3 px-4">Wilayah / Pulau</th>
                    <th className="py-3 px-4">Rumpun Kebahasaan</th>
                    <th className="py-3 px-4 text-center">Koordinat (Lat, Lon)</th>
                    <th className="py-3 px-3 text-right">Luas Poligon</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLanguages.map((lang) => {
                    const isSelected = selectedLanguage?.glottocode === lang.glottocode;

                    return (
                      <tr 
                        key={lang.glottocode}
                        className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                          isSelected ? 'bg-blue-50/70 dark:bg-blue-950/30' : ''
                        }`}
                      >
                        <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span>{lang.name}</span>
                            {lang.isFromCsv && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                CSV
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-blue-600 dark:text-blue-400">
                          {lang.glottocode}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">
                          {lang.isocode || '—'}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {lang.island}
                          </span>
                          <span className="text-[11px] text-slate-400 block truncate max-w-[140px]">
                            {lang.province}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400 max-w-[160px] truncate">
                          {lang.family}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-center text-[11px]">
                          {lang.latitude.toFixed(4)}, {lang.longitude.toFixed(4)}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-right font-semibold text-slate-700 dark:text-slate-300">
                          ~{(lang.estimatedAreaKm2 || 4000).toLocaleString('id-ID')} km²
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleSelectLanguage(lang)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-colors cursor-pointer"
                          >
                            Pusatkan Poligon
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
