import {
  DifferenceCategory,
  ComparisonWordItem,
  DialectometryPairStats,
  TriangularMatrixItem
} from '../types/linguistic';

/**
 * Normalisasi token kata untuk komparasi leksikostatistik & fonologis
 */
export function extractCleanTokens(rawWord: string): string[] {
  if (!rawWord || typeof rawWord !== 'string') return [];
  // Bersihkan karakter transkripsi IPA, kurung penjelasan, angka
  const cleaned = rawWord
    .replace(/\[.*?\]/g, '') // hilangkan [ipa]
    .replace(/\(.*?\)/g, '') // hilangkan (penjelasan)
    .replace(/[,\.;\?!]/g, ' ')
    .toLowerCase()
    .trim();

  // Pisahkan alternatif kata berbasis tanda miring "/" atau spasi
  const parts = cleaned.split(/[\/\+]/).map(s => s.trim()).filter(Boolean);
  const results: string[] = [];

  for (const part of parts) {
    // Ambil kata pertama jika ada frase majemuk atau biarkan utuh
    results.push(part);
    const subWords = part.split(/\s+/).filter(Boolean);
    if (subWords.length > 1) {
      results.push(subWords[0]);
    }
  }

  return Array.from(new Set(results));
}

/**
 * Hitung Jarak Edit Levenshtein antara dua kata
 */
export function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

/**
 * Hitung rasio kesamaan Levenshtein (0.0 s/d 1.0)
 */
export function stringSimilarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  return (longerLength - levenshteinDistance(longer, shorter)) / longerLength;
}

/**
 * Deteksi korespondensi bunyi & alternasi fonem khas bahasa Nusantara
 */
function detectPhonologicalCorrespondences(w1: string, w2: string): string[] {
  const notes: string[] = [];
  const clean1 = w1.replace(/é/g, 'e').replace(/è/g, 'e');
  const clean2 = w2.replace(/é/g, 'e').replace(/è/g, 'e');

  // Alternasi Vokal Akhir -a ~ -e (Betawi/Jawa Timur vs Melayu/Sunda)
  if ((clean1.endsWith('a') && clean2.endsWith('e')) || (clean1.endsWith('e') && clean2.endsWith('a'))) {
    notes.push('Alternasi vokal akhir /a/ ↔ /e/');
  }

  // Alternasi Vokal -a ~ -o (Jawa Wetanan vs Sunda/Melayu)
  if ((clean1.endsWith('a') && clean2.endsWith('o')) || (clean1.endsWith('o') && clean2.endsWith('a'))) {
    notes.push('Alternasi vokal akhir /a/ ↔ /o/');
  }

  // Alternasi Vokal Pepet /eu/ [ɯ] Sunda vs /e/ [ə] Jawa vs /u/
  if (w1.includes('eu') || w2.includes('eu')) {
    notes.push('Pergeseran vokal sentral Sunda /eu/ [ɯ]');
  }

  // Korespondensi Konsonan /b/ ↔ /w/ (Sunda/Melayu batu, lebu vs Jawa watu, awu)
  if ((clean1.startsWith('b') && clean2.startsWith('w')) || (clean1.startsWith('w') && clean2.startsWith('b'))) {
    notes.push('Korespondensi konsonan labial /b/ ↔ /w/');
  }
  if ((clean1.includes('b') && clean2.includes('w')) || (clean1.includes('w') && clean2.includes('b'))) {
    if (!notes.some(n => n.includes('/b/ ↔ /w/'))) {
      notes.push('Korespondensi konsonan labial /b/ ↔ /w/');
    }
  }

  // Hilang/Muncul Bunyi Glotal Aspirat /h/ di Awal/Akhir (hujan ↔ udan/ujan, hidup ↔ idup, darah ↔ dara)
  if ((clean1.startsWith('h') && !clean2.startsWith('h')) || (!clean1.startsWith('h') && clean2.startsWith('h'))) {
    notes.push('Aspirasi inisial /h/ ↔ /Ø/');
  }
  if ((clean1.endsWith('h') && !clean2.endsWith('h')) || (!clean1.endsWith('h') && clean2.endsWith('h'))) {
    notes.push('Aspirasi final /h/ ↔ /Ø/');
  }

  // Korespondensi Cairan /r/ ↔ /l/ (ragrag ↔ laglag, dll)
  if ((clean1.includes('r') && clean2.includes('l')) || (clean1.includes('l') && clean2.includes('r'))) {
    notes.push('Rotasisasi/Lambdasasi cairan /r/ ↔ /l/');
  }

  // Variasi Diftongisasi /ai/ ~ /e/, /au/ ~ /o/ (cai ↔ ce, daun ↔ daon)
  if ((clean1.includes('ai') && clean2.includes('e')) || (clean1.includes('au') && clean2.includes('o')) ||
      (clean2.includes('ai') && clean1.includes('e')) || (clean2.includes('au') && clean1.includes('o'))) {
    notes.push('Monoftongisasi / diftongisasi vokal');
  }

  return notes;
}

/**
 * Klasifikasikan pasangan dua kata: SAMA, BEDA_FONEM, atau BEDA_LEKSIKAL
 */
export function classifyWordPair(
  rawWord1: string,
  rawWord2: string,
  glosContext?: string
): { category: DifferenceCategory; note: string } {
  const tokens1 = extractCleanTokens(rawWord1);
  const tokens2 = extractCleanTokens(rawWord2);

  if (tokens1.length === 0 || tokens2.length === 0) {
    return {
      category: 'BELUM_DIISI',
      note: 'Data salah satu bahasa belum terisi / kosong'
    };
  }

  // 1. Cek Kesamaan Identik Sempurna
  for (const t1 of tokens1) {
    for (const t2 of tokens2) {
      if (t1 === t2) {
        return {
          category: 'SAMA',
          note: 'Bentuk kata identik sama (kognat 100%)'
        };
      }
    }
  }

  // 2. Cek Kesamaan setelah stripping aksen (misal: kabéh vs kabeh)
  for (const t1 of tokens1) {
    const unaccented1 = t1.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    for (const t2 of tokens2) {
      const unaccented2 = t2.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (unaccented1 === unaccented2) {
        return {
          category: 'SAMA',
          note: 'Bentuk kata sama (variasi ortografi / aksen fonetik)'
        };
      }
    }
  }

  // 3. Analisis Fonologis & Jarak Levenshtein
  let bestDistance = 999;
  let bestSim = 0;
  let bestPair: [string, string] = ['', ''];

  for (const t1 of tokens1) {
    for (const t2 of tokens2) {
      const dist = levenshteinDistance(t1, t2);
      const sim = stringSimilarity(t1, t2);
      if (dist < bestDistance) {
        bestDistance = dist;
        bestSim = sim;
        bestPair = [t1, t2];
      }
    }
  }

  const phonNotes = detectPhonologicalCorrespondences(bestPair[0], bestPair[1]);

  // Syarat Beda Fonem:
  // - Edit distance 1 atau 2 pada kata pendek/sedang
  // - Atau similarity >= 0.58
  // - Atau ditemukan korespondensi fonem reguler Austronesia (vokal akhir, b-w, aspirasi h)
  const isPhonemeDifference =
    (bestDistance <= 2 && Math.min(bestPair[0].length, bestPair[1].length) >= 3) ||
    bestSim >= 0.60 ||
    (phonNotes.length > 0 && bestSim >= 0.40);

  if (isPhonemeDifference) {
    const noteDetail = phonNotes.length > 0
      ? `Beda Fonem: ${phonNotes.join(', ')} (${bestPair[0]} ~ ${bestPair[1]})`
      : `Beda Fonem: Variasi pergeseran 1-2 bunyi kognat (${bestPair[0]} ~ ${bestPair[1]}, kemiripan ${(bestSim * 100).toFixed(0)}%)`;

    return {
      category: 'BEDA_FONEM',
      note: noteDetail
    };
  }

  // 4. Jika akar kata (etimon) berbeda sama sekali
  return {
    category: 'BEDA_LEKSIKAL',
    note: `Beda Leksikal: Etimon kata berbeda (${bestPair[0]} vs ${bestPair[1]})`
  };
}

/**
 * Hitung statistik Dialektometri untuk pasangan bahasa tertentu
 * Menggunakan standar Guiraud / Badan Bahasa:
 * d = (s / n) * 100%
 * s = s_leksikal + s_fonem
 */
export function calculatePairStats(
  lang1Name: string,
  lang2Name: string,
  items: ComparisonWordItem[],
  pairSelector: 'pairAB' | 'pairAC' | 'pairBC'
): DialectometryPairStats {
  let totalCompared = 0;
  let lexicalCount = 0;
  let phonemeCount = 0;
  let sameCount = 0;

  for (const item of items) {
    const pair = item[pairSelector];
    if (!pair || pair.category === 'BELUM_DIISI') continue;

    totalCompared++;
    if (pair.category === 'BEDA_LEKSIKAL') {
      lexicalCount++;
    } else if (pair.category === 'BEDA_FONEM') {
      phonemeCount++;
    } else if (pair.category === 'SAMA') {
      sameCount++;
    }
  }

  if (totalCompared === 0) {
    return {
      lang1Name,
      lang2Name,
      totalCompared: 0,
      lexicalCount: 0,
      lexicalPercent: 0,
      phonemeCount: 0,
      phonemePercent: 0,
      sameCount: 0,
      samePercent: 0,
      dialectometryIndex: 0,
      status: 'Data Belum Lengkap',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
      deskripsi: 'Belum ada kosakata yang sama-sama terisi pada kedua bahasa.'
    };
  }

  const lexicalPercent = Math.round((lexicalCount / totalCompared) * 1000) / 10;
  const phonemePercent = Math.round((phonemeCount / totalCompared) * 1000) / 10;
  const samePercent = Math.round((sameCount / totalCompared) * 1000) / 10;

  // Indeks Dialektometri Total = (Beda Leksikal + Beda Fonem) / Total
  const totalDifference = lexicalCount + phonemeCount;
  const dialectometryIndex = Math.min(100, Math.round((totalDifference / totalCompared) * 1000) / 10);

  // Skala Dialektometri Leksikal Guiter:
  // • 81% – 100% = Kategori perbedaan bahasa (berbeda bahasa)
  // • 51% – 80% = Kategori perbedaan dialek (berbeda dialek)
  // • 31% – 50% = Kategori perbedaan subdialek
  // • 21% – 30% = Kategori perbedaan wicara (speech difference)
  // • Kurang dari 21% (≤ 20%): Kategori tidak berbeda (masih dalam satu variasi atau wicara yang sama)
  let status = '';
  let badgeColor = '';
  let deskripsi = '';

  if (dialectometryIndex <= 20) {
    status = 'Kategori Tidak Berbeda (Wicara/Variasi Sama)';
    badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    deskripsi = 'Kurang dari 21% (≤ 20%): Kategori tidak berbeda (masih dalam satu variasi atau wicara yang sama).';
  } else if (dialectometryIndex <= 30) {
    status = 'Kategori Perbedaan Wicara (Speech Difference)';
    badgeColor = 'bg-sky-100 text-sky-800 border-sky-300';
    deskripsi = '21% – 30%: Kategori perbedaan wicara (speech difference).';
  } else if (dialectometryIndex <= 50) {
    status = 'Kategori Perbedaan Subdialek';
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
    deskripsi = '31% – 50%: Kategori perbedaan subdialek.';
  } else if (dialectometryIndex <= 80) {
    status = 'Kategori Perbedaan Dialek (Berbeda Dialek)';
    badgeColor = 'bg-orange-100 text-orange-800 border-orange-300';
    deskripsi = '51% – 80%: Kategori perbedaan dialek (berbeda dialek).';
  } else {
    status = 'Kategori Perbedaan Bahasa (Berbeda Bahasa)';
    badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
    deskripsi = '81% – 100%: Kategori perbedaan bahasa (berbeda bahasa).';
  }

  return {
    lang1Name,
    lang2Name,
    totalCompared,
    lexicalCount,
    lexicalPercent,
    phonemeCount,
    phonemePercent,
    sameCount,
    samePercent,
    dialectometryIndex,
    status,
    badgeColor,
    deskripsi
  };
}

/**
 * Bangun Matriks Segitiga Dialektometri (Triangular Matrix) untuk komparasi 3 bahasa
 */
export function buildTriangularMatrix(
  statsAB: DialectometryPairStats,
  statsAC?: DialectometryPairStats,
  statsBC?: DialectometryPairStats
): TriangularMatrixItem[] {
  const matrix: TriangularMatrixItem[] = [
    {
      pairKey: 'A-B',
      lang1: statsAB.lang1Name,
      lang2: statsAB.lang2Name,
      index: statsAB.dialectometryIndex,
      lexicalCount: statsAB.lexicalCount,
      phonemeCount: statsAB.phonemeCount,
      status: statsAB.status,
      color: statsAB.badgeColor
    }
  ];

  if (statsAC) {
    matrix.push({
      pairKey: 'A-C',
      lang1: statsAC.lang1Name,
      lang2: statsAC.lang2Name,
      index: statsAC.dialectometryIndex,
      lexicalCount: statsAC.lexicalCount,
      phonemeCount: statsAC.phonemeCount,
      status: statsAC.status,
      color: statsAC.badgeColor
    });
  }

  if (statsBC) {
    matrix.push({
      pairKey: 'B-C',
      lang1: statsBC.lang1Name,
      lang2: statsBC.lang2Name,
      index: statsBC.dialectometryIndex,
      lexicalCount: statsBC.lexicalCount,
      phonemeCount: statsBC.phonemeCount,
      status: statsBC.status,
      color: statsBC.badgeColor
    });
  }

  return matrix;
}

/**
 * Ekspor data komparasi ke CSV dengan encoding UTF-8 BOM agar rapi di MS Excel
 */
export function exportComparisonToCSV(
  items: ComparisonWordItem[],
  langAName: string,
  langBName: string,
  langCName?: string,
  isThreeLangs: boolean = false
): string {
  const headers = [
    'No',
    'Glos Indonesia',
    `Bentuk (${langAName})`,
    `Transkripsi IPA (${langAName})`,
    `Bentuk (${langBName})`,
    `Transkripsi IPA (${langBName})`
  ];

  if (isThreeLangs && langCName) {
    headers.push(`Bentuk (${langCName})`);
    headers.push(`Transkripsi IPA (${langCName})`);
  }

  headers.push('Kategori Komparasi');
  headers.push('Analisis Fonologis & Keterangan');

  const rows = items.map(item => {
    const row = [
      item.id,
      `"${item.glosIndonesia.replace(/"/g, '""')}"`,
      `"${item.langA.bentuk.replace(/"/g, '""')}"`,
      `"${item.langA.ipa.replace(/"/g, '""')}"`,
      `"${item.langB.bentuk.replace(/"/g, '""')}"`,
      `"${item.langB.ipa.replace(/"/g, '""')}"`
    ];

    if (isThreeLangs && langCName && item.langC) {
      row.push(`"${item.langC.bentuk.replace(/"/g, '""')}"`);
      row.push(`"${item.langC.ipa.replace(/"/g, '""')}"`);
    }

    const catLabel = item.category === 'BEDA_LEKSIKAL'
      ? 'Beda Leksikal'
      : item.category === 'BEDA_FONEM'
      ? 'Beda Fonem'
      : item.category === 'SAMA'
      ? 'Sama / Kognat Identik'
      : 'Belum Diisi';

    row.push(`"${catLabel}"`);
    row.push(`"${item.phonologicalNote.replace(/"/g, '""')}"`);

    return row.join(',');
  });

  // UTF-8 BOM
  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}
