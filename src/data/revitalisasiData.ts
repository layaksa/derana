import { 
  MonevDimensiConfig, 
  KategoriIKRBD, 
  RevitalisasiMonevRecord, 
  RevitalisasiRAPRecord,
  LiniMasaItem,
  MonevIndikatorNilai
} from '../types/revitalisasi';

export const MONEV_DIMENSI_CONFIG: MonevDimensiConfig[] = [
  {
    id: 1,
    judul: 'DIMENSI 1: PEMBELAJARAN & PARTISIPASI SUBJEK',
    bobot: 0.25,
    bobotPersen: 25,
    deskripsi: 'Penguasaan, transmisi aktif lintas generasi muda, dan peran maestro/tetua adat lokal.',
    indikator: [
      {
        id: '1.1',
        dimensiId: 1,
        nomor: '1.1',
        judul: 'Cakupan Penutur Muda',
        deskripsi: 'Partisipasi generasi muda (usia 6–18 tahun) dalam pembelajaran bahasa daerah.'
      },
      {
        id: '1.2',
        dimensiId: 1,
        nomor: '1.2',
        judul: 'Transmisi Kebahasaan',
        deskripsi: 'Penggunaan bahasa daerah oleh anak-anak dalam interaksi harian pasca-pelatihan.'
      },
      {
        id: '1.3',
        dimensiId: 1,
        nomor: '1.3',
        judul: 'Keterlibatan Maestro',
        deskripsi: 'Peran aktif Latupati, Tetua Adat, atau penutur jagoan lokal sebagai pengajar.'
      }
    ]
  },
  {
    id: 2,
    judul: 'DIMENSI 2: KETERLIBATAN KOMUNITAS & GRASSROOTS',
    bobot: 0.20,
    bobotPersen: 20,
    deskripsi: 'Gerakan komunitas mandiri, penggunaan di ruang publik desa, dan kerelawanan.',
    indikator: [
      {
        id: '2.1',
        dimensiId: 2,
        nomor: '2.1',
        judul: 'Inisiatif Sanggar / Kelompok Lokal',
        deskripsi: 'Peran sanggar seni, pemuda, dan paguyuban menyelenggarakan kegiatan mandiri.'
      },
      {
        id: '2.2',
        dimensiId: 2,
        nomor: '2.2',
        judul: 'Kehadiran di Ranah Sosial',
        deskripsi: 'Penggunaan bahasa daerah dalam acara adat, keagamaan, perayaan desa, atau pasar.'
      },
      {
        id: '2.3',
        dimensiId: 2,
        nomor: '2.3',
        judul: 'Partisipasi Sukarelawan & Inovasi',
        deskripsi: 'Ketersediaan fasilitator sukarela dan media/kreativitas lokal komunitas.'
      }
    ]
  },
  {
    id: 3,
    judul: 'DIMENSI 3: KETERSEDIAAN MODUL & MATERI AJAR MODEL C',
    bobot: 0.20,
    bobotPersen: 20,
    deskripsi: 'Ketersediaan bahan ajar berbasis cerita rakyat, kapata, dan kemudahan distribusi kepulauan.',
    indikator: [
      {
        id: '3.1',
        dimensiId: 3,
        nomor: '3.1',
        judul: 'Kelengkapan Modul Lokal',
        deskripsi: 'Ketersediaan bahan ajar berbasis cerita rakyat, kapata, atau sastra lisan negeri.'
      },
      {
        id: '3.2',
        dimensiId: 3,
        nomor: '3.2',
        judul: 'Aksesibilitas & Kontekstualisasi',
        deskripsi: 'Kemudahan distribusi di pulau-pulau serta fleksibilitas metode ramah komunitas.'
      }
    ]
  },
  {
    id: 4,
    judul: 'DIMENSI 4: DUKUNGAN KELEMBAGAAN & KEBIJAKAN LOKAL',
    bobot: 0.175,
    bobotPersen: 17.5,
    deskripsi: 'Regulasi formal (SK Raja/Kades/Perdes), alokasi anggaran dana desa/APBD, dan kurikulum mulok.',
    indikator: [
      {
        id: '4.1',
        dimensiId: 4,
        nomor: '4.1',
        judul: 'Regulasi & Anggaran Lokal',
        deskripsi: 'Adanya SK Raja/Kades, Perdes, serta alokasi APBD/Dana Desa (ADD) untuk revitalisasi.'
      },
      {
        id: '4.2',
        dimensiId: 4,
        nomor: '4.2',
        judul: 'Integrasi Agenda',
        deskripsi: 'Pengintegrasian bahasa daerah dalam agenda rutin negeri/desa maupun Mulok sekolah.'
      }
    ]
  },
  {
    id: 5,
    judul: 'DIMENSI 5: RUANG EKSPRESI & FESTIVAL BAHASA DAERAH',
    bobot: 0.175,
    bobotPersen: 17.5,
    deskripsi: 'Pentas budaya, lomba sastra lisan, dan antusiasme masyarakat umum.',
    indikator: [
      {
        id: '5.1',
        dimensiId: 5,
        nomor: '5.1',
        judul: 'Penyelenggaraan Festival',
        deskripsi: 'Frekuensi pergelaran/lomba kebahasaan serta variasi materi sastra lisan (kapata, pidato, dll.).'
      },
      {
        id: '5.2',
        dimensiId: 5,
        nomor: '5.2',
        judul: 'Apresiasi Komunitas',
        deskripsi: 'Antusiasme dan tingkat partisipasi masyarakat umum saat pergelaran budaya.'
      }
    ]
  }
];

export const STANDAR_LINI_MASA_RAP: Omit<LiniMasaItem, 'id'>[] = [
  {
    no: 1,
    tahapan: 'Koordinasi dengan Pihak Sekolah/Komunitas/KKG/MGMP',
    tanggal: '2026-03-10',
    lokasiMedia: 'Luring (Kantor UPTD / Balai Pertemuan)'
  },
  {
    no: 2,
    tahapan: 'Persiapan Materi dan Media Pengimbasan (Modul & Kapata)',
    tanggal: '2026-03-24',
    lokasiMedia: 'Luring (Sanggar Belajar Komunitas)'
  },
  {
    no: 3,
    tahapan: 'Pelaksanaan Pengimbasan Pengajar Sejawat I (Materi Inti)',
    tanggal: '2026-04-14',
    lokasiMedia: 'Luring (Gugus KKG/MGMP Kecamatan)'
  },
  {
    no: 4,
    tahapan: 'Pelaksanaan Pengimbasan Siswa I (Mendongeng & Kosakata Harian)',
    tanggal: '2026-05-05',
    lokasiMedia: 'Luring (Ruang Kelas & Lapangan Sekolah)'
  },
  {
    no: 5,
    tahapan: 'Pelaksanaan Pengimbasan Siswa II (Tembang Tradisi & Permainan Rakyat)',
    tanggal: '2026-05-19',
    lokasiMedia: 'Luring (Halaman Adat / Rumah Pohon Literasi)'
  },
  {
    no: 6,
    tahapan: 'Pelaksanaan Pengimbasan Siswa III (Latihan Pidato Adat & Kapata)',
    tanggal: '2026-06-02',
    lokasiMedia: 'Luring (Sanggar Seni Budaya Negeri)'
  },
  {
    no: 7,
    tahapan: 'Evaluasi Pengimbasan dan Pengumpulan Portofolio/Karya Siswa',
    tanggal: '2026-06-16',
    lokasiMedia: 'Luring & Daring (Dokumentasi Karya)'
  },
  {
    no: 8,
    tahapan: 'Pengumpulan Hasil Laporan Pengimbasan ke Balai Bahasa',
    tanggal: '2026-06-30',
    lokasiMedia: 'Daring / Luring (Sistem Pemetaan Terpadu)'
  }
];

export function getIKRBDCategory(score: number): {
  kategori: KategoriIKRBD;
  statusPelaksanaan: string;
  intervensiKebijakan: string;
  badgeColor: string;
  barColor: string;
} {
  const rounded = Number(score.toFixed(2));
  if (rounded >= 85.0) {
    return {
      kategori: 'SANGAT BERHASIL',
      statusPelaksanaan: 'Mandiri & Optimal',
      intervensiKebijakan: 'Transmisi bahasa antar-generasi lancar, gerakan komunitas sangat hidup, dan regulasi lokal kuat. Siap jadi percontohan nasional.',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      barColor: 'bg-emerald-500'
    };
  } else if (rounded >= 70.0) {
    return {
      kategori: 'BERHASIL',
      statusPelaksanaan: 'Efektif',
      intervensiKebijakan: 'Program berjalan baik, namun butuh penguatan konsisten pada koordinasi antarkomunitas dan integrasi di lingkungan keluarga.',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
      barColor: 'bg-blue-500'
    };
  } else if (rounded >= 55.0) {
    return {
      kategori: 'CUKUP BERHASIL',
      statusPelaksanaan: 'Pendampingan Cukup',
      intervensiKebijakan: 'Terlaksana sebagian; inisiatif komunitas dan regulasi lokal masih terbatas. Perlu pendampingan berkala dari Balai Bahasa & Pemda.',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
      barColor: 'bg-amber-500'
    };
  } else if (rounded >= 40.0) {
    return {
      kategori: 'KURANG BERHASIL',
      statusPelaksanaan: 'Kritis / Terhambat',
      intervensiKebijakan: 'Partisipasi komunitas & penutur muda rendah, keterbatasan maestro, dan belum ada regulasi. Perlu re-evaluasi Model C dan kurikulum darurat.',
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800',
      barColor: 'bg-orange-500'
    };
  } else {
    return {
      kategori: 'TIDAK BERHASIL',
      statusPelaksanaan: 'Emergency Intervensi',
      intervensiKebijakan: 'Program stagnan. Bahasa dalam kondisi sangat terancam kepunahan. Butuh konsolidasi darurat bersama Latupati, Raja, dan tokoh adat.',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
      barColor: 'bg-rose-500'
    };
  }
}

/**
 * Formula Perhitungan Indeks Kinerja Revitalisasi Bahasa Daerah (IKRBD - 5 Dimensi)
 * IKRBD = [ ( S̄₁ × 0.25 ) + ( S̄₂ × 0.20 ) + ( S̄₃ × 0.20 ) + ( S̄₄ × 0.175 ) + ( S̄₅ × 0.175 ) ] × 20
 */
export function calculateIKRBD(indikatorNilai: Record<string, MonevIndikatorNilai>): {
  rataRataDimensi: { d1: number; d2: number; d3: number; d4: number; d5: number };
  ikrbdScore: number;
  kategori: KategoriIKRBD;
  statusPelaksanaan: string;
  intervensiKebijakan: string;
} {
  const getAvg = (dimensiId: number): number => {
    const dim = MONEV_DIMENSI_CONFIG.find(d => d.id === dimensiId);
    if (!dim || dim.indikator.length === 0) return 3;
    let sum = 0;
    let count = 0;
    dim.indikator.forEach(ind => {
      const v = indikatorNilai[ind.id]?.skor;
      if (typeof v === 'number' && v >= 1 && v <= 5) {
        sum += v;
        count++;
      } else {
        sum += 3; // default fallback
        count++;
      }
    });
    return count > 0 ? Number((sum / count).toFixed(2)) : 3;
  };

  const d1 = getAvg(1);
  const d2 = getAvg(2);
  const d3 = getAvg(3);
  const d4 = getAvg(4);
  const d5 = getAvg(5);

  const weightedSum = (d1 * 0.25) + (d2 * 0.20) + (d3 * 0.20) + (d4 * 0.175) + (d5 * 0.175);
  const rawScore = weightedSum * 20;
  const ikrbdScore = Number(rawScore.toFixed(2));

  const cat = getIKRBDCategory(ikrbdScore);

  return {
    rataRataDimensi: { d1, d2, d3, d4, d5 },
    ikrbdScore,
    kategori: cat.kategori,
    statusPelaksanaan: cat.statusPelaksanaan,
    intervensiKebijakan: cat.intervensiKebijakan
  };
}

export const INITIAL_MONEV_RECORDS: RevitalisasiMonevRecord[] = [
  {
    id: 'monev_hitumese_2026',
    kabupatenKota: 'Kabupaten Maluku Tengah',
    kecamatan: 'Leihitu',
    desa: 'Negeri Hitu',
    bahasaDaerah: 'Bahasa Hitumese',
    tanggalEvaluasi: '2026-09-18',
    petugasMonev: 'Dr. Ahmad Pellu, M.Hum.',
    nipPetugas: '197805122003121004',
    kepalaNegeri: 'Salhana Pelu (Raja Hitu)',
    nipKepalaNegeri: '196904151994031002',
    indikatorNilai: {
      '1.1': { skor: 4, catatanBukti: 'Sebagian besar anak usia SD-SMP mengikuti kelas sore di Baileo Negeri.' },
      '1.2': { skor: 4, catatanBukti: 'Anak-anak mulai menyapa dan berbalas kalimat sapaan lokal pasca-pelatihan.' },
      '1.3': { skor: 5, catatanBukti: 'Tiga maestro adat aktif mengajar dan mentransfer petuah kapata kuno.' },
      '2.1': { skor: 4, catatanBukti: 'Sanggar Hitu Bersatu rutin latihan tiap akhir pekan mandiri.' },
      '2.2': { skor: 4, catatanBukti: 'Bahasa digunakan dalam prosesi buka sasi dan doa adat.' },
      '2.3': { skor: 3, catatanBukti: 'Relawan muda masih perlu pelatihan fasilitasi media digital.' },
      '3.1': { skor: 4, catatanBukti: 'Tersedia buku saku 100 frasa Hitu dan kumpulan cerita rakyat lokal.' },
      '3.2': { skor: 3, catatanBukti: 'Distribusi materi ke dusun pesisir seberang terkendala cuaca laut.' },
      '4.1': { skor: 3, catatanBukti: 'Rancangan Perdes perlindungan bahasa sudah diusulkan ke Saniri Negeri.' },
      '4.2': { skor: 3, catatanBukti: 'Bahasa daerah diajarkan sebagai muatan lokal pilihan 1 jam/minggu.' },
      '5.1': { skor: 4, catatanBukti: 'Festival Tunas Bahasa Ibu tingkat kecamatan diadakan meriah.' },
      '5.2': { skor: 4, catatanBukti: 'Antusiasme warga dan orang tua murid sangat tinggi saat lomba mendongeng.' }
    },
    rataRataDimensi: {
      d1: 4.33,
      d2: 3.67,
      d3: 3.50,
      d4: 3.00,
      d5: 4.00
    },
    ikrbdScore: 75.43,
    kategori: 'BERHASIL',
    statusPelaksanaan: 'Efektif',
    intervensiKebijakan: 'Program berjalan baik, namun butuh penguatan konsisten pada koordinasi antarkomunitas dan integrasi di lingkungan keluarga.',
    catatanRekomendasi: 'Perlu pengesahan Perdes sesegera mungkin dan pengalokasian Dana Desa secara berkesinambungan untuk operasional sanggar.',
    createdAt: '2026-09-18T10:00:00Z',
    updatedAt: '2026-09-20T14:30:00Z',
    createdBy: 'derana.apps@gmail.com'
  },
  {
    id: 'monev_yamdena_2026',
    kabupatenKota: 'Kabupaten Kepulauan Tanimbar',
    kecamatan: 'Tanimbar Selatan',
    desa: 'Desa Olilit',
    bahasaDaerah: 'Bahasa Yamdena (Selaru-Fordata)',
    tanggalEvaluasi: '2026-08-22',
    petugasMonev: 'Maria Lerebulan, S.Pd.',
    nipPetugas: '198502142010012015',
    kepalaNegeri: 'P. Batkunde',
    nipKepalaNegeri: '197408012005011003',
    indikatorNilai: {
      '1.1': { skor: 5, catatanBukti: 'Lebih dari 120 siswa SD dan SMP mendaftar di kelas bahasa daerah.' },
      '1.2': { skor: 5, catatanBukti: 'Penggunaan aktif oleh anak-anak di lingkungan rumah dan sekolah.' },
      '1.3': { skor: 5, catatanBukti: 'Tetua adat dan tokoh gereja turut membimbing pembelajaran tutur adat.' },
      '2.1': { skor: 5, catatanBukti: 'Komunitas pemuda mandiri membentuk kelompok belajar di tiap rukun warga.' },
      '2.2': { skor: 4, catatanBukti: 'Wajib tutur bahasa Yamdena pada hari Jumat di lingkungan kantor desa.' },
      '2.3': { skor: 4, catatanBukti: 'Membuat konten lagu anak-anak berbahasa daerah di media sosial.' },
      '3.1': { skor: 4, catatanBukti: 'Modul Model C lengkap dengan glosarium dwibahasa dan gambar tematik.' },
      '3.2': { skor: 4, catatanBukti: 'Bahan ajar dapat diakses secara digital maupun cetak ramah anak.' },
      '4.1': { skor: 5, catatanBukti: 'Perdes Pelestarian Bahasa Yamdena disahkan dengan alokasi ADD Rp25.000.000.' },
      '4.2': { skor: 4, catatanBukti: 'Masuk dalam kurikulum muatan lokal wajib di seluruh SD sekecamatan.' },
      '5.1': { skor: 4, catatanBukti: 'Lomba cipta puisi daerah dan festival dendang rakyat sukses diselenggarakan.' },
      '5.2': { skor: 5, catatanBukti: 'Ribuan masyarakat memadati panggung ekspresi budaya di alun-alun.' }
    },
    rataRataDimensi: {
      d1: 5.00,
      d2: 4.33,
      d3: 4.00,
      d4: 4.50,
      d5: 4.50
    },
    ikrbdScore: 89.25,
    kategori: 'SANGAT BERHASIL',
    statusPelaksanaan: 'Mandiri & Optimal',
    intervensiKebijakan: 'Transmisi bahasa antar-generasi lancar, gerakan komunitas sangat hidup, dan regulasi lokal kuat. Siap jadi percontohan nasional.',
    catatanRekomendasi: 'Pertahankan kemandirian pembiayaan dan perluas cakupan materi sastra lisan ke rekaman audio-visual berkualitas tinggi.',
    createdAt: '2026-08-22T09:00:00Z',
    updatedAt: '2026-08-23T11:00:00Z',
    createdBy: 'derana.apps@gmail.com'
  }
];

export const INITIAL_RAP_RECORDS: RevitalisasiRAPRecord[] = [
  {
    id: 'rap_hitumese_01',
    bahasaDaerah: 'Bahasa Hitumese',
    profilPengajar: {
      namaLengkap: 'Zulkifli Tahir, S.Pd.',
      nipNik: '198709122014021003',
      instansiUnitKerja: 'SD Negeri 1 Hitu / Komunitas Pegiat Bahasa Leihitu',
      wilayahTarget: 'Kecamatan Leihitu, Kabupaten Maluku Tengah'
    },
    sasaran: {
      targetJumlahPengajarSejawat: 15,
      karakteristikPengajarSejawat: 'Guru mata pelajaran muatan lokal bahasa daerah, seni budaya, dan guru kelas IV & V SD se-Gugus Leihitu.',
      targetJumlahPenuturMuda: 120,
      karakteristikSiswa: 'Siswa SD Kelas IV - VI, peserta sanggar seni budaya negeri, dan pemuda remaja masjid.',
      liniMasa: STANDAR_LINI_MASA_RAP.map((item, idx) => ({
        ...item,
        id: `tahap_${idx + 1}`
      }))
    },
    strategi: {
      bentukKegiatan: 'Pengimbasan terstruktur kepada pengajar sejawat melalui KKG Gugus Leihitu, dilanjutkan pembelajaran interaktif siswa melalui ekstrakurikuler budaya, literasi pagi 15 menit berbahasa daerah, dan pekan festival mini di Baileo.',
      materiDanMedia: 'Modul Model C Bahasa Hitumese berbasis Cerita Rakyat Asal-Usul Empat Perdana, kartu kosa kata bergambar (Flashcards), rekaman tembang kapata maestro, dan lembar kerja latihan pidato adat sederhana.',
      metode: [
        {
          id: 'metode_1',
          no: 1,
          materi: 'Mendongeng Cerita Rakyat (Kisah Nunusaku & Hitu Lama)',
          teknik: 'Ceramah interaktif, mendongeng ekspresif, tanya jawab glosarium',
          media: 'Buku cerita bergambar, wayang kertas karakter, rekaman audio'
        },
        {
          id: 'metode_2',
          no: 2,
          materi: 'Tembang Tradisi & Kapata',
          teknik: 'Praktik menirukan irama (drill), bernyanyi bersama, ketukan tifa',
          media: 'Alat musik tifa, teks fonetik kapata, audio player'
        },
        {
          id: 'metode_3',
          no: 3,
          materi: 'Pidato / Tutur Sapa Adat Sederhana',
          teknik: 'Simulasi berpasangan, bermain peran (role-playing), gim tebak kata',
          media: 'Kartu dialog adat, mikrofon pengeras suara mini'
        },
        {
          id: 'metode_4',
          no: 4,
          materi: 'Kosakata Harian & Permainan Tradisional',
          teknik: 'Gim luar ruang (permainan lompat tali bernyanyi, tebak benda)',
          media: 'Peralatan permainan lokal, kartu kuis warna-warni'
        }
      ]
    },
    indikator: {
      jumlahPengajarTerimbas: 15,
      jumlahSiswaTerimbas: 120,
      jumlahLembagaAktif: 4,
      targetJumlahKarya: 25,
      keikutsertaanKompetisi: 'Festival Tunas Bahasa Ibu (FTBI) Tingkat Provinsi Maluku Tahun 2026'
    },
    catatanTambahan: 'Melibatkan secara intensif tetua adat setempat untuk memastikan keotentikan lafal fonetis dan nilai filosofis tutur.',
    createdAt: '2026-03-05T08:00:00Z',
    updatedAt: '2026-03-05T08:00:00Z',
    createdBy: 'derana.apps@gmail.com'
  }
];
