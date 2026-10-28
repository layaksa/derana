import { SastraLisanRecord } from '../types/sastraLisan';
import { analyzeMotifDanJenis } from '../utils/sastraLisanAnalysis';

const analysis1 = analyzeMotifDanJenis({
  namaSastra: 'Sasakala Batu Karang Meja jeung Putri Candra Wulan',
  deskripsi: 'Cerita rakyat tentang putri cantik dari kahyangan yang bertapa di atas batu karang berbentuk meja. Karena kesombongan seorang pangeran yang melanggar pantangan adat, terjadi malapetaka gaib hingga sang pangeran tersambar petir dan membatu di kaki bukit.',
  kutipan: '"Sing saha anu wani ngarempak ieu larangan karuhun, tangtu pinanggih jeung mamala, bumi moal narima, langit moal mayungan..."',
  bentukTuturan: 'Diceritakan',
  iringanMusik: 'Kacapi Suling laras Salendro',
  syarat: 'Wewangian menyan madu, seupaheun, dan pantangan berbicara kasar selama penuturan',
  tujuan: 'Peringatan moral agar generasi muda menghormati tempat suci dan menjaga kesucian tutur kata'
});

const analysis2 = analyzeMotifDanJenis({
  namaSastra: 'Babad Curug Cikaso & Siluman Maung Bodas',
  deskripsi: 'Legenda asal-usul air terjun tiga aliran di muara Cikaso yang dijaga oleh sosok gaib siluman harimau putih penolong warga. Cerita ini mengisahkan tokoh pendiri desa yang berhasil menjalin perjanjian damai dengan penunggu alam demi kesejahteraan petani.',
  kutipan: '"Ulah sakali-kali ngotoran cai di hulu walungan, sabab cai teh getihna bumi, karang teh tulangna alam..."',
  bentukTuturan: 'Diceritakan',
  iringanMusik: 'Kecapi buhun',
  syarat: 'Dilakukan pada malam Jumat Kliwon atau pasca panen raya',
  tujuan: 'Pelestarian sumber mata air dan penghormatan batas ekologis desa'
});

const analysis3 = analyzeMotifDanJenis({
  namaSastra: 'Rajah Carita Pantun Mundinglaya Dikusumah',
  deskripsi: 'Puisi naratif epik lisan Sunda kuno tentang perjalanan pangeran Pajajaran mencari Lalayang Salaka Domas ke Jabaning Langit untuk menyelamatkan kerajaan dari kehancuran.',
  kutipan: '"Bul kukus mendung ka manggung, ka manggung neda papayung, ka dewata neda suka, ka pohaci neda suci..."',
  bentukTuturan: 'Dinyanyikan',
  iringanMusik: 'Kacapi Pantun',
  syarat: 'Sesajen tujuh rupa kembang, parukuyan kemenyan putih, kopi pait dan kopi manis',
  tujuan: 'Ruatan bumi, tolak bala desa, dan peneguhan kedaulatan moral masyarakat'
});

export const INITIAL_SASTRA_LISAN_RECORDS: SastraLisanRecord[] = [
  {
    id: 'sastra_001',
    surveyId: 'survey_sample_cikaso',
    namaSastraLisan: 'Sasakala Batu Karang Meja jeung Putri Candra Wulan',
    lokasi: {
      provinsi: 'Jawa Barat',
      kabupatenKota: 'Kabupaten Kuningan',
      kecamatan: 'Kramatmulya',
      desaKelurahan: 'Cikaso',
      jalan: 'Jalan Situs Keramat No. 12',
      kodePos: '45553',
      titikKoordinat: '-6.9745, 108.4872'
    },
    narasumber: {
      namaLengkap: 'Ki Sadeli Wiraatmaja',
      komunitas: {
        status: 'Ada',
        namaKomunitas: 'Paguyuban Tradisi Lisan Sunda Luhur',
        tanggalPendirian: '1998-05-14',
        namaPendiri: 'Ki Sadeli Wiraatmaja & Tokoh Adat Cikaso',
        alamatSekretariat: 'Balai Warga RW 02 Desa Cikaso'
      },
      tempatLahir: 'Kuningan',
      tanggalLahir: '1954-08-17',
      usia: 71,
      jenisKelamin: 'Laki-laki',
      kategoriNarasumber: 'Juru cerita/pendukung aktif',
      pekerjaan: 'Petani / Juru Pelihara Situs Keramat',
      keahlianSelainPekerjaan: 'Penutur Cerita Buhun & Pengrajin Wayang Golek',
      sukuBangsa: 'Sunda',
      daerahAsal: 'Kuningan, Jawa Barat',
      bahasaDikuasai: 'Bahasa Sunda Buhun, Bahasa Indonesia',
      kondisiFisikInforman: 'Sehat prima, pendengaran dan vokal sangat lantang dan jelas'
    },
    kategoriPenutur: 'Sendiri',
    bentukTuturan: 'Diceritakan',
    bahasaDigunakan: 'Bahasa Sunda Dialek Kuningan / Wetan',
    iringanMusik: 'Kacapi Suling laras Salendro',
    tempatPertunjukan: 'Pelataran Balai Sawala Desa & Saung Keramat',
    dekorasi: 'Hamparan samak pandan, lampu cempor minyak kelapa',
    kostum: 'Baju kampret hideung, celana kombor, iket barangbang semplak',
    formasi: 'Penutur bersila di tengah menghadap penonton melingkar',
    posisiPenonton: 'Melingkar mengitari juru cerita dengan tertib',
    interaksiPenuturDanPenonton: 'Penonton menimpali dengan seruan "Euleuh!", "Komo deui!", atau anggukan takzim',
    waktuPertunjukan: 'Ba\'da Isya hingga tengah malam menjelang peringatan Hajat Bumi',
    syaratPertunjukan: 'Wewangian menyan madu, seupaheun, dan pantangan berkata kotor selama penuturan',
    deskripsiSingkat: 'Cerita toponimik tentang batu karang berkaki empat mirip meja tempat bertapa Putri Candra Wulan. Konon seorang pangeran angkuh melanggar pantangan dan dihukum menjadi sebongkah batu hitam di lereng tebing.',
    kutipanTuturan: '"Sing saha anu wani ngarempak ieu larangan karuhun, tangtu pinanggih jeung mamala, bumi moal narima, langit moal mayungan..."',
    daerahAsalSastra: 'Desa Cikaso, Lereng Gunung Ciremai',
    persebaran: 'Kecamatan Kramatmulya, Jalaksana, dan sekitarnya',
    sukuPemilik: 'Suku Sunda',
    gambaranTopografis: 'Perbukitan vulkanik subur dengan mata air berlimpah di kaki Gunung Ciremai',
    khalayakPenonton: {
      jumlah: '50 - 150 Orang',
      usia: 'Semua Usia (Anak-anak hingga Lansia)',
      jenisKelamin: 'Campuran Laki-laki dan Perempuan'
    },
    tujuanPertunjukan: 'Pendidikan budi pekerti, peringatan toponimi, dan perekat persaudaraan warga desa',
    suasanaPertunjukan: 'Khidmat, hening, sesekali riuh oleh ketegangan alur cerita',
    frekuensiPertunjukanSaatIni: 'Setahun 3-4 kali saat Seren Taun, Hajat Bumi, dan peringatan hari jadi desa',
    komunitasMenghidupi: 'Paguyuban Tradisi Lisan & Lembaga Adat Desa Cikaso',
    sistemPewarisan: 'Lisan antargenerasi di dalam keluarga juru cerita dan sanggar desa',
    infrastruktur: 'Jalan aspal desa, balai pertemuan representatif, pencahayaan listrik',
    pengambilData: {
      nama: 'Dr. Hendra Saputra, M.Hum.',
      satuanKerja: 'Pusat Riset Preservasi Bahasa & Sastra Daerah',
      tanggalPengambilanData: '2026-03-05'
    },
    hasilDokumentasi: {
      bentukDokumentasi: 'Video Full HD, Rekaman Audio WAV 96kHz, Transkripsi Cetak',
      tautanHasilDokumentasi: 'https://repositori-bahasa.kemdikbud.go.id/sastra/cikaso-001',
      namaPerekam: 'Agus Priyanto, M.Hum.',
      asalInstansi: 'Balai Bahasa Provinsi Jawa Barat'
    },
    transkripsi: {
      lampiranHasilTranskripsi: 'Transkripsi teks narasi sastra lisan berbahasa Sunda dialek Kuningan sepanjang 18 halaman dokumen.',
      namaPentranskripsi: 'Nenden Sartika, S.Pd.',
      asalInstansi: 'Universitas Kuningan (UNIKU)'
    },
    terjemahan: {
      lampiranHasilTerjemahan: 'Terjemahan harfiah dan terjemahan kontekstual ke dalam Bahasa Indonesia baku lengkap dengan anotasi kultural.',
      namaPenerjemah: 'Dr. Hendra Saputra, M.Hum.',
      asalInstansi: 'Badan Pengembangan dan Pembinaan Bahasa'
    },
    analisisJenis: analysis1.analisisJenis,
    analisisMotif: analysis1.analisisMotif,
    createdAt: '2026-03-05T10:00:00.000Z',
    updatedAt: '2026-03-05T11:30:00.000Z'
  },
  {
    id: 'sastra_002',
    surveyId: 'survey_sample_karangwangi',
    namaSastraLisan: 'Babad Curug Cikaso & Siluman Maung Bodas',
    lokasi: {
      provinsi: 'Jawa Barat',
      kabupatenKota: 'Kabupaten Cianjur',
      kecamatan: 'Cidaun',
      desaKelurahan: 'Karangwangi',
      jalan: 'Jalan Pasir Pogor RT 03/RW 01',
      kodePos: '43275',
      titikKoordinat: '-7.4820, 107.3450'
    },
    narasumber: {
      namaLengkap: 'Abah Suwarna Natapraja',
      komunitas: {
        status: 'Ada',
        namaKomunitas: 'Kokolot Lembur Cidaun',
        tanggalPendirian: '1985-02-10',
        namaPendiri: 'Keluarga Besar Sesepuh Karangwangi',
        alamatSekretariat: 'Kampung Muara Kidul, Karangwangi'
      },
      tempatLahir: 'Cianjur',
      tanggalLahir: '1958-11-23',
      usia: 68,
      jenisKelamin: 'Laki-laki',
      kategoriNarasumber: 'Juru cerita/pendukung aktif',
      pekerjaan: 'Petani & Sesepuh Adat Pesisir',
      keahlianSelainPekerjaan: 'Juru Kisah Babar Karangwangi & Tembang Kidung',
      sukuBangsa: 'Sunda',
      daerahAsal: 'Cidaun, Cianjur Kidul',
      bahasaDikuasai: 'Bahasa Sunda Pesisir Kidul, Bahasa Indonesia',
      kondisiFisikInforman: 'Sehat, penglihatan baik, memori kisah sangat rinci dan runut'
    },
    kategoriPenutur: 'Sendiri',
    bentukTuturan: 'Diceritakan',
    bahasaDigunakan: 'Bahasa Sunda Dialek Pesisir Kidul (Priangan Kidul)',
    iringanMusik: 'Kecapi buhun laras Madenda',
    tempatPertunjukan: 'Saung Lesung & Teras Rumah Adat Panggung',
    dekorasi: 'Daun beringin muda, ronce melati, kendi tanah liat',
    kostum: 'Baju pangsi cokelat tua, selendang tenun, iket wulung',
    formasi: 'Duduk bersila menghadap nampan air kelapa hijau',
    posisiPenonton: 'Duduk bersila di atas tikar pandan mengitari ruangan',
    interaksiPenuturDanPenonton: 'Juru cerita sesekali mengajukan pertanyaan retoris yang diamini oleh hadirin',
    waktuPertunjukan: 'Malam purnama pasca panen padi gogo',
    syaratPertunjukan: 'Kopi pait, sesaji kembang tujuh rupa, dan niat lurus untuk keselamatan lembur',
    deskripsiSingkat: 'Kisah mitos penjaga aliran sungai dan curug oleh siluman harimau putih yang bertransformasi menjadi penolong pembuka hutan pertama desa.',
    kutipanTuturan: '"Ulah sakali-kali ngotoran cai di hulu walungan, sabab cai teh getihna bumi, karang teh tulangna alam..."',
    daerahAsalSastra: 'Muara Cidaun - Karangwangi',
    persebaran: 'Wilayah pantai selatan Cianjur hingga perbatasan Sukabumi',
    sukuPemilik: 'Suku Sunda',
    gambaranTopografis: 'Pertemuan aliran sungai dengan pantai Samudera Hindia dan tebing karang',
    khalayakPenonton: {
      jumlah: '40 - 80 Orang',
      usia: 'Remaja hingga Orang Tua',
      jenisKelamin: 'Laki-laki dan Perempuan'
    },
    tujuanPertunjukan: 'Pendidikan ekologis menjaga kelestarian hulu sungai dan laut pesisir',
    suasanaPertunjukan: 'Sakral dan sarat pesan kearifan lokal',
    frekuensiPertunjukanSaatIni: 'Setahun dua kali pada musim sedekah laut dan ruwatan bumi',
    komunitasMenghidupi: 'Kokolot Lembur Cidaun & Himpunan Nelayan Tradisional',
    sistemPewarisan: 'Tradisi tutur lisan dari kakek ke cucu',
    infrastruktur: 'Jalan setapak semen, balai nelayan, penerangan surya',
    pengambilData: {
      nama: 'Agus Priyanto, M.Hum.',
      satuanKerja: 'Balai Bahasa Jawa Barat',
      tanggalPengambilanData: '2026-03-01'
    },
    hasilDokumentasi: {
      bentukDokumentasi: 'Rekaman Audio Digital 24-bit/96kHz, Dokumen Foto Arsip',
      tautanHasilDokumentasi: 'https://repositori-bahasa.kemdikbud.go.id/sastra/karangwangi-002',
      namaPerekam: 'Agus Priyanto, M.Hum.',
      asalInstansi: 'Balai Bahasa Jawa Barat'
    },
    transkripsi: {
      lampiranHasilTranskripsi: 'Naskah transkripsi utuh dialek Priangan Kidul dengan glosari kata arkhais pesisir.',
      namaPentranskripsi: 'Fajar Nugraha, M.Pd.',
      asalInstansi: 'Universitas Suryakancana Cianjur'
    },
    terjemahan: {
      lampiranHasilTerjemahan: 'Naskah terjemahan Bahasa Indonesia dengan catatan padanan leksikal maritim.',
      namaPenerjemah: 'Agus Priyanto, M.Hum.',
      asalInstansi: 'Balai Bahasa Jawa Barat'
    },
    analisisJenis: analysis2.analisisJenis,
    analisisMotif: analysis2.analisisMotif,
    createdAt: '2026-03-01T14:00:00.000Z',
    updatedAt: '2026-03-01T15:20:00.000Z'
  },
  {
    id: 'sastra_003',
    surveyId: 'survey_sample_pangandaran',
    namaSastraLisan: 'Rajah Carita Pantun Mundinglaya Dikusumah',
    lokasi: {
      provinsi: 'Jawa Barat',
      kabupatenKota: 'Kabupaten Pangandaran',
      kecamatan: 'Pangandaran',
      desaKelurahan: 'Babakan',
      jalan: 'Jalan Pasanggrahan Buhun No. 05',
      kodePos: '46396',
      titikKoordinat: '-7.6912, 108.6498'
    },
    narasumber: {
      namaLengkap: 'Ki Juru Pantun Dasta',
      komunitas: {
        status: 'Ada',
        namaKomunitas: 'Sanggar Pantun Parahyangan Kidul',
        tanggalPendirian: '1976-08-09',
        namaPendiri: 'Ki Dasta Prawira',
        alamatSekretariat: 'Dusun Babakan Hilir, Pangandaran'
      },
      tempatLahir: 'Ciamis',
      tanggalLahir: '1949-04-12',
      usia: 76,
      jenisKelamin: 'Laki-laki',
      kategoriNarasumber: 'Juru cerita/pendukung aktif',
      pekerjaan: 'Ki Juru Pantun / Seniman Tradisi Buhun',
      keahlianSelainPekerjaan: 'Pemetik Kacapi Pantun & Ahli Silsilah Galuh-Pajajaran',
      sukuBangsa: 'Sunda',
      daerahAsal: 'Tatar Galuh Ciamis-Pangandaran',
      bahasaDikuasai: 'Bahasa Sunda Kuno (Kawi Sunda), Sunda Pesisir Timur',
      kondisiFisikInforman: 'Mata tunanetra (khas juru pantun buhun), pendengaran sangat tajam, daya ingat luar biasa ribuan bait'
    },
    kategoriPenutur: 'Sendiri',
    bentukTuturan: 'Dinyanyikan',
    bahasaDigunakan: 'Bahasa Sunda Kuno (Arkhais) & Campuran Jawa Cirebonan',
    iringanMusik: 'Kacapi Pantun 7 Dawai',
    tempatPertunjukan: 'Pendopo Desa atau Panggung Terbuka Halaman Rumah',
    dekorasi: 'Janur kuning, beras kuning, minyak wangi cendana',
    kostum: 'Pakaian serba putih atau serba hitam dengan totopong motif merak ngibing',
    formasi: 'Duduk bersila memeluk kecapi di atas bantal beludru',
    posisiPenonton: 'Duduk mengelilingi panggung dalam keheningan total saat rajah berkumandang',
    interaksiPenuturDanPenonton: 'Hadirin menundukkan kepala khusyuk saat pembacaan rajah doa keselamatan',
    waktuPertunjukan: 'Satu malam suntuk dari pukul 20.00 hingga subuh menjelang',
    syaratPertunjukan: 'Penyediaan parukuyan dupa kemenyan, ayam bekisar putih, dan sajian tumpeng punar',
    deskripsiSingkat: 'Kisah epik kepahlawanan pangeran Mundinglaya Dikusumah yang ditugaskan mencari jimat Lalayang Salaka Domas ke Jabaning Langit guna mengembalikan kejayaan negeri Pajajaran.',
    kutipanTuturan: '"Bul kukus mendung ka manggung, ka manggung neda papayung, ka dewata neda suka, ka pohaci neda suci..."',
    daerahAsalSastra: 'Tatar Sunda (Pajajaran - Galuh)',
    persebaran: 'Wilayah Priangan Timur, Ciamis, Pangandaran, Cilacap perbatasan',
    sukuPemilik: 'Suku Sunda',
    gambaranTopografis: 'Pesisir teluk Pangandaran berlatar cagar alam hutan tropis',
    khalayakPenonton: {
      jumlah: '100 - 300 Orang',
      usia: 'Semua Lapisan Usia Warga Desa',
      jenisKelamin: 'Laki-laki dan Perempuan'
    },
    tujuanPertunjukan: 'Ruwatan desa, tolak bala, pelestarian sastra epik tertua Nusantara',
    suasanaPertunjukan: 'Penuh getaran magis dan kharisma spiritual tinggi',
    frekuensiPertunjukanSaatIni: 'Setahun 1-2 kali saat upacara adat besar lembur',
    komunitasMenghidupi: 'Sanggar Pantun Parahyangan & Dewan Kebudayaan Daerah',
    sistemPewarisan: 'Magang berguru spiritual (nyantrik) bertahun-tahun',
    infrastruktur: 'Akses jalan protokol wisata, panggung kesenian representatif',
    pengambilData: {
      nama: 'Dr. Hendra Saputra, M.Hum.',
      satuanKerja: 'Pusat Riset Preservasi Bahasa & Sastra Daerah',
      tanggalPengambilanData: '2026-03-08'
    },
    hasilDokumentasi: {
      bentukDokumentasi: 'Rekaman Multitrack Audio 8 Jam Penuh, Video Sinematik 4K',
      tautanHasilDokumentasi: 'https://repositori-bahasa.kemdikbud.go.id/sastra/pangandaran-003',
      namaPerekam: 'Tim Dokumentasi Balai Bahasa Jabar',
      asalInstansi: 'Balai Bahasa Provinsi Jawa Barat'
    },
    transkripsi: {
      lampiranHasilTranskripsi: 'Naskah transkripsi lengkap carita pantun setebal 85 halaman bait tembang dan rajah.',
      namaPentranskripsi: 'Ki Juru Pantun Dasta & Tim Filologi Unpad',
      asalInstansi: 'Pusat Studi Sunda / FIB Unpad'
    },
    terjemahan: {
      lampiranHasilTerjemahan: 'Naskah alih aksara dan terjemahan puitis ke dalam Bahasa Indonesia dengan aparatus kritik filologis.',
      namaPenerjemah: 'Dr. Hendra Saputra, M.Hum.',
      asalInstansi: 'Badan Bahasa Kemendikbudristek'
    },
    analisisJenis: analysis3.analisisJenis,
    analisisMotif: analysis3.analisisMotif,
    createdAt: '2026-03-08T16:00:00.000Z',
    updatedAt: '2026-03-08T18:00:00.000Z'
  }
];
