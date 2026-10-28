import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Plus, 
  Search, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Download, 
  Upload, 
  Trash2, 
  Copy, 
  ExternalLink,
  ShieldCheck,
  Filter,
  FileSpreadsheet,
  Globe2,
  Layers,
  ArrowRight,
  BookOpen,
  Sparkles,
  Award,
  ChevronDown,
  ChevronUp,
  Compass,
  FileText
} from 'lucide-react';
import { SurveyRecord } from '../../types/linguistic';
import { SurveysLeafletMap } from '../dashboard/SurveysLeafletMap';
import { generateRegionalSummaryPdf } from '../../utils/generateRegionalSummaryPdf';

interface DatasetsViewProps {
  surveys: SurveyRecord[];
  activeSurveyId: string | null;
  onSelectSurvey: (id: string) => void;
  onCreateNew: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleVerify: (id: string) => void;
  onOpenExport: () => void;
  onOpenRegionalReport?: () => void;
  onImportJSON?: (file: File) => void;
  onNavigateToForm?: (id: string) => void;
}

export const DatasetsView: React.FC<DatasetsViewProps> = ({
  surveys,
  activeSurveyId,
  onSelectSurvey,
  onCreateNew,
  onDuplicate,
  onDelete,
  onToggleVerify,
  onOpenExport,
  onOpenRegionalReport,
  onImportJSON,
  onNavigateToForm
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'unverified'>('all');
  const [layoutMode, setLayoutMode] = useState<'grouped_province' | 'table' | 'map'>('grouped_province');

  // List of unique provinces with their survey counts
  const provinceSummary = useMemo(() => {
    const map = new Map<string, { count: number; verified: number; languages: Set<string> }>();
    
    surveys.forEach(s => {
      const prov = (s.provinsi || s.data?.titikPengamatan?.provinsi || 'Jawa Barat').trim() || 'Provinsi Lainnya';
      const lang = (s.bahasa || s.data?.titikPengamatan?.bahasaDigunakan || '').trim();
      
      if (!map.has(prov)) {
        map.set(prov, { count: 0, verified: 0, languages: new Set() });
      }
      const item = map.get(prov)!;
      item.count++;
      if (s.isVerified) item.verified++;
      if (lang) item.languages.add(lang);
    });

    return Array.from(map.entries()).map(([provName, info]) => ({
      name: provName,
      count: info.count,
      verified: info.verified,
      languageCount: info.languages.size
    }));
  }, [surveys]);

  // Filtered surveys
  const filteredSurveys = useMemo(() => {
    return surveys.filter(s => {
      const desaName = s.desa || s.data?.titikPengamatan?.namaDesa || '';
      const bahasaName = s.bahasa || s.data?.titikPengamatan?.bahasaDigunakan || '';
      const provName = s.provinsi || s.data?.titikPengamatan?.provinsi || 'Jawa Barat';

      // Province filter
      if (selectedProvince !== 'all' && provName !== selectedProvince) {
        return false;
      }

      // Verification status filter
      if (filterStatus === 'verified' && !s.isVerified) return false;
      if (filterStatus === 'unverified' && s.isVerified) return false;

      // Text search
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        desaName.toLowerCase().includes(term) ||
        (s.kecamatan || '').toLowerCase().includes(term) ||
        (s.kabupatenKota || '').toLowerCase().includes(term) ||
        provName.toLowerCase().includes(term) ||
        bahasaName.toLowerCase().includes(term) ||
        (s.title || '').toLowerCase().includes(term) ||
        (s.createdByName || '').toLowerCase().includes(term)
      );
    });
  }, [surveys, selectedProvince, filterStatus, searchTerm]);

  // Group filtered surveys by Province for the Grouped Bento view
  const groupedByProvince = useMemo(() => {
    const map = new Map<string, SurveyRecord[]>();
    
    filteredSurveys.forEach(s => {
      const prov = (s.provinsi || s.data?.titikPengamatan?.provinsi || 'Jawa Barat').trim() || 'Provinsi Lainnya';
      if (!map.has(prov)) {
        map.set(prov, []);
      }
      map.get(prov)!.push(s);
    });

    return Array.from(map.entries()).map(([provinceName, items]) => ({
      provinceName,
      items
    }));
  }, [filteredSurveys]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#444444] rounded-2xl p-5 sm:p-6 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-[#1E1E1E] text-indigo-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-[#444444] shadow-xs">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-[#E0E0E0]">
                  Datasets & Hasil Survei Kebahasaan
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-[#1E1E1E] text-indigo-700 dark:text-sky-300 border border-indigo-200/80 dark:border-[#444444]">
                  Per Provinsi
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#B0B0B0] mt-1">
                Kelola korpus dan pangkalan data instrumen dialektologi yang dikelompokkan berdasarkan wilayah provinsi dan titik desa.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={onCreateNew}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Titik Desa Baru</span>
            </button>
            <button
              type="button"
              onClick={onOpenExport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 dark:bg-[#1E1E1E] hover:bg-slate-100 dark:hover:bg-[#444444] text-slate-700 dark:text-[#B0B0B0] border border-slate-200 dark:border-[#444444] rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ekspor Data</span>
            </button>
            {onOpenRegionalReport && (
              <button
                type="button"
                onClick={onOpenRegionalReport}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-sky-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                title="Laporan Ringkasan Wilayah (Unduh PDF)"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-sky-400" />
                <span>Laporan Wilayah (PDF)</span>
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f && onImportJSON) {
                  onImportJSON(f);
                }
                e.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 dark:bg-[#1E1E1E] hover:bg-slate-100 dark:hover:bg-[#444444] text-slate-700 dark:text-[#B0B0B0] border border-slate-200 dark:border-[#444444] rounded-xl text-xs font-medium transition-colors cursor-pointer"
              title="Unggah berkas survei JSON untuk diimpor ke sistem"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Impor JSON</span>
            </button>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[#444444] flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 dark:text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari provinsi, desa, kecamatan, bahasa..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#1E1E1E] border border-slate-200 dark:border-[#444444] rounded-xl text-xs text-slate-900 dark:text-[#E0E0E0] placeholder-slate-400 dark:placeholder-[#888888] focus:outline-hidden focus:border-indigo-600 dark:focus:border-sky-400 transition-colors"
            />
          </div>

          {/* Status & View Mode */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            
            {/* View Mode Toggle */}
            <div className="inline-flex items-center bg-slate-100 dark:bg-[#1E1E1E] p-1 rounded-xl border border-slate-200 dark:border-[#444444] text-xs">
              <button
                type="button"
                onClick={() => setLayoutMode('grouped_province')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  layoutMode === 'grouped_province'
                    ? 'bg-white dark:bg-[#121212] text-indigo-700 dark:text-sky-300 shadow-2xs'
                    : 'text-slate-600 dark:text-[#B0B0B0] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>Grup Per Provinsi</span>
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('map')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  layoutMode === 'map'
                    ? 'bg-white dark:bg-[#121212] text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-600 dark:text-[#B0B0B0] hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Tampilkan peta sebaran titik survei lapangan Leaflet"
              >
                <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Peta Leaflet</span>
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  layoutMode === 'table'
                    ? 'bg-white dark:bg-[#121212] text-indigo-700 dark:text-sky-300 shadow-2xs'
                    : 'text-slate-600 dark:text-[#B0B0B0] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Tabel Lengkap</span>
              </button>
            </div>

            {/* Status Filter */}
            <div className="inline-flex items-center bg-slate-100 dark:bg-[#1E1E1E] p-1 rounded-xl border border-slate-200 dark:border-[#444444] text-xs">
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filterStatus === 'all' 
                    ? 'bg-white dark:bg-[#121212] text-indigo-700 dark:text-sky-300 shadow-2xs' 
                    : 'text-slate-600 dark:text-[#B0B0B0] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Semua ({surveys.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('verified')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filterStatus === 'verified' 
                    ? 'bg-white dark:bg-[#121212] text-emerald-600 dark:text-emerald-400 shadow-2xs' 
                    : 'text-slate-600 dark:text-[#B0B0B0] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Terverifikasi
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('unverified')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filterStatus === 'unverified' 
                    ? 'bg-white dark:bg-[#121212] text-amber-600 dark:text-amber-400 shadow-2xs' 
                    : 'text-slate-600 dark:text-[#B0B0B0] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Draf
              </button>
            </div>

          </div>
        </div>

        {/* BILAH FILTER PER PROVINSI */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#444444]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#888888] flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-indigo-500 dark:text-sky-400" />
              <span>Filter Berdasarkan Wilayah Provinsi:</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedProvince('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                selectedProvince === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-[#1E1E1E] text-slate-700 dark:text-[#B0B0B0] border-slate-200 dark:border-[#444444] hover:border-indigo-300'
              }`}
            >
              <span>Semua Provinsi</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedProvince === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 dark:bg-[#444444] text-slate-700 dark:text-[#B0B0B0]'
              }`}>
                {surveys.length} Titik
              </span>
            </button>

            {provinceSummary.map(p => {
              const isSelected = selectedProvince === p.name;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setSelectedProvince(p.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-[#1E1E1E] text-slate-700 dark:text-[#B0B0B0] border-slate-200 dark:border-[#444444] hover:border-indigo-300'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  <span>{p.name}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  }`}>
                    {p.count} Titik ({p.verified} Terverifikasi)
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* VIEW MODE 1: GROUPED BY PROVINCE (BENTO & CARDS) */}
      {layoutMode === 'grouped_province' && (
        <div className="space-y-8">
          {groupedByProvince.length === 0 ? (
            <div className="bg-white dark:bg-[#121212] border border-dashed border-slate-300 dark:border-[#444444] rounded-2xl p-10 text-center">
              <Database className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800 dark:text-[#E0E0E0]">Tidak ada dataset survei untuk filter ini.</p>
              <p className="text-xs text-slate-500 dark:text-[#B0B0B0] mt-1">Coba sesuaikan pencarian atau pilih provinsi lain.</p>
            </div>
          ) : (
            groupedByProvince.map(group => {
              const verifiedInGroup = group.items.filter(s => s.isVerified).length;
              const avgProgressInGroup = Math.round(
                group.items.reduce((acc, s) => acc + (s.progress || 0), 0) / group.items.length
              );

              return (
                <div 
                  key={group.provinceName}
                  className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#444444] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5 transition-colors"
                >
                  {/* Province Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-[#444444] gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-[#1E1E1E] text-indigo-600 dark:text-sky-400 flex items-center justify-center font-bold text-sm border border-indigo-100 dark:border-[#444444]">
                        <Globe2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#E0E0E0]">
                            Provinsi {group.provinceName}
                          </h2>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {verifiedInGroup} / {group.items.length} Terverifikasi
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-[#B0B0B0] mt-0.5">
                          Rata-rata kelengkapan instrumen: <strong>{avgProgressInGroup}%</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => generateRegionalSummaryPdf(surveys, { province: group.provinceName })}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold text-indigo-700 dark:text-sky-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                        title={`Unduh Laporan Ringkasan Wilayah PDF untuk Provinsi ${group.provinceName}`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Unduh PDF Wilayah</span>
                      </button>
                      <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-slate-50 dark:bg-[#1E1E1E] border border-slate-200 dark:border-[#444444] text-slate-700 dark:text-[#B0B0B0]">
                        {group.items.length} Titik Pengamatan
                      </span>
                    </div>
                  </div>

                  {/* Survey Cards Grid in this Province */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.items.map(s => {
                      const isCurrent = s.id === activeSurveyId;
                      const swadeshCount = s.data?.kosakataLengkap?.swadeshList?.filter(w => w.bentukLokal)?.length || 0;
                      const narasumberCount = s.data?.narasumberList?.filter(n => n.nama)?.length || 0;

                      return (
                        <div
                          key={s.id}
                          className={`bg-slate-50/70 dark:bg-[#1E1E1E]/60 border rounded-xl p-4 flex flex-col justify-between transition-all hover:shadow-sm ${
                            isCurrent
                              ? 'border-indigo-600 dark:border-sky-400 ring-2 ring-indigo-500/10'
                              : 'border-slate-200 dark:border-[#444444]'
                          }`}
                        >
                          <div>
                            {/* Card Top Strip */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-sky-300 border border-indigo-200/60 dark:border-[#444444] truncate max-w-[170px]">
                                {s.bahasa || s.data?.titikPengamatan?.bahasaDigunakan || 'Bahasa Daerah'}
                              </span>
                              
                              <button
                                type="button"
                                onClick={() => onToggleVerify(s.id)}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                                  s.isVerified
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                }`}
                                title="Klik untuk mengubah verifikasi (Super Admin)"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{s.isVerified ? 'Terverifikasi' : 'Draf'}</span>
                              </button>
                            </div>

                            {/* Survey Title & Location */}
                            <h3 className="text-sm font-bold text-slate-900 dark:text-[#E0E0E0] leading-snug line-clamp-2 mb-1">
                              Desa {s.desa || s.data?.titikPengamatan?.namaDesa || 'Tanpa Nama'}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-[#B0B0B0] flex items-center gap-1 mb-3">
                              <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span className="truncate">Kec. {s.kecamatan || '-'}, Kab. {s.kabupatenKota || '-'}</span>
                            </p>

                            {/* Metrics pill strip */}
                            <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                              <div className="p-2 rounded-lg bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-[#444444]">
                                <span className="text-slate-400 block text-[10px]">Swadesh Terisi</span>
                                <strong className="text-slate-800 dark:text-[#E0E0E0]">{swadeshCount} Kata</strong>
                              </div>
                              <div className="p-2 rounded-lg bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-[#444444]">
                                <span className="text-slate-400 block text-[10px]">Narasumber</span>
                                <strong className="text-slate-800 dark:text-[#E0E0E0]">{narasumberCount} Penutur</strong>
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1 mb-3">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-slate-500 dark:text-[#B0B0B0]">Kelengkapan:</span>
                                <span className="font-bold text-slate-800 dark:text-[#E0E0E0]">{s.progress || 0}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-200 dark:bg-[#444444] rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${(s.progress || 0) >= 80 ? 'bg-emerald-500' : 'bg-indigo-600 dark:bg-sky-400'}`}
                                  style={{ width: `${s.progress || 0}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="pt-3 border-t border-slate-200 dark:border-[#444444] flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => onSelectSurvey(s.id)}
                              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                                isCurrent
                                  ? 'bg-indigo-600 text-white shadow-2xs'
                                  : 'bg-white dark:bg-[#121212] text-indigo-600 dark:text-sky-400 hover:bg-indigo-50 border border-slate-200 dark:border-[#444444]'
                              }`}
                            >
                              <span>{isCurrent ? 'Sedang Aktif' : 'Buka Kuesioner'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>

                            <button
                              type="button"
                              onClick={() => onDuplicate(s.id)}
                              className="p-1.5 rounded-lg text-slate-500 dark:text-[#B0B0B0] hover:bg-white dark:hover:bg-[#121212] border border-slate-200 dark:border-[#444444] transition-colors cursor-pointer"
                              title="Duplikasi Survei"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => onDelete(s.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-[#444444] transition-colors cursor-pointer"
                              title="Hapus Survei"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW MODE: INTERACTIVE LEAFLET SURVEY MAP */}
      {layoutMode === 'map' && (
        <div className="space-y-4">
          <SurveysLeafletMap
            surveys={surveys}
            activeSurveyId={activeSurveyId}
            onSelectSurvey={onSelectSurvey}
            onSwitchToEditor={() => onSelectSurvey(activeSurveyId || surveys[0]?.id)}
            onCreateNew={() => onCreateNew()}
          />
        </div>
      )}

      {/* VIEW MODE 2: TABLE VIEW */}
      {layoutMode === 'table' && (
        <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#444444] rounded-2xl shadow-xs overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-[#1E1E1E] text-slate-500 dark:text-[#B0B0B0] border-b border-slate-200 dark:border-[#444444] font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Provinsi</th>
                  <th className="px-4 py-3">Titik Desa</th>
                  <th className="px-4 py-3">Bahasa Daerah</th>
                  <th className="px-4 py-3">Kelengkapan</th>
                  <th className="px-4 py-3">Peneliti</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#444444]">
                {filteredSurveys.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500 dark:text-[#B0B0B0]">
                      Tidak ada dataset titik pengamatan yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredSurveys.map(s => {
                    const isCurrent = s.id === activeSurveyId;
                    return (
                      <tr 
                        key={s.id}
                        className={`hover:bg-slate-50/80 dark:hover:bg-[#1E1E1E]/80 transition-colors ${
                          isCurrent ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                        }`}
                      >
                        <td className="px-4 py-3.5 font-semibold text-slate-800 dark:text-[#E0E0E0]">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-[#1E1E1E] text-indigo-700 dark:text-sky-300 border border-slate-200 dark:border-[#444444]">
                            {s.provinsi || s.data?.titikPengamatan?.provinsi || 'Jawa Barat'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-[#E0E0E0]">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-indigo-600 dark:text-sky-400 shrink-0" />
                            <div>
                              <p className="font-bold">Desa {s.desa || s.data?.titikPengamatan?.namaDesa || 'Tanpa Nama'}</p>
                              <p className="text-[11px] text-slate-500 dark:text-[#B0B0B0]">
                                Kec. {s.kecamatan || '-'}, Kab. {s.kabupatenKota || '-'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-900 dark:text-[#E0E0E0]">
                          <span className="font-semibold text-indigo-600 dark:text-sky-400">
                            {s.bahasa || s.data?.titikPengamatan?.bahasaDigunakan || 'Belum Diisi'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-200 dark:bg-[#444444] rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${(s.progress ?? 0) >= 80 ? 'bg-emerald-500' : 'bg-indigo-600 dark:bg-sky-400'}`}
                                style={{ width: `${s.progress ?? 0}%` }}
                              />
                            </div>
                            <span className="font-semibold text-slate-800 dark:text-[#E0E0E0]">{s.progress ?? 0}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 dark:text-[#B0B0B0]">
                          <p className="text-slate-900 dark:text-[#E0E0E0] font-medium">{s.createdByName || 'Surveyor'}</p>
                          <p className="text-[10px]">{(s.updatedAt || s.createdAt || '').slice(0, 10)}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() => onToggleVerify(s.id)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                              s.isVerified
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{s.isVerified ? 'Terverifikasi' : 'Draf'}</span>
                          </button>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => onSelectSurvey(s.id)}
                              className="px-2.5 py-1 bg-indigo-50 dark:bg-[#1E1E1E] hover:bg-indigo-100 text-indigo-700 dark:text-sky-300 rounded-md font-semibold text-[11px] transition-colors cursor-pointer"
                            >
                              Buka
                            </button>
                            <button
                              type="button"
                              onClick={() => onDuplicate(s.id)}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-[#E0E0E0] cursor-pointer"
                              title="Duplikasi"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDelete(s.id)}
                              className="p-1 rounded text-slate-400 hover:text-red-600 cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default DatasetsView;
