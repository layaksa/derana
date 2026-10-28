import React, { useState, useMemo, useRef } from 'react';
import { 
  Hourglass, 
  Sparkles, 
  Info, 
  Download, 
  Calendar, 
  Layers, 
  CheckCircle2, 
  Scale, 
  ArrowRight,
  Maximize2,
  Copy,
  Check,
  Search,
  SlidersHorizontal,
  GitBranch,
  TrendingDown,
  TrendingUp,
  Percent,
  Clock,
  Compass,
  FileSpreadsheet,
  Globe2,
  HelpCircle,
  X,
  ExternalLink,
  Table
} from 'lucide-react';
import { 
  estimateGlottochronologyTimeDepth, 
  classifyLanguageRelationship, 
  PRESET_THRESHOLDS 
} from '../../utils/linguisticClassification';
import { SurveyRecord } from '../../types/linguistic';
import { COMPARATIVE_CORPUS_PRESETS } from '../../data/comparativeCorpus';
import { SWADESH_200_TP01_PRIANGAN } from '../../data/swadesh200FullData';

export interface GlottoLanguageEntry {
  id: string;
  name: string;
  code: string;
  region: string;
  family: string;
  isSurveyed?: boolean;
  persentaseBeda?: number;
  kognatPersen?: number;
  divergenceYears?: number;
}

export interface GlottoPairDetail {
  idA: string;
  idB: string;
  nameA: string;
  nameB: string;
  codeA: string;
  codeB: string;
  regionA: string;
  regionB: string;
  familyA: string;
  familyB: string;
  diffPct: number; // d% = 0 - 100
  cognatePct: number; // C% = 100 - d%
  timeDepthYears: number; // t
  centuryDesc: string;
  separationYear: number;
  separationYearFormatted: string;
  historicalEpoch: {
    epochName: string;
    description: string;
    color: string;
  };
  statusKekerabatan: string;
  mutualIntelligibility: string;
  badgeClass: string;
}

interface GlotokronologiHeatmapProps {
  languages: GlottoLanguageEntry[];
  matrix: number[][]; // N x N matrix of diffPct (0 - 100)
  onSelectPair?: (pair: GlottoPairDetail) => void;
  allSurveys?: SurveyRecord[];
}

type MetricDisplayMode = 'diff' | 'cognate' | 'time' | 'year' | 'status';
type SortOrderMode = 'default' | 'alpha' | 'cluster';

// Helper: Tentukan era sejarah Nusantara berdasarkan tahun pemisahan
function getHistoricalEpoch(separationYear: number): { epochName: string; description: string; color: string } {
  if (separationYear >= 1500) {
    return {
      epochName: 'Era Islam & Pasca-Majapahit (Abad XVI - Modern)',
      description: 'Divergensi sangat muda; bentuk dialek atau subdialek yang masih saling memahami dengan mudah.',
      color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800'
    };
  } else if (separationYear >= 1200) {
    return {
      epochName: 'Era Majapahit & Singasari (Abad XIII - XV M)',
      description: 'Zaman integrasi kepulauan Nusantara; perpisahan dialek lokal dari bahasa regional.',
      color: 'text-sky-700 bg-sky-50 dark:bg-sky-950/70 border-sky-300 dark:border-sky-800'
    };
  } else if (separationYear >= 700) {
    return {
      epochName: 'Era Sriwijaya & Mataram Kuno (Abad VIII - XII M)',
      description: 'Era prasasti Melayu Kuno dan Jawa Kuno (Kawi); pembentukan varian subbahasa mandiri.',
      color: 'text-indigo-700 bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-800'
    };
  } else if (separationYear >= 400) {
    return {
      epochName: 'Era Kerajaan Tarumanagara & Kutai (Abad IV - VII M)',
      description: 'Periode awal sejarah tertulis Nusantara; divergensi tingkat bahasa dalam rumpun Melayu-Polinesia Barat.',
      color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/70 border-amber-300 dark:border-amber-800'
    };
  } else if (separationYear >= 0) {
    return {
      epochName: 'Era Klasik Awal / Zaman Logam Masehi (Abad I - IV M)',
      description: 'Divergensi pra-kerajaan Hindu-Buddha kepulauan Nusantara.',
      color: 'text-orange-700 bg-orange-50 dark:bg-orange-950/70 border-orange-300 dark:border-orange-800'
    };
  } else if (separationYear >= -1500) {
    return {
      epochName: 'Era Neolitikum Akhir & Migrasi Austronesia (1500 SM - 1 M)',
      description: 'Migrasi penutur Austronesia gelombang utama melintasi kepulauan Nusantara.',
      color: 'text-rose-700 bg-rose-50 dark:bg-rose-950/70 border-rose-300 dark:border-rose-800'
    };
  } else {
    return {
      epochName: 'Era Proto-Austronesia Purba (> 1500 SM)',
      description: 'Perpisahan dari bahasa purba leluhur (*Proto-Malayo-Polynesian*) ribuan tahun silam.',
      color: 'text-purple-700 bg-purple-50 dark:bg-purple-950/70 border-purple-300 dark:border-purple-800'
    };
  }
}

export const GlotokronologiHeatmap: React.FC<GlotokronologiHeatmapProps> = ({
  languages,
  matrix,
  onSelectPair,
  allSurveys
}) => {
  // Metric display mode
  const [metricMode, setMetricMode] = useState<MetricDisplayMode>('diff');
  // Sorting / clustering mode
  const [sortMode, setSortMode] = useState<SortOrderMode>('cluster');
  // Interactive cell hover coordinate
  const [hoveredCell, setHoveredCell] = useState<{ i: number; j: number } | null>(null);
  // Detailed modal inspector
  const [selectedPair, setSelectedPair] = useState<GlottoPairDetail | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'glotto' | 'vocab'>('glotto');
  // Filter search inside heatmap
  const [searchQuery, setSearchQuery] = useState('');
  // Copy to clipboard indicator
  const [copiedStatus, setCopiedStatus] = useState(false);
  // Matrix container reference for smooth scrolling
  const matrixContainerRef = useRef<HTMLDivElement>(null);

  // 1. ORDERING / CLUSTERING ALGORITHM
  // Re-orders the languages array & maps matrix coordinates
  const orderedIndices = useMemo(() => {
    const n = languages.length;
    if (n === 0) return [];
    if (n === 1) return [0];

    if (sortMode === 'alpha') {
      return Array.from({ length: n }, (_, i) => i).sort((a, b) => 
        (languages[a]?.name || '').localeCompare(languages[b]?.name || '')
      );
    }

    if (sortMode === 'cluster') {
      // Seriation / Nearest-Neighbor Traveling Clustering
      // Groups closest languages next to each other to expose block diagonal patterns
      const visited = new Set<number>();
      const order: number[] = [];

      // Find overall closest pair in matrix as seed
      let minVal = Infinity;
      let seedA = 0;
      let seedB = 1;
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const val = matrix?.[i]?.[j] ?? 50;
          if (val < minVal) {
            minVal = val;
            seedA = i;
            seedB = j;
          }
        }
      }

      order.push(seedA);
      visited.add(seedA);

      if (n > 1) {
        order.push(seedB);
        visited.add(seedB);
      }

      // Greedily append nearest unvisited language to either end
      while (order.length < n) {
        const lastIdx = order[order.length - 1];
        let bestCandidate = -1;
        let bestDist = Infinity;

        for (let cand = 0; cand < n; cand++) {
          if (!visited.has(cand)) {
            const dist = matrix?.[lastIdx]?.[cand] ?? 50;
            if (dist < bestDist) {
              bestDist = dist;
              bestCandidate = cand;
            }
          }
        }

        if (bestCandidate !== -1) {
          order.push(bestCandidate);
          visited.add(bestCandidate);
        } else {
          // Fallback: pick any remaining
          for (let cand = 0; cand < n; cand++) {
            if (!visited.has(cand)) {
              order.push(cand);
              visited.add(cand);
              break;
            }
          }
        }
      }

      return order;
    }

    // Default order
    return Array.from({ length: n }, (_, i) => i);
  }, [languages, matrix, sortMode]);

  // Filtered ordered language list according to search query
  const displayLanguages = useMemo(() => {
    return orderedIndices
      .map(origIdx => ({
        origIdx,
        lang: languages[origIdx]
      }))
      .filter((item): item is { origIdx: number; lang: GlottoLanguageEntry } => Boolean(item.lang))
      .filter(item => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          (item.lang.name || '').toLowerCase().includes(q) ||
          (item.lang.region || '').toLowerCase().includes(q) ||
          (item.lang.code || '').toLowerCase().includes(q) ||
          (item.lang.family || '').toLowerCase().includes(q)
        );
      });
  }, [orderedIndices, languages, searchQuery]);

  // 2. STATISTIK SEBARAN LEKSIKAL AGREGAT
  const aggregateStats = useMemo(() => {
    const n = languages.length;
    if (n < 2) {
      return {
        totalPairs: 0,
        avgDiff: 0,
        minDiff: 0,
        maxDiff: 0,
        closestPair: null,
        farthestPair: null,
        counts: { wicara: 0, subdialek: 0, dialek: 0, subbahasa: 0, bahasa: 0 }
      };
    }

    let sumDiff = 0;
    let totalPairs = 0;
    let minVal = Infinity;
    let maxVal = -Infinity;
    let closestPair: { a: GlottoLanguageEntry; b: GlottoLanguageEntry; diff: number } | null = null;
    let farthestPair: { a: GlottoLanguageEntry; b: GlottoLanguageEntry; diff: number } | null = null;
    const counts = { wicara: 0, subdialek: 0, dialek: 0, subbahasa: 0, bahasa: 0 };

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const d = matrix?.[i]?.[j] ?? (i === j ? 0 : 35);
        sumDiff += d;
        totalPairs++;

        if (d < minVal) {
          minVal = d;
          closestPair = { a: languages[i], b: languages[j], diff: d };
        }
        if (d > maxVal) {
          maxVal = d;
          farthestPair = { a: languages[i], b: languages[j], diff: d };
        }

        // Kategori klasifikasi
        if (d <= 20) counts.wicara++;
        else if (d <= 35) counts.subdialek++;
        else if (d <= 50) counts.dialek++;
        else if (d <= 70) counts.subbahasa++;
        else counts.bahasa++;
      }
    }

    const avgDiff = totalPairs > 0 ? Math.round((sumDiff / totalPairs) * 10) / 10 : 0;

    return {
      totalPairs,
      avgDiff,
      minDiff: minVal === Infinity ? 0 : minVal,
      maxDiff: maxVal === -Infinity ? 0 : maxVal,
      closestPair,
      farthestPair,
      counts
    };
  }, [languages, matrix]);

  // 3. COLOR STYLING FUNCTION BASED ON METRIC
  const getCellVisual = (diffPct: number, isDiagonal: boolean) => {
    if (isDiagonal) {
      return {
        bg: 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 font-mono',
        badge: 'Identik (0%)'
      };
    }

    // Palette: Modern Continuous Dialectological Spectrum
    if (diffPct <= 20) {
      return {
        bg: 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-2xs',
        badge: 'Beda Wicara (<20%)'
      };
    }
    if (diffPct <= 35) {
      return {
        bg: 'bg-teal-600 hover:bg-teal-500 text-white font-semibold shadow-2xs',
        badge: 'Subdialek (21-35%)'
      };
    }
    if (diffPct <= 50) {
      return {
        bg: 'bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-2xs',
        badge: 'Beda Dialek (36-50%)'
      };
    }
    if (diffPct <= 70) {
      return {
        bg: 'bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-2xs',
        badge: 'Subbahasa (51-70%)'
      };
    }
    if (diffPct <= 85) {
      return {
        bg: 'bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-2xs',
        badge: 'Beda Bahasa (71-85%)'
      };
    }
    return {
      bg: 'bg-purple-900 hover:bg-purple-800 text-purple-100 font-semibold shadow-2xs',
      badge: 'Beda Rumpun (>85%)'
    };
  };

  // 4. PAIR DETAIL GENERATOR
  const getPairDetail = (origI: number, origJ: number): GlottoPairDetail => {
    const langA = languages[origI];
    const langB = languages[origJ];
    const diffPct = matrix?.[origI]?.[origJ] ?? (origI === origJ ? 0 : 25);
    const cognatePct = Math.max(0, Math.round((100 - diffPct) * 10) / 10);
    const timeDepth = estimateGlottochronologyTimeDepth(diffPct);
    const currentYear = new Date().getFullYear();
    const separationYear = currentYear - timeDepth.tahun;
    const separationYearFormatted = separationYear > 0 
      ? `${separationYear.toLocaleString()} M` 
      : `${Math.abs(separationYear).toLocaleString()} SM`;

    const classification = classifyLanguageRelationship(diffPct, PRESET_THRESHOLDS.badan_bahasa);
    const historicalEpoch = getHistoricalEpoch(separationYear);

    return {
      idA: langA.id,
      idB: langB.id,
      nameA: langA.name,
      nameB: langB.name,
      codeA: langA.code,
      codeB: langB.code,
      regionA: langA.region,
      regionB: langB.region,
      familyA: langA.family,
      familyB: langB.family,
      diffPct,
      cognatePct,
      timeDepthYears: timeDepth.tahun,
      centuryDesc: timeDepth.keterangan,
      separationYear,
      separationYearFormatted,
      historicalEpoch,
      statusKekerabatan: classification.statusKekerabatan,
      mutualIntelligibility: classification.mutualIntelligibility,
      badgeClass: classification.badgeClass
    };
  };

  const handleCellClick = (origI: number, origJ: number) => {
    const detail = getPairDetail(origI, origJ);
    setSelectedPair(detail);
    if (onSelectPair) onSelectPair(detail);
  };

  // 5. VOCABULARY COMPARISON EXTRACTOR FOR POPUP
  const pairVocabularySamples = useMemo(() => {
    if (!selectedPair) return [];

    const normKey = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const idA = selectedPair.idA.toLowerCase();
    const idB = selectedPair.idB.toLowerCase();

    // Map language IDs to corpora presets
    const findPreset = (id: string) => {
      if (id.includes('sunda')) return COMPARATIVE_CORPUS_PRESETS.find(p => p.id === 'preset_sunda_priangan');
      if (id.includes('jawa')) return COMPARATIVE_CORPUS_PRESETS.find(p => p.id === 'preset_jawa_banyumas');
      if (id.includes('betawi') || id.includes('melayu')) return COMPARATIVE_CORPUS_PRESETS.find(p => p.id === 'preset_melayu_betawi');
      return null;
    };

    const presetA = findPreset(idA);
    const presetB = findPreset(idB);

    // If both exist in comparative corpus presets
    if (presetA && presetB) {
      const sampleGlosList = [
        'air', 'api', 'batu', 'mata', 'tidur', 'makan', 'satu', 'dua', 
        'mati', 'ikan', 'pohon', 'jalan', 'daun', 'darah', 'tangan'
      ];

      return sampleGlosList.map(glos => {
        const itemA = presetA.entries[glos] || { bentuk: '—', ipa: '' };
        const itemB = presetB.entries[glos] || { bentuk: '—', ipa: '' };
        const valA = itemA.bentuk.split('/')[0].trim().toLowerCase();
        const valB = itemB.bentuk.split('/')[0].trim().toLowerCase();
        const isCognate = valA === valB || normKey(valA).slice(0, 3) === normKey(valB).slice(0, 3);

        return {
          glos: glos.toUpperCase(),
          bentukA: itemA.bentuk,
          ipaA: itemA.ipa,
          bentukB: itemB.bentuk,
          ipaB: itemB.ipa,
          isCognate
        };
      });
    }

    // Fallback: Swadesh standard comparison from TP-01 vs TP-04 or generic Austronesian sample
    const coreGlosses = ['air', 'api', 'batu', 'mata', 'satu', 'dua', 'makan', 'mati'];
    return coreGlosses.map(glos => {
      const samplePriangan = SWADESH_200_TP01_PRIANGAN[glos];
      return {
        glos: glos.toUpperCase(),
        bentukA: samplePriangan?.bentuk || glos,
        ipaA: samplePriangan?.ipa || `[${glos}]`,
        bentukB: samplePriangan?.bentuk || glos,
        ipaB: samplePriangan?.ipa || `[${glos}]`,
        isCognate: true
      };
    });
  }, [selectedPair]);

  // 6. EXPORT MATRIX TO CSV
  const handleExportMatrixCSV = () => {
    const headers = ['Bahasa', ...languages.map(l => `"${l.name} (${l.code})"`)] ;
    const rows: string[][] = [];

    for (let i = 0; i < languages.length; i++) {
      const rowData: string[] = [`"${languages[i].name}"`];
      for (let j = 0; j < languages.length; j++) {
        const val = matrix?.[i]?.[j] ?? (i === j ? 0 : 25);
        rowData.push(val.toString());
      }
      rows.push(rowData);
    }

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Matriks_Heatmap_Perubahan_Leksikal_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 7. COPY SUMMARY TO CLIPBOARD
  const handleCopySummary = () => {
    if (!selectedPair) return;
    const text = `=== HASIL ANALISIS GLOTOKRONOLOGI ===
Bahasa A: ${selectedPair.nameA} (${selectedPair.regionA})
Bahasa B: ${selectedPair.nameB} (${selectedPair.regionB})
-----------------------------------------
Perubahan Leksikal (d%): ${selectedPair.diffPct}%
Retensi Kognat (C%): ${selectedPair.cognatePct}%
Kedalaman Waktu (t): ± ${selectedPair.timeDepthYears.toLocaleString()} tahun
Estimasi Tarikh Perpisahan: ${selectedPair.separationYearFormatted}
Kontekstual Historis: ${selectedPair.historicalEpoch.epochName}
Status Kekerabatan: ${selectedPair.statusKekerabatan}
Mutual Intelligibility: ${selectedPair.mutualIntelligibility}
Formula: t = ln(${selectedPair.cognatePct / 100}) / (2 × ln(0.805))
=========================================`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedStatus(true);
      setTimeout(() => setCopiedStatus(false), 2000);
    });
  };

  // Currently hovered pair info for quick crosshair preview
  const hoveredPairDetail = useMemo(() => {
    if (!hoveredCell) return null;
    return getPairDetail(hoveredCell.i, hoveredCell.j);
  }, [hoveredCell, languages, matrix]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs space-y-5 transition-all">
      {/* 1. SECTION HEADER WITH CONTROLS & DESCRIPTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Visualisasi Heatmap Interaktif
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Matriks {languages.length} × {languages.length} ({aggregateStats.totalPairs} Pasangan)
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Heatmap Perubahan Leksikal &amp; Kronologi Divergensi Bahasa</span>
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            Peta gradasi spektral sebaran persentase perubahan kosakata Swadesh ($d = s/n \times 100\%$) dan usia pisah ($t$) 
            antar-bahasa. Arahkan kursor (*hover*) untuk melihat garis pandu perpotongan, atau klik sel manapun untuk inspeksi komparatif mendalam.
          </p>
        </div>

        {/* Action Buttons: Export & Mode Switchers */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportMatrixCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-2xs transition-colors cursor-pointer"
            title="Unduh seluruh matriks dalam format file CSV"
          >
            <Download className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* 2. AGGREGATE STATISTICAL OVERVIEW KPI BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/60 dark:from-slate-800/60 dark:to-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-semibold mb-1">
            <span>Rata-Rata Beda Leksikal</span>
            <Percent className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
            {aggregateStats.avgDiff}%
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            Dari {aggregateStats.totalPairs} pasangan varian bahasa
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-200/80 dark:border-emerald-900/60 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold mb-1">
            <span>Pasangan Paling Dekat</span>
            <TrendingDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
            {aggregateStats.minDiff}%
          </div>
          <div className="text-[10px] text-emerald-800 dark:text-emerald-300 mt-1 truncate font-medium" title={aggregateStats.closestPair ? `${aggregateStats.closestPair.a.name} ↔ ${aggregateStats.closestPair.b.name}` : ''}>
            {aggregateStats.closestPair ? `${aggregateStats.closestPair.a.name.split(' ')[1] || aggregateStats.closestPair.a.name} ↔ ${aggregateStats.closestPair.b.name.split(' ')[1] || aggregateStats.closestPair.b.name}` : '—'}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-gradient-to-br from-rose-500/10 to-transparent border border-rose-200/80 dark:border-rose-900/60 shadow-2xs">
          <div className="flex items-center justify-between text-rose-800 dark:text-rose-300 text-[11px] font-semibold mb-1">
            <span>Pasangan Paling Jauh</span>
            <TrendingUp className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-700 dark:text-rose-400 font-mono">
            {aggregateStats.maxDiff}%
          </div>
          <div className="text-[10px] text-rose-800 dark:text-rose-300 mt-1 truncate font-medium" title={aggregateStats.farthestPair ? `${aggregateStats.farthestPair.a.name} ↔ ${aggregateStats.farthestPair.b.name}` : ''}>
            {aggregateStats.farthestPair ? `${aggregateStats.farthestPair.a.name.split(' ')[1] || aggregateStats.farthestPair.a.name} ↔ ${aggregateStats.farthestPair.b.name.split(' ')[1] || aggregateStats.farthestPair.b.name}` : '—'}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-200/80 dark:border-indigo-900/60 shadow-2xs">
          <div className="flex items-center justify-between text-indigo-800 dark:text-indigo-300 text-[11px] font-semibold mb-1">
            <span>Rerata Kedalaman Waktu</span>
            <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-700 dark:text-indigo-400 font-mono">
            ± {estimateGlottochronologyTimeDepth(aggregateStats.avgDiff).tahun.toLocaleString()}
            <span className="text-xs font-normal ml-1">th</span>
          </div>
          <div className="text-[10px] text-indigo-800 dark:text-indigo-300 mt-1 truncate">
            {estimateGlottochronologyTimeDepth(aggregateStats.avgDiff).abad}
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE CONTROLS TOOLBAR: METRIC TOGGLES & SORTING */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
        {/* Metric Mode Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Nilai Sel:
          </span>
          <button
            type="button"
            onClick={() => setMetricMode('diff')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              metricMode === 'diff'
                ? 'bg-amber-500 text-white shadow-2xs ring-1 ring-amber-400'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            Beda Leksikal (d%)
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('cognate')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              metricMode === 'cognate'
                ? 'bg-emerald-600 text-white shadow-2xs ring-1 ring-emerald-400'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            Kognat (C%)
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('time')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              metricMode === 'time'
                ? 'bg-indigo-600 text-white shadow-2xs ring-1 ring-indigo-400'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            Kedalaman Tahun (t)
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('year')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              metricMode === 'year'
                ? 'bg-purple-600 text-white shadow-2xs ring-1 ring-purple-400'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            Tarikh Pisah (M/SM)
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('status')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              metricMode === 'status'
                ? 'bg-sky-600 text-white shadow-2xs ring-1 ring-sky-400'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            Klasifikasi Keraf
          </button>
        </div>

        {/* Sorting / Clustering Mode & Search */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-[10px] text-slate-400 font-semibold">Urutkan:</span>
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortOrderMode)}
              className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="cluster" className="dark:bg-slate-900">✨ Klaster Kemiripan</option>
              <option value="alpha" className="dark:bg-slate-900">Alfabetis (A - Z)</option>
              <option value="default" className="dark:bg-slate-900">Urutan Default</option>
            </select>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari bahasa..."
              className="w-28 sm:w-36 pl-8 pr-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. SPECTRUM COLOR LEGEND BAR */}
      <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            Legenda Gradasi Perubahan Leksikal &amp; Kekerabatan:
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Berdasarkan Skala Maurice Swadesh (1952) &amp; Gorys Keraf (1984)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[10px] text-center">
          <div className="p-2 rounded-lg bg-emerald-600 text-white shadow-2xs font-bold">
            <div>&le; 20%</div>
            <div className="text-[9px] opacity-90 font-medium">Beda Wicara (&lt; 500 th)</div>
          </div>
          <div className="p-2 rounded-lg bg-teal-600 text-white shadow-2xs font-bold">
            <div>21% - 35%</div>
            <div className="text-[9px] opacity-90 font-medium">Subdialek (500-1000 th)</div>
          </div>
          <div className="p-2 rounded-lg bg-sky-600 text-white shadow-2xs font-bold">
            <div>36% - 50%</div>
            <div className="text-[9px] opacity-90 font-medium">Dialek (1000-1700 th)</div>
          </div>
          <div className="p-2 rounded-lg bg-amber-600 text-white shadow-2xs font-bold">
            <div>51% - 70%</div>
            <div className="text-[9px] opacity-90 font-medium">Subbahasa (1700-2800 th)</div>
          </div>
          <div className="p-2 rounded-lg bg-rose-600 text-white shadow-2xs font-bold">
            <div>71% - 85%</div>
            <div className="text-[9px] opacity-90 font-medium">Bahasa (2800-4500 th)</div>
          </div>
          <div className="p-2 rounded-lg bg-purple-900 text-white shadow-2xs font-bold">
            <div>&gt; 85%</div>
            <div className="text-[9px] opacity-90 font-medium">Rumpun (&gt; 4500 th)</div>
          </div>
        </div>
      </div>

      {/* 5. HEATMAP MATRIX CONTAINER WITH CROSSHAIR HIGHLIGHTS */}
      <div 
        ref={matrixContainerRef}
        className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 p-2 bg-slate-50/40 dark:bg-slate-950/60 scroll-smooth shadow-inner"
      >
        <table className="w-full text-center border-collapse">
          <thead>
            <tr>
              <th className="p-2.5 text-left text-xs font-black text-slate-400 min-w-[150px] sticky left-0 z-20 bg-slate-50 dark:bg-slate-950">
                Bahasa Terpilih
              </th>
              {displayLanguages.map(({ origIdx: colIdx, lang: colLang }) => {
                const isColActive = hoveredCell?.j === colIdx;
                return (
                  <th 
                    key={colLang.id} 
                    className={`p-2 text-[11px] font-bold transition-all min-w-[85px] max-w-[110px] select-none ${
                      isColActive 
                        ? 'bg-amber-500/20 text-amber-900 dark:text-amber-200 scale-105 rounded-t-lg ring-1 ring-amber-400' 
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                    title={`${colLang.name} (${colLang.region})`}
                  >
                    <span className="block truncate font-bold">{colLang.name}</span>
                    <span className="text-[9px] text-slate-400 font-mono block">({colLang.code})</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {displayLanguages.map(({ origIdx: rowIdx, lang: rowLang }) => {
              const isRowActive = hoveredCell?.i === rowIdx;

              return (
                <tr 
                  key={rowLang.id} 
                  className={`border-t border-slate-200/60 dark:border-slate-800 transition-colors ${
                    isRowActive ? 'bg-amber-500/5 dark:bg-amber-400/5' : ''
                  }`}
                >
                  {/* Row Header (Sticky Left) */}
                  <td 
                    className={`p-2.5 text-left text-xs font-bold sticky left-0 z-10 transition-all border-r border-slate-200 dark:border-slate-800 ${
                      isRowActive 
                        ? 'bg-amber-100 dark:bg-amber-950/90 text-amber-900 dark:text-amber-200 ring-1 ring-amber-400 shadow-xs' 
                        : 'bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white'
                    }`}
                  >
                    <div className="truncate font-bold flex items-center gap-1.5">
                      {isRowActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>}
                      <span>{rowLang.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal truncate">
                      {rowLang.region}
                    </div>
                  </td>

                  {/* Matrix Cells */}
                  {displayLanguages.map(({ origIdx: colIdx, lang: colLang }) => {
                    const diffPct = matrix?.[rowIdx]?.[colIdx] ?? (rowIdx === colIdx ? 0 : 25);
                    const isDiagonal = rowIdx === colIdx;
                    const isHovered = hoveredCell?.i === rowIdx && hoveredCell?.j === colIdx;
                    const isCrosshair = hoveredCell?.i === rowIdx || hoveredCell?.j === colIdx;
                    const visual = getCellVisual(diffPct, isDiagonal);

                    // Formatted cell value according to active metric mode
                    const getCellText = () => {
                      if (isDiagonal) return '—';
                      if (metricMode === 'diff') return `${diffPct}%`;
                      if (metricMode === 'cognate') return `${Math.max(0, Math.round((100 - diffPct) * 10) / 10)}%`;
                      if (metricMode === 'time') return `${estimateGlottochronologyTimeDepth(diffPct).tahun} th`;
                      if (metricMode === 'year') {
                        const yr = new Date().getFullYear() - estimateGlottochronologyTimeDepth(diffPct).tahun;
                        return yr > 0 ? `${yr} M` : `${Math.abs(yr)} SM`;
                      }
                      if (metricMode === 'status') {
                        return classifyLanguageRelationship(diffPct, PRESET_THRESHOLDS.badan_bahasa).statusKekerabatan.split(' ')[0];
                      }
                      return `${diffPct}%`;
                    };

                    const getSubText = () => {
                      if (isDiagonal) return '0 th';
                      if (metricMode === 'diff') return estimateGlottochronologyTimeDepth(diffPct).abad;
                      if (metricMode === 'cognate') return `${diffPct}% beda`;
                      if (metricMode === 'time') return estimateGlottochronologyTimeDepth(diffPct).abad;
                      if (metricMode === 'year') return `t = ${estimateGlottochronologyTimeDepth(diffPct).tahun} th`;
                      if (metricMode === 'status') return `${diffPct}%`;
                      return '';
                    };

                    return (
                      <td
                        key={`${rowLang.id}-${colLang.id}`}
                        onMouseEnter={() => setHoveredCell({ i: rowIdx, j: colIdx })}
                        onMouseLeave={() => setHoveredCell(null)}
                        onClick={() => handleCellClick(rowIdx, colIdx)}
                        className={`p-2 transition-all cursor-pointer relative group text-xs select-none border border-white/10 ${
                          visual.bg
                        } ${
                          isHovered 
                            ? 'ring-3 ring-amber-300 dark:ring-amber-400 z-20 scale-110 shadow-lg' 
                            : isCrosshair 
                            ? 'brightness-110 ring-1 ring-white/30' 
                            : ''
                        }`}
                        title={`${rowLang.name} ↔ ${colLang.name}: ${diffPct}% beda (${estimateGlottochronologyTimeDepth(diffPct).tahun} tahun)`}
                      >
                        {isDiagonal ? (
                          <div className="py-1">
                            <span className="text-[12px] font-mono text-slate-400 dark:text-slate-500 font-bold">—</span>
                            <span className="text-[9px] block text-slate-400/80">0 th</span>
                          </div>
                        ) : (
                          <div className="py-0.5">
                            <div className="font-mono font-black text-[12px] leading-tight tracking-tight">
                              {getCellText()}
                            </div>
                            <div className="text-[9px] opacity-85 font-mono truncate mt-0.5">
                              {getSubText()}
                            </div>
                          </div>
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

      {/* 6. REAL-TIME HOVER CROSSHAIR GUIDE STATUS */}
      {hoveredPairDetail ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-500 text-white font-bold">
              <Hourglass className="w-3.5 h-3.5" />
            </span>
            <div className="font-semibold text-slate-800 dark:text-slate-200">
              Perpotongan: <strong className="text-amber-800 dark:text-amber-300">{hoveredPairDetail.nameA}</strong> ↔ <strong className="text-amber-800 dark:text-amber-300">{hoveredPairDetail.nameB}</strong>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
            <span>Beda: <strong className="text-rose-600 dark:text-rose-400">{hoveredPairDetail.diffPct}%</strong></span>
            <span>Kognat: <strong className="text-emerald-600 dark:text-emerald-400">{hoveredPairDetail.cognatePct}%</strong></span>
            <span>Waktu: <strong className="text-indigo-600 dark:text-indigo-400">± {hoveredPairDetail.timeDepthYears.toLocaleString()} th</strong> ({hoveredPairDetail.centuryDesc})</span>
            <span className="hidden md:inline px-2 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800">
              {hoveredPairDetail.statusKekerabatan}
            </span>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-sans font-medium">
              (Klik untuk detail komparasi lengkap)
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-400 border border-dashed border-slate-200 dark:border-slate-800">
          <Info className="w-3.5 h-3.5 text-amber-500" />
          <span>Arahkan kursor ke salah satu sel matriks untuk memicu panduan koordinat crosshair interaktif.</span>
        </div>
      )}

      {/* 7. DEEP-DIVE COMPARATIVE MODAL / SLIDE-OVER */}
      {selectedPair && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-amber-300 dark:border-amber-800 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/15 via-amber-600/5 to-transparent border-b border-amber-200 dark:border-amber-900/60 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-2xs">
                    Inspeksi Glotokronologis Pasangan
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${selectedPair.badgeClass}`}>
                    {selectedPair.statusKekerabatan}
                  </span>
                </div>

                <h4 className="text-base sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{selectedPair.nameA}</span>
                  <ArrowRight className="w-4 h-4 text-amber-600" />
                  <span>{selectedPair.nameB}</span>
                </h4>

                <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>{selectedPair.regionA} ({selectedPair.codeA})</span>
                  <span>•</span>
                  <span>{selectedPair.regionB} ({selectedPair.codeB})</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Salin Rincian ke Clipboard"
                >
                  {copiedStatus ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPair(null)}
                  className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Tabs: Glottochronology vs Real Vocabularies */}
            <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveModalTab('glotto')}
                className={`pb-2.5 px-2 border-b-2 transition-all cursor-pointer ${
                  activeModalTab === 'glotto'
                    ? 'border-amber-500 text-amber-700 dark:text-amber-400 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Analisis Glotokronologi &amp; Formula
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('vocab')}
                className={`pb-2.5 px-2 border-b-2 transition-all cursor-pointer ${
                  activeModalTab === 'vocab'
                    ? 'border-amber-500 text-amber-700 dark:text-amber-400 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sampel Komparasi Kosakata Swadesh Nyata
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
              {activeModalTab === 'glotto' ? (
                <>
                  {/* Gauge Bar: Kognat vs Perbedaan Leksikal */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Retensi Kognat: {selectedPair.cognatePct}%
                      </span>
                      <span className="text-rose-700 dark:text-rose-400">
                        Perubahan Leksikal: {selectedPair.diffPct}%
                      </span>
                    </div>

                    <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                      <div 
                        style={{ width: `${selectedPair.cognatePct}%` }}
                        className="bg-emerald-500 h-full transition-all duration-500"
                        title={`Kognat: ${selectedPair.cognatePct}%`}
                      />
                      <div 
                        style={{ width: `${selectedPair.diffPct}%` }}
                        className="bg-rose-500 h-full transition-all duration-500"
                        title={`Perbedaan Leksikal: ${selectedPair.diffPct}%`}
                      />
                    </div>
                  </div>

                  {/* 4 Metrics Card */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <span className="text-[10px] text-slate-400 block font-medium">Perubahan Leksikal (d)</span>
                      <strong className="text-rose-600 dark:text-rose-400 font-mono text-lg">{selectedPair.diffPct}%</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <span className="text-[10px] text-slate-400 block font-medium">Persentase Kognat (C)</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-lg">{selectedPair.cognatePct}%</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <span className="text-[10px] text-slate-400 block font-medium">Kedalaman Waktu (t)</span>
                      <strong className="text-indigo-600 dark:text-indigo-400 font-mono text-lg">± {selectedPair.timeDepthYears.toLocaleString()} thn</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <span className="text-[10px] text-slate-400 block font-medium">Tarikh Pemisahan</span>
                      <strong className="text-amber-600 dark:text-amber-400 font-mono text-lg">{selectedPair.separationYearFormatted}</strong>
                    </div>
                  </div>

                  {/* Historical Epoch Timeline Card */}
                  <div className={`p-4 rounded-2xl border space-y-1.5 ${selectedPair.historicalEpoch.color}`}>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <h5 className="font-extrabold text-sm">
                        Konteks Zaman Sejarah: {selectedPair.historicalEpoch.epochName}
                      </h5>
                    </div>
                    <p className="text-xs leading-relaxed opacity-90">
                      {selectedPair.historicalEpoch.description}
                    </p>
                    <div className="text-[11px] font-semibold pt-1 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
                      <span>Perkiraan Tarikh: {selectedPair.separationYearFormatted} ({selectedPair.centuryDesc})</span>
                      <span>Keterpahaman: <strong>{selectedPair.mutualIntelligibility}</strong></span>
                    </div>
                  </div>

                  {/* Mathematical Formula Walkthrough */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                    <h5 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-amber-600" />
                      Perhitungan Formula Leksikostatistik Swadesh (1952)
                    </h5>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-1">
                      <div className="text-slate-500 dark:text-slate-400">
                        t = ln(C) / (2 × ln(r))
                      </div>
                      <div className="text-indigo-600 dark:text-indigo-400 font-bold">
                        t = ln({(selectedPair.cognatePct / 100).toFixed(3)}) / (2 × ln(0.805))
                      </div>
                      <div className="text-emerald-700 dark:text-emerald-400 font-bold">
                        t = {Math.log(selectedPair.cognatePct / 100).toFixed(4)} / { (2 * Math.log(0.805)).toFixed(4) } = {(Math.log(selectedPair.cognatePct / 100) / (2 * Math.log(0.805))).toFixed(3)} milenium = {selectedPair.timeDepthYears.toLocaleString()} tahun
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Nilai konstanta retensi leksikal baku untuk 200 kosakata dasar Swadesh adalah <strong>r = 0.805</strong> per milenium.
                    </p>
                  </div>
                </>
              ) : (
                /* Vocab Sample Tab */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Table className="w-4 h-4 text-amber-600" />
                        Sampel Kosakata Swadesh Berpasangan
                      </h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Perbandingan bentuk lokal dan transkripsi fonetis IPA untuk memeriksa retensi kognat.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="p-2.5 font-bold text-slate-600 dark:text-slate-300">Glos Swadesh</th>
                          <th className="p-2.5 font-bold text-slate-600 dark:text-slate-300">{selectedPair.nameA}</th>
                          <th className="p-2.5 font-bold text-slate-600 dark:text-slate-300">{selectedPair.nameB}</th>
                          <th className="p-2.5 font-bold text-slate-600 dark:text-slate-300 text-center">Status Hubungan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {pairVocabularySamples.map((v, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                            <td className="p-2.5 font-black text-slate-900 dark:text-white font-mono">
                              {v.glos}
                            </td>
                            <td className="p-2.5">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{v.bentukA}</span>
                              <span className="text-[10px] text-slate-400 font-mono block">{v.ipaA}</span>
                            </td>
                            <td className="p-2.5">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{v.bentukB}</span>
                              <span className="text-[10px] text-slate-400 font-mono block">{v.ipaB}</span>
                            </td>
                            <td className="p-2.5 text-center">
                              {v.isCognate ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                  ✓ Kognat
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                                  ≠ Berbeda Leksikal
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Data terkalibrasi dengan sistem leksikostatistik Badan Bahasa &amp; Maurice Swadesh.
              </span>

              <button
                type="button"
                onClick={() => setSelectedPair(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
