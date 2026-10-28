import React, { useState } from 'react';
import { 
  Network, 
  MapPin, 
  Plus, 
  Trash2, 
  Compass, 
  Calculator, 
  Layers, 
  Info,
  Maximize2,
  BarChart3,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Layers2,
  Activity
} from 'lucide-react';
import { 
  HasilDialektometriData, 
  TitikPembandingDialektometri, 
  TitikPengamatan, 
  SituasiGeografis,
  KosakataLengkapData,
  SurveyRecord
} from '../../types/linguistic';
import { hitungDialektometri, calculateDistanceKm, parseNum } from '../../utils/calculations';
import { compareTwoPoints } from '../../utils/dialectPointComparison';
import { DialektometriChart } from './DialektometriChart';
import { DialektometriHeatmap } from './DialektometriHeatmap';
import { Section16PointComparison } from './Section16PointComparison';
import { InteractiveGeographicMap } from './InteractiveGeographicMap';
import { Section16LinguisticClassification } from './Section16LinguisticClassification';
import { DialektometriD3ClusterRadar } from './DialektometriD3ClusterRadar';
import { Section16Glotokronologi } from './Section16Glotokronologi';
import { DialektometriPhylogeneticTree } from './DialektometriPhylogeneticTree';
import { Section16IsoglosOtomatis } from './Section16IsoglosOtomatis';
import { ArrowLeftRight, Globe, Grid3X3, GitBranch, Radar as RadarIcon, CircleDot, Hourglass, TreePine, Split } from 'lucide-react';

export type DialekVisualizationTab = 
  | 'peta-interaktif' 
  | 'isoglos-otomatis'
  | 'heatmap' 
  | 'heatmap-spasial' 
  | 'd3-klaster' 
  | 'pohon-filogenetik'
  | 'grafik' 
  | 'klasifikasi' 
  | 'komparasi' 
  | 'visualisasi' 
  | 'kalkulator'
  | 'glotokronologi';

interface Section16Props {
  data: HasilDialektometriData;
  titikPengamatan: TitikPengamatan;
  situasiGeografis: SituasiGeografis;
  kosakataLengkap?: KosakataLengkapData;
  allSurveys?: SurveyRecord[];
  activeSurveyId?: string | null;
  onUpdateTitikPembanding: (list: TitikPembandingDialektometri[]) => void;
  onUpdateCatatan: (field: 'catatanIsoglos' | 'kesimpulanGeolinguistik', value: string) => void;
}

export const Section16DialektometriPeta: React.FC<Section16Props> = ({
  data,
  titikPengamatan,
  situasiGeografis,
  kosakataLengkap,
  allSurveys,
  activeSurveyId,
  onUpdateTitikPembanding,
  onUpdateCatatan
}) => {
  const [activeTab, setActiveTab] = useState<DialekVisualizationTab>('peta-interaktif');
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<'geografis' | 'minimalis' | 'isoglos'>('geografis');
  const [calculationFeedback, setCalculationFeedback] = useState<string | null>(null);

  // Automatic Dialectometry Calculation
  const handleAutoCalculateAll = () => {
    let countUpdated = 0;
    const updatedList = data.titikPembandingList.map((tp) => {
      // 1. Check if matching survey exists in allSurveys
      const matchingSurvey = allSurveys?.find(s => 
        s.id !== activeSurveyId && 
        (s.title?.toLowerCase().includes(tp.desa.toLowerCase()) || 
         s.data?.titikPengamatan?.namaDesa?.toLowerCase() === tp.desa.toLowerCase() ||
         s.desa?.toLowerCase() === tp.desa.toLowerCase())
      );

      if (matchingSurvey && matchingSurvey.data?.kosakataLengkap?.swadeshList && kosakataLengkap?.swadeshList) {
        // Real survey-to-survey Swadesh comparison
        let sCount = 0;
        let validGlosCount = 0;
        const activeSwadesh = kosakataLengkap.swadeshList;
        const compSwadesh = matchingSurvey.data.kosakataLengkap.swadeshList;

        compSwadesh.forEach((itemB) => {
          const itemA = activeSwadesh.find(a => a.id === itemB.id || a.glosIndonesia.toLowerCase().trim() === itemB.glosIndonesia.toLowerCase().trim());
          if (itemA && itemA.bentukLokal && itemB.bentukLokal) {
            validGlosCount++;
            const wordA = itemA.bentukLokal.toLowerCase().trim();
            const wordB = itemB.bentukLokal.toLowerCase().trim();
            if (wordA !== wordB) {
              sCount++;
            }
          }
        });

        const totalN = validGlosCount > 0 ? validGlosCount : 200;
        const calc = hitungDialektometri(sCount, totalN);
        countUpdated++;
        return {
          ...tp,
          jumlahBeda: sCount,
          jumlahGlos: totalN,
          persentaseBeda: calc.persentase,
          statusHubungan: calc.kategori
        };
      } else {
        // Fallback to comparative corpus comparison utility
        const stats = compareTwoPoints(
          'TP-REF',
          titikPengamatan.namaDesa ? `Desa ${titikPengamatan.namaDesa} (Ref)` : 'Titik Acuan (Ref)',
          tp.id,
          tp.desa ? `Desa ${tp.desa}` : (tp.namaTitik || tp.id),
          kosakataLengkap,
          data.titikPembandingList
        );

        if (stats && stats.totalTested > 0) {
          const sCount = Math.round(stats.effectiveDifferenceCount);
          const totalN = stats.totalTested;
          const calc = hitungDialektometri(sCount, totalN);
          countUpdated++;
          return {
            ...tp,
            jumlahBeda: sCount,
            jumlahGlos: totalN,
            persentaseBeda: calc.persentase,
            statusHubungan: calc.kategori
          };
        }
      }
      return tp;
    });

    onUpdateTitikPembanding(updatedList);
    setCalculationFeedback(`Perhitungan dialektometri otomatis berhasil diperbarui untuk ${updatedList.length} titik pembanding!`);
    setTimeout(() => setCalculationFeedback(null), 4500);
  };

  // Sync other surveys in the system into comparison points list
  const handleSyncSurveysAsComparisonPoints = () => {
    if (!allSurveys || allSurveys.length <= 1) {
      alert('Belum ada survei lain yang tersimpan untuk dijadikan titik pembanding.');
      return;
    }
    const currentDesaNames = new Set(data.titikPembandingList.map(tp => tp.desa.toLowerCase()));
    const newPoints: TitikPembandingDialektometri[] = [];

    allSurveys.forEach((s) => {
      if (s.id === activeSurveyId) return;
      const desaName = s.data?.titikPengamatan?.namaDesa || s.title || 'Desa Pembanding';
      if (!currentDesaNames.has(desaName.toLowerCase())) {
        const lat = parseNum(s.data?.situasiGeografis?.koordinatLintang) || refLat + (Math.random() * 0.1 - 0.05);
        const lon = parseNum(s.data?.situasiGeografis?.koordinatBujur) || refLon + (Math.random() * 0.15 - 0.07);
        const bahasa = s.data?.titikPengamatan?.bahasaDigunakan || s.bahasa || 'Bahasa Daerah';
        
        let sCount = 0;
        let validGlos = 0;
        if (s.data?.kosakataLengkap?.swadeshList && kosakataLengkap?.swadeshList) {
          s.data.kosakataLengkap.swadeshList.forEach(itemB => {
            const itemA = kosakataLengkap.swadeshList.find(a => a.id === itemB.id || a.glosIndonesia.toLowerCase().trim() === itemB.glosIndonesia.toLowerCase().trim());
            if (itemA?.bentukLokal && itemB?.bentukLokal) {
              validGlos++;
              if (itemA.bentukLokal.toLowerCase().trim() !== itemB.bentukLokal.toLowerCase().trim()) {
                sCount++;
              }
            }
          });
        }
        const totalN = validGlos > 0 ? validGlos : 200;
        const calc = hitungDialektometri(sCount, totalN);

        newPoints.push({
          id: `TP-SURVEY-${s.id.slice(-4)}`,
          namaTitik: `TP ${desaName}`,
          desa: desaName,
          bahasa,
          lintang: lat,
          bujur: lon,
          jumlahBeda: sCount,
          jumlahGlos: totalN,
          persentaseBeda: calc.persentase,
          statusHubungan: calc.kategori
        });
      }
    });

    if (newPoints.length === 0) {
      alert('Semua survei lain sudah tercatat sebagai titik pembanding.');
      return;
    }

    const merged = [...data.titikPembandingList, ...newPoints];
    onUpdateTitikPembanding(merged);
    setCalculationFeedback(`Berhasil menambahkan ${newPoints.length} titik survei pembanding dan menghitung indeks dialektometrinya!`);
    setTimeout(() => setCalculationFeedback(null), 4500);
  };
  const refLat = parseNum(situasiGeografis.koordinatLintang) || -7.4982;
  const refLon = parseNum(situasiGeografis.koordinatBujur) || 107.3485;
  const refName = titikPengamatan.namaDesa || 'Titik Pengamatan (TP-01)';

  // Calculate coordinates bounds for SVG Map
  const allPoints = [
    { id: 'TP-REF', nama: refName, desa: titikPengamatan.namaDesa || 'Desa Ini', lat: refLat, lon: refLon, isRef: true, d: 0, status: 'Titik Acuan' },
    ...data.titikPembandingList.map(tp => ({
      id: tp.id,
      nama: tp.namaTitik,
      desa: tp.desa,
      lat: tp.lintang,
      lon: tp.bujur,
      isRef: false,
      d: hitungDialektometri(tp.jumlahBeda, tp.jumlahGlos).persentase,
      status: hitungDialektometri(tp.jumlahBeda, tp.jumlahGlos).kategori
    }))
  ];

  const lats = allPoints.map(p => p.lat);
  const lons = allPoints.map(p => p.lon);

  const minLat = Math.min(...lats) - 0.15;
  const maxLat = Math.max(...lats) + 0.15;
  const minLon = Math.min(...lons) - 0.2;
  const maxLon = Math.max(...lons) + 0.2;

  // Projection helper: Geo to SVG coordinates (width: 700, height: 420)
  const mapWidth = 700;
  const mapHeight = 420;

  const projectX = (lon: number) => {
    const span = maxLon - minLon || 1;
    return 60 + ((lon - minLon) / span) * (mapWidth - 120);
  };

  const projectY = (lat: number) => {
    const span = maxLat - minLat || 1;
    // Invert Y because latitude goes north (up), SVG Y goes down
    return mapHeight - (60 + ((lat - minLat) / span) * (mapHeight - 120));
  };

  const refX = projectX(refLon);
  const refY = projectY(refLat);

  // Add comparison point
  const handleAddPembanding = () => {
    const nextNum = data.titikPembandingList.length + 2;
    const newPoint: TitikPembandingDialektometri = {
      id: `TP-0${nextNum}`,
      namaTitik: `TP-0${nextNum} Titik Baru`,
      desa: `Desa Baru`,
      bahasa: titikPengamatan.bahasaDigunakan || 'Bahasa Daerah',
      lintang: refLat + (Math.random() * 0.2 - 0.1),
      bujur: refLon + (Math.random() * 0.3 - 0.15),
      jumlahBeda: 30,
      jumlahGlos: 200,
      persentaseBeda: 15,
      statusHubungan: 'Beda Wicara/Subdialek'
    };
    onUpdateTitikPembanding([...data.titikPembandingList, newPoint]);
  };

  const handleUpdateItem = (index: number, field: keyof TitikPembandingDialektometri, value: any) => {
    const updated = data.titikPembandingList.map((item, i) => {
      if (i === index) {
        const next = { ...item, [field]: value };
        // Recalculate dialectometry
        const calc = hitungDialektometri(next.jumlahBeda, next.jumlahGlos);
        next.persentaseBeda = calc.persentase;
        next.statusHubungan = calc.kategori;
        return next;
      }
      return item;
    });
    onUpdateTitikPembanding(updated);
  };

  const handleRemoveItem = (index: number) => {
    onUpdateTitikPembanding(data.titikPembandingList.filter((_, i) => i !== index));
  };

  return (
    <section id="section-16" className="scroll-mt-36 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-8 transition-all">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6 mb-8">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-blue-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-200 dark:border-indigo-800 shrink-0">
            16
          </div>
          <div className="pt-0.5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
              Hasil Perbandingan Dialektometri & Visualisasi Pemetaan Bahasa
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Perhitungan dialektometri Guiter d = (s / n) x 100% dan peta persebaran isoglos titik pengamatan.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAutoCalculateAll}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-500 dark:to-blue-500 hover:from-indigo-700 hover:to-blue-700 dark:hover:from-indigo-600 dark:hover:to-blue-600 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0 whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4" />
          <span>Hitung Otomatis</span>
        </button>
      </div>

      {calculationFeedback && (
        <div className="mb-6 p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg text-sm font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-500 shrink-0" />
          <span>{calculationFeedback}</span>
        </div>
      )}

      {/* 12 BENTO MODULE SECTION */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Pilih Instrumen Visualisasi & Analisis Dialek
            </span>

          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800/60 whitespace-nowrap">
              {
                activeTab === 'peta-interaktif' ? 'Peta Tematik Leksikal' :
                activeTab === 'isoglos-otomatis' ? 'Isoglos Otomatis' :
                activeTab === 'heatmap' ? 'Matriks Heat-Map' :
                activeTab === 'heatmap-spasial' ? 'Heatmap Spasial' :
                activeTab === 'd3-klaster' ? 'Klaster D3' :
                activeTab === 'pohon-filogenetik' ? 'Pohon Filogenetik' :
                activeTab === 'grafik' ? 'Grafik & Scatter' :
                activeTab === 'klasifikasi' ? 'Klasifikasi' :
                activeTab === 'komparasi' ? 'Perbandingan Titik' :
                activeTab === 'visualisasi' ? 'Isoglos Skematis' :
                activeTab === 'kalkulator' ? 'Tabel & Kalkulator' : 'Glotokronologi'
              }
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Peta Tematik Leksikal */}
          <button
            type="button"
            onClick={() => setActiveTab('peta-interaktif')}
            className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
              activeTab === 'peta-interaktif'
                ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-500 dark:border-sky-400 ring-2 ring-blue-500/20 shadow-xs'
                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className={`p-1.5 rounded-lg transition-colors ${
                  activeTab === 'peta-interaktif' ? 'bg-blue-600 text-white' : 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-sky-300'
                }`}>
                  <Compass className="w-4 h-4" />
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-sky-300">
                  Spasial
                </span>
              </div>
              <h3 className={`text-xs font-bold line-clamp-1 ${activeTab === 'peta-interaktif' ? 'text-blue-900 dark:text-sky-200' : 'text-slate-900 dark:text-white'}`}>
                Peta Tematik Leksikal
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-snug">
                WebGIS interaktif, koordinat GPS & radius sebaran Swadesh.
              </p>
            </div>
            {activeTab === 'peta-interaktif' && (
              <div className="mt-2.5 pt-1.5 border-t border-blue-200/60 dark:border-blue-900/60 flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-sky-400">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span>Sedang Ditampilkan</span>
              </div>
            )}
          </button>

          {/* 2. Isoglos Otomatis (Garis Batas Spasial Guiter) */}
          <button
            type="button"
            onClick={() => setActiveTab('isoglos-otomatis')}
            className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
              activeTab === 'isoglos-otomatis'
                ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className={`p-1.5 rounded-lg transition-colors ${
                  activeTab === 'isoglos-otomatis' ? 'bg-indigo-600 text-white' : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                }`}>
                  <Split className="w-4 h-4" />
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                  Otomatis
                </span>
              </div>
              <h3 className={`text-xs font-bold line-clamp-1 ${activeTab === 'isoglos-otomatis' ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-900 dark:text-white'}`}>
                Isoglos Otomatis
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-snug">
                Garis batas pemisah spasial (bisector) & berkas leksikal.
              </p>
            </div>
            {activeTab === 'isoglos-otomatis' && (
              <div className="mt-2.5 pt-1.5 border-t border-indigo-200/60 dark:border-indigo-900/60 flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span>Sedang Ditampilkan</span>
              </div>
            )}
          </button>

          {/* 2. Matriks Heat-Map & Radar Intuitif */}
          <button
            type="button"
            onClick={() => setActiveTab('heatmap')}
            className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
              activeTab === 'heatmap'
                ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className={`p-1.5 rounded-lg transition-colors ${
                  activeTab === 'heatmap' ? 'bg-indigo-600 text-white' : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                }`}>
                  <RadarIcon className="w-4 h-4" />
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                  Intuitif
                </span>
              </div>
              <h3 className={`text-xs font-bold line-clamp-1 ${activeTab === 'heatmap' ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-900 dark:text-white'}`}>
                Matriks Heat-Map & Radar
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-snug">
                Matriks korelasi silang segitiga & radar profil geoleksikal.
              </p>
            </div>
            {activeTab === 'heatmap' && (
              <div className="mt-2.5 pt-1.5 border-t border-indigo-200/60 dark:border-indigo-900/60 flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span>Sedang Ditampilkan</span>
              </div>
            )}
          </button>

          {/* 3. Heatmap Dialek Spasial Gradasi */}
          <button
            type="button"
            onClick={() => setActiveTab('heatmap-spasial')}
            className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
              activeTab === 'heatmap-spasial'
                ? 'bg-rose-50/80 dark:bg-rose-950/50 border-rose-500 dark:border-rose-400 ring-2 ring-rose-500/20 shadow-xs'
                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-rose-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className={`p-1.5 rounded-lg transition-colors ${
                  activeTab === 'heatmap-spasial' ? 'bg-rose-600 text-white' : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                }`}>
                  <Activity className="w-4 h-4" />
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                  Gradasi
                </span>
              </div>
              <h3 className={`text-xs font-bold line-clamp-1 ${activeTab === 'heatmap-spasial' ? 'text-rose-900 dark:text-rose-200' : 'text-slate-900 dark:text-white'}`}>
                Heatmap Dialek Spasial
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-snug">
                Gradasi densitas kontur spasial & zona transisi dialek.
              </p>
            </div>
            {activeTab === 'heatmap-spasial' && (
              <div className="mt-2.5 pt-1.5 border-t border-rose-200/60 dark:border-rose-900/60 flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span>Sedang Ditampilkan</span>
              </div>
            )}
          </button>

          {/* 4. Klaster & Radar D3 (D3.js) */}
          <button
            type="button"
            onClick={() => setActiveTab('d3-klaster')}
            className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
              activeTab === 'd3-klaster'
                ? 'bg-purple-50/80 dark:bg-purple-950/50 border-purple-500 dark:border-purple-400 ring-2 ring-purple-500/20 shadow-xs'
                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-purple-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className={`p-1.5 rounded-lg transition-colors ${
                  activeTab === 'd3-klaster' ? 'bg-purple-600 text-white' : 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300'
                }`}>
                  <CircleDot className="w-4 h-4" />
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                  D3.js
                </span>
              </div>
              <h3 className={`text-xs font-bold line-clamp-1 ${activeTab === 'd3-klaster' ? 'text-purple-900 dark:text-purple-200' : 'text-slate-900 dark:text-white'}`}>
                Klaster & Radar D3
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-snug">
                Dendrogram hirarkis D3.js & taksonomi klaster dialektal.
              </p>
            </div>
            {activeTab === 'd3-klaster' && (
              <div className="mt-2.5 pt-1.5 border-t border-purple-200/60 dark:border-purple-900/60 flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-400">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                <span>Sedang Ditampilkan</span>
              </div>
            )}
          </button>

          {/* 5. Pohon Filogenetik Kekerabatan (D3.js & Glotokronologi) */}
          <button
            type="button"
            onClick={() => setActiveTab('pohon-filogenetik')}
            className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
              activeTab === 'pohon-filogenetik'
                ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className={`p-1.5 rounded-lg transition-colors ${
                  activeTab === 'pohon-filogenetik' ? 'bg-indigo-600 text-white' : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                }`}>
                  <TreePine className="w-4 h-4" />
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-300">
                  D3.js • UPGMA
                </span>
              </div>
              <h3 className={`text-xs font-bold line-clamp-1 ${activeTab === 'pohon-filogenetik' ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-900 dark:text-white'}`}>
                Pohon Filogenetik
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-snug">
                Pohon silsilah dialek interaktif, tarikh pisah & era sejarah.
              </p>
            </div>
            {activeTab === 'pohon-filogenetik' && (
              <div className="mt-2.5 pt-1.5 border-t border-indigo-200/60 dark:border-indigo-900/60 flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span>Sedang Ditampilkan</span>
              </div>
            )}
          </button>

          {/* 5. Grafik & Scatter (Recharts) */}
          <button
            type="button"
            onClick={() => setActiveTab('grafik')}
            className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
              activeTab === 'grafik'
                ? 'bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-emerald-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className={`p-1.5 rounded-lg transition-colors ${
                  activeTab === 'grafik' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                }`}>
                  <BarChart3 className="w-4 h-4" />
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Recharts
                </span>
              </div>
              <h3 className={`text-xs font-bold line-clamp-1 ${activeTab === 'grafik' ? 'text-emerald-900 dark:text-emerald-200' : 'text-slate-900 dark:text-white'}`}>
                Grafik & Scatter
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-snug">
                Distribusi batang frekuensi & regresi jarak (km) vs beda (d%).
              </p>
            </div>
            {activeTab === 'grafik' && (
              <div className="mt-2.5 pt-1.5 border-t border-emerald-200/60 dark:border-emerald-900/60 flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Sedang Ditampilkan</span>
              </div>
            )}
          </button>

          {/* 6. Klasifikasi Kekerabatan & Interpretasi Otomatis */}
          <button
            type="button"
            onClick={() => setActiveTab('klasifikasi')}
            className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
              activeTab === 'klasifikasi'
                ? 'bg-amber-50/80 dark:bg-amber-950/50 border-amber-500 dark:border-amber-400 ring-2 ring-amber-500/20 shadow-xs'
                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-amber-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className={`p-1.5 rounded-lg transition-colors ${
                  activeTab === 'klasifikasi' ? 'bg-amber-600 text-white' : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                }`}>
                  <GitBranch className="w-4 h-4" />
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  Otomatis
                </span>
              </div>
              <h3 className={`text-xs font-bold line-clamp-1 ${activeTab === 'klasifikasi' ? 'text-amber-900 dark:text-amber-200' : 'text-slate-900 dark:text-white'}`}>
                Klasifikasi Kekerabatan
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-snug">
                Pemberian taksonomi otomatis: wicara, subdialek, dialek, bahasa.
              </p>
            </div>
            {activeTab === 'klasifikasi' && (
              <div className="mt-2.5 pt-1.5 border-t border-amber-200/60 dark:border-amber-900/60 flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Sedang Ditampilkan</span>
              </div>
            )}
          </button>

          {/* 7. Perbandingan Dua Titik */}
          <button
            type="button"
            onClick={() => setActiveTab('komparasi')}
            className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
              activeTab === 'komparasi'
                ? 'bg-cyan-50/80 dark:bg-cyan-950/50 border-cyan-500 dark:border-cyan-400 ring-2 ring-cyan-500/20 shadow-xs'
                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-cyan-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className={`p-1.5 rounded-lg transition-colors ${
                  activeTab === 'komparasi' ? 'bg-cyan-600 text-white' : 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300'
                }`}>
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300">
                  Side-by-Side
                </span>
              </div>
              <h3 className={`text-xs font-bold line-clamp-1 ${activeTab === 'komparasi' ? 'text-cyan-900 dark:text-cyan-200' : 'text-slate-900 dark:text-white'}`}>
                Perbandingan Dua Titik
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-snug">
                Analisis butir-per-butir kosakata 200 Swadesh antar 2 desa.
              </p>
            </div>
            {activeTab === 'komparasi' && (
              <div className="mt-2.5 pt-1.5 border-t border-cyan-200/60 dark:border-cyan-900/60 flex items-center gap-1 text-[10px] font-bold text-cyan-600 dark:text-cyan-400">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                <span>Sedang Ditampilkan</span>
              </div>
            )}
          </button>

          {/* 8. Peta Isoglos Skematis (SVG) */}
          <button
            type="button"
            onClick={() => setActiveTab('visualisasi')}
            className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
              activeTab === 'visualisasi'
                ? 'bg-sky-50/80 dark:bg-sky-950/50 border-sky-500 dark:border-sky-400 ring-2 ring-sky-500/20 shadow-xs'
                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-sky-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className={`p-1.5 rounded-lg transition-colors ${
                  activeTab === 'visualisasi' ? 'bg-sky-600 text-white' : 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300'
                }`}>
                  <Layers className="w-4 h-4" />
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300">
                  Vektor SVG
                </span>
              </div>
              <h3 className={`text-xs font-bold line-clamp-1 ${activeTab === 'visualisasi' ? 'text-sky-900 dark:text-sky-200' : 'text-slate-900 dark:text-white'}`}>
                Peta Isoglos Skematis
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-snug">
                Berkas garis isoglos vektor skematis tanpa distorsi topografis.
              </p>
            </div>
            {activeTab === 'visualisasi' && (
              <div className="mt-2.5 pt-1.5 border-t border-sky-200/60 dark:border-sky-900/60 flex items-center gap-1 text-[10px] font-bold text-sky-600 dark:text-sky-400">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                <span>Sedang Ditampilkan</span>
              </div>
            )}
          </button>

          {/* 9. Tabel & Kalkulator (Titik) */}
          <button
            type="button"
            onClick={() => setActiveTab('kalkulator')}
            className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
              activeTab === 'kalkulator'
                ? 'bg-slate-100 dark:bg-slate-800 border-slate-500 dark:border-slate-400 ring-2 ring-slate-500/20 shadow-xs'
                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className={`p-1.5 rounded-lg transition-colors ${
                  activeTab === 'kalkulator' ? 'bg-slate-700 text-white dark:bg-slate-300 dark:text-slate-900' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  <Calculator className="w-4 h-4" />
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300">
                  {data.titikPembandingList.length} Titik
                </span>
              </div>
              <h3 className={`text-xs font-bold line-clamp-1 ${activeTab === 'kalkulator' ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'}`}>
                Tabel & Kalkulator
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-snug">
                Tabel entri perbandingan, edit nilai beda (s) & total glos (n).
              </p>
            </div>
            {activeTab === 'kalkulator' && (
              <div className="mt-2.5 pt-1.5 border-t border-slate-300 dark:border-slate-700 flex items-center gap-1 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse" />
                <span>Sedang Ditampilkan</span>
              </div>
            )}
          </button>

          {/* 10. Glotokronologi */}
          <button
            type="button"
            onClick={() => setActiveTab('glotokronologi')}
            className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between items-stretch group ${
              activeTab === 'glotokronologi'
                ? 'bg-amber-50/80 dark:bg-amber-950/50 border-amber-500 dark:border-amber-400 ring-2 ring-amber-500/20 shadow-xs'
                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-amber-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className={`p-1.5 rounded-lg transition-colors ${
                  activeTab === 'glotokronologi' ? 'bg-amber-600 text-white' : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                }`}>
                  <Hourglass className="w-4 h-4" />
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300">
                  Swadesh
                </span>
              </div>
              <h3 className={`text-xs font-bold line-clamp-1 ${activeTab === 'glotokronologi' ? 'text-amber-900 dark:text-amber-200' : 'text-slate-900 dark:text-white'}`}>
                Glotokronologi
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-snug">
                Kalkulasi usia pisah (time depth), pohon kronologis & retensi.
              </p>
            </div>
            {activeTab === 'glotokronologi' && (
              <div className="mt-2.5 pt-1.5 border-t border-amber-200/60 dark:border-amber-900/60 flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Sedang Ditampilkan</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ACTIVE VISUAL MENU INTRODUCTORY BANNER */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent dark:from-slate-800/80 dark:via-slate-800/50 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xs mt-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {activeTab === 'peta-interaktif' && 'Georeferensi Spasial WebGIS'}
                {activeTab === 'isoglos-otomatis' && 'Rekonstruksi Batas Spasial Isoglos Otomatis'}
                {activeTab === 'heatmap' && 'Matriks Korelasi & Jaring Radar'}
                {activeTab === 'heatmap-spasial' && 'Gradasi Densitas Kontur Spasial'}
                {activeTab === 'd3-klaster' && 'Dendrogram & Taksonomi Numerik D3.js'}
                {activeTab === 'pohon-filogenetik' && 'Pohon Filogenetik Kekerabatan D3.js'}
                {activeTab === 'grafik' && 'Regresi Jarak vs Beda Leksikal'}
                {activeTab === 'klasifikasi' && 'Standar Badan Bahasa & Keraf'}
                {activeTab === 'komparasi' && 'Triangulasi 200 Kosakata Swadesh'}
                {activeTab === 'visualisasi' && 'Kartografi Teori Gelombang Schmidt'}
                {activeTab === 'kalkulator' && 'Kalkulator Indeks Guiter d = (s/n)×100%'}
                {activeTab === 'glotokronologi' && 'Leksikostatistik Maurice Swadesh (1952)'}
              </span>

              <span className="text-xs text-slate-500 dark:text-slate-400">
                Titik Acuan: <strong className="text-slate-800 dark:text-slate-200">Desa {titikPengamatan.namaDesa || 'Acuan'}</strong> ({titikPengamatan.bahasaDigunakan || 'Bahasa Utama'})
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {activeTab === 'peta-interaktif' && 'Peta Tematik Leksikal & Sebaran Spasial Bahasa'}
              {activeTab === 'isoglos-otomatis' && 'Analisis Garis Isoglos Otomatis & Rekonstruksi Batas Leksikal'}
              {activeTab === 'heatmap' && 'Matriks Heat-Map Silang & Diagram Radar Dialektometri'}
              {activeTab === 'heatmap-spasial' && 'Heatmap Dialek Spasial (Gradasi & Kontur Konsentrasi)'}
              {activeTab === 'd3-klaster' && 'Visualisasi Klaster Hirarkis D3.js & Dendrogram Dialek'}
              {activeTab === 'pohon-filogenetik' && 'Rekonstruksi Pohon Filogenetika Dialek (D3.js & UPGMA)'}
              {activeTab === 'grafik' && 'Grafik Distribusi Dialektometri & Scatter Plot Jarak'}
              {activeTab === 'klasifikasi' && 'Sistem Klasifikasi Kekerabatan & Interpretasi Otomatis'}
              {activeTab === 'komparasi' && 'Komparator Berdampingan (Side-by-Side) Dua Titik'}
              {activeTab === 'visualisasi' && 'Peta Isoglos Skematis Vektor Poligon (SVG)'}
              {activeTab === 'kalkulator' && `Tabel Data & Kalkulator Dialektometri (${data.titikPembandingList.length} Titik Pembanding)`}
              {activeTab === 'glotokronologi' && 'Kalkulator & Garis Waktu Glotokronologi Swadesh'}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-4xl leading-relaxed">
              {activeTab === 'peta-interaktif' && 'Menampilkan koordinat lintang/bujur titik acuan bersama seluruh titik pembanding pada peta GIS interaktif. Dilengkapi layer radius geolinguistik, visualisasi isoglos georeferensi, dan integrasi sebaran kosakata 200 Swadesh.'}
              {activeTab === 'isoglos-otomatis' && 'Menghitung secara otomatis perbedaan leksikal Swadesh antar-titik pengamatan dan merekonstruksi garis batas isoglos (perpendicular bisector) serta berkas isoglos berbobot yang memisahkan wilayah tuturan.'}
              {activeTab === 'heatmap' && 'Menyajikan matriks segitiga lengkap korelasi dialektometri antar pasangan titik pengamatan. Dilengkapi jaring radar interaktif yang membandingkan persentase perbedaan leksikal terhadap jarak fisik kilometer.'}
              {activeTab === 'heatmap-spasial' && 'Menginterpolasi nilai dialektometri ke dalam gradasi warna spasial bentang alam untuk mendeteksi zona transisi dialektal, batas alamiah difusi bahasa, dan kantong wicara homogen.'}
              {activeTab === 'd3-klaster' && 'Memodelkan pohon filogenetika dialek (dendrogram) interaktif berbasis D3.js dengan algoritma UPGMA untuk memetakan rumpun dan subdialek secara objektif tanpa distorsi geografis.'}
              {activeTab === 'pohon-filogenetik' && 'Menghitung percabangan silsilah kekerabatan titik pengamatan dan titik pembanding menggunakan algoritma UPGMA berdasar matriks perbedaan leksikal Swadesh dan formula kedalaman waktu pisah (time depth) Maurice Swadesh.'}
              {activeTab === 'grafik' && 'Grafik batang urutan persentase perbedaan dialektometri dan diagram pencar (scatter plot) untuk memverifikasi model isolasi karena jarak geografis (Isolation by Distance).'}
              {activeTab === 'klasifikasi' && 'Penentuan otomatis 5 kategori hubungan kebahasaan baku (Beda Wicara, Beda Subdialek, Beda Dialek, Beda Bahasa, Beda Subkeluarga) sesuai pedoman Badan Bahasa dan Keraf (1984).'}
              {activeTab === 'komparasi' && 'Mempertemukan data leksikal titik acuan dan titik pembanding terpilih secara berdampingan. Menampilkan glos yang sama, berbeda bentuk kata, atau beda fonetis untuk verifikasi instan.'}
              {activeTab === 'visualisasi' && 'Diagram vektor isoglos skematis murni untuk melihat formasi berkas garis pemisah gejala bahasa tanpa dipengaruhi distorsi topografi peta geografis.'}
              {activeTab === 'kalkulator' && 'Pusat input dan pengelolaan data titik pembanding. Anda dapat menambah titik baru, mengisi nilai perbedaan (s) dan total glos (n), serta menyinkronkan data antar-survei.'}
              {activeTab === 'glotokronologi' && 'Menghitung estimasi kedalaman waktu pisah (time depth) leksikostatistik t = ln(C) / (2ln(r)) dengan konstanta retensi r = 0.805 per 1.000 tahun, dilengkapi pohon divergensi kronologis.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-[11px] space-y-0.5 min-w-[130px]">
              <span className="text-slate-400 block text-[10px]">Titik Pembanding</span>
              <strong className="text-slate-800 dark:text-slate-200 font-bold block">
                {data.titikPembandingList.length} Titik Lapangan
              </strong>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-[11px] space-y-0.5 min-w-[130px]">
              <span className="text-slate-400 block text-[10px]">Kosakata Swadesh</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-bold block">
                {kosakataLengkap?.swadeshList ? `${kosakataLengkap.swadeshList.filter(i => i.bentukLokal?.trim()).length}/200 Glos` : '200 Glos Baku'}
              </strong>
            </div>

          </div>
        </div>
      </div>

      {/* TAB 0: VISUALISASI PEMETAAN GEOGRAFIS SPASIAL TEMATIK INTERAKTIF */}
      {activeTab === 'peta-interaktif' && (
        <InteractiveGeographicMap
          titikPengamatan={titikPengamatan}
          situasiGeografis={situasiGeografis}
          titikPembandingList={data.titikPembandingList}
          kosakataLengkap={kosakataLengkap}
          allSurveys={allSurveys}
          activeSurveyId={activeSurveyId}
          initialDarkMode={false}
          onAddPoint={(newPoint) => {
            onUpdateTitikPembanding([...data.titikPembandingList, newPoint]);
          }}
          onSelectComparisonForDetail={() => {
            setActiveTab('komparasi');
          }}
        />
      )}

      {/* TAB ISOGLOS OTOMATIS: REKONSTRUKSI GARIS BATAS ISOGLOS LEKSIKAL */}
      {activeTab === 'isoglos-otomatis' && (
        <Section16IsoglosOtomatis
          titikPengamatan={titikPengamatan}
          situasiGeografis={situasiGeografis}
          titikPembandingList={data.titikPembandingList}
          kosakataLengkap={kosakataLengkap}
          allSurveys={allSurveys}
          activeSurveyId={activeSurveyId}
          currentCatatanIsoglos={data.catatanIsoglos}
          onUpdateTitikPembanding={onUpdateTitikPembanding}
          onUpdateCatatan={onUpdateCatatan}
          onNavigateToComparison={(p1, p2) => {
            setActiveTab('komparasi');
          }}
          onNavigateToHeatmap={() => {
            setActiveTab('heatmap');
          }}
          onNavigateToClassification={() => {
            setActiveTab('klasifikasi');
          }}
        />
      )}

      {/* TAB HEATMAP SPASIAL DIALEK: GRADASI KONSENTRASI DIALEK */}
      {activeTab === 'heatmap-spasial' && (
        <InteractiveGeographicMap
          titikPengamatan={titikPengamatan}
          situasiGeografis={situasiGeografis}
          titikPembandingList={data.titikPembandingList}
          kosakataLengkap={kosakataLengkap}
          allSurveys={allSurveys}
          activeSurveyId={activeSurveyId}
          initialThematicMode="heatmap-dialek"
          initialDarkMode={false}
          onAddPoint={(newPoint) => {
            onUpdateTitikPembanding([...data.titikPembandingList, newPoint]);
          }}
          onSelectComparisonForDetail={() => {
            setActiveTab('komparasi');
          }}
        />
      )}

      {/* TAB D3: VISUALISASI KLASTER & GRAFIK RADAR MULTIDIMENSI D3 */}
      {activeTab === 'd3-klaster' && (
        <DialektometriD3ClusterRadar
          titikPengamatan={titikPengamatan}
          situasiGeografis={situasiGeografis}
          titikPembandingList={data.titikPembandingList}
          kosakataLengkap={kosakataLengkap}
          allSurveys={allSurveys}
          onSelectPointForComparison={(pointId) => {
            setActiveTab('komparasi');
          }}
        />
      )}

      {/* TAB POHON FILOGENETIK: REKONSTRUKSI POHON SILSILAH D3.JS */}
      {activeTab === 'pohon-filogenetik' && (
        <DialektometriPhylogeneticTree
          titikPengamatan={titikPengamatan}
          situasiGeografis={situasiGeografis}
          titikPembandingList={data.titikPembandingList}
          kosakataLengkap={kosakataLengkap}
          allSurveys={allSurveys}
          onSelectPointForComparison={(pointId) => {
            setActiveTab('komparasi');
          }}
          onNavigateToGlotokronologi={() => {
            setActiveTab('glotokronologi');
          }}
        />
      )}

      {/* TAB 1: VISUALISASI GRAFIK BATANG & SCATTER PLOT RECHARTS */}
      {activeTab === 'grafik' && (
        <DialektometriChart
          titikPengamatan={titikPengamatan}
          situasiGeografis={situasiGeografis}
          titikPembandingList={data.titikPembandingList}
          onNavigateToHeatmap={() => setActiveTab('heatmap')}
          onNavigateToClassification={() => setActiveTab('klasifikasi')}
          onNavigateToD3Cluster={() => setActiveTab('d3-klaster')}
        />
      )}

      {/* TAB HEATMAP: MATRIKS KOMPARASI ANTAR TITIK PENGAMATAN */}
      {activeTab === 'heatmap' && (
        <DialektometriHeatmap
          titikPengamatan={titikPengamatan}
          situasiGeografis={situasiGeografis}
          titikPembandingList={data.titikPembandingList}
          kosakataLengkap={kosakataLengkap}
          allSurveys={allSurveys}
          onSelectPairForComparison={(p1, p2) => {
            setActiveTab('komparasi');
          }}
          onNavigateToStats={() => {
            setActiveTab('grafik');
          }}
          onNavigateToD3Cluster={() => {
            setActiveTab('d3-klaster');
          }}
        />
      )}

      {/* TAB KLASIFIKASI: INTERPRETASI & KLASIFIKASI OTOMATIS HUBUNGAN KEKERABATAN */}
      {activeTab === 'klasifikasi' && (
        <Section16LinguisticClassification
          titikPengamatan={titikPengamatan}
          situasiGeografis={situasiGeografis}
          titikPembandingList={data.titikPembandingList}
          onUpdateTitikPembanding={onUpdateTitikPembanding}
          onUpdateCatatan={onUpdateCatatan}
          currentCatatanIsoglos={data.catatanIsoglos}
          currentKesimpulanGeolinguistik={data.kesimpulanGeolinguistik}
        />
      )}

      {/* TAB KOMPARASI: PERBANDINGAN OTOMATIS DUA TITIK PENGAMATAN */}
      {activeTab === 'komparasi' && (
        <Section16PointComparison
          titikPengamatan={titikPengamatan}
          titikPembandingList={data.titikPembandingList}
          kosakataLengkap={kosakataLengkap}
          allSurveys={allSurveys}
          onUpdateTitikPembandingList={onUpdateTitikPembanding}
        />
      )}

      {/* TAB 2: VISUALISASI PETA PEMETAAN BAHASA (SVG) */}
      {activeTab === 'visualisasi' && (
        <div className="space-y-4">
          {/* Map Controls Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                Mode Tampilan:
              </span>
              {(['geografis', 'minimalis', 'isoglos'] as const).map(style => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setMapStyle(style)}
                  className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors ${
                    mapStyle === style
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 text-slate-500 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block ring-2 ring-indigo-200" />
                Titik Acuan ({titikPengamatan.namaDesa || 'TP-01'})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
                Titik Pembanding
              </span>
            </div>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-gradient-to-b from-sky-50 via-slate-50 to-emerald-50/20 shadow-inner">
            <svg 
              viewBox={`0 0 ${mapWidth} ${mapHeight}`} 
              className="w-full h-auto select-none"
              style={{ maxHeight: '520px' }}
            >
              <defs>
                {/* Background Grid Pattern */}
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.6" strokeDasharray="2 2" />
                </pattern>
                {/* Gradients */}
                <linearGradient id="coastalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <rect width={mapWidth} height={mapHeight} fill="url(#grid)" />

              {/* Decorative Coastal / Topographic Isogloss Curves */}
              {mapStyle === 'geografis' && (
                <g opacity="0.5">
                  <path
                    d={`M 0,${mapHeight - 40} Q 200,${mapHeight - 80} 450,${mapHeight - 50} T ${mapWidth},${mapHeight - 70} L ${mapWidth},${mapHeight} L 0,${mapHeight} Z`}
                    fill="url(#coastalGradient)"
                  />
                  <text x="30" y={mapHeight - 15} fill="#0284c7" fontSize="11" fontStyle="italic" fontWeight="500">
                    Samudra Hindia / Wilayah Perairan Pesisir Selatan
                  </text>
                </g>
              )}

              {/* Dialectometry Connecting Lines (Isogloss lines from Reference Point to Comparison Points) */}
              {data.titikPembandingList.map((tp) => {
                const targetX = projectX(tp.bujur);
                const targetY = projectY(tp.lintang);
                const calc = hitungDialektometri(tp.jumlahBeda, tp.jumlahGlos);

                let strokeColor = '#10b981'; // <= 20% Tidak Berbeda
                if (calc.kategori === 'Perbedaan Wicara') strokeColor = '#0284c7'; // sky
                else if (calc.kategori === 'Perbedaan Subdialek') strokeColor = '#f59e0b'; // amber
                else if (calc.kategori === 'Perbedaan Dialek') strokeColor = '#ea580c'; // orange
                else if (calc.kategori === 'Perbedaan Bahasa') strokeColor = '#ef4444'; // red

                const midX = (refX + targetX) / 2;
                const midY = (refY + targetY) / 2;
                const dist = calculateDistanceKm(refLat, refLon, tp.lintang, tp.bujur);

                return (
                  <g key={tp.id} className="cursor-pointer transition-opacity">
                    {/* Connecting Line */}
                    <line
                      x1={refX}
                      y1={refY}
                      x2={targetX}
                      y2={targetY}
                      stroke={strokeColor}
                      strokeWidth="2.5"
                      strokeDasharray={mapStyle === 'isoglos' ? '4 3' : 'none'}
                      opacity="0.85"
                    />

                    {/* Perpendicular Bisector Isogloss Boundary Line (When in isoglos mode) */}
                    {mapStyle === 'isoglos' && calc.persentase >= 20 && (() => {
                      const dx = targetX - refX;
                      const dy = targetY - refY;
                      const len = Math.sqrt(dx * dx + dy * dy);
                      if (len === 0) return null;
                      const normX = -dy / len;
                      const normY = dx / len;
                      const span = 45;
                      const bx1 = midX - normX * span;
                      const by1 = midY - normY * span;
                      const bx2 = midX + normX * span;
                      const by2 = midY + normY * span;
                      return (
                        <g>
                          <line
                            x1={bx1}
                            y1={by1}
                            x2={bx2}
                            y2={by2}
                            stroke={strokeColor}
                            strokeWidth="3.5"
                            strokeDasharray={calc.persentase >= 81 ? 'none' : '6 3'}
                            opacity="0.95"
                          />
                          <circle cx={bx1} cy={by1} r="3" fill={strokeColor} />
                          <circle cx={bx2} cy={by2} r="3" fill={strokeColor} />
                        </g>
                      );
                    })()}

                    {/* Midpoint Dialectometry Tag */}
                    <rect
                      x={midX - 32}
                      y={midY - 11}
                      width="64"
                      height="22"
                      rx="6"
                      fill="white"
                      stroke={strokeColor}
                      strokeWidth="1.5"
                      filter="drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
                    />
                    <text
                      x={midX}
                      y={midY + 4}
                      textAnchor="middle"
                      fill={strokeColor}
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="inherit"
                    >
                      d = {calc.persentase}%
                    </text>

                    {/* Distance Badge */}
                    <text
                      x={midX}
                      y={midY + 24}
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize="9"
                      fontWeight="500"
                    >
                      {dist} km
                    </text>
                  </g>
                );
              })}

              {/* Observation Points Plotting */}
              {/* 1. Comparison Points */}
              {data.titikPembandingList.map((tp) => {
                const x = projectX(tp.bujur);
                const y = projectY(tp.lintang);
                const isHovered = hoveredPoint === tp.id;
                const calc = hitungDialektometri(tp.jumlahBeda, tp.jumlahGlos);

                return (
                  <g 
                    key={tp.id}
                    onMouseEnter={() => setHoveredPoint(tp.id)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="cursor-pointer"
                  >
                    {/* Pulsing ring if hovered */}
                    {isHovered && (
                      <circle cx={x} cy={y} r="18" fill="#e2e8f0" opacity="0.6" />
                    )}

                    <circle
                      cx={x}
                      cy={y}
                      r="8"
                      fill="#1e293b"
                      stroke="white"
                      strokeWidth="2.5"
                    />

                    {/* Label */}
                    <rect
                      x={x - 45}
                      y={y - 30}
                      width="90"
                      height="18"
                      rx="4"
                      fill="rgba(15, 23, 42, 0.85)"
                    />
                    <text
                      x={x}
                      y={y - 18}
                      textAnchor="middle"
                      fill="white"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {tp.namaTitik}
                    </text>
                    <text
                      x={x}
                      y={y + 18}
                      textAnchor="middle"
                      fill="#475569"
                      fontSize="9"
                      fontWeight="500"
                    >
                      {tp.desa} ({tp.bahasa})
                    </text>
                  </g>
                );
              })}

              {/* 2. Reference Observation Point (Center of Survey) */}
              <g 
                onMouseEnter={() => setHoveredPoint('ref')}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer"
              >
                {/* Glow ring */}
                <circle cx={refX} cy={refY} r="22" fill="#4f46e5" opacity="0.2" />
                <circle cx={refX} cy={refY} r="12" fill="#4f46e5" stroke="white" strokeWidth="3" />
                <circle cx={refX} cy={refY} r="4" fill="white" />

                {/* Prominent Badge */}
                <rect
                  x={refX - 60}
                  y={refY - 34}
                  width="120"
                  height="20"
                  rx="6"
                  fill="#4f46e5"
                  filter="drop-shadow(0 2px 4px rgba(79, 70, 229, 0.3))"
                />
                <text
                  x={refX}
                  y={refY - 20}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                >
                  ★ {refName}
                </text>
                <text
                  x={refX}
                  y={refY + 22}
                  textAnchor="middle"
                  fill="#1e1b4b"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {titikPengamatan.bahasaDigunakan || 'Bahasa Pengamatan'}
                </text>
              </g>

              {/* Compass Rose Inset */}
              <g transform="translate(640, 50)">
                <circle cx="0" cy="0" r="22" fill="white" stroke="#cbd5e1" strokeWidth="1" />
                <path d="M 0,-18 L 4,0 L 0,-4 L -4,0 Z" fill="#4f46e5" />
                <path d="M 0,18 L 4,0 L 0,4 L -4,0 Z" fill="#94a3b8" />
                <text x="0" y="-8" textAnchor="middle" fill="#4f46e5" fontSize="8" fontWeight="bold">U</text>
                <text x="0" y="14" textAnchor="middle" fill="#64748b" fontSize="7">S</text>
              </g>

              {/* Map Scale indicator */}
              <g transform="translate(30, 390)">
                <rect x="0" y="0" width="100" height="4" fill="#0f172a" />
                <text x="0" y="-4" fill="#64748b" fontSize="8">0 km</text>
                <text x="100" y="-4" fill="#64748b" fontSize="8">50 km</text>
              </g>
            </svg>
          </div>

          {/* Dialectometry Standard Badan Bahasa Legend */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-600" />
              Klasifikasi Dialektometri Standar Linguistik Indonesia (Badan Bahasa)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
              <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-0.5">
                  <span className="w-3 h-1 bg-emerald-500 rounded-full inline-block" />
                  ≤ 20%
                </div>
                <div className="font-semibold text-emerald-900 text-[11px]">Kategori Tidak Berbeda</div>
                <div className="text-[10px] text-emerald-700">Masih dalam satu variasi atau wicara yang sama</div>
              </div>

              <div className="p-2 bg-sky-50/70 border border-sky-200 rounded-lg">
                <div className="flex items-center gap-1.5 font-bold text-sky-800 mb-0.5">
                  <span className="w-3 h-1 bg-sky-500 rounded-full inline-block" />
                  21% – 30%
                </div>
                <div className="font-semibold text-sky-900 text-[11px]">Perbedaan Wicara</div>
                <div className="text-[10px] text-sky-700">Speech difference / aksen tutur</div>
              </div>

              <div className="p-2 bg-amber-50/70 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-1.5 font-bold text-amber-800 mb-0.5">
                  <span className="w-3 h-1 bg-amber-500 rounded-full inline-block" />
                  31% – 50%
                </div>
                <div className="font-semibold text-amber-900 text-[11px]">Perbedaan Subdialek</div>
                <div className="text-[10px] text-amber-700">Varian subdialek dalam dialek serumpun</div>
              </div>

              <div className="p-2 bg-orange-50/70 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-1.5 font-bold text-orange-800 mb-0.5">
                  <span className="w-3 h-1 bg-orange-500 rounded-full inline-block" />
                  51% – 80%
                </div>
                <div className="font-semibold text-orange-900 text-[11px]">Perbedaan Dialek</div>
                <div className="text-[10px] text-orange-700">Berbeda dialek dalam satu bahasa</div>
              </div>

              <div className="p-2 bg-rose-50/70 border border-rose-200 rounded-lg">
                <div className="flex items-center gap-1.5 font-bold text-rose-800 mb-0.5">
                  <span className="w-3 h-1 bg-rose-500 rounded-full inline-block" />
                  81% – 100%
                </div>
                <div className="font-semibold text-rose-900 text-[11px]">Perbedaan Bahasa</div>
                <div className="text-[10px] text-rose-700">Diakui sebagai bahasa yang berbeda penuh</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KALKULATOR & TABEL TITIK PEMBANDING */}
      {activeTab === 'kalkulator' && (
        <div className="space-y-4">
          {/* Quick banner to Automatic Classification & Interpretation */}
          <div className="bg-gradient-to-r from-indigo-50 via-sky-50 to-emerald-50/40 border border-indigo-200 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 text-white rounded-lg shrink-0">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Klasifikasi Otomatis Hubungan Kekerabatan Bahasa</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">
                    Fitur Baru
                  </span>
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Klasifikasi otomatis tingkat varian dialek atau bahasa berdasarkan ambang batas leksikal (Badan Bahasa / Swadesh / Konservatif) beserta laporan interpretasi naratif akademik.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('klasifikasi')}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all shrink-0 cursor-pointer self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span>Buka Klasifikasi & Interpretasi</span>
            </button>
          </div>

          {/* Automatic Calculation Feedback Banner */}
          {calculationFeedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-md flex items-center justify-between text-xs text-emerald-900 shadow-2xs animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{calculationFeedback}</span>
              </div>
              <button
                type="button"
                onClick={() => setCalculationFeedback(null)}
                className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Header & Automated Actions Bar */}
          <div className="bg-slate-50/90 border border-slate-200 rounded-lg p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Perhitungan Otomatis Indeks Dialektometri (d = s/n × 100%)
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Membandingkan kosakata Desa Acuan (<strong className="text-slate-700">{titikPengamatan.namaDesa || 'TP-01'}</strong>) terhadap seluruh desa pembanding berdasarkan rumus Guiter / Badan Bahasa.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAutoCalculateAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
                title="Jalankan algoritma komparasi kosakata leksikal & fonologis secara otomatis"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                <span>Hitung Otomatis Seluruh Titik</span>
              </button>

              {allSurveys && allSurveys.length > 1 && (
                <button
                  type="button"
                  onClick={handleSyncSurveysAsComparisonPoints}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-emerald-800 bg-white border border-emerald-300 hover:bg-emerald-50 transition-colors cursor-pointer"
                  title="Tambahkan desa dari survei lain yang tersimpan di sistem ke daftar pembanding"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sinkronkan Desa Survei</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleAddPembanding}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-slate-500" />
                <span>Tambah Titik Manual</span>
              </button>
            </div>
          </div>

          {/* Responsive Dialectometry Table (Desktop & Tablet) */}
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[760px]">
                <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">No</th>
                    <th className="py-2.5 px-3">Titik & Desa Pembanding</th>
                    <th className="py-2.5 px-3">Bahasa / Dialek</th>
                    <th className="py-2.5 px-3 text-center">Jarak Geografis</th>
                    <th className="py-2.5 px-3 text-center">Beda (s)</th>
                    <th className="py-2.5 px-3 text-center">Total (n)</th>
                    <th className="py-2.5 px-3 text-center">Indeks (d)</th>
                    <th className="py-2.5 px-3">Klasifikasi Hubungan</th>
                    <th className="py-2.5 px-2 text-center w-12">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {data.titikPembandingList.map((tp, idx) => {
                    const calc = hitungDialektometri(tp.jumlahBeda, tp.jumlahGlos);
                    const distKm = calculateDistanceKm(refLat, refLon, tp.lintang, tp.bujur);
                    
                    return (
                      <tr key={tp.id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="py-2.5 px-3 text-center font-mono text-slate-400 font-medium text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="space-y-0.5">
                            <input
                              type="text"
                              value={tp.namaTitik}
                              onChange={(e) => handleUpdateItem(idx, 'namaTitik', e.target.value)}
                              className="w-full px-2 py-0.5 text-xs border border-transparent hover:border-slate-200 focus:border-indigo-400 rounded-md font-bold text-slate-900 bg-slate-50/50 focus:bg-white"
                            />
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 px-2">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <input
                                type="text"
                                value={tp.desa}
                                onChange={(e) => handleUpdateItem(idx, 'desa', e.target.value)}
                                placeholder="Nama desa"
                                className="w-32 bg-transparent border-none text-slate-600 focus:bg-white focus:ring-1 focus:ring-indigo-300 rounded"
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={tp.bahasa}
                            onChange={(e) => handleUpdateItem(idx, 'bahasa', e.target.value)}
                            placeholder="Nama bahasa/dialek"
                            className="w-full px-2 py-1 text-xs border border-transparent hover:border-slate-200 focus:border-indigo-400 rounded-md text-slate-700 bg-slate-50/50 focus:bg-white font-medium"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-xs text-slate-600">
                          <span className="px-2 py-0.5 bg-slate-100 rounded-md font-medium text-[11px]">
                            {distKm} km
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max={tp.jumlahGlos}
                            value={tp.jumlahBeda}
                            onChange={(e) => handleUpdateItem(idx, 'jumlahBeda', parseInt(e.target.value) || 0)}
                            className="w-16 px-1.5 py-1 text-xs text-center border border-slate-200 rounded-md font-bold text-indigo-700 focus:ring-1 focus:ring-indigo-400"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="number"
                            min="1"
                            value={tp.jumlahGlos}
                            onChange={(e) => handleUpdateItem(idx, 'jumlahGlos', parseInt(e.target.value) || 1)}
                            className="w-16 px-1.5 py-1 text-xs text-center border border-slate-200 rounded-md font-medium text-slate-600 focus:ring-1 focus:ring-indigo-400"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="text-xs font-extrabold text-slate-900 font-mono">
                              {calc.persentase}%
                            </span>
                            <div className="w-16 bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${
                                  calc.kategori === 'Tidak Berbeda'
                                    ? 'bg-emerald-500'
                                    : calc.kategori === 'Perbedaan Wicara'
                                    ? 'bg-sky-500'
                                    : calc.kategori === 'Perbedaan Subdialek'
                                    ? 'bg-amber-500'
                                    : calc.kategori === 'Perbedaan Dialek'
                                    ? 'bg-orange-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(100, calc.persentase)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold border ${calc.warnaBadge}`}>
                            {calc.kategori}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-colors"
                            title="Hapus titik pembanding"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom summary bar of table */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-4">
                <span>
                  Total Titik Pembanding: <strong className="text-slate-800">{data.titikPembandingList.length} titik</strong>
                </span>
                <span>
                  Rata-rata Indeks d: <strong className="text-indigo-700 font-mono">
                    {data.titikPembandingList.length > 0
                      ? Math.round(
                          data.titikPembandingList.reduce((acc, tp) => acc + hitungDialektometri(tp.jumlahBeda, tp.jumlahGlos).persentase, 0) /
                            data.titikPembandingList.length
                        )
                      : 0}%
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('komparasi')}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 hover:underline"
                >
                  <span>Lihat Perbandingan Kata Per Kata</span>
                  <ArrowLeftRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 10: GLOTOKRONOLOGI MAURICE SWADESH */}
      {activeTab === 'glotokronologi' && (
        <Section16Glotokronologi
          titikPengamatan={titikPengamatan}
          situasiGeografis={situasiGeografis}
          titikPembandingList={data.titikPembandingList}
          kosakataLengkap={kosakataLengkap}
          allSurveys={allSurveys}
          onSelectPoint={() => {
            setActiveTab('komparasi');
          }}
        />
      )}

      {/* Catatan Isoglos & Kesimpulan Analisis Geolinguistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-200">
        <div>
          <label htmlFor="isoglos-catatan" className="block text-xs font-semibold text-slate-700 mb-1">
            Catatan Perbedaan Isoglos Leksikal / Fonologis
          </label>
          <textarea
            id="isoglos-catatan"
            rows={3}
            value={data.catatanIsoglos}
            onChange={(e) => onUpdateCatatan('catatanIsoglos', e.target.value)}
            placeholder="Misal: Ditemukan garis isoglos pergantian vokal /a/ menjadi /o/ pada kata-kata Swadesh terbuka di bagian timur..."
            className="w-full px-3 py-2 text-xs bg-slate-50/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="geolinguistik-kesimpulan" className="block text-xs font-semibold text-slate-700 mb-1">
            Kesimpulan Analisis Geolinguistik & Batas Bahasa
          </label>
          <textarea
            id="geolinguistik-kesimpulan"
            rows={3}
            value={data.kesimpulanGeolinguistik}
            onChange={(e) => onUpdateCatatan('kesimpulanGeolinguistik', e.target.value)}
            placeholder="Rangkuman status hubungan kebahasaan desa pengamatan terhadap desa-desa di sekitarnya..."
            className="w-full px-3 py-2 text-xs bg-slate-50/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

    </section>
  );
};
