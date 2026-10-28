import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Settings2, 
  BookOpen, 
  CheckCircle2, 
  Layers, 
  FileText, 
  Copy, 
  Check, 
  ArrowRight, 
  Compass, 
  Info, 
  TrendingUp, 
  AlertTriangle,
  RotateCcw,
  Sliders,
  Share2,
  GitBranch,
  ShieldCheck,
  MapPin,
  Clock,
  HelpCircle
} from 'lucide-react';
import { 
  TitikPengamatan, 
  SituasiGeografis, 
  TitikPembandingDialektometri 
} from '../../types/linguistic';
import { 
  ThresholdConfig, 
  ThresholdStandardId, 
  PRESET_THRESHOLDS, 
  classifyLanguageRelationship, 
  generateLinguisticInterpretationReport,
  estimateGlottochronologyTimeDepth 
} from '../../utils/linguisticClassification';
import { calculateDistanceKm, parseNum, hitungDialektometri } from '../../utils/calculations';

interface Section16LinguisticClassificationProps {
  titikPengamatan: TitikPengamatan;
  situasiGeografis: SituasiGeografis;
  titikPembandingList: TitikPembandingDialektometri[];
  onUpdateTitikPembanding: (list: TitikPembandingDialektometri[]) => void;
  onUpdateCatatan: (field: 'catatanIsoglos' | 'kesimpulanGeolinguistik', value: string) => void;
  currentCatatanIsoglos?: string;
  currentKesimpulanGeolinguistik?: string;
}

export const Section16LinguisticClassification: React.FC<Section16LinguisticClassificationProps> = ({
  titikPengamatan,
  situasiGeografis,
  titikPembandingList,
  onUpdateTitikPembanding,
  onUpdateCatatan,
  currentCatatanIsoglos = '',
  currentKesimpulanGeolinguistik = ''
}) => {
  // Active threshold standard
  const [selectedStandard, setSelectedStandard] = useState<ThresholdStandardId>('badan_bahasa');
  
  // Custom threshold values (if 'kustom' selected)
  const [customT1, setCustomT1] = useState<number>(20);
  const [customT2, setCustomT2] = useState<number>(50);
  const [customT3, setCustomT3] = useState<number>(80);

  // Active configuration based on standard or custom
  const activeConfig: ThresholdConfig = useMemo(() => {
    if (selectedStandard === 'kustom') {
      return {
        id: 'kustom',
        name: 'Ambang Batas Kustom Pengguna',
        source: 'Parameter yang disesuaikan secara manual oleh peneliti',
        description: `Ambang batas kustom: ≤${customT1}% Wicara, ${customT1 + 1}-${customT2}% Dialek, ${customT2 + 1}-${customT3}% Subbahasa, >${customT3}% Bahasa.`,
        t1: customT1,
        t2: customT2,
        t3: customT3,
        labelWicara: 'Beda Wicara/Subdialek',
        labelDialek: 'Beda Dialek',
        labelSubbahasa: 'Beda Subbahasa',
        labelBahasa: 'Beda Bahasa'
      };
    }
    return PRESET_THRESHOLDS[selectedStandard];
  }, [selectedStandard, customT1, customT2, customT3]);

  // Generate complete automatic interpretation report
  const report = useMemo(() => {
    return generateLinguisticInterpretationReport(
      titikPengamatan,
      situasiGeografis,
      titikPembandingList,
      activeConfig
    );
  }, [titikPengamatan, situasiGeografis, titikPembandingList, activeConfig]);

  // Feedback states
  const [copiedSection, setCopiedSection] = useState<'kesimpulan' | 'isoglos' | null>(null);
  const [appliedFeedback, setAppliedFeedback] = useState<string | null>(null);

  // Copy text to clipboard
  const handleCopyText = (type: 'kesimpulan' | 'isoglos', text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(type);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  // Re-classify and apply the active threshold to all comparison points in data
  const handleReclassifyAllPoints = () => {
    if (titikPembandingList.length === 0) return;

    const updated = titikPembandingList.map((tp) => {
      const calc = hitungDialektometri(tp.jumlahBeda, tp.jumlahGlos);
      const res = classifyLanguageRelationship(calc.persentase, activeConfig);

      return {
        ...tp,
        persentaseBeda: res.persentase,
        statusHubungan: res.kategori as any
      };
    });

    onUpdateTitikPembanding(updated);
    setAppliedFeedback(`Berhasil mengklasifikasikan ulang seluruh ${updated.length} titik pembanding sesuai ${activeConfig.name}!`);
    setTimeout(() => setAppliedFeedback(null), 4000);
  };

  // Apply automatic narrative interpretation directly to the form fields
  const handleApplyToForm = () => {
    if (!report.kesimpulanAkademik && !report.catatanIsoglosOtomatis) return;

    onUpdateCatatan('kesimpulanGeolinguistik', report.kesimpulanAkademik);
    onUpdateCatatan('catatanIsoglos', report.catatanIsoglosOtomatis);

    setAppliedFeedback('Interpretasi otomatis berhasil diterapkan ke kolom Kesimpulan Geolinguistik & Catatan Isoglos!');
    setTimeout(() => setAppliedFeedback(null), 4500);
  };

  const refDesa = titikPengamatan.namaDesa || 'Titik Acuan (TP-01)';
  const refBahasa = titikPengamatan.bahasaDigunakan || 'Bahasa Utama';

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Banner & Feedback */}
      {appliedFeedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-900 shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{appliedFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setAppliedFeedback(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Threshold Configuration Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                <Sliders className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Konfigurasi Ambang Batas Klasifikasi Kekerabatan Bahasa
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Pilih standar baku dialektometri untuk mengklasifikasikan tingkat perbedaan leksikal (saling paham, varian dialek, subbahasa, atau batas bahasa).
            </p>
          </div>

          <button
            type="button"
            onClick={handleReclassifyAllPoints}
            disabled={titikPembandingList.length === 0}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white shadow-xs transition-all cursor-pointer shrink-0 ${
              titikPembandingList.length === 0
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Terapkan Klasifikasi ke Semua Titik</span>
          </button>
        </div>

        {/* Standard Preset Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Preset 1: Badan Bahasa (Guiter) */}
          <button
            type="button"
            onClick={() => setSelectedStandard('badan_bahasa')}
            className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
              selectedStandard === 'badan_bahasa'
                ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-slate-900">Standar Badan Bahasa</span>
              {selectedStandard === 'badan_bahasa' && (
                <Check className="w-3.5 h-3.5 text-indigo-600" />
              )}
            </div>
            <div className="text-[11px] font-mono text-indigo-700 font-semibold mb-1">
              20% • 50% • 80%
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Pedoman baku Badan Pengembangan dan Pembinaan Bahasa / Guiter (1973).
            </p>
          </button>

          {/* Preset 2: Swadesh Leksikostatistik */}
          <button
            type="button"
            onClick={() => setSelectedStandard('swadesh_leksikostatistik')}
            className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
              selectedStandard === 'swadesh_leksikostatistik'
                ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-slate-900">Leksikostatistik Swadesh</span>
              {selectedStandard === 'swadesh_leksikostatistik' && (
                <Check className="w-3.5 h-3.5 text-indigo-600" />
              )}
            </div>
            <div className="text-[11px] font-mono text-indigo-700 font-semibold mb-1">
              19% • 64% • 88%
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Kekerabatan glotokronologi rumpun bahasa Austronesia (Swadesh & Keraf).
            </p>
          </button>

          {/* Preset 3: Dialektologi Kritis */}
          <button
            type="button"
            onClick={() => setSelectedStandard('dialektologi_kritis')}
            className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
              selectedStandard === 'dialektologi_kritis'
                ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-slate-900">Dialektologi Konservatif</span>
              {selectedStandard === 'dialektologi_kritis' && (
                <Check className="w-3.5 h-3.5 text-indigo-600" />
              )}
            </div>
            <div className="text-[11px] font-mono text-indigo-700 font-semibold mb-1">
              15% • 40% • 70%
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Ambang batas ketat untuk kepulauan atau wilayah dengan isolasi geografis tinggi.
            </p>
          </button>

          {/* Preset 4: Kustom Peneliti */}
          <button
            type="button"
            onClick={() => setSelectedStandard('kustom')}
            className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
              selectedStandard === 'kustom'
                ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-slate-900">Ambang Batas Kustom</span>
              {selectedStandard === 'kustom' && (
                <Check className="w-3.5 h-3.5 text-indigo-600" />
              )}
            </div>
            <div className="text-[11px] font-mono text-indigo-700 font-semibold mb-1">
              {customT1}% • {customT2}% • {customT3}%
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Atur persentase ambang batas (thresholds) sesuai metodologi riset Anda.
            </p>
          </button>
        </div>

        {/* Custom Threshold Sliders (Shown when 'kustom' is selected) */}
        {selectedStandard === 'kustom' && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-fade-in">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-indigo-600" />
                Penyesuaian Ambang Batas Persentase Beda Leksikal (d%)
              </span>
              <button
                type="button"
                onClick={() => {
                  setCustomT1(20);
                  setCustomT2(50);
                  setCustomT3(80);
                }}
                className="text-indigo-600 hover:text-indigo-800 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset ke Default (20-50-80)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-emerald-800 font-medium">Batas Wicara → Dialek:</span>
                  <span className="font-bold font-mono text-emerald-700">{customT1}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  value={customT1}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val < customT2) setCustomT1(val);
                  }}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">Rentang wicara: 0% – {customT1}%</span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-blue-800 font-medium">Batas Dialek → Subbahasa:</span>
                  <span className="font-bold font-mono text-blue-700">{customT2}%</span>
                </div>
                <input
                  type="range"
                  min={customT1 + 5}
                  max="75"
                  value={customT2}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val > customT1 && val < customT3) setCustomT2(val);
                  }}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">Rentang dialek: {customT1 + 1}% – {customT2}%</span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-amber-800 font-medium">Batas Subbahasa → Bahasa:</span>
                  <span className="font-bold font-mono text-amber-700">{customT3}%</span>
                </div>
                <input
                  type="range"
                  min={customT2 + 5}
                  max="95"
                  value={customT3}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val > customT2) setCustomT3(val);
                  }}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">Beda bahasa: &gt;{customT3}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Visual Spectrum Continuum Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span>Kontinuum Spektrum Kekerabatan Bahasa:</span>
            <span className="font-mono text-indigo-700 font-bold">{activeConfig.name}</span>
          </div>

          <div className="h-6 w-full rounded-lg overflow-hidden flex text-[10px] font-bold text-white shadow-inner">
            <div 
              style={{ width: `${activeConfig.t1}%` }} 
              className="bg-emerald-500 flex items-center justify-center truncate px-1"
              title={`0% - ${activeConfig.t1}%: Wicara / Subdialek`}
            >
              Wicara (≤{activeConfig.t1}%)
            </div>
            <div 
              style={{ width: `${activeConfig.t2 - activeConfig.t1}%` }} 
              className="bg-blue-500 flex items-center justify-center truncate px-1"
              title={`${activeConfig.t1 + 1}% - ${activeConfig.t2}%: Dialek`}
            >
              Dialek ({activeConfig.t1 + 1}–{activeConfig.t2}%)
            </div>
            <div 
              style={{ width: `${activeConfig.t3 - activeConfig.t2}%` }} 
              className="bg-amber-500 flex items-center justify-center truncate px-1"
              title={`${activeConfig.t2 + 1}% - ${activeConfig.t3}%: Subbahasa`}
            >
              Subbahasa ({activeConfig.t2 + 1}–{activeConfig.t3}%)
            </div>
            <div 
              style={{ width: `${100 - activeConfig.t3}%` }} 
              className="bg-rose-500 flex items-center justify-center truncate px-1"
              title={`>${activeConfig.t3}%: Beda Bahasa`}
            >
              Beda Bahasa (&gt;{activeConfig.t3}%)
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards of Classification Results */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Tier 1: Wicara */}
        <div className="p-3.5 bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              {activeConfig.labelWicara}
            </span>
            <span className="font-mono text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded">
              ≤{activeConfig.t1}%
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-emerald-800">{report.counts.wicara}</span>
            <span className="text-xs text-emerald-600 font-medium">titik</span>
          </div>
          <p className="text-[10px] text-emerald-700 mt-1 truncate">
            Saling paham penuh (95–100%)
          </p>
        </div>

        {/* Tier 2: Dialek */}
        <div className="p-3.5 bg-gradient-to-br from-blue-50/80 to-white border border-blue-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-xs text-blue-800 font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              {activeConfig.labelDialek}
            </span>
            <span className="font-mono text-[10px] bg-blue-100 px-1.5 py-0.5 rounded">
              {activeConfig.t1 + 1}–{activeConfig.t2}%
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-blue-800">{report.counts.dialek}</span>
            <span className="text-xs text-blue-600 font-medium">titik</span>
          </div>
          <p className="text-[10px] text-blue-700 mt-1 truncate">
            Satu rumpun bahasa serumpun
          </p>
        </div>

        {/* Tier 3: Subbahasa */}
        <div className="p-3.5 bg-gradient-to-br from-amber-50/80 to-white border border-amber-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-xs text-amber-800 font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              {activeConfig.labelSubbahasa}
            </span>
            <span className="font-mono text-[10px] bg-amber-100 px-1.5 py-0.5 rounded">
              {activeConfig.t2 + 1}–{activeConfig.t3}%
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-amber-800">{report.counts.subbahasa}</span>
            <span className="text-xs text-amber-600 font-medium">titik</span>
          </div>
          <p className="text-[10px] text-amber-700 mt-1 truncate">
            Zona transisi / pemahaman parsial
          </p>
        </div>

        {/* Tier 4: Bahasa */}
        <div className="p-3.5 bg-gradient-to-br from-rose-50/80 to-white border border-rose-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-xs text-rose-800 font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              {activeConfig.labelBahasa}
            </span>
            <span className="font-mono text-[10px] bg-rose-100 px-1.5 py-0.5 rounded">
              &gt;{activeConfig.t3}%
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-rose-800">{report.counts.bahasa}</span>
            <span className="text-xs text-rose-600 font-medium">titik</span>
          </div>
          <p className="text-[10px] text-rose-700 mt-1 truncate">
            Garis batas bahasa terpisah
          </p>
        </div>
      </div>

      {/* Automatic Narrative Report & Geoperception Analysis */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                <FileText className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Laporan Interpretasi Otomatis Hubungan Kekerabatan & Geolinguistik
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Sintesis otomatis narasi akademik berdasarkan analisis komparatif titik acuan {refDesa} ({refBahasa}).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleApplyToForm}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
              title="Terapkan hasil sintesis ini ke formulir Kesimpulan Geolinguistik & Catatan Isoglos"
            >
              <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
              <span>Terapkan ke Form Section 16</span>
            </button>
          </div>
        </div>

        {/* Section A: Kesimpulan Akademik Naratif */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              1. Kesimpulan Analisis Geolinguistik & Batas Bahasa (Naratif Akademik)
            </span>
            <button
              type="button"
              onClick={() => handleCopyText('kesimpulan', report.kesimpulanAkademik)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              {copiedSection === 'kesimpulan' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Teks</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-line">
            {report.kesimpulanAkademik}
          </div>
        </div>

        {/* Section B: Catatan Isoglos & Karakteristik Leksikal */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              2. Catatan Sebaran Isoglos Leksikal & Fonologis
            </span>
            <button
              type="button"
              onClick={() => handleCopyText('isoglos', report.catatanIsoglosOtomatis)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              {copiedSection === 'isoglos' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Teks</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-line">
            {report.catatanIsoglosOtomatis}
          </div>
        </div>
      </div>

      {/* Comprehensive Linguistic Relationship Table per Point */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-3.5 sm:p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Klasifikasi Kekerabatan Rinci Tiap Titik Pengamatan
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Hasil komparasi terhadap Titik Acuan {refDesa} berdasarkan ambang {activeConfig.name}.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded">
            Total {titikPembandingList.length} Titik Pembanding
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead className="bg-slate-100/60 border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">No</th>
                <th className="py-2.5 px-3">Titik & Desa</th>
                <th className="py-2.5 px-3 text-center">Jarak Spasial</th>
                <th className="py-2.5 px-3 text-center">Beda (d%)</th>
                <th className="py-2.5 px-3 text-center">Kemiripan (s%)</th>
                <th className="py-2.5 px-3">Klasifikasi Kekerabatan</th>
                <th className="py-2.5 px-3">Kedalaman Waktu Pisah</th>
                <th className="py-2.5 px-3">Tingkat Kesalingpahaman</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {titikPembandingList.map((tp, idx) => {
                const calc = hitungDialektometri(tp.jumlahBeda, tp.jumlahGlos);
                const classif = classifyLanguageRelationship(calc.persentase, activeConfig);
                const dist = calculateDistanceKm(
                  parseNum(situasiGeografis.koordinatLintang) || -7.4982,
                  parseNum(situasiGeografis.koordinatBujur) || 107.3485,
                  tp.lintang,
                  tp.bujur
                );
                const timeDepth = estimateGlottochronologyTimeDepth(calc.persentase);

                return (
                  <tr key={tp.id} className="hover:bg-indigo-50/20 transition-colors">
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400 font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 text-xs">{tp.namaTitik}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>Desa {tp.desa || '-'} ({tp.bahasa || '-'})</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-xs">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                        {dist} km
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-mono font-bold text-rose-600 text-xs">
                        {calc.persentase}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-mono font-bold text-emerald-700 text-xs">
                        {Math.round((100 - calc.persentase) * 10) / 10}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold border ${classif.badgeClass}`}>
                        {classif.kategori}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{timeDepth.abad}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-600">
                      <span>{classif.mutualIntelligibility}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Section16LinguisticClassification;
