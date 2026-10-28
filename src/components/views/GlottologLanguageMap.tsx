import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Layers, 
  Search, 
  Filter, 
  Compass, 
  Info, 
  Globe2, 
  Maximize2, 
  RotateCcw, 
  Check, 
  Tag, 
  BookOpen, 
  Sparkles,
  Plus,
  Scale,
  Upload,
  FileJson,
  FileSpreadsheet,
  ArrowRight,
  Eye,
  CheckCircle2,
  Users,
  Activity,
  Sliders,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  GLOTTOLOG_LANGUAGES, 
  LANGUAGE_TERRITORIES, 
  GlottologLanguage, 
  FAMILY_COLORS 
} from '../../data/glottologData';
import { SurveyRecord } from '../../types/linguistic';

export type ThematicLayerMode = 'persebaran' | 'kepadatan' | 'batas-wilayah' | 'survei-lapangan';

interface GlottologLanguageMapProps {
  surveys?: SurveyRecord[];
  activeSurveyId?: string | null;
  onSelectSurvey?: (id: string) => void;
  onCreateNew?: (type: 'empty' | 'sample') => void;
  onSwitchToComparison?: () => void;
  onImportJSON?: () => void;
  onDownloadAllJSON?: () => void;
  onDownloadCSV?: () => void;
  onSwitchToEditor?: () => void;
}

export const GlottologLanguageMap: React.FC<GlottologLanguageMapProps> = ({
  surveys = [],
  activeSurveyId,
  onSelectSurvey,
  onCreateNew,
  onSwitchToComparison,
  onImportJSON,
  onDownloadAllJSON,
  onDownloadCSV,
  onSwitchToEditor
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const polygonsLayerRef = useRef<L.LayerGroup | null>(null);
  const surveysLayerRef = useRef<L.LayerGroup | null>(null);
  const densityLayerRef = useRef<L.LayerGroup | null>(null);

  // Thematic Layer State
  const [activeThematicLayer, setActiveThematicLayer] = useState<ThematicLayerMode>('persebaran');
  const layerContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the active layer button into view on mobile/small screens
  useEffect(() => {
    const container = layerContainerRef.current;
    if (!container) return;
    const activeButton = container.querySelector(`[data-layer="${activeThematicLayer}"]`) as HTMLElement;
    if (activeButton) {
      activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeThematicLayer]);

  const scrollLayer = (direction: 'left' | 'right') => {
    if (layerContainerRef.current) {
      const offset = direction === 'left' ? -160 : 160;
      layerContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMacroarea, setSelectedMacroarea] = useState<string>('all');
  const [selectedFamily, setSelectedFamily] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<GlottologLanguage | null>(null);
  const [selectedTerritory, setSelectedTerritory] = useState<typeof LANGUAGE_TERRITORIES[0] | null>(null);
  const [activePresetRegion, setActivePresetRegion] = useState<string>('indonesia');
  const [isLegendExpanded, setIsLegendExpanded] = useState<boolean>(true);

  // Filter languages based on search, macroarea, and family
  const filteredLanguages = useMemo(() => {
    return GLOTTOLOG_LANGUAGES.filter(lang => {
      const matchSearch = 
        !searchQuery.trim() ||
        lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.glottocode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.isocodes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lang.regionDescription && lang.regionDescription.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchMacro = 
        selectedMacroarea === 'all' || 
        lang.macroarea.toLowerCase() === selectedMacroarea.toLowerCase();

      const matchFamily = 
        selectedFamily === 'all' || 
        (lang.family && lang.family.toLowerCase().includes(selectedFamily.toLowerCase()));

      return matchSearch && matchMacro && matchFamily;
    });
  }, [searchQuery, selectedMacroarea, selectedFamily]);

  // Filter territories
  const filteredTerritories = useMemo(() => {
    if (!searchQuery.trim()) return LANGUAGE_TERRITORIES;
    const q = searchQuery.toLowerCase();
    return LANGUAGE_TERRITORIES.filter(t => 
      t.name.toLowerCase().includes(q) ||
      t.glottocode.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center on Indonesia archipelago
      const map = L.map(mapContainerRef.current, {
        center: [-2.5, 118.0],
        zoom: 5,
        minZoom: 2,
        maxZoom: 18,
        scrollWheelZoom: true,
        attributionControl: false
      });

  // CARTO basemap through the server-side authenticated proxy
  L.tileLayer('/api/carto/tiles/voyager/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>, &copy; OpenStreetMap contributors'
      }).addTo(map);

      // Attribution
      L.control.attribution({
        position: 'bottomright',
        prefix: 'Data: <a href="https://glottolog.org" target="_blank" rel="noreferrer" class="text-blue-600 font-bold hover:underline">Glottolog 5.0</a> &copy; OpenStreetMap'
      }).addTo(map);

      polygonsLayerRef.current = L.layerGroup().addTo(map);
      densityLayerRef.current = L.layerGroup().addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);
      surveysLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.stop();
          mapInstanceRef.current.remove();
        } catch (e) {
          // ignore
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Map Layers based on activeThematicLayer & Filters
  useEffect(() => {
    const map = mapInstanceRef.current;
    const polyLayer = polygonsLayerRef.current;
    const markersLayer = markersLayerRef.current;
    const densityLayer = densityLayerRef.current;
    const surveysLayer = surveysLayerRef.current;

    if (!map || !polyLayer || !markersLayer || !densityLayer || !surveysLayer) return;

    // Clear all layers
    polyLayer.clearLayers();
    markersLayer.clearLayers();
    densityLayer.clearLayers();
    surveysLayer.clearLayers();

    // 1. TERRITORY BOUNDARIES POLYGONS (Rendered in 'batas-wilayah' and partially in 'persebaran')
    if (activeThematicLayer === 'batas-wilayah' || activeThematicLayer === 'persebaran') {
      const isFocused = activeThematicLayer === 'batas-wilayah';
      filteredTerritories.forEach(territory => {
        const polygon = L.polygon(territory.polygon, {
          color: territory.color,
          weight: isFocused ? 3 : 2,
          opacity: isFocused ? 0.95 : 0.65,
          fillColor: territory.color,
          fillOpacity: isFocused ? 0.32 : 0.15,
          dashArray: isFocused ? undefined : '5, 5'
        });

        polygon.on('mouseover', function(e) {
          e.target.setStyle({ weight: 4, fillOpacity: 0.5 });
        });

        polygon.on('mouseout', function(e) {
          e.target.setStyle({ 
            weight: isFocused ? 3 : 2, 
            fillOpacity: isFocused ? 0.32 : 0.15 
          });
        });

        polygon.on('click', () => {
          setSelectedTerritory(territory);
          const matched = GLOTTOLOG_LANGUAGES.find(l => l.glottocode === territory.glottocode);
          if (matched) setSelectedLanguage(matched);
        });

        polygon.bindTooltip(
          `<div class="p-1.5 font-sans text-xs">
            <div class="font-bold text-slate-900">${territory.name}</div>
            <div class="text-[10px] text-slate-500 font-mono">Glottocode: ${territory.glottocode}</div>
            <div class="text-[10px] text-blue-600 font-semibold mt-0.5">Batas Wilayah Penggunaan Bahasa</div>
          </div>`,
          { sticky: true }
        );

        polyLayer.addLayer(polygon);
      });
    }

    // 2. SPEAKER DENSITY LAYER ('kepadatan')
    if (activeThematicLayer === 'kepadatan') {
      filteredLanguages.forEach(lang => {
        if (!lang.latitude || !lang.longitude) return;

        // Parse speakers estimated
        let countNum = 50000;
        if (lang.speakersEstimated) {
          countNum = parseInt(lang.speakersEstimated.replace(/\D/g, '')) || 50000;
        }

        // Color & radius gradient by speaker magnitude
        let radiusMeters = 35000;
        let ringColor = '#3b82f6';
        let densityLabel = '< 100 Ribu';

        if (countNum >= 10000000) {
          radiusMeters = 160000;
          ringColor = '#ef4444'; // Red for massive population (>10M)
          densityLabel = 'Sangat Tinggi (>10 Juta)';
        } else if (countNum >= 1000000) {
          radiusMeters = 95000;
          ringColor = '#f97316'; // Orange (1M-10M)
          densityLabel = 'Tinggi (1 - 10 Juta)';
        } else if (countNum >= 200000) {
          radiusMeters = 60000;
          ringColor = '#eab308'; // Amber (200K-1M)
          densityLabel = 'Menengah (200 Ribu - 1 Juta)';
        } else {
          radiusMeters = 35000;
          ringColor = '#10b981'; // Green (<200K)
          densityLabel = 'Lokal / Minoritas (< 200 Ribu)';
        }

        // Concentric gradient rings
        const densityCircleOuter = L.circle([lang.latitude, lang.longitude], {
          radius: radiusMeters,
          color: ringColor,
          weight: 1,
          opacity: 0.6,
          fillColor: ringColor,
          fillOpacity: 0.18
        });

        const densityCircleInner = L.circle([lang.latitude, lang.longitude], {
          radius: radiusMeters * 0.45,
          color: ringColor,
          weight: 2,
          opacity: 0.85,
          fillColor: ringColor,
          fillOpacity: 0.4
        });

        const clickHandler = () => {
          setSelectedLanguage(lang);
          const terr = LANGUAGE_TERRITORIES.find(t => t.glottocode === lang.glottocode);
          setSelectedTerritory(terr || null);
        };

        densityCircleOuter.on('click', clickHandler);
        densityCircleInner.on('click', clickHandler);

        densityCircleOuter.bindTooltip(
          `<div class="p-1 font-sans text-xs">
            <div class="font-bold text-slate-900">${lang.name}</div>
            <div class="text-[10px] text-emerald-600 font-bold">Estimasi Penutur: ~${lang.speakersEstimated || 'N/A'}</div>
            <div class="text-[10px] text-slate-500 font-mono">Tingkat Kepadatan: ${densityLabel}</div>
          </div>`,
          { sticky: true }
        );

        densityLayer.addLayer(densityCircleOuter);
        densityLayer.addLayer(densityCircleInner);
      });
    }

    // 3. LANGUAGE MARKERS ('persebaran', 'kepadatan', 'batas-wilayah')
    if (activeThematicLayer !== 'survei-lapangan') {
      filteredLanguages.forEach(lang => {
        if (!lang.latitude || !lang.longitude) return;

        const familyColor = (lang.family && FAMILY_COLORS[lang.family]) || '#2563eb';
        const isLanguage = lang.level === 'language';

        const customIcon = L.divIcon({
          className: 'custom-glottolog-pin',
          html: `
            <div style="
              background-color: ${familyColor};
              width: ${isLanguage ? '14px' : '10px'};
              height: ${isLanguage ? '14px' : '10px'};
              border-radius: 9999px;
              border: 2px solid #ffffff;
              box-shadow: 0 2px 6px rgba(0,0,0,0.35);
              cursor: pointer;
            "></div>
          `,
          iconSize: [isLanguage ? 14 : 10, isLanguage ? 14 : 10],
          iconAnchor: [isLanguage ? 7 : 5, isLanguage ? 7 : 5]
        });

        const marker = L.marker([lang.latitude, lang.longitude], { icon: customIcon });

        marker.on('click', () => {
          setSelectedLanguage(lang);
          const terr = LANGUAGE_TERRITORIES.find(t => t.glottocode === lang.glottocode);
          setSelectedTerritory(terr || null);
        });

        marker.bindTooltip(
          `<div class="p-1 font-sans text-xs">
            <div class="font-bold text-slate-900">${lang.name}</div>
            <div class="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-0.5">
              <span>[${lang.glottocode}]</span>
              ${lang.isocodes ? `<span class="bg-blue-50 text-blue-700 px-1 rounded">${lang.isocodes}</span>` : ''}
            </div>
            <div class="text-[10px] text-slate-600 mt-0.5">${lang.family || 'Rumpun Bahasa'}</div>
          </div>`,
          { direction: 'top', offset: [0, -6] }
        );

        markersLayer.addLayer(marker);
      });
    }

    // 4. ACTIVE FIELD SURVEY POINTS OVERLAY ('survei-lapangan' or all)
    if (activeThematicLayer === 'survei-lapangan') {
      surveys.forEach(survey => {
        const sg = survey.data?.situasiGeografis;
        const tp = survey.data?.titikPengamatan;
        if (!sg && !tp) return;

        const latRaw = sg?.koordinatLintang ?? '';
        const lngRaw = sg?.koordinatBujur ?? '';
        const lat = parseFloat(String(latRaw).replace(',', '.')) || (survey.id === 'survey_default' ? -7.5085 : null);
        const lng = parseFloat(String(lngRaw).replace(',', '.')) || (survey.id === 'survey_default' ? 107.576 : null);

        if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) return;

        const isCurrent = survey.id === activeSurveyId;

        const surveyIcon = L.divIcon({
          className: 'custom-survey-pin',
          html: `
            <div style="
              background-color: ${isCurrent ? '#10b981' : '#6366f1'};
              width: 22px;
              height: 22px;
              border-radius: 9999px;
              border: 3px solid #ffffff;
              box-shadow: 0 0 14px ${isCurrent ? 'rgba(16, 185, 129, 0.7)' : 'rgba(99, 102, 241, 0.6)'};
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 10px;
              font-weight: bold;
              cursor: pointer;
            ">
              ★
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        const sMarker = L.marker([lat, lng], { icon: surveyIcon });

        sMarker.on('click', () => {
          if (onSelectSurvey) onSelectSurvey(survey.id);
        });

        sMarker.bindTooltip(
          `<div class="p-1.5 font-sans text-xs">
            <div class="font-bold text-slate-900">${survey.title}</div>
            <div class="text-[10px] text-blue-600 font-semibold">${survey.desa}, ${survey.bahasa}</div>
            <div class="text-[10px] text-slate-500">Progres Kuesioner: ${survey.progress}%</div>
            <div class="text-[9px] text-emerald-600 font-bold mt-1">Titik Pengamatan Survei Lapangan Derana</div>
          </div>`,
          { direction: 'top', offset: [0, -10] }
        );

        surveysLayer.addLayer(sMarker);
      });
    }

  }, [filteredLanguages, filteredTerritories, activeThematicLayer, surveys, activeSurveyId]);

  // Handle region preset jump
  const handleJumpRegion = (regionKey: string) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    setActivePresetRegion(regionKey);

    switch (regionKey) {
      case 'indonesia':
        map.flyTo([-2.5, 118.0], 5, { duration: 1.2 });
        break;
      case 'jawa-sunda':
        map.flyTo([-7.2, 108.5], 7, { duration: 1 });
        break;
      case 'sumatera':
        map.flyTo([0.5, 101.5], 6, { duration: 1 });
        break;
      case 'sulawesi':
        map.flyTo([-3.0, 120.5], 6.5, { duration: 1 });
        break;
      case 'papua':
        map.flyTo([-4.0, 137.5], 6, { duration: 1 });
        break;
      case 'global':
        map.flyTo([15.0, 45.0], 3, { duration: 1.5 });
        break;
    }
  };

  const handleZoomToTerritory = (territory: typeof LANGUAGE_TERRITORIES[0]) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    setSelectedTerritory(territory);
    const matched = GLOTTOLOG_LANGUAGES.find(l => l.glottocode === territory.glottocode);
    if (matched) setSelectedLanguage(matched);
    map.flyTo(territory.center, 8, { duration: 1 });
  };

  const currentActiveSurvey = surveys.find(s => s.id === activeSurveyId);

  return (
    <div className="space-y-4">
      {/* TOP COMPACT TOOLBAR (SURVEY ACTIONS & CONTROLS) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400">
              <Globe2 className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Visualisasi Peta Bahasa Glottolog & Batas Wilayah Tutur
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60">
              Glottolog 5.0
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Peta komprehensif inventarisasi bahasa dunia berbasis titik koordinat Glottolog, dilengkapi <strong>panel kendali lapisan tematik</strong> dan <strong>batas poligon wilayah penggunaan tutur</strong>.
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onCreateNew && (
            <button
              type="button"
              onClick={() => onCreateNew('empty')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
              title="Buat instrumen survei dialektometri baru"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Formulir</span>
            </button>
          )}

          {onCreateNew && (
            <button
              type="button"
              onClick={() => onCreateNew('sample')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
              title="Muat contoh survei lapangan Desa Karangwangi"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Contoh Survei</span>
            </button>
          )}

          {onSwitchToComparison && (
            <button
              type="button"
              onClick={onSwitchToComparison}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-300 dark:border-teal-800 shadow-2xs transition-colors cursor-pointer"
              title="Buka modul perbandingan bahasa dan analisis dialektometri"
            >
              <Scale className="w-3.5 h-3.5 text-teal-600" />
              <span>Komparasi</span>
            </button>
          )}

          {onImportJSON && (
            <button
              type="button"
              onClick={onImportJSON}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Impor file cadangan JSON"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Impor JSON</span>
            </button>
          )}

          {onDownloadAllJSON && (
            <button
              type="button"
              onClick={onDownloadAllJSON}
              disabled={surveys.length === 0}
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
              title="Cadangkan seluruh survei ke JSON"
            >
              <FileJson className="w-3.5 h-3.5 text-slate-500" />
            </button>
          )}

          {onDownloadCSV && (
            <button
              type="button"
              onClick={onDownloadCSV}
              disabled={surveys.length === 0}
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 disabled:opacity-40 transition-colors cursor-pointer"
              title="Unduh ringkasan CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            </button>
          )}
        </div>
      </div>

      {/* MAP VIEWER CARD */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm overflow-hidden flex flex-col transition-colors">
        
        {/* PANEL KENDALI LAPISAN TEMATIK DATA & PENCARIAN */}
        <div className="p-3 sm:px-5 sm:py-3.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-950 flex flex-col gap-3">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
            {/* Thematic Layer Switcher Buttons - Fully scrollable and touch-drag friendly on mobile */}
            <div className="relative w-full lg:w-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollLayer('left')}
                aria-label="Geser lapisan ke kiri"
                className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 shrink-0 transition-colors cursor-pointer"
                title="Geser lapisan ke kiri"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div 
                ref={layerContainerRef}
                className="w-full lg:w-auto overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs shadow-2xs overscroll-x-contain touch-pan-x"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                <span className="shrink-0 text-[11px] font-bold text-slate-400 dark:text-slate-400 px-2 uppercase tracking-wider flex items-center gap-1 select-none whitespace-nowrap">
                  <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                  Lapisan:
                </span>

                <button
                  type="button"
                  data-layer="persebaran"
                  onClick={() => setActiveThematicLayer('persebaran')}
                  className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeThematicLayer === 'persebaran'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Globe2 className="w-3.5 h-3.5" />
                  <span>Persebaran Dialek</span>
                </button>

                <button
                  type="button"
                  data-layer="kepadatan"
                  onClick={() => setActiveThematicLayer('kepadatan')}
                  className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeThematicLayer === 'kepadatan'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Kepadatan Penutur</span>
                </button>

                <button
                  type="button"
                  data-layer="batas-wilayah"
                  onClick={() => setActiveThematicLayer('batas-wilayah')}
                  className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeThematicLayer === 'batas-wilayah'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Batas Wilayah Poligon</span>
                </button>

                <button
                  type="button"
                  data-layer="survei-lapangan"
                  onClick={() => setActiveThematicLayer('survei-lapangan')}
                  className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeThematicLayer === 'survei-lapangan'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Titik Survei ({surveys.length})</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => scrollLayer('right')}
                aria-label="Geser lapisan ke kanan"
                className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 shrink-0 transition-colors cursor-pointer"
                title="Geser lapisan ke kanan"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Region Presets - Also scrollable on mobile */}
            <div 
              className="w-full lg:w-auto overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1 text-xs py-0.5 overscroll-x-contain touch-pan-x"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {[
                { id: 'indonesia', label: '🇮🇩 Nusantara' },
                { id: 'jawa-sunda', label: 'Jawa & Sunda' },
                { id: 'sumatera', label: 'Sumatera' },
                { id: 'sulawesi', label: 'Sulawesi & NT' },
                { id: 'papua', label: 'Papua & Maluku' },
                { id: 'global', label: '🌍 Global' }
              ].map(reg => (
                <button
                  key={reg.id}
                  type="button"
                  onClick={() => handleJumpRegion(reg.id)}
                  className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    activePresetRegion === reg.id
                      ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 dark:border-slate-400 shadow-2xs border border-transparent'
                      : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {reg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search & Family Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari bahasa, glottocode, ISO (contoh: Sundanese, java1254, ace)..."
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-400 rounded-xl focus:border-blue-600 focus:outline-hidden transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <select
                value={selectedFamily}
                onChange={e => setSelectedFamily(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-medium cursor-pointer"
              >
                <option value="all">Semua Rumpun Bahasa</option>
                <option value="Austronesian">Austronesian (Nusantara)</option>
                <option value="Papuan">Papuan / Trans-New Guinea</option>
                <option value="Austroasiatic">Austroasiatic</option>
                <option value="Sino-Tibetan">Sino-Tibetan</option>
                <option value="Indo-European">Indo-European</option>
                <option value="Niger-Congo">Niger-Congo</option>
              </select>

              <span className="text-[11px] text-slate-500 dark:text-slate-300 font-medium hidden sm:inline">
                Menampilkan <strong>{filteredLanguages.length}</strong> bahasa & <strong>{filteredTerritories.length}</strong> wilayah
              </span>
            </div>
          </div>
        </div>

        {/* Map Canvas and Info Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 relative min-h-[520px] sm:min-h-[580px]">
          
          {/* Leaflet Canvas (3 cols on desktop) */}
          <div className="lg:col-span-3 relative h-[450px] sm:h-[580px] w-full">
            <div ref={mapContainerRef} className="absolute inset-0 z-10 w-full h-full" />
            
            {/* LEGENDA INTERAKTIF DINAMIS (Disesuaikan otomatis dengan lapisan terpilih) */}
            <div className="absolute bottom-3 left-3 z-20 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-lg text-xs transition-all max-w-[280px]">
              
              {/* Legend Header */}
              <div 
                onClick={() => setIsLegendExpanded(!isLegendExpanded)}
                className="p-2.5 flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 cursor-pointer select-none"
              >
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    Legenda: {
                      activeThematicLayer === 'persebaran' ? 'Rumpun & Dialek' :
                      activeThematicLayer === 'kepadatan' ? 'Kepadatan Penutur' :
                      activeThematicLayer === 'batas-wilayah' ? 'Batas Spasial Bahasa' : 'Titik Survei Lapangan'
                    }
                  </span>
                </div>
                {isLegendExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
              </div>

              {/* Dynamic Legend Body */}
              {isLegendExpanded && (
                <div className="p-2.5 space-y-2 text-[11px] max-h-56 overflow-y-auto">
                  {/* Mode 1: Persebaran Dialek */}
                  {activeThematicLayer === 'persebaran' && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] text-slate-400 font-medium">Klik rumpun untuk memfilter:</div>
                      {Object.entries(FAMILY_COLORS).map(([family, color]) => {
                        const count = GLOTTOLOG_LANGUAGES.filter(l => l.family === family).length;
                        return (
                          <div 
                            key={family}
                            onClick={() => setSelectedFamily(selectedFamily === family ? 'all' : family)}
                            className={`flex items-center justify-between gap-1.5 p-1 rounded-md cursor-pointer transition-colors ${
                              selectedFamily === family ? 'bg-blue-50 dark:bg-blue-950 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }}></span>
                              <span className="truncate text-slate-700 dark:text-slate-200">{family}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Mode 2: Kepadatan Penutur */}
                  {activeThematicLayer === 'kepadatan' && (
                    <div className="space-y-2">
                      <div className="text-[10px] text-slate-400 font-medium">Gradasi Konsentrasi Penutur:</div>
                      {[
                        { label: 'Sangat Tinggi (>10 Juta)', color: '#ef4444', desc: 'Jawa, Sunda, Madura' },
                        { label: 'Tinggi (1 - 10 Juta)', color: '#f97316', desc: 'Minangkabau, Bugis, Banjar, Bali' },
                        { label: 'Menengah (200 Ribu - 1 Juta)', color: '#eab308', desc: 'Batak, Sasak, Manggarai, Toraja' },
                        { label: 'Lokal / Minoritas (< 200 Ribu)', color: '#10b981', desc: 'Bahasa pedalaman & pulau kecil' },
                      ].map(tier => (
                        <div key={tier.label} className="flex items-start gap-2">
                          <span className="w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 border border-white shadow-2xs" style={{ backgroundColor: tier.color }}></span>
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-200">{tier.label}</div>
                            <div className="text-[10px] text-slate-500 leading-tight">{tier.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Mode 3: Batas Wilayah Poligon */}
                  {activeThematicLayer === 'batas-wilayah' && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] text-slate-400 font-medium">Klik wilayah untuk zoom:</div>
                      {LANGUAGE_TERRITORIES.map(t => (
                        <div 
                          key={t.id}
                          onClick={() => handleZoomToTerritory(t)}
                          className="flex items-center justify-between gap-1.5 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-3 h-3 rounded-xs shrink-0" style={{ backgroundColor: t.color }}></span>
                            <span className="truncate text-slate-700 dark:text-slate-200">{t.name.split(' (')[0]}</span>
                          </div>
                          <span className="text-[9px] text-blue-600 font-bold">Zoom →</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Mode 4: Titik Survei Lapangan */}
                  {activeThematicLayer === 'survei-lapangan' && (
                    <div className="space-y-2">
                      <div className="text-[10px] text-slate-400 font-medium">Titik Survei Aktif di Aplikasi:</div>
                      {surveys.map(s => (
                        <div 
                          key={s.id}
                          onClick={() => onSelectSurvey && onSelectSurvey(s.id)}
                          className={`p-1.5 rounded-lg border cursor-pointer text-xs transition-colors ${
                            s.id === activeSurveyId
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <div className="font-bold text-slate-900 dark:text-white truncate">{s.title}</div>
                          <div className="text-[10px] text-slate-500">{s.desa} • {s.bahasa} ({s.progress}%)</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Selected Language / Territory Inspector Panel (1 col on desktop) */}
          <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-700 p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-950 flex flex-col justify-between overflow-y-auto max-h-[580px]">
            {selectedLanguage || selectedTerritory ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2 border-b border-slate-200/80 dark:border-slate-700 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Detail Bahasa Terpilih
                    </span>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-200 leading-tight mt-0.5">
                      {selectedLanguage ? selectedLanguage.name : selectedTerritory?.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLanguage(null);
                      setSelectedTerritory(null);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

                {/* Glottolog Metadata Card */}
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-2xs space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">Glottocode:</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                      {selectedLanguage?.glottocode || selectedTerritory?.glottocode}
                    </span>
                  </div>

                  {selectedLanguage?.isocodes && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">ISO 639-3:</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {selectedLanguage.isocodes}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">Rumpun / Famili:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                      {selectedLanguage?.family || selectedTerritory?.family || 'Austronesian'}
                    </span>
                  </div>

                  {selectedLanguage && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">Koordinat Pusat:</span>
                      <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        {selectedLanguage.latitude.toFixed(4)}, {selectedLanguage.longitude.toFixed(4)}
                      </span>
                    </div>
                  )}

                  {selectedLanguage?.speakersEstimated && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">Estimasi Penutur:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        ~{selectedLanguage.speakersEstimated}
                      </span>
                    </div>
                  )}
                </div>

                {/* Region / Usage Description */}
                {(selectedTerritory?.description || selectedLanguage?.regionDescription) && (
                  <div className="bg-blue-50/60 dark:bg-blue-950/30 p-3 rounded-2xl border border-blue-100 dark:border-blue-900/40 text-xs">
                    <span className="font-bold text-blue-950 dark:text-blue-200 block mb-1">
                      Cakupan & Batas Wilayah Penggunaan:
                    </span>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                      {selectedTerritory?.description || selectedLanguage?.regionDescription}
                    </p>
                  </div>
                )}

                {/* Connection to Field Survey Questionnaire */}
                {currentActiveSurvey && (
                  <div className="p-3 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-blue-600" />
                      Survei Kuesioner Aktif Saat Ini:
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      <strong>{currentActiveSurvey.title}</strong> ({currentActiveSurvey.desa}, {currentActiveSurvey.bahasa})
                    </p>
                    {onSwitchToEditor && (
                      <button
                        type="button"
                        onClick={onSwitchToEditor}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <span>Buka Kuesioner Dialektometri</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center my-auto space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-2xs">
                  <Compass className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Pilih Bahasa atau Poligon
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Klik salah satu poligon batas wilayah penggunaan bahasa atau titik koordinat Glottolog pada peta untuk memeriksa metadata glotolinguistik.
                  </p>
                </div>
                <div className="pt-2 text-left bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Fitur Peta Glottolog:</div>
                  <div>• {GLOTTOLOG_LANGUAGES.length} Titik Bahasa & Dialek Terkurasi</div>
                  <div>• {LANGUAGE_TERRITORIES.length} Poligon Batas Wilayah Penggunaan</div>
                  <div>• Sinkronisasi otomatis dengan instrumen survei lapangan</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active Survey Quick Jump Bottom Strip */}
        {currentActiveSurvey && onSwitchToEditor && (
          <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                Survei Aktif
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {currentActiveSurvey.title}
              </span>
              <span className="text-slate-400 hidden md:inline">•</span>
              <span className="text-slate-500 text-[11px] hidden md:inline">
                {currentActiveSurvey.desa}, Kec. {currentActiveSurvey.kecamatan || '—'}, Kab. {currentActiveSurvey.kabupatenKota || '—'}
              </span>
            </div>

            <button
              type="button"
              onClick={onSwitchToEditor}
              className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer text-xs self-start sm:self-auto"
            >
              <span>Lanjutkan Pengisian di Kuesioner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
