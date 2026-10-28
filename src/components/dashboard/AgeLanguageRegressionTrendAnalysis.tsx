import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Calendar,
  Clock,
  MapPin,
  Filter,
  Search,
  Download,
  Info,
  Sparkles,
  SlidersHorizontal,
  TableProperties,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Globe2,
  Briefcase,
  GraduationCap,
  Layers,
  ChevronRight
} from 'lucide-react';
import { SurveyRecord } from '../../types/linguistic';
import {
  extractAgeRegressionDataset,
  calculateAgeLanguageRegression,
  calculateGenerationCohortSummaries,
  LANGUAGE_VARIABLES,
  LanguageVariableKey,
  AgeRegressionDataPoint
} from '../../utils/ageLanguageRegression';

export interface AgeLanguageRegressionTrendAnalysisProps {
  surveys: SurveyRecord[];
  activeSurveyId?: string | null;
  onSelectSurvey?: (id: string) => void;
  onNavigateToSection?: (surveyId: string, sectionIndex: number) => void;
  onSwitchToEditor?: () => void;
  onNavigateToDialekPeta?: () => void;
}

type ChartViewMode = 'scatter_trend' | 'cohort_timeline' | 'multivariable_trend';
type ColorGrouping = 'cohort' | 'bahasa' | 'gender';

const COHORT_COLORS: Record<string, string> = {
  tetua: '#6366f1', // Indigo
  madya: '#3b82f6', // Blue
  milenial: '#0ea5e9', // Sky
  genz: '#10b981'   // Emerald
};

const GENDER_COLORS: Record<string, string> = {
  pria: '#3b82f6',
  wanita: '#ec4899'
};

const LANGUAGE_PALETTE: Record<string, string> = {
  'Bahasa Sunda': '#6366f1',
  'Bahasa Sunda Dialek Selatan': '#8b5cf6',
  'Bahasa Sunda Pesisir Pameungpeuk': '#06b6d4',
  'Bahasa Sunda-Jawa Campuran (Banyumasan)': '#f59e0b',
  'Bahasa Jawa': '#ec4899',
  'Bahasa Melayu Betawi': '#10b981',
  'Bahasa Cirebon': '#3b82f6'
};

export const AgeLanguageRegressionTrendAnalysis: React.FC<AgeLanguageRegressionTrendAnalysisProps> = ({
  surveys,
  activeSurveyId,
  onSelectSurvey,
  onNavigateToSection,
  onSwitchToEditor,
  onNavigateToDialekPeta
}) => {
  // 1. STATE KONTROL
  const [selectedVariable, setSelectedVariable] = useState<LanguageVariableKey>('retensiArkaisPct');
  const [chartViewMode, setChartViewMode] = useState<ChartViewMode>('scatter_trend');
  const [colorGrouping, setColorGrouping] = useState<ColorGrouping>('cohort');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [filterProvince, setFilterProvince] = useState<string>('all');
  const [filterGender, setFilterGender] = useState<'all' | 'pria' | 'wanita'>('all');
  const [showRegressionLine, setShowRegressionLine] = useState(true);
  const [showReferenceMeans, setShowReferenceMeans] = useState(true);
  const [searchTableQuery, setSearchTableQuery] = useState('');
  const [calculatorAge, setCalculatorAge] = useState<number>(35);

  // 2. EKSTRAKSI DATASET KESELURUHAN
  const rawDataset = useMemo(() => {
    return extractAgeRegressionDataset(surveys);
  }, [surveys]);

  // Daftar Opsi Filter
  const availableLanguages = useMemo(() => {
    const set = new Set<string>();
    rawDataset.forEach(d => { if (d.bahasa) set.add(d.bahasa); });
    return Array.from(set);
  }, [rawDataset]);

  const availableProvinces = useMemo(() => {
    const set = new Set<string>();
    rawDataset.forEach(d => { if (d.provinsi) set.add(d.provinsi); });
    return Array.from(set);
  }, [rawDataset]);

  // 3. FILTERING DATASET
  const filteredDataset = useMemo(() => {
    return rawDataset.filter(item => {
      if (filterLanguage !== 'all' && item.bahasa !== filterLanguage) return false;
      if (filterProvince !== 'all' && item.provinsi !== filterProvince) return false;
      if (filterGender !== 'all' && item.gender !== filterGender) return false;
      return true;
    });
  }, [rawDataset, filterLanguage, filterProvince, filterGender]);

  // 4. KALKULASI REGRESI LINIER & STATISTIK TREN
  const regressionSummary = useMemo(() => {
    return calculateAgeLanguageRegression(filteredDataset, selectedVariable);
  }, [filteredDataset, selectedVariable]);

  // 5. KALKULASI RINGKASAN KOHORT GENERASI
  const cohortSummaries = useMemo(() => {
    return calculateGenerationCohortSummaries(filteredDataset, selectedVariable);
  }, [filteredDataset, selectedVariable]);

  // 6. DATA UNTUK GRAFIK MULTIVARIABEL (TREN BEBERAPA VARIABEL BERSAMAAN)
  const multivariableTrendData = useMemo(() => {
    return cohortSummaries.map(cohort => ({
      name: cohort.cohortLabel.replace('Generasi ', ''),
      ageLabel: cohort.ageRange,
      birthYear: cohort.birthYearRange,
      'Retensi Arkais (%)': cohort.avgRetensiArkais,
      'Pembakuan Standar (%)': cohort.avgPembakuanStandar,
      'Penggunaan Domestik (%)': cohort.avgRanahDomestik,
      'Deviasi Leksikal (%)': cohort.avgVariasiLeksikal,
      'Inovasi Bentuk Baru': cohort.avgInovasiLokal
    }));
  }, [cohortSummaries]);

  // 7. DATA TREN KOHORT TIMELINE UNTUK AREACHART
  const cohortTimelineData = useMemo(() => {
    return cohortSummaries.map(c => ({
      cohort: c.cohortLabel,
      range: c.ageRange,
      avgAge: c.avgAge,
      rataRata: c.avgValue,
      rentangBawah: c.minValue,
      rentangAtas: c.maxValue,
      jumlahInforman: c.count
    }));
  }, [cohortSummaries]);

  // 8. DATA GABUNGAN UNTUK COMPOSED CHART (SCATTER + GARIS TREN REGRESI)
  const composedChartData = useMemo(() => {
    // Urutkan berdasarkan usia
    const sortedPoints = [...filteredDataset].sort((a, b) => a.usia - b.usia);
    
    // Gabungkan dengan nilai regresi garis linier
    return sortedPoints.map(p => {
      const predY = Math.round((regressionSummary.slope * p.usia + regressionSummary.intercept) * 10) / 10;
      return {
        ...p,
        xAge: p.usia,
        yValue: p[selectedVariable] as number,
        trendY: predY
      };
    });
  }, [filteredDataset, selectedVariable, regressionSummary]);

  // Kalkulasi Prediksi Kalkulator Waktu Semu
  const predictedCalculatorValue = useMemo(() => {
    const val = regressionSummary.slope * calculatorAge + regressionSummary.intercept;
    return Math.max(0, Math.min(100, Math.round(val * 10) / 10));
  }, [calculatorAge, regressionSummary]);

  // Konfigurasi Variabel Aktif
  const activeVarConfig = LANGUAGE_VARIABLES[selectedVariable];

  // Helper Warna Node
  const getNodeColor = (item: AgeRegressionDataPoint) => {
    if (colorGrouping === 'cohort') {
      return COHORT_COLORS[item.cohortKey] || '#6366f1';
    } else if (colorGrouping === 'gender') {
      return GENDER_COLORS[item.gender] || '#6366f1';
    } else {
      return LANGUAGE_PALETTE[item.bahasa] || '#8b5cf6';
    }
  };

  // Helper Ekspor CSV
  const handleExportCSV = () => {
    if (filteredDataset.length === 0) return;
    const headers = [
      'ID_Informan',
      'Nama_Informan',
      'Usia',
      'Kohort_Generasi',
      'Perkiraan_Tahun_Lahir',
      'Gender',
      'Desa',
      'Kecamatan',
      'Kabupaten',
      'Provinsi',
      'Bahasa',
      'Pendidikan',
      'Pekerjaan',
      'Retensi_Arkais_Pct',
      'Pembakuan_Standar_Pct',
      'Variasi_Leksikal_Pct',
      'Penggunaan_Domestik_Pct',
      'Inovasi_Lokal_Count'
    ];

    const rows = filteredDataset.map(d => [
      `"${d.informantId}"`,
      `"${d.informantName.replace(/"/g, '""')}"`,
      d.usia,
      `"${d.cohortLabel}"`,
      d.perkiraanTahunLahir,
      `"${d.gender}"`,
      `"${d.desa.replace(/"/g, '""')}"`,
      `"${d.kecamatan.replace(/"/g, '""')}"`,
      `"${d.kabupaten.replace(/"/g, '""')}"`,
      `"${d.provinsi.replace(/"/g, '""')}"`,
      `"${d.bahasa.replace(/"/g, '""')}"`,
      `"${d.pendidikan.replace(/"/g, '""')}"`,
      `"${d.pekerjaan.replace(/"/g, '""')}"`,
      d.retensiArkaisPct,
      d.pembakuanStandarPct,
      d.variasiLeksikalPct,
      d.ranahDomestikPct,
      d.inovasiLokalCount
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Regresi_Usia_Variabel_Bahasa_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Helper Ekspor JSON
  const handleExportJSON = () => {
    const exportObject = {
      meta: {
        exportedAt: new Date().toISOString(),
        totalNarasumber: filteredDataset.length,
        selectedVariable: activeVarConfig.label,
        regressionEquation: `Y = ${regressionSummary.slope} * X + ${regressionSummary.intercept}`,
        rSquared: regressionSummary.rSquared,
        pearsonR: regressionSummary.r,
        changePerDecade: regressionSummary.changePerDecade,
        verdict: regressionSummary.verdictTitle
      },
      cohortSummaries,
      dataset: filteredDataset
    };

    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Regresi_Usia_Variabel_Bahasa_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter Table Search
  const tableData = useMemo(() => {
    if (!searchTableQuery.trim()) return filteredDataset;
    const q = searchTableQuery.toLowerCase();
    return filteredDataset.filter(d => 
      d.informantName.toLowerCase().includes(q) ||
      d.desa.toLowerCase().includes(q) ||
      d.kabupaten.toLowerCase().includes(q) ||
      d.bahasa.toLowerCase().includes(q) ||
      d.pekerjaan.toLowerCase().includes(q) ||
      d.cohortLabel.toLowerCase().includes(q)
    );
  }, [filteredDataset, searchTableQuery]);

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-slate-100">
      {/* 1. HEADER BANNER UTAMA */}
      <div className="bg-gradient-to-r from-teal-700 via-indigo-700 to-blue-800 rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 text-white">
                <TrendingUp className="w-5 h-5 text-teal-200" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Analisis Regresi Usia Narasumber vs Variabel Bahasa
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-teal-100 border border-white/30">
                Waktu Semu (Apparent-Time)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-100 border border-emerald-400/30">
                Grafik Tren Recharts
              </span>
            </div>
            <p className="text-xs sm:text-sm text-teal-50 max-w-3xl leading-relaxed">
              Menganalisis bagaimana pola dialek dan leksikon berubah seiring berjalannya waktu melalui perbedaan antar-generasi penutur (Apparent Time Hypothesis). Hubungan regresi linier empiris mengidentifikasi laju pergeseran dialek (<em>language shift</em>) versus stabilitas variasi kebahasaan.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 self-start lg:self-auto shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold border border-white/25 backdrop-blur-sm transition-all cursor-pointer"
              title="Ekspor data regresi ke CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>
            <button
              type="button"
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold border border-white/25 backdrop-blur-sm transition-all cursor-pointer"
              title="Ekspor data ke JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
            {onNavigateToDialekPeta && (
              <button
                type="button"
                onClick={onNavigateToDialekPeta}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-indigo-800 hover:bg-teal-50 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-700" />
                <span>Peta Dialektometri ↗</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Highlights Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-white/15 text-xs text-teal-100">
          <div>
            <span className="text-[11px] opacity-80">Populasi Informan:</span>
            <div className="text-base font-bold text-white">{filteredDataset.length} narasumber</div>
          </div>
          <div>
            <span className="text-[11px] opacity-80">Persamaan Regresi:</span>
            <div className="text-sm font-bold text-white truncate" title={`Y = ${regressionSummary.slope}X + ${regressionSummary.intercept}`}>
              Y = {regressionSummary.slope}X + {regressionSummary.intercept}
            </div>
          </div>
          <div>
            <span className="text-[11px] opacity-80">Koefisien Determinasi (R²):</span>
            <div className="text-base font-bold text-emerald-300">{(regressionSummary.rSquared * 100).toFixed(1)}%</div>
          </div>
          <div>
            <span className="text-[11px] opacity-80">Laju Per 10 Tahun Usia:</span>
            <div className={`text-base font-bold ${regressionSummary.changePerDecade >= 0 ? 'text-teal-200' : 'text-amber-200'}`}>
              {regressionSummary.changePerDecade >= 0 ? `+${regressionSummary.changePerDecade}` : regressionSummary.changePerDecade}%
            </div>
          </div>
        </div>
      </div>

      {/* 2. PANEL KONTROL & FILTER VARIABEL */}
      <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          {/* Pilihan Variabel Bahasa (Sumbu Y) */}
          <div className="space-y-1.5 flex-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Pilih Variabel Bahasa (Variabel Dependen Y):</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
              {(Object.keys(LANGUAGE_VARIABLES) as LanguageVariableKey[]).map(key => {
                const cfg = LANGUAGE_VARIABLES[key];
                const isActive = selectedVariable === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedVariable(key)}
                    className={`p-2.5 rounded-xl text-left transition-all border cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-500 shadow-2xs ring-1 ring-indigo-500/30'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-bold ${isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                        {cfg.shortLabel}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md font-mono bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {cfg.unit}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      {cfg.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filter Baris Kedua: Bahasa, Provinsi, Gender, dan Mode Visualisasi */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Bahasa */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <Globe2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500">Bahasa:</span>
              <select
                value={filterLanguage}
                onChange={e => setFilterLanguage(e.target.value)}
                className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
              >
                <option value="all">Semua Bahasa ({availableLanguages.length})</option>
                {availableLanguages.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* Filter Provinsi */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500">Provinsi:</span>
              <select
                value={filterProvince}
                onChange={e => setFilterProvince(e.target.value)}
                className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
              >
                <option value="all">Semua Provinsi ({availableProvinces.length})</option>
                {availableProvinces.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Filter Gender */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500">Gender:</span>
              <select
                value={filterGender}
                onChange={e => setFilterGender(e.target.value as any)}
                className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
              >
                <option value="all">Semua Gender</option>
                <option value="pria">Pria</option>
                <option value="wanita">Wanita</option>
              </select>
            </div>

            {/* Pewarnaan Node */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Warna Node:</span>
              <select
                value={colorGrouping}
                onChange={e => setColorGrouping(e.target.value as any)}
                className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
              >
                <option value="cohort">Generasi Kohort Usia</option>
                <option value="bahasa">Bahasa Daerah</option>
                <option value="gender">Jenis Kelamin</option>
              </select>
            </div>
          </div>

          {/* Toggle View Mode Grafik */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setChartViewMode('scatter_trend')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                chartViewMode === 'scatter_trend'
                  ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-2xs ring-1 ring-slate-200 dark:ring-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Scatter + Garis Tren</span>
            </button>
            <button
              type="button"
              onClick={() => setChartViewMode('cohort_timeline')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                chartViewMode === 'cohort_timeline'
                  ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-2xs ring-1 ring-slate-200 dark:ring-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Kurva Kohort Generasi</span>
            </button>
            <button
              type="button"
              onClick={() => setChartViewMode('multivariable_trend')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                chartViewMode === 'multivariable_trend'
                  ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-2xs ring-1 ring-slate-200 dark:ring-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Komparasi Multivariabel</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. KARTU STATISTIK REGRESI LINIER (KPI GRID) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Persamaan Regresi */}
        <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Persamaan Regresi Linier</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
              Y = {regressionSummary.slope}X {regressionSummary.intercept >= 0 ? `+ ${regressionSummary.intercept}` : `- ${Math.abs(regressionSummary.intercept)}`}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Slope (kemiringan): <strong className="text-indigo-600 dark:text-indigo-400">{regressionSummary.slope}</strong> per tahun usia
          </div>
        </div>

        {/* Card 2: Koefisien Determinasi R² */}
        <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Koefisien Determinasi (R²)</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {(regressionSummary.rSquared * 100).toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400 font-mono">r = {regressionSummary.r}</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Spearman rank ρ = <strong className="text-slate-700 dark:text-slate-300">{regressionSummary.spearmanRho}</strong>
          </div>
        </div>

        {/* Card 3: Laju Per Dekade (Per 10 Tahun) */}
        <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Laju Perubahan per Dekade</span>
            <div className={`p-1.5 rounded-lg ${
              regressionSummary.changePerDecade >= 0
                ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
            }`}>
              {regressionSummary.changePerDecade >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold ${
              regressionSummary.changePerDecade >= 0 ? 'text-teal-700 dark:text-teal-400' : 'text-amber-700 dark:text-amber-400'
            }`}>
              {regressionSummary.changePerDecade >= 0 ? `+${regressionSummary.changePerDecade}` : regressionSummary.changePerDecade}%
            </span>
            <span className="text-xs text-slate-400">/ 10 thn usia</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate" title={activeVarConfig.sociolinguisticMeaning}>
            {activeVarConfig.shortLabel}
          </div>
        </div>

        {/* Card 4: Signifikansi Statistik & Uji t */}
        <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Uji Signifikansi Regresi</span>
            <div className={`p-1.5 rounded-lg ${
              regressionSummary.isStatisticallySignificant
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              p {regressionSummary.pValueEstimated <= 0.01 ? '< 0.01' : regressionSummary.pValueEstimated <= 0.05 ? '< 0.05' : '> 0.05'}
            </span>
            <span className="text-xs text-slate-400">t = {regressionSummary.tStatistic}</span>
          </div>
          <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">
            {regressionSummary.isStatisticallySignificant ? 'Signifikan secara statistik (α = 0.05)' : 'Perlu observasi sampel tambahan'}
          </div>
        </div>
      </div>

      {/* 4. AREA VISUALISASI UTAMA RECHARTS */}
      <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 transition-colors">
        {/* Header Grafik */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {chartViewMode === 'scatter_trend'
                  ? `Grafik Tren Regresi: Usia vs ${activeVarConfig.label}`
                  : chartViewMode === 'cohort_timeline'
                  ? `Kurva Waktu Semu (Apparent-Time): Rata-rata ${activeVarConfig.shortLabel} per Kohort Generasi`
                  : 'Perbandingan Tren Multivariabel Bahasa Antar-Generasi'}
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40">
                N = {filteredDataset.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {chartViewMode === 'scatter_trend'
                ? `Titik menunjukkan informan individual; Garis putus-putus biru menunjukkan garis tren regresi linier (Y = ${regressionSummary.slope}X + ${regressionSummary.intercept}).`
                : chartViewMode === 'cohort_timeline'
                ? 'Sumbu horizontal mewakili urutan generasi dari termuda (Gen Z) ke tertua (Tetua), memperlihatkan rekonstruksi diakronis perubahan bahasa.'
                : 'Membandingkan beberapa indikator kebahasaan sekaligus untuk melihat titik persilangan atau pelemahan transmisi bahasa.'}
            </p>
          </div>

          {/* Toggle Garis Tambahan */}
          {chartViewMode === 'scatter_trend' && (
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRegressionLine}
                  onChange={e => setShowRegressionLine(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Garis Tren Regresi</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showReferenceMeans}
                  onChange={e => setShowReferenceMeans(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Rerata Komunitas</span>
              </label>
            </div>
          )}
        </div>

        {/* CONTAINER RECHARTS */}
        <div className="w-full h-[400px] sm:h-[480px]">
          {chartViewMode === 'scatter_trend' ? (
            /* MODE 1: COMPOSED CHART (SCATTER POINTS + REGRESSION LINE) */
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={composedChartData}
                margin={{ top: 20, right: 30, bottom: 30, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis
                  dataKey="xAge"
                  type="number"
                  domain={['dataMin - 5', 'dataMax + 5']}
                  name="Usia Narasumber"
                  unit=" thn"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'Usia Narasumber (Tahun)', position: 'insideBottom', offset: -18, fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis
                  dataKey="yValue"
                  type="number"
                  domain={activeVarConfig.domain}
                  name={activeVarConfig.shortLabel}
                  unit={activeVarConfig.unit}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: activeVarConfig.label, angle: -90, position: 'insideLeft', offset: -10, fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                />
                <ZAxis range={[70, 70]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as AgeRegressionDataPoint;
                      const predVal = Math.round((regressionSummary.slope * data.usia + regressionSummary.intercept) * 10) / 10;
                      return (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl shadow-lg text-xs space-y-1.5 max-w-xs">
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                            <span className="font-bold text-slate-900 dark:text-slate-100">{data.informantName}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                              {data.cohortLabel}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                            <div>Usia: <strong className="text-slate-900 dark:text-slate-100">{data.usia} thn</strong></div>
                            <div>Lahir: <strong className="text-slate-900 dark:text-slate-100">~{data.perkiraanTahunLahir}</strong></div>
                            <div>Desa: <strong className="text-slate-900 dark:text-slate-100">{data.desa}</strong></div>
                            <div>Bahasa: <strong className="text-slate-900 dark:text-slate-100">{data.bahasa}</strong></div>
                            <div>Pekerjaan: <span className="text-slate-700 dark:text-slate-300">{data.pekerjaan}</span></div>
                            <div>Pendidikan: <span className="text-slate-700 dark:text-slate-300">{data.pendidikan}</span></div>
                          </div>
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{activeVarConfig.shortLabel}:</span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                              {data[selectedVariable]} {activeVarConfig.unit}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>Prediksi Regresi:</span>
                            <span className="font-mono">{predVal} {activeVarConfig.unit}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend verticalAlign="top" height={36} />

                {/* Garis Referensi Rata-rata */}
                {showReferenceMeans && (
                  <>
                    <ReferenceLine
                      x={regressionSummary.avgAge}
                      stroke="#94a3b8"
                      strokeDasharray="4 4"
                      label={{ value: `Rerata Usia: ${regressionSummary.avgAge} th`, position: 'insideTopRight', fill: '#94a3b8', fontSize: 10 }}
                    />
                    <ReferenceLine
                      y={regressionSummary.avgValue}
                      stroke="#94a3b8"
                      strokeDasharray="4 4"
                      label={{ value: `Rerata Nilai: ${regressionSummary.avgValue}${activeVarConfig.unit}`, position: 'insideTopLeft', fill: '#94a3b8', fontSize: 10 }}
                    />
                  </>
                )}

                {/* Titik Scatter Informan */}
                <Scatter
                  name="Narasumber Lapangan"
                  data={composedChartData}
                  fill="#6366f1"
                >
                  {composedChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getNodeColor(entry)}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                    />
                  ))}
                </Scatter>

                {/* Garis Regresi Linier */}
                {showRegressionLine && (
                  <Line
                    type="linear"
                    dataKey="trendY"
                    name={`Garis Tren Regresi (Y = ${regressionSummary.slope}X + ${regressionSummary.intercept})`}
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={false}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          ) : chartViewMode === 'cohort_timeline' ? (
            /* MODE 2: AREACHART KURVA KOHORT GENERASI */
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={cohortTimelineData}
                margin={{ top: 20, right: 30, bottom: 30, left: 20 }}
              >
                <defs>
                  <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis
                  dataKey="cohort"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'Urutan Kohort Generasi (Waktu Semu Diakronis: Muda → Tua)', position: 'insideBottom', offset: -18, fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis
                  domain={activeVarConfig.domain}
                  unit={activeVarConfig.unit}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: activeVarConfig.label, angle: -90, position: 'insideLeft', offset: -10, fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} ${activeVarConfig.unit}`, name]}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs space-y-1">
                          <p className="font-bold text-slate-900 dark:text-slate-100">{d.cohort}</p>
                          <p className="text-[11px] text-slate-500">Rentang Usia: {d.range}</p>
                          <p className="text-[11px] text-slate-500">Jumlah Informan: {d.jumlahInforman} orang</p>
                          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">Rerata: {d.rataRata} {activeVarConfig.unit}</span>
                            <span className="text-slate-400 block text-[10px]">Rentang Nilai: {d.rentangBawah} – {d.rentangAtas} {activeVarConfig.unit}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                <Area
                  type="monotone"
                  dataKey="rataRata"
                  name={`Rata-rata ${activeVarConfig.shortLabel}`}
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAvg)"
                  dot={{ r: 5, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            /* MODE 3: MULTIVARIABLE TREND LINE CHART */
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={multivariableTrendData}
                margin={{ top: 20, right: 30, bottom: 30, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'Kohort Generasi (Gen Z → Milenial → Madya → Tetua)', position: 'insideBottom', offset: -18, fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis
                  domain={[0, 100]}
                  unit="%"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'Tingkat / Persentase Variabel Bahasa (%)', angle: -90, position: 'insideLeft', offset: -10, fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [`${val}%`, name]}
                />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="Retensi Arkais (%)"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Pembakuan Standar (%)"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Penggunaan Domestik (%)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Deviasi Leksikal (%)"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend Warna Node */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Legenda Kohort:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Gen Z (18–29 th)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-sky-500" />
              <span>Milenial (30–44 th)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-600" />
              <span>Generasi X (45–59 th)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-600" />
              <span>Tetua (≥ 60 th)</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400">
            Sumber Data: Instrumen Lapangan Pemetaan Bahasa ({filteredDataset.length} narasumber aktif)
          </div>
        </div>
      </div>

      {/* 5. DIAGNOSIS WAKTU SEMU (APPARENT TIME VERDICT) & KALKULATOR PREDIKSI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Kolom 1-2: Kotak Analisis Sosiodialektologi Labovian */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-50/60 to-blue-50/40 dark:from-indigo-950/20 dark:to-blue-950/10 border border-indigo-200/80 dark:border-indigo-900/40 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-indigo-950 dark:text-indigo-200">
                Interpretasi Waktu Semu (Apparent-Time Language Change Diagnosis)
              </h3>
              <p className="text-xs text-indigo-700/80 dark:text-indigo-300/80">
                Landasan Teori: William Labov (1963, 1994) – Rekonstruksi Diakronis dari Data Sinkronis Usia
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-900/30 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {regressionSummary.verdictTitle}
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {regressionSummary.verdictDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-indigo-100 dark:border-indigo-900/30 text-xs">
              <span className="font-bold text-indigo-900 dark:text-indigo-300 block mb-1">
                Laju Diakronis Antar-Generasi
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                Setiap pergantian satu generasi (~25 tahun), diperkirakan terjadi pergeseran sekitar{' '}
                <strong className="text-indigo-700 dark:text-indigo-300 font-mono">
                  {Math.abs(Math.round(regressionSummary.slope * 25 * 10) / 10)}%
                </strong>{' '}
                pada {activeVarConfig.label.toLowerCase()}.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-indigo-100 dark:border-indigo-900/30 text-xs">
              <span className="font-bold text-indigo-900 dark:text-indigo-300 block mb-1">
                Rekomendasi Kebijakan Revitalisasi
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                {regressionSummary.recommendation}
              </p>
            </div>
          </div>
        </div>

        {/* Kolom 3: Kalkulator Prediksi Nilai Variabel Berdasarkan Usia */}
        <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Kalkulator Prediksi Regresi
              </h3>
              <p className="text-[11px] text-slate-500">Estimasi nilai berdasarkan model Y = mX + c</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span>Simulasi Usia Informan:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">{calculatorAge} Tahun</span>
              </div>
              <input
                type="range"
                min={18}
                max={85}
                value={calculatorAge}
                onChange={e => setCalculatorAge(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>18 th (Gen Z)</span>
                <span>50 th (Gen X)</span>
                <span>85 th (Tetua)</span>
              </div>
            </div>

            {/* Hasil Prediksi */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                Prediksi {activeVarConfig.shortLabel}:
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                  {predictedCalculatorValue}
                </span>
                <span className="text-sm font-semibold text-slate-500">{activeVarConfig.unit}</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed pt-1 border-t border-slate-200/60 dark:border-slate-800">
                Perkiraan tahun kelahiran informan: <strong>{new Date().getFullYear() - calculatorAge}</strong>. 
                Selisih terhadap rerata komunitas: <span className="font-mono">{Math.round((predictedCalculatorValue - regressionSummary.avgValue) * 10) / 10 > 0 ? `+${Math.round((predictedCalculatorValue - regressionSummary.avgValue) * 10) / 10}` : Math.round((predictedCalculatorValue - regressionSummary.avgValue) * 10) / 10}{activeVarConfig.unit}</span>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 6. TABEL RINGKASAN KOHORT GENERASI */}
      <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Matriks Perbandingan Indikator Bahasa Lintas-Generasi (Kohort)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rerata statistik seluruh variabel kebahasaan yang dikelompokkan berdasarkan fase usia penutur.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-bold">
                <th className="py-2.5 px-3">Kohort Generasi</th>
                <th className="py-2.5 px-3">Rentang Usia</th>
                <th className="py-2.5 px-3">Informan</th>
                <th className="py-2.5 px-3 text-indigo-700 dark:text-indigo-400">Retensi Arkais (%)</th>
                <th className="py-2.5 px-3 text-rose-600 dark:text-rose-400">Pembakuan Standar (%)</th>
                <th className="py-2.5 px-3 text-amber-600 dark:text-amber-400">Deviasi Leksikal (%)</th>
                <th className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400">Penggunaan Domestik (%)</th>
                <th className="py-2.5 px-3 text-purple-600 dark:text-purple-400">Inovasi Bentuk Baru</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              {cohortSummaries.map(c => (
                <tr key={c.cohortKey} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COHORT_COLORS[c.cohortKey] }}
                    />
                    <span>{c.cohortLabel}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px]">{c.ageRange}</td>
                  <td className="py-2.5 px-3 font-semibold">{c.count} orang</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{c.avgRetensiArkais}%</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-rose-600 dark:text-rose-400">{c.avgPembakuanStandar}%</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-600 dark:text-amber-400">{c.avgVariasiLeksikal}%</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{c.avgRanahDomestik}%</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-purple-600 dark:text-purple-400">{c.avgInovasiLokal} kata</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. TABEL DETAIL NARASUMBER INDIVIDUAL */}
      <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TableProperties className="w-4 h-4 text-indigo-600" />
              <span>Data Narasumber & Skor Variabel Bahasa Lapangan</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar observasi lengkap informan dengan skor dialektologi empiris ({tableData.length} data ditampilkan).
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTableQuery}
              onChange={e => setSearchTableQuery(e.target.value)}
              placeholder="Cari narasumber, desa, bahasa..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500 w-52 sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-96 no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-10">
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                <th className="py-2.5 px-3">Nama Informan</th>
                <th className="py-2.5 px-3">Usia & Kohort</th>
                <th className="py-2.5 px-3">Desa / Titik Survei</th>
                <th className="py-2.5 px-3">Bahasa</th>
                <th className="py-2.5 px-3">Pekerjaan</th>
                <th className="py-2.5 px-3 text-right">Retensi Arkais</th>
                <th className="py-2.5 px-3 text-right">Pembakuan</th>
                <th className="py-2.5 px-3 text-right">Deviasi Leksikal</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              {tableData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Tidak ada narasumber yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                tableData.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                      {item.informantName}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{item.usia} th</span>
                      <span className="text-[10px] text-slate-400 block">{item.cohortLabel}</span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300">
                      {item.desa}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.bahasa}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-500">
                      {item.pekerjaan}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {item.retensiArkaisPct}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                      {item.pembakuanStandarPct}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                      {item.variasiLeksikalPct}%
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {onSelectSurvey && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectSurvey(item.surveyId);
                            if (onNavigateToSection) onNavigateToSection(item.surveyId, 13);
                          }}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-semibold text-[11px] inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Buka</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
