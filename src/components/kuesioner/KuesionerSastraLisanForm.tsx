import React, { useState, useMemo } from 'react';
import { 
  Scroll, 
  Save, 
  Sparkles, 
  User, 
  MapPin, 
  Music, 
  BookOpen, 
  Eye, 
  FileText, 
  CheckCircle2, 
  Award, 
  RefreshCw,
  Tag,
  HelpCircle,
  Users,
  Compass,
  Layers,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  Plus
} from 'lucide-react';
import { SastraLisanRecord } from '../../types/sastraLisan';
import { analyzeMotifDanJenis } from '../../utils/sastraLisanAnalysis';
import { 
  saveSastraLisanRecord, 
  loadSastraLisanRecords,
  exportSastraLisanToCSV 
} from '../../utils/sastraLisanStorage';
import { INITIAL_SASTRA_LISAN_RECORDS } from '../../data/sastraLisanSampleData';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface KuesionerSastraLisanFormProps {
  initialData?: SastraLisanRecord | null;
  onSave?: (saved: SastraLisanRecord) => void;
  defaultDesa?: string;
  defaultBahasa?: string;
  defaultKecamatan?: string;
  defaultKabupaten?: string;
  defaultProvinsi?: string;
  canEdit?: boolean;
}

export const KuesionerSastraLisanForm: React.FC<KuesionerSastraLisanFormProps> = ({
  initialData,
  onSave,
  defaultDesa = '',
  defaultBahasa = 'Bahasa Sunda',
  defaultKecamatan = '',
  defaultKabupaten = '',
  defaultProvinsi = 'Jawa Barat',
  canEdit = true
}) => {
  const isOnline = useOnlineStatus();
  const [activeSectionTab, setActiveSectionTab] = useState<'A' | 'B_Bentuk' | 'B_FisikIsi' | 'B_Konteks' | 'B_Dokumentasi' | 'Analisis'>('A');

  // Load all existing records
  const [allRecords, setAllRecords] = useState<SastraLisanRecord[]>(() => loadSastraLisanRecords());

  // Base record to initialize
  const baseRecord = useMemo(() => {
    if (initialData) return initialData;
    const existing = loadSastraLisanRecords();
    if (existing.length > 0) return existing[0];
    return INITIAL_SASTRA_LISAN_RECORDS[0];
  }, [initialData]);

  const [currentRecordId, setCurrentRecordId] = useState<string>(baseRecord?.id || `sastra_${Date.now()}`);

  // A. DATA NARASUMBER (1 - 11)
  const [narasumberNama, setNarasumberNama] = useState(baseRecord?.narasumber?.namaLengkap || 'Ki Sadeli Wiraatmaja');
  const [komunitasStatus, setKomunitasStatus] = useState<'Ada' | 'Tidak ada'>(baseRecord?.narasumber?.komunitas?.status || 'Ada');
  const [komunitasNama, setKomunitasNama] = useState(baseRecord?.narasumber?.komunitas?.namaKomunitas || 'Paguyuban Tradisi Lisan Sunda');
  const [komunitasTanggal, setKomunitasTanggal] = useState(baseRecord?.narasumber?.komunitas?.tanggalPendirian || '1998-05-14');
  const [komunitasPendiri, setKomunitasPendiri] = useState(baseRecord?.narasumber?.komunitas?.namaPendiri || 'Tokoh Adat Setempat');
  const [komunitasAlamat, setKomunitasAlamat] = useState(baseRecord?.narasumber?.komunitas?.alamatSekretariat || 'Balai Adat Desa');
  const [tempatTanggalLahir, setTempatTanggalLahir] = useState(baseRecord?.narasumber?.tempatLahir || 'Desa Pengamatan');
  const [narasumberUsia, setNarasumberUsia] = useState<string | number>(baseRecord?.narasumber?.usia || 68);
  const [narasumberGender, setNarasumberGender] = useState<'Laki-laki' | 'Perempuan'>(baseRecord?.narasumber?.jenisKelamin || 'Laki-laki');
  const [kategoriNarasumber, setKategoriNarasumber] = useState<'Juru cerita/pendukung aktif' | 'Bukan juru cerita/pendukung pasif'>(
    baseRecord?.narasumber?.kategoriNarasumber || 'Juru cerita/pendukung aktif'
  );
  const [narasumberPekerjaan, setNarasumberPekerjaan] = useState(baseRecord?.narasumber?.pekerjaan || 'Petani & Juru Kisah Tradisi');
  const [keahlianSelain, setKeahlianSelain] = useState(baseRecord?.narasumber?.keahlianSelainPekerjaan || 'Memainkan Kacapi Buhun');
  const [sukuBangsa, setSukuBangsa] = useState(baseRecord?.narasumber?.sukuBangsa || 'Sunda');
  const [daerahAsalNarasumber, setDaerahAsalNarasumber] = useState(baseRecord?.narasumber?.daerahAsal || 'Jawa Barat');
  const [bahasaDikuasai, setBahasaDikuasai] = useState(baseRecord?.narasumber?.bahasaDikuasai || 'Bahasa Sunda, Bahasa Indonesia');
  const [kondisiFisik, setKondisiFisik] = useState(baseRecord?.narasumber?.kondisiFisikInforman || 'Sehat, daya ingat tuturan sangat baik');

  // B. DATA SASTRA LISAN (1 - 2)
  const [namaSastraLisan, setNamaSastraLisan] = useState(baseRecord?.namaSastraLisan || 'Sasakala Batu Karang Meja jeung Putri Candra Wulan');
  // Lokasi
  const [provinsi, setProvinsi] = useState(baseRecord?.lokasi?.provinsi || defaultProvinsi);
  const [kabupatenKota, setKabupatenKota] = useState(baseRecord?.lokasi?.kabupatenKota || defaultKabupaten);
  const [kecamatan, setKecamatan] = useState(baseRecord?.lokasi?.kecamatan || defaultKecamatan);
  const [desaKelurahan, setDesaKelurahan] = useState(baseRecord?.lokasi?.desaKelurahan || defaultDesa);
  const [jalan, setJalan] = useState(baseRecord?.lokasi?.jalan || 'Jalan Situs Keramat No. 12');
  const [kodePos, setKodePos] = useState(baseRecord?.lokasi?.kodePos || '45553');
  const [titikKoordinat, setTitikKoordinat] = useState(baseRecord?.lokasi?.titikKoordinat || '-6.9745, 108.4872');

  // Bentuk (3 - 6)
  const [kategoriPenutur, setKategoriPenutur] = useState<'Sendiri' | 'Duet' | 'Kelompok'>(baseRecord?.kategoriPenutur || 'Sendiri');
  const [bentukTuturan, setBentukTuturan] = useState<'Diceritakan' | 'Dinyanyikan' | 'Dibacakan' | 'dialog'>(baseRecord?.bentukTuturan || 'Diceritakan');
  const [bahasaDigunakan, setBahasaDigunakan] = useState(baseRecord?.bahasaDigunakan || defaultBahasa || 'Bahasa Sunda');
  const [iringanMusik, setIringanMusik] = useState(baseRecord?.iringanMusik || 'Kacapi Suling laras Salendro');

  // Deskripsi Fisik Pertunjukan (7 - 11)
  const [tempatPertunjukan, setTempatPertunjukan] = useState(baseRecord?.tempatPertunjukan || 'Halaman Bale Desa / Rumah Adat');
  const [dekorasi, setDekorasi] = useState(baseRecord?.dekorasi || 'Tikar pandan tradisional, lampu senter, parukuyan kemenyan');
  const [kostum, setKostum] = useState(baseRecord?.kostum || 'Baju pangsi hitam, iket kepala Sunda');
  const [formasi, setFormasi] = useState(baseRecord?.formasi || 'Penutur duduk bersila menghadap penonton yang melingkar');
  const [posisiPenonton, setPosisiPenonton] = useState(baseRecord?.posisiPenonton || 'Duduk melingkar rapat mengitari narasumber');
  const [interaksiPenuturPenonton, setInteraksiPenuturPenonton] = useState(baseRecord?.interaksiPenuturDanPenonton || 'Penonton menanggapi dengan sahutan takzim');
  const [waktuPertunjukan, setWaktuPertunjukan] = useState(baseRecord?.waktuPertunjukan || 'Malam hari selepas Isya (20.00 - 23.30 WIB)');
  const [syaratPertunjukan, setSyaratPertunjukan] = useState(baseRecord?.syaratPertunjukan || 'Wewangian menyan madu, seupaheun, dan larangan tutur kata kasar');

  // Isi (12 - 13)
  const [deskripsiSingkat, setDeskripsiSingkat] = useState(baseRecord?.deskripsiSingkat || 'Cerita rakyat tentang putri cantik dari kahyangan yang bertapa di atas batu karang berbentuk meja. Karena kesombongan pangeran yang melanggar pantangan, sang pangeran membatu.');
  const [kutipanTuturan, setKutipanTuturan] = useState(baseRecord?.kutipanTuturan || '"Sing saha anu wani ngarempak ieu larangan karuhun, tangtu pinanggih jeung mamala, bumi moal narima, langit moal mayungan..."');

  // Konteks (14 - 24)
  const [daerahAsalSastra, setDaerahAsalSastra] = useState(baseRecord?.daerahAsalSastra || 'Wilayah Pegunungan Priangan');
  const [persebaran, setPersebaran] = useState(baseRecord?.persebaran || 'Tersebar di desa-desa lereng bukit sekitar situs batu karang');
  const [sukuPemilik, setSukuPemilik] = useState(baseRecord?.sukuPemilik || 'Sunda');
  const [gambaranTopografis, setGambaranTopografis] = useState(baseRecord?.gambaranTopografis || 'Daerah perbukitan batu kapur dengan mata air purba');
  const [khalayakJumlah, setKhalayakJumlah] = useState(baseRecord?.khalayakPenonton?.jumlah || '50-80 orang');
  const [khalayakUsia, setKhalayakUsia] = useState(baseRecord?.khalayakPenonton?.usia || 'Semua umur (remaja, dewasa, dan sesepuh desa)');
  const [khalayakGender, setKhalayakGender] = useState(baseRecord?.khalayakPenonton?.jenisKelamin || 'Campuran pria dan wanita');
  const [tujuanPertunjukan, setTujuanPertunjukan] = useState(baseRecord?.tujuanPertunjukan || 'Peringatan moral adat, tolak bala, dan peneguhan batas wilayah suci');
  const [suasanaPertunjukan, setSuasanaPertunjukan] = useState(baseRecord?.suasanaPertunjukan || 'Khidmat, hening, dan sarat suasana sakral spiritual');
  const [frekuensiPertunjukan, setFrekuensiPertunjukan] = useState(baseRecord?.frekuensiPertunjukanSaatIni || 'Setahun sekali saat peringatan Seren Taun / Bersih Desa');
  const [komunitasMenghidupi, setKomunitasMenghidupi] = useState(baseRecord?.komunitasMenghidupi || 'Paguyuban Warga Adat');
  const [sistemPewarisan, setSistemPewarisan] = useState(baseRecord?.sistemPewarisan || 'Lisan turun-temurun dari kakek ke cucu pilihan');
  const [infrastruktur, setInfrastruktur] = useState(baseRecord?.infrastruktur || 'Bale warga desa berlantai kayu dan penerangan obor');

  // Pengambil Data & Dokumentasi (25 - 28)
  const [pengambilNama, setPengambilNama] = useState(baseRecord?.pengambilData?.nama || 'Tim Peneliti Pemetaan Sastra');
  const [pengambilSatker, setPengambilSatker] = useState(baseRecord?.pengambilData?.satuanKerja || 'Balai Bahasa Provinsi / Badan Bahasa');
  const [pengambilTanggal, setPengambilTanggal] = useState(baseRecord?.pengambilData?.tanggalPengambilanData || new Date().toISOString().slice(0, 10));
  const [bentukDokumentasi, setBentukDokumentasi] = useState(baseRecord?.hasilDokumentasi?.bentukDokumentasi || 'Rekaman Audio Digital (.WAV) & Video (.MP4)');
  const [tautanDokumentasi, setTautanDokumentasi] = useState(baseRecord?.hasilDokumentasi?.tautanHasilDokumentasi || 'https://drive.google.com/folder/sastra-lisan-cikaso');
  const [namaPerekam, setNamaPerekam] = useState(baseRecord?.hasilDokumentasi?.namaPerekam || 'Drs. Hendra Gunawan, M.Hum.');
  const [instansiPerekam, setInstansiPerekam] = useState(baseRecord?.hasilDokumentasi?.asalInstansi || 'Pusat Riset Preservasi Tradisi Lisan');
  const [transkripsiTeks, setTranskripsiTeks] = useState(baseRecord?.transkripsi?.lampiranHasilTranskripsi || 'Transkripsi lengkap tuturan Ki Sadeli mencakup 12 bait rajah pembuka dan narasi sasakala.');
  const [namaPentranskripsi, setNamaPentranskripsi] = useState(baseRecord?.transkripsi?.namaPentranskripsi || 'Asep Saepudin, S.S.');
  const [instansiTranskripsi, setInstansiTranskripsi] = useState(baseRecord?.transkripsi?.asalInstansi || 'Laboratorium Filologi & Tradisi Lisan');
  const [terjemahanTeks, setTerjemahanTeks] = useState(baseRecord?.terjemahan?.lampiranHasilTerjemahan || 'Barang siapa yang berani melanggar larangan leluhur ini, niscaya akan menemui malapetaka...');
  const [namaPenerjemah, setNamaPenerjemah] = useState(baseRecord?.terjemahan?.namaPenerjemah || 'Dra. Hj. Nunung Maryati');
  const [instansiTerjemahan, setInstansiTerjemahan] = useState(baseRecord?.terjemahan?.asalInstansi || 'Kelompok Kepakaran Bahasa & Sastra');

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Real-time Automated Motif & Genre Analysis
  const liveAnalysis = useMemo(() => {
    return analyzeMotifDanJenis({
      namaSastra: namaSastraLisan,
      deskripsi: deskripsiSingkat,
      kutipan: kutipanTuturan,
      bentukTuturan,
      iringanMusik,
      syarat: syaratPertunjukan,
      tujuan: tujuanPertunjukan,
      suasanaPertunjukan,
      tempatPertunjukan,
      waktuPertunjukan,
      kategoriPenutur,
      sukuPemilik,
      bahasaDigunakan,
      transkripsi: transkripsiTeks,
      terjemahan: terjemahanTeks
    });
  }, [
    namaSastraLisan, 
    deskripsiSingkat, 
    kutipanTuturan, 
    bentukTuturan, 
    iringanMusik, 
    syaratPertunjukan, 
    tujuanPertunjukan,
    suasanaPertunjukan,
    tempatPertunjukan,
    waktuPertunjukan,
    kategoriPenutur,
    sukuPemilik,
    bahasaDigunakan,
    transkripsiTeks,
    terjemahanTeks
  ]);

  const populateFromRecord = (rec: SastraLisanRecord) => {
    setCurrentRecordId(rec.id);
    setNarasumberNama(rec.narasumber?.namaLengkap || '');
    setKomunitasStatus(rec.narasumber?.komunitas?.status || 'Tidak ada');
    setKomunitasNama(rec.narasumber?.komunitas?.namaKomunitas || '');
    setKomunitasTanggal(rec.narasumber?.komunitas?.tanggalPendirian || '');
    setKomunitasPendiri(rec.narasumber?.komunitas?.namaPendiri || '');
    setKomunitasAlamat(rec.narasumber?.komunitas?.alamatSekretariat || '');
    setTempatTanggalLahir(rec.narasumber?.tempatLahir || '');
    setNarasumberUsia(rec.narasumber?.usia || '');
    setNarasumberGender(rec.narasumber?.jenisKelamin || 'Laki-laki');
    setKategoriNarasumber(rec.narasumber?.kategoriNarasumber || 'Juru cerita/pendukung aktif');
    setNarasumberPekerjaan(rec.narasumber?.pekerjaan || '');
    setKeahlianSelain(rec.narasumber?.keahlianSelainPekerjaan || '');
    setSukuBangsa(rec.narasumber?.sukuBangsa || '');
    setDaerahAsalNarasumber(rec.narasumber?.daerahAsal || '');
    setBahasaDikuasai(rec.narasumber?.bahasaDikuasai || '');
    setKondisiFisik(rec.narasumber?.kondisiFisikInforman || '');

    setNamaSastraLisan(rec.namaSastraLisan || '');
    setProvinsi(rec.lokasi?.provinsi || defaultProvinsi);
    setKabupatenKota(rec.lokasi?.kabupatenKota || defaultKabupaten);
    setKecamatan(rec.lokasi?.kecamatan || defaultKecamatan);
    setDesaKelurahan(rec.lokasi?.desaKelurahan || defaultDesa);
    setJalan(rec.lokasi?.jalan || '');
    setKodePos(rec.lokasi?.kodePos || '');
    setTitikKoordinat(rec.lokasi?.titikKoordinat || '');

    setKategoriPenutur(rec.kategoriPenutur || 'Sendiri');
    setBentukTuturan(rec.bentukTuturan || 'Diceritakan');
    setBahasaDigunakan(rec.bahasaDigunakan || defaultBahasa);
    setIringanMusik(rec.iringanMusik || '');

    setTempatPertunjukan(rec.tempatPertunjukan || '');
    setDekorasi(rec.dekorasi || '');
    setKostum(rec.kostum || '');
    setFormasi(rec.formasi || '');
    setPosisiPenonton(rec.posisiPenonton || '');
    setInteraksiPenuturPenonton(rec.interaksiPenuturDanPenonton || '');
    setWaktuPertunjukan(rec.waktuPertunjukan || '');
    setSyaratPertunjukan(rec.syaratPertunjukan || '');

    setDeskripsiSingkat(rec.deskripsiSingkat || '');
    setKutipanTuturan(rec.kutipanTuturan || '');

    setDaerahAsalSastra(rec.daerahAsalSastra || '');
    setPersebaran(rec.persebaran || '');
    setSukuPemilik(rec.sukuPemilik || '');
    setGambaranTopografis(rec.gambaranTopografis || '');
    setKhalayakJumlah(rec.khalayakPenonton?.jumlah || '');
    setKhalayakUsia(rec.khalayakPenonton?.usia || '');
    setKhalayakGender(rec.khalayakPenonton?.jenisKelamin || '');
    setTujuanPertunjukan(rec.tujuanPertunjukan || '');
    setSuasanaPertunjukan(rec.suasanaPertunjukan || '');
    setFrekuensiPertunjukan(rec.frekuensiPertunjukanSaatIni || '');
    setKomunitasMenghidupi(rec.komunitasMenghidupi || '');
    setSistemPewarisan(rec.sistemPewarisan || '');
    setInfrastruktur(rec.infrastruktur || '');

    setPengambilNama(rec.pengambilData?.nama || '');
    setPengambilSatker(rec.pengambilData?.satuanKerja || '');
    setPengambilTanggal(rec.pengambilData?.tanggalPengambilanData || new Date().toISOString().slice(0, 10));
    setBentukDokumentasi(rec.hasilDokumentasi?.bentukDokumentasi || '');
    setTautanDokumentasi(rec.hasilDokumentasi?.tautanHasilDokumentasi || '');
    setNamaPerekam(rec.hasilDokumentasi?.namaPerekam || '');
    setInstansiPerekam(rec.hasilDokumentasi?.asalInstansi || '');
    setTranskripsiTeks(rec.transkripsi?.lampiranHasilTranskripsi || '');
    setNamaPentranskripsi(rec.transkripsi?.namaPentranskripsi || '');
    setInstansiTranskripsi(rec.transkripsi?.asalInstansi || '');
    setTerjemahanTeks(rec.terjemahan?.lampiranHasilTerjemahan || '');
    setNamaPenerjemah(rec.terjemahan?.namaPenerjemah || '');
    setInstansiTerjemahan(rec.terjemahan?.asalInstansi || '');
  };

  const handleSelectRecord = (id: string) => {
    if (id === 'new') {
      handleCreateNewRecord();
      return;
    }
    const found = allRecords.find(r => r.id === id);
    if (found) {
      populateFromRecord(found);
      setSaveSuccessMsg(`Membuka kuesioner sastra lisan: "${found.namaSastraLisan}"`);
      setTimeout(() => setSaveSuccessMsg(null), 2500);
    }
  };

  const handleCreateNewRecord = () => {
    const newId = `sastra_${Date.now()}`;
    setCurrentRecordId(newId);
    setNamaSastraLisan('');
    setNarasumberNama('');
    setKomunitasStatus('Tidak ada');
    setKomunitasNama('');
    setKomunitasTanggal('');
    setKomunitasPendiri('');
    setKomunitasAlamat('');
    setTempatTanggalLahir('');
    setNarasumberUsia('');
    setNarasumberGender('Laki-laki');
    setKategoriNarasumber('Juru cerita/pendukung aktif');
    setNarasumberPekerjaan('');
    setKeahlianSelain('');
    setSukuBangsa('');
    setDaerahAsalNarasumber('');
    setBahasaDikuasai('');
    setKondisiFisik('');
    setProvinsi(defaultProvinsi);
    setKabupatenKota(defaultKabupaten);
    setKecamatan(defaultKecamatan);
    setDesaKelurahan(defaultDesa);
    setJalan('');
    setKodePos('');
    setTitikKoordinat('');
    setKategoriPenutur('Sendiri');
    setBentukTuturan('Diceritakan');
    setBahasaDigunakan(defaultBahasa);
    setIringanMusik('');
    setTempatPertunjukan('');
    setDekorasi('');
    setKostum('');
    setFormasi('');
    setPosisiPenonton('');
    setInteraksiPenuturPenonton('');
    setWaktuPertunjukan('');
    setSyaratPertunjukan('');
    setDeskripsiSingkat('');
    setKutipanTuturan('');
    setDaerahAsalSastra('');
    setPersebaran('');
    setSukuPemilik('');
    setGambaranTopografis('');
    setKhalayakJumlah('');
    setKhalayakUsia('');
    setKhalayakGender('');
    setTujuanPertunjukan('');
    setSuasanaPertunjukan('');
    setFrekuensiPertunjukan('');
    setKomunitasMenghidupi('');
    setSistemPewarisan('');
    setInfrastruktur('');
    setPengambilNama('Tim Peneliti Sastra Lisan');
    setPengambilSatker('Balai Bahasa Provinsi / Badan Bahasa');
    setPengambilTanggal(new Date().toISOString().slice(0, 10));
    setBentukDokumentasi('Audio Digital & Video');
    setTautanDokumentasi('');
    setNamaPerekam('');
    setInstansiPerekam('');
    setTranskripsiTeks('');
    setNamaPentranskripsi('');
    setInstansiTranskripsi('');
    setTerjemahanTeks('');
    setNamaPenerjemah('');
    setInstansiTerjemahan('');
    setActiveSectionTab('A');
    setSaveSuccessMsg('Formulir kuesioner sastra lisan baru telah disiapkan.');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleCopyQuote = () => {
    if (!kutipanTuturan) return;
    navigator.clipboard.writeText(kutipanTuturan);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleLoadSampleRecord = (idx = 0) => {
    if (!canEdit) return;
    const sample = INITIAL_SASTRA_LISAN_RECORDS[idx] || INITIAL_SASTRA_LISAN_RECORDS[0];
    populateFromRecord(sample);
    setSaveSuccessMsg(`Berhasil memuat sampel sastra lisan: "${sample.namaSastraLisan}"`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleSave = () => {
    const record: SastraLisanRecord = {
      id: currentRecordId || baseRecord?.id || `sastra_${Date.now()}`,
      namaSastraLisan: namaSastraLisan.trim() || 'Sastra Lisan Tanpa Judul',
      lokasi: {
        provinsi: provinsi.trim() || defaultProvinsi,
        kabupatenKota: kabupatenKota.trim() || defaultKabupaten,
        kecamatan: kecamatan.trim() || defaultKecamatan,
        desaKelurahan: desaKelurahan.trim() || defaultDesa,
        jalan: jalan.trim() || undefined,
        kodePos: kodePos.trim() || undefined,
        titikKoordinat: titikKoordinat.trim() || undefined
      },
      narasumber: {
        namaLengkap: narasumberNama.trim() || 'Narasumber Anonim',
        komunitas: {
          status: komunitasStatus,
          namaKomunitas: komunitasStatus === 'Ada' ? komunitasNama.trim() : undefined,
          tanggalPendirian: komunitasStatus === 'Ada' ? komunitasTanggal.trim() : undefined,
          namaPendiri: komunitasStatus === 'Ada' ? komunitasPendiri.trim() : undefined,
          alamatSekretariat: komunitasStatus === 'Ada' ? komunitasAlamat.trim() : undefined
        },
        tempatLahir: tempatTanggalLahir.trim() || undefined,
        usia: narasumberUsia ? Number(narasumberUsia) : undefined,
        jenisKelamin: narasumberGender,
        kategoriNarasumber,
        pekerjaan: narasumberPekerjaan.trim() || undefined,
        keahlianSelainPekerjaan: keahlianSelain.trim() || undefined,
        sukuBangsa: sukuBangsa.trim() || undefined,
        daerahAsal: daerahAsalNarasumber.trim() || undefined,
        bahasaDikuasai: bahasaDikuasai.trim() || undefined,
        kondisiFisikInforman: kondisiFisik.trim() || undefined
      },
      kategoriPenutur,
      bentukTuturan,
      bahasaDigunakan: bahasaDigunakan.trim() || defaultBahasa,
      iringanMusik: iringanMusik.trim(),
      tempatPertunjukan: tempatPertunjukan.trim(),
      dekorasi: dekorasi.trim() || undefined,
      kostum: kostum.trim() || undefined,
      formasi: formasi.trim() || undefined,
      posisiPenonton: posisiPenonton.trim() || undefined,
      interaksiPenuturDanPenonton: interaksiPenuturPenonton.trim() || undefined,
      waktuPertunjukan: waktuPertunjukan.trim() || undefined,
      syaratPertunjukan: syaratPertunjukan.trim() || undefined,
      deskripsiSingkat: deskripsiSingkat.trim(),
      kutipanTuturan: kutipanTuturan.trim(),
      daerahAsalSastra: daerahAsalSastra.trim(),
      persebaran: persebaran.trim() || undefined,
      sukuPemilik: sukuPemilik.trim(),
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
        nama: pengambilNama.trim(),
        satuanKerja: pengambilSatker.trim() || undefined,
        tanggalPengambilanData: pengambilTanggal
      },
      hasilDokumentasi: {
        bentukDokumentasi: bentukDokumentasi.trim(),
        tautanHasilDokumentasi: tautanDokumentasi.trim() || undefined,
        namaPerekam: namaPerekam.trim() || undefined,
        asalInstansi: instansiPerekam.trim() || undefined
      },
      transkripsi: {
        lampiranHasilTranskripsi: transkripsiTeks.trim(),
        namaPentranskripsi: namaPentranskripsi.trim() || undefined,
        asalInstansi: instansiTranskripsi.trim() || undefined
      },
      terjemahan: {
        lampiranHasilTerjemahan: terjemahanTeks.trim(),
        namaPenerjemah: namaPenerjemah.trim() || undefined,
        asalInstansi: instansiTerjemahan.trim() || undefined
      },
      analisisJenis: liveAnalysis.analisisJenis,
      analisisMotif: liveAnalysis.analisisMotif,
      createdAt: baseRecord?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = saveSastraLisanRecord(record);
    setAllRecords(updated);
    setCurrentRecordId(record.id);
    if (onSave) onSave(record);

    setSaveSuccessMsg(`Data Kuesioner Sastra Lisan "${record.namaSastraLisan}" & analisis motif berhasil disimpan!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Sastra Lisan Record Selector Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 transition-colors">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shrink-0">
            <Scroll className="w-3.5 h-3.5 text-indigo-600" />
            <span>Pilih Karya Sastra Lisan:</span>
          </label>
          <select
            value={currentRecordId}
            onChange={(e) => handleSelectRecord(e.target.value)}
            className="flex-1 min-w-[220px] px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 cursor-pointer"
          >
            {allRecords.map(r => (
              <option key={r.id} value={r.id}>
                {r.namaSastraLisan} - {r.narasumber?.namaLengkap} ({r.analisisJenis?.jenisUtama || 'Sastra Lisan'})
              </option>
            ))}
            <option value="new">+ Tambah Sastra Lisan Baru...</option>
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCreateNewRecord}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-800 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Sastra Lisan Baru</span>
          </button>

          <button
            type="button"
            onClick={() => exportSastraLisanToCSV(allRecords)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
            title="Unduh seluruh basis data sastra lisan ke format CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Notifikasi Simpan */}
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

      {/* Header Panel Kuesioner Sastra Lisan */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
              <Scroll className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                  Formulir Kuesioner Instrumen Pemetaan Sastra Lisan
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                  28 Butir Baku & Motif
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Pengisian lengkap data narasumber adat, lokasi, fisik pertunjukan, transkripsi tuturan, dan analisis otomatis klasifikasi jenis serta indeks motif Stith Thompson.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
            {canEdit && (
              <>
                <button
                  type="button"
                  onClick={() => handleLoadSampleRecord(0)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
                  title="Muat contoh sastra lisan 1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="hidden sm:inline">Contoh 1</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadSampleRecord(1)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
                  title="Muat contoh sastra lisan 2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="hidden sm:inline">Contoh 2</span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Sastra Lisan</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Real-time Analysis Quick Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Klasifikasi Genre/Jenis</span>
            <div className="mt-1">
              <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 block truncate">
                {liveAnalysis.analisisJenis.jenisUtama}
              </span>
              <span className="text-[10px] text-slate-400">Keyakinan {liveAnalysis.analisisJenis.confidenceScore}%</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Motif Utama (Thompson)</span>
            <div className="mt-1">
              <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 block truncate">
                {liveAnalysis.analisisMotif.motifUtama}
              </span>
              <span className="text-[10px] text-slate-400">{liveAnalysis.analisisMotif.daftarMotifThompson.length} Kode Terdeteksi</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Bentuk & Penutur</span>
            <div className="mt-1">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block truncate">
                {bentukTuturan} ({kategoriPenutur})
              </span>
              <span className="text-[10px] text-slate-400">{bahasaDigunakan}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Penyimpanan & Sync</span>
            <div className="mt-1 flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {isOnline ? 'Online (Firebase Sync)' : 'Offline (Tersimpan Lokal)'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Auto-upload cloud aktif</span>
          </div>
        </div>
      </div>

      {/* HASIL ANALISIS SASTRA LISAN PER KATEGORI (Motif, Genre, Fungsi Sosial, Nilai Budaya) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Hasil Analisis Sastra Lisan per Kategori Struktur Narasi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Hasil analisis komparatif folklor: Klasifikasi jenis sastra lisan, indeks motif Stith Thompson, dan 4 fungsi sosial Bascom.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Kategori 1: Klasifikasi Jenis Sastra Lisan */}
          <div className="p-4 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                1. Kategori Jenis / Genre & Sub-Klasifikasi
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200">
                Skor Akurasi {liveAnalysis.analisisJenis.confidenceScore}%
              </span>
            </div>

            <div>
              <span className="text-base font-extrabold text-indigo-950 dark:text-indigo-100">
                {liveAnalysis.analisisJenis.jenisUtama}
              </span>
              <p className="text-xs text-indigo-800 dark:text-indigo-300 font-medium">
                {liveAnalysis.analisisJenis.subJenis}
              </p>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
              {liveAnalysis.analisisJenis.penjelasanJenis}
            </p>

            <div className="space-y-1 pt-1">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Ciri Khas Struktur Tuturan:</span>
              <ul className="space-y-1">
                {liveAnalysis.analisisJenis.ciriKhas.map((ciri, i) => (
                  <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{ciri}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Kategori 2: Indeks Motif Stith Thompson */}
          <div className="p-4 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                2. Kategori Motif Naratif (Stith Thompson Index)
              </span>
              <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-purple-200">
                Thompson Motif Index
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Motif Utama:</span>
              <h4 className="text-sm font-bold text-purple-950 dark:text-purple-100">
                {liveAnalysis.analisisMotif.motifUtama}
              </h4>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Kode & Uraian Motif Terdeteksi:</span>
              <div className="space-y-1.5">
                {liveAnalysis.analisisMotif.daftarMotifThompson.map((motif, i) => (
                  <div key={i} className="p-2 bg-white/80 dark:bg-slate-900/70 rounded-lg border border-purple-100 dark:border-purple-900/40 text-xs">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
                        {motif.kodeThompson}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {motif.kategoriMotif}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                      {motif.namaMotif}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 italic mt-0.5">
                      "{motif.uraianTeks}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Kategori 3: Fungsi Sosial Sastra Lisan (Bascom) */}
          <div className="p-4 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              3. Kategori Fungsi Sosial (William R. Bascom)
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Peran sastra lisan dalam tatanan kebudayaan masyarakat pemilik:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {liveAnalysis.analisisMotif.fungsiSosialBascom.map((fungsi, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/70 border border-blue-100 dark:border-blue-900/30 text-xs flex items-start gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] leading-snug">
                    {fungsi}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Kategori 4: Amanat Moral & Nilai Luhur Budaya */}
          <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              4. Kategori Amanat Moral & Nilai Luhur Budaya
            </span>
            <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/70 border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-[11px] font-bold text-slate-500 block mb-1">Pesan Luhur Karuhun:</span>
              <p className="text-xs text-slate-800 dark:text-slate-200 italic leading-relaxed">
                "{liveAnalysis.analisisMotif.amanatMoral}"
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {liveAnalysis.analisisMotif.nilaiBudaya.map((n, i) => (
                <span key={i} className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200">
                  {n}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TABS ISIAN FORMULIR 28 BUTIR BAKU */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-5">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveSectionTab('A')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSectionTab === 'A' 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            A. Data Narasumber (1-11)
          </button>

          <button
            type="button"
            onClick={() => setActiveSectionTab('B_Bentuk')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSectionTab === 'B_Bentuk' 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            B. Lokasi & Bentuk (1-6)
          </button>

          <button
            type="button"
            onClick={() => setActiveSectionTab('B_FisikIsi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSectionTab === 'B_FisikIsi' 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Fisik & Isi Cerita (7-13)
          </button>

          <button
            type="button"
            onClick={() => setActiveSectionTab('B_Konteks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSectionTab === 'B_Konteks' 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Konteks Budaya (14-24)
          </button>

          <button
            type="button"
            onClick={() => setActiveSectionTab('B_Dokumentasi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSectionTab === 'B_Dokumentasi' 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Dokumentasi & Transkripsi (25-28)
          </button>

          <button
            type="button"
            onClick={() => setActiveSectionTab('Analisis')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSectionTab === 'Analisis' 
                ? 'bg-indigo-600 text-white shadow-xs' 
                : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hasil Analisis Per Kategori (Motif & Jenis)</span>
          </button>
        </div>

        {/* TAB A: DATA NARASUMBER (1 - 11) */}
        {activeSectionTab === 'A' && (
          <div className="space-y-4 animate-in fade-in">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 pb-2 border-b border-slate-100 dark:border-slate-800">
              A. DATA NARASUMBER (Butir 1 - 11)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
              <div className="md:col-span-2">
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  1. Nama Lengkap Narasumber *
                </label>
                <input
                  type="text"
                  value={narasumberNama}
                  onChange={(e) => setNarasumberNama(e.target.value)}
                  disabled={!canEdit}
                  placeholder="Nama lengkap penutur / narasumber"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  2. Keberadaan Komunitas *
                </label>
                <select
                  value={komunitasStatus}
                  onChange={(e) => setKomunitasStatus(e.target.value as any)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Ada">a) Ada Komunitas</option>
                  <option value="Tidak ada">b) Tidak Ada Komunitas</option>
                </select>
              </div>

              {komunitasStatus === 'Ada' && (
                <div className="md:col-span-3 p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Nama Komunitas</label>
                    <input
                      type="text"
                      value={komunitasNama}
                      onChange={(e) => setKomunitasNama(e.target.value)}
                      disabled={!canEdit}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Tanggal Pendirian</label>
                    <input
                      type="date"
                      value={komunitasTanggal}
                      onChange={(e) => setKomunitasTanggal(e.target.value)}
                      disabled={!canEdit}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Nama Pendiri</label>
                    <input
                      type="text"
                      value={komunitasPendiri}
                      onChange={(e) => setKomunitasPendiri(e.target.value)}
                      disabled={!canEdit}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Alamat Sekretariat</label>
                    <input
                      type="text"
                      value={komunitasAlamat}
                      onChange={(e) => setKomunitasAlamat(e.target.value)}
                      disabled={!canEdit}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  3. Tempat, Tgl Lahir & Usia
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempatTanggalLahir}
                    onChange={(e) => setTempatTanggalLahir(e.target.value)}
                    disabled={!canEdit}
                    placeholder="Tempat lahir"
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                  <input
                    type="number"
                    value={narasumberUsia}
                    onChange={(e) => setNarasumberUsia(e.target.value)}
                    disabled={!canEdit}
                    placeholder="Usia"
                    className="w-16 px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  4. Jenis Kelamin *
                </label>
                <select
                  value={narasumberGender}
                  onChange={(e) => setNarasumberGender(e.target.value as any)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Laki-laki">a) Laki-laki</option>
                  <option value="Perempuan">b) Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  5. Kategori Narasumber *
                </label>
                <select
                  value={kategoriNarasumber}
                  onChange={(e) => setKategoriNarasumber(e.target.value as any)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Juru cerita/pendukung aktif">a) Juru cerita / pendukung aktif</option>
                  <option value="Bukan juru cerita/pendukung pasif">b) Bukan juru cerita / pendukung pasif</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  6. Pekerjaan Utama
                </label>
                <input
                  type="text"
                  value={narasumberPekerjaan}
                  onChange={(e) => setNarasumberPekerjaan(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  7. Keahlian Selain Pekerjaan
                </label>
                <input
                  type="text"
                  value={keahlianSelain}
                  onChange={(e) => setKeahlianSelain(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  8. Suku Bangsa
                </label>
                <input
                  type="text"
                  value={sukuBangsa}
                  onChange={(e) => setSukuBangsa(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  9. Daerah Asal Narasumber
                </label>
                <input
                  type="text"
                  value={daerahAsalNarasumber}
                  onChange={(e) => setDaerahAsalNarasumber(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  10. Bahasa yang Dikuasai
                </label>
                <input
                  type="text"
                  value={bahasaDikuasai}
                  onChange={(e) => setBahasaDikuasai(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  11. Kondisi Fisik Informan
                </label>
                <input
                  type="text"
                  value={kondisiFisik}
                  onChange={(e) => setKondisiFisik(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB B: LOKASI & BENTUK (1 - 6) */}
        {activeSectionTab === 'B_Bentuk' && (
          <div className="space-y-4 animate-in fade-in">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 pb-2 border-b border-slate-100 dark:border-slate-800">
              B. DATA SASTRA LISAN: IDENTITAS, LOKASI & BENTUK (Butir 1 - 6)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
              <div className="md:col-span-3">
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  1. Nama Sastra Lisan *
                </label>
                <input
                  type="text"
                  value={namaSastraLisan}
                  onChange={(e) => setNamaSastraLisan(e.target.value)}
                  disabled={!canEdit}
                  placeholder="e.g. Sasakala Batu Karang Meja"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  2. Lokasi: Provinsi
                </label>
                <input
                  type="text"
                  value={provinsi}
                  onChange={(e) => setProvinsi(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Kabupaten / Kota
                </label>
                <input
                  type="text"
                  value={kabupatenKota}
                  onChange={(e) => setKabupatenKota(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Kecamatan & Desa
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={kecamatan}
                    onChange={(e) => setKecamatan(e.target.value)}
                    disabled={!canEdit}
                    placeholder="Kecamatan"
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                  <input
                    type="text"
                    value={desaKelurahan}
                    onChange={(e) => setDesaKelurahan(e.target.value)}
                    disabled={!canEdit}
                    placeholder="Desa"
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Jalan & Kode Pos
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={jalan}
                    onChange={(e) => setJalan(e.target.value)}
                    disabled={!canEdit}
                    placeholder="Jalan"
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                  <input
                    type="text"
                    value={kodePos}
                    onChange={(e) => setKodePos(e.target.value)}
                    disabled={!canEdit}
                    placeholder="Kode Pos"
                    className="w-20 px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Titik Koordinat (Lintang, Bujur)
                </label>
                <input
                  type="text"
                  value={titikKoordinat}
                  onChange={(e) => setTitikKoordinat(e.target.value)}
                  disabled={!canEdit}
                  placeholder="-6.9745, 108.4872"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  3. Kategori Penutur *
                </label>
                <select
                  value={kategoriPenutur}
                  onChange={(e) => setKategoriPenutur(e.target.value as any)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                >
                  <option value="Sendiri">a) Sendiri (Tunggal)</option>
                  <option value="Duet">b) Duet (Dua Orang)</option>
                  <option value="Kelompok">c) Kelompok</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  4. Bentuk Tuturan *
                </label>
                <select
                  value={bentukTuturan}
                  onChange={(e) => setBentukTuturan(e.target.value as any)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-indigo-600 dark:text-indigo-400"
                >
                  <option value="Diceritakan">a) Diceritakan (Tutur Biasa)</option>
                  <option value="Dinyanyikan">b) Dinyanyikan (Tembang / Kawih)</option>
                  <option value="Dibacakan">c) Dibacakan (Naskah / Wawacan)</option>
                  <option value="dialog">d) Dialog (Teater Tutur)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  5. Bahasa Digunakan dalam Sastra Lisan *
                </label>
                <input
                  type="text"
                  value={bahasaDigunakan}
                  onChange={(e) => setBahasaDigunakan(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  6. Iringan Musik yang Digunakan
                </label>
                <input
                  type="text"
                  value={iringanMusik}
                  onChange={(e) => setIringanMusik(e.target.value)}
                  disabled={!canEdit}
                  placeholder="e.g. Kacapi Suling / Tanpa iringan"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB FISIK & ISI (7 - 13) */}
        {activeSectionTab === 'B_FisikIsi' && (
          <div className="space-y-4 animate-in fade-in">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 pb-2 border-b border-slate-100 dark:border-slate-800">
              DESKRIPSI FISIK PERTUNJUKAN & ISI SASTRA LISAN (Butir 7 - 13)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  7. Tempat Pertunjukan
                </label>
                <input
                  type="text"
                  value={tempatPertunjukan}
                  onChange={(e) => setTempatPertunjukan(e.target.value)}
                  disabled={!canEdit}
                  placeholder="Bale warga / Halaman rumah adat"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  8. Dekorasi & 9. Kostum
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={dekorasi}
                    onChange={(e) => setDekorasi(e.target.value)}
                    disabled={!canEdit}
                    placeholder="Dekorasi"
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                  <input
                    type="text"
                    value={kostum}
                    onChange={(e) => setKostum(e.target.value)}
                    disabled={!canEdit}
                    placeholder="Kostum"
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  10. Formasi & 11. Posisi Penonton
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formasi}
                    onChange={(e) => setFormasi(e.target.value)}
                    disabled={!canEdit}
                    placeholder="Formasi penutur"
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                  <input
                    type="text"
                    value={posisiPenonton}
                    onChange={(e) => setPosisiPenonton(e.target.value)}
                    disabled={!canEdit}
                    placeholder="Posisi penonton"
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  11.a Interaksi Penutur & Penonton
                </label>
                <input
                  type="text"
                  value={interaksiPenuturPenonton}
                  onChange={(e) => setInteraksiPenuturPenonton(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  11.b Waktu Pertunjukan
                </label>
                <input
                  type="text"
                  value={waktuPertunjukan}
                  onChange={(e) => setWaktuPertunjukan(e.target.value)}
                  disabled={!canEdit}
                  placeholder="Malam hari / Pasca panen"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  11.c Syarat Pertunjukan (Sesaji / Pantangan)
                </label>
                <input
                  type="text"
                  value={syaratPertunjukan}
                  onChange={(e) => setSyaratPertunjukan(e.target.value)}
                  disabled={!canEdit}
                  placeholder="Wewangian, pantangan bicara kotor"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              {/* 12. Deskripsi Singkat */}
              <div className="md:col-span-3">
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  12. Deskripsi Singkat Isi Sastra Lisan *
                </label>
                <textarea
                  rows={3}
                  value={deskripsiSingkat}
                  onChange={(e) => setDeskripsiSingkat(e.target.value)}
                  disabled={!canEdit}
                  placeholder="Ringkasan alur cerita, tokoh utama, peristiwa sakral/konflik, dan penyelesaian cerita..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              {/* 13. Kutipan Tuturan */}
              <div className="md:col-span-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-600 dark:text-slate-400 font-semibold">
                    13. Kutipan Tuturan Asli Sastra Lisan (Bahasa Daerah) *
                  </label>
                  {kutipanTuturan && (
                    <button
                      type="button"
                      onClick={handleCopyQuote}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'Tersalin' : 'Salin Kutipan'}</span>
                    </button>
                  )}
                </div>
                <textarea
                  rows={3}
                  value={kutipanTuturan}
                  onChange={(e) => setKutipanTuturan(e.target.value)}
                  disabled={!canEdit}
                  placeholder='"Tuliskan kalimat atau bait penting asli tuturan penutur dalam bahasa daerah setempat..."'
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs italic font-serif"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB KONTEKS (14 - 24) */}
        {activeSectionTab === 'B_Konteks' && (
          <div className="space-y-4 animate-in fade-in">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 pb-2 border-b border-slate-100 dark:border-slate-800">
              KONTEKS BUDAYA, PENONTON & PEWARISAN (Butir 14 - 24)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  14. Daerah Asal Sastra Lisan
                </label>
                <input
                  type="text"
                  value={daerahAsalSastra}
                  onChange={(e) => setDaerahAsalSastra(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  15. Persebaran Wilayah
                </label>
                <input
                  type="text"
                  value={persebaran}
                  onChange={(e) => setPersebaran(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  16. Suku Pemilik Sastra Lisan
                </label>
                <input
                  type="text"
                  value={sukuPemilik}
                  onChange={(e) => setSukuPemilik(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  17. Gambaran Topografis Wilayah
                </label>
                <input
                  type="text"
                  value={gambaranTopografis}
                  onChange={(e) => setGambaranTopografis(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  18. Khalayak/Penonton (Jumlah, Usia, Gender)
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={khalayakJumlah}
                    onChange={(e) => setKhalayakJumlah(e.target.value)}
                    disabled={!canEdit}
                    placeholder="Jml penonton"
                    className="flex-1 px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                  <input
                    type="text"
                    value={khalayakUsia}
                    onChange={(e) => setKhalayakUsia(e.target.value)}
                    disabled={!canEdit}
                    placeholder="Rentang usia"
                    className="flex-1 px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  19. Tujuan Pertunjukan
                </label>
                <input
                  type="text"
                  value={tujuanPertunjukan}
                  onChange={(e) => setTujuanPertunjukan(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  20. Suasana Pertunjukan
                </label>
                <input
                  type="text"
                  value={suasanaPertunjukan}
                  onChange={(e) => setSuasanaPertunjukan(e.target.value)}
                  disabled={!canEdit}
                  placeholder="Khidmat / Riang gembira"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  21. Frekuensi Pertunjukan Saat Ini
                </label>
                <input
                  type="text"
                  value={frekuensiPertunjukan}
                  onChange={(e) => setFrekuensiPertunjukan(e.target.value)}
                  disabled={!canEdit}
                  placeholder="Setiap bulan / Setahun sekali"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  22. Komunitas yang Menghidupi
                </label>
                <input
                  type="text"
                  value={komunitasMenghidupi}
                  onChange={(e) => setKomunitasMenghidupi(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  23. Sistem Pewarisan
                </label>
                <input
                  type="text"
                  value={sistemPewarisan}
                  onChange={(e) => setSistemPewarisan(e.target.value)}
                  disabled={!canEdit}
                  placeholder="Pewarisan keluarga / sanggar"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  24. Infrastruktur Pendukung
                </label>
                <input
                  type="text"
                  value={infrastruktur}
                  onChange={(e) => setInfrastruktur(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB DOKUMENTASI (25 - 28) */}
        {activeSectionTab === 'B_Dokumentasi' && (
          <div className="space-y-4 animate-in fade-in">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 pb-2 border-b border-slate-100 dark:border-slate-800">
              PENGAMBIL DATA, DOKUMENTASI, TRANSKRIPSI & TERJEMAHAN (Butir 25 - 28)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  25.a Nama Pengambil Data
                </label>
                <input
                  type="text"
                  value={pengambilNama}
                  onChange={(e) => setPengambilNama(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  25.b Satuan Kerja / Instansi
                </label>
                <input
                  type="text"
                  value={pengambilSatker}
                  onChange={(e) => setPengambilSatker(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  25.c Tanggal Pengambilan Data
                </label>
                <input
                  type="date"
                  value={pengambilTanggal}
                  onChange={(e) => setPengambilTanggal(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  26.a Bentuk Dokumentasi
                </label>
                <input
                  type="text"
                  value={bentukDokumentasi}
                  onChange={(e) => setBentukDokumentasi(e.target.value)}
                  disabled={!canEdit}
                  placeholder="Audio / Video / Foto / Teks"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  26.b Tautan Hasil Dokumentasi
                </label>
                <input
                  type="text"
                  value={tautanDokumentasi}
                  onChange={(e) => setTautanDokumentasi(e.target.value)}
                  disabled={!canEdit}
                  placeholder="URL Google Drive / Cloud Storage"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  27.a Lampiran Hasil Transkripsi (Teks Fonemis / Ortografis)
                </label>
                <textarea
                  rows={3}
                  value={transkripsiTeks}
                  onChange={(e) => setTranskripsiTeks(e.target.value)}
                  disabled={!canEdit}
                  placeholder="Salinan naskah hasil transkripsi lengkap tutur sastra lisan..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  28.a Lampiran Hasil Terjemahan (Bahasa Indonesia)
                </label>
                <textarea
                  rows={3}
                  value={terjemahanTeks}
                  onChange={(e) => setTerjemahanTeks(e.target.value)}
                  disabled={!canEdit}
                  placeholder="Terjemahan bahasa Indonesia dari naskah tuturan sastra lisan..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB ANALISIS PER KATEGORI (Motif, Jenis, Bascom, Nilai Budaya & Transmisi) */}
        {activeSectionTab === 'Analisis' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header Laporan Analisis */}
            <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Laporan Analisis Komprehensif Sastra Lisan
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Hasil sintesis saintifik folklor: Tipologi Genre, Indeks Motif Stith Thompson, Matriks Fungsional Bascom & Nilai Budaya.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-auto">
                <button
                  type="button"
                  onClick={handleCopyQuote}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
                  title="Salin kutipan sastra lisan"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{isCopied ? 'Tersalin' : 'Salin Kutipan'}</span>
                </button>
              </div>
            </div>

            {/* 4 Kolom Kategori Analisis Utama */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Kategori 1: Klasifikasi Jenis / Genre */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200/90 dark:border-indigo-900/60 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-indigo-600" />
                    Kategori 1: Genre & Sub-Klasifikasi Sastra Lisan
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200">
                    Akurasi {liveAnalysis.analisisJenis.confidenceScore}%
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 font-medium">Jenis Utama:</span>
                  <h4 className="text-base font-extrabold text-indigo-950 dark:text-indigo-100">
                    {liveAnalysis.analisisJenis.jenisUtama}
                  </h4>
                  <p className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold mt-0.5">
                    {liveAnalysis.analisisJenis.subJenis}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {liveAnalysis.analisisJenis.penjelasanJenis}
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Karakteristik & Ciri Struktural:
                  </span>
                  <ul className="space-y-1.5">
                    {liveAnalysis.analisisJenis.ciriKhas.map((ciri, i) => (
                      <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{ciri}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Kategori 2: Indeks Motif Stith Thompson */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-purple-200/90 dark:border-purple-900/60 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    Kategori 2: Indeks Motif Stith Thompson (Internasional)
                  </span>
                  <span className="text-[10px] font-mono text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800 font-bold">
                    Thompson Index
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 font-medium">Motif Dominan Naratif:</span>
                  <h4 className="text-sm font-bold text-purple-950 dark:text-purple-100">
                    {liveAnalysis.analisisMotif.motifUtama}
                  </h4>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                    Daftar Kode & Uraian Motif:
                  </span>
                  {liveAnalysis.analisisMotif.daftarMotifThompson.map((motif, i) => (
                    <div key={i} className="p-2.5 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-900/40 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-purple-700 dark:text-purple-300 text-xs">
                          {motif.kodeThompson}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {motif.kategoriMotif}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        {motif.namaMotif}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic mt-1 bg-white/80 dark:bg-slate-900/60 p-1.5 rounded border border-purple-100/60 dark:border-purple-900/30">
                        "{motif.uraianTeks}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kategori 3: 4 Fungsi Sosial Bascom */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-blue-200/90 dark:border-blue-900/60 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-600" />
                    Kategori 3: 4 Fungsi Sosial Bascom (Fungsionalisme)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                    William R. Bascom
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Manifestasi peran sastra lisan dalam memelihara keseimbangan psikososial dan struktur adat masyarakat pemilik:
                </p>

                <div className="space-y-2">
                  {liveAnalysis.analisisMotif.fungsiSosialBascom.map((fungsi, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-xs flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block text-xs">
                          {idx === 0 && 'Cermin Proyeksi Angan-Angan & Katarsis Kolektif'}
                          {idx === 1 && 'Pengesahan & Legitimasi Pranata Kebudayaan'}
                          {idx === 2 && 'Alat Pendidikan Pedagogis & Transmisi Nilai Anak'}
                          {idx === 3 && 'Pemaksa Berlakunya Norma Sosial & Kontrol Moral'}
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                          {fungsi}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kategori 4: Amanat Moral & Nilai Luhur Budaya */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/90 dark:border-emerald-900/60 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    Kategori 4: Amanat Moral & Kearifan Budaya
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                    Nilai Karuhun
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 block mb-1">
                    Pesan Moral Utama:
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 italic leading-relaxed">
                    "{liveAnalysis.analisisMotif.amanatMoral}"
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Nilai Budaya yang Terkandung:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {liveAnalysis.analisisMotif.nilaiBudaya.map((n, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Kategori 5: Vitalitas & Rekomendasi Preservasi */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Rekomendasi Preservasi Tradisi Lisan:
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Berdasarkan tuturan dari informan <strong>{narasumberNama || 'narasumber'}</strong> di Desa <strong>{desaKelurahan || defaultDesa}</strong>, disarankan pengarsipan audiovisual berkualitas tinggi serta integrasi teks hasil transkripsi ke dalam muatan lokal bahasa daerah di sekolah setempat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
