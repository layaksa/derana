import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Compass, 
  Users, 
  BookOpen, 
  Mic, 
  FileSpreadsheet, 
  CheckCircle2, 
  Layers, 
  TrendingUp, 
  GraduationCap, 
  GitMerge, 
  ShieldCheck, 
  Sparkles, 
  Cpu, 
  WifiOff, 
  Cloud, 
  Download, 
  Printer, 
  Search, 
  ArrowRight, 
  Check, 
  Copy, 
  Sliders, 
  Activity, 
  TableProperties, 
  Split, 
  Radar as RadarIcon, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Volume2,
  Share2,
  Calendar,
  Award,
  CircleDot,
  Radio,
  Clock,
  Laptop,
  CheckSquare,
  AlertTriangle,
  FolderDown,
  Info,
  Scroll
} from 'lucide-react';
import { ViewKey } from '../layout/AppSidebar';

interface BentoDocumentationGridProps {
  onNavigateToView: (view: ViewKey) => void;
  onOpenPRDModal?: () => void;
  onLoadSample?: () => void;
  onCreateNew?: () => void;
  onOpenExport?: () => void;
  onSelectDocTab?: (tab: 'bento' | 'alur' | 'panduan-vitalitas' | 'panduan-revitalisasi' | 'panduan-sastra-lisan' | 'peta-dialek' | 'dialektometri' | 'peran' | 'seksi16' | 'faq' | 'unduhan') => void;
}

type BentoCategory = 'all' | 'alur' | 'kuesioner' | 'dialektometri' | 'peta' | 'analisis' | 'offline_cloud' | 'ekspor';

export const BentoDocumentationGrid: React.FC<BentoDocumentationGridProps> = ({
  onNavigateToView,
  onOpenPRDModal,
  onLoadSample,
  onCreateNew,
  onOpenExport,
  onSelectDocTab
}) => {
  const [selectedCategory, setSelectedCategory] = useState<BentoCategory>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedFormula, setCopiedFormula] = useState(false);
  const [expandedSectionIdx, setExpandedSectionIdx] = useState<number | null>(null);

  // Interactive Guiter Simulator inside the Bento Card
  const [simS, setSimS] = useState<number>(38); // jumlah kata beda
  const [simN, setSimN] = useState<number>(200); // total glos pembanding
  const simD = useMemo(() => {
    if (simN <= 0) return 0;
    return Number(((simS / simN) * 100).toFixed(1));
  }, [simS, simN]);

  const simResult = useMemo(() => {
    if (simD <= 20) return {
      status: 'Dialek Sama (Homogen)',
      color: 'text-emerald-700 dark:text-emerald-400',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
      barColor: 'bg-emerald-500',
      isogloss: 'Tidak ditarik garis isoglos',
      desc: 'Perbedaan hanya berupa variasi bebas idiolek. Derajat saling memahami (mutual intelligibility) sempurna 100%.'
    };
    if (simD <= 30) return {
      status: 'Beda Wicara / Subdialek',
      color: 'text-blue-700 dark:text-blue-400',
      badgeBg: 'bg-blue-100 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
      barColor: 'bg-blue-500',
      isogloss: 'Isoglos Lemah (Garis Putus-Putus)',
      desc: 'Variasi fonetis dan leksikal minor. Masyarakat kedua desa tetap saling memahami secara spontan tanpa hambatan (>90%).'
    };
    if (simD <= 50) return {
      status: 'Beda Dialek (Dialect)',
      color: 'text-amber-700 dark:text-amber-400',
      badgeBg: 'bg-amber-100 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
      barColor: 'bg-amber-500',
      isogloss: 'Isoglos Tegas (Garis Solid Kontinu)',
      desc: 'Perbedaan leksikal dan fonologis teratur. Membentuk batas wilayah dialek yang tegas dalam ruang geografis.'
    };
    if (simD <= 80) return {
      status: 'Beda Bahasa (Language)',
      color: 'text-rose-700 dark:text-rose-400',
      badgeBg: 'bg-rose-100 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
      barColor: 'bg-rose-500',
      isogloss: 'Batas Bahasa Definitif (Garis Ganda)',
      desc: 'Mayoritas kosakata dasar berbeda secara etimologis. Komunikasi spontan terhambat; memenuhi syarat sebagai dua bahasa berbeda.'
    };
    return {
      status: 'Beda Rumpun / Subkeluarga',
      color: 'text-purple-700 dark:text-purple-400',
      badgeBg: 'bg-purple-100 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
      barColor: 'bg-purple-500',
      isogloss: 'Garis Batas Rumpun Utama',
      desc: 'Perbedaan kosakata masif; struktur gramatika dan leksikon terpisah secara filogenetik historis.'
    };
  }, [simD]);

  const handleCopyFormula = () => {
    navigator.clipboard.writeText('d = (s / n) * 100%');
    setCopiedFormula(true);
    setTimeout(() => setCopiedFormula(false), 2000);
  };

  // 16 Sections Details Catalog
  const SECTIONS_CATALOG = [
    { num: 1, title: 'Titik Pengamatan & Toponimi Desa', category: 'Administratif & Geospasial', desc: 'Nama desa, toponimi asal nama, bahasa utama, nama lain bahasa, kecamatan, kab/kota, provinsi, pulau, kode titik, serta koordinat lintang & bujur GPS yang tersinkronisasi otomatis dengan Seksi 3.' },
    { num: 2, title: 'Situasi Kebahasaan 4 Mata Angin', category: 'Batas Kebahasaan', desc: 'Dokumentasi desa tetangga dan isolek bahasa yang berbatasan langsung di sebelah Timur, Barat, Utara, dan Selatan guna mendeteksi zona kontak bahasa (language contact zone).' },
    { num: 3, title: 'Situasi Geografis & Morfologi', category: 'Bentang Alam & Peta', desc: 'Pencatatan letak (pantai/pedalaman), jarak dari garis pantai (km), topografi bentang alam (dataran, perbukitan, pegunungan, pesisir), serta peta Leaflet mini interaktif dengan validasi marker GPS.' },
    { num: 4, title: 'Penduduk & Penutur Bahasa', category: 'Demografi & Vitalitas', desc: 'Rasio gender penduduk, piramida kelompok usia (<20, 20–40, >40 tahun), jumlah penutur aktif bahasa daerah menurut kelompok umur, serta komposisi etnis warga mayoritas dan minoritas.' },
    { num: 5, title: 'Mata Pencaharian & Sosioekonomi', category: 'Sosial Budaya', desc: 'Profesi utama dan dominan warga (bertani, nelayan, berdagang, pegawai), pergeseran mata pencaharian modern, dan pengaruhnya terhadap pemertahanan kosakata kejuruan tradisional.' },
    { num: 6, title: 'Tingkat Pendidikan Penduduk', category: 'Pendidikan', desc: 'Distribusi tingkat pendidikan warga: tidak sekolah, lulusan SD, SMP, SMA, diploma, hingga sarjana, sebagai basis analisis sosiolinguistik pengaruh pendidikan terhadap dialek.' },
    { num: 7, title: 'Sarana & Gedung Pendidikan', category: 'Infrastruktur', desc: 'Ketersediaan fasilitas fisik gedung sekolah (SD, SMP, SMA, PT) dan tempat kursus di dalam wilayah desa yang menjadi media penyebaran bahasa baku nasional.' },
    { num: 8, title: 'Komposisi Pemeluk Agama', category: 'Sosial Keagamaan', desc: 'Statistik pemeluk agama Islam, Kristen Protestan, Katolik, Hindu, Buddha, Konghucu, serta penghayat kepercayaan lokal dan ranah bahasa dalam ritual keagamaan.' },
    { num: 9, title: 'Hubungan Mobilitas & Aksesibilitas', category: 'Interaksi Spasial', desc: 'Evaluasi tingkat kelancaran interaksi masyarakat desa ke luar wilayah (sangat lancar hingga tidak lancar), kondisi jalan penghubung, serta intensitas perantauan.' },
    { num: 10, title: 'Moda & Alat Transportasi', category: 'Aksesibilitas', desc: 'Ketersediaan armada transportasi darat (mobil, motor, bus), laut (kapal, perahu motor), sungai, dan udara yang menghubungkan desa ke pusat ekonomi terdekat.' },
    { num: 11, title: 'Usia Berdirinya Desa', category: 'Historiografi', desc: 'Kategori kronologis usia berdirinya desa (<50, 50–100, 200–500, >500 tahun), estimasi tahun berdiri riil, serta bukti artefak atau dokumen pendukung.' },
    { num: 12, title: 'Sejarah Singkat & Asal-Usul Desa', category: 'Historiografi', desc: 'Narasi historiografi lokal mengenai tokoh pendiri desa, asal kata toponimi desa, migrasi leluhur, serta peristiwa penting yang memengaruhi dialek tutur setempat.' },
    { num: 13, title: 'Folklore & Tradisi Tutur Lisan', category: 'Sastra Lisan', desc: 'Dokumentasi cerita rakyat utama (mitos, legenda, dongeng, sage), nama tokoh sentral, fungsi sosial bagi norma desa, dan keberlanjutan pewarisan cerita kepada generasi muda.' },
    { num: 14, title: 'Data 3 Narasumber Triangulasi', category: 'Profil Informan', desc: 'Perekaman mendalam 3 informan penutur jati (nama, gender, usia, pekerjaan, lama tinggal, frekuensi mobilitas, bahasa ibu, bahasa kedua, dan media sosial) untuk menjamin validitas ilmiah data leksikal.' },
    { num: 15, title: 'Kosakata Swadesh 200, Audio & Deteksi AI', category: 'Korpus Leksikal', desc: '200 kosakata dasar Swadesh, transkripsi fonetis IPA, perekam audio suara Web Audio API, deteksi kata serapan model Gemini AI, 18 bidang budaya (A–R), dan 50 kalimat struktur S-P-O-K.' },
    { num: 16, title: 'Hasil Dialektometri & Titik Pembanding', category: 'Analisis Komparatif', desc: 'Perbandingan berpasangan titik acuan vs titik pembanding, penghitungan jumlah beda (s), total glos (n), indeks d = (s/n)*100%, penentuan batas isoglos, dan kesimpulan geolinguistik.' }
  ];

  const categories: { id: BentoCategory; label: string; count: number }[] = [
    { id: 'all', label: 'Semua Modul & Fitur', count: 12 },
    { id: 'alur', label: 'Alur Kerja & Panduan', count: 2 },
    { id: 'kuesioner', label: '16 Seksi Kuesioner', count: 3 },
    { id: 'dialektometri', label: 'Dialektometri Guiter', count: 2 },
    { id: 'peta', label: 'Peta Spasial GIS', count: 2 },
    { id: 'analisis', label: 'Korelasi & Regresi', count: 2 },
    { id: 'offline_cloud', label: 'Offline PWA & Konflik', count: 2 },
    { id: 'ekspor', label: 'RBAC & Ekspor Multi-Format', count: 2 }
  ];

  return (
    <div className="space-y-6">
      {/* Category Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-2xs ring-1 ring-slate-200 dark:ring-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 px-2 shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden lg:inline">
            Tampilan Matriks Interaktif
          </span>
          {onOpenPRDModal && (
            <button
              type="button"
              onClick={onOpenPRDModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Modal Dokumen PRD</span>
            </button>
          )}
        </div>
      </div>

      {/* MASTER BENTO GRID CONTAINER */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">

        {/* ========================================================= */}
        {/* BENTO 1: ALUR KERJA 8 TAHAP & ARSITEKTUR SISTEM (8-COL) */}
        {/* ========================================================= */}
        {(selectedCategory === 'all' || selectedCategory === 'alur') && (
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-5 transition-colors">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/40 shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      1. Alur Kerja 8 Tahap Pengumpulan & Analisis Data
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Siklus kerja riset dialektologi komprehensif dari persiapan lapangan hingga arsip cloud
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-block text-[11px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900/50">
                  Standard Operating Procedure
                </span>
              </div>

              {/* 8-Step Interactive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-4">
                {[
                  { n: 1, title: 'Inisiasi Titik Survei', desc: 'Buat formulir baru, muat sampel Desa Karangwangi, atau impor JSON cadangan.', view: 'datasets' as ViewKey },
                  { n: 2, title: 'Pilih Mode Pengisian', desc: '16 Layar Terfokus (lapangan/tablet) vs Gulir Penuh (desktop/audit).', view: 'form-screen' as ViewKey },
                  { n: 3, title: 'Toponimi & GPS Seksi 1-3', desc: 'Koordinat lintang bujur tersinkron, situasi batas kebahasaan 4 mata angin.', view: 'identitas' as ViewKey },
                  { n: 4, title: 'Triangulasi 3 Informan', desc: 'Sosiodemografi desa (Seksi 4-13) & triangulasi 3 penutur jati (Seksi 14).', view: 'responden' as ViewKey },
                  { n: 5, title: 'Swadesh 200 & Audio', desc: 'Transkripsi fonetis IPA, audio Web Audio API, dan deteksi serapan AI.', view: 'kosakata' as ViewKey },
                  { n: 6, title: 'Dialektometri Guiter', desc: 'Kalkulasi d = (s/n)*100%, penentuan status dialek, dan garis isoglos.', view: 'dialektometri' as ViewKey },
                  { n: 7, title: 'Visualisasi Peta GIS', desc: 'Multi-basemap Google/Esri, filter status verifikasi, dan rentang usia informan.', view: 'peta-survei' as ViewKey },
                  { n: 8, title: 'Verifikasi & Ekspor', desc: 'Validasi berjenjang oleh verifikator, ekspor Excel .xlsx, CSV, dan JSON.', view: 'dashboard' as ViewKey },
                ].map((st) => (
                  <div
                    key={st.n}
                    onClick={() => onNavigateToView(st.view)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="w-5 h-5 rounded-md bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                          {st.n}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-2 group-hover:text-blue-600 transition-colors">
                        {st.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                        {st.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Terintegrasi dengan Auto-Save ber-debounce 500ms</span>
              </span>
              <button
                type="button"
                onClick={() => onNavigateToView('datasets')}
                className="font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Mulai Survei Baru ↗
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* BENTO 2: KARAKTERISTIK MODE 16 LAYAR VS GULIR (4-COL) */}
        {/* ========================================================= */}
        {(selectedCategory === 'all' || selectedCategory === 'alur') && (
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4 transition-colors">
            <div>
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/40 shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    2. Mode Layar Formulir
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Fleksibilitas tampilan sesuai perangkat
                  </p>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
                  <div className="flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Mode 16 Layar Terfokus (Field Tablet)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Menyajikan satu seksi per layar dengan nomor 1–16, tombol Kembali/Lanjut, dan counter badge merah yang menghitung kolom kosong secara real-time. Sangat cocok saat wawancara tatap muka.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <TableProperties className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Mode Gulir Penuh (Full-Scroll)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Menampilkan seluruh 16 seksi dalam satu halaman panjang berkesinambungan. Ideal untuk audit cepat verifikator, evaluasi menyeluruh, atau pencetakan fisik formulir kuesioner.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigateToView('form-screen')}
                className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold text-center transition-colors shadow-2xs cursor-pointer"
              >
                Buka Mode 16 Layar
              </button>
              <button
                type="button"
                onClick={() => onNavigateToView('form-all')}
                className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Gulir Penuh
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* BENTO 3: MATRIKS 16 SEKSI INSTRUMEN LENGKAP (12-COL FULL) */}
        {/* ========================================================= */}
        {(selectedCategory === 'all' || selectedCategory === 'kuesioner') && (
          <div className="lg:col-span-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/40 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    3. Katalog 16 Seksi Instrumen Pemetaan Bahasa Terstandar
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Struktur data komprehensif instrumen dialektologi Badan Pengembangan dan Pembinaan Bahasa
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 self-start sm:self-auto">
                Klik kartu seksi untuk melihat detail indikator data
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
              {SECTIONS_CATALOG.map((sec, idx) => {
                const isExpanded = expandedSectionIdx === idx;
                return (
                  <div
                    key={sec.num}
                    onClick={() => setExpandedSectionIdx(isExpanded ? null : idx)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isExpanded
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-700 ring-1 ring-emerald-500/20'
                        : 'bg-slate-50/70 dark:bg-slate-800/30 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                          {sec.num}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          {sec.category}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-2 leading-snug">
                        {sec.title}
                      </h4>
                      <p className={`text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {sec.desc}
                      </p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                      <span>{isExpanded ? 'Tutup Rincian ▲' : 'Buka Rincian ▼'}</span>
                      <span>Seksi #{sec.num}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* BENTO 4: DIALEKTOMETRI JEAN GUITER & SIMULATOR (7-COL) */}
        {/* ========================================================= */}
        {(selectedCategory === 'all' || selectedCategory === 'dialektometri') && (
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4 transition-colors">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900/40 shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      4. Dialektometri Jean Guiter (1973) & Simulator
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Formula matematis penentu derajat isolek dan penarikan garis isoglos
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyFormula}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-colors cursor-pointer"
                  title="Salin rumus ke clipboard"
                >
                  {copiedFormula ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFormula ? 'Tersalin' : 'Salin d=(s/n)*100%'}</span>
                </button>
              </div>

              {/* Formula & Explanation */}
              <div className="p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/60 mt-4 flex items-center justify-between flex-wrap gap-3">
                <div className="text-xs text-purple-900 dark:text-purple-200">
                  <strong className="text-sm font-mono font-bold block text-purple-700 dark:text-purple-300">
                    d = (s / n) × 100%
                  </strong>
                  <span className="text-[11px] text-purple-800/90 dark:text-purple-300/80">
                    di mana: <strong>s</strong> = jumlah perbedaan bentuk kata, <strong>n</strong> = total glos yang diperbandingkan
                  </span>
                </div>
                <div className="text-[10px] text-purple-700 dark:text-purple-300 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800">
                  Ambang Guiter Standar: ≤20% Wicara · 21-30% Subdialek · 31-50% Dialek · 51-80% Bahasa · &gt;80% Rumpun
                </div>
              </div>

              {/* Interactive Live Simulator */}
              <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Simulator Perhitungan Interaktif:
                  </span>
                  <span className="font-mono font-extrabold text-sm text-purple-600 dark:text-purple-400">
                    d = {simD}% ({simResult.status})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Beda Leksikal (s):</span>
                      <strong className="text-slate-800 dark:text-slate-200">{simS} kata</strong>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={simN}
                      value={simS}
                      onChange={(e) => setSimS(Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Total Glos Diuji (n):</span>
                      <strong className="text-slate-800 dark:text-slate-200">{simN} glos</strong>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={200}
                      step={10}
                      value={simN}
                      onChange={(e) => setSimN(Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Status Result Box */}
                <div className={`p-2.5 rounded-lg border text-xs leading-relaxed flex items-center justify-between gap-2 ${simResult.badgeBg}`}>
                  <div>
                    <strong className={`font-bold ${simResult.color}`}>{simResult.status}</strong>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{simResult.desc}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-white dark:bg-slate-900 border shrink-0">
                    {simResult.isogloss}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-slate-500">Kalkulasi presisi berkecepatan tinggi (&lt;100ms)</span>
              <button
                type="button"
                onClick={() => onNavigateToView('dialektometri')}
                className="font-bold text-purple-600 hover:underline cursor-pointer"
              >
                Buka Modul Dialektometri Lengkap ↗
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* BENTO 5: MATRIKS PAIRWISE & AGREGAT LEKSIKAL (5-COL) */}
        {/* ========================================================= */}
        {(selectedCategory === 'all' || selectedCategory === 'dialektometri') && (
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4 transition-colors">
            <div>
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-100 dark:border-violet-900/40 shrink-0">
                  <TableProperties className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    5. Matriks Pairwise & Sebaran Dialek
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Agregasi perbandingan simultan seluruh pasangan desa
                  </p>
                </div>
              </div>

              <div className="space-y-3 mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Fitur Analisis Agregat Leksikal:
                  </span>
                  <ul className="space-y-1 text-[11px]">
                    <li className="flex items-center gap-1.5">✓ <strong>Matriks Segitiga Pairwise</strong>: Menampilkan jarak leksikal (d%) antar seluruh desa.</li>
                    <li className="flex items-center gap-1.5">✓ <strong>Rata-Rata Deviasi Leksikal</strong>: Indeks keunikan dialek desa terhadap konsensus wilayah.</li>
                    <li className="flex items-center gap-1.5">✓ <strong>Klasifikasi Status Guiter</strong>: Ringkasan sebaran beda wicara, subdialek, dan dialek.</li>
                    <li className="flex items-center gap-1.5">✓ <strong>Ekspor CSV/JSON</strong>: Tabel matriks dapat diunduh langsung untuk analisis SPSS/R.</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToView('dashboard')}
              className="w-full py-2 px-3 rounded-xl bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 dark:hover:bg-violet-900 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 text-xs font-bold transition-colors shadow-2xs cursor-pointer text-center"
            >
              Lihat Statistik Sebaran Dialek di Dashboard ↗
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* BENTO 6: PETA GIS LEAFLET & PEMETAAN BAHASA (6-COL) */}
        {/* ========================================================= */}
        {(selectedCategory === 'all' || selectedCategory === 'peta') && (
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4 transition-colors">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-100 dark:border-teal-900/40 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      6. Peta Spasial Leaflet GIS & Lapisan Pemetaan Bahasa
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Kartografi geolinguistik interaktif dengan visualisasi titik pengamatan koordinat, poligon wilayah tutur, dan multi-basemap
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 mt-4 text-xs">
                <div className="p-3 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/50 space-y-1">
                  <strong className="text-teal-900 dark:text-teal-300 font-bold block">
                    Lapisan Peta Dasar (Multi-Basemap):
                  </strong>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Beralih instan antara Google Maps Road, Google Satelit Hibrida, Esri World Imagery, OpenStreetMap, CartoDB Positron, dan Dark Matter.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <strong className="text-slate-900 dark:text-white font-bold block">
                    Filter Spasial Dinamis:
                  </strong>
                  <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                    <li>• <strong>Filter Status Validasi</strong>: Saring titik survei tervalidasi (pin hijau) vs menunggu (pin amber).</li>
                    <li>• <strong>Filter Rentang Usia Informan</strong>: Saring penanda (&lt;25 muda, 25–50 dewasa, &gt;50 tetua) untuk melihat persebaran generasi.</li>
                    <li>• <strong>Jejaring Spasial Antar-Desa</strong>: Garis relasi keterhubungan spasial dengan auto-fit bounds.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigateToView('peta-survei')}
                className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer text-center"
              >
                Buka Peta Leaflet
              </button>
              <button
                type="button"
                onClick={() => onNavigateToView('dashboard')}
                className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Peta di Dashboard
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* BENTO 7: SWADESH 200, AUDIO WEB API & DETEKSI AI (6-COL) */}
        {/* ========================================================= */}
        {(selectedCategory === 'all' || selectedCategory === 'kuesioner') && (
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4 transition-colors">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/40 shrink-0">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      7. Kosakata Swadesh 200 & Deteksi AI
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Perekaman audio informan, simbol fonetis IPA, dan eliminasi kognat palsu
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 mt-4 text-xs">
                <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 space-y-1">
                  <strong className="text-amber-900 dark:text-amber-300 font-bold block">
                    Perekam Audio Terintegrasi (Web Audio API):
                  </strong>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Setiap glos kata memiliki tombol mikrofon merah untuk merekam suara asli informan secara langsung. Rekaman tersimpan otomatis dan dapat diputar seketika tanpa plugin pihak ketiga.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <strong className="text-slate-900 dark:text-white font-bold block">
                    Deteksi Kata Serapan (Gemini AI):
                  </strong>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Mendeteksi kata serapan (Sanskerta, Arab, Belanda, Portugis, Melayu) untuk mencegah "kognat palsu" (false cognates) dalam perhitungan dialektometri murni. Dilengkapi 18 bidang budaya (A–R) dan 50 kalimat struktur S-P-O-K.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToView('kosakata')}
              className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer text-center"
            >
              Buka Pengisian Kosakata Swadesh 200 ↗
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* BENTO 8: KORELASI PENDIDIKAN VS DIALEK (SCATTER PLOT) (6-COL) */}
        {/* ========================================================= */}
        {(selectedCategory === 'all' || selectedCategory === 'analisis') && (
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4 transition-colors">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/40 shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      8. Korelasi Pendidikan vs Variasi Dialek
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Visualisasi Scatter Plot Recharts interaktif dengan regresi linear OLS
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Fitur Analisis Scatter Plot:
                  </span>
                  <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                    <li>• <strong>Sumbu X Fleksibel</strong>: Pilihan antara Lama Pendidikan (Tahun) atau Jenjang Formal (SD–S3).</li>
                    <li>• <strong>Sumbu Y Multimetrik</strong>: Deviasi Leksikal Konsensus, Jarak Dialektometri Guiter, Retensi Arkais, atau Inovasi Lokal.</li>
                    <li>• <strong>Pewarnaan Titik Data</strong>: Berdasarkan Bahasa, Rentang Usia, Jenjang Pendidikan, atau Gender.</li>
                    <li>• <strong>Statistik Regresi</strong>: Persamaan tren $y = mx + c$, $R^2$, dan Koefisien Korelasi Pearson ($r$).</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToView('dashboard')}
              className="w-full py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-colors shadow-2xs cursor-pointer text-center"
            >
              Buka Analisis Scatter Plot di Dashboard ↗
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* BENTO 9: REGRESI USIA VS VARIABEL BAHASA (WAKTU SEMU) (6-COL) */}
        {/* ========================================================= */}
        {(selectedCategory === 'all' || selectedCategory === 'analisis') && (
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4 transition-colors">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-100 dark:border-teal-900/40 shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      9. Regresi Usia vs Variabel Bahasa (Waktu Semu)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Metode Apparent-Time William Labov untuk mengamati evolusi dialek
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Fitur Grafik Tren & Kohort Recharts:
                  </span>
                  <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                    <li>• <strong>4 Mode Grafik</strong>: Trend Linear ComposedChart, Kurva Waktu Semu AreaChart, Perbandingan Multi-Variabel LineChart, dan Kohort Generasi BarChart.</li>
                    <li>• <strong>5 Variabel Bahasa Dependen</strong>: Retensi Leksikon Arkais, Pembakuan Standar, Deviasi Leksikal, Ranah Domestik, dan Inovasi.</li>
                    <li>• <strong>Kohort Generasi</strong>: Pengelompokan Gen Z (&lt;27 thn), Milenial (28–43), Gen X (44–59), Baby Boomers (60–78), dan Tradisionalis (&gt;78 thn).</li>
                    <li>• <strong>Kalkulator Prediksi Usia</strong>: Estimasi retensi dialek untuk usia narasumber target secara instan.</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToView('dashboard')}
              className="w-full py-2 px-3 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-bold transition-colors shadow-2xs cursor-pointer text-center"
            >
              Buka Analisis Regresi Usia & Grafik Tren di Dashboard ↗
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* BENTO 10: KUESIONER EKSTRA (SASTRA LISAN, VITALITAS, RAP) (12-COL) */}
        {/* ========================================================= */}
        {(selectedCategory === 'all' || selectedCategory === 'kuesioner') && (
          <div className="lg:col-span-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-900/40 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  10. Modul Kuesioner Ekstra: Sastra Lisan, Vitalitas & Revitalisasi
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Instrumen komplementer perlindungan bahasa daerah dan warisan budaya takbenda
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
              <div 
                onClick={() => onNavigateToView('sastra-lisan')}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-800 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">
                      Kuesioner Sastra Lisan
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    Inventarisasi cerita rakyat, mitos, legenda, dongeng, nyanyian rakyat, mantra, teka-teki, dan peribahasa beserta transkripsi bilingual dan media rekaman.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-3 block">
                  Buka Modul Sastra Lisan ↗
                </span>
              </div>

              <div 
                onClick={() => onNavigateToView('kondisi-bahasa')}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                      Kuesioner Vitalitas Bahasa
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    Pengukuran daya hidup bahasa berbasis 6 tingkat keterancaman UNESCO / EGIDS (Safe hingga Extinct), transmisi antargenerasi, dan ranah penggunaan.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-3 block">
                  Buka Modul Vitalitas Bahasa ↗
                </span>
              </div>

              <div 
                onClick={() => onNavigateToView('revitalisasi')}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      Revitalisasi Bahasa (Monev & RAP)
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    Dokumen instrumen Monitoring & Evaluasi (Monev) dan Rencana Aksi Program (RAP) pelestarian bahasa daerah di lingkungan sekolah dan komunitas adat.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-3 block">
                  Buka Modul Revitalisasi Bahasa ↗
                </span>
              </div>
            </div>

            {/* SOP Links to Dedicated Questionnaires Guides */}
            {onSelectDocTab && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    SOP & Tata Cara Pengisian Lengkap per Instrumen:
                  </span>
                  <span className="text-[10px] text-slate-400">Pilih panduan instrumen</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectDocTab('panduan-vitalitas')}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Activity className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Tata Cara Vitalitas Bahasa (95 Butir) →</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectDocTab('panduan-revitalisasi')}
                    className="px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-semibold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Tata Cara Revitalisasi Bahasa (RAP & IKRBD) →</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectDocTab('panduan-sastra-lisan')}
                    className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Scroll className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Tata Cara Sastra Lisan (Folklore & ATU) →</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* BENTO 11: OFFLINE PWA & AUTO-RESOLVE CONFLICTS (6-COL) */}
        {/* ========================================================= */}
        {(selectedCategory === 'all' || selectedCategory === 'offline_cloud') && (
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4 transition-colors">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/40 shrink-0">
                    <GitMerge className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      11. Offline PWA & Auto-Resolve Conflicts
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Operasional daerah 3T dan resolusi konflik pengeditan multi-pengguna
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 mt-4 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 space-y-1">
                  <strong className="text-emerald-900 dark:text-emerald-300 font-bold block">
                    Fitur 'Auto-Resolve Conflicts' (Smart Granular 3-Way Merge):
                  </strong>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Ketika beberapa enumerator mengedit survei yang sama saat terputus dari internet (misal: Enumerator A mengisi Narasumber 1 & 2, sementara Enumerator B mengisi Kosakata Swadesh 1–50), sistem secara cerdas menggabungkan seluruh perubahan tanpa ada data yang hilang atau saling menimpa.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <strong className="text-slate-900 dark:text-white font-bold block">
                    4 Pilihan Strategi Resolusi Konflik:
                  </strong>
                  <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                    <li>• <strong>Auto-Resolve (Direkomendasikan)</strong>: Penggabungan per seksi dan per butir.</li>
                    <li>• <strong>Terbaru Menang (Last-Write-Wins)</strong>: Memilih versi dengan cap waktu terbaru.</li>
                    <li>• <strong>Prioritaskan Lokal</strong>: Perangkat ini menimpa versi cloud.</li>
                    <li>• <strong>Prioritaskan Cloud</strong>: Menerima versi server dan mengabaikan lokal.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500">
              Dilengkapi modal riwayat log konflik dan sinkronisasi otomatis ke Firebase Firestore saat online.
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* BENTO 12: RBAC, KEAMANAN & EKSPOR MULTI-FORMAT (6-COL) */}
        {/* ========================================================= */}
        {(selectedCategory === 'all' || selectedCategory === 'ekspor') && (
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4 transition-colors">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/40 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      12. Tata Kelola Peran (RBAC) & Ekspor Data
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Keamanan data riset, hak akses berjenjang, dan distribusi arsip
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 mt-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <strong className="text-slate-900 dark:text-white font-bold block">
                    Hak Akses 4 Peran Pengguna (RBAC):
                  </strong>
                  <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                    <li>• <strong>Administrator</strong>: Akses tak terbatas, kelola akun, validasi, dan hapus survei.</li>
                    <li>• <strong>Verifikator</strong>: Audit data 16 seksi, menyematkan status "✓ Tervalidasi".</li>
                    <li>• <strong>Surveyor</strong>: Input data instrumen, rekam audio informan, edit survei miliknya.</li>
                    <li>• <strong>Viewer</strong>: Eksplorasi publik, lihat visualisasi peta dan statistik sebaran.</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 space-y-1">
                  <strong className="text-blue-900 dark:text-blue-300 font-bold block">
                    Pusat Ekspor & Impor Multi-Format:
                  </strong>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Ekspor Buku Kerja Excel (.xlsx) multi-sheet, CSV 200 Kosakata Swadesh, CSV Daftar Informan, JSON Cadangan Database, serta pencetakan dokumen PDF / DOC resmi.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenExport && (
                <button
                  type="button"
                  onClick={onOpenExport}
                  className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer text-center"
                >
                  Buka Modal Ekspor Data
                </button>
              )}
              <button
                type="button"
                onClick={() => onNavigateToView('datasets')}
                className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Kelola Pengguna
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
