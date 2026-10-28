import { SurveyRecord } from '../types/linguistic';
import { 
  saveSurveyToFirestore, 
  saveVitalitasToFirestore, 
  saveSastraLisanToFirestore,
  saveRevitalisasiMonevToFirestore,
  saveRevitalisasiRAPToFirestore,
  getSurveyFromFirestore,
  testFirestoreConnection 
} from '../lib/firebase';
import { loadAllSurveys, persistAllSurveys } from './surveyStorage';
import { loadVitalitasResponses } from './vitalitasStorage';
import { loadSastraLisanRecords } from './sastraLisanStorage';
import { loadMonevRecords, loadRAPRecords } from './revitalisasiStorage';
import {
  autoResolveSurveyConflict,
  ConflictResolutionStrategy,
  ConflictResolutionLog,
  getStoredConflictStrategy,
  setStoredConflictStrategy,
  getStoredConflictLogs,
  clearStoredConflictLogs
} from './conflictResolution';

const QUEUE_KEY = 'linguistic_offline_pending_sync_queue_v2';
const LAST_SYNC_KEY = 'linguistic_last_firebase_sync_timestamp_v2';

export type QuestionnaireType = 'survey' | 'vitalitas' | 'sastra_lisan' | 'revitalisasi_monev' | 'revitalisasi_rap';

export interface PendingSyncItem {
  id: string;
  type: QuestionnaireType;
  enqueuedAt: string;
}

export interface SyncStatusEvent {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: string | null;
  lastSyncMessage?: string | null;
  conflictStrategy?: ConflictResolutionStrategy;
  conflictCount?: number;
  lastResolvedConflict?: ConflictResolutionLog | null;
}

type SyncListener = (status: SyncStatusEvent) => void;

class OfflineSyncManager {
  private listeners: Set<SyncListener> = new Set();
  private isSyncing = false;
  private syncTimeout: any = null;
  private lastResolvedConflict: ConflictResolutionLog | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[OfflineSync] Perangkat kembali ONLINE — Memeriksa antrian sinkronisasi...');
        this.notify('Perangkat kembali online. Memulai sinkronisasi data...');
        setTimeout(() => {
          this.triggerAutoSync();
        }, 1200);
      });

      window.addEventListener('offline', () => {
        console.log('[OfflineSync] Perangkat beralih ke OFFLINE — Data kuesioner akan disimpan secara lokal.');
        this.notify('Mode offline aktif. Perubahan disimpan secara lokal.');
      });
    }
  }

  public getConflictStrategy(): ConflictResolutionStrategy {
    return getStoredConflictStrategy();
  }

  public setConflictStrategy(strategy: ConflictResolutionStrategy): void {
    setStoredConflictStrategy(strategy);
    this.notify(`Strategi resolusi konflik diubah menjadi: ${strategy}`);
  }

  public getConflictLogs(): ConflictResolutionLog[] {
    return getStoredConflictLogs();
  }

  public clearConflictLogs(): void {
    clearStoredConflictLogs();
    this.lastResolvedConflict = null;
    this.notify('Riwayat log konflik telah dibersihkan.');
  }

  public getLastResolvedConflict(): ConflictResolutionLog | null {
    if (this.lastResolvedConflict) return this.lastResolvedConflict;
    const logs = this.getConflictLogs();
    return logs.length > 0 ? logs[0] : null;
  }

  public getPendingItems(): PendingSyncItem[] {
    try {
      const raw = localStorage.getItem(QUEUE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      // Normalize backwards compatibility if strings were stored
      return parsed.map((item) => {
        if (typeof item === 'string') {
          return { id: item, type: 'survey' as QuestionnaireType, enqueuedAt: new Date().toISOString() };
        }
        return item as PendingSyncItem;
      });
    } catch {
      return [];
    }
  }

  public getPendingIds(): string[] {
    return this.getPendingItems().map(item => item.id);
  }

  private savePendingItems(items: PendingSyncItem[]): void {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('[OfflineSync] Gagal menyimpan antrian sinkronisasi lokal:', e);
    }
  }

  public enqueue(id: string, type: QuestionnaireType = 'survey'): void {
    const items = this.getPendingItems();
    const existingIndex = items.findIndex(item => item.id === id);
    if (existingIndex >= 0) {
      items[existingIndex] = { id, type, enqueuedAt: new Date().toISOString() };
    } else {
      items.push({ id, type, enqueuedAt: new Date().toISOString() });
    }
    this.savePendingItems(items);
    console.log(`[OfflineSync] Kuesioner (${type}) ${id} dimasukkan ke antrian unggah (${items.length} tertunda).`);
    this.notify();

    // If currently online, trigger debounced sync
    if (this.isOnline()) {
      clearTimeout(this.syncTimeout);
      this.syncTimeout = setTimeout(() => {
        this.triggerAutoSync();
      }, 1500);
    }
  }

  public dequeue(id: string): void {
    const items = this.getPendingItems().filter(item => item.id !== id);
    this.savePendingItems(items);
    this.notify();
  }

  public clearQueue(): void {
    this.savePendingItems([]);
    this.notify();
  }

  public isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  public getLastSyncTime(): string | null {
    try {
      return localStorage.getItem(LAST_SYNC_KEY);
    } catch {
      return null;
    }
  }

  private setLastSyncTime(isoStr: string): void {
    try {
      localStorage.setItem(LAST_SYNC_KEY, isoStr);
    } catch {
      // ignore
    }
  }

  public getStatus(): SyncStatusEvent {
    const logs = this.getConflictLogs();
    return {
      isOnline: this.isOnline(),
      isSyncing: this.isSyncing,
      pendingCount: this.getPendingItems().length,
      lastSyncedAt: this.getLastSyncTime(),
      conflictStrategy: this.getConflictStrategy(),
      conflictCount: logs.length,
      lastResolvedConflict: this.getLastResolvedConflict()
    };
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.getStatus());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(lastSyncMessage?: string): void {
    const status: SyncStatusEvent = {
      ...this.getStatus(),
      lastSyncMessage
    };
    this.listeners.forEach(fn => fn(status));
  }

  /**
   * Main sync method with Auto-Resolve Conflict Resolution Strategy:
   * Uploads all pending survey, vitalitas, and sastra lisan records from local storage to Firebase Firestore.
   * Detects multi-user concurrent offline edits and automatically merges diverging sections/fields.
   */
  public async triggerAutoSync(customSurveys?: SurveyRecord[]): Promise<{
    syncedCount: number;
    failedCount: number;
    totalPending: number;
    conflictsResolved: number;
  }> {
    if (!this.isOnline()) {
      console.log('[OfflineSync] Perangkat offline, menunda sinkronisasi cloud.');
      return { syncedCount: 0, failedCount: 0, totalPending: this.getPendingItems().length, conflictsResolved: 0 };
    }

    if (this.isSyncing) {
      return { syncedCount: 0, failedCount: 0, totalPending: this.getPendingItems().length, conflictsResolved: 0 };
    }

    const pendingItems = this.getPendingItems();
    if (pendingItems.length === 0) {
      return { syncedCount: 0, failedCount: 0, totalPending: 0, conflictsResolved: 0 };
    }

    this.isSyncing = true;
    this.notify('Mengunggah data survei ke Firebase (Memeriksa integritas data & konflik)...');

    let syncedCount = 0;
    let failedCount = 0;
    let conflictsResolved = 0;

    try {
      // Test firestore connectivity before executing batch upload
      await testFirestoreConnection();

      // Read current local surveys
      const localSurveys = customSurveys || loadAllSurveys();
      const updatedSurveys = [...localSurveys];
      const now = new Date();
      const timestampIso = now.toISOString();

      // Read local vitalitas and sastra lisan
      const localVitalitas = loadVitalitasResponses();
      const localSastraLisan = loadSastraLisanRecords();

      for (const item of [...pendingItems]) {
        try {
          if (item.type === 'survey') {
            const record = updatedSurveys.find(s => s.id === item.id);
            if (!record) {
              this.dequeue(item.id);
              continue;
            }

            let finalRecordToSave: SurveyRecord = {
              ...record,
              syncStatus: 'synced',
              lastSyncedAt: timestampIso
            };

            // AUTO-RESOLVE CONFLICT DETECTION:
            // Check if remote version already exists in Firestore and was modified by another user/device
            try {
              const remoteRecord = await getSurveyFromFirestore(item.id);
              if (remoteRecord) {
                const currentStrategy = this.getConflictStrategy();
                const resolution = autoResolveSurveyConflict(finalRecordToSave, remoteRecord, currentStrategy);
                
                if (resolution.hadConflict) {
                  finalRecordToSave = resolution.mergedRecord;
                  conflictsResolved++;
                  this.lastResolvedConflict = resolution.conflictLog;
                  console.info(
                    `[OfflineSync] Auto-Resolve Conflict diterapkan untuk survei '${finalRecordToSave.title}' (${item.id}):`,
                    resolution.conflictLog?.summary
                  );
                }
              }
            } catch (conflictErr) {
              console.warn(`[OfflineSync] Pengecekan konflik untuk survei ${item.id} dilewati karena respon jaringan:`, conflictErr);
            }

            await saveSurveyToFirestore(finalRecordToSave);

            const idx = updatedSurveys.findIndex(s => s.id === item.id);
            if (idx >= 0) {
              updatedSurveys[idx] = finalRecordToSave;
            }

            this.dequeue(item.id);
            syncedCount++;
            console.log(`[OfflineSync] Berhasil mengunggah survei dialektometri '${finalRecordToSave.title}' (${item.id}) ke Firebase.`);
          } else if (item.type === 'vitalitas') {
            const record = localVitalitas.find(v => v.id === item.id);
            if (!record) {
              this.dequeue(item.id);
              continue;
            }

            await saveVitalitasToFirestore(record);
            this.dequeue(item.id);
            syncedCount++;
            console.log(`[OfflineSync] Berhasil mengunggah kuesioner vitalitas ${item.id} ke Firebase.`);
          } else if (item.type === 'sastra_lisan') {
            const record = localSastraLisan.find(sl => sl.id === item.id);
            if (!record) {
              this.dequeue(item.id);
              continue;
            }

            await saveSastraLisanToFirestore(record);
            this.dequeue(item.id);
            syncedCount++;
            console.log(`[OfflineSync] Berhasil mengunggah kuesioner sastra lisan '${record.namaSastraLisan}' (${item.id}) ke Firebase.`);
          } else if (item.type === 'revitalisasi_monev') {
            const localMonev = loadMonevRecords();
            const record = localMonev.find(m => m.id === item.id);
            if (!record) {
              this.dequeue(item.id);
              continue;
            }
            await saveRevitalisasiMonevToFirestore(record);
            this.dequeue(item.id);
            syncedCount++;
            console.log(`[OfflineSync] Berhasil mengunggah dokumen Monev '${record.bahasaDaerah}' (${item.id}) ke Firebase.`);
          } else if (item.type === 'revitalisasi_rap') {
            const localRAP = loadRAPRecords();
            const record = localRAP.find(r => r.id === item.id);
            if (!record) {
              this.dequeue(item.id);
              continue;
            }
            await saveRevitalisasiRAPToFirestore(record);
            this.dequeue(item.id);
            syncedCount++;
            console.log(`[OfflineSync] Berhasil mengunggah dokumen RAP '${record.bahasaDaerah}' (${item.id}) ke Firebase.`);
          }
        } catch (uploadErr) {
          console.warn(`[OfflineSync] Gagal mengunggah item ${item.id} (${item.type}) ke Firebase:`, uploadErr);
          failedCount++;
        }
      }

      // Persist updated survey list locally if any surveys were updated or merged
      if (syncedCount > 0) {
        persistAllSurveys(updatedSurveys);
        this.setLastSyncTime(timestampIso);
      }

      let msg = '';
      if (syncedCount > 0) {
        if (conflictsResolved > 0) {
          msg = `Sinkronisasi selesai: ${syncedCount} kuesioner tersimpan. ${conflictsResolved} konflik multi-pengguna berhasil digabungkan otomatis (Auto-Resolved).`;
        } else {
          msg = `Sinkronisasi berhasil: ${syncedCount} data kuesioner telah tersimpan di Firebase Cloud.`;
        }
      } else if (failedCount > 0) {
        msg = `Gagal mengunggah ${failedCount} kuesioner ke cloud.`;
      } else {
        msg = 'Data cloud sudah mutakhir.';
      }

      this.isSyncing = false;
      this.notify(msg);

      return {
        syncedCount,
        failedCount,
        totalPending: this.getPendingItems().length,
        conflictsResolved
      };
    } catch (err) {
      console.error('[OfflineSync] Kesalahan proses sinkronisasi:', err);
      this.isSyncing = false;
      this.notify('Gagal menghubungkan ke Firebase.');
      return {
        syncedCount,
        failedCount: pendingItems.length,
        totalPending: pendingItems.length,
        conflictsResolved
      };
    }
  }
}

export const offlineSyncManager = new OfflineSyncManager();
