import { KosakataItem, SurveyRecord, KosakataLengkapData, TitikPembandingDialektometri } from '../types/linguistic';
import { SWADESH_200_GLOS } from '../data/swadeshList';
import { getVocabularyForPoint } from './dialectPointComparison';
import { levenshteinDistance, stringSimilarity } from './dialectometryComparator';

export interface LevenshteinWordComparison {
  id: number;
  glosIndonesia: string;
  bentuk1: string;
  ipa1: string;
  bentuk2: string;
  ipa2: string;
  distance: number;              // Raw Levenshtein distance
  normalizedDistance: number;    // 0.0 to 1.0 (distance / max(len1, len2))
  similarity: number;            // 0.0 to 1.0 (1 - normalizedDistance)
  category: 'IDENTIK' | 'KOGNAT_DEKAT' | 'KOGNAT_JAUH' | 'BEDA_LEKSIKAL' | 'BELUM_TERISI';
  weight: number;                // 0.0 (Identik), 0.5 (Kognat dekat / beda fonetis), 0.75 (Kognat jauh), 1.0 (Beda leksikal)
  editOperations: string;        // Human-readable operations summary
  isFilled: boolean;
}

export interface LevenshteinSurveyComparisonResult {
  survey1Id: string;
  survey1Name: string;
  survey1Desa: string;
  survey1Bahasa: string;
  survey1FilledCount: number;

  survey2Id: string;
  survey2Name: string;
  survey2Desa: string;
  survey2Bahasa: string;
  survey2FilledCount: number;

  totalSwadeshGlos: number;
  totalComparableGlos: number;     // Glosses where both surveys have non-empty words
  totalUnfilledGlos: number;

  meanLevenshteinDistance: number; // Rata-rata jarak edit
  meanSimilarityPct: number;       // Rata-rata persentase kemiripan leksikal (0-100%)
  
  effectiveDifferenceCount: number;// s = sum(weights)
  lexicalDifferencePct: number;    // d% = (s / totalComparable) * 100%
  lexicalSimilarityPct: number;    // 100 - d%

  countIdentical: number;          // d = 0
  countCloseCognate: number;       // d = 1-2 or sim >= 0.65 (beda fonetis)
  countDistantCognate: number;     // sim 0.40 - 0.64
  countFullDifference: number;     // sim < 0.40 (beda leksikal penuh)

  guiterCategory: 'Beda Wicara/Subdialek' | 'Beda Dialek' | 'Beda Subbahasa' | 'Beda Bahasa';
  guiterBadgeColor: string;
  guiterDescription: string;

  words: LevenshteinWordComparison[];
  calculatedAt: string;
}

/**
 * Menghasilkan ringkasan operasi edit Levenshtein (insertions, deletions, substitutions)
 */
export function getLevenshteinOperationsSummary(s1: string, s2: string): string {
  const clean1 = s1.toLowerCase().trim();
  const clean2 = s2.toLowerCase().trim();

  if (!clean1 && !clean2) return 'Kedua kata kosong';
  if (!clean1) return `Penambahan penuh "${clean2}"`;
  if (!clean2) return `Penghapusan penuh "${clean1}"`;
  if (clean1 === clean2) return 'Bentuk identik sama (0 edit)';

  const dist = levenshteinDistance(clean1, clean2);
  const diffLen = Math.abs(clean1.length - clean2.length);

  const notes: string[] = [];

  // Analisis vokal & konsonan dasar
  if (diffLen > 0) {
    if (clean1.length < clean2.length) {
      notes.push(`+${diffLen} karakter (adisi)`);
    } else {
      notes.push(`-${diffLen} karakter (delesi)`);
    }
  }

  const substEstimate = Math.max(0, dist - diffLen);
  if (substEstimate > 0) {
    notes.push(`${substEstimate} substitusi fonem`);
  }

  // Deteksi variasi vokal akhir khas Nusantara
  const last1 = clean1.slice(-1);
  const last2 = clean2.slice(-1);
  if (last1 !== last2 && ['a', 'e', 'o', 'i', 'u'].includes(last1) && ['a', 'e', 'o', 'i', 'u'].includes(last2)) {
    notes.push(`vokal akhir /${last1}/ ↔ /${last2}/`);
  }

  // Deteksi aspirasi h
  if ((clean1.startsWith('h') && !clean2.startsWith('h')) || (!clean1.startsWith('h') && clean2.startsWith('h'))) {
    notes.push('variasi inisial /h/ ↔ /Ø/');
  }

  return notes.length > 0 ? notes.join(', ') : `${dist} perubahan karakter`;
}

/**
 * Melakukan perbandingan jarak Levenshtein otomatis antar 2 survei
 */
export function calculateLevenshteinBetweenSurveys(
  survey1Id: string,
  survey2Id: string,
  allSurveys: SurveyRecord[] = [],
  activeSurveyId?: string | null,
  activeKosakata?: KosakataLengkapData,
  titikPembandingList: TitikPembandingDialektometri[] = []
): LevenshteinSurveyComparisonResult {
  // Helper to extract survey meta and vocab map
  const getSurveyInfo = (id: string) => {
    // 1. Is it active survey?
    if (id === 'TP-REF' || id === 'ACTIVE' || id === activeSurveyId) {
      const activeMatch = allSurveys.find(s => s.id === activeSurveyId);
      const desa = activeMatch?.desa || activeMatch?.data?.titikPengamatan?.namaDesa || 'Titik Acuan (Aktif)';
      const bahasa = activeMatch?.bahasa || activeMatch?.data?.titikPengamatan?.bahasaDigunakan || 'Bahasa Daerah';
      const vocab = getVocabularyForPoint('TP-REF', activeKosakata, titikPembandingList, allSurveys);
      const filled = Object.values(vocab).filter(v => v.bentuk && v.bentuk.trim()).length;
      return {
        id: 'TP-REF',
        name: `TP-01 ${desa} (Survei Aktif)`,
        desa,
        bahasa,
        vocab,
        filled
      };
    }

    // 2. Is it in allSurveys?
    const survey = allSurveys.find(s => s.id === id);
    if (survey) {
      const desa = survey.desa || survey.data?.titikPengamatan?.namaDesa || survey.title || 'Desa Lapangan';
      const bahasa = survey.bahasa || survey.data?.titikPengamatan?.bahasaDigunakan || 'Bahasa Daerah';
      const vocab = getVocabularyForPoint(id, activeKosakata, titikPembandingList, allSurveys);
      const filled = Object.values(vocab).filter(v => v.bentuk && v.bentuk.trim()).length;
      return {
        id: survey.id,
        name: `Survei ${desa} (${bahasa})`,
        desa,
        bahasa,
        vocab,
        filled
      };
    }

    // 3. Is it in titikPembandingList?
    const tp = titikPembandingList.find(t => t.id === id);
    if (tp) {
      const vocab = getVocabularyForPoint(id, activeKosakata, titikPembandingList, allSurveys);
      const filled = Object.values(vocab).filter(v => v.bentuk && v.bentuk.trim()).length;
      return {
        id: tp.id,
        name: tp.namaTitik || `TP ${tp.desa}`,
        desa: tp.desa,
        bahasa: tp.bahasa,
        vocab,
        filled
      };
    }

    // 4. Fallback preset
    const vocab = getVocabularyForPoint(id, activeKosakata, titikPembandingList, allSurveys);
    const filled = Object.values(vocab).filter(v => v.bentuk && v.bentuk.trim()).length;
    return {
      id,
      name: `Titik Pembanding (${id})`,
      desa: id,
      bahasa: 'Dialek Nusantara',
      vocab,
      filled
    };
  };

  const info1 = getSurveyInfo(survey1Id);
  const info2 = getSurveyInfo(survey2Id);

  const words: LevenshteinWordComparison[] = [];
  let totalComparable = 0;
  let totalUnfilled = 0;
  let totalDistSum = 0;
  let totalSimSum = 0;
  let effectiveDiffScore = 0;

  let countIdentical = 0;
  let countCloseCognate = 0;
  let countDistantCognate = 0;
  let countFullDifference = 0;

  SWADESH_200_GLOS.forEach((glos, index) => {
    const cleanGlos = glos.toLowerCase().trim();
    const entry1 = info1.vocab[cleanGlos];
    const entry2 = info2.vocab[cleanGlos];

    const w1 = entry1?.bentuk?.trim() || '';
    const ipa1 = entry1?.ipa || (w1 ? `[${w1}]` : '');
    const w2 = entry2?.bentuk?.trim() || '';
    const ipa2 = entry2?.ipa || (w2 ? `[${w2}]` : '');

    if (!w1 || !w2) {
      totalUnfilled++;
      words.push({
        id: index + 1,
        glosIndonesia: glos,
        bentuk1: w1 || '(Kosong)',
        ipa1,
        bentuk2: w2 || '(Kosong)',
        ipa2,
        distance: 0,
        normalizedDistance: 0,
        similarity: 0,
        category: 'BELUM_TERISI',
        weight: 0,
        editOperations: 'Salah satu entri kata belum terisi',
        isFilled: false
      });
      return;
    }

    totalComparable++;
    const dist = levenshteinDistance(w1.toLowerCase(), w2.toLowerCase());
    const sim = stringSimilarity(w1.toLowerCase(), w2.toLowerCase());
    const maxLen = Math.max(w1.length, w2.length) || 1;
    const normDist = parseFloat((dist / maxLen).toFixed(3));

    totalDistSum += dist;
    totalSimSum += sim;

    let category: LevenshteinWordComparison['category'] = 'BEDA_LEKSIKAL';
    let weight = 1.0;

    if (dist === 0) {
      category = 'IDENTIK';
      weight = 0.0;
      countIdentical++;
    } else if (dist <= 2 || sim >= 0.65) {
      category = 'KOGNAT_DEKAT';
      weight = 0.5; // Dialektometri standard: beda fonetis dihitung 0.5
      countCloseCognate++;
    } else if (sim >= 0.40) {
      category = 'KOGNAT_JAUH';
      weight = 0.75;
      countDistantCognate++;
    } else {
      category = 'BEDA_LEKSIKAL';
      weight = 1.0;
      countFullDifference++;
    }

    effectiveDiffScore += weight;
    const ops = getLevenshteinOperationsSummary(w1, w2);

    words.push({
      id: index + 1,
      glosIndonesia: glos,
      bentuk1: w1,
      ipa1,
      bentuk2: w2,
      ipa2,
      distance: dist,
      normalizedDistance: normDist,
      similarity: parseFloat((sim * 100).toFixed(1)),
      category,
      weight,
      editOperations: ops,
      isFilled: true
    });
  });

  const n = totalComparable > 0 ? totalComparable : SWADESH_200_GLOS.length;
  const meanLevenshteinDistance = totalComparable > 0 ? parseFloat((totalDistSum / totalComparable).toFixed(2)) : 0;
  const meanSimilarityPct = totalComparable > 0 ? parseFloat(((totalSimSum / totalComparable) * 100).toFixed(1)) : 0;

  // Rumus Guiter Dialektometri: d% = (s / n) * 100%
  const lexicalDifferencePct = parseFloat(((effectiveDiffScore / n) * 100).toFixed(1));
  const lexicalSimilarityPct = parseFloat((Math.max(0, 100 - lexicalDifferencePct)).toFixed(1));

  // Klasifikasi Hubungan Dialektometri Baku (Guiter / Badan Bahasa)
  let guiterCategory: LevenshteinSurveyComparisonResult['guiterCategory'] = 'Beda Wicara/Subdialek';
  let guiterBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800';
  let guiterDescription = '0% - 20%: Tidak ada perbedaan signifikan. Keduanya dikategorikan sebagai satu dialek atau variasi wicara setempat.';

  if (lexicalDifferencePct > 80) {
    guiterCategory = 'Beda Bahasa';
    guiterBadgeColor = 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800';
    guiterDescription = '81% - 100%: Perbedaan leksikal sangat tinggi. Diakui sebagai dua bahasa yang berbeda secara penuh.';
  } else if (lexicalDifferencePct > 50) {
    guiterCategory = 'Beda Subbahasa';
    guiterBadgeColor = 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800';
    guiterDescription = '51% - 80%: Perbedaan subbahasa. Pemahaman timbal-balik terbatas dan transisi geolinguistik signifikan.';
  } else if (lexicalDifferencePct > 20) {
    guiterCategory = 'Beda Dialek';
    guiterBadgeColor = 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
    guiterDescription = '21% - 50%: Perbedaan dialek. Masih berada dalam satu rumpun bahasa yang sama dengan saling keterpahaman memadai.';
  }

  return {
    survey1Id: info1.id,
    survey1Name: info1.name,
    survey1Desa: info1.desa,
    survey1Bahasa: info1.bahasa,
    survey1FilledCount: info1.filled,

    survey2Id: info2.id,
    survey2Name: info2.name,
    survey2Desa: info2.desa,
    survey2Bahasa: info2.bahasa,
    survey2FilledCount: info2.filled,

    totalSwadeshGlos: SWADESH_200_GLOS.length,
    totalComparableGlos: totalComparable,
    totalUnfilledGlos: totalUnfilled,

    meanLevenshteinDistance,
    meanSimilarityPct,

    effectiveDifferenceCount: parseFloat(effectiveDiffScore.toFixed(1)),
    lexicalDifferencePct,
    lexicalSimilarityPct,

    countIdentical,
    countCloseCognate,
    countDistantCognate,
    countFullDifference,

    guiterCategory,
    guiterBadgeColor,
    guiterDescription,

    words,
    calculatedAt: new Date().toISOString()
  };
}

/**
 * Ekspor ringkasan perhitungan Levenshtein ke file CSV
 */
export function exportLevenshteinComparisonToCSV(result: LevenshteinSurveyComparisonResult): void {
  const headers = [
    'No',
    'Glos Indonesia',
    `Bentuk (${result.survey1Desa})`,
    `IPA (${result.survey1Desa})`,
    `Bentuk (${result.survey2Desa})`,
    `IPA (${result.survey2Desa})`,
    'Jarak Levenshtein',
    'Jarak Ternormalisasi (0-1)',
    'Kemiripan (%)',
    'Kategori Kekerabatan',
    'Bobot Dialektometri',
    'Catatan Operasi Edit'
  ];

  const rows = result.words.map(w => [
    w.id,
    `"${w.glosIndonesia.replace(/"/g, '""')}"`,
    `"${w.bentuk1.replace(/"/g, '""')}"`,
    `"${w.ipa1.replace(/"/g, '""')}"`,
    `"${w.bentuk2.replace(/"/g, '""')}"`,
    `"${w.ipa2.replace(/"/g, '""')}"`,
    w.distance,
    w.normalizedDistance,
    `${w.similarity}%`,
    w.category,
    w.weight,
    `"${w.editOperations.replace(/"/g, '""')}"`
  ]);

  const metaHeader = [
    `# LAPORAN PERHITUNGAN JARAK LEVENSHTEIN DIALEKTOMETRI`,
    `# Titik 1: ${result.survey1Name} (${result.survey1Desa})`,
    `# Titik 2: ${result.survey2Name} (${result.survey2Desa})`,
    `# Persentase Perbedaan Leksikal: ${result.lexicalDifferencePct}%`,
    `# Persentase Kemiripan Leksikal: ${result.lexicalSimilarityPct}%`,
    `# Rata-rata Jarak Levenshtein: ${result.meanLevenshteinDistance} karakter edit`,
    `# Status Dialektometri Guiter: ${result.guiterCategory}`,
    `# Total Glos Teruji: ${result.totalComparableGlos} / ${result.totalSwadeshGlos}`,
    `# Waktu Komputasi: ${result.calculatedAt}`,
    ''
  ].join('\n');

  const csvContent = metaHeader + '\n' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Levenshtein_${result.survey1Desa}_vs_${result.survey2Desa}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
