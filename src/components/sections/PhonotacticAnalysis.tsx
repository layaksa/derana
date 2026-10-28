import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Activity, 
  BarChart3, 
  FileSpreadsheet, 
  Sparkles, 
  Download, 
  Search, 
  Filter, 
  ArrowRight, 
  CheckCircle2, 
  Info, 
  Copy, 
  Check, 
  Volume2, 
  Compass, 
  Scale, 
  Table, 
  BookOpen,
  Sliders,
  Percent,
  TrendingUp,
  PieChart as PieChartIcon,
  X,
  HelpCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  Legend as RechartsLegend, 
  CartesianGrid, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { 
  KosakataItem, 
  TitikPengamatan, 
  SurveyRecord 
} from '../../types/linguistic';
import { 
  analyzePhonotactics, 
  PhonotacticSummaryReport, 
  AnalyzedWordPhonotactic,
  SyllablePatternStat,
  PhonemeFrequencyItem 
} from '../../utils/phonotacticAnalyzer';
import { COMPARATIVE_CORPUS_PRESETS } from '../../data/comparativeCorpus';

interface PhonotacticAnalysisProps {
  titikPengamatan?: TitikPengamatan;
  swadeshList?: KosakataItem[];
  allSurveys?: SurveyRecord[];
  activeSurveyTitle?: string;
  onNavigateToSwadesh?: () => void;
}

// Chart visual color palettes
const VOWEL_COLORS = [
  '#10b981', '#059669', '#34d399', '#047857', '#6ee7b7', 
  '#065f46', '#a7f3d0', '#022c22'
];

const CONSONANT_COLORS = [
  '#6366f1', '#4f46e5', '#3b82f6', '#0ea5e9', '#0284c7', 
  '#8b5cf6', '#7c3aed', '#d946ef', '#f59e0b', '#d97706', 
  '#ef4444', '#14b8a6', '#0d9488', '#64748b', '#475569'
];

const ARTICULATION_COLORS: Record<string, string> = {
  'Letup / Plosif': '#3b82f6',
  'Sengau / Nasal': '#8b5cf6',
  'Geser / Frikatif': '#f59e0b',
  'Paduan / Afrikat': '#ec4899',
  'Likuida / Getar & Sampingan': '#14b8a6',
  'Semivokal / Luncuran': '#64748b'
};

const SYLLABLE_COLORS = [
  '#6366f1', '#10b981', '#0ea5e9', '#f59e0b', '#ec4899', 
  '#8b5cf6', '#14b8a6', '#64748b'
];

export const PhonotacticAnalysis: React.FC<PhonotacticAnalysisProps> = ({
  titikPengamatan,
  swadeshList = [],
  allSurveys = [],
  activeSurveyTitle,
  onNavigateToSwadesh
}) => {
  // Sub-tab view: 'grafik' | 'silabel' | 'fonem' | 'daftar_kata' | 'komparasi'
  const [activeTab, setActiveTab] = useState<'grafik' | 'silabel' | 'fonem' | 'daftar_kata' | 'komparasi'>('grafik');

  // Selected Observation Point for primary analysis
  const [selectedPointId, setSelectedPointId] = useState<string>('active_survey');
  // Selected Observation Point for comparison side-by-side
  const [comparePointId, setComparePointId] = useState<string>('preset_jawa');

  // Chart view mode inside 'grafik' tab: 'top_fonem' | 'vokal' | 'artikulasi' | 'silabel_pola'
  const [chartSubView, setChartSubView] = useState<'top_fonem' | 'vokal' | 'artikulasi' | 'silabel_pola'>('top_fonem');
  // Bar chart mode: 'total' or 'position' (stacked by initial, medial, final)
  const [barChartMode, setBarChartMode] = useState<'total' | 'position'>('total');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatternFilter, setSelectedPatternFilter] = useState<string>('ALL');
  const [selectedLengthFilter, setSelectedLengthFilter] = useState<string>('ALL');
  const [copiedStatus, setCopiedStatus] = useState(false);

  // 1. Build List of Available Observation Points (Active, Database Surveys, Benchmarks)
  const availablePoints = useMemo(() => {
    const list: { id: string; name: string; region: string; language: string; list: KosakataItem[] }[] = [];

    // Option 1: Current Active Survey Point
    list.push({
      id: 'active_survey',
      name: `TP Acuan: ${titikPengamatan?.namaDesa || activeSurveyTitle || 'Survei Aktif'}`,
      region: `${titikPengamatan?.kecamatan || ''}, ${titikPengamatan?.kabupatenKota || titikPengamatan?.provinsi || ''}`,
      language: titikPengamatan?.bahasaDigunakan || 'Bahasa Lapangan',
      list: swadeshList
    });

    // Option 2: Surveys from allSurveys (database)
    allSurveys.forEach((s) => {
      const sList = s.data?.kosakataLengkap?.swadeshList || [];
      const sDesa = s.desa || s.data?.titikPengamatan?.namaDesa || s.title;
      const sLang = s.bahasa || s.data?.titikPengamatan?.bahasaDigunakan || 'Bahasa Daerah';
      const sProv = s.provinsi || s.data?.titikPengamatan?.provinsi || 'Indonesia';

      list.push({
        id: `survey_${s.id}`,
        name: `Survei: ${sDesa}`,
        region: sProv,
        language: sLang,
        list: sList
      });
    });

    // Option 3: Standard Comparative Presets (Sunda, Jawa, Betawi)
    const presetSunda = COMPARATIVE_CORPUS_PRESETS.find(p => p.id === 'preset_sunda_priangan');
    if (presetSunda) {
      const sundaWords: KosakataItem[] = Object.entries(presetSunda.entries).map(([glos, val], idx) => ({
        id: idx + 1,
        glosIndonesia: glos,
        bentukLokal: val.bentuk,
        transkripsiIPA: val.ipa
      }));
      list.push({
        id: 'preset_sunda',
        name: 'Benchmark: Sunda (Priangan)',
        region: 'Jawa Barat',
        language: 'Bahasa Sunda',
        list: sundaWords
      });
    }

    const presetJawa = COMPARATIVE_CORPUS_PRESETS.find(p => p.id === 'preset_jawa_banyumas');
    if (presetJawa) {
      const jawaWords: KosakataItem[] = Object.entries(presetJawa.entries).map(([glos, val], idx) => ({
        id: idx + 1,
        glosIndonesia: glos,
        bentukLokal: val.bentuk,
        transkripsiIPA: val.ipa
      }));
      list.push({
        id: 'preset_jawa',
        name: 'Benchmark: Jawa (Banyumasan)',
        region: 'Jawa Tengah Barat',
        language: 'Bahasa Jawa',
        list: jawaWords
      });
    }

    const presetBetawi = COMPARATIVE_CORPUS_PRESETS.find(p => p.id === 'preset_melayu_betawi');
    if (presetBetawi) {
      const betawiWords: KosakataItem[] = Object.entries(presetBetawi.entries).map(([glos, val], idx) => ({
        id: idx + 1,
        glosIndonesia: glos,
        bentukLokal: val.bentuk,
        transkripsiIPA: val.ipa
      }));
      list.push({
        id: 'preset_betawi',
        name: 'Benchmark: Melayu Betawi',
        region: 'DKI Jakarta',
        language: 'Bahasa Betawi',
        list: betawiWords
      });
    }

    return list;
  }, [titikPengamatan, activeSurveyTitle, swadeshList, allSurveys]);

  // Selected Primary Point
  const currentPoint = useMemo(() => {
    return availablePoints.find(p => p.id === selectedPointId) || availablePoints[0] || {
      id: 'default_ref',
      name: 'Titik Pengamatan',
      language: 'Bahasa Daerah',
      list: swadeshList || []
    };
  }, [availablePoints, selectedPointId, swadeshList]);

  // Run phonotactic analysis on current point
  const currentReport: PhonotacticSummaryReport = useMemo(() => {
    return analyzePhonotactics(currentPoint?.list || []);
  }, [currentPoint]);

  // Selected Comparison Point
  const comparePoint = useMemo(() => {
    return availablePoints.find(p => p.id === comparePointId) || availablePoints[1] || availablePoints[0] || {
      id: 'default_comp',
      name: 'Pembanding',
      language: 'Bahasa Daerah',
      list: []
    };
  }, [availablePoints, comparePointId]);

  // Run phonotactic analysis on compare point
  const compareReport: PhonotacticSummaryReport = useMemo(() => {
    return analyzePhonotactics(comparePoint?.list || []);
  }, [comparePoint]);

  // 2. RECHARTS DATA PREPARATION

  // Top 14 Phonemes overall (sorted by frequency)
  const topPhonemesChartData = useMemo(() => {
    const combined: (PhonemeFrequencyItem & { displayName: string; fill: string })[] = [
      ...currentReport.vowels.map(v => ({
        ...v,
        displayName: `/${v.phoneme}/`,
        fill: '#10b981' // Green for vowels
      })),
      ...currentReport.consonants.map(c => ({
        ...c,
        displayName: `/${c.phoneme}/`,
        fill: '#6366f1' // Indigo for consonants
      }))
    ].sort((a, b) => b.count - a.count);

    return combined.slice(0, 14).map(item => ({
      name: item.displayName,
      phoneme: item.phoneme,
      count: item.count,
      percentage: item.percentage,
      type: item.type,
      initial: item.positions.initial,
      medial: item.positions.medial,
      final: item.positions.final,
      articulationClass: item.articulationClass,
      fill: item.fill
    }));
  }, [currentReport]);

  // Vowel Pie Chart Data
  const vowelPieData = useMemo(() => {
    return currentReport.vowels.map((v, idx) => ({
      name: `/${v.phoneme}/`,
      phoneme: v.phoneme,
      value: v.count,
      percentage: v.percentage,
      articulationClass: v.articulationClass,
      fill: VOWEL_COLORS[idx % VOWEL_COLORS.length]
    }));
  }, [currentReport.vowels]);

  // Consonant Articulation Classes Pie Data
  const consonantArticulationPieData = useMemo(() => {
    const classMap: Record<string, { count: number; phonemes: string[] }> = {
      'Letup / Plosif': { count: 0, phonemes: [] },
      'Sengau / Nasal': { count: 0, phonemes: [] },
      'Geser / Frikatif': { count: 0, phonemes: [] },
      'Paduan / Afrikat': { count: 0, phonemes: [] },
      'Likuida / Getar & Sampingan': { count: 0, phonemes: [] },
      'Semivokal / Luncuran': { count: 0, phonemes: [] }
    };

    currentReport.consonants.forEach(c => {
      const cls = c.articulationClass.toLowerCase();
      let targetKey = 'Letup / Plosif';

      if (cls.includes('nasal') || cls.includes('sengau')) targetKey = 'Sengau / Nasal';
      else if (cls.includes('frikatif') || cls.includes('geser')) targetKey = 'Geser / Frikatif';
      else if (cls.includes('afrikat') || cls.includes('paduan')) targetKey = 'Paduan / Afrikat';
      else if (cls.includes('getar') || cls.includes('lateral') || cls.includes('likuida')) targetKey = 'Likuida / Getar & Sampingan';
      else if (cls.includes('semivokal') || cls.includes('luncuran')) targetKey = 'Semivokal / Luncuran';

      classMap[targetKey].count += c.count;
      classMap[targetKey].phonemes.push(`/${c.phoneme}/`);
    });

    const total = Object.values(classMap).reduce((a, b) => a + b.count, 0) || 1;

    return Object.entries(classMap)
      .filter(([_, data]) => data.count > 0)
      .map(([name, data]) => ({
        name,
        value: data.count,
        percentage: Math.round((data.count / total) * 1000) / 10,
        phonemes: data.phonemes.join(', '),
        fill: ARTICULATION_COLORS[name] || '#64748b'
      }))
      .sort((a, b) => b.value - a.value);
  }, [currentReport.consonants]);

  // Syllable Pattern Bar Chart Data
  const syllablePatternBarData = useMemo(() => {
    return currentReport.syllablePatterns.map((pat, idx) => ({
      name: pat.pattern,
      count: pat.count,
      percentage: pat.percentage,
      description: pat.description,
      fill: SYLLABLE_COLORS[idx % SYLLABLE_COLORS.length]
    }));
  }, [currentReport.syllablePatterns]);

  // Syllable Open vs Closed Donut Data
  const openClosedDonutData = useMemo(() => {
    return [
      {
        name: 'Silabel Terbuka (Vokal Akhir)',
        value: currentReport.openSyllableCount,
        percentage: currentReport.openSyllablePct,
        fill: '#10b981'
      },
      {
        name: 'Silabel Tertutup (Konsonan Akhir)',
        value: currentReport.closedSyllableCount,
        percentage: currentReport.closedSyllablePct,
        fill: '#6366f1'
      }
    ];
  }, [currentReport]);

  // Filtered Word List
  const filteredWords: AnalyzedWordPhonotactic[] = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return currentReport.analyzedWords.filter(item => {
      const matchGlos = item.glos.toLowerCase().includes(q);
      const matchWord = item.cleanedWord.toLowerCase().includes(q) || item.rawWord.toLowerCase().includes(q);
      const matchPattern = item.wordPattern.toLowerCase().includes(q);

      if (q && !(matchGlos || matchWord || matchPattern)) return false;

      if (selectedPatternFilter !== 'ALL') {
        const hasPattern = item.syllables.some(s => s.pattern === selectedPatternFilter);
        if (!hasPattern) return false;
      }

      if (selectedLengthFilter !== 'ALL') {
        if (selectedLengthFilter === '1' && item.syllableCount !== 1) return false;
        if (selectedLengthFilter === '2' && item.syllableCount !== 2) return false;
        if (selectedLengthFilter === '3' && item.syllableCount !== 3) return false;
        if (selectedLengthFilter === '4+' && item.syllableCount < 4) return false;
      }

      return true;
    });
  }, [currentReport.analyzedWords, searchQuery, selectedPatternFilter, selectedLengthFilter]);

  // Export report to CSV
  const handleExportCSV = () => {
    const headers = ['No', 'Glos Swadesh', 'Bentuk Lokal', 'Transkripsi Fonetik', 'Suku Kata', 'Pola Silabel', 'Jumlah Silabel', 'Tipe'];
    const rows = currentReport.analyzedWords.map((item, idx) => [
      (idx + 1).toString(),
      `"${item.glos}"`,
      `"${item.rawWord}"`,
      `"${item.ipa}"`,
      `"${item.syllables.map(s => s.syllable).join('.')}"`,
      `"${item.wordPattern}"`,
      item.syllableCount.toString(),
      `"${item.syllableType}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Analisis_Fonotaktik_${currentPoint.language.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy diagnosis to clipboard
  const handleCopySummary = () => {
    const text = `=== LAPORAN ANALISIS FONOTAKTIK KOSAKATA SWADESH ===
Titik Pengamatan: ${currentPoint.name}
Bahasa / Varian: ${currentPoint.language} (${currentPoint.region})
-----------------------------------------------------------
Total Kosakata Dianalisis: ${currentReport.totalWordsAnalyzed} kata
Total Silabel Ditemukan: ${currentReport.totalSyllables} suku kata
Rata-rata Silabel per Kata: ${currentReport.averageSyllablesPerWord} silabel

DISTRIBUSI POLA SILABEL:
${currentReport.syllablePatterns.map(p => `• ${p.pattern}: ${p.count} (${p.percentage}%) - ${p.description}`).join('\n')}

SILABEL TERBUKA VS TERTUTUP:
• Silabel Terbuka: ${currentReport.openSyllableCount} (${currentReport.openSyllablePct}%)
• Silabel Tertutup: ${currentReport.closedSyllableCount} (${currentReport.closedSyllablePct}%)

STRUKTUR PANJANG KATA (AUSTRONESIA KANONIK):
• Monosilabel (1 silabel): ${currentReport.syllableCountDistribution.monosyllable.pct}%
• Disilabel (2 silabel): ${currentReport.syllableCountDistribution.disyllable.pct}%
• Trisilabel (3 silabel): ${currentReport.syllableCountDistribution.trisyllable.pct}%
• Polisilabel (4+ silabel): ${currentReport.syllableCountDistribution.polysyllable.pct}%

DISTRIBUSI VOKAL TERATAS:
${currentReport.vowels.slice(0, 5).map(v => `• /${v.phoneme}/: ${v.count} (${v.percentage}%)`).join('\n')}

DISTRIBUSI KONSONAN TERATAS:
${currentReport.consonants.slice(0, 5).map(c => `• /${c.phoneme}/: ${c.count} (${c.percentage}%)`).join('\n')}

Rasio Konsonan : Vokal (C:V): ${currentReport.consonantVowelRatio}
===========================================================`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedStatus(true);
      setTimeout(() => setCopiedStatus(false), 2000);
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. MODULE BANNER & OBSERVATION POINT SELECTOR */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-sky-500/5 to-transparent border border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                Visualisasi Grafik Fonotaktik &amp; Fonem Recharts
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Titik Pengamatan Aktif: <strong>{currentPoint.name}</strong> ({currentPoint.language})
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Distribusi Frekuensi Fonem &amp; Pola Struktur Silabel</span>
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              Visualisasi grafik batang dan diagram lingkaran interaktif untuk mengamati dominasi fonem vokal, konsonan, 
              serta sebaran pola silabel (KV, KVK, V, VK) di setiap titik pengamatan secara mudah dan terukur.
            </p>
          </div>

          {/* Action Bar: Observation Point Selector & Export */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {/* Observation Point Dropdown */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1.5 shadow-2xs">
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 px-2 pb-0.5">
                Pilih Titik Pengamatan:
              </label>
              <select
                value={selectedPointId}
                onChange={(e) => setSelectedPointId(e.target.value)}
                className="w-full sm:w-56 bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 px-2 py-1 focus:outline-hidden cursor-pointer"
              >
                {availablePoints.map(p => (
                  <option key={p.id} value={p.id} className="dark:bg-slate-900">
                    {p.name} ({p.language})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopySummary}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-2xs transition-colors cursor-pointer"
                title="Salin Rangkuman Diagnosis ke Clipboard"
              >
                {copiedStatus ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copiedStatus ? 'Tersalin' : 'Salin'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                title="Unduh data analisis fonotaktik dalam format CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Diagnostic Highlight Bar */}
        <div className="mt-4 pt-4 border-t border-indigo-200/60 dark:border-indigo-900/40 flex items-start gap-2.5 text-xs text-indigo-900 dark:text-indigo-200 bg-white/70 dark:bg-slate-900/60 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Diagnosis Fonotaktis: </strong>
            <span>{currentReport.diagnosisDescription}</span>
          </div>
        </div>
      </div>

      {/* 2. CORE STATISTICAL KPI OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Pola Dominan</span>
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
            {currentReport.syllablePatterns[0]?.pattern || 'KV'}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {currentReport.syllablePatterns[0]?.percentage || 0}% ({currentReport.syllablePatterns[0]?.count || 0} silabel)
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Rasio Silabel Terbuka</span>
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {currentReport.openSyllablePct}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Tertutup: {currentReport.closedSyllablePct}%
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Disilabel Austronesia</span>
            <BookOpen className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono">
            {currentReport.syllableCountDistribution.disyllable.pct}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Rerata: {currentReport.averageSyllablesPerWord} silabel/kata
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Rasio Konsonan : Vokal</span>
            <Scale className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {currentReport.consonantVowelRatio} : 1
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            Top: /{currentReport.vowels[0]?.phoneme}/ &amp; /{currentReport.consonants[0]?.phoneme}/
          </div>
        </div>
      </div>

      {/* 3. NAVIGATION SUB-TABS */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('grafik')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'grafik'
              ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-2xs ring-1 ring-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-indigo-600" />
          <span>Visualisasi Grafik Fonem (Recharts)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('silabel')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'silabel'
              ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-2xs ring-1 ring-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>Pola Struktur Silabel (KV, KVK)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fonem')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'fonem'
              ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-2xs ring-1 ring-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Volume2 className="w-4 h-4 text-emerald-600" />
          <span>Tabel Frekuensi Fonem</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('daftar_kata')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'daftar_kata'
              ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-2xs ring-1 ring-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Table className="w-4 h-4 text-amber-600" />
          <span>Daftar Kosakata &amp; Silabifikasi ({currentReport.totalWordsAnalyzed})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('komparasi')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'komparasi'
              ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-2xs ring-1 ring-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Scale className="w-4 h-4 text-sky-600" />
          <span>Komparasi Fonotaktik Lintas TP</span>
        </button>
      </div>

      {/* 4. TAB CONTENTS */}

      {/* TAB 0: VISUALISASI GRAFIK FONEM (RECHARTS) */}
      {activeTab === 'grafik' && (
        <div className="space-y-6">
          {/* Subview Selector for Charts */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 mr-1 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                Pilih Tampilan Grafik:
              </span>

              <button
                type="button"
                onClick={() => setChartSubView('top_fonem')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  chartSubView === 'top_fonem'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                📊 Top 14 Fonem Dominan
              </button>

              <button
                type="button"
                onClick={() => setChartSubView('vokal')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  chartSubView === 'vokal'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                🥧 Diagram Proporsi Vokal
              </button>

              <button
                type="button"
                onClick={() => setChartSubView('artikulasi')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  chartSubView === 'artikulasi'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                🍩 Kelas Artikulasi Konsonan
              </button>

              <button
                type="button"
                onClick={() => setChartSubView('silabel_pola')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  chartSubView === 'silabel_pola'
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                📐 Pola Silabel (KV, KVK)
              </button>
            </div>

            {/* If in top_fonem mode, allow toggling stacked position view */}
            {chartSubView === 'top_fonem' && (
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px]">
                <button
                  type="button"
                  onClick={() => setBarChartMode('total')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    barChartMode === 'total'
                      ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Frekuensi Total
                </button>
                <button
                  type="button"
                  onClick={() => setBarChartMode('position')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    barChartMode === 'position'
                      ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Sebaran Posisi (Awal-Tengah-Akhir)
                </button>
              </div>
            )}
          </div>

          {/* VIEW A: TOP 14 PHONEMES BAR CHART */}
          {chartSubView === 'top_fonem' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                    <span>Grafik Batang Dominasi Fonem Teratas (Top 14)</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Frekuensi kemunculan fonem vokal (hijau) dan konsonan (indigo) pada data kosakata Swadesh {currentPoint.name}.
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                    Vokal ({currentReport.vowels.length})
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400">
                    <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
                    Konsonan ({currentReport.consonants.length})
                  </span>
                </div>
              </div>

              {/* Recharts BarChart */}
              <div className="h-80 sm:h-96 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topPhonemesChartData}
                    margin={{ top: 20, right: 20, left: 0, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload?.[0]?.payload;
                          if (!data) return null;
                          return (
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs space-y-1">
                              <div className="font-mono font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-xs ${data.type === 'VOKAL' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'}`}>
                                  {data.type}
                                </span>
                                <span>Fonem {data.name}</span>
                              </div>
                              <div className="text-slate-600 dark:text-slate-300 font-medium">
                                {data.articulationClass}
                              </div>
                              <div className="pt-1 border-t border-slate-100 dark:border-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-200 space-y-0.5">
                                <div>Total Kemunculan: <strong>{data.count} kali</strong> ({data.percentage}%)</div>
                                <div className="text-slate-500">
                                  Posisi: Awal {data.initial}x | Tengah {data.medial}x | Akhir {data.final}x
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {barChartMode === 'total' ? (
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {topPhonemesChartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.type === 'VOKAL' ? '#10b981' : '#6366f1'} 
                          />
                        ))}
                      </Bar>
                    ) : (
                      <>
                        <RechartsLegend verticalAlign="top" height={36} />
                        <Bar dataKey="initial" name="Posisi Awal (Onset)" stackId="a" fill="#3b82f6" />
                        <Bar dataKey="medial" name="Posisi Tengah (Medial)" stackId="a" fill="#8b5cf6" />
                        <Bar dataKey="final" name="Posisi Akhir (Koda)" stackId="a" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                      </>
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span>
                  💡 <strong>Analisis:</strong> Fonem yang paling dominan di titik pengamatan ini adalah <strong>{topPhonemesChartData[0]?.name || '—'}</strong> ({topPhonemesChartData[0]?.count || 0}x, {topPhonemesChartData[0]?.percentage || 0}%), mencerminkan karakteristik leksikal khas {currentPoint?.language || 'bahasa daerah'}.
                </span>
                <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                  Total {currentReport.totalPhonemes} Fonem Terpetakan
                </span>
              </div>
            </div>
          )}

          {/* VIEW B: VOWEL PIE CHART */}
          {chartSubView === 'vokal' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-emerald-600" />
                    <span>Diagram Lingkaran: Proporsi Sebaran Fonem Vokal</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Persentase kemunculan masing-masing vokal dalam inventaris Swadesh {currentPoint.name}.
                  </p>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {currentReport.vowels.length} Fonem Vokal
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* Recharts PieChart */}
                <div className="md:col-span-7 h-72 sm:h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={vowelPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={95}
                        innerRadius={45}
                        paddingAngle={2}
                        label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} (${((percent || 0) * 100).toFixed(0)}%)`}
                      >
                        {vowelPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload?.[0]?.payload;
                            if (!data) return null;
                            return (
                              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs space-y-1">
                                <div className="font-mono font-bold text-sm text-emerald-700 dark:text-emerald-400">
                                  Fonem {data.name}
                                </div>
                                <div className="text-slate-600 dark:text-slate-300">
                                  {data.articulationClass}
                                </div>
                                <div className="font-mono font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-100 dark:border-slate-800">
                                  {data.value} kali ({data.percentage}%)
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Vowel Legend Breakdown */}
                <div className="md:col-span-5 space-y-2">
                  <h5 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Rincian Persentase Vokal:
                  </h5>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {vowelPieData.map((v) => (
                      <div 
                        key={v.name}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 text-xs font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-3.5 h-3.5 rounded-full shrink-0" 
                            style={{ backgroundColor: v.fill }} 
                          />
                          <span className="font-black text-slate-900 dark:text-white">{v.name}</span>
                          <span className="text-[10px] text-slate-500 font-sans truncate">{v.articulationClass.split(' ')[0]}</span>
                        </div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {v.value}x <span className="text-emerald-600 dark:text-emerald-400">({v.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW C: CONSONANT ARTICULATION CLASS PIE CHART */}
          {chartSubView === 'artikulasi' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-purple-600" />
                    <span>Diagram Lingkaran: Distribusi Kelas Artikulasi Konsonan</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Pengelompokan konsonan berdasarkan cara artikulasinya (Letup, Sengau, Frikatif, Afrikat, Likuida, Luncuran).
                  </p>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                  {consonantArticulationPieData.length} Kategori Artikulasi
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* Recharts PieChart (Donut) */}
                <div className="md:col-span-7 h-72 sm:h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={consonantArticulationPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={50}
                        paddingAngle={3}
                        label={({ name, percent }: { name?: string; percent?: number }) => `${(name || '').split('/')[0].trim()} (${((percent || 0) * 100).toFixed(0)}%)`}
                      >
                        {consonantArticulationPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload?.[0]?.payload;
                            if (!data) return null;
                            return (
                              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs space-y-1">
                                <div className="font-bold text-sm text-purple-700 dark:text-purple-400">
                                  {data.name}
                                </div>
                                <div className="text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                                  Fonem: {data.phonemes}
                                </div>
                                <div className="font-mono font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-100 dark:border-slate-800">
                                  {data.value} kali ({data.percentage}%)
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Articulation Breakdown List */}
                <div className="md:col-span-5 space-y-2">
                  <h5 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Kelas Cara Artikulasi:
                  </h5>
                  <div className="space-y-2">
                    {consonantArticulationPieData.map((item) => (
                      <div 
                        key={item.name}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 text-xs"
                      >
                        <div className="flex items-center justify-between font-bold mb-1">
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-3 h-3 rounded-full shrink-0" 
                              style={{ backgroundColor: item.fill }} 
                            />
                            <span className="text-slate-900 dark:text-white">{item.name}</span>
                          </div>
                          <span className="font-mono text-purple-600 dark:text-purple-400">
                            {item.value}x ({item.percentage}%)
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono pl-5">
                          Fonem: {item.phonemes}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW D: SYLLABLE PATTERNS & OPEN/CLOSED DONUT */}
          {chartSubView === 'silabel_pola' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Bar chart of Syllable Patterns (KV, KVK, etc.) */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-sky-600" />
                        <span>Grafik Frekuensi Bangun Silabel</span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Perbandingan pola KV, KVK, V, VK, KKV, dll.
                      </p>
                    </div>
                  </div>

                  <div className="h-72 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={syllablePatternBarData}
                        margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }}
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{ fill: '#64748b', fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <RechartsTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload?.[0]?.payload;
                              if (!data) return null;
                              return (
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs space-y-1">
                                  <div className="font-mono font-bold text-sm text-sky-700 dark:text-sky-400">
                                    Pola Silabel: {data.name}
                                  </div>
                                  <div className="text-slate-600 dark:text-slate-300">
                                    {data.description}
                                  </div>
                                  <div className="font-mono font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-100 dark:border-slate-800">
                                    {data.count} kali ({data.percentage}%)
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {syllablePatternBarData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Donut of Open vs Closed Syllables */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                  <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <PieChartIcon className="w-4 h-4 text-emerald-600" />
                      <span>Silabel Terbuka vs Tertutup</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Proporsi koda terbuka (vokal) vs tertutup (konsonan).
                    </p>
                  </div>

                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={openClosedDonutData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={45}
                          paddingAngle={4}
                          label={({ percent }: { percent?: number }) => `${((percent || 0) * 100).toFixed(0)}%`}
                        >
                          {openClosedDonutData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                        Silabel Terbuka (Open)
                      </span>
                      <span className="font-mono">{currentReport.openSyllableCount}x ({currentReport.openSyllablePct}%)</span>
                    </div>

                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400">
                        <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
                        Silabel Tertutup (Closed)
                      </span>
                      <span className="font-mono">{currentReport.closedSyllableCount}x ({currentReport.closedSyllablePct}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: POLA STRUKTUR SILABEL (KV, KVK, DLL) */}
      {activeTab === 'silabel' && (
        <div className="space-y-6">
          {/* Detailed Syllable Pattern Table & Bars */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <span>Distribusi Pola Silabel (Suku Kata)</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Frekuensi dan persentase kemunculan masing-masing bangun silabel dari {currentReport.totalSyllables} suku kata.
                </p>
              </div>

              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {currentReport.syllablePatterns.length} Pola Teridentifikasi
              </span>
            </div>

            <div className="space-y-3">
              {currentReport.syllablePatterns.map((pat, idx) => (
                <div 
                  key={pat.pattern}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center shadow-2xs">
                        {idx + 1}
                      </span>
                      <span className="font-mono font-black text-sm text-slate-900 dark:text-white px-2.5 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs">
                        {pat.pattern}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {pat.description}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="font-bold text-slate-900 dark:text-white">{pat.count} kali</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                        {pat.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                    <div 
                      style={{ width: `${Math.min(100, pat.percentage)}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0 
                          ? 'bg-indigo-600' 
                          : idx === 1 
                          ? 'bg-teal-600' 
                          : idx === 2 
                          ? 'bg-sky-600' 
                          : 'bg-amber-600'
                      }`}
                    />
                  </div>

                  {/* Examples from survey words */}
                  {pat.examples.length > 0 && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">Contoh Kosakata:</span>
                      {pat.examples.map((ex, exIdx) => (
                        <span 
                          key={exIdx} 
                          className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-[10px]"
                        >
                          <strong>{ex.word}</strong> ({ex.glos}) → <span className="text-indigo-600 dark:text-indigo-400 font-bold">[{ex.syllable}]</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Two-Column Grid: Syllable Types & Final Codas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Syllable Word Length (Disyllabic vs Monosyllabic) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-600" />
                <span>Tipologi Panjang Kata (*Syllabic Length*)</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pola disilabel (2 suku kata) merupakan kanonik tipikal rumpun Austronesia.
              </p>

              <div className="space-y-3 pt-1">
                <div className="p-3 rounded-xl bg-sky-50/60 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-900/60">
                  <div className="flex justify-between items-center text-xs font-bold text-sky-900 dark:text-sky-300 mb-1">
                    <span>Disilabel (2 Suku Kata - Kanonik)</span>
                    <span className="font-mono">{currentReport.syllableCountDistribution.disyllable.pct}% ({currentReport.syllableCountDistribution.disyllable.count} kata)</span>
                  </div>
                  <div className="w-full h-2 bg-sky-200 dark:bg-sky-800 rounded-full overflow-hidden">
                    <div style={{ width: `${currentReport.syllableCountDistribution.disyllable.pct}%` }} className="bg-sky-600 h-full" />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Monosilabel (1 Suku Kata)</span>
                    <span className="font-mono">{currentReport.syllableCountDistribution.monosyllable.pct}% ({currentReport.syllableCountDistribution.monosyllable.count} kata)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div style={{ width: `${currentReport.syllableCountDistribution.monosyllable.pct}%` }} className="bg-slate-500 h-full" />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Trisilabel (3 Suku Kata)</span>
                    <span className="font-mono">{currentReport.syllableCountDistribution.trisyllable.pct}% ({currentReport.syllableCountDistribution.trisyllable.count} kata)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div style={{ width: `${currentReport.syllableCountDistribution.trisyllable.pct}%` }} className="bg-indigo-500 h-full" />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Polisilabel (4+ Suku Kata)</span>
                    <span className="font-mono">{currentReport.syllableCountDistribution.polysyllable.pct}% ({currentReport.syllableCountDistribution.polysyllable.count} kata)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div style={{ width: `${currentReport.syllableCountDistribution.polysyllable.pct}%` }} className="bg-purple-500 h-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Koda Akhir Kata & Klaster Konsonan */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>Koda Akhir Kata &amp; Gugus Konsonan (*Clusters*)</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Distribusi konsonan penutup pada suku kata akhir kata Swadesh.
              </p>

              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Konsonan Koda Akhir Paling Produktif:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {currentReport.commonFinalCodas.slice(0, 8).map(coda => (
                    <div 
                      key={coda.coda}
                      className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 text-center"
                    >
                      <span className="font-mono font-black text-sm text-emerald-800 dark:text-emerald-300 block">
                        /{coda.coda}/
                      </span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block mt-0.5">
                        {coda.count}x ({coda.pct}%)
                      </span>
                    </div>
                  ))}
                </div>

                {/* Consonant Clusters */}
                {currentReport.consonantClusters.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Gugus Konsonan Onset (Klaster):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {currentReport.consonantClusters.map(cl => (
                        <span 
                          key={cl.cluster}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-800 dark:text-slate-200"
                          title={`Contoh: ${cl.examples.join(', ')}`}
                        >
                          /{cl.cluster}/ ({cl.count}x)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DISTRIBUSI FREKUENSI FONEM */}
      {activeTab === 'fonem' && (
        <div className="space-y-6">
          {/* Quick Chart Highlight inside Fonem tab */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <span>Grafik Frekuensi Fonem Vokal (Recharts)</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Visualisasi sebaran frekuensi vokal /a, i, u, e, o, ə/ di titik pengamatan {currentPoint.name}.
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentReport.vowels} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                  <XAxis dataKey="phoneme" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} tickFormatter={(val) => `/${val}/`} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                  <RechartsTooltip />
                  <Bar dataKey="count" name="Jumlah Kemunculan" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* VOKAL TABLE */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span>Inventaris &amp; Distribusi Frekuensi Fonem Vokal</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Sebaran kemunculan fonem vokal serta distribusinya pada posisi awal, tengah, dan akhir kata.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {currentReport.vowels.length} Fonem Vokal
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="p-3">Fonem</th>
                    <th className="p-3">Simbol IPA</th>
                    <th className="p-3">Klasifikasi Artikulasi</th>
                    <th className="p-3 text-right">Frekuensi</th>
                    <th className="p-3 text-right">Persentase</th>
                    <th className="p-3 text-center">Posisi Awal</th>
                    <th className="p-3 text-center">Posisi Tengah</th>
                    <th className="p-3 text-center">Posisi Akhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {currentReport.vowels.map((v) => (
                    <tr key={v.phoneme} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-black text-base text-emerald-700 dark:text-emerald-400">
                        /{v.phoneme}/
                      </td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-300">
                        {v.ipaSymbol}
                      </td>
                      <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                        {v.articulationClass}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {v.count}x
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {v.percentage}%
                      </td>
                      <td className="p-3 text-center font-mono text-slate-600 dark:text-slate-400">
                        {v.positions.initial}
                      </td>
                      <td className="p-3 text-center font-mono text-slate-600 dark:text-slate-400">
                        {v.positions.medial}
                      </td>
                      <td className="p-3 text-center font-mono text-slate-600 dark:text-slate-400">
                        {v.positions.final}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* KONSONAN TABLE */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-indigo-600" />
                  <span>Inventaris &amp; Distribusi Frekuensi Fonem Konsonan</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Sebaran konsonan berdasarkan cara artikulasi dan distribusinya (Onset, Intervokalik, Koda).
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                {currentReport.consonants.length} Fonem Konsonan
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="p-3">Fonem</th>
                    <th className="p-3">Simbol IPA</th>
                    <th className="p-3">Kelas Artikulasi</th>
                    <th className="p-3 text-right">Frekuensi</th>
                    <th className="p-3 text-right">Persentase</th>
                    <th className="p-3 text-center">Onset (Awal)</th>
                    <th className="p-3 text-center">Intervokalik</th>
                    <th className="p-3 text-center">Koda (Akhir)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {currentReport.consonants.map((c) => (
                    <tr key={c.phoneme} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-black text-base text-indigo-700 dark:text-indigo-400">
                        /{c.phoneme}/
                      </td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-300">
                        {c.ipaSymbol}
                      </td>
                      <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                        {c.articulationClass}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {c.count}x
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {c.percentage}%
                      </td>
                      <td className="p-3 text-center font-mono text-slate-600 dark:text-slate-400">
                        {c.positions.initial}
                      </td>
                      <td className="p-3 text-center font-mono text-slate-600 dark:text-slate-400">
                        {c.positions.medial}
                      </td>
                      <td className="p-3 text-center font-mono text-slate-600 dark:text-slate-400">
                        {c.positions.final}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DAFTAR KOSAKATA & SILABIFIKASI */}
      {activeTab === 'daftar_kata' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Table className="w-4 h-4 text-amber-600" />
                <span>Hasil Silabifikasi Kosakata Swadesh</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {filteredWords.length} Kata
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Rincian pemisahan suku kata dan pola fonotaktis per kosakata dasar Swadesh.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Pattern Filter */}
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg">
                <span className="text-[10px] text-slate-400 font-semibold">Pola:</span>
                <select
                  value={selectedPatternFilter}
                  onChange={(e) => setSelectedPatternFilter(e.target.value)}
                  className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">Semua Pola Silabel</option>
                  {currentReport.syllablePatterns.map(p => (
                    <option key={p.pattern} value={p.pattern}>
                      {p.pattern} ({p.count}x)
                    </option>
                  ))}
                </select>
              </div>

              {/* Length Filter */}
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg">
                <span className="text-[10px] text-slate-400 font-semibold">Panjang:</span>
                <select
                  value={selectedLengthFilter}
                  onChange={(e) => setSelectedLengthFilter(e.target.value)}
                  className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">Semua Panjang Silabel</option>
                  <option value="1">Monosilabel (1)</option>
                  <option value="2">Disilabel (2) - Kanonik</option>
                  <option value="3">Trisilabel (3)</option>
                  <option value="4+">Polisilabel (4+)</option>
                </select>
              </div>

              {/* Keyword Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari glos atau kata..."
                  className="pl-8 pr-2 py-1 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-amber-500 w-36 sm:w-44"
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

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 max-h-[550px] overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 font-bold text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-3 w-14">No</th>
                  <th className="p-3">Glos Swadesh</th>
                  <th className="p-3">Bentuk Lokal</th>
                  <th className="p-3">Silabifikasi (*Syllable Cut*)</th>
                  <th className="p-3">Pola Fonotaktik Kata</th>
                  <th className="p-3 text-center">Silabel</th>
                  <th className="p-3 text-center">Tipe Kanonik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredWords.length > 0 ? (
                  filteredWords.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3 text-slate-400 font-mono text-center">
                        {idx + 1}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {item.glos}
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{item.cleanedWord}</span>
                        {item.ipa && <span className="text-[10px] text-slate-400 font-mono block">{item.ipa}</span>}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap items-center gap-1 font-mono font-bold text-indigo-700 dark:text-indigo-400">
                          {item.syllables.map((syl, sIdx) => (
                            <span 
                              key={sIdx}
                              className={`px-1.5 py-0.5 rounded text-[11px] border ${
                                syl.isOpen 
                                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                                  : 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                              }`}
                              title={`${syl.syllable}: Pola ${syl.pattern} (${syl.isOpen ? 'Terbuka' : 'Tertutup'})`}
                            >
                              {syl.syllable}
                              <span className="text-[9px] opacity-75 ml-1 font-sans">({syl.pattern})</span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {item.wordPattern}
                      </td>
                      <td className="p-3 text-center font-mono font-bold">
                        {item.syllableCount}
                      </td>
                      <td className="p-3 text-center">
                        {item.canonicalType ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                            ✓ Disilabel
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                            {item.syllableType}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400 text-xs">
                      Tidak ditemukan kosakata yang sesuai dengan kriteria filter pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: KOMPARASI FONOTAKTIK LINTAS TITIK PENGAMATAN */}
      {activeTab === 'komparasi' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-sky-600" />
                <span>Perbandingan Fonotaktik Antar Titik Pengamatan</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Bandingkan karakteristik struktur silabel dan rasio fonem antara dua titik pengamatan secara langsung.
              </p>
            </div>
          </div>

          {/* Point Selector Pair */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 space-y-1">
              <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-400 uppercase tracking-wider block">
                Titik Pengamatan A (Acuan / Survei 1)
              </span>
              <select
                value={selectedPointId}
                onChange={(e) => setSelectedPointId(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg p-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
              >
                {availablePoints.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.language})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3.5 rounded-xl bg-sky-50/60 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60 space-y-1">
              <span className="text-[10px] font-bold text-sky-800 dark:text-sky-400 uppercase tracking-wider block">
                Titik Pengamatan B (Pembanding / Survei 2)
              </span>
              <select
                value={comparePointId}
                onChange={(e) => setComparePointId(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 rounded-lg p-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
              >
                {availablePoints.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.language})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparison KPI Side-by-Side Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-3">Parameter Fonotaktis</th>
                  <th className="p-3 text-indigo-700 dark:text-indigo-400">{currentPoint.name}</th>
                  <th className="p-3 text-sky-700 dark:text-sky-400">{comparePoint.name}</th>
                  <th className="p-3 text-center">Karakteristik &amp; Perbedaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                    Pola Silabel Dominan
                  </td>
                  <td className="p-3 font-mono font-bold text-indigo-700 dark:text-indigo-400">
                    {currentReport.syllablePatterns[0]?.pattern || 'KV'} ({currentReport.syllablePatterns[0]?.percentage || 0}%)
                  </td>
                  <td className="p-3 font-mono font-bold text-sky-700 dark:text-sky-400">
                    {compareReport.syllablePatterns[0]?.pattern || 'KV'} ({compareReport.syllablePatterns[0]?.percentage || 0}%)
                  </td>
                  <td className="p-3 text-center text-[11px] text-slate-500">
                    {currentReport.syllablePatterns[0]?.pattern === compareReport.syllablePatterns[0]?.pattern 
                      ? 'Pola dominan identik' 
                      : 'Variasi pola silabel utama'}
                  </td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                    Rasio Silabel Terbuka : Tertutup
                  </td>
                  <td className="p-3 font-mono font-bold">
                    {currentReport.openSyllablePct}% : {currentReport.closedSyllablePct}%
                  </td>
                  <td className="p-3 font-mono font-bold">
                    {compareReport.openSyllablePct}% : {compareReport.closedSyllablePct}%
                  </td>
                  <td className="p-3 text-center text-[11px] text-slate-500">
                    Selisih terbuka: {Math.abs(Math.round((currentReport.openSyllablePct - compareReport.openSyllablePct) * 10) / 10)}%
                  </td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                    Proporsi Disilabel Kanonik (2 Suku Kata)
                  </td>
                  <td className="p-3 font-mono font-bold text-indigo-700 dark:text-indigo-400">
                    {currentReport.syllableCountDistribution.disyllable.pct}%
                  </td>
                  <td className="p-3 font-mono font-bold text-sky-700 dark:text-sky-400">
                    {compareReport.syllableCountDistribution.disyllable.pct}%
                  </td>
                  <td className="p-3 text-center text-[11px] text-slate-500">
                    {currentReport.syllableCountDistribution.disyllable.pct > 70 ? 'Struktur Austronesia murni' : 'Penyimpangan silabik'}
                  </td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                    Rasio Konsonan terhadap Vokal (C:V)
                  </td>
                  <td className="p-3 font-mono font-bold">
                    {currentReport.consonantVowelRatio} : 1
                  </td>
                  <td className="p-3 font-mono font-bold">
                    {compareReport.consonantVowelRatio} : 1
                  </td>
                  <td className="p-3 text-center text-[11px] text-slate-500">
                    Kepadatan konsonantal
                  </td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                    Vokal Paling Sering Muncul
                  </td>
                  <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    /{currentReport.vowels[0]?.phoneme}/ ({currentReport.vowels[0]?.percentage}%)
                  </td>
                  <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    /{compareReport.vowels[0]?.phoneme}/ ({compareReport.vowels[0]?.percentage}%)
                  </td>
                  <td className="p-3 text-center text-[11px] text-slate-500">
                    Vokal vokalik inti
                  </td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                    Konsonan Koda Akhir Utama
                  </td>
                  <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                    /{currentReport.commonFinalCodas[0]?.coda || '—'}/ ({currentReport.commonFinalCodas[0]?.pct || 0}%)
                  </td>
                  <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                    /{compareReport.commonFinalCodas[0]?.coda || '—'}/ ({compareReport.commonFinalCodas[0]?.pct || 0}%)
                  </td>
                  <td className="p-3 text-center text-[11px] text-slate-500">
                    Pola penutup leksikal
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
