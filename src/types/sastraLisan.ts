export interface KomunitasNarasumber {
  status: 'Ada' | 'Tidak ada';
  namaKomunitas?: string;
  tanggalPendirian?: string;
  namaPendiri?: string;
  alamatSekretariat?: string;
}

export interface NarasumberSastraLisan {
  namaLengkap: string;
  komunitas: KomunitasNarasumber;
  tempatLahir?: string;
  tanggalLahir?: string;
  usia?: string | number;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  kategoriNarasumber: 'Juru cerita/pendukung aktif' | 'Bukan juru cerita/pendukung pasif';
  pekerjaan?: string;
  keahlianSelainPekerjaan?: string;
  sukuBangsa?: string;
  daerahAsal?: string;
  bahasaDikuasai?: string;
  kondisiFisikInforman?: string;
}

export interface LokasiPengambilanData {
  provinsi: string;
  kabupatenKota: string;
  kecamatan: string;
  desaKelurahan: string;
  jalan?: string;
  kodePos?: string;
  titikKoordinat?: string;
}

export interface KhalayakPenonton {
  jumlah?: string;
  usia?: string;
  jenisKelamin?: string;
}

export interface PengambilDataInfo {
  nama: string;
  satuanKerja?: string;
  tanggalPengambilanData: string;
}

export interface HasilDokumentasiInfo {
  bentukDokumentasi: string;
  tautanHasilDokumentasi?: string;
  namaPerekam?: string;
  asalInstansi?: string;
}

export interface TranskripsiInfo {
  lampiranHasilTranskripsi: string;
  namaPentranskripsi?: string;
  asalInstansi?: string;
}

export interface TerjemahanInfo {
  lampiranHasilTerjemahan: string;
  namaPenerjemah?: string;
  asalInstansi?: string;
}

export interface MotifItem {
  kodeThompson: string; // e.g. "A900", "D100", "C300", "B210", "F400"
  namaMotif: string;    // e.g. "Origin of mountains and hills", "Transformation person to stone"
  kategoriMotif: string;// e.g. "Motif A: Mitos & Kosmologi", "Motif D: Keajaiban & Transformasi"
  uraianTeks: string;   // Contextual explanation from narrative
}

export interface AnalisisJenisSastraLisan {
  jenisUtama: 
    | 'Mite / Mitos'
    | 'Legenda'
    | 'Dongeng / Fabel'
    | 'Nyanyian Rakyat / Tembang'
    | 'Puisi Lisan / Mantra'
    | 'Teater / Drama Tutur'
    | 'Ungkapan Tradisional / Pantangan';
  subJenis: string; // e.g. "Legenda Toponimik (Asal Usul Nama Tempat)"
  penjelasanJenis: string;
  confidenceScore: number; // 0 - 100%
  ciriKhas: string[];
}

export interface AnalisisMotifSastraLisan {
  motifUtama: string;
  daftarMotifThompson: MotifItem[];
  fungsiSosialBascom: string[];
  amanatMoral: string;
  nilaiBudaya: string[];
}

export interface SastraLisanRecord {
  id: string;
  surveyId?: string;
  
  // A. DATA NARASUMBER
  narasumber: NarasumberSastraLisan;

  // B. DATA SASTRA LISAN
  namaSastraLisan: string;
  lokasi: LokasiPengambilanData;

  // Bentuk (3 - 6)
  kategoriPenutur: 'Sendiri' | 'Duet' | 'Kelompok';
  bentukTuturan: 'Diceritakan' | 'Dinyanyikan' | 'Dibacakan' | 'dialog';
  bahasaDigunakan: string;
  iringanMusik: string;

  // Deskripsi Fisik Pertunjukan (7 - 11)
  tempatPertunjukan: string;
  dekorasi?: string;
  kostum?: string;
  formasi?: string;
  posisiPenonton?: string;
  interaksiPenuturDanPenonton?: string;
  waktuPertunjukan?: string;
  syaratPertunjukan?: string;

  // Isi (12 - 13)
  deskripsiSingkat: string;
  kutipanTuturan: string;

  // Konteks (14 - 24)
  daerahAsalSastra: string;
  persebaran?: string;
  sukuPemilik: string;
  gambaranTopografis?: string;
  khalayakPenonton: KhalayakPenonton;
  tujuanPertunjukan?: string;
  suasanaPertunjukan?: string;
  frekuensiPertunjukanSaatIni?: string;
  komunitasMenghidupi?: string;
  sistemPewarisan?: string;
  infrastruktur?: string;

  // Data Pengambil & Dokumentasi (25 - 28)
  pengambilData: PengambilDataInfo;
  hasilDokumentasi: HasilDokumentasiInfo;
  transkripsi: TranskripsiInfo;
  terjemahan: TerjemahanInfo;

  // ANALISIS MOTIF DAN JENIS
  analisisJenis: AnalisisJenisSastraLisan;
  analisisMotif: AnalisisMotifSastraLisan;

  createdAt: string;
  updatedAt: string;
}
