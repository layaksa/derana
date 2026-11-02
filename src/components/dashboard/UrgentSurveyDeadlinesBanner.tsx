import React, { useState, useEffect, useMemo } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Calendar, 
  ArrowRight, 
  ChevronRight, 
  ShieldCheck, 
  User, 
  Flame, 
  CheckCircle2, 
  AlertCircle, 
  Hourglass, 
  Filter,
  Sparkles,
  RefreshCw,
  PlusCircle
} from 'lucide-react';
import { SurveyRecord } from '../../types/linguistic';
import { AppUser } from '../../types/auth';
import { calculateDeadlineMetrics } from '../../utils/deadlineUtils';
import { ExtendDeadlineModal } from './ExtendDeadlineModal';

interface UrgentSurveyDeadlinesBannerProps {
  surveys: SurveyRecord[];
  currentUser: AppUser | null;
  onSelectSurvey: (id: string) => void;
  onNavigateToForm: (id: string) => void;
  onExtendDeadline: (surveyId: string, additionalDaysOrDate: number | string, notes?: string) => void;
}

export const UrgentSurveyDeadlinesBanner: React.FC<UrgentSurveyDeadlinesBannerProps> = ({
  surveys,
  currentUser,
  onSelectSurvey,
  onNavigateToForm,
  onExtendDeadline
}) => {
  // Live ticker for second-by-second countdown
  const [now, setNow] = useState(() => new Date());
  const [selectedSurveyForExtend, setSelectedSurveyForExtend] = useState<SurveyRecord | null>(null);
  const [showAllDeadlines, setShowAllDeadlines] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter urgent surveys: surveys with deadlines < 3 days (72 hours) or overdue, and not verified
  const { urgentSurveys, overdueCount, criticalCount, allDeadlinesSurveys } = useMemo(() => {
    const allWithDeadlines = surveys
      .filter(s => s.deadline && !s.isVerified)
      .map(s => {
        const metrics = calculateDeadlineMetrics(s.deadline, now);
        return {
          survey: s,
          metrics
        };
      });

    // Sort by most urgent first (overdue and nearest deadlines first)
    allWithDeadlines.sort((a, b) => {
      const timeA = a.metrics.deadlineDate ? a.metrics.deadlineDate.getTime() : Infinity;
      const timeB = b.metrics.deadlineDate ? b.metrics.deadlineDate.getTime() : Infinity;
      return timeA - timeB;
    });

    const urgent = allWithDeadlines.filter(item => item.metrics.isUrgent);
    const overdue = allWithDeadlines.filter(item => item.metrics.isOverdue).length;
    const critical = allWithDeadlines.filter(item => item.metrics.isCritical && !item.metrics.isOverdue).length;

    return {
      urgentSurveys: urgent,
      overdueCount: overdue,
      criticalCount: critical,
      allDeadlinesSurveys: allWithDeadlines
    };
  }, [surveys, now]);

  const isAdmin = currentUser?.role === 'admin';
  const displayItems = showAllDeadlines ? allDeadlinesSurveys : urgentSurveys;

  if (urgentSurveys.length === 0 && !showAllDeadlines) {
    // Subtle info bar if no surveys are urgent right now
    if (allDeadlinesSurveys.length === 0) return null;

    return (
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Clock className="w-4 h-4 text-emerald-500" />
          <span>Semua survei aktif ({allDeadlinesSurveys.length} survei) memiliki batas waktu pengerjaan yang aman (&gt; 3 hari).</span>
        </div>
        <button
          type="button"
          onClick={() => setShowAllDeadlines(true)}
          className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
        >
          Lihat Jadwal Tenggat
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border border-amber-300/80 dark:border-amber-600/40 bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-amber-500/5 dark:from-amber-950/40 dark:via-rose-950/20 dark:to-slate-900 shadow-sm transition-all">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        {/* Banner Top Header */}
        <div className="p-4 sm:p-5 border-b border-amber-200/60 dark:border-amber-800/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="relative w-10 h-10 rounded-2xl bg-linear-to-tr from-amber-500 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>Peringatan Batas Waktu Survei (&lt; 3 Hari Tersisa)</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-600 text-white shadow-2xs">
                  {urgentSurveys.length} Titik Mendesak
                </span>
                {overdueCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    {overdueCount} Melewati Tenggat
                  </span>
                )}
                {criticalCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    {criticalCount} Kritis (&lt; 24 Jam)
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Survei berikut mendekati batas akhir pengumpulan data lapangan atau membutuhkan tindak lanjut cepat.
                {isAdmin ? (
                  <strong className="text-amber-900 dark:text-amber-200 ml-1">
                    Sebagai Admin, Anda dapat memperpanjang tenggat waktu kapan saja.
                  </strong>
                ) : (
                  <span className="ml-1 text-slate-500">Hubungi Admin jika tim lapangan membutuhkan tambahan waktu kuesioner.</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            {allDeadlinesSurveys.length > urgentSurveys.length && (
              <button
                type="button"
                onClick={() => setShowAllDeadlines(!showAllDeadlines)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-amber-200/80 dark:border-amber-800/60 transition-all cursor-pointer shadow-2xs"
              >
                {showAllDeadlines ? 'Saring Khusus &lt; 3 Hari' : `Tampilkan Semua (${allDeadlinesSurveys.length})`}
              </button>
            )}
          </div>
        </div>

        {/* Survey Cards Grid */}
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {displayItems.map(({ survey, metrics }) => {
            const isOverdue = metrics.isOverdue;
            const isCritical = metrics.isCritical;
            const progress = survey.progress || 0;

            // Kelengkapan color
            let progressBg = 'bg-rose-500';
            let progressText = 'text-rose-600 dark:text-rose-400';
            if (progress >= 80) {
              progressBg = 'bg-emerald-500';
              progressText = 'text-emerald-600 dark:text-emerald-400';
            } else if (progress >= 40) {
              progressBg = 'bg-amber-500';
              progressText = 'text-amber-600 dark:text-amber-400';
            }

            return (
              <div
                key={survey.id}
                className={`relative rounded-2xl p-4 transition-all border flex flex-col justify-between ${
                  isOverdue
                    ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900/60 shadow-xs ring-1 ring-rose-500/30'
                    : isCritical
                    ? 'bg-red-50/70 dark:bg-red-950/30 border-red-300 dark:border-red-900/60 shadow-xs'
                    : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60 shadow-2xs'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header: Countdown & Urgency Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black font-mono shadow-2xs ${
                      isOverdue 
                        ? 'bg-rose-600 text-white animate-pulse' 
                        : isCritical
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-amber-500 text-white'
                    }`}>
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{metrics.formattedCountdown}</span>
                    </span>

                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      {isOverdue ? 'Terlewat' : 'Sisa Waktu'}
                    </span>
                  </div>

                  {/* Survey Details */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1" title={survey.title}>
                      {survey.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1">
                      Desa {survey.desa || '-'}, Kec. {survey.kecamatan || '-'}, {survey.kabupatenKota || '-'}
                    </p>
                  </div>

                  {/* Progress & Surveyor Info */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">Kelengkapan Data:</span>
                      <span className={`font-bold font-mono ${progressText}`}>
                        {progress}% ({survey.completedSectionsCount || 0}/16 Seksi)
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700/60 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${progressBg}`}
                        style={{ width: `${Math.max(5, progress)}%` }}
                      />
                    </div>
                  </div>

                  {/* Metadata: Surveyor & Target Date */}
                  <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>Surveyor:</span>
                      </span>
                      <strong className="text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                        {survey.createdByName || 'Surveyor Lapangan'}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Tenggat:</span>
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                        {metrics.formattedDeadlineDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3.5 mt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectSurvey(survey.id);
                      onNavigateToForm(survey.id);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
                  >
                    <span>Buka Survei</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {/* ADMIN ONLY: Perpanjang Tenggat Waktu */}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setSelectedSurveyForExtend(survey)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-linear-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 shadow-2xs shadow-amber-500/20 transition-all cursor-pointer"
                      title="Perpanjang tenggat waktu pengerjaan kuesioner"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Perpanjang</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Perpanjangan Tenggat Khusus Admin */}
      {selectedSurveyForExtend && (
        <ExtendDeadlineModal
          isOpen={Boolean(selectedSurveyForExtend)}
          onClose={() => setSelectedSurveyForExtend(null)}
          survey={selectedSurveyForExtend}
          onConfirm={(surveyId, additionalDaysOrDate, notes) => {
            onExtendDeadline(surveyId, additionalDaysOrDate, notes);
            setSelectedSurveyForExtend(null);
          }}
        />
      )}
    </>
  );
};
