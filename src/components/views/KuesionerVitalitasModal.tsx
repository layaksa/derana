import React, { useState, useMemo } from 'react';
import { 
  X, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  User, 
  MapPin, 
  FileText, 
  Filter, 
  ChevronRight, 
  ChevronLeft,
  ArrowUp,
  Bookmark,
  Lock
} from 'lucide-react';
import { 
  DAFTAR_PERTANYAAN_VITALITAS, 
  VitalitasQuestionItem, 
  KuesionerVitalitasResponse, 
  calculateVitalitySummary 
} from '../../data/kuesionerVitalitasData';
import { saveVitalitasResponse } from '../../utils/vitalitasStorage';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface KuesionerVitalitasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (saved: KuesionerVitalitasResponse) => void;
  initialData?: KuesionerVitalitasResponse | null;
  canEdit?: boolean;
  defaultDesa?: string;
  defaultBahasa?: string;
  defaultKecamatan?: string;
  defaultKabupaten?: string;
}

export const KuesionerVitalitasModal: React.FC<KuesionerVitalitasModalProps> = ({
  isOpen,
  onClose,
  onSaveSuccess,
  initialData,
  canEdit = true,
  defaultDesa = '',
  defaultBahasa = '',
  defaultKecamatan = '',
  defaultKabupaten = ''
}) => {
  const isOnline = useOnlineStatus();
  const [respondenNama, setRespondenNama] = useState(initialData?.respondenNama || '');
  const [respondenUsia, setRespondenUsia] = useState<string | number>(initialData?.respondenUsia || '');
  const [respondenGender, setRespondenGender] = useState<'pria' | 'wanita'>(initialData?.respondenGender || 'pria');
  const [respondenPekerjaan, setRespondenPekerjaan] = useState(initialData?.respondenPekerjaan || '');
  const [bahasaDaerah, setBahasaDaerah] = useState(initialData?.bahasaDaerah || defaultBahasa || 'Bahasa Daerah Setempat');
  const [desa, setDesa] = useState(initialData?.desa || defaultDesa || '');
  const [kecamatan, setKecamatan] = useState(initialData?.kecamatan || defaultKecamatan || '');
  const [kabupatenKota, setKabupatenKota] = useState(initialData?.kabupatenKota || defaultKabupaten || '');
  const [catatan, setCatatan] = useState(initialData?.catatan || '');

  // Answers map: questionId -> value (1..5)
  const [answers, setAnswers] = useState<Record<number, number>>(initialData?.answers || {});
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterOnlyUnanswered, setFilterOnlyUnanswered] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    DAFTAR_PERTANYAAN_VITALITAS.forEach(q => set.add(q.category));
    return ['all', ...Array.from(set)];
  }, []);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return DAFTAR_PERTANYAAN_VITALITAS.filter(q => {
      if (filterCategory !== 'all' && q.category !== filterCategory) return false;
      if (filterOnlyUnanswered && answers[q.id]) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchText = q.text.toLowerCase().includes(term);
        const matchNum = String(q.number).includes(term);
        const matchCat = q.category.toLowerCase().includes(term);
        if (!matchText && !matchNum && !matchCat) return false;
      }
      return true;
    });
  }, [filterCategory, filterOnlyUnanswered, searchTerm, answers]);

  // Live Summary
  const liveSummary = useMemo(() => {
    return calculateVitalitySummary(answers);
  }, [answers]);

  if (!isOpen) return null;

  const handleSelectOption = (questionId: number, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleFillSample = () => {
    const sampleAns: Record<number, number> = {};
    DAFTAR_PERTANYAAN_VITALITAS.forEach(q => {
      // Generate realistic natural variation mostly 4s and 5s with some 3s
      const rand = Math.random();
      if (rand > 0.4) {
        sampleAns[q.id] = 4;
      } else if (rand > 0.15) {
        sampleAns[q.id] = 5;
      } else {
        sampleAns[q.id] = 3;
      }
    });
    setAnswers(sampleAns);
    if (!respondenNama) setRespondenNama('Bapak Surya Dinata');
    if (!respondenUsia) setRespondenUsia(54);
    if (!respondenPekerjaan) setRespondenPekerjaan('Petani / Pengrajin Lokal');
    if (!desa) setDesa(defaultDesa || 'Karangwangi');
    if (!bahasaDaerah) setBahasaDaerah(defaultBahasa || 'Bahasa Sunda');
  };

  const handleSave = () => {
    if (!respondenNama.trim()) {
      setErrorMsg('Nama responden wajib diisi sebelum menyimpan kuesioner.');
      document.getElementById('resp-nama')?.focus();
      return;
    }

    if (liveSummary.totalAnswered === 0) {
      setErrorMsg('Harap isi minimal salah satu pertanyaan pada kuesioner.');
      return;
    }

    setErrorMsg(null);

    const record: KuesionerVitalitasResponse = {
      id: initialData?.id || `vitalitas_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      respondenNama: respondenNama.trim(),
      respondenUsia: respondenUsia || undefined,
      respondenGender,
      respondenPekerjaan: respondenPekerjaan.trim() || undefined,
      bahasaDaerah: bahasaDaerah.trim() || 'Bahasa Daerah',
      desa: desa.trim() || 'Desa Pengamatan',
      kecamatan: kecamatan.trim() || undefined,
      kabupatenKota: kabupatenKota.trim() || undefined,
      answers,
      totalAnswered: liveSummary.totalAnswered,
      scoreAvg: liveSummary.scoreAvg,
      vitalitasStatus: liveSummary.vitalitasStatus,
      statusColor: liveSummary.statusColor,
      catatan: catatan.trim() || undefined,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveVitalitasResponse(record);
    onSaveSuccess(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-5xl h-[95vh] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-linear-to-r from-blue-50/80 via-indigo-50/40 to-white dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-900 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                    Kuesioner Vitalitas Bahasa Daerah
                  </h2>
                  <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                    Jendela Baru • 95 Pertanyaan Lengkap
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Instrumen survei pengukuran daya hidup bahasa daerah berdasarkan kondisi faktual penutur di lapangan.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canEdit ? (
                <button
                  type="button"
                  onClick={handleFillSample}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                  title="Isi otomatis dengan data simulasi cepat"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Sampel Cepat</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-semibold border border-amber-300 dark:border-amber-700">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Mode Hanya Baca</span>
                </span>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Tutup Formulir"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Progress Bar & Live Status */}
          <div className="mt-3.5 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-3 flex-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                Progres: <strong className="text-blue-600 dark:text-blue-400">{liveSummary.totalAnswered}/95</strong> ({liveSummary.percentage}%)
              </span>
              <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300 rounded-full" 
                  style={{ width: `${liveSummary.percentage}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Skor Rata-Rata:</span>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                {liveSummary.scoreAvg > 0 ? liveSummary.scoreAvg : '-'}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${liveSummary.statusColor}`}>
                {liveSummary.vitalitasStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {!canEdit && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-3">
              <Lock className="w-5 h-5 shrink-0 text-amber-700 dark:text-amber-400" />
              <div>
                <strong className="font-bold">Mode Hanya Baca (Tamu / Akademisi)</strong>
                <p className="mt-0.5 text-[11px] text-amber-800 dark:text-amber-300">
                  Kuesioner pengukuran daya hidup bahasa (95 pertanyaan) ini terbuka untuk penelaahan data empiris tanpa hak mengubah instrumen.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <fieldset disabled={!canEdit} className="space-y-6 border-0 p-0 m-0 min-w-0 disabled:opacity-90">
          {/* BAGIAN 1: IDENTITAS RESPONDEN & LOKASI OBSERVASI */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 sm:p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-blue-600" />
              Identitas Responden & Lokasi Pengamatan
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="sm:col-span-2">
                <label htmlFor="resp-nama" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Responden <span className="text-rose-500">*</span>
                </label>
                <input
                  id="resp-nama"
                  type="text"
                  value={respondenNama}
                  onChange={(e) => setRespondenNama(e.target.value)}
                  placeholder="Contoh: H. Abah Suwarna"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="resp-usia" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Usia (Tahun)
                </label>
                <input
                  id="resp-usia"
                  type="number"
                  min={10}
                  max={120}
                  value={respondenUsia}
                  onChange={(e) => setRespondenUsia(e.target.value)}
                  placeholder="Contoh: 68"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Jenis Kelamin
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRespondenGender('pria')}
                    className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                      respondenGender === 'pria'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Pria
                  </button>
                  <button
                    type="button"
                    onClick={() => setRespondenGender('wanita')}
                    className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                      respondenGender === 'wanita'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Wanita
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="resp-pekerjaan" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pekerjaan / Profesi
                </label>
                <input
                  id="resp-pekerjaan"
                  type="text"
                  value={respondenPekerjaan}
                  onChange={(e) => setRespondenPekerjaan(e.target.value)}
                  placeholder="Contoh: Tokoh Adat / Petani"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="resp-bahasa" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bahasa Daerah yang Diteliti
                </label>
                <input
                  id="resp-bahasa"
                  type="text"
                  value={bahasaDaerah}
                  onChange={(e) => setBahasaDaerah(e.target.value)}
                  placeholder="Contoh: Bahasa Sunda"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="resp-desa" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Desa / Titik Pengamatan
                </label>
                <input
                  id="resp-desa"
                  type="text"
                  value={desa}
                  onChange={(e) => setDesa(e.target.value)}
                  placeholder="Contoh: Karangwangi"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="resp-kecamatan" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kecamatan / Kabupaten
                </label>
                <input
                  id="resp-kecamatan"
                  type="text"
                  value={kecamatan}
                  onChange={(e) => setKecamatan(e.target.value)}
                  placeholder="Contoh: Cidaun, Kab. Cianjur"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* BAGIAN 2: DAFTAR 95 PERTANYAAN */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-xs">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Daftar Pertanyaan Kuesioner (1 — 95)
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  ({filteredQuestions.length} ditampilkan)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search in questions */}
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari pertanyaan / nomor..."
                  className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 w-36 sm:w-48"
                />

                {/* Filter Category */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 max-w-[180px]"
                >
                  <option value="all">Semua Kategori ({DAFTAR_PERTANYAAN_VITALITAS.length})</option>
                  {categories.filter(c => c !== 'all').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                {/* Unanswered filter */}
                <button
                  type="button"
                  onClick={() => setFilterOnlyUnanswered(!filterOnlyUnanswered)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                    filterOnlyUnanswered
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Belum Terjawab Saja
                </button>
              </div>
            </div>

            {/* Questions Container */}
            <div className="space-y-4">
              {filteredQuestions.map((q) => {
                const selectedVal = answers[q.id];
                const isAnswered = selectedVal !== undefined && selectedVal > 0;

                return (
                  <div
                    key={q.id}
                    id={`vitalitas-q-${q.id}`}
                    className={`p-4 sm:p-5 rounded-xl border transition-all ${
                      isAnswered
                        ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs'
                        : 'bg-amber-50/30 dark:bg-amber-950/10 border-amber-200/80 dark:border-amber-900/40 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-2.5">
                        <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                          isAnswered
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
                        }`}>
                          {q.number}
                        </span>
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            {q.category}
                          </span>
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                            {q.text}
                          </h4>
                        </div>
                      </div>

                      {isAnswered && (
                        <span className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Skor {selectedVal}</span>
                        </span>
                      )}
                    </div>

                    {/* Radio Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {q.options.map((opt) => {
                        const isSelected = selectedVal === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSelectOption(q.id, opt.value)}
                            className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-start gap-2 cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 dark:border-blue-500 text-blue-900 dark:text-blue-100 font-bold shadow-2xs ring-2 ring-blue-500/20'
                                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300'
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                            }`}>
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </span>
                            <span className="leading-snug text-[11px]">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Catatan Tambahan Responden */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <label htmlFor="resp-catatan" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan Peneliti / Kondisi Lapangan Tambahan (Opsional)
            </label>
            <textarea
              id="resp-catatan"
              rows={3}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan mengenai situasi sosial, dominasi bahasa lain, atau faktor ekologis setempat..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>
          </fieldset>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span>Terjawab: <strong className="text-slate-900 dark:text-slate-100">{liveSummary.totalAnswered} dari 95</strong></span>
              <span>•</span>
              <span>Skor: <strong className="text-blue-600 dark:text-blue-400">{liveSummary.scoreAvg}</strong> ({liveSummary.vitalitasStatus})</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span className={`inline-block w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              <span>{isOnline ? 'Tersimpan lokal & sinkron cloud' : 'Tersimpan lokal (unggah cloud saat online)'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {canEdit ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer flex-1 sm:flex-none"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer flex-1 sm:flex-none"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Kuesioner</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer w-full sm:w-auto"
              >
                Tutup Jendela (Mode Hanya Baca)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
