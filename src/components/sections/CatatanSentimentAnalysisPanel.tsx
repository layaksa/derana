import React, { useState, useMemo } from 'react';
import { 
  HeartHandshake, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Sliders, 
  ShieldCheck, 
  FileCheck2, 
  Clock, 
  VolumeX, 
  Layers, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Search, 
  Wand2, 
  UserCheck, 
  TrendingUp,
  BrainCircuit,
  MessageSquareQuote,
  Activity
} from 'lucide-react';
import { CatatanPengumpulData, KosakataItem } from '../../types/linguistic';
import { 
  analyzeQualitativeFieldNotes, 
  FIELD_NOTE_PRESETS, 
  QualitativeSentimentAnalysisResult 
} from '../../utils/qualitativeSentimentAnalyzer';

interface CatatanSentimentAnalysisPanelProps {
  catatanData?: CatatanPengumpulData;
  swadeshList?: KosakataItem[];
  onUpdateCatatanPengumpul?: (field: keyof CatatanPengumpulData, value: string) => void;
  onApplyPreset?: (preset: typeof FIELD_NOTE_PRESETS[0]) => void;
}

export const CatatanSentimentAnalysisPanel: React.FC<CatatanSentimentAnalysisPanelProps> = ({
  catatanData,
  swadeshList = [],
  onUpdateCatatanPengumpul,
  onApplyPreset
}) => {
  const [copiedNote, setCopiedNote] = useState(false);
  const [showVocabAudit, setShowVocabAudit] = useState(false);
  const [vocabSearchFilter, setVocabSearchFilter] = useState('');
  const [activeChecklist, setActiveChecklist] = useState<Record<number, boolean>>({});

  // Real-time analysis of field notes and vocabulary items
  const analysis: QualitativeSentimentAnalysisResult = useMemo(() => {
    return analyzeQualitativeFieldNotes(catatanData, swadeshList);
  }, [catatanData, swadeshList]);

  // Handle copying suggested verifier notes into clipboard and/or input
  const handleCopySuggestedNotes = () => {
    const text = analysis.verifierAction.suggestedNotes;
    navigator.clipboard.writeText(text);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2200);

    if (onUpdateCatatanPengumpul) {
      onUpdateCatatanPengumpul('catatanVerifikator', text);
      const targetStatus = analysis.sentimentPolarity === 'positif' && analysis.reliabilityIndex >= 70
        ? 'siap_disetujui'
        : analysis.sentimentPolarity === 'kritis'
        ? 'klarifikasi_lapangan'
        : 'perlu_tinjauan';
      onUpdateCatatanPengumpul('statusVerifikasiKualitatif', targetStatus);
      onUpdateCatatanPengumpul('tanggalVerifikasiKualitatif', new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }));
    }
  };

  const toggleChecklist = (idx: number) => {
    setActiveChecklist(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Filtered vocabulary notes for the verifier drawer
  const filteredVocabNotes = useMemo(() => {
    const items = analysis.vocabularyAudit.flaggedItems;
    if (!vocabSearchFilter.trim()) return items;
    const q = vocabSearchFilter.toLowerCase();
    return items.filter(i => 
      i.glos.toLowerCase().includes(q) || 
      i.bentukLokal.toLowerCase().includes(q) || 
      i.catatan.toLowerCase().includes(q)
    );
  }, [analysis.vocabularyAudit.flaggedItems, vocabSearchFilter]);

  // Color mappings
  const polarityColors = {
    positif: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-800/60',
      badge: 'bg-emerald-600 text-white',
      badgeSoft: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60',
      accent: 'text-emerald-600 dark:text-emerald-400',
      bar: 'bg-emerald-500'
    },
    netral: {
      bg: 'bg-slate-50 dark:bg-slate-800/40',
      border: 'border-slate-200 dark:border-slate-700',
      badge: 'bg-slate-700 text-white',
      badgeSoft: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-600',
      accent: 'text-slate-700 dark:text-slate-300',
      bar: 'bg-slate-500'
    },
    waspada: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-800/60',
      badge: 'bg-amber-600 text-white',
      badgeSoft: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60',
      accent: 'text-amber-600 dark:text-amber-400',
      bar: 'bg-amber-500'
    },
    kritis: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-200 dark:border-rose-800/60',
      badge: 'bg-rose-600 text-white',
      badgeSoft: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700/60',
      accent: 'text-rose-600 dark:text-rose-400',
      bar: 'bg-rose-500'
    }
  }[analysis.sentimentPolarity];

  const reliabilityBadge = analysis.reliabilityLevel === 'Tinggi'
    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300'
    : analysis.reliabilityLevel === 'Sedang'
    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300'
    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300';

  return (
    <div className="space-y-5">
      {/* 1. Main Header Card with Real-time Analysis Result */}
      <div className={`p-4 sm:p-5 rounded-2xl border ${polarityColors.border} ${polarityColors.bg} transition-all`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-start gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${polarityColors.badge}`}>
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                  Seksi 15 • Analisis Sentimen & Konteks Kualitatif Lapangan
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${polarityColors.badgeSoft}`}>
                  {analysis.sentimentLabel}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                Audit Kualitatif Suasana Wawancara & Reliabilitas Data Kosakata
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
                {analysis.sentimentDescription}
              </p>
            </div>
          </div>

          {/* Quick Score Meter */}
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0 self-start lg:self-auto">
            <div className="text-center pr-3 border-r border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Indeks Keandalan
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-0.5">
                <span>{analysis.reliabilityIndex}%</span>
              </div>
              <span className={`inline-block px-1.5 py-0.2 text-[9px] font-bold rounded border ${reliabilityBadge}`}>
                {analysis.reliabilityLevel}
              </span>
            </div>

            <div className="text-center pl-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Skor Sentimen
              </div>
              <div className={`text-xl font-black ${polarityColors.accent}`}>
                {analysis.sentimentScore > 0 ? `+${analysis.sentimentScore}` : analysis.sentimentScore}
              </div>
              <span className="text-[9px] text-slate-400">skala -100 s.d +100</span>
            </div>
          </div>
        </div>

        {/* 2. Four Qualitative Dimensions Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {/* Dimensi 1: Informant Rapport */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Kerjasama Informan</span>
                </span>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  {analysis.dimensions.informantRapport.score}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full transition-all duration-500 ${
                    analysis.dimensions.informantRapport.score >= 70 ? 'bg-indigo-500' : analysis.dimensions.informantRapport.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${analysis.dimensions.informantRapport.score}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {analysis.dimensions.informantRapport.description}
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Status</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                analysis.dimensions.informantRapport.status === 'optimal' 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : analysis.dimensions.informantRapport.status === 'cukup'
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
              }`}>
                {analysis.dimensions.informantRapport.status === 'optimal' ? 'Optimal' : analysis.dimensions.informantRapport.status === 'cukup' ? 'Memadai' : 'Perhatian'}
              </span>
            </div>
          </div>

          {/* Dimensi 2: Phonetic Certainty */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Kepastian Fonetik</span>
                </span>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  {analysis.dimensions.phoneticCertainty.score}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full transition-all duration-500 ${
                    analysis.dimensions.phoneticCertainty.score >= 70 ? 'bg-emerald-500' : analysis.dimensions.phoneticCertainty.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${analysis.dimensions.phoneticCertainty.score}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {analysis.dimensions.phoneticCertainty.description}
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Keyakinan Bunyi</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                analysis.dimensions.phoneticCertainty.status === 'optimal' 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : analysis.dimensions.phoneticCertainty.status === 'cukup'
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
              }`}>
                {analysis.dimensions.phoneticCertainty.status === 'optimal' ? 'Tinggi' : analysis.dimensions.phoneticCertainty.status === 'cukup' ? 'Sedang' : 'Ragu-Ragu'}
              </span>
            </div>
          </div>

          {/* Dimensi 3: Environmental Stability */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Kondisi & Waktu</span>
                </span>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  {analysis.dimensions.environmentalStability.score}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full transition-all duration-500 ${
                    analysis.dimensions.environmentalStability.score >= 70 ? 'bg-blue-500' : analysis.dimensions.environmentalStability.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${analysis.dimensions.environmentalStability.score}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {analysis.dimensions.environmentalStability.description}
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Akustik/Durasi</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                analysis.dimensions.environmentalStability.status === 'optimal' 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : analysis.dimensions.environmentalStability.status === 'cukup'
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
              }`}>
                {analysis.dimensions.environmentalStability.status === 'optimal' ? 'Kondusif' : analysis.dimensions.environmentalStability.status === 'cukup' ? 'Sedang' : 'Terganggu'}
              </span>
            </div>
          </div>

          {/* Dimensi 4: Cultural Authenticity */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-500" />
                  <span>Otentisitas Adat</span>
                </span>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  {analysis.dimensions.culturalAuthenticity.score}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full transition-all duration-500 ${
                    analysis.dimensions.culturalAuthenticity.score >= 70 ? 'bg-purple-500' : analysis.dimensions.culturalAuthenticity.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${analysis.dimensions.culturalAuthenticity.score}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {analysis.dimensions.culturalAuthenticity.description}
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Variasi Bahasa</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                analysis.dimensions.culturalAuthenticity.status === 'optimal' 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : analysis.dimensions.culturalAuthenticity.status === 'cukup'
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
              }`}>
                {analysis.dimensions.culturalAuthenticity.status === 'optimal' ? 'Asli/Murni' : analysis.dimensions.culturalAuthenticity.status === 'cukup' ? 'Campuran' : 'Kontak'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Detected Signals & Qualitative Keywords Chips */}
        <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-700/60">
          <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Kata Kunci & Sinyal Kualitatif yang Terdeteksi dalam Catatan:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {analysis.extractedSignals.positiveKeywords.length > 0 && (
              analysis.extractedSignals.positiveKeywords.map((w, idx) => (
                <span key={`pos-${idx}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>{w}</span>
                </span>
              ))
            )}

            {analysis.extractedSignals.hesitationKeywords.length > 0 && (
              analysis.extractedSignals.hesitationKeywords.map((w, idx) => (
                <span key={`hes-${idx}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60">
                  <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>{w}</span>
                </span>
              ))
            )}

            {analysis.extractedSignals.environmentalKeywords.length > 0 && (
              analysis.extractedSignals.environmentalKeywords.map((w, idx) => (
                <span key={`env-${idx}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-700/60">
                  <VolumeX className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                  <span>{w}</span>
                </span>
              ))
            )}

            {analysis.extractedSignals.linguisticKeywords.length > 0 && (
              analysis.extractedSignals.linguisticKeywords.map((w, idx) => (
                <span key={`ling-${idx}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-300 dark:border-purple-700/60">
                  <BookOpen className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  <span>{w}</span>
                </span>
              ))
            )}

            {analysis.extractedSignals.positiveKeywords.length === 0 &&
             analysis.extractedSignals.hesitationKeywords.length === 0 &&
             analysis.extractedSignals.environmentalKeywords.length === 0 &&
             analysis.extractedSignals.linguisticKeywords.length === 0 && (
              <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                Belum ada kata kunci sentimen terdeteksi. Isi suasana wawancara atau catatan di bawah, atau pilih simulator preset.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4. Actionable Verifier Curation Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              {analysis.verifierAction.headline}
            </h4>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            analysis.verifierAction.badgeVariant === 'success'
              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
              : analysis.verifierAction.badgeVariant === 'warning'
              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300'
              : analysis.verifierAction.badgeVariant === 'alert'
              ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300'
          }`}>
            {analysis.verifierAction.badgeText}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          <strong>Ringkasan Konteks:</strong> {analysis.verifierAction.auditSummary}
        </p>

        {/* Verifier Checklist */}
        <div>
          <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2">
            Checklist Langkah Verifikasi yang Direkomendasikan:
          </div>
          <div className="space-y-1.5">
            {analysis.verifierAction.checklist.map((item, idx) => {
              const isChecked = !!activeChecklist[idx];
              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => toggleChecklist(idx)}
                  className={`w-full text-left flex items-start gap-2.5 p-2 rounded-lg text-xs transition-all border cursor-pointer ${
                    isChecked
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-slate-200'
                      : 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border shrink-0 transition-colors ${
                    isChecked 
                      ? 'bg-emerald-600 border-emerald-600 text-white' 
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                  }`}>
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className={isChecked ? 'line-through text-slate-500' : ''}>
                    {item}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Input Catatan Verifikator Langsung */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <MessageSquareQuote className="w-3.5 h-3.5 text-indigo-600" />
              <span>Catatan Pengesahan Verifikator (Kualitatif):</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopySuggestedNotes}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors border border-indigo-200 dark:border-indigo-800 cursor-pointer"
                title="Sisipkan draf rekomendasi analisis sentimen ke catatan verifikator"
              >
                {copiedNote ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-indigo-600" />}
                <span>{copiedNote ? 'Tersalin & Disisipkan!' : 'Terapkan Draf Sentimen'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <textarea
                rows={3}
                value={catatanData?.catatanVerifikator || ''}
                onChange={(e) => onUpdateCatatanPengumpul && onUpdateCatatanPengumpul('catatanVerifikator', e.target.value)}
                placeholder="Tuliskan evaluasi verifikator terhadap keabsahan data leksikal dan konteks narasumber..."
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-700">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Status Pengesahan
                </label>
                <select
                  value={catatanData?.statusVerifikasiKualitatif || 'siap_disetujui'}
                  onChange={(e) => onUpdateCatatanPengumpul && onUpdateCatatanPengumpul('statusVerifikasiKualitatif', e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="siap_disetujui">✓ Siap Disetujui (Valid)</option>
                  <option value="perlu_tinjauan">⚠️ Perlu Tinjauan Khusus</option>
                  <option value="klarifikasi_lapangan">🛑 Butuh Klarifikasi Lapangan</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  Tanggal Verifikasi
                </label>
                <input
                  type="text"
                  value={catatanData?.tanggalVerifikasiKualitatif || ''}
                  onChange={(e) => onUpdateCatatanPengumpul && onUpdateCatatanPengumpul('tanggalVerifikasiKualitatif', e.target.value)}
                  placeholder="Contoh: 24 Mei 2024"
                  className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 5. Vocabulary Notes Audit Drawer Toggle */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowVocabAudit(!showVocabAudit)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>
                Audit Anotasi Butir Kosakata 200 Swadesh ({analysis.vocabularyAudit.itemsWithNotesCount} butir memiliki catatan khusus)
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <span className="text-[11px]">{showVocabAudit ? 'Tutup' : 'Lihat Rincian'}</span>
              {showVocabAudit ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showVocabAudit && (
            <div className="mt-3 p-3 bg-slate-50/80 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={vocabSearchFilter}
                    onChange={(e) => setVocabSearchFilter(e.target.value)}
                    placeholder="Saring glos atau catatan kata..."
                    className="w-full pl-8 pr-3 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                  />
                </div>
                <span className="text-[11px] text-slate-500 shrink-0">
                  {filteredVocabNotes.length} ditemukan
                </span>
              </div>

              {filteredVocabNotes.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">
                  Tidak ada catatan kosakata yang cocok dengan saringan.
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                  {filteredVocabNotes.map((item) => (
                    <div 
                      key={item.id}
                      className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          {item.id}
                        </span>
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{item.glos}</span>
                          <span className="text-slate-400 mx-1.5">➔</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">{item.bentukLokal}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.category === 'keraguan'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : item.category === 'arkaik'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : item.category === 'serapan'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {item.category.toUpperCase()}
                        </span>
                        <span className="text-slate-600 dark:text-slate-300 italic text-[11px] max-w-xs truncate">
                          "{item.catatan}"
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 6. Simulator & Presets Sesi Lapangan */}
      <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Simulator Skenario Lapangan (Coba Presets Catatan Lapangan):
            </span>
          </div>
          <span className="text-[10px] text-slate-500">Klik untuk menguji deteksi sentimen seketika</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {FIELD_NOTE_PRESETS.map((preset) => (
            <button
              type="button"
              key={preset.id}
              onClick={() => onApplyPreset && onApplyPreset(preset)}
              className="text-left p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 text-xs transition-all cursor-pointer group shadow-2xs"
            >
              <div className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center justify-between mb-1">
                <span>{preset.title}</span>
                <span className="text-[9px] font-mono px-1 py-0.2 bg-slate-100 dark:bg-slate-700 rounded text-slate-500">
                  {preset.id === 'ideal' ? 'Positif' : preset.id === 'keraguan_usia' ? 'Waspada' : 'Kritis'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                {preset.suasana}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
