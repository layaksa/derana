import { InAppNotification, NotificationType } from '../types/notification';
import { AppUser } from '../types/auth';

export const STORAGE_KEY_NOTIFICATIONS = 'linguistic_in_app_notifications_v1';
export const NOTIFICATION_EVENT_NAME = 'linguistic_notification_event';

const SEED_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'notif_seed_001',
    type: 'survey_validated',
    title: 'Survei Berhasil Tervalidasi',
    message: 'Survei Desa Karangwangi - Bahasa Sunda (Cidaun) telah diverifikasi dan disetujui oleh Derana Admin.',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 mins ago
    isRead: false,
    surveyId: 'survey_sample_karangwangi',
    surveyTitle: 'Desa Karangwangi - Bahasa Sunda (Cidaun)',
    authorId: 'user_admin_derana',
    authorName: 'Derana Admin (Koordinator Riset)',
    authorRole: 'admin',
    targetUserId: 'all',
    metadata: {
      verificationStatus: true
    }
  },
  {
    id: 'notif_seed_002',
    type: 'admin_comment',
    title: 'Catatan Review Baru dari Verifikator',
    message: 'Dr. Dewi Sartika, M.Hum. menambahkan catatan review pada berkas survei Desa Cikadu: "Harap periksa kembali rekaman audio Swadesh #15-20 informan Bapak Dadang karena terdapat noise angin latar."',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hrs ago
    isRead: false,
    surveyId: 'survey_sample_cikadu',
    surveyTitle: 'Desa Cikadu - Bahasa Sunda (Cianjur Selatan)',
    authorId: 'user_verifikator_dewi',
    authorName: 'Dr. Dewi Sartika, M.Hum.',
    authorRole: 'verifikator',
    targetUserId: 'all',
    metadata: {
      sectionName: 'Seksi 15 - Daftar Kosakata Swadesh',
      commentText: 'Harap periksa kembali rekaman audio Swadesh #15-20 informan Bapak Dadang karena terdapat noise angin latar.'
    }
  },
  {
    id: 'notif_seed_003',
    type: 'region_assignment',
    title: 'Penugasan Wilayah Riset Baru',
    message: 'Admin telah menetapkan target penugasan riset geolinguistik baru di Kabupaten Brebes & Cilacap (Zona Perbatasan Sunda-Jawa) dengan batas waktu 15 November 2026.',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hrs ago
    isRead: false,
    authorId: 'user_admin_derana',
    authorName: 'Derana Admin (Koordinator Riset)',
    authorRole: 'admin',
    targetUserId: 'user_surveyor_siti',
    metadata: {
      region: 'Kabupaten Brebes & Cilacap (Jawa Tengah)',
      language: 'Bahasa Jawa & Sunda (Dialek Brebes)',
      deadline: '2026-11-15',
      priority: 'tinggi'
    }
  }
];

export function dispatchNotificationEvent(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT_NAME));
  }
}

/**
 * Load all in-app notifications
 */
export function loadInAppNotifications(currentUser?: AppUser | null): InAppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    let list: InAppNotification[] = [];
    if (raw) {
      list = JSON.parse(raw);
    } else {
      list = [...SEED_NOTIFICATIONS];
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(list));
    }

    if (!currentUser) return list;

    // Filter for current user or broadcast ('all' or matching userId/role)
    return list.filter(n => {
      if (!n.targetUserId || n.targetUserId === 'all') return true;
      if (n.targetUserId === currentUser.id) return true;
      if (currentUser.role === 'admin' || currentUser.role === 'verifikator') return true;
      return false;
    });
  } catch (err) {
    console.warn('Failed to load notifications:', err);
    return SEED_NOTIFICATIONS;
  }
}

/**
 * Add a new notification
 */
export function addInAppNotification(
  input: Omit<InAppNotification, 'id' | 'timestamp' | 'isRead'>
): InAppNotification {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    const existing: InAppNotification[] = raw ? JSON.parse(raw) : [...SEED_NOTIFICATIONS];

    const newNotif: InAppNotification = {
      ...input,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    const updated = [newNotif, ...existing];
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated.slice(0, 100))); // Keep last 100
    dispatchNotificationEvent();
    return newNotif;
  } catch (err) {
    console.error('Failed to add in-app notification:', err);
    const fallback: InAppNotification = {
      ...input,
      id: `notif_${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    return fallback;
  }
}

/**
 * Mark a single notification as read
 */
export function markNotificationAsRead(id: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (!raw) return;
    const existing: InAppNotification[] = JSON.parse(raw);
    const updated = existing.map(n => n.id === id ? { ...n, isRead: true } : n);
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));
    dispatchNotificationEvent();
  } catch (err) {
    console.warn('Failed to mark notification as read:', err);
  }
}

/**
 * Mark all notifications as read for current user scope
 */
export function markAllNotificationsAsRead(userId?: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (!raw) return;
    const existing: InAppNotification[] = JSON.parse(raw);
    const updated = existing.map(n => {
      if (!userId || n.targetUserId === 'all' || n.targetUserId === userId) {
        return { ...n, isRead: true };
      }
      return n;
    });
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));
    dispatchNotificationEvent();
  } catch (err) {
    console.warn('Failed to mark all as read:', err);
  }
}

/**
 * Delete a notification
 */
export function deleteNotification(id: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (!raw) return;
    const existing: InAppNotification[] = JSON.parse(raw);
    const updated = existing.filter(n => n.id !== id);
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));
    dispatchNotificationEvent();
  } catch (err) {
    console.warn('Failed to delete notification:', err);
  }
}

/**
 * Clear all notifications
 */
export function clearAllNotifications(): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify([]));
    dispatchNotificationEvent();
  } catch (err) {
    console.warn('Failed to clear notifications:', err);
  }
}
