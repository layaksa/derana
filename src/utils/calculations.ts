import { InstrumenPemetaanBahasaData } from '../types/linguistic';

/**
 * Menghitung persentase dengan pembulatan 1 desimal yang aman
 */
export function calculatePercentage(part: number | string, total: number | string): string {
  const p = typeof part === 'number' ? part : parseFloat(part);
  const t = typeof total === 'number' ? total : parseFloat(total);

  if (isNaN(p) || isNaN(t) || t <= 0) {
    return '0.0%';
  }
  const result = (p / t) * 100;
  return `${result.toFixed(1)}%`;
}

export function parseNum(val: number | string | undefined | null): number {
  if (val === undefined || val === null || val === '') return 0;
  const parsed = typeof val === 'number' ? val : parseFloat(String(val).replace(/,/g, '.'));
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formula Dialektometri Guiter:
 * d = (s / n) * 100%
 * s = jumlah beda
 * n = jumlah glos yang diperbandingkan
 *
 * Klasifikasi Skala Dialektometri Leksikal:
 * • 81% – 100% = Kategori perbedaan bahasa (berbeda bahasa)
 * • 51% – 80% = Kategori perbedaan dialek (berbeda dialek)
 * • 31% – 50% = Kategori perbedaan subdialek
 * • 21% – 30% = Kategori perbedaan wicara (speech difference)
 * • Kurang dari 21% (≤ 20%): Kategori tidak berbeda (masih dalam satu variasi atau wicara yang sama)
 */
export function hitungDialektometri(jumlahBeda: number, jumlahGlos: number): {
  persentase: number;
  kategori: 'Tidak Berbeda' | 'Perbedaan Wicara' | 'Perbedaan Subdialek' | 'Perbedaan Dialek' | 'Perbedaan Bahasa';
  warnaBadge: string;
  deskripsi: string;
} {
  if (jumlahGlos <= 0) {
    return {
      persentase: 0,
      kategori: 'Tidak Berbeda',
      warnaBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      deskripsi: 'Data glos belum mencukupi untuk dihitung.'
    };
  }

  const d = (jumlahBeda / jumlahGlos) * 100;
  const persentase = Math.min(100, Math.max(0, Math.round(d * 10) / 10));

  if (persentase <= 20) {
    return {
      persentase,
      kategori: 'Tidak Berbeda',
      warnaBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      deskripsi: 'Kurang dari 21% (≤ 20%): Kategori tidak berbeda (masih dalam satu variasi atau wicara yang sama).'
    };
  } else if (persentase <= 30) {
    return {
      persentase,
      kategori: 'Perbedaan Wicara',
      warnaBadge: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
      deskripsi: '21% – 30%: Kategori perbedaan wicara (speech difference).'
    };
  } else if (persentase <= 50) {
    return {
      persentase,
      kategori: 'Perbedaan Subdialek',
      warnaBadge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
      deskripsi: '31% – 50%: Kategori perbedaan subdialek.'
    };
  } else if (persentase <= 80) {
    return {
      persentase,
      kategori: 'Perbedaan Dialek',
      warnaBadge: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800',
      deskripsi: '51% – 80%: Kategori perbedaan dialek (berbeda dialek).'
    };
  } else {
    return {
      persentase,
      kategori: 'Perbedaan Bahasa',
      warnaBadge: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
      deskripsi: '81% – 100%: Kategori perbedaan bahasa (berbeda bahasa).'
    };
  }
}

/**
 * Menghitung jarak geodesic antar koordinat GPS (Haversine Formula) dalam KM
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius Bumi km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Hitung rincian kelengkapan formulir 16 bagian untuk dashboard & progress bar
 */
/**
 * Helper to determine if a value is meaningfully filled (not empty string, null, undefined, or 0)
 */
function isFilled(val: any): boolean {
  if (val === undefined || val === null) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  if (typeof val === 'number') return !isNaN(val) && val > 0;
  if (typeof val === 'boolean') return val === true;
  return false;
}

/**
 * Hitung rincian kelengkapan formulir 16 bagian secara otomatis berdasarkan
 * persentase kolom/bidang input yang telah terisi pada setiap seksi kuesioner.
 */
export function getSectionProgressDetails(data: InstrumenPemetaanBahasaData): {
  score: number;
  total: number;
  percentage: number;
  totalFilledColumns: number;
  totalAvailableColumns: number;
  overallColumnPercentage: number;
  sections: {
    id: string;
    number: number;
    title: string;
    shortTitle: string;
    category: string;
    filledColumns: number;
    totalColumns: number;
    percentage: number;
    isFilled: boolean;
    isComplete: boolean;
    status: 'empty' | 'partial' | 'complete';
    summary: string;
  }[];
} {
  if (!data) {
    return {
      score: 0,
      total: 16,
      percentage: 0,
      totalFilledColumns: 0,
      totalAvailableColumns: 0,
      overallColumnPercentage: 0,
      sections: []
    };
  }

  // --- SEKSI 1: Gambaran Titik Pengamatan (9 Kolom) ---
  const s1Cols = [
    data.titikPengamatan?.namaDesa,
    data.titikPengamatan?.bahasaDigunakan,
    data.titikPengamatan?.namaLainBahasa,
    data.titikPengamatan?.kecamatan,
    data.titikPengamatan?.kabupatenKota,
    data.titikPengamatan?.pulau,
    data.titikPengamatan?.provinsi,
    data.titikPengamatan?.koordinatLintang,
    data.titikPengamatan?.koordinatBujur
  ];
  const s1Filled = s1Cols.filter(isFilled).length;
  const s1Total = s1Cols.length;
  const s1Percent = Math.round((s1Filled / s1Total) * 100);

  // --- SEKSI 2: Situasi Kebahasaan Perbatasan (8 Kolom: 4 Arah x 2) ---
  const s2Cols = [
    data.situasiKebahasaan?.timur?.desa,
    data.situasiKebahasaan?.timur?.bahasa,
    data.situasiKebahasaan?.barat?.desa,
    data.situasiKebahasaan?.barat?.bahasa,
    data.situasiKebahasaan?.utara?.desa,
    data.situasiKebahasaan?.utara?.bahasa,
    data.situasiKebahasaan?.selatan?.desa,
    data.situasiKebahasaan?.selatan?.bahasa
  ];
  const s2Filled = s2Cols.filter(isFilled).length;
  const s2Total = s2Cols.length;
  const s2Percent = Math.round((s2Filled / s2Total) * 100);

  // --- SEKSI 3: Situasi Geografis & Morfologi (5 Kolom) ---
  const s3Cols = [
    data.situasiGeografis?.letakPantai,
    data.situasiGeografis?.jarakDariPantaiKm,
    data.situasiGeografis?.morfologi,
    data.situasiGeografis?.koordinatLintang,
    data.situasiGeografis?.koordinatBujur
  ];
  const s3Filled = s3Cols.filter(isFilled).length;
  const s3Total = s3Cols.length;
  const s3Percent = Math.round((s3Filled / s3Total) * 100);

  // --- SEKSI 4: Penduduk & Penutur Bahasa (12 Kolom) ---
  const s4Cols = [
    data.penduduk?.jumlahPria,
    data.penduduk?.jumlahWanita,
    data.penduduk?.umurBawah20,
    data.penduduk?.umur20sd40,
    data.penduduk?.umurDiatas40,
    data.penduduk?.penuturPria,
    data.penduduk?.penuturWanita,
    data.penduduk?.penuturUmurBawah20,
    data.penduduk?.penuturUmur20sd40,
    data.penduduk?.penuturUmurDiatas40,
    data.penduduk?.mayoritasEtnik,
    data.penduduk?.minoritasEtnik
  ];
  const s4Filled = s4Cols.filter(isFilled).length;
  const s4Total = s4Cols.length;
  const s4Percent = Math.round((s4Filled / s4Total) * 100);

  // --- SEKSI 5: Mata Pencaharian (6 Kolom) ---
  const s5Cols = [
    data.mataPencaharian?.bertani,
    data.mataPencaharian?.nelayan,
    data.mataPencaharian?.berdagang,
    data.mataPencaharian?.buruh,
    data.mataPencaharian?.pegawai,
    data.mataPencaharian?.lainLain
  ];
  const s5Filled = s5Cols.filter(isFilled).length;
  const s5Total = s5Cols.length;
  const s5Percent = Math.round((s5Filled / s5Total) * 100);

  // --- SEKSI 6: Pendidikan Penduduk (6 Kolom) ---
  const s6Cols = [
    data.pendidikan?.tidakSekolah,
    data.pendidikan?.sdSederajat,
    data.pendidikan?.smpSederajat,
    data.pendidikan?.smaSederajat,
    data.pendidikan?.perguruanTinggi,
    data.pendidikan?.sarjanaAsalDesa
  ];
  const s6Filled = s6Cols.filter(isFilled).length;
  const s6Total = s6Cols.length;
  const s6Percent = Math.round((s6Filled / s6Total) * 100);

  // --- SEKSI 7: Sarana Pendidikan (4 Kolom) ---
  const s7Cols = [
    data.saranaPendidikan?.sdSederajat,
    data.saranaPendidikan?.smpSederajat,
    data.saranaPendidikan?.smaSederajat,
    data.saranaPendidikan?.perguruanTinggi
  ];
  const s7Filled = s7Cols.filter(isFilled).length;
  const s7Total = s7Cols.length;
  const s7Percent = Math.round((s7Filled / s7Total) * 100);

  // --- SEKSI 8: Agama Penduduk (8 Kolom) ---
  const s8Cols = [
    data.agama?.islam,
    data.agama?.protestan,
    data.agama?.kristen,
    data.agama?.katolik,
    data.agama?.hindu,
    data.agama?.buddha,
    data.agama?.konghucu,
    data.agama?.lainLain
  ];
  const s8Filled = s8Cols.filter(isFilled).length;
  const s8Total = s8Cols.length;
  const s8Percent = Math.round((s8Filled / s8Total) * 100);

  // --- SEKSI 9: Hubungan Luar / Mobilitas (2 Kolom) ---
  const s9Cols = [
    data.hubunganMobilitas?.status,
    data.hubunganMobilitas?.catatan
  ];
  const s9Filled = s9Cols.filter(isFilled).length;
  const s9Total = s9Cols.length;
  const s9Percent = Math.round((s9Filled / s9Total) * 100);

  // --- SEKSI 10: Alat Transportasi (8 Moda Transportasi) ---
  const s10ActiveKeys = Object.entries(data.alatTransportasi || {}).filter(([_, v]) => v === true).length;
  const s10Total = 8;
  // Memilih 3 moda transportasi utama di lapangan sudah dianggap memadai (100%)
  const s10Percent = Math.min(100, Math.round((s10ActiveKeys / 3) * 100));

  // --- SEKSI 11: Usia Desa (3 Kolom) ---
  const s11Cols = [
    data.usiaDesa?.kategori,
    data.usiaDesa?.estimasiTahun,
    data.usiaDesa?.catatanSumber
  ];
  const s11Filled = s11Cols.filter(isFilled).length;
  const s11Total = s11Cols.length;
  const s11Percent = Math.round((s11Filled / s11Total) * 100);

  // --- SEKSI 12: Sejarah Desa (3 Kolom) ---
  const s12Cols = [
    data.sejarahDesa?.sejarahSingkat,
    data.sejarahDesa?.asalUsulNama,
    data.sejarahDesa?.tokohPendiri
  ];
  const s12Filled = s12Cols.filter(isFilled).length;
  const s12Total = s12Cols.length;
  const s12Percent = Math.round((s12Filled / s12Total) * 100);

  // --- SEKSI 13: Sastra Lisan (Folklore) (5 Kolom) ---
  const s13Cols = [
    data.folklore?.judulFolklore,
    data.folklore?.kategori,
    data.folklore?.ringkasanCerita,
    data.folklore?.tokohUtama,
    data.folklore?.maknaTradisi
  ];
  const s13Filled = s13Cols.filter(isFilled).length;
  const s13Total = s13Cols.length;
  const s13Percent = Math.round((s13Filled / s13Total) * 100);

  // --- SEKSI 14: Profil Narasumber (Target 3 Orang x 5 Atribut = 15 Kolom) ---
  let s14FilledCount = 0;
  const s14TargetColumns = 15;
  (data.narasumberList || []).slice(0, 3).forEach(n => {
    if (isFilled(n.nama)) s14FilledCount++;
    if (isFilled(n.usia)) s14FilledCount++;
    if (isFilled(n.jenisKelamin)) s14FilledCount++;
    if (isFilled(n.pendidikanTertinggi)) s14FilledCount++;
    if (isFilled(n.bahasaDigunakan?.diRumah)) s14FilledCount++;
  });
  const s14Percent = Math.min(100, Math.round((s14FilledCount / s14TargetColumns) * 100));

  // --- SEKSI 15: Daftar Kosakata Swadesh (Target 200 Butir) ---
  const filledSwadesh = data.kosakataLengkap?.swadeshList?.filter(s => isFilled(s.bentukLokal))?.length || 0;
  const s15TargetTotal = 200;
  const s15Percent = Math.min(100, Math.round((filledSwadesh / s15TargetTotal) * 100));

  // --- SEKSI 16: Dialektometri & Peta (4 Indikator) ---
  const pembandingCount = data.dialektometri?.titikPembandingList?.length || 0;
  const s16Cols = [
    data.dialektometri?.titikAcuan,
    pembandingCount > 0 ? 'ada_pembanding' : '',
    data.dialektometri?.catatanIsoglos,
    data.dialektometri?.kesimpulanGeolinguistik
  ];
  const s16Filled = s16Cols.filter(isFilled).length;
  const s16Total = s16Cols.length;
  const s16Percent = Math.round((s16Filled / s16Total) * 100);

  const sections = [
    {
      id: 'section-1',
      number: 1,
      title: 'Gambaran Titik Pengamatan',
      shortTitle: '1. Titik Pengamatan',
      category: 'Wilayah',
      filledColumns: s1Filled,
      totalColumns: s1Total,
      percentage: s1Percent,
      isFilled: s1Percent > 0,
      isComplete: s1Percent === 100,
      status: s1Percent === 100 ? ('complete' as const) : s1Percent > 0 ? ('partial' as const) : ('empty' as const),
      summary: data.titikPengamatan?.namaDesa 
        ? `${data.titikPengamatan.namaDesa} (${data.titikPengamatan.bahasaDigunakan || 'Bahasa -'}) · ${s1Filled}/${s1Total} kolom (${s1Percent}%)` 
        : `Belum terisi (${s1Filled}/${s1Total} kolom)`
    },
    {
      id: 'section-2',
      number: 2,
      title: 'Situasi Kebahasaan (Perbatasan)',
      shortTitle: '2. Kebahasaan',
      category: 'Wilayah',
      filledColumns: s2Filled,
      totalColumns: s2Total,
      percentage: s2Percent,
      isFilled: s2Percent > 0,
      isComplete: s2Percent === 100,
      status: s2Percent === 100 ? ('complete' as const) : s2Percent > 0 ? ('partial' as const) : ('empty' as const),
      summary: s2Filled > 0 ? `${s2Filled}/${s2Total} batas mata angin terpetakan (${s2Percent}%)` : 'Belum diisi'
    },
    {
      id: 'section-3',
      number: 3,
      title: 'Situasi Geografis & Morfologi',
      shortTitle: '3. Geografis',
      category: 'Wilayah',
      filledColumns: s3Filled,
      totalColumns: s3Total,
      percentage: s3Percent,
      isFilled: s3Percent > 0,
      isComplete: s3Percent === 100,
      status: s3Percent === 100 ? ('complete' as const) : s3Percent > 0 ? ('partial' as const) : ('empty' as const),
      summary: data.situasiGeografis?.morfologi 
        ? `${data.situasiGeografis.morfologi} · ${s3Filled}/${s3Total} kolom (${s3Percent}%)` 
        : `Belum terisi (${s3Filled}/${s3Total} kolom)`
    },
    {
      id: 'section-4',
      number: 4,
      title: 'Penduduk & Penutur Bahasa',
      shortTitle: '4. Penduduk',
      category: 'Demografi',
      filledColumns: s4Filled,
      totalColumns: s4Total,
      percentage: s4Percent,
      isFilled: s4Percent > 0,
      isComplete: s4Percent === 100,
      status: s4Percent === 100 ? ('complete' as const) : s4Percent > 0 ? ('partial' as const) : ('empty' as const),
      summary: s4Filled > 0 ? `${s4Filled}/${s4Total} kolom demografi (${s4Percent}%)` : 'Belum diisi'
    },
    {
      id: 'section-5',
      number: 5,
      title: 'Mata Pencaharian',
      shortTitle: '5. Pekerjaan',
      category: 'Demografi',
      filledColumns: s5Filled,
      totalColumns: s5Total,
      percentage: s5Percent,
      isFilled: s5Percent > 0,
      isComplete: s5Percent === 100,
      status: s5Percent === 100 ? ('complete' as const) : s5Percent > 0 ? ('partial' as const) : ('empty' as const),
      summary: s5Filled > 0 ? `${s5Filled}/${s5Total} profesi terisi (${s5Percent}%)` : 'Belum diisi'
    },
    {
      id: 'section-6',
      number: 6,
      title: 'Pendidikan Penduduk',
      shortTitle: '6. Pendidikan',
      category: 'Sosial',
      filledColumns: s6Filled,
      totalColumns: s6Total,
      percentage: s6Percent,
      isFilled: s6Percent > 0,
      isComplete: s6Percent === 100,
      status: s6Percent === 100 ? ('complete' as const) : s6Percent > 0 ? ('partial' as const) : ('empty' as const),
      summary: s6Filled > 0 ? `${s6Filled}/${s6Total} jenjang terdata (${s6Percent}%)` : 'Belum diisi'
    },
    {
      id: 'section-7',
      number: 7,
      title: 'Sarana Pendidikan',
      shortTitle: '7. Sarana',
      category: 'Sosial',
      filledColumns: s7Filled,
      totalColumns: s7Total,
      percentage: s7Percent,
      isFilled: s7Percent > 0,
      isComplete: s7Percent === 100,
      status: s7Percent === 100 ? ('complete' as const) : s7Percent > 0 ? ('partial' as const) : ('empty' as const),
      summary: s7Filled > 0 ? `${s7Filled}/${s7Total} fasilitas terdata (${s7Percent}%)` : 'Belum diisi'
    },
    {
      id: 'section-8',
      number: 8,
      title: 'Agama Penduduk',
      shortTitle: '8. Agama',
      category: 'Sosial',
      filledColumns: s8Filled,
      totalColumns: s8Total,
      percentage: s8Percent,
      isFilled: s8Percent > 0,
      isComplete: s8Percent === 100,
      status: s8Percent === 100 ? ('complete' as const) : s8Percent > 0 ? ('partial' as const) : ('empty' as const),
      summary: s8Filled > 0 ? `${s8Filled}/${s8Total} agama terdata (${s8Percent}%)` : 'Belum diisi'
    },
    {
      id: 'section-9',
      number: 9,
      title: 'Hubungan ke Luar (Mobilitas)',
      shortTitle: '9. Mobilitas',
      category: 'Akses',
      filledColumns: s9Filled,
      totalColumns: s9Total,
      percentage: s9Percent,
      isFilled: s9Percent > 0,
      isComplete: s9Percent === 100,
      status: s9Percent === 100 ? ('complete' as const) : s9Percent > 0 ? ('partial' as const) : ('empty' as const),
      summary: s9Filled > 0 ? `${s9Filled}/${s9Total} data mobilitas (${s9Percent}%)` : 'Belum diisi'
    },
    {
      id: 'section-10',
      number: 10,
      title: 'Alat Transportasi',
      shortTitle: '10. Transportasi',
      category: 'Akses',
      filledColumns: s10ActiveKeys,
      totalColumns: s10Total,
      percentage: s10Percent,
      isFilled: s10Percent > 0,
      isComplete: s10Percent === 100,
      status: s10Percent === 100 ? ('complete' as const) : s10Percent > 0 ? ('partial' as const) : ('empty' as const),
      summary: s10ActiveKeys > 0 ? `${s10ActiveKeys}/${s10Total} moda transportasi terdata (${s10Percent}%)` : 'Belum diisi'
    },
    {
      id: 'section-11',
      number: 11,
      title: 'Usia Desa',
      shortTitle: '11. Usia Desa',
      category: 'Kesejarahan',
      filledColumns: s11Filled,
      totalColumns: s11Total,
      percentage: s11Percent,
      isFilled: s11Percent > 0,
      isComplete: s11Percent === 100,
      status: s11Percent === 100 ? ('complete' as const) : s11Percent > 0 ? ('partial' as const) : ('empty' as const),
      summary: s11Filled > 0 ? `${s11Filled}/${s11Total} data umur desa (${s11Percent}%)` : 'Belum diisi'
    },
    {
      id: 'section-12',
      number: 12,
      title: 'Sejarah Desa',
      shortTitle: '12. Sejarah',
      category: 'Kesejarahan',
      filledColumns: s12Filled,
      totalColumns: s12Total,
      percentage: s12Percent,
      isFilled: s12Percent > 0,
      isComplete: s12Percent === 100,
      status: s12Percent === 100 ? ('complete' as const) : s12Percent > 0 ? ('partial' as const) : ('empty' as const),
      summary: s12Filled > 0 ? `${s12Filled}/${s12Total} kolom riwayat terisi (${s12Percent}%)` : 'Belum diisi'
    },
    {
      id: 'section-13',
      number: 13,
      title: 'Instrumen Sastra Lisan (Folklore)',
      shortTitle: '13. Sastra Lisan',
      category: 'Kesejarahan',
      filledColumns: s13Filled,
      totalColumns: s13Total,
      percentage: s13Percent,
      isFilled: s13Percent > 0,
      isComplete: s13Percent === 100,
      status: s13Percent === 100 ? ('complete' as const) : s13Percent > 0 ? ('partial' as const) : ('empty' as const),
      summary: s13Filled > 0 ? `${s13Filled}/${s13Total} metadata cerita (${s13Percent}%)` : 'Belum diisi'
    },
    {
      id: 'section-14',
      number: 14,
      title: 'Profil Narasumber (1, 2, 3)',
      shortTitle: '14. Narasumber',
      category: 'Informan',
      filledColumns: s14FilledCount,
      totalColumns: s14TargetColumns,
      percentage: s14Percent,
      isFilled: s14Percent > 0,
      isComplete: s14Percent === 100,
      status: s14Percent === 100 ? ('complete' as const) : s14Percent > 0 ? ('partial' as const) : ('empty' as const),
      summary: s14FilledCount > 0 ? `${s14FilledCount}/${s14TargetColumns} atribut narasumber (${s14Percent}%)` : 'Belum diisi'
    },
    {
      id: 'section-15',
      number: 15,
      title: 'Daftar Kosakata Swadesh (200 Kata)',
      shortTitle: '15. Kosakata',
      category: 'Linguistik',
      filledColumns: filledSwadesh,
      totalColumns: s15TargetTotal,
      percentage: s15Percent,
      isFilled: s15Percent > 0,
      isComplete: s15Percent === 100,
      status: s15Percent === 100 ? ('complete' as const) : s15Percent > 0 ? ('partial' as const) : ('empty' as const),
      summary: `${filledSwadesh}/${s15TargetTotal} kata Swadesh terisi (${s15Percent}%)`
    },
    {
      id: 'section-16',
      number: 16,
      title: 'Dialektometri & Visualisasi Peta',
      shortTitle: '16. Dialektometri',
      category: 'Linguistik',
      filledColumns: s16Filled,
      totalColumns: s16Total,
      percentage: s16Percent,
      isFilled: s16Percent > 0,
      isComplete: s16Percent === 100,
      status: s16Percent === 100 ? ('complete' as const) : s16Percent > 0 ? ('partial' as const) : ('empty' as const),
      summary: s16Filled > 0 
        ? `${pembandingCount} titik pembanding · ${s16Filled}/${s16Total} kolom (${s16Percent}%)` 
        : 'Belum diisi'
    }
  ];

  // Hitung agregat kelengkapan kolom secara keseluruhan
  const totalFilledColumns = sections.reduce((acc, s) => acc + s.filledColumns, 0);
  const totalAvailableColumns = sections.reduce((acc, s) => acc + s.totalColumns, 0);
  const overallColumnPercentage = totalAvailableColumns > 0 
    ? Math.round((totalFilledColumns / totalAvailableColumns) * 100) 
    : 0;

  // Persentase komprehensif adalah rata-rata persentase dari ke-16 seksi
  const percentage = Math.round(sections.reduce((acc, s) => acc + s.percentage, 0) / 16);
  // Skor kelengkapan seksi (seksi yang telah mencapai batas optimal ≥ 80% atau lengkap 100%)
  const score = sections.filter(s => s.percentage >= 80).length;
  const total = sections.length;

  return {
    score,
    total,
    percentage,
    totalFilledColumns,
    totalAvailableColumns,
    overallColumnPercentage,
    sections
  };
}

/**
 * Hitung kelengkapan formulir kuesioner secara otomatis berdasarkan rata-rata persentase kolom terisi
 */
export function calculateOverallProgress(data: InstrumenPemetaanBahasaData): number {
  return getSectionProgressDetails(data).percentage;
}

