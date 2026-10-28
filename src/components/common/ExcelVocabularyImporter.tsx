import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  Upload, 
  Check, 
  AlertCircle, 
  Download, 
  Eye, 
  X, 
  ArrowRight,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { KosakataItem } from '../../types/linguistic';

interface ExcelVocabularyImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCustomList: (items: KosakataItem[]) => void;
  onUpdateSwadeshList: (items: { id?: number; glosIndonesia: string; bentukLokal: string; transkripsiIPA: string; catatan?: string }[]) => void;
}

export const ExcelVocabularyImporter: React.FC<ExcelVocabularyImporterProps> = ({
  isOpen,
  onClose,
  onImportCustomList,
  onUpdateSwadeshList
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'custom_list' | 'update_swadesh'>('custom_list');

  // Column mappings
  const [colGlos, setColGlos] = useState<string>('');
  const [colLokal, setColLokal] = useState<string>('');
  const [colIPA, setColIPA] = useState<string>('');
  const [colCatatan, setColCatatan] = useState<string>('');
  const [colId, setColId] = useState<string>('');

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        setWorkbook(wb);
        setSheetNames(wb.SheetNames);
        const firstSheet = wb.SheetNames[0];
        setSelectedSheet(firstSheet);
        loadSheetData(wb, firstSheet);
      } catch (err: any) {
        setErrorMsg('Gagal membaca file Excel. Pastikan file valid (.xlsx, .xls, .csv).');
      }
    };

    reader.readAsBinaryString(file);
  };

  const loadSheetData = (wb: XLSX.WorkBook, sheetName: string) => {
    const ws = wb.Sheets[sheetName];
    if (!ws) return;

    // Convert sheet to json array of objects
    const jsonData: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
    if (jsonData.length === 0) {
      setErrorMsg('Lembar kerja (sheet) ini kosong atau tidak memiliki baris data.');
      setRawHeaders([]);
      setRawRows([]);
      return;
    }

    const headers = Object.keys(jsonData[0]);
    setRawHeaders(headers);
    setRawRows(jsonData);

    // Auto-detect columns intelligently
    const detect = (candidates: string[]) => {
      const match = headers.find(h => 
        candidates.some(c => h.toLowerCase().trim().includes(c.toLowerCase()))
      );
      return match || '';
    };

    const autoId = detect(['no', 'nomor', 'id', 'kode', 'num']);
    const autoGlos = detect(['glos', 'indonesia', 'arti', 'makna', 'kata', 'ind']);
    const autoLokal = detect(['lokal', 'daerah', 'bahasa', 'bentuk', 'kata daerah', 'ucapan']);
    const autoIPA = detect(['ipa', 'fonetis', 'fonetik', 'transkripsi']);
    const autoCatatan = detect(['catatan', 'ket', 'keterangan', 'variasi', 'variasi dialek']);

    setColId(autoId);
    setColGlos(autoGlos || (headers.length > 1 ? headers[1] : headers[0]));
    setColLokal(autoLokal || (headers.length > 2 ? headers[2] : ''));
    setColIPA(autoIPA || '');
    setColCatatan(autoCatatan || '');
  };

  const handleSheetChange = (sheet: string) => {
    setSelectedSheet(sheet);
    if (workbook) {
      loadSheetData(workbook, sheet);
    }
  };

  // Preview generated items
  const previewItems: KosakataItem[] = rawRows.slice(0, 10).map((row, idx) => {
    const glos = colGlos && row[colGlos] !== undefined ? String(row[colGlos]).trim() : '';
    const lokal = colLokal && row[colLokal] !== undefined ? String(row[colLokal]).trim() : '';
    const ipa = colIPA && row[colIPA] !== undefined ? String(row[colIPA]).trim() : '';
    const catatan = colCatatan && row[colCatatan] !== undefined ? String(row[colCatatan]).trim() : '';
    const rawId = colId && row[colId] !== undefined ? parseInt(String(row[colId]), 10) : NaN;
    const itemId = !isNaN(rawId) && rawId > 0 ? rawId : idx + 1;

    return {
      id: itemId,
      glosIndonesia: glos || `Kata #${idx + 1}`,
      bentukLokal: lokal,
      transkripsiIPA: ipa,
      catatan
    };
  });

  const handleExecuteImport = () => {
    if (!colGlos) {
      setErrorMsg('Silakan pilih kolom untuk Glos / Kosakata Indonesia.');
      return;
    }

    const allItems: KosakataItem[] = rawRows.map((row, idx) => {
      const glos = colGlos && row[colGlos] !== undefined ? String(row[colGlos]).trim() : '';
      const lokal = colLokal && row[colLokal] !== undefined ? String(row[colLokal]).trim() : '';
      const ipa = colIPA && row[colIPA] !== undefined ? String(row[colIPA]).trim() : '';
      const catatan = colCatatan && row[colCatatan] !== undefined ? String(row[colCatatan]).trim() : '';
      const rawId = colId && row[colId] !== undefined ? parseInt(String(row[colId]), 10) : NaN;
      const itemId = !isNaN(rawId) && rawId > 0 ? rawId : idx + 1;

      return {
        id: itemId,
        glosIndonesia: glos || `Kata #${idx + 1}`,
        bentukLokal: lokal,
        transkripsiIPA: ipa,
        catatan
      };
    }).filter(item => item.glosIndonesia.trim() !== '' || item.bentukLokal.trim() !== '');

    if (allItems.length === 0) {
      setErrorMsg('Tidak ada baris kosakata yang dapat diimpor dari file Excel ini.');
      return;
    }

    if (importMode === 'custom_list') {
      onImportCustomList(allItems);
    } else {
      onUpdateSwadeshList(allItems);
    }

    onClose();
  };

  // Generate and download a sample template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'No': 1,
        'Glos Indonesia': 'semua',
        'Bentuk Lokal': 'kabéh',
        'Transkripsi IPA': '[kabɛh]',
        'Catatan': 'Dialek dataran'
      },
      {
        'No': 2,
        'Glos Indonesia': 'abu',
        'Bentuk Lokal': 'lebu',
        'Transkripsi IPA': '[lǝbu]',
        'Catatan': ''
      },
      {
        'No': 3,
        'Glos Indonesia': 'kulit kayu',
        'Bentuk Lokal': 'babakan',
        'Transkripsi IPA': '[babakan]',
        'Catatan': 'Bagian luar batang pohon'
      },
      {
        'No': 4,
        'Glos Indonesia': 'perut',
        'Bentuk Lokal': 'padharan',
        'Transkripsi IPA': '[padaran]',
        'Catatan': 'Krama / sopan'
      },
      {
        'No': 5,
        'Glos Indonesia': 'besar',
        'Bentuk Lokal': 'gedhé',
        'Transkripsi IPA': '[gǝdʰe]',
        'Catatan': ''
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Daftar Kosakata');
    XLSX.writeFile(wb, 'Template_Kosakata_Pemetaan_Bahasa.xlsx');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-emerald-100 text-emerald-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Impor Data Kosakata dari Excel (.xlsx / .csv)
              </h3>
              <p className="text-xs text-slate-500">
                Unggah file Excel untuk memuat daftar kosakata secara otomatis sesuai susunan lembar kerja Anda.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/70 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Upload Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-slate-700">
                Pilih Berkas Excel Kosakata:
              </label>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Contoh Template Excel</span>
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${
                fileName
                  ? 'border-emerald-300 bg-emerald-50/50'
                  : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-slate-50'
              }`}
            >
              {fileName ? (
                <div className="flex flex-col items-center gap-1.5 text-emerald-800">
                  <FileCheck className="w-8 h-8 text-emerald-600" />
                  <span className="font-semibold text-sm">{fileName}</span>
                  <span className="text-[11px] text-emerald-600">
                    {rawRows.length} baris terdeteksi • Klik untuk ganti file
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-slate-600">
                  <Upload className="w-7 h-7 text-slate-400" />
                  <span className="font-medium">Klik untuk memilih file Excel atau seret ke sini</span>
                  <span className="text-[11px] text-slate-400">Format yang didukung: .xlsx, .xls, .csv</span>
                </div>
              )}
            </div>
          </div>

          {/* Sheet Selector & Column Mapping */}
          {rawHeaders.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              {/* Sheet selector */}
              {sheetNames.length > 1 && (
                <div className="flex items-center gap-2">
                  <label className="font-semibold text-slate-700 shrink-0">Pilih Lembar (Sheet):</label>
                  <select
                    value={selectedSheet}
                    onChange={(e) => handleSheetChange(e.target.value)}
                    className="px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-xs font-medium"
                  >
                    {sheetNames.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Mode Selection */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">Metode Penerapan Kosakata:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className={`flex items-start gap-2.5 p-2.5 rounded-md border cursor-pointer transition-colors ${
                    importMode === 'custom_list' 
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900' 
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'custom_list'}
                      onChange={() => setImportMode('custom_list')}
                      className="mt-0.5 text-indigo-600"
                    />
                    <div>
                      <span className="font-bold block">Buat Tab Daftar Kosakata Khusus Excel</span>
                      <span className="text-[11px] text-slate-500">
                        Membuat tab khusus di Section 15 dengan daftar persis sesuai jumlah dan kata di Excel ({rawRows.length} kata).
                      </span>
                    </div>
                  </label>

                  <label className={`flex items-start gap-2.5 p-2.5 rounded-md border cursor-pointer transition-colors ${
                    importMode === 'update_swadesh' 
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900' 
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'update_swadesh'}
                      onChange={() => setImportMode('update_swadesh')}
                      className="mt-0.5 text-indigo-600"
                    />
                    <div>
                      <span className="font-bold block">Perbarui ke 200 Kosakata Swadesh</span>
                      <span className="text-[11px] text-slate-500">
                        Memetakan kata berdasarkan Glos Indonesia atau Nomor ke dalam 200 Swadesh standar.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Column Mapping Grid */}
              <div className="bg-slate-50 p-3.5 rounded-md border border-slate-200 space-y-3">
                <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Pemetaan Kolom Excel ke Kolom Aplikasi</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Kolom Nomor / ID */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Kolom No / ID (Opsional):
                    </label>
                    <select
                      value={colId}
                      onChange={(e) => setColId(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-md border border-slate-300 bg-white text-xs"
                    >
                      <option value="">-- Otomatis Berurutan --</option>
                      {rawHeaders.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* Kolom Glos Indonesia (Wajib) */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Kolom Glos Indonesia <span className="text-rose-500 font-bold">*</span>:
                    </label>
                    <select
                      value={colGlos}
                      onChange={(e) => setColGlos(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-md border border-indigo-300 bg-white text-xs font-semibold text-indigo-900"
                    >
                      <option value="">-- Pilih Kolom Glos --</option>
                      {rawHeaders.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* Kolom Bentuk Lokal */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Kolom Bentuk Lokal / Daerah:
                    </label>
                    <select
                      value={colLokal}
                      onChange={(e) => setColLokal(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-md border border-slate-300 bg-white text-xs"
                    >
                      <option value="">-- Tidak Ada --</option>
                      {rawHeaders.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* Kolom Transkripsi IPA */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Kolom Transkripsi IPA / Fonetis:
                    </label>
                    <select
                      value={colIPA}
                      onChange={(e) => setColIPA(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-md border border-slate-300 bg-white text-xs"
                    >
                      <option value="">-- Tidak Ada --</option>
                      {rawHeaders.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* Kolom Catatan */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Kolom Catatan / Variasi:
                    </label>
                    <select
                      value={colCatatan}
                      onChange={(e) => setColCatatan(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-md border border-slate-300 bg-white text-xs"
                    >
                      <option value="">-- Tidak Ada --</option>
                      {rawHeaders.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Preview Table */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Pratinjau Hasil Impor (Menampilkan {previewItems.length} dari {rawRows.length} baris)</span>
                  </span>
                </div>
                <div className="border border-slate-200 rounded-md overflow-x-auto max-h-48">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold sticky top-0">
                      <tr>
                        <th className="p-2 w-12 text-center">No</th>
                        <th className="p-2">Glos Indonesia</th>
                        <th className="p-2">Bentuk Lokal</th>
                        <th className="p-2 font-mono">Transkripsi IPA</th>
                        <th className="p-2">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 text-center font-mono text-slate-500">{item.id}</td>
                          <td className="p-2 font-medium text-slate-900">{item.glosIndonesia}</td>
                          <td className="p-2 text-indigo-700 font-medium">{item.bentukLokal || '-'}</td>
                          <td className="p-2 font-mono text-slate-600">{item.transkripsiIPA || '-'}</td>
                          <td className="p-2 text-slate-500">{item.catatan || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleExecuteImport}
            disabled={!colGlos || rawRows.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs disabled:opacity-50 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Impor {rawRows.length} Kosakata ke Kuesioner</span>
          </button>
        </div>
      </div>
    </div>
  );
};
