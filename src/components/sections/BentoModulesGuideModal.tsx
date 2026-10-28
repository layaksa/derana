import React, { useState, useMemo } from 'react';
import {
  X,
  BookOpen,
  Workflow,
  Compass,
  Split,
  Radar as RadarIcon,
  Activity,
  CircleDot,
  TreePine,
  BarChart3,
  GitBranch,
  ArrowLeftRight,
  Layers,
  Calculator,
  Hourglass,
  CheckCircle2,
  ChevronRight,
  Search,
  Users,
  Sparkles,
  ArrowRight,
  HelpCircle,
  FileSpreadsheet,
  MapPin,
  Cpu,
  Layers3,
  Lightbulb
} from 'lucide-react';
import { DialekVisualizationTab } from './Section16DialektometriPeta';

export interface BentoModulesGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: DialekVisualizationTab;
  onSelectModule?: (tab: DialekVisualizationTab) => void;
}

interface ModuleDetail {
  id: DialekVisualizationTab;
  number: number;
  title: string;
  category: 'Spasial' | 'Otomatis' | 'Matriks' | 'Kontur' | 'Statistik' | 'Pohon' | 'Korelasi' | 'Taksonomi' | 'Dyadik' | 'Vektor' | 'Numerik' | 'Kronologi';
  color: string;
  badgeBg: string;
  icon: React.ElementType;
  summary: string;
  purpose: string;
  inputData: string[];
  methodology: string;
  outputVisual: string[];
  tips: string;
  targetRoles: string[];
}

const MODULE_CATALOG: ModuleDetail[] = [
  {
    id: 'peta-interaktif',
    number: 1,
    title: 'Peta Tematik Leksikal',
    category: 'Spasial',
    color: 'blue',
    badgeBg: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-sky-300',
    icon: Compass,
    summary: 'WebGIS interaktif dengan titik koordinat GPS riil, radius pengaruh dialek, dan popup sebaran kosakata.',
    purpose: 'Melihat persebaran titik pengamatan (TP) secara geografis di peta riil, memeriksa radius isolasi geografis dan kesamaan leksikal.',
    inputData: ['Koordinat GPS (lintang & bujur)', 'Daftar kosakata 200 Swadesh', 'Nama desa/kecamatan TP'],
    methodology: 'Geocoding spasial berbasis Leaflet/OpenStreetMap dengan layer poligon isoglos dan marker lingkaran dinamis.',
    outputVisual: ['Peta interaktif full-canvas', 'Pin status kesamaan leksikal', 'Layer geologi/topografi dasar'],
    tips: 'Gunakan fitur ganti layer (Satelit/OpenStreetMap/Terrain) untuk menganalisis batas fisik seperti sungai atau pegunungan.',
    targetRoles: ['Surveyor Lapangan', 'Linguis Dialektolog']
  },
  {
    id: 'isoglos-otomatis',
    number: 2,
    title: 'Isoglos Otomatis',
    category: 'Otomatis',
    color: 'indigo',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300',
    icon: Split,
    summary: 'Generator garis batas dialek (isoglos) tegak lurus (perpendicular bisector) berbasis ambang batas Guiter.',
    purpose: 'Menemukan berkas isoglos (bundle of isoglosses) yang menandai batas dialek atau subdialek secara objektif tanpa subjektivitas manual.',
    inputData: ['Matriks persentase perbedaan leksikal (d)', 'Jarak spasial Euclidean antar-titik'],
    methodology: 'Kalkulasi midpoint antar titik berpasangan dengan garis normal berskala ketebalan proporsional selisih d ≥ 30%.',
    outputVisual: ['Garis pemisah isoglos', 'Ketebalan berkas garis', 'Indikator ambang batas interaktif'],
    tips: 'Geser slider batas pemisah (misal 51% untuk beda dialek) untuk melihat berkas garis yang mengelompok padat.',
    targetRoles: ['Linguis Dialektolog', 'Verifikator Data']
  },
  {
    id: 'heatmap',
    number: 3,
    title: 'Matriks Heat-Map & Radar',
    category: 'Matriks',
    color: 'emerald',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300',
    icon: RadarIcon,
    summary: 'Matriks segitiga diagonal interaktif lengkap dengan pewarnaan gradasi panas dan radar multidimensi.',
    purpose: 'Menganalisis matriks jarak dialektometri pairwise antar seluruh titik pengamatan secara simultan.',
    inputData: ['Persentase perbedaan (d%) antar seluruh pasangan TP', 'Kategori Guiter (Beda Bahasa, Dialek, Subdialek, Wicara)'],
    methodology: 'Matriks simetris segitiga bawah dengan palet warna kromatik dari hijau (0% identik) hingga merah tua (>80% beda bahasa).',
    outputVisual: ['Tabel matriks heatmap interaktif', 'Diagram radar polygon per titik', 'Tooltip nilai perbedaan d%'],
    tips: 'Klik salah satu sel selisih untuk langsung menyorot perbandingan leksikal mendalam antara dua titik tersebut.',
    targetRoles: ['Linguis Dialektolog', 'Supervisor Riset']
  },
  {
    id: 'heatmap-spasial',
    number: 4,
    title: 'Heatmap Dialek Spasial',
    category: 'Kontur',
    color: 'purple',
    badgeBg: 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300',
    icon: Activity,
    summary: 'Interpolasi kontur spasial IDW (Inverse Distance Weighting) densitas variasi leksikal.',
    purpose: 'Mengidentifikasi pusat inovasi leksikal (focal area) dan area relik/konservatif di seluruh wilayah penelitian.',
    inputData: ['Indeks variasi leksikal per titik', 'Koordinat spasial lat/lng'],
    methodology: 'Algoritma Inverse Distance Weighting (IDW) 2D smoothing menghasilkan bidang kontur isotropik densitas linguistik.',
    outputVisual: ['Gradien kontur warna halus', 'Titik pusat hotspot variasi', 'Isoline kerapatan isoglos'],
    tips: 'Area berwarna merah/panas menunjukkan hotspot inovasi bahasa, sementara area sejuk adalah kantong bahasa konservatif.',
    targetRoles: ['Linguis Dialektolog']
  },
  {
    id: 'd3-klaster',
    number: 5,
    title: 'Klaster & Radar D3',
    category: 'Statistik',
    color: 'teal',
    badgeBg: 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300',
    icon: CircleDot,
    summary: 'Visualisasi multivariat D3.js dengan diagram jejaring klaster dan proyeksi gaya pegas (force simulation).',
    purpose: 'Melihat kedekatan klaster dialek tanpa batasan spasial kaku, memvalidasi formasi kelompok dialek secara statistik.',
    inputData: ['Matriks kedekatan leksikal (100 - d%)', 'Bobot relasi antar simpul'],
    methodology: 'D3 Force-Directed Network Graph dengan gaya tolak-menolak Coulomb dan pegas Hooke sesuai kemiripan leksikal.',
    outputVisual: ['Simpul titik yang dapat digeser (drag & drop)', 'Garis relasi dengan ketebalan proporsional', 'Klaster berwarna otomatis'],
    tips: 'Tarik simpul di diagram untuk melihat bagaimana titik-titik dialek yang mirip akan saling menarik membentuk klaster alami.',
    targetRoles: ['Linguis Dialektolog', 'Peneliti Statistika']
  },
  {
    id: 'pohon-filogenetik',
    number: 6,
    title: 'Pohon Filogenetik',
    category: 'Pohon',
    color: 'emerald',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300',
    icon: TreePine,
    summary: 'Dendrogram silsilah dialek hierarkis (UPGMA & Neighbor-Joining) dengan panjang cabang terukur.',
    purpose: 'Merekonstruksi pohon kekerabatan kladistik bahasa dan mencerminkan percabangan genealogis dari proto-bahasa.',
    inputData: ['Matriks jarak dialektometri Guiter lengkap'],
    methodology: 'Algoritma pengelompokan hierarkis agglomerative UPGMA (Unweighted Pair Group Method with Arithmetic Mean).',
    outputVisual: ['Dendrogram horizontal bercabang', 'Skala jarak perbedaan (%) di sumbu x', 'Label nama titik daun (leaf nodes)'],
    tips: 'Perhatikan tinggi cabang percabangan: cabang yang terpisah di level >81% mengindikasikan status bahasa terpisah.',
    targetRoles: ['Linguis Historis', 'Supervisor Riset']
  },
  {
    id: 'grafik',
    number: 7,
    title: 'Grafik & Scatter Korelasi',
    category: 'Korelasi',
    color: 'rose',
    badgeBg: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300',
    icon: BarChart3,
    summary: 'Analisis regresi linear Isolasi Berdasarkan Jarak (Isolation by Distance - IBD) dan grafik batang.',
    purpose: 'Menguji hipotesis geolinguistik: apakah perbedaan dialek semata-mata fungsi dari jarak geografis kilometer?',
    inputData: ['Jarak geografis riil (km) pasangan TP', 'Persentase perbedaan dialektometri (d%)'],
    methodology: 'Regresi linear sederhana (Ordinary Least Squares) menghasilkan koefisien korelasi Pearson (r) dan koefisien determinasi (R²).',
    outputVisual: ['Scatter plot sebaran titik pasangan', 'Garis tren regresi (trendline)', 'Nilai R² dan p-value korelasi'],
    tips: 'Jika titik berada jauh di atas garis regresi, titik tersebut mengalami isolasi linguistik ekstrim (misal karena rintangan alam/sosial).',
    targetRoles: ['Supervisor Riset', 'Peneliti Sosiolinguistik']
  },
  {
    id: 'klasifikasi',
    number: 8,
    title: 'Klasifikasi Kekerabatan',
    category: 'Taksonomi',
    color: 'cyan',
    badgeBg: 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300',
    icon: GitBranch,
    summary: 'Taksonomi standar Guiter (1973) yang mengkategorikan relasi pasangan titik ke dalam 5 status baku.',
    purpose: 'Melihat ringkasan persentase pasangan titik yang tergolong Bahasa Berbeda, Beda Dialek, Beda Subdialek, Beda Wicara, atau Tidak Ada Beda.',
    inputData: ['Nilai d% seluruh pasangan titik pengamatan'],
    methodology: 'Segmentasi interval Guiter: d≥81% (Beda Bahasa), 51-80% (Beda Dialek), 31-50% (Beda Subdialek), 21-30% (Beda Wicara), <21% (Tak Ada Beda).',
    outputVisual: ['Kartu rekapitulasi kategori bertingkat', 'Persentase dan jumlah pasangan', 'Daftar rincian pasangan TP'],
    tips: 'Gunakan filter kategori untuk mengecek pasangan mana saja yang sudah memenuhi kriteria beda dialek mandiri.',
    targetRoles: ['Verifikator Data', 'Linguis Dialektolog']
  },
  {
    id: 'komparasi',
    number: 9,
    title: 'Perbandingan Dua Titik',
    category: 'Dyadik',
    color: 'orange',
    badgeBg: 'bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300',
    icon: ArrowLeftRight,
    summary: 'Alat komparasi dyadik leksikon kata demi kata antara Titik Pengamatan Utama vs Titik Pembanding.',
    purpose: 'Melakukan audit detail glos demi glos dari 200 kosakata Swadesh untuk melihat bentuk kata yang sama vs berbeda.',
    inputData: ['Glos Swadesh TP Utama', 'Glos Swadesh TP Pembanding terpilih'],
    methodology: 'Pencocokan string fonetis/ortografis dengan klasifikasi: Identik, Variasi Fonologis, atau Leksikal Berbeda.',
    outputVisual: ['Tabel komparasi berdampingan', 'Badge status per glos (Sama/Beda)', 'Statistik ringkas perbedaan d%'],
    tips: 'Ketik kata di kotak pencarian untuk langsung memeriksa bagaimana suatu kata diucapkan di dua desa yang berbeda.',
    targetRoles: ['Surveyor Lapangan', 'Verifikator Linguistik']
  },
  {
    id: 'visualisasi',
    number: 10,
    title: 'Peta Isoglos Skematis',
    category: 'Vektor',
    color: 'amber',
    badgeBg: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300',
    icon: Layers,
    summary: 'Representasi diagram skematis vektor SVG topologis dialek (Wave Theory) yang siap diunduh untuk publikasi jurnal.',
    purpose: 'Menghasilkan ilustrasi visual bersih non-satelit yang ideal untuk dicetak pada makalah riset, skripsi, atau buku monograf.',
    inputData: ['Posisi relatif titik pengamatan', 'Garis batas isoglos leksikal'],
    methodology: 'Rendering vektor SVG resolusi tinggi dengan styling publikasi akademik hitam-putih atau warna pastel.',
    outputVisual: ['Kanvas skematis SVG bersih', 'Legenda formal akademik', 'Tombol ekspor SVG / PNG beresolusi tinggi'],
    tips: 'Pilih modul ini saat Anda butuh gambar ilustrasi berkualitas tinggi untuk dicetak ke PDF atau dokumen laporan.',
    targetRoles: ['Supervisor Riset', 'Penulis Publikasi']
  },
  {
    id: 'kalkulator',
    number: 11,
    title: 'Tabel & Kalkulator Dialektometri',
    category: 'Numerik',
    color: 'violet',
    badgeBg: 'bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300',
    icon: Calculator,
    summary: 'Kalkulator interaktif rumus Guiter: d = (s × 100) / n dengan simulasi jumlah beda (s) dan total glos (n).',
    purpose: 'Melakukan verifikasi manual dan simulasi angka perbedaan dialektometri tanpa perlu mengubah basis data primer.',
    inputData: ['Parameter s (jumlah beda)', 'Parameter n (total pembanding glos, default: 200)'],
    methodology: 'Formula Guiter (1973) d = (s / n) * 100 beserta interpretasi taksonomi otomatis.',
    outputVisual: ['Input parameter interaktif', 'Gauge kalkulasi persentase d%', 'Tabel matriks data mentah'],
    tips: 'Ubah slider nilai s untuk mendemonstrasikan ke audiens bagaimana kenaikan beda leksikal mengubah status klasifikasi.',
    targetRoles: ['Surveyor Lapangan', 'Mahasiswa / Peneliti']
  },
  {
    id: 'glotokronologi',
    number: 12,
    title: 'Glotokronologi & Waktu Pisah',
    category: 'Kronologi',
    color: 'indigo',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300',
    icon: Hourglass,
    summary: 'Kalkulator leksikostatistik Swadesh untuk menghitung waktu pisah (time depth) dan usia purba bahasa dalam ribuan tahun.',
    purpose: 'Mengetahui perkiraan tahun dan abad ketika dua dialek atau bahasa mulai berpisah dari bahasa induk bersama.',
    inputData: ['Persentase kognat (C%)', 'Tingkat retensi leksikal (r = 0.805 untuk 200 kata Swadesh)'],
    methodology: 'Rumus Swadesh: t = log(C) / (2 × log(r)) dengan galat baku s_t = sqrt(C × (1 - C) / n) / (2 × log(r)).',
    outputVisual: ['Waktu pisah (ribuan tahun lalu)', 'Rentang abad Masehi/Sebelum Masehi', 'Batas galat baku (standard error range)'],
    tips: 'Gunakan persentase kognat riil dari Swadesh untuk mendapatkan estimasi tahun pisah yang akurat.',
    targetRoles: ['Linguis Historis Komparatif', 'Supervisor Riset']
  }
];

export const BentoModulesGuideModal: React.FC<BentoModulesGuideModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectModule
}) => {
  const [modalTab, setModalTab] = useState<'flow' | 'catalog' | 'roles'>('flow');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState<DialekVisualizationTab>(activeTab);

  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return MODULE_CATALOG;
    const q = searchQuery.toLowerCase();
    return MODULE_CATALOG.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.methodology.toLowerCase().includes(q) ||
        m.targetRoles.some((r) => r.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const activeModuleDetail = useMemo(() => {
    return MODULE_CATALOG.find((m) => m.id === selectedModuleId) || MODULE_CATALOG[0];
  }, [selectedModuleId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-modal-title"
      >
        {/* MODAL HEADER */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="guide-modal-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Panduan Pengguna & User Flow
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  12 Modul Analisis
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Dokumentasi terpadu alur kerja riset dialektometri, metodologi Guiter & glotokronologi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Tutup Panduan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            <button
              type="button"
              onClick={() => setModalTab('flow')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                modalTab === 'flow'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>User Flow (6 Tahap Riset)</span>
            </button>
            <button
              type="button"
              onClick={() => setModalTab('catalog')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                modalTab === 'catalog'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers3 className="w-3.5 h-3.5" />
              <span>Katalog 12 Modul Analisis</span>
            </button>
            <button
              type="button"
              onClick={() => setModalTab('roles')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                modalTab === 'roles'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Matriks Peran (Role Matrix)</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>Modul yang sedang aktif:</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {MODULE_CATALOG.find((m) => m.id === activeTab)?.title || '1. Peta Tematik Leksikal'}
            </span>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB 1: USER FLOW (6 TAHAPAN RISET) */}
          {modalTab === 'flow' && (
            <div className="space-y-6">
              {/* Flow Overview Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 via-sky-50 to-emerald-50 dark:from-indigo-950/40 dark:via-sky-950/40 dark:to-emerald-950/40 border border-indigo-200/60 dark:border-indigo-900/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-600 text-white shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Arsitektur User Flow Analisis Dialek Terintegrasi
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      12 modul visualisasi dirancang bukan sebagai alat terpisah, melainkan sebuah rantai pipa analisis dialektometri yang saling berurutan: dari pengumpulan data lapangan mentah hingga penetapan pohon filogenetik dan waktu pisah glotokronologi.
                    </p>
                  </div>
                </div>
              </div>

              {/* 6 Sequential Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {/* Step 1 */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-sky-300">
                        TAHAP 1
                      </span>
                      <span className="text-[10px] text-slate-400">Input Lapangan</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      Inventarisasi Geospasial
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Pengambilan titik GPS, batas administratif, dan pengisian 200 kosakata baku Swadesh oleh surveyor.
                    </p>
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400">
                      <strong>Modul Terkait:</strong> Modul 1 (Peta Tematik), Modul 9 (Komparasi Dua Titik)
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectModule?.('peta-interaktif');
                      onClose();
                    }}
                    className="mt-3 w-full py-1.5 px-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-sky-300 text-xs font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Buka Peta Tematik</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Step 2 */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                        TAHAP 2
                      </span>
                      <span className="text-[10px] text-slate-400">Kalkulasi Guiter</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-violet-500" />
                      Kalkulasi Dialektometri
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Penghitungan matriks jarak leksikal Guiter d = (s × 100) / n dan pengelompokan klasifikasi otomatis.
                    </p>
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400">
                      <strong>Modul Terkait:</strong> Modul 11 (Tabel & Kalkulator), Modul 8 (Klasifikasi)
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectModule?.('kalkulator');
                      onClose();
                    }}
                    className="mt-3 w-full py-1.5 px-2.5 rounded-lg bg-violet-50 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 text-xs font-semibold hover:bg-violet-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Buka Kalkulator</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Step 3 */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        TAHAP 3
                      </span>
                      <span className="text-[10px] text-slate-400">Matriks & Radar</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <RadarIcon className="w-3.5 h-3.5 text-emerald-500" />
                      Eksplorasi Matriks Pasangan
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Pemeriksaan matriks segitiga bergradasi panas dan diagram radar untuk melihat titik paling heterogen.
                    </p>
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400">
                      <strong>Modul Terkait:</strong> Modul 3 (Heatmap & Radar), Modul 5 (Klaster D3)
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectModule?.('heatmap');
                      onClose();
                    }}
                    className="mt-3 w-full py-1.5 px-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Buka Matriks Heatmap</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Step 4 */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        TAHAP 4
                      </span>
                      <span className="text-[10px] text-slate-400">Isoglos & Batas</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Split className="w-3.5 h-3.5 text-indigo-500" />
                      Penarikan Garis Isoglos
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Sintesis berkas garis batas dialek otomatis (bisector) dan visualisasi interpolasi IDW sebaran leksikal.
                    </p>
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400">
                      <strong>Modul Terkait:</strong> Modul 2 (Isoglos Otomatis), Modul 4 (Heatmap Spasial)
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectModule?.('isoglos-otomatis');
                      onClose();
                    }}
                    className="mt-3 w-full py-1.5 px-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Buka Isoglos Otomatis</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Step 5 */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                        TAHAP 5
                      </span>
                      <span className="text-[10px] text-slate-400">Kladistika & Waktu</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <TreePine className="w-3.5 h-3.5 text-rose-500" />
                      Filogenetika & Waktu Pisah
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Rekonstruksi pohon hierarkis UPGMA, korelasi jarak geografis (IBD), dan estimasi tahun pisah bahasa Swadesh.
                    </p>
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400">
                      <strong>Modul Terkait:</strong> Modul 6 (Pohon Filogenetik), Modul 7 (Scatter IBD), Modul 12 (Glotokronologi)
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectModule?.('pohon-filogenetik');
                      onClose();
                    }}
                    className="mt-3 w-full py-1.5 px-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Buka Pohon Filogenetik</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Step 6 */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                        TAHAP 6
                      </span>
                      <span className="text-[10px] text-slate-400">Diseminasi Ilmiah</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-amber-500" />
                      Publikasi & Ekspor Laporan
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Penyusunan peta isoglos skematis siap cetak dan ekspor format CSV, GeoJSON, serta berkas laporan resmi.
                    </p>
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400">
                      <strong>Modul Terkait:</strong> Modul 10 (Peta Isoglos Skematis), Ekspor CSV / PDF
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectModule?.('visualisasi');
                      onClose();
                    }}
                    className="mt-3 w-full py-1.5 px-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Buka Isoglos Skematis</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KATALOG 12 MODUL BENTO */}
          {modalTab === 'catalog' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Module Selector List with Search */}
              <div className="lg:col-span-5 space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari modul atau kata kunci..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="max-h-[500px] overflow-y-auto space-y-1.5 pr-1">
                  {filteredModules.map((module) => {
                    const isSelected = selectedModuleId === module.id;
                    const IconComponent = module.icon;
                    return (
                      <button
                        key={module.id}
                        type="button"
                        onClick={() => setSelectedModuleId(module.id)}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 dark:border-indigo-400 ring-1 ring-indigo-500/30'
                            : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-slate-400">#{module.number}</span>
                              <span className={`text-xs font-semibold truncate ${isSelected ? 'text-indigo-900 dark:text-indigo-200 font-bold' : 'text-slate-800 dark:text-slate-200'}`}>
                                {module.title}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                              {module.summary}
                            </span>
                          </div>
                        </div>

                        <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-indigo-600 dark:text-indigo-400 translate-x-0.5' : 'text-slate-400'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Selected Module Deep-Dive Card */}
              <div className="lg:col-span-7">
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-indigo-600 text-white shadow-xs">
                        <activeModuleDetail.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            Modul #{activeModuleDetail.number}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${activeModuleDetail.badgeBg}`}>
                            {activeModuleDetail.category}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                          {activeModuleDetail.title}
                        </h3>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectModule?.(activeModuleDetail.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-600/30 cursor-pointer"
                    >
                      <span>Gunakan Modul</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Purpose */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      Fungsi & Tujuan Analisis
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      {activeModuleDetail.purpose}
                    </p>
                  </div>

                  {/* Specs Grid: Input & Output */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                      <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Input Data yang Diperlukan
                      </h4>
                      <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 list-disc list-inside">
                        {activeModuleDetail.inputData.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                      <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-sky-500" />
                        Output Visual & Format
                      </h4>
                      <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 list-disc list-inside">
                        {activeModuleDetail.outputVisual.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Methodology & Formula */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Calculator className="w-3.5 h-3.5 text-indigo-500" />
                      Metodologi & Rumus Linguistik
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 bg-indigo-50/50 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                      {activeModuleDetail.methodology}
                    </p>
                  </div>

                  {/* Tips */}
                  <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Tips Penggunaan Praktis:</strong>{' '}
                      <span>{activeModuleDetail.tips}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MATRIKS PERAN (ROLE MATRIX) */}
          {modalTab === 'roles' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Rekomendasi Alur Berdasarkan Peran Pengguna (Role-Based Access)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Sesuaikan penggunaan 12 modul dengan tanggung jawab peran masing-masing anggota tim riset dialektologi.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Role 1 */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-blue-700 dark:text-sky-300">
                      1. Surveyor Lapangan & Pencatat Fonetis
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 font-bold text-blue-800 dark:text-sky-300">
                      Entri & Validasi Fisik
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Bertanggung jawab atas akurasi titik koordinat GPS dan kelengkapan 200 kosakata Swadesh di lapangan.
                  </p>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Modul yang Direkomendasikan:</span>
                    <ul className="mt-1 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <li>• <strong>Modul 1 (Peta Tematik):</strong> Memeriksa apakah pin koordinat GPS desa berada di posisi geografis yang tepat.</li>
                      <li>• <strong>Modul 9 (Komparasi Dua Titik):</strong> Membandingkan langsung tuturan informan lokal dengan dialek acuan.</li>
                      <li>• <strong>Modul 11 (Kalkulator):</strong> Simulasi cepat jumlah perbedaan leksikal sebelum verifikasi final.</li>
                    </ul>
                  </div>
                </div>

                {/* Role 2 */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      2. Verifikator Linguistik & Kurator Data
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 font-bold text-indigo-800 dark:text-indigo-300">
                      Quality Assurance
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Memeriksa keabsahan transkripsi fonetis, etimologi kognat, dan konsistensi matriks perhitungan Guiter.
                  </p>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Modul yang Direkomendasikan:</span>
                    <ul className="mt-1 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <li>• <strong>Modul 8 (Klasifikasi):</strong> Memvalidasi batas ambang Guiter (apakah wajar beda dialek vs subdialek).</li>
                      <li>• <strong>Modul 2 (Isoglos Otomatis):</strong> Memverifikasi kelayakan garis pemisah spasial antar desa tetangga.</li>
                      <li>• <strong>Modul 11 (Tabel & Matriks):</strong> Mengoreksi nilai pembagi n jika terdapat glos yang gugur (kurang dari 200).</li>
                    </ul>
                  </div>
                </div>

                {/* Role 3 */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      3. Linguis Dialektolog & Peneliti Utama
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 font-bold text-emerald-800 dark:text-emerald-300">
                      Analisis Teoretis
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Menganalisis fenomena geolinguistik, inovasi leksikal, rintangan alam, dan hubungan kekerabatan bahasa.
                  </p>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Modul yang Direkomendasikan:</span>
                    <ul className="mt-1 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <li>• <strong>Modul 3 & 4 (Heatmap Spasial & Matriks):</strong> Mendeteksi kantong inovasi leksikal dan area konservatif.</li>
                      <li>• <strong>Modul 5 (Klaster D3):</strong> Eksplorasi hubungan multivariat non-linear bebas rintangan spasial.</li>
                      <li>• <strong>Modul 6 (Pohon Filogenetik):</strong> Mengonfirmasi struktur pohon kekerabatan kladistik UPGMA.</li>
                      <li>• <strong>Modul 12 (Glotokronologi):</strong> Menghitung waktu pisah tahun purba menggunakan formula Swadesh.</li>
                    </ul>
                  </div>
                </div>

                {/* Role 4 */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-amber-700 dark:text-amber-300">
                      4. Supervisor Riset & Editor Publikasi
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 font-bold text-amber-800 dark:text-amber-300">
                      Diseminasi & Kebijakan
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Menyusun rekomendasi pelestarian bahasa daerah dan menyiapkan ilustrasi laporan monograf atau jurnal internasional.
                  </p>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Modul yang Direkomendasikan:</span>
                    <ul className="mt-1 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <li>• <strong>Modul 7 (Scatter Plot IBD):</strong> Memverifikasi signifikansi korelasi jarak kilometer vs persentase beda.</li>
                      <li>• <strong>Modul 10 (Peta Isoglos Skematis):</strong> Menghasilkan grafik vektor SVG standar publikasi ilmiah.</li>
                      <li>• <strong>Ekspor CSV & PDF:</strong> Menghasilkan lampiran resmi untuk pemangku kepentingan (Badan Bahasa/Pemda).</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-indigo-500" />
            <span>Semua modul terhubung secara real-time dengan basis data 200 kosakata Swadesh.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold transition-colors cursor-pointer"
            >
              Tutup Panduan
            </button>
            <button
              type="button"
              onClick={() => {
                if (onSelectModule && selectedModuleId) {
                  onSelectModule(selectedModuleId);
                }
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-sm shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Buka Modul Terpilih</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
