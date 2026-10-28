import React, { useState } from 'react';
import { 
  X, 
  User, 
  PencilLine,
  Activity,
  Mail, 
  Building, 
  MapPin, 
  ShieldCheck, 
  UserCheck, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Lock, 
  KeyRound, 
  Save, 
  AlertCircle, 
  Check, 
  LogOut, 
  Users, 
  ExternalLink,
  Shield,
  Eye,
  EyeOff,
  Globe
} from 'lucide-react';
import { AppUser } from '../types/auth';
import { SurveyRecord } from '../types/linguistic';
import { updateUserProfile, changeUserPassword } from '../utils/authStorage';
import { ThemeToggle } from './ThemeToggle';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser;
  surveys: SurveyRecord[];
  onUserUpdated: (updatedUser: AppUser) => void;
  onSelectSurvey?: (surveyId: string) => void;
  onOpenUserManagement?: () => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  surveys,
  onUserUpdated,
  onSelectSurvey,
  onOpenUserManagement,
  onLogout
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'edit' | 'language' | 'security'>('overview');

  // Edit profile state
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [institution, setInstitution] = useState(currentUser.institution || '');
  const [assignedRegion, setAssignedRegion] = useState(currentUser.assignedRegion || '');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Security / Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [securitySuccessMsg, setSecuritySuccessMsg] = useState<string | null>(null);
  const [securityErrorMsg, setSecurityErrorMsg] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  if (!isOpen) return null;

  const isAdmin = currentUser.role === 'admin';

  // Surveys created by this user
  const mySurveys = surveys.filter(s => s.createdBy === currentUser.id || s.createdBy === currentUser.username);
  const verifiedSurveysCount = mySurveys.filter(s => s.isVerified).length;
  const avgProgress = mySurveys.length > 0 
    ? Math.round(mySurveys.reduce((acc, s) => acc + (s.progress || 0), 0) / mySurveys.length) 
    : 0;

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrorMsg(null);
    setProfileSuccessMsg(null);

    if (!name.trim() || !email.trim()) {
      setProfileErrorMsg('Nama dan email wajib diisi.');
      return;
    }

    setSavingProfile(true);
    setTimeout(() => {
      const res = updateUserProfile(currentUser.id, {
        name: name.trim(),
        email: email.trim(),
        institution: institution.trim(),
        assignedRegion: assignedRegion.trim()
      });

      setSavingProfile(false);
      if (res.success && res.user) {
        setProfileSuccessMsg(res.message);
        onUserUpdated(res.user);
        setTimeout(() => setProfileSuccessMsg(null), 3000);
      } else {
        setProfileErrorMsg(res.message);
      }
    }, 200);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityErrorMsg(null);
    setSecuritySuccessMsg(null);

    if (!currentPassword) {
      setSecurityErrorMsg('Masukkan kata sandi saat ini.');
      return;
    }

    if (newPassword.length < 6) {
      setSecurityErrorMsg('Kata sandi baru minimal 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityErrorMsg('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setSavingPassword(true);
    setTimeout(() => {
      const res = changeUserPassword(currentUser.id, currentPassword, newPassword);
      setSavingPassword(false);
      if (res.success) {
        setSecuritySuccessMsg(res.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSecuritySuccessMsg(null), 3500);
      } else {
        setSecurityErrorMsg(res.message);
      }
    }, 200);
  };

  // Format date
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Tidak diketahui';
    try {
      return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="relative bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-[0_24px_80px_rgba(15,23,42,0.16)] max-w-6xl w-full max-h-[94vh] flex flex-col border border-slate-200/70 dark:border-slate-800/80 overflow-hidden transition-colors">
        
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100/80 dark:border-slate-800 flex items-center justify-between bg-white/95 dark:bg-slate-900/95 transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-sky-400 flex items-center justify-center font-bold text-sm">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('profile.title', 'Menu Profil Peneliti')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('profile.subtitle', 'Informasi akun, aktivitas riset, dan pengaturan')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector variant="segmented" />
            <ThemeToggle variant="icon" />
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Researcher Identity Card Header */}
        <div className="px-6 py-7 sm:px-8 bg-gradient-to-r from-slate-50 via-white to-indigo-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border-b border-slate-100 dark:border-slate-800 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-xs shrink-0 ${
                isAdmin 
                  ? 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none' 
                  : 'bg-blue-600 text-white shadow-blue-200 dark:shadow-none'
              }`}>
                {currentUser.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    {currentUser.name}
                  </h3>
                  {isAdmin ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      <ShieldCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                      <span>{t('profile.role.admin', 'Superuser / Admin')}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      <UserCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span>{t('profile.role.surveyor', 'Surveyor Lapangan')}</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono text-slate-600 dark:text-slate-300">@{currentUser.username}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{currentUser.email}</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300 pt-0.5">
                  {currentUser.institution && (
                    <span className="flex items-center gap-1">
                      <Building className="w-3 h-3 text-slate-400" />
                      <span>{currentUser.institution}</span>
                    </span>
                  )}
                  {currentUser.assignedRegion && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{currentUser.assignedRegion}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick action button: Switch/Admin */}
            {isAdmin && onOpenUserManagement && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenUserManagement();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
              >
                <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{t('profile.manageUsers', 'Manajemen Pengguna')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 bg-white dark:bg-slate-900 transition-colors overflow-x-auto my-2.5">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'overview'
                ? 'border-indigo-600 dark:border-sky-400 text-indigo-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t('profile.tab.overview', 'Aktivitas & Kuesioner')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'edit'
                ? 'border-indigo-600 dark:border-sky-400 text-indigo-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <PencilLine className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t('profile.tab.edit', 'Ubah Profil')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('language')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'language'
                ? 'border-indigo-600 dark:border-sky-400 text-indigo-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
            <span>{t('profile.tab.language', 'Pilihan Bahasa')}</span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
              {language.toUpperCase()}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'security'
                ? 'border-indigo-600 dark:border-sky-400 text-indigo-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{t('profile.tab.security', 'Keamanan & Sandi')}</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-50/80 dark:bg-slate-950/40 transition-colors">
          
          {/* TAB 1: OVERVIEW & ACTIVITY */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Language Selector Quick Card */}
              <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors bg-gradient-to-r from-blue-50/60 via-white to-white dark:from-sky-950/20 dark:via-slate-900 dark:to-slate-900">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        {t('profile.language.title', 'Pilihan Bahasa Antarmuka')}
                      </h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                        {language === 'id' ? 'ID (Indonesia)' : 'EN (English)'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {language === 'id'
                        ? 'Bahasa antarmuka saat ini: Bahasa Indonesia (Baku BRIN/Badan Bahasa).'
                        : 'Current interface language: English (International Dialectological Standard).'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                  <LanguageSelector variant="segmented" />
                  <button
                    type="button"
                    onClick={() => setActiveTab('language')}
                    className="text-xs font-semibold text-blue-600 dark:text-sky-400 hover:underline px-1 cursor-pointer"
                  >
                    {t('profile.overview.changeLanguage', 'Ubah Bahasa')} &rarr;
                  </button>
                </div>
              </div>

              {/* Theme Selector Card */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {t('profile.overview.themeTitle', 'Mode Tampilan Sistem')}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {t('profile.overview.themeDesc', 'Pilih antara mode terang (Light Mode) atau mode gelap (Dark Mode).')}
                  </p>
                </div>
                <ThemeToggle variant="segmented" />
              </div>

              {/* Stat Cards */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                    <span className="text-xs font-medium">{t('profile.overview.surveysEntered', 'Survei Diinput')}</span>
                    <FileText className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{mySurveys.length}</div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">{t('profile.overview.surveysEnteredDesc', 'Kuesioner atas nama Anda')}</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                    <span className="text-xs font-medium">{t('profile.overview.verified', 'Terverifikasi')}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{verifiedSurveysCount}</div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">Telah diverifikasi Admin</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                    <span className="text-xs font-medium">{t('profile.overview.avgProgress', 'Rata-rata Progres')}</span>
                    <Clock className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-sky-400">{avgProgress}%</div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">{t('profile.overview.progressDesc', 'Tingkat kelengkapan isian')}</div>
                </div>
              </div>

              {/* Role Permissions Box */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-sky-400" />
                  <span>{t('profile.overview.permissions', 'Wewenang & Hak Akses Akun')}</span>
                </h4>
                {isAdmin ? (
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <p className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-medium">
                      <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Dapat mengubah dan memperbarui SEMUA kuesioner dari seluruh surveyor.</span>
                    </p>
                    <p className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-medium">
                      <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Berhak memberikan tanda <strong>Verifikasi Resmi</strong> pada data lapangan.</span>
                    </p>
                    <p className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-medium">
                      <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Berhak menambah, mengubah status, dan mengelola akun peneliti lainnya.</span>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <p className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Dapat membuat survei baru dan mengedit survei buatan Anda secara mandiri.</span>
                    </p>
                    <p className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Kuesioner peneliti lain dapat dibuka dalam <strong>Mode Baca (Read-Only)</strong> atau diduplikasi ke akun Anda.</span>
                    </p>
                  </div>
                )}
              </div>

              {/* List of Surveys by this user */}
              <div className="lg:col-span-12 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Kuesioner Milik Anda ({mySurveys.length})
                  </h4>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">Klik untuk langsung membuka</span>
                </div>

                {mySurveys.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-6 text-center text-xs text-slate-600 dark:text-slate-400">
                    Belum ada kuesioner yang dibuat atas nama akun ini. Anda dapat membuat kuesioner baru melalui tombol "+ Formulir Baru".
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {mySurveys.map(s => (
                      <div
                        key={s.id}
                        className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 transition-all flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {s.title}
                            </span>
                            {s.isVerified && (
                              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-0.5 shrink-0">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Terverifikasi
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-3">
                            <span>{s.desa ? `${s.desa}, ${s.kabupatenKota}` : 'Lokasi survei'}</span>
                            <span>•</span>
                            <span>Progres: {s.progress || 0}%</span>
                          </div>
                        </div>

                        {onSelectSurvey && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectSurvey(s.id);
                              onClose();
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-sky-400 hover:text-indigo-700 bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
                          >
                            <span>{t('profile.overview.open', 'Buka')}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: EDIT PROFILE */}
          {activeTab === 'edit' && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {profileSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {profileErrorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{profileErrorMsg}</span>
                </div>
              )}

              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs transition-colors">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap & Gelar *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="misal: Dr. Siti Nurhaliza, M.Hum."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-indigo-600 dark:focus:border-sky-400 focus:ring-2 focus:ring-indigo-600/10"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Username (Tidak dapat diubah)
                    </label>
                    <input
                      type="text"
                      value={currentUser.username}
                      disabled
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Alamat Email *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="email@instansi.id"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-indigo-600 dark:focus:border-sky-400 focus:ring-2 focus:ring-indigo-600/10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Institusi / Balai Bahasa
                    </label>
                    <input
                      type="text"
                      value={institution}
                      onChange={e => setInstitution(e.target.value)}
                      placeholder="Balai Bahasa / Universitas"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-indigo-600 dark:focus:border-sky-400 focus:ring-2 focus:ring-indigo-600/10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Wilayah Penugasan
                    </label>
                    <input
                      type="text"
                      value={assignedRegion}
                      onChange={e => setAssignedRegion(e.target.value)}
                      placeholder="misal: Kab. Sukabumi & Garut"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-indigo-600 dark:focus:border-sky-400 focus:ring-2 focus:ring-indigo-600/10"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingProfile ? t('profile.saving', 'Menyimpan...') : t('profile.saveChanges', 'Simpan Perubahan')}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB: LANGUAGE SELECTION */}
          {activeTab === 'language' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-start justify-between gap-3 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-white dark:from-sky-950/40 dark:via-slate-850 dark:to-slate-900 p-4 sm:p-5 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 shadow-2xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {t('profile.language.title', 'Pilihan Bahasa Antarmuka')}
                      </h3>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-2xs">
                        {language.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {t('profile.language.desc', 'Pilih bahasa tampilan untuk aplikasi. Perubahan diterapkan secara instan ke seluruh antarmuka tanpa perlu memuat ulang.')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rich Language Selection Cards */}
              <LanguageSelector variant="cards" />

              {/* Linguistic & Dialectometric Terminology Specification */}
              <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Cakupan Dinamisasi Bahasa Aplikasi</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400 pt-1">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <strong className="text-slate-800 dark:text-slate-200 block mb-1">
                      🇮🇩 Bahasa Indonesia
                    </strong>
                    <p className="text-[11px] leading-relaxed">
                      Sesuai Pedoman Umum Pembentukan Istilah (PUPI) dan terminologi baku Badan Riset dan Inovasi Nasional (BRIN) serta Badan Bahasa Kemendikbudristek untuk pemetaan bahasa daerah Nusantara.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <strong className="text-slate-800 dark:text-slate-200 block mb-1">
                      🇬🇧 English
                    </strong>
                    <p className="text-[11px] leading-relaxed">
                      Aligned with International Phonetic Association (IPA) nomenclature, Guiter dialectometrical distance metrics, isogloss bundle analysis, and comparative linguistic methods.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Status Penyimpanan: <strong>LocalStorage (Aktif Otomatis)</strong></span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Tersinkronisasi Realtime</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY & PASSWORD */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              {/* FIREBASE EMAIL & PASSWORD AUTH STATUS CARD */}
              <div className="bg-gradient-to-br from-indigo-50/90 via-slate-50 to-emerald-50/40 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border border-indigo-200 dark:border-slate-700 rounded-xl p-4 shadow-xs space-y-3 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-indigo-100 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">
                        Otentikasi Firebase (Email & Kata Sandi)
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-300">
                        Project ID: <span className="font-mono text-indigo-700 dark:text-sky-400 font-semibold">derana-map</span> • Aman & Mandiri
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 self-start sm:self-auto">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Aktif & Terlindungi
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 bg-white/70 dark:bg-slate-950 rounded-lg p-2.5 border border-indigo-100/60 dark:border-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Email Terdaftar:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {currentUser.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Metode Masuk:</span>
                    <span className="font-mono text-[10px] text-indigo-700 dark:text-sky-400 font-semibold">
                      Firebase Email & Password
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Status Sinkronisasi:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Cloud Firestore & Local Storage
                    </span>
                  </div>
                </div>
              </div>

              {/* PASSWORD FORM */}
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {securitySuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{securitySuccessMsg}</span>
                </div>
              )}

              {securityErrorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>{securityErrorMsg}</span>
                </div>
              )}

              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs transition-colors">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kata Sandi Saat Ini *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      required
                      placeholder="Masukkan kata sandi lama..."
                      className="w-full pr-10 pl-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-indigo-600 dark:focus:border-sky-400 focus:ring-2 focus:ring-indigo-600/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Kata Sandi Baru *
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      placeholder="Minimal 6 karakter"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-indigo-600 dark:focus:border-sky-400 focus:ring-2 focus:ring-indigo-600/10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Konfirmasi Kata Sandi Baru *
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Ulangi kata sandi baru"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-indigo-600 dark:focus:border-sky-400 focus:ring-2 focus:ring-indigo-600/10"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{savingPassword ? 'Menyimpan...' : 'Perbarui Kata Sandi'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        </div>

        {/* Footer Area: Info & Logout */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 transition-colors">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('profile.field.registered', 'Terdaftar')}: {formatDate(currentUser.createdAt)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('profile.logout', 'Keluar dari Akun')}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              {t('profile.close', 'Tutup')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
