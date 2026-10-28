import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  NavigationStepper, 
  SECTIONS_META 
} from './components/NavigationStepper';
import { 
  Dashboard 
} from './components/Dashboard';
import {
  LanguageComparison
} from './components/LanguageComparison';
import { 
  Section1TitikPengamatan 
} from './components/sections/Section1TitikPengamatan';
import { 
  Section2SituasiKebahasaan 
} from './components/sections/Section2SituasiKebahasaan';
import { 
  Section3SituasiGeografis 
} from './components/sections/Section3SituasiGeografis';
import { 
  Section4Penduduk 
} from './components/sections/Section4Penduduk';
import { 
  Section5MataPencaharian 
} from './components/sections/Section5MataPencaharian';
import { 
  Section6Pendidikan 
} from './components/sections/Section6Pendidikan';
import { 
  Section7SaranaPendidikan 
} from './components/sections/Section7SaranaPendidikan';
import { 
  Section8Agama 
} from './components/sections/Section8Agama';
import { 
  Section9HubunganMobilitas 
} from './components/sections/Section9HubunganMobilitas';
import { 
  Section10Transportasi 
} from './components/sections/Section10Transportasi';
import { 
  Section11UsiaDesa 
} from './components/sections/Section11UsiaDesa';
import { 
  Section12SejarahDesa 
} from './components/sections/Section12SejarahDesa';
import { 
  Section13Folklore 
} from './components/sections/Section13Folklore';
import { 
  Section14Narasumber 
} from './components/sections/Section14Narasumber';
import { 
  Section15Kosakata 
} from './components/sections/Section15Kosakata';
import { 
  Section16DialektometriPeta 
} from './components/sections/Section16DialektometriPeta';
import { ExportModal } from './components/ExportModal';
import { RegionalSummaryModal } from './components/reports/RegionalSummaryModal';
import { LoginPage } from './components/LoginPage';
import { UserManagementModal } from './components/UserManagementModal';
import { PengaturanBentoView } from './components/views/PengaturanBentoView';
import { ProfileModal } from './components/ProfileModal';
import { PRDDocumentModal } from './components/PRDDocumentModal';
import { SurveysLeafletMap } from './components/dashboard/SurveysLeafletMap';
import { 
  InstrumenPemetaanBahasaData, 
  NarasumberData, 
  KosakataItem, 
  FrasaItem, 
  KalimatItem,
  CatatanPengumpulData,
  SurveyRecord 
} from './types/linguistic';
import { INITIAL_CATATAN_PENGUMPUL } from './data/swadeshList';
import { AppUser, UserRole } from './types/auth';
import { 
  getEmptySurveyData, 
  getSampleSurveyData 
} from './data/sampleSurveyData';
import { 
  loadAllSurveys,
  persistAllSurveys,
  saveSurveyRecord,
  createNewSurveyRecord,
  duplicateSurveyRecord,
  deleteSurveyRecord,
  parseAndImportSurveyJSON,
  toggleSurveyVerification,
  STORAGE_KEY_ACTIVE_ID
} from './utils/surveyStorage';
import { 
  getCurrentUser, 
  logoutUser, 
  switchUser, 
  canUserEditSurvey,
  canUserCreateSurvey,
  canUserVerifySurvey,
  switchActiveUserRole,
  getRoleLabel,
  setCurrentUserSession
} from './utils/authStorage';
import { RoleDemonstrationBanner } from './components/auth/RoleDemonstrationBanner';
import { RoleRequestModal } from './components/auth/RoleRequestModal';
import { 
  subscribeToAuthUser, 
  logoutFirebase, 
  subscribeToSurveys, 
  subscribeFirebaseStatus, 
  syncAllSurveysToFirestore, 
  getFirebaseStatus, 
  getUserProfileFromFirestore,
  FirebaseConnectionStatus,
  firebaseConfig
} from './lib/firebase';
import { 
  Check, 
  ArrowUp, 
  Sparkles, 
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  LayoutDashboard,
  Save,
  Plus,
  Lock,
  Copy,
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Layers,
  ListFilter,
  FileText,
  Compass,
  BookOpen,
  Users,
  AlertTriangle,
  Send
} from 'lucide-react';
import { calculateOverallProgress } from './utils/calculations';
import { AppSidebar, ViewKey } from './components/layout/AppSidebar';
import { DashboardNavbar } from './components/layout/DashboardNavbar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { FloatingBottomNav } from './components/layout/FloatingBottomNav';
import { CommandSearchModal } from './components/layout/CommandSearchModal';
import { DataRespondenView } from './components/views/DataRespondenView';
import { DatasetsView } from './components/views/DatasetsView';
import { HasilSurveiView } from './components/views/HasilSurveiView';
import { IdentitasWilayahView } from './components/views/IdentitasWilayahView';
import { KondisiKebahasaanView } from './components/views/KondisiKebahasaanView';
import { SastraLisanView } from './components/views/SastraLisanView';
import { RevitalisasiView } from './components/views/RevitalisasiView';
import { KosakataPerBahasaView } from './components/views/KosakataPerBahasaView';
import { KuesionerHubView, KuesionerTab } from './components/views/KuesionerHubView';
import { DokumentasiPanduanView } from './components/views/DokumentasiPanduanView';
import { AtlasGlottologView } from './components/views/AtlasGlottologView';
import { CartoTriInstrumentView } from './components/views/CartoTriInstrumentView';
import { PetaSastraLisanView } from './components/views/PetaSastraLisanView';
import { PetaVitalitasView } from './components/views/PetaVitalitasView';
import { PetaRevitalisasiView } from './components/views/PetaRevitalisasiView';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { validateFullSurvey, FieldValidationError } from './utils/formValidation';
import { FormValidationStatus } from './components/common/FormValidationStatus';
import { ValidationWarningModal } from './components/common/ValidationWarningModal';
import { offlineSyncManager, SyncStatusEvent } from './utils/offlineSyncManager';
import { motion, AnimatePresence } from 'motion/react';

const appGoogleClientId = 
  import.meta.env.VITE_GOOGLE_CLIENT_ID || 
  (firebaseConfig as any)?.oAuthClientId || 
  '907558852342-vf3ufhtoei8f77e4pa88up6ibcvrrjl7.apps.googleusercontent.com';

export default function App() {
  // Current authenticated user
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => getCurrentUser());
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isRoleRequestModalOpen, setIsRoleRequestModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPRDModalOpen, setIsPRDModalOpen] = useState(false);
  const [isRegionalReportOpen, setIsRegionalReportOpen] = useState(false);

  // Collection of surveys
  const [surveys, setSurveys] = useState<SurveyRecord[]>(() => loadAllSurveys());

  // Count unverified surveys for Verifikator & Admin
  const unverifiedSurveysCount = useMemo(() => {
    return surveys.filter(s => !s.isVerified).length;
  }, [surveys]);

  // Quick switch role handler
  const handleSwitchRole = (newRole: UserRole) => {
    const updated = switchActiveUserRole(newRole);
    if (updated) {
      setCurrentUser(updated);
      triggerToast(`Beralih ke peran: ${getRoleLabel(newRole)}`);
    }
  };
  
  // Active survey ID
  const [activeSurveyId, setActiveSurveyId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (saved) return saved;
    const initial = loadAllSurveys();
    return initial[0]?.id || 'survey_default';
  });

  // Current view matching Derana panel navigation
  const [currentView, setCurrentView] = useState<ViewKey>('dashboard');
  const [kuesionerTab, setKuesionerTab] = useState<KuesionerTab>('pemetaan');

  const handleSelectView = (view: ViewKey) => {
    if (view === 'kuesioner-pemetaan') {
      setKuesionerTab('pemetaan');
      setCurrentView('kuesioner');
    } else if (view === 'kuesioner-sastra-lisan') {
      setKuesionerTab('sastra-lisan');
      setCurrentView('kuesioner');
    } else if (view === 'kuesioner-vitalitas') {
      setKuesionerTab('vitalitas');
      setCurrentView('kuesioner');
    } else if (view === 'kuesioner-revitalisasi') {
      setKuesionerTab('revitalisasi');
      setCurrentView('kuesioner');
    } else {
      setCurrentView(view);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sidebar & search state
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);
  const [isCollapsedDesktopSidebar, setIsCollapsedDesktopSidebar] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Keyboard shortcut for Command palette (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Real-time synchronization with Firebase Firestore & status
  const [firebaseStatus, setFirebaseStatus] = useState<FirebaseConnectionStatus>(() => getFirebaseStatus());
  const [syncInfo, setSyncInfo] = useState<SyncStatusEvent>(() => offlineSyncManager.getStatus());

  useEffect(() => {
    const unsubStatus = subscribeFirebaseStatus((status) => {
      setFirebaseStatus(status);
    });

    const unsubSync = offlineSyncManager.subscribe((info) => {
      setSyncInfo(info);
      if (info.lastSyncMessage) {
        triggerToast(info.lastSyncMessage);
      }
    });

    const initialLocal = loadAllSurveys();
    const unsubSurveys = subscribeToSurveys((cloudSurveys) => {
      if (cloudSurveys && cloudSurveys.length > 0) {
        setSurveys(cloudSurveys);
        persistAllSurveys(cloudSurveys);
      }
    }, initialLocal);

    // Continuous Firebase Auth state listener
    const unsubAuth = subscribeToAuthUser(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getUserProfileFromFirestore(firebaseUser.uid);
          const email = firebaseUser.email || '';
          const isAdminEmail = email.toLowerCase() === 'derana.apps@gmail.com' || email.toLowerCase().includes('admin');
          const finalRole: UserRole = isAdminEmail ? 'admin' : (profile?.role || 'surveyor');

          const userObj: AppUser = {
            id: firebaseUser.uid,
            username: email.split('@')[0] || `google_${firebaseUser.uid.slice(0, 8)}`,
            name: firebaseUser.displayName || profile?.displayName || email.split('@')[0] || 'Peneliti Kebahasaan',
            email,
            role: finalRole,
            avatar: firebaseUser.photoURL || undefined,
            institution: profile?.institution || (isAdminEmail ? 'Badan Pengembangan dan Pembinaan Bahasa' : 'Balai Bahasa / Peneliti Mandiri'),
            assignedRegion: profile?.assignedRegion || (isAdminEmail ? 'Nasional (Koordinator Utama)' : 'Wilayah Riset Lapangan'),
            createdAt: profile?.createdAt || new Date().toISOString(),
            authProvider: 'google_oauth',
            oauthConnected: true,
            oauthEmail: email,
            oauthAuthorizedAt: new Date().toISOString()
          };

          setCurrentUser(prev => {
            if (prev && prev.id === userObj.id && prev.role === userObj.role && prev.name === userObj.name) {
              return prev;
            }
            setCurrentUserSession(userObj);
            return userObj;
          });
        } catch (e) {
          console.warn('Could not rehydrate auth user profile:', e);
        }
      }
    });

    return () => {
      unsubStatus();
      unsubSync();
      unsubSurveys();
      unsubAuth();
    };
  }, []);

  const handleManualCloudSync = async () => {
    try {
      triggerToast('Menyinkronkan basis data kuesioner ke Firebase Firestore...');
      const res = await offlineSyncManager.triggerAutoSync(surveys);
      if (res.syncedCount > 0) {
        triggerToast(`Berhasil mengunggah ${res.syncedCount} kuesioner ke Firebase Cloud.`);
      } else if (res.totalPending === 0) {
        triggerToast(`Semua kuesioner (${surveys.length} data) sudah tersinkronisasi di Firebase Cloud.`);
      } else {
        triggerToast(`Sinkronisasi sebagian: ${res.syncedCount} berhasil, ${res.failedCount} gagal.`);
      }
    } catch (e) {
      triggerToast('Sinkronisasi cloud tertunda. Data tetap tersimpan aman di penyimpanan lokal.');
    }
  };

  // Active survey form data
  const [data, setData] = useState<InstrumenPemetaanBahasaData>(() => {
    const initialSurveys = loadAllSurveys();
    const savedActiveId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    const found = initialSurveys.find(s => s.id === savedActiveId) || initialSurveys[0];
    return found ? found.data : getEmptySurveyData();
  });

  const [activeSection, setActiveSection] = useState<string>('section-1');
  const [formMode, setFormMode] = useState<'screen' | 'all'>('screen');
  const [activeScreenNumber, setActiveScreenNumber] = useState<number>(1);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [dashboardViewMode, setDashboardViewMode] = useState<'ringkasan' | 'peta_survei' | 'narasumber_stats' | 'dialek_stats' | 'korelasi_pendidikan' | 'regresi_usia_bahasa' | 'daftar'>('ringkasan');

  const viewTitle = useMemo(() => {
    switch (currentView) {
      case 'peta-carto': return 'Peta CARTO (Tri-Instrumen)';
      case 'peta-sastra-lisan': return 'Peta Sastra Lisan';
      case 'peta-vitalitas': return 'Peta Vitalitas Bahasa';
      case 'peta-revitalisasi': return 'Peta Revitalisasi Bahasa';
      case 'peta-survei': return 'Peta Titik Survei';
      case 'atlas-glottolog': return 'Peta Glottolog Nasional';
      case 'sastra-lisan': return 'Sastra Lisan';
      case 'kondisi-bahasa': return 'Kondisi Kebahasaan';
      case 'revitalisasi': return 'Revitalisasi Bahasa';
      case 'dialektometri': return 'Dialektometri & Peta';
      case 'kuesioner': return 'Pusat Kuesioner';
      case 'responden': return 'Data Responden';
      case 'surveys': return 'Hasil Survei';
      case 'datasets': return 'Datasets';
      case 'identitas': return 'Identitas Wilayah';
      case 'kosakata': return 'Kosakata';
      case 'comparison': return 'Perbandingan Dua Titik';
      case 'pengaturan': return 'Pengaturan & Pengguna';
      case 'dokumentasi': return 'Dokumentasi Panduan';
      case 'form-screen': return `Form Seksi ${activeScreenNumber}`;
      case 'form-all': return 'Form Gulir Lengkap';
      default: return 'Dashboard';
    }
  }, [currentView, activeScreenNumber]);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3500);
  };

  // Debounced auto-save into surveys storage (enforces edit permissions)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setSurveys(prevSurveys => {
          const activeRec = prevSurveys.find(s => s.id === activeSurveyId);
          if (!activeRec) return prevSurveys;
          
          // Check permission: only save if user is permitted to edit this survey
          const perm = canUserEditSurvey(activeRec, currentUser);
          if (!perm.allowed) {
            return prevSurveys;
          }

          const updated = saveSurveyRecord({ ...activeRec, data }, prevSurveys);
          return updated;
        });
        const now = new Date();
        setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (e) {
        console.error('Failed to auto-save survey:', e);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [data, activeSurveyId, currentUser]);

  // Observer for active section while scrolling in form view
  useEffect(() => {
    if (currentView !== 'form-all') return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (let i = SECTIONS_META.length - 1; i >= 0; i--) {
        const sec = SECTIONS_META[i];
        const el = document.getElementById(sec.id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sec.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView]);

  // Active survey record & edit permission
  const activeSurvey = surveys.find(s => s.id === activeSurveyId);
  const canEditActive = activeSurvey ? canUserEditSurvey(activeSurvey, currentUser) : { allowed: true };

  // Switch active survey
  const handleSelectSurvey = (id: string) => {
    // Flush save current data before switching (if permitted)
    setSurveys(prev => {
      const current = prev.find(s => s.id === activeSurveyId);
      if (current && canUserEditSurvey(current, currentUser).allowed) {
        return saveSurveyRecord({ ...current, data }, prev);
      }
      return prev;
    });

    const target = surveys.find(s => s.id === id);
    if (target) {
      setActiveSurveyId(id);
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
      setData(target.data);
      const now = new Date();
      setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Create new survey
  const handleCreateNew = (type: 'empty' | 'sample') => {
    // Flush save current data if permitted
    setSurveys(prev => {
      const current = prev.find(s => s.id === activeSurveyId);
      if (current && canUserEditSurvey(current, currentUser).allowed) {
        return saveSurveyRecord({ ...current, data }, prev);
      }
      return prev;
    });

    // Check if user has permission to create survey (Tamu cannot create)
    if (!canUserCreateSurvey(currentUser)) {
      triggerToast('Mode Tamu / Akademisi bersifat Hanya Baca. Silakan ajukan peran ke Admin untuk hak membuat instrumen.');
      setIsRoleRequestModalOpen(true);
      return;
    }

    const { newRecord, updatedSurveys } = createNewSurveyRecord(type, surveys, currentUser);
    setSurveys(updatedSurveys);
    setActiveSurveyId(newRecord.id);
    setData(newRecord.data);
    setCurrentView('form-screen');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    triggerToast(type === 'sample' 
      ? `Contoh survei baru dibuat atas nama ${currentUser?.name || 'Surveyor'}.` 
      : `Formulir survei kosong baru berhasil dibuat atas nama ${currentUser?.name || 'Surveyor'}.`);
  };

  // Duplicate survey
  const handleDuplicate = (id: string) => {
    // Tamu cannot duplicate/create
    if (!canUserCreateSurvey(currentUser)) {
      triggerToast('Mode Tamu / Akademisi bersifat Hanya Baca. Silakan ajukan peran ke Admin.');
      setIsRoleRequestModalOpen(true);
      return;
    }

    // Flush save current data if active is duplicated and permitted
    let currentSurveys = surveys;
    if (id === activeSurveyId) {
      const current = surveys.find(s => s.id === activeSurveyId);
      if (current && canUserEditSurvey(current, currentUser).allowed) {
        currentSurveys = saveSurveyRecord({ ...current, data }, surveys);
      }
    }

    const { duplicatedRecord, updatedSurveys } = duplicateSurveyRecord(id, currentSurveys, currentUser);
    if (duplicatedRecord) {
      setSurveys(updatedSurveys);
      setActiveSurveyId(duplicatedRecord.id);
      setData(duplicatedRecord.data);
      triggerToast(`Survei "${duplicatedRecord.title}" berhasil disalin ke akun Anda.`);
    }
  };

  // Delete survey
  const handleDelete = (id: string) => {
    if (currentUser?.role === 'tamu') {
      triggerToast('Mode Tamu bersifat Hanya Baca. Penghapusan data instrumen tidak diizinkan.');
      return;
    }

    const target = surveys.find(s => s.id === id);
    if (target && !canUserEditSurvey(target, currentUser).allowed) {
      triggerToast('Peringatan: Anda tidak memiliki wewenang untuk menghapus survei milik surveyor lain.');
      return;
    }

    const updated = deleteSurveyRecord(id, surveys);
    setSurveys(updated);

    if (id === activeSurveyId) {
      if (updated.length > 0) {
        setActiveSurveyId(updated[0].id);
        setData(updated[0].data);
        localStorage.setItem(STORAGE_KEY_ACTIVE_ID, updated[0].id);
      } else {
        const { newRecord, updatedSurveys } = createNewSurveyRecord('empty', [], currentUser);
        setSurveys(updatedSurveys);
        setActiveSurveyId(newRecord.id);
        setData(newRecord.data);
      }
    }
    triggerToast('Formulir survei berhasil dihapus.');
  };

  // Verifikator Linguistik & Admin: Toggle verification status (Pengesahan Status Tervalidasi)
  const handleToggleVerify = (surveyId: string) => {
    if (!currentUser || !canUserVerifySurvey(currentUser)) {
      triggerToast('Hanya Verifikator Linguistik atau Admin yang berhak mengesahkan status tervalidasi data survei.');
      return;
    }
    const updated = toggleSurveyVerification(surveyId, surveys, currentUser);
    setSurveys(updated);
    const target = updated.find(s => s.id === surveyId);
    triggerToast(target?.isVerified 
      ? `Data survei "${target.title}" telah berhasil disahkan statusnya sebagai TERVALIDASI.` 
      : `Status verifikasi survei "${target?.title}" telah dibatalkan.`);
  };

  // Quick switch user (Demo testing)
  const handleQuickSwitchUser = (username: string) => {
    const switched = switchUser(username);
    if (switched) {
      setCurrentUser(switched);
      triggerToast(`Beralih ke akun ${switched.name} (${switched.role === 'admin' ? 'Super Admin' : 'Surveyor'})`);
    }
  };

  // Logout handler
  const handleLogout = () => {
    logoutFirebase();
    logoutUser();
    setCurrentUser(null);
    triggerToast('Anda telah keluar dari akun.');
  };

  // Import JSON file
  const handleImportJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const result = parseAndImportSurveyJSON(content, surveys);
        if (result.success) {
          setSurveys(result.importedSurveys);
          if (result.activeId) {
            setActiveSurveyId(result.activeId);
            const importedSurvey = result.importedSurveys.find(s => s.id === result.activeId);
            if (importedSurvey) {
              setData(importedSurvey.data);
            }
          }
          triggerToast(result.message);
        } else {
          triggerToast(`Gagal impor: ${result.message}`);
        }
      }
    };
    reader.readAsText(file);
  };

  // Validation warning modal state
  const [showValidationWarningModal, setShowValidationWarningModal] = useState(false);

  // Real-time automatic form validation across entire questionnaire
  const validationSummary = React.useMemo(() => {
    return validateFullSurvey(data);
  }, [data]);

  // Actual survey persistence execution
  const executeSave = () => {
    const activeRec = surveys.find(s => s.id === activeSurveyId);
    if (!activeRec) return;

    setSurveys(prev => {
      const current = prev.find(s => s.id === activeSurveyId);
      if (!current) return prev;
      return saveSurveyRecord({ ...current, data }, prev);
    });
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastSavedTime(timeStr);
    triggerToast(`Data formulir berhasil disimpan pada ${timeStr}`);
    setShowValidationWarningModal(false);
  };

  // Manual save with automated validation check
  const handleManualSave = () => {
    const activeRec = surveys.find(s => s.id === activeSurveyId);
    if (!activeRec) return;
    
    const perm = canUserEditSurvey(activeRec, currentUser);
    if (!perm.allowed) {
      triggerToast('Mode Hanya Baca: Anda tidak dapat mengubah data kuesioner milik surveyor lain.');
      return;
    }

    // If there are invalid fields, trigger visual validation feedback
    if (!validationSummary.isValid) {
      setShowValidationWarningModal(true);
      return;
    }

    executeSave();
  };

  // Reset active form
  const handleResetEmpty = () => {
    const activeRec = surveys.find(s => s.id === activeSurveyId);
    if (activeRec && !canUserEditSurvey(activeRec, currentUser).allowed) {
      triggerToast('Peringatan: Formulir ini dalam mode baca. Anda tidak dapat mengosongkannya.');
      return;
    }

    if (window.confirm('Kosongkan semua isian formulir aktif ini?')) {
      const empty = getEmptySurveyData();
      setData(empty);
      setSurveys(prev => {
        const current = prev.find(s => s.id === activeSurveyId);
        if (!current) return prev;
        return saveSurveyRecord({ ...current, data: empty }, prev);
      });
      triggerToast('Isian formulir berhasil dikosongkan.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Load sample into active form
  const handleLoadSample = () => {
    const activeRec = surveys.find(s => s.id === activeSurveyId);
    if (activeRec && !canUserEditSurvey(activeRec, currentUser).allowed) {
      triggerToast('Peringatan: Formulir ini dalam mode baca. Anda tidak dapat menimpa isian surveyor lain.');
      return;
    }

    if (window.confirm('Muat data sampel survei Desa Karangwangi ke formulir aktif ini?')) {
      const sample = getSampleSurveyData();
      setData(sample);
      setSurveys(prev => {
        const current = prev.find(s => s.id === activeSurveyId);
        if (!current) return prev;
        return saveSurveyRecord({ ...current, data: sample }, prev);
      });
      triggerToast('Data sampel survei berhasil dimuat ke formulir.');
    }
  };

  const handleScreenChange = (screenNum: number) => {
    const clamped = Math.max(1, Math.min(16, screenNum));
    setActiveScreenNumber(clamped);
    const targetMeta = SECTIONS_META[clamped - 1];
    if (targetMeta) {
      setActiveSection(targetMeta.id);
    }
    if (currentView !== 'form-screen' && currentView !== 'form-all') {
      setCurrentView('form-screen');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const targetMeta = SECTIONS_META.find(s => s.id === sectionId);
    if (targetMeta) {
      setActiveScreenNumber(targetMeta.number);
    }

    if (currentView !== 'form-screen' && currentView !== 'form-all') {
      setCurrentView('form-screen');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentView === 'form-all') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Updaters for Section 1 - 16
  // Updaters for Section 1 - 16
  const updateTitikPengamatan = (field: keyof InstrumenPemetaanBahasaData['titikPengamatan'], value: string) => {
    if (!canEditActive.allowed) return;
    setData(prev => {
      const next = {
        ...prev,
        titikPengamatan: { ...prev.titikPengamatan, [field]: value }
      };
      // Keep Situasi Geografis (Section 3) coordinates synchronized if Section 1 coordinates are updated
      if (field === 'koordinatLintang') {
        next.situasiGeografis = { ...next.situasiGeografis, koordinatLintang: value };
      } else if (field === 'koordinatBujur') {
        next.situasiGeografis = { ...next.situasiGeografis, koordinatBujur: value };
      }
      return next;
    });
  };

  const updateSituasiKebahasaan = (direction: keyof InstrumenPemetaanBahasaData['situasiKebahasaan'], field: string, value: string) => {
    if (!canEditActive.allowed) return;
    setData(prev => ({
      ...prev,
      situasiKebahasaan: {
        ...prev.situasiKebahasaan,
        [direction]: {
          ...prev.situasiKebahasaan[direction],
          [field]: value
        }
      }
    }));
  };

  const updateSituasiGeografis = (field: keyof InstrumenPemetaanBahasaData['situasiGeografis'], value: any) => {
    if (!canEditActive.allowed) return;
    setData(prev => ({
      ...prev,
      situasiGeografis: { ...prev.situasiGeografis, [field]: value }
    }));
  };

  const updatePenduduk = (field: keyof InstrumenPemetaanBahasaData['penduduk'], value: any) => {
    if (!canEditActive.allowed) return;
    setData(prev => ({
      ...prev,
      penduduk: { ...prev.penduduk, [field]: value }
    }));
  };

  const updateMataPencaharian = (field: keyof InstrumenPemetaanBahasaData['mataPencaharian'], value: any) => {
    if (!canEditActive.allowed) return;
    setData(prev => ({
      ...prev,
      mataPencaharian: { ...prev.mataPencaharian, [field]: value }
    }));
  };

  const updatePendidikan = (field: keyof InstrumenPemetaanBahasaData['pendidikan'], value: any) => {
    if (!canEditActive.allowed) return;
    setData(prev => ({
      ...prev,
      pendidikan: { ...prev.pendidikan, [field]: value }
    }));
  };

  const updateSaranaPendidikan = (field: keyof InstrumenPemetaanBahasaData['saranaPendidikan'], value: any) => {
    if (!canEditActive.allowed) return;
    setData(prev => ({
      ...prev,
      saranaPendidikan: { ...prev.saranaPendidikan, [field]: value }
    }));
  };

  const updateAgama = (field: keyof InstrumenPemetaanBahasaData['agama'], value: any) => {
    if (!canEditActive.allowed) return;
    setData(prev => ({
      ...prev,
      agama: { ...prev.agama, [field]: value }
    }));
  };

  const updateHubunganMobilitas = (field: keyof InstrumenPemetaanBahasaData['hubunganMobilitas'], value: string) => {
    if (!canEditActive.allowed) return;
    setData(prev => ({
      ...prev,
      hubunganMobilitas: { ...prev.hubunganMobilitas, [field]: value }
    }));
  };

  const updateAlatTransportasi = (field: keyof InstrumenPemetaanBahasaData['alatTransportasi'], value: any) => {
    if (!canEditActive.allowed) return;
    setData(prev => ({
      ...prev,
      alatTransportasi: { ...prev.alatTransportasi, [field]: value }
    }));
  };

  const updateUsiaDesa = (field: keyof InstrumenPemetaanBahasaData['usiaDesa'], value: string) => {
    if (!canEditActive.allowed) return;
    setData(prev => ({
      ...prev,
      usiaDesa: { ...prev.usiaDesa, [field]: value }
    }));
  };

  const updateSejarahDesa = (field: keyof InstrumenPemetaanBahasaData['sejarahDesa'], value: string) => {
    if (!canEditActive.allowed) return;
    setData(prev => ({
      ...prev,
      sejarahDesa: { ...prev.sejarahDesa, [field]: value }
    }));
  };

  const updateFolklore = (field: keyof InstrumenPemetaanBahasaData['folklore'], value: string) => {
    if (!canEditActive.allowed) return;
    setData(prev => ({
      ...prev,
      folklore: { ...prev.folklore, [field]: value }
    }));
  };

  const updateNarasumber = (index: number, updated: NarasumberData) => {
    if (!canEditActive.allowed) return;
    setData(prev => {
      const list = [...prev.narasumberList];
      list[index] = updated;
      return { ...prev, narasumberList: list };
    });
  };

  // Section 15 handlers
  const updateSwadeshItem = (id: number, field: keyof KosakataItem, value: string) => {
    if (!canEditActive.allowed) return;
    setData(prev => ({
      ...prev,
      kosakataLengkap: {
        ...prev.kosakataLengkap,
        swadeshList: prev.kosakataLengkap.swadeshList.map(item =>
          item.id === id ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const updateBudayaItem = (bidangKode: string, itemId: number, field: keyof KosakataItem, value: string) => {
    if (!canEditActive.allowed) return;
    setData(prev => ({
      ...prev,
      kosakataLengkap: {
        ...prev.kosakataLengkap,
        kosakataBudaya: prev.kosakataLengkap.kosakataBudaya.map(bidang => {
          if (bidang.kode === bidangKode) {
            return {
              ...bidang,
              daftarKata: bidang.daftarKata.map(k =>
                k.id === itemId ? { ...k, [field]: value } : k
              )
            };
          }
          return bidang;
        })
      }
    }));
  };

  const updateFrasaItem = (subKategoriKey: string, id: string, field: keyof FrasaItem, value: string) => {
    if (!canEditActive.allowed) return;
    setData(prev => {
      const frasaObj = { ...prev.kosakataLengkap.strukturFrasa } as any;
      if (frasaObj[subKategoriKey]) {
        frasaObj[subKategoriKey] = frasaObj[subKategoriKey].map((f: FrasaItem) =>
          f.id === id ? { ...f, [field]: value } : f
        );
      }
      return {
        ...prev,
        kosakataLengkap: {
          ...prev.kosakataLengkap,
          strukturFrasa: frasaObj
        }
      };
    });
  };

  const updateKalimatItem = (id: string, field: keyof KalimatItem, value: string) => {
    if (!canEditActive.allowed) return;
    setData(prev => ({
      ...prev,
      kosakataLengkap: {
        ...prev.kosakataLengkap,
        kalimatSederhana: prev.kosakataLengkap.kalimatSederhana.map(k =>
          k.id === id ? { ...k, [field]: value } : k
        )
      }
    }));
  };

  const addKalimat = () => {
    if (!canEditActive.allowed) return;
    setData(prev => {
      const nextId = `ks-${prev.kosakataLengkap.kalimatSederhana.length + 1}`;
      const newItem: KalimatItem = {
        id: nextId,
        kalimatIndonesia: '',
        kalimatLokal: '',
        glosPerKata: '',
        analisisStruktur: 'S - P - O - K'
      };
      return {
        ...prev,
        kosakataLengkap: {
          ...prev.kosakataLengkap,
          kalimatSederhana: [...prev.kosakataLengkap.kalimatSederhana, newItem]
        }
      };
    });
  };

  const removeKalimat = (id: string) => {
    if (!canEditActive.allowed) return;
    setData(prev => ({
      ...prev,
      kosakataLengkap: {
        ...prev.kosakataLengkap,
        kalimatSederhana: prev.kosakataLengkap.kalimatSederhana.filter(k => k.id !== id)
      }
    }));
  };

  const updateCatatanPengumpul = (field: keyof CatatanPengumpulData, value: string) => {
    if (!canEditActive.allowed) return;
    setData(prev => ({
      ...prev,
      kosakataLengkap: {
        ...prev.kosakataLengkap,
        catatanPengumpul: {
          ...(prev.kosakataLengkap.catatanPengumpul || INITIAL_CATATAN_PENGUMPUL),
          [field]: value
        }
      }
    }));
  };

  const updateSwadeshAudio = (id: number, url?: string, fileName?: string, duration?: string) => {
    if (!canEditActive.allowed) return;
    setData(prev => ({
      ...prev,
      kosakataLengkap: {
        ...prev.kosakataLengkap,
        swadeshList: prev.kosakataLengkap.swadeshList.map(item =>
          item.id === id ? { ...item, audioUrl: url, audioFileName: fileName, audioDuration: duration } : item
        )
      }
    }));
  };

  const updateBudayaAudio = (bidangKode: string, itemId: number, url?: string, fileName?: string, duration?: string) => {
    if (!canEditActive.allowed) return;
    setData(prev => ({
      ...prev,
      kosakataLengkap: {
        ...prev.kosakataLengkap,
        kosakataBudaya: prev.kosakataLengkap.kosakataBudaya.map(bidang => {
          if (bidang.kode === bidangKode) {
            return {
              ...bidang,
              daftarKata: bidang.daftarKata.map(k =>
                k.id === itemId ? { ...k, audioUrl: url, audioFileName: fileName, audioDuration: duration } : k
              )
            };
          }
          return bidang;
        })
      }
    }));
  };

  const importExcelCustomList = (items: KosakataItem[]) => {
    if (!canEditActive.allowed) return;
    setData(prev => ({
      ...prev,
      kosakataLengkap: {
        ...prev.kosakataLengkap,
        excelImportedList: items
      }
    }));
    triggerToast(`Berhasil mengimpor ${items.length} kosakata dari file Excel!`);
  };

  const importExcelUpdateSwadesh = (items: { id?: number; glosIndonesia: string; bentukLokal: string; transkripsiIPA: string; catatan?: string }[]) => {
    setData(prev => {
      const currentList = [...prev.kosakataLengkap.swadeshList];
      items.forEach(newItem => {
        const foundIdx = currentList.findIndex(x => 
          (newItem.id && x.id === newItem.id) || 
          x.glosIndonesia.toLowerCase().trim() === newItem.glosIndonesia.toLowerCase().trim()
        );
        if (foundIdx !== -1) {
          currentList[foundIdx] = {
            ...currentList[foundIdx],
            bentukLokal: newItem.bentukLokal || currentList[foundIdx].bentukLokal,
            transkripsiIPA: newItem.transkripsiIPA || currentList[foundIdx].transkripsiIPA,
            catatan: newItem.catatan || currentList[foundIdx].catatan
          };
        }
      });
      return {
        ...prev,
        kosakataLengkap: {
          ...prev.kosakataLengkap,
          swadeshList: currentList
        }
      };
    });
    triggerToast(`Berhasil memperbarui data kosakata Swadesh dari Excel!`);
  };

  const updateExcelItem = (id: number, field: keyof KosakataItem, value: string) => {
    setData(prev => ({
      ...prev,
      kosakataLengkap: {
        ...prev.kosakataLengkap,
        excelImportedList: (prev.kosakataLengkap.excelImportedList || []).map(item =>
          item.id === id ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const updateExcelAudio = (id: number, url?: string, fileName?: string, duration?: string) => {
    setData(prev => ({
      ...prev,
      kosakataLengkap: {
        ...prev.kosakataLengkap,
        excelImportedList: (prev.kosakataLengkap.excelImportedList || []).map(item =>
          item.id === id ? { ...item, audioUrl: url, audioFileName: fileName, audioDuration: duration } : item
        )
      }
    }));
  };

  const addExcelItem = () => {
    setData(prev => {
      const list = prev.kosakataLengkap.excelImportedList || [];
      const nextId = list.length > 0 ? Math.max(...list.map(x => x.id)) + 1 : 1;
      const newItem: KosakataItem = {
        id: nextId,
        glosIndonesia: '',
        bentukLokal: '',
        transkripsiIPA: '',
        catatan: ''
      };
      return {
        ...prev,
        kosakataLengkap: {
          ...prev.kosakataLengkap,
          excelImportedList: [...list, newItem]
        }
      };
    });
  };

  const removeExcelItem = (id: number) => {
    setData(prev => ({
      ...prev,
      kosakataLengkap: {
        ...prev.kosakataLengkap,
        excelImportedList: (prev.kosakataLengkap.excelImportedList || []).filter(x => x.id !== id)
      }
    }));
  };

  const clearExcelList = () => {
    setData(prev => ({
      ...prev,
      kosakataLengkap: {
        ...prev.kosakataLengkap,
        excelImportedList: []
      }
    }));
    triggerToast('Daftar kosakata Excel berhasil dikosongkan.');
  };

  // Section 16 handlers
  const updateTitikPembanding = (list: any[]) => {
    setData(prev => ({
      ...prev,
      dialektometri: {
        ...prev.dialektometri,
        titikPembandingList: list
      }
    }));
  };

  const updateCatatanDialektometri = (field: 'catatanIsoglos' | 'kesimpulanGeolinguistik', value: string) => {
    setData(prev => ({
      ...prev,
      dialektometri: {
        ...prev.dialektometri,
        [field]: value
      }
    }));
  };

  const navigateToDialektometriSection = () => {
    if (currentView === 'form-screen') {
      handleScreenChange(16);
    } else {
      setCurrentView('dialektometri');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If not logged in, present the dedicated Login Page for User/Superuser
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          triggerToast(`Selamat datang, ${user.name}!`);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--md-surface)] flex text-[var(--md-on-surface)] antialiased transition-colors">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-16 lg:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-semibold shadow-xl border border-slate-200 dark:border-slate-800 transition-all">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{showToast}</span>
        </div>
      )}

      {/* App Sidebar: Desktop Collapsible + Mobile Off-Canvas Drawer */}
      <AppSidebar
        currentView={currentView}
        onChangeView={handleSelectView}
        kuesionerTab={kuesionerTab}
        isOpenMobile={isOpenMobileSidebar}
        onCloseMobile={() => setIsOpenMobileSidebar(false)}
        isCollapsedDesktop={isCollapsedDesktopSidebar}
        onToggleCollapseDesktop={() => setIsCollapsedDesktopSidebar(!isCollapsedDesktopSidebar)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenUserManagement={() => setIsUserManagementOpen(true)}
        onOpenRoleRequest={() => setIsRoleRequestModalOpen(true)}
        onOpenPRD={() => setIsPRDModalOpen(true)}
        onOpenRegionalReport={() => setIsRegionalReportOpen(true)}
        villageName={data.titikPengamatan.namaDesa}
        totalSurveys={surveys.length}
        unverifiedSurveysCount={unverifiedSurveysCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <DashboardNavbar
          onToggleMobileSidebar={() => setIsOpenMobileSidebar(true)}
          onToggleDesktopSidebar={() => setIsCollapsedDesktopSidebar(!isCollapsedDesktopSidebar)}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          onNavigateToMap={() => {
            setCurrentView('peta-survei');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenPRD={() => setIsPRDModalOpen(true)}
          onNavigateToDokumentasi={() => {
            setCurrentView('dokumentasi');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          surveys={surveys}
          activeSurveyId={activeSurveyId}
          onSelectSurvey={handleSelectSurvey}
          onCreateNewSurvey={() => handleCreateNew('empty')}
          onSave={handleManualSave}
          lastSavedTime={lastSavedTime}
          onOpenExport={() => setIsExportOpen(true)}
          onOpenRegionalReport={() => setIsRegionalReportOpen(true)}
          onNavigateToPetaCarto={() => {
            setCurrentView('peta-carto');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          currentUser={currentUser}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenUserManagement={() => setIsUserManagementOpen(true)}
          onLogout={handleLogout}
          canEdit={canEditActive.allowed}
          villageName={data.titikPengamatan.namaDesa}
          activeScreenNumber={currentView === 'form-screen' ? activeScreenNumber : undefined}
          totalScreens={16}
          currentViewTitle={viewTitle}
          firebaseStatus={firebaseStatus}
          pendingSyncCount={syncInfo.pendingCount}
          onManualSync={handleManualCloudSync}
        />

        {/* Content Container */}
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7 pb-32 sm:pb-36 max-w-[1440px] w-full mx-auto">
          {/* BANNER IDENTITAS & OTORITAS PERAN PENGGUNA RESMI (TAMU, SURVEYOR, VERIFIKATOR, ADMIN) */}
          <RoleDemonstrationBanner
            currentUser={currentUser}
            onOpenRoleRequest={() => setIsRoleRequestModalOpen(true)}
            onOpenUserManagement={() => setIsUserManagementOpen(true)}
            onNavigateToView={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            unverifiedSurveysCount={unverifiedSurveysCount}
          />
          {/* READ-ONLY ALERT NOTICE FOR UNAUTHORIZED / TAMU / VERIFIED SURVEYS */}
          {!canEditActive.allowed && (
            <div className="mb-5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 shadow-2xs transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Lock className="w-5 h-5 text-amber-800 dark:text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-100">
                      Mode Hanya Baca (Read-Only)
                    </h4>
                    <span className="text-[10px] font-bold bg-amber-200/90 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                      {currentUser?.role === 'tamu' 
                        ? 'Tamu / Akademisi' 
                        : activeSurvey?.isVerified 
                        ? 'Data Tervalidasi Resmi' 
                        : `Milik ${activeSurvey?.createdByName || 'Surveyor Lain'}`}
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 dark:text-amber-300/90 mt-1 leading-relaxed max-w-3xl">
                    {canEditActive.reason || 'Anda sedang membuka formulir kuesioner dalam mode pratinjau ilmiah. Perubahan pengisian dinonaktifkan.'}
                  </p>
                </div>
              </div>

              {/* Action Button: Tamu gets 'Ajukan Peran Surveyor', Surveyor gets 'Duplikasi ke Akun Saya' (if survey not verified) */}
              {currentUser?.role === 'tamu' ? (
                <button
                  type="button"
                  onClick={() => setIsRoleRequestModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-2xs transition-all cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ajukan Peran Surveyor</span>
                </button>
              ) : !activeSurvey?.isVerified && canUserCreateSurvey(currentUser) ? (
                <button
                  type="button"
                  onClick={() => handleDuplicate(activeSurveyId)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-2xs transition-all cursor-pointer shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplikasi ke Akun Saya</span>
                </button>
              ) : null}
            </div>
          )}

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-full min-w-0"
            >
              {/* VIEW: DASHBOARD */}
              {currentView === 'dashboard' && (
            <Dashboard
              surveys={surveys}
              activeSurveyId={activeSurveyId}
              onSelectSurvey={handleSelectSurvey}
              onCreateNew={handleCreateNew}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onImportJSON={handleImportJSON}
              onSwitchToEditor={() => {
                setCurrentView('form-screen');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSwitchToComparison={() => {
                setCurrentView('comparison');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateToDialekPeta={() => {
                setCurrentView('dialektometri');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateToKosakata={() => {
                setCurrentView('kosakata');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateToSection={(targetSurveyId, secNum) => {
                handleSelectSurvey(targetSurveyId);
                setActiveScreenNumber(secNum);
                setCurrentView('form-screen');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              currentUser={currentUser}
              onToggleVerify={handleToggleVerify}
              firebaseStatus={firebaseStatus}
              onManualSync={handleManualCloudSync}
              initialViewMode={dashboardViewMode}
              onNavigateToDokumentasi={() => {
                setCurrentView('dokumentasi');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenRegionalReport={() => setIsRegionalReportOpen(true)}
              onNavigateToPetaCarto={() => {
                setCurrentView('peta-carto');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateToView={(viewKey: string) => handleSelectView(viewKey as any)}
              onNavigateToRevitalisasi={() => {
                setCurrentView('revitalisasi');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateToAtlasGlottolog={() => {
                setCurrentView('atlas-glottolog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {/* VIEW: PETA SPASIAL CARTO TRI-INSTRUMEN (SASTRA LISAN, VITALITAS, REVITALISASI) */}
          {currentView === 'peta-carto' && (
            <div className="space-y-6">
              <CartoTriInstrumentView
                surveys={surveys}
                onNavigateToView={(viewKey: string) => {
                  setCurrentView(viewKey as ViewKey);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenRegionalReport={() => setIsRegionalReportOpen(true)}
              />
            </div>
          )}

          {/* VIEW: PETA SASTRA LISAN DEDIKASI */}
          {currentView === 'peta-sastra-lisan' && (
            <div className="space-y-6">
              <PetaSastraLisanView
                surveys={surveys}
                onNavigateToForm={() => {
                  setKuesionerTab('sastra-lisan');
                  setCurrentView('kuesioner');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToKorpus={() => {
                  setCurrentView('sastra-lisan');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToView={(viewKey) => {
                  setCurrentView(viewKey as ViewKey);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}

          {/* VIEW: PETA VITALITAS BAHASA DEDIKASI */}
          {currentView === 'peta-vitalitas' && (
            <div className="space-y-6">
              <PetaVitalitasView
                surveys={surveys}
                onNavigateToForm={() => {
                  setKuesionerTab('vitalitas');
                  setCurrentView('kuesioner');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToKondisiBahasa={() => {
                  setCurrentView('kondisi-bahasa');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToView={(viewKey) => {
                  setCurrentView(viewKey as ViewKey);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}

          {/* VIEW: PETA REVITALISASI BAHASA DEDIKASI */}
          {currentView === 'peta-revitalisasi' && (
            <div className="space-y-6">
              <PetaRevitalisasiView
                surveys={surveys}
                onNavigateToMonevForm={() => {
                  setKuesionerTab('revitalisasi');
                  setCurrentView('kuesioner');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToRAPForm={() => {
                  setKuesionerTab('revitalisasi');
                  setCurrentView('kuesioner');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToModul={() => {
                  setCurrentView('revitalisasi');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToView={(viewKey) => {
                  setCurrentView(viewKey as ViewKey);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}

          {/* VIEW: PETA TITIK SURVEI LAPANGAN (LEAFLET GIS) */}
          {currentView === 'peta-survei' && (
            <div className="space-y-6">
              <SurveysLeafletMap
                surveys={surveys}
                activeSurveyId={activeSurveyId}
                onSelectSurvey={handleSelectSurvey}
                onSwitchToEditor={() => {
                  setCurrentView('form-screen');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSwitchToComparison={() => {
                  setCurrentView('comparison');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToSection={(targetSurveyId, secNum) => {
                  handleSelectSurvey(targetSurveyId);
                  setActiveScreenNumber(secNum);
                  setCurrentView('form-screen');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToDialekPeta={() => {
                  setCurrentView('dialektometri');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToKosakata={() => {
                  setCurrentView('kosakata');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToAtlasGlottolog={() => {
                  setCurrentView('atlas-glottolog');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onCreateNew={handleCreateNew}
              />
            </div>
          )}

          {/* VIEW: PETA GLOTTOLOG NASIONAL (POLIGON & BATAS WILAYAH TUTUR) */}
          {currentView === 'atlas-glottolog' && (
            <div className="space-y-6">
              <AtlasGlottologView
                onNavigateToView={(viewKey) => {
                  setCurrentView(viewKey as ViewKey);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}

          {/* VIEW: DATA RESPONDEN & NARASUMBER */}
          {currentView === 'responden' && (
            <DataRespondenView
              data={data}
              surveys={surveys}
              activeSurveyId={activeSurveyId}
              onSelectSurvey={handleSelectSurvey}
              onUpdateNarasumber={updateNarasumber}
              onGoToFormScreen={(screenNum) => handleScreenChange(screenNum)}
              onNavigateToCorrelation={() => {
                setDashboardViewMode('korelasi_pendidikan');
                setCurrentView('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateToAgeRegression={() => {
                setDashboardViewMode('regresi_usia_bahasa');
                setCurrentView('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {/* VIEW: HASIL SURVEI (DATA SURVEYOR BERDASARKAN STATUS VALIDASI) */}
          {currentView === 'surveys' && (
            <HasilSurveiView
              surveys={surveys}
              activeSurveyId={activeSurveyId}
              onSelectSurvey={handleSelectSurvey}
              onToggleVerify={handleToggleVerify}
              onNavigateToForm={(id) => {
                handleSelectSurvey(id);
                setCurrentView('form-screen');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateToMap={() => {
                setCurrentView('peta-survei');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenExport={() => setIsExportOpen(true)}
              onCreateNew={() => handleCreateNew('empty')}
              currentUser={currentUser}
            />
          )}

          {/* VIEW: DATASETS & TITIK PENGAMATAN */}
          {currentView === 'datasets' && (
            <DatasetsView
              surveys={surveys}
              activeSurveyId={activeSurveyId}
              onSelectSurvey={handleSelectSurvey}
              onCreateNew={() => handleCreateNew('empty')}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onToggleVerify={handleToggleVerify}
              onOpenExport={() => setIsExportOpen(true)}
              onImportJSON={handleImportJSON}
            />
          )}

          {/* VIEW: IDENTITAS & GEOGRAFI */}
          {currentView === 'identitas' && (
            <IdentitasWilayahView
              data={data}
              surveys={surveys}
              activeSurveyId={activeSurveyId}
              onSelectSurvey={handleSelectSurvey}
              onSwitchToEditor={() => {
                setCurrentView('form-screen');
                setActiveSection('section-1');
              }}
              canEdit={canEditActive.allowed}
              onSave={handleManualSave}
              lastSavedTime={lastSavedTime}
              updateTitikPengamatan={updateTitikPengamatan}
              updateSituasiKebahasaan={updateSituasiKebahasaan}
              updateSituasiGeografis={updateSituasiGeografis}
              updateUsiaDesa={updateUsiaDesa}
              updateSejarahDesa={updateSejarahDesa}
            />
          )}

          {/* VIEW: KONDISI KEBAHASAAN & SOSIODEMOGRAFI */}
          {currentView === 'kondisi-bahasa' && (
            <KondisiKebahasaanView
              data={data}
              canEdit={canEditActive.allowed}
              onSave={handleManualSave}
              lastSavedTime={lastSavedTime}
              updatePenduduk={updatePenduduk}
              updateMataPencaharian={updateMataPencaharian}
              updatePendidikan={updatePendidikan}
              updateSaranaPendidikan={updateSaranaPendidikan}
              updateAgama={updateAgama}
              updateHubunganMobilitas={updateHubunganMobilitas}
              updateAlatTransportasi={updateAlatTransportasi}
              onNavigateToMap={() => {
                setCurrentView('peta-vitalitas');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {/* VIEW: KOSAKATA & ANALISIS KESAMAAN ANTAR TP */}
          {currentView === 'kosakata' && (
            <KosakataPerBahasaView
              surveys={surveys}
              activeSurveyData={data}
              activeSurveyId={activeSurveyId}
              onSelectSurvey={(id) => {
                handleSelectSurvey(id);
              }}
              onNavigateToForm={(targetId) => {
                handleSelectSurvey(targetId);
                setCurrentView('form-screen');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              canEdit={canEditActive.allowed}
              currentUser={currentUser}
              onOpenProfile={() => setIsProfileOpen(true)}
            />
          )}

          {/* VIEW: SASTRA LISAN & FOLKLORE */}
          {currentView === 'sastra-lisan' && (
            <SastraLisanView
              data={data}
              canEdit={canEditActive.allowed}
              onNavigateToMap={() => {
                setCurrentView('peta-sastra-lisan');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {/* VIEW: DIALEKTOMETRI & PETA GUITER */}
          {currentView === 'dialektometri' && (
            <div className="space-y-6">
              <Section16DialektometriPeta
                data={data.dialektometri}
                titikPengamatan={data.titikPengamatan}
                situasiGeografis={data.situasiGeografis}
                kosakataLengkap={data.kosakataLengkap}
                allSurveys={surveys}
                activeSurveyId={activeSurveyId}
                onUpdateTitikPembanding={updateTitikPembanding}
                onUpdateCatatan={updateCatatanDialektometri}
              />
            </div>
          )}

          {/* VIEW: REVITALISASI BAHASA DAERAH (MONEV IKRBD & RAP) */}
          {currentView === 'revitalisasi' && (
            <RevitalisasiView
              data={data}
              canEdit={canEditActive.allowed}
              onNavigateToMap={() => {
                setCurrentView('peta-revitalisasi');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {/* VIEW: PUSAT KUESIONER TERPADU (PEMETAAN, SASTRA LISAN, VITALITAS, REVITALISASI) */}
          {currentView === 'kuesioner' && (
            <KuesionerHubView
              activeTab={kuesionerTab}
              onChangeTab={setKuesionerTab}
              data={data}
              surveys={surveys}
              activeSurveyId={activeSurveyId}
              canEdit={canEditActive.allowed}
              currentUser={currentUser}
              lastSavedTime={lastSavedTime}
              onSave={handleManualSave}
              activeScreenNumber={activeScreenNumber}
              onScreenChange={handleScreenChange}
              formMode={formMode}
              onChangeFormMode={setFormMode}
              onLoadSample={handleLoadSample}
              onResetEmpty={handleResetEmpty}
              validationSummary={validationSummary}
              onOpenValidationModal={() => setShowValidationWarningModal(true)}
              updateTitikPengamatan={updateTitikPengamatan}
              updateSituasiKebahasaan={updateSituasiKebahasaan}
              updateSituasiGeografis={updateSituasiGeografis}
              updatePenduduk={updatePenduduk}
              updateMataPencaharian={updateMataPencaharian}
              updatePendidikan={updatePendidikan}
              updateSaranaPendidikan={updateSaranaPendidikan}
              updateAgama={updateAgama}
              updateHubunganMobilitas={updateHubunganMobilitas}
              updateAlatTransportasi={updateAlatTransportasi}
              updateUsiaDesa={updateUsiaDesa}
              updateSejarahDesa={updateSejarahDesa}
              updateFolklore={updateFolklore}
              updateNarasumber={updateNarasumber}
              updateSwadeshItem={updateSwadeshItem}
              updateBudayaItem={updateBudayaItem}
              updateSwadeshAudio={updateSwadeshAudio}
              updateBudayaAudio={updateBudayaAudio}
              updateFrasaItem={updateFrasaItem}
              updateKalimatItem={updateKalimatItem}
              addKalimat={addKalimat}
              removeKalimat={removeKalimat}
              updateCatatanPengumpul={updateCatatanPengumpul}
              importExcelCustomList={importExcelCustomList}
              importExcelUpdateSwadesh={importExcelUpdateSwadesh}
              updateExcelItem={updateExcelItem}
              updateExcelAudio={updateExcelAudio}
              addExcelItem={addExcelItem}
              removeExcelItem={removeExcelItem}
              clearExcelList={clearExcelList}
              updateTitikPembanding={updateTitikPembanding}
              updateCatatanDialektometri={updateCatatanDialektometri}
              navigateToDialektometriSection={navigateToDialektometriSection}
              onSelectSurvey={handleSelectSurvey}
              onCreateNewSurvey={handleCreateNew}
              onDeleteSurvey={handleDelete}
              onDuplicateSurvey={handleDuplicate}
            />
          )}

          {/* VIEW: COMPARISON / PERBANDINGAN DUA TITIK */}
          {currentView === 'comparison' && (
            <div className="space-y-6">
              <LanguageComparison
                surveys={surveys}
                activeSurveyId={activeSurveyId}
                onOpenRegionalReport={() => setIsRegionalReportOpen(true)}
                onSelectSurvey={handleSelectSurvey}
                onNavigateToForm={(targetId) => {
                  handleSelectSurvey(targetId);
                  setCurrentView('form-screen');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToSastraLisanForm={() => {
                  setKuesionerTab('sastra-lisan');
                  setCurrentView('kuesioner-sastra-lisan');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToVitalitasForm={() => {
                  setKuesionerTab('vitalitas');
                  setCurrentView('kuesioner-vitalitas');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToRevitalisasiForm={() => {
                  setKuesionerTab('revitalisasi');
                  setCurrentView('kuesioner-revitalisasi');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}

          {/* VIEW: DOKUMENTASI & TATA CARA PENGGUNAAN */}
          {currentView === 'dokumentasi' && (
            <DokumentasiPanduanView
              onNavigateToView={(view) => {
                setCurrentView(view);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenPRDModal={() => setIsPRDModalOpen(true)}
              onLoadSample={handleLoadSample}
              onCreateNew={() => handleCreateNew('empty')}
              onOpenExport={() => setIsExportOpen(true)}
            />
          )}

          {/* VIEW: PENGATURAN & MANAJEMEN PENGGUNA */}
          {currentView === 'pengaturan' && currentUser && (
            <PengaturanBentoView
              currentUser={currentUser}
              surveys={surveys}
              onUserUpdated={() => {
                const refreshed = getCurrentUser();
                if (refreshed) setCurrentUser(refreshed);
              }}
            />
          )}

          {/* VIEW: FORM 16-SCREEN FOCUSED FLOW */}
          {currentView === 'form-screen' && (
            <div className="space-y-6">
              {/* Stepper Header Bar */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 sm:p-5 shadow-2xs transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-blue-600 text-white font-bold text-xs shadow-2xs shrink-0">
                      {activeScreenNumber}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                          {SECTIONS_META[activeScreenNumber - 1]?.title}
                        </h2>
                        <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {SECTIONS_META[activeScreenNumber - 1]?.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Layar {activeScreenNumber} dari 16 Bagian Instrumen Pemetaan Bahasa
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentView('form-all')}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 border border-transparent dark:border-slate-700 rounded-md text-xs font-medium transition-colors"
                      title="Tampilkan semua 16 seksi formulir dalam satu halaman panjang"
                    >
                      <ListFilter className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>Mode Gulir Penuh</span>
                    </button>

                    {canEditActive.allowed && (
                      <div className="hidden sm:flex items-center gap-1.5">
                        <button
                          onClick={handleLoadSample}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium transition-colors"
                          title="Muat data sampel contoh"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>Sampel</span>
                        </button>
                        <button
                          onClick={handleResetEmpty}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium transition-colors"
                          title="Kosongkan formulir aktif"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                          <span>Kosongkan</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 16-Screen Quick Step Pill Buttons with Real-time Error Counts */}
                <div className="mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {SECTIONS_META.map((sec) => {
                    const isCurrent = sec.number === activeScreenNumber;
                    const isPast = sec.number < activeScreenNumber;
                    const secErrors = validationSummary.errorsBySection[sec.number] || [];
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => handleScreenChange(sec.number)}
                        className={`group relative flex items-center justify-center min-w-9 h-9 sm:min-w-8 sm:h-8 px-2 rounded-md text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                          isCurrent
                            ? 'bg-blue-600 text-white shadow-2xs ring-2 ring-blue-300 dark:ring-blue-500 ring-offset-1 dark:ring-offset-slate-900'
                            : isPast
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/60'
                            : 'bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title={`${sec.number}. ${sec.title}${secErrors.length > 0 ? ` (${secErrors.length} kolom perlu perbaikan)` : ''}`}
                      >
                        <span>{sec.number}</span>
                        <span className="hidden xl:inline ml-1 text-[11px] font-normal truncate max-w-[80px]">
                          {sec.shortTitle.replace(/^\d+\.\s*/, '')}
                        </span>

                        {/* Error counter badge on step pill */}
                        {secErrors.length > 0 && (
                          <span
                            className={`absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs animate-pulse ${
                              isCurrent ? 'bg-rose-500 text-white ring-2 ring-white dark:ring-slate-900' : 'bg-rose-500 text-white'
                            }`}
                            title={`${secErrors.length} kolom belum valid`}
                          >
                            {secErrors.length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Progress Bar & Section Error Summary */}
                <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
                        style={{ width: `${Math.round((activeScreenNumber / 16) * 100)}%` }}
                      />
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-slate-200 shrink-0">
                      {Math.round((activeScreenNumber / 16) * 100)}% Selesai
                    </span>
                  </div>

                  {validationSummary.totalErrors > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowValidationWarningModal(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer ml-2"
                      title="Lihat seluruh kolom yang belum valid"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{validationSummary.totalErrors} Error Validasi</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Active Screen Component (Disabled when in Read-Only Mode) */}
              <fieldset disabled={!canEditActive.allowed} className="space-y-6 border-0 p-0 m-0 min-w-0 disabled:opacity-90">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeScreenNumber}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    {activeScreenNumber === 1 && (
                  <Section1TitikPengamatan
                    data={data.titikPengamatan}
                    onChange={updateTitikPengamatan}
                  />
                )}
                {activeScreenNumber === 2 && (
                  <Section2SituasiKebahasaan
                    data={data.situasiKebahasaan}
                    onChangeDirection={updateSituasiKebahasaan}
                  />
                )}
                {activeScreenNumber === 3 && (
                  <Section3SituasiGeografis
                    data={data.situasiGeografis}
                    onChange={updateSituasiGeografis}
                    titikPengamatan={data.titikPengamatan}
                  />
                )}
                {activeScreenNumber === 4 && (
                  <Section4Penduduk
                    data={data.penduduk}
                    onChange={updatePenduduk}
                  />
                )}
                {activeScreenNumber === 5 && (
                  <Section5MataPencaharian
                    data={data.mataPencaharian}
                    onChange={updateMataPencaharian}
                  />
                )}
                {activeScreenNumber === 6 && (
                  <Section6Pendidikan
                    data={data.pendidikan}
                    onChange={updatePendidikan}
                  />
                )}
                {activeScreenNumber === 7 && (
                  <Section7SaranaPendidikan
                    data={data.saranaPendidikan}
                    onChange={updateSaranaPendidikan}
                  />
                )}
                {activeScreenNumber === 8 && (
                  <Section8Agama
                    data={data.agama}
                    onChange={updateAgama}
                  />
                )}
                {activeScreenNumber === 9 && (
                  <Section9HubunganMobilitas
                    data={data.hubunganMobilitas}
                    onChange={updateHubunganMobilitas}
                  />
                )}
                {activeScreenNumber === 10 && (
                  <Section10Transportasi
                    data={data.alatTransportasi}
                    onChange={updateAlatTransportasi}
                  />
                )}
                {activeScreenNumber === 11 && (
                  <Section11UsiaDesa
                    data={data.usiaDesa}
                    onChange={updateUsiaDesa}
                  />
                )}
                {activeScreenNumber === 12 && (
                  <Section12SejarahDesa
                    data={data.sejarahDesa}
                    onChange={updateSejarahDesa}
                  />
                )}
                {activeScreenNumber === 13 && (
                  <Section13Folklore
                    data={data.folklore}
                    onChange={updateFolklore}
                  />
                )}
                {activeScreenNumber === 14 && (
                  <Section14Narasumber
                    narasumberList={data.narasumberList}
                    onUpdateNarasumber={updateNarasumber}
                  />
                )}
                {activeScreenNumber === 15 && (
                  <Section15Kosakata
                    data={data.kosakataLengkap}
                    onUpdateSwadeshItem={updateSwadeshItem}
                    onUpdateBudayaItem={updateBudayaItem}
                    onUpdateSwadeshAudio={updateSwadeshAudio}
                    onUpdateBudayaAudio={updateBudayaAudio}
                    onUpdateFrasaItem={updateFrasaItem}
                    onUpdateKalimatItem={updateKalimatItem}
                    onAddKalimat={addKalimat}
                    onRemoveKalimat={removeKalimat}
                    onUpdateCatatanPengumpul={updateCatatanPengumpul}
                    onImportExcelCustomList={importExcelCustomList}
                    onImportExcelUpdateSwadesh={importExcelUpdateSwadesh}
                    onUpdateExcelItem={updateExcelItem}
                    onUpdateExcelAudio={updateExcelAudio}
                    onAddExcelItem={addExcelItem}
                    onRemoveExcelItem={removeExcelItem}
                    onClearExcelList={clearExcelList}
                    dialektometriData={data.dialektometri}
                    titikPengamatan={data.titikPengamatan}
                    allSurveys={surveys}
                    activeSurveyId={activeSurveyId}
                    onUpdateTitikPembanding={updateTitikPembanding}
                    onNavigateToSection16={navigateToDialektometriSection}
                    onNavigateToMenuKosakata={() => {
                      setCurrentView('kosakata');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                )}
                {activeScreenNumber === 16 && (
                  <Section16DialektometriPeta
                    data={data.dialektometri}
                    titikPengamatan={data.titikPengamatan}
                    situasiGeografis={data.situasiGeografis}
                    kosakataLengkap={data.kosakataLengkap}
                    allSurveys={surveys}
                    activeSurveyId={activeSurveyId}
                    onUpdateTitikPembanding={updateTitikPembanding}
                    onUpdateCatatan={updateCatatanDialektometri}
                  />
                )}
                  </motion.div>
                </AnimatePresence>
              </fieldset>

              <div className="space-y-6">

                {/* Floating Bottom Action Bar: Responsive for all Mobile Aspect Ratios */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 sm:p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-[64px] lg:bottom-4 z-20 transition-colors">
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                    <button
                      type="button"
                      onClick={() => handleScreenChange(activeScreenNumber - 1)}
                      disabled={activeScreenNumber === 1}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold transition-colors min-h-[44px] sm:min-h-0 ${
                        activeScreenNumber === 1
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-2xs hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Kembali</span>
                    </button>

                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium sm:hidden">
                      Layar {activeScreenNumber} dari 16
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                    {validationSummary.errorsBySection[activeScreenNumber]?.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowValidationWarningModal(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold cursor-pointer transition-colors hover:bg-rose-100 dark:hover:bg-rose-900/60 shadow-2xs"
                        title="Terdapat input yang belum valid di layar ini (klik untuk tinjau)"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                        <span>{validationSummary.errorsBySection[activeScreenNumber].length} Error Validasi</span>
                      </button>
                    )}

                    {canEditActive.allowed && (
                      <button
                        type="button"
                        onClick={handleManualSave}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition-colors cursor-pointer min-h-[44px] sm:min-h-0 flex-1 sm:flex-none"
                        title="Simpan kuesioner ke peramban"
                      >
                        <Save className="w-4 h-4" />
                        <span>Simpan</span>
                        {lastSavedTime && (
                          <span className="hidden md:inline text-[10px] text-emerald-100 font-normal ml-1">
                            ({lastSavedTime})
                          </span>
                        )}
                      </button>
                    )}

                    {activeScreenNumber < 16 ? (
                      <button
                        type="button"
                        onClick={() => handleScreenChange(activeScreenNumber + 1)}
                        className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-2xs transition-colors cursor-pointer min-h-[44px] sm:min-h-0 flex-1 sm:flex-none"
                      >
                        <span>Selanjutnya</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          handleManualSave();
                          setCurrentView('dashboard');
                          triggerToast('Kuesioner lengkap telah disimpan. Menampilkan ringkasan data survei.');
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-2xs transition-colors cursor-pointer min-h-[44px] sm:min-h-0 flex-1 sm:flex-none"
                      >
                        <span>Selesai & Buka Dashboard</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: FORM ALL-SECTIONS CONTINUOUS FLOW */}
          {currentView === 'form-all' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 sm:p-4 shadow-2xs flex items-center justify-between transition-colors">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                    Mode Gulir Penuh (Seluruh 16 Seksi)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Gulir ke bawah untuk mengisi seluruh bagian formulir dalam satu halaman.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentView('form-screen')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-semibold shadow-2xs cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Mode 16 Layar</span>
                </button>
              </div>

              {/* Form All Sections (Disabled when in Read-Only Mode) */}
              <fieldset disabled={!canEditActive.allowed} className="space-y-8 border-0 p-0 m-0 min-w-0 disabled:opacity-90">
                <Section1TitikPengamatan
                  data={data.titikPengamatan}
                  onChange={updateTitikPengamatan}
                />
              <Section2SituasiKebahasaan
                data={data.situasiKebahasaan}
                onChangeDirection={updateSituasiKebahasaan}
              />
              <Section3SituasiGeografis
                data={data.situasiGeografis}
                onChange={updateSituasiGeografis}
                titikPengamatan={data.titikPengamatan}
              />
              <Section4Penduduk
                data={data.penduduk}
                onChange={updatePenduduk}
              />
              <Section5MataPencaharian
                data={data.mataPencaharian}
                onChange={updateMataPencaharian}
              />
              <Section6Pendidikan
                data={data.pendidikan}
                onChange={updatePendidikan}
              />
              <Section7SaranaPendidikan
                data={data.saranaPendidikan}
                onChange={updateSaranaPendidikan}
              />
              <Section8Agama
                data={data.agama}
                onChange={updateAgama}
              />
              <Section9HubunganMobilitas
                data={data.hubunganMobilitas}
                onChange={updateHubunganMobilitas}
              />
              <Section10Transportasi
                data={data.alatTransportasi}
                onChange={updateAlatTransportasi}
              />
              <Section11UsiaDesa
                data={data.usiaDesa}
                onChange={updateUsiaDesa}
              />
              <Section12SejarahDesa
                data={data.sejarahDesa}
                onChange={updateSejarahDesa}
              />
              <Section13Folklore
                data={data.folklore}
                onChange={updateFolklore}
              />
              <Section14Narasumber
                narasumberList={data.narasumberList}
                onUpdateNarasumber={updateNarasumber}
              />
              <Section15Kosakata
                data={data.kosakataLengkap}
                onUpdateSwadeshItem={updateSwadeshItem}
                onUpdateBudayaItem={updateBudayaItem}
                onUpdateSwadeshAudio={updateSwadeshAudio}
                onUpdateBudayaAudio={updateBudayaAudio}
                onUpdateFrasaItem={updateFrasaItem}
                onUpdateKalimatItem={updateKalimatItem}
                onAddKalimat={addKalimat}
                onRemoveKalimat={removeKalimat}
                onUpdateCatatanPengumpul={updateCatatanPengumpul}
                onImportExcelCustomList={importExcelCustomList}
                onImportExcelUpdateSwadesh={importExcelUpdateSwadesh}
                onUpdateExcelItem={updateExcelItem}
                onUpdateExcelAudio={updateExcelAudio}
                onAddExcelItem={addExcelItem}
                onRemoveExcelItem={removeExcelItem}
                onClearExcelList={clearExcelList}
                dialektometriData={data.dialektometri}
                titikPengamatan={data.titikPengamatan}
                allSurveys={surveys}
                activeSurveyId={activeSurveyId}
                onUpdateTitikPembanding={updateTitikPembanding}
                onNavigateToSection16={navigateToDialektometriSection}
                onNavigateToMenuKosakata={() => {
                  setCurrentView('kosakata');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
              <Section16DialektometriPeta
                data={data.dialektometri}
                titikPengamatan={data.titikPengamatan}
                situasiGeografis={data.situasiGeografis}
                kosakataLengkap={data.kosakataLengkap}
                allSurveys={surveys}
                activeSurveyId={activeSurveyId}
                onUpdateTitikPembanding={updateTitikPembanding}
                onUpdateCatatan={updateCatatanDialektometri}
              />
              </fieldset>

              {/* Bottom save bar */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs flex items-center justify-between sticky bottom-[64px] lg:bottom-4 z-20 transition-colors">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Menampilkan seluruh 16 bagian kuesioner. Anda juga dapat beralih ke tampilan per-layar.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView('form-screen');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-900 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-transparent dark:border-slate-700"
                  >
                    <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Mode 16 Layar</span>
                  </button>
                  {canEditActive.allowed && (
                    <button
                      type="button"
                      onClick={handleManualSave}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan Formulir</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          </motion.div>
        </AnimatePresence>
        </main>

        {/* Floating Bottom Navigation Bar (Dock Menggantung) */}
        <FloatingBottomNav
          currentView={currentView}
          onChangeView={handleSelectView}
          onOpenMenu={() => setIsOpenMobileSidebar(true)}
          activeScreenNumber={activeScreenNumber}
          activeSurveyProgress={activeSurvey?.progress}
        />
      </div>

      {/* Floating Action Button: Back to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-22 sm:bottom-24 left-4 sm:left-6 z-30 p-2.5 rounded-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-lg transition-all hover:bg-white dark:hover:bg-slate-700 cursor-pointer"
        title="Kembali ke atas"
      >
        <ArrowUp className="w-4 h-4" />
      </button>

      {/* Offline Status & Connectivity Banner */}
      <OfflineIndicator />

      {/* Automated Validation Warning & Review Modal */}
      <ValidationWarningModal
        isOpen={showValidationWarningModal}
        errors={validationSummary.errors}
        onClose={() => setShowValidationWarningModal(false)}
        onFixField={(secNum, fieldId) => {
          setActiveScreenNumber(secNum);
          setCurrentView('form-screen');
          setShowValidationWarningModal(false);
          setTimeout(() => {
            const el = document.getElementById(fieldId);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.focus();
              el.classList.add('ring-4', 'ring-rose-500/40');
              setTimeout(() => el.classList.remove('ring-4', 'ring-rose-500/40'), 1500);
            }
          }, 300);
        }}
        onConfirmSaveAnyway={executeSave}
      />

      {/* Global Command / Search Modal */}
      <CommandSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectView={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectScreen={(screenNum) => {
          setActiveScreenNumber(screenNum);
          setCurrentView('form-screen');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* User Profile Modal */}
      {currentUser && (
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          currentUser={currentUser}
          surveys={surveys}
          onUserUpdated={(updatedUser) => {
            setCurrentUser(updatedUser);
          }}
          onSelectSurvey={(surveyId) => {
            handleSelectSurvey(surveyId);
            setIsProfileOpen(false);
          }}
          onLogout={handleLogout}
        />
      )}

      {/* User Management & Role Assignment Modal (Admin Otoritas) */}
      {currentUser && (
        <UserManagementModal
          isOpen={isUserManagementOpen}
          onClose={() => setIsUserManagementOpen(false)}
          currentUser={currentUser}
          surveys={surveys}
          onUserUpdated={() => {
            setSurveys(loadAllSurveys());
          }}
        />
      )}

      {/* Role Request Modal (Tamu / Surveyor / Verifikator) */}
      {currentUser && (
        <RoleRequestModal
          isOpen={isRoleRequestModalOpen}
          onClose={() => setIsRoleRequestModalOpen(false)}
          currentUser={currentUser}
          onSuccess={(msg) => triggerToast(msg)}
        />
      )}

      {/* Product Requirement Document (PRD) & Detailed User Flow Modal */}
      <PRDDocumentModal
        isOpen={isPRDModalOpen}
        onClose={() => setIsPRDModalOpen(false)}
      />
    </div>
  );
}

