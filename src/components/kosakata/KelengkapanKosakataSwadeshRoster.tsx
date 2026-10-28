import React, { useState, useMemo } from 'react';
import {
  SurveyRecord,
  InstrumenPemetaanBahasaData,
  KosakataItem,
  TitikPengamatan
} from '../../types/linguistic';
import {
  getSampleSurveyCikaso,
  getSampleSurveyRancabuaya,
  getSampleSurveyPangandaran
} from '../../data/sampleSurveyData';
import {
  Percent,
  Activity,
  CheckCircle2,
  BarChart2,
  Search,
  ArrowUpDown,
  ArrowRight,
  ExternalLink,
  Download,
  Volume2,
  Table as TableIcon,
  LayoutGrid,
  Check,
  RotateCcw,
  Sparkles,
  Building2,
  MapPin,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';

export interface KelengkapanKosakataSwadeshRosterProps {
  surveys: SurveyRecord[];
  activeSurveyData?: InstrumenPemetaanBahasaData;
  activeSurveyId?: string | null;
  titikPengamatan?: TitikPengamatan;
  onSelectSurvey?: (id: string) => void;
  onNavigateToForm?: (surveyId: string) => void;
}

export interface SurveyProgressItem {
  id: string;
  title: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  bahasa: string;
  isActive: boolean;
  filledCount: number;
  totalCount: number;
  filledPercentage: number;
  audioCount: number;
  audioPercentage: number;
  ipaCount: number;
  ipaPercentage: number;
  remainingCount: number;
  statusLabel: string;
  statusBadge: string;
  barColor: string;
}

export const KelengkapanKosakataSwadeshRoster: React.FC<KelengkapanKosakataSwadeshRosterProps> = ({
  surveys,
  activeSurveyData,
  activeSurveyId,
  titikPengamatan,
  onSelectSurvey,
  onNavigateToForm
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'incomplete'>('all');
  const [sortBy, setSortBy] = useState<'active_first' | 'percent_desc' | 'percent_asc' | 'name'>('active_first');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

  // Real-time Swadesh progress computed for every survey in the database + live active survey
  const surveysProgress = useMemo<SurveyProgressItem[]>(() => {
    interface RawSurveyTarget {
      id: string;
      title: string;
      desa: string;
      kecamatan: string;
      kabupaten: string;
      provinsi: string;
      bahasa: string;
      swadesh: KosakataItem[];
      isActive: boolean;
    }

    const list: RawSurveyTarget[] = [];

    // 1. Current active survey being edited (uses live activeSurveyData.kosakataLengkap.swadeshList for instant real-time reactivity)
    if (activeSurveyData) {
      const activeDesa = titikPengamatan?.namaDesa || activeSurveyData.titikPengamatan?.namaDesa || 'Survei Aktif';
      const activeBahasa = titikPengamatan?.bahasaDigunakan || activeSurveyData.titikPengamatan?.bahasaDigunakan || 'Bahasa Utama';
      const activeKec = titikPengamatan?.kecamatan || activeSurveyData.titikPengamatan?.kecamatan || '-';
      const activeKab = titikPengamatan?.kabupatenKota || activeSurveyData.titikPengamatan?.kabupatenKota || '-';
      const activeProv = titikPengamatan?.provinsi || activeSurveyData.titikPengamatan?.provinsi || '-';

      list.push({
        id: activeSurveyId || 'active-survey',
        title: activeDesa ? `Desa ${activeDesa}` : 'Survei Ini (Aktif)',
        desa: activeDesa,
        kecamatan: activeKec,
        kabupaten: activeKab,
        provinsi: activeProv,
        bahasa: activeBahasa,
        swadesh: activeSurveyData.kosakataLengkap?.swadeshList || [],
        isActive: true
      });
    }

    // 2. All saved surveys in the project
    (surveys || []).forEach(s => {
      if (activeSurveyId && s.id === activeSurveyId) return;
      if (list.some(item => item.id === s.id)) return;

      const sDesa = s.desa || s.data?.titikPengamatan?.namaDesa || s.title;
      const sBahasa = s.bahasa || s.data?.titikPengamatan?.bahasaDigunakan || 'Bahasa Daerah';
      const sKec = s.kecamatan || s.data?.titikPengamatan?.kecamatan || '-';
      const sKab = s.kabupatenKota || s.data?.titikPengamatan?.kabupatenKota || '-';
      const sProv = s.provinsi || s.data?.titikPengamatan?.provinsi || '-';

      list.push({
        id: s.id,
        title: s.title || `Survei Desa ${sDesa}`,
        desa: sDesa,
        kecamatan: sKec,
        kabupaten: sKab,
        provinsi: sProv,
        bahasa: sBahasa,
        swadesh: s.data?.kosakataLengkap?.swadeshList || [],
        isActive: false
      });
    });

    // 3. Fallback sample surveys if list has only 1 survey
    if (list.length <= 1) {
      const sCikaso = getSampleSurveyCikaso();
      const sRancabuaya = getSampleSurveyRancabuaya();
      const sPangandaran = getSampleSurveyPangandaran();

      if (!list.some(s => s.id === 'sample-cikaso')) {
        list.push({
          id: 'sample-cikaso',
          title: 'Desa Cikaso (Sukabumi)',
          desa: 'Cikaso',
          kecamatan: 'Cibitung',
          kabupaten: 'Sukabumi',
          provinsi: 'Jawa Barat',
          bahasa: 'Sunda Priangan Kidul',
          swadesh: sCikaso.kosakataLengkap?.swadeshList || [],
          isActive: false
        });
      }

      if (!list.some(s => s.id === 'sample-rancabuaya')) {
        list.push({
          id: 'sample-rancabuaya',
          title: 'Desa Rancabuaya (Garut)',
          desa: 'Rancabuaya',
          kecamatan: 'Caringin',
          kabupaten: 'Garut',
          provinsi: 'Jawa Barat',
          bahasa: 'Sunda Pesisir Garut',
          swadesh: sRancabuaya.kosakataLengkap?.swadeshList || [],
          isActive: false
        });
      }

      if (!list.some(s => s.id === 'sample-pangandaran')) {
        list.push({
          id: 'sample-pangandaran',
          title: 'Desa Babakan (Pangandaran)',
          desa: 'Babakan',
          kecamatan: 'Pangandaran',
          kabupaten: 'Pangandaran',
          provinsi: 'Jawa Barat',
          bahasa: 'Sunda-Jawa Campuran',
          swadesh: sPangandaran.kosakataLengkap?.swadeshList || [],
          isActive: false
        });
      }
    }

    return list.map(item => {
      const swadesh = item.swadesh || [];
      const totalCount = swadesh.length || 200;
      const filledCount = swadesh.filter(w => w.bentukLokal && w.bentukLokal.trim() !== '').length;
      const audioCount = swadesh.filter(w => w.audioUrl && w.audioUrl.trim() !== '').length;
      const ipaCount = swadesh.filter(w => w.transkripsiIPA && w.transkripsiIPA.trim() !== '').length;
      const remainingCount = Math.max(0, totalCount - filledCount);

      const filledPercentage = totalCount > 0 
        ? Math.round((filledCount / totalCount) * 1000) / 10 
        : 0;
      const audioPercentage = totalCount > 0 
        ? Math.round((audioCount / totalCount) * 1000) / 10 
        : 0;
      const ipaPercentage = totalCount > 0 
        ? Math.round((ipaCount / totalCount) * 1000) / 10 
        : 0;

      let statusBadge = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
      let statusLabel = 'Belum Terisi (0%)';
      let barColor = 'bg-slate-300 dark:bg-slate-700';

      if (filledPercentage >= 100) {
        statusLabel = 'Lengkap (100%)';
        statusBadge = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
        barColor = 'bg-emerald-500';
      } else if (filledPercentage >= 75) {
        statusLabel = 'Hampir Lengkap (≥75%)';
        statusBadge = 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-800';
        barColor = 'bg-teal-500';
      } else if (filledPercentage >= 40) {
        statusLabel = 'Sebagian Terisi (≥40%)';
        statusBadge = 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
        barColor = 'bg-indigo-500';
      } else if (filledPercentage > 0) {
        statusLabel = 'Mulai Terisi (>0%)';
        statusBadge = 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
        barColor = 'bg-amber-500';
      }

      return {
        id: item.id,
        title: item.title,
        desa: item.desa,
        kecamatan: item.kecamatan,
        kabupaten: item.kabupaten,
        provinsi: item.provinsi,
        bahasa: item.bahasa,
        isActive: item.isActive,
        filledCount,
        totalCount,
        filledPercentage,
        audioCount,
        audioPercentage,
        ipaCount,
        ipaPercentage,
        remainingCount,
        statusLabel,
        statusBadge,
        barColor
      };
    });
  }, [surveys, activeSurveyData, activeSurveyId, titikPengamatan]);

  // Overall aggregate statistics
  const overallStats = useMemo(() => {
    const totalSurveys = surveysProgress.length;
    if (totalSurveys === 0) {
      return {
        avgPercentage: 0,
        fullyCompletedCount: 0,
        totalFilledAcrossAll: 0,
        totalGlossAcrossAll: 0,
        totalSurveys: 0,
        totalAudioAcrossAll: 0,
        totalIpaAcrossAll: 0
      };
    }

    const sumPercentage = surveysProgress.reduce((acc, s) => acc + s.filledPercentage, 0);
    const avgPercentage = Math.round((sumPercentage / totalSurveys) * 10) / 10;
    const fullyCompletedCount = surveysProgress.filter(s => s.filledPercentage >= 100).length;
    const totalFilledAcrossAll = surveysProgress.reduce((acc, s) => acc + s.filledCount, 0);
    const totalGlossAcrossAll = surveysProgress.reduce((acc, s) => acc + s.totalCount, 0);
    const totalAudioAcrossAll = surveysProgress.reduce((acc, s) => acc + s.audioCount, 0);
    const totalIpaAcrossAll = surveysProgress.reduce((acc, s) => acc + s.ipaCount, 0);

    return {
      avgPercentage,
      fullyCompletedCount,
      totalFilledAcrossAll,
      totalGlossAcrossAll,
      totalSurveys,
      totalAudioAcrossAll,
      totalIpaAcrossAll
    };
  }, [surveysProgress]);

  // Available unique languages for filtering
  const availableLanguages = useMemo(() => {
    const set = new Set<string>();
    surveysProgress.forEach(s => {
      if (s.bahasa && s.bahasa !== '-') set.add(s.bahasa);
    });
    return Array.from(set).sort();
  }, [surveysProgress]);

  // Filtered & sorted surveys
  const filteredSurveys = useMemo(() => {
    let result = [...surveysProgress];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(s =>
        s.desa.toLowerCase().includes(q) ||
        s.bahasa.toLowerCase().includes(q) ||
        s.kabupaten.toLowerCase().includes(q) ||
        s.kecamatan.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q)
      );
    }

    if (selectedLanguage !== 'all') {
      result = result.filter(s => s.bahasa === selectedLanguage);
    }

    if (filterStatus === 'complete') {
      result = result.filter(s => s.filledPercentage >= 100);
    } else if (filterStatus === 'incomplete') {
      result = result.filter(s => s.filledPercentage < 100);
    }

    result.sort((a, b) => {
      if (sortBy === 'active_first') {
        if (a.isActive) return -1;
        if (b.isActive) return 1;
        return b.filledPercentage - a.filledPercentage;
      }
      if (sortBy === 'percent_desc') {
        return b.filledPercentage - a.filledPercentage;
      }
      if (sortBy === 'percent_asc') {
        return a.filledPercentage - b.filledPercentage;
      }
      if (sortBy === 'name') {
        return a.desa.localeCompare(b.desa);
      }
      return 0;
    });

    return result;
  }, [surveysProgress, searchQuery, selectedLanguage, filterStatus, sortBy]);

  // Active survey item
  const activeSurveyItem = useMemo(() => {
    return surveysProgress.find(s => s.isActive);
  }, [surveysProgress]);

  // Export progress report to CSV
  const handleExportCSV = () => {
    const headers = [
      'ID Survei',
      'Desa Titik Pengamatan',
      'Kecamatan',
      'Kabupaten/Kota',
      'Provinsi',
      'Bahasa Daerah',
      'Status Survei',
      'Kata Terisi (Swadesh 200)',
      'Total Target Kata',
      'Persentase Keterisian (%)',
      'Sisa Kosong',
      'Jumlah Rekaman Audio',
      'Transkripsi IPA',
      'Status Kelayakan'
    ];

    const rows = filteredSurveys.map(s => [
      `"${s.id}"`,
      `"${s.desa}"`,
      `"${s.kecamatan}"`,
      `"${s.kabupaten}"`,
      `"${s.provinsi}"`,
      `"${s.bahasa}"`,
      `"${s.isActive ? 'Sedang Aktif' : 'Tersimpan'}"`,
      s.filledCount,
      s.totalCount,
      `${s.filledPercentage}%`,
      s.remainingCount,
      s.audioCount,
      s.ipaCount,
      `"${s.statusLabel}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan_kelengkapan_swadesh_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-teal-50 via-sky-50 to-indigo-50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border-2 border-teal-200 dark:border-teal-800/80 rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden transition-all">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                <Percent className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                Matriks Pemantauan Kelengkapan Data
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Real-Time Sync
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Kelengkapan Kosakata Swadesh Real-Time Lintas Survei
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Pantau progres keterisian 200 kosakata dasar Maurice Swadesh untuk seluruh titik pengamatan (TP) secara langsung.
              Keterisian kata, transkripsi fonetis IPA, dan rekaman audio disinkronkan secara real-time untuk mendukung analisis dialektometri yang valid.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-center shrink-0">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-teal-900 dark:text-teal-200 border border-teal-200 dark:border-teal-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Ekspor Laporan (CSV)</span>
            </button>
          </div>
        </div>

        {/* 4 SUMMARY STAT CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-5 mt-4 border-t border-teal-200/80 dark:border-slate-800">
          <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-800/80 border border-teal-200 dark:border-teal-800 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              Rerata Keterisian Proyek
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-teal-700 dark:text-teal-300 font-mono">
                {overallStats.avgPercentage}%
              </span>
              <span className="text-xs text-slate-500 font-medium">rata-rata</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Dari {overallStats.totalSurveys} titik survei terdaftar.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-800/80 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block mb-1">
              Survei 100% Lengkap
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                {overallStats.fullyCompletedCount}
              </span>
              <span className="text-xs text-emerald-700 font-medium">/ {overallStats.totalSurveys} TP</span>
            </div>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
              Siap untuk komparasi leksikostatistik.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-800/80 border border-sky-200 dark:border-sky-800 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300 block mb-1">
              Total Glos Terhimpun
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-sky-700 dark:text-sky-400 font-mono">
                {overallStats.totalFilledAcrossAll}
              </span>
              <span className="text-xs text-sky-600 font-medium">kata</span>
            </div>
            <p className="text-[11px] text-sky-700/80 dark:text-sky-400/80 mt-0.5">
              Dari {overallStats.totalGlossAcrossAll} target Swadesh.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-800/80 border border-purple-200 dark:border-purple-800 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300 block mb-1">
              Kelengkapan Audio & IPA
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-purple-700 dark:text-purple-400 font-mono">
                {overallStats.totalAudioAcrossAll}
              </span>
              <span className="text-xs text-purple-600 font-medium">rekaman</span>
            </div>
            <p className="text-[11px] text-purple-700/80 dark:text-purple-400/80 mt-0.5">
              {overallStats.totalIpaAcrossAll} kata dengan transkripsi fonetis IPA.
            </p>
          </div>
        </div>
      </div>

      {/* HIGHLIGHT: ACTIVE SURVEY CARD */}
      {activeSurveyItem && (
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-850 rounded-2xl border-2 border-teal-400 dark:border-teal-600 shadow-sm ring-2 ring-teal-500/20 space-y-3.5 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-teal-600 text-white tracking-wider flex items-center gap-1 shadow-2xs">
                <Activity className="w-3.5 h-3.5 animate-spin" />
                Survei Sedang Diedit (Aktif)
              </span>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                Desa {activeSurveyItem.desa}
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                ({activeSurveyItem.bahasa} • {activeSurveyItem.kabupaten})
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-teal-700 dark:text-teal-300">
                {activeSurveyItem.filledPercentage}%
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border ${activeSurveyItem.statusBadge}`}>
                {activeSurveyItem.statusLabel}
              </span>
              {onNavigateToForm && (
                <button
                  type="button"
                  onClick={() => onNavigateToForm(activeSurveyItem.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer ml-1"
                >
                  <span>Buka Form</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Large Progress Bar */}
          <div className="space-y-1">
            <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shadow-inner">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${activeSurveyItem.barColor}`}
                style={{ width: `${Math.min(100, activeSurveyItem.filledPercentage)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span>0% Mulai</span>
              <span>Target: 200 Kosakata Swadesh</span>
              <span>{activeSurveyItem.filledCount}/200 Kata Terisi</span>
            </div>
          </div>

          {/* 4 Detail Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
            <div className="p-2.5 bg-emerald-50/80 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <span className="text-emerald-900 dark:text-emerald-200 font-semibold">Sudah Terisi:</span>
              <span className="font-extrabold font-mono text-emerald-800 dark:text-emerald-300">
                {activeSurveyItem.filledCount} kata
              </span>
            </div>
            <div className="p-2.5 bg-rose-50/80 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800 flex items-center justify-between">
              <span className="text-rose-900 dark:text-rose-200 font-semibold">Belum Terisi:</span>
              <span className="font-extrabold font-mono text-rose-800 dark:text-rose-300">
                {activeSurveyItem.remainingCount} kata
              </span>
            </div>
            <div className="p-2.5 bg-sky-50/80 dark:bg-sky-950/30 rounded-xl border border-sky-200 dark:border-sky-800 flex items-center justify-between">
              <span className="text-sky-900 dark:text-sky-200 font-semibold">Ada Audio:</span>
              <span className="font-extrabold font-mono text-sky-800 dark:text-sky-300">
                {activeSurveyItem.audioCount} ({activeSurveyItem.audioPercentage}%)
              </span>
            </div>
            <div className="p-2.5 bg-purple-50/80 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800 flex items-center justify-between">
              <span className="text-purple-900 dark:text-purple-200 font-semibold">Transkripsi IPA:</span>
              <span className="font-extrabold font-mono text-purple-800 dark:text-purple-300">
                {activeSurveyItem.ipaCount} ({activeSurveyItem.ipaPercentage}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* FILTER & ROSTER CONTROLS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-teal-600" />
              <span>Daftar Titik Pengamatan ({filteredSurveys.length} Titik)</span>
            </h3>

            {/* Status Pills */}
            <div className="flex rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden text-xs font-semibold bg-slate-50 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 cursor-pointer transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Semua ({surveysProgress.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('complete')}
                className={`px-3 py-1 cursor-pointer transition-colors ${
                  filterStatus === 'complete'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                100% Lengkap ({overallStats.fullyCompletedCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('incomplete')}
                className={`px-3 py-1 cursor-pointer transition-colors ${
                  filterStatus === 'incomplete'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Belum Lengkap ({surveysProgress.length - overallStats.fullyCompletedCount})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari desa, kecamatan, bahasa..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-7 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl w-44 sm:w-56 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs hover:text-slate-600"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Language filter */}
            {availableLanguages.length > 1 && (
              <select
                value={selectedLanguage}
                onChange={e => setSelectedLanguage(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
              >
                <option value="all">Semua Bahasa</option>
                {availableLanguages.map(b => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            )}

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
            >
              <option value="active_first">Survei Aktif Dahulu</option>
              <option value="percent_desc">Persentase Tertinggi</option>
              <option value="percent_asc">Persentase Terendah</option>
              <option value="name">Nama Desa (A-Z)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                title="Tampilan Kartu"
                className={`p-1.5 transition-colors cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                title="Tampilan Tabel"
                className={`p-1.5 transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT: CARDS VIEW */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredSurveys.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500">
              Tidak ada survei yang sesuai dengan kriteria pencarian atau filter.
            </div>
          ) : (
            filteredSurveys.map(item => (
              <div
                key={`progress_card_${item.id}`}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  item.isActive
                    ? 'bg-white dark:bg-slate-850 border-2 border-teal-400 dark:border-teal-600 shadow-sm ring-2 ring-teal-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-300 hover:shadow-2xs'
                }`}
              >
                <div>
                  {/* Card Top Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                          Desa {item.desa}
                        </h4>
                        {item.isActive && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                            Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {item.bahasa} • {item.kecamatan}, {item.kabupaten}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xl font-black font-mono text-slate-900 dark:text-slate-100">
                        {item.filledPercentage}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-2.5">
                    <div
                      className={`h-2 rounded-full ${item.barColor} transition-all duration-300`}
                      style={{ width: `${Math.min(100, item.filledPercentage)}%` }}
                    />
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 mb-2">
                    <span className="font-semibold">
                      <strong className="text-slate-900 dark:text-slate-100">{item.filledCount}</strong> / {item.totalCount} kata
                      {item.remainingCount > 0 && (
                        <span className="text-rose-600 dark:text-rose-400 font-normal ml-1">
                          ({item.remainingCount} kosong)
                        </span>
                      )}
                    </span>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.statusBadge}`}>
                      {item.statusLabel}
                    </span>
                  </div>

                  {/* Secondary Audio & IPA Tags */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                    <span className="inline-flex items-center gap-1">
                      <Volume2 className="w-3 h-3 text-sky-600" />
                      {item.audioCount > 0 ? `${item.audioCount} audio` : 'Tanpa audio'}
                    </span>
                    <span>•</span>
                    <span>{item.ipaCount} fonetik IPA</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-2">
                  {onSelectSurvey && !item.isActive && (
                    <button
                      type="button"
                      onClick={() => onSelectSurvey(item.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-teal-900 transition-colors cursor-pointer"
                    >
                      Pilih Titik Ini
                    </button>
                  )}

                  {onNavigateToForm && (
                    <button
                      type="button"
                      onClick={() => onNavigateToForm(item.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-200 hover:underline cursor-pointer ml-auto"
                    >
                      <span>Buka Form</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* CONTENT: TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold">
                <tr>
                  <th className="p-3 w-12 text-center">No</th>
                  <th className="p-3">Titik Pengamatan / Desa</th>
                  <th className="p-3">Bahasa Daerah</th>
                  <th className="p-3">Wilayah Administratif</th>
                  <th className="p-3 text-center">Kata Terisi</th>
                  <th className="p-3 text-center">Audio</th>
                  <th className="p-3 text-center">IPA</th>
                  <th className="p-3 text-center w-36">Kelengkapan</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSurveys.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-500">
                      Tidak ada survei yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredSurveys.map((item, idx) => (
                    <tr
                      key={`table_row_${item.id}`}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        item.isActive ? 'bg-teal-50/40 dark:bg-teal-950/20 font-medium' : ''
                      }`}
                    >
                      <td className="p-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span>Desa {item.desa}</span>
                          {item.isActive && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300">
                              Aktif
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">{item.bahasa}</td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">
                        {item.kecamatan}, {item.kabupaten}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                        {item.filledCount} / {item.totalCount}
                      </td>
                      <td className="p-3 text-center font-mono text-slate-600 dark:text-slate-400">
                        {item.audioCount}
                      </td>
                      <td className="p-3 text-center font-mono text-slate-600 dark:text-slate-400">
                        {item.ipaCount}
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="flex justify-between font-mono font-bold text-[11px]">
                            <span>{item.filledPercentage}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${item.barColor}`}
                              style={{ width: `${Math.min(100, item.filledPercentage)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.statusBadge}`}>
                          {item.statusLabel}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {onSelectSurvey && !item.isActive && (
                            <button
                              type="button"
                              onClick={() => onSelectSurvey(item.id)}
                              className="px-2 py-1 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-teal-100 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                              title="Pilih sebagai survei aktif"
                            >
                              Pilih
                            </button>
                          )}
                          {onNavigateToForm && (
                            <button
                              type="button"
                              onClick={() => onNavigateToForm(item.id)}
                              className="p-1 rounded text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Buka form instrumen"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default KelengkapanKosakataSwadeshRoster;
