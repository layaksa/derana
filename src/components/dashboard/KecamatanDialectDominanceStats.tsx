import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  BarChart3, 
  PieChart as PieIcon, 
  Layers, 
  Filter, 
  Search, 
  SlidersHorizontal, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Compass, 
  Sparkles, 
  TrendingUp, 
  GraduationCap, 
  FileText, 
  ChevronRight, 
  Globe2, 
  Eye, 
  RotateCcw,
  TableProperties
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { SurveyRecord } from '../../types/linguistic';

export interface KecamatanDialectDominanceStatsProps {
  surveys: SurveyRecord[];
  activeSurveyId?: string | null;
  onSelectSurvey?: (id: string) => void;
  onNavigateToDialekPeta?: () => void;
  onNavigateToSection?: (surveyId: string, sectionIndex: number) => void;
  onSwitchToEditor?: () => void;
  onNavigateToCorrelation?: () => void;
  onNavigateToAgeRegression?: () => void;
}

interface KecamatanItem {
  kecamatanName: string;
  kabupatenName: string;
  provinsiName: string;
  totalTP: number;
  totalInformants: number;
  totalSwadeshFilledAvg: number;
  dialectCounts: Record<string, number>;
  dominantDialect: string;
  dominantCount: number;
  dominancePct: number;
  isMonodialect: boolean;
  isTransitionZone: boolean;
  dialectsSummary: { name: string; count: number; pct: number }[];
  surveyIds: string[];
  desaList: string[];
}

const DIALECT_PALETTE = [
  '#4f46e5', // indigo
  '#0d9488', // teal
  '#0284c7', // sky
  '#f59e0b', // amber
  '#10b981', // emerald
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f97316', // orange
  '#64748b'  // slate
];

export const KecamatanDialectDominanceStats: React.FC<KecamatanDialectDominanceStatsProps> = ({
  surveys,
  activeSurveyId,
  onSelectSurvey,
  onNavigateToDialekPeta,
  onNavigateToSection,
  onSwitchToEditor,
  onNavigateToCorrelation,
  onNavigateToAgeRegression
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState<string>('all');
  const [selectedKabupatenFilter, setSelectedKabupatenFilter] = useState<string>('all');
  const [dominanceLevelFilter, setDominanceLevelFilter] = useState<'all' | 'mono' | 'strong' | 'transition'>('all');
  const [sortBy, setSortBy] = useState<'tp_desc' | 'pct_desc' | 'name_asc'>('tp_desc');
  const [activeTab, setActiveTab] = useState<'cards' | 'charts' | 'table'>('cards');
  const [selectedKecamatanDetail, setSelectedKecamatanDetail] = useState<string | null>(null);

  // Compute Kecamatan Grouping and Dominance
  const kecamatanData = useMemo(() => {
    const map = new Map<string, {
      kecamatanName: string;
      kabupatenName: string;
      provinsiName: string;
      surveys: SurveyRecord[];
      dialectCounts: Record<string, number>;
      desaSet: Set<string>;
      informantsCount: number;
      swadeshFilledSum: number;
    }>();

    surveys.forEach(s => {
      const prov = (s.provinsi || s.data?.titikPengamatan?.provinsi || 'Jawa Barat').trim() || 'Provinsi Lainnya';
      const kab = (s.kabupatenKota || s.data?.titikPengamatan?.kabupatenKota || 'Kabupaten').trim();
      const rawKec = (s.kecamatan || s.data?.titikPengamatan?.kecamatan || '').trim();
      const kec = rawKec || 'Kecamatan Terpadu';
      const key = `${prov}__${kab}__${kec}`;

      const desa = s.desa || s.data?.titikPengamatan?.namaDesa || s.title;
      const dialect = (
        s.bahasa || 
        s.data?.titikPengamatan?.namaLainBahasa || 
        s.data?.titikPengamatan?.bahasaDigunakan || 
        'Sunda Priangan'
      ).trim();

      const swadeshFilled = (s.data?.kosakataLengkap?.swadeshList || []).filter(w => Boolean(w.bentukLokal?.trim())).length;
      const infCount = (s.data?.narasumberList || []).filter(n => Boolean(n.nama?.trim())).length;

      if (!map.has(key)) {
        map.set(key, {
          kecamatanName: kec,
          kabupatenName: kab,
          provinsiName: prov,
          surveys: [],
          dialectCounts: {},
          desaSet: new Set(),
          informantsCount: 0,
          swadeshFilledSum: 0
        });
      }

      const entry = map.get(key)!;
      entry.surveys.push(s);
      entry.desaSet.add(desa);
      entry.informantsCount += infCount;
      entry.swadeshFilledSum += swadeshFilled;
      entry.dialectCounts[dialect] = (entry.dialectCounts[dialect] || 0) + 1;
    });

    const items: KecamatanItem[] = Array.from(map.values()).map(e => {
      const totalTP = e.surveys.length;
      const dialectEntries = Object.entries(e.dialectCounts).sort((a, b) => b[1] - a[1]);
      
      const dominantDialect = dialectEntries[0]?.[0] || 'Dialek Lokal';
      const dominantCount = dialectEntries[0]?.[1] || 0;
      const dominancePct = totalTP > 0 ? Math.round((dominantCount / totalTP) * 100) : 0;
      const isMonodialect = dominancePct === 100;
      const isTransitionZone = dominancePct < 70 && dialectEntries.length > 1;

      const dialectsSummary = dialectEntries.map(([name, count]) => ({
        name,
        count,
        pct: totalTP > 0 ? Math.round((count / totalTP) * 100) : 0
      }));

      const avgSwadesh = totalTP > 0 ? Math.round(e.swadeshFilledSum / totalTP) : 0;

      return {
        kecamatanName: e.kecamatanName,
        kabupatenName: e.kabupatenName,
        provinsiName: e.provinsiName,
        totalTP,
        totalInformants: e.informantsCount,
        totalSwadeshFilledAvg: avgSwadesh,
        dialectCounts: e.dialectCounts,
        dominantDialect,
        dominantCount,
        dominancePct,
        isMonodialect,
        isTransitionZone,
        dialectsSummary,
        surveyIds: e.surveys.map(s => s.id),
        desaList: Array.from(e.desaSet)
      };
    });

    return items;
  }, [surveys]);

  // Overall KPI Statistics
  const stats = useMemo(() => {
    const totalKecamatan = kecamatanData.length;
    let monodialectCount = 0;
    let strongDominanceCount = 0;
    let transitionZoneCount = 0;
    let sumTP = 0;
    const allProvinces = new Set<string>();
    const allKabupatens = new Set<string>();
    const dialectAggregates: Record<string, number> = {};

    kecamatanData.forEach(k => {
      sumTP += k.totalTP;
      allProvinces.add(k.provinsiName);
      allKabupatens.add(k.kabupatenName);

      if (k.isMonodialect) {
        monodialectCount++;
      } else if (k.dominancePct >= 70) {
        strongDominanceCount++;
      } else {
        transitionZoneCount++;
      }

      dialectAggregates[k.dominantDialect] = (dialectAggregates[k.dominantDialect] || 0) + 1;
    });

    const avgTPPerKecamatan = totalKecamatan > 0 ? (sumTP / totalKecamatan).toFixed(1) : '0';

    return {
      totalKecamatan,
      monodialectCount,
      strongDominanceCount,
      transitionZoneCount,
      avgTPPerKecamatan,
      provincesList: Array.from(allProvinces),
      kabupatensList: Array.from(allKabupatens),
      dialectAggregates
    };
  }, [kecamatanData]);

  // Filtered and Sorted Kecamatan List
  const filteredKecamatans = useMemo(() => {
    return kecamatanData.filter(item => {
      if (selectedProvinceFilter !== 'all' && item.provinsiName !== selectedProvinceFilter) {
        return false;
      }
      if (selectedKabupatenFilter !== 'all' && item.kabupatenName !== selectedKabupatenFilter) {
        return false;
      }
      if (dominanceLevelFilter === 'mono' && !item.isMonodialect) {
        return false;
      }
      if (dominanceLevelFilter === 'strong' && (item.isMonodialect || item.dominancePct < 70)) {
        return false;
      }
      if (dominanceLevelFilter === 'transition' && !item.isTransitionZone) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.kecamatanName.toLowerCase().includes(q);
        const matchKab = item.kabupatenName.toLowerCase().includes(q);
        const matchProv = item.provinsiName.toLowerCase().includes(q);
        const matchDialect = item.dominantDialect.toLowerCase().includes(q) || 
          item.dialectsSummary.some(d => d.name.toLowerCase().includes(q));
        const matchDesa = item.desaList.some(d => d.toLowerCase().includes(q));
        return matchName || matchKab || matchProv || matchDialect || matchDesa;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'tp_desc') return b.totalTP - a.totalTP;
      if (sortBy === 'pct_desc') return b.dominancePct - a.dominancePct;
      if (sortBy === 'name_asc') return a.kecamatanName.localeCompare(b.kecamatanName);
      return 0;
    });
  }, [kecamatanData, selectedProvinceFilter, selectedKabupatenFilter, dominanceLevelFilter, searchQuery, sortBy]);

  // Chart Data: Top Kecamatan by Observation Points
  const topKecamatanChartData = useMemo(() => {
    return [...kecamatanData]
      .sort((a, b) => b.totalTP - a.totalTP)
      .slice(0, 10)
      .map(k => ({
        name: k.kecamatanName,
        kab: k.kabupatenName,
        totalTP: k.totalTP,
        dominansiPct: k.dominancePct,
        dialek: k.dominantDialect
      }));
  }, [kecamatanData]);

  // Chart Data: Dominant Dialect Distribution Pie
  const dominantDialectPieData = useMemo(() => {
    const list = Object.entries(stats.dialectAggregates).map(([name, count], idx) => ({
      name,
      value: count,
      color: DIALECT_PALETTE[idx % DIALECT_PALETTE.length]
    }));
    return list.sort((a, b) => b.value - a.value);
  }, [stats.dialectAggregates]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-6 transition-all">
      
      {/* 1. HEADER SECTION (Spacious Bento Header) */}
      <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-600 to-blue-600 text-white shadow-xs shrink-0 mt-0.5">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Dominasi Dialek per Kecamatan & Sebaran Titik Pengamatan
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                  Kalkulasi Persentase Dominansi
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {stats.totalKecamatan} Kecamatan Terdata
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-4xl leading-relaxed">
                Pemetaan tingkat dominasi dialek lokal per unit kecamatan administratif, mengidentifikasi daerah monodialek homogen serta zona transisi variasi kebahasaan.
              </p>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex items-center gap-2 self-start lg:self-center flex-wrap">
            {onNavigateToDialekPeta && (
              <button
                type="button"
                onClick={onNavigateToDialekPeta}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-2xs transition-all cursor-pointer"
                title="Buka Peta Geolinguistik Dialektometri"
              >
                <Compass className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span>Peta Spasial GIS</span>
              </button>
            )}
            {onNavigateToCorrelation && (
              <button
                type="button"
                onClick={onNavigateToCorrelation}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 shadow-2xs transition-all cursor-pointer"
                title="Buka Korelasi Pendidikan vs Variasi Dialek"
              >
                <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Korelasi Pendidikan</span>
              </button>
            )}
            {onNavigateToAgeRegression && (
              <button
                type="button"
                onClick={onNavigateToAgeRegression}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 font-bold text-xs border border-teal-200 dark:border-teal-800 shadow-2xs transition-all cursor-pointer"
                title="Buka Analisis Regresi Usia vs Dialek"
              >
                <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>Regresi Usia</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. FOUR KPI BENTO METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Total Kecamatan */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-50/80 via-sky-50/50 to-white dark:from-cyan-950/30 dark:via-sky-950/20 dark:to-slate-900 border border-cyan-100 dark:border-cyan-900/60 shadow-2xs">
          <div className="flex items-center justify-between text-cyan-700 dark:text-cyan-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Kecamatan</span>
            <Building2 className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-cyan-950 dark:text-cyan-100 font-mono">
              {stats.totalKecamatan}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">kecamatan</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Tersebar di {stats.kabupatensList.length} kabupaten & {stats.provincesList.length} provinsi
          </p>
        </div>

        {/* Card 2: Monodialek Homogen */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-white dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-slate-900 border border-emerald-100 dark:border-emerald-900/60 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Monodialek (100%)</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-100 font-mono">
              {stats.monodialectCount}
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
              ({stats.totalKecamatan > 0 ? Math.round((stats.monodialectCount / stats.totalKecamatan) * 100) : 0}%)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Seluruh titik pengamatan menggunakan satu dialek seragam
          </p>
        </div>

        {/* Card 3: Zona Kontak / Transisi */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-white dark:from-amber-950/30 dark:via-orange-950/20 dark:to-slate-900 border border-amber-100 dark:border-amber-900/60 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Zona Kontak Dialek</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-950 dark:text-amber-100 font-mono">
              {stats.transitionZoneCount}
            </span>
            <span className="text-xs text-amber-700 dark:text-amber-400 font-bold">
              (&lt; 70% Dominansi)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Kecamatan heterogen dengan koeksistensi multipel varian dialek
          </p>
        </div>

        {/* Card 4: Rerata Titik Pengamatan */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-white dark:from-indigo-950/30 dark:via-blue-950/20 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/60 shadow-2xs">
          <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Kepadatan TP / Kec</span>
            <Layers className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-950 dark:text-indigo-100 font-mono">
              {stats.avgTPPerKecamatan}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">TP / Kecamatan</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Rata-rata desa observasi kebahasaan per kecamatan
          </p>
        </div>
      </div>

      {/* 3. BENTO CONTROL TOOLBAR & VIEW MODE SWITCHER */}
      <div className="bg-slate-50/90 dark:bg-slate-800/40 p-3 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kecamatan, kabupaten, desa, atau varian dialek..."
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Provinsi */}
            <select
              value={selectedProvinceFilter}
              onChange={(e) => {
                setSelectedProvinceFilter(e.target.value);
                setSelectedKabupatenFilter('all');
              }}
              className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer focus:outline-hidden"
              aria-label="Filter Provinsi"
            >
              <option value="all">Semua Provinsi</option>
              {stats.provincesList.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            {/* Filter Tingkat Dominansi */}
            <select
              value={dominanceLevelFilter}
              onChange={(e) => setDominanceLevelFilter(e.target.value as any)}
              className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer focus:outline-hidden"
              aria-label="Filter Tingkat Dominansi"
            >
              <option value="all">Semua Dominansi</option>
              <option value="mono">Monodialek (100%)</option>
              <option value="strong">Dominasi Kuat (70-99%)</option>
              <option value="transition">Zona Kontak (&lt; 70%)</option>
            </select>

            {/* Sort Mode */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer focus:outline-hidden"
              aria-label="Urutkan Data"
            >
              <option value="tp_desc">Urut: Titik Pengamatan Terbanyak</option>
              <option value="pct_desc">Urut: % Dominansi Tertinggi</option>
              <option value="name_asc">Urut: Nama Kecamatan (A-Z)</option>
            </select>

            {/* View Mode Toggle Buttons */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'cards'
                    ? 'bg-cyan-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Kartu Ringkasan</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('charts')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'charts'
                    ? 'bg-cyan-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Grafik</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'table'
                    ? 'bg-cyan-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <TableProperties className="w-3.5 h-3.5" />
                <span>Tabel</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MAIN CONTENT AREA */}
      {activeTab === 'charts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Top Kecamatan by Points */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-600" />
                  <span>10 Kecamatan Teratas Berdasarkan Jumlah Titik Pengamatan</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Memperlihatkan kepadatan sampel desa dan persentase dominasi dialek
                </p>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topKecamatanChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" angle={-25} textAnchor="end" height={50} tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, fontSize: 12 }}
                    formatter={(value: any, name: any) => [
                      name === 'totalTP' ? `${value} Desa TP` : `${value}%`,
                      name === 'totalTP' ? 'Titik Pengamatan' : 'Dominasi'
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="totalTP" name="Total TP" fill="#0891b2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dominant Dialect Pie */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-indigo-600" />
                  <span>Komposisi Dialek Dominan Antarkecamatan</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Proporsi dialek yang mendominasi unit wilayah kecamatan
                </p>
              </div>
            </div>
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dominantDialectPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={45}
                    paddingAngle={3}
                    label={(entry) => `${entry.name} (${entry.value})`}
                  >
                    {dominantDialectPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value} Kecamatan`, 'Dominan di']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'cards' && (
        <div>
          {filteredKecamatans.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <Building2 className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Tidak ada kecamatan yang sesuai dengan kriteria filter
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedProvinceFilter('all');
                  setSelectedKabupatenFilter('all');
                  setDominanceLevelFilter('all');
                }}
                className="mt-3 text-xs font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredKecamatans.map((kec) => (
                <div
                  key={`${kec.provinsiName}__${kec.kabupatenName}__${kec.kecamatanName}`}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Name & Dominance Badge */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                            {kec.kabupatenName}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                          Kec. {kec.kecamatanName}
                        </h4>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Prov. {kec.provinsiName}
                        </div>
                      </div>

                      <span className={`px-2 py-1 rounded-xl text-xs font-extrabold font-mono shrink-0 shadow-2xs border ${
                        kec.isMonodialect
                          ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : kec.dominancePct >= 70
                          ? 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
                          : 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      }`}>
                        {kec.dominancePct}%
                      </span>
                    </div>

                    {/* Dominant Dialect Highlight */}
                    <div className="my-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                        Dialek Dominan
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                        <span>{kec.dominantDialect}</span>
                        <span className="text-xs font-mono text-cyan-700 dark:text-cyan-400">
                          {kec.dominantCount} dari {kec.totalTP} Desa
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            kec.isMonodialect ? 'bg-emerald-500' : kec.dominancePct >= 70 ? 'bg-cyan-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${kec.dominancePct}%` }}
                        />
                      </div>
                    </div>

                    {/* Dialect Breakdown breakdown if multiple */}
                    {kec.dialectsSummary.length > 1 && (
                      <div className="space-y-1.5 mb-3">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Distribusi Varian Lain:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {kec.dialectsSummary.slice(1).map(d => (
                            <span 
                              key={d.name}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                            >
                              {d.name}: {d.count} ({d.pct}%)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Desa List preview */}
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Desa:</span> {kec.desaList.join(', ')}
                    </div>
                  </div>

                  {/* Bottom Stats & Actions */}
                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      <span>{kec.totalTP} Desa TP</span>
                      <span>•</span>
                      <span>{kec.totalInformants} Informan</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {onSelectSurvey && kec.surveyIds[0] && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectSurvey(kec.surveyIds[0]);
                            if (onSwitchToEditor) onSwitchToEditor();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Buka Kuesioner
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'table' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Kecamatan</th>
                <th className="py-3 px-4">Kabupaten & Provinsi</th>
                <th className="py-3 px-4">Jumlah TP</th>
                <th className="py-3 px-4">Dialek Dominan</th>
                <th className="py-3 px-4">Persentase Dominansi</th>
                <th className="py-3 px-4">Status Wilayah</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredKecamatans.map((kec) => (
                <tr key={`${kec.provinsiName}__${kec.kabupatenName}__${kec.kecamatanName}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    {kec.kecamatanName}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {kec.kabupatenName}, {kec.provinsiName}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold">
                    {kec.totalTP} Desa
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {kec.dominantDialect}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold">{kec.dominancePct}%</span>
                      <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            kec.isMonodialect ? 'bg-emerald-500' : kec.dominancePct >= 70 ? 'bg-cyan-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${kec.dominancePct}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      kec.isMonodialect
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : kec.dominancePct >= 70
                        ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {kec.isMonodialect ? 'Monodialek (100%)' : kec.dominancePct >= 70 ? 'Dominasi Kuat' : 'Zona Kontak'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {onSelectSurvey && kec.surveyIds[0] && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectSurvey(kec.surveyIds[0]);
                          if (onSwitchToEditor) onSwitchToEditor();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold cursor-pointer transition-colors"
                      >
                        Buka
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
