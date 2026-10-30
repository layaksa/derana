import { SurveyActivityLog, ActivityActionType } from '../types/activityLog';
import { UserRole } from '../types/auth';
import { db, isFirebaseAuthenticated } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export const STORAGE_KEY_ACTIVITY_LOGS = 'linguistic_survey_activity_logs_v1';

/**
 * Initial seed activity logs for immediate audit context in admin dashboard
 */
const SEED_ACTIVITY_LOGS: SurveyActivityLog[] = [
  {
    id: 'log_seed_001',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18 mins ago
    surveyId: 'survey_sample_karangwangi',
    surveyTitle: 'Desa Karangwangi - Bahasa Sunda (Cidaun)',
    languageName: 'Bahasa Sunda',
    village: 'Karangwangi',
    regency: 'Cianjur',
    action: 'update_section',
    actionLabel: 'Pembaruan Seksi Swadesh',
    sectionId: 'swadesh',
    sectionName: 'Seksi 1 - Daftar Swadesh (200 Kata)',
    userId: 'user_surveyor_budi',
    userName: 'Budi Santoso, S.Pd.',
    userRole: 'surveyor',
    userEmail: 'budi.surveyor@gmail.com',
    details: 'Menambahkan transkripsi fonetis leksikon #14 "anjing" [aɲd͡ʒiŋ] dan #15 "burung" [burʊŋ] serta melampirkan rekaman audio informan Bapak Dadang.',
    diffSummary: {
      field: 'daftarSwadesh',
      itemsChanged: 4,
      completionDelta: 2.5,
      notes: 'Kelengkapan seksi meningkat menjadi 98%'
    },
    source: 'pwa_offline'
  },
  {
    id: 'log_seed_002',
    timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(), // 1 hr 15 mins ago
    surveyId: 'survey_sample_karangwangi',
    surveyTitle: 'Desa Karangwangi - Bahasa Sunda (Cidaun)',
    languageName: 'Bahasa Sunda',
    village: 'Karangwangi',
    regency: 'Cianjur',
    action: 'update_section',
    actionLabel: 'Pengisian Sastra Lisan',
    sectionId: 'sastra_lisan',
    sectionName: 'Seksi 5 - Sastra Lisan & Folklor',
    userId: 'user_surveyor_budi',
    userName: 'Budi Santoso, S.Pd.',
    userRole: 'surveyor',
    userEmail: 'budi.surveyor@gmail.com',
    details: 'Merekam tuturan mitos "Sasakala Muara Karangwangi" dengan analisis motif otomatis Thompson: Mot. A920.1 (Asal Mula Danau/Muara).',
    diffSummary: {
      field: 'sastraLisan',
      itemsChanged: 1,
      completionDelta: 5.0,
      notes: 'Motif otomatis tervalidasi'
    },
    source: 'web'
  },
  {
    id: 'log_seed_003',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    surveyId: 'survey_sample_rancabuaya',
    surveyTitle: 'Desa Purbayani - Bahasa Sunda Pesisir (Rancabuaya)',
    languageName: 'Bahasa Sunda Pesisir',
    village: 'Purbayani',
    regency: 'Garut Selatan',
    action: 'update_section',
    actionLabel: 'Pembaruan Morfologi & Sintaksis',
    sectionId: 'morfologi',
    sectionName: 'Seksi 3 - Morfologi & Sintaksis',
    userId: 'user_surveyor_siti',
    userName: 'Siti Rahmawati, M.Hum.',
    userRole: 'surveyor',
    userEmail: 'siti.surveyor@gmail.com',
    details: 'Menambahkan 6 paradigma afiksasi verba prefiks {N-} dan reduplikasi dwilingga dengan penanda klitik pesisir Garut.',
    diffSummary: {
      field: 'morfologiSintaksis',
      itemsChanged: 6,
      completionDelta: 4.0
    },
    source: 'web'
  },
  {
    id: 'log_seed_004',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), // 22 hours ago
    surveyId: 'survey_sample_pangandaran',
    surveyTitle: 'Desa Babakan - Bahasa Sunda-Jawa (Banyumasan)',
    languageName: 'Bahasa Sunda-Jawa',
    village: 'Babakan',
    regency: 'Pangandaran',
    action: 'update_metadata',
    actionLabel: 'Verifikasi Titik Koordinat GPS',
    sectionId: 'titikPengamatan',
    sectionName: 'Titik Pengamatan & Informan',
    userId: 'user_surveyor_agus',
    userName: 'Agus Priyanto, M.Hum.',
    userRole: 'surveyor',
    userEmail: 'agus.surveyor@gmail.com',
    details: 'Memperbarui koordinat presisi balai desa ke Lat: -7.6842, Lon: 108.6491 serta mengoreksi usia informan utama (64 tahun).',
    diffSummary: {
      field: 'titikPengamatan',
      itemsChanged: 2,
      notes: 'Akurasi GPS 4 meter'
    },
    source: 'pwa_offline'
  },
  {
    id: 'log_seed_005',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString(), // ~2 days ago
    surveyId: 'survey_sample_cikaso',
    surveyTitle: 'Desa Sumberjaya - Bahasa Sunda Dialek Cikaso',
    languageName: 'Bahasa Sunda',
    village: 'Sumberjaya',
    regency: 'Sukabumi',
    action: 'verify_survey',
    actionLabel: 'Verifikasi Kelayakan Ilmiah',
    sectionId: 'verifikasi',
    sectionName: 'Kurasi & Validasi Data',
    userId: 'user_verifikator_dewi',
    userName: 'Dr. Dewi Sartika, M.Hum.',
    userRole: 'verifikator',
    userEmail: 'dewi.verifikator@gmail.com',
    details: 'Memvalidasi kelengkapan fonem segmental dan suprasegmental serta menyatakan data layak masuk basis dialektometri provinsi.',
    diffSummary: {
      field: 'isVerified',
      notes: 'Disetujui oleh kurator linguistik'
    },
    source: 'web'
  }
];

/**
 * Load all activity logs from localStorage, initializing with seed if empty
 */
export function loadActivityLogs(): SurveyActivityLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVITY_LOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ACTIVITY_LOGS, JSON.stringify(SEED_ACTIVITY_LOGS));
      return SEED_ACTIVITY_LOGS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY_ACTIVITY_LOGS, JSON.stringify(SEED_ACTIVITY_LOGS));
    return SEED_ACTIVITY_LOGS;
  } catch (err) {
    console.error('Failed to load activity logs from storage:', err);
    return SEED_ACTIVITY_LOGS;
  }
}

/**
 * Persist activity logs in localStorage
 */
export function persistActivityLogs(logs: SurveyActivityLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVITY_LOGS, JSON.stringify(logs.slice(0, 500)));
  } catch (err) {
    console.error('Failed to persist activity logs:', err);
  }
}

/**
 * Log a new survey activity, persisting locally and attempting cloud backup
 */
export function logSurveyActivity(params: {
  surveyId: string;
  surveyTitle: string;
  languageName?: string;
  village?: string;
  regency?: string;
  action: ActivityActionType;
  actionLabel?: string;
  sectionId?: string;
  sectionName?: string;
  user: {
    id: string;
    name: string;
    role: UserRole;
    email: string;
  };
  details: string;
  diffSummary?: {
    field?: string;
    itemsChanged?: number;
    completionDelta?: number;
    notes?: string;
  };
  source?: 'web' | 'pwa_offline' | 'cloud_sync';
}): SurveyActivityLog {
  const currentLogs = loadActivityLogs();
  const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const defaultActionLabels: Record<ActivityActionType, string> = {
    create_survey: 'Pembuatan Berkas Survei',
    update_section: 'Penyuntingan Seksi Data',
    update_metadata: 'Pembaruan Metadata / Informan',
    verify_survey: 'Verifikasi Data Survei',
    unverify_survey: 'Pembatalan Verifikasi',
    delete_survey: 'Penghapusan Berkas Survei',
    duplicate_survey: 'Penggandaan Data Survei',
    import_survey: 'Impor Berkas Survei'
  };

  const newLog: SurveyActivityLog = {
    id,
    timestamp: new Date().toISOString(),
    surveyId: params.surveyId,
    surveyTitle: params.surveyTitle,
    languageName: params.languageName,
    village: params.village,
    regency: params.regency,
    action: params.action,
    actionLabel: params.actionLabel || defaultActionLabels[params.action] || 'Perubahan Data',
    sectionId: params.sectionId,
    sectionName: params.sectionName,
    userId: params.user.id,
    userName: params.user.name,
    userRole: params.user.role,
    userEmail: params.user.email,
    details: params.details,
    diffSummary: params.diffSummary,
    source: params.source || (navigator.onLine ? 'web' : 'pwa_offline')
  };

  const updatedLogs = [newLog, ...currentLogs];
  persistActivityLogs(updatedLogs);

  // Sync to Cloud Firestore if online and authenticated
  if (navigator.onLine && isFirebaseAuthenticated()) {
    try {
      const docRef = doc(db, 'activity_logs', id);
      setDoc(docRef, newLog, { merge: true }).catch(err => {
        console.debug('[ActivityLog] Firestore upload non-fatal warning:', err);
      });
    } catch (e) {
      console.debug('[ActivityLog] Firestore sync error:', e);
    }
  }

  // Notify UI listeners (e.g. PengaturanBentoView if currently mounted)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('derana_activity_logged', { detail: newLog }));
  }

  return newLog;
}

/**
 * Clear all activity logs (Admin action)
 */
export function clearActivityLogs(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_ACTIVITY_LOGS);
  } catch (err) {
    console.error('Failed to clear activity logs:', err);
  }
}

/**
 * Export activity logs as formatted JSON file
 */
export function exportActivityLogsJSON(logs: SurveyActivityLog[]): void {
  const payload = {
    app: 'Sistem Pemetaan Bahasa & Dialektometri - Derana',
    module: 'Audit Trail & Log Aktivitas Surveyor',
    exportedAt: new Date().toISOString(),
    totalEntries: logs.length,
    logs
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Log_Aktivitas_Surveyor_${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export activity logs as CSV file
 */
export function exportActivityLogsCSV(logs: SurveyActivityLog[]): void {
  const headers = [
    'Timestamp',
    'ID Log',
    'Aksi',
    'Nama Surveyor',
    'Peran',
    'Email',
    'Judul Survei',
    'Bahasa',
    'Desa',
    'Kabupaten',
    'Seksi',
    'Rincian Perubahan',
    'Sumber'
  ];

  const escapeCSV = (str: string = '') => `"${str.replace(/"/g, '""')}"`;

  const rows = logs.map(l => [
    escapeCSV(l.timestamp),
    escapeCSV(l.id),
    escapeCSV(l.actionLabel),
    escapeCSV(l.userName),
    escapeCSV(l.userRole),
    escapeCSV(l.userEmail),
    escapeCSV(l.surveyTitle),
    escapeCSV(l.languageName || ''),
    escapeCSV(l.village || ''),
    escapeCSV(l.regency || ''),
    escapeCSV(l.sectionName || l.sectionId || ''),
    escapeCSV(l.details),
    escapeCSV(l.source || 'web')
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Log_Aktivitas_Surveyor_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
