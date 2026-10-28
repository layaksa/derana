import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  ArrowLeftRight, 
  RefreshCw, 
  Download, 
  Copy, 
  Check, 
  Search, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  Info,
  SlidersHorizontal,
  ChevronDown,
  TrendingDown,
  TrendingUp,
  Percent,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { 
  SurveyRecord, 
  KosakataLengkapData, 
  TitikPembandingDialektometri, 
  TitikPengamatan 
} from '../../types/linguistic';
import { 
  calculateLevenshteinBetweenSurveys, 
  exportLevenshteinComparisonToCSV, 
  LevenshteinSurveyComparisonResult,
  LevenshteinWordComparison
} from '../../utils/levenshteinDialectometry';
import { COMPARATIVE_CORPUS_PRESETS } from '../../data/comparativeCorpus';

interface LevenshteinSurveyCalculatorProps {
  allSurveys?: SurveyRecord[];
  activeSurveyId?: string | null;
  activeKosakata?: KosakataLengkapData;
  titikPengamatan?: TitikPengamatan;
  titikPembandingList?: TitikPembandingDialektometri[];
  onUpdateTitikPembanding?: (list: TitikPembandingDialektometri[]) => void;
  onNavigateToPointComparison?: () => void;
  onNavigateToHeatmap?: () => void;
}

export const LevenshteinSurveyCalculator: React.FC<LevenshteinSurveyCalculatorProps> = ({
  allSurveys = [],
  activeSurveyId,
  activeKosakata,
  titikPengamatan,
  titikPembandingList = [],
  onUpdateTitikPembanding,
  onNavigateToPointComparison,
  onNavigateToHeatmap
}) => {
  // Survey options list
  const surveyOptions = useMemo(() => {
    const list: Array<{ id: string; label: string; subLabel: string; type: 'active' | 'survey' | 'tp' | 'preset' }> = [];

    // 1. Active survey (TP-01 / Reference)
    const activeDesa = titikPengamatan?.namaDesa || 'Desa Acuan';
    const activeBahasa = titikPengamatan?.bahasaDigunakan || 'Bahasa Titik Ini';
    list.push({
      id: 'TP-REF',
      label: `TP-01 ${activeDesa} (Survei Aktif)`,
      subLabel: `${activeBahasa} • Acuan Lapangan`,
      type: 'active'
    });

    // 2. Other saved surveys from database
    allSurveys.forEach(s => {
      if (s.id !== activeSurveyId) {
        const desa = s.desa || s.data?.titikPengamatan?.namaDesa || s.title || 'Survei Lapangan';
        const bahasa = s.bahasa || s.data?.titikPengamatan?.bahasaDigunakan || 'Bahasa Daerah';
        const prov = s.provinsi || s.data?.titikPengamatan?.provinsi || 'Wilayah Survei';
        list.push({
          id: s.id,
          label: `Survei ${desa} (${desa})`,
          subLabel: `${bahasa} • ${prov}`,
          type: 'survey'
        });
      }
    });

    // 3. Registered comparison points in dialectometry
    titikPembandingList.forEach(tp => {
      // Avoid duplicate if already covered by survey ID
      if (!list.some(item => item.id === tp.id)) {
        list.push({
          id: tp.id,
          label: tp.namaTitik || `TP ${tp.desa}`,
          subLabel: `${tp.desa} • ${tp.bahasa}`,
          type: 'tp'
        });
      }
    });

    // 4. Comparative corpus presets (Sunda Priangan, Jawa Banyumasan, Jawa Wetanan)
    COMPARATIVE_CORPUS_PRESETS.forEach(cp => {
      list.push({
        id: cp.id,
        label: `[Korpus] ${cp.name}`,
        subLabel: cp.region,
        type: 'preset'
      });
    });

    return list;
  }, [allSurveys, activeSurveyId, titikPengamatan, titikPembandingList]);

  // Selected survey IDs (Default: Survey 1 = TP-REF, Survey 2 = First other survey or TP-02)
  const defaultSurvey2Id = useMemo(() => {
    const otherSurvey = allSurveys.find(s => s.id !== activeSurveyId);
    if (otherSurvey) return otherSurvey.id;
    if (titikPembandingList.length > 0) return titikPembandingList[0].id;
    return 'TP-02';
  }, [allSurveys, activeSurveyId, titikPembandingList]);

  const [survey1Id, setSurvey1Id] = useState<string>('TP-REF');
  const [survey2Id, setSurvey2Id] = useState<string>(defaultSurvey2Id);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'different' | 'identical' | 'cognate_close' | 'lexical_diff'>('all');
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Swap survey 1 and survey 2
  const handleSwap = () => {
    const temp = survey1Id;
    setSurvey1Id(survey2Id);
    setSurvey2Id(temp);
  };

  // Perform automatic Levenshtein calculation
  const result: LevenshteinSurveyComparisonResult = useMemo(() => {
    return calculateLevenshteinBetweenSurveys(
      survey1Id,
      survey2Id,
      allSurveys,
      activeSurveyId,
      activeKosakata,
      titikPembandingList
    );
  }, [survey1Id, survey2Id, allSurveys, activeSurveyId, activeKosakata, titikPembandingList]);

  // Filter word list based on category and search
  const filteredWords = useMemo(() => {
    return result.words.filter(w => {
      // Category filter
      if (filterType === 'different' && w.category === 'IDENTIK') return false;
      if (filterType === 'identical' && w.category !== 'IDENTIK') return false;
      if (filterType === 'cognate_close' && w.category !== 'KOGNAT_DEKAT') return false;
      if (filterType === 'lexical_diff' && w.category !== 'BEDA_LEKSIKAL') return false;

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchGlos = w.glosIndonesia.toLowerCase().includes(q);
        const matchW1 = w.bentuk1.toLowerCase().includes(q);
        const matchW2 = w.bentuk2.toLowerCase().includes(q);
        const matchOps = w.editOperations.toLowerCase().includes(q);
        if (!matchGlos && !matchW1 && !matchW2 && !matchOps) return false;
      }

      return true;
    });
  }, [result.words, filterType, searchQuery]);

  // Apply result directly into comparison points list in Dialectometry
  const handleApplyToTitikPembanding = () => {
    if (!onUpdateTitikPembanding) return;

    // Determine target TP ID
    const targetTp = titikPembandingList.find(t => 
      t.id === survey2Id || 
      t.desa.toLowerCase() === result.survey2Desa.toLowerCase() ||
      survey2Id.includes(t.desa)
    );

    if (targetTp) {
      const updated = titikPembandingList.map(tp => {
        if (tp.id === targetTp.id) {
          return {
            ...tp,
            jumlahBeda: Math.round(result.effectiveDifferenceCount),
            jumlahGlos: result.totalComparableGlos,
            persentaseBeda: result.lexicalDifferencePct,
            statusHubungan: result.guiterCategory
          };
        }
        return tp;
      });
      onUpdateTitikPembanding(updated);
      setSyncFeedback(`Berhasil menyinkronkan hasil Levenshtein ke titik pembanding ${targetTp.namaTitik} (${result.lexicalDifferencePct}% beda)!`);
    } else {
      // Add as new comparison point if not yet registered
      const newTp: TitikPembandingDialektometri = {
        id: `TP-${result.survey2Desa.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
        namaTitik: `TP ${result.survey2Desa}`,
        desa: result.survey2Desa,
        bahasa: result.survey2Bahasa,
        lintang: -7.0,
        bujur: 107.5,
        jumlahBeda: Math.round(result.effectiveDifferenceCount),
        jumlahGlos: result.totalComparableGlos,
        persentaseBeda: result.lexicalDifferencePct,
        statusHubungan: result.guiterCategory
      };
      onUpdateTitikPembanding([...titikPembandingList, newTp]);
      setSyncFeedback(`Titik baru "${newTp.namaTitik}" berhasil ditambahkan ke daftar pembanding dengan estimasi leksikal ${result.lexicalDifferencePct}%!`);
    }

    setTimeout(() => setSyncFeedback(null), 4500);
  };

  // Copy summary to clipboard
  const handleCopySummary = () => {
    const summaryText = [
      `=== HASIL ANALISIS JARAK LEVENSHTEIN DIALEKTOMETRI ===`,
      `Survei 1: ${result.survey1Name} (${result.survey1Desa})`,
      `Survei 2: ${result.survey2Name} (${result.survey2Desa})`,
      `----------------------------------------------------`,
      `Estimasi Perbedaan Leksikal: ${result.lexicalDifferencePct}%`,
      `Estimasi Kemiripan Leksikal : ${result.lexicalSimilarityPct}%`,
      `Rata-rata Jarak Levenshtein : ${result.meanLevenshteinDistance} edit karakter`,
      `Status Dialektometri Guiter : ${result.guiterCategory}`,
      `Total Glos Teruji           : ${result.totalComparableGlos} / 200`,
      `Bentuk Identik (d=0)        : ${result.countIdentical} kata`,
      `Kognat Dekat (d=1-2)        : ${result.countCloseCognate} kata`,
      `Kognat Jauh (sim 40-64%)    : ${result.countDistantCognate} kata`,
      `Beda Leksikal Penuh         : ${result.countFullDifference} kata`,
      `====================================================`
    ].join('\n');

    navigator.clipboard.writeText(summaryText);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER & CONTROL PANEL */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                Algoritma Levenshtein Otomatis
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Komputasi Instan
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Perhitungan Jarak Levenshtein Antar Dua Survei Swadesh
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Membandingkan 200 kosakata Swadesh secara berpasangan antara dua titik survei terpilih. Menghitung jarak edit karakter Levenshtein, mendeteksi variasi fonetis, dan memberikan estimasi persentase perbedaan leksikal (<em className="font-semibold text-slate-700 dark:text-slate-300">d%</em>) secara instan berstandar Guiter.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleApplyToTitikPembanding}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-colors cursor-pointer"
              title="Perbarui data titik pembanding dialektometri dengan hasil perhitungan ini"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Terapkan ke Titik Pembanding</span>
            </button>
            <button
              type="button"
              onClick={() => exportLevenshteinComparisonToCSV(result)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              {copiedNotification ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedNotification ? 'Tersalin!' : 'Salin Ringkasan'}</span>
            </button>
          </div>
        </div>

        {/* FEEDBACK BANNER */}
        {syncFeedback && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{syncFeedback}</span>
          </div>
        )}

        {/* 2. DUAL SURVEY SELECTOR */}
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center mt-5">
          {/* SURVEY 1 */}
          <div className="lg:col-span-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Titik Survei 1 (Acuan / Pembanding A)
            </label>
            <div className="relative">
              <select
                value={survey1Id}
                onChange={(e) => setSurvey1Id(e.target.value)}
                className="w-full text-xs font-semibold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg py-2.5 px-3 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all appearance-none cursor-pointer"
              >
                {surveyOptions.map((opt) => (
                  <option key={`s1-${opt.id}`} value={opt.id} disabled={opt.id === survey2Id}>
                    {opt.label} — {opt.subLabel}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <span>Desa: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{result.survey1Desa}</strong></span>
              <span>Bahasa: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{result.survey1Bahasa}</strong></span>
              <span>Terisi: <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{result.survey1FilledCount}/200</strong></span>
            </div>
          </div>

          {/* SWAP BUTTON */}
          <div className="lg:col-span-1 flex justify-center">
            <button
              type="button"
              onClick={handleSwap}
              className="p-3 rounded-full bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/80 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Tukar Posisi Survei 1 dan 2"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* SURVEY 2 */}
          <div className="lg:col-span-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Titik Survei 2 (Pembanding B / Lapangan)
            </label>
            <div className="relative">
              <select
                value={survey2Id}
                onChange={(e) => setSurvey2Id(e.target.value)}
                className="w-full text-xs font-semibold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg py-2.5 px-3 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all appearance-none cursor-pointer"
              >
                {surveyOptions.map((opt) => (
                  <option key={`s2-${opt.id}`} value={opt.id} disabled={opt.id === survey1Id}>
                    {opt.label} — {opt.subLabel}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <span>Desa: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{result.survey2Desa}</strong></span>
              <span>Bahasa: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{result.survey2Bahasa}</strong></span>
              <span>Terisi: <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{result.survey2FilledCount}/200</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. INSTANT DIALECTOMETRY RESULT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: ESTIMASI PERSENTASE PERBEDAAN LEKSIKAL */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Perbedaan Leksikal (d%)</span>
              <TrendingDown className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                {result.lexicalDifferencePct}%
              </span>
              <span className="text-xs text-slate-400">skor Guiter</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              Dihitung dari <strong className="text-slate-700 dark:text-slate-300 font-semibold">{result.effectiveDifferenceCount}</strong> poin beda efektif per {result.totalComparableGlos} glos teruji.
            </p>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
            <div 
              className={`h-full transition-all duration-700 ${
                result.lexicalDifferencePct > 80 ? 'bg-rose-500' :
                result.lexicalDifferencePct > 50 ? 'bg-amber-500' :
                result.lexicalDifferencePct > 20 ? 'bg-blue-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, result.lexicalDifferencePct)}%` }}
            />
          </div>
        </div>

        {/* CARD 2: KEMIRIPAN LEKSIKAL & RATA-RATA JARAK LEVENSHTEIN */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Kemiripan & Rata-rata Edit</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {result.lexicalSimilarityPct}%
              </span>
              <span className="text-xs text-slate-400">kognat leksikal</span>
            </div>
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span>Rerata Jarak Levenshtein:</span>
              <strong className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                {result.meanLevenshteinDistance} edit / kata
              </strong>
            </div>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${Math.min(100, result.lexicalSimilarityPct)}%` }}
            />
          </div>
        </div>

        {/* CARD 3: STATUS HUBUNGAN DIALEKTOMETRI */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between md:col-span-2">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Klasifikasi Geolinguistik (Badan Bahasa)</span>
              <Layers className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-lg text-sm font-bold border ${result.guiterBadgeColor}`}>
                {result.guiterCategory}
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                (Rentang Guiter {
                  result.lexicalDifferencePct > 80 ? '81% - 100%' :
                  result.lexicalDifferencePct > 50 ? '51% - 80%' :
                  result.lexicalDifferencePct > 20 ? '21% - 50%' : '0% - 20%'
                })
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {result.guiterDescription}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-[10px] mt-3">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
              <span className="block font-bold">{result.countIdentical}</span>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400">Identik (d=0)</span>
            </div>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300">
              <span className="block font-bold">{result.countCloseCognate}</span>
              <span className="text-[9px] text-blue-600 dark:text-blue-400">Fonetis (d≤2)</span>
            </div>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
              <span className="block font-bold">{result.countDistantCognate}</span>
              <span className="text-[9px] text-amber-600 dark:text-amber-400">Kognat Jauh</span>
            </div>
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300">
              <span className="block font-bold">{result.countFullDifference}</span>
              <span className="text-[9px] text-rose-600 dark:text-rose-400">Beda Leksikal</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. WORD BY WORD LEVENSHTEIN COMPARISON TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        {/* TOOLBAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
              <span>Daftar Rincian Jarak Edit 200 Kosakata Swadesh</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {filteredWords.length} Glos
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Analisis jarak edit Levenshtein per kata, perbedaan karakter, dan klasifikasi kognat.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* SEARCH */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Cari glos atau kata..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-44 sm:w-56"
              />
            </div>

            {/* FILTER BUTTONS */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-[11px] overflow-x-auto">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setFilterType('different')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  filterType === 'different'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Hanya Berbeda
              </button>
              <button
                type="button"
                onClick={() => setFilterType('identical')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  filterType === 'identical'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Identik (d=0)
              </button>
              <button
                type="button"
                onClick={() => setFilterType('cognate_close')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  filterType === 'cognate_close'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Beda Fonetis (d≤2)
              </button>
              <button
                type="button"
                onClick={() => setFilterType('lexical_diff')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  filterType === 'lexical_diff'
                    ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Beda Leksikal (d&gt;2)
              </button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/40">
                <th className="py-2.5 px-3 w-12 text-center">No</th>
                <th className="py-2.5 px-3 w-40">Glos Swadesh</th>
                <th className="py-2.5 px-3 w-48">{result.survey1Desa}</th>
                <th className="py-2.5 px-3 w-48">{result.survey2Desa}</th>
                <th className="py-2.5 px-3 w-28 text-center">Jarak Levenshtein</th>
                <th className="py-2.5 px-3 w-36">Kategori</th>
                <th className="py-2.5 px-3">Operasi Edit Karakter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredWords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    Tidak ada kosakata yang cocok dengan kriteria pencarian / filter.
                  </td>
                </tr>
              ) : (
                filteredWords.map((word) => {
                  let badgeColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                  if (word.category === 'IDENTIK') {
                    badgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
                  } else if (word.category === 'KOGNAT_DEKAT') {
                    badgeColor = 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
                  } else if (word.category === 'KOGNAT_JAUH') {
                    badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
                  } else if (word.category === 'BEDA_LEKSIKAL') {
                    badgeColor = 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800';
                  }

                  return (
                    <tr 
                      key={`lev-${word.id}`}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400 text-[11px]">
                        {word.id}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        {word.glosIndonesia}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300">
                        <span>{word.bentuk1}</span>
                        {word.ipa1 && word.ipa1 !== `[${word.bentuk1}]` && (
                          <span className="block text-[10px] font-mono text-slate-400">{word.ipa1}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300">
                        <span>{word.bentuk2}</span>
                        {word.ipa2 && word.ipa2 !== `[${word.bentuk2}]` && (
                          <span className="block text-[10px] font-mono text-slate-400">{word.ipa2}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {word.isFilled ? (
                          <div className="inline-flex items-center gap-1">
                            <span className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-xs ${
                              word.distance === 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                              word.distance <= 2 ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                              'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}>
                              d = {word.distance}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${badgeColor}`}>
                          {word.category === 'IDENTIK' ? 'Identik (100%)' :
                           word.category === 'KOGNAT_DEKAT' ? 'Beda Fonetis (d≤2)' :
                           word.category === 'KOGNAT_JAUH' ? 'Kognat Jauh' :
                           word.category === 'BEDA_LEKSIKAL' ? 'Beda Leksikal' : 'Belum Terisi'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 text-[11px]">
                        {word.editOperations}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
