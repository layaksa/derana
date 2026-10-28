import { CatatanPengumpulData, KosakataItem } from '../types/linguistic';

export interface SentimentKeywordMatch {
  word: string;
  category: 'positive' | 'hesitation' | 'environmental' | 'linguistic';
  weight: number;
}

export interface DimensionScore {
  score: number; // 0 - 100
  label: string;
  status: 'optimal' | 'cukup' | 'perhatian';
  description: string;
}

export interface FlaggedVocabularyNote {
  id: number;
  glos: string;
  bentukLokal: string;
  catatan: string;
  category: 'keraguan' | 'arkaik' | 'serapan' | 'fonetik' | 'umum';
}

export interface QualitativeSentimentAnalysisResult {
  sentimentScore: number; // -100 to +100
  normalizedScore: number; // 0 to 100
  sentimentPolarity: 'positif' | 'netral' | 'waspada' | 'kritis';
  sentimentLabel: string;
  sentimentDescription: string;
  reliabilityIndex: number; // 0 to 100%
  reliabilityLevel: 'Tinggi' | 'Sedang' | 'Perlu Klarifikasi';
  
  // 4 Core Dimensions for Verifiers
  dimensions: {
    informantRapport: DimensionScore; // Keterbukaan & Kerjasama Narasumber
    phoneticCertainty: DimensionScore; // Kepastian Bunyi & Ingatan Leksikal
    environmentalStability: DimensionScore; // Ketahanan Waktu & Suasana Lapangan
    culturalAuthenticity: DimensionScore; // Otentisitas Adat & Variasi Bahasa
  };

  // Detected key terms
  extractedSignals: {
    positiveKeywords: string[];
    hesitationKeywords: string[];
    environmentalKeywords: string[];
    linguisticKeywords: string[];
  };

  // Aggregated vocabulary notes
  vocabularyAudit: {
    totalScanned: number;
    itemsWithNotesCount: number;
    flaggedItems: FlaggedVocabularyNote[];
  };

  // Actionable Recommendation for Verifiers
  verifierAction: {
    badgeText: string;
    badgeVariant: 'success' | 'warning' | 'alert' | 'neutral';
    headline: string;
    auditSummary: string;
    checklist: string[];
    suggestedNotes: string;
  };
}

// Fieldwork Lexicons
const POSITIVE_LEXICON = [
  'kooperatif', 'antusias', 'semangat', 'fasih', 'lancar', 'jelas', 'akurat',
  'otentik', 'alami', 'yakin', 'paham', 'ramah', 'hangat', 'terbuka', 'jujur',
  'tepat', 'artikulatif', 'konsisten', 'santai', 'akrab', 'lengkap', 'murni',
  'asli', 'percaya diri', 'mendukung', 'senang', 'bangga', 'tenang', 'fokus',
  'fasih berbahasa', 'tanpa ragu', 'sungguh-sungguh', 'komunikatif', 'sangat membantu',
  'sehat', 'segar', 'ingatan tajam', 'lugas', 'terpercaya', 'berpengalaman'
];

const HESITATION_LEXICON = [
  'ragu', 'ragu-ragu', 'kurang yakin', 'lupa', 'samar', 'bimbang', 'tidak pasti',
  'kira-kira', 'perkiraan', 'menebak', 'tidak ingat', 'sulit mengingat', 'rancu',
  'ambigu', 'membingungkan', 'jarang dipakai', 'hampir punah', 'generasi tua saja',
  'terbata-bata', 'koreksi berulang', 'berbeda pendapat', 'tidak sepakat',
  'kontradiksi', 'intervensi', 'terdistorsi', 'terpengaruh', 'lupa-lupa ingat',
  'tidak tahu', 'bingung', 'rancu maknanya', 'kurang paham', 'meragukan'
];

const ENVIRONMENTAL_LEXICON = [
  'lelah', 'capek', 'letih', 'terburu-buru', 'tergesa-gesa', 'tergesa', 'waktu sempit',
  'terburu', 'mengantuk', 'bising', 'ramai', 'gaduh', 'ribut', 'hujan', 'cuaca buruk',
  'gangguan', 'interupsi', 'terganggu', 'lalu lalang', 'menurun', 'sakit',
  'batuk', 'suara serak', 'akustik buruk', 'suara pelan', 'kurang jelas', 'terbatas',
  'malam hari', 'gelap', 'penerangan kurang', 'banyak penonton', 'kerumunan'
];

const LINGUISTIC_LEXICON = [
  'arkaik', 'kuno', 'sakral', 'tabu', 'halus', 'kasar', 'krama', 'ngoko', 'serapan',
  'pinjaman', 'bahasa indonesia', 'bahasa melayu', 'bahasa jawa', 'bahasa gaul',
  'kontak bahasa', 'alih kode', 'campur kode', 'penutur muda', 'tetua adat',
  'tokoh adat', 'upacara', 'ritual', 'adat', 'variasi fonetis', 'allofon',
  'vokal sengau', 'glotal', 'glottal stop', 'konsonan rangkap', 'dialek', 'aksen',
  'fonetik', 'morfologi', 'sintaksis', 'glos', 'bunyi'
];

/**
 * Analyzes collector notes and Swadesh/budaya vocabulary notes for sentiment and qualitative validity.
 */
export function analyzeQualitativeFieldNotes(
  catatanData?: CatatanPengumpulData,
  vocabularyItems?: KosakataItem[]
): QualitativeSentimentAnalysisResult {
  const suasana = (catatanData?.suasanaWawancara || '').toLowerCase();
  const catatan = (catatanData?.catatanPengumpul || '').toLowerCase();
  const combinedNotesText = `${suasana} ${catatan}`.trim();

  const foundPositives: string[] = [];
  const foundHesitations: string[] = [];
  const foundEnvironmentals: string[] = [];
  const foundLinguistics: string[] = [];

  let positiveScore = 0;
  let hesitationScore = 0;
  let environmentalScore = 0;

  // Scan Positive Tokens
  POSITIVE_LEXICON.forEach(token => {
    if (combinedNotesText.includes(token)) {
      foundPositives.push(token);
      positiveScore += 8;
    }
  });

  // Scan Hesitation Tokens
  HESITATION_LEXICON.forEach(token => {
    if (combinedNotesText.includes(token)) {
      foundHesitations.push(token);
      hesitationScore += 10;
    }
  });

  // Scan Environmental & Fatigue Tokens
  ENVIRONMENTAL_LEXICON.forEach(token => {
    if (combinedNotesText.includes(token)) {
      foundEnvironmentals.push(token);
      environmentalScore += 9;
    }
  });

  // Scan Linguistic/Anthropological contextual terms
  LINGUISTIC_LEXICON.forEach(token => {
    if (combinedNotesText.includes(token)) {
      foundLinguistics.push(token);
    }
  });

  // Scan vocabulary items for notes if provided
  const flaggedItems: FlaggedVocabularyNote[] = [];
  if (vocabularyItems && vocabularyItems.length > 0) {
    vocabularyItems.forEach(item => {
      if (item.catatan && item.catatan.trim().length > 0) {
        const itemNoteLower = item.catatan.toLowerCase();
        let cat: FlaggedVocabularyNote['category'] = 'umum';
        if (HESITATION_LEXICON.some(k => itemNoteLower.includes(k))) {
          cat = 'keraguan';
          hesitationScore += 2;
        } else if (itemNoteLower.includes('arkaik') || itemNoteLower.includes('kuno') || itemNoteLower.includes('tua')) {
          cat = 'arkaik';
        } else if (itemNoteLower.includes('serapan') || itemNoteLower.includes('pinjam') || itemNoteLower.includes('melayu') || itemNoteLower.includes('indonesia')) {
          cat = 'serapan';
        } else if (itemNoteLower.includes('fonetik') || itemNoteLower.includes('vokal') || itemNoteLower.includes('bunyi') || itemNoteLower.includes('glotal')) {
          cat = 'fonetik';
        }

        flaggedItems.push({
          id: item.id,
          glos: item.glosIndonesia,
          bentukLokal: item.bentukLokal || '-',
          catatan: item.catatan,
          category: cat
        });
      }
    });
  }

  // Base raw sentiment balance (-100 to +100)
  // If notes are empty or descriptive neutral:
  const textLength = combinedNotesText.length;
  let rawSentiment = 0;
  if (textLength > 0) {
    const totalImpact = positiveScore - hesitationScore - (environmentalScore * 0.7);
    rawSentiment = Math.max(-100, Math.min(100, Math.round(totalImpact * 3.5)));
  }

  // Calculate Dimensions (0 to 100)
  // 1. Informant Rapport: boosted by positive, lowered by hesitation/environmental
  const rapportVal = Math.max(15, Math.min(98, Math.round(75 + (positiveScore * 1.5) - (hesitationScore * 0.8))));
  const rapportStatus: DimensionScore['status'] = rapportVal >= 75 ? 'optimal' : rapportVal >= 50 ? 'cukup' : 'perhatian';
  const rapportDesc = rapportVal >= 75 
    ? 'Informan sangat kooperatif, antusias, dan bersedia membagikan leksikon bahasa ibu.'
    : rapportVal >= 50
    ? 'Interaksi informan cukup kooperatif dengan tingkat kepatuhan wawancara standar.'
    : 'Perlu pendekatan ekstra; terdeteksi resistensi, keraguan, atau rasa lelah informan.';

  // 2. Phonetic Certainty: penalised heavily by hesitation
  const phoneticVal = Math.max(10, Math.min(99, Math.round(82 - (hesitationScore * 2.2) + (positiveScore * 0.6))));
  const phoneticStatus: DimensionScore['status'] = phoneticVal >= 75 ? 'optimal' : phoneticVal >= 50 ? 'cukup' : 'perhatian';
  const phoneticDesc = phoneticVal >= 75
    ? 'Transkripsi fonetik dan pelafalan vokal/konsonan diucapkan dengan yakin tanpa keraguan.'
    : phoneticVal >= 50
    ? 'Terdapat beberapa kata yang memerlukan konfirmasi ulang bunyi allofonik atau bentuk arkais.'
    : 'Banyak keraguan leksikal atau variasi ingatan informan; disarankan uji silang narasumber pembanding.';

  // 3. Environmental & Session Stability: penalised by environmental issues and long durations
  let envVal = Math.max(20, Math.min(95, Math.round(80 - (environmentalScore * 2.0))));
  if (catatanData?.waktuDiperlukan && (catatanData.waktuDiperlukan.includes('4 jam') || catatanData.waktuDiperlukan.includes('5 jam'))) {
    envVal = Math.max(20, envVal - 10);
  }
  const envStatus: DimensionScore['status'] = envVal >= 75 ? 'optimal' : envVal >= 50 ? 'cukup' : 'perhatian';
  const envDesc = envVal >= 75
    ? 'Kondisi latar wawancara kondusif, akustik memadai untuk perekaman audio kosakata.'
    : envVal >= 50
    ? 'Wawancara berlangsung dengan sedikit distraksi lingkungan atau batas waktu lapangan.'
    : 'Kondisi fisik informan atau kebisingan lingkungan berpotensi mempengaruhi kejernihan data.';

  // 4. Cultural & Dialect Authenticity: boosted by authentic notes, awareness of borrowing
  const authVal = Math.max(25, Math.min(96, Math.round(78 + (foundLinguistics.length * 4) - (foundHesitations.length * 2))));
  const authStatus: DimensionScore['status'] = authVal >= 75 ? 'optimal' : authVal >= 50 ? 'cukup' : 'perhatian';
  const authDesc = authVal >= 75
    ? 'Data mencerminkan leksikon asli daerah dengan kesadaran konteks budaya dan varian tutur.'
    : authVal >= 50
    ? 'Leksikon mencakup kosakata baku lokal dengan kemungkinan kontak bahasa nasional/regional.'
    : 'Ditemukan indikasi interferensi bahasa dominan atau pelupa istilah-istilah budaya tua.';

  // Aggregate Reliability Index (0 - 100%)
  const reliabilityIndex = Math.max(20, Math.min(98, Math.round(
    (rapportVal * 0.3) + (phoneticVal * 0.35) + (envVal * 0.15) + (authVal * 0.2)
  )));

  let reliabilityLevel: 'Tinggi' | 'Sedang' | 'Perlu Klarifikasi' = 'Tinggi';
  if (reliabilityIndex < 55) {
    reliabilityLevel = 'Perlu Klarifikasi';
  } else if (reliabilityIndex < 75) {
    reliabilityLevel = 'Sedang';
  }

  // Sentiment Polarity Classification
  let polarity: 'positif' | 'netral' | 'waspada' | 'kritis' = 'netral';
  let label = 'Netral & Deskriptif';
  let desc = 'Catatan observasi bersifat laporan lapangan umum tanpa keluhan atau antusiasme mencolok.';

  if (rawSentiment >= 25) {
    polarity = 'positif';
    label = 'Sangat Positif & Kooperatif';
    desc = 'Suasana wawancara sangat kondusif, narasumber antusias, dan data leksikal diyakini keasliannya.';
  } else if (rawSentiment >= 5) {
    polarity = 'positif';
    label = 'Cenderung Positif';
    desc = 'Koleksi data berjalan lancar dengan interaksi penutur yang kooperatif dan responsif.';
  } else if (rawSentiment <= -35) {
    polarity = 'kritis';
    label = 'Perlu Review Kritis (Kendala Tinggi)';
    desc = 'Catatan mencatat banyak keraguan ingatan narasumber, kendala kelelahan, atau kebisingan latar.';
  } else if (rawSentiment < -5) {
    polarity = 'waspada';
    label = 'Perlu Kewaspadaan (Terdapat Keraguan)';
    desc = 'Terdapat beberapa catatan mengenai keraguan bentuk kata, variasi bunyi, atau kondisi waktu terbatas.';
  }

  // Verifier Recommendation & Checklist
  let actionVariant: 'success' | 'warning' | 'alert' | 'neutral' = 'neutral';
  let badgeText = 'Status: Perlu Tinjauan Normal';
  let headline = 'Rekomendasi Verifikator: Data Siap Diproses';
  let auditSummary = 'Data kosakata menunjukkan konsistensi kualitatif yang baik dan dapat dilanjutkan ke tahap verifikasi fonotaktik.';
  const checklist: string[] = [];
  let suggestedNotes = '';

  if (polarity === 'positif' && reliabilityIndex >= 75) {
    actionVariant = 'success';
    badgeText = 'Prioritas Verifikasi: SIAP VALIDASI';
    headline = 'Rekomendasi: Data Primer Valid & Keandalan Tinggi';
    auditSummary = `Narasumber menunjukkan kooperasi luar biasa dan keyakinan fonetik optimal (${reliabilityIndex}% indeks keandalan). Rekaman dan transkripsi IPA aman untuk disahkan menjadi data primer.`;
    checklist.push('Periksa kelengkapan 200 Swadesh dan audio yang terunggah.');
    checklist.push('Validasi bentuk ortografi lokal sesuai pedoman transliterasi daerah.');
    checklist.push('Sahkan data ke status "✓ Tervalidasi" untuk integrasi peta dialektometri.');
    suggestedNotes = `[VERIFIKASI TUNTAS] Data lapangan diperoleh dalam kondisi wawancara sangat kooperatif (${catatanData?.tempatLatarWawancara || 'lapangan'}). Keandalan fonetik tinggi (${reliabilityIndex}%), transkripsi IPA sesuai dengan inventaris bunyi bahasa setempat.`;
  } else if (polarity === 'waspada' || (reliabilityIndex >= 55 && reliabilityIndex < 75)) {
    actionVariant = 'warning';
    badgeText = 'Prioritas Verifikasi: TINJAUAN KHUSUS';
    headline = 'Rekomendasi: Lakukan Tinjauan Khusus Bentuk Tertentu';
    auditSummary = `Ditemukan beberapa indikasi keraguan leksikal (${foundHesitations.length} sinyal keraguan). Verifikator disarankan meneliti ulang butir kosakata beranotasi sebelum pengesahan final.`;
    checklist.push('Periksa butir Swadesh yang memiliki tanda catatan keraguan atau bentuk ganda.');
    checklist.push('Dengarkan rekaman audio khusus pada kata-kata yang diragukan penutur.');
    checklist.push('Bandingkan transkripsi dengan titik pengamatan terdekat di Modul Dialektometri.');
    suggestedNotes = `[CATATAN VERIFIKATOR] Terdapat catatan keraguan narasumber pada beberapa butir leksikon (${foundHesitations.slice(0, 3).join(', ')}). Diperlukan verifikasi audio dan perbandingan dengan titik pengamatan tetangga sebelum pengesahan penuh.`;
  } else if (polarity === 'kritis' || reliabilityIndex < 55) {
    actionVariant = 'alert';
    badgeText = 'Prioritas Verifikasi: BUTUH KLARIFIKASI';
    headline = 'Rekomendasi: Tunda Pengesahan & Jadwalkan Uji Silang';
    auditSummary = `Catatan mengindikasikan kendala lapangan signifikan (${foundEnvironmentals.concat(foundHesitations).slice(0, 4).join(', ')}). Berpotensi menurunkan reliabilitas transkripsi fonetik.`;
    checklist.push('Hubungi surveyor atau narasumber pembanding untuk mengonfirmasi kata yang diragukan.');
    checklist.push('Periksa apakah kelelahan atau kebisingan menyebabkan deviasi transkripsi fonetik.');
    checklist.push('Pertimbangkan pemberian status "Perlu Perbaikan" hingga klarifikasi selesai.');
    suggestedNotes = `[KLARIFIKASI DIPERLUKAN] Kondisi lapangan mencatat kendala signifikan (${foundEnvironmentals.slice(0, 2).join(', ')}) dan keraguan leksikal penutur. Disarankan pengambilan sampel ulang dengan informan pembanding untuk butir bermasalah.`;
  } else {
    actionVariant = 'neutral';
    badgeText = 'Prioritas Verifikasi: TINJAUAN STANDAR';
    headline = 'Rekomendasi: Tinjauan Standar Lapangan';
    auditSummary = 'Catatan observasi berada pada koridor normatif. Jalankan verifikasi standar atas akurasi transkripsi dan kelengkapan butir kuesioner.';
    checklist.push('Pastikan identitas narasumber dan penandatanganan telah lengkap.');
    checklist.push('Verifikasi koherensi glos Indonesia dengan bentuk lokal.');
    suggestedNotes = `[CATATAN VERIFIKASI] Observasi lapangan standar. Data dapat diverifikasi setelah pemeriksaan ortografi dan transkripsi bunyi selesai.`;
  }

  const normalizedScore = Math.round((rawSentiment + 100) / 2); // 0 to 100

  return {
    sentimentScore: rawSentiment,
    normalizedScore,
    sentimentPolarity: polarity,
    sentimentLabel: label,
    sentimentDescription: desc,
    reliabilityIndex,
    reliabilityLevel,
    dimensions: {
      informantRapport: {
        score: rapportVal,
        label: 'Keterbukaan & Kerjasama Narasumber',
        status: rapportStatus,
        description: rapportDesc
      },
      phoneticCertainty: {
        score: phoneticVal,
        label: 'Kepastian Bunyi & Ingatan Leksikal',
        status: phoneticStatus,
        description: phoneticDesc
      },
      environmentalStability: {
        score: envVal,
        label: 'Stabilitas Lingkungan & Waktu',
        status: envStatus,
        description: envDesc
      },
      culturalAuthenticity: {
        score: authVal,
        label: 'Otentisitas & Variasi Bahasa',
        status: authStatus,
        description: authDesc
      }
    },
    extractedSignals: {
      positiveKeywords: Array.from(new Set(foundPositives)),
      hesitationKeywords: Array.from(new Set(foundHesitations)),
      environmentalKeywords: Array.from(new Set(foundEnvironmentals)),
      linguisticKeywords: Array.from(new Set(foundLinguistics))
    },
    vocabularyAudit: {
      totalScanned: vocabularyItems ? vocabularyItems.length : 0,
      itemsWithNotesCount: flaggedItems.length,
      flaggedItems
    },
    verifierAction: {
      badgeText,
      badgeVariant: actionVariant,
      headline,
      auditSummary,
      checklist,
      suggestedNotes
    }
  };
}

/**
 * Field notes presets for testing and demonstration in the UI
 */
export const FIELD_NOTE_PRESETS = [
  {
    id: 'ideal',
    title: 'Sesi Lapangan Ideal & Penutur Fasih',
    suasana: 'Sangat kooperatif, ramah, santai, dan narasumber sangat antusias menjelaskan asal-usul istilah adat setempat. Penutur sangat fasih berbahasa ibu.',
    catatan: 'Narasumber merupakan tetua kampung yang memiliki ingatan tajam dan artikulatif. Pengucapan vokal dan konsonan sangat jelas dan konsisten. Semua 200 kosakata dasar dapat diselesaikan tanpa keraguan.',
    waktu: '2 jam 30 menit (pagi hari)'
  },
  {
    id: 'keraguan_usia',
    title: 'Penutur Sepuh & Keraguan Kosakata Arkaik',
    suasana: 'Narasumber cukup kooperatif namun tampak ragu-ragu dan sering bimbang ketika ditanya istilah arkais yang sudah jarang dipakai oleh generasi muda.',
    catatan: 'Terdapat beberapa keraguan transkripsi fonetik pada vokal sengau dan bunyi glotal stop. Narasumber sering lupa dan beberapa kali mengoreksi ucapannya sendiri karena terpengaruh bahasa Indonesia.',
    waktu: '3 jam 45 menit'
  },
  {
    id: 'kendala_lingkungan',
    title: 'Kendala Lingkungan Bising & Waktu Sempit',
    suasana: 'Suasana wawancara agak ramai dan gaduh karena banyak penonton di teras balai desa. Waktu terburu-buru karena narasumber harus segera pergi bekerja di ladang.',
    catatan: 'Akustik ruangan kurang optimal dengan gangguan kebisingan lalu lintas dan cuaca hujan deras. Informan mulai lelah pada akhir sesi kosakata budaya sehingga rekaman perlu dicek ulang.',
    waktu: '1 jam 40 menit (tergesa-gesa)'
  }
];
