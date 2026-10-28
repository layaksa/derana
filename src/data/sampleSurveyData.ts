import { InstrumenPemetaanBahasaData, NarasumberData } from '../types/linguistic';
import { INITIAL_SWADESH_LIST, INITIAL_KOSAKATA_BUDAYA, INITIAL_STRUKTUR_FRASA, INITIAL_KALIMAT_SEDERHANA, INITIAL_CATATAN_PENGUMPUL } from './swadeshList';
import { 
  SWADESH_200_TP01_PRIANGAN, 
  SWADESH_200_TP02_SUKABUMI, 
  SWADESH_200_TP03_RANCABUAYA, 
  SWADESH_200_TP04_BABAKAN_PANGANDARAN 
} from './swadesh200FullData';

export function createEmptyNarasumber(id: number): NarasumberData {
  return {
    id,
    nama: '',
    jenisKelamin: '',
    usia: '',
    tahunKelahiran: '',
    tempatLahir: {
      desa: '',
      kecamatan: '',
      kabupatenKota: '',
      provinsi: ''
    },
    pendidikanTertinggi: '',
    pekerjaan: {
      lokasiBekerja: '',
      sebagaiApa: ''
    },
    lamaTinggalTahun: '',
    frekuensiMobilitas: '',
    frekuensiSeringBerapaKali: '',
    mediaSosial: {
      facebook: false,
      tiktok: false,
      instagram: false,
      twitter: false,
      lainLain: ''
    },
    bahasaDigunakan: {
      diRumah: '',
      diMasyarakat: '',
      diTempatKerja: '',
      diPerjalanan: ''
    },
    bahasaLainDikuasai: [
      { namaBahasa: '', dialek: '', penguasaan: 'aktif' }
    ]
  };
}

export function getEmptySurveyData(): InstrumenPemetaanBahasaData {
  return {
    titikPengamatan: {
      namaDesa: '',
      bahasaDigunakan: '',
      namaLainBahasa: '',
      kecamatan: '',
      kabupatenKota: '',
      pulau: '',
      provinsi: '',
      kodeTitik: 'TP-01'
    },
    situasiKebahasaan: {
      timur: { desa: '', bahasa: '', kecamatan: '' },
      barat: { desa: '', bahasa: '', kecamatan: '' },
      utara: { desa: '', bahasa: '', kecamatan: '' },
      selatan: { desa: '', bahasa: '', kecamatan: '' }
    },
    situasiGeografis: {
      letakPantai: '',
      jarakDariPantaiKm: '',
      morfologi: 'dataran',
      koordinatLintang: '',
      koordinatBujur: ''
    },
    penduduk: {
      jumlahPria: '',
      jumlahWanita: '',
      umurBawah20: '',
      umur20sd40: '',
      umurDiatas40: '',
      penuturPria: '',
      penuturWanita: '',
      penuturUmurBawah20: '',
      penuturUmur20sd40: '',
      penuturUmurDiatas40: '',
      mayoritasEtnik: '',
      mayoritasEtnikPersen: '',
      minoritasEtnik: '',
      minoritasEtnikPersen: ''
    },
    mataPencaharian: {
      bertani: '',
      nelayan: '',
      berdagang: '',
      buruh: '',
      pegawai: '',
      lainLain: '',
      keteranganLain: ''
    },
    pendidikan: {
      tidakSekolah: '',
      sdSederajat: '',
      smpSederajat: '',
      smaSederajat: '',
      perguruanTinggi: '',
      sarjanaAsalDesa: ''
    },
    saranaPendidikan: {
      sdSederajat: '',
      smpSederajat: '',
      smaSederajat: '',
      perguruanTinggi: '',
      kursusKursus: '',
      keterangan: ''
    },
    agama: {
      islam: '',
      protestan: '',
      kristen: '',
      katolik: '',
      hindu: '',
      buddha: '',
      konghucu: '',
      lainLain: ''
    },
    hubunganMobilitas: {
      status: '',
      catatan: ''
    },
    alatTransportasi: {
      bus: false,
      miniBus: false,
      sepedaMotor: false,
      kuda: false,
      kapalMotor: false,
      kapalLaut: false,
      pesawatUdara: false,
      lainLain: false,
      keteranganLain: ''
    },
    usiaDesa: {
      kategori: '',
      estimasiTahun: '',
      catatanSumber: ''
    },
    sejarahDesa: {
      sejarahSingkat: '',
      asalUsulNama: '',
      tokohPendiri: ''
    },
    folklore: {
      judulFolklore: '',
      kategori: '',
      ringkasanCerita: '',
      tokohUtama: '',
      maknaTradisi: ''
    },
    narasumberList: [
      createEmptyNarasumber(1),
      createEmptyNarasumber(2),
      createEmptyNarasumber(3)
    ],
    kosakataLengkap: {
      swadeshList: JSON.parse(JSON.stringify(INITIAL_SWADESH_LIST)),
      kosakataBudaya: JSON.parse(JSON.stringify(INITIAL_KOSAKATA_BUDAYA)),
      strukturFrasa: JSON.parse(JSON.stringify(INITIAL_STRUKTUR_FRASA)),
      kalimatSederhana: JSON.parse(JSON.stringify(INITIAL_KALIMAT_SEDERHANA)),
      catatanPengumpul: JSON.parse(JSON.stringify(INITIAL_CATATAN_PENGUMPUL))
    },
    dialektometri: {
      titikAcuan: 'TP-01 (Desa Pengamatan)',
      titikPembandingList: [
        {
          id: 'TP-02',
          namaTitik: 'TP-02 Cikaso',
          desa: 'Cikaso',
          bahasa: 'Sunda Dialek Selatan',
          lintang: -7.512,
          bujur: 107.412,
          jumlahBeda: 48,
          jumlahGlos: 200,
          persentaseBeda: 24.0,
          statusHubungan: 'Beda Dialek'
        },
        {
          id: 'TP-03',
          namaTitik: 'TP-03 Rancabuaya',
          desa: 'Rancabuaya',
          bahasa: 'Sunda Pesisir Pameungpeuk',
          lintang: -7.534,
          bujur: 107.525,
          jumlahBeda: 26,
          jumlahGlos: 200,
          persentaseBeda: 13.0,
          statusHubungan: 'Beda Wicara/Subdialek'
        },
        {
          id: 'TP-04',
          namaTitik: 'TP-04 Pangandaran',
          desa: 'Babakan',
          bahasa: 'Sunda-Jawa Campuran (Banyumasan)',
          lintang: -7.688,
          bujur: 108.648,
          jumlahBeda: 122,
          jumlahGlos: 200,
          persentaseBeda: 61.0,
          statusHubungan: 'Beda Subbahasa'
        }
      ],
      catatanIsoglos: 'Garis isoglos leksikal membedakan varian vokal sentral [ə] dan [a] pada suku kata terbuka di pesisir selatan.',
      kesimpulanGeolinguistik: 'Titik pengamatan memiliki relasi subdialek yang sangat dekat dengan TP-03 Rancabuaya (13%), dan membentuk batas dialek geografis di sepanjang lembah pesisir.'
    }
  };
}

// Sample Data Survei Lengkap untuk Demo Interaktif
export function getSampleSurveyData(): InstrumenPemetaanBahasaData {
  const data = getEmptySurveyData();

  data.titikPengamatan = {
    namaDesa: 'Karangwangi',
    bahasaDigunakan: 'Bahasa Sunda',
    namaLainBahasa: 'Basa Sunda Pesisir Kidul (Wewengkon Cianjur Selatan)',
    kecamatan: 'Cidaun',
    kabupatenKota: 'Kabupaten Cianjur',
    pulau: 'Jawa',
    provinsi: 'Jawa Barat',
    kodeTitik: 'TP-01'
  };

  data.situasiKebahasaan = {
    timur: { desa: 'Karyabakti', bahasa: 'Bahasa Sunda (Dialek Priangan Selatan)', kecamatan: 'Cidaun' },
    barat: { desa: 'Jayapura', bahasa: 'Bahasa Sunda Pesisir', kecamatan: 'Cidaun' },
    utara: { desa: 'Cibuluh', bahasa: 'Bahasa Sunda Pegunungan', kecamatan: 'Cidaun' },
    selatan: { desa: 'Samudra Hindia (Batas Alam)', bahasa: 'Wilayah Pesisir Lepas', kecamatan: 'Cidaun' }
  };

  data.situasiGeografis = {
    letakPantai: 'pantai',
    jarakDariPantaiKm: 0.8,
    morfologi: 'pesisir',
    koordinatLintang: -7.4982,
    koordinatBujur: 107.3485
  };

  data.penduduk = {
    jumlahPria: 1845,
    jumlahWanita: 1780,
    umurBawah20: 1025,
    umur20sd40: 1610,
    umurDiatas40: 990,
    penuturPria: 1720,
    penuturWanita: 1680,
    penuturUmurBawah20: 890,
    penuturUmur20sd40: 1540,
    penuturUmurDiatas40: 970,
    mayoritasEtnik: 'Sunda',
    mayoritasEtnikPersen: 94.2,
    minoritasEtnik: 'Jawa & Bugis',
    minoritasEtnikPersen: 5.8
  };

  data.mataPencaharian = {
    bertani: 920,
    nelayan: 640,
    berdagang: 280,
    buruh: 190,
    pegawai: 65,
    lainLain: 85,
    keteranganLain: 'Pengrajin anyaman bambu & pengolah ikan asin'
  };

  data.pendidikan = {
    tidakSekolah: 110,
    sdSederajat: 1420,
    smpSederajat: 980,
    smaSederajat: 720,
    perguruanTinggi: 195,
    sarjanaAsalDesa: 140
  };

  data.saranaPendidikan = {
    sdSederajat: 3,
    smpSederajat: 1,
    smaSederajat: 1,
    perguruanTinggi: 0,
    kursusKursus: 2,
    keterangan: 'Terdapat 2 madrasah diniyah dan 1 balai pelatihan keterampilan menjahit & melaut'
  };

  data.agama = {
    islam: 3585,
    protestan: 22,
    kristen: 0,
    katolik: 11,
    hindu: 4,
    buddha: 3,
    konghucu: 0,
    lainLain: 0
  };

  data.hubunganMobilitas = {
    status: 'lancar',
    catatan: 'Akses jalan lintas selatan Jawa Barat (Jalur Pantai Selatan) sudah beraspal hotmix baik, dilalui angkutan umum dan mobil barang.'
  };

  data.alatTransportasi = {
    bus: true,
    miniBus: true,
    sepedaMotor: true,
    kuda: false,
    kapalMotor: true,
    kapalLaut: false,
    pesawatUdara: false,
    lainLain: true,
    keteranganLain: 'Perahu nelayan mesin tempel (jukung) dan mobil pick-up antar desa.'
  };

  data.usiaDesa = {
    kategori: '200_500',
    estimasiTahun: 'Sekitar tahun 1785 (±240 tahun lalu)',
    catatanSumber: 'Babad Limbangan dan catatan silsilah Dalem Cikundul saat pembukaan jalur pesisir selatan.'
  };

  data.sejarahDesa = {
    sejarahSingkat: 'Desa Karangwangi dahulunya merupakan pos pertahanan pelaut dan nelayan tradisional pada era Karesidenan Priangan. Dinamakan Karangwangi karena terdapat karang terumbu di tepi pantai yang konon mengeluarkan aroma khas saat air surut di waktu petang.',
    asalUsulNama: 'Berasal dari kata "Karang" (batu karang laut) dan "Wangi" (harum semerbak kembang laut/tetumbuhan pesisir).',
    tokohPendiri: 'Kyai Rangga Wisesa dan Raden Bagus Wangsakusumah.'
  };

  data.folklore = {
    judulFolklore: 'Sasakala Batu Karang Meja jeung Putri Candra Wulan',
    kategori: 'Legenda Pesisir Laut Selatan',
    ringkasanCerita: 'Alkisah putri jelita yang menolak lamaran saudagar tamak dan bertapa di atas karang datar menghadap samudera hingga menjelma menjadi hamparan batu karang kokoh penahan ombak pasang tsunami.',
    tokohUtama: 'Putri Candra Wulan dan Aki Jampang',
    maknaTradisi: 'Nilai kesetiaan menjaga kelestarian laut serta perlindungan masyarakat pesisir dari bencana abrasi.'
  };

  // Sample Profil Narasumber 1
  data.narasumberList[0] = {
    id: 1,
    nama: 'H. Abah Suwarna',
    jenisKelamin: 'pria',
    usia: 68,
    tahunKelahiran: 1958,
    tempatLahir: {
      desa: 'Karangwangi',
      kecamatan: 'Cidaun',
      kabupatenKota: 'Kabupaten Cianjur',
      provinsi: 'Jawa Barat'
    },
    pendidikanTertinggi: 'SMP Sederajat',
    pekerjaan: {
      lokasiBekerja: 'Desa Karangwangi (Pesisir & Ladang)',
      sebagaiApa: 'Tetua Adat / Tokoh Budaya & Petani Kelapa'
    },
    lamaTinggalTahun: 68,
    frekuensiMobilitas: 'jarang_1_bulan',
    frekuensiSeringBerapaKali: '',
    mediaSosial: {
      facebook: false,
      tiktok: false,
      instagram: false,
      twitter: false,
      lainLain: 'Hanya menggunakan telepon suara biasa'
    },
    bahasaDigunakan: {
      diRumah: 'Bahasa Sunda Wewengkon Pesisir (Akrab/Loma)',
      diMasyarakat: 'Bahasa Sunda Loma dan Lemes',
      diTempatKerja: 'Bahasa Sunda',
      diPerjalanan: 'Bahasa Sunda & Bahasa Indonesia'
    },
    bahasaLainDikuasai: [
      { namaBahasa: 'Bahasa Indonesia', dialek: 'Standar Nasional', penguasaan: 'aktif' },
      { namaBahasa: 'Bahasa Jawa Banyumasan', dialek: 'Pesisir Pangandaran', penguasaan: 'pasif' }
    ]
  };

  // Sample Profil Narasumber 2
  data.narasumberList[1] = {
    id: 2,
    nama: 'Ibu Hj. Siti Rokayah',
    jenisKelamin: 'wanita',
    usia: 52,
    tahunKelahiran: 1974,
    tempatLahir: {
      desa: 'Karangwangi',
      kecamatan: 'Cidaun',
      kabupatenKota: 'Kabupaten Cianjur',
      provinsi: 'Jawa Barat'
    },
    pendidikanTertinggi: 'SMA Sederajat',
    pekerjaan: {
      lokasiBekerja: 'Pasar Pelelangan Ikan Karangwangi',
      sebagaiApa: 'Pedagang Hasil Laut & Pengrajin Ikan Asin'
    },
    lamaTinggalTahun: 52,
    frekuensiMobilitas: 'jarang_1_bulan',
    frekuensiSeringBerapaKali: '',
    mediaSosial: {
      facebook: true,
      tiktok: true,
      instagram: false,
      twitter: false,
      lainLain: 'WhatsApp Grup Paguyuban Nelayan'
    },
    bahasaDigunakan: {
      diRumah: 'Bahasa Sunda',
      diMasyarakat: 'Bahasa Sunda Loma',
      diTempatKerja: 'Bahasa Sunda dan Bahasa Indonesia',
      diPerjalanan: 'Bahasa Indonesia'
    },
    bahasaLainDikuasai: [
      { namaBahasa: 'Bahasa Indonesia', dialek: 'Baku Pasar', penguasaan: 'aktif' }
    ]
  };

  // Sample Profil Narasumber 3
  data.narasumberList[2] = {
    id: 3,
    nama: 'Kang Dadan Ramdani',
    jenisKelamin: 'pria',
    usia: 34,
    tahunKelahiran: 1992,
    tempatLahir: {
      desa: 'Karangwangi',
      kecamatan: 'Cidaun',
      kabupatenKota: 'Kabupaten Cianjur',
      provinsi: 'Jawa Barat'
    },
    pendidikanTertinggi: 'Perguruan Tinggi (Sarjana Pendidikan)',
    pekerjaan: {
      lokasiBekerja: 'SMP Satu Atap Karangwangi',
      sebagaiApa: 'Guru Muatan Lokal Bahasa Daerah'
    },
    lamaTinggalTahun: 34,
    frekuensiMobilitas: 'sering',
    frekuensiSeringBerapaKali: 4,
    mediaSosial: {
      facebook: true,
      tiktok: true,
      instagram: true,
      twitter: true,
      lainLain: 'YouTube edukasi basa Sunda'
    },
    bahasaDigunakan: {
      diRumah: 'Bahasa Sunda',
      diMasyarakat: 'Bahasa Sunda',
      diTempatKerja: 'Bahasa Sunda & Bahasa Indonesia',
      diPerjalanan: 'Bahasa Indonesia'
    },
    bahasaLainDikuasai: [
      { namaBahasa: 'Bahasa Indonesia', dialek: 'Baku', penguasaan: 'aktif' },
      { namaBahasa: 'Bahasa Inggris', dialek: 'Standar Akademik', penguasaan: 'aktif' }
    ]
  };

  // Populate all 200 Swadesh sample entries with realistic Sundanese dialect data (TP-01 Priangan)
  data.kosakataLengkap.swadeshList = data.kosakataLengkap.swadeshList.map(item => {
    const entry = SWADESH_200_TP01_PRIANGAN[item.glosIndonesia];
    if (entry) {
      return {
        ...item,
        bentukLokal: entry.bentuk,
        transkripsiIPA: entry.ipa,
        catatan: entry.catatan || ''
      };
    }
    return item;
  });

  // Populate sample cultural vocabulary for first few fields safely
  if (data.kosakataLengkap?.kosakataBudaya?.[0]?.daftarKata?.[0]) {
    data.kosakataLengkap.kosakataBudaya[0].daftarKata[0].bentukLokal = "rambut / buuk / rambut sirah";
    data.kosakataLengkap.kosakataBudaya[0].daftarKata[0].transkripsiIPA = "[buuk / rambut]";
  }
  if (data.kosakataLengkap?.kosakataBudaya?.[0]?.daftarKata?.[1]) {
    data.kosakataLengkap.kosakataBudaya[0].daftarKata[1].bentukLokal = "tarang / taar";
    data.kosakataLengkap.kosakataBudaya[0].daftarKata[1].transkripsiIPA = "[taraŋ / taʔar]";
  }

  // Populate sample phrase structures safely
  if (data.kosakataLengkap?.strukturFrasa?.nominalPosesif?.[0]) {
    data.kosakataLengkap.strukturFrasa.nominalPosesif[0].bentukFrasaLokal = "imah kuring / rorompok abdi";
    data.kosakataLengkap.strukturFrasa.nominalPosesif[0].terjemahanHarfiah = "rumah + saya";
  }
  if (data.kosakataLengkap?.strukturFrasa?.nominalPosesif?.[1]) {
    data.kosakataLengkap.strukturFrasa.nominalPosesif[1].bentukFrasaLokal = "budak kuwu";
    data.kosakataLengkap.strukturFrasa.nominalPosesif[1].terjemahanHarfiah = "anak + kepala desa";
  }

  if (data.kosakataLengkap?.strukturFrasa?.frasaVerbal?.[0]) {
    data.kosakataLengkap.strukturFrasa.frasaVerbal[0].bentukFrasaLokal = "keur ngadahar sangu";
    data.kosakataLengkap.strukturFrasa.frasaVerbal[0].terjemahanHarfiah = "sedang + makan + nasi";
  }

  if (data.kosakataLengkap?.strukturFrasa?.frasaAdjektival?.[0]) {
    data.kosakataLengkap.strukturFrasa.frasaAdjektival[0].bentukFrasaLokal = "kacida gedéna";
    data.kosakataLengkap.strukturFrasa.frasaAdjektival[0].terjemahanHarfiah = "sangat + besarnya";
  }

  if (data.kosakataLengkap?.kalimatSederhana?.[0]) {
    data.kosakataLengkap.kalimatSederhana[0].kalimatLokal = "Tukang tani melak paré di sawah.";
    data.kosakataLengkap.kalimatSederhana[0].glosPerKata = "Petani menanam padi di sawah";
  }

  return data;
}

/**
 * Returns 4 realistic survey records distributed across West Java & southern coastal region
 * for immediate geographic dialectometry and lexical variation visualization.
 */
export function getSampleSurveyCikaso(): InstrumenPemetaanBahasaData {
  const data = getEmptySurveyData();
  data.titikPengamatan = {
    namaDesa: 'Cikaso',
    bahasaDigunakan: 'Bahasa Sunda',
    namaLainBahasa: 'Basa Sunda Priangan Kidul',
    kecamatan: 'Cibitung',
    kabupatenKota: 'Kabupaten Sukabumi',
    pulau: 'Jawa',
    provinsi: 'Jawa Barat',
    kodeTitik: 'TP-02'
  };
  data.situasiGeografis = {
    letakPantai: 'pantai',
    jarakDariPantaiKm: 3.5,
    morfologi: 'perbukitan',
    koordinatLintang: -7.5120,
    koordinatBujur: 107.4120
  };
  // Populate all 200 Swadesh sample entries for TP-02 Cikaso Sukabumi
  data.kosakataLengkap.swadeshList = data.kosakataLengkap.swadeshList.map(item => {
    const entry = SWADESH_200_TP02_SUKABUMI[item.glosIndonesia];
    if (entry) {
      return {
        ...item,
        bentukLokal: entry.bentuk,
        transkripsiIPA: entry.ipa,
        catatan: entry.catatan || ''
      };
    }
    return item;
  });

  // Sample Informants TP-02 Cikaso Sukabumi
  data.narasumberList = [
    {
      id: 1,
      nama: 'Pak Ujang Suherman',
      jenisKelamin: 'pria',
      usia: 62,
      tahunKelahiran: 1964,
      tempatLahir: { desa: 'Cikaso', kecamatan: 'Cibitung', kabupatenKota: 'Sukabumi', provinsi: 'Jawa Barat' },
      pendidikanTertinggi: 'SD Sederajat',
      pekerjaan: { lokasiBekerja: 'Perkebunan Cikaso', sebagaiApa: 'Petani cengkeh & tetua kampung' },
      lamaTinggalTahun: 62,
      frekuensiMobilitas: 'jarang_1_bulan',
      mediaSosial: { facebook: false, tiktok: false, instagram: false, twitter: false, lainLain: '' },
      bahasaDigunakan: { diRumah: 'Bahasa Sunda Priangan', diMasyarakat: 'Bahasa Sunda', diTempatKerja: 'Bahasa Sunda', diPerjalanan: 'Bahasa Sunda & Indonesia' },
      bahasaLainDikuasai: [{ namaBahasa: 'Bahasa Indonesia', dialek: 'Pasar', penguasaan: 'aktif' }]
    },
    {
      id: 2,
      nama: 'Ibu Neneng Hasanah',
      jenisKelamin: 'wanita',
      usia: 48,
      tahunKelahiran: 1978,
      tempatLahir: { desa: 'Cikaso', kecamatan: 'Cibitung', kabupatenKota: 'Sukabumi', provinsi: 'Jawa Barat' },
      pendidikanTertinggi: 'SMP Sederajat',
      pekerjaan: { lokasiBekerja: 'Pasar Desa Cikaso', sebagaiApa: 'Pedagang kelontong' },
      lamaTinggalTahun: 48,
      frekuensiMobilitas: 'jarang_1_bulan',
      mediaSosial: { facebook: true, tiktok: false, instagram: false, twitter: false, lainLain: '' },
      bahasaDigunakan: { diRumah: 'Bahasa Sunda', diMasyarakat: 'Bahasa Sunda & Indonesia', diTempatKerja: 'Bahasa Sunda', diPerjalanan: 'Bahasa Indonesia' },
      bahasaLainDikuasai: []
    },
    {
      id: 3,
      nama: 'Asep Mulyana',
      jenisKelamin: 'pria',
      usia: 29,
      tahunKelahiran: 1997,
      tempatLahir: { desa: 'Cikaso', kecamatan: 'Cibitung', kabupatenKota: 'Sukabumi', provinsi: 'Jawa Barat' },
      pendidikanTertinggi: 'SMA / SMK Sederajat',
      pekerjaan: { lokasiBekerja: 'Bengkel Desa', sebagaiApa: 'Teknisi & wiraswasta' },
      lamaTinggalTahun: 29,
      frekuensiMobilitas: 'sering',
      mediaSosial: { facebook: true, tiktok: true, instagram: true, twitter: false, lainLain: '' },
      bahasaDigunakan: { diRumah: 'Bahasa Sunda', diMasyarakat: 'Bahasa Sunda & Indonesia', diTempatKerja: 'Bahasa Sunda & Indonesia', diPerjalanan: 'Bahasa Indonesia' },
      bahasaLainDikuasai: [{ namaBahasa: 'Bahasa Indonesia', dialek: 'Baku', penguasaan: 'aktif' }]
    }
  ];

  return data;
}

export function getSampleSurveyRancabuaya(): InstrumenPemetaanBahasaData {
  const data = getEmptySurveyData();
  data.titikPengamatan = {
    namaDesa: 'Rancabuaya',
    bahasaDigunakan: 'Bahasa Sunda',
    namaLainBahasa: 'Basa Sunda Pesisir Garut Selatan',
    kecamatan: 'Caringin',
    kabupatenKota: 'Kabupaten Garut',
    pulau: 'Jawa',
    provinsi: 'Jawa Barat',
    kodeTitik: 'TP-03'
  };
  data.situasiGeografis = {
    letakPantai: 'pantai',
    jarakDariPantaiKm: 0.3,
    morfologi: 'pesisir',
    koordinatLintang: -7.5340,
    koordinatBujur: 107.5250
  };

  // Populate all 200 Swadesh sample entries for TP-03 Rancabuaya Garut Selatan
  data.kosakataLengkap.swadeshList = data.kosakataLengkap.swadeshList.map(item => {
    const entry = SWADESH_200_TP03_RANCABUAYA[item.glosIndonesia];
    if (entry) {
      return {
        ...item,
        bentukLokal: entry.bentuk,
        transkripsiIPA: entry.ipa,
        catatan: entry.catatan || ''
      };
    }
    return item;
  });

  // Sample Informants TP-03 Rancabuaya Garut Selatan
  data.narasumberList = [
    {
      id: 1,
      nama: 'Abah Rusman Hidayat',
      jenisKelamin: 'pria',
      usia: 71,
      tahunKelahiran: 1955,
      tempatLahir: { desa: 'Rancabuaya', kecamatan: 'Caringin', kabupatenKota: 'Garut', provinsi: 'Jawa Barat' },
      pendidikanTertinggi: 'Tidak Tamat SD',
      pekerjaan: { lokasiBekerja: 'TPI Rancabuaya', sebagaiApa: 'Nelayan tradisional & tetua pesisir' },
      lamaTinggalTahun: 71,
      frekuensiMobilitas: 'tidak_pernah',
      mediaSosial: { facebook: false, tiktok: false, instagram: false, twitter: false, lainLain: '' },
      bahasaDigunakan: { diRumah: 'Bahasa Sunda Pesisir', diMasyarakat: 'Bahasa Sunda', diTempatKerja: 'Bahasa Sunda', diPerjalanan: 'Bahasa Sunda' },
      bahasaLainDikuasai: []
    },
    {
      id: 2,
      nama: 'Ibu Eni Kurniati',
      jenisKelamin: 'wanita',
      usia: 55,
      tahunKelahiran: 1971,
      tempatLahir: { desa: 'Rancabuaya', kecamatan: 'Caringin', kabupatenKota: 'Garut', provinsi: 'Jawa Barat' },
      pendidikanTertinggi: 'SMA Sederajat',
      pekerjaan: { lokasiBekerja: 'Sentra Ikan Asin Rancabuaya', sebagaiApa: 'Pengolah hasil laut & pengrajin' },
      lamaTinggalTahun: 55,
      frekuensiMobilitas: 'jarang_1_bulan',
      mediaSosial: { facebook: true, tiktok: false, instagram: false, twitter: false, lainLain: '' },
      bahasaDigunakan: { diRumah: 'Bahasa Sunda', diMasyarakat: 'Bahasa Sunda', diTempatKerja: 'Bahasa Sunda', diPerjalanan: 'Bahasa Sunda & Indonesia' },
      bahasaLainDikuasai: [{ namaBahasa: 'Bahasa Indonesia', dialek: 'Percakapan', penguasaan: 'aktif' }]
    },
    {
      id: 3,
      nama: 'Hendra Gunawan',
      jenisKelamin: 'pria',
      usia: 38,
      tahunKelahiran: 1988,
      tempatLahir: { desa: 'Rancabuaya', kecamatan: 'Caringin', kabupatenKota: 'Garut', provinsi: 'Jawa Barat' },
      pendidikanTertinggi: 'Diploma (D3 Perikanan)',
      pekerjaan: { lokasiBekerja: 'Koperasi Nelayan Pantai', sebagaiApa: 'Pengelola TPI & koordinator nelayan' },
      lamaTinggalTahun: 38,
      frekuensiMobilitas: 'sering',
      mediaSosial: { facebook: true, tiktok: false, instagram: true, twitter: false, lainLain: '' },
      bahasaDigunakan: { diRumah: 'Bahasa Sunda', diMasyarakat: 'Bahasa Sunda & Indonesia', diTempatKerja: 'Bahasa Sunda & Indonesia', diPerjalanan: 'Bahasa Indonesia' },
      bahasaLainDikuasai: [{ namaBahasa: 'Bahasa Indonesia', dialek: 'Baku', penguasaan: 'aktif' }]
    }
  ];

  return data;
}

export function getSampleSurveyPangandaran(): InstrumenPemetaanBahasaData {
  const data = getEmptySurveyData();
  data.titikPengamatan = {
    namaDesa: 'Babakan',
    bahasaDigunakan: 'Bahasa Sunda - Jawa (Banyumasan)',
    namaLainBahasa: 'Basa Jawa Perbatasan Kidul & Sunda Campuran',
    kecamatan: 'Pangandaran',
    kabupatenKota: 'Kabupaten Pangandaran',
    pulau: 'Jawa',
    provinsi: 'Jawa Barat',
    kodeTitik: 'TP-04'
  };
  data.situasiGeografis = {
    letakPantai: 'pantai',
    jarakDariPantaiKm: 1.2,
    morfologi: 'pesisir',
    koordinatLintang: -7.6880,
    koordinatBujur: 108.6480
  };

  // Populate all 200 Swadesh sample entries for TP-04 Babakan Pangandaran
  data.kosakataLengkap.swadeshList = data.kosakataLengkap.swadeshList.map(item => {
    const entry = SWADESH_200_TP04_BABAKAN_PANGANDARAN[item.glosIndonesia];
    if (entry) {
      return {
        ...item,
        bentukLokal: entry.bentuk,
        transkripsiIPA: entry.ipa,
        catatan: entry.catatan || ''
      };
    }
    return item;
  });

  // Sample Informants TP-04 Babakan Pangandaran
  data.narasumberList = [
    {
      id: 1,
      nama: 'Mbah Sastro Dimejo',
      jenisKelamin: 'pria',
      usia: 74,
      tahunKelahiran: 1952,
      tempatLahir: { desa: 'Babakan', kecamatan: 'Pangandaran', kabupatenKota: 'Pangandaran', provinsi: 'Jawa Barat' },
      pendidikanTertinggi: 'SD Sederajat (SR)',
      pekerjaan: { lokasiBekerja: 'Desa Babakan', sebagaiApa: 'Tetua adat perbatasan Jawa-Sunda' },
      lamaTinggalTahun: 74,
      frekuensiMobilitas: 'tidak_pernah',
      mediaSosial: { facebook: false, tiktok: false, instagram: false, twitter: false, lainLain: '' },
      bahasaDigunakan: { diRumah: 'Bahasa Jawa Banyumasan & Sunda', diMasyarakat: 'Bahasa Jawa & Sunda', diTempatKerja: 'Bahasa Jawa & Sunda', diPerjalanan: 'Bahasa Sunda & Jawa' },
      bahasaLainDikuasai: [{ namaBahasa: 'Bahasa Sunda', dialek: 'Priangan Kidul', penguasaan: 'aktif' }]
    },
    {
      id: 2,
      nama: 'Ibu Wartini',
      jenisKelamin: 'wanita',
      usia: 50,
      tahunKelahiran: 1976,
      tempatLahir: { desa: 'Babakan', kecamatan: 'Pangandaran', kabupatenKota: 'Pangandaran', provinsi: 'Jawa Barat' },
      pendidikanTertinggi: 'SMP Sederajat',
      pekerjaan: { lokasiBekerja: 'Pasar Ikan Pangandaran', sebagaiApa: 'Pedagang ikan asin & tani' },
      lamaTinggalTahun: 50,
      frekuensiMobilitas: 'jarang_1_bulan',
      mediaSosial: { facebook: true, tiktok: false, instagram: false, twitter: false, lainLain: '' },
      bahasaDigunakan: { diRumah: 'Bahasa Sunda & Jawa', diMasyarakat: 'Bahasa Indonesia & Sunda', diTempatKerja: 'Bahasa Sunda & Indonesia', diPerjalanan: 'Bahasa Indonesia' },
      bahasaLainDikuasai: [{ namaBahasa: 'Bahasa Jawa', dialek: 'Banyumasan', penguasaan: 'aktif' }]
    },
    {
      id: 3,
      nama: 'Teguh Wahyudi, S.Pd.',
      jenisKelamin: 'pria',
      usia: 42,
      tahunKelahiran: 1984,
      tempatLahir: { desa: 'Babakan', kecamatan: 'Pangandaran', kabupatenKota: 'Pangandaran', provinsi: 'Jawa Barat' },
      pendidikanTertinggi: 'Sarjana (S1 Pendidikan Bahasa)',
      pekerjaan: { lokasiBekerja: 'SMP Negeri Pangandaran', sebagaiApa: 'Guru bahasa daerah & peneliti lokal' },
      lamaTinggalTahun: 42,
      frekuensiMobilitas: 'sering',
      mediaSosial: { facebook: true, tiktok: false, instagram: true, twitter: true, lainLain: '' },
      bahasaDigunakan: { diRumah: 'Bahasa Sunda & Jawa', diMasyarakat: 'Bahasa Indonesia, Sunda, Jawa', diTempatKerja: 'Bahasa Indonesia & Sunda', diPerjalanan: 'Bahasa Indonesia' },
      bahasaLainDikuasai: [
        { namaBahasa: 'Bahasa Indonesia', dialek: 'Baku', penguasaan: 'aktif' },
        { namaBahasa: 'Bahasa Jawa Banyumasan', dialek: 'Pesisir', penguasaan: 'aktif' }
      ]
    }
  ];

  return data;
}

