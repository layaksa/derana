import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileText, 
  Printer, 
  Compass, 
  CheckCircle2, 
  Layers, 
  Scale, 
  MapPin, 
  BookOpen, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  Users,
  Copy,
  Check
} from 'lucide-react';

interface PRDDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PRDDocumentModal: React.FC<PRDDocumentModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'userflow' | 'kuesioner16' | 'dialektometri' | 'gis_leaflet' | 'spesifikasi_fr'>('ringkasan');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handlePrintPDF = () => {
    window.print();
  };

  const handleCopyDocLink = () => {
    const url = window.location.origin + '/docs/PRD_USER_FLOW_SISTEM_PEMETAAN_BAHASA.doc';
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in print:p-0 print:bg-white">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:max-h-none print:border-none print:shadow-none">
        
        {/* HEADER BAR */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Product Requirement Document (PRD) & User Flow
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  v2.4 Production
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Dokumen Spesifikasi Teknis & Alur Pengguna Sistem Pemetaan Bahasa & Dialektometri (Derana Panel)
              </p>
            </div>
          </div>

          {/* ACTION BUTTONS: DOWNLOAD .DOC & PRINT PDF */}
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="/docs/PRD_USER_FLOW_SISTEM_PEMETAAN_BAHASA.doc"
              download="PRD_USER_FLOW_SISTEM_PEMETAAN_BAHASA.doc"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all cursor-pointer"
              title="Unduh berkas dokumen Microsoft Word (.doc) lengkap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh .DOC (Word)</span>
            </a>

            <button
              type="button"
              onClick={handlePrintPDF}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 shadow-2xs transition-all cursor-pointer"
              title="Cetak atau simpan sebagai PDF langsung dari peramban"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Cetak / PDF</span>
            </button>

            <button
              type="button"
              onClick={handleCopyDocLink}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Salin tautan berkas PRD"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Disalin' : 'Tautan'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ml-1"
              aria-label="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="px-5 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar print:hidden">
          <button
            type="button"
            onClick={() => setActiveTab('ringkasan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'ringkasan'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            1. Ringkasan Eksekutif & Persona
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('userflow')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'userflow'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            2. Detailed User Flow (7 Alur)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('kuesioner16')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'kuesioner16'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            3. Instrumen 16 Seksi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dialektometri')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'dialektometri'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            4. Formulasi Dialektometri Guiter
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gis_leaflet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'gis_leaflet'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            5. Leaflet GIS & Filter Spasial
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('spesifikasi_fr')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'spesifikasi_fr'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            6. Spesifikasi Kebutuhan FR & NFR
          </button>
        </div>

        {/* MODAL BODY WITH RICH CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
          
          {/* TAB 1: RINGKASAN EKSEKUTIF */}
          {activeTab === 'ringkasan' && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl p-4">
                <h3 className="text-base font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-blue-600" />
                  <span>Executive Summary: Derana Panel Enterprise Geolinguistics</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 text-justify">
                  Platform digital pemetaan bahasa komparatif berstandar Badan Pengembangan dan Pembinaan Bahasa Kemendikbudristek & UNESCO. Mengintegrasikan instrumen 16 seksi, kalkulasi indeks dialektometri Guiter instan, perekam audio leksikon Swadesh 200, deteksi kata serapan Gemini AI, peta interaktif Leaflet GIS multi-basemap dengan filtering multi-kriteria, serta modul Revitalisasi Bahasa Daerah (Model C Maluku: IKRBD & RAP).
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Matriks Peran Pengguna (Role-Based Access Control)
                </h4>
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                      <tr>
                        <th className="p-3">Peran (Role)</th>
                        <th className="p-3">Target Pengguna</th>
                        <th className="p-3">Hak Akses & Otorisasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr>
                        <td className="p-3 font-bold text-blue-600">Admin Sistem</td>
                        <td className="p-3">Koordinator Riset / Balai Bahasa</td>
                        <td className="p-3">Akses penuh seluruh survei, kelola pengguna & RBAC, hapus data permanen, ekspor nasional.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-emerald-600">Verifikator</td>
                        <td className="p-3">Peneliti Dialektologi Senior</td>
                        <td className="p-3">Telaah ilmiah data 16 seksi, pengesahan status <i>Tervalidasi</i>, catatan batas isoglos.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-indigo-600">Surveyor Lapangan</td>
                        <td className="p-3">Petugas Pendata di Desa</td>
                        <td className="p-3">Buat survei baru, input 16 seksi, rekam audio informan, simpan offline, sinkronkan ke cloud.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-600">Viewer / Tamu</td>
                        <td className="p-3">Akademisi & Peninjau Publik</td>
                        <td className="p-3">Mode hanya-baca (Read-Only) pada dashboard statistik, peta geospasial, dan perbandingan.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILED USER FLOW */}
          {activeTab === 'userflow' && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Diagram Alur Pengguna End-to-End (7 Tahapan Alur Kerja)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20">
                  <span className="font-bold text-blue-700 dark:text-blue-300 block mb-1">Alur 1: Autentikasi & Setup Profil</span>
                  <p className="text-slate-600 dark:text-slate-400">
                    Pengguna masuk via Google OAuth 2.0 atau Firebase Auth. Sistem mengecek status peran (Admin/Surveyor/Verifikator) di Firestore collection <code>users</code>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20">
                  <span className="font-bold text-indigo-700 dark:text-indigo-300 block mb-1">Alur 2: Manajemen Multi-Survei</span>
                  <p className="text-slate-600 dark:text-slate-400">
                    Pilihan "+ Formulir Baru", "+ Contoh Survei" (Desa Karangwangi), atau "Impor JSON". Sistem menetapkan <code>activeSurveyId</code> yang disimpan di storage lokal.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20">
                  <span className="font-bold text-emerald-700 dark:text-emerald-300 block mb-1">Alur 3: Pengisian 16 Seksi Instrumen</span>
                  <p className="text-slate-600 dark:text-slate-400">
                    Memilih mode Stepper 16 Layar atau Mode Gulir Penuh. Input otomatis tersimpan setiap 500ms (auto-save). Validasi error kolom disajikan secara real-time.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-teal-200 dark:border-teal-900 bg-teal-50/40 dark:bg-teal-950/20">
                  <span className="font-bold text-teal-700 dark:text-teal-300 block mb-1">Alur 4: Perekaman Audio & Deteksi AI</span>
                  <p className="text-slate-600 dark:text-slate-400">
                    Pada Seksi 15, surveyor merekam suara pelafalan per kata Swadesh 200 dan menekan tombol Gemini AI untuk deteksi kata serapan dan etimon Proto-Austronesia.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20">
                  <span className="font-bold text-amber-700 dark:text-amber-300 block mb-1">Alur 5: Dialektometri & Titik Pembanding</span>
                  <p className="text-slate-600 dark:text-slate-400">
                    Input Titik Acuan dan Titik Pembanding di Seksi 16. Rumus Guiter menghitung persentase perbedaan dan mengklasifikasikan status dialek secara seketika.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/40 dark:bg-purple-950/20">
                  <span className="font-bold text-purple-700 dark:text-purple-300 block mb-1">Alur 6: Visualisasi Leaflet & Filter</span>
                  <p className="text-slate-600 dark:text-slate-400">
                    Membuka peta spasial, beralih antara 5 basemap (termasuk Google Roads & Satelit), serta memfilter penanda berdasarkan status validasi dan kelompok usia informan.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 16 SEKSI INSTRUMEN */}
          {activeTab === 'kuesioner16' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Rincian 16 Bagian Instrumen Pemetaan Bahasa Terpadu
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { no: 1, title: 'Titik Pengamatan', desc: 'Nama desa, toponimi, bahasa digunakan, kecamatan, kabupaten, provinsi, dan koordinat lintang/bujur.' },
                  { no: 2, title: 'Situasi Kebahasaan', desc: 'Pemetaan bahasa dan desa yang berbatasan langsung di 4 mata angin: Timur, Barat, Utara, Selatan.' },
                  { no: 3, title: 'Situasi Geografis & Morfologi', desc: 'Jarak pantai, pedalaman/pesisir, morfologi alam, dan verifikasi titik dengan peta interaktif Leaflet.' },
                  { no: 4, title: 'Penduduk & Penutur', desc: 'Statistik demografi gender, usia (<20, 20-40, >40), penutur aktif bahasa daerah, dan kelompok etnis.' },
                  { no: 5, title: 'Mata Pencaharian', desc: 'Sebaran profesi dominan masyarakat: petani, nelayan, pedagang, buruh, pegawai, dan kearifan lokal.' },
                  { no: 6, title: 'Pendidikan', desc: 'Tingkat pendidikan warga (tidak sekolah, SD, SMP, SMA, PT, dan jumlah sarjana asal desa).' },
                  { no: 7, title: 'Sarana Pendidikan', desc: 'Ketersediaan gedung sekolah fisik dari tingkat dasar hingga perguruan tinggi dan lembaga kursus.' },
                  { no: 8, title: 'Agama', desc: 'Komposisi pemeluk agama warga (Islam, Kristen, Katolik, Hindu, Buddha, Konghucu, kepercayaan lokal).' },
                  { no: 9, title: 'Hubungan Mobilitas', desc: 'Tingkat kelancaran mobilitas warga dan interaksi sosial dengan wilayah luar desa.' },
                  { no: 10, title: 'Alat Transportasi', desc: 'Armada transportasi darat, laut, sungai, dan udara yang menjangkau desa pengamatan.' },
                  { no: 11, title: 'Usia Desa', desc: 'Kategori usia desa (<50 thn, 50-100, 200-500, >500) dan estimasi tahun pendirian.' },
                  { no: 12, title: 'Sejarah Desa', desc: 'Narasi sejarah berdirinya desa, asal-usul penamaan toponimi, dan tokoh perintis desa.' },
                  { no: 13, title: 'Folklore & Sastra Lisan', desc: 'Dokumentasi cerita rakyat (mitos, legenda, dongeng), tokoh sentral, dan nilai tradisi.' },
                  { no: 14, title: 'Data Narasumber (Triangulasi 3 Informan)', desc: 'Identitas minimal 3 informan lokal: usia, pekerjaan, lama tinggal, bahasa ibu, bahasa kedua, dan medsos.' },
                  { no: 15, title: 'Kosakata Lengkap, Audio & Deteksi AI', desc: '200 kata Swadesh, 18 bidang budaya (A-R), rekaman audio pelafalan per kata, frasa, kalimat S-P-O-K, dan AI loanword.' },
                  { no: 16, title: 'Dialektometri & Titik Pembanding', desc: 'Penghitungan otomatis indeks Guiter d=(s/n)*100%, matriks pembanding, dan batas isoglos lapangan.' }
                ].map((sec) => (
                  <div key={sec.no} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {sec.no}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{sec.title}</span>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">{sec.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DIALEKTOMETRI GUITER */}
          {activeTab === 'dialektometri' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-slate-900 text-white p-5 rounded-xl text-center">
                <span className="text-xs uppercase tracking-widest text-blue-400 font-bold">Formula Standar Geolinguistik</span>
                <div className="text-2xl font-mono font-bold mt-2 text-white">
                  d = ( s / n ) &times; 100%
                </div>
                <p className="text-xs text-slate-300 mt-2 max-w-lg mx-auto">
                  Dimana <b>d</b> adalah persentase perbedaan dialektometri, <b>s</b> adalah jumlah beda bentuk leksikal, dan <b>n</b> adalah jumlah seluruh konsep glos yang diperbandingkan.
                </p>
              </div>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="p-3">Rentang Indeks (d)</th>
                      <th className="p-3">Klasifikasi Hubungan</th>
                      <th className="p-3">Penjelasan & Interpretasi Ilmiah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="p-3 font-mono font-bold text-emerald-600">0% &le; d &le; 20%</td>
                      <td className="p-3 font-bold text-emerald-600">Kategori Tidak Berbeda</td>
                      <td className="p-3">Kurang dari 21% (≤ 20%): Kategori tidak berbeda (masih dalam satu variasi atau wicara yang sama).</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-sky-600">21% &le; d &le; 30%</td>
                      <td className="p-3 font-bold text-sky-600">Kategori Perbedaan Wicara</td>
                      <td className="p-3">21% – 30%: Kategori perbedaan wicara (speech difference).</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-amber-600">31% &le; d &le; 50%</td>
                      <td className="p-3 font-bold text-amber-600">Kategori Perbedaan Subdialek</td>
                      <td className="p-3">31% – 50%: Kategori perbedaan subdialek.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-orange-600">51% &le; d &le; 80%</td>
                      <td className="p-3 font-bold text-orange-600">Kategori Perbedaan Dialek</td>
                      <td className="p-3">51% – 80%: Kategori perbedaan dialek (berbeda dialek).</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-rose-600">81% &le; d &le; 100%</td>
                      <td className="p-3 font-bold text-rose-600">Kategori Perbedaan Bahasa</td>
                      <td className="p-3">81% – 100%: Kategori perbedaan bahasa (berbeda bahasa).</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: LEAFLET GIS & FILTERING */}
          {activeTab === 'gis_leaflet' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Kapabilitas Geospasial Leaflet GIS & Filter Spasial Multi-Kriteria
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>Lapisan Peta Dasar (Multi-Basemap)</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                    <li>• <b>CARTO Terang:</b> Peta cerah kontras tinggi untuk identifikasi titik dan label desa.</li>
                    <li>• <b>OpenStreetMap (OSM):</b> Peta toponimi jalan dan permukiman standar komunitas terbuka.</li>
                    <li>• <b>CARTO Gelap:</b> Mode gelap kontras tinggi untuk kenyamanan visual malam hari.</li>
                    <li>• <b>Google Maps Jalan:</b> Peta jalan resmi Google dengan presisi infrastruktur darat.</li>
                    <li>• <b>Google Satelit / Hibrida:</b> Citra satelit resolusi tinggi berlabel toponimi lengkap.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Fitur Pemfilteran Penanda Spasial</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                    <li>• <b>Filter Status Verifikasi:</b> Memfilter hanya pin bertanda <i>✓ Tervalidasi</i> atau telaah.</li>
                    <li>• <b>Filter Rentang Usia Informan:</b> Memilah titik berdasarkan informan Muda (&lt;25 thn), Dewasa (25-50 thn), atau Tetua Sepuh (&gt;50 thn) guna mengamati fenomena pergeseran bahasa antargenerasi.</li>
                    <li>• <b>Auto-fit Bounds:</b> Leaflet secara otomatis membingkai dan memusatkan kamera peta saat filter diubah.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SPESIFIKASI FR & NFR */}
          {activeTab === 'spesifikasi_fr' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Spesifikasi Kebutuhan Fungsional (FR) & Non-Fungsional (NFR)
              </h3>
              
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="p-2.5">ID</th>
                      <th className="p-2.5">Kategori Fitur</th>
                      <th className="p-2.5">Kriteria Penerimaan (Acceptance Criteria)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="p-2.5 font-bold text-blue-600">FR-01</td>
                      <td className="p-2.5 font-semibold">Multi-Survey Engine</td>
                      <td className="p-2.5">Pembuatan survei baru kosong, duplikasi, pemulihan dari cadangan JSON, auto-save 500ms.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-blue-600">FR-02</td>
                      <td className="p-2.5 font-semibold">Kuesioner 16 Seksi</td>
                      <td className="p-2.5">Dukungan mode 16 layar dan mode gulir penuh, validasi real-time, sinkronisasi koordinat seksi 1 ke seksi 3.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-blue-600">FR-03</td>
                      <td className="p-2.5 font-semibold">Perekam Audio Terintegrasi</td>
                      <td className="p-2.5">Web Audio API terintegrasi pada 200 glos Swadesh; audio tersimpan dalam data URL atau tautan cloud.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-blue-600">FR-04</td>
                      <td className="p-2.5 font-semibold">Gemini AI Loanword API</td>
                      <td className="p-2.5">Analisis etimologi serapan (Sanskerta, Arab, Belanda, Portugis, Hokkien, Melayu) via Gemini 3.8 Flash.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-blue-600">FR-05</td>
                      <td className="p-2.5 font-semibold">Kalkulator Guiter</td>
                      <td className="p-2.5">Penghitungan d=(s/n)*100% instan &lt;100ms, klasifikasi otomatis status dialek, matriks segitiga.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-blue-600">FR-06</td>
                      <td className="p-2.5 font-semibold">Leaflet GIS & Filtering</td>
                      <td className="p-2.5">5 basemap terintegrasi, filter marker verifikasi dan kelompok usia narasumber, jaring relasi spasial.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-blue-600">FR-07</td>
                      <td className="p-2.5 font-semibold">Offline-First PWA</td>
                      <td className="p-2.5">Service worker cache, beroperasi tanpa sinyal internet, antrean sinkronisasi dua arah ke Firestore.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-blue-600">FR-08</td>
                      <td className="p-2.5 font-semibold">Ekspor Dokumen Resmi</td>
                      <td className="p-2.5">Ekspor JSON, Excel (XLSX), CSV, serta dokumen Word (.doc) dan pencetakan PDF resmi.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER BAR */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs print:hidden">
          <span className="text-slate-500 dark:text-slate-400">
            Dokumen Resmi Standar Balai Bahasa & Geolinguistik Derana Panel &bull; Versi 2.4 (Oktober 2026)
          </span>

          <div className="flex items-center gap-2">
            <a
              href="/docs/PRD_USER_FLOW_SISTEM_PEMETAAN_BAHASA.doc"
              download="PRD_USER_FLOW_SISTEM_PEMETAAN_BAHASA.doc"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Dokumen (.doc)</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
