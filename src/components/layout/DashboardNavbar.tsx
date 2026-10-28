import React, { useState, useRef, useEffect } from 'react';
import { 
  PanelLeft, 
  Search, 
  Bell, 
  Sparkles, 
  RotateCcw,
  ShieldCheck,
  User,
  LogOut,
  Users,
  Settings,
  Layers,
  Cloud,
  CloudOff,
  RefreshCw,
  Database,
  Compass,
  FileText,
  BookOpen
} from 'lucide-react';
import { SurveyRecord } from '../../types/linguistic';
import { AppUser } from '../../types/auth';
import { ThemeToggle } from '../ThemeToggle';
import { FirebaseConnectionStatus, firebaseConfig } from '../../lib/firebase';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageSelector } from '../LanguageSelector';

interface DashboardNavbarProps {
  onToggleMobileSidebar: () => void;
  onToggleDesktopSidebar: () => void;
  onOpenSearch: () => void;
  onNavigateToMap?: () => void;
  onOpenPRD?: () => void;
  onNavigateToDokumentasi?: () => void;
  surveys?: SurveyRecord[];
  activeSurveyId?: string | null;
  onSelectSurvey?: (id: string) => void;
  onCreateNewSurvey?: () => void;
  onSave: () => void;
  lastSavedTime: string | null;
  onOpenExport: () => void;
  onOpenRegionalReport?: () => void;
  onNavigateToPetaCarto?: () => void;
  currentUser: AppUser | null;
  onOpenProfile: () => void;
  onOpenUserManagement: () => void;
  onLogout: () => void;
  canEdit: boolean;
  villageName?: string;
  activeScreenNumber?: number;
  totalScreens?: number;
  currentViewTitle?: string;
  firebaseStatus?: FirebaseConnectionStatus;
  pendingSyncCount?: number;
  onManualSync?: () => void;
}

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  onToggleMobileSidebar,
  onToggleDesktopSidebar,
  onOpenSearch,
  onNavigateToMap,
  onOpenPRD,
  onNavigateToDokumentasi,
  surveys = [],
  activeSurveyId,
  onSelectSurvey,
  onCreateNewSurvey,
  onSave,
  lastSavedTime,
  onOpenExport,
  onOpenRegionalReport,
  onNavigateToPetaCarto,
  currentUser,
  onOpenProfile,
  onOpenUserManagement,
  onLogout,
  canEdit,
  villageName,
  activeScreenNumber,
  totalScreens = 16,
  currentViewTitle,
  firebaseStatus = 'connected',
  pendingSyncCount = 0,
  onManualSync
}) => {
  const { language, t } = useLanguage();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isCloudDropdownOpen, setIsCloudDropdownOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const cloudDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (cloudDropdownRef.current && !cloudDropdownRef.current.contains(e.target as Node)) {
        setIsCloudDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTriggerSync = async () => {
    if (!onManualSync) return;
    setIsSyncing(true);
    try {
      await onManualSync();
    } finally {
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  const initials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AD';

  return (
    <header className="bg-[var(--background)]/98 dark:bg-slate-900/98 sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] dark:border-slate-800 px-4 sm:px-6 transition-colors">
      {/* Left: Sidebar trigger + Screen breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={() => {
            if (window.innerWidth < 1024) {
              onToggleMobileSidebar();
            } else {
              onToggleDesktopSidebar();
            }
          }}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors focus:outline-hidden cursor-pointer"
          aria-label="Toggle Menu Sidebar"
          title="Buka/Tutup Menu"
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        {/* Current View Indicator / Screen breadcrumb */}
        {activeScreenNumber && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pl-2 border-l border-slate-200 dark:border-slate-800">
            <span className="font-semibold text-slate-900 dark:text-slate-100">Layar {activeScreenNumber}</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">/</span>
            <span>{totalScreens}</span>
          </div>
        )}
      </div>

      {/* Middle: Search Command Palette Bar */}
      <div className="flex-1 max-w-md mx-2 hidden md:block">
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/70 hover:bg-slate-200/60 dark:hover:bg-slate-800 border border-transparent text-xs text-slate-500 dark:text-slate-300 transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200" />
            <span className="truncate">Cari menu, halaman, atau kosakata...</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 font-mono shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions (ThemeToggle, Search Mobile, Save, Export, Notifications, User) */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Theme Mode Switcher */}
        <ThemeToggle variant="button" showLabel={true} />

        {/* Mobile Search Button */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
          title="Cari"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* In-App PWA Install Button */}
        <PWAInstallButton variant="compact" />

        {/* Firebase Cloud Connection & Sync Indicator */}
        <div className="relative" ref={cloudDropdownRef}>
          <button
            type="button"
            onClick={() => setIsCloudDropdownOpen(!isCloudDropdownOpen)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              firebaseStatus === 'connected'
                ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                : firebaseStatus === 'checking'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
            }`}
            title="Status Koneksi Firebase Firestore"
          >
            {firebaseStatus === 'connected' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden xl:inline font-medium">Cloud</span>
                {pendingSyncCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold" title={`${pendingSyncCount} data antre untuk diunggah`}>
                    {pendingSyncCount}
                  </span>
                )}
              </>
            ) : firebaseStatus === 'checking' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                <span className="hidden xl:inline">Koneksi...</span>
              </>
            ) : (
              <>
                <CloudOff className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span className="hidden xl:inline">Offline</span>
                {pendingSyncCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold" title={`${pendingSyncCount} data tersimpan lokal`}>
                    {pendingSyncCount}
                  </span>
                )}
              </>
            )}
          </button>

          {/* Cloud Info & Sync Popover */}
          {isCloudDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-80 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl p-3.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${
                    firebaseStatus === 'connected' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' : 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                  }`}>
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white leading-tight">Firebase Cloud Firestore</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Database Berkelanjutan & Sinkronisasi Spasial</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  firebaseStatus === 'connected'
                    ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                }`}>
                  {firebaseStatus === 'connected' ? 'Terhubung' : 'Terputus'}
                </span>
              </div>

              <div className="py-2.5 space-y-2 text-[11px]">
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Penyimpanan Cloud:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Aktif & Terproteksi</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 dark:text-slate-400">Status Data:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{surveys.length} Titik Survei Terdata</span>
                </div>
                {pendingSyncCount > 0 && (
                  <div className="flex justify-between items-center py-1 bg-amber-50 dark:bg-amber-950/40 px-2 rounded-md border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
                    <span>Antrian Unggah (Offline):</span>
                    <span className="font-bold">{pendingSyncCount} data kuesioner</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <button
                  type="button"
                  onClick={handleTriggerSync}
                  disabled={isSyncing}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="p-1.5 rounded-md hover:bg-[#f5f5f5] dark:hover:bg-slate-800 text-[#737373] dark:text-slate-400 hover:text-[#0a0a0a] dark:hover:text-slate-100 relative transition-colors"
            title="Pemberitahuan"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#1447e6] ring-2 ring-white dark:ring-slate-900" />
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-1.5 w-72 bg-white dark:bg-slate-900 rounded-md border border-[#e5e5e5] dark:border-slate-800 shadow-lg p-3 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#e5e5e5] dark:border-slate-800">
                <span className="font-semibold text-[#0a0a0a] dark:text-slate-100">Pemberitahuan Sistem</span>
                <span className="text-[10px] text-[#1447e6] dark:text-blue-400">Baru</span>
              </div>
              <div className="py-2 space-y-2">
                <div className="p-2 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 text-[11px] text-blue-900 dark:text-blue-200">
                  <p className="font-medium">Penyimpanan Aktif</p>
                  <p className="text-blue-700 dark:text-blue-300 mt-0.5">Semua data kuesioner otomatis dicadangkan ke IndexedDB / LocalStorage.</p>
                </div>
                <div className="p-2 rounded bg-[#f5f5f5] dark:bg-slate-800 text-[11px] text-[#737373] dark:text-slate-300">
                  <p className="font-medium text-[#0a0a0a] dark:text-slate-100">Mode Tampilan</p>
                  <p className="mt-0.5">Anda dapat beralih antara Mode Terang (Light Mode), Gelap (Dark Mode), atau Otomatis mengikuti Sistem.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Dropdown */}
        <div className="relative" ref={userDropdownRef}>
          <button
            type="button"
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="w-8 h-8 rounded-full bg-[#1447e6] text-[#eff6ff] flex items-center justify-center text-xs font-semibold shadow-2xs hover:ring-2 hover:ring-blue-300 dark:hover:ring-blue-500 transition-all cursor-pointer"
            title="Akun Pengguna"
          >
            {initials}
          </button>

          {isUserDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-slate-900 rounded-md border border-[#e5e5e5] dark:border-slate-800 shadow-lg py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-[#e5e5e5] dark:border-slate-800">
                <p className="font-semibold text-[#0a0a0a] dark:text-slate-100 truncate">
                  {currentUser?.name || 'Admin Derana'}
                </p>
                <p className="text-[11px] text-[#737373] dark:text-slate-400 truncate">
                  {currentUser?.email || 'admin@derana.id'}
                </p>
                <span className="inline-block mt-1 text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/60 text-[#1447e6] dark:text-blue-300">
                  {currentUser?.role || 'SURVEYOR'}
                </span>
              </div>

              {/* Quick theme selector in user menu */}
              <div className="px-3 py-2 border-b border-[#e5e5e5] dark:border-slate-800">
                <p className="text-[11px] font-medium text-[#737373] dark:text-slate-400 mb-1.5">
                  {t('navbar.theme', 'Tema Tampilan')}
                </p>
                <ThemeToggle variant="segmented" />
              </div>

              {/* Pilihan Bahasa in user menu */}
              <div className="px-3 py-2 border-b border-[#e5e5e5] dark:border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] font-medium text-[#737373] dark:text-slate-400">
                    {t('navbar.language', 'Pilihan Bahasa')}
                  </p>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-sky-400">
                    {language.toUpperCase()}
                  </span>
                </div>
                <LanguageSelector variant="segmented" className="w-full justify-center" />
              </div>

              {/* Install PWA Option in User Menu */}
              <div className="px-3 py-2 border-b border-[#e5e5e5] dark:border-slate-800">
                <p className="text-[11px] font-medium text-[#737373] dark:text-slate-400 mb-1.5">
                  {t('navbar.pwa', 'Akses Offline (PWA)')}
                </p>
                <PWAInstallButton variant="button" className="w-full justify-center text-xs" />
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    onOpenProfile();
                    setIsUserDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-[#f5f5f5] dark:hover:bg-slate-800 text-[#0a0a0a] dark:text-slate-200"
                >
                  <User className="w-3.5 h-3.5 text-[#737373] dark:text-slate-400" />
                  <span>{t('navbar.profile', 'Profil Peneliti')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenUserManagement();
                    setIsUserDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-[#f5f5f5] dark:hover:bg-slate-800 text-[#0a0a0a] dark:text-slate-200"
                >
                  <Settings className="w-3.5 h-3.5 text-[#737373] dark:text-slate-400" />
                  <span>{t('navbar.userManagement', 'Manajemen Pengguna')}</span>
                </button>
              </div>

              <div className="border-t border-[#e5e5e5] dark:border-slate-800 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    setIsUserDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  <span>{t('navbar.logout', 'Keluar')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
