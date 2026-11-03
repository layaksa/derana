import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  ShieldCheck, 
  MessageSquare, 
  MapPin, 
  AlertTriangle, 
  Info, 
  Check, 
  ExternalLink,
  Clock,
  X
} from 'lucide-react';
import { InAppNotification, NotificationType } from '../../types/notification';
import { 
  loadInAppNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification, 
  clearAllNotifications,
  NOTIFICATION_EVENT_NAME 
} from '../../utils/notificationStorage';
import { AppUser } from '../../types/auth';

interface NotificationBellDropdownProps {
  currentUser: AppUser | null;
  onSelectSurvey?: (surveyId: string) => void;
  onSwitchToEditor?: () => void;
  onOpenAssignments?: () => void;
}

export const NotificationBellDropdown: React.FC<NotificationBellDropdownProps> = ({
  currentUser,
  onSelectSurvey,
  onSwitchToEditor,
  onOpenAssignments
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>(() => 
    loadInAppNotifications(currentUser)
  );
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'validation' | 'comment' | 'assignment'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Reload notifications on user switch or custom event
  const reloadNotifications = () => {
    setNotifications(loadInAppNotifications(currentUser));
  };

  useEffect(() => {
    reloadNotifications();
    window.addEventListener(NOTIFICATION_EVENT_NAME, reloadNotifications);
    return () => {
      window.removeEventListener(NOTIFICATION_EVENT_NAME, reloadNotifications);
    };
  }, [currentUser]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'validation') return n.type === 'survey_validated';
    if (activeTab === 'comment') return n.type === 'admin_comment';
    if (activeTab === 'assignment') return n.type === 'region_assignment';
    return true;
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'survey_validated':
        return <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'admin_comment':
        return <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'region_assignment':
        return <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'deadline_warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <Info className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  const getNotificationBg = (type: NotificationType, isRead: boolean) => {
    if (isRead) return 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800';
    switch (type) {
      case 'survey_validated':
        return 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60';
      case 'admin_comment':
        return 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/60';
      case 'region_assignment':
        return 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/60';
      case 'deadline_warning':
        return 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60';
      default:
        return 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    try {
      const diffMs = Date.now() - new Date(timestamp).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Baru saja';
      if (diffMins < 60) return `${diffMins} mnt lalu`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} jam lalu`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} hari lalu`;
    } catch {
      return timestamp;
    }
  };

  const handleNotificationClick = (notif: InAppNotification) => {
    if (!notif.isRead) {
      markNotificationAsRead(notif.id);
    }
    if (notif.surveyId && onSelectSurvey) {
      onSelectSurvey(notif.surveyId);
      if (onSwitchToEditor) {
        onSwitchToEditor();
      }
      setIsOpen(false);
    } else if (notif.type === 'region_assignment' && onOpenAssignments) {
      onOpenAssignments();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        id="btn-inapp-notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl border transition-all cursor-pointer shadow-2xs ${
          isOpen
            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 ring-2 ring-blue-400/40'
            : unreadCount > 0
            ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-slate-100'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
        }`}
        title={`Notifikasi Sistem (${unreadCount} belum dibaca)`}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-rose-600 text-white font-bold text-[9px] shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  Pemberitahuan Sistem
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua notifikasi telah dibaca'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllNotificationsAsRead(currentUser?.id)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 cursor-pointer transition-colors"
                  title="Tandai semua sebagai sudah dibaca"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>Tandai Semua</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-2 border-b border-slate-100 dark:border-slate-800 overflow-x-auto text-[10px] font-semibold bg-white dark:bg-slate-900 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                activeTab === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Semua ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('unread')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                activeTab === 'unread'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Belum Dibaca ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('validation')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                activeTab === 'validation'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Validasi
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('comment')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                activeTab === 'comment'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Komentar
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('assignment')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                activeTab === 'assignment'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Penugasan
            </button>
          </div>

          {/* Notification List Scroll Area */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2 space-y-1.5 scrollbar-thin">
            {filteredNotifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
                <Bell className="w-7 h-7 mx-auto text-slate-300 dark:text-slate-700" />
                <p className="font-medium">Tidak ada notifikasi di kategori ini</p>
                <p className="text-[10px] text-slate-400">Pemberitahuan perubahan status survei, catatan review, dan wilayah riset akan muncul di sini.</p>
              </div>
            ) : (
              filteredNotifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer relative group text-xs space-y-1.5 ${getNotificationBg(notif.type, notif.isRead)}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white text-[11px] leading-tight">
                        {notif.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {formatTimeAgo(notif.timestamp)}
                      </span>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {notif.message}
                  </p>

                  {/* Metadata & Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100/80 dark:border-slate-800/80 text-[10px]">
                    <div className="text-slate-400 truncate max-w-[200px]">
                      {notif.surveyTitle ? `Berkas: ${notif.surveyTitle}` : notif.authorName ? `Oleh: ${notif.authorName}` : ''}
                    </div>

                    <div className="flex items-center gap-1.5 opacity-90">
                      {notif.surveyId && (
                        <span className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-0.5">
                          <span>Buka</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                        title="Hapus notifikasi"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">
                Total {notifications.length} notifikasi
              </span>
              <button
                type="button"
                onClick={clearAllNotifications}
                className="text-slate-500 hover:text-rose-600 font-medium cursor-pointer"
              >
                Bersihkan Semua
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
