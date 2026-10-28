import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Compass, 
  Layers, 
  Users, 
  Database, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  HelpCircle, 
  Download, 
  Printer, 
  Search, 
  ArrowRight, 
  ExternalLink, 
  Check, 
  Copy, 
  ShieldCheck, 
  Volume2, 
  Mic, 
  Cpu, 
  WifiOff, 
  Cloud, 
  Save, 
  MapPin, 
  Flame, 
  FileSpreadsheet, 
  BarChart3, 
  Clock, 
  ChevronRight, 
  AlertTriangle, 
  Keyboard, 
  CheckSquare, 
  Info,
  FolderDown,
  Layers2,
  Play,
  Globe2,
  Sliders,
  TableProperties,
  Workflow,
  Split,
  Radar as RadarIcon,
  Activity,
  CircleDot,
  TreePine,
  GitBranch,
  ArrowLeftRight,
  Hourglass,
  Calculator,
  Filter,
  LayoutDashboard,
  Scroll,
  Award
} from 'lucide-react';
import { ViewKey } from '../layout/AppSidebar';
import { BentoDocumentationGrid } from './BentoDocumentationGrid';
import { PanduanKuesionerKhususSection } from './PanduanKuesionerKhususSection';

interface DokumentasiPanduanViewProps {
  onNavigateToView: (view: ViewKey) => void;
  onOpenPRDModal?: () => void;
  onLoadSample?: () => void;
  onCreateNew?: () => void;
  onOpenExport?: () => void;
}

export const DokumentasiPanduanView: React.FC<DokumentasiPanduanViewProps> = ({
  onNavigateToView,
  onOpenPRDModal,
  onLoadSample,
  onCreateNew,
  onOpenExport
}) => {
  const [activeTab, setActiveTab] = useState<'bento' | 'alur' | 'panduan-vitalitas' | 'panduan-revitalisasi' | 'panduan-sastra-lisan' | 'peta-dialek' | 'dialektometri' | 'peran' | 'seksi16' | 'faq' | 'unduhan'>('bento');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRole, setActiveRole] = useState<'surveyor' | 'verifikator' | 'admin' | 'viewer'>('surveyor');
  const [copiedFormula, setCopiedFormula] = useState(false);
  const [copiedDocLink, setCopiedDocLink] = useState(false);
  const [copiedDialekDocLink, setCopiedDialekDocLink] = useState(false);
  const [activeSectionFilter, setActiveSectionFilter] = useState<string>('all');

  // Interactive Simulator for Dialektometri Jean Guiter
  const [simS, setSimS] = useState<number>(38); // jumlah kata beda
  const [simN, setSimN] = useState<number>(200); // total glos yang diuji
  const simD = useMemo(() => {
    if (simN <= 0) return 0;
    return Number(((simS / simN) * 100).toFixed(1));
  }, [simS, simN]);

  const simStatus = useMemo(() => {
    if (simD <= 20) return { 
      label: 'Dialek Sama (Homogen)', 
      color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
      badgeBg: 'bg-emerald-500',
      barColor: 'bg-emerald-500',
      isogloss: 'Tidak Ditarik Garis Isoglos',
      desc: 'Perbedaan kosakata hanya berupa idiolek atau variasi bebas individual. Derajat saling memahami (mutual intelligibility) sempurna 100%.'
    };
    if (simD <= 30) return { 
      label: 'Beda Wicara / Subdialek', 
      color: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
      badgeBg: 'bg-blue-500',
      barColor: 'bg-blue-500',
      isogloss: 'Isoglos Lemah (Garis Putus-Putus)',
      desc: 'Variasi fonetis dan leksikal minor. Masyarakat kedua desa tetap saling memahami secara spontan tanpa kesulitan (>90%).'
    };
    if (simD <= 50) return { 
      label: 'Beda Dialek (Dialect)', 
      color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
      badgeBg: 'bg-amber-500',
      barColor: 'bg-amber-500',
      isogloss: 'Isoglos Tegas (Garis Solid Kontinu)',
      desc: 'Perbedaan leksikal dan fonologis teratur. Membentuk batas wilayah isolek dialek yang tegas dalam ruang geografis.'
    };
    if (simD <= 80) return { 
      label: 'Beda Bahasa (Language)', 
      color: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
      badgeBg: 'bg-rose-500',
      barColor: 'bg-rose-500',
      isogloss: 'Batas Bahasa Definitif (Garis Ganda)',
      desc: 'Mayoritas kosakata dasar berbeda secara etimologis. Komunikasi spontan terhambat; memenuhi syarat linguistik sebagai dua bahasa berbeda.'
    };
    return { 
      label: 'Beda Rumpun / Subkeluarga', 
      color: 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
      badgeBg: 'bg-purple-500',
      barColor: 'bg-purple-500',
      isogloss: 'Garis Batas Rumpun Bahasa Utama',
      desc: 'Perbedaan kosakata masif; struktur gramatika dan leksikon terpisah secara filogenetik historis dalam pohon silsilah bahasa.'
    };
  }, [simD]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyFormula = () => {
    navigator.clipboard.writeText('d = (s / n) * 100%');
    setCopiedFormula(true);
    setTimeout(() => setCopiedFormula(false), 2000);
  };

  const handleCopyDocUrl = () => {
    const url = window.location.origin + '/docs/PRD_USER_FLOW_SISTEM_PEMETAAN_BAHASA.doc';
    navigator.clipboard.writeText(url);
    setCopiedDocLink(true);
    setTimeout(() => setCopiedDocLink(false), 2000);
  };

  // Steps for User Flow
  const workflowSteps = [
    {
      number: 1,
      title: 'Persiapan & Pembuatan Titik Survei Lapangan',
      category: 'Setup & Inisiasi',
      duration: '± 2-3 Menit',
      description: 'Memulai pengumpulan data baru dengan membuat formulir kosong, memuat data sampel referensi (Desa Karangwangi), atau mengimpor berkas cadangan JSON terdahulu.',
      details: [
        'Klik tombol "+ Formulir Baru" di Dashboard atau menu Datasets untuk membuat survei baru dengan ID unik berbasis waktu.',
        'Jika ingin mempelajari struktur data standar atau simulasi, klik "+ Contoh Survei" untuk memuat sampel Desa Karangwangi (Kecamatan Cikaso, Sukabumi).',
        'Impor berkas JSON cadangan (.json) jika melanjutkan survei yang dikerjakan pada perangkat lain.',
        'Sistem otomatis menetapkan survei yang baru dibuat sebagai "Survei Aktif" (Active Survey) dan menyimpannya di LocalStorage.'
      ],
      actionLabel: 'Buka Manajemen Survei',
      actionView: 'datasets' as ViewKey
    },
    {
      number: 2,
      title: 'Pemilihan Mode Pengisian: 16 Layar Terfokus vs Gulir Penuh',
      category: 'Antarmuka Kuesioner',
      duration: 'Konfigurasi Layar',
      description: 'Menyesuaikan mode formulir dengan kondisi perangkat surveyor di lapangan (ponsel/tablet) vs desktop di posko penelitian.',
      details: [
        'Mode 16 Layar Terfokus (Direkomendasikan di Lapangan): Menyajikan satu seksi per layar lengkap dengan pill stepper nomor 1–16, tombol "Kembali" & "Selanjutnya", serta indikator badge merah yang menghitung kolom kosong atau tidak valid secara real-time.',
        'Mode Gulir Penuh (Full Scroll): Menampilkan seluruh 16 seksi dalam satu halaman panjang berkesinambungan. Sangat ideal untuk pengecekan cepat, audit menyeluruh, atau pencetakan fisik formulir.',
        'Peralihan mode dapat dilakukan secara instan lewat tombol "Mode Gulir Penuh" di bilah atas formulir tanpa kehilangan data yang sedang diinput.'
      ],
      actionLabel: 'Buka Kuesioner 16 Layar',
      actionView: 'form-screen' as ViewKey
    },
    {
      number: 3,
      title: 'Pengisian Toponimi Wilayah & Verifikasi GPS (Seksi 1–3)',
      category: 'Geografi & Morfologi',
      duration: '± 5-10 Menit',
      description: 'Mencatat identitas desa, batas administratif, situasi perbatasan 4 mata angin, dan validasi koordinat lintang & bujur.',
      details: [
        'Seksi 1 (Titik Pengamatan): Isi nama desa, toponimi asal kata, bahasa utama, nama lain bahasa, kecamatan, kab/kota, provinsi, dan kode titik.',
        'Sinkronisasi GPS Otomatis: Nilai lintang dan bujur yang diisi di Seksi 1 otomatis terhubung ke Seksi 3 tanpa perlu input ulang.',
        'Seksi 2 (Situasi Kebahasaan): Dokumentasikan desa tetangga dan bahasa yang berbatasan langsung di arah Timur, Barat, Utara, dan Selatan.',
        'Seksi 3 (Situasi Geografis & Morfologi): Tentukan letak (pantai/pedalaman), jarak dari pantai (km), serta topografi bentang alam (dataran, perbukitan, pegunungan, pesisir). Dilengkapi peta interaktif Leaflet mini dengan transisi basemap halus.'
      ],
      actionLabel: 'Buka Seksi Identitas Wilayah',
      actionView: 'identitas' as ViewKey
    },
    {
      number: 4,
      title: 'Sosiodemografi & Triangulasi 3 Narasumber (Seksi 4–14)',
      category: 'Kependudukan & Informan',
      duration: '± 15-20 Menit',
      description: 'Mendokumentasikan demografi penduduk desa, mata pencaharian, pendidikan, agama, mobilitas, sejarah desa, serta profil 3 informan kunci.',
      details: [
        'Seksi 4: Rekam rasio gender, piramida kelompok usia (<20, 20–40, >40 tahun), jumlah penutur aktif bahasa daerah, dan komposisi etnis warga.',
        'Seksi 5–10: Data profesi dominan, jenjang pendidikan, fasilitas sekolah, sebaran agama, kelancaran mobilitas, dan moda transportasi penghubung.',
        'Seksi 11–13: Usia desa, narasi toponimi sejarah berdirinya desa, dan folklor/sastra lisan dominan.',
        'Seksi 14 (Triangulasi 3 Narasumber): Rekam minimal 3 penutur asli (nama, gender, usia, pekerjaan, lama tinggal, frekuensi mobilitas, bahasa ibu, bahasa kedua, dan medsos). Triangulasi menjamin keabsahan data leksikal yang dikumpulkan.'
      ],
      actionLabel: 'Buka Data Responden',
      actionView: 'responden' as ViewKey
    },
    {
      number: 5,
      title: 'Perekaman Kosakata Swadesh 200 & Deteksi Kata Serapan AI (Seksi 15)',
      category: 'Leksikon & Fonologi',
      duration: '± 30-45 Menit',
      description: 'Mengumpulkan 200 kosakata dasar Swadesh, merekam audio pelafalan asli, transkripsi fonetis IPA, dan verifikasi etimologi kata serapan.',
      details: [
        'Input Bentuk Lokal & Simbol IPA: Ketik bentuk kata bahasa daerah dan padanan fonetis IPA (International Phonetic Alphabet) untuk setiap glos Indonesia.',
        'Perekam Audio Terintegrasi (Web Audio API): Klik tombol mikrofon merah pada masing-masing kata untuk merekam suara asli informan. Audio tersimpan otomatis dan dapat diputar ulang seketika.',
        'Tombol "Deteksi Serapan (Gemini AI)": Mengirim grup kata ke server untuk menganalisis apakah kata tersebut merupakan kata serapan (Sanskerta, Arab, Belanda, Portugis, Hokkien, Melayu) vs kognat asli warisan Proto-Austronesia guna menjaga kemurnian dialektometri.',
        'Lengkapi 18 bidang budaya (A–R), frasa nominal/verbal, 50 kalimat S-P-O-K, serta identitas pengumpul data.'
      ],
      actionLabel: 'Buka Daftar Kosakata',
      actionView: 'kosakata' as ViewKey
    },
    {
      number: 6,
      title: 'Kalkulasi Dialektometri Jean Guiter & Penentuan Isoglos (Seksi 16)',
      category: 'Analisis Geolinguistik',
      duration: 'Kalkulasi Instan (<100ms)',
      description: 'Menghitung persentase perbedaan leksikal antar titik pengamatan menggunakan formula Jean Guiter untuk menentukan batas dialek.',
      details: [
        'Tetapkan Titik Pengamatan Acuan (desa saat ini) dan tambahkan satu atau lebih Titik Pembanding.',
        'Input jumlah perbedaan bentuk leksikal (s) dan total glos pembanding (n).',
        'Formula Guiter otomatis mengalkulasi indeks: d = (s / n) × 100%.',
        'Klasifikasi Status Otomatis: Dialek Sama (≤20%), Beda Subdialek (21–30%), Beda Dialek (31–50%), Beda Bahasa (51–80%), Beda Rumpun (>80%).',
        'Tarik kesimpulan garis isoglos geografis dan simpan catatan dialektologi.'
      ],
      actionLabel: 'Buka Dialektometri & Peta',
      actionView: 'dialektometri' as ViewKey
    },
    {
      number: 7,
      title: 'Eksplorasi Peta Geospasial Leaflet GIS & Filter Spasial',
      category: 'Visualisasi Spasial',
      duration: 'Eksplorasi Spasial',
      description: 'Memvisualisasikan seluruh titik survei di peta wilayah dengan multi-basemap, jejaring spasial, dan filter penanda interaktif.',
      details: [
        'Pilih Lapisan Peta Dasar (Basemap): Beralih antara Google Maps Jalan, Google Satelit Hibrida, OpenStreetMap, Carto Light, atau Carto Dark dengan transisi halus.',
        'Filter Status Validasi: Saring titik survei berdasarkan status "✓ Tervalidasi" (pin hijau) atau "Belum Diverifikasi" (pin amber).',
        'Filter Rentang Usia Informan: Saring penanda berdasarkan usia narasumber (<25 thn muda, 25–50 thn dewasa, >50 thn sepuh) untuk meneliti fenomena pergeseran bahasa antargenerasi.',
        'Jejaring Spasial: Aktifkan "Garis Relasi Spasial" untuk melihat keterhubungan spasial antar-desa.',
        'Klik penanda untuk melihat popup detail informan, status validasi, jalan pintas formulir, atau buka titik presisi di Google Maps eksternal.'
      ],
      actionLabel: 'Buka Peta Titik Survei',
      actionView: 'peta-survei' as ViewKey
    },
    {
      number: 8,
      title: 'Kurasi Verifikator, Sinkronisasi Cloud & Distribusi Multi-Format',
      category: 'Verifikasi & Ekspor',
      duration: 'Penyelesaian & Arsip',
      description: 'Pemeriksaan validitas ilmiah oleh verifikator, sinkronisasi otomatis ke Firebase Firestore, dan pengunduhan arsip.',
      details: [
        'Audit & Verifikasi: Verifikator bahasa memeriksa kelengkapan 16 seksi dan mengesahkan survei dengan status "✓ Tervalidasi" (Badge Hijau).',
        'Offline-First & Auto-Sync: Aplikasi tetap bekerja tanpa internet. Mutasi data disimpan di antrean lokal (IndexedDB) dan otomatis disinkronkan ke Firestore saat kembali online.',
        'Ekspor Buku Kerja Excel (.xlsx): Unduh berkas spreadsheet multi-sheet berstandar riset nasional.',
        'Ekspor CSV & JSON: Simpan 200 kosakata Swadesh dan cadangan seluruh arsip database.',
        'Unduh Dokumen PRD & Cetak PDF: Dapatkan dokumen spesifikasi resmi dalam format Word (.doc) atau cetak langsung ke format PDF.'
      ],
      actionLabel: 'Buka Ekspor Data',
      actionView: 'dashboard' as ViewKey
    },
    {
      number: 9,
      title: 'Pengisian Kuesioner Khusus: Sastra Lisan, Vitalitas Bahasa & Revitalisasi',
      category: 'Tradisi & Konservasi',
      duration: '± 20-30 Menit',
      description: 'Melengkapi survei lapangan dengan instrumen khusus: perekaman sastra lisan (motif ATU), pengukuran daya hidup 95 indikator, dan Rencana Aksi Pemda (RAP) serta Monev IKRBD.',
      details: [
        'Kuesioner Sastra Lisan: Dokumentasikan identitas juru cerita dan sanggar seni (Bagian A), karakteristik fisik tuturan (B.1), transkripsi naskah dan terjemahan (B.2), konteks ritual dan pewarisan (B.3), serta georeferensi GPS dan perekaman multimedia (B.4).',
        'Kuesioner Vitalitas Bahasa: Wawancarai penutur untuk 95 butir indikator Likert (skala 1–5) di 6 ranah (Domestik, Sosial, Pendidikan, Kedinasan, Media/Seni Digital, Sikap Bahasa). Sistem otomatis mengalkulasi skor rata-rata dan menentukan 5 tingkat vitalitas (Aman hingga Kritis).',
        'Revitalisasi Bahasa Daerah (RBD): Susun Rencana Aksi Pemda (RAP) dengan 7 tahapan lini masa dan 7 materi kreatif FTBI, serta evaluasi 5 dimensi lapangan instrumen Monev Indeks Kinerja Revitalisasi Bahasa Daerah (IKRBD).'
      ],
      actionLabel: 'Buka Panduan Kuesioner',
      actionView: 'dokumentasi' as ViewKey
    }
  ];

  // FAQ Items
  const faqList = [
    {
      q: 'Bagaimana cara menggunakan aplikasi saat tidak ada koneksi internet di pedalaman (Wilayah 3T)?',
      a: 'Aplikasi dirancang dengan arsitektur Offline-First PWA (Progressive Web App). Seluruh aset antarmuka dicache oleh Service Worker Workbox, dan data survei disimpan di LocalStorage serta IndexedDB melalui OfflineSyncManager. Anda dapat membuat survei baru, mengisi 16 seksi, merekam audio suara, dan menghitung dialektometri sepenuhnya tanpa internet. Begitu perangkat mendapatkan sinyal internet, sistem secara otomatis menyinkronkan seluruh perubahan ke Firebase Cloud Firestore.'
    },
    {
      q: 'Bagaimana cara kerja perekam audio pada 200 Kosakata Swadesh?',
      a: 'Perekam suara memanfaatkan Web Audio API bawaan peramban (browser) modern. Pada Seksi 15, setiap baris kosakata memiliki tombol rekam mikrofon merah. Klik untuk mulai merekam pelafalan asli narasumber, klik kembali untuk berhenti. Anda dapat langsung memutar ulang rekaman (play) atau menghapusnya jika ingin merekam ulang. Pastikan izin akses mikrofon (microphone permission) telah diizinkan pada peramban Anda.'
    },
    {
      q: 'Apa fungsi tombol "Deteksi Serapan (Gemini AI)" pada daftar kosakata?',
      a: 'Dalam penelitian dialektologi murni, kata serapan asing (seperti dari bahasa Arab, Sanskerta, Belanda, Melayu, atau Portugis) tidak boleh dihitung sebagai variasi dialek asli karena dapat memicu "kognat palsu" (false cognates). Tombol Deteksi Serapan memanggil model Google Gemini (gemini-3.8-flash) di server backend untuk menganalisis etimologi kata secara ilmiah dan menandai apakah kata tersebut merupakan kata serapan vs kognat asli warisan Proto-Austronesia.'
    },
    {
      q: 'Bagaimana rumus Jean Guiter dihitung dan apa artinya skala persentasenya?',
      a: 'Rumus Jean Guiter adalah d = (s / n) × 100%, di mana s adalah jumlah perbedaan bentuk leksikal dan n adalah total konsep kata yang diperbandingkan. Skala interpretasi: ≤ 20% berarti Dialek Sama (perbedaan hanya idiolek individual); 21–30% berarti Beda Subdialek (variasi fonetis minor); 31–50% berarti Beda Dialek (batas isoglos nyata); 51–80% berarti Beda Bahasa; dan > 80% berarti Beda Rumpun Bahasa.'
    },
    {
      q: 'Apakah data saya aman jika peramban tidak sengaja tertutup atau baterai ponsel habis?',
      a: 'Sangat aman. Sistem menerapkan mekanisme "Auto-Save ber-debounce 500 milidetik". Setiap ketikan, pemilihan opsi, atau perekaman audio langsung disimpan ke basis data lokal dalam waktu 0.5 detik tanpa perlu menunggu pengguna menekan tombol simpan manual. Indikator "Tersimpan" di bilah atas akan memperbarui waktu penyimpanan terakhir.'
    },
    {
      q: 'Bagaimana cara mencetak atau mengunduh dokumen resmi PRD & User Flow?',
      a: 'Pengguna dapat mengunduh berkas resmi Microsoft Word (.doc) siap edit melalui tombol "Unduh .DOC (Word)" di bagian atas halaman ini atau modal ekspor. Pengguna juga dapat mencetak dokumen ke format PDF melalui tombol "Cetak / Simpan PDF", di mana peramban akan menampilkan dialog cetak dengan tata letak dokumen bersih (tanpa sidebar dan navigasi).'
    },
    {
      q: 'Bagaimana cara menggunakan filter penanda spasial di Peta Leaflet?',
      a: 'Buka menu "Peta Titik Survei (Leaflet)". Di bilah alat atas peta, terdapat dua filter utama: (1) Filter Status Validasi untuk menyaring titik yang sudah diverifikasi (pin hijau) vs belum diverifikasi (pin amber); dan (2) Filter Kelompok Usia Narasumber (<25 tahun generasi muda, 25–50 tahun dewasa, >50 tahun tetua) untuk melihat distribusi usia informan secara spasial. Peta akan otomatis menyesuaikan batas kamera (auto-fit bounds) ke titik-titik yang tersaring.'
    }
  ];

  // 16 Sections Metadata
  const sectionsList = [
    { num: 1, title: 'Titik Pengamatan & Toponimi', cat: 'Geografi & Administratif', desc: 'Nama desa, toponimi asal nama, bahasa utama, nama lain bahasa, kecamatan, kabupaten/kota, provinsi, pulau, kode titik, koordinat lintang & bujur GPS.' },
    { num: 2, title: 'Situasi Kebahasaan 4 Mata Angin', cat: 'Batas Kebahasaan', desc: 'Desa dan bahasa yang berbatasan langsung di sebelah Timur, Barat, Utara, dan Selatan titik pengamatan.' },
    { num: 3, title: 'Situasi Geografis & Morfologi', cat: 'Bentang Alam & Peta', desc: 'Jarak dari garis pantai, letak pedalaman/pesisir, topografi morfologi (dataran, perbukitan, pegunungan, pesisir), serta peta Leaflet mini sinkron.' },
    { num: 4, title: 'Penduduk & Penutur Bahasa', cat: 'Demografi & Vitalitas', desc: 'Rasio jumlah penduduk pria/wanita, kelompok umur (<20, 20-40, >40), jumlah penutur aktif bahasa daerah menurut usia, dan komposisi etnis warga.' },
    { num: 5, title: 'Mata Pencaharian & Sosioekonomi', cat: 'Sosial Budaya', desc: 'Persentase dan profesi dominan warga desa: bertani, nelayan, berdagang, buruh, pegawai negeri/swasta, serta kearifan lokal.' },
    { num: 6, title: 'Tingkat Pendidikan Warga', cat: 'Pendidikan', desc: 'Sebaran pendidikan warga: tidak sekolah, lulusan SD, SMP, SMA, Perguruan Tinggi, dan jumlah sarjana asal desa.' },
    { num: 7, title: 'Sarana & Gedung Pendidikan', cat: 'Infrastruktur', desc: 'Ketersediaan fasilitas fisik gedung sekolah SD, SMP, SMA, PT, dan lembaga kursus bahasa atau kejuruan di wilayah desa.' },
    { num: 8, title: 'Komposisi Pemeluk Agama', cat: 'Sosial Keagamaan', desc: 'Statistik pemeluk agama Islam, Kristen Protestan, Katolik, Hindu, Buddha, Konghucu, dan aliran kepercayaan lokal.' },
    { num: 9, title: 'Hubungan Mobilitas & Aksesibilitas', cat: 'Interaksi Spasial', desc: 'Evaluasi kelancaran interaksi masyarakat desa ke luar wilayah (sangat lancar s.d. tidak lancar) dan catatan kondisi jalan.' },
    { num: 10, title: 'Moda & Alat Transportasi', cat: 'Aksesibilitas', desc: 'Ketersediaan armada transportasi umum dan privat yang beroperasi: darat (mobil/motor/bus), laut (kapal/speedboat), sungai (perahu), dan udara.' },
    { num: 11, title: 'Usia Berdirinya Desa', cat: 'Sejarah & Usia', desc: 'Kategori usia perkiraan berdirinya desa (<50, 50-100, 200-500, >500 tahun), estimasi tahun berdiri, dan bukti pendukung.' },
    { num: 12, title: 'Sejarah Singkat & Asal-Usul Desa', cat: 'Historiografi', desc: 'Narasi ringkas asal-usul toponimi desa, tokoh pendiri (pemberi nama), peristiwa historis penting, dan silsilah kepemimpinan.' },
    { num: 13, title: 'Folklore & Sastra Lisan Tradisi', cat: 'Tradisi Tutur', desc: 'Dokumentasi cerita rakyat dominan (kategori mitos, legenda, dongeng), nama tokoh sentral, ringkasan cerita, dan fungsi tradisi bagi norma desa.' },
    { num: 14, title: 'Data 3 Narasumber Triangulasi', cat: 'Profil Informan', desc: 'Identitas lengkap 3 informan kunci (nama, gender, usia, tahun lahir, pekerjaan, lama tinggal, frekuensi bepergian, medsos, bahasa ibu vs bahasa kedua).' },
    { num: 15, title: 'Kosakata Swadesh 200, Audio & Deteksi AI', cat: 'Korpus Leksikal', desc: '200 kata Swadesh + transkripsi fonetis IPA + perekam audio suara Web Audio API + deteksi serapan Gemini AI + 18 bidang budaya (A-R) + 50 kalimat S-P-O-K.' },
    { num: 16, title: 'Dialektometri Guiter & Batas Isoglos', cat: 'Analisis Komparatif', desc: 'Titik acuan vs titik pembanding, jumlah beda leksikal (s), total glos (n), indeks d = (s/n)*100%, klasifikasi otomatis status hubungan dialek, dan garis isoglos.' }
  ];

  const filteredSteps = useMemo(() => {
    if (!searchQuery.trim()) return workflowSteps;
    const q = searchQuery.toLowerCase();
    return workflowSteps.filter(s => 
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.details.some(d => d.toLowerCase().includes(q))
    );
  }, [searchQuery, workflowSteps]);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqList;
    const q = searchQuery.toLowerCase();
    return faqList.filter(f => 
      f.q.toLowerCase().includes(q) ||
      f.a.toLowerCase().includes(q)
    );
  }, [searchQuery, faqList]);

  return (
    <div className="space-y-6 animate-fade-in print:space-y-4">
      {/* HEADER / HERO BAR */}
      <div className="bg-white dark:bg-slate-900 border border-[#e5e5e5] dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-2xs transition-colors print:border-none print:shadow-none print:p-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap text-xs text-[#737373] dark:text-slate-400">
              <span className="font-semibold text-[#1447e6] dark:text-blue-400 uppercase tracking-wider">
                Dokumentasi & Panduan Resmi
              </span>
              <span aria-hidden="true">·</span>
              <span>Versi 2.5 Master</span>
              <span aria-hidden="true">·</span>
              <span>Standar Badan Bahasa & UNESCO</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0a0a0a] dark:text-white tracking-tight leading-tight">
              Dokumentasi & Tata Cara Penggunaan Aplikasi
            </h1>
            
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Panduan operasional menyeluruh Sistem Pemetaan Bahasa & Dialektometri (Derana Panel Enterprise).
              Mencakup alur kerja surveyor lapangan, panduan pengisian 16 bagian kuesioner, perekaman audio suara,
              deteksi kata serapan AI (Gemini), formula Jean Guiter, dan peta Leaflet GIS.
            </p>
          </div>

            {/* Action Buttons: Documentation tools and module guide */}
          <div className="flex items-center gap-2 flex-wrap shrink-0 print:hidden">
            <button
              type="button"
              onClick={() => setActiveTab('seksi16')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-indigo-700 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 shadow-2xs transition-all cursor-pointer"
              title="Lihat panduan modul dan alur kerja 12 modul"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Panduan Modul & Flow</span>
            </button>
            <a
              href="/docs/PRD_USER_FLOW_SISTEM_PEMETAAN_BAHASA.doc"
              download="PRD_USER_FLOW_SISTEM_PEMETAAN_BAHASA.doc"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-[#1447e6] hover:bg-blue-700 shadow-2xs transition-all cursor-pointer"
              title="Unduh berkas dokumen Microsoft Word (.doc) lengkap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh .DOC (Word)</span>
            </a>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#0a0a0a] dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-[#f5f5f5] dark:hover:bg-slate-700 border border-[#e5e5e5] dark:border-slate-700 shadow-2xs transition-all cursor-pointer"
              title="Cetak atau simpan sebagai format PDF resmi"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Cetak / PDF</span>
            </button>

            {onOpenPRDModal && (
              <button
                type="button"
                onClick={onOpenPRDModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#1447e6] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-900/50 shadow-2xs transition-all cursor-pointer"
                title="Buka Dokumen PRD dalam jendela modal"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Modal PRD</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 print:hidden">
          {[
            { step: '01', title: 'Siapkan survei', description: 'Buat survei baru atau gunakan contoh data untuk memahami alurnya.', icon: FolderDown, view: 'datasets' as ViewKey },
            { step: '02', title: 'Isi 16 seksi', description: 'Gunakan mode layar terfokus saat bekerja di lapangan atau mode gulir penuh untuk audit.', icon: CheckSquare, view: 'form-screen' as ViewKey },
            { step: '03', title: 'Validasi & ekspor', description: 'Periksa kelengkapan, bandingkan dialek, lalu simpan hasil dalam format yang dibutuhkan.', icon: ShieldCheck, view: 'dashboard' as ViewKey }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.step}
                type="button"
                onClick={() => onNavigateToView(item.view)}
                className="group text-left rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 p-4 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-bold tracking-[0.18em] text-blue-600 dark:text-blue-400">{item.step}</span>
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" aria-hidden="true" />
                </div>
                <h2 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">{item.title}</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{item.description}</p>
              </button>
            );
          })}
        </div>

        {/* Live Search Filter Bar */}
        <div className="mt-4 pt-4 border-t border-[#e5e5e5] dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373] dark:text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari topik panduan, seksi, atau kata kunci..."
              className="w-full pl-9 pr-4 py-1.5 bg-[#fafafa] dark:bg-slate-800 border border-[#e5e5e5] dark:border-slate-700 rounded-lg text-xs text-[#0a0a0a] dark:text-white placeholder-[#737373] dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#737373] hover:text-[#0a0a0a] dark:text-slate-400 dark:hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#737373] dark:text-slate-400 self-start sm:self-auto">
            <span>Pintasan Cepat:</span>
            <button
              type="button"
              onClick={() => onNavigateToView('form-screen')}
              className="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
            >
              16 Seksi
            </button>
            <button
              type="button"
              onClick={() => onNavigateToView('peta-survei')}
              className="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Peta Leaflet
            </button>
            <button
              type="button"
              onClick={() => onNavigateToView('dialektometri')}
              className="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Dialektometri
            </button>
          </div>
        </div>
      </div>

      {/* BENTO MENU NAVIGASI DOKUMENTASI (NON-TRUNCATED BENTO GRID) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs print:hidden space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
              <span>Menu Navigasi Panduan & Tata Cara</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pilih modul dokumentasi di bawah — seluruh instrumen dan petunjuk teknis tersusun rapi.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 self-start sm:self-auto">
            11 Modul Lengkap
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
          {/* Card 1: Grid Master */}
          <button
            type="button"
            onClick={() => setActiveTab('bento')}
            className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group relative ${
              activeTab === 'bento'
                ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/30 shadow-sm'
                : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <div className={`p-1.5 rounded-lg ${
                  activeTab === 'bento' ? 'bg-indigo-600 text-white' : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                }`}>
                  <LayoutDashboard className="w-4 h-4" />
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'bento' ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                }`}>
                  {activeTab === 'bento' ? '● Aktif' : 'Katalog Modul'}
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                Dokumentasi Lengkap
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                Tampilan Matriks 12 Fitur
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
              <span>Arsitektur Modul</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">Utama</span>
            </div>
          </button>

          {/* Card 2: Alur & Tata Cara */}
          <button
            type="button"
            onClick={() => setActiveTab('alur')}
            className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group relative ${
              activeTab === 'alur'
                ? 'bg-blue-50/90 dark:bg-blue-950/60 border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/30 shadow-sm'
                : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <div className={`p-1.5 rounded-lg ${
                  activeTab === 'alur' ? 'bg-blue-600 text-white' : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                }`}>
                  <Layers className="w-4 h-4" />
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'alur' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                }`}>
                  {activeTab === 'alur' ? '● Aktif' : '9 Tahap'}
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                Alur & Tata Cara
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                SOP Penggunaan Lapangan
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
              <span>Riset Lapangan</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">Workflow</span>
            </div>
          </button>

          {/* Card 3: Tata Cara Kuesioner Vitalitas Bahasa */}
          <button
            type="button"
            onClick={() => setActiveTab('panduan-vitalitas')}
            className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group relative ${
              activeTab === 'panduan-vitalitas'
                ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/30 shadow-sm'
                : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <div className={`p-1.5 rounded-lg ${
                  activeTab === 'panduan-vitalitas' ? 'bg-indigo-600 text-white' : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                }`}>
                  <Activity className="w-4 h-4" />
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'panduan-vitalitas' ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                }`}>
                  {activeTab === 'panduan-vitalitas' ? '● Aktif' : '95 Butir'}
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                Tata Cara Vitalitas Bahasa
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                SOP 6 Ranah & Skala Daya Hidup
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
              <span>Status Keterancaman</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">Vitalitas</span>
            </div>
          </button>

          {/* Card 4: Tata Cara Kuesioner Revitalisasi Bahasa Daerah */}
          <button
            type="button"
            onClick={() => setActiveTab('panduan-revitalisasi')}
            className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group relative ${
              activeTab === 'panduan-revitalisasi'
                ? 'bg-teal-50/90 dark:bg-teal-950/60 border-teal-500 dark:border-teal-500 ring-2 ring-teal-500/30 shadow-sm'
                : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <div className={`p-1.5 rounded-lg ${
                  activeTab === 'panduan-revitalisasi' ? 'bg-teal-600 text-white' : 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300'
                }`}>
                  <Award className="w-4 h-4" />
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'panduan-revitalisasi' ? 'bg-teal-600 text-white shadow-2xs' : 'bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300'
                }`}>
                  {activeTab === 'panduan-revitalisasi' ? '● Aktif' : 'RAP & IKRBD'}
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                Tata Cara Revitalisasi Bahasa
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                SOP Rencana Aksi & Monev Pemda
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
              <span>Program Konservasi</span>
              <span className="font-semibold text-teal-600 dark:text-teal-400">Revitalisasi</span>
            </div>
          </button>

          {/* Card 5: Tata Cara Kuesioner Pemetaan Sastra Lisan */}
          <button
            type="button"
            onClick={() => setActiveTab('panduan-sastra-lisan')}
            className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group relative ${
              activeTab === 'panduan-sastra-lisan'
                ? 'bg-amber-50/90 dark:bg-amber-950/60 border-amber-500 dark:border-amber-500 ring-2 ring-amber-500/30 shadow-sm'
                : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <div className={`p-1.5 rounded-lg ${
                  activeTab === 'panduan-sastra-lisan' ? 'bg-amber-600 text-white' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                }`}>
                  <Scroll className="w-4 h-4" />
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'panduan-sastra-lisan' ? 'bg-amber-600 text-white shadow-2xs' : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                }`}>
                  {activeTab === 'panduan-sastra-lisan' ? '● Aktif' : 'Folklore & ATU'}
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                Tata Cara Sastra Lisan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                SOP Tradisi Tutur & Klasifikasi Genre
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
              <span>Filologi & Budaya</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">Sastra</span>
            </div>
          </button>

          {/* Card 4: Fitur Khusus Dialek & Peta */}
          <button
            type="button"
            onClick={() => setActiveTab('peta-dialek')}
            className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group relative ${
              activeTab === 'peta-dialek'
                ? 'bg-amber-50/90 dark:bg-amber-950/60 border-amber-500 dark:border-amber-500 ring-2 ring-amber-500/30 shadow-sm'
                : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <div className={`p-1.5 rounded-lg ${
                  activeTab === 'peta-dialek' ? 'bg-amber-600 text-white' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                }`}>
                  <Compass className="w-4 h-4" />
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'peta-dialek' ? 'bg-amber-600 text-white shadow-2xs' : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                }`}>
                  {activeTab === 'peta-dialek' ? '● Aktif' : 'Khusus GIS'}
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                Fitur Dialek & Peta
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                Leaflet GIS, Multi-Basemap & Isoglos
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
              <span>Geolinguistik</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">Spasial</span>
            </div>
          </button>

          {/* Card 4: Panduan Per Peran */}
          <button
            type="button"
            onClick={() => setActiveTab('peran')}
            className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group relative ${
              activeTab === 'peran'
                ? 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/30 shadow-sm'
                : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <div className={`p-1.5 rounded-lg ${
                  activeTab === 'peran' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                }`}>
                  <Users className="w-4 h-4" />
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'peran' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                }`}>
                  {activeTab === 'peran' ? '● Aktif' : '4 Peran'}
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                Panduan Per Peran
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                Hak Akses Surveyor, Validator, Admin
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
              <span>Manajemen Akun</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">RBAC</span>
            </div>
          </button>

          {/* Card 5: Rumus Dialektometri */}
          <button
            type="button"
            onClick={() => setActiveTab('dialektometri')}
            className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group relative ${
              activeTab === 'dialektometri'
                ? 'bg-purple-50/90 dark:bg-purple-950/60 border-purple-500 dark:border-purple-500 ring-2 ring-purple-500/30 shadow-sm'
                : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <div className={`p-1.5 rounded-lg ${
                  activeTab === 'dialektometri' ? 'bg-purple-600 text-white' : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                }`}>
                  <Calculator className="w-4 h-4" />
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'dialektometri' ? 'bg-purple-600 text-white shadow-2xs' : 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300'
                }`}>
                  {activeTab === 'dialektometri' ? '● Aktif' : 'Formula d%'}
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                Rumus Dialektometri
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                Jean Guiter & Simulator Interaktif
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
              <span>Kalkulasi Leksikal</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">Metrik</span>
            </div>
          </button>

          {/* Card 6: Daftar 16 Seksi */}
          <button
            type="button"
            onClick={() => setActiveTab('seksi16')}
            className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group relative ${
              activeTab === 'seksi16'
                ? 'bg-sky-50/90 dark:bg-sky-950/60 border-sky-500 dark:border-sky-500 ring-2 ring-sky-500/30 shadow-sm'
                : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <div className={`p-1.5 rounded-lg ${
                  activeTab === 'seksi16' ? 'bg-sky-600 text-white' : 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300'
                }`}>
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'seksi16' ? 'bg-sky-600 text-white shadow-2xs' : 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300'
                }`}>
                  {activeTab === 'seksi16' ? '● Aktif' : '16 Seksi'}
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                Daftar 16 Seksi
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                Kuesioner Baku Badan Bahasa
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
              <span>Formulir Lengkap</span>
              <span className="font-semibold text-sky-600 dark:text-sky-400">Modul</span>
            </div>
          </button>

          {/* Card 7: Tips Lapangan & FAQ */}
          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group relative ${
              activeTab === 'faq'
                ? 'bg-rose-50/90 dark:bg-rose-950/60 border-rose-500 dark:border-rose-500 ring-2 ring-rose-500/30 shadow-sm'
                : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <div className={`p-1.5 rounded-lg ${
                  activeTab === 'faq' ? 'bg-rose-600 text-white' : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                }`}>
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'faq' ? 'bg-rose-600 text-white shadow-2xs' : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                }`}>
                  {activeTab === 'faq' ? '● Aktif' : '10 FAQ'}
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                Tips Lapangan & FAQ
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                Solusi Offline 3T & Audio Informan
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
              <span>Pemecahan Masalah</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">Bantuan</span>
            </div>
          </button>

          {/* Card 8: Pusat Berkas & Dokumen */}
          <button
            type="button"
            onClick={() => setActiveTab('unduhan')}
            className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group relative ${
              activeTab === 'unduhan'
                ? 'bg-teal-50/90 dark:bg-teal-950/60 border-teal-500 dark:border-teal-500 ring-2 ring-teal-500/30 shadow-sm'
                : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <div className={`p-1.5 rounded-lg ${
                  activeTab === 'unduhan' ? 'bg-teal-600 text-white' : 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300'
                }`}>
                  <FolderDown className="w-4 h-4" />
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'unduhan' ? 'bg-teal-600 text-white shadow-2xs' : 'bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300'
                }`}>
                  {activeTab === 'unduhan' ? '● Aktif' : 'Arsip'}
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                Pusat Berkas & Dokumen
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                Unduh DOC, XLS, JSON, & PRD
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
              <span>Ekspor & Cetak</span>
              <span className="font-semibold text-teal-600 dark:text-teal-400">Berkas</span>
            </div>
          </button>
        </div>
      </div>

      {/* TAB 0: TAMPILAN BENTO GRID LENGKAP DOKUMENTASI SELURUH FITUR APLIKASI */}
      {activeTab === 'bento' && (
        <BentoDocumentationGrid
          onNavigateToView={onNavigateToView}
          onOpenPRDModal={onOpenPRDModal}
          onLoadSample={onLoadSample}
          onCreateNew={onCreateNew}
          onOpenExport={onOpenExport}
          onSelectDocTab={(tab) => setActiveTab(tab)}
        />
      )}

      {/* TAB 1: ALUR KERJA & TATA CARA PENGGUNAAN (USER FLOW) */}
      {activeTab === 'alur' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0a0a0a] dark:text-white">
                Tata Cara Penggunaan Aplikasi (Alur Kerja Bertahap)
              </h2>
              <p className="text-xs text-[#737373] dark:text-slate-400 mt-0.5">
                Ikuti 8 langkah kerja di bawah ini untuk mengumpulkan, menganalisis, dan memvalidasi data geolinguistik secara optimal.
              </p>
            </div>
            <span className="hidden sm:inline-block text-xs text-[#737373] dark:text-slate-400">
              Total {filteredSteps.length} Langkah Terpandu
            </span>
          </div>

          <div className="space-y-3.5">
            {filteredSteps.map((step) => (
              <div 
                key={step.number}
                className="bg-white dark:bg-slate-900 border border-[#e5e5e5] dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs transition-all hover:border-blue-300 dark:hover:border-blue-800"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[#1447e6] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      {step.number}
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-[#0a0a0a] dark:text-white">
                          {step.title}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-[#1447e6] dark:text-blue-300 font-semibold border border-blue-100 dark:border-blue-900/40">
                          {step.category}
                        </span>
                        <span className="text-xs text-[#737373] dark:text-slate-400">
                          · {step.duration}
                        </span>
                      </div>
                      <p className="text-xs text-[#737373] dark:text-slate-300 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Direct Action Link */}
                  <div className="self-start sm:self-auto shrink-0 print:hidden">
                    <button
                      type="button"
                      onClick={() => onNavigateToView(step.actionView)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1447e6] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-900/40 transition-colors cursor-pointer"
                    >
                      <span>{step.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Instruction Bullets */}
                <div className="mt-3.5 pt-3 border-t border-[#f5f5f5] dark:border-slate-800/80">
                  <ul className="space-y-1.5 text-xs text-[#0a0a0a] dark:text-slate-300">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                        <span className="leading-relaxed">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB KHUSUS 1: TATA CARA ALUR PENGISIAN KUESIONER VITALITAS BAHASA */}
      {activeTab === 'panduan-vitalitas' && (
        <PanduanKuesionerKhususSection
          onNavigateToView={onNavigateToView}
          onOpenPRDModal={onOpenPRDModal}
          onOpenExport={onOpenExport}
          focusedInstrument="vitalitas"
        />
      )}

      {/* TAB KHUSUS 2: TATA CARA ALUR PENGISIAN KUESIONER REVITALISASI BAHASA DAERAH */}
      {activeTab === 'panduan-revitalisasi' && (
        <PanduanKuesionerKhususSection
          onNavigateToView={onNavigateToView}
          onOpenPRDModal={onOpenPRDModal}
          onOpenExport={onOpenExport}
          focusedInstrument="revitalisasi"
        />
      )}

      {/* TAB KHUSUS 3: TATA CARA ALUR PENGISIAN KUESIONER PEMETAAN SASTRA LISAN */}
      {activeTab === 'panduan-sastra-lisan' && (
        <PanduanKuesionerKhususSection
          onNavigateToView={onNavigateToView}
          onOpenPRDModal={onOpenPRDModal}
          onOpenExport={onOpenExport}
          focusedInstrument="sastra-lisan"
        />
      )}

      {/* TAB 2 (KHUSUS): DOKUMENTASI LENGKAP FITUR KHUSUS DIALEK & PETA (GIS GEOLINGUISTIK) */}
      {activeTab === 'peta-dialek' && (
        <div className="space-y-6">
          {/* Hero Banner Fitur Dialek & Peta */}
          <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-white dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900 border border-blue-200 dark:border-blue-900/60 rounded-xl p-5 sm:p-6 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="font-bold text-[#1447e6] dark:text-blue-400 uppercase tracking-wider bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded">
                    Spesialisasi Geolinguistik & GIS
                  </span>
                  <span className="text-[#737373] dark:text-slate-400">·</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Metodologi Jean Guiter (1973)</span>
                  <span className="text-[#737373] dark:text-slate-400">·</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Peta Spasial Leaflet</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#0a0a0a] dark:text-white tracking-tight">
                  Dokumentasi Fitur Khusus Menu Dialek & Peta (Geolinguistik Terkomputasi)
                </h2>
                <p className="text-xs sm:text-sm text-[#737373] dark:text-slate-300 leading-relaxed">
                  Panduan komprehensif arsitektur geospasial, algoritma penarikan garis isoglos otomatis,
                  matriks segitiga dialektometri, serta integrasi 700+ bahasa Nusantara dari Glottolog & Vitalitas EGIDS.
                </p>
              </div>

              {/* Action Buttons to Modules */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <button
                  type="button"
                  onClick={() => onNavigateToView('peta-survei')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-[#1447e6] hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Buka Peta Isoglos</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateToView('dialektometri')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
                >
                  <TableProperties className="w-3.5 h-3.5 text-blue-600" />
                  <span>Buka Matriks Dialek</span>
                </button>
                <a
                  href="/docs/PANDUAN_FITUR_DIALEK_DAN_PETA.doc"
                  download="PANDUAN_FITUR_DIALEK_DAN_PETA.doc"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 shadow-2xs transition-colors cursor-pointer"
                  title="Unduh berkas dokumen Microsoft Word (.doc) lengkap"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Panduan (.DOC)</span>
                </a>
              </div>
            </div>
          </div>

          {/* INTERACTIVE SIMULATOR DIALEKTOMETRI JEAN GUITER */}
          <div className="bg-white dark:bg-slate-900 border border-[#e5e5e5] dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#e5e5e5] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-[#1447e6] dark:text-blue-400 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0a0a0a] dark:text-white">
                    Simulator Interaktif Formula Jean Guiter
                  </h3>
                  <p className="text-[11px] text-[#737373] dark:text-slate-400">
                    Ubah nilai selisih perbedaan kata (s) dan total glos pembanding (n) untuk melihat klasifikasi otomatis real-time.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded border border-blue-200 dark:border-blue-900">
                Formula: d = (s / n) × 100%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">
                      Jumlah Perbedaan Kata (s): <strong className="text-blue-600 dark:text-blue-400 font-mono text-sm">{simS}</strong> kata
                    </span>
                    <span className="text-[11px] text-slate-500">Maks. {simN}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={simN}
                    value={simS}
                    onChange={(e) => setSimS(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>0 (Identik)</span>
                    <span>{Math.round(simN * 0.2)} (20%)</span>
                    <span>{Math.round(simN * 0.5)} (50%)</span>
                    <span>{Math.round(simN * 0.8)} (80%)</span>
                    <span>{simN} (100%)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Total Glos Konsep Diperbandingkan (n):
                  </label>
                  <div className="flex gap-2">
                    {[50, 100, 200].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          setSimN(val);
                          if (simS > val) setSimS(val);
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          simN === val
                            ? 'bg-[#1447e6] text-white border-[#1447e6]'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {val} Glos {val === 200 ? '(Standar Swadesh)' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Output Box */}
              <div className={`p-4 rounded-xl border ${simStatus.color} space-y-3`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold tracking-wider">Hasil Kalkulasi Dialektometri:</span>
                  <span className="text-xs font-mono font-bold">
                    {simS} / {simN}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight">
                    {simD}%
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full text-white font-bold ${simStatus.badgeBg}`}>
                    {simStatus.label}
                  </span>
                </div>

                {/* Progress bar visual */}
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${simStatus.barColor}`} 
                    style={{ width: `${Math.min(100, simD)}%` }}
                  />
                </div>

                <div className="pt-2 border-t border-current/20 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <span>Rekomendasi Garis Isoglos:</span>
                    <span className="underline underline-offset-2">{simStatus.isogloss}</span>
                  </div>
                  <p className="opacity-90 leading-relaxed text-[11px]">
                    {simStatus.desc}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 6 FITUR UTAMA PETA & DIALEKTOMETRI GRID */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#0a0a0a] dark:text-white flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-blue-600" />
              <span>Rincian Fitur-Fitur Khusus Peta Virtual Isoglos (Leaflet GIS)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* Fitur 1: Algoritma Garis Pembagi Tegak Lurus */}
              <div className="bg-white dark:bg-slate-900 border border-[#e5e5e5] dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-2 hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#0a0a0a] dark:text-white">
                    Garis Pembagi Tegak Lurus (Bisector)
                  </h4>
                </div>
                <p className="text-xs text-[#737373] dark:text-slate-300 leading-relaxed">
                  Menghilangkan subjektivitas penarikan garis isoglos. Sistem menghitung titik tengah spasial
                  (midpoint) lintang & bujur antara dua desa, lalu menarik segmen garis ortogonal terproyeksi
                  dengan bentang 25–40 km di antara pasangan titik yang memiliki perbedaan leksikal.
                </p>
                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-mono bg-blue-50 dark:bg-blue-950/60 p-1.5 rounded">
                  computePerpendicularBisector(lat1, lng1, lat2, lng2)
                </div>
              </div>

              {/* Fitur 2: Convex Hull Poligon Teritori */}
              <div className="bg-white dark:bg-slate-900 border border-[#e5e5e5] dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-2 hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#0a0a0a] dark:text-white">
                    Selubung Poligon Teritori (Convex Hull)
                  </h4>
                </div>
                <p className="text-xs text-[#737373] dark:text-slate-300 leading-relaxed">
                  Menerapkan <em>Monotone Chain 2D Algorithm</em> untuk mengelilingi seluruh titik desa yang berbagi
                  bentuk kata yang sama. Wilayah diarsir transparan dengan palet tematik 10 warna,
                  sehingga kantong-kantong varian dialek langsung tampak kontras di atas peta.
                </p>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-950/60 p-1.5 rounded">
                  getConvexHull(points) · O(N log N)
                </div>
              </div>

              {/* Fitur 3: Tiga Mode Visualisasi Peta */}
              <div className="bg-white dark:bg-slate-900 border border-[#e5e5e5] dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-2 hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#0a0a0a] dark:text-white">
                    3 Mode Visualisasi Geolinguistik
                  </h4>
                </div>
                <p className="text-xs text-[#737373] dark:text-slate-300 leading-relaxed">
                  <strong>Kata Terpilih</strong>: Analisis mikro per kata Swadesh 1–200.<br />
                  <strong>Berkas Global</strong>: Akumulasi garis pemisah; ketebalan garis mencerminkan bobot akumulasi perbedaan (*bundling*).<br />
                  <strong>Jaringan Kesamaan</strong>: Garis relasi titik yang memiliki kata identik.
                </p>
                <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/60 p-1.5 rounded">
                  Pilihan Mode: Kata Terpilih | Berkas Global | Jaringan
                </div>
              </div>

              {/* Fitur 4: Tur Otomatis & Pemutar Audio */}
              <div className="bg-white dark:bg-slate-900 border border-[#e5e5e5] dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-2 hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#0a0a0a] dark:text-white">
                    Tur Otomatis & Sintesis Audio Fonetis
                  </h4>
                </div>
                <p className="text-xs text-[#737373] dark:text-slate-300 leading-relaxed">
                  Tombol <strong>"Putar Tur (Auto-Play)"</strong> menjalankan simulasi perpindahan kata Swadesh 1–200 secara otomatis per interval 2.5 detik untuk presentasi ilmiah. Setiap titik pengamatan memiliki tombol audio pemutar suara asli informan atau sintesis fonetis Web Speech API.
                </p>
                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/60 p-1.5 rounded">
                  Play / Pause Auto-Tour & Web Audio Player
                </div>
              </div>

              {/* Fitur 5: Drawer Analisis Pasangan TP */}
              <div className="bg-white dark:bg-slate-900 border border-[#e5e5e5] dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-2 hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs">
                    5
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#0a0a0a] dark:text-white">
                    Drawer Analisis Pasangan Titik
                  </h4>
                </div>
                <p className="text-xs text-[#737373] dark:text-slate-300 leading-relaxed">
                  Mengklik garis isoglos di antara dua desa membuka panel samping interaktif berisi:
                  jarak spasial garis lurus dalam kilometer (km), persentase perbedaan Guiter (d%),
                  daftar kosakata yang sama, dan perbandingan bentuk kata yang berbeda.
                </p>
                <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/60 p-1.5 rounded">
                  Klik Garis Isoglos → Bedah Selisih Kata & Jarak km
                </div>
              </div>

              {/* Fitur 6: Multi-Basemap Kartografi */}
              <div className="bg-white dark:bg-slate-900 border border-[#e5e5e5] dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-2 hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
                    6
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#0a0a0a] dark:text-white">
                    Multi-Basemap & Lapisan Kartografi
                  </h4>
                </div>
                <p className="text-xs text-[#737373] dark:text-slate-300 leading-relaxed">
                  Mendukung 4 gaya peta dasar (Carto Light untuk publikasi cetak bersih, Carto Dark untuk proyektor, OpenStreetMap untuk detail jalan, dan Topografi untuk memeriksa bentang alam pegunungan/sungai yang menjadi rintangan alami dialek).
                </p>
                <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-950/60 p-1.5 rounded">
                  Carto Light · Dark · OSM · Topografi
                </div>
              </div>
            </div>
          </div>

          {/* TABEL PERBANDINGAN KLASIFIKASI & MATRIKS SEGITIGA */}
          <div className="bg-white dark:bg-slate-900 border border-[#e5e5e5] dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
            <div className="px-5 py-3.5 border-b border-[#e5e5e5] dark:border-slate-800 bg-[#fafafa] dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-[#0a0a0a] dark:text-white">
                  Tabel Baku Skala Signifikansi Dialektometri (Jean Guiter, 1973)
                </h3>
                <p className="text-[11px] text-[#737373] dark:text-slate-400">
                  Pedoman penetapan status hubungan kebahasaan dan penarikan garis isoglos di lapangan.
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-semibold">
                Standar Badan Bahasa & UNESCO
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f5f5f5] dark:bg-slate-800/80 text-[#737373] dark:text-slate-400 border-b border-[#e5e5e5] dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Rentang Indeks (d)</th>
                    <th className="py-2.5 px-4 font-semibold">Klasifikasi Status</th>
                    <th className="py-2.5 px-4 font-semibold">Derajat Saling Memahami</th>
                    <th className="py-2.5 px-4 font-semibold">Visualisasi Garis Isoglos</th>
                    <th className="py-2.5 px-4 font-semibold">Contoh Kasus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5] dark:divide-slate-800 text-[#0a0a0a] dark:text-slate-300">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">0% – 20%</td>
                    <td className="py-3 px-4 font-semibold">Dialek Sama (Homogen)</td>
                    <td className="py-3 px-4 text-[#737373] dark:text-slate-400">100% Saling Memahami</td>
                    <td className="py-3 px-4 text-slate-400">Tidak ditarik garis isoglos</td>
                    <td className="py-3 px-4 text-[#737373] dark:text-slate-400">Dua desa berdampingan di Sukabumi Selatan</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">21% – 30%</td>
                    <td className="py-3 px-4 font-semibold">Beda Wicara / Subdialek</td>
                    <td className="py-3 px-4 text-[#737373] dark:text-slate-400">&gt; 90% (Sangat Lancar)</td>
                    <td className="py-3 px-4 text-blue-600 dark:text-blue-400 font-semibold">Garis putus-putus tipis (Lemah)</td>
                    <td className="py-3 px-4 text-[#737373] dark:text-slate-400">Sunda Priangan vs Sunda Pantura</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">31% – 50%</td>
                    <td className="py-3 px-4 font-semibold">Beda Dialek (Dialect)</td>
                    <td className="py-3 px-4 text-[#737373] dark:text-slate-400">70% – 85% (Sebagian Paham)</td>
                    <td className="py-3 px-4 text-amber-600 dark:text-amber-400 font-semibold">Garis solid tegas berkelanjutan</td>
                    <td className="py-3 px-4 text-[#737373] dark:text-slate-400">Sunda Priangan vs Sunda Banten</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">51% – 80%</td>
                    <td className="py-3 px-4 font-semibold">Beda Bahasa (Language)</td>
                    <td className="py-3 px-4 text-[#737373] dark:text-slate-400">&lt; 50% (Hambatan Signifikan)</td>
                    <td className="py-3 px-4 text-rose-600 dark:text-rose-400 font-semibold">Garis batas bahasa ganda</td>
                    <td className="py-3 px-4 text-[#737373] dark:text-slate-400">Bahasa Sunda vs Bahasa Jawa Banyumasan</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">&gt; 80%</td>
                    <td className="py-3 px-4 font-semibold">Beda Rumpun / Subkeluarga</td>
                    <td className="py-3 px-4 text-[#737373] dark:text-slate-400">0% (Tidak Saling Paham)</td>
                    <td className="py-3 px-4 text-purple-600 dark:text-purple-400 font-semibold">Garis batas rumpun tebal</td>
                    <td className="py-3 px-4 text-[#737373] dark:text-slate-400">Austronesia vs Papua (Trans-New Guinea)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FITUR KOMPARASI DUA SURVEI BERDAMPINGAN & MANUAL OVERRIDE */}
          <div className="bg-white dark:bg-slate-900 border border-[#e5e5e5] dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <TableProperties className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-[#0a0a0a] dark:text-white">
                Komparasi Survei Berdampingan (Side-by-Side) & Manual Override
              </h3>
            </div>

            <p className="text-xs text-[#737373] dark:text-slate-300 leading-relaxed">
              Pada menu <strong>Komparasi & Dialektometri</strong>, peneliti dapat memperbandingkan dua survei lapangan aktif langsung baris-per-baris untuk 200 kosakata Swadesh. Sistem mengklasifikasikan pasangan kata ke dalam 4 kategori dengan penanda warna:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">IDENTICAL (Hijau)</span>
                <span className="text-[11px] text-slate-600 dark:text-slate-300">Bentuk kata dan ejaan identik persis (kognat 100%).</span>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-lg border border-amber-200 dark:border-amber-800">
                <span className="font-bold text-amber-700 dark:text-amber-400 block mb-0.5">PHONOLOGICAL (Kuning)</span>
                <span className="text-[11px] text-slate-600 dark:text-slate-300">Akar kognat sama, dengan pergeseran bunyi teratur (misal: r/l, vokal akhir).</span>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 rounded-lg border border-rose-200 dark:border-rose-800">
                <span className="font-bold text-rose-700 dark:text-rose-400 block mb-0.5">LEXICAL (Merah)</span>
                <span className="text-[11px] text-slate-600 dark:text-slate-300">Akar kata berbeda sama sekali (etimologi terpisah).</span>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">MANUAL OVERRIDE</span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">Linguis dapat menimpa hasil otomatis dan menambahkan catatan etimologi.</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PANDUAN PENGGUNA & USER FLOW LENGKAP: 12 MODUL BENTO DIALEKTOMETRI */}
          {/* ========================================================================= */}
          <div className="bg-white dark:bg-slate-900 border border-[#e5e5e5] dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-2xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#e5e5e5] dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                    Panduan Pengguna & User Flow
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-600 dark:text-slate-400 font-medium">12 Modul Seksi 16</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Metodologi Standar Guiter (1973)</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#0a0a0a] dark:text-white">
                  Panduan Operasional & Diagram Alur Kerja (12 Modul Visualisasi Dialek)
                </h3>
                <p className="text-xs text-[#737373] dark:text-slate-300 leading-relaxed max-w-3xl">
                  Setiap instrumen pada 12 Modul Analisis dirancang khusus untuk menjawab pertanyaan riset dialektologi yang spesifik: mulai dari pembuktian spasial garis isoglos, korelasi jarak kilometer fisik, hingga silsilah filogenetik dan kedalaman waktu pemisahan bahasa purba.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onNavigateToView('dialektometri')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs transition-colors cursor-pointer"
                >
                  <Workflow className="w-3.5 h-3.5" />
                  <span>Buka 12 Modul Analisis</span>
                </button>
              </div>
            </div>

            {/* DIAGRAM USER FLOW 6 FASE OPERASIONAL */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                  <Workflow className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[#0a0a0a] dark:text-white">
                  Diagram Alur Kerja Terintegrasi (User Flow 6 Fase)
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                {/* Fase 1 */}
                <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider text-[10px] bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                      Fase 1 · Prasyarat
                    </span>
                    <span className="font-mono text-slate-400 font-bold">Langkah 01</span>
                  </div>
                  <strong className="block font-bold text-slate-900 dark:text-white text-xs">
                    Georeferensi & Titik Koordinat GPS
                  </strong>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    Pastikan titik pengamatan acuan pada Seksi 1 dan situasi geografis pada Seksi 3 telah memiliki koordinat GPS presisi (Latitude & Longitude).
                  </p>
                  <div className="pt-2 border-t border-blue-200/60 dark:border-blue-900/40 text-[10px] text-blue-800 dark:text-blue-300 font-medium">
                    Output: Titik siap diproyeksikan pada Modul 1 (Peta Tematik) & Modul 11 (Kalkulator).
                  </div>
                </div>

                {/* Fase 2 */}
                <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider text-[10px] bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                      Fase 2 · Korpus
                    </span>
                    <span className="font-mono text-slate-400 font-bold">Langkah 02</span>
                  </div>
                  <strong className="block font-bold text-slate-900 dark:text-white text-xs">
                    Pengisian 200 Kosakata Swadesh
                  </strong>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    Lengkapi korpus 200 kosakata Swadesh dan transkripsi fonetis IPA pada Seksi 15 untuk desa acuan dan desa pembanding mitra.
                  </p>
                  <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40 text-[10px] text-emerald-800 dark:text-emerald-300 font-medium">
                    Output: Matriks pasangan kata siap dikomparasi di Modul 9 (Side-by-Side).
                  </div>
                </div>

                {/* Fase 3 */}
                <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider text-[10px] bg-indigo-100 dark:bg-indigo-950 px-1.5 py-0.5 rounded">
                      Fase 3 · Komputasi
                    </span>
                    <span className="font-mono text-slate-400 font-bold">Langkah 03</span>
                  </div>
                  <strong className="block font-bold text-slate-900 dark:text-white text-xs">
                    Kalkulasi Otomatis Indeks Guiter
                  </strong>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    Klik tombol "Hitung Ulang Indeks Otomatis" di Modul 11 (Tabel & Kalkulator) untuk menghitung beda leksikal (s), glos (n), dan persentase d%.
                  </p>
                  <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-900/40 text-[10px] text-indigo-800 dark:text-indigo-300 font-medium">
                    Output: Nilai d% tersinkronisasi ke seluruh 11 modul visual lainnya secara serentak.
                  </div>
                </div>

                {/* Fase 4 */}
                <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider text-[10px] bg-purple-100 dark:bg-purple-950 px-1.5 py-0.5 rounded">
                      Fase 4 · Rekonstruksi
                    </span>
                    <span className="font-mono text-slate-400 font-bold">Langkah 04</span>
                  </div>
                  <strong className="block font-bold text-slate-900 dark:text-white text-xs">
                    Analisis Garis Isoglos & Gradasi Spasial
                  </strong>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    Buka Modul 2 (Isoglos Otomatis) untuk melihat garis pembagi ortogonal dan Modul 4 (Heatmap Spasial) untuk menganalisis kontur bentang alam.
                  </p>
                  <div className="pt-2 border-t border-purple-200/60 dark:border-purple-900/40 text-[10px] text-purple-800 dark:text-purple-300 font-medium">
                    Output: Deteksi berkas isoglos tebal yang memisahkan subdialek atau bahasa.
                  </div>
                </div>

                {/* Fase 5 */}
                <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider text-[10px] bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded">
                      Fase 5 · Taksonomi
                    </span>
                    <span className="font-mono text-slate-400 font-bold">Langkah 05</span>
                  </div>
                  <strong className="block font-bold text-slate-900 dark:text-white text-xs">
                    Dendrogram UPGMA & Pohon Filogenetik
                  </strong>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    Gunakan Modul 5 (Klaster D3), Modul 6 (Pohon Filogenetik), dan Modul 12 (Glotokronologi) untuk merekonstruksi taksonomi rumpun dan tarikh pisah historis.
                  </p>
                  <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40 text-[10px] text-amber-800 dark:text-amber-300 font-medium">
                    Output: Silsilah kekerabatan berbobot waktu pisah (time depth Swadesh).
                  </div>
                </div>

                {/* Fase 6 */}
                <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider text-[10px] bg-rose-100 dark:bg-rose-950 px-1.5 py-0.5 rounded">
                      Fase 6 · Publikasi
                    </span>
                    <span className="font-mono text-slate-400 font-bold">Langkah 06</span>
                  </div>
                  <strong className="block font-bold text-slate-900 dark:text-white text-xs">
                    Klasifikasi Baku & Ekspor Laporan Riset
                  </strong>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    Periksa status akhir di Modul 8 (Standar Badan Bahasa) dan verifikasi model IBD di Modul 7 (Scatter Plot). Ekspor ke berkas Word (.doc), PDF, atau Excel.
                  </p>
                  <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/40 text-[10px] text-rose-800 dark:text-rose-300 font-medium">
                    Output: Naskah laporan ilmiah monograf dialektologi siap terbit.
                  </div>
                </div>
              </div>
            </div>

            {/* TABEL KATALOG & PANDUAN PENGGUNAAN 12 MODUL BENTO */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                    <Layers2 className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#0a0a0a] dark:text-white">
                    Katalog Lengkap & Spesifikasi 12 Modul Analisis
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  12 Instrumen Visualisasi & Analisis Dialek
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {/* Modul 1 */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-800 transition-colors shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                        <Compass className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">1. Peta Tematik Leksikal</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                      Spasial
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    <strong>Fungsi:</strong> WebGIS interaktif menampilkan sebaran titik GPS, lingkaran radius pengaruh tutur, dan marker pop-up data desa.
                  </p>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                    <div><strong>Input:</strong> GPS Lat/Lng Seksi 1 & 3</div>
                    <div><strong>Metode:</strong> Leaflet WGS84 & Radius Geolinguistik</div>
                  </div>
                </div>

                {/* Modul 2 */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        <Split className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">2. Isoglos Otomatis</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                      Otomatis
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    <strong>Fungsi:</strong> Menarik garis bagi tegak lurus (perpendicular bisector) matematis dan berkas isoglos berbobot selisih kata Swadesh.
                  </p>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                    <div><strong>Input:</strong> Pasangan titik & selisih kata</div>
                    <div><strong>Metode:</strong> Midpoint Orthogonal Bisector Guiter</div>
                  </div>
                </div>

                {/* Modul 3 */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        <RadarIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">3. Matriks Heat-Map & Radar</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                      Korelasi
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    <strong>Fungsi:</strong> Matriks segitiga lengkap korelasi dialektometri berkode warna dan jaring radar perbandingan arah mata angin.
                  </p>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                    <div><strong>Input:</strong> Matriks selisih seluruh pasangan titik</div>
                    <div><strong>Metode:</strong> Simetrik Triangulasi & Radar Polar</div>
                  </div>
                </div>

                {/* Modul 4 */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-rose-300 dark:hover:border-rose-800 transition-colors shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">4. Heatmap Dialek Spasial</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                      Gradasi
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    <strong>Fungsi:</strong> Interpolasi kontur gradasi warna spasial bentang alam untuk memetakan zona transisi dialek vs batas terputus.
                  </p>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                    <div><strong>Input:</strong> Koordinat & persentase d% acuan</div>
                    <div><strong>Metode:</strong> Inverse Distance Weighting (IDW)</div>
                  </div>
                </div>

                {/* Modul 5 */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-300 dark:hover:border-purple-800 transition-colors shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                        <CircleDot className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">5. Klaster & Radar D3</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                      D3.js
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    <strong>Fungsi:</strong> Dendrogram klaster hirarkis interaktif D3.js dengan algoritma UPGMA untuk membagi rumpun subdialek secara objektif.
                  </p>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                    <div><strong>Input:</strong> Matriks jarak leksikal dialektometri</div>
                    <div><strong>Metode:</strong> UPGMA Agglomerative Clustering</div>
                  </div>
                </div>

                {/* Modul 6 */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        <TreePine className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">6. Pohon Filogenetik</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                      Filogeni
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    <strong>Fungsi:</strong> Rekonstruksi silsilah kekerabatan dialek berakar dengan estimasi tarikh pisah historis dan abad evolusi bahasa.
                  </p>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                    <div><strong>Input:</strong> Data kognat & retensi leksikal</div>
                    <div><strong>Metode:</strong> Filogenetika Komparatif D3 Tree</div>
                  </div>
                </div>

                {/* Modul 7 */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                        <BarChart3 className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">7. Grafik & Scatter Plot</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      Recharts
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    <strong>Fungsi:</strong> Verifikasi model Isolasi karena Jarak (IBD) melalui diagram pencar regresi linier jarak fisik (km) vs beda (d%).
                  </p>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                    <div><strong>Input:</strong> Jarak haversine km & indeks d%</div>
                    <div><strong>Metode:</strong> Regresi Linier Pearson (R²)</div>
                  </div>
                </div>

                {/* Modul 8 */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-300 dark:hover:border-amber-800 transition-colors shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                        <GitBranch className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">8. Klasifikasi Kekerabatan</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      Badan Bahasa
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    <strong>Fungsi:</strong> Penetapan status kebahasaan otomatis ke dalam 5 kategori baku (Beda Wicara s.d. Beda Subkeluarga) dan narasi ilmiah.
                  </p>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                    <div><strong>Input:</strong> Persentase beda dialektometri d%</div>
                    <div><strong>Metode:</strong> Skala Signifikansi Guiter & Keraf</div>
                  </div>
                </div>

                {/* Modul 9 */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-cyan-300 dark:hover:border-cyan-800 transition-colors shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">9. Perbandingan Dua Titik</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300">
                      Side-by-Side
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    <strong>Fungsi:</strong> Komparasi mikro 200 glos Swadesh secara berdampingan dengan pemutar audio informan untuk menguji butir isoglos.
                  </p>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                    <div><strong>Input:</strong> 200 kosakata desa acuan vs pembanding</div>
                    <div><strong>Metode:</strong> Analisis Pasangan Minimal Swadesh</div>
                  </div>
                </div>

                {/* Modul 10 */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-300 dark:hover:border-sky-800 transition-colors shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">10. Peta Isoglos Skematis</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300">
                      SVG Vektor
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    <strong>Fungsi:</strong> Diagram topologi murni berkas garis isoglos vektor tanpa distorsi peta bumi berdasar Teori Gelombang Johannes Schmidt.
                  </p>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                    <div><strong>Input:</strong> Titik ketetanggaan spasial & isoglos</div>
                    <div><strong>Metode:</strong> Kartografi Topologis Teori Gelombang</div>
                  </div>
                </div>

                {/* Modul 11 */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-700 transition-colors shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        <Calculator className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">11. Tabel & Kalkulator</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
                      Entri Data
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    <strong>Fungsi:</strong> Pusat input titik pembanding, modifikasi nilai beda (s) dan total glos (n), serta sinkronisasi otomatis antar-survei.
                  </p>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                    <div><strong>Input:</strong> Nama desa, koordinat, nilai s & n</div>
                    <div><strong>Metode:</strong> Formula Guiter d = (s/n)×100%</div>
                  </div>
                </div>

                {/* Modul 12 */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-300 dark:hover:border-amber-800 transition-colors shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                        <Hourglass className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">12. Glotokronologi</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300">
                      Swadesh
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    <strong>Fungsi:</strong> Menghitung estimasi kedalaman waktu pisah (time depth) dengan formula t = ln(C)/(2ln(r)) dan konstanta retensi r = 0.805.
                  </p>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                    <div><strong>Input:</strong> Persentase kognat berpasangan (C)</div>
                    <div><strong>Metode:</strong> Leksikostatistik Maurice Swadesh (1952)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* MATRIKS PERANAN (ROLE RESPONSIBILITY) */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-[#0a0a0a] dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Matriks Tanggung Jawab Peran Terhadap 12 Modul Analisis</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                  <div className="font-bold text-blue-600 dark:text-blue-400">1. Surveyor Lapangan</div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    Fokus pada <strong>Modul 1</strong> (validasi GPS di peta), <strong>Modul 9</strong> (rekaman audio Swadesh), dan <strong>Modul 11</strong> (pencatatan titik desa tetangga).
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">2. Verifikator Linguistik</div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    Fokus pada <strong>Modul 9</strong> (verifikasi kognat vs fonologis), <strong>Modul 11</strong> (perhitungan indeks s dan n), dan <strong>Modul 3</strong> (matriks korelasi).
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                  <div className="font-bold text-indigo-600 dark:text-indigo-400">3. Linguis Dialektolog</div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    Fokus pada <strong>Modul 2</strong> (isoglos bisector), <strong>Modul 4</strong> (heatmap transisi), <strong>Modul 5</strong> (dendrogram UPGMA), dan <strong>Modul 8</strong> (klasifikasi resmi).
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                  <div className="font-bold text-amber-600 dark:text-amber-400">4. Supervisor / Peneliti Utama</div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    Fokus pada <strong>Modul 6</strong> (filogenetik), <strong>Modul 7</strong> (scatter plot IBD), <strong>Modul 10</strong> (publikasi SVG skematis), dan <strong>Modul 12</strong> (glotokronologi).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PANDUAN PER PERAN (RBAC) */}
      {activeTab === 'peran' && (
        <div className="space-y-5">
          <div>
            <h2 className="text-base font-bold text-[#0a0a0a] dark:text-white">
              Panduan Operasional Berdasarkan Hak Akses & Peran (RBAC)
            </h2>
            <p className="text-xs text-[#737373] dark:text-slate-400 mt-0.5">
              Pilih peran Anda untuk membaca petunjuk kerja spesifik dan tanggung jawab di sistem.
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 print:hidden">
            {[
              { id: 'surveyor', label: 'Surveyor Lapangan', desc: 'Petugas Pengumpul Data', icon: Compass },
              { id: 'verifikator', label: 'Verifikator Linguistik', desc: 'Peneliti & Kurator Senior', icon: ShieldCheck },
              { id: 'admin', label: 'Admin Sistem', desc: 'Koordinator Riset Balai', icon: Users },
              { id: 'viewer', label: 'Tamu / Akademisi', desc: 'Mode Hanya-Baca', icon: BookOpen }
            ].map(r => {
              const Icon = r.icon;
              const isActive = activeRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActiveRole(r.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50/80 dark:bg-blue-950/50 border-[#1447e6] dark:border-blue-500 shadow-2xs'
                      : 'bg-white dark:bg-slate-900 border-[#e5e5e5] dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1.5 ${isActive ? 'text-[#1447e6] dark:text-blue-400' : 'text-[#737373]'}`} />
                  <div className="font-bold text-xs text-[#0a0a0a] dark:text-white">{r.label}</div>
                  <div className="text-[10px] text-[#737373] dark:text-slate-400 mt-0.5">{r.desc}</div>
                </button>
              );
            })}
          </div>

          {/* Role Detailed Content */}
          <div className="bg-white dark:bg-slate-900 border border-[#e5e5e5] dark:border-slate-800 rounded-xl p-5 shadow-2xs">
            {activeRole === 'surveyor' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950 text-[#1447e6] flex items-center justify-center font-bold">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#0a0a0a] dark:text-white">
                      Protokol & Tata Cara Surveyor Lapangan
                    </h3>
                    <p className="text-xs text-[#737373] dark:text-slate-400">
                      Pedoman pengumpulan data di titik pengamatan (desa lokasi survei)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-[#fafafa] dark:bg-slate-800/60 rounded-lg border border-[#e5e5e5] dark:border-slate-700/60 space-y-2">
                    <div className="font-bold text-[#0a0a0a] dark:text-slate-200 flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span>1. Persiapan Pra-Lapangan</span>
                    </div>
                    <ul className="space-y-1 text-[#737373] dark:text-slate-300 list-disc list-inside">
                      <li>Buka aplikasi di peramban saat masih ada koneksi internet agar PWA tercache sempurna.</li>
                      <li>Pasang PWA ke layar utama ponsel melalui tombol "Pasang Aplikasi" di navbar atau sidebar.</li>
                      <li>Pastikan baterai perangkat penuh dan izin akses mikrofon peramban telah diaktifkan.</li>
                    </ul>
                  </div>

                  <div className="p-3.5 bg-[#fafafa] dark:bg-slate-800/60 rounded-lg border border-[#e5e5e5] dark:border-slate-700/60 space-y-2">
                    <div className="font-bold text-[#0a0a0a] dark:text-slate-200 flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span>2. Etika Triangulasi Informan (Seksi 14)</span>
                    </div>
                    <ul className="space-y-1 text-[#737373] dark:text-slate-300 list-disc list-inside">
                      <li>Wawancarai minimal 3 narasumber penutur asli yang lahir dan menetap di desa tersebut.</li>
                      <li>Pilih informan dari rentang usia berbeda untuk membandingkan variasi tutur antargenerasi.</li>
                      <li>Catat bahasa ibu dan bahasa kedua yang dikuasai untuk menghindari interferensi bahasa.</li>
                    </ul>
                  </div>

                  <div className="p-3.5 bg-[#fafafa] dark:bg-slate-800/60 rounded-lg border border-[#e5e5e5] dark:border-slate-700/60 space-y-2">
                    <div className="font-bold text-[#0a0a0a] dark:text-slate-200 flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span>3. Perekaman Audio Kosakata (Seksi 15)</span>
                    </div>
                    <ul className="space-y-1 text-[#737373] dark:text-slate-300 list-disc list-inside">
                      <li>Lakukan perekaman di ruangan tenang bebas deru angin atau bising lalu lintas.</li>
                      <li>Minta narasumber melafalkan kata secara santai dan alami tanpa hiperkoreksi artifisial.</li>
                      <li>Putar ulang audio segera setelah merekam untuk memastikan suara terdengar jelas.</li>
                    </ul>
                  </div>

                  <div className="p-3.5 bg-[#fafafa] dark:bg-slate-800/60 rounded-lg border border-[#e5e5e5] dark:border-slate-700/60 space-y-2">
                    <div className="font-bold text-[#0a0a0a] dark:text-slate-200 flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span>4. Sinkronisasi Saat Menemukan Sinyal</span>
                    </div>
                    <ul className="space-y-1 text-[#737373] dark:text-slate-300 list-disc list-inside">
                      <li>Ketika kembali mendapatkan jaringan internet, periksa indikator awan di navbar atas.</li>
                      <li>Klik ikon awan dan tekan tombol "Sinkronkan Sekarang" untuk mengunggah antrean offline.</li>
                      <li>Unduh berkas cadangan JSON dari menu Datasets sebagai arsip salinan pengaman.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeRole === 'verifikator' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#0a0a0a] dark:text-white">
                      Pedoman Verifikator & Kurator Linguistik Senior
                    </h3>
                    <p className="text-xs text-[#737373] dark:text-slate-400">
                      Prosedur telaah keabsahan ilmiah data sebelum disahkan sebagai rujukan nasional
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-[#737373] dark:text-slate-300">
                  <p>
                    Sebagai verifikator, Anda memiliki otoritas mengesahkan data dengan status <strong>✓ Tervalidasi</strong> yang akan memicu pin hijau pada peta Leaflet dan laporan agregat nasional.
                  </p>
                  <div className="p-3 bg-[#fafafa] dark:bg-slate-800 rounded-lg border border-[#e5e5e5] dark:border-slate-700 space-y-1.5">
                    <div className="font-bold text-[#0a0a0a] dark:text-slate-200">Kriteria Pengesahan Data:</div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Semua 16 seksi instrumen memiliki tingkat kelengkapan minimal 90%.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Triangulasi 3 narasumber di Seksi 14 telah diisi lengkap dan memenuhi kriteria penutur asli.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Transkripsi fonetis IPA pada kosakata Swadesh 200 konsisten dan dapat dipertanggungjawabkan.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Kata serapan telah diidentifikasi agar tidak merusak validitas hitungan rumus Jean Guiter.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeRole === 'admin' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#0a0a0a] dark:text-white">
                      Panduan Administrator Sistem & Koordinator Riset
                    </h3>
                    <p className="text-xs text-[#737373] dark:text-slate-400">
                      Manajemen pengguna, alokasi wilayah survei, dan pencadangan koleksi database
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-[#737373] dark:text-slate-300">
                  <p>
                    Admin bertanggung jawab atas integritas ekosistem data survei kebahasaan lintas tim:
                  </p>
                  <ul className="space-y-1.5 list-disc list-inside">
                    <li>Membuka modal <strong>Pengaturan & Pengguna</strong> di sidebar bawah untuk menetapkan peran (admin, verifikator, surveyor, viewer).</li>
                    <li>Melakukan ekspor berkala buku kerja Excel (.xlsx) dan cadangan JSON seluruh koleksi survei.</li>
                    <li>Memastikan koneksi Firestore dan aturan keamanan (*Firestore Rules*) berjalan optimal.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeRole === 'viewer' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#0a0a0a] dark:text-white">
                      Panduan Peneliti Tamu / Akademisi (Viewer)
                    </h3>
                    <p className="text-xs text-[#737373] dark:text-slate-400">
                      Eksplorasi data geospasial, statistik kognat, dan komparasi dialektometri
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-[#737373] dark:text-slate-300">
                  <p>
                    Mode Tamu dirancang untuk peneliti, akademisi, dan mahasiswa yang membutuhkan data empiris tanpa hak mengubah instrumen:
                  </p>
                  <ul className="space-y-1.5 list-disc list-inside">
                    <li>Buka menu <strong>Peta Titik Survei</strong> untuk menganalisis sebaran geografis dengan lapisan Google Satelit.</li>
                    <li>Gunakan modul <strong>Komparasi 2–3 Bahasa</strong> untuk melihat perbandingan leksikon glos demi glos berdampingan.</li>
                    <li>Buka menu <strong>Dialektometri & Peta</strong> untuk menelaah matriks segitiga persentase perbedaan Guiter.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: FORMULA & METODOLOGI DIALEKTOMETRI */}
      {activeTab === 'dialektometri' && (
        <div className="space-y-5">
          <div>
            <h2 className="text-base font-bold text-[#0a0a0a] dark:text-white">
              Formulasi Matematis & Metodologi Dialektometri (Jean Guiter, 1973)
            </h2>
            <p className="text-xs text-[#737373] dark:text-slate-400 mt-0.5">
              Standar kuantitatif geolinguistik komparatif untuk mengukur derajat perbedaan dialek dan bahasa.
            </p>
          </div>

          {/* Formula Card */}
          <div className="bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-900/60 rounded-xl p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-100 dark:border-blue-900/40">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg sm:text-xl text-[#1447e6] dark:text-blue-400">
                  d = (s / n) × 100%
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  Formula Jean Guiter
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyFormula}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
              >
                {copiedFormula ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFormula ? 'Disalin' : 'Salin Rumus'}</span>
              </button>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#0a0a0a] dark:text-slate-300">
              <div className="p-2.5 bg-white/80 dark:bg-slate-800/60 rounded-lg border border-blue-100/80 dark:border-slate-700">
                <span className="font-bold text-[#1447e6] dark:text-blue-400">d (Derajat Beda)</span>:
                <p className="text-[#737373] dark:text-slate-400 mt-0.5">Persentase perbedaan dialektometri hasil hitungan.</p>
              </div>
              <div className="p-2.5 bg-white/80 dark:bg-slate-800/60 rounded-lg border border-blue-100/80 dark:border-slate-700">
                <span className="font-bold text-[#1447e6] dark:text-blue-400">s (Selisih Beda)</span>:
                <p className="text-[#737373] dark:text-slate-400 mt-0.5">Jumlah perbedaan bentuk leksikal antar dua titik pengamatan.</p>
              </div>
              <div className="p-2.5 bg-white/80 dark:bg-slate-800/60 rounded-lg border border-blue-100/80 dark:border-slate-700">
                <span className="font-bold text-[#1447e6] dark:text-blue-400">n (Total Glos)</span>:
                <p className="text-[#737373] dark:text-slate-400 mt-0.5">Jumlah keseluruhan glos konsep yang diperbandingkan (misal: 200 Swadesh).</p>
              </div>
            </div>
          </div>

          {/* Classification Scale Table */}
          <div className="bg-white dark:bg-slate-900 border border-[#e5e5e5] dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
            <div className="px-4 py-3 border-b border-[#e5e5e5] dark:border-slate-800 bg-[#fafafa] dark:bg-slate-800/50 flex items-center justify-between">
              <h3 className="font-bold text-xs sm:text-sm text-[#0a0a0a] dark:text-white">
                Tabel Skala Klasifikasi Hubungan Kebahasaan
              </h3>
              <span className="text-[10px] text-[#737373] dark:text-slate-400">
                Standar Badan Bahasa & SIL International
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f5f5f5] dark:bg-slate-800/80 text-[#737373] dark:text-slate-400 border-b border-[#e5e5e5] dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Rentang Indeks (d)</th>
                    <th className="py-2.5 px-4 font-semibold">Klasifikasi Status</th>
                    <th className="py-2.5 px-4 font-semibold">Interpretasi Sosiolinguistik</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Garis Isoglos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5] dark:divide-slate-800 text-[#0a0a0a] dark:text-slate-300">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">0% – 20%</td>
                    <td className="py-3 px-4 font-semibold">Dialek Sama (Homogen)</td>
                    <td className="py-3 px-4 text-[#737373] dark:text-slate-400">Tidak ada perbedaan dialek yang nyata; variasi hanya berupa idiolek perorangan atau varian bebas.</td>
                    <td className="py-3 px-4 text-center text-slate-400">Tidak ada</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">21% – 30%</td>
                    <td className="py-3 px-4 font-semibold">Beda Wicara / Subdialek</td>
                    <td className="py-3 px-4 text-[#737373] dark:text-slate-400">Variasi fonetik dan leksikal minor; derajat saling memahami (*mutual intelligibility*) masih sangat tinggi.</td>
                    <td className="py-3 px-4 text-center text-blue-500 font-semibold">Isoglos Lemah</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">31% – 50%</td>
                    <td className="py-3 px-4 font-semibold">Beda Dialek (Dialect)</td>
                    <td className="py-3 px-4 text-[#737373] dark:text-slate-400">Perbedaan dialek yang tegas secara leksikal dan fonologis; membentuk batas wilayah dialek yang nyata.</td>
                    <td className="py-3 px-4 text-center text-amber-500 font-semibold">Isoglos Tegas</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">51% – 80%</td>
                    <td className="py-3 px-4 font-semibold">Beda Bahasa (Language)</td>
                    <td className="py-3 px-4 text-[#737373] dark:text-slate-400">Perbedaan leksikon sangat masif sehingga diklasifikasikan sebagai bahasa yang berbeda (*different languages*).</td>
                    <td className="py-3 px-4 text-center text-rose-500 font-semibold">Batas Bahasa</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">&gt; 80%</td>
                    <td className="py-3 px-4 font-semibold">Beda Rumpun / Subkeluarga</td>
                    <td className="py-3 px-4 text-[#737373] dark:text-slate-400">Perbedaan leksikon ekstrem yang mengindikasikan percabangan keluarga bahasa terpisah secara historis.</td>
                    <td className="py-3 px-4 text-center text-purple-500 font-semibold">Batas Rumpun</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PANDUAN 16 SEKSI & KUESIONER HUB */}
      {activeTab === 'seksi16' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#0a0a0a] dark:text-white">
                Rincian Panduan Pengisian 16 Bagian Instrumen Pemetaan Bahasa
              </h2>
              <p className="text-xs text-[#737373] dark:text-slate-400 mt-0.5">
                Katalog lengkap kolom input, fungsi penelitian, dan petunjuk pengisian di lapangan.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToView('form-screen')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#1447e6] hover:bg-blue-700 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <span>Buka Formulir Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sectionsList.map((sec) => (
              <div 
                key={sec.num}
                className="bg-white dark:bg-slate-900 border border-[#e5e5e5] dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-2xs hover:border-blue-300 dark:hover:border-blue-800 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950 text-[#1447e6] dark:text-blue-300 font-bold text-xs flex items-center justify-center border border-blue-200 dark:border-blue-900/40">
                      {sec.num}
                    </span>
                    <h3 className="font-bold text-xs sm:text-sm text-[#0a0a0a] dark:text-white">
                      {sec.title}
                    </h3>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f5f5f5] dark:bg-slate-800 text-[#737373] dark:text-slate-400 font-medium">
                    {sec.cat}
                  </span>
                </div>
                <p className="text-xs text-[#737373] dark:text-slate-300 mt-2 leading-relaxed">
                  {sec.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: FAQ & TIPS LAPANGAN */}
      {activeTab === 'faq' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#0a0a0a] dark:text-white">
              Tanya Jawab (FAQ) & Tips Penanganan Kendala di Lapangan
            </h2>
            <p className="text-xs text-[#737373] dark:text-slate-400 mt-0.5">
              Solusi praktis kendala offline, izin audio mikrofon, sinkronisasi, dan proteksi kehilangan data.
            </p>
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-white dark:bg-slate-900 border border-[#e5e5e5] dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-2"
              >
                <div className="flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-[#1447e6] dark:text-blue-400 mt-0.5 shrink-0" />
                  <h3 className="text-xs sm:text-sm font-bold text-[#0a0a0a] dark:text-white">
                    {faq.q}
                  </h3>
                </div>
                <p className="text-xs text-[#737373] dark:text-slate-300 leading-relaxed pl-6.5">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          {/* Keyboard Shortcuts Card */}
          <div className="mt-5 p-4 bg-[#fafafa] dark:bg-slate-800/60 border border-[#e5e5e5] dark:border-slate-700/60 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Keyboard className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <h3 className="text-xs font-bold text-[#0a0a0a] dark:text-white">Pintasan Keyboard (Keyboard Shortcuts)</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Pencarian Cepat</span>
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono border">⌘K / Ctrl+K</kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Tutup Modal / Popup</span>
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono border">Escape</kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Cetak Dokumen PDF</span>
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono border">⌘P / Ctrl+P</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: PUSAT BERKAS & DOKUMEN */}
      {activeTab === 'unduhan' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#0a0a0a] dark:text-white">
              Pusat Unduhan Berkas & Dokumen Resmi
            </h2>
            <p className="text-xs text-[#737373] dark:text-slate-400 mt-0.5">
              Unduh berkas spesifikasi teknis, template spreadsheet riset, dan arsip dokumen resmi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* Card 1: Word Document */}
            <div className="bg-white dark:bg-slate-900 border border-[#e5e5e5] dark:border-slate-800 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#0a0a0a] dark:text-white">
                    Dokumen PRD & User Flow (.DOC Word)
                  </h3>
                  <p className="text-[11px] text-[#737373] dark:text-slate-400 mt-1">
                    Format resmi Microsoft Word (.doc) berisi PRD lengkap, katalog 100% fitur, dan 8 diagram alur pengguna.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f5f5f5] dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-[#737373] dark:text-slate-400">Format .DOC</span>
                <a
                  href="/docs/PRD_USER_FLOW_SISTEM_PEMETAAN_BAHASA.doc"
                  download="PRD_USER_FLOW_SISTEM_PEMETAAN_BAHASA.doc"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#1447e6] hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh .DOC</span>
                </a>
              </div>
            </div>

            {/* Card 2: Print PDF */}
            <div className="bg-white dark:bg-slate-900 border border-[#e5e5e5] dark:border-slate-800 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#0a0a0a] dark:text-white">
                    Cetak Dokumen Resmi ke PDF
                  </h3>
                  <p className="text-[11px] text-[#737373] dark:text-slate-400 mt-1">
                    Cetak atau simpan halaman panduan ini langsung menjadi dokumen PDF resmi berformat bersih (clean print).
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f5f5f5] dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-[#737373] dark:text-slate-400">Format .PDF</span>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak PDF</span>
                </button>
              </div>
            </div>

            {/* Card 3: Dialek & Peta Word Document */}
            <div className="bg-white dark:bg-slate-900 border border-[#e5e5e5] dark:border-slate-800 rounded-xl p-4 shadow-2xs flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#0a0a0a] dark:text-white flex items-center gap-1.5">
                    <span>Panduan Khusus Dialek & Peta (.DOC)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                      Baru
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#737373] dark:text-slate-400 mt-1">
                    Dokumen spesifikasi geolinguistik lengkap: rumus Jean Guiter, algoritma pembagi tegak lurus, matriks segitiga, dan sebaran Glottolog.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f5f5f5] dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-[#737373] dark:text-slate-400">Format .DOC</span>
                <a
                  href="/docs/PANDUAN_FITUR_DIALEK_DAN_PETA.doc"
                  download="PANDUAN_FITUR_DIALEK_DAN_PETA.doc"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh .DOC</span>
                </a>
              </div>
            </div>

            {/* Card 4: Excel Swadesh */}
            <div className="bg-white dark:bg-slate-900 border border-[#e5e5e5] dark:border-slate-800 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#0a0a0a] dark:text-white">
                    Ekspor Buku Kerja Excel (.XLSX)
                  </h3>
                  <p className="text-[11px] text-[#737373] dark:text-slate-400 mt-1">
                    Spreadsheet multi-sheet resmi berisi Profil Wilayah, 200 Kosakata Swadesh, Bidang Budaya, Frasa, dan Narasumber.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f5f5f5] dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-[#737373] dark:text-slate-400">Format .XLSX</span>
                <button
                  type="button"
                  onClick={onOpenExport}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Buka Ekspor</span>
                </button>
              </div>
            </div>

            {/* Card 5: GeoJSON & GIS Export */}
            <div className="bg-white dark:bg-slate-900 border border-[#e5e5e5] dark:border-slate-800 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Globe2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#0a0a0a] dark:text-white">
                    Akses Langsung Peta Virtual Isoglos
                  </h3>
                  <p className="text-[11px] text-[#737373] dark:text-slate-400 mt-1">
                    Buka antarmuka peta interaktif Leaflet untuk menguji garis pembagi ortogonal, tur otomatis Swadesh, dan analisis spasial.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f5f5f5] dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-[#737373] dark:text-slate-400">Modul GIS</span>
                <button
                  type="button"
                  onClick={() => onNavigateToView('peta-survei')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#1447e6] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Buka Peta</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
