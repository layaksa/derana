import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  X, 
  Layers, 
  BookOpen, 
  Compass, 
  Users, 
  LayoutDashboard, 
  Database, 
  Settings, 
  ArrowRight,
  FileText,
  Sparkles,
  HelpCircle,
  BarChart3,
  Scale,
  History,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Edit3,
  PlusCircle,
  Copy,
  Trash2,
  UploadCloud,
  Tag,
  User,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  MapPin,
  Code,
  Hash,
  Filter,
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react';
import { SECTIONS_META } from '../NavigationStepper';
import { ViewKey } from './AppSidebar';
import { SurveyRecord } from '../../types/linguistic';
import { AppUser } from '../../types/auth';
import { SurveyActivityLog, ActivityActionType } from '../../types/activityLog';
import { loadActivityLogs, ensureBeforeAfterDiff } from '../../utils/activityLogStorage';

interface CommandSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (view: ViewKey) => void;
  onSelectScreen: (screenNumber: number) => void;
  onOpenRegionalReport?: () => void;
  surveys?: SurveyRecord[];
  activeSurveyId?: string | null;
  onSelectSurvey?: (surveyId: string) => void;
  onOpenChangeHistory?: (surveyId: string) => void;
  currentUser?: AppUser | null;
}

type SearchCategory = 'all' | 'activities' | 'views' | 'sections';

interface ActivitySearchItem {
  type: 'activity';
  id: string;
  log: SurveyActivityLog;
  title: string;
  desc: string;
  details: string;
  beforeValue: string;
  afterValue: string;
  surveyId: string;
  fieldName?: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  sectionNumber: number | null;
  actionType: ActivityActionType;
  keywords: string[];
  icon: React.ComponentType<{ className?: string }>;
}

interface ViewSearchItem {
  type: 'view';
  key: ViewKey;
  title: string;
  desc: string;
  keywords: string[];
  icon: React.ComponentType<{ className?: string }>;
}

interface SectionSearchItem {
  type: 'section';
  number: number;
  title: string;
  desc: string;
  category: string;
  keywords: string[];
  icon: React.ComponentType<{ className?: string }>;
}

interface ActionSearchItem {
  type: 'action';
  id: string;
  title: string;
  desc: string;
  keywords: string[];
  icon: React.ComponentType<{ className?: string }>;
  onExecute: () => void;
}

type SearchItem = ViewSearchItem | SectionSearchItem | ActionSearchItem | ActivitySearchItem;

/**
 * Format relative Indonesian timestamp
 */
function formatRelativeTime(isoString: string): string {
  try {
    const timestamp = new Date(isoString).getTime();
    if (isNaN(timestamp)) return 'Beberapa saat lalu';
    
    const diffMs = Date.now() - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 45) return 'Baru saja';
    if (diffMin < 60) return `${diffMin} mnt lalu`;
    if (diffHour < 24) return `${diffHour} jam lalu`;
    if (diffDay === 1) {
      const time = new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      return `Kemarin, ${time}`;
    }
    if (diffDay < 7) return `${diffDay} hari lalu`;

    return new Date(isoString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return 'Waktu tidak valid';
  }
}

/**
 * Infer corresponding form section number (1-16) from activity log section information
 */
function inferSectionNumber(log: SurveyActivityLog): number | null {
  const secName = (log.sectionName || '').toLowerCase();
  const secId = (log.sectionId || '').toLowerCase();
  const field = (log.diffSummary?.field || '').toLowerCase();

  // Explicit number pattern in sectionName (e.g. "Seksi 1 -", "Seksi 15", "Bagian 3")
  const matchNum = secName.match(/(?:seksi|bagian)\s*(\d+)/i);
  if (matchNum && matchNum[1]) {
    const parsed = parseInt(matchNum[1], 10);
    if (parsed >= 1 && parsed <= 16) return parsed;
  }

  // Keywords mapping
  if (secId.includes('swadesh') || field.includes('swadesh') || secName.includes('swadesh') || secId.includes('kosakata')) return 15;
  if (secId.includes('sastra') || field.includes('sastra') || secName.includes('sastra') || secName.includes('folklor')) return 13;
  if (secId.includes('titik') || secId.includes('identitas') || field.includes('titikpengamatan')) return 1;
  if (secId.includes('bahasa') || secId.includes('situasikebahasaan')) return 2;
  if (secId.includes('morfologi') || secId.includes('geografis') || field.includes('situasigeografis')) return 3;
  if (secId.includes('penduduk') || field.includes('penduduk')) return 4;
  if (secId.includes('pekerjaan') || secId.includes('matapencaharian') || field.includes('matapencaharian')) return 5;
  if (secId.includes('pendidikan') && !secId.includes('sarana')) return 6;
  if (secId.includes('saranapendidikan')) return 7;
  if (secId.includes('agama') || field.includes('agama')) return 8;
  if (secId.includes('mobilitas') || field.includes('mobilitas')) return 9;
  if (secId.includes('transportasi') || field.includes('transportasi')) return 10;
  if (secId.includes('usiadesa') || field.includes('usiadesa')) return 11;
  if (secId.includes('sejarah') || field.includes('sejarahdesa')) return 12;
  if (secId.includes('narasumber') || field.includes('narasumber')) return 14;
  if (secId.includes('dialektometri') || secId.includes('verifikasi') || field.includes('dialektometri')) return 16;

  return null;
}

/**
 * Visual styling and icon for activity actions
 */
function getActivityBadgeConfig(action: ActivityActionType) {
  switch (action) {
    case 'verify_survey':
      return {
        label: 'Verifikasi Valid',
        badgeClass: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        icon: ShieldCheck,
        iconColor: 'text-emerald-600 dark:text-emerald-400'
      };
    case 'unverify_survey':
      return {
        label: 'Batal Verifikasi',
        badgeClass: 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        icon: ShieldAlert,
        iconColor: 'text-rose-600 dark:text-rose-400'
      };
    case 'create_survey':
      return {
        label: 'Survei Baru',
        badgeClass: 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        icon: PlusCircle,
        iconColor: 'text-blue-600 dark:text-blue-400'
      };
    case 'update_section':
      return {
        label: 'Edit Seksi',
        badgeClass: 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        icon: Edit3,
        iconColor: 'text-indigo-600 dark:text-indigo-400'
      };
    case 'update_metadata':
      return {
        label: 'Edit Info',
        badgeClass: 'bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
        icon: Tag,
        iconColor: 'text-teal-600 dark:text-teal-400'
      };
    case 'duplicate_survey':
      return {
        label: 'Duplikasi',
        badgeClass: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        icon: Copy,
        iconColor: 'text-amber-600 dark:text-amber-400'
      };
    case 'delete_survey':
      return {
        label: 'Dihapus',
        badgeClass: 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        icon: Trash2,
        iconColor: 'text-rose-600 dark:text-rose-400'
      };
    case 'import_survey':
      return {
        label: 'Impor JSON',
        badgeClass: 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
        icon: UploadCloud,
        iconColor: 'text-cyan-600 dark:text-cyan-400'
      };
    default:
      return {
        label: 'Aktivitas',
        badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        icon: History,
        iconColor: 'text-slate-600 dark:text-slate-400'
      };
  }
}

/**
 * Structured query parsed for targeted research searching:
 * - field:daftarSwadesh or kolom:swadesh
 * - user:budi or surveyor:hendra
 * - id:karangwangi or survey:rancabuaya
 */
interface ParsedResearchQuery {
  fieldFilter?: string;
  userFilter?: string;
  surveyIdFilter?: string;
  actionFilter?: string;
  beforeFilter?: string;
  afterFilter?: string;
  freeTokens: string[];
}

function parseResearchQuery(query: string): ParsedResearchQuery {
  const rawTokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  let fieldFilter: string | undefined;
  let userFilter: string | undefined;
  let surveyIdFilter: string | undefined;
  let actionFilter: string | undefined;
  let beforeFilter: string | undefined;
  let afterFilter: string | undefined;
  const freeTokens: string[] = [];

  for (const token of rawTokens) {
    if (token.startsWith('field:') || token.startsWith('kolom:') || token.startsWith('f:')) {
      const val = token.replace(/^(field|kolom|f):/, '').trim();
      if (val) fieldFilter = val;
    } else if (token.startsWith('user:') || token.startsWith('surveyor:') || token.startsWith('pengguna:') || token.startsWith('u:')) {
      const val = token.replace(/^(user|surveyor|pengguna|u):/, '').trim();
      if (val) userFilter = val;
    } else if (token.startsWith('id:') || token.startsWith('survey:') || token.startsWith('survei:')) {
      const val = token.replace(/^(id|survey|survei):/, '').trim();
      if (val) surveyIdFilter = val;
    } else if (token.startsWith('action:') || token.startsWith('aksi:')) {
      const val = token.replace(/^(action|aksi):/, '').trim();
      if (val) actionFilter = val;
    } else if (token.startsWith('before:') || token.startsWith('sebelum:')) {
      const val = token.replace(/^(before|sebelum):/, '').trim();
      if (val) beforeFilter = val;
    } else if (token.startsWith('after:') || token.startsWith('sesudah:')) {
      const val = token.replace(/^(after|sesudah):/, '').trim();
      if (val) afterFilter = val;
    } else {
      freeTokens.push(token);
    }
  }

  return { fieldFilter, userFilter, surveyIdFilter, actionFilter, beforeFilter, afterFilter, freeTokens };
}

export const CommandSearchModal: React.FC<CommandSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectView,
  onSelectScreen,
  onOpenRegionalReport,
  surveys = [],
  activeSurveyId,
  onSelectSurvey,
  onOpenChangeHistory,
  currentUser
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activityLogs, setActivityLogs] = useState<SurveyActivityLog[]>([]);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Mobile viewport and touchscreen detection for enhanced touch accessibility
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 640 || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateViewport = () => {
      const isMobile = window.innerWidth < 640 || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
      setIsMobileViewport(isMobile);
    };
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  // Load activity logs whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      const logs = loadActivityLogs();
      // Sort newest first chronologically
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivityLogs(logs);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setQuery('');
      setActiveCategory('all');
      setSelectedUserFilter('all');
      setSortOrder('newest'); // Ensure default is chronological newest first
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Static Navigation Views
  const menuItems: ViewSearchItem[] = useMemo(() => [
    { 
      type: 'view', 
      key: 'peta-sastra-lisan', 
      title: 'Peta Sastra Lisan (GIS CARTO)', 
      desc: 'Visualisasi spasial sebaran cerita rakyat, motif Stith Thompson, narasumber, dan rekaman audio', 
      keywords: ['peta sastra', 'sastra lisan', 'cerita rakyat', 'mite', 'legenda', 'dongeng', 'tembang', 'motif', 'thompson', 'audio', 'narasumber'], 
      icon: BookOpen 
    },
    { 
      type: 'view', 
      key: 'peta-vitalitas', 
      title: 'Peta Vitalitas Bahasa (GIS CARTO)', 
      desc: 'Pemetaan tingkat daya hidup bahasa menurut 6 status UNESCO & EGIDS (Aman, Rentan, Mundur, Terancam, Kritis, Punah)', 
      keywords: ['peta vitalitas', 'vitalitas bahasa', 'daya hidup', 'unesco', 'egids', 'aman', 'rentan', 'terancam punah', 'kritis', '95 butir'], 
      icon: BarChart3 
    },
    { 
      type: 'view', 
      key: 'peta-revitalisasi', 
      title: 'Peta Revitalisasi Bahasa (GIS CARTO)', 
      desc: 'Pemetaan hasil Monev IKRBD, sekolah binaan, sebaran guru master pengimbas, dan agenda FTBI', 
      keywords: ['peta revitalisasi', 'revitalisasi bahasa', 'ikrbd', 'rap', 'pengimbasan', 'guru master', 'sekolah binaan', 'ftbi', 'mbrbd'], 
      icon: Sparkles 
    },
    { 
      type: 'view', 
      key: 'dashboard', 
      title: 'Dashboard Ringkasan & Wilayah', 
      desc: 'Ringkasan metrik, statistik survei, kalkulasi progres kolom 16 seksi, dan penugasan wilayah', 
      keywords: ['beranda', 'ringkasan', 'statistik', 'overview', 'peta survei', 'pemetaan bahasa', 'desa', 'titik bahasa', 'progres', 'tenggat'], 
      icon: LayoutDashboard 
    },
    { 
      type: 'view', 
      key: 'peta-survei', 
      title: 'Peta Titik Survei Lapangan (Leaflet GIS)', 
      desc: 'Visualisasi geospasial interaktif koordinat titik pengamatan, lapisan pemetaan bahasa, filter validasi, split view', 
      keywords: ['peta', 'map', 'leaflet', 'geospasial', 'pemetaan bahasa', 'poligon', 'koordinat', 'longitude', 'latitude', 'lokasi', 'split view'], 
      icon: Compass 
    },
    { 
      type: 'view', 
      key: 'responden', 
      title: 'Data Responden & Informan', 
      desc: 'Informan, usia, profil narasumber, analisis regresi usia, dan demografi', 
      keywords: ['informan', 'narasumber', 'responden', 'demografi', 'usia', 'penduduk', 'regresi'], 
      icon: Users 
    },
    { 
      type: 'view', 
      key: 'surveys', 
      title: 'Hasil Survei & Validasi', 
      desc: 'Daftar survei lapangan berdasarkan status validasi resmi, verifikasi kurator, dan ekspor', 
      keywords: ['survei', 'survey', 'hasil', 'validasi', 'verifikasi', 'lapangan', 'tervalidasi', 'progress'], 
      icon: BarChart3 
    },
    { 
      type: 'view', 
      key: 'datasets', 
      title: 'Datasets Kebahasaan', 
      desc: 'Kelola dataset titik pengamatan, impor, ekspor JSON/Excel, dan data bahasa', 
      keywords: ['dataset', 'data', 'titik pengamatan', 'korpus', 'impor', 'ekspor', 'json', 'csv'], 
      icon: Database 
    },
    { 
      type: 'view', 
      key: 'kosakata', 
      title: 'Daftar Kosakata & Swadesh 200', 
      desc: 'Swadesh 200, kosakata budaya pesisir/agraris, transkripsi IPA, rekaman audio, frasa, dan kalimat', 
      keywords: ['kosakata', 'swadesh', 'leksikon', 'kata', 'excel', 'audio', 'frasa', 'kalimat', 'ipa', 'fonetis'], 
      icon: BookOpen 
    },
    { 
      type: 'view', 
      key: 'sastra-lisan', 
      title: 'Korpus Sastra Lisan & Tradisi Tutur', 
      desc: 'Dokumentasi sastra lisan, 28 butir motif Stith Thompson, cerita rakyat, dan audio rekaman', 
      keywords: ['sastra', 'tradisi', 'cerita', 'tutur', 'folklor', 'folklore', 'rekaman', 'mitos', 'legenda'], 
      icon: BookOpen 
    },
    { 
      type: 'view', 
      key: 'revitalisasi', 
      title: 'Revitalisasi Bahasa Daerah (Monev & RAP)', 
      desc: 'Instrumen Monev IKRBD, Rencana Aksi Pengimbasan, dan pemantauan FTBI', 
      keywords: ['revitalisasi', 'monev', 'ikrbd', 'rencana aksi', 'pelindungan', 'pengembangan', 'guru master'], 
      icon: Sparkles 
    },
    { 
      type: 'view', 
      key: 'dialektometri', 
      title: 'Dialektometri & Peta Isoglos', 
      desc: 'Hitung indeks segitiga Guiter, garis isoglos, varian leksikal, dan zona dialek', 
      keywords: ['dialektometri', 'dialek', 'isoglos', 'guiter', 'poligon', 'heatmap', 'garis', 'varian leksikal'], 
      icon: Compass 
    },
    { 
      type: 'view', 
      key: 'comparison', 
      title: 'Perbandingan Dua Titik Bahasa', 
      desc: 'Komparasi berdampingan 2 survei, Peta CARTO Tri-Instrumen, dan ekspor Laporan Wilayah PDF', 
      keywords: ['perbandingan dua titik', 'komparasi', 'side by side', 'peta survei', 'peta carto', 'laporan wilayah', 'pdf'], 
      icon: Scale 
    },
    { 
      type: 'view', 
      key: 'kuesioner', 
      title: 'Pusat Kuesioner Terpadu', 
      desc: 'Akses seluruh instrumen: Pemetaan 16 Seksi, Sastra Lisan, Vitalitas, dan Revitalisasi', 
      keywords: ['kuesioner', 'instrumen', 'formulir', 'questionnaire', 'pemetaan', 'pengumpulan data'], 
      icon: Layers 
    },
    { 
      type: 'view', 
      key: 'dokumentasi', 
      title: 'Dokumentasi & Tata Cara Penggunaan', 
      desc: 'Panduan lengkap alur kerja, 16 seksi instrumen, metodologi dialektometri, dan PRD', 
      keywords: ['panduan', 'bantuan', 'manual', 'cara pakai', 'petunjuk', 'dokumentasi', 'tutorial'], 
      icon: HelpCircle 
    },
    { 
      type: 'view', 
      key: 'pengaturan', 
      title: 'Pengaturan & Log Audit Aktivitas', 
      desc: 'Manajemen pengguna, peran surveyor/admin, sinkronisasi cloud, dan log audit seluruh perubahan survei', 
      keywords: ['pengaturan', 'setting', 'pengguna', 'admin', 'konfigurasi', 'audit', 'log aktivitas', 'riwayat', 'role'], 
      icon: Settings 
    }
  ], []);

  // Static Questionnaire Sections
  const sectionItems: SectionSearchItem[] = useMemo(() => SECTIONS_META.map(s => ({
    type: 'section',
    number: s.number,
    title: `Seksi ${s.number}: ${s.title}`,
    desc: `Instrumen Bagian ${s.number} (${s.category})`,
    category: s.category,
    keywords: [s.title, s.category, `bagian ${s.number}`, `seksi ${s.number}`, s.shortTitle],
    icon: FileText
  })), []);

  // Dynamic Activity Log Items - Comprehensive Indexing with Field Name, User, and Survey ID
  const activityItems: ActivitySearchItem[] = useMemo(() => {
    // Sort activity logs chronologically: most recent edits appear at the top by default
    const sortedLogs = [...activityLogs].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return sortedLogs.map(log => {
      const secNum = inferSectionNumber(log);
      const badgeConfig = getActivityBadgeConfig(log.action);
      const fieldName = log.diffSummary?.field || '';
      const diffVals = ensureBeforeAfterDiff(log);
      const beforeValue = diffVals.before;
      const afterValue = diffVals.after;
      
      const keywords = [
        // Survey ID and Title Index
        log.surveyId,
        `id:${log.surveyId}`,
        `survey:${log.surveyId}`,
        log.surveyTitle || '',
        log.languageName || '',
        log.village || '',
        log.regency || '',
        
        // User Index (ID, Name, Role, Email)
        log.userId,
        `user:${log.userId}`,
        `user:${log.userName}`,
        `surveyor:${log.userName}`,
        log.userName || '',
        log.userRole || '',
        `role:${log.userRole}`,
        log.userEmail || '',
        
        // Field Name Index
        fieldName,
        fieldName ? `field:${fieldName}` : '',
        fieldName ? `kolom:${fieldName}` : '',
        log.sectionId || '',
        log.sectionName || '',
        log.diffSummary?.notes || '',
        
        // Before and After Values Index
        beforeValue,
        afterValue,
        `sebelum:${beforeValue}`,
        `sesudah:${afterValue}`,

        // Action & Content Index
        log.actionLabel || '',
        log.action || '',
        log.details || '',
        log.source || '',
        secNum ? `seksi ${secNum}` : '',
        secNum ? `bagian ${secNum}` : ''
      ];

      return {
        type: 'activity',
        id: log.id,
        log,
        title: log.actionLabel || 'Perubahan Data Survei',
        desc: `${log.surveyTitle} • ${log.userName} (${log.userRole})`,
        details: log.details,
        beforeValue,
        afterValue,
        surveyId: log.surveyId,
        fieldName: fieldName || undefined,
        userId: log.userId,
        userName: log.userName,
        userEmail: log.userEmail,
        userRole: log.userRole,
        sectionNumber: secNum,
        actionType: log.action,
        keywords,
        icon: badgeConfig.icon
      };
    });
  }, [activityLogs, sortOrder]);

  // Extract distinct field names, users, and surveys for quick filter chips and dropdowns
  const distinctFacets = useMemo(() => {
    const fields = new Set<string>();
    const usersMap = new Map<string, { id: string; name: string; role: string; email?: string; count: number }>();
    const surveysMap = new Map<string, { id: string; title: string; village?: string }>();

    let adminCount = 0;
    let surveyorCount = 0;
    let verifikatorCount = 0;

    activityLogs.forEach(l => {
      if (l.diffSummary?.field) fields.add(l.diffSummary.field);
      if (l.userId && l.userName) {
        const existing = usersMap.get(l.userId);
        if (existing) {
          existing.count += 1;
        } else {
          usersMap.set(l.userId, { 
            id: l.userId, 
            name: l.userName, 
            role: l.userRole, 
            email: l.userEmail, 
            count: 1 
          });
        }
      }
      if (l.userRole === 'admin') adminCount++;
      else if (l.userRole === 'surveyor') surveyorCount++;
      else if (l.userRole === 'verifikator') verifikatorCount++;

      if (l.surveyId) {
        surveysMap.set(l.surveyId, { id: l.surveyId, title: l.surveyTitle, village: l.village });
      }
    });

    // If currentUser is provided and not in map, register them
    if (currentUser?.id && !usersMap.has(currentUser.id)) {
      usersMap.set(currentUser.id, {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        email: currentUser.email,
        count: 0
      });
    }

    const allUsers = Array.from(usersMap.values()).sort((a, b) => b.count - a.count);
    const surveyors = allUsers.filter(u => u.role === 'surveyor');
    const admins = allUsers.filter(u => u.role === 'admin');
    const verifikators = allUsers.filter(u => u.role === 'verifikator');

    return {
      fields: Array.from(fields).slice(0, 8),
      users: allUsers,
      surveyors,
      admins,
      verifikators,
      adminCount,
      surveyorCount,
      verifikatorCount,
      surveys: Array.from(surveysMap.values()).slice(0, 6)
    };
  }, [activityLogs, currentUser]);

  // Parsed structured query
  const parsedQuery = useMemo(() => parseResearchQuery(query), [query]);

  // Matcher for activity item with structured query
  const matchActivityItem = (item: ActivitySearchItem, parsed: ParsedResearchQuery): boolean => {
    // 0. Dedicated Dropdown / Chip Surveyor or Admin User Restriction
    if (selectedUserFilter !== 'all') {
      if (selectedUserFilter.startsWith('role:')) {
        const requiredRole = selectedUserFilter.replace('role:', '').toLowerCase();
        if ((item.userRole || '').toLowerCase() !== requiredRole) return false;
      } else {
        if (item.userId !== selectedUserFilter && item.userName !== selectedUserFilter) return false;
      }
    }

    // 1. Field name check
    if (parsed.fieldFilter) {
      const targetField = (item.fieldName || item.log.sectionId || '').toLowerCase();
      if (!targetField.includes(parsed.fieldFilter)) return false;
    }

    // 2. User check
    if (parsed.userFilter) {
      const uBlob = `${item.userId} ${item.userName} ${item.userEmail} ${item.userRole}`.toLowerCase();
      if (!uBlob.includes(parsed.userFilter)) return false;
    }

    // 3. Survey ID check
    if (parsed.surveyIdFilter) {
      const sBlob = `${item.surveyId} ${item.log.surveyTitle} ${item.log.village || ''} ${item.log.regency || ''}`.toLowerCase();
      if (!sBlob.includes(parsed.surveyIdFilter)) return false;
    }

    // 4. Action check
    if (parsed.actionFilter) {
      const aBlob = `${item.actionType} ${item.title}`.toLowerCase();
      if (!aBlob.includes(parsed.actionFilter)) return false;
    }

    // 4.5. Before value check
    if (parsed.beforeFilter) {
      if (!item.beforeValue.toLowerCase().includes(parsed.beforeFilter)) return false;
    }

    // 4.6. After value check
    if (parsed.afterFilter) {
      if (!item.afterValue.toLowerCase().includes(parsed.afterFilter)) return false;
    }

    // 5. Free tokens check across full text and keywords
    if (parsed.freeTokens.length > 0) {
      const searchableBlob = [
        item.title,
        item.desc,
        item.details,
        item.surveyId,
        item.fieldName || '',
        item.userId,
        item.userName,
        item.userEmail,
        item.userRole,
        item.log.surveyTitle,
        item.log.village || '',
        item.log.languageName || '',
        ...item.keywords
      ].join(' ').toLowerCase();

      return parsed.freeTokens.every(tok => searchableBlob.includes(tok));
    }

    return true;
  };

  // Filtered Items based on Query & Active Category Tab with strict Chronological Sorting
  const filteredItems = useMemo(() => {
    const isTargetedResearchQuery = Boolean(
      parsedQuery.fieldFilter || 
      parsedQuery.userFilter || 
      parsedQuery.surveyIdFilter || 
      parsedQuery.beforeFilter || 
      parsedQuery.afterFilter ||
      parsedQuery.actionFilter ||
      selectedUserFilter !== 'all'
    );

    // 1. Filter and guarantee chronological sorting for activity search results (newest first by default)
    const matchingActivities = activityItems
      .filter(item => matchActivityItem(item, parsedQuery))
      .sort((a, b) => {
        const timeA = new Date(a.log.timestamp).getTime();
        const timeB = new Date(b.log.timestamp).getTime();
        return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
      });

    // 2. Filter views and sections (only if not a targeted activity search query)
    let matchingViews: ViewSearchItem[] = [];
    let matchingSections: SectionSearchItem[] = [];

    if (!isTargetedResearchQuery) {
      if (!query.trim()) {
        matchingViews = menuItems;
        matchingSections = sectionItems;
      } else {
        matchingViews = menuItems.filter(item => {
          const searchableText = [item.title, item.desc, ...item.keywords].join(' ').toLowerCase();
          return parsedQuery.freeTokens.every(tok => searchableText.includes(tok));
        });
        matchingSections = sectionItems.filter(item => {
          const searchableText = [item.title, item.desc, ...item.keywords].join(' ').toLowerCase();
          return parsedQuery.freeTokens.every(tok => searchableText.includes(tok));
        });
      }
    }

    if (activeCategory === 'activities') {
      return matchingActivities;
    }
    if (activeCategory === 'views') {
      return matchingViews;
    }
    if (activeCategory === 'sections') {
      return matchingSections;
    }

    // Default 'all' category:
    if (!query.trim() && selectedUserFilter === 'all') {
      // Top most recent activities in chronological order (5 items), followed by menus and sections
      return [
        ...matchingActivities.slice(0, 5),
        ...matchingViews,
        ...matchingSections
      ];
    }

    // Searching in 'all' or when filtered by user: matching activities displayed first, sorted chronologically
    return [
      ...matchingActivities,
      ...matchingViews,
      ...matchingSections
    ];
  }, [activeCategory, activityItems, menuItems, sectionItems, query, parsedQuery, sortOrder, selectedUserFilter]);

  // Counts for tabs
  const activityMatchesCount = useMemo(() => {
    return activityItems.filter(item => matchActivityItem(item, parsedQuery)).length;
  }, [activityItems, parsedQuery, selectedUserFilter]);

  const viewMatchesCount = useMemo(() => {
    if (selectedUserFilter !== 'all') return 0;
    if (!query.trim()) return menuItems.length;
    if (parsedQuery.fieldFilter || parsedQuery.userFilter || parsedQuery.surveyIdFilter) return 0;
    return menuItems.filter(item => {
      const searchableText = [item.title, item.desc, ...item.keywords].join(' ').toLowerCase();
      return parsedQuery.freeTokens.every(token => searchableText.includes(token));
    }).length;
  }, [menuItems, query, parsedQuery, selectedUserFilter]);

  const sectionMatchesCount = useMemo(() => {
    if (selectedUserFilter !== 'all') return 0;
    if (!query.trim()) return sectionItems.length;
    if (parsedQuery.fieldFilter || parsedQuery.userFilter || parsedQuery.surveyIdFilter) return 0;
    return sectionItems.filter(item => {
      const searchableText = [item.title, item.desc, ...item.keywords].join(' ').toLowerCase();
      return parsedQuery.freeTokens.every(token => searchableText.includes(token));
    }).length;
  }, [sectionItems, query, parsedQuery, selectedUserFilter]);

  // Selection execution handler
  const executeItemSelection = (item: SearchItem) => {
    if (item.type === 'view') {
      onSelectView(item.key);
    } else if (item.type === 'section') {
      onSelectScreen(item.number);
    } else if (item.type === 'action') {
      item.onExecute();
    } else if (item.type === 'activity') {
      // Select the target survey
      if (item.surveyId && onSelectSurvey) {
        onSelectSurvey(item.surveyId);
      }
      // If a section is inferred, navigate to that section in form-screen
      if (item.sectionNumber) {
        onSelectScreen(item.sectionNumber);
      } else {
        onSelectView('form-screen');
      }
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
      scrollSelectedIntoView((selectedIndex + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      scrollSelectedIntoView((selectedIndex - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredItems[selectedIndex];
      if (selected) {
        executeItemSelection(selected);
      }
    }
  };

  const scrollSelectedIntoView = (index: number) => {
    if (listContainerRef.current) {
      const buttons = listContainerRef.current.querySelectorAll('div[data-search-item="true"], button[data-search-item="true"]');
      const target = buttons[index] as HTMLElement;
      if (target) {
        target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  };

  const appendSearchTerm = (term: string) => {
    setQuery(prev => {
      const clean = prev.trim();
      return clean ? `${clean} ${term}` : term;
    });
    setActiveCategory('activities');
    setSelectedIndex(0);
    inputRef.current?.focus();
  };

  const setSearchTerm = (term: string) => {
    setQuery(term);
    setActiveCategory('activities');
    setSelectedIndex(0);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  const selectedItem = filteredItems[selectedIndex];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 pt-2 sm:pt-[6vh] animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[88vh] transition-colors"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Top Input Bar with Enhanced Touch-Friendly Padding & Larger Typography on Mobile */}
        <div className={`flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all ${
          isMobileViewport
            ? 'px-4 py-3.5 min-h-[60px]'
            : 'px-3 py-3 sm:px-4 sm:py-3.5 min-h-[50px]'
        }`}>
          <Search className={`shrink-0 transition-all ${
            isMobileViewport
              ? 'size-6 text-indigo-600 dark:text-indigo-400'
              : 'size-4 sm:size-5 text-indigo-600 dark:text-indigo-400'
          }`} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={isMobileViewport ? "Cari aktivitas, field, user, survei..." : "Cari aktivitas, field, user, survey ID..."}
            className={`flex-1 bg-transparent border-none outline-hidden font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 min-w-0 transition-all ${
              isMobileViewport
                ? 'text-lg sm:text-base py-2 px-1 placeholder:text-base leading-relaxed'
                : 'text-base sm:text-sm py-1 leading-normal'
            }`}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              className={`rounded-xl transition-all cursor-pointer shrink-0 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 active:scale-95 ${
                isMobileViewport
                  ? 'size-10 min-w-[40px] min-h-[40px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                  : 'p-1 sm:p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Bersihkan kata kunci"
              aria-label="Bersihkan kata kunci"
            >
              <X className={isMobileViewport ? "size-5" : "size-4"} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400 font-mono font-semibold shrink-0">
            ESC
          </kbd>
          {/* Mobile Direct Close Button with generous touch target */}
          <button
            type="button"
            onClick={onClose}
            className="sm:hidden size-10 min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0 active:scale-95 cursor-pointer"
            title="Tutup pencarian"
            aria-label="Tutup pencarian"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-slate-50/90 dark:bg-slate-950/70 border-b border-slate-200/80 dark:border-slate-800/80 overflow-x-auto scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => { setActiveCategory('all'); setSelectedIndex(0); }}
            className={`px-2.5 py-1.5 sm:px-3 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 text-xs ${
              activeCategory === 'all'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Semua</span>
            <span className="text-[10px] tabular-nums px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {activityMatchesCount + viewMatchesCount + sectionMatchesCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveCategory('activities'); setSelectedIndex(0); }}
            className={`px-2.5 py-1.5 sm:px-3 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 text-xs ${
              activeCategory === 'activities'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            <History className="size-3.5" />
            <span>Aktivitas</span>
            <span className="hidden sm:inline">& Riwayat Edit</span>
            <span className={`text-[10px] tabular-nums px-1.5 py-0.2 rounded-full ${
              activeCategory === 'activities'
                ? 'bg-white/20 text-white'
                : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
            }`}>
              {activityMatchesCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveCategory('views'); setSelectedIndex(0); }}
            className={`px-2.5 py-1.5 sm:px-3 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 text-xs ${
              activeCategory === 'views'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Compass className="size-3.5" />
            <span>Menu</span>
            <span className="hidden sm:inline">& Modul</span>
            <span className="text-[10px] tabular-nums px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {viewMatchesCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveCategory('sections'); setSelectedIndex(0); }}
            className={`px-2.5 py-1.5 sm:px-3 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 text-xs ${
              activeCategory === 'sections'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="size-3.5" />
            <span>16 Seksi</span>
            <span className="hidden sm:inline">Kuesioner</span>
            <span className="text-[10px] tabular-nums px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {sectionMatchesCount}
            </span>
          </button>
        </div>

        {/* Surveyor / Admin Filter & Facets Control Bar */}
        <div className="px-3 py-2 sm:px-4 bg-slate-100/80 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-2 transition-colors">
          {/* Row 1: Dedicated Surveyor/Admin Dropdown & Chronological Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            {/* Surveyor / Admin Dropdown Selector */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 shrink-0">
                <Users className="size-3.5 text-blue-500" />
                <span className="hidden xs:inline">Filter Pengguna:</span>
              </div>
              <div className="relative flex-1 max-w-full sm:max-w-xs">
                <select
                  value={selectedUserFilter}
                  onChange={e => {
                    setSelectedUserFilter(e.target.value);
                    setSelectedIndex(0);
                  }}
                  className={`w-full rounded-lg pl-3 pr-8 bg-white dark:bg-slate-900 border transition-all cursor-pointer font-medium appearance-none shadow-2xs ${
                    isMobileViewport
                      ? 'text-sm py-2.5 min-h-[44px]'
                      : 'text-xs py-1.5 min-h-[34px]'
                  } ${
                    selectedUserFilter !== 'all'
                      ? 'border-blue-500 dark:border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300'
                  }`}
                  aria-label="Filter berdasarkan surveyor atau admin"
                >
                  <option value="all">Semua Pengguna (Admin & Surveyor)</option>
                  <optgroup label="── Filter Berdasarkan Peran ──">
                    <option value="role:admin">Semua Admin ({distinctFacets.adminCount} aktivitas)</option>
                    <option value="role:surveyor">Semua Surveyor ({distinctFacets.surveyorCount} aktivitas)</option>
                    <option value="role:verifikator">Semua Verifikator ({distinctFacets.verifikatorCount} aktivitas)</option>
                  </optgroup>
                  {distinctFacets.admins.length > 0 && (
                    <optgroup label="── Admin Master ──">
                      {distinctFacets.admins.map(u => (
                        <option key={`opt-admin-${u.id}`} value={u.id}>
                          {u.name} (Admin • {u.count} aktivitas)
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {distinctFacets.surveyors.length > 0 && (
                    <optgroup label="── Surveyor Lapangan ──">
                      {distinctFacets.surveyors.map(u => (
                        <option key={`opt-surveyor-${u.id}`} value={u.id}>
                          {u.name} (Surveyor • {u.count} aktivitas)
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {distinctFacets.verifikators.length > 0 && (
                    <optgroup label="── Verifikator Ilmiah ──">
                      {distinctFacets.verifikators.map(u => (
                        <option key={`opt-verifikator-${u.id}`} value={u.id}>
                          {u.name} (Verifikator • {u.count} aktivitas)
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
                  <ChevronDown className="size-4" />
                </div>
              </div>

              {selectedUserFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUserFilter('all');
                    setSelectedIndex(0);
                  }}
                  className={`rounded-lg font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer shrink-0 inline-flex items-center justify-center gap-1 active:scale-95 ${
                    isMobileViewport
                      ? 'px-3 py-2 text-xs min-h-[44px]'
                      : 'px-2 py-1 text-[10px]'
                  }`}
                  title="Hapus filter pengguna"
                >
                  <X className="size-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Chronological Sort Toggle */}
            <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSortOrder(prev => (prev === 'newest' ? 'oldest' : 'newest'));
                  setSelectedIndex(0);
                }}
                className={`rounded-lg font-semibold transition-colors cursor-pointer border flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 ${
                  isMobileViewport
                    ? 'px-3.5 py-2.5 text-xs min-h-[44px] w-full sm:w-auto'
                    : 'px-2.5 py-1.5 text-xs'
                } ${
                  sortOrder === 'newest'
                    ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/60'
                    : 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80 hover:bg-amber-50 dark:hover:bg-amber-950/60'
                }`}
                title={`Urutan kronologis hasil riwayat: ${sortOrder === 'newest' ? 'Terbaru di atas (default)' : 'Terlama di atas'}`}
              >
                <Clock className="size-3.5 text-indigo-500 dark:text-indigo-400" />
                <span>{sortOrder === 'newest' ? 'Urutan: Terbaru' : 'Urutan: Terlama'}</span>
              </button>
            </div>
          </div>

          {/* Row 2: User Quick Filter Chips (Surveyor & Admin chips) & Other Facets */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] pt-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Filter className="size-2.5" />
              <span>Chip:</span>
            </span>

            {/* Chip Semua */}
            <button
              type="button"
              onClick={() => {
                setSelectedUserFilter('all');
                setSelectedIndex(0);
              }}
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors cursor-pointer border shrink-0 ${
                selectedUserFilter === 'all'
                  ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-800 dark:border-slate-100 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              Semua User
            </button>

            {/* Chip Admin */}
            <button
              type="button"
              onClick={() => {
                setSelectedUserFilter(selectedUserFilter === 'role:admin' ? 'all' : 'role:admin');
                setSelectedIndex(0);
              }}
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors cursor-pointer border shrink-0 flex items-center gap-1 ${
                selectedUserFilter === 'role:admin'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50'
              }`}
            >
              <ShieldCheck className="size-2.5" />
              <span>Admin ({distinctFacets.adminCount})</span>
            </button>

            {/* Chip Surveyor */}
            <button
              type="button"
              onClick={() => {
                setSelectedUserFilter(selectedUserFilter === 'role:surveyor' ? 'all' : 'role:surveyor');
                setSelectedIndex(0);
              }}
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors cursor-pointer border shrink-0 flex items-center gap-1 ${
                selectedUserFilter === 'role:surveyor'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-50'
              }`}
            >
              <User className="size-2.5" />
              <span>Surveyor ({distinctFacets.surveyorCount})</span>
            </button>

            <span className="text-slate-300 dark:text-slate-700 shrink-0">|</span>

            {/* Individual Surveyor / Admin Chips */}
            {distinctFacets.users.map(u => {
              const firstName = u.name.split(' ')[0] || u.name;
              const isSelected = selectedUserFilter === u.id;
              return (
                <button
                  key={`chip-user-${u.id}`}
                  type="button"
                  onClick={() => {
                    setSelectedUserFilter(isSelected ? 'all' : u.id);
                    setSelectedIndex(0);
                  }}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors cursor-pointer border shrink-0 flex items-center gap-1 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                  title={`Batasi hasil hanya untuk ${u.name} (${u.role})`}
                >
                  <span className={`size-1.5 rounded-full ${
                    u.role === 'admin' ? 'bg-indigo-500' : u.role === 'verifikator' ? 'bg-emerald-500' : 'bg-blue-500'
                  }`} />
                  <span>{firstName}</span>
                  <span className="text-[9px] tabular-nums opacity-75">({u.count})</span>
                </button>
              );
            })}

            <span className="text-slate-300 dark:text-slate-700 shrink-0">|</span>

            {/* Field Facet Chips */}
            {distinctFacets.fields.slice(0, 4).map(f => (
              <button
                key={`facet-field-${f}`}
                type="button"
                onClick={() => setSearchTerm(`field:${f}`)}
                className={`px-2 py-0.5 rounded-md font-mono text-[10px] transition-colors cursor-pointer border shrink-0 ${
                  parsedQuery.fieldFilter === f.toLowerCase()
                    ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                    : 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/80 hover:bg-purple-50'
                }`}
                title={`Saring log modifikasi untuk field "${f}"`}
              >
                field:{f}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        <div 
          ref={listContainerRef}
          className="flex-1 overflow-y-auto p-2 sm:p-2.5 divide-y divide-slate-100 dark:divide-slate-800/60"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-2">
              <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="size-5" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Tidak ditemukan hasil untuk "{query}"
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto text-pretty">
                Gunakan format filter riset: <code className="text-indigo-600 dark:text-indigo-400 font-mono">field:swadesh</code> untuk kolom, <code className="text-blue-600 dark:text-blue-400 font-mono">user:budi</code> untuk pengguna, atau <code className="text-emerald-600 dark:text-emerald-400 font-mono">id:karangwangi</code> untuk survey ID.
              </p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              
              if (item.type === 'activity') {
                const badgeConfig = getActivityBadgeConfig(item.actionType);
                const ActionIcon = badgeConfig.icon;

                return (
                  <div
                    key={`activity-${item.id}-${idx}`}
                    data-search-item="true"
                    className={`rounded-xl transition-all my-1.5 border ${
                      isSelected 
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 shadow-xs' 
                        : 'border-slate-200/60 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="p-3 space-y-2.5">
                      {/* Line 1: Action Badge, Field Name, Survey ID, and Timestamp */}
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                          {/* Action Label */}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeConfig.badgeClass}`}>
                            <ActionIcon className="size-3" />
                            <span>{item.title}</span>
                          </span>

                          {/* Field Name Tag (Clickable to Filter by Field) */}
                          {item.fieldName && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSearchTerm(`field:${item.fieldName}`);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 hover:bg-purple-200 dark:hover:bg-purple-900 transition-colors cursor-pointer"
                              title={`Klik untuk memfilter semua riwayat field "${item.fieldName}"`}
                            >
                              <Code className="size-2.5" />
                              <span>field:{item.fieldName}</span>
                            </button>
                          )}

                          {/* Survey ID Tag (Clickable to Filter by Survey ID) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSearchTerm(`id:${item.surveyId}`);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                            title={`Klik untuk memfilter semua perubahan untuk survei ID "${item.surveyId}"`}
                          >
                            <Hash className="size-2.5" />
                            <span>{item.surveyId}</span>
                          </button>

                          {/* Target Section (if inferred) */}
                          {item.sectionNumber && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              <FileText className="size-2.5" />
                              <span>Seksi #{item.sectionNumber}</span>
                            </span>
                          )}

                          {/* Diff summary delta */}
                          {item.log.diffSummary?.completionDelta && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                              <TrendingUp className="size-2.5" />
                              <span>+{item.log.diffSummary.completionDelta}%</span>
                            </span>
                          )}

                          {item.log.diffSummary?.itemsChanged && (
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 tabular-nums">
                              • {item.log.diffSummary.itemsChanged} butir
                            </span>
                          )}
                        </div>

                        {/* Relative Timestamp with Full Timestamp Tooltip & Chronological Indicator */}
                        <div 
                          className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 shrink-0 tabular-nums bg-slate-100/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/80"
                          title={`Waktu modifikasi tercatat: ${new Date(item.log.timestamp).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' })}`}
                        >
                          <Clock className="size-3 text-indigo-500 dark:text-indigo-400" />
                          <span>{formatRelativeTime(item.log.timestamp)}</span>
                          {idx === 0 && sortOrder === 'newest' && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1 py-0.1 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                              Terbaru
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Line 2: Survey Title, Village, and User/Surveyor Metadata */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <MapPin className="size-3.5 text-indigo-500 shrink-0" />
                          <span className="font-bold text-slate-900 dark:text-white truncate">
                            {item.log.surveyTitle}
                          </span>
                          {item.log.languageName && (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate hidden xs:inline">
                              ({item.log.languageName})
                            </span>
                          )}
                        </div>

                        {/* User badge with ID (Clickable to Filter by User) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUserFilter(item.userId);
                            setSelectedIndex(0);
                          }}
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] border transition-colors cursor-pointer shrink-0 self-start sm:self-auto ${
                            selectedUserFilter === item.userId
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                              : 'bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-700'
                          }`}
                          title={`Klik untuk menyaring riwayat edit oleh ${item.userName} (${item.userId})`}
                        >
                          <User className="size-3 text-blue-500" />
                          <span className="font-semibold">{item.userName}</span>
                          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                            [{item.userId.replace('user_', '')}]
                          </span>
                          <span className={`px-1 py-0.1 rounded text-[9px] font-bold uppercase ${
                            item.userRole === 'admin'
                              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300'
                              : item.userRole === 'verifikator'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
                          }`}>
                            {item.userRole}
                          </span>
                        </button>
                      </div>

                      {/* Line 3: Detailed Change Text Snippet */}
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed text-pretty bg-slate-50/90 dark:bg-slate-950/70 p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800/80">
                        {item.details}
                      </p>

                      {/* Line 3.5: Dedicated Before & After Values Comparison Block */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 rounded-xl bg-slate-100/70 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800">
                        {/* BEFORE VALUE (Nilai Sebelum) */}
                        <div className="flex flex-col gap-1.5 p-2 rounded-lg bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/40 text-xs">
                          <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-rose-700 dark:text-rose-400">
                            <span className="flex items-center gap-1.5">
                              <span className="size-2 rounded-full bg-rose-500 ring-2 ring-rose-200 dark:ring-rose-900" />
                              <span>SEBELUM (BEFORE)</span>
                            </span>
                            <span className="text-[9px] uppercase tracking-wider text-rose-500/80 font-mono font-medium">Nilai Awal</span>
                          </div>
                          <div 
                            className="font-mono text-[11px] text-rose-950 dark:text-rose-200 leading-relaxed break-words line-clamp-3 select-text bg-white/80 dark:bg-slate-900/60 p-2 rounded border border-rose-100 dark:border-rose-950/80 shadow-2xs"
                            title={`Nilai Sebelum: ${item.beforeValue}`}
                          >
                            {item.beforeValue}
                          </div>
                        </div>

                        {/* AFTER VALUE (Nilai Sesudah) */}
                        <div className="flex flex-col gap-1.5 p-2 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/40 text-xs">
                          <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                            <span className="flex items-center gap-1.5">
                              <span className="size-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900" />
                              <span>SESUDAH (AFTER)</span>
                            </span>
                            <span className="text-[9px] uppercase tracking-wider text-emerald-600/80 font-mono font-medium">Nilai Baru</span>
                          </div>
                          <div 
                            className="font-mono text-[11px] text-emerald-950 dark:text-emerald-200 leading-relaxed break-words line-clamp-3 select-text bg-white/80 dark:bg-slate-900/60 p-2 rounded border border-emerald-100 dark:border-emerald-950/80 shadow-2xs"
                            title={`Nilai Sesudah: ${item.afterValue}`}
                          >
                            {item.afterValue}
                          </div>
                        </div>
                      </div>

                      {/* Line 4: Diff Notes, Source, and Direct Action Buttons */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 flex-wrap">
                          {item.log.diffSummary?.notes && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                              <span>Catatan:</span>
                              <span className="font-medium">{item.log.diffSummary.notes}</span>
                            </span>
                          )}

                          {item.log.source && (
                            <span className="text-slate-400">
                              via {item.log.source === 'pwa_offline' ? 'PWA Offline' : item.log.source}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 w-full sm:w-auto">
                          {onOpenChangeHistory && item.surveyId && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenChangeHistory(item.surveyId);
                                onClose();
                              }}
                              className="flex-1 sm:flex-none justify-center px-2.5 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                              title="Buka riwayat audit lengkap untuk titik survei ini"
                            >
                              <History className="size-3 text-indigo-500" />
                              <span>Audit Trail</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => executeItemSelection(item)}
                            className="flex-1 sm:flex-none justify-center px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <span>Buka di Editor</span>
                            <ArrowRight className="size-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // Views and Sections render
              const Icon = item.icon;
              return (
                <button
                  key={`${item.type}-${item.title}-${idx}`}
                  type="button"
                  data-search-item="true"
                  onClick={() => executeItemSelection(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all my-0.5 cursor-pointer border ${
                    isSelected 
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 shadow-2xs text-indigo-950 dark:text-indigo-100' 
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className={`p-2 rounded-xl shrink-0 transition-transform ${
                      isSelected 
                        ? 'bg-indigo-600 text-white scale-105 shadow-2xs' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold truncate leading-tight">
                          {item.title}
                        </p>
                        {item.type === 'section' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                            {(item as SectionSearchItem).category}
                          </span>
                        )}
                        {item.type === 'view' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 shrink-0">
                            Modul
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className={`size-3.5 shrink-0 transition-opacity ${
                    isSelected ? 'opacity-100 text-indigo-600 dark:text-indigo-400' : 'opacity-0'
                  }`} />
                </button>
              );
            })
          )}
        </div>

        {/* Selected item preview footer bar */}
        {selectedItem && selectedItem.type === 'activity' && (
          <div className="px-4 py-2 bg-indigo-50/70 dark:bg-slate-950 border-t border-indigo-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 gap-1.5">
            <div className="flex items-center gap-2 truncate min-w-0">
              <span className="font-bold text-indigo-700 dark:text-indigo-300 shrink-0">
                ↵ Tekan Enter:
              </span>
              <span className="truncate">
                Buka {selectedItem.log.surveyTitle}
                {selectedItem.sectionNumber ? ` pada Seksi #${selectedItem.sectionNumber}` : ''}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 font-mono text-[10px] overflow-hidden">
              {selectedItem.fieldName && (
                <span className="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800/50">
                  {selectedItem.fieldName}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-rose-600 dark:text-rose-400 max-w-[130px] truncate" title={`Sebelum: ${selectedItem.beforeValue}`}>
                  {selectedItem.beforeValue}
                </span>
                <span className="text-slate-400">➔</span>
                <span className="text-emerald-600 dark:text-emerald-400 max-w-[130px] truncate" title={`Sesudah: ${selectedItem.afterValue}`}>
                  {selectedItem.afterValue}
                </span>
              </span>
            </div>
          </div>
        )}

        {/* Footer shortcuts & Syntax Legend */}
        <div className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2 transition-colors">
          <div className="hidden sm:flex items-center gap-3">
            <span><kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-[10px] text-slate-700 dark:text-slate-300 font-semibold">↑↓</kbd> Navigasi</span>
            <span><kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-[10px] text-slate-700 dark:text-slate-300 font-semibold">↵</kbd> Buka Target</span>
            <span><kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-[10px] text-slate-700 dark:text-slate-300 font-semibold">ESC</kbd> Tutup</span>
          </div>
          <div className="sm:hidden text-[10px] text-slate-400 font-medium">
            <span>Ketuk riwayat atau tombol untuk membuka editor langsung</span>
          </div>

          <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-slate-400 flex-wrap">
            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400">field:&lt;kolom&gt;</span>
            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400">user:&lt;nama/id&gt;</span>
            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-emerald-600 dark:text-emerald-400">id:&lt;surveyId&gt;</span>
            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-rose-600 dark:text-rose-400">sebelum:&lt;nilai&gt;</span>
            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-emerald-600 dark:text-emerald-400">sesudah:&lt;nilai&gt;</span>
          </div>
        </div>
      </div>
    </div>
  );
};
