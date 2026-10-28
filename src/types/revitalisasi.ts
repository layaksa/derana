export type KategoriIKRBD = 
  | 'SANGAT BERHASIL' 
  | 'BERHASIL' 
  | 'CUKUP BERHASIL' 
  | 'KURANG BERHASIL' 
  | 'TIDAK BERHASIL';

export interface MonevIndikatorConfig {
  id: string; // e.g. "1.1", "1.2"
  dimensiId: number; // 1 to 5
  nomor: string;
  judul: string;
  deskripsi: string;
}

export interface MonevDimensiConfig {
  id: number;
  judul: string;
  bobot: number; // e.g. 0.25 (25%)
  bobotPersen: number; // 25
  deskripsi: string;
  indikator: MonevIndikatorConfig[];
}

export interface MonevIndikatorNilai {
  skor: number; // 1 to 5
  catatanBukti: string;
}

export interface RevitalisasiMonevRecord {
  id: string;
  kabupatenKota: string;
  kecamatan: string;
  desa: string;
  bahasaDaerah: string;
  tanggalEvaluasi: string;
  petugasMonev: string;
  nipPetugas?: string;
  kepalaNegeri?: string;
  nipKepalaNegeri?: string;
  
  // Nilai per indikator: id "1.1", "1.2", dll.
  indikatorNilai: Record<string, MonevIndikatorNilai>;
  
  // Nilai rata-rata per dimensi
  rataRataDimensi: {
    d1: number; // Pembelajaran & Partisipasi Subjek (25%)
    d2: number; // Keterlibatan Komunitas & Grassroots (20%)
    d3: number; // Ketersediaan Modul & Materi Ajar (20%)
    d4: number; // Dukungan Kelembagaan & Kebijakan Lokal (17.5%)
    d5: number; // Ruang Ekspresi & Festival (17.5%)
  };
  
  ikrbdScore: number; // 0 - 100
  kategori: KategoriIKRBD;
  statusPelaksanaan: string;
  intervensiKebijakan: string;
  
  catatanRekomendasi: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// Rencana Aksi Pengimbasan (RAP)
export interface LiniMasaItem {
  id: string;
  no: number;
  tahapan: string;
  tanggal: string;
  lokasiMedia: string; // Daring/Luring/Sekolah
}

export interface MetodePengimbasanItem {
  id: string;
  no: number;
  materi: string;
  teknik: string; // Ceramah, praktik, diskusi, gim, dll
  media: string;
}

export interface RevitalisasiRAPRecord {
  id: string;
  bahasaDaerah: string;
  
  // A. Profil Pengajar Utama
  profilPengajar: {
    namaLengkap: string;
    nipNik: string;
    instansiUnitKerja: string;
    wilayahTarget: string;
  };
  
  // B. Sasaran dan Jadwal Pelaksanaan
  sasaran: {
    targetJumlahPengajarSejawat: number;
    karakteristikPengajarSejawat: string;
    targetJumlahPenuturMuda: number;
    karakteristikSiswa: string;
    liniMasa: LiniMasaItem[];
  };
  
  // C. Strategi Pengimbasan
  strategi: {
    bentukKegiatan: string;
    materiDanMedia: string;
    metode: MetodePengimbasanItem[];
  };
  
  // D. Indikator Keberhasilan
  indikator: {
    jumlahPengajarTerimbas: number;
    jumlahSiswaTerimbas: number;
    jumlahLembagaAktif: number;
    targetJumlahKarya: number;
    keikutsertaanKompetisi: string;
  };
  
  catatanTambahan?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}
