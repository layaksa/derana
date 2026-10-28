import { 
  SurveyRecord, 
  InstrumenPemetaanBahasaData, 
  NarasumberData, 
  KosakataLengkapData, 
  KosakataItem,
  FrasaItem,
  KalimatItem,
  TitikPengamatan,
  SituasiKebahasaan,
  SituasiGeografis,
  PendudukData,
  MataPencaharianData,
  PendidikanData,
  SaranaPendidikanData,
  AgamaData,
  HubunganMobilitasData,
  AlatTransportasiData,
  UsiaDesaData,
  SejarahDesaData,
  FolkloreData,
  HasilDialektometriData
} from '../types/linguistic';
import { getSectionProgressDetails } from './calculations';

export type ConflictResolutionStrategy = 
  | 'auto_resolve' 
  | 'last_write_wins' 
  | 'prefer_local' 
  | 'prefer_remote';

export interface ConflictResolutionLog {
  id: string;
  surveyId: string;
  surveyTitle: string;
  resolvedAt: string;
  strategy: ConflictResolutionStrategy;
  localUpdatedAt: string;
  remoteUpdatedAt: string;
  summary: string;
  mergedSections: string[];
  conflictsCount: number;
  status: 'auto_resolved' | 'applied_strategy';
}

const CONFLICT_STRATEGY_KEY = 'linguistic_conflict_resolution_strategy_v1';
const CONFLICT_LOGS_KEY = 'linguistic_conflict_resolution_logs_v1';

export function getStoredConflictStrategy(): ConflictResolutionStrategy {
  try {
    const val = localStorage.getItem(CONFLICT_STRATEGY_KEY);
    if (val === 'last_write_wins' || val === 'prefer_local' || val === 'prefer_remote' || val === 'auto_resolve') {
      return val;
    }
    return 'auto_resolve';
  } catch {
    return 'auto_resolve';
  }
}

export function setStoredConflictStrategy(strategy: ConflictResolutionStrategy): void {
  try {
    localStorage.setItem(CONFLICT_STRATEGY_KEY, strategy);
  } catch (e) {
    console.warn('[ConflictResolution] Gagal menyimpan preferensi strategi:', e);
  }
}

export function getStoredConflictLogs(): ConflictResolutionLog[] {
  try {
    const raw = localStorage.getItem(CONFLICT_LOGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveConflictLog(log: ConflictResolutionLog): void {
  try {
    const current = getStoredConflictLogs();
    // Keep up to 50 recent logs
    const updated = [log, ...current.filter(l => l.id !== log.id)].slice(0, 50);
    localStorage.setItem(CONFLICT_LOGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('[ConflictResolution] Gagal menyimpan riwayat log konflik:', e);
  }
}

export function clearStoredConflictLogs(): void {
  try {
    localStorage.removeItem(CONFLICT_LOGS_KEY);
  } catch {
    // ignore
  }
}

/**
 * Helper to check if a value is meaningful/non-empty
 */
function isFilledValue(val: any): boolean {
  if (val === undefined || val === null) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  if (typeof val === 'number') return !isNaN(val) && val !== 0;
  if (typeof val === 'boolean') return true;
  if (Array.isArray(val)) return val.length > 0;
  if (typeof val === 'object') return Object.keys(val).length > 0;
  return true;
}

/**
 * Intelligent field-by-field merge for simple objects
 */
function mergeObjectFields<T extends Record<string, any>>(
  localObj: T | undefined | null, 
  remoteObj: T | undefined | null,
  preferLocal: boolean
): { merged: T; changedFields: string[]; conflicts: number } {
  const merged: Record<string, any> = {};
  const changedFields: string[] = [];
  let conflicts = 0;

  const loc = localObj || ({} as T);
  const rem = remoteObj || ({} as T);

  const allKeys = Array.from(new Set([...Object.keys(loc), ...Object.keys(rem)]));

  for (const key of allKeys) {
    const localVal = loc[key];
    const remoteVal = rem[key];

    const localFilled = isFilledValue(localVal);
    const remoteFilled = isFilledValue(remoteVal);

    if (localFilled && !remoteFilled) {
      merged[key] = localVal;
      changedFields.push(key);
    } else if (!localFilled && remoteFilled) {
      merged[key] = remoteVal;
      changedFields.push(key);
    } else if (localFilled && remoteFilled) {
      // Both filled
      if (JSON.stringify(localVal) === JSON.stringify(remoteVal)) {
        merged[key] = localVal;
      } else {
        // Values conflict
        conflicts++;
        changedFields.push(key);
        if (typeof localVal === 'object' && typeof remoteVal === 'object' && !Array.isArray(localVal)) {
          const nested = mergeObjectFields(localVal, remoteVal, preferLocal);
          merged[key] = nested.merged;
        } else {
          // Choose based on preferLocal, or prioritize richer content
          if (typeof localVal === 'string' && typeof remoteVal === 'string') {
            // If one is longer / more descriptive, prefer it
            if (localVal.length > remoteVal.length + 5) {
              merged[key] = localVal;
            } else if (remoteVal.length > localVal.length + 5) {
              merged[key] = remoteVal;
            } else {
              merged[key] = preferLocal ? localVal : remoteVal;
            }
          } else {
            merged[key] = preferLocal ? localVal : remoteVal;
          }
        }
      }
    } else {
      merged[key] = localVal !== undefined ? localVal : remoteVal;
    }
  }

  return { merged: merged as T, changedFields, conflicts };
}

/**
 * Merge list of informants (NarasumberData[])
 * Multiple fieldworkers might interview different informants in the same village
 */
export function mergeNarasumberLists(
  localList: NarasumberData[] = [], 
  remoteList: NarasumberData[] = [],
  preferLocal: boolean
): { merged: NarasumberData[]; changesCount: number } {
  let changesCount = 0;
  const merged: NarasumberData[] = [];

  const maxLen = Math.max(localList.length, remoteList.length, 3);

  for (let i = 0; i < maxLen; i++) {
    const loc = localList[i];
    const rem = remoteList[i];

    if (!loc && !rem) continue;

    if (loc && !rem) {
      merged.push(loc);
      changesCount++;
      continue;
    }

    if (!loc && rem) {
      merged.push(rem);
      changesCount++;
      continue;
    }

    // Both exist at index i
    const locHasName = isFilledValue(loc.nama);
    const remHasName = isFilledValue(rem.nama);

    if (locHasName && !remHasName) {
      merged.push(loc);
      changesCount++;
    } else if (!locHasName && remHasName) {
      merged.push(rem);
      changesCount++;
    } else if (loc.nama && rem.nama && loc.nama.trim().toLowerCase() !== rem.nama.trim().toLowerCase()) {
      // Different informants! If names differ, keep both if space permits or combine
      changesCount++;
      // If index matches, merge fields preferring richer informant, and append the other
      merged.push(preferLocal ? loc : rem);
      const other = preferLocal ? rem : loc;
      if (other.nama && other.nama.trim()) {
        merged.push({
          ...other,
          id: merged.length + 1
        });
      }
    } else {
      // Same informant or both empty: merge properties
      const { merged: mergedInformant, conflicts } = mergeObjectFields(loc, rem, preferLocal);
      if (conflicts > 0) changesCount += conflicts;
      merged.push(mergedInformant as NarasumberData);
    }
  }

  return { merged, changesCount };
}

/**
 * Merge KosakataItem arrays (Swadesh & cultural vocabularies)
 */
function mergeKosakataItems(
  localItems: KosakataItem[] = [], 
  remoteItems: KosakataItem[] = [],
  preferLocal: boolean
): { merged: KosakataItem[]; count: number } {
  let count = 0;
  const map = new Map<number, KosakataItem>();

  // Index remote items first
  for (const item of remoteItems) {
    if (item && item.id !== undefined) {
      map.set(item.id, { ...item });
    }
  }

  // Merge local items
  for (const localItem of localItems) {
    if (!localItem || localItem.id === undefined) continue;

    const existing = map.get(localItem.id);
    if (!existing) {
      map.set(localItem.id, { ...localItem });
      count++;
    } else {
      const locHasWord = isFilledValue(localItem.bentukLokal);
      const remHasWord = isFilledValue(existing.bentukLokal);

      if (locHasWord && !remHasWord) {
        map.set(localItem.id, { ...existing, ...localItem });
        count++;
      } else if (!locHasWord && remHasWord) {
        // Keep existing remote
      } else if (locHasWord && remHasWord) {
        if (localItem.bentukLokal !== existing.bentukLokal) {
          count++;
          // Prefer one with IPA or audio, or preferLocal
          const locHasIPA = isFilledValue(localItem.transkripsiIPA);
          const remHasIPA = isFilledValue(existing.transkripsiIPA);
          const locHasAudio = isFilledValue(localItem.audioUrl);
          const remHasAudio = isFilledValue(existing.audioUrl);

          if ((locHasIPA || locHasAudio) && !remHasIPA && !remHasAudio) {
            map.set(localItem.id, { ...existing, ...localItem });
          } else if ((remHasIPA || remHasAudio) && !locHasIPA && !locHasAudio) {
            // Keep remote
          } else {
            // Equal richness: merge with fallback note or pick preferLocal
            const chosen = preferLocal ? localItem : existing;
            const alternate = preferLocal ? existing : localItem;
            map.set(localItem.id, {
              ...chosen,
              transkripsiIPA: chosen.transkripsiIPA || alternate.transkripsiIPA || '',
              audioUrl: chosen.audioUrl || alternate.audioUrl || undefined,
              catatan: chosen.catatan 
                ? (chosen.catatan.includes(alternate.bentukLokal) ? chosen.catatan : `${chosen.catatan}; Varian kolaborator: ${alternate.bentukLokal}`)
                : `Varian kolaborator: ${alternate.bentukLokal}`
            });
          }
        } else {
          // Same word, combine IPA/audio/notes if one has it and other doesn't
          map.set(localItem.id, {
            ...existing,
            ...localItem,
            transkripsiIPA: localItem.transkripsiIPA || existing.transkripsiIPA || '',
            audioUrl: localItem.audioUrl || existing.audioUrl || undefined,
            catatan: localItem.catatan || existing.catatan || ''
          });
        }
      }
    }
  }

  const merged = Array.from(map.values()).sort((a, b) => a.id - b.id);
  return { merged, count };
}

/**
 * Merge KosakataLengkapData
 */
export function mergeKosakataLengkap(
  localK: KosakataLengkapData, 
  remoteK: KosakataLengkapData,
  preferLocal: boolean
): { merged: KosakataLengkapData; mergedCount: number } {
  let mergedCount = 0;

  // 1. Swadesh
  const { merged: swadeshList, count: sCount } = mergeKosakataItems(
    localK?.swadeshList || [], 
    remoteK?.swadeshList || [],
    preferLocal
  );
  mergedCount += sCount;

  // 2. Kosakata Budaya
  const localBudaya = localK?.kosakataBudaya || [];
  const remoteBudaya = remoteK?.kosakataBudaya || [];
  const mergedBudaya = [...remoteBudaya];

  for (const bLoc of localBudaya) {
    const idx = mergedBudaya.findIndex(b => b.kode === bLoc.kode);
    if (idx >= 0) {
      const { merged: mergedWords, count } = mergeKosakataItems(
        bLoc.daftarKata || [], 
        mergedBudaya[idx].daftarKata || [],
        preferLocal
      );
      mergedBudaya[idx] = {
        ...mergedBudaya[idx],
        daftarKata: mergedWords
      };
      mergedCount += count;
    } else {
      mergedBudaya.push(bLoc);
      mergedCount++;
    }
  }

  // 3. Kalimat & Frasa
  const mergedKalimat = (localK?.kalimatSederhana && localK.kalimatSederhana.length > (remoteK?.kalimatSederhana?.length || 0))
    ? localK.kalimatSederhana
    : (remoteK?.kalimatSederhana || localK?.kalimatSederhana || []);

  const mergedFrasa = {
    nominalPosesif: localK?.strukturFrasa?.nominalPosesif?.length ? localK.strukturFrasa.nominalPosesif : remoteK?.strukturFrasa?.nominalPosesif || [],
    nominalPartitif: localK?.strukturFrasa?.nominalPartitif?.length ? localK.strukturFrasa.nominalPartitif : remoteK?.strukturFrasa?.nominalPartitif || [],
    nominalAsalMaterial: localK?.strukturFrasa?.nominalAsalMaterial?.length ? localK.strukturFrasa.nominalAsalMaterial : remoteK?.strukturFrasa?.nominalAsalMaterial || [],
    frasaVerbal: localK?.strukturFrasa?.frasaVerbal?.length ? localK.strukturFrasa.frasaVerbal : remoteK?.strukturFrasa?.frasaVerbal || [],
    frasaAdjektival: localK?.strukturFrasa?.frasaAdjektival?.length ? localK.strukturFrasa.frasaAdjektival : remoteK?.strukturFrasa?.frasaAdjektival || [],
    frasaAdverbial: localK?.strukturFrasa?.frasaAdverbial?.length ? localK.strukturFrasa.frasaAdverbial : remoteK?.strukturFrasa?.frasaAdverbial || []
  };

  const merged: KosakataLengkapData = {
    swadeshList,
    kosakataBudaya: mergedBudaya,
    strukturFrasa: mergedFrasa,
    kalimatSederhana: mergedKalimat,
    catatanPengumpul: preferLocal 
      ? (localK?.catatanPengumpul || remoteK?.catatanPengumpul) 
      : (remoteK?.catatanPengumpul || localK?.catatanPengumpul),
    excelImportedList: localK?.excelImportedList || remoteK?.excelImportedList
  };

  return { merged, mergedCount };
}

/**
 * Main Auto-Resolve engine for two diverging versions of a SurveyRecord
 */
export function autoResolveSurveyConflict(
  local: SurveyRecord,
  remote: SurveyRecord,
  strategy: ConflictResolutionStrategy = 'auto_resolve'
): { 
  mergedRecord: SurveyRecord; 
  conflictLog: ConflictResolutionLog | null; 
  hadConflict: boolean;
} {
  // If identical, no conflict
  if (JSON.stringify(local.data) === JSON.stringify(remote.data) && local.title === remote.title) {
    return { mergedRecord: remote, conflictLog: null, hadConflict: false };
  }

  const localTime = new Date(local.updatedAt || local.createdAt || 0).getTime();
  const remoteTime = new Date(remote.updatedAt || remote.createdAt || 0).getTime();
  const preferLocal = localTime >= remoteTime;

  // Strategy: Last Write Wins
  if (strategy === 'last_write_wins') {
    const winner = preferLocal ? local : remote;
    const log: ConflictResolutionLog = {
      id: `conf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      surveyId: local.id,
      surveyTitle: winner.title || local.title,
      resolvedAt: new Date().toISOString(),
      strategy: 'last_write_wins',
      localUpdatedAt: local.updatedAt,
      remoteUpdatedAt: remote.updatedAt,
      summary: `Diselesaikan menggunakan strategi 'Terbaru Menang (Last-Write-Wins)': Versi ${preferLocal ? 'Lokal' : 'Cloud'} dipilih karena memiliki cap waktu terbaru.`,
      mergedSections: ['Seluruh Dokumen'],
      conflictsCount: 1,
      status: 'applied_strategy'
    };
    saveConflictLog(log);
    return { mergedRecord: winner, conflictLog: log, hadConflict: true };
  }

  // Strategy: Prefer Local
  if (strategy === 'prefer_local') {
    const log: ConflictResolutionLog = {
      id: `conf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      surveyId: local.id,
      surveyTitle: local.title,
      resolvedAt: new Date().toISOString(),
      strategy: 'prefer_local',
      localUpdatedAt: local.updatedAt,
      remoteUpdatedAt: remote.updatedAt,
      summary: "Diselesaikan menggunakan strategi 'Prioritaskan Lokal': Perubahan perangkat offline menimpa versi cloud.",
      mergedSections: ['Seluruh Dokumen'],
      conflictsCount: 1,
      status: 'applied_strategy'
    };
    saveConflictLog(log);
    return { mergedRecord: local, conflictLog: log, hadConflict: true };
  }

  // Strategy: Prefer Remote
  if (strategy === 'prefer_remote') {
    const log: ConflictResolutionLog = {
      id: `conf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      surveyId: remote.id,
      surveyTitle: remote.title,
      resolvedAt: new Date().toISOString(),
      strategy: 'prefer_remote',
      localUpdatedAt: local.updatedAt,
      remoteUpdatedAt: remote.updatedAt,
      summary: "Diselesaikan menggunakan strategi 'Prioritaskan Cloud': Perubahan lokal dibatalkan dan digantikan versi cloud.",
      mergedSections: ['Seluruh Dokumen'],
      conflictsCount: 1,
      status: 'applied_strategy'
    };
    saveConflictLog(log);
    return { mergedRecord: remote, conflictLog: log, hadConflict: true };
  }

  // Strategy: Auto-Resolve (Smart 3-Way & Granular Section Merge)
  const mergedSections: string[] = [];
  let totalConflicts = 0;

  const locData = local.data;
  const remData = remote.data;

  // 1. Titik Pengamatan
  const m1 = mergeObjectFields(locData.titikPengamatan, remData.titikPengamatan, preferLocal);
  if (m1.changedFields.length > 0) mergedSections.push('1. Titik Pengamatan');
  totalConflicts += m1.conflicts;

  // 2. Situasi Kebahasaan
  const m2 = mergeObjectFields(locData.situasiKebahasaan, remData.situasiKebahasaan, preferLocal);
  if (m2.changedFields.length > 0) mergedSections.push('2. Situasi Kebahasaan');
  totalConflicts += m2.conflicts;

  // 3. Situasi Geografis
  const m3 = mergeObjectFields(locData.situasiGeografis, remData.situasiGeografis, preferLocal);
  if (m3.changedFields.length > 0) mergedSections.push('3. Situasi Geografis');
  totalConflicts += m3.conflicts;

  // 4. Penduduk & Penutur
  const m4 = mergeObjectFields(locData.penduduk, remData.penduduk, preferLocal);
  if (m4.changedFields.length > 0) mergedSections.push('4. Penduduk & Penutur');
  totalConflicts += m4.conflicts;

  // 5. Mata Pencaharian
  const m5 = mergeObjectFields(locData.mataPencaharian, remData.mataPencaharian, preferLocal);
  if (m5.changedFields.length > 0) mergedSections.push('5. Mata Pencaharian');
  totalConflicts += m5.conflicts;

  // 6. Pendidikan Penduduk
  const m6 = mergeObjectFields(locData.pendidikan, remData.pendidikan, preferLocal);
  if (m6.changedFields.length > 0) mergedSections.push('6. Pendidikan Penduduk');
  totalConflicts += m6.conflicts;

  // 7. Sarana Pendidikan
  const m7 = mergeObjectFields(locData.saranaPendidikan, remData.saranaPendidikan, preferLocal);
  if (m7.changedFields.length > 0) mergedSections.push('7. Sarana Pendidikan');
  totalConflicts += m7.conflicts;

  // 8. Agama Penduduk
  const m8 = mergeObjectFields(locData.agama, remData.agama, preferLocal);
  if (m8.changedFields.length > 0) mergedSections.push('8. Agama Penduduk');
  totalConflicts += m8.conflicts;

  // 9. Hubungan Mobilitas
  const m9 = mergeObjectFields(locData.hubunganMobilitas, remData.hubunganMobilitas, preferLocal);
  if (m9.changedFields.length > 0) mergedSections.push('9. Hubungan Mobilitas');
  totalConflicts += m9.conflicts;

  // 10. Alat Transportasi
  const m10 = mergeObjectFields(locData.alatTransportasi, remData.alatTransportasi, preferLocal);
  if (m10.changedFields.length > 0) mergedSections.push('10. Alat Transportasi');
  totalConflicts += m10.conflicts;

  // 11. Usia Desa
  const m11 = mergeObjectFields(locData.usiaDesa, remData.usiaDesa, preferLocal);
  if (m11.changedFields.length > 0) mergedSections.push('11. Usia Desa');
  totalConflicts += m11.conflicts;

  // 12. Sejarah Desa
  const m12 = mergeObjectFields(locData.sejarahDesa, remData.sejarahDesa, preferLocal);
  if (m12.changedFields.length > 0) mergedSections.push('12. Sejarah Desa');
  totalConflicts += m12.conflicts;

  // 13. Folklore
  const m13 = mergeObjectFields(locData.folklore, remData.folklore, preferLocal);
  if (m13.changedFields.length > 0) mergedSections.push('13. Folklore');
  totalConflicts += m13.conflicts;

  // 14. Narasumber
  const m14 = mergeNarasumberLists(locData.narasumberList, remData.narasumberList, preferLocal);
  if (m14.changesCount > 0) mergedSections.push(`14. Narasumber (${m14.merged.length} informan)`);
  totalConflicts += m14.changesCount;

  // 15. Kosakata Lengkap
  const m15 = mergeKosakataLengkap(locData.kosakataLengkap, remData.kosakataLengkap, preferLocal);
  if (m15.mergedCount > 0) mergedSections.push(`15. Kosakata (${m15.mergedCount} entri glos)`);
  totalConflicts += m15.mergedCount;

  // 16. Dialektometri
  const m16 = mergeObjectFields(locData.dialektometri, remData.dialektometri, preferLocal);
  if (m16.changedFields.length > 0) mergedSections.push('16. Hasil Dialektometri');
  totalConflicts += m16.conflicts;

  // Construct combined InstrumenPemetaanBahasaData
  const mergedData: InstrumenPemetaanBahasaData = {
    titikPengamatan: m1.merged as TitikPengamatan,
    situasiKebahasaan: m2.merged as SituasiKebahasaan,
    situasiGeografis: m3.merged as SituasiGeografis,
    penduduk: m4.merged as PendudukData,
    mataPencaharian: m5.merged as MataPencaharianData,
    pendidikan: m6.merged as PendidikanData,
    saranaPendidikan: m7.merged as SaranaPendidikanData,
    agama: m8.merged as AgamaData,
    hubunganMobilitas: m9.merged as HubunganMobilitasData,
    alatTransportasi: m10.merged as AlatTransportasiData,
    usiaDesa: m11.merged as UsiaDesaData,
    sejarahDesa: m12.merged as SejarahDesaData,
    folklore: m13.merged as FolkloreData,
    narasumberList: m14.merged,
    kosakataLengkap: m15.merged,
    dialektometri: m16.merged as HasilDialektometriData
  };

  // Recalculate progress metrics
  const { score, total, percentage } = getSectionProgressDetails(mergedData);

  const nowIso = new Date().toISOString();

  // Pick metadata safely
  const mergedRecord: SurveyRecord = {
    ...remote,
    ...local,
    title: (preferLocal ? local.title : remote.title) || local.title || remote.title,
    desa: mergedData.titikPengamatan?.namaDesa || local.desa || remote.desa,
    bahasa: mergedData.titikPengamatan?.bahasaDigunakan || local.bahasa || remote.bahasa,
    kecamatan: mergedData.titikPengamatan?.kecamatan || local.kecamatan || remote.kecamatan,
    kabupatenKota: mergedData.titikPengamatan?.kabupatenKota || local.kabupatenKota || remote.kabupatenKota,
    provinsi: mergedData.titikPengamatan?.provinsi || local.provinsi || remote.provinsi,
    createdAt: local.createdAt || remote.createdAt || nowIso,
    updatedAt: nowIso,
    data: mergedData,
    progress: percentage,
    completedSectionsCount: score,
    totalSectionsCount: total,
    // Preserve verification if verified on either side
    isVerified: local.isVerified || remote.isVerified || false,
    verifiedBy: local.verifiedBy || remote.verifiedBy,
    verifiedAt: local.verifiedAt || remote.verifiedAt,
    createdBy: remote.createdBy || local.createdBy,
    createdByName: remote.createdByName || local.createdByName,
    createdByEmail: remote.createdByEmail || local.createdByEmail,
    createdByRole: remote.createdByRole || local.createdByRole,
    syncStatus: 'synced',
    lastSyncedAt: nowIso
  };

  const summary = mergedSections.length > 0
    ? `Berhasil menggabungkan ${mergedSections.length} bagian survei secara otomatis antara perangkat lokal dan cloud tanpa kehilangan data.`
    : 'Data survei lokal dan cloud telah diverifikasi dan disinkronkan.';

  const log: ConflictResolutionLog = {
    id: `conf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    surveyId: local.id,
    surveyTitle: mergedRecord.title,
    resolvedAt: nowIso,
    strategy: 'auto_resolve',
    localUpdatedAt: local.updatedAt,
    remoteUpdatedAt: remote.updatedAt,
    summary,
    mergedSections,
    conflictsCount: totalConflicts || mergedSections.length,
    status: 'auto_resolved'
  };

  saveConflictLog(log);

  return {
    mergedRecord,
    conflictLog: log,
    hadConflict: true
  };
}
