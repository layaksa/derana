import React, { useState, useRef, useEffect } from 'react';
import { 
  Compass, 
  RotateCcw, 
  Sparkles, 
  Download, 
  MapPin, 
  FileCheck,
  Languages,
  LayoutDashboard,
  FileEdit,
  Plus,
  ChevronDown,
  Scale,
  Shield,
  ShieldCheck,
  User,
  UserCheck,
  LogOut,
  Users,
  Lock,
  Unlock,
  Check
} from 'lucide-react';
import { calculateOverallProgress } from '../utils/calculations';
import { InstrumenPemetaanBahasaData, SurveyRecord } from '../types/linguistic';
import { AppUser } from '../types/auth';
import { NavigationStepper } from './NavigationStepper';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

interface HeaderProps {
  data: InstrumenPemetaanBahasaData;
  surveys: SurveyRecord[];
  activeSurveyId: string | null;
  currentView: 'dashboard' | 'form' | 'comparison';
  onChangeView: (view: 'dashboard' | 'form' | 'comparison') => void;
  onSelectSurvey: (id: string) => void;
  onCreateNew: (type: 'empty' | 'sample') => void;
  onResetEmpty: () => void;
  onLoadSample: () => void;
  onSaveLocal: () => void;
  onOpenExport: () => void;
  onScrollToSection: (sectionId: string) => void;
  activeSection?: string;
  lastSavedTime: string | null;
  currentUser: AppUser | null;
  canEditActiveSurvey?: { allowed: boolean; reason?: string };
  onLogout: () => void;
  onOpenProfile?: () => void;
  onOpenUserManagement?: () => void;
  onQuickSwitchUser?: (username: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  data,
  surveys,
  activeSurveyId,
  currentView,
  onChangeView,
  onSelectSurvey,
  onCreateNew,
  onResetEmpty,
  onLoadSample,
  onSaveLocal,
  onOpenExport,
  onScrollToSection,
  activeSection = 'section-1',
  lastSavedTime,
  currentUser,
  canEditActiveSurvey = { allowed: true },
  onLogout,
  onOpenProfile,
  onOpenUserManagement,
  onQuickSwitchUser
}) => {
  const { language, t } = useLanguage();
  const progress = calculateOverallProgress(data);
  const activeSurvey = surveys.find(s => s.id === activeSurveyId);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isEditable = canEditActiveSurvey.allowed;
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-3 gap-3">
          {/* Logo, App Title, and Main View Tabs */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div 
              onClick={() => onChangeView('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 shrink-0 group-hover:opacity-95 transition-opacity">
                <Languages className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-tight">
                    Sistem Pemetaan Bahasa
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Dialektometri
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal">
                  Penginputan & Manajemen Data Survei Kebahasaan
                </p>
              </div>
            </div>

            {/* View Switcher: Dashboard vs Form vs Comparison */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
              <button
                id="btn-view-dashboard"
                onClick={() => onChangeView('dashboard')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  currentView === 'dashboard'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800">
                  {surveys.length}
                </span>
              </button>

              <button
                id="btn-view-form"
                onClick={() => onChangeView('form')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  currentView === 'form'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>Kuesioner</span>
              </button>

              <button
                id="btn-view-comparison"
                onClick={() => onChangeView('comparison')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  currentView === 'comparison'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-teal-500 group-hover:text-teal-600" />
                <span>Komparasi 2–3 Bahasa</span>
              </button>
            </div>
          </div>

          {/* Action buttons & Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Switch Survey Dropdown (if in form view and multiple surveys) */}
            {currentView === 'form' && surveys.length > 0 && (
              <div className="relative inline-flex items-center">
                <select
                  value={activeSurveyId || ''}
                  onChange={e => onSelectSurvey(e.target.value)}
                  title="Pilih survei yang ingin diedit"
                  className="text-xs font-semibold rounded-lg border border-slate-300 py-1.5 pl-2.5 pr-7 bg-white text-slate-700 hover:border-indigo-400 focus:outline-hidden focus:border-indigo-500 max-w-[180px] sm:max-w-[220px] truncate"
                >
                  {surveys.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.progress}%)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {currentView === 'form' ? (
              <>
                {!isEditable && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span className="hidden sm:inline">Hanya Baca</span>
                  </div>
                )}

                <button
                  id="btn-jump-map"
                  onClick={() => onScrollToSection('section-16')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Peta & Dialektometri</span>
                </button>

                <button
                  id="btn-create-new-from-header"
                  onClick={() => onCreateNew('empty')}
                  title="Mulai membuat survei titik pengamatan baru"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Survei Baru</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onCreateNew('empty')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Formulir Baru</span>
                </button>

                <button
                  onClick={() => onCreateNew('sample')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>+ Contoh Survei</span>
                </button>
              </>
            )}

            {/* User Profile & Role Dropdown */}
            {currentUser && (
              <div className="relative ml-1" ref={userMenuRef}>
                <button
                  type="button"
                  id="btn-user-profile-menu"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`inline-flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                    isAdmin
                      ? 'bg-indigo-50 hover:bg-indigo-100/80 border-indigo-200 text-indigo-900'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isAdmin ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white'
                  }`}>
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block max-w-[130px] truncate">
                    <div className="text-[11px] font-bold leading-tight truncate">{currentUser.name}</div>
                    <div className="text-[9px] text-slate-500 flex items-center gap-1">
                      {isAdmin ? (
                        <span className="text-indigo-600 font-bold flex items-center gap-0.5">
                          <ShieldCheck className="w-2.5 h-2.5" /> Super Admin
                        </span>
                      ) : (
                        <span className="text-blue-600 font-medium flex items-center gap-0.5">
                          <UserCheck className="w-2.5 h-2.5" /> Surveyor
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3.5 py-2.5 border-b border-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Akun Pengguna</span>
                        {isAdmin ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                            Superuser / Admin
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                            Surveyor Lapangan
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">@{currentUser.username} • {currentUser.email}</div>
                      {currentUser.institution && (
                        <div className="text-[11px] text-slate-600 mt-1 font-medium">{currentUser.institution}</div>
                      )}
                      <div className="text-[10px] text-indigo-700 bg-indigo-50/80 p-1.5 rounded-md mt-2 border border-indigo-100">
                        {isAdmin 
                          ? '✨ Hak Super Admin: Dapat mengubah SEMUA isian survei, verifikasi data, dan kelola pengguna.' 
                          : '📝 Hak Surveyor: Dapat menginput survei baru dan mengubah survei yang Anda buat.'}
                      </div>
                    </div>

                    {/* Pilihan Bahasa Antarmuka */}
                    <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                          {t('navbar.language', 'Pilihan Bahasa')}
                        </span>
                        <span className="text-xs font-semibold text-slate-800">
                          {language === 'id' ? 'Bahasa Indonesia' : 'English'}
                        </span>
                      </div>
                      <LanguageSelector variant="segmented" />
                    </div>

                    {/* Menu Profil Peneliti Action */}
                    <div className="px-2 py-1.5 border-b border-slate-100">
                      <button
                        type="button"
                        id="btn-open-profile-menu"
                        onClick={() => { setIsUserMenuOpen(false); if (onOpenProfile) onOpenProfile(); }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-indigo-50/70 hover:text-indigo-900 rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4 text-indigo-600" />
                          <span>{t('navbar.profile', 'Menu Profil Peneliti')}</span>
                        </span>
                        <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">{t('action.view', 'Lihat')}</span>
                      </button>
                    </div>

                    {/* Super Admin User Management button */}
                    {isAdmin && onOpenUserManagement && (
                      <div className="px-2 py-1.5 border-b border-slate-100">
                        <button
                          type="button"
                          id="btn-open-user-management"
                          onClick={() => { setIsUserMenuOpen(false); onOpenUserManagement(); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 rounded-xl transition-colors text-left cursor-pointer"
                        >
                          <Users className="w-4 h-4 text-indigo-600" />
                          <span>Kelola Pengguna & Hak Akses</span>
                        </button>
                      </div>
                    )}

                    {/* Quick Switch Demo Accounts */}
                    {onQuickSwitchUser && (
                      <div className="px-3.5 py-2 border-b border-slate-100">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
                          Ganti Akun Cepat (Uji Peran)
                        </div>
                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={() => { setIsUserMenuOpen(false); onQuickSwitchUser('fadhillah.admin'); }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                              currentUser.username === 'fadhillah.admin' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <span className="truncate">Fadhillah Pandu Pradana (Admin Maluku)</span>
                            {currentUser.username === 'fadhillah.admin' && <Check className="w-3 h-3 text-indigo-600 shrink-0" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setIsUserMenuOpen(false); onQuickSwitchUser('fadhillah.surveyor'); }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                              currentUser.username === 'fadhillah.surveyor' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <span className="truncate">Fadhillah Pandu Pradana (Surveyor Maluku)</span>
                            {currentUser.username === 'fadhillah.surveyor' && <Check className="w-3 h-3 text-indigo-600 shrink-0" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setIsUserMenuOpen(false); onQuickSwitchUser('budi.santoso'); }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                              currentUser.username === 'budi.santoso' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <span className="truncate">Budi Santoso (Surveyor Jabar)</span>
                            {currentUser.username === 'budi.santoso' && <Check className="w-3 h-3 text-indigo-600 shrink-0" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setIsUserMenuOpen(false); onQuickSwitchUser('admin'); }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                              currentUser.username === 'admin' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <span className="truncate">Dr. Hendra (Koordinator Pusat)</span>
                            {currentUser.username === 'admin' && <Check className="w-3 h-3 text-indigo-600 shrink-0" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Logout */}
                    <div className="px-2 pt-1.5">
                      <button
                        type="button"
                        id="btn-logout"
                        onClick={() => { setIsUserMenuOpen(false); onLogout(); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Keluar dari Akun (Logout)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Progress bar and metadata sub-strip */}
        {currentView === 'form' && (
          <div className="py-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                <strong className="text-slate-700 font-semibold">Titik Pengamatan:</strong>
                <span className="text-slate-900 font-medium truncate max-w-xs sm:max-w-md">
                  {data.titikPengamatan.namaDesa 
                    ? `${data.titikPengamatan.namaDesa} (${data.titikPengamatan.bahasaDigunakan || 'Bahasa belum diisi'})` 
                    : 'Formulir Baru (Belum diisi)'}
                </span>
              </span>

              {lastSavedTime && (
                <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Tersimpan: {lastSavedTime}</span>
                </span>
              )}

              {/* Creator & Verification badge */}
              {activeSurvey?.createdByName && (
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  <User className="w-3 h-3 text-slate-500" />
                  <span>Penginput: <strong>{activeSurvey.createdByName}</strong></span>
                  {activeSurvey.isVerified && (
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-1 py-0.2 rounded text-[10px] ml-1 border border-emerald-200">
                      ✓ Terverifikasi
                    </span>
                  )}
                  {!isEditable && (
                    <span className="text-amber-800 font-bold bg-amber-50 px-1.5 py-0.2 rounded text-[10px] ml-1 border border-amber-200">
                      Mode Baca
                    </span>
                  )}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-600 font-medium">
                Kelengkapan: <span className="text-indigo-600 font-bold">{progress}%</span>
              </span>
              <div className="w-32 bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Row 3: Stay-in-Place 16-Section Stepper / Quick Navigator */}
        {currentView === 'form' && (
          <div className="border-t border-slate-200/90 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-slate-50/90">
            <NavigationStepper
              activeSection={activeSection}
              onSelectSection={onScrollToSection}
            />
          </div>
        )}
      </div>
    </header>
  );
};

