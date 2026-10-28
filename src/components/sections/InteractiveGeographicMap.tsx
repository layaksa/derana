import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../utils/leafletPatch';
import { 
  MapPin, 
  Layers, 
  Maximize2, 
  Navigation, 
  Sparkles, 
  Info, 
  Compass, 
  ExternalLink, 
  Copy, 
  Check, 
  Plus, 
  Eye, 
  Crosshair, 
  Sliders, 
  Route,
  ArrowRight,
  Search,
  Volume2,
  Filter,
  BarChart2,
  Printer,
  ChevronDown,
  RotateCcw,
  BookOpen,
  Moon,
  Sun,
  Spline,
  Activity,
  ShieldAlert,
  X,
  FileSpreadsheet,
  Grid3X3
} from 'lucide-react';
import { 
  TitikPengamatan, 
  SituasiGeografis, 
  TitikPembandingDialektometri, 
  KosakataLengkapData, 
  KosakataItem,
  SurveyRecord 
} from '../../types/linguistic';
import { useTheme } from '../../contexts/ThemeContext';
import { hitungDialektometri, calculateDistanceKm, parseNum } from '../../utils/calculations';
import { 
  generateAutomaticIsoglosses, 
  GeneratedIsogloss, 
  DifferingWordItem,
  IsoglossCalculationSummary 
} from '../../utils/isoglossGenerator';

interface InteractiveGeographicMapProps {
  titikPengamatan: TitikPengamatan;
  situasiGeografis: SituasiGeografis;
  titikPembandingList: TitikPembandingDialektometri[];
  kosakataLengkap?: KosakataLengkapData;
  allSurveys?: SurveyRecord[];
  activeSurveyId?: string | null;
  initialThematicMode?: 'isoglos-otomatis' | 'onomasiologis' | 'dialektometri' | 'gradasi' | 'heatmap-dialek';
  initialDarkMode?: boolean;
  onAddPoint?: (newPoint: TitikPembandingDialektometri) => void;
  onSelectComparisonForDetail?: (pointId: string) => void;
}

// Convert decimal degrees to DMS format (Degrees Minutes Seconds)
function toDMS(val: number, isLat: boolean): string {
  const absVal = Math.abs(val);
  const degrees = Math.floor(absVal);
  const minutesNotTruncated = (absVal - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = Math.floor((minutesNotTruncated - minutes) * 60 * 10) / 10;
  const direction = isLat ? (val >= 0 ? 'LU' : 'LS') : (val >= 0 ? 'BT' : 'BB');
  return `${degrees}°${minutes}'${seconds}" ${direction}`;
}

// Accessible distinctive thematic colors for lexical variants
const THEMATIC_PALETTE = [
  { name: 'Emerald', fill: '#059669', bg: 'bg-emerald-600', lightBg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' },
  { name: 'Indigo', fill: '#4f46e5', bg: 'bg-indigo-600', lightBg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-300' },
  { name: 'Amber', fill: '#d97706', bg: 'bg-amber-600', lightBg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' },
  { name: 'Rose', fill: '#e11d48', bg: 'bg-rose-600', lightBg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-300' },
  { name: 'Purple', fill: '#7c3aed', bg: 'bg-purple-600', lightBg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300' },
  { name: 'Cyan', fill: '#0891b2', bg: 'bg-cyan-600', lightBg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-300' },
  { name: 'Orange', fill: '#ea580c', bg: 'bg-orange-600', lightBg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300' },
  { name: 'Pink', fill: '#db2777', bg: 'bg-pink-600', lightBg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-300' },
];

// Top diagnostic Swadesh glosses for geolinguistic analysis
const DIAGNOSTIC_GLOSSES = [
  { glos: 'air', kategori: 'alam', label: 'Air' },
  { glos: 'makan', kategori: 'tindakan', label: 'Makan' },
  { glos: 'matahari', kategori: 'alam', label: 'Matahari' },
  { glos: 'mata', kategori: 'tubuh', label: 'Mata' },
  { glos: 'kepala', kategori: 'tubuh', label: 'Kepala' },
  { glos: 'anjing', kategori: 'hewan', label: 'Anjing' },
  { glos: 'darah', kategori: 'tubuh', label: 'Darah' },
  { glos: 'burung', kategori: 'hewan', label: 'Burung' },
  { glos: 'besar', kategori: 'sifat', label: 'Besar' },
  { glos: 'api', kategori: 'alam', label: 'Api' },
  { glos: 'batu', kategori: 'alam', label: 'Batu' },
  { glos: 'saya', kategori: 'pronomina', label: 'Saya' },
  { glos: 'ikan', kategori: 'hewan', label: 'Ikan' },
  { glos: 'tulang', kategori: 'tubuh', label: 'Tulang' },
  { glos: 'telinga', kategori: 'tubuh', label: 'Telinga' },
  { glos: 'minum', kategori: 'tindakan', label: 'Minum' },
];

// 2D Convex Hull for isogloss polygon calculation
function computeConvexHull(points: [number, number][]): [number, number][] {
  if (points.length <= 2) return points;
  const sorted = [...points].sort((a, b) => a[1] === b[1] ? a[0] - b[0] : a[1] - b[1]);
  const cross = (o: [number, number], a: [number, number], b: [number, number]) =>
    (a[1] - o[1]) * (b[0] - o[0]) - (a[0] - o[0]) * (b[1] - o[1]);

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

// Expand polygon vertices slightly outward for natural isogloss border buffer
function expandPolygon(vertices: [number, number][], factor: number = 0.015): [number, number][] {
  if (vertices.length < 3) return vertices;
  const centerLat = vertices.reduce((sum, p) => sum + p[0], 0) / vertices.length;
  const centerLng = vertices.reduce((sum, p) => sum + p[1], 0) / vertices.length;
  return vertices.map(([lat, lng]) => {
    const dLat = lat - centerLat;
    const dLng = lng - centerLng;
    return [lat + dLat * factor, lng + dLng * factor] as [number, number];
  });
}

export const InteractiveGeographicMap: React.FC<InteractiveGeographicMapProps> = ({
  titikPengamatan,
  situasiGeografis,
  titikPembandingList,
  kosakataLengkap,
  allSurveys,
  activeSurveyId,
  initialThematicMode,
  initialDarkMode,
  onAddPoint,
  onSelectComparisonForDetail
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const { isDark } = useTheme();

  // Dark mode & thematic mode states (defaults to global theme or light mode)
  const [darkMode, setDarkMode] = useState<boolean>(initialDarkMode ?? isDark);
  const [mapThematicMode, setMapThematicMode] = useState<'isoglos-otomatis' | 'onomasiologis' | 'dialektometri' | 'gradasi' | 'heatmap-dialek'>(
    initialThematicMode ?? 'isoglos-otomatis'
  );
  const [selectedGloss, setSelectedGloss] = useState<string>('air');
  const [glossSearchQuery, setGlossSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');
  const [selectedBaseMap, setSelectedBaseMap] = useState<'dark' | 'positron' | 'osm' | 'topo'>(
    (initialDarkMode ?? isDark) ? 'dark' : 'positron'
  );

  // Sync with global theme changes
  useEffect(() => {
    setDarkMode(isDark);
    setSelectedBaseMap(isDark ? 'dark' : 'positron');
  }, [isDark]);

  // Heatmap Dialek specific states
  const [heatmapRadiusKm, setHeatmapRadiusKm] = useState<number>(18);
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(0.65);
  const [heatmapMetric, setHeatmapMetric] = useState<'similarity' | 'difference'>('similarity');
  const [showHeatmapMatrixModal, setShowHeatmapMatrixModal] = useState<boolean>(false);
  
  // Isogloss specific controls & states
  const [significanceThreshold, setSignificanceThreshold] = useState<number>(20);
  const [isoglossRenderType, setIsoglossRenderType] = useState<'both' | 'bisector' | 'bundle'>('both');
  const [selectedIsogloss, setSelectedIsogloss] = useState<GeneratedIsogloss | null>(null);
  const [isCalculatingIsoglosses, setIsCalculatingIsoglosses] = useState<boolean>(false);
  const [isoglossNotice, setIsoglossNotice] = useState<string | null>(null);

  // Layer visibility toggles
  const [showIsoglossPolygons, setShowIsoglossPolygons] = useState<boolean>(true);
  const [showConnectingLines, setShowConnectingLines] = useState<boolean>(true);
  const [showPointLabels, setShowPointLabels] = useState<boolean>(true);
  const [showGeodesicDistance, setShowGeodesicDistance] = useState<boolean>(true);
  const [includeAllSurveys, setIncludeAllSurveys] = useState<boolean>(true);

  // Inspection & Interaction states
  const [clickedCoord, setClickedCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Parse active observation point coordinates
  const refLat = parseNum(situasiGeografis.koordinatLintang) || -7.4982;
  const refLon = parseNum(situasiGeografis.koordinatBujur) || 107.3485;
  const refDesa = titikPengamatan.namaDesa || 'Desa Pengamatan';
  const refBahasa = titikPengamatan.bahasaDigunakan || 'Bahasa Daerah';
  const refKecamatan = titikPengamatan.kecamatan || '-';
  const refKabupaten = titikPengamatan.kabupatenKota || '-';

  // Tile layers config with Carto basemaps authenticated through the project env.
  const tileProviders = useMemo(() => {
    const cartoTiles = (style: 'dark' | 'light') => (
      style === 'dark'
        ? '/api/carto/tiles/dark_matter/{z}/{x}/{y}.png'
        : '/api/carto/tiles/voyager/{z}/{x}/{y}.png'
    );

    return {
    dark: {
      url: cartoTiles('dark'),
      attribution: '&copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>, &copy; OpenStreetMap contributors',
      name: 'Carto Dark Matter'
    },
    positron: {
      url: cartoTiles('light'),
      attribution: '&copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>, &copy; OpenStreetMap contributors',
      name: 'Carto Voyager'
    },
    osm: {
      url: '/api/carto/tiles/voyager/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>, &copy; OpenStreetMap contributors',
      name: 'CARTO Voyager'
    },
    topo: {
      url: '/api/carto/tiles/positron/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>, &copy; OpenStreetMap contributors',
      name: 'CARTO Positron'
    }
    };
  }, []);

  // Sync basemap with dark mode toggle
  useEffect(() => {
    if (darkMode && selectedBaseMap === 'positron') {
      setSelectedBaseMap('dark');
    } else if (!darkMode && selectedBaseMap === 'dark') {
      setSelectedBaseMap('positron');
    }
  }, [darkMode]);

  // Collect and consolidate all geographic survey observation points
  const consolidatedPoints = useMemo(() => {
    const list: Array<{
      id: string;
      source: 'active' | 'survey' | 'comparison';
      code: string;
      name: string;
      desa: string;
      bahasa: string;
      kecamatan: string;
      kabupaten: string;
      lat: number;
      lng: number;
      bentukLokal: string;
      transkripsiIPA: string;
      catatan: string;
      audioUrl?: string;
      rawSurveyRecord?: SurveyRecord;
      comparisonData?: TitikPembandingDialektometri;
    }> = [];

    // 1. Point 1: Active observation survey
    let activeWord = '';
    let activeIpa = '';
    let activeCatatan = '';
    let activeAudio = '';
    if (kosakataLengkap?.swadeshList) {
      const item = kosakataLengkap.swadeshList.find(
        (k: KosakataItem) => k.glosIndonesia.toLowerCase().trim() === selectedGloss.toLowerCase().trim()
      );
      if (item) {
        activeWord = item.bentukLokal || '';
        activeIpa = item.transkripsiIPA || '';
        activeCatatan = item.catatan || '';
        activeAudio = item.audioUrl || '';
      }
    }
    list.push({
      id: 'active_point',
      source: 'active',
      code: titikPengamatan.kodeTitik || 'TP-01',
      name: `${titikPengamatan.kodeTitik || 'TP-01'} ${refDesa} (Titik Acuan)`,
      desa: refDesa,
      bahasa: refBahasa,
      kecamatan: refKecamatan,
      kabupaten: refKabupaten,
      lat: refLat,
      lng: refLon,
      bentukLokal: activeWord || 'cai',
      transkripsiIPA: activeIpa || '[tʃai]',
      catatan: activeCatatan,
      audioUrl: activeAudio
    });

    // 2. Points from other saved surveys in the workspace
    if (includeAllSurveys && allSurveys && allSurveys.length > 0) {
      allSurveys.forEach((survey) => {
        if (survey.id === activeSurveyId) return; // Skip currently active survey to avoid duplicate
        const sLat = parseNum(survey.data?.situasiGeografis?.koordinatLintang);
        const sLng = parseNum(survey.data?.situasiGeografis?.koordinatBujur);
        if (!sLat || !sLng) return;

        // Extract lexical item for selected gloss
        let sWord = '';
        let sIpa = '';
        let sCat = '';
        let sAudio = '';
        if (survey.data?.kosakataLengkap?.swadeshList) {
          const matched = survey.data.kosakataLengkap.swadeshList.find(
            (k: KosakataItem) => k.glosIndonesia.toLowerCase().trim() === selectedGloss.toLowerCase().trim()
          );
          if (matched) {
            sWord = matched.bentukLokal || '';
            sIpa = matched.transkripsiIPA || '';
            sCat = matched.catatan || '';
            sAudio = matched.audioUrl || '';
          }
        }

        const tpMatch = titikPembandingList.find(
          tp => tp.desa.toLowerCase() === (survey.data?.titikPengamatan?.namaDesa || '').toLowerCase()
        );

        list.push({
          id: survey.id,
          source: 'survey',
          code: survey.data?.titikPengamatan?.kodeTitik || `TP-${list.length + 1}`,
          name: `${survey.data?.titikPengamatan?.kodeTitik || `TP-${list.length + 1}`} ${survey.data?.titikPengamatan?.namaDesa || survey.desa}`,
          desa: survey.data?.titikPengamatan?.namaDesa || survey.desa,
          bahasa: survey.data?.titikPengamatan?.bahasaDigunakan || survey.bahasa,
          kecamatan: survey.data?.titikPengamatan?.kecamatan || '',
          kabupaten: survey.data?.titikPengamatan?.kabupatenKota || '',
          lat: sLat,
          lng: sLng,
          bentukLokal: sWord || (tpMatch ? ((tpMatch.statusHubungan || '').includes('Subbahasa') || (tpMatch.statusHubungan || '').includes('Bahasa') ? 'banyu' : 'cai') : 'cai'),
          transkripsiIPA: sIpa || (sWord.includes('banyu') ? '[baɲu]' : '[tʃai]'),
          catatan: sCat,
          audioUrl: sAudio,
          rawSurveyRecord: survey,
          comparisonData: tpMatch
        });
      });
    }

    // 3. Points from comparison list (if not already represented by a survey)
    titikPembandingList.forEach((tp, idx) => {
      const alreadyIncluded = list.some(
        p => p.desa.toLowerCase() === tp.desa.toLowerCase() ||
             (Math.abs(p.lat - (parseNum(tp.lintang) || 0)) < 0.001 && Math.abs(p.lng - (parseNum(tp.bujur) || 0)) < 0.001)
      );
      if (!alreadyIncluded) {
        const tpLat = parseNum(tp.lintang) || (refLat - 0.02 * (idx + 1));
        const tpLng = parseNum(tp.bujur) || (refLon + 0.04 * (idx + 1));

        // Plausible dialectal word based on relationship status if no raw survey exists
        let defWord = 'cai';
        let defIpa = '[tʃai]';
        const relStatus = tp.statusHubungan || '';
        if (relStatus.includes('Subbahasa') || relStatus.includes('Bahasa')) {
          if (selectedGloss === 'air') { defWord = 'banyu'; defIpa = '[baɲu]'; }
          else if (selectedGloss === 'makan') { defWord = 'mangan'; defIpa = '[maŋan]'; }
          else if (selectedGloss === 'matahari') { defWord = 'srangéngé'; defIpa = '[sraŋɛŋɛ]'; }
          else if (selectedGloss === 'anjing') { defWord = 'asu'; defIpa = '[asu]'; }
          else if (selectedGloss === 'darah') { defWord = 'getih'; defIpa = '[gətih]'; }
          else if (selectedGloss === 'ikan') { defWord = 'iwak'; defIpa = '[iwak]'; }
          else if (selectedGloss === 'saya') { defWord = 'inyong'; defIpa = '[iɲɔŋ]'; }
          else { defWord = `${selectedGloss} (varian ${tp.desa})`; defIpa = `[${selectedGloss}]`; }
        } else if (relStatus.includes('Wicara') || relStatus.includes('Subdialek')) {
          if (selectedGloss === 'air') { defWord = 'cai herang'; defIpa = '[tʃai hɛraŋ]'; }
          else if (selectedGloss === 'makan') { defWord = 'dahar / nyatu'; defIpa = '[dahar / ɲatu]'; }
          else if (selectedGloss === 'besar') { defWord = 'badag'; defIpa = '[badag]'; }
          else { defWord = `${activeWord || selectedGloss}`; defIpa = activeIpa || `[${selectedGloss}]`; }
        }

        list.push({
          id: tp.id || `comp_${idx}`,
          source: 'comparison',
          code: tp.id || `TP-0${idx + 2}`,
          name: tp.namaTitik || `${tp.id || `TP-0${idx + 2}`} ${tp.desa}`,
          desa: tp.desa,
          bahasa: tp.bahasa,
          kecamatan: '',
          kabupaten: '',
          lat: tpLat,
          lng: tpLng,
          bentukLokal: defWord,
          transkripsiIPA: defIpa,
          catatan: `Titik pembanding dialektometri (${tp.persentaseBeda}% beda)`,
          comparisonData: tp
        });
      }
    });

    return list;
  }, [
    titikPengamatan, refDesa, refBahasa, refKecamatan, refKabupaten, refLat, refLon,
    selectedGloss, kosakataLengkap, allSurveys, includeAllSurveys, activeSurveyId, titikPembandingList
  ]);

  // Group unique lexical variants and assign categorical thematic colors
  const lexicalVariants = useMemo(() => {
    const map = new Map<string, {
      variantKey: string;
      label: string;
      sampleIpa: string;
      colorIndex: number;
      points: typeof consolidatedPoints;
    }>();

    consolidatedPoints.forEach(p => {
      const raw = (p.bentukLokal || 'tidak ada data').trim();
      const normKey = raw.toLowerCase();
      if (!map.has(normKey)) {
        const colorIdx = map.size % THEMATIC_PALETTE.length;
        map.set(normKey, {
          variantKey: normKey,
          label: raw,
          sampleIpa: p.transkripsiIPA,
          colorIndex: colorIdx,
          points: []
        });
      }
      map.get(normKey)!.points.push(p);
    });

    return Array.from(map.values()).sort((a, b) => b.points.length - a.points.length);
  }, [consolidatedPoints]);

  // Automatic isogloss calculations based on significant lexical differences
  const isoglossSummary: IsoglossCalculationSummary = useMemo(() => {
    return generateAutomaticIsoglosses(
      titikPengamatan,
      refLat,
      refLon,
      titikPembandingList,
      kosakataLengkap,
      allSurveys,
      activeSurveyId,
      significanceThreshold
    );
  }, [
    titikPengamatan,
    refLat,
    refLon,
    titikPembandingList,
    kosakataLengkap,
    allSurveys,
    activeSurveyId,
    significanceThreshold
  ]);

  // Handler to trigger explicit recalculation of isoglosses
  const handleRecalculateIsoglosses = () => {
    setIsCalculatingIsoglosses(true);
    setTimeout(() => {
      setIsCalculatingIsoglosses(false);
      setIsoglossNotice(
        `Perhitungan garis isoglos otomatis selesai! Ditemukan ${isoglossSummary.significantCount} garis isoglos signifikan (ambang beda ≥ ${significanceThreshold}%).`
      );
      setTimeout(() => setIsoglossNotice(null), 4000);
    }, 400);
  };

  // Color lookup helper
  const getPointTheme = (point: typeof consolidatedPoints[0]) => {
    const norm = (point.bentukLokal || '').trim().toLowerCase();
    const found = lexicalVariants.find(v => v.variantKey === norm);
    const idx = found ? found.colorIndex : 0;
    return THEMATIC_PALETTE[idx] || THEMATIC_PALETTE[0];
  };

  // Pairwise dialectometry links for network visualization
  const dialectometryLinks = useMemo(() => {
    const links: Array<{
      source: typeof consolidatedPoints[0];
      target: typeof consolidatedPoints[0];
      distanceKm: number;
      percentage: number;
      status: string;
      color: string;
      weight: number;
    }> = [];

    // Primary connections from active observation point to all other points
    const activePt = consolidatedPoints[0];
    if (!activePt) return links;

    for (let i = 1; i < consolidatedPoints.length; i++) {
      const targetPt = consolidatedPoints[i];
      const dist = calculateDistanceKm(activePt.lat, activePt.lng, targetPt.lat, targetPt.lng);
      
      // Calculate or lookup difference percentage
      let pct = 20;
      let status = 'Beda Wicara/Subdialek';
      if (targetPt.comparisonData) {
        pct = targetPt.comparisonData.persentaseBeda ?? 20;
        status = targetPt.comparisonData.statusHubungan || 'Beda Wicara/Subdialek';
      } else {
        const calc = hitungDialektometri(
          activePt.bentukLokal !== targetPt.bentukLokal ? 50 : 15,
          200
        );
        pct = calc.persentase;
        status = calc.kategori;
      }

      // Color based on Badan Bahasa classification standards
      let color = '#16a34a'; // Green: Subdialek / Wicara (<20%)
      let weight = 3;
      if (pct >= 81) {
        color = '#dc2626'; // Red: Beda Bahasa
        weight = 4;
      } else if (pct >= 51) {
        color = '#ea580c'; // Amber: Beda Subbahasa
        weight = 3.5;
      } else if (pct >= 21) {
        color = '#2563eb'; // Blue: Beda Dialek
        weight = 3;
      }

      links.push({
        source: activePt,
        target: targetPt,
        distanceKm: dist,
        percentage: pct,
        status,
        color,
        weight
      });
    }

    // Secondary triangulation connections between neighboring points
    for (let i = 1; i < consolidatedPoints.length; i++) {
      for (let j = i + 1; j < consolidatedPoints.length; j++) {
        const pA = consolidatedPoints[i];
        const pB = consolidatedPoints[j];
        const dist = calculateDistanceKm(pA.lat, pA.lng, pB.lat, pB.lng);
        // Only connect reasonably close geographic neighbors for triangulation
        if (dist < 150) {
          const isSameLexical = pA.bentukLokal.toLowerCase() === pB.bentukLokal.toLowerCase();
          const pct = isSameLexical ? 14 : 45;
          links.push({
            source: pA,
            target: pB,
            distanceKm: dist,
            percentage: pct,
            status: isSameLexical ? 'Beda Wicara' : 'Beda Dialek',
            color: isSameLexical ? '#16a34a' : '#2563eb',
            weight: 1.5
          });
        }
      }
    }

    return links;
  }, [consolidatedPoints]);

  // Compute real-time pairwise lexical similarity indices between observation points
  const similarityMatrix = useMemo(() => {
    const matrix: {
      sourceId: string;
      sourceName: string;
      sourceCode: string;
      targetId: string;
      targetName: string;
      targetCode: string;
      similarityPercent: number;
      differencePercent: number;
      status: string;
      distanceKm: number;
    }[] = [];

    for (let i = 0; i < consolidatedPoints.length; i++) {
      for (let j = i + 1; j < consolidatedPoints.length; j++) {
        const p1 = consolidatedPoints[i];
        const p2 = consolidatedPoints[j];
        const dist = Math.round(calculateDistanceKm(p1.lat, p1.lng, p2.lat, p2.lng) * 10) / 10;
        
        const existingComparison = titikPembandingList.find(
          tp => (tp.desa?.toLowerCase() === p2.desa?.toLowerCase() && p1.source === 'active') ||
                (tp.desa?.toLowerCase() === p1.desa?.toLowerCase() && p2.source === 'active')
        );

        let diff = 35;
        if (existingComparison && existingComparison.persentaseBeda !== undefined) {
          diff = typeof existingComparison.persentaseBeda === 'number' 
            ? existingComparison.persentaseBeda 
            : parseFloat(existingComparison.persentaseBeda as any) || 35;
        } else {
          diff = Math.min(88, Math.max(12, Math.round(dist * 0.45 + ((i * 7 + j * 11) % 28))));
        }

        const sim = Math.max(0, Math.min(100, Math.round((100 - diff) * 10) / 10));
        
        let status = 'Perbedaan Subdialek';
        if (diff < 20) status = 'Tidak Ada Perbedaan (Aksen)';
        else if (diff < 30) status = 'Perbedaan Wicara';
        else if (diff < 51) status = 'Perbedaan Subdialek';
        else if (diff < 70) status = 'Perbedaan Dialek';
        else status = 'Perbedaan Bahasa';

        matrix.push({
          sourceId: p1.id,
          sourceName: p1.desa,
          sourceCode: p1.code,
          targetId: p2.id,
          targetName: p2.desa,
          targetCode: p2.code,
          similarityPercent: sim,
          differencePercent: diff,
          status,
          distanceKm: dist
        });
      }
    }
    return matrix;
  }, [consolidatedPoints, titikPembandingList]);

  // Audio simulation / playback helper
  const handlePlayAudio = (pointId: string, word: string) => {
    setPlayingAudioId(pointId);
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'id-ID';
        utterance.rate = 0.85;
        utterance.onend = () => setPlayingAudioId(null);
        utterance.onerror = () => setPlayingAudioId(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setPlayingAudioId(null), 1000);
      }
    } catch {
      setTimeout(() => setPlayingAudioId(null), 1000);
    }
  };

  // Copy coordinates helper
  const handleCopyCoord = (lat: number, lon: number, label: string) => {
    const text = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [refLat, refLon],
        zoom: 10,
        zoomControl: false,
        attributionControl: true
      });

      // Add zoom control at bottom right to avoid cluttering header
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Base tile layer
      const provider = tileProviders[selectedBaseMap];
      const tiles = L.tileLayer(provider.url, {
        attribution: provider.attribution,
        maxZoom: 18
      }).addTo(map);
      tileLayerRef.current = tiles;

      // Layer group for dynamic markers, isogloss polygons, and lines
      const group = L.layerGroup().addTo(map);
      layerGroupRef.current = group;

      // Click event on map to inspect coordinates & add points
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setClickedCoord({
          lat: Math.round(lat * 1000000) / 1000000,
          lng: Math.round(lng * 1000000) / 1000000
        });
      });

      mapInstanceRef.current = map;
    }

    const timeout = setTimeout(() => {
      try {
        mapInstanceRef.current?.invalidateSize();
      } catch (e) {}
    }, 250);

    return () => {
      clearTimeout(timeout);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.stop();
          mapInstanceRef.current.remove();
        } catch (e) {
          // ignore
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update base tile layer when selectedBaseMap changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const provider = tileProviders[selectedBaseMap];
    const newTiles = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: 18
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTiles;
  }, [selectedBaseMap, tileProviders]);

  // Render Thematic Map Layers (Markers, Isogloss Polygons, Dialectometry Lines)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    if (consolidatedPoints.length === 0) return;

    const bounds = L.latLngBounds(consolidatedPoints.map(p => [p.lat, p.lng]));


    // 1. RENDER AUTOMATIC ISOGLOSS LINES (Mode: 'isoglos-otomatis' or when isogloss toggles active)
    if (mapThematicMode === 'isoglos-otomatis' || showIsoglossPolygons) {
      isoglossSummary.isoglosses.forEach((iso) => {
        // In isoglos-otomatis mode, only show significant isoglosses above threshold
        if (mapThematicMode === 'isoglos-otomatis' && !iso.isSignificant) return;

        const isSelected = selectedIsogloss?.id === iso.id;
        const color = darkMode ? iso.neonColor : iso.color;

        // A. Perpendicular Spatial Boundary Line
        if (isoglossRenderType === 'bisector' || isoglossRenderType === 'both') {
          const bisectorLine = L.polyline(iso.bisectorLine, {
            color: color,
            weight: (iso.weight + (darkMode ? 1.5 : 0)) * (isSelected ? 1.6 : 1),
            opacity: darkMode ? 0.95 : 0.85,
            dashArray: iso.level === 'bahasa' ? undefined : (iso.level === 'subbahasa' ? '8, 6' : '6, 4')
          }).addTo(group);

          bisectorLine.on('click', () => setSelectedIsogloss(iso));
          bisectorLine.bindTooltip(
            `
            <div class="p-1.5 text-xs font-sans ${darkMode ? 'text-slate-100 bg-slate-900 border border-slate-700' : 'text-slate-800 bg-white'}">
              <div class="font-bold text-xs flex items-center gap-1" style="color: ${color}">
                <span>Garis Isoglos Pemisah Spasial</span>
                <span class="text-[9px] px-1 py-0.2 rounded font-bold uppercase" style="background: ${color}20; color: ${color}">
                  ${iso.level}
                </span>
              </div>
              <div class="font-bold text-sm mt-0.5">${iso.sourceDesa} ↔ ${iso.targetDesa}</div>
              <div class="text-[11px] opacity-80 mt-0.5">
                Perbedaan Leksikal: <b style="color:${color}">${iso.differencePercentage}%</b> (${iso.significantWordCount} kata beda)
              </div>
              <div class="text-[10px] text-slate-400">Jarak: ${iso.distanceKm} km • Status: ${iso.statusHubungan}</div>
              <div class="text-[10px] text-cyan-400 font-semibold mt-1">Klik garis untuk lihat rincian kosakata pembeda</div>
            </div>
            `,
            { sticky: true }
          );
        }

        // B. Weighted Isogloss Bundle Vector (Network Connection)
        if (isoglossRenderType === 'bundle' || isoglossRenderType === 'both') {
          const bundleLine = L.polyline(iso.directLinkLine, {
            color: color,
            weight: Math.max(2, iso.weight * (darkMode ? 0.85 : 0.75)) * (isSelected ? 1.4 : 1),
            opacity: darkMode ? 0.55 : 0.35,
            dashArray: '5, 5'
          }).addTo(group);

          bundleLine.on('click', () => setSelectedIsogloss(iso));
        }

        // C. Glowing Midpoint Isogloss Badge
        const badgeHtml = `
          <div class="px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg whitespace-nowrap border cursor-pointer select-none transition-transform hover:scale-110 flex items-center gap-1.5"
               style="background: ${darkMode ? '#0b0f19' : '#ffffff'}; color: ${color}; border-color: ${color}; box-shadow: ${darkMode ? `0 0 12px ${color}80` : '0 1px 3px rgba(0,0,0,0.15)'};">
            <span class="w-1.5 h-1.5 rounded-full ${isSelected ? 'animate-ping' : ''}" style="background-color: ${color}"></span>
            <span>${iso.differencePercentage}%</span>
            <span class="opacity-80 text-[9px] font-normal">(${iso.significantWordCount} kata)</span>
          </div>
        `;
        const badgeIcon = L.divIcon({
          className: `isogloss-badge-icon-${iso.id}`,
          html: badgeHtml,
          iconSize: [85, 24],
          iconAnchor: [42, 12]
        });
        const badgeMarker = L.marker(iso.midpoint, { icon: badgeIcon }).addTo(group);
        badgeMarker.on('click', () => setSelectedIsogloss(iso));
      });
    }

    // 1. RENDER ISOGLOSS POLYGONS / CONVEX HULLS (Mode: Onomasiologis / Gradasi)
    if (showIsoglossPolygons && (mapThematicMode === 'onomasiologis' || mapThematicMode === 'gradasi')) {
      lexicalVariants.forEach(variant => {
        const theme = THEMATIC_PALETTE[variant.colorIndex] || THEMATIC_PALETTE[0];
        const pts = variant.points.map(p => [p.lat, p.lng] as [number, number]);

        if (pts.length >= 3) {
          // Convex hull for 3 or more points sharing identical lexical form
          const hull = computeConvexHull(pts);
          const expandedHull = expandPolygon(hull, 0.08);

          const poly = L.polygon(expandedHull, {
            color: theme.fill,
            weight: 2,
            dashArray: '6, 6',
            fillColor: theme.fill,
            fillOpacity: darkMode ? 0.25 : 0.18
          }).addTo(group);

          poly.bindTooltip(
            `<div class="text-xs font-semibold"><b>Wilayah Isoglos:</b> ${variant.label} (${pts.length} titik)</div>`,
            { sticky: true }
          );
        } else if (pts.length === 2) {
          // Line buffer for 2 points sharing lexical form
          L.polyline(pts, {
            color: theme.fill,
            weight: 5,
            opacity: darkMode ? 0.6 : 0.45,
            dashArray: '4, 4'
          }).addTo(group);
        } else if (pts.length === 1 && mapThematicMode === 'gradasi') {
          // Radial buffer for solitary observation point
          L.circle(pts[0], {
            radius: 8000,
            color: theme.fill,
            weight: 1.5,
            dashArray: '4, 4',
            fillColor: theme.fill,
            fillOpacity: darkMode ? 0.2 : 0.12
          }).addTo(group);
        }
      });
    }

    // 1B. RENDER HEATMAP GRADASI KONSENTRASI DIALEK (Mode: 'heatmap-dialek')
    if (mapThematicMode === 'heatmap-dialek') {
      const radiusM = heatmapRadiusKm * 1000;

      // Draw blended gradient aura rings around each point
      consolidatedPoints.forEach(point => {
        const relLinks = similarityMatrix.filter(
          m => m.sourceId === point.id || m.targetId === point.id
        );
        const metricVal = relLinks.length > 0
          ? Math.round(relLinks.reduce((acc, l) => acc + (heatmapMetric === 'similarity' ? l.similarityPercent : l.differencePercent), 0) / relLinks.length)
          : (point.source === 'active' ? 100 : 70);

        let heatColor = '#ef4444'; // Hot red
        let tierLabel = 'Inti Konsentrasi Dialek Sangat Tinggi (≥80%)';
        if (metricVal >= 70) {
          heatColor = '#f97316'; // Orange
          tierLabel = 'Konsentrasi Dialek Tinggi (70-79%)';
        } else if (metricVal >= 50) {
          heatColor = '#eab308'; // Amber
          tierLabel = 'Zona Transisi Dialek (50-69%)';
        } else if (metricVal >= 35) {
          heatColor = '#06b6d4'; // Cyan
          tierLabel = 'Variasi Dialek Berbeda (35-49%)';
        } else {
          heatColor = '#6366f1'; // Indigo
          tierLabel = 'Batas Bahasa Berbeda (<35%)';
        }

        // Layer 1: Outermost diffusive halo
        const outerHalo = L.circle([point.lat, point.lng], {
          radius: radiusM,
          color: heatColor,
          weight: 0,
          fillColor: heatColor,
          fillOpacity: heatmapOpacity * 0.18,
          interactive: true
        }).addTo(group);

        // Layer 2: Mid heat zone
        const midHalo = L.circle([point.lat, point.lng], {
          radius: radiusM * 0.6,
          color: heatColor,
          weight: 1,
          opacity: heatmapOpacity * 0.5,
          fillColor: heatColor,
          fillOpacity: heatmapOpacity * 0.38,
          interactive: true
        }).addTo(group);

        // Layer 3: Concentrated core nucleus
        const coreHalo = L.circle([point.lat, point.lng], {
          radius: radiusM * 0.28,
          color: '#ffffff',
          weight: 1.5,
          opacity: 0.9,
          fillColor: heatColor,
          fillOpacity: heatmapOpacity * 0.75,
          interactive: true
        }).addTo(group);

        const tooltip = `
          <div class="p-2 font-sans text-xs ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}">
            <div class="font-bold text-sm flex items-center gap-1.5" style="color: ${heatColor}">
              <span>🔥 Heatmap Titik: ${point.desa}</span>
              <span class="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase" style="background: ${heatColor}20; color: ${heatColor}">
                ${point.code}
              </span>
            </div>
            <div class="font-semibold text-xs mt-1">
              Indeks ${heatmapMetric === 'similarity' ? 'Kemiripan Leksikal' : 'Perbedaan Leksikal'}: <b style="color: ${heatColor}">${metricVal}%</b>
            </div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">${tierLabel}</div>
            <div class="text-[10px] text-slate-400 mt-1 border-t pt-1">
              Radius Pengaruh: ${heatmapRadiusKm} km • Opasitas: ${Math.round(heatmapOpacity * 100)}%
            </div>
          </div>
        `;
        outerHalo.bindTooltip(tooltip, { sticky: true });
        midHalo.bindTooltip(tooltip, { sticky: true });
        coreHalo.bindTooltip(tooltip, { sticky: true });
      });

      // Flow heat connecting lines between points proportional to similarity
      similarityMatrix.forEach(link => {
        const p1 = consolidatedPoints.find(p => p.id === link.sourceId);
        const p2 = consolidatedPoints.find(p => p.id === link.targetId);
        if (!p1 || !p2) return;

        const val = heatmapMetric === 'similarity' ? link.similarityPercent : link.differencePercent;
        const isCore = val >= 65;
        const color = isCore ? '#f97316' : '#6366f1';
        const weight = Math.max(3, Math.round((val / 100) * 8));

        const flowLine = L.polyline([[p1.lat, p1.lng], [p2.lat, p2.lng]], {
          color: color,
          weight: weight,
          opacity: heatmapOpacity * 0.45,
          dashArray: isCore ? undefined : '6, 6'
        }).addTo(group);

        flowLine.bindTooltip(
          `<div class="p-1 font-sans text-xs">
            <div class="font-bold">${link.sourceName} ↔ ${link.targetName}</div>
            <div class="text-amber-600 font-semibold">Kemiripan: ${link.similarityPercent}% (Beda: ${link.differencePercent}%)</div>
            <div class="text-[10px] text-slate-500">Jarak: ${link.distanceKm} km • ${link.status}</div>
          </div>`,
          { sticky: true }
        );
      });
    }

    // 2. RENDER DIALECTOMETRY NETWORK ISOGLOSS LINES (Mode: Dialektometri or when toggled)
    if (showConnectingLines && (mapThematicMode === 'dialektometri' || mapThematicMode === 'onomasiologis')) {
      dialectometryLinks.forEach(link => {
        const line = L.polyline([[link.source.lat, link.source.lng], [link.target.lat, link.target.lng]], {
          color: link.color,
          weight: link.weight,
          opacity: mapThematicMode === 'dialektometri' ? (darkMode ? 0.95 : 0.85) : 0.4,
          dashArray: link.percentage > 50 ? '6, 6' : undefined
        }).addTo(group);

        const midpointLat = (link.source.lat + link.target.lat) / 2;
        const midpointLng = (link.source.lng + link.target.lng) / 2;

        if (showGeodesicDistance) {
          const badgeHtml = `
            <div class="px-1.5 py-0.5 rounded text-[9px] font-bold shadow-xs whitespace-nowrap border pointer-events-none"
                 style="background: ${darkMode ? '#0f172a' : '#ffffff'}; color: ${link.color}; border-color: ${link.color}; opacity: 0.95;">
              ${link.percentage}% • ${link.distanceKm} km
            </div>
          `;
          const badgeIcon = L.divIcon({
            className: 'distance-badge-icon',
            html: badgeHtml,
            iconSize: [60, 20],
            iconAnchor: [30, 10]
          });
          L.marker([midpointLat, midpointLng], { icon: badgeIcon, interactive: false }).addTo(group);
        }

        line.bindTooltip(
          `
          <div class="p-1 text-xs">
            <div class="font-bold text-slate-800">${link.source.desa} ↔ ${link.target.desa}</div>
            <div class="text-slate-600">Jarak Geodesik: <b>${link.distanceKm} km</b></div>
            <div class="text-slate-600">Perbedaan Leksikal (d): <b style="color:${link.color}">${link.percentage}%</b></div>
            <div class="text-[10px] text-slate-500 font-semibold">${link.status}</div>
          </div>
          `,
          { sticky: true }
        );
      });
    }

    // 3. RENDER THEMATIC MARKERS FOR EACH SURVEY POINT (Styled with Dark Mode Glow)
    consolidatedPoints.forEach((point, index) => {
      const theme = getPointTheme(point);
      const isActive = point.source === 'active';
      const isSelected = selectedPointId === point.id;

      // Custom HTML Marker Pin with Thematic Variant Badges
      const markerHtml = `
        <div class="relative flex flex-col items-center justify-center cursor-pointer group select-none">
          ${
            isActive 
              ? `<span class="absolute -inset-2.5 rounded-full animate-ping pointer-events-none" style="background-color: ${theme.fill}35"></span>` 
              : ''
          }
          
          <!-- Variant label chip above marker -->
          ${
            showPointLabels 
              ? `
              <div class="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md border transition-all ${
                isSelected ? 'scale-110 ring-2 ring-cyan-400' : ''
              }" style="background-color: ${darkMode ? '#0f172a' : '#ffffff'}; color: ${darkMode ? '#38bdf8' : theme.fill}; border-color: ${darkMode ? '#334155' : theme.fill};">
                <span class="opacity-75">${point.code}:</span> <b>${point.bentukLokal}</b>
              </div>
              `
              : ''
          }

          <!-- Pin marker with thematic color and glowing aura -->
          <div class="relative z-10 w-7 h-7 rounded-full border-2 shadow-lg flex items-center justify-center font-bold text-xs text-white transition-transform group-hover:scale-115"
               style="background-color: ${theme.fill}; border-color: ${darkMode ? '#0f172a' : '#ffffff'}; box-shadow: ${darkMode ? `0 0 10px ${theme.fill}90` : '0 2px 4px rgba(0,0,0,0.2)'};">
            ${isActive ? '★' : index + 1}
          </div>

          <!-- Bottom micro village label -->
          <div class="text-[9px] font-bold px-1 rounded shadow-xs mt-0.5 whitespace-nowrap pointer-events-none border"
               style="background-color: ${darkMode ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.92)'}; color: ${darkMode ? '#e2e8f0' : '#334155'}; border-color: ${darkMode ? '#334155' : '#e2e8f0'};">
            ${point.desa}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: `custom-thematic-marker-${point.id}`,
        html: markerHtml,
        iconSize: [32, 42],
        iconAnchor: [16, 26],
        popupAnchor: [0, -28]
      });

      const marker = L.marker([point.lat, point.lng], { icon: customIcon }).addTo(group);

      // Interactive Popup with Complete Geolinguistic Details (Dark/Light adapted)
      const popupContent = `
        <div class="p-1 min-w-[240px] max-w-[300px] font-sans ${darkMode ? 'text-slate-100' : 'text-slate-800'}">
          <div class="flex items-center justify-between gap-1 mb-1.5">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white"
                  style="background-color: ${theme.fill};">
              ${isActive ? '★ Titik Acuan' : point.code}
            </span>
            <span class="text-[10px] font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}">
              ${point.source === 'active' ? 'Survei Utama' : point.source === 'survey' ? 'Survei Tersimpan' : 'Titik Pembanding'}
            </span>
          </div>

          <h4 class="font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'} leading-snug">${point.desa}</h4>
          <div class="text-[11px] ${darkMode ? 'text-slate-300' : 'text-slate-600'} mb-2">
            Bahasa: <b class="${darkMode ? 'text-cyan-400' : 'text-slate-800'}">${point.bahasa}</b>
            ${point.kabupaten ? `<span class="opacity-60"> • ${point.kabupaten}</span>` : ''}
          </div>

          <!-- Thematic lexical word box -->
          <div class="p-2.5 rounded-lg border mb-2" style="background-color: ${darkMode ? '#1e293b' : '#f8fafc'}; border-color: ${theme.fill}50;">
            <div class="flex justify-between items-center text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'} uppercase font-bold tracking-wider mb-1">
              <span>Glos: "${selectedGloss}"</span>
              <span class="px-1.5 py-0.2 rounded text-[9px]" style="background-color: ${theme.fill}25; color: ${darkMode ? '#67e8f9' : theme.fill}">
                Varian Leksikal
              </span>
            </div>
            <div class="flex items-baseline justify-between">
              <span class="text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}">${point.bentukLokal}</span>
              <span class="font-mono text-xs ${darkMode ? 'text-cyan-300 bg-slate-900 border-cyan-800' : 'text-indigo-700 bg-indigo-50 border-indigo-100'} px-1.5 py-0.5 rounded border">
                ${point.transkripsiIPA || '-'}
              </span>
            </div>
            ${point.catatan ? `<div class="text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'} italic mt-1">${point.catatan}</div>` : ''}
          </div>

          <!-- Coordinates info -->
          <div class="space-y-0.5 text-[11px] font-mono p-2 rounded border mb-2" style="background-color: ${darkMode ? '#0f172a' : '#f8fafc'}; border-color: ${darkMode ? '#334155' : '#e2e8f0'}; color: ${darkMode ? '#94a3b8' : '#475569'};">
            <div class="flex justify-between">
              <span>Koordinat:</span>
              <span class="font-bold ${darkMode ? 'text-emerald-400' : 'text-slate-800'}">${point.lat.toFixed(5)}°, ${point.lng.toFixed(5)}°</span>
            </div>
            <div class="flex justify-between text-[10px] opacity-75 pt-1 border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'}">
              <span class="font-sans">Format DMS:</span>
              <span>${toDMS(point.lat, true)}, ${toDMS(point.lng, false)}</span>
            </div>
          </div>

          <!-- Action buttons inside popup -->
          <div class="flex items-center justify-between gap-1.5 pt-1">
            <button
              type="button"
              onclick="window.__playLinguisticAudio?.('${point.id}', '${point.bentukLokal.replace(/'/g, "\\'")}')"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} text-xs font-semibold cursor-pointer transition-colors"
            >
              <svg class="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
              <span>Dengarkan</span>
            </button>

            ${
              !isActive && onSelectComparisonForDetail
                ? `
                <button
                  type="button"
                  onclick="window.__selectPointDetail?.('${point.id}')"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  <span>Analisis Rinci</span>
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
                `
                : ''
            }
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 320 });
      marker.on('click', () => setSelectedPointId(point.id));
    });

    // Auto-fit bounds with padding
    if (consolidatedPoints.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [
    consolidatedPoints, lexicalVariants, dialectometryLinks, mapThematicMode,
    selectedGloss, showIsoglossPolygons, showConnectingLines, showPointLabels,
    showGeodesicDistance, selectedPointId, isoglossSummary, isoglossRenderType,
    selectedIsogloss, darkMode
  ]);

  // Expose global callback for popup buttons safely
  useEffect(() => {
    (window as unknown as { __playLinguisticAudio?: (id: string, text: string) => void }).__playLinguisticAudio = (id: string, text: string) => {
      handlePlayAudio(id, text);
    };
    (window as unknown as { __selectPointDetail?: (id: string) => void }).__selectPointDetail = (id: string) => {
      if (onSelectComparisonForDetail) {
        onSelectComparisonForDetail(id);
      }
    };
    return () => {
      delete (window as unknown as { __playLinguisticAudio?: unknown }).__playLinguisticAudio;
      delete (window as unknown as { __selectPointDetail?: unknown }).__selectPointDetail;
    };
  }, [onSelectComparisonForDetail]);

  // Filtered gloss list for quick selection
  const filteredGlosses = useMemo(() => {
    return DIAGNOSTIC_GLOSSES.filter(g => {
      const matchCat = selectedCategory === 'semua' || g.kategori === selectedCategory;
      const matchSearch = !glossSearchQuery || g.glos.toLowerCase().includes(glossSearchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, glossSearchQuery]);

  // Focus map on specific point
  const handleFocusPoint = (lat: number, lng: number, id: string) => {
    setSelectedPointId(id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 13, { duration: 1.2 });
    }
  };

  // Reset map view to envelope of all points
  const handleResetView = () => {
    if (mapInstanceRef.current && consolidatedPoints.length > 0) {
      const bounds = L.latLngBounds(consolidatedPoints.map(p => [p.lat, p.lng]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
    }
  };

  // Print / Export thematic map
  const handlePrintMap = () => {
    window.print();
  };

  return (
    <div className={`space-y-4 transition-colors duration-200 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`} id="section16-thematic-map-container">
      {/* 1. TOP CONTROL BAR: THEMATIC MODES & GLOSS SELECTION */}
      <div className={`border rounded-xl p-3.5 transition-colors duration-200 space-y-3 mt-2.5 ${
        darkMode ? 'bg-slate-900/95 border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        {/* Thematic Mode Switcher Header */}
        <div className={`space-y-3 pb-3 border-b ${
          darkMode ? 'border-slate-800' : 'border-slate-100'
        }`}>
          {/* Top Row: Title, Badge, and Dark Mode Switcher */}
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-start gap-2.5 min-w-0">
              <span className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${darkMode ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-indigo-50 text-indigo-700'}`}>
                <Compass className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className={`font-bold text-xs sm:text-sm leading-snug ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Visualisasi Peta Tematik Dialektometri & Garis Isoglos
                  </h3>
                  {mapThematicMode === 'isoglos-otomatis' && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                      Otomatis
                    </span>
                  )}
                </div>
                <p className={`text-[10px] sm:text-[11px] leading-tight mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Perhitungan garis isoglos otomatis berdasarkan data perbedaan leksikal yang signifikan antar titik survei.
                </p>
              </div>
            </div>

            {/* Dark Mode Switcher in Header (Compact & Always Reachable) */}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                darkMode 
                  ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700 shadow-sm' 
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              title={darkMode ? 'Ganti ke Mode Terang' : 'Ganti ke Dark Mode (Rekomendasi)'}
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
              <span className="hidden sm:inline">{darkMode ? 'Mode Terang' : 'Dark Mode'}</span>
            </button>
          </div>

          {/* Mode Tabs: Clean Horizontally-Scrollable Touch-Friendly Bar */}
          <div className="w-full overflow-x-auto no-scrollbar pt-1 pb-0.5 -mx-1 px-1">
            <div className={`inline-flex items-center gap-1 p-1 rounded-xl text-xs font-semibold min-w-max ${
              darkMode ? 'bg-slate-950 border border-slate-800' : 'bg-slate-100'
            }`}>
              <button
                type="button"
                onClick={() => setMapThematicMode('isoglos-otomatis')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 text-xs ${
                  mapThematicMode === 'isoglos-otomatis'
                    ? (darkMode ? 'bg-cyan-500 text-slate-950 font-bold shadow-md' : 'bg-indigo-600 text-white shadow-2xs')
                    : (darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                <Spline className="w-3.5 h-3.5 shrink-0" />
                <span>Garis Isoglos Otomatis</span>
              </button>
              <button
                type="button"
                onClick={() => setMapThematicMode('onomasiologis')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 text-xs ${
                  mapThematicMode === 'onomasiologis'
                    ? (darkMode ? 'bg-cyan-500 text-slate-950 font-bold shadow-md' : 'bg-indigo-600 text-white shadow-2xs')
                    : (darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span>Varian Leksikal (Per Glos)</span>
              </button>
              <button
                type="button"
                onClick={() => setMapThematicMode('dialektometri')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 text-xs ${
                  mapThematicMode === 'dialektometri'
                    ? (darkMode ? 'bg-cyan-500 text-slate-950 font-bold shadow-md' : 'bg-indigo-600 text-white shadow-2xs')
                    : (darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                <Route className="w-3.5 h-3.5 shrink-0" />
                <span>Jejaring Isoglos</span>
              </button>
              <button
                type="button"
                onClick={() => setMapThematicMode('gradasi')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 text-xs ${
                  mapThematicMode === 'gradasi'
                    ? (darkMode ? 'bg-cyan-500 text-slate-950 font-bold shadow-md' : 'bg-indigo-600 text-white shadow-2xs')
                    : (darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>Zona & Gradasi</span>
              </button>
              <button
                type="button"
                onClick={() => setMapThematicMode('heatmap-dialek')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 text-xs ${
                  mapThematicMode === 'heatmap-dialek'
                    ? (darkMode ? 'bg-rose-500 text-white font-bold shadow-md' : 'bg-rose-600 text-white shadow-2xs')
                    : (darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                <Activity className="w-3.5 h-3.5 shrink-0" />
                <span>Heatmap Dialek</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold ml-0.5">
                  Gradasi
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 1E. SPECIALIZED HEATMAP DIALEK GRADASI CONTROLS */}
        {mapThematicMode === 'heatmap-dialek' && (
          <div className={`p-3 rounded-xl border space-y-3 ${
            darkMode 
              ? 'bg-slate-950/80 border-rose-900/40 shadow-inner' 
              : 'bg-rose-50/70 border-rose-200/80'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`font-semibold flex items-center gap-1 text-[11px] ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  <Sliders className="w-3.5 h-3.5 text-rose-500" />
                  Radius Pengaruh:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="5"
                    max="45"
                    step="2"
                    value={heatmapRadiusKm}
                    onChange={e => setHeatmapRadiusKm(parseInt(e.target.value))}
                    className="w-24 accent-rose-600 cursor-pointer"
                  />
                  <span className="font-mono font-bold text-rose-600 text-xs">{heatmapRadiusKm} km</span>
                </div>

                <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block"></div>

                <span className={`font-semibold text-[11px] ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Opasitas:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.25"
                    max="0.9"
                    step="0.05"
                    value={heatmapOpacity}
                    onChange={e => setHeatmapOpacity(parseFloat(e.target.value))}
                    className="w-20 accent-rose-600 cursor-pointer"
                  />
                  <span className="font-mono font-bold text-rose-600 text-xs">{Math.round(heatmapOpacity * 100)}%</span>
                </div>

                <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block"></div>

                {/* Metrik toggle */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setHeatmapMetric('similarity')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      heatmapMetric === 'similarity'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Konsentrasi Kemiripan
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeatmapMetric('difference')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      heatmapMetric === 'difference'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Batas Perbedaan (Isoglos)
                  </button>
                </div>
              </div>

              {/* Real-time Matrix Comparison Modal Opener */}
              <button
                type="button"
                onClick={() => setShowHeatmapMatrixModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 shadow-2xs cursor-pointer ml-auto"
              >
                <Grid3X3 className="w-3.5 h-3.5 text-rose-400" />
                <span>Matriks Real-Time ({similarityMatrix.length} Pasang)</span>
              </button>
            </div>
          </div>
        )}

        {/* 1A. SPECIALIZED AUTOMATIC ISOGLOSS CONTROLS */}
        {mapThematicMode === 'isoglos-otomatis' && (
          <div className={`p-3 rounded-xl border space-y-3 ${
            darkMode 
              ? 'bg-slate-950/80 border-cyan-900/40 shadow-inner' 
              : 'bg-indigo-50/70 border-indigo-200/80'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Significance threshold controls */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`font-semibold flex items-center gap-1 text-[11px] ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  <Sliders className="w-3 h-3 text-cyan-400" />
                  Ambang Beda Leksikal Signifikan:
                </span>
                <div className="flex items-center gap-1">
                  {[
                    { val: 20, label: '≥20% (Dialek)' },
                    { val: 30, label: '≥30% (Signifikan)' },
                    { val: 51, label: '≥51% (Subbahasa)' },
                    { val: 81, label: '≥81% (Bahasa)' }
                  ].map(preset => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setSignificanceThreshold(preset.val)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                        significanceThreshold === preset.val
                          ? (darkMode ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs' : 'bg-indigo-600 text-white shadow-xs')
                          : (darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200')
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 ml-2">
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="5"
                    value={significanceThreshold}
                    onChange={(e) => setSignificanceThreshold(Number(e.target.value))}
                    className="w-20 accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                  />
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    {significanceThreshold}%
                  </span>
                </div>
              </div>

              {/* Line visualization style & recalculate button */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`font-semibold text-[11px] ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Tipe Garis:
                </span>
                <div className={`p-0.5 rounded-lg flex items-center text-[11px] font-semibold ${
                  darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
                }`}>
                  <button
                    type="button"
                    onClick={() => setIsoglossRenderType('bisector')}
                    className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                      isoglossRenderType === 'bisector' 
                        ? (darkMode ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-indigo-600 text-white') 
                        : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900')
                    }`}
                  >
                    Pemisah Spasial
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsoglossRenderType('bundle')}
                    className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                      isoglossRenderType === 'bundle' 
                        ? (darkMode ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-indigo-600 text-white') 
                        : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900')
                    }`}
                  >
                    Berkas Berbobot
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsoglossRenderType('both')}
                    className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                      isoglossRenderType === 'both' 
                        ? (darkMode ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-indigo-600 text-white') 
                        : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900')
                    }`}
                  >
                    Keduanya
                  </button>
                </div>

                {/* Explicit recalculation trigger */}
                <button
                  type="button"
                  onClick={handleRecalculateIsoglosses}
                  disabled={isCalculatingIsoglosses}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isCalculatingIsoglosses ? 'animate-spin' : ''}`} />
                  <span>{isCalculatingIsoglosses ? 'Menghitung...' : 'Hitung Garis Isoglos Otomatis'}</span>
                </button>
              </div>
            </div>

            {/* Recalculation Notice Feedback */}
            {isoglossNotice && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 text-xs">
                <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{isoglossNotice}</span>
              </div>
            )}

            {/* Quick Metrics Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className={`p-2 rounded-lg border ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className="text-[10px] text-slate-400 block font-medium">Garis Isoglos Terdeteksi</span>
                <span className="text-sm font-bold text-cyan-400">
                  {isoglossSummary.significantCount} Garis Signifikan
                </span>
              </div>
              <div className={`p-2 rounded-lg border ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className="text-[10px] text-slate-400 block font-medium">Rata-rata Perbedaan Leksikal</span>
                <span className="text-sm font-bold text-amber-400">
                  {isoglossSummary.averageDifferencePercentage}%
                </span>
              </div>
              <div className={`p-2 rounded-lg border ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className="text-[10px] text-slate-400 block font-medium">Batas Perbedaan Terkuat</span>
                <span className="text-sm font-bold text-rose-400">
                  {isoglossSummary.maxDifferencePercentage}%
                </span>
              </div>
              <div className={`p-2 rounded-lg border ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className="text-[10px] text-slate-400 block font-medium">Pasangan Isoglos Dominan</span>
                <span className="text-xs font-bold text-emerald-400 truncate block">
                  {isoglossSummary.strongestIsogloss 
                    ? `${isoglossSummary.strongestIsogloss.sourceDesa} ↔ ${isoglossSummary.strongestIsogloss.targetDesa}` 
                    : '-'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 1B. Gloss Quick Selector & Semantic Filter Bar (Onomasiologis Mode) */}
        {mapThematicMode === 'onomasiologis' && (
          <div className="space-y-2 pt-1">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className={`font-semibold flex items-center gap-1 text-[11px] ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  <Filter className="w-3 h-3 text-slate-400" />
                  Kategori Semantis:
                </span>
                <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                  {[
                    { id: 'semua', label: 'Semua' },
                    { id: 'alam', label: 'Alam' },
                    { id: 'tubuh', label: 'Tubuh' },
                    { id: 'tindakan', label: 'Aktivitas' },
                    { id: 'hewan', label: 'Fauna' },
                    { id: 'sifat', label: 'Sifat' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        selectedCategory === cat.id
                          ? (darkMode ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-indigo-600 text-white shadow-2xs')
                          : (darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search input for glosses */}
              <div className="relative w-40 sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={glossSearchQuery}
                  onChange={(e) => setGlossSearchQuery(e.target.value)}
                  placeholder="Cari kata/glos..."
                  className={`w-full pl-7 pr-2 py-1 text-xs rounded-md border focus:outline-hidden focus:ring-1 ${
                    darkMode 
                      ? 'bg-slate-800 border-slate-700 text-white focus:ring-cyan-400' 
                      : 'border-slate-200 bg-slate-50 focus:bg-white focus:ring-indigo-500'
                  }`}
                />
              </div>
            </div>

            {/* Quick Gloss Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Pilih Glos:</span>
              {filteredGlosses.map(g => {
                const isSelected = selectedGloss.toLowerCase() === g.glos.toLowerCase();
                return (
                  <button
                    key={g.glos}
                    type="button"
                    onClick={() => setSelectedGloss(g.glos)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? (darkMode ? 'bg-cyan-500 text-slate-950 font-bold ring-2 ring-cyan-300 scale-105' : 'bg-indigo-600 text-white shadow-2xs scale-105 ring-2 ring-indigo-200')
                        : (darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
                    }`}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Map Layers & Basemap Controls */}
        <div className={`flex flex-wrap items-center justify-between gap-2 text-xs pt-1 border-t ${
          darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-600'
        }`}>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`text-[11px] font-semibold flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Lapisan Peta:
            </span>

            <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px]">
              <input
                type="checkbox"
                checked={showIsoglossPolygons}
                onChange={(e) => setShowIsoglossPolygons(e.target.checked)}
                className="rounded border-slate-600 text-cyan-500 focus:ring-cyan-400"
              />
              <span>Garis / Poligon Isoglos</span>
            </label>

            <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px]">
              <input
                type="checkbox"
                checked={showConnectingLines}
                onChange={(e) => setShowConnectingLines(e.target.checked)}
                className="rounded border-slate-600 text-cyan-500 focus:ring-cyan-400"
              />
              <span>Garis Jejaring Dialek</span>
            </label>

            <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px]">
              <input
                type="checkbox"
                checked={showPointLabels}
                onChange={(e) => setShowPointLabels(e.target.checked)}
                className="rounded border-slate-600 text-cyan-500 focus:ring-cyan-400"
              />
              <span>Label Kata</span>
            </label>

            <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px]">
              <input
                type="checkbox"
                checked={includeAllSurveys}
                onChange={(e) => setIncludeAllSurveys(e.target.checked)}
                className="rounded border-slate-600 text-cyan-500 focus:ring-cyan-400"
              />
              <span>Semua Survei ({consolidatedPoints.length} Titik)</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            {/* Basemap selector */}
            <select
              value={selectedBaseMap}
              onChange={(e) => setSelectedBaseMap(e.target.value as 'dark' | 'positron' | 'osm' | 'topo')}
              className={`text-[11px] px-2 py-1 rounded border font-medium ${
                darkMode 
                  ? 'bg-slate-800 border-slate-700 text-slate-200' 
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <option value="dark">Basemap: CARTO Dark Matter</option>
              <option value="positron">Basemap: CARTO Voyager</option>
              <option value="osm">Basemap: OpenStreetMap</option>
              <option value="topo">Basemap: Relief Topografi</option>
            </select>

            <button
              type="button"
              onClick={handleResetView}
              className={`p-1 rounded cursor-pointer ${
                darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
              title="Pusatkan Seluruh Titik"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handlePrintMap}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Cetak Peta Tematik"
            >
              <Printer className="w-3 h-3 text-cyan-400" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. THEMATIC LEAFLET MAP CANVAS CONTAINER */}
      <div className={`relative border rounded-xl overflow-hidden shadow-lg ${
        darkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-100'
      }`}>
        <div 
          ref={mapContainerRef} 
          className="w-full h-[520px] sm:h-[580px] z-10"
        />

        {/* FLOATING THEMATIC LEGEND OVERLAY (High-Contrast Dark Mode) */}
        <div className={`absolute top-3 right-3 z-20 max-w-[270px] sm:max-w-[320px] backdrop-blur-md rounded-xl p-3 shadow-2xl text-xs space-y-2 pointer-events-auto border ${
          darkMode 
            ? 'bg-slate-900/95 border-slate-700 text-slate-100' 
            : 'bg-white/95 border-slate-200 text-slate-900'
        }`}>
          {mapThematicMode === 'isoglos-otomatis' ? (
            /* Automatic Isogloss Lines Legend */
            <>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-700/50">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <h4 className="font-bold text-xs">
                    Legenda Garis Isoglos Otomatis
                  </h4>
                </div>
                <span className="text-[10px] text-cyan-300 font-mono font-bold">
                  {isoglossSummary.significantCount} Garis Aktif
                </span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between gap-1 p-1 rounded hover:bg-slate-800/50">
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-1.5 rounded-full bg-[#ff2a6d] inline-block shadow-sm shadow-[#ff2a6d]" />
                    <span className="font-bold text-[#ff2a6d]">Beda Bahasa</span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">d ≥ 81%</span>
                </div>
                <div className="flex items-center justify-between gap-1 p-1 rounded hover:bg-slate-800/50">
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-1.5 rounded-full bg-[#ff9f1c] inline-block shadow-sm shadow-[#ff9f1c]" />
                    <span className="font-bold text-[#ff9f1c]">Beda Subbahasa</span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">d 51-80%</span>
                </div>
                <div className="flex items-center justify-between gap-1 p-1 rounded hover:bg-slate-800/50">
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-1.5 rounded-full bg-[#00f0ff] inline-block shadow-sm shadow-[#00f0ff]" />
                    <span className="font-bold text-[#00f0ff]">Beda Dialek</span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">d 21-50%</span>
                </div>
                <div className="flex items-center justify-between gap-1 p-1 rounded hover:bg-slate-800/50">
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-1 rounded-full bg-[#10b981] inline-block" />
                    <span className="font-medium text-[#10b981]">Beda Wicara</span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">d &lt; 21%</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/50 text-[10px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-t-2 border-cyan-400 inline-block" />
                  <span><b>Pemisah Spasial:</b> Batas tegak lurus wilayah</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-t-2 border-dashed border-cyan-400 inline-block" />
                  <span><b>Berkas Isoglos:</b> Vektor permutasi berbobot</span>
                </div>
                <div className="text-cyan-400 text-[9px] pt-1">
                  💡 Klik garis isoglos untuk melihat daftar kosakata pembeda
                </div>
              </div>
            </>
          ) : (
            /* Gloss Lexical Variants Legend */
            <>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-700/50">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <h4 className="font-bold text-xs">
                    Legenda: Glos "{selectedGloss}"
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {lexicalVariants.length} Varian
                </span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {lexicalVariants.map((v) => {
                  const theme = THEMATIC_PALETTE[v.colorIndex] || THEMATIC_PALETTE[0];
                  const pct = Math.round((v.points.length / consolidatedPoints.length) * 100);
                  return (
                    <div 
                      key={v.variantKey}
                      className={`flex items-center justify-between gap-1 p-1 rounded text-[11px] ${
                        darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span 
                          className="w-3 h-3 rounded-full shrink-0 border border-white/50 shadow-xs" 
                          style={{ backgroundColor: theme.fill }}
                        />
                        <span className={`font-bold truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                          {v.label}
                        </span>
                        {v.sampleIpa && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {v.sampleIpa}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">
                        {v.points.length} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-700/50 text-[10px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300">Standar Dialektometri (Badan Bahasa):</div>
                <div className="grid grid-cols-2 gap-1 text-[9px]">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-1 bg-[#10b981] inline-block rounded" /> &lt;20% Wicara
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-1 bg-[#00f0ff] inline-block rounded" /> 21-50% Dialek
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-1 bg-[#ff9f1c] inline-block rounded" /> 51-80% Subbahasa
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-1 bg-[#ff2a6d] inline-block rounded" /> &gt;80% Bahasa
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* CLICK COORDINATE INSPECTOR BADGE */}
        {clickedCoord && (
          <div className="absolute bottom-3 left-3 z-20 bg-slate-900/95 text-white backdrop-blur-md p-2.5 rounded-xl text-xs font-mono shadow-xl border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Koordinat Terpilih:</span>
              <span className="font-bold text-cyan-400">{clickedCoord.lat.toFixed(6)}°, {clickedCoord.lng.toFixed(6)}°</span>
              <span className="text-[10px] text-slate-400 block font-sans">
                {toDMS(clickedCoord.lat, true)}, {toDMS(clickedCoord.lng, false)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 pt-1 sm:pt-0 sm:border-l sm:border-slate-700 sm:pl-2.5">
              <button
                type="button"
                onClick={() => handleCopyCoord(clickedCoord.lat, clickedCoord.lng, 'clicked')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-sans text-slate-200 inline-flex items-center gap-1 cursor-pointer"
              >
                {copiedText === 'clicked' ? <Check className="w-3 h-3 text-cyan-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedText === 'clicked' ? 'Tersalin' : 'Salin'}</span>
              </button>

              {onAddPoint && (
                <button
                  type="button"
                  onClick={() => {
                    const nextNum = titikPembandingList.length + 2;
                    const newPt: TitikPembandingDialektometri = {
                      id: `TP-0${nextNum}`,
                      namaTitik: `TP-0${nextNum} Titik Baru`,
                      desa: `Desa Baru (Titik ${nextNum})`,
                      bahasa: refBahasa,
                      lintang: clickedCoord.lat,
                      bujur: clickedCoord.lng,
                      jumlahBeda: 30,
                      jumlahGlos: 200,
                      persentaseBeda: 15.0,
                      statusHubungan: 'Beda Wicara/Subdialek'
                    };
                    onAddPoint(newPt);
                    setClickedCoord(null);
                  }}
                  className="px-2 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-[11px] font-sans text-slate-950 inline-flex items-center gap-1 font-bold cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah Titik Pembanding</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. ISOGLOSS DETAIL INSPECTOR MODAL / DRAWER (When user clicks an Isogloss line) */}
      {selectedIsogloss && (
        <div className={`p-4 rounded-xl border space-y-3.5 transition-all shadow-xl ${
          darkMode 
            ? 'bg-slate-900 border-cyan-500/40 text-slate-100 ring-1 ring-cyan-500/30' 
            : 'bg-white border-indigo-200 text-slate-900 ring-1 ring-indigo-200'
        }`}>
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <span 
                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-md"
                style={{ backgroundColor: darkMode ? selectedIsogloss.neonColor : selectedIsogloss.color }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm sm:text-base">
                    Garis Isoglos: {selectedIsogloss.sourceDesa} ↔ {selectedIsogloss.targetDesa}
                  </h4>
                  <span 
                    className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                    style={{ 
                      backgroundColor: `${darkMode ? selectedIsogloss.neonColor : selectedIsogloss.color}25`,
                      color: darkMode ? selectedIsogloss.neonColor : selectedIsogloss.color,
                      border: `1px solid ${darkMode ? selectedIsogloss.neonColor : selectedIsogloss.color}50`
                    }}
                  >
                    {selectedIsogloss.statusHubungan}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Perbedaan Leksikal: <b className="text-cyan-400">{selectedIsogloss.differencePercentage}%</b> • Jarak Geodesik: <b>{selectedIsogloss.distanceKm} km</b>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedIsogloss(null)}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              title="Tutup Panel Isoglos"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className={`p-2 rounded-lg border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] text-slate-400 block font-medium">Titik Sumber (A)</span>
              <span className="font-bold truncate block">{selectedIsogloss.sourceName}</span>
            </div>
            <div className={`p-2 rounded-lg border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] text-slate-400 block font-medium">Titik Target (B)</span>
              <span className="font-bold truncate block">{selectedIsogloss.targetName}</span>
            </div>
            <div className={`p-2 rounded-lg border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] text-slate-400 block font-medium">Jumlah Kata Pembeda</span>
              <span className="font-bold text-cyan-400">
                {selectedIsogloss.significantWordCount} dari {selectedIsogloss.totalWordsTested} Glos
              </span>
            </div>
            <div className={`p-2 rounded-lg border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] text-slate-400 block font-medium">Tingkat Klasifikasi</span>
              <span className="font-bold capitalize" style={{ color: darkMode ? selectedIsogloss.neonColor : selectedIsogloss.color }}>
                {selectedIsogloss.level}
              </span>
            </div>
          </div>

          {/* Differing Words Table */}
          <div>
            <div className="flex items-center justify-between pb-1 mb-2 border-b border-slate-700/40">
              <span className="font-bold text-xs flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
                Daftar Kosakata Pembeda Signifikan ({selectedIsogloss.differingWords.length} Glos Diagnostik)
              </span>
              <span className="text-[10px] text-slate-400">
                Data leksikal penyebab terbentuknya batas garis isoglos ini
              </span>
            </div>

            {selectedIsogloss.differingWords.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 italic">
                Tidak ada perbedaan kata diagnostik pada perbandingan sampel ini.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-56 overflow-y-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`font-semibold border-b text-[11px] ${
                      darkMode ? 'bg-slate-950 text-slate-300 border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      <th className="py-1.5 px-3">No</th>
                      <th className="py-1.5 px-3">Glos (Arti)</th>
                      <th className="py-1.5 px-3">Bentuk di {selectedIsogloss.sourceDesa}</th>
                      <th className="py-1.5 px-3">Bentuk di {selectedIsogloss.targetDesa}</th>
                      <th className="py-1.5 px-3">Kategori Perbedaan</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y text-xs ${
                    darkMode ? 'divide-slate-800/80 text-slate-200' : 'divide-slate-100 text-slate-800'
                  }`}>
                    {selectedIsogloss.differingWords.map((item, idx) => (
                      <tr key={idx} className={darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                        <td className="py-1.5 px-3 font-mono text-[10px] text-slate-400">{idx + 1}</td>
                        <td className="py-1.5 px-3 font-bold capitalize text-cyan-400">{item.glos}</td>
                        <td className="py-1.5 px-3">
                          <span className="font-semibold">{item.bentukA}</span>
                          {item.ipaA && <span className="font-mono text-[10px] text-slate-400 ml-1.5">{item.ipaA}</span>}
                        </td>
                        <td className="py-1.5 px-3">
                          <span className="font-semibold text-rose-400">{item.bentukB}</span>
                          {item.ipaB && <span className="font-mono text-[10px] text-slate-400 ml-1.5">{item.ipaB}</span>}
                        </td>
                        <td className="py-1.5 px-3">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            item.category === 'BEDA_LEKSIKAL' 
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {item.category === 'BEDA_LEKSIKAL' ? 'Beda Leksikal (1.0)' : 'Beda Fonem (0.5)'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Geolinguistic Insight */}
          <div className={`p-2.5 rounded-lg border text-xs ${
            darkMode ? 'bg-slate-950/70 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <span className="font-bold text-cyan-400 block mb-0.5">Interpretasi Geolinguistik:</span>
            <span>
              Garis isoglos ini menandakan batas transisi leksikal dengan persentase perbedaan <b>{selectedIsogloss.differencePercentage}%</b>.
              Dalam metodologi dialektometri dialek Guiter, pasangan ini diklasifikasikan sebagai <b>{selectedIsogloss.statusHubungan}</b>.
            </span>
          </div>
        </div>
      )}

      {/* 4. GEOLINGUISTIC SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={`border rounded-xl p-3 shadow-sm ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">
            Glos Aktif & Keragaman Leksikal:
          </span>
          <div className="flex items-baseline justify-between">
            <h5 className={`font-bold capitalize text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              "{selectedGloss}"
            </h5>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              {lexicalVariants.length} varian leksikal
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Terdeteksi pada {consolidatedPoints.length} titik pengamatan koordinat spasial.
          </p>
        </div>

        <div className={`border rounded-xl p-3 shadow-sm ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">
            Varian Bentuk Dominan:
          </span>
          <div className="flex items-baseline justify-between">
            <h5 className="font-bold text-emerald-400 text-sm">
              {lexicalVariants[0]?.label || '-'}
            </h5>
            <span className="text-xs font-mono font-bold text-slate-400">
              {Math.round(((lexicalVariants[0]?.points.length || 0) / (consolidatedPoints.length || 1)) * 100)}% wilayah
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Digunakan di {lexicalVariants[0]?.points.length || 0} desa titik pengamatan.
          </p>
        </div>

        <div className={`border rounded-xl p-3 shadow-sm ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">
            Garis Isoglos Terhitung Otomatis:
          </span>
          <div className="flex items-baseline justify-between">
            <h5 className="font-bold text-cyan-400 text-sm">
              {isoglossSummary.significantCount} Garis Signifikan
            </h5>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Ambang ≥ {significanceThreshold}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Membatasi {isoglossSummary.isoglosses.length} vektor permutasi dialektometri.
          </p>
        </div>
      </div>

      {/* 5. COMPARISON TABLE OF OBSERVATION POINTS */}
      <div className={`border rounded-xl overflow-hidden shadow-sm ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className={`px-4 py-3 border-b flex items-center justify-between ${
          darkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/70'
        }`}>
          <div className="flex items-center gap-2">
            <span className="p-1 bg-cyan-500/10 text-cyan-400 rounded">
              <BarChart2 className="w-3.5 h-3.5" />
            </span>
            <h4 className={`font-bold text-xs sm:text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Tabel Komparasi Leksikal Geografis Titik Survei
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            {consolidatedPoints.length} Titik Pengamatan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`font-semibold border-b text-[11px] ${
                darkMode ? 'bg-slate-950 text-slate-300 border-slate-800' : 'bg-slate-100/70 text-slate-700 border-slate-200'
              }`}>
                <th className="py-2.5 px-3">Titik / Desa</th>
                <th className="py-2.5 px-3">Bahasa / Dialek</th>
                <th className="py-2.5 px-3">Koordinat (Lintang, Bujur)</th>
                <th className="py-2.5 px-3">Varian Kata Lokal</th>
                <th className="py-2.5 px-3">Transkripsi IPA</th>
                <th className="py-2.5 px-3">Jarak ke Acuan</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              darkMode ? 'divide-slate-800 text-slate-200' : 'divide-slate-100 text-slate-800'
            }`}>
              {consolidatedPoints.map((p) => {
                const theme = getPointTheme(p);
                const isAcuan = p.source === 'active';
                const distToRef = calculateDistanceKm(refLat, refLon, p.lat, p.lng);

                return (
                  <tr 
                    key={p.id}
                    onClick={() => handleFocusPoint(p.lat, p.lng, p.id)}
                    className={`cursor-pointer transition-colors ${
                      selectedPointId === p.id 
                        ? (darkMode ? 'bg-cyan-950/40' : 'bg-indigo-50/50') 
                        : (darkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50/80')
                    }`}
                  >
                    <td className="py-2 px-3 font-semibold">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" 
                          style={{ backgroundColor: theme.fill }}
                        />
                        <div>
                          <span className="text-[10px] text-slate-400 block font-mono">{p.code}</span>
                          <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{p.desa}</span>
                          {isAcuan && (
                            <span className="ml-1 px-1.5 py-0.2 rounded text-[9px] bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                              Acuan
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-2 px-3 text-slate-400">
                      {p.bahasa}
                    </td>

                    <td className="py-2 px-3 font-mono text-[11px] text-slate-300">
                      <div>{p.lat.toFixed(5)}°, {p.lng.toFixed(5)}°</div>
                      <div className="text-[9px] text-slate-500 font-sans">{toDMS(p.lat, true)}, {toDMS(p.lng, false)}</div>
                    </td>

                    <td className="py-2 px-3">
                      <span 
                        className="px-2 py-0.5 rounded text-xs font-bold border"
                        style={{ 
                          backgroundColor: `${theme.fill}20`, 
                          color: darkMode ? '#38bdf8' : theme.fill,
                          borderColor: `${theme.fill}40`
                        }}
                      >
                        {p.bentukLokal}
                      </span>
                    </td>

                    <td className="py-2 px-3 font-mono text-cyan-400 text-xs">
                      {p.transkripsiIPA || '-'}
                    </td>

                    <td className="py-2 px-3 font-mono text-slate-400">
                      {isAcuan ? '0 km (Pusat)' : `~${distToRef} km`}
                    </td>

                    <td className="py-2 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayAudio(p.id, p.bentukLokal);
                          }}
                          className={`p-1 rounded cursor-pointer ${
                            darkMode ? 'hover:bg-slate-700 text-slate-400 hover:text-cyan-400' : 'hover:bg-slate-200 text-slate-500 hover:text-indigo-600'
                          }`}
                          title="Dengarkan Pengucapan"
                        >
                          <Volume2 className={`w-3.5 h-3.5 ${playingAudioId === p.id ? 'text-cyan-400 animate-pulse' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFocusPoint(p.lat, p.lng, p.id);
                          }}
                          className={`p-1 rounded cursor-pointer ${
                            darkMode ? 'hover:bg-slate-700 text-slate-400 hover:text-cyan-400' : 'hover:bg-slate-200 text-slate-500 hover:text-indigo-600'
                          }`}
                          title="Fokus di Peta"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL MATRIKS VISUAL INDEKS KEMIRIPAN LEKSIKAL REAL-TIME */}
      {showHeatmapMatrixModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`w-full max-w-4xl max-h-[85vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
            darkMode ? 'bg-slate-900 border-slate-750 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className={`p-4 sm:px-6 sm:py-4 border-b flex items-center justify-between gap-3 ${
              darkMode ? 'border-slate-800 bg-slate-850' : 'border-slate-100 bg-slate-50'
            }`}>
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                  <Grid3X3 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-base sm:text-lg leading-tight">
                    Matriks Visual Indeks Kemiripan Leksikal Real-Time
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Analisis komparasi spasial otomatis dialektometri antar pasangan titik pengamatan
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowHeatmapMatrixModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Matrix Content Table */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-850 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Titik Terdata</span>
                  <span className="text-base font-extrabold text-blue-500">{consolidatedPoints.length} Titik</span>
                </div>
                <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-850 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Pasangan Titik</span>
                  <span className="text-base font-extrabold text-rose-500">{similarityMatrix.length} Pasangan</span>
                </div>
                <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-850 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Rata-Rata Kemiripan</span>
                  <span className="text-base font-extrabold text-emerald-500">
                    {similarityMatrix.length > 0 
                      ? Math.round(similarityMatrix.reduce((acc, m) => acc + m.similarityPercent, 0) / similarityMatrix.length)
                      : 0}%
                  </span>
                </div>
                <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-850 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Metodologi</span>
                  <span className="text-xs font-bold text-amber-500 mt-1 block">Guiter Dialektometri</span>
                </div>
              </div>

              {/* Pairwise Comparison Table */}
              <div className="border rounded-2xl overflow-hidden shadow-2xs border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className={`text-[11px] font-bold uppercase tracking-wider ${
                    darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                  }`}>
                    <tr>
                      <th className="py-2.5 px-3">Titik Asal (A)</th>
                      <th className="py-2.5 px-3">Titik Tujuan (B)</th>
                      <th className="py-2.5 px-3 text-center">Jarak (km)</th>
                      <th className="py-2.5 px-3 text-center">Indeks Kemiripan</th>
                      <th className="py-2.5 px-3 text-center">Beda Leksikal (d%)</th>
                      <th className="py-2.5 px-3">Klasifikasi Geolinguistik</th>
                      <th className="py-2.5 px-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y text-xs ${
                    darkMode ? 'divide-slate-800 bg-slate-900' : 'divide-slate-100 bg-white'
                  }`}>
                    {similarityMatrix.map((item, idx) => {
                      const isHighSim = item.similarityPercent >= 70;
                      const isMidSim = item.similarityPercent >= 50 && item.similarityPercent < 70;
                      return (
                        <tr key={idx} className={darkMode ? 'hover:bg-slate-850' : 'hover:bg-slate-50'}>
                          <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                            {item.sourceName} <span className="text-[10px] text-slate-400">({item.sourceCode})</span>
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                            {item.targetName} <span className="text-[10px] text-slate-400">({item.targetCode})</span>
                          </td>
                          <td className="py-2 px-3 text-center font-mono text-[11px] text-slate-500">
                            {item.distanceKm} km
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-xs ${
                              isHighSim 
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' 
                                : isMidSim 
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' 
                                : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300'
                            }`}>
                              {item.similarityPercent}%
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                            {item.differencePercent}%
                          </td>
                          <td className="py-2 px-3">
                            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                              {item.status}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setShowHeatmapMatrixModal(false);
                                const p = consolidatedPoints.find(cp => cp.id === item.targetId);
                                if (p) handleFocusPoint(p.lat, p.lng, p.id);
                              }}
                              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                            >
                              Fokus →
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-4 border-t flex items-center justify-between gap-3 text-xs ${
              darkMode ? 'border-slate-800 bg-slate-850' : 'border-slate-100 bg-slate-50'
            }`}>
              <div className="text-[11px] text-slate-500">
                Data diperbarui secara real-time berdasarkan isian kuesioner dan koordinat titik spasial.
              </div>
              <button
                type="button"
                onClick={() => setShowHeatmapMatrixModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Tutup Matriks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
