import { SurveyRecord } from '../types/linguistic';
import { calculateDistanceKm, hitungDialektometri } from './calculations';

export interface KecamatanPoint {
  id: string;
  surveyId: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  bahasa: string;
  lat: number;
  lng: number;
  progress: number;
  isVerified: boolean;
  swadeshCount: number;
  informantCount: number;
  informantAges: number[];
  averageInformantAge: number | null;
  surveyor: string;
  swadeshWords: Record<string, string>; // glosId / glosIndonesia -> bentukLokal
}

export interface KecamatanProfile {
  id: string;
  namaKecamatan: string;
  kabupaten: string;
  provinsi: string;
  points: KecamatanPoint[];
  centroid: [number, number];
  dominantBahasa: string;
  bahasaBreakdown: { bahasa: string; count: number; percentage: number }[];
  totalSurveys: number;
  completedSurveys: number;
  avgProgress: number;
  avgInformantAge: number | null;
  colorTheme: { hex: string; bg: string; text: string; border: string };
  boundaryPolygon: [number, number][]; // Leaflet LatLng tuples for hull / buffer
  swadeshCorpus: Record<string, { bentuk: string; frequency: number }>;
}

export interface DifferingDiagnosticGloss {
  glosIndonesia: string;
  kataA: string;
  kataB: string;
  kategori: string;
  keterangan: string;
}

export interface KecamatanComparisonPair {
  id: string;
  kecamatanA: KecamatanProfile;
  kecamatanB: KecamatanProfile;
  distanceKm: number;
  differencePercentage: number;
  differingGlossesCount: number;
  totalGlossesCompared: number;
  classification: 'Tidak Berbeda' | 'Perbedaan Wicara' | 'Perbedaan Subdialek' | 'Perbedaan Dialek' | 'Perbedaan Bahasa' | 'Beda Wicara/Homogen' | 'Beda Subbahasa';
  color: string;
  isTransitionZone: boolean;
  transitionIntensity: 'homogen' | 'subdialek' | 'dialek' | 'lintas-bahasa';
  isoglossStrength: 'lemah' | 'sedang' | 'kuat' | 'kritis';
  differingWordsSample: DifferingDiagnosticGloss[];
  sociolinguisticNote: string;
  recommendedFieldActions: string;
  midpoint: [number, number];
  corridorPolygon: [number, number][];
}

// Color palette mapping based on dominant language
const LANGUAGE_COLOR_PALETTE: Record<string, { hex: string; bg: string; text: string; border: string }> = {
  'sunda': { hex: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-500' },
  'bahasa sunda': { hex: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-500' },
  'sunda priangan': { hex: '#059669', bg: 'bg-emerald-600', text: 'text-emerald-800 dark:text-emerald-200', border: 'border-emerald-600' },
  'sunda banten': { hex: '#0d9488', bg: 'bg-teal-600', text: 'text-teal-800 dark:text-teal-200', border: 'border-teal-600' },
  'sunda pesisir': { hex: '#14b8a6', bg: 'bg-teal-500', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-500' },
  'jawa': { hex: '#8b5cf6', bg: 'bg-violet-500', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-500' },
  'bahasa jawa': { hex: '#8b5cf6', bg: 'bg-violet-500', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-500' },
  'jawa banyumasan': { hex: '#7c3aed', bg: 'bg-violet-600', text: 'text-violet-800 dark:text-violet-200', border: 'border-violet-600' },
  'cirebon': { hex: '#06b6d4', bg: 'bg-cyan-500', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-500' },
  'jawa cirebon': { hex: '#0891b2', bg: 'bg-cyan-600', text: 'text-cyan-800 dark:text-cyan-200', border: 'border-cyan-600' },
  'melayu betawi': { hex: '#f97316', bg: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-500' },
  'betawi': { hex: '#f97316', bg: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-500' }
};

const DEFAULT_THEME = { hex: '#3b82f6', bg: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-500' };

export function getKecamatanColorTheme(bahasa: string) {
  const key = (bahasa || '').toLowerCase().trim();
  for (const [k, v] of Object.entries(LANGUAGE_COLOR_PALETTE)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return DEFAULT_THEME;
}

// Top diagnostic comparative glosses for West Java - Banten transition zones
const REGIONAL_DIAGNOSTIC_GLOSSES: { glos: string; kategori: string; sundaPriangan: string; sundaPesisir: string; jawaBanyumasan: string; cirebonan: string }[] = [
  { glos: 'air', kategori: 'Alam', sundaPriangan: 'cai', sundaPesisir: 'cai / banyu', jawaBanyumasan: 'banyu', cirebonan: 'banyu / way' },
  { glos: 'makan', kategori: 'Tindakan', sundaPriangan: 'dahar / neda', sundaPesisir: 'dahar', jawaBanyumasan: 'mangan', cirebonan: 'mangan' },
  { glos: 'tidur', kategori: 'Tindakan', sundaPriangan: 'sare / kulem', sundaPesisir: 'mondok / hees', jawaBanyumasan: 'turu', cirebonan: 'turu' },
  { glos: 'matahari', kategori: 'Alam', sundaPriangan: 'panonpoe', sundaPesisir: 'panonpoe', jawaBanyumasan: 'srengenge', cirebonan: 'srengenge' },
  { glos: 'mata', kategori: 'Tubuh', sundaPriangan: 'panon / soca', sundaPesisir: 'mata', jawaBanyumasan: 'mripat / mata', cirebonan: 'mata / soca' },
  { glos: 'kepala', kategori: 'Tubuh', sundaPriangan: 'sirah / mastaka', sundaPesisir: 'sirah', jawaBanyumasan: 'sirah / ndas', cirebonan: 'sirah / endhas' },
  { glos: 'anjing', kategori: 'Fauna', sundaPriangan: 'anjing / gogog', sundaPesisir: 'anjing', jawaBanyumasan: 'asu', cirebonan: 'asu' },
  { glos: 'rumah', kategori: 'Benda', sundaPriangan: 'imah / rorompok', sundaPesisir: 'imah', jawaBanyumasan: 'umah', cirebonan: 'umah' },
  { glos: 'besar', kategori: 'Sifat', sundaPriangan: 'gedé', sundaPesisir: 'gedé', jawaBanyumasan: 'gedhe', cirebonan: 'gedhe' },
  { glos: 'kecil', kategori: 'Sifat', sundaPriangan: 'leutik', sundaPesisir: 'leutik', jawaBanyumasan: 'cilik', cirebonan: 'cilik' },
  { glos: 'batu', kategori: 'Alam', sundaPriangan: 'batu', sundaPesisir: 'batu', jawaBanyumasan: 'watu', cirebonan: 'watu' },
  { glos: 'api', kategori: 'Alam', sundaPriangan: 'seuneu', sundaPesisir: 'seuneu', jawaBanyumasan: 'geni', cirebonan: 'geni' },
  { glos: 'saya', kategori: 'Pronomina', sundaPriangan: 'kuring / abdi', sundaPesisir: 'aing / kula', jawaBanyumasan: 'nyong / inyong', cirebonan: 'isun / kita' },
  { glos: 'kamu', kategori: 'Pronomina', sundaPriangan: 'maneh / anjeun', sundaPesisir: 'dia / sia', jawaBanyumasan: 'rika / kowe', cirebonan: 'ira / sira' },
  { glos: 'tidak', kategori: 'Partikel', sundaPriangan: 'henteu / sanes', sundaPesisir: 'hanteu / ore', jawaBanyumasan: 'ora', cirebonan: 'ora / beli' },
  { glos: 'pergi', kategori: 'Tindakan', sundaPriangan: 'indit / angkat', sundaPesisir: 'miang', jawaBanyumasan: 'lunga', cirebonan: 'mangkat / lunga' }
];

/**
 * Compute convex hull for an array of 2D coordinates
 */
function compute2DConvexHull(points: [number, number][]): [number, number][] {
  if (points.length <= 2) return points;
  const sorted = [...points].sort((a, b) => (a[1] === b[1] ? a[0] - b[0] : a[1] - b[1]));
  const cross = (o: [number, number], a: [number, number], b: [number, number]) =>
    (a[1] - o[1]) * (b[0] - o[0]) - (a[0] - o[0]) * (b[1] - o[1]);

  const lower: [number, number][] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }
  const upper: [number, number][] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

/**
 * Generate smooth buffer polygon around a single centroid or cluster of points
 */
function createRadialBuffer(lat: number, lng: number, radiusKm: number = 7, steps: number = 16): [number, number][] {
  const result: [number, number][] = [];
  const latDelta = radiusKm / 110.574;
  const lngDelta = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));

  for (let i = 0; i < steps; i++) {
    const angle = (i * 2 * Math.PI) / steps;
    // Add subtle irregularity to mimic natural administrative / territorial contour
    const noise = 0.9 + 0.2 * Math.sin(angle * 3);
    const rLat = lat + Math.sin(angle) * latDelta * noise;
    const rLng = lng + Math.cos(angle) * lngDelta * noise;
    result.push([rLat, rLng]);
  }
  return result;
}

/**
 * Build Kecamatan Profiles from surveys
 */
export function buildKecamatanProfiles(
  surveys: SurveyRecord[],
  knownGeoPresets?: Record<string, [number, number]>
): KecamatanProfile[] {
  const kecamatanMap = new Map<string, KecamatanPoint[]>();

  surveys.forEach((s, idx) => {
    const sg = s.data?.situasiGeografis;
    const tp = s.data?.titikPengamatan;

    // Resolve lat & lng
    let lat: number | null = null;
    let lng: number | null = null;

    if (typeof sg?.koordinatLintang === 'number') lat = sg.koordinatLintang;
    else if (typeof tp?.koordinatLintang === 'number') lat = tp.koordinatLintang;
    else if (typeof sg?.koordinatLintang === 'string' && sg.koordinatLintang.trim()) {
      lat = parseFloat(sg.koordinatLintang.replace(',', '.'));
    }

    if (typeof sg?.koordinatBujur === 'number') lng = sg.koordinatBujur;
    else if (typeof tp?.koordinatBujur === 'number') lng = tp.koordinatBujur;
    else if (typeof sg?.koordinatBujur === 'string' && sg.koordinatBujur.trim()) {
      lng = parseFloat(sg.koordinatBujur.replace(',', '.'));
    }

    const desaName = s.desa || tp?.namaDesa || 'Pengamatan';
    let kecName = s.kecamatan || tp?.kecamatan || '';

    // If kecamatan empty, deduce or normalize
    if (!kecName || kecName === '-' || kecName.trim() === '') {
      const desaLower = desaName.toLowerCase();
      if (desaLower.includes('cikaso')) kecName = 'Cibitung';
      else if (desaLower.includes('rancabuaya')) kecName = 'Caringin';
      else if (desaLower.includes('babakan') || desaLower.includes('pangandaran')) kecName = 'Pangandaran';
      else if (desaLower.includes('karangwangi')) kecName = 'Cidaun';
      else kecName = `Kec. ${desaName}`;
    }

    // Coordinates fallback
    if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
      const dKey = desaName.toLowerCase().trim();
      const kKey = kecName.toLowerCase().trim();
      if (knownGeoPresets && knownGeoPresets[dKey]) {
        [lat, lng] = knownGeoPresets[dKey];
      } else if (knownGeoPresets && knownGeoPresets[kKey]) {
        [lat, lng] = knownGeoPresets[kKey];
      } else {
        // Fallback spread in West Java
        lat = -7.25 + idx * 0.08;
        lng = 107.30 + idx * 0.09;
      }
    }

    // Swadesh words dictionary
    const swadeshDict: Record<string, string> = {};
    const swadeshList = s.data?.kosakataLengkap?.swadeshList || [];
    swadeshList.forEach(w => {
      if (w.bentukLokal && w.bentukLokal.trim()) {
        const key = w.glosIndonesia.toLowerCase().trim();
        swadeshDict[key] = w.bentukLokal.trim();
        if (w.id) swadeshDict[w.id] = w.bentukLokal.trim();
      }
    });

    // Informants
    const narasumberList = s.data?.narasumberList || [];
    const ages: number[] = [];
    narasumberList.forEach(n => {
      const ageNum = typeof n.usia === 'number' ? n.usia : parseInt(String(n.usia || ''), 10);
      if (!isNaN(ageNum) && ageNum > 0 && ageNum < 120) ages.push(ageNum);
    });
    const avgAge = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : null;

    const pt: KecamatanPoint = {
      id: `${s.id}_pt`,
      surveyId: s.id,
      desa: desaName,
      kecamatan: kecName,
      kabupaten: s.kabupatenKota || tp?.kabupatenKota || 'Jawa Barat',
      provinsi: s.provinsi || tp?.provinsi || 'Jawa Barat',
      bahasa: s.bahasa || tp?.bahasaDigunakan || 'Bahasa Sunda',
      lat,
      lng,
      progress: s.progress || 0,
      isVerified: Boolean(s.isVerified),
      swadeshCount: Object.keys(swadeshDict).length,
      informantCount: narasumberList.length,
      informantAges: ages,
      averageInformantAge: avgAge,
      surveyor: s.createdByName || 'Surveyor Lapangan',
      swadeshWords: swadeshDict
    };

    const groupKey = `${kecName.toLowerCase()}__${(s.kabupatenKota || 'jabar').toLowerCase()}`;
    const existing = kecamatanMap.get(groupKey) || [];
    existing.push(pt);
    kecamatanMap.set(groupKey, existing);
  });

  const profiles: KecamatanProfile[] = [];

  kecamatanMap.forEach((pts) => {
    if (pts.length === 0) return;
    const first = pts[0];
    const namaKecamatan = first.kecamatan;
    const kabupaten = first.kabupaten;
    const provinsi = first.provinsi;

    // Centroid
    const sumLat = pts.reduce((sum, p) => sum + p.lat, 0);
    const sumLng = pts.reduce((sum, p) => sum + p.lng, 0);
    const centroid: [number, number] = [sumLat / pts.length, sumLng / pts.length];

    // Language counts & dominant
    const langCounts: Record<string, number> = {};
    pts.forEach(p => {
      const l = p.bahasa && p.bahasa !== '-' ? p.bahasa : 'Bahasa Sunda';
      langCounts[l] = (langCounts[l] || 0) + 1;
    });

    const breakdown = Object.entries(langCounts)
      .map(([bahasa, count]) => ({
        bahasa,
        count,
        percentage: Math.round((count / pts.length) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    const dominantBahasa = breakdown[0]?.bahasa || 'Bahasa Sunda';
    const colorTheme = getKecamatanColorTheme(dominantBahasa);

    // Aggregate Swadesh corpus
    const swadeshCorpus: Record<string, { bentuk: string; frequency: number }> = {};
    pts.forEach(p => {
      Object.entries(p.swadeshWords).forEach(([glos, word]) => {
        if (!swadeshCorpus[glos]) {
          swadeshCorpus[glos] = { bentuk: word, frequency: 1 };
        } else {
          swadeshCorpus[glos].frequency += 1;
        }
      });
    });

    // Boundary polygon
    let boundaryPolygon: [number, number][];
    if (pts.length >= 3) {
      const rawPoints: [number, number][] = pts.map(p => [p.lat, p.lng]);
      const hull = compute2DConvexHull(rawPoints);
      // Expand hull slightly with a 4km buffer
      boundaryPolygon = hull.map(([lat, lng]) => {
        const dLat = lat - centroid[0];
        const dLng = lng - centroid[1];
        return [lat + dLat * 0.25, lng + dLng * 0.25] as [number, number];
      });
    } else {
      boundaryPolygon = createRadialBuffer(centroid[0], centroid[1], 8 + pts.length * 2);
    }

    const allAges = pts.flatMap(p => p.informantAges);
    const avgAge = allAges.length > 0 ? Math.round(allAges.reduce((a, b) => a + b, 0) / allAges.length) : null;
    const completedSurveys = pts.filter(p => p.progress >= 100).length;
    const avgProgress = Math.round(pts.reduce((sum, p) => sum + p.progress, 0) / pts.length);

    profiles.push({
      id: `kec_${namaKecamatan.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      namaKecamatan,
      kabupaten,
      provinsi,
      points: pts,
      centroid,
      dominantBahasa,
      bahasaBreakdown: breakdown,
      totalSurveys: pts.length,
      completedSurveys,
      avgProgress,
      avgInformantAge: avgAge,
      colorTheme,
      boundaryPolygon,
      swadeshCorpus
    });
  });

  return profiles;
}

/**
 * Compare two kecamatan profiles and compute Guiter dialectometric distance & transition characteristics
 */
export function compareTwoKecamatan(
  kecA: KecamatanProfile,
  kecB: KecamatanProfile
): KecamatanComparisonPair {
  const distKm = Math.round(
    calculateDistanceKm(kecA.centroid[0], kecA.centroid[1], kecB.centroid[0], kecB.centroid[1]) * 10
  ) / 10;

  // Compare actual Swadesh words
  const differingWords: DifferingDiagnosticGloss[] = [];
  const corpusA = kecA.swadeshCorpus;
  const corpusB = kecB.swadeshCorpus;

  let s = 0;
  let n = 0;

  // 1. Direct word comparison on shared gloss keys
  const allGlosses = new Set([...Object.keys(corpusA), ...Object.keys(corpusB)]);
  allGlosses.forEach(g => {
    const itemA = corpusA[g]?.bentuk;
    const itemB = corpusB[g]?.bentuk;
    if (itemA && itemB) {
      n++;
      const normA = itemA.toLowerCase().trim();
      const normB = itemB.toLowerCase().trim();
      if (normA !== normB) {
        s++;
        if (differingWords.length < 12) {
          differingWords.push({
            glosIndonesia: g,
            kataA: itemA,
            kataB: itemB,
            kategori: 'Swadesh 200',
            keterangan: 'Variasi leksikal observasi lapangan'
          });
        }
      }
    }
  });

  // If shared field survey glosses are minimal (e.g. initial survey stage), augment with diagnostic corpus
  if (n < 20) {
    const langA = kecA.dominantBahasa.toLowerCase();
    const langB = kecB.dominantBahasa.toLowerCase();
    const isDifferentLang = langA !== langB && !langA.includes(langB) && !langB.includes(langA);

    REGIONAL_DIAGNOSTIC_GLOSSES.forEach(diag => {
      let wordA = corpusA[diag.glos]?.bentuk;
      let wordB = corpusB[diag.glos]?.bentuk;

      if (!wordA) {
        if (langA.includes('jawa') || langA.includes('banyumas')) wordA = diag.jawaBanyumasan;
        else if (langA.includes('cirebon')) wordA = diag.cirebonan;
        else if (kecA.namaKecamatan.toLowerCase().includes('caringin') || kecA.namaKecamatan.toLowerCase().includes('rancabuaya')) wordA = diag.sundaPesisir;
        else wordA = diag.sundaPriangan;
      }

      if (!wordB) {
        if (langB.includes('jawa') || langB.includes('banyumas')) wordB = diag.jawaBanyumasan;
        else if (langB.includes('cirebon')) wordB = diag.cirebonan;
        else if (kecB.namaKecamatan.toLowerCase().includes('caringin') || kecB.namaKecamatan.toLowerCase().includes('rancabuaya')) wordB = diag.sundaPesisir;
        else wordB = diag.sundaPriangan;
      }

      n++;
      if (wordA.toLowerCase().trim() !== wordB.toLowerCase().trim()) {
        s++;
        if (!differingWords.some(w => w.glosIndonesia.toLowerCase() === diag.glos.toLowerCase())) {
          differingWords.push({
            glosIndonesia: diag.glos,
            kataA: wordA,
            kataB: wordB,
            kategori: diag.kategori,
            keterangan: isDifferentLang ? 'Isoglos kontak bahasa' : 'Variasi dialektal regional'
          });
        }
      }
    });
  }

  const effectiveN = n > 0 ? n : 200;
  const calc = hitungDialektometri(s, effectiveN);
  const diffPct = calc.persentase;

  // Determine transition characteristics using standard 5-tier Guiter lexical dialectometry scale:
  // • 81% – 100% = Kategori perbedaan bahasa (berbeda bahasa)
  // • 51% – 80% = Kategori perbedaan dialek (berbeda dialek)
  // • 31% – 50% = Kategori perbedaan subdialek
  // • 21% – 30% = Kategori perbedaan wicara (speech difference)
  // • Kurang dari 21% (≤ 20%): Kategori tidak berbeda (masih dalam satu variasi atau wicara yang sama)
  let classification: 'Tidak Berbeda' | 'Perbedaan Wicara' | 'Perbedaan Subdialek' | 'Perbedaan Dialek' | 'Perbedaan Bahasa';
  let color = '#10b981'; // emerald
  let transitionIntensity: 'homogen' | 'subdialek' | 'dialek' | 'lintas-bahasa' = 'homogen';
  let isoglossStrength: 'lemah' | 'sedang' | 'kuat' | 'kritis' = 'lemah';
  let sociolinguisticNote = '';
  let recommendedFieldActions = '';

  if (diffPct <= 20) {
    classification = 'Tidak Berbeda';
    color = '#10b981'; // emerald
    transitionIntensity = 'homogen';
    isoglossStrength = 'lemah';
    sociolinguisticNote = `Tingkat pemahaman mutual tinggi (${100 - diffPct}% kesamaan). Variasi hanya berada pada tataran intonasi wicara dan fonem individual lokal (masih dalam satu variasi atau wicara yang sama).`;
    recommendedFieldActions = 'Relasi dialek homogen tanpa perbedaan signifikan. Surveyor dapat mendokumentasikan folklor lokal untuk merekam ragam tutur santai.';
  } else if (diffPct <= 30) {
    classification = 'Perbedaan Wicara';
    color = '#0284c7'; // sky
    transitionIntensity = 'subdialek';
    isoglossStrength = 'sedang';
    sociolinguisticNote = `Perbedaan wicara terdeteksi (${diffPct}% variasi). Terdapat sejumlah kata dasar yang memiliki alomorf atau padanan leksikal spesifik (speech difference).`;
    recommendedFieldActions = 'Zona variasi wicara aktif. Disarankan menambahkan titik survei di perbatasan desa untuk memetakan batas sebaran kata kunci.';
  } else if (diffPct <= 50) {
    classification = 'Perbedaan Subdialek';
    color = '#f59e0b'; // amber
    transitionIntensity = 'subdialek';
    isoglossStrength = 'sedang';
    sociolinguisticNote = `Zona Transisi Subdialek Signifikan (${diffPct}% beda leksikal). Penutur di kedua kecamatan memiliki perbedaan subdialek yang nyata dalam dialek serumpun.`;
    recommendedFieldActions = 'Zona transisi subdialek! Surveyor perlu merekam narasumber generasi tua (>50 thn) untuk mengidentifikasi leksikon arkais asli.';
  } else if (diffPct <= 80) {
    classification = 'Perbedaan Dialek';
    color = '#ea580c'; // orange
    transitionIntensity = 'dialek';
    isoglossStrength = 'kuat';
    sociolinguisticNote = `Perbedaan dialek yang kentara (${diffPct}% beda). Wilayah ini merupakan pertemuan dua dialek berbeda yang diakui secara geolinguistik (berbeda dialek).`;
    recommendedFieldActions = 'Prioritas Pemetaan Tinggi! Ambil sampel titik observasi di pasar tradisional perbatasan untuk merekam fenomena kontak dialek.';
  } else {
    classification = 'Perbedaan Bahasa';
    color = '#ef4444'; // rose/red
    transitionIntensity = 'lintas-bahasa';
    isoglossStrength = 'kritis';
    sociolinguisticNote = `Perbedaan bahasa penuh (${diffPct}% beda). Batas pembatas geografis atau linguistik yang kokoh (berbeda bahasa).`;
    recommendedFieldActions = 'Batas bahasa definitif. Jalankan kuesioner vitalitas bahasa (UNESCO) untuk melihat resistensi leksikon lokal terhadap bahasa dominan.';
  }

  // Calculate midpoint between the two centroids
  const midpoint: [number, number] = [
    (kecA.centroid[0] + kecB.centroid[0]) / 2,
    (kecA.centroid[1] + kecB.centroid[1]) / 2
  ];

  // Create transition corridor polygon band between the two kecamatan
  const latDelta = kecB.centroid[0] - kecA.centroid[0];
  const lngDelta = kecB.centroid[1] - kecA.centroid[1];
  const len = Math.sqrt(latDelta * latDelta + lngDelta * lngDelta) || 0.0001;
  const perpLat = (-lngDelta / len) * 0.035;
  const perpLng = (latDelta / len) * 0.035;

  const corridorPolygon: [number, number][] = [
    [kecA.centroid[0] + perpLat, kecA.centroid[1] + perpLng],
    [kecB.centroid[0] + perpLat, kecB.centroid[1] + perpLng],
    [kecB.centroid[0] - perpLat, kecB.centroid[1] - perpLng],
    [kecA.centroid[0] - perpLat, kecA.centroid[1] - perpLng]
  ];

  const isTransition = diffPct > 20 || kecA.dominantBahasa !== kecB.dominantBahasa;

  return {
    id: `${kecA.id}__vs__${kecB.id}`,
    kecamatanA: kecA,
    kecamatanB: kecB,
    distanceKm: distKm,
    differencePercentage: diffPct,
    differingGlossesCount: s,
    totalGlossesCompared: effectiveN,
    classification,
    color,
    isTransitionZone: isTransition,
    transitionIntensity,
    isoglossStrength,
    differingWordsSample: differingWords,
    sociolinguisticNote,
    recommendedFieldActions,
    midpoint,
    corridorPolygon
  };
}

/**
 * Compute all inter-kecamatan pairwise comparisons
 */
export function computeInterKecamatanComparisons(
  profiles: KecamatanProfile[],
  maxDistanceKm: number = 180
): KecamatanComparisonPair[] {
  const pairs: KecamatanComparisonPair[] = [];

  for (let i = 0; i < profiles.length; i++) {
    for (let j = i + 1; j < profiles.length; j++) {
      const kecA = profiles[i];
      const kecB = profiles[j];
      const dist = calculateDistanceKm(kecA.centroid[0], kecA.centroid[1], kecB.centroid[0], kecB.centroid[1]);
      
      // Compare if within geographic observation range
      if (dist <= maxDistanceKm) {
        pairs.push(compareTwoKecamatan(kecA, kecB));
      }
    }
  }

  // Sort by transition intensity and difference percentage (descending)
  return pairs.sort((a, b) => b.differencePercentage - a.differencePercentage);
}
