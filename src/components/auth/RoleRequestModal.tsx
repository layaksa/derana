import React, { useState } from 'react';
import { 
  Shield, 
  UserCheck, 
  CheckCircle2, 
  Send, 
  X, 
  Building2, 
  FileText, 
  AlertCircle, 
  Sparkles, 
  GraduationCap, 
  MapPin,
  Clock
} from 'lucide-react';
import { AppUser, UserRole, RoleRequest } from '../../types/auth';
import { 
  submitRoleRequest, 
  loadRoleRequests, 
  getRoleBadge, 
  getRoleLabel, 
  getRoleDescription 
} from '../../utils/authStorage';

interface RoleRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser;
  onSuccess?: (msg: string) => void;
}

export const RoleRequestModal: React.FC<RoleRequestModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess
}) => {
  const [requestedRole, setRequestedRole] = useState<UserRole>(
    currentUser.role === 'tamu' ? 'surveyor' : 'verifikator'
  );
  const [institution, setInstitution] = useState(currentUser.institution || '');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const userRequests = loadRoleRequests().filter(r => r.userId === currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!institution.trim()) {
      setErrorMsg('Nama institusi/balai bahasa wajib diisi.');
      return;
    }
    if (!reason.trim() || reason.trim().length < 10) {
      setErrorMsg('Alasan pengajuan minimal 10 karakter.');
      return;
    }

    setIsSubmitting(true);
    const res = submitRoleRequest({
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      currentRole: currentUser.role,
      requestedRole,
      institution: institution.trim(),
      reason: reason.trim()
    });

    setIsSubmitting(false);
    if (res.success) {
      if (onSuccess) onSuccess(res.message);
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  const currentBadge = getRoleBadge(currentUser.role);
  const targetBadge = getRoleBadge(requestedRole);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-slate-800/80 dark:to-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Pengajuan Peran kepada Admin Sistem
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ajukan pendaftaran sebagai Surveyor Lapangan atau Verifikator Linguistik
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Status Akun Saat Ini */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {currentUser.email}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${currentBadge.bg} ${currentBadge.text} ${currentBadge.border}`}>
                Peran: {currentBadge.label}
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Pengajuan */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Pilihan Peran yang Dituju */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Pilih Peran yang Diajukan:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Opsi 1: Surveyor Lapangan */}
                <button
                  type="button"
                  onClick={() => setRequestedRole('surveyor')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    requestedRole === 'surveyor'
                      ? 'bg-blue-50/70 dark:bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/20'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Surveyor Lapangan
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Petugas pengumpul data instrumen 1-16, rekaman audio, dan kalkulasi pemetaan.
                  </p>
                </button>

                {/* Opsi 2: Verifikator Linguistik */}
                <button
                  type="button"
                  onClick={() => setRequestedRole('verifikator')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    requestedRole === 'verifikator'
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Verifikator Linguistik
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Peneliti & kurator dengan otoritas mengesahkan status data Tervalidasi.
                  </p>
                </button>
              </div>
            </div>

            {/* Institusi / Balai Bahasa */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Institusi / Balai Bahasa:
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="Contoh: Balai Bahasa Provinsi Jawa Barat / Universitas"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Alasan Pengajuan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Alasan Pengajuan & Rencana Penugasan:
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Jelaskan kebutuhan peran Anda (contoh: Ditugaskan mengumpulkan data dialektometri di Kabupaten Garut, atau melakukan kurasi ilmiah data instrumen)."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer transition-all active:scale-98 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Pengajuan ke Admin</span>
              </button>
            </div>
          </form>

          {/* Riwayat Pengajuan Sebelumnya */}
          {userRequests.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Riwayat Pengajuan Peran Anda</span>
              </h4>
              <div className="space-y-2">
                {userRequests.map(r => (
                  <div key={r.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {getRoleLabel(r.requestedRole)}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {r.reason}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : r.status === 'rejected'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {r.status === 'approved' ? 'Disetujui' : r.status === 'rejected' ? 'Ditolak' : 'Menunggu Admin'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
