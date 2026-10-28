import React, { useMemo, useState } from 'react';
import { 
  Layers, 
  MapPin, 
  BookOpen, 
  Sparkles, 
  Plus, 
  RotateCcw, 
  CheckCircle2, 
  Compass, 
  ArrowRight, 
  FileText, 
  Users, 
  Activity, 
  Volume2, 
  Calendar, 
  Check, 
  Clock, 
  Maximize2,
  ExternalLink,
  Info,
  Search,
  Filter,
  Trash2,
  Copy,
  FolderOpen,
  ShieldCheck,
  Languages,
  Eye,
  Lock
} from 'lucide-react';
import { InstrumenPemetaanBahasaData, SurveyRecord } from '../../types/linguistic';
import { AppUser } from '../../types/auth';
import { SECTIONS_META } from '../NavigationStepper';

interface PemetaanBahasaIntroViewProps {
  data: InstrumenPemetaanBahasaData;
  canEdit: boolean;
  currentUser?: AppUser | null;
  onOpenQuestionnaire: (screenNumber?: number) => void;
  onLoadSample: () => void;
  onResetEmpty: () => void;
  onNavigateToDialektometri?: () => void;
  surveys?: SurveyRecord[];
  activeSurveyId?: string;
  onSelectSurvey?: (id: string) => void;
  onCreateNewSurvey?: (type: 'empty' | 'sample') => void;
  onDeleteSurvey?: (id: string) => void;
  onDuplicateSurvey?: (id: string) => void;
  selectedProvinceFilter?: string;
  onSelectProvinceFilter?: (prov: string) => void;
}

export const PemetaanBahasaIntroView: React.FC<PemetaanBahasaIntroViewProps> = ({
  data,
  canEdit,
  currentUser,
  onOpenQuestionnaire,
  onLoadSample,
  onResetEmpty,
  onNavigateToDialektometri,
  surveys = [],
  activeSurveyId = '',
  onSelectSurvey,
  onCreateNewSurvey,
  onDeleteSurvey,
  onDuplicateSurvey,
  selectedProvinceFilter = 'all',
  onSelectProvinceFilter
}) => {
  const [activeTab, setActiveTab] = useState<'survei' | 'seksi' | 'panduan'>('survei');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress'>('all');
  const [provinceFilter, setProvinceFilter] = useState<string>(selectedProvinceFilter || 'all');

  // Synchronize with parent province filter when changed
  React.useEffect(() => {
    if (selectedProvinceFilter !== undefined) {
      setProvinceFilter(selectedProvinceFilter);
    }
  }, [selectedProvinceFilter]);

  // List of distinct provinces
  const availableProvinces = useMemo(() => {
    const provSet = new Set<string>();
    surveys.forEach(s => {
      const p = (s.provinsi || s.data?.titikPengamatan?.provinsi || '').trim();
      if (p) provSet.add(p);
    });
    ['Jawa Barat', 'Banten', 'Jawa Tengah', 'Jawa Timur', 'Maluku', 'Maluku Utara', 'Nusa Tenggara Timur', 'Papua'].forEach(p => provSet.add(p));
    return Array.from(provSet).sort();
  }, [surveys]);

  const desaName = data.titikPengamatan.namaDesa ? `Desa ${data.titikPengamatan.namaDesa}` : 'Titik Acuan Belum Dinamai';
  const bahasaName = data.titikPengamatan.bahasaDigunakan || 'Bahasa Daerah Setempat';

  // Swadesh & Budaya Vocabulary Stats
  const swadeshCount = useMemo(() => {
    const list = data.kosakataLengkap?.swadeshList || [];
    const filled = list.filter(item => item.bentukLokal && item.bentukLokal.trim() !== '').length;
    const total = list.length || 200;
    return { filled, total, percentage: Math.round((filled / total) * 100) };
  }, [data.kosakataLengkap]);

  const budayaCount = useMemo(() => {
    const bidangList = data.kosakataLengkap?.kosakataBudaya || [];
    let filled = 0;
    bidangList.forEach(bidang => {
      const words = bidang.daftarKata || [];
      filled += words.filter(w => w.bentukLokal && w.bentukLokal.trim() !== '').length;
    });
    return filled;
  }, [data.kosakataLengkap]);

  // Determine completion of each section (1 - 16)
  const sectionStats = useMemo(() => {
    const checks: Record<number, { isFilled: boolean; summary: string }> = {
      1: {
        isFilled: Boolean(data.titikPengamatan?.namaDesa && data.titikPengamatan?.bahasaDigunakan),
        summary: data.titikPengamatan?.namaDesa ? `Desa ${data.titikPengamatan.namaDesa}, ${data.titikPengamatan.kabupatenKota || ''}` : 'Belum diisi'
      },
      2: {
        isFilled: Boolean(data.situasiKebahasaan?.utara?.bahasa || data.situasiKebahasaan?.selatan?.bahasa),
        summary: data.situasiKebahasaan?.utara?.bahasa ? `Batas Utara: ${data.situasiKebahasaan.utara.bahasa}` : 'Belum diisi'
      },
      3: {
        isFilled: Boolean(data.situasiGeografis?.morfologi || data.situasiGeografis?.koordinatLintang),
        summary: data.situasiGeografis?.morfologi ? `Morfologi: ${data.situasiGeografis.morfologi} (${data.situasiGeografis.letakPantai || 'darat'})` : 'Belum diisi'
      },
      4: {
        isFilled: Boolean(data.penduduk?.jumlahPria || data.penduduk?.mayoritasEtnik),
        summary: data.penduduk?.mayoritasEtnik ? `Etnis Mayoritas: ${data.penduduk.mayoritasEtnik}` : 'Belum diisi'
      },
      5: {
        isFilled: Boolean(data.mataPencaharian?.bertani || data.mataPencaharian?.nelayan || data.mataPencaharian?.berdagang),
        summary: 'Mata Pencaharian Penduduk'
      },
      6: {
        isFilled: Boolean(data.pendidikan?.sdSederajat || data.pendidikan?.smpSederajat),
        summary: 'Tingkat Pendidikan Penduduk'
      },
      7: {
        isFilled: Boolean(data.saranaPendidikan?.sdSederajat || data.saranaPendidikan?.keterangan),
        summary: 'Fasilitas Pendidikan Formal & Non-Formal'
      },
      8: {
        isFilled: Boolean(data.agama?.islam || data.agama?.kristen || data.agama?.katolik),
        summary: 'Data Agama & Keyakinan'
      },
      9: {
        isFilled: Boolean(data.hubunganMobilitas?.status),
        summary: data.hubunganMobilitas?.status ? `Mobilitas: ${data.hubunganMobilitas.status}` : 'Belum diisi'
      },
      10: {
        isFilled: Boolean(data.alatTransportasi?.sepedaMotor || data.alatTransportasi?.bus || data.alatTransportasi?.kapalMotor),
        summary: 'Sarana & Alat Transportasi'
      },
      11: {
        isFilled: Boolean(data.usiaDesa?.kategori || data.usiaDesa?.estimasiTahun),
        summary: data.usiaDesa?.kategori ? `Kategori: ${data.usiaDesa.kategori}` : 'Belum diisi'
      },
      12: {
        isFilled: Boolean(data.sejarahDesa?.asalUsulNama || data.sejarahDesa?.tokohPendiri),
        summary: data.sejarahDesa?.tokohPendiri ? `Tokoh: ${data.sejarahDesa.tokohPendiri}` : 'Belum diisi'
      },
      13: {
        isFilled: Boolean(data.folklore?.judulFolklore || data.folklore?.ringkasanCerita),
        summary: data.folklore?.judulFolklore ? `Folklore: ${data.folklore.judulFolklore}` : 'Belum diisi'
      },
      14: {
        isFilled: Boolean(data.narasumberList && data.narasumberList.length > 0 && data.narasumberList[0]?.nama),
        summary: `${data.narasumberList?.filter(n => n.nama)?.length || 0} Narasumber Terdaftar`
      },
      15: {
        isFilled: swadeshCount.filled > 0,
        summary: `${swadeshCount.filled}/${swadeshCount.total} Swadesh, ${budayaCount} Budaya`
      },
      16: {
        isFilled: Boolean(data.dialektometri?.titikPembandingList && data.dialektometri.titikPembandingList.length > 0),
        summary: `${data.dialektometri?.titikPembandingList?.length || 0} Titik Pembanding Terdata`
      }
    };

    let filledCount = 0;
    Object.values(checks).forEach(c => {
      if (c.isFilled) filledCount++;
    });

    return {
      checks,
      filledCount,
      totalCount: 16,
      percentage: Math.round((filledCount / 16) * 100)
    };
  }, [data, swadeshCount, budayaCount]);

  // Filtered surveys list
  const filteredSurveys = useMemo(() => {
    return surveys.filter(s => {
      if (statusFilter === 'completed' && s.progress < 100) return false;
      if (statusFilter === 'in_progress' && s.progress === 100) return false;

      // Province filter matching
      if (provinceFilter !== 'all') {
        const sProv = (s.provinsi || s.data?.titikPengamatan?.provinsi || 'Jawa Barat').trim().toLowerCase();
        if (sProv !== provinceFilter.trim().toLowerCase()) return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const village = (s.data?.titikPengamatan?.namaDesa || s.title || '').toLowerCase();
      const lang = (s.bahasa || s.data?.titikPengamatan?.bahasaDigunakan || '').toLowerCase();
      const surveyor = (s.createdByName || '').toLowerCase();
      const district = (s.data?.titikPengamatan?.kecamatan || '').toLowerCase();
      const regency = (s.data?.titikPengamatan?.kabupatenKota || '').toLowerCase();
      const prov = (s.provinsi || s.data?.titikPengamatan?.provinsi || '').toLowerCase();
      return village.includes(q) || lang.includes(q) || surveyor.includes(q) || district.includes(q) || regency.includes(q) || prov.includes(q);
    });
  }, [surveys, statusFilter, provinceFilter, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* 1. INTRO HERO BANNER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Instrumen Pemetaan Bahasa (16 Seksi)
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-sky-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
                  Dialektologi & Geolinguistik
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Instrumen baku Badan Bahasa untuk dokumentasi komprehensif titik pengamatan lapangan: situasi kebahasaan, geografis, demografi, narasumber, 200 kosakata Swadesh, kosakata budaya, serta analisis dialektometri Guiter.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center shrink-0">
            {canEdit ? (
              <button
                type="button"
                onClick={() => onOpenQuestionnaire(1)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>Isi Kuesioner Pemetaan Bahasa</span>
                <Maximize2 className="w-3.5 h-3.5 opacity-80" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenQuestionnaire(1)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
                title="Buka kuesioner dalam mode hanya baca untuk meninjau butir-butir empiris"
              >
                <Eye className="w-4 h-4 text-sky-400" />
                <span>Tinjau Kuesioner (Mode Hanya Baca)</span>
                <Maximize2 className="w-3.5 h-3.5 opacity-80" />
              </button>
            )}

            {onCreateNewSurvey && currentUser?.role !== 'tamu' && (
              <button
                type="button"
                onClick={() => {
                  onCreateNewSurvey('empty');
                  onOpenQuestionnaire(1);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
                title="Buat titik kuesioner baru"
              >
                <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                <span>Titik Baru</span>
              </button>
            )}

            {currentUser?.role === 'tamu' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 rounded-xl text-xs font-semibold">
                <Lock className="w-3.5 h-3.5" />
                <span>Akses Riset Tamu (Hanya Baca)</span>
              </span>
            )}

            {canEdit && (
              <button
                type="button"
                onClick={onLoadSample}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
                title="Muat data sampel desa Cikaso"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                <span className="hidden sm:inline">Contoh Sampel</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. GLOBAL STATISTIC STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Titik Pengamatan Aktif</span>
            <div className="mt-1 flex items-baseline gap-1.5 truncate">
              <span className="text-base sm:text-lg font-bold text-blue-600 dark:text-sky-400 truncate">
                {data.titikPengamatan.namaDesa || 'Belum Dinamai'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block truncate">{bahasaName}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Kelengkapan 16 Seksi</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                {sectionStats.filledCount}/16
              </span>
              <span className="text-xs text-slate-400">Seksi ({sectionStats.percentage}%)</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${sectionStats.percentage}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Kosakata Swadesh 200</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {swadeshCount.filled}
              </span>
              <span className="text-xs text-slate-400">/ 200 Glos ({swadeshCount.percentage}%)</span>
            </div>
            <span className="text-[11px] text-slate-400 block">+ {budayaCount} Kosakata Budaya</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Titik Pembanding Dialektometri</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                {data.dialektometri?.titikPembandingList?.length || 0}
              </span>
              <span className="text-xs text-slate-400">Titik</span>
            </div>
            <span className="text-[11px] text-slate-400 block">Formula Guiter d%</span>
          </div>
        </div>
      </div>

      {/* 3. SUB-NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('survei')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'survei'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Kuesioner Tersimpan ({surveys.length || 1})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('seksi')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'seksi'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>16 Seksi Formulir</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('panduan')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'panduan'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>SOP & Panduan Pengisian</span>
          </button>
        </div>

        {activeTab === 'survei' && (
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari desa, bahasa, surveyor..."
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs placeholder-slate-400 focus:outline-hidden focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
              <select
                value={provinceFilter}
                onChange={e => {
                  const val = e.target.value;
                  setProvinceFilter(val);
                  if (onSelectProvinceFilter) onSelectProvinceFilter(val);
                }}
                className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden cursor-pointer"
              >
                <option value="all">Semua Provinsi</option>
                {availableProvinces.map(prov => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="completed">Selesai (100%)</option>
              <option value="in_progress">Sedang Diisi (&lt;100%)</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB CONTENT 1: DAFTAR KUESIONER TITIK PENGAMATAN TERSIMPAN */}
      {activeTab === 'survei' && (
        <div className="space-y-4">
          {filteredSurveys.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3">
              <FolderOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Tidak ada kuesioner pemetaan yang sesuai kriteria pencarian{provinceFilter !== 'all' ? ` di wilayah ${provinceFilter}` : ''}.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                {provinceFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => {
                      setProvinceFilter('all');
                      if (onSelectProvinceFilter) onSelectProvinceFilter('all');
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Tampilkan Semua Provinsi
                  </button>
                )}
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => onOpenQuestionnaire(1)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Isi Kuesioner Baru</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSurveys.map(survey => {
                const isActive = survey.id === activeSurveyId;
                const village = survey.data?.titikPengamatan?.namaDesa || survey.title || 'Desa Belum Dinamai';
                const lang = survey.bahasa || survey.data?.titikPengamatan?.bahasaDigunakan || 'Bahasa Daerah';
                const district = survey.data?.titikPengamatan?.kecamatan;
                const regency = survey.data?.titikPengamatan?.kabupatenKota;
                const prov = survey.provinsi || survey.data?.titikPengamatan?.provinsi || 'Jawa Barat';

                return (
                  <div
                    key={survey.id}
                    className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all ${
                      isActive 
                        ? 'border-blue-500 ring-2 ring-blue-500/10 dark:border-sky-400' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {village}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5 text-blue-600 dark:text-sky-400" />
                              <span>{prov}</span>
                            </span>
                            {isActive && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-sky-300 border border-blue-200 dark:border-blue-800">
                                Aktif
                              </span>
                            )}
                            {survey.isVerified && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Terverifikasi</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {lang} • {district ? `Kec. ${district}, ` : ''}{regency || 'Wilayah Survei'} • <strong className="text-slate-700 dark:text-slate-300">{prov}</strong>
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Progres</span>
                          <span className={`text-lg font-black ${
                            survey.progress === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-sky-400'
                          }`}>
                            {survey.progress}%
                          </span>
                        </div>
                      </div>

                      {/* Info strip */}
                      <div className="grid grid-cols-2 gap-2 py-3 text-xs">
                        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                          <span className="text-slate-400 block text-[10px]">Surveyor</span>
                          <strong className="text-slate-800 dark:text-slate-200 font-semibold truncate block">
                            {survey.createdByName || survey.data?.kosakataLengkap?.catatanPengumpul?.namaLengkapPengumpul || 'Peneliti Lapangan'}
                          </strong>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                          <span className="text-slate-400 block text-[10px]">Pembaruan Terakhir</span>
                          <strong className="text-slate-800 dark:text-slate-200 font-semibold truncate block">
                            {survey.updatedAt ? new Date(survey.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Hari ini'}
                          </strong>
                        </div>
                      </div>

                      {/* Mini Progress bar */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            survey.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${survey.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        {!isActive && onSelectSurvey && (
                          <button
                            type="button"
                            onClick={() => onSelectSurvey(survey.id)}
                            className="text-xs font-semibold text-blue-600 dark:text-sky-400 hover:text-blue-700 cursor-pointer"
                          >
                            Pilih Sebagai Titik Aktif
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectSurvey && !isActive) onSelectSurvey(survey.id);
                            onOpenQuestionnaire(1);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-white font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ${
                            canEdit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-700 hover:bg-slate-800'
                          }`}
                          title={canEdit ? "Buka dan isi kuesioner ini dalam jendela baru terfokus" : "Tinjau data kuesioner dalam mode hanya baca"}
                        >
                          {canEdit ? <Maximize2 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{canEdit ? 'Buka Kuesioner' : 'Tinjau Kuesioner'}</span>
                        </button>

                        {currentUser?.role !== 'tamu' && onDuplicateSurvey && (
                          <button
                            type="button"
                            onClick={() => onDuplicateSurvey(survey.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Duplikasi kuesioner ini"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {currentUser?.role !== 'tamu' && onDeleteSurvey && surveys.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Hapus data survei kuesioner "${village}"?`)) {
                                onDeleteSurvey(survey.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Hapus kuesioner"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: DAFTAR 16 SEKSI INSTRUMEN PEMETAAN BAHASA */}
      {activeTab === 'seksi' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Daftar 16 Seksi Formulir Kuesioner Pemetaan Bahasa
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Klik &quot;Isi Seksi Ini&quot; untuk langsung membuka jendela kuesioner pada layar bagian yang diinginkan.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onOpenQuestionnaire(1)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-sky-300 text-xs font-bold border border-blue-200 dark:border-blue-800 cursor-pointer"
            >
              <span>Buka Seluruh Kuesioner (Layar 1-16)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {SECTIONS_META.map((sec) => {
              const status = sectionStats.checks[sec.number];
              const isFilled = status?.isFilled;

              return (
                <div
                  key={sec.number}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs hover:border-blue-400 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {sec.number}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {sec.category}
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        isFilled 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {isFilled ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span>{isFilled ? 'Terisi' : 'Belum Lengkap'}</span>
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                      {sec.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {status?.summary || 'Data survei lapangan'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Bagian {sec.number} / 16
                    </span>

                    <button
                      type="button"
                      onClick={() => onOpenQuestionnaire(sec.number)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-sky-400 hover:text-blue-700 cursor-pointer"
                    >
                      <span>{canEdit ? 'Isi Seksi Ini' : 'Lihat Seksi Ini'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: SOP & PANDUAN METODOLOGI LAPANGAN */}
      {activeTab === 'panduan' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-blue-600 dark:text-sky-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                SOP & Panduan Pengisian Kuesioner Pemetaan Bahasa (Badan Bahasa)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
              Ikuti tata kelola baku pengumpulan data dialektologi geolinguistik lapangan sesuai standar Pusat Pengembangan dan Pelindungan Bahasa dan Sastra.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-sky-200">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
                  <span className="text-xs sm:text-sm">Validasi Koordinat GPS</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Pastikan lintang & bujur GPS diisi akurat pada Seksi 1 & 3 untuk menempatkan titik desa pada peta spasial dan perhitungan jarak geografis.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-sky-200">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">2</span>
                  <span className="text-xs sm:text-sm">Triangulasi Narasumber</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Seksi 14 mensyaratkan minimal 3 informan asli (usia 20-60 tahun, orang tua penduduk asli, alat ucap sempurna) untuk menjamin keabsahan data.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-sky-200">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">3</span>
                  <span className="text-xs sm:text-sm">Elisitasi Kosakata & Audio</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Isi 200 kosakata Swadesh dan budaya pada Seksi 15 lengkap dengan bentuk lokal, transkripsi IPA fonetis, serta rekaman audio wav/mp3.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-sky-200">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">4</span>
                  <span className="text-xs sm:text-sm">Analisis Dialektometri</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Seksi 16 menghitung otomatis persentase perbedaan leksikal Guiter d = (s / n) x 100% dan memvisualisasikan isoglos serta diagram radar.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
