import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  ShieldCheck, 
  MessageSquare, 
  MapPin, 
  X, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { InAppNotification } from '../../types/notification';
import { 
  loadInAppNotifications, 
  markNotificationAsRead, 
  NOTIFICATION_EVENT_NAME 
} from '../../utils/notificationStorage';
import { AppUser } from '../../types/auth';

interface NotificationToastBannerProps {
  currentUser: AppUser | null;
  onSelectSurvey?: (surveyId: string) => void;
  onSwitchToEditor?: () => void;
  onOpenAssignments?: () => void;
}

export const NotificationToastBanner: React.FC<NotificationToastBannerProps> = ({
  currentUser,
  onSelectSurvey,
  onSwitchToEditor,
  onOpenAssignments
}) => {
  const [activeToast, setActiveToast] = useState<InAppNotification | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  const checkLatestNotification = () => {
    const list = loadInAppNotifications(currentUser);
    const unread = list.filter(n => !n.isRead);
    if (unread.length > 0 && !isDismissed) {
      setActiveToast(unread[0]);
    } else {
      setActiveToast(null);
    }
  };

  useEffect(() => {
    checkLatestNotification();
    const handleEvent = () => {
      setIsDismissed(false);
      checkLatestNotification();
    };
    window.addEventListener(NOTIFICATION_EVENT_NAME, handleEvent);
    return () => {
      window.removeEventListener(NOTIFICATION_EVENT_NAME, handleEvent);
    };
  }, [currentUser, isDismissed]);

  if (!activeToast) return null;

  const handleAction = () => {
    markNotificationAsRead(activeToast.id);
    setActiveToast(null);

    if (activeToast.surveyId && onSelectSurvey) {
      onSelectSurvey(activeToast.surveyId);
      if (onSwitchToEditor) {
        onSwitchToEditor();
      }
    } else if (activeToast.type === 'region_assignment' && onOpenAssignments) {
      onOpenAssignments();
    }
  };

  const handleDismiss = () => {
    markNotificationAsRead(activeToast.id);
    setIsDismissed(true);
    setActiveToast(null);
  };

  const getBorderColor = () => {
    switch (activeToast.type) {
      case 'survey_validated':
        return 'border-emerald-500 bg-emerald-50/95 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-100';
      case 'admin_comment':
        return 'border-blue-500 bg-blue-50/95 dark:bg-blue-950/90 text-blue-900 dark:text-blue-100';
      case 'region_assignment':
        return 'border-purple-500 bg-purple-50/95 dark:bg-purple-950/90 text-purple-900 dark:text-purple-100';
      default:
        return 'border-slate-400 bg-white/95 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100';
    }
  };

  const getIcon = () => {
    switch (activeToast.type) {
      case 'survey_validated':
        return <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case 'admin_comment':
        return <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />;
      case 'region_assignment':
        return <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full p-4 rounded-2xl shadow-2xl backdrop-blur-md border-l-4 border transition-all animate-in slide-in-from-bottom-5 duration-300 ${getBorderColor()}">
      <div className="flex items-start gap-3">
        <div className="p-1 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-2xs mt-0.5">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
              {activeToast.title}
            </h5>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 cursor-pointer"
              title="Tutup pemberitahuan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-snug line-clamp-2">
            {activeToast.message}
          </p>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-500 font-mono">
              Baru saja
            </span>

            <button
              type="button"
              onClick={handleAction}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 shadow-2xs cursor-pointer transition-opacity"
            >
              <span>{activeToast.surveyId ? 'Buka Berkas' : 'Lihat Detail'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
