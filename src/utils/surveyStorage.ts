import { InstrumenPemetaanBahasaData, SurveyRecord } from '../types/linguistic';
import { 
  getEmptySurveyData, 
  getSampleSurveyData,
  getSampleSurveyCikaso,
  getSampleSurveyRancabuaya,
  getSampleSurveyPangandaran
} from '../data/sampleSurveyData';
import { getSectionProgressDetails } from './calculations';
import { AppUser, UserRole } from '../types/auth';
import { saveSurveyToFirestore, deleteSurveyFromFirestore, isFirebaseAuthenticated } from '../lib/firebase';
import { offlineSyncManager } from './offlineSyncManager';

export const STORAGE_KEY_SURVEYS = 'linguistic_mapping_surveys_collection_v2';
export const STORAGE_KEY_LEGACY = 'linguistic_mapping_survey_data_v1';
export const STORAGE_KEY_ACTIVE_ID = 'linguistic_mapping_active_survey_id_v2';

/**
 * Generate human-readable title based on Titik Pengamatan
 */
export function generateSurveyTitle(data: InstrumenPemetaanBahasaData, customTitle?: string): string {
  if (customTitle && customTitle.trim()) {
    return customTitle.trim();
  }
  const desa = data.titikPengamatan?.namaDesa?.trim();
  const bahasa = data.titikPengamatan?.bahasaDigunakan?.trim();
  const kec = data.titikPengamatan?.kecamatan?.trim();

  if (desa && bahasa) {
    return `Desa ${desa} - ${bahasa}${kec ? ` (${kec})` : ''}`;
  } else if (desa) {
    return `Survei Desa ${desa}${kec ? `, Kec. ${kec}` : ''}`;
  } else if (bahasa) {
    return `Survei Bahasa ${bahasa}`;
  }
  return `Formulir Survei #${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}`;
}

/**
 * Create a full SurveyRecord from data with calculated metrics
 */
export function createRecordFromData(
  id: string,
  data: InstrumenPemetaanBahasaData,
  options?: {
    customTitle?: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    createdByName?: string;
    createdByEmail?: string;
    createdByRole?: UserRole;
    isVerified?: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
  }
): SurveyRecord {
  const { score, total, percentage } = getSectionProgressDetails(data);
  const now = new Date().toISOString();

  const record: SurveyRecord = {
    id,
    title: generateSurveyTitle(data, options?.customTitle),
    desa: data.titikPengamatan?.namaDesa || '',
    bahasa: data.titikPengamatan?.bahasaDigunakan || '',
    kecamatan: data.titikPengamatan?.kecamatan || '',
    kabupatenKota: data.titikPengamatan?.kabupatenKota || '',
    provinsi: data.titikPengamatan?.provinsi || '',
    createdAt: options?.createdAt || now,
    updatedAt: options?.updatedAt || now,
    data,
    progress: percentage,
    completedSectionsCount: score,
    totalSectionsCount: total,
    isVerified: options?.isVerified ?? false
  };

  if (options?.createdBy) record.createdBy = options.createdBy;
  if (options?.createdByName) record.createdByName = options.createdByName;
  if (options?.createdByEmail) record.createdByEmail = options.createdByEmail;
  if (options?.createdByRole) record.createdByRole = options.createdByRole;
  if (options?.verifiedBy) record.verifiedBy = options.verifiedBy;
  if (options?.verifiedAt) record.verifiedAt = options.verifiedAt;

  return record;
}

/**
 * Get all surveys with automatic migration and seed fallbacks
 */
export function loadAllSurveys(): SurveyRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SURVEYS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Re-verify progress calculations in case data structure updated
        const updatedParsed = parsed.map((item: any) => {
          if (item && item.data) {
            const { score, total, percentage } = getSectionProgressDetails(item.data);
            return {
              ...item,
              title: item.title || generateSurveyTitle(item.data),
              desa: item.data?.titikPengamatan?.namaDesa || item.desa || '',
              bahasa: item.data?.titikPengamatan?.bahasaDigunakan || item.bahasa || '',
              kecamatan: item.data?.titikPengamatan?.kecamatan || item.kecamatan || '',
              kabupatenKota: item.data?.titikPengamatan?.kabupatenKota || item.kabupatenKota || '',
              provinsi: item.data?.titikPengamatan?.provinsi || item.provinsi || '',
              progress: percentage,
              completedSectionsCount: score,
              totalSectionsCount: total
            };
          }
          return item;
        });

        // If only the single Karangwangi sample exists, augment with the other 3 regional survey points
        if (updatedParsed.length === 1 && updatedParsed[0].id === 'survey_sample_karangwangi') {
          const cikaso = createRecordFromData('survey_sample_cikaso', getSampleSurveyCikaso(), {
            customTitle: 'Desa Cikaso - Bahasa Sunda (Priangan Kidul)',
            createdBy: 'user_surveyor_budi',
            createdByName: 'Budi Santoso, S.S.',
            isVerified: true,
            verifiedBy: 'Dr. Hendra Saputra, M.Hum.',
            verifiedAt: '2026-03-10T14:20:00.000Z'
          });
          const rancabuaya = createRecordFromData('survey_sample_rancabuaya', getSampleSurveyRancabuaya(), {
            customTitle: 'Desa Rancabuaya - Bahasa Sunda (Pesisir Garut)',
            createdBy: 'user_surveyor_siti',
            createdByName: 'Siti Rahmawati, S.Pd.',
            isVerified: true,
            verifiedBy: 'Dr. Hendra Saputra, M.Hum.',
            verifiedAt: '2026-03-10T14:20:00.000Z'
          });
          const pangandaran = createRecordFromData('survey_sample_pangandaran', getSampleSurveyPangandaran(), {
            customTitle: 'Desa Babakan - Bahasa Sunda-Jawa (Banyumasan)',
            createdBy: 'user_surveyor_agus',
            createdByName: 'Agus Priyanto, M.Hum.',
            isVerified: true,
            verifiedBy: 'Dr. Hendra Saputra, M.Hum.',
            verifiedAt: '2026-03-10T14:20:00.000Z'
          });
          const augmented = [updatedParsed[0], cikaso, rancabuaya, pangandaran];
          localStorage.setItem(STORAGE_KEY_SURVEYS, JSON.stringify(augmented));
          return augmented;
        }

        return updatedParsed;
      }
    }

    // Check legacy single-form storage
    const legacyRaw = localStorage.getItem(STORAGE_KEY_LEGACY);
    if (legacyRaw) {
      try {
        const legacyData = JSON.parse(legacyRaw) as InstrumenPemetaanBahasaData;
        const legacyRecord = createRecordFromData(
          `survey_migrated_${Date.now()}`,
          legacyData,
          { customTitle: generateSurveyTitle(legacyData) || 'Survei Tersimpan Sebelumnya' }
        );
        const migratedList = [legacyRecord];
        localStorage.setItem(STORAGE_KEY_SURVEYS, JSON.stringify(migratedList));
        localStorage.setItem(STORAGE_KEY_ACTIVE_ID, legacyRecord.id);
        return migratedList;
      } catch (err) {
        console.warn('Failed to migrate legacy survey:', err);
      }
    }

    // Default initial seed: 4 realistic geographically distributed surveys for dialectometry
    const sampleData = getSampleSurveyData();
    const sampleKarangwangi = createRecordFromData(
      'survey_sample_karangwangi',
      sampleData,
      { 
        customTitle: 'Desa Karangwangi - Bahasa Sunda (Dialek Pesisir)',
        createdBy: 'user_surveyor_budi',
        createdByName: 'Budi Santoso, S.S.',
        createdByEmail: 'budi@pemetaan.id',
        createdByRole: 'user',
        isVerified: true,
        verifiedBy: 'Dr. Hendra Saputra, M.Hum.',
        verifiedAt: '2026-03-10T14:20:00.000Z'
      }
    );
    const sampleCikaso = createRecordFromData('survey_sample_cikaso', getSampleSurveyCikaso(), {
      customTitle: 'Desa Cikaso - Bahasa Sunda (Priangan Kidul)',
      createdBy: 'user_surveyor_budi',
      createdByName: 'Budi Santoso, S.S.',
      isVerified: true,
      verifiedBy: 'Dr. Hendra Saputra, M.Hum.',
      verifiedAt: '2026-03-10T14:20:00.000Z'
    });
    const sampleRancabuaya = createRecordFromData('survey_sample_rancabuaya', getSampleSurveyRancabuaya(), {
      customTitle: 'Desa Rancabuaya - Bahasa Sunda (Pesisir Garut)',
      createdBy: 'user_surveyor_siti',
      createdByName: 'Siti Rahmawati, S.Pd.',
      isVerified: true,
      verifiedBy: 'Dr. Hendra Saputra, M.Hum.',
      verifiedAt: '2026-03-10T14:20:00.000Z'
    });
    const samplePangandaran = createRecordFromData('survey_sample_pangandaran', getSampleSurveyPangandaran(), {
      customTitle: 'Desa Babakan - Bahasa Sunda-Jawa (Banyumasan)',
      createdBy: 'user_surveyor_agus',
      createdByName: 'Agus Priyanto, M.Hum.',
      isVerified: true,
      verifiedBy: 'Dr. Hendra Saputra, M.Hum.',
      verifiedAt: '2026-03-10T14:20:00.000Z'
    });
    const initialList = [sampleKarangwangi, sampleCikaso, sampleRancabuaya, samplePangandaran];
    localStorage.setItem(STORAGE_KEY_SURVEYS, JSON.stringify(initialList));
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, sampleKarangwangi.id);
    return initialList;
  } catch (e) {
    console.error('Failed to load surveys from localStorage:', e);
    const fallback = [createRecordFromData('survey_default', getEmptySurveyData())];
    return fallback;
  }
}

/**
 * Persist all surveys into localStorage
 */
export function persistAllSurveys(surveys: SurveyRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SURVEYS, JSON.stringify(surveys));
  } catch (e) {
    console.error('Failed to persist surveys:', e);
  }
}

/**
 * Save / update a single survey in the list
 */
export function saveSurveyRecord(survey: SurveyRecord, surveys: SurveyRecord[]): SurveyRecord[] {
  const isOnline = offlineSyncManager.isOnline();
  const updatedRecord = createRecordFromData(
    survey.id,
    survey.data,
    {
      customTitle: survey.title,
      createdAt: survey.createdAt,
      updatedAt: new Date().toISOString(),
      createdBy: survey.createdBy,
      createdByName: survey.createdByName,
      createdByEmail: survey.createdByEmail,
      createdByRole: survey.createdByRole,
      isVerified: survey.isVerified,
      verifiedBy: survey.verifiedBy,
      verifiedAt: survey.verifiedAt
    }
  );

  updatedRecord.syncStatus = isOnline ? 'syncing' : 'pending';

  const index = surveys.findIndex(s => s.id === survey.id);
  let updatedList: SurveyRecord[];
  if (index >= 0) {
    updatedList = [...surveys];
    updatedList[index] = updatedRecord;
  } else {
    updatedList = [updatedRecord, ...surveys];
  }

  // 1. Instantly persist locally to ensure zero data loss offline
  persistAllSurveys(updatedList);

  // 2. Upload to Firebase Firestore if online and authenticated
  if (isOnline && isFirebaseAuthenticated()) {
    saveSurveyToFirestore(updatedRecord)
      .then(() => {
        offlineSyncManager.dequeue(updatedRecord.id);
        const idx = updatedList.findIndex(s => s.id === updatedRecord.id);
        if (idx >= 0) {
          updatedList[idx] = {
            ...updatedList[idx],
            syncStatus: 'synced',
            lastSyncedAt: new Date().toISOString()
          };
          persistAllSurveys(updatedList);
        }
      })
      .catch((err) => {
        console.warn('[OfflineSync] Unggah langsung gagal, data masuk antrian offline:', err);
        offlineSyncManager.enqueue(updatedRecord.id);
      });
  } else if (!isOnline && isFirebaseAuthenticated()) {
    // Offline and authenticated: Automatically enqueue for background upload when device gets internet
    offlineSyncManager.enqueue(updatedRecord.id);
  } else {
    // Unauthenticated: Keep data safely in local storage
    const idx = updatedList.findIndex(s => s.id === updatedRecord.id);
    if (idx >= 0) {
      updatedList[idx] = {
        ...updatedList[idx],
        syncStatus: 'local'
      };
      persistAllSurveys(updatedList);
    }
  }

  return updatedList;
}

/**
 * Create a brand new survey
 */
export function createNewSurveyRecord(
  type: 'empty' | 'sample' = 'empty', 
  surveys: SurveyRecord[],
  creator?: AppUser | null
): {
  newRecord: SurveyRecord;
  updatedSurveys: SurveyRecord[];
} {
  const newId = `survey_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const data = type === 'sample' ? getSampleSurveyData() : getEmptySurveyData();
  const title = type === 'sample' ? 'Desa Karangwangi - Bahasa Sunda' : 'Formulir Survei Baru';

  const newRecord = createRecordFromData(newId, data, { 
    customTitle: title,
    createdBy: creator?.id,
    createdByName: creator?.name,
    createdByEmail: creator?.email,
    createdByRole: creator?.role,
    isVerified: false
  });
  newRecord.syncStatus = offlineSyncManager.isOnline() ? 'syncing' : 'pending';
  const updatedSurveys = [newRecord, ...surveys];
  persistAllSurveys(updatedSurveys);
  localStorage.setItem(STORAGE_KEY_ACTIVE_ID, newId);
  offlineSyncManager.enqueue(newId);

  return { newRecord, updatedSurveys };
}

/**
 * Duplicate an existing survey
 */
export function duplicateSurveyRecord(
  id: string, 
  surveys: SurveyRecord[],
  creator?: AppUser | null
): {
  duplicatedRecord: SurveyRecord | null;
  updatedSurveys: SurveyRecord[];
} {
  const target = surveys.find(s => s.id === id);
  if (!target) {
    return { duplicatedRecord: null, updatedSurveys: surveys };
  }

  const newId = `survey_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const clonedData: InstrumenPemetaanBahasaData = JSON.parse(JSON.stringify(target.data));
  
  if (clonedData.titikPengamatan?.namaDesa) {
    clonedData.titikPengamatan.namaDesa = `${clonedData.titikPengamatan.namaDesa} (Salinan)`;
  }

  const duplicatedRecord = createRecordFromData(
    newId,
    clonedData,
    { 
      customTitle: `${target.title} (Salinan)`,
      createdBy: creator?.id || target.createdBy,
      createdByName: creator?.name || target.createdByName,
      createdByEmail: creator?.email || target.createdByEmail,
      createdByRole: creator?.role || target.createdByRole,
      isVerified: false
    }
  );
  duplicatedRecord.syncStatus = offlineSyncManager.isOnline() ? 'syncing' : 'pending';

  const updatedSurveys = [duplicatedRecord, ...surveys];
  persistAllSurveys(updatedSurveys);
  offlineSyncManager.enqueue(newId);
  return { duplicatedRecord, updatedSurveys };
}

/**
 * Toggle verification status (Super Admin privilege)
 */
export function toggleSurveyVerification(
  id: string,
  surveys: SurveyRecord[],
  adminUser: AppUser
): SurveyRecord[] {
  const updated = surveys.map(s => {
    if (s.id === id) {
      const nextVerified = !s.isVerified;
      const updatedItem: SurveyRecord = {
        ...s,
        isVerified: nextVerified,
        updatedAt: new Date().toISOString()
      };
      if (nextVerified) {
        updatedItem.verifiedBy = adminUser.name;
        updatedItem.verifiedAt = new Date().toISOString();
      } else {
        delete updatedItem.verifiedBy;
        delete updatedItem.verifiedAt;
      }
      return updatedItem;
    }
    return s;
  });
  persistAllSurveys(updated);
  offlineSyncManager.enqueue(id);
  return updated;
}

/**
 * Delete survey by ID
 */
export function deleteSurveyRecord(id: string, surveys: SurveyRecord[]): SurveyRecord[] {
  offlineSyncManager.dequeue(id);
  const updated = surveys.filter(s => s.id !== id);
  persistAllSurveys(updated);
  deleteSurveyFromFirestore(id).catch(err => {
    console.debug('Firestore delete skipped/failed:', err);
  });
  return updated;
}

/**
 * Download single survey as JSON
 */
export function downloadSingleSurveyJSON(survey: SurveyRecord): void {
  const exportPayload = {
    app: 'Sistem Pemetaan Bahasa & Dialektometri',
    version: '2.0',
    exportedAt: new Date().toISOString(),
    survey: {
      id: survey.id,
      title: survey.title,
      createdAt: survey.createdAt,
      updatedAt: survey.updatedAt,
      progress: survey.progress,
      data: survey.data
    }
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeName = (survey.desa || survey.title || 'Survei_Bahasa').replace(/[^a-zA-Z0-9_-]/g, '_');
  link.download = `Survei_${safeName}_${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Download all surveys as JSON backup archive
 */
export function downloadAllSurveysJSON(surveys: SurveyRecord[]): void {
  const exportPayload = {
    app: 'Sistem Pemetaan Bahasa & Dialektometri',
    version: '2.0',
    exportedAt: new Date().toISOString(),
    totalSurveys: surveys.length,
    surveys: surveys.map(s => ({
      id: s.id,
      title: s.title,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      progress: s.progress,
      data: s.data
    }))
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Semua_Survei_Pemetaan_Bahasa_${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export summary table of all surveys to CSV
 */
export function downloadSurveysSummaryCSV(surveys: SurveyRecord[]): void {
  const headers = [
    'ID',
    'Judul Survei',
    'Desa',
    'Bahasa',
    'Kecamatan',
    'Kabupaten/Kota',
    'Provinsi',
    'Kelengkapan (%)',
    'Bagian Terisi',
    'Morfologi',
    'Koordinat Lintang',
    'Koordinat Bujur',
    'Jumlah Penduduk Pria',
    'Jumlah Penduduk Wanita',
    'Total Glos Swadesh Terisi',
    'Titik Pembanding Dialektometri',
    'Terakhir Diperbarui'
  ];

  const rows = surveys.map(s => {
    const d = s.data;
    const swadeshFilled = d?.kosakataLengkap?.swadeshList?.filter(w => w.bentukLokal)?.length || 0;
    const pembandingCount = d?.dialektometri?.titikPembandingList?.length || 0;

    return [
      `"${s.id}"`,
      `"${(s.title || '').replace(/"/g, '""')}"`,
      `"${(d?.titikPengamatan?.namaDesa || '').replace(/"/g, '""')}"`,
      `"${(d?.titikPengamatan?.bahasaDigunakan || '').replace(/"/g, '""')}"`,
      `"${(d?.titikPengamatan?.kecamatan || '').replace(/"/g, '""')}"`,
      `"${(d?.titikPengamatan?.kabupatenKota || '').replace(/"/g, '""')}"`,
      `"${(d?.titikPengamatan?.provinsi || '').replace(/"/g, '""')}"`,
      `"${s.progress}%"`,
      `"${s.completedSectionsCount}/${s.totalSectionsCount}"`,
      `"${(d?.situasiGeografis?.morfologi || '').replace(/"/g, '""')}"`,
      `"${d?.situasiGeografis?.koordinatLintang || ''}"`,
      `"${d?.situasiGeografis?.koordinatBujur || ''}"`,
      `"${d?.penduduk?.jumlahPria || 0}"`,
      `"${d?.penduduk?.jumlahWanita || 0}"`,
      `"${swadeshFilled}/200"`,
      `"${pembandingCount}"`,
      `"${new Date(s.updatedAt).toLocaleString('id-ID')}"`
    ];
  });

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Ringkasan_Survei_Bahasa_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Import JSON file (handles single survey, batch survey, or raw instrumen data)
 */
export function parseAndImportSurveyJSON(jsonContent: string, existingSurveys: SurveyRecord[]): {
  success: boolean;
  message: string;
  importedSurveys: SurveyRecord[];
  activeId?: string;
} {
  try {
    const parsed = JSON.parse(jsonContent);

    // Case 1: Batch export format with `surveys` array
    if (parsed.surveys && Array.isArray(parsed.surveys)) {
      const newItems: SurveyRecord[] = [];
      for (const item of parsed.surveys) {
        if (item && item.data) {
          const rec = createRecordFromData(
            item.id || `survey_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            item.data,
            { customTitle: item.title, createdAt: item.createdAt, updatedAt: item.updatedAt }
          );
          newItems.push(rec);
        }
      }
      if (newItems.length === 0) {
        return { success: false, message: 'File tidak memuat data survei yang valid.', importedSurveys: existingSurveys };
      }
      // Merge by ID
      const merged = [...existingSurveys];
      for (const item of newItems) {
        const idx = merged.findIndex(s => s.id === item.id);
        if (idx >= 0) {
          merged[idx] = item;
        } else {
          merged.unshift(item);
        }
      }
      persistAllSurveys(merged);
      return {
        success: true,
        message: `Berhasil mengimpor ${newItems.length} formulir survei.`,
        importedSurveys: merged,
        activeId: newItems[0].id
      };
    }

    // Case 2: Single survey export with `survey` object
    if (parsed.survey && parsed.survey.data) {
      const rec = createRecordFromData(
        parsed.survey.id || `survey_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        parsed.survey.data,
        { customTitle: parsed.survey.title, createdAt: parsed.survey.createdAt, updatedAt: parsed.survey.updatedAt }
      );
      const merged = [rec, ...existingSurveys.filter(s => s.id !== rec.id)];
      persistAllSurveys(merged);
      return {
        success: true,
        message: `Berhasil mengimpor survei "${rec.title}".`,
        importedSurveys: merged,
        activeId: rec.id
      };
    }

    // Case 3: Raw InstrumenPemetaanBahasaData object (from earlier version exports)
    if (parsed.titikPengamatan && parsed.situasiKebahasaan) {
      const rec = createRecordFromData(
        `survey_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        parsed as InstrumenPemetaanBahasaData
      );
      const merged = [rec, ...existingSurveys];
      persistAllSurveys(merged);
      return {
        success: true,
        message: `Berhasil mengimpor survei instrumen "${rec.title}".`,
        importedSurveys: merged,
        activeId: rec.id
      };
    }

    return {
      success: false,
      message: 'Format data JSON tidak dikenali sebagai format instrumen pemetaan bahasa.',
      importedSurveys: existingSurveys
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal membaca file JSON: ${err.message || 'Kesalahan sintaks JSON'}`,
      importedSurveys: existingSurveys
    };
  }
}
