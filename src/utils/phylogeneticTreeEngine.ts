import { 
  estimateGlottochronologyTimeDepth, 
  classifyLanguageRelationship, 
  PRESET_THRESHOLDS 
} from './linguisticClassification';
import { 
  TitikPengamatan, 
  TitikPembandingDialektometri, 
  SurveyRecord,
  KosakataLengkapData 
} from '../types/linguistic';

export interface LanguageLeafItem {
  id: string;
  name: string;
  language: string;
  province?: string;
  color?: string;
  isReference?: boolean;
  kodeTitik?: string;
  desa?: string;
  persentaseBeda?: number;
  kognatPersen?: number;
  divergenceYears?: number;
  statusHubungan?: string;
  kategoriKeraf?: string;
  lintang?: number;
  bujur?: number;
}

export interface PhylogeneticNode {
  id: string;
  name: string;
  isLeaf: boolean;
  language?: string;
  province?: string;
  height: number; // lexical distance / 2 (ultrametric scale 0-50)
  branchLength: number;
  divergenceYears: number; // Estimated separation time in years ago
  divergenceCentury: string;
  separationYearCalendar: string; // e.g. "1250 M" or "320 SM"
  leafCount: number;
  ancestorName?: string;
  children?: PhylogeneticNode[];
  x?: number;
  y?: number;
  color?: string;
  isReference?: boolean;
  kodeTitik?: string;
  desa?: string;
  persentaseBeda?: number;
  kognatPersen?: number;
  statusHubungan?: string;
  kategoriKeraf?: string;
}

// Historical Eras of Nusantara for Glottochronology Timeline Rulers
export const NUSANTARA_HISTORICAL_ERAS = [
  { minYear: 0, maxYear: 80, name: 'Era Kemerdekaan & Kontemporer', epoch: '1945 - 2026 M', color: '#10b981' },
  { minYear: 81, maxYear: 500, name: 'Era Kesultanan Islam & Kolonial Awal', epoch: '1500 - 1900 M', color: '#06b6d4' },
  { minYear: 501, maxYear: 800, name: 'Era Majapahit, Sunda Pajajaran & Singasari', epoch: '1200 - 1500 M', color: '#3b82f6' },
  { minYear: 801, maxYear: 1400, name: 'Era Kediri, Mataram Kuno & Sriwijaya', epoch: '650 - 1200 M', color: '#8b5cf6' },
  { minYear: 1401, maxYear: 1800, name: 'Era Tarumanagara, Kutai & Kerajaan Klasik', epoch: '350 - 650 M', color: '#ec4899' },
  { minYear: 1801, maxYear: 2600, name: 'Era Buni, Pasemah & Logam Awal', epoch: '500 SM - 350 M', color: '#f59e0b' },
  { minYear: 2601, maxYear: 5000, name: 'Era Migrasi Austronesia Purba (Neolitikum)', epoch: '> 1000 SM', color: '#ef4444' }
];

export function getHistoricalEra(yearsAgo: number): { name: string; epoch: string; color: string } {
  const match = NUSANTARA_HISTORICAL_ERAS.find(
    e => yearsAgo >= e.minYear && yearsAgo <= e.maxYear
  );
  if (match) return match;
  return {
    name: 'Proto-Austronesia Purba',
    epoch: '> 3000 SM',
    color: '#94a3b8'
  };
}

/**
 * Membangun Pohon Filogenetik Kekerabatan Bahasa menggunakan Algoritma UPGMA
 * (Unweighted Pair Group Method with Arithmetic Mean)
 */
export function buildPhylogeneticTree(
  leaves: LanguageLeafItem[],
  distanceMatrix: number[][] // symmetric matrix N x N (values 0 - 100)
): PhylogeneticNode {
  const n = leaves.length;
  if (n === 0) {
    return {
      id: 'empty-root',
      name: 'Pohon Kosong',
      isLeaf: true,
      height: 0,
      branchLength: 0,
      divergenceYears: 0,
      divergenceCentury: 'Masa Kini',
      separationYearCalendar: '2026 M',
      leafCount: 0
    };
  }

  if (n === 1) {
    const l = leaves[0];
    return {
      id: l.id,
      name: l.name,
      language: l.language,
      province: l.province,
      isLeaf: true,
      height: 0,
      branchLength: 0,
      divergenceYears: 0,
      divergenceCentury: 'Masa Kini',
      separationYearCalendar: '2026 M',
      leafCount: 1,
      color: l.color || '#4f46e5',
      isReference: l.isReference,
      kodeTitik: l.kodeTitik,
      desa: l.desa,
      statusHubungan: l.statusHubungan || 'Titik Acuan Utama'
    };
  }

  // Sanitize distance matrix to ensure symmetry and no NaN/Infinity
  const safeMatrix: number[][] = Array.from({ length: n }, (_, i) => 
    Array.from({ length: n }, (_, j) => {
      if (i === j) return 0;
      const raw = distanceMatrix?.[i]?.[j] ?? distanceMatrix?.[j]?.[i];
      const val = Number(raw);
      return (isNaN(val) || !isFinite(val)) ? 30.0 : Math.max(0.1, Math.min(100, val));
    })
  );

  // Default color palette for distinct leaves
  const palette = [
    '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', 
    '#06b6d4', '#f97316', '#6366f1', '#14b8a6', '#e11d48',
    '#84cc16', '#a855f7', '#0284c7', '#059669', '#d97706'
  ];

  interface Cluster {
    node: PhylogeneticNode;
    leafIndices: number[];
  }

  let clusters: Cluster[] = leaves.map((leaf, idx) => ({
    node: {
      id: leaf.id,
      name: leaf.name,
      language: leaf.language,
      province: leaf.province,
      isLeaf: true,
      height: 0,
      branchLength: 0,
      divergenceYears: 0,
      divergenceCentury: 'Masa Kini',
      separationYearCalendar: '2026 M',
      leafCount: 1,
      color: leaf.color || (leaf.isReference ? '#4338ca' : palette[idx % palette.length]),
      isReference: leaf.isReference,
      kodeTitik: leaf.kodeTitik,
      desa: leaf.desa,
      persentaseBeda: leaf.persentaseBeda ?? 0,
      kognatPersen: leaf.kognatPersen ?? 100,
      statusHubungan: leaf.statusHubungan,
      kategoriKeraf: leaf.kategoriKeraf
    },
    leafIndices: [idx]
  }));

  let currentDist: number[][] = safeMatrix.map(row => [...row]);
  let clusterCounter = 1;

  // Progressive UPGMA merging
  while (clusters.length > 1) {
    const k = clusters.length;
    let minD = Infinity;
    let pairI = 0;
    let pairJ = 1;

    for (let i = 0; i < k; i++) {
      for (let j = i + 1; j < k; j++) {
        const d = currentDist[i][j];
        if (d < minD) {
          minD = d;
          pairI = i;
          pairJ = j;
        }
      }
    }

    if (!isFinite(minD)) {
      minD = 25.0; // fallback safety
    }

    const clusterA = clusters[pairI];
    const clusterB = clusters[pairJ];

    // Node height = minD / 2 (ensure ultrametric monotonicity)
    const rawHeight = minD / 2;
    const nodeHeight = Math.max(
      rawHeight,
      clusterA.node.height + 0.1,
      clusterB.node.height + 0.1
    );

    // Glottochronology separation estimation
    const timeDepth = estimateGlottochronologyTimeDepth(minD);
    const curYear = new Date().getFullYear();
    const sepYearNum = curYear - timeDepth.tahun;
    const separationYearCalendar = sepYearNum > 0 ? `${sepYearNum} M` : `${Math.abs(sepYearNum)} SM`;

    // Common ancestor naming
    const cleanA = (clusterA.node.desa || clusterA.node.name || 'A')
      .replace(/^Proto-/, '')
      .split(/[\s(/]/)[0]
      .trim();
    const cleanB = (clusterB.node.desa || clusterB.node.name || 'B')
      .replace(/^Proto-/, '')
      .split(/[\s(/]/)[0]
      .trim();
    const ancestorName = `Proto-${cleanA}-${cleanB}`;

    const newNode: PhylogeneticNode = {
      id: `internal-node-${clusterCounter++}`,
      name: ancestorName,
      ancestorName,
      isLeaf: false,
      height: nodeHeight,
      branchLength: 0,
      divergenceYears: timeDepth.tahun,
      divergenceCentury: timeDepth.keterangan || timeDepth.abad,
      separationYearCalendar,
      leafCount: clusterA.node.leafCount + clusterB.node.leafCount,
      children: [
        {
          ...clusterA.node,
          branchLength: Math.max(0.05, nodeHeight - clusterA.node.height)
        },
        {
          ...clusterB.node,
          branchLength: Math.max(0.05, nodeHeight - clusterB.node.height)
        }
      ]
    };

    const newLeafIndices = [...clusterA.leafIndices, ...clusterB.leafIndices];
    const newCluster: Cluster = {
      node: newNode,
      leafIndices: newLeafIndices
    };

    // Construct new distance matrix
    const remainingClusters: Cluster[] = [];
    for (let i = 0; i < k; i++) {
      if (i !== pairI && i !== pairJ) {
        remainingClusters.push(clusters[i]);
      }
    }
    remainingClusters.push(newCluster);

    const newK = remainingClusters.length;
    const newDist: number[][] = Array.from({ length: newK }, () => Array(newK).fill(0));

    for (let i = 0; i < newK; i++) {
      for (let j = 0; j < newK; j++) {
        if (i === j) {
          newDist[i][j] = 0;
        } else if (i === newK - 1 || j === newK - 1) {
          // Distance between new merged cluster and other remaining clusters
          const otherCluster = remainingClusters[i === newK - 1 ? j : i];
          let sumDist = 0;
          let count = 0;
          for (const aIdx of newLeafIndices) {
            for (const bIdx of otherCluster.leafIndices) {
              const d = safeMatrix[aIdx]?.[bIdx];
              if (d !== undefined && !isNaN(d) && isFinite(d)) {
                sumDist += d;
                count++;
              }
            }
          }
          const avgDist = count > 0 ? sumDist / count : minD;
          newDist[i][j] = avgDist;
          newDist[j][i] = avgDist;
        } else {
          // Both are older clusters
          const oldI = clusters.indexOf(remainingClusters[i]);
          const oldJ = clusters.indexOf(remainingClusters[j]);
          if (oldI >= 0 && oldJ >= 0) {
            newDist[i][j] = currentDist[oldI][oldJ];
          } else {
            newDist[i][j] = minD;
          }
        }
      }
    }

    clusters = remainingClusters;
    currentDist = newDist;
  }

  return clusters[0]?.node || {
    id: 'root',
    name: 'Proto-Bahasa',
    isLeaf: true,
    height: 0,
    branchLength: 0,
    divergenceYears: 0,
    divergenceCentury: 'Masa Kini',
    separationYearCalendar: '2026 M',
    leafCount: 1
  };
}

/**
 * Assign coordinates (x, y) for horizontal cladogram / rectangular phylogram rendering
 */
export function layoutPhylogeneticTree(
  root: PhylogeneticNode,
  width: number = 760,
  height: number = 420,
  padding: { top: number; right: number; bottom: number; left: number } = { top: 35, right: 180, bottom: 45, left: 60 }
): { root: PhylogeneticNode; leaves: PhylogeneticNode[]; maxDivergenceYears: number } {
  const plotWidth = Math.max(200, width - padding.left - padding.right);
  const plotHeight = Math.max(200, height - padding.top - padding.bottom);

  const leaves: PhylogeneticNode[] = [];
  let leafCounter = 0;
  let maxDivergenceYears = 0;

  function collectLeavesAndStats(node: PhylogeneticNode) {
    if (node.divergenceYears > maxDivergenceYears) {
      maxDivergenceYears = node.divergenceYears;
    }
    if (node.isLeaf || !node.children || node.children.length === 0) {
      leaves.push(node);
    } else {
      node.children.forEach(collectLeavesAndStats);
    }
  }
  collectLeavesAndStats(root);

  const totalLeaves = leaves.length;
  const yStep = totalLeaves > 1 ? plotHeight / (totalLeaves - 1) : plotHeight / 2;
  const maxTreeHeight = Math.max(0.5, root.height);

  function assignPositions(node: PhylogeneticNode): { x: number; y: number } {
    const normalizedDistFromRoot = (maxTreeHeight - node.height) / maxTreeHeight;
    const x = padding.left + (normalizedDistFromRoot * plotWidth);

    if (node.isLeaf || !node.children || node.children.length === 0) {
      const y = padding.top + (leafCounter++ * yStep);
      node.x = padding.left + plotWidth;
      node.y = y;
      return { x: node.x, y };
    }

    const childPositions = node.children.map(assignPositions);
    const avgY = childPositions.reduce((acc, pos) => acc + pos.y, 0) / childPositions.length;

    node.x = x;
    node.y = avgY;
    return { x, y: avgY };
  }

  leafCounter = 0;
  assignPositions(root);

  return { root, leaves, maxDivergenceYears };
}

/**
 * Builds complete Dialectometry observation points dataset for phylogenetic tree construction:
 * Reference Point (TP-01) + Titik Pembanding 1, 2, 3...
 */
export function buildDialectometryPhylogeneticData(
  titikPengamatan: TitikPengamatan,
  titikPembandingList: TitikPembandingDialektometri[],
  allSurveys?: SurveyRecord[],
  kosakataLengkap?: KosakataLengkapData,
  includeBenchmarks: boolean = true
): {
  leaves: LanguageLeafItem[];
  distanceMatrix: number[][];
  timeMatrix: number[][];
  maxDivergenceYears: number;
} {
  const leaves: LanguageLeafItem[] = [];

  // 1. Reference Point (TP-01)
  const refDesa = titikPengamatan.namaDesa || 'Desa Acuan';
  const refBahasa = titikPengamatan.bahasaDigunakan || 'Bahasa Pokok';
  const refKode = titikPengamatan.kodeTitik || 'TP-01';

  leaves.push({
    id: 'tp_ref',
    name: `${refKode} ${refDesa} (Acuan)`,
    language: refBahasa,
    province: titikPengamatan.provinsi || 'Jawa Barat',
    color: '#4338ca',
    isReference: true,
    kodeTitik: refKode,
    desa: refDesa,
    persentaseBeda: 0,
    kognatPersen: 100,
    divergenceYears: 0,
    statusHubungan: 'Titik Acuan Utama',
    kategoriKeraf: 'Titik Acuan Leksikostatistik',
    lintang: -7.498,
    bujur: 107.348
  });

  // 2. Comparison Points (TP-02, TP-03, ...)
  titikPembandingList.forEach((tp, idx) => {
    const diffPct = Math.max(0, Math.min(100, Number(tp.persentaseBeda) || 20));
    const cognatePct = Math.round((100 - diffPct) * 10) / 10;
    const timeEst = estimateGlottochronologyTimeDepth(diffPct);
    const classification = classifyLanguageRelationship(diffPct, PRESET_THRESHOLDS.badan_bahasa);

    leaves.push({
      id: tp.id || `tp_comp_${idx + 1}`,
      name: `${tp.namaTitik || tp.id} (${tp.desa})`,
      language: tp.bahasa || 'Dialek Pembanding',
      province: titikPengamatan.provinsi || 'Jawa Barat',
      isReference: false,
      kodeTitik: tp.id,
      desa: tp.desa,
      persentaseBeda: diffPct,
      kognatPersen: cognatePct,
      divergenceYears: timeEst.tahun,
      statusHubungan: tp.statusHubungan || classification.statusKekerabatan,
      kategoriKeraf: classification.kategori,
      lintang: tp.lintang,
      bujur: tp.bujur
    });
  });

  // 3. Optional Benchmark Regional Languages for Context
  if (includeBenchmarks) {
    leaves.push({
      id: 'benchmark_sunda_baku',
      name: 'Korpus Baku: Sunda (Priangan)',
      language: 'Bahasa Sunda Priangan',
      province: 'Jawa Barat (Bandung)',
      color: '#10b981',
      isReference: false,
      kodeTitik: 'REF-SD',
      desa: 'Priangan',
      persentaseBeda: 18.0,
      kognatPersen: 82.0,
      divergenceYears: estimateGlottochronologyTimeDepth(18.0).tahun,
      statusHubungan: 'Subdialek Acuan',
      kategoriKeraf: 'Variasi Subdialek Baku'
    });

    leaves.push({
      id: 'benchmark_jawa_banyumas',
      name: 'Korpus Acuan: Jawa (Banyumas)',
      language: 'Bahasa Jawa Banyumasan',
      province: 'Jawa Tengah Barat',
      color: '#f59e0b',
      isReference: false,
      kodeTitik: 'REF-JW',
      desa: 'Banyumas',
      persentaseBeda: 38.5,
      kognatPersen: 61.5,
      divergenceYears: estimateGlottochronologyTimeDepth(38.5).tahun,
      statusHubungan: 'Beda Dialek / Subbahasa',
      kategoriKeraf: 'Perbatasan Bahasa Jawa'
    });
  }

  const n = leaves.length;
  const distanceMatrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const timeMatrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  let maxDivergenceYears = 0;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        distanceMatrix[i][j] = 0;
        timeMatrix[i][j] = 0;
      } else {
        let dist = 30;

        // If one of them is the reference point (index 0)
        if (i === 0) {
          dist = leaves[j].persentaseBeda ?? 25;
        } else if (j === 0) {
          dist = leaves[i].persentaseBeda ?? 25;
        } else {
          // Pairwise between two comparison points
          const dA = leaves[i].persentaseBeda ?? 25;
          const dB = leaves[j].persentaseBeda ?? 25;
          // Triangle disparity estimation with acoustic/spatial factor
          const baseDiff = Math.abs(dA - dB);
          dist = Math.min(85, Math.max(5, baseDiff + Math.min(dA, dB) * 0.45));
        }

        distanceMatrix[i][j] = Math.round(dist * 10) / 10;
        const years = estimateGlottochronologyTimeDepth(dist).tahun;
        timeMatrix[i][j] = years;
        if (years > maxDivergenceYears) {
          maxDivergenceYears = years;
        }
      }
    }
  }

  return { leaves, distanceMatrix, timeMatrix, maxDivergenceYears };
}
