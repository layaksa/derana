import React from 'react';
import { AlertTriangle, X, CornerDownRight, Save, Check } from 'lucide-react';
import { FieldValidationError } from '../../utils/formValidation';

interface ValidationWarningModalProps {
  isOpen: boolean;
  errors: FieldValidationError[];
  onClose: () => void;
  onFixField: (sectionNumber: number, fieldId: string) => void;
  onConfirmSaveAnyway: () => void;
}

export const ValidationWarningModal: React.FC<ValidationWarningModalProps> = ({
  isOpen,
  errors,
  onClose,
  onFixField,
  onConfirmSaveAnyway
}) => {
  if (!isOpen) return null;

  // Group errors by section
  const grouped: Record<number, { title: string; items: FieldValidationError[] }> = {};
  errors.forEach(err => {
    if (!grouped[err.sectionNumber]) {
      grouped[err.sectionNumber] = {
        title: err.sectionTitle,
        items: []
      };
    }
    grouped[err.sectionNumber].items.push(err);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 bg-rose-50/50 dark:bg-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                Peringatan Validasi Formulir
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ditemukan {errors.length} kolom yang belum memenuhi syarat validasi sebelum data disimpan.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Error List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Sebaiknya perbaiki data berikut agar kalkulasi persentase penduduk, koordinat spasial, dan dialektometri berjalan akurat:
          </p>

          <div className="space-y-3">
            {Object.entries(grouped).map(([sNum, { title, items }]) => (
              <div
                key={sNum}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-3"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60 dark:border-slate-700/60 mb-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    Seksi {sNum}: {title}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                    {items.length} Masalah
                  </span>
                </div>

                <div className="space-y-1.5">
                  {items.map((it) => (
                    <div
                      key={it.fieldId}
                      className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[11px]"
                    >
                      <div className="flex-1 truncate">
                        <span className="font-semibold text-rose-700 dark:text-rose-400">{it.fieldLabel}: </span>
                        <span className="text-slate-600 dark:text-slate-300">{it.message}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onFixField(Number(sNum), it.fieldId)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-[10px] font-semibold shrink-0 cursor-pointer"
                        title="Lompat ke kolom ini"
                      >
                        <CornerDownRight className="w-3 h-3" />
                        <span>Perbaiki</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-900">
          <button
            type="button"
            onClick={onConfirmSaveAnyway}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Simpan sebagai draf yang belum lengkap"
          >
            Tetap Simpan sebagai Draf
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Periksa & Perbaiki Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
