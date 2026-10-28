import React from 'react';
import { 
  Sparkles, 
  Volume2, 
  ArrowLeftRight, 
  Info, 
  AlertCircle,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { 
  AlignedPhoneticResult, 
  AlignedToken, 
  alignPhoneticSegments 
} from '../../utils/phoneticSegmentAligner';

export interface PhoneticSegmentVisualizerProps {
  alignment?: AlignedPhoneticResult;
  rawIpa1?: string;
  rawIpa2?: string;
  word1?: string;
  word2?: string;
  glos?: string;
  point1Label?: string;
  point2Label?: string;
  mode?: 'inline-tokens' | 'dual-inline' | 'ribbon-grid' | 'badge-only';
  targetPoint?: 1 | 2; // For inline-tokens mode: render tokens for point 1 or point 2
  showTooltip?: boolean;
  onOpenInspector?: () => void;
}

export const PhoneticSegmentVisualizer: React.FC<PhoneticSegmentVisualizerProps> = ({
  alignment,
  rawIpa1,
  rawIpa2,
  word1,
  word2,
  glos = '',
  point1Label = 'Titik A',
  point2Label = 'Titik B',
  mode = 'dual-inline',
  targetPoint = 1,
  showTooltip = true,
  onOpenInspector
}) => {
  // Ensure alignment object exists
  const alignData = React.useMemo(() => {
    if (alignment) return alignment;
    return alignPhoneticSegments(rawIpa1 || '', rawIpa2 || '', word1 || '', word2 || '', glos);
  }, [alignment, rawIpa1, rawIpa2, word1, word2, glos]);

  // Mode: Badge Only
  if (mode === 'badge-only') {
    const { similarityPct, similarityBadge } = alignData;
    return (
      <span 
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-transform hover:scale-105 select-none shadow-2xs ${similarityBadge.badgeBg} ${similarityBadge.badgeText} ${similarityBadge.borderClass}`}
        title={`Kemiripan fonetik IPA segmen: ${similarityPct}% (${similarityBadge.label})`}
      >
        <span 
          className="w-2 h-2 rounded-full shrink-0" 
          style={{
            backgroundColor: similarityPct >= 80 ? '#10b981' : similarityPct >= 50 ? '#f59e0b' : '#f43f5e'
          }}
        />
        <span className="font-mono font-black tracking-tight">{similarityPct}%</span>
        <span className="text-[10px] font-medium opacity-90 hidden sm:inline">
          {similarityPct >= 99.5 ? 'Identik' : similarityPct >= 75 ? 'Teratur' : similarityPct >= 45 ? 'Bergeser' : 'Beda'}
        </span>
      </span>
    );
  }

  // Mode: Inline Tokens for one point (1 or 2)
  if (mode === 'inline-tokens') {
    const tokens = targetPoint === 1 ? alignData.tokens1 : alignData.tokens2;
    if (tokens.length === 0) {
      return <span className="text-slate-400 font-mono text-[11px]">(belum terisi)</span>;
    }

    return (
      <span className="inline-flex flex-wrap items-center gap-0.5 font-mono text-xs select-text">
        <span className="text-slate-400 font-sans text-[11px] select-none">[</span>
        {tokens.map((token, idx) => {
          if (token.isGap) {
            return (
              <span
                key={idx}
                title={token.tooltipText}
                className="inline-block px-1 py-0.2 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-dashed border-rose-300 dark:border-rose-800"
              >
                ∅
              </span>
            );
          }

          if (token.status === 'SHIFT') {
            return (
              <span
                key={idx}
                title={token.tooltipText}
                className="inline-block px-1 py-0.2 rounded font-bold text-xs bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 shadow-2xs transition-transform hover:scale-110"
              >
                {token.text}
              </span>
            );
          }

          if (token.status === 'UNMATCHED') {
            return (
              <span
                key={idx}
                title={token.tooltipText}
                className="inline-block px-1 py-0.2 rounded font-bold text-xs bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800"
              >
                {token.text}
              </span>
            );
          }

          // MATCH
          return (
            <span
              key={idx}
              title={token.tooltipText}
              className="inline-block px-0.5 text-slate-700 dark:text-slate-300 font-medium"
            >
              {token.text}
            </span>
          );
        })}
        <span className="text-slate-400 font-sans text-[11px] select-none">]</span>
      </span>
    );
  }

  // Mode: Ribbon Grid (Visual Alignment Ladder)
  if (mode === 'ribbon-grid') {
    return (
      <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Penjajaran Segmen IPA: Glos &quot;{alignData.glos}&quot;
            </span>
            <span 
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${alignData.similarityBadge.badgeBg} ${alignData.similarityBadge.badgeText} ${alignData.similarityBadge.borderClass}`}
            >
              {alignData.similarityBadge.label}
            </span>
          </div>

          {onOpenInspector && (
            <button
              type="button"
              onClick={onOpenInspector}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Detail Morfofonemik →
            </button>
          )}
        </div>

        {/* Visual Alignment Grid */}
        <div className="overflow-x-auto pb-1">
          <div className="inline-flex flex-col gap-1.5 font-mono text-xs min-w-max">
            {/* Row 1: Titik 1 */}
            <div className="flex items-center gap-1">
              <span className="w-20 font-sans text-[10px] font-bold text-slate-400 uppercase truncate">
                {point1Label.split(' ')[0]}
              </span>
              <div className="flex items-center gap-1">
                {alignData.tokens1.map((tok, i) => (
                  <span
                    key={i}
                    title={tok.tooltipText}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg border text-xs font-bold transition-transform hover:scale-110 cursor-help ${tok.badgeBg} ${tok.badgeText} ${tok.badgeBorder}`}
                  >
                    {tok.text}
                  </span>
                ))}
              </div>
            </div>

            {/* Row 2: Status Indicator */}
            <div className="flex items-center gap-1">
              <span className="w-20 font-sans text-[10px] font-semibold text-slate-400 truncate">
                Status
              </span>
              <div className="flex items-center gap-1">
                {alignData.tokens1.map((tok1, i) => {
                  const tok2 = alignData.tokens2[i];
                  const isMatch = tok1.status === 'MATCH';
                  const isShift = tok1.status === 'SHIFT' || tok2?.status === 'SHIFT';
                  const isDel = tok1.isGap || tok2?.isGap;

                  return (
                    <span
                      key={i}
                      className={`w-7 h-5 flex items-center justify-center rounded text-[10px] font-black ${
                        isMatch 
                          ? 'text-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' 
                          : isShift 
                          ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' 
                          : isDel 
                          ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40' 
                          : 'text-slate-400'
                      }`}
                    >
                      {isMatch ? '=' : isShift ? '↔' : isDel ? '∅' : '≠'}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Row 3: Titik 2 */}
            <div className="flex items-center gap-1">
              <span className="w-20 font-sans text-[10px] font-bold text-slate-400 uppercase truncate">
                {point2Label.split(' ')[0]}
              </span>
              <div className="flex items-center gap-1">
                {alignData.tokens2.map((tok, i) => (
                  <span
                    key={i}
                    title={tok.tooltipText}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg border text-xs font-bold transition-transform hover:scale-110 cursor-help ${tok.badgeBg} ${tok.badgeText} ${tok.badgeBorder}`}
                  >
                    {tok.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detected Shift Pills */}
        {alignData.shifts.length > 0 && (
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
              Pergeseran:
            </span>
            {alignData.shifts.map((s, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1"
                title={s.description}
              >
                <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                <span>
                  [{s.soundA}] ↔ [{s.soundB}] ({s.shiftType})
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default Mode: Dual-Inline (Both points side-by-side with highlight and badge)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-0.5">
          {/* Point 1 */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[10px] font-semibold text-indigo-500/80 w-10 truncate select-none">
              {point1Label.split(' ')[0]}:
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">
              {alignData.word1}
            </span>
            <span className="inline-flex items-center font-mono text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 select-none mr-0.5">[</span>
              {alignData.tokens1.map((tok, i) => (
                <span
                  key={i}
                  title={tok.tooltipText}
                  className={tok.status === 'SHIFT' 
                    ? 'px-0.5 rounded font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200' 
                    : tok.isGap 
                    ? 'text-rose-500 font-bold opacity-80' 
                    : ''}
                >
                  {tok.text}
                </span>
              ))}
              <span className="text-slate-400 select-none ml-0.5">]</span>
            </span>
          </div>

          {/* Point 2 */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[10px] font-semibold text-amber-500/80 w-10 truncate select-none">
              {point2Label.split(' ')[0]}:
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">
              {alignData.word2}
            </span>
            <span className="inline-flex items-center font-mono text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 select-none mr-0.5">[</span>
              {alignData.tokens2.map((tok, i) => (
                <span
                  key={i}
                  title={tok.tooltipText}
                  className={tok.status === 'SHIFT' 
                    ? 'px-0.5 rounded font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200' 
                    : tok.isGap 
                    ? 'text-rose-500 font-bold opacity-80' 
                    : ''}
                >
                  {tok.text}
                </span>
              ))}
              <span className="text-slate-400 select-none ml-0.5">]</span>
            </span>
          </div>
        </div>

        {/* Similarity percentage badge */}
        <div className="shrink-0 text-right">
          <span 
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border select-none ${alignData.similarityBadge.badgeBg} ${alignData.similarityBadge.badgeText} ${alignData.similarityBadge.borderClass}`}
            title={`Kemiripan Fonetik IPA: ${alignData.similarityPct}%`}
          >
            {alignData.similarityBadge.label}
          </span>
          {alignData.shifts.length > 0 && (
            <span className="block text-[9px] font-medium text-amber-700 dark:text-amber-300 mt-0.5">
              {alignData.shifts.length} pergeseran bunyi
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
