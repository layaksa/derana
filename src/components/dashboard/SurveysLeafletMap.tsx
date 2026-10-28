import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../utils/leafletPatch';
import { Delaunay } from 'd3';
import { 
  MapPin, 
  Layers, 
  Navigation, 
  Maximize2, 
  Minimize2, 
  Crosshair, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  RotateCcw, 
  Copy, 
  Check, 
  Sparkles, 
  Compass, 
  Activity, 
  BookA, 
  GitCompare, 
  Eye, 
  ShieldCheck, 
  Globe2, 
  Volume2, 
  Plus,
  Sliders,
  Share2,
  ChevronRight,
  ExternalLink,
  Map,
  Users,
  UserCheck,
  Award,
  Flame,
  SlidersHorizontal,
  Split,
  TableProperties,
  X,
  Download,
  FileText,
  MapPinned
} from 'lucide-react';
import { SurveyRecord, KosakataItem, KosakataBudayaBidang } from '../../types/linguistic';
import { 
  buildKecamatanProfiles, 
  computeInterKecamatanComparisons, 
  KecamatanProfile, 
  KecamatanComparisonPair 
} from '../../utils/kecamatanDialectComparison';
import { KecamatanTransitionDrawer } from './KecamatanTransitionDrawer';
import { GLOTTOLOG_LANGUAGES, GlottologLanguage } from '../../data/glottologLanguages';

export interface SurveysLeafletMapProps {
  surveys: SurveyRecord[];
  activeSurveyId: string | null;
  onSelectSurvey: (id: string) => void;
  onSwitchToEditor: () => void;
  onSwitchToComparison?: () => void;
  onNavigateToSection?: (surveyId: string, sectionIndex: number) => void;
  onNavigateToDialekPeta?: () => void;
  onNavigateToKosakata?: () => void;
  onNavigateToAtlasGlottolog?: () => void;
  onCreateNew?: (type: 'empty' | 'sample') => void;
}

export interface CustomObservationPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  bahasa: string;
  dialek?: string;
  kecamatan?: string;
  kabupaten?: string;
  provinsi?: string;
  informantName?: string;
  informantAge?: number;
  notes?: string;
  createdAt: string;
}

interface ParsedSurveyPoint {
  survey?: SurveyRecord;
  id: string;
  title: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  bahasa: string;
  lat: number;
  lng: number;
  isFallbackCoord: boolean;
  isCustomManualPoint?: boolean;
  progress: number;
  isVerified: boolean;
  verificationStatus: 'verified' | 'unverified';
  informantCount: number;
  informantAges: number[];
  averageInformantAge: number | null;
  ageCategories: {
    under25: boolean;
    adult25to50: boolean;
    seniorAbove50: boolean;
  };
  primaryInformantSummary: string;
  isActive: boolean;
  swadeshCount: number;
  budayaCount: number;
  audioCount: number;
  updatedAt: string;
  surveyor: string;
}

// Known coordinates reference for popular survey observation points
const KNOWN_GEO_PRESETS: Record<string, [number, number]> = {
  'cikaso': [-7.3820, 107.0340],
  'rancabuaya': [-7.5020, 107.5450],
  'pangandaran': [-7.6980, 108.6570],
  'purbahayu': [-7.6534, 108.5721],
  'garut': [-7.2278, 107.9087],
  'sukabumi': [-6.9277, 106.9299],
  'bandung': [-6.9175, 107.6191],
  'tasikmalaya': [-7.3274, 108.2207],
  'ciamis': [-7.3256, 108.3533],
  'kuningan': [-6.9765, 108.4831],
  'cirebon': [-6.7320, 108.5523],
  'majalengka': [-6.8361, 108.2275],
  'sumedang': [-6.8584, 107.9266],
  'subang': [-6.5716, 107.7587],
  'purwakarta': [-6.5569, 107.4433],
  'karawang': [-6.3073, 107.2931],
  'bekasi': [-6.2383, 106.9756],
  'bogor': [-6.5971, 106.8060],
  'cianjur': [-6.8222, 107.1394],
  'lebak': [-6.5398, 106.2520],
  'pandeglang': [-6.3084, 106.1064],
  'serang': [-6.1200, 106.1503]
};

function parseCoordinate(val: unknown): number | null {
  if (typeof val === 'number' && !isNaN(val) && val !== 0) return val;
  if (typeof val === 'string' && val.trim() !== '') {
    const num = parseFloat(val.replace(',', '.'));
    if (!isNaN(num) && num !== 0) return num;
  }
  return null;
}

// Great circle distance calculation in kilometers (Haversine formula)
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper to generate natural buffer polygon for language reach
function createBufferPolygon(lat: number, lon: number, radiusKm: number = 25, numPoints: number = 20): [number, number][] {
  const coords: [number, number][] = [];
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;
  const dRad = radiusKm / 6371;

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
}

// Language color scheme mapping
const LANGUAGE_COLOR_MAP: Record<string, { hex: string; bg: string; text: string; border: string }> = {
  'sunda': { hex: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-500' },
  'bahasa sunda': { hex: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-500' },
  'jawa': { hex: '#8b5cf6', bg: 'bg-violet-500', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-500' },
  'bahasa jawa': { hex: '#8b5cf6', bg: 'bg-violet-500', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-500' },
  'melayu betawi': { hex: '#f97316', bg: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-500' },
  'betawi': { hex: '#f97316', bg: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-500' },
  'cirebon': { hex: '#06b6d4', bg: 'bg-cyan-500', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-500' },
  'jawa cirebon': { hex: '#06b6d4', bg: 'bg-cyan-500', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-500' },
  'melayu': { hex: '#eab308', bg: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-500' },
  'madura': { hex: '#ec4899', bg: 'bg-pink-500', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-500' },
  'baduy': { hex: '#14b8a6', bg: 'bg-teal-500', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-500' },
  'banten': { hex: '#6366f1', bg: 'bg-indigo-500', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-500' }
};

const PALETTE_FALLBACKS = [
  '#10b981', '#f97316', '#8b5cf6', '#06b6d4', '#eab308', '#ec4896', '#3b82f6', '#14b8a6', '#f43f5e', '#a855f7'
];

function getLanguageColor(lang: string): { hex: string; bg: string; text: string; border: string } {
  const key = (lang || '').toLowerCase().trim();
  if (LANGUAGE_COLOR_MAP[key]) return LANGUAGE_COLOR_MAP[key];

  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTE_FALLBACKS.length;
  const hex = PALETTE_FALLBACKS[index];
  return {
    hex,
    bg: 'bg-blue-500',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-500'
  };
}

export const SurveysLeafletMap: React.FC<SurveysLeafletMapProps> = ({
  surveys,
  activeSurveyId,
  onSelectSurvey,
  onSwitchToEditor,
  onSwitchToComparison,
  onNavigateToSection,
  onNavigateToDialekPeta,
  onNavigateToKosakata,
  onNavigateToAtlasGlottolog,
  onCreateNew
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);

  // Map layer groups
  const observationPointsLayerRef = useRef<L.LayerGroup | null>(null);
  const territoryPolygonsLayerRef = useRef<L.LayerGroup | null>(null);
  const glottologLayerRef = useRef<L.LayerGroup | null>(null);
  const isoglossLinesLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);
  const kecamatanLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapReady, setMapReady] = useState(false);

  // Map view settings
  const [selectedBaseMap, setSelectedBaseMap] = useState<'carto' | 'osm' | 'dark' | 'satellite'>('carto');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(activeSurveyId);
  const [copiedCoord, setCopiedCoord] = useState<string | null>(null);
  const [rosterTab, setRosterTab] = useState<'desa' | 'kecamatan_transisi'>('desa');

  // Language Mapping Layer Toggles
  const [showObservationLayer, setShowObservationLayer] = useState(true);
  const [showGlottologLayer, setShowGlottologLayer] = useState(false);
  const [showTerritoryPolygons, setShowTerritoryPolygons] = useState(true);
  const [showIsoglossLines, setShowIsoglossLines] = useState(true);
  const [showHeatmapOverlay, setShowHeatmapOverlay] = useState(false);
  const [showKecamatanComparison, setShowKecamatanComparison] = useState(false);
  const [showLayersPanel, setShowLayersPanel] = useState(false);

  // Layer customization parameters
  const [polygonOpacity, setPolygonOpacity] = useState(0.28);
  const [heatmapRadiusKm, setHeatmapRadiusKm] = useState(25);
  const [heatmapLanguage, setHeatmapLanguage] = useState<string>('all');

  // Input Coordinate Modal State (Memasukkan Titik Pengamatan Berdasarkan Koordinat Geografis)
  const [showAddPointModal, setShowAddPointModal] = useState(false);
  const [isPickOnMapActive, setIsPickOnMapActive] = useState(false);
  const [inputLat, setInputLat] = useState('');
  const [inputLng, setInputLng] = useState('');
  const [inputName, setInputName] = useState('');
  const [inputBahasa, setInputBahasa] = useState('Bahasa Sunda');
  const [inputDialek, setInputDialek] = useState('');
  const [inputKecamatan, setInputKecamatan] = useState('');
  const [inputKabupaten, setInputKabupaten] = useState('');
  const [inputProvinsi, setInputProvinsi] = useState('Jawa Barat');
  const [inputNotes, setInputNotes] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  // Custom observation points added by user
  const [customPoints, setCustomPoints] = useState<CustomObservationPoint[]>(() => {
    try {
      const saved = localStorage.getItem('custom_observation_points_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save custom points to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('custom_observation_points_v1', JSON.stringify(customPoints));
    } catch {
      // safe fallback
    }
  }, [customPoints]);

  // Quick navigation filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress' | 'verified'>('all');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [ageFilter, setAgeFilter] = useState<'all' | 'under25' | '25to50' | 'above50'>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');

  // Inter-Kecamatan Dialect Comparison & Language Transition Zone state
  const [transitionFilter, setTransitionFilter] = useState<'all' | 'transition_only' | 'language_boundary'>('all');
  const [selectedComparisonPair, setSelectedComparisonPair] = useState<KecamatanComparisonPair | null>(null);

  // Process all survey points with robust coordinate resolution
  const surveyPoints = useMemo<ParsedSurveyPoint[]>(() => {
    // 1. Existing Survey Points
    const parsedSurveys: ParsedSurveyPoint[] = surveys.map((s, idx) => {
      const sg = s.data?.situasiGeografis;
      const tp = s.data?.titikPengamatan;

      let lat = parseCoordinate(sg?.koordinatLintang) ?? parseCoordinate(tp?.koordinatLintang);
      let lng = parseCoordinate(sg?.koordinatBujur) ?? parseCoordinate(tp?.koordinatBujur);
      let isFallback = false;

      // Check known preset if coordinates are missing
      if (lat === null || lng === null) {
        const desaKey = (s.desa || tp?.namaDesa || '').toLowerCase().trim();
        const kabKey = (s.kabupatenKota || tp?.kabupatenKota || '').toLowerCase().trim();

        if (KNOWN_GEO_PRESETS[desaKey]) {
          [lat, lng] = KNOWN_GEO_PRESETS[desaKey];
          isFallback = false;
        } else if (KNOWN_GEO_PRESETS[kabKey]) {
          const [baseLat, baseLng] = KNOWN_GEO_PRESETS[kabKey];
          lat = baseLat + (idx * 0.02 - 0.04);
          lng = baseLng + (idx * 0.02 - 0.04);
          isFallback = true;
        } else {
          lat = -7.25 + (idx * 0.07);
          lng = 107.20 + (idx * 0.08);
          isFallback = true;
        }
      }

      const swadeshList = s.data?.kosakataLengkap?.swadeshList || [];
      const swadeshCount = swadeshList.filter((w: KosakataItem) => Boolean(w.bentukLokal && w.bentukLokal.trim() !== '')).length;

      const budayaBidang = s.data?.kosakataLengkap?.kosakataBudaya || [];
      let budayaCount = 0;
      let audioCount = 0;

      swadeshList.forEach((w: KosakataItem) => {
        if (w.audioUrl) audioCount++;
      });

      budayaBidang.forEach((b: KosakataBudayaBidang) => {
        if (Array.isArray(b.daftarKata)) {
          b.daftarKata.forEach((w: KosakataItem) => {
            if (w.bentukLokal && w.bentukLokal.trim() !== '') budayaCount++;
            if (w.audioUrl) audioCount++;
          });
        }
      });

      // Informant stats
      const narasumber = s.data?.narasumberList || [];
      const informantAges: number[] = narasumber
        .map(inf => parseInt(String(inf.usia), 10))
        .filter(age => !isNaN(age) && age > 0);

      const primarySummary = narasumber.length > 0 && narasumber[0]?.nama
        ? `${narasumber[0].nama} (${narasumber[0].usia || '?'} th)`
        : 'Informan belum dicatat';

      const avgAge = informantAges.length > 0
        ? Math.round(informantAges.reduce((a, b) => a + b, 0) / informantAges.length)
        : null;

      const hasUnder25 = informantAges.some(a => a < 25);
      const has25to50 = informantAges.some(a => a >= 25 && a <= 50);
      const hasAbove50 = informantAges.some(a => a > 50);

      const isVerified = Boolean(s.isVerified);

      return {
        survey: s,
        id: s.id,
        title: s.desa || tp?.namaDesa || s.title || `Titik Survei ${idx + 1}`,
        desa: s.desa || tp?.namaDesa || 'Desa Belum Terdaftar',
        kecamatan: s.kecamatan || tp?.kecamatan || 'Kecamatan Belum Terdaftar',
        kabupaten: s.kabupatenKota || tp?.kabupatenKota || 'Kabupaten Belum Terdaftar',
        provinsi: s.provinsi || tp?.provinsi || 'Jawa Barat',
        bahasa: s.bahasa || tp?.bahasaDigunakan || 'Sunda',
        lat,
        lng,
        isFallbackCoord: isFallback,
        progress: s.progress || 0,
        isVerified,
        verificationStatus: isVerified ? 'verified' : 'unverified',
        informantCount: informantAges.length || 1,
        informantAges,
        averageInformantAge: avgAge,
        ageCategories: {
          under25: hasUnder25,
          adult25to50: has25to50,
          seniorAbove50: hasAbove50
        },
        primaryInformantSummary: primarySummary,
        isActive: s.id === activeSurveyId,
        swadeshCount,
        budayaCount,
        audioCount,
        updatedAt: s.updatedAt || new Date().toISOString(),
        surveyor: s.createdByName || 'Peneliti Lapangan'
      };
    });

    // 2. Custom User-Entered Observation Points
    const parsedCustom: ParsedSurveyPoint[] = customPoints.map(cp => ({
      id: cp.id,
      title: cp.name,
      desa: cp.name,
      kecamatan: cp.kecamatan || 'Kecamatan',
      kabupaten: cp.kabupaten || 'Kabupaten',
      provinsi: cp.provinsi || 'Jawa Barat',
      bahasa: cp.bahasa || 'Bahasa Sunda',
      lat: cp.lat,
      lng: cp.lng,
      isFallbackCoord: false,
      isCustomManualPoint: true,
      progress: 100,
      isVerified: true,
      verificationStatus: 'verified',
      informantCount: cp.informantName ? 1 : 0,
      informantAges: cp.informantAge ? [cp.informantAge] : [],
      averageInformantAge: cp.informantAge || null,
      ageCategories: {
        under25: Boolean(cp.informantAge && cp.informantAge < 25),
        adult25to50: Boolean(cp.informantAge && cp.informantAge >= 25 && cp.informantAge <= 50),
        seniorAbove50: Boolean(cp.informantAge && cp.informantAge > 50)
      },
      primaryInformantSummary: cp.informantName ? `${cp.informantName} (${cp.informantAge || '-'} th)` : 'Input Koordinat Manual',
      isActive: cp.id === activeSurveyId,
      swadeshCount: 0,
      budayaCount: 0,
      audioCount: 0,
      updatedAt: cp.createdAt,
      surveyor: 'Pengamatan Lapangan Baru'
    }));

    return [...parsedSurveys, ...parsedCustom];
  }, [surveys, customPoints, activeSurveyId]);

  // Compute Kecamatan Profiles & Transition Pairs
  const kecamatanData = useMemo(() => {
    const validSurveys = surveyPoints.map(p => p.survey).filter(Boolean) as SurveyRecord[];
    const profiles = buildKecamatanProfiles(validSurveys);
    const comparisons = computeInterKecamatanComparisons(profiles);
    return { profiles, comparisons };
  }, [surveyPoints]);

  // Filtered Survey Points
  const filteredPoints = useMemo(() => {
    return surveyPoints.filter(p => {
      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDesa = p.desa.toLowerCase().includes(q);
        const matchesKec = p.kecamatan.toLowerCase().includes(q);
        const matchesKab = p.kabupaten.toLowerCase().includes(q);
        const matchesBahasa = p.bahasa.toLowerCase().includes(q);
        if (!matchesDesa && !matchesKec && !matchesKab && !matchesBahasa) return false;
      }

      // Verification Filter
      if (verificationFilter === 'verified' && !p.isVerified) return false;
      if (verificationFilter === 'unverified' && p.isVerified) return false;

      // Status Filter
      if (statusFilter === 'completed' && p.progress < 100) return false;
      if (statusFilter === 'in_progress' && (p.progress >= 100 || p.progress === 0)) return false;
      if (statusFilter === 'verified' && !p.isVerified) return false;

      // Age Filter
      if (ageFilter === 'under25' && !p.ageCategories.under25) return false;
      if (ageFilter === '25to50' && !p.ageCategories.adult25to50) return false;
      if (ageFilter === 'above50' && !p.ageCategories.seniorAbove50) return false;

      // Language Filter
      if (languageFilter !== 'all') {
        const pLang = p.bahasa.toLowerCase();
        const fLang = languageFilter.toLowerCase();
        if (!pLang.includes(fLang) && !fLang.includes(pLang)) return false;
      }

      return true;
    });
  }, [surveyPoints, searchQuery, verificationFilter, statusFilter, ageFilter, languageFilter]);

  // Unique languages for filter chips
  const availableLanguages = useMemo(() => {
    const set = new Set<string>();
    surveyPoints.forEach(p => {
      if (p.bahasa) set.add(p.bahasa.trim());
    });
    return Array.from(set).sort();
  }, [surveyPoints]);

  // Currently selected point details
  const selectedPoint = useMemo(() => {
    return surveyPoints.find(p => p.id === selectedPointId) || surveyPoints[0] || null;
  }, [surveyPoints, selectedPointId]);

  // Tile URL resolver
  const getTileUrl = (type: 'carto' | 'osm' | 'dark' | 'satellite') => {
  switch (type) {
  case 'dark':
  return '/api/carto/tiles/dark_matter/{z}/{x}/{y}.png';
  case 'satellite':
  case 'osm':
  case 'carto':
  default:
  return '/api/carto/tiles/voyager/{z}/{x}/{y}.png';
  }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [-7.0909, 107.6689],
      zoom: 8,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    const tileLayer = L.tileLayer(getTileUrl(selectedBaseMap), {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19
    }).addTo(map);
    currentTileLayerRef.current = tileLayer;

    // Stacking order: Polygons -> Lines -> Heatmap -> Glottolog -> Observation Markers
    territoryPolygonsLayerRef.current = L.layerGroup().addTo(map);
    isoglossLinesLayerRef.current = L.layerGroup().addTo(map);
    heatmapLayerRef.current = L.layerGroup().addTo(map);
    kecamatanLayerRef.current = L.layerGroup().addTo(map);
    glottologLayerRef.current = L.layerGroup().addTo(map);
    observationPointsLayerRef.current = L.layerGroup().addTo(map);

    // Map Click Listener (Click to Capture Coordinates)
    map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = parseFloat(e.latlng.lat.toFixed(5));
      const lng = parseFloat(e.latlng.lng.toFixed(5));
      setInputLat(lat.toString());
      setInputLng(lng.toString());

      // If in pick mode, open input modal
      setShowAddPointModal(true);
      setIsPickOnMapActive(false);
    });

    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Basemap Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !currentTileLayerRef.current) return;
    currentTileLayerRef.current.setUrl(getTileUrl(selectedBaseMap));
  }, [selectedBaseMap]);

  // Switch cursor class when pick on map is active
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (isPickOnMapActive) {
      mapContainerRef.current.style.cursor = 'crosshair';
    } else {
      mapContainerRef.current.style.cursor = '';
    }
  }, [isPickOnMapActive]);

  // 1. RENDER OBSERVATION POINTS (Titik Pengamatan Berdasarkan Koordinat Geografis)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const obsLayer = observationPointsLayerRef.current;
    if (!map || !obsLayer) return;

    obsLayer.clearLayers();
    if (!showObservationLayer) return;

    filteredPoints.forEach(pt => {
      const isSelected = pt.id === selectedPointId;
      const langColor = getLanguageColor(pt.bahasa);

      const markerHtml = `
        <div class="relative flex items-center justify-center transition-transform hover:scale-125 cursor-pointer">
          ${isSelected ? '<div class="absolute -inset-2.5 rounded-full bg-blue-500/40 animate-ping"></div>' : ''}
          ${pt.isCustomManualPoint ? '<div class="absolute -inset-1 rounded-full bg-amber-400/50 animate-pulse"></div>' : ''}
          <div 
            class="relative w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-lg border-2 ${isSelected ? 'ring-4 ring-amber-400 scale-110' : ''}" 
            style="background-color: ${langColor.hex}; border-color: #ffffff;"
          >
            ${pt.isCustomManualPoint ? '📍' : pt.desa.slice(0, 2).toUpperCase()}
          </div>
          ${pt.isVerified ? '<span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">✓</span>' : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-observation-marker',
        html: markerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([pt.lat, pt.lng], { icon: customIcon });

      marker.on('click', () => {
        setSelectedPointId(pt.id);
        if (pt.survey) onSelectSurvey(pt.id);
        map.setView([pt.lat, pt.lng], Math.max(map.getZoom(), 10), { animate: true });
      });

      const popupContent = `
        <div class="p-2.5 text-xs font-sans space-y-1.5 min-w-[220px]">
          <div class="flex items-center justify-between border-b pb-1.5">
            <span class="font-bold text-sm text-slate-900">${pt.desa}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${pt.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
              ${pt.isVerified ? 'Tervalidasi' : 'Belum Valid'}
            </span>
          </div>
          <div class="text-[11px] text-slate-600">
            <span class="font-semibold">Bahasa:</span> ${pt.bahasa}
          </div>
          <div class="text-[11px] text-slate-600">
            <span class="font-semibold">Lokasi:</span> Kec. ${pt.kecamatan}, ${pt.kabupaten}
          </div>
          <div class="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-1 rounded">
            Koordinat: ${pt.lat.toFixed(5)}°, ${pt.lng.toFixed(5)}°
          </div>
          <div class="text-[10px] text-slate-500">
            Surveyor: ${pt.surveyor}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.bindTooltip(
        `<div class="p-1 font-sans text-xs"><strong>${pt.desa}</strong> (${pt.bahasa})<br/><span class="font-mono text-[10px]">${pt.lat.toFixed(4)}°, ${pt.lng.toFixed(4)}°</span></div>`,
        { sticky: true }
      );

      marker.addTo(obsLayer);
    });
  }, [mapReady, filteredPoints, showObservationLayer, selectedPointId]);

  // 2. RENDER TERRITORY POLYGONS (Poligon Wilayah Tutur Berdasarkan Koordinat Titik)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const polyLayer = territoryPolygonsLayerRef.current;
    if (!map || !polyLayer) return;

    polyLayer.clearLayers();
    if (!showTerritoryPolygons || filteredPoints.length === 0) return;

    // Use Delaunay & Voronoi for territorial speech partitioning
    if (filteredPoints.length >= 3) {
      try {
        const adjustedPoints = filteredPoints.map((p, idx) => ({
          ...p,
          adjLng: p.lng + ((idx % 5) - 2) * 0.0003,
          adjLat: p.lat + (((idx * 2) % 5) - 2) * 0.0003
        }));

        const minLng = Math.min(...filteredPoints.map(p => p.lng)) - 1.5;
        const maxLng = Math.max(...filteredPoints.map(p => p.lng)) + 1.5;
        const minLat = Math.min(...filteredPoints.map(p => p.lat)) - 1.5;
        const maxLat = Math.max(...filteredPoints.map(p => p.lat)) + 1.5;

        const delaunay = Delaunay.from(adjustedPoints, p => p.adjLng, p => p.adjLat);
        const voronoi = delaunay.voronoi([minLng, minLat, maxLng, maxLat]);

        filteredPoints.forEach((pt, idx) => {
          const rawCell = voronoi.cellPolygon(idx);
          const langColor = getLanguageColor(pt.bahasa);
          const isSelected = pt.id === selectedPointId;

          let polyCoords: [number, number][] = [];
          if (rawCell && rawCell.length > 2) {
            polyCoords = rawCell.map(([lng, lat]) => [lat, lng]);
          } else {
            polyCoords = createBufferPolygon(pt.lat, pt.lng, 25);
          }

          const polygon = L.polygon(polyCoords, {
            color: isSelected ? '#f59e0b' : langColor.hex,
            weight: isSelected ? 3 : 1.2,
            fillColor: isSelected ? '#f59e0b' : langColor.hex,
            fillOpacity: isSelected ? Math.min(polygonOpacity + 0.25, 0.75) : polygonOpacity,
            dashArray: '3, 4'
          });

          polygon.on('click', () => {
            setSelectedPointId(pt.id);
            if (pt.survey) onSelectSurvey(pt.id);
          });

          polygon.bindTooltip(
            `<div class="p-1 font-sans text-xs">
              <strong style="color: ${langColor.hex}">${pt.desa}</strong><br/>
              Wilayah Tutur: ${pt.bahasa}<br/>
              <span class="font-mono text-[9px]">Pusat Koordinat: ${pt.lat.toFixed(4)}°, ${pt.lng.toFixed(4)}°</span>
            </div>`,
            { sticky: true }
          );

          polygon.addTo(polyLayer);
        });
      } catch (err) {
        console.warn('Gagal merender Voronoi, beralih ke buffer poligon:', err);
      }
    } else {
      // Fallback for few points: draw organic buffer polygons
      filteredPoints.forEach(pt => {
        const langColor = getLanguageColor(pt.bahasa);
        const isSelected = pt.id === selectedPointId;
        const polyCoords = createBufferPolygon(pt.lat, pt.lng, 25);

        const polygon = L.polygon(polyCoords, {
          color: isSelected ? '#f59e0b' : langColor.hex,
          weight: isSelected ? 3 : 1.5,
          fillColor: isSelected ? '#f59e0b' : langColor.hex,
          fillOpacity: polygonOpacity,
          dashArray: '2, 5'
        });

        polygon.addTo(polyLayer);
      });
    }
  }, [mapReady, filteredPoints, showTerritoryPolygons, polygonOpacity, selectedPointId]);

  // 3. RENDER ISOGLOSS & DIALECT CONNECTION LINES
  useEffect(() => {
    const map = mapInstanceRef.current;
    const linesLayer = isoglossLinesLayerRef.current;
    if (!map || !linesLayer) return;

    linesLayer.clearLayers();
    if (!showIsoglossLines || filteredPoints.length < 2) return;

    for (let i = 0; i < filteredPoints.length; i++) {
      for (let j = i + 1; j < filteredPoints.length; j++) {
        const p1 = filteredPoints[i];
        const p2 = filteredPoints[j];
        const distKm = calculateDistanceKm(p1.lat, p1.lng, p2.lat, p2.lng);

        // Connect neighboring points within 60 km
        if (distKm <= 60) {
          const sameLanguage = p1.bahasa.toLowerCase() === p2.bahasa.toLowerCase();
          const lineColor = sameLanguage ? '#10b981' : '#f97316';

          const line = L.polyline([[p1.lat, p1.lng], [p2.lat, p2.lng]], {
            color: lineColor,
            weight: sameLanguage ? 1.5 : 2.5,
            opacity: 0.65,
            dashArray: sameLanguage ? '4, 6' : undefined
          });

          line.bindTooltip(
            `<div class="p-1 font-sans text-xs">
              <strong>${p1.desa} ↔ ${p2.desa}</strong><br/>
              Jarak Spasial: ~${Math.round(distKm)} km<br/>
              Status: ${sameLanguage ? 'Bahasa Serumpun (' + p1.bahasa + ')' : 'Transisi Bahasa (' + p1.bahasa + ' / ' + p2.bahasa + ')'}
            </div>`,
            { sticky: true }
          );

          line.addTo(linesLayer);
        }
      }
    }
  }, [mapReady, filteredPoints, showIsoglossLines]);

  // 4. RENDER GLOTTOLOG NATIONAL LANGUAGE MAPPING LAYER
  useEffect(() => {
    const map = mapInstanceRef.current;
    const glottoLayer = glottologLayerRef.current;
    if (!map || !glottoLayer) return;

    glottoLayer.clearLayers();
    if (!showGlottologLayer) return;

    // Filter Indonesian glottolog languages in the regional scope
    const nationalLangs = GLOTTOLOG_LANGUAGES.slice(0, 120);

    nationalLangs.forEach(lang => {
      const pinIcon = L.divIcon({
        className: 'custom-glotto-dot',
        html: `
          <div class="w-4 h-4 rounded-full bg-indigo-600 border border-white shadow-xs flex items-center justify-center text-[7px] text-white font-bold opacity-85 hover:scale-125 transition-transform cursor-pointer">
            G
          </div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const marker = L.marker([lang.latitude, lang.longitude], { icon: pinIcon });
      marker.bindTooltip(
        `<div class="p-1 font-sans text-xs">
          <strong>${lang.name}</strong> (${lang.glottocode})<br/>
          Rumpun: ${lang.family}<br/>
          Wilayah: ${lang.province} (${lang.island})
        </div>`,
        { sticky: true }
      );
      marker.addTo(glottoLayer);
    });
  }, [mapReady, showGlottologLayer]);

  // 5. RENDER HEATMAP & DENSITY BUFFER LAYER
  useEffect(() => {
    const map = mapInstanceRef.current;
    const heatLayer = heatmapLayerRef.current;
    if (!map || !heatLayer) return;

    heatLayer.clearLayers();
    if (!showHeatmapOverlay) return;

    const targetPoints = heatmapLanguage === 'all'
      ? filteredPoints
      : filteredPoints.filter(p => p.bahasa.toLowerCase() === heatmapLanguage.toLowerCase());

    targetPoints.forEach(pt => {
      const langColor = getLanguageColor(pt.bahasa);

      const circleOuter = L.circle([pt.lat, pt.lng], {
        radius: heatmapRadiusKm * 1000,
        color: langColor.hex,
        weight: 1,
        dashArray: '3, 6',
        fillColor: langColor.hex,
        fillOpacity: 0.12
      });

      const circleInner = L.circle([pt.lat, pt.lng], {
        radius: (heatmapRadiusKm * 1000) * 0.45,
        color: langColor.hex,
        weight: 1.5,
        fillColor: langColor.hex,
        fillOpacity: 0.28
      });

      circleOuter.addTo(heatLayer);
      circleInner.addTo(heatLayer);
    });
  }, [mapReady, filteredPoints, showHeatmapOverlay, heatmapLanguage, heatmapRadiusKm]);

  // Handle Form Submission for Adding Observation Point via Coordinates
  const handleAddObservationPoint = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);

    const lat = parseFloat(inputLat.replace(',', '.'));
    const lng = parseFloat(inputLng.replace(',', '.'));

    if (isNaN(lat) || isNaN(lng)) {
      setInputError('Format koordinat tidak valid. Masukkan angka desimal (contoh: -7.5020 dan 107.5450)');
      return;
    }

    if (lat < -15 || lat > 15 || lng < 90 || lng > 145) {
      setInputError('Koordinat di luar jangkauan wilayah Indonesia (Lintang: -11 s.d. 6, Bujur: 95 s.d. 141).');
      return;
    }

    if (!inputName.trim()) {
      setInputError('Nama titik pengamatan (desa/lokasi) harus diisi.');
      return;
    }

    const newPoint: CustomObservationPoint = {
      id: `custom_pt_${Date.now()}`,
      name: inputName.trim(),
      lat,
      lng,
      bahasa: inputBahasa.trim() || 'Bahasa Sunda',
      dialek: inputDialek.trim() || undefined,
      kecamatan: inputKecamatan.trim() || undefined,
      kabupaten: inputKabupaten.trim() || undefined,
      provinsi: inputProvinsi.trim() || 'Jawa Barat',
      notes: inputNotes.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    setCustomPoints(prev => [newPoint, ...prev]);
    setSelectedPointId(newPoint.id);

    // Pan map to new coordinate
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 11, { duration: 1.2 });
    }

    // Reset and close
    setInputName('');
    setInputLat('');
    setInputLng('');
    setInputDialek('');
    setInputNotes('');
    setShowAddPointModal(false);
  };

  // Get User Geolocation
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setInputError('Browser tidak mendukung pendeteksian lokasi GPS.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setInputLat(pos.coords.latitude.toFixed(5));
        setInputLng(pos.coords.longitude.toFixed(5));
        setInputError(null);
      },
      (err) => {
        setInputError(`Gagal memperoleh koordinat GPS: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Copy coordinates helper
  const handleCopyCoord = (lat: number, lng: number) => {
    const text = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    navigator.clipboard.writeText(text);
    setCopiedCoord(text);
    setTimeout(() => setCopiedCoord(null), 2000);
  };

  // Reset map view to fit bounds
  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    if (filteredPoints.length > 0) {
      const bounds = L.latLngBounds(filteredPoints.map(p => [p.lat, p.lng]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    } else {
      mapInstanceRef.current.setView([-7.0909, 107.6689], 8);
    }
  };

  // Export Observation Points to GeoJSON format
  const handleExportGeoJSON = () => {
    const geojson = {
      type: 'FeatureCollection',
      features: filteredPoints.map(p => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [p.lng, p.lat]
        },
        properties: {
          id: p.id,
          desa: p.desa,
          kecamatan: p.kecamatan,
          kabupaten: p.kabupaten,
          provinsi: p.provinsi,
          bahasa: p.bahasa,
          isVerified: p.isVerified,
          informantCount: p.informantCount,
          averageInformantAge: p.averageInformantAge,
          swadeshCount: p.swadeshCount
        }
      }))
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `titik-pengamatan-geospasial-${new Date().toISOString().split('T')[0]}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`relative flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300 ${
      isExpanded ? 'fixed inset-0 z-50 rounded-none' : 'w-full'
    }`}>
      
      {/* =========================================================================
          TOP TOOLBAR: TITLE, LAYER TOGGLES, BASMAPS, AND COORDINATE INPUT BUTTON
          ========================================================================= */}
      <div className="p-3.5 sm:px-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-2xs">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Peta Titik Pengamatan & Pemetaan Bahasa (Leaflet)
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {filteredPoints.length} Titik Koordinat
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Visualisasi geospasial titik survei lapangan, input koordinat pengamatan, dan lapisan pemetaan wilayah tutur
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Button: Input Titik Pengamatan Berdasarkan Koordinat */}
          <button
            type="button"
            onClick={() => {
              setShowAddPointModal(true);
              setIsPickOnMapActive(false);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-colors cursor-pointer"
            title="Masukkan titik pengamatan baru berdasarkan koordinat lintang dan bujur"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Input Titik Koordinat</span>
          </button>

          {/* Button: Klik Peta untuk Ambil Koordinat */}
          <button
            type="button"
            onClick={() => setIsPickOnMapActive(prev => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isPickOnMapActive
                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700 ring-2 ring-amber-400'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
            title="Aktifkan mode klik peta untuk menangkap koordinat lokasi"
          >
            <Crosshair className={`w-3.5 h-3.5 ${isPickOnMapActive ? 'text-amber-600 animate-spin' : 'text-slate-500'}`} />
            <span>{isPickOnMapActive ? 'Klik di Peta...' : 'Klik Peta Ambil Koordinat'}</span>
          </button>

          {/* Button: Lapisan Pemetaan Bahasa Toggle */}
          <button
            type="button"
            onClick={() => setShowLayersPanel(prev => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              showLayersPanel
                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
            title="Buka panel lapisan visualisasi pemetaan bahasa"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Lapisan Pemetaan Bahasa</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </button>

          {/* Basemap Selection */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setSelectedBaseMap('carto')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedBaseMap === 'carto' ? 'bg-white dark:bg-slate-900 font-bold text-blue-600 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Terang
            </button>
            <button
              type="button"
              onClick={() => setSelectedBaseMap('dark')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedBaseMap === 'dark' ? 'bg-white dark:bg-slate-900 font-bold text-blue-600 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Gelap
            </button>
            <button
              type="button"
              onClick={() => setSelectedBaseMap('osm')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedBaseMap === 'osm' ? 'bg-white dark:bg-slate-900 font-bold text-blue-600 shadow-2xs' : 'text-slate-500'
              }`}
            >
              OSM
            </button>
            <button
              type="button"
              onClick={() => setSelectedBaseMap('satellite')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedBaseMap === 'satellite' ? 'bg-white dark:bg-slate-900 font-bold text-blue-600 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Satelit
            </button>
          </div>

          {/* Reset View */}
          <button
            type="button"
            onClick={handleResetView}
            className="p-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs"
            title="Pusatkan peta ke seluruh titik pengamatan"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Export GeoJSON */}
          <button
            type="button"
            onClick={handleExportGeoJSON}
            className="p-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs"
            title="Unduh titik pengamatan dalam format GeoJSON"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(prev => !prev)}
            className="p-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs"
            title={isExpanded ? 'Keluar dari layar penuh' : 'Layar penuh'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* =========================================================================
          LANGUAGE MAPPING LAYERS CONTROL PANEL (LAPISAN PEMETAAN BAHASA)
          ========================================================================= */}
      {showLayersPanel && (
        <div className="bg-gradient-to-r from-indigo-50/90 via-blue-50/60 to-slate-50 dark:from-slate-900 dark:via-indigo-950/25 dark:to-slate-900 border-b border-indigo-200/80 dark:border-indigo-900/50 p-3 sm:px-5 text-xs transition-all animate-in fade-in duration-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-indigo-200/60 dark:border-indigo-900/40">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">
                Pengaturan Lapisan Visualisasi Pemetaan Bahasa
              </span>
              <span className="text-[10px] text-slate-500">
                (Aktifkan / nonaktifkan layer geolinguistik interaktif)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowLayersPanel(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Layer 1: Titik Pengamatan Lapangan */}
            <label className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-400 transition-colors">
              <input
                type="checkbox"
                checked={showObservationLayer}
                onChange={(e) => setShowObservationLayer(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <div className="min-w-0">
                <span className="block font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate">
                  Titik Pengamatan
                </span>
                <span className="text-[10px] text-slate-500 block truncate">
                  {filteredPoints.length} titik koordinat
                </span>
              </div>
            </label>

            {/* Layer 2: Poligon Wilayah Tutur */}
            <label className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-400 transition-colors">
              <input
                type="checkbox"
                checked={showTerritoryPolygons}
                onChange={(e) => setShowTerritoryPolygons(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <div className="min-w-0">
                <span className="block font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate">
                  Poligon Wilayah Tutur
                </span>
                <span className="text-[10px] text-slate-500 block truncate">
                  Voronoi & Buffer Spasial
                </span>
              </div>
            </label>

            {/* Layer 3: Garis Isoglos & Kekerabatan */}
            <label className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-400 transition-colors">
              <input
                type="checkbox"
                checked={showIsoglossLines}
                onChange={(e) => setShowIsoglossLines(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <div className="min-w-0">
                <span className="block font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate">
                  Garis Isoglos & Relasi
                </span>
                <span className="text-[10px] text-slate-500 block truncate">
                  Jaringan dialektometri
                </span>
              </div>
            </label>

            {/* Layer 4: Kerapatan & Buffer Jangkauan Tutur */}
            <label className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-400 transition-colors">
              <input
                type="checkbox"
                checked={showHeatmapOverlay}
                onChange={(e) => setShowHeatmapOverlay(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <div className="min-w-0">
                <span className="block font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate">
                  Kerapatan Tutur
                </span>
                <span className="text-[10px] text-slate-500 block truncate">
                  Radius buffer {heatmapRadiusKm} km
                </span>
              </div>
            </label>

            {/* Layer 5: Glottolog Nasional */}
            <label className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-400 transition-colors">
              <input
                type="checkbox"
                checked={showGlottologLayer}
                onChange={(e) => setShowGlottologLayer(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <div className="min-w-0">
                <span className="block font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate">
                  Bahasa Glottolog
                </span>
                <span className="text-[10px] text-slate-500 block truncate">
                  Persebaran nasional
                </span>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* =========================================================================
          MAIN MAP BODY & COLLAPSIBLE NAVIGATION ROSTER
          ========================================================================= */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 flex-1 w-full min-h-[540px]">
        {/* LEFT / CENTER: LEAFLET MAP CANVAS (8 cols on lg) */}
        <div className="relative lg:col-span-8 w-full h-[540px] sm:h-[620px] bg-slate-100 dark:bg-slate-950">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Notification banner when Click-to-Pick mode is active */}
          {isPickOnMapActive && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-2xl bg-amber-500 text-white font-bold text-xs shadow-xl flex items-center gap-2 animate-bounce">
              <Crosshair className="w-4 h-4" />
              <span>Klik pada lokasi di peta untuk mengambil titik koordinat geografis</span>
              <button
                type="button"
                onClick={() => setIsPickOnMapActive(false)}
                className="ml-2 bg-amber-600 hover:bg-amber-700 p-1 rounded-full cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Map Legend Overlay (Bottom Left) */}
          <div className="absolute bottom-4 left-4 z-10 p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-lg text-xs space-y-2 max-w-[240px]">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>Legenda Pemetaan Bahasa</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-xs shrink-0" />
                <span className="text-slate-600 dark:text-slate-300">Bahasa Sunda</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-violet-500 border border-white shadow-xs shrink-0" />
                <span className="text-slate-600 dark:text-slate-300">Bahasa Jawa</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-500 border border-white shadow-xs shrink-0" />
                <span className="text-slate-600 dark:text-slate-300">Bahasa Cirebon</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500 border border-white shadow-xs shrink-0" />
                <span className="text-slate-600 dark:text-slate-300">Melayu Betawi</span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <span className="w-3 h-0.5 bg-emerald-500 shrink-0" />
                <span className="text-slate-500 text-[10px]">Relasi Dialek Serumpun</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-orange-500 shrink-0" />
                <span className="text-slate-500 text-[10px]">Batas Garis Isoglos</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: OBSERVATION POINTS ROSTER & DETAILS PANEL (4 cols on lg) */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex flex-col h-[540px] sm:h-[620px] overflow-hidden">
          
          {/* Panel Header & Search Filter */}
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Daftar Titik Pengamatan</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {filteredPoints.length} Terpilih
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari desa, kecamatan, kabupaten, bahasa..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Language filter chips */}
            {availableLanguages.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setLanguageFilter('all')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    languageFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  Semua
                </button>
                {availableLanguages.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguageFilter(lang)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap cursor-pointer transition-colors ${
                      languageFilter === lang
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Roster Points Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
            {filteredPoints.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 space-y-2">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Tidak ada titik pengamatan yang cocok dengan filter.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setLanguageFilter('all');
                    setVerificationFilter('all');
                  }}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              filteredPoints.map((pt) => {
                const isSelected = pt.id === selectedPointId;
                const langColor = getLanguageColor(pt.bahasa);

                return (
                  <div
                    key={pt.id}
                    onClick={() => {
                      setSelectedPointId(pt.id);
                      if (pt.survey) onSelectSurvey(pt.id);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.flyTo([pt.lat, pt.lng], 11, { duration: 0.8 });
                      }
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer text-xs space-y-1.5 ${
                      isSelected
                        ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: langColor.hex }}
                        />
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          {pt.desa}
                        </span>
                        {pt.isCustomManualPoint && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                            Input Baru
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                        {pt.bahasa}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Kec. {pt.kecamatan}, {pt.kabupaten}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60 text-[10px]">
                      <div className="font-mono text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <span>{pt.lat.toFixed(4)}°, {pt.lng.toFixed(4)}°</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyCoord(pt.lat, pt.lng);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-0.5"
                          title="Salin Koordinat"
                        >
                          <Copy className="w-2.5 h-2.5" />
                        </button>
                      </div>
                      <span className="text-slate-400">
                        {pt.swadeshCount > 0 ? `${pt.swadeshCount} kata Swadesh` : 'Observasi'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Selected Point Summary Card */}
          {selectedPoint && (
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Titik Terpilih
                  </span>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {selectedPoint.desa}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedPoint.survey) {
                      onSwitchToEditor();
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] transition-colors cursor-pointer"
                >
                  Buka Form Survei →
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-slate-400 text-[9px] block">LINTANG:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPoint.lat.toFixed(5)}°</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[9px] block">BUJUR:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPoint.lng.toFixed(5)}°</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODAL: INPUT TITIK PENGAMATAN BERDASARKAN KOORDINAT GEOGRAFIS
          ========================================================================= */}
      {showAddPointModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-600 text-white">
                  <MapPinned className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Input Titik Pengamatan Berdasarkan Koordinat
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Plot titik pengamatan spasial langsung ke peta Leaflet
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPointModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {inputError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
                {inputError}
              </div>
            )}

            <form onSubmit={handleAddObservationPoint} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Titik Pengamatan / Desa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="Contoh: Desa Karangwangi, Dusun Cikaso"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Coordinates: Lintang and Bujur */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Garis Lintang (Latitude) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={inputLat}
                    onChange={(e) => setInputLat(e.target.value)}
                    placeholder="Contoh: -7.5020"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Garis Bujur (Longitude) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={inputLng}
                    onChange={(e) => setInputLng(e.target.value)}
                    placeholder="Contoh: 107.5450"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* GPS Button */}
              <div className="flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Ambil dari Lokasi GPS Perangkat Saya</span>
                </button>
              </div>

              {/* Language & Dialect */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bahasa Utama
                  </label>
                  <input
                    type="text"
                    value={inputBahasa}
                    onChange={(e) => setInputBahasa(e.target.value)}
                    placeholder="Bahasa Sunda / Jawa"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Dialek / Sub-Varian
                  </label>
                  <input
                    type="text"
                    value={inputDialek}
                    onChange={(e) => setInputDialek(e.target.value)}
                    placeholder="Contoh: Dialek Selatan"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Kecamatan & Kabupaten */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kecamatan
                  </label>
                  <input
                    type="text"
                    value={inputKecamatan}
                    onChange={(e) => setInputKecamatan(e.target.value)}
                    placeholder="Kecamatan"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kabupaten / Kota
                  </label>
                  <input
                    type="text"
                    value={inputKabupaten}
                    onChange={(e) => setInputKabupaten(e.target.value)}
                    placeholder="Kabupaten"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Pengamatan Geospasial
                </label>
                <textarea
                  rows={2}
                  value={inputNotes}
                  onChange={(e) => setInputNotes(e.target.value)}
                  placeholder="Keterangan situasi kebahasaan, medan, atau kondisi narasumber..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddPointModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Plot Titik ke Peta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inter-Kecamatan Transition Drawer */}
      {selectedComparisonPair && (
        <KecamatanTransitionDrawer
          pair={selectedComparisonPair}
          onClose={() => setSelectedComparisonPair(null)}
          onSelectSurvey={(surveyId) => {
            setSelectedPointId(surveyId);
            onSelectSurvey(surveyId);
          }}
        />
      )}

    </div>
  );
};
