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
  onSelectSurvey?: (surveyId: string) => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  surveys,
  onUserUpdated,
  onSelectSurvey
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 lg:p-6 animate-in fade-in duration-150">
      <div className="relative bg-[var(--md-surface-container-lowest)] dark:bg-slate-900 rounded-3xl shadow-xl max-w-6xl w-full max-h-[92vh] flex flex-col border border-[var(--md-outline-variant)]/60 overflow-hidden transition-colors">
        
        {/* M3 Modal Top Bar */}
        <div className="px-6 py-4 border-b border-[var(--md-outline-variant)]/40 flex items-center justify-between bg-[var(--md-surface-container-low)] dark:bg-slate-900/90 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold shadow-2xs shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-semibold text-[var(--md-on-surface)] block">
                Pengaturan & Manajemen Pengguna
              </span>
              <span className="text-xs text-[var(--md-on-surface-variant)]">
                Pusat Kendali Administrasi & Otoritas Balai Bahasa (Material 3)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle variant="icon" />
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tutup dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: M3 Bento View */}
        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto flex-1 bg-[var(--md-surface-container-lowest)] dark:bg-slate-900">
          <PengaturanBentoView
            currentUser={currentUser}
            surveys={surveys}
            onUserUpdated={onUserUpdated}
            isModalMode={true}
            onCloseModal={onClose}
            onSelectSurvey={(id) => {
              if (onSelectSurvey) {
                onSelectSurvey(id);
              }
              onClose();
            }}
          />
        </div>

      </div>
    </div>
  );
};
