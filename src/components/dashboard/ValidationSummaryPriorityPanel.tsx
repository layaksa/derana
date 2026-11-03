import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  Filter, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  BookOpen, 
  Users, 
  MessageSquare, 
  Check, 
  ExternalLink,
  Sparkles,
  BarChart3,
  TrendingUp,
  FileEdit,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { SurveyRecord } from '../../types/linguistic';
import { AppUser } from '../../types/auth';
import { getSectionProgressDetails } from '../../utils/calculations';

interface ValidationSummaryPriorityPanelProps {
  surveys: SurveyRecord[];
  currentUser: AppUser | null;
  onSelectSurvey: (id: string) => void;
  onSwitchToEditor: () => void;
  onToggleVerify?: (id: string) => void;
  onOpenAddComment?: (survey: SurveyRecord) => void;
  onNavigateToSection?: (surveyId: string, sectionIndex: number) => void;
}

export const ValidationSummaryPriorityPanel: React.FC<ValidationSummaryPriorityPanelProps> = ({
  surveys,
  currentUser,
  onSelectSurvey,
  onSwitchToEditor,
  onToggleVerify,
  onOpenAddComment,
  onNavigateToSection
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'critical' | 'moderate' | 'unverified' | 'mine'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'verifikator';

  // Calculate detailed completeness and missing sections for each survey
  const evaluatedSurveys = useMemo(() => {
    return surveys.map(s => {
      const details = getSectionProgressDetails(s.data);
      const missingSections = details.sections.filter(sec => !sec.isFilled);
      const isVerified = Boolean(s.isVerified);
      const score = details.percentage;

      let tier: 'critical' | 'moderate' | 'optimal' = 'optimal';
      if (score < 50) tier = 'critical';
      else if (score < 80) tier = 'moderate';

      return {
        survey: s,
        details,
        score,
        tier,
        missingSections,
        isVerified
      };
    });
  }, [surveys]);

  // Overall Statistics Calculation
  const stats = useMemo(() => {
    const total = evaluatedSurveys.length;
    if (total === 0) {
      return {
        overallAverage: 0,
        verifiedCount: 0,
        unverifiedCount: 0,
        criticalCount: 0,
        moderateCount: 0,
        optimalCount: 0,
        verifiedPercentage: 0
      };
    }

    const sumScore = evaluatedSurveys.reduce((acc, curr) => acc + curr.score, 0);
    const overallAverage = Math.round((sumScore / total) * 10) / 10;
    const verifiedCount = evaluatedSurveys.filter(s => s.isVerified).length;
    const unverifiedCount = total - verifiedCount;
    const criticalCount = evaluatedSurveys.filter(s => s.tier === 'critical').length;
    const moderateCount = evaluatedSurveys.filter(s => s.tier === 'moderate').length;
    const optimalCount = evaluatedSurveys.filter(s => s.tier === 'optimal').length;
    const verifiedPercentage = Math.round((verifiedCount / total) * 100);

    return {
      overallAverage,
      verifiedCount,
      unverifiedCount,
      criticalCount,
      moderateCount,
      optimalCount,
      verifiedPercentage
    };
  }, [evaluatedSurveys]);

  // Sort and filter priority list (Lowest completion score first)
  const priorityList = useMemo(() => {
    let list = [...evaluatedSurveys];

    // Filter by mode
    if (filterMode === 'critical') {
      list = list.filter(item => item.tier === 'critical');
    } else if (filterMode === 'moderate') {
      list = list.filter(item => item.tier === 'moderate');
    } else if (filterMode === 'unverified') {
      list = list.filter(item => !item.isVerified);
    } else if (filterMode === 'mine' && currentUser) {
      list = list.filter(item => 
        item.survey.createdBy === currentUser.id || 
        item.survey.createdByEmail === currentUser.email
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(item => {
        const s = item.survey;
        return (
          s.title.toLowerCase().includes(q) ||
          s.desa.toLowerCase().includes(q) ||
          s.kecamatan.toLowerCase().includes(q) ||
          s.kabupatenKota.toLowerCase().includes(q) ||
          s.bahasa.toLowerCase().includes(q) ||
          (s.createdByName || '').toLowerCase().includes(q)
        );
      });
    }

    // Primary sort: Lowest completion score first (Most incomplete first)
    list.sort((a, b) => a.score - b.score);

    return list;
  }, [evaluatedSurveys, filterMode, searchQuery, currentUser]);

  const getScoreColor = (score: number) => {
    if (score < 50) return {
      bar: 'bg-rose-500',
      badge: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800',
      label: 'Kritis (<50%)'
    };
    if (score < 80) return {
      bar: 'bg-amber-500',
      badge: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      label: 'Sedang (50-79%)'
    };
    return {
      bar: 'bg-emerald-500',
      badge: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      label: 'Optimal (≥80%)'
    };
  };

  const handleFixSurvey = (surveyId: string, firstMissingSectionNumber?: number) => {
    onSelectSurvey(surveyId);
    if (firstMissingSectionNumber && onNavigateToSection) {
      onNavigateToSection(surveyId, firstMissingSectionNumber);
    } else {
      onSwitchToEditor();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-4 sm:p-5 space-y-4">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-2xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Ringkasan Validasi & Prioritas Kelengkapan Data
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Prioritas Surveyor
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pantau persentase kelengkapan seluruh survei nasional dan prioritaskan berkas dengan isian paling minim
            </p>
          </div>
        </div>

        {/* Global Average Completeness Badge */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Kelengkapan Keseluruhan
            </span>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-none">
              {stats.overallAverage}%
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 text-xs shadow-2xs">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Card 1: Rata-Rata Kelengkapan & Bar */}
        <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-semibold text-[11px]">Rasio Kelengkapan Data</span>
            <span className="font-mono text-[10px] font-bold text-indigo-600">16 Seksi</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden flex">
            <div 
              className="bg-rose-500 h-full transition-all duration-500"
              style={{ width: `${surveys.length > 0 ? (stats.criticalCount / surveys.length) * 100 : 0}%` }}
              title={`Kritis: ${stats.criticalCount} survei`}
            />
            <div 
              className="bg-amber-500 h-full transition-all duration-500"
              style={{ width: `${surveys.length > 0 ? (stats.moderateCount / surveys.length) * 100 : 0}%` }}
              title={`Sedang: ${stats.moderateCount} survei`}
            />
            <div 
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${surveys.length > 0 ? (stats.optimalCount / surveys.length) * 100 : 0}%` }}
              title={`Optimal: ${stats.optimalCount} survei`}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>{stats.criticalCount} Kritis</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>{stats.moderateCount} Sedang</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{stats.optimalCount} Optimal</span>
            </span>
          </div>
        </div>

        {/* Card 2: Status Validasi Kurasi */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
            <span>Survei Tervalidasi</span>
            <span className="font-mono text-[10px] bg-emerald-100 dark:bg-emerald-900 px-1.5 py-0.5 rounded">
              {stats.verifiedPercentage}% Lulus
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {stats.verifiedCount} <span className="text-xs font-normal text-slate-500">dari {surveys.length} survei</span>
          </div>
          <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
            {stats.unverifiedCount > 0 ? `${stats.unverifiedCount} berkas menunggu kurasi & perbaikan` : 'Semua berkas telah tervalidasi'}
          </p>
        </div>

        {/* Card 3: Prioritas Perbaikan Kritis */}
        <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-rose-800 dark:text-rose-300">
            <span>Perlu Tindakan Cepat</span>
            <span className="font-mono text-[10px] bg-rose-100 dark:bg-rose-900 px-1.5 py-0.5 rounded text-rose-800 dark:text-rose-200">
              {'< 50%'}
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {stats.criticalCount} <span className="text-xs font-normal text-slate-500">berkas survei</span>
          </div>
          <p className="text-[10px] text-rose-600 dark:text-rose-400">
            Data esensial Swadesh / informan belum terisi lengkap
          </p>
        </div>

        {/* Card 4: Survei Sedang Berjalan */}
        <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-amber-800 dark:text-amber-300">
            <span>Tahap Progres (50-79%)</span>
            <span className="font-mono text-[10px] bg-amber-100 dark:bg-amber-900 px-1.5 py-0.5 rounded text-amber-800 dark:text-amber-200">
              Sedang
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {stats.moderateCount} <span className="text-xs font-normal text-slate-500">berkas survei</span>
          </div>
          <p className="text-[10px] text-amber-700 dark:text-amber-400">
            Tinggal melengkapi beberapa seksi lanjutan
          </p>
        </div>
      </div>

      {/* Priority List Controls & Search */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 text-xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-semibold scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-xl transition-colors cursor-pointer shrink-0 ${
              filterMode === 'all'
                ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Semua Prioritas ({evaluatedSurveys.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('critical')}
            className={`px-3 py-1 rounded-xl transition-colors cursor-pointer shrink-0 ${
              filterMode === 'critical'
                ? 'bg-rose-600 text-white font-bold shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Kritis {'< 50%'} ({stats.criticalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('moderate')}
            className={`px-3 py-1 rounded-xl transition-colors cursor-pointer shrink-0 ${
              filterMode === 'moderate'
                ? 'bg-amber-600 text-white font-bold shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Sedang 50-79% ({stats.moderateCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('unverified')}
            className={`px-3 py-1 rounded-xl transition-colors cursor-pointer shrink-0 ${
              filterMode === 'unverified'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Menunggu Validasi ({stats.unverifiedCount})
          </button>
          {currentUser && (
            <button
              type="button"
              onClick={() => setFilterMode('mine')}
              className={`px-3 py-1 rounded-xl transition-colors cursor-pointer shrink-0 ${
                filterMode === 'mine'
                  ? 'bg-blue-600 text-white font-bold shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Survei Saya
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari desa, kabupaten, surveyor..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Priority Survey List Cards */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span className="font-semibold text-[11px]">
            Daftar Survei Berdasarkan Urutan Prioritas Kelengkapan Terendah:
          </span>
          <span className="text-[10px] font-mono">
            {priorityList.length} survei ditampilkan
          </span>
        </div>

        {priorityList.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-bold text-slate-700 dark:text-slate-300">
              Tidak ada survei yang memerlukan perhatian pada filter ini.
            </p>
            <p className="text-[11px] text-slate-400">
              Semua berkas survei pada kategori ini telah terisi dengan baik.
            </p>
          </div>
        ) : (
          priorityList.map(({ survey, score, details, missingSections, isVerified }, idx) => {
            const scoreColor = getScoreColor(score);
            const firstMissing = missingSections[0];

            return (
              <div
                key={survey.id}
                className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-2xs space-y-3"
              >
                {/* Survey Item Top Row */}
                <div className="flex flex-wrap items-start justify-between gap-2.5">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        #{idx + 1}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {survey.desa || survey.title}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${scoreColor.badge}`}>
                        Kelengkapan {score}% ({scoreColor.label})
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isVerified 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300' 
                          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}>
                        {isVerified ? '✓ Tervalidasi' : 'Belum Tervalidasi'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Kec. {survey.kecamatan || '-'}, {survey.kabupatenKota || '-'} • Bahasa: <strong className="text-slate-700 dark:text-slate-300">{survey.bahasa}</strong> • Surveyor: {survey.createdByName || 'Surveyor Lapangan'}
                    </p>
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Add Admin Comment Button */}
                    {onOpenAddComment && (
                      <button
                        type="button"
                        onClick={() => onOpenAddComment(survey)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        title="Beri komentar review atau instruksi untuk surveyor"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                        <span className="hidden sm:inline">Beri Catatan</span>
                      </button>
                    )}

                    {/* Toggle Verify Button (Admin only) */}
                    {isAdmin && onToggleVerify && (
                      <button
                        type="button"
                        onClick={() => onToggleVerify(survey.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-colors cursor-pointer ${
                          isVerified
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                        title={isVerified ? 'Batalkan status validasi' : 'Validasi berkas survei ini'}
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">{isVerified ? 'Tervalidasi' : 'Validasi'}</span>
                      </button>
                    )}

                    {/* Fix & Complete Data Button */}
                    <button
                      type="button"
                      onClick={() => handleFixSurvey(survey.id, firstMissing?.number)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs transition-colors cursor-pointer"
                      title="Buka formulir editor untuk melengkapi data yang belum terisi"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>Lengkapi Data Sekarang →</span>
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Missing Sections Badges */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">
                      Progress: <strong className="text-slate-800 dark:text-slate-200">{details.score} dari 16 seksi</strong> terisi ({missingSections.length} seksi belum lengkap)
                    </span>
                    <span className="font-mono font-bold text-slate-600 dark:text-slate-400">
                      {score}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${scoreColor.bar} transition-all duration-300 rounded-full`}
                      style={{ width: `${score}%` }}
                    />
                  </div>

                  {/* Missing Sections Pills */}
                  {missingSections.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[10px]">
                      <span className="text-slate-400 font-semibold shrink-0">
                        Perlu Dilengkapi:
                      </span>
                      {missingSections.slice(0, 4).map(sec => (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => handleFixSurvey(survey.id, sec.number)}
                          className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 font-medium hover:bg-rose-100 cursor-pointer transition-colors"
                          title={`Klik untuk langsung mengisi Seksi ${sec.number}: ${sec.title}`}
                        >
                          Seksi {sec.number} ({sec.title})
                        </button>
                      ))}
                      {missingSections.length > 4 && (
                        <span className="text-slate-400 font-mono text-[9px]">
                          +{missingSections.length - 4} seksi lainnya
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
