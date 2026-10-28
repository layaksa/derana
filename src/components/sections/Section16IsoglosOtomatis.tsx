import React, { useState, useMemo } from 'react';
import { 
  Split, 
  Sparkles, 
  Filter, 
  Layers, 
  Search, 
  Check, 
  Copy, 
  FileText, 
  Info, 
  Sliders, 
  Eye, 
  RefreshCw, 
  Table, 
  MapPin, 
  Activity, 
  CheckCircle2,
  X,
  Compass,
  ArrowRight
} from 'lucide-react';
import { 
  TitikPengamatan, 
  SituasiGeografis, 
  TitikPembandingDialektometri, 
  KosakataLengkapData, 
  SurveyRecord 
} from '../../types/linguistic';
import { 
  generateAutomaticIsoglosses, 
  GeneratedIsogloss, 
  IsoglossCalculationSummary,
  DifferingWordItem 
} from '../../utils/isoglossGenerator';
import { parseNum } from '../../utils/calculations';
import { InteractiveGeographicMap } from './InteractiveGeographicMap';

interface Section16IsoglosOtomatisProps {
  titikPengamatan: TitikPengamatan;
  situasiGeografis: SituasiGeografis;
  titikPembandingList: TitikPembandingDialektometri[];
  kosakataLengkap?: KosakataLengkapData;
  allSurveys?: SurveyRecord[];
  activeSurveyId?: string | null;
  currentCatatanIsoglos?: string;
  onUpdateTitikPembanding?: (list: TitikPembandingDialektometri[]) => void;
  onUpdateCatatan?: (field: 'catatanIsoglos' | 'kesimpulanGeolinguistik', value: string) => void;
  onNavigateToComparison?: (point1Id?: string, point2Id?: string) => void;
  onNavigateToHeatmap?: () => void;
  onNavigateToClassification?: () => void;
}

export const Section16IsoglosOtomatis: React.FC<Section16IsoglosOtomatisProps> = ({
  titikPengamatan,
  situasiGeografis,
  titikPembandingList,
  kosakataLengkap,
  allSurveys,
  activeSurveyId,
  currentCatatanIsoglos,
  onUpdateTitikPembanding,
  onUpdateCatatan,
  onNavigateToComparison,
  onNavigateToHeatmap,
  onNavigateToClassification
}) => {
  // Settings & Filter states
  const [threshold, setThreshold] = useState<number>(20);
  const [filterLevel, setFilterLevel] = useState<'all' | 'significant' | 'bahasa' | 'subbahasa' | 'dialek'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);

  // Inspector modal for differing words
  const [inspectedIsogloss, setInspectedIsogloss] = useState<GeneratedIsogloss | null>(null);
  const [wordSearchQuery, setWordSearchQuery] = useState<string>('');

  // Coordinates
  const refLat = parseNum(situasiGeografis.koordinatLintang) || -7.4982;
  const refLon = parseNum(situasiGeografis.koordinatBujur) || 107.3485;
  const refDesa = titikPengamatan.namaDesa || 'Titik Acuan';
  const refCode = titikPengamatan.kodeTitik || 'TP-01';

  // Calculate automatic isoglosses
  const isoglossSummary: IsoglossCalculationSummary = useMemo(() => {
    return generateAutomaticIsoglosses(
      titikPengamatan,
      refLat,
      refLon,
      titikPembandingList,
      kosakataLengkap,
      allSurveys,
      activeSurveyId,
      threshold
    );
  }, [
    titikPengamatan,
    refLat,
    refLon,
    titikPembandingList,
    kosakataLengkap,
    allSurveys,
    activeSurveyId,
    threshold
  ]);

  // Recalculate simulation with visual feedback
  const handleRecalculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      setFeedbackNotice(
        `Kalkulasi ulang isoglos selesai! Ditemukan ${isoglossSummary.significantCount} garis isoglos signifikan (ambang beda ≥ ${threshold}%).`
      );
      setTimeout(() => setFeedbackNotice(null), 4500);
    }, 400);
  };

  // Compile academic text and update catatanIsoglos
  const handleApplyToCatatan = () => {
    if (!onUpdateCatatan) return;

    const significantList = isoglossSummary.isoglosses.filter(i => i.isSignificant);
    const dateStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const lines: string[] = [
      `=== LAPORAN ANALISIS ISOGLOS OTOMATIS GEOLINGUISTIK ===`,
      `Tanggal Analisis: ${dateStr}`,
      `Titik Acuan: ${refCode} - Desa ${refDesa} (${titikPengamatan.bahasaDigunakan || 'Bahasa Utama'})`,
      `Ambang Batas Signifikansi: Perbedaan Leksikal d ≥ ${threshold}% (Kriteria Guiter)`,
      `Total Garis Isoglos Dianalisis: ${isoglossSummary.totalGenerated} garis spasial`,
      `Garis Isoglos Signifikan Terdeteksi: ${isoglossSummary.significantCount} garis`,
      `Rata-Rata Perbedaan Leksikal: ${isoglossSummary.averageDifferencePercentage}%`,
      `Perbedaan Leksikal Tertinggi: ${isoglossSummary.maxDifferencePercentage}%`,
      ``,
      `DAFTAR GARIS BATAS ISOGLOS SIGNIFIKAN:`
    ];

    if (significantList.length === 0) {
      lines.push(`- Tidak terdeteksi batas isoglos di atas ambang batas ${threshold}%. Wilayah tuturan relatif homogen dalam satu subdialek.`);
    } else {
      significantList.forEach((iso, idx) => {
        lines.push(
          `${idx + 1}. [${iso.level.toUpperCase()}] Garis Isoglos ${iso.sourceDesa} ↔ ${iso.targetDesa}` +
          `: Perbedaan d = ${iso.differencePercentage}% (${iso.significantWordCount}/${iso.totalWordsTested} glos berbeda; Jarak: ${iso.distanceKm} km). Status: ${iso.statusHubungan}.`
        );
      });
    }

    lines.push(``);
    lines.push(`INTERPRETASI SPASIAL & GEOLINGUISTIK:`);
    if (isoglossSummary.strongestIsogloss) {
      lines.push(
        `Batas isoglos pemisah terkuat ditemukan antara Desa ${isoglossSummary.strongestIsogloss.sourceDesa} dan Desa ${isoglossSummary.strongestIsogloss.targetDesa} ` +
        `dengan perbedaan leksikal ${isoglossSummary.strongestIsogloss.differencePercentage}%. Hal ini membentuk bundel isoglos (isogloss bundle) kokoh yang menandakan ` +
        `diskontinuitas leksikal tegas antarzona pengamatan.`
      );
    } else {
      lines.push(`Kontinum dialektal terpelihara tanpa adanya bundel isoglos pemisah bahasa yang ekstrem.`);
    }

    lines.push(`Garis batas isoglos ini direkonstruksi menggunakan algoritma garis bagi tegak lurus spasial (perpendicular bisector) dan berkas permutasi leksikal berbobot.`);

    const compiledText = lines.join('\n');
    onUpdateCatatan('catatanIsoglos', compiledText);
    setFeedbackNotice('Analisis isoglos otomatis berhasil diterapkan ke Catatan Isoglos Seksi 16!');
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  // Copy summary to clipboard
  const handleCopySummary = () => {
    const significantList = isoglossSummary.isoglosses.filter(i => i.isSignificant);
    const text = [
      `Analisis Isoglos Otomatis: Titik Acuan ${refDesa}`,
      `Ambang: d ≥ ${threshold}% | Signifikan: ${isoglossSummary.significantCount}/${isoglossSummary.totalGenerated} garis`,
      `Rata-Rata: ${isoglossSummary.averageDifferencePercentage}% | Max: ${isoglossSummary.maxDifferencePercentage}%`,
      ...significantList.map(iso => `• ${iso.sourceDesa} ↔ ${iso.targetDesa}: d = ${iso.differencePercentage}% (${iso.statusHubungan})`)
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopiedNotice('Ringkasan berhasil disalin!');
    setTimeout(() => setCopiedNotice(null), 2500);
  };

  // Filtered isoglosses for table view
  const filteredIsoglosses = useMemo(() => {
    return isoglossSummary.isoglosses.filter((iso) => {
      // Level filter
      if (filterLevel === 'significant' && !iso.isSignificant) return false;
      if (filterLevel === 'bahasa' && iso.level !== 'bahasa') return false;
      if (filterLevel === 'subbahasa' && iso.level !== 'subbahasa') return false;
      if (filterLevel === 'dialek' && iso.level !== 'dialek') return false;

      // Text search
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchPair = 
          iso.sourceDesa.toLowerCase().includes(q) ||
          iso.targetDesa.toLowerCase().includes(q) ||
          iso.sourceName.toLowerCase().includes(q) ||
          iso.targetName.toLowerCase().includes(q) ||
          iso.statusHubungan.toLowerCase().includes(q);
        if (!matchPair) return false;
      }

      return true;
    });
  }, [isoglossSummary.isoglosses, filterLevel, searchQuery]);

  // Filtered differing words in modal
  const filteredWords = useMemo(() => {
    if (!inspectedIsogloss) return [];
    if (!wordSearchQuery.trim()) return inspectedIsogloss.differingWords;
    const q = wordSearchQuery.toLowerCase();
    return inspectedIsogloss.differingWords.filter(
      w => 
        w.glos.toLowerCase().includes(q) ||
        w.bentukA.toLowerCase().includes(q) ||
        w.bentukB.toLowerCase().includes(q) ||
        (w.ipaA && w.ipaA.toLowerCase().includes(q)) ||
        (w.ipaB && w.ipaB.toLowerCase().includes(q))
    );
  }, [inspectedIsogloss, wordSearchQuery]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 1. HEADER & INTRODUCTORY CARD */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-900/60 rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                <Split className="w-3 h-3 text-indigo-400" />
                Algoritma Isoglos Otomatis
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                Garis Bagi Tegak Lurus (Bisector) & Berkas Leksikal
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
                Standar Guiter d = (s/n)×100%
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Analisis Garis Isoglos Otomatis Titik Pengamatan
            </h2>

            <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
              Modul ini secara otomatis merekonstruksi garis batas isoglos (perpendicular spatial bisector) 
              serta berkas isoglos antar-titik pengamatan berdasarkan perbedaan leksikal Swadesh yang signifikan. 
              Garis isoglos ditarik di tengah koridor geografis dua desa yang memiliki perbedaan tuturan di atas ambang batas.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRecalculate}
              disabled={isCalculating}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title="Hitung ulang garis isoglos"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCalculating ? 'animate-spin' : ''}`} />
              <span>{isCalculating ? 'Menghitung...' : 'Hitung Ulang Isoglos'}</span>
            </button>

            <button
              type="button"
              onClick={handleApplyToCatatan}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              title="Terapkan hasil rekonstruksi isoglos ke catatan Seksi 16"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Terapkan ke Catatan Isoglos</span>
            </button>

            <button
              type="button"
              onClick={handleCopySummary}
              className="p-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              title="Salin ringkasan isoglos ke clipboard"
            >
              {copiedNotice ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {feedbackNotice && (
          <div className="mt-4 p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{feedbackNotice}</span>
          </div>
        )}
      </div>

      {/* 2. STATISTICAL KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {/* Card 1: Total Evaluated Lines */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 sm:p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Garis Diuji</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {isoglossSummary.totalGenerated}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Vektor koneksi spasial antar-desa
          </p>
        </div>

        {/* Card 2: Significant Isoglosses Count */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 sm:p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Isoglos Signifikan</span>
            <Split className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {isoglossSummary.significantCount}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Garis pemisah d ≥ {threshold}%
          </p>
        </div>

        {/* Card 3: Average Difference */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 sm:p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Rata-Rata Beda</span>
            <Activity className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-cyan-600 dark:text-cyan-400">
            {isoglossSummary.averageDifferencePercentage}%
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Indeks perbedaan leksikal rerata
          </p>
        </div>

        {/* Card 4: Max Difference */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 sm:p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Beda Tertinggi</span>
            <Sparkles className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
            {isoglossSummary.maxDifferencePercentage}%
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Pemisahan leksikal paling ekstrem
          </p>
        </div>

        {/* Card 5: Strongest Pair */}
        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 sm:p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Batas Terkuat</span>
            <MapPin className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white truncate" title={isoglossSummary.strongestIsogloss ? `${isoglossSummary.strongestIsogloss.sourceDesa} ↔ ${isoglossSummary.strongestIsogloss.targetDesa}` : '-'}>
            {isoglossSummary.strongestIsogloss ? `${isoglossSummary.strongestIsogloss.sourceDesa} ↔ ${isoglossSummary.strongestIsogloss.targetDesa}` : '-'}
          </div>
          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
            {isoglossSummary.strongestIsogloss ? `${isoglossSummary.strongestIsogloss.differencePercentage}% (${isoglossSummary.strongestIsogloss.statusHubungan})` : 'Homogen'}
          </p>
        </div>
      </div>

      {/* 3. THRESHOLD CONTROLS & INTERACTIVE MAP CONTAINER */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-xs">
        {/* Top Control Bar for Isogloss Map */}
        <div className="p-3.5 sm:p-4 bg-slate-50/90 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Ambang Signifikansi Batas Isoglos:
            </span>

            {/* Threshold buttons */}
            <div className="flex items-center gap-1.5">
              {[
                { val: 20, label: '≥ 20% (Dialek)' },
                { val: 35, label: '≥ 35% (Subdialek)' },
                { val: 51, label: '≥ 51% (Subbahasa)' },
                { val: 81, label: '≥ 81% (Bahasa)' }
              ].map(item => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setThreshold(item.val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    threshold === item.val
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Threshold Slider */}
            <div className="flex items-center gap-2 pl-2">
              <input
                type="range"
                min="10"
                max="85"
                step="5"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-24 sm:w-32 accent-indigo-600 cursor-pointer"
              />
              <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                {threshold}%
              </span>
            </div>
          </div>

          {/* Quick Info text */}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Klik garis isoglos di peta atau tabel untuk memeriksa kosakata pembeda.</span>
          </div>
        </div>

        {/* Embedded Interactive GIS Map in isoglos-otomatis mode */}
        <InteractiveGeographicMap
          titikPengamatan={titikPengamatan}
          situasiGeografis={situasiGeografis}
          titikPembandingList={titikPembandingList}
          kosakataLengkap={kosakataLengkap}
          allSurveys={allSurveys}
          activeSurveyId={activeSurveyId}
          initialThematicMode="isoglos-otomatis"
          initialDarkMode={false}
          onAddPoint={(newPoint) => {
            if (onUpdateTitikPembanding) {
              onUpdateTitikPembanding([...titikPembandingList, newPoint]);
            }
          }}
          onSelectComparisonForDetail={(pointId) => {
            if (onNavigateToComparison) {
              onNavigateToComparison('TP-REF', pointId);
            }
          }}
        />
      </div>

      {/* 4. TABLE & ROSTER OF DETECTED ISOGLOSS BOUNDARIES */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-xs">
        {/* Table Header & Controls */}
        <div className="p-3.5 sm:p-4 bg-slate-50/90 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
              <Table className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Daftar Seluruh Garis Batas Isoglos Terdeteksi
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                  {filteredIsoglosses.length} Garis
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Peringkat pasangan titik berdasarkan perbedaan leksikal (d%) dan signifikansi batas isoglos.
              </p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Level */}
            <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setFilterLevel('all')}
                className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                  filterLevel === 'all' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600'
                }`}
              >
                Semua ({isoglossSummary.isoglosses.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterLevel('significant')}
                className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                  filterLevel === 'significant' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
                }`}
              >
                Signifikan ({isoglossSummary.significantCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterLevel('bahasa')}
                className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                  filterLevel === 'bahasa' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-300 hover:text-rose-600'
                }`}
              >
                Beda Bahasa
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari desa/status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-36 sm:w-44"
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-[11px] font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700/80">
              <tr>
                <th className="py-2.5 px-3 sm:px-4">No</th>
                <th className="py-2.5 px-3 sm:px-4">Pasangan Titik Tuturan</th>
                <th className="py-2.5 px-3 sm:px-4">Jarak Spasial</th>
                <th className="py-2.5 px-3 sm:px-4 text-center">Beda Leksikal (d%)</th>
                <th className="py-2.5 px-3 sm:px-4">Glos Pembeda (s/n)</th>
                <th className="py-2.5 px-3 sm:px-4">Status Guiter</th>
                <th className="py-2.5 px-3 sm:px-4 text-center">Batas Isoglos</th>
                <th className="py-2.5 px-3 sm:px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {filteredIsoglosses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Tidak ada garis isoglos yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredIsoglosses.map((iso, idx) => (
                  <tr 
                    key={iso.id}
                    className="hover:bg-indigo-50/40 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-2.5 px-3 sm:px-4 text-slate-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span className="truncate max-w-[130px]" title={iso.sourceDesa}>{iso.sourceDesa}</span>
                        <span className="text-slate-400 font-normal">↔</span>
                        <span className="truncate max-w-[130px]" title={iso.targetDesa}>{iso.targetDesa}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {iso.sourceName} • {iso.targetName}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-slate-600 dark:text-slate-400 font-mono">
                      {iso.distanceKm} km
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-center">
                      <span 
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: `${iso.color}15`,
                          color: iso.color,
                          border: `1px solid ${iso.color}40`
                        }}
                      >
                        {iso.differencePercentage}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 font-mono text-slate-600 dark:text-slate-400">
                      {iso.significantWordCount} / {iso.totalWordsTested} kata
                    </td>
                    <td className="py-2.5 px-3 sm:px-4">
                      <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                        {iso.statusHubungan}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-center">
                      {iso.isSignificant ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          <Check className="w-3 h-3" />
                          Signifikan
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">
                          Subambang
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setInspectedIsogloss(iso)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer flex items-center gap-1"
                          title="Lihat kosakata pembeda garis isoglos ini"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Kosakata ({iso.differingWords.length})</span>
                        </button>

                        {onNavigateToComparison && (
                          <button
                            type="button"
                            onClick={() => onNavigateToComparison(iso.sourcePointId, iso.targetPointId)}
                            className="p-1 rounded-lg text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                            title="Buka komparasi penuh 200 kosakata Swadesh"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL: RINCIAN KOSAKATA PEMBEDA (GLOS DIAGNOSTIK ISOGLOS) */}
      {inspectedIsogloss && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
          onClick={() => setInspectedIsogloss(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-3 h-10 rounded-full"
                  style={{ backgroundColor: inspectedIsogloss.color }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Kosakata Pembeda: {inspectedIsogloss.sourceDesa} ↔ {inspectedIsogloss.targetDesa}
                    </h3>
                    <span 
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{
                        backgroundColor: `${inspectedIsogloss.color}20`,
                        color: inspectedIsogloss.color
                      }}
                    >
                      d = {inspectedIsogloss.differencePercentage}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Glos diagnostik Swadesh yang menjadi dasar penarikan garis isoglos pemisah.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectedIsogloss(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Bar */}
            <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari glos atau kata lokal..."
                  value={wordSearchQuery}
                  onChange={(e) => setWordSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0 font-medium">
                {filteredWords.length} dari {inspectedIsogloss.differingWords.length} Glos
              </span>
            </div>

            {/* Modal Word List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              {filteredWords.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  Tidak ditemukan kata yang cocok dengan pencarian.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredWords.map((item, idx) => (
                    <div 
                      key={idx}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 capitalize">
                          {item.glos}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          item.category === 'BEDA_LEKSIKAL' 
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {item.category === 'BEDA_LEKSIKAL' ? 'Beda Leksikal' : 'Beda Fonem'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium truncate">
                            {inspectedIsogloss.sourceDesa}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {item.bentukA}
                          </span>
                          {item.ipaA && (
                            <span className="text-[10px] text-slate-500 font-mono block">
                              {item.ipaA}
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium truncate">
                            {inspectedIsogloss.targetDesa}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {item.bentukB}
                          </span>
                          {item.ipaB && (
                            <span className="text-[10px] text-slate-500 font-mono block">
                              {item.ipaB}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Status Guiter: <b>{inspectedIsogloss.statusHubungan}</b> • Jarak: <b>{inspectedIsogloss.distanceKm} km</b>
              </span>

              <button
                type="button"
                onClick={() => setInspectedIsogloss(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
