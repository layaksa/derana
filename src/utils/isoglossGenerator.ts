import { 
  TitikPengamatan, 
  TitikPembandingDialektometri, 
  KosakataLengkapData, 
  SurveyRecord 
} from '../types/linguistic';
import { calculateDistanceKm, parseNum, hitungDialektometri } from './calculations';
import { compareTwoPoints, DialectComparisonWordRow } from './dialectPointComparison';

export interface DifferingWordItem {
  glos: string;
  bentukA: string;
  ipaA?: string;
  bentukB: string;
  ipaB?: string;
  category: 'BEDA_LEKSIKAL' | 'BEDA_FONEM';
  note?: string;
}

export interface GeneratedIsogloss {
  id: string;
  sourcePointId: string;
  targetPointId: string;
  sourceName: string;
  targetName: string;
  sourceDesa: string;
  targetDesa: string;
  distanceKm: number;
  differencePercentage: number;
  significantWordCount: number;
  totalWordsTested: number;
  statusHubungan: string;
  level: 'bahasa' | 'subbahasa' | 'dialek' | 'wicara';
  color: string;
  neonColor: string;
  weight: number;
  isSignificant: boolean;
  bisectorLine: [number, number][]; // Perpendicular spatial boundary line
  directLinkLine: [number, number][]; // Connecting network vector line
  midpoint: [number, number]; // Middle point between the two locations
  differingWords: DifferingWordItem[];
}

export interface IsoglossCalculationSummary {
  isoglosses: GeneratedIsogloss[];
  totalGenerated: number;
  significantCount: number;
  averageDifferencePercentage: number;
  maxDifferencePercentage: number;
  strongestIsogloss: GeneratedIsogloss | null;
  thresholdApplied: number;
}

/**
 * Calculates a perpendicular bisector segment between two geographic coordinates.
 * Generates an isogloss line that physically separates the two linguistic areas.
 */
function computePerpendicularBisector(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  distanceKm: number
): [number, number][] {
  const midLat = (lat1 + lat2) / 2;
  const midLng = (lng1 + lng2) / 2;

  // Tangent vector
  const dLat = lat2 - lat1;
  // Adjust longitude delta for latitude distortion
  const latRad = (midLat * Math.PI) / 180;
  const cosLat = Math.max(0.2, Math.cos(latRad));
  const dLng = (lng2 - lng1) * cosLat;

  const len = Math.sqrt(dLat * dLat + dLng * dLng);
  if (len === 0) {
    return [[midLat, midLng], [midLat, midLng]];
  }

  // Normal vector perpendicular to the line between points: (-dLng, dLat)
  const normLat = -dLng / len;
  const normLng = dLat / len / cosLat;

  // Span length of isogloss line in degrees (scaled relative to distance, ~15-35 km)
  const halfSpanKm = Math.min(35, Math.max(12, distanceKm * 0.45));
  const spanDeg = halfSpanKm / 111.32; // ~111.32 km per degree of latitude

  const p1: [number, number] = [
    midLat - normLat * spanDeg,
    midLng - normLng * spanDeg
  ];
  const p2: [number, number] = [
    midLat + normLat * spanDeg,
    midLng + normLng * spanDeg
  ];

  return [p1, p2];
}

/**
 * Generates automatic isogloss lines based on significant lexical differences.
 */
export function generateAutomaticIsoglosses(
  titikPengamatan: TitikPengamatan,
  refLat: number,
  refLon: number,
  titikPembandingList: TitikPembandingDialektometri[],
  kosakataLengkap?: KosakataLengkapData,
  allSurveys?: SurveyRecord[],
  activeSurveyId?: string | null,
  significanceThreshold: number = 20 // Default threshold >= 20% difference
): IsoglossCalculationSummary {
  const isoglosses: GeneratedIsogloss[] = [];

  // Consolidate point references
  const refDesa = titikPengamatan.namaDesa || 'Titik Acuan';
  const refCode = titikPengamatan.kodeTitik || 'TP-01';

  // Helper to extract word differences between two points
  const extractDifferences = (p1Id: string, p1Name: string, p2Id: string, p2Name: string) => {
    try {
      const stats = compareTwoPoints(
        p1Id,
        p1Name,
        p2Id,
        p2Name,
        kosakataLengkap,
        titikPembandingList,
        allSurveys
      );

      const differingWords: DifferingWordItem[] = stats.words
        .filter(w => w.isSignificant || w.category === 'BEDA_LEKSIKAL' || w.category === 'BEDA_FONEM')
        .slice(0, 50)
        .map(w => ({
          glos: w.glos,
          bentukA: w.bentuk1,
          ipaA: w.ipa1,
          bentukB: w.bentuk2,
          ipaB: w.ipa2,
          category: w.category as 'BEDA_LEKSIKAL' | 'BEDA_FONEM',
          note: w.note
        }));

      return {
        stats,
        differingWords
      };
    } catch {
      return {
        stats: null,
        differingWords: []
      };
    }
  };

  // 1. Calculate isoglosses from Active Point to each Comparison Point
  titikPembandingList.forEach((tp, idx) => {
    const tpLat = parseNum(tp.lintang);
    const tpLng = parseNum(tp.bujur);
    if (!tpLat || !tpLng) return;

    const distKm = calculateDistanceKm(refLat, refLon, tpLat, tpLng);
    const { stats, differingWords } = extractDifferences('TP-REF', refDesa, tp.id, tp.desa);

    let diffPct = tp.persentaseBeda ?? 25;
    let sCount = tp.jumlahBeda ?? 50;
    let totalN = tp.jumlahGlos ?? 200;
    let status = tp.statusHubungan || 'Beda Dialek';

    if (stats && stats.totalTested > 0) {
      diffPct = stats.persentasePerbedaan;
      sCount = Math.round(stats.effectiveDifferenceCount);
      totalN = stats.totalTested;
      status = stats.statusGuiter;
    }

    const isSignificant = diffPct >= significanceThreshold;

    let level: 'bahasa' | 'subbahasa' | 'dialek' | 'wicara' = 'wicara';
    let color = '#10b981'; // Green: minor
    let neonColor = '#10b981';
    let weight = 3;

    if (diffPct >= 81) {
      level = 'bahasa';
      color = '#e11d48';
      neonColor = '#ff2a6d';
      weight = 6;
    } else if (diffPct >= 51) {
      level = 'subbahasa';
      color = '#f59e0b';
      neonColor = '#ff9f1c';
      weight = 4.5;
    } else if (diffPct >= 21) {
      level = 'dialek';
      color = '#06b6d4';
      neonColor = '#00f0ff';
      weight = 3.5;
    }

    const bisector = computePerpendicularBisector(refLat, refLon, tpLat, tpLng, distKm);
    const midLat = (refLat + tpLat) / 2;
    const midLng = (refLon + tpLng) / 2;

    isoglosses.push({
      id: `iso_${refCode}_${tp.id}`,
      sourcePointId: 'TP-REF',
      targetPointId: tp.id,
      sourceName: `${refCode} ${refDesa}`,
      targetName: tp.namaTitik || `${tp.id} ${tp.desa}`,
      sourceDesa: refDesa,
      targetDesa: tp.desa,
      distanceKm: distKm,
      differencePercentage: diffPct,
      significantWordCount: sCount,
      totalWordsTested: totalN,
      statusHubungan: status,
      level,
      color,
      neonColor,
      weight,
      isSignificant,
      bisectorLine: bisector,
      directLinkLine: [[refLat, refLon], [tpLat, tpLng]],
      midpoint: [midLat, midLng],
      differingWords
    });
  });

  // 2. Inter-point isoglosses between neighboring comparison points (< 180 km)
  for (let i = 0; i < titikPembandingList.length; i++) {
    for (let j = i + 1; j < titikPembandingList.length; j++) {
      const tpA = titikPembandingList[i];
      const tpB = titikPembandingList[j];

      const latA = parseNum(tpA.lintang);
      const lngA = parseNum(tpA.bujur);
      const latB = parseNum(tpB.lintang);
      const lngB = parseNum(tpB.bujur);

      if (!latA || !lngA || !latB || !lngB) continue;

      const dist = calculateDistanceKm(latA, lngA, latB, lngB);
      if (dist > 180) continue; // Only evaluate realistic geographic neighbors

      const { stats, differingWords } = extractDifferences(tpA.id, tpA.desa, tpB.id, tpB.desa);

      let diffPct = 32;
      let sCount = 64;
      let totalN = 200;
      let status = 'Beda Dialek';

      if (stats && stats.totalTested > 0) {
        diffPct = stats.persentasePerbedaan;
        sCount = Math.round(stats.effectiveDifferenceCount);
        totalN = stats.totalTested;
        status = stats.statusGuiter;
      } else {
        // Approximate from difference to active point
        const diffA = tpA.persentaseBeda ?? 25;
        const diffB = tpB.persentaseBeda ?? 25;
        diffPct = Math.round(Math.abs(diffA - diffB) + 18);
        const calc = hitungDialektometri(Math.round(diffPct * 2), 200);
        status = calc.kategori;
      }

      const isSignificant = diffPct >= significanceThreshold;

      let level: 'bahasa' | 'subbahasa' | 'dialek' | 'wicara' = 'wicara';
      let color = '#10b981';
      let neonColor = '#10b981';
      let weight = 2.5;

      if (diffPct >= 81) {
        level = 'bahasa';
        color = '#e11d48';
        neonColor = '#ff2a6d';
        weight = 5.5;
      } else if (diffPct >= 51) {
        level = 'subbahasa';
        color = '#f59e0b';
        neonColor = '#ff9f1c';
        weight = 4;
      } else if (diffPct >= 21) {
        level = 'dialek';
        color = '#06b6d4';
        neonColor = '#00f0ff';
        weight = 3;
      }

      const bisector = computePerpendicularBisector(latA, lngA, latB, lngB, dist);
      const midLat = (latA + latB) / 2;
      const midLng = (lngA + lngB) / 2;

      isoglosses.push({
        id: `iso_${tpA.id}_${tpB.id}`,
        sourcePointId: tpA.id,
        targetPointId: tpB.id,
        sourceName: tpA.namaTitik || tpA.desa,
        targetName: tpB.namaTitik || tpB.desa,
        sourceDesa: tpA.desa,
        targetDesa: tpB.desa,
        distanceKm: dist,
        differencePercentage: diffPct,
        significantWordCount: sCount,
        totalWordsTested: totalN,
        statusHubungan: status,
        level,
        color,
        neonColor,
        weight,
        isSignificant,
        bisectorLine: bisector,
        directLinkLine: [[latA, lngA], [latB, lngB]],
        midpoint: [midLat, midLng],
        differingWords
      });
    }
  }

  // Summary statistics
  const significantList = isoglosses.filter(iso => iso.isSignificant);
  const totalGen = isoglosses.length;
  const avgDiff = totalGen > 0 
    ? Math.round((isoglosses.reduce((acc, curr) => acc + curr.differencePercentage, 0) / totalGen) * 10) / 10 
    : 0;

  const maxDiff = totalGen > 0 
    ? Math.max(...isoglosses.map(i => i.differencePercentage)) 
    : 0;

  const strongest = isoglosses.length > 0 
    ? [...isoglosses].sort((a, b) => b.differencePercentage - a.differencePercentage)[0] 
    : null;

  return {
    isoglosses,
    totalGenerated: totalGen,
    significantCount: significantList.length,
    averageDifferencePercentage: avgDiff,
    maxDifferencePercentage: maxDiff,
    strongestIsogloss: strongest,
    thresholdApplied: significanceThreshold
  };
}
