import React, { useState } from 'react';
import { 
  X, 
  Volume2, 
  Sparkles, 
  ArrowLeftRight, 
  Copy, 
  Check, 
  Info, 
  BookOpen, 
  Layers,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { AlignedPhoneticResult } from '../../utils/phoneticSegmentAligner';
import { PhoneticSegmentVisualizer } from './PhoneticSegmentVisualizer';

export interface PhoneticShiftInspectorModalProps {
  alignment: AlignedPhoneticResult | null;
  point1Label: string;
  point2Label: string;
  onClose: () => void;
}

export const PhoneticShiftInspectorModal: React.FC<PhoneticShiftInspectorModalProps> = ({
  alignment,
  point1Label,
  point2Label,
  onClose
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  if (!alignment) return null;

  const handleCopy = () => {
    const text = [
      `Analisis Penjajaran Fonetik IPA Swadesh: Glos "${alignment.glos}"`,
      `${point1Label}: ${alignment.word1} [${alignment.tokens1.map(t => t.text).join('')}]`,
      `${point2Label}: ${alignment.word2} [${alignment.tokens2.map(t => t.text).join('')}]`,
      `Kemiripan Fonetik IPA: ${alignment.similarityPct}% (${alignment.similarityBadge.label})`,
      alignment.shifts.length > 0 
        ? `Pergeseran Fonem Terdeteksi:\n` + alignment.shifts.map(s => `• [${s.soundA}] ↔ [${s.soundB}] (${s.shiftType}): ${s.description}`).join('\n')
        : `Status: Fonem segmental homogen / identik.`
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedToken1 = selectedSlotIndex !== null ? alignment.tokens1[selectedSlotIndex] : null;
  const selectedToken2 = selectedSlotIndex !== null ? alignment.tokens2[selectedSlotIndex] : null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                  Glos &quot;{alignment.glos}&quot; • Inspeksi Fonetik IPA
                </h3>
                <span 
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${alignment.similarityBadge.badgeBg} ${alignment.similarityBadge.badgeText} ${alignment.similarityBadge.borderClass}`}
                >
                  {alignment.similarityBadge.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Perbandingan transkripsi segmen fonetis antar dua titik pengamatan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Salin analisis IPA ke clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* 1. Comparison Highlight Banner */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block truncate">
                {point1Label}
              </span>
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {alignment.word1 || '(kosong)'}
              </div>
              <div className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300">
                [{alignment.rawIpa1 || alignment.word1}]
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block truncate">
                {point2Label}
              </span>
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {alignment.word2 || '(kosong)'}
              </div>
              <div className="text-xs font-mono font-bold text-amber-700 dark:text-amber-300">
                [{alignment.rawIpa2 || alignment.word2}]
              </div>
            </div>
          </div>

          {/* 2. Visual Segment Alignment Ladder */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                Matriks Penjajaran Segmen Fonetik Needleman-Wunsch:
              </span>
              <span className="text-[11px] text-slate-400">
                Klik segmen untuk analisis artikulatoris
              </span>
            </div>

            <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
              <div className="inline-flex flex-col gap-2 min-w-max">
                {/* Point 1 Nodes */}
                <div className="flex items-center gap-1.5">
                  <span className="w-16 text-[10px] font-bold text-slate-400 truncate">
                    {point1Label.split(' ')[0]}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {alignment.tokens1.map((tok, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedSlotIndex(i)}
                        className={`w-9 h-9 rounded-xl border text-sm font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${tok.badgeBg} ${tok.badgeText} ${tok.badgeBorder} ${
                          selectedSlotIndex === i ? 'ring-2 ring-purple-500 scale-105' : 'hover:scale-105'
                        }`}
                        title={tok.tooltipText}
                      >
                        {tok.text}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Connection Indicators */}
                <div className="flex items-center gap-1.5">
                  <span className="w-16 text-[10px] font-medium text-slate-400">
                    Korelasi
                  </span>
                  <div className="flex items-center gap-1.5">
                    {alignment.tokens1.map((tok1, i) => {
                      const tok2 = alignment.tokens2[i];
                      const isMatch = tok1.status === 'MATCH';
                      const isShift = tok1.status === 'SHIFT' || tok2?.status === 'SHIFT';
                      const isDel = tok1.isGap || tok2?.isGap;

                      return (
                        <div
                          key={i}
                          className={`w-9 h-5 rounded-md text-[11px] font-mono font-bold flex items-center justify-center ${
                            isMatch 
                              ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' 
                              : isShift 
                              ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' 
                              : isDel 
                              ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40' 
                              : 'text-slate-400 bg-slate-100 dark:bg-slate-800'
                          }`}
                        >
                          {isMatch ? '=' : isShift ? '↔' : isDel ? '∅' : '≠'}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Point 2 Nodes */}
                <div className="flex items-center gap-1.5">
                  <span className="w-16 text-[10px] font-bold text-slate-400 truncate">
                    {point2Label.split(' ')[0]}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {alignment.tokens2.map((tok, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedSlotIndex(i)}
                        className={`w-9 h-9 rounded-xl border text-sm font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${tok.badgeBg} ${tok.badgeText} ${tok.badgeBorder} ${
                          selectedSlotIndex === i ? 'ring-2 ring-purple-500 scale-105' : 'hover:scale-105'
                        }`}
                        title={tok.tooltipText}
                      >
                        {tok.text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Slot Inspector (When a segment node is clicked) */}
          {selectedSlotIndex !== null && selectedToken1 && selectedToken2 && (
            <div className="p-3 bg-purple-50/70 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800/60 text-xs space-y-1.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Inspeksi Slot #{selectedSlotIndex + 1}: [{selectedToken1.text}] ↔ [{selectedToken2.text}]
                </span>
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300">
                  Skor Kemiripan Segmen: {Math.round(selectedToken1.similarity * 100)}%
                </span>
              </div>
              <p className="text-[11px] text-purple-800/90 dark:text-purple-300/90 leading-relaxed">
                {selectedToken1.tooltipText || selectedToken2.tooltipText || 'Segmen fonem bersesuaian.'}
              </p>
            </div>
          )}

          {/* 4. List of Detected Shifts */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Pergeseran Fonemik Terdeteksi ({alignment.shifts.length} aturan):
            </h4>

            {alignment.shifts.length === 0 ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Seluruh segmen fonetis IPA identik atau tidak ditemukan korespondensi bunyi teratur.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {alignment.shifts.map((shift, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/60 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                        <span className="font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700">
                          [{shift.soundA}] ↔ [{shift.soundB}]
                        </span>
                        <span>{shift.shiftType}</span>
                      </span>
                      <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                        Slot #{shift.position}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                      {shift.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Kemiripan Fonetik IPA: <b>{alignment.similarityPct}%</b>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
