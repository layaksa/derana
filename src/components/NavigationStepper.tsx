import React, { useRef, useEffect, useState } from 'react';
import { 
  MapPin, 
  Compass, 
  Mountain, 
  Users, 
  Briefcase, 
  GraduationCap, 
  School, 
  Building2, 
  Route, 
  Car, 
  Clock, 
  BookOpen, 
  Scroll, 
  UserCheck, 
  BookA, 
  Network,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List
} from 'lucide-react';

export interface SectionMeta {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  category: string;
  icon: React.ReactNode;
}

export const SECTIONS_META: SectionMeta[] = [
  { id: 'section-1', number: 1, title: 'Gambaran Titik Pengamatan', shortTitle: '1. Titik Pengamatan', category: 'Wilayah', icon: <MapPin className="w-3.5 h-3.5" /> },
  { id: 'section-2', number: 2, title: 'Situasi Kebahasaan (Perbatasan)', shortTitle: '2. Kebahasaan', category: 'Wilayah', icon: <Compass className="w-3.5 h-3.5" /> },
  { id: 'section-3', number: 3, title: 'Situasi Geografis & Morfologi', shortTitle: '3. Geografis', category: 'Wilayah', icon: <Mountain className="w-3.5 h-3.5" /> },
  { id: 'section-4', number: 4, title: 'Penduduk & Penutur Bahasa', shortTitle: '4. Penduduk', category: 'Demografi', icon: <Users className="w-3.5 h-3.5" /> },
  { id: 'section-5', number: 5, title: 'Mata Pencaharian', shortTitle: '5. Pekerjaan', category: 'Demografi', icon: <Briefcase className="w-3.5 h-3.5" /> },
  { id: 'section-6', number: 6, title: 'Pendidikan Penduduk', shortTitle: '6. Pendidikan', category: 'Sosial', icon: <GraduationCap className="w-3.5 h-3.5" /> },
  { id: 'section-7', number: 7, title: 'Sarana Pendidikan', shortTitle: '7. Sarana', category: 'Sosial', icon: <School className="w-3.5 h-3.5" /> },
  { id: 'section-8', number: 8, title: 'Agama Penduduk', shortTitle: '8. Agama', category: 'Sosial', icon: <Building2 className="w-3.5 h-3.5" /> },
  { id: 'section-9', number: 9, title: 'Hubungan ke Luar (Mobilitas)', shortTitle: '9. Mobilitas', category: 'Akses', icon: <Route className="w-3.5 h-3.5" /> },
  { id: 'section-10', number: 10, title: 'Alat Transportasi', shortTitle: '10. Transportasi', category: 'Akses', icon: <Car className="w-3.5 h-3.5" /> },
  { id: 'section-11', number: 11, title: 'Usia Desa', shortTitle: '11. Usia Desa', category: 'Kesejarahan', icon: <Clock className="w-3.5 h-3.5" /> },
  { id: 'section-12', number: 12, title: 'Sejarah Desa', shortTitle: '12. Sejarah', category: 'Kesejarahan', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: 'section-13', number: 13, title: 'Instrumen Sastra Lisan (28 Butir & Motif)', shortTitle: '13. Sastra Lisan', category: 'Kesejarahan', icon: <Scroll className="w-3.5 h-3.5" /> },
  { id: 'section-14', number: 14, title: 'Profil Narasumber (1, 2, 3)', shortTitle: '14. Narasumber', category: 'Informan', icon: <UserCheck className="w-3.5 h-3.5" /> },
  { id: 'section-15', number: 15, title: 'Daftar Kosakata, Frasa & Kalimat', shortTitle: '15. Kosakata', category: 'Linguistik', icon: <BookA className="w-3.5 h-3.5" /> },
  { id: 'section-16', number: 16, title: 'Dialektometri & Visualisasi Peta', shortTitle: '16. Dialektometri & Peta', category: 'Linguistik', icon: <Network className="w-3.5 h-3.5" /> }
];

interface NavigationStepperProps {
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
  errorsBySection?: Record<number, any[]>;
  className?: string;
}

export const NavigationStepper: React.FC<NavigationStepperProps> = ({
  activeSection,
  onSelectSection,
  errorsBySection,
  className = ''
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Update scroll arrow buttons visibility
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  // Auto-scroll the active pill into view within the horizontal bar
  useEffect(() => {
    const activeEl = document.getElementById(`nav-${activeSection}`);
    const container = scrollContainerRef.current;
    if (activeEl && container) {
      const elLeft = activeEl.offsetLeft;
      const elWidth = activeEl.offsetWidth;
      const containerWidth = container.offsetWidth;
      const targetScroll = elLeft - (containerWidth / 2) + (elWidth / 2);
      container.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  }, [activeSection]);

  const handleScrollStep = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const amount = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const [isBentoMode, setIsBentoMode] = useState(false);
  const activeMeta = SECTIONS_META.find(s => s.id === activeSection) || SECTIONS_META[0];

  return (
    <div className={`relative w-full ${className}`}>
      {/* Bento Mode: Full non-truncated 16-section matrix */}
      {isBentoMode ? (
        <div className="max-w-7xl mx-auto py-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <LayoutGrid className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Matriks 16 Seksi Instrumen (Tampilan Penuh Tanpa Terpotong)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsBentoMode(false)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <List className="w-3.5 h-3.5" />
              <span>Mode Bilah Geser</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {SECTIONS_META.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => onSelectSection(sec.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-300 dark:ring-indigo-500'
                      : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {sec.number}
                    </span>
                    <span className={`text-[10px] ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                      {sec.category}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold leading-tight line-clamp-2">
                      {sec.shortTitle.replace(/^\d+\.\s*/, '')}
                    </h4>
                  </div>
                  {errorsBySection?.[sec.number] && errorsBySection[sec.number].length > 0 && (
                    <span className="mt-1 text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-rose-500 text-white self-start animate-pulse">
                      {errorsBySection[sec.number].length} kolom
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 py-2">
          {/* Left Arrow Button */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => handleScrollStep('left')}
              className="hidden sm:flex items-center justify-center w-7 h-7 rounded-lg bg-white/95 dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 shadow-2xs shrink-0 transition-all z-10 cursor-pointer"
              title="Geser menu ke kiri"
              aria-label="Geser menu ke kiri"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Scrollable Track */}
          <div
            ref={scrollContainerRef}
            className="flex items-center overflow-x-auto gap-1.5 scroll-smooth no-scrollbar py-0.5 px-0.5 flex-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {SECTIONS_META.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  id={`nav-${sec.id}`}
                  onClick={() => onSelectSection(sec.id)}
                  className={`group flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold ring-2 ring-indigo-300 dark:ring-indigo-500 ring-offset-1 ring-offset-white dark:ring-offset-slate-900'
                      : 'text-slate-700 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-white dark:hover:bg-slate-800 bg-white/80 dark:bg-slate-850/80 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs'
                  }`}
                  title={`${sec.number}. ${sec.title}`}
                >
                  <span className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400'}`}>
                    {sec.icon}
                  </span>
                  <span>{sec.shortTitle}</span>
                  {errorsBySection?.[sec.number] && errorsBySection[sec.number].length > 0 && (
                    <span
                      className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                        isActive ? 'bg-white text-rose-600' : 'bg-rose-500 text-white'
                      } animate-pulse`}
                      title={`${errorsBySection[sec.number].length} kolom belum valid`}
                    >
                      {errorsBySection[sec.number].length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Arrow Button */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => handleScrollStep('right')}
              className="hidden sm:flex items-center justify-center w-7 h-7 rounded-lg bg-white/95 dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 shadow-2xs shrink-0 transition-all z-10 cursor-pointer"
              title="Geser menu ke kanan"
              aria-label="Geser menu ke kanan"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Toggle to Bento Mode button */}
          <button
            type="button"
            onClick={() => setIsBentoMode(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 shrink-0 transition-colors cursor-pointer"
            title="Buka matriks 16 seksi agar tidak terpotong"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Matriks Seksi</span>
          </button>

          {/* Active Section Quick Pill Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold border border-indigo-200 dark:border-indigo-800 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
            <span>Bagian {activeMeta.number}/16</span>
          </div>
        </div>
      )}
    </div>
  );
};
