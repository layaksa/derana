import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  Award, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  ArrowUpDown, 
  ShieldCheck, 
  FileText, 
  Check, 
  AlertCircle, 
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { SurveyRecord } from '../../types/linguistic';
import { AppUser } from '../../types/auth';
import { loadAllUsers, getRoleLabel } from '../../utils/authStorage';

interface SurveyorProductivityCardProps {
  surveys: SurveyRecord[];
  currentUser: AppUser | null;
  onSelectSurvey?: (id: string) => void;
  onNavigateToForm?: (id: string) => void;
  onFilterBySurveyor?: (surveyorName: string) => void;
}

export interface SurveyorProductivityItem {
  id: string;
  name: string;
  email: string;
  role: string;
  institution?: string;
  totalSurveys: number;
  avgProgress: number;
  completedSurveys: number;
  inProgressSurveys: number;
  verifiedSurveys: number;
  surveysList: {
    id: string;
    title: string;
    desa: string;
    bahasa: string;
    progress: number;
    isVerified: boolean;
    updatedAt: string;
  }[];
  lastActive: string;
}

export const SurveyorProductivityCard: React.FC<SurveyorProductivityCardProps> = ({
  surveys,
  currentUser,
  onSelectSurvey,
  onNavigateToForm,
  onFilterBySurveyor
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'progress_desc' | 'total_desc' | 'name_asc' | 'recent'>('progress_desc');
  const [expandedSurveyorId, setExpandedSurveyorId] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<'cards' | 'table'>('cards');

  // Compute productivity statistics per surveyor
  const surveyorStats = useMemo(() => {
    const surveyorMap = new Map<string, SurveyorProductivityItem>();
    const allRegisteredUsers = loadAllUsers();

    // 1. Initialize registered surveyors from auth system
    allRegisteredUsers
      .filter(u => u.role === 'surveyor' || u.role === 'admin')
      .forEach(u => {
        surveyorMap.set(u.id, {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          institution: u.institution,
          totalSurveys: 0,
          avgProgress: 0,
          completedSurveys: 0,
          inProgressSurveys: 0,
          verifiedSurveys: 0,
          surveysList: [],
          lastActive: u.createdAt || new Date().toISOString()
        });
      });

    // 2. Aggregate actual survey contributions
    surveys.forEach(survey => {
      const creatorId = survey.createdBy || survey.createdByName || 'surveyor_anon';
      const creatorName = survey.createdByName || 'Surveyor Lapangan';
      const creatorEmail = survey.createdByEmail || '';
      const creatorRole = survey.createdByRole || 'surveyor';

      let item = surveyorMap.get(creatorId);

      // If not in map yet (e.g. matched by name), check by name or create
      if (!item) {
        // Try finding by name
        const existingByName = Array.from(surveyorMap.values()).find(
          s => s.name.toLowerCase() === creatorName.toLowerCase()
        );
        if (existingByName) {
          item = existingByName;
        } else {
          item = {
            id: creatorId,
            name: creatorName,
            email: creatorEmail,
            role: creatorRole,
            totalSurveys: 0,
            avgProgress: 0,
            completedSurveys: 0,
            inProgressSurveys: 0,
            verifiedSurveys: 0,
            surveysList: [],
            lastActive: survey.updatedAt || survey.createdAt
          };
          surveyorMap.set(creatorId, item);
        }
      }

      item.totalSurveys += 1;
      if (survey.progress === 100) item.completedSurveys += 1;
      else item.inProgressSurveys += 1;
      if (survey.isVerified) item.verifiedSurveys += 1;

      item.surveysList.push({
        id: survey.id,
        title: survey.title,
        desa: survey.desa || survey.data?.titikPengamatan?.namaDesa || 'Titik Survei',
        bahasa: survey.bahasa || survey.data?.titikPengamatan?.bahasaDigunakan || 'Bahasa Daerah',
        progress: survey.progress || 0,
        isVerified: !!survey.isVerified,
        updatedAt: survey.updatedAt
      });

      // Update latest activity timestamp
      if (new Date(survey.updatedAt).getTime() > new Date(item.lastActive).getTime()) {
        item.lastActive = survey.updatedAt;
      }
    });

    // 3. Compute final average progress per surveyor
    const result = Array.from(surveyorMap.values()).map(item => {
      if (item.totalSurveys > 0) {
        const sum = item.surveysList.reduce((acc, s) => acc + s.progress, 0);
        item.avgProgress = Math.round(sum / item.totalSurveys);
      } else {
        item.avgProgress = 0;
      }
      return item;
    });

    return result;
  }, [surveys]);

  // Filter & Sort
  const filteredSurveyors = useMemo(() => {
    let list = surveyorStats.filter(s => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchEmail = s.email.toLowerCase().includes(q);
      const matchDesa = s.surveysList.some(sv => 
        sv.desa.toLowerCase().includes(q) || sv.bahasa.toLowerCase().includes(q)
      );
      return matchName || matchEmail || matchDesa;
    });

    list.sort((a, b) => {
      if (sortBy === 'progress_desc') {
        if (b.avgProgress !== a.avgProgress) return b.avgProgress - a.avgProgress;
        return b.totalSurveys - a.totalSurveys;
      }
      if (sortBy === 'total_desc') {
        if (b.totalSurveys !== a.totalSurveys) return b.totalSurveys - a.totalSurveys;
        return b.avgProgress - a.avgProgress;
      }
      if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'recent') {
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
      }
      return 0;
    });

    return list;
  }, [surveyorStats, searchQuery, sortBy]);

  // Overall Productivity Summary
  const overallProductivity = useMemo(() => {
    const activeSurveyors = surveyorStats.filter(s => s.totalSurveys > 0);
    const totalCount = activeSurveyors.length;
    const totalSurveysSum = activeSurveyors.reduce((acc, s) => acc + s.totalSurveys, 0);
    const avgProgressSum = totalCount > 0 
      ? Math.round(activeSurveyors.reduce((acc, s) => acc + s.avgProgress, 0) / totalCount) 
      : 0;

    // Top contributor (highest surveys and progress)
    const topContributor = [...activeSurveyors].sort((a, b) => {
      if (b.totalSurveys !== a.totalSurveys) return b.totalSurveys - a.totalSurveys;
      return b.avgProgress - a.avgProgress;
    })[0] || null;

    return {
      activeSurveyorsCount: totalCount,
      totalSurveysSum,
      avgProgressSum,
      topContributor
    };
  }, [surveyorStats]);

  const toggleExpand = (id: string) => {
    setExpandedSurveyorId(prev => (prev === id ? null : id));
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';
    if (progress >= 50) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800';
    return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800';
  };

  const getProgressBarColor = (progress: number) => {
    if (progress >= 80) return 'bg-emerald-500';
    if (progress >= 50) return 'bg-amber-500';
    return 'bg-blue-500';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs space-y-5 transition-colors">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold shadow-2xs shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Statistik Produktivitas per Surveyor
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <ShieldCheck className="w-3 h-3 text-indigo-500" />
                <span>Dashboard Admin</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pantau rekam jejak jumlah titik survei dan rata-rata persentase kelengkapan pengisian instrumen oleh setiap surveyor lapangan.
            </p>
          </div>
        </div>

        {/* View mode toggle and quick counter */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-full inline-flex border border-slate-200 dark:border-slate-700 text-xs font-medium">
            <button
              type="button"
              onClick={() => setDisplayMode('cards')}
              className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                displayMode === 'cards'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 font-bold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Kartu Bento
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('table')}
              className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                displayMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 font-bold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tabel Peringkat
            </button>
          </div>
        </div>
      </div>

      {/* Top Aggregate Summary KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* KPI 1: Surveyor Aktif */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-indigo-900/70 dark:text-indigo-300 font-medium block truncate">
              Surveyor Berkontribusi
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl sm:text-2xl font-extrabold text-indigo-950 dark:text-indigo-100">
                {overallProductivity.activeSurveyorsCount}
              </span>
              <span className="text-xs text-indigo-700/70 dark:text-indigo-400 font-medium">staf</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Total Survei Terinput */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-sm shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-blue-900/70 dark:text-blue-300 font-medium block truncate">
              Total Survei Ditangani
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl sm:text-2xl font-extrabold text-blue-950 dark:text-blue-100">
                {overallProductivity.totalSurveysSum}
              </span>
              <span className="text-xs text-blue-700/70 dark:text-blue-400 font-medium">titik</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Rata-Rata Progres Tim */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-emerald-900/70 dark:text-emerald-300 font-medium block truncate">
              Rata-Rata Progres Tim
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-950 dark:text-emerald-100">
                {overallProductivity.avgProgressSum}%
              </span>
              <span className="text-xs text-emerald-700/70 dark:text-emerald-400 font-medium">agregat</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Top Contributor */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-sm shrink-0">
            <Award className="w-5 h-5 text-amber-600" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-amber-900/70 dark:text-amber-300 font-medium block truncate">
              Surveyor Teraktif
            </span>
            <div className="mt-0.5">
              <span className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-100 truncate block">
                {overallProductivity.topContributor?.name || 'Belum Ada'}
              </span>
              <span className="text-[10px] text-amber-700/80 dark:text-amber-400 font-medium block truncate">
                {overallProductivity.topContributor 
                  ? `${overallProductivity.topContributor.totalSurveys} survei · ${overallProductivity.topContributor.avgProgress}% selesai`
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari nama surveyor, email, atau nama desa..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-600 transition-colors"
          />
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Urutkan:</span>
          </span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-indigo-600 cursor-pointer transition-colors"
          >
            <option value="progress_desc">Progres Tertinggi</option>
            <option value="total_desc">Total Survei Terbanyak</option>
            <option value="name_asc">Nama Surveyor (A - Z)</option>
            <option value="recent">Aktivitas Terbaru</option>
          </select>
        </div>
      </div>

      {/* MAIN CONTENT: Cards Grid or Table */}
      {filteredSurveyors.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700">
          <Users className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tidak ada surveyor yang sesuai dengan kata kunci pencarian.
          </p>
        </div>
      ) : displayMode === 'cards' ? (
        /* ================= CARDS VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSurveyors.map((surveyor, idx) => {
            const isExpanded = expandedSurveyorId === surveyor.id;
            const progressColor = getProgressColor(surveyor.avgProgress);
            const progressBarColor = getProgressBarColor(surveyor.avgProgress);

            return (
              <div 
                key={surveyor.id}
                className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-2xs hover:shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Surveyor Identity Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                        {surveyor.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                          <span className="truncate">{surveyor.name}</span>
                          {idx === 0 && sortBy === 'progress_desc' && surveyor.totalSurveys > 0 && (
                            <span className="p-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" title="Progres Tertinggi">
                              <Award className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {surveyor.email || 'Akun Surveyor'}
                        </div>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                      {getRoleLabel(surveyor.role as any)}
                    </span>
                  </div>

                  {/* Core Productivity Metric Row */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    
                    {/* Total Survei */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                        Total Survei
                      </span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                          {surveyor.totalSurveys}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">titik</span>
                      </div>
                    </div>

                    {/* Rata-Rata Progres */}
                    <div className={`p-2.5 rounded-xl border ${progressColor}`}>
                      <span className="text-[10px] font-semibold block uppercase tracking-wider opacity-80">
                        Rata-Rata Progres
                      </span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xl font-extrabold">
                          {surveyor.avgProgress}%
                        </span>
                        <span className="text-[10px] opacity-80 font-medium">selesai</span>
                      </div>
                    </div>

                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      <span>Kelengkapan Pengisian</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {surveyor.completedSurveys} dari {surveyor.totalSurveys} tuntas (100%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${progressBarColor}`}
                        style={{ width: `${surveyor.avgProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Breakdown tags */}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{surveyor.verifiedSurveys} tervalidasi</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {surveyor.totalSurveys > 0 ? 'Aktif di lapangan' : 'Belum ada survei'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Bottom Accordion & Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {surveyor.totalSurveys > 0 ? (
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleExpand(surveyor.id)}
                        className="w-full flex items-center justify-between text-xs font-semibold text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 py-1 cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          <span>Lihat {surveyor.totalSurveys} Titik Pengamatan</span>
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      {/* Expandable Survey List Accordion */}
                      {isExpanded && (
                        <div className="mt-2.5 space-y-1.5 max-h-48 overflow-y-auto pr-1 animate-in fade-in duration-200">
                          {surveyor.surveysList.map(sv => (
                            <div 
                              key={sv.id}
                              onClick={() => {
                                if (onSelectSurvey) onSelectSurvey(sv.id);
                                if (onNavigateToForm) onNavigateToForm(sv.id);
                              }}
                              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/70 dark:border-slate-700/60 text-xs cursor-pointer transition-colors flex items-center justify-between group/item"
                              title="Klik untuk membuka instrumen survei ini"
                            >
                              <div className="min-w-0 pr-2">
                                <div className="font-semibold text-slate-800 dark:text-slate-200 truncate group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400">
                                  {sv.desa} · {sv.bahasa}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                  {sv.title}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                  sv.progress === 100 
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                }`}>
                                  {sv.progress}%
                                </span>
                                {sv.isVerified && (
                                  <span title="Tervalidasi">
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-1 text-[11px] text-slate-400 italic">
                      Belum ada formulir survei yang dikaitkan
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* ================= TABLE VIEW ================= */
        <div className="overflow-x-auto rounded-2xl border border-slate-200/90 dark:border-slate-800">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Peringkat & Surveyor</th>
                <th className="py-3 px-4">Peran & Balai</th>
                <th className="py-3 px-4 text-center">Total Titik Survei</th>
                <th className="py-3 px-4">Rata-Rata Progres</th>
                <th className="py-3 px-4 text-center">Status Tuntas</th>
                <th className="py-3 px-4 text-center">Tervalidasi</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {filteredSurveyors.map((surveyor, idx) => {
                const progressBarColor = getProgressBarColor(surveyor.avgProgress);
                return (
                  <tr key={surveyor.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Surveyor Info */}
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            <span>{surveyor.name}</span>
                            {idx === 0 && (
                              <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-normal">
                            {surveyor.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role & Institution */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {getRoleLabel(surveyor.role as any)}
                      </span>
                      {surveyor.institution && (
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[160px]">
                          {surveyor.institution}
                        </div>
                      )}
                    </td>

                    {/* Total Survei */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {surveyor.totalSurveys}
                      </span>
                    </td>

                    {/* Rata-Rata Progres */}
                    <td className="py-3.5 px-4 min-w-[160px]">
                      <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                        <span className="text-slate-900 dark:text-white">{surveyor.avgProgress}%</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {surveyor.completedSurveys}/{surveyor.totalSurveys} tuntas
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full ${progressBarColor}`}
                          style={{ width: `${surveyor.avgProgress}%` }}
                        />
                      </div>
                    </td>

                    {/* Status Tuntas */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
                        {surveyor.completedSurveys}
                      </span>
                    </td>

                    {/* Tervalidasi */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-indigo-700 dark:text-indigo-400">
                        {surveyor.verifiedSurveys}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {surveyor.totalSurveys > 0 && surveyor.surveysList[0] && (
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectSurvey) onSelectSurvey(surveyor.surveysList[0].id);
                            if (onNavigateToForm) onNavigateToForm(surveyor.surveysList[0].id);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 transition-colors cursor-pointer"
                        >
                          <span>Buka Survei</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Info Note */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-1">
        <span>
          💡 Statistik produktivitas diperbarui secara dinamis dari seluruh pangkalan data instrumen lapangan.
        </span>
        <span className="font-mono text-[10px]">
          Derana Dialektometri v2.0 · Tim Riset Bahasa
        </span>
      </div>

    </div>
  );
};
