import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  ExternalLink, 
  Filter, 
  Sparkles,
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
  Scroll,
  UserCheck,
  BookA,
  Network,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Check
} from 'lucide-react';
import { SurveyRecord } from '../../types/linguistic';
import { AppUser } from '../../types/auth';
import { getSectionProgressDetails } from '../../utils/calculations';

interface SectionProgressNavigationPanelProps {
  surveys: SurveyRecord[];
  activeSurveyId: string | null;
  onSelectSurvey: (id: string) => void;
  onNavigateToSection?: (surveyId: string, sectionNumber: number) => void;
  onSwitchToEditor: () => void;
  currentUser: AppUser | null;
}

const SECTION_ICONS: Record<number, React.ReactNode> = {
  1: <MapPin className="size-3.5" />,
  2: <Compass className="size-3.5" />,
  3: <Mountain className="size-3.5" />,
  4: <Users className="size-3.5" />,
  5: <Briefcase className="size-3.5" />,
  6: <GraduationCap className="size-3.5" />,
  7: <School className="size-3.5" />,
  8: <Building2 className="size-3.5" />,
  9: <Route className="size-3.5" />,
  10: <Car className="size-3.5" />,
  11: <Clock className="size-3.5" />,
  12: <Scroll className="size-3.5" />,
  13: <Scroll className="size-3.5" />,
  14: <UserCheck className="size-3.5" />,
  15: <BookA className="size-3.5" />,
  16: <Network className="size-3.5" />
};

export const SectionProgressNavigationPanel: React.FC<SectionProgressNavigationPanelProps> = ({
  surveys,
  activeSurveyId,
  onSelectSurvey,
  onNavigateToSection,
  onSwitchToEditor,
  currentUser
}) => {
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>(() => {
    return activeSurveyId || (surveys[0]?.id || '');
  });
  const [filterMode, setFilterMode] = useState<'all' | 'incomplete' | 'complete'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Cari berkas survei yang sedang dipilih
  const currentSurvey = useMemo(() => {
    return surveys.find(s => s.id === selectedSurveyId) || surveys[0] || null;
  }, [surveys, selectedSurveyId]);

  // Hitung progres rinci per seksi berdasarkan kolom terisi
  const progressDetails = useMemo(() => {
    if (!currentSurvey?.data) {
      return {
        score: 0,
        total: 16,
        percentage: 0,
        totalFilledColumns: 0,
        totalAvailableColumns: 0,
        overallColumnPercentage: 0,
        sections: []
      };
    }
    return getSectionProgressDetails(currentSurvey.data);
  }, [currentSurvey]);

  // Filter seksi
  const filteredSections = useMemo(() => {
    return progressDetails.sections.filter(s => {
      // Filter status
      if (filterMode === 'incomplete' && s.percentage === 100) return false;
      if (filterMode === 'complete' && s.percentage < 100) return false;

      // Filter kategori
      if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;

      return true;
    });
  }, [progressDetails.sections, filterMode, categoryFilter]);

  // Statistik ringkas status seksi
  const completedSectionsCount = progressDetails.sections.filter(s => s.percentage === 100).length;
  const partialSectionsCount = progressDetails.sections.filter(s => s.percentage > 0 && s.percentage < 100).length;
  const emptySectionsCount = progressDetails.sections.filter(s => s.percentage === 0).length;

  const categories = useMemo(() => {
    const set = new Set<string>();
    progressDetails.sections.forEach(s => set.add(s.category));
    return Array.from(set);
  }, [progressDetails.sections]);

  const handleJumpToSection = (sectionNumber: number) => {
    if (!currentSurvey) return;
    if (onSelectSurvey && currentSurvey.id !== activeSurveyId) {
      onSelectSurvey(currentSurvey.id);
    }
    if (onNavigateToSection) {
      onNavigateToSection(currentSurvey.id, sectionNumber);
    } else {
      onSwitchToEditor();
    }
  };

  if (!currentSurvey) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs space-y-5 transition-colors">
      
      {/* Header & Survey Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold shadow-2xs shrink-0">
            <Layers className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white text-balance">
                Navigasi & Visualisasi Progres 16 Seksi Kuesioner
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <Sparkles className="size-3 text-indigo-500" />
                <span>Kalkulasi Kolom Otomatis</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 text-pretty">
              Persentase dihitung otomatis berdasarkan jumlah kolom dan butir leksikon yang telah diisi pada masing-masing seksi instrumen lapangan.
            </p>
          </div>
        </div>

        {/* Survey Picker Dropdown */}
        <div className="flex items-center gap-2 self-start lg:self-auto bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 pl-2 shrink-0">
            Titik Survei:
          </span>
          <select
            value={currentSurvey.id}
            onChange={(e) => {
              setSelectedSurveyId(e.target.value);
              if (onSelectSurvey) onSelectSurvey(e.target.value);
            }}
            className="text-xs font-bold px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-indigo-600 cursor-pointer shadow-2xs transition-colors max-w-[220px] sm:max-w-[280px] truncate"
          >
            {surveys.map((s) => (
              <option key={s.id} value={s.id}>
                {s.desa ? `Desa ${s.desa}` : s.title} ({s.bahasa || 'Bahasa -'}) · {s.progress}%
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Statistics Ribbon for Active Survey */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-3.5">
        
        {/* Metric 1: Rata-Rata Kelengkapan Keseluruhan */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900/70 dark:text-indigo-300 block truncate">
              Rata-Rata Kelengkapan
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-extrabold text-indigo-950 dark:text-indigo-100 tabular-nums">
                {progressDetails.percentage}%
              </span>
              <span className="text-[11px] text-indigo-700/70 dark:text-indigo-400 font-medium">agregat</span>
            </div>
            <span className="text-[10px] text-indigo-600/80 dark:text-indigo-400 block truncate tabular-nums">
              {progressDetails.totalFilledColumns} dari {progressDetails.totalAvailableColumns} kolom terisi
            </span>
          </div>
          <div className="size-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold shrink-0">
            <TrendingUp className="size-5" />
          </div>
        </div>

        {/* Metric 2: Seksi Selesai Tuntas (100%) */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900/70 dark:text-emerald-300 block truncate">
              Seksi Tuntas (100%)
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-extrabold text-emerald-950 dark:text-emerald-100 tabular-nums">
                {completedSectionsCount}
              </span>
              <span className="text-[11px] text-emerald-700/70 dark:text-emerald-400 font-medium">/ 16 Seksi</span>
            </div>
            <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400 block truncate">
              Semua kolom terisi penuh
            </span>
          </div>
          <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="size-5" />
          </div>
        </div>

        {/* Metric 3: Seksi Sedang Diisi (1 - 99%) */}
        <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900/70 dark:text-amber-300 block truncate">
              Sedang Dalam Proses
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-extrabold text-amber-950 dark:text-amber-100 tabular-nums">
                {partialSectionsCount}
              </span>
              <span className="text-[11px] text-amber-700/70 dark:text-amber-400 font-medium">seksi</span>
            </div>
            <span className="text-[10px] text-amber-600/80 dark:text-amber-400 block truncate">
              Terisi sebagian kolom
            </span>
          </div>
          <div className="size-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold shrink-0">
            <Clock className="size-5" />
          </div>
        </div>

        {/* Metric 4: Seksi Belum Terisi (0%) */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
              Belum Diisi (0%)
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tabular-nums">
                {emptySectionsCount}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">seksi</span>
            </div>
            <span className="text-[10px] text-slate-500 block truncate">
              Perlu pengumpulan lapangan
            </span>
          </div>
          <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold shrink-0">
            <AlertCircle className="size-5" />
          </div>
        </div>

      </div>

      {/* Filter Tabs & Category Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs w-fit">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              filterMode === 'all'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Semua 16 Seksi
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('incomplete')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterMode === 'incomplete'
                ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-300 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Perlu Dilengkapi</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold tabular-nums">
              {partialSectionsCount + emptySectionsCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('complete')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterMode === 'complete'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Selesai Tuntas</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold tabular-nums">
              {completedSectionsCount}
            </span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] text-slate-400 shrink-0 hidden md:inline">Kategori:</span>
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shrink-0 border ${
              categoryFilter === 'all'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            Semua
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shrink-0 border ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 16 SECTIONS INTERACTIVE TILES GRID (Visualisasi Progres Otomatis) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
        {filteredSections.map(sec => {
          const isComplete = sec.percentage === 100;
          const isPartial = sec.percentage > 0 && sec.percentage < 100;
          const isEmpty = sec.percentage === 0;

          const progressBgColor = isComplete 
            ? 'bg-emerald-500' 
            : sec.percentage >= 50 
              ? 'bg-indigo-600 dark:bg-indigo-400' 
              : 'bg-amber-500';

          const badgeColor = isComplete
            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            : isPartial
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';

          return (
            <div
              key={sec.id}
              onClick={() => handleJumpToSection(sec.number)}
              className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-2xs hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
              title={`Klik untuk langsung membuka dan mengisi Seksi ${sec.number}: ${sec.title}`}
            >
              <div>
                {/* Header Tile: Section Number, Category, and Percentage Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                      {SECTION_ICONS[sec.number] || <Layers className="size-3.5" />}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase font-mono">
                        SEKSI {sec.number < 10 ? `0${sec.number}` : sec.number}
                      </span>
                      <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 block truncate">
                        {sec.category}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border shrink-0 tabular-nums ${badgeColor}`}>
                    {sec.percentage}%
                  </span>
                </div>

                {/* Section Title */}
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {sec.title}
                </h4>

                {/* Detailed Summary / Value Excerpt */}
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 text-pretty">
                  {sec.summary}
                </p>
              </div>

              {/* Progress Bar & Column Counter Footer */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                  <span className="font-medium">Keterisian Kolom</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                    {sec.filledColumns}/{sec.totalColumns} Kolom
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-500 ${progressBgColor}`}
                    style={{ width: `${sec.percentage}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px]">
                  <span className={`font-semibold ${
                    isComplete 
                      ? 'text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5' 
                      : isPartial 
                        ? 'text-amber-700 dark:text-amber-400' 
                        : 'text-slate-400'
                  }`}>
                    {isComplete && <Check className="size-3 text-emerald-600 inline" />}
                    {isComplete ? 'Tuntas Lengkap' : isPartial ? 'Sedang Diisi' : 'Belum Ada Data'}
                  </span>

                  <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    <span>Buka Seksi</span>
                    <ArrowRight className="size-3" />
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Footer Info & Quick Action */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
        <span className="flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-indigo-500 shrink-0" />
          <span>
            Setiap perubahan isian pada instrumen survei otomatis memperbarui persentase seksi ini secara langsung (*real-time*).
          </span>
        </span>

        <button
          type="button"
          onClick={() => {
            if (onSelectSurvey && currentSurvey.id !== activeSurveyId) {
              onSelectSurvey(currentSurvey.id);
            }
            onSwitchToEditor();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <span>Buka Formulir {currentSurvey.desa ? `Desa ${currentSurvey.desa}` : ''}</span>
          <ArrowRight className="size-3.5" />
        </button>
      </div>

    </div>
  );
};
