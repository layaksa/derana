import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw, 
  Layers, 
  ExternalLink, 
  AlertCircle,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  Info,
  ChevronDown,
  ChevronUp,
  MapPin,
  Check,
  ArrowLeftRight,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { 
  KosakataLengkapData, 
  TitikPembandingDialektometri, 
  TitikPengamatan,
  HasilDialektometriData,
  SurveyRecord 
} from '../../types/linguistic';
import { hitungDialektometri, calculateDistanceKm, parseNum } from '../../utils/calculations';
import { compareTwoPoints, exportComparisonSummaryToCSV, ComparisonResultStats } from '../../utils/dialectPointComparison';
import { classifyWordPair } from '../../utils/dialectometryComparator';

interface Section15LexicalDifferenceCalculatorProps {
  kosakataLengkap: KosakataLengkapData;
  titikPengamatan: TitikPengamatan;
  dialektometriData: HasilDialektometriData;
  allSurveys?: SurveyRecord[];
  activeSurveyId?: string | null;
  onUpdateTitikPembanding: (updatedList: TitikPembandingDialektometri[]) => void;
  onNavigateToSection16?: () => void;
}

export const Section15LexicalDifferenceCalculator: React.FC<Section15LexicalDifferenceCalculatorProps> = ({
  kosakataLengkap,
  titikPengamatan,
  dialektometriData,
  allSurveys,
  activeSurveyId,
  onUpdateTitikPembanding,
  onNavigateToSection16
}) => {
  const [selectedTpId, setSelectedTpId] = useState<string>(
    dialektometriData.titikPembandingList[0]?.id || 'TP-02'
  );
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [detailFilter, setDetailFilter] = useState<'all' | 'significant' | 'phonetic' | 'identical'>('all');
  const [detailSearch, setDetailSearch] = useState<string>('');
  const [expandedWordDetail, setExpandedWordDetail] = useState<boolean>(true);

  // Reference Survey Coordinates & Name
  const refDesa = titikPengamatan.namaDesa || 'Titik Acuan (Desa Ini)';
  const refBahasa = titikPengamatan.bahasaDigunakan || 'Bahasa Titik Ini';

  // Count filled words in active survey
  const activeSwadeshFilled = useMemo(() => {
    return kosakataLengkap.swadeshList.filter(s => s.bentukLokal && s.bentukLokal.trim() !== '').length;
  }, [kosakataLengkap.swadeshList]);

  // Compute lexical differences for each comparison point
  const pointsCalculations = useMemo(() => {
    return dialektometriData.titikPembandingList.map(tp => {
      // 1. Check if matching survey exists in allSurveys
      const matchingSurvey = allSurveys?.find(s => 
        s.id !== activeSurveyId && 
        (s.title?.toLowerCase().includes(tp.desa.toLowerCase()) || 
         s.data?.titikPengamatan?.namaDesa?.toLowerCase() === tp.desa.toLowerCase() ||
         s.desa?.toLowerCase() === tp.desa.toLowerCase())
      );

      let totalTested = 0;
      let sLeksikal = 0;
      let sFonem = 0;
      let sSama = 0;
      let effectiveS = 0;
      let dPercent = 0;
      let statusGuiter: TitikPembandingDialektometri['statusHubungan'] = 'Tidak Berbeda';
      let statsObj: ComparisonResultStats | null = null;

      if (matchingSurvey && matchingSurvey.data?.kosakataLengkap?.swadeshList && kosakataLengkap.swadeshList) {
        // Direct survey-to-survey Swadesh comparison
        const activeSwadesh = kosakataLengkap.swadeshList;
        const compSwadesh = matchingSurvey.data.kosakataLengkap.swadeshList;

        compSwadesh.forEach((itemB) => {
          const itemA = activeSwadesh.find(a => 
            a.id === itemB.id || 
            a.glosIndonesia.toLowerCase().trim() === itemB.glosIndonesia.toLowerCase().trim()
          );

          if (itemA && itemA.bentukLokal && itemB.bentukLokal && itemA.bentukLokal.trim() && itemB.bentukLokal.trim()) {
            totalTested++;
            const classification = classifyWordPair(itemA.bentukLokal, itemB.bentukLokal, itemA.glosIndonesia);
            if (classification.category === 'BEDA_LEKSIKAL') {
              sLeksikal++;
            } else if (classification.category === 'BEDA_FONEM') {
              sFonem++;
            } else {
              sSama++;
            }
          }
        });

        const n = totalTested > 0 ? totalTested : 200;
        effectiveS = sLeksikal + (sFonem * 0.5);
        const calc = hitungDialektometri(Math.round(effectiveS), n);
        dPercent = calc.persentase;
        statusGuiter = calc.kategori;
      } else {
        // Fallback to comparative corpus / TP preset dictionary comparison
        const stats = compareTwoPoints(
          'TP-REF',
          titikPengamatan.namaDesa ? `Desa ${titikPengamatan.namaDesa} (Ref)` : 'Titik Acuan (Ref)',
          tp.id,
          tp.desa ? `Desa ${tp.desa}` : (tp.namaTitik || tp.id),
          kosakataLengkap,
          dialektometriData.titikPembandingList
        );

        if (stats) {
          statsObj = stats;
          totalTested = stats.totalTested;
          sLeksikal = stats.jumlahBedaLeksikal;
          sFonem = stats.jumlahBedaFonem;
          sSama = stats.jumlahSama;
          effectiveS = stats.effectiveDifferenceCount;
          dPercent = stats.persentasePerbedaan;
          statusGuiter = stats.statusGuiter;
        }
      }

      // Check whether currently stored values in Section 16 match the newly calculated values
      const currentStoredPercent = tp.persentaseBeda ?? hitungDialektometri(tp.jumlahBeda, tp.jumlahGlos).persentase;
      const isSynced = Math.abs(currentStoredPercent - dPercent) < 0.2 && tp.jumlahGlos === (totalTested > 0 ? totalTested : 200);

      return {
        point: tp,
        totalTested: totalTested > 0 ? totalTested : 200,
        sLeksikal,
        sFonem,
        sSama,
        effectiveS: Math.round(effectiveS),
        dPercent,
        statusGuiter,
        isSynced,
        statsObj
      };
    });
  }, [dialektometriData.titikPembandingList, allSurveys, activeSurveyId, kosakataLengkap, titikPengamatan]);

  // Overall status check
  const allSynced = useMemo(() => {
    return pointsCalculations.every(p => p.isSynced);
  }, [pointsCalculations]);

  const avgDifference = useMemo(() => {
    if (pointsCalculations.length === 0) return 0;
    const sum = pointsCalculations.reduce((acc, p) => acc + p.dPercent, 0);
    return Math.round((sum / pointsCalculations.length) * 10) / 10;
  }, [pointsCalculations]);

  // Get detailed word comparison for the currently selected comparison point
  const currentDetailStats: ComparisonResultStats | null = useMemo(() => {
    const selectedCalc = pointsCalculations.find(p => p.point.id === selectedTpId);
    if (!selectedCalc) return null;

    // Check if matching survey
    const matchingSurvey = allSurveys?.find(s => 
      s.id !== activeSurveyId && 
      (s.title?.toLowerCase().includes(selectedCalc.point.desa.toLowerCase()) || 
       s.data?.titikPengamatan?.namaDesa?.toLowerCase() === selectedCalc.point.desa.toLowerCase() ||
       s.desa?.toLowerCase() === selectedCalc.point.desa.toLowerCase())
    );

    if (matchingSurvey && matchingSurvey.data?.kosakataLengkap?.swadeshList && kosakataLengkap.swadeshList) {
      const activeSwadesh = kosakataLengkap.swadeshList;
      const compSwadesh = matchingSurvey.data.kosakataLengkap.swadeshList;
      const wordRows: any[] = [];
      let sLeksikal = 0;
      let sFonem = 0;
      let sSama = 0;
      let total = 0;

      activeSwadesh.forEach((itemA, index) => {
        const itemB = compSwadesh.find(b => 
          b.id === itemA.id || 
          b.glosIndonesia.toLowerCase().trim() === itemA.glosIndonesia.toLowerCase().trim()
        );

        const w1 = itemA.bentukLokal || '';
        const ipa1 = itemA.transkripsiIPA || '';
        const w2 = itemB?.bentukLokal || '';
        const ipa2 = itemB?.transkripsiIPA || '';

        if (!w1 && !w2) return;

        total++;
        const classification = classifyWordPair(w1, w2, itemA.glosIndonesia);
        let score = 0;
        let isSignificant = false;

        if (classification.category === 'BEDA_LEKSIKAL') {
          score = 1.0;
          isSignificant = true;
          sLeksikal++;
        } else if (classification.category === 'BEDA_FONEM') {
          score = 0.5;
          sFonem++;
        } else {
          score = 0.0;
          sSama++;
        }

        wordRows.push({
          no: index + 1,
          glos: itemA.glosIndonesia,
          bentuk1: w1,
          ipa1,
          bentuk2: w2,
          ipa2,
          score,
          category: classification.category,
          isSignificant,
          note: classification.note
        });
      });

      const effectiveS = sLeksikal + (sFonem * 0.5);
      const n = total > 0 ? total : 200;
      const d = parseFloat(((effectiveS / n) * 100).toFixed(1));
      const calc = hitungDialektometri(Math.round(effectiveS), n);

      return {
        point1Name: `TP-01 ${refDesa} (Section 15)`,
        point2Name: `${selectedCalc.point.namaTitik} (${selectedCalc.point.desa})`,
        totalTested: n,
        jumlahBedaLeksikal: sLeksikal,
        jumlahBedaFonem: sFonem,
        jumlahSama: sSama,
        effectiveDifferenceCount: effectiveS,
        persentasePerbedaan: d,
        persentaseKemiripan: parseFloat((Math.max(0, 100 - d)).toFixed(1)),
        statusGuiter: calc.kategori,
        statusBadgeColor: calc.warnaBadge,
        words: wordRows
      };
    }

    // Otherwise use compareTwoPoints
    return compareTwoPoints(
      'TP-REF',
      `TP-01 ${refDesa} (Section 15)`,
      selectedCalc.point.id,
      `${selectedCalc.point.namaTitik} (${selectedCalc.point.desa})`,
      kosakataLengkap,
      dialektometriData.titikPembandingList
    );
  }, [selectedTpId, pointsCalculations, allSurveys, activeSurveyId, kosakataLengkap, refDesa, dialektometriData.titikPembandingList]);

  // Filter word details
  const filteredWordDetails = useMemo(() => {
    if (!currentDetailStats?.words) return [];
    return currentDetailStats.words.filter(row => {
      if (detailFilter === 'significant' && row.category !== 'BEDA_LEKSIKAL') return false;
      if (detailFilter === 'phonetic' && row.category !== 'BEDA_FONEM') return false;
      if (detailFilter === 'identical' && row.category !== 'SAMA') return false;

      if (detailSearch.trim() !== '') {
        const q = detailSearch.toLowerCase().trim();
        const mGlos = row.glos.toLowerCase().includes(q);
        const mW1 = row.bentuk1.toLowerCase().includes(q);
        const mW2 = row.bentuk2.toLowerCase().includes(q);
        const mNote = row.note.toLowerCase().includes(q);
        if (!mGlos && !mW1 && !mW2 && !mNote) return false;
      }
      return true;
    });
  }, [currentDetailStats, detailFilter, detailSearch]);

  // Sync a single point's calculated lexical difference to Section 16
  const handleSyncSinglePoint = (tpId: string) => {
    const calc = pointsCalculations.find(p => p.point.id === tpId);
    if (!calc) return;

    const updated = dialektometriData.titikPembandingList.map(tp => {
      if (tp.id === tpId) {
        return {
          ...tp,
          jumlahBeda: calc.effectiveS,
          jumlahGlos: calc.totalTested,
          persentaseBeda: calc.dPercent,
          statusHubungan: calc.statusGuiter
        };
      }
      return tp;
    });

    onUpdateTitikPembanding(updated);
    setSyncFeedback(`✓ Berhasil menyinkronkan ${calc.point.namaTitik}: ${calc.dPercent}% beda leksikal (${calc.statusGuiter}) ke Section 16!`);
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  // Sync ALL points' calculated lexical difference to Section 16 at once
  const handleSyncAllPointsToSection16 = () => {
    if (pointsCalculations.length === 0) return;

    const updated = dialektometriData.titikPembandingList.map(tp => {
      const calc = pointsCalculations.find(c => c.point.id === tp.id);
      if (calc) {
        return {
          ...tp,
          jumlahBeda: calc.effectiveS,
          jumlahGlos: calc.totalTested,
          persentaseBeda: calc.dPercent,
          statusHubungan: calc.statusGuiter
        };
      }
      return tp;
    });

    onUpdateTitikPembanding(updated);
    setSyncFeedback(`✓ Berhasil menghitung otomatis dan menyinkronkan seluruh (${updated.length}) titik pembanding ke Section 16 (Dialektometri)!`);
    setTimeout(() => setSyncFeedback(null), 4500);
  };

  // Badge styling helper
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Perbedaan Bahasa':
      case 'Beda Bahasa':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Perbedaan Dialek':
      case 'Beda Dialek':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Perbedaan Subdialek':
      case 'Beda Subbahasa':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Perbedaan Wicara':
      case 'Beda Wicara':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'Tidak Berbeda':
      case 'Beda Wicara/Subdialek':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-indigo-50/90 via-white to-blue-50/80 border border-indigo-100 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900">
                  Perhitungan Otomatis Persentase Beda Leksikal (Dialektometri)
                </h3>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200">
                  Metode Guiter d = (s/n) × 100%
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Fitur ini menghitung secara otomatis jumlah perbedaan leksikal (s), glos teruji (n), dan persentase perbedaan dialektometri berdasarkan {activeSwadeshFilled} kata Swadesh yang telah Anda input di Section 15 untuk mengisi Section 16 secara instan dan akurat.
              </p>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleSyncAllPointsToSection16}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer hover:shadow-sm"
              title="Perbarui seluruh data Section 16 berdasarkan kosakata Section 15"
            >
              <Sparkles className="w-4 h-4 text-indigo-200 animate-pulse" />
              <span>Hitung & Terapkan Semua ke Section 16</span>
            </button>

            {onNavigateToSection16 && (
              <button
                type="button"
                onClick={onNavigateToSection16}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <span>Buka Layar Section 16</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Feedback Alert */}
        {syncFeedback && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{syncFeedback}</span>
            </div>
            {onNavigateToSection16 && (
              <button
                type="button"
                onClick={onNavigateToSection16}
                className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat di Section 16</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Glos Swadesh Terisi
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{activeSwadeshFilled}</span>
            <span className="text-xs text-slate-500">/ 200 Glos</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (activeSwadeshFilled / 200) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-1.5 block">
            {activeSwadeshFilled >= 150 ? '✓ Korpus sangat representatif' : 'Disarankan mengisi minimal 100 kata'}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Titik Pembanding (TP)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {dialektometriData.titikPembandingList.length}
            </span>
            <span className="text-xs text-slate-500">Lokasi</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 truncate">
            {dialektometriData.titikPembandingList.map(tp => tp.desa).join(', ') || 'Belum ada titik pembanding'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Rata-rata Beda Leksikal
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-700">{avgDifference}%</span>
            <span className="text-xs text-slate-500">indeks dialek</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 mt-2">
            <span>Standar Dialektometri Guiter</span>
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Status Sinkron Section 16
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            {allSynced ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-sm font-bold text-emerald-700">Tersinkron Penuh</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-sm font-bold text-amber-700">Perlu Diterapkan</span>
              </>
            )}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            {allSynced 
              ? 'Data dialektometri Section 16 sudah sesuai dengan Section 15.' 
              : 'Klik tombol Terapkan untuk memperbarui Section 16.'}
          </p>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Matriks Perhitungan Otomatis Antar Titik Pengamatan</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Titik Acuan: <strong className="text-slate-700">{refDesa}</strong> ({refBahasa}) dibandingkan dengan titik-titik berikut:
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              Formula: <span className="font-mono font-semibold text-slate-700">d = (s / n) × 100%</span>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Titik Pengamatan Pembanding</th>
                <th className="py-3 px-3">Glos Diuji (n)</th>
                <th className="py-3 px-3">Beda Leksikal (s)</th>
                <th className="py-3 px-3">Persentase (d)</th>
                <th className="py-3 px-3">Kategori Hubungan (Guiter)</th>
                <th className="py-3 px-3">Status Sinkron</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pointsCalculations.map((calc) => {
                const isSelected = calc.point.id === selectedTpId;
                return (
                  <tr 
                    key={calc.point.id}
                    className={`hover:bg-indigo-50/40 transition-colors ${
                      isSelected ? 'bg-indigo-50/60 font-medium' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setSelectedTpId(calc.point.id)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border cursor-pointer ${
                            isSelected 
                              ? 'bg-indigo-600 text-white border-indigo-600' 
                              : 'bg-slate-100 text-slate-700 border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          {calc.point.id.replace('TP-', '')}
                        </button>
                        <div>
                          <button
                            type="button"
                            onClick={() => setSelectedTpId(calc.point.id)}
                            className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer text-left block"
                          >
                            {calc.point.namaTitik}
                          </button>
                          <span className="text-[11px] text-slate-500">
                            Desa {calc.point.desa} • {calc.point.bahasa}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-slate-700">
                      {calc.totalTested} kata
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900">{calc.effectiveS}</span>
                        <span className="text-[10px] text-slate-500">
                          ({calc.sLeksikal} leks + {calc.sFonem} fon)
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-700 text-sm">
                          {calc.dPercent}%
                        </span>
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 hidden sm:block">
                          <div 
                            className="bg-indigo-600 h-1.5 rounded-full" 
                            style={{ width: `${Math.min(100, calc.dPercent)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${getCategoryBadgeClass(calc.statusGuiter)}`}>
                        {calc.statusGuiter}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      {calc.isSynced ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Tersinkron</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span>Perlu Update</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedTpId(calc.point.id)}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer border ${
                            isSelected 
                              ? 'bg-indigo-100 text-indigo-800 border-indigo-300' 
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          Inspeksi Kata
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSyncSinglePoint(calc.point.id)}
                          className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold shadow-2xs transition-colors cursor-pointer"
                          title="Terapkan hasil perhitungan ini ke Section 16"
                        >
                          Terapkan
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-600" />
            <span>
              Perhitungan dialektometri otomatis mendeteksi kognat leksikal (skor 1.0) dan variasi fonemis (skor 0.5) sesuai kaidah dialektologi Guiter.
            </span>
          </span>
          <span className="text-[11px] font-semibold text-slate-700">
            Total {pointsCalculations.length} Titik Pembanding Teranalisis
          </span>
        </div>
      </div>

      {/* Word-by-Word Lexical Comparison Explorer for Selected Point */}
      {currentDetailStats && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
                  <span>Rincian Beda Leksikal Kata per Kata:</span>
                </h4>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {currentDetailStats.point1Name} vs {currentDetailStats.point2Name}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Menampilkan pasangan kosakata, bentuk IPA, kategori perbedaan, dan skor dialektometri.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => exportComparisonSummaryToCSV(currentDetailStats)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Unduh CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setExpandedWordDetail(!expandedWordDetail)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>{expandedWordDetail ? 'Tutup Tabel' : 'Buka Tabel'}</span>
                {expandedWordDetail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {expandedWordDetail && (
            <>
              {/* Search & Filter Controls */}
              <div className="p-3.5 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={detailSearch}
                    onChange={e => setDetailSearch(e.target.value)}
                    placeholder="Cari glos atau kata lokal..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                  <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
                    <Filter className="w-3 h-3" />
                    <span>Filter:</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setDetailFilter('all')}
                    className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition-colors ${
                      detailFilter === 'all'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Semua ({currentDetailStats.words.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setDetailFilter('significant')}
                    className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition-colors flex items-center gap-1 ${
                      detailFilter === 'significant'
                        ? 'bg-rose-600 text-white'
                        : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
                    }`}
                  >
                    <span>Beda Leksikal (1.0)</span>
                    <span className="font-mono text-[10px] px-1 rounded bg-black/10">
                      {currentDetailStats.jumlahBedaLeksikal}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDetailFilter('phonetic')}
                    className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition-colors flex items-center gap-1 ${
                      detailFilter === 'phonetic'
                        ? 'bg-amber-600 text-white'
                        : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                    }`}
                  >
                    <span>Beda Fonem (0.5)</span>
                    <span className="font-mono text-[10px] px-1 rounded bg-black/10">
                      {currentDetailStats.jumlahBedaFonem}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDetailFilter('identical')}
                    className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition-colors flex items-center gap-1 ${
                      detailFilter === 'identical'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    <span>Sama (0.0)</span>
                    <span className="font-mono text-[10px] px-1 rounded bg-black/10">
                      {currentDetailStats.jumlahSama}
                    </span>
                  </button>
                </div>
              </div>

              {/* Word List Table */}
              <div className="max-h-[380px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 border-b border-slate-200 z-10">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">No</th>
                      <th className="py-2.5 px-3">Glos Indonesia</th>
                      <th className="py-2.5 px-3">Bentuk (Desa Ini / Sec. 15)</th>
                      <th className="py-2.5 px-3">Bentuk Pembanding</th>
                      <th className="py-2.5 px-3">Kategori</th>
                      <th className="py-2.5 px-2 text-center">Skor</th>
                      <th className="py-2.5 px-3">Catatan Linguistik</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredWordDetails.map((w) => (
                      <tr key={w.no} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {w.no}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {w.glos}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-medium text-slate-900">{w.bentuk1 || '—'}</span>
                          {w.ipa1 && (
                            <span className="text-[11px] text-slate-500 font-mono ml-1.5">{w.ipa1}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-medium text-slate-900">{w.bentuk2 || '—'}</span>
                          {w.ipa2 && (
                            <span className="text-[11px] text-slate-500 font-mono ml-1.5">{w.ipa2}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {w.category === 'BEDA_LEKSIKAL' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              Beda Leksikal
                            </span>
                          )}
                          {w.category === 'BEDA_FONEM' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Beda Fonem
                            </span>
                          )}
                          {w.category === 'SAMA' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Kognat Sama
                            </span>
                          )}
                          {w.category === 'BELUM_DIISI' && (
                            <span className="text-slate-400 italic text-[11px]">
                              Belum Terisi
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-700">
                          {w.score.toFixed(1)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                          {w.note || '—'}
                        </td>
                      </tr>
                    ))}

                    {filteredWordDetails.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          Tidak ditemukan kata yang cocok dengan filter atau kata pencarian.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Section15LexicalDifferenceCalculator;
