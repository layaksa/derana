import { DialectComparisonWordRow } from './dialectPointComparison';

export interface PhoneticShiftPattern {
  id: string;
  name: string;
  type: 'VOKAL' | 'KONSONAN' | 'ELISI_PENAMBAHAN' | 'STRUKTUR';
  fromSound: string;
  toSound: string;
  ruleFormula: string;
  description: string;
  frequency: number;
  percentage: number;
  regularity: 'Sangat Teratur' | 'Cukup Teratur' | 'Sporadis';
  examples: {
    glos: string;
    wordA: string;
    ipaA: string;
    wordB: string;
    ipaB: string;
    position: 'Awal' | 'Tengah' | 'Akhir' | 'Umum';
  }[];
}

export interface PhoneticAnalysisReport {
  totalGlossAnalyzed: number;
  totalShiftInstances: number;
  distinctPatternCount: number;
  dominantShiftType: string;
  patterns: PhoneticShiftPattern[];
  regularCorrespondenceIndex: number; // 0 - 100
  summaryDiagnosis: string;
}

/**
 * Normalisasi string kata untuk pencocokan fonem
 */
function cleanPhoneticString(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[\[\]\(\)\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Deteksi pergeseran fonem dan korespondensi bunyi secara otomatis
 */
export function detectPhoneticShifts(
  words: DialectComparisonWordRow[]
): PhoneticAnalysisReport {
  const validWords = words.filter(
    w => w.bentuk1 && w.bentuk2 && w.category !== 'BELUM_DIISI'
  );

  // Definition of sound correspondence detector rules
  const rules = [
    {
      id: 'vowel_a_to_o',
      name: 'Pergeseran Vokal Belakang /a/ ↔ /o/',
      type: 'VOKAL' as const,
      fromSound: '/a/',
      toSound: '/o/ [ɔ]',
      ruleFormula: '/a/ ↔ /o/ (terutama vokal terbuka akhir)',
      description: 'Pergeseran vokal terbuka rendah /a/ menjadi vokal bulat belakang sedang /o/ [ɔ], ciri pembeda khas Jawa (krama/ngoko) terhadap Sunda dan Melayu.',
      check: (w1: string, w2: string, ipa1: string, ipa2: string) => {
        // Cek akhir kata /a/ vs /o/ atau /ɔ/
        const endMatch = (w1.endsWith('a') && (w2.endsWith('o') || w2.endsWith('ɔ') || ipa2.includes('ɔ'))) ||
                         (w2.endsWith('a') && (w1.endsWith('o') || w1.endsWith('ɔ') || ipa1.includes('ɔ')));
        // Cek kandungan a vs o pada kata serupa
        const generalMatch = (w1.includes('a') && (w2.includes('o') || w2.includes('ɔ'))) &&
                             (w1.length === w2.length || Math.abs(w1.length - w2.length) <= 1);
        if (endMatch) return { match: true, pos: 'Akhir' as const };
        if (generalMatch) return { match: true, pos: 'Umum' as const };
        return { match: false, pos: 'Umum' as const };
      }
    },
    {
      id: 'consonant_r_to_l',
      name: 'Rotasime & Lamdasime /r/ ↔ /l/',
      type: 'KONSONAN' as const,
      fromSound: '/r/',
      toSound: '/l/',
      ruleFormula: '/r/ ↔ /l/ (Alternasi Cairan)',
      description: 'Korespondensi cairan alveolar (*liquid alternation*) yang sering membedakan dialek pesisir dan pedalaman dalam rumpun Austronesia.',
      check: (w1: string, w2: string) => {
        const hasR1 = w1.includes('r') && !w1.includes('l');
        const hasL2 = w2.includes('l') && !w2.includes('r');
        const hasR2 = w2.includes('r') && !w2.includes('l');
        const hasL1 = w1.includes('l') && !w1.includes('r');
        if ((hasR1 && hasL2) || (hasR2 && hasL1)) {
          return { match: true, pos: 'Tengah' as const };
        }
        return { match: false, pos: 'Umum' as const };
      }
    },
    {
      id: 'laryngeal_h_elision',
      name: 'Debukalisasi / Elisi Glotal /h/ ↔ /Ø/',
      type: 'ELISI_PENAMBAHAN' as const,
      fromSound: '/h/',
      toSound: 'Ø (Hilang)',
      ruleFormula: '/h/ ↔ Ø (Afiresis / Apokope Glotal)',
      description: 'Pelemahan laringal di mana konsonan frikatif glotal /h/ tereduksi menjadi nol (lenisi/elisi) pada posisi awal atau akhir kata (misal: hujan ↔ ujan, darah ↔ dara).',
      check: (w1: string, w2: string) => {
        const initialH = (w1.startsWith('h') && !w2.startsWith('h')) || (w2.startsWith('h') && !w1.startsWith('h'));
        const finalH = (w1.endsWith('h') && !w2.endsWith('h')) || (w2.endsWith('h') && !w1.endsWith('h'));
        if (initialH) return { match: true, pos: 'Awal' as const };
        if (finalH) return { match: true, pos: 'Akhir' as const };
        return { match: false, pos: 'Umum' as const };
      }
    },
    {
      id: 'vowel_u_to_o',
      name: 'Pergeseran Tinggi Vokal /u/ ↔ /o/',
      type: 'VOKAL' as const,
      fromSound: '/u/',
      toSound: '/o/',
      ruleFormula: '/u/ ↔ /o/ (Penurunan Vokal Belakang)',
      description: 'Penurunan vokal tertutup belakang /u/ menjadi vokal setengah tertutup /o/ pada suku kata akhir tertutup atau suku kata terbuka.',
      check: (w1: string, w2: string) => {
        if (w1.includes('u') && w2.includes('o') && !w1.includes('o') && !w2.includes('u')) {
          return { match: true, pos: 'Tengah' as const };
        }
        if (w2.includes('u') && w1.includes('o') && !w2.includes('o') && !w1.includes('u')) {
          return { match: true, pos: 'Tengah' as const };
        }
        return { match: false, pos: 'Umum' as const };
      }
    },
    {
      id: 'vowel_i_to_e',
      name: 'Pergeseran Vokal Depan /i/ ↔ /e/ [ɛ]',
      type: 'VOKAL' as const,
      fromSound: '/i/',
      toSound: '/e/ [ɛ]',
      ruleFormula: '/i/ ↔ /e/ (Penurunan Vokal Depan)',
      description: 'Penurunan tinggi lidah dari vokal tinggi depan /i/ ke vokal sedang /e/ [ɛ] (misal: mati ↔ mate, bibir ↔ biber).',
      check: (w1: string, w2: string) => {
        const endE = (w1.endsWith('i') && (w2.endsWith('e') || w2.endsWith('é'))) ||
                     (w2.endsWith('i') && (w1.endsWith('e') || w1.endsWith('é')));
        if (endE) return { match: true, pos: 'Akhir' as const };
        if ((w1.includes('i') && w2.includes('e') && !w1.includes('e')) ||
            (w2.includes('i') && w1.includes('e') && !w2.includes('e'))) {
          return { match: true, pos: 'Tengah' as const };
        }
        return { match: false, pos: 'Umum' as const };
      }
    },
    {
      id: 'pepet_schwa_to_a',
      name: 'Korespondensi Pepet /ə/ (e) ↔ /a/',
      type: 'VOKAL' as const,
      fromSound: '/ə/ (pepet)',
      toSound: '/a/',
      ruleFormula: '/ə/ ↔ /a/ (Refleks Proto-Austronesia *ə)',
      description: 'Perbedaan refleks fonem vokal sentral tengah *e pepet Proto-Austronesia yang dipertahankan dalam Sunda/Jawa (/ə/), namun menjadi /a/ dalam dialek tertentu.',
      check: (w1: string, w2: string) => {
        if ((w1.includes('e') && w2.includes('a') && !w1.includes('a')) ||
            (w2.includes('e') && w1.includes('a') && !w2.includes('a'))) {
          return { match: true, pos: 'Awal' as const };
        }
        return { match: false, pos: 'Umum' as const };
      }
    },
    {
      id: 'glottal_stop_k_to_q',
      name: 'Glotalisasi Konsonan Koda /k/ ↔ /ʔ/ [k̚]',
      type: 'KONSONAN' as const,
      fromSound: '/k/',
      toSound: '/ʔ/ (Hamzah / Glotal Stop)',
      ruleFormula: '/k/ ↔ [ʔ] (di koda silaba)',
      description: 'Oklusi glotal bunyi hambat velar koda tak bersuara /k/ menjadi hamzah [ʔ] pada akhir morfem (misal: anak [anaʔ], budak [budaʔ]).',
      check: (w1: string, w2: string, ipa1: string, ipa2: string) => {
        const hasGlottal1 = ipa1.includes('ʔ') || w1.endsWith('\'');
        const hasGlottal2 = ipa2.includes('ʔ') || w2.endsWith('\'');
        const endsWithK1 = w1.endsWith('k');
        const endsWithK2 = w2.endsWith('k');
        if ((endsWithK1 && hasGlottal2) || (endsWithK2 && hasGlottal1)) {
          return { match: true, pos: 'Akhir' as const };
        }
        return { match: false, pos: 'Umum' as const };
      }
    },
    {
      id: 'sibilant_s_to_h',
      name: 'Debukalisasi Sibilan /s/ ↔ /h/',
      type: 'KONSONAN' as const,
      fromSound: '/s/',
      toSound: '/h/',
      ruleFormula: '/s/ ↔ /h/ (Sibilant Weakening)',
      description: 'Pelemahan bunyi desis sibilan /s/ menjadi desah laringal /h/ (misal: satu ↔ hatu, siang ↔ hiang).',
      check: (w1: string, w2: string) => {
        if ((w1.startsWith('s') && w2.startsWith('h')) || (w2.startsWith('s') && w1.startsWith('h'))) {
          return { match: true, pos: 'Awal' as const };
        }
        if ((w1.includes('s') && w2.includes('h') && !w1.includes('h') && !w2.includes('s')) ||
            (w2.includes('s') && w1.includes('h') && !w2.includes('h') && !w1.includes('s'))) {
          return { match: true, pos: 'Tengah' as const };
        }
        return { match: false, pos: 'Umum' as const };
      }
    },
    {
      id: 'nasal_alternation',
      name: 'Alternasi Prefiks Nasal /ŋ/ (ng-) ↔ /n/ atau /m/',
      type: 'STRUKTUR' as const,
      fromSound: 'Nasal Alveolar /n/',
      toSound: 'Nasal Velar /ŋ/ (ng-)',
      ruleFormula: 'Prefiks Nasal /n-/ ↔ /ŋ-/',
      description: 'Variasi nasalisasi morfofonemik pembentuk verba aktif antardialek (misal: nginum vs minum, ngadahar vs neda).',
      check: (w1: string, w2: string) => {
        const ng1 = w1.startsWith('ng') && !w2.startsWith('ng') && (w2.startsWith('m') || w2.startsWith('n'));
        const ng2 = w2.startsWith('ng') && !w1.startsWith('ng') && (w1.startsWith('m') || w1.startsWith('n'));
        if (ng1 || ng2) {
          return { match: true, pos: 'Awal' as const };
        }
        return { match: false, pos: 'Umum' as const };
      }
    }
  ];

  // Collect matches for each rule
  const detectedPatterns: PhoneticShiftPattern[] = [];
  let totalShiftInstances = 0;

  rules.forEach(rule => {
    const examples: PhoneticShiftPattern['examples'] = [];

    validWords.forEach(word => {
      const w1 = cleanPhoneticString(word.bentuk1);
      const w2 = cleanPhoneticString(word.bentuk2);
      const ipa1 = cleanPhoneticString(word.ipa1);
      const ipa2 = cleanPhoneticString(word.ipa2);

      const res = rule.check(w1, w2, ipa1, ipa2);
      if (res.match) {
        examples.push({
          glos: word.glos,
          wordA: word.bentuk1,
          ipaA: word.ipa1 || `[${word.bentuk1}]`,
          wordB: word.bentuk2,
          ipaB: word.ipa2 || `[${word.bentuk2}]`,
          position: res.pos
        });
      }
    });

    if (examples.length > 0) {
      const frequency = examples.length;
      totalShiftInstances += frequency;
      const percentage = validWords.length > 0 
        ? Math.round((frequency / validWords.length) * 1000) / 10 
        : 0;

      let regularity: PhoneticShiftPattern['regularity'] = 'Sporadis';
      if (percentage >= 15 || frequency >= 12) {
        regularity = 'Sangat Teratur';
      } else if (percentage >= 6 || frequency >= 4) {
        regularity = 'Cukup Teratur';
      }

      detectedPatterns.push({
        id: rule.id,
        name: rule.name,
        type: rule.type,
        fromSound: rule.fromSound,
        toSound: rule.toSound,
        ruleFormula: rule.ruleFormula,
        description: rule.description,
        frequency,
        percentage,
        regularity,
        examples: examples.slice(0, 15) // limit top 15 examples
      });
    }
  });

  // Sort by frequency descending
  detectedPatterns.sort((a, b) => b.frequency - a.frequency);

  // Compute regularity index
  const highRegularCount = detectedPatterns.filter(p => p.regularity === 'Sangat Teratur').length;
  const regularCorrespondenceIndex = Math.min(
    100,
    Math.round((detectedPatterns.reduce((acc, p) => acc + p.frequency, 0) / Math.max(1, validWords.length)) * 100)
  );

  let dominantShiftType = 'Vokal & Sibilan';
  if (detectedPatterns.length > 0) {
    dominantShiftType = detectedPatterns[0].name;
  }

  let summaryDiagnosis = '';
  if (highRegularCount >= 2) {
    summaryDiagnosis = `Ditemukan ${highRegularCount} pola korespondensi bunyi teratur berfrekuensi tinggi. Hal ini mengindikasikan adanya hubungan kekerabatan genetik langsung (*cognacy*) dengan hukum bunyi (*sound laws*) yang konsisten.`;
  } else if (detectedPatterns.length > 0) {
    summaryDiagnosis = `Ditemukan ${detectedPatterns.length} variasi pergeseran fonetik sporadis hingga moderat. Variasi didominasi oleh ${dominantShiftType}.`;
  } else {
    summaryDiagnosis = `Tidak ditemukan korespondensi bunyi teratur yang signifikan. Variasi leksikal didominasi oleh penggantian etimon penuh (kata dasar berbeda).`;
  }

  return {
    totalGlossAnalyzed: validWords.length,
    totalShiftInstances,
    distinctPatternCount: detectedPatterns.length,
    dominantShiftType,
    patterns: detectedPatterns,
    regularCorrespondenceIndex,
    summaryDiagnosis
  };
}
