import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  Users, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Languages, 
  BarChart3,
  Calendar,
  Layers,
  MapPin,
  Check,
  Globe2
} from 'lucide-react';
import { InstrumenPemetaanBahasaData } from '../../types/linguistic';
import { 
  DAFTAR_PERTANYAAN_VITALITAS, 
  KuesionerVitalitasResponse 
} from '../../data/kuesionerVitalitasData';
import { 
  loadVitalitasResponses, 
  deleteVitalitasResponse, 
  exportVitalitasToCSV 
} from '../../utils/vitalitasStorage';
import { KuesionerVitalitasModal } from './KuesionerVitalitasModal';

interface KondisiKebahasaanViewProps {
  data: InstrumenPemetaanBahasaData;
  canEdit?: boolean;
  onSave?: () => void;
  lastSavedTime?: string | null;
  // Backward compatibility props (optional)
  updatePenduduk?: (field: any, value: any) => void;
  updateMataPencaharian?: (field: any, value: any) => void;
  updatePendidikan?: (field: any, value: any) => void;
  updateSaranaPendidikan?: (field: any, value: any) => void;
  updateAgama?: (field: any, value: any) => void;
  updateHubunganMobilitas?: (field: any, value: any) => void;
  updateAlatTransportasi?: (field: any, value: any) => void;
  selectedProvinceFilter?: string;
  onNavigateToMap?: () => void;
}

interface LanguageGroupStats {
  languageName: string;
  normalizedName: string;
  totalRespondents: number;
  avgScore: number;
  vitalitasStatus: 'Aman' | 'Rentan' | 'Mengalami Kemunduran' | 'Terancam Punah' | 'Kritis';
  statusColor: string;
  villages: string[];
  responses: KuesionerVitalitasResponse[];
}

export const KondisiKebahasaanView: React.FC<KondisiKebahasaanViewProps> = ({
  data,
  canEdit = true,
  selectedProvinceFilter = 'all',
  onNavigateToMap
}) => {
  const [responses, setResponses] = useState<KuesionerVitalitasResponse[]>(() => loadVitalitasResponses());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResponse, setEditingResponse] = useState<KuesionerVitalitasResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [collapsedLanguages, setCollapsedLanguages] = useState<Record<string, boolean>>({});
  const [showQuestionsPreview, setShowQuestionsPreview] = useState(false);
  const [expandedQuestionCategory, setExpandedQuestionCategory] = useState<string | null>(null);

  useEffect(() => {
    setResponses(loadVitalitasResponses());
  }, []);

  // Helper to normalize language names for reliable grouping (e.g. "Bahasa Sunda" and "Sunda" or variations)
  const normalizeLang = (name: string): string => {
    const trimmed = name.trim();
    if (!trimmed) return 'Bahasa Belum Ditentukan';
    // Match common prefixes
    if (trimmed.toLowerCase().startsWith('bahasa ')) {
      return trimmed;
    }
    return `Bahasa ${trimmed}`;
  };

  // Group responses by Language
  const languageGroups = useMemo(() => {
    const map = new Map<string, KuesionerVitalitasResponse[]>();

    responses.forEach((resp) => {
      const langKey = normalizeLang(resp.bahasaDaerah);
      if (!map.has(langKey)) {
        map.set(langKey, []);
      }
      map.get(langKey)!.push(resp);
    });

    const groups: LanguageGroupStats[] = [];

    map.forEach((items, langKey) => {
      const totalRespondents = items.length;
      const totalScore = items.reduce((acc, r) => acc + (r.scoreAvg || 0), 0);
      const avgScore = totalRespondents > 0 ? Number((totalScore / totalRespondents).toFixed(2)) : 0;

      let vitalitasStatus: 'Aman' | 'Rentan' | 'Mengalami Kemunduran' | 'Terancam Punah' | 'Kritis' = 'Aman';
      let statusColor = 'text-emerald-700 bg-emerald-100 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';

      if (avgScore >= 4.2) {
        vitalitasStatus = 'Aman';
        statusColor = 'text-emerald-700 bg-emerald-100 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
      } else if (avgScore >= 3.4) {
        vitalitasStatus = 'Rentan';
        statusColor = 'text-amber-700 bg-amber-100 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
      } else if (avgScore >= 2.6) {
        vitalitasStatus = 'Mengalami Kemunduran';
        statusColor = 'text-orange-700 bg-orange-100 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800';
      } else {
        vitalitasStatus = 'Terancam Punah';
        statusColor = 'text-rose-700 bg-rose-100 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
      }

      // Collect unique villages
      const villageSet = new Set<string>();
      items.forEach(i => {
        if (i.desa) villageSet.add(i.desa);
      });

      groups.push({
        languageName: langKey,
        normalizedName: langKey,
        totalRespondents,
        avgScore,
        vitalitasStatus,
        statusColor,
        villages: Array.from(villageSet),
        responses: items
      });
    });

    // Sort by number of respondents descending
    groups.sort((a, b) => b.totalRespondents - a.totalRespondents);
    return groups;
  }, [responses]);

  // Overall Statistics across all languages
  const overallStats = useMemo(() => {
    const totalResp = responses.length;
    const totalLangs = languageGroups.length;

    if (totalResp === 0) {
      return {
        totalResp: 0,
        totalLangs: 0,
        avgScore: 0,
        statusKeseluruhan: 'Belum Ada Data',
        statusColor: 'text-slate-500 bg-slate-100 dark:bg-slate-800'
      };
    }

    const totalScore = responses.reduce((acc, r) => acc + (r.scoreAvg || 0), 0);
    const avgScore = Number((totalScore / totalResp).toFixed(2));

    let statusKeseluruhan = 'Aman (Safe)';
    let statusColor = 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300';

    if (avgScore >= 4.2) {
      statusKeseluruhan = 'Aman (Safe)';
      statusColor = 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300';
    } else if (avgScore >= 3.4) {
      statusKeseluruhan = 'Rentan (Vulnerable)';
      statusColor = 'text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300';
    } else if (avgScore >= 2.6) {
      statusKeseluruhan = 'Kemunduran (Endangered)';
      statusColor = 'text-orange-700 bg-orange-100 dark:bg-orange-950/60 dark:text-orange-300';
    } else {
      statusKeseluruhan = 'Terancam Punah (Severely Endangered)';
      statusColor = 'text-rose-700 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300';
    }

    return {
      totalResp,
      totalLangs,
      avgScore,
      statusKeseluruhan,
      statusColor
    };
  }, [responses, languageGroups]);

  // Filtered language groups based on selectedLanguageFilter and search query
  const displayedLanguageGroups = useMemo(() => {
    return languageGroups
      .map(group => {
        // If language filter is active and doesn't match, return null
        if (selectedLanguageFilter !== 'all' && group.languageName !== selectedLanguageFilter) {
          return null;
        }

        // Filter responses inside this language
        const matchingResponses = group.responses.filter(r => {
          if (filterStatus !== 'all' && r.vitalitasStatus !== filterStatus) return false;
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchName = r.respondenNama.toLowerCase().includes(q);
            const matchDesa = r.desa.toLowerCase().includes(q);
            const matchBahasa = r.bahasaDaerah.toLowerCase().includes(q);
            const matchPekerjaan = r.respondenPekerjaan?.toLowerCase().includes(q);
            if (!matchName && !matchDesa && !matchBahasa && !matchPekerjaan) return false;
          }
          return true;
        });

        if (matchingResponses.length === 0 && (searchQuery.trim() || filterStatus !== 'all')) {
          return null;
        }

        return {
          ...group,
          responses: matchingResponses
        };
      })
      .filter((g): g is LanguageGroupStats => g !== null);
  }, [languageGroups, selectedLanguageFilter, searchQuery, filterStatus]);

  // Total matching respondents
  const totalMatchingResponses = useMemo(() => {
    return displayedLanguageGroups.reduce((acc, g) => acc + g.responses.length, 0);
  }, [displayedLanguageGroups]);

  // Question categories for preview
  const questionCategories = useMemo(() => {
    const map = new Map<string, typeof DAFTAR_PERTANYAAN_VITALITAS>();
    DAFTAR_PERTANYAAN_VITALITAS.forEach(q => {
      if (!map.has(q.category)) {
        map.set(q.category, []);
      }
      map.get(q.category)!.push(q);
    });
    return Array.from(map.entries());
  }, []);

  const toggleLanguageCollapse = (langName: string) => {
    setCollapsedLanguages(prev => ({
      ...prev,
      [langName]: !prev[langName]
    }));
  };

  const handleOpenNew = () => {
    setEditingResponse(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: KuesionerVitalitasResponse) => {
    setEditingResponse(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data kuesioner responden ini?')) {
      const updated = deleteVitalitasResponse(id);
      setResponses(updated);
    }
  };

  const handleSaveSuccess = (saved: KuesionerVitalitasResponse) => {
    const updated = loadVitalitasResponses();
    setResponses(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
              <Languages className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                  Kondisi & Vitalitas Bahasa
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                  Kategorisasi Bahasa
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-1.5 max-w-2xl leading-relaxed font-normal">
                Hasil pengisian kuesioner responden 95 pertanyaan dikategorikan secara otomatis berdasarkan bahasa daerah untuk mengukur tingkat daya hidup dan transmisi antargenerasi per bahasa.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center shrink-0">
            {onNavigateToMap && (
              <button
                type="button"
                onClick={onNavigateToMap}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800 shadow-2xs"
                title="Buka Peta Geospasial Vitalitas Bahasa CARTO"
              >
                <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Buka Peta Vitalitas</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => exportVitalitasToCSV(responses)}
              disabled={responses.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
              title="Unduh seluruh data kuesioner terperinci dalam format CSV"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Ekspor CSV</span>
            </button>

            {canEdit && (
              <button
                type="button"
                onClick={handleOpenNew}
                className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>+ Isi Kuesioner</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Bahasa Terkategori</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">{overallStats.totalLangs}</span>
              <span className="text-xs text-slate-400">Bahasa</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Responden</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{overallStats.totalResp}</span>
              <span className="text-xs text-slate-400">Orang</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Rata-Rata Skor Gabungan</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {overallStats.avgScore > 0 ? overallStats.avgScore : '-'}
              </span>
              <span className="text-xs text-slate-400">/ 5.00</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Daya Hidup Agregat</span>
            <div className="mt-1">
              <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold ${overallStats.statusColor}`}>
                {overallStats.statusKeseluruhan}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Language Category Selector Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Pilih Kategori Bahasa:</span>
          </span>
          <span className="text-slate-400 text-[11px]">
            {languageGroups.length} entitas bahasa daerah
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => setSelectedLanguageFilter('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              selectedLanguageFilter === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>Semua Bahasa</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              selectedLanguageFilter === 'all' ? 'bg-white text-blue-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              {responses.length}
            </span>
          </button>

          {languageGroups.map((lg) => {
            const isSelected = selectedLanguageFilter === lg.languageName;
            return (
              <button
                key={lg.languageName}
                type="button"
                onClick={() => setSelectedLanguageFilter(lg.languageName)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>{lg.languageName}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  isSelected ? 'bg-white text-blue-600' : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                }`}>
                  {lg.totalRespondents}
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  ★ {lg.avgScore}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama responden, desa, atau pekerjaan..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
          >
            <option value="all">Semua Status Vitalitas</option>
            <option value="Aman">Aman</option>
            <option value="Rentan">Rentan</option>
            <option value="Mengalami Kemunduran">Mengalami Kemunduran</option>
            <option value="Terancam Punah">Terancam Punah</option>
            <option value="Kritis">Kritis</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setShowQuestionsPreview(!showQuestionsPreview)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span>{showQuestionsPreview ? 'Tutup Pedoman 95 Pertanyaan' : 'Lihat Pedoman 95 Pertanyaan PDF'}</span>
          {showQuestionsPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Interactive Accordion of 95 PDF Questions */}
      {showQuestionsPreview && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Daftar Lengkap 95 Pertanyaan Kuesioner (Sesuai PDF)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Instrumen resmi pengukuran daya hidup dan vitalitas bahasa daerah di lapangan.
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              10 Dimensi Sosiolinguistik
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {questionCategories.map(([catName, qList]) => {
              const isExpanded = expandedQuestionCategory === catName || expandedQuestionCategory === null;
              return (
                <div key={catName} className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedQuestionCategory(expandedQuestionCategory === catName ? '' : catName)}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 text-left transition-colors cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {catName} ({qList.length} Pertanyaan)
                    </span>
                    <span className="text-slate-400 text-xs font-semibold">
                      {isExpanded ? 'Sembunyikan' : 'Buka'}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="p-3.5 space-y-3 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                      {qList.map(q => (
                        <div key={q.id} className="pt-2.5 first:pt-0">
                          <div className="flex items-start gap-2.5">
                            <span className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[11px] font-bold flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900/50">
                              {q.number}
                            </span>
                            <div className="flex-1">
                              <p className="text-xs font-medium text-slate-900 dark:text-slate-100 leading-snug">
                                {q.text}
                              </p>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {q.options.map(opt => (
                                  <span
                                    key={opt.value}
                                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400"
                                  >
                                    {opt.label}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CATEGORIZED RESPONSES BY LANGUAGE */}
      <div className="space-y-6">
        {displayedLanguageGroups.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 sm:p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-xs">
              <Languages className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Tidak Ditemukan Kuesioner untuk Kategori Ini
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                Belum ada data responden yang cocok dengan kriteria pencarian atau bahasa yang dipilih. Mulai isi kuesioner baru dengan menekan tombol di bawah.
              </p>
            </div>
            {canEdit && (
              <button
                type="button"
                onClick={handleOpenNew}
                className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <span>+ Isi Kuesioner Sekarang</span>
              </button>
            )}
          </div>
        ) : (
          displayedLanguageGroups.map((group) => {
            const isCollapsed = Boolean(collapsedLanguages[group.languageName]);
            return (
              <div 
                key={group.languageName}
                className="bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-4 transition-all"
              >
                {/* Language Group Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      <Languages className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                          {group.languageName}
                        </h2>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold">
                          {group.responses.length} Responden
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${group.statusColor}`}>
                          {group.vitalitasStatus} ({group.avgScore}/5.00)
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Titik Pengamatan: {group.villages.length > 0 ? group.villages.join(', ') : 'Belum ada desa'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleLanguageCollapse(group.languageName)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <span>{isCollapsed ? 'Tampilkan Responden' : 'Sembunyikan'}</span>
                      {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Respondents Grid for this Language */}
                {!isCollapsed && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {group.responses.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                                {item.respondenNama.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                                  {item.respondenNama}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {item.respondenUsia ? `${item.respondenUsia} Tahun • ` : ''}
                                  {item.respondenGender === 'wanita' ? 'Wanita' : 'Pria'}
                                  {item.respondenPekerjaan ? ` • ${item.respondenPekerjaan}` : ''}
                                </p>
                              </div>
                            </div>

                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${item.statusColor}`}>
                              {item.vitalitasStatus}
                            </span>
                          </div>

                          {/* Details Badge */}
                          <div className="grid grid-cols-2 gap-2 text-xs py-2 my-2 border-y border-slate-100 dark:border-slate-800">
                            <div>
                              <span className="text-[10px] text-slate-400 block">Bahasa Daerah:</span>
                              <strong className="text-slate-800 dark:text-slate-200 font-semibold">{item.bahasaDaerah}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">Desa Pengamatan:</span>
                              <strong className="text-slate-800 dark:text-slate-200 font-semibold">{item.desa}</strong>
                            </div>
                          </div>

                          {/* Progress & Score */}
                          <div className="flex items-center justify-between gap-2 text-xs mb-3">
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span>{item.totalAnswered} / 95 Terjawab ({Math.round((item.totalAnswered / 95) * 100)}%)</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400 text-[11px]">Skor Vitalitas:</span>
                              <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                                {item.scoreAvg}
                              </span>
                            </div>
                          </div>

                          {item.catatan && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg italic mb-2">
                              "{item.catatan}"
                            </p>
                          )}
                        </div>

                        {/* Footer Buttons */}
                        <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>{canEdit ? 'Lihat / Edit' : 'Lihat Respon (Hanya Baca)'}</span>
                            </button>
                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => handleDelete(item.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                title="Hapus kuesioner ini"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Kuesioner Vitalitas (95 Pertanyaan) */}
      <KuesionerVitalitasModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveSuccess={handleSaveSuccess}
        initialData={editingResponse}
        canEdit={canEdit}
        defaultDesa={data.titikPengamatan?.namaDesa}
        defaultBahasa={
          selectedLanguageFilter !== 'all' 
            ? selectedLanguageFilter 
            : (data.titikPengamatan?.bahasaDigunakan || 'Bahasa Sunda')
        }
        defaultKecamatan={data.titikPengamatan?.kecamatan}
        defaultKabupaten={data.titikPengamatan?.kabupatenKota}
      />
    </div>
  );
};
