import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Download, 
  FileText, 
  MapPin, 
  Users, 
  GraduationCap, 
  Languages, 
  CheckCircle2, 
  Filter, 
  BarChart3, 
  Building2, 
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Printer,
  Compass,
  BookOpen,
  Activity,
  Layers
} from 'lucide-react';
import { SurveyRecord } from '../../types/linguistic';
import { 
  computeRegionalStats, 
  generateRegionalSummaryPdf, 
  RegionalFilterOptions 
} from '../../utils/generateRegionalSummaryPdf';
import { loadSastraLisanRecords } from '../../utils/sastraLisanStorage';
import { loadVitalitasResponses } from '../../utils/vitalitasStorage';
import { loadMonevRecords } from '../../utils/revitalisasiStorage';
import { CartoRegionalMap } from './CartoRegionalMap';
import { SastraLisanRecord } from '../../types/sastraLisan';
import { KuesionerVitalitasResponse } from '../../data/kuesionerVitalitasData';
import { RevitalisasiMonevRecord } from '../../types/revitalisasi';

interface RegionalSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  surveys: SurveyRecord[];
  activeSurveyId?: string | null;
  initialFilter?: RegionalFilterOptions;
  autoDownloadOnOpen?: boolean;
}

export const RegionalSummaryModal: React.FC<RegionalSummaryModalProps> = ({
  isOpen,
  onClose,
  surveys,
  activeSurveyId,
  initialFilter,
  autoDownloadOnOpen = false
}) => {
  // Region filter states
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [selectedRegency, setSelectedRegency] = useState<string>('all');
  const [selectedVillage, setSelectedVillage] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'peta_carto' | 'tri_instrumen' | 'demografi' | 'pendidikan' | 'bahasa' | 'survei'>('peta_carto');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  // Tri-instrument state loaded from storage
  const [sastraLisanList, setSastraLisanList] = useState<SastraLisanRecord[]>([]);
  const [vitalitasList, setVitalitasList] = useState<KuesionerVitalitasResponse[]>([]);
  const [monevList, setMonevList] = useState<RevitalisasiMonevRecord[]>([]);

  // Load storage records whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setSastraLisanList(loadSastraLisanRecords());
      setVitalitasList(loadVitalitasResponses());
      setMonevList(loadMonevRecords());
    }
  }, [isOpen]);

  // Available provinces from surveys and questionnaires
  const provinceOptions = useMemo(() => {
    const set = new Set<string>();
    surveys.forEach(s => {
      const p = s.data.titikPengamatan.provinsi?.trim();
      if (p) set.add(p);
    });
    sastraLisanList.forEach(item => {
      const p = item.lokasi?.provinsi?.trim();
      if (p) set.add(p);
    });
    return Array.from(set).sort();
  }, [surveys, sastraLisanList]);

  // Available regencies based on chosen province
  const regencyOptions = useMemo(() => {
    const set = new Set<string>();
    surveys.forEach(s => {
      const p = s.data.titikPengamatan.provinsi?.trim();
      const k = s.data.titikPengamatan.kabupatenKota?.trim();
      if (k && (selectedProvince === 'all' || p?.toLowerCase() === selectedProvince.toLowerCase())) {
        set.add(k);
      }
    });
    sastraLisanList.forEach(item => {
      const p = item.lokasi?.provinsi?.trim();
      const k = item.lokasi?.kabupatenKota?.trim();
      if (k && (selectedProvince === 'all' || p?.toLowerCase() === selectedProvince.toLowerCase())) {
        set.add(k);
      }
    });
    vitalitasList.forEach(item => {
      const k = item.kabupatenKota?.trim();
      if (k) set.add(k);
    });
    monevList.forEach(item => {
      const k = item.kabupatenKota?.trim();
      if (k) set.add(k);
    });
    return Array.from(set).sort();
  }, [surveys, sastraLisanList, vitalitasList, monevList, selectedProvince]);

  // Available villages based on chosen province & regency
  const villageOptions = useMemo(() => {
    const set = new Set<string>();
    surveys.forEach(s => {
      const p = s.data.titikPengamatan.provinsi?.trim();
      const k = s.data.titikPengamatan.kabupatenKota?.trim();
      const v = s.data.titikPengamatan.namaDesa?.trim();
      const matchP = selectedProvince === 'all' || p?.toLowerCase() === selectedProvince.toLowerCase();
      const matchK = selectedRegency === 'all' || k?.toLowerCase() === selectedRegency.toLowerCase();
      if (v && matchP && matchK) {
        set.add(v);
      }
    });
    sastraLisanList.forEach(item => {
      const p = item.lokasi?.provinsi?.trim();
      const k = item.lokasi?.kabupatenKota?.trim();
      const v = item.lokasi?.desaKelurahan?.trim();
      const matchP = selectedProvince === 'all' || p?.toLowerCase() === selectedProvince.toLowerCase();
      const matchK = selectedRegency === 'all' || k?.toLowerCase() === selectedRegency.toLowerCase();
      if (v && matchP && matchK) {
        set.add(v);
      }
    });
    vitalitasList.forEach(item => {
      const k = item.kabupatenKota?.trim();
      const v = item.desa?.trim();
      const matchK = selectedRegency === 'all' || k?.toLowerCase() === selectedRegency.toLowerCase();
      if (v && matchK) set.add(v);
    });
    monevList.forEach(item => {
      const k = item.kabupatenKota?.trim();
      const v = item.desa?.trim();
      const matchK = selectedRegency === 'all' || k?.toLowerCase() === selectedRegency.toLowerCase();
      if (v && matchK) set.add(v);
    });
    return Array.from(set).sort();
  }, [surveys, sastraLisanList, vitalitasList, monevList, selectedProvince, selectedRegency]);

  // Synchronize initial filter or active survey if specified
  useEffect(() => {
    if (initialFilter) {
      if (initialFilter.province) setSelectedProvince(initialFilter.province);
      if (initialFilter.regency) setSelectedRegency(initialFilter.regency);
      if (initialFilter.village) setSelectedVillage(initialFilter.village);
    }
  }, [initialFilter, isOpen]);

  // Compute live statistics for preview
  const { stats, filteredSurveys } = useMemo(() => {
    return computeRegionalStats(surveys, {
      province: selectedProvince,
      regency: selectedRegency,
      village: selectedVillage,
      sastraLisanList,
      vitalitasList,
      monevList
    });
  }, [surveys, selectedProvince, selectedRegency, selectedVillage, sastraLisanList, vitalitasList, monevList]);

  // Filtered tri-instrument records for the detailed tabs
  const filteredSastraLisan = useMemo(() => {
    return sastraLisanList.filter(item => {
      const p = item.lokasi?.provinsi?.toLowerCase();
      const k = item.lokasi?.kabupatenKota?.toLowerCase();
      const v = item.lokasi?.desaKelurahan?.toLowerCase();

      const matchP = selectedProvince === 'all' || !p || p === selectedProvince.toLowerCase();
      const matchK = selectedRegency === 'all' || !k || k === selectedRegency.toLowerCase();
      const matchV = selectedVillage === 'all' || !v || v === selectedVillage.toLowerCase();
      return matchP && matchK && matchV;
    });
  }, [sastraLisanList, selectedProvince, selectedRegency, selectedVillage]);

  const filteredVitalitas = useMemo(() => {
    return vitalitasList.filter(item => {
      const k = item.kabupatenKota?.toLowerCase();
      const v = item.desa?.toLowerCase();

      const matchK = selectedRegency === 'all' || !k || k === selectedRegency.toLowerCase();
      const matchV = selectedVillage === 'all' || !v || v === selectedVillage.toLowerCase();
      return matchK && matchV;
    });
  }, [vitalitasList, selectedProvince, selectedRegency, selectedVillage]);

  const filteredMonev = useMemo(() => {
    return monevList.filter(item => {
      const k = item.kabupatenKota?.toLowerCase();
      const v = item.desa?.toLowerCase();

      const matchK = selectedRegency === 'all' || !k || k === selectedRegency.toLowerCase();
      const matchV = selectedVillage === 'all' || !v || v === selectedVillage.toLowerCase();
      return matchK && matchV;
    });
  }, [monevList, selectedProvince, selectedRegency, selectedVillage]);

  // Handle PDF Generation and automatic download
  const handleDownloadPdf = () => {
    try {
      setIsGenerating(true);
      const res = generateRegionalSummaryPdf(surveys, {
        province: selectedProvince,
        regency: selectedRegency,
        village: selectedVillage,
        sastraLisanList,
        vitalitasList,
        monevList
      });

      setDownloadSuccessMessage(`PDF Laporan berhasil diunduh: ${res.fileName}`);
      setTimeout(() => setDownloadSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Gagal membuat PDF laporan ringkasan wilayah:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // If autoDownloadOnOpen is true, trigger on first open
  useEffect(() => {
    if (isOpen && autoDownloadOnOpen) {
      const timer = setTimeout(() => {
        handleDownloadPdf();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoDownloadOnOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-start sm:items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-800/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                  Laporan Ringkasan Wilayah & Peta Spasial CARTO
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  Tri-Instrumen Terintegrasi
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                Hasil pengisian instrumen Sastra Lisan, Vitalitas Bahasa, Revitalisasi (IKRBD), dan data survei dialektometri.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating || filteredSurveys.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-all active:scale-95"
              title="Unduh berkas PDF laporan komprehensif"
            >
              <Download className={`w-3.5 h-3.5 ${isGenerating ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline">{isGenerating ? 'Membuat PDF...' : 'Unduh PDF Laporan'}</span>
              <span className="sm:hidden">{isGenerating ? 'PDF...' : 'PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success toast notification inside modal */}
        {downloadSuccessMessage && (
          <div className="mx-4 sm:mx-6 mt-3 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-medium flex items-center justify-between gap-2 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{downloadSuccessMessage}</span>
            </div>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">Tersimpan di Unduhan</span>
          </div>
        )}

        {/* Region Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-1.5 mb-2.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Filter className="w-3.5 h-3.5 text-indigo-600 dark:text-sky-400" />
            <span>Pilih Cakupan Wilayah Laporan & Peta:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* 1. Provinsi */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                Provinsi
              </label>
              <select
                value={selectedProvince}
                onChange={(e) => {
                  setSelectedProvince(e.target.value);
                  setSelectedRegency('all');
                  setSelectedVillage('all');
                }}
                className="w-full text-xs py-2 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">Semua Provinsi ({provinceOptions.length})</option>
                {provinceOptions.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* 2. Kabupaten/Kota */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                Kabupaten / Kota
              </label>
              <select
                value={selectedRegency}
                onChange={(e) => {
                  setSelectedRegency(e.target.value);
                  setSelectedVillage('all');
                }}
                className="w-full text-xs py-2 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">Semua Kabupaten / Kota ({regencyOptions.length})</option>
                {regencyOptions.map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            {/* 3. Desa / Titik Pengamatan */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                Titik Pengamatan (Desa)
              </label>
              <select
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
                className="w-full text-xs py-2 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">Semua Desa Terdata ({villageOptions.length})</option>
                {villageOptions.map(v => (
                  <option key={v} value={v}>Desa {v}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* Quick Stats Grid - Incorporating All 3 Instruments */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {/* 1. Titik Survei */}
            <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60">
              <span className="text-[10px] font-bold tracking-wider text-indigo-700 dark:text-indigo-400 uppercase">
                Titik Survei
              </span>
              <div className="text-xl font-black text-indigo-950 dark:text-indigo-100 mt-0.5">
                {stats.surveyCount}
              </div>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-300 font-medium">
                {stats.verifiedCount} Tervalidasi
              </span>
            </div>

            {/* 2. Sastra Lisan */}
            <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60">
              <span className="text-[10px] font-bold tracking-wider text-purple-700 dark:text-purple-400 uppercase">
                Sastra Lisan
              </span>
              <div className="text-xl font-black text-purple-950 dark:text-purple-100 mt-0.5">
                {filteredSastraLisan.length}
              </div>
              <span className="text-[10px] text-purple-600 dark:text-purple-300 font-medium truncate block">
                Karya Budaya Lisan
              </span>
            </div>

            {/* 3. Vitalitas Bahasa */}
            <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60">
              <span className="text-[10px] font-bold tracking-wider text-amber-700 dark:text-amber-400 uppercase">
                Daya Hidup
              </span>
              <div className="text-xl font-black text-amber-950 dark:text-amber-100 mt-0.5 truncate">
                {stats.vitalitasAvgScore} <span className="text-xs font-normal">/5</span>
              </div>
              <span className="text-[10px] text-amber-600 dark:text-amber-300 font-medium">
                {stats.vitalitasStatusSummary}
              </span>
            </div>

            {/* 4. Revitalisasi IKRBD */}
            <div className="p-3 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60">
              <span className="text-[10px] font-bold tracking-wider text-teal-700 dark:text-teal-400 uppercase">
                IKRBD Revitalisasi
              </span>
              <div className="text-xl font-black text-teal-950 dark:text-teal-100 mt-0.5 truncate">
                {stats.revitalisasiIkrbdAvg} <span className="text-xs font-normal">/100</span>
              </div>
              <span className="text-[10px] text-teal-600 dark:text-teal-300 font-medium truncate block">
                {stats.revitalisasiCategory}
              </span>
            </div>

            {/* 5. Estimasi Populasi */}
            <div className="p-3 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/60">
              <span className="text-[10px] font-bold tracking-wider text-sky-700 dark:text-sky-400 uppercase">
                Populasi
              </span>
              <div className="text-xl font-black text-sky-950 dark:text-sky-100 mt-0.5 truncate">
                {stats.totalPopulation > 0 ? stats.totalPopulation.toLocaleString('id-ID') : '-'}
              </div>
              <span className="text-[10px] text-sky-600 dark:text-sky-300 font-medium truncate block">
                Jiwa Penduduk
              </span>
            </div>

            {/* 6. Bahasa Daerah */}
            <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
              <span className="text-[10px] font-bold tracking-wider text-emerald-700 dark:text-emerald-400 uppercase">
                Bahasa
              </span>
              <div className="text-xl font-black text-emerald-950 dark:text-emerald-100 mt-0.5 truncate">
                {stats.languages.length > 0 ? stats.languages[0] : 'Lokal'}
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-300 font-medium truncate block">
                {stats.languages.length} Teridentifikasi
              </span>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-x-auto">
            {/* Tab: Peta CARTO.com */}
            <button
              onClick={() => setActiveTab('peta_carto')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
                activeTab === 'peta_carto'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Peta Spasial CARTO</span>
            </button>

            {/* Tab: Tri-Instrumen */}
            <button
              onClick={() => setActiveTab('tri_instrumen')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
                activeTab === 'tri_instrumen'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Matriks Tri-Instrumen</span>
            </button>

            {/* Tab: Demografi */}
            <button
              onClick={() => setActiveTab('demografi')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
                activeTab === 'demografi'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Demografi</span>
            </button>

            {/* Tab: Pendidikan */}
            <button
              onClick={() => setActiveTab('pendidikan')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
                activeTab === 'pendidikan'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Pendidikan</span>
            </button>

            {/* Tab: Kebahasaan */}
            <button
              onClick={() => setActiveTab('bahasa')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
                activeTab === 'bahasa'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>Kebahasaan</span>
            </button>

            {/* Tab: Titik Survei */}
            <button
              onClick={() => setActiveTab('survei')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
                activeTab === 'survei'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Titik Survei ({filteredSurveys.length})</span>
            </button>
          </div>

          {/* TAB 0: PETA SPASIAL CARTO.COM */}
          {activeTab === 'peta_carto' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <CartoRegionalMap
                surveys={surveys}
                sastraLisanList={sastraLisanList}
                vitalitasList={vitalitasList}
                monevList={monevList}
                selectedProvince={selectedProvince}
                selectedRegency={selectedRegency}
                selectedVillage={selectedVillage}
              />
            </div>
          )}

          {/* TAB: MATRIKS TRI-INSTRUMEN KEBAHASAAN */}
          {activeTab === 'tri_instrumen' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* 1. Sastra Lisan Section */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        1. Instrumen Pemetaan Sastra Lisan ({filteredSastraLisan.length} Karya Terdata)
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Inventarisasi cerita rakyat, mitos, epos, dan tradisi lisan berkoordinat geografis.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                    Spasial CARTO
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredSastraLisan.map(item => (
                    <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                      <div className="flex items-start justify-between gap-1.5">
                        <h5 className="font-bold text-slate-900 dark:text-white leading-snug">
                          {item.namaSastraLisan}
                        </h5>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 shrink-0">
                          {item.analisisJenis?.jenisUtama || 'Cerita Rakyat'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                        <div><strong>Narasumber:</strong> {item.narasumber?.namaLengkap || '-'} ({item.narasumber?.usia || '-'} th)</div>
                        <div><strong>Komunitas:</strong> {item.narasumber?.komunitas?.namaKomunitas || 'Penutur Adat Desa'}</div>
                        <div><strong>Lokasi:</strong> Desa {item.lokasi?.desaKelurahan || '-'}, {item.lokasi?.kabupatenKota || '-'}</div>
                      </div>
                      {item.kutipanTuturan && (
                        <p className="text-[10px] text-purple-900 dark:text-purple-300 italic p-2 bg-purple-50/60 dark:bg-purple-950/40 rounded-lg border border-purple-200/50">
                          "{item.kutipanTuturan}"
                        </p>
                      )}
                    </div>
                  ))}
                  {filteredSastraLisan.length === 0 && (
                    <div className="col-span-full text-center py-6 text-xs text-slate-400">
                      Belum ada data sastra lisan pada filter wilayah yang dipilih.
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Vitalitas Bahasa Section */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        2. Instrumen Vitalitas Bahasa (95 Butir Indikator Daya Hidup)
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Evaluasi ranah keluarga, transmisi generasi muda, ranah publik, dan sikap bahasa.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Skala 1.0 - 5.0
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredVitalitas.map(item => (
                    <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{item.bahasaDaerah}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.vitalitasStatus === 'Aman' ? 'bg-emerald-100 text-emerald-800' :
                          item.vitalitasStatus === 'Rentan' ? 'bg-sky-100 text-sky-800' :
                          item.vitalitasStatus === 'Mengalami Kemunduran' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {item.vitalitasStatus}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                        <div><strong>Skor Rata-rata:</strong> <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{item.scoreAvg.toFixed(2)}</span> / 5.0</div>
                        <div><strong>Responden:</strong> {item.respondenNama} ({item.respondenUsia || '-'} th)</div>
                        <div><strong>Desa:</strong> {item.desa}, {item.kabupatenKota || '-'}</div>
                        <div><strong>Butir Terisi:</strong> {item.totalAnswered} / 95</div>
                      </div>
                    </div>
                  ))}
                  {filteredVitalitas.length === 0 && (
                    <div className="col-span-full text-center py-6 text-xs text-slate-400">
                      Belum ada data kuesioner vitalitas pada filter wilayah ini.
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Revitalisasi Bahasa (IKRBD) Section */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        3. Instrumen Monitoring & Evaluasi Revitalisasi Bahasa (IKRBD)
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Capaian 5 dimensi: Pembelajaran, Komunitas, Modul Ajar, Regulasi Lokal, dan Festival Budaya.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                    Skor IKRBD (0-100)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredMonev.map(item => (
                    <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{item.bahasaDaerah}</span>
                        <div className="text-right">
                          <span className="text-base font-black text-teal-700 dark:text-teal-300 font-mono block">
                            {item.ikrbdScore}
                          </span>
                          <span className="text-[9px] font-bold uppercase text-teal-600">{item.kategori}</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                        <div><strong>Lokasi:</strong> {item.desa}, Kec. {item.kecamatan}, {item.kabupatenKota}</div>
                        <div><strong>Petugas Monev:</strong> {item.petugasMonev} (NIP: {item.nipPetugas || '-'})</div>
                        <div><strong>Status Pelaksanaan:</strong> {item.statusPelaksanaan}</div>
                      </div>
                      <div className="p-2 bg-teal-50 dark:bg-teal-950/40 rounded-lg text-[10px] text-teal-900 dark:text-teal-200 border border-teal-200/50">
                        <strong>Intervensi Kebijakan:</strong> {item.intervensiKebijakan}
                      </div>
                    </div>
                  ))}
                  {filteredMonev.length === 0 && (
                    <div className="col-span-full text-center py-6 text-xs text-slate-400">
                      Belum ada data monev revitalisasi pada filter wilayah ini.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: DEMOGRAFI */}
          {activeTab === 'demografi' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Distribusi Gender & Usia */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>Piramida Usia & Jenis Kelamin</span>
                  </h4>
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600 dark:text-slate-300">Laki-laki:</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{stats.totalMale.toLocaleString('id-ID')} Jiwa</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full" 
                        style={{ width: `${stats.totalPopulation > 0 ? (stats.totalMale / stats.totalPopulation) * 100 : 50}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="text-slate-600 dark:text-slate-300">Perempuan:</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{stats.totalFemale.toLocaleString('id-ID')} Jiwa</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-rose-500 h-2 rounded-full" 
                        style={{ width: `${stats.totalPopulation > 0 ? (stats.totalFemale / stats.totalPopulation) * 100 : 50}%` }}
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
                      <div className="flex justify-between">
                        <span>Generasi Muda (&lt; 20 tahun):</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{stats.ageUnder20.toLocaleString('id-ID')} Jiwa</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Usia Produktif (20 - 40 tahun):</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{stats.age20to40.toLocaleString('id-ID')} Jiwa</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Generasi Senior (&gt; 40 tahun):</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{stats.ageAbove40.toLocaleString('id-ID')} Jiwa</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sektor Mata Pencaharian */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>Komposisi Mata Pencaharian Utama</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300">Petani / Bercocok Tanam:</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{stats.livelihoods.farming}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300">Nelayan / Pesisir:</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{stats.livelihoods.fishing}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300">Pedagang / Wiraswasta:</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{stats.livelihoods.trade}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300">Buruh Pabrik / Bangunan:</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{stats.livelihoods.labor}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-600 dark:text-slate-300">Pegawai / ASN / Guru:</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{stats.livelihoods.civilServant}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suku Bangsa / Etnik */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Komposisi Suku Bangsa &amp; Kelompok Etnis
                </h4>
                <div className="flex flex-wrap gap-2">
                  {stats.ethnicGroups.map((e, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      <span>{e.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white dark:bg-slate-700 rounded-md shadow-2xs">
                        {e.count}
                      </span>
                    </span>
                  ))}
                  {stats.ethnicGroups.length === 0 && (
                    <span className="text-xs text-slate-400 italic">Data suku bangsa belum tersedia.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PENDIDIKAN */}
          {activeTab === 'pendidikan' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tingkat Pendidikan Penduduk */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-sky-600" />
                    <span>Tingkat Pendidikan Formal Penduduk</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300">Tidak Bersekolah:</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{stats.educationLevels.noSchool}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300">SD / Sederajat:</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{stats.educationLevels.elementary}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300">SMP / MTs:</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{stats.educationLevels.juniorHigh}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300">SMA / SMK / MA:</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{stats.educationLevels.seniorHigh}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300">Perguruan Tinggi (Diploma/S1/S2):</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{stats.educationLevels.university}</span>
                    </div>
                    <div className="flex justify-between py-1 pt-2 text-indigo-700 dark:text-sky-400 font-semibold">
                      <span>Lulusan Sarjana Asal Desa:</span>
                      <span className="font-mono font-bold">{stats.educationLevels.scholarsFromVillage} Orang</span>
                    </div>
                  </div>
                </div>

                {/* Fasilitas Pendidikan di Desa */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span>Ketersediaan Sarana Pendidikan</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300">Gedung SD / MI:</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{stats.educationFacilities.elementary} Unit</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300">Gedung SMP / MTs:</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{stats.educationFacilities.juniorHigh} Unit</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300">Gedung SMA / SMK:</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{stats.educationFacilities.seniorHigh} Unit</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300">Kampus / Balai Latihan:</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{stats.educationFacilities.university} Unit</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-600 dark:text-slate-300">Lembaga Kursus / Bimbel:</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{stats.educationFacilities.courses} Unit</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KEBAHASAAN */}
          {activeTab === 'bahasa' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Rekap Bahasa & Kosakata */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                    <Languages className="w-4 h-4 text-emerald-600" />
                    <span>Bahasa Daerah Utama &amp; Korpus</span>
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block mb-1">Bahasa Teridentifikasi:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {stats.languages.map((l, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                            {l}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Rerata Swadesh 200 Terisi:</span>
                        <span className="font-bold font-mono text-slate-900 dark:text-white">{stats.avgSwadeshCompleted} / 200 Kata</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Rerata Kosakata Budaya Terisi:</span>
                        <span className="font-bold font-mono text-slate-900 dark:text-white">{stats.avgCulturalWordsCompleted} Kata</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Penutur Bahasa Berdasarkan Usia */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <span>Distribusi Penutur Aktif Menurut Usia</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300">Penutur Usia Muda (&lt; 20 tahun):</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{stats.speakerUnder20.toLocaleString('id-ID')} Jiwa</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300">Penutur Usia Produktif (20-40 th):</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{stats.speaker20to40.toLocaleString('id-ID')} Jiwa</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300">Penutur Usia Lanjut (&gt; 40 th):</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{stats.speakerAbove40.toLocaleString('id-ID')} Jiwa</span>
                    </div>
                    <div className="flex justify-between py-1 pt-2 font-semibold text-emerald-700 dark:text-emerald-400">
                      <span>Total Penutur Bahasa Daerah:</span>
                      <span className="font-mono font-bold">{(stats.speakerMale + stats.speakerFemale).toLocaleString('id-ID')} Jiwa</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Batas Kontak Kebahasaan */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Peta Kontak Kebahasaan Perbatasan (4 Arah Mata Angin)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {stats.boundaryContacts.length > 0 ? (
                    stats.boundaryContacts.map((b, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">{b.direction}</span>
                        <span className="font-bold text-slate-900 dark:text-white block truncate">Ds. {b.village}</span>
                        <span className="text-[11px] text-indigo-600 dark:text-sky-400 font-medium block truncate">Bahasa {b.language}</span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-xs text-slate-400 p-2">
                      Informasi kontak perbatasan tersedia pada formulir kuesioner masing-masing titik.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TITIK SURVEI */}
          {activeTab === 'survei' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Menampilkan {filteredSurveys.length} survei lapangan yang masuk dalam cakupan laporan wilayah ini:
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">Desa / Titik</th>
                      <th className="py-2.5 px-3">Kecamatan &amp; Kab/Kota</th>
                      <th className="py-2.5 px-3">Bahasa</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Kelengkapan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredSurveys.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                          {s.data.titikPengamatan.namaDesa || 'Tanpa Nama'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                          {s.data.titikPengamatan.kecamatan || '-'}, {s.data.titikPengamatan.kabupatenKota || '-'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-sky-400">
                            {s.data.titikPengamatan.bahasaDigunakan || '-'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.isVerified
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          }`}>
                            {s.isVerified ? 'Tervalidasi' : 'Draft'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-600 dark:text-sky-400">
                          {s.progress || 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
            <span>Berkas PDF mencakup kop resmi, data spasial CARTO.com, rekapitulasi tri-instrumen, dan kolom pengesahan.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGenerating || filteredSurveys.length === 0}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <Download className={`w-4 h-4 ${isGenerating ? 'animate-bounce' : ''}`} />
              <span>{isGenerating ? 'Membuat & Mengunduh PDF...' : 'Unduh Laporan Wilayah (PDF)'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
