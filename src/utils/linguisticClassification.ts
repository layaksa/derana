import { TitikPengamatan, SituasiGeografis, TitikPembandingDialektometri } from '../types/linguistic';
import { calculateDistanceKm, hitungDialektometri, parseNum } from './calculations';

export type ThresholdStandardId = 'badan_bahasa' | 'swadesh_leksikostatistik' | 'dialektologi_kritis' | 'kustom';

export interface ThresholdConfig {
  id: ThresholdStandardId;
  name: string;
  source: string;
  description: string;
  t1: number; // Wicara -> Dialek boundary (e.g. 20%)
  t2: number; // Dialek -> Subbahasa boundary (e.g. 50%)
  t3: number; // Subbahasa -> Bahasa boundary (e.g. 80%)
  labelWicara: string;
  labelDialek: string;
  labelSubbahasa: string;
  labelBahasa: string;
}

export const PRESET_THRESHOLDS: Record<Exclude<ThresholdStandardId, 'kustom'>, ThresholdConfig> = {
  badan_bahasa: {
    id: 'badan_bahasa',
    name: 'Skala Dialektometri Leksikal (Badan Bahasa)',
    source: 'Badan Pengembangan dan Pembinaan Bahasa / Guiter',
    description: 'Skala dialektometri leksikal: ≤20% Tidak Berbeda, 21-30% Perbedaan Wicara, 31-50% Perbedaan Subdialek, 51-80% Perbedaan Dialek, 81-100% Perbedaan Bahasa.',
    t1: 20,
    t2: 50,
    t3: 80,
    labelWicara: 'Tidak Berbeda (≤20%) / Beda Wicara (21-30%)',
    labelDialek: 'Perbedaan Subdialek (31-50%)',
    labelSubbahasa: 'Perbedaan Dialek (51-80%)',
    labelBahasa: 'Perbedaan Bahasa (81-100%)'
  },
  swadesh_leksikostatistik: {
    id: 'swadesh_leksikostatistik',
    name: 'Leksikostatistik Swadesh (Kekerabatan Bahasa)',
    source: 'Morris Swadesh (1955) & Keraf (1984) / Austronesian Glottochronology',
    description: 'Klasifikasi pohon silsilah kekerabatan leksikal: <20% Satu Bahasa, 20-64% Dialek Serumpun/Keluarga Dekat, 65-88% Keluarga Bahasa (Family), >88% Stok/Filum Berlainan.',
    t1: 19,
    t2: 64,
    t3: 88,
    labelWicara: 'Varian Bahasa Tunggal (Kognat 81-100%)',
    labelDialek: 'Dialek Serumpun (Kognat 36-80%)',
    labelSubbahasa: 'Keluarga Bahasa (Family, Kognat 12-35%)',
    labelBahasa: 'Stok / Filum Terpisah (Kognat < 12%)'
  },
  dialektologi_kritis: {
    id: 'dialektologi_kritis',
    name: 'Dialektologi Konservatif (Dialect Split)',
    source: 'Dialektologi Komparatif Wilayah Kepulauan / Chambers & Trudgill',
    description: 'Ambang batas lebih ketat untuk wilayah pulau terisolasi: 0-15% Wicara Lokal, 16-40% Varian Dialek, 41-70% Transisi Subbahasa, 71-100% Bahasa Berbeda.',
    t1: 15,
    t2: 40,
    t3: 70,
    labelWicara: 'Wicara Setempat (Patois)',
    labelDialek: 'Dialek Lokal',
    labelSubbahasa: 'Subbahasa Transisi',
    labelBahasa: 'Bahasa Berbeda Penuh'
  }
};

export interface ClassificationResult {
  persentase: number;
  level: 'wicara' | 'dialek' | 'subbahasa' | 'bahasa';
  kategori: string;
  badgeClass: string;
  hexColor: string;
  mutualIntelligibility: string;
  estimasiWaktuPisah: string;
  deskripsi: string;
  statusKekerabatan: string;
  rekomendasi: string;
}

/**
 * Menghitung estimasi kedalaman waktu pisah (time depth) leksikostatistik glotokronologi Swadesh
 * Formula: t = ln(C) / (2 * ln(r))
 * C = persentase kemiripan (kognat) desimal (0 - 1)
 * r = retensi kosakata dasar konstan Swadesh (0.805 per 1000 tahun)
 */
export function estimateGlottochronologyTimeDepth(persentaseBeda: number): {
  tahun: number;
  abad: string;
  keterangan: string;
} {
  const kemiripan = Math.max(0.01, Math.min(0.999, (100 - persentaseBeda) / 100));
  const r = 0.805; // Konstanta retensi Swadesh untuk daftar 200 kosakata
  const logC = Math.log(kemiripan);
  const twoLogR = 2 * Math.log(r); // -0.434

  const timeInMillennia = logC / twoLogR;
  const timeInYears = Math.max(0, Math.round(timeInMillennia * 1000));

  if (persentaseBeda <= 5) {
    return {
      tahun: 0,
      abad: 'Era Kontemporer',
      keterangan: 'Belum terjadi pemisahan kronologis yang terukur (kontinuum wicara sezaman).'
    };
  }

  if (timeInYears < 500) {
    return {
      tahun: timeInYears,
      abad: `Sekitar ${timeInYears} tahun lalu (${Math.ceil(timeInYears / 100)} abad)`,
      keterangan: 'Pemisahan baru / variasi internal dialektal masa kini.'
    };
  }

  const centuries = (timeInYears / 100).toFixed(1);
  return {
    tahun: timeInYears,
    abad: `Sekitar ${timeInYears.toLocaleString()} tahun lalu (${centuries} abad)`,
    keterangan: timeInYears < 1500 
      ? 'Divergensi subdialek/dialek pada masa kerajaan atau migrasi regional.' 
      : 'Divergensi cabang rumpun bahasa prasejarah.'
  };
}

/**
 * Klasifikasi hubungan kekerabatan bahasa berdasarkan ambang batas yang ditentukan
 */
export function classifyLanguageRelationship(
  persentaseBeda: number,
  config: ThresholdConfig = PRESET_THRESHOLDS.badan_bahasa
): ClassificationResult {
  const p = Math.max(0, Math.min(100, Math.round(persentaseBeda * 10) / 10));
  const timeDepth = estimateGlottochronologyTimeDepth(p);

  // Specific handling for standard Badan Bahasa 5-tier dialectometry scale
  if (config.id === 'badan_bahasa') {
    if (p <= 20) {
      return {
        persentase: p,
        level: 'wicara',
        kategori: 'Tidak Berbeda',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        hexColor: '#10b981',
        mutualIntelligibility: '95% – 100% (Saling Paham Penuh)',
        estimasiWaktuPisah: timeDepth.abad,
        deskripsi: 'Perbedaan leksikal ≤ 20%: Kategori tidak berbeda (masih dalam satu variasi atau wicara yang sama). Penutur saling memahami tuturan secara penuh.',
        statusKekerabatan: 'Satu Variasi / Wicara yang Sama (Tidak Berbeda)',
        rekomendasi: 'Dikelompokkan ke dalam satu variasi tutur atau wicara yang sama. Tidak memerlukan pemisahan leksikal.'
      };
    } else if (p <= 30) {
      return {
        persentase: p,
        level: 'wicara',
        kategori: 'Perbedaan Wicara',
        badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
        hexColor: '#0284c7',
        mutualIntelligibility: '90% – 95% (Saling Paham Sangat Tinggi)',
        estimasiWaktuPisah: timeDepth.abad,
        deskripsi: 'Perbedaan leksikal 21% – 30%: Kategori perbedaan wicara (speech difference). Perbedaan terbatas pada variasi fonetik, intonasi, atau ungkapan khas setempat.',
        statusKekerabatan: 'Perbedaan Wicara (Speech Difference)',
        rekomendasi: 'Didokumentasikan sebagai perbedaan wicara lokal dalam satu subdialek/dialek yang sama.'
      };
    } else if (p <= 50) {
      return {
        persentase: p,
        level: 'dialek',
        kategori: 'Perbedaan Subdialek',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
        hexColor: '#f59e0b',
        mutualIntelligibility: '75% – 89% (Saling Paham Tinggi)',
        estimasiWaktuPisah: timeDepth.abad,
        deskripsi: 'Perbedaan leksikal 31% – 50%: Kategori perbedaan subdialek. Terdapat variasi kosakata menengah namun pemahaman timbal balik tetap terjaga.',
        statusKekerabatan: 'Perbedaan Subdialek',
        rekomendasi: 'Ditetapkan sebagai subdialek tersendiri di bawah dialek induk yang bersangkutan.'
      };
    } else if (p <= 80) {
      return {
        persentase: p,
        level: 'subbahasa',
        kategori: 'Perbedaan Dialek',
        badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
        hexColor: '#ea580c',
        mutualIntelligibility: '45% – 74% (Saling Paham Sedang / Terbatas)',
        estimasiWaktuPisah: timeDepth.abad,
        deskripsi: 'Perbedaan leksikal 51% – 80%: Kategori perbedaan dialek (berbeda dialek). Memiliki struktur leksikal khas yang membedakannya secara jelas sebagai dialek berbeda.',
        statusKekerabatan: 'Perbedaan Dialek (Berbeda Dialek)',
        rekomendasi: 'Diakui sebagai dialek berbeda dalam peta bahasa daerah bersangkutan.'
      };
    } else {
      return {
        persentase: p,
        level: 'bahasa',
        kategori: 'Perbedaan Bahasa',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
        hexColor: '#ef4444',
        mutualIntelligibility: '< 30% (Tidak Saling Memahami secara Alami)',
        estimasiWaktuPisah: timeDepth.abad,
        deskripsi: 'Perbedaan leksikal 81% – 100%: Kategori perbedaan bahasa (berbeda bahasa). Garis batas bahasa tegas (isogloss boundary) dan merupakan entitas bahasa tersendiri.',
        statusKekerabatan: 'Perbedaan Bahasa (Berbeda Bahasa)',
        rekomendasi: 'Ditetapkan sebagai dua bahasa yang berbeda secara mandiri dalam pemetaan bahasa nasional.'
      };
    }
  }

  if (p <= config.t1) {
    return {
      persentase: p,
      level: 'wicara',
      kategori: config.labelWicara,
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      hexColor: '#10b981',
      mutualIntelligibility: '95% – 100% (Saling Paham Penuh)',
      estimasiWaktuPisah: timeDepth.abad,
      deskripsi: `Perbedaan leksikal sangat rendah (≤${config.t1}%). Penutur dari kedua titik saling memahami ujaran tanpa hambatan (mutual intelligibility penuh). Perbedaan hanya terbatas pada variasi fonetis atau ungkapan wicara setempat.`,
      statusKekerabatan: 'Satu Bahasa Tunggal (Variasi Wicara Lokal)',
      rekomendasi: 'Dikelompokkan ke dalam satu varian tutur yang sama. Tidak memerlukan glosarium terpisah dalam kamus daerah.'
    };
  } else if (p <= config.t2) {
    return {
      persentase: p,
      level: 'dialek',
      kategori: config.labelDialek,
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
      hexColor: '#3b82f6',
      mutualIntelligibility: '70% – 90% (Saling Paham Tinggi dengan Variasi Kata)',
      estimasiWaktuPisah: timeDepth.abad,
      deskripsi: `Perbedaan leksikal tingkat moderat (${config.t1 + 1}% – ${config.t2}%). Masih berada dalam naungan satu bahasa induk yang sama, namun telah membentuk dialek tersendiri dengan kosakata khas daerah.`,
      statusKekerabatan: 'Dialek Berbeda dalam Satu Bahasa Serumpun',
      rekomendasi: 'Direkomendasikan untuk didokumentasikan sebagai variasi dialek resmi daerah bersangkutan dalam peta dialek Badan Bahasa.'
    };
  } else if (p <= config.t3) {
    return {
      persentase: p,
      level: 'subbahasa',
      kategori: config.labelSubbahasa,
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      hexColor: '#f59e0b',
      mutualIntelligibility: '40% – 65% (Saling Paham Parsial / Terbatas)',
      estimasiWaktuPisah: timeDepth.abad,
      deskripsi: `Perbedaan leksikal signifikan (${config.t2 + 1}% – ${config.t3}%). Mengindikasikan fase transisi linguistik tinggi (subbahasa). Penutur hanya memahami konteks umum dan mengalami kendala kosakata khas.`,
      statusKekerabatan: 'Subbahasa (Zona Transisi / Divergensi Leksikal Tinggi)',
      rekomendasi: 'Memerlukan penelitian sosiolinguistik lanjutan (uji intelligibility langsung/SRT) untuk memastikan apakah masih satu bahasa atau sudah terpisah.'
    };
  } else {
    return {
      persentase: p,
      level: 'bahasa',
      kategori: config.labelBahasa,
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
      hexColor: '#ef4444',
      mutualIntelligibility: '< 30% (Tidak Saling Memahami secara Alami)',
      estimasiWaktuPisah: timeDepth.abad,
      deskripsi: `Perbedaan leksikal melampaui batas dialek (>${config.t3}%). Diakui sebagai bahasa yang berbeda penuh secara linguistik dengan garis batas bahasa (isogloss boundary) yang tegas.`,
      statusKekerabatan: 'Bahasa Berbeda Penuh (Batas Bahasa / Language Boundary)',
      rekomendasi: 'Ditetapkan sebagai dua bahasa yang mandiri dan berbeda kode tutur. Perlu entri bahasa tersendiri dalam peta bahasa nasional.'
    };
  }
}

export interface LinguisticInterpretationReport {
  timestamp: string;
  configUsed: ThresholdConfig;
  titikAcuanName: string;
  titikAcuanDesa: string;
  titikAcuanBahasa: string;
  totalTitikPembanding: number;
  averageDiff: number;
  averageSimilarity: number;
  summaryStatus: string;
  counts: {
    wicara: number;
    dialek: number;
    subbahasa: number;
    bahasa: number;
  };
  dominantLevel: 'wicara' | 'dialek' | 'subbahasa' | 'bahasa';
  dominantLevelLabel: string;
  closestPoint: {
    name: string;
    desa: string;
    diff: number;
    dist: number;
    kategori: string;
  } | null;
  farthestPoint: {
    name: string;
    desa: string;
    diff: number;
    dist: number;
    kategori: string;
  } | null;
  spatialCorrelationStatus: string;
  kesimpulanAkademik: string;
  catatanIsoglosOtomatis: string;
}

/**
 * Generator narasi interpretasi otomatis kekerabatan bahasa & geolinguistik komprehensif
 */
export function generateLinguisticInterpretationReport(
  titikPengamatan: TitikPengamatan,
  situasiGeografis: SituasiGeografis,
  titikPembandingList: TitikPembandingDialektometri[],
  config: ThresholdConfig = PRESET_THRESHOLDS.badan_bahasa
): LinguisticInterpretationReport {
  const refDesa = titikPengamatan.namaDesa || 'Titik Acuan Utama';
  const refBahasa = titikPengamatan.bahasaDigunakan || 'Bahasa Pengamatan Setempat';
  const refKecamatan = titikPengamatan.kecamatan || '';
  const refKab = titikPengamatan.kabupatenKota || '';
  const refLat = parseNum(situasiGeografis.koordinatLintang) || -7.4982;
  const refLon = parseNum(situasiGeografis.koordinatBujur) || 107.3485;

  const evaluated = titikPembandingList.map((tp, idx) => {
    const calc = hitungDialektometri(tp.jumlahBeda, tp.jumlahGlos);
    const classification = classifyLanguageRelationship(calc.persentase, config);
    const dist = calculateDistanceKm(refLat, refLon, tp.lintang, tp.bujur);

    return {
      id: tp.id,
      name: tp.namaTitik || `TP-0${idx + 2}`,
      desa: tp.desa || '-',
      bahasa: tp.bahasa || '-',
      dist,
      diff: calc.persentase,
      similarity: Math.round((100 - calc.persentase) * 10) / 10,
      classification
    };
  });

  const total = evaluated.length;
  if (total === 0) {
    return {
      timestamp: new Date().toLocaleDateString('id-ID'),
      configUsed: config,
      titikAcuanName: refDesa,
      titikAcuanDesa: refDesa,
      titikAcuanBahasa: refBahasa,
      totalTitikPembanding: 0,
      averageDiff: 0,
      averageSimilarity: 100,
      summaryStatus: 'Belum ada data titik pembanding',
      counts: { wicara: 0, dialek: 0, subbahasa: 0, bahasa: 0 },
      dominantLevel: 'wicara',
      dominantLevelLabel: 'Belum Terklasifikasi',
      closestPoint: null,
      farthestPoint: null,
      spatialCorrelationStatus: 'Data belum memadai untuk uji korelasi spasial',
      kesimpulanAkademik: 'Belum ada data titik pembanding dialektometri yang dimasukkan. Silakan tambahkan titik pembanding untuk menghasilkan interpretasi otomatis.',
      catatanIsoglosOtomatis: 'Garis isoglos belum dapat ditarik karena titik pengamatan pembanding belum diinput.'
    };
  }

  const sumDiff = evaluated.reduce((acc, curr) => acc + curr.diff, 0);
  const avgDiff = Math.round((sumDiff / total) * 10) / 10;
  const avgSimilarity = Math.round((100 - avgDiff) * 10) / 10;

  const counts = { wicara: 0, dialek: 0, subbahasa: 0, bahasa: 0 };
  let closest = evaluated[0];
  let farthest = evaluated[0];

  evaluated.forEach((item) => {
    counts[item.classification.level]++;
    if (item.diff < closest.diff) closest = item;
    if (item.diff > farthest.diff) farthest = item;
  });

  // Dominant category
  let dominantLevel: 'wicara' | 'dialek' | 'subbahasa' | 'bahasa' = 'wicara';
  let maxCount = counts.wicara;
  if (counts.dialek > maxCount) {
    dominantLevel = 'dialek';
    maxCount = counts.dialek;
  }
  if (counts.subbahasa > maxCount) {
    dominantLevel = 'subbahasa';
    maxCount = counts.subbahasa;
  }
  if (counts.bahasa > maxCount) {
    dominantLevel = 'bahasa';
    maxCount = counts.bahasa;
  }

  const dominantLabels: Record<string, string> = {
    wicara: config.labelWicara,
    dialek: config.labelDialek,
    subbahasa: config.labelSubbahasa,
    bahasa: config.labelBahasa
  };
  const dominantLevelLabel = dominantLabels[dominantLevel];

  // Pearson Spatial Correlation check
  const avgDist = evaluated.reduce((a, b) => a + b.dist, 0) / total;
  let num = 0;
  let denX = 0;
  let denY = 0;
  evaluated.forEach((item) => {
    const dx = item.dist - avgDist;
    const dy = item.diff - avgDiff;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  });
  const pearsonR = (denX > 0 && denY > 0) ? Math.round((num / (Math.sqrt(denX) * Math.sqrt(denY))) * 100) / 100 : 0;

  let spatialCorrelationStatus = '';
  if (pearsonR >= 0.6) {
    spatialCorrelationStatus = `Korelasi spasial positif kuat (r = +${pearsonR}), membuktikan hipotesis Isolation by Distance di mana semakin jauh jarak fisik, semakin besar diferensiasi leksikal.`;
  } else if (pearsonR >= 0.3) {
    spatialCorrelationStatus = `Korelasi spasial moderat (r = +${pearsonR}), menunjukkan pengaruh gabungan antara jarak fisik dan interaksi migrasi/topografi.`;
  } else {
    spatialCorrelationStatus = `Korelasi spasial rendah/non-linier (r = ${pearsonR > 0 ? '+' : ''}${pearsonR}), mengindikasikan variasi leksikal lebih dipengaruhi batas geografis tajam (sungai/pegunungan) atau kantong tuturan historis.`;
  }

  // Generate Academic Text for `kesimpulanGeolinguistik`
  const wicaraDesas = evaluated.filter(e => e.classification.level === 'wicara').map(e => `${e.desa} (${e.diff}%)`);
  const dialekDesas = evaluated.filter(e => e.classification.level === 'dialek').map(e => `${e.desa} (${e.diff}%)`);
  const subbahasaDesas = evaluated.filter(e => e.classification.level === 'subbahasa').map(e => `${e.desa} (${e.diff}%)`);
  const bahasaDesas = evaluated.filter(e => e.classification.level === 'bahasa').map(e => `${e.desa} (${e.diff}%)`);

  const narasiLines: string[] = [];
  narasiLines.push(
    `Berdasarkan perhitungan dialektometri leksikal dengan acuan ${config.name} (ambang: ${config.t1}% / ${config.t2}% / ${config.t3}%), ` +
    `titik pengamatan Desa ${refDesa}${refKecamatan ? ` (Kec. ${refKecamatan}, ${refKab})` : ''} yang menggunakan ${refBahasa} ` +
    `memiliki rata-rata perbedaan leksikal (d̄) sebesar ${avgDiff}% (indeks kemiripan kognat ${avgSimilarity}%) terhadap ${total} titik pengamatan pembanding.`
  );

  narasiLines.push(
    `Klasifikasi mayoritas tuturan di wilayah pengamatan ini berada pada tingkatan "${dominantLevelLabel}" (${maxCount} dari ${total} titik, ${Math.round((maxCount / total) * 100)}%). ` +
    `Titik yang memiliki kedekatan leksikal tertinggi adalah ${closest.name} di Desa ${closest.desa} dengan perbedaan hanya ${closest.diff}% (~${closest.dist} km, status: ${closest.classification.kategori}). ` +
    `Sedangkan disparitas leksikal paling kontras tercatat pada ${farthest.name} di Desa ${farthest.desa} dengan perbedaan ${farthest.diff}% (~${farthest.dist} km, status: ${farthest.classification.kategori}).`
  );

  // Group breakdown detail
  const groupsSummary: string[] = [];
  if (wicaraDesas.length > 0) {
    groupsSummary.push(`• Tingkat Wicara/Subdialek (${wicaraDesas.length} titik): ${wicaraDesas.slice(0, 4).join(', ')}${wicaraDesas.length > 4 ? ` dan ${wicaraDesas.length - 4} titik lainnya` : ''}.`);
  }
  if (dialekDesas.length > 0) {
    groupsSummary.push(`• Tingkat Varian Dialek (${dialekDesas.length} titik): ${dialekDesas.slice(0, 4).join(', ')}${dialekDesas.length > 4 ? ` dan ${dialekDesas.length - 4} titik lainnya` : ''}.`);
  }
  if (subbahasaDesas.length > 0) {
    groupsSummary.push(`• Tingkat Subbahasa/Transisi (${subbahasaDesas.length} titik): ${subbahasaDesas.slice(0, 4).join(', ')}${subbahasaDesas.length > 4 ? ` dan ${subbahasaDesas.length - 4} titik lainnya` : ''}.`);
  }
  if (bahasaDesas.length > 0) {
    groupsSummary.push(`• Tingkat Bahasa Berbeda (${bahasaDesas.length} titik): ${bahasaDesas.slice(0, 4).join(', ')}${bahasaDesas.length > 4 ? ` dan ${bahasaDesas.length - 4} titik lainnya` : ''}.`);
  }
  narasiLines.push(groupsSummary.join('\n'));

  narasiLines.push(
    `Secara geolinguistik, ${spatialCorrelationStatus} ` +
    (bahasaDesas.length > 0 
      ? `Teridentifikasi adanya batas bahasa tegas (isogloss bundel) yang memisahkan Desa ${refDesa} dengan ${bahasaDesas.slice(0, 2).join(' dan ')}.`
      : `Tidak ditemukan batas bahasa penuh antar-desa pengamatan; keseluruhan wilayah merupakan satu kesatuan kontinuum dialektal (dialect continuum).`)
  );

  const kesimpulanAkademik = narasiLines.join('\n\n');

  // Generate `catatanIsoglosOtomatis`
  const isoglosParts: string[] = [];
  isoglosParts.push(`Peta isoglos leksikal menunjukkan batas sebaran variasi kata terhadap titik acuan Desa ${refDesa}:`);
  if (wicaraDesas.length > 0) {
    isoglosParts.push(`1. Kontinuum Homogen (d ≤ ${config.t1}%): Meliputi wilayah ${wicaraDesas.join(', ')} di mana kosakata dasar Swadesh identik dan pemahaman ujaran 100% terjaga.`);
  }
  if (dialekDesas.length > 0) {
    isoglosParts.push(`2. Isoglos Variasi Dialek (${config.t1 + 1}% - ${config.t2}%): Garis isoglos memisahkan leksikon khas wilayah ${dialekDesas.join(', ')}, mencerminkan variasi leksikal lokal namun struktur gramatikal tetap serumpun.`);
  }
  if (subbahasaDesas.length > 0) {
    isoglosParts.push(`3. Garis Transisi Subbahasa (${config.t2 + 1}% - ${config.t3}%): Terdeteksi pada poros menuju ${subbahasaDesas.join(', ')}, menjadi zona peralihan dialektal bertahap.`);
  }
  if (bahasaDesas.length > 0) {
    isoglosParts.push(`4. Batas Bahasa Utama (d > ${config.t3}%): Garis isogloss rapat (bundel isoglos) memisahkan tuturan ${refDesa} dengan ${bahasaDesas.join(', ')}, menetapkan garis batas pemisah antar-bahasa.`);
  }
  isoglosParts.push(`Analisis spasial: ${spatialCorrelationStatus}`);
  const catatanIsoglosOtomatis = isoglosParts.join('\n');

  let summaryStatus = 'Satu Bahasa (Varian Dialek)';
  if (avgDiff > config.t3) summaryStatus = 'Bahasa Berbeda';
  else if (avgDiff > config.t2) summaryStatus = 'Subbahasa / Transisi';
  else if (avgDiff <= config.t1) summaryStatus = 'Subdialek / Wicara Serupa';

  return {
    timestamp: new Date().toLocaleDateString('id-ID'),
    configUsed: config,
    titikAcuanName: refDesa,
    titikAcuanDesa: refDesa,
    titikAcuanBahasa: refBahasa,
    totalTitikPembanding: total,
    averageDiff: avgDiff,
    averageSimilarity: avgSimilarity,
    summaryStatus,
    counts,
    dominantLevel,
    dominantLevelLabel,
    closestPoint: {
      name: closest.name,
      desa: closest.desa,
      diff: closest.diff,
      dist: closest.dist,
      kategori: closest.classification.kategori
    },
    farthestPoint: {
      name: farthest.name,
      desa: farthest.desa,
      diff: farthest.diff,
      dist: farthest.dist,
      kategori: farthest.classification.kategori
    },
    spatialCorrelationStatus,
    kesimpulanAkademik,
    catatanIsoglosOtomatis
  };
}
