import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ZAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Line
} from 'recharts';
import { 
  BarChart3, 
  Radar as RadarIcon, 
  Layers, 
  ArrowUpDown, 
  Sparkles, 
  MapPin, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Compass,
  Dot,
  ScatterChart as ScatterIcon,
  Activity,
  Grid3X3,
  Sliders,
  GitBranch
} from 'lucide-react';
import { 
  TitikPembandingDialektometri, 
  TitikPengamatan, 
  SituasiGeografis 
} from '../../types/linguistic';
import { hitungDialektometri, calculateDistanceKm, parseNum } from '../../utils/calculations';

interface DialektometriChartProps {
  titikPengamatan: TitikPengamatan;
  situasiGeografis: SituasiGeografis;
  titikPembandingList: TitikPembandingDialektometri[];
  onNavigateToHeatmap?: () => void;
  onNavigateToClassification?: () => void;
  onNavigateToD3Cluster?: () => void;
}

export const DialektometriChart: React.FC<DialektometriChartProps> = ({
  titikPengamatan,
  situasiGeografis,
  titikPembandingList,
  onNavigateToHeatmap,
  onNavigateToClassification,
  onNavigateToD3Cluster
}) => {
  const [chartType, setChartType] = useState<'bar' | 'scatter' | 'histogram' | 'dual' | 'radar'>('bar');
  const [sortBy, setSortBy] = useState<'default' | 'asc' | 'desc' | 'distance'>('default');

  const refLat = parseNum(situasiGeografis.koordinatLintang) || -7.4982;
  const refLon = parseNum(situasiGeografis.koordinatBujur) || 107.3485;
  const refDesa = titikPengamatan.namaDesa || 'Titik Acuan (TP-01)';
  const refBahasa = titikPengamatan.bahasaDigunakan || 'Bahasa Utama';

  // Process and enrich dataset
  const chartData = useMemo(() => {
    return titikPembandingList.map((tp, idx) => {
      const calc = hitungDialektometri(tp.jumlahBeda, tp.jumlahGlos);
      const dist = calculateDistanceKm(refLat, refLon, tp.lintang, tp.bujur);
      
      let fillColor = '#10b981'; // <= 20% Tidak Berbeda
      if (calc.persentase > 80) {
        fillColor = '#ef4444'; // > 80% Beda Bahasa
      } else if (calc.persentase > 50) {
        fillColor = '#ea580c'; // 51-80% Beda Dialek
      } else if (calc.persentase > 30) {
        fillColor = '#f59e0b'; // 31-50% Beda Subdialek
      } else if (calc.persentase > 20) {
        fillColor = '#0284c7'; // 21-30% Beda Wicara
      }

      const kemiripan = Math.max(0, Math.min(100, Math.round((100 - calc.persentase) * 10) / 10));

      return {
        id: tp.id,
        name: tp.namaTitik || `TP-${idx + 2}`,
        shortName: (tp.desa || tp.namaTitik || `TP-${idx + 2}`).slice(0, 14),
        desa: tp.desa || '-',
        bahasa: tp.bahasa || '-',
        lintang: tp.lintang,
        bujur: tp.bujur,
        jumlahBeda: tp.jumlahBeda,
        jumlahGlos: tp.jumlahGlos,
        persentase: calc.persentase,
        kemiripan,
        kategori: calc.kategori,
        fillColor,
        jarakKm: dist,
        // For scatter plot radius sizing
        z: Math.max(80, Math.min(300, tp.jumlahGlos || 200))
      };
    });
  }, [titikPembandingList, refLat, refLon]);

  // Apply sorting
  const processedData = useMemo(() => {
    const list = [...chartData];
    if (sortBy === 'asc') {
      list.sort((a, b) => a.persentase - b.persentase);
    } else if (sortBy === 'desc') {
      list.sort((a, b) => b.persentase - a.persentase);
    } else if (sortBy === 'distance') {
      list.sort((a, b) => a.jarakKm - b.jarakKm);
    }
    return list;
  }, [chartData, sortBy]);

  // Statistical Metrics (Mean, Median, Standard Deviation, Pearson r Correlation)
  const summaryMetrics = useMemo(() => {
    if (chartData.length === 0) {
      return {
        avgPercentage: 0,
        medianPercentage: 0,
        stdDev: 0,
        minPercentage: 0,
        maxPercentage: 0,
        pearsonR: 0,
        regressionSlope: 0,
        regressionIntercept: 0,
        avgSimilarity: 0,
        similarityCategory: 'Tidak Ada Data',
        similarityBadgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
        similarityStatusText: 'Belum ada titik pembanding yang diinput',
        totalGlosBeda: 0,
        totalGlosSample: 0,
        closest: null,
        farthest: null,
        counts: { tidakBerbeda: 0, wicara: 0, subdialek: 0, dialek: 0, bahasa: 0 }
      };
    }

    const pers = chartData.map(c => c.persentase);
    const dists = chartData.map(c => c.jarakKm);
    const n = pers.length;

    // 1. Mean
    const totalDiff = pers.reduce((acc, curr) => acc + curr, 0);
    const avgDiff = Math.round((totalDiff / n) * 10) / 10;
    const avgSimilarity = Math.max(0, Math.min(100, Math.round((100 - avgDiff) * 10) / 10));

    // 2. Median
    const sortedPers = [...pers].sort((a, b) => a - b);
    const mid = Math.floor(n / 2);
    const medianPercentage = n % 2 !== 0 
      ? sortedPers[mid] 
      : Math.round(((sortedPers[mid - 1] + sortedPers[mid]) / 2) * 10) / 10;

    // 3. Standard Deviation (Sigma)
    const variance = pers.reduce((acc, val) => acc + Math.pow(val - avgDiff, 2), 0) / n;
    const stdDev = Math.round(Math.sqrt(variance) * 10) / 10;

    // 4. Min & Max
    const minPercentage = Math.min(...pers);
    const maxPercentage = Math.max(...pers);

    // 5. Pearson Correlation Coefficient (r) between Distance (x) and Difference (y)
    const avgDist = dists.reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let denX = 0;
    let denY = 0;
    for (let i = 0; i < n; i++) {
      const dx = dists[i] - avgDist;
      const dy = pers[i] - avgDiff;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }

    let pearsonR = 0;
    let regressionSlope = 0;
    let regressionIntercept = avgDiff;
    if (denX > 0 && denY > 0) {
      pearsonR = Math.round((num / (Math.sqrt(denX) * Math.sqrt(denY))) * 100) / 100;
      regressionSlope = Math.round((num / denX) * 100) / 100;
      regressionIntercept = Math.round((avgDiff - regressionSlope * avgDist) * 10) / 10;
    }

    // Totals
    const totalGlosBeda = chartData.reduce((acc, curr) => acc + (curr.jumlahBeda || 0), 0);
    const totalGlosSample = chartData.reduce((acc, curr) => acc + (curr.jumlahGlos || 0), 0);

    let closest = chartData.length > 0 ? chartData[0] : null;
    let farthest = chartData.length > 0 ? chartData[0] : null;
    const counts = { tidakBerbeda: 0, wicara: 0, subdialek: 0, dialek: 0, bahasa: 0 };

    for (const item of chartData) {
      if (!closest || item.persentase < closest.persentase) closest = item;
      if (!farthest || item.persentase > farthest.persentase) farthest = item;

      if (item.persentase <= 20) counts.tidakBerbeda++;
      else if (item.persentase <= 30) counts.wicara++;
      else if (item.persentase <= 50) counts.subdialek++;
      else if (item.persentase <= 80) counts.dialek++;
      else counts.bahasa++;
    }

    // Similarity category based on linguistic scale
    let similarityCategory = 'Sangat Rendah (Beda Bahasa)';
    let similarityBadgeBg = 'bg-rose-100 text-rose-800 border-rose-200';
    let similarityStatusText = 'Hubungan kekerabatan bahasa jauh atau berlainan bahasa';
    if (avgSimilarity >= 80) {
      similarityCategory = 'Sangat Tinggi (Tidak Berbeda)';
      similarityBadgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-200';
      similarityStatusText = 'Tingkat kesepahaman timbal-balik (mutual intelligibility) penuh';
    } else if (avgSimilarity >= 70) {
      similarityCategory = 'Tinggi (Perbedaan Wicara)';
      similarityBadgeBg = 'bg-sky-100 text-sky-800 border-sky-200';
      similarityStatusText = 'Perbedaan wicara atau variasi lokal minor';
    } else if (avgSimilarity >= 50) {
      similarityCategory = 'Sedang-Tinggi (Perbedaan Subdialek)';
      similarityBadgeBg = 'bg-amber-100 text-amber-800 border-amber-200';
      similarityStatusText = 'Perbedaan subdialek dalam satu dialek/bahasa serumpun';
    } else if (avgSimilarity >= 20) {
      similarityCategory = 'Sedang (Perbedaan Dialek)';
      similarityBadgeBg = 'bg-orange-100 text-orange-800 border-orange-200';
      similarityStatusText = 'Telah membentuk dialek yang berbeda secara mandiri';
    }

    return {
      avgPercentage: avgDiff,
      medianPercentage,
      stdDev,
      minPercentage,
      maxPercentage,
      pearsonR,
      regressionSlope,
      regressionIntercept,
      avgSimilarity,
      similarityCategory,
      similarityBadgeBg,
      similarityStatusText,
      totalGlosBeda,
      totalGlosSample,
      closest,
      farthest,
      counts
    };
  }, [chartData]);

  // Histogram Frequency Data of Dialectometry categories
  const histogramData = useMemo(() => {
    const total = chartData.length || 1;
    return [
      {
        kategori: 'Tidak Berbeda',
        rentang: '≤ 20%',
        jumlah: summaryMetrics.counts.tidakBerbeda,
        persenTitik: Math.round((summaryMetrics.counts.tidakBerbeda / total) * 100),
        fillColor: '#10b981',
        deskripsi: 'Masih dalam satu variasi atau wicara yang sama'
      },
      {
        kategori: 'Perbedaan Wicara',
        rentang: '21% – 30%',
        jumlah: summaryMetrics.counts.wicara,
        persenTitik: Math.round((summaryMetrics.counts.wicara / total) * 100),
        fillColor: '#0284c7',
        deskripsi: 'Perbedaan wicara (speech difference)'
      },
      {
        kategori: 'Perbedaan Subdialek',
        rentang: '31% – 50%',
        jumlah: summaryMetrics.counts.subdialek,
        persenTitik: Math.round((summaryMetrics.counts.subdialek / total) * 100),
        fillColor: '#f59e0b',
        deskripsi: 'Perbedaan subdialek'
      },
      {
        kategori: 'Perbedaan Dialek',
        rentang: '51% – 80%',
        jumlah: summaryMetrics.counts.dialek,
        persenTitik: Math.round((summaryMetrics.counts.dialek / total) * 100),
        fillColor: '#ea580c',
        deskripsi: 'Perbedaan dialek (berbeda dialek)'
      },
      {
        kategori: 'Perbedaan Bahasa',
        rentang: '81% – 100%',
        jumlah: summaryMetrics.counts.bahasa,
        persenTitik: Math.round((summaryMetrics.counts.bahasa / total) * 100),
        fillColor: '#ef4444',
        deskripsi: 'Perbedaan bahasa (berbeda bahasa)'
      }
    ];
  }, [summaryMetrics, chartData]);

  // Trendline data for Scatter Plot
  const scatterTrendlineData = useMemo(() => {
    if (chartData.length < 2) return [];
    const distances = chartData.map(c => c.jarakKm);
    const minD = Math.max(0, Math.min(...distances));
    const maxD = Math.max(...distances) + 5;

    const y1 = Math.max(0, Math.min(100, summaryMetrics.regressionSlope * minD + summaryMetrics.regressionIntercept));
    const y2 = Math.max(0, Math.min(100, summaryMetrics.regressionSlope * maxD + summaryMetrics.regressionIntercept));

    return [
      { x: minD, y: Math.round(y1 * 10) / 10 },
      { x: maxD, y: Math.round(y2 * 10) / 10 }
    ];
  }, [chartData, summaryMetrics]);

  // Custom Tooltip for Recharts Bar Chart
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0 && payload[0]?.payload) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-xs p-3.5 rounded-xl border border-slate-200 shadow-xl text-xs max-w-xs z-50">
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
            <span className="font-bold text-slate-900 text-sm truncate">{data.name}</span>
            <span 
              className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-2xs"
              style={{ backgroundColor: data.fillColor }}
            >
              {data.kategori}
            </span>
          </div>

          <div className="space-y-1.5 text-slate-600">
            <div className="flex justify-between items-center bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
              <span className="text-emerald-900 font-semibold">Kemiripan (100% - d%):</span>
              <span className="font-black text-emerald-700 text-sm font-mono">{data.kemiripan}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Persentase Beda (d%):</span>
              <span className="font-bold text-rose-600 text-sm font-mono">{data.persentase}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Jumlah Glos Beda (s/n):</span>
              <span className="font-semibold text-slate-800 font-mono">{data.jumlahBeda} dari {data.jumlahGlos} glos</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Wilayah / Desa:</span>
              <span className="font-medium text-slate-800 truncate max-w-[140px]">{data.desa}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Bahasa Digunakan:</span>
              <span className="font-medium text-slate-800 truncate max-w-[140px]">{data.bahasa}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-100">
              <span className="text-slate-500">Jarak ke Acuan ({refDesa}):</span>
              <span className="font-medium text-slate-700 font-mono">~{data.jarakKm} km</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Recharts Scatter Plot
  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0 && payload[0]?.payload) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-xs p-3.5 rounded-xl border border-slate-200 shadow-xl text-xs max-w-xs z-50">
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
            <div>
              <span className="font-bold text-slate-900 text-sm block">{data.name}</span>
              <span className="text-[10px] text-slate-500">Desa {data.desa}</span>
            </div>
            <span 
              className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-2xs"
              style={{ backgroundColor: data.fillColor }}
            >
              {data.kategori}
            </span>
          </div>

          <div className="space-y-1.5 text-slate-600">
            <div className="flex justify-between items-center bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
              <span className="text-indigo-900 font-semibold">Jarak Spasial (X):</span>
              <span className="font-bold text-indigo-700 text-sm font-mono">{data.jarakKm} km</span>
            </div>
            <div className="flex justify-between items-center bg-rose-50 px-2 py-1 rounded border border-rose-100">
              <span className="text-rose-900 font-semibold">Beda Leksikal d% (Y):</span>
              <span className="font-bold text-rose-700 text-sm font-mono">{data.persentase}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Kemiripan:</span>
              <span className="font-semibold text-emerald-700 font-mono">{data.kemiripan}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Glos Teruji:</span>
              <span className="font-medium text-slate-800 font-mono">{data.jumlahBeda}/{data.jumlahGlos} kata</span>
            </div>
            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 italic">
              Titik Pengamatan Pembanding dialektometri
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Histogram Bar Chart
  const CustomHistogramTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0 && payload[0]?.payload) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200 shadow-lg text-xs max-w-xs">
          <div className="font-bold text-slate-900 text-sm mb-1">{data.kategori}</div>
          <div className="text-[11px] text-slate-500 mb-2">{data.rentang} • {data.deskripsi}</div>
          <div className="flex items-center justify-between text-xs py-1 border-t border-slate-100">
            <span className="text-slate-600 font-medium">Jumlah Titik:</span>
            <span className="font-bold text-slate-900 font-mono">{data.jumlah} titik</span>
          </div>
          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-slate-600 font-medium">Proporsi Sampel:</span>
            <span className="font-bold text-indigo-700 font-mono">{data.persenTitik}% dari total</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Radar Chart
  const CustomRadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0 && payload[0]?.payload) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-xs text-slate-800 p-3 rounded-xl shadow-xl text-xs max-w-xs z-50 border border-slate-200">
          <div className="font-bold text-sm text-indigo-950">{data.name}</div>
          <div className="text-[11px] text-slate-500 mb-1.5">{data.desa} • {data.bahasa}</div>
          <div className="flex items-center justify-between text-xs py-1 border-t border-slate-100">
            <span className="text-slate-500">Persentase Beda:</span>
            <span className="font-bold text-rose-600 font-mono">{data.persentase}%</span>
          </div>
          <div className="flex items-center justify-between text-xs pb-1">
            <span className="text-slate-500">Persentase Kemiripan:</span>
            <span className="font-bold text-emerald-600 font-mono">{data.kemiripan}%</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <span className="text-slate-500">Kategori:</span>
            <span className="font-semibold text-slate-800">{data.kategori}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (titikPembandingList.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-80" />
        <h4 className="text-sm font-bold text-slate-800">Belum Ada Data Titik Pembanding</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Silakan tambahkan titik pembanding pada Section 16 untuk melihat visualisasi grafik batang dan scatter plot dialektometri.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* KPI & Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Titik Acuan */}
        <div className="bg-gradient-to-br from-indigo-50/90 to-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-indigo-700 font-semibold mb-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              Titik Acuan
            </span>
            <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-mono">0%</span>
          </div>
          <div className="text-sm font-bold text-slate-900 truncate">{refDesa}</div>
          <div className="text-[11px] text-slate-600 truncate mt-0.5">{refBahasa}</div>
        </div>

        {/* Metric 2: Indeks Kemiripan Rata-rata */}
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white p-3.5 rounded-xl border-2 border-emerald-500/40 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] text-emerald-800 font-bold mb-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Kemiripan (s%)
            </span>
            <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-mono font-bold">
              100-d̄%
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
              {summaryMetrics.avgSimilarity}%
            </span>
          </div>
          <div className="text-[10px] text-emerald-700 font-medium mt-1 truncate">
            {summaryMetrics.avgSimilarity >= 80 ? 'Subdialek' : summaryMetrics.avgSimilarity >= 50 ? 'Dialek' : summaryMetrics.avgSimilarity >= 20 ? 'Subbahasa' : 'Beda Bahasa'}
          </div>
        </div>

        {/* Metric 3: Rata-rata Beda Leksikal */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold mb-1">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              Rata-rata (d̄%)
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-900 font-mono">{summaryMetrics.avgPercentage}%</span>
            <span className="text-[10px] text-slate-500 font-mono">
              ({chartData.length} TP)
            </span>
          </div>
          <div className="text-[10px] text-slate-600 mt-1">Total sampel beda: {summaryMetrics.totalGlosBeda} glos</div>
        </div>

        {/* Metric 4: Standar Deviasi (Dispersi) */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold mb-1">
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-purple-600" />
              Dispersi (σ)
            </span>
            <span className="text-[10px] text-slate-400 font-mono">±</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-900 font-mono">{summaryMetrics.stdDev}%</span>
            <span className="text-[10px] text-slate-500 font-mono">deviasi</span>
          </div>
          <div className="text-[10px] text-slate-600 mt-1 truncate">
            Median: <b className="font-mono">{summaryMetrics.medianPercentage}%</b>
          </div>
        </div>

        {/* Metric 5: Korelasi Jarak Spasial (Isolation by Distance) */}
        <div className="bg-gradient-to-br from-blue-50/70 to-white p-3.5 rounded-xl border border-blue-200 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-blue-800 font-semibold mb-1">
            <span className="flex items-center gap-1">
              <ScatterIcon className="w-3.5 h-3.5 text-blue-600" />
              Korelasi Jarak (r)
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-xl font-bold font-mono ${
              summaryMetrics.pearsonR >= 0.5 ? 'text-blue-700' : 'text-slate-800'
            }`}>
              {summaryMetrics.pearsonR > 0 ? `+${summaryMetrics.pearsonR}` : summaryMetrics.pearsonR}
            </span>
            <span className="text-[10px] text-blue-600 font-medium">Pearson</span>
          </div>
          <div className="text-[10px] text-slate-600 mt-1 truncate">
            {summaryMetrics.pearsonR >= 0.6 ? 'Korelasi spasial kuat' : summaryMetrics.pearsonR >= 0.3 ? 'Korelasi moderat' : 'Variasi non-spasial'}
          </div>
        </div>

        {/* Metric 6: Rentang Variasi */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold mb-1">
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-slate-500" />
              Rentang Selisih
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-bold font-mono text-emerald-600">{summaryMetrics.minPercentage}%</span>
            <span className="text-slate-400 font-mono text-xs">→</span>
            <span className="text-xs font-bold font-mono text-rose-600">{summaryMetrics.maxPercentage}%</span>
          </div>
          <div className="text-[10px] text-slate-600 mt-1.5 truncate">
            Selisih: <b className="font-mono">{Math.round((summaryMetrics.maxPercentage - summaryMetrics.minPercentage) * 10) / 10}%</b>
          </div>
        </div>
      </div>

      {/* Visualization Controls & View Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            Mode Visualisasi Statistik:
          </span>
          <div className="flex flex-wrap items-center bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs text-xs">
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Diagram Batang (Bar)</span>
            </button>

            <button
              type="button"
              onClick={() => setChartType('scatter')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                chartType === 'scatter'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ScatterIcon className="w-3.5 h-3.5" />
              <span>Scatter Plot (Korelasi Jarak)</span>
            </button>

            <button
              type="button"
              onClick={() => setChartType('histogram')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                chartType === 'histogram'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Distribusi Frekuensi Kategori</span>
            </button>

            <button
              type="button"
              onClick={() => setChartType('dual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                chartType === 'dual'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Dual View (Bar + Scatter)</span>
            </button>

            <button
              type="button"
              onClick={() => setChartType('radar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                chartType === 'radar'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <RadarIcon className="w-3.5 h-3.5" />
              <span>Radar Dialektometri</span>
            </button>

            {onNavigateToD3Cluster && (
              <button
                type="button"
                onClick={onNavigateToD3Cluster}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
                title="Buka Visualisasi Interaktif Klaster & Radar D3"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Klaster D3.js</span>
              </button>
            )}
          </div>
        </div>

        {/* Secondary Actions & Sorting */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {(chartType === 'bar' || chartType === 'dual') && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3" />
                Urutkan:
              </span>
              <button
                type="button"
                onClick={() => setSortBy('default')}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  sortBy === 'default'
                    ? 'bg-indigo-100 text-indigo-800 font-bold border border-indigo-200'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Titik
              </button>
              <button
                type="button"
                onClick={() => setSortBy('asc')}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  sortBy === 'asc'
                    ? 'bg-indigo-100 text-indigo-800 font-bold border border-indigo-200'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                d% Rendah → Tinggi
              </button>
              <button
                type="button"
                onClick={() => setSortBy('desc')}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  sortBy === 'desc'
                    ? 'bg-indigo-100 text-indigo-800 font-bold border border-indigo-200'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                d% Tinggi → Rendah
              </button>
              <button
                type="button"
                onClick={() => setSortBy('distance')}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  sortBy === 'distance'
                    ? 'bg-indigo-100 text-indigo-800 font-bold border border-indigo-200'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Jarak Spasial
              </button>
            </div>
          )}

          {onNavigateToClassification && (
            <button
              type="button"
              onClick={onNavigateToClassification}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300 transition-colors cursor-pointer"
              title="Buka Klasifikasi & Interpretasi Otomatis Hubungan Kekerabatan Bahasa"
            >
              <GitBranch className="w-3.5 h-3.5 text-emerald-600" />
              <span>Klasifikasi & Interpretasi</span>
            </button>
          )}

          {onNavigateToHeatmap && (
            <button
              type="button"
              onClick={onNavigateToHeatmap}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200 transition-colors cursor-pointer"
              title="Buka Matriks Heatmap Dialektometri"
            >
              <Grid3X3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Buka Heatmap Matriks</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Charts Canvas Area */}
      <div className={`grid gap-5 ${chartType === 'dual' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
        
        {/* 1. BAR CHART VIEW */}
        {(chartType === 'bar' || chartType === 'dual') && (
          <div className={`${chartType === 'dual' ? 'lg:col-span-6' : 'w-full'} bg-white border border-slate-200 rounded-xl p-4 shadow-2xs`}>
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <span>Diagram Batang Distribusi Beda Leksikal (d%)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Perbedaan kosakata tiap titik pembanding terhadap titik acuan {refDesa}. Garis putus-putus: ambang dialektometri (20%, 30%, 50%, 80%).
                </p>
              </div>
            </div>

            <div className="h-[360px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={processedData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 45 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="shortName" 
                    tick={{ fill: '#475569', fontSize: 11 }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fill: '#475569', fontSize: 11 }}
                    unit="%"
                    ticks={[0, 20, 30, 50, 80, 100]}
                  />
                  <Tooltip content={<CustomBarTooltip />} />

                  {/* Reference Lines for Dialectometry Scale */}
                  <ReferenceLine 
                    y={20} 
                    stroke="#10b981" 
                    strokeDasharray="4 4" 
                    label={{ value: '≤20% Tidak Berbeda', position: 'insideTopRight', fill: '#059669', fontSize: 10 }} 
                  />
                  <ReferenceLine 
                    y={30} 
                    stroke="#0284c7" 
                    strokeDasharray="4 4" 
                    label={{ value: '30% Wicara', position: 'insideTopRight', fill: '#0284c7', fontSize: 10 }} 
                  />
                  <ReferenceLine 
                    y={50} 
                    stroke="#f59e0b" 
                    strokeDasharray="4 4" 
                    label={{ value: '50% Subdialek', position: 'insideTopRight', fill: '#d97706', fontSize: 10 }} 
                  />
                  <ReferenceLine 
                    y={80} 
                    stroke="#ea580c" 
                    strokeDasharray="4 4" 
                    label={{ value: '80% Dialek', position: 'insideTopRight', fill: '#c2410c', fontSize: 10 }} 
                  />

                  <Bar 
                    dataKey="persentase" 
                    name="Persentase Beda (d%)" 
                    radius={[6, 6, 0, 0]}
                  >
                    {processedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fillColor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 2. SCATTER PLOT VIEW (Korelasi Spasial: Jarak km vs Beda Leksikal d%) */}
        {(chartType === 'scatter' || chartType === 'dual') && (
          <div className={`${chartType === 'dual' ? 'lg:col-span-6' : 'w-full'} bg-white border border-slate-200 rounded-xl p-4 shadow-2xs`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-2 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ScatterIcon className="w-4 h-4 text-indigo-600" />
                  <span>Scatter Plot: Korelasi Jarak Geografis (km) vs Beda Leksikal (d%)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Menguji hukum dialektologi <i>Isolation by Distance</i>: sejauh mana jarak fisik memicu perbedaan bahasa.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                  r = {summaryMetrics.pearsonR > 0 ? `+${summaryMetrics.pearsonR}` : summaryMetrics.pearsonR} (Pearson)
                </span>
              </div>
            </div>

            <div className="h-[360px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 25, left: 0, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    type="number" 
                    dataKey="jarakKm" 
                    name="Jarak Spasial" 
                    unit=" km" 
                    tick={{ fill: '#475569', fontSize: 11 }}
                    label={{ value: 'Jarak Geografis dari Titik Acuan (km)', position: 'insideBottom', offset: -12, fill: '#64748b', fontSize: 11 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="persentase" 
                    name="Beda Leksikal" 
                    unit="%" 
                    domain={[0, 100]}
                    ticks={[0, 20, 50, 80, 100]}
                    tick={{ fill: '#475569', fontSize: 11 }}
                    label={{ value: 'Beda Leksikal (d%)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
                  />
                  <ZAxis type="number" dataKey="z" range={[80, 350]} />
                  <Tooltip content={<CustomScatterTooltip />} />

                  {/* Guiter Reference Thresholds */}
                  <ReferenceLine 
                    y={20} 
                    stroke="#10b981" 
                    strokeDasharray="4 4" 
                    label={{ value: '20% Wicara', position: 'insideTopRight', fill: '#059669', fontSize: 10 }} 
                  />
                  <ReferenceLine 
                    y={50} 
                    stroke="#3b82f6" 
                    strokeDasharray="4 4" 
                    label={{ value: '50% Dialek', position: 'insideTopRight', fill: '#2563eb', fontSize: 10 }} 
                  />
                  <ReferenceLine 
                    y={80} 
                    stroke="#f59e0b" 
                    strokeDasharray="4 4" 
                    label={{ value: '80% Subbahasa', position: 'insideTopRight', fill: '#d97706', fontSize: 10 }} 
                  />

                  <Scatter 
                    name="Titik Pengamatan" 
                    data={chartData} 
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`scatter-cell-${index}`} fill={entry.fillColor} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Scatter Plot Explanatory Footnote */}
            <div className="mt-3 p-2.5 bg-blue-50/60 border border-blue-100 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between text-xs text-blue-900 gap-2">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>
                  Persamaan Regresi Linier: <span className="font-mono font-bold">d% = {summaryMetrics.regressionSlope} × (km) + {summaryMetrics.regressionIntercept}%</span>
                </span>
              </div>
              <span className="text-[11px] text-blue-700 font-medium">
                {summaryMetrics.pearsonR >= 0.5 
                  ? '✓ Pola Isolation-by-Distance terkonfirmasi signifikan' 
                  : 'Faktor topografi atau migrasi non-linier terdeteksi'}
              </span>
            </div>
          </div>
        )}

        {/* 3. HISTOGRAM FREKUENSI DISTRIBUSI KATEGORI GUITER */}
        {chartType === 'histogram' && (
          <div className="w-full bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  <span>Distribusi Frekuensi Kategori Dialektometri (Histogram Badan Bahasa)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Proporsi sebaran titik pengamatan berdasarkan 4 jenjang pemisahan bahasa Guiter.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                Total {chartData.length} Titik Pembanding
              </span>
            </div>

            <div className="h-[360px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={histogramData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="kategori" 
                    tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                  />
                  <YAxis 
                    allowDecimals={false} 
                    tick={{ fill: '#475569', fontSize: 11 }}
                    label={{ value: 'Jumlah Titik Pembanding', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
                  />
                  <Tooltip content={<CustomHistogramTooltip />} />
                  <Bar 
                    dataKey="jumlah" 
                    name="Jumlah Titik" 
                    radius={[6, 6, 0, 0]}
                  >
                    {histogramData.map((entry, index) => (
                      <Cell key={`hist-cell-${index}`} fill={entry.fillColor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Distribution Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
              {histogramData.map((h) => (
                <div key={h.kategori} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-xs" style={{ backgroundColor: h.fillColor }} />
                    <span className="font-bold text-slate-900 text-xs truncate">{h.kategori}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold font-mono text-slate-900">{h.jumlah}</span>
                    <span className="text-xs text-slate-500 font-mono">({h.persenTitik}%)</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{h.rentang}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. RADAR SPEKTRUM DIALEKTOMETRI */}
        {chartType === 'radar' && (
          <div className="w-full bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col">
            <div className="pb-3 mb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <RadarIcon className="w-4 h-4 text-indigo-600" />
                <span>Radar Spektrum Dialektometri Multi-Titik</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Penyebaran jarak leksikal 360° dari pusat acuan {refDesa}.
              </p>
            </div>

            <div className="h-[380px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart 
                  cx="50%" 
                  cy="50%" 
                  outerRadius="75%" 
                  data={chartData}
                >
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis 
                    dataKey="shortName" 
                    tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }} 
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]} 
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    unit="%"
                    ticks={[20, 30, 50, 80, 100]}
                  />
                  <Radar
                    name="Persentase Perbedaan"
                    dataKey="persentase"
                    stroke="#4f46e5"
                    fill="#6366f1"
                    fillOpacity={0.45}
                  />
                  <Tooltip content={<CustomRadarTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Linguistic Category Legend & Permendikbud Threshold Explanation */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
        <div className="flex items-center justify-between mb-2.5">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-indigo-600" />
            <span>Pedoman Klasifikasi Skala Dialektometri Leksikal (Badan Pengembangan & Pembinaan Bahasa)</span>
          </span>
          <span className="text-[11px] font-mono text-slate-500">Rumus: d = (s / n) × 100%</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
          <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-emerald-200 shadow-2xs">
            <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-emerald-900">≤ 20% Tidak Berbeda</div>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                Masih dalam satu variasi atau wicara yang sama.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-sky-200 shadow-2xs">
            <span className="w-3.5 h-3.5 rounded-sm bg-sky-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sky-900">21% – 30% Perbedaan Wicara</div>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                Perbedaan wicara (speech difference).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-amber-200 shadow-2xs">
            <span className="w-3.5 h-3.5 rounded-sm bg-amber-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-900">31% – 50% Perbedaan Subdialek</div>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                Perbedaan subdialek dalam satu dialek yang sama.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-orange-200 shadow-2xs">
            <span className="w-3.5 h-3.5 rounded-sm bg-orange-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-orange-900">51% – 80% Perbedaan Dialek</div>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                Perbedaan dialek (berbeda dialek).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-rose-200 shadow-2xs">
            <span className="w-3.5 h-3.5 rounded-sm bg-rose-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-rose-900">81% – 100% Perbedaan Bahasa</div>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                Perbedaan bahasa (berbeda bahasa).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DialektometriChart;
