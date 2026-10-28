export interface QuestionOption {
  value: number;
  label: string;
}

export interface VitalitasQuestionItem {
  id: number;
  number: number;
  text: string;
  category: string;
  options: QuestionOption[];
}

export interface KuesionerVitalitasResponse {
  id: string;
  surveyId?: string;
  respondenNama: string;
  respondenUsia?: string | number;
  respondenGender?: 'pria' | 'wanita';
  respondenPekerjaan?: string;
  bahasaDaerah: string;
  desa: string;
  kecamatan?: string;
  kabupatenKota?: string;
  answers: Record<number, number>; // question id (1..95) -> chosen value (1..5)
  totalAnswered: number;
  scoreAvg: number;
  vitalitasStatus: 'Aman' | 'Rentan' | 'Mengalami Kemunduran' | 'Terancam Punah' | 'Kritis';
  statusColor: string;
  catatan?: string;
  createdAt: string;
  updatedAt: string;
}

const OPT_TIDAK_PERNAH_SELALU: QuestionOption[] = [
  { value: 1, label: '1. Tidak pernah' },
  { value: 2, label: '2. Pernah' },
  { value: 3, label: '3. Jarang' },
  { value: 4, label: '4. Sering' },
  { value: 5, label: '5. Selalu' }
];

const OPT_SETUJU: QuestionOption[] = [
  { value: 1, label: '1. Sangat tidak setuju' },
  { value: 2, label: '2. Tidak setuju' },
  { value: 3, label: '3. Kurang setuju' },
  { value: 4, label: '4. Setuju' },
  { value: 5, label: '5. Sangat setuju' }
];

const OPT_SELALU_TIDAK_PERNAH: QuestionOption[] = [
  { value: 1, label: '1. Selalu' },
  { value: 2, label: '2. Sering' },
  { value: 3, label: '3. Jarang' },
  { value: 4, label: '4. Pernah' },
  { value: 5, label: '5. Tidak pernah' }
];

const OPT_TIDAK_ADA_SANGAT_BANYAK: QuestionOption[] = [
  { value: 1, label: '1. Tidak ada' },
  { value: 2, label: '2. Tidak banyak' },
  { value: 3, label: '3. Cukup banyak' },
  { value: 4, label: '4. Banyak' },
  { value: 5, label: '5. Sangat banyak' }
];

const OPT_KEMAMPUAN_BERBICARA: QuestionOption[] = [
  { value: 1, label: '1. Tidak paham dan tidak bisa berbicara dalam bahasa daerah' },
  { value: 2, label: '2. Paham dan tidak bisa berbicara dalam bahasa daerah' },
  { value: 3, label: '3. Paham dan bisa berbicara sedikit dalam bahasa daerah' },
  { value: 4, label: '4. Paham dan bisa berbicara dengan baik dalam bahasa daerah' },
  { value: 5, label: '5. Paham dan bisa berbicara dengan fasih dalam bahasa daerah' }
];

const OPT_PENGHARGAAN: QuestionOption[] = [
  { value: 1, label: '1. Sangat tidak menghargai' },
  { value: 2, label: '2. Tidak menghargai' },
  { value: 3, label: '3. Cukup menghargai' },
  { value: 4, label: '4. Menghargai' },
  { value: 5, label: '5. Sangat menghargai' }
];

export const DAFTAR_PERTANYAAN_VITALITAS: VitalitasQuestionItem[] = [
  {
    id: 1,
    number: 1,
    category: 'Ranah Keluarga & Rumah Tangga',
    text: 'Apakah Anda menggunakan bahasa daerah Anda ketika berbicara dengan orang tua di rumah?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 2,
    number: 2,
    category: 'Interaksi Sosial & Tetangga',
    text: 'Apakah Anda menggunakan bahasa daerah Anda untuk berbicara dengan tetangga yang berusia lebih tua dari Anda?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 3,
    number: 3,
    category: 'Ranah Agama & Tempat Ibadah',
    text: 'Apakah bahasa daerah Anda selalu digunakan dalam kegiatan keagamaan di tempat ibadah?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 4,
    number: 4,
    category: 'Layanan Publik & Kesehatan',
    text: 'Apakah Anda menggunakan bahasa daerah Anda untuk berbicara dengan dokter/bidan/perawat di pusat layanan kesehatan?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 5,
    number: 5,
    category: 'Ranah Pendidikan & Sekolah',
    text: 'Apakah murid menggunakan bahasa daerah Anda ketika berbicara dengan guru di luar kelas pada saat kegiatan belajar mengajar?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 6,
    number: 6,
    category: 'Sikap Bahasa & Identitas',
    text: 'Bahasa daerah Anda dapat menunjukkan jati diri/identitas kedaerahan Anda.',
    options: OPT_SETUJU
  },
  {
    id: 7,
    number: 7,
    category: 'Sikap Bahasa & Identitas',
    text: 'Bahasa daerah Anda merupakan sarana komunikasi antarindividu, keluarga, dan masyarakat di daerah.',
    options: OPT_SETUJU
  },
  {
    id: 8,
    number: 8,
    category: 'Sikap Bahasa & Identitas',
    text: 'Anak-anak perlu menguasai bahasa daerah Anda.',
    options: OPT_SETUJU
  },
  {
    id: 9,
    number: 9,
    category: 'Transmisi Antargenerasi',
    text: 'Sepengetahuan Anda, apakah kelompok usia 60 tahun ke atas mengajarkan bahasa daerah Anda kepada anak-anaknya?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 10,
    number: 10,
    category: 'Transmisi Antargenerasi',
    text: 'Sepengetahuan Anda, apakah penutur berusia di bawah 20 tahun menggunakan bahasa daerah Anda ke penutur usia 60 tahun ke atas?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 11,
    number: 11,
    category: 'Intensitas Penggunaan Pribadi',
    text: 'Bagaimana Anda menggunakan bahasa daerah Anda?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 12,
    number: 12,
    category: 'Ranah Keluarga & Rumah Tangga',
    text: 'Apakah Anda menggunakan bahasa daerah dengan keluarga di rumah?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 13,
    number: 13,
    category: 'Transaksi Ekonomi & Pasar',
    text: 'Apakah Anda menggunakan bahasa daerah Anda dalam kegiatan tawar-menawar/jual-beli di warung?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 14,
    number: 14,
    category: 'Pemerintahan Desa / Kelurahan',
    text: 'Apakah Anda menggunakan bahasa daerah Anda ketika berbicara dengan aparat desa/kelurahan di kantor desa/kelurahan?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 15,
    number: 15,
    category: 'Transmisi Antargenerasi',
    text: 'Sepengetahuan Anda, apakah penutur berusia 60 tahun ke atas menggunakan bahasa daerah Anda ke penutur usia di bawah 20 tahun?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 16,
    number: 16,
    category: 'Transmisi Antargenerasi',
    text: 'Sepengetahuan Anda, apakah penutur berusia di antara 20—39 tahun menggunakan bahasa daerah Anda ke penutur usia di bawah 20 tahun?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 17,
    number: 17,
    category: 'Transmisi Antargenerasi',
    text: 'Sepengetahuan Anda, apakah penutur berusia di bawah 20 tahun menggunakan bahasa daerah Anda ke penutur usia 40–59 tahun?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 18,
    number: 18,
    category: 'Kontak Bahasa & Ekologi Wilayah',
    text: 'Apakah Anda berkomunikasi dengan penutur bahasa lain?',
    options: OPT_SELALU_TIDAK_PERNAH
  },
  {
    id: 19,
    number: 19,
    category: 'Aksesibilitas & Isolasi Geografis',
    text: 'Apakah akses dari daerah lain ke kampung/desa/kelurahan Anda dapat dilalui dengan kendaraan roda empat?',
    options: [
      { value: 1, label: '1. Sangat mudah' },
      { value: 2, label: '2. Mudah' },
      { value: 3, label: '3. Cukup Sulit' },
      { value: 4, label: '4. Sulit' },
      { value: 5, label: '5. Sangat sulit' }
    ]
  },
  {
    id: 20,
    number: 20,
    category: 'Kontak Bahasa & Ekologi Wilayah',
    text: 'Apakah ada penutur bahasa lain yang datang ke kampung/desa Anda?',
    options: [
      { value: 1, label: '1. Sangat banyak' },
      { value: 2, label: '2. Banyak' },
      { value: 3, label: '3. Cukup banyak' },
      { value: 4, label: '4. Tidak banyak' },
      { value: 5, label: '5. Tidak ada' }
    ]
  },
  {
    id: 21,
    number: 21,
    category: 'Ranah Pekerjaan & Kantor',
    text: 'Apakah bahasa daerah Anda digunakan di tempat kerja?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 22,
    number: 22,
    category: 'Ranah Pendidikan & Sekolah',
    text: 'Apakah guru menggunakan bahasa daerah Anda ketika berbicara dengan murid di dalam kelas pada saat kegiatan belajar mengajar?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 23,
    number: 23,
    category: 'Ranah Keluarga & Rumah Tangga',
    text: 'Apakah Anda menggunakan bahasa daerah Anda ketika berbicara dengan anak-anak di rumah?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 24,
    number: 24,
    category: 'Transmisi Antargenerasi',
    text: 'Sepengetahuan Anda, apakah penutur berusia 60 tahun ke atas menggunakan bahasa daerah Anda ke penutur usia 20–39 tahun?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 25,
    number: 25,
    category: 'Kompetensi Bahasa Penutur Lansia',
    text: 'Sepengetahuan Anda, apakah penutur berusia 60 tahun ke atas fasih-paham menggunakan bahasa daerah Anda?',
    options: OPT_KEMAMPUAN_BERBICARA
  },
  {
    id: 26,
    number: 26,
    category: 'Sikap & Preferensi Bahasa',
    text: 'Lebih mudah belajar bahasa daerah Anda daripada belajar bahasa Indonesia.',
    options: OPT_SETUJU
  },
  {
    id: 27,
    number: 27,
    category: 'Sikap & Preferensi Bahasa',
    text: 'Bahasa daerah Anda lebih bermanfaat daripada bahasa Indonesia.',
    options: OPT_SETUJU
  },
  {
    id: 28,
    number: 28,
    category: 'Sikap & Preferensi Bahasa',
    text: 'Ketika berbicara dengan anggota atau kelompok suku Anda, Anda lebih suka menggunakan bahasa daerah Anda.',
    options: OPT_SETUJU
  },
  {
    id: 29,
    number: 29,
    category: 'Interaksi Sosial & Tetangga',
    text: 'Apakah Anda menggunakan bahasa daerah Anda untuk berbicara dengan tetangga yang berusia lebih muda dari Anda?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 30,
    number: 30,
    category: 'Ranah Agama & Spiritualitas',
    text: 'Apakah Anda menggunakan bahasa daerah Anda untuk berdoa?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 31,
    number: 31,
    category: 'Ranah Keluarga & Rumah Tangga',
    text: 'Apakah Anda menggunakan bahasa daerah Anda ketika berbicara dengan kakek nenek di rumah?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 32,
    number: 32,
    category: 'Layanan Pemerintahan Kecamatan',
    text: 'Apakah Anda menggunakan bahasa daerah Anda ketika berbicara dengan aparat kecamatan di kantor kecamatan?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 33,
    number: 33,
    category: 'Sikap Bahasa & Kebanggaan',
    text: 'Anda bangga dapat berbahasa daerah Anda dengan baik.',
    options: OPT_SETUJU
  },
  {
    id: 34,
    number: 34,
    category: 'Sikap Bahasa & Optimisme',
    text: 'Anda yakin bahasa daerah Anda akan dapat berkembang sesuai dengan perkembangan zaman.',
    options: OPT_SETUJU
  },
  {
    id: 35,
    number: 35,
    category: 'Komitmen Pelestarian Keluarga',
    text: 'Bahasa daerah Anda harus digunakan di antara sesama anggota keluarga di rumah.',
    options: OPT_SETUJU
  },
  {
    id: 36,
    number: 36,
    category: 'Komitmen Pelestarian Etnis',
    text: 'Bahasa daerah Anda harus dikuasai dan digunakan oleh setiap anggota kelompok suku Anda.',
    options: OPT_SETUJU
  },
  {
    id: 37,
    number: 37,
    category: 'Ranah Keluarga & Saudara',
    text: 'Apakah Anda menggunakan bahasa daerah Anda ketika berbicara dengan kakak/adik di rumah?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 38,
    number: 38,
    category: 'Ranah Keluarga & Kerabat',
    text: 'Apakah Anda menggunakan bahasa daerah Anda ketika berbicara dengan kerabat (paman, bibi) di rumah?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 39,
    number: 39,
    category: 'Ranah Pendidikan & Sekolah',
    text: 'Apakah sesama murid menggunakan bahasa daerah Anda ketika berbicara di luar kelas pada saat kegiatan belajar mengajar?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 40,
    number: 40,
    category: 'Transmisi Antargenerasi',
    text: 'Sepengetahuan Anda, apakah kelompok usia 40–59 tahun mengajarkan bahasa daerah Anda kepada anak-anaknya?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 41,
    number: 41,
    category: 'Transmisi Antargenerasi',
    text: 'Sepengetahuan Anda, apakah penutur berusia di bawah 20 tahun menggunakan bahasa daerah Anda ke penutur usia 20–39 tahun?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 42,
    number: 42,
    category: 'Kompetensi Bahasa Remaja (<20 Thn)',
    text: 'Sepengetahuan Anda, apakah penutur usia di bawah 20 tahun mampu memahami dan menggunakan bahasa daerah Anda?',
    options: OPT_KEMAMPUAN_BERBICARA
  },
  {
    id: 43,
    number: 43,
    category: 'Kompetensi Bahasa Usia Paruh Baya',
    text: 'Sepengetahuan Anda, apakah penutur usia 40–59 tahun mampu memahami dan menggunakan bahasa daerah Anda?',
    options: OPT_KEMAMPUAN_BERBICARA
  },
  {
    id: 44,
    number: 44,
    category: 'Media Massa & Penyiaran',
    text: 'Apakah bahasa daerah Anda digunakan dalam siaran televisi atau radio?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 45,
    number: 45,
    category: 'Media Cetak & Penerbitan',
    text: 'Apakah bahasa daerah Anda digunakan dalam media cetak (koran, majalah)?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 46,
    number: 46,
    category: 'Adat & Tradisi Kelahiran',
    text: 'Apakah bahasa daerah Anda digunakan dalam upacara kelahiran?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 47,
    number: 47,
    category: 'Adat & Tradisi Kematian',
    text: 'Apakah bahasa daerah Anda digunakan dalam upacara kematian?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 48,
    number: 48,
    category: 'Aksesibilitas & Jarak Kota',
    text: 'Berapa jarak kampung/desa/kelurahan Anda dari kota?',
    options: [
      { value: 1, label: '1. Sangat dekat' },
      { value: 2, label: '2. Dekat' },
      { value: 3, label: '3. Cukup Jauh' },
      { value: 4, label: '4. Jauh' },
      { value: 5, label: '5. Sangat jauh' }
    ]
  },
  {
    id: 49,
    number: 49,
    category: 'Mobilitas & Migrasi Penutur',
    text: 'Apakah Anda bepergian ke daerah yang berbahasa lain dalam waktu setahun terakhir ini?',
    options: OPT_SELALU_TIDAK_PERNAH
  },
  {
    id: 50,
    number: 50,
    category: 'Transmisi Antargenerasi',
    text: 'Sepengetahuan Anda, apakah penutur berusia 60 tahun ke atas menggunakan bahasa daerah Anda ke penutur usia 45–59 tahun?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 51,
    number: 51,
    category: 'Transmisi Antargenerasi',
    text: 'Sepengetahuan Anda, apakah penutur berusia di antara 40—59 tahun menggunakan bahasa daerah Anda ke penutur usia 20–39 tahun?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 52,
    number: 52,
    category: 'Literasi & Minat Baca Lokal',
    text: 'Anda lebih suka membaca buku-buku yang menggunakan bahasa daerah Anda.',
    options: OPT_SETUJU
  },
  {
    id: 53,
    number: 53,
    category: 'Loyalitas & Tegur Sapa Bahasa',
    text: 'Anda lebih memilih menggunakan bahasa daerah ketika menyapa orang walaupun dia tidak tahu bahasa daerah Anda.',
    options: OPT_SETUJU
  },
  {
    id: 54,
    number: 54,
    category: 'Penggunaan Bahasa Lain',
    text: 'Bagaimana Anda menggunakan bahasa daerah lain?',
    options: OPT_SELALU_TIDAK_PERNAH
  },
  {
    id: 55,
    number: 55,
    category: 'Penggunaan Bahasa Indonesia',
    text: 'Bagaimana Anda menggunakan bahasa Indonesia?',
    options: OPT_SELALU_TIDAK_PERNAH
  },
  {
    id: 56,
    number: 56,
    category: 'Penggunaan Bahasa Asing',
    text: 'Bagaimana Anda menggunakan bahasa asing?',
    options: OPT_SELALU_TIDAK_PERNAH
  },
  {
    id: 57,
    number: 57,
    category: 'Ranah Pendidikan & Sekolah',
    text: 'Apakah sesama murid menggunakan bahasa daerah Anda ketika berbicara di dalam kelas pada saat kegiatan belajar mengajar?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 58,
    number: 58,
    category: 'Transmisi Antargenerasi',
    text: 'Sepengetahuan Anda, apakah penutur berusia di antara 40—59 tahun menggunakan bahasa daerah Anda ke penutur usia di bawah 20 tahun?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 59,
    number: 59,
    category: 'Kompetensi Bahasa Usia Produktif (20-39 Thn)',
    text: 'Sepengetahuan Anda, apakah penutur usia 20–39 tahun mampu memahami dan menggunakan bahasa daerah Anda?',
    options: OPT_KEMAMPUAN_BERBICARA
  },
  {
    id: 60,
    number: 60,
    category: 'Penerjemahan & Alih Bahasa',
    text: 'Apakah bahasa daerah Anda digunakan untuk menerjemahkan buku-buku berbahasa Indonesia dan asing (bahasa Inggris, Arab dll.)?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 61,
    number: 61,
    category: 'Internet & Media Sosial',
    text: 'Apakah bahasa daerah Anda digunakan untuk berkomunikasi di internet (media sosial)?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 62,
    number: 62,
    category: 'Konsumsi Media Luar',
    text: 'Apakah Anda menikmati siaran berbahasa lain dalam media massa?',
    options: OPT_SELALU_TIDAK_PERNAH
  },
  {
    id: 63,
    number: 63,
    category: 'Interaksi Sebaya & Tetangga',
    text: 'Apakah Anda menggunakan bahasa daerah Anda untuk berbicara dengan tetangga yang sebaya dari Anda?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 64,
    number: 64,
    category: 'Ranah Pendidikan & Sekolah',
    text: 'Apakah murid menggunakan bahasa daerah Anda ketika berbicara dengan guru di dalam kelas pada saat kegiatan belajar mengajar?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 65,
    number: 65,
    category: 'Ranah Pendidikan & Sekolah',
    text: 'Apakah guru menggunakan bahasa daerah Anda ketika berbicara dengan murid di luar kelas pada saat kegiatan belajar mengajar?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 66,
    number: 66,
    category: 'Transaksi Ekonomi & Pasar',
    text: 'Apakah Anda menggunakan bahasa daerah Anda dalam kegiatan tawar-menawar/jual-beli di pasar?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 67,
    number: 67,
    category: 'Adat & Upacara Pernikahan',
    text: 'Apakah bahasa daerah Anda digunakan dalam upacara pernikahan?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 68,
    number: 68,
    category: 'Adat & Upacara Tradisi',
    text: 'Apakah bahasa daerah Anda digunakan dalam upacara adat lainnya?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 69,
    number: 69,
    category: 'Status & Prestise Bahasa',
    text: 'Bahasa daerah Anda sama penting dengan bahasa Indonesia dalam konteks kedaerahan.',
    options: OPT_SETUJU
  },
  {
    id: 70,
    number: 70,
    category: 'Ekspresifitas & Emosionalitas',
    text: 'Bahasa daerah Anda lebih mudah menggambarkan perasaan dibandingkan dengan bahasa Indonesia.',
    options: OPT_SETUJU
  },
  {
    id: 71,
    number: 71,
    category: 'Martabat & Kebanggaan Bahasa',
    text: 'Bahasa daerah Anda lebih bermartabat dibandingkan dengan bahasa Indonesia.',
    options: OPT_SETUJU
  },
  {
    id: 72,
    number: 72,
    category: 'Kompetensi Multibahasa Daerah',
    text: 'Apakah Anda menguasai bahasa daerah lain?',
    options: [
      { value: 1, label: '1. Paham dan bisa berbicara dengan fasih dalam bahasa daerah lain' },
      { value: 2, label: '2. Paham dan bisa berbicara dengan baik dalam bahasa daerah lain' },
      { value: 3, label: '3. Paham dan bisa berbicara sedikit dalam bahasa daerah lain' },
      { value: 4, label: '4. Paham dan tidak bisa berbicara dalam bahasa daerah lain' },
      { value: 5, label: '5. Tidak paham dan tidak bisa berbicara dalam bahasa daerah lain' }
    ]
  },
  {
    id: 73,
    number: 73,
    category: 'Kompetensi Bahasa Indonesia',
    text: 'Bagaimana penguasaan Anda terhadap bahasa Indonesia?',
    options: [
      { value: 1, label: '1. Paham dan bisa berbicara dengan fasih dalam bahasa Indonesia' },
      { value: 2, label: '2. Paham dan bisa berbicara dengan baik dalam bahasa Indonesia' },
      { value: 3, label: '3. Paham dan bisa berbicara sedikit dalam bahasa Indonesia' },
      { value: 4, label: '4. Paham dan tidak bisa berbicara dalam bahasa Indonesia' },
      { value: 5, label: '5. Tidak paham dan tidak bisa berbicara dalam bahasa Indonesia' }
    ]
  },
  {
    id: 74,
    number: 74,
    category: 'Kompetensi Bahasa Asing',
    text: 'Apakah Anda menguasai bahasa asing?',
    options: [
      { value: 1, label: '1. Paham dan bisa berbicara dengan fasih dalam bahasa asing' },
      { value: 2, label: '2. Paham dan bisa berbicara dengan baik dalam bahasa asing' },
      { value: 3, label: '3. Paham dan bisa berbicara sedikit dalam bahasa asing' },
      { value: 4, label: '4. Paham dan tidak bisa berbicara dalam bahasa asing' },
      { value: 5, label: '5. Tidak paham dan tidak bisa berbicara dalam bahasa asing' }
    ]
  },
  {
    id: 75,
    number: 75,
    category: 'Proporsi Penutur di Desa',
    text: 'Dibanding dengan bahasa daerah Anda, bagaimana perbandingan jumlah penutur bahasa daerah lain di desa ini?',
    options: [
      { value: 1, label: '1. Mayoritas besar penutur bahasa daerah lain' },
      { value: 2, label: '2. Penutur bahasa daerah lain lebih banyak dari penutur bahasa daerah saya' },
      { value: 3, label: '3. Penutur bahasa daerah lain sama banyak dengan penutur bahasa daerah saya' },
      { value: 4, label: '4. Penutur bahasa daerah lain lebih sedikit dari penutur bahasa daerah saya' },
      { value: 5, label: '5. Tidak ada penutur bahasa daerah lain' }
    ]
  },
  {
    id: 76,
    number: 76,
    category: 'Proporsi Penduduk Berbahasa Daerah',
    text: 'Apakah penduduk desa ini berbahasa daerah Anda?',
    options: [
      { value: 1, label: '1. Tidak ada yang berbahasa daerah saya' },
      { value: 2, label: '2. Minoritas penduduk berbahasa daerah saya' },
      { value: 3, label: '3. Mayoritas penduduk berbahasa daerah saya' },
      { value: 4, label: '4. Hampir semua penduduk berbahasa daerah saya' },
      { value: 5, label: '5. Semua penduduk berbahasa daerah saya' }
    ]
  },
  {
    id: 77,
    number: 77,
    category: 'Penguasaan Bahasa Lain Penduduk Desa',
    text: 'Selain bahasa daerah Anda, apakah penduduk desa ini juga menggunakan atau memahami bahasa daerah lain?',
    options: [
      { value: 1, label: '1. Hampir semua penduduk berbahasa daerah lain' },
      { value: 2, label: '2. Sebagian besar penduduk berbahasa daerah lain' },
      { value: 3, label: '3. Sebagian penduduk berbahasa daerah lain' },
      { value: 4, label: '4. Sedikit penduduk berbahasa daerah lain' },
      { value: 5, label: '5. Tidak ada penduduk berbahasa daerah lain' }
    ]
  },
  {
    id: 78,
    number: 78,
    category: 'Buku Sekolah & Kurikulum',
    text: 'Apakah terdapat buku sekolah yang ditulis dalam bahasa daerah Anda?',
    options: OPT_TIDAK_ADA_SANGAT_BANYAK
  },
  {
    id: 79,
    number: 79,
    category: 'Sistem Aksara & Ortografi',
    text: 'Apakah bahasa daerah Anda telah memiliki sistem aksara/tulisan?',
    options: [
      { value: 1, label: '1. Tidak memiliki sistem aksara/tulisan' },
      { value: 2, label: '2. Memiliki sistem aksara/tulisan sederhana tetapi tidak digunakan' },
      { value: 3, label: '3. Memiliki sistem aksara/tulisan sederhana dan digunakan' },
      { value: 4, label: '4. Memiliki sistem aksara/tulisan yang mapan tetapi tidak digunakan' },
      { value: 5, label: '5. Memiliki sistem aksara/tulisan yang mapan dan digunakan' }
    ]
  },
  {
    id: 80,
    number: 80,
    category: 'Bahan Ajar & Pedagogi',
    text: 'Apakah terdapat bahan ajar yang memadai untuk pembelajaran bahasa daerah Anda?',
    options: OPT_TIDAK_ADA_SANGAT_BANYAK
  },
  {
    id: 81,
    number: 81,
    category: 'Bahan Bacaan Umum',
    text: 'Apakah terdapat bahan bacaan yang menggunakan bahasa daerah Anda?',
    options: OPT_TIDAK_ADA_SANGAT_BANYAK
  },
  {
    id: 82,
    number: 82,
    category: 'Kebijakan Perda Perlindungan Bahasa',
    text: 'Apakah ada peraturan daerah yang melindungi dan melestarikan bahasa daerah Anda?',
    options: OPT_TIDAK_ADA_SANGAT_BANYAK
  },
  {
    id: 83,
    number: 83,
    category: 'Dukungan Pemerintah Kabupaten/Kota',
    text: 'Apakah pemerintah pada tingkat kabupaten/kota menganjurkan penggunaan bahasa daerah Anda?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 84,
    number: 84,
    category: 'Penghargaan Pemerintah Desa/Kelurahan',
    text: 'Apakah pemerintah pada tingkat desa/kelurahan menghargai penggunaan bahasa daerah Anda?',
    options: OPT_PENGHARGAAN
  },
  {
    id: 85,
    number: 85,
    category: 'Regulasi Pembatasan Bahasa',
    text: 'Apakah ada peraturan daerah yang membatasi penggunaan bahasa daerah Anda?',
    options: OPT_TIDAK_ADA_SANGAT_BANYAK
  },
  {
    id: 86,
    number: 86,
    category: 'Kewajiban Bahasa di Perkantoran',
    text: 'Apakah ada peraturan daerah yang mewajibkan penggunaan bahasa daerah Anda di lingkungan pemerintahan dan perkantoran pada hari tertentu?',
    options: OPT_TIDAK_ADA_SANGAT_BANYAK
  },
  {
    id: 87,
    number: 87,
    category: 'Dukungan Pemerintah Kecamatan',
    text: 'Apakah pemerintah pada tingkat kecamatan menganjurkan penggunaan bahasa daerah Anda?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 88,
    number: 88,
    category: 'Penghargaan Pemerintah Kabupaten/Kota',
    text: 'Apakah pemerintah pada tingkat kabupaten/kota menghargai penggunaan bahasa daerah Anda?',
    options: OPT_PENGHARGAAN
  },
  {
    id: 89,
    number: 89,
    category: 'Dukungan Pemerintah Desa/Kelurahan',
    text: 'Apakah pemerintah pada tingkat desa/kelurahan menganjurkan penggunaan bahasa daerah Anda?',
    options: OPT_TIDAK_PERNAH_SELALU
  },
  {
    id: 90,
    number: 90,
    category: 'Penghargaan Pemerintah Kecamatan',
    text: 'Apakah pemerintah pada tingkat kecamatan menghargai penggunaan bahasa daerah Anda?',
    options: OPT_PENGHARGAAN
  },
  {
    id: 91,
    number: 91,
    category: 'Leksikografi & Kamus',
    text: 'Sepengetahuan Anda, apakah bahasa daerah Anda mempunyai kamus yang telah disusun?',
    options: OPT_TIDAK_ADA_SANGAT_BANYAK
  },
  {
    id: 92,
    number: 92,
    category: 'Tata Bahasa & Gramatika',
    text: 'Sepengetahuan Anda, apakah bahasa daerah Anda memiliki buku tata bahasa yang telah disusun?',
    options: OPT_TIDAK_ADA_SANGAT_BANYAK
  },
  {
    id: 93,
    number: 93,
    category: 'Bahan Ajar & Modul',
    text: 'Sepengetahuan Anda, apakah bahasa daerah Anda mempunyai bahan ajar yang telah disusun?',
    options: OPT_TIDAK_ADA_SANGAT_BANYAK
  },
  {
    id: 94,
    number: 94,
    category: 'Dokumentasi Audio-Visual',
    text: 'Sepengetahuan Anda, apakah dokumentasi bahasa daerah Anda berupa rekaman suara dan gambar/ video?',
    options: OPT_TIDAK_ADA_SANGAT_BANYAK
  },
  {
    id: 95,
    number: 95,
    category: 'Sketsa Gramatikal & Kosakata',
    text: 'Sepengetahuan Anda, apakah dokumentasi bahasa daerah Anda berupa sketsa gramatikal atau daftar kata?',
    options: OPT_TIDAK_ADA_SANGAT_BANYAK
  }
];

export function calculateVitalitySummary(answers: Record<number, number>): {
  totalAnswered: number;
  percentage: number;
  scoreAvg: number;
  vitalitasStatus: 'Aman' | 'Rentan' | 'Mengalami Kemunduran' | 'Terancam Punah' | 'Kritis';
  statusColor: string;
} {
  const answeredKeys = Object.keys(answers).filter(k => answers[Number(k)] > 0);
  const totalAnswered = answeredKeys.length;
  const percentage = Math.round((totalAnswered / 95) * 100);

  if (totalAnswered === 0) {
    return {
      totalAnswered: 0,
      percentage: 0,
      scoreAvg: 0,
      vitalitasStatus: 'Rentan',
      statusColor: 'text-amber-600 bg-amber-50 border-amber-200'
    };
  }

  const sum = answeredKeys.reduce((acc, k) => acc + (answers[Number(k)] || 0), 0);
  const scoreAvg = Number((sum / totalAnswered).toFixed(2));

  let vitalitasStatus: 'Aman' | 'Rentan' | 'Mengalami Kemunduran' | 'Terancam Punah' | 'Kritis' = 'Aman';
  let statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';

  if (scoreAvg >= 4.2) {
    vitalitasStatus = 'Aman';
    statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
  } else if (scoreAvg >= 3.4) {
    vitalitasStatus = 'Rentan';
    statusColor = 'text-amber-700 bg-amber-50 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
  } else if (scoreAvg >= 2.6) {
    vitalitasStatus = 'Mengalami Kemunduran';
    statusColor = 'text-orange-700 bg-orange-50 border-orange-300 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800';
  } else if (scoreAvg >= 1.8) {
    vitalitasStatus = 'Terancam Punah';
    statusColor = 'text-rose-700 bg-rose-50 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800';
  } else {
    vitalitasStatus = 'Kritis';
    statusColor = 'text-red-800 bg-red-100 border-red-400 dark:bg-red-950 dark:text-red-200 dark:border-red-800';
  }

  return {
    totalAnswered,
    percentage,
    scoreAvg,
    vitalitasStatus,
    statusColor
  };
}

export function mapToMacroCategory(category: string): { key: string; title: string; description: string } {
  const c = category.toLowerCase();
  if (c.includes('keluarga') || c.includes('rumah tangga') || c.includes('kerabat') || c.includes('saudara')) {
    return {
      key: 'keluarga',
      title: 'Ranah Keluarga & Rumah Tangga',
      description: 'Penggunaan bahasa daerah dalam interaksi intim keluarga (orang tua, anak, pasangan, kakek/nenek).'
    };
  }
  if (c.includes('tetangga') || c.includes('sosial') || c.includes('transaksi') || c.includes('pasar') || c.includes('sebaya') || c.includes('tegur')) {
    return {
      key: 'sosial',
      title: 'Ranah Sosial & Ketetanggaan',
      description: 'Penggunaan bahasa daerah dalam komunikasi ketetanggaan, pergaulan sebaya, dan transaksi pasar.'
    };
  }
  if (c.includes('adat') || c.includes('tradisi') || c.includes('upacara') || c.includes('pernikahan') || c.includes('kelahiran') || c.includes('kematian')) {
    return {
      key: 'adat',
      title: 'Ranah Adat, Tradisi & Kesenian',
      description: 'Pemakaian bahasa daerah dalam upacara adat siklus hidup, musyawarah tradisi, dan ritual leluhur.'
    };
  }
  if (c.includes('agama') || c.includes('ibadah') || c.includes('spiritual')) {
    return {
      key: 'agama',
      title: 'Ranah Agama & Spiritualitas',
      description: 'Penggunaan bahasa daerah dalam ibadah, doa, pengajian, ceramah, dan khotbah keagamaan.'
    };
  }
  if (c.includes('pendidikan') || c.includes('sekolah') || c.includes('buku') || c.includes('kurikulum') || c.includes('pedagogi') || c.includes('ajar')) {
    return {
      key: 'pendidikan',
      title: 'Ranah Pendidikan & Sekolah',
      description: 'Penerapan bahasa daerah sebagai muatan lokal, bahasa pengantar, dan bahan literasi di sekolah.'
    };
  }
  if (c.includes('pemerintah') || c.includes('layanan publik') || c.includes('pekerjaan') || c.includes('kantor') || c.includes('kesehatan') || c.includes('perda') || c.includes('kebijakan')) {
    return {
      key: 'pemerintahan',
      title: 'Ranah Pemerintahan & Layanan Publik',
      description: 'Dukungan regulasi daerah, pelayanan kantor desa/kecamatan, dan komunikasi ruang publik.'
    };
  }
  if (c.includes('media') || c.includes('internet') || c.includes('cetak') || c.includes('siaran') || c.includes('audio') || c.includes('kamus') || c.includes('aksara') || c.includes('tata bahasa') || c.includes('sketsa')) {
    return {
      key: 'media',
      title: 'Ranah Media & Teknologi Digital',
      description: 'Dokumentasi audio-visual, kamus leksikografi, media cetak, siaran, dan jejaring internet/medsos.'
    };
  }
  return {
    key: 'sikap',
    title: 'Sikap Bahasa & Transmisi Antargenerasi',
    description: 'Tingkat loyalitas, kebanggaan identitas penutur, dan komitmen pewarisan ke generasi anak-cucu.'
  };
}

export interface CategoryVitalityResult {
  key: string;
  title: string;
  description: string;
  questionIds: number[];
  totalQuestions: number;
  totalAnswered: number;
  avgScore: number;
  percentageAnswered: number;
  vitalitasStatus: 'Aman' | 'Rentan' | 'Mengalami Kemunduran' | 'Terancam Punah' | 'Kritis';
  statusColor: string;
  badgeBg: string;
  interpretation: string;
}

export function calculateCategoryVitalityAnalysis(answers: Record<number, number>): CategoryVitalityResult[] {
  const categoryMap = new Map<string, {
    key: string;
    title: string;
    description: string;
    questions: VitalitasQuestionItem[];
  }>();

  // Initialize ordered macro categories
  const macroOrder = ['keluarga', 'sosial', 'adat', 'agama', 'pendidikan', 'pemerintahan', 'media', 'sikap'];
  macroOrder.forEach(key => {
    const sample = mapToMacroCategory(key);
    categoryMap.set(key, {
      key,
      title: sample.title,
      description: sample.description,
      questions: []
    });
  });

  // Distribute all 95 questions into macro categories
  DAFTAR_PERTANYAAN_VITALITAS.forEach(q => {
    const macro = mapToMacroCategory(q.category);
    if (!categoryMap.has(macro.key)) {
      categoryMap.set(macro.key, {
        key: macro.key,
        title: macro.title,
        description: macro.description,
        questions: []
      });
    }
    categoryMap.get(macro.key)!.questions.push(q);
  });

  const results: CategoryVitalityResult[] = [];

  categoryMap.forEach(item => {
    const qIds = item.questions.map(q => q.id);
    const totalQuestions = qIds.length;
    const answeredInCat = qIds.filter(id => (answers[id] || 0) > 0);
    const totalAnswered = answeredInCat.length;
    const percentageAnswered = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

    const sumScore = answeredInCat.reduce((acc, id) => acc + (answers[id] || 0), 0);
    const avgScore = totalAnswered > 0 ? Number((sumScore / totalAnswered).toFixed(2)) : 0;

    let vitalitasStatus: 'Aman' | 'Rentan' | 'Mengalami Kemunduran' | 'Terancam Punah' | 'Kritis' = 'Aman';
    let statusColor = 'text-emerald-700 dark:text-emerald-300';
    let badgeBg = 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';
    let interpretation = 'Penggunaan bahasa daerah di ranah ini berjalan sangat aktif dan berkesinambungan tanpa kendala.';

    if (totalAnswered === 0) {
      vitalitasStatus = 'Rentan';
      statusColor = 'text-slate-500 dark:text-slate-400';
      badgeBg = 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
      interpretation = 'Belum ada pertanyaan yang terisi pada kategori ranah ini.';
    } else if (avgScore >= 4.2) {
      vitalitasStatus = 'Aman';
      statusColor = 'text-emerald-700 dark:text-emerald-300';
      badgeBg = 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';
      interpretation = 'Kategori sangat aman: Bahasa daerah menjadi media komunikasi utama dan tidak tergantikan oleh bahasa lain.';
    } else if (avgScore >= 3.4) {
      vitalitasStatus = 'Rentan';
      statusColor = 'text-amber-700 dark:text-amber-300';
      badgeBg = 'bg-amber-100 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800';
      interpretation = 'Kategori rentan: Mulai terjadi alih kode dan campur kode dengan bahasa Indonesia dalam ranah ini.';
    } else if (avgScore >= 2.6) {
      vitalitasStatus = 'Mengalami Kemunduran';
      statusColor = 'text-orange-700 dark:text-orange-300';
      badgeBg = 'bg-orange-100 dark:bg-orange-950/60 border-orange-200 dark:border-orange-800';
      interpretation = 'Kategori kemunduran: Bahasa daerah mulai terpinggirkan dan hanya digunakan terbatas oleh kalangan usia tua.';
    } else if (avgScore >= 1.8) {
      vitalitasStatus = 'Terancam Punah';
      statusColor = 'text-rose-700 dark:text-rose-300';
      badgeBg = 'bg-rose-100 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800';
      interpretation = 'Kategori terancam: Pemakaian sangat minim, generasi muda hampir tidak lagi menggunakan bahasa daerah pada ranah ini.';
    } else {
      vitalitasStatus = 'Kritis';
      statusColor = 'text-red-800 dark:text-red-300';
      badgeBg = 'bg-red-100 dark:bg-red-950/80 border-red-300 dark:border-red-800';
      interpretation = 'Kategori kritis: Penggunaan bahasa daerah telah terputus total pada ranah aktivitas ini.';
    }

    results.push({
      key: item.key,
      title: item.title,
      description: item.description,
      questionIds: qIds,
      totalQuestions,
      totalAnswered,
      avgScore,
      percentageAnswered,
      vitalitasStatus,
      statusColor,
      badgeBg,
      interpretation
    });
  });

  return results;
}

export const SAMPLE_VITALITAS_RESPONSES: KuesionerVitalitasResponse[] = [
  {
    id: 'vitalitas_resp_001',
    surveyId: 'survey_sample_karangwangi',
    respondenNama: 'H. Abah Suwarna',
    respondenUsia: 68,
    respondenGender: 'pria',
    respondenPekerjaan: 'Tokoh Adat / Petani',
    bahasaDaerah: 'Bahasa Sunda (Pesisir Kidul)',
    desa: 'Karangwangi',
    kecamatan: 'Cidaun',
    kabupatenKota: 'Kabupaten Cianjur',
    totalAnswered: 95,
    scoreAvg: 4.38,
    vitalitasStatus: 'Aman',
    statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    catatan: 'Penggunaan bahasa daerah sangat dominan dalam ranah keluarga, adat istiadat, dan kegiatan peribadatan setempat.',
    createdAt: '2026-03-01T09:30:00.000Z',
    updatedAt: '2026-03-01T10:15:00.000Z',
    answers: {
      1: 5, 2: 5, 3: 5, 4: 4, 5: 4, 6: 5, 7: 5, 8: 5, 9: 5, 10: 4,
      11: 5, 12: 5, 13: 5, 14: 4, 15: 4, 16: 4, 17: 4, 18: 3, 19: 2, 20: 3,
      21: 4, 22: 4, 23: 5, 24: 5, 25: 5, 26: 4, 27: 4, 28: 5, 29: 4, 30: 5,
      31: 5, 32: 4, 33: 5, 34: 4, 35: 5, 36: 5, 37: 5, 38: 5, 39: 4, 40: 4,
      41: 4, 42: 4, 43: 5, 44: 3, 45: 3, 46: 5, 47: 5, 48: 3, 49: 4, 50: 5,
      51: 4, 52: 4, 53: 4, 54: 3, 55: 4, 56: 2, 57: 4, 58: 4, 59: 4, 60: 3,
      61: 4, 62: 3, 63: 5, 64: 4, 65: 4, 66: 5, 67: 5, 68: 5, 69: 5, 70: 5,
      71: 4, 72: 3, 73: 4, 74: 2, 75: 4, 76: 4, 77: 2, 78: 4, 79: 4, 80: 4,
      81: 4, 82: 4, 83: 4, 84: 5, 85: 2, 86: 4, 87: 4, 88: 4, 89: 4, 90: 4,
      91: 4, 92: 4, 93: 4, 94: 4, 95: 4
    }
  },
  {
    id: 'vitalitas_resp_002',
    surveyId: 'survey_sample_cikaso',
    respondenNama: 'Ibu Nenden Sartika',
    respondenUsia: 42,
    respondenGender: 'wanita',
    respondenPekerjaan: 'Guru SD / Tokoh Pendidikan',
    bahasaDaerah: 'Bahasa Sunda dialek Selatan',
    desa: 'Cikaso',
    kecamatan: 'Kramatmulya',
    kabupatenKota: 'Kabupaten Kuningan',
    totalAnswered: 95,
    scoreAvg: 4.12,
    vitalitasStatus: 'Rentan',
    statusColor: 'text-amber-700 bg-amber-50 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    catatan: 'Penggunaan di sekolah mulai bercampur bahasa Indonesia, namun di rumah dan interaksi sosial tetap aktif.',
    createdAt: '2026-03-05T11:00:00.000Z',
    updatedAt: '2026-03-05T11:45:00.000Z',
    answers: {
      1: 4, 2: 4, 3: 4, 4: 3, 5: 3, 6: 5, 7: 5, 8: 5, 9: 4, 10: 4,
      11: 4, 12: 4, 13: 4, 14: 3, 15: 4, 16: 4, 17: 4, 18: 3, 19: 2, 20: 3,
      21: 3, 22: 4, 23: 4, 24: 4, 25: 5, 26: 4, 27: 3, 28: 4, 29: 4, 30: 4,
      31: 5, 32: 3, 33: 5, 34: 4, 35: 4, 36: 4, 37: 4, 38: 4, 39: 3, 40: 4,
      41: 3, 42: 4, 43: 4, 44: 2, 45: 2, 46: 5, 47: 5, 48: 2, 49: 4, 50: 4,
      51: 4, 52: 3, 53: 4, 54: 3, 55: 4, 56: 3, 57: 3, 58: 4, 59: 4, 60: 3,
      61: 3, 62: 3, 63: 4, 64: 3, 65: 4, 66: 4, 67: 5, 68: 5, 69: 4, 70: 4,
      71: 4, 72: 3, 73: 4, 74: 2, 75: 3, 76: 4, 77: 3, 78: 3, 79: 3, 80: 3,
      81: 3, 82: 4, 83: 4, 84: 4, 85: 2, 86: 4, 87: 4, 88: 4, 89: 4, 90: 4,
      91: 3, 92: 3, 93: 3, 94: 3, 95: 3
    }
  },
  {
    id: 'vitalitas_resp_003',
    surveyId: 'survey_sample_pangandaran',
    respondenNama: 'Pak Raden Warsito',
    respondenUsia: 58,
    respondenGender: 'pria',
    respondenPekerjaan: 'Nelayan / Pedagang Ikan',
    bahasaDaerah: 'Bahasa Jawa (Banyumasan)',
    desa: 'Babakan',
    kecamatan: 'Pangandaran',
    kabupatenKota: 'Kabupaten Pangandaran',
    totalAnswered: 95,
    scoreAvg: 4.25,
    vitalitasStatus: 'Aman',
    statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    catatan: 'Bahasa Jawa dialek Banyumasan hidup berdampingan secara harmonis dengan penutur bahasa Sunda di pesisir.',
    createdAt: '2026-03-08T14:10:00.000Z',
    updatedAt: '2026-03-08T15:00:00.000Z',
    answers: {
      1: 5, 2: 5, 3: 4, 4: 4, 5: 4, 6: 5, 7: 5, 8: 5, 9: 4, 10: 4,
      11: 4, 12: 5, 13: 5, 14: 4, 15: 4, 16: 4, 17: 4, 18: 3, 19: 2, 20: 3,
      21: 4, 22: 3, 23: 5, 24: 4, 25: 5, 26: 4, 27: 4, 28: 5, 29: 4, 30: 5,
      31: 5, 32: 3, 33: 5, 34: 4, 35: 4, 36: 4, 37: 5, 38: 5, 39: 4, 40: 4,
      41: 4, 42: 4, 43: 4, 44: 3, 45: 3, 46: 5, 47: 5, 48: 3, 49: 4, 50: 5,
      51: 4, 52: 4, 53: 4, 54: 3, 55: 4, 56: 2, 57: 3, 58: 4, 59: 4, 60: 3,
      61: 3, 62: 3, 63: 4, 64: 3, 65: 4, 66: 5, 67: 5, 68: 5, 69: 5, 70: 5,
      71: 4, 72: 3, 73: 4, 74: 2, 75: 4, 76: 4, 77: 3, 78: 3, 79: 4, 80: 3,
      81: 3, 82: 4, 83: 4, 84: 5, 85: 2, 86: 4, 87: 4, 88: 4, 89: 4, 90: 4,
      91: 4, 92: 4, 93: 3, 94: 4, 95: 4
    }
  },
  {
    id: 'vitalitas_resp_004',
    surveyId: 'survey_sample_cirebon',
    respondenNama: 'Kang Miftahudin',
    respondenUsia: 36,
    respondenGender: 'pria',
    respondenPekerjaan: 'Pengrajin Batik Trusmi',
    bahasaDaerah: 'Bahasa Cirebon',
    desa: 'Trusmi Kulon',
    kecamatan: 'Plered',
    kabupatenKota: 'Kabupaten Cirebon',
    totalAnswered: 95,
    scoreAvg: 3.88,
    vitalitasStatus: 'Rentan',
    statusColor: 'text-amber-700 bg-amber-50 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    catatan: 'Penggunaan bahasa Cirebon masih tinggi dalam perniagaan lokal namun memerlukan penguatan literasi sekolah.',
    createdAt: '2026-03-12T16:20:00.000Z',
    updatedAt: '2026-03-12T17:05:00.000Z',
    answers: {
      1: 4, 2: 4, 3: 4, 4: 3, 5: 3, 6: 4, 7: 4, 8: 5, 9: 4, 10: 3,
      11: 4, 12: 4, 13: 4, 14: 3, 15: 4, 16: 3, 17: 3, 18: 3, 19: 2, 20: 3,
      21: 4, 22: 3, 23: 4, 24: 4, 25: 4, 26: 3, 27: 3, 28: 4, 29: 4, 30: 4,
      31: 4, 32: 3, 33: 4, 34: 4, 35: 4, 36: 4, 37: 4, 38: 4, 39: 3, 40: 3,
      41: 3, 42: 3, 43: 4, 44: 2, 45: 2, 46: 5, 47: 5, 48: 2, 49: 4, 50: 4,
      51: 4, 52: 3, 53: 3, 54: 3, 55: 4, 56: 2, 57: 3, 58: 3, 59: 4, 60: 3,
      61: 3, 62: 3, 63: 4, 64: 3, 65: 3, 66: 4, 67: 4, 68: 4, 69: 4, 70: 4,
      71: 3, 72: 3, 73: 4, 74: 2, 75: 3, 76: 4, 77: 3, 78: 3, 79: 3, 80: 3,
      81: 3, 82: 3, 83: 3, 84: 4, 85: 2, 86: 3, 87: 3, 88: 4, 89: 4, 90: 4,
      91: 3, 92: 3, 93: 3, 94: 3, 95: 3
    }
  }
];
