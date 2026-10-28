import React, { useState, useMemo, useEffect } from 'react';
import { 
  Languages, 
  Save, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  Filter, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  Download, 
  User, 
  MapPin, 
  BookOpen, 
  BarChart3, 
  HelpCircle,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { 
  DAFTAR_PERTANYAAN_VITALITAS, 
  VitalitasQuestionItem, 
  KuesionerVitalitasResponse, 
  calculateVitalitySummary,
  calculateCategoryVitalityAnalysis,
  CategoryVitalityResult,
  SAMPLE_VITALITAS_RESPONSES
} from '../../data/kuesionerVitalitasData';
import { 
  saveVitalitasResponse, 
  loadVitalitasResponses,
  exportVitalitasToCSV
} from '../../utils/vitalitasStorage';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface KuesionerKondisiBahasaFormProps {
  initialData?: KuesionerVitalitasResponse | null;
  onSave?: (saved: KuesionerVitalitasResponse) => void;
  defaultDesa?: string;
  defaultBahasa?: string;
  defaultKecamatan?: string;
  defaultKabupaten?: string;
  canEdit?: boolean;
}

export const KuesionerKondisiBahasaForm: React.FC<KuesionerKondisiBahasaFormProps> = ({
  initialData,
  onSave,
  defaultDesa = '',
  defaultBahasa = 'Bahasa Daerah Setempat',
  defaultKecamatan = '',
  defaultKabupaten = '',
  canEdit = true
}) => {
  const isOnline = useOnlineStatus();

  // All stored responses
  const [savedResponses, setSavedResponses] = useState<KuesionerVitalitasResponse[]>(() => loadVitalitasResponses());

  const activeInitial = useMemo(() => {
    if (initialData) return initialData;
    const existing = loadVitalitasResponses();
    if (existing.length > 0) return existing[0];
    return SAMPLE_VITALITAS_RESPONSES[0];
  }, [initialData]);

  const [currentResponseId, setCurrentResponseId] = useState<string>(activeInitial?.id || `vitalitas_${Date.now()}`);

  // Load existing or first sample if none provided
  const [respondenNama, setRespondenNama] = useState(activeInitial?.respondenNama || 'Responden Utama Desa');
  const [respondenUsia, setRespondenUsia] = useState<string | number>(activeInitial?.respondenUsia || 45);
  const [respondenGender, setRespondenGender] = useState<'pria' | 'wanita'>(activeInitial?.respondenGender || 'pria');
  const [respondenPekerjaan, setRespondenPekerjaan] = useState(activeInitial?.respondenPekerjaan || 'Petani / Tokoh Masyarakat');
  const [bahasaDaerah, setBahasaDaerah] = useState(activeInitial?.bahasaDaerah || defaultBahasa || 'Bahasa Sunda');
  const [desa, setDesa] = useState(activeInitial?.desa || defaultDesa || '');
  const [kecamatan, setKecamatan] = useState(activeInitial?.kecamatan || defaultKecamatan || '');
  const [kabupatenKota, setKabupatenKota] = useState(activeInitial?.kabupatenKota || defaultKabupaten || '');
  const [catatan, setCatatan] = useState(activeInitial?.catatan || '');

  // Answers state
  const [answers, setAnswers] = useState<Record<number, number>>(() => {
    if (activeInitial?.answers) return activeInitial.answers;
    return SAMPLE_VITALITAS_RESPONSES[0].answers;
  });

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [onlyUnanswered, setOnlyUnanswered] = useState<boolean>(false);
  const [searchQuestion, setSearchQuestion] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Switch to another respondent
  const handleSelectSavedRespondent = (id: string) => {
    if (id === 'new') {
      handleCreateNew();
      return;
    }
    const found = savedResponses.find(r => r.id === id);
    if (found) {
      setCurrentResponseId(found.id);
      setRespondenNama(found.respondenNama);
      setRespondenUsia(found.respondenUsia || '');
      setRespondenGender(found.respondenGender || 'pria');
      setRespondenPekerjaan(found.respondenPekerjaan || '');
      setBahasaDaerah(found.bahasaDaerah || defaultBahasa);
      setDesa(found.desa || defaultDesa);
      setKecamatan(found.kecamatan || defaultKecamatan);
      setKabupatenKota(found.kabupatenKota || defaultKabupaten);
      setCatatan(found.catatan || '');
      setAnswers(found.answers || {});
      setSaveSuccessMsg(`Membuka kuesioner responden: ${found.respondenNama}`);
      setTimeout(() => setSaveSuccessMsg(null), 2500);
    }
  };

  const handleCreateNew = () => {
    const newId = `vitalitas_resp_${Date.now()}`;
    setCurrentResponseId(newId);
    setRespondenNama('');
    setRespondenUsia('');
    setRespondenGender('pria');
    setRespondenPekerjaan('');
    setBahasaDaerah(defaultBahasa || 'Bahasa Daerah Setempat');
    setDesa(defaultDesa || '');
    setKecamatan(defaultKecamatan || '');
    setKabupatenKota(defaultKabupaten || '');
    setCatatan('');
    setAnswers({});
    setSaveSuccessMsg('Formulir kuesioner responden baru telah disiapkan. Silakan mulai pengisian.');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Real-time Overall Summary
  const liveSummary = useMemo(() => calculateVitalitySummary(answers), [answers]);

  // Real-time Category Breakdown Analysis (8 macro domains)
  const categoryAnalysis = useMemo(() => calculateCategoryVitalityAnalysis(answers), [answers]);

  const handleAnswerChange = (questionId: number, value: number) => {
    if (!canEdit) return;
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSelectQuickAll = (value: number) => {
    if (!canEdit) return;
    if (window.confirm(`Set semua pertanyaan yang belum terisi ke nilai ${value}?`)) {
      const nextAnswers = { ...answers };
      DAFTAR_PERTANYAAN_VITALITAS.forEach(q => {
        if (!nextAnswers[q.id]) {
          nextAnswers[q.id] = value;
        }
      });
      setAnswers(nextAnswers);
    }
  };

  const handleReset = () => {
    if (!canEdit) return;
    if (window.confirm('Kosongkan semua jawaban kuesioner kondisi bahasa?')) {
      setAnswers({});
    }
  };

  const handleLoadSample = (sampleIndex = 0) => {
    if (!canEdit) return;
    const sample = SAMPLE_VITALITAS_RESPONSES[sampleIndex] || SAMPLE_VITALITAS_RESPONSES[0];
    setRespondenNama(sample.respondenNama);
    setRespondenUsia(sample.respondenUsia || 45);
    setRespondenGender(sample.respondenGender || 'pria');
    setRespondenPekerjaan(sample.respondenPekerjaan || '');
    setBahasaDaerah(sample.bahasaDaerah);
    setDesa(sample.desa);
    setKecamatan(sample.kecamatan || '');
    setKabupatenKota(sample.kabupatenKota || '');
    setCatatan(sample.catatan || '');
    setAnswers(sample.answers);
    setSaveSuccessMsg(`Berhasil memuat contoh responden: ${sample.respondenNama}`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleSave = () => {
    const record: KuesionerVitalitasResponse = {
      id: currentResponseId || initialData?.id || `vitalitas_resp_${Date.now()}`,
      respondenNama: respondenNama.trim() || 'Responden Anonim',
      respondenUsia: respondenUsia ? Number(respondenUsia) : undefined,
      respondenGender,
      respondenPekerjaan: respondenPekerjaan.trim() || undefined,
      bahasaDaerah: bahasaDaerah.trim() || 'Bahasa Daerah Setempat',
      desa: desa.trim() || defaultDesa || 'Desa Pengamatan',
      kecamatan: kecamatan.trim() || defaultKecamatan || undefined,
      kabupatenKota: kabupatenKota.trim() || defaultKabupaten || undefined,
      answers,
      totalAnswered: liveSummary.totalAnswered,
      scoreAvg: liveSummary.scoreAvg,
      vitalitasStatus: liveSummary.vitalitasStatus,
      statusColor: liveSummary.statusColor,
      catatan: catatan.trim() || undefined,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedList = saveVitalitasResponse(record);
    setSavedResponses(updatedList);
    setCurrentResponseId(record.id);
    if (onSave) onSave(record);

    setSaveSuccessMsg(`Data kuesioner responden "${record.respondenNama}" & analisis vitalitas 8 kategori berhasil disimpan!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Filter questions for display
  const displayedQuestions = useMemo(() => {
    return DAFTAR_PERTANYAAN_VITALITAS.filter(q => {
      if (activeCategoryFilter !== 'all') {
        const cat = categoryAnalysis.find(c => c.key === activeCategoryFilter);
        if (cat && !cat.questionIds.includes(q.id)) {
          return false;
        }
      }
      if (onlyUnanswered && (answers[q.id] || 0) > 0) {
        return false;
      }
      if (searchQuestion.trim()) {
        const query = searchQuestion.toLowerCase();
        if (!q.text.toLowerCase().includes(query) && !q.category.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [activeCategoryFilter, onlyUnanswered, searchQuestion, answers, categoryAnalysis]);

  return (
    <div className="space-y-6">
      {/* Responden Selector Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 transition-colors">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shrink-0">
            <User className="w-3.5 h-3.5 text-blue-600" />
            <span>Pilih Responden:</span>
          </label>
          <select
            value={currentResponseId}
            onChange={(e) => handleSelectSavedRespondent(e.target.value)}
            className="flex-1 min-w-[220px] px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 cursor-pointer"
          >
            {savedResponses.map(r => (
              <option key={r.id} value={r.id}>
                {r.respondenNama} - Desa {r.desa} ({r.vitalitasStatus || 'Skor ' + r.scoreAvg})
              </option>
            ))}
            <option value="new">+ Tambah Responden Baru...</option>
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-blue-200 dark:border-blue-800 shadow-2xs"
          >
            <span>+ Responden Baru</span>
          </button>

          <button
            type="button"
            onClick={() => exportVitalitasToCSV(savedResponses)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
            title="Unduh seluruh data kuesioner ke format CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Banner Notifikasi Keberhasilan Simpan */}
      {saveSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setSaveSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 text-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Header Panel Kuesioner Kondisi Bahasa */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
              <Languages className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                  Formulir Kuesioner Kondisi & Daya Hidup Bahasa
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold">
                  95 Butir Pertanyaan
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Instrumen baku pengukuran daya hidup bahasa daerah di berbagai ranah sosial penutur, dilengkapi analisis agregat dan status per kategori secara real-time.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
            {canEdit && (
              <>
                <button
                  type="button"
                  onClick={() => handleLoadSample(0)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
                  title="Muat contoh isian kuesioner responden"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span className="hidden sm:inline">Muat Sampel</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectQuickAll(5)}
                  className="inline-flex items-center gap-1 px-2.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold transition-colors border border-emerald-200 dark:border-emerald-800 shadow-2xs cursor-pointer"
                  title="Set semua pertanyaan yang belum terisi ke skor 5 (Sangat Sering / Sangat Setuju)"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Isi 5</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
                  title="Kosongkan seluruh isian jawaban"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Kosongkan</span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Kuesioner</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Global Vitality Indicator Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Terjawab</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{liveSummary.totalAnswered}</span>
              <span className="text-xs text-slate-400">/ 95 Butir ({liveSummary.percentage}%)</span>
            </div>
            <div className="mt-2 w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${liveSummary.percentage}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Skor Rata-Rata Agregat</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{liveSummary.scoreAvg}</span>
              <span className="text-xs text-slate-400">/ 5.00 Skala Likert</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Metode pembobotan baku UNESCO</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Status Daya Hidup</span>
            <div className="mt-1">
              <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${liveSummary.statusColor}`}>
                {liveSummary.vitalitasStatus}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Klasifikasi Vitalitas Bahasa</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Penyimpanan & Sync</span>
            <div className="mt-1 flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {isOnline ? 'Online (Sinkron Cloud)' : 'Offline (Tersimpan Lokal)'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Auto-sync aktif saat online</span>
          </div>
        </div>
      </div>

      {/* HASIL ANALISIS PER KATEGORI (8 Ranah Vitalitas) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Hasil Analisis Daya Hidup Bahasa per Kategori Ranah
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Evaluasi mendalam daya hidup bahasa di 8 ranah fungsional untuk mengidentifikasi ranah rentan dan strategi konservasi.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 self-start sm:self-auto">
            8 Ranah Standar
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {categoryAnalysis.map((cat) => (
            <div 
              key={cat.key}
              onClick={() => setActiveCategoryFilter(activeCategoryFilter === cat.key ? 'all' : cat.key)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                activeCategoryFilter === cat.key 
                  ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-950/30 shadow-md' 
                  : 'border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                  {cat.title}
                </h4>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${cat.badgeBg} ${cat.statusColor}`}>
                  {cat.vitalitasStatus}
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-xs text-slate-500 dark:text-slate-400">Skor Rata-Rata:</span>
                <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                  {cat.totalAnswered > 0 ? cat.avgScore : '-'} <span className="text-[10px] font-normal text-slate-400">/ 5.0</span>
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    cat.avgScore >= 4.2 ? 'bg-emerald-500' :
                    cat.avgScore >= 3.4 ? 'bg-amber-500' :
                    cat.avgScore >= 2.6 ? 'bg-orange-500' :
                    cat.avgScore >= 1.8 ? 'bg-rose-500' : 'bg-red-700'
                  }`}
                  style={{ width: `${Math.min(100, Math.round((cat.avgScore / 5) * 100))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
                <span>Terjawab:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {cat.totalAnswered} / {cat.totalQuestions} ({cat.percentageAnswered}%)
                </span>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200/50 dark:border-slate-800">
                {cat.interpretation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Profil Responden Kuesioner (Identitas Wawancara) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Identitas Responden & Lokasi Pengamatan
          </h3>
          <span className="text-xs text-slate-400">Data Informan</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Nama Responden *</label>
            <input
              type="text"
              value={respondenNama}
              onChange={(e) => setRespondenNama(e.target.value)}
              disabled={!canEdit}
              placeholder="Nama responden"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Usia & Gender</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={respondenUsia}
                onChange={(e) => setRespondenUsia(e.target.value)}
                disabled={!canEdit}
                placeholder="Usia (thn)"
                className="w-24 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
              <select
                value={respondenGender}
                onChange={(e) => setRespondenGender(e.target.value as any)}
                disabled={!canEdit}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              >
                <option value="pria">Laki-laki</option>
                <option value="wanita">Perempuan</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Bahasa Daerah Diteliti *</label>
            <input
              type="text"
              value={bahasaDaerah}
              onChange={(e) => setBahasaDaerah(e.target.value)}
              disabled={!canEdit}
              placeholder="e.g. Bahasa Sunda"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Desa / Titik Pengamatan</label>
            <input
              type="text"
              value={desa}
              onChange={(e) => setDesa(e.target.value)}
              disabled={!canEdit}
              placeholder="Nama desa"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
      </div>

      {/* Daftar Pertanyaan 95 Butir & Pilihan Jawaban */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
        {/* Filter & Kontrol Butir Pertanyaan */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <select
              value={activeCategoryFilter}
              onChange={(e) => setActiveCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-semibold cursor-pointer"
            >
              <option value="all">Semua Ranah ({DAFTAR_PERTANYAAN_VITALITAS.length} Pertanyaan)</option>
              {categoryAnalysis.map(c => (
                <option key={c.key} value={c.key}>
                  {c.title} ({c.totalAnswered}/{c.totalQuestions})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <label className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyUnanswered}
                onChange={(e) => setOnlyUnanswered(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span>Hanya yang belum dijawab</span>
            </label>

            <span className="text-slate-300 dark:text-slate-700">|</span>

            <span className="text-slate-500 dark:text-slate-400">
              Menampilkan <strong>{displayedQuestions.length}</strong> pertanyaan
            </span>
          </div>
        </div>

        {/* Daftar Soal */}
        <div className="space-y-3.5">
          {displayedQuestions.map((q) => {
            const currentVal = answers[q.id] || 0;
            return (
              <div 
                key={q.id}
                className={`p-4 rounded-xl border transition-all ${
                  currentVal > 0 
                    ? 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900' 
                    : 'border-amber-200/70 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10'
                }`}
              >
                <div className="flex items-start gap-3 mb-2.5">
                  <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {q.number}
                  </span>
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      {q.category}
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                      {q.text}
                    </p>
                  </div>
                </div>

                {/* Option Radio Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  {q.options.map((opt) => {
                    const isSelected = currentVal === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={!canEdit}
                        onClick={() => handleAnswerChange(q.id, opt.value)}
                        className={`px-3 py-2 rounded-xl text-xs text-left transition-all cursor-pointer flex items-center gap-2 border ${
                          isSelected 
                            ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-xs' 
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-white bg-white text-blue-600' : 'border-slate-400'
                        }`}>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                        </span>
                        <span className="line-clamp-2">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
