import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Activity, 
  Plus, 
  Download, 
  Printer, 
  Search, 
  Filter, 
  Scale, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  Calendar, 
  Users, 
  BookOpen, 
  Trash2, 
  Edit3, 
  ChevronDown, 
  ChevronUp, 
  Building, 
  FileText, 
  TrendingUp,
  Sliders,
  Check,
  Globe2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { 
  RevitalisasiMonevRecord, 
  RevitalisasiRAPRecord,
  KategoriIKRBD 
} from '../../types/revitalisasi';
import { 
  loadMonevRecords, 
  saveMonevRecord, 
  deleteMonevRecord, 
  exportMonevToCSV,
  loadRAPRecords,
  saveRAPRecord,
  deleteRAPRecord,
  exportRAPToCSV
} from '../../utils/revitalisasiStorage';
import { MonevKuesionerModal } from './MonevKuesionerModal';
import { RAPKuesionerModal } from './RAPKuesionerModal';
import { getIKRBDCategory, MONEV_DIMENSI_CONFIG } from '../../data/revitalisasiData';
import { InstrumenPemetaanBahasaData } from '../../types/linguistic';

interface RevitalisasiViewProps {
  data?: InstrumenPemetaanBahasaData;
  canEdit?: boolean;
  selectedProvinceFilter?: string;
  onNavigateToMap?: () => void;
}

export const RevitalisasiView: React.FC<RevitalisasiViewProps> = ({
  data,
  canEdit = true,
  selectedProvinceFilter = 'all',
  onNavigateToMap
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'monev' | 'rap' | 'simulasi'>('monev');
  const [monevList, setMonevList] = useState<RevitalisasiMonevRecord[]>(() => loadMonevRecords());
  const [rapList, setRapList] = useState<RevitalisasiRAPRecord[]>(() => loadRAPRecords());

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKategori, setFilterKategori] = useState<string>('all');

  // Modals state
  const [isMonevModalOpen, setIsMonevModalOpen] = useState(false);
  const [editingMonev, setEditingMonev] = useState<RevitalisasiMonevRecord | null>(null);

  const [isRAPModalOpen, setIsRAPModalOpen] = useState(false);
  const [editingRAP, setEditingRAP] = useState<RevitalisasiRAPRecord | null>(null);

  // Interactive Live Simulator Sliders
  const [simD1, setSimD1] = useState<number>(4.25);
  const [simD2, setSimD2] = useState<number>(3.75);
  const [simD3, setSimD3] = useState<number>(3.67);
  const [simD4, setSimD4] = useState<number>(3.00);
  const [simD5, setSimD5] = useState<number>(4.00);

  const simResult = useMemo(() => {
    const raw = ((simD1 * 0.25) + (simD2 * 0.20) + (simD3 * 0.20) + (simD4 * 0.175) + (simD5 * 0.175)) * 20;
    const ikrbdScore = Number(raw.toFixed(2));
    const cat = getIKRBDCategory(ikrbdScore);
    return {
      ikrbdScore,
      kategori: cat.kategori,
      statusPelaksanaan: cat.statusPelaksanaan,
      intervensiKebijakan: cat.intervensiKebijakan,
      badgeColor: cat.badgeColor
    };
  }, [simD1, simD2, simD3, simD4, simD5]);

  // Filtered Monev
  const filteredMonev = useMemo(() => {
    return monevList.filter(m => {
      if (filterKategori !== 'all' && m.kategori !== filterKategori) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        m.bahasaDaerah.toLowerCase().includes(q) ||
        m.desa.toLowerCase().includes(q) ||
        m.kecamatan.toLowerCase().includes(q) ||
        m.kabupatenKota.toLowerCase().includes(q) ||
        m.petugasMonev.toLowerCase().includes(q)
      );
    });
  }, [monevList, filterKategori, searchQuery]);

  // Filtered RAP
  const filteredRAP = useMemo(() => {
    return rapList.filter(r => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.bahasaDaerah.toLowerCase().includes(q) ||
        r.profilPengajar.namaLengkap.toLowerCase().includes(q) ||
        r.profilPengajar.instansiUnitKerja.toLowerCase().includes(q) ||
        r.profilPengajar.wilayahTarget.toLowerCase().includes(q)
      );
    });
  }, [rapList, searchQuery]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalMonev = monevList.length;
    const avgScore = totalMonev > 0
      ? Number((monevList.reduce((acc, m) => acc + (m.ikrbdScore || 0), 0) / totalMonev).toFixed(2))
      : 0;
    const sangatBerhasilCount = monevList.filter(m => m.kategori === 'SANGAT BERHASIL').length;
    const berhasilCount = monevList.filter(m => m.kategori === 'BERHASIL').length;
    const kritisCount = monevList.filter(m => m.kategori === 'KURANG BERHASIL' || m.kategori === 'TIDAK BERHASIL').length;

    const totalTargetGuru = rapList.reduce((acc, r) => acc + (r.sasaran.targetJumlahPengajarSejawat || 0), 0);
    const totalTargetSiswa = rapList.reduce((acc, r) => acc + (r.sasaran.targetJumlahPenuturMuda || 0), 0);

    return {
      totalMonev,
      avgScore,
      sangatBerhasilCount,
      berhasilCount,
      kritisCount,
      totalRAP: rapList.length,
      totalTargetGuru,
      totalTargetSiswa
    };
  }, [monevList, rapList]);

  // Monev Handlers
  const handleOpenNewMonev = () => {
    setEditingMonev(null);
    setIsMonevModalOpen(true);
  };

  const handleEditMonev = (record: RevitalisasiMonevRecord) => {
    setEditingMonev(record);
    setIsMonevModalOpen(true);
  };

  const handleDeleteMonev = (id: string, name: string) => {
    if (window.confirm(`Hapus data Monev IKRBD untuk "${name}"?`)) {
      const updated = deleteMonevRecord(id);
      setMonevList(updated);
    }
  };

  const handleSaveMonev = (saved: RevitalisasiMonevRecord) => {
    const updated = saveMonevRecord(saved);
    setMonevList(updated);
  };

  // RAP Handlers
  const handleOpenNewRAP = () => {
    setEditingRAP(null);
    setIsRAPModalOpen(true);
  };

  const handleEditRAP = (record: RevitalisasiRAPRecord) => {
    setEditingRAP(record);
    setIsRAPModalOpen(true);
  };

  const handleDeleteRAP = (id: string, name: string) => {
    if (window.confirm(`Hapus dokumen Rencana Aksi Pengimbasan (RAP) "${name}"?`)) {
      const updated = deleteRAPRecord(id);
      setRapList(updated);
    }
  };

  const handleSaveRAP = (saved: RevitalisasiRAPRecord) => {
    const updated = saveRAPRecord(saved);
    setRapList(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* HERO BANNER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-sky-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Korpus Kebahasaan • Model C Maluku</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                71 Bahasa Terancam Punah
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              Revitalisasi Bahasa Daerah & Monev IKRBD
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed font-normal">
              Instrumen Monitoring & Evaluasi Indeks Kinerja Revitalisasi Bahasa Daerah (IKRBD - 5 Dimensi) 
              serta Format Rencana Aksi Pengimbasan (RAP) bagi pengajar utama penutur muda bahasa kepulauan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            {activeSubTab === 'monev' ? (
              <>
                <button
                  type="button"
                  onClick={handleOpenNewMonev}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Isi Monev IKRBD Baru</span>
                </button>
                <button
                  type="button"
                  onClick={() => exportMonevToCSV(monevList)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                  title="Unduh data Monev dalam format CSV / Excel"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ekspor CSV</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleOpenNewRAP}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat Dokumen RAP Baru</span>
                </button>
                <button
                  type="button"
                  onClick={() => exportRAPToCSV(rapList)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                  title="Unduh data RAP dalam format CSV / Excel"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ekspor CSV</span>
                </button>
              </>
            )}

            {onNavigateToMap && (
              <button
                type="button"
                onClick={onNavigateToMap}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-teal-200 dark:border-teal-800 shadow-2xs"
                title="Buka Peta Geospasial Revitalisasi Bahasa CARTO"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Buka Peta Revitalisasi</span>
              </button>
            )}
          </div>
        </div>

        {/* METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Titik Evaluasi Monev</span>
            <div className="flex items-baseline gap-1 mt-1">
              <strong className="text-xl font-bold text-slate-900 dark:text-white">{metrics.totalMonev}</strong>
              <span className="text-[10px] text-slate-400">Negeri/Desa</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50">
            <span className="text-[11px] text-blue-700 dark:text-sky-300 block font-medium">Rata-rata Skor IKRBD</span>
            <div className="flex items-baseline gap-1 mt-1">
              <strong className="text-xl font-bold text-blue-700 dark:text-sky-400">{metrics.avgScore}</strong>
              <span className="text-[10px] text-blue-500">/ 100</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50">
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block font-medium">Target Pengajar Terimbas</span>
            <div className="flex items-baseline gap-1 mt-1">
              <strong className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{metrics.totalTargetGuru}</strong>
              <span className="text-[10px] text-emerald-500">Guru Sejawat</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/50">
            <span className="text-[11px] text-purple-700 dark:text-purple-300 block font-medium">Target Penutur Muda</span>
            <div className="flex items-baseline gap-1 mt-1">
              <strong className="text-xl font-bold text-purple-700 dark:text-purple-400">{metrics.totalTargetSiswa}</strong>
              <span className="text-[10px] text-purple-500">Siswa & Remaja</span>
            </div>
          </div>
        </div>
      </div>

      {/* SUB-NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <button
            type="button"
            onClick={() => setActiveSubTab('monev')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'monev'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Instrumen Monev IKRBD ({monevList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('rap')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'rap'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Rencana Aksi Pengimbasan / RAP ({rapList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('simulasi')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'simulasi'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulator Rumus 5 Dimensi</span>
          </button>
        </div>

        {/* Search Input (For Monev / RAP tabs) */}
        {activeSubTab !== 'simulasi' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari bahasa, desa, wilayah..."
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs placeholder-slate-400 focus:outline-hidden focus:border-blue-600"
              />
            </div>

            {activeSubTab === 'monev' && (
              <select
                value={filterKategori}
                onChange={e => setFilterKategori(e.target.value)}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden"
              >
                <option value="all">Semua Kategori</option>
                <option value="SANGAT BERHASIL">Sangat Berhasil (85-100)</option>
                <option value="BERHASIL">Berhasil (70-84.99)</option>
                <option value="CUKUP BERHASIL">Cukup Berhasil (55-69.99)</option>
                <option value="KURANG BERHASIL">Kurang Berhasil (40-54.99)</option>
                <option value="TIDAK BERHASIL">Tidak Berhasil (&lt;40)</option>
              </select>
            )}
          </div>
        )}
      </div>

      {/* TAB CONTENT 1: MONEV IKRBD RECORDS */}
      {activeSubTab === 'monev' && (
        <div className="space-y-4">
          {filteredMonev.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3">
              <Activity className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Belum ada data evaluasi Monev yang sesuai.
              </p>
              <button
                type="button"
                onClick={handleOpenNewMonev}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Mulai Pengisian Monev Baru</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMonev.map(record => {
                const catMeta = getIKRBDCategory(record.ikrbdScore);

                return (
                  <div
                    key={record.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-400 dark:hover:border-slate-700 transition-all"
                  >
                    <div>
                      {/* Card Header Strip */}
                      <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {record.bahasaDaerah}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${catMeta.badgeColor}`}>
                              {record.kategori}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Negeri/Desa {record.desa}, Kec. {record.kecamatan}, {record.kabupatenKota}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">IKRBD</span>
                          <span className="text-xl font-black text-blue-600 dark:text-sky-400">
                            {record.ikrbdScore}
                          </span>
                        </div>
                      </div>

                      {/* 5 Dimensi Mini Score Grid */}
                      <div className="grid grid-cols-5 gap-1.5 py-3 text-center text-[10px]">
                        <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                          <span className="text-slate-400 block text-[9px]">S̄₁ Subjek</span>
                          <strong className="text-slate-800 dark:text-slate-200 font-bold">{record.rataRataDimensi.d1}</strong>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                          <span className="text-slate-400 block text-[9px]">S̄₂ Komunitas</span>
                          <strong className="text-slate-800 dark:text-slate-200 font-bold">{record.rataRataDimensi.d2}</strong>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                          <span className="text-slate-400 block text-[9px]">S̄₃ Modul</span>
                          <strong className="text-slate-800 dark:text-slate-200 font-bold">{record.rataRataDimensi.d3}</strong>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                          <span className="text-slate-400 block text-[9px]">S̄₄ Regulasi</span>
                          <strong className="text-slate-800 dark:text-slate-200 font-bold">{record.rataRataDimensi.d4}</strong>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                          <span className="text-slate-400 block text-[9px]">S̄₅ Festival</span>
                          <strong className="text-slate-800 dark:text-slate-200 font-bold">{record.rataRataDimensi.d5}</strong>
                        </div>
                      </div>

                      {/* Status and Action summary */}
                      <div className="text-xs space-y-1.5 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        <p className="text-slate-700 dark:text-slate-300">
                          <strong>Status Pelaksanaan:</strong> {record.statusPelaksanaan}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {record.intervensiKebijakan}
                        </p>
                        {record.catatanRekomendasi && (
                          <p className="text-[11px] text-blue-700 dark:text-sky-300 italic pt-1 border-t border-slate-200 dark:border-slate-700/60 line-clamp-1">
                            &quot;{record.catatanRekomendasi}&quot;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">
                        Evaluator: {record.petugasMonev || '-'} ({record.tanggalEvaluasi})
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditMonev(record)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Rincian & Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMonev(record.id, record.bahasaDaerah)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Hapus rekaman Monev"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: RENCANA AKSI PENGIMBASAN (RAP) */}
      {activeSubTab === 'rap' && (
        <div className="space-y-4">
          {filteredRAP.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3">
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Belum ada dokumen Rencana Aksi Pengimbasan (RAP).
              </p>
              <button
                type="button"
                onClick={handleOpenNewRAP}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Dokumen RAP Baru</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRAP.map(rap => (
                <div
                  key={rap.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-400 dark:hover:border-slate-700 transition-all"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {rap.bahasaDaerah}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {rap.profilPengajar.namaLengkap}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {rap.profilPengajar.instansiUnitKerja} • {rap.profilPengajar.wilayahTarget}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Target Penutur Muda</span>
                        <strong className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                          {rap.sasaran.targetJumlahPenuturMuda}
                        </strong>
                        <span className="text-[10px] text-slate-400"> Orang</span>
                      </div>
                    </div>

                    {/* Target metrics grid */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-slate-400 block text-[10px]">Guru Terimbas</span>
                        <strong className="text-slate-800 dark:text-slate-100 font-bold">
                          {rap.sasaran.targetJumlahPengajarSejawat} Org
                        </strong>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-slate-400 block text-[10px]">Target Karya</span>
                        <strong className="text-slate-800 dark:text-slate-100 font-bold">
                          {rap.indikator.targetJumlahKarya} Karya
                        </strong>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-slate-400 block text-[10px]">Lini Masa</span>
                        <strong className="text-slate-800 dark:text-slate-100 font-bold">
                          {rap.sasaran.liniMasa.length} Tahapan
                        </strong>
                      </div>
                    </div>

                    {/* Strategi summary */}
                    <div className="text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                      <p className="text-slate-700 dark:text-slate-300 line-clamp-2">
                        <strong>Bentuk:</strong> {rap.strategi.bentukKegiatan}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] line-clamp-1">
                        <strong>Target Festival:</strong> {rap.indikator.keikutsertaanKompetisi || '-'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      NIP/NIK: {rap.profilPengajar.nipNik || '-'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleEditRAP(rap)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Detail & Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRAP(rap.id, rap.profilPengajar.namaLengkap)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Hapus dokumen RAP"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: INTERACTIVE SIMULATOR RUMUS IKRBD */}
      {activeSubTab === 'simulasi' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-600 dark:text-sky-400" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Simulator Matematika Indeks Kinerja Revitalisasi Bahasa Daerah (IKRBD)
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Geser slider rata-rata tiap dimensi (1.00 – 5.00) untuk melihat dinamika skor akhir dan rekomendasi intervensi kebijakan.
              </p>
            </div>

            {/* Formula Banner */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-sky-300 font-mono text-xs overflow-x-auto">
              <code>
                IKRBD = [ ( S̄₁ × 0.25 ) + ( S̄₂ × 0.20 ) + ( S̄₃ × 0.20 ) + ( S̄₄ × 0.175 ) + ( S̄₅ × 0.175 ) ] × 20
              </code>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Dimensi 1 */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Dimensi 1: Pembelajaran & Partisipasi Subjek (25%)
                  </span>
                  <span className="text-sm font-extrabold text-blue-600 dark:text-sky-400">
                    S̄₁ = {simD1.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.05"
                  value={simD1}
                  onChange={e => setSimD1(parseFloat(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <span className="text-[10px] text-slate-400 block">Bobot kontribusi: {(simD1 * 0.25 * 20).toFixed(2)} poin</span>
              </div>

              {/* Dimensi 2 */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Dimensi 2: Keterlibatan Komunitas & Grassroots (20%)
                  </span>
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                    S̄₂ = {simD2.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.05"
                  value={simD2}
                  onChange={e => setSimD2(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <span className="text-[10px] text-slate-400 block">Bobot kontribusi: {(simD2 * 0.20 * 20).toFixed(2)} poin</span>
              </div>

              {/* Dimensi 3 */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Dimensi 3: Ketersediaan Modul & Materi Ajar (20%)
                  </span>
                  <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                    S̄₃ = {simD3.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.05"
                  value={simD3}
                  onChange={e => setSimD3(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <span className="text-[10px] text-slate-400 block">Bobot kontribusi: {(simD3 * 0.20 * 20).toFixed(2)} poin</span>
              </div>

              {/* Dimensi 4 */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Dimensi 4: Dukungan Kelembagaan & Kebijakan Lokal (17.5%)
                  </span>
                  <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                    S̄₄ = {simD4.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.05"
                  value={simD4}
                  onChange={e => setSimD4(parseFloat(e.target.value))}
                  className="w-full accent-amber-600"
                />
                <span className="text-[10px] text-slate-400 block">Bobot kontribusi: {(simD4 * 0.175 * 20).toFixed(2)} poin</span>
              </div>

              {/* Dimensi 5 */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 md:col-span-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Dimensi 5: Ruang Ekspresi & Festival Bahasa Daerah (17.5%)
                  </span>
                  <span className="text-sm font-extrabold text-purple-600 dark:text-purple-400">
                    S̄₅ = {simD5.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.05"
                  value={simD5}
                  onChange={e => setSimD5(parseFloat(e.target.value))}
                  className="w-full accent-purple-600"
                />
                <span className="text-[10px] text-slate-400 block">Bobot kontribusi: {(simD5 * 0.175 * 20).toFixed(2)} poin</span>
              </div>

            </div>

            {/* Live Calculation Output Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Hasil Simulasi Indeks IKRBD:</span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-sky-400">{simResult.ikrbdScore}</span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${simResult.badgeColor}`}>
                    {simResult.kategori}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
                  <strong>Status:</strong> {simResult.statusPelaksanaan}. {simResult.intervensiKebijakan}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSimD1(4.25);
                  setSimD2(3.75);
                  setSimD3(3.67);
                  setSimD4(3.00);
                  setSimD5(4.00);
                }}
                className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors self-start sm:self-auto cursor-pointer shadow-2xs"
              >
                Reset ke Kasus Hitumese (75.43)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODALS */}
      <MonevKuesionerModal
        isOpen={isMonevModalOpen}
        onClose={() => setIsMonevModalOpen(false)}
        onSave={handleSaveMonev}
        editingRecord={editingMonev}
        defaultDesa={data?.titikPengamatan?.namaDesa || ''}
        defaultBahasa={data?.titikPengamatan?.bahasaDigunakan || ''}
        defaultKabupaten={data?.titikPengamatan?.kabupatenKota || 'Kabupaten Maluku Tengah'}
        defaultKecamatan={data?.titikPengamatan?.kecamatan || 'Leihitu'}
      />

      <RAPKuesionerModal
        isOpen={isRAPModalOpen}
        onClose={() => setIsRAPModalOpen(false)}
        onSave={handleSaveRAP}
        editingRecord={editingRAP}
        defaultBahasa={data?.titikPengamatan?.bahasaDigunakan || ''}
        defaultWilayah={data?.titikPengamatan?.kecamatan ? `Kecamatan ${data.titikPengamatan.kecamatan}` : ''}
      />

    </div>
  );
};
