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
      notes: 'Kelengkapan seksi meningkat menjadi 98%',
      before: '#14 "anjing": (kosong); #15 "burung": (kosong); audio: 0 berkas',
      after: '#14 "anjing": [aɲd͡ʒiŋ]; #15 "burung": [burʊŋ]; audio: "anjing_cidaun.mp3" (Bpk Dadang)'
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
      notes: 'Motif otomatis tervalidasi',
      before: 'judul: (belum dicatat); motifThompson: null; audio: 00:00',
      after: 'judul: "Sasakala Muara Karangwangi"; motif: Mot. A920.1 (Asal Mula Danau); audio: 08:42'
    },
    source: 'web'
  },
  {
    id: 'log_seed_002b',
    timestamp: new Date(Date.now() - 1000 * 60 * 135).toISOString(), // ~2.2 hrs ago
    surveyId: 'survey_sample_karangwangi',
    surveyTitle: 'Desa Karangwangi - Bahasa Sunda (Cidaun)',
    languageName: 'Bahasa Sunda',
    village: 'Karangwangi',
    regency: 'Cianjur',
    action: 'verify_survey',
    actionLabel: 'Validasi Kurator Linguistik',
    sectionId: 'verifikasi',
    sectionName: 'Seksi 16 - Pengesahan',
    userId: 'user_verifikator_hendra',
    userName: 'Dr. Hendra Saputra, M.Hum.',
    userRole: 'verifikator',
    userEmail: 'hendra.linguist@kemdikbud.go.id',
    details: 'Memverifikasi akurasi transkripsi fonetis leksikal 200 Swadesh dan mengonfirmasi status kebahasaan Sunda Pesisir Cidaun.',
    diffSummary: {
      field: 'isVerified',
      notes: 'Survei disahkan masuk korpus dialektometri',
      before: 'isVerified: false (Draft Lapangan / Belum Disahkan)',
      after: 'isVerified: true (Disahkan oleh Dr. Hendra Saputra, M.Hum.)'
    },
    source: 'web'
  },
  {
    id: 'log_seed_002c',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hrs ago
    surveyId: 'survey_sample_karangwangi',
    surveyTitle: 'Desa Karangwangi - Bahasa Sunda (Cidaun)',
    languageName: 'Bahasa Sunda',
    village: 'Karangwangi',
    regency: 'Cianjur',
    action: 'update_metadata',
    actionLabel: 'Pembaruan Data Informan',
    sectionId: 'titikPengamatan',
    sectionName: 'Seksi 0 - Titik Pengamatan & Informan',
    userId: 'user_surveyor_budi',
    userName: 'Budi Santoso, S.Pd.',
    userRole: 'surveyor',
    userEmail: 'budi.surveyor@gmail.com',
    details: 'Melengkapi profil narasumber ke-3: Ibu Hj. Siti (62 th, penutur asli tidak pernah merantau).',
    diffSummary: {
      field: 'narasumberList',
      itemsChanged: 1,
      completionDelta: 3.0,
      before: 'informanCount: 2 orang; narasumber[2]: null (belum terisi)',
      after: 'informanCount: 3 orang; narasumber[2]: "Ibu Hj. Siti" (62 th, penutur asli)'
    },
    source: 'pwa_offline'
  },
  {
    id: 'log_seed_002d',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18 hrs ago
    surveyId: 'survey_sample_karangwangi',
    surveyTitle: 'Desa Karangwangi - Bahasa Sunda (Cidaun)',
    languageName: 'Bahasa Sunda',
    village: 'Karangwangi',
    regency: 'Cianjur',
    action: 'create_survey',
    actionLabel: 'Pembuatan Titik Survei Baru',
    sectionId: 'titikPengamatan',
    sectionName: 'Seksi 0 - Titik Pengamatan',
    userId: 'user_surveyor_budi',
    userName: 'Budi Santoso, S.Pd.',
    userRole: 'surveyor',
    userEmail: 'budi.surveyor@gmail.com',
    details: 'Inisiasi titik pengamatan TP-01 Karangwangi Cidaun Cianjur menggunakan instrumen 16 seksi kebahasaan.',
    diffSummary: {
      field: 'surveyRecord',
      before: '(Belum ada berkas survei)',
      after: 'surveyId: "survey_sample_karangwangi" (TP-01 Karangwangi Cidaun Cianjur)'
    },
    source: 'pwa_offline'
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
      completionDelta: 4.0,
      before: 'afiksasi: {N-} dasar (tanpa klitik pesisir Garut)',
      after: 'afiksasi: 6 paradigma prefiks {N-} + reduplikasi dwilingga pesisir Garut'
    },
    source: 'web'
  },
  {
    id: 'log_seed_003b',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
    surveyId: 'survey_sample_rancabuaya',
    surveyTitle: 'Desa Purbayani - Bahasa Sunda Pesisir (Rancabuaya)',
    languageName: 'Bahasa Sunda Pesisir',
    village: 'Purbayani',
    regency: 'Garut Selatan',
    action: 'update_section',
    actionLabel: 'Perekaman Audio Kosakata Budaya',
    sectionId: 'budaya',
    sectionName: 'Seksi 2 - Kosakata Budaya Pesisir',
    userId: 'user_surveyor_siti',
    userName: 'Siti Rahmawati, M.Hum.',
    userRole: 'surveyor',
    userEmail: 'siti.surveyor@gmail.com',
    details: 'Mengunggah 12 audio istilah nelayan pesisir Rancabuaya: "ngajaring", "parahu jungku", "rombongan jukung".',
    diffSummary: {
      field: 'kosakataBudaya',
      itemsChanged: 12,
      completionDelta: 5.5,
      before: 'kosakataBudayaPesisir: 0 istilah audio terlampir',
      after: 'kosakataBudayaPesisir: 12 audio istilah nelayan ("ngajaring", "parahu jungku")'
    },
    source: 'web'
  },
  {
    id: 'log_seed_003c',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), // 20 hours ago
    surveyId: 'survey_sample_rancabuaya',
    surveyTitle: 'Desa Purbayani - Bahasa Sunda Pesisir (Rancabuaya)',
    languageName: 'Bahasa Sunda Pesisir',
    village: 'Purbayani',
    regency: 'Garut Selatan',
    action: 'verify_survey',
    actionLabel: 'Verifikasi Data Lapangan',
    sectionId: 'verifikasi',
    sectionName: 'Kurasi Ilmiah',
    userId: 'user_verifikator_hendra',
    userName: 'Dr. Hendra Saputra, M.Hum.',
    userRole: 'verifikator',
    userEmail: 'hendra.linguist@kemdikbud.go.id',
    details: 'Pengesahan verifikasi titik survei Desa Purbayani Rancabuaya tuntas 100%.',
    diffSummary: {
      field: 'isVerified',
      notes: 'Disahkan resmi',
      before: 'isVerified: false (Menunggu Verifikasi Validator)',
      after: 'isVerified: true (Tervalidasi 100% oleh Dr. Hendra Saputra)'
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
      notes: 'Akurasi GPS 4 meter',
      before: 'koordinat: Lat: -7.68, Lon: 108.64; usiaInforman: 60 th',
      after: 'koordinat: Lat: -7.6842, Lon: 108.6491; usiaInforman: 64 th'
    },
    source: 'pwa_offline'
  },
  {
    id: 'log_seed_004b',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), // 30 hours ago
    surveyId: 'survey_sample_pangandaran',
    surveyTitle: 'Desa Babakan - Bahasa Sunda-Jawa (Banyumasan)',
    languageName: 'Bahasa Sunda-Jawa',
    village: 'Babakan',
    regency: 'Pangandaran',
    action: 'update_section',
    actionLabel: 'Pengisian Glos Swadesh Kontak Sunda-Jawa',
    sectionId: 'swadesh',
    sectionName: 'Seksi 1 - Daftar Swadesh',
    userId: 'user_surveyor_agus',
    userName: 'Agus Priyanto, M.Hum.',
    userRole: 'surveyor',
    userEmail: 'agus.surveyor@gmail.com',
    details: 'Mencatat interferensi leksikal Jawa Banyumasan pada leksikon kata ganti: "inyong" [iɲoŋ] dan "rika" [rika].',
    diffSummary: {
      field: 'daftarSwadesh',
      itemsChanged: 15,
      completionDelta: 8.0,
      before: 'kataGanti: [abdi], [anjeun] (Sunda Standar)',
      after: 'kataGanti: [iɲoŋ] (inyong), [rika] (rika) (Kontak Sunda-Banyumasan)'
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
      notes: 'Disetujui oleh kurator linguistik',
      before: 'isVerified: false (Pemeriksaan Kurator)',
      after: 'isVerified: true (Layak masuk basis dialektometri provinsi)'
    },
    source: 'web'
  },
  {
    id: 'log_seed_005b',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(), // ~2.2 days ago
    surveyId: 'survey_sample_cikaso',
    surveyTitle: 'Desa Sumberjaya - Bahasa Sunda Dialek Cikaso',
    languageName: 'Bahasa Sunda',
    village: 'Sumberjaya',
    regency: 'Sukabumi',
    action: 'update_section',
    actionLabel: 'Pembaruan Seksi Morfologi',
    sectionId: 'morfologi',
    sectionName: 'Seksi 3 - Morfologi',
    userId: 'user_surveyor_budi',
    userName: 'Budi Santoso, S.Pd.',
    userRole: 'surveyor',
    userEmail: 'budi.surveyor@gmail.com',
    details: 'Menambahkan data afiksasi bentuk pasif ka-an dan pa-an dialek Cikaso Sukabumi.',
    diffSummary: {
      field: 'morfologi',
      itemsChanged: 5,
      completionDelta: 3.5,
      before: 'bentukPasif: (belum lengkap)',
      after: 'bentukPasif: ka-an dan pa-an dialek Cikaso Sukabumi (5 entri)'
    },
    source: 'web'
  }
];

/**
 * Helper to ensure an activity log has sensible before and after values for historical diff inspection
 */
export function ensureBeforeAfterDiff(log: SurveyActivityLog): { before: string; after: string } {
  if (log.diffSummary?.before !== undefined && log.diffSummary?.after !== undefined) {
    return {
      before: typeof log.diffSummary.before === 'object' ? JSON.stringify(log.diffSummary.before) : String(log.diffSummary.before),
      after: typeof log.diffSummary.after === 'object' ? JSON.stringify(log.diffSummary.after) : String(log.diffSummary.after)
    };
  }

  if (log.beforeValue && log.afterValue) {
    return { before: log.beforeValue, after: log.afterValue };
  }

  // Synthesize realistic diff context based on action and details
  if (log.action === 'verify_survey') {
    return {
      before: 'isVerified: false (Draft Lapangan / Belum Disahkan)',
      after: `isVerified: true (Disahkan oleh ${log.userName} [${log.userRole}])`
    };
  }
  if (log.action === 'unverify_survey') {
    return {
      before: 'isVerified: true (Tervalidasi Resmi)',
      after: 'isVerified: false (Pemeriksaan Ulang / Memerlukan Revisi Lapangan)'
    };
  }
  if (log.action === 'create_survey') {
    return {
      before: '(Belum ada berkas survei)',
      after: `Inisiasi titik survei: ${log.surveyTitle} (${log.surveyId})`
    };
  }
  if (log.action === 'duplicate_survey') {
    return {
      before: `Sumber: ${log.surveyId}`,
      after: `Duplikat baru tersimpan di akun ${log.userName}`
    };
  }
  if (log.action === 'delete_survey') {
    return {
      before: `Berkas aktif: ${log.surveyTitle}`,
      after: '(Berkas telah dihapus dari sistem)'
    };
  }
  if (log.action === 'import_survey') {
    return {
      before: '(Eksternal / Berkas JSON)',
      after: `Impor berkas sukses: ${log.surveyTitle} (${log.details})`
    };
  }

  const field = log.diffSummary?.field || log.sectionId || 'kolom';
  const delta = log.diffSummary?.completionDelta;
  const items = log.diffSummary?.itemsChanged;

  const beforeStr = items 
    ? `${field}: data awal belum lengkap (${items} butir kosong/draft)`
    : `${field}: data sebelumnya belum dimutakhirkan`;
  
  const afterStr = log.details 
    ? log.details 
    : (delta ? `${field}: progres kelengkapan bertambah +${delta}%` : `${field}: dimutakhirkan oleh ${log.userName}`);

  return {
    before: beforeStr,
    after: afterStr
  };
}

/**
 * Filter and fetch the latest audit trail logs for a specific survey
 */
export function getAuditTrailForSurvey(surveyId: string, limitCount: number = 5): SurveyActivityLog[] {
  const allLogs = loadActivityLogs();
  const filtered = allLogs.filter(log => log.surveyId === surveyId);
  // Sort descending by timestamp
  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return filtered.slice(0, limitCount);
}

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
      // Ensure all loaded logs have before and after diff values populated and are sorted newest first
      const mapped = parsed.map((log: SurveyActivityLog) => {
        if (!log.diffSummary?.before || !log.diffSummary?.after) {
          const diff = ensureBeforeAfterDiff(log);
          return {
            ...log,
            diffSummary: {
              ...(log.diffSummary || {}),
              before: log.diffSummary?.before || diff.before,
              after: log.diffSummary?.after || diff.after
            }
          };
        }
        return log;
      });
      mapped.sort((a: SurveyActivityLog, b: SurveyActivityLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return mapped;
    }
    const sortedSeed = [...SEED_ACTIVITY_LOGS].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    localStorage.setItem(STORAGE_KEY_ACTIVITY_LOGS, JSON.stringify(sortedSeed));
    return sortedSeed;
  } catch (err) {
    console.error('Failed to load activity logs from storage:', err);
    return [...SEED_ACTIVITY_LOGS].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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
    before?: any;
    after?: any;
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
