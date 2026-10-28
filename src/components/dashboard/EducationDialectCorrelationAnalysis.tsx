import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  Cell,
  ReferenceLine
} from 'recharts';
import { 
  GraduationCap, 
  TrendingUp, 
  TrendingDown,
  Activity, 
  Scale, 
  Users, 
  MapPin, 
  Filter, 
  Search, 
  Download, 
  BookOpen, 
  Info, 
  Sparkles, 
  SlidersHorizontal,
  TableProperties,
  ArrowRight,
  Compass,
  CheckCircle2,
  Calendar,
  Briefcase
} from 'lucide-react';
import { SurveyRecord } from '../../types/linguistic';
import { 
  extractCorrelationDataset, 
  calculateCorrelation, 
  CorrelationDataPoint, 
  SurveyAggregatePoint,
  ORDINAL_EDUCATION_LABELS
} from '../../utils/sociolinguisticCorrelation';
import { categorizeAge } from './NarasumberStatsSummary';

export interface EducationDialectCorrelationAnalysisProps {
  surveys: SurveyRecord[];
  activeSurveyId?: string | null;
  onSelectSurvey?: (id: string) => void;
  onNavigateToSection?: (surveyId: string, sectionIndex: number) => void;
  onSwitchToEditor?: () => void;
  onNavigateToDialekPeta?: () => void;
  onNavigateToAgeRegression?: () => void;
}

type XMetric = 'pendidikanYears' | 'pendidikanOrdinal';
type YMetric = 'variasiLeksikalPct' | 'dialektometriGuiterPct' | 'retensiDialekLokalPct' | 'inovasiLokalCount';
type AggregationMode = 'individual' | 'aggregate';
type ColorGrouping = 'bahasa' | 'usia' | 'pendidikan' | 'gender';

const Y_METRIC_CONFIG: Record<YMetric, { label: string; shortLabel: string; unit: string; domain: [number, number]; desc: string }> = {
  variasiLeksikalPct: {
    label: 'Deviasi Leksikal dari Bahasa Baku (%)',
    shortLabel: 'Deviasi Leksikal Baku',
    unit: '%',
    domain: [0, 100],
    desc: 'Persentase kosakata Swadesh yang berbeda dari varian bahasa standar/baku. Menunjukkan tingkat divergensi leksikal lokal.'
  },
  dialektometriGuiterPct: {
    label: 'Perbedaan Dialektometri Guiter (d%)',
    shortLabel: 'Perbedaan Guiter (d%)',
    unit: '%',
    domain: [0, 100],
    desc: 'Formula dialektometri d = (s/n)*100% rata-rata terhadap titik-titik pembanding spasial sekitarnya.'
  },
  retensiDialekLokalPct: {
    label: 'Indeks Pemertahanan Dialek Lokal (%)',
    shortLabel: 'Retensi Dialek Lokal',
    unit: '%',
    domain: [0, 100],
    desc: 'Tingkat kelekatan penutur terhadap dialek lokal setempat berdasarkan ranah penggunaan bahasa & mobilitas.'
  },
  inovasiLokalCount: {
    label: 'Jumlah Kosakata Varian Lokal Khas (Leksikon)',
    shortLabel: 'Jumlah Varian Khas',
    unit: ' kata',
    domain: [0, 60],
    desc: 'Kuantitas bentuk varian kata lokal dan transkripsi fonetis khas yang terdokumentasi pada titik survei.'
  }
};

const COLOR_PALETTES = {
  bahasa: {
    'Bahasa Sunda': '#6366f1',
    'Bahasa Sunda Dialek Selatan': '#8b5cf6',
    'Bahasa Sunda Pesisir Pameungpeuk': '#06b6d4',
    'Bahasa Sunda-Jawa Campuran (Banyumasan)': '#f59e0b',
    'Bahasa Jawa': '#ec4899',
    'Bahasa Melayu Betawi': '#10b981',
    'Bahasa Cirebon': '#3b82f6',
    'Lainnya': '#64748b'
  },
  usia: {
    'under_30': '#06b6d4',
    '30_44': '#3b82f6',
    '45_59': '#6366f1',
    '60_plus': '#ec4899'
  },
  gender: {
    'pria': '#3b82f6',
    'wanita': '#ec4899',
    'Laki-laki': '#3b82f6',
    'Perempuan': '#ec4899'
  },
  pendidikan: {
    'Tidak Sekolah / Tidak Tamat SD': '#94a3b8',
    'SD / MI Sederajat': '#f59e0b',
    'SMP / MTs Sederajat': '#3b82f6',
    'SMA / SMK Sederajat': '#6366f1',
    'Diploma (D1–D4)': '#8b5cf6',
    'Sarjana (S1)': '#10b981',
    'Pascasarjana (S2/S3)': '#06b6d4',
    'Lainnya / Setara': '#ec4899',
    'Belum Terdata': '#cbd5e1'
  }
};

export const EducationDialectCorrelationAnalysis: React.FC<EducationDialectCorrelationAnalysisProps> = ({
  surveys,
  activeSurveyId,
  onSelectSurvey,
  onNavigateToSection,
  onSwitchToEditor,
  onNavigateToDialekPeta,
  onNavigateToAgeRegression
}) => {
  // Config state
  const [xMetric, setXMetric] = useState<XMetric>('pendidikanYears');
  const [yMetric, setYMetric] = useState<YMetric>('variasiLeksikalPct');
  const [aggregationMode, setAggregationMode] = useState<AggregationMode>('individual');
  const [colorGrouping, setColorGrouping] = useState<ColorGrouping>('pendidikan');
  const [showTrendline, setShowTrendline] = useState<boolean>(true);
  const [showReferenceLines, setShowReferenceLines] = useState<boolean>(true);
  
  // Filter state
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedKabupaten, setSelectedKabupaten] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [searchTableQuery, setSearchTableQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'chart' | 'tabel' | 'teori'>('chart');

  // Extract raw dataset
  const { individualPoints, aggregatePoints } = useMemo(() => {
    return extractCorrelationDataset(surveys);
  }, [surveys]);

  // Available filters
  const filterOptions = useMemo(() => {
    const languages = Array.from(new Set(individualPoints.map(p => p.bahasa))).filter(Boolean);
    const kabupatens = Array.from(new Set(individualPoints.map(p => p.kabupaten))).filter(Boolean);
    return { languages, kabupatens };
  }, [individualPoints]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    if (aggregationMode === 'individual') {
      return individualPoints.filter(p => {
        if (selectedLanguage !== 'all' && p.bahasa !== selectedLanguage) return false;
        if (selectedKabupaten !== 'all' && p.kabupaten !== selectedKabupaten) return false;
        if (selectedGender !== 'all') {
          const g = p.gender.toLowerCase();
          if (selectedGender === 'pria' && !g.includes('pria') && !g.includes('laki')) return false;
          if (selectedGender === 'wanita' && !g.includes('wanita') && !g.includes('perempuan')) return false;
        }
        return true;
      });
    } else {
      return aggregatePoints.filter(p => {
        if (selectedLanguage !== 'all' && p.bahasa !== selectedLanguage) return false;
        if (selectedKabupaten !== 'all' && p.kabupaten !== selectedKabupaten) return false;
        return true;
      });
    }
  }, [aggregationMode, individualPoints, aggregatePoints, selectedLanguage, selectedKabupaten, selectedGender]);

  // Compute correlation statistics
  const correlationStats = useMemo(() => {
    const xValues: number[] = [];
    const yValues: number[] = [];

    filteredData.forEach(p => {
      const x = aggregationMode === 'individual'
        ? (xMetric === 'pendidikanYears' ? (p as CorrelationDataPoint).pendidikanYears : (p as CorrelationDataPoint).pendidikanOrdinal)
        : (xMetric === 'pendidikanYears' ? (p as SurveyAggregatePoint).avgPendidikanYears : (p as SurveyAggregatePoint).avgPendidikanOrdinal);
      
      const y = (p as any)[yMetric] as number;

      if (typeof x === 'number' && !isNaN(x) && typeof y === 'number' && !isNaN(y)) {
        xValues.push(x);
        yValues.push(y);
      }
    });

    return calculateCorrelation(xValues, yValues);
  }, [filteredData, aggregationMode, xMetric, yMetric]);

  // Prepare scatter plot points & linear trendline
  const { chartData, trendlineData } = useMemo(() => {
    const points = filteredData.map(p => {
      const isIndiv = aggregationMode === 'individual';
      const indiv = p as CorrelationDataPoint;
      const agg = p as SurveyAggregatePoint;

      const xVal = isIndiv 
        ? (xMetric === 'pendidikanYears' ? indiv.pendidikanYears : indiv.pendidikanOrdinal)
        : (xMetric === 'pendidikanYears' ? agg.avgPendidikanYears : agg.avgPendidikanOrdinal);
      
      const yVal = (p as any)[yMetric] as number;

      // Color determining
      let fillColor = '#6366f1';
      if (colorGrouping === 'pendidikan' && isIndiv) {
        fillColor = (COLOR_PALETTES.pendidikan as any)[indiv.pendidikanKategori] || '#6366f1';
      } else if (colorGrouping === 'bahasa') {
        fillColor = (COLOR_PALETTES.bahasa as any)[p.bahasa] || '#8b5cf6';
      } else if (colorGrouping === 'usia' && isIndiv) {
        const ageCat = categorizeAge(indiv.usia);
        fillColor = (COLOR_PALETTES.usia as any)[ageCat.key] || '#06b6d4';
      } else if (colorGrouping === 'gender' && isIndiv) {
        const isMale = indiv.gender.toLowerCase().includes('pria') || indiv.gender.toLowerCase().includes('laki');
        fillColor = isMale ? COLOR_PALETTES.gender['pria'] : COLOR_PALETTES.gender['wanita'];
      }

      return {
        ...p,
        x: xVal,
        y: yVal,
        fillColor,
        displayName: isIndiv ? indiv.informantName : indiv.desa,
        eduLabel: isIndiv ? indiv.pendidikanKategori : `Rata-rata: ${agg.avgPendidikanYears} Thn`
      };
    });

    // Compute 2 points for linear regression line
    const xMin = xMetric === 'pendidikanYears' ? 0 : 1;
    const xMax = xMetric === 'pendidikanYears' ? 20 : 7;
    const trendline = showTrendline && correlationStats.n >= 2 ? [
      {
        x: xMin,
        y: Math.min(100, Math.max(0, Math.round((correlationStats.slope * xMin + correlationStats.intercept) * 10) / 10))
      },
      {
        x: xMax,
        y: Math.min(100, Math.max(0, Math.round((correlationStats.slope * xMax + correlationStats.intercept) * 10) / 10))
      }
    ] : [];

    return { chartData: points, trendlineData: trendline };
  }, [filteredData, aggregationMode, xMetric, yMetric, colorGrouping, showTrendline, correlationStats]);

  // Table filtering & searching
  const filteredTableData = useMemo(() => {
    if (!searchTableQuery.trim()) return chartData;
    const q = searchTableQuery.toLowerCase();
    return chartData.filter(d => {
      const name = (d.displayName || '').toLowerCase();
      const desa = (d.desa || '').toLowerCase();
      const kab = (d.kabupaten || '').toLowerCase();
      const lang = (d.bahasa || '').toLowerCase();
      const edu = (d.eduLabel || '').toLowerCase();
      return name.includes(q) || desa.includes(q) || kab.includes(q) || lang.includes(q) || edu.includes(q);
    });
  }, [chartData, searchTableQuery]);

  // Export CSV function
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Nama Narasumber / Titik',
      'Desa',
      'Kecamatan',
      'Kabupaten',
      'Provinsi',
      'Bahasa Daerah',
      'Pendidikan Terakhir',
      'Tahun Pendidikan Formal',
      'Skala Ordinal (1-7)',
      'Usia',
      'Jenis Kelamin',
      'Pekerjaan',
      'Variasi Leksikal (%)',
      'Dialektometri Guiter (d%)',
      'Retensi Dialek Lokal (%)',
      'Inovasi Lokal (Count)',
      'Koordinat Lintang',
      'Koordinat Bujur'
    ];

    const rows = filteredData.map(p => {
      const isIndiv = aggregationMode === 'individual';
      const indiv = p as CorrelationDataPoint;
      const agg = p as SurveyAggregatePoint;
      return [
        p.id,
        `"${isIndiv ? indiv.informantName : indiv.desa}"`,
        `"${p.desa}"`,
        `"${p.kecamatan}"`,
        `"${p.kabupaten}"`,
        `"${p.provinsi}"`,
        `"${p.bahasa}"`,
        `"${isIndiv ? indiv.pendidikanKategori : 'Agregat Titik'}"`,
        isIndiv ? indiv.pendidikanYears : agg.avgPendidikanYears,
        isIndiv ? indiv.pendidikanOrdinal : agg.avgPendidikanOrdinal,
        isIndiv ? indiv.usia : '-',
        isIndiv ? indiv.gender : '-',
        `"${isIndiv ? indiv.pekerjaan : '-'}"`,
        p.variasiLeksikalPct,
        p.dialektometriGuiterPct,
        p.retensiDialekLokalPct,
        p.inovasiLokalCount,
        p.lat,
        p.lng
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `korelasi_pendidikan_variasi_dialek_${aggregationMode}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Custom Scatter Tooltip
  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    const isIndiv = aggregationMode === 'individual';
    const indiv = data as CorrelationDataPoint;

    return (
      <div className="bg-slate-900/95 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 max-w-xs text-xs backdrop-blur-md z-50">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
          <div className="font-bold text-slate-100 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
            <span className="truncate">{data.displayName}</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/80 text-indigo-300 font-semibold border border-indigo-700/50">
            {data.bahasa}
          </span>
        </div>

        <div className="space-y-1.5 text-[11px] text-slate-300">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Pendidikan:</span>
            <span className="font-semibold text-white">{data.eduLabel} ({data.x} {xMetric === 'pendidikanYears' ? 'thn' : 'skala'})</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">{Y_METRIC_CONFIG[yMetric].shortLabel}:</span>
            <span className="font-bold text-amber-300">{data.y}{Y_METRIC_CONFIG[yMetric].unit}</span>
          </div>

          {isIndiv && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Usia & Gender:</span>
                <span>{indiv.usia} Thn • {indiv.gender}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Pekerjaan:</span>
                <span className="truncate max-w-[150px]">{indiv.pekerjaan}</span>
              </div>
            </>
          )}

          <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" />
              {data.desa}, {data.kabupaten}
            </span>
          </div>
        </div>

        {onSelectSurvey && data.surveyId && (
          <button
            type="button"
            onClick={() => onSelectSurvey(data.surveyId)}
            className="w-full mt-2.5 pt-1.5 border-t border-slate-800 text-[11px] font-semibold text-indigo-300 hover:text-indigo-200 flex items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            <span>Buka Lembar Survei</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-800/60">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Sosiolinguistik & Dialektologi Sosial (Labovian Model)</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <GraduationCap className="w-8 h-8 text-indigo-400" />
                <span>Analisis Korelasi Pendidikan vs Variasi Dialek</span>
              </h2>
              <p className="text-sm sm:text-base text-indigo-200/90 mt-1 max-w-3xl leading-relaxed">
                Eksplorasi hubungan kausal dan statistik antara tingkat pendidikan formal narasumber lapangan dengan tingkat pemertahanan leksikon dialek lokal, deviasi terhadap bahasa baku, dan skor dialektometri.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {onNavigateToAgeRegression && (
                <button
                  type="button"
                  onClick={onNavigateToAgeRegression}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                  title="Beralih ke Analisis Regresi Usia vs Variabel Bahasa (Grafik Tren Recharts)"
                >
                  <TrendingUp className="w-4 h-4 text-teal-200" />
                  <span>Regresi Usia & Tren Dialek ↗</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all backdrop-blur-md cursor-pointer"
              >
                <Download className="w-4 h-4 text-indigo-300" />
                <span>Unduh Data Korelasi (CSV)</span>
              </button>
              {onNavigateToDialekPeta && (
                <button
                  type="button"
                  onClick={onNavigateToDialekPeta}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>Peta Dialek & Isoglos</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* HERO STATS CARDS: Pearson r, R², Spearman rho, Regresi Linier */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Pearson r */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Koefisien Korelasi (r)</span>
            <div className={`p-1.5 rounded-lg ${
              correlationStats.direction === 'negatif' 
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' 
                : correlationStats.direction === 'positif'
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              {correlationStats.direction === 'negatif' ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {correlationStats.r > 0 ? `+${correlationStats.r}` : correlationStats.r}
            </span>
            <span className="text-xs text-slate-400 font-mono">Pearson</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              correlationStats.strength === 'kuat' || correlationStats.strength === 'sangat_kuat'
                ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                : correlationStats.strength === 'moderat'
                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              {correlationStats.direction.toUpperCase()} ({correlationStats.strength.replace('_', ' ')})
            </span>
          </div>
        </div>

        {/* Card 2: R-Squared (Determinasi) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Determinasi (R²)</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {(correlationStats.rSquared * 100).toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400 font-mono">R²</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            Varians dialek terjelaskan oleh pendidikan
          </p>
        </div>

        {/* Card 3: Spearman's Rank rho */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Spearman Rank (ρ)</span>
            <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {correlationStats.spearmanRho > 0 ? `+${correlationStats.spearmanRho}` : correlationStats.spearmanRho}
            </span>
            <span className="text-xs text-slate-400 font-mono">Ordinal ρ</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            Korelasi non-parametrik berjenjang
          </p>
        </div>

        {/* Card 4: Persamaan Regresi Linier */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Garis Tren Regresi</span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-bold font-mono text-purple-700 dark:text-purple-300 truncate">
              y = {correlationStats.slope}x {correlationStats.intercept >= 0 ? `+ ${correlationStats.intercept}` : `- ${Math.abs(correlationStats.intercept)}`}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            N = <b className="text-slate-700 dark:text-slate-300">{correlationStats.n}</b> observasi sampel
          </p>
        </div>
      </div>

      {/* CONTROL & FILTER TOOLBAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <SlidersHorizontal className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Parameter Variabel & Sumbu Grafik Scatter Plot
            </h3>
          </div>

          {/* View Tab Buttons (Chart, Data Table, Teori) */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('chart')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'chart'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Scatter Plot Recharts</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tabel')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'tabel'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>Tabel Data ({filteredData.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('teori')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'teori'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Interpretasi Teoretis</span>
            </button>
          </div>
        </div>

        {/* Metric Selectors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
          {/* Sumbu X: Pendidikan */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              Sumbu X: Ukuran Tingkat Pendidikan
            </label>
            <select
              value={xMetric}
              onChange={(e) => setXMetric(e.target.value as XMetric)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="pendidikanYears">Tahun Pendidikan Formal (0 – 18+ Thn)</option>
              <option value="pendidikanOrdinal">Skala Ordinal Jenjang (1 s.d. 7)</option>
            </select>
          </div>

          {/* Sumbu Y: Variasi Dialek */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              Sumbu Y: Metrik Variasi Dialek
            </label>
            <select
              value={yMetric}
              onChange={(e) => setYMetric(e.target.value as YMetric)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="variasiLeksikalPct">Deviasi Leksikal Bahasa Baku (%)</option>
              <option value="dialektometriGuiterPct">Perbedaan Dialektometri Guiter (d%)</option>
              <option value="retensiDialekLokalPct">Indeks Pemertahanan Dialek (%)</option>
              <option value="inovasiLokalCount">Jumlah Leksikon Khas Lokal (Count)</option>
            </select>
          </div>

          {/* Mode Agregasi */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              Unit Analisis (Agregasi)
            </label>
            <select
              value={aggregationMode}
              onChange={(e) => setAggregationMode(e.target.value as AggregationMode)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="individual">Per Narasumber (Individual Informant)</option>
              <option value="aggregate">Per Titik Pengamatan / Desa (Agregat)</option>
            </select>
          </div>

          {/* Pewarnaan Titik */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              Pewarnaan Titik (Scatter Color)
            </label>
            <select
              value={colorGrouping}
              onChange={(e) => setColorGrouping(e.target.value as ColorGrouping)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="pendidikan">Berdasarkan Jenjang Pendidikan</option>
              <option value="bahasa">Berdasarkan Bahasa Daerah</option>
              {aggregationMode === 'individual' && <option value="usia">Berdasarkan Kelompok Usia</option>}
              {aggregationMode === 'individual' && <option value="gender">Berdasarkan Jenis Kelamin</option>}
            </select>
          </div>
        </div>

        {/* Secondary Filters & Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Bahasa */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Bahasa:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs cursor-pointer"
              >
                <option value="all">Semua Bahasa ({filterOptions.languages.length})</option>
                {filterOptions.languages.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* Filter Wilayah */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Kabupaten:</span>
              <select
                value={selectedKabupaten}
                onChange={(e) => setSelectedKabupaten(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs cursor-pointer"
              >
                <option value="all">Semua Kabupaten ({filterOptions.kabupatens.length})</option>
                {filterOptions.kabupatens.map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            {/* Filter Gender (jika individual) */}
            {aggregationMode === 'individual' && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Gender:</span>
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs cursor-pointer"
                >
                  <option value="all">Semua Gender</option>
                  <option value="pria">Laki-laki / Pria</option>
                  <option value="wanita">Perempuan / Wanita</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
              <input
                type="checkbox"
                checked={showTrendline}
                onChange={(e) => setShowTrendline(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span>Garis Tren Regresi Linier</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
              <input
                type="checkbox"
                checked={showReferenceLines}
                onChange={(e) => setShowReferenceLines(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span>Garis Rata-Rata</span>
            </label>
          </div>
        </div>
      </div>

      {/* MAIN VIEW: SCATTER PLOT OR TABLE */}
      {activeTab === 'chart' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Diagram Tebar (Scatter Plot): Hubungan Pendidikan vs {Y_METRIC_CONFIG[yMetric].shortLabel}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {Y_METRIC_CONFIG[yMetric].desc} Tiap lingkaran mewakili {aggregationMode === 'individual' ? 'seorang narasumber' : 'titik pengamatan desa'}.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Sampel:</span>
              <span className="font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                {chartData.length} Titik Data
              </span>
            </div>
          </div>

          {/* Recharts ScatterChart Container */}
          <div className="w-full h-[460px] relative bg-slate-50/50 dark:bg-slate-950/30 rounded-2xl p-2 border border-slate-100 dark:border-slate-800/80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 45, left: 25 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name={xMetric === 'pendidikanYears' ? 'Tahun Pendidikan' : 'Tingkat Pendidikan'} 
                  unit={xMetric === 'pendidikanYears' ? ' thn' : ''}
                  domain={xMetric === 'pendidikanYears' ? [0, 20] : [1, 7]}
                  tickCount={xMetric === 'pendidikanYears' ? 10 : 7}
                  tickFormatter={(val) => {
                    if (xMetric === 'pendidikanOrdinal') {
                      return ORDINAL_EDUCATION_LABELS[val] || `${val}`;
                    }
                    return `${val} th`;
                  }}
                  label={{ 
                    value: xMetric === 'pendidikanYears' ? 'Lama Pendidikan Formal (Tahun)' : 'Jenjang Pendidikan Formal (Skala Ordinal 1-7)', 
                    position: 'insideBottom', 
                    offset: -20,
                    style: { fontSize: '11px', fill: '#64748b', fontWeight: 600 }
                  }}
                />

                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name={Y_METRIC_CONFIG[yMetric].shortLabel} 
                  unit={Y_METRIC_CONFIG[yMetric].unit}
                  domain={Y_METRIC_CONFIG[yMetric].domain}
                  label={{ 
                    value: `${Y_METRIC_CONFIG[yMetric].label} (${Y_METRIC_CONFIG[yMetric].unit})`, 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fontSize: '11px', fill: '#64748b', fontWeight: 600 }
                  }}
                />

                <ZAxis 
                  type="number" 
                  dataKey="size" 
                  range={[90, 320]} 
                  name="Bobot Pengamatan" 
                />

                <Tooltip content={<CustomScatterTooltip />} />

                {/* Reference lines for averages */}
                {showReferenceLines && correlationStats.n >= 2 && (
                  <>
                    <ReferenceLine 
                      x={correlationStats.avgX} 
                      stroke="#94a3b8" 
                      strokeDasharray="4 4" 
                      label={{ value: `Rata2 X: ${correlationStats.avgX}`, fill: '#94a3b8', fontSize: 10, position: 'insideTopRight' }} 
                    />
                    <ReferenceLine 
                      y={correlationStats.avgY} 
                      stroke="#94a3b8" 
                      strokeDasharray="4 4" 
                      label={{ value: `Rata2 Y: ${correlationStats.avgY}${Y_METRIC_CONFIG[yMetric].unit}`, fill: '#94a3b8', fontSize: 10, position: 'insideTopLeft' }} 
                    />
                  </>
                )}

                {/* Linear Regression Trendline */}
                {showTrendline && trendlineData.length === 2 && (
                  <Scatter
                    name="Garis Tren Regresi"
                    data={trendlineData}
                    line={{ stroke: '#4f46e5', strokeWidth: 2.5, strokeDasharray: '5 5' }}
                    shape={() => null}
                    legendType="none"
                    isAnimationActive={false}
                  />
                )}

                {/* Main Scatter Data Points */}
                <Scatter 
                  name={aggregationMode === 'individual' ? 'Narasumber' : 'Titik Survei'} 
                  data={chartData} 
                  fill="#6366f1"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${entry.id}-${index}`} 
                      fill={entry.fillColor} 
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      className="cursor-pointer transition-transform hover:scale-125"
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Color Legend Palette Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Legenda Warna ({colorGrouping.toUpperCase()}):
            </span>
            <div className="flex flex-wrap items-center gap-3">
              {colorGrouping === 'pendidikan' && Object.entries(COLOR_PALETTES.pendidikan).map(([label, color]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">{label}</span>
                </div>
              ))}
              {colorGrouping === 'bahasa' && Object.entries(COLOR_PALETTES.bahasa).slice(0, 5).map(([label, color]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">{label}</span>
                </div>
              ))}
              {colorGrouping === 'usia' && Object.entries(COLOR_PALETTES.usia).map(([key, color]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">{key === 'under_30' ? '<30 Thn' : key === '30_44' ? '30-44 Thn' : key === '45_59' ? '45-59 Thn' : '≥60 Thn'}</span>
                </div>
              ))}
              {colorGrouping === 'gender' && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">Pria / Laki-laki</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">Wanita / Perempuan</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sosiolinguistic Interpretation Callout */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Temuan Analisis Sosiodialektologi:
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {correlationStats.interpretationText}
                </p>
                <p className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 mt-1">
                  💡 {correlationStats.sociolinguisticVerdict}
                </p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setActiveTab('teori')}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shrink-0 cursor-pointer transition-colors shadow-2xs"
            >
              Baca Teori Labovian
            </button>
          </div>
        </div>
      )}

      {/* TABEL DATA DETAIL */}
      {activeTab === 'tabel' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Daftar Observasi & Matriks Nilai Korelasi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Menampilkan {filteredTableData.length} data narasumber/titik observasi yang dianalisis pada scatter plot.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari narasumber, desa, pendidikan..."
                  value={searchTableQuery}
                  onChange={(e) => setSearchTableQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 w-52 sm:w-64"
                />
              </div>

              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-3.5 py-3">Nama / Titik</th>
                  <th className="px-3.5 py-3">Desa & Kabupaten</th>
                  <th className="px-3.5 py-3">Bahasa</th>
                  <th className="px-3.5 py-3">Jenjang Pendidikan</th>
                  <th className="px-3.5 py-3 text-center">Tahun (X)</th>
                  <th className="px-3.5 py-3 text-center">Variasi Leksikal (Y)</th>
                  <th className="px-3.5 py-3 text-center">Guiter (d%)</th>
                  <th className="px-3.5 py-3 text-center">Retensi Dialek</th>
                  <th className="px-3.5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                {filteredTableData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-3.5 py-2.5">
                      <div className="font-bold text-slate-900 dark:text-white">{row.displayName}</div>
                      <div className="text-[10px] text-slate-400">
                        {aggregationMode === 'individual' ? `${(row as any).usia} thn • ${(row as any).gender}` : `${(row as any).totalNarasumber} narasumber`}
                      </div>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <div>{row.desa}</div>
                      <div className="text-[10px] text-slate-400">{row.kabupaten}</div>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {row.bahasa}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: row.fillColor }} />
                        {row.eduLabel}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-center font-bold text-indigo-600 dark:text-indigo-400">
                      {row.x} thn
                    </td>
                    <td className="px-3.5 py-2.5 text-center font-bold text-amber-600 dark:text-amber-400">
                      {row.variasiLeksikalPct}%
                    </td>
                    <td className="px-3.5 py-2.5 text-center">
                      {row.dialektometriGuiterPct}%
                    </td>
                    <td className="px-3.5 py-2.5 text-center">
                      {row.retensiDialekLokalPct}%
                    </td>
                    <td className="px-3.5 py-2.5 text-right">
                      {onSelectSurvey && row.surveyId && (
                        <button
                          type="button"
                          onClick={() => onSelectSurvey(row.surveyId)}
                          className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-semibold text-[11px] cursor-pointer transition-colors"
                        >
                          Lihat Survei
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TEORI SOSIODIALEKTOLOGI LABOVIAN */}
      {activeTab === 'teori' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Landasan Teoretis: Stratifikasi Bahasa, Pendidikan, dan Variasi Dialek
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Referensi Sosiolinguistik Modern (William Labov, Peter Trudgill, & Teori Dialektologi Sosial Nusantara)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">1</span>
                <span>Dialect Leveling & Standarisasi</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Pendidikan formal bertindak sebagai agen standarisasi bahasa (*standardization agent*). Penutur yang menempuh pendidikan tinggi (SMA, Sarjana, Pascasarjana) memiliki intensitas kontak yang tinggi dengan ragam baku nasional (Bahasa Indonesia) serta ragam sastra baku bahasa daerah, sehingga variasi wicara non-standar lokal (basilek) cenderung melunak (*dialect leveling*).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">2</span>
                <span>Pemertahanan Varian Arkais</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Penutur dengan latar belakang pendidikan dasar atau non-formal umumnya memiliki mobilitas geografis yang lebih terlokalisasi di ranah agraris/maritim setempat. Kelompok ini mempertahankan leksikon lokal arkais, variasi fonetik vokal khusus, serta idiom folklor tradisional dengan tingkat kemurnian dialek yang lebih pekat.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs">3</span>
                <span>Diglosia & Pilihan Register</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Tingginya korelasi tidak selalu berarti kepunahan dialek. Sering kali terjadi fenomena diglosia di mana penutur berpendidikan tinggi menguasai register formal (*high variety*) di sekolah dan ruang publik, namun tetap beralih kode (*code-switching*) ke dialek akrab (*low variety / loma*) dalam interaksi kekeluargaan di desa.
              </p>
            </div>
          </div>

          {/* Kuadran Sosiolinguistik */}
          <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-indigo-950 dark:text-indigo-200">
              Interpretasi Matriks Kuadran Scatter Plot:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-indigo-600 dark:text-indigo-400">Kuadran Kiri Atas (Pendidikan Dasar, Variasi Tinggi)</div>
                <p className="text-slate-600 dark:text-slate-300 mt-1">
                  <b>Penutur Konservatif Tradisional:</b> Pemegang dialek autentik, informan utama dialektologi lapangan untuk merekam leksikon arkais dan isoglos murni.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-teal-600 dark:text-teal-400">Kuadran Kanan Bawah (Pendidikan Tinggi, Variasi Rendah)</div>
                <p className="text-slate-600 dark:text-slate-300 mt-1">
                  <b>Penutur Terstandarisasi / Kosmopolitan:</b> Menunjukkan konvergensi leksikal ke arah bahasa baku atau ragam umum perkotaan.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-purple-600 dark:text-purple-400">Kuadran Kanan Atas (Pendidikan Tinggi, Variasi Tinggi)</div>
                <p className="text-slate-600 dark:text-slate-300 mt-1">
                  <b>Revitalis / Penggiat Budaya Lokal:</b> Penutur terpelajar yang secara sadar menguasai dan melestarikan undak-usuk basa serta perbendaharaan dialek tingkat lanjut.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-amber-600 dark:text-amber-400">Kuadran Kiri Bawah (Pendidikan Dasar, Variasi Rendah)</div>
                <p className="text-slate-600 dark:text-slate-300 mt-1">
                  <b>Area Pengaruh Migrasi / Perbatasan:</b> Titik tutur di mana bahasa pergaulan umum mendominasi komunitas karena interaksi perdagangan atau mobilitas pesisir.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
