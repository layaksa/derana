import { SurveyRecord, KosakataLengkapData } from '../types/linguistic';
import { GlottoLanguageEntry } from '../components/sections/GlotokronologiHeatmap';
import { LanguageLeafItem } from './phylogeneticTreeEngine';

// Baseline Austronesian lexical difference matrix (d% = 100 - C%)
// Grounded in lexicostatistical literature for Indonesian languages (Keraf 1984, Dyen 1965, Blust 2013)
const BENCHMARK_LEXICAL_DIFFERENCES: Record<string, Record<string, number>> = {
  'sunda': {
    'sunda': 0,
    'jawa': 28.5,
    'madura': 34.2,
    'melayu': 36.8,
    'bali': 38.5,
    'sasak': 41.2,
    'minangkabau': 37.4,
    'batak': 46.5,
    'bugis': 54.0,
    'makassar': 56.5,
    'banjar': 39.0,
    'aceh': 48.0,
    'lampung': 43.5,
    'betawi': 22.0
  },
  'jawa': {
    'sunda': 28.5,
    'jawa': 0,
    'madura': 31.0,
    'melayu': 39.5,
    'bali': 32.4,
    'sasak': 35.0,
    'minangkabau': 42.0,
    'batak': 49.0,
    'bugis': 55.5,
    'makassar': 58.0,
    'banjar': 41.5,
    'aceh': 51.0,
    'lampung': 45.0,
    'betawi': 29.0
  },
  'madura': {
    'sunda': 34.2,
    'jawa': 31.0,
    'madura': 0,
    'melayu': 41.0,
    'bali': 36.0,
    'sasak': 38.5,
    'minangkabau': 43.5,
    'batak': 52.0,
    'bugis': 57.0,
    'makassar': 59.0,
    'banjar': 43.0,
    'aceh': 53.0,
    'lampung': 47.0,
    'betawi': 33.0
  },
  'bali': {
    'sunda': 38.5,
    'jawa': 32.4,
    'madura': 36.0,
    'melayu': 42.0,
    'bali': 0,
    'sasak': 22.8,
    'minangkabau': 44.0,
    'batak': 53.0,
    'bugis': 56.0,
    'makassar': 57.5,
    'banjar': 44.5,
    'aceh': 54.0,
    'lampung': 48.0,
    'betawi': 37.0
  },
  'sasak': {
    'sunda': 41.2,
    'jawa': 35.0,
    'madura': 38.5,
    'melayu': 43.5,
    'bali': 22.8,
    'sasak': 0,
    'minangkabau': 45.0,
    'batak': 55.0,
    'bugis': 57.0,
    'makassar': 58.0,
    'banjar': 45.0,
    'aceh': 56.0,
    'lampung': 49.5,
    'betawi': 39.0
  },
  'melayu': {
    'sunda': 36.8,
    'jawa': 39.5,
    'madura': 41.0,
    'melayu': 0,
    'bali': 42.0,
    'sasak': 43.5,
    'minangkabau': 18.5,
    'batak': 44.0,
    'bugis': 53.0,
    'makassar': 55.0,
    'banjar': 24.5,
    'aceh': 42.0,
    'lampung': 38.0,
    'betawi': 16.5
  },
  'minangkabau': {
    'sunda': 37.4,
    'jawa': 42.0,
    'madura': 43.5,
    'melayu': 18.5,
    'bali': 44.0,
    'sasak': 45.0,
    'minangkabau': 0,
    'batak': 46.0,
    'bugis': 54.5,
    'makassar': 56.0,
    'banjar': 26.0,
    'aceh': 44.0,
    'lampung': 40.0,
    'betawi': 21.0
  },
  'betawi': {
    'sunda': 22.0,
    'jawa': 29.0,
    'madura': 33.0,
    'melayu': 16.5,
    'bali': 37.0,
    'sasak': 39.0,
    'minangkabau': 21.0,
    'batak': 45.0,
    'bugis': 53.5,
    'makassar': 55.0,
    'banjar': 25.0,
    'aceh': 45.0,
    'lampung': 37.0,
    'betawi': 0
  },
  'bugis': {
    'sunda': 54.0,
    'jawa': 55.5,
    'madura': 57.0,
    'melayu': 53.0,
    'bali': 56.0,
    'sasak': 57.0,
    'minangkabau': 54.5,
    'batak': 60.0,
    'bugis': 0,
    'makassar': 26.0,
    'banjar': 52.0,
    'aceh': 59.0,
    'lampung': 56.0,
    'betawi': 53.5
  },
  'makassar': {
    'sunda': 56.5,
    'jawa': 58.0,
    'madura': 59.0,
    'melayu': 55.0,
    'bali': 57.5,
    'sasak': 58.0,
    'minangkabau': 56.0,
    'batak': 62.0,
    'bugis': 26.0,
    'makassar': 0,
    'banjar': 54.0,
    'aceh': 61.0,
    'lampung': 58.0,
    'betawi': 55.0
  },
  'banjar': {
    'sunda': 39.0,
    'jawa': 41.5,
    'madura': 43.0,
    'melayu': 24.5,
    'bali': 44.5,
    'sasak': 45.0,
    'minangkabau': 26.0,
    'batak': 48.0,
    'bugis': 52.0,
    'makassar': 54.0,
    'banjar': 0,
    'aceh': 47.0,
    'lampung': 42.0,
    'betawi': 25.0
  },
  'aceh': {
    'sunda': 48.0,
    'jawa': 51.0,
    'madura': 53.0,
    'melayu': 42.0,
    'bali': 54.0,
    'sasak': 56.0,
    'minangkabau': 44.0,
    'batak': 49.0,
    'bugis': 59.0,
    'makassar': 61.0,
    'banjar': 47.0,
    'aceh': 0,
    'lampung': 46.0,
    'betawi': 45.0
  }
};

export const STANDARD_GLOTTO_LANGUAGES: GlottoLanguageEntry[] = [
  { id: 'sunda', name: 'Bahasa Sunda', code: 'sund1252', region: 'Jawa Barat & Banten', family: 'Melayu-Polinesia Barat' },
  { id: 'jawa', name: 'Bahasa Jawa', code: 'java1254', region: 'Jawa Tengah, DIY, Jatim', family: 'Jawa-Kawi' },
  { id: 'madura', name: 'Bahasa Madura', code: 'madu1246', region: 'Jawa Timur & Madura', family: 'Melayu-Sumbawa' },
  { id: 'bali', name: 'Bahasa Bali', code: 'bali1278', region: 'Bali & Lombok Barat', family: 'Bali-Sasak-Sumbawa' },
  { id: 'sasak', name: 'Bahasa Sasak', code: 'sasa1249', region: 'Lombok (NTB)', family: 'Bali-Sasak-Sumbawa' },
  { id: 'melayu', name: 'Bahasa Melayu / Indonesia', code: 'nucl1460', region: 'Kep. Riau, Riau, Nasional', family: 'Melayik' },
  { id: 'minangkabau', name: 'Bahasa Minangkabau', code: 'mina1268', region: 'Sumatera Barat', family: 'Melayik' },
  { id: 'betawi', name: 'Bahasa Melayu Betawi', code: 'beta1252', region: 'DKI Jakarta & Bodetabek', family: 'Melayik Kreol' },
  { id: 'banjar', name: 'Bahasa Banjar', code: 'banj1239', region: 'Kalimantan Selatan', family: 'Melayik' },
  { id: 'bugis', name: 'Bahasa Bugis', code: 'bugi1244', region: 'Sulawesi Selatan', family: 'Sulawesi Selatan' },
  { id: 'makassar', name: 'Bahasa Makassar', code: 'maka1311', region: 'Sulawesi Selatan', family: 'Sulawesi Selatan' },
  { id: 'aceh', name: 'Bahasa Aceh', code: 'achi1257', region: 'Aceh', family: 'Camatik-Melayik' }
];

/**
 * Hitung jarak perbedaan leksikal (d%) antara dua varian bahasa atau titik survei
 */
export function calculatePairwiseLexicalDistance(
  langA: GlottoLanguageEntry,
  langB: GlottoLanguageEntry,
  allSurveys?: SurveyRecord[]
): number {
  if (langA.id === langB.id) return 0;

  // 1. Cek jika salah satu adalah titik acuan dan yang lain memiliki nilai persentase beda
  const isRefA = langA.id === 'active_survey_point' || langA.code === 'tp-ref';
  const isRefB = langB.id === 'active_survey_point' || langB.code === 'tp-ref';

  if (isRefA && langB.persentaseBeda !== undefined) {
    return Math.round(Number(langB.persentaseBeda) * 10) / 10;
  }
  if (isRefB && langA.persentaseBeda !== undefined) {
    return Math.round(Number(langA.persentaseBeda) * 10) / 10;
  }

  // 2. Cek jika kedua entri merupakan titik pembanding lapangan yang memiliki persentase beda terhadap acuan
  if (langA.persentaseBeda !== undefined && langB.persentaseBeda !== undefined) {
    const dA = Number(langA.persentaseBeda);
    const dB = Number(langB.persentaseBeda);
    const baseDiff = Math.abs(dA - dB);
    const triangulated = Math.min(85, Math.max(5, baseDiff + Math.min(dA, dB) * 0.45));
    return Math.round(triangulated * 10) / 10;
  }

  // 3. Cek jika kedua entri merupakan survei di database allSurveys
  const surveyA = allSurveys?.find(s => s.id === langA.id);
  const surveyB = allSurveys?.find(s => s.id === langB.id);

  if (surveyA && surveyB) {
    const listA = surveyA.data?.kosakataLengkap?.swadeshList || [];
    const listB = surveyB.data?.kosakataLengkap?.swadeshList || [];

    const mapB = new Map(listB.map(i => [i.id || i.glosIndonesia.toLowerCase().trim(), i]));
    let tested = 0;
    let diff = 0;

    listA.forEach(itemA => {
      const key = itemA.id || itemA.glosIndonesia.toLowerCase().trim();
      const itemB = mapB.get(key);
      if (itemB) {
        const valA = (itemA.bentukLokal || '').toLowerCase().trim();
        const valB = (itemB.bentukLokal || '').toLowerCase().trim();
        if (valA && valB) {
          tested++;
          if (valA !== valB) diff++;
        }
      }
    });

    if (tested >= 10) {
      return Math.round((diff / tested) * 1000) / 10;
    }
  }

  // 4. Normalisasi key nama bahasa untuk benchmark table
  const keyA = langA.id.replace('lang_', '').replace('tp_pembanding_', '').toLowerCase();
  const keyB = langB.id.replace('lang_', '').replace('tp_pembanding_', '').toLowerCase();

  if (BENCHMARK_LEXICAL_DIFFERENCES[keyA]?.[keyB] !== undefined) {
    return BENCHMARK_LEXICAL_DIFFERENCES[keyA][keyB];
  }
  if (BENCHMARK_LEXICAL_DIFFERENCES[keyB]?.[keyA] !== undefined) {
    return BENCHMARK_LEXICAL_DIFFERENCES[keyB][keyA];
  }

  // Fallback berdasarkan rumpun bahasa
  if (langA.family === langB.family) {
    return 24.5;
  }
  return 52.0;
}

/**
 * Bangun matriks simetris N x N jarak perbedaan leksikal
 */
export function buildGlottochronologyMatrix(
  languages: GlottoLanguageEntry[],
  allSurveys?: SurveyRecord[]
): number[][] {
  const n = languages.length;
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 0;
      } else {
        const dist = calculatePairwiseLexicalDistance(languages[i], languages[j], allSurveys);
        matrix[i][j] = dist;
        matrix[j][i] = dist;
      }
    }
  }

  return matrix;
}
