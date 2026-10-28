import React, { useState } from 'react';
import { 
  GitMerge, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Layers, 
  Trash2, 
  X, 
  ShieldCheck, 
  RefreshCw,
  Info,
  Laptop,
  Cloud
} from 'lucide-react';
import { 
  ConflictResolutionStrategy, 
  ConflictResolutionLog 
} from '../../utils/conflictResolution';
import { offlineSyncManager } from '../../utils/offlineSyncManager';

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  isOpen,
  onClose
}) => {
  const [currentStrategy, setCurrentStrategy] = useState<ConflictResolutionStrategy>(() => 
    offlineSyncManager.getConflictStrategy()
  );
  const [logs, setLogs] = useState<ConflictResolutionLog[]>(() => 
    offlineSyncManager.getConflictLogs()
  );

  if (!isOpen) return null;

  const handleSelectStrategy = (strat: ConflictResolutionStrategy) => {
    setCurrentStrategy(strat);
    offlineSyncManager.setConflictStrategy(strat);
  };

  const handleClearLogs = () => {
    offlineSyncManager.clearConflictLogs();
    setLogs([]);
  };

  const strategies: {
    id: ConflictResolutionStrategy;
    title: string;
    subtitle: string;
    description: string;
    badge: string;
    isRecommended?: boolean;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'auto_resolve',
      title: 'Auto-Resolve (Smart 3-Way Merge)',
      subtitle: 'Penggabungan Butir & Bagian Cerdas',
      description: 'Secara cerdas menggabungkan data per bagian instrumen (narasumber, kosakata, geografi). Semua data yang diisi oleh kedua pengguna dipertahankan tanpa saling menimpa.',
      badge: 'Direkomendasikan',
      isRecommended: true,
      icon: <GitMerge className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
    },
    {
      id: 'last_write_wins',
      title: 'Terbaru Menang (Last-Write-Wins)',
      subtitle: 'Berdasarkan Cap Waktu Terakhir',
      description: 'Versi survei yang disimpan dengan cap waktu paling baru akan dipilih sebagai versi utama, mengabaikan versi sebelumnya.',
      badge: 'Standar Waktu',
      icon: <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
    },
    {
      id: 'prefer_local',
      title: 'Prioritaskan Data Lokal (Perangkat Ini)',
      subtitle: 'Simpan Suntingan Offline Saat Ini',
      description: 'Selalu gunakan perubahan yang dilakukan pada perangkat ini saat offline dan timpa data di Firebase Cloud.',
      badge: 'Lokal Prioritas',
      icon: <Laptop className="w-5 h-5 text-amber-600 dark:text-amber-400" />
    },
    {
      id: 'prefer_remote',
      title: 'Prioritaskan Data Cloud (Firebase)',
      subtitle: 'Gunakan Versi Server Terkini',
      description: 'Batalkan perubahan lokal yang bentrok dan terima data yang telah diunggah oleh pengguna lain di Firebase.',
      badge: 'Cloud Prioritas',
      icon: <Cloud className="w-5 h-5 text-purple-600 dark:text-purple-400" />
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/60 shrink-0">
              <GitMerge className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Manajemen & Resolusi Konflik Sinkronisasi
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Offline Sync V2
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pengaturan penanganan data survei jika diedit bersamaan oleh beberapa pengguna saat offline.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* Active Strategy Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Pilih Strategi Resolusi Konflik</span>
              </label>
              <span className="text-[11px] text-slate-500">
                Otomatis diterapkan saat sinkronisasi cloud
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {strategies.map((strat) => {
                const isSelected = currentStrategy === strat.id;
                return (
                  <div
                    key={strat.id}
                    onClick={() => handleSelectStrategy(strat.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500/80 dark:border-emerald-700 ring-1 ring-emerald-500/30'
                        : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {strat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {strat.title}
                        </span>
                        {strat.isRecommended && (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-2xs">
                            {strat.badge}
                          </span>
                        )}
                        {!strat.isRecommended && (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            {strat.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {strat.description}
                      </p>
                    </div>
                    <div className="shrink-0 self-center">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected 
                          ? 'border-emerald-600 bg-emerald-600 text-white' 
                          : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explanation Banner */}
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
              <strong className="font-semibold block text-blue-900 dark:text-blue-200 mb-0.5">
                Cara Kerja Auto-Resolve pada Instrumen Pemetaan Bahasa:
              </strong>
              Jika Tim Lapangan A mengisi data Narasumber 1 & 2 secara offline, sementara Tim Lapangan B mengisi Kosakata Swadesh 1–50 secara bersamaan, strategi <em>Auto-Resolve</em> menggabungkan kedua perubahan ke dalam satu rekaman survei lengkap tanpa menghapus data salah satu pihak.
            </div>
          </div>

          {/* Conflict History / Resolution Logs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Riwayat Resolusi Konflik ({logs.length})</span>
                </label>
              </div>
              {logs.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearLogs}
                  className="inline-flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Bersihkan Riwayat</span>
                </button>
              )}
            </div>

            {logs.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center bg-slate-50/50 dark:bg-slate-800/20">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Tidak Ada Konflik Data Tertunda
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Semua survei lokal dan cloud berada dalam kondisi tersinkronisasi tanpa benturan multi-pengguna.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-2xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          {log.surveyTitle}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ID: {log.surveyId} • Diselesaikan pada: {new Date(log.resolvedAt).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {log.strategy === 'auto_resolve' ? 'Auto-Resolved' : log.strategy}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      {log.summary}
                    </p>

                    {log.mergedSections && log.mergedSections.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {log.mergedSections.map((sec, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            ✓ {sec}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Strategi Aktif: <strong>{strategies.find(s => s.id === currentStrategy)?.title}</strong></span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
