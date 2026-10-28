import React, { useState, useEffect, useRef } from 'react';
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
  Scale
} from 'lucide-react';
import { SECTIONS_META } from '../NavigationStepper';
import { ViewKey } from './AppSidebar';

interface CommandSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (view: ViewKey) => void;
  onSelectScreen: (screenNumber: number) => void;
  onOpenRegionalReport?: () => void;
}

type SearchItem = 
  | { type: 'view'; key: ViewKey; title: string; desc: string; keywords: string[]; icon: React.ComponentType<{ className?: string }> }
  | { type: 'section'; number: number; title: string; desc: string; keywords: string[]; icon: React.ComponentType<{ className?: string }> }
  | { type: 'action'; id: string; title: string; desc: string; keywords: string[]; icon: React.ComponentType<{ className?: string }>; onExecute: () => void };

export const CommandSearchModal: React.FC<CommandSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectView,
  onSelectScreen,
  onOpenRegionalReport
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Build searchable items
  const menuItems: SearchItem[] = [
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
    { type: 'view', key: 'dashboard', title: 'Dashboard', desc: 'Ringkasan metrik, statistik, peta titik survei lapangan, dan lapisan pemetaan bahasa', keywords: ['beranda', 'ringkasan', 'statistik', 'overview', 'peta survei', 'pemetaan bahasa', 'desa', 'titik bahasa', 'longitude', 'latitude'], icon: LayoutDashboard },
    { type: 'view', key: 'dokumentasi', title: 'Dokumentasi & Tata Cara Penggunaan', desc: 'Panduan lengkap alur kerja, 16 seksi, dialektometri, GIS, dan PRD', keywords: ['panduan', 'bantuan', 'manual', 'cara pakai', 'petunjuk', 'dokumentasi', 'tutorial', 'alur kerja', 'gis', 'leaflet'], icon: HelpCircle },
    { type: 'view', key: 'peta-survei', title: 'Peta Titik Survei Lapangan (Leaflet)', desc: 'Visualisasi geospasial interaktif koordinat titik pengamatan, lapisan pemetaan bahasa, filter validasi, dan usia narasumber', keywords: ['peta', 'map', 'leaflet', 'geospasial', 'pemetaan bahasa', 'poligon', 'koordinat', 'longitude', 'latitude', 'lokasi', 'titik survei', 'titik pengamatan', 'basemap', 'carto'], icon: Compass },
    { type: 'view', key: 'responden', title: 'Data Responden', desc: 'Informan, usia, profil narasumber, dan demografi survei', keywords: ['informan', 'narasumber', 'responden', 'demografi', 'usia', 'penduduk'], icon: Users },
    { type: 'view', key: 'surveys', title: 'Hasil Survei', desc: 'Data masuk surveyor berdasarkan status validasi resmi validator', keywords: ['survei', 'survey', 'hasil', 'validasi', 'verifikasi', 'lapangan', 'tervalidasi', 'progress'], icon: BarChart3 },
    { type: 'view', key: 'datasets', title: 'Datasets Kebahasaan', desc: 'Kelola dataset titik pengamatan, impor, ekspor, dan data bahasa', keywords: ['dataset', 'data', 'titik pengamatan', 'korpus', 'impor', 'ekspor', 'json', 'csv'], icon: Database },
    { type: 'view', key: 'identitas', title: 'Identitas Desa', desc: 'Profil wilayah, desa, kecamatan, kabupaten, dan titik pengamatan', keywords: ['identitas', 'desa', 'wilayah', 'kecamatan', 'kabupaten', 'provinsi', 'geografi'], icon: FileText },
    { type: 'view', key: 'kondisi-bahasa', title: 'Kondisi Kebahasaan', desc: 'Informasi situasi, kedwibahasaan, dan kondisi bahasa di wilayah survei', keywords: ['kondisi bahasa', 'situasi kebahasaan', 'sosiolinguistik', 'bilingual', 'kedwibahasaan', 'bahasa'], icon: BookOpen },
    { type: 'view', key: 'kosakata', title: 'Daftar Kosakata', desc: 'Swadesh 200, kosakata budaya, audio, frasa, kalimat, dan Excel', keywords: ['kosakata', 'swadesh', 'leksikon', 'kata', 'excel', 'audio', 'frasa', 'kalimat', 'terjemahan'], icon: BookOpen },
    { type: 'view', key: 'sastra-lisan', title: 'Sastra Lisan', desc: 'Dokumentasi sastra lisan, cerita rakyat, tradisi tutur, dan rekaman', keywords: ['sastra', 'tradisi', 'cerita', 'tutur', 'folklor', 'folklore', 'rekaman'], icon: BookOpen },
    { type: 'view', key: 'revitalisasi', title: 'Revitalisasi Bahasa Daerah', desc: 'Instrumen Monev IKRBD dan Rencana Aksi Pengimbasan', keywords: ['revitalisasi', 'monev', 'ikrbd', 'rencana aksi', 'pelindungan', 'pengembangan'], icon: Sparkles },
    { type: 'view', key: 'dialektometri', title: 'Dialektometri & Peta', desc: 'Hitung indeks Guiter, garis isoglos, heatmap, dan visualisasi poligon dialek', keywords: ['dialektometri', 'dialek', 'isoglos', 'guiter', 'poligon', 'heatmap', 'garis', 'varian leksikal', 'zona gradasi'], icon: Compass },
    { type: 'view', key: 'comparison', title: 'Perbandingan Dua Titik', desc: 'Komparasi berdampingan 2 survei, Peta Survei titik, Peta CARTO Tri-Instrumen, dan Laporan Wilayah PDF', keywords: ['perbandingan dua titik', 'komparasi', 'side by side', 'peta survei', 'peta carto', 'laporan wilayah', 'bahasa', 'leksikal', 'swadesh'], icon: Scale },
    { type: 'view', key: 'kuesioner', title: 'Pusat Kuesioner', desc: 'Akses seluruh instrumen pengumpulan data penelitian', keywords: ['kuesioner', 'instrumen', 'formulir', 'questionnaire', 'pemetaan', 'pengumpulan data'], icon: Layers },
    { type: 'view', key: 'kuesioner-pemetaan', title: 'Pemetaan Bahasa (16 Seksi)', desc: 'Penginputan formulir pemetaan bahasa lengkap dari titik pengamatan hingga catatan', keywords: ['pemetaan', '16 seksi', 'pengumpulan data', 'titik pengamatan', 'kebahasaan', 'geografis', 'penduduk', 'pendidikan', 'agama', 'transportasi', 'sejarah'], icon: Layers },
    { type: 'view', key: 'kuesioner-sastra-lisan', title: 'Pemetaan Sastra Lisan', desc: 'Instrumen pemetaan sastra lisan dan budaya tutur', keywords: ['sastra lisan', 'kuesioner sastra', 'budaya', 'cerita rakyat'], icon: BookOpen },
    { type: 'view', key: 'kuesioner-vitalitas', title: 'Vitalitas Bahasa', desc: 'Instrumen pengukuran vitalitas, daya hidup, dan status bahasa', keywords: ['vitalitas', 'daya hidup', 'status bahasa', 'egids', 'terancam'], icon: BarChart3 },
    { type: 'view', key: 'kuesioner-revitalisasi', title: 'Kuesioner Revitalisasi', desc: 'Instrumen revitalisasi dan pengimbasan bahasa daerah', keywords: ['kuesioner revitalisasi', 'bahasa daerah', 'aksi', 'monev'], icon: Sparkles },
    { type: 'view', key: 'pengaturan', title: 'Pengaturan & Pengguna', desc: 'Kelola pengguna, akses, tema, bahasa, dan konfigurasi aplikasi', keywords: ['pengaturan', 'setting', 'pengguna', 'admin', 'konfigurasi', 'akun', 'peran', 'role', 'bahasa', 'dark mode'], icon: Settings }
  ];

  const sectionItems: SearchItem[] = SECTIONS_META.map(s => ({
    type: 'section',
    number: s.number,
    title: `Seksi ${s.number}: ${s.title}`,
    desc: `Instrumen Bagian ${s.number} (${s.category})`,
    keywords: [s.title, s.category, `bagian ${s.number}`, `seksi ${s.number}`],
    icon: FileText
  }));

  const allItems: SearchItem[] = [...menuItems, ...sectionItems];

  const normalizedQuery = query.toLowerCase().trim();
  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const filteredItems = queryTokens.length === 0
    ? allItems
    : allItems.filter(item => {
        const searchableText = [item.title, item.desc, ...item.keywords]
          .join(' ')
          .toLowerCase();
        return queryTokens.every(token => searchableText.includes(token));
      });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredItems[selectedIndex];
      if (selected) {
        if (selected.type === 'view') {
          onSelectView(selected.key);
        } else if (selected.type === 'section') {
          onSelectScreen(selected.number);
        } else if (selected.type === 'action') {
          selected.onExecute();
        }
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-3 sm:p-4 pt-[10vh] sm:pt-[15vh] animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[75vh] transition-colors"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-3.5 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
          <Search className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Ketik untuk mencari menu, seksi kuesioner, atau data..."
            className="flex-1 bg-transparent border-none outline-hidden text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
              Tidak ditemukan hasil untuk "{query}"
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={`${item.type}-${item.title}`}
                  type="button"
                  onClick={() => {
                    if (item.type === 'view') {
                      onSelectView(item.key);
                    } else if (item.type === 'section') {
                      onSelectScreen(item.number);
                    } else if (item.type === 'action') {
                      item.onExecute();
                    }
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-md text-left transition-colors ${
                    isSelected 
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-900 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className={`p-1.5 rounded-md shrink-0 ${
                      isSelected 
                        ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate leading-tight">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className={`w-3.5 h-3.5 shrink-0 transition-opacity ${
                    isSelected ? 'opacity-100 text-blue-600 dark:text-blue-400' : 'opacity-0'
                  }`} />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-3.5 py-2 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-300">
          <div className="flex items-center gap-3">
            <span><kbd className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-[10px] text-slate-800 dark:text-slate-200">↑↓</kbd> Navigasi</span>
            <span><kbd className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-[10px] text-slate-800 dark:text-slate-200">↵</kbd> Buka</span>
          </div>
          <span className="hidden sm:inline">Derana Quick Navigator</span>
        </div>
      </div>
    </div>
  );
};
