import React, { useState } from 'react';
import { 
  ShieldCheck, 
  GraduationCap, 
  UserCheck, 
  Eye, 
  Settings, 
  Send, 
  CheckCircle2, 
  Compass, 
  Scale, 
  Layers, 
  Building, 
  MapPin, 
  Lock,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { AppUser, UserRole } from '../../types/auth';
import { getRoleBadge } from '../../utils/authStorage';

interface RoleDemonstrationBannerProps {
  currentUser: AppUser | null;
  onSwitchRole?: (role: UserRole) => void;
  onOpenRoleRequest: () => void;
  onOpenUserManagement: () => void;
  onNavigateToView?: (viewKey: any) => void;
  unverifiedSurveysCount?: number;
}

export const RoleDemonstrationBanner: React.FC<RoleDemonstrationBannerProps> = ({
  currentUser,
  onOpenRoleRequest,
  onOpenUserManagement,
  onNavigateToView,
  unverifiedSurveysCount = 0
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentRole: UserRole = currentUser?.role || 'tamu';
  const roleBadge = getRoleBadge(currentRole);
  const isPending = (currentRole === 'surveyor' || (currentRole as any) === 'user') && 
    (currentUser?.status === 'pending' || currentUser?.isApproved === false);

  const getRoleIcon = () => {
    if (isPending) {
      return <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    }
    switch (currentRole) {
      case 'admin':
        return <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'verifikator':
        return <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'surveyor':
      case 'user':
        return <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    }
  };

  return (
    <div className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-3 sm:py-3.5 shadow-sm transition-all mb-5">
      {/* PENDING APPROVAL SPECIAL BANNER */}
      {isPending && (
        <div className="mb-3.5 p-3.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-400 dark:border-amber-600/60 flex items-start sm:items-center justify-between gap-3 text-amber-950 dark:text-amber-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs animate-pulse">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold flex items-center gap-2 flex-wrap">
                <span>Akun Anda sedang menunggu persetujuan dari Admin Sistem.</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-extrabold uppercase tracking-wider">
                  Status: Menunggu Persetujuan
                </span>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 leading-snug">
                Pendaftaran Anda sebagai Surveyor Lapangan telah tercatat dalam sistem. Selama menunggu penugasan dan persetujuan dari Koordinator Utama/Admin Sistem, Anda dapat melihat instrumen, korpus, dan peta dalam mode baca.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Compact Main Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        
        {/* Left: Identity & Role */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
            {getRoleIcon()}
          </div>

          <div className="min-w-0 flex items-center gap-2 flex-wrap text-xs">
            <span className="font-bold text-slate-900 dark:text-white truncate">
              {currentUser?.name || 'Pengguna Riset'}
            </span>
            <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">·</span>
            <span className={`font-semibold ${roleBadge.text}`}>
              {roleBadge.label}
            </span>
            
            {currentRole === 'tamu' && (
              <span className="text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Hanya Baca</span>
              </span>
            )}

            <span className="hidden md:inline text-slate-300 dark:text-slate-600" aria-hidden="true">·</span>
            <span className="hidden md:inline text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
              {currentUser?.institution || 'Badan Pengembangan dan Pembinaan Bahasa'}
            </span>
          </div>
        </div>

        {/* Right: Quick Contextual Actions & Collapse Toggle */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
          {/* Action for Tamu */}
          {currentRole === 'tamu' && (
            <button
              type="button"
              onClick={onOpenRoleRequest}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer shadow-2xs"
            >
              <Send className="w-3 h-3" />
              <span>Ajukan Peran</span>
            </button>
          )}

          {/* Action for Verifikator */}
          {currentRole === 'verifikator' && onNavigateToView && (
            <button
              type="button"
              onClick={() => onNavigateToView('surveys')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-2xs"
            >
              <BadgeCheck className="w-3.5 h-3.5" />
              <span>Verifikasi ({unverifiedSurveysCount})</span>
            </button>
          )}

          {/* Action for Admin */}
          {currentRole === 'admin' && (
            <button
              type="button"
              onClick={() => {
                if (onNavigateToView) {
                  onNavigateToView('pengaturan');
                } else {
                  onOpenUserManagement();
                }
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer shadow-2xs"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Pengaturan</span>
            </button>
          )}

          {/* Toggle Detail Drawer */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isExpanded ? "Sembunyikan rincian peran" : "Lihat rincian hak akses peran"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Details Drawer */}
      {isExpanded && (
        <div className="pt-3 mt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300 space-y-2.5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-900 dark:text-white">
                Wilayah Tugas: {currentUser?.assignedRegion || 'Seluruh Wilayah Riset'}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {currentRole === 'tamu' && 'Anda memiliki hak pratinjau ilmiah tanpa izin penyuntingan atau verifikasi instrumen.'}
                {(currentRole === 'surveyor' || currentRole === 'user') && 'Anda berwenang mengumpulkan data lapangan (16 Seksi, Sastra Lisan, Vitalitas) dan menghitung dialektometri.'}
                {currentRole === 'verifikator' && 'Anda berwenang memeriksa akurasi fonologis/leksikal dan mengesahkan survei berstatus tervalidasi.'}
                {currentRole === 'admin' && 'Anda berwenang mengelola hak akses seluruh peneliti, menyetujui permohonan peran, dan konfigurasi sistem.'}
              </p>
            </div>

            {onNavigateToView && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1 sm:pt-0">
                <button
                  type="button"
                  onClick={() => onNavigateToView('dokumentasi')}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Panduan Peran →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
