import React, { useState, useMemo } from 'react';
import { 
  X, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Layers, 
  Check, 
  RefreshCw, 
  Info,
  BookOpen,
  Tag,
  ShieldCheck,
  FileSpreadsheet,
  Globe,
  Filter
} from 'lucide-react';
import { KosakataItem } from '../../types/linguistic';
import { 
  detectLoanwordsWithAI, 
  calculateLoanwordSummary, 
  LoanwordDetectionResult,
  LoanwordSourceLanguage 
} from '../../utils/loanwordDetection';

interface LoanwordDetectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  swadeshList: KosakataItem[];
  bahasaDaerah?: string;
  namaDesa?: string;
  onUpdateSwadeshCatatan: (id: number, catatan: string) => void;
  onBatchUpdateSwadeshCatatan?: (updates: Array<{ id: number; catatan: string }>) => void;
}

export const LoanwordDetectorModal: React.FC<LoanwordDetectorModalProps> = ({
  isOpen,
  onClose,
  swadeshList,
  bahasaDaerah = 'Bahasa Sunda',
  namaDesa = 'Desa Pengamatan',
  onUpdateSwadeshCatatan,
  onBatchUpdateSwadeshCatatan
}) => {
  const [results, setResults] = useState<LoanwordDetectionResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasScanned, setHasScanned] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'loanwords_only' | 'indigenous_only'>('all');
  const [appliedAnnotationCount, setAppliedAnnotationCount] = useState<number | null>(null);

  // Run AI / Etymological Detection
  const handleStartDetection = async () => {
    setIsLoading(true);
    setAppliedAnnotationCount(null);
    try {
      const itemsToScan = swadeshList.map(s => ({
        id: s.id,
        glosIndonesia: s.glosIndonesia,
        bentukLokal: s.bentukLokal || '',
        transkripsiIPA: s.transkripsiIPA,
        catatan: s.catatan
      }));

      const detected = await detectLoanwordsWithAI(itemsToScan, bahasaDaerah, namaDesa);
      setResults(detected);
      setHasScanned(true);
    } catch (err) {
      console.error('Detection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate summary metrics
  const summary = useMemo(() => {
    return calculateLoanwordSummary(results);
  }, [results]);

  // Filter results
  const filteredResults = useMemo(() => {
    return results.filter(r => {
      // Type filter
      if (filterType === 'loanwords_only' && !r.isLoanword) return false;
      if (filterType === 'indigenous_only' && r.isLoanword) return false;

      // Source language filter
      if (filterSource !== 'all' && r.sourceLanguage !== filterSource) return false;

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchGlos = r.glosIndonesia.toLowerCase().includes(q);
        const matchLokal = r.bentukLokal.toLowerCase().includes(q);
        const matchEtymon = r.etymon.toLowerCase().includes(q);
        const matchExpl = r.explanation.toLowerCase().includes(q);
        const matchSource = r.sourceLanguage.toLowerCase().includes(q);
        if (!matchGlos && !matchLokal && !matchEtymon && !matchExpl && !matchSource) return false;
      }

      return true;
    });
  }, [results, filterType, filterSource, searchQuery]);

  // Apply loanword tags directly to the survey vocabulary notes (menandai kosakata)
  const handleApplyAnnotationsToNotes = () => {
    const loanwords = results.filter(r => r.isLoanword && r.suggestedAnnotation);
    if (loanwords.length === 0) return;

    if (onBatchUpdateSwadeshCatatan) {
      const updates = loanwords.map(lw => {
        const orig = swadeshList.find(s => s.id === lw.id);
        const existingNote = orig?.catatan ? orig.catatan.trim() : '';
        const annotation = lw.suggestedAnnotation;
        // Don't duplicate if already present
        const newNote = existingNote.includes(annotation)
          ? existingNote
          : existingNote ? `${existingNote} | ${annotation}` : annotation;
        return { id: lw.id, catatan: newNote };
      });
      onBatchUpdateSwadeshCatatan(updates);
    } else {
      loanwords.forEach(lw => {
        const orig = swadeshList.find(s => s.id === lw.id);
        const existingNote = orig?.catatan ? orig.catatan.trim() : '';
        const annotation = lw.suggestedAnnotation;
        const newNote = existingNote.includes(annotation)
          ? existingNote
          : existingNote ? `${existingNote} | ${annotation}` : annotation;
        onUpdateSwadeshCatatan(lw.id, newNote);
      });
    }

    setAppliedAnnotationCount(loanwords.length);
    setTimeout(() => setAppliedAnnotationCount(null), 4000);
  };

  // Export report to CSV
  const handleExportCSV = () => {
    const headers = [
      'No',
      'Glos Indonesia',
      'Bentuk Lokal',
      'Transkripsi IPA',
      'Status Serapan',
      'Bahasa Sumber',
      'Kata Asal (Etimon)',
      'Tingkat Keyakinan',
      'Penjelasan Etimologis',
      'Anotasi Disarankan',
      'Metode Deteksi'
    ];

    const rows = results.map(r => [
      r.id,
      `"${r.glosIndonesia.replace(/"/g, '""')}"`,
      `"${r.bentukLokal.replace(/"/g, '""')}"`,
      `"${(r.transkripsiIPA || '').replace(/"/g, '""')}"`,
      r.isLoanword ? 'KATA SERAPAN' : 'ASLI / KOGNAT AUSTRONESIA',
      `"${r.sourceLanguage.replace(/"/g, '""')}"`,
      `"${r.etymon.replace(/"/g, '""')}"`,
      r.confidence,
      `"${r.explanation.replace(/"/g, '""')}"`,
      `"${r.suggestedAnnotation.replace(/"/g, '""')}"`,
      r.detectedBy === 'gemini_ai' ? 'Gemini 3.8 Flash AI' : 'Kamus Etimologis Komparatif'
    ]);

    const meta = [
      `# LAPORAN DETEKSI KATA SERAPAN KOSAKATA SWADESH (AI)`,
      `# Bahasa: ${bahasaDaerah} — Titik: ${namaDesa}`,
      `# Total Kata Terisi: ${summary.totalFilled} / 200`,
      `# Kata Serapan Terdeteksi: ${summary.totalLoanwords} (${summary.loanwordPercentage}%)`,
      `# Tingkat Kemurnian Swadesh: ${summary.purityPercentage}%`,
      `# Waktu Analisis: ${new Date().toISOString()}`,
      ''
    ].join('\n');

    const csvContent = meta + '\n' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Deteksi_Kata_Serapan_${namaDesa}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp"
        role="dialog"
        aria-modal="true"
      >
        {/* MODAL HEADER */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Deteksi Kata Serapan Kosakata Swadesh (AI)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Menganalisis dan menandai pengaruh leksikal Bahasa Indonesia, Sanskerta, Arab, Belanda, Portugis, & bahasa asing lainnya pada daftar 200 Swadesh {bahasaDaerah}.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL CONTENT */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* ACTION BANNER */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-pink-950/30 border border-indigo-200/80 dark:border-indigo-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Pemeriksaan Kemurnian Leksikal Swadesh</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
                Daftar 200 Swadesh idealnya memuat leksikon dasar non-serapan. Fitur AI ini mendeteksi kata serapan dan interferensi Bahasa Indonesia yang mungkin dimasukkan oleh responden di lapangan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleStartDetection}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white shadow-md shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Menganalisis Kata...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>{hasScanned ? 'Pindai Ulang AI' : 'Mulai Deteksi AI Sekarang'}</span>
                  </>
                )}
              </button>

              {hasScanned && (
                <>
                  <button
                    type="button"
                    onClick={handleApplyAnnotationsToNotes}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors cursor-pointer"
                    title="Tandai tag serapan ke kolom catatan kosakata secara otomatis"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Tandai ke Catatan ({summary.totalLoanwords} Kata)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-semibold text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Ekspor CSV</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* APPLIED SUCCESS BANNER */}
          {appliedAnnotationCount !== null && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Berhasil menandai {appliedAnnotationCount} kosakata serapan ke dalam kolom catatan survei! Tag serapan kini tersimpan permanen.
              </span>
            </div>
          )}

          {/* METRICS DASHBOARD (IF SCANNED) */}
          {hasScanned && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Teranalisis</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{summary.totalFilled}</span>
                  <span className="text-xs text-slate-400">/ 200 glos</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block">Kata Serapan Terdeteksi</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-purple-700 dark:text-purple-300 font-mono">{summary.totalLoanwords}</span>
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">({summary.loanwordPercentage}%)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">Kemurnian Kosakata Swadesh</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 font-mono">{summary.purityPercentage}%</span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">asli/kognat</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block">Bahasa Sumber Terbanyak</span>
                <div className="mt-1">
                  {Object.entries(summary.sourcesBreakdown).length > 0 ? (
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 truncate block">
                      {Object.entries(summary.sourcesBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0]} ({Object.entries(summary.sourcesBreakdown).sort((a, b) => b[1] - a[1])[0]?.[1]} kata)
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Nihil serapan</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TABLE & FILTER CONTROLS */}
          {hasScanned && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                {/* SEARCH */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari kata, glos, etimon..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-44 sm:w-60"
                  />
                </div>

                {/* FILTERS */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px]">
                    <button
                      type="button"
                      onClick={() => setFilterType('all')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                        filterType === 'all'
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Semua ({results.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterType('loanwords_only')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                        filterType === 'loanwords_only'
                          ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Hanya Serapan ({summary.totalLoanwords})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterType('indigenous_only')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                        filterType === 'indigenous_only'
                          ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Asli/Kognat ({summary.totalFilled - summary.totalLoanwords})
                    </button>
                  </div>

                  {/* SOURCE SELECT */}
                  <select
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                    className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="all">Semua Bahasa Sumber</option>
                    <option value="Bahasa Indonesia / Melayu">Bahasa Indonesia / Melayu</option>
                    <option value="Sanskerta">Sanskerta</option>
                    <option value="Arab">Arab</option>
                    <option value="Belanda">Belanda</option>
                    <option value="Portugis">Portugis</option>
                    <option value="Tionghoa (Hokkien)">Tionghoa (Hokkien)</option>
                    <option value="Inggris">Inggris</option>
                    <option value="Persia">Persia</option>
                  </select>
                </div>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/60">
                      <th className="py-2.5 px-3 w-12 text-center">No</th>
                      <th className="py-2.5 px-3 w-36">Glos Indonesia</th>
                      <th className="py-2.5 px-3 w-40">Bentuk Lokal</th>
                      <th className="py-2.5 px-3 w-36">Status Serapan</th>
                      <th className="py-2.5 px-3 w-44">Bahasa Sumber & Etimon</th>
                      <th className="py-2.5 px-3">Penjelasan & Ciri Linguistik</th>
                      <th className="py-2.5 px-3 w-28 text-center">Aksi Cepat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredResults.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                          Tidak ada kata yang sesuai dengan filter pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredResults.map((row) => (
                        <tr 
                          key={`res-${row.id}`}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                            row.isLoanword ? 'bg-purple-50/30 dark:bg-purple-950/10' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center font-mono text-slate-400 text-[11px]">
                            {row.id}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                            {row.glosIndonesia}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                            <span>{row.bentukLokal || '(Kosong)'}</span>
                            {row.transkripsiIPA && (
                              <span className="block text-[10px] font-mono text-slate-400">{row.transkripsiIPA}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            {row.isLoanword ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>Kata Serapan</span>
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                Asli / Kognat
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            {row.isLoanword ? (
                              <div>
                                <strong className="text-slate-800 dark:text-slate-200 font-bold block text-[11px]">
                                  {row.sourceLanguage}
                                </strong>
                                <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 block">
                                  {row.etymon}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Warisan lokal</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                            {row.explanation}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {row.isLoanword && (
                              <button
                                type="button"
                                onClick={() => {
                                  onUpdateSwadeshCatatan(row.id, row.suggestedAnnotation);
                                }}
                                className="px-2 py-1 rounded text-[10px] font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-colors cursor-pointer"
                                title="Tandai catatan untuk kata ini"
                              >
                                Tandai Catatan
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* INITIAL STATE BEFORE SCAN */}
          {!hasScanned && !isLoading && (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <Sparkles className="w-10 h-10 mx-auto text-indigo-400 animate-pulse" />
              <div className="max-w-md mx-auto">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Belum Ada Analisis yang Dijalankan
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Klik tombol <strong>"Mulai Deteksi AI Sekarang"</strong> di atas untuk memindai 200 kosakata Swadesh secara otomatis menggunakan model Gemini 3.8 Flash.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-indigo-500" />
            <span>Menggunakan etimologi komparatif sejarah bahasa Austronesia & model Gemini.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg font-semibold text-xs bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
