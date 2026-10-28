import React, { useState, useMemo } from 'react';
import { 
  ArrowLeftRight, 
  Search, 
  Download, 
  Copy, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  Layers, 
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  FileSpreadsheet,
  Volume2,
  ListFilter,
  Eye,
  Activity,
  Split
} from 'lucide-react';
import { 
  KosakataLengkapData, 
  TitikPembandingDialektometri, 
  TitikPengamatan,
  SurveyRecord
} from '../../types/linguistic';
import { 
  compareTwoPoints, 
  exportComparisonSummaryToCSV, 
  PointOption,
  DialectComparisonWordRow 
} from '../../utils/dialectPointComparison';
import { COMPARATIVE_CORPUS_PRESETS } from '../../data/comparativeCorpus';
import { PhoneticChangeAnalysis } from './PhoneticChangeAnalysis';
import { PhonotacticAnalysis } from './PhonotacticAnalysis';
import { PhoneticSegmentVisualizer } from './PhoneticSegmentVisualizer';
import { PhoneticShiftInspectorModal } from './PhoneticShiftInspectorModal';
import { Section16QuickSideBySideComparator } from './Section16QuickSideBySideComparator';
import { AlignedPhoneticResult } from '../../utils/phoneticSegmentAligner';

interface Section16PointComparisonProps {
  titikPengamatan: TitikPengamatan;
  titikPembandingList: TitikPembandingDialektometri[];
  kosakataLengkap?: KosakataLengkapData;
  allSurveys?: SurveyRecord[];
  onUpdateTitikPembandingList: (list: TitikPembandingDialektometri[]) => void;
}

export const Section16PointComparison: React.FC<Section16PointComparisonProps> = ({
  titikPengamatan,
  titikPembandingList,
  kosakataLengkap,
  allSurveys,
  onUpdateTitikPembandingList
}) => {
  // Mode tab: 'tabel_kata' | 'analisis_fonetik' | 'analisis_fonotaktik'
  const [activeSubTab, setActiveSubTab] = useState<'tabel_kata' | 'analisis_fonetik' | 'analisis_fonotaktik'>('tabel_kata');

  // Available points for Point 1 and Point 2
  const pointOptions: PointOption[] = useMemo(() => {
    const list: PointOption[] = [
      {
        id: 'TP-REF',
        name: `TP-01 ${titikPengamatan.namaDesa || 'Desa Acuan'} (Survei Aktif)`,
        subTitle: titikPengamatan.bahasaDigunakan || 'Bahasa Titik Pengamatan Ini',
        sourceType: 'survey_ref'
      },
      ...titikPembandingList.map(tp => ({
        id: tp.id,
        name: tp.namaTitik,
        subTitle: `${tp.desa} — ${tp.bahasa}`,
        sourceType: 'survey_pembanding' as const
      })),
      // All other surveys in the database
      ...(allSurveys || [])
        .filter(s => s.desa !== titikPengamatan.namaDesa)
        .map(s => ({
          id: s.id,
          name: `TP ${s.desa || s.title} (${s.provinsi || 'Survei Lapangan'})`,
          subTitle: `${s.bahasa || 'Bahasa Daerah'} • Kec. ${s.kecamatan || '-'}`,
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

  // Selected Points: Point 1 defaults to TP-REF, Point 2 defaults to TP-02 or first comparison point
  const [point1Id, setPoint1Id] = useState<string>('TP-REF');
  const [point2Id, setPoint2Id] = useState<string>(
    titikPembandingList[0]?.id || 'TP-02'
  );

  // Filter & Search states
  const [filterCategory, setFilterCategory] = useState<'all' | 'significant' | 'phonetic' | 'identical' | 'phonetic_shifts'>('all');
  const [highlightPhoneticShifts, setHighlightPhoneticShifts] = useState<boolean>(true);
  const [showQuickComparator, setShowQuickComparator] = useState<boolean>(false);
  const [expandedRowNo, setExpandedRowNo] = useState<number | null>(null);
  const [selectedWordForPhoneticModal, setSelectedWordForPhoneticModal] = useState<AlignedPhoneticResult | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [syncNotification, setSyncNotification] = useState<string | null>(null);

  // Swap Point 1 and Point 2
  const handleSwapPoints = () => {
    const temp = point1Id;
    setPoint1Id(point2Id);
    setPoint2Id(temp);
  };

  const p1Option = pointOptions.find(p => p.id === point1Id) || pointOptions[0];
  const p2Option = pointOptions.find(p => p.id === point2Id) || pointOptions[1] || pointOptions[0];

  // Perform automatic pairwise calculation
  const comparisonStats = useMemo(() => {
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

  // Filter rows based on category and search query
  const filteredWords = useMemo(() => {
    return comparisonStats.words.filter(row => {
      // Category filter
      if (filterCategory === 'significant' && !row.isSignificant) return false;
      if (filterCategory === 'phonetic' && row.category !== 'BEDA_FONEM') return false;
      if (filterCategory === 'identical' && row.category !== 'SAMA') return false;
      if (filterCategory === 'phonetic_shifts' && (!row.phoneticAlignment?.shifts || row.phoneticAlignment.shifts.length === 0)) return false;

      // Search filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchGlos = row.glos.toLowerCase().includes(q);
        const matchW1 = row.bentuk1.toLowerCase().includes(q);
        const matchW2 = row.bentuk2.toLowerCase().includes(q);
        const matchNote = row.note.toLowerCase().includes(q);
        const matchShifts = (row.detectedShifts || []).some(s => s.toLowerCase().includes(q));
        if (!matchGlos && !matchW1 && !matchW2 && !matchNote && !matchShifts) return false;
      }

      return true;
    });
  }, [comparisonStats.words, filterCategory, searchQuery]);

  // Sync calculated score back to comparison point in titikPembandingList
  const handleSyncToTitikPembanding = () => {
    // Identify which point is in titikPembandingList
    const targetTpId = point2Id.startsWith('TP-') && point2Id !== 'TP-REF' ? point2Id : 
                       point1Id.startsWith('TP-') && point1Id !== 'TP-REF' ? point1Id : null;

    if (!targetTpId) {
      setSyncNotification('Hanya dapat menyinkronkan ke Titik Pembanding survei (TP-02, TP-03, dst).');
      setTimeout(() => setSyncNotification(null), 3500);
      return;
    }

    const updated = titikPembandingList.map(tp => {
      if (tp.id === targetTpId) {
        return {
          ...tp,
          jumlahBeda: Math.round(comparisonStats.effectiveDifferenceCount),
          jumlahGlos: comparisonStats.totalTested,
          persentaseBeda: comparisonStats.persentasePerbedaan,
          statusHubungan: comparisonStats.statusGuiter
        };
      }
      return tp;
    });

    onUpdateTitikPembandingList(updated);
    setSyncNotification(`Berhasil menyinkronkan data ke ${targetTpId} (${comparisonStats.persentasePerbedaan}% beda).`);
    setTimeout(() => setSyncNotification(null), 3500);
  };

  // Copy table to clipboard
  const handleCopyClipboard = () => {
    const textRows = filteredWords.map(w => 
      `${w.no}\t${w.glos}\t${w.bentuk1} ${w.ipa1}\t${w.bentuk2} ${w.ipa2}\t${w.score}\t${w.note}`
    );
    const fullText = [
      `No\tGlos\t${comparisonStats.point1Name}\t${comparisonStats.point2Name}\tSkor Dialektometri\tCatatan Perbedaan`,
      ...textRows
    ].join('\n');

    navigator.clipboard.writeText(fullText);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. SELECTION CARD: PILIH DUA TITIK PENGAMATAN */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
              <span>Komparasi Otomatis Antara Dua Titik Pengamatan</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih dua titik pengamatan untuk membandingkan 200 kosakata Swadesh dan mendeteksi perbedaan leksikal signifikan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowQuickComparator(!showQuickComparator)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                showQuickComparator
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
              }`}
              title="Tampilkan Pembanding Cepat Berdampingan (Side-by-Side)"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>{showQuickComparator ? 'Tutup Side-by-Side' : 'Mode Side-by-Side'}</span>
            </button>
            <button
              type="button"
              onClick={handleSwapPoints}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Tukar posisi Titik 1 dan Titik 2"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
              <span>Tukar Titik</span>
            </button>
            <button
              type="button"
              onClick={() => exportComparisonSummaryToCSV(comparisonStats)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>

        {/* Quick Side-by-Side Card Comparator (Expandable) */}
        {showQuickComparator && (
          <div className="mt-4 animate-in fade-in">
            <Section16QuickSideBySideComparator
              titikPengamatan={titikPengamatan}
              titikPembandingList={titikPembandingList}
              kosakataLengkap={kosakataLengkap}
              allSurveys={allSurveys}
              onUpdateTitikPembandingList={onUpdateTitikPembandingList}
              initialPoint1Id={point1Id}
              initialPoint2Id={point2Id}
              onOpenFullDetail={() => setShowQuickComparator(false)}
            />
          </div>
        )}

        {/* Dropdowns for Point 1 and Point 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Titik 1 */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Titik Pengamatan 1 (Titik A)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-indigo-100 text-indigo-800">
                Acuan / Pangkalan
              </span>
            </div>
            <select
              value={point1Id}
              onChange={(e) => setPoint1Id(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {pointOptions.map(p => (
                <option key={`p1-${p.id}`} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              {p1Option.subTitle}
            </p>
          </div>

          {/* Titik 2 */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Titik Pengamatan 2 (Titik B)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800">
                Pembanding Terpilih
              </span>
            </div>
            <select
              value={point2Id}
              onChange={(e) => setPoint2Id(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {pointOptions.map(p => (
                <option key={`p2-${p.id}`} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              {p2Option.subTitle}
            </p>
          </div>
        </div>

        {/* Sync notification */}
        {syncNotification && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{syncNotification}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. STATS & DIALECTOMETRY SCORE CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Indeks Kemiripan Leksikal */}
        <div className="bg-white dark:bg-slate-800/80 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Kemiripan Leksikal</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {comparisonStats.persentaseKemiripan}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
            Guiter (100 - d%)
          </div>
        </div>

        {/* Kemiripan Fonetik IPA (Segmental) */}
        <div className="bg-white dark:bg-slate-800/80 rounded-xl p-3.5 border border-purple-200 dark:border-purple-800/80 shadow-2xs relative overflow-hidden bg-gradient-to-br from-purple-50/40 via-white to-indigo-50/20 dark:from-purple-950/20 dark:via-slate-800">
          <div className="flex items-center justify-between text-purple-700 dark:text-purple-300">
            <span className="text-[11px] font-bold">Kemiripan Fonetik IPA</span>
            <Volume2 className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-1">
            {comparisonStats.persentaseKemiripanFonetikIPA ?? comparisonStats.persentaseKemiripan}%
          </div>
          <div className="text-[10px] text-purple-600 dark:text-purple-400 mt-0.5 font-mono">
            Rerata Kesamaan Segmen
          </div>
        </div>

        {/* Skor Dialektometri */}
        <div className="bg-white dark:bg-slate-800/80 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Perbedaan Leksikal</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {comparisonStats.persentasePerbedaan}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
            d% = (s / n) × 100%
          </div>
        </div>

        {/* Pergeseran Fonem Terdeteksi */}
        <div className="bg-white dark:bg-slate-800/80 rounded-xl p-3.5 border border-amber-200 dark:border-amber-800/80 shadow-2xs bg-gradient-to-br from-amber-50/40 via-white to-orange-50/20 dark:from-amber-950/20 dark:via-slate-800">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-300">
            <span className="text-[11px] font-bold">Pergeseran Fonem</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {comparisonStats.corpusPhoneticSummary?.totalShiftsDetected ?? comparisonStats.jumlahBedaFonem}
          </div>
          <div className="text-[10px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">
            Kasus Segmen Bergeser
          </div>
        </div>

        {/* Beda Leksikal (Skor 1.0) */}
        <div className="bg-white dark:bg-slate-800/80 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Beda Leksikal (1.0)</div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {comparisonStats.jumlahBedaLeksikal}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Perbedaan Signifikan
          </div>
        </div>

        {/* Status Dialektometri */}
        <div className="bg-white dark:bg-slate-800/80 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 shadow-2xs col-span-2 sm:col-span-1">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Status Dialektometri</div>
          <div className="mt-1.5">
            <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded-lg border ${comparisonStats.statusBadgeColor}`}>
              {comparisonStats.statusGuiter}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 truncate">
            {comparisonStats.jumlahSama} kognat identik
          </div>
        </div>
      </div>

      {/* 2A. PANEL IKHTISAR ANALISIS FONETIK OTOMATIS SEGMEN IPA SWADESH */}
      <div className="bg-gradient-to-r from-purple-50/90 via-indigo-50/60 to-white dark:from-purple-950/40 dark:via-slate-800/70 dark:to-slate-900 border border-purple-200/80 dark:border-purple-800/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Analisis Fonetik Otomatis Segmen Transkripsi IPA Swadesh
                </h4>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-600 text-white shadow-2xs">
                  Otomatis
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Membandingkan secara otomatis kesamaan segmental IPA antara <strong>{comparisonStats.point1Name.split(' ')[0]}</strong> dan <strong>{comparisonStats.point2Name.split(' ')[0]}</strong> melalui algoritma Needleman-Wunsch.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto bg-white dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-purple-200/70 dark:border-purple-800/70 shrink-0">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Kemiripan Fonetik IPA
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black font-mono text-purple-700 dark:text-purple-300">
                  {comparisonStats.persentaseKemiripanFonetikIPA ?? comparisonStats.persentaseKemiripan}%
                </span>
                <span className="text-[10px] font-bold text-purple-600/80">
                  {(comparisonStats.persentaseKemiripanFonetikIPA ?? 0) >= 80 ? 'Tinggi' : (comparisonStats.persentaseKemiripanFonetikIPA ?? 0) >= 50 ? 'Sedang' : 'Rendah'}
                </span>
              </div>
            </div>
            <div className="w-12 h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden self-center">
              <div 
                className="h-full bg-purple-600 rounded-full transition-all"
                style={{ width: `${comparisonStats.persentaseKemiripanFonetikIPA ?? comparisonStats.persentaseKemiripan}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4-Segmen Distribusi Kemiripan & Kasus Pergeseran Fonem */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="p-2.5 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-emerald-200/70 dark:border-emerald-900/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 block">100% Identik</span>
              <span className="text-base font-black font-mono text-emerald-800 dark:text-emerald-200">
                {comparisonStats.corpusPhoneticSummary?.identicalCount ?? comparisonStats.jumlahSama} kata
              </span>
            </div>
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>

          <div className="p-2.5 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-cyan-200/70 dark:border-cyan-900/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-cyan-700 dark:text-cyan-300 block">Variasi Teratur (≥75%)</span>
              <span className="text-base font-black font-mono text-cyan-800 dark:text-cyan-200">
                {comparisonStats.corpusPhoneticSummary?.highSimilarityCount ?? 0} kata
              </span>
            </div>
            <Activity className="w-4 h-4 text-cyan-500 shrink-0" />
          </div>

          <div className="p-2.5 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-amber-200/70 dark:border-amber-900/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 block">Pergeseran Fonem (45-74%)</span>
              <span className="text-base font-black font-mono text-amber-800 dark:text-amber-200">
                {comparisonStats.corpusPhoneticSummary?.moderateVariationCount ?? comparisonStats.jumlahBedaFonem} kata
              </span>
            </div>
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          </div>

          <div className="p-2.5 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-rose-200/70 dark:border-rose-900/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 block">Beda Leksikal (&lt;45%)</span>
              <span className="text-base font-black font-mono text-rose-800 dark:text-rose-200">
                {comparisonStats.corpusPhoneticSummary?.lexicalDifferenceCount ?? comparisonStats.jumlahBedaLeksikal} kata
              </span>
            </div>
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          </div>
        </div>

        {/* Pola Pergeseran Fonem Teratas (Quick Filters) */}
        {comparisonStats.corpusPhoneticSummary?.topShiftRules && comparisonStats.corpusPhoneticSummary.topShiftRules.length > 0 && (
          <div className="pt-2 border-t border-purple-100 dark:border-purple-900/60 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1 mr-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Pergeseran Fonem Utama Terdeteksi:
            </span>
            {comparisonStats.corpusPhoneticSummary.topShiftRules.slice(0, 4).map((rule, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setFilterCategory('phonetic_shifts');
                  setSearchQuery(rule.ruleName.split(' ')[0] || '');
                }}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-700 hover:border-purple-400 text-purple-900 dark:text-purple-200 text-[11px] font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                title={`Klik untuk memfilter kata dengan ${rule.ruleName}`}
              >
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{rule.ruleName}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                  {rule.count}x
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2B. SUBTAB SWITCHER: TABEL KATA vs ANALISIS PERUBAHAN FONETIK */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
        <button
          type="button"
          onClick={() => setActiveSubTab('tabel_kata')}
          className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'tabel_kata'
              ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <ListFilter className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Tabel Perbandingan 200 Kosakata Swadesh</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('analisis_fonetik')}
          className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'analisis_fonetik'
              ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>Analisis Perubahan Fonetik & Korespondensi Bunyi (Otomatis)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('analisis_fonotaktik')}
          className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'analisis_fonotaktik'
              ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Analisis Fonotaktik & Pola Silabel (KV/KVK)</span>
        </button>
      </div>

      {activeSubTab === 'analisis_fonotaktik' ? (
        <PhonotacticAnalysis
          titikPengamatan={titikPengamatan}
          swadeshList={kosakataLengkap?.swadeshList || []}
          allSurveys={allSurveys}
          activeSurveyTitle={titikPengamatan.namaDesa || 'Titik Acuan'}
        />
      ) : activeSubTab === 'analisis_fonetik' ? (
        <PhoneticChangeAnalysis
          words={comparisonStats.words}
          point1Name={p1Option.name}
          point2Name={p2Option.name}
          onSelectWord={(glos) => {
            setActiveSubTab('tabel_kata');
            setSearchQuery(glos);
          }}
        />
      ) : (
        <>
      {/* 3. QUICK ACTIONS & FILTER CONTROLS */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterCategory('significant')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterCategory === 'significant'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Perbedaan Signifikan ({comparisonStats.jumlahBedaLeksikal})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('phonetic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterCategory === 'phonetic'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Variasi Fonetis ({comparisonStats.jumlahBedaFonem})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('phonetic_shifts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                filterCategory === 'phonetic_shifts'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Pergeseran Fonem IPA ({comparisonStats.words.filter(w => (w.phoneticAlignment?.shifts?.length || 0) > 0).length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('identical')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterCategory === 'identical'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Kognat Sama ({comparisonStats.jumlahSama})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Glos ({comparisonStats.totalTested})
            </button>
          </div>

          {/* Search bar & copy button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari glos, kata, atau fonem..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="button"
              onClick={handleCopyClipboard}
              className="p-1.5 text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Salin baris yang difilter ke clipboard"
            >
              {copiedNotification ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={handleSyncToTitikPembanding}
              className="px-2.5 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              title="Sinkronkan skor dialektometri ke daftar titik pembanding"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Sinkronkan ke Titik</span>
            </button>
          </div>
        </div>

        {/* Sub-bar: Visual Highlighter Toggle & Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-slate-600 dark:text-slate-300 text-xs border border-slate-200/60 dark:border-slate-700">
          <div className="flex items-center gap-2 text-[11px]">
            <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>
              Menampilkan <strong>{filteredWords.length}</strong> kosakata. Rata-rata kemiripan fonetik IPA: <strong className="text-purple-700 dark:text-purple-300">{comparisonStats.persentaseKemiripanFonetikIPA ?? comparisonStats.persentaseKemiripan}%</strong>.
            </span>
          </div>

          {/* Phonetic Shift Highlighting Toggle */}
          <button
            type="button"
            onClick={() => setHighlightPhoneticShifts(prev => !prev)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto ${
              highlightPhoneticShifts
                ? 'bg-purple-100 text-purple-900 border border-purple-300 dark:bg-purple-950/80 dark:text-purple-200 dark:border-purple-800 shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
            title="Aktifkan atau nonaktifkan penandaan visual pergeseran segmen fonem pada kolom IPA"
          >
            <Sparkles className={`w-3.5 h-3.5 ${highlightPhoneticShifts ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`} />
            <span>Penandaan Visual IPA: {highlightPhoneticShifts ? 'Aktif' : 'Mati'}</span>
          </button>
        </div>
      </div>

      {/* 4. TABEL RINGKASAN PERBEDAAN KOSAKATA & ANALISIS FONETIK IPA */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
            <h5 className="text-xs font-bold text-slate-800">
              Tabel Komparasi Kosakata & Segmen IPA: {comparisonStats.point1Name} vs {comparisonStats.point2Name}
            </h5>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="font-mono">{filteredWords.length} entri</span>
            <span>•</span>
            <span className="text-purple-700 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              Segmen Kuning = Pergeseran Fonem
            </span>
          </div>
        </div>

        {filteredWords.length > 0 ? (
          <div className="max-h-[540px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-100/95 backdrop-blur-xs border-b border-slate-200 text-slate-700 font-semibold z-10">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-3 w-36">Glos Indonesia</th>
                  <th className="py-2.5 px-3 w-48 text-indigo-900 bg-indigo-50/40">
                    Bentuk {comparisonStats.point1Name.split(' ')[0]} & IPA
                  </th>
                  <th className="py-2.5 px-3 w-48 text-amber-900 bg-amber-50/40">
                    Bentuk {comparisonStats.point2Name.split(' ')[0]} & IPA
                  </th>
                  <th className="py-2.5 px-3 w-36 text-center">Kemiripan Fonetik IPA</th>
                  <th className="py-2.5 px-3 w-32 text-center">Skor Dialektometri</th>
                  <th className="py-2.5 px-3">Catatan Morfofonemik & Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredWords.map((row) => (
                  <React.Fragment key={`comp-${row.no}`}>
                    <tr 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        row.isSignificant ? 'bg-rose-50/20' : ''
                      } ${expandedRowNo === row.no ? 'bg-purple-50/30 dark:bg-purple-950/10' : ''}`}
                    >
                      {/* No */}
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {row.no}
                      </td>

                      {/* Glos Indonesia */}
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{row.glos}</span>
                        </div>
                      </td>

                      {/* Titik 1 */}
                      <td className="py-2.5 px-3 bg-indigo-50/20">
                        <div className="font-semibold text-indigo-950">
                          {row.bentuk1}
                        </div>
                        <div className="mt-0.5">
                          {highlightPhoneticShifts && row.phoneticAlignment ? (
                            <PhoneticSegmentVisualizer 
                              mode="inline-tokens" 
                              targetPoint={1} 
                              alignment={row.phoneticAlignment} 
                            />
                          ) : row.ipa1 ? (
                            <span className="text-[11px] font-mono text-indigo-600/80">
                              {row.ipa1}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Titik 2 */}
                      <td className="py-2.5 px-3 bg-amber-50/20">
                        <div className="font-semibold text-amber-950">
                          {row.bentuk2}
                        </div>
                        <div className="mt-0.5">
                          {highlightPhoneticShifts && row.phoneticAlignment ? (
                            <PhoneticSegmentVisualizer 
                              mode="inline-tokens" 
                              targetPoint={2} 
                              alignment={row.phoneticAlignment} 
                            />
                          ) : row.ipa2 ? (
                            <span className="text-[11px] font-mono text-amber-600/80">
                              {row.ipa2}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Kemiripan Fonetik IPA Segmental */}
                      <td className="py-2.5 px-3 text-center">
                        {row.phoneticAlignment ? (
                          <div className="flex flex-col items-center gap-1 w-full min-w-[130px]">
                            <div className="flex items-center justify-between w-full px-1">
                              <span className="text-xs font-black font-mono text-purple-700 dark:text-purple-300">
                                {row.phoneticSimilarityPct ?? 0}%
                              </span>
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border ${row.phoneticAlignment.similarityBadge.badgeBg} ${row.phoneticAlignment.similarityBadge.badgeText} ${row.phoneticAlignment.similarityBadge.borderClass}`}>
                                {row.phoneticAlignment.similarityBadge.label}
                              </span>
                            </div>

                            {/* Mini Progress Meter Bar */}
                            <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 ${
                                  (row.phoneticSimilarityPct ?? 0) >= 80 
                                    ? 'bg-emerald-500' 
                                    : (row.phoneticSimilarityPct ?? 0) >= 50 
                                    ? 'bg-amber-500' 
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${row.phoneticSimilarityPct ?? 0}%` }}
                              />
                            </div>

                            {/* Detected Shifts Tags */}
                            {row.phoneticAlignment.shifts.length > 0 && (
                              <div className="flex flex-wrap justify-center gap-1 mt-0.5">
                                {row.phoneticAlignment.shifts.slice(0, 2).map((s, idx) => (
                                  <span
                                    key={idx}
                                    title={`${s.shiftType}: ${s.description}`}
                                    className="px-1.5 py-0.2 rounded text-[9px] font-mono font-black bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700 shadow-2xs cursor-help"
                                  >
                                    [{s.soundA}]↔[{s.soundB}]
                                  </span>
                                ))}
                                {row.phoneticAlignment.shifts.length > 2 && (
                                  <span className="text-[9px] text-slate-400 font-semibold">
                                    +{row.phoneticAlignment.shifts.length - 2}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Toggle Inline Alignment Ladder */}
                            <button
                              type="button"
                              onClick={() => setExpandedRowNo(expandedRowNo === row.no ? null : row.no)}
                              className="mt-0.5 text-[10px] text-purple-700 dark:text-purple-300 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                              title="Buka atau tutup visualisasi penjajaran segmen Needleman-Wunsch"
                            >
                              <span>{expandedRowNo === row.no ? 'Tutup Penjajaran' : 'Lihat Penjajaran'}</span>
                              {expandedRowNo === row.no ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Skor Dialektometri Badge */}
                      <td className="py-2.5 px-3 text-center">
                        {row.category === 'BEDA_LEKSIKAL' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>Tinggi (1.0)</span>
                          </span>
                        )}
                        {row.category === 'BEDA_FONEM' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <span>Sedang (0.5)</span>
                          </span>
                        )}
                        {row.category === 'SAMA' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <span>Sama (0.0)</span>
                          </span>
                        )}
                        {row.category === 'BELUM_DIISI' && (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
                            Belum Diisi
                          </span>
                        )}
                      </td>

                      {/* Catatan Analisis & Tombol Inspeksi IPA */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-600 line-clamp-2">
                            {row.note}
                          </span>
                          {row.phoneticAlignment && (
                            <button
                              type="button"
                              onClick={() => setSelectedWordForPhoneticModal(row.phoneticAlignment || null)}
                              className="shrink-0 px-2 py-1 rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                              title="Buka Penjajaran Segmen IPA & Detail Hukum Bunyi"
                            >
                              <Sparkles className="w-3 h-3 text-purple-600" />
                              <span className="hidden sm:inline">Inspeksi IPA</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Inline Expandable Alignment Ribbon Grid */}
                    {expandedRowNo === row.no && (
                      <tr className="bg-purple-50/40 dark:bg-purple-950/20 border-y border-purple-200 dark:border-purple-800">
                        <td colSpan={7} className="p-3 sm:p-4">
                          {row.phoneticAlignment ? (
                            <PhoneticSegmentVisualizer
                              mode="ribbon-grid"
                              alignment={row.phoneticAlignment}
                              point1Label={p1Option.name}
                              point2Label={p2Option.name}
                              onOpenInspector={() => setSelectedWordForPhoneticModal(row.phoneticAlignment || null)}
                            />
                          ) : (
                            <div className="text-xs text-slate-500 italic">
                              Transkripsi IPA belum tersedia untuk dilakukan penjajaran segmen.
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50">
            <Search className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
            <h4 className="text-sm font-bold text-slate-700">Tidak ada kosakata yang cocok</h4>
            <p className="text-xs text-slate-500 mt-1">
              Coba ganti filter kategori atau bersihkan kotak pencarian.
            </p>
            <button
              type="button"
              onClick={() => {
                setFilterCategory('all');
                setSearchQuery('');
              }}
              className="mt-3 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100"
            >
              Tampilkan Semua Kosakata
            </button>
          </div>
        )}
      </div>
      </>
      )}

      {/* MODAL INSPEKSI DETAIL SEGMEN FONETIK IPA */}
      <PhoneticShiftInspectorModal
        alignment={selectedWordForPhoneticModal}
        point1Label={p1Option.name}
        point2Label={p2Option.name}
        onClose={() => setSelectedWordForPhoneticModal(null)}
      />
    </div>
  );
};
