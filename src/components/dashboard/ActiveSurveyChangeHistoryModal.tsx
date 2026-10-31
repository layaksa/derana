import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  History, 
  User, 
  Calendar, 
  Clock, 
  Layers, 
  FileText, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  ShieldAlert, 
  PlusCircle, 
  Edit3, 
  WifiOff, 
  Wifi, 
  Sparkles, 
  Tag, 
  ArrowUpDown,
  BookOpen,
  MapPin,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { SurveyRecord } from '../../types/linguistic';
import { AppUser } from '../../types/auth';
import { SurveyActivityLog, ActivityActionType } from '../../types/activityLog';
import { 
  loadActivityLogs, 
  getAuditTrailForSurvey, 
  exportActivityLogsJSON, 
  exportActivityLogsCSV 
} from '../../utils/activityLogStorage';

interface ActiveSurveyChangeHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  survey: SurveyRecord | null | undefined;
  currentUser?: AppUser | null;
}

/**
 * Format relative Indonesian timestamp
 */
function formatRelativeTime(isoString: string): string {
  try {
    const timestamp = new Date(isoString).getTime();
    if (isNaN(timestamp)) return 'Beberapa saat lalu';
    
    const diffMs = Date.now() - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 45) return 'Baru saja';
    if (diffMin < 60) return `${diffMin} menit yang lalu`;
    if (diffHour < 24) return `${diffHour} jam yang lalu`;
    if (diffDay === 1) {
      const time = new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      return `Kemarin, ${time}`;
    }
    if (diffDay < 7) return `${diffDay} hari yang lalu`;

    return new Date(isoString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return 'Waktu tidak valid';
  }
}

/**
 * Format absolute Indonesian timestamp with WIB
 */
function formatAbsoluteTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';
  } catch {
    return '-';
  }
}

/**
 * Map action type to visual indicators
 */
function getActionBadge(action: ActivityActionType) {
  switch (action) {
    case 'verify_survey':
      return {
        icon: ShieldCheck,
        badgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        dotClass: 'bg-emerald-500 ring-emerald-200 dark:ring-emerald-900',
        label: 'Verifikasi Disahkan'
      };
    case 'unverify_survey':
      return {
        icon: ShieldAlert,
        badgeClass: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        dotClass: 'bg-rose-500 ring-rose-200 dark:ring-rose-900',
        label: 'Verifikasi Dibatalkan'
      };
    case 'create_survey':
      return {
        icon: PlusCircle,
        badgeClass: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        dotClass: 'bg-indigo-500 ring-indigo-200 dark:ring-indigo-900',
        label: 'Inisiasi Berkas Survei'
      };
    case 'update_metadata':
      return {
        icon: Layers,
        badgeClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        dotClass: 'bg-amber-500 ring-amber-200 dark:ring-amber-900',
        label: 'Metadata & Informan'
      };
    case 'duplicate_survey':
      return {
        icon: Sparkles,
        badgeClass: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        dotClass: 'bg-purple-500 ring-purple-200 dark:ring-purple-900',
        label: 'Duplikasi Berkas'
      };
    case 'delete_survey':
      return {
        icon: X,
        badgeClass: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        dotClass: 'bg-rose-500 ring-rose-200 dark:ring-rose-900',
        label: 'Penghapusan Berkas'
      };
    case 'update_section':
    default:
      return {
        icon: Edit3,
        badgeClass: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        dotClass: 'bg-blue-500 ring-blue-200 dark:ring-blue-900',
        label: 'Penyuntingan Seksi'
      };
  }
}

/**
 * Role badge helper
 */
function getRoleBadge(role: string) {
  switch (role) {
    case 'admin':
      return {
        label: 'Admin Sistem',
        badgeClass: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900'
      };
    case 'verifikator':
      return {
        label: 'Verifikator Linguistik',
        badgeClass: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900'
      };
    case 'surveyor':
      return {
        label: 'Surveyor Lapangan',
        badgeClass: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900'
      };
    default:
      return {
        label: 'Akademisi / Tamu',
        badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
      };
  }
}

export const ActiveSurveyChangeHistoryModal: React.FC<ActiveSurveyChangeHistoryModalProps> = ({
  isOpen,
  onClose,
  survey,
  currentUser
}) => {
  const [logs, setLogs] = useState<SurveyActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [surveyorFilter, setSurveyorFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Load logs for this specific survey
  const refreshLogs = () => {
    if (!survey?.id) return;
    const allLogs = loadActivityLogs();
    const surveyLogs = allLogs.filter(log => log.surveyId === survey.id);
    setLogs(surveyLogs);
  };

  useEffect(() => {
    if (isOpen) {
      refreshLogs();
    }

    const handleActivityLogged = (e: Event) => {
      const customEvent = e as CustomEvent<SurveyActivityLog>;
      if (customEvent.detail && survey && customEvent.detail.surveyId === survey.id) {
        refreshLogs();
      }
    };

    window.addEventListener('derana_activity_logged', handleActivityLogged);
    return () => {
      window.removeEventListener('derana_activity_logged', handleActivityLogged);
    };
  }, [isOpen, survey?.id]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Distinct surveyors who edited this survey
  const distinctSurveyors = useMemo(() => {
    const set = new Set<string>();
    logs.forEach(l => {
      if (l.userName) set.add(l.userName);
    });
    return Array.from(set).sort();
  }, [logs]);

  // Filtered and sorted logs
  const filteredLogs = useMemo(() => {
    return logs
      .filter(log => {
        // Search query filter
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery = !q || 
          (log.userName && log.userName.toLowerCase().includes(q)) ||
          (log.details && log.details.toLowerCase().includes(q)) ||
          (log.actionLabel && log.actionLabel.toLowerCase().includes(q)) ||
          (log.sectionName && log.sectionName.toLowerCase().includes(q)) ||
          (log.sectionId && log.sectionId.toLowerCase().includes(q)) ||
          (log.diffSummary?.field && log.diffSummary.field.toLowerCase().includes(q)) ||
          (log.diffSummary?.notes && log.diffSummary.notes.toLowerCase().includes(q));

        if (!matchesQuery) return false;

        // Action filter
        if (actionFilter !== 'all' && log.action !== actionFilter) {
          return false;
        }

        // Surveyor filter
        if (surveyorFilter !== 'all' && log.userName !== surveyorFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [logs, searchQuery, actionFilter, surveyorFilter, sortOrder]);

  if (!isOpen || !survey) return null;

  const desaName = survey.desa || survey.data?.titikPengamatan?.namaDesa || 'Desa Belum Dinamai';
  const bahasaName = survey.bahasa || survey.data?.titikPengamatan?.bahasaDigunakan || 'Bahasa Belum Diisi';
  const lastLog = logs.length > 0 ? logs[0] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================================= */}
        {/* 1. TOP HEADER & ACTIVE SURVEY CONTEXT BANNER */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-indigo-50/90 via-slate-50 to-white dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
                <History className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    Riwayat Perubahan Data Survei Aktif
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    Audit Trail • {logs.length} Log Tercatat
                  </span>
                </div>
                
                {/* Active Survey Geo Details */}
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 mt-1 flex-wrap">
                  <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Desa {desaName}</span>
                  </span>
                  <span>•</span>
                  <span className="font-medium flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-teal-500" />
                    <span>{bahasaName}</span>
                  </span>
                  {survey.kecamatan && (
                    <>
                      <span>•</span>
                      <span>Kec. {survey.kecamatan}</span>
                    </>
                  )}
                  {survey.kabupatenKota && (
                    <>
                      <span>•</span>
                      <span>{survey.kabupatenKota}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-start">
              {logs.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => exportActivityLogsCSV(filteredLogs)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
                    title="Unduh log perubahan survei ini sebagai file CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => exportActivityLogsJSON(filteredLogs)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
                    title="Unduh log perubahan survei ini sebagai file JSON"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>JSON</span>
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Tutup jendela riwayat (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Stats Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 text-xs">
            <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-medium">Status Kelengkapan</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {survey.progress}% ({survey.completedSectionsCount || 0}/16 Seksi)
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-medium">Status Verifikasi</span>
              <span className={`font-bold ${survey.isVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {survey.isVerified ? '✓ Tervalidasi' : '⏳ Belum Divalidasi'}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-medium">Penyunting Terlibat</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {distinctSurveyors.length || 1} orang
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-medium">Terakhir Diubah</span>
              <span className="font-bold text-slate-900 dark:text-white truncate block">
                {lastLog ? formatRelativeTime(lastLog.timestamp) : 'Baru diinisiasi'}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. FILTER & SEARCH CONTROLS */}
        {/* ========================================================================= */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari field, seksi, nama surveyor, atau catatan..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Action Type */}
            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Semua Jenis Aksi</option>
              <option value="update_section">Penyuntingan Seksi</option>
              <option value="update_metadata">Metadata / Informan</option>
              <option value="verify_survey">Verifikasi Kurator</option>
              <option value="create_survey">Inisiasi Berkas</option>
              <option value="duplicate_survey">Duplikasi Berkas</option>
            </select>

            {/* Filter by Surveyor */}
            {distinctSurveyors.length > 1 && (
              <select
                value={surveyorFilter}
                onChange={e => setSurveyorFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
              >
                <option value="all">Semua Pengubah</option>
                {distinctSurveyors.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            )}

            {/* Sort Order Toggle */}
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
              title={sortOrder === 'desc' ? 'Urutan: Terbaru ke Terlama' : 'Urutan: Terlama ke Terbaru'}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>{sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}</span>
            </button>

            {(searchQuery || actionFilter !== 'all' || surveyorFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActionFilter('all');
                  setSurveyorFilter('all');
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline px-1 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. LOG LIST / TIMELINE (WHO, WHEN, WHAT FIELDS) */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredLogs.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 max-w-md mx-auto">
              <History className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Tidak ada catatan riwayat perubahan yang sesuai
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {logs.length === 0 
                  ? 'Survei ini belum memiliki riwayat perubahan tersimpan. Riwayat akan dicatat secara otomatis setiap kali Anda melakukan penyimpanan atau penyuntingan.'
                  : 'Coba ubah kata kunci pencarian atau reset filter untuk menampilkan catatan log lainnya.'}
              </p>
            </div>
          ) : (
            <div className="relative pl-5 sm:pl-6 space-y-5 before:absolute before:left-2 sm:before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {filteredLogs.map((log, idx) => {
                const actionBadge = getActionBadge(log.action);
                const Icon = actionBadge.icon;
                const roleBadge = getRoleBadge(log.userRole);
                const isLatest = idx === 0 && sortOrder === 'desc';

                return (
                  <div key={log.id} className="relative group">
                    {/* Timeline Node Point */}
                    <span 
                      className={`absolute -left-5 sm:-left-6 top-2 w-4 h-4 rounded-full ring-4 ${actionBadge.dotClass} transition-transform group-hover:scale-110`}
                      aria-hidden="true"
                    />

                    {/* Timeline Card Container */}
                    <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      isLatest
                        ? 'bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60 shadow-xs ring-1 ring-indigo-500/10'
                        : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                    }`}>
                      
                      {/* 1. HEADER ROW: ACTION PILL, SECTION BADGE, RELATIVE TIME */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${actionBadge.badgeClass}`}>
                            <Icon className="w-3.5 h-3.5" />
                            <span>{log.actionLabel || actionBadge.label}</span>
                          </span>

                          {log.sectionName && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                              <Tag className="w-3 h-3 text-slate-400" />
                              <span>{log.sectionName}</span>
                            </span>
                          )}

                          {log.source === 'pwa_offline' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" title="Disimpan secara offline melalui IndexedDB PWA">
                              <WifiOff className="w-3 h-3" />
                              <span>PWA Offline</span>
                            </span>
                          )}
                        </div>

                        {/* WHEN: Relative & Absolute Time */}
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-900 dark:text-white block font-mono">
                            {formatRelativeTime(log.timestamp)}
                          </span>
                          <span className="text-[10px] text-slate-600 dark:text-slate-300 block">
                            {formatAbsoluteTime(log.timestamp)}
                          </span>
                        </div>
                      </div>

                      {/* 2. DESCRIPTION NARRATIVE */}
                      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-relaxed font-normal">
                        {log.details}
                      </p>

                      {/* 3. WHAT FIELDS WERE UPDATED (FIELD DETAIL CHIPS & DIFF METRICS) */}
                      {(log.diffSummary || log.sectionId) && (
                        <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 space-y-1.5">
                          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1">
                            <Layers className="w-3 h-3 text-indigo-500" />
                            <span>Rincian Field & Parameter yang Diupdate:</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            {log.diffSummary?.field && (
                              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 text-xs font-mono font-bold border border-indigo-200 dark:border-indigo-800">
                                <span className="text-indigo-400 font-normal">field:</span>
                                <span>{log.diffSummary.field}</span>
                              </div>
                            )}

                            {log.sectionId && (
                              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-medium border border-slate-200 dark:border-slate-700">
                                <span className="text-slate-400">seksi:</span>
                                <span>{log.sectionId}</span>
                              </div>
                            )}

                            {log.diffSummary?.itemsChanged !== undefined && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-800">
                                <span>+{log.diffSummary.itemsChanged} butir diperbarui</span>
                              </span>
                            )}

                            {log.diffSummary?.completionDelta !== undefined && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                                <span>+{log.diffSummary.completionDelta}% kenaikan kelengkapan</span>
                              </span>
                            )}
                          </div>

                          {log.diffSummary?.notes && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 italic pt-1 border-t border-slate-200/50 dark:border-slate-800">
                              Catatan sistem: {log.diffSummary.notes}
                            </p>
                          )}
                        </div>
                      )}

                      {/* 4. WHO CHANGED IT (ACTOR FOOTER) */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {log.userName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 dark:text-white block truncate">
                              {log.userName}
                            </span>
                            {log.userEmail && (
                              <span className="text-[10px] text-slate-600 dark:text-slate-400 block truncate">
                                {log.userEmail}
                              </span>
                            )}
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border shrink-0 ${roleBadge.badgeClass}`}>
                          {roleBadge.label}
                        </span>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4. MODAL FOOTER */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span>Menampilkan <strong>{filteredLogs.length}</strong> dari <strong>{logs.length}</strong> riwayat perubahan data survei ini.</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={refreshLogs}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Segarkan</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs transition-colors cursor-pointer"
            >
              Tutup Riwayat
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
