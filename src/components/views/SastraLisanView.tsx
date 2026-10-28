import React, { useState, useEffect, useMemo } from 'react';
import { 
  Scroll, 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  MapPin, 
  Users, 
  Music, 
  Tag, 
  Compass, 
  Award, 
  Share2, 
  Copy, 
  Check, 
  Info,
  Calendar,
  Layers,
  Plus,
  Eye,
  Lock
} from 'lucide-react';
import { SastraLisanRecord } from '../../types/sastraLisan';
import { 
  loadSastraLisanRecords, 
  deleteSastraLisanRecord, 
  exportSastraLisanToCSV 
} from '../../utils/sastraLisanStorage';
import { SastraLisanKuesionerModal } from './SastraLisanKuesionerModal';
import { InstrumenPemetaanBahasaData } from '../../types/linguistic';

interface SastraLisanViewProps {
  data?: InstrumenPemetaanBahasaData;
  canEdit?: boolean;
  selectedProvinceFilter?: string;
  onNavigateToMap?: () => void;
}

export const SastraLisanView: React.FC<SastraLisanViewProps> = ({
  data,
  canEdit = true,
  selectedProvinceFilter = 'all',
  onNavigateToMap
}) => {
  const [records, setRecords] = useState<SastraLisanRecord[]>(() => loadSastraLisanRecords());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SastraLisanRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string>('all');
  const [selectedBentukFilter, setSelectedBentukFilter] = useState<string>('all');
  const [showQuestionGuide, setShowQuestionGuide] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setRecords(loadSastraLisanRecords());
  }, []);

  const handleOpenNew = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: SastraLisanRecord) => {
    setEditingRecord(rec);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, nama: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data kuesioner sastra lisan "${nama}"?`)) {
      const updated = deleteSastraLisanRecord(id);
      setRecords(updated);
    }
  };

  const handleSaveSuccess = (saved: SastraLisanRecord) => {
    const updated = loadSastraLisanRecords();
    setRecords(updated);
  };

  const toggleCardExpand = (id: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopyQuote = (id: string, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Summary statistics
  const stats = useMemo(() => {
    const totalRecords = records.length;
    const languages = new Set<string>();
    const genres = new Set<string>();
    let activeCommunities = 0;

    records.forEach(r => {
      if (r.bahasaDigunakan) languages.add(r.bahasaDigunakan.trim());
      if (r.analisisJenis?.jenisUtama) genres.add(r.analisisJenis.jenisUtama);
      if (r.narasumber?.komunitas?.status === 'Ada') activeCommunities++;
    });

    return {
      totalRecords,
      totalLanguages: languages.size,
      totalGenres: genres.size,
      activeCommunities
    };
  }, [records]);

  // Filtered list
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (selectedProvinceFilter && selectedProvinceFilter !== 'all') {
        const p = (r.lokasi?.provinsi || 'Jawa Barat').trim().toLowerCase();
        if (p !== selectedProvinceFilter.trim().toLowerCase()) {
          return false;
        }
      }
      if (selectedGenreFilter !== 'all' && r.analisisJenis?.jenisUtama !== selectedGenreFilter) {
        return false;
      }
      if (selectedBentukFilter !== 'all' && r.bentukTuturan !== selectedBentukFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = r.namaSastraLisan?.toLowerCase().includes(q);
        const matchNarasumber = r.narasumber?.namaLengkap?.toLowerCase().includes(q);
        const matchDesa = r.lokasi?.desaKelurahan?.toLowerCase().includes(q);
        const matchBahasa = r.bahasaDigunakan?.toLowerCase().includes(q);
        const matchMotif = r.analisisMotif?.motifUtama?.toLowerCase().includes(q);
        const matchDeskripsi = r.deskripsiSingkat?.toLowerCase().includes(q);
        const matchProv = r.lokasi?.provinsi?.toLowerCase().includes(q);
        if (!matchTitle && !matchNarasumber && !matchDesa && !matchBahasa && !matchMotif && !matchDeskripsi && !matchProv) {
          return false;
        }
      }
      return true;
    });
  }, [records, selectedProvinceFilter, selectedGenreFilter, selectedBentukFilter, searchQuery]);

  // Default village & language from active survey data if available
  const defaultDesa = data?.titikPengamatan?.namaDesa || '';
  const defaultBahasa = data?.titikPengamatan?.bahasaDigunakan || 'Bahasa Sunda';
  const defaultKecamatan = data?.titikPengamatan?.kecamatan || '';
  const defaultKabupaten = data?.titikPengamatan?.kabupatenKota || '';
  const defaultProvinsi = data?.titikPengamatan?.provinsi || 'Jawa Barat';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
              <Scroll className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                  Instrumen Pemetaan Sastra Lisan
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                  28 Butir Baku & Motif
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-1.5 max-w-2xl leading-relaxed font-normal">
                Dokumentasi narasumber, konteks pertunjukan, transkripsi 28 butir baku, serta analisis otomatis klasifikasi jenis (Mite, Legenda, Dongeng, Tembang) dan indeks motif Stith Thompson.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center shrink-0">
            <button
              type="button"
              onClick={() => setShowQuestionGuide(!showQuestionGuide)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
            >
              <Info className="w-3.5 h-3.5 text-indigo-500" />
              <span>{showQuestionGuide ? 'Tutup Panduan 28 Butir' : 'Daftar 28 Butir Baku'}</span>
            </button>

            {onNavigateToMap && (
              <button
                type="button"
                onClick={onNavigateToMap}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-purple-200 dark:border-purple-800 shadow-2xs"
                title="Buka Peta Geospasial Sastra Lisan CARTO"
              >
                <Compass className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Buka Peta Sastra Lisan</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => exportSastraLisanToCSV(records)}
              disabled={records.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
              title="Unduh seluruh data kuesioner sastra lisan dalam format CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ekspor CSV</span>
            </button>

            {canEdit && (
              <button
                type="button"
                onClick={handleOpenNew}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>+ Isi Kuesioner Sastra Lisan</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Karya Terdata</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.totalRecords}</span>
              <span className="text-xs text-slate-400">Dokumen</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Bahasa Digunakan</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalLanguages}</span>
              <span className="text-xs text-slate-400">Bahasa</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Ragam Klasifikasi Jenis</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.totalGenres}</span>
              <span className="text-xs text-slate-400">Genre</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Komunitas Penguri-uri</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.activeCommunities}</span>
              <span className="text-xs text-slate-400">Komunitas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible 28-Question Reference Guide */}
      {showQuestionGuide && (
        <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Struktur 28 Butir Baku Instrumen Pemetaan Sastra Lisan
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Berdasarkan Standar Badan Bahasa</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Bagian A */}
            <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
              <h4 className="font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                A. DATA NARASUMBER (Butir 1 - 11)
              </h4>
              <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                <li><strong>1.</strong> Nama Lengkap</li>
                <li><strong>2.</strong> Komunitas (Ada/Tidak ada, Nama, Tanggal Pendirian, Nama Pendiri, Alamat Sekretariat)</li>
                <li><strong>3.</strong> Tempat, Tanggal Lahir & Usia</li>
                <li><strong>4.</strong> Jenis Kelamin (Laki-laki / Perempuan)</li>
                <li><strong>5.</strong> Kategori Narasumber (Juru cerita/pendukung aktif vs pasif)</li>
                <li><strong>6.</strong> Pekerjaan</li>
                <li><strong>7.</strong> Keahlian Selain Pekerjaan</li>
                <li><strong>8.</strong> Suku Bangsa</li>
                <li><strong>9.</strong> Daerah Asal Narasumber</li>
                <li><strong>10.</strong> Bahasa yang Dikuasai</li>
                <li><strong>11.</strong> Kondisi Fisik Informan</li>
              </ul>
            </div>

            {/* Bagian B */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Scroll className="w-3.5 h-3.5 text-indigo-500" />
                B. DATA SASTRA LISAN (Butir 1 - 28)
              </h4>
              <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                <li><strong>1.</strong> Nama Sastra Lisan</li>
                <li><strong>2.</strong> Lokasi Pengambilan Data (Provinsi, Kab/Kota, Kecamatan, Desa/Kelurahan, Jalan, Kode Pos, Titik Koordinat)</li>
                <li><strong>3-6. Bentuk:</strong> Kategori Penutur, Bentuk Tuturan, Bahasa yang Digunakan, Iringan Musik</li>
                <li><strong>7-11. Deskripsi Fisik Pertunjukan:</strong> Tempat, Dekorasi, Kostum, Formasi, Posisi Penonton (Interaksi, Waktu, Syarat)</li>
                <li><strong>12-13. Isi:</strong> Deskripsi Singkat Isi Sastra Lisan, Kutipan Tuturan</li>
                <li><strong>14-24. Konteks:</strong> Daerah Asal, Persebaran, Suku Pemilik, Gambaran Topografis, Khalayak/Penonton (Jumlah, Usia, Gender), Tujuan, Suasana, Frekuensi, Komunitas yang Menghidupi, Sistem Pewarisan, Infrastruktur</li>
                <li><strong>25-28. Pengambilan Data & Hasil:</strong> Pengambil Data (Nama, Satuan Kerja, Tanggal), Hasil Dokumentasi, Transkripsi, dan Terjemahan</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari karya sastra lisan, narasumber, desa, bahasa, atau motif..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Genre filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={selectedGenreFilter}
              onChange={(e) => setSelectedGenreFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">Semua Jenis / Genre</option>
              <option value="Legenda">Legenda</option>
              <option value="Mite / Mitos">Mite / Mitos</option>
              <option value="Dongeng / Fabel">Dongeng / Fabel</option>
              <option value="Nyanyian Rakyat / Tembang">Nyanyian Rakyat / Tembang</option>
              <option value="Puisi Lisan / Mantra">Puisi Lisan / Mantra</option>
              <option value="Teater / Drama Tutur">Teater / Drama Tutur</option>
            </select>
          </div>

          {/* Bentuk tuturan filter */}
          <select
            value={selectedBentukFilter}
            onChange={(e) => setSelectedBentukFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="all">Semua Bentuk Tuturan</option>
            <option value="Diceritakan">Diceritakan</option>
            <option value="Dinyanyikan">Dinyanyikan</option>
            <option value="Dibacakan">Dibacakan</option>
            <option value="dialog">Dialog</option>
          </select>
        </div>
      </div>

      {/* Main List of Sastra Lisan Records */}
      {filteredRecords.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <Scroll className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {records.length === 0 ? 'Belum Ada Data Kuesioner Sastra Lisan' : 'Tidak Ada Data yang Sesuai Filter'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            {records.length === 0 
              ? 'Mulai dokumentasikan sastra lisan di wilayah penelitian Anda dengan mengisi kuesioner 28 butir baku.'
              : 'Coba ubah kata kunci pencarian atau sesuaikan opsi filter genre dan bentuk tuturan.'}
          </p>
          {canEdit && (
            <button
              type="button"
              onClick={handleOpenNew}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Isi Kuesioner Sastra Lisan Sekarang</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((rec) => {
            const isExpanded = !!expandedCards[rec.id];
            const genreName = rec.analisisJenis?.jenisUtama || 'Sastra Lisan';
            
            // Badge color based on genre
            let badgeClass = 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
            if (genreName === 'Mite / Mitos') {
              badgeClass = 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
            } else if (genreName.includes('Nyanyian')) {
              badgeClass = 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
            } else if (genreName.includes('Puisi') || genreName.includes('Mantra')) {
              badgeClass = 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
            } else if (genreName.includes('Dongeng')) {
              badgeClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
            }

            return (
              <div 
                key={rec.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all space-y-4"
              >
                {/* Top Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                        {rec.namaSastraLisan}
                      </h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeClass}`}>
                        {genreName}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium border border-slate-200 dark:border-slate-700">
                        {rec.bentukTuturan}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        Narasumber: <strong className="text-slate-700 dark:text-slate-300">{rec.narasumber?.namaLengkap}</strong>
                        {rec.narasumber?.usia && ` (${rec.narasumber.usia} thn)`}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {rec.lokasi?.desaKelurahan}, {rec.lokasi?.kecamatan}, {rec.lokasi?.kabupatenKota}
                      </span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                        {rec.bahasaDigunakan}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0">
                    {canEdit ? (
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(rec)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-indigo-200/60 dark:border-indigo-800/60"
                        title="Buka atau edit kuesioner lengkap"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Kuesioner</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(rec)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                        title="Tinjau butir kuesioner sastra lisan (Mode Hanya Baca)"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Instrumen</span>
                      </button>
                    )}

                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => handleDelete(rec.id, rec.namaSastraLisan)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Hapus data kuesioner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleCardExpand(rec.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer ml-1"
                      title={isExpanded ? 'Ciutkan rincian' : 'Bentangkan rincian lengkap'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Excerpt and Brief Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Kutipan Tuturan */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 relative">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                        Kutipan Tuturan Asli (Butir 13)
                      </span>
                      {rec.kutipanTuturan && (
                        <button
                          type="button"
                          onClick={() => handleCopyQuote(rec.id, rec.kutipanTuturan)}
                          className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === rec.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === rec.id ? 'Tersalin' : 'Salin'}</span>
                        </button>
                      )}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed line-clamp-3">
                      {rec.kutipanTuturan ? `"${rec.kutipanTuturan}"` : 'Belum ada kutipan tuturan terlampir.'}
                    </p>
                  </div>

                  {/* Analisis Motif Stith Thompson */}
                  <div className="p-3.5 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        Analisis Motif Stith Thompson
                      </span>
                      {rec.analisisJenis?.confidenceScore && (
                        <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/60 px-1.5 py-0.5 rounded">
                          Skor {rec.analisisJenis.confidenceScore}%
                        </span>
                      )}
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 font-semibold line-clamp-1">
                      {rec.analisisMotif?.motifUtama || 'Motif Budaya & Nilai Moral Kolektif'}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {rec.analisisMotif?.daftarMotifThompson?.slice(0, 3).map((m, idx) => (
                        <span 
                          key={idx} 
                          className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-[10px] font-mono text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/80"
                        >
                          {m.kodeThompson}: {m.namaMotif}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Expanded Detailed 28-Question Fields */}
                {isExpanded && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in text-xs">
                    {/* Ringkasan Isi Cerita */}
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Deskripsi Singkat Isi Sastra Lisan (Butir 12):
                      </h4>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800">
                        {rec.deskripsiSingkat || 'Belum ada deskripsi singkat.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Pertunjukan */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px] uppercase tracking-wider text-slate-400">
                          Fisik Pertunjukan (7-11)
                        </span>
                        <div><span className="text-slate-500">Tempat:</span> <strong className="text-slate-700 dark:text-slate-300">{rec.tempatPertunjukan || '-'}</strong></div>
                        <div><span className="text-slate-500">Iringan Musik:</span> <strong className="text-slate-700 dark:text-slate-300">{rec.iringanMusik || 'Tanpa iringan musik'}</strong></div>
                        <div><span className="text-slate-500">Waktu & Syarat:</span> <strong className="text-slate-700 dark:text-slate-300">{rec.waktuPertunjukan || '-'} {rec.syaratPertunjukan ? `(${rec.syaratPertunjukan})` : ''}</strong></div>
                        <div><span className="text-slate-500">Penonton:</span> <strong className="text-slate-700 dark:text-slate-300">{rec.khalayakPenonton?.jumlah || '-'} penonton</strong></div>
                      </div>

                      {/* Konteks */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px] uppercase tracking-wider text-slate-400">
                          Konteks Budaya (14-24)
                        </span>
                        <div><span className="text-slate-500">Suku Pemilik:</span> <strong className="text-slate-700 dark:text-slate-300">{rec.sukuPemilik || '-'}</strong></div>
                        <div><span className="text-slate-500">Persebaran:</span> <strong className="text-slate-700 dark:text-slate-300">{rec.persebaran || '-'}</strong></div>
                        <div><span className="text-slate-500">Tujuan:</span> <strong className="text-slate-700 dark:text-slate-300">{rec.tujuanPertunjukan || '-'}</strong></div>
                        <div><span className="text-slate-500">Komunitas:</span> <strong className="text-slate-700 dark:text-slate-300">{rec.komunitasMenghidupi || '-'}</strong></div>
                      </div>

                      {/* Dokumentasi */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px] uppercase tracking-wider text-slate-400">
                          Dokumentasi & Tim (25-28)
                        </span>
                        <div><span className="text-slate-500">Pengambil Data:</span> <strong className="text-slate-700 dark:text-slate-300">{rec.pengambilData?.nama || '-'}</strong></div>
                        <div><span className="text-slate-500">Bentuk Rekaman:</span> <strong className="text-slate-700 dark:text-slate-300">{rec.hasilDokumentasi?.bentukDokumentasi || '-'}</strong></div>
                        <div><span className="text-slate-500">Pentranskripsi:</span> <strong className="text-slate-700 dark:text-slate-300">{rec.transkripsi?.namaPentranskripsi || '-'}</strong></div>
                        <div><span className="text-slate-500">Penerjemah:</span> <strong className="text-slate-700 dark:text-slate-300">{rec.terjemahan?.namaPenerjemah || '-'}</strong></div>
                      </div>
                    </div>

                    {/* Amanat Moral & Fungsi Sosial Bascom */}
                    {rec.analisisMotif && (
                      <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                        <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 mb-1">
                          <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          Amanat Moral & Fungsi Sosial (Bascom):
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 italic mb-2">
                          "{rec.analisisMotif.amanatMoral}"
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {rec.analisisMotif.fungsiSosialBascom?.map((f, i) => (
                            <span 
                              key={i} 
                              className="px-2 py-0.5 rounded bg-emerald-100/70 dark:bg-emerald-900/50 text-[10px] font-semibold text-emerald-800 dark:text-emerald-200"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Sastra Lisan 28-Question Modal */}
      <SastraLisanKuesionerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveSuccess={handleSaveSuccess}
        initialData={editingRecord}
        canEdit={canEdit}
        defaultDesa={defaultDesa}
        defaultBahasa={defaultBahasa}
        defaultKecamatan={defaultKecamatan}
        defaultKabupaten={defaultKabupaten}
        defaultProvinsi={defaultProvinsi}
      />
    </div>
  );
};
