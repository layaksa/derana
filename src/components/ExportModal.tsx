import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileJson, Printer, Check, Archive, Table, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import { InstrumenPemetaanBahasaData, SurveyRecord } from '../types/linguistic';
import { downloadAllSurveysJSON } from '../utils/surveyStorage';
import { generateRegionalSummaryPdf } from '../utils/generateRegionalSummaryPdf';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: InstrumenPemetaanBahasaData;
  surveys?: SurveyRecord[];
  onOpenRegionalReport?: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ 
  isOpen, 
  onClose, 
  data, 
  surveys = [],
  onOpenRegionalReport
}) => {
  const [copied, setCopied] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  if (!isOpen) return null;

  // Export as Multi-Sheet Excel Workbook (.xlsx)
  const handleExportExcelWorkbook = () => {
    try {
      setIsExportingExcel(true);
      const wb = XLSX.utils.book_new();

      // Sheet 1: Profil Wilayah & Titik Pengamatan
      const profilData = [
        { Parameter: 'Nama Desa / Titik', Nilai: data.titikPengamatan.namaDesa || '-' },
        { Parameter: 'Bahasa yang Diteliti', Nilai: data.titikPengamatan.bahasaDigunakan || '-' },
        { Parameter: 'Nama Lain Bahasa', Nilai: data.titikPengamatan.namaLainBahasa || '-' },
        { Parameter: 'Kecamatan', Nilai: data.titikPengamatan.kecamatan || '-' },
        { Parameter: 'Kabupaten / Kota', Nilai: data.titikPengamatan.kabupatenKota || '-' },
        { Parameter: 'Provinsi', Nilai: data.titikPengamatan.provinsi || '-' },
        { Parameter: 'Pulau', Nilai: data.titikPengamatan.pulau || '-' },
        { Parameter: 'Morfologi Wilayah', Nilai: data.situasiGeografis.morfologi || '-' },
        { Parameter: 'Letak Wilayah', Nilai: data.situasiGeografis.letakPantai || '-' },
        { Parameter: 'Jarak dari Pantai (km)', Nilai: data.situasiGeografis.jarakDariPantaiKm || '-' },
        { Parameter: 'Koordinat Lintang (Lat)', Nilai: data.situasiGeografis.koordinatLintang || '-' },
        { Parameter: 'Koordinat Bujur (Long)', Nilai: data.situasiGeografis.koordinatBujur || '-' },
        { Parameter: 'Perbatasan Timur', Nilai: `Desa ${data.situasiKebahasaan.timur.desa || '-'} (${data.situasiKebahasaan.timur.bahasa || '-'})` },
        { Parameter: 'Perbatasan Barat', Nilai: `Desa ${data.situasiKebahasaan.barat.desa || '-'} (${data.situasiKebahasaan.barat.bahasa || '-'})` },
        { Parameter: 'Perbatasan Utara', Nilai: `Desa ${data.situasiKebahasaan.utara.desa || '-'} (${data.situasiKebahasaan.utara.bahasa || '-'})` },
        { Parameter: 'Perbatasan Selatan', Nilai: `Desa ${data.situasiKebahasaan.selatan.desa || '-'} (${data.situasiKebahasaan.selatan.bahasa || '-'})` },
        { Parameter: 'Kategori Usia Desa', Nilai: data.usiaDesa.kategori || '-' },
        { Parameter: 'Estimasi Tahun Berdiri', Nilai: data.usiaDesa.estimasiTahun || '-' },
        { Parameter: 'Sejarah Singkat Desa', Nilai: data.sejarahDesa.sejarahSingkat || '-' },
        { Parameter: 'Asal Usul Nama Desa', Nilai: data.sejarahDesa.asalUsulNama || '-' }
      ];
      const wsProfil = XLSX.utils.json_to_sheet(profilData);
      XLSX.utils.book_append_sheet(wb, wsProfil, 'Profil_Wilayah');

      // Sheet 2: 200 Kosakata Swadesh
      const swadeshData = data.kosakataLengkap.swadeshList.map(item => ({
        'No': item.id,
        'Glos Indonesia': item.glosIndonesia,
        'Bentuk Lokal': item.bentukLokal || '',
        'Transkripsi Fonetis IPA': item.transkripsiIPA || '',
        'Catatan / Varian': item.catatan || '',
        'Tersedia Audio': item.audioUrl ? 'Ada Rekaman' : 'Belum'
      }));
      const wsSwadesh = XLSX.utils.json_to_sheet(swadeshData);
      XLSX.utils.book_append_sheet(wb, wsSwadesh, 'Swadesh_200');

      // Sheet 3: Kosakata Budaya
      const budayaRows: any[] = [];
      data.kosakataLengkap.kosakataBudaya.forEach(bidang => {
        bidang.daftarKata.forEach((item, idx) => {
          budayaRows.push({
            'Bidang Budaya': bidang.namaBidang,
            'Kode Bidang': bidang.kode,
            'No': idx + 1,
            'Glos Indonesia': item.glosIndonesia,
            'Bentuk Lokal': item.bentukLokal || '',
            'Transkripsi Fonetis IPA': item.transkripsiIPA || '',
            'Catatan': item.catatan || ''
          });
        });
      });
      if (budayaRows.length > 0) {
        const wsBudaya = XLSX.utils.json_to_sheet(budayaRows);
        XLSX.utils.book_append_sheet(wb, wsBudaya, 'Kosakata_Budaya');
      }

      // Sheet 4: Frasa & Kalimat
      const frasaKalimatRows: any[] = [];
      if (data.kosakataLengkap.strukturFrasa) {
        Object.entries(data.kosakataLengkap.strukturFrasa).forEach(([kategori, frasaList]) => {
          if (Array.isArray(frasaList)) {
            frasaList.forEach(frasa => {
              frasaKalimatRows.push({
                'Jenis': 'Frasa',
                'Kategori': frasa.kategori || kategori,
                'No / ID': frasa.id,
                'Glos Indonesia': frasa.labelIndonesia,
                'Bentuk Lokal': frasa.bentukFrasaLokal || '',
                'Terjemahan Harfiah': frasa.terjemahanHarfiah || '',
                'Penjelasan Struktur': frasa.penjelasanStruktur || ''
              });
            });
          }
        });
      }
      if (data.kosakataLengkap.kalimatSederhana && Array.isArray(data.kosakataLengkap.kalimatSederhana)) {
        data.kosakataLengkap.kalimatSederhana.forEach(kalimat => {
          frasaKalimatRows.push({
            'Jenis': 'Kalimat',
            'Kategori': 'Sintaksis Lapangan',
            'No / ID': kalimat.id,
            'Glos Indonesia': kalimat.kalimatIndonesia,
            'Bentuk Lokal': kalimat.kalimatLokal || '',
            'Terjemahan Harfiah': kalimat.glosPerKata || '',
            'Penjelasan Struktur': kalimat.analisisStruktur || ''
          });
        });
      }
      if (frasaKalimatRows.length > 0) {
        const wsFrasa = XLSX.utils.json_to_sheet(frasaKalimatRows);
        XLSX.utils.book_append_sheet(wb, wsFrasa, 'Frasa_dan_Kalimat');
      }

      // Sheet 5: Narasumber & Informan
      const narasumberRows = data.narasumberList.map((n, idx) => ({
        'Narasumber Ke-': idx + 1,
        'Nama Lengkap': n.nama || '-',
        'Jenis Kelamin': n.jenisKelamin || '-',
        'Usia (Tahun)': n.usia || '-',
        'Tahun Kelahiran': n.tahunKelahiran || '-',
        'Tempat Lahir': `${n.tempatLahir.desa || '-'}, ${n.tempatLahir.kecamatan || '-'}, ${n.tempatLahir.kabupatenKota || '-'}`,
        'Pendidikan Tertinggi': n.pendidikanTertinggi || '-',
        'Pekerjaan': `${n.pekerjaan.sebagaiApa || '-'} (Lokasi: ${n.pekerjaan.lokasiBekerja || '-'})`,
        'Lama Tinggal (Thn)': n.lamaTinggalTahun || '-',
        'Bahasa di Rumah': n.bahasaDigunakan.diRumah || '-',
        'Bahasa di Masyarakat': n.bahasaDigunakan.diMasyarakat || '-'
      }));
      const wsNarasumber = XLSX.utils.json_to_sheet(narasumberRows);
      XLSX.utils.book_append_sheet(wb, wsNarasumber, 'Narasumber');

      // Sheet 6: Dialektometri Pembanding (jika ada)
      if (data.dialektometri && data.dialektometri.titikPembandingList && data.dialektometri.titikPembandingList.length > 0) {
        const dialekRows = data.dialektometri.titikPembandingList.map(tp => ({
          'Titik Pembanding': tp.namaTitik,
          'Nama Desa': tp.desa || '-',
          'Bahasa': tp.bahasa || '-',
          'Jumlah Beda Leksikal (s)': tp.jumlahBeda || 0,
          'Total Pasangan Kata (n)': tp.jumlahGlos || 200,
          'Persentase Beda (%)': tp.persentaseBeda !== undefined ? `${tp.persentaseBeda}%` : '-',
          'Klasifikasi Dialektometri': tp.statusHubungan || '-'
        }));
        const wsDialek = XLSX.utils.json_to_sheet(dialekRows);
        XLSX.utils.book_append_sheet(wb, wsDialek, 'Dialektometri');
      }

      const desaClean = (data.titikPengamatan.namaDesa || 'Titik_Pengamatan').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `Pemetaan_Bahasa_${desaClean}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (err) {
      console.error('Gagal mengekspor file Excel:', err);
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Export as JSON
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = `Pemetaan_Bahasa_${data.titikPengamatan.namaDesa || 'Titik_Pengamatan'}_${new Date().toISOString().slice(0, 10)}.json`;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export Swadesh List as CSV
  const handleExportSwadeshCSV = () => {
    const headers = ['No', 'Glos Indonesia', 'Bentuk Lokal', 'Transkripsi IPA', 'Catatan'];
    const rows = data.kosakataLengkap.swadeshList.map(item => [
      item.id,
      `"${item.glosIndonesia.replace(/"/g, '""')}"`,
      `"${item.bentukLokal.replace(/"/g, '""')}"`,
      `"${item.transkripsiIPA.replace(/"/g, '""')}"`,
      `"${(item.catatan || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = `Swadesh_200_${data.titikPengamatan.namaDesa || 'Desa'}.csv`;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Copy JSON to clipboard
  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Print / PDF format report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto transition-colors">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Ekspor Data Pemetaan Bahasa
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {data.titikPengamatan.namaDesa ? `Titik Pengamatan: Desa ${data.titikPengamatan.namaDesa}` : 'Unduh instrumen survei dalam format terstandarisasi.'}
            </p>
          </div>
        </div>

        <div className="space-y-3 my-5">
          {/* FITUR UTAMA: LAPORAN RINGKASAN WILAYAH (PDF OTOMATIS) */}
          <div className="p-4 rounded-2xl border-2 border-indigo-500/60 dark:border-indigo-500/80 bg-linear-to-br from-indigo-50/80 via-white to-sky-50/50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 shadow-sm transition-all">
            <div className="flex items-start justify-between gap-2.5 mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Laporan Ringkasan Wilayah
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-900/80 text-indigo-800 dark:text-indigo-200">
                      PDF Otomatis
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                    Statistik resmi demografi, pendidikan, dan situasi kebahasaan wilayah ini.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-indigo-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-2">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {surveys.length} Titik survei dianalisis
              </span>
              <div className="flex items-center gap-2">
                {onOpenRegionalReport && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenRegionalReport();
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-indigo-700 dark:text-sky-300 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 hover:bg-indigo-50 transition-colors cursor-pointer"
                  >
                    Pratinjau Wilayah
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    generateRegionalSummaryPdf(surveys, {
                      province: data.titikPengamatan.provinsi || undefined,
                      regency: data.titikPengamatan.kabupatenKota || undefined,
                      village: data.titikPengamatan.namaDesa || undefined
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh PDF Sekarang</span>
                </button>
              </div>
            </div>
          </div>

          {/* JSON Full Data */}
          <button
            onClick={handleExportJSON}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 hover:bg-indigo-50/40 dark:hover:bg-slate-800/60 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-sky-400">
                <FileJson className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-900 dark:group-hover:text-white">
                  Unduh Formulir Aktif (JSON Lengkap)
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Seluruh 16 bagian instrumen, 200 kosakata Swadesh, narasumber, dan dialektometri.
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-sky-400 shrink-0 ml-2" />
          </button>

          {/* Multi-Sheet Excel Workbook (.xlsx) */}
          <button
            onClick={handleExportExcelWorkbook}
            disabled={isExportingExcel}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50/40 dark:hover:bg-slate-800/60 text-left transition-all group cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300">
                <Table className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-900 dark:group-hover:text-white">
                  Unduh Buku Kerja Excel (.xlsx Multi-Lembar)
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Format resmi riset: Profil Desa, 200 Swadesh, Kosakata Budaya, Frasa/Kalimat, dan Narasumber.
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 shrink-0 ml-2" />
          </button>

          {/* CSV Swadesh */}
          <button
            onClick={handleExportSwadeshCSV}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-slate-700 hover:bg-emerald-50/40 dark:hover:bg-slate-800/60 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-900 dark:group-hover:text-white">
                  Unduh 200 Kosakata Swadesh (CSV / Excel)
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tabel data glos, bentuk lokal, dan transkripsi fonetik untuk analisis dialektometri.
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 shrink-0 ml-2" />
          </button>

          {/* Print / Cetak Format Laporan */}
          <button
            onClick={handlePrint}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 hover:bg-blue-50/40 dark:hover:bg-slate-800/60 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-900 dark:group-hover:text-white">
                  Cetak / Simpan PDF Instrumen
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Format cetak bersih siap arsip penelitian lapangan atau laporan dinas.
                </div>
              </div>
            </div>
            <Printer className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 ml-2" />
          </button>

          {/* Unduh Dokumen Resmi PRD & User Flow (.doc) */}
          <a
            href="/docs/PRD_USER_FLOW_SISTEM_PEMETAAN_BAHASA.doc"
            download="PRD_USER_FLOW_SISTEM_PEMETAAN_BAHASA.doc"
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 hover:border-blue-400 hover:bg-blue-100/60 dark:hover:bg-blue-900/40 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-600 text-white shadow-2xs">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-blue-900 dark:text-blue-200 group-hover:text-blue-950 dark:group-hover:text-white flex items-center gap-2">
                  <span>Unduh Dokumen PRD & Detailed User Flow (.doc)</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-100 font-bold">
                    Word & PDF
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  Dokumen komprehensif spesifikasi produk, diagram alur 7 tahapan, formulasi dialektometri Guiter, dan kebutuhan teknis.
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 ml-2 group-hover:translate-y-0.5 transition-transform" />
          </a>

          {/* Backup all surveys */}
          {surveys.length > 0 && (
            <button
              onClick={() => downloadAllSurveysJSON(surveys)}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-slate-700 hover:bg-purple-50/40 dark:hover:bg-slate-800/60 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300">
                  <Archive className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-900 dark:group-hover:text-white">
                    Cadangkan Seluruh Koleksi ({surveys.length} Formulir)
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Satu berkas JSON berisi semua survei tersimpan di aplikasi.
                  </div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 shrink-0 ml-2" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <button
            onClick={handleCopyJSON}
            className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-sky-400 font-medium transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileJson className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin JSON ke Clipboard'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

