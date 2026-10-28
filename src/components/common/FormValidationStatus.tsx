import React from 'react';
import { AlertTriangle, CheckCircle2, ArrowRight, CornerDownRight } from 'lucide-react';
import { FieldValidationError } from '../../utils/formValidation';

interface FormValidationStatusProps {
  errors: FieldValidationError[];
  sectionTitle?: string;
  onFocusField?: (fieldId: string) => void;
  className?: string;
}

export const FormValidationStatus: React.FC<FormValidationStatusProps> = ({
  errors,
  sectionTitle,
  onFocusField,
  className = ''
}) => {
  const handleScrollTo = (fieldId: string) => {
    if (onFocusField) {
      onFocusField(fieldId);
      return;
    }
    const el = document.getElementById(fieldId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus();
      // Add brief pulse highlight
      el.classList.add('ring-4', 'ring-rose-500/40');
      setTimeout(() => {
        el.classList.remove('ring-4', 'ring-rose-500/40');
      }, 1500);
    }
  };

  if (errors.length === 0) {
    return (
      <div className={`flex items-center justify-between p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs transition-all ${className}`}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium">
            Validasi Berhasil: Semua kolom {sectionTitle ? `pada seksi ${sectionTitle}` : ''} telah memenuhi kriteria dan siap disimpan.
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
          0 Error
        </span>
      </div>
    );
  }

  return (
    <div className={`p-3.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/80 text-rose-900 dark:text-rose-200 text-xs shadow-2xs transition-all animate-in fade-in ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-rose-200/60 dark:border-rose-800/50">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <h4 className="font-bold text-xs">
            Periksa Kembali Sebelum Menyimpan ({errors.length} Kolom Belum Valid)
          </h4>
        </div>
        <span className="self-start sm:self-auto px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-[10px] font-bold text-rose-700 dark:text-rose-300">
          Umpan Balik Visual Aktif
        </span>
      </div>

      <div className="mt-2.5">
        <p className="text-[11px] text-rose-700 dark:text-rose-300 mb-2">
          Klik salah satu kolom berikut untuk langsung melompat dan memperbaikinya:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {errors.map((err) => (
            <button
              key={`${err.sectionNumber}-${err.fieldId}`}
              type="button"
              onClick={() => handleScrollTo(err.fieldId)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-700/80 text-rose-800 dark:text-rose-300 hover:bg-rose-100/60 dark:hover:bg-rose-900/40 text-[11px] font-medium transition-colors shadow-2xs cursor-pointer group"
              title={err.message}
            >
              <CornerDownRight className="w-3 h-3 text-rose-500 group-hover:translate-x-0.5 transition-transform" />
              <strong className="font-semibold">{err.fieldLabel}:</strong>
              <span className="truncate max-w-[180px] sm:max-w-[240px] text-slate-600 dark:text-slate-300">{err.message}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
