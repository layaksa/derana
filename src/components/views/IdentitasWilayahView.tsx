import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  Compass, 
  Layers, 
  Globe, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Search, 
  Filter, 
  Sparkles, 
  TrendingUp, 
  ChevronRight, 
  ExternalLink, 
  Save, 
  Download, 
  Copy, 
  Check, 
  Navigation, 
  Waves, 
  Mountain, 
  ShieldCheck, 
  Eye, 
  BookOpen,
  PieChart,
  BarChart2,
  Table,
  Sliders,
  FolderOpen,
  FileText
} from 'lucide-react';
import { Section1TitikPengamatan } from '../sections/Section1TitikPengamatan';
import { Section2SituasiKebahasaan } from '../sections/Section2SituasiKebahasaan';
import { Section3SituasiGeografis } from '../sections/Section3SituasiGeografis';
import { Section11UsiaDesa } from '../sections/Section11UsiaDesa';
import { Section12SejarahDesa } from '../sections/Section12SejarahDesa';
import { InstrumenPemetaanBahasaData, SurveyRecord } from '../../types/linguistic';

interface IdentitasWilayahViewProps {
  data: InstrumenPemetaanBahasaData;
  surveys?: SurveyRecord[];
  activeSurveyId?: string;
  onSelectSurvey?: (id: string) => void;
  onSwitchToEditor?: () => void;
  canEdit: boolean;
  onSave: () => void;
  lastSavedTime: string | null;
  updateTitikPengamatan: (field: keyof InstrumenPemetaanBahasaData['titikPengamatan'], value: string) => void;
  updateSituasiKebahasaan: (direction: keyof InstrumenPemetaanBahasaData['situasiKebahasaan'], field: any, value: any) => void;
  updateSituasiGeografis: (field: keyof InstrumenPemetaanBahasaData['situasiGeografis'], value: any) => void;
  updateUsiaDesa: (field: keyof InstrumenPemetaanBahasaData['usiaDesa'], value: string) => void;
  updateSejarahDesa: (field: keyof InstrumenPemetaanBahasaData['sejarahDesa'], value: string) => void;
}

export const IdentitasWilayahView: React.FC<IdentitasWilayahViewProps> = ({
  data,
  surveys = [],
  activeSurveyId,
  onSelectSurvey,
  onSwitchToEditor,
  canEdit,
  onSave,
  lastSavedTime,
  updateTitikPengamatan,
  updateSituasiKebahasaan,
  updateSituasiGeografis,
  updateUsiaDesa,
  updateSejarahDesa
}) => {
  // Main view mode: 'bento' (Overview & Statistik Wilayah) or 'form' (Formulir Pengisian Identitas)
  const [mainMode, setMainMode] = useState<'bento' | 'form'>('bento');

  // Form active sub-tab
  const [activeFormTab, setActiveFormTab] = useState<'all' | '1' | '2' | '3' | '11' | '12'>('all');

  // Filter & Search states for Bento
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvinsiFilter, setSelectedProvinsiFilter] = useState<string>('all');
  const [selectedKabupatenFilter, setSelectedKabupatenFilter] = useState<string>('all');
  const [levelView, setLevelView] = useState<'all' | 'provinsi' | 'kabupaten' | 'kecamatan'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Normalize all available village data across all recorded surveys (including fallback to active survey data)
  const allVillages = useMemo(() => {
    if (surveys.length > 0) {
      return surveys.map(s => {
        const d = s.data || {};
        const tp = d.titikPengamatan || {};
        const sg = d.situasiGeografis || {};
        const ud = d.usiaDesa || {};
        const sd = d.sejarahDesa || {};

        return {
          id: s.id,
          isActive: s.id === activeSurveyId,
          title: s.title || tp.namaDesa || s.desa || 'Desa Tanpa Nama',
          namaDesa: tp.namaDesa || s.desa || 'Desa Tanpa Nama',
          kecamatan: tp.kecamatan || s.kecamatan || 'Kecamatan Belum Diisi',
          kabupatenKota: tp.kabupatenKota || s.kabupatenKota || 'Kabupaten Belum Diisi',
          provinsi: tp.provinsi || s.provinsi || 'Provinsi Belum Diisi',
          pulau: tp.pulau || 'Kepulauan Indonesia',
          bahasa: tp.bahasaDigunakan || s.bahasa || 'Bahasa Belum Terdata',
          namaLainBahasa: tp.namaLainBahasa || '',
          kodeTitik: tp.kodeTitik || `TP-${s.id.slice(-4).toUpperCase()}`,
          lat: sg.koordinatLintang || tp.koordinatLintang || null,
          lng: sg.koordinatBujur || tp.koordinatBujur || null,
          morfologi: sg.morfologi || 'dataran',
          letakPantai: sg.letakPantai || 'pedalaman',
          jarakPantaiKm: sg.jarakDariPantaiKm || 0,
          usiaDesa: ud.estimasiTahun || ud.kategori || '-',
          asalUsul: sd.sejarahSingkat || sd.asalUsulNama || '-',
          isVerified: s.isVerified ?? false,
          progress: s.progress ?? 0,
          updatedAt: s.updatedAt || s.createdAt || new Date().toISOString()
        };
      });
    }

    // Fallback if surveys list is empty, use current active survey data
    const tp = data.titikPengamatan || {};
    const sg = data.situasiGeografis || {};
    const ud = data.usiaDesa || {};
    const sd = data.sejarahDesa || {};

    return [{
      id: activeSurveyId || 'current-active',
      isActive: true,
      title: tp.namaDesa || 'Desa Pengamatan Aktif',
      namaDesa: tp.namaDesa || 'Desa Pengamatan Aktif',
      kecamatan: tp.kecamatan || 'Kecamatan Belum Diisi',
      kabupatenKota: tp.kabupatenKota || 'Kabupaten Belum Diisi',
      provinsi: tp.provinsi || 'Provinsi Belum Diisi',
      pulau: tp.pulau || 'Kepulauan Indonesia',
      bahasa: tp.bahasaDigunakan || 'Bahasa Daerah',
      namaLainBahasa: tp.namaLainBahasa || '',
      kodeTitik: tp.kodeTitik || 'TP-001',
      lat: sg.koordinatLintang || tp.koordinatLintang || null,
      lng: sg.koordinatBujur || tp.koordinatBujur || null,
      morfologi: sg.morfologi || 'dataran',
      letakPantai: sg.letakPantai || 'pedalaman',
      jarakPantaiKm: sg.jarakDariPantaiKm || 0,
      usiaDesa: ud.estimasiTahun || ud.kategori || '-',
      asalUsul: sd.sejarahSingkat || sd.asalUsulNama || '-',
      isVerified: false,
      progress: 60,
      updatedAt: new Date().toISOString()
    }];
  }, [surveys, data, activeSurveyId]);

  // Overall Statistics Aggregation
  const overallStats = useMemo(() => {
    const totalDesa = allVillages.length;
    const uniqueKecamatan = new Set(allVillages.map(v => `${v.provinsi}__${v.kabupatenKota}__${v.kecamatan}`)).size;
    const uniqueKabupaten = new Set(allVillages.map(v => `${v.provinsi}__${v.kabupatenKota}`)).size;
    const uniqueProvinsi = new Set(allVillages.map(v => v.provinsi)).size;
    const uniqueBahasa = new Set(allVillages.map(v => v.bahasa.toLowerCase().trim())).size;
    const verifiedCount = allVillages.filter(v => v.isVerified).length;
    const pantaiCount = allVillages.filter(v => v.letakPantai === 'pantai').length;
    const pedalamanCount = totalDesa - pantaiCount;
    const avgProgress = totalDesa > 0 
      ? Math.round(allVillages.reduce((acc, curr) => acc + curr.progress, 0) / totalDesa) 
      : 0;

    return {
      totalDesa,
      uniqueKecamatan,
      uniqueKabupaten,
      uniqueProvinsi,
      uniqueBahasa,
      verifiedCount,
      verifiedRatio: totalDesa > 0 ? Math.round((verifiedCount / totalDesa) * 100) : 0,
      pantaiCount,
      pedalamanCount,
      pantaiRatio: totalDesa > 0 ? Math.round((pantaiCount / totalDesa) * 100) : 0,
      avgProgress
    };
  }, [allVillages]);

  // Aggregation per Provinsi
  const statsPerProvinsi = useMemo(() => {
    const grouped: Record<string, {
      provinsi: string;
      desaList: typeof allVillages;
      kabupatenSet: Set<string>;
      kecamatanSet: Set<string>;
      bahasaSet: Set<string>;
      verifiedCount: number;
      pantaiCount: number;
      pedalamanCount: number;
      avgProgress: number;
    }> = {};

    allVillages.forEach(v => {
      const prov = v.provinsi || 'Belum Diisi';
      if (!grouped[prov]) {
        grouped[prov] = {
          provinsi: prov,
          desaList: [],
          kabupatenSet: new Set(),
          kecamatanSet: new Set(),
          bahasaSet: new Set(),
          verifiedCount: 0,
          pantaiCount: 0,
          pedalamanCount: 0,
          avgProgress: 0
        };
      }
      grouped[prov].desaList.push(v);
      grouped[prov].kabupatenSet.add(v.kabupatenKota);
      grouped[prov].kecamatanSet.add(`${v.kabupatenKota}__${v.kecamatan}`);
      grouped[prov].bahasaSet.add(v.bahasa);
      if (v.isVerified) grouped[prov].verifiedCount++;
      if (v.letakPantai === 'pantai') grouped[prov].pantaiCount++;
      else grouped[prov].pedalamanCount++;
    });

    return Object.values(grouped).map(item => ({
      ...item,
      totalDesa: item.desaList.length,
      totalKabupaten: item.kabupatenSet.size,
      totalKecamatan: item.kecamatanSet.size,
      totalBahasa: item.bahasaSet.size,
      persenTotal: Math.round((item.desaList.length / (allVillages.length || 1)) * 100),
      avgProgress: Math.round(item.desaList.reduce((acc, curr) => acc + curr.progress, 0) / (item.desaList.length || 1)),
      kabupatenNames: Array.from(item.kabupatenSet),
      bahasaNames: Array.from(item.bahasaSet)
    })).sort((a, b) => b.totalDesa - a.totalDesa);
  }, [allVillages]);

  // Aggregation per Kabupaten / Kota
  const statsPerKabupaten = useMemo(() => {
    const grouped: Record<string, {
      kabupatenKota: string;
      provinsi: string;
      desaList: typeof allVillages;
      kecamatanSet: Set<string>;
      bahasaSet: Set<string>;
      verifiedCount: number;
      pantaiCount: number;
      pedalamanCount: number;
      morfologiBreakdown: Record<string, number>;
    }> = {};

    allVillages.forEach(v => {
      const key = `${v.provinsi}__${v.kabupatenKota}`;
      if (!grouped[key]) {
        grouped[key] = {
          kabupatenKota: v.kabupatenKota || 'Belum Diisi',
          provinsi: v.provinsi || 'Belum Diisi',
          desaList: [],
          kecamatanSet: new Set(),
          bahasaSet: new Set(),
          verifiedCount: 0,
          pantaiCount: 0,
          pedalamanCount: 0,
          morfologiBreakdown: {}
        };
      }
      grouped[key].desaList.push(v);
      grouped[key].kecamatanSet.add(v.kecamatan);
      grouped[key].bahasaSet.add(v.bahasa);
      if (v.isVerified) grouped[key].verifiedCount++;
      if (v.letakPantai === 'pantai') grouped[key].pantaiCount++;
      else grouped[key].pedalamanCount++;

      const mor = v.morfologi || 'dataran';
      grouped[key].morfologiBreakdown[mor] = (grouped[key].morfologiBreakdown[mor] || 0) + 1;
    });

    return Object.values(grouped).map(item => ({
      ...item,
      totalDesa: item.desaList.length,
      totalKecamatan: item.kecamatanSet.size,
      totalBahasa: item.bahasaSet.size,
      avgProgress: Math.round(item.desaList.reduce((acc, curr) => acc + curr.progress, 0) / (item.desaList.length || 1)),
      kecamatanNames: Array.from(item.kecamatanSet),
      bahasaNames: Array.from(item.bahasaSet)
    })).sort((a, b) => b.totalDesa - a.totalDesa);
  }, [allVillages]);

  // Aggregation per Kecamatan
  const statsPerKecamatan = useMemo(() => {
    const grouped: Record<string, {
      kecamatan: string;
      kabupatenKota: string;
      provinsi: string;
      desaList: typeof allVillages;
      bahasaSet: Set<string>;
      verifiedCount: number;
    }> = {};

    allVillages.forEach(v => {
      const key = `${v.provinsi}__${v.kabupatenKota}__${v.kecamatan}`;
      if (!grouped[key]) {
        grouped[key] = {
          kecamatan: v.kecamatan || 'Belum Diisi',
          kabupatenKota: v.kabupatenKota || 'Belum Diisi',
          provinsi: v.provinsi || 'Belum Diisi',
          desaList: [],
          bahasaSet: new Set(),
          verifiedCount: 0
        };
      }
      grouped[key].desaList.push(v);
      grouped[key].bahasaSet.add(v.bahasa);
      if (v.isVerified) grouped[key].verifiedCount++;
    });

    return Object.values(grouped).map(item => ({
      ...item,
      totalDesa: item.desaList.length,
      totalBahasa: item.bahasaSet.size,
      avgProgress: Math.round(item.desaList.reduce((acc, curr) => acc + curr.progress, 0) / (item.desaList.length || 1)),
      bahasaNames: Array.from(item.bahasaSet)
    })).sort((a, b) => b.totalDesa - a.totalDesa);
  }, [allVillages]);

  // Filtered lists based on search & selectors
  const filteredVillages = useMemo(() => {
    return allVillages.filter(v => {
      const matchesSearch = searchQuery === '' || 
        v.namaDesa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.kecamatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.kabupatenKota.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.provinsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.bahasa.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesProvinsi = selectedProvinsiFilter === 'all' || v.provinsi === selectedProvinsiFilter;
      const matchesKabupaten = selectedKabupatenFilter === 'all' || v.kabupatenKota === selectedKabupatenFilter;

      return matchesSearch && matchesProvinsi && matchesKabupaten;
    });
  }, [allVillages, searchQuery, selectedProvinsiFilter, selectedKabupatenFilter]);

  // Unique lists for dropdown filters
  const uniqueProvinsiList = useMemo(() => {
    return Array.from(new Set(allVillages.map(v => v.provinsi))).filter(Boolean);
  }, [allVillages]);

  const uniqueKabupatenList = useMemo(() => {
    if (selectedProvinsiFilter === 'all') {
      return Array.from(new Set(allVillages.map(v => v.kabupatenKota))).filter(Boolean);
    }
    return Array.from(new Set(allVillages.filter(v => v.provinsi === selectedProvinsiFilter).map(v => v.kabupatenKota))).filter(Boolean);
  }, [allVillages, selectedProvinsiFilter]);

  // Copy coordinates helper
  const handleCopyCoord = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export Summary CSV
  const handleExportCSV = () => {
    const headers = ['Kode Titik', 'Nama Desa', 'Kecamatan', 'Kabupaten/Kota', 'Provinsi', 'Bahasa', 'Lintang', 'Bujur', 'Morfologi', 'Letak Pantai', 'Status Verifikasi', 'Progress'];
    const rows = filteredVillages.map(v => [
      v.kodeTitik,
      `"${v.namaDesa}"`,
      `"${v.kecamatan}"`,
      `"${v.kabupatenKota}"`,
      `"${v.provinsi}"`,
      `"${v.bahasa}"`,
      v.lat || '',
      v.lng || '',
      v.morfologi,
      v.letakPantai,
      v.isVerified ? 'Terverifikasi' : 'Belum Diverifikasi',
      `${v.progress}%`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ringkasan_Identitas_Wilayah_Desa_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formTabs = [
    { id: 'all', label: 'Semua Bagian Identitas' },
    { id: '1', label: '1. Titik Pengamatan' },
    { id: '2', label: '2. Situasi Kebahasaan' },
    { id: '3', label: '3. Situasi Geografis' },
    { id: '11', label: '11. Usia Desa' },
    { id: '12', label: '12. Sejarah Desa' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card with Bento Mode Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200/80 dark:border-slate-700">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {overallStats.totalDesa} Titik Terdata
                </span>
                <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">·</span>
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  {overallStats.uniqueProvinsi} Provinsi
                </span>
                <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">·</span>
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  {overallStats.uniqueBahasa} Bahasa Daerah
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                Identitas Wilayah & Persebaran Geoadministratif
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed max-w-3xl font-normal">
                Ringkasan analitik dan agregasi spasial geolinguistik per kecamatan, kabupaten, dan provinsi dari seluruh survei lapangan.
              </p>
            </div>
          </div>

          {/* Mode Switcher Segmented Control */}
          <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
            <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMainMode('bento')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  mainMode === 'bento'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Ringkasan & Statistik Wilayah</span>
              </button>
              <button
                type="button"
                onClick={() => setMainMode('form')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  mainMode === 'form'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Formulir ({data.titikPengamatan.namaDesa || 'Desa Aktif'})</span>
              </button>
            </div>

            {mainMode === 'bento' && (
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs cursor-pointer"
                title="Ekspor rekapitulasi data toponimi wilayah sebagai CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ekspor CSV</span>
              </button>
            )}

            {mainMode === 'form' && canEdit && (
              <button
                type="button"
                onClick={onSave}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Desa</span>
                {lastSavedTime && (
                  <span className="text-[10px] text-blue-100 hidden md:inline">
                    ({lastSavedTime})
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* When in Form Mode: Show Sub-tabs */}
        {mainMode === 'form' && (
          <div className="mt-5 pt-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {formTabs.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFormTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    activeFormTab === tab.id
                      ? 'bg-blue-600 text-white font-bold shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span>Sedang mengedit:</span>
              <strong className="text-slate-800 dark:text-slate-200">
                Desa {data.titikPengamatan.namaDesa || 'Belum diisi'}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODE 1: BENTO OVERVIEW & STATISTIK WILAYAH (KEC/KAB/PROV) */}
      {/* ============================================================ */}
      {mainMode === 'bento' && (
        <div className="space-y-6">
          {/* Bento Search & Filter Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs transition-colors flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari desa, kecamatan, kabupaten, provinsi, atau bahasa..."
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-400 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              {/* Level View Switcher */}
              <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setLevelView('all')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    levelView === 'all' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setLevelView('provinsi')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    levelView === 'provinsi' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Provinsi
                </button>
                <button
                  type="button"
                  onClick={() => setLevelView('kabupaten')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    levelView === 'kabupaten' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Kabupaten
                </button>
                <button
                  type="button"
                  onClick={() => setLevelView('kecamatan')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    levelView === 'kecamatan' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Kecamatan
                </button>
              </div>

              {/* Provinsi Select */}
              <select
                value={selectedProvinsiFilter}
                onChange={e => {
                  setSelectedProvinsiFilter(e.target.value);
                  setSelectedKabupatenFilter('all');
                }}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-medium focus:outline-hidden"
              >
                <option value="all">Semua Provinsi ({uniqueProvinsiList.length})</option>
                {uniqueProvinsiList.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              {/* Kabupaten Select */}
              <select
                value={selectedKabupatenFilter}
                onChange={e => setSelectedKabupatenFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-medium focus:outline-hidden"
              >
                <option value="all">Semua Kabupaten/Kota ({uniqueKabupatenList.length})</option>
                {uniqueKabupatenList.map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          </div>

          {/* BENTO HERO KPI TILES (5 Cells) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Cell 1: Total Desa */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-2xs transition-colors">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Titik Desa
              </span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {overallStats.totalDesa}
              </div>
              <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                {overallStats.verifiedCount} Tervalidasi ({overallStats.verifiedRatio}%)
              </div>
            </div>

            {/* Cell 2: Total Kecamatan */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-2xs transition-colors">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Kecamatan
              </span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {overallStats.uniqueKecamatan}
              </div>
              <div className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                Distrik tercakup
              </div>
            </div>

            {/* Cell 3: Total Kabupaten */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-2xs transition-colors">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Kabupaten / Kota
              </span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {overallStats.uniqueKabupaten}
              </div>
              <div className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                Daerah tingkat II
              </div>
            </div>

            {/* Cell 4: Total Provinsi */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-2xs transition-colors">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Provinsi
              </span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {overallStats.uniqueProvinsi}
              </div>
              <div className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                Wilayah provinsi
              </div>
            </div>

            {/* Cell 5: Bahasa Terdata */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-2xs transition-colors col-span-2 sm:col-span-1">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Bahasa Daerah
              </span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {overallStats.uniqueBahasa}
              </div>
              <div className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                Bahasa & dialek empiris
              </div>
            </div>
          </div>

          {/* BENTO GRID: MAIN ANALYTICS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* BENTO CARD 1: STATISTIK PER PROVINSI (Span 4) */}
            {(levelView === 'all' || levelView === 'provinsi') && (
              <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                      Statistik per Provinsi
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {statsPerProvinsi.length} Provinsi
                  </span>
                </div>

                <div className="space-y-3">
                  {statsPerProvinsi.map(p => (
                    <div 
                      key={p.provinsi}
                      onClick={() => setSelectedProvinsiFilter(p.provinsi === selectedProvinsiFilter ? 'all' : p.provinsi)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        selectedProvinsiFilter === p.provinsi
                          ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 ring-2 ring-purple-500/20'
                          : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Provinsi {p.provinsi}
                        </span>
                        <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded-md">
                          {p.totalDesa} Desa ({p.persenTotal}%)
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                        <div className="flex items-center justify-between">
                          <span>Kabupaten tercakup:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{p.totalKabupaten} Kab/Kota</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Kecamatan tercakup:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{p.totalKecamatan} Kecamatan</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Bahasa terdaftar:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{p.totalBahasa} Bahasa ({p.bahasaNames.slice(0, 2).join(', ')})</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-2.5">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span>Kelengkapan Riset</span>
                          <span>{p.avgProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-600 rounded-full"
                            style={{ width: `${p.avgProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BENTO CARD 2: STATISTIK PER KABUPATEN / KOTA (Span 8 or full) */}
            {(levelView === 'all' || levelView === 'kabupaten') && (
              <div className={`${levelView === 'kabupaten' ? 'lg:col-span-12' : 'lg:col-span-8'} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                      Statistik per Kabupaten / Kota
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {statsPerKabupaten.length} Kabupaten / Kota Terdata
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {statsPerKabupaten.map(k => (
                    <div 
                      key={`${k.provinsi}_${k.kabupatenKota}`}
                      onClick={() => setSelectedKabupatenFilter(k.kabupatenKota === selectedKabupatenFilter ? 'all' : k.kabupatenKota)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        selectedKabupatenFilter === k.kabupatenKota
                          ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 ring-2 ring-amber-500/20'
                          : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {k.kabupatenKota}
                          </h4>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            Provinsi {k.provinsi}
                          </span>
                        </div>
                        <span className="text-[11px] font-black text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-md">
                          {k.totalDesa} Desa
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200/60 dark:border-slate-700/50">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Kecamatan:</span>
                          <span className="font-bold">{k.totalKecamatan} Distrik</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Bahasa:</span>
                          <span className="font-bold truncate block">{k.bahasaNames.join(', ') || '-'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Pantai / Pedalaman:</span>
                          <span className="font-bold text-sky-600 dark:text-sky-400">{k.pantaiCount} Pantai</span> / {k.pedalamanCount} Inland
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Validasi:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{k.verifiedCount} Terverifikasi</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Rata-rata Progress: <strong>{k.avgProgress}%</strong></span>
                        <span className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5">
                          Filter data <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BENTO CARD 3: STATISTIK PER KECAMATAN & DAFTAR DESA (Span 12) */}
            {(levelView === 'all' || levelView === 'kecamatan') && (
              <div className="lg:col-span-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                      Rincian Statistik & Titik Desa per Kecamatan
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Menampilkan {statsPerKecamatan.length} Kecamatan yang telah diinput
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {statsPerKecamatan.map(kec => (
                    <div 
                      key={`${kec.provinsi}_${kec.kabupatenKota}_${kec.kecamatan}`}
                      className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Kecamatan {kec.kecamatan}</span>
                            </h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              {kec.kabupatenKota} • {kec.provinsi}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                            {kec.totalDesa} Titik
                          </span>
                        </div>

                        {/* Village item pills */}
                        <div className="mt-3 space-y-1.5">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Desa Terdata:
                          </span>
                          <div className="space-y-1">
                            {kec.desaList.map(d => (
                              <div 
                                key={d.id}
                                className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-2 transition-all ${
                                  d.isActive 
                                    ? 'bg-blue-50/90 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800'
                                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                                }`}
                              >
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                                    <span>{d.namaDesa}</span>
                                    {d.isActive && (
                                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-semibold">
                                        Aktif
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-2 mt-0.5">
                                    <span>Bahasa: <strong className="text-slate-700 dark:text-slate-300">{d.bahasa}</strong></span>
                                    {d.lat && d.lng ? (
                                      <span className="text-indigo-600 dark:text-sky-400">GPS: {Number(d.lat).toFixed(2)}, {Number(d.lng).toFixed(2)}</span>
                                    ) : (
                                      <span className="text-amber-600 dark:text-amber-400">GPS belum ada</span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  {onSelectSurvey && (
                                    <button
                                      type="button"
                                      onClick={() => onSelectSurvey(d.id)}
                                      className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                                        d.isActive
                                          ? 'bg-blue-600 text-white'
                                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                      }`}
                                      title="Jadikan desa ini sebagai survei aktif"
                                    >
                                      {d.isActive ? 'Sedang Dibuka' : 'Pilih'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Bahasa: <strong>{kec.bahasaNames.join(', ')}</strong></span>
                        <span>Verifikasi: <strong>{kec.verifiedCount}/{kec.totalDesa}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BENTO CARD 4: MATRIKS TIPOLOGI WILAYAH & PERBATASAN (Span 4) */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <Mountain className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Tipologi & Bentang Alam
                </h3>
              </div>

              {/* Coastal vs Inland Proportion */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Waves className="w-4 h-4 text-blue-500" />
                    <span>Pesisir Pantai</span>
                  </span>
                  <span>{overallStats.pantaiCount} Titik ({overallStats.pantaiRatio}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${overallStats.pantaiRatio}%` }}
                    title="Pesisir Pantai"
                  />
                  <div 
                    className="h-full bg-amber-500" 
                    style={{ width: `${100 - overallStats.pantaiRatio}%` }}
                    title="Pedalaman"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Pedalaman: <strong>{overallStats.pedalamanCount} Titik ({100 - overallStats.pantaiRatio}%)</strong></span>
                </div>
              </div>

              {/* Current Active Observation Point Highlight */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                    Titik Aktif Saat Ini
                  </span>
                  <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400">
                    {data.titikPengamatan.kodeTitik || 'TP-001'}
                  </span>
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Desa {data.titikPengamatan.namaDesa || 'Belum diisi'}
                </h4>
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                  <p>Kec. {data.titikPengamatan.kecamatan || '-'}, Kab. {data.titikPengamatan.kabupatenKota || '-'}</p>
                  <p>Provinsi {data.titikPengamatan.provinsi || '-'}</p>
                  <p>Bahasa: <strong>{data.titikPengamatan.bahasaDigunakan || 'Belum Terdata'}</strong></p>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMainMode('form')}
                    className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer text-center"
                  >
                    Edit Identitas Desa Ini
                  </button>
                  {onSwitchToEditor && (
                    <button
                      type="button"
                      onClick={onSwitchToEditor}
                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-50 transition-colors cursor-pointer shrink-0"
                      title="Buka seluruh 16 seksi kuesioner desa ini"
                    >
                      Buka Form
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* BENTO CARD 5: TABEL MASTER TOPONIMI DESA LENGKAP (Span 8) */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Daftar Master Toponimi Desa yang Terdata
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  {filteredVillages.length} dari {allVillages.length} desa
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/70 dark:bg-slate-800/50">
                      <th className="p-3">Nama Desa & Titik</th>
                      <th className="p-3">Kecamatan</th>
                      <th className="p-3">Kabupaten & Provinsi</th>
                      <th className="p-3">Bahasa</th>
                      <th className="p-3">Koordinat GPS</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {filteredVillages.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          Tidak ada desa yang cocok dengan kata kunci atau filter pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredVillages.map(v => (
                        <tr 
                          key={v.id}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                            v.isActive ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                          }`}
                        >
                          <td className="p-3">
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{v.namaDesa}</span>
                              {v.isActive && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-semibold">
                                  Aktif
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {v.kodeTitik}
                            </span>
                          </td>
                          <td className="p-3 font-medium text-slate-700 dark:text-slate-300">
                            {v.kecamatan}
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">
                            <div>{v.kabupatenKota}</div>
                            <span className="text-[10px] text-slate-400">{v.provinsi}</span>
                          </td>
                          <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                            {v.bahasa}
                          </td>
                          <td className="p-3">
                            {v.lat && v.lng ? (
                              <button
                                type="button"
                                onClick={() => handleCopyCoord(`${v.lat}, ${v.lng}`, v.id)}
                                className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-600 dark:text-sky-400 hover:underline cursor-pointer"
                                title="Klik untuk menyalin koordinat"
                              >
                                {copiedId === v.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-500" />
                                    <span>Tersalin!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 text-slate-400" />
                                    <span>{Number(v.lat).toFixed(3)}, {Number(v.lng).toFixed(3)}</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Belum diisi</span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              v.isVerified 
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            }`}>
                              {v.isVerified ? '✓ Valid' : 'Draf'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {onSelectSurvey && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onSelectSurvey(v.id);
                                    setMainMode('form');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold text-xs transition-colors cursor-pointer"
                                  title="Buka formulir identitas desa ini"
                                >
                                  Buka
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODE 2: FORMULIR RINCIAN DESA AKTIF (SEKSI 1, 2, 3, 11, 12)  */}
      {/* ============================================================ */}
      {mainMode === 'form' && (
        <fieldset disabled={!canEdit} className="space-y-6 border-0 p-0 m-0 min-w-0 disabled:opacity-95">
          {(activeFormTab === 'all' || activeFormTab === '1') && (
            <Section1TitikPengamatan
              data={data.titikPengamatan}
              onChange={updateTitikPengamatan}
            />
          )}

          {(activeFormTab === 'all' || activeFormTab === '2') && (
            <Section2SituasiKebahasaan
              data={data.situasiKebahasaan}
              onChangeDirection={updateSituasiKebahasaan}
            />
          )}

          {(activeFormTab === 'all' || activeFormTab === '3') && (
            <Section3SituasiGeografis
              data={data.situasiGeografis}
              onChange={updateSituasiGeografis}
              titikPengamatan={data.titikPengamatan}
            />
          )}

          {(activeFormTab === 'all' || activeFormTab === '11') && (
            <Section11UsiaDesa
              data={data.usiaDesa}
              onChange={updateUsiaDesa}
            />
          )}

          {(activeFormTab === 'all' || activeFormTab === '12') && (
            <Section12SejarahDesa
              data={data.sejarahDesa}
              onChange={updateSejarahDesa}
            />
          )}
        </fieldset>
      )}
    </div>
  );
};
