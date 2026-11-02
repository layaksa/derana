/**
 * deadlineUtils.ts
 * Utility functions for survey deadline calculations, countdown timers,
 * urgency classifications, and Indonesian date formatting.
 */

export interface DeadlineCalculation {
  hasDeadline: boolean;
  deadlineDate: Date | null;
  isOverdue: boolean;
  isUrgent: boolean;      // Under 3 days (< 72 hours) or overdue
  isCritical: boolean;    // Under 24 hours or overdue
  urgencyLevel: 'none' | 'safe' | 'urgent' | 'critical' | 'overdue';
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalHours: number;
  formattedCountdown: string;
  formattedShortCountdown: string;
  formattedDeadlineDate: string;
  badgeLabel: string;
  colorScheme: {
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    pulse: boolean;
  };
}

/**
 * Calculate countdown and urgency metrics for a given ISO deadline string.
 */
export function calculateDeadlineMetrics(
  deadlineStr?: string,
  referenceDate: Date = new Date()
): DeadlineCalculation {
  if (!deadlineStr || isNaN(Date.parse(deadlineStr))) {
    return {
      hasDeadline: false,
      deadlineDate: null,
      isOverdue: false,
      isUrgent: false,
      isCritical: false,
      urgencyLevel: 'none',
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalHours: 0,
      formattedCountdown: 'Tanpa Batas Waktu',
      formattedShortCountdown: 'Tanpa batas',
      formattedDeadlineDate: 'Belum ditentukan',
      badgeLabel: 'Tanpa Tenggat',
      colorScheme: {
        bg: 'bg-slate-50 dark:bg-slate-800/40',
        text: 'text-slate-500 dark:text-slate-400',
        border: 'border-slate-200 dark:border-slate-800',
        badgeBg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        badgeText: 'text-slate-600 dark:text-slate-400',
        pulse: false
      }
    };
  }

  const deadlineDate = new Date(deadlineStr);
  const nowMs = referenceDate.getTime();
  const deadlineMs = deadlineDate.getTime();
  const diffMs = deadlineMs - nowMs;
  const isOverdue = diffMs <= 0;
  const absDiffMs = Math.abs(diffMs);

  const totalHours = Math.round(absDiffMs / (1000 * 60 * 60));
  const days = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absDiffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((absDiffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((absDiffMs % (1000 * 60)) / 1000);

  // Urgent: Less than 3 days (72 hours) or already overdue
  const isUrgent = isOverdue || diffMs < 3 * 24 * 60 * 60 * 1000;
  // Critical: Less than 24 hours or overdue
  const isCritical = isOverdue || diffMs < 24 * 60 * 60 * 1000;

  let urgencyLevel: 'safe' | 'urgent' | 'critical' | 'overdue' = 'safe';
  if (isOverdue) {
    urgencyLevel = 'overdue';
  } else if (isCritical) {
    urgencyLevel = 'critical';
  } else if (isUrgent) {
    urgencyLevel = 'urgent';
  }

  // Format Indonesian deadline date
  const formattedDeadlineDate = deadlineDate.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Countdown strings
  let formattedCountdown = '';
  let formattedShortCountdown = '';
  let badgeLabel = '';

  if (isOverdue) {
    if (days > 0) {
      formattedCountdown = `Terlambat ${days} hari ${hours} jam`;
      formattedShortCountdown = `Terlambat ${days}h`;
    } else if (hours > 0) {
      formattedCountdown = `Terlambat ${hours} jam ${minutes} mnt`;
      formattedShortCountdown = `Terlambat ${hours}j`;
    } else {
      formattedCountdown = `Terlambat ${minutes} menit`;
      formattedShortCountdown = `Terlambat ${minutes}m`;
    }
    badgeLabel = 'Melewati Tenggat!';
  } else {
    if (days >= 3) {
      formattedCountdown = `${days} hari ${hours} jam lagi`;
      formattedShortCountdown = `${days} hari lagi`;
      badgeLabel = 'Tenggat Aman';
    } else if (days >= 1) {
      formattedCountdown = `${days} hari ${hours} jam ${minutes} mnt lagi`;
      formattedShortCountdown = `${days} hari tersisa`;
      badgeLabel = 'Mendekati Tenggat (< 3 Hari)';
    } else if (hours >= 1) {
      formattedCountdown = `${hours} jam ${minutes} mnt ${seconds} dtk lagi`;
      formattedShortCountdown = `${hours}j ${minutes}m`;
      badgeLabel = 'Kritis (< 24 Jam)';
    } else {
      formattedCountdown = `${minutes} mnt ${seconds} dtk lagi`;
      formattedShortCountdown = `${minutes}m ${seconds}s`;
      badgeLabel = 'Kritis (< 1 Jam)';
    }
  }

  // Visual styling colors
  let colorScheme = {
    bg: 'bg-emerald-50/80 dark:bg-emerald-950/30',
    text: 'text-emerald-800 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
    badgeText: 'text-emerald-800 dark:text-emerald-300',
    pulse: false
  };

  if (urgencyLevel === 'overdue') {
    colorScheme = {
      bg: 'bg-rose-50/90 dark:bg-rose-950/40',
      text: 'text-rose-900 dark:text-rose-200',
      border: 'border-rose-300 dark:border-rose-800',
      badgeBg: 'bg-rose-600 text-white shadow-xs',
      badgeText: 'text-white font-bold',
      pulse: true
    };
  } else if (urgencyLevel === 'critical') {
    colorScheme = {
      bg: 'bg-red-50/90 dark:bg-red-950/40',
      text: 'text-red-900 dark:text-red-200',
      border: 'border-red-300 dark:border-red-800',
      badgeBg: 'bg-red-500 text-white shadow-xs',
      badgeText: 'text-white font-bold',
      pulse: true
    };
  } else if (urgencyLevel === 'urgent') {
    colorScheme = {
      bg: 'bg-amber-50/90 dark:bg-amber-950/40',
      text: 'text-amber-900 dark:text-amber-200',
      border: 'border-amber-300 dark:border-amber-800',
      badgeBg: 'bg-amber-500 text-white shadow-xs',
      badgeText: 'text-white font-bold',
      pulse: false
    };
  }

  return {
    hasDeadline: true,
    deadlineDate,
    isOverdue,
    isUrgent,
    isCritical,
    urgencyLevel,
    days,
    hours,
    minutes,
    seconds,
    totalHours,
    formattedCountdown,
    formattedShortCountdown,
    formattedDeadlineDate,
    badgeLabel,
    colorScheme
  };
}
