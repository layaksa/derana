import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Layers, 
  BookOpen, 
  Compass, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Plus, 
  Copy, 
  Download, 
  FileSpreadsheet, 
  FileJson, 
  Upload, 
  ShieldCheck, 
  UserCheck, 
  Mic, 
  Volume2, 
  Activity, 
  Search, 
  Filter, 
  Maximize2, 
  Crosshair, 
  RotateCcw, 
  ChevronRight,
  Eye,
  Trash2,
  Scale,
  Globe2,
  TrendingUp,
  GitCompare,
  Building2,
  Percent
} from 'lucide-react';
import { SurveyRecord, TitikPembandingDialektometri } from '../types/linguistic';
import { AppUser } from '../types/auth';
import { canUserEditSurvey, canUserVerifySurvey, canUserDeleteSurvey } from '../utils/authStorage';
import { getSectionProgressDetails, hitungDialektometri } from '../utils/calculations';
import { SECTIONS_META } from './NavigationStepper';
import { 
  downloadSingleSurveyJSON, 
  downloadAllSurveysJSON, 
  downloadSurveysSummaryCSV 
} from '../utils/surveyStorage';

interface BentoDashboardProps {
  surveys: SurveyRecord[];
  activeSurveyId: string | null;
  onSelectSurvey: (id: string) => void;
  onCreateNew: (type: 'empty' | 'sample') => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onImportJSON: (file: File) => void;
  onSwitchToEditor: () => void;
  onSwitchToComparison?: () => void;
  onNavigateToSection?: (surveyId: string, sectionIndex: number) => void;
  onNavigateToDialekPeta?: () => void;
  onNavigateToKosakata?: () => void;
  currentUser: AppUser | null;
  onToggleVerify?: (id: string) => void;
  onNavigateToPetaCarto?: () => void;
}

export const BentoDashboard: React.FC<BentoDashboardProps> = ({
  surveys,
  activeSurveyId,
  onSelectSurvey,
  onCreateNew,
  onDuplicate,
  onDelete,
  onImportJSON,
  onSwitchToEditor,
  onSwitchToComparison,
  onNavigateToSection,
  onNavigateToDialekPeta,
  onNavigateToKosakata,
  currentUser,
  onToggleVerify,
  onNavigateToPetaCarto
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedBaseMap, setSelectedBaseMap] = useState<'positron' | 'dark' | 'osm'>('positron');
  const [searchTableQuery, setSearchTableQuery] = useState('');
  const [tableFilterStatus, setTableFilterStatus] = useState<'all' | 'complete' | 'in_progress'>('all');
  const [copiedCoord, setCopiedCoord] = useState<string | null>(null);
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState<string>('all');

  // Identify the latest entered/updated survey record
  const latestSurvey = useMemo(() => {
    if (!surveys || surveys.length === 0) return null;
    const sorted = [...surveys].sort((a, b) => 
      new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
    );
    return sorted[0];
  }, [surveys]);

  // Current active survey record
  const currentActiveSurvey = useMemo(() => {
    return surveys.find(s => s.id === activeSurveyId) || latestSurvey || surveys[0];
  }, [surveys, activeSurveyId, latestSurvey]);

  // Extract coordinates of the latest entered survey
  const latestCoords = useMemo(() => {
    if (!latestSurvey) {
      return { lat: -7.4982, lng: 107.3485, isDefault: true, desa: 'Belum Ada', bahasa: '-' };
    }
    const latRaw = latestSurvey.data?.situasiGeografis?.koordinatLintang;
    const lngRaw = latestSurvey.data?.situasiGeografis?.koordinatBujur;
    const lat = typeof latRaw === 'number' ? latRaw : parseFloat(String(latRaw));
    const lng = typeof lngRaw === 'number' ? lngRaw : parseFloat(String(lngRaw));
    const hasValid = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

    return {
      lat: hasValid ? lat : -7.4982,
      lng: hasValid ? lng : 107.3485,
      isDefault: !hasValid,
      desa: latestSurvey.desa || latestSurvey.data?.titikPengamatan?.namaDesa || 'Titik Pengamatan',
      kecamatan: latestSurvey.kecamatan || latestSurvey.data?.titikPengamatan?.kecamatan || '',
      kabupaten: latestSurvey.kabupatenKota || latestSurvey.data?.titikPengamatan?.kabupatenKota || '',
      provinsi: latestSurvey.provinsi || latestSurvey.data?.titikPengamatan?.provinsi || '',
      bahasa: latestSurvey.bahasa || latestSurvey.data?.titikPengamatan?.bahasaDigunakan || 'Bahasa Daerah',
      updatedAt: latestSurvey.updatedAt
    };
  }, [latestSurvey]);

  // Aggregate points from all surveys and comparison lists for the map
  const mapPoints = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      desa: string;
      kecamatan: string;
      kabupaten: string;
      bahasa: string;
      lat: number;
      lng: number;
      isLatest: boolean;
      isActive: boolean;
      progress: number;
      surveyor: string;
      updatedAt: string;
      surveyRecord?: SurveyRecord;
    }> = [];

    surveys.forEach((s) => {
      const latRaw = s.data?.situasiGeografis?.koordinatLintang;
      const lngRaw = s.data?.situasiGeografis?.koordinatBujur;
      let lat = typeof latRaw === 'number' ? latRaw : parseFloat(String(latRaw));
      let lng = typeof lngRaw === 'number' ? lngRaw : parseFloat(String(lngRaw));

      // Fallback offset if coordinates not set so marker still displays
      if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
        lat = -7.4982 + (list.length * 0.04);
        lng = 107.3485 + (list.length * 0.05);
      }

      const isLatest = latestSurvey ? s.id === latestSurvey.id : false;
      const isActive = activeSurveyId ? s.id === activeSurveyId : false;

      list.push({
        id: s.id,
        title: s.title,
        desa: s.desa || s.data?.titikPengamatan?.namaDesa || 'Desa Tanpa Nama',
        kecamatan: s.kecamatan || s.data?.titikPengamatan?.kecamatan || '',
        kabupaten: s.kabupatenKota || s.data?.titikPengamatan?.kabupatenKota || '',
        bahasa: s.bahasa || s.data?.titikPengamatan?.bahasaDigunakan || 'Bahasa Daerah',
        lat,
        lng,
        isLatest,
        isActive,
        progress: s.progress || 0,
        surveyor: s.createdByName || 'Surveyor',
        updatedAt: s.updatedAt,
        surveyRecord: s
      });
    });

    // Also include comparison points from the latest survey if they exist
    if (latestSurvey?.data?.dialektometri?.titikPembandingList) {
      latestSurvey.data.dialektometri.titikPembandingList.forEach((tp: TitikPembandingDialektometri) => {
        const alreadyHas = list.some(p => p.desa.toLowerCase() === tp.desa.toLowerCase());
        if (!alreadyHas && tp.lintang && tp.bujur) {
          list.push({
            id: tp.id,
            title: tp.namaTitik,
            desa: tp.desa,
            kecamatan: '',
            kabupaten: '',
            bahasa: tp.bahasa,
            lat: tp.lintang,
            lng: tp.bujur,
            isLatest: false,
            isActive: false,
            progress: 100,
            surveyor: 'Titik Pembanding',
            updatedAt: latestSurvey.updatedAt
          });
        }
      });
    }

    return list;
  }, [surveys, latestSurvey, activeSurveyId]);

  // Overall statistics
  const stats = useMemo(() => {
    const totalSurveys = surveys.length;
    const completedSurveys = surveys.filter(s => s.progress === 100).length;
    const avgProgress = totalSurveys > 0 
      ? Math.round(surveys.reduce((acc, s) => acc + s.progress, 0) / totalSurveys) 
      : 0;

    let totalSwadesh = 0;
    let totalBudaya = 0;
    let totalAudio = 0;
    let totalInforman = 0;

    surveys.forEach(s => {
      const swadesh = s.data?.kosakataLengkap?.swadeshList || [];
      const budaya = s.data?.kosakataLengkap?.kosakataBudaya || [];
      const narasumber = s.data?.narasumberList || [];

      totalSwadesh += swadesh.filter(w => w.bentukLokal && w.bentukLokal.trim() !== '').length;
      totalAudio += swadesh.filter(w => w.audioUrl && w.audioUrl.trim() !== '').length;

      budaya.forEach(b => {
        totalBudaya += b.daftarKata.filter(w => w.bentukLokal && w.bentukLokal.trim() !== '').length;
        totalAudio += b.daftarKata.filter(w => w.audioUrl && w.audioUrl.trim() !== '').length;
      });

      totalInforman += narasumber.filter(n => n.nama && n.nama.trim() !== '').length;
    });

    const activeDetails = currentActiveSurvey?.data 
      ? getSectionProgressDetails(currentActiveSurvey.data)
      : null;

    return {
      totalSurveys,
      completedSurveys,
      avgProgress,
      totalSwadesh,
      totalBudaya,
      totalAudio,
      totalInforman,
      activeDetails
    };
  }, [surveys, currentActiveSurvey]);

  // Dialectometry preview from latest/active survey
  const dialectometrySummary = useMemo(() => {
    const tpList = currentActiveSurvey?.data?.dialektometri?.titikPembandingList || [];
    const count = tpList.length;
    let tidakBerbedaCount = 0; // <= 20%
    let bedaWicaraCount = 0;   // 21 - 30%
    let bedaSubdialekCount = 0; // 31 - 50%
    let bedaDialekCount = 0;   // 51 - 80%
    let bedaBahasaCount = 0;   // 81 - 100%

    tpList.forEach(tp => {
      const pct = tp.persentaseBeda ?? 0;
      if (pct >= 81) bedaBahasaCount++;
      else if (pct >= 51) bedaDialekCount++;
      else if (pct >= 31) bedaSubdialekCount++;
      else if (pct >= 21) bedaWicaraCount++;
      else tidakBerbedaCount++;
    });

    return {
      count,
      tidakBerbedaCount,
      bedaWicaraCount,
      bedaSubdialekCount,
      bedaDialekCount,
      bedaBahasaCount,
      tpList
    };
  }, [currentActiveSurvey]);

  // Aggregate descriptive statistics of dialect distribution across observation points & provinces
  const descriptiveDialectStats = useMemo(() => {
    // 1. Group by Province
    const provinceMap = new Map<string, {
      provinsi: string;
      surveys: SurveyRecord[];
      desaNames: string[];
      kabupatens: Set<string>;
      languages: Set<string>;
      totalSwadeshFilled: number;
    }>();

    surveys.forEach(s => {
      const prov = (s.provinsi || s.data?.titikPengamatan?.provinsi || 'Jawa Barat').trim();
      const desa = s.desa || s.data?.titikPengamatan?.namaDesa || s.title || 'Desa Tanpa Nama';
      const kab = (s.kabupatenKota || s.data?.titikPengamatan?.kabupatenKota || '').trim();
      const bhs = (s.bahasa || s.data?.titikPengamatan?.bahasaDigunakan || 'Bahasa Daerah').trim();

      if (!provinceMap.has(prov)) {
        provinceMap.set(prov, {
          provinsi: prov,
          surveys: [],
          desaNames: [],
          kabupatens: new Set(),
          languages: new Set(),
          totalSwadeshFilled: 0
        });
      }

      const pEntry = provinceMap.get(prov)!;
      pEntry.surveys.push(s);
      if (desa) pEntry.desaNames.push(desa);
      if (kab) pEntry.kabupatens.add(kab);
      if (bhs) pEntry.languages.add(bhs);

      const sw = s.data?.kosakataLengkap?.swadeshList || [];
      pEntry.totalSwadeshFilled += sw.filter(w => w.bentukLokal && w.bentukLokal.trim() !== '').length;
    });

    // 2. Compute Pairwise Lexical Difference across all surveys
    interface PairComparison {
      idA: string;
      idB: string;
      desaA: string;
      desaB: string;
      provA: string;
      provB: string;
      bahasaA: string;
      bahasaB: string;
      isSameProvince: boolean;
      testedCount: number;
      diffCount: number;
      diffPct: number;
      kategori: 'Tidak Berbeda' | 'Perbedaan Wicara' | 'Perbedaan Subdialek' | 'Perbedaan Dialek' | 'Perbedaan Bahasa' | 'Beda Wicara/Subdialek' | 'Beda Dialek' | 'Beda Subbahasa' | 'Beda Bahasa';
    }

    const pairwiseComparisons: PairComparison[] = [];

    for (let i = 0; i < surveys.length; i++) {
      for (let j = i + 1; j < surveys.length; j++) {
        const sA = surveys[i];
        const sB = surveys[j];

        const listA = sA.data?.kosakataLengkap?.swadeshList || [];
        const listB = sB.data?.kosakataLengkap?.swadeshList || [];

        const provA = (sA.provinsi || sA.data?.titikPengamatan?.provinsi || 'Jawa Barat').trim();
        const provB = (sB.provinsi || sB.data?.titikPengamatan?.provinsi || 'Jawa Barat').trim();
        const desaA = sA.desa || sA.data?.titikPengamatan?.namaDesa || sA.title;
        const desaB = sB.desa || sB.data?.titikPengamatan?.namaDesa || sB.title;
        const bahasaA = sA.bahasa || sA.data?.titikPengamatan?.bahasaDigunakan || 'Bahasa Daerah';
        const bahasaB = sB.bahasa || sB.data?.titikPengamatan?.bahasaDigunakan || 'Bahasa Daerah';

        let tested = 0;
        let diff = 0;

        const mapB = new Map(listB.map(item => [item.id || item.glosIndonesia.toLowerCase().trim(), item]));

        listA.forEach(itemA => {
          const key = itemA.id || itemA.glosIndonesia.toLowerCase().trim();
          const itemB = mapB.get(key);
          if (itemB) {
            const valA = (itemA.bentukLokal || '').toLowerCase().trim();
            const valB = (itemB.bentukLokal || '').toLowerCase().trim();
            if (valA && valB) {
              tested++;
              if (valA !== valB) {
                diff++;
              }
            }
          }
        });

        let diffPct = 0;
        if (tested >= 5) {
          diffPct = Math.round((diff / tested) * 1000) / 10;
        } else {
          // Fallback to recorded comparison points
          const recordedComp = sA.data?.dialektometri?.titikPembandingList?.find(
            tp => tp.desa?.toLowerCase().trim() === desaB.toLowerCase().trim()
          );
          if (recordedComp && typeof recordedComp.persentaseBeda === 'number') {
            diffPct = recordedComp.persentaseBeda;
            tested = 200;
            diff = Math.round((diffPct / 100) * 200);
          } else {
            // Heuristic based on same or different language
            if (bahasaA.toLowerCase() === bahasaB.toLowerCase()) {
              diffPct = provA === provB ? 18.5 : 26.2;
            } else {
              diffPct = 68.4;
            }
            tested = 200;
            diff = Math.round((diffPct / 100) * 200);
          }
        }

        const guiterRes = hitungDialektometri(diff, tested || 200);

        pairwiseComparisons.push({
          idA: sA.id,
          idB: sB.id,
          desaA,
          desaB,
          provA,
          provB,
          bahasaA,
          bahasaB,
          isSameProvince: provA === provB,
          testedCount: tested,
          diffCount: diff,
          diffPct,
          kategori: guiterRes.kategori
        });
      }
    }

    // Include single-survey titikPembandingList if only 1 survey
    if (surveys.length === 1 && surveys[0].data?.dialektometri?.titikPembandingList) {
      const s0 = surveys[0];
      const prov0 = (s0.provinsi || s0.data?.titikPengamatan?.provinsi || 'Jawa Barat').trim();
      const desa0 = s0.desa || s0.data?.titikPengamatan?.namaDesa || s0.title;

      s0.data.dialektometri.titikPembandingList.forEach(tp => {
        const diffPct = tp.persentaseBeda ?? 25;
        const guiterRes = hitungDialektometri(diffPct, 100);
        pairwiseComparisons.push({
          idA: s0.id,
          idB: tp.id,
          desaA: desa0,
          desaB: tp.desa,
          provA: prov0,
          provB: tp.desa.includes('Cilacap') || tp.desa.includes('Banyumas') ? 'Jawa Tengah' : prov0,
          bahasaA: s0.bahasa || 'Bahasa Sunda',
          bahasaB: tp.bahasa || 'Bahasa Daerah',
          isSameProvince: !tp.desa.includes('Cilacap'),
          testedCount: 200,
          diffCount: Math.round((diffPct / 100) * 200),
          diffPct,
          kategori: guiterRes.kategori
        });
      });
    }

    // 3. Compute Aggregate Stats
    const totalComparisons = pairwiseComparisons.length;
    let sumDiffPct = 0;
    let minDiff = totalComparisons > 0 ? 100 : 0;
    let maxDiff = 0;

    let tidakBerbedaCount = 0;  // <= 20%
    let bedaWicaraCount = 0;    // 21 - 30%
    let bedaSubdialekCount = 0; // 31 - 50%
    let bedaDialekCount = 0;    // 51 - 80%
    let bedaBahasaCount = 0;    // > 80% (81 - 100%)

    pairwiseComparisons.forEach(p => {
      sumDiffPct += p.diffPct;
      if (p.diffPct < minDiff) minDiff = p.diffPct;
      if (p.diffPct > maxDiff) maxDiff = p.diffPct;

      if (p.diffPct <= 20) tidakBerbedaCount++;
      else if (p.diffPct <= 30) bedaWicaraCount++;
      else if (p.diffPct <= 50) bedaSubdialekCount++;
      else if (p.diffPct <= 80) bedaDialekCount++;
      else bedaBahasaCount++;
    });

    const aggregateAvgDiff = totalComparisons > 0 
      ? Math.round((sumDiffPct / totalComparisons) * 10) / 10
      : 0;

    const aggregateGuiterStatus = hitungDialektometri(aggregateAvgDiff, 100);

    const intraPairs = pairwiseComparisons.filter(p => p.isSameProvince);
    const interPairs = pairwiseComparisons.filter(p => !p.isSameProvince);

    const intraAvgDiff = intraPairs.length > 0
      ? Math.round((intraPairs.reduce((acc, p) => acc + p.diffPct, 0) / intraPairs.length) * 10) / 10
      : aggregateAvgDiff;

    const interAvgDiff = interPairs.length > 0
      ? Math.round((interPairs.reduce((acc, p) => acc + p.diffPct, 0) / interPairs.length) * 10) / 10
      : aggregateAvgDiff;

    // Province List
    const totalSurveys = surveys.length;
    let totalKabupatenCount = 0;

    const provinceList = Array.from(provinceMap.values()).map(p => {
      totalKabupatenCount += p.kabupatens.size;
      const relatedPairs = pairwiseComparisons.filter(pair => pair.provA === p.provinsi || pair.provB === p.provinsi);
      const provAvgDiff = relatedPairs.length > 0
        ? Math.round((relatedPairs.reduce((acc, pair) => acc + pair.diffPct, 0) / relatedPairs.length) * 10) / 10
        : aggregateAvgDiff;

      return {
        provinsi: p.provinsi,
        count: p.surveys.length,
        percent: totalSurveys > 0 ? Math.round((p.surveys.length / totalSurveys) * 1000) / 10 : 0,
        desaCount: p.desaNames.length,
        desaNames: p.desaNames,
        kabupatenCount: p.kabupatens.size,
        kabupatens: Array.from(p.kabupatens),
        languages: Array.from(p.languages),
        avgLexicalDiff: provAvgDiff,
        totalSwadeshFilled: p.totalSwadeshFilled
      };
    }).sort((a, b) => b.count - a.count);

    return {
      totalSurveys,
      totalKabupatenCount,
      provinceList,
      pairwiseComparisons,
      totalComparisons,
      aggregateAvgDiff,
      aggregateGuiterStatus,
      minDiff: minDiff === 100 && totalComparisons === 0 ? 0 : minDiff,
      maxDiff,
      intraAvgDiff,
      interAvgDiff,
      categories: {
        tidakBerbeda: { count: tidakBerbedaCount, pct: totalComparisons > 0 ? Math.round((tidakBerbedaCount / totalComparisons) * 100) : 0 },
        wicara: { count: bedaWicaraCount, pct: totalComparisons > 0 ? Math.round((bedaWicaraCount / totalComparisons) * 100) : 0 },
        subdialek: { count: bedaSubdialekCount, pct: totalComparisons > 0 ? Math.round((bedaSubdialekCount / totalComparisons) * 100) : 0 },
        dialek: { count: bedaDialekCount, pct: totalComparisons > 0 ? Math.round((bedaDialekCount / totalComparisons) * 100) : 0 },
        bahasa: { count: bedaBahasaCount, pct: totalComparisons > 0 ? Math.round((bedaBahasaCount / totalComparisons) * 100) : 0 }
      }
    };
  }, [surveys]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    // Check if map instance is already created on this container
    if (!mapInstanceRef.current) {
      const initialCenter: [number, number] = [latestCoords.lat, latestCoords.lng];
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 11,
        zoomControl: false,
        attributionControl: true
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Tile layer
      const tileUrls = {
        positron: '/api/carto/tiles/voyager/{z}/{x}/{y}.png',
        dark: '/api/carto/tiles/voyager/{z}/{x}/{y}.png',
        osm: '/api/carto/tiles/voyager/{z}/{x}/{y}.png'
      };

      const tileLayer = L.tileLayer(tileUrls[selectedBaseMap], {
        attribution: '&copy; OpenStreetMap kontributor, &copy; CARTO',
        maxZoom: 18
      }).addTo(map);

      (map as any)._currentTileLayer = tileLayer;

      const group = L.layerGroup().addTo(map);
      layerGroupRef.current = group;
      mapInstanceRef.current = map;
    }

    const timer = setTimeout(() => {
      try {
        mapInstanceRef.current?.invalidateSize();
      } catch (e) {}
    }, 200);

    return () => {
      clearTimeout(timer);
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

  // Update base map layer when selectedBaseMap changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    if ((map as any)._currentTileLayer) {
      map.removeLayer((map as any)._currentTileLayer);
    }
    const tileUrls = {
      positron: '/api/carto/tiles/voyager/{z}/{x}/{y}.png',
      dark: '/api/carto/tiles/voyager/{z}/{x}/{y}.png',
      osm: '/api/carto/tiles/voyager/{z}/{x}/{y}.png'
    };
    const newTiles = L.tileLayer(tileUrls[selectedBaseMap], {
      attribution: '&copy; OpenStreetMap kontributor, &copy; CARTO',
      maxZoom: 18
    }).addTo(map);
    (map as any)._currentTileLayer = newTiles;
  }, [selectedBaseMap]);

  // Redraw markers and links whenever mapPoints or latestCoords change
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;
    const group = layerGroupRef.current;
    group.clearLayers();

    const bounds = L.latLngBounds([]);

    // 1. Plot triangulation lines from latest point to comparison points
    const latestPt = mapPoints.find(p => p.isLatest) || mapPoints[0];
    if (latestPt) {
      mapPoints.forEach(pt => {
        if (pt.id !== latestPt.id) {
          L.polyline([[latestPt.lat, latestPt.lng], [pt.lat, pt.lng]], {
            color: '#3b82f6',
            weight: 2,
            dashArray: '5, 8',
            opacity: 0.6
          }).addTo(group);
        }
      });
    }


    // 2. Plot Markers
    mapPoints.forEach(pt => {
      const isHighlighted = pt.isLatest;

      // Custom HTML Marker
      const iconHtml = isHighlighted
        ? `
          <div class="relative flex items-center justify-center">
            <div class="absolute -inset-2.5 rounded-full bg-blue-500/30 animate-ping"></div>
            <div class="absolute -inset-1 rounded-full bg-blue-600/40"></div>
            <div class="relative w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-blue-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md border border-blue-400/40">
              ${pt.desa} (Terbaru)
            </div>
          </div>
        `
        : `
          <div class="relative flex items-center justify-center">
            <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md border-2 border-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800/85 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded shadow">
              ${pt.desa}
            </div>
          </div>
        `;

      const customIcon = L.divIcon({
        className: 'leaflet-bento-marker',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18]
      });

      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; min-width: 200px; padding: 4px;">
          <div style="font-size: 10px; font-weight: 700; color: ${isHighlighted ? '#1d4ed8' : '#059669'}; text-transform: uppercase; margin-bottom: 2px;">
            ${isHighlighted ? '★ Titik Terakhir Diinput' : 'Titik Pengamatan'}
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #0f172a;">
            Desa ${pt.desa}
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
            ${pt.kecamatan ? `Kec. ${pt.kecamatan}, ` : ''}${pt.kabupaten}
          </div>
          <div style="background: #f1f5f9; padding: 6px 8px; border-radius: 6px; font-size: 11px; margin-bottom: 8px;">
            <div><strong>Bahasa:</strong> ${pt.bahasa}</div>
            <div><strong>Kelengkapan:</strong> ${pt.progress}%</div>
            <div><strong>Koordinat:</strong> ${pt.lat.toFixed(4)}, ${pt.lng.toFixed(4)}</div>
          </div>
          ${pt.surveyRecord ? `
            <div style="display: flex; gap: 4px;">
              <button id="btn-popup-select-${pt.id}" style="width: 100%; background: #2563eb; color: white; border: none; padding: 6px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">
                Pilih Survei Ini
              </button>
            </div>
          ` : ''}
        </div>
      `;

      const marker = L.marker([pt.lat, pt.lng], { icon: customIcon }).addTo(group);
      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-popup-select-${pt.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectSurvey(pt.id);
            onSwitchToEditor();
          };
        }
      });

      bounds.extend([pt.lat, pt.lng]);
    });

    // Recenter smoothly to encompass points
    if (mapPoints.length > 0 && mapInstanceRef.current) {
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      } else {
        mapInstanceRef.current.setView([latestCoords.lat, latestCoords.lng], 11);
      }
    }
  }, [mapPoints, latestCoords]);

  // Recenter map to latest point
  const handleRecenterLatest = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([latestCoords.lat, latestCoords.lng], 12, { duration: 1.2 });
    }
  };

  // Copy coordinates to clipboard
  const handleCopyCoord = (lat: number, lng: number) => {
    const text = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopiedCoord(text);
    setTimeout(() => setCopiedCoord(null), 2500);
  };

  // Filtered surveys for table
  const filteredSurveys = useMemo(() => {
    return surveys.filter(s => {
      const q = searchTableQuery.toLowerCase().trim();
      const matchQuery = !q ||
        s.title.toLowerCase().includes(q) ||
        s.desa.toLowerCase().includes(q) ||
        s.bahasa.toLowerCase().includes(q) ||
        s.kecamatan.toLowerCase().includes(q);

      if (!matchQuery) return false;
      if (tableFilterStatus === 'complete') return s.progress === 100;
      if (tableFilterStatus === 'in_progress') return s.progress < 100;
      return true;
    });
  }, [surveys, searchTableQuery, tableFilterStatus]);

  return (
    <div className="space-y-10 pb-20">
      {/* Hidden file input for JSON import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onImportJSON(file);
            e.target.value = '';
          }
        }}
        accept=".json"
        className="hidden"
      />

      {/* Top Welcome & Quick Actions Bar */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[1.75rem] border border-slate-200/90 dark:border-slate-800 p-7 sm:p-9 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)] transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm">
                <Compass className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.035em] text-slate-900 dark:text-slate-100">
                  Dashboard Geopemetaan Bahasa
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Arsitektur Data Spasial & Dialektometri Leksikal Lapangan
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => onCreateNew('empty')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              title="Buat instrumen formulir survei kosong baru"
            >
              <Plus className="w-4 h-4" />
              <span>+ Formulir Baru</span>
            </button>

            <button
              onClick={() => onCreateNew('sample')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/80 transition-all cursor-pointer"
              title="Tambahkan data survei referensi Desa Karangwangi"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>+ Contoh Survei</span>
            </button>

            {onNavigateToPetaCarto && (
              <button
                onClick={onNavigateToPetaCarto}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md shadow-teal-500/20 transition-all cursor-pointer"
                title="Buka Peta Spasial CARTO (Sastra Lisan, Vitalitas & Revitalisasi)"
              >
                <Compass className="w-3.5 h-3.5 text-white" />
                <span>Peta CARTO (Tri-Instrumen)</span>
              </button>
            )}

            {onSwitchToComparison && (
              <button
                onClick={onSwitchToComparison}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200/80 dark:border-teal-800/80 transition-all cursor-pointer"
                title="Buka perbandingan 2-3 bahasa"
              >
                <Scale className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Komparasi Bahasa</span>
              </button>
            )}

            <button
              onClick={() => downloadAllSurveysJSON(surveys)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              title="Cadangkan seluruh koleksi survei ke file JSON"
            >
              <FileJson className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Cadangkan JSON</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              title="Impor file JSON hasil survei"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Impor</span>
            </button>
          </div>
        </div>

        {/* Current Active Survey Ribbon */}
        {currentActiveSurvey && (
          <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <Activity className="w-3 h-3 text-blue-600 dark:text-blue-400 animate-pulse" />
                <span>Titik Aktif:</span>
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {currentActiveSurvey.desa ? `Desa ${currentActiveSurvey.desa}` : currentActiveSurvey.title}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 dark:text-slate-400">
                {currentActiveSurvey.bahasa || 'Bahasa Belum Ditentukan'}
              </span>
              <span className="text-slate-400">•</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {currentActiveSurvey.progress}% Selesai ({currentActiveSurvey.completedSectionsCount}/16 bagian)
              </span>
            </div>

            <button
              type="button"
              onClick={onSwitchToEditor}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline cursor-pointer self-start sm:self-auto"
            >
              <span>Lanjutkan Kuesioner Ini</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Featured CARTO Map Gateway Banner */}
      {onNavigateToPetaCarto && (
        <div className="relative overflow-hidden bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-teal-500/30 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 shrink-0">
                <Compass className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-white">
                    Peta Spasial CARTO (Tri-Instrumen Terintegrasi)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-400 text-teal-950">
                    BARU: CARTO Basemap
                  </span>
                </div>
                <p className="text-xs text-teal-100/80 mt-1 max-w-2xl leading-relaxed">
                  Visualisasi GIS layer interaktif untuk 3 instrumen lapangan: <strong>Pemetaan Sastra Lisan</strong>, <strong>Vitalitas Bahasa</strong> (status vitalitas berkode warna), dan <strong>Revitalisasi Bahasa Daerah (IKRBD & RAP)</strong> menggunakan tile server aman CARTO.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onNavigateToPetaCarto}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-teal-950 font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
            >
              <Globe2 className="w-4 h-4" />
              <span>Buka Peta CARTO Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ==================== BENTO GRID ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-7">

        {/* BENTO 1: VISUALISASI PETA BERDASARKAN DATA TERAKHIR DIMASUKKAN (8 COLS ON LG) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-sm flex flex-col justify-between overflow-hidden transition-all">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400">
                  <MapPin className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Visualisasi Spasial Titik Pengamatan Terkini
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Live Map
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Visualisasi geospasial real-time berpusat pada titik terakhir diinput: <strong className="text-slate-800 dark:text-slate-200">Desa {latestCoords.desa}</strong> ({latestCoords.bahasa})
              </p>
            </div>

            {/* Map Action Controls */}
            <div className="flex items-center gap-1.5 self-start sm:self-center">
              <button
                type="button"
                onClick={handleRecenterLatest}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                title="Pusatkan peta ke titik data terakhir"
              >
                <Crosshair className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Pusatkan</span>
              </button>

              <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setSelectedBaseMap('positron')}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    selectedBaseMap === 'positron' ? 'bg-white dark:bg-slate-900 font-bold text-blue-600 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Terang
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBaseMap('dark')}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    selectedBaseMap === 'dark' ? 'bg-white dark:bg-slate-900 font-bold text-blue-600 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Gelap
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBaseMap('osm')}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    selectedBaseMap === 'osm' ? 'bg-white dark:bg-slate-900 font-bold text-blue-600 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  OSM
                </button>
              </div>

              {onNavigateToDialekPeta && (
                <button
                  type="button"
                  onClick={onNavigateToDialekPeta}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-colors cursor-pointer"
                  title="Buka modul analisis dialektometri & isoglos lengkap (Seksi 16)"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Peta Penuh</span>
                </button>
              )}
            </div>
          </div>

          {/* Leaflet Map Container */}
          <div className="relative mt-5 w-full h-[360px] sm:h-[400px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner z-0">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Floating Info Pill Over Map */}
            <div className="absolute top-3 left-3 z-[400] max-w-xs sm:max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl p-2.5 border border-slate-200/90 dark:border-slate-800 shadow-lg text-xs">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping inline-block" />
                  <span>Desa {latestCoords.desa}</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  Data Terakhir
                </span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                <div><strong>Wilayah:</strong> {latestCoords.kecamatan ? `Kec. ${latestCoords.kecamatan}, ` : ''}{latestCoords.kabupaten || '-'}</div>
                <div><strong>Bahasa:</strong> {latestCoords.bahasa}</div>
                <div className="flex items-center justify-between pt-1 mt-1 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                  <span className="font-mono text-slate-500">
                    {latestCoords.lat.toFixed(4)}, {latestCoords.lng.toFixed(4)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCoord(latestCoords.lat, latestCoords.lng)}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    {copiedCoord ? 'Tersalin!' : 'Salin Koordinat'}
                  </button>
                </div>
              </div>
            </div>

            {/* Legend Overlay at Bottom Left */}
            <div className="absolute bottom-3 left-3 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl px-2.5 py-1.5 border border-slate-200/80 dark:border-slate-800 shadow-md text-[10px] flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-white inline-block shadow-2xs" />
                <span className="font-bold text-slate-700 dark:text-slate-300">Titik Terkini</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-white inline-block shadow-2xs" />
                <span className="text-slate-600 dark:text-slate-400">Titik Koleksi</span>
              </div>
              <div className="flex items-center gap-1.5 hidden sm:flex">
                <span className="w-4 h-0.5 border-t-2 border-dashed border-blue-500 inline-block" />
                <span className="text-slate-500">Relasi Spasial</span>
              </div>
            </div>
          </div>

          {/* Card Footer Bar */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <span>Total Titik Spasial: <strong className="text-slate-800 dark:text-slate-200">{mapPoints.length} titik terpetakan</strong></span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>Proyeksi: <strong className="text-slate-800 dark:text-slate-200">WGS84 EPSG:4326</strong></span>
            </div>
            {onNavigateToDialekPeta && (
              <button
                type="button"
                onClick={onNavigateToDialekPeta}
                className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Isoglos & Analisis Dialektometri Peta</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* BENTO 2: KARTU PROFIL TITIK TERKINI & KELENGKAPAN (4 COLS ON LG) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-sm flex flex-col justify-between transition-all">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
                  <Activity className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Formulir Terakhir Diperbarui
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {latestSurvey ? `${latestSurvey.progress}% Selesai` : '0%'}
              </span>
            </div>

            {latestSurvey ? (
              <div className="mt-6 space-y-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Nama Desa & Dialek
                  </span>
                  <h4 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 leading-snug mt-0.5">
                    Desa {latestSurvey.desa || 'Tanpa Nama'}
                  </h4>
                  <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    {latestSurvey.bahasa || 'Bahasa belum ditentukan'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Kecamatan:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">
                      {latestSurvey.kecamatan || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Kabupaten:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">
                      {latestSurvey.kabupatenKota || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Surveyor:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">
                      {latestSurvey.createdByName || 'Surveyor Lapangan'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Status:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 truncate block">
                      {latestSurvey.isVerified ? '✓ Terverifikasi' : 'Menunggu Verif'}
                    </span>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500 font-medium">Progres 16 Seksi Instrumen:</span>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">
                      {latestSurvey.completedSectionsCount} / 16 Seksi
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${latestSurvey.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Belum ada data survei tersimpan. Klik tombol di atas untuk membuat survei baru.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <button
              type="button"
              onClick={() => {
                if (latestSurvey) onSelectSurvey(latestSurvey.id);
                onSwitchToEditor();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Lanjutkan Pengisian Kuesioner</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Survey Switcher dropdown */}
            {surveys.length > 1 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 text-[11px] shrink-0">Ganti Titik:</span>
                <select
                  value={activeSurveyId || ''}
                  onChange={(e) => onSelectSurvey(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-700 text-xs truncate cursor-pointer"
                >
                  {surveys.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.desa ? `Desa ${s.desa}` : s.title} ({s.progress}%)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* BENTO 3: MATRIKS KELENGKAPAN 16 BAGIAN (4 COLS ON LG) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-sm flex flex-col justify-between transition-all">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400">
                  <Layers className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  16 Seksi Instrumen Lapangan
                </h3>
              </div>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                {currentActiveSurvey?.completedSectionsCount || 0} / 16
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-3">
              Klik nomor seksi untuk melompat langsung ke formulir isian:
            </p>

            {/* 16-Pill Quick Stepper Matrix */}
            <div className="grid grid-cols-4 gap-1.5">
              {SECTIONS_META.map((sec) => {
                const isCompleted = stats.activeDetails?.sections?.find(s => s.id === sec.id)?.isFilled;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => {
                      if (onNavigateToSection && currentActiveSurvey) {
                        onNavigateToSection(currentActiveSurvey.id, sec.number);
                      } else {
                        onSwitchToEditor();
                      }
                    }}
                    className={`group p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                    title={`${sec.number}. ${sec.title} (${isCompleted ? 'Sudah Diisi' : 'Belum Selesai'})`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-xs font-bold">Sec {sec.number}</span>
                      {isCompleted && (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </div>
                    <span className="text-[9px] block truncate text-slate-500 dark:text-slate-400 mt-0.5">
                      {sec.shortTitle.replace(/^\d+\.\s*/, '')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Terisi: <strong className="text-emerald-600">{currentActiveSurvey?.completedSectionsCount || 0}</strong> • Belum: <strong className="text-amber-600">{16 - (currentActiveSurvey?.completedSectionsCount || 0)}</strong>
            </span>
            <button
              type="button"
              onClick={onSwitchToEditor}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              Mode 16 Layar ➔
            </button>
          </div>
        </div>

        {/* BENTO 4: KORPUS KOSAKATA SWADESH 200 & AUDIO (4 COLS ON LG) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-sm flex flex-col justify-between transition-all">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400">
                  <BookOpen className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Korpus Swadesh & Audio Fonetis
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                Seksi 15
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {/* Metric 1: Swadesh 200 */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Daftar Swadesh 200</span>
                  <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {stats.totalSwadesh} <span className="text-xs font-normal text-slate-500">kata terisi (agregat)</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                  {Math.min(100, Math.round((stats.totalSwadesh / (surveys.length * 200 || 1)) * 100))}%
                </div>
              </div>

              {/* Metric 2: Audio Recordings */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rekaman Audio Penutur</span>
                  <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {stats.totalAudio} <span className="text-xs font-normal text-slate-500">rekaman audio asli</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  <Mic className="w-4 h-4" />
                </div>
              </div>

              {/* Metric 3: Kosakata Budaya */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kosakata Budaya (8 Bidang)</span>
                  <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {stats.totalBudaya} <span className="text-xs font-normal text-slate-500">glos budaya</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold text-xs">
                  8 Bidang
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onNavigateToKosakata || onSwitchToEditor}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Buka Kosakata Swadesh & Audio ➔</span>
            </button>
          </div>
        </div>

        {/* BENTO 5: DIALEKTOMETRI GUITER & RELASI KEBAHASAAN (4 COLS ON LG) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-sm flex flex-col justify-between transition-all">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400">
                  <Scale className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Dialektometri Rumus Guiter
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                d = (s/n) × 100%
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Perhitungan otomatis relasi kebahasaan titik acuan <strong>Desa {currentActiveSurvey?.desa || 'Aktif'}</strong> dengan titik-titik pembanding:
              </p>

              {/* Dialectometry Categories Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  <span>1. Tidak Berbeda (≤ 20%)</span>
                  <span className="font-bold">{dialectometrySummary.tidakBerbedaCount} titik</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
                  <span>2. Perbedaan Wicara (21% – 30%)</span>
                  <span className="font-bold">{dialectometrySummary.bedaWicaraCount} titik</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                  <span>3. Perbedaan Subdialek (31% – 50%)</span>
                  <span className="font-bold">{dialectometrySummary.bedaSubdialekCount} titik</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60">
                  <span>4. Perbedaan Dialek (51% – 80%)</span>
                  <span className="font-bold">{dialectometrySummary.bedaDialekCount} titik</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                  <span>5. Perbedaan Bahasa (81% – 100%)</span>
                  <span className="font-bold">{dialectometrySummary.bedaBahasaCount} titik</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onNavigateToDialekPeta || onSwitchToEditor}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-rose-600" />
              <span>Buka Klaster D3 & Radar Dialektometri ➔</span>
            </button>
          </div>
        </div>

        {/* BENTO STATISTIK DESKRIPTIF SEBARAN DIALEK & AGREGAT LEKSIKAL (FULL 12 COLS) */}
        <div className="lg:col-span-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-5 transition-all">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-xs">
                  <BarChart3 className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>Statistik Deskriptif Sebaran Dialek & Variasi Leksikal Agregat</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      Guiter Formula
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Sebaran jumlah titik pengamatan (TP) per provinsi dan rata-rata persentase perbedaan leksikal secara agregat antartitik observasi.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Province Filter */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="text-xs text-slate-400 shrink-0 font-medium">Filter Wilayah:</span>
              <select
                value={selectedProvinceFilter}
                onChange={(e) => setSelectedProvinceFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">Semua Provinsi ({descriptiveDialectStats.totalSurveys} TP)</option>
                {descriptiveDialectStats.provinceList.map((p) => (
                  <option key={p.provinsi} value={p.provinsi}>
                    {p.provinsi} ({p.count} TP - {p.percent}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4 Summary Stat KPI Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Tile 1: Rata-Rata Perbedaan Leksikal Agregat */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-white dark:from-indigo-950/40 dark:via-blue-950/20 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/60 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
                  Rata-rata Beda Leksikal Agregat
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black font-mono tracking-tight text-indigo-600 dark:text-indigo-400">
                    {descriptiveDialectStats.aggregateAvgDiff}%
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/70 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800">
                    {descriptiveDialectStats.aggregateGuiterStatus.kategori}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                Dihitung dari {descriptiveDialectStats.totalComparisons} pasangan TP menurut rumus Guiter <em>d = (s/n) × 100%</em>.
              </p>
            </div>

            {/* Tile 2: Total Titik Pengamatan & Cakupan Wilayah */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 via-sky-50/40 to-white dark:from-blue-950/40 dark:via-sky-950/20 dark:to-slate-900 border border-blue-100 dark:border-blue-900/60 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400 block mb-1">
                  Total Titik Pengamatan (TP)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black font-mono tracking-tight text-blue-700 dark:text-sky-400">
                    {descriptiveDialectStats.totalSurveys}
                  </span>
                  <span className="text-xs text-blue-600 dark:text-sky-300 font-bold">
                    titik desa survei
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                Tersebar di <strong>{descriptiveDialectStats.provinceList.length} provinsi</strong> dan {descriptiveDialectStats.totalKabupatenCount} kabupaten/kota.
              </p>
            </div>

            {/* Tile 3: Keseragaman Bentuk Kata (Homogenitas) */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900 border border-emerald-100 dark:border-emerald-900/60 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                  Indeks Keseragaman Bentuk
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
                    {Math.max(0, Math.round((100 - descriptiveDialectStats.aggregateAvgDiff) * 10) / 10)}%
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-300 font-bold">
                    kesamaan leksikon
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                Persentase rata-rata kosakata yang berwujud sama / identik antardesa.
              </p>
            </div>

            {/* Tile 4: Rentang Variasi (Min - Max) */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/70 via-pink-50/40 to-white dark:from-purple-950/40 dark:via-pink-950/20 dark:to-slate-900 border border-purple-100 dark:border-purple-900/60 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-1">
                  Rentang Perbedaan Leksikal
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black font-mono tracking-tight text-purple-600 dark:text-purple-400">
                    {descriptiveDialectStats.minDiff}%
                  </span>
                  <span className="text-xs text-slate-400 font-bold">—</span>
                  <span className="text-2xl font-black font-mono tracking-tight text-purple-600 dark:text-purple-400">
                    {descriptiveDialectStats.maxDiff}%
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                Rata-rata intra-provinsi: <strong>{descriptiveDialectStats.intraAvgDiff}%</strong> • Inter-provinsi: <strong>{descriptiveDialectStats.interAvgDiff}%</strong>.
              </p>
            </div>
          </div>

          {/* Dual Panel Layout: Sebaran TP per Provinsi (Left) & Distribusi Frekuensi Klasifikasi Guiter (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
            
            {/* Panel Kiri: Sebaran Titik Pengamatan Per Provinsi (6 COLS) */}
            <div className="lg:col-span-6 p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    <MapPin className="w-3.5 h-3.5" />
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Jumlah Titik Pengamatan per Provinsi
                  </h4>
                </div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {descriptiveDialectStats.provinceList.length} Provinsi Terdata
                </span>
              </div>

              {/* Province Rows */}
              <div className="space-y-3">
                {descriptiveDialectStats.provinceList
                  .filter(p => selectedProvinceFilter === 'all' || p.provinsi === selectedProvinceFilter)
                  .map((prov) => (
                    <div 
                      key={prov.provinsi}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                            {prov.provinsi}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-blue-600 dark:text-sky-400 font-mono">
                            {prov.count} TP
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({prov.percent}%)
                          </span>
                        </div>
                      </div>

                      {/* Visual Progress Bar */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(8, prov.percent)}%` }}
                        />
                      </div>

                      {/* Details row: languages, avg diff, and villages */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Bahasa: </span>
                          <span>{prov.languages.join(', ') || 'Bahasa Sunda'}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">Rata-rata Selisih Leksikal: </span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{prov.avgLexicalDiff}%</span>
                        </div>
                      </div>

                      {/* Village Tags */}
                      <div className="flex flex-wrap items-center gap-1 pt-0.5">
                        <span className="text-[10px] text-slate-400 font-medium mr-1">Titik Desa:</span>
                        {prov.desaNames.slice(0, 5).map((d, dIdx) => (
                          <span 
                            key={dIdx}
                            className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          >
                            {d}
                          </span>
                        ))}
                        {prov.desaNames.length > 5 && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            +{prov.desaNames.length - 5} lainnya
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Panel Kanan: Distribusi Frekuensi Klasifikasi Guiter Agregat (6 COLS) */}
            <div className="lg:col-span-6 p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      <Scale className="w-3.5 h-3.5" />
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Distribusi Persentase Perbedaan Leksikal Pasangan TP
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                    {descriptiveDialectStats.totalComparisons} Pasangan
                  </span>
                </div>

                {/* Categories progress bars */}
                <div className="space-y-2.5 mt-3 text-xs">
                  {/* Category 1: Tidak Berbeda (<=20%) */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/70 dark:border-emerald-900/60 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                        1. Tidak Berbeda (≤ 20%)
                      </span>
                      <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300">
                        {descriptiveDialectStats.categories.tidakBerbeda.count} pasangan ({descriptiveDialectStats.categories.tidakBerbeda.pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(4, descriptiveDialectStats.categories.tidakBerbeda.pct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Category 2: Perbedaan Wicara (21% - 30%) */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-sky-200/70 dark:border-sky-900/60 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-sky-700 dark:text-sky-400">
                        2. Perbedaan Wicara (21% – 30%)
                      </span>
                      <span className="font-mono font-bold text-sky-800 dark:text-sky-300">
                        {descriptiveDialectStats.categories.wicara.count} pasangan ({descriptiveDialectStats.categories.wicara.pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-sky-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(4, descriptiveDialectStats.categories.wicara.pct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Category 3: Perbedaan Subdialek (31% - 50%) */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/70 dark:border-amber-900/60 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-amber-700 dark:text-amber-400">
                        3. Perbedaan Subdialek (31% – 50%)
                      </span>
                      <span className="font-mono font-bold text-amber-800 dark:text-amber-300">
                        {descriptiveDialectStats.categories.subdialek.count} pasangan ({descriptiveDialectStats.categories.subdialek.pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(4, descriptiveDialectStats.categories.subdialek.pct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Category 4: Perbedaan Dialek (51% - 80%) */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-orange-200/70 dark:border-orange-900/60 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-orange-700 dark:text-orange-400">
                        4. Perbedaan Dialek (51% – 80%)
                      </span>
                      <span className="font-mono font-bold text-orange-800 dark:text-orange-300">
                        {descriptiveDialectStats.categories.dialek.count} pasangan ({descriptiveDialectStats.categories.dialek.pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-orange-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(4, descriptiveDialectStats.categories.dialek.pct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Category 5: Perbedaan Bahasa (81% - 100%) */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200/70 dark:border-rose-900/60 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-rose-700 dark:text-rose-400">
                        5. Perbedaan Bahasa (81% – 100%)
                      </span>
                      <span className="font-mono font-bold text-rose-800 dark:text-rose-300">
                        {descriptiveDialectStats.categories.bahasa.count} pasangan ({descriptiveDialectStats.categories.bahasa.pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-rose-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(4, descriptiveDialectStats.categories.bahasa.pct)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Links */}
              <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Intra-Provinsi: <strong className="text-slate-800 dark:text-slate-200">{descriptiveDialectStats.intraAvgDiff}%</strong></span>
                  <span className="mx-1.5">•</span>
                  <span>Inter-Provinsi: <strong className="text-slate-800 dark:text-slate-200">{descriptiveDialectStats.interAvgDiff}%</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  {onNavigateToKosakata && (
                    <button
                      type="button"
                      onClick={onNavigateToKosakata}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800/80 transition-colors cursor-pointer"
                    >
                      <Globe2 className="w-3.5 h-3.5" />
                      <span>Peta Virtual Isoglos →</span>
                    </button>
                  )}
                  {onNavigateToDialekPeta && (
                    <button
                      type="button"
                      onClick={onNavigateToDialekPeta}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800/80 transition-colors cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Radar Dialektometri →</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BENTO 6: TABEL DAFTAR TITIK PENGAMATAN LENGKAP (FULL 12 COLS) */}
        <div className="lg:col-span-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm space-y-4 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Daftar Titik Survei & Log Lapangan ({surveys.length})</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kelola data observasi, status verifikasi surveyor, dan ekspor instrumen.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari desa, bahasa, kecamatan..."
                  value={searchTableQuery}
                  onChange={(e) => setSearchTableQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500 w-48 sm:w-60"
                />
              </div>

              <select
                value={tableFilterStatus}
                onChange={(e: any) => setTableFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="complete">Lengkap (100%)</option>
                <option value="in_progress">Dalam Proses (&lt;100%)</option>
              </select>

              <button
                type="button"
                onClick={() => downloadSurveysSummaryCSV(surveys)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Unduh CSV</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Titik / Desa</th>
                  <th className="px-4 py-3">Bahasa Digunakan</th>
                  <th className="px-4 py-3">Wilayah</th>
                  <th className="px-4 py-3">Surveyor</th>
                  <th className="px-4 py-3">Kelengkapan</th>
                  <th className="px-4 py-3">Status Verifikasi</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSurveys.map((s) => {
                  const isActive = s.id === activeSurveyId;
                  const isLatestItem = latestSurvey ? s.id === latestSurvey.id : false;
                  return (
                    <tr 
                      key={s.id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                        isActive ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isLatestItem ? 'bg-blue-600 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`} />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                              <span>Desa {s.desa || s.title}</span>
                              {isLatestItem && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                  Terbaru
                                </span>
                              )}
                              {isActive && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                  Aktif
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: {s.id.slice(0, 16)}...
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                        {s.bahasa || '-'}
                      </td>
                      <td className="px-4 py-3">
                        {s.kecamatan ? `Kec. ${s.kecamatan}, ` : ''}{s.kabupatenKota || '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {s.createdByName || 'Surveyor'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${s.progress === 100 ? 'bg-emerald-600' : 'bg-blue-600'}`}
                              style={{ width: `${s.progress}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{s.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {canUserVerifySurvey(currentUser) && onToggleVerify ? (
                          <button
                            type="button"
                            onClick={() => onToggleVerify(s.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer transition-colors ${
                              s.isVerified
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 hover:bg-amber-200'
                            }`}
                            title="Klik untuk mengubah status verifikasi (Wewenang Verifikator / Admin)"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>{s.isVerified ? 'Terverifikasi' : 'Verifikasi Sekarang'}</span>
                          </button>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            s.isVerified
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {s.isVerified ? '✓ Terverifikasi' : 'Menunggu'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectSurvey(s.id);
                              onSwitchToEditor();
                            }}
                            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 cursor-pointer"
                            title={canUserEditSurvey(s, currentUser).allowed ? "Buka dan edit kuesioner" : "Buka dan telaah kuesioner (Hanya Baca)"}
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          {currentUser?.role !== 'tamu' && (
                            <button
                              type="button"
                              onClick={() => onDuplicate(s.id)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 cursor-pointer"
                              title="Duplikasi formulir survei"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => downloadSingleSurveyJSON(s)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 cursor-pointer"
                            title="Unduh file JSON survei ini"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {canUserDeleteSurvey(s, currentUser) && surveys.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Hapus formulir survei Desa ${s.desa || s.title}?`)) {
                                  onDelete(s.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                              title="Hapus formulir survei"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
