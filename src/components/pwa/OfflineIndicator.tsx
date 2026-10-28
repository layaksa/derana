import React, { useState, useEffect } from 'react';
import { WifiOff, Database, CheckCircle2, RefreshCw, CloudUpload, X, GitMerge, Settings } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { offlineSyncManager, SyncStatusEvent } from '../../utils/offlineSyncManager';
import { ConflictResolutionModal } from './ConflictResolutionModal';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [syncStatus, setSyncStatus] = useState<SyncStatusEvent>(() => offlineSyncManager.getStatus());
  const [wasOffline, setWasOffline] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [dismissedOffline, setDismissedOffline] = useState(false);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);

  useEffect(() => {
    const unsub = offlineSyncManager.subscribe((status) => {
      setSyncStatus(status);
      if (status.lastSyncMessage) {
        setToastMessage(status.lastSyncMessage);
        setShowToast(true);
        const timer = setTimeout(() => setShowToast(false), 5500);
        return () => clearTimeout(timer);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setDismissedOffline(false);
    } else if (wasOffline) {
      // Reconnected!
      setToastMessage('Koneksi Internet Pulih — Mengunggah & memeriksa potensi konflik data...');
      setShowToast(true);
      offlineSyncManager.triggerAutoSync().then((res) => {
        if (res.syncedCount > 0) {
          if (res.conflictsResolved > 0) {
            setToastMessage(`Koneksi Pulih: ${res.syncedCount} kuesioner disinkronkan (${res.conflictsResolved} konflik digabungkan otomatis).`);
          } else {
            setToastMessage(`Koneksi Pulih: ${res.syncedCount} kuesioner berhasil diunggah ke Firebase Cloud.`);
          }
        } else {
          setToastMessage('Koneksi Internet Pulih — Semua data lokal sudah tersinkronisasi.');
        }
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          setWasOffline(false);
        }, 6000);
      });
    }
  }, [isOnline, wasOffline]);

  return (
    <>
      {/* Toast Notification for Sync & Auto-Resolved Conflicts */}
      {(showToast || syncStatus.isSyncing) && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900 text-white px-4 py-2.5 text-xs font-semibold shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          {syncStatus.isSyncing ? (
            <RefreshCw className="w-4 h-4 shrink-0 text-blue-400 animate-spin" />
          ) : syncStatus.lastResolvedConflict ? (
            <GitMerge className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          )}
          <div className="flex-1">
            <span>{toastMessage || (syncStatus.isSyncing ? 'Mengunggah data ke Firebase Cloud...' : 'Data tersinkronisasi.')}</span>
          </div>
          {syncStatus.lastResolvedConflict && (
            <button
              type="button"
              onClick={() => setIsConflictModalOpen(true)}
              className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer ml-1"
            >
              Lihat Detail
            </button>
          )}
          {!syncStatus.isSyncing && (
            <button
              type="button"
              onClick={() => setShowToast(false)}
              className="text-slate-400 hover:text-white p-0.5 ml-1"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Floating Offline Banner */}
      {!isOnline && !dismissedOffline && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 rounded-2xl bg-amber-600 dark:bg-amber-950 text-white p-3.5 shadow-2xl border border-amber-500/80 dark:border-amber-700/80 animate-in fade-in slide-in-from-bottom-3 backdrop-blur-md">
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/40 dark:bg-amber-900/60 text-white shrink-0 mt-0.5">
                <WifiOff className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold flex items-center gap-1.5 text-amber-100">
                  <span>Mode Offline Aktif</span>
                  <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
                </div>
                <p className="mt-1 text-[11px] text-amber-100/90 leading-relaxed">
                  Data kuesioner disimpan secara lokal di perangkat Anda.
                  {syncStatus.pendingCount > 0 ? (
                    <strong className="block text-white mt-1">
                      {syncStatus.pendingCount} kuesioner menunggu unggah otomatis. Strategi Auto-Resolve aktif jika ada konflik.
                    </strong>
                  ) : (
                    ' Anda dapat terus mengisi seluruh bagian formulir tanpa koneksi internet.'
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setIsConflictModalOpen(true)}
                  className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-amber-200 hover:text-white underline cursor-pointer"
                >
                  <GitMerge className="w-3 h-3" />
                  <span>Pengaturan Resolusi Konflik Auto-Resolve</span>
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDismissedOffline(true)}
              className="text-amber-200 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
              title="Sembunyikan pesan ini"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Conflict Resolution Settings & Log Modal */}
      <ConflictResolutionModal
        isOpen={isConflictModalOpen}
        onClose={() => setIsConflictModalOpen(false)}
      />
    </>
  );
};
