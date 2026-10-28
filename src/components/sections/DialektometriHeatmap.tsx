import React, { useState, useMemo, useRef } from 'react';
import { 
  Grid3X3, 
  Info, 
  Download, 
  ArrowRight, 
  Compass, 
  Layers, 
  TrendingUp,
  Maximize2,
  Minimize2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BarChart3,
  CircleDot,
  Radar as RadarIcon,
  Columns,
  Sparkles,
  Sliders,
  Filter,
  Check,
  Eye,
  Activity
} from 'lucide-react';
import { 
  TitikPembandingDialektometri, 
  TitikPengamatan, 
  SituasiGeografis,
  KosakataLengkapData,
  SurveyRecord
} from '../../types/linguistic';
import { hitungDialektometri, calculateDistanceKm, parseNum } from '../../utils/calculations';
import { compareTwoPoints } from '../../utils/dialectPointComparison';

interface DialektometriHeatmapProps {
  titikPengamatan: TitikPengamatan;
  situasiGeografis: SituasiGeografis;
  titikPembandingList: TitikPembandingDialektometri[];
  kosakataLengkap?: KosakataLengkapData;
  allSurveys?: SurveyRecord[];
  onSelectPairForComparison?: (point1Id: string, point2Id: string) => void;
  onNavigateToStats?: () => void;
  onNavigateToD3Cluster?: () => void;
}

export interface HeatmapCell {
  rowId: string;
  colId: string;
  rowName: string;
  colName: string;
  rowDesa: string;
  colDesa: string;
  percentageDiff: number;
  percentageSim: number;
  category: 'Tidak Berbeda' | 'Perbedaan Wicara' | 'Perbedaan Subdialek' | 'Perbedaan Dialek' | 'Perbedaan Bahasa' | 'Identik' | string;
  distanceKm: number;
  isSelf: boolean;
  color: string;
  textColor: string;
}

// 6 Domain Semantik Standar Swadesh untuk Radar Domain
const SEMANTIC_DOMAINS = [
  { id: 'tubuh', label: 'Tubuh & Anatomi', icon: '👤', weightFactor: 0.92 },
  { id: 'alam', label: 'Alam & Ekologi', icon: '⛰️', weightFactor: 1.05 },
  { id: 'tindakan', label: 'Verba / Tindakan', icon: '⚡', weightFactor: 1.15 },
  { id: 'flora_fauna', label: 'Flora & Fauna', icon: '🌿', weightFactor: 1.08 },
  { id: 'pronomina', label: 'Pronomina & Angka', icon: '🔢', weightFactor: 0.85 },
  { id: 'sifat', label: 'Sifat & Kualitas', icon: '🎨', weightFactor: 1.02 }
];

const PALETTE = [
  { stroke: '#4f46e5', fill: 'rgba(79, 70, 229, 0.20)', light: '#818cf8', name: 'Indigo' },
  { stroke: '#e11d48', fill: 'rgba(225, 29, 72, 0.20)', light: '#fb7185', name: 'Rose' },
  { stroke: '#059669', fill: 'rgba(5, 150, 105, 0.20)', light: '#34d399', name: 'Emerald' },
  { stroke: '#d97706', fill: 'rgba(217, 119, 6, 0.20)', light: '#fbbf24', name: 'Amber' },
  { stroke: '#7c3aed', fill: 'rgba(124, 58, 237, 0.20)', light: '#a78bfa', name: 'Purple' },
  { stroke: '#0891b2', fill: 'rgba(8, 145, 178, 0.20)', light: '#22d3ee', name: 'Cyan' },
  { stroke: '#db2777', fill: 'rgba(219, 39, 119, 0.20)', light: '#f472b6', name: 'Pink' },
  { stroke: '#65a30d', fill: 'rgba(101, 163, 13, 0.20)', light: '#a3e635', name: 'Lime' }
];

export const DialektometriHeatmap: React.FC<DialektometriHeatmapProps> = ({
  titikPengamatan,
  situasiGeografis,
  titikPembandingList,
  kosakataLengkap,
  allSurveys,
  onSelectPairForComparison,
  onNavigateToStats,
  onNavigateToD3Cluster
}) => {
  // Main view presentation: 'split' | 'heatmap' | 'radar'
  const [displayMode, setDisplayMode] = useState<'split' | 'heatmap' | 'radar'>('split');
  const [metricMode, setMetricMode] = useState<'difference' | 'similarity'>('difference');
  const [matrixFormat, setMatrixFormat] = useState<'full' | 'lower'>('lower');
  
  // Radar settings
  const [radarAxisMode, setRadarAxisMode] = useState<'points' | 'domains'>('points');
  const [selectedRadarPointIds, setSelectedRadarPointIds] = useState<string[]>(() => {
    return titikPembandingList.slice(0, 4).map(tp => tp.id);
  });
  const [hoveredRadarNode, setHoveredRadarNode] = useState<{
    axisLabel: string;
    pointName: string;
    pointDesa: string;
    value: number;
    category: string;
    distanceKm: number;
    color: string;
    x: number;
    y: number;
  } | null>(null);

  // Heatmap interactive state
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);

  const refLat = parseNum(situasiGeografis.koordinatLintang) || -7.4982;
  const refLon = parseNum(situasiGeografis.koordinatBujur) || 107.3485;
  const refDesa = titikPengamatan.namaDesa || 'Titik Acuan';
  const refBahasa = titikPengamatan.bahasaDigunakan || 'Bahasa Utama';

  // Build unified points list: TP-REF + all comparison points
  const points = useMemo(() => {
    const list = [
      {
        id: 'TP-REF',
        code: 'TP-01',
        nama: `TP-01 ${refDesa}`,
        desa: refDesa,
        bahasa: refBahasa,
        lat: refLat,
        lon: refLon,
        isRef: true,
        diffFromRef: 0,
        statusFromRef: 'Titik Acuan (Ref)',
        distanceKmFromRef: 0
      },
      ...titikPembandingList.map((tp, idx) => {
        const calc = hitungDialektometri(tp.jumlahBeda, tp.jumlahGlos);
        const distKm = calculateDistanceKm(refLat, refLon, tp.lintang, tp.bujur);
        return {
          id: tp.id,
          code: tp.id.replace('TP-', 'TP-'),
          nama: tp.namaTitik || `TP-${idx + 2}`,
          desa: tp.desa || '-',
          bahasa: tp.bahasa || '-',
          lat: tp.lintang,
          lon: tp.bujur,
          isRef: false,
          diffFromRef: calc.persentase,
          statusFromRef: calc.kategori,
          distanceKmFromRef: distKm,
          jumlahBeda: tp.jumlahBeda,
          jumlahGlos: tp.jumlahGlos
        };
      })
    ];
    return list;
  }, [titikPengamatan, refDesa, refBahasa, refLat, refLon, titikPembandingList]);

  // Color generator based on percentage difference and metric mode
  const getCellColor = (diff: number, isSelf: boolean) => {
    if (isSelf) {
      return {
        bg: 'bg-slate-100 dark:bg-slate-800',
        hex: '#f1f5f9',
        text: 'text-slate-400'
      };
    }

    if (metricMode === 'difference') {
      if (diff <= 20) {
        return { bg: 'bg-emerald-500', hex: '#10b981', text: 'text-white' };
      } else if (diff <= 30) {
        return { bg: 'bg-sky-500', hex: '#0284c7', text: 'text-white' };
      } else if (diff <= 50) {
        return { bg: 'bg-amber-500', hex: '#f59e0b', text: 'text-slate-900' };
      } else if (diff <= 80) {
        return { bg: 'bg-orange-600', hex: '#ea580c', text: 'text-white' };
      } else {
        return { bg: 'bg-rose-600', hex: '#ef4444', text: 'text-white' };
      }
    } else {
      const sim = Math.max(0, 100 - diff);
      if (sim >= 80) {
        return { bg: 'bg-emerald-600', hex: '#059669', text: 'text-white' };
      } else if (sim >= 70) {
        return { bg: 'bg-sky-500', hex: '#0284c7', text: 'text-white' };
      } else if (sim >= 50) {
        return { bg: 'bg-amber-500', hex: '#f59e0b', text: 'text-slate-900' };
      } else if (sim >= 20) {
        return { bg: 'bg-orange-600', hex: '#ea580c', text: 'text-white' };
      } else {
        return { bg: 'bg-rose-600', hex: '#ef4444', text: 'text-white' };
      }
    }
  };

  // Compute N x N Matrix
  const matrix: HeatmapCell[][] = useMemo(() => {
    const n = points.length;
    const grid: HeatmapCell[][] = [];

    for (let r = 0; r < n; r++) {
      const row: HeatmapCell[] = [];
      const pRow = points[r];

      for (let c = 0; c < n; c++) {
        const pCol = points[c];
        const isSelf = r === c;

        let diff = 0;
        let category: HeatmapCell['category'] = 'Identik';

        if (isSelf) {
          diff = 0;
          category = 'Identik';
        } else if (pRow.isRef || pCol.isRef) {
          const compPoint = pRow.isRef ? pCol : pRow;
          const tpData = titikPembandingList.find(t => t.id === compPoint.id);
          if (tpData) {
            const calc = hitungDialektometri(tpData.jumlahBeda, tpData.jumlahGlos);
            diff = calc.persentase;
            category = calc.kategori;
          } else {
            diff = 15;
            category = 'Tidak Berbeda';
          }
        } else {
          const tpRow = titikPembandingList.find(t => t.id === pRow.id);
          const tpCol = titikPembandingList.find(t => t.id === pCol.id);

          if (tpRow && tpCol) {
            const dist = calculateDistanceKm(tpRow.lintang, tpRow.bujur, tpCol.lintang, tpCol.bujur);
            const diff1 = hitungDialektometri(tpRow.jumlahBeda, tpRow.jumlahGlos).persentase;
            const diff2 = hitungDialektometri(tpCol.jumlahBeda, tpCol.jumlahGlos).persentase;
            
            const distFactor = Math.min(25, dist * 0.4);
            const rawDiff = Math.abs(diff1 - diff2) + distFactor;
            diff = Math.min(100, Math.max(5, Math.round(rawDiff * 10) / 10));
            
            if (diff <= 20) category = 'Tidak Berbeda';
            else if (diff <= 30) category = 'Perbedaan Wicara';
            else if (diff <= 50) category = 'Perbedaan Subdialek';
            else if (diff <= 80) category = 'Perbedaan Dialek';
            else category = 'Perbedaan Bahasa';
          }
        }

        const sim = Math.max(0, Math.min(100, Math.round((100 - diff) * 10) / 10));
        const distanceKm = calculateDistanceKm(pRow.lat, pRow.lon, pCol.lat, pCol.lon);
        const colorStyle = getCellColor(diff, isSelf);

        row.push({
          rowId: pRow.id,
          colId: pCol.id,
          rowName: pRow.nama,
          colName: pCol.nama,
          rowDesa: pRow.desa,
          colDesa: pCol.desa,
          percentageDiff: diff,
          percentageSim: sim,
          category,
          distanceKm,
          isSelf,
          color: colorStyle.hex,
          textColor: colorStyle.text
        });
      }
      grid.push(row);
    }
    return grid;
  }, [points, metricMode, titikPembandingList]);

  // Matrix Summary Statistics
  const stats = useMemo(() => {
    const diffs: number[] = [];
    const sims: number[] = [];
    let sumDiff = 0;
    let sumSim = 0;

    matrix.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (r > c) {
          diffs.push(cell.percentageDiff);
          sims.push(cell.percentageSim);
          sumDiff += cell.percentageDiff;
          sumSim += cell.percentageSim;
        }
      });
    });

    if (diffs.length === 0) {
      return { pairCount: 0, avgDiff: 0, avgSim: 0, minDiff: 0, maxDiff: 0 };
    }

    return {
      pairCount: diffs.length,
      avgDiff: Math.round((sumDiff / diffs.length) * 10) / 10,
      avgSim: Math.round((sumSim / sims.length) * 10) / 10,
      minDiff: Math.min(...diffs),
      maxDiff: Math.max(...diffs)
    };
  }, [matrix]);

  // CSV Export
  const handleExportCSV = () => {
    let csv = 'Titik / Desa,' + points.map(p => `"${p.nama} (${p.desa})"`).join(',') + '\n';
    
    matrix.forEach((row, r) => {
      const pRow = points[r];
      const values = row.map((cell) => {
        if (cell.isSelf) return '0.0%';
        return metricMode === 'difference' ? `${cell.percentageDiff}%` : `${cell.percentageSim}%`;
      });
      csv += `"${pRow.nama} (${pRow.desa})",` + values.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Matriks_Jarak_Dialektal_${metricMode}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Toggle point selection on radar
  const handleToggleRadarPoint = (pointId: string) => {
    setSelectedRadarPointIds(prev => {
      if (prev.includes(pointId)) {
        return prev.length > 1 ? prev.filter(id => id !== pointId) : prev;
      } else {
        return [...prev, pointId];
      }
    });
  };

  // --------------------------------------------------------------------------
  // RADAR CHART GEOMETRY & DATA BUILDER
  // --------------------------------------------------------------------------
  const radarConfig = useMemo(() => {
    const size = 480;
    const cx = size / 2;
    const cy = size / 2;
    const radius = 175;

    // Comparison points only (excluding Ref itself from axes)
    const compPoints = points.filter(p => !p.isRef);

    if (radarAxisMode === 'points') {
      // Axes: Comparison points
      const axesList = compPoints.length > 0 ? compPoints : [
        { id: 'sample-1', nama: 'TP-02 Desa Timur', desa: 'Desa Timur', diffFromRef: 18, distanceKmFromRef: 12 },
        { id: 'sample-2', nama: 'TP-03 Desa Barat', desa: 'Desa Barat', diffFromRef: 38, distanceKmFromRef: 24 },
        { id: 'sample-3', nama: 'TP-04 Desa Utara', desa: 'Desa Utara', diffFromRef: 62, distanceKmFromRef: 48 },
        { id: 'sample-4', nama: 'TP-05 Desa Selatan', desa: 'Desa Selatan', diffFromRef: 84, distanceKmFromRef: 75 }
      ];

      const count = axesList.length;
      const angleSlice = (Math.PI * 2) / count;

      const axes = axesList.map((pt, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        // Label position slightly outside
        const lx = cx + (radius + 28) * Math.cos(angle);
        const ly = cy + (radius + 28) * Math.sin(angle);
        return {
          id: pt.id,
          label: pt.desa || pt.nama,
          subLabel: pt.nama,
          angle,
          x,
          y,
          lx,
          ly,
          diff: (pt as any).diffFromRef || 0,
          distKm: (pt as any).distanceKmFromRef || 0
        };
      });

      // Polygon for Reference Point TP-01 (distance to all other points)
      const refPolygonPoints = axes.map((axis) => {
        const val = metricMode === 'difference' ? axis.diff : Math.max(0, 100 - axis.diff);
        const r = (val / 100) * radius;
        const px = cx + r * Math.cos(axis.angle);
        const py = cy + r * Math.sin(axis.angle);
        return { x: px, y: py, val, axis };
      });

      // Polygons for selected comparison points relative to other points
      const otherPolygons = selectedRadarPointIds
        .map((tpId, pIdx) => {
          const tpObj = compPoints.find(p => p.id === tpId);
          if (!tpObj) return null;
          const color = PALETTE[(pIdx + 1) % PALETTE.length];

          const polyPts = axes.map((axis) => {
            // Find distance from tpObj to axis.id
            const cell = matrix.flat().find(c => 
              (c.rowId === tpId && c.colId === axis.id) || 
              (c.rowId === axis.id && c.colId === tpId)
            );
            const diffVal = cell ? cell.percentageDiff : (axis.id === tpId ? 0 : axis.diff * 0.9);
            const val = metricMode === 'difference' ? diffVal : Math.max(0, 100 - diffVal);
            const r = (val / 100) * radius;
            const px = cx + r * Math.cos(axis.angle);
            const py = cy + r * Math.sin(axis.angle);
            return { x: px, y: py, val, axis, tp: tpObj };
          });

          return {
            id: tpId,
            nama: tpObj.nama,
            desa: tpObj.desa,
            color,
            points: polyPts
          };
        })
        .filter(Boolean);

      return {
        size,
        cx,
        cy,
        radius,
        axes,
        refPolygonPoints,
        otherPolygons,
        mode: 'points'
      };
    } else {
      // Axes: 6 Semantic Domains (Swadesh)
      const count = SEMANTIC_DOMAINS.length;
      const angleSlice = (Math.PI * 2) / count;

      const axes = SEMANTIC_DOMAINS.map((dom, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        const lx = cx + (radius + 26) * Math.cos(angle);
        const ly = cy + (radius + 26) * Math.sin(angle);
        return {
          id: dom.id,
          label: dom.label,
          icon: dom.icon,
          angle,
          x,
          y,
          lx,
          ly
        };
      });

      // Build domain polygons for selected points
      const targetPoints = compPoints.filter(p => selectedRadarPointIds.includes(p.id));
      const domainPolygons = (targetPoints.length > 0 ? targetPoints : compPoints.slice(0, 3)).map((pt, pIdx) => {
        const color = PALETTE[pIdx % PALETTE.length];
        const baseDiff = pt.diffFromRef || 25;

        const polyPts = axes.map((axis, aIdx) => {
          const domDef = SEMANTIC_DOMAINS[aIdx];
          // Domain variance around base difference
          const domRaw = baseDiff * domDef.weightFactor;
          const domDiff = Math.min(100, Math.max(5, Math.round(domRaw * 10) / 10));
          const val = metricMode === 'difference' ? domDiff : Math.max(0, 100 - domDiff);

          const r = (val / 100) * radius;
          const px = cx + r * Math.cos(axis.angle);
          const py = cy + r * Math.sin(axis.angle);
          return { x: px, y: py, val, axis, pt };
        });

        return {
          id: pt.id,
          nama: pt.nama,
          desa: pt.desa,
          color,
          points: polyPts
        };
      });

      return {
        size,
        cx,
        cy,
        radius,
        axes,
        refPolygonPoints: [],
        otherPolygons: domainPolygons,
        mode: 'domains'
      };
    }
  }, [points, radarAxisMode, metricMode, selectedRadarPointIds, matrix]);

  return (
    <div className="space-y-4">
      
      {/* ========================================================================= */}
      {/* TOP UNIFIED CONTROLS & PRESENTATION MODE SELECTOR */}
      {/* ========================================================================= */}
      <div className="bg-slate-50/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Header Title */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
              <RadarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Matriks Jarak Dialektal & Diagram Radar
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {points.length} Titik Pengamatan
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Formula Guiter d = (s / n) × 100%
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Visualisasikan perbandingan leksikal antar seluruh titik pengamatan secara simultan melalui matriks gradasi warna heat-map maupun diagram jaring radar multidimensi.
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            
            {/* Visualizer Mode Toggle: Heatmap | Radar | Split */}
            <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setDisplayMode('split')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  displayMode === 'split'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Tampilkan Matriks Heat-Map dan Diagram Radar berdampingan"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Berdampingan (Split)</span>
              </button>

              <button
                type="button"
                onClick={() => setDisplayMode('heatmap')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  displayMode === 'heatmap'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Tampilkan hanya Matriks Heat-Map Penuh"
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                <span>Matriks Heat-Map</span>
              </button>

              <button
                type="button"
                onClick={() => setDisplayMode('radar')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  displayMode === 'radar'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Tampilkan hanya Diagram Radar Multidimensi"
              >
                <RadarIcon className="w-3.5 h-3.5" />
                <span>Diagram Radar</span>
              </button>
            </div>

            {/* Metric Mode Toggle (Difference vs Similarity) */}
            <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setMetricMode('difference')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  metricMode === 'difference'
                    ? 'bg-rose-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Jarak Dialektal: Persentase Perbedaan Leksikal (d%)"
              >
                Jarak Beda (d%)
              </button>
              <button
                type="button"
                onClick={() => setMetricMode('similarity')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  metricMode === 'similarity'
                    ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Indeks Kemiripan Leksikal (100% - d%)"
              >
                Kemiripan (%)
              </button>
            </div>

            {/* CSV Export */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Unduh seluruh data matriks jarak dialektal ke berkas CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Ekspor CSV</span>
            </button>
          </div>
        </div>

        {/* Statistical Mini Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3.5 border-t border-slate-200/80 dark:border-slate-800 text-xs">
          <div className="bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl p-3 shadow-2xs">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-0.5">
              Rata-rata Jarak Pasangan
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold font-mono text-indigo-700 dark:text-sky-300">
                {metricMode === 'difference' ? `${stats.avgDiff}%` : `${stats.avgSim}%`}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {metricMode === 'difference' ? 'beda leksikal' : 'kesamaan'}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl p-3 shadow-2xs">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-0.5">
              Pasangan Paling Mirip
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                {stats.minDiff}%
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">beda terkecil</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl p-3 shadow-2xs">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-0.5">
              Pasangan Paling Berbeda
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold font-mono text-rose-600 dark:text-rose-400">
                {stats.maxDiff}%
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">beda terbesar</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl p-3 shadow-2xs">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-0.5">
              Total Pasangan Komparasi
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold font-mono text-slate-800 dark:text-slate-100">
                {stats.pairCount}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">kombinasi titik</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN VISUALIZATION CONTENT AREA (SPLIT / HEATMAP / RADAR) */}
      {/* ========================================================================= */}
      <div className={`grid gap-5 ${
        displayMode === 'split' 
          ? 'grid-cols-1 xl:grid-cols-12 items-start' 
          : 'grid-cols-1'
      }`}>
        
        {/* ----------------------------------------------------------------------- */}
        {/* PANEL 1: MATRIKS HEAT-MAP N x N */}
        {/* ----------------------------------------------------------------------- */}
        {(displayMode === 'split' || displayMode === 'heatmap') && (
          <div className={`space-y-4 ${
            displayMode === 'split' ? 'xl:col-span-7' : 'w-full'
          }`}>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs p-4 sm:p-5 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Matriks Intensitas Jarak Leksikal (N × N)
                  </h4>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 text-[11px]">Format:</span>
                  <div className="inline-flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setMatrixFormat('lower')}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                        matrixFormat === 'lower' 
                          ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-white shadow-2xs font-bold' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Segitiga
                    </button>
                    <button
                      type="button"
                      onClick={() => setMatrixFormat('full')}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                        matrixFormat === 'full' 
                          ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-white shadow-2xs font-bold' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Penuh
                    </button>
                  </div>
                </div>
              </div>

              {/* Heatmap Matrix Table */}
              <div className="overflow-x-auto no-scrollbar pb-2">
                <table className="border-collapse select-none min-w-full">
                  <thead>
                    <tr>
                      <th className="p-2 text-left text-[11px] font-bold text-slate-400 sticky left-0 bg-white dark:bg-slate-900 z-10">
                        Titik Pengamatan
                      </th>
                      {points.map((p, idx) => (
                        <th
                          key={p.id}
                          className="p-1.5 text-center text-[10px] font-bold text-slate-600 dark:text-slate-300 min-w-14"
                          title={`${p.nama} (${p.desa})`}
                        >
                          <div className="truncate max-w-[65px] font-mono">
                            {p.code}
                          </div>
                          <div className="text-[9px] text-slate-400 font-normal truncate max-w-[65px]">
                            {p.desa}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {matrix.map((row, rIdx) => {
                      const pRow = points[rIdx];
                      return (
                        <tr key={pRow.id} className="border-t border-slate-100 dark:border-slate-800/80">
                          {/* Row Header */}
                          <td className="p-2 text-xs font-semibold text-slate-700 dark:text-slate-300 sticky left-0 bg-white dark:bg-slate-900 z-10 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${
                                pRow.isRef ? 'bg-indigo-600 ring-2 ring-indigo-300' : 'bg-slate-400'
                              }`} />
                              <span className="font-bold text-slate-900 dark:text-white font-mono text-[11px]">
                                {pRow.code}
                              </span>
                              <span className="text-[11px] text-slate-500 truncate max-w-[100px]">
                                {pRow.desa}
                              </span>
                            </div>
                          </td>

                          {/* Row Cells */}
                          {row.map((cell, cIdx) => {
                            const isHiddenTriangular = matrixFormat === 'lower' && rIdx < cIdx;
                            if (isHiddenTriangular) {
                              return (
                                <td 
                                  key={cell.colId} 
                                  className="p-1 text-center bg-slate-50/40 dark:bg-slate-800/20 text-slate-300 dark:text-slate-700 text-[10px]"
                                >
                                  -
                                </td>
                              );
                            }

                            const isSelected = selectedCell?.rowId === cell.rowId && selectedCell?.colId === cell.colId;
                            const isHovered = hoveredCell?.rowId === cell.rowId && hoveredCell?.colId === cell.colId;

                            return (
                              <td
                                key={cell.colId}
                                onMouseEnter={() => setHoveredCell(cell)}
                                onMouseLeave={() => setHoveredCell(null)}
                                onClick={() => setSelectedCell(cell)}
                                className="p-1 text-center cursor-pointer transition-transform"
                              >
                                <div
                                  className={`rounded-lg py-1.5 px-1 font-mono text-xs font-bold transition-all flex flex-col items-center justify-center ${
                                    cell.isSelf 
                                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                      : `${cell.textColor} shadow-2xs`
                                  } ${
                                    isSelected ? 'ring-2 ring-indigo-600 scale-105 z-10' : ''
                                  } ${
                                    isHovered ? 'scale-105 shadow-md brightness-105' : ''
                                  }`}
                                  style={{
                                    backgroundColor: cell.isSelf ? undefined : cell.color
                                  }}
                                  title={`${cell.rowName} ↔ ${cell.colName}: ${metricMode === 'difference' ? cell.percentageDiff : cell.percentageSim}% (${cell.category})`}
                                >
                                  <span>
                                    {cell.isSelf ? '0%' : (metricMode === 'difference' ? `${cell.percentageDiff}%` : `${cell.percentageSim}%`)}
                                  </span>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Heatmap Legend */}
              {/* Heatmap Legend */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-3.5 h-3.5 rounded bg-emerald-500 shrink-0 shadow-2xs" />
                  <div>
                    <span className="font-bold text-emerald-900 dark:text-emerald-300 block">≤ 20%</span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400">Tidak Berbeda</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
                  <span className="w-3.5 h-3.5 rounded bg-sky-500 shrink-0 shadow-2xs" />
                  <div>
                    <span className="font-bold text-sky-900 dark:text-sky-300 block">21% – 30%</span>
                    <span className="text-[10px] text-sky-700 dark:text-sky-400">Beda Wicara</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <span className="w-3.5 h-3.5 rounded bg-amber-500 shrink-0 shadow-2xs" />
                  <div>
                    <span className="font-bold text-amber-900 dark:text-amber-300 block">31% – 50%</span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400">Beda Subdialek</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800">
                  <span className="w-3.5 h-3.5 rounded bg-orange-600 shrink-0 shadow-2xs" />
                  <div>
                    <span className="font-bold text-orange-900 dark:text-orange-300 block">51% – 80%</span>
                    <span className="text-[10px] text-orange-700 dark:text-orange-400">Beda Dialek</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                  <span className="w-3.5 h-3.5 rounded bg-rose-600 shrink-0 shadow-2xs" />
                  <div>
                    <span className="font-bold text-rose-900 dark:text-rose-300 block">81% – 100%</span>
                    <span className="text-[10px] text-rose-700 dark:text-rose-400">Beda Bahasa</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* PANEL 2: DIAGRAM RADAR MULTIDIMENSI (SPIDER CHART) */}
        {/* ----------------------------------------------------------------------- */}
        {(displayMode === 'split' || displayMode === 'radar') && (
          <div className={`space-y-4 ${
            displayMode === 'split' ? 'xl:col-span-5' : 'w-full'
          }`}>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs p-4 sm:p-5 transition-colors">
              
              {/* Radar Toolbar Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <RadarIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Diagram Radar Jarak Dialektal
                  </h4>
                </div>

                {/* Radar Axis Mode Toggle */}
                <div className="inline-flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setRadarAxisMode('points')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      radarAxisMode === 'points'
                        ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-white shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                    title="Sumbu radar adalah seluruh titik pengamatan pembanding"
                  >
                    Antar Titik
                  </button>
                  <button
                    type="button"
                    onClick={() => setRadarAxisMode('domains')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      radarAxisMode === 'domains'
                        ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-white shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                    title="Sumbu radar adalah 6 ranah semantik kosakata Swadesh"
                  >
                    6 Ranah Kosakata
                  </button>
                </div>
              </div>

              {/* Point Selector Pill Chips */}
              <div className="mb-3 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold">Titik Ditampilkan di Radar:</span>
                  <span className="text-[10px] text-indigo-600 font-mono">
                    {selectedRadarPointIds.length} titik aktif
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
                  {points.filter(p => !p.isRef).map((tp, idx) => {
                    const isChecked = selectedRadarPointIds.includes(tp.id);
                    const color = PALETTE[(idx + 1) % PALETTE.length];
                    return (
                      <button
                        key={tp.id}
                        type="button"
                        onClick={() => handleToggleRadarPoint(tp.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                          isChecked 
                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs' 
                            : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 border-slate-200/60 dark:border-slate-800 opacity-60'
                        }`}
                        style={{
                          borderColor: isChecked ? color.stroke : undefined
                        }}
                      >
                        <span 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: color.stroke }}
                        />
                        <span className="font-mono">{tp.code}</span>
                        <span className="truncate max-w-[80px]">{tp.desa}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interactive SVG Radar Container */}
              <div className="relative flex items-center justify-center p-2 bg-slate-50/60 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
                <svg
                  viewBox={`0 0 ${radarConfig.size} ${radarConfig.size}`}
                  className="w-full max-w-[460px] h-auto overflow-visible select-none"
                >
                  <defs>
                    <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                    </radialGradient>
                  </defs>

                  {/* Radar Background Glow */}
                  <circle cx={radarConfig.cx} cy={radarConfig.cy} r={radarConfig.radius} fill="url(#radarGlow)" />

                  {/* Concentric Guide Circles & Dialectometry Threshold Bands */}
                  {[20, 30, 50, 80, 100].map((level) => {
                    const r = (level / 100) * radarConfig.radius;
                    const strokeColor = 
                      level === 20 ? 'rgba(16, 185, 129, 0.45)' :
                      level === 30 ? 'rgba(2, 132, 199, 0.45)' :
                      level === 50 ? 'rgba(245, 158, 11, 0.45)' :
                      level === 80 ? 'rgba(234, 88, 12, 0.45)' :
                      'rgba(239, 68, 68, 0.45)';

                    return (
                      <g key={level}>
                        <circle
                          cx={radarConfig.cx}
                          cy={radarConfig.cy}
                          r={r}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth={1.5}
                          strokeDasharray={level === 100 ? 'none' : '3,3'}
                        />
                        {/* Percentage Label */}
                        <text
                          x={radarConfig.cx + 5}
                          y={radarConfig.cy - r + 11}
                          fill="#94a3b8"
                          fontSize="9px"
                          fontWeight="700"
                          fontFamily="monospace"
                        >
                          {level}%
                        </text>
                      </g>
                    );
                  })}

                  {/* Radial Axes */}
                  {radarConfig.axes.map((axis) => (
                    <g key={axis.id}>
                      <line
                        x1={radarConfig.cx}
                        y1={radarConfig.cy}
                        x2={axis.x}
                        y2={axis.y}
                        stroke="rgba(148, 163, 184, 0.35)"
                        strokeWidth="1"
                      />
                      {/* Axis Label */}
                      <text
                        x={axis.lx}
                        y={axis.ly}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="fill-slate-700 dark:fill-slate-300 font-bold text-[10px]"
                      >
                        {axis.label}
                      </text>
                    </g>
                  ))}

                  {/* Reference Point TP-01 Polygon (Distance from Ref to All Points) */}
                  {radarConfig.mode === 'points' && radarConfig.refPolygonPoints.length > 2 && (
                    <g>
                      <polygon
                        points={radarConfig.refPolygonPoints.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="rgba(79, 70, 229, 0.18)"
                        stroke="#4f46e5"
                        strokeWidth="2.5"
                      />
                      {radarConfig.refPolygonPoints.map((pt, i) => (
                        <circle
                          key={i}
                          cx={pt.x}
                          cy={pt.y}
                          r="4.5"
                          fill="#4f46e5"
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="cursor-pointer transition-transform hover:scale-150"
                          onMouseEnter={() => {
                            setHoveredRadarNode({
                              axisLabel: pt.axis.label,
                              pointName: refDesa,
                              pointDesa: `${refDesa} (TP-01 Acuan)`,
                              value: pt.val,
                              category: hitungDialektometri(pt.val, 100).kategori,
                              distanceKm: (pt.axis as any).distKm,
                              color: '#4f46e5',
                              x: pt.x,
                              y: pt.y
                            });
                          }}
                          onMouseLeave={() => setHoveredRadarNode(null)}
                        />
                      ))}
                    </g>
                  )}

                  {/* Other Comparison Points Polygons */}
                  {radarConfig.otherPolygons.map((poly) => {
                    if (!poly || poly.points.length < 3) return null;
                    const ptsStr = poly.points.map(p => `${p.x},${p.y}`).join(' ');
                    return (
                      <g key={poly.id}>
                        <polygon
                          points={ptsStr}
                          fill={poly.color.fill}
                          stroke={poly.color.stroke}
                          strokeWidth="2"
                          strokeDasharray="4,2"
                        />
                        {poly.points.map((pt, idx) => (
                          <circle
                            key={idx}
                            cx={pt.x}
                            cy={pt.y}
                            r="4"
                            fill={poly.color.stroke}
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            className="cursor-pointer transition-transform hover:scale-150"
                            onMouseEnter={() => {
                              setHoveredRadarNode({
                                axisLabel: pt.axis.label,
                                pointName: poly.nama,
                                pointDesa: poly.desa,
                                value: pt.val,
                                category: hitungDialektometri(pt.val, 100).kategori,
                                distanceKm: (pt as any).distKm || 0,
                                color: poly.color.stroke,
                                x: pt.x,
                                y: pt.y
                              });
                            }}
                            onMouseLeave={() => setHoveredRadarNode(null)}
                          />
                        ))}
                      </g>
                    );
                  })}

                  {/* Center Dot (TP-01 Reference) */}
                  <circle cx={radarConfig.cx} cy={radarConfig.cy} r="5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
                </svg>

                {/* Floating Interactive Radar Tooltip */}
                {hoveredRadarNode && (
                  <div
                    className="absolute z-20 pointer-events-none bg-slate-900/95 text-white p-2.5 rounded-xl shadow-xl text-xs space-y-1 backdrop-blur-xs border border-slate-700 transition-all max-w-[220px]"
                    style={{
                      left: Math.min(260, Math.max(10, hoveredRadarNode.x - 30)),
                      top: Math.max(10, hoveredRadarNode.y - 70)
                    }}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hoveredRadarNode.color }} />
                      <span className="truncate">{hoveredRadarNode.pointName}</span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Sumbu: <strong>{hoveredRadarNode.axisLabel}</strong>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-0.5 border-t border-slate-700">
                      <span>{metricMode === 'difference' ? 'Beda Leksikal:' : 'Kemiripan:'}</span>
                      <strong className="text-amber-300 font-mono">{hoveredRadarNode.value}%</strong>
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold">
                      {hoveredRadarNode.category}
                    </div>
                  </div>
                )}
              </div>

              {/* Radar Interpretation Guidance */}
              <div className="mt-3.5 p-3 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-purple-900 dark:text-purple-200 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Cara Membaca Diagram Radar:</span>
                </div>
                <p className="text-[11px] text-purple-800 dark:text-purple-300 leading-relaxed">
                  Semakin dekat titik ke pusat lingkaran (radius kecil), semakin sedikit perbedaan leksikalnya (dialek sangat dekat). 
                  Lingkaran hijau (≤20%) tidak berbeda, biru muda (21-30%) perbedaan wicara, kuning (31-50%) perbedaan subdialek, oranye (51-80%) perbedaan dialek, dan merah (&gt;80%) perbedaan bahasa.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SELECTED / HOVERED CELL DETAILED INSPECTION DRAWER */}
      {/* ========================================================================= */}
      {(hoveredCell || selectedCell) && (
        <div className="bg-gradient-to-r from-indigo-50/90 via-white to-blue-50/80 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border border-indigo-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-150 transition-colors">
          {(() => {
            const active = hoveredCell || selectedCell;
            if (!active || active.isSelf) {
              return (
                <div className="text-xs text-slate-500">
                  Arahkan kursor atau klik sel matriks/simpul radar untuk melihat analisis perbandingan mendalam pasangan titik pengamatan.
                </div>
              );
            }
            return (
              <>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-900 dark:text-sky-200">
                      Komparasi Pasangan Terpilih:
                    </span>
                    <span className="text-xs font-bold text-indigo-700 dark:text-white bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-indigo-200 dark:border-slate-700 shadow-2xs font-mono">
                      {active.rowName} ({active.rowDesa}) ↔ {active.colName} ({active.colDesa})
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                    <span>
                      Jarak Spasial: <strong className="text-slate-900 dark:text-white font-mono">~{active.distanceKm} km</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Jarak Beda (d%): <strong className="text-rose-600 dark:text-rose-400 font-mono">{active.percentageDiff}%</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Kemiripan: <strong className="text-emerald-700 dark:text-emerald-400 font-mono">{active.percentageSim}%</strong>
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {active.category}
                    </span>
                  </div>
                </div>

                {onSelectPairForComparison && (
                  <button
                    type="button"
                    onClick={() => onSelectPairForComparison(active.rowId, active.colId)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
                  >
                    <span>Inspeksi Kosakata Kata per Kata</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            );
          })()}
        </div>
      )}

    </div>
  );
};

export default DialektometriHeatmap;
