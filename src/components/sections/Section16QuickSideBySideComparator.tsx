import React, { useState, useMemo } from 'react';
import { 
  ArrowLeftRight, 
  RefreshCw, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Info, 
  Search, 
  Download, 
  Layers, 
  ChevronDown, 
  ChevronUp,
  FileSpreadsheet,
  Check,
  Volume2
} from 'lucide-react';
import { 
  KosakataLengkapData, 
  TitikPembandingDialektometri, 
  TitikPengamatan,
  SurveyRecord 
} from '../../types/linguistic';
import { 
  compareTwoPoints, 
  PointOption,
  exportComparisonSummaryToCSV 
} from '../../utils/dialectPointComparison';
import { COMPARATIVE_CORPUS_PRESETS } from '../../data/comparativeCorpus';
import { calculateDistanceKm, parseNum } from '../../utils/calculations';
import { PhoneticSegmentVisualizer } from './PhoneticSegmentVisualizer';

interface Section16QuickSideBySideComparatorProps {
  titikPengamatan: TitikPengamatan;
  titikPembandingList: TitikPembandingDialektometri[];
  kosakataLengkap?: KosakataLengkapData;
  allSurveys?: SurveyRecord[];
  onUpdateTitikPembandingList: (list: TitikPembandingDialektometri[]) => void;
  initialPoint1Id?: string;
  initialPoint2Id?: string;
  onOpenFullDetail?: () => void;
}

export const Section16QuickSideBySideComparator: React.FC<Section16QuickSideBySideComparatorProps> = ({
  titikPengamatan,
  titikPembandingList,
  kosakataLengkap,
  allSurveys,
  onUpdateTitikPembandingList,
  initialPoint1Id = 'TP-REF',
  initialPoint2Id,
  onOpenFullDetail
}) => {
  // Build available point options (Ref, survey comparison points, other surveys, corpus presets)
  const pointOptions: PointOption[] = useMemo(() => {
    const list: PointOption[] = [
      {
        id: 'TP-REF',
        name: `TP-01 ${titikPengamatan.namaDesa || 'Desa Acuan'} (Survei Ini)`,
        subTitle: `${titikPengamatan.namaDesa || 'Desa Acuan'} — ${titikPengamatan.bahasaDigunakan || 'Bahasa Utama'}`,
        sourceType: 'survey_ref'
      },
      ...titikPembandingList.map(tp => ({
        id: tp.id,
        name: `${tp.id} ${tp.desa} (${tp.namaTitik})`,
        subTitle: `${tp.desa} — ${tp.bahasa}`,
        sourceType: 'survey_pembanding' as const
      })),
      ...(allSurveys || [])
        .filter(s => s.data?.titikPengamatan?.namaDesa && s.data.titikPengamatan.namaDesa !== titikPengamatan.namaDesa)
        .map(s => ({
          id: `SURVEY-${s.id}`,
          name: `[Survei] ${s.data?.titikPengamatan?.namaDesa || s.title}`,
          subTitle: `${s.data?.titikPengamatan?.namaDesa} — ${s.data?.titikPengamatan?.bahasaDigunakan || s.bahasa || 'Bahasa'}`,
          sourceType: 'survey_pembanding' as const
        })),
      ...COMPARATIVE_CORPUS_PRESETS.map(preset => ({
        id: preset.id,
        name: `[Korpus] ${preset.name}`,
        subTitle: preset.region,
        sourceType: 'corpus_preset' as const
      }))
    ];
    return list;
  }, [titikPengamatan, titikPembandingList, allSurveys]);

  const [point1Id, setPoint1Id] = useState<string>(initialPoint1Id);
  const [point2Id, setPoint2Id] = useState<string>(
    initialPoint2Id || (titikPembandingList[0]?.id || 'TP-02')
  );

  const [showWordList, setShowWordList] = useState<boolean>(false);
  const [highlightPhonetic, setHighlightPhonetic] = useState<boolean>(true);
  const [wordFilter, setWordFilter] = useState<'all' | 'diff' | 'phonetic_shifts' | 'same'>('diff');
  const [wordSearch, setWordSearch] = useState<string>('');
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Swap Point 1 and Point 2
  const handleSwap = () => {
    const temp = point1Id;
    setPoint1Id(point2Id);
    setPoint2Id(temp);
  };

  const p1Option = pointOptions.find(p => p.id === point1Id) || pointOptions[0];
  const p2Option = pointOptions.find(p => p.id === point2Id) || pointOptions[1] || pointOptions[0];

  // Perform pairwise automatic calculation based on Swadesh 200
  const stats = useMemo(() => {
    return compareTwoPoints(
      point1Id,
      p1Option.name,
      point2Id,
      p2Option.name,
      kosakataLengkap,
      titikPembandingList,
      allSurveys
    );
  }, [point1Id, p1Option.name, point2Id, p2Option.name, kosakataLengkap, titikPembandingList, allSurveys]);

  // Compute physical distance between the two points if coordinates are available
  const spatialDistanceKm = useMemo(() => {
    let lat1 = parseNum(titikPengamatan.namaDesa ? (titikPengamatan as any).koordinatLintang : null) || -7.4982;
    let lon1 = parseNum(titikPengamatan.namaDesa ? (titikPengamatan as any).koordinatBujur : null) || 107.3485;

    let lat2 = -7.55;
    let lon2 = 107.45;

    const tp1 = titikPembandingList.find(t => t.id === point1Id);
    if (tp1) {
      lat1 = tp1.lintang;
      lon1 = tp1.bujur;
    }

    const tp2 = titikPembandingList.find(t => t.id === point2Id);
    if (tp2) {
      lat2 = tp2.lintang;
      lon2 = tp2.bujur;
    }

    return calculateDistanceKm(lat1, lon1, lat2, lon2);
  }, [point1Id, point2Id, titikPengamatan, titikPembandingList]);

  // Filter words preview
  const filteredWords = useMemo(() => {
    return stats.words.filter(w => {
      if (wordFilter === 'diff' && w.category === 'SAMA') return false;
      if (wordFilter === 'same' && w.category !== 'SAMA') return false;
      if (wordFilter === 'phonetic_shifts' && (!w.phoneticAlignment?.shifts || w.phoneticAlignment.shifts.length === 0)) return false;
      if (wordSearch.trim()) {
        const q = wordSearch.toLowerCase().trim();
        const matchGlos = w.glos.toLowerCase().includes(q);
        const matchW1 = w.bentuk1.toLowerCase().includes(q);
        const matchW2 = w.bentuk2.toLowerCase().includes(q);
        const matchShifts = (w.detectedShifts || []).some(s => s.toLowerCase().includes(q));
        if (!matchGlos && !matchW1 && !matchW2 && !matchShifts) return false;
      }
      return true;
    });
  }, [stats.words, wordFilter, wordSearch]);

  // Sync calculated score back to comparison point in titikPembandingList
  const handleApplyToTable = () => {
    const targetTpId = point2Id.startsWith('TP-') && point2Id !== 'TP-REF' ? point2Id : 
                       point1Id.startsWith('TP-') && point1Id !== 'TP-REF' ? point1Id : null;

    if (!targetTpId) {
      setSyncFeedback('Hanya dapat diterapkan ke Titik Pembanding yang terdaftar (TP-02, TP-03, dst).');
      setTimeout(() => setSyncFeedback(null), 3500);
      return;
    }

    const updated = titikPembandingList.map(tp => {
      if (tp.id === targetTpId) {
        return {
          ...tp,
          jumlahBeda: Math.round(stats.effectiveDifferenceCount),
          jumlahGlos: stats.totalTested,
          persentaseBeda: stats.persentasePerbedaan,
          statusHubungan: stats.statusGuiter
        };
      }
      return tp;
    });

    onUpdateTitikPembandingList(updated);
    setSyncFeedback(`Berhasil menerapkan hasil ke ${targetTpId} (${stats.persentasePerbedaan}% beda).`);
    setTimeout(() => setSyncFeedback(null), 3500);
  };

  // Badge background based on status
  const badgeStyle = 
    stats.statusGuiter === 'Tidak Berbeda' || stats.statusGuiter === 'Beda Wicara/Subdialek' ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300' :
    stats.statusGuiter === 'Perbedaan Wicara' ? 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300' :
    stats.statusGuiter === 'Perbedaan Subdialek' || stats.statusGuiter === 'Beda Subbahasa' ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300' :
    stats.statusGuiter === 'Perbedaan Dialek' || stats.statusGuiter === 'Beda Dialek' ? 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-300' :
    'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-colors">
      
      {/* Header bar */}
      <div className="bg-gradient-to-r from-indigo-50/90 via-sky-50/60 to-purple-50/60 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/30 p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Pembanding Cepat Antar Titik Pengamatan (Side-by-Side)
              </h3>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-2xs">
                Instan
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pilih dua titik pengamatan untuk langsung mengomparasikan persentase perbedaan leksikal Guiter dan kemiripan kosakata secara berdampingan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleSwap}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            title="Tukar posisi Titik A dan Titik B"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Tukar Titik</span>
          </button>

          <button
            type="button"
            onClick={() => exportComparisonSummaryToCSV(stats)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            title="Unduh hasil perbandingan ke CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Main Selector & Side-by-Side Cards */}
      <div className="p-4 sm:p-5 space-y-5">
        
        {/* Dropdowns Row */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
          
          {/* Titik A */}
          <div className="md:col-span-5 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Titik Pengamatan A (Kiri)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                Titik 1
              </span>
            </div>
            <select
              value={point1Id}
              onChange={(e) => setPoint1Id(e.target.value)}
              className="w-full text-xs font-bold px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {pointOptions.map(p => (
                <option key={`p1-${p.id}`} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
              {p1Option.subTitle}
            </div>
          </div>

          {/* Swap icon in center */}
          <div className="md:col-span-1 flex justify-center">
            <button
              type="button"
              onClick={handleSwap}
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors shadow-2xs cursor-pointer"
              title="Tukar Titik A dan B"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Titik B */}
          <div className="md:col-span-5 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Titik Pengamatan B (Kanan)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Titik 2
              </span>
            </div>
            <select
              value={point2Id}
              onChange={(e) => setPoint2Id(e.target.value)}
              className="w-full text-xs font-bold px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {pointOptions.map(p => (
                <option key={`p2-${p.id}`} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
              {p2Option.subTitle}
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* SIDE-BY-SIDE RESULT COMPARISON DISPLAY BANNER */}
        {/* ===================================================================== */}
        <div className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            
            {/* Left Point Profile */}
            <div className="lg:col-span-3 text-center sm:text-left space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Titik Pengamatan A
              </div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                {p1Option.name.replace(/\[.*?\]/g, '').trim()}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {p1Option.subTitle}
              </p>
            </div>

            {/* Central Score Card */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm text-center space-y-3">
              <div className="grid grid-cols-3 gap-2 items-center">
                {/* Kemiripan Fonetik IPA */}
                <div className="p-2 bg-purple-50/70 dark:bg-purple-950/30 rounded-xl border border-purple-100 dark:border-purple-900/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 block mb-0.5">
                    Kemiripan Fonetik IPA
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-purple-700 dark:text-purple-300">
                    {stats.persentaseKemiripanFonetikIPA ?? stats.persentaseKemiripan}%
                  </div>
                  <span className="text-[9px] font-bold text-purple-600/80 block mt-0.5">
                    Kesamaan Segmen IPA
                  </span>
                </div>

                {/* Kemiripan Leksikal */}
                <div className="p-2 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block mb-0.5">
                    Kemiripan Leksikal
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {stats.persentaseKemiripan}%
                  </div>
                  <span className="text-[9px] font-bold text-emerald-600/80 block mt-0.5">
                    {stats.jumlahSama} kognat sama
                  </span>
                </div>

                {/* Perbedaan Leksikal (d) */}
                <div className="p-2 bg-rose-50/70 dark:bg-rose-950/30 rounded-xl border border-rose-100 dark:border-rose-900/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 block mb-0.5">
                    Perbedaan Leksikal (d)
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-rose-600 dark:text-rose-400">
                    {stats.persentasePerbedaan}%
                  </div>
                  <span className="text-[9px] font-bold text-rose-600/80 block mt-0.5">
                    {Math.round(stats.effectiveDifferenceCount)} kata beda
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-purple-500 h-full transition-all duration-300" 
                    style={{ width: `${stats.persentaseKemiripanFonetikIPA ?? stats.persentaseKemiripan}%` }}
                    title={`Kemiripan Fonetik IPA: ${stats.persentaseKemiripanFonetikIPA ?? stats.persentaseKemiripan}%`}
                  />
                  <div 
                    className="bg-rose-500 h-full transition-all duration-300" 
                    style={{ width: `${stats.persentasePerbedaan}%` }}
                    title={`Perbedaan Leksikal: ${stats.persentasePerbedaan}%`}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Fonetik: {stats.persentaseKemiripanFonetikIPA ?? stats.persentaseKemiripan}% mirip</span>
                  <span>Pergeseran: {stats.corpusPhoneticSummary?.totalShiftsDetected ?? stats.jumlahBedaFonem} kasus segmen</span>
                </div>
              </div>

              {/* Classification Badge */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">Klasifikasi Dialektometri:</span>
                <span className={`px-3 py-1 text-xs font-extrabold rounded-full border ${badgeStyle}`}>
                  {stats.statusGuiter}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  (Jarak Spasial: ~{spatialDistanceKm} km)
                </span>
              </div>
            </div>

            {/* Right Point Profile */}
            <div className="lg:col-span-3 text-center sm:text-right space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Titik Pengamatan B
              </div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                {p2Option.name.replace(/\[.*?\]/g, '').trim()}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {p2Option.subTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button: Apply / Sync to Table */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApplyToTable}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span>Terapkan Skor ke Tabel Dialektometri</span>
            </button>

            {onOpenFullDetail && (
              <button
                type="button"
                onClick={onOpenFullDetail}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Buka Detail Lengkap Kata per Kata</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowWordList(!showWordList)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>{showWordList ? 'Sembunyikan' : 'Tampilkan'} Pratinjau Kosakata Side-by-Side</span>
            {showWordList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Feedback message */}
        {syncFeedback && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
        )}

        {/* ===================================================================== */}
        {/* COLLAPSIBLE SIDE-BY-SIDE WORD PREVIEW LIST */}
        {/* ===================================================================== */}
        {showWordList && (
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              
              {/* Filter pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setWordFilter('diff')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    wordFilter === 'diff' 
                      ? 'bg-rose-600 text-white shadow-2xs font-bold' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Hanya Kosakata Berbeda ({Math.round(stats.effectiveDifferenceCount)})
                </button>

                <button
                  type="button"
                  onClick={() => setWordFilter('phonetic_shifts')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                    wordFilter === 'phonetic_shifts' 
                      ? 'bg-purple-600 text-white shadow-2xs font-bold' 
                      : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Pergeseran Fonem IPA ({stats.words.filter(w => (w.phoneticAlignment?.shifts.length || 0) > 0).length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWordFilter('same')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    wordFilter === 'same' 
                      ? 'bg-emerald-600 text-white shadow-2xs font-bold' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Hanya Kognat Sama ({stats.jumlahSama})
                </button>

                <button
                  type="button"
                  onClick={() => setWordFilter('all')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    wordFilter === 'all' 
                      ? 'bg-indigo-600 text-white shadow-2xs font-bold' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Semua ({stats.words.length})
                </button>

                {/* Toggle Highlight */}
                <button
                  type="button"
                  onClick={() => setHighlightPhonetic(!highlightPhonetic)}
                  className={`ml-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                    highlightPhonetic
                      ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700'
                      : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                  }`}
                  title="Sorot segmen pergeseran fonem dengan warna kuning/amber"
                >
                  <Sparkles className={`w-3 h-3 ${highlightPhonetic ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`} />
                  <span>Sorot Fonem: {highlightPhonetic ? 'Aktif' : 'Mati'}</span>
                </button>
              </div>

              {/* Search filter input */}
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={wordSearch}
                  onChange={(e) => setWordSearch(e.target.value)}
                  placeholder="Cari glos atau kata..."
                  className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Table of side-by-side words */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] z-10">
                  <tr>
                    <th className="py-2 px-3 w-12 text-center">No</th>
                    <th className="py-2 px-3">Glos Indonesia</th>
                    <th className="py-2 px-3 font-semibold text-indigo-700 dark:text-indigo-400">
                      Titik A: {p1Option.name.replace(/\[.*?\]/g, '').trim()}
                    </th>
                    <th className="py-2 px-3 font-semibold text-amber-700 dark:text-amber-400">
                      Titik B: {p2Option.name.replace(/\[.*?\]/g, '').trim()}
                    </th>
                    <th className="py-2 px-3 text-center">Kemiripan Fonetik IPA</th>
                    <th className="py-2 px-3 text-center">Status Perbedaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {filteredWords.map((row) => (
                    <tr key={row.no} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-2 px-3 text-center font-mono text-[11px] text-slate-400">
                        {row.no}
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900 dark:text-white capitalize">
                        {row.glos}
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{row.bentuk1 || '-'}</div>
                        <div className="mt-0.5">
                          {highlightPhonetic && row.phoneticAlignment ? (
                            <PhoneticSegmentVisualizer 
                              mode="inline-tokens" 
                              targetPoint={1} 
                              alignment={row.phoneticAlignment} 
                            />
                          ) : row.ipa1 ? (
                            <span className="text-[10px] font-mono text-slate-400">{row.ipa1}</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{row.bentuk2 || '-'}</div>
                        <div className="mt-0.5">
                          {highlightPhonetic && row.phoneticAlignment ? (
                            <PhoneticSegmentVisualizer 
                              mode="inline-tokens" 
                              targetPoint={2} 
                              alignment={row.phoneticAlignment} 
                            />
                          ) : row.ipa2 ? (
                            <span className="text-[10px] font-mono text-slate-400">{row.ipa2}</span>
                          ) : null}
                        </div>
                      </td>
                      {/* Kemiripan Fonetik IPA */}
                      <td className="py-2 px-3 text-center min-w-[130px]">
                        {row.phoneticAlignment ? (
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center justify-between w-full px-1">
                              <span className="text-xs font-black font-mono text-purple-700 dark:text-purple-300">
                                {row.phoneticSimilarityPct ?? 0}%
                              </span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${row.phoneticAlignment.similarityBadge.badgeBg} ${row.phoneticAlignment.similarityBadge.badgeText} ${row.phoneticAlignment.similarityBadge.borderClass}`}>
                                {row.phoneticAlignment.similarityBadge.label}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${
                                  (row.phoneticSimilarityPct ?? 0) >= 80 
                                    ? 'bg-emerald-500' 
                                    : (row.phoneticSimilarityPct ?? 0) >= 50 
                                    ? 'bg-amber-500' 
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${row.phoneticSimilarityPct ?? 0}%` }}
                              />
                            </div>
                            {row.phoneticAlignment.shifts.length > 0 && (
                              <div className="flex flex-wrap justify-center gap-1 mt-0.5">
                                {row.phoneticAlignment.shifts.slice(0, 2).map((s, idx) => (
                                  <span
                                    key={idx}
                                    title={`${s.shiftType}: ${s.description}`}
                                    className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700"
                                  >
                                    [{s.soundA}]↔[{s.soundB}]
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px]">-</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {row.category === 'BEDA_LEKSIKAL' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                            Beda Leksikal (1.0)
                          </span>
                        ) : row.category === 'BEDA_FONEM' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            Beda Fonem (0.5)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Sama (0.0)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredWords.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                        Tidak ada kosakata yang cocok dengan filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
