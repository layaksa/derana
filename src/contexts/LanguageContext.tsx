import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

export type Language = 'id' | 'en';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
  isIndonesian: boolean;
  isEnglish: boolean;
}

const LANGUAGE_STORAGE_KEY = 'derana_app_language';

// Comprehensive translation dictionary for Derana Language Mapping & Dialectometry App
export const translations: Record<Language, Record<string, string>> = {
  id: {
    // App & Branding
    'app.title': 'Sistem Pemetaan Bahasa & Dialektometri',
    'app.subtitle': 'Laboratorium Dialektologi & Kebahasaan Nusantara',
    
    // Profile Modal
    'profile.title': 'Menu Profil Peneliti',
    'profile.subtitle': 'Informasi akun, aktivitas riset, dan pengaturan antarmuka',
    'profile.tab.overview': 'Aktivitas & Kuesioner',
    'profile.tab.edit': 'Ubah Profil',
    'profile.tab.language': 'Pilihan Bahasa',
    'profile.tab.security': 'Keamanan & Sandi',
    'profile.language.title': 'Pilihan Bahasa Antarmuka',
    'profile.language.desc': 'Pilih bahasa tampilan untuk aplikasi. Perubahan diterapkan secara instan ke seluruh antarmuka tanpa perlu memuat ulang.',
    'profile.language.activeBadge': 'Bahasa Aktif Saat Ini',
    'profile.language.id.title': 'Bahasa Indonesia',
    'profile.language.id.subtitle': 'Bahasa resmi Republik Indonesia',
    'profile.language.id.desc': 'Terminologi linguistik baku, dialektometri Guiter, kosakata Swadesh, dan klasifikasi standar Badan Bahasa / BRIN.',
    'profile.language.en.title': 'English (Inggris)',
    'profile.language.en.subtitle': 'International Standard English',
    'profile.language.en.desc': 'Standard dialectological terms, Guiter dialectometry metrics, Swadesh 200-word list, and international phonetic notation.',
    'profile.language.instantNotice': 'Perubahan bahasa disimpan otomatis di profil lokal Anda.',
    'profile.language.selected': 'Bahasa terpilih:',
    'profile.language.switchConfirm': 'Bahasa antarmuka berhasil diubah ke',
    
    // Profile Identity & Fields
    'profile.role.admin': 'Superuser / Admin',
    'profile.role.surveyor': 'Surveyor Lapangan',
    'profile.manageUsers': 'Manajemen Pengguna',
    'profile.field.name': 'Nama Lengkap',
    'profile.field.email': 'Alamat Email',
    'profile.field.institution': 'Instansi / Lembaga Riset',
    'profile.field.region': 'Wilayah Penugasan',
    'profile.field.username': 'Nama Pengguna',
    'profile.field.registered': 'Terdaftar sejak',
    'profile.saveChanges': 'Simpan Perubahan',
    'profile.saving': 'Menyimpan...',
    'profile.close': 'Tutup',
    'profile.logout': 'Keluar dari Akun',
    'profile.overview.totalSurveys': 'Total Survei Saya',
    'profile.overview.verified': 'Survei Terverifikasi',
    'profile.overview.avgProgress': 'Rata-Rata Progres',
    'profile.overview.interfaceLanguage': 'Bahasa Antarmuka',
    'profile.overview.changeLanguage': 'Ubah Bahasa',
    'profile.overview.themeTitle': 'Mode Tampilan Sistem',
    'profile.overview.themeDesc': 'Pilih antara mode terang (Light Mode) atau mode gelap (Dark Mode).',
    'profile.overview.surveysEntered': 'Survei Diinput',
    'profile.overview.surveysEnteredDesc': 'Kuesioner atas nama Anda',
    'profile.overview.verifiedDesc': 'Telah diverifikasi Admin',
    'profile.overview.progressDesc': 'Tingkat kelengkapan isian',
    'profile.overview.permissions': 'Wewenang & Hak Akses Akun',
    'profile.overview.open': 'Buka',
    
    // Security tab
    'profile.security.title': 'Perbarui Kata Sandi Akun',
    'profile.security.currentPass': 'Kata Sandi Saat Ini',
    'profile.security.newPass': 'Kata Sandi Baru',
    'profile.security.confirmPass': 'Konfirmasi Kata Sandi Baru',
    'profile.security.updateBtn': 'Perbarui Kata Sandi',
    
    // User Dropdown in Navbars
    'navbar.account': 'Akun Pengguna',
    'navbar.theme': 'Tema Tampilan',
    'navbar.language': 'Pilihan Bahasa',
    'navbar.pwa': 'Akses Offline (PWA)',
    'navbar.profile': 'Profil Peneliti',
    'navbar.userManagement': 'Manajemen Pengguna',
    'navbar.logout': 'Keluar dari Akun',
    'navbar.sync': 'Status Sinkronisasi',
    'navbar.online': 'Terhubung (Online)',
    'navbar.offline': 'Moda Luring (Offline)',

    // Sidebar & Navigation
    'nav.dashboard': 'Dashboard Utama',
    'nav.form': 'Formulir Survei (16 Seksi)',
    'nav.vocabulary': 'Daftar Kosakata Swadesh',
    'nav.dialectometry': 'Dialektometri & Peta Guiter',
    'nav.oralLiterature': 'Sastra Lisan & Tradisi',
    'nav.revitalization': 'Revitalisasi Bahasa Daerah',
    'nav.questionnaire': 'Pusat Kuesioner',
    'nav.verification': 'Verifikasi & Validasi Data',
    'nav.configuration': 'Konfigurasi',
    'nav.settings': 'Pengaturan',
    'nav.themeMode': 'Mode Tema',
    'nav.quickSwitch': 'Ganti Bahasa Cepat',
    
    // Common Actions
    'action.save': 'Simpan',
    'action.cancel': 'Batal',
    'action.delete': 'Hapus',
    'action.edit': 'Ubah',
    'action.search': 'Cari data...',
    'action.filter': 'Filter',
    'action.export': 'Ekspor Data',
    'action.import': 'Impor Data',
    'action.back': 'Kembali',
    'action.next': 'Lanjut',
    'action.view': 'Lihat',
    'action.compare': 'Bandingkan',
    'action.apply': 'Terapkan',
    
    // Section 1: Titik Pengamatan & Geolocation
    'section1.title': 'Gambaran Titik Pengamatan',
    'section1.desc': 'Identitas administratif desa, bahasa utama yang digunakan, serta nama lain bahasa setempat.',
    'section1.useCurrentLocation': 'Gunakan Lokasi Saat Ini',
    'section1.detectingLocation': 'Mendeteksi Posisi GPS...',
    'section1.locationSuccess': 'Koordinat GPS berhasil diperoleh',
    'section1.openMaps': 'Buka di Peta',
    'section1.accuracy': 'Akurasi',
    'section1.coordsTitle': 'Koordinat Geografis (GPS)',
    'section1.coordsDesc': 'Koordinat titik pengamatan untuk pemetaan kartografi dan analisis spasial isoglos.',
    'section1.latLabel': 'Koordinat Lintang (Latitude)',
    'section1.lngLabel': 'Koordinat Bujur (Longitude)',
    'section1.suggestedArea': 'Wilayah Terdeteksi dari GPS',
    'section1.applySuggested': 'Terapkan Wilayah Administratif',
    
    // Section 3: Situasi Geografis & Peta Satelit / Topografi
    'section3.title': 'Situasi Geografis & Morfologi',
    'section3.desc': 'Karakteristik bentang alam desa, jarak pantai, topografi, dan koordinat lintang serta bujur.',
    'section3.mapTitle': 'Verifikasi Lokasi & Peta Dasar Geografis',
    'section3.mapDesc': 'Verifikasi posisi titik pengamatan secara presisi menggunakan citra satelit atau kontur topografi untuk memastikan kesesuaian bentang alam dan morfologi.',
    'section3.layerSatellite': 'Satelit Beresolusi Tinggi',
    'section3.layerTopo': 'Topografi & Kontur Relief',
    'section3.layerTerrain': 'Topografi Medan (Terrain)',
    'section3.layerOsm': 'Peta Standar (Jalan & Batas)',
    'section3.centerPoint': 'Pusatkan ke Titik Pengamatan',
    'section3.pickLocation': 'Klik Peta untuk Menyesuaikan Koordinat',
    'section3.fullscreen': 'Layar Penuh',
    'section3.exitFullscreen': 'Tutup Layar Penuh',
    'section3.coordsCopied': 'Koordinat berhasil disalin!',
    'section3.coordsUpdated': 'Koordinat berhasil diperbarui dari pin peta',
    'section3.noCoords': 'Koordinat belum terisi. Klik di peta untuk menentukan posisi titik pengamatan.',

    // Dashboard: Statistik Narasumber
    'dashboard.informant.tab': 'Statistik Narasumber & Demografi',
    'dashboard.informant.title': 'Ringkasan Statistik Demografi Narasumber',
    'dashboard.informant.subtitle': 'Analisis sebaran usia, latar belakang pendidikan, dan profil penutur jati dari seluruh kuesioner survei.',
    'dashboard.informant.total': 'Total Narasumber Terdata',
    'dashboard.informant.meanAge': 'Rata-rata Usia',
    'dashboard.informant.dominantEdu': 'Pendidikan Dominan',
    'dashboard.informant.genderRatio': 'Rasio Gender',
    'dashboard.informant.avgResidency': 'Rerata Masa Domisili',
    'dashboard.informant.ageChartTitle': 'Grafik Distribusi Kelompok Usia Narasumber',
    'dashboard.informant.ageChartDesc': 'Pengelompokan usia penutur jati berdasarkan standar usia dialektologi Badan Bahasa & Guiter.',
    'dashboard.informant.eduChartTitle': 'Grafik Distribusi Latar Belakang Pendidikan',
    'dashboard.informant.eduChartDesc': 'Proporsi jenjang pendidikan formal narasumber yang diwawancarai.',
    'dashboard.informant.tableTitle': 'Daftar Rinci Narasumber Antar-Kuesioner',
    'dashboard.informant.allSurveys': 'Seluruh Kuesioner',
    'dashboard.informant.filterSurvey': 'Pilih Kuesioner Titik Pengamatan',
    'dashboard.informant.filterGender': 'Jenis Kelamin',
    'dashboard.informant.allGenders': 'Semua Gender',
    'dashboard.informant.male': 'Pria / Laki-laki',
    'dashboard.informant.female': 'Wanita / Perempuan',
    'dashboard.informant.searchPlaceholder': 'Cari narasumber, desa, pekerjaan, atau pendidikan...',
    'dashboard.informant.exportCsv': 'Ekspor Data Narasumber (CSV)',
  },
  en: {
    // App & Branding
    'app.title': 'Language Mapping & Dialectometry System',
    'app.subtitle': 'Nusantara Dialectology & Linguistics Laboratory',
    
    // Profile Modal
    'profile.title': 'Researcher Profile Menu',
    'profile.subtitle': 'Account information, research activity, and interface preferences',
    'profile.tab.overview': 'Activity & Surveys',
    'profile.tab.edit': 'Edit Profile',
    'profile.tab.language': 'Language Selection',
    'profile.tab.security': 'Security & Password',
    'profile.language.title': 'Interface Language Selection',
    'profile.language.desc': 'Choose the display language for the application. Changes take effect instantly across the interface without reloading.',
    'profile.language.activeBadge': 'Currently Active Language',
    'profile.language.id.title': 'Bahasa Indonesia',
    'profile.language.id.subtitle': 'Official Language of Indonesia',
    'profile.language.id.desc': 'Standard Indonesian linguistic terminology, Guiter dialectometry, Swadesh vocabulary, and Agency for Language Development / BRIN standards.',
    'profile.language.en.title': 'English',
    'profile.language.en.subtitle': 'International Standard English',
    'profile.language.en.desc': 'Standard dialectological terms, Guiter dialectometry metrics, Swadesh 200-word list, and international phonetic notation.',
    'profile.language.instantNotice': 'Language preference is automatically saved to your local profile.',
    'profile.language.selected': 'Selected language:',
    'profile.language.switchConfirm': 'Interface language successfully changed to',
    
    // Profile Identity & Fields
    'profile.role.admin': 'Superuser / Admin',
    'profile.role.surveyor': 'Field Surveyor',
    'profile.manageUsers': 'User Management',
    'profile.field.name': 'Full Name',
    'profile.field.email': 'Email Address',
    'profile.field.institution': 'Institution / Research Body',
    'profile.field.region': 'Assigned Region',
    'profile.field.username': 'Username',
    'profile.field.registered': 'Registered since',
    'profile.saveChanges': 'Save Changes',
    'profile.saving': 'Saving...',
    'profile.close': 'Close',
    'profile.logout': 'Sign Out',
    'profile.overview.totalSurveys': 'My Total Surveys',
    'profile.overview.verified': 'Verified Surveys',
    'profile.overview.avgProgress': 'Average Progress',
    'profile.overview.interfaceLanguage': 'Interface Language',
    'profile.overview.changeLanguage': 'Change Language',
    'profile.overview.themeTitle': 'System Display Mode',
    'profile.overview.themeDesc': 'Choose between light mode and dark mode.',
    'profile.overview.surveysEntered': 'Surveys Entered',
    'profile.overview.surveysEnteredDesc': 'Questionnaires under your account',
    'profile.overview.verifiedDesc': 'Verified by an administrator',
    'profile.overview.progressDesc': 'Form completion rate',
    'profile.overview.permissions': 'Account Permissions & Access',
    'profile.overview.open': 'Open',
    
    // Security tab
    'profile.security.title': 'Update Account Password',
    'profile.security.currentPass': 'Current Password',
    'profile.security.newPass': 'New Password',
    'profile.security.confirmPass': 'Confirm New Password',
    'profile.security.updateBtn': 'Update Password',
    
    // User Dropdown in Navbars
    'navbar.account': 'User Account',
    'navbar.theme': 'Display Theme',
    'navbar.language': 'Language Selection',
    'navbar.pwa': 'Offline Access (PWA)',
    'navbar.profile': 'Researcher Profile',
    'navbar.userManagement': 'User Management',
    'navbar.logout': 'Sign Out',
    'navbar.sync': 'Sync Status',
    'navbar.online': 'Connected (Online)',
    'navbar.offline': 'Offline Mode',

    // Sidebar & Navigation
    'nav.dashboard': 'Main Dashboard',
    'nav.form': 'Survey Questionnaire (16 Sections)',
    'nav.vocabulary': 'Swadesh Wordlist',
    'nav.dialectometry': 'Dialectometry & Guiter Map',
    'nav.oralLiterature': 'Oral Literature & Folklore',
    'nav.revitalization': 'Indigenous Language Revitalization',
    'nav.questionnaire': 'Questionnaire Hub',
    'nav.verification': 'Data Verification & Validation',
    'nav.configuration': 'Configuration',
    'nav.settings': 'Settings',
    'nav.themeMode': 'Theme Mode',
    'nav.quickSwitch': 'Quick Language Switch',
    
    // Common Actions
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.delete': 'Delete',
    'action.edit': 'Edit',
    'action.search': 'Search data...',
    'action.filter': 'Filter',
    'action.export': 'Export Data',
    'action.import': 'Import Data',
    'action.back': 'Back',
    'action.next': 'Next',
    'action.view': 'View',
    'action.compare': 'Compare',
    'action.apply': 'Apply',
    
    // Section 1: Titik Pengamatan & Geolocation
    'section1.title': 'Observation Point Overview',
    'section1.desc': 'Administrative identity of the village, primary language used, and local language variant name.',
    'section1.useCurrentLocation': 'Use Current Location',
    'section1.detectingLocation': 'Detecting GPS Position...',
    'section1.locationSuccess': 'GPS coordinates successfully acquired',
    'section1.openMaps': 'Open in Maps',
    'section1.accuracy': 'Accuracy',
    'section1.coordsTitle': 'Geographical Coordinates (GPS)',
    'section1.coordsDesc': 'Observation point coordinates for cartographic mapping and spatial isogloss analysis.',
    'section1.latLabel': 'Latitude (Lintang)',
    'section1.lngLabel': 'Longitude (Bujur)',
    'section1.suggestedArea': 'Detected Area from GPS',
    'section1.applySuggested': 'Apply Administrative Area',
    
    // Section 3: Geographic Situation & Satellite / Topo Map
    'section3.title': 'Geographic Situation & Morphology',
    'section3.desc': 'Village landscape characteristics, coastal distance, topography, and latitude/longitude coordinates.',
    'section3.mapTitle': 'Location Verification & Geographic Base Layers',
    'section3.mapDesc': 'Verify observation point position with high precision using satellite imagery or topographic contours to ensure landscape and morphological conformity.',
    'section3.layerSatellite': 'High-Resolution Satellite',
    'section3.layerTopo': 'Topography & Elevation Contours',
    'section3.layerTerrain': 'Terrain Relief Topo',
    'section3.layerOsm': 'Standard Map (Streets & Borders)',
    'section3.centerPoint': 'Center on Observation Point',
    'section3.pickLocation': 'Click Map to Adjust Coordinates',
    'section3.fullscreen': 'Full Screen',
    'section3.exitFullscreen': 'Exit Full Screen',
    'section3.coordsCopied': 'Coordinates copied!',
    'section3.coordsUpdated': 'Coordinates updated from map pin',
    'section3.noCoords': 'Coordinates not yet entered. Click on the map to set observation point.',

    // Dashboard: Informant Statistics
    'dashboard.informant.tab': 'Informant Stats & Demographics',
    'dashboard.informant.title': 'Informant Demographic Statistics Summary',
    'dashboard.informant.subtitle': 'Analysis of age distribution, educational background, and native speaker profiles across all surveys.',
    'dashboard.informant.total': 'Total Recorded Informants',
    'dashboard.informant.meanAge': 'Average Age',
    'dashboard.informant.dominantEdu': 'Dominant Education',
    'dashboard.informant.genderRatio': 'Gender Ratio',
    'dashboard.informant.avgResidency': 'Avg. Residency in Village',
    'dashboard.informant.ageChartTitle': 'Informant Age Group Distribution Chart',
    'dashboard.informant.ageChartDesc': 'Age categorization based on standard dialectological criteria.',
    'dashboard.informant.eduChartTitle': 'Educational Background Distribution Chart',
    'dashboard.informant.eduChartDesc': 'Proportion of formal education levels among interviewed informants.',
    'dashboard.informant.tableTitle': 'Detailed Informant Roster Across Surveys',
    'dashboard.informant.allSurveys': 'All Surveys',
    'dashboard.informant.filterSurvey': 'Select Survey Point',
    'dashboard.informant.filterGender': 'Gender',
    'dashboard.informant.allGenders': 'All Genders',
    'dashboard.informant.male': 'Male',
    'dashboard.informant.female': 'Female',
    'dashboard.informant.searchPlaceholder': 'Search informant, village, occupation, or education...',
    'dashboard.informant.exportCsv': 'Export Informants (CSV)',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored === 'id' || stored === 'en') {
        return stored;
      }
      // Check browser language preference if available
      const navLang = navigator.language.toLowerCase();
      if (navLang.startsWith('en')) {
        return 'en';
      }
    }
    return 'id'; // Default to Indonesian
  });

  // Sync with document element lang attribute and localStorage
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, [language]);

  // Listen to cross-tab storage changes
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === LANGUAGE_STORAGE_KEY && (e.newValue === 'id' || e.newValue === 'en')) {
        setLanguageState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState(prev => (prev === 'id' ? 'en' : 'id'));
  };

  const t = useMemo(() => {
    return (key: string, fallback?: string): string => {
      const dict = translations[language];
      if (dict && dict[key]) {
        return dict[key];
      }
      // Fallback to Indonesian translation if key exists in Indonesian
      if (language !== 'id' && translations.id[key]) {
        return translations.id[key];
      }
      return fallback !== undefined ? fallback : key;
    };
  }, [language]);

  const value = useMemo<LanguageContextType>(() => ({
    language,
    setLanguage,
    toggleLanguage,
    t,
    isIndonesian: language === 'id',
    isEnglish: language === 'en'
  }), [language, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
