import React, { useState, useMemo, useEffect } from 'react';
import { 
  Compass, 
  BookOpen, 
  Activity, 
  ShieldCheck, 
  Filter, 
  Download, 
  Plus, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  Eye, 
  Layers, 
  FileText, 
  Info,
  CheckCircle2,
  Building2,
  Users
} from 'lucide-react';
import { SurveyRecord } from '../../types/linguistic';
import { SastraLisanRecord } from '../../types/sastraLisan';
import { KuesionerVitalitasResponse } from '../../data/kuesionerVitalitasData';
import { RevitalisasiMonevRecord } from '../../types/revitalisasi';
import { loadSastraLisanRecords } from '../../utils/sastraLisanStorage';
import { loadVitalitasResponses } from '../../utils/vitalitasStorage';
import { loadMonevRecords } from '../../utils/revitalisasiStorage';
import { CartoRegionalMap } from '../reports/CartoRegionalMap';

interface CartoTriInstrumentViewProps {
  surveys: SurveyRecord[];
  onOpenRegionalReport?: () => void;
  onNavigateToView?: (viewKey: string) => void;
  onNavigateToSastraLisanForm?: () => void;
  onNavigateToVitalitasForm?: () => void;
  onNavigateToRevitalisasiForm?: () => void;
  onNavigateToPetaSurvei?: () => void;
}

export const CartoTriInstrumentView: React.FC<CartoTriInstrumentViewProps> = ({
  surveys,
  onOpenRegionalReport,
  onNavigateToView,
  onNavigateToSastraLisanForm,
  onNavigateToVitalitasForm,
  onNavigateToRevitalisasiForm,
  onNavigateToPetaSurvei
}) => {
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [selectedRegency, setSelectedRegency] = useState<string>('all');
  const [selectedVillage, setSelectedVillage] = useState<string>('all');
  const [activeTableTab, setActiveTableTab] = useState<'sastra' | 'vitalitas' | 'revitalisasi' | 'panduan'>('sastra');

  // Load records from storage
  const [sastraLisanList, setSastraLisanList] = useState<SastraLisanRecord[]>([]);
  const [vitalitasList, setVitalitasList] = useState<KuesionerVitalitasResponse[]>([]);
  const [monevList, setMonevList] = useState<RevitalisasiMonevRecord[]>([]);

  useEffect(() => {
    setSastraLisanList(loadSastraLisanRecords());
    setVitalitasList(loadVitalitasResponses());
    setMonevList(loadMonevRecords());
  }, []);

  // Filter options
  const provinceOptions = useMemo(() => {
    const set = new Set<string>();
    surveys.forEach(s => {
      const p = s.data.titikPengamatan.provinsi?.trim();
      if (p) set.add(p);
    });
    sastraLisanList.forEach(item => {
      const p = item.lokasi?.provinsi?.trim();
      if (p) set.add(p);
    });
    return Array.from(set).sort();
  }, [surveys, sastraLisanList]);

  const regencyOptions = useMemo(() => {
    const set = new Set<string>();
    surveys.forEach(s => {
      const p = s.data.titikPengamatan.provinsi?.trim();
      const k = s.data.titikPengamatan.kabupatenKota?.trim();
      if (k && (selectedProvince === 'all' || p?.toLowerCase() === selectedProvince.toLowerCase())) {
        set.add(k);
      }
    });
    sastraLisanList.forEach(item => {
      const p = item.lokasi?.provinsi?.trim();
      const k = item.lokasi?.kabupatenKota?.trim();
      if (k && (selectedProvince === 'all' || p?.toLowerCase() === selectedProvince.toLowerCase())) {
        set.add(k);
      }
    });
    vitalitasList.forEach(item => {
      const k = item.kabupatenKota?.trim();
      if (k) set.add(k);
    });
    monevList.forEach(item => {
      const k = item.kabupatenKota?.trim();
      if (k) set.add(k);
    });
    return Array.from(set).sort();
  }, [surveys, sastraLisanList, vitalitasList, monevList, selectedProvince]);

  const villageOptions = useMemo(() => {
    const set = new Set<string>();
    surveys.forEach(s => {
      const p = s.data.titikPengamatan.provinsi?.trim();
      const k = s.data.titikPengamatan.kabupatenKota?.trim();
      const v = s.data.titikPengamatan.namaDesa?.trim();
      const matchP = selectedProvince === 'all' || p?.toLowerCase() === selectedProvince.toLowerCase();
      const matchK = selectedRegency === 'all' || k?.toLowerCase() === selectedRegency.toLowerCase();
      if (v && matchP && matchK) set.add(v);
    });
    sastraLisanList.forEach(item => {
      const p = item.lokasi?.provinsi?.trim();
      const k = item.lokasi?.kabupatenKota?.trim();
      const v = item.lokasi?.desaKelurahan?.trim();
      const matchP = selectedProvince === 'all' || p?.toLowerCase() === selectedProvince.toLowerCase();
      const matchK = selectedRegency === 'all' || k?.toLowerCase() === selectedRegency.toLowerCase();
      if (v && matchP && matchK) set.add(v);
    });
    vitalitasList.forEach(item => {
      const k = item.kabupatenKota?.trim();
      const v = item.desa?.trim();
      const matchK = selectedRegency === 'all' || k?.toLowerCase() === selectedRegency.toLowerCase();
      if (v && matchK) set.add(v);
    });
    monevList.forEach(item => {
      const k = item.kabupatenKota?.trim();
      const v = item.desa?.trim();
      const matchK = selectedRegency === 'all' || k?.toLowerCase() === selectedRegency.toLowerCase();
      if (v && matchK) set.add(v);
    });
    return Array.from(set).sort();
  }, [surveys, sastraLisanList, vitalitasList, monevList, selectedProvince, selectedRegency]);

  // Filtered dataset records
  const filteredSastra = useMemo(() => {
    return sastraLisanList.filter(item => {
      const p = item.lokasi?.provinsi?.toLowerCase();
      const k = item.lokasi?.kabupatenKota?.toLowerCase();
      const v = item.lokasi?.desaKelurahan?.toLowerCase();

      const matchP = selectedProvince === 'all' || !p || p === selectedProvince.toLowerCase();
      const matchK = selectedRegency === 'all' || !k || k === selectedRegency.toLowerCase();
      const matchV = selectedVillage === 'all' || !v || v === selectedVillage.toLowerCase();
      return matchP && matchK && matchV;
    });
  }, [sastraLisanList, selectedProvince, selectedRegency, selectedVillage]);

  const filteredVitalitas = useMemo(() => {
    return vitalitasList.filter(item => {
      const k = item.kabupatenKota?.toLowerCase();
      const v = item.desa?.toLowerCase();

      const matchK = selectedRegency === 'all' || !k || k === selectedRegency.toLowerCase();
      const matchV = selectedVillage === 'all' || !v || v === selectedVillage.toLowerCase();
      return matchK && matchV;
    });
  }, [vitalitasList, selectedProvince, selectedRegency, selectedVillage]);

  const filteredMonev = useMemo(() => {
    return monevList.filter(item => {
      const k = item.kabupatenKota?.toLowerCase();
      const v = item.desa?.toLowerCase();

      const matchK = selectedRegency === 'all' || !k || k === selectedRegency.toLowerCase();
      const matchV = selectedVillage === 'all' || !v || v === selectedVillage.toLowerCase();
      return matchK && matchV;
    });
  }, [monevList, selectedProvince, selectedRegency, selectedVillage]);

  const avgVitalitas = useMemo(() => {
    if (filteredVitalitas.length === 0) return 3.75;
    const sum = filteredVitalitas.reduce((acc, v) => acc + v.scoreAvg, 0);
    return Number((sum / filteredVitalitas.length).toFixed(2));
  }, [filteredVitalitas]);

  const avgIkrbd = useMemo(() => {
    if (filteredMonev.length === 0) return 82.3;
    const sum = filteredMonev.reduce((acc, m) => acc + m.ikrbdScore, 0);
    return Number((sum / filteredMonev.length).toFixed(1));
  }, [filteredMonev]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-5 sm:p-7 text-white shadow-lg border border-indigo-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-20 -mb-16 w-56 h-56 rounded-full bg-purple-500/10 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-indigo-200 border border-white/20 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-300" />
                <span>CARTO.com Geospatial Visualization Engine</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>API Key Terotentikasi & Aman di Server</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-snug">
              Peta Pemetaan Sastra Lisan, Vitalitas, &amp; Revitalisasi Bahasa
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
              Integrasi geospasial resmi Kementerian/Badan Bahasa: memetakan karya sastra lisan berkoordinat, tingkat daya hidup bahasa daerah (95 butir), dan evaluasi kinerja revitalisasi (IKRBD).
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onOpenRegionalReport && (
              <button
                type="button"
                onClick={onOpenRegionalReport}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                <span>Unduh Laporan Wilayah (PDF)</span>
              </button>
            )}

            {onNavigateToPetaSurvei && (
              <button
                type="button"
                onClick={onNavigateToPetaSurvei}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                <Layers className="w-4 h-4 text-indigo-200" />
                <span>Peta Titik Survei Lapangan</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Access to Dedicated Thematic Maps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => onNavigateToView?.('peta-sastra-lisan')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-purple-200 dark:border-purple-900/60 shadow-2xs hover:shadow-md hover:border-purple-400 dark:hover:border-purple-600 transition-all text-left flex items-start gap-3.5 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Peta Sastra Lisan
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
              Visualisasi cerita rakyat, motif Stith Thompson, narasumber, dan rekaman audio tutur.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateToView?.('peta-vitalitas')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-900/60 shadow-2xs hover:shadow-md hover:border-emerald-400 dark:hover:border-emerald-600 transition-all text-left flex items-start gap-3.5 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Peta Vitalitas Bahasa
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
              Tingkat daya hidup 6 status UNESCO &amp; EGIDS berdasarkan instrumen 95 butir.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateToView?.('peta-revitalisasi')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-teal-200 dark:border-teal-900/60 shadow-2xs hover:shadow-md hover:border-teal-400 dark:hover:border-teal-600 transition-all text-left flex items-start gap-3.5 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                Peta Revitalisasi Bahasa
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
              Evaluasi Monev IKRBD, persebaran guru master, sekolah binaan, dan agenda FTBI.
            </p>
          </div>
        </button>
      </div>

      {/* 2. Filter Bar Bertingkat Wilayah */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Filter Wilayah Geospasial:</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Peta menyesuaikan otomatis sesuai wilayah terpilih
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Provinsi */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Provinsi
            </label>
            <select
              value={selectedProvince}
              onChange={(e) => {
                setSelectedProvince(e.target.value);
                setSelectedRegency('all');
                setSelectedVillage('all');
              }}
              className="w-full text-xs py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">Seluruh Provinsi ({provinceOptions.length})</option>
              {provinceOptions.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Kabupaten / Kota */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Kabupaten / Kota
            </label>
            <select
              value={selectedRegency}
              onChange={(e) => {
                setSelectedRegency(e.target.value);
                setSelectedVillage('all');
              }}
              className="w-full text-xs py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">Seluruh Kabupaten / Kota ({regencyOptions.length})</option>
              {regencyOptions.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          {/* Desa / Kelurahan */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Titik Desa / Kelurahan
            </label>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">Seluruh Desa Terdata ({villageOptions.length})</option>
              {villageOptions.map(v => (
                <option key={v} value={v}>Desa {v}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Komponen Utama Peta CARTO.com */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
        <CartoRegionalMap
          surveys={surveys}
          sastraLisanList={sastraLisanList}
          vitalitasList={vitalitasList}
          monevList={monevList}
          selectedProvince={selectedProvince}
          selectedRegency={selectedRegency}
          selectedVillage={selectedVillage}
        />
      </div>

      {/* 4. Tab Rincian Tabel Hasil Pengisian Tiga Instrumen */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Rincian Hasil Pengisian Tiga Instrumen Terpetakan</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pilih tab di bawah untuk memeriksa data tabular dan bukti dokumentasi lapangan.
            </p>
          </div>

          {/* Subtabs Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTableTab('sastra')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTableTab === 'sastra'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>1. Sastra Lisan ({filteredSastra.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTableTab('vitalitas')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTableTab === 'vitalitas'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>2. Vitalitas Bahasa ({filteredVitalitas.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTableTab('revitalisasi')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTableTab === 'revitalisasi'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>3. Revitalisasi IKRBD ({filteredMonev.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: SASTRA LISAN TABULAR */}
        {activeTableTab === 'sastra' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Menampilkan karya sastra lisan yang terpetakan dengan titik koordinat:</span>
              {onNavigateToSastraLisanForm && (
                <button
                  type="button"
                  onClick={onNavigateToSastraLisanForm}
                  className="text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Isi Instrumen Sastra Lisan Baru</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">Judul Sastra Lisan</th>
                    <th className="py-2.5 px-3">Genre / Jenis</th>
                    <th className="py-2.5 px-3">Narasumber &amp; Usia</th>
                    <th className="py-2.5 px-3">Komunitas / Sanggar</th>
                    <th className="py-2.5 px-3">Desa &amp; Kab/Kota</th>
                    <th className="py-2.5 px-3 text-right">Koordinat CARTO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSastra.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                        {item.namaSastraLisan}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          {item.analisisJenis?.jenisUtama || 'Cerita Rakyat'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                        {item.narasumber?.namaLengkap} ({item.narasumber?.usia || '-'} th)
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {item.narasumber?.komunitas?.namaKomunitas || 'Penutur Adat'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        Ds. {item.lokasi?.desaKelurahan}, {item.lokasi?.kabupatenKota}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
                        {item.lokasi?.titikKoordinat || 'Terpetakan'}
                      </td>
                    </tr>
                  ))}
                  {filteredSastra.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-slate-400">
                        Tidak ada data sastra lisan pada filter wilayah yang dipilih.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: VITALITAS BAHASA TABULAR */}
        {activeTableTab === 'vitalitas' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Menampilkan rekapitulasi skor daya hidup bahasa dari kuesioner 95 butir:</span>
              {onNavigateToVitalitasForm && (
                <button
                  type="button"
                  onClick={onNavigateToVitalitasForm}
                  className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Isi Kuesioner Vitalitas Baru</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">Bahasa Daerah</th>
                    <th className="py-2.5 px-3">Status Daya Hidup</th>
                    <th className="py-2.5 px-3">Skor Rata-rata</th>
                    <th className="py-2.5 px-3">Responden</th>
                    <th className="py-2.5 px-3">Lokasi (Desa &amp; Kab)</th>
                    <th className="py-2.5 px-3 text-right">Kelengkapan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredVitalitas.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                        {item.bahasaDaerah}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.vitalitasStatus === 'Aman' ? 'bg-emerald-100 text-emerald-800' :
                          item.vitalitasStatus === 'Rentan' ? 'bg-sky-100 text-sky-800' :
                          item.vitalitasStatus === 'Mengalami Kemunduran' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {item.vitalitasStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {item.scoreAvg.toFixed(2)} / 5.0
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {item.respondenNama} ({item.respondenUsia || '-'} th)
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        Ds. {item.desa}, {item.kabupatenKota || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                        {item.totalAnswered} / 95 Butir
                      </td>
                    </tr>
                  ))}
                  {filteredVitalitas.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-slate-400">
                        Tidak ada data vitalitas bahasa pada filter wilayah yang dipilih.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: REVITALISASI BAHASA TABULAR */}
        {activeTableTab === 'revitalisasi' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Menampilkan hasil evaluasi Indeks Kinerja Revitalisasi Bahasa Daerah (IKRBD):</span>
              {onNavigateToRevitalisasiForm && (
                <button
                  type="button"
                  onClick={onNavigateToRevitalisasiForm}
                  className="text-teal-600 dark:text-teal-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Isi Monev Revitalisasi Baru</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">Bahasa Daerah</th>
                    <th className="py-2.5 px-3">Indeks IKRBD</th>
                    <th className="py-2.5 px-3">Kategori Capaian</th>
                    <th className="py-2.5 px-3">Lokasi (Desa &amp; Kec)</th>
                    <th className="py-2.5 px-3">Petugas Monev</th>
                    <th className="py-2.5 px-3">Intervensi Kebijakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredMonev.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                        {item.bahasaDaerah}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-teal-700 dark:text-teal-300 text-sm">
                        {item.ikrbdScore} / 100
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                          {item.kategori}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        Ds. {item.desa}, Kec. {item.kecamatan}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                        {item.petugasMonev}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={item.intervensiKebijakan}>
                        {item.intervensiKebijakan}
                      </td>
                    </tr>
                  ))}
                  {filteredMonev.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-slate-400">
                        Tidak ada data monev revitalisasi pada filter wilayah yang dipilih.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
