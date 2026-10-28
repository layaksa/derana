/**
 * phoneticSegmentAligner.ts
 * Mesin Analisis Fonetik Komparatif & Penjajaran Segmen IPA Otomatis
 * untuk Dialektometri & Geolinguistik Komparatif (Maurice Swadesh 200 Kosakata Dasar)
 */

export interface AlignedToken {
  text: string;
  isGap: boolean;
  status: 'MATCH' | 'SHIFT' | 'INSERTION' | 'DELETION' | 'UNMATCHED';
  similarity: number; // 0.0 to 1.0
  shiftType?: string;
  tooltipText?: string;
  colorClass: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export interface PhoneticShiftOccurrence {
  glos: string;
  position: number;
  soundA: string;
  soundB: string;
  shiftType: string;
  description: string;
  confidence: number;
}

export interface AlignedPhoneticResult {
  glos: string;
  rawIpa1: string;
  rawIpa2: string;
  word1: string;
  word2: string;
  tokens1: AlignedToken[];
  tokens2: AlignedToken[];
  similarityPct: number; // 0 - 100%
  shifts: PhoneticShiftOccurrence[];
  isIdentical: boolean;
  isLexicalDiff: boolean;
  similarityBadge: {
    label: string;
    colorClass: string;
    badgeBg: string;
    badgeText: string;
    borderClass: string;
  };
}

export interface CorpusPhoneticSummary {
  meanSimilarityPct: number;
  totalTested: number;
  totalShiftsDetected: number;
  identicalCount: number;
  highSimilarityCount: number;
  moderateVariationCount: number;
  lexicalDifferenceCount: number;
  dominantShiftType: string;
  topShiftRules: {
    ruleName: string;
    formula: string;
    count: number;
    percentage: number;
    examples: { glos: string; w1: string; w2: string; ipa1: string; ipa2: string }[];
  }[];
  alignedWordResults: Map<string, AlignedPhoneticResult>;
}

// Multi-character IPA and orthographic digraphs sorted by length descending
const MULTI_CHAR_IPA_SYMBOLS = [
  'tʃ', 'dʒ', 'ts', 'dz',
  'kʰ', 'pʰ', 'tʰ', 'bʱ', 'dʱ', 'ɡʱ',
  'kʷ', 'ɡʷ', 'tʲ', 'dʲ', 'nʲ', 'lʲ',
  'aː', 'iː', 'uː', 'eː', 'oː', 'əː', 'ɛː', 'ɔː',
  'ai', 'au', 'oi', 'ei', 'eu', 'ou',
  'ᵐb', 'ⁿd', 'ᵑɡ',
  'ng', 'ny', 'sy', 'kh'
];

/**
 * Normalisasi dan ekstraksi segmen IPA dari string transkripsi
 */
export function tokenizeIPASegments(rawIpa?: string, fallbackWord?: string): string[] {
  let text = (rawIpa || '').trim();

  // Bersihkan kurung siku, garis miring, dan catatan tambahan
  text = text
    .replace(/[\[\]\/\(\)]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Jika ada varian dengan tanda titik koma atau garis miring ganda, ambil varian pertama
  if (text.includes(';')) text = text.split(';')[0].trim();
  if (text.includes(',')) text = text.split(',')[0].trim();

  // Jika IPA kosong, konversi bentuk ortografis lokal ke aproksimasi IPA
  if (!text && fallbackWord) {
    let ortho = fallbackWord.toLowerCase().trim();
    if (ortho.includes('/')) ortho = ortho.split('/')[0].trim();
    if (ortho.includes(',')) ortho = ortho.split(',')[0].trim();
    text = ortho
      .replace(/ng/g, 'ŋ')
      .replace(/ny/g, 'ɲ')
      .replace(/sy/g, 'ʃ')
      .replace(/kh/g, 'x')
      .replace(/c/g, 'tʃ')
      .replace(/j/g, 'dʒ')
      .replace(/y/g, 'j')
      .replace(/é/g, 'e')
      .replace(/e\b/g, 'ə')
      .replace(/k\b/g, 'ʔ');
  }

  if (!text) return [];

  const segments: string[] = [];
  let i = 0;

  while (i < text.length) {
    // Lewati spasi atau tanda hubung
    if (text[i] === ' ' || text[i] === '-') {
      i++;
      continue;
    }

    // Cek multi-karakter
    let matchedMulti = false;
    for (const symbol of MULTI_CHAR_IPA_SYMBOLS) {
      if (text.startsWith(symbol, i)) {
        segments.push(symbol);
        i += symbol.length;
        matchedMulti = true;
        break;
      }
    }

    if (!matchedMulti) {
      let char = text[i];
      // Cek apakah ada diakritik panjang (ː) atau suprasegmental setelahnya
      if (i + 1 < text.length && (text[i + 1] === 'ː' || text[i + 1] === 'ˑ')) {
        char += text[i + 1];
        i++;
      }
      segments.push(char);
      i++;
    }
  }

  return segments;
}

/**
 * Matriks kedekatan artikulatoris antar segmen fonem IPA
 */
export function computePhoneticSegmentDistance(
  segA: string,
  segB: string
): { similarity: number; shiftType?: string; description?: string } {
  const a = segA.toLowerCase();
  const b = segB.toLowerCase();

  // 1. Identik persis
  if (a === b) {
    return { similarity: 1.0 };
  }

  // 2. Satu segmen adalah Gap (Elisi / Epentesis)
  if (a === '∅' || b === '∅' || a === '-' || b === '-') {
    const present = a === '∅' || a === '-' ? b : a;
    if (present === 'h' || present === 'ʔ') {
      return {
        similarity: 0.55,
        shiftType: 'Elisi/Debukalisasi Laringal',
        description: `Elisi konsonan laringal /${present}/ ↔ ∅`
      };
    }
    if (present === 'w' || present === 'j') {
      return {
        similarity: 0.50,
        shiftType: 'Elisi Luncuran Semivokal',
        description: `Elisi semivokal /${present}/ ↔ ∅`
      };
    }
    if (present === 'r' || present === 'l') {
      return {
        similarity: 0.40,
        shiftType: 'Apokope/Afiresis Cairan',
        description: `Elisi konsonan likuida /${present}/ ↔ ∅`
      };
    }
    return {
      similarity: 0.15,
      shiftType: 'Elisi / Epentesis Segmen',
      description: `Penambahan atau peluluhan segmen [${present}] ↔ ∅`
    };
  }

  // Set Vokal Baku & Variasi IPA
  const vowels = new Set(['a', 'i', 'u', 'e', 'o', 'ə', 'ɛ', 'ɔ', 'ɯ', 'ɤ', 'æ', 'ɑ', 'ɪ', 'ʊ', 'é']);
  const isVowelA = vowels.has(a.replace(/ː/g, ''));
  const isVowelB = vowels.has(b.replace(/ː/g, ''));

  // 3. Pasangan Vokal
  if (isVowelA && isVowelB) {
    const cleanA = a.replace(/ː/g, '');
    const cleanB = b.replace(/ː/g, '');

    // /a/ ↔ /o/ atau /ɔ/
    if ((cleanA === 'a' && (cleanB === 'o' || cleanB === 'ɔ')) || (cleanB === 'a' && (cleanA === 'o' || cleanA === 'ɔ'))) {
      return {
        similarity: 0.72,
        shiftType: 'Pergeseran Vokal /a/ ↔ /o/ [ɔ]',
        description: 'Pergeseran vokal terbuka rendah /a/ menjadi vokal bulat belakang sedang /o/ [ɔ]'
      };
    }

    // /u/ ↔ /o/ atau /ɔ/
    if ((cleanA === 'u' && (cleanB === 'o' || cleanB === 'ɔ' || cleanB === 'ʊ')) || (cleanB === 'u' && (cleanA === 'o' || cleanA === 'ɔ' || cleanA === 'ʊ'))) {
      return {
        similarity: 0.76,
        shiftType: 'Penurunan Vokal Belakang /u/ ↔ /o/',
        description: 'Penurunan tinggi lidah dari vokal tertutup belakang /u/ ke vokal sedang /o/'
      };
    }

    // /i/ ↔ /e/ atau /ɛ/
    if ((cleanA === 'i' && (cleanB === 'e' || cleanB === 'ɛ' || cleanB === 'é' || cleanB === 'ɪ')) || 
        (cleanB === 'i' && (cleanA === 'e' || cleanA === 'ɛ' || cleanA === 'é' || cleanA === 'ɪ'))) {
      return {
        similarity: 0.76,
        shiftType: 'Penurunan Vokal Depan /i/ ↔ /e/ [ɛ]',
        description: 'Penurunan tinggi lidah dari vokal tinggi depan /i/ ke vokal sedang /e/ [ɛ]'
      };
    }

    // Pepet /ə/ ↔ /a/
    if ((cleanA === 'ə' && cleanB === 'a') || (cleanB === 'ə' && cleanA === 'a')) {
      return {
        similarity: 0.70,
        shiftType: 'Refleks Pepet /ə/ ↔ /a/',
        description: 'Perbedaan refleks vokal pepet Austronesia *ə menjadi /a/'
      };
    }

    // Pepet /ə/ ↔ /e/ atau /ɛ/
    if ((cleanA === 'ə' && (cleanB === 'e' || cleanB === 'ɛ')) || (cleanB === 'ə' && (cleanA === 'e' || cleanA === 'ɛ'))) {
      return {
        similarity: 0.74,
        shiftType: 'Variasi Vokal Tengah /ə/ ↔ /e/',
        description: 'Alternasi vokal sentral /ə/ dengan vokal depan sedang /e/'
      };
    }

    // Vokal Sunda /ɯ/ (eu) ↔ /u/ atau /ə/
    if ((cleanA === 'ɯ' && (cleanB === 'u' || cleanB === 'ə')) || (cleanB === 'ɯ' && (cleanA === 'u' || cleanA === 'ə'))) {
      return {
        similarity: 0.73,
        shiftType: 'Alternasi Vokal Eu /ɯ/ ↔ /u/',
        description: 'Korespondensi vokal tertutup belakang takbulat Sunda [ɯ] dengan [u] atau [ə]'
      };
    }

    // Vokal lain dengan perbedaan panjang bunyi (misal a vs aː)
    if (cleanA === cleanB) {
      return {
        similarity: 0.88,
        shiftType: 'Variasi Panjang Vokal',
        description: `Perbedaan kuantitas panjang bunyi [${a}] ↔ [${b}]`
      };
    }

    // Vokal lain dalam kelas sama
    return {
      similarity: 0.55,
      shiftType: 'Pergeseran Vokal',
      description: `Pergeseran ruang vokal antar-tuturan [${a}] ↔ [${b}]`
    };
  }

  // 4. Pasangan Konsonan
  if (!isVowelA && !isVowelB) {
    // Rotasime & Lamdasime /r/ ↔ /l/
    if ((a === 'r' && b === 'l') || (b === 'r' && a === 'l') || 
        (a === 'ɾ' && b === 'l') || (b === 'ɾ' && a === 'l')) {
      return {
        similarity: 0.78,
        shiftType: 'Rotasime/Lamdasime /r/ ↔ /l/',
        description: 'Alternasi konsonan cairan alveolar (*liquid alternation*) /r/ ↔ /l/'
      };
    }

    // Glotalisasi /k/ ↔ /ʔ/ atau /k/ ↔ /h/
    if ((a === 'k' && (b === 'ʔ' || b === 'h')) || (b === 'k' && (a === 'ʔ' || a === 'h'))) {
      return {
        similarity: 0.72,
        shiftType: 'Glotalisasi /k/ ↔ /ʔ/',
        description: 'Pelemahan hambat velar /k/ menjadi hentian glotal /ʔ/ atau frikatif /h/'
      };
    }

    // Voicing Contrast (Hambat Takbersuara ↔ Bersuara Homorganik)
    const voicePairs: [string, string][] = [
      ['p', 'b'], ['t', 'd'], ['k', 'ɡ'], ['s', 'z'], ['tʃ', 'dʒ']
    ];
    for (const [v1, v2] of voicePairs) {
      if ((a === v1 && b === v2) || (a === v2 && b === v1)) {
        return {
          similarity: 0.82,
          shiftType: `Alternasi Suara /${v1}/ ↔ /${v2}/`,
          description: `Perbedaan penyuaraan konsonan homorganik [${v1}] (takbersuara) ↔ [${v2}] (bersuara)`
        };
      }
    }

    // Nasal shifts
    const nasals = new Set(['m', 'n', 'ŋ', 'ɲ']);
    if (nasals.has(a) && nasals.has(b)) {
      return {
        similarity: 0.75,
        shiftType: `Pergeseran Titik Artikulasi Nasal /${a}/ ↔ /${b}/`,
        description: `Asimilasi/pergeseran daerah artikulasi konsonan sengau [${a}] ↔ [${b}]`
      };
    }

    // Spirantisasi / Lenisi
    if ((a === 's' && b === 'h') || (b === 's' && a === 'h') ||
        (a === 'b' && b === 'w') || (b === 'b' && a === 'w') ||
        (a === 'p' && b === 'w') || (b === 'p' && a === 'w')) {
      return {
        similarity: 0.68,
        shiftType: `Spirantisasi/Lenisi /${a}/ ↔ /${b}/`,
        description: `Pelemahan cara artikulasi konsonan [${a}] ↔ [${b}]`
      };
    }

    // Konsonan afrikat vs dental/alveolar
    if ((a === 'tʃ' && (b === 's' || b === 't')) || (b === 'tʃ' && (a === 's' || a === 't')) ||
        (a === 'dʒ' && (b === 'j' || b === 'd')) || (b === 'dʒ' && (a === 'j' || a === 'd'))) {
      return {
        similarity: 0.65,
        shiftType: `Alternasi Afrikat /${a}/ ↔ /${b}/`,
        description: `Pergeseran konsonan paduan afrikat [${a}] ↔ [${b}]`
      };
    }

    // Konsonan tak sekerabat
    return {
      similarity: 0.12,
      shiftType: 'Perbedaan Konsonan',
      description: `Perbedaan fonem konsonan tak sekerabat [${a}] ↔ [${b}]`
    };
  }

  // 5. Vokal vs Konsonan (Perbedaan total)
  return {
    similarity: 0.0,
    shiftType: 'Ketidaksesuaian Segmen Vokal-Konsonan',
    description: `Segmen tidak sekelas [${a}] (vokal/konsonan) vs [${b}]`
  };
}

/**
 * Needleman-Wunsch Global Alignment untuk Segmen IPA
 */
export function alignPhoneticSegments(
  rawIpa1: string,
  rawIpa2: string,
  word1: string = '',
  word2: string = '',
  glos: string = ''
): AlignedPhoneticResult {
  const segs1 = tokenizeIPASegments(rawIpa1, word1);
  const segs2 = tokenizeIPASegments(rawIpa2, word2);

  // Kasus kosong
  if (segs1.length === 0 && segs2.length === 0) {
    return {
      glos,
      rawIpa1,
      rawIpa2,
      word1,
      word2,
      tokens1: [],
      tokens2: [],
      similarityPct: 0,
      shifts: [],
      isIdentical: false,
      isLexicalDiff: true,
      similarityBadge: {
        label: 'Kosong / Belum Diisi',
        colorClass: 'text-slate-500',
        badgeBg: 'bg-slate-100 dark:bg-slate-800',
        badgeText: 'text-slate-600 dark:text-slate-400',
        borderClass: 'border-slate-200 dark:border-slate-700'
      }
    };
  }

  // Matriks Needleman-Wunsch
  const n = segs1.length;
  const m = segs2.length;
  const GAP_PENALTY = -1.2;

  // dp[i][j]
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 0; i <= n; i++) dp[i][0] = i * GAP_PENALTY;
  for (let j = 0; j <= m; j++) dp[0][j] = j * GAP_PENALTY;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const matchEval = computePhoneticSegmentDistance(segs1[i - 1], segs2[j - 1]);
      // Skor: 2.0 * similarity - 1.0 (antara -1.0 dan +2.0)
      const matchScore = (matchEval.similarity * 3.0) - 1.0;

      const scoreDiag = dp[i - 1][j - 1] + matchScore;
      const scoreUp = dp[i - 1][j] + GAP_PENALTY;
      const scoreLeft = dp[i][j - 1] + GAP_PENALTY;

      dp[i][j] = Math.max(scoreDiag, scoreUp, scoreLeft);
    }
  }

  // Backtracking
  let i = n;
  let j = m;
  const alignedA: string[] = [];
  const alignedB: string[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const matchEval = computePhoneticSegmentDistance(segs1[i - 1], segs2[j - 1]);
      const matchScore = (matchEval.similarity * 3.0) - 1.0;

      if (Math.abs(dp[i][j] - (dp[i - 1][j - 1] + matchScore)) < 0.001) {
        alignedA.unshift(segs1[i - 1]);
        alignedB.unshift(segs2[j - 1]);
        i--;
        j--;
        continue;
      }
    }

    if (i > 0 && Math.abs(dp[i][j] - (dp[i - 1][j] + GAP_PENALTY)) < 0.001) {
      alignedA.unshift(segs1[i - 1]);
      alignedB.unshift('∅');
      i--;
      continue;
    }

    if (j > 0) {
      alignedA.unshift('∅');
      alignedB.unshift(segs2[j - 1]);
      j--;
      continue;
    }
  }

  // Buat token visual dan deteksi pergeseran
  const tokens1: AlignedToken[] = [];
  const tokens2: AlignedToken[] = [];
  const shifts: PhoneticShiftOccurrence[] = [];
  let totalSimScore = 0;
  const len = alignedA.length;

  for (let k = 0; k < len; k++) {
    const s1 = alignedA[k];
    const s2 = alignedB[k];
    const dist = computePhoneticSegmentDistance(s1, s2);
    totalSimScore += dist.similarity;

    const isMatch = dist.similarity >= 0.98;
    const isShift = dist.similarity >= 0.45 && dist.similarity < 0.98;
    const isGap1 = s1 === '∅';
    const isGap2 = s2 === '∅';

    if (isShift || (isGap1 && s2 !== '∅') || (isGap2 && s1 !== '∅')) {
      if (dist.shiftType) {
        shifts.push({
          glos,
          position: k + 1,
          soundA: s1,
          soundB: s2,
          shiftType: dist.shiftType,
          description: dist.description || '',
          confidence: Math.round(dist.similarity * 100)
        });
      }
    }

    // Token untuk Titik 1
    if (isMatch) {
      tokens1.push({
        text: s1,
        isGap: false,
        status: 'MATCH',
        similarity: dist.similarity,
        tooltipText: `Segmen identik [${s1}]`,
        colorClass: 'text-emerald-700 dark:text-emerald-300 font-bold',
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
        badgeText: 'text-emerald-800 dark:text-emerald-300',
        badgeBorder: 'border-emerald-200 dark:border-emerald-800'
      });
    } else if (isGap1) {
      tokens1.push({
        text: '∅',
        isGap: true,
        status: 'DELETION',
        similarity: dist.similarity,
        shiftType: dist.shiftType,
        tooltipText: `Elisi segmen: tidak ada di Titik 1 vs [${s2}] di Titik 2 (${dist.shiftType || 'Elisi'})`,
        colorClass: 'text-rose-500 font-mono font-bold opacity-75',
        badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
        badgeText: 'text-rose-700 dark:text-rose-400',
        badgeBorder: 'border-rose-200 dark:border-rose-800'
      });
    } else if (isShift) {
      tokens1.push({
        text: s1,
        isGap: false,
        status: 'SHIFT',
        similarity: dist.similarity,
        shiftType: dist.shiftType,
        tooltipText: `Pergeseran fonem [${s1}] ↔ [${s2}]: ${dist.description || dist.shiftType}`,
        colorClass: 'text-amber-800 dark:text-amber-300 font-black',
        badgeBg: 'bg-amber-100 dark:bg-amber-950/70',
        badgeText: 'text-amber-900 dark:text-amber-200',
        badgeBorder: 'border-amber-300 dark:border-amber-700'
      });
    } else {
      tokens1.push({
        text: s1,
        isGap: false,
        status: 'UNMATCHED',
        similarity: dist.similarity,
        tooltipText: `Perbedaan leksikal [${s1}] vs [${s2}]`,
        colorClass: 'text-rose-700 dark:text-rose-300 font-bold',
        badgeBg: 'bg-rose-100 dark:bg-rose-950/60',
        badgeText: 'text-rose-800 dark:text-rose-200',
        badgeBorder: 'border-rose-300 dark:border-rose-800'
      });
    }

    // Token untuk Titik 2
    if (isMatch) {
      tokens2.push({
        text: s2,
        isGap: false,
        status: 'MATCH',
        similarity: dist.similarity,
        tooltipText: `Segmen identik [${s2}]`,
        colorClass: 'text-emerald-700 dark:text-emerald-300 font-bold',
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
        badgeText: 'text-emerald-800 dark:text-emerald-300',
        badgeBorder: 'border-emerald-200 dark:border-emerald-800'
      });
    } else if (isGap2) {
      tokens2.push({
        text: '∅',
        isGap: true,
        status: 'DELETION',
        similarity: dist.similarity,
        shiftType: dist.shiftType,
        tooltipText: `Elisi segmen: [${s1}] di Titik 1 vs tidak ada di Titik 2 (${dist.shiftType || 'Elisi'})`,
        colorClass: 'text-rose-500 font-mono font-bold opacity-75',
        badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
        badgeText: 'text-rose-700 dark:text-rose-400',
        badgeBorder: 'border-rose-200 dark:border-rose-800'
      });
    } else if (isShift) {
      tokens2.push({
        text: s2,
        isGap: false,
        status: 'SHIFT',
        similarity: dist.similarity,
        shiftType: dist.shiftType,
        tooltipText: `Pergeseran fonem [${s2}] ↔ [${s1}]: ${dist.description || dist.shiftType}`,
        colorClass: 'text-amber-800 dark:text-amber-300 font-black',
        badgeBg: 'bg-amber-100 dark:bg-amber-950/70',
        badgeText: 'text-amber-900 dark:text-amber-200',
        badgeBorder: 'border-amber-300 dark:border-amber-700'
      });
    } else {
      tokens2.push({
        text: s2,
        isGap: false,
        status: 'UNMATCHED',
        similarity: dist.similarity,
        tooltipText: `Perbedaan leksikal [${s2}] vs [${s1}]`,
        colorClass: 'text-rose-700 dark:text-rose-300 font-bold',
        badgeBg: 'bg-rose-100 dark:bg-rose-950/60',
        badgeText: 'text-rose-800 dark:text-rose-200',
        badgeBorder: 'border-rose-300 dark:border-rose-800'
      });
    }
  }

  // Hitung persentase kemiripan fonetik normalisasi
  const maxPossible = Math.max(segs1.length, segs2.length, len);
  let rawPct = len > 0 ? (totalSimScore / len) * 100 : 0;

  // Penalti jika perbedaan panjang segmen sangat timpang (beda leksikal)
  const lengthRatio = Math.min(segs1.length, segs2.length) / Math.max(segs1.length, segs2.length, 1);
  if (lengthRatio < 0.5) {
    rawPct = rawPct * lengthRatio;
  }

  const similarityPct = Math.min(100, Math.max(0, parseFloat(rawPct.toFixed(1))));
  const isIdentical = similarityPct >= 99.5;
  const isLexicalDiff = similarityPct < 35.0;

  // Lencana Kategori Kemiripan
  let similarityBadge = {
    label: `${similarityPct}% Mirip`,
    colorClass: 'text-emerald-700 dark:text-emerald-300',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950',
    badgeText: 'text-emerald-800 dark:text-emerald-300',
    borderClass: 'border-emerald-300 dark:border-emerald-800'
  };

  if (isIdentical) {
    similarityBadge = {
      label: '100% Identik',
      colorClass: 'text-emerald-700 dark:text-emerald-300',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-950',
      badgeText: 'text-emerald-800 dark:text-emerald-300',
      borderClass: 'border-emerald-300 dark:border-emerald-800'
    };
  } else if (similarityPct >= 75) {
    similarityBadge = {
      label: `${similarityPct}% Variasi Teratur`,
      colorClass: 'text-cyan-700 dark:text-cyan-300',
      badgeBg: 'bg-cyan-100 dark:bg-cyan-950',
      badgeText: 'text-cyan-800 dark:text-cyan-300',
      borderClass: 'border-cyan-300 dark:border-cyan-800'
    };
  } else if (similarityPct >= 45) {
    similarityBadge = {
      label: `${similarityPct}% Pergeseran Fonem`,
      colorClass: 'text-amber-700 dark:text-amber-300',
      badgeBg: 'bg-amber-100 dark:bg-amber-950',
      badgeText: 'text-amber-800 dark:text-amber-300',
      borderClass: 'border-amber-300 dark:border-amber-800'
    };
  } else {
    similarityBadge = {
      label: `${similarityPct}% Beda Leksikal`,
      colorClass: 'text-rose-700 dark:text-rose-300',
      badgeBg: 'bg-rose-100 dark:bg-rose-950',
      badgeText: 'text-rose-800 dark:text-rose-300',
      borderClass: 'border-rose-300 dark:border-rose-800'
    };
  }

  return {
    glos,
    rawIpa1,
    rawIpa2,
    word1,
    word2,
    tokens1,
    tokens2,
    similarityPct,
    shifts,
    isIdentical,
    isLexicalDiff,
    similarityBadge
  };
}

/**
 * Analisis Kemiripan Fonetik Agregat Seluruh 200 Kosakata Swadesh
 */
export function analyzeCorpusPhonetics(
  words: { glos: string; bentuk1: string; ipa1: string; bentuk2: string; ipa2: string; category?: string }[]
): CorpusPhoneticSummary {
  const alignedWordResults = new Map<string, AlignedPhoneticResult>();
  const shiftRuleMap = new Map<string, { count: number; examples: { glos: string; w1: string; w2: string; ipa1: string; ipa2: string }[] }>();

  let totalSim = 0;
  let validCount = 0;
  let identicalCount = 0;
  let highSimilarityCount = 0;
  let moderateVariationCount = 0;
  let lexicalDifferenceCount = 0;
  let totalShiftsDetected = 0;

  words.forEach(row => {
    // Lewati jika kedua data belum diisi
    if (!row.bentuk1 || !row.bentuk2 || row.category === 'BELUM_DIISI') return;

    const aligned = alignPhoneticSegments(row.ipa1, row.ipa2, row.bentuk1, row.bentuk2, row.glos);
    alignedWordResults.set(row.glos.toLowerCase().trim(), aligned);

    validCount++;
    totalSim += aligned.similarityPct;
    totalShiftsDetected += aligned.shifts.length;

    if (aligned.similarityPct >= 99.5) {
      identicalCount++;
    } else if (aligned.similarityPct >= 75) {
      highSimilarityCount++;
    } else if (aligned.similarityPct >= 45) {
      moderateVariationCount++;
    } else {
      lexicalDifferenceCount++;
    }

    // Agregasi aturan pergeseran fonem
    aligned.shifts.forEach(shift => {
      const key = shift.shiftType;
      const existing = shiftRuleMap.get(key) || { count: 0, examples: [] };
      existing.count++;
      if (existing.examples.length < 5) {
        existing.examples.push({
          glos: row.glos,
          w1: row.bentuk1,
          w2: row.bentuk2,
          ipa1: row.ipa1,
          ipa2: row.ipa2
        });
      }
      shiftRuleMap.set(key, existing);
    });
  });

  const meanSimilarityPct = validCount > 0 ? parseFloat((totalSim / validCount).toFixed(1)) : 0;

  // Urutkan aturan pergeseran fonem terpopuler
  const sortedRules = Array.from(shiftRuleMap.entries())
    .map(([ruleName, data]) => ({
      ruleName,
      formula: ruleName,
      count: data.count,
      percentage: validCount > 0 ? parseFloat(((data.count / validCount) * 100).toFixed(1)) : 0,
      examples: data.examples
    }))
    .sort((a, b) => b.count - a.count);

  const dominantShiftType = sortedRules.length > 0
    ? `${sortedRules[0].ruleName} (${sortedRules[0].count} kasus)`
    : 'Tidak ada pergeseran fonem mencolok (relatif homogen)';

  return {
    meanSimilarityPct,
    totalTested: validCount,
    totalShiftsDetected,
    identicalCount,
    highSimilarityCount,
    moderateVariationCount,
    lexicalDifferenceCount,
    dominantShiftType,
    topShiftRules: sortedRules,
    alignedWordResults
  };
}
