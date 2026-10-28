import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Printer, 
  FileText, 
  Calendar, 
  Users, 
  Sparkles,
  BookOpen,
  Compass,
  CheckCircle2,
  Award,
  Lock
} from 'lucide-react';
import { RevitalisasiRAPRecord, LiniMasaItem, MetodePengimbasanItem } from '../../types/revitalisasi';
import { STANDAR_LINI_MASA_RAP } from '../../data/revitalisasiData';

interface RAPKuesionerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: RevitalisasiRAPRecord) => void;
  editingRecord?: RevitalisasiRAPRecord | null;
  canEdit?: boolean;
  defaultBahasa?: string;
  defaultWilayah?: string;
}

export const RAPKuesionerModal: React.FC<RAPKuesionerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRecord,
  canEdit = true,
  defaultBahasa = '',
  defaultWilayah = ''
}) => {
  const [bahasaDaerah, setBahasaDaerah] = useState(defaultBahasa);
  
  // A. Profil Pengajar Utama
  const [namaLengkap, setNamaLengkap] = useState('');
  const [nipNik, setNipNik] = useState('');
  const [instansiUnitKerja, setInstansiUnitKerja] = useState('');
  const [wilayahTarget, setWilayahTarget] = useState(defaultWilayah);

  // B. Sasaran & Jadwal
  const [targetJumlahPengajar, setTargetJumlahPengajar] = useState<number>(15);
  const [karakteristikPengajar, setKarakteristikPengajar] = useState('Guru mata pelajaran bahasa daerah/seni budaya/mata pelajaran yang memiliki minat kebahasaan/guru kelas');
  const [targetJumlahPenuturMuda, setTargetJumlahPenuturMuda] = useState<number>(100);
  const [karakteristikSiswa, setKarakteristikSiswa] = useState('Siswa SD Kelas V, Peserta Ekstrakurikuler Bahasa, dan Remaja Komunitas Belajar');
  const [liniMasa, setLiniMasa] = useState<LiniMasaItem[]>(() => {
    return STANDAR_LINI_MASA_RAP.map((item, idx) => ({
      ...item,
      id: `tahapan_${idx + 1}`
    }));
  });

  // C. Strategi Pengimbasan
  const [bentukKegiatan, setBentukKegiatan] = useState(
    'Pengimbasan kepada pengajar sejawat melalui KKG/MGMP/rapat kerja, dan pengimbasan kepada siswa melalui kegiatan pembelajaran intrakurikuler, ekstrakurikuler, serta literasi pagi di sekolah dan komunitas.'
  );
  const [materiDanMedia, setMateriDanMedia] = useState(
    'Modul Model C Bahasa Daerah berbasis cerita rakyat lisan, rekaman penutur jati kapata/tembang, kartu kosakata bergambar, dan lembar kerja praktik dialog.'
  );
  const [metode, setMetode] = useState<MetodePengimbasanItem[]>([
    {
      id: 'metode_1',
      no: 1,
      materi: 'Mendongeng Cerita Rakyat',
      teknik: 'Ceramah, praktik mendongeng ekspresif, tanya jawab glosarium',
      media: 'Buku cerita dwibahasa, ilustrasi gambar'
    },
    {
      id: 'metode_2',
      no: 2,
      materi: 'Pidato / Tutur Adat Sederhana',
      teknik: 'Simulasi berpasangan, bermain peran (role-play)',
      media: 'Teks panduan pidato adat, mikrofon pengeras suara'
    },
    {
      id: 'metode_3',
      no: 3,
      materi: 'Tembang Tradisi / Kapata',
      teknik: 'Bernyanyi bersama (drill), ketukan tifa berirama',
      media: 'Alat musik tradisional, audio player'
    },
    {
      id: 'metode_4',
      no: 4,
      materi: 'Kosakata Harian & Permainan Rakyat',
      teknik: 'Gim tebak kata, permainan lompat kata berantai',
      media: 'Kartu flashcard kosa kata bergambar'
    }
  ]);

  // D. Indikator Keberhasilan
  const [jumlahPengajarTerimbas, setJumlahPengajarTerimbas] = useState<number>(15);
  const [jumlahSiswaTerimbas, setJumlahSiswaTerimbas] = useState<number>(100);
  const [jumlahLembagaAktif, setJumlahLembagaAktif] = useState<number>(3);
  const [targetJumlahKarya, setTargetJumlahKarya] = useState<number>(20);
  const [keikutsertaanKompetisi, setKeikutsertaanKompetisi] = useState('Festival Tunas Bahasa Ibu (FTBI) Tingkat Kabupaten & Provinsi Maluku Tahun 2026');
  const [catatanTambahan, setCatatanTambahan] = useState('');

  useEffect(() => {
    if (editingRecord) {
      setBahasaDaerah(editingRecord.bahasaDaerah || defaultBahasa);
      setNamaLengkap(editingRecord.profilPengajar.namaLengkap || '');
      setNipNik(editingRecord.profilPengajar.nipNik || '');
      setInstansiUnitKerja(editingRecord.profilPengajar.instansiUnitKerja || '');
      setWilayahTarget(editingRecord.profilPengajar.wilayahTarget || defaultWilayah);

      setTargetJumlahPengajar(editingRecord.sasaran.targetJumlahPengajarSejawat || 15);
      setKarakteristikPengajar(editingRecord.sasaran.karakteristikPengajarSejawat || '');
      setTargetJumlahPenuturMuda(editingRecord.sasaran.targetJumlahPenuturMuda || 100);
      setKarakteristikSiswa(editingRecord.sasaran.karakteristikSiswa || '');
      if (editingRecord.sasaran.liniMasa && editingRecord.sasaran.liniMasa.length > 0) {
        setLiniMasa(editingRecord.sasaran.liniMasa);
      }

      setBentukKegiatan(editingRecord.strategi.bentukKegiatan || '');
      setMateriDanMedia(editingRecord.strategi.materiDanMedia || '');
      if (editingRecord.strategi.metode && editingRecord.strategi.metode.length > 0) {
        setMetode(editingRecord.strategi.metode);
      }

      setJumlahPengajarTerimbas(editingRecord.indikator.jumlahPengajarTerimbas || 15);
      setJumlahSiswaTerimbas(editingRecord.indikator.jumlahSiswaTerimbas || 100);
      setJumlahLembagaAktif(editingRecord.indikator.jumlahLembagaAktif || 3);
      setTargetJumlahKarya(editingRecord.indikator.targetJumlahKarya || 20);
      setKeikutsertaanKompetisi(editingRecord.indikator.keikutsertaanKompetisi || '');
      setCatatanTambahan(editingRecord.catatanTambahan || '');
    } else {
      setBahasaDaerah(defaultBahasa);
      setWilayahTarget(defaultWilayah);
    }
  }, [editingRecord, defaultBahasa, defaultWilayah, isOpen]);

  if (!isOpen) return null;

  // Lini masa handlers
  const handleUpdateLiniMasa = (id: string, field: keyof LiniMasaItem, value: any) => {
    setLiniMasa(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleAddLiniMasa = () => {
    const nextNo = liniMasa.length + 1;
    setLiniMasa(prev => [
      ...prev,
      {
        id: `tahapan_${Date.now()}`,
        no: nextNo,
        tahapan: 'Pelaksanaan Pengimbasan Lanjutan',
        tanggal: new Date().toISOString().slice(0, 10),
        lokasiMedia: 'Luring (Sekolah / Sanggar)'
      }
    ]);
  };

  const handleRemoveLiniMasa = (id: string) => {
    setLiniMasa(prev => prev.filter(item => item.id !== id).map((item, idx) => ({ ...item, no: idx + 1 })));
  };

  // Metode pengimbasan handlers
  const handleUpdateMetode = (id: string, field: keyof MetodePengimbasanItem, value: any) => {
    setMetode(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleAddMetode = () => {
    const nextNo = metode.length + 1;
    setMetode(prev => [
      ...prev,
      {
        id: `metode_${Date.now()}`,
        no: nextNo,
        materi: 'Materi Baru',
        teknik: 'Praktik dan diskusi',
        media: 'Modul & lembar kerja'
      }
    ]);
  };

  const handleRemoveMetode = (id: string) => {
    setMetode(prev => prev.filter(item => item.id !== id).map((item, idx) => ({ ...item, no: idx + 1 })));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaLengkap.trim() || !bahasaDaerah.trim()) {
      alert('Mohon isi Nama Lengkap Pengajar Utama dan Bahasa Daerah.');
      return;
    }

    const record: RevitalisasiRAPRecord = {
      id: editingRecord?.id || `rap_${Date.now()}`,
      bahasaDaerah: bahasaDaerah.trim(),
      profilPengajar: {
        namaLengkap: namaLengkap.trim(),
        nipNik: nipNik.trim(),
        instansiUnitKerja: instansiUnitKerja.trim(),
        wilayahTarget: wilayahTarget.trim()
      },
      sasaran: {
        targetJumlahPengajarSejawat: Number(targetJumlahPengajar) || 0,
        karakteristikPengajarSejawat: karakteristikPengajar.trim(),
        targetJumlahPenuturMuda: Number(targetJumlahPenuturMuda) || 0,
        karakteristikSiswa: karakteristikSiswa.trim(),
        liniMasa
      },
      strategi: {
        bentukKegiatan: bentukKegiatan.trim(),
        materiDanMedia: materiDanMedia.trim(),
        metode
      },
      indikator: {
        jumlahPengajarTerimbas: Number(jumlahPengajarTerimbas) || 0,
        jumlahSiswaTerimbas: Number(jumlahSiswaTerimbas) || 0,
        jumlahLembagaAktif: Number(jumlahLembagaAktif) || 0,
        targetJumlahKarya: Number(targetJumlahKarya) || 0,
        keikutsertaanKompetisi: keikutsertaanKompetisi.trim()
      },
      catatanTambahan: catatanTambahan.trim(),
      createdAt: editingRecord?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 transition-colors">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 uppercase">
                Jendela Dokumen RAP • Pengajar Utama
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Rencana Aksi Pengimbasan (RAP) Program Revitalisasi Bahasa Daerah
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Formulir Sasaran, Jadwal Lini Masa, Strategi, dan Indikator Keberhasilan Pengimbasan
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {!canEdit && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-semibold border border-amber-300 dark:border-amber-700">
                <Lock className="w-3.5 h-3.5" />
                <span>Mode Hanya Baca</span>
              </span>
            )}
            <button
              onClick={() => window.print()}
              className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Cetak format rencana aksi"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
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
                  Dokumen Rencana Aksi Pengimbasan (RAP) ini dalam mode pratinjau data empiris tanpa hak mengubah instrumen.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} id="rap-form" className="space-y-6">
            <fieldset disabled={!canEdit} className="space-y-6 border-0 p-0 m-0 min-w-0 disabled:opacity-90">
            
            {/* A. PROFIL PENGAJAR UTAMA */}
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>A. Profil Pengajar Utama</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    1. Nama Lengkap:
                  </label>
                  <input
                    type="text"
                    value={namaLengkap}
                    onChange={e => setNamaLengkap(e.target.value)}
                    placeholder="Nama Lengkap dengan Gelar"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    2. NIP / NIK:
                  </label>
                  <input
                    type="text"
                    value={nipNik}
                    onChange={e => setNipNik(e.target.value)}
                    placeholder="NIP PNS / PPPK / NIK"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    3. Instansi / Unit Kerja:
                  </label>
                  <input
                    type="text"
                    value={instansiUnitKerja}
                    onChange={e => setInstansiUnitKerja(e.target.value)}
                    placeholder="Contoh: SD Negeri 1 Hitu / Sanggar Budaya"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-hidden focus:border-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Bahasa Daerah yang Diimbaskan:
                  </label>
                  <input
                    type="text"
                    value={bahasaDaerah}
                    onChange={e => setBahasaDaerah(e.target.value)}
                    placeholder="Contoh: Bahasa Hitumese"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-300 focus:outline-hidden focus:border-emerald-600"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    4. Wilayah Target Pengimbasan:
                  </label>
                  <input
                    type="text"
                    value={wilayahTarget}
                    onChange={e => setWilayahTarget(e.target.value)}
                    placeholder="Contoh: Gugus Leihitu, Kabupaten Maluku Tengah"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-hidden focus:border-emerald-600"
                    required
                  />
                </div>
              </div>
            </div>

            {/* B. SASARAN DAN JADWAL PELAKSANAAN */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                <span>B. Sasaran dan Jadwal Pelaksanaan</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    1. Target Jumlah Pengajar Sejawat (Orang):
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={targetJumlahPengajar}
                    onChange={e => setTargetJumlahPengajar(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold focus:outline-hidden focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    3. Target Jumlah Penutur Muda (Pelajar / Komunitas / Keluarga):
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={targetJumlahPenuturMuda}
                    onChange={e => setTargetJumlahPenuturMuda(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold focus:outline-hidden focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    2. Karakteristik Pengajar Sejawat:
                  </label>
                  <textarea
                    value={karakteristikPengajar}
                    onChange={e => setKarakteristikPengajar(e.target.value)}
                    rows={2}
                    placeholder="Contoh: Guru mata pelajaran bahasa daerah, seni budaya, guru kelas SD..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-hidden focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    4. Karakteristik / Jenjang Siswa:
                  </label>
                  <textarea
                    value={karakteristikSiswa}
                    onChange={e => setKarakteristikSiswa(e.target.value)}
                    rows={2}
                    placeholder="Contoh: Siswa SD Kelas V, Peserta Ekstrakurikuler, Remaja Masjid..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              {/* 5. TABEL LINI MASA */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    5. Rencana Lini Masa Kegiatan:
                  </label>
                  <button
                    type="button"
                    onClick={handleAddLiniMasa}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 text-blue-700 dark:text-sky-300 rounded-lg text-[11px] font-semibold border border-blue-200 dark:border-slate-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Tahapan</span>
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5 w-12 text-center">No</th>
                        <th className="p-2.5">Tahapan Kegiatan</th>
                        <th className="p-2.5 w-40">Tanggal Pelaksanaan</th>
                        <th className="p-2.5 w-48">Lokasi / Media</th>
                        <th className="p-2.5 w-12 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {liniMasa.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="p-2 text-center font-bold text-slate-500">
                            {item.no}
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.tahapan}
                              onChange={e => handleUpdateLiniMasa(item.id, 'tahapan', e.target.value)}
                              className="w-full px-2 py-1.5 bg-transparent border border-slate-200 dark:border-slate-700 rounded-md text-xs focus:outline-hidden focus:border-blue-600"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="date"
                              value={item.tanggal}
                              onChange={e => handleUpdateLiniMasa(item.id, 'tanggal', e.target.value)}
                              className="w-full px-2 py-1.5 bg-transparent border border-slate-200 dark:border-slate-700 rounded-md text-xs focus:outline-hidden focus:border-blue-600"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.lokasiMedia}
                              onChange={e => handleUpdateLiniMasa(item.id, 'lokasiMedia', e.target.value)}
                              placeholder="Daring / Luring"
                              className="w-full px-2 py-1.5 bg-transparent border border-slate-200 dark:border-slate-700 rounded-md text-xs focus:outline-hidden focus:border-blue-600"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveLiniMasa(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Hapus tahapan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* C. STRATEGI PENGIMBASAN */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>C. Strategi Pengimbasan</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    1. Bentuk Kegiatan:
                  </label>
                  <textarea
                    value={bentukKegiatan}
                    onChange={e => setBentukKegiatan(e.target.value)}
                    rows={2}
                    placeholder="Bentuk kegiatan pengimbasan kepada pengajar sejawat dan siswa..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-hidden focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    2. Materi dan Media Pengimbasan:
                  </label>
                  <textarea
                    value={materiDanMedia}
                    onChange={e => setMateriDanMedia(e.target.value)}
                    rows={2}
                    placeholder="Judul materi, sumber materi bimbingan teknis, bentuk materi, dan media penunjang..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-hidden focus:border-indigo-600"
                  />
                </div>

                {/* 3. METODE PENGIMBASAN TABEL */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      3. Rincian Metode, Materi & Media Pengimbasan:
                    </label>
                    <button
                      type="button"
                      onClick={handleAddMetode}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 text-indigo-700 dark:text-sky-300 rounded-lg text-[11px] font-semibold border border-indigo-200 dark:border-slate-700 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Materi</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5 w-12 text-center">No</th>
                          <th className="p-2.5">Materi Pengimbasan</th>
                          <th className="p-2.5">Teknik Pengimbasan (Ceramah, Praktik, Gim, dll)</th>
                          <th className="p-2.5">Media Pengimbasan</th>
                          <th className="p-2.5 w-12 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {metode.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                            <td className="p-2 text-center font-bold text-slate-500">
                              {item.no}
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={item.materi}
                                onChange={e => handleUpdateMetode(item.id, 'materi', e.target.value)}
                                className="w-full px-2 py-1.5 bg-transparent border border-slate-200 dark:border-slate-700 rounded-md text-xs focus:outline-hidden focus:border-indigo-600"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={item.teknik}
                                onChange={e => handleUpdateMetode(item.id, 'teknik', e.target.value)}
                                className="w-full px-2 py-1.5 bg-transparent border border-slate-200 dark:border-slate-700 rounded-md text-xs focus:outline-hidden focus:border-indigo-600"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={item.media}
                                onChange={e => handleUpdateMetode(item.id, 'media', e.target.value)}
                                className="w-full px-2 py-1.5 bg-transparent border border-slate-200 dark:border-slate-700 rounded-md text-xs focus:outline-hidden focus:border-indigo-600"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveMetode(item.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>

            {/* D. INDIKATOR KEBERHASILAN */}
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>D. Indikator Keberhasilan (Target Capaian)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    1. Target Pengajar Terimbas (Orang):
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={jumlahPengajarTerimbas}
                    onChange={e => setJumlahPengajarTerimbas(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold focus:outline-hidden focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    2. Target Siswa Terimbas (Orang):
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={jumlahSiswaTerimbas}
                    onChange={e => setJumlahSiswaTerimbas(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold focus:outline-hidden focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    3. Sekolah / Komunitas Aktif (Lembaga):
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={jumlahLembagaAktif}
                    onChange={e => setJumlahLembagaAktif(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold focus:outline-hidden focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    4. Target Dokumen / Karya:
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={targetJumlahKarya}
                    onChange={e => setTargetJumlahKarya(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold focus:outline-hidden focus:border-amber-600"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-4">
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    5. Keikutsertaan Kompetisi / Festival Pengajar & Siswa Terimbas:
                  </label>
                  <input
                    type="text"
                    value={keikutsertaanKompetisi}
                    onChange={e => setKeikutsertaanKompetisi(e.target.value)}
                    placeholder="Contoh: Festival Tunas Bahasa Ibu (FTBI) Tingkat Kabupaten & Provinsi"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-hidden focus:border-amber-600"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-4">
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Catatan Tambahan & Tindak Lanjut:
                  </label>
                  <textarea
                    value={catatanTambahan}
                    onChange={e => setCatatanTambahan(e.target.value)}
                    rows={2}
                    placeholder="Catatan dukungan sarana prasarana, kemitraan tokoh adat, atau koordinasi dinas pendidikan..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-hidden focus:border-amber-600"
                  />
                </div>
              </div>
            </div>
            </fieldset>

          </form>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Target Pengajar: <strong>{targetJumlahPengajar}</strong> orang • Target Siswa: <strong>{targetJumlahPenuturMuda}</strong> orang
          </span>

          <div className="flex items-center gap-2">
            {canEdit ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="rap-form"
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Rencana Aksi (RAP)</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
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
