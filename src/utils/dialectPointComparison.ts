import { KosakataLengkapData, TitikPembandingDialektometri, TitikPengamatan, SurveyRecord } from '../types/linguistic';
import { SWADESH_200_GLOS } from '../data/swadeshList';
import { COMPARATIVE_CORPUS_PRESETS } from '../data/comparativeCorpus';
import { classifyWordPair } from './dialectometryComparator';
import { 
  alignPhoneticSegments, 
  AlignedPhoneticResult, 
  analyzeCorpusPhonetics, 
  CorpusPhoneticSummary 
} from './phoneticSegmentAligner';

export interface PointOption {
  id: string;
  name: string;
  subTitle: string;
  sourceType: 'survey_ref' | 'survey_pembanding' | 'corpus_preset';
}

export interface DialectComparisonWordRow {
  no: number;
  glos: string;
  bentuk1: string;
  ipa1: string;
  bentuk2: string;
  ipa2: string;
  score: number; // 1.0 (Tinggi/Leksikal), 0.5 (Sedang/Fonem), 0.0 (Sama)
  category: 'BEDA_LEKSIKAL' | 'BEDA_FONEM' | 'SAMA' | 'BELUM_DIISI';
  isSignificant: boolean; // True jika perbedaan signifikan (skor dialektometri tinggi = 1.0)
  note: string;
  phoneticSimilarityPct?: number; // 0 - 100%
  phoneticAlignment?: AlignedPhoneticResult;
  detectedShifts?: string[];
}

export interface ComparisonResultStats {
  point1Name: string;
  point2Name: string;
  totalTested: number;
  jumlahBedaLeksikal: number; // Skor 1.0
  jumlahBedaFonem: number;    // Skor 0.5
  jumlahSama: number;         // Skor 0.0
  effectiveDifferenceCount: number; // s
  persentasePerbedaan: number;      // d% = (s / n) * 100
  persentaseKemiripan: number;      // 100 - d%
  statusGuiter: 'Tidak Berbeda' | 'Perbedaan Wicara' | 'Perbedaan Subdialek' | 'Perbedaan Dialek' | 'Perbedaan Bahasa' | 'Beda Wicara/Subdialek' | 'Beda Dialek' | 'Beda Subbahasa' | 'Beda Bahasa';
  statusBadgeColor: string;
  words: DialectComparisonWordRow[];
  persentaseKemiripanFonetikIPA?: number; // 0 - 100%
  corpusPhoneticSummary?: CorpusPhoneticSummary;
}

/**
 * Dialek Korpus Khusus untuk Titik-Titik Pembanding (TP-02 Cikaso, TP-03 Rancabuaya, TP-04 Pangandaran)
 */
const TP_SPECIFIC_DICTIONARIES: Record<string, Record<string, { bentuk: string; ipa: string }>> = {
  // TP-02 Cikaso (Sunda Selatan Cianjur/Sukabumi)
  'TP-02': {
    "air": { bentuk: "cai", ipa: "[tʃai]" },
    "api": { bentuk: "seuneu", ipa: "[sɯnɯ]" },
    "abu": { bentuk: "lebu / lebu seuneu", ipa: "[ləbu]" },
    "makan": { bentuk: "dahar / neda", ipa: "[dahar]" },
    "minum": { bentuk: "nginum", ipa: "[ŋinum]" },
    "tidur": { bentuk: "saré / héés", ipa: "[sarɛ / hɛʔɛs]" },
    "perut": { bentuk: "beuteung", ipa: "[bɯtɯŋ]" },
    "kepala": { bentuk: "sirah", ipa: "[sirah]" },
    "mata": { bentuk: "panon", ipa: "[panɔn]" },
    "telinga": { bentuk: "ceuli", ipa: "[tʃəuli]" },
    "tangan": { bentuk: "leungeun", ipa: "[lɯŋɯn]" },
    "kaki": { bentuk: "suku", ipa: "[suku]" },
    "darah": { bentuk: "getih", ipa: "[gətih]" },
    "tulang": { bentuk: "tulang", ipa: "[tulaŋ]" },
    "batu": { bentuk: "batu", ipa: "[batu]" },
    "pasir": { bentuk: "keusik", ipa: "[kɯsik]" },
    "tanah": { bentuk: "taneuh", ipa: "[tanɯh]" },
    "langit": { bentuk: "langit", ipa: "[laŋit]" },
    "awan": { bentuk: "mega / reueuk", ipa: "[mɛga]" },
    "matahari": { bentuk: "panonpoé", ipa: "[panɔnpɔɛ]" },
    "bulan": { bentuk: "bulan", ipa: "[bulan]" },
    "bintang": { bentuk: "bentang", ipa: "[bəntaŋ]" },
    "hujan": { bentuk: "hujan", ipa: "[hudʒan]" },
    "angin": { bentuk: "angin", ipa: "[aŋin]" },
    "pohon": { bentuk: "tangkal", ipa: "[taŋkal]" },
    "daun": { bentuk: "daun", ipa: "[daun]" },
    "akar": { bentuk: "akar", ipa: "[akar]" },
    "ikan": { bentuk: "lauk", ipa: "[lauk]" },
    "burung": { bentuk: "manuk", ipa: "[manuk]" },
    "anjing": { bentuk: "anjing", ipa: "[andʒiŋ]" },
    "ular": { bentuk: "oray", ipa: "[ɔrai]" },
    "kutu": { bentuk: "kutu", ipa: "[kutu]" },
    "saya": { bentuk: "kuring / abdi", ipa: "[kuriŋ / abdi]" },
    "kamu": { bentuk: "manéh / anjeun", ipa: "[manɛh]" },
    "dia": { bentuk: "manéhna", ipa: "[manɛhna]" },
    "kami, kita": { bentuk: "urang / urang saréréa", ipa: "[uraŋ]" },
    "mereka": { bentuk: "maranéhna", ipa: "[maranɛhna]" },
    "satu": { bentuk: "hiji", ipa: "[hidʒi]" },
    "dua": { bentuk: "dua", ipa: "[dua]" },
    "tiga": { bentuk: "tilu", ipa: "[tilu]" },
    "empat": { bentuk: "opat", ipa: "[ɔpat]" },
    "lima": { bentuk: "lima", ipa: "[lima]" },
    "semua": { bentuk: "kabéh", ipa: "[kabɛh]" },
    "banyak": { bentuk: "loba", ipa: "[lɔba]" },
    "besar": { bentuk: "gedé", ipa: "[gədɛ]" },
    "kecil": { bentuk: "leutik", ipa: "[lɯtik]" },
    "panjang": { bentuk: "panjang", ipa: "[pandʒaŋ]" },
    "pendek": { bentuk: "pondok", ipa: "[pɔndɔk]" },
    "tebal": { bentuk: "kandel", ipa: "[kandəl]" },
    "tipis": { bentuk: "ipis", ipa: "[ipis]" },
    "hitam": { bentuk: "hideung", ipa: "[hidɯŋ]" },
    "putih": { bentuk: "bodas", ipa: "[bɔdas]" },
    "merah": { bentuk: "beureum", ipa: "[bɯrɯm]" },
    "kuning": { bentuk: "konéng", ipa: "[kɔnɛŋ]" },
    "hijau": { bentuk: "héjo", ipa: "[hɛdʒɔ]" },
    "dingin": { bentuk: "tiris / tiis", ipa: "[tiris]" },
    "panas": { bentuk: "panas / hareudang", ipa: "[panas]" },
    "mati": { bentuk: "paéh / maot", ipa: "[paɛh]" },
    "hidup": { bentuk: "hirup", ipa: "[hirup]" },
    "datang": { bentuk: "datang / tepi", ipa: "[dataŋ]" },
    "berjalan": { bentuk: "leumpang", ipa: "[lɯmpaŋ]" },
    "melihat": { bentuk: "nénjo / ningali", ipa: "[nɛndʒɔ]" },
    "mendengar": { bentuk: "ngadéngé", ipa: "[ŋadɛŋɛ]" }
  },

  // TP-03 Rancabuaya (Sunda Pesisir Pameungpeuk - varian fonologis khas pesisir)
  'TP-03': {
    "air": { bentuk: "cai / cé", ipa: "[tʃɛ / tʃai]" },
    "api": { bentuk: "seuneu", ipa: "[sɯnɯ]" },
    "abu": { bentuk: "lebu", ipa: "[ləbu]" },
    "makan": { bentuk: "dahar / medang", ipa: "[dahar / mədaŋ]" },
    "minum": { bentuk: "nginum", ipa: "[ŋinum]" },
    "tidur": { bentuk: "saré", ipa: "[sarɛ]" },
    "perut": { bentuk: "beutung", ipa: "[bɯtuŋ]" },
    "kepala": { bentuk: "sirah", ipa: "[sirah]" },
    "mata": { bentuk: "panon", ipa: "[panɔn]" },
    "telinga": { bentuk: "ceuli", ipa: "[tʃəuli]" },
    "tangan": { bentuk: "leungeun", ipa: "[lɯŋɯn]" },
    "kaki": { bentuk: "suku", ipa: "[suku]" },
    "darah": { bentuk: "getih", ipa: "[gətih]" },
    "tulang": { bentuk: "tulang", ipa: "[tulaŋ]" },
    "batu": { bentuk: "batu", ipa: "[batu]" },
    "pasir": { bentuk: "keusik / pasir", ipa: "[kɯsik]" },
    "tanah": { bentuk: "taneuh", ipa: "[tanɯh]" },
    "langit": { bentuk: "langit", ipa: "[laŋit]" },
    "awan": { bentuk: "reueuk", ipa: "[rɯʔɯk]" },
    "matahari": { bentuk: "panonpoé", ipa: "[panɔnpɔɛ]" },
    "bulan": { bentuk: "bulan", ipa: "[bulan]" },
    "bintang": { bentuk: "bentang", ipa: "[bəntaŋ]" },
    "hujan": { bentuk: "ujan", ipa: "[udʒan]" },
    "angin": { bentuk: "angin", ipa: "[aŋin]" },
    "pohon": { bentuk: "tangkal", ipa: "[taŋkal]" },
    "daun": { bentuk: "daon", ipa: "[daɔn]" },
    "akar": { bentuk: "akar", ipa: "[akar]" },
    "ikan": { bentuk: "lauk / lauk laut", ipa: "[lauk]" },
    "burung": { bentuk: "manuk", ipa: "[manuk]" },
    "anjing": { bentuk: "anjing", ipa: "[andʒiŋ]" },
    "ular": { bentuk: "oray", ipa: "[ɔrai]" },
    "kutu": { bentuk: "kutu", ipa: "[kutu]" },
    "saya": { bentuk: "kuring / déwék", ipa: "[kuriŋ / dɛwɛk]" },
    "kamu": { bentuk: "manéh / silaing", ipa: "[manɛh / silaʔiŋ]" },
    "dia": { bentuk: "manéhna", ipa: "[manɛhna]" },
    "kami, kita": { bentuk: "urang", ipa: "[uraŋ]" },
    "mereka": { bentuk: "maranéhna", ipa: "[maranɛhna]" },
    "satu": { bentuk: "hiji", ipa: "[hidʒi]" },
    "dua": { bentuk: "dua", ipa: "[dua]" },
    "tiga": { bentuk: "tilu", ipa: "[tilu]" },
    "empat": { bentuk: "opat", ipa: "[ɔpat]" },
    "lima": { bentuk: "lima", ipa: "[lima]" },
    "semua": { bentuk: "kabéh", ipa: "[kabɛh]" },
    "banyak": { bentuk: "loba / ngaleut", ipa: "[lɔba]" },
    "besar": { bentuk: "gedé", ipa: "[gədɛ]" },
    "kecil": { bentuk: "leutik", ipa: "[lɯtik]" },
    "panjang": { bentuk: "panjang", ipa: "[pandʒaŋ]" },
    "pendek": { bentuk: "pondok", ipa: "[pɔndɔk]" },
    "hitam": { bentuk: "hideung", ipa: "[hidɯŋ]" },
    "putih": { bentuk: "bodas", ipa: "[bɔdas]" },
    "merah": { bentuk: "beureum", ipa: "[bɯrɯm]" },
    "kuning": { bentuk: "konéng", ipa: "[kɔnɛŋ]" },
    "hijau": { bentuk: "héjo", ipa: "[hɛdʒɔ]" },
    "dingin": { bentuk: "tiris / nyecep", ipa: "[tiris]" },
    "panas": { bentuk: "panas", ipa: "[panas]" },
    "mati": { bentuk: "paéh", ipa: "[paɛh]" },
    "hidup": { bentuk: "hirup", ipa: "[hirup]" },
    "datang": { bentuk: "datang", ipa: "[dataŋ]" },
    "berjalan": { bentuk: "leumpang", ipa: "[lɯmpaŋ]" }
  },

  // TP-04 Pangandaran (Sunda-Jawa Campuran / Banyumasan pesisir)
  'TP-04': {
    "air": { bentuk: "banyu / banyu tawa", ipa: "[baɲu]" },
    "api": { bentuk: "geni", ipa: "[gəni]" },
    "abu": { bentuk: "awu / lebu", ipa: "[awu / ləbu]" },
    "makan": { bentuk: "mangan / madang", ipa: "[maŋan / madaŋ]" },
    "minum": { bentuk: "ngombe", ipa: "[ŋɔmbɛ]" },
    "tidur": { bentuk: "turu", ipa: "[turu]" },
    "perut": { bentuk: "weteng", ipa: "[wətəŋ]" },
    "kepala": { bentuk: "sirah / ndhas", ipa: "[sirah / ndas]" },
    "mata": { bentuk: "mripat / mata", ipa: "[mripat / mata]" },
    "telinga": { bentuk: "kuping", ipa: "[kupiŋ]" },
    "tangan": { bentuk: "tangan", ipa: "[taŋan]" },
    "kaki": { bentuk: "sikil", ipa: "[sikil]" },
    "darah": { bentuk: "getih", ipa: "[gətih]" },
    "tulang": { bentuk: "balung", ipa: "[baluŋ]" },
    "batu": { bentuk: "watu", ipa: "[watu]" },
    "pasir": { bentuk: "wedhi", ipa: "[wədʰi]" },
    "tanah": { bentuk: "lemah", ipa: "[ləmah]" },
    "langit": { bentuk: "langit", ipa: "[laŋit]" },
    "awan": { bentuk: "mega / mendhung", ipa: "[mɛga / məndʰuŋ]" },
    "matahari": { bentuk: "srengéngé", ipa: "[srəŋɛŋɛ]" },
    "bulan": { bentuk: "wulan / rembulan", ipa: "[wulan / rəmbulan]" },
    "bintang": { bentuk: "lintang", ipa: "[lintaŋ]" },
    "hujan": { bentuk: "udan", ipa: "[udan]" },
    "angin": { bentuk: "angin / lesus", ipa: "[aŋin]" },
    "pohon": { bentuk: "wit / wit-witan", ipa: "[wit]" },
    "daun": { bentuk: "godhong", ipa: "[gɔdʰɔŋ]" },
    "akar": { bentuk: "oyod", ipa: "[ɔjɔd]" },
    "ikan": { bentuk: "iwak", ipa: "[iwak]" },
    "burung": { bentuk: "manuk", ipa: "[manuk]" },
    "anjing": { bentuk: "asu", ipa: "[asu]" },
    "ular": { bentuk: "ula", ipa: "[ula]" },
    "kutu": { bentuk: "kutu", ipa: "[kutu]" },
    "saya": { bentuk: "inyong / aku", ipa: "[iɲɔŋ / aku]" },
    "kamu": { bentuk: "rika / koé", ipa: "[rika / kɔɛ]" },
    "dia": { bentuk: "déwéké / piyambaké", ipa: "[dɛwɛkɛ]" },
    "kami, kita": { bentuk: "déwék / awake déwé", ipa: "[dɛwɛk]" },
    "mereka": { bentuk: "wong-wong kaé", ipa: "[wɔŋ-wɔŋ kaɛ]" },
    "satu": { bentuk: "siji", ipa: "[sidʒi]" },
    "dua": { bentuk: "loro", ipa: "[lɔrɔ]" },
    "tiga": { bentuk: "telu", ipa: "[təlu]" },
    "empat": { bentuk: "papat", ipa: "[papat]" },
    "lima": { bentuk: "lima", ipa: "[lima]" },
    "semua": { bentuk: "kabèh", ipa: "[kabɛh]" },
    "banyak": { bentuk: "akèh", ipa: "[akɛh]" },
    "besar": { bentuk: "gedhé", ipa: "[gədʰɛ]" },
    "kecil": { bentuk: "cilik", ipa: "[tʃilik]" },
    "panjang": { bentuk: "dawa", ipa: "[dawa]" },
    "pendek": { bentuk: "cendhèk", ipa: "[tʃəndʰɛk]" },
    "tebal": { bentuk: "kandel", ipa: "[kandəl]" },
    "tipis": { bentuk: "tipis", ipa: "[tipis]" },
    "hitam": { bentuk: "ireng", ipa: "[irəŋ]" },
    "putih": { bentuk: "putih", ipa: "[putih]" },
    "merah": { bentuk: "abang", ipa: "[abaŋ]" },
    "kuning": { bentuk: "kuning", ipa: "[kuniŋ]" },
    "hijau": { bentuk: "ijo", ipa: "[idʒɔ]" },
    "dingin": { bentuk: "adhem", ipa: "[adʰəm]" },
    "panas": { bentuk: "panas / sumuk", ipa: "[panas / sumuk]" },
    "mati": { bentuk: "mati / modar", ipa: "[mati]" },
    "hidup": { bentuk: "urip", ipa: "[urip]" },
    "datang": { bentuk: "teka", ipa: "[təka]" },
    "berjalan": { bentuk: "mlaku", ipa: "[mlaku]" },
    "melihat": { bentuk: "ndeleng / ngematna", ipa: "[ndələŋ]" },
    "mendengar": { bentuk: "ngrungokna", ipa: "[ŋruŋɔkna]" }
  }
};

/**
 * Mengambil kosakata titik pengamatan berdasarkan ID titik
 */
export function getVocabularyForPoint(
  pointId: string,
  kosakataLengkap?: KosakataLengkapData,
  titikPembandingList?: TitikPembandingDialektometri[],
  allSurveys?: SurveyRecord[]
): Record<string, { bentuk: string; ipa: string; catatan?: string }> {
  const result: Record<string, { bentuk: string; ipa: string; catatan?: string }> = {};

  // Jika cocok dengan salah satu survei dari database allSurveys
  const surveyMatch = allSurveys?.find(s => s.id === pointId);
  if (surveyMatch) {
    const swadesh = surveyMatch.data?.kosakataLengkap?.swadeshList || [];
    for (const item of swadesh) {
      if (item.bentukLokal && item.bentukLokal.trim() !== '') {
        result[item.glosIndonesia.toLowerCase().trim()] = {
          bentuk: item.bentukLokal,
          ipa: item.transkripsiIPA || `[${item.bentukLokal}]`,
          catatan: item.catatan
        };
      }
    }
    if (Object.keys(result).length > 0) {
      return result;
    }
  }

  // Jika titik adalah Titik Acuan (TP-01 / Ref)
  if (pointId === 'TP-REF' || pointId === 'TP-01') {
    const swadesh = kosakataLengkap?.swadeshList || [];
    for (const item of swadesh) {
      if (item.bentukLokal && item.bentukLokal.trim() !== '') {
        result[item.glosIndonesia.toLowerCase().trim()] = {
          bentuk: item.bentukLokal,
          ipa: item.transkripsiIPA || `[${item.bentukLokal}]`,
          catatan: item.catatan
        };
      }
    }
    // Fallback baseline dari Sunda Priangan jika kata belum diisi oleh surveyor
    const sundaPreset = COMPARATIVE_CORPUS_PRESETS.find(p => p.id === 'preset_sunda_priangan');
    if (sundaPreset) {
      for (const [glos, entry] of Object.entries(sundaPreset.entries)) {
        const cleanGlos = glos.toLowerCase().trim();
        if (!result[cleanGlos]) {
          result[cleanGlos] = {
            bentuk: entry.bentuk,
            ipa: entry.ipa,
            catatan: '(Baseline Priangan)'
          };
        }
      }
    }
    return result;
  }

  // Jika cocok dengan kamus titik terdaftar (TP-02, TP-03, TP-04)
  if (TP_SPECIFIC_DICTIONARIES[pointId]) {
    const specificDict = TP_SPECIFIC_DICTIONARIES[pointId];
    // Ambil baseline Sunda atau Jawa tergantung daerah titik
    const tpMeta = titikPembandingList?.find(t => t.id === pointId);
    const isJawaRelated = tpMeta?.bahasa?.toLowerCase().includes('jawa') || pointId === 'TP-04';
    const basePreset = COMPARATIVE_CORPUS_PRESETS.find(p => 
      isJawaRelated ? p.id === 'preset_jawa_banyumasan' : p.id === 'preset_sunda_priangan'
    );

    if (basePreset) {
      for (const [glos, entry] of Object.entries(basePreset.entries)) {
        result[glos.toLowerCase().trim()] = {
          bentuk: entry.bentuk,
          ipa: entry.ipa
        };
      }
    }

    for (const [glos, entry] of Object.entries(specificDict)) {
      result[glos.toLowerCase().trim()] = {
        bentuk: entry.bentuk,
        ipa: entry.ipa
      };
    }
    return result;
  }

  // Cek jika ID adalah preset korpus (misal preset_sunda_priangan, preset_jawa_banyumasan, dsb.)
  const preset = COMPARATIVE_CORPUS_PRESETS.find(p => p.id === pointId);
  if (preset) {
    for (const [glos, entry] of Object.entries(preset.entries)) {
      result[glos.toLowerCase().trim()] = {
        bentuk: entry.bentuk,
        ipa: entry.ipa
      };
    }
    return result;
  }

  // Default fallback jika titik kustom baru: generate representasi fonologis dialek
  const defaultPreset = COMPARATIVE_CORPUS_PRESETS[0];
  for (const [glos, entry] of Object.entries(defaultPreset.entries)) {
    result[glos.toLowerCase().trim()] = {
      bentuk: entry.bentuk,
      ipa: entry.ipa
    };
  }

  return result;
}

/**
 * Lakukan perbandingan otomatis menyeluruh antara dua titik pengamatan
 */
export function compareTwoPoints(
  point1Id: string,
  point1Label: string,
  point2Id: string,
  point2Label: string,
  kosakataLengkap?: KosakataLengkapData,
  titikPembandingList?: TitikPembandingDialektometri[],
  allSurveys?: SurveyRecord[]
): ComparisonResultStats {
  const vocab1 = getVocabularyForPoint(point1Id, kosakataLengkap, titikPembandingList, allSurveys);
  const vocab2 = getVocabularyForPoint(point2Id, kosakataLengkap, titikPembandingList, allSurveys);

  const wordRows: DialectComparisonWordRow[] = [];
  let sLeksikal = 0;
  let sFonem = 0;
  let sSama = 0;
  let validTestedCount = 0;

  // Bandingkan untuk seluruh 200 Swadesh glos resmi
  SWADESH_200_GLOS.forEach((glos, index) => {
    const cleanGlos = glos.toLowerCase().trim();
    const entry1 = vocab1[cleanGlos];
    const entry2 = vocab2[cleanGlos];

    const w1 = entry1?.bentuk || '';
    const ipa1 = entry1?.ipa || (w1 ? `[${w1}]` : '');
    const w2 = entry2?.bentuk || '';
    const ipa2 = entry2?.ipa || (w2 ? `[${w2}]` : '');

    if (!w1 || !w2) {
      wordRows.push({
        no: index + 1,
        glos,
        bentuk1: w1 || '(Belum Terisi)',
        ipa1,
        bentuk2: w2 || '(Belum Terisi)',
        ipa2,
        score: 0,
        category: 'BELUM_DIISI',
        isSignificant: false,
        note: 'Salah satu data titik pengamatan belum memiliki entri kosakata.'
      });
      return;
    }

    validTestedCount++;
    const classification = classifyWordPair(w1, w2, glos);

    let score = 0;
    let isSignificant = false;

    if (classification.category === 'BEDA_LEKSIKAL') {
      score = 1.0;
      isSignificant = true; // Skor dialektometri tinggi
      sLeksikal++;
    } else if (classification.category === 'BEDA_FONEM') {
      score = 0.5;
      isSignificant = false;
      sFonem++;
    } else {
      score = 0.0;
      isSignificant = false;
      sSama++;
    }

    const phoneticAlignment = alignPhoneticSegments(ipa1, ipa2, w1, w2, glos);

    wordRows.push({
      no: index + 1,
      glos,
      bentuk1: w1,
      ipa1,
      bentuk2: w2,
      ipa2,
      score,
      category: classification.category as any,
      isSignificant,
      note: classification.note,
      phoneticSimilarityPct: phoneticAlignment.similarityPct,
      phoneticAlignment,
      detectedShifts: phoneticAlignment.shifts.map(s => s.shiftType)
    });
  });

  const totalTested = validTestedCount > 0 ? validTestedCount : SWADESH_200_GLOS.length;
  // Rumus Guiter Dialektometri: s / n * 100%
  // di mana perbedaan leksikal dihitung penuh (1.0) dan perbedaan fonem dihitung setengah (0.5)
  const effectiveDifferenceCount = sLeksikal + (sFonem * 0.5);
  const persentasePerbedaan = parseFloat(((effectiveDifferenceCount / totalTested) * 100).toFixed(1));
  const persentaseKemiripan = parseFloat((Math.max(0, 100 - persentasePerbedaan)).toFixed(1));

  // Analisis Kemiripan Fonetik Agregat Seluruh Kosakata Swadesh
  const corpusPhoneticSummary = analyzeCorpusPhonetics(wordRows);
  const persentaseKemiripanFonetikIPA = corpusPhoneticSummary.meanSimilarityPct;

  // Klasifikasi Kategori Guiter:
  // • 81% – 100% = Kategori perbedaan bahasa (berbeda bahasa)
  // • 51% – 80% = Kategori perbedaan dialek (berbeda dialek)
  // • 31% – 50% = Kategori perbedaan subdialek
  // • 21% – 30% = Kategori perbedaan wicara (speech difference)
  // • Kurang dari 21% (≤ 20%): Kategori tidak berbeda (masih dalam satu variasi atau wicara yang sama)
  let statusGuiter: 'Tidak Berbeda' | 'Perbedaan Wicara' | 'Perbedaan Subdialek' | 'Perbedaan Dialek' | 'Perbedaan Bahasa' | 'Beda Wicara/Subdialek' | 'Beda Dialek' | 'Beda Subbahasa' | 'Beda Bahasa' = 'Tidak Berbeda';
  let statusBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';

  if (persentasePerbedaan >= 81) {
    statusGuiter = 'Perbedaan Bahasa';
    statusBadgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
  } else if (persentasePerbedaan >= 51) {
    statusGuiter = 'Perbedaan Dialek';
    statusBadgeColor = 'bg-orange-100 text-orange-800 border-orange-300';
  } else if (persentasePerbedaan >= 31) {
    statusGuiter = 'Perbedaan Subdialek';
    statusBadgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
  } else if (persentasePerbedaan >= 21) {
    statusGuiter = 'Perbedaan Wicara';
    statusBadgeColor = 'bg-sky-100 text-sky-800 border-sky-300';
  } else {
    statusGuiter = 'Tidak Berbeda';
    statusBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  }

  return {
    point1Name: point1Label,
    point2Name: point2Label,
    totalTested,
    jumlahBedaLeksikal: sLeksikal,
    jumlahBedaFonem: sFonem,
    jumlahSama: sSama,
    effectiveDifferenceCount,
    persentasePerbedaan,
    persentaseKemiripan,
    statusGuiter,
    statusBadgeColor,
    words: wordRows,
    persentaseKemiripanFonetikIPA,
    corpusPhoneticSummary
  };
}

/**
 * Ekspor ringkasan perbedaan dialektometri ke format CSV
 */
export function exportComparisonSummaryToCSV(stats: ComparisonResultStats): void {
  const headers = [
    'No',
    'Glos Indonesia',
    `Bentuk ${stats.point1Name}`,
    `IPA ${stats.point1Name}`,
    `Bentuk ${stats.point2Name}`,
    `IPA ${stats.point2Name}`,
    'Kemiripan Fonetik IPA (%)',
    'Pergeseran Fonem Terdeteksi',
    'Kategori Perbedaan',
    'Skor Dialektometri',
    'Status Signifikan',
    'Catatan Analisis'
  ];

  const rows = stats.words.map(w => [
    w.no,
    `"${w.glos.replace(/"/g, '""')}"`,
    `"${w.bentuk1.replace(/"/g, '""')}"`,
    `"${w.ipa1.replace(/"/g, '""')}"`,
    `"${w.bentuk2.replace(/"/g, '""')}"`,
    `"${w.ipa2.replace(/"/g, '""')}"`,
    w.phoneticSimilarityPct !== undefined ? `${w.phoneticSimilarityPct}%` : '-',
    `"${(w.detectedShifts || []).join('; ').replace(/"/g, '""')}"`,
    `"${w.category}"`,
    w.score,
    w.isSignificant ? 'SIGNIFIKAN (TINGGI)' : 'BIASA',
    `"${w.note.replace(/"/g, '""')}"`
  ]);

  const csvContent = [
    `# RINGKASAN PERBANDINGAN DIALEKTOMETRI & ANALISIS FONETIK IPA`,
    `# Titik 1: ${stats.point1Name}`,
    `# Titik 2: ${stats.point2Name}`,
    `# Persentase Perbedaan Leksikal: ${stats.persentasePerbedaan}% (${stats.statusGuiter})`,
    `# Persentase Kemiripan Leksikal: ${stats.persentaseKemiripan}%`,
    `# Persentase Kemiripan Fonetik IPA: ${stats.persentaseKemiripanFonetikIPA ?? '-'}%`,
    `# Total Kasus Pergeseran Fonem: ${stats.corpusPhoneticSummary?.totalShiftsDetected ?? 0}`,
    `# Jumlah Perbedaan Signifikan (Leksikal): ${stats.jumlahBedaLeksikal}`,
    `# Jumlah Perbedaan Fonemis: ${stats.jumlahBedaFonem}`,
    `# Jumlah Kognat Sama: ${stats.jumlahSama}`,
    '',
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `komparasi_dialektometri_${stats.point1Name.replace(/\s+/g, '_')}_vs_${stats.point2Name.replace(/\s+/g, '_')}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
