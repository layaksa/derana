import React, { useState, useMemo } from 'react';
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
import { 
  BarChart3, 
  Users, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Languages, 
  BookA, 
  Mic, 
  ArrowRight, 
  ShieldCheck, 
  ShieldAlert, 
  Filter, 
  Search,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  Globe2,
  Compass,
  BookOpen,
  HelpCircle,
  GraduationCap,
  TrendingUp,
  GitMerge
} from 'lucide-react';
import { SurveyRecord } from '../types/linguistic';
import { AppUser } from '../types/auth';
import { getSectionProgressDetails } from '../utils/calculations';
import { SECTIONS_META } from './NavigationStepper';
import { DescriptiveDialectStats } from './dashboard/DescriptiveDialectStats';
import { NarasumberStatsSummary } from './dashboard/NarasumberStatsSummary';
import { ConflictResolutionModal } from './pwa/ConflictResolutionModal';

interface SummaryDashboardProps {
  surveys: SurveyRecord[];
  activeSurveyId: string | null;
  onSelectSurvey: (id: string) => void;
  onNavigateToSection?: (surveyId: string, sectionIndex: number) => void;
  onSwitchToEditor: () => void;
  currentUser: AppUser | null;
  onToggleVerify?: (surveyId: string) => void;
  selectedProvince?: string;
  onSelectProvince?: (prov: string) => void;
  onNavigateToDialekPeta?: () => void;
  onNavigateToKosakata?: () => void;
  onNavigateToComparison?: () => void;
  onNavigateToPetaSurvei?: () => void;
  onNavigateToDokumentasi?: () => void;
  onNavigateToCorrelation?: () => void;
  onNavigateToAgeRegression?: () => void;
  onNavigateToKecamatanDominance?: () => void;
}

export const SummaryDashboard: React.FC<SummaryDashboardProps> = ({
  surveys,
  activeSurveyId,
  onSelectSurvey,
  onNavigateToSection,
  onSwitchToEditor,
  currentUser,
  onToggleVerify,
  selectedProvince = 'all',
  onSelectProvince,
  onNavigateToDialekPeta,
  onNavigateToKosakata,
  onNavigateToComparison,
  onNavigateToPetaSurvei,
  onNavigateToDokumentasi,
  onNavigateToCorrelation,
  onNavigateToAgeRegression
}) => {
  const [selectedSurveyFor16Sections, setSelectedSurveyFor16Sections] = useState<string>(() => {
    return activeSurveyId || (surveys[0]?.id || '');
  });
  const [searchTable, setSearchTable] = useState('');
  const [filterVerification, setFilterVerification] = useState<'all' | 'verified' | 'pending'>('all');
  const [filterProvince, setFilterProvince] = useState<string>(selectedProvince || 'all');
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);

  // Statistics aggregated per Province
  const provinceStats = useMemo(() => {
    const map = new Map<string, {
      name: string;
      surveyCount: number;
      languages: Set<string>;
      totalInformants: number;
      verifiedCount: number;
      totalSwadesh: number;
      totalBudaya: number;
      sumProgress: number;
    }>();

    surveys.forEach(s => {
      const prov = (s.provinsi || s.data?.titikPengamatan?.provinsi || 'Jawa Barat').trim() || 'Provinsi Lainnya';
      const lang = (s.bahasa || s.data?.titikPengamatan?.bahasaDigunakan || '').trim();
      
      if (!map.has(prov)) {
        map.set(prov, {
          name: prov,
          surveyCount: 0,
          languages: new Set(),
          totalInformants: 0,
          verifiedCount: 0,
          totalSwadesh: 0,
          totalBudaya: 0,
          sumProgress: 0
        });
      }

      const p = map.get(prov)!;
      p.surveyCount++;
      if (lang) p.languages.add(lang);
      if (s.isVerified) p.verifiedCount++;
      p.sumProgress += (s.progress || 0);

      const nList = s.data?.narasumberList || [];
      p.totalInformants += nList.filter(n => n.nama && n.nama.trim() !== '').length;

      const sw = s.data?.kosakataLengkap?.swadeshList || [];
      p.totalSwadesh += sw.filter(w => w.bentukLokal && w.bentukLokal.trim() !== '').length;

      const bd = s.data?.kosakataLengkap?.kosakataBudaya || [];
      bd.forEach(b => {
        p.totalBudaya += b.daftarKata.filter(w => w.bentukLokal && w.bentukLokal.trim() !== '').length;
      });
    });

    return Array.from(map.values()).map(p => ({
      name: p.name,
      surveyCount: p.surveyCount,
      languageCount: p.languages.size,
      languagesList: Array.from(p.languages),
      totalInformants: p.totalInformants,
      verifiedCount: p.verifiedCount,
      totalKosakata: p.totalSwadesh + p.totalBudaya,
      avgProgress: p.surveyCount > 0 ? Math.round(p.sumProgress / p.surveyCount) : 0
    }));
  }, [surveys]);

  // Province comparison chart data
  const provinceChartData = useMemo(() => {
    return provinceStats.map(p => ({
      provinsi: p.name,
      titikSurvei: p.surveyCount,
      bahasa: p.languageCount,
      kosakata: Math.round(p.totalKosakata / 10), // scaled for dual axis visualization
      progres: p.avgProgress
    }));
  }, [provinceStats]);

  // Overall Statistics across all surveys
  const overallStats = useMemo(() => {
    const totalSurveys = surveys.length;
    
    // Total narasumber (informan) with valid names
    let totalNarasumber = 0;
    surveys.forEach(s => {
      const list = s.data?.narasumberList || [];
      const validPersons = list.filter(n => n.nama && n.nama.trim() !== '');
      totalNarasumber += validPersons.length;
    });

    // Verification counts
    const verifiedSurveys = surveys.filter(s => s.isVerified).length;
    const pendingSurveys = totalSurveys - verifiedSurveys;

    // Vocabulary & audio stats
    let totalSwadeshFilled = 0;
    let totalBudayaFilled = 0;
    let totalAudioRecordings = 0;

    surveys.forEach(s => {
      const swadesh = s.data?.kosakataLengkap?.swadeshList || [];
      const budaya = s.data?.kosakataLengkap?.kosakataBudaya || [];

      totalSwadeshFilled += swadesh.filter(w => w.bentukLokal && w.bentukLokal.trim() !== '').length;
      totalAudioRecordings += swadesh.filter(w => w.audioUrl && w.audioUrl.trim() !== '').length;

      budaya.forEach(b => {
        totalBudayaFilled += b.daftarKata.filter(w => w.bentukLokal && w.bentukLokal.trim() !== '').length;
        totalAudioRecordings += b.daftarKata.filter(w => w.audioUrl && w.audioUrl.trim() !== '').length;
      });
    });

    const avgProgress = totalSurveys > 0
      ? Math.round(surveys.reduce((acc, s) => acc + (s.progress || 0), 0) / totalSurveys)
      : 0;

    return {
      totalSurveys,
      totalNarasumber,
      verifiedSurveys,
      pendingSurveys,
      totalSwadeshFilled,
      totalBudayaFilled,
      totalAudioRecordings,
      avgProgress
    };
  }, [surveys]);

  // Data for Chart 1: Progress of each survey
  const surveyProgressChartData = useMemo(() => {
    return surveys.map(s => ({
      id: s.id,
      name: s.desa || s.title.replace('Survei Titik Pengamatan ', 'Desa '),
      progress: s.progress || 0,
      completedSections: s.completedSectionsCount || 0,
      isVerified: s.isVerified
    }));
  }, [surveys]);

  // Data for Chart 2: 16 Sections completeness breakdown for a selected survey
  const targetSurveyRecord = useMemo(() => {
    return surveys.find(s => s.id === selectedSurveyFor16Sections) || surveys[0];
  }, [surveys, selectedSurveyFor16Sections]);

  const sections16ChartData = useMemo(() => {
    if (!targetSurveyRecord || !targetSurveyRecord.data) {
      return SECTIONS_META.map(meta => ({
        sectionNumber: `Sec ${meta.number}`,
        fullName: meta.title,
        statusVal: 0,
        isFilled: false
      }));
    }

    const details = getSectionProgressDetails(targetSurveyRecord.data);
    return details.sections.map(sec => ({
      sectionNumber: `S-${sec.number}`,
      fullName: sec.title,
      statusVal: sec.isFilled ? 100 : 15,
      isFilled: sec.isFilled,
      summary: sec.summary
    }));
  }, [targetSurveyRecord]);

  // Data for Vocabulary completeness comparison per village
  const vocabComparisonChartData = useMemo(() => {
    return surveys.map(s => {
      const swadesh = s.data?.kosakataLengkap?.swadeshList || [];
      const budaya = s.data?.kosakataLengkap?.kosakataBudaya || [];
      const swadeshFilled = swadesh.filter(w => w.bentukLokal && w.bentukLokal.trim() !== '').length;
      
      let budayaFilled = 0;
      budaya.forEach(b => {
        budayaFilled += b.daftarKata.filter(w => w.bentukLokal && w.bentukLokal.trim() !== '').length;
      });

      return {
        desa: s.desa || s.title.slice(0, 15),
        swadesh: swadeshFilled,
        budaya: budayaFilled,
        swadeshPersen: Math.round((swadeshFilled / 200) * 100)
      };
    });
  }, [surveys]);

  // Table rows per village
  const villageSummaryRows = useMemo(() => {
    return surveys.map((s, idx) => {
      const swadesh = s.data?.kosakataLengkap?.swadeshList || [];
      const budaya = s.data?.kosakataLengkap?.kosakataBudaya || [];
      const narasumber = s.data?.narasumberList || [];

      const swadeshFilled = swadesh.filter(w => w.bentukLokal && w.bentukLokal.trim() !== '').length;
      let budayaFilled = 0;
      let audioCount = swadesh.filter(w => w.audioUrl).length;

      budaya.forEach(b => {
        budayaFilled += b.daftarKata.filter(w => w.bentukLokal && w.bentukLokal.trim() !== '').length;
        audioCount += b.daftarKata.filter(w => w.audioUrl).length;
      });

      const validNarasumber = narasumber.filter(n => n.nama && n.nama.trim() !== '').length;
      const prov = s.provinsi || s.data?.titikPengamatan?.provinsi || 'Jawa Barat';

      return {
        id: s.id,
        index: idx + 1,
        desa: s.desa || s.data?.titikPengamatan?.namaDesa || 'Belum dinamai',
        kecamatan: s.kecamatan || s.data?.titikPengamatan?.kecamatan || '-',
        kabupatenKota: s.kabupatenKota || s.data?.titikPengamatan?.kabupatenKota || '-',
        provinsi: prov,
        bahasa: s.bahasa || s.data?.titikPengamatan?.bahasaDigunakan || '-',
        progress: s.progress || 0,
        completedSections: s.completedSectionsCount || 0,
        narasumberCount: validNarasumber,
        swadeshFilled,
        budayaFilled,
        audioCount,
        isVerified: s.isVerified || false,
        surveyor: s.createdByName || 'Surveyor'
      };
    }).filter(row => {
      if (filterProvince !== 'all' && row.provinsi !== filterProvince) return false;
      if (filterVerification === 'verified' && !row.isVerified) return false;
      if (filterVerification === 'pending' && row.isVerified) return false;
      if (!searchTable) return true;
      const q = searchTable.toLowerCase();
      return (
        row.desa.toLowerCase().includes(q) ||
        row.kecamatan.toLowerCase().includes(q) ||
        row.kabupatenKota.toLowerCase().includes(q) ||
        row.provinsi.toLowerCase().includes(q) ||
        row.bahasa.toLowerCase().includes(q) ||
        row.surveyor.toLowerCase().includes(q)
      );
    });
  }, [surveys, searchTable, filterVerification, filterProvince]);

  const handleOpenFormAtSection = (surveyId: string, sectionNumber: number) => {
    onSelectSurvey(surveyId);
    if (onNavigateToSection) {
      onNavigateToSection(surveyId, sectionNumber - 1);
    } else {
      onSwitchToEditor();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-slate-100">
      {/* 1. KEY STATISTICS KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: Total Titik / Desa */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Total Desa Survei</span>
            <div className="p-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{overallStats.totalSurveys}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">titik</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Rerata kelengkapan: <strong className="text-indigo-700 dark:text-indigo-400">{overallStats.avgProgress}%</strong>
          </div>
        </div>

        {/* Card 2: Total Narasumber */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Total Narasumber</span>
            <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{overallStats.totalNarasumber}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">informan</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Dari 3 kuota per desa
          </div>
        </div>

        {/* Card 3: Status Verifikasi */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Status Verifikasi</span>
            <div className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{overallStats.verifiedSurveys}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">/ {overallStats.totalSurveys} diverifikasi</span>
          </div>
          <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 font-medium">
            {overallStats.pendingSurveys} menunggu telaah
          </div>
        </div>

        {/* Card 4: Kosakata Swadesh Terisi */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Kosakata Swadesh</span>
            <div className="p-1.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-100 dark:border-teal-900/40">
              <BookA className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{overallStats.totalSwadeshFilled}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">kata</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            + {overallStats.totalBudayaFilled} kosakata budaya
          </div>
        </div>

        {/* Card 5: Rekaman Audio Terunggah */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-2xs col-span-2 lg:col-span-1 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Rekaman Audio</span>
            <div className="p-1.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40">
              <Mic className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-purple-900 dark:text-purple-300">{overallStats.totalAudioRecordings}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">file suara</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Transkripsi terverifikasi audio
          </div>
        </div>
      </div>

      {/* BANNER SHORTCUT: PETA TITIK SURVEI LAPANGAN (LEAFLET GIS) - BENTO ACTION MATRIX */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 rounded-2xl p-5 sm:p-6 text-white shadow-md transition-all space-y-4">
        
        {/* Header Seksi Geospasial: Full-width agar judul dan deskripsi tidak tertekan */}
        <div className="flex items-start sm:items-center justify-between gap-4 pb-3 border-b border-white/15">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Peta Titik Survei Lapangan (Leaflet GIS)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white border border-white/30 shadow-2xs">
                  {surveys.length} Titik Terdata
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-400/25 text-emerald-100 border border-emerald-300/30 hidden sm:inline-block">
                  Geospasial Aktif
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-3xl leading-relaxed">
                Eksplorasi persebaran geospasial titik pengamatan kebahasaan, multi-basemap (Google Maps Road/Satelit & Esri), filter penanda verifikasi, dan rentang usia informan.
              </p>
            </div>
          </div>
        </div>

        {/* Menu Aksi Bento: 5 Tombol Tertata Rapi, Proporsional & Responsif */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-200/90 mb-2 flex items-center justify-between">
            <span>Akses Cepat Modul Analisis, Peta & Panduan:</span>
            <span className="text-[10px] text-blue-200/70 font-normal hidden sm:inline">5 Alat Interaktif</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
            
            {/* 1. Buku Panduan */}
            {onNavigateToDokumentasi && (
              <button
                type="button"
                onClick={onNavigateToDokumentasi}
                className="flex items-center gap-2.5 p-3 rounded-xl text-left bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all cursor-pointer group hover:border-white/40 shadow-2xs hover:shadow-xs active:scale-98"
                title="Buka Menu Dokumentasi & Panduan Penggunaan"
              >
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 text-white group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-white leading-tight truncate">
                    Buku Panduan
                  </div>
                  <div className="text-[10px] text-blue-200 leading-tight mt-0.5 truncate">
                    Dokumentasi sistem
                  </div>
                </div>
              </button>
            )}

            {/* 2. Korelasi Pendidikan & Dialek */}
            {onNavigateToCorrelation && (
              <button
                type="button"
                onClick={onNavigateToCorrelation}
                className="flex items-center gap-2.5 p-3 rounded-xl text-left bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all cursor-pointer group hover:border-white/40 shadow-2xs hover:shadow-xs active:scale-98"
                title="Analisis Korelasi Pendidikan Narasumber vs Variasi Dialek (Scatter Plot Recharts)"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-400/20 text-emerald-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-4 h-4 text-emerald-300" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-white leading-tight truncate">
                    Korelasi Pendidikan
                  </div>
                  <div className="text-[10px] text-emerald-200 leading-tight mt-0.5 truncate">
                    Scatter plot dialek
                  </div>
                </div>
              </button>
            )}

            {/* 3. Regresi Usia & Tren Dialek */}
            {onNavigateToAgeRegression && (
              <button
                type="button"
                onClick={onNavigateToAgeRegression}
                className="flex items-center gap-2.5 p-3 rounded-xl text-left bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all cursor-pointer group hover:border-white/40 shadow-2xs hover:shadow-xs active:scale-98"
                title="Analisis Regresi Usia vs Variabel Bahasa & Tren Perubahan Dialek (Grafik Tren Recharts)"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-400/20 text-teal-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-4 h-4 text-teal-300" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-white leading-tight truncate">
                    Regresi Usia & Tren
                  </div>
                  <div className="text-[10px] text-teal-200 leading-tight mt-0.5 truncate">
                    Tren dialek informan
                  </div>
                </div>
              </button>
            )}

            {/* 4. Resolusi Konflik (Auto-Resolve) */}
            <button
              type="button"
              onClick={() => setIsConflictModalOpen(true)}
              className="flex items-center gap-2.5 p-3 rounded-xl text-left bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-100 border border-emerald-400/40 backdrop-blur-sm transition-all cursor-pointer group hover:border-emerald-300/60 shadow-2xs hover:shadow-xs active:scale-98"
              title="Kelola & pantau strategi Auto-Resolve resolusi konflik sinkronisasi multi-pengguna"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-400/20 text-emerald-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <GitMerge className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs sm:text-sm text-white leading-tight truncate">
                  Resolusi Konflik
                </div>
                <div className="text-[10px] text-emerald-200 leading-tight mt-0.5 truncate">
                  Auto-Resolve sync
                </div>
              </div>
            </button>

            {/* 5. Buka Peta Spasial */}
            {onNavigateToPetaSurvei && (
              <button
                type="button"
                onClick={onNavigateToPetaSurvei}
                className="flex items-center gap-2.5 p-3 rounded-xl text-left bg-white text-blue-700 hover:bg-blue-50 border border-white shadow-sm hover:shadow-md transition-all cursor-pointer group col-span-2 sm:col-span-1 active:scale-98"
                title="Buka Peta Interaktif Leaflet GIS Titik Survei Lapangan"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-blue-900 leading-tight truncate">
                    Buka Peta Spasial ↗
                  </div>
                  <div className="text-[10px] text-blue-600 font-medium leading-tight mt-0.5 truncate">
                    Peta Leaflet GIS
                  </div>
                </div>
              </button>
            )}

          </div>
        </div>
      </div>

      {/* 2. STATISTIK DESKRIPTIF SEBARAN DIALEK & AGREGAT LEKSIKAL GUITER */}
      <DescriptiveDialectStats
        surveys={surveys}
        activeSurveyId={activeSurveyId}
        onSelectSurvey={onSelectSurvey}
        onNavigateToDialekPeta={onNavigateToDialekPeta}
        onNavigateToKosakata={onNavigateToKosakata}
        onNavigateToComparison={onNavigateToComparison}
        onNavigateToCorrelation={onNavigateToCorrelation}
      />

      {/* 3. RINGKASAN STATISTIK DEMOGRAFI NARASUMBER (USIA & PENDIDIKAN) */}
      <NarasumberStatsSummary
        surveys={surveys}
        activeSurveyId={activeSurveyId}
        onSelectSurvey={onSelectSurvey}
        onNavigateToSection={onNavigateToSection}
        onSwitchToEditor={onSwitchToEditor}
        onNavigateToCorrelation={onNavigateToCorrelation}
        onNavigateToAgeRegression={onNavigateToAgeRegression}
      />

      {/* 4. PROVINCE-BY-PROVINCE BREAKDOWN & BENTO COMPARISON */}
      <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 shadow-xs space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-slate-900 text-indigo-600 dark:text-sky-400 flex items-center justify-center border border-indigo-100 dark:border-slate-700 shrink-0">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-200">
                  Statistik & Distribusi Wilayah Per Provinsi
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-slate-900 text-indigo-700 dark:text-sky-300 border border-indigo-200 dark:border-slate-700">
                  {provinceStats.length} Provinsi
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
                Perbandingan data lapangan, kelengkapan kosakata, dan penutur asli di setiap provinsi yang diteliti.
              </p>
            </div>
          </div>

          {/* Quick province selector pills */}
          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setFilterProvince('all');
                if (onSelectProvince) onSelectProvince('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                filterProvince === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              Semua Wilayah
            </button>
            {provinceStats.map(p => {
              const isSelected = filterProvince === p.name;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => {
                    const nextVal = isSelected ? 'all' : p.name;
                    setFilterProvince(nextVal);
                    if (onSelectProvince) onSelectProvince(nextVal);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {p.name} ({p.surveyCount})
                </button>
              );
            })}
          </div>
        </div>

        {/* Bento Grid: Province Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {provinceStats.map(p => {
            const isSelected = filterProvince === p.name;
            return (
              <div 
                key={p.name}
                onClick={() => {
                  const nextVal = isSelected ? 'all' : p.name;
                  setFilterProvince(nextVal);
                  if (onSelectProvince) onSelectProvince(nextVal);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-50/50 dark:bg-slate-900 border-indigo-600 dark:border-sky-400 ring-2 ring-indigo-500/10'
                    : 'bg-slate-50/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-sky-300 flex items-center justify-center font-bold text-xs shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200">
                        {p.name}
                      </h4>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {p.surveyCount} Titik Desa
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Bahasa Daerah</span>
                      <strong className="text-indigo-600 dark:text-sky-400">{p.languageCount} Bahasa</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Informan Terdata</span>
                      <strong className="text-slate-800 dark:text-slate-200">{p.totalInformants} Orang</strong>
                    </div>
                  </div>

                  <div className="space-y-1 mb-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-300">Rerata Progres:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{p.avgProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 dark:bg-sky-400"
                        style={{ width: `${p.avgProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {p.verifiedCount} Terverifikasi
                  </span>
                  <span className="text-indigo-600 dark:text-sky-400 font-bold flex items-center gap-0.5">
                    <span>{isSelected ? 'Sedang Dipilih' : 'Pilih Provinsi'}</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Province Bar Chart Comparison */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Grafik Komparasi Titik Survei & Ragam Bahasa Antar-Provinsi
            </h4>
            <span className="text-[11px] text-slate-400">Data teragregasi</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={provinceChartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b833" />
                <XAxis dataKey="provinsi" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                <Bar dataKey="titikSurvei" name="Titik Desa Survei" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="bahasa" name="Ragam Bahasa Daerah" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="progres" name="Rerata Kelengkapan (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. RECHARTS SECTION: GRAFIK BATANG PROGRES 16 SECTION KUESIONER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Chart: 16 Sections Completeness for Selected Survey */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Grafik Batang Kelengkapan 16 Bagian Kuesioner
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Evaluasi status keterisian Section 1 sampai 16 pada instrumen titik pengamatan.
              </p>
            </div>

            {/* Selector for which survey to inspect */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0">Titik Survei:</span>
              <select
                value={selectedSurveyFor16Sections}
                onChange={(e) => setSelectedSurveyFor16Sections(e.target.value)}
                className="px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500 transition-colors"
              >
                {surveys.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.desa ? `Desa ${s.desa}` : s.title} ({s.progress}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sections16ChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b833" />
                <XAxis 
                  dataKey="sectionNumber" 
                  tick={{ fontSize: 11, fill: '#94a3b8' }} 
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                />
                <YAxis 
                  domain={[0, 100]} 
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  unit="%"
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length > 0 && payload[0]?.payload) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 dark:bg-slate-800 text-white p-2.5 rounded-md text-xs shadow-lg space-y-1 border border-slate-700">
                          <div className="font-bold text-indigo-300">{d.sectionNumber}: {d.fullName}</div>
                          <div className="text-[11px] flex items-center gap-1.5">
                            <span>Status:</span>
                            <span className={d.isFilled ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                              {d.isFilled ? 'Lengkap Terisi (100%)' : 'Belum Lengkap (<100%)'}
                            </span>
                          </div>
                          {d.summary && (
                            <div className="text-[10px] text-slate-300 border-t border-slate-700 pt-1 mt-1">
                              Rincian: {d.summary}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="statusVal" 
                  radius={[3, 3, 0, 0]}
                  name="Tingkat Keterisian"
                >
                  {sections16ChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isFilled ? '#4f46e5' : '#94a3b855'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-indigo-600 inline-block" />
                <span className="font-medium">Bagian Lengkap ({targetSurveyRecord?.completedSectionsCount || 0}/16)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-slate-300 dark:bg-slate-700 inline-block" />
                <span className="font-medium">Perlu Pengisian ({16 - (targetSurveyRecord?.completedSectionsCount || 0)} bagian)</span>
              </span>
            </div>

            {targetSurveyRecord && (
              <button
                type="button"
                onClick={() => {
                  onSelectSurvey(targetSurveyRecord.id);
                  onSwitchToEditor();
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 cursor-pointer"
              >
                <span>Buka Formulir {targetSurveyRecord.desa ? `Desa ${targetSurveyRecord.desa}` : ''}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Chart: Progress Comparison Across All Surveys */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4 flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Languages className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Perbandingan Kelengkapan per Desa
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Persentase total kelengkapan data instrumen dari semua survei lapangan yang terdaftar.
            </p>

            <div className="h-64 w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={surveyProgressChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#94a3b833" />
                  <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                    width={80}
                  />
                  <Tooltip 
                    formatter={(val: any) => [`${val}%`, 'Kelengkapan']}
                  />
                  <Bar dataKey="progress" radius={[0, 3, 3, 0]}>
                    {surveyProgressChartData.map((entry, idx) => (
                      <Cell 
                        key={`prog-${idx}`}
                        fill={entry.progress === 100 ? '#10b981' : entry.progress >= 50 ? '#6366f1' : '#f59e0b'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-md border border-slate-200 dark:border-slate-750 text-xs space-y-1">
            <div className="font-semibold text-slate-800 dark:text-slate-200">Keterangan Warna:</div>
            <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" /> 100% Selesai
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500 inline-block" /> ≥50% Progres
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" /> &lt;50% Awal
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CHART: KELENGKAPAN KOSAKATA SWADESH & BUDAYA PER DESA */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookA className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Kelengkapan Kosakata (200 Swadesh & Budaya) per Desa</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Membandingkan jumlah kata yang telah didokumentasikan bentuk lokalnya di setiap titik pengamatan.
            </p>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={vocabComparisonChartData}
              margin={{ top: 10, right: 20, left: -10, bottom: 15 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b833" />
              <XAxis dataKey="desa" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
              <Bar dataKey="swadesh" name="200 Swadesh Terisi" fill="#0d9488" radius={[3, 3, 0, 0]} />
              <Bar dataKey="budaya" name="Kosakata Budaya Terisi" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. TABEL RESPONSIF RINGKASAN SELURUH SURVEI */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
        {/* Table Filter Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100">
              Tabel Progres Pengisian Kuesioner per Desa
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
              {villageSummaryRows.length} Titik
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
              <input
                type="text"
                value={searchTable}
                onChange={(e) => setSearchTable(e.target.value)}
                placeholder="Cari desa, bahasa, surveyor..."
                className="pl-8 pr-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 w-44 sm:w-56 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            {/* Verification filter */}
            <select
              value={filterVerification}
              onChange={(e: any) => setFilterVerification(e.target.value)}
              className="px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-medium transition-colors"
            >
              <option value="all">Semua Status Verifikasi</option>
              <option value="verified">Hanya Terverifikasi</option>
              <option value="pending">Hanya Menunggu Verifikasi</option>
            </select>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700 text-[11px]">
              <tr>
                <th className="p-3 w-10 text-center">No</th>
                <th className="p-3">Desa & Wilayah</th>
                <th className="p-3">Bahasa Terpetakan</th>
                <th className="p-3 text-center">Narasumber</th>
                <th className="p-3">Kelengkapan 16 Bagian</th>
                <th className="p-3 text-center">Kosakata Swadesh</th>
                <th className="p-3 text-center">Rekaman Audio</th>
                <th className="p-3 text-center">Status Verifikasi</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {villageSummaryRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 text-xs">
                    Tidak ada data survei yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                villageSummaryRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 text-center font-mono text-slate-400 font-medium">
                      {row.index}
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{row.desa}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Kec. {row.kecamatan}, {row.kabupatenKota}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Surveyor: {row.surveyor}
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md text-[11px] border border-indigo-200 dark:border-indigo-800">
                        <Languages className="w-3 h-3" />
                        <span>{row.bahasa}</span>
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <span className={`inline-block font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                        row.narasumberCount >= 3 
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' 
                          : row.narasumberCount > 0 
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {row.narasumberCount}/3 orang
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="w-36">
                        <div className="flex items-center justify-between text-[11px] mb-1 font-medium text-slate-700 dark:text-slate-300">
                          <span>{row.completedSections}/16 bagian</span>
                          <span className="font-bold">{row.progress}%</span>
                        </div>
                        <div className="w-full h-2 rounded-sm bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              row.progress === 100 
                                ? 'bg-emerald-500' 
                                : row.progress >= 50 
                                  ? 'bg-indigo-600' 
                                  : 'bg-amber-500'
                            }`}
                            style={{ width: `${row.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="p-3 text-center">
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {row.swadeshFilled}/200
                      </span>
                      <div className="text-[10px] text-slate-400">
                        +{row.budayaFilled} budaya
                      </div>
                    </td>

                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        row.audioCount > 0 
                          ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}>
                        <Mic className="w-3 h-3" />
                        <span>{row.audioCount}</span>
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      {row.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Terverifikasi</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Menunggu</span>
                        </span>
                      )}

                      {/* Super Admin Quick Verification Toggle */}
                      {currentUser?.role === 'admin' && onToggleVerify && (
                        <div className="mt-1">
                          <button
                            type="button"
                            onClick={() => onToggleVerify(row.id)}
                            className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 underline cursor-pointer"
                          >
                            {row.isVerified ? 'Batal Verifikasi' : 'Setujui Verifikasi'}
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectSurvey(row.id);
                          onSwitchToEditor();
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-200 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold transition-colors cursor-pointer"
                        title="Buka pengisian kuesioner desa ini"
                      >
                        <span>Buka Form</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Pengaturan & Riwayat Resolusi Konflik Auto-Resolve */}
      <ConflictResolutionModal
        isOpen={isConflictModalOpen}
        onClose={() => setIsConflictModalOpen(false)}
      />
    </div>
  );
};
