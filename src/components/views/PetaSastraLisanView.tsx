import React, { useState, useMemo, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  BookOpen, 
  Mic, 
  MapPin, 
  Sparkles, 
  Filter, 
  Search, 
  Volume2, 
  Layers, 
  Maximize2, 
  ChevronRight, 
  Info, 
  UserCheck, 
  Globe, 
  Compass, 
  Tag, 
  ExternalLink,
  X,
  Play,
  Share2,
  FileText
} from 'lucide-react';
import { applyLeafletSafetyPatch } from '../../utils/leafletPatch';
import { SastraLisanRecord } from '../../types/sastraLisan';
import { SurveyRecord } from '../../types/linguistic';
import { loadSastraLisanRecords } from '../../utils/sastraLisanStorage';
import { CartoBasemapStyle } from '../reports/CartoRegionalMap';

interface PetaSastraLisanViewProps {
  surveys?: SurveyRecord[];
  onNavigateToForm?: () => void;
  onNavigateToKorpus?: () => void;
  onNavigateToView?: (viewKey: string) => void;
}

export const PetaSastraLisanView: React.FC<PetaSastraLisanViewProps> = ({
  surveys = [],
  onNavigateToForm,
  onNavigateToKorpus,
  onNavigateToView
}) => {
  const [records, setRecords] = useState<SastraLisanRecord[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [hasAudioOnly, setHasAudioOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [basemapStyle, setBasemapStyle] = useState<CartoBasemapStyle>('voyager');
  const [selectedRecord, setSelectedRecord] = useState<SastraLisanRecord | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());

  // Load records
  useEffect(() => {
    const list = loadSastraLisanRecords();
    setRecords(list);
    if (list.length > 0 && !selectedRecord) {
      setSelectedRecord(list[0]);
    }
  }, []);

  // Helper coordinate resolution
  const getRecordCoordinates = (record: SastraLisanRecord): [number, number] => {
    if (record.lokasi?.titikKoordinat) {
      const parts = record.lokasi.titikKoordinat.split(',').map(p => parseFloat(p.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return [parts[0], parts[1]];
      }
    }
    // Match against surveys
    const desa = record.lokasi?.desaKelurahan?.toLowerCase();
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
    // Regional centroids
    const kab = record.lokasi?.kabupatenKota?.toLowerCase() || '';
    if (kab.includes('kuningan') || kab.includes('jawa barat')) return [-6.9745, 108.4872];
    if (kab.includes('garut')) return [-7.421, 107.821];
    if (kab.includes('cianjur')) return [-6.823, 107.142];
    if (kab.includes('cirebon')) return [-6.715, 108.555];
    if (kab.includes('maluku tengah') || kab.includes('hitu')) return [-3.585, 128.185];
    if (kab.includes('tanimbar')) return [-7.978, 131.298];
    return [-6.2088, 106.8456];
  };

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // Genre filter
      const genre = r.analisisJenis?.jenisUtama || '';
      const matchGenre = selectedGenre === 'all' || genre.toLowerCase().includes(selectedGenre.toLowerCase());

      // Audio filter
      const matchAudio = !hasAudioOnly || Boolean(r.hasilDokumentasi?.tautanHasilDokumentasi || r.hasilDokumentasi?.bentukDokumentasi?.toLowerCase().includes('audio'));

      // Search query
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        r.namaSastraLisan.toLowerCase().includes(q) ||
        r.narasumber?.namaLengkap?.toLowerCase().includes(q) ||
        r.lokasi?.desaKelurahan?.toLowerCase().includes(q) ||
        r.lokasi?.kabupatenKota?.toLowerCase().includes(q) ||
        (r.deskripsiSingkat && r.deskripsiSingkat.toLowerCase().includes(q));

      return matchGenre && matchAudio && matchSearch;
    });
  }, [records, selectedGenre, hasAudioOnly, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = records.length;
    const genres = new Set(records.map(r => r.analisisJenis?.jenisUtama).filter(Boolean)).size;
    const informants = new Set(records.map(r => r.narasumber?.namaLengkap).filter(Boolean)).size;
    const withAudio = records.filter(r => r.hasilDokumentasi?.tautanHasilDokumentasi || r.hasilDokumentasi?.bentukDokumentasi?.toLowerCase().includes('audio')).length;
    return { total, genres, informants, withAudio };
  }, [records]);

  // Available Genres
  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      if (r.analisisJenis?.jenisUtama) set.add(r.analisisJenis.jenisUtama);
    });
    return Array.from(set);
  }, [records]);

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
        prefix: '<span class="text-[10px] text-slate-500 font-mono">CARTO Basemaps • Korpus Sastra Lisan Badan Bahasa</span>'
      }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;

    // Basemap tile layer
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

    return () => {
      // Do not destroy instance on basemap change, handled by tileLayer replacement
    };
  }, [basemapStyle]);

  // Populate Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerGroupRef.current) return;

    const markersGroup = markersLayerGroupRef.current;
    markersGroup.clearLayers();
    markersMapRef.current.clear();

    const bounds = L.latLngBounds([]);

    filteredRecords.forEach((record, idx) => {
      const [baseLat, baseLng] = getRecordCoordinates(record);
      // Small jitter so co-located stories in the same village don't overlap completely
      const jitterLat = baseLat + (idx % 3 - 1) * 0.003;
      const jitterLng = baseLng + ((idx * 2) % 3 - 1) * 0.003;

      const isSelected = selectedRecord?.id === record.id;
      const hasAudio = Boolean(record.hasilDokumentasi?.tautanHasilDokumentasi || record.hasilDokumentasi?.bentukDokumentasi?.toLowerCase().includes('audio'));

      const markerHtml = `
        <div class="relative group cursor-pointer">
          <div class="w-9 h-9 rounded-xl ${isSelected ? 'bg-purple-700 ring-4 ring-purple-300' : 'bg-purple-600 ring-2 ring-purple-400/40'} text-white flex items-center justify-center shadow-lg border-2 border-white transform transition-transform group-hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
              <path d="M6 6h10"/>
              <path d="M6 10h10"/>
            </svg>
            ${hasAudio ? `
              <span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                <span class="w-1.5 h-1.5 bg-white rounded-full"></span>
              </span>
            ` : ''}
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 ${isSelected ? 'bg-purple-700' : 'bg-purple-600'} rotate-45 border-r border-b border-white"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-sastra-marker',
        html: markerHtml,
        iconSize: [36, 42],
        iconAnchor: [18, 42]
      });

      const marker = L.marker([jitterLat, jitterLng], { icon: customIcon });

      const popupHtml = `
        <div class="p-3 text-slate-800 font-sans min-w-[240px] max-w-[280px]">
          <div class="text-[10px] font-bold text-purple-700 uppercase tracking-wider mb-1">
            Peta Sastra Lisan
          </div>
          <h4 class="font-bold text-xs text-slate-900 leading-snug mb-1">
            ${record.namaSastraLisan}
          </h4>
          <div class="text-[11px] text-slate-600 space-y-1 mb-2">
            <div><strong>Genre:</strong> ${record.analisisJenis?.jenisUtama || 'Tradisi Lisan'}</div>
            <div><strong>Narasumber:</strong> ${record.narasumber?.namaLengkap || '-'} (${record.narasumber?.usia || '-'} th)</div>
            <div><strong>Lokasi:</strong> Desa ${record.lokasi?.desaKelurahan || '-'}, ${record.lokasi?.kabupatenKota || '-'}</div>
          </div>
          <div class="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-purple-600 font-semibold">
            <span>Klik kartu untuk telaah motif</span>
            <span>CARTO GIS</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        setSelectedRecord(record);
      });

      markersGroup.addLayer(marker);
      markersMapRef.current.set(record.id, marker);
      bounds.extend([jitterLat, jitterLng]);
    });

    if (filteredRecords.length > 0 && mapInstanceRef.current && bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [filteredRecords, selectedRecord]);

  const handleSelectRecord = (record: SastraLisanRecord) => {
    setSelectedRecord(record);
    const marker = markersMapRef.current.get(record.id);
    if (marker && mapInstanceRef.current) {
      const latlng = marker.getLatLng();
      mapInstanceRef.current.flyTo(latlng, 12, { duration: 0.8 });
      marker.openPopup();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-xl border border-purple-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30 text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Instrumen Pemetaan Sastra Lisan & Tradisi Tutur</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Peta Geospasial Sastra Lisan
            </h1>
            <p className="text-sm text-purple-200/90 leading-relaxed">
              Distribusi spasial cerita rakyat, mite, legenda, tembang tradisi, dan motif tutur lisan nusantara menggunakan sistem basemap CARTO.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onNavigateToForm && (
              <button
                type="button"
                onClick={onNavigateToForm}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Isi Kuesioner Sastra Lisan</span>
              </button>
            )}
            {onNavigateToKorpus && (
              <button
                type="button"
                onClick={onNavigateToKorpus}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Buka Korpus Sastra</span>
              </button>
            )}
            {onNavigateToView && (
              <button
                type="button"
                onClick={() => onNavigateToView('peta-carto')}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer"
                title="Buka Peta Terpadu Tri-Instrumen"
              >
                <Globe className="w-4 h-4 text-purple-300" />
                <span>Peta CARTO Terpadu</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quantitative Rigor Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Cerita Terpetakan</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
            {stats.total}
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-0.5">
            Titik tutur terverifikasi
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Ragam Genre Tradisi</div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 font-mono tabular-nums">
            {stats.genres}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Mite, Legenda, Tembang dll.
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Narasumber / Maestro</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 font-mono tabular-nums">
            {stats.informants}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Juru cerita terdata aktif
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Dokumentasi Audio</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono tabular-nums">
            {stats.withAudio}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
            Rekaman suara digital
          </div>
        </div>
      </div>

      {/* Interactive Controls & Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul sastra, narasumber, desa, atau teks..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => setHasAudioOnly(!hasAudioOnly)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                hasAudioOnly 
                  ? 'bg-purple-100 dark:bg-purple-950/70 border-purple-400 text-purple-800 dark:text-purple-200' 
                  : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Hanya yang Ada Audio</span>
            </button>

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

        {/* Genre Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedGenre('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedGenre === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Semua Genre ({records.length})
          </button>
          {availableGenres.map(g => (
            <button
              key={g}
              type="button"
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedGenre === g
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map & Detail Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Viewport */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col relative">
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Peta Spasial CARTO ({filteredRecords.length} Titik Tutur)
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              Style: CARTO {basemapStyle}
            </span>
          </div>

          <div className="relative w-full h-[540px] sm:h-[600px]">
            <div ref={mapContainerRef} className="w-full h-full z-10" />

            {/* Quick floating overlay */}
            <div className="absolute top-3 left-3 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md max-w-xs text-xs">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-600" />
                <span>Titik Sebaran Sastra Lisan</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Klik ikon penanda untuk menelaah naskah, narasumber, dan kode motif Thompson.
              </p>
            </div>
          </div>
        </div>

        {/* Selected Record Deep-Dive Inspector */}
        <div className="lg:col-span-4 space-y-4">
          {selectedRecord ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 sticky top-6">
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    {selectedRecord.analisisJenis?.jenisUtama || 'Sastra Lisan'}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug mt-0.5">
                    {selectedRecord.namaSastraLisan}
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  {selectedRecord.bentukTuturan || 'Tutur Lisan'}
                </span>
              </div>

              {/* Informant Bio */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Narasumber / Juru Cerita
                </div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {selectedRecord.narasumber?.namaLengkap || 'Nama Belum Dicatat'}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  Usia: <span className="font-mono">{selectedRecord.narasumber?.usia || '-'}</span> tahun · {selectedRecord.narasumber?.jenisKelamin || '-'}
                </div>
                {selectedRecord.narasumber?.komunitas?.namaKomunitas && (
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    Komunitas: {selectedRecord.narasumber.komunitas.namaKomunitas}
                  </div>
                )}
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-purple-500" />
                  <span>
                    Desa {selectedRecord.lokasi?.desaKelurahan || '-'}, {selectedRecord.lokasi?.kabupatenKota || '-'}
                  </span>
                </div>
              </div>

              {/* Synopsis & Quote */}
              <div className="space-y-2 text-xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Sinopsis / Ringkasan Cerita
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[13px]">
                  {selectedRecord.deskripsiSingkat || 'Belum ada deskripsi singkat.'}
                </p>
                {selectedRecord.kutipanTuturan && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl text-purple-900 dark:text-purple-200 text-xs italic border border-purple-200/60 dark:border-purple-800/60">
                    "{selectedRecord.kutipanTuturan}"
                  </div>
                )}
              </div>

              {/* Thompson Motif Analysis */}
              {selectedRecord.analisisMotif && (
                <div className="space-y-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Analisis Motif Stith Thompson</span>
                    <span className="font-mono text-purple-600 font-bold">
                      {selectedRecord.analisisMotif.daftarMotifThompson?.[0]?.kodeThompson || 'A900'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs">
                    <span className="font-semibold block text-slate-900 dark:text-white">
                      {selectedRecord.analisisMotif.motifUtama || selectedRecord.analisisMotif.daftarMotifThompson?.[0]?.namaMotif || 'Kearifan Ekologis & Asal-Usul'}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {selectedRecord.analisisMotif.daftarMotifThompson?.[0]?.uraianTeks || selectedRecord.analisisMotif.amanatMoral || 'Refleksi kosmologi masyarakat setempat mengenai asal-usul alam lingkungan.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Contextual & Performance notes */}
              {(selectedRecord.iringanMusik || selectedRecord.syaratPertunjukan) && (
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {selectedRecord.iringanMusik && (
                    <div><strong>Iringan Musik:</strong> {selectedRecord.iringanMusik}</div>
                  )}
                  {selectedRecord.syaratPertunjukan && (
                    <div><strong>Syarat Tuturan:</strong> {selectedRecord.syaratPertunjukan}</div>
                  )}
                </div>
              )}

              {/* Audio player simulation or link */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{isPlayingAudio ? 'Menjeda Audio Tuturan' : 'Putar Sampel Rekaman Suara'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold">Pilih satu titik cerita di peta</p>
              <p className="text-xs text-slate-500 mt-1">
                Data narasumber, kutipan tuturan, dan klasifikasi motif akan ditampilkan di sini.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Filtered Stories List Table with FlyTo Action */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Daftar Sastra Lisan Terpetakan ({filteredRecords.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Klik pada baris tabel untuk menavigasi fokus peta secara langsung ke koordinat cerita.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Judul Cerita / Sastra Lisan</th>
                <th className="py-2.5 px-3">Genre</th>
                <th className="py-2.5 px-3">Narasumber</th>
                <th className="py-2.5 px-3">Lokasi (Desa/Kab)</th>
                <th className="py-2.5 px-3">Motif Thompson</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredRecords.map(item => {
                const isSelected = selectedRecord?.id === item.id;
                return (
                  <tr
                    key={item.id}
                    onClick={() => handleSelectRecord(item)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-purple-50/80 dark:bg-purple-950/40 text-purple-950 dark:text-purple-100 font-medium'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white max-w-[220px] truncate">
                      {item.namaSastraLisan}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                        {item.analisisJenis?.jenisUtama || 'Tradisi Lisan'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {item.narasumber?.namaLengkap || '-'} ({item.narasumber?.usia || '-'} th)
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      Desa {item.lokasi?.desaKelurahan || '-'}, {item.lokasi?.kabupatenKota || '-'}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-purple-600 dark:text-purple-400">
                      {item.analisisMotif?.daftarMotifThompson?.[0]?.kodeThompson || 'A900'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectRecord(item);
                        }}
                        className="p-1 text-purple-600 hover:text-purple-800 dark:text-purple-400 cursor-pointer"
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
