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
  MapPinned,
  Columns2,
  Link2,
  Unlink2,
  ArrowLeftRight
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

  // Map layer groups (Map A)
  const observationPointsLayerRef = useRef<L.LayerGroup | null>(null);
  const territoryPolygonsLayerRef = useRef<L.LayerGroup | null>(null);
  const glottologLayerRef = useRef<L.LayerGroup | null>(null);
  const isoglossLinesLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);
  const kecamatanLayerRef = useRef<L.LayerGroup | null>(null);
  const bilateralLineLayerRefA = useRef<L.LayerGroup | null>(null);

  // Split View Map B container and layer groups
  const mapContainerRefB = useRef<HTMLDivElement>(null);
  const mapInstanceRefB = useRef<L.Map | null>(null);
  const currentTileLayerRefB = useRef<L.TileLayer | null>(null);
  const observationPointsLayerRefB = useRef<L.LayerGroup | null>(null);
  const territoryPolygonsLayerRefB = useRef<L.LayerGroup | null>(null);
  const glottologLayerRefB = useRef<L.LayerGroup | null>(null);
  const isoglossLinesLayerRefB = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRefB = useRef<L.LayerGroup | null>(null);
  const bilateralLineLayerRefB = useRef<L.LayerGroup | null>(null);

  // Split View configuration state
  const [isSplitView, setIsSplitView] = useState(false);
  const [splitMode, setSplitMode] = useState<'region' | 'layer'>('region');
  const [isSyncEnabled, setIsSyncEnabled] = useState(true);
  const [splitPointAId, setSplitPointAId] = useState<string | null>(activeSurveyId);
  const [splitPointBId, setSplitPointBId] = useState<string | null>(null);
  const [splitLayerA, setSplitLayerA] = useState<'polygons' | 'observation' | 'isogloss' | 'heatmap' | 'all'>('polygons');
  const [splitLayerB, setSplitLayerB] = useState<'isogloss' | 'polygons' | 'glottolog' | 'heatmap' | 'observation' | 'all'>('isogloss');
  const [selectedBaseMapB, setSelectedBaseMapB] = useState<'carto' | 'osm' | 'dark' | 'satellite'>('satellite');

  const isSyncingRef = useRef(false);
  const isSyncEnabledRef = useRef(isSyncEnabled);
  useEffect(() => {
    isSyncEnabledRef.current = isSyncEnabled;
  }, [isSyncEnabled]);

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

  // Point A for Split View
  const pointA = useMemo(() => {
    if (splitPointAId) {
      const found = surveyPoints.find(p => p.id === splitPointAId);
      if (found) return found;
    }
    return selectedPoint || surveyPoints[0] || null;
  }, [surveyPoints, splitPointAId, selectedPoint]);

  // Point B for Split View
  const pointB = useMemo(() => {
    if (splitPointBId) {
      const found = surveyPoints.find(p => p.id === splitPointBId);
      if (found) return found;
    }
    const other = surveyPoints.find(p => p.id !== pointA?.id);
    return other || surveyPoints[1] || surveyPoints[0] || null;
  }, [surveyPoints, splitPointBId, pointA]);

  // Distance between Point A and Point B (Haversine)
  const bilateralDistanceKm = useMemo(() => {
    if (!pointA || !pointB) return 0;
    return calculateDistanceKm(pointA.lat, pointA.lng, pointB.lat, pointB.lng);
  }, [pointA, pointB]);

  // Swap Point A and Point B
  const handleSwapSplitPoints = () => {
    if (!pointA || !pointB) return;
    const oldA = pointA.id;
    const oldB = pointB.id;
    setSplitPointAId(oldB);
    setSplitPointBId(oldA);
    setSelectedPointId(oldB);
    if (mapInstanceRef.current && pointB) {
      mapInstanceRef.current.flyTo([pointB.lat, pointB.lng], Math.max(mapInstanceRef.current.getZoom(), 10), { duration: 0.6 });
    }
    if (mapInstanceRefB.current && pointA) {
      mapInstanceRefB.current.flyTo([pointA.lat, pointA.lng], Math.max(mapInstanceRefB.current.getZoom(), 10), { duration: 0.6 });
    }
  };

  // Fit bounds to both points on both maps
  const handleFitBothPoints = () => {
    if (!pointA || !pointB) return;
    const bounds = L.latLngBounds([
      [pointA.lat, pointA.lng],
      [pointB.lat, pointB.lng]
    ]);
    mapInstanceRef.current?.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    mapInstanceRefB.current?.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
  };

  const getLayerLabel = (layer: string) => {
    switch (layer) {
      case 'polygons': return 'Poligon Wilayah Tutur';
      case 'observation': return 'Titik Pengamatan';
      case 'isogloss': return 'Jaringan Garis Isoglos';
      case 'heatmap': return 'Buffer Kepadatan Dialek';
      case 'glottolog': return 'Glottolog Nasional';
      case 'all': return 'Semua Lapisan Aktif';
      default: return layer;
    }
  };

  // Tile URL resolver
  const getTileUrl = (type: 'carto' | 'osm' | 'dark' | 'satellite') => {
    switch (type) {
      case 'dark':
        return '/api/carto/tiles/dark_matter/{z}/{x}/{y}.png';
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'osm':
        return 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      case 'carto':
      default:
        return '/api/carto/tiles/voyager/{z}/{x}/{y}.png';
    }
  };

  // Initialize Leaflet Map (Map A)
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

    // Stacking order: Polygons -> Lines -> Heatmap -> Glottolog -> Bilateral Line -> Observation Markers
    territoryPolygonsLayerRef.current = L.layerGroup().addTo(map);
    isoglossLinesLayerRef.current = L.layerGroup().addTo(map);
    heatmapLayerRef.current = L.layerGroup().addTo(map);
    kecamatanLayerRef.current = L.layerGroup().addTo(map);
    glottologLayerRef.current = L.layerGroup().addTo(map);
    bilateralLineLayerRefA.current = L.layerGroup().addTo(map);
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

  // Initialize and manage Map B when Split View is active
  useEffect(() => {
    if (!isSplitView || !mapContainerRefB.current) return;

    if (!mapInstanceRefB.current) {
      const centerA: L.LatLngExpression = mapInstanceRef.current ? mapInstanceRef.current.getCenter() : [-7.0909, 107.6689];
      const zoomA = mapInstanceRef.current ? mapInstanceRef.current.getZoom() : 8;

      const mapB = L.map(mapContainerRefB.current, {
        center: centerA,
        zoom: zoomA,
        minZoom: 4,
        maxZoom: 18,
        zoomControl: false
      });

      L.control.zoom({ position: 'topright' }).addTo(mapB);

      const tileLayerB = L.tileLayer(getTileUrl(selectedBaseMapB), {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19
      }).addTo(mapB);
      currentTileLayerRefB.current = tileLayerB;

      territoryPolygonsLayerRefB.current = L.layerGroup().addTo(mapB);
      isoglossLinesLayerRefB.current = L.layerGroup().addTo(mapB);
      heatmapLayerRefB.current = L.layerGroup().addTo(mapB);
      glottologLayerRefB.current = L.layerGroup().addTo(mapB);
      bilateralLineLayerRefB.current = L.layerGroup().addTo(mapB);
      observationPointsLayerRefB.current = L.layerGroup().addTo(mapB);

      mapInstanceRefB.current = mapB;

      // Pan & Zoom synchronization listeners
      const syncFromA = () => {
        if (!isSyncEnabledRef.current || isSyncingRef.current || !mapInstanceRefB.current || !mapInstanceRef.current) return;
        isSyncingRef.current = true;
        mapInstanceRefB.current.setView(mapInstanceRef.current.getCenter(), mapInstanceRef.current.getZoom(), { animate: false });
        isSyncingRef.current = false;
      };

      const syncFromB = () => {
        if (!isSyncEnabledRef.current || isSyncingRef.current || !mapInstanceRef.current || !mapInstanceRefB.current) return;
        isSyncingRef.current = true;
        mapInstanceRef.current.setView(mapInstanceRefB.current.getCenter(), mapInstanceRefB.current.getZoom(), { animate: false });
        isSyncingRef.current = false;
      };

      mapInstanceRef.current?.on('move', syncFromA);
      mapB.on('move', syncFromB);
    }

    // Invalidate size to guarantee smooth canvas rendering
    const timer1 = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
      mapInstanceRefB.current?.invalidateSize();
    }, 120);

    const timer2 = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
      mapInstanceRefB.current?.invalidateSize();
    }, 320);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isSplitView]);

  // Clean up Map B when leaving Split View
  useEffect(() => {
    if (!isSplitView && mapInstanceRefB.current) {
      mapInstanceRefB.current.remove();
      mapInstanceRefB.current = null;
      currentTileLayerRefB.current = null;
      observationPointsLayerRefB.current = null;
      territoryPolygonsLayerRefB.current = null;
      isoglossLinesLayerRefB.current = null;
      heatmapLayerRefB.current = null;
      glottologLayerRefB.current = null;
      bilateralLineLayerRefB.current = null;
    }
  }, [isSplitView]);

  // Update Basemap Layer for Map B
  useEffect(() => {
    if (!mapInstanceRefB.current || !currentTileLayerRefB.current) return;
    currentTileLayerRefB.current.setUrl(getTileUrl(selectedBaseMapB));
  }, [selectedBaseMapB]);

  // Draw Bilateral Connector Line between Point A and Point B
  useEffect(() => {
    const lineLayerA = bilateralLineLayerRefA.current;
    const lineLayerB = bilateralLineLayerRefB.current;

    if (lineLayerA) lineLayerA.clearLayers();
    if (lineLayerB) lineLayerB.clearLayers();

    if (!isSplitView || splitMode !== 'region' || !pointA || !pointB) return;

    const sameLanguage = pointA.bahasa.toLowerCase() === pointB.bahasa.toLowerCase();

    const drawLine = (targetLayer: L.LayerGroup) => {
      const line = L.polyline(
        [[pointA.lat, pointA.lng], [pointB.lat, pointB.lng]],
        {
          color: sameLanguage ? '#3b82f6' : '#a855f7',
          weight: 3.5,
          opacity: 0.85,
          dashArray: '6, 8'
        }
      );
      line.bindTooltip(
        `<div class="p-1.5 font-sans text-xs">
          <strong>Vektor Jarak: ${pointA.desa} ↔ ${pointB.desa}</strong><br/>
          <span>Jarak Geodesik: ~${bilateralDistanceKm.toFixed(1)} km</span><br/>
          <span class="text-[10px] text-slate-500">${sameLanguage ? 'Bahasa Serumpun' : 'Perbatasan Bahasa'}</span>
        </div>`,
        { sticky: true }
      );
      line.addTo(targetLayer);
    };

    if (lineLayerA) drawLine(lineLayerA);
    if (lineLayerB) drawLine(lineLayerB);
  }, [isSplitView, splitMode, pointA, pointB, bilateralDistanceKm]);

  // Render Map B Layers (Observation, Polygons, Isogloss, Heatmap, Glottolog)
  useEffect(() => {
    const mapB = mapInstanceRefB.current;
    if (!mapB || !isSplitView) return;

    // 1. Observation Points Layer on Map B
    const obsB = observationPointsLayerRefB.current;
    if (obsB) {
      obsB.clearLayers();
      const shouldShowObs = (splitMode === 'region') || (splitMode === 'layer' && (splitLayerB === 'all' || splitLayerB === 'observation' || splitLayerB === 'polygons' || splitLayerB === 'isogloss'));

      if (shouldShowObs) {
        filteredPoints.forEach(pt => {
          const isSelectedB = pt.id === pointB?.id;
          const isPointA = pt.id === pointA?.id;
          const langColor = getLanguageColor(pt.bahasa);

          const markerHtml = `
            <div class="relative flex items-center justify-center transition-transform hover:scale-125 cursor-pointer">
              ${isSelectedB ? '<div class="absolute -inset-2.5 rounded-full bg-purple-500/40 animate-ping"></div>' : ''}
              ${isPointA && splitMode === 'region' ? '<div class="absolute -inset-1.5 rounded-full bg-blue-400/40"></div>' : ''}
              <div 
                class="relative w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-lg border-2 ${
                  isSelectedB ? 'ring-4 ring-purple-400 scale-110' : isPointA ? 'ring-2 ring-blue-400' : ''
                }" 
                style="background-color: ${isSelectedB ? '#9333ea' : langColor.hex}; border-color: #ffffff;"
              >
                ${isSelectedB ? '🎯' : pt.isCustomManualPoint ? '📍' : pt.desa.slice(0, 2).toUpperCase()}
              </div>
              ${pt.isVerified ? '<span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">✓</span>' : ''}
            </div>
          `;

          const customIcon = L.divIcon({
            className: 'custom-observation-marker-b',
            html: markerHtml,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });

          const marker = L.marker([pt.lat, pt.lng], { icon: customIcon });

          marker.on('click', () => {
            if (splitMode === 'region') {
              setSplitPointBId(pt.id);
            } else {
              setSelectedPointId(pt.id);
            }
            mapB.setView([pt.lat, pt.lng], Math.max(mapB.getZoom(), 10), { animate: true });
          });

          marker.bindPopup(`
            <div class="p-2.5 text-xs font-sans space-y-1.5 min-w-[200px]">
              <div class="flex items-center justify-between border-b pb-1">
                <span class="font-bold text-slate-900">${pt.desa}</span>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">Peta B</span>
              </div>
              <div class="text-[11px] text-slate-600"><span class="font-semibold">Bahasa:</span> ${pt.bahasa}</div>
              <div class="text-[11px] text-slate-600">Kec. ${pt.kecamatan}, ${pt.kabupaten}</div>
              <div class="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                ${pt.lat.toFixed(5)}°, ${pt.lng.toFixed(5)}°
              </div>
            </div>
          `);

          marker.addTo(obsB);
        });
      }
    }

    // 2. Territory Polygons on Map B
    const polyB = territoryPolygonsLayerRefB.current;
    if (polyB) {
      polyB.clearLayers();
      const shouldShowPoly = (splitMode === 'region') || (splitMode === 'layer' && (splitLayerB === 'all' || splitLayerB === 'polygons'));
      if (shouldShowPoly && filteredPoints.length >= 3) {
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
            const isSelected = pt.id === pointB?.id;

            let polyCoords: [number, number][] = [];
            if (rawCell && rawCell.length > 2) {
              polyCoords = rawCell.map(([lng, lat]) => [lat, lng]);
            } else {
              polyCoords = createBufferPolygon(pt.lat, pt.lng, 25);
            }

            const polygon = L.polygon(polyCoords, {
              color: isSelected ? '#a855f7' : langColor.hex,
              weight: isSelected ? 3 : 1.2,
              fillColor: isSelected ? '#a855f7' : langColor.hex,
              fillOpacity: isSelected ? Math.min(polygonOpacity + 0.25, 0.75) : polygonOpacity,
              dashArray: '3, 4'
            });

            polygon.on('click', () => {
              if (splitMode === 'region') setSplitPointBId(pt.id);
            });

            polygon.addTo(polyB);
          });
        } catch (err) {
          console.warn('Map B Voronoi error:', err);
        }
      }
    }

    // 3. Isogloss Lines on Map B
    const linesB = isoglossLinesLayerRefB.current;
    if (linesB) {
      linesB.clearLayers();
      const shouldShowIso = (splitMode === 'region') || (splitMode === 'layer' && (splitLayerB === 'all' || splitLayerB === 'isogloss'));
      if (shouldShowIso && filteredPoints.length >= 2) {
        for (let i = 0; i < filteredPoints.length; i++) {
          for (let j = i + 1; j < filteredPoints.length; j++) {
            const p1 = filteredPoints[i];
            const p2 = filteredPoints[j];
            const distKm = calculateDistanceKm(p1.lat, p1.lng, p2.lat, p2.lng);

            if (distKm <= 60) {
              const sameLanguage = p1.bahasa.toLowerCase() === p2.bahasa.toLowerCase();
              const lineColor = sameLanguage ? '#10b981' : '#f97316';

              const line = L.polyline([[p1.lat, p1.lng], [p2.lat, p2.lng]], {
                color: lineColor,
                weight: sameLanguage ? 1.5 : 2.5,
                opacity: 0.65,
                dashArray: sameLanguage ? '4, 6' : undefined
              });

              line.addTo(linesB);
            }
          }
        }
      }
    }

    // 4. Heatmap & Buffer on Map B
    const heatB = heatmapLayerRefB.current;
    if (heatB) {
      heatB.clearLayers();
      if (splitMode === 'layer' && (splitLayerB === 'all' || splitLayerB === 'heatmap')) {
        filteredPoints.forEach(pt => {
          const langColor = getLanguageColor(pt.bahasa);
          const circle = L.circle([pt.lat, pt.lng], {
            radius: heatmapRadiusKm * 1000,
            color: langColor.hex,
            fillColor: langColor.hex,
            fillOpacity: 0.22,
            weight: 1
          });
          circle.addTo(heatB);
        });
      }
    }

    // 5. Glottolog on Map B
    const glottoB = glottologLayerRefB.current;
    if (glottoB) {
      glottoB.clearLayers();
      if (splitMode === 'layer' && (splitLayerB === 'all' || splitLayerB === 'glottolog')) {
        const nationalLangs = GLOTTOLOG_LANGUAGES.slice(0, 120);
        nationalLangs.forEach(lang => {
          const pinIcon = L.divIcon({
            className: 'custom-glotto-dot-b',
            html: `
              <div class="w-4 h-4 rounded-full bg-indigo-600 border border-white shadow-xs flex items-center justify-center text-[7px] text-white font-bold opacity-85">
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
              ${lang.province}
            </div>`,
            { sticky: true }
          );
          marker.addTo(glottoB);
        });
      }
    }
  }, [isSplitView, splitMode, splitLayerB, pointB, pointA, filteredPoints, polygonOpacity, heatmapRadiusKm]);

  // 1. RENDER OBSERVATION POINTS (Titik Pengamatan Berdasarkan Koordinat Geografis)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const obsLayer = observationPointsLayerRef.current;
    if (!map || !obsLayer) return;

    obsLayer.clearLayers();
    const shouldShowObsA = !isSplitView
      ? showObservationLayer
      : (splitMode === 'region' || (splitMode === 'layer' && (splitLayerA === 'all' || splitLayerA === 'observation' || splitLayerA === 'polygons' || splitLayerA === 'isogloss')));
    if (!shouldShowObsA) return;

    filteredPoints.forEach(pt => {
      const isSelected = isSplitView && splitMode === 'region' ? pt.id === pointA?.id : pt.id === selectedPointId;
      const isPointB = isSplitView && splitMode === 'region' && pt.id === pointB?.id;
      const langColor = getLanguageColor(pt.bahasa);

      const markerHtml = `
        <div class="relative flex items-center justify-center transition-transform hover:scale-125 cursor-pointer">
          ${isSelected ? '<div class="absolute -inset-2.5 rounded-full bg-blue-500/40 animate-ping"></div>' : ''}
          ${isPointB ? '<div class="absolute -inset-1.5 rounded-full bg-purple-400/40"></div>' : ''}
          ${pt.isCustomManualPoint ? '<div class="absolute -inset-1 rounded-full bg-amber-400/50 animate-pulse"></div>' : ''}
          <div 
            class="relative w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-lg border-2 ${isSelected ? 'ring-4 ring-blue-400 scale-110' : isPointB ? 'ring-2 ring-purple-400' : ''}" 
            style="background-color: ${isSelected && isSplitView ? '#2563eb' : langColor.hex}; border-color: #ffffff;"
          >
            ${isSelected && isSplitView ? '📍' : pt.isCustomManualPoint ? '📍' : pt.desa.slice(0, 2).toUpperCase()}
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
        if (isSplitView && splitMode === 'region') {
          setSplitPointAId(pt.id);
        } else {
          setSelectedPointId(pt.id);
        }
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
  }, [mapReady, filteredPoints, showObservationLayer, selectedPointId, isSplitView, splitMode, splitLayerA, pointA, pointB]);

  // 2. RENDER TERRITORY POLYGONS (Poligon Wilayah Tutur Berdasarkan Koordinat Titik)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const polyLayer = territoryPolygonsLayerRef.current;
    if (!map || !polyLayer) return;

    polyLayer.clearLayers();
    const shouldShowPolyA = !isSplitView
      ? showTerritoryPolygons
      : (splitMode === 'region' || (splitMode === 'layer' && (splitLayerA === 'all' || splitLayerA === 'polygons')));
    if (!shouldShowPolyA || filteredPoints.length === 0) return;

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
          const isSelected = isSplitView && splitMode === 'region' ? pt.id === pointA?.id : pt.id === selectedPointId;

          let polyCoords: [number, number][] = [];
          if (rawCell && rawCell.length > 2) {
            polyCoords = rawCell.map(([lng, lat]) => [lat, lng]);
          } else {
            polyCoords = createBufferPolygon(pt.lat, pt.lng, 25);
          }

          const polygon = L.polygon(polyCoords, {
            color: isSelected ? '#3b82f6' : langColor.hex,
            weight: isSelected ? 3 : 1.2,
            fillColor: isSelected ? '#3b82f6' : langColor.hex,
            fillOpacity: isSelected ? Math.min(polygonOpacity + 0.25, 0.75) : polygonOpacity,
            dashArray: '3, 4'
          });

          polygon.on('click', () => {
            if (isSplitView && splitMode === 'region') {
              setSplitPointAId(pt.id);
            } else {
              setSelectedPointId(pt.id);
            }
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
        const isSelected = isSplitView && splitMode === 'region' ? pt.id === pointA?.id : pt.id === selectedPointId;
        const polyCoords = createBufferPolygon(pt.lat, pt.lng, 25);

        const polygon = L.polygon(polyCoords, {
          color: isSelected ? '#3b82f6' : langColor.hex,
          weight: isSelected ? 3 : 1.5,
          fillColor: isSelected ? '#3b82f6' : langColor.hex,
          fillOpacity: polygonOpacity,
          dashArray: '2, 5'
        });

        polygon.addTo(polyLayer);
      });
    }
  }, [mapReady, filteredPoints, showTerritoryPolygons, polygonOpacity, selectedPointId, isSplitView, splitMode, splitLayerA, pointA]);

  // 3. RENDER ISOGLOSS & DIALECT CONNECTION LINES
  useEffect(() => {
    const map = mapInstanceRef.current;
    const linesLayer = isoglossLinesLayerRef.current;
    if (!map || !linesLayer) return;

    linesLayer.clearLayers();
    const shouldShowIsoA = !isSplitView
      ? showIsoglossLines
      : (splitMode === 'region' || (splitMode === 'layer' && (splitLayerA === 'all' || splitLayerA === 'isogloss')));
    if (!shouldShowIsoA || filteredPoints.length < 2) return;

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
  }, [mapReady, filteredPoints, showIsoglossLines, isSplitView, splitMode, splitLayerA]);

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

          {/* Button: Split View Mode Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsSplitView(prev => !prev);
              setTimeout(() => {
                mapInstanceRef.current?.invalidateSize();
                mapInstanceRefB.current?.invalidateSize();
              }, 120);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isSplitView
                ? 'bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-300 dark:ring-purple-900'
                : 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/50'
            }`}
            title="Bandingkan dua wilayah survei atau dua lapisan geografis secara berdampingan"
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>Mode Split View</span>
            {isSplitView && (
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            )}
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
          SPLIT VIEW COMPARISON CONTROL RIBBON
          ========================================================================= */}
      {isSplitView && (
        <div className="bg-gradient-to-r from-purple-50 via-indigo-50/50 to-slate-50 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-slate-900 border-b border-purple-200/80 dark:border-purple-900/60 p-3 sm:px-5 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-xs">
              <Columns2 className="w-3.5 h-3.5" />
              <span>Mode Split View Aktif</span>
            </div>

            {/* Split Comparison Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-xs font-semibold shadow-2xs">
              <button
                type="button"
                onClick={() => setSplitMode('region')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  splitMode === 'region'
                    ? 'bg-purple-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-purple-600'
                }`}
              >
                <MapPin className="w-3 h-3" />
                <span>1. Komparasi 2 Wilayah Survei</span>
              </button>
              <button
                type="button"
                onClick={() => setSplitMode('layer')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  splitMode === 'layer'
                    ? 'bg-purple-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-purple-600'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>2. Komparasi 2 Lapisan Geografis</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Pan & Zoom Synchronization Toggle */}
            <button
              type="button"
              onClick={() => setIsSyncEnabled(prev => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                isSyncEnabled
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
              title={isSyncEnabled ? 'Gerak peta dan zoom disinkronkan' : 'Gerak peta mandiri (bebas eksplorasi dua kawasan geografis berbeda)'}
            >
              {isSyncEnabled ? <Link2 className="w-3.5 h-3.5 text-emerald-600" /> : <Unlink2 className="w-3.5 h-3.5 text-slate-400" />}
              <span>{isSyncEnabled ? 'Sinkronkan Gerak Peta: Aktif' : 'Gerak Peta: Mandiri'}</span>
            </button>

            {/* Fit Both Points Bounds */}
            {splitMode === 'region' && pointA && pointB && (
              <button
                type="button"
                onClick={handleFitBothPoints}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium cursor-pointer shadow-2xs"
                title="Pusatkan peta ke garis penghubung kedua titik pengamatan"
              >
                <Maximize2 className="w-3 h-3 text-blue-600" />
                <span>Fokus 2 Titik</span>
              </button>
            )}

            {/* Swap Point A & Point B */}
            {splitMode === 'region' && (
              <button
                type="button"
                onClick={handleSwapSplitPoints}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium cursor-pointer shadow-2xs"
                title="Tukar posisi Titik A (kiri) dan Titik B (kanan)"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-purple-600" />
                <span>Tukar A ⇄ B</span>
              </button>
            )}

            {/* Close Split View */}
            <button
              type="button"
              onClick={() => {
                setIsSplitView(false);
                setTimeout(() => {
                  mapInstanceRef.current?.invalidateSize();
                }, 120);
              }}
              className="p-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer shadow-2xs"
              title="Kembali ke tampilan peta tunggal"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MAIN MAP BODY & COLLAPSIBLE NAVIGATION ROSTER / SPLIT VIEW PANES
          ========================================================================= */}
      <div className={`relative flex-1 w-full min-h-[540px] ${
        isSplitView
          ? 'p-3 sm:p-4 bg-slate-100/70 dark:bg-slate-950/80 space-y-4'
          : 'grid grid-cols-1 lg:grid-cols-12'
      }`}>
        {/* MAP WRAPPER (Dual column on Split View, 8 cols on normal view) */}
        <div className={
          isSplitView
            ? 'grid grid-cols-1 lg:grid-cols-2 gap-4 w-full'
            : 'contents'
        }>
          {/* PANE A (LEFT PANE / MAP A) */}
          <div className={
            isSplitView
              ? 'flex flex-col rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md'
              : 'relative lg:col-span-8 w-full h-[540px] sm:h-[620px] bg-slate-100 dark:bg-slate-950'
          }>
            {/* Header bar on Map A in Split View */}
            {isSplitView && (
              <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-blue-300 dark:ring-blue-900 shrink-0" />
                  <span className="font-bold text-slate-900 dark:text-white shrink-0">PETA A (KIRI)</span>
                  {splitMode === 'region' ? (
                    <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900 truncate">
                      {pointA?.desa || 'Titik Pengamatan A'} ({pointA?.bahasa})
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900 truncate">
                      Lapisan: {getLayerLabel(splitLayerA)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {splitMode === 'region' ? (
                    <select
                      value={splitPointAId || pointA?.id || ''}
                      onChange={(e) => {
                        setSplitPointAId(e.target.value);
                        setSelectedPointId(e.target.value);
                        const pt = surveyPoints.find(p => p.id === e.target.value);
                        if (pt && mapInstanceRef.current) {
                          mapInstanceRef.current.flyTo([pt.lat, pt.lng], Math.max(mapInstanceRef.current.getZoom(), 10), { duration: 0.6 });
                        }
                      }}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2 py-1 text-[11px] font-medium max-w-[160px] sm:max-w-[200px]"
                    >
                      {surveyPoints.map(pt => (
                        <option key={`split-a-${pt.id}`} value={pt.id}>
                          {pt.desa} ({pt.bahasa})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={splitLayerA}
                      onChange={(e) => setSplitLayerA(e.target.value as any)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2 py-1 text-[11px] font-medium"
                    >
                      <option value="polygons">Poligon Wilayah Tutur</option>
                      <option value="observation">Titik Pengamatan Saja</option>
                      <option value="isogloss">Jaringan Garis Isoglos</option>
                      <option value="heatmap">Buffer Kepadatan Dialek</option>
                      <option value="all">Semua Lapisan</option>
                    </select>
                  )}

                  {/* Basemap A Selector */}
                  <div className="flex items-center p-0.5 rounded-lg bg-slate-200/70 dark:bg-slate-700/60 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setSelectedBaseMap('carto')}
                      className={`px-1.5 py-0.5 rounded ${selectedBaseMap === 'carto' ? 'bg-white dark:bg-slate-900 font-bold text-blue-600 shadow-2xs' : 'text-slate-600 dark:text-slate-400'}`}
                    >
                      Terang
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedBaseMap('satellite')}
                      className={`px-1.5 py-0.5 rounded ${selectedBaseMap === 'satellite' ? 'bg-white dark:bg-slate-900 font-bold text-blue-600 shadow-2xs' : 'text-slate-600 dark:text-slate-400'}`}
                    >
                      Satelit
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedBaseMap('dark')}
                      className={`px-1.5 py-0.5 rounded ${selectedBaseMap === 'dark' ? 'bg-white dark:bg-slate-900 font-bold text-blue-600 shadow-2xs' : 'text-slate-600 dark:text-slate-400'}`}
                    >
                      Gelap
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MAP A CANVAS */}
            <div className={`relative w-full ${isSplitView ? 'h-[460px] sm:h-[540px]' : 'h-[540px] sm:h-[620px]'} bg-slate-100 dark:bg-slate-950`}>
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
              <div className="absolute bottom-4 left-4 z-10 p-2.5 sm:p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-lg text-xs space-y-2 max-w-[220px]">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isSplitView ? 'Legenda Peta A' : 'Legenda Pemetaan Bahasa'}</span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-slate-600 dark:text-slate-300">Bahasa Sunda</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-500 shrink-0" />
                    <span className="text-slate-600 dark:text-slate-300">Bahasa Jawa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0" />
                    <span className="text-slate-600 dark:text-slate-300">Bahasa Cirebon</span>
                  </div>
                  {isSplitView && splitMode === 'region' && (
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="w-3 h-0.5 bg-blue-600 shrink-0" />
                      <span className="text-blue-600 font-semibold text-[10px]">Vektor Hubung A ↔ B</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* PANE B (RIGHT PANE / MAP B - ONLY MOUNTED IN SPLIT VIEW) */}
          {isSplitView && (
            <div className="flex flex-col rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
              {/* Header bar on Map B */}
              <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 ring-2 ring-purple-300 dark:ring-purple-900 shrink-0" />
                  <span className="font-bold text-slate-900 dark:text-white shrink-0">PETA B (KANAN)</span>
                  {splitMode === 'region' ? (
                    <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-900 truncate">
                      {pointB?.desa || 'Titik Pengamatan B'} ({pointB?.bahasa})
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-900 truncate">
                      Lapisan: {getLayerLabel(splitLayerB)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {splitMode === 'region' ? (
                    <select
                      value={splitPointBId || pointB?.id || ''}
                      onChange={(e) => {
                        setSplitPointBId(e.target.value);
                        const pt = surveyPoints.find(p => p.id === e.target.value);
                        if (pt && mapInstanceRefB.current) {
                          mapInstanceRefB.current.flyTo([pt.lat, pt.lng], Math.max(mapInstanceRefB.current.getZoom(), 10), { duration: 0.6 });
                        }
                      }}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2 py-1 text-[11px] font-medium max-w-[160px] sm:max-w-[200px]"
                    >
                      {surveyPoints.map(pt => (
                        <option key={`split-b-${pt.id}`} value={pt.id}>
                          {pt.desa} ({pt.bahasa})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={splitLayerB}
                      onChange={(e) => setSplitLayerB(e.target.value as any)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2 py-1 text-[11px] font-medium"
                    >
                      <option value="isogloss">Jaringan Garis Isoglos</option>
                      <option value="polygons">Poligon Wilayah Tutur</option>
                      <option value="glottolog">Glottolog Nasional</option>
                      <option value="heatmap">Buffer Kepadatan Dialek</option>
                      <option value="observation">Titik Pengamatan Saja</option>
                      <option value="all">Semua Lapisan</option>
                    </select>
                  )}

                  {/* Basemap B Selector */}
                  <div className="flex items-center p-0.5 rounded-lg bg-slate-200/70 dark:bg-slate-700/60 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setSelectedBaseMapB('satellite')}
                      className={`px-1.5 py-0.5 rounded ${selectedBaseMapB === 'satellite' ? 'bg-white dark:bg-slate-900 font-bold text-purple-600 shadow-2xs' : 'text-slate-600 dark:text-slate-400'}`}
                    >
                      Satelit
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedBaseMapB('carto')}
                      className={`px-1.5 py-0.5 rounded ${selectedBaseMapB === 'carto' ? 'bg-white dark:bg-slate-900 font-bold text-purple-600 shadow-2xs' : 'text-slate-600 dark:text-slate-400'}`}
                    >
                      Terang
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedBaseMapB('dark')}
                      className={`px-1.5 py-0.5 rounded ${selectedBaseMapB === 'dark' ? 'bg-white dark:bg-slate-900 font-bold text-purple-600 shadow-2xs' : 'text-slate-600 dark:text-slate-400'}`}
                    >
                      Gelap
                    </button>
                  </div>
                </div>
              </div>

              {/* MAP B CANVAS */}
              <div className="relative w-full h-[460px] sm:h-[540px] bg-slate-100 dark:bg-slate-950">
                <div ref={mapContainerRefB} className="w-full h-full z-0" />

                {/* Map B Legend Overlay */}
                <div className="absolute bottom-4 left-4 z-10 p-2.5 sm:p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-lg text-xs space-y-2 max-w-[220px]">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-purple-600" />
                    <span>Legenda Peta B</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
                      <span className="text-slate-600 dark:text-slate-300">Titik Terpilih B</span>
                    </div>
                    {splitMode === 'layer' ? (
                      <div className="text-[10px] text-purple-700 dark:text-purple-300 font-medium">
                        Layer: {getLayerLabel(splitLayerB)}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span className="w-3 h-0.5 bg-purple-600 shrink-0" />
                        <span className="text-purple-600 font-semibold text-[10px]">Vektor Hubung B ↔ A</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* NON-SPLIT VIEW: OBSERVATION POINTS ROSTER (4 cols on lg) */}
        {!isSplitView && (
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
        )}

        {/* =========================================================================
            SPLIT VIEW: BILATERAL COMPARISON METRICS CARD
            ========================================================================= */}
        {isSplitView && pointA && pointB && (
          <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-purple-200 dark:border-purple-900/60 shadow-sm p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-600 text-white shadow-2xs">
                  <GitCompare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                    <span>Komparasi Bilateral Titik Pengamatan: {pointA.desa} ↔ {pointB.desa}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      pointA.bahasa.toLowerCase() === pointB.bahasa.toLowerCase()
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    }`}>
                      {pointA.bahasa.toLowerCase() === pointB.bahasa.toLowerCase() ? 'Bahasa Serumpun / Dialek Sama' : 'Transisi / Batas Antar Bahasa'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Analisis spasial, jarak haversine geodesik, dan perbandingan profil narasumber serta cakupan leksikal Swadesh
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleFitBothPoints}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Fokus 2 Titik</span>
                </button>
                <button
                  type="button"
                  onClick={handleSwapSplitPoints}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-purple-600" />
                  <span>Tukar A ⇄ B</span>
                </button>
                {onSwitchToComparison && (
                  <button
                    type="button"
                    onClick={onSwitchToComparison}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  >
                    <BookA className="w-3.5 h-3.5" />
                    <span>Buka Modul Komparasi Leksikal →</span>
                  </button>
                )}
              </div>
            </div>

            {/* 4 Summary Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Metric 1: Jarak Haversine */}
              <div className="p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-900/50 space-y-1">
                <div className="flex items-center justify-between text-xs text-purple-700 dark:text-purple-300 font-semibold">
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Jarak Spasial Geodesik</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-200/60 dark:bg-purple-900/60">
                    Haversine
                  </span>
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">
                  {bilateralDistanceKm.toFixed(1)} <span className="text-xs font-normal text-slate-500">km</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {bilateralDistanceKm < 25 ? 'Wilayah bertetangga langsung (<25 km)' : bilateralDistanceKm < 60 ? 'Jarak menengah inter-kabupaten' : 'Jarak jauh lintas wilayah'}
                </div>
              </div>

              {/* Metric 2: Relasi Bahasa */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 space-y-1">
                <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-300 font-semibold">
                  <span className="flex items-center gap-1">
                    <Globe2 className="w-3.5 h-3.5" />
                    <span>Relasi Bahasa</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-200/60 dark:bg-blue-900/60">
                    Linguistik
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {pointA.bahasa} ↔ {pointB.bahasa}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {pointA.bahasa.toLowerCase() === pointB.bahasa.toLowerCase() ? 'Relasi dialek serumpun satu rumpun tutur' : 'Perbedaan bahasa tutur dominan'}
                </div>
              </div>

              {/* Metric 3: Kosakata Swadesh */}
              <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/50 space-y-1">
                <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                  <span className="flex items-center gap-1">
                    <BookA className="w-3.5 h-3.5" />
                    <span>Kosakata Swadesh Terdata</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/60">
                    Swadesh 200
                  </span>
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">
                  {pointA.swadeshCount} <span className="text-xs font-normal text-slate-500">vs</span> {pointB.swadeshCount} <span className="text-xs font-normal text-slate-500">kata</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Selisih kelengkapan: {Math.abs(pointA.swadeshCount - pointB.swadeshCount)} kata
                </div>
              </div>

              {/* Metric 4: Demografi Narasumber */}
              <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 space-y-1">
                <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-300 font-semibold">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>Profil Narasumber</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60">
                    Usia & Jumlah
                  </span>
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">
                  {pointA.informantCount} <span className="text-xs font-normal text-slate-500">vs</span> {pointB.informantCount} <span className="text-xs font-normal text-slate-500">orang</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Rata-rata: {pointA.averageInformantAge ?? '-'} th (A) vs {pointB.averageInformantAge ?? '-'} th (B)
                </div>
              </div>
            </div>

            {/* Side-by-Side Detailed Card Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Titik A Details Card */}
              <div className="p-3.5 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span>TITIK PENGAMATAN A: {pointA.desa}</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pointA.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {pointA.isVerified ? 'Tervalidasi' : 'Belum Valid'}
                  </span>
                </div>
                <div className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                  <div><span className="font-semibold text-slate-700 dark:text-slate-200">Bahasa:</span> {pointA.bahasa}</div>
                  <div><span className="font-semibold text-slate-700 dark:text-slate-200">Wilayah:</span> Kec. {pointA.kecamatan}, {pointA.kabupaten}, {pointA.provinsi}</div>
                  <div className="font-mono text-blue-700 dark:text-blue-400">Koordinat: {pointA.lat.toFixed(5)}°, {pointA.lng.toFixed(5)}°</div>
                  <div><span className="font-semibold text-slate-700 dark:text-slate-200">Narasumber Utama:</span> {pointA.primaryInformantSummary}</div>
                  <div><span className="font-semibold text-slate-700 dark:text-slate-200">Surveyor:</span> {pointA.surveyor}</div>
                </div>
              </div>

              {/* Titik B Details Card */}
              <div className="p-3.5 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                    <span>TITIK PENGAMATAN B: {pointB.desa}</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pointB.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {pointB.isVerified ? 'Tervalidasi' : 'Belum Valid'}
                  </span>
                </div>
                <div className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                  <div><span className="font-semibold text-slate-700 dark:text-slate-200">Bahasa:</span> {pointB.bahasa}</div>
                  <div><span className="font-semibold text-slate-700 dark:text-slate-200">Wilayah:</span> Kec. {pointB.kecamatan}, {pointB.kabupaten}, {pointB.provinsi}</div>
                  <div className="font-mono text-purple-700 dark:text-purple-400">Koordinat: {pointB.lat.toFixed(5)}°, {pointB.lng.toFixed(5)}°</div>
                  <div><span className="font-semibold text-slate-700 dark:text-slate-200">Narasumber Utama:</span> {pointB.primaryInformantSummary}</div>
                  <div><span className="font-semibold text-slate-700 dark:text-slate-200">Surveyor:</span> {pointB.surveyor}</div>
                </div>
              </div>
            </div>
          </div>
        )}
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
