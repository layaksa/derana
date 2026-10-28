export interface TitikPengamatan {
  namaDesa: string;
  bahasaDigunakan: string;
  namaLainBahasa: string;
  kecamatan: string;
  kabupatenKota: string;
  pulau: string;
  provinsi: string;
  kodeTitik?: string;
  koordinatLintang?: string | number;
  koordinatBujur?: string | number;
}

export interface SituasiKebahasaanPerbatasan {
  desa: string;
  bahasa: string;
  kecamatan?: string;
}

export interface SituasiKebahasaan {
  timur: SituasiKebahasaanPerbatasan;
  barat: SituasiKebahasaanPerbatasan;
  utara: SituasiKebahasaanPerbatasan;
  selatan: SituasiKebahasaanPerbatasan;
}

export type MorfologiWilayah = 'dataran' | 'pegunungan' | 'perbukitan' | 'pesisir' | 'lainnya';

export interface SituasiGeografis {
  letakPantai: 'pantai' | 'pedalaman' | '';
  jarakDariPantaiKm: string | number;
  morfologi: MorfologiWilayah;
  koordinatLintang: string | number; // Latitude
  koordinatBujur: string | number;   // Longitude
}

export interface PendudukData {
  // Jumlah penduduk total & jenis kelamin
  jumlahPria: string | number;
  jumlahWanita: string | number;
  // Umur penduduk
  umurBawah20: string | number;
  umur20sd40: string | number;
  umurDiatas40: string | number;
  
  // Penutur bahasa
  penuturPria: string | number;
  penuturWanita: string | number;
  penuturUmurBawah20: string | number;
  penuturUmur20sd40: string | number;
  penuturUmurDiatas40: string | number;

  // Etnik
  mayoritasEtnik: string;
  mayoritasEtnikPersen: string | number;
  minoritasEtnik: string;
  minoritasEtnikPersen: string | number;
}

export interface MataPencaharianData {
  bertani: string | number;
  nelayan: string | number;
  berdagang: string | number;
  buruh: string | number;
  pegawai: string | number;
  lainLain: string | number;
  keteranganLain?: string;
}

export interface PendidikanData {
  tidakSekolah: string | number;
  sdSederajat: string | number;
  smpSederajat: string | number;
  smaSederajat: string | number;
  perguruanTinggi: string | number;
  sarjanaAsalDesa: string | number;
}

export interface SaranaPendidikanData {
  sdSederajat: string | number;
  smpSederajat: string | number;
  smaSederajat: string | number;
  perguruanTinggi: string | number;
  kursusKursus: string | number;
  keterangan?: string;
}

export interface AgamaData {
  islam: string | number;
  protestan: string | number;
  kristen: string | number;
  katolik: string | number;
  hindu: string | number;
  buddha: string | number;
  konghucu: string | number;
  lainLain: string | number;
}

export type StatusMobilitas = 'sangat_lancar' | 'lancar' | 'sedang' | 'kurang_lancar' | 'tidak_lancar' | '';

export interface HubunganMobilitasData {
  status: StatusMobilitas;
  catatan: string;
}

export interface AlatTransportasiData {
  bus: boolean;
  miniBus: boolean;
  sepedaMotor: boolean;
  kuda: boolean;
  kapalMotor: boolean;
  kapalLaut: boolean;
  pesawatUdara: boolean;
  lainLain: boolean;
  keteranganLain: string;
}

export type KategoriUsiaDesa = 'di_atas_500' | '200_500' | '50_100' | 'di_bawah_50' | '';

export interface UsiaDesaData {
  kategori: KategoriUsiaDesa;
  estimasiTahun: string;
  catatanSumber: string;
}

export interface SejarahDesaData {
  sejarahSingkat: string;
  asalUsulNama: string;
  tokohPendiri: string;
}

export interface FolkloreData {
  judulFolklore: string;
  kategori: string;
  ringkasanCerita: string;
  tokohUtama: string;
  maknaTradisi: string;
}

export interface BahasaLainDikuasai {
  namaBahasa: string;
  dialek: string;
  penguasaan: 'aktif' | 'pasif';
}

export interface NarasumberData {
  id: number;
  nama: string;
  jenisKelamin: 'pria' | 'wanita' | '';
  usia: string | number;
  tahunKelahiran: string | number;
  tempatLahir: {
    desa: string;
    kecamatan: string;
    kabupatenKota: string;
    provinsi: string;
  };
  pendidikanTertinggi: string;
  pekerjaan: {
    lokasiBekerja: string;
    sebagaiApa: string;
  };
  lamaTinggalTahun: string | number;
  frekuensiMobilitas: 'tidak_pernah' | 'jarang_1_bulan' | 'sangat_jarang_1_tahun' | 'sering' | '';
  frekuensiSeringBerapaKali?: string | number;
  mediaSosial: {
    facebook: boolean;
    tiktok: boolean;
    instagram: boolean;
    twitter: boolean;
    lainLain: string;
  };
  bahasaDigunakan: {
    diRumah: string;
    diMasyarakat: string;
    diTempatKerja: string;
    diPerjalanan: string;
  };
  bahasaLainDikuasai: BahasaLainDikuasai[];
}

export interface KosakataItem {
  id: number;
  glosIndonesia: string;
  bentukLokal: string;
  transkripsiIPA: string;
  catatan?: string;
  audioUrl?: string; // Data URL or audio link
  audioFileName?: string; // e.g. "air_pengamatan1.mp3"
  audioDuration?: string; // e.g. "0:03"
}

export interface KosakataBudayaBidang {
  kode: string; // 'a' to 'r'
  namaBidang: string;
  deskripsi: string;
  daftarKata: KosakataItem[];
}

export interface FrasaItem {
  id: string;
  kategori: string;
  subKategori?: string;
  labelIndonesia: string;
  bentukFrasaLokal: string;
  terjemahanHarfiah: string;
  penjelasanStruktur: string;
}

export interface KalimatItem {
  id: string;
  kalimatIndonesia: string;
  kalimatLokal: string;
  glosPerKata: string;
  analisisStruktur: string; // e.g. S - P - O - K
}

export interface CatatanPengumpulData {
  tanggalWawancara: string;
  tempatLatarWawancara: string;
  waktuDiperlukan: string;
  jumlahOrangHadir: string;
  suasanaWawancara: string;
  namaLengkapPengumpul: string;
  pekerjaanPengumpul: string;
  tandaTanganPengumpul: string;
  catatanPengumpul: string;
  catatanVerifikator?: string;
  statusVerifikasiKualitatif?: 'siap_disetujui' | 'perlu_tinjauan' | 'klarifikasi_lapangan';
  tanggalVerifikasiKualitatif?: string;
}

export interface KosakataLengkapData {
  swadeshList: KosakataItem[];
  kosakataBudaya: KosakataBudayaBidang[];
  strukturFrasa: {
    nominalPosesif: FrasaItem[];
    nominalPartitif: FrasaItem[];
    nominalAsalMaterial: FrasaItem[];
    frasaVerbal: FrasaItem[];
    frasaAdjektival: FrasaItem[];
    frasaAdverbial: FrasaItem[];
  };
  kalimatSederhana: KalimatItem[];
  catatanPengumpul?: CatatanPengumpulData;
  excelImportedList?: KosakataItem[];
}

export interface TitikPembandingDialektometri {
  id: string;
  namaTitik: string;
  desa: string;
  bahasa: string;
  lintang: number;
  bujur: number;
  jumlahBeda: number; // s
  jumlahGlos: number; // n
  persentaseBeda?: number; // d = (s/n) * 100
  statusHubungan?: 
    | 'Tidak Berbeda' 
    | 'Perbedaan Wicara' 
    | 'Perbedaan Subdialek' 
    | 'Perbedaan Dialek' 
    | 'Perbedaan Bahasa'
    | 'Beda Wicara/Subdialek' 
    | 'Beda Dialek' 
    | 'Beda Subbahasa' 
    | 'Beda Bahasa';
}

export interface HasilDialektometriData {
  titikAcuan: string;
  titikPembandingList: TitikPembandingDialektometri[];
  catatanIsoglos: string;
  kesimpulanGeolinguistik: string;
}

export interface InstrumenPemetaanBahasaData {
  titikPengamatan: TitikPengamatan;
  situasiKebahasaan: SituasiKebahasaan;
  situasiGeografis: SituasiGeografis;
  penduduk: PendudukData;
  mataPencaharian: MataPencaharianData;
  pendidikan: PendidikanData;
  saranaPendidikan: SaranaPendidikanData;
  agama: AgamaData;
  hubunganMobilitas: HubunganMobilitasData;
  alatTransportasi: AlatTransportasiData;
  usiaDesa: UsiaDesaData;
  sejarahDesa: SejarahDesaData;
  folklore: FolkloreData;
  narasumberList: NarasumberData[];
  kosakataLengkap: KosakataLengkapData;
  dialektometri: HasilDialektometriData;
}

export interface SectionProgressInfo {
  id: string;
  number: number;
  title: string;
  isFilled: boolean;
  summary: string;
}

export interface SurveyRecord {
  id: string;
  title: string;
  desa: string;
  bahasa: string;
  kecamatan: string;
  kabupatenKota: string;
  provinsi: string;
  createdAt: string;
  updatedAt: string;
  data: InstrumenPemetaanBahasaData;
  progress: number;
  completedSectionsCount: number;
  totalSectionsCount: number;
  // Ownership & Role-Based Access Control
  createdBy?: string;        // user id
  createdByName?: string;    // display name
  createdByEmail?: string;   // email
  createdByRole?: 'admin' | 'verifikator' | 'surveyor' | 'tamu' | 'user';
  isVerified?: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  verificationRole?: 'admin' | 'verifikator';
  // Offline & Cloud Sync Status
  syncStatus?: 'synced' | 'pending' | 'syncing';
  lastSyncedAt?: string;
}

export type DifferenceCategory = 'SAMA' | 'BEDA_FONEM' | 'BEDA_LEKSIKAL' | 'BELUM_DIISI';

export interface LanguageSourceInfo {
  id: string;
  name: string;
  label: string;
  origin: 'survey' | 'preset';
  subTitle?: string;
}

export interface ComparisonWordItem {
  id: number;
  glosIndonesia: string;
  source: 'swadesh' | 'budaya';
  langA: { bentuk: string; ipa: string };
  langB: { bentuk: string; ipa: string };
  langC?: { bentuk: string; ipa: string };
  // Overall category (or pair A-B if 2 languages)
  category: DifferenceCategory;
  // Specific pairwise categorization
  pairAB: { category: DifferenceCategory; note: string };
  pairAC?: { category: DifferenceCategory; note: string };
  pairBC?: { category: DifferenceCategory; note: string };
  phonologicalNote: string;
  isOverridden?: boolean;
}

export interface DialectometryPairStats {
  lang1Name: string;
  lang2Name: string;
  totalCompared: number;
  lexicalCount: number;
  lexicalPercent: number;
  phonemeCount: number;
  phonemePercent: number;
  sameCount: number;
  samePercent: number;
  dialectometryIndex: number; // d = (s / n) * 100
  status: string;
  badgeColor: string;
  deskripsi: string;
}

export interface TriangularMatrixItem {
  pairKey: string;
  lang1: string;
  lang2: string;
  index: number;
  lexicalCount: number;
  phonemeCount: number;
  status: string;
  color: string;
}

