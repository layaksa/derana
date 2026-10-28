import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Download, 
  Copy, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  Upload, 
  FileSpreadsheet, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Languages, 
  Users, 
  ArrowRight, 
  BarChart3, 
  Check, 
  Compass,
  FileJson,
  BookOpen,
  BookA,
  Scale,
  Shield,
  ShieldCheck,
  ShieldAlert,
  User,
  UserCheck,
  Lock,
  Eye,
  Mic,
  Activity,
  Cloud,
  CloudOff,
  Database,
  RefreshCw,
  GraduationCap,
  TrendingUp,
  Building2,
  LayoutGrid,
  FileText,
  Layers,
  ExternalLink
} from 'lucide-react';
import { SurveyRecord } from '../types/linguistic';
import { AppUser } from '../types/auth';
import { canUserEditSurvey, canUserDeleteSurvey, canUserVerifySurvey } from '../utils/authStorage';
import { getSectionProgressDetails } from '../utils/calculations';
import { 
  downloadSingleSurveyJSON, 
  downloadAllSurveysJSON, 
  downloadSurveysSummaryCSV 
} from '../utils/surveyStorage';
import { SummaryDashboard } from './SummaryDashboard';
import { SurveysLeafletMap } from './dashboard/SurveysLeafletMap';
import { DescriptiveDialectStats } from './dashboard/DescriptiveDialectStats';
import { NarasumberStatsSummary } from './dashboard/NarasumberStatsSummary';
import { EducationDialectCorrelationAnalysis } from './dashboard/EducationDialectCorrelationAnalysis';
import { AgeLanguageRegressionTrendAnalysis } from './dashboard/AgeLanguageRegressionTrendAnalysis';
import { KecamatanDialectDominanceStats } from './dashboard/KecamatanDialectDominanceStats';
import { PetaSastraLisanView } from './views/PetaSastraLisanView';
import { PetaVitalitasView } from './views/PetaVitalitasView';
import { PetaRevitalisasiView } from './views/PetaRevitalisasiView';
import { loadSastraLisanRecords } from '../utils/sastraLisanStorage';
import { loadVitalitasResponses } from '../utils/vitalitasStorage';
import { loadMonevRecords, loadRAPRecords } from '../utils/revitalisasiStorage';
import { FirebaseConnectionStatus, firebaseConfig } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  surveys: SurveyRecord[];
  activeSurveyId: string | null;
  onSelectSurvey: (id: string) => void;
  onCreateNew: (type: 'empty' | 'sample') => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onImportJSON: (file: File) => void;
  onSwitchToEditor: () => void;
  onSwitchToComparison?: () => void;
  onNavigateToSection?: (surveyId: string, sectionIndex: number) => void;
  onNavigateToDialekPeta?: () => void;
  onNavigateToKosakata?: () => void;
  onNavigateToRevitalisasi?: () => void;
  onNavigateToDokumentasi?: () => void;
  onNavigateToAtlasGlottolog?: () => void;
  currentUser: AppUser | null;
  onToggleVerify?: (id: string) => void;
  firebaseStatus?: FirebaseConnectionStatus;
  onManualSync?: () => void;
  onOpenRegionalReport?: () => void;
  onNavigateToPetaCarto?: () => void;
  onNavigateToView?: (viewKey: string) => void;
  initialViewMode?: 'ringkasan' | 'peta_survei' | 'narasumber_stats' | 'dialek_stats' | 'dominasi_kecamatan' | 'korelasi_pendidikan' | 'regresi_usia_bahasa' | 'daftar';
}

export const Dashboard: React.FC<DashboardProps> = ({
  surveys,
  activeSurveyId,
  onSelectSurvey,
  onCreateNew,
  onDuplicate,
  onDelete,
  onImportJSON,
  onSwitchToEditor,
  onSwitchToComparison,
  onNavigateToSection,
  onNavigateToDialekPeta,
  onNavigateToKosakata,
  onNavigateToRevitalisasi,
  onNavigateToDokumentasi,
  onNavigateToAtlasGlottolog,
  currentUser,
  onToggleVerify,
  firebaseStatus = 'connected',
  onManualSync,
  onOpenRegionalReport,
  onNavigateToPetaCarto,
  onNavigateToView,
  initialViewMode = 'ringkasan'
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [viewMode, setViewMode] = useState<'ringkasan' | 'peta_survei' | 'narasumber_stats' | 'dialek_stats' | 'dominasi_kecamatan' | 'korelasi_pendidikan' | 'regresi_usia_bahasa' | 'daftar'>(initialViewMode);
  const [topMapTab, setTopMapTab] = useState<'bahasa' | 'sastra_lisan' | 'vitalitas' | 'revitalisasi'>('bahasa');
  const [sastraCount, setSastraCount] = useState<number>(0);
  const [vitalitasCount, setVitalitasCount] = useState<number>(0);
  const [revitalisasiCount, setRevitalisasiCount] = useState<number>(0);

  useEffect(() => {
    try {
      const sastra = loadSastraLisanRecords();
      setSastraCount(sastra.length);
      const vitalitas = loadVitalitasResponses();
      setVitalitasCount(vitalitas.length);
      const monev = loadMonevRecords();
      const rap = loadRAPRecords();
      setRevitalisasiCount(monev.length + rap.length);
    } catch (e) {
      console.error('Error loading top map data counts:', e);
    }
  }, []);

  // Sync viewMode if initialViewMode prop changes from parent
  useEffect(() => {
    if (initialViewMode) {
      setViewMode(initialViewMode);
    }
  }, [initialViewMode]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress'>('all');
  const [ownershipFilter, setOwnershipFilter] = useState<'all' | 'mine' | 'others'>('all');
  const [sortBy, setSortBy] = useState<'updated_desc' | 'updated_asc' | 'progress_desc' | 'progress_asc' | 'title_asc'>('updated_desc');
  const [expandedChecklists, setExpandedChecklists] = useState<Record<string, boolean>>({});
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Statistics
  const stats = useMemo(() => {
    const total = surveys.length;
    const completed = surveys.filter(s => s.progress === 100).length;
    const inProgress = surveys.filter(s => s.progress < 100).length;
    const avgProgress = total > 0 
      ? Math.round(surveys.reduce((acc, s) => acc + s.progress, 0) / total) 
      : 0;

    // Distinct languages surveyed
    const languages = Array.from(
      new Set(
        surveys
          .map(s => s.bahasa || s.data?.titikPengamatan?.bahasaDigunakan)
          .filter(Boolean)
      )
    );

    // Total narasumber (informan) with valid names
    let totalNarasumber = 0;
    surveys.forEach(s => {
      const list = s.data?.narasumberList || [];
      const validPersons = list.filter(n => n.nama && n.nama.trim() !== '');
      totalNarasumber += validPersons.length;
    });

    // Verification statistics
    const verifiedSurveys = surveys.filter(s => s.isVerified).length;
    const pendingSurveys = total - verifiedSurveys;
    const verifiedPercent = total > 0 ? Math.round((verifiedSurveys / total) * 100) : 0;

    // Vocabulary counts & audio recordings
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

    const totalKosakataRecorded = totalSwadeshFilled + totalBudayaFilled;

    return { 
      total, 
      completed, 
      inProgress, 
      avgProgress, 
      languages, 
      totalNarasumber,
      verifiedSurveys,
      pendingSurveys,
      verifiedPercent,
      totalSwadeshFilled,
      totalBudayaFilled,
      totalKosakataRecorded,
      totalAudioRecordings
    };
  }, [surveys]);

  // Filtered & Sorted Surveys
  const filteredSurveys = useMemo(() => {
    let result = surveys.filter(s => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        (s.title && s.title.toLowerCase().includes(q)) ||
        (s.desa && s.desa.toLowerCase().includes(q)) ||
        (s.bahasa && s.bahasa.toLowerCase().includes(q)) ||
        (s.kecamatan && s.kecamatan.toLowerCase().includes(q)) ||
        (s.kabupatenKota && s.kabupatenKota.toLowerCase().includes(q)) ||
        (s.provinsi && s.provinsi.toLowerCase().includes(q)) ||
        (s.createdByName && s.createdByName.toLowerCase().includes(q));

      if (!matchSearch) return false;

      // Filter by Ownership
      if (ownershipFilter === 'mine') {
        if (currentUser && s.createdBy !== currentUser.id) return false;
      } else if (ownershipFilter === 'others') {
        if (currentUser && s.createdBy === currentUser.id) return false;
      }

      if (statusFilter === 'completed') {
        return s.progress === 100;
      } else if (statusFilter === 'in_progress') {
        return s.progress < 100;
      }
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === 'updated_desc') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else if (sortBy === 'updated_asc') {
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else if (sortBy === 'progress_desc') {
        return b.progress - a.progress;
      } else if (sortBy === 'progress_asc') {
        return a.progress - b.progress;
      } else if (sortBy === 'title_asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });

    return result;
  }, [surveys, searchQuery, statusFilter, sortBy]);

  const toggleChecklist = (id: string) => {
    setExpandedChecklists(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJSON(file);
      e.target.value = '';
    }
  };

  const currentActiveSurvey = surveys.find(s => s.id === activeSurveyId);

  return (
    <div className="max-w-7xl mx-auto px-0 sm:px-2 lg:px-4 py-2 sm:py-3 space-y-5 sm:space-y-6">
      {/* Hidden File Input for JSON import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".json"
        className="hidden"
      />

      {/* User Identity & Role Banner */}
      {currentUser && (
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
          currentUser.role === 'admin'
? 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/60'
 : 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/60'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-2xs shrink-0 ${
              currentUser.role === 'admin' ? 'bg-indigo-600' : 'bg-blue-600'
            }`}>
              {currentUser.role === 'admin' ? <ShieldCheck className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{currentUser.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  currentUser.role === 'admin' 
                    ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700' 
                    : 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                }`}>
                  {currentUser.role === 'admin' ? 'Superuser / Admin' : 'Surveyor Lapangan'}
                </span>
                {currentUser.username && (
                  <span className="text-[10px] text-slate-400 font-mono">@{currentUser.username}</span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                {currentUser.role === 'admin'
                  ? '✨ Hak Akses Penuh: Anda berhak menginput, mengubah SEMUA kuesioner bahasa, verifikasi data lapangan, dan kelola akun surveyor.'
                  : '📝 Hak Akses Surveyor: Anda dapat menginput kuesioner baru dan mengedit formulir yang Anda buat. Formulir surveyor lain dapat dilihat (mode baca) atau diduplikasi.'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 self-start sm:self-center shrink-0">
            {currentUser.institution && (
              <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-medium text-[11px] text-slate-700 dark:text-slate-300">
                {currentUser.institution}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Top Section: Pusat Peta Spasial Tematik Kebahasaan (Peta Bahasa, Sastra Lisan, Vitalitas, & Revitalisasi) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-3.5 sm:p-5 shadow-xs space-y-4">
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs">
                <Compass className="w-4 h-4" />
              </span>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                <span>Peta Spasial Tematik Kebahasaan & Sastra</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  4 Peta Terpadu
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Visualisasi geospasial terpadu: Peta Bahasa & Titik Pengamatan, Peta Sastra Lisan & Audio, Peta Vitalitas Daya Hidup UNESCO, serta Peta Revitalisasi Bahasa Daerah.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onNavigateToView && (
              <button
                type="button"
                onClick={() => {
                  if (topMapTab === 'bahasa') onNavigateToView('peta-survei');
                  else if (topMapTab === 'sastra_lisan') onNavigateToView('peta-sastra-lisan');
                  else if (topMapTab === 'vitalitas') onNavigateToView('peta-vitalitas');
                  else if (topMapTab === 'revitalisasi') onNavigateToView('peta-revitalisasi');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                title="Buka modul peta aktif ini di halaman penuh"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span>Buka Modul Penuh</span>
              </button>
            )}
            {onNavigateToPetaCarto && (
              <button
                type="button"
                onClick={onNavigateToPetaCarto}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                title="Peta CARTO (Tri-Instrumen)"
              >
                <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Peta CARTO</span>
              </button>
            )}
            {onOpenRegionalReport && (
              <button
                type="button"
                onClick={onOpenRegionalReport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs transition-all cursor-pointer active:scale-95"
                title="Unduh Laporan Ringkasan Wilayah PDF"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Laporan Regional (PDF)</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Tabs: Peta Bahasa, Peta Sastra Lisan, Peta Vitalitas Bahasa, Peta Revitalisasi Bahasa Daerah */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {/* Tab 1: Peta Bahasa */}
          <button
            type="button"
            onClick={() => setTopMapTab('bahasa')}
            className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative group ${
              topMapTab === 'bahasa'
                ? 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-500 dark:border-blue-400 shadow-2xs ring-2 ring-blue-500/20'
                : 'bg-white/60 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border-slate-200/90 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <div className={`p-1.5 rounded-lg flex items-center justify-center ${
                topMapTab === 'bahasa' 
                  ? 'bg-blue-600 text-white shadow-2xs' 
                  : 'bg-blue-100/80 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
              }`}>
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                topMapTab === 'bahasa'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60'
              }`}>
                {surveys.length} Titik
              </span>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Peta Bahasa
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                Titik Survei & Isoglos
              </div>
            </div>
            <div className="mt-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Dialektometri</span>
              <span className={`font-bold ${topMapTab === 'bahasa' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                {topMapTab === 'bahasa' ? '● Aktif' : 'Pilih'}
              </span>
            </div>
          </button>

          {/* Tab 2: Peta Sastra Lisan */}
          <button
            type="button"
            onClick={() => setTopMapTab('sastra_lisan')}
            className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative group ${
              topMapTab === 'sastra_lisan'
                ? 'bg-amber-50/90 dark:bg-amber-950/50 border-amber-500 dark:border-amber-400 shadow-2xs ring-2 ring-amber-500/20'
                : 'bg-white/60 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border-slate-200/90 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <div className={`p-1.5 rounded-lg flex items-center justify-center ${
                topMapTab === 'sastra_lisan' 
                  ? 'bg-amber-600 text-white shadow-2xs' 
                  : 'bg-amber-100/80 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
              }`}>
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                topMapTab === 'sastra_lisan'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60'
              }`}>
                {sastraCount} Korpus
              </span>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Peta Sastra Lisan
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                Tradisi Lisan & Cerita
              </div>
            </div>
            <div className="mt-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Rekaman Audio</span>
              <span className={`font-bold ${topMapTab === 'sastra_lisan' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                {topMapTab === 'sastra_lisan' ? '● Aktif' : 'Pilih'}
              </span>
            </div>
          </button>

          {/* Tab 3: Peta Vitalitas Bahasa */}
          <button
            type="button"
            onClick={() => setTopMapTab('vitalitas')}
            className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative group ${
              topMapTab === 'vitalitas'
                ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-500 dark:border-emerald-400 shadow-2xs ring-2 ring-emerald-500/20'
                : 'bg-white/60 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border-slate-200/90 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <div className={`p-1.5 rounded-lg flex items-center justify-center ${
                topMapTab === 'vitalitas' 
                  ? 'bg-emerald-600 text-white shadow-2xs' 
                  : 'bg-emerald-100/80 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
              }`}>
                <Activity className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                topMapTab === 'vitalitas'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/60'
              }`}>
                {vitalitasCount} Respon
              </span>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Peta Vitalitas Bahasa
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                Daya Hidup UNESCO
              </div>
            </div>
            <div className="mt-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Skala EGIDS</span>
              <span className={`font-bold ${topMapTab === 'vitalitas' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {topMapTab === 'vitalitas' ? '● Aktif' : 'Pilih'}
              </span>
            </div>
          </button>

          {/* Tab 4: Peta Revitalisasi Bahasa Daerah */}
          <button
            type="button"
            onClick={() => setTopMapTab('revitalisasi')}
            className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative group ${
              topMapTab === 'revitalisasi'
                ? 'bg-purple-50/90 dark:bg-purple-950/50 border-purple-500 dark:border-purple-400 shadow-2xs ring-2 ring-purple-500/20'
                : 'bg-white/60 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border-slate-200/90 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <div className={`p-1.5 rounded-lg flex items-center justify-center ${
                topMapTab === 'revitalisasi' 
                  ? 'bg-purple-600 text-white shadow-2xs' 
                  : 'bg-purple-100/80 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                topMapTab === 'revitalisasi'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/60'
              }`}>
                {revitalisasiCount} Program
              </span>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Peta Revitalisasi
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                Monev, Sekolah & FTBI
              </div>
            </div>
            <div className="mt-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Sekolah Model</span>
              <span className={`font-bold ${topMapTab === 'revitalisasi' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`}>
                {topMapTab === 'revitalisasi' ? '● Aktif' : 'Pilih'}
              </span>
            </div>
          </button>
        </div>

        {/* Selected Map Content Display */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          {topMapTab === 'bahasa' && (
            <SurveysLeafletMap
              surveys={surveys}
              activeSurveyId={activeSurveyId}
              onSelectSurvey={onSelectSurvey}
              onSwitchToEditor={onSwitchToEditor}
              onSwitchToComparison={onSwitchToComparison}
              onNavigateToSection={onNavigateToSection}
              onNavigateToDialekPeta={onNavigateToDialekPeta}
              onNavigateToKosakata={onNavigateToKosakata}
              onNavigateToAtlasGlottolog={onNavigateToAtlasGlottolog}
              onCreateNew={onCreateNew}
            />
          )}

          {topMapTab === 'sastra_lisan' && (
            <div className="p-2 sm:p-4 bg-slate-50/50 dark:bg-slate-950/40">
              <PetaSastraLisanView
                surveys={surveys}
                onNavigateToForm={() => onNavigateToView?.('sastra-lisan')}
                onNavigateToKorpus={() => onNavigateToView?.('sastra-lisan')}
                onNavigateToView={onNavigateToView}
              />
            </div>
          )}

          {topMapTab === 'vitalitas' && (
            <div className="p-2 sm:p-4 bg-slate-50/50 dark:bg-slate-950/40">
              <PetaVitalitasView
                surveys={surveys}
                onNavigateToForm={() => onNavigateToView?.('kuesioner')}
                onNavigateToKondisiBahasa={() => onNavigateToView?.('kondisi-bahasa')}
                onNavigateToView={onNavigateToView}
              />
            </div>
          )}

          {topMapTab === 'revitalisasi' && (
            <div className="p-2 sm:p-4 bg-slate-50/50 dark:bg-slate-950/40">
              <PetaRevitalisasiView
                surveys={surveys}
                onNavigateToMonevForm={() => onNavigateToView?.('kuesioner')}
                onNavigateToRAPForm={() => onNavigateToView?.('kuesioner')}
                onNavigateToModul={() => onNavigateToView?.('revitalisasi')}
                onNavigateToView={onNavigateToView}
              />
            </div>
          )}
        </div>
      </div>

      {/* KARTU STATISTIK RINGKASAN UTAMA: Total Narasumber, Kosakata Terekam, dan Status Verifikasi */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-colors space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Ringkasan Data Lapangan & Status Inventarisasi Bahasa
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Diperbarui dari <strong>{stats.total}</strong> formulir survei dialektometri aktif
            </span>
            <button
              type="button"
              onClick={() => setViewMode('dialek_stats')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
            >
              <Scale className="w-3 h-3 text-indigo-500" />
              <span>Statistik Dialek & Agregat Leksikal →</span>
            </button>
            {onNavigateToPetaCarto && (
              <button
                type="button"
                onClick={onNavigateToPetaCarto}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-2xs transition-all cursor-pointer active:scale-95"
                title="Peta Spasial CARTO (Sastra Lisan, Vitalitas, & Revitalisasi)"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Peta CARTO (Tri-Instrumen)</span>
              </button>
            )}
            {onOpenRegionalReport && (
              <button
                type="button"
                onClick={onOpenRegionalReport}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs transition-all cursor-pointer active:scale-95"
                title="Laporan Ringkasan Wilayah (Unduh PDF)"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Laporan Ringkasan Wilayah (PDF)</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Narasumber (Informan) */}
          <div className="bg-white dark:bg-slate-900/70 border border-blue-100 dark:border-blue-900/40 rounded-xl p-3.5 sm:p-4 shadow-2xs transition-all hover:border-blue-300 dark:hover:border-blue-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-900 dark:text-blue-300">Total Narasumber</span>
              <div className="p-2 rounded-lg bg-blue-100/80 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-950 dark:text-blue-100">{stats.totalNarasumber}</span>
              <span className="text-xs text-blue-700/70 dark:text-blue-400 font-medium">informan</span>
            </div>
            <div className="mt-2 pt-2 border-t border-blue-100/80 dark:border-blue-900/30 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Target 3 orang/titik:</span>
              <button
                type="button"
                onClick={() => setViewMode('narasumber_stats')}
                className="font-semibold text-blue-800 dark:text-blue-300 hover:underline cursor-pointer flex items-center gap-0.5"
                title="Lihat grafik distribusi usia dan pendidikan narasumber"
              >
                <span>{stats.total > 0 ? Math.round((stats.totalNarasumber / (stats.total * 3)) * 100) : 0}% terisi →</span>
              </button>
            </div>
          </div>

          {/* Card 2: Jumlah Kosakata yang Telah Direkam */}
          <div className="bg-white dark:bg-slate-900/70 border border-teal-100 dark:border-teal-900/40 rounded-xl p-3.5 sm:p-4 shadow-2xs transition-all hover:border-teal-300 dark:hover:border-teal-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-teal-900 dark:text-teal-300">Kosakata Terekam</span>
              <div className="p-2 rounded-lg bg-teal-100/80 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300">
                <BookA className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-teal-950 dark:text-teal-100">{stats.totalKosakataRecorded.toLocaleString('id-ID')}</span>
              <span className="text-xs text-teal-700/70 dark:text-teal-400 font-medium">leksikon</span>
            </div>
            <div className="mt-2 pt-2 border-t border-teal-100/80 dark:border-teal-900/30 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Swadesh: <b>{stats.totalSwadeshFilled}</b></span>
              <span className="text-purple-700 dark:text-purple-400 font-medium flex items-center gap-0.5">
                <Mic className="w-3 h-3" />
                {stats.totalAudioRecordings} audio
              </span>
            </div>
          </div>

          {/* Card 3: Status Verifikasi Survei Secara Keseluruhan */}
          <div className="bg-white dark:bg-slate-900/70 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-3.5 sm:p-4 shadow-2xs transition-all hover:border-emerald-300 dark:hover:border-emerald-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">Status Verifikasi</span>
              <div className="p-2 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-100">{stats.verifiedSurveys}</span>
              <span className="text-xs text-emerald-700/70 dark:text-emerald-400 font-medium">/ {stats.total} tervalidasi</span>
            </div>
            <div className="mt-2 pt-2 border-t border-emerald-100/80 dark:border-emerald-900/30 flex items-center justify-between text-[11px]">
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{stats.verifiedPercent}% terverifikasi</span>
              <span className="text-amber-700 dark:text-amber-400 font-medium">
                {stats.pendingSurveys} telaah
              </span>
            </div>
          </div>

          {/* Card 4: Rata-Rata Kelengkapan & Titik Bahasa */}
          <div className="bg-white dark:bg-slate-900/70 border border-indigo-100 dark:border-indigo-900/40 rounded-xl p-3.5 sm:p-4 shadow-2xs transition-all hover:border-indigo-300 dark:hover:border-indigo-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-300">Kelengkapan 16 Bagian</span>
              <div className="p-2 rounded-lg bg-indigo-100/80 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-950 dark:text-indigo-100">{stats.avgProgress}%</span>
              <span className="text-xs text-indigo-700/70 dark:text-indigo-400 font-medium">agregat</span>
            </div>
            <div className="w-full bg-indigo-200/60 dark:bg-indigo-950/60 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-indigo-600 dark:bg-indigo-400 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${stats.avgProgress}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span>{stats.completed} tuntas (100%)</span>
              <span>{stats.languages.length} bahasa unik</span>
            </div>
          </div>
        </div>
      </div>

      {/* BENTO MENU NAVIGASI UTAMA DASHBOARD & MODUL ANALISIS */}
      <div className="bg-white/80 dark:bg-slate-900/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        {/* Header Bar of the Bento Menu */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
              <LayoutGrid className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Menu Navigasi Dashboard & Modul Analisis
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
              8 Modul Utama
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Tampilan Aktif:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
              {viewMode === 'ringkasan' && 'Dashboard Ringkasan & 16 Bagian'}
              {viewMode === 'peta_survei' && 'Peta Titik Survei Lapangan (Leaflet)'}
              {viewMode === 'narasumber_stats' && 'Statistik Narasumber & Demografi'}
              {viewMode === 'dialek_stats' && 'Statistik Sebaran Dialek & Agregat Leksikal'}
              {viewMode === 'dominasi_kecamatan' && 'Dominasi Dialek per Kecamatan'}
              {viewMode === 'korelasi_pendidikan' && 'Korelasi Pendidikan & Dialek'}
              {viewMode === 'regresi_usia_bahasa' && 'Regresi Usia & Variabel Bahasa'}
              {viewMode === 'daftar' && 'Daftar Titik Survei'}
            </span>
          </div>
        </div>

        {/* 8 Bento Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* 1. Dashboard Ringkasan & 16 Bagian */}
          <button
            type="button"
            onClick={() => setViewMode('ringkasan')}
            className={`p-3.5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between text-left border relative group shadow-2xs ${
              viewMode === 'ringkasan'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-start justify-between gap-1.5 mb-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 transition-transform group-hover:scale-105 ${
                viewMode === 'ringkasan'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400'
              }`}>
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 font-mono">
                MODUL 01
              </span>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Dashboard Ringkasan & 16 Bagian
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                Instrumen lapangan & progres
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                16 Seksi
              </span>
              <span className={`text-[10px] font-bold ${viewMode === 'ringkasan' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                {viewMode === 'ringkasan' ? '● Aktif' : 'Buka'}
              </span>
            </div>
          </button>

          {/* 2. Peta Titik Survei Lapangan (Leaflet) */}
          <button
            type="button"
            onClick={() => setViewMode('peta_survei')}
            className={`p-3.5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between text-left border relative group shadow-2xs ${
              viewMode === 'peta_survei'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                : 'bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'
            }`}
          >
            <div className="flex items-start justify-between gap-1.5 mb-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 transition-transform group-hover:scale-105 ${
                viewMode === 'peta_survei'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400'
              }`}>
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 font-mono">
                MODUL 02
              </span>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Peta Titik Survei Lapangan
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                Visualisasi geospasial Leaflet GIS
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                {surveys.length} Titik Terdata
              </span>
              <span className={`text-[10px] font-bold ${viewMode === 'peta_survei' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                {viewMode === 'peta_survei' ? '● Aktif' : 'Buka'}
              </span>
            </div>
          </button>

          {/* 3. Statistik Narasumber & Demografi */}
          <button
            type="button"
            onClick={() => setViewMode('narasumber_stats')}
            className={`p-3.5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between text-left border relative group shadow-2xs ${
              viewMode === 'narasumber_stats'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-sky-500 dark:border-sky-400 ring-2 ring-sky-500/20 shadow-xs'
                : 'bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-300'
            }`}
          >
            <div className="flex items-start justify-between gap-1.5 mb-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 transition-transform group-hover:scale-105 ${
                viewMode === 'narasumber_stats'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400'
              }`}>
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 font-mono">
                MODUL 03
              </span>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Statistik Narasumber & Demografi
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                Profil penutur asli & kriteria usia
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300">
                Demografi
              </span>
              <span className={`text-[10px] font-bold ${viewMode === 'narasumber_stats' ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`}>
                {viewMode === 'narasumber_stats' ? '● Aktif' : 'Buka'}
              </span>
            </div>
          </button>

          {/* 4. Statistik Sebaran Dialek & Agregat Leksikal */}
          <button
            type="button"
            onClick={() => setViewMode('dialek_stats')}
            className={`p-3.5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between text-left border relative group shadow-2xs ${
              viewMode === 'dialek_stats'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-purple-500 dark:border-purple-400 ring-2 ring-purple-500/20 shadow-xs'
                : 'bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-300'
            }`}
          >
            <div className="flex items-start justify-between gap-1.5 mb-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 transition-transform group-hover:scale-105 ${
                viewMode === 'dialek_stats'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400'
              }`}>
                <Scale className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 font-mono">
                MODUL 04
              </span>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Statistik Sebaran Dialek
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                Agregat leksikal Guiter d = (s/n)
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
                Guiter Agregat
              </span>
              <span className={`text-[10px] font-bold ${viewMode === 'dialek_stats' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`}>
                {viewMode === 'dialek_stats' ? '● Aktif' : 'Buka'}
              </span>
            </div>
          </button>

          {/* 5. Dominasi Dialek per Kecamatan */}
          <button
            type="button"
            onClick={() => setViewMode('dominasi_kecamatan')}
            className={`p-3.5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between text-left border relative group shadow-2xs ${
              viewMode === 'dominasi_kecamatan'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-cyan-500 dark:border-cyan-400 ring-2 ring-cyan-500/20 shadow-xs'
                : 'bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-cyan-300'
            }`}
          >
            <div className="flex items-start justify-between gap-1.5 mb-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 transition-transform group-hover:scale-105 ${
                viewMode === 'dominasi_kecamatan'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-600 dark:text-cyan-400'
              }`}>
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 font-mono">
                MODUL 05
              </span>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Dominasi Dialek per Kecamatan
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                Monodialek vs zona kontak dialek
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300">
                Persentase
              </span>
              <span className={`text-[10px] font-bold ${viewMode === 'dominasi_kecamatan' ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}`}>
                {viewMode === 'dominasi_kecamatan' ? '● Aktif' : 'Buka'}
              </span>
            </div>
          </button>

          {/* 6. Korelasi Pendidikan & Dialek (Scatter Plot) */}
          <button
            type="button"
            onClick={() => setViewMode('korelasi_pendidikan')}
            className={`p-3.5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between text-left border relative group shadow-2xs ${
              viewMode === 'korelasi_pendidikan'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-start justify-between gap-1.5 mb-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 transition-transform group-hover:scale-105 ${
                viewMode === 'korelasi_pendidikan'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400'
              }`}>
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 font-mono">
                MODUL 06
              </span>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Korelasi Pendidikan & Dialek
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                Scatter plot korelasi sosiolinguistik
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                Recharts Scatter
              </span>
              <span className={`text-[10px] font-bold ${viewMode === 'korelasi_pendidikan' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                {viewMode === 'korelasi_pendidikan' ? '● Aktif' : 'Buka'}
              </span>
            </div>
          </button>

          {/* 7. Regresi Usia & Variabel Bahasa (Grafik Tren) */}
          <button
            type="button"
            onClick={() => setViewMode('regresi_usia_bahasa')}
            className={`p-3.5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between text-left border relative group shadow-2xs ${
              viewMode === 'regresi_usia_bahasa'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-teal-500 dark:border-teal-400 ring-2 ring-teal-500/20 shadow-xs'
                : 'bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-300'
            }`}
          >
            <div className="flex items-start justify-between gap-1.5 mb-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 transition-transform group-hover:scale-105 ${
                viewMode === 'regresi_usia_bahasa'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400'
              }`}>
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 font-mono">
                MODUL 07
              </span>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Regresi Usia & Tren Dialek
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                Waktu semu (apparent-time analysis)
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300">
                Waktu Semu
              </span>
              <span className={`text-[10px] font-bold ${viewMode === 'regresi_usia_bahasa' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}>
                {viewMode === 'regresi_usia_bahasa' ? '● Aktif' : 'Buka'}
              </span>
            </div>
          </button>

          {/* 8. Daftar Titik Survei (10) */}
          <button
            type="button"
            onClick={() => setViewMode('daftar')}
            className={`p-3.5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between text-left border relative group shadow-2xs ${
              viewMode === 'daftar'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                : 'bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-start justify-between gap-1.5 mb-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 transition-transform group-hover:scale-105 ${
                viewMode === 'daftar'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400'
              }`}>
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 font-mono">
                MODUL 08
              </span>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Daftar Titik Survei
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                Tabel kuesioner desa & ekspor data
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                {surveys.length} Titik Survei
              </span>
              <span className={`text-[10px] font-bold ${viewMode === 'daftar' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {viewMode === 'daftar' ? '● Aktif' : 'Buka'}
              </span>
            </div>
          </button>

        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full"
        >
          {viewMode === 'ringkasan' ? (
        <SummaryDashboard
          surveys={surveys}
          activeSurveyId={activeSurveyId}
          onSelectSurvey={onSelectSurvey}
          onNavigateToSection={onNavigateToSection}
          onSwitchToEditor={onSwitchToEditor}
          currentUser={currentUser}
          onToggleVerify={onToggleVerify}
          onNavigateToDialekPeta={onNavigateToDialekPeta}
          onNavigateToKosakata={onNavigateToKosakata}
          onNavigateToComparison={onSwitchToComparison}
          onNavigateToPetaSurvei={() => setViewMode('peta_survei')}
          onNavigateToDokumentasi={onNavigateToDokumentasi}
          onNavigateToCorrelation={() => setViewMode('korelasi_pendidikan')}
          onNavigateToAgeRegression={() => setViewMode('regresi_usia_bahasa')}
          onNavigateToKecamatanDominance={() => setViewMode('dominasi_kecamatan')}
        />
      ) : viewMode === 'peta_survei' ? (
        <SurveysLeafletMap
          surveys={surveys}
          activeSurveyId={activeSurveyId}
          onSelectSurvey={onSelectSurvey}
          onSwitchToEditor={onSwitchToEditor}
          onSwitchToComparison={onSwitchToComparison}
          onNavigateToSection={onNavigateToSection}
          onNavigateToDialekPeta={onNavigateToDialekPeta}
          onNavigateToKosakata={onNavigateToKosakata}
          onCreateNew={onCreateNew}
        />
      ) : viewMode === 'narasumber_stats' ? (
        <NarasumberStatsSummary
          surveys={surveys}
          activeSurveyId={activeSurveyId}
          onSelectSurvey={onSelectSurvey}
          onNavigateToSection={onNavigateToSection}
          onSwitchToEditor={onSwitchToEditor}
          onNavigateToCorrelation={() => setViewMode('korelasi_pendidikan')}
          onNavigateToAgeRegression={() => setViewMode('regresi_usia_bahasa')}
        />
      ) : viewMode === 'dialek_stats' ? (
        <DescriptiveDialectStats
          surveys={surveys}
          activeSurveyId={activeSurveyId}
          onSelectSurvey={onSelectSurvey}
          onNavigateToDialekPeta={onNavigateToDialekPeta}
          onNavigateToKosakata={onNavigateToKosakata}
          onNavigateToComparison={onSwitchToComparison}
          onNavigateToCorrelation={() => setViewMode('korelasi_pendidikan')}
          onNavigateToKecamatanDominance={() => setViewMode('dominasi_kecamatan')}
        />
      ) : viewMode === 'dominasi_kecamatan' ? (
        <KecamatanDialectDominanceStats
          surveys={surveys}
          activeSurveyId={activeSurveyId}
          onSelectSurvey={onSelectSurvey}
          onNavigateToDialekPeta={onNavigateToDialekPeta}
          onNavigateToSection={onNavigateToSection}
          onSwitchToEditor={onSwitchToEditor}
          onNavigateToCorrelation={() => setViewMode('korelasi_pendidikan')}
          onNavigateToAgeRegression={() => setViewMode('regresi_usia_bahasa')}
        />
      ) : viewMode === 'korelasi_pendidikan' ? (
        <EducationDialectCorrelationAnalysis
          surveys={surveys}
          activeSurveyId={activeSurveyId}
          onSelectSurvey={onSelectSurvey}
          onNavigateToSection={onNavigateToSection}
          onSwitchToEditor={onSwitchToEditor}
          onNavigateToDialekPeta={onNavigateToDialekPeta}
          onNavigateToAgeRegression={() => setViewMode('regresi_usia_bahasa')}
        />
      ) : viewMode === 'regresi_usia_bahasa' ? (
        <AgeLanguageRegressionTrendAnalysis
          surveys={surveys}
          activeSurveyId={activeSurveyId}
          onSelectSurvey={onSelectSurvey}
          onNavigateToSection={onNavigateToSection}
          onSwitchToEditor={onSwitchToEditor}
          onNavigateToDialekPeta={onNavigateToDialekPeta}
        />
      ) : (
        <>

      {/* Overview Statistics Cards for Daftar Mode */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Total Narasumber */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Narasumber</span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalNarasumber}</span>
            <span className="text-xs text-slate-400">informan lapangan</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Dari target <strong className="text-slate-700 dark:text-slate-300">{stats.total * 3}</strong> kuota narasumber
          </p>
        </div>

        {/* Card 2: Kosakata yang Telah Direkam */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Kosakata Terekam</span>
            <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <BookA className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">{stats.totalKosakataRecorded.toLocaleString('id-ID')}</span>
            <span className="text-xs text-slate-400">leksikon</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {stats.totalSwadeshFilled} Swadesh • {stats.totalBudayaFilled} Budaya • {stats.totalAudioRecordings} audio
          </p>
        </div>

        {/* Card 3: Status Verifikasi Survei */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Status Verifikasi</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.verifiedSurveys}</span>
            <span className="text-xs text-slate-400">/ {stats.total} tervalidasi</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            <strong className="text-emerald-600 dark:text-emerald-400">{stats.verifiedPercent}%</strong> tuntas • {stats.pendingSurveys} telaah
          </p>
        </div>

        {/* Card 4: Average Progress & Total Surveys */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Rata-rata Kelengkapan</span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.avgProgress}%</span>
            <span className="text-xs text-slate-400">({stats.total} titik)</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-indigo-600 dark:bg-indigo-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${stats.avgProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari desa, bahasa, kecamatan, kabupaten..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Tabs, Ownership Filter, and Sorting */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Ownership Filter Tabs */}
            {currentUser && (
              <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800/80 text-xs">
                <button
                  type="button"
                  onClick={() => setOwnershipFilter('all')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                    ownershipFilter === 'all' 
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Semua Peneliti
                </button>
                <button
                  type="button"
                  onClick={() => setOwnershipFilter('mine')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                    ownershipFilter === 'mine' 
                      ? 'bg-indigo-600 text-white shadow-2xs font-semibold' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Survei Saya ({surveys.filter(s => s.createdBy === currentUser.id).length})
                </button>
                <button
                  type="button"
                  onClick={() => setOwnershipFilter('others')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                    ownershipFilter === 'others' 
                      ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-2xs font-semibold' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Peneliti Lain ({surveys.filter(s => s.createdBy && s.createdBy !== currentUser.id).length})
                </button>
              </div>
            )}

            {/* Status Filter Tabs */}
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800/80 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  statusFilter === 'all' 
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Semua ({surveys.length})
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  statusFilter === 'completed' 
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Selesai ({stats.completed})
              </button>
              <button
                onClick={() => setStatusFilter('in_progress')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  statusFilter === 'in_progress' 
                    ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-2xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Proses ({stats.inProgress})
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 py-1.5 px-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500 cursor-pointer transition-colors"
            >
              <option value="updated_desc">Terakhir Diperbarui</option>
              <option value="updated_asc">Paling Lama Diperbarui</option>
              <option value="progress_desc">Kelengkapan Tertinggi (%)</option>
              <option value="progress_asc">Kelengkapan Terendah (%)</option>
              <option value="title_asc">Nama Judul / Desa (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Active Languages Filter summary pills */}
        {stats.languages.length > 0 && (
          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-600 dark:text-slate-300 mr-1">Ragam Bahasa:</span>
            {stats.languages.map((lang, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium text-[11px] border border-indigo-100 dark:border-indigo-900/60"
              >
                {lang}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Survey Cards List */}
      {filteredSurveys.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center transition-colors">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            {searchQuery || statusFilter !== 'all' 
              ? 'Tidak ada formulir yang sesuai kriteria pencarian' 
              : 'Belum ada formulir survei'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            {searchQuery || statusFilter !== 'all'
              ? 'Coba ubah kata kunci pencarian atau ubah filter status survei di atas.'
              : 'Mulai input data pemetaan bahasa dengan membuat formulir baru atau memuat contoh data.'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => onCreateNew('empty')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Formulir Baru</span>
            </button>
            <button
              onClick={() => onCreateNew('sample')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-semibold cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Muat Contoh Sampel</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSurveys.map(survey => {
            const isCurrentActive = survey.id === activeSurveyId;
            const isExpanded = Boolean(expandedChecklists[survey.id]);
            const progressDetails = getSectionProgressDetails(survey.data);
            const swadeshFilled = survey.data?.kosakataLengkap?.swadeshList?.filter(w => w.bentukLokal)?.length || 0;
            const pembandingCount = survey.data?.dialektometri?.titikPembandingList?.length || 0;
            const narasumberCount = survey.data?.narasumberList?.filter(n => n.nama)?.length || 0;
            const canEdit = canUserEditSurvey(survey, currentUser);
            const canDelete = canUserDeleteSurvey(survey, currentUser);
            const isOwnSurvey = currentUser ? survey.createdBy === currentUser.id : false;

            return (
              <div
                key={survey.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 shadow-2xs ${
                  isCurrentActive 
                    ? 'border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-100 dark:ring-indigo-950' 
                    : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="p-4 sm:p-5">
                  {/* Top Bar: Badges & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          <Languages className="w-3 h-3" />
                          <span>{survey.bahasa || survey.data?.titikPengamatan?.bahasaDigunakan || 'Bahasa Belum Diisi'}</span>
                        </span>

                        {survey.progress === 100 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <Check className="w-3 h-3" />
                            <span>Lengkap (16 Bagian)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <Clock className="w-3 h-3" />
                            <span>{survey.completedSectionsCount}/16 Bagian Terisi</span>
                          </span>
                        )}

                        {isCurrentActive && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            Sedang Dibuka
                          </span>
                        )}

                        {!canEdit.allowed && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <Lock className="w-2.5 h-2.5 text-amber-600" />
                            <span>Mode Baca</span>
                          </span>
                        )}
                      </div>

                      {/* Survey Title */}
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {survey.title}
                      </h3>

                      {/* Geographical location subtitle */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                          <span>{survey.desa || survey.data?.titikPengamatan?.namaDesa || 'Tanpa Nama Desa'}</span>
                        </span>
                        {survey.kecamatan && <span>• Kec. {survey.kecamatan}</span>}
                        {survey.kabupatenKota && <span>• {survey.kabupatenKota}</span>}
                        {survey.provinsi && <span>• {survey.provinsi}</span>}
                      </p>

                      {/* Surveyor & Verification Metadata Row */}
                      <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                          <User className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                          <span>Peneliti: <strong className="text-slate-900 dark:text-slate-100">{survey.createdByName || 'Belum Ditentukan'}</strong></span>
                          {isOwnSurvey && (
                            <span className="ml-1 text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.2 rounded font-bold">
                              Survei Anda
                            </span>
                          )}
                        </span>

                        {survey.isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Terverifikasi {survey.verifiedBy ? `oleh ${survey.verifiedBy}` : ''}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium text-[11px] border border-amber-200 dark:border-amber-800">
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span>Belum Diverifikasi</span>
                          </span>
                        )}

                        {/* Verifikator Linguistik and Super Admin verification toggle */}
                        {canUserVerifySurvey(currentUser) && onToggleVerify && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleVerify(survey.id);
                            }}
                            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border transition-colors cursor-pointer ${
                              survey.isVerified
                                ? 'text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                                : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border-emerald-300 dark:border-emerald-700'
                            }`}
                            title={survey.isVerified ? 'Batalkan status verifikasi' : 'Tandai survei ini telah diverifikasi oleh Verifikator / Admin'}
                          >
                            {survey.isVerified ? 'Batalkan Verifikasi' : '✓ Verifikasi Data Lapangan'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 self-start">
                      {canEdit.allowed ? (
                        <button
                          onClick={() => {
                            onSelectSurvey(survey.id);
                            onSwitchToEditor();
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                          title={currentUser?.role === 'admin' ? "Buka & edit formulir (Wewenang Penuh Super Admin)" : "Buka & edit formulir Anda"}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Formulir</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            onSelectSurvey(survey.id);
                            onSwitchToEditor();
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                          title={`Formulir dibuat oleh ${survey.createdByName || 'surveyor lain'}. Klik untuk melihat data (Mode Baca).`}
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                          <span>Lihat Data</span>
                          <Lock className="w-3 h-3 text-amber-600" />
                        </button>
                      )}

                      <button
                        onClick={() => downloadSingleSurveyJSON(survey)}
                        className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                        title="Unduh survei ini sebagai file JSON"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {currentUser?.role !== 'tamu' && (
                        <button
                          onClick={() => onDuplicate(survey.id)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                          title="Duplikat survei ini ke akun Anda"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}

                      {canDelete ? (
                        <button
                          onClick={() => setDeleteTargetId(survey.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                          title="Hapus data formulir ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          disabled
                          className="p-1.5 text-slate-300 dark:text-slate-600 rounded-lg border border-slate-200 dark:border-slate-800 cursor-not-allowed"
                          title="Hanya pembuat formulir atau Super Admin yang dapat menghapus data ini."
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Kelengkapan Data:</span>
                        <span className={`font-bold ${
                          survey.progress === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'
                        }`}>
                          {survey.progress}%
                        </span>
                      </div>
                      <span className="text-slate-400 text-[11px]">
                        Terakhir diubah: {new Date(survey.updatedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          survey.progress === 100 
                            ? 'bg-emerald-500' 
                            : 'bg-[#1c5fff]'
                        }`}
                        style={{ width: `${survey.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Highlights Grid (Linguistic snapshot) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-2 border border-slate-150 dark:border-slate-750">
                      <span className="text-[10px] text-slate-400 block font-medium">Kosakata Swadesh</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{swadeshFilled} / 200 Kata</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-2 border border-slate-150 dark:border-slate-750">
                      <span className="text-[10px] text-slate-400 block font-medium">Profil Narasumber</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{narasumberCount} Orang</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-2 border border-slate-150 dark:border-slate-750">
                      <span className="text-[10px] text-slate-400 block font-medium">Titik Pembanding Dialektometri</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{pembandingCount} Titik Uji</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-2 border border-slate-150 dark:border-slate-750">
                      <span className="text-[10px] text-slate-400 block font-medium">Morfologi Wilayah</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                        {survey.data?.situasiGeografis?.morfologi || 'Belum diisi'}
                      </span>
                    </div>
                  </div>

                  {/* Collapsible 16-Section Checklist Toggle */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => toggleChecklist(survey.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
                    >
                      <span>Lihat Rincian Status 16 Bagian</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onSelectSurvey(survey.id);
                          onSwitchToEditor();
                        }}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline cursor-pointer"
                      >
                        Buka di Kuesioner →
                      </button>
                    </div>
                  </div>

                  {/* Expanded 16-Section Detailed Breakdown */}
                  {isExpanded && (
                    <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 mb-2.5 flex items-center justify-between">
                        <span>Checklist Rincian 16 Parameter Pemetaan Bahasa:</span>
                        <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                          {progressDetails.score} dari 16 parameter terisi
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        {progressDetails.sections.map(sec => (
                          <div
                            key={sec.id}
                            className={`p-2 rounded-lg border flex items-start gap-2 ${
                              sec.isFilled 
                                ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-slate-200' 
                                : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-400'
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {sec.isFilled ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-medium block truncate text-[11px]">
                                {sec.number}. {sec.title}
                              </span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                                {sec.summary}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </>
      )}
        </motion.div>
      </AnimatePresence>

      {/* Confirmation Modal for Deletion */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 relative transition-colors">
            <div className="w-10 h-10 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3 border border-rose-200 dark:border-rose-900/40">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Hapus Formulir Survei?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus formulir ini? Tindakan ini tidak dapat dibatalkan.
              Pastikan Anda sudah mengunduh berkas JSON jika masih membutuhkan salinannya.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 rounded-md text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDelete(deleteTargetId);
                  setDeleteTargetId(null);
                }}
                className="px-4 py-2 rounded-md text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-colors cursor-pointer"
              >
                Hapus Formulir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
