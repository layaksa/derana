import React, { useState, useMemo } from 'react';
import { 
  Hourglass, 
  Calendar, 
  GitBranch, 
  Layers, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  HelpCircle, 
  BookOpen, 
  Info, 
  CheckCircle2, 
  Sliders, 
  TrendingUp, 
  Compass, 
  FileSpreadsheet,
  Download,
  Grid3X3,
  Check,
  Plus,
  X,
  Filter,
  Search
} from 'lucide-react';
import { 
  TitikPengamatan, 
  SituasiGeografis, 
  TitikPembandingDialektometri, 
  KosakataLengkapData, 
  SurveyRecord 
} from '../../types/linguistic';
import { 
  estimateGlottochronologyTimeDepth, 
  classifyLanguageRelationship, 
  PRESET_THRESHOLDS 
} from '../../utils/linguisticClassification';
import { 
  GlotokronologiHeatmap, 
  GlottoLanguageEntry 
} from './GlotokronologiHeatmap';
import { PhylogeneticTreeViewer } from './PhylogeneticTreeViewer';
import { 
  STANDARD_GLOTTO_LANGUAGES, 
  buildGlottochronologyMatrix 
} from '../../utils/glottochronologyMatrix';
import { LanguageLeafItem } from '../../utils/phylogeneticTreeEngine';

interface Section16GlotokronologiProps {
  titikPengamatan: TitikPengamatan;
  situasiGeografis: SituasiGeografis;
  titikPembandingList: TitikPembandingDialektometri[];
  kosakataLengkap?: KosakataLengkapData;
  allSurveys?: SurveyRecord[];
  onSelectPoint?: (id: string) => void;
}

export const Section16Glotokronologi: React.FC<Section16GlotokronologiProps> = ({
  titikPengamatan,
  situasiGeografis,
  titikPembandingList,
  kosakataLengkap,
  allSurveys,
  onSelectPoint
}) => {
  // Active sub-tab in Glotokronologi: 'heatmap' | 'pohon_filogenetik' | 'timeline' | 'simulator'
  const [activeGlottoTab, setActiveGlottoTab] = useState<'heatmap' | 'pohon_filogenetik' | 'timeline' | 'simulator'>('heatmap');

  // Selected languages for Glottochronology analysis
  const [selectedLanguageIds, setSelectedLanguageIds] = useState<string[]>([
    'sunda',
    'jawa',
    'madura',
    'bali',
    'sasak',
    'melayu',
    'minangkabau'
  ]);

  // Language filter search
  const [langSearchQuery, setLangSearchQuery] = useState('');

  // Interactive Simulator Cognate Retention Slider
  const [customCognateRate, setCustomCognateRate] = useState<number>(75);
  const [swadeshListSize, setSwadeshListSize] = useState<200 | 100>(200);

  // Retention constant: r = 0.805 for 200 words (Swadesh), or 0.860 for 100 words
  const retentionConstant = swadeshListSize === 200 ? 0.805 : 0.860;

  // Build full repository of all available selectable languages
  const availableLanguages: GlottoLanguageEntry[] = useMemo(() => {
    const list: GlottoLanguageEntry[] = [];

    // Add current active survey reference point if available
    const activeName = titikPengamatan.bahasaDigunakan || `Bahasa Desa ${titikPengamatan.namaDesa || 'Acuan'}`;
    list.push({
      id: 'active_survey_point',
      name: `${activeName} (Survei Acuan)`,
      code: 'tp-ref',
      region: `${titikPengamatan.namaDesa || 'Desa Acuan'}, ${situasiGeografis.letakPantai || 'Jawa Barat'}`,
      family: 'Melayu-Polinesia Barat',
      isSurveyed: true,
      persentaseBeda: 0,
      kognatPersen: 100,
      divergenceYears: 0
    });

    // Add comparison points from active survey instrument (TP-02, TP-03, dst)
    (titikPembandingList || []).forEach(tp => {
      const tpDiff = Math.max(0, Math.min(100, Number(tp.persentaseBeda) || 20));
      const tpName = tp.namaTitik || `TP-${tp.id}`;
      const tpDesa = tp.desa || 'Titik Pembanding';
      const tpBahasa = tp.bahasa || 'Dialek Pembanding';
      const timeEst = estimateGlottochronologyTimeDepth(tpDiff);
      list.push({
        id: `tp_pembanding_${tp.id}`,
        name: `${tpName}: ${tpDesa} (${tpBahasa})`,
        code: tp.id,
        region: `${tpDesa}, ${titikPengamatan.provinsi || 'Jawa Barat'}`,
        family: 'Austronesia Lapangan',
        isSurveyed: true,
        persentaseBeda: tpDiff,
        kognatPersen: Math.round((100 - tpDiff) * 10) / 10,
        divergenceYears: timeEst.tahun
      });
    });

    // Add all other surveys from database
    (allSurveys || []).forEach(s => {
      const langName = s.bahasa || s.data?.titikPengamatan?.bahasaDigunakan || 'Bahasa Daerah';
      const desaName = s.desa || s.data?.titikPengamatan?.namaDesa || s.title;
      const prov = s.provinsi || s.data?.titikPengamatan?.provinsi || 'Jawa Barat';
      list.push({
        id: s.id,
        name: `${langName} (${desaName})`,
        code: `tp-${s.id.slice(0, 4)}`,
        region: `${desaName}, ${prov}`,
        family: 'Austronesia Lapangan',
        isSurveyed: true
      });
    });

    // Add standard benchmark Indonesian regional languages
    STANDARD_GLOTTO_LANGUAGES.forEach(std => {
      list.push(std);
    });

    return list;
  }, [titikPengamatan, situasiGeografis, titikPembandingList, allSurveys]);

  // Currently selected language entries
  const selectedLanguages: GlottoLanguageEntry[] = useMemo(() => {
    return availableLanguages.filter(lang => selectedLanguageIds.includes(lang.id));
  }, [availableLanguages, selectedLanguageIds]);

  // Build symmetric N x N distance matrix for selected languages
  const glottoDistanceMatrix = useMemo(() => {
    return buildGlottochronologyMatrix(selectedLanguages, allSurveys);
  }, [selectedLanguages, allSurveys]);

  // Phylogenetic tree leaves
  const phylogeneticLeaves: LanguageLeafItem[] = useMemo(() => {
    return selectedLanguages.map((lang, idx) => ({
      id: lang.id,
      name: lang.name,
      language: lang.name,
      province: lang.region,
      persentaseBeda: lang.persentaseBeda,
      kognatPersen: lang.kognatPersen,
      divergenceYears: lang.divergenceYears,
      isReference: lang.id === 'active_survey_point'
    }));
  }, [selectedLanguages]);

  // Toggle language selection
  const handleToggleLanguage = (id: string) => {
    setSelectedLanguageIds(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 2) return prev; // Keep at least 2 for pairwise comparison
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Preset Cohort Selectors
  const applyPresetCohort = (type: 'jawa_sunda' | 'bali_sasak' | 'melayik' | 'survey_only' | 'all_survey_points' | 'all_standard') => {
    if (type === 'all_survey_points') {
      const surveyIds = ['active_survey_point', ...(titikPembandingList || []).map(tp => `tp_pembanding_${tp.id}`)];
      if (surveyIds.length >= 2) {
        setSelectedLanguageIds(surveyIds);
      } else {
        setSelectedLanguageIds(['active_survey_point', 'sunda', 'jawa']);
      }
    } else if (type === 'jawa_sunda') {
      setSelectedLanguageIds(['sunda', 'jawa', 'madura', 'betawi']);
    } else if (type === 'bali_sasak') {
      setSelectedLanguageIds(['sunda', 'jawa', 'bali', 'sasak']);
    } else if (type === 'melayik') {
      setSelectedLanguageIds(['melayu', 'minangkabau', 'banjar', 'betawi', 'aceh']);
    } else if (type === 'survey_only') {
      const surveyIds = availableLanguages.filter(l => l.isSurveyed).map(l => l.id);
      if (surveyIds.length >= 2) {
        setSelectedLanguageIds(surveyIds);
      } else {
        setSelectedLanguageIds(['active_survey_point', 'sunda', 'jawa']);
      }
    } else if (type === 'all_standard') {
      setSelectedLanguageIds(STANDARD_GLOTTO_LANGUAGES.map(l => l.id));
    }
  };

  // Calculate dynamic simulator results
  const simulatorResult = useMemo(() => {
    const C = Math.max(0.01, Math.min(0.999, customCognateRate / 100));
    const persentaseBeda = 100 - customCognateRate;
    const logC = Math.log(C);
    const twoLogR = 2 * Math.log(retentionConstant);
    const timeInMillennia = logC / twoLogR;
    const timeInYears = Math.max(0, Math.round(timeInMillennia * 1000));
    const currentYear = new Date().getFullYear();
    const separationYear = currentYear - timeInYears;

    const classification = classifyLanguageRelationship(persentaseBeda, PRESET_THRESHOLDS.badan_bahasa);
    const timeDepth = estimateGlottochronologyTimeDepth(persentaseBeda);

    return {
      persentaseBeda,
      kognatPersen: customCognateRate,
      waktuTahun: timeInYears,
      abad: timeDepth.abad,
      tahunPisahMasehi: separationYear > 0 ? `${separationYear} M` : `${Math.abs(separationYear)} SM`,
      kategori: classification.kategori,
      badgeClass: classification.badgeClass,
      mutualIntelligibility: classification.mutualIntelligibility,
      deskripsi: classification.deskripsi,
      statusKekerabatan: classification.statusKekerabatan
    };
  }, [customCognateRate, retentionConstant]);

  // Compute glottochronology for all comparison points
  const pointsWithGlotto = useMemo(() => {
    return titikPembandingList.map(tp => {
      const beda = tp.persentaseBeda || 0;
      const kognat = Math.max(0, 100 - beda);
      const timeDepth = estimateGlottochronologyTimeDepth(beda);
      const currentYear = new Date().getFullYear();
      const separationYear = currentYear - timeDepth.tahun;

      return {
        ...tp,
        persentaseKognat: kognat,
        kedalamanTahun: timeDepth.tahun,
        kedalamanAbad: timeDepth.abad,
        keteranganWaktu: timeDepth.keterangan,
        tahunPisah: separationYear > 0 ? `${separationYear} M` : `${Math.abs(separationYear)} SM`
      };
    }).sort((a, b) => a.kedalamanTahun - b.kedalamanTahun);
  }, [titikPembandingList]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Bahasa A', 'Bahasa B', 'Perubahan Leksikal (%)', 'Kognat Swadesh (%)', 'Kedalaman Waktu (Tahun)', 'Estimasi Abad'];
    const rows: string[][] = [];

    for (let i = 0; i < selectedLanguages.length; i++) {
      for (let j = i + 1; j < selectedLanguages.length; j++) {
        const d = glottoDistanceMatrix[i][j];
        const t = estimateGlottochronologyTimeDepth(d);
        rows.push([
          `"${selectedLanguages[i].name}"`,
          `"${selectedLanguages[j].name}"`,
          d.toFixed(1),
          (100 - d).toFixed(1),
          t.tahun.toString(),
          `"${t.abad}"`
        ]);
      }
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Glotokronologi_Heatmap_Leksikal_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. TEORI & FORMULA HEADER */}
      <div className="mt-[10px] bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5">
                <Hourglass className="w-3.5 h-3.5 text-amber-600" />
                Leksikostatistik & Glotokronologi Maurice Swadesh
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Titik Acuan: <strong>Desa {titikPengamatan.namaDesa || 'Acuan'}</strong> ({titikPengamatan.bahasaDigunakan || 'Bahasa Acuan'})
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Estimasi Kedalaman Waktu Pisah (*Time Depth*) Bahasa & Filogenetika
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              Metode glotokronologi mengestimasi usia perpisahan dua varian bahasa atau dialek dari satu bahasa purba (*proto-language*) 
              berdasarkan persentase kognat kosakata dasar Swadesh dengan konstanta retensi leksikal baku.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-600" />
              <span>Ekspor Matriks (CSV)</span>
            </button>
          </div>
        </div>

        {/* Mathematical Formula Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-5 mt-5 border-t border-amber-200/60 dark:border-amber-900/40">
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-1">
              Rumus Kedalaman Waktu (t)
            </div>
            <div className="font-mono text-base font-bold text-slate-900 dark:text-white my-1">
              t = ln(C) / (2 × ln(r))
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">C</span>: Persentase kognat, <span className="font-semibold text-slate-700 dark:text-slate-300">r</span>: Konstanta retensi ({retentionConstant} / milenium).
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="text-[11px] font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider mb-1">
              Konstanta Retensi Swadesh (r)
            </div>
            <div className="font-mono text-base font-bold text-blue-600 dark:text-sky-400 my-1">
              r = {retentionConstant} (±1,5%)
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Daftar Swadesh 200 kosakata baku mempertahankan 80,5% bentuk kognat setiap 1.000 tahun divergensi alami.
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1">
              Ambang Kekerabatan Kronologis
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 my-1">
              &lt; 500 th: Dialek • 500–2.500 th: Bahasa • &gt; 2.500 th: Rumpun
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Sinkronisasi dengan taksonomi Keraf (1984) &amp; standar dialektologi Badan Bahasa RI.
            </div>
          </div>
        </div>
      </div>

      {/* 2. PILIHAN BAHASA YANG INGIN DIKETAHUI DI BAGIAN GLOTOKRONOLOGI */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-amber-600" />
              <span>Pilihan Bahasa yang Ingin Diketahui di Bagian Glotokronologi</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                {selectedLanguageIds.length} Terpilih
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pilih bahasa daerah atau titik survei yang ingin dihitung matriks perubahan leksikal, heatmap, dan pohon kekerabatannya.
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] text-slate-400 font-semibold mr-1">Grup Cepat:</span>
            <button
              type="button"
              onClick={() => applyPresetCohort('all_survey_points')}
              className="px-2.5 py-1 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] cursor-pointer shadow-2xs"
            >
              Titik Acuan & Pembanding
            </button>
            <button
              type="button"
              onClick={() => applyPresetCohort('jawa_sunda')}
              className="px-2.5 py-1 rounded-lg font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] cursor-pointer"
            >
              Jawa-Sunda-Madura
            </button>
            <button
              type="button"
              onClick={() => applyPresetCohort('bali_sasak')}
              className="px-2.5 py-1 rounded-lg font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] cursor-pointer"
            >
              Bali-Sasak
            </button>
            <button
              type="button"
              onClick={() => applyPresetCohort('melayik')}
              className="px-2.5 py-1 rounded-lg font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] cursor-pointer"
            >
              Rumpun Melayik
            </button>
            <button
              type="button"
              onClick={() => applyPresetCohort('survey_only')}
              className="px-2.5 py-1 rounded-lg font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[11px] cursor-pointer"
            >
              Titik Survei Lapangan
            </button>
            <button
              type="button"
              onClick={() => applyPresetCohort('all_standard')}
              className="px-2.5 py-1 rounded-lg font-semibold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[11px] cursor-pointer"
            >
              Semua Rumpun
            </button>
          </div>
        </div>

        {/* Language Selection Chips */}
        <div className="flex flex-wrap gap-2 pt-1 max-h-44 overflow-y-auto pr-1">
          {availableLanguages.map((lang) => {
            const isSelected = selectedLanguageIds.includes(lang.id);
            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => handleToggleLanguage(lang.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-white border-amber-600 shadow-2xs ring-1 ring-amber-400/40'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                {isSelected ? (
                  <Check className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <Plus className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                )}
                <span>{lang.name}</span>
                {lang.isSurveyed && (
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                    isSelected ? 'bg-amber-600 text-amber-100' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-sky-300'
                  }`}>
                    Survei
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. GLOTTOCHRONOLOGY SUBTAB NAVIGATION BAR */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveGlottoTab('heatmap')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeGlottoTab === 'heatmap'
              ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-2xs ring-1 ring-amber-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Grid3X3 className="w-4 h-4 text-amber-600" />
          <span>Heatmap Perubahan Leksikal</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveGlottoTab('pohon_filogenetik')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeGlottoTab === 'pohon_filogenetik'
              ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-2xs ring-1 ring-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <GitBranch className="w-4 h-4 text-indigo-600" />
          <span>Pohon Filogenetik Kekerabatan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveGlottoTab('timeline')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeGlottoTab === 'timeline'
              ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Clock className="w-4 h-4 text-blue-600" />
          <span>Garis Waktu Divergensi & Titik Pembanding</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveGlottoTab('simulator')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeGlottoTab === 'simulator'
              ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4 text-emerald-600" />
          <span>Kalkulator Simulasi Swadesh</span>
        </button>
      </div>

      {/* 4. CONDITIONAL SUBTAB VIEWS */}
      
      {/* TAB A: HEATMAP PERUBAHAN LEKSIKAL */}
      {activeGlottoTab === 'heatmap' && (
        <GlotokronologiHeatmap
          languages={selectedLanguages}
          matrix={glottoDistanceMatrix}
          allSurveys={allSurveys}
        />
      )}

      {/* TAB B: POHON FILOGENETIK KEKERABATAN */}
      {activeGlottoTab === 'pohon_filogenetik' && (
        <PhylogeneticTreeViewer
          leaves={phylogeneticLeaves}
          distanceMatrix={glottoDistanceMatrix}
          title="Pohon Kekerabatan Filogenetik Bahasa Nusantara"
          subtitle={`Rekonstruksi pohon silsilah ${selectedLanguages.length} varian bahasa berdasarkan matriks perbedaan leksikal Swadesh (Algoritma UPGMA).`}
        />
      )}

      {/* TAB C: GARIS WAKTU HISTORIS DIVERGENSI */}
      {activeGlottoTab === 'timeline' && (
        <div className="space-y-6">
          {/* Table of comparison points */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Tabel Kedalaman Waktu Titik Pembanding Terhadap Titik Acuan
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Urutan kronologis pemisahan titik pengamatan ({pointsWithGlotto.length} titik pembanding terdaftar).
                </p>
              </div>

              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Titik Acuan: <strong>{titikPengamatan.namaDesa || 'Titik Utama'}</strong>
              </span>
            </div>

            {pointsWithGlotto.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500">
                Belum ada titik pembanding yang terdaftar. Tambahkan titik pembanding pada instrumen untuk menghitung glotokronologi.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Titik Pembanding</th>
                      <th className="py-2.5 px-3">Wilayah / Desa</th>
                      <th className="py-2.5 px-3 text-right">Kognat (C%)</th>
                      <th className="py-2.5 px-3 text-right">Beda (d%)</th>
                      <th className="py-2.5 px-3 text-right">Kedalaman Waktu</th>
                      <th className="py-2.5 px-3 text-center">Tarikh Pisah</th>
                      <th className="py-2.5 px-3">Klasifikasi Kekerabatan</th>
                      <th className="py-2.5 px-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-200">
                    {pointsWithGlotto.map((pt, idx) => (
                      <tr 
                        key={pt.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-mono text-[10px] font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">{pt.namaTitik || pt.id}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{pt.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold block">{pt.desa}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">{pt.bahasa || 'Bahasa Daerah'}</span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {pt.persentaseKognat.toFixed(1)}%
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                          {(pt.persentaseBeda || 0).toFixed(1)}%
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="font-mono font-bold text-slate-900 dark:text-white block">
                            {pt.kedalamanTahun.toLocaleString()} tahun
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {pt.kedalamanAbad}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                            {pt.tahunPisah}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            {pt.statusHubungan || 'Beda Subdialek'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {onSelectPoint && (
                            <button
                              type="button"
                              onClick={() => onSelectPoint(pt.id)}
                              className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-sky-300 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Detail
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Timeline Divergence Tree */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-purple-600" />
              Pohon Kronologi Divergensi Historis (Skala Garis Waktu)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visualisasi relatif garis waktu percabangan leksikal dari titik acuan berdasarkan estimasi glotokronologi.
            </p>

            <div className="relative pl-6 sm:pl-8 border-l-2 border-amber-300 dark:border-amber-800 space-y-6 my-4 py-2">
              <div className="relative">
                <span className="absolute -left-[31px] sm:-left-[39px] top-1 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-950" />
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                  <span className="text-[10px] font-bold uppercase text-blue-700 dark:text-sky-300 tracking-wider">Masa Kini (Era Kontemporer)</span>
                  <h5 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                    Desa {titikPengamatan.namaDesa || 'Titik Acuan'} ({titikPengamatan.bahasaDigunakan || 'Bahasa Utama'})
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Titik referensi pemetaan dialektometri aktif (0 tahun divergensi).
                  </p>
                </div>
              </div>

              {pointsWithGlotto.map((pt) => (
                <div key={pt.id} className="relative">
                  <span className="absolute -left-[31px] sm:-left-[39px] top-1 w-4 h-4 rounded-full bg-amber-500 ring-4 ring-amber-100 dark:ring-amber-950" />
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Desa {pt.desa} ({pt.bahasa || 'Bahasa Daerah'})
                      </span>
                      <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400">
                        ± {pt.kedalamanTahun.toLocaleString()} tahun lalu ({pt.tahunPisah})
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {pt.keteranganWaktu} — Kognat Swadesh: <strong className="text-slate-700 dark:text-slate-300">{pt.persentaseKognat.toFixed(1)}%</strong>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB D: KALKULATOR SIMULASI SWADESH */}
      {activeGlottoTab === 'simulator' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                Kalkulator Simulasi Waktu Pisah Dinamis
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Geser persentase kognat atau perbedaan untuk menghitung usia perpisahan bahasa secara instan.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Daftar Swadesh:</span>
              <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setSwadeshListSize(200)}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    swadeshListSize === 200 ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  200 Kata (r=0.805)
                </button>
                <button
                  type="button"
                  onClick={() => setSwadeshListSize(100)}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    swadeshListSize === 100 ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  100 Kata (r=0.860)
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Slider Input */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Persentase Kognat Serupa (C):</span>
              <span className="text-base font-black font-mono text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2.5 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800">
                {customCognateRate}% (Beda: {100 - customCognateRate}%)
              </span>
            </div>

            <input
              type="range"
              min="5"
              max="99"
              step="1"
              value={customCognateRate}
              onChange={(e) => setCustomCognateRate(Number(e.target.value))}
              className="w-full accent-amber-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>5% (Purba / Rumpun Jauh)</span>
              <span>50% (Batas Bahasa)</span>
              <span>81% (Subdialek)</span>
              <span>99% (Identik / Modern)</span>
            </div>
          </div>

          {/* Result Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-medium">Estimasi Waktu Pisah</span>
              <span className="text-xl font-black font-mono text-slate-900 dark:text-white mt-1 block">
                {simulatorResult.waktuTahun.toLocaleString()} thn
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">{simulatorResult.abad}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-medium">Perkiraan Tarikh</span>
              <span className="text-xl font-black font-mono text-amber-700 dark:text-amber-400 mt-1 block">
                {simulatorResult.tahunPisahMasehi}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Dari tahun {new Date().getFullYear()}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-medium">Klasifikasi Kekerabatan</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">
                {simulatorResult.statusKekerabatan}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">{simulatorResult.kategori}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-medium">Keterpahaman</span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 block line-clamp-2">
                {simulatorResult.mutualIntelligibility}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
