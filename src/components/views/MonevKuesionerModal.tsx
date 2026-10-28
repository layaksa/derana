import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Printer, 
  HelpCircle, 
  Sparkles, 
  RotateCcw,
  CheckCircle2, 
  AlertCircle, 
  Scale, 
  Award, 
  Activity, 
  BookOpen, 
  Users, 
  Building, 
  Music,
  Info,
  Lock
} from 'lucide-react';
import { 
  RevitalisasiMonevRecord, 
  MonevIndikatorNilai 
} from '../../types/revitalisasi';
import { 
  MONEV_DIMENSI_CONFIG, 
  calculateIKRBD, 
  getIKRBDCategory 
} from '../../data/revitalisasiData';

interface MonevKuesionerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: RevitalisasiMonevRecord) => void;
  editingRecord?: RevitalisasiMonevRecord | null;
  canEdit?: boolean;
  defaultDesa?: string;
  defaultBahasa?: string;
  defaultKabupaten?: string;
  defaultKecamatan?: string;
}

export const MonevKuesionerModal: React.FC<MonevKuesionerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRecord,
  canEdit = true,
  defaultDesa = '',
  defaultBahasa = '',
  defaultKabupaten = 'Kabupaten Maluku Tengah',
  defaultKecamatan = 'Leihitu'
}) => {
  const [kabupatenKota, setKabupatenKota] = useState(defaultKabupaten);
  const [kecamatan, setKecamatan] = useState(defaultKecamatan);
  const [desa, setDesa] = useState(defaultDesa);
  const [bahasaDaerah, setBahasaDaerah] = useState(defaultBahasa);
  const [tanggalEvaluasi, setTanggalEvaluasi] = useState(() => new Date().toISOString().slice(0, 10));
  const [petugasMonev, setPetugasMonev] = useState('');
  const [nipPetugas, setNipPetugas] = useState('');
  const [kepalaNegeri, setKepalaNegeri] = useState('');
  const [nipKepalaNegeri, setNipKepalaNegeri] = useState('');
  const [catatanRekomendasi, setCatatanRekomendasi] = useState('');
  
  // Indikator scores & catatan
  const [indikatorNilai, setIndikatorNilai] = useState<Record<string, MonevIndikatorNilai>>(() => {
    const init: Record<string, MonevIndikatorNilai> = {};
    MONEV_DIMENSI_CONFIG.forEach(dim => {
      dim.indikator.forEach(ind => {
        init[ind.id] = { skor: 3, catatanBukti: '' };
      });
    });
    return init;
  });

  const [activeTab, setActiveTab] = useState<'kuesioner' | 'hasil_ikrbd' | 'pedoman'>('kuesioner');

  // Load record when editing
  useEffect(() => {
    if (editingRecord) {
      setKabupatenKota(editingRecord.kabupatenKota || defaultKabupaten);
      setKecamatan(editingRecord.kecamatan || defaultKecamatan);
      setDesa(editingRecord.desa || defaultDesa);
      setBahasaDaerah(editingRecord.bahasaDaerah || defaultBahasa);
      setTanggalEvaluasi(editingRecord.tanggalEvaluasi || new Date().toISOString().slice(0, 10));
      setPetugasMonev(editingRecord.petugasMonev || '');
      setNipPetugas(editingRecord.nipPetugas || '');
      setKepalaNegeri(editingRecord.kepalaNegeri || '');
      setNipKepalaNegeri(editingRecord.nipKepalaNegeri || '');
      setCatatanRekomendasi(editingRecord.catatanRekomendasi || '');
      if (editingRecord.indikatorNilai) {
        setIndikatorNilai(editingRecord.indikatorNilai);
      }
    } else {
      setKabupatenKota(defaultKabupaten);
      setKecamatan(defaultKecamatan);
      setDesa(defaultDesa);
      setBahasaDaerah(defaultBahasa);
      setTanggalEvaluasi(new Date().toISOString().slice(0, 10));
      setPetugasMonev('');
      setNipPetugas('');
      setKepalaNegeri('');
      setNipKepalaNegeri('');
      setCatatanRekomendasi('');
      const init: Record<string, MonevIndikatorNilai> = {};
      MONEV_DIMENSI_CONFIG.forEach(dim => {
        dim.indikator.forEach(ind => {
          init[ind.id] = { skor: 3, catatanBukti: '' };
        });
      });
      setIndikatorNilai(init);
    }
  }, [editingRecord, defaultDesa, defaultBahasa, defaultKabupaten, defaultKecamatan, isOpen]);

  // Live real-time computation of IKRBD score
  const calculation = React.useMemo(() => {
    return calculateIKRBD(indikatorNilai);
  }, [indikatorNilai]);

  const categoryMeta = getIKRBDCategory(calculation.ikrbdScore);

  if (!isOpen) return null;

  const handleScoreChange = (id: string, skor: number) => {
    setIndikatorNilai(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        skor
      }
    }));
  };

  const handleCatatanChange = (id: string, catatanBukti: string) => {
    setIndikatorNilai(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        catatanBukti
      }
    }));
  };

  const handleApplySampleHitumese = () => {
    setKabupatenKota('Kabupaten Maluku Tengah');
    setKecamatan('Leihitu');
    setDesa('Negeri Hitu');
    setBahasaDaerah('Bahasa Hitumese');
    setPetugasMonev('Dr. Ahmad Pellu, M.Hum.');
    setNipPetugas('197805122003121004');
    setKepalaNegeri('Salhana Pelu (Raja Hitu)');
    setNipKepalaNegeri('196904151994031002');
    setIndikatorNilai({
      '1.1': { skor: 4, catatanBukti: 'Sebagian besar anak usia SD-SMP mengikuti kelas sore di Baileo Negeri.' },
      '1.2': { skor: 4, catatanBukti: 'Anak-anak mulai menyapa dan berbalas kalimat sapaan lokal pasca-pelatihan.' },
      '1.3': { skor: 5, catatanBukti: 'Tiga maestro adat aktif mengajar dan mentransfer petuah kapata kuno.' },
      '2.1': { skor: 4, catatanBukti: 'Sanggar Hitu Bersatu rutin latihan tiap akhir pekan mandiri.' },
      '2.2': { skor: 4, catatanBukti: 'Bahasa digunakan dalam prosesi buka sasi dan doa adat.' },
      '2.3': { skor: 3, catatanBukti: 'Relawan muda masih perlu pelatihan fasilitasi media digital.' },
      '3.1': { skor: 4, catatanBukti: 'Tersedia buku saku 100 frasa Hitu dan kumpulan cerita rakyat lokal.' },
      '3.2': { skor: 3, catatanBukti: 'Distribusi materi ke dusun pesisir seberang terkendala cuaca laut.' },
      '4.1': { skor: 3, catatanBukti: 'Rancangan Perdes perlindungan bahasa sudah diusulkan ke Saniri Negeri.' },
      '4.2': { skor: 3, catatanBukti: 'Bahasa daerah diajarkan sebagai muatan lokal pilihan 1 jam/minggu.' },
      '5.1': { skor: 4, catatanBukti: 'Festival Tunas Bahasa Ibu tingkat kecamatan diadakan meriah.' },
      '5.2': { skor: 4, catatanBukti: 'Antusiasme warga dan orang tua murid sangat tinggi saat lomba mendongeng.' }
    });
    setCatatanRekomendasi('Perlu pengesahan Perdes sesegera mungkin dan pengalokasian Dana Desa secara berkesinambungan untuk operasional sanggar.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!desa.trim() || !bahasaDaerah.trim()) {
      alert('Mohon isi nama Negeri/Desa dan Bahasa Daerah terlebih dahulu.');
      return;
    }

    const newRecord: RevitalisasiMonevRecord = {
      id: editingRecord?.id || `monev_${Date.now()}`,
      kabupatenKota: kabupatenKota.trim() || 'Kabupaten Maluku Tengah',
      kecamatan: kecamatan.trim() || '-',
      desa: desa.trim(),
      bahasaDaerah: bahasaDaerah.trim(),
      tanggalEvaluasi,
      petugasMonev: petugasMonev.trim() || 'Petugas Monev Balai Bahasa',
      nipPetugas: nipPetugas.trim(),
      kepalaNegeri: kepalaNegeri.trim(),
      nipKepalaNegeri: nipKepalaNegeri.trim(),
      indikatorNilai,
      rataRataDimensi: calculation.rataRataDimensi,
      ikrbdScore: calculation.ikrbdScore,
      kategori: calculation.kategori,
      statusPelaksanaan: calculation.statusPelaksanaan,
      intervensiKebijakan: calculation.intervensiKebijakan,
      catatanRekomendasi: catatanRekomendasi.trim(),
      createdAt: editingRecord?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(newRecord);
    onClose();
  };

  const getDimensionIcon = (id: number) => {
    switch (id) {
      case 1: return <Users className="w-4 h-4 text-blue-600 dark:text-sky-400" />;
      case 2: return <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 3: return <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 4: return <Building className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 5: return <Music className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      default: return <Scale className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 transition-colors">
        
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 uppercase">
                Jendela Kuesioner Monev IKRBD • Model C
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Instrumen Monitoring dan Evaluasi Revitalisasi Bahasa Daerah (IKRBD)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Khusus Karakteristik Bahasa Kepulauan, Penutur Terbatas & Terancam Punah
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {canEdit ? (
              <button
                type="button"
                onClick={handleApplySampleHitumese}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-sky-300 hover:bg-indigo-100 dark:hover:bg-slate-700 border border-indigo-200/60 dark:border-slate-700 transition-colors cursor-pointer"
                title="Muat data studi kasus simulasi Bahasa Hitumese"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-sky-400" />
                <span className="hidden sm:inline">Studi Kasus Hitumese</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-semibold border border-amber-300 dark:border-amber-700">
                <Lock className="w-3.5 h-3.5" />
                <span>Mode Hanya Baca</span>
              </span>
            )}
            <button
              onClick={() => window.print()}
              className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Cetak formulir instrumen"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tutup Jendela"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switcher & live score strip */}
        <div className="px-5 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('kuesioner')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'kuesioner'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              I. Matriks Evaluasi Lapangan (12 Indikator)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('hasil_ikrbd')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'hasil_ikrbd'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>II & III. Kalkulasi IKRBD</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'hasil_ikrbd' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
              }`}>
                {calculation.ikrbdScore}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pedoman')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'pedoman'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Pedoman & Bobot Dimensi
            </button>
          </div>

          {/* Quick live score badge */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Skor IKRBD:</span>
            <span className="text-base font-extrabold text-blue-600 dark:text-sky-400">
              {calculation.ikrbdScore}
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${categoryMeta.badgeColor}`}>
              {calculation.kategori}
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {!canEdit && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-3">
              <Lock className="w-5 h-5 shrink-0 text-amber-700 dark:text-amber-400" />
              <div>
                <strong className="font-bold">Mode Hanya Baca (Tamu / Akademisi)</strong>
                <p className="mt-0.5 text-[11px] text-amber-800 dark:text-amber-300">
                  Instrumen Monev IKRBD ini dalam mode penelaahan data empiris tanpa hak mengubah instrumen.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} id="monev-form" className="space-y-6">
            <fieldset disabled={!canEdit} className="space-y-6 border-0 p-0 m-0 min-w-0 disabled:opacity-90">
            
            {/* IDENTITAS WILAYAH & PETUGAS */}
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                <span>Identitas Titik Monev & Petugas Evaluator</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Kabupaten / Kota:
                  </label>
                  <input
                    type="text"
                    value={kabupatenKota}
                    onChange={e => setKabupatenKota(e.target.value)}
                    placeholder="Contoh: Kabupaten Maluku Tengah"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-hidden focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Kecamatan / Distrik:
                  </label>
                  <input
                    type="text"
                    value={kecamatan}
                    onChange={e => setKecamatan(e.target.value)}
                    placeholder="Contoh: Leihitu"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-hidden focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Negeri / Desa / Kelurahan:
                  </label>
                  <input
                    type="text"
                    value={desa}
                    onChange={e => setDesa(e.target.value)}
                    placeholder="Contoh: Negeri Hitu"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Bahasa Daerah yang Diteliti:
                  </label>
                  <input
                    type="text"
                    value={bahasaDaerah}
                    onChange={e => setBahasaDaerah(e.target.value)}
                    placeholder="Contoh: Bahasa Hitumese"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-blue-600 dark:text-sky-300 focus:outline-hidden focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Tanggal Evaluasi:
                  </label>
                  <input
                    type="date"
                    value={tanggalEvaluasi}
                    onChange={e => setTanggalEvaluasi(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-hidden focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Petugas Monev:
                  </label>
                  <input
                    type="text"
                    value={petugasMonev}
                    onChange={e => setPetugasMonev(e.target.value)}
                    placeholder="Nama Pengawas / Evaluator"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-hidden focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    NIP Petugas Monev:
                  </label>
                  <input
                    type="text"
                    value={nipPetugas}
                    onChange={e => setNipPetugas(e.target.value)}
                    placeholder="NIP Pengawas Evaluator"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-hidden focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Kepala Negeri / Raja / Camat:
                  </label>
                  <input
                    type="text"
                    value={kepalaNegeri}
                    onChange={e => setKepalaNegeri(e.target.value)}
                    placeholder="Nama Kepala Negeri / Raja"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-hidden focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    NIP / NIPN Kepala Negeri:
                  </label>
                  <input
                    type="text"
                    value={nipKepalaNegeri}
                    onChange={e => setNipKepalaNegeri(e.target.value)}
                    placeholder="NIP/NIPN (jika ada)"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* TAB 1: KUESIONER MATRIKS 5 DIMENSI */}
            {activeTab === 'kuesioner' && (
              <div className="space-y-6">
                
                {/* Scale Guide Banner */}
                <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
                    <span className="font-semibold text-blue-900 dark:text-blue-200">
                      Petunjuk Pengisian: Berikan skor 1–5 pada tiap indikator berdasarkan fakta empiris lapangan.
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-medium">
                    <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">1: Sangat Buruk / Tidak Ada</span>
                    <span className="px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300">2: Buruk / Minim</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">3: Cukup / Sedang</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">4: Baik / Memadai</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">5: Sangat Baik / Optimal</span>
                  </div>
                </div>

                {/* 5 DIMENSI ACCORDIONS / PANELS */}
                {MONEV_DIMENSI_CONFIG.map(dim => {
                  const avgDim = (calculation.rataRataDimensi as any)[`d${dim.id}`] || 0;
                  return (
                    <div 
                      key={dim.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs"
                    >
                      {/* Dimensi Header */}
                      <div className="p-4 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                            {getDimensionIcon(dim.id)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                {dim.judul}
                              </h4>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-blue-800">
                                Bobot: {dim.bobotPersen}%
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {dim.deskripsi}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                          <span className="text-xs text-slate-500 dark:text-slate-400">Rata-rata Dimensi (S̄{dim.id}):</span>
                          <strong className="text-sm text-blue-600 dark:text-sky-400 font-extrabold">
                            {avgDim.toFixed(2)}
                          </strong>
                          <span className="text-[10px] text-slate-400">/ 5.00</span>
                        </div>
                      </div>

                      {/* Indikator List */}
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {dim.indikator.map(ind => {
                          const currentSkor = indikatorNilai[ind.id]?.skor || 3;
                          const currentCatatan = indikatorNilai[ind.id]?.catatanBukti || '';

                          return (
                            <div key={ind.id} className="p-4 sm:p-5 space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                                      {ind.nomor}
                                    </span>
                                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                                      {ind.judul}
                                    </h5>
                                  </div>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 pl-8">
                                    {ind.deskripsi}
                                  </p>
                                </div>

                                {/* Score 1-5 selector */}
                                <div className="flex items-center gap-1.5 self-start sm:self-center pl-8 sm:pl-0 shrink-0">
                                  {[1, 2, 3, 4, 5].map(val => {
                                    const isSelected = currentSkor === val;
                                    let activeBg = 'bg-blue-600 text-white';
                                    if (val === 1) activeBg = 'bg-rose-600 text-white';
                                    else if (val === 2) activeBg = 'bg-orange-500 text-white';
                                    else if (val === 3) activeBg = 'bg-amber-500 text-white';
                                    else if (val === 4) activeBg = 'bg-blue-600 text-white';
                                    else if (val === 5) activeBg = 'bg-emerald-600 text-white';

                                    return (
                                      <button
                                        key={val}
                                        type="button"
                                        onClick={() => handleScoreChange(ind.id, val)}
                                        className={`w-9 h-9 rounded-lg text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                                          isSelected
                                            ? `${activeBg} ring-2 ring-blue-500/20 shadow-xs scale-105`
                                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                                        }`}
                                      >
                                        <span>{val}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Catatan Lapangan & Bukti Fisik */}
                              <div className="pl-8">
                                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                                  Catatan Lapangan & Bukti Fisik:
                                </label>
                                <textarea
                                  value={currentCatatan}
                                  onChange={e => handleCatatanChange(ind.id, e.target.value)}
                                  placeholder="Contoh: SK Saniri Negeri No. 04/2026, dokumentasi video sanggar anak, portofolio modul kapata, buku daftar hadir kelas..."
                                  rows={2}
                                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-600"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Catatan & Rekomendasi Evaluator */}
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Catatan & Rekomendasi Petugas Evaluator:
                  </h4>
                  <textarea
                    value={catatanRekomendasi}
                    onChange={e => setCatatanRekomendasi(e.target.value)}
                    placeholder="Tuliskan catatan komprehensif terkait temuan lapangan, tantangan geografis kepulauan, dan arahan intervensi kebijakan prioritas..."
                    rows={3}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-hidden focus:border-blue-600"
                  />
                </div>

              </div>
            )}

            {/* TAB 2: SIMULASI KALKULASI & HASIL EVALUASI IKRBD */}
            {activeTab === 'hasil_ikrbd' && (
              <div className="space-y-6">
                
                {/* Result Hero Card */}
                <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-sky-200 uppercase tracking-wider">
                        Indeks Kinerja Revitalisasi Bahasa Daerah (IKRBD)
                      </span>
                      <h3 className="text-xl sm:text-2xl font-extrabold mt-1 text-white">
                        Bahasa {bahasaDaerah || 'Daerah'} – {desa || 'Desa/Negeri'}
                      </h3>
                      <p className="text-xs text-sky-200/80">
                        {kecamatan}, {kabupatenKota} • Tanggal Evaluasi: {tanggalEvaluasi}
                      </p>
                    </div>

                    <div className="flex flex-col sm:items-end">
                      <span className="text-xs text-white/70">Skor Total IKRBD:</span>
                      <div className="text-4xl sm:text-5xl font-black text-amber-400">
                        {calculation.ikrbdScore}
                        <span className="text-lg text-white/60 font-normal"> / 100</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1">
                      <span className="text-[11px] text-white/60 block">Kategori Keberhasilan:</span>
                      <span className={`inline-block px-3 py-1 rounded-lg text-sm font-extrabold ${categoryMeta.badgeColor}`}>
                        {calculation.kategori}
                      </span>
                      <span className="text-xs text-sky-100 block font-semibold mt-1">
                        Status: {calculation.statusPelaksanaan}
                      </span>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1">
                      <span className="text-[11px] text-white/60 block">Intervensi Kebijakan yang Disarankan:</span>
                      <p className="text-xs text-white/90 leading-relaxed">
                        {calculation.intervensiKebijakan}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mathematical Equation & Calculation Step Breakdown */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <Scale className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Rincian Persamaan Matematika IKRBD (5 Dimensi)
                    </h4>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed overflow-x-auto">
                    <code>
                      IKRBD = [ ( S̄₁ × 0.25 ) + ( S̄₂ × 0.20 ) + ( S̄₃ × 0.20 ) + ( S̄₄ × 0.175 ) + ( S̄₅ × 0.175 ) ] × 20
                    </code>
                  </div>

                  {/* Dimension breakdown grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Dimensi 1 (Partisipasi):</span>
                      <strong className="text-sm font-bold text-slate-900 dark:text-white block mt-0.5">
                        S̄₁ = {calculation.rataRataDimensi.d1.toFixed(2)}
                      </strong>
                      <span className="text-[10px] text-blue-600 dark:text-sky-400 block mt-1">
                        × 0.25 = {(calculation.rataRataDimensi.d1 * 0.25).toFixed(4)}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-slate-800/80 border border-emerald-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Dimensi 2 (Komunitas):</span>
                      <strong className="text-sm font-bold text-slate-900 dark:text-white block mt-0.5">
                        S̄₂ = {calculation.rataRataDimensi.d2.toFixed(2)}
                      </strong>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-1">
                        × 0.20 = {(calculation.rataRataDimensi.d2 * 0.20).toFixed(4)}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-indigo-50/60 dark:bg-slate-800/80 border border-indigo-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Dimensi 3 (Modul):</span>
                      <strong className="text-sm font-bold text-slate-900 dark:text-white block mt-0.5">
                        S̄₃ = {calculation.rataRataDimensi.d3.toFixed(2)}
                      </strong>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block mt-1">
                        × 0.20 = {(calculation.rataRataDimensi.d3 * 0.20).toFixed(4)}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-amber-50/60 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Dimensi 4 (Regulasi):</span>
                      <strong className="text-sm font-bold text-slate-900 dark:text-white block mt-0.5">
                        S̄₄ = {calculation.rataRataDimensi.d4.toFixed(2)}
                      </strong>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 block mt-1">
                        × 0.175 = {(calculation.rataRataDimensi.d4 * 0.175).toFixed(4)}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-purple-50/60 dark:bg-slate-800/80 border border-purple-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Dimensi 5 (Festival):</span>
                      <strong className="text-sm font-bold text-slate-900 dark:text-white block mt-0.5">
                        S̄₅ = {calculation.rataRataDimensi.d5.toFixed(2)}
                      </strong>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 block mt-1">
                        × 0.175 = {(calculation.rataRataDimensi.d5 * 0.175).toFixed(4)}
                      </span>
                    </div>
                  </div>

                  {/* Calculation string breakdown */}
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <p>
                      <strong>Subtotal Berbobot:</strong> [ {(calculation.rataRataDimensi.d1 * 0.25).toFixed(4)} + {(calculation.rataRataDimensi.d2 * 0.20).toFixed(4)} + {(calculation.rataRataDimensi.d3 * 0.20).toFixed(4)} + {(calculation.rataRataDimensi.d4 * 0.175).toFixed(4)} + {(calculation.rataRataDimensi.d5 * 0.175).toFixed(4)} ] = <strong>{(calculation.ikrbdScore / 20).toFixed(4)}</strong>
                    </p>
                    <p>
                      <strong>Konversi Skala 100:</strong> {(calculation.ikrbdScore / 20).toFixed(4)} × 20 = <strong className="text-blue-600 dark:text-sky-400 text-sm">{calculation.ikrbdScore}</strong> → <span className="font-extrabold">{calculation.kategori}</span>
                    </p>
                  </div>
                </div>

                {/* SIGNATURE / PENGESAHAN PREVIEW */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 pb-2 border-b border-slate-100 dark:border-slate-800">
                    Pengesahan Dokumen Evaluasi Lapangan
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-center pt-2">
                    <div className="space-y-12">
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Mengetahui,<br />
                        <strong>Kepala Negeri / Raja / Camat</strong>
                      </p>
                      <div className="border-t border-slate-300 dark:border-slate-700 pt-2 w-48 mx-auto">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          ( {kepalaNegeri || '...........................................'} )
                        </p>
                        <p className="text-[10px] text-slate-500">
                          NIP/NIPN: {nipKepalaNegeri || '................................'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-12">
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Maluku, {tanggalEvaluasi || '........................ 2026'}<br />
                        <strong>Petugas Evaluator Monev</strong>
                      </p>
                      <div className="border-t border-slate-300 dark:border-slate-700 pt-2 w-48 mx-auto">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          ( {petugasMonev || '...........................................'} )
                        </p>
                        <p className="text-[10px] text-slate-500">
                          NIP: {nipPetugas || '................................'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: PEDOMAN & TABEL KATEGORISASI IKRBD */}
            {activeTab === 'pedoman' && (
              <div className="space-y-5">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                    <span>Tabel Standar Kategorisasi Keberhasilan Indeks (IKRBD)</span>
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-3 rounded-l-lg">Rentang Indeks</th>
                          <th className="p-3">Kategori</th>
                          <th className="p-3 rounded-r-lg">Status Pelaksanaan & Intervensi Kebijakan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">85.00 – 100.00</td>
                          <td className="p-3 font-extrabold text-emerald-700 dark:text-emerald-300">SANGAT BERHASIL</td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">
                            <strong>Mandiri & Optimal:</strong> Transmisi bahasa antar-generasi lancar, gerakan komunitas sangat hidup, dan regulasi lokal kuat. Siap jadi percontohan.
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-blue-600 dark:text-blue-400">70.00 – 84.99</td>
                          <td className="p-3 font-extrabold text-blue-700 dark:text-blue-300">BERHASIL</td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">
                            <strong>Efektif:</strong> Program berjalan baik, namun butuh penguatan konsisten pada koordinasi antarkomunitas dan integrasi di keluarga.
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-amber-600 dark:text-amber-400">55.00 – 69.99</td>
                          <td className="p-3 font-extrabold text-amber-700 dark:text-amber-300">CUKUP BERHASIL</td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">
                            <strong>Pendampingan Cukup:</strong> Terlaksana sebagian; inisiatif komunitas dan regulasi lokal masih terbatas. Perlu pendampingan berkala.
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-orange-600 dark:text-orange-400">40.00 – 54.99</td>
                          <td className="p-3 font-extrabold text-orange-700 dark:text-orange-300">KURANG BERHASIL</td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">
                            <strong>Kritis / Terhambat:</strong> Partisipasi komunitas & penutur muda rendah, keterbatasan maestro, dan belum ada regulasi. Perlu re-evaluasi Model C.
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-rose-600 dark:text-rose-400">&lt; 40.00</td>
                          <td className="p-3 font-extrabold text-rose-700 dark:text-rose-300">TIDAK BERHASIL</td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">
                            <strong>Emergency Intervensi:</strong> Program stagnan. Bahasa dalam kondisi sangat terancam. Butuh konsolidasi ulang bersama tokoh negeri.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            </fieldset>
          </form>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Hasil: <strong>{calculation.ikrbdScore}</strong> ({calculation.kategori})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              {canEdit ? 'Batal' : 'Tutup'}
            </button>
            {canEdit && (
              <button
                type="submit"
                form="monev-form"
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Instrumen Monev</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
