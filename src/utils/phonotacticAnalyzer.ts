import { KosakataItem } from '../types/linguistic';

export interface SyllableUnit {
  syllable: string;
  pattern: string; // e.g. "KV", "KVK", "V", "VK", "KKV", "KKVK", "KVKK"
  onset: string;
  nucleus: string;
  coda: string;
  isOpen: boolean;
  positionInWord: 'initial' | 'medial' | 'final' | 'monosyllabic';
}

export interface AnalyzedWordPhonotactic {
  id: string | number;
  glos: string;
  rawWord: string;
  cleanedWord: string;
  ipa: string;
  syllables: SyllableUnit[];
  wordPattern: string; // e.g. "KV-KVK"
  syllableCount: number;
  syllableType: 'Monosilabel' | 'Disilabel' | 'Trisilabel' | 'Polisilabel';
  canonicalType: boolean; // Disilabel kanonik Austronesia
}

export interface PhonemeFrequencyItem {
  phoneme: string;
  ipaSymbol: string;
  type: 'VOKAL' | 'KONSONAN';
  articulationClass: string;
  count: number;
  percentage: number;
  positions: {
    initial: number;
    medial: number;
    final: number;
  };
}

export interface SyllablePatternStat {
  pattern: string;
  count: number;
  percentage: number;
  description: string;
  examples: { glos: string; word: string; syllable: string }[];
}

export interface PhonotacticSummaryReport {
  totalWordsAnalyzed: number;
  totalSyllables: number;
  totalPhonemes: number;
  consonantVowelRatio: number; // Rasio K : V
  openSyllableCount: number;
  openSyllablePct: number;
  closedSyllableCount: number;
  closedSyllablePct: number;
  syllableCountDistribution: {
    monosyllable: { count: number; pct: number };
    disyllable: { count: number; pct: number };
    trisyllable: { count: number; pct: number };
    polysyllable: { count: number; pct: number };
  };
  averageSyllablesPerWord: number;
  syllablePatterns: SyllablePatternStat[];
  vowels: PhonemeFrequencyItem[];
  consonants: PhonemeFrequencyItem[];
  commonFinalCodas: { coda: string; count: number; pct: number }[];
  consonantClusters: { cluster: string; count: number; examples: string[] }[];
  analyzedWords: AnalyzedWordPhonotactic[];
  diagnosisDescription: string;
}

// Articulatory classifications for Austronesian phonemes
const PHONEME_ARTICULATION_MAP: Record<string, { type: 'VOKAL' | 'KONSONAN'; ipa: string; class: string }> = {
  // Vokalis
  'a': { type: 'VOKAL', ipa: '[a]', class: 'Vokal Rendah Tengah Terbuka' },
  'i': { type: 'VOKAL', ipa: '[i]', class: 'Vokal Tinggi Depan Tertutup' },
  'u': { type: 'VOKAL', ipa: '[u]', class: 'Vokal Tinggi Belakang Bulat' },
  'e': { type: 'VOKAL', ipa: '[e] / [ɛ]', class: 'Vokal Sedang Depan' },
  'o': { type: 'VOKAL', ipa: '[o] / [ɔ]', class: 'Vokal Sedang Belakang Bulat' },
  'ə': { type: 'VOKAL', ipa: '[ə]', class: 'Vokal Pepet (Madya Tengah)' },
  'eu': { type: 'VOKAL', ipa: '[ɯ]', class: 'Vokal Tinggi Belakang Tak Bulat (Sunda)' },
  'ɯ': { type: 'VOKAL', ipa: '[ɯ]', class: 'Vokal Tinggi Belakang Tak Bulat' },
  'ɔ': { type: 'VOKAL', ipa: '[ɔ]', class: 'Vokal Setengah Terbuka Belakang' },
  'ɛ': { type: 'VOKAL', ipa: '[ɛ]', class: 'Vokal Setengah Terbuka Depan' },

  // Konsonan Letup / Plosif
  'p': { type: 'KONSONAN', ipa: '[p]', class: 'Letup Bilabial Tak Bersuara' },
  'b': { type: 'KONSONAN', ipa: '[b]', class: 'Letup Bilabial Bersuara' },
  't': { type: 'KONSONAN', ipa: '[t]', class: 'Letup Dental/Alveolar Tak Bersuara' },
  'd': { type: 'KONSONAN', ipa: '[d]', class: 'Letup Dental/Alveolar Bersuara' },
  'k': { type: 'KONSONAN', ipa: '[k]', class: 'Letup Velar Tak Bersuara' },
  'g': { type: 'KONSONAN', ipa: '[g]', class: 'Letup Velar Bersuara' },
  'ʔ': { type: 'KONSONAN', ipa: '[ʔ]', class: 'Letup Glotal (Hamzah)' },

  // Konsonan Sengau / Nasal
  'm': { type: 'KONSONAN', ipa: '[m]', class: 'Nasal Bilabial' },
  'n': { type: 'KONSONAN', ipa: '[n]', class: 'Nasal Alveolar' },
  'ng': { type: 'KONSONAN', ipa: '[ŋ]', class: 'Nasal Velar' },
  'ŋ': { type: 'KONSONAN', ipa: '[ŋ]', class: 'Nasal Velar' },
  'ny': { type: 'KONSONAN', ipa: '[ɲ]', class: 'Nasal Palatal' },
  'ɲ': { type: 'KONSONAN', ipa: '[ɲ]', class: 'Nasal Palatal' },

  // Konsonan Geser / Frikatif
  's': { type: 'KONSONAN', ipa: '[s]', class: 'Frikatif Alveolar Tak Bersuara' },
  'h': { type: 'KONSONAN', ipa: '[h]', class: 'Frikatif Glotal' },
  'f': { type: 'KONSONAN', ipa: '[f]', class: 'Frikatif Labiodental' },
  'v': { type: 'KONSONAN', ipa: '[v]', class: 'Frikatif Labiodental Bersuara' },
  'z': { type: 'KONSONAN', ipa: '[z]', class: 'Frikatif Alveolar Bersuara' },
  'sy': { type: 'KONSONAN', ipa: '[ʃ]', class: 'Frikatif Pasca-Alveolar' },
  'kh': { type: 'KONSONAN', ipa: '[x]', class: 'Frikatif Velar' },

  // Konsonan Paduan / Afrikasi
  'c': { type: 'KONSONAN', ipa: '[tʃ]', class: 'Afrikat Palatal Tak Bersuara' },
  'j': { type: 'KONSONAN', ipa: '[dʒ]', class: 'Afrikat Palatal Bersuara' },
  'dh': { type: 'KONSONAN', ipa: '[d̪] / [dʰ]', class: 'Letup Dental Tebal (Jawa)' },
  'th': { type: 'KONSONAN', ipa: '[t̪] / [tʰ]', class: 'Letup Dental Tebal (Jawa)' },

  // Likuida / Getar & Sampingan
  'r': { type: 'KONSONAN', ipa: '[r]', class: 'Getar Alveolar (Trill)' },
  'l': { type: 'KONSONAN', ipa: '[l]', class: 'Lateral Alveolar' },

  // Semivokal / Luncuran
  'w': { type: 'KONSONAN', ipa: '[w]', class: 'Semivokal Labial-Velar' },
  'y': { type: 'KONSONAN', ipa: '[j]', class: 'Semivokal Palatal' }
};

// Valid onset clusters in Indonesian regional languages
const VALID_ONSET_CLUSTERS = new Set([
  'pr', 'pl', 'br', 'bl', 'tr', 'dr', 'kr', 'kl', 'gr', 'gl', 'mr', 'ml', 'sp', 'st', 'sk', 'sw', 'ng'
]);

// Pattern descriptions
const PATTERN_DESCRIPTIONS: Record<string, string> = {
  'KV': 'Silabel Terbuka Kanonis (Konsonan-Vokal) - Pola paling dominan di rumpun Austronesia',
  'KVK': 'Silabel Tertutup Kanonis (Konsonan-Vokal-Konsonan)',
  'V': 'Silabel Terbuka Vokal Tunggal (Nukleus tanpa Onset & Koda)',
  'VK': 'Silabel Tertutup Berawalan Vokal (Vokal-Konsonan)',
  'KKV': 'Silabel Terbuka Berklaster Onset (Gugus Konsonan-Vokal)',
  'KKVK': 'Silabel Tertutup Berklaster Onset (Gugus Konsonan-Vokal-Konsonan)',
  'KVKK': 'Silabel Tertutup Berklaster Koda (Konsonan-Vokal-Gugus Koda)',
  'KKVKK': 'Silabel Kompleks Berklaster Ganda (Onset & Koda)',
  'VKK': 'Silabel Berawalan Vokal dengan Gugus Koda'
};

/**
 * Normalisasi kata: ambil varian pertama jika ada tanda garis miring,
 * hilangkan tanda kurung, angka, dan karakter bukan fonem.
 */
export function cleanPhoneticWord(raw: string): string {
  if (!raw) return '';
  // Ambil varian pertama sebelum tanda miring atau tanda koma
  let clean = raw.split('/')[0].split(',')[0].toLowerCase().trim();
  // Buang tanda kurung dan isinya jika ada keterangan misal: dahar (loma)
  clean = clean.replace(/\(.*?\)/g, '');
  // Buang simbol transkripsi kurung siku IPA
  clean = clean.replace(/[\[\]]/g, '');
  // Buang tanda baca
  clean = clean.replace(/[^a-zà-ÿɯəʔŋɲʃ]/g, '').trim();
  return clean;
}

/**
 * Tokenisasi kata menjadi urutan fonem (menggabungkan digraf seperti ng, ny, sy, kh, eu, dh, th)
 */
function tokenizePhonemes(word: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < word.length) {
    // Periksa digraf 2-karakter
    if (i + 1 < word.length) {
      const two = word.slice(i, i + 2);
      if (['ng', 'ny', 'sy', 'kh', 'eu', 'dh', 'th'].includes(two)) {
        tokens.push(two);
        i += 2;
        continue;
      }
    }
    tokens.push(word[i]);
    i++;
  }
  return tokens;
}

/**
 * Menentukan apakah sebuah fonem adalah vokal
 */
function isVowel(phoneme: string): boolean {
  if (['a', 'i', 'u', 'e', 'o', 'ə', 'eu', 'ɯ', 'ɔ', 'ɛ', 'é', 'è', 'ê'].includes(phoneme)) {
    return true;
  }
  return PHONEME_ARTICULATION_MAP[phoneme]?.type === 'VOKAL';
}

/**
 * Algoritma Silabifikasi Fonologis untuk Bahasa-Bahasa Nusantara
 * Berbasis Prinsip Onset Maksimal (Maximal Onset Principle) dengan penyesuaian fonotaktik Austronesia
 */
export function syllabifyWord(cleanedWord: string): SyllableUnit[] {
  if (!cleanedWord) return [];

  const tokens = tokenizePhonemes(cleanedWord);
  if (tokens.length === 0) return [];

  // Temukan indeks semua vokal (nukleus silabel)
  const vowelIndices: number[] = [];
  tokens.forEach((t, idx) => {
    if (isVowel(t)) vowelIndices.push(idx);
  });

  // Jika kata tidak memiliki vokal sama sekali (misal singkatan/onomatopoeia), anggap satu kesatuan
  if (vowelIndices.length === 0) {
    return [{
      syllable: cleanedWord,
      pattern: tokens.map(() => 'K').join(''),
      onset: cleanedWord,
      nucleus: '',
      coda: '',
      isOpen: false,
      positionInWord: 'monosyllabic'
    }];
  }

  // Tentukan titik pemisah silabel (cut points)
  // cutPoints[k] adalah batas awal suku kata ke-k (0 adalah awal kata)
  const cutPoints: number[] = [0];

  for (let v = 0; v < vowelIndices.length - 1; v++) {
    const v1 = vowelIndices[v];
    const v2 = vowelIndices[v + 1];
    const interveningConsonants = v2 - v1 - 1;

    if (interveningConsonants === 0) {
      // Dua vokal berdampingan (Hiatus vokal, misal: da-un, ca-i, a-ir)
      cutPoints.push(v2);
    } else if (interveningConsonants === 1) {
      // 1 konsonan di antara dua vokal: V.KV (Onset maksimal, misal: ma-ta, ba-tu, a-ku)
      cutPoints.push(v1 + 1);
    } else if (interveningConsonants === 2) {
      // 2 konsonan di antara dua vokal:
      // Periksa apakah kedua konsonan membentuk gugus onset yang sah (misal pr, tr, br, mr)
      const c1 = tokens[v1 + 1];
      const c2 = tokens[v1 + 2];
      const cluster = c1 + c2;

      if (VALID_ONSET_CLUSTERS.has(cluster)) {
        // V.CCV (misal: mri-pat, pra-hu)
        cutPoints.push(v1 + 1);
      } else {
        // VC.CV (misal: tam-pan, am-bil, pan-jang)
        cutPoints.push(v1 + 2);
      }
    } else {
      // 3 konsonan atau lebih di antara dua vokal: pisahkan di c2 (VC.CCV atau VCC.CV)
      cutPoints.push(v1 + 2);
    }
  }

  // Bangun potongan suku kata berdasarkan cutPoints
  const syllables: SyllableUnit[] = [];
  for (let s = 0; s < cutPoints.length; s++) {
    const startIdx = cutPoints[s];
    const endIdx = s + 1 < cutPoints.length ? cutPoints[s + 1] : tokens.length;
    const sylTokens = tokens.slice(startIdx, endIdx);
    const sylStr = sylTokens.join('');

    // Analisis Onset - Nucleus - Coda
    let onset = '';
    let nucleus = '';
    let coda = '';

    let state: 'ONSET' | 'NUCLEUS' | 'CODA' = 'ONSET';

    for (const t of sylTokens) {
      if (isVowel(t)) {
        state = 'NUCLEUS';
        nucleus += t;
      } else {
        if (state === 'ONSET') {
          onset += t;
        } else {
          state = 'CODA';
          coda += t;
        }
      }
    }

    // Bangun pola fonotaktik silabel (K dan V)
    let pattern = '';
    if (onset) {
      // Jika onset terdiri dari gugus konsonan
      const onsetTokens = tokenizePhonemes(onset);
      pattern += 'K'.repeat(Math.max(1, onsetTokens.length));
    }
    if (nucleus) {
      pattern += 'V';
    }
    if (coda) {
      const codaTokens = tokenizePhonemes(coda);
      pattern += 'K'.repeat(Math.max(1, codaTokens.length));
    }

    // Posisi silabel dalam kata
    let positionInWord: SyllableUnit['positionInWord'] = 'medial';
    if (cutPoints.length === 1) {
      positionInWord = 'monosyllabic';
    } else if (s === 0) {
      positionInWord = 'initial';
    } else if (s === cutPoints.length - 1) {
      positionInWord = 'final';
    }

    syllables.push({
      syllable: sylStr,
      pattern: pattern || 'V',
      onset,
      nucleus,
      coda,
      isOpen: coda.length === 0,
      positionInWord
    });
  }

  return syllables;
}

/**
 * Analisis Fonotaktik Lengkap untuk Kumpulan Kosakata Swadesh
 */
export function analyzePhonotactics(
  swadeshList: KosakataItem[]
): PhonotacticSummaryReport {
  const validItems = swadeshList.filter(item => item.bentukLokal && item.bentukLokal.trim() !== '');
  
  const analyzedWords: AnalyzedWordPhonotactic[] = [];
  const syllablePatternFreq: Record<string, { count: number; examples: { glos: string; word: string; syllable: string }[] }> = {};
  const phonemeFreq: Record<string, { type: 'VOKAL' | 'KONSONAN'; count: number; initial: number; medial: number; final: number }> = {};
  const finalCodaFreq: Record<string, number> = {};
  const clusterFreq: Record<string, { count: number; examples: string[] }> = {};

  let totalSyllables = 0;
  let totalPhonemes = 0;
  let totalConsonants = 0;
  let totalVowels = 0;
  let openSyllableCount = 0;
  let closedSyllableCount = 0;

  const syllableLengthCount = {
    monosyllable: 0,
    disyllable: 0,
    trisyllable: 0,
    polysyllable: 0
  };

  validItems.forEach(item => {
    const cleaned = cleanPhoneticWord(item.bentukLokal);
    if (!cleaned) return;

    const syllables = syllabifyWord(cleaned);
    const syllableCount = syllables.length;

    // Klasifikasi panjang silabel
    if (syllableCount === 1) syllableLengthCount.monosyllable++;
    else if (syllableCount === 2) syllableLengthCount.disyllable++;
    else if (syllableCount === 3) syllableLengthCount.trisyllable++;
    else syllableLengthCount.polysyllable++;

    const wordPattern = syllables.map(s => s.pattern).join('-');
    const syllableType = syllableCount === 1 
      ? 'Monosilabel' 
      : syllableCount === 2 
      ? 'Disilabel' 
      : syllableCount === 3 
      ? 'Trisilabel' 
      : 'Polisilabel';

    analyzedWords.push({
      id: item.id,
      glos: item.glosIndonesia,
      rawWord: item.bentukLokal,
      cleanedWord: cleaned,
      ipa: item.transkripsiIPA || `[${cleaned}]`,
      syllables,
      wordPattern,
      syllableCount,
      syllableType,
      canonicalType: syllableCount === 2
    });

    totalSyllables += syllables.length;

    // Catat statistik untuk tiap silabel
    syllables.forEach((syl, sylIdx) => {
      // Pola silabel (KV, KVK, V, VK, dll)
      if (!syllablePatternFreq[syl.pattern]) {
        syllablePatternFreq[syl.pattern] = { count: 0, examples: [] };
      }
      syllablePatternFreq[syl.pattern].count++;
      if (syllablePatternFreq[syl.pattern].examples.length < 5) {
        syllablePatternFreq[syl.pattern].examples.push({
          glos: item.glosIndonesia,
          word: cleaned,
          syllable: syl.syllable
        });
      }

      // Terbuka vs Tertutup
      if (syl.isOpen) {
        openSyllableCount++;
      } else {
        closedSyllableCount++;
        // Koda akhir kata (pada suku kata terakhir)
        if (sylIdx === syllables.length - 1 && syl.coda) {
          finalCodaFreq[syl.coda] = (finalCodaFreq[syl.coda] || 0) + 1;
        }
      }

      // Gugus konsonan onset (KKV / KKVK)
      if (syl.onset.length > 1 && !['ng', 'ny', 'sy', 'kh', 'dh', 'th'].includes(syl.onset)) {
        if (!clusterFreq[syl.onset]) {
          clusterFreq[syl.onset] = { count: 0, examples: [] };
        }
        clusterFreq[syl.onset].count++;
        if (clusterFreq[syl.onset].examples.length < 3) {
          clusterFreq[syl.onset].examples.push(`${cleaned} (${item.glosIndonesia})`);
        }
      }
    });

    // Catat frekuensi fonem individu & posisinya
    const wordTokens = tokenizePhonemes(cleaned);
    totalPhonemes += wordTokens.length;

    wordTokens.forEach((phoneme, pIdx) => {
      const isV = isVowel(phoneme);
      if (isV) totalVowels++;
      else totalConsonants++;

      if (!phonemeFreq[phoneme]) {
        phonemeFreq[phoneme] = {
          type: isV ? 'VOKAL' : 'KONSONAN',
          count: 0,
          initial: 0,
          medial: 0,
          final: 0
        };
      }
      phonemeFreq[phoneme].count++;

      if (pIdx === 0) phonemeFreq[phoneme].initial++;
      else if (pIdx === wordTokens.length - 1) phonemeFreq[phoneme].final++;
      else phonemeFreq[phoneme].medial++;
    });
  });

  const totalWords = analyzedWords.length || 1;
  const safeTotalSyllables = totalSyllables || 1;
  const safeTotalPhonemes = totalPhonemes || 1;

  // Bangun daftar pola silabel terurut
  const syllablePatterns: SyllablePatternStat[] = Object.entries(syllablePatternFreq)
    .map(([pattern, data]) => ({
      pattern,
      count: data.count,
      percentage: Math.round((data.count / safeTotalSyllables) * 1000) / 10,
      description: PATTERN_DESCRIPTIONS[pattern] || `Silabel struktur ${pattern}`,
      examples: data.examples
    }))
    .sort((a, b) => b.count - a.count);

  // Bangun daftar frekuensi vokal
  const vowels: PhonemeFrequencyItem[] = Object.entries(phonemeFreq)
    .filter(([_, data]) => data.type === 'VOKAL')
    .map(([phoneme, data]) => {
      const meta = PHONEME_ARTICULATION_MAP[phoneme];
      return {
        phoneme,
        ipaSymbol: meta?.ipa || `[${phoneme}]`,
        type: 'VOKAL' as const,
        articulationClass: meta?.class || 'Vokal',
        count: data.count,
        percentage: Math.round((data.count / safeTotalPhonemes) * 1000) / 10,
        positions: {
          initial: data.initial,
          medial: data.medial,
          final: data.final
        }
      };
    })
    .sort((a, b) => b.count - a.count);

  // Bangun daftar frekuensi konsonan
  const consonants: PhonemeFrequencyItem[] = Object.entries(phonemeFreq)
    .filter(([_, data]) => data.type === 'KONSONAN')
    .map(([phoneme, data]) => {
      const meta = PHONEME_ARTICULATION_MAP[phoneme];
      return {
        phoneme,
        ipaSymbol: meta?.ipa || `[${phoneme}]`,
        type: 'KONSONAN' as const,
        articulationClass: meta?.class || 'Konsonan',
        count: data.count,
        percentage: Math.round((data.count / safeTotalPhonemes) * 1000) / 10,
        positions: {
          initial: data.initial,
          medial: data.medial,
          final: data.final
        }
      };
    })
    .sort((a, b) => b.count - a.count);

  // Koda akhir terfavorit
  const totalCodas = Object.values(finalCodaFreq).reduce((a, b) => a + b, 0) || 1;
  const commonFinalCodas = Object.entries(finalCodaFreq)
    .map(([coda, count]) => ({
      coda,
      count,
      pct: Math.round((count / totalCodas) * 1000) / 10
    }))
    .sort((a, b) => b.count - a.count);

  // Gugus konsonan
  const consonantClusters = Object.entries(clusterFreq)
    .map(([cluster, data]) => ({
      cluster,
      count: data.count,
      examples: data.examples
    }))
    .sort((a, b) => b.count - a.count);

  // Persentase panjang kata
  const syllableCountDistribution = {
    monosyllable: {
      count: syllableLengthCount.monosyllable,
      pct: Math.round((syllableLengthCount.monosyllable / totalWords) * 1000) / 10
    },
    disyllable: {
      count: syllableLengthCount.disyllable,
      pct: Math.round((syllableLengthCount.disyllable / totalWords) * 1000) / 10
    },
    trisyllable: {
      count: syllableLengthCount.trisyllable,
      pct: Math.round((syllableLengthCount.trisyllable / totalWords) * 1000) / 10
    },
    polysyllable: {
      count: syllableLengthCount.polysyllable,
      pct: Math.round((syllableLengthCount.polysyllable / totalWords) * 1000) / 10
    }
  };

  // Rasio C : V
  const consonantVowelRatio = totalVowels > 0 
    ? Math.round((totalConsonants / totalVowels) * 100) / 100 
    : 1.0;

  // Rasio silabel terbuka vs tertutup
  const openSyllablePct = Math.round((openSyllableCount / safeTotalSyllables) * 1000) / 10;
  const closedSyllablePct = Math.round((closedSyllableCount / safeTotalSyllables) * 1000) / 10;
  const avgSyllables = Math.round((totalSyllables / totalWords) * 100) / 100;

  // Susun deskripsi ringkasan diagnosis fonotaktik
  const dominantPattern = syllablePatterns[0]?.pattern || 'KV';
  const dominantVowel = vowels[0]?.phoneme || 'a';
  const dominantConsonant = consonants[0]?.phoneme || 'n';
  const disyllabicPct = syllableCountDistribution.disyllable.pct;

  let diagnosisDescription = `Tipologi fonotaktis didominasi oleh kata disilabel (${disyllabicPct}%) yang mencerminkan profil khas leksikon Austronesia purba. `;
  diagnosisDescription += `Pola silabel yang paling produktif adalah '${dominantPattern}' (${syllablePatterns[0]?.percentage || 0}%), dengan perbandingan silabel terbuka ${openSyllablePct}% dan tertutup ${closedSyllablePct}%. `;
  diagnosisDescription += `Vokal dengan frekuensi tertinggi adalah /${dominantVowel}/ (${vowels[0]?.percentage || 0}%) dan konsonan paling sering muncul adalah /${dominantConsonant}/ (${consonants[0]?.percentage || 0}%). `;
  
  if (commonFinalCodas.length > 0) {
    diagnosisDescription += `Koda penutup akhir kata paling umum adalah /${commonFinalCodas[0].coda}/ (${commonFinalCodas[0].pct}%).`;
  }

  return {
    totalWordsAnalyzed: analyzedWords.length,
    totalSyllables,
    totalPhonemes,
    consonantVowelRatio,
    openSyllableCount,
    openSyllablePct,
    closedSyllableCount,
    closedSyllablePct,
    syllableCountDistribution,
    averageSyllablesPerWord: avgSyllables,
    syllablePatterns,
    vowels,
    consonants,
    commonFinalCodas,
    consonantClusters,
    analyzedWords,
    diagnosisDescription
  };
}
