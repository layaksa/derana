import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { calculateDeadlineMetrics } from '../../utils/deadlineUtils';

interface SurveyCountdownBadgeProps {
  deadline?: string;
  isCompleted?: boolean;
  isVerified?: boolean;
  showIcon?: boolean;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  onExtendClick?: () => void;
  canExtend?: boolean;
}

export const SurveyCountdownBadge: React.FC<SurveyCountdownBadgeProps> = ({
  deadline,
  isCompleted = false,
  isVerified = false,
  showIcon = true,
  size = 'sm',
  className = '',
  onExtendClick,
  canExtend = false
}) => {
  const [now, setNow] = useState(() => new Date());

  // Update every second for live ticking countdown
  useEffect(() => {
    if (!deadline) return;
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (isVerified) {
    return (
      <span className={`inline-flex items-center gap-1 font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 ${
        size === 'xs' ? 'text-[10px] px-2 py-0.5' : size === 'md' ? 'text-xs px-3 py-1' : 'text-[11px] px-2.5 py-0.5'
      } ${className}`}>
        {showIcon && <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
        <span>Selesai & Sah</span>
      </span>
    );
  }

  const metrics = calculateDeadlineMetrics(deadline, now);

  if (!metrics.hasDeadline) {
    return (
      <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 ${
        size === 'xs' ? 'text-[10px] px-2 py-0.5' : size === 'md' ? 'text-xs px-3 py-1' : 'text-[11px] px-2.5 py-0.5'
      } ${className}`}>
        {showIcon && <Clock className="w-3 h-3 text-slate-400" />}
        <span>Tanpa Tenggat</span>
      </span>
    );
  }

  const getUrgencyIcon = () => {
    if (metrics.urgencyLevel === 'overdue') {
      return <AlertTriangle className="w-3 h-3 text-white animate-bounce" />;
    }
    if (metrics.urgencyLevel === 'critical') {
      return <AlertCircle className="w-3 h-3 text-white animate-pulse" />;
    }
    if (metrics.urgencyLevel === 'urgent') {
      return <Clock className="w-3 h-3 text-white" />;
    }
    return <Clock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />;
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        title={`Batas Waktu: ${metrics.formattedDeadlineDate} (${metrics.badgeLabel})`}
        className={`inline-flex items-center gap-1.5 font-bold rounded-full border transition-all ${
          metrics.colorScheme.badgeBg
        } ${
          metrics.colorScheme.pulse ? 'ring-2 ring-rose-400/50' : ''
        } ${
          size === 'xs'
            ? 'text-[10px] px-2 py-0.5'
            : size === 'md'
            ? 'text-xs px-3 py-1 font-mono tracking-tight'
            : 'text-[11px] px-2.5 py-0.5 font-mono'
        }`}
      >
        {showIcon && getUrgencyIcon()}
        <span>{metrics.formattedCountdown}</span>
      </span>

      {canExtend && onExtendClick && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onExtendClick();
          }}
          className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline underline-offset-2 ml-0.5 cursor-pointer"
          title="Perpanjang batas waktu pengerjaan (Hak Akses Admin)"
        >
          +Perpanjang
        </button>
      )}
    </div>
  );
};
