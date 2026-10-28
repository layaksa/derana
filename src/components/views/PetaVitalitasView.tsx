import React, { useState, useMemo, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Activity, 
  Languages, 
  MapPin, 
  Filter, 
  Search, 
  Layers, 
  Info, 
  Globe, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  FileText, 
  Users, 
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { applyLeafletSafetyPatch } from '../../utils/leafletPatch';
import { KuesionerVitalitasResponse } from '../../data/kuesionerVitalitasData';
import { SurveyRecord } from '../../types/linguistic';
import { loadVitalitasResponses } from '../../utils/vitalitasStorage';
import { CartoBasemapStyle } from '../reports/CartoRegionalMap';

interface PetaVitalitasViewProps {
  surveys?: SurveyRecord[];
  onNavigateToForm?: () => void;
  onNavigateToKondisiBahasa?: () => void;
  onNavigateToView?: (viewKey: string) => void;
}

export const PetaVitalitasView: React.FC<PetaVitalitasViewProps> = ({
  surveys = [],
  onNavigateToForm,
  onNavigateToKondisiBahasa,
  onNavigateToView
}) => {
  const [responses, setResponses] = useState<KuesionerVitalitasResponse[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [basemapStyle, setBasemapStyle] = useState<CartoBasemapStyle>('voyager');
  const [selectedPoint, setSelectedPoint] = useState<KuesionerVitalitasResponse | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());

  // Load responses
  useEffect(() => {
    const list = loadVitalitasResponses();
    setResponses(list);
    if (list.length > 0 && !selectedPoint) {
      setSelectedPoint(list[0]);
    }
  }, []);

  // Coordinate resolution
  const getCoordinates = (item: KuesionerVitalitasResponse): [number, number] => {
    const desa = item.desa?.toLowerCase();
    if (desa && surveys.length > 0) {
      const match = surveys.find(s => s.data.titikPengamatan.namaDesa?.toLowerCase() === desa);
      if (match) {
        const lat = Number(match.data.situasiGeografis?.koordinatLintang ?? match.data.titikPengamatan?.koordinatLintang);
        const lng = Number(match.data.situasiGeografis?.koordinatBujur ?? match.data.titikPengamatan?.koordinatBujur);
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          return [lat, lng];
        }
      }
    }
    const kab = item.kabupatenKota?.toLowerCase() || '';
    if (kab.includes('kuningan') || kab.includes('jawa barat')) return [-6.9745, 108.4872];
    if (kab.includes('cianjur')) return [-6.823, 107.142];
    if (kab.includes('pangandaran')) return [-7.701, 108.653];
    if (kab.includes('cirebon')) return [-6.715, 108.555];
    if (kab.includes('garut')) return [-7.421, 107.821];
    if (kab.includes('maluku tengah') || kab.includes('hitu')) return [-3.585, 128.185];
    if (kab.includes('tanimbar')) return [-7.978, 131.298];
    return [-6.2088, 106.8456];
  };

  // Status visual attributes
  const getStatusColorConfig = (status: string) => {
    switch (status) {
      case 'Aman':
        return {
          bg: 'bg-emerald-600',
          text: 'text-emerald-700 dark:text-emerald-300',
          badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800',
          ring: 'ring-emerald-400/40',
          hex: '#059669'
        };
      case 'Rentan':
        return {
          bg: 'bg-sky-600',
          text: 'text-sky-700 dark:text-sky-300',
          badgeBg: 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-800',
          ring: 'ring-sky-400/40',
          hex: '#0284c7'
        };
      case 'Mengalami Kemunduran':
        return {
          bg: 'bg-amber-600',
          text: 'text-amber-700 dark:text-amber-300',
          badgeBg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800',
          ring: 'ring-amber-400/40',
          hex: '#d97706'
        };
      case 'Terancam Punah':
        return {
          bg: 'bg-orange-600',
          text: 'text-orange-700 dark:text-orange-300',
          badgeBg: 'bg-orange-50 dark:bg-orange-950/60 border-orange-300 dark:border-orange-800',
          ring: 'ring-orange-400/40',
          hex: '#ea580c'
        };
      case 'Kritis':
        return {
          bg: 'bg-rose-600',
          text: 'text-rose-700 dark:text-rose-300',
          badgeBg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800',
          ring: 'ring-rose-400/40',
          hex: '#e11d48'
        };
      case 'Punah':
        return {
          bg: 'bg-slate-700',
          text: 'text-slate-700 dark:text-slate-300',
          badgeBg: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700',
          ring: 'ring-slate-400/40',
          hex: '#334155'
        };
      default:
        return {
          bg: 'bg-emerald-600',
          text: 'text-emerald-700 dark:text-emerald-300',
          badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800',
          ring: 'ring-emerald-400/40',
          hex: '#059669'
        };
    }
  };

  // Filter responses
  const filteredResponses = useMemo(() => {
    return responses.filter(r => {
      const matchStatus = selectedStatus === 'all' || r.vitalitasStatus === selectedStatus;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        r.bahasaDaerah.toLowerCase().includes(q) ||
        r.desa.toLowerCase().includes(q) ||
        (r.kabupatenKota && r.kabupatenKota.toLowerCase().includes(q)) ||
        r.respondenNama.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [responses, selectedStatus, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = responses.length;
    const avgScore = total > 0 ? (responses.reduce((sum, r) => sum + r.scoreAvg, 0) / total).toFixed(2) : '0.00';
    const amanCount = responses.filter(r => r.vitalitasStatus === 'Aman').length;
    const threatenedCount = responses.filter(r => ['Mengalami Kemunduran', 'Terancam Punah', 'Kritis'].includes(r.vitalitasStatus)).length;
    return { total, avgScore, amanCount, threatenedCount };
  }, [responses]);

  // Initialize Leaflet Map
  useEffect(() => {
    applyLeafletSafetyPatch();

    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [-6.9745, 108.4872],
        zoom: 9,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.control.attribution({
        position: 'bottomleft',
        prefix: '<span class="text-[10px] text-slate-500 font-mono">CARTO Basemaps • Indeks Vitalitas Bahasa UNESCO Badan Bahasa</span>'
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

    filteredResponses.forEach((response, idx) => {
      const [baseLat, baseLng] = getCoordinates(response);
      const jitterLat = baseLat + (idx % 2 === 0 ? 0.004 : -0.004) * (idx + 1);
      const jitterLng = baseLng + (idx % 2 === 0 ? -0.004 : 0.004) * (idx + 1);

      const isSelected = selectedPoint?.id === response.id;
      const colorCfg = getStatusColorConfig(response.vitalitasStatus);

      const markerHtml = `
        <div class="relative group cursor-pointer">
          <div class="w-9 h-9 rounded-xl ${colorCfg.bg} ${isSelected ? 'ring-4 ring-white' : `ring-2 ${colorCfg.ring}`} text-white flex items-center justify-center shadow-lg border-2 border-white transform transition-transform group-hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 ${colorCfg.bg} rotate-45 border-r border-b border-white"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-vitalitas-marker',
        html: markerHtml,
        iconSize: [36, 42],
        iconAnchor: [18, 42]
      });

      const marker = L.marker([jitterLat, jitterLng], { icon: customIcon });

      const popupHtml = `
        <div class="p-3 text-slate-800 font-sans min-w-[240px] max-w-[280px]">
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Vitalitas Bahasa (95 Butir)
          </div>
          <h4 class="font-bold text-xs text-slate-900 leading-snug mb-1">
            ${response.bahasaDaerah}
          </h4>
          <div class="text-[11px] text-slate-600 space-y-1 mb-2">
            <div><strong>Status UNESCO:</strong> <span class="font-bold" style="color: ${colorCfg.hex}">${response.vitalitasStatus}</span></div>
            <div><strong>Indeks Skor:</strong> ${response.scoreAvg.toFixed(2)} / 5.0</div>
            <div><strong>Lokasi:</strong> Desa ${response.desa}, ${response.kabupatenKota || '-'}</div>
            <div><strong>Responden:</strong> ${response.respondenNama}</div>
          </div>
          <div class="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500 font-semibold">
            <span>Klik baris untuk rincian 6 faktor</span>
            <span class="font-mono text-emerald-600">CARTO GIS</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        setSelectedPoint(response);
      });

      markersGroup.addLayer(marker);
      markersMapRef.current.set(response.id, marker);
      bounds.extend([jitterLat, jitterLng]);
    });

    if (filteredResponses.length > 0 && mapInstanceRef.current && bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [filteredResponses, selectedPoint]);

  const handleSelectPoint = (point: KuesionerVitalitasResponse) => {
    setSelectedPoint(point);
    const marker = markersMapRef.current.get(point.id);
    if (marker && mapInstanceRef.current) {
      const latlng = marker.getLatLng();
      mapInstanceRef.current.flyTo(latlng, 12, { duration: 0.8 });
      marker.openPopup();
    }
  };

  const selectedColorCfg = selectedPoint ? getStatusColorConfig(selectedPoint.vitalitasStatus) : null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold">
              <Activity className="w-3.5 h-3.5" />
              <span>Instrumen Vitalitas & Daya Hidup Bahasa Daerah (UNESCO 6-9 Faktor)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Peta Geospasial Vitalitas Bahasa
            </h1>
            <p className="text-sm text-emerald-200/90 leading-relaxed">
              Pemetaan tingkat daya tahan bahasa ibu, transmisi antargenerasi, ranah pemakaian, dan ancaman kepunahan bahasa berbasis survei 95 butir dengan engine CARTO.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onNavigateToForm && (
              <button
                type="button"
                onClick={onNavigateToForm}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Isi Kuesioner Vitalitas (95 Butir)</span>
              </button>
            )}
            {onNavigateToKondisiBahasa && (
              <button
                type="button"
                onClick={onNavigateToKondisiBahasa}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
              >
                <Languages className="w-4 h-4" />
                <span>Kondisi Kebahasaan</span>
              </button>
            )}
            {onNavigateToView && (
              <button
                type="button"
                onClick={() => onNavigateToView('peta-carto')}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer"
                title="Buka Peta Terpadu Tri-Instrumen"
              >
                <Globe className="w-4 h-4 text-emerald-300" />
                <span>Peta CARTO Terpadu</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* UNESCO Vitality Status Grade Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {[
          { label: 'Aman', range: '4.01 - 5.00', color: 'bg-emerald-600', desc: 'Dituturkan semua generasi' },
          { label: 'Rentan', range: '3.01 - 4.00', color: 'bg-sky-600', desc: 'Mulai terbatas di luar rumah' },
          { label: 'Kemunduran', range: '2.51 - 3.00', color: 'bg-amber-600', desc: 'Anak-anak jarang menuturkan' },
          { label: 'Terancam', range: '1.51 - 2.50', color: 'bg-orange-600', desc: 'Hanya generasi tua/kakek' },
          { label: 'Kritis', range: '1.01 - 1.50', color: 'bg-rose-600', desc: 'Penutur tersisa segelintir' },
          { label: 'Punah', range: '<= 1.00', color: 'bg-slate-700', desc: 'Tidak ada penutur aktif' }
        ].map(item => (
          <div key={item.label} className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{item.label}</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">{item.range}</div>
          </div>
        ))}
      </div>

      {/* Quantitative Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Titik Vitalitas</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
            {stats.total}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
            Survei respon lengkap
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Rerata Skor Vitalitas</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono tabular-nums">
            {stats.avgScore} <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Skala Likert agregat
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Kategori Aman</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono tabular-nums">
            {stats.amanCount}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Daya transmisi kokoh
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Perlu Intervensi</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono tabular-nums">
            {stats.threatenedCount}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
            Mundur / Terancam / Kritis
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
              placeholder="Cari bahasa, desa, kabupaten, responden..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
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

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
          {[
            { key: 'all', label: `Semua (${responses.length})` },
            { key: 'Aman', label: 'Aman' },
            { key: 'Rentan', label: 'Rentan' },
            { key: 'Mengalami Kemunduran', label: 'Kemunduran' },
            { key: 'Terancam Punah', label: 'Terancam Punah' },
            { key: 'Kritis', label: 'Kritis' }
          ].map(s => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSelectedStatus(s.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedStatus === s.key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map & Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col relative">
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Peta Daya Hidup Bahasa ({filteredResponses.length} Titik)
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
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>Titik Vitalitas UNESCO</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Warna pin mewakili status kepunahan. Klik penanda untuk menginspeksi faktor transmisi.
              </p>
            </div>
          </div>
        </div>

        {/* Selected Vitality Inspector */}
        <div className="lg:col-span-4 space-y-4">
          {selectedPoint && selectedColorCfg ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 sticky top-6">
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Status Vitalitas UNESCO
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug mt-0.5">
                    {selectedPoint.bahasaDaerah}
                  </h3>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${selectedColorCfg.badgeBg} ${selectedColorCfg.text}`}>
                  {selectedPoint.vitalitasStatus}
                </span>
              </div>

              {/* Score Progress Bar */}
              <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-400">Skor Rata-Rata Respon</span>
                  <span className="font-mono tabular-nums text-slate-900 dark:text-white">
                    {selectedPoint.scoreAvg.toFixed(2)} / 5.0
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div 
                    className={`h-full ${selectedColorCfg.bg}`}
                    style={{ width: `${Math.min(100, (selectedPoint.scoreAvg / 5) * 100)}%` }}
                  ></div>
                </div>
                <div className="text-[10px] text-slate-400 text-right">
                  {selectedPoint.totalAnswered} dari 95 butir kuesioner terisi
                </div>
              </div>

              {/* Informant & Location Details */}
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div><strong>Responden:</strong> {selectedPoint.respondenNama} ({selectedPoint.respondenUsia || '-'} tahun, {selectedPoint.respondenGender || '-'})</div>
                {selectedPoint.respondenPekerjaan && (
                  <div><strong>Pekerjaan:</strong> {selectedPoint.respondenPekerjaan}</div>
                )}
                <div><strong>Wilayah:</strong> Desa {selectedPoint.desa}, {selectedPoint.kecamatan ? `Kec. ${selectedPoint.kecamatan}, ` : ''}{selectedPoint.kabupatenKota || '-'}</div>
              </div>

              {/* 6 UNESCO Vitality Factors Breakdown (Simulated/Derived from answers) */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Evaluasi 6 Faktor Daya Hidup UNESCO
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                    <span className="text-slate-600 dark:text-slate-400">1. Transmisi Lintas Generasi</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {selectedPoint.scoreAvg >= 4 ? 'Tinggi (Tingkat 5)' : selectedPoint.scoreAvg >= 3 ? 'Sedang (Tingkat 4)' : 'Kritis (Tingkat 2)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                    <span className="text-slate-600 dark:text-slate-400">2. Proporsi Penutur dlm Populasi</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {selectedPoint.scoreAvg >= 4 ? '> 80% Mayoritas' : selectedPoint.scoreAvg >= 3 ? '50-70% Campuran' : '< 30% Minoritas'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                    <span className="text-slate-600 dark:text-slate-400">3. Ranah Penggunaan Bahasa</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {selectedPoint.scoreAvg >= 4 ? 'Keluarga & Adat' : 'Hanya Rumah/Terbatas'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                    <span className="text-slate-600 dark:text-slate-400">4. Respon Media Digital & Baru</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {selectedPoint.scoreAvg >= 4.2 ? 'Mulai Muncul' : 'Minim / Rendah'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                    <span className="text-slate-600 dark:text-slate-400">5. Ketersediaan Materi Literasi</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {selectedPoint.scoreAvg >= 4 ? 'Tersedia Modul' : 'Belum Terstandardisasi'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-600 dark:text-slate-400">6. Sikap Bahasa Masyarakat</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      Bangga & Mendukung
                    </span>
                  </div>
                </div>
              </div>

              {/* Qualitative Notes */}
              {selectedPoint.catatan && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Catatan Sosiolinguistik
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    {selectedPoint.catatan}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400">
              <Activity className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold">Pilih titik vitalitas di peta</p>
              <p className="text-xs text-slate-500 mt-1">
                Data 6 faktor daya tahan bahasa menurut UNESCO akan diinspeksi di sini.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Survey Points Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Data Titik Pengukuran Vitalitas Bahasa ({filteredResponses.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Hasil evaluasi instrumen vitalitas 95 butir di berbagai titik pengamatan kebahasaan.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Bahasa Daerah</th>
                <th className="py-2.5 px-3">Status UNESCO</th>
                <th className="py-2.5 px-3">Skor Rata-Rata</th>
                <th className="py-2.5 px-3">Lokasi (Desa/Kab)</th>
                <th className="py-2.5 px-3">Responden</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredResponses.map(item => {
                const isSelected = selectedPoint?.id === item.id;
                const cfg = getStatusColorConfig(item.vitalitasStatus);
                return (
                  <tr
                    key={item.id}
                    onClick={() => handleSelectPoint(item)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 font-medium'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                      {item.bahasaDaerah}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${cfg.badgeBg} ${cfg.text}`}>
                        {item.vitalitasStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold tabular-nums">
                      {item.scoreAvg.toFixed(2)} / 5.0
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      Desa {item.desa}, {item.kabupatenKota || '-'}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {item.respondenNama}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPoint(item);
                        }}
                        className="p-1 text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 cursor-pointer"
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
