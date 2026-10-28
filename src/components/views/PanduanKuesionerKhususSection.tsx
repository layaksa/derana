import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Users, 
  Compass, 
  Layers, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  ExternalLink, 
  Check, 
  Copy, 
  Mic, 
  Volume2, 
  Activity, 
  FileText, 
  Share2, 
  Calendar, 
  Award, 
  Clock, 
  Scale, 
  Building, 
  Music, 
  ShieldCheck, 
  MapPin, 
  Filter, 
  Calculator, 
  AlertTriangle,
  Lightbulb,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Download,
  Scroll
} from 'lucide-react';
import { ViewKey } from '../layout/AppSidebar';

interface PanduanKuesionerKhususSectionProps {
  onNavigateToView: (view: ViewKey) => void;
  onOpenPRDModal?: () => void;
  onOpenExport?: () => void;
  focusedInstrument?: 'vitalitas' | 'revitalisasi' | 'sastra-lisan';
}

type KuesionerSubTab = 'semua' | 'sastra-lisan' | 'vitalitas' | 'revitalisasi' | 'integrasi';

export const PanduanKuesionerKhususSection: React.FC<PanduanKuesionerKhususSectionProps> = ({
  onNavigateToView,
  onOpenPRDModal,
  onOpenExport,
  focusedInstrument
}) => {
  const [activeSubTab, setActiveSubTab] = useState<KuesionerSubTab>(() => {
    if (focusedInstrument === 'vitalitas') return 'vitalitas';
    if (focusedInstrument === 'revitalisasi') return 'revitalisasi';
    if (focusedInstrument === 'sastra-lisan') return 'sastra-lisan';
    return 'semua';
  });
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Sync if focusedInstrument prop changes
  React.useEffect(() => {
    if (focusedInstrument) {
      setActiveSubTab(focusedInstrument);
    }
  }, [focusedInstrument]);

  // Mini simulator for Vitalitas calculation preview
  const [simVitalitasScore, setSimVitalitasScore] = useState<number>(3.65);

  const getVitalitasStatus = (score: number) => {
    if (score >= 4.2) {
      return {
        label: 'Aman (Safe)',
        badge: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        desc: 'Bahasa dituturkan secara aktif oleh semua generasi (anak-anak, dewasa, lansia) di seluruh ranah kehidupan tanpa hambatan.'
      };
    }
    if (score >= 3.4) {
      return {
        label: 'Rentan (Vulnerable)',
        badge: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        desc: 'Bahasa masih dituturkan anak-anak, tetapi penggunaannya mulai terbatas pada ranah rumah atau komunitas tertutup tertentu.'
      };
    }
    if (score >= 2.6) {
      return {
        label: 'Mengalami Kemunduran (Definitely Endangered)',
        badge: 'bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-800',
        desc: 'Anak-anak tidak lagi mempelajari bahasa ibu di rumah sebagai bahasa pertama; generasi orang tua memahami namun minim bertutur.'
      };
    }
    if (score >= 1.8) {
      return {
        label: 'Terancam Punah (Severely Endangered)',
        badge: 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800',
        desc: 'Bahasa hanya dituturkan oleh generasi kakek-nenek (lansia >50 tahun). Generasi orang tua hanya mengerti pasif tanpa mampu bertutur aktif.'
      };
    }
    return {
      label: 'Kritis / Hampir Punah (Critically Endangered)',
      badge: 'bg-red-200 dark:bg-red-950 text-red-900 dark:text-red-200 border-red-400 dark:border-red-800',
      desc: 'Penutur termuda berusia lanjut (>70 tahun) dengan populasi sangat sedikit, membutuhkan tindakan konservasi darurat segera.'
    };
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. DEDICATED HEADER FOR VITALITAS BAHASA                     */}
      {/* ------------------------------------------------------------- */}
      {focusedInstrument === 'vitalitas' && (
        <div className="bg-gradient-to-r from-indigo-500/10 via-blue-500/10 to-indigo-500/10 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800">
                <Activity className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Instrumen Vitalitas Bahasa Daerah • 95 Indikator Likert</span>
              </div>
              <h2 className="text-2xl font-semibold leading-snug tracking-tight text-slate-900 dark:text-white">
                Tata Cara & Panduan Alur Kuesioner Vitalitas Bahasa Daerah
              </h2>
              <p className="text-sm sm:text-base font-normal leading-relaxed text-slate-600 dark:text-slate-300">
                Panduan operasional baku (SOP) pengisian 95 butir pertanyaan pada 6 ranah sosiolinguistik, penentuan informan lintas generasi, rumus indeks daya hidup (1.00 – 5.00), dan simulasi predikat status keterancaman bahasa.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start lg:self-auto shrink-0 print:hidden">
              <button
                type="button"
                onClick={() => onNavigateToView('kondisi-bahasa')}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Activity className="w-4 h-4" />
                <span>Buka Formulir Vitalitas ↗</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. DEDICATED HEADER FOR REVITALISASI BAHASA DAERAH           */}
      {/* ------------------------------------------------------------- */}
      {focusedInstrument === 'revitalisasi' && (
        <div className="bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-teal-500/10 border border-teal-200 dark:border-teal-800 rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-semibold border border-teal-200 dark:border-teal-800">
                <Award className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Instrumen Revitalisasi Bahasa Daerah (RBD) • RAP & Monev IKRBD</span>
              </div>
              <h2 className="text-2xl font-semibold leading-snug tracking-tight text-slate-900 dark:text-white">
                Tata Cara & Panduan Alur Kuesioner Revitalisasi Bahasa Daerah
              </h2>
              <p className="text-sm sm:text-base font-normal leading-relaxed text-slate-600 dark:text-slate-300">
                Panduan operasional baku penyusunan Rencana Aksi Pemda (RAP), lini masa 7 tahapan nasional Merdeka Belajar RBD, pelatihan guru master (ToT), pengimbasan siswa sekolah (FTBI), serta formula evaluasi kinerja IKRBD berbobot 5 dimensi.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start lg:self-auto shrink-0 print:hidden">
              <button
                type="button"
                onClick={() => onNavigateToView('revitalisasi')}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>Buka Formulir Revitalisasi ↗</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. DEDICATED HEADER FOR PEMETAAN SASTRA LISAN                */}
      {/* ------------------------------------------------------------- */}
      {focusedInstrument === 'sastra-lisan' && (
        <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-semibold border border-amber-200 dark:border-amber-800">
                <Scroll className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Instrumen Pemetaan Sastra Lisan • Tradisi Tutur & Motif ATU</span>
              </div>
              <h2 className="text-2xl font-semibold leading-snug tracking-tight text-slate-900 dark:text-white">
                Tata Cara & Panduan Alur Kuesioner Pemetaan Sastra Lisan
              </h2>
              <p className="text-sm sm:text-base font-normal leading-relaxed text-slate-600 dark:text-slate-300">
                Panduan operasional baku inventarisasi juru cerita adat, perekaman audio/video master beresolusi tinggi, transkripsi leksikon arkais, pengisian 5 bagian instrumen (A, B.1 s.d. B.4), dan klasifikasi indeks motif internasional Aarne-Thompson-Uther.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start lg:self-auto shrink-0 print:hidden">
              <button
                type="button"
                onClick={() => onNavigateToView('sastra-lisan')}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Scroll className="w-4 h-4" />
                <span>Buka Formulir Sastra Lisan ↗</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. DEFAULT OVERVIEW HEADER (When no focusedInstrument)         */}
      {/* ------------------------------------------------------------- */}
      {!focusedInstrument && (
        <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-teal-500/10 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>SOP Standar Resmi Badan Bahasa Kemendikbudristek</span>
              </div>
              <h2 className="text-2xl font-semibold leading-snug tracking-tight text-slate-900 dark:text-white">
                Tata Cara & Panduan Alur Kuesioner Khusus
              </h2>
              <p className="text-sm sm:text-base font-normal leading-relaxed text-slate-600 dark:text-slate-300">
                Panduan operasional baku (SOP) bagi surveyor, kurator sastra, dan verifikator linguistik untuk instrumen 
                <strong> Pemetaan Sastra Lisan</strong>, <strong>Vitalitas Bahasa Daerah (95 Indikator)</strong>, dan 
                <strong> Revitalisasi Bahasa Daerah (Rencana Aksi Pemda & Monev IKRBD)</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0 print:hidden">
              <button
                type="button"
                onClick={() => onNavigateToView('sastra-lisan')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Scroll className="w-3.5 h-3.5" />
                <span>Sastra Lisan ↗</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateToView('kondisi-bahasa')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Vitalitas Bahasa ↗</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateToView('revitalisasi')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Revitalisasi ↗</span>
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Sub-Tabs Selector (Only shown in overview mode) */}
        {!focusedInstrument && (
          <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              type="button"
              onClick={() => setActiveSubTab('semua')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeSubTab === 'semua'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Semua Instrumen (Overview)
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('sastra-lisan')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'sastra-lisan'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white/80 dark:bg-slate-800/80 text-amber-700 dark:text-amber-400 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Scroll className="w-3.5 h-3.5" />
              <span>1. Pemetaan Sastra Lisan</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('vitalitas')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'vitalitas'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white/80 dark:bg-slate-800/80 text-indigo-700 dark:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>2. Vitalitas Bahasa (95 Butir)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('revitalisasi')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'revitalisasi'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white/80 dark:bg-slate-800/80 text-teal-700 dark:text-teal-400 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>3. Revitalisasi (RAP & Monev IKRBD)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('integrasi')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'integrasi'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white/80 dark:bg-slate-800/80 text-purple-700 dark:text-purple-400 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Matriks Integrasi Data</span>
            </button>
          </div>
        )}

      {/* QUICK BENTO CARDS OVERVIEW (Shown only in overview mode when 'semua' or 'integrasi') */}
      {!focusedInstrument && (activeSubTab === 'semua' || activeSubTab === 'integrasi') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Sastra Lisan */}
          <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-bold">
                  <Scroll className="w-5 h-5" />
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Folklore & ATU Motif
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Kuesioner Pemetaan Sastra Lisan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Perekaman cerita rakyat, mitos, legenda, nyanyian rakyat, mantra adat, transkripsi bahasa arkais, serta indeks motif internasional Aarne-Thompson-Uther.
                </p>
              </div>
              <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>5 Bagian Formulir (A, B.1, B.2, B.3, B.4)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Data Narasumber & Komunitas Sanggar Seni</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Georeferensi Koordinat GPS Titik Rekam</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveSubTab('sastra-lisan')}
                className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Pelajari Alur Lengkap →
              </button>
              <button
                type="button"
                onClick={() => onNavigateToView('sastra-lisan')}
                className="text-xs px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800 hover:bg-amber-100 cursor-pointer"
              >
                Buka Formulir ↗
              </button>
            </div>
          </div>

          {/* Card 2: Vitalitas Bahasa */}
          <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-bold">
                  <Activity className="w-5 h-5" />
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  95 Indikator Likert
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Kuesioner Vitalitas Bahasa Daerah
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Pengukuran daya hidup dan derajat kepunahan bahasa daerah di 6 ranah komunikasi (domestik, sosial, sekolah, pemerintahan, media, dan sikap bahasa).
                </p>
              </div>
              <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>6 Ranah Komunikasi & 95 Butir Pertanyaan</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Kalkulasi Skor Otomatis (Rata-rata 1.0 - 5.0)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>5 Status Keterancaman (Aman s.d. Kritis)</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveSubTab('vitalitas')}
                className="text-xs font-bold text-indigo-700 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Pelajari Alur Lengkap →
              </button>
              <button
                type="button"
                onClick={() => onNavigateToView('kondisi-bahasa')}
                className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 cursor-pointer"
              >
                Buka Formulir ↗
              </button>
            </div>
          </div>

          {/* Card 3: Revitalisasi Bahasa Daerah */}
          <div className="bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-900/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 font-bold">
                  <Award className="w-5 h-5" />
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  RAP & IKRBD
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Revitalisasi Bahasa Daerah (RBD)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Penyusunan Rencana Aksi Pemda (RAP), pelatihan guru master (ToT), pengimbasan siswa sekolah, dan evaluasi Indeks Kinerja Revitalisasi Bahasa Daerah (IKRBD).
                </p>
              </div>
              <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>7 Tahapan Standar Lini Masa RBD Nasional</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>7 Cabang Pembelajaran Kreatif FTBI</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>5 Dimensi Monev & Formula Terbobot IKRBD</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveSubTab('revitalisasi')}
                className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Pelajari Alur Lengkap →
              </button>
              <button
                type="button"
                onClick={() => onNavigateToView('revitalisasi')}
                className="text-xs px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold border border-teal-200 dark:border-teal-800 hover:bg-teal-100 cursor-pointer"
              >
                Buka Formulir ↗
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODUL 1: TATA CARA ALUR PENGISIAN PEMETAAN SASTRA LISAN                  */}
      {/* ========================================================================= */}
      {(activeSubTab === 'semua' || activeSubTab === 'sastra-lisan') && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500 text-white font-bold shrink-0">
                <Scroll className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    MODUL PANDUAN 1
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Filologi Lisan & Tradisi Tutur</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                  Tata Cara Lengkap Pengisian Kuesioner Pemetaan Sastra Lisan
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToView('sastra-lisan')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 cursor-pointer self-start sm:self-auto"
            >
              <span>Buka Menu Sastra Lisan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dasar Filosofi & Kriteria Informan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>Tujuan & Landasan Teori Sastra Lisan</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Instrumen ini bertujuan menginventarisasi warisan budaya takbenda (WBTb) berupa tradisi tutur lisan. Pengelompokan dilakukan menggunakan sistem klasifikasi indeks motif internasional <strong>Aarne-Thompson-Uther (ATU)</strong> untuk memetakan persebaran alur cerita lintas etnis nusantara.
              </p>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pt-1">
                <p>• Mengamankan naskah lisan dari ancaman kepunahan akibat tidak adanya regenerasi juru cerita.</p>
                <p>• Merekam leksikon arkais (kata-kata kuno bernilai puitis dan filosofis tinggi).</p>
                <p>• Mengaitkan sastra lisan dengan titik koordinat geospasial desa adat asal cerita.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600" />
                <span>Kriteria Wajib Informan / Narasumber</span>
              </h4>
              <ul className="text-xs text-amber-900/90 dark:text-amber-200/90 space-y-1.5 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                  <span><strong>Penutur Asli / Juru Tutur Aktif:</strong> Berstatus sebagai juru cerita, pelantun tembang/mantra, atau tetua adat yang diakui komunitas setempat.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                  <span><strong>Masa Tinggal:</strong> Berdomisili menetap di desa sasaran minimal 20 tahun atau sejak lahir.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                  <span><strong>Kondisi Fisik & Ingatan:</strong> Masih mampu bertutur jelas dalam bahasa ibu dan memiliki daya ingat kuat terhadap alur tradisi.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                  <span><strong>Persetujuan Etis:</strong> Bersedia direkam suara/video dan karyanya dipublikasikan untuk kepentingan pelestarian kebudayaan.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Alur Tahap Pengisian Lapangan Sastra Lisan */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>5 Langkah Alur Pengisian Formulir Kuesioner Sastra Lisan</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {/* Langkah 1 */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 relative">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center">
                  1
                </div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  Data Narasumber (Bagian A)
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Isi nama lengkap, tempat/tanggal lahir, usia, jenis kelamin, serta status keberadaan komunitas adat atau sanggar seni pendukung.
                </p>
                <div className="text-[10px] text-amber-700 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/60 p-1.5 rounded border border-amber-200 dark:border-amber-900/40">
                  Tip: Catat nomor SK sanggar bila berbadan hukum resmi.
                </div>
              </div>

              {/* Langkah 2 */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 relative">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  Bentuk & Fisik Tuturan (Bagian B.1)
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Pilih genre tuturan (mitos, legenda, dongeng, fabel, nyanyian rakyat, mantra adat), media penyampaian, dan alat musik pengiring.
                </p>
                <div className="text-[10px] text-amber-700 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/60 p-1.5 rounded border border-amber-200 dark:border-amber-900/40">
                  Penting: Catat apakah menggunakan properti atau kostum khusus.
                </div>
              </div>

              {/* Langkah 3 */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 relative">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center">
                  3
                </div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  Transkripsi Teks & Makna (Bagian B.2)
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Ketik sinopsis ringkas, teks asli bahasa daerah, terjemahan Indonesia, nilai filosofis, pesan moral, dan leksikon arkais langka.
                </p>
                <div className="text-[10px] text-amber-700 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/60 p-1.5 rounded border border-amber-200 dark:border-amber-900/40">
                  Perhatian: Cantumkan pantangan / tabu (pamali) penuturan.
                </div>
              </div>

              {/* Langkah 4 */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 relative">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center">
                  4
                </div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  Konteks & Pewarisan (Bagian B.3)
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Catat waktu tuturan (upacara panen, kelahiran, tolak bala, hiburan), audiens pendengar, dan status regenerasi penutur muda.
                </p>
                <div className="text-[10px] text-amber-700 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/60 p-1.5 rounded border border-amber-200 dark:border-amber-900/40">
                  Tentukan status: Aktif, Terancam, atau Punah.
                </div>
              </div>

              {/* Langkah 5 */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 relative">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center">
                  5
                </div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  Dokumentasi & Analisis (B.4 & Sistem)
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Ambil koordinat GPS titik rekam, unggah tautan audio/video, dan jalankan fitur Analisis Otomatis untuk deteksi motif ATU & indeks pelestarian.
                </p>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/60 p-1.5 rounded border border-emerald-200 dark:border-emerald-900/40">
                  Data otomatis tersimpan & siap diekspor ke format JSON / Excel.
                </div>
              </div>
            </div>
          </div>

          {/* Rincian Genre Sastra Lisan & Panduan Analisis ATU */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>8 Genre Sastra Lisan Utama & Pola Klasifikasi Indeks Motif ATU</span>
              </span>
              <button
                type="button"
                onClick={() => handleCopyText(`Klasifikasi Genre Sastra Lisan:\n1. Mitos: Cerita sakral terjadinya alam semesta, dewa-dewa, asal-usul manusia.\n2. Legenda: Cerita masa lampau yang dianggap benar terjadi, toponimi tempat, tokoh pahlawan lokal.\n3. Dongeng: Cerita khayalan semata yang mengandung pesan moral bagi anak-anak.\n4. Fabel: Cerita binatang personifikasi yang bertutur dan berperilaku seperti manusia.\n5. Nyanyian Rakyat / Tembang: Lirik puitis berirama untuk kerja, panen, atau menidurkan anak.\n6. Mantra Adat / Jampe: Teks tuturan magis sakral untuk upacara pengobatan, keselamatan, atau panen.\n7. Puisi Lisan / Pantun: Rima teratur bersajak yang dilantunkan secara berbalas dalam prosesi adat.\n8. Teater Tradisi Tutur: Pertunjukan drama naratif dengan perpaduan dialog, tembang, dan gamelan.`, 'sastra-genre')}
                className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedText === 'sastra-genre' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedText === 'sastra-genre' ? 'Tersalin' : 'Salin Ringkasan Genre'}</span>
              </button>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400">
                  <span>1. Mitos (Myth)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950">ATU 750-849</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Dianggap suci, berlatar zaman purba, melibatkan dewa atau kekuatan adikodrati (misal: Kisah Dewi Sri, Asal Usul Padi).
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-400">
                  <span>2. Legenda (Legend)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950">ATU 850-999</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Kisah semi-historis berlatar masa lalu yang meninggalkan bukti fisik toponimi geografi (misal: Sangkuriang, Danau Toba).
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-purple-700 dark:text-purple-400">
                  <span>3. Dongeng & Fabel</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950">ATU 1-299 / 300</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Kisah fiksi binatang cerdik atau keajaiban sihir tanpa ikatan ruang dan waktu nyata, bertujuan mendidik pekerti anak.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <span>4. Mantra & Nyanyian</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950">Ritual / Tradisi</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Teks liris ritmis untuk ritual agraris, pengobatan, panen, serta tembang dolanan pengiring permainan tradisional.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODUL 2: TATA CARA ALUR PENGISIAN VITALITAS BAHASA (95 INDIKATOR)         */}
      {/* ========================================================================= */}
      {(activeSubTab === 'semua' || activeSubTab === 'vitalitas') && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white font-bold shrink-0">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    MODUL PANDUAN 2
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Daya Hidup & Ketahanan Bahasa</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                  Tata Cara Lengkap Pengisian Kuesioner Vitalitas Bahasa Daerah (95 Indikator Baku)
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToView('kondisi-bahasa')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 cursor-pointer self-start sm:self-auto"
            >
              <span>Buka Modul Vitalitas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Konsep 6 Ranah & Skala Likert */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>6 Ranah Komunikasi Pengukuran Vitalitas (Total 95 Butir Pertanyaan)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-400">
                    <span>Ranah 1: Domestik / Keluarga</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 font-bold">Butir 1–18</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                    Interaksi ayah-ibu, orang tua kepada anak, antarsaudara kandung, kakek-nenek ke cucu, serta percakapan intim saat makan bersama di rumah.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-400">
                    <span>Ranah 2: Kemasyarakatan / Sosial</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 font-bold">Butir 19–38</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                    Tawar-menawar di pasar desa, pos ronda kamling, kerja bakti, pertemuan RT/RW, hajatan pernikahan, takziah kematian, dan peribadatan lokal.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-400">
                    <span>Ranah 3: Pendidikan (Sekolah)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 font-bold">Butir 39–54</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                    Percakapan siswa saat jam istirahat, pengantar guru untuk konsep sulit, pelajaran muatan lokal, ketersediaan bacaan cerita bahasa daerah.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-400">
                    <span>Ranah 4: Kedinasan & Pemerintahan</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 font-bold">Butir 55–68</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                    Pelayanan administrasi kantor desa, sambutan kepala desa dalam musyawarah, penyelesaian sengketa tanah adat, pengumuman publik.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-400">
                    <span>Ranah 5: Media, Seni & Digital</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 font-bold">Butir 69–82</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                    Siaran radio komunitas, lagu pop daerah, penggunaan dalam grup WhatsApp warga, unggahan status media sosial (TikTok, Instagram, Facebook).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-400">
                    <span>Ranah 6: Sikap Bahasa & Kebanggaan</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 font-bold">Butir 83–95</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                    Persepsi prestise generasi muda saat bertutur, rasa percaya diri di hadapan pendatang, komitmen orang tua mewariskan bahasa ibu ke anak.
                  </p>
                </div>
              </div>
            </div>

            {/* Skala Likert 1-5 & Rumus Rata-rata */}
            <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 space-y-3 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-indigo-600" />
                  <span>Skala Penilaian Likert 1 – 5</span>
                </h4>
                <p className="text-xs text-indigo-900/80 dark:text-indigo-300/80 mt-1">
                  Surveyor membacakan situasi dan mencatat respons informan dengan skala frekuensi atau persetujuan:
                </p>

                <div className="space-y-1.5 mt-2 text-xs">
                  <div className="flex items-center justify-between p-1.5 rounded bg-white/90 dark:bg-slate-900/90 border border-indigo-100 dark:border-indigo-900">
                    <span className="font-bold text-red-600 dark:text-red-400">Skor 1</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Tidak Pernah / Sangat Tidak Setuju</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-white/90 dark:bg-slate-900/90 border border-indigo-100 dark:border-indigo-900">
                    <span className="font-bold text-orange-600 dark:text-orange-400">Skor 2</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Pernah / Tidak Setuju</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-white/90 dark:bg-slate-900/90 border border-indigo-100 dark:border-indigo-900">
                    <span className="font-bold text-amber-600 dark:text-amber-400">Skor 3</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Jarang / Kurang Setuju (Netral)</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-white/90 dark:bg-slate-900/90 border border-indigo-100 dark:border-indigo-900">
                    <span className="font-bold text-blue-600 dark:text-blue-400">Skor 4</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Sering / Setuju</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-white/90 dark:bg-slate-900/90 border border-indigo-100 dark:border-indigo-900">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Skor 5</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Selalu / Sangat Setuju</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-indigo-200/80 dark:border-indigo-800/80">
                <div className="text-[11px] font-bold text-indigo-900 dark:text-indigo-200">
                  Rumus Rata-rata Skor:
                </div>
                <code className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 block bg-white dark:bg-slate-900 px-2 py-1 rounded mt-1 border border-indigo-200 dark:border-indigo-800">
                  Skor_Avg = Σ (Skor Jawaban) / (Total Butir Terisi)
                </code>
              </div>
            </div>
          </div>

          {/* 5 Kategori Status Vitalitas & Simulator Ringkas */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-600" />
                <span>5 Klasifikasi Standar Status Vitalitas Bahasa Daerah</span>
              </h4>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Diselaraskan dengan Pedoman UNESCO & EGIDS Fishman
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                  ≥ 4.20
                </span>
                <h5 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mt-1">
                  1. AMAN (Safe)
                </h5>
                <p className="text-[11px] text-emerald-900/80 dark:text-emerald-200/80 leading-snug">
                  Dituturkan lancar oleh seluruh generasi di semua ranah. Tidak ada ancaman kepunahan terdekat.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-600 text-white">
                  3.40 – 4.19
                </span>
                <h5 className="text-xs font-bold text-amber-800 dark:text-amber-300 mt-1">
                  2. RENTAN (Vulnerable)
                </h5>
                <p className="text-[11px] text-amber-900/80 dark:text-amber-200/80 leading-snug">
                  Anak-anak masih bertutur, tetapi mulai terdesak bahasa nasional di luar rumah. Perlu penguatan muatan lokal.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 space-y-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-600 text-white">
                  2.60 – 3.39
                </span>
                <h5 className="text-xs font-bold text-orange-800 dark:text-orange-300 mt-1">
                  3. MUNDUR (Endangered)
                </h5>
                <p className="text-[11px] text-orange-900/80 dark:text-orange-200/80 leading-snug">
                  Orang tua mengerti tetapi jarang bertutur ke anak. Transmisi antargenerasi di rumah mulai terputus.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white">
                  1.80 – 2.59
                </span>
                <h5 className="text-xs font-bold text-rose-800 dark:text-rose-300 mt-1">
                  4. TERANCAM (Severely)
                </h5>
                <p className="text-[11px] text-rose-900/80 dark:text-rose-200/80 leading-snug">
                  Hanya dituturkan generasi kakek-nenek (&gt;50 thn). Generasi muda hanya mengerti beberapa kosakata pasif.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 space-y-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-700 text-white">
                  &lt; 1.80
                </span>
                <h5 className="text-xs font-bold text-red-800 dark:text-red-300 mt-1">
                  5. KRITIS (Critical)
                </h5>
                <p className="text-[11px] text-red-900/80 dark:text-red-200/80 leading-snug">
                  Hanya segelintir penutur tertua (&gt;70 thn). Sangat mendesak didokumentasikan sebelum punah total.
                </p>
              </div>
            </div>

            {/* Interactive Vitalitas Simulator */}
            <div className="mt-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Simulasi Pengujian Skor Vitalitas:
                  </span>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    Skor: {simVitalitasScore.toFixed(2)} / 5.00
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.05"
                  value={simVitalitasScore}
                  onChange={(e) => setSimVitalitasScore(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="sm:max-w-xs shrink-0 p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getVitalitasStatus(simVitalitasScore).badge}`}>
                    {getVitalitasStatus(simVitalitasScore).label}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  {getVitalitasStatus(simVitalitasScore).desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODUL 3: TATA CARA ALUR PENGISIAN REVITALISASI BAHASA DAERAH (RAP & MONEV) */}
      {/* ========================================================================= */}
      {(activeSubTab === 'semua' || activeSubTab === 'revitalisasi') && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-teal-600 text-white font-bold shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    MODUL PANDUAN 3
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Merdeka Belajar Episode 17</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                  Tata Cara Lengkap Pengisian Kuesioner Revitalisasi Bahasa Daerah (RBD)
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToView('revitalisasi')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 cursor-pointer self-start sm:self-auto"
            >
              <span>Buka Menu Revitalisasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Modul Revitalisasi Bahasa Daerah mengintegrasikan 2 instrumen utama yang saling melengkapi:
            <strong> (1) Formulir Rencana Aksi Pemda (RAP)</strong> untuk perencanaan dan pengimbasan kurikulum tunas bahasa ibu, dan 
            <strong> (2) Instrumen Monev IKRBD</strong> untuk evaluasi keberhasilan kebijakan pelestarian berbasis data numerik terverifikasi.
          </p>

          {/* Sub-Instrumen A: Rencana Aksi Pemda (RAP) */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>Instrumen A: Formulir Rencana Aksi Pemda (RAP) & 7 Tahap Standar Lini Masa</span>
              </h4>
              <span className="text-xs text-teal-700 dark:text-teal-400 font-semibold bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                Perencanaan & Pengimbasan
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-800 dark:text-white">1. Profil Pengajar Utama</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Isi nama lengkap guru master, NIP/NIK, instansi sekolah/sanggar kerja, dan kabupaten/kota target pengimbasan.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-800 dark:text-white">2. Sasaran Guru & Siswa</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Tentukan kuota target guru yang akan dilatih ToT (min. 15 guru) dan target siswa muda yang diimbaskan (min. 100 siswa).
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-800 dark:text-white">3. 7 Materi Pembelajaran FTBI</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Pilih materi inovatif: Aksara Daerah, Mendongeng, Pidato, Puisi Daerah, Tembang Tradisi, Komedi Tunggal, & Cerpen.
                </p>
              </div>
            </div>

            {/* 7 Tahap Lini Masa */}
            <div className="p-3 rounded-lg bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/40 space-y-2">
              <div className="text-xs font-bold text-teal-900 dark:text-teal-200">
                7 Tahapan Lini Masa Standar Nasional Merdeka Belajar RBD:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px] text-teal-900/90 dark:text-teal-200/90">
                <div className="p-2 rounded bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900">
                  <strong>Pebruari:</strong> Rakor Antarinstansi & Penetapan Bahasa Sasaran
                </div>
                <div className="p-2 rounded bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900">
                  <strong>Maret:</strong> DKT Penyusunan Modul & Silabus Pembelajaran
                </div>
                <div className="p-2 rounded bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900">
                  <strong>April–Mei:</strong> Pelatihan Guru Master (ToT Guru Inti)
                </div>
                <div className="p-2 rounded bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900">
                  <strong>Juni–Sept:</strong> Pengimbasan di Seluruh Satuan Pendidikan
                </div>
                <div className="p-2 rounded bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900">
                  <strong>Agustus–Okt:</strong> Pemantauan dan Evaluasi (Monev IKRBD)
                </div>
                <div className="p-2 rounded bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900">
                  <strong>Oktober:</strong> Festival Tunas Bahasa Ibu (FTBI) Tingkat Kab/Kota
                </div>
                <div className="p-2 rounded bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900 lg:col-span-2">
                  <strong>November:</strong> FTBI Tingkat Provinsi & Festival Nasional Kemendikbudristek
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Instrumen B: Monev IKRBD */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-teal-600" />
                <span>Instrumen B: Evaluasi Lapangan IKRBD (Indeks Kinerja Revitalisasi Bahasa Daerah)</span>
              </h4>
              <span className="text-xs text-indigo-700 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                5 Dimensi Terbobot (100%)
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Petugas Monev dari Balai/Kantor Bahasa atau Tim Pengawas Disdik memeriksa 5 dimensi evaluasi berikut di lapangan, memberikan skor 1 s.d. 5 beserta catatan bukti dokumen fisik:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 text-xs">
              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-700 dark:text-teal-400">Dimensi 1</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950">Bobot 25%</span>
                </div>
                <h5 className="font-bold text-slate-900 dark:text-white text-[11px]">Pembelajaran & Partisipasi Subjek</h5>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Cakupan penutur muda usia 6-18 tahun, transmisi harian, keterlibatan maestro adat lokal.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-700 dark:text-teal-400">Dimensi 2</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950">Bobot 20%</span>
                </div>
                <h5 className="font-bold text-slate-900 dark:text-white text-[11px]">Komunitas & Grassroots</h5>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Inisiatif sanggar seni pemuda, penggunaan bahasa di ruang publik desa, pasar, dan upacara.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-700 dark:text-teal-400">Dimensi 3</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950">Bobot 20%</span>
                </div>
                <h5 className="font-bold text-slate-900 dark:text-white text-[11px]">Kebijakan & Dukungan Pemda</h5>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Regulasi Perda/Perbup perlindungan bahasa, alokasi dana APBD/BOS Daerah, jam mulok wajib.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-700 dark:text-teal-400">Dimensi 4</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950">Bobot 15%</span>
                </div>
                <h5 className="font-bold text-slate-900 dark:text-white text-[11px]">Media & Ranah Digital</h5>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Publikasi karya siswa di YouTube/TikTok, siaran radio lokal, buku antologi cerita anak.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-700 dark:text-teal-400">Dimensi 5</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950">Bobot 20%</span>
                </div>
                <h5 className="font-bold text-slate-900 dark:text-white text-[11px]">Keberlanjutan Program</h5>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Rencana tahun lanjutan, kaderisasi regenerasi guru master baru, kemandirian paguyuban adat.
                </p>
              </div>
            </div>

            {/* Formula IKRBD & Predikat */}
            <div className="p-3.5 rounded-lg bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div>
                <span className="font-bold text-teal-900 dark:text-teal-200 block">
                  Rumus Perhitungan Indeks Kinerja Revitalisasi Bahasa Daerah (IKRBD):
                </span>
                <code className="text-xs font-mono font-bold text-teal-800 dark:text-teal-300 block mt-1">
                  IKRBD = Σ (Rata_Rata_Skor_Dimensi_i × Bobot_Persen_i)
                </code>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] border border-emerald-300">
                  ≥ 85% Sangat Berhasil
                </span>
                <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold text-[10px] border border-blue-300">
                  70–84.9% Berhasil
                </span>
                <span className="px-2 py-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[10px] border border-amber-300">
                  55–69.9% Cukup
                </span>
                <span className="px-2 py-1 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold text-[10px] border border-rose-300">
                  &lt; 55% Perlu Intervensi
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MATRIKS INTEGRASI DATA: KETERHUBUNGAN KE-3 KUESIONER DENGAN PETA & DIALEK  */}
      {/* ========================================================================= */}
      {(activeSubTab === 'semua' || activeSubTab === 'integrasi') && (
        <div className="bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-white dark:from-slate-900 dark:via-purple-950/20 dark:to-slate-900 border border-purple-200 dark:border-purple-900/60 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600" />
              <span>Matriks Integrasi: Keterkaitan 3 Kuesioner dalam Ekosistem Geolinguistik</span>
            </h4>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Siklus Lengkap Pelestarian
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Dalam sistem terpadu ini, data kuesioner tidak berdiri sendiri. Setiap butir data saling menyuplai analisis untuk menghasilkan potret utuh status kebahasaan di suatu wilayah administratif (desa, kecamatan, kabupaten, hingga provinsi):
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40 space-y-1.5 shadow-2xs">
              <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">Tahap 1: Pemetaan Leksikal</div>
              <h5 className="font-bold text-slate-900 dark:text-white">Instrumen Baku 16 Seksi</h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pengumpulan 200 kosakata Swadesh dan informasi desa untuk menghitung dialektometri Jean Guiter & penarikan garis isoglos.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40 space-y-1.5 shadow-2xs">
              <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">Tahap 2: Kodifikasi Budaya</div>
              <h5 className="font-bold text-slate-900 dark:text-white">Kuesioner Sastra Lisan</h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Menangkap ekspresi budaya takbenda, transkripsi bahasa arkais, dan klasifikasi motif ATU yang melekat pada wilayah tutur.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40 space-y-1.5 shadow-2xs">
              <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Tahap 3: Diagnosis Status</div>
              <h5 className="font-bold text-slate-900 dark:text-white">Kuesioner Vitalitas (95 Butir)</h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Mendiagnosis apakah bahasa di wilayah tersebut berstatus Aman, Rentan, Mundur, Terancam, atau Kritis.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40 space-y-1.5 shadow-2xs">
              <div className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase">Tahap 4: Solusi & Aksi Nyata</div>
              <h5 className="font-bold text-slate-900 dark:text-white">Revitalisasi RAP & Monev IKRBD</h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Bila vitalitas menunjukkan status rentan/mundur, Pemda menyusun RAP untuk melatih guru master dan mengevaluasi capaian IKRBD.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CHECKLIST AKHIR SURVEYOR & VALIDATOR */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Checklist Verifikasi 6 Poin Sebelum Data Dinyatakan Valid oleh Verifikator</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
            <span>Identitas narasumber & persetujuan etis terisi lengkap.</span>
          </div>
          <div className="flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
            <span>Titik koordinat GPS lintang & bujur valid dan tidak melenceng di laut.</span>
          </div>
          <div className="flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
            <span>Teks asli sastra lisan disertai terjemahan Bahasa Indonesia.</span>
          </div>
          <div className="flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
            <span>95 butir vitalitas terisi minimal 80% untuk kalkulasi skor valid.</span>
          </div>
          <div className="flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
            <span>Instrumen Monev IKRBD menyertakan bukti fisik dokumen/SK/foto kegiatan.</span>
          </div>
          <div className="flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
            <span>Data disinkronkan ke cloud atau diekspor ke cadangan JSON terenkripsi.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
