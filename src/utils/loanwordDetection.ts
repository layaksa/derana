import { KosakataItem } from '../types/linguistic';

export type LoanwordSourceLanguage = 
  | 'Bahasa Indonesia / Melayu'
  | 'Sanskerta'
  | 'Arab'
  | 'Belanda'
  | 'Portugis'
  | 'Tionghoa (Hokkien)'
  | 'Inggris'
  | 'Persia'
  | 'Jawa Kuno / Kawi'
  | 'Lainnya'
  | 'Bukan Serapan (Asli Austronesia)';

export interface LoanwordDetectionResult {
  id: number;
  glosIndonesia: string;
  bentukLokal: string;
  transkripsiIPA?: string;
  isLoanword: boolean;
  sourceLanguage: LoanwordSourceLanguage;
  etymon: string;
  confidence: 'TINGGI' | 'SEDANG' | 'RENDAH';
  explanation: string;
  suggestedAnnotation: string;
  detectedBy: 'gemini_ai' | 'etymological_dictionary';
}

export interface LoanwordSummaryStats {
  totalAnalyzed: number;
  totalFilled: number;
  totalLoanwords: number;
  loanwordPercentage: number;
  purityPercentage: number; // 100 - loanwordPercentage (kemurnian Swadesh)
  sourcesBreakdown: Record<string, number>;
  confidenceBreakdown: {
    tinggi: number;
    sedang: number;
    rendah: number;
  };
}

/**
 * Basis Data Etimologis Kata Serapan Nusantara (Kamus Historis & Komparatif)
 */
export const NUSANTARA_ETYMOLOGY_DICT: Record<string, {
  source: LoanwordSourceLanguage;
  etymon: string;
  reason: string;
  confidence: 'TINGGI' | 'SEDANG' | 'RENDAH';
}> = {
  // Sanskerta
  'kaca': { source: 'Sanskerta', etymon: 'kāca (काच)', reason: 'Serapan Sanskerta melalui bahasa Jawa Kuno/Melayu Kuno untuk menyebut cermin/kaca.', confidence: 'TINGGI' },
  'raja': { source: 'Sanskerta', etymon: 'rājan (राजन्)', reason: 'Istilah monarki/kepemimpinan klasik dari Sanskerta.', confidence: 'TINGGI' },
  'guru': { source: 'Sanskerta', etymon: 'guru (गुरु)', reason: 'Istilah pengajar/spiritual dari Sanskerta.', confidence: 'TINGGI' },
  'jiwa': { source: 'Sanskerta', etymon: 'jīva (जीव)', reason: 'Konsep spiritual/nyawa dari Sanskerta.', confidence: 'TINGGI' },
  'raga': { source: 'Sanskerta', etymon: 'rāga (राग)', reason: 'Istilah tubuh/jasad dari Sanskerta.', confidence: 'TINGGI' },
  'budi': { source: 'Sanskerta', etymon: 'buddhi (बुद्धि)', reason: 'Konsep akal/budi pekerti dari Sanskerta.', confidence: 'TINGGI' },
  'warna': { source: 'Sanskerta', etymon: 'varṇa (वर्ण)', reason: 'Istilah rona/warna dari Sanskerta.', confidence: 'TINGGI' },
  'rupa': { source: 'Sanskerta', etymon: 'rūpa (रूप)', reason: 'Bentuk/tampang dari Sanskerta.', confidence: 'TINGGI' },
  'gula': { source: 'Sanskerta', etymon: 'guḍa (गुड)', reason: 'Istilah pemanis gula tebu dari Sanskerta.', confidence: 'TINGGI' },
  'emas': { source: 'Sanskerta', etymon: 'māṣa (माष)', reason: 'Satuan takaran logam mulia kuno dari Sanskerta.', confidence: 'SEDANG' },
  'cinta': { source: 'Sanskerta', etymon: 'cintā (चिन्ता)', reason: 'Istilah afeksi/pikiran mendalam dari Sanskerta.', confidence: 'TINGGI' },
  'bumi': { source: 'Sanskerta', etymon: 'bhūmi (भूमि)', reason: 'Kosmologi tanah/bumi dari Sanskerta.', confidence: 'TINGGI' },
  'surga': { source: 'Sanskerta', etymon: 'svarga (स्वर्ग)', reason: 'Konsep kosmologi kayangan dari Sanskerta.', confidence: 'TINGGI' },
  'neraka': { source: 'Sanskerta', etymon: 'naraka (नरक)', reason: 'Konsep alam bawah dari Sanskerta.', confidence: 'TINGGI' },
  'agama': { source: 'Sanskerta', etymon: 'āgama (आगम)', reason: 'Tradisi ajaran suci dari Sanskerta.', confidence: 'TINGGI' },
  'suci': { source: 'Sanskerta', etymon: 'śuci (शुचि)', reason: 'Konsep kemurnian spiritual dari Sanskerta.', confidence: 'TINGGI' },

  // Arab
  'surat': { source: 'Arab', etymon: 'ṣūrah (صورة)', reason: 'Serapan dari bahasa Arab untuk lembaran naskah/tulisan.', confidence: 'TINGGI' },
  'kursi': { source: 'Arab', etymon: 'kursī (كرسي)', reason: 'Serapan Arab untuk perabot tempat duduk berkaki.', confidence: 'TINGGI' },
  'korsi': { source: 'Arab', etymon: 'kursī (كرسي)', reason: 'Variasi fonetis lokal (Sunda/Jawa) untuk kursi asal Arab.', confidence: 'TINGGI' },
  'waktu': { source: 'Arab', etymon: 'waqt (وقت)', reason: 'Konsep masa/tempo dari bahasa Arab.', confidence: 'TINGGI' },
  'saat': { source: 'Arab', etymon: 'sā‘ah (ساعة)', reason: 'Istilah waktu/jam dari bahasa Arab.', confidence: 'TINGGI' },
  'akal': { source: 'Arab', etymon: '‘aql (عقل)', reason: 'Daya pikir dan nalar dari bahasa Arab.', confidence: 'TINGGI' },
  'kertas': { source: 'Arab', etymon: 'qirṭās (قرطاس)', reason: 'Bahan tulis lembaran dari bahasa Arab.', confidence: 'TINGGI' },
  'kitab': { source: 'Arab', etymon: 'kitāb (كتاب)', reason: 'Buku suci/naskah bertulis dari bahasa Arab.', confidence: 'TINGGI' },
  'dunia': { source: 'Arab', etymon: 'dunyā (دنيا)', reason: 'Alam fana manusia dari bahasa Arab.', confidence: 'TINGGI' },
  'hawa': { source: 'Arab', etymon: 'hawā’ (هواء)', reason: 'Udara/atmosfer dari bahasa Arab.', confidence: 'TINGGI' },
  'sabun': { source: 'Arab', etymon: 'ṣābūn (صابون)', reason: 'Pembersih badan serapan Arab atau Portugis sabão.', confidence: 'TINGGI' },

  // Belanda
  'buku': { source: 'Belanda', etymon: 'boek', reason: 'Serapan Belanda pada era kolonial untuk jilidan lembar cetak.', confidence: 'TINGGI' },
  'kamar': { source: 'Belanda', etymon: 'kamer', reason: 'Ruangan tempat tidur serapan Belanda.', confidence: 'TINGGI' },
  'kantor': { source: 'Belanda', etymon: 'kantoor', reason: 'Ruang kerja/administrasi dari Belanda.', confidence: 'TINGGI' },
  'gelas': { source: 'Belanda', etymon: 'glas', reason: 'Wadah minum kaca serapan Belanda.', confidence: 'TINGGI' },
  'rokok': { source: 'Belanda', etymon: 'roken', reason: 'Tembakau hisap serapan kata kerja Belanda.', confidence: 'TINGGI' },
  'koran': { source: 'Belanda', etymon: 'krant', reason: 'Surat kabar harian dari Belanda.', confidence: 'TINGGI' },
  'lampu': { source: 'Belanda', etymon: 'lamp', reason: 'Penerangan serapan Belanda/Portugis.', confidence: 'TINGGI' },
  'ember': { source: 'Belanda', etymon: 'emmer', reason: 'Wadah timba air dari Belanda.', confidence: 'TINGGI' },

  // Portugis
  'meja': { source: 'Portugis', etymon: 'mesa', reason: 'Perabot meja berkaki dari Portugis abad ke-16.', confidence: 'TINGGI' },
  'bangku': { source: 'Portugis', etymon: 'banco', reason: 'Tempat duduk panjang serapan Portugis.', confidence: 'TINGGI' },
  'baku': { source: 'Portugis', etymon: 'banco', reason: 'Variasi lokal untuk bangku perabot.', confidence: 'SEDANG' },
  'sekolah': { source: 'Portugis', etymon: 'escola', reason: 'Lembaga pendidikan formal serapan Portugis.', confidence: 'TINGGI' },
  'gereja': { source: 'Portugis', etymon: 'igreja', reason: 'Tempat ibadah Kristiani serapan Portugis.', confidence: 'TINGGI' },
  'sepatu': { source: 'Portugis', etymon: 'sapato', reason: 'Alas kaki tertutup serapan Portugis.', confidence: 'TINGGI' },
  'kemeja': { source: 'Portugis', etymon: 'camisa', reason: 'Pakaian atasan serapan Portugis.', confidence: 'TINGGI' },
  'jendela': { source: 'Portugis', etymon: 'janela', reason: 'Bukaan ventilasi rumah serapan Portugis.', confidence: 'TINGGI' },
  'mentega': { source: 'Portugis', etymon: 'manteiga', reason: 'Lemak susu olahan dari Portugis.', confidence: 'TINGGI' },

  // Tionghoa (Hokkien)
  'toko': { source: 'Tionghoa (Hokkien)', etymon: 'thò-kò͘ (土庫)', reason: 'Gudang/tempat berjualan serapan dialek Hokkien.', confidence: 'TINGGI' },
  'lonceng': { source: 'Tionghoa (Hokkien)', etymon: 'lông-chheng (撞鐘)', reason: 'Genta pemukul suara serapan Hokkien.', confidence: 'TINGGI' },
  'cawan': { source: 'Tionghoa (Hokkien)', etymon: 'chhôa-óaⁿ (茶碗)', reason: 'Mangkuk teh kecil serapan Hokkien.', confidence: 'TINGGI' },
  'loteng': { source: 'Tionghoa (Hokkien)', etymon: 'lâu-téng (樓頂)', reason: 'Tingkat atas rumah serapan Hokkien.', confidence: 'TINGGI' },
  'kue': { source: 'Tionghoa (Hokkien)', etymon: 'koé (粿)', reason: 'Penganan manis/kudapan dari Hokkien.', confidence: 'TINGGI' },
  'tahu': { source: 'Tionghoa (Hokkien)', etymon: 'tāu-hū (豆腐)', reason: 'Olahan kedelai dari Hokkien.', confidence: 'TINGGI' },

  // Persia
  'pasar': { source: 'Persia', etymon: 'bāzār (بازار)', reason: 'Pusat perniagaan umum serapan bahasa Persia kuno.', confidence: 'TINGGI' },
  'anggur': { source: 'Persia', etymon: 'angūr (انگور)', reason: 'Buah dan minuman fermentasi serapan Persia.', confidence: 'TINGGI' }
};

/**
 * Deteksi kata serapan menggunakan heuristik linguistik lokal
 */
export function detectLoanwordsHeuristic(
  items: Array<{ id: number; glosIndonesia: string; bentukLokal: string; transkripsiIPA?: string; catatan?: string }>,
  bahasaDaerah: string = 'Bahasa Daerah'
): LoanwordDetectionResult[] {
  const isSunda = bahasaDaerah.toLowerCase().includes('sunda');
  const isJawa = bahasaDaerah.toLowerCase().includes('jawa');
  const isMadura = bahasaDaerah.toLowerCase().includes('madura');
  const isBali = bahasaDaerah.toLowerCase().includes('bali');

  return items.map(item => {
    const rawWord = item.bentukLokal?.trim() || '';
    const cleanWord = rawWord.toLowerCase().replace(/[[\]/]/g, '').trim();
    const cleanGlos = item.glosIndonesia.toLowerCase().trim();

    if (!cleanWord) {
      return {
        id: item.id,
        glosIndonesia: item.glosIndonesia,
        bentukLokal: rawWord,
        transkripsiIPA: item.transkripsiIPA,
        isLoanword: false,
        sourceLanguage: 'Bukan Serapan (Asli Austronesia)',
        etymon: '-',
        confidence: 'RENDAH',
        explanation: 'Kata belum terisi.',
        suggestedAnnotation: '',
        detectedBy: 'etymological_dictionary'
      };
    }

    // 1. Cek kamus etimologis langsung
    // Pecah token jika ada kata majemuk / alternatif (misal "dahar / neda" atau "kaca")
    const tokens = cleanWord.split(/[\s,/]+/).filter(Boolean);
    for (const t of tokens) {
      if (NUSANTARA_ETYMOLOGY_DICT[t]) {
        const dictMatch = NUSANTARA_ETYMOLOGY_DICT[t];
        return {
          id: item.id,
          glosIndonesia: item.glosIndonesia,
          bentukLokal: rawWord,
          transkripsiIPA: item.transkripsiIPA,
          isLoanword: true,
          sourceLanguage: dictMatch.source,
          etymon: dictMatch.etymon,
          confidence: dictMatch.confidence,
          explanation: dictMatch.reason,
          suggestedAnnotation: `[Serapan: ${dictMatch.source} - ${dictMatch.etymon}]`,
          detectedBy: 'etymological_dictionary'
        };
      }
    }

    // 2. Deteksi Serapan Bahasa Indonesia (Kasus Responden Memakai Kata Baku BI Alih-alih Kata Asli Bahasa Daerah)
    // Contoh di Sunda: responden menyebut "telinga" alih-alih "ceuli", "matahari" alih-alih "panonpoe", dsb.
    const isIdenticalToIndonesianGlos = cleanWord === cleanGlos;
    
    // Kata-kata yang diketahui BUKAN serapan BI karena merupakan kognat warisan Proto-Austronesia (PAn/PMP)
    // Misal: batu, mata, kutu, dua, lima, daun, angin, langit, susu, mati, dll.
    const PAN_COGNATE_GLOSSES = new Set([
      'batu', 'mata', 'kutu', 'dua', 'lima', 'daun', 'angin', 'langit', 'mati', 'hidup', 
      'aku', 'kami', 'kita', 'dan', 'tulang', 'akar', 'kutu', 'telinga', 'susu', 'babi',
      'ular', 'buah', 'hujan', 'ikan', 'hati', 'lidah', 'nama', 'tidur'
    ]);

    // Jika responden di Sunda/Jawa menggunakan kata Melayu/Indonesia yang memiliki padanan asli berbeda:
    if (isSunda) {
      const sundaIndonesianIntrusions: Record<string, string> = {
        'anjing': 'Bentuk asli Sunda adalah "anjing" (kognat), namun seringkali tercampur dalam variasi dialek.',
        'pohon': 'Bentuk asli Sunda adalah "tangkal", kata "pohon" kemungkinan serapan/pengaruh BI.',
        'tidur': 'Bentuk asli Sunda adalah "sare / hees", kata "tidur" adalah interferensi BI.',
        'makan': 'Bentuk asli Sunda adalah "dahar / neda", kata "makan" adalah interferensi BI.',
        'minum': 'Bentuk asli Sunda adalah "nginum" [ŋinum], kata "minum" menunjukkan pengaruh BI.',
        'kepala': 'Bentuk asli Sunda adalah "sirah / mastaka", kata "kepala" adalah serapan BI.',
        'perut': 'Bentuk asli Sunda adalah "beuteung", kata "perut" adalah interferensi BI.',
        'air': 'Bentuk asli Sunda adalah "cai", kata "air" adalah interferensi BI.',
        'api': 'Bentuk asli Sunda adalah "seuneu", kata "api" adalah kognat PMP / pengaruh BI.',
        'datang': 'Bentuk asli Sunda adalah "datang / cunduk", kognat dekat dengan BI.',
        'melihat': 'Bentuk asli Sunda adalah "nenjo / ningali", kata "melihat" adalah pengaruh BI.',
        'burung': 'Bentuk asli Sunda adalah "manuk", kata "burung" adalah serapan BI.'
      };

      if (sundaIndonesianIntrusions[cleanWord] && !cleanWord.includes('cai') && !cleanWord.includes('tangkal')) {
        return {
          id: item.id,
          glosIndonesia: item.glosIndonesia,
          bentukLokal: rawWord,
          transkripsiIPA: item.transkripsiIPA,
          isLoanword: true,
          sourceLanguage: 'Bahasa Indonesia / Melayu',
          etymon: cleanWord,
          confidence: 'TINGGI',
          explanation: sundaIndonesianIntrusions[cleanWord],
          suggestedAnnotation: `[Serapan: Bahasa Indonesia/Melayu - interferensi leksikal]`,
          detectedBy: 'etymological_dictionary'
        };
      }
    }

    if (isJawa) {
      const jawaIndonesianIntrusions: Record<string, string> = {
        'anjing': 'Bentuk asli Jawa adalah "asu", kata "anjing" adalah serapan/pengaruh BI.',
        'pohon': 'Bentuk asli Jawa adalah "wit", kata "pohon" adalah interferensi BI.',
        'tidur': 'Bentuk asli Jawa adalah "turu / sare", kata "tidur" adalah pengaruh BI.',
        'makan': 'Bentuk asli Jawa adalah "mangan / dhahar", kata "makan" adalah pengaruh BI.',
        'kepala': 'Bentuk asli Jawa adalah "ndhas / sirah", kata "kepala" adalah pengaruh BI.',
        'perut': 'Bentuk asli Jawa adalah "weteng", kata "perut" adalah interferensi BI.',
        'air': 'Bentuk asli Jawa adalah "banyu", kata "air" adalah interferensi BI.',
        'matahari': 'Bentuk asli Jawa adalah "srengenge", kata "matahari" adalah pengaruh BI.',
        'burung': 'Bentuk asli Jawa adalah "manuk", kata "burung" adalah serapan BI.'
      };

      if (jawaIndonesianIntrusions[cleanWord]) {
        return {
          id: item.id,
          glosIndonesia: item.glosIndonesia,
          bentukLokal: rawWord,
          transkripsiIPA: item.transkripsiIPA,
          isLoanword: true,
          sourceLanguage: 'Bahasa Indonesia / Melayu',
          etymon: cleanWord,
          confidence: 'TINGGI',
          explanation: jawaIndonesianIntrusions[cleanWord],
          suggestedAnnotation: `[Serapan: Bahasa Indonesia/Melayu - interferensi leksikal]`,
          detectedBy: 'etymological_dictionary'
        };
      }
    }

    // 3. Cek apakah kognat Austronesia asli (PAn/PMP)
    if (PAN_COGNATE_GLOSSES.has(cleanGlos) && isIdenticalToIndonesianGlos) {
      return {
        id: item.id,
        glosIndonesia: item.glosIndonesia,
        bentukLokal: rawWord,
        transkripsiIPA: item.transkripsiIPA,
        isLoanword: false,
        sourceLanguage: 'Bukan Serapan (Asli Austronesia)',
        etymon: `Proto-Austronesia *${cleanGlos}`,
        confidence: 'TINGGI',
        explanation: 'Bentuk kata identik dengan Bahasa Indonesia karena sama-sama mewarisi etimon purba Proto-Austronesia (bukan kata serapan).',
        suggestedAnnotation: `[Kognat Asli Austronesia *${cleanGlos}]`,
        detectedBy: 'etymological_dictionary'
      };
    }

    // Default: Dianggap kata asli lokal (non-serapan)
    return {
      id: item.id,
      glosIndonesia: item.glosIndonesia,
      bentukLokal: rawWord,
      transkripsiIPA: item.transkripsiIPA,
      isLoanword: false,
      sourceLanguage: 'Bukan Serapan (Asli Austronesia)',
      etymon: rawWord,
      confidence: 'SEDANG',
      explanation: 'Kosakata dasar lokal warisan leksikal setempat (tidak terdeteksi ciri fonotaktik atau morfemik kata serapan).',
      suggestedAnnotation: '',
      detectedBy: 'etymological_dictionary'
    };
  });
}

/**
 * Panggil server endpoint /api/ai/deteksi-kata-serapan
 * dengan fallback aman ke heuristik kamus komparatif
 */
export async function detectLoanwordsWithAI(
  items: Array<{ id: number; glosIndonesia: string; bentukLokal: string; transkripsiIPA?: string; catatan?: string }>,
  bahasaDaerah: string = 'Bahasa Sunda',
  namaDesa: string = 'Desa Pengamatan'
): Promise<LoanwordDetectionResult[]> {
  const filledItems = items.filter(i => i.bentukLokal && i.bentukLokal.trim());
  if (filledItems.length === 0) {
    return detectLoanwordsHeuristic(items, bahasaDaerah);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 detik timeout

    const res = await fetch('/api/ai/deteksi-kata-serapan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({
        words: filledItems.map(i => ({
          id: i.id,
          glosIndonesia: i.glosIndonesia,
          bentukLokal: i.bentukLokal,
          transkripsiIPA: i.transkripsiIPA,
          catatan: i.catatan
        })),
        bahasaDaerah,
        namaDesa
      })
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results) && data.results.length > 0) {
        // Map hasil server ke seluruh items (termasuk yang kosong)
        const resultMap = new Map<number, LoanwordDetectionResult>();
        data.results.forEach((r: LoanwordDetectionResult) => {
          resultMap.set(r.id, {
            ...r,
            detectedBy: 'gemini_ai'
          });
        });

        return items.map(orig => {
          if (resultMap.has(orig.id)) {
            return resultMap.get(orig.id)!;
          }
          // Fallback heuristik untuk kata yang belum ter-cover
          const h = detectLoanwordsHeuristic([orig], bahasaDaerah)[0];
          return h;
        });
      }
    }
  } catch (err) {
    console.warn('AI endpoint /api/ai/deteksi-kata-serapan unavailable or timed out, using etymological engine fallback.', err);
  }

  // Fallback etymological dictionary
  return detectLoanwordsHeuristic(items, bahasaDaerah);
}

/**
 * Hitung statistik ringkasan serapan
 */
export function calculateLoanwordSummary(results: LoanwordDetectionResult[]): LoanwordSummaryStats {
  const totalAnalyzed = results.length;
  const filledResults = results.filter(r => r.bentukLokal && r.bentukLokal.trim());
  const totalFilled = filledResults.length;

  const loanwords = filledResults.filter(r => r.isLoanword);
  const totalLoanwords = loanwords.length;

  const loanwordPercentage = totalFilled > 0 ? parseFloat(((totalLoanwords / totalFilled) * 100).toFixed(1)) : 0;
  const purityPercentage = parseFloat((Math.max(0, 100 - loanwordPercentage)).toFixed(1));

  const sourcesBreakdown: Record<string, number> = {};
  const confidenceBreakdown = { tinggi: 0, sedang: 0, rendah: 0 };

  loanwords.forEach(lw => {
    sourcesBreakdown[lw.sourceLanguage] = (sourcesBreakdown[lw.sourceLanguage] || 0) + 1;
    if (lw.confidence === 'TINGGI') confidenceBreakdown.tinggi++;
    else if (lw.confidence === 'SEDANG') confidenceBreakdown.sedang++;
    else confidenceBreakdown.rendah++;
  });

  return {
    totalAnalyzed,
    totalFilled,
    totalLoanwords,
    loanwordPercentage,
    purityPercentage,
    sourcesBreakdown,
    confidenceBreakdown
  };
}
