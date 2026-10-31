import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  History, 
  User, 
  ShieldCheck, 
  Edit3, 
  PlusCircle, 
  FileText, 
  Layers, 
  Wifi, 
  WifiOff, 
  ShieldAlert, 
  Sparkles, 
  ChevronRight,
  ExternalLink,
  Tag
} from 'lucide-react';
import { SurveyActivityLog, ActivityActionType } from '../../types/activityLog';
import { getAuditTrailForSurvey } from '../../utils/activityLogStorage';

interface AuditTrailTimelineProps {
  surveyId: string;
  maxItems?: number;
  title?: string;
  showHeader?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Format relative Indonesian timestamp
 */
function formatIndonesianRelativeTime(isoString: string): string {
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Waktu tidak valid';
  }
}

/**
 * Action styling and icon helper
 */
function getActionConfig(action: ActivityActionType) {
  switch (action) {
    case 'verify_survey':
      return {
        icon: ShieldCheck,
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        dotBg: 'bg-emerald-500 ring-emerald-100 dark:ring-emerald-900',
        label: 'Verifikasi Disahkan'
      };
    case 'unverify_survey':
      return {
        icon: ShieldAlert,
        badgeBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        dotBg: 'bg-rose-500 ring-rose-100 dark:ring-rose-900',
        label: 'Verifikasi Dibatalkan'
      };
    case 'create_survey':
      return {
        icon: PlusCircle,
        badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        dotBg: 'bg-indigo-500 ring-indigo-100 dark:ring-indigo-900',
        label: 'Survei Baru Dibuat'
      };
    case 'update_metadata':
      return {
        icon: Layers,
        badgeBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        dotBg: 'bg-amber-500 ring-amber-100 dark:ring-amber-900',
        label: 'Metadata & Informan'
      };
    case 'update_section':
    default:
      return {
        icon: Edit3,
        badgeBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        dotBg: 'bg-blue-500 ring-blue-100 dark:ring-blue-900',
        label: 'Penyuntingan Seksi'
      };
  }
}

/**
 * Role badge styling
 */
function getRoleBadge(role: string) {
  switch (role) {
    case 'admin':
      return {
        label: 'Admin Sistem',
        className: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900'
      };
    case 'verifikator':
      return {
        label: 'Verifikator Linguistik',
        className: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900'
      };
    case 'surveyor':
      return {
        label: 'Surveyor Lapangan',
        className: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900'
      };
    default:
      return {
        label: 'Akademisi / Tamu',
        className: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
      };
  }
}

export const AuditTrailTimeline: React.FC<AuditTrailTimelineProps> = ({
  surveyId,
  maxItems = 5,
  title = 'Audit Trail Timeline',
  showHeader = true,
  compact = false,
  className = ''
}) => {
  const [logs, setLogs] = useState<SurveyActivityLog[]>([]);

  const refreshLogs = () => {
    if (!surveyId) return;
    const result = getAuditTrailForSurvey(surveyId, maxItems);
    setLogs(result);
  };

  useEffect(() => {
    refreshLogs();

    // Listen to real-time custom events when any survey edit is logged
    const handleActivityLogged = (e: Event) => {
      const customEvent = e as CustomEvent<SurveyActivityLog>;
      if (customEvent.detail && customEvent.detail.surveyId === surveyId) {
        refreshLogs();
      }
    };

    window.addEventListener('derana_activity_logged', handleActivityLogged);
    return () => {
      window.removeEventListener('derana_activity_logged', handleActivityLogged);
    };
  }, [surveyId, maxItems]);

  return (
    <div className={`rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-3.5 sm:p-4.5 ${className}`}>
      {showHeader && (
        <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-200/60 dark:border-indigo-900/60">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {title}
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {logs.length} Aksi Terakhir
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Riwayat kronologis 5 aksi penyuntingan data oleh surveyor & admin
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Audit Otomatis</span>
          </div>
        </div>
      )}

      {logs.length === 0 ? (
        <div className="py-6 px-4 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40">
          <History className="w-7 h-7 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Belum ada catatan aktivitas perubahan
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Setiap aksi pengisian data kuesioner, lampiran audio, atau verifikasi kurator akan otomatis terekam dalam timeline ini.
          </p>
        </div>
      ) : (
        <div className="relative pl-4 sm:pl-5 space-y-4 before:absolute before:left-1.5 sm:before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {logs.map((log, index) => {
            const config = getActionConfig(log.action);
            const Icon = config.icon;
            const roleInfo = getRoleBadge(log.userRole);
            const isFirst = index === 0;

            return (
              <div key={log.id} className="relative group">
                {/* Timeline Node Point */}
                <span 
                  className={`absolute -left-4 sm:-left-5 top-1.5 w-3.5 h-3.5 rounded-full ring-4 ${config.dotBg} transition-transform group-hover:scale-125`} 
                  aria-hidden="true"
                />

                {/* Timeline Item Box */}
                <div className={`p-3 rounded-xl border transition-all ${
                  isFirst
                    ? 'bg-white dark:bg-slate-900 border-indigo-200/80 dark:border-indigo-900/60 shadow-xs'
                    : 'bg-white/70 dark:bg-slate-900/50 border-slate-200/70 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900'
                }`}>
                  {/* Top Bar: Action Badge & Relative Time */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${config.badgeBg}`}>
                        <Icon className="w-3 h-3" />
                        <span>{log.actionLabel || config.label}</span>
                      </span>

                      {log.sectionName && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 max-w-[220px] truncate">
                          <Tag className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                          <span className="truncate">{log.sectionName}</span>
                        </span>
                      )}

                      {log.source === 'pwa_offline' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" title="Disimpan via cache offline IndexedDB PWA">
                          <WifiOff className="w-2.5 h-2.5" />
                          <span>PWA Offline</span>
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-mono font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formatIndonesianRelativeTime(log.timestamp)}</span>
                    </span>
                  </div>

                  {/* Log Narrative Description */}
                  <p className="text-xs text-slate-700 dark:text-slate-200 font-normal leading-relaxed">
                    {log.details}
                  </p>

                  {/* Diff Summary / Metric Delta Tag */}
                  {log.diffSummary && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
                      {log.diffSummary.itemsChanged !== undefined && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-medium border border-blue-200/60 dark:border-blue-900/40">
                          {log.diffSummary.itemsChanged} butir diubah
                        </span>
                      )}
                      {log.diffSummary.completionDelta !== undefined && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200/60 dark:border-emerald-900/40">
                          +{log.diffSummary.completionDelta}% progres
                        </span>
                      )}
                      {log.diffSummary.notes && (
                        <span className="text-slate-500 dark:text-slate-400 italic">
                          ({log.diffSummary.notes})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actor Footer: User Name, Avatar, and Role */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {log.userName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {log.userName}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border shrink-0 ${roleInfo.className}`}>
                      {roleInfo.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
