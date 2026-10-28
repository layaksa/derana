import React, { useState, useMemo } from 'react';
import {
  SurveyRecord,
  DifferenceCategory,
  ComparisonWordItem,
  LanguageSourceInfo
} from '../types/linguistic';
import { SWADESH_200_GLOS } from '../data/swadeshList';
import { COMPARATIVE_CORPUS_PRESETS } from '../data/comparativeCorpus';
import {
  classifyWordPair,
  calculatePairStats,
  buildTriangularMatrix,
  exportComparisonToCSV
} from '../utils/dialectometryComparator';
import {
  ArrowLeftRight,
  Search,
  Filter,
  Download,
  Printer,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  FileSpreadsheet,
  FileJson,
  Layers,
  ChevronDown,
  Scale,
  Globe,
  MapPin,
  FileText,
  ArrowRight
} from 'lucide-react';
import { SideBySideSurveyComparison } from './comparison/SideBySideSurveyComparison';
import { SurveysLeafletMap } from './dashboard/SurveysLeafletMap';
import { CartoTriInstrumentView } from './views/CartoTriInstrumentView';

interface LanguageComparisonProps {
  surveys: SurveyRecord[];
  activeSurveyId?: string;
  onNavigateToForm?: (surveyId: string) => void;
  onOpenRegionalReport?: () => void;
  onSelectSurvey?: (id: string) => void;
  onNavigateToSastraLisanForm?: () => void;
  onNavigateToVitalitasForm?: () => void;
  onNavigateToRevitalisasiForm?: () => void;
}

export const LanguageComparison: React.FC<LanguageComparisonProps> = ({
  surveys,
  activeSurveyId,
  onNavigateToForm,
  onOpenRegionalReport,
  onSelectSurvey,
  onNavigateToSastraLisanForm,
  onNavigateToVitalitasForm,
  onNavigateToRevitalisasiForm
}) => {
  // Top-level View Tab: 'side-by-side' | 'peta-survei' | 'peta-carto' | 'matrix'
  const [mainTab, setMainTab] = useState<'side-by-side' | 'peta-survei' | 'peta-carto' | 'matrix'>('side-by-side');

  // Mode: 2 languages vs 3 languages
  const [isThreeLanguages, setIsThreeLanguages] = useState<boolean>(true);

  // Selected language sources
  // Presets available: preset_sunda_priangan, preset_jawa_banyumas, preset_melayu_betawi, preset_sunda_banten
  // Surveys available: survey_xxx
  const [lang1Id, setLang1Id] = useState<string>(() => {
    // If active survey exists, default to it; otherwise Sunda Priangan
    if (activeSurveyId && surveys.some(s => s.id === activeSurveyId)) {
      return `survey_${activeSurveyId}`;
    }
    return 'preset_sunda_priangan';
  });

  const [lang2Id, setLang2Id] = useState<string>('preset_jawa_banyumas');
  const [lang3Id, setLang3Id] = useState<string>('preset_melayu_betawi');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | DifferenceCategory | 'OVERRIDDEN'>('ALL');

  // Manual Overrides state: map of glossId -> DifferenceCategory
  const [manualOverrides, setManualOverrides] = useState<{ [glossId: number]: DifferenceCategory }>({});

  // Helper to get language name, subtitle, and vocabulary entries
  const resolveLanguageData = (selectedId: string): {
    info: LanguageSourceInfo;
    entries: { [glos: string]: { bentuk: string; ipa: string; catatan?: string } };
  } => {
    if (selectedId.startsWith('survey_')) {
      const realId = selectedId.replace('survey_', '');
      const survey = surveys.find(s => s.id === realId);
      if (survey) {
        const swadeshMap: { [glos: string]: { bentuk: string; ipa: string; catatan?: string } } = {};
        survey.data.kosakataLengkap?.swadeshList?.forEach(item => {
          if (item.glosIndonesia) {
            swadeshMap[item.glosIndonesia.toLowerCase().trim()] = {
              bentuk: item.bentukLokal || '',
              ipa: item.transkripsiIPA || '',
              catatan: item.catatan || ''
            };
          }
        });

        return {
          info: {
            id: selectedId,
            name: survey.bahasa ? `${survey.bahasa} (Desa ${survey.desa || 'Survei'})` : survey.title,
            label: `Survei: ${survey.desa || survey.title}`,
            origin: 'survey',
            subTitle: `${survey.kecamatan ? `Kec. ${survey.kecamatan}, ` : ''}${survey.kabupatenKota || ''}`
          },
          entries: swadeshMap
        };
      }
    }

    // Default or Fallback to presets
    const preset = COMPARATIVE_CORPUS_PRESETS.find(p => p.id === selectedId) || COMPARATIVE_CORPUS_PRESETS[0];
    return {
      info: {
        id: preset.id,
        name: preset.name,
        label: preset.name,
        origin: 'preset',
        subTitle: `${preset.region} • ${preset.family}`
      },
      entries: preset.entries
    };
  };

  const langAData = useMemo(() => resolveLanguageData(lang1Id), [lang1Id, surveys]);
  const langBData = useMemo(() => resolveLanguageData(lang2Id), [lang2Id, surveys]);
  const langCData = useMemo(() => resolveLanguageData(lang3Id), [lang3Id, surveys]);

  // Build the unified comparison items across 200 Swadesh glosses
  const comparisonItems = useMemo<ComparisonWordItem[]>(() => {
    return SWADESH_200_GLOS.map((glos, index) => {
      const id = index + 1;
      const key = glos.toLowerCase().trim();

      const itemA = langAData.entries[key] || { bentuk: '', ipa: '' };
      const itemB = langBData.entries[key] || { bentuk: '', ipa: '' };
      const itemC = isThreeLanguages ? (langCData.entries[key] || { bentuk: '', ipa: '' }) : undefined;

      // Pairwise comparisons
      const pairAB = classifyWordPair(itemA.bentuk, itemB.bentuk, glos);
      const pairAC = itemC ? classifyWordPair(itemA.bentuk, itemC.bentuk, glos) : undefined;
      const pairBC = itemC ? classifyWordPair(itemB.bentuk, itemC.bentuk, glos) : undefined;

      // Determine overall category
      let autoCategory: DifferenceCategory = pairAB.category;
      let phonNote = pairAB.note;

      if (isThreeLanguages && pairAC && pairBC) {
        if (
          pairAB.category === 'BELUM_DIISI' ||
          pairAC.category === 'BELUM_DIISI' ||
          pairBC.category === 'BELUM_DIISI'
        ) {
          // If any missing
          if (!itemA.bentuk || !itemB.bentuk || !itemC?.bentuk) {
            autoCategory = 'BELUM_DIISI';
          }
        }

        if (
          pairAB.category === 'BEDA_LEKSIKAL' ||
          pairAC.category === 'BEDA_LEKSIKAL' ||
          pairBC.category === 'BEDA_LEKSIKAL'
        ) {
          autoCategory = 'BEDA_LEKSIKAL';
          phonNote = `Variasi Leksikal Lintas 3 Bahasa: A-B (${pairAB.category}), A-C (${pairAC.category}), B-C (${pairBC.category})`;
        } else if (
          pairAB.category === 'BEDA_FONEM' ||
          pairAC.category === 'BEDA_FONEM' ||
          pairBC.category === 'BEDA_FONEM'
        ) {
          autoCategory = 'BEDA_FONEM';
          phonNote = `Variasi Fonologis Kognat: ${pairAB.note}; ${pairAC.note}`;
        } else if (
          pairAB.category === 'SAMA' &&
          pairAC.category === 'SAMA' &&
          pairBC.category === 'SAMA'
        ) {
          autoCategory = 'SAMA';
          phonNote = 'Identik pada ketiga bahasa yang diperbandingkan';
        }
      }

      // Check if user manually overrode this row
      const isOverridden = manualOverrides[id] !== undefined;
      const effectiveCategory = isOverridden ? manualOverrides[id] : autoCategory;

      return {
        id,
        glosIndonesia: glos,
        source: 'swadesh',
        langA: itemA,
        langB: itemB,
        langC: itemC,
        category: effectiveCategory,
        pairAB,
        pairAC,
        pairBC,
        phonologicalNote: phonNote,
        isOverridden
      };
    });
  }, [langAData, langBData, langCData, isThreeLanguages, manualOverrides]);

  // Compute Dialectometry stats for each pair
  const statsAB = useMemo(() => {
    return calculatePairStats(langAData.info.name, langBData.info.name, comparisonItems, 'pairAB');
  }, [langAData, langBData, comparisonItems]);

  const statsAC = useMemo(() => {
    if (!isThreeLanguages) return undefined;
    return calculatePairStats(langAData.info.name, langCData.info.name, comparisonItems, 'pairAC');
  }, [isThreeLanguages, langAData, langCData, comparisonItems]);

  const statsBC = useMemo(() => {
    if (!isThreeLanguages) return undefined;
    return calculatePairStats(langBData.info.name, langCData.info.name, comparisonItems, 'pairBC');
  }, [isThreeLanguages, langBData, langCData, comparisonItems]);

  // Triangular Matrix for 3-Language mode
  const triangularMatrix = useMemo(() => {
    return buildTriangularMatrix(statsAB, statsAC, statsBC);
  }, [statsAB, statsAC, statsBC]);

  // Filtered rows for the table
  const filteredItems = useMemo(() => {
    return comparisonItems.filter(item => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchGlos = item.glosIndonesia.toLowerCase().includes(q);
        const matchA = item.langA.bentuk.toLowerCase().includes(q) || item.langA.ipa.toLowerCase().includes(q);
        const matchB = item.langB.bentuk.toLowerCase().includes(q) || item.langB.ipa.toLowerCase().includes(q);
        const matchC = item.langC
          ? item.langC.bentuk.toLowerCase().includes(q) || item.langC.ipa.toLowerCase().includes(q)
          : false;
        const matchNote = item.phonologicalNote.toLowerCase().includes(q);

        if (!matchGlos && !matchA && !matchB && !matchC && !matchNote) {
          return false;
        }
      }

      // 2. Category filter
      if (categoryFilter === 'ALL') return true;
      if (categoryFilter === 'OVERRIDDEN') return !!item.isOverridden;
      return item.category === categoryFilter;
    });
  }, [comparisonItems, searchQuery, categoryFilter]);

  // Overall counts for category summary
  const counts = useMemo(() => {
    let lek = 0;
    let fon = 0;
    let sam = 0;
    let kos = 0;
    let ovr = 0;

    comparisonItems.forEach(item => {
      if (item.category === 'BEDA_LEKSIKAL') lek++;
      else if (item.category === 'BEDA_FONEM') fon++;
      else if (item.category === 'SAMA') sam++;
      else kos++;

      if (item.isOverridden) ovr++;
    });

    return { lek, fon, sam, kos, ovr, total: comparisonItems.length };
  }, [comparisonItems]);

  // Override handler
  const handleOverrideCategory = (id: number, newCategory: DifferenceCategory) => {
    setManualOverrides(prev => ({
      ...prev,
      [id]: newCategory
    }));
  };

  const handleResetSingleOverride = (id: number) => {
    setManualOverrides(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const handleResetAllOverrides = () => {
    if (window.confirm('Reset seluruh penyesuaian manual kategori leksikal/fonem kembali ke analisis otomatis?')) {
      setManualOverrides({});
    }
  };

  // Preset switchers
  const applyPresetPair = (p1: string, p2: string, p3?: string) => {
    setLang1Id(p1);
    setLang2Id(p2);
    if (p3) {
      setIsThreeLanguages(true);
      setLang3Id(p3);
    } else {
      setIsThreeLanguages(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const csvContent = exportComparisonToCSV(
      comparisonItems,
      langAData.info.name,
      langBData.info.name,
      isThreeLanguages ? langCData.info.name : undefined,
      isThreeLanguages
    );

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Komparasi_Dialektometri_${langAData.info.name.replace(/\s+/g, '_')}_vs_${langBData.info.name.replace(/\s+/g, '_')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // JSON Export
  const handleExportJSON = () => {
    const reportData = {
      tanggalAnalisis: new Date().toISOString(),
      metode: 'Dialektometri Komparatif Guiraud / Badan Bahasa RI (d = s/n * 100%)',
      bahasa1: langAData.info,
      bahasa2: langBData.info,
      bahasa3: isThreeLanguages ? langCData.info : null,
      statistikPairAB: statsAB,
      statistikPairAC: statsAC || null,
      statistikPairBC: statsBC || null,
      matriksSegitiga: triangularMatrix,
      daftarKomparasiKosakata: comparisonItems
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Dialektometri_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="language-comparison-root" className="space-y-8 pb-16 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Main Mode Navigation Bar with Integrated Features */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-2xs border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Segmented Mode Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl flex-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setMainTab('side-by-side')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                mainTab === 'side-by-side'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Perbandingan Berdampingan (Side-by-Side)</span>
            </button>

            <button
              type="button"
              onClick={() => setMainTab('peta-survei')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                mainTab === 'peta-survei'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Peta Survei Titik</span>
            </button>

            <button
              type="button"
              onClick={() => setMainTab('peta-carto')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                mainTab === 'peta-carto'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Peta CARTO (Tri-Instrumen)</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                mainTab === 'peta-carto' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                CARTO
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMainTab('matrix')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                mainTab === 'matrix'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Dialektometri Matriks (2–3 Bahasa)</span>
            </button>
          </div>

          {/* Integrated Laporan Wilayah (PDF) Action Button */}
          {onOpenRegionalReport && (
            <button
              type="button"
              onClick={onOpenRegionalReport}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
              title="Laporan Ringkasan Wilayah (Unduh PDF)"
            >
              <FileText className="w-4 h-4" />
              <span>Laporan Ringkasan Wilayah</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 font-extrabold">
                PDF
              </span>
            </button>
          )}
        </div>
      </div>

      {mainTab === 'side-by-side' ? (
        <SideBySideSurveyComparison
          surveys={surveys}
          activeSurveyId={activeSurveyId}
          onNavigateToForm={onNavigateToForm}
          onOpenRegionalReport={onOpenRegionalReport}
          onNavigateToPetaSurvei={() => setMainTab('peta-survei')}
          onNavigateToPetaCarto={() => setMainTab('peta-carto')}
        />
      ) : mainTab === 'peta-survei' ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Peta Titik Survei Lapangan & Koordinat Spasial</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pemetaan geografis interaktif titik pengamatan, layer isoglos, kalkulasi jarak geodesik antar titik, dan pemilihan titik komparasi.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMainTab('side-by-side')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Komparasi Berdampingan</span>
              </button>
            </div>
          </div>
          <SurveysLeafletMap
            surveys={surveys}
            activeSurveyId={activeSurveyId || null}
            onSelectSurvey={(id) => {
              if (onSelectSurvey) onSelectSurvey(id);
            }}
            onSwitchToEditor={() => {
              if (onNavigateToForm && activeSurveyId) onNavigateToForm(activeSurveyId);
            }}
            onSwitchToComparison={() => {
              setMainTab('side-by-side');
            }}
          />
        </div>
      ) : mainTab === 'peta-carto' ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Peta Spasial CARTO (Tri-Instrumen Terintegrasi)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Lapisan spasial GIS CARTO terpadu: Sastra Lisan, Vitalitas Bahasa, dan Revitalisasi Bahasa Daerah dengan filter wilayah dan basemap.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {onOpenRegionalReport && (
                <button
                  type="button"
                  onClick={onOpenRegionalReport}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Laporan Wilayah (PDF)</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setMainTab('side-by-side')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Komparasi Berdampingan</span>
              </button>
            </div>
          </div>
          <CartoTriInstrumentView
            surveys={surveys}
            onOpenRegionalReport={onOpenRegionalReport}
            onNavigateToSastraLisanForm={onNavigateToSastraLisanForm}
            onNavigateToVitalitasForm={onNavigateToVitalitasForm}
            onNavigateToRevitalisasiForm={onNavigateToRevitalisasiForm}
            onNavigateToPetaSurvei={() => setMainTab('peta-survei')}
          />
        </div>
      ) : (
        <>
          {/* Header Banner */}
          <div id="comparison-header-banner" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 transition-colors">
       
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800 mb-3">
              <Scale className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
              Sistem Dialektometri & Komparasi Leksikostatistik
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
              Komparasi 2–3 Bahasa & Dialektometri
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              Menganalisis perbedaan leksikal, fonologis (korespondensi fonem), dan menghitung indeks dialektometri otomatis berstandar Badan Bahasa RI berbasis 200 Kosakata Dasar Swadesh.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs flex transition-colors">
              <button
                type="button"
                id="btn-mode-2-lang"
                onClick={() => setIsThreeLanguages(false)}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                  !isThreeLanguages
                    ? 'bg-[#1c5fff] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                Komparasi 2 Bahasa
              </button>
              <button
                type="button"
                id="btn-mode-3-lang"
                onClick={() => setIsThreeLanguages(true)}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                  isThreeLanguages
                    ? 'bg-[#1c5fff] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                Komparasi 3 Bahasa
              </button>
            </div>
          </div>
        </div>

        {/* Quick Preset Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1.5 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            Preset Komparasi Cepat:
          </span>
          <button
            type="button"
            onClick={() => applyPresetPair('preset_sunda_priangan', 'preset_jawa_banyumas', 'preset_melayu_betawi')}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-teal-900 dark:hover:text-teal-200 hover:border-teal-300 dark:hover:border-teal-700 transition-colors shadow-2xs cursor-pointer"
          >
            Sunda Priangan vs Jawa Banyumas vs Melayu Betawi (3 Bahasa)
          </button>
          <button
            type="button"
            onClick={() => applyPresetPair('preset_sunda_priangan', 'preset_sunda_banten')}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-teal-900 dark:hover:text-teal-200 hover:border-teal-300 dark:hover:border-teal-700 transition-colors shadow-2xs cursor-pointer"
          >
            Sunda Priangan vs Sunda Banten (Subdialek)
          </button>
          <button
            type="button"
            onClick={() => applyPresetPair('preset_sunda_priangan', 'preset_jawa_banyumas')}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-teal-900 dark:hover:text-teal-200 hover:border-teal-300 dark:hover:border-teal-700 transition-colors shadow-2xs cursor-pointer"
          >
            Sunda vs Jawa (2 Bahasa)
          </button>
          {surveys.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const targetSurveyId = activeSurveyId || surveys[0].id;
                applyPresetPair(`survey_${targetSurveyId}`, 'preset_sunda_priangan');
              }}
              className="px-3 py-1.5 rounded-lg bg-teal-100/90 dark:bg-teal-950/60 hover:bg-teal-200/80 dark:hover:bg-teal-900/60 border border-teal-300 dark:border-teal-800 text-teal-900 dark:text-teal-200 transition-colors font-semibold shadow-2xs cursor-pointer"
            >
              Survei Saya ({surveys[0].desa || 'Lap.'}) vs Korpus Acuan
            </button>
          )}
        </div>
      </div>

      {/* Language Source Selection Panels */}
      <div id="language-selection-grid" className={`grid grid-cols-1 ${isThreeLanguages ? 'lg:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
        {/* Language 1 (A) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-teal-200/80 dark:border-teal-800/60 p-4 shadow-sm relative transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Bahasa 1 (Titik A)
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {langAData.info.origin === 'survey' ? 'Survei Lapangan' : 'Korpus Terstandar'}
            </span>
          </div>

          <label htmlFor="select-lang-1" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Pilih Korpus / Survei Lapangan:
          </label>
          <div className="relative">
            <select
              id="select-lang-1"
              value={lang1Id}
              onChange={e => setLang1Id(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 text-sm font-semibold rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-colors cursor-pointer"
            >
              <optgroup label="📋 Formulir Survei Lapangan Tersimpan">
                {surveys.map(s => (
                  <option key={`survey_${s.id}`} value={`survey_${s.id}`}>
                    {s.title} ({s.bahasa || 'Bahasa Belum Terisi'})
                  </option>
                ))}
              </optgroup>
              <optgroup label="📚 Korpus Bahasa Nusantara Terstandarisasi">
                {COMPARATIVE_CORPUS_PRESETS.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <div className="font-semibold text-slate-800 dark:text-slate-200">{langAData.info.name}</div>
            <div className="text-slate-500 dark:text-slate-400 line-clamp-1">{langAData.info.subTitle}</div>
          </div>
        </div>

        {/* Language 2 (B) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-indigo-200/80 dark:border-indigo-800/60 p-4 shadow-sm relative transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Bahasa 2 (Titik B)
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {langBData.info.origin === 'survey' ? 'Survei Lapangan' : 'Korpus Terstandar'}
            </span>
          </div>

          <label htmlFor="select-lang-2" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Pilih Korpus / Survei Lapangan:
          </label>
          <div className="relative">
            <select
              id="select-lang-2"
              value={lang2Id}
              onChange={e => setLang2Id(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 text-sm font-semibold rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors cursor-pointer"
            >
              <optgroup label="📋 Formulir Survei Lapangan Tersimpan">
                {surveys.map(s => (
                  <option key={`survey_${s.id}`} value={`survey_${s.id}`}>
                    {s.title} ({s.bahasa || 'Bahasa Belum Terisi'})
                  </option>
                ))}
              </optgroup>
              <optgroup label="📚 Korpus Bahasa Nusantara Terstandarisasi">
                {COMPARATIVE_CORPUS_PRESETS.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <div className="font-semibold text-slate-800 dark:text-slate-200">{langBData.info.name}</div>
            <div className="text-slate-500 dark:text-slate-400 line-clamp-1">{langBData.info.subTitle}</div>
          </div>
        </div>

        {/* Language 3 (C) (If 3 languages mode active) */}
        {isThreeLanguages && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-amber-200/80 dark:border-amber-800/60 p-4 shadow-sm relative transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Bahasa 3 (Titik C)
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {langCData.info.origin === 'survey' ? 'Survei Lapangan' : 'Korpus Terstandar'}
              </span>
            </div>

            <label htmlFor="select-lang-3" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Pilih Korpus / Survei Lapangan:
            </label>
            <div className="relative">
              <select
                id="select-lang-3"
                value={lang3Id}
                onChange={e => setLang3Id(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 text-sm font-semibold rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-colors cursor-pointer"
              >
                <optgroup label="📋 Formulir Survei Lapangan Tersimpan">
                  {surveys.map(s => (
                    <option key={`survey_${s.id}`} value={`survey_${s.id}`}>
                      {s.title} ({s.bahasa || 'Bahasa Belum Terisi'})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="📚 Korpus Bahasa Nusantara Terstandarisasi">
                  {COMPARATIVE_CORPUS_PRESETS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
              <div className="font-semibold text-slate-800 dark:text-slate-200">{langCData.info.name}</div>
              <div className="text-slate-500 dark:text-slate-400 line-clamp-1">{langCData.info.subTitle}</div>
            </div>
          </div>
        )}
      </div>

      {/* Primary Dialectometry Results Card */}
      <div id="dialectometry-results-panel" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Scale className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Perhitungan Dialektometri & Perbedaan Kualitatif
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Rumus Guiraud: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">d = (s / n) × 100%</span> (s = jumlah beda leksikal + beda fonem, n = glos terbandingkan).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold transition-colors"
              title="Unduh format spreadsheet CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Ekspor CSV
            </button>
            <button
              type="button"
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-300 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 text-xs font-semibold transition-colors"
              title="Unduh laporan lengkap format JSON"
            >
              <FileJson className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Laporan JSON
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
              title="Cetak laporan"
            >
              <Printer className="w-4 h-4" />
              Cetak
            </button>
          </div>
        </div>

        {/* Pair Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Dialectometry Index for Primary Pair (A - B) */}
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/20 rounded-xl border border-teal-200 dark:border-teal-800/60 p-4 relative">
            <div className="text-xs font-semibold text-teal-800 dark:text-teal-300 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Indeks Dialektometri (A ↔ B)</span>
              <span className="font-mono text-xs text-teal-700 dark:text-teal-400">{statsAB.totalCompared} glos</span>
            </div>
            <div className="flex items-baseline gap-2 my-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-teal-900 dark:text-teal-200 tracking-tight">
                {statsAB.dialectometryIndex}%
              </span>
              <span className="text-xs font-medium text-teal-700 dark:text-teal-400">
                ({statsAB.lexicalCount + statsAB.phonemeCount} beda)
              </span>
            </div>
            <div className="mt-2">
              <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold border ${statsAB.badgeColor}`}>
                {statsAB.status}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-teal-950/80 dark:text-teal-300/80 leading-relaxed">
              {statsAB.deskripsi}
            </p>
          </div>

          {/* Card 2: Beda Leksikal Breakdown */}
          <div className="bg-rose-50/70 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-800/60 p-4">
            <div className="text-xs font-semibold text-rose-800 dark:text-rose-300 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Perbedaan Leksikal (s_lek)</span>
              <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">{statsAB.lexicalPercent}%</span>
            </div>
            <div className="flex items-baseline gap-2 my-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-rose-900 dark:text-rose-200 tracking-tight">
                {statsAB.lexicalCount}
              </span>
              <span className="text-xs font-medium text-rose-700 dark:text-rose-400">kosakata</span>
            </div>
            <div className="w-full bg-rose-200/60 dark:bg-rose-900/40 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-rose-600 h-2 rounded-full"
                style={{ width: `${statsAB.lexicalPercent}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-rose-950/80 dark:text-rose-300/80 leading-relaxed">
              Kosakata dengan etimon/akar kata berbeda sama sekali (contoh: <em>cai</em> vs <em>banyu</em>).
            </p>
          </div>

          {/* Card 3: Beda Fonem Breakdown */}
          <div className="bg-amber-50/70 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/60 p-4">
            <div className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Perbedaan Fonem (s_fon)</span>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">{statsAB.phonemePercent}%</span>
            </div>
            <div className="flex items-baseline gap-2 my-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-amber-900 dark:text-amber-200 tracking-tight">
                {statsAB.phonemeCount}
              </span>
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">kosakata</span>
            </div>
            <div className="w-full bg-amber-200/60 dark:bg-amber-900/40 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-amber-500 h-2 rounded-full"
                style={{ width: `${statsAB.phonemePercent}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-amber-950/80 dark:text-amber-300/80 leading-relaxed">
              Kognat berkerabat dengan variasi 1-2 fonem/bunyi (contoh: <em>batu</em> vs <em>watu</em>, <em>hujan</em> vs <em>udan</em>).
            </p>
          </div>

          {/* Card 4: Kognat Identik / Sama */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800/60 p-4">
            <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Bentuk Sama / Identik</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{statsAB.samePercent}%</span>
            </div>
            <div className="flex items-baseline gap-2 my-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-900 dark:text-emerald-200 tracking-tight">
                {statsAB.sameCount}
              </span>
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">kosakata</span>
            </div>
            <div className="w-full bg-emerald-200/60 dark:bg-emerald-900/40 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-emerald-600 h-2 rounded-full"
                style={{ width: `${statsAB.samePercent}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-emerald-950/80 dark:text-emerald-300/80 leading-relaxed">
              Bentuk kata sama persis secara ortografis dan fonetis (contoh: <em>tulang</em>, <em>kuku</em>).
            </p>
          </div>
        </div>

        {/* Triangular Matrix for 3-Language Mode */}
        {isThreeLanguages && statsAC && statsBC && (
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Matriks Segitiga Dialektometri (Triangular Matrix) 3 Bahasa
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Membandingkan pasangan A-B, A-C, dan B-C secara simultan
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-200/80 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200">
                    <th className="p-2.5 border border-slate-300 dark:border-slate-700 font-bold">Pasangan Bahasa</th>
                    <th className="p-2.5 border border-slate-300 dark:border-slate-700 font-bold">Glos Diuji (n)</th>
                    <th className="p-2.5 border border-slate-300 dark:border-slate-700 font-bold text-rose-700 dark:text-rose-400">Beda Leksikal (s_lek)</th>
                    <th className="p-2.5 border border-slate-300 dark:border-slate-700 font-bold text-amber-700 dark:text-amber-400">Beda Fonem (s_fon)</th>
                    <th className="p-2.5 border border-slate-300 dark:border-slate-700 font-bold text-emerald-700 dark:text-emerald-400">Sama</th>
                    <th className="p-2.5 border border-slate-300 dark:border-slate-700 font-bold text-teal-800 dark:text-teal-300">Indeks Dialektometri (d%)</th>
                    <th className="p-2.5 border border-slate-300 dark:border-slate-700 font-bold">Status Hubungan Dialektologis</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Pair A - B */}
                  <tr className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900">
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200">
                      <span className="inline-block w-6 font-bold text-teal-600 dark:text-teal-400">A-B:</span>
                      {statsAB.lang1Name} <ArrowLeftRight className="w-3 h-3 inline mx-1 text-slate-400" /> {statsAB.lang2Name}
                    </td>
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700 font-mono text-center text-slate-800 dark:text-slate-200">{statsAB.totalCompared}</td>
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700 font-mono text-rose-700 dark:text-rose-400 font-bold">
                      {statsAB.lexicalCount} ({statsAB.lexicalPercent}%)
                    </td>
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700 font-mono text-amber-700 dark:text-amber-400 font-bold">
                      {statsAB.phonemeCount} ({statsAB.phonemePercent}%)
                    </td>
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700 font-mono text-emerald-700 dark:text-emerald-400">
                      {statsAB.sameCount} ({statsAB.samePercent}%)
                    </td>
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700 font-mono text-base font-extrabold text-teal-900 dark:text-teal-200">
                      {statsAB.dialectometryIndex}%
                    </td>
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${statsAB.badgeColor}`}>
                        {statsAB.status}
                      </span>
                    </td>
                  </tr>

                  {/* Pair A - C */}
                  <tr className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900">
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200">
                      <span className="inline-block w-6 font-bold text-indigo-600 dark:text-indigo-400">A-C:</span>
                      {statsAC.lang1Name} <ArrowLeftRight className="w-3 h-3 inline mx-1 text-slate-400" /> {statsAC.lang2Name}
                    </td>
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700 font-mono text-center text-slate-800 dark:text-slate-200">{statsAC.totalCompared}</td>
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700 font-mono text-rose-700 dark:text-rose-400 font-bold">
                      {statsAC.lexicalCount} ({statsAC.lexicalPercent}%)
                    </td>
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700 font-mono text-amber-700 dark:text-amber-400 font-bold">
                      {statsAC.phonemeCount} ({statsAC.phonemePercent}%)
                    </td>
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700 font-mono text-emerald-700 dark:text-emerald-400">
                      {statsAC.sameCount} ({statsAC.samePercent}%)
                    </td>
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700 font-mono text-base font-extrabold text-indigo-900 dark:text-indigo-200">
                      {statsAC.dialectometryIndex}%
                    </td>
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${statsAC.badgeColor}`}>
                        {statsAC.status}
                      </span>
                    </td>
                  </tr>

                  {/* Pair B - C */}
                  <tr className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900">
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200">
                      <span className="inline-block w-6 font-bold text-amber-600 dark:text-amber-400">B-C:</span>
                      {statsBC.lang1Name} <ArrowLeftRight className="w-3 h-3 inline mx-1 text-slate-400" /> {statsBC.lang2Name}
                    </td>
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700 font-mono text-center text-slate-800 dark:text-slate-200">{statsBC.totalCompared}</td>
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700 font-mono text-rose-700 dark:text-rose-400 font-bold">
                      {statsBC.lexicalCount} ({statsBC.lexicalPercent}%)
                    </td>
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700 font-mono text-amber-700 dark:text-amber-400 font-bold">
                      {statsBC.phonemeCount} ({statsBC.phonemePercent}%)
                    </td>
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700 font-mono text-emerald-700 dark:text-emerald-400">
                      {statsBC.sameCount} ({statsBC.samePercent}%)
                    </td>
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700 font-mono text-base font-extrabold text-amber-900 dark:text-amber-200">
                      {statsBC.dialectometryIndex}%
                    </td>
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${statsBC.badgeColor}`}>
                        {statsBC.status}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Visual Composition Spectrum */}
        <div>
          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1.5">
            <span>Komposisi Kesamaan & Perbedaan:</span>
            <span>{counts.total} Total Glos Swadesh</span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-700 shadow-inner">
            <div
              style={{ width: `${(counts.lek / counts.total) * 100}%` }}
              className="bg-rose-500 transition-all"
              title={`Beda Leksikal: ${counts.lek}`}
            />
            <div
              style={{ width: `${(counts.fon / counts.total) * 100}%` }}
              className="bg-amber-500 transition-all"
              title={`Beda Fonem: ${counts.fon}`}
            />
            <div
              style={{ width: `${(counts.sam / counts.total) * 100}%` }}
              className="bg-emerald-500 transition-all"
              title={`Sama Identik: ${counts.sam}`}
            />
            <div
              style={{ width: `${(counts.kos / counts.total) * 100}%` }}
              className="bg-slate-300 dark:bg-slate-600 transition-all"
              title={`Kosong / Belum Terisi: ${counts.kos}`}
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 mt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
              Beda Leksikal ({counts.lek})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />
              Beda Fonem ({counts.fon})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
              Sama Identik ({counts.sam})
            </span>
            {counts.kos > 0 && (
              <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                <span className="w-3 h-3 rounded-sm bg-slate-300 dark:bg-slate-600 inline-block" />
                Belum Terisi ({counts.kos})
              </span>
            )}
            {counts.ovr > 0 && (
              <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 font-bold ml-auto">
                <Sparkles className="w-3 h-3" />
                {counts.ovr} disesuaikan manual
                <button
                  type="button"
                  onClick={handleResetAllOverrides}
                  className="text-xs underline hover:text-indigo-900 dark:hover:text-indigo-300 ml-1 font-normal"
                >
                  (Reset)
                </button>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Vocabulary Comparison Table with Search & Interactive Overrides */}
      <div id="vocabulary-comparison-table-section" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                Daftar Glos & Kategorisasi Kosakata (Beda Fonem / Leksikal)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Klik label kategori pada baris tabel untuk mengubah (override) klasifikasi secara manual sesuai konteks lapangan.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="search-glos-input"
                placeholder="Cari glos atau kata daerah..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Filter:
            </span>
            <button
              type="button"
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                categoryFilter === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Semua ({counts.total})
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('BEDA_LEKSIKAL')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                categoryFilter === 'BEDA_LEKSIKAL'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50'
              }`}
            >
              Beda Leksikal ({counts.lek})
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('BEDA_FONEM')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                categoryFilter === 'BEDA_FONEM'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50'
              }`}
            >
              Beda Fonem ({counts.fon})
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('SAMA')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                categoryFilter === 'SAMA'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
              }`}
            >
              Sama Identik ({counts.sam})
            </button>
            {counts.ovr > 0 && (
              <button
                type="button"
                onClick={() => setCategoryFilter('OVERRIDDEN')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  categoryFilter === 'OVERRIDDEN'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-300 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                }`}
              >
                Penyesuaian Manual ({counts.ovr})
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-slate-100/90 dark:bg-slate-800/95 sticky top-0 z-10 border-b border-slate-300 dark:border-slate-700 shadow-sm backdrop-blur">
              <tr className="text-slate-700 dark:text-slate-200">
                <th className="p-3 font-bold w-12 text-center">No</th>
                <th className="p-3 font-bold w-36">Glos Indonesia</th>
                <th className="p-3 font-bold bg-teal-50/80 dark:bg-teal-950/40 text-teal-950 dark:text-teal-200 border-x border-teal-200 dark:border-teal-800">
                  {langAData.info.name}
                </th>
                <th className="p-3 font-bold bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 border-r border-indigo-200 dark:border-indigo-800">
                  {langBData.info.name}
                </th>
                {isThreeLanguages && (
                  <th className="p-3 font-bold bg-amber-50/80 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 border-r border-amber-200 dark:border-amber-800">
                    {langCData.info.name}
                  </th>
                )}
                <th className="p-3 font-bold w-44">Kategori Beda</th>
                <th className="p-3 font-bold">Analisis Fonologis / Etimon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={isThreeLanguages ? 7 : 6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    Tidak ditemukan kosakata yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  return (
                    <tr
                      key={`glos_${item.id}`}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      {/* No */}
                      <td className="p-3 text-center font-mono text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        {item.id}
                      </td>

                      {/* Glos Indonesia */}
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                        {item.glosIndonesia}
                      </td>

                      {/* Bahasa A */}
                      <td className="p-3 bg-teal-50/30 dark:bg-teal-950/20 border-x border-teal-100 dark:border-teal-900/40">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {item.langA.bentuk || <span className="text-slate-400 dark:text-slate-500 italic">Kosong</span>}
                        </div>
                        {item.langA.ipa && (
                          <div className="font-mono text-xs text-teal-700 dark:text-teal-400 mt-0.5">
                            {item.langA.ipa}
                          </div>
                        )}
                      </td>

                      {/* Bahasa B */}
                      <td className="p-3 bg-indigo-50/30 dark:bg-indigo-950/20 border-r border-indigo-100 dark:border-indigo-900/40">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {item.langB.bentuk || <span className="text-slate-400 dark:text-slate-500 italic">Kosong</span>}
                        </div>
                        {item.langB.ipa && (
                          <div className="font-mono text-xs text-indigo-700 dark:text-indigo-400 mt-0.5">
                            {item.langB.ipa}
                          </div>
                        )}
                      </td>

                      {/* Bahasa C */}
                      {isThreeLanguages && item.langC && (
                        <td className="p-3 bg-amber-50/30 dark:bg-amber-950/20 border-r border-amber-100 dark:border-amber-900/40">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {item.langC.bentuk || <span className="text-slate-400 dark:text-slate-500 italic">Kosong</span>}
                          </div>
                          {item.langC.ipa && (
                            <div className="font-mono text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                              {item.langC.ipa}
                            </div>
                          )}
                        </td>
                      )}

                      {/* Interactive Categorization with Override Selector */}
                      <td className="p-3">
                        <div className="relative inline-block w-full">
                          <select
                            value={item.category}
                            onChange={e => handleOverrideCategory(item.id, e.target.value as DifferenceCategory)}
                            className={`w-full text-xs font-bold px-2.5 py-1.5 rounded-lg border appearance-none cursor-pointer focus:outline-none focus:ring-2 pr-6 transition-all ${
                              item.category === 'BEDA_LEKSIKAL'
                                ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800 focus:ring-rose-500'
                                : item.category === 'BEDA_FONEM'
                                ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800 focus:ring-amber-500'
                                : item.category === 'SAMA'
                                ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800 focus:ring-emerald-500'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 focus:ring-slate-500'
                            }`}
                          >
                            <option value="BEDA_LEKSIKAL">🔴 Beda Leksikal</option>
                            <option value="BEDA_FONEM">🟡 Beda Fonem</option>
                            <option value="SAMA">🟢 Sama (Identik)</option>
                            <option value="BELUM_DIISI">⚪ Belum Diisi</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {item.isOverridden && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.2 rounded border border-indigo-200 dark:border-indigo-800">
                              Manual
                            </span>
                            <button
                              type="button"
                              onClick={() => handleResetSingleOverride(item.id)}
                              className="text-[10px] text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline"
                              title="Kembalikan ke analisis otomatis"
                            >
                              Reset
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Phonological / Etymon Notes */}
                      <td className="p-3 text-xs text-slate-600 dark:text-slate-300">
                        <span className="leading-snug">{item.phonologicalNote}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary Bar */}
        <div className="p-4 bg-slate-100/70 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 dark:text-slate-400 gap-3">
          <span>
            Menampilkan <strong className="text-slate-800 dark:text-slate-200">{filteredItems.length}</strong> dari <strong className="text-slate-800 dark:text-slate-200">{comparisonItems.length}</strong> glos kosakata Swadesh.
          </span>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
              <Info className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Perbedaan fonem mengindikasikan kognat; perbedaan leksikal mengindikasikan inovasi etimon.
            </span>
          </div>
        </div>
      </div>
    </>
  )}
</div>
  );
};
