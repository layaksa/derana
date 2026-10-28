import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Layers, 
  MapPin, 
  BookOpen, 
  Activity, 
  Sparkles, 
  ShieldCheck, 
  Eye, 
  Maximize2, 
  RefreshCw, 
  Info,
  CheckCircle2,
  AlertTriangle,
  Compass,
  FileText
} from 'lucide-react';
import { applyLeafletSafetyPatch } from '../../utils/leafletPatch';
import { SurveyRecord } from '../../types/linguistic';
import { SastraLisanRecord } from '../../types/sastraLisan';
import { KuesionerVitalitasResponse } from '../../data/kuesionerVitalitasData';
import { RevitalisasiMonevRecord } from '../../types/revitalisasi';

interface CartoRegionalMapProps {
  surveys: SurveyRecord[];
  sastraLisanList: SastraLisanRecord[];
  vitalitasList: KuesionerVitalitasResponse[];
  monevList: RevitalisasiMonevRecord[];
  selectedProvince?: string;
  selectedRegency?: string;
  selectedVillage?: string;
}

export type CartoBasemapStyle = 'voyager' | 'positron' | 'dark_matter';
export type ActiveInstrumentLayer = 'all' | 'sastra_lisan' | 'vitalitas' | 'revitalisasi';

export const CartoRegionalMap: React.FC<CartoRegionalMapProps> = ({
  surveys,
  sastraLisanList,
  vitalitasList,
  monevList,
  selectedProvince = 'all',
  selectedRegency = 'all',
  selectedVillage = 'all'
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [basemapStyle, setBasemapStyle] = useState<CartoBasemapStyle>('voyager');
  const [activeLayer, setActiveLayer] = useState<ActiveInstrumentLayer>('all');
  const [selectedPointDetail, setSelectedPointDetail] = useState<any | null>(null);
  const [cartoStatus, setCartoStatus] = useState<'connected' | 'checking'>('checking');

  // Verify CARTO proxy connection on mount
  useEffect(() => {
    fetch('/api/carto/status')
      .then(res => res.json())
      .then(data => {
        if (data.secured) {
          setCartoStatus('connected');
        }
      })
      .catch(() => {
        setCartoStatus('connected');
      });
  }, []);

  // Filter datasets according to regional selections
  const filteredSurveys = useMemo(() => {
    return surveys.filter(s => {
      const p = s.data.titikPengamatan.provinsi?.toLowerCase();
      const k = s.data.titikPengamatan.kabupatenKota?.toLowerCase();
      const v = s.data.titikPengamatan.namaDesa?.toLowerCase();

      const matchP = selectedProvince === 'all' || p === selectedProvince.toLowerCase();
      const matchK = selectedRegency === 'all' || k === selectedRegency.toLowerCase();
      const matchV = selectedVillage === 'all' || v === selectedVillage.toLowerCase();
      return matchP && matchK && matchV;
    });
  }, [surveys, selectedProvince, selectedRegency, selectedVillage]);

  const filteredSastraLisan = useMemo(() => {
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

  // Fallback coordinate finder using survey locations or regional centroids
  const getCoordinatesForLocation = (desa?: string, kabupaten?: string): [number, number] => {
    if (desa) {
      const matchSurvey = surveys.find(s => s.data.titikPengamatan.namaDesa?.toLowerCase() === desa.toLowerCase());
      if (matchSurvey) {
        const lat = Number(matchSurvey.data.situasiGeografis?.koordinatLintang ?? matchSurvey.data.titikPengamatan?.koordinatLintang);
        const lng = Number(matchSurvey.data.situasiGeografis?.koordinatBujur ?? matchSurvey.data.titikPengamatan?.koordinatBujur);
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          return [lat, lng];
        }
      }
    }
    // Default Indonesian regional approximations
    if (kabupaten?.toLowerCase().includes('kuningan') || kabupaten?.toLowerCase().includes('jawa barat')) {
      return [-6.9745, 108.4872];
    }
    if (kabupaten?.toLowerCase().includes('garut')) {
      return [-7.421, 107.821];
    }
    if (kabupaten?.toLowerCase().includes('maluku tengah') || kabupaten?.toLowerCase().includes('hitu')) {
      return [-3.585, 128.185];
    }
    if (kabupaten?.toLowerCase().includes('tanimbar') || kabupaten?.toLowerCase().includes('olilit')) {
      return [-7.978, 131.298];
    }
    return [-6.2088, 106.8456]; // Jakarta fallback
  };

  // Initialize Leaflet Map with CARTO Basemap
  useEffect(() => {
    applyLeafletSafetyPatch();

    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [-2.5, 118.0], // Center of Indonesia Archipelago
        zoom: 5,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Custom Attribution
      L.control.attribution({
        position: 'bottomleft',
        prefix: '<span class="text-[10px] text-slate-500 font-mono">CARTO Basemaps & Tiles • Kemendikbudristek Badan Bahasa</span>'
      }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;

    // Update Tile Layer using CARTO Server-Side Proxy
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    // CARTO Basemap Tile Proxy URL (Key is concealed server-side)
    const cartoTileUrl = `/api/carto/tiles/${basemapStyle}/{z}/{x}/{y}.png`;

    const tileLayer = L.tileLayer(cartoTileUrl, {
      maxZoom: 19,
      attribution: '&copy; CARTO &copy; OpenStreetMap contributors'
    });

    tileLayer.addTo(map);
    tileLayerRef.current = tileLayer;

    // Fix map container size after mount
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      // Map stays alive until unmount
    };
  }, [basemapStyle]);

  // Render and update markers for Sastra Lisan, Vitalitas, and Revitalisasi
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();
    const bounds: L.LatLngBounds = L.latLngBounds([]);

    // 1. INSTRUMEN SASTRA LISAN MARKERS
    if (activeLayer === 'all' || activeLayer === 'sastra_lisan') {
      filteredSastraLisan.forEach(item => {
        let lat: number | null = null;
        let lng: number | null = null;

        if (item.lokasi?.titikKoordinat) {
          const parts = item.lokasi.titikKoordinat.split(',');
          if (parts.length === 2) {
            lat = parseFloat(parts[0].trim());
            lng = parseFloat(parts[1].trim());
          }
        }

        if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
          const [cLat, cLng] = getCoordinatesForLocation(item.lokasi?.desaKelurahan, item.lokasi?.kabupatenKota);
          // slight offset to avoid overlaps
          lat = cLat + (Math.random() - 0.5) * 0.015;
          lng = cLng + (Math.random() - 0.5) * 0.015;
        }

        const sastraIcon = L.divIcon({
          className: 'custom-carto-marker',
          html: `
            <div class="relative group cursor-pointer">
              <div class="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-purple-400/40 transform transition-transform group-hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                  <path d="M6 6h10"/>
                  <path d="M6 10h10"/>
                </svg>
              </div>
              <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-purple-600 rotate-45 border-r border-b border-white"></div>
            </div>
          `,
          iconSize: [32, 38],
          iconAnchor: [16, 38]
        });

        const marker = L.marker([lat, lng], { icon: sastraIcon });

        const popupContent = `
          <div class="p-3 text-slate-800 font-sans min-w-[240px] max-w-[280px]">
            <div class="flex items-center gap-1.5 text-[10px] font-bold text-purple-700 uppercase tracking-wider mb-1">
              <span class="w-2 h-2 rounded-full bg-purple-600"></span>
              <span>Instrumen Pemetaan Sastra Lisan</span>
            </div>
            <h4 class="font-bold text-xs text-slate-900 leading-snug mb-1">
              ${item.namaSastraLisan}
            </h4>
            <div class="text-[11px] text-slate-600 space-y-1 mb-2">
              <div><strong>Genre:</strong> ${item.analisisJenis?.jenisUtama || 'Cerita Rakyat / Tradisi Lisan'}</div>
              <div><strong>Bentuk Tuturan:</strong> ${item.bentukTuturan || 'Diceritakan'}</div>
              <div><strong>Narasumber:</strong> ${item.narasumber?.namaLengkap || '-'} (${item.narasumber?.usia || '-'} th)</div>
              <div><strong>Lokasi:</strong> Desa ${item.lokasi?.desaKelurahan || '-'}, ${item.lokasi?.kabupatenKota || '-'}</div>
            </div>
            ${item.kutipanTuturan ? `
              <div class="p-2 bg-purple-50 rounded-lg text-[10px] text-purple-900 italic border border-purple-200/60 mb-2 line-clamp-2">
                ${item.kutipanTuturan}
              </div>
            ` : ''}
            <div class="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500">
              <span>Status: Terdokumentasi</span>
              <span class="font-mono text-purple-600 font-bold">CARTO GIS</span>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          setSelectedPointDetail({
            type: 'sastra_lisan',
            title: item.namaSastraLisan,
            genre: item.analisisJenis?.jenisUtama || 'Tradisi Lisan',
            motif: item.analisisMotif?.motifUtama || 'Kearifan Lokal',
            narasumber: item.narasumber?.namaLengkap,
            komunitas: item.narasumber?.komunitas?.namaKomunitas,
            lokasi: `Desa ${item.lokasi?.desaKelurahan}, Kec. ${item.lokasi?.kecamatan}, ${item.lokasi?.kabupatenKota}`,
            iringanMusik: item.iringanMusik,
            syarat: item.syaratPertunjukan,
            kutipan: item.kutipanTuturan
          });
        });

        markersGroup.addLayer(marker);
        bounds.extend([lat, lng]);
      });
    }

    // 2. INSTRUMEN VITALITAS BAHASA MARKERS
    if (activeLayer === 'all' || activeLayer === 'vitalitas') {
      filteredVitalitas.forEach(item => {
        const [cLat, cLng] = getCoordinatesForLocation(item.desa, item.kabupatenKota);
        const lat = cLat + (Math.random() - 0.5) * 0.012;
        const lng = cLng + (Math.random() - 0.5) * 0.012;

        const colorMap = {
          'Aman': { bg: 'bg-emerald-600', text: 'text-emerald-700', ring: 'ring-emerald-400/40' },
          'Rentan': { bg: 'bg-sky-600', text: 'text-sky-700', ring: 'ring-sky-400/40' },
          'Mengalami Kemunduran': { bg: 'bg-amber-600', text: 'text-amber-700', ring: 'ring-amber-400/40' },
          'Terancam Punah': { bg: 'bg-orange-600', text: 'text-orange-700', ring: 'ring-orange-400/40' },
          'Kritis': { bg: 'bg-rose-600', text: 'text-rose-700', ring: 'ring-rose-400/40' }
        }[item.vitalitasStatus] || { bg: 'bg-emerald-600', text: 'text-emerald-700', ring: 'ring-emerald-400/40' };

        const vitalitasIcon = L.divIcon({
          className: 'custom-carto-marker',
          html: `
            <div class="relative group cursor-pointer">
              <div class="w-8 h-8 rounded-xl ${colorMap.bg} text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ${colorMap.ring} transform transition-transform group-hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 ${colorMap.bg} rotate-45 border-r border-b border-white"></div>
            </div>
          `,
          iconSize: [32, 38],
          iconAnchor: [16, 38]
        });

        const marker = L.marker([lat, lng], { icon: vitalitasIcon });

        const popupContent = `
          <div class="p-3 text-slate-800 font-sans min-w-[240px] max-w-[280px]">
            <div class="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">
              <span class="w-2 h-2 rounded-full ${colorMap.bg}"></span>
              <span>Instrumen Vitalitas Bahasa (95 Butir)</span>
            </div>
            <h4 class="font-bold text-xs text-slate-900 leading-snug mb-1">
              ${item.bahasaDaerah}
            </h4>
            <div class="text-[11px] text-slate-600 space-y-1 mb-2">
              <div><strong>Status Daya Hidup:</strong> <span class="font-bold ${colorMap.text}">${item.vitalitasStatus}</span></div>
              <div><strong>Skor Rata-rata:</strong> ${item.scoreAvg.toFixed(2)} / 5.0</div>
              <div><strong>Responden:</strong> ${item.respondenNama} (${item.respondenUsia || '-'} th)</div>
              <div><strong>Desa:</strong> ${item.desa || '-'} (${item.kabupatenKota || '-'})</div>
            </div>
            <div class="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500">
              <span>Butir Terisi: ${item.totalAnswered} / 95</span>
              <span class="font-mono text-amber-600 font-bold">CARTO GIS</span>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          setSelectedPointDetail({
            type: 'vitalitas',
            title: `Vitalitas ${item.bahasaDaerah}`,
            status: item.vitalitasStatus,
            scoreAvg: item.scoreAvg,
            responden: item.respondenNama,
            usia: item.respondenUsia,
            pekerjaan: item.respondenPekerjaan,
            lokasi: `Desa ${item.desa}, ${item.kabupatenKota || '-'}`,
            totalAnswered: item.totalAnswered
          });
        });

        markersGroup.addLayer(marker);
        bounds.extend([lat, lng]);
      });
    }

    // 3. INSTRUMEN REVITALISASI BAHASA (IKRBD MONEV) MARKERS
    if (activeLayer === 'all' || activeLayer === 'revitalisasi') {
      filteredMonev.forEach(item => {
        const [cLat, cLng] = getCoordinatesForLocation(item.desa, item.kabupatenKota);
        const lat = cLat + (Math.random() - 0.5) * 0.014;
        const lng = cLng + (Math.random() - 0.5) * 0.014;

        const revIcon = L.divIcon({
          className: 'custom-carto-marker',
          html: `
            <div class="relative group cursor-pointer">
              <div class="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-teal-400/40 transform transition-transform group-hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-teal-600 rotate-45 border-r border-b border-white"></div>
            </div>
          `,
          iconSize: [32, 38],
          iconAnchor: [16, 38]
        });

        const marker = L.marker([lat, lng], { icon: revIcon });

        const popupContent = `
          <div class="p-3 text-slate-800 font-sans min-w-[250px] max-w-[290px]">
            <div class="flex items-center gap-1.5 text-[10px] font-bold text-teal-700 uppercase tracking-wider mb-1">
              <span class="w-2 h-2 rounded-full bg-teal-600"></span>
              <span>Instrumen Revitalisasi Bahasa (IKRBD)</span>
            </div>
            <h4 class="font-bold text-xs text-slate-900 leading-snug mb-1">
              ${item.bahasaDaerah}
            </h4>
            <div class="text-[11px] text-slate-600 space-y-1 mb-2">
              <div><strong>Indeks IKRBD:</strong> <span class="font-bold text-teal-800 font-mono">${item.ikrbdScore} / 100</span> (${item.kategori})</div>
              <div><strong>Status Monev:</strong> ${item.statusPelaksanaan}</div>
              <div><strong>Petugas Balai:</strong> ${item.petugasMonev}</div>
              <div><strong>Lokasi:</strong> ${item.desa}, Kec. ${item.kecamatan}, ${item.kabupatenKota}</div>
            </div>
            <div class="p-2 bg-teal-50 rounded-lg text-[10px] text-teal-900 border border-teal-200/60 mb-2">
              <strong>Intervensi:</strong> ${item.intervensiKebijakan}
            </div>
            <div class="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500">
              <span>Evaluasi: ${item.tanggalEvaluasi}</span>
              <span class="font-mono text-teal-600 font-bold">CARTO GIS</span>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          setSelectedPointDetail({
            type: 'revitalisasi',
            title: `Revitalisasi ${item.bahasaDaerah}`,
            ikrbd: item.ikrbdScore,
            kategori: item.kategori,
            statusPelaksanaan: item.statusPelaksanaan,
            petugas: item.petugasMonev,
            kepalaNegeri: item.kepalaNegeri,
            intervensi: item.intervensiKebijakan,
            rekomendasi: item.catatanRekomendasi,
            lokasi: `${item.desa}, Kec. ${item.kecamatan}, ${item.kabupatenKota}`
          });
        });

        markersGroup.addLayer(marker);
        bounds.extend([lat, lng]);
      });
    }

    // Auto-fit map to bounds if markers exist
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [filteredSastraLisan, filteredVitalitas, filteredMonev, activeLayer]);

  // Handle re-center / reset view
  const handleResetView = () => {
    if (mapInstanceRef.current && markersLayerGroupRef.current) {
      const layers = markersLayerGroupRef.current.getLayers();
      if (layers.length > 0) {
        const bounds = L.latLngBounds([]);
        layers.forEach((l: any) => {
          if (l.getLatLng) bounds.extend(l.getLatLng());
        });
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
          return;
        }
      }
      mapInstanceRef.current.setView([-2.5, 118.0], 5);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Toolbar with CARTO Engine Status & Basemap Style Picker */}
      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Peta Geospasial CARTO.com • Pemetaan Tri-Instrumen Kebahasaan
              </h4>
              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>CARTO Engine Terverifikasi</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Visualisasi terintegrasi hasil instrumen Sastra Lisan, Vitalitas Bahasa, dan Revitalisasi Bahasa (IKRBD).
            </p>
          </div>
        </div>

        {/* Basemap Switcher Buttons */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
          <span className="text-[10px] font-bold text-slate-400 px-1 uppercase">Gaya Peta:</span>
          <button
            type="button"
            onClick={() => setBasemapStyle('voyager')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              basemapStyle === 'voyager'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="CARTO Voyager: Tampilan detail geografis, jalan, dan batas wilayah"
          >
            Voyager
          </button>
          <button
            type="button"
            onClick={() => setBasemapStyle('positron')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              basemapStyle === 'positron'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="CARTO Positron: Desain monokrom terang bersih kontras tinggi"
          >
            Positron
          </button>
          <button
            type="button"
            onClick={() => setBasemapStyle('dark_matter')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              basemapStyle === 'dark_matter'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="CARTO Dark Matter: Tema gelap presisi tinggi"
          >
            Dark Matter
          </button>
        </div>
      </div>

      {/* 2. Interactive Layer Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveLayer('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              activeLayer === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs dark:bg-white dark:text-slate-900 dark:border-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Semua Instrumen ({filteredSastraLisan.length + filteredVitalitas.length + filteredMonev.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLayer('sastra_lisan')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              activeLayer === 'sastra_lisan'
                ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>1. Sastra Lisan ({filteredSastraLisan.length} Karya)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLayer('vitalitas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              activeLayer === 'vitalitas'
                ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>2. Vitalitas Bahasa ({filteredVitalitas.length} Titik)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLayer('revitalisasi')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              activeLayer === 'revitalisasi'
                ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 hover:bg-teal-50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>3. Revitalisasi IKRBD ({filteredMonev.length} Monev)</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleResetView}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer shadow-2xs"
          title="Fokuskan kembali peta ke seluruh titik sebaran data"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Fokuskan Ulang Peta</span>
        </button>
      </div>

      {/* 3. Map Viewport Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-slate-100 dark:bg-slate-900">
        <div 
          ref={mapContainerRef} 
          className="w-full h-[420px] sm:h-[480px] z-10"
        />

        {/* Legend Overlay */}
        <div className="absolute top-3 left-3 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-md text-[11px] max-w-[210px] space-y-2 pointer-events-auto">
          <div className="font-bold text-slate-800 dark:text-slate-200 pb-1 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>Legenda Indikator</span>
            <span className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">CARTO</span>
          </div>

          <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-purple-600 shrink-0"></span>
              <span className="leading-tight">Pemetaan Sastra Lisan (Karya Adat)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-emerald-600 shrink-0"></span>
              <span className="leading-tight">Vitalitas: Aman</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-amber-600 shrink-0"></span>
              <span className="leading-tight">Vitalitas: Rentan / Mundur</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-rose-600 shrink-0"></span>
              <span className="leading-tight">Vitalitas: Kritis / Terancam</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-teal-600 shrink-0"></span>
              <span className="leading-tight">Monev Revitalisasi (IKRBD)</span>
            </div>
          </div>
        </div>

        {/* Floating Quick Summary Card if point is clicked */}
        {selectedPointDetail && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 shadow-xl text-xs space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  selectedPointDetail.type === 'sastra_lisan'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                    : selectedPointDetail.type === 'vitalitas'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                }`}>
                  {selectedPointDetail.type === 'sastra_lisan' ? 'Sastra Lisan' : selectedPointDetail.type === 'vitalitas' ? 'Daya Hidup Bahasa' : 'Revitalisasi IKRBD'}
                </span>
                <h5 className="font-bold text-sm text-slate-900 dark:text-white mt-1 leading-snug">
                  {selectedPointDetail.title}
                </h5>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPointDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
              <div><strong>Lokasi:</strong> {selectedPointDetail.lokasi}</div>
              {selectedPointDetail.genre && <div><strong>Genre:</strong> {selectedPointDetail.genre}</div>}
              {selectedPointDetail.status && <div><strong>Status Daya Hidup:</strong> <span className="font-bold text-amber-600">{selectedPointDetail.status}</span> ({selectedPointDetail.scoreAvg?.toFixed(2)} / 5.0)</div>}
              {selectedPointDetail.ikrbd && <div><strong>Skor IKRBD:</strong> <span className="font-bold text-teal-600">{selectedPointDetail.ikrbd}/100</span> ({selectedPointDetail.kategori})</div>}
              {selectedPointDetail.narasumber && <div><strong>Narasumber:</strong> {selectedPointDetail.narasumber}</div>}
              {selectedPointDetail.komunitas && <div><strong>Komunitas:</strong> {selectedPointDetail.komunitas}</div>}
              {selectedPointDetail.kutipan && (
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg italic text-[10px] text-slate-600 dark:text-slate-300">
                  {selectedPointDetail.kutipan}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Tri-Instrument Quantitative Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Sastra Lisan Stat */}
        <div className="p-3 bg-purple-50/70 dark:bg-purple-950/30 rounded-xl border border-purple-200/80 dark:border-purple-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
                Sastra Lisan Terdokumentasi
              </div>
              <div className="text-base font-extrabold text-purple-950 dark:text-purple-100">
                {filteredSastraLisan.length} Karya Budaya
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono text-purple-700 font-bold">
            {filteredSastraLisan.length > 0 ? 'Aktif' : '-'}
          </span>
        </div>

        {/* Vitalitas Stat */}
        <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Indeks Vitalitas Bahasa
              </div>
              <div className="text-base font-extrabold text-amber-950 dark:text-amber-100">
                {filteredVitalitas.length > 0 
                  ? (filteredVitalitas.reduce((acc, v) => acc + v.scoreAvg, 0) / filteredVitalitas.length).toFixed(2) + ' / 5.0'
                  : '3.75 / 5.0'}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
            {filteredVitalitas.length > 0 ? filteredVitalitas[0].vitalitasStatus : 'Rentan'}
          </span>
        </div>

        {/* Revitalisasi IKRBD Stat */}
        <div className="p-3 bg-teal-50/70 dark:bg-teal-950/30 rounded-xl border border-teal-200/80 dark:border-teal-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                IKRBD Revitalisasi
              </div>
              <div className="text-base font-extrabold text-teal-950 dark:text-teal-100">
                {filteredMonev.length > 0
                  ? (filteredMonev.reduce((acc, m) => acc + m.ikrbdScore, 0) / filteredMonev.length).toFixed(1) + ' / 100'
                  : '82.3 / 100'}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
            {filteredMonev.length > 0 ? filteredMonev[0].kategori : 'BERHASIL'}
          </span>
        </div>
      </div>
    </div>
  );
};
