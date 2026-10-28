import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { AppUser } from '../types/auth';
import { SurveyRecord } from '../types/linguistic';
import { ThemeToggle } from './ThemeToggle';
import { PengaturanBentoView } from './views/PengaturanBentoView';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser;
  surveys: SurveyRecord[];
  onUserUpdated?: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  surveys,
  onUserUpdated
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 lg:p-6 animate-in fade-in duration-150">
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-6xl w-full max-h-[92vh] flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        
        {/* Modal Top Quick Bar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block">
                Pengaturan & Manajemen Pengguna
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Pusat Kendali Administrasi & Distribusi Otoritas Balai Bahasa
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle variant="icon" />
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tutup dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Bento View */}
        <div className="p-4 sm:p-6 lg:p-7 overflow-y-auto flex-1">
          <PengaturanBentoView
            currentUser={currentUser}
            surveys={surveys}
            onUserUpdated={onUserUpdated}
            isModalMode={true}
            onCloseModal={onClose}
          />
        </div>

      </div>
    </div>
  );
};
