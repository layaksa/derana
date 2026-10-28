import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Volume2, 
  ArrowLeftRight, 
  CheckCircle2, 
  Layers, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Info, 
  Activity, 
  Search,
  Download,
  ListFilter
} from 'lucide-react';
import { DialectComparisonWordRow } from '../../utils/dialectPointComparison';
import { detectPhoneticShifts, PhoneticShiftPattern } from '../../utils/phoneticChangeDetector';
import { analyzeCorpusPhonetics } from '../../utils/phoneticSegmentAligner';
import { PhoneticSegmentVisualizer } from './PhoneticSegmentVisualizer';

interface PhoneticChangeAnalysisProps {
  words: DialectComparisonWordRow[];
  point1Name: string;
  point2Name: string;
  onSelectWord?: (glos: string) => void;
}

export const PhoneticChangeAnalysis: React.FC<PhoneticChangeAnalysisProps> = ({
  words,
  point1Name,
  point2Name,
  onSelectWord
}) => {
  const [activeAnalysisMode, setActiveAnalysisMode] = useState<'aturan_pola' | 'matriks_segmen'>('aturan_pola');
  const [filterType, setFilterType] = useState<'ALL' | 'VOKAL' | 'KONSONAN' | 'ELISI_PENAMBAHAN' | 'STRUKTUR'>('ALL');
  const [simFilter, setSimFilter] = useState<'all' | 'high' | 'mid' | 'low'>('all');
  const [expandedPatternId, setExpandedPatternId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Run phonetic detector for sound laws
  const report = useMemo(() => {
    return detectPhoneticShifts(words);
  }, [words]);

  // Aggregate corpus phonetics for exact Swadesh IPA segment percentages
  const corpusSummary = useMemo(() => {
    return analyzeCorpusPhonetics(words);
  }, [words]);

  // Filter patterns
  const filteredPatterns = useMemo(() => {
    return report.patterns.filter(p => {
      if (filterType !== 'ALL' && p.type !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          p.name.toLowerCase().includes(q) ||
          p.ruleFormula.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.examples.some(ex => ex.glos.toLowerCase().includes(q) || ex.wordA.toLowerCase().includes(q) || ex.wordB.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [report.patterns, filterType, searchQuery]);

  // Filter words for segment matrix
  const filteredSegmentWords = useMemo(() => {
    return words.filter(w => {
      if (!w.bentuk1 || !w.bentuk2 || w.category === 'BELUM_DIISI') return false;
      const sim = w.phoneticSimilarityPct ?? 0;
      if (simFilter === 'high' && sim < 80) return false;
      if (simFilter === 'mid' && (sim < 45 || sim >= 80)) return false;
      if (simFilter === 'low' && sim >= 45) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchGlos = w.glos.toLowerCase().includes(q);
        const matchW1 = w.bentuk1.toLowerCase().includes(q);
        const matchW2 = w.bentuk2.toLowerCase().includes(q);
        const matchShifts = (w.detectedShifts || []).some(s => s.toLowerCase().includes(q));
        if (!matchGlos && !matchW1 && !matchW2 && !matchShifts) return false;
      }
      return true;
    });
  }, [words, simFilter, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedPatternId(prev => prev === id ? null : id);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-5 transition-all">
      {/* 1. HEADER & DIAGNOSIS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 shrink-0">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Analisis Perubahan Fonetik & Korespondensi Bunyi Otomatis
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Deteksi Hukum Bunyi Swadesh
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Mengidentifikasi pergeseran fonem teratur dan persentase kemiripan segmen IPA antara <strong>{point1Name}</strong> dan <strong>{point2Name}</strong>.
            </p>
          </div>
        </div>

        {/* Quick diagnosis pill */}
        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <div className="px-3.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-right">
            <span className="text-[10px] text-purple-700 dark:text-purple-300 block font-bold">Rerata Kemiripan IPA</span>
            <span className="text-base font-mono font-black text-purple-700 dark:text-purple-300">
              {corpusSummary.meanSimilarityPct}%
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-right">
            <span className="text-[10px] text-slate-400 block font-medium">Keteraturan Bunyi</span>
            <span className="text-sm font-mono font-black text-indigo-600 dark:text-indigo-400">
              {report.regularCorrespondenceIndex}%
            </span>
          </div>
        </div>
      </div>

      {/* 2. SUMMARY KPI STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {/* Kemiripan Fonetik IPA Swadesh */}
        <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 block mb-1">
            Kemiripan Fonetik IPA
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-purple-700 dark:text-purple-300">
              {corpusSummary.meanSimilarityPct}%
            </span>
            <span className="text-[10px] font-bold text-purple-600/80">
              {corpusSummary.meanSimilarityPct >= 80 ? 'Tinggi' : corpusSummary.meanSimilarityPct >= 50 ? 'Sedang' : 'Rendah'}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div 
              className="bg-purple-600 h-full rounded-full transition-all"
              style={{ width: `${corpusSummary.meanSimilarityPct}%` }}
            />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-sky-300 block mb-1">
            Pola Fonetik
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-blue-700 dark:text-sky-300">
              {report.distinctPatternCount}
            </span>
            <span className="text-xs text-blue-600/80">aturan</span>
          </div>
          <span className="text-[10px] text-blue-600/80 block mt-1">korespondensi bunyi</span>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 block mb-1">
            Total Pergeseran Bunyi
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-amber-700 dark:text-amber-300">
              {corpusSummary.totalShiftsDetected}
            </span>
            <span className="text-xs text-amber-600/80">kasus</span>
          </div>
          <span className="text-[10px] text-amber-700/80 dark:text-amber-400/80 block mt-1">segmen fonem bergeser</span>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block mb-1">
            Glos Dianalisis
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-300">
              {corpusSummary.totalTested}
            </span>
            <span className="text-xs text-emerald-600/80">kata</span>
          </div>
          <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 block mt-1">{corpusSummary.identicalCount} kognat identik</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Pola Dominan
          </span>
          <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 mt-0.5">
            {report.dominantShiftType}
          </span>
        </div>
      </div>

      {/* 3. LINGUISTIC DIAGNOSIS BANNER */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
        <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-900 dark:text-white">Kesimpulan Fonetik Komparatif: </strong>
          {report.summaryDiagnosis} Rata-rata kemiripan transkripsi segmen IPA Swadesh sebesar <strong className="text-purple-700 dark:text-purple-300">{corpusSummary.meanSimilarityPct}%</strong>.
        </div>
      </div>

      {/* 4. MODE SWITCHER: ATURAN PENGGESERAN vs MATRIKS SEGMEN */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
        <button
          type="button"
          onClick={() => setActiveAnalysisMode('aturan_pola')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeAnalysisMode === 'aturan_pola'
              ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Aturan Korespondensi & Hukum Bunyi ({report.patterns.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAnalysisMode('matriks_segmen')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeAnalysisMode === 'matriks_segmen'
              ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <ListFilter className="w-3.5 h-3.5" />
          <span>Matriks Deteksi Segmen IPA & Kemiripan Kosakata ({words.filter(w => w.bentuk1 && w.bentuk2).length})</span>
        </button>
      </div>

      {activeAnalysisMode === 'matriks_segmen' ? (
        /* ========================================================================= */
        /* VIEW 2: MATRIKS SEGMEN IPA KOSAKATA SWADESH & PERSENTASE KEMIRIPAN */
        /* ========================================================================= */
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSimFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  simFilter === 'all'
                    ? 'bg-purple-600 text-white shadow-2xs font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Semua ({words.filter(w => w.bentuk1 && w.bentuk2).length})
              </button>
              <button
                type="button"
                onClick={() => setSimFilter('high')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  simFilter === 'high'
                    ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Kemiripan Tinggi (≥80%)
              </button>
              <button
                type="button"
                onClick={() => setSimFilter('mid')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  simFilter === 'mid'
                    ? 'bg-amber-600 text-white shadow-2xs font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Pergeseran Fonem (45-79%)
              </button>
              <button
                type="button"
                onClick={() => setSimFilter('low')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  simFilter === 'low'
                    ? 'bg-rose-600 text-white shadow-2xs font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Beda Leksikal (&lt;45%)
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari glos, kata, fonem..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-purple-500 w-48 sm:w-56"
              />
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-[500px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] z-10">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">No</th>
                  <th className="py-2.5 px-3">Glos Indonesia</th>
                  <th className="py-2.5 px-3 text-indigo-700 dark:text-indigo-400">
                    {point1Name.split(' ')[0]} (Bentuk & Segmen IPA)
                  </th>
                  <th className="py-2.5 px-3 text-amber-700 dark:text-amber-400">
                    {point2Name.split(' ')[0]} (Bentuk & Segmen IPA)
                  </th>
                  <th className="py-2.5 px-3 text-center w-36">Kemiripan Fonetik IPA</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {filteredSegmentWords.map((row) => (
                  <tr key={row.no} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400 text-[11px]">
                      {row.no}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white capitalize">
                      {row.glos}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{row.bentuk1}</div>
                      <div className="mt-0.5">
                        {row.phoneticAlignment ? (
                          <PhoneticSegmentVisualizer
                            mode="inline-tokens"
                            targetPoint={1}
                            alignment={row.phoneticAlignment}
                          />
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400">{row.ipa1}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{row.bentuk2}</div>
                      <div className="mt-0.5">
                        {row.phoneticAlignment ? (
                          <PhoneticSegmentVisualizer
                            mode="inline-tokens"
                            targetPoint={2}
                            alignment={row.phoneticAlignment}
                          />
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400">{row.ipa2}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center justify-between w-full px-1">
                          <span className="text-xs font-black font-mono text-purple-700 dark:text-purple-300">
                            {row.phoneticSimilarityPct ?? 0}%
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${row.phoneticAlignment?.similarityBadge.badgeBg} ${row.phoneticAlignment?.similarityBadge.badgeText} ${row.phoneticAlignment?.similarityBadge.borderClass}`}>
                            {row.phoneticAlignment?.similarityBadge.label}
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
                        {row.phoneticAlignment && row.phoneticAlignment.shifts.length > 0 && (
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
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {onSelectWord && (
                        <button
                          type="button"
                          onClick={() => onSelectWord(row.glos)}
                          className="px-2 py-1 rounded-lg text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Cek di Tabel →
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW 1: ATURAN PENGGESERAN FONEM & POLA KORESPONDENSI */
        /* ========================================================================= */
        <>
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'ALL'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Semua Tipe ({report.patterns.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('VOKAL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'VOKAL'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Pergeseran Vokal
              </button>
              <button
                type="button"
                onClick={() => setFilterType('KONSONAN')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'KONSONAN'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Konsonan
              </button>
              <button
                type="button"
                onClick={() => setFilterType('ELISI_PENAMBAHAN')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'ELISI_PENAMBAHAN'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Elisi / Pelemahan
              </button>
              <button
                type="button"
                onClick={() => setFilterType('STRUKTUR')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'STRUKTUR'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Struktur Silaba
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari pola, kata, glos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-purple-500 w-48 sm:w-56"
              />
            </div>
          </div>

          {/* Patterns List */}
          <div className="space-y-3">
            {filteredPatterns.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
                Tidak ditemukan pola korespondensi fonetik yang sesuai dengan filter.
              </div>
            ) : (
              filteredPatterns.map((pattern) => {
                const isExpanded = expandedPatternId === pattern.id;
                return (
                  <div 
                    key={pattern.id}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-850 transition-all hover:border-purple-300 dark:hover:border-purple-800"
                  >
                    {/* Accordion Header */}
                    <div 
                      onClick={() => toggleExpand(pattern.id)}
                      className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold ${
                          pattern.type === 'VOKAL'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-sky-300'
                            : pattern.type === 'KONSONAN'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {pattern.ruleFormula}
                        </span>

                        <div>
                          <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{pattern.name}</span>
                            <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                              pattern.regularity === 'Sangat Teratur'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : pattern.regularity === 'Cukup Teratur'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-sky-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {pattern.regularity}
                            </span>
                          </h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {pattern.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300 block">
                            {pattern.frequency} kata ({pattern.percentage}%)
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {isExpanded ? 'Sembunyikan contoh' : 'Klik lihat contoh'}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Accordion Content: Example Word Pairs Table */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <div className="py-2 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed border-b border-slate-100 dark:border-slate-800 mb-2.5">
                          <strong className="text-slate-900 dark:text-white">Deskripsi Linguistik: </strong>
                          {pattern.description}
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                              <tr>
                                <th className="py-2 px-3">Glos Indonesia</th>
                                <th className="py-2 px-3">{point1Name} (Bentuk 1)</th>
                                <th className="py-2 px-3">{point2Name} (Bentuk 2)</th>
                                <th className="py-2 px-3 text-center">Posisi Silaba</th>
                                <th className="py-2 px-3 text-right">Aksi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {pattern.examples.map((ex, exIdx) => (
                                <tr key={exIdx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                  <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                                    {ex.glos}
                                  </td>
                                  <td className="py-2 px-3">
                                    <span className="font-medium text-slate-800 dark:text-slate-200">{ex.wordA}</span>
                                    <span className="text-[10px] font-mono text-slate-400 block">{ex.ipaA}</span>
                                  </td>
                                  <td className="py-2 px-3">
                                    <span className="font-medium text-purple-700 dark:text-purple-300">{ex.wordB}</span>
                                    <span className="text-[10px] font-mono text-purple-400 block">{ex.ipaB}</span>
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                      {ex.position}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 text-right">
                                    {onSelectWord && (
                                      <button
                                        type="button"
                                        onClick={() => onSelectWord(ex.glos)}
                                        className="text-[11px] font-bold text-indigo-600 dark:text-sky-400 hover:underline cursor-pointer"
                                      >
                                        Cek Glos →
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};
