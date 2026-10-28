import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  MapPin, 
  Languages, 
  Filter, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Volume2, 
  Download, 
  Share2, 
  ChevronRight, 
  ArrowUpDown, 
  Activity, 
  GitCompare, 
  Eye, 
  HelpCircle,
  FileSpreadsheet,
  RotateCcw,
  BarChart2,
  TableProperties,
  LayoutList,
  Grid,
  ListFilter,
  Check,
  ChevronDown,
  Globe2,
  User,
  ShieldCheck,
  UserCheck,
  Building,
  Percent
} from 'lucide-react';
import { 
  SurveyRecord, 
  InstrumenPemetaanBahasaData, 
  KosakataItem, 
  KosakataBudayaBidang 
} from '../../types/linguistic';
import { AppUser } from '../../types/auth';
import { getCurrentUser } from '../../utils/authStorage';
import { INITIAL_SWADESH_LIST, SWADESH_200_GLOS } from '../../data/swadeshList';
import { PetaVirtualIsoglosView, PointGeoData } from './PetaVirtualIsoglosView';
import { KelengkapanKosakataSwadeshRoster } from '../kosakata/KelengkapanKosakataSwadeshRoster';

interface KosakataPerBahasaViewProps {
  surveys: SurveyRecord[];
  activeSurveyData: InstrumenPemetaanBahasaData;
  activeSurveyId?: string;
  onSelectSurvey?: (id: string) => void;
  onNavigateToForm?: (surveyId: string) => void;
  canEdit?: boolean;
  currentUser?: AppUser | null;
  onOpenProfile?: () => void;
}

export const KosakataPerBahasaView: React.FC<KosakataPerBahasaViewProps> = ({
  surveys,
  activeSurveyData,
  activeSurveyId,
  onSelectSurvey,
  onNavigateToForm,
  canEdit = true,
  currentUser: propUser,
  onOpenProfile
}) => {
  const activeUser = propUser || getCurrentUser();
  const isAdmin = activeUser?.role === 'admin' || activeUser?.email === 'derana.apps@gmail.com';
  // Navigation View Tab: 'analisis_kesamaan' | 'peta_isoglos' | 'korpus_perbahasa' | 'kelengkapan_swadesh'
  const [activeTab, setActiveTab] = useState<'analisis_kesamaan' | 'peta_isoglos' | 'korpus_perbahasa' | 'kelengkapan_swadesh'>('analisis_kesamaan');
  const [selectedGlossForMap, setSelectedGlossForMap] = useState<string | undefined>(undefined);

  // Filter States
  const [selectedProvinsi, setSelectedProvinsi] = useState<string>('all');
  const [selectedBahasa, setSelectedBahasa] = useState<string>('all');
  const [selectedKategori, setSelectedKategori] = useState<'all' | 'swadesh' | 'budaya'>('swadesh');
  const [similarityFilter, setSimilarityFilter] = useState<'all' | 'homogen' | 'variasi' | 'isolat'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // View mode in Tab 1: 'cards' | 'matrix'
  const [viewMode, setViewMode] = useState<'cards' | 'matrix'>('cards');
  // Range filter for 200 Swadesh words (all, 1-50, 51-100, 101-150, 151-200)
  const [swadeshRange, setSwadeshRange] = useState<'all' | '1-50' | '51-100' | '101-150' | '151-200'>('all');
  // Global expand state for cards
  const [expandAllCards, setExpandAllCards] = useState<boolean>(false);

  // Tab 2 controls
  const [langTabCategory, setLangTabCategory] = useState<'swadesh' | 'budaya' | 'all'>('swadesh');
  const [langTabRange, setLangTabRange] = useState<'all' | '1-50' | '51-100' | '101-150' | '151-200'>('all');

  // Expandable row state for analysis
  const [expandedGlossId, setExpandedGlossId] = useState<string | null>(null);

  // Audio playing simulation/state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Coordinate resolver for observation points
  const resolvePointCoords = (
    pData: InstrumenPemetaanBahasaData,
    desa: string,
    kabupaten: string,
    idx: number
  ): { lat: number; lng: number } => {
    const rawLat = parseFloat(String(pData?.situasiGeografis?.koordinatLintang || ''));
    const rawLng = parseFloat(String(pData?.situasiGeografis?.koordinatBujur || ''));

    if (!isNaN(rawLat) && !isNaN(rawLng) && Math.abs(rawLat) > 0.01 && Math.abs(rawLng) > 0.01) {
      return { lat: rawLat, lng: rawLng };
    }

    const d = desa.toLowerCase();
    const k = kabupaten.toLowerCase();

    if (d.includes('bojongsoang') || k.includes('bandung')) return { lat: -6.9850, lng: 107.6320 };
    if (d.includes('cikaso') || k.includes('sukabumi')) return { lat: -7.0250, lng: 106.8500 };
    if (d.includes('rancabuaya') || k.includes('garut')) return { lat: -7.5340, lng: 107.5250 };
    if (d.includes('babakan') || d.includes('pangandaran') || k.includes('pangandaran')) return { lat: -7.6880, lng: 108.6480 };
    if (d.includes('cisolok') || d.includes('pelabuhan')) return { lat: -6.9550, lng: 106.4500 };
    if (d.includes('kuningan') || k.includes('kuningan')) return { lat: -6.9760, lng: 108.4830 };
    if (d.includes('cirebon') || k.includes('cirebon')) return { lat: -6.7320, lng: 108.5520 };
    if (d.includes('banten') || k.includes('lebak') || k.includes('serang')) return { lat: -6.5300, lng: 106.2100 };
    if (d.includes('banyumas') || k.includes('cilacap')) return { lat: -7.5200, lng: 109.2800 };

    // Systematic geographic dispersion across West Java
    const baseLat = -6.92 - (idx * 0.18);
    const baseLng = 107.25 + ((idx % 4) * 0.35);
    return { lat: baseLat, lng: baseLng };
  };

  // 1. EXTRACT ALL OBSERVATION POINTS (TP) WITH STANDARDIZED PROVINCE & LANGUAGE
  const allPoints: PointGeoData[] = useMemo(() => {
    // Collect from surveys prop
    const pointsList: PointGeoData[] = [];

    surveys.forEach((s, idx) => {
      const pData = s.data || ({} as InstrumenPemetaanBahasaData);
      const desa = s.data?.titikPengamatan?.namaDesa || s.title || s.desa || 'Desa Tanpa Nama';
      const kec = s.data?.titikPengamatan?.kecamatan || '';
      const kab = s.data?.titikPengamatan?.kabupatenKota || '';
      const prov = (s.provinsi || s.data?.titikPengamatan?.provinsi || 'Jawa Barat').trim();
      const bahasa = (s.bahasa || s.data?.titikPengamatan?.bahasaDigunakan || 'Bahasa Sunda').trim();
      const coords = resolvePointCoords(pData, desa, kab, idx);

      pointsList.push({
        id: s.id,
        desa,
        kecamatan: kec,
        kabupaten: kab,
        provinsi: prov,
        bahasa,
        lat: coords.lat,
        lng: coords.lng,
        data: pData,
        isVerified: s.isVerified
      });
    });

    // Ensure active survey is included if not in surveys list
    if (activeSurveyData && !pointsList.some(p => p.id === activeSurveyId)) {
      const desa = activeSurveyData.titikPengamatan?.namaDesa || 'Titik Acuan Aktif';
      const kec = activeSurveyData.titikPengamatan?.kecamatan || '';
      const kab = activeSurveyData.titikPengamatan?.kabupatenKota || '';
      const prov = (activeSurveyData.titikPengamatan?.provinsi || 'Jawa Barat').trim();
      const bahasa = (activeSurveyData.titikPengamatan?.bahasaDigunakan || 'Bahasa Sunda').trim();
      const coords = resolvePointCoords(activeSurveyData, desa, kab, pointsList.length);

      pointsList.unshift({
        id: activeSurveyId || 'active-tp',
        desa,
        kecamatan: kec,
        kabupaten: kab,
        provinsi: prov,
        bahasa,
        lat: coords.lat,
        lng: coords.lng,
        data: activeSurveyData,
        isVerified: true
      });
    }

    return pointsList;
  }, [surveys, activeSurveyData, activeSurveyId]);

  // 2. DYNAMIC DROPDOWN LISTS
  const availableProvinces = useMemo(() => {
    const provSet = new Set<string>();
    allPoints.forEach(p => {
      if (p.provinsi) provSet.add(p.provinsi);
    });
    // Add default representative provinces if list is small
    ['Jawa Barat', 'Banten', 'Jawa Tengah', 'Maluku'].forEach(p => provSet.add(p));
    return Array.from(provSet).sort();
  }, [allPoints]);

  const availableLanguages = useMemo(() => {
    const langSet = new Set<string>();
    allPoints.forEach(p => {
      if (p.bahasa) langSet.add(p.bahasa);
    });
    if (langSet.size === 0) langSet.add('Bahasa Sunda');
    return Array.from(langSet).sort();
  }, [allPoints]);

  // Filtered observation points based on selected province and language
  const filteredPoints = useMemo(() => {
    return allPoints.filter(p => {
      if (selectedProvinsi !== 'all' && p.provinsi.toLowerCase() !== selectedProvinsi.toLowerCase()) {
        return false;
      }
      if (selectedBahasa !== 'all' && p.bahasa.toLowerCase() !== selectedBahasa.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [allPoints, selectedProvinsi, selectedBahasa]);

  // 3. BUILD AGGREGATED CORPUS PER GLOSS WITH CROSS-TP ANALYSIS
  interface GlossAnalysisItem {
    id: string;
    nomorGlos: number;
    glosIndonesia: string;
    kategori: 'swadesh' | 'budaya';
    subkategori?: string;
    // Local words used by each TP
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
    // Aggregation of unique forms
    uniqueForms: {
      bentuk: string;
      count: number;
      percentage: number;
      tpList: string[]; // List of Desa names
    }[];
    // Homogeneity classification
    statusKesamaan: 'homogen' | 'variasi' | 'isolat';
    dominantPercentage: number;
    totalFilledTP: number;
  }

  const glossAnalysisList = useMemo(() => {
    const map = new Map<string, GlossAnalysisItem>();

    // 0. Pre-populate ALL 200 basic vocabulary words from INITIAL_SWADESH_LIST
    INITIAL_SWADESH_LIST.forEach((sItem) => {
      const glosKey = `swadesh-${sItem.id}-${sItem.glosIndonesia.trim().toLowerCase()}`;
      map.set(glosKey, {
        id: glosKey,
        nomorGlos: sItem.id,
        glosIndonesia: sItem.glosIndonesia,
        kategori: 'swadesh',
        tpValues: [],
        uniqueForms: [],
        statusKesamaan: 'homogen',
        dominantPercentage: 0,
        totalFilledTP: 0
      });
    });

    // Scan through all filtered observation points
    filteredPoints.forEach(tp => {
      // 1. Swadesh List
      const swadeshList = tp.data?.kosakataLengkap?.swadeshList || [];
      swadeshList.forEach(item => {
        const glosKey = `swadesh-${item.id}-${(item.glosIndonesia || '').trim().toLowerCase()}`;
        if (!map.has(glosKey)) {
          map.set(glosKey, {
            id: glosKey,
            nomorGlos: typeof item.id === 'number' ? item.id : parseInt(String(item.id), 10) || 0,
            glosIndonesia: item.glosIndonesia || `Glos #${item.id}`,
            kategori: 'swadesh',
            tpValues: [],
            uniqueForms: [],
            statusKesamaan: 'homogen',
            dominantPercentage: 0,
            totalFilledTP: 0
          });
        }

        const entry = map.get(glosKey)!;
        if (item.bentukLokal && item.bentukLokal.trim()) {
          entry.tpValues.push({
            tpId: tp.id,
            desa: tp.desa,
            provinsi: tp.provinsi,
            bahasa: tp.bahasa,
            bentukLokal: item.bentukLokal.trim(),
            transkripsiFonetis: item.transkripsiIPA?.trim() || '',
            audioUrl: item.audioUrl,
            catatan: item.catatan
          });
        }
      });

      // 2. Kosakata Budaya
      const budayaGroups = tp.data?.kosakataLengkap?.kosakataBudaya || [];
      budayaGroups.forEach(group => {
        (group.daftarKata || []).forEach(item => {
          const glosKey = `budaya-${item.id}-${(item.glosIndonesia || '').trim().toLowerCase()}`;
          if (!map.has(glosKey)) {
            map.set(glosKey, {
              id: glosKey,
              nomorGlos: typeof item.id === 'number' ? item.id : parseInt(String(item.id), 10) || 0,
              glosIndonesia: item.glosIndonesia || String(item.id),
              kategori: 'budaya',
              subkategori: group.namaBidang,
              tpValues: [],
              uniqueForms: [],
              statusKesamaan: 'homogen',
              dominantPercentage: 0,
              totalFilledTP: 0
            });
          }

          const entry = map.get(glosKey)!;
          if (item.bentukLokal && item.bentukLokal.trim()) {
            entry.tpValues.push({
              tpId: tp.id,
              desa: tp.desa,
              provinsi: tp.provinsi,
              bahasa: tp.bahasa,
              bentukLokal: item.bentukLokal.trim(),
              transkripsiFonetis: item.transkripsiIPA?.trim() || '',
              audioUrl: item.audioUrl,
              catatan: item.catatan
            });
          }
        });
      });
    });

    // Compute unique forms, percentages, and similarity classification for each gloss
    const result: GlossAnalysisItem[] = [];
    map.forEach(item => {
      const totalTP = item.tpValues.length;
      item.totalFilledTP = totalTP;

      if (totalTP > 0) {
        // Group by normalized local word form (lowercase, trim)
        const formMap = new Map<string, { count: number; rawBentuk: string; desaList: string[] }>();
        item.tpValues.forEach(tp => {
          const norm = tp.bentukLokal.toLowerCase().trim();
          if (!formMap.has(norm)) {
            formMap.set(norm, { count: 0, rawBentuk: tp.bentukLokal, desaList: [] });
          }
          const f = formMap.get(norm)!;
          f.count++;
          f.desaList.push(tp.desa);
        });

        // Convert to array sorted by frequency
        item.uniqueForms = Array.from(formMap.entries())
          .map(([_, f]) => ({
            bentuk: f.rawBentuk,
            count: f.count,
            percentage: Math.round((f.count / totalTP) * 100),
            tpList: f.desaList
          }))
          .sort((a, b) => b.count - a.count);

        const dominant = item.uniqueForms[0];
        item.dominantPercentage = dominant ? dominant.percentage : 0;

        // Classification
        if (item.uniqueForms.length === 1 || dominant.percentage === 100) {
          item.statusKesamaan = 'homogen'; // 100% Identical in all points
        } else if (dominant.percentage >= 60) {
          item.statusKesamaan = 'variasi'; // Dominant form exists with minor variations
        } else {
          item.statusKesamaan = 'isolat'; // Highly diverged or unique forms
        }
      } else {
        item.uniqueForms = [];
        item.dominantPercentage = 0;
        item.statusKesamaan = 'homogen';
      }

      result.push(item);
    });

    // Sort by Swadesh first (#1 to #200), then Budaya
    return result.sort((a, b) => {
      if (a.kategori === 'swadesh' && b.kategori === 'swadesh') {
        return a.nomorGlos - b.nomorGlos;
      }
      if (a.kategori === 'swadesh') return -1;
      if (b.kategori === 'swadesh') return 1;
      return a.nomorGlos - b.nomorGlos;
    });
  }, [filteredPoints]);

  // 4. APPLY SEARCH & FILTERS ON GLOSS ANALYSIS LIST
  const filteredAnalysisList = useMemo(() => {
    return glossAnalysisList.filter(item => {
      // Category filter
      if (selectedKategori !== 'all' && item.kategori !== selectedKategori) {
        return false;
      }

      // Swadesh Range filter if swadesh category and range is specified
      if (selectedKategori === 'swadesh' && swadeshRange !== 'all') {
        if (swadeshRange === '1-50' && (item.nomorGlos < 1 || item.nomorGlos > 50)) return false;
        if (swadeshRange === '51-100' && (item.nomorGlos < 51 || item.nomorGlos > 100)) return false;
        if (swadeshRange === '101-150' && (item.nomorGlos < 101 || item.nomorGlos > 150)) return false;
        if (swadeshRange === '151-200' && (item.nomorGlos < 151 || item.nomorGlos > 200)) return false;
      }

      // Similarity status filter
      if (similarityFilter !== 'all' && item.statusKesamaan !== similarityFilter) {
        return false;
      }

      // Query search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchIndo = item.glosIndonesia.toLowerCase().includes(q);
        const matchForms = item.uniqueForms.some(f => f.bentuk.toLowerCase().includes(q));
        const matchDesa = item.tpValues.some(v => v.desa.toLowerCase().includes(q));
        const matchSub = item.subkategori?.toLowerCase().includes(q);
        if (!matchIndo && !matchForms && !matchDesa && !matchSub) {
          return false;
        }
      }

      return true;
    });
  }, [glossAnalysisList, selectedKategori, swadeshRange, similarityFilter, searchQuery]);

  // 5. SUMMARY METRICS FOR HOMOGENEITY
  const metrics = useMemo(() => {
    const totalGlos = glossAnalysisList.length;
    if (totalGlos === 0) {
      return {
        totalGlos: 0,
        homogenCount: 0,
        variasiCount: 0,
        isolatCount: 0,
        avgHomogeneity: 0,
        totalPoints: filteredPoints.length
      };
    }

    const homogenCount = glossAnalysisList.filter(i => i.statusKesamaan === 'homogen').length;
    const variasiCount = glossAnalysisList.filter(i => i.statusKesamaan === 'variasi').length;
    const isolatCount = glossAnalysisList.filter(i => i.statusKesamaan === 'isolat').length;
    const totalPercentage = glossAnalysisList.reduce((acc, i) => acc + i.dominantPercentage, 0);
    const avgHomogeneity = Math.round(totalPercentage / totalGlos);

    return {
      totalGlos,
      homogenCount,
      variasiCount,
      isolatCount,
      avgHomogeneity,
      totalPoints: filteredPoints.length
    };
  }, [glossAnalysisList, filteredPoints]);

  // 6. GROUPED CORPUS BY LANGUAGE (FOR MODE 2)
  const languageGroups = useMemo(() => {
    const map = new Map<string, {
      languageName: string;
      provinces: Set<string>;
      points: typeof allPoints;
      swadeshCount: number;
      budayaCount: number;
    }>();

    allPoints.forEach(p => {
      // Filter by province if set
      if (selectedProvinsi !== 'all' && p.provinsi.toLowerCase() !== selectedProvinsi.toLowerCase()) {
        return;
      }
      if (selectedBahasa !== 'all' && p.bahasa.toLowerCase() !== selectedBahasa.toLowerCase()) {
        return;
      }

      const lName = p.bahasa || 'Bahasa Sunda';
      if (!map.has(lName)) {
        map.set(lName, {
          languageName: lName,
          provinces: new Set(),
          points: [],
          swadeshCount: 0,
          budayaCount: 0
        });
      }

      const group = map.get(lName)!;
      group.provinces.add(p.provinsi);
      group.points.push(p);

      // Count vocabulary
      const sList = p.data?.kosakataLengkap?.swadeshList || [];
      group.swadeshCount += sList.filter(i => i.bentukLokal?.trim()).length;

      const bGroups = p.data?.kosakataLengkap?.kosakataBudaya || [];
      bGroups.forEach(bg => {
        group.budayaCount += (bg.daftarKata || []).filter(i => i.bentukLokal?.trim()).length;
      });
    });

    return Array.from(map.values()).sort((a, b) => b.points.length - a.points.length);
  }, [allPoints, selectedProvinsi, selectedBahasa]);

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'No Glos',
      'Kategori',
      'Glos Indonesia',
      'Bentuk Seragam / Dominan',
      'Persentase Kesamaan (%)',
      'Status Kesamaan',
      'Jumlah TP Terdata',
      'Detail Variasi per TP'
    ];

    const rows = filteredAnalysisList.map(item => {
      const dominant = item.uniqueForms[0]?.bentuk || '-';
      const detailTP = item.tpValues.map(v => `${v.desa}: ${v.bentukLokal}`).join('; ');
      return [
        item.nomorGlos,
        `"${item.kategori}"`,
        `"${item.glosIndonesia}"`,
        `"${dominant}"`,
        item.dominantPercentage,
        `"${item.statusKesamaan === 'homogen' ? '100% Seragam' : item.statusKesamaan === 'variasi' ? 'Variasi Dialek' : 'Isolat / Beragam'}"`,
        item.totalFilledTP,
        `"${detailTP.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Analisis_Kosakata_Antar_TP_${selectedProvinsi}_${selectedBahasa}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export CSV for a specific language corpus
  const handleExportLanguageCSV = (lg: { languageName: string; points: typeof allPoints; provinces: Set<string> }) => {
    const langItems = glossAnalysisList.filter(g => {
      if (langTabCategory === 'swadesh') return g.kategori === 'swadesh';
      if (langTabCategory === 'budaya') return g.kategori === 'budaya';
      return true;
    });

    const headers = [
      'No Glos',
      'Glos Indonesia',
      'Kategori',
      ...lg.points.map(p => `"${p.desa} (${p.provinsi}) - Bentuk Lokal"`),
      ...lg.points.map(p => `"${p.desa} - Transkripsi IPA"`)
    ];

    const rows = langItems.map(item => {
      const row = [
        item.nomorGlos,
        `"${item.glosIndonesia}"`,
        `"${item.kategori}"`
      ];
      lg.points.forEach(p => {
        const val = item.tpValues.find(v => v.tpId === p.id);
        row.push(`"${(val?.bentukLokal || '-').replace(/"/g, '""')}"`);
      });
      lg.points.forEach(p => {
        const val = item.tpValues.find(v => v.tpId === p.id);
        row.push(`"${(val?.transkripsiFonetis || '-').replace(/"/g, '""')}"`);
      });
      return row;
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Korpus_${langTabCategory === 'swadesh' ? '200_Swadesh' : 'Kosakata'}_${lg.languageName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const playAudio = (audioId: string, url?: string) => {
    if (!url) {
      alert('Audio rekaman belum tersedia untuk butir ini.');
      return;
    }
    try {
      const audio = new Audio(url);
      setPlayingAudioId(audioId);
      audio.play();
      audio.onended = () => setPlayingAudioId(null);
      audio.onerror = () => setPlayingAudioId(null);
    } catch {
      setPlayingAudioId(null);
    }
  };

  // Real-time project Swadesh completion rate for summary banner
  const swadeshProjectCompletionRate = useMemo(() => {
    const allTargets = [
      activeSurveyData?.kosakataLengkap?.swadeshList || [],
      ...surveys.filter(s => s.id !== activeSurveyId).map(s => s.data?.kosakataLengkap?.swadeshList || [])
    ];
    if (allTargets.length === 0) return 0;
    const totalItems = allTargets.length * 200;
    const filledItems = allTargets.reduce(
      (acc, list) => acc + list.filter(w => w.bentukLokal && w.bentukLokal.trim() !== '').length, 
      0
    );
    return totalItems > 0 ? Math.round((filledItems / totalItems) * 1000) / 10 : 0;
  }, [surveys, activeSurveyData, activeSurveyId]);

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HERO HEADER & BANNER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-sky-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
                <BookOpen className="w-3 h-3 text-blue-600 dark:text-sky-400" />
                Korpus & Analisis Komparatif Kosakata
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Pangkalan Data: <strong>{filteredPoints.length} Titik Pengamatan (TP)</strong>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1.5 tracking-tight">
              Pangkalan Data Kosakata Bahasa Daerah & Analisis Kesamaan Antar-TP
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Jelajahi seluruh kosakata Swadesh 200 dan kosakata budaya yang telah dihimpun per bahasa dan per provinsi.
              Analisis secara langsung butir leksikon yang sama, seragam, atau bervariasi antar titik pengamatan (TP) lapangan.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-center shrink-0">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-600 dark:text-sky-400" />
              <span>Ekspor Hasil Analisis (CSV)</span>
            </button>
          </div>
        </div>

        {/* TAMPILAN PROFIL PENGGUNA (USER PROFILE CARD) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-slate-50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-slate-900 border border-blue-100 dark:border-blue-900/60 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs shrink-0 ${
              isAdmin 
                ? 'bg-gradient-to-tr from-indigo-600 to-blue-600 text-white ring-2 ring-indigo-400/20' 
                : 'bg-gradient-to-tr from-blue-600 to-sky-500 text-white ring-2 ring-blue-400/20'
            }`}>
              {activeUser?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                  {activeUser?.name || 'Pengguna Terdaftar'}
                </span>
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0">
                    <ShieldCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> Super Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                    <UserCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" /> Surveyor
                  </span>
                )}
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Sesi Aktif
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="font-mono text-slate-600 dark:text-slate-300">{activeUser?.email || 'derana.apps@gmail.com'}</span>
                <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
                <span className="flex items-center gap-1 truncate">
                  <Building className="w-3 h-3 text-slate-400 shrink-0" />
                  {activeUser?.institution || 'Badan Pengembangan dan Pembinaan Bahasa'}
                </span>
                {activeUser?.assignedRegion && (
                  <>
                    <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
                    <span className="flex items-center gap-1 truncate text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      {activeUser.assignedRegion}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            {onOpenProfile && (
              <button
                type="button"
                onClick={onOpenProfile}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
                title="Buka profil lengkap pengguna"
              >
                <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Lihat Profil Pengguna</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. SUMMARY METRICS TILES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Indeks Kesamaan Rata-Rata
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-blue-600 dark:text-sky-400 font-mono">
                {metrics.avgHomogeneity}%
              </span>
              <span className="text-xs text-slate-500 font-medium">keseragaman bentuk</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Rata-rata persentase TP dengan kata yang identik.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block mb-1">
              100% Seragam (Sama di Semua TP)
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
                {metrics.homogenCount}
              </span>
              <span className="text-xs text-emerald-600/80 font-medium">dari {metrics.totalGlos} glos</span>
            </div>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 mt-1">
              Bentuk leksikon sama persis di setiap desa.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block mb-1">
              Variasi Dialektal (2+ Bentuk)
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-amber-700 dark:text-amber-400 font-mono">
                {metrics.variasiCount}
              </span>
              <span className="text-xs text-amber-600/80 font-medium">glos bervariasi</span>
            </div>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-1">
              Terdapat perbedaan kata atau variasi fonologis.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300 block mb-1">
              Titik Pengamatan (TP) Terdata
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-purple-700 dark:text-purple-400 font-mono">
                {metrics.totalPoints}
              </span>
              <span className="text-xs text-purple-600/80 font-medium">titik desa</span>
            </div>
            <p className="text-[11px] text-purple-700/80 dark:text-purple-300/80 mt-1">
              {availableLanguages.length} bahasa di {availableProvinces.length} provinsi.
            </p>
          </div>
        </div>

        {/* INTRO MODUL KOSAKATA & PEMETAAN (PENGANTAR) */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-blue-600 text-white flex items-center gap-1 shadow-2xs">
                <Sparkles className="w-3 h-3" />
                Pengantar Modul
              </span>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                Pusat Analisis Komparasi Kosakata & Pemetaan Isoglos Spasial
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden md:inline">
              {filteredPoints.length} TP terdata • {languageGroups.length} Rumpun Bahasa
            </span>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Modul ini dirancang khusus untuk mempermudah dialektolog dan peneliti bahasa dalam menganalisis persebaran leksikal antar-titik pengamatan (TP). 
            Gunakan kartu di bawah untuk meninjau perbandingan 200 kosakata Swadesh, memproyeksikan berkas isoglos dan batas isoleks pada peta kartografi spasial, 
            serta memeriksa inventarisasi korpus kosakata per bahasa daerah.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-700/50 text-[10px] sm:text-[11px]">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Pilihan Tampilan:</span>
            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">
              🔍 1. Matriks Kesamaan TP
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">
              🗺️ 2. Peta Virtual & Berkas Isoglos
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">
              📚 3. Koleksi Korpus Per Bahasa
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-700 text-teal-800 dark:text-teal-300 font-bold">
              📊 4. Kelengkapan Swadesh Real-Time
            </span>
          </div>
        </div>

        {/* 3. PRIMARY VIEW TAB SWITCHER - CARD SHOWCASE (MINIMAL & COMPACT) */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
                Navigasi Modul Analisis
              </span>
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">
                Pilih Tampilan Kosakata & Pemetaan
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 hidden sm:inline-block">
              Klik kartu untuk beralih mode
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* BENTO CARD 1: Analisis Kosakata yang Sama di Tiap TP (200) */}
            <button
              type="button"
              onClick={() => setActiveTab('analisis_kesamaan')}
              className={`relative overflow-hidden text-left p-2.5 sm:p-3 rounded-xl border transition-all duration-150 cursor-pointer group flex flex-col justify-between ${
                activeTab === 'analisis_kesamaan'
                  ? 'bg-blue-600/10 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 shadow-2xs ring-1 ring-blue-500/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shadow-2xs shrink-0">
                    <GitCompare className="w-3.5 h-3.5" />
                  </div>
                  {activeTab === 'analisis_kesamaan' ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-600 text-white shadow-2xs shrink-0">
                      <span className="w-1 h-1 rounded-full bg-white animate-pulse"></span>
                      Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 shrink-0">
                      Matriks TP
                    </span>
                  )}
                </div>

                <h4 className="text-xs sm:text-[13px] font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                  Analisis Kosakata yang Sama di Tiap TP
                </h4>
              </div>

              <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-baseline justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-blue-600 dark:text-sky-400">
                    200
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                    Glos Swadesh
                  </span>
                </div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                  Buka →
                </span>
              </div>
            </button>

            {/* BENTO CARD 2: Peta Virtual & Berkas Isoglos (Interaktif 🗺️) */}
            <button
              type="button"
              onClick={() => setActiveTab('peta_isoglos')}
              className={`relative overflow-hidden text-left p-2.5 sm:p-3 rounded-xl border transition-all duration-150 cursor-pointer group flex flex-col justify-between ${
                activeTab === 'peta_isoglos'
                  ? 'bg-emerald-600/10 dark:bg-emerald-950/40 border-emerald-600 dark:border-emerald-500 shadow-2xs ring-1 ring-emerald-500/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-2xs shrink-0">
                    <Globe2 className="w-3.5 h-3.5" />
                  </div>
                  {activeTab === 'peta_isoglos' ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-600 text-white shadow-2xs shrink-0">
                      <span className="w-1 h-1 rounded-full bg-white animate-pulse"></span>
                      Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 shrink-0">
                      GIS Spasial
                    </span>
                  )}
                </div>

                <h4 className="text-xs sm:text-[13px] font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                  Peta Virtual & Berkas Isoglos
                </h4>
              </div>

              <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-baseline justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-black tracking-tight text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    Interaktif 🗺️
                  </span>
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                  Eksplor →
                </span>
              </div>
            </button>

            {/* BENTO CARD 3: Koleksi Korpus Per Bahasa */}
            <button
              type="button"
              onClick={() => setActiveTab('korpus_perbahasa')}
              className={`relative overflow-hidden text-left p-2.5 sm:p-3 rounded-xl border transition-all duration-150 cursor-pointer group flex flex-col justify-between ${
                activeTab === 'korpus_perbahasa'
                  ? 'bg-purple-600/10 dark:bg-purple-950/40 border-purple-600 dark:border-purple-500 shadow-2xs ring-1 ring-purple-500/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shadow-2xs shrink-0">
                    <TableProperties className="w-3.5 h-3.5" />
                  </div>
                  {activeTab === 'korpus_perbahasa' ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-purple-600 text-white shadow-2xs shrink-0">
                      <span className="w-1 h-1 rounded-full bg-white animate-pulse"></span>
                      Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 shrink-0">
                      Inventarisasi
                    </span>
                  )}
                </div>

                <h4 className="text-xs sm:text-[13px] font-extrabold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-snug">
                  Koleksi Korpus Per Bahasa
                </h4>
              </div>

              <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-baseline justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-purple-600 dark:text-purple-400">
                    {languageGroups.length}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                    Bahasa Daerah
                  </span>
                </div>
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform">
                  Korpus →
                </span>
              </div>
            </button>

            {/* BENTO CARD 4: Kelengkapan Kosakata Swadesh Real-Time Lintas Survei */}
            <button
              type="button"
              onClick={() => setActiveTab('kelengkapan_swadesh')}
              className={`relative overflow-hidden text-left p-2.5 sm:p-3 rounded-xl border transition-all duration-150 cursor-pointer group flex flex-col justify-between ${
                activeTab === 'kelengkapan_swadesh'
                  ? 'bg-teal-600/10 dark:bg-teal-950/40 border-teal-600 dark:border-teal-500 shadow-2xs ring-1 ring-teal-500/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold shadow-2xs shrink-0">
                    <Percent className="w-3.5 h-3.5" />
                  </div>
                  {activeTab === 'kelengkapan_swadesh' ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-teal-600 text-white shadow-2xs shrink-0">
                      <span className="w-1 h-1 rounded-full bg-white animate-pulse"></span>
                      Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Real-Time
                    </span>
                  )}
                </div>

                <h4 className="text-xs sm:text-[13px] font-extrabold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-snug">
                  Kelengkapan Swadesh Lintas Survei
                </h4>
              </div>

              <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-baseline justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-teal-600 dark:text-teal-400">
                    {swadeshProjectCompletionRate}%
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                    Rerata Proyek
                  </span>
                </div>
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform">
                  Pantau →
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 4. SEARCH & ADVANCED FILTER TOOLBAR (HANYA DITAMPILKAN DI TAB KORPUS/ANALISIS/ISOGLOS) */}
      {activeTab !== 'kelengkapan_swadesh' && (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
        
        {/* Quick Category / 200 Swadesh Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Tampilkan:</span>
            
            <button
              type="button"
              onClick={() => setSelectedKategori('swadesh')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedKategori === 'swadesh'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Semua 200 Kosakata Dasar Swadesh</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedKategori === 'swadesh' ? 'bg-white text-blue-700 font-extrabold' : 'bg-slate-200 dark:bg-slate-700'
              }`}>
                200 Glos
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedKategori('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedKategori === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>Semua Kosakata (Swadesh + Budaya)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedKategori('budaya')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedKategori === 'budaya'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>Kosakata Budaya Lapangan Saja</span>
            </button>
          </div>

          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            {selectedKategori === 'swadesh' ? '200 Glos Dasar Lengkap (#1 s.d. #200)' : `${filteredAnalysisList.length} Glos Aktif`}
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari arti kata Indonesia, bentuk lokal daerah, fonetis, atau nama desa..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Quick Clear */}
          {(selectedProvinsi !== 'all' || selectedBahasa !== 'all' || selectedKategori !== 'all' || similarityFilter !== 'all' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedProvinsi('all');
                setSelectedBahasa('all');
                setSelectedKategori('all');
                setSimilarityFilter('all');
                setSearchQuery('');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* 1. Filter Provinsi */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Provinsi:</span>
              <select
                value={selectedProvinsi}
                onChange={e => setSelectedProvinsi(e.target.value)}
                className="w-full bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer truncate"
              >
                <option value="all">Semua Provinsi (Nasional)</option>
                {availableProvinces.map(prov => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Filter Bahasa */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
            <Languages className="w-4 h-4 text-indigo-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Bahasa:</span>
              <select
                value={selectedBahasa}
                onChange={e => setSelectedBahasa(e.target.value)}
                className="w-full bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer truncate"
              >
                <option value="all">Semua Bahasa Daerah</option>
                {availableLanguages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Filter Kategori Kosakata */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
            <Filter className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Kategori:</span>
              <select
                value={selectedKategori}
                onChange={e => setSelectedKategori(e.target.value as any)}
                className="w-full bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer truncate"
              >
                <option value="all">Semua Kategori (Swadesh & Budaya)</option>
                <option value="swadesh">Swadesh 200 Kosakata Dasar</option>
                <option value="budaya">Kosakata Budaya Bidang Lapangan</option>
              </select>
            </div>
          </div>

          {/* 4. Filter Status Kesamaan */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
            <Activity className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Status Kesamaan TP:</span>
              <select
                value={similarityFilter}
                onChange={e => setSimilarityFilter(e.target.value as any)}
                className="w-full bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer truncate"
              >
                <option value="all">Semua Derajat Kesamaan</option>
                <option value="homogen">100% Seragam (Sama di Semua TP)</option>
                <option value="variasi">Variasi Dialek (Bentuk Beragam)</option>
                <option value="isolat">Bentuk Isolat / Divergen Tinggi</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: ANALISIS KOSAKATA YANG SAMA DI TIAP TP (PRIMARY REQUEST) */}
      {/* ========================================================================= */}
      {activeTab === 'analisis_kesamaan' && (
        <div className="space-y-4">
          {/* Sub-header Toolbar: View Mode Switcher and 200 Swadesh Range Filters */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <GitCompare className="w-4 h-4 text-blue-600" />
                  <span>Komparasi Kosakata Antar-TP:</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-sky-300 border border-blue-200 dark:border-blue-800">
                  {filteredAnalysisList.length} Glos {selectedKategori === 'swadesh' ? '(200 Swadesh Dasar)' : ''}
                </span>
                <span className="text-xs text-slate-500">
                  lintas {filteredPoints.length} Titik Pengamatan
                </span>
              </div>

              {/* View Switcher: Cards vs Matrix Table */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-sky-300 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                  title="Tampilan Kartu Analisis Terperinci"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Kartu Analisis</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('matrix')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'matrix'
                      ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-sky-300 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                  title="Tampilan Matriks Tabel Komparatif Lengkap"
                >
                  <TableProperties className="w-3.5 h-3.5" />
                  <span>Matriks Tabel 200 Glos</span>
                </button>
              </div>
            </div>

            {/* Quick Range Selector for Swadesh 200 */}
            {selectedKategori === 'swadesh' && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                    Rentang Nomor Swadesh:
                  </span>
                  {[
                    { id: 'all', label: 'Semua 200 Glos (#1 s.d. #200)' },
                    { id: '1-50', label: '#1 - #50' },
                    { id: '51-100', label: '#51 - #100' },
                    { id: '101-150', label: '#101 - #150' },
                    { id: '151-200', label: '#151 - #200' },
                  ].map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSwadeshRange(r.id as any)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                        swadeshRange === r.id
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>

                {viewMode === 'cards' && (
                  <button
                    type="button"
                    onClick={() => setExpandAllCards(!expandAllCards)}
                    className="text-[11px] font-semibold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    {expandAllCards ? 'Tutup Semua Rincian' : 'Buka Semua Rincian Kartu'}
                  </button>
                )}
              </div>
            )}
          </div>

          {filteredAnalysisList.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Tidak Ada Kosakata yang Sesuai Kriteria Pencarian
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Coba sesuaikan kata kunci pencarian atau ganti filter provinsi ({selectedProvinsi}) dan bahasa ({selectedBahasa}).
              </p>
            </div>
          ) : viewMode === 'matrix' ? (
            /* ======================================================= */
            /* VIEW 1: COMPREHENSIVE MATRIX TABLE (ALL 200 SWADESH) */
            /* ======================================================= */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-850/50">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <TableProperties className="w-4 h-4 text-blue-600" />
                    <span>Matriks Komparasi 200 Kosakata Dasar Swadesh Lintas Titik Pengamatan</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Membandingkan bentuk kata secara horizontal di setiap desa/titik pengamatan (TP) secara langsung.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-blue-700 dark:text-sky-300 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 shrink-0">
                  {filteredAnalysisList.length} Glos Ditampilkan
                </span>
              </div>

              <div className="overflow-x-auto max-h-[750px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/90 dark:bg-slate-800 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider shadow-2xs">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">No</th>
                      <th className="py-2.5 px-3 min-w-[130px]">Glos Indonesia</th>
                      <th className="py-2.5 px-3 min-w-[120px]">Bentuk Dominan</th>
                      <th className="py-2.5 px-3 min-w-[100px] text-center">% Kesamaan</th>
                      <th className="py-2.5 px-3 min-w-[120px]">Status Kesamaan</th>
                      {filteredPoints.map((tp) => (
                        <th key={tp.id} className="py-2.5 px-3 min-w-[150px] border-l border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-1 text-slate-900 dark:text-white font-bold">
                            <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                            <span>{tp.desa}</span>
                          </div>
                          <span className="block text-[9px] font-normal text-slate-400 capitalize">
                            {tp.kabupaten || tp.provinsi}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {filteredAnalysisList.map((item) => {
                      const dominant = item.uniqueForms[0];
                      return (
                        <tr 
                          key={item.id} 
                          className="hover:bg-blue-50/40 dark:hover:bg-slate-800/60 transition-colors"
                        >
                          {/* 1. Nomor Glos */}
                          <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px] font-bold">
                            #{item.nomorGlos}
                          </td>

                          {/* 2. Glos Indonesia */}
                          <td className="py-2 px-3 font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                            <div className="flex items-center gap-1.5">
                              <span>{item.glosIndonesia}</span>
                              {item.kategori === 'budaya' && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950 font-normal">
                                  Budaya
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedGlossForMap(item.id);
                                  setActiveTab('peta_isoglos');
                                  window.scrollTo({ top: 320, behavior: 'smooth' });
                                }}
                                className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-sky-400 cursor-pointer transition-colors"
                                title="Lihat berkas isoglos kata ini di peta virtual"
                              >
                                <Globe2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* 3. Bentuk Dominan */}
                          <td className="py-2 px-3 font-mono font-bold text-slate-800 dark:text-slate-100">
                            {dominant?.bentuk ? `"${dominant.bentuk}"` : '-'}
                          </td>

                          {/* 4. Persentase Kesamaan */}
                          <td className="py-2 px-3 text-center font-mono">
                            <div className="flex flex-col items-center gap-0.5">
                              <span className={`text-[11px] font-extrabold ${
                                item.dominantPercentage === 100 
                                  ? 'text-emerald-600 dark:text-emerald-400' 
                                  : item.dominantPercentage >= 60 
                                    ? 'text-amber-600 dark:text-amber-400' 
                                    : 'text-purple-600 dark:text-purple-400'
                              }`}>
                                {item.dominantPercentage}%
                              </span>
                              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  style={{ width: `${item.dominantPercentage}%` }} 
                                  className={`h-full ${
                                    item.dominantPercentage === 100 
                                      ? 'bg-emerald-500' 
                                      : item.dominantPercentage >= 60 
                                        ? 'bg-amber-500' 
                                        : 'bg-purple-500'
                                  }`}
                                />
                              </div>
                            </div>
                          </td>

                          {/* 5. Status Kesamaan Badge */}
                          <td className="py-2 px-3">
                            {item.statusKesamaan === 'homogen' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                <span>100% Seragam</span>
                              </span>
                            )}
                            {item.statusKesamaan === 'variasi' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                <Activity className="w-2.5 h-2.5 text-amber-600" />
                                <span>Variasi Dialek</span>
                              </span>
                            )}
                            {item.statusKesamaan === 'isolat' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                <AlertCircle className="w-2.5 h-2.5 text-purple-600" />
                                <span>Isolat / Beragam</span>
                              </span>
                            )}
                          </td>

                          {/* 6. Columns for Each Observation Point */}
                          {filteredPoints.map((tp) => {
                            const val = item.tpValues.find(v => v.tpId === tp.id);
                            const isDominant = val && dominant && val.bentukLokal.toLowerCase().trim() === dominant.bentuk.toLowerCase().trim();

                            return (
                              <td 
                                key={tp.id} 
                                className={`py-2 px-3 border-l border-slate-100 dark:border-slate-800/80 ${
                                  isDominant && item.dominantPercentage === 100
                                    ? 'bg-emerald-50/20 dark:bg-emerald-950/10'
                                    : !isDominant && val?.bentukLokal
                                      ? 'bg-amber-50/20 dark:bg-amber-950/10'
                                      : ''
                                }`}
                              >
                                {val?.bentukLokal ? (
                                  <div>
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                                        {val.bentukLokal}
                                      </span>
                                      {val.audioUrl && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            playAudio(`${item.id}-${val.tpId}`, val.audioUrl);
                                          }}
                                          className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                                          title="Dengarkan audio penutur"
                                        >
                                          <Volume2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                    {val.transkripsiFonetis && (
                                      <span className="block font-mono text-[10px] text-slate-500 dark:text-slate-400">
                                        {val.transkripsiFonetis}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-slate-300 dark:text-slate-600 italic text-[11px]">-</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between text-xs text-slate-500">
                <span>
                  Menampilkan seluruh <strong>{filteredAnalysisList.length} butir kosakata dasar</strong> secara komprehensif.
                </span>
                <span className="text-[11px]">
                  Bentuk dominan dan variasi terdata di setiap titik pengamatan.
                </span>
              </div>
            </div>
          ) : (
            /* ======================================================= */
            /* VIEW 2: INTERACTIVE CARDS LIST (WITH INDIVIDUAL BREAKDOWN) */
            /* ======================================================= */
            <div className="space-y-3">
              {filteredAnalysisList.map((item) => {
                const isExpanded = expandAllCards || expandedGlossId === item.id;
                const dominantForm = item.uniqueForms[0];

                return (
                  <div 
                    key={item.id}
                    className={`bg-white dark:bg-slate-900 border rounded-2xl transition-all overflow-hidden ${
                      isExpanded
                        ? 'border-blue-500 dark:border-sky-400 ring-2 ring-blue-500/10 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 shadow-2xs'
                    }`}
                  >
                    {/* Header Row */}
                    <div 
                      onClick={() => setExpandedGlossId(isExpanded ? null : item.id)}
                      className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          item.kategori === 'swadesh'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-sky-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          #{item.nomorGlos}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                              {item.glosIndonesia}
                            </h3>

                            {/* Status Badge */}
                            {item.statusKesamaan === 'homogen' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>100% Seragam (Sama di Semua TP)</span>
                              </span>
                            )}
                            {item.statusKesamaan === 'variasi' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                                <Activity className="w-3 h-3 text-amber-600" />
                                <span>Variasi Dialek ({item.uniqueForms.length} Bentuk Kata)</span>
                              </span>
                            )}
                            {item.statusKesamaan === 'isolat' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 text-purple-600" />
                                <span>Divergensi Tinggi / Isolat</span>
                              </span>
                            )}

                            <span className="text-[10px] text-slate-400 uppercase font-semibold">
                              {item.kategori === 'swadesh' ? 'Swadesh 200' : `Budaya • ${item.subkategori || 'Umum'}`}
                            </span>
                          </div>

                          {/* Quick preview of dominant form */}
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                            <span className="text-slate-500 dark:text-slate-400">Bentuk Dominan / Terbanyak:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-100 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                              "{dominantForm?.bentuk || '-'}"
                            </span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono text-[11px]">
                              ({dominantForm?.percentage}% TP)
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                              Terdata di {item.totalFilledTP} titik desa
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Chips & Toggle */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        {/* Summary of unique forms as pills */}
                        <div className="hidden sm:flex items-center gap-1.5">
                          {item.uniqueForms.slice(0, 3).map((f, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                            >
                              <strong className="text-slate-800 dark:text-slate-200">{f.bentuk}</strong>
                              <span className="text-[10px] text-slate-400 ml-1">({f.count} TP)</span>
                            </span>
                          ))}
                          {item.uniqueForms.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-semibold">
                              +{item.uniqueForms.length - 3} lagi
                            </span>
                          )}
                        </div>

                        {/* Button to open in isogloss map */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGlossForMap(item.id);
                            setActiveTab('peta_isoglos');
                            window.scrollTo({ top: 320, behavior: 'smooth' });
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Lihat berkas isoglos kosakata ini pada peta interaktif"
                        >
                          <Globe2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                          <span className="hidden md:inline">Peta Isoglos</span>
                        </button>

                        <div className={`p-1.5 rounded-lg transition-transform ${isExpanded ? 'rotate-90 bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-sky-300' : 'text-slate-400'}`}>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Expandable Breakdown Drawer */}
                    {isExpanded && (
                      <div className="px-4 sm:px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60 space-y-4">
                        
                        {/* Comparison Progress Bar */}
                        <div>
                          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                            <span className="text-slate-700 dark:text-slate-300">
                              Proporsi Kesamaan Bentuk Kata di Seluruh Titik Pengamatan:
                            </span>
                            <span className="text-slate-500 font-mono text-[11px]">
                              {item.uniqueForms.length} variasi leksikal
                            </span>
                          </div>

                          <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                            {item.uniqueForms.map((f, idx) => {
                              const colors = [
                                'bg-blue-600',
                                'bg-emerald-500',
                                'bg-amber-500',
                                'bg-purple-500',
                                'bg-rose-500',
                                'bg-cyan-500'
                              ];
                              const colorClass = colors[idx % colors.length];
                              return (
                                <div
                                  key={idx}
                                  style={{ width: `${f.percentage}%` }}
                                  className={`${colorClass} transition-all`}
                                  title={`"${f.bentuk}": ${f.percentage}% TP (${f.tpList.join(', ')})`}
                                />
                              );
                            })}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px]">
                            {item.uniqueForms.map((f, idx) => {
                              const dotColors = [
                                'bg-blue-600',
                                'bg-emerald-500',
                                'bg-amber-500',
                                'bg-purple-500',
                                'bg-rose-500',
                                'bg-cyan-500'
                              ];
                              return (
                                <div key={idx} className="flex items-center gap-1.5">
                                  <span className={`w-2.5 h-2.5 rounded-full ${dotColors[idx % dotColors.length]}`} />
                                  <span className="font-bold text-slate-800 dark:text-slate-200">"{f.bentuk}"</span>
                                  <span className="text-slate-500">({f.percentage}% • {f.count} TP)</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Detailed TP Comparison Table */}
                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                              <tr>
                                <th className="py-2 px-3">Titik Pengamatan (TP)</th>
                                <th className="py-2 px-3">Bentuk Kata Lokal</th>
                                <th className="py-2 px-3">Transkripsi IPA</th>
                                <th className="py-2 px-3">Kesesuaian / Kesamaan</th>
                                <th className="py-2 px-3 text-center">Audio</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                              {item.tpValues.map((v, vIdx) => {
                                const isDominant = v.bentukLokal.toLowerCase().trim() === dominantForm?.bentuk.toLowerCase().trim();
                                return (
                                  <tr key={vIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="py-2.5 px-3">
                                      <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                        <span className="font-bold text-slate-900 dark:text-white">{v.desa}</span>
                                        <span className="text-[10px] text-slate-400">({v.provinsi})</span>
                                      </div>
                                    </td>
                                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-100">
                                      {v.bentukLokal}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                                      {v.transkripsiFonetis || '-'}
                                    </td>
                                    <td className="py-2.5 px-3">
                                      {isDominant ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                          <CheckCircle2 className="w-2.5 h-2.5" />
                                          <span>Bentuk Seragam Dominan</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                                          <Activity className="w-2.5 h-2.5" />
                                          <span>Variasi Leksikal / Fonetis</span>
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                      {v.audioUrl ? (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            playAudio(`${item.id}-${v.tpId}`, v.audioUrl);
                                          }}
                                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                            playingAudioId === `${item.id}-${v.tpId}`
                                              ? 'bg-blue-600 text-white border-blue-600 animate-pulse'
                                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-blue-50'
                                          }`}
                                          title="Dengarkan rekaman penutur asli"
                                        >
                                          <Volume2 className="w-3.5 h-3.5" />
                                        </button>
                                      ) : (
                                        <span className="text-[10px] text-slate-300 dark:text-slate-600">-</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PETA VIRTUAL INTERAKTIF & BERKAS ISOGLOS KOSAKATA (NEW) */}
      {/* ========================================================================= */}
      {activeTab === 'peta_isoglos' && (
        <PetaVirtualIsoglosView
          points={allPoints}
          glossList={glossAnalysisList}
          initialGlossId={selectedGlossForMap}
          onSelectGloss={(id) => setSelectedGlossForMap(id)}
          onOpenTableView={() => setActiveTab('analisis_kesamaan')}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 3: KOLEKSI KORPUS PER BAHASA */}
      {/* ========================================================================= */}
      {activeTab === 'korpus_perbahasa' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Daftar Kosakata yang Dikelompokkan Berdasarkan Entitas Bahasa Daerah ({languageGroups.length} Bahasa)
            </span>
          </div>

          <div className="space-y-5">
            {languageGroups.map((lg) => {
              // Extract unique vocabulary under this language
              const langPoints = lg.points;
              const provNames = Array.from(lg.provinces).join(', ');

              return (
                <div 
                  key={lg.languageName}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4"
                >
                  {/* Language Card Top */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-600" />
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                          {lg.languageName}
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-sky-300 border border-blue-200 dark:border-blue-800">
                          {lg.points.length} Titik Pengamatan (TP)
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Wilayah Provinsi: <strong>{provNames || 'Jawa Barat'}</strong></span>
                        <span>•</span>
                        <span>Titik Desa: {langPoints.map(p => p.desa).join(', ')}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => handleExportLanguageCSV(lg)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 cursor-pointer shadow-2xs transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-600" />
                        <span>Unduh CSV Korpus</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter Toolbar for this Language Table */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                    {/* Category Selector */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Tampilkan:</span>
                      <button
                        type="button"
                        onClick={() => setLangTabCategory('swadesh')}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                          langTabCategory === 'swadesh'
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        Semua 200 Swadesh Dasar
                      </button>
                      <button
                        type="button"
                        onClick={() => setLangTabCategory('all')}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                          langTabCategory === 'all'
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        Semua (Swadesh + Budaya)
                      </button>
                      <button
                        type="button"
                        onClick={() => setLangTabCategory('budaya')}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                          langTabCategory === 'budaya'
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        Kosakata Budaya
                      </button>
                    </div>

                    {/* Range Selector if Swadesh */}
                    {langTabCategory === 'swadesh' && (
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Nomor:</span>
                        {[
                          { id: 'all', label: 'Semua 200' },
                          { id: '1-50', label: '1 - 50' },
                          { id: '51-100', label: '51 - 100' },
                          { id: '101-150', label: '101 - 150' },
                          { id: '151-200', label: '151 - 200' },
                        ].map(r => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setLangTabRange(r.id as any)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                              langTabRange === r.id
                                ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-900'
                                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Vocabulary Table under this language - FULL 200 ITEMS DISPLAYED */}
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 max-h-[600px] overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 dark:bg-slate-800/90 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3 w-12 text-center">No</th>
                          <th className="py-2.5 px-3 min-w-[140px]">Glos Indonesia</th>
                          <th className="py-2.5 px-3 w-20">Kategori</th>
                          {langPoints.map(p => (
                            <th key={p.id} className="py-2.5 px-3 min-w-[150px] border-l border-slate-100 dark:border-slate-700">
                              <span className="text-slate-900 dark:text-white font-bold">{p.desa}</span>
                              <span className="block text-[9px] font-normal text-slate-400 lowercase">({p.kabupaten || p.provinsi})</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                        {glossAnalysisList
                          .filter(g => {
                            // Category
                            if (langTabCategory === 'swadesh' && g.kategori !== 'swadesh') return false;
                            if (langTabCategory === 'budaya' && g.kategori !== 'budaya') return false;

                            // Swadesh range
                            if (langTabCategory === 'swadesh' && langTabRange !== 'all') {
                              if (langTabRange === '1-50' && (g.nomorGlos < 1 || g.nomorGlos > 50)) return false;
                              if (langTabRange === '51-100' && (g.nomorGlos < 51 || g.nomorGlos > 100)) return false;
                              if (langTabRange === '101-150' && (g.nomorGlos < 101 || g.nomorGlos > 150)) return false;
                              if (langTabRange === '151-200' && (g.nomorGlos < 151 || g.nomorGlos > 200)) return false;
                            }

                            // Query search
                            if (searchQuery.trim()) {
                              const q = searchQuery.toLowerCase();
                              const matchIndo = g.glosIndonesia.toLowerCase().includes(q);
                              const matchForms = g.tpValues.some(v => v.bentukLokal.toLowerCase().includes(q));
                              if (!matchIndo && !matchForms) return false;
                            }

                            return true;
                          })
                          .map((g) => (
                            <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px] font-bold">
                                #{g.nomorGlos}
                              </td>
                              <td className="py-2 px-3 font-bold text-slate-900 dark:text-white uppercase">
                                {g.glosIndonesia}
                              </td>
                              <td className="py-2 px-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  g.kategori === 'swadesh' 
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-sky-300' 
                                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                }`}>
                                  {g.kategori === 'swadesh' ? 'Swadesh' : 'Budaya'}
                                </span>
                              </td>
                              {langPoints.map(p => {
                                const val = g.tpValues.find(v => v.tpId === p.id);
                                return (
                                  <td key={p.id} className="py-2 px-3 border-l border-slate-100 dark:border-slate-800/80">
                                    {val?.bentukLokal ? (
                                      <div>
                                        <div className="flex items-center justify-between gap-1">
                                          <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                                            {val.bentukLokal}
                                          </span>
                                          {val.audioUrl && (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                playAudio(`${g.id}-${val.tpId}`, val.audioUrl);
                                              }}
                                              className="p-0.5 text-slate-400 hover:text-blue-600 cursor-pointer"
                                              title="Dengarkan rekaman"
                                            >
                                              <Volume2 className="w-3 h-3" />
                                            </button>
                                          )}
                                        </div>
                                        {val.transkripsiFonetis && (
                                          <span className="block font-mono text-[10px] text-slate-500 dark:text-slate-400">
                                            {val.transkripsiFonetis}
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-slate-300 dark:text-slate-600 italic text-[11px]">-</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center pt-1 font-medium">
                    Menampilkan seluruh kosakata terdata untuk entitas bahasa {lg.languageName}. Seluruh 200 kosakata dasar Swadesh telah dipetakan lengkap.
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: KELENGKAPAN KOSAKATA SWADESH REAL-TIME LINTAS SURVEI */}
      {/* ========================================================================= */}
      {activeTab === 'kelengkapan_swadesh' && (
        <KelengkapanKosakataSwadeshRoster
          surveys={surveys}
          activeSurveyData={activeSurveyData}
          activeSurveyId={activeSurveyId}
          titikPengamatan={activeSurveyData?.titikPengamatan}
          onSelectSurvey={onSelectSurvey}
          onNavigateToForm={onNavigateToForm}
        />
      )}

    </div>
  );
};
