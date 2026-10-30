import React, { useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Database, 
  Fingerprint, 
  Languages, 
  BookOpen, 
  Mic, 
  Compass, 
  Layers, 
  Settings, 
  X, 
  Sparkles, 
  LogOut, 
  UserCheck, 
  HelpCircle,
  RefreshCw,
  FileText,
  Scale,
  ShieldCheck,
  GraduationCap,
  Eye,
  Send,
  Lock,
  CheckCircle2,
  Activity,
  Globe
} from 'lucide-react';
import { AppUser, UserRole } from '../../types/auth';
import { ThemeToggle } from '../ThemeToggle';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageSelector } from '../LanguageSelector';
import { getRoleBadge, getRoleLabel, loadRoleRequests } from '../../utils/authStorage';

export type ViewKey = 
  | 'dashboard'
  | 'peta-carto'
  | 'peta-sastra-lisan'
  | 'peta-vitalitas'
  | 'peta-revitalisasi'
  | 'peta-survei'
  | 'atlas-glottolog'
  | 'responden'
  | 'surveys'
  | 'datasets'
  | 'identitas'
  | 'kondisi-bahasa'
  | 'kosakata'
  | 'sastra-lisan'
  | 'dialektometri'
  | 'revitalisasi'
  | 'kuesioner'
  | 'kuesioner-pemetaan'
  | 'kuesioner-sastra-lisan'
  | 'kuesioner-vitalitas'
  | 'kuesioner-revitalisasi'
  | 'comparison'
  | 'form-screen'
  | 'form-all'
  | 'dokumentasi'
  | 'pengaturan';

interface AppSidebarProps {
  currentView: ViewKey;
  onChangeView: (view: ViewKey) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsedDesktop: boolean;
  onToggleCollapseDesktop: () => void;
  currentUser: AppUser | null;
  onLogout: () => void;
  onOpenProfile: () => void;
  onOpenUserManagement: () => void;
  onOpenRoleRequest?: () => void;
  onOpenPRD?: () => void;
  onOpenRegionalReport?: () => void;
  villageName?: string;
  totalSurveys?: number;
  unverifiedSurveysCount?: number;
  kuesionerTab?: 'pemetaan' | 'sastra-lisan' | 'vitalitas' | 'revitalisasi';
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentView,
  onChangeView,
  isOpenMobile,
  onCloseMobile,
  isCollapsedDesktop,
  onToggleCollapseDesktop,
  currentUser,
  onLogout,
  onOpenProfile,
  onOpenUserManagement,
  onOpenRoleRequest,
  onOpenPRD,
  onOpenRegionalReport,
  villageName,
  totalSurveys = 1,
  unverifiedSurveysCount = 0,
  kuesionerTab = 'pemetaan'
}) => {
  const { language, t } = useLanguage();
  const currentRole: UserRole = currentUser?.role || 'tamu';
  const roleBadge = getRoleBadge(currentRole);

  const pendingRequestsCount = useMemo(() => {
    if (currentRole !== 'admin') return 0;
    try {
      return loadRoleRequests().filter(r => r.status === 'pending').length;
    } catch {
      return 0;
    }
  }, [currentRole]);

  const handleSelect = (view: ViewKey) => {
    onChangeView(view);
    onCloseMobile();
  };

  // Build role-specific navigation groups tailored to user prompt specs
  const navGroups = useMemo(() => {
    // 1. TAMU / AKADEMISI (MODE HANYA BACA): Fokus Eksplorasi Empiris
    if (currentRole === 'tamu') {
      return [
        {
          title: 'Peta Spasial CARTO & GIS',
          items: [
            { key: 'peta-sastra-lisan' as ViewKey, label: 'Peta Sastra Lisan', icon: BookOpen, badge: null },
            { key: 'peta-vitalitas' as ViewKey, label: 'Peta Vitalitas Bahasa', icon: Activity, badge: null },
            { key: 'peta-revitalisasi' as ViewKey, label: 'Peta Revitalisasi Bahasa', icon: Sparkles, badge: null },
            { key: 'atlas-glottolog' as ViewKey, label: 'Peta Glottolog Nasional', icon: Globe, badge: null },
          ]
        },
        {
          title: 'Eksplorasi Empiris',
          items: [
            { key: 'comparison' as ViewKey, label: 'Perbandingan Dua Titik', icon: Scale, badge: null },
            { key: 'dialektometri' as ViewKey, label: 'Dialektometri dan Peta', icon: Compass, badge: null },
            { key: 'dashboard' as ViewKey, label: 'Dashboard Ringkasan', icon: LayoutDashboard, badge: null },
            { key: 'responden' as ViewKey, label: 'Data Responden & Informan', icon: Users, badge: null },
            { key: 'surveys' as ViewKey, label: 'Hasil Survei Lapangan', icon: BarChart3, badge: null }
          ]
        },
        {
          title: 'Korpus Kebahasaan',
          items: [
            { key: 'datasets' as ViewKey, label: 'Datasets & Titik Pengamatan', icon: Database, badge: null },
            { key: 'kosakata' as ViewKey, label: 'Kosakata (200 Swadesh)', icon: BookOpen, badge: null },
            { key: 'sastra-lisan' as ViewKey, label: 'Sastra Lisan', icon: Mic, badge: null },
            { key: 'kondisi-bahasa' as ViewKey, label: 'Kondisi Bahasa', icon: Languages, badge: null },
            { key: 'revitalisasi' as ViewKey, label: 'Revitalisasi Bahasa', icon: RefreshCw, badge: null }
          ]
        },
        {
          title: 'Instrumen Kuesioner',
          items: [
            { key: 'kuesioner' as ViewKey, label: 'Pusat Kuesioner', icon: Lock, badge: null },
            { key: 'kuesioner-pemetaan' as ViewKey, label: 'Pemetaan Bahasa (16 Seksi)', icon: Layers, badge: null },
            { key: 'kuesioner-sastra-lisan' as ViewKey, label: 'Pemetaan Sastra Lisan', icon: Mic, badge: null }
          ]
        },
        {
          title: 'Bantuan',
          items: [
            { key: 'dokumentasi' as ViewKey, label: 'Dokumentasi & Tata Cara', icon: HelpCircle, badge: null }
          ]
        }
      ];
    }

    // 2. SURVEYOR LAPANGAN: Fokus Mengisi Kuesioner & Hitungan Pemetaan
    if (currentRole === 'surveyor' || currentRole === 'user') {
      return [
        {
          title: 'Peta Spasial CARTO & GIS',
          items: [
            { key: 'peta-sastra-lisan' as ViewKey, label: 'Peta Sastra Lisan', icon: BookOpen, badge: null },
            { key: 'peta-vitalitas' as ViewKey, label: 'Peta Vitalitas Bahasa', icon: Activity, badge: null },
            { key: 'peta-revitalisasi' as ViewKey, label: 'Peta Revitalisasi Bahasa', icon: Sparkles, badge: null },
            { key: 'dialektometri' as ViewKey, label: 'Hitung Dialektometri & Peta', icon: Compass, badge: null },
            { key: 'atlas-glottolog' as ViewKey, label: 'Peta Glottolog Nasional', icon: Globe, badge: null }
          ]
        },
        {
          title: 'Kuesioner & Pengumpulan Data',
          items: [
            { key: 'kuesioner' as ViewKey, label: 'Pusat Kuesioner', icon: Layers, badge: null },
            { key: 'kuesioner-pemetaan' as ViewKey, label: 'Pemetaan Bahasa (16 Seksi)', icon: Layers, badge: null },
            { key: 'kuesioner-sastra-lisan' as ViewKey, label: 'Pemetaan Sastra Lisan', icon: Mic, badge: null },
            { key: 'kuesioner-vitalitas' as ViewKey, label: 'Vitalitas Bahasa', icon: Languages, badge: null },
            { key: 'kuesioner-revitalisasi' as ViewKey, label: 'Revitalisasi Bahasa Daerah', icon: Sparkles, badge: null },
            { key: 'responden' as ViewKey, label: 'Data Responden Lapangan', icon: Users, badge: null }
          ]
        },
        {
          title: 'Validasi & Hitungan',
          items: [
            { key: 'comparison' as ViewKey, label: 'Perbandingan Dua Titik', icon: Scale, badge: null },
            { key: 'surveys' as ViewKey, label: 'Status Isian Survei', icon: BarChart3, badge: null }
          ]
        },
        {
          title: 'Korpus & Wilayah',
          items: [
            { key: 'dashboard' as ViewKey, label: 'Dashboard', icon: LayoutDashboard, badge: null },
            { key: 'kosakata' as ViewKey, label: 'Kosakata (200 Swadesh)', icon: BookOpen, badge: null },
            { key: 'identitas' as ViewKey, label: 'Identitas Desa', icon: Fingerprint, badge: null },
            { key: 'datasets' as ViewKey, label: 'Datasets', icon: Database, badge: null }
          ]
        },
        {
          title: 'Bantuan',
          items: [
            { key: 'dokumentasi' as ViewKey, label: 'Dokumentasi & Tata Cara', icon: HelpCircle, badge: null }
          ]
        }
      ];
    }

    // 3. VERIFIKATOR LINGUISTIK: Fokus Otoritas Kurasi & Validasi Data
    if (currentRole === 'verifikator') {
      return [
        {
          title: 'Peta Spasial CARTO & GIS',
          items: [
            { key: 'peta-sastra-lisan' as ViewKey, label: 'Peta Sastra Lisan', icon: BookOpen, badge: null },
            { key: 'peta-vitalitas' as ViewKey, label: 'Peta Vitalitas Bahasa', icon: Activity, badge: null },
            { key: 'peta-revitalisasi' as ViewKey, label: 'Peta Revitalisasi Bahasa', icon: Sparkles, badge: null },
            { key: 'atlas-glottolog' as ViewKey, label: 'Peta Glottolog Nasional', icon: Globe, badge: null }
          ]
        },
        {
          title: 'Kurasi & Validasi',
          items: [
            { 
              key: 'surveys' as ViewKey, 
              label: 'Hasil Survei & Validasi', 
              icon: BarChart3, 
              badge: unverifiedSurveysCount > 0 ? `${unverifiedSurveysCount}` : null 
            },
            { key: 'dashboard' as ViewKey, label: 'Dashboard Evaluasi', icon: LayoutDashboard, badge: null },
            { key: 'comparison' as ViewKey, label: 'Perbandingan Dua Titik', icon: Scale, badge: null },
            { key: 'responden' as ViewKey, label: 'Data Responden & Informan', icon: Users, badge: null }
          ]
        },
        {
          title: 'Audit Fonetis & Korpus',
          items: [
            { key: 'kosakata' as ViewKey, label: 'Kosakata & Transkripsi IPA', icon: BookOpen, badge: null },
            { key: 'sastra-lisan' as ViewKey, label: 'Sastra Lisan & Tradisi', icon: Mic, badge: null },
            { key: 'dialektometri' as ViewKey, label: 'Dialektometri & Isoglos', icon: Compass, badge: null },
            { key: 'datasets' as ViewKey, label: 'Datasets Wilayah', icon: Database, badge: null }
          ]
        },
        {
          title: 'Kuesioner',
          items: [
            { key: 'kuesioner' as ViewKey, label: 'Pusat Kuesioner', icon: Layers, badge: null },
            { key: 'kuesioner-pemetaan' as ViewKey, label: 'Pemetaan Bahasa (16 Seksi)', icon: Layers, badge: null },
            { key: 'kuesioner-vitalitas' as ViewKey, label: 'Vitalitas Bahasa', icon: Languages, badge: null },
            { key: 'kuesioner-revitalisasi' as ViewKey, label: 'Revitalisasi Bahasa', icon: Sparkles, badge: null }
          ]
        },
        {
          title: 'Bantuan',
          items: [
            { key: 'dokumentasi' as ViewKey, label: 'Dokumentasi Kurasi', icon: HelpCircle, badge: null }
          ]
        }
      ];
    }

    // 4. ADMIN SISTEM: Otoritas Penuh & Pengaturan
    return [
      {
        title: 'Peta Spasial CARTO & GIS',
        items: [
          { key: 'peta-sastra-lisan' as ViewKey, label: 'Peta Sastra Lisan', icon: BookOpen, badge: null },
          { key: 'peta-vitalitas' as ViewKey, label: 'Peta Vitalitas Bahasa', icon: Activity, badge: null },
          { key: 'peta-revitalisasi' as ViewKey, label: 'Peta Revitalisasi Bahasa', icon: Sparkles, badge: null },
          { key: 'atlas-glottolog' as ViewKey, label: 'Peta Glottolog Nasional', icon: Globe, badge: null }
        ]
      },
      {
        title: 'Survei & Analisis',
        items: [
          { key: 'dashboard' as ViewKey, label: 'Dashboard', icon: LayoutDashboard, badge: null },
          { key: 'comparison' as ViewKey, label: 'Perbandingan Dua Titik', icon: Scale, badge: null },
          { key: 'responden' as ViewKey, label: 'Data Responden', icon: Users, badge: null },
          { key: 'surveys' as ViewKey, label: 'Hasil Survei & Validasi', icon: BarChart3, badge: unverifiedSurveysCount > 0 ? `${unverifiedSurveysCount}` : null }
        ]
      },
      {
        title: 'Korpus Kebahasaan',
        items: [
          { key: 'datasets' as ViewKey, label: 'Datasets', icon: Database, badge: null },
          { key: 'identitas' as ViewKey, label: 'Identitas Desa', icon: Fingerprint, badge: null },
          { key: 'kondisi-bahasa' as ViewKey, label: 'Kondisi Bahasa', icon: Languages, badge: null },
          { key: 'kosakata' as ViewKey, label: 'Kosakata', icon: BookOpen, badge: null },
          { key: 'sastra-lisan' as ViewKey, label: 'Sastra Lisan', icon: Mic, badge: null },
          { key: 'dialektometri' as ViewKey, label: 'Dialektometri & Peta', icon: Compass, badge: null },
          { key: 'revitalisasi' as ViewKey, label: 'Revitalisasi Bahasa', icon: RefreshCw, badge: null }
        ]
      },
      {
        title: 'Kuesioner',
        items: [
          { key: 'kuesioner' as ViewKey, label: 'Pusat Kuesioner', icon: Layers, badge: null },
          { key: 'kuesioner-pemetaan' as ViewKey, label: 'Pemetaan Bahasa (16 Seksi)', icon: Layers, badge: null },
          { key: 'kuesioner-sastra-lisan' as ViewKey, label: 'Pemetaan Sastra Lisan', icon: Mic, badge: null },
          { key: 'kuesioner-vitalitas' as ViewKey, label: 'Vitalitas Bahasa', icon: Languages, badge: null },
          { key: 'kuesioner-revitalisasi' as ViewKey, label: 'Revitalisasi Bahasa Daerah', icon: Sparkles, badge: null }
        ]
      },
      {
        title: 'Pengaturan & Akses',
        items: [
          ...(currentRole === 'admin' ? [{ 
            key: 'pengaturan' as ViewKey, 
            label: 'Manajemen Pengguna', 
            icon: Settings, 
            badge: pendingRequestsCount > 0 ? `${pendingRequestsCount}` : null 
          }] : []),
          { key: 'dokumentasi' as ViewKey, label: 'Dokumentasi & Tata Cara', icon: HelpCircle, badge: null }
        ]
      }
    ];
  }, [currentRole, totalSurveys, unverifiedSurveysCount, pendingRequestsCount]);

  // User initials for avatar
  const initials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AD';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[var(--md-surface-container-low)] select-none text-[var(--md-on-surface)] transition-colors">
      
      {/* Brand Header */}
      <div className={`h-16 flex items-center justify-between shrink-0 transition-colors ${isCollapsedDesktop && !isOpenMobile ? 'px-3 justify-center' : 'px-5'}`}>
        <button
          type="button"
          onClick={() => handleSelect('dashboard')}
          className="flex items-center gap-3 text-left focus:outline-hidden hover:opacity-85 transition-opacity"
        >
          <span className="w-10 h-10 rounded-2xl bg-[var(--md-surface-container-lowest)] dark:bg-[var(--md-surface-container-high)] shadow-xs flex items-center justify-center shrink-0">
            <img 
              src="/icons/logo.svg" 
              alt="Derana" 
              className="w-6 h-6"
            />
          </span>
          {(!isCollapsedDesktop || isOpenMobile) && (
            <div className="flex flex-col">
              <span className="font-medium text-base text-[var(--md-on-surface)]">
                Derana Panel
              </span>
              <span className="text-xs text-[var(--md-on-surface-variant)] -mt-0.5">
                {currentRole === 'admin' && 'Koordinator Riset Balai'}
                {currentRole === 'verifikator' && 'Portal Kurasi & Validasi'}
                {(currentRole === 'surveyor' || currentRole === 'user') && 'Pengumpul Data Lapangan'}
                {currentRole === 'tamu' && 'Mode Hanya Baca Riset'}
              </span>
            </div>
          )}
        </button>

        {/* Mobile Close Button */}
        {isOpenMobile && (
          <div className="flex items-center">
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors lg:hidden"
              aria-label="Tutup sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Role Banner on Expanded Sidebar */}
      {(!isCollapsedDesktop || isOpenMobile) && (
        <div className="mx-3 mt-1 px-4 py-3 rounded-t-3xl rounded-b-md bg-[var(--md-surface-container-lowest)] dark:bg-[var(--md-surface-container-high)] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {currentRole === 'admin' && <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />}
            {currentRole === 'verifikator' && <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
            {(currentRole === 'surveyor' || currentRole === 'user') && <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
            {currentRole === 'tamu' && <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />}
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                {roleBadge.label}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                {currentRole === 'admin' && 'Pengaturan & Penugasan'}
                {currentRole === 'verifikator' && 'Pengesahan & Validasi'}
                {(currentRole === 'surveyor' || currentRole === 'user') && 'Pengisian Kuesioner'}
                {currentRole === 'tamu' && 'Eksplorasi Empiris Saja'}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-500 shrink-0">
            {roleBadge.shortLabel}
          </span>
        </div>
      )}

      {/* Observation Point Quick Status */}
      {(!isCollapsedDesktop || isOpenMobile) && villageName && (
        <div className="mx-3 mt-0.5 px-4 py-2.5 rounded-t-md rounded-b-3xl bg-[var(--md-surface-container-lowest)] dark:bg-[var(--md-surface-container-high)]">
          <div className="flex items-center justify-between text-[11px] text-[var(--md-on-surface-variant)]">
            <span className="font-medium">Titik Pantau</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Aktif</span>
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">
            Desa {villageName}
          </p>
        </div>
      )}

      {/* Scrollable Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 scrollbar-thin">
        {navGroups.map((group, groupIndex) => (
          <div key={group.title} className="space-y-0.5">
            {groupIndex > 0 && (
              <div className="mx-4 my-2 h-px bg-[var(--md-outline-variant)]" aria-hidden="true" />
            )}
            {(!isCollapsedDesktop || isOpenMobile) && (
              <div className="px-4 pt-1.5 pb-1 text-sm font-medium text-[var(--md-on-surface-variant)]">
                {group.title}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = 
                  currentView === item.key ||
                  (currentView === 'kuesioner' && (
                    (item.key === 'kuesioner-pemetaan' && kuesionerTab === 'pemetaan') ||
                    (item.key === 'kuesioner-sastra-lisan' && kuesionerTab === 'sastra-lisan') ||
                    (item.key === 'kuesioner-vitalitas' && kuesionerTab === 'vitalitas') ||
                    (item.key === 'kuesioner-revitalisasi' && kuesionerTab === 'revitalisasi')
                  ));
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleSelect(item.key)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full h-11 flex items-center gap-3 rounded-full text-sm transition-colors text-left ${
                      isCollapsedDesktop && !isOpenMobile ? 'justify-center px-0' : 'px-4'
                    } ${
                      isActive
                        ? 'bg-blue-100 text-blue-950 dark:bg-blue-700 dark:text-blue-50 font-semibold'
                        : 'text-[var(--md-on-surface-variant)] font-medium hover:bg-[var(--md-on-surface)]/[0.08] hover:text-[var(--md-on-surface)]'
                    }`}
                    title={isCollapsedDesktop && !isOpenMobile ? item.label : undefined}
                  >
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-colors ${
                        isActive ? 'text-blue-800 dark:text-blue-50' : ''
                      }`}
                    />
                    {(!isCollapsedDesktop || isOpenMobile) && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {(!isCollapsedDesktop || isOpenMobile) && item.badge && (
                      <span
                        className="min-w-5 h-5 px-1.5 inline-flex items-center justify-center rounded-full text-[11px] font-medium bg-red-600 text-white dark:bg-red-200 dark:text-red-900"
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer: Mode Tampilan, Konfigurasi & Role Actions */}
      <div className="px-3 pt-2 pb-3 space-y-1.5 shrink-0 transition-colors">
        <div className="mx-4 mb-2 h-px bg-[var(--md-outline-variant)]" aria-hidden="true" />
        
        {/* Theme mode toggle row in sidebar */}
        {(!isCollapsedDesktop || isOpenMobile) ? (
          <div className="pl-4 pr-1.5 py-1.5 flex items-center justify-between bg-[var(--md-surface-container-lowest)] dark:bg-[var(--md-surface-container-high)] rounded-full">
            <span className="text-xs font-medium text-[var(--md-on-surface-variant)]">
              {t('navbar.theme', 'Mode Tema')}
            </span>
            <ThemeToggle variant="segmented" />
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <ThemeToggle variant="icon" />
          </div>
        )}

        {/* Language selector row */}
        {(!isCollapsedDesktop || isOpenMobile) ? (
          <div className="pl-4 pr-1.5 py-1.5 flex items-center justify-between bg-[var(--md-surface-container-lowest)] dark:bg-[var(--md-surface-container-high)] rounded-full">
            <span className="text-xs font-medium text-[var(--md-on-surface-variant)]">
              {t('navbar.language', 'Pilihan Bahasa')}
            </span>
            <LanguageSelector variant="segmented" />
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <LanguageSelector variant="pill" />
          </div>
        )}

        {/* In-app PWA install button */}
        {(!isCollapsedDesktop || isOpenMobile) ? (
          <div className="px-1">
            <PWAInstallButton variant="sidebar" />
          </div>
        ) : (
          <div className="flex justify-center">
            <PWAInstallButton variant="icon" />
          </div>
        )}

        {/* Dokumen PRD */}
        {onOpenPRD && (!isCollapsedDesktop || isOpenMobile) && (
          <button
            type="button"
            onClick={() => {
              onOpenPRD();
              onCloseMobile();
            }}
            className="w-full h-10 flex items-center gap-3 px-4 rounded-full text-sm font-medium text-[var(--md-on-surface-variant)] hover:bg-[var(--md-on-surface)]/[0.08] hover:text-[var(--md-on-surface)] transition-colors text-left cursor-pointer"
            title="Buka Dokumen PRD"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="flex-1 truncate">Dokumen PRD & Flow</span>
            <span className="text-[9px] px-1 py-0.2 bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded font-bold">
              DOC
            </span>
          </button>
        )}

        {/* ROLE ACTION BUTTONS IN SIDEBAR */}
        
        {/* 1. Admin Sistem: Membuka Pengaturan dan Pengguna di sidebar bawah untuk menetapkan peran */}
        {currentRole === 'admin' ? (
          <button
            type="button"
            onClick={() => {
              onChangeView('pengaturan');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-3xl text-sm font-medium transition-colors text-left cursor-pointer ${
              currentView === 'pengaturan'
                ? 'bg-purple-600 text-white'
                : 'text-purple-900 dark:text-purple-100 bg-purple-100 dark:bg-purple-900/60 hover:bg-purple-200 dark:hover:bg-purple-800/70'
            }`}
            title="Buka Pengaturan & Pengguna"
          >
            <Settings className={`w-4 h-4 shrink-0 ${currentView === 'pengaturan' ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`} />
            {(!isCollapsedDesktop || isOpenMobile) && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="truncate">Pengaturan & Pengguna</span>
                  {pendingRequestsCount > 0 && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold animate-pulse ${
                      currentView === 'pengaturan' ? 'bg-amber-400 text-slate-900' : 'bg-purple-600 text-white'
                    }`}>
                      {pendingRequestsCount} Ajuan
                    </span>
                  )}
                </div>
                <div className={`text-[10px] font-medium truncate ${currentView === 'pengaturan' ? 'text-purple-100' : 'text-purple-600 dark:text-purple-400'}`}>
                  Tata Kelola Akun & Hak Akses
                </div>
              </div>
            )}
          </button>
        ) : (
          /* 2. Non-Admin (Surveyor, Verifikator, Tamu): Mengajukan peran kepada Admin */
          onOpenRoleRequest && (
            <button
              type="button"
              onClick={() => {
                onOpenRoleRequest();
                onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-3xl text-sm font-medium transition-colors text-left cursor-pointer ${
                currentRole === 'tamu'
                  ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100 hover:bg-amber-200'
                  : currentRole === 'verifikator'
                  ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100 hover:bg-emerald-200'
                  : 'bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-100 hover:bg-blue-200'
              }`}
              title="Ajukan peran kepada Admin"
            >
              <Send className="w-4 h-4 shrink-0" />
              {(!isCollapsedDesktop || isOpenMobile) && (
                <div className="flex-1 min-w-0">
                  <div className="truncate">
                    {currentRole === 'tamu' ? 'Ajukan Peran Surveyor' : 'Ajukan Peran ke Admin'}
                  </div>
                  <div className="text-[10px] opacity-80 font-medium truncate">
                    {currentRole === 'tamu' ? 'Permohonan Akses Tulis' : 'Permohonan Status / Wilayah'}
                  </div>
                </div>
              )}
            </button>
          )
        )}

        {/* User Profile Card */}
        <div className="pt-0.5">
          <div className="flex items-center gap-3 p-2 rounded-full hover:bg-[var(--md-on-surface)]/[0.08] transition-colors">
            <button
              type="button"
              onClick={() => {
                onOpenProfile();
                onCloseMobile();
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 cursor-pointer shadow-2xs text-white ${
                currentRole === 'admin' ? 'bg-purple-600' :
                currentRole === 'verifikator' ? 'bg-emerald-600' :
                (currentRole === 'surveyor' || currentRole === 'user') ? 'bg-blue-600' : 'bg-amber-600'
              }`}
              title="Buka profil pengguna"
            >
              {initials}
            </button>
            {(!isCollapsedDesktop || isOpenMobile) && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate leading-tight">
                  {currentUser?.name || 'Pengguna Riset'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${roleBadge.bg} ${roleBadge.text}`}>
                    {roleBadge.shortLabel}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {currentUser?.username || 'user'}
                  </span>
                </div>
              </div>
            )}
            {(!isCollapsedDesktop || isOpenMobile) && (
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="Keluar / Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-200 z-30 h-screen sticky top-0 ${
          isCollapsedDesktop ? 'w-20' : 'w-72'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Slider */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] overflow-hidden rounded-r-[28px] bg-[var(--md-surface-container-low)] shadow-2xl transform transition-transform duration-300 ease-out lg:hidden ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
