import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  MapPin, 
  User, 
  Users, 
  BookOpen, 
  Calendar, 
  Download, 
  Plus, 
  ArrowRight, 
  ExternalLink,
  ChevronRight,
  Eye,
  Check,
  X,
  FileSpreadsheet,
  Globe2,
  TableProperties,
  LayoutGrid,
  AlertCircle,
  HelpCircle,
  Award,
  Sparkles,
  FileText
} from 'lucide-react';
import { SurveyRecord } from '../../types/linguistic';
import { AppUser } from '../../types/auth';

interface HasilSurveiViewProps {
  surveys: SurveyRecord[];
  activeSurveyId: string | null;
  onSelectSurvey: (id: string) => void;
  onToggleVerify?: (id: string) => void;
  onNavigateToForm: (id: string) => void;
  onNavigateToMap?: () => void;
  onOpenExport?: () => void;
  onOpenRegionalReport?: () => void;
  onCreateNew?: () => void;
  currentUser: AppUser | null;
}

type ValidationFilter = 'all' | 'verified' | 'unverified';
type DisplayMode = 'cards' | 'table';

export const HasilSurveiView: React.FC<HasilSurveiViewProps> = ({
  surveys,
  activeSurveyId,
  onSelectSurvey,
  onToggleVerify,
  onNavigateToForm,
  onNavigateToMap,
  onOpenExport,
  onOpenRegionalReport,
  onCreateNew,
  currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [validationFilter, setValidationFilter] = useState<ValidationFilter>('all');
  const [selectedSurveyor, setSelectedSurveyor] = useState<string>('all');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('cards');

  // 1. Calculate Validation KPIs
  const stats = useMemo(() => {
    const total = surveys.length;
    const verified = surveys.filter(s => s.isVerified).length;
    const unverified = total - verified;
    const verifiedRate = total > 0 ? Math.round((verified / total) * 100) : 0;

    // Distinct surveyors who entered data
    const surveyorMap = new Map<string, { count: number; email: string }>();
    surveys.forEach(s => {
      const name = s.createdByName?.trim() || 'Surveyor Lapangan';
      const email = s.createdByEmail?.trim() || '';
      if (!surveyorMap.has(name)) {
        surveyorMap.set(name, { count: 0, email });
      }
      surveyorMap.get(name)!.count++;
    });

    // Unique provinces
    const provinces = Array.from(new Set(surveys.map(s => (s.provinsi || s.data?.titikPengamatan?.provinsi || 'Jawa Barat').trim()))).filter(Boolean);

    return {
      total,
      verified,
      unverified,
      verifiedRate,
      surveyorList: Array.from(surveyorMap.entries()).map(([name, val]) => ({ name, count: val.count, email: val.email })),
      provinces
    };
  }, [surveys]);

  // 2. Filter surveys based on user selections
  const filteredSurveys = useMemo(() => {
    return surveys.filter(s => {
      // Validation filter
      if (validationFilter === 'verified' && !s.isVerified) return false;
      if (validationFilter === 'unverified' && s.isVerified) return false;

      // Surveyor filter
      if (selectedSurveyor !== 'all') {
        const creatorName = (s.createdByName || 'Surveyor Lapangan').trim();
        if (creatorName !== selectedSurveyor) return false;
      }

      // Province filter
      if (selectedProvince !== 'all') {
        const provName = (s.provinsi || s.data?.titikPengamatan?.provinsi || 'Jawa Barat').trim();
        if (provName !== selectedProvince) return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const desa = (s.desa || s.data?.titikPengamatan?.namaDesa || '').toLowerCase();
        const bahasa = (s.bahasa || s.data?.titikPengamatan?.bahasaDigunakan || '').toLowerCase();
        const kec = (s.kecamatan || '').toLowerCase();
        const kab = (s.kabupatenKota || '').toLowerCase();
        const surveyor = (s.createdByName || '').toLowerCase();
        const validator = (s.verifiedBy || '').toLowerCase();
        const title = (s.title || '').toLowerCase();

        return (
          desa.includes(q) ||
          bahasa.includes(q) ||
          kec.includes(q) ||
          kab.includes(q) ||
          surveyor.includes(q) ||
          validator.includes(q) ||
          title.includes(q)
        );
      }

      return true;
    });
  }, [surveys, validationFilter, selectedSurveyor, selectedProvince, searchTerm]);

  // Split into Verified and Unverified groups for clear side-by-side categorization
  const verifiedList = useMemo(() => filteredSurveys.filter(s => s.isVerified), [filteredSurveys]);
  const unverifiedList = useMemo(() => filteredSurveys.filter(s => !s.isVerified), [filteredSurveys]);

  const canVerify = currentUser?.role === 'admin' || currentUser?.role === 'verifikator';

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/40 shrink-0 shadow-2xs">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Hasil Survei & Kurasi Validasi Data
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Data Masuk Surveyor
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Menampilkan seluruh data instrumen yang telah dimasukkan oleh para surveyor di lapangan, dikategorikan secara transparan berdasarkan status validasi resmi oleh validator.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
            {onOpenExport && (
              <button
                type="button"
                onClick={onOpenExport}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor Laporan</span>
              </button>
            )}
            {onOpenRegionalReport && (
              <button
                type="button"
                onClick={onOpenRegionalReport}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-sky-300 border border-indigo-200 dark:border-indigo-800 transition-colors shadow-2xs cursor-pointer"
                title="Unduh Laporan Ringkasan Wilayah (PDF)"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-sky-400" />
                <span>Laporan Wilayah (PDF)</span>
              </button>
            )}
            {onCreateNew && (
              <button
                type="button"
                onClick={onCreateNew}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Input Titik Baru</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Bento Menu Kategori Validasi Data Surveyor (Interactive Bento Navigation) */}
        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Pilih Kategori Menu:
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Klik kartu kategori di bawah untuk memfilter data survei berdasarkan status validasi:
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {filteredSurveys.length} Titik Ditampilkan
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Bento Menu 1: Semua Data Masuk */}
            <button
              type="button"
              onClick={() => setValidationFilter('all')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between group relative ${
                validationFilter === 'all'
                  ? 'bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/30 shadow-sm'
                  : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className={`font-semibold flex items-center gap-1.5 ${
                    validationFilter === 'all' ? 'text-indigo-900 dark:text-indigo-200 font-bold' : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Semua Data Surveyor</span>
                  </span>
                  {validationFilter === 'all' ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-600 text-white font-bold shadow-2xs">
                      ● Aktif
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                      Pilih
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{stats.total}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">titik desa terdata</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>{stats.surveyorList.length} surveyor lapangan</span>
                <span className={`text-[10px] font-bold ${validationFilter === 'all' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                  100% Total
                </span>
              </div>
            </button>

            {/* Bento Menu 2: Sudah Divalidasi */}
            <button
              type="button"
              onClick={() => setValidationFilter('verified')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between group relative ${
                validationFilter === 'verified'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/30 shadow-sm'
                  : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 hover:border-emerald-200 dark:hover:border-emerald-800/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className={`font-semibold flex items-center gap-1.5 ${
                    validationFilter === 'verified' ? 'text-emerald-900 dark:text-emerald-200 font-bold' : 'text-emerald-800 dark:text-emerald-400'
                  }`}>
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Sudah Divalidasi</span>
                  </span>
                  {validationFilter === 'verified' ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold shadow-2xs">
                      ● Aktif
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold">
                      ✓ Sah
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">{stats.verified}</span>
                  <span className="text-xs text-emerald-600/90 dark:text-emerald-400 font-semibold">({stats.verifiedRate}%)</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-emerald-700/90 dark:text-emerald-400">
                <span className="truncate">Lulus audit validator</span>
                <span className="text-[10px] font-bold">Resmi</span>
              </div>
            </button>

            {/* Bento Menu 3: Belum Divalidasi */}
            <button
              type="button"
              onClick={() => setValidationFilter('unverified')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between group relative ${
                validationFilter === 'unverified'
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 dark:border-amber-500 ring-2 ring-amber-500/30 shadow-sm'
                  : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 hover:border-amber-200 dark:hover:border-amber-800/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className={`font-semibold flex items-center gap-1.5 ${
                    validationFilter === 'unverified' ? 'text-amber-900 dark:text-amber-200 font-bold' : 'text-amber-800 dark:text-amber-400'
                  }`}>
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Belum Divalidasi</span>
                  </span>
                  {validationFilter === 'unverified' ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-600 text-white font-bold shadow-2xs">
                      ● Aktif
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold">
                      ⏳ Menunggu
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-amber-700 dark:text-amber-400">{stats.unverified}</span>
                  <span className="text-xs text-amber-600/90 dark:text-amber-400 font-semibold">({100 - stats.verifiedRate}%)</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-amber-700/90 dark:text-amber-400">
                <span className="truncate">Menunggu pengesahan</span>
                <span className="text-[10px] font-bold">Draft</span>
              </div>
            </button>

            {/* Bento Menu 4: Sebaran Wilayah */}
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-2 text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <Globe2 className="w-4 h-4 text-blue-500" />
                    <span>Sebaran Wilayah</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-sky-300 font-bold">
                    GIS
                  </span>
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{stats.provinces.length}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">provinsi tercakup</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                {onNavigateToMap ? (
                  <button
                    type="button"
                    onClick={onNavigateToMap}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Buka Peta Spasial</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="text-slate-400">Peta Geolinguistik</span>
                )}
                <span className="text-[10px] text-slate-400">{surveys.length} Titik</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. Filter Bar & Controls (Responsive, No Overflow Clipping) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Active Filter Summary Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Kategori Aktif:</span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${
            validationFilter === 'all'
              ? 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
              : validationFilter === 'verified'
              ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
          }`}>
            {validationFilter === 'all' && <span>Semua Data ({filteredSurveys.length})</span>}
            {validationFilter === 'verified' && (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>✓ Sudah Divalidasi ({stats.verified})</span>
              </>
            )}
            {validationFilter === 'unverified' && (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>⏳ Belum Divalidasi ({stats.unverified})</span>
              </>
            )}
          </span>
          {validationFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setValidationFilter('all')}
              className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white underline cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Filter Dropdowns & Search Box */}
        <div className="flex items-center gap-2 flex-wrap flex-1 justify-end">
          {/* Surveyor Dropdown */}
          <select
            value={selectedSurveyor}
            onChange={(e) => setSelectedSurveyor(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">Semua Surveyor Lapangan</option>
            {stats.surveyorList.map(sv => (
              <option key={sv.name} value={sv.name}>
                {sv.name} ({sv.count} survei)
              </option>
            ))}
          </select>

          {/* Province Dropdown */}
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">Semua Provinsi</option>
            {stats.provinces.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* Search Input */}
          <div className="relative min-w-[180px] sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari desa, surveyor, bahasa..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Display Mode Toggle */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setDisplayMode('cards')}
              className={`p-1.5 rounded-md text-xs cursor-pointer ${
                displayMode === 'cards' 
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Tampilan Kartu Kategori"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('table')}
              className={`p-1.5 rounded-md text-xs cursor-pointer ${
                displayMode === 'table' 
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Tampilan Tabel Audit"
            >
              <TableProperties className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. MAIN CONTENT AREA */}
      {filteredSurveys.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Tidak Ditemukan Data Survei yang Sesuai
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Coba sesuaikan filter status validasi, kata kunci pencarian, atau nama surveyor yang dipilih.
          </p>
          <button
            type="button"
            onClick={() => {
              setValidationFilter('all');
              setSelectedSurveyor('all');
              setSelectedProvince('all');
              setSearchTerm('');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : displayMode === 'cards' && validationFilter === 'all' ? (
        
        /* SIDE-BY-SIDE DUAL CATEGORY PRESENTATION (Kategori Tervalidasi vs Belum Divalidasi) */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* KOLOM 1: DATA SUDAH DIVALIDASI (✓) */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-200">
                    Kategori: Sudah Divalidasi Validator
                  </h3>
                  <span className="text-[11px] text-emerald-700/90 dark:text-emerald-400">
                    Data resmi lulus kurasi ilmiah ({verifiedList.length} titik)
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-600 text-white shadow-2xs">
                {verifiedList.length}
              </span>
            </div>

            {verifiedList.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                Belum ada data survei yang divalidasi pada filter ini.
              </div>
            ) : (
              <div className="space-y-3">
                {verifiedList.map(survey => (
                  <SurveyItemCard
                    key={survey.id}
                    survey={survey}
                    isActive={survey.id === activeSurveyId}
                    canVerify={canVerify}
                    onSelect={() => onSelectSurvey(survey.id)}
                    onNavigateToForm={() => onNavigateToForm(survey.id)}
                    onToggleVerify={onToggleVerify ? () => onToggleVerify(survey.id) : undefined}
                  />
                ))}
              </div>
            )}
          </div>

          {/* KOLOM 2: DATA BELUM DIVALIDASI (⏳) */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200">
                    Kategori: Belum Divalidasi (Menunggu)
                  </h3>
                  <span className="text-[11px] text-amber-700/90 dark:text-amber-400">
                    Data baru surveyor menunggu audit validator ({unverifiedList.length} titik)
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-600 text-white shadow-2xs">
                {unverifiedList.length}
              </span>
            </div>

            {unverifiedList.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                Seluruh data survei pada filter ini telah tervalidasi.
              </div>
            ) : (
              <div className="space-y-3">
                {unverifiedList.map(survey => (
                  <SurveyItemCard
                    key={survey.id}
                    survey={survey}
                    isActive={survey.id === activeSurveyId}
                    canVerify={canVerify}
                    onSelect={() => onSelectSurvey(survey.id)}
                    onNavigateToForm={() => onNavigateToForm(survey.id)}
                    onToggleVerify={onToggleVerify ? () => onToggleVerify(survey.id) : undefined}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      ) : displayMode === 'cards' ? (
        
        /* SINGLE FILTER CARD GRID (When user specifically chose Verified or Unverified tab) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredSurveys.map(survey => (
            <SurveyItemCard
              key={survey.id}
              survey={survey}
              isActive={survey.id === activeSurveyId}
              canVerify={canVerify}
              onSelect={() => onSelectSurvey(survey.id)}
              onNavigateToForm={() => onNavigateToForm(survey.id)}
              onToggleVerify={onToggleVerify ? () => onToggleVerify(survey.id) : undefined}
            />
          ))}
        </div>

      ) : (

        /* TABLE VIEW (TABEL AUDIT KOMPARATIF LENGKAP) */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="py-3 px-3.5">No</th>
                  <th className="py-3 px-3.5">Titik Survei & Wilayah</th>
                  <th className="py-3 px-3.5">Bahasa Daerah</th>
                  <th className="py-3 px-3.5">Surveyor Penginput</th>
                  <th className="py-3 px-3.5 text-center">Kelengkapan 16 Seksi</th>
                  <th className="py-3 px-3.5">Status Kategori Validasi</th>
                  <th className="py-3 px-3.5">Validator Pengesah</th>
                  <th className="py-3 px-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredSurveys.map((s, idx) => {
                  const isVerified = Boolean(s.isVerified);
                  const surveyorName = s.createdByName || 'Surveyor Lapangan';
                  const desaName = s.desa || s.data?.titikPengamatan?.namaDesa || 'Desa Tanpa Nama';
                  const bahasaName = s.bahasa || s.data?.titikPengamatan?.bahasaDigunakan || '-';

                  return (
                    <tr 
                      key={s.id} 
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        s.id === activeSurveyId ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-3.5 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{desaName}</div>
                        <div className="text-[11px] text-slate-400">
                          {s.kecamatan ? `Kec. ${s.kecamatan}, ` : ''}{s.kabupatenKota || s.provinsi || 'Jawa Barat'}
                        </div>
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="font-medium text-slate-900 dark:text-slate-100">{bahasaName}</span>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{surveyorName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {s.createdAt ? new Date(s.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                        </div>
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <div className="inline-flex flex-col items-center">
                          <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-1">
                            <div 
                              className={`h-full rounded-full ${s.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                              style={{ width: `${s.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
                            {s.completedSectionsCount || 0}/16 Seksi ({s.progress}%)
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Sudah Divalidasi</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Belum Divalidasi</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-[11px]">
                        {isVerified ? (
                          <div>
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400 block">
                              {s.verifiedBy || 'Validator Resmi'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {s.verifiedAt ? new Date(s.verifiedAt).toLocaleDateString('id-ID') : 'Telah Disahkan'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Menunggu Validator</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canVerify && onToggleVerify && (
                            <button
                              type="button"
                              onClick={() => onToggleVerify(s.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                                isVerified
                                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
                                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
                              }`}
                              title={isVerified ? 'Batalkan status verifikasi' : 'Sahkan survei ini'}
                            >
                              {isVerified ? 'Batal Sah' : 'Sahkan ✓'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              onSelectSurvey(s.id);
                              onNavigateToForm(s.id);
                            }}
                            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors cursor-pointer"
                            title="Buka form kuesioner"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

/**
 * Subcomponent: Detailed Survey Item Card
 */
interface SurveyItemCardProps {
  survey: SurveyRecord;
  isActive: boolean;
  canVerify: boolean;
  onSelect: () => void;
  onNavigateToForm: () => void;
  onToggleVerify?: () => void;
}

const SurveyItemCard: React.FC<SurveyItemCardProps> = ({
  survey,
  isActive,
  canVerify,
  onSelect,
  onNavigateToForm,
  onToggleVerify
}) => {
  const isVerified = Boolean(survey.isVerified);
  const surveyorName = survey.createdByName || 'Surveyor Lapangan';
  const surveyorEmail = survey.createdByEmail || '';
  const desaName = survey.desa || survey.data?.titikPengamatan?.namaDesa || 'Desa Tanpa Nama';
  const bahasaName = survey.bahasa || survey.data?.titikPengamatan?.bahasaDigunakan || 'Bahasa Belum Diisi';
  const narasumberCount = survey.data?.narasumberList?.filter(n => n.nama && n.nama.trim()).length || 0;
  const swadeshCount = survey.data?.kosakataLengkap?.swadeshList?.filter(w => w.bentukLokal && w.bentukLokal.trim()).length || 0;

  return (
    <div 
      className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3.5 bg-white dark:bg-slate-900 shadow-2xs ${
        isVerified 
          ? 'border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-400' 
          : 'border-amber-200 dark:border-amber-800/80 hover:border-amber-400'
      } ${isActive ? 'ring-2 ring-indigo-500' : ''}`}
    >
      <div>
        {/* Header: Badge & Status */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              {survey.provinsi || survey.data?.titikPengamatan?.provinsi || 'Jawa Barat'} · {survey.kabupatenKota || 'Kabupaten'}
            </span>
            <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
              Desa {desaName}
            </h4>
          </div>

          {/* Validation Status Pill */}
          {isVerified ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Sudah Divalidasi</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Belum Divalidasi</span>
            </span>
          )}
        </div>

        {/* Linguistic Info */}
        <div className="mt-2 text-xs flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>Bahasa Daerah: <strong className="text-slate-900 dark:text-white">{bahasaName}</strong></span>
          {survey.kecamatan && (
            <>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span>Kec. {survey.kecamatan}</span>
            </>
          )}
        </div>

        {/* Surveyor Input Info */}
        <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" />
              <span>Surveyor Penginput:</span>
            </span>
            <strong className="text-slate-800 dark:text-slate-200">{surveyorName}</strong>
          </div>
          {surveyorEmail && (
            <div className="text-[10px] text-slate-400 truncate">
              {surveyorEmail}
            </div>
          )}
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
            <span>Diinput pada:</span>
            <span>{survey.createdAt ? new Date(survey.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Tidak tercatat'}</span>
          </div>
        </div>

        {/* Validation Details (If already verified) */}
        {isVerified && (
          <div className="mt-2 p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Disahkan oleh: <strong>{survey.verifiedBy || 'Validator Resmi'}</strong></span>
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
              {survey.verifiedAt ? new Date(survey.verifiedAt).toLocaleDateString('id-ID') : 'Terverifikasi'}
            </span>
          </div>
        )}

        {/* Key Metrics Chips */}
        <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
          <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block">Kelengkapan</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
              {survey.completedSectionsCount || 0}/16
            </span>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block">Narasumber</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
              {narasumberCount} orang
            </span>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block">Glos Swadesh</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
              {swadeshCount}/200
            </span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            onSelect();
            onNavigateToForm();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span>Lihat & Audit</span>
        </button>

        {canVerify && onToggleVerify && (
          <button
            type="button"
            onClick={onToggleVerify}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
              isVerified
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/60'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isVerified ? (
              <>
                <X className="w-3.5 h-3.5" />
                <span>Batalkan Sah</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Sahkan / Validasi</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
