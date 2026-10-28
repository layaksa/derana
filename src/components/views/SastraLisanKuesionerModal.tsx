import React, { useState, useMemo } from 'react';
import { 
  X, 
  Save, 
  Sparkles, 
  User, 
  MapPin, 
  Music, 
  BookOpen, 
  Eye, 
  FileText, 
  Share2, 
  CheckCircle2, 
  AlertCircle, 
  Scroll, 
  Compass, 
  Award, 
  RefreshCw,
  Tag,
  HelpCircle,
  Lock
} from 'lucide-react';
import { SastraLisanRecord } from '../../types/sastraLisan';
import { analyzeMotifDanJenis } from '../../utils/sastraLisanAnalysis';
import { saveSastraLisanRecord } from '../../utils/sastraLisanStorage';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface SastraLisanKuesionerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (saved: SastraLisanRecord) => void;
  initialData?: SastraLisanRecord | null;
  canEdit?: boolean;
  defaultDesa?: string;
  defaultBahasa?: string;
  defaultKecamatan?: string;
  defaultKabupaten?: string;
  defaultProvinsi?: string;
}

export const SastraLisanKuesionerModal: React.FC<SastraLisanKuesionerModalProps> = ({
  isOpen,
  onClose,
  onSaveSuccess,
  initialData,
  canEdit = true,
  defaultDesa = '',
  defaultBahasa = '',
  defaultKecamatan = '',
  defaultKabupaten = '',
  defaultProvinsi = 'Jawa Barat'
}) => {
  const isOnline = useOnlineStatus();
  const [activeTab, setActiveTab] = useState<'A' | 'B_Bentuk' | 'B_FisikIsi' | 'B_Konteks' | 'B_Dokumentasi' | 'Analisis'>('A');

  // A. DATA NARASUMBER
  const [narasumberNama, setNarasumberNama] = useState(initialData?.narasumber?.namaLengkap || '');
  const [komunitasStatus, setKomunitasStatus] = useState<'Ada' | 'Tidak ada'>(initialData?.narasumber?.komunitas?.status || 'Tidak ada');
  const [komunitasNama, setKomunitasNama] = useState(initialData?.narasumber?.komunitas?.namaKomunitas || '');
  const [komunitasTanggal, setKomunitasTanggal] = useState(initialData?.narasumber?.komunitas?.tanggalPendirian || '');
  const [komunitasPendiri, setKomunitasPendiri] = useState(initialData?.narasumber?.komunitas?.namaPendiri || '');
  const [komunitasAlamat, setKomunitasAlamat] = useState(initialData?.narasumber?.komunitas?.alamatSekretariat || '');
  const [tempatTanggalLahir, setTempatTanggalLahir] = useState(initialData?.narasumber?.tempatLahir || '');
  const [narasumberUsia, setNarasumberUsia] = useState<string | number>(initialData?.narasumber?.usia || '');
  const [narasumberGender, setNarasumberGender] = useState<'Laki-laki' | 'Perempuan'>(initialData?.narasumber?.jenisKelamin || 'Laki-laki');
  const [kategoriNarasumber, setKategoriNarasumber] = useState<'Juru cerita/pendukung aktif' | 'Bukan juru cerita/pendukung pasif'>(
    initialData?.narasumber?.kategoriNarasumber || 'Juru cerita/pendukung aktif'
  );
  const [narasumberPekerjaan, setNarasumberPekerjaan] = useState(initialData?.narasumber?.pekerjaan || '');
  const [keahlianSelain, setKeahlianSelain] = useState(initialData?.narasumber?.keahlianSelainPekerjaan || '');
  const [sukuBangsa, setSukuBangsa] = useState(initialData?.narasumber?.sukuBangsa || 'Sunda');
  const [daerahAsalNarasumber, setDaerahAsalNarasumber] = useState(initialData?.narasumber?.daerahAsal || '');
  const [bahasaDikuasai, setBahasaDikuasai] = useState(initialData?.narasumber?.bahasaDikuasai || '');
  const [kondisiFisik, setKondisiFisik] = useState(initialData?.narasumber?.kondisiFisikInforman || 'Sehat');

  // B. DATA SASTRA LISAN
  const [namaSastraLisan, setNamaSastraLisan] = useState(initialData?.namaSastraLisan || '');
  // Lokasi
  const [provinsi, setProvinsi] = useState(initialData?.lokasi?.provinsi || defaultProvinsi);
  const [kabupatenKota, setKabupatenKota] = useState(initialData?.lokasi?.kabupatenKota || defaultKabupaten);
  const [kecamatan, setKecamatan] = useState(initialData?.lokasi?.kecamatan || defaultKecamatan);
  const [desaKelurahan, setDesaKelurahan] = useState(initialData?.lokasi?.desaKelurahan || defaultDesa);
  const [jalan, setJalan] = useState(initialData?.lokasi?.jalan || '');
  const [kodePos, setKodePos] = useState(initialData?.lokasi?.kodePos || '');
  const [titikKoordinat, setTitikKoordinat] = useState(initialData?.lokasi?.titikKoordinat || '');

  // Bentuk
  const [kategoriPenutur, setKategoriPenutur] = useState<'Sendiri' | 'Duet' | 'Kelompok'>(initialData?.kategoriPenutur || 'Sendiri');
  const [bentukTuturan, setBentukTuturan] = useState<'Diceritakan' | 'Dinyanyikan' | 'Dibacakan' | 'dialog'>(initialData?.bentukTuturan || 'Diceritakan');
  const [bahasaDigunakan, setBahasaDigunakan] = useState(initialData?.bahasaDigunakan || defaultBahasa || 'Bahasa Sunda');
  const [iringanMusik, setIringanMusik] = useState(initialData?.iringanMusik || '');

  // Deskripsi Fisik Pertunjukan
  const [tempatPertunjukan, setTempatPertunjukan] = useState(initialData?.tempatPertunjukan || '');
  const [dekorasi, setDekorasi] = useState(initialData?.dekorasi || '');
  const [kostum, setKostum] = useState(initialData?.kostum || '');
  const [formasi, setFormasi] = useState(initialData?.formasi || '');
  const [posisiPenonton, setPosisiPenonton] = useState(initialData?.posisiPenonton || '');
  const [interaksiPenuturPenonton, setInteraksiPenuturPenonton] = useState(initialData?.interaksiPenuturDanPenonton || '');
  const [waktuPertunjukan, setWaktuPertunjukan] = useState(initialData?.waktuPertunjukan || '');
  const [syaratPertunjukan, setSyaratPertunjukan] = useState(initialData?.syaratPertunjukan || '');

  // Isi
  const [deskripsiSingkat, setDeskripsiSingkat] = useState(initialData?.deskripsiSingkat || '');
  const [kutipanTuturan, setKutipanTuturan] = useState(initialData?.kutipanTuturan || '');

  // Konteks
  const [daerahAsalSastra, setDaerahAsalSastra] = useState(initialData?.daerahAsalSastra || '');
  const [persebaran, setPersebaran] = useState(initialData?.persebaran || '');
  const [sukuPemilik, setSukuPemilik] = useState(initialData?.sukuPemilik || 'Sunda');
  const [gambaranTopografis, setGambaranTopografis] = useState(initialData?.gambaranTopografis || '');
  const [khalayakJumlah, setKhalayakJumlah] = useState(initialData?.khalayakPenonton?.jumlah || '');
  const [khalayakUsia, setKhalayakUsia] = useState(initialData?.khalayakPenonton?.usia || '');
  const [khalayakGender, setKhalayakGender] = useState(initialData?.khalayakPenonton?.jenisKelamin || '');
  const [tujuanPertunjukan, setTujuanPertunjukan] = useState(initialData?.tujuanPertunjukan || '');
  const [suasanaPertunjukan, setSuasanaPertunjukan] = useState(initialData?.suasanaPertunjukan || '');
  const [frekuensiPertunjukan, setFrekuensiPertunjukan] = useState(initialData?.frekuensiPertunjukanSaatIni || '');
  const [komunitasMenghidupi, setKomunitasMenghidupi] = useState(initialData?.komunitasMenghidupi || '');
  const [sistemPewarisan, setSistemPewarisan] = useState(initialData?.sistemPewarisan || '');
  const [infrastruktur, setInfrastruktur] = useState(initialData?.infrastruktur || '');

  // Data Pengambil & Dokumentasi
  const [pengambilNama, setPengambilNama] = useState(initialData?.pengambilData?.nama || 'Tim Peneliti Sastra');
  const [pengambilSatker, setPengambilSatker] = useState(initialData?.pengambilData?.satuanKerja || 'Balai Bahasa');
  const [pengambilTanggal, setPengambilTanggal] = useState(initialData?.pengambilData?.tanggalPengambilanData || new Date().toISOString().slice(0, 10));

  const [docBentuk, setDocBentuk] = useState(initialData?.hasilDokumentasi?.bentukDokumentasi || 'Audio WAV, Video, Naskah');
  const [docTautan, setDocTautan] = useState(initialData?.hasilDokumentasi?.tautanHasilDokumentasi || '');
  const [docPerekam, setDocPerekam] = useState(initialData?.hasilDokumentasi?.namaPerekam || '');
  const [docInstansi, setDocInstansi] = useState(initialData?.hasilDokumentasi?.asalInstansi || '');

  const [transkripsiLampiran, setTranskripsiLampiran] = useState(initialData?.transkripsi?.lampiranHasilTranskripsi || '');
  const [transkripsiNama, setTranskripsiNama] = useState(initialData?.transkripsi?.namaPentranskripsi || '');
  const [transkripsiInstansi, setTranskripsiInstansi] = useState(initialData?.transkripsi?.asalInstansi || '');

  const [terjemahanLampiran, setTerjemahanLampiran] = useState(initialData?.terjemahan?.lampiranHasilTerjemahan || '');
  const [terjemahanNama, setTerjemahanNama] = useState(initialData?.terjemahan?.namaPenerjemah || '');
  const [terjemahanInstansi, setTerjemahanInstansi] = useState(initialData?.terjemahan?.asalInstansi || '');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live Auto-Analysis of Motif and Genre
  const liveAnalysis = useMemo(() => {
    return analyzeMotifDanJenis({
      namaSastra: namaSastraLisan,
      deskripsi: deskripsiSingkat,
      kutipan: kutipanTuturan,
      bentukTuturan,
      iringanMusik,
      syarat: syaratPertunjukan,
      tujuan: tujuanPertunjukan
    });
  }, [namaSastraLisan, deskripsiSingkat, kutipanTuturan, bentukTuturan, iringanMusik, syaratPertunjukan, tujuanPertunjukan]);

  if (!isOpen) return null;

  const handleFillSample = () => {
    setNamaSastraLisan('Sasakala Curug Sawer & Putri Mayang Sari');
    setDeskripsiSingkat('Legenda toponimi tentang terbentuknya air terjun berkabut pelangi di kaki tebing karang, tempat persemayaman roh suci Putri Mayang Sari yang mengorbankan diri demi menyelamatkan penduduk desa dari bahaya paceklik berkepanjangan.');
    setKutipanTuturan('"Ieu cai curug moal pareum saendeng-endeng, salila urang lembur tetep satia ngariksa leuweung tutupan..."');
    setBentukTuturan('Diceritakan');
    setIringanMusik('Kacapi Suling buhun laras Madenda');
    setTempatPertunjukan('Pelataran Saung Adat & Hulu Curug');
    setSyaratPertunjukan('Sesajen kemenyan wangi, bubur beureum bubur bodas, dan niat bersih');
    setTujuanPertunjukan('Pendidikan konservasi sumber mata air dan peringatan toponimi desa');
    setNarasumberNama('Ki Warsa Danusubrata');
    setNarasumberUsia(67);
    setNarasumberPekerjaan('Juru Kisah Adat / Sesepuh Lembur');
    setSukuBangsa('Sunda');
    setBahasaDikuasai('Bahasa Sunda Buhun, Bahasa Indonesia');
    setBahasaDigunakan('Bahasa Sunda');
    setDaerahAsalSastra('Tatar Pasundan');
    setSukuPemilik('Sunda');
    setProvinsi(defaultProvinsi || 'Jawa Barat');
    setDesaKelurahan(defaultDesa || 'Cikaso');
    setKecamatan(defaultKecamatan || 'Kramatmulya');
    setKabupatenKota(defaultKabupaten || 'Kuningan');
  };

  const handleSave = () => {
    if (!namaSastraLisan.trim()) {
      setErrorMsg('Nama sastra lisan wajib diisi.');
      setActiveTab('B_Bentuk');
      return;
    }

    if (!narasumberNama.trim()) {
      setErrorMsg('Nama narasumber wajib diisi.');
      setActiveTab('A');
      return;
    }

    setErrorMsg(null);

    const record: SastraLisanRecord = {
      id: initialData?.id || `sastra_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      narasumber: {
        namaLengkap: narasumberNama.trim(),
        komunitas: {
          status: komunitasStatus,
          namaKomunitas: komunitasNama.trim() || undefined,
          tanggalPendirian: komunitasTanggal || undefined,
          namaPendiri: komunitasPendiri.trim() || undefined,
          alamatSekretariat: komunitasAlamat.trim() || undefined
        },
        tempatLahir: tempatTanggalLahir.trim() || undefined,
        usia: narasumberUsia || undefined,
        jenisKelamin: narasumberGender,
        kategoriNarasumber,
        pekerjaan: narasumberPekerjaan.trim() || undefined,
        keahlianSelainPekerjaan: keahlianSelain.trim() || undefined,
        sukuBangsa: sukuBangsa.trim() || 'Sunda',
        daerahAsal: daerahAsalNarasumber.trim() || undefined,
        bahasaDikuasai: bahasaDikuasai.trim() || undefined,
        kondisiFisikInforman: kondisiFisik.trim() || undefined
      },
      namaSastraLisan: namaSastraLisan.trim(),
      lokasi: {
        provinsi: provinsi.trim() || 'Jawa Barat',
        kabupatenKota: kabupatenKota.trim() || '',
        kecamatan: kecamatan.trim() || '',
        desaKelurahan: desaKelurahan.trim() || '',
        jalan: jalan.trim() || undefined,
        kodePos: kodePos.trim() || undefined,
        titikKoordinat: titikKoordinat.trim() || undefined
      },
      kategoriPenutur,
      bentukTuturan,
      bahasaDigunakan: bahasaDigunakan.trim() || 'Bahasa Sunda',
      iringanMusik: iringanMusik.trim() || '',
      tempatPertunjukan: tempatPertunjukan.trim() || '',
      dekorasi: dekorasi.trim() || undefined,
      kostum: kostum.trim() || undefined,
      formasi: formasi.trim() || undefined,
      posisiPenonton: posisiPenonton.trim() || undefined,
      interaksiPenuturDanPenonton: interaksiPenuturPenonton.trim() || undefined,
      waktuPertunjukan: waktuPertunjukan.trim() || undefined,
      syaratPertunjukan: syaratPertunjukan.trim() || undefined,
      deskripsiSingkat: deskripsiSingkat.trim() || '',
      kutipanTuturan: kutipanTuturan.trim() || '',
      daerahAsalSastra: daerahAsalSastra.trim() || '',
      persebaran: persebaran.trim() || undefined,
      sukuPemilik: sukuPemilik.trim() || 'Sunda',
      gambaranTopografis: gambaranTopografis.trim() || undefined,
      khalayakPenonton: {
        jumlah: khalayakJumlah.trim() || undefined,
        usia: khalayakUsia.trim() || undefined,
        jenisKelamin: khalayakGender.trim() || undefined
      },
      tujuanPertunjukan: tujuanPertunjukan.trim() || undefined,
      suasanaPertunjukan: suasanaPertunjukan.trim() || undefined,
      frekuensiPertunjukanSaatIni: frekuensiPertunjukan.trim() || undefined,
      komunitasMenghidupi: komunitasMenghidupi.trim() || undefined,
      sistemPewarisan: sistemPewarisan.trim() || undefined,
      infrastruktur: infrastruktur.trim() || undefined,
      pengambilData: {
        nama: pengambilNama.trim() || 'Peneliti',
        satuanKerja: pengambilSatker.trim() || undefined,
        tanggalPengambilanData: pengambilTanggal || new Date().toISOString().slice(0, 10)
      },
      hasilDokumentasi: {
        bentukDokumentasi: docBentuk.trim() || 'Audio / Naskah',
        tautanHasilDokumentasi: docTautan.trim() || undefined,
        namaPerekam: docPerekam.trim() || undefined,
        asalInstansi: docInstansi.trim() || undefined
      },
      transkripsi: {
        lampiranHasilTranskripsi: transkripsiLampiran.trim() || '',
        namaPentranskripsi: transkripsiNama.trim() || undefined,
        asalInstansi: transkripsiInstansi.trim() || undefined
      },
      terjemahan: {
        lampiranHasilTerjemahan: terjemahanLampiran.trim() || '',
        namaPenerjemah: terjemahanNama.trim() || undefined,
        asalInstansi: terjemahanInstansi.trim() || undefined
      },
      analisisJenis: liveAnalysis.analisisJenis,
      analisisMotif: liveAnalysis.analisisMotif,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveSastraLisanRecord(record);
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
                <Scroll className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                    Instrumen Pemetaan Sastra Lisan
                  </h2>
                  <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                    Jendela Baru • 28 Butir Baku & Motif
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Formulir pendokumentasian narasumber, konteks pertunjukan, transkripsi tuturan, dan analisis otomatis motif Stith Thompson.
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

          {/* Sub Navigation Tabs */}
          <div className="mt-4 pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'A', label: 'A. Data Narasumber (1-11)', icon: User },
              { id: 'B_Bentuk', label: 'B1. Bentuk & Lokasi (1-6)', icon: MapPin },
              { id: 'B_FisikIsi', label: 'B2. Fisik & Isi Tuturan (7-13)', icon: FileText },
              { id: 'B_Konteks', label: 'B3. Konteks & Khalayak (14-24)', icon: BookOpen },
              { id: 'B_Dokumentasi', label: 'B4. Dokumentasi & Alih Bahasa (25-28)', icon: Share2 },
              { id: 'Analisis', label: '✨ Analisis Motif & Jenis', icon: Sparkles }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.id === 'Analisis' && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-400 text-slate-950 font-extrabold ml-0.5">
                      Auto
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {!canEdit && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-3">
              <Lock className="w-5 h-5 shrink-0 text-amber-700 dark:text-amber-400" />
              <div>
                <strong className="font-bold">Mode Hanya Baca (Tamu / Akademisi)</strong>
                <p className="mt-0.5 text-[11px] text-amber-800 dark:text-amber-300">
                  Instrumen kuesioner sastra lisan ini terbuka untuk penelaahan data empiris tanpa hak mengubah instrumen.
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

          <fieldset disabled={!canEdit} className="space-y-5 border-0 p-0 m-0 min-w-0 disabled:opacity-90">
          {/* TAB A: DATA NARASUMBER (1 - 11) */}
          {activeTab === 'A' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  A. Data Narasumber / Informan Pelestari Sastra Lisan
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      1. Nama Lengkap Narasumber <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={narasumberNama}
                      onChange={e => setNarasumberNama(e.target.value)}
                      placeholder="Nama lengkap informan juru cerita"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      2. Keberadaan Komunitas
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setKomunitasStatus('Ada')}
                        className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                          komunitasStatus === 'Ada'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        a) Ada
                      </button>
                      <button
                        type="button"
                        onClick={() => setKomunitasStatus('Tidak ada')}
                        className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                          komunitasStatus === 'Tidak ada'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        b) Tidak ada
                      </button>
                    </div>
                  </div>

                  {komunitasStatus === 'Ada' && (
                    <div className="col-span-full p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          Nama Komunitas:
                        </label>
                        <input
                          type="text"
                          value={komunitasNama}
                          onChange={e => setKomunitasNama(e.target.value)}
                          placeholder="Nama sanggar / paguyuban seni tutur"
                          className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          Tanggal Pendirian:
                        </label>
                        <input
                          type="date"
                          value={komunitasTanggal}
                          onChange={e => setKomunitasTanggal(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          Nama Pendiri:
                        </label>
                        <input
                          type="text"
                          value={komunitasPendiri}
                          onChange={e => setKomunitasPendiri(e.target.value)}
                          placeholder="Nama tokoh pendiri sanggar"
                          className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          Alamat Sekretariat:
                        </label>
                        <input
                          type="text"
                          value={komunitasAlamat}
                          onChange={e => setKomunitasAlamat(e.target.value)}
                          placeholder="Alamat sekretariat sanggar"
                          className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      3. Tempat, Tanggal Lahir / Usia
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={tempatTanggalLahir}
                        onChange={e => setTempatTanggalLahir(e.target.value)}
                        placeholder="Tempat lahir"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                      />
                      <input
                        type="number"
                        value={narasumberUsia}
                        onChange={e => setNarasumberUsia(e.target.value)}
                        placeholder="Usia (Thn)"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      4. Jenis Kelamin
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setNarasumberGender('Laki-laki')}
                        className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                          narasumberGender === 'Laki-laki'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        a) Laki-laki
                      </button>
                      <button
                        type="button"
                        onClick={() => setNarasumberGender('Perempuan')}
                        className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                          narasumberGender === 'Perempuan'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        b) Perempuan
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      5. Kategori Narasumber
                    </label>
                    <select
                      value={kategoriNarasumber}
                      onChange={e => setKategoriNarasumber(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    >
                      <option value="Juru cerita/pendukung aktif">a) Juru cerita / pendukung aktif</option>
                      <option value="Bukan juru cerita/pendukung pasif">b) Bukan juru cerita / pendukung pasif</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      6. Pekerjaan
                    </label>
                    <input
                      type="text"
                      value={narasumberPekerjaan}
                      onChange={e => setNarasumberPekerjaan(e.target.value)}
                      placeholder="Petani / Guru / Seniman"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      7. Keahlian Selain Pekerjaan
                    </label>
                    <input
                      type="text"
                      value={keahlianSelain}
                      onChange={e => setKeahlianSelain(e.target.value)}
                      placeholder="Pemetik kecapi, dalang wayang, pembuat sesaji"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      8. Suku Bangsa
                    </label>
                    <input
                      type="text"
                      value={sukuBangsa}
                      onChange={e => setSukuBangsa(e.target.value)}
                      placeholder="Sunda / Jawa / Melayu / dsb."
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      9. Daerah Asal Narasumber
                    </label>
                    <input
                      type="text"
                      value={daerahAsalNarasumber}
                      onChange={e => setDaerahAsalNarasumber(e.target.value)}
                      placeholder="Contoh: Kuningan, Ciamis, Cianjur"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      10. Bahasa yang Dikuasai
                    </label>
                    <input
                      type="text"
                      value={bahasaDikuasai}
                      onChange={e => setBahasaDikuasai(e.target.value)}
                      placeholder="Bahasa Sunda, Bahasa Indonesia, Jawa"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      11. Kondisi Fisik Informan
                    </label>
                    <input
                      type="text"
                      value={kondisiFisik}
                      onChange={e => setKondisiFisik(e.target.value)}
                      placeholder="Sehat / Prima / Vokal lantang"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB B1: BENTUK & LOKASI (1 - 6) */}
          {activeTab === 'B_Bentuk' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  B. Data Sastra Lisan & Bentuk Pertunjukan (Butir 1 - 6)
                </h3>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      1. Nama Sastra Lisan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={namaSastraLisan}
                      onChange={e => setNamaSastraLisan(e.target.value)}
                      placeholder="Contoh: Sasakala Batu Karang Meja jeung Putri Candra Wulan"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="p-3.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      2. Lokasi Pengambilan Data
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <span className="text-[11px] text-slate-500 block mb-0.5">Provinsi:</span>
                        <input
                          type="text"
                          value={provinsi}
                          onChange={e => setProvinsi(e.target.value)}
                          placeholder="Jawa Barat"
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block mb-0.5">Kabupaten / Kota:</span>
                        <input
                          type="text"
                          value={kabupatenKota}
                          onChange={e => setKabupatenKota(e.target.value)}
                          placeholder="Kuningan"
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block mb-0.5">Kecamatan:</span>
                        <input
                          type="text"
                          value={kecamatan}
                          onChange={e => setKecamatan(e.target.value)}
                          placeholder="Kramatmulya"
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block mb-0.5">Desa / Kelurahan:</span>
                        <input
                          type="text"
                          value={desaKelurahan}
                          onChange={e => setDesaKelurahan(e.target.value)}
                          placeholder="Cikaso"
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block mb-0.5">Jalan / Dusun:</span>
                        <input
                          type="text"
                          value={jalan}
                          onChange={e => setJalan(e.target.value)}
                          placeholder="Jl. Situs Keramat No. 12"
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block mb-0.5">Titik Koordinat:</span>
                        <input
                          type="text"
                          value={titikKoordinat}
                          onChange={e => setTitikKoordinat(e.target.value)}
                          placeholder="-6.9745, 108.4872"
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        3. Kategori Penutur
                      </label>
                      <select
                        value={kategoriPenutur}
                        onChange={e => setKategoriPenutur(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                      >
                        <option value="Sendiri">a) Sendiri</option>
                        <option value="Duet">b) Duet</option>
                        <option value="Kelompok">c) Kelompok</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        4. Bentuk Tuturan
                      </label>
                      <select
                        value={bentukTuturan}
                        onChange={e => setBentukTuturan(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                      >
                        <option value="Diceritakan">a) Diceritakan</option>
                        <option value="Dinyanyikan">b) Dinyanyikan</option>
                        <option value="Dibacakan">c) Dibacakan</option>
                        <option value="dialog">d) Dialog</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        5. Bahasa yang Digunakan
                      </label>
                      <input
                        type="text"
                        value={bahasaDigunakan}
                        onChange={e => setBahasaDigunakan(e.target.value)}
                        placeholder="Bahasa Sunda"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        6. Iringan Musik yang Digunakan
                      </label>
                      <input
                        type="text"
                        value={iringanMusik}
                        onChange={e => setIringanMusik(e.target.value)}
                        placeholder="Kacapi Suling, Gamelan, Tanpa Musik"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB B2: DESKRIPSI FISIK & ISI (7 - 13) */}
          {activeTab === 'B_FisikIsi' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Deskripsi Fisik Pertunjukan & Isi Tuturan (Butir 7 - 13)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      7. Tempat Pertunjukan
                    </label>
                    <input
                      type="text"
                      value={tempatPertunjukan}
                      onChange={e => setTempatPertunjukan(e.target.value)}
                      placeholder="Balai desa, saung adat, rumah panggung"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      8. Dekorasi
                    </label>
                    <input
                      type="text"
                      value={dekorasi}
                      onChange={e => setDekorasi(e.target.value)}
                      placeholder="Samak pandan, lampu damar, janur"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      9. Kostum
                    </label>
                    <input
                      type="text"
                      value={kostum}
                      onChange={e => setKostum(e.target.value)}
                      placeholder="Pangsi hideung, iket barangbang semplak"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      10. Formasi
                    </label>
                    <input
                      type="text"
                      value={formasi}
                      onChange={e => setFormasi(e.target.value)}
                      placeholder="Duduk bersila melingkar"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      11. Posisi Penonton
                    </label>
                    <input
                      type="text"
                      value={posisiPenonton}
                      onChange={e => setPosisiPenonton(e.target.value)}
                      placeholder="Melingkari penutur di lantai"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      a. Interaksi Penutur dan Penonton
                    </label>
                    <input
                      type="text"
                      value={interaksiPenuturPenonton}
                      onChange={e => setInteraksiPenuturPenonton(e.target.value)}
                      placeholder="Penonton menimpali seruan juru cerita"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      b. Waktu Pertunjukan
                    </label>
                    <input
                      type="text"
                      value={waktuPertunjukan}
                      onChange={e => setWaktuPertunjukan(e.target.value)}
                      placeholder="Malam hari setelah Isya hingga tengah malam"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      c. Syarat Pertunjukan
                    </label>
                    <input
                      type="text"
                      value={syaratPertunjukan}
                      onChange={e => setSyaratPertunjukan(e.target.value)}
                      placeholder="Wewangian dupa menyan, sesaji, pantangan berkata kotor"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div className="col-span-full">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      12. Deskripsi Singkat Isi Sastra Lisan <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={deskripsiSingkat}
                      onChange={e => setDeskripsiSingkat(e.target.value)}
                      placeholder="Uraikan alur ringkas cerita rakyat, mitos, legenda, atau makna syair sastra lisan..."
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div className="col-span-full">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      13. Kutipan Tuturan Sastra Lisan (Bahasa Asli) <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={kutipanTuturan}
                      onChange={e => setKutipanTuturan(e.target.value)}
                      placeholder="Tuliskan petikan kalimat asli yang dituturkan juru cerita..."
                      className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB B3: KONTEKS & KHALAYAK (14 - 24) */}
          {activeTab === 'B_Konteks' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Konteks Sosio-Kultural & Khalayak (Butir 14 - 24)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      14. Daerah Asal Sastra Lisan
                    </label>
                    <input
                      type="text"
                      value={daerahAsalSastra}
                      onChange={e => setDaerahAsalSastra(e.target.value)}
                      placeholder="Desa Cikaso / Tatar Sunda"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      15. Persebaran
                    </label>
                    <input
                      type="text"
                      value={persebaran}
                      onChange={e => setPersebaran(e.target.value)}
                      placeholder="Wilayah desa tetangga dan lereng gunung"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      16. Suku Pemilik Sastra Lisan
                    </label>
                    <input
                      type="text"
                      value={sukuPemilik}
                      onChange={e => setSukuPemilik(e.target.value)}
                      placeholder="Suku Sunda / Jawa / Melayu"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      17. Gambaran Topografis Wilayah Sastra Lisan
                    </label>
                    <input
                      type="text"
                      value={gambaranTopografis}
                      onChange={e => setGambaranTopografis(e.target.value)}
                      placeholder="Perbukitan terjal, dekat aliran sungai, tepi danau"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      18. Khalayak/Penonton (Jumlah & Usia)
                    </label>
                    <input
                      type="text"
                      value={khalayakJumlah}
                      onChange={e => setKhalayakJumlah(e.target.value)}
                      placeholder="Sekitar 50-100 orang, segala usia"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      19. Tujuan Pertunjukan
                    </label>
                    <input
                      type="text"
                      value={tujuanPertunjukan}
                      onChange={e => setTujuanPertunjukan(e.target.value)}
                      placeholder="Pendidikan moral, ruwatan desa, hiburan rakyat"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      20. Suasana Pertunjukan
                    </label>
                    <input
                      type="text"
                      value={suasanaPertunjukan}
                      onChange={e => setSuasanaPertunjukan(e.target.value)}
                      placeholder="Khidmat, tenang, sesekali riuh gembira"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      21. Frekuensi Pertunjukan Saat Ini
                    </label>
                    <input
                      type="text"
                      value={frekuensiPertunjukan}
                      onChange={e => setFrekuensiPertunjukan(e.target.value)}
                      placeholder="Setahun 2-3 kali saat panen raya / ruwatan"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      22. Komunitas yang Menghidupi
                    </label>
                    <input
                      type="text"
                      value={komunitasMenghidupi}
                      onChange={e => setKomunitasMenghidupi(e.target.value)}
                      placeholder="Sanggar tari & tutur desa, dewan adat"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      23. Sistem Pewarisan
                    </label>
                    <input
                      type="text"
                      value={sistemPewarisan}
                      onChange={e => setSistemPewarisan(e.target.value)}
                      placeholder="Lisan turun-temurun dalam keluarga / sanggar"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      24. Infrastruktur
                    </label>
                    <input
                      type="text"
                      value={infrastruktur}
                      onChange={e => setInfrastruktur(e.target.value)}
                      placeholder="Balai desa, panggung teras, penerangan listrik"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB B4: DOKUMENTASI & ALIH BAHASA (25 - 28) */}
          {activeTab === 'B_Dokumentasi' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-600" />
                  Data Pengambil, Hasil Dokumentasi & Alih Bahasa (Butir 25 - 28)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  <div className="col-span-full font-bold text-xs text-slate-800 dark:text-slate-200 pb-1 border-b border-slate-200 dark:border-slate-700">
                    25. Pengambil Data
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">a. Nama Pengambil Data</label>
                    <input
                      type="text"
                      value={pengambilNama}
                      onChange={e => setPengambilNama(e.target.value)}
                      placeholder="Nama peneliti lapangan"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">b. Satuan Kerja</label>
                    <input
                      type="text"
                      value={pengambilSatker}
                      onChange={e => setPengambilSatker(e.target.value)}
                      placeholder="Balai Bahasa / Universitas"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">c. Tanggal Pengambilan Data</label>
                    <input
                      type="date"
                      value={pengambilTanggal}
                      onChange={e => setPengambilTanggal(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div className="col-span-full font-bold text-xs text-slate-800 dark:text-slate-200 pb-1 border-b border-slate-200 dark:border-slate-700 mt-2">
                    26. Hasil Dokumentasi
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">a. Bentuk Dokumentasi</label>
                    <input
                      type="text"
                      value={docBentuk}
                      onChange={e => setDocBentuk(e.target.value)}
                      placeholder="Video Full HD, Audio WAV, Foto"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">b. Tautan Hasil Dokumentasi</label>
                    <input
                      type="text"
                      value={docTautan}
                      onChange={e => setDocTautan(e.target.value)}
                      placeholder="https://drive.google.com/... atau URL repositori"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">c. Nama Perekam & d. Asal Instansi</label>
                    <input
                      type="text"
                      value={docPerekam}
                      onChange={e => setDocPerekam(e.target.value)}
                      placeholder="Nama teknisi / perekam data"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div className="col-span-full font-bold text-xs text-slate-800 dark:text-slate-200 pb-1 border-b border-slate-200 dark:border-slate-700 mt-2">
                    27. Transkripsi
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">a. Lampiran / Uraian Hasil Transkripsi</label>
                    <textarea
                      rows={2}
                      value={transkripsiLampiran}
                      onChange={e => setTranskripsiLampiran(e.target.value)}
                      placeholder="Naskah transkripsi utuh tuturan..."
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">b. Nama Pentranskripsi & Instansi</label>
                    <input
                      type="text"
                      value={transkripsiNama}
                      onChange={e => setTranskripsiNama(e.target.value)}
                      placeholder="Nama ahli bahasa pentranskripsi"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div className="col-span-full font-bold text-xs text-slate-800 dark:text-slate-200 pb-1 border-b border-slate-200 dark:border-slate-700 mt-2">
                    28. Terjemahan
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">a. Lampiran / Hasil Terjemahan (Bahasa Indonesia)</label>
                    <textarea
                      rows={2}
                      value={terjemahanLampiran}
                      onChange={e => setTerjemahanLampiran(e.target.value)}
                      placeholder="Terjemahan teks tuturan ke dalam bahasa Indonesia baku..."
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">b. Nama Penerjemah & Instansi</label>
                    <input
                      type="text"
                      value={terjemahanNama}
                      onChange={e => setTerjemahanNama(e.target.value)}
                      placeholder="Nama penerjemah"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB ANALISIS: ANALISIS MOTIF & JENIS */}
          {activeTab === 'Analisis' && (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-br from-indigo-50/70 via-blue-50/40 to-white dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-900/50 shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-3 border-b border-indigo-100 dark:border-indigo-900/50 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        Hasil Analisis Otomatis Motif & Jenis Folklor
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Dihitung secara komputasional berdasarkan semantik judul, tuturan, dan indeks Stith Thompson.
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800">
                    Confidence: {liveAnalysis.analisisJenis.confidenceScore}%
                  </span>
                </div>

                {/* 1. Klasifikasi Jenis */}
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Klasifikasi Genre / Jenis Utama:</span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold">
                        {liveAnalysis.analisisJenis.jenisUtama}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Sub-Jenis: <strong className="text-blue-600 dark:text-blue-400">{liveAnalysis.analisisJenis.subJenis}</strong>
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                    {liveAnalysis.analisisJenis.penjelasanJenis}
                  </p>

                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {liveAnalysis.analisisJenis.ciriKhas.map((ciri, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>{ciri}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 2. Daftar Motif Thompson */}
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <Compass className="w-4 h-4 text-cyan-600" />
                      Motif Dominan (Stith Thompson Motif-Index of Folk-Literature):
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {liveAnalysis.analisisMotif.daftarMotifThompson.length} Motif Teridentifikasi
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {liveAnalysis.analisisMotif.daftarMotifThompson.map((motif, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                            {motif.kodeThompson}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">{motif.kategoriMotif}</span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">{motif.namaMotif}</h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{motif.uraianTeks}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Fungsi Sosial Bascom & Amanat Moral */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-500" />
                      Fungsi Folklor (William R. Bascom):
                    </span>
                    <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pl-1">
                      {liveAnalysis.analisisMotif.fungsiSosialBascom.map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-emerald-500" />
                      Amanat Moral & Nilai Luhur Budaya:
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                      "{liveAnalysis.analisisMotif.amanatMoral}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          </fieldset>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span>Kuesioner 28 Butir Baku Sastra Lisan</span>
              <span>•</span>
              <span>Analisis: <strong className="text-indigo-600 dark:text-indigo-400">{liveAnalysis.analisisJenis.jenisUtama}</strong></span>
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
                  <span>Simpan Kuesioner Sastra Lisan</span>
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
