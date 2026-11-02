import React, { useState } from 'react';
import { Calendar, Clock, AlertTriangle, ShieldCheck, Check, X, ArrowRight, Sparkles } from 'lucide-react';
import { SurveyRecord } from '../../types/linguistic';
import { calculateDeadlineMetrics } from '../../utils/deadlineUtils';

interface ExtendDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  survey: SurveyRecord | null;
  onConfirm: (surveyId: string, additionalDaysOrDate: number | string, notes?: string) => void;
}

export const ExtendDeadlineModal: React.FC<ExtendDeadlineModalProps> = ({
  isOpen,
  onClose,
  survey,
  onConfirm
}) => {
  const [selectedQuickDays, setSelectedQuickDays] = useState<number>(7);
  const [useCustomDate, setUseCustomDate] = useState<boolean>(false);
  const [customDateTime, setCustomDateTime] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 16);
  });
  const [notes, setNotes] = useState<string>('');

  if (!isOpen || !survey) return null;

  const currentMetrics = calculateDeadlineMetrics(survey.deadline);

  // Compute preview of new deadline
  const baseTime = survey.deadline ? new Date(survey.deadline).getTime() : Date.now();
  const refTime = Math.max(baseTime, Date.now());

  let targetPreviewDate: Date;
  if (useCustomDate && customDateTime) {
    targetPreviewDate = new Date(customDateTime);
  } else {
    targetPreviewDate = new Date(refTime + selectedQuickDays * 24 * 60 * 60 * 1000);
  }

  const previewFormatted = isNaN(targetPreviewDate.getTime())
    ? '-'
    : targetPreviewDate.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (useCustomDate) {
      if (!customDateTime) return;
      onConfirm(survey.id, new Date(customDateTime).toISOString(), notes.trim() || undefined);
    } else {
      onConfirm(survey.id, selectedQuickDays, notes.trim() || undefined);
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-linear-to-r from-amber-500/10 via-indigo-500/10 to-transparent flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Hak Akses Admin
                </span>
                <span className="text-xs text-slate-400">ID: {survey.id.slice(0, 14)}...</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                Perpanjang Batas Waktu Survei
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Survey Info Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {survey.title}
              </h4>
              <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                {survey.progress}% Selesai
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <div>
                <span>Surveyor:</span>{' '}
                <strong className="text-slate-700 dark:text-slate-300">{survey.createdByName || 'Surveyor'}</strong>
              </div>
              <div>
                <span>Tenggat Saat Ini:</span>{' '}
                <strong className="text-slate-700 dark:text-slate-300">{currentMetrics.formattedDeadlineDate}</strong>
              </div>
            </div>

            {/* Current Urgency indicator */}
            <div className="pt-1 flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${currentMetrics.colorScheme.badgeBg}`}>
                {currentMetrics.badgeLabel}: {currentMetrics.formattedCountdown}
              </span>
            </div>
          </div>

          {/* Quick Option Selection */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pilih Tambahan Waktu
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: '+3 Hari', days: 3, desc: 'Percepatan singkat' },
                { label: '+7 Hari', days: 7, desc: '1 Minggu penuh' },
                { label: '+14 Hari', days: 14, desc: '2 Minggu standar' },
                { label: '+30 Hari', days: 30, desc: '1 Bulan riset' }
              ].map(opt => (
                <button
                  type="button"
                  key={opt.days}
                  onClick={() => {
                    setSelectedQuickDays(opt.days);
                    setUseCustomDate(false);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    !useCustomDate && selectedQuickDays === opt.days
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100 shadow-2xs ring-2 ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span className="font-extrabold text-xs block">{opt.label}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>

            {/* Custom Date Option Toggle */}
            <button
              type="button"
              onClick={() => setUseCustomDate(!useCustomDate)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mt-1 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{useCustomDate ? 'Kembali ke pilihan cepat' : 'Atur tanggal tenggat spesifik'}</span>
            </button>

            {useCustomDate && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 mt-2 animate-in fade-in duration-150">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                  Pilih Tanggal & Jam Batas Akhir:
                </label>
                <input
                  type="datetime-local"
                  value={customDateTime}
                  onChange={(e) => setCustomDateTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>
            )}
          </div>

          {/* Catatan / Alasan Perpanjangan */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Alasan Perpanjangan (Akan dicatat di Log Audit):
            </label>
            <input
              type="text"
              placeholder="Contoh: Hambatan cuaca di lapangan, penutur lansia dalam perawatan, dsb."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* New Deadline Preview */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                Tenggat Waktu Baru (Hasil Perpanjangan):
              </span>
              <p className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-100 mt-0.5">
                {previewFormatted}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-linear-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Simpan Perpanjangan Tenggat</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
