import React, { useState, useMemo, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Sparkles, 
  GraduationCap, 
  School, 
  MapPin, 
  Search, 
  Filter, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  TrendingUp, 
  Globe, 
  Users, 
  Award, 
  Building2,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { applyLeafletSafetyPatch } from '../../utils/leafletPatch';
import { RevitalisasiMonevRecord, RevitalisasiRAPRecord } from '../../types/revitalisasi';
import { SurveyRecord } from '../../types/linguistic';
import { loadMonevRecords, loadRAPRecords } from '../../utils/revitalisasiStorage';
import { CartoBasemapStyle } from '../reports/CartoRegionalMap';

interface PetaRevitalisasiViewProps {
  surveys?: SurveyRecord[];
  onNavigateToMonevForm?: () => void;
  onNavigateToRAPForm?: () => void;
  onNavigateToModul?: () => void;
  onNavigateToView?: (viewKey: string) => void;
}

export const PetaRevitalisasiView: React.FC<PetaRevitalisasiViewProps> = ({
  surveys = [],
  onNavigateToMonevForm,
  onNavigateToRAPForm,
  onNavigateToModul,
  onNavigateToView
}) => {
  const [monevList, setMonevList] = useState<RevitalisasiMonevRecord[]>([]);
  const [rapList, setRAPList] = useState<RevitalisasiRAPRecord[]>([]);
  const [activeLayer, setActiveLayer] = useState<'all' | 'monev' | 'rap'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [basemapStyle, setBasemapStyle] = useState<CartoBasemapStyle>('voyager');
  const [selectedMonev, setSelectedMonev] = useState<RevitalisasiMonevRecord | null>(null);
  const [selectedRAP, setSelectedRAP] = useState<RevitalisasiRAPRecord | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());

  // Load data
  useEffect(() => {
    const monevs = loadMonevRecords();
    const raps = loadRAPRecords();
    setMonevList(monevs);
    setRAPList(raps);
    if (monevs.length > 0) {
      setSelectedMonev(monevs[0]);
    }
  }, []);

  // Coordinate resolution
  const getCoordinates = (desa?: string, kabupaten?: string): [number, number] => {
    if (desa && surveys.length > 0) {
      const match = surveys.find(s => s.data.titikPengamatan.namaDesa?.toLowerCase() === desa.toLowerCase());
      if (match) {
        const lat = Number(match.data.situasiGeografis?.koordinatLintang ?? match.data.titikPengamatan?.koordinatLintang);
        const lng = Number(match.data.situasiGeografis?.koordinatBujur ?? match.data.titikPengamatan?.koordinatBujur);
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          return [lat, lng];
        }
      }
    }
    const kab = kabupaten?.toLowerCase() || '';
    if (kab.includes('maluku tengah') || kab.includes('hitu') || kab.includes('leihitu')) return [-3.585, 128.185];
    if (kab.includes('tanimbar') || kab.includes('olilit')) return [-7.978, 131.298];
    if (kab.includes('kuningan') || kab.includes('jawa barat')) return [-6.9745, 108.4872];
    if (kab.includes('cianjur')) return [-6.823, 107.142];
    if (kab.includes('cirebon')) return [-6.715, 108.555];
    return [-3.585, 128.185]; // Default region
  };

  // Filtered Monev
  const filteredMonev = useMemo(() => {
    if (activeLayer === 'rap') return [];
    return monevList.filter(m => {
      const matchCategory = selectedCategory === 'all' || m.kategori === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        m.bahasaDaerah.toLowerCase().includes(q) ||
        m.desa.toLowerCase().includes(q) ||
        m.kabupatenKota.toLowerCase().includes(q) ||
        (m.petugasMonev && m.petugasMonev.toLowerCase().includes(q));
      return matchCategory && matchSearch;
    });
  }, [monevList, activeLayer, selectedCategory, searchQuery]);

  // Filtered RAP
  const filteredRAP = useMemo(() => {
    if (activeLayer === 'monev') return [];
    return rapList.filter(r => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        r.bahasaDaerah.toLowerCase().includes(q) ||
        r.profilPengajar.namaLengkap.toLowerCase().includes(q) ||
        r.profilPengajar.instansiUnitKerja.toLowerCase().includes(q) ||
        r.profilPengajar.wilayahTarget.toLowerCase().includes(q);
      return matchSearch;
    });
  }, [rapList, activeLayer, searchQuery]);

  // Aggregated Statistics
  const stats = useMemo(() => {
    const totalMonev = monevList.length;
    const totalRAP = rapList.length;
    const totalSchools = rapList.reduce((acc, r) => acc + (r.indikator?.jumlahLembagaAktif || 4), 0);
    const totalYoungSpeakers = rapList.reduce((acc, r) => acc + (r.sasaran?.targetJumlahPenuturMuda || 0), 0);
    const totalTeachers = rapList.reduce((acc, r) => acc + (r.sasaran?.targetJumlahPengajarSejawat || 0), 0);
    return { totalMonev, totalRAP, totalSchools, totalYoungSpeakers, totalTeachers };
  }, [monevList, rapList]);

  // Initialize Map
  useEffect(() => {
    applyLeafletSafetyPatch();

    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [-3.585, 128.185], // Center in eastern Indonesia revitalization focus
        zoom: 7,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.control.attribution({
        position: 'bottomleft',
        prefix: '<span class="text-[10px] text-slate-500 font-mono">CARTO Basemaps • Monev Revitalisasi MBRBD Kemendikbudristek</span>'
      }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileUrl = `/api/carto/tiles/${basemapStyle}/{z}/{x}/{y}.png`;
    const newTileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '© CARTO © OpenStreetMap'
    }).addTo(map);

    tileLayerRef.current = newTileLayer;

    setTimeout(() => {
      map.invalidateSize();
    }, 250);
  }, [basemapStyle]);

  // Populate Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerGroupRef.current) return;

    const markersGroup = markersLayerGroupRef.current;
    markersGroup.clearLayers();
    markersMapRef.current.clear();

    const bounds = L.latLngBounds([]);

    // 1. Monev IKRBD Markers (Teal / Emerald)
    filteredMonev.forEach((item, idx) => {
      const [baseLat, baseLng] = getCoordinates(item.desa, item.kabupatenKota);
      const lat = baseLat + (idx * 0.003);
      const lng = baseLng - (idx * 0.003);

      const isSelected = selectedMonev?.id === item.id;
      const isHighSuccess = item.kategori === 'SANGAT BERHASIL' || item.ikrbdScore >= 80;

      const markerHtml = `
        <div class="relative group cursor-pointer">
          <div class="w-9 h-9 rounded-xl ${isHighSuccess ? 'bg-teal-600' : 'bg-indigo-600'} ${isSelected ? 'ring-4 ring-white' : 'ring-2 ring-teal-400/40'} text-white flex items-center justify-center shadow-lg border-2 border-white transform transition-transform group-hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 ${isHighSuccess ? 'bg-teal-600' : 'bg-indigo-600'} rotate-45 border-r border-b border-white"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-monev-marker',
        html: markerHtml,
        iconSize: [36, 42],
        iconAnchor: [18, 42]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      const popupHtml = `
        <div class="p-3 text-slate-800 font-sans min-w-[240px] max-w-[280px]">
          <div class="text-[10px] font-bold text-teal-700 uppercase tracking-wider mb-1">
            Monev IKRBD Revitalisasi
          </div>
          <h4 class="font-bold text-xs text-slate-900 leading-snug mb-1">
            ${item.bahasaDaerah}
          </h4>
          <div class="text-[11px] text-slate-600 space-y-1 mb-2">
            <div><strong>Skor IKRBD:</strong> <span class="font-mono font-bold text-teal-700">${item.ikrbdScore.toFixed(1)}</span> (${item.kategori})</div>
            <div><strong>Status Program:</strong> ${item.statusPelaksanaan}</div>
            <div><strong>Lokasi:</strong> Desa ${item.desa}, ${item.kabupatenKota}</div>
            <div><strong>Petugas:</strong> ${item.petugasMonev}</div>
          </div>
          <div class="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-teal-700 font-semibold">
            <span>Klik kartu untuk telaah 5 dimensi</span>
            <span class="font-mono">CARTO GIS</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        setSelectedMonev(item);
        setSelectedRAP(null);
      });

      markersGroup.addLayer(marker);
      markersMapRef.current.set(item.id, marker);
      bounds.extend([lat, lng]);
    });

    // 2. RAP Pengimbasan Markers (Indigo / School)
    filteredRAP.forEach((item, idx) => {
      const [baseLat, baseLng] = getCoordinates('', item.profilPengajar.wilayahTarget);
      const lat = baseLat - 0.006 + (idx * 0.003);
      const lng = baseLng + 0.006 + (idx * 0.003);

      const isSelected = selectedRAP?.id === item.id;

      const markerHtml = `
        <div class="relative group cursor-pointer">
          <div class="w-9 h-9 rounded-xl bg-blue-600 ${isSelected ? 'ring-4 ring-white' : 'ring-2 ring-blue-400/40'} text-white flex items-center justify-center shadow-lg border-2 border-white transform transition-transform group-hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-600 rotate-45 border-r border-b border-white"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-rap-marker',
        html: markerHtml,
        iconSize: [36, 42],
        iconAnchor: [18, 42]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      const popupHtml = `
        <div class="p-3 text-slate-800 font-sans min-w-[240px] max-w-[280px]">
          <div class="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">
            RAP Pengimbasan & Sekolah Binaan
          </div>
          <h4 class="font-bold text-xs text-slate-900 leading-snug mb-1">
            ${item.bahasaDaerah}
          </h4>
          <div class="text-[11px] text-slate-600 space-y-1 mb-2">
            <div><strong>Guru Master:</strong> ${item.profilPengajar.namaLengkap}</div>
            <div><strong>Unit Kerja:</strong> ${item.profilPengajar.instansiUnitKerja}</div>
            <div><strong>Target Siswa:</strong> ${item.sasaran?.targetJumlahPenuturMuda || 0} siswa muda</div>
            <div><strong>Pengajar Sejawat:</strong> ${item.sasaran?.targetJumlahPengajarSejawat || 0} guru</div>
          </div>
          <div class="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-blue-700 font-semibold">
            <span>Rencana Aksi Pengimbasan</span>
            <span class="font-mono">CARTO GIS</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        setSelectedRAP(item);
        setSelectedMonev(null);
      });

      markersGroup.addLayer(marker);
      markersMapRef.current.set(item.id, marker);
      bounds.extend([lat, lng]);
    });

    if ((filteredMonev.length > 0 || filteredRAP.length > 0) && mapInstanceRef.current && bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [filteredMonev, filteredRAP, selectedMonev, selectedRAP]);

  const handleSelectMonev = (item: RevitalisasiMonevRecord) => {
    setSelectedMonev(item);
    setSelectedRAP(null);
    const marker = markersMapRef.current.get(item.id);
    if (marker && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(marker.getLatLng(), 11, { duration: 0.8 });
      marker.openPopup();
    }
  };

  const handleSelectRAP = (item: RevitalisasiRAPRecord) => {
    setSelectedRAP(item);
    setSelectedMonev(null);
    const marker = markersMapRef.current.get(item.id);
    if (marker && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(marker.getLatLng(), 11, { duration: 0.8 });
      marker.openPopup();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-cyan-950 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-xl border border-teal-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Program Merdeka Belajar Revitalisasi Bahasa Daerah (MBRBD)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Peta Geospasial Revitalisasi Bahasa
            </h1>
            <p className="text-sm text-teal-200/90 leading-relaxed">
              Pemetaan kemajuan intervensi kebijakan, Indeks Kebutuhan Revitalisasi (IKRBD), sebaran guru master pengimbas, dan sekolah binaan FTBI menggunakan sistem peta CARTO.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onNavigateToMonevForm && (
              <button
                type="button"
                onClick={onNavigateToMonevForm}
                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Isi Monev IKRBD</span>
              </button>
            )}
            {onNavigateToRAPForm && (
              <button
                type="button"
                onClick={onNavigateToRAPForm}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Rencana Aksi (RAP)</span>
              </button>
            )}
            {onNavigateToView && (
              <button
                type="button"
                onClick={() => onNavigateToView('peta-carto')}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer"
                title="Buka Peta Terpadu Tri-Instrumen"
              >
                <Globe className="w-4 h-4 text-teal-300" />
                <span>Peta CARTO Terpadu</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quantitative Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Titik Evaluasi Monev</div>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1 font-mono tabular-nums">
            {stats.totalMonev}
          </div>
          <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium mt-0.5">
            Wilayah intervensi IKRBD
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Guru Master Terlatih</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 font-mono tabular-nums">
            {stats.totalTeachers}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Fasilitator & Pengimbas
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Sekolah & Lembaga Binaan</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 font-mono tabular-nums">
            {stats.totalSchools}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            SD/SMP/Sanggar Budaya
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Target Siswa Terimbas</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono tabular-nums">
            {stats.totalYoungSpeakers}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
            Penutur muda potensial
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari bahasa, guru master, unit kerja, kabupaten..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Layer Filter (All / Monev / RAP) */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveLayer('all')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeLayer === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Semua Layer
              </button>
              <button
                type="button"
                onClick={() => setActiveLayer('monev')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeLayer === 'monev'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Titik Monev IKRBD
              </button>
              <button
                type="button"
                onClick={() => setActiveLayer('rap')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeLayer === 'rap'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sekolah & Pengimbas RAP
              </button>
            </div>

            {/* Basemap Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(['voyager', 'positron', 'dark_matter'] as CartoBasemapStyle[]).map(style => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setBasemapStyle(style)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer capitalize ${
                    basemapStyle === style
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {style === 'dark_matter' ? 'Dark' : style}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Filter for Monev */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
          {[
            { key: 'all', label: `Semua Kategori (${monevList.length})` },
            { key: 'SANGAT BERHASIL', label: 'Sangat Berhasil / Mandiri' },
            { key: 'BERHASIL', label: 'Berhasil' },
            { key: 'CUKUP BERHASIL', label: 'Cukup / Intervensi Sedang' }
          ].map(c => (
            <button
              key={c.key}
              type="button"
              onClick={() => setSelectedCategory(c.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === c.key
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map & Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col relative">
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Peta Titik Revitalisasi & Pengimbasan ({filteredMonev.length + filteredRAP.length} Titik)
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              CARTO {basemapStyle}
            </span>
          </div>

          <div className="relative w-full h-[540px] sm:h-[600px]">
            <div ref={mapContainerRef} className="w-full h-full z-10" />

            <div className="absolute top-3 left-3 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md max-w-xs text-xs">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Intervensi Revitalisasi Bahasa</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Pin bintang teal menunjukkan Monev IKRBD, pin biru topi wisuda menunjukkan Guru Master & Sekolah Binaan.
              </p>
            </div>
          </div>
        </div>

        {/* Selected Program Inspector */}
        <div className="lg:col-span-4 space-y-4">
          {selectedMonev ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 sticky top-6">
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    Hasil Monev IKRBD
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug mt-0.5">
                    {selectedMonev.bahasaDaerah}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                  {selectedMonev.kategori}
                </span>
              </div>

              {/* Score Gauge */}
              <div className="bg-teal-50/70 dark:bg-teal-950/40 rounded-xl p-3 border border-teal-200/60 dark:border-teal-800/60 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-teal-900 dark:text-teal-200">Indeks Kebutuhan (IKRBD)</span>
                  <span className="font-mono text-xl font-black text-teal-700 dark:text-teal-300">
                    {selectedMonev.ikrbdScore.toFixed(1)} <span className="text-xs font-normal">/ 100</span>
                  </span>
                </div>
                <div className="text-[11px] text-teal-800 dark:text-teal-300">
                  Status: <strong>{selectedMonev.statusPelaksanaan}</strong>
                </div>
              </div>

              {/* 5 Dimensions breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  5 Dimensi Evaluasi MBRBD
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">D1: Pembelajaran & Subjek</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedMonev.rataRataDimensi?.d1?.toFixed(2) || '4.33'} / 5.0</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">D2: Keterlibatan Komunitas</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedMonev.rataRataDimensi?.d2?.toFixed(2) || '3.67'} / 5.0</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">D3: Bahan Ajar & Media</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedMonev.rataRataDimensi?.d3?.toFixed(2) || '3.50'} / 5.0</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">D4: Regulasi & Dukungan Pemda</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedMonev.rataRataDimensi?.d4?.toFixed(2) || '3.00'} / 5.0</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-600 dark:text-slate-400">D5: Diseminasi & FTBI</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedMonev.rataRataDimensi?.d5?.toFixed(2) || '4.00'} / 5.0</span>
                  </div>
                </div>
              </div>

              {/* Policy Intervention */}
              <div className="space-y-1 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Rekomendasi Intervensi Kebijakan
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  {selectedMonev.intervensiKebijakan}
                </p>
              </div>

              {/* Informant & Evaluation info */}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 pt-1">
                <div>Lokasi: Desa {selectedMonev.desa}, {selectedMonev.kabupatenKota}</div>
                <div>Petugas Monev: {selectedMonev.petugasMonev}</div>
                <div>Kepala Negeri / Adat: {selectedMonev.kepalaNegeri}</div>
              </div>
            </div>
          ) : selectedRAP ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 sticky top-6">
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Rencana Aksi Pengimbasan (RAP)
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug mt-0.5">
                    {selectedRAP.bahasaDaerah}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                  Guru Master
                </span>
              </div>

              {/* Master Teacher Profile */}
              <div className="bg-blue-50/70 dark:bg-blue-950/40 rounded-xl p-3 border border-blue-200/60 dark:border-blue-800/60 space-y-1.5 text-xs">
                <div className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                  Profil Pengajar Utama / Guru Master
                </div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  {selectedRAP.profilPengajar.namaLengkap}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  Unit Kerja: {selectedRAP.profilPengajar.instansiUnitKerja}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  Wilayah Target: {selectedRAP.profilPengajar.wilayahTarget}
                </div>
              </div>

              {/* Targets */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Target Siswa</div>
                  <div className="font-mono text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedRAP.sasaran?.targetJumlahPenuturMuda || 120}
                  </div>
                  <div className="text-[10px] text-slate-500">Penutur muda SD-SMP</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Guru Sejawat</div>
                  <div className="font-mono text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedRAP.sasaran?.targetJumlahPengajarSejawat || 15}
                  </div>
                  <div className="text-[10px] text-slate-500">Guru terimbas KKG</div>
                </div>
              </div>

              {/* Strategy */}
              {selectedRAP.strategi?.bentukKegiatan && (
                <div className="space-y-1 text-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Bentuk Kegiatan & Kurikulum
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px] bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    {selectedRAP.strategi.bentukKegiatan}
                  </p>
                </div>
              )}

              {/* FTBI Competition target */}
              {selectedRAP.indikator?.keikutsertaanKompetisi && (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                  <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Ajang Festival:</span>
                    <span>{selectedRAP.indikator.keikutsertaanKompetisi}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400">
              <Sparkles className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold">Pilih titik revitalisasi di peta</p>
              <p className="text-xs text-slate-500 mt-1">
                Data evaluasi 5 dimensi IKRBD atau Rencana Aksi Pengimbasan (RAP) akan ditampilkan di sini.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Table of Sites */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Daftar Wilayah Intervensi Revitalisasi Bahasa ({filteredMonev.length + filteredRAP.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar terpadu titik evaluasi Monev IKRBD dan rencana aksi pengimbasan sekolah binaan.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Bahasa Daerah</th>
                <th className="py-2.5 px-3">Tipe Program</th>
                <th className="py-2.5 px-3">Capaian / Target</th>
                <th className="py-2.5 px-3">Lokasi (Wilayah)</th>
                <th className="py-2.5 px-3">Penanggung Jawab</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredMonev.map(item => {
                const isSelected = selectedMonev?.id === item.id;
                return (
                  <tr
                    key={item.id}
                    onClick={() => handleSelectMonev(item)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-teal-50/80 dark:bg-teal-950/40 text-teal-950 dark:text-teal-100 font-medium'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                      {item.bahasaDaerah}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                        Monev IKRBD
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold tabular-nums text-teal-700 dark:text-teal-400">
                      IKRBD: {item.ikrbdScore.toFixed(1)} ({item.kategori})
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      Desa {item.desa}, {item.kabupatenKota}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {item.petugasMonev}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectMonev(item);
                        }}
                        className="p-1 text-teal-600 hover:text-teal-800 dark:text-teal-400 cursor-pointer"
                        title="Fokus ke Peta"
                      >
                        <MapPin className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredRAP.map(item => {
                const isSelected = selectedRAP?.id === item.id;
                return (
                  <tr
                    key={item.id}
                    onClick={() => handleSelectRAP(item)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 font-medium'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                      {item.bahasaDaerah}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        RAP Pengimbasan
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold tabular-nums text-blue-700 dark:text-blue-400">
                      {item.sasaran?.targetJumlahPenuturMuda || 0} Siswa · {item.sasaran?.targetJumlahPengajarSejawat || 0} Guru
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {item.profilPengajar.wilayahTarget}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {item.profilPengajar.namaLengkap}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectRAP(item);
                        }}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 cursor-pointer"
                        title="Fokus ke Peta"
                      >
                        <MapPin className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
