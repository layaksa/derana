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
export function getSectionProgressDetails(data: InstrumenPemetaanBahasaData): {
  score: number;
  total: number;
  percentage: number;
  sections: { id: string; number: number; title: string; isFilled: boolean; summary: string }[];
} {
  const s1Filled = Boolean(data.titikPengamatan.namaDesa && data.titikPengamatan.bahasaDigunakan && data.titikPengamatan.kecamatan);
  const s2Filled = Boolean(data.situasiKebahasaan.timur.desa || data.situasiKebahasaan.barat.desa || data.situasiKebahasaan.utara.desa);
  const s3Filled = Boolean(data.situasiGeografis.morfologi && (data.situasiGeografis.koordinatLintang || data.situasiGeografis.koordinatBujur));
  const s4Filled = Boolean(parseNum(data.penduduk.jumlahPria) > 0 || parseNum(data.penduduk.jumlahWanita) > 0);
  const s5Filled = Boolean(parseNum(data.mataPencaharian.bertani) > 0 || parseNum(data.mataPencaharian.nelayan) > 0 || parseNum(data.mataPencaharian.berdagang) > 0);
  const s6Filled = Boolean(parseNum(data.pendidikan.sdSederajat) > 0 || parseNum(data.pendidikan.smpSederajat) > 0);
  const s7Filled = Boolean(parseNum(data.saranaPendidikan.sdSederajat) > 0 || parseNum(data.saranaPendidikan.smpSederajat) > 0);
  const s8Filled = Boolean(parseNum(data.agama.islam) > 0 || parseNum(data.agama.kristen) > 0 || parseNum(data.agama.hindu) > 0);
  const s9Filled = Boolean(data.hubunganMobilitas.status);
  const s10Filled = Object.values(data.alatTransportasi).some(v => v === true);
  const s11Filled = Boolean(data.usiaDesa.kategori);
  const s12Filled = Boolean(data.sejarahDesa.sejarahSingkat || data.sejarahDesa.asalUsulNama);
  const s13Filled = Boolean(data.folklore.judulFolklore || data.folklore.ringkasanCerita);
  const s14Filled = data.narasumberList.some(n => Boolean(n.nama && n.usia));
  const filledSwadesh = data.kosakataLengkap?.swadeshList?.filter(s => s.bentukLokal)?.length || 0;
  const s15Filled = filledSwadesh > 0;
  const s16Filled = (data.dialektometri?.titikPembandingList?.length || 0) > 0;

  const sections = [
    {
      id: 'section-1',
      number: 1,
      title: 'Titik Pengamatan',
      isFilled: s1Filled,
      summary: data.titikPengamatan.namaDesa ? `${data.titikPengamatan.namaDesa} (${data.titikPengamatan.bahasaDigunakan || 'Bahasa -'})` : 'Belum diisi'
    },
    {
      id: 'section-2',
      number: 2,
      title: 'Situasi Kebahasaan',
      isFilled: s2Filled,
      summary: s2Filled ? 'Batas wilayah terpetakan' : 'Belum diisi'
    },
    {
      id: 'section-3',
      number: 3,
      title: 'Situasi Geografis',
      isFilled: s3Filled,
      summary: data.situasiGeografis.morfologi ? `${data.situasiGeografis.morfologi} (${data.situasiGeografis.letakPantai || 'darat'})` : 'Belum diisi'
    },
    {
      id: 'section-4',
      number: 4,
      title: 'Penduduk & Penutur',
      isFilled: s4Filled,
      summary: s4Filled ? `Pria: ${data.penduduk.jumlahPria || 0}, Wanita: ${data.penduduk.jumlahWanita || 0}` : 'Belum diisi'
    },
    {
      id: 'section-5',
      number: 5,
      title: 'Mata Pencaharian',
      isFilled: s5Filled,
      summary: s5Filled ? 'Data profesi tercatat' : 'Belum diisi'
    },
    {
      id: 'section-6',
      number: 6,
      title: 'Pendidikan Penduduk',
      isFilled: s6Filled,
      summary: s6Filled ? 'Tingkat pendidikan terisi' : 'Belum diisi'
    },
    {
      id: 'section-7',
      number: 7,
      title: 'Sarana Pendidikan',
      isFilled: s7Filled,
      summary: s7Filled ? 'Fasilitas pendidikan tercatat' : 'Belum diisi'
    },
    {
      id: 'section-8',
      number: 8,
      title: 'Agama Penduduk',
      isFilled: s8Filled,
      summary: s8Filled ? 'Komposisi religi tercatat' : 'Belum diisi'
    },
    {
      id: 'section-9',
      number: 9,
      title: 'Hubungan Luar (Mobilitas)',
      isFilled: s9Filled,
      summary: data.hubunganMobilitas.status ? data.hubunganMobilitas.status.replace(/_/g, ' ') : 'Belum diisi'
    },
    {
      id: 'section-10',
      number: 10,
      title: 'Alat Transportasi',
      isFilled: s10Filled,
      summary: s10Filled ? 'Moda transportasi tercentang' : 'Belum diisi'
    },
    {
      id: 'section-11',
      number: 11,
      title: 'Usia Desa',
      isFilled: s11Filled,
      summary: data.usiaDesa.kategori ? data.usiaDesa.kategori.replace(/_/g, ' ') : 'Belum diisi'
    },
    {
      id: 'section-12',
      number: 12,
      title: 'Sejarah Desa',
      isFilled: s12Filled,
      summary: s12Filled ? 'Catatan sejarah terisi' : 'Belum diisi'
    },
    {
      id: 'section-13',
      number: 13,
      title: 'Folklore & Tradisi Lisan',
      isFilled: s13Filled,
      summary: data.folklore.judulFolklore ? `"${data.folklore.judulFolklore}"` : 'Belum diisi'
    },
    {
      id: 'section-14',
      number: 14,
      title: 'Profil Narasumber',
      isFilled: s14Filled,
      summary: s14Filled ? `${data.narasumberList.filter(n => n.nama).length} narasumber terdata` : 'Belum diisi'
    },
    {
      id: 'section-15',
      number: 15,
      title: 'Daftar Kosakata Swadesh',
      isFilled: s15Filled,
      summary: s15Filled ? `${filledSwadesh}/200 kata Swadesh` : 'Belum diisi'
    },
    {
      id: 'section-16',
      number: 16,
      title: 'Dialektometri & Peta',
      isFilled: s16Filled,
      summary: s16Filled ? `${data.dialektometri.titikPembandingList.length} titik pembanding` : 'Belum diisi'
    }
  ];

  const score = sections.filter(s => s.isFilled).length;
  const total = sections.length;
  const percentage = Math.round((score / total) * 100);

  return {
    score,
    total,
    percentage,
    sections
  };
}

/**
 * Hitung kelengkapan formulir 16 bagian untuk progress bar
 */
export function calculateOverallProgress(data: InstrumenPemetaanBahasaData): number {
  return getSectionProgressDetails(data).percentage;
}

