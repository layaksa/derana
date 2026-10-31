import React from 'react';
import { 
  X, 
  MapPin, 
  BookOpen, 
  User, 
  Calendar, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Users, 
  Award,
  Globe2,
  Compass,
  FileText,
  Activity,
  History,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { SurveyRecord } from '../../types/linguistic';
import { AuditTrailTimeline } from './AuditTrailTimeline';
import { SECTIONS_META } from '../NavigationStepper';

interface SurveyDetailAuditModalProps {
  survey: SurveyRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToForm: () => void;
  canVerify?: boolean;
  onToggleVerify?: () => void;
}

export const SurveyDetailAuditModal: React.FC<SurveyDetailAuditModalProps> = ({
  survey,
  isOpen,
  onClose,
  onNavigateToForm,
  canVerify = false,
  onToggleVerify
}) => {
  if (!isOpen || !survey) return null;

  const isVerified = Boolean(survey.isVerified);
  const desaName = survey.desa || survey.data?.titikPengamatan?.namaDesa || 'Desa Tanpa Nama';
  const bahasaName = survey.bahasa || survey.data?.titikPengamatan?.bahasaDigunakan || 'Bahasa Belum Ditentukan';
  const kecamatan = survey.kecamatan || survey.data?.titikPengamatan?.kecamatan || '-';
  const kabupaten = survey.kabupatenKota || survey.data?.titikPengamatan?.kabupatenKota || '-';
  const provinsi = survey.provinsi || survey.data?.titikPengamatan?.provinsi || 'Jawa Barat';
  const surveyorName = survey.createdByName || 'Surveyor Lapangan';
  const surveyorEmail = survey.createdByEmail || '';
  const narasumberCount = survey.data?.narasumberList?.filter(n => n.nama && n.nama.trim()).length || 0;
  const swadeshCount = survey.data?.kosakataLengkap?.swadeshList?.filter(w => w.bentukLokal && w.bentukLokal.trim()).length || 0;
  const lintang = survey.data?.situasiGeografis?.koordinatLintang;
  const bujur = survey.data?.situasiGeografis?.koordinatBujur;
  const gpsCoords = (lintang && bujur) ? `${lintang}, ${bujur}` : '-';
  const morfologi = survey.data?.situasiGeografis?.morfologi || 'Dataran / Wilayah Survei';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-detail-survei-title"
    >
      <div 
        className="w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================================= */}
        {/* 1. MODAL TOP HEADER */}
        {/* ========================================================================= */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-linear-to-r from-slate-50 via-indigo-50/30 to-white dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    Detail Survei Empiris
                  </span>
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>Sudah Divalidasi</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>Belum Divalidasi</span>
                    </span>
                  )}
                </div>

                <h2 
                  id="modal-detail-survei-title"
                  className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1 leading-snug"
                >
                  Detail Survei: Desa {desaName}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Bahasa {bahasaName}</span>
                  <span>•</span>
                  <span>Kec. {kecamatan}, {kabupaten}</span>
                  <span>•</span>
                  <span className="text-indigo-600 dark:text-sky-400 font-medium">{provinsi}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              aria-label="Tutup Detail Survei"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. MODAL BODY: SCROLLABLE AUDIT & DETAIL CONTENT */}
        {/* ========================================================================= */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* Verification Status Banner */}
          {isVerified ? (
            <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-200">
                    Data Lolos Kurasi Ilmiah & Sah
                  </h4>
                  <p className="text-xs text-emerald-800/90 dark:text-emerald-300">
                    Disahkan oleh <strong>{survey.verifiedBy || 'Validator Resmi'}</strong> pada{' '}
                    {survey.verifiedAt ? new Date(survey.verifiedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Tanggal tercatat'}.
                  </p>
                </div>
              </div>
              <span className="self-start sm:self-auto px-3 py-1 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-2xs">
                Lulus Verifikasi ✓
              </span>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200">
                    Menunggu Verifikasi Kurator / Validator
                  </h4>
                  <p className="text-xs text-amber-800/90 dark:text-amber-300">
                    Data empiris telah diinput oleh surveyor dan siap diperiksa kesesuaian transkripsi fonetis serta glos.
                  </p>
                </div>
              </div>
              <span className="self-start sm:self-auto px-3 py-1 rounded-xl text-xs font-bold bg-amber-600 text-white shadow-2xs">
                Status: Menunggu Audit
              </span>
            </div>
          )}

          {/* 4-Column Bento Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Kelengkapan */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Kelengkapan</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl font-black text-slate-900 dark:text-white font-mono">{survey.progress}%</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">({survey.completedSectionsCount || 0}/16 Seksi)</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${survey.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                  style={{ width: `${survey.progress}%` }}
                />
              </div>
            </div>

            {/* 2. Surveyor */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Surveyor Lapangan</span>
              <div className="font-bold text-sm text-slate-900 dark:text-white mt-1 truncate">
                {surveyorName}
              </div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">
                {surveyorEmail || 'Pencatat Lapangan'}
              </div>
            </div>

            {/* 3. Narasumber */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Narasumber</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl font-black text-indigo-600 dark:text-sky-400 font-mono">{narasumberCount}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Penutur Terdata</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Kriteria Informan N1-N5</span>
            </div>

            {/* 4. Swadesh 200 */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Glos Swadesh</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{swadeshCount}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">/ 200 Kosakata</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Transkripsi IPA/Lokal</span>
            </div>
          </div>

          {/* Location & Metadata Coordinates */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              <span>Titik Geografis & Perekaman Data</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Koordinat GPS:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{gpsCoords}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Elevasi / Ketinggian:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{ketinggian} mdpl</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Waktu Penginputan:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {survey.createdAt ? new Date(survey.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Pembaruan Terakhir:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {survey.updatedAt ? new Date(survey.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Hari ini'}
                </span>
              </div>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* 3. AUDIT TRAIL TIMELINE: 5 RIWAYAT AKSI PERUBAHAN DATA TERBARU */}
          {/* ======================================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/80 dark:border-indigo-900/60 shadow-2xs">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Audit Trail Timeline (5 Riwayat Aksi Terakhir)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Menampilkan 5 aktivitas modifikasi data terbaru pada survei ini langsung dari log aktivitas.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Log Real-Time
              </span>
            </div>

            {/* Embedded Audit Trail Timeline Component */}
            <AuditTrailTimeline
              surveyId={survey.id}
              maxItems={5}
              showHeader={false}
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>

          {/* 16 Sections Checklist Matrix */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Pemeriksaan 16 Seksi Kuesioner</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SECTIONS_META.map(sec => {
                // Determine whether filled from survey data
                const isFilled = (survey.completedSectionsCount || 0) >= sec.number;

                return (
                  <div
                    key={sec.id}
                    className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                      isFilled
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                        : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <div className="shrink-0">
                      {isFilled ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600" />
                      )}
                    </div>
                    <span className="truncate font-medium text-[11px]">
                      {sec.number}. {sec.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 4. MODAL FOOTER ACTIONS */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2">
            {canVerify && onToggleVerify && (
              <button
                type="button"
                onClick={onToggleVerify}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                  isVerified
                    ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/60'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isVerified ? (
                  <>
                    <X className="w-3.5 h-3.5" />
                    <span>Batalkan Pengesahan</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sahkan / Validasi Survei</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onNavigateToForm}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              <span>Buka Formulir Kuesioner (Edit Data)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
