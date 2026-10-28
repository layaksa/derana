import { KosakataItem, KosakataBudayaBidang, FrasaItem, KalimatItem, CatatanPengumpulData } from '../types/linguistic';

// ============================================================================
// I. KOSAKATA DASAR SWADES (200 Kata Sesuai Instrumen Resmi Badan/Pusat Bahasa)
// Urutan Alfabetis 1 s.d. 200 persis sesuai dokumen PDF kuesioner pemetaan bahasa
// ============================================================================
export const SWADESH_200_GLOS: string[] = [
  "abu", "air", "akar", "alir (me)", "anak", "angin", "anjing", "apa", "api", "apung (me)",
  "asap", "awan", "ayah", "bagaimana", "baik", "bakar", "balik", "banyak", "baring", "baru",
  "basah", "batu", "beberapa", "belah (me)", "benar", "bengkak", "benih", "berat", "berenang", "beri",
  "berjalan", "besar", "bilamana", "binatang", "bintang", "buah", "bulan", "bulu", "bunga", "bunuh",
  "buru (ber)", "buruk", "burung", "busuk", "cacing", "cium", "cuci", "daging", "dan", "danau",
  "darah", "datang", "daun", "debu", "dekat", "dengan", "dengar", "di dalam", "di mana", "di sini",
  "di situ", "pada", "dingin", "diri (ber)", "dorong", "dua", "duduk", "ekor", "empat", "engkau",
  "gali", "garam", "garuk", "gemuk, lemak", "gigi", "gigit", "gosok", "gunung", "hantam", "hapus",
  "hati", "hidung", "hidup", "hijau", "hisap (isap)", "hitam", "hitung", "hujan", "hutan", "ia",
  "ibu", "ikan", "ikat", "ini", "istri", "itu", "jahit", "jalan (ber)", "jantung", "jatuh",
  "jauh", "kabut", "kaki", "kalau", "kami, kita", "kamu", "kanan", "karena", "kata (ber)", "kecil",
  "kelahi (ber)", "kepala", "kering", "kiri", "kotor", "kuku", "kulit", "kuning", "kutu", "lain",
  "langit", "laut", "lebar", "leher", "lelaki", "lempar", "licin", "lidah", "lihat", "lima",
  "ludah", "lurus", "lutut", "main", "makan", "malam", "mata", "matahari", "mati", "merah",
  "mereka", "minum", "mulut", "muntah", "nama", "napas", "nyanyi", "orang", "panas", "panjang",
  "pasir", "pegang", "pendek", "peras", "perempuan", "perut", "pikir", "pohon", "potong", "punggung",
  "pusar", "putih", "rambut", "rumput", "satu", "saya", "sayap", "sedikit", "sempit", "semua",
  "siang", "siapa", "suami", "sungai", "tahu", "tahun", "tajam", "takut", "tali", "tanah",
  "tangan", "tarik", "tebal", "telinga", "telur", "terbang", "tertawa", "tetek", "tidak", "tidur",
  "tiga", "tikam (me)", "tipis", "tiup", "tongkat", "tua", "tulang", "tumpul", "ular", "usus"
];

export const INITIAL_SWADESH_LIST: KosakataItem[] = SWADESH_200_GLOS.map((glos, index) => ({
  id: index + 1,
  glosIndonesia: glos,
  bentukLokal: "",
  transkripsiIPA: "",
  catatan: ""
}));

// ============================================================================
// II. KOSAKATA BUDAYA DASAR MENURUT BIDANG (18 BIDANG A s.d. R LENGKAP SESUAI PDF)
// ============================================================================
export const KOSAKATA_BUDAYA_DEFINISI = [
  {
    kode: "a",
    namaBidang: "Bagian Tubuh",
    deskripsi: "Anatomi, anggota tubuh manusia, indra, dan cairan tubuh (52 Glos)",
    daftarKata: [
      "alis", "bagian kuku yang putih", "bahu", "betis", "bibir", "bulu kemaluan", "bulu mata", "cambang",
      "dada", "dagu", "dahi", "geraham", "gigi seri", "gigi yang bertumpuk tumbuhnya", "gigi yang menonjol keluar",
      "gusi", "ibu jari", "janggut", "jari", "jari manis", "jari tengah", "kelingking", "kemaluan laki-laki",
      "kemaluan wanita", "keringat", "kerongkongan", "ketiak", "kumis", "langit-langit", "lengan", "mata kaki",
      "ompong", "otak", "paha", "pantat", "paru-paru", "pelipis", "pergelangan tangan", "pinggang", "pinggul",
      "pipi", "pundak", "rusuk", "siku", "telunjuk", "tengkuk (kuduk)", "tubuh", "tulang kering", "tumit",
      "tungkai", "ubun-ubun", "urat"
    ]
  },
  {
    kode: "b",
    namaBidang: "Kata Ganti, Sapaan, dan Acuan",
    deskripsi: "Pronomina persona, kata sapaan usia, dan deiksis (11 Glos)",
    daftarKata: [
      "kami (berdua)", "kami (bertiga)", "kita", "laki-laki", "panggilan untuk anak laki kecil",
      "panggilan untuk gadis kecil", "panggilan untuk gadis remaja", "panggilan untuk lelaki remaja",
      "panggilan untuk lelaki tua", "panggilan untuk wanita tua", "(yang) mana"
    ]
  },
  {
    kode: "c",
    namaBidang: "Sistem Kekerabatan",
    deskripsi: "Hubungan darah, perkawinan, garis keturunan, dan keluarga luas (25 Glos)",
    daftarKata: [
      "abang (kakak laki-laki)", "abang/kakak dari istri", "abang/kakak dari suami", "abangnya ayah/ibu",
      "adik", "adik dari istri", "adik dari suami", "adik laki-laki ayah/ibu", "adik perempuan ayah/ibu",
      "anak abang/kakak", "anak adik", "anak dari abang/kakaknya ayah/ibu", "anak dari adiknya ayah/ibu",
      "anaknya cucu", "besan", "cucu", "istri/suami dari abang/kakak", "istri/suami dari adik",
      "kakak perempuan", "kakaknya ayah/ibu", "kakek", "menantu", "mertua", "nenek", "orang tua kakek/nenek"
    ]
  },
  {
    kode: "d",
    namaBidang: "Kehidupan Desa dan Masyarakat",
    deskripsi: "Aparatur desa, upacara adat, siklus hidup, dan interaksi sosial (36 Glos)",
    daftarKata: [
      "amil", "arisan", "bertunangan", "datang ke tempat kenduri", "dewasa", "juru tulis", "kawin",
      "keluarga batih", "kenduri", "kepala desa", "kepala kampung", "kepala suku", "kerja bakti",
      "ketua adat", "khitanan", "lahir", "melahirkan", "mengandung", "menguburkan", "meninggal",
      "menujuh bulan", "menujuh hari", "pamong desa", "penghulu", "pesuruh desa", "polisi desa",
      "ronda malam", "sawah milik desa (tanah ulayat)", "tahlilan", "upacara empat puluh hari",
      "upacara hari ketiga", "upacara puput pusar", "upacara seratus hari", "upacara turun tanah",
      "wakil kepala desa", "warga yang mendapat sawah"
    ]
  },
  {
    kode: "e",
    namaBidang: "Rumah dan Bagian-Bagiannya",
    deskripsi: "Arsitektur hunian tradisional, ruangan, dan material bangunan (48 Glos)",
    daftarKata: [
      "atap", "bubung", "dangau", "dapur", "dinding bambu", "dinding tembok", "genting", "gereja",
      "gudang", "halaman", "jendela", "kamar", "kandang", "kandang ayam", "kandang kambing",
      "kandang kerbau", "kandang kuda", "kandang merpati", "kandang sapi", "kasau", "kelenteng",
      "kuda-kuda", "langit-langit", "lubang asap", "lumbung", "masjid", "pagar", "palangdada",
      "para-para", "pelimbahan", "pintu", "pondok", "pura", "pusaka", "ruang depan", "ruang tengah",
      "rumah", "rumah adat", "rumah ibadah adat", "serambi", "serambi samping", "surau", "tangga",
      "tempat", "tempat barang di atas tungku", "tempat tungku", "tiang", "tungku"
    ]
  },
  {
    kode: "f",
    namaBidang: "Peralatan dan Perlengkapan",
    deskripsi: "Perkakas pertanian, menangkap ikan, tenun, dan perabotan dapur (71 Glos)",
    daftarKata: [
      "alu", "bajak", "bakul", "bakul kecil", "balai-balai", "bantal", "beliung", "bubu", "busur",
      "buyung", "cangkir", "cangkul", "cangkul kecil", "centong", "cobek", "dayung", "dayung (ber)",
      "dingklik", "galah", "garu", "gayung", "gelas", "gergaji", "golok (parang)", "jala besar",
      "jala kecil", "jarum", "jerat", "kail", "kapak", "kasur", "katir (cadik)", "keranjang",
      "kipas anglo", "lampit", "layar", "lesung", "mata bajak", "mata kail", "nyiru", "nyiru besar",
      "pahat", "panah", "pancing", "parang", "patil", "pedupaan", "pemukul", "penggerus", "perahu",
      "perisai", "periuk", "piring", "pisau", "ranjau", "rumah tenun", "sampan", "selimut", "sendok",
      "suling", "sumpit", "tali pancing", "tempat beras", "tempat ikan", "tempat pendingin nasi",
      "tempayan", "tikar", "timba", "tombak", "wadah", "wajan"
    ]
  },
  {
    kode: "g",
    namaBidang: "Makanan dan Minuman",
    deskripsi: "Bahan pangan lokal, olahan tradisional, bumbu, dan minuman (52 Glos)",
    daftarKata: [
      "abon", "arak", "bubur", "bubur sumsum", "cendol", "cincau", "cuka", "dendeng", "gado-gado",
      "galendo", "getuk", "gulai", "jagung", "jeruk", "kacang", "kerak", "kerupuk", "kerupuk kulit",
      "ketupat", "kue", "lahang (nira)", "lalap", "lauk-pauk", "lemang", "lemper", "lepat", "lontong",
      "madu", "makanan", "mangga", "marus", "minuman", "nangka", "nasi", "nasi basi", "nasi belum matang",
      "nasi kukus", "nanas", "nugat", "pecel", "rempeyek", "rujak", "rujak sambal", "sagu", "sambal",
      "sayur", "serabi", "tapai", "tapai ketan", "tapai singkong", "tuak", "ubi"
    ]
  },
  {
    kode: "h",
    namaBidang: "Tanaman Halaman dan Pepohonan",
    deskripsi: "Flora pekarangan, pohon rimba, umbi, bambu, dan rempah bumbu (68 Glos)",
    daftarKata: [
      "alang-alang", "asam", "aur", "bakau", "beligo", "bambu", "batang", "bawang", "belimbing",
      "belimbing wuluh", "beluntas", "bengkuang", "benih (bibit)", "beras", "beringin", "buluh",
      "bunga", "cabai", "cabang", "cermai", "durian", "enau", "gebang", "halia (jahe)", "jagung",
      "jambu air", "jambu batu", "jambu mete", "kacang", "kacang panjang", "kacang tanah", "kapuk",
      "kedondong", "kelapa", "kentang", "ketimun (mentimun)", "kunyit", "labu", "lengkuas", "lontar",
      "mandalika (sirsak)", "manggis", "mengkudu", "padi", "pandan", "peria (pare)", "pepaya",
      "pering (bambu pering)", "petai", "petai cina", "petung (bambu besar)", "pisang", "pisang batu",
      "pohon", "rambutan", "ranting", "rotan", "rumput", "sawi", "selada (sejenis sawi)",
      "tangkil (melinjo, belinjo)", "tebu", "terung", "tuba", "turi", "ubi jalar", "ubi kayu", "waru"
    ]
  },
  {
    kode: "i",
    namaBidang: "Binatang",
    deskripsi: "Hewan ternak, unggas, ikan, satwa liar, reptil, dan serangga (90 Glos)",
    daftarKata: [
      "anak angsa", "anak anjing", "anak ayam", "anak domba", "anak entog (mentok)", "anak ikan gabus",
      "anak itik", "anak kambing", "anak kerbau kecil", "anak kerbau tanggung", "anak kucing", "anak kuda",
      "anak merpati", "anak sapi", "angsa", "ayam", "ayam betina dewasa", "ayam betina tanggung",
      "ayam jantan dewasa", "ayam jantan tanggung", "babi", "babi rusa", "bangau", "belibis", "belut",
      "beo", "beruk", "biawak", "buaya", "burung hantu", "capung", "cecak", "cumi-cumi", "domba",
      "elang", "gurita", "harimau", "ikan gabus", "ikan hiu", "ikan lele", "ikan mas", "ikan pari",
      "itik", "itik manila (entog/mentok)", "kala (kalajengking)", "kambing", "kancil", "kepiting",
      "kepodang", "kepompong", "kera", "kerbau", "kesturi (sejenis tikus berbau)/musang kesturi",
      "ketam batu", "ketilang", "kodok", "kucing", "kuda", "kupu-kupu", "kura-kura (bulus)", "kutu",
      "laba-laba", "lalat", "langau (lalat besar berwarna hijau)", "lebah", "lutung (kera hitam)",
      "merpati (burung dara)", "musang", "nyamuk", "penyu", "perkutut", "pipit", "rusa", "sapi",
      "semut", "serangga", "tanduk", "telur kutu", "tenggiling", "tikus", "tikus besar", "tikus kecil",
      "tokek", "tuma (kutu pakaian)", "tuna (ikan tongkol)", "udang", "udang galah", "ular hijau",
      "ular sawah", "ulat"
    ]
  },
  {
    kode: "j",
    namaBidang: "Musim, Keadaan Alam, Benda Alam, dan Arah",
    deskripsi: "Meteorologi, bentang alam, benda langit, perairan, dan mata angin (81 Glos)",
    daftarKata: [
      "anak sungai", "arang", "arus", "atas", "banjir", "bara", "barat", "bawah", "besi",
      "bintang jatuh (meteor)", "bintang kejora", "bintang pari", "bintang tujuh", "bintang waluku",
      "bukit", "bulan", "bulan purnama", "bulan sabit", "busut", "darat", "datar", "dini hari",
      "dusun (kampung)", "emas", "embun", "fajar", "gerhana", "gerimis", "guntur", "hangat", "hari",
      "hari sekitar pukul 10 malam", "hari sekitar pukul 12 siang", "hari sekitar pukul 8 malam",
      "hujan angin", "hujan panas", "hutan belantara", "jurang", "kayu", "kilat", "kota", "ladang",
      "landai", "lembah", "lereng", "lubuk", "mata air", "matahari condong ke barat",
      "matahari sepenggalah", "mendung", "muara sungai", "musim hujan", "musim panas",
      "musim peralihan hujan ke panas", "musim peralihan panas ke hujan", "ombak", "padang",
      "padang alang-alang", "pagi", "pagi buta", "pantai", "pelangi", "perak", "punggung gunung",
      "puting beliung", "sawah", "sawah tadah hujan", "sejuk", "selatan", "senja", "senja buta",
      "sore", "tanjung", "tebing", "teja", "teluk", "tengah hari", "tepian", "terjal", "timur", "utara"
    ]
  },
  {
    kode: "k",
    namaBidang: "Penyakit dan Pengobatan",
    deskripsi: "Keluhan fisik, penyakit endemik lokal, dan pengobatan tradisional (36 Glos)",
    daftarKata: [
      "batuk", "batuk kering", "belek (klara, sejenis sakit mata)", "bengek (asma)", "berkunang-kunang",
      "bisu", "bisul", "borok", "burut (hernia)", "busung", "buta", "congek (telinga bernanah)",
      "demam", "demam panas", "disentri (berak darah)", "encok", "gondok (pembengkakan di leher)",
      "kejang urat", "kudis", "kurap", "luka", "menceret (diare)", "mulas", "nanah", "obat", "panu",
      "pingsan", "pusing", "rabun (mata kabur)", "rabun ayam", "rajasinga (sifilis)", "sakit perut",
      "selesma", "sembuh", "tuli", "wasir"
    ]
  },
  {
    kode: "l",
    namaBidang: "Perangai, Kata Sifat, dan Warna",
    deskripsi: "Karakter kepribadian, kondisi fisik/mental, rasa, tekstur, dan warna (87 Glos)",
    daftarKata: [
      "angkuh", "asam", "bagus", "bengkok", "berani", "berbulu", "bersih", "bijaksana", "biru",
      "bodoh", "boros", "botak", "buta", "cekatan", "cepat", "cerdas", "cokelat", "dungu", "gampang",
      "gelap", "gemuk", "halus", "harum", "haus", "hemat", "kaku", "kasar", "kaya", "kelabu",
      "kembung", "kempis", "kikir", "kuat", "kurus", "lama", "lambat", "lemah", "luas", "malu",
      "manis", "manjur", "marah", "merah hati", "merah jambu", "miring", "miskin", "muda",
      "mudah bangun", "jingga (oranye)", "pahit", "pangkal", "pemalas", "pemalu", "pemarah",
      "pemberani", "pemurah", "perajuk", "peramah", "pinggir", "pintar", "rajin", "rakus", "ramah",
      "rendah", "ringan", "sabar", "sakit", "sakti", "salah", "sehat", "sopan", "sulit",
      "takut (pada benturan fisik)", "takut (pada suasana)", "tegak", "tenang", "tengah", "terang",
      "terkejut", "tidak adil", "tidak buta", "tidak malu", "tidak sabar", "tinggi", "ujung", "ungu", "usang"
    ]
  },
  {
    kode: "m",
    namaBidang: "Mata Pencarian",
    deskripsi: "Profesi tradisional, keahlian khusus, dan jenis pekerjaan masyarakat (20 Glos)",
    daftarKata: [
      "algojo", "buruh tani", "derep (buruh penuai padi)", "dukun", "dukun bayi", "dukun sunat",
      "gembala", "kuli", "nelayan", "pandai besi", "pandai emas", "pawang binatang", "pelawak",
      "pembuat barang tembaga", "pembuat gerabah", "pemburu berbedil", "pemburu bertombak",
      "penyumpit", "petani", "tukang"
    ]
  },
  {
    kode: "n",
    namaBidang: "Pakaian dan Perhiasan",
    deskripsi: "Busana tradisional, kain tenun/batik, aksesoris tubuh, dan alas kaki (28 Glos)",
    daftarKata: [
      "anting-anting", "baju", "benang jahit", "benang tenun", "cawat", "celana dalam", "celana panjang",
      "celana pendek", "cincin", "gelang", "ikat kepala (destar)", "jarum", "kain batik", "kalung",
      "kapas", "kebaya", "kopiah", "kutang", "lilin (malam)", "nila", "sabuk", "sarung (untuk laki-laki)",
      "sarung (untuk perempuan)", "selendang", "sepatu", "singlet", "subang", "terompah"
    ]
  },
  {
    kode: "o",
    namaBidang: "Permainan",
    deskripsi: "Permainan rakyat, olahraga tradisional, dan seni bela diri (9 Glos)",
    daftarKata: [
      "gasing", "gundu (kelereng)", "jurus pencak", "layangan", "main galah (galah asin, benteng)",
      "panahan", "pencak silat", "sepak bola", "sepak raga"
    ]
  },
  {
    kode: "p",
    namaBidang: "Gerak dan Kerja",
    deskripsi: "Verba tindakan tubuh, pekerjaan fisik, gerak lokomotor, dan aktivitas (98 Glos)",
    daftarKata: [
      "ambil", "angkat (me)", "asuh (me)", "ayun", "baca", "bangun", "berak", "bopong", "buai", "buang",
      "bujuk", "buka", "congak (me)", "delik (me)", "didik (me)", "dukung (gendong)", "gandeng",
      "gantung", "genggam", "henti (ber)", "hirup", "hitung (dalam hati)", "igau (meng)", "ingat",
      "injak", "intai", "jilat", "jitak (ketuk kepala dengan buku jari)", "jongkok", "junjung",
      "kaji (me)", "kelahi (ber)", "kencing", "kulum", "kunyah", "ladang (ber)", "larang (me)",
      "lari", "lari-lari kecil", "lepas", "letakkan", "letus (me)", "lindur (me) (tidur berjalan)",
      "lirik", "lotot (me)", "ludah (me)", "lupa", "mandi", "mandikan (me)", "mimpi (ber)", "muntah",
      "naik", "nyala (me)", "nyenyak", "panah (me)", "panggil", "pejamkan mata", "peluk", "pergi",
      "picingkan mata", "pikul", "pintal (me)", "potong", "pukul", "putus", "raba", "rangkul",
      "sandar", "selam", "senandung (ber)", "sentuh", "sila (ber)", "sila sebelah kaki", "simpan",
      "simpuh (ber)", "suap (me)", "suruh", "susui (me)", "tanam", "tangis (me)", "tari", "telan",
      "telungkup", "tendang", "tenggelam", "tenun (me)", "terbenam", "terbit", "teriak", "terima",
      "tidurkan (me)", "tinju", "tulis", "tunjuk", "turun", "tusuk", "urut", "usap"
    ]
  },
  {
    kode: "q",
    namaBidang: "Kata Bilangan",
    deskripsi: "Numeralia pokok, belasan, puluhan, ratusan, ribuan, dan tingkatan (52 Glos)",
    daftarKata: [
      "delapan", "delapan belas", "delapan puluh", "dua belas", "dua puluh", "dua puluh lima",
      "empat belas", "empat puluh", "enam", "enam belas", "enam puluh", "kedelapan", "kedua",
      "kedua belas", "kedua puluh", "kedua puluh satu", "keempat", "keenam", "kelima", "kelima belas",
      "kesatu", "kesebelas", "kesembilan", "kesembilan belas", "kesepuluh", "keseratus", "keseribu",
      "ketiga", "ketujuh", "lima belas", "lima puluh", "lima ribu", "ratus", "ribu", "sebelas",
      "sedikit", "sembilan", "sembilan belas", "sembilan puluh", "sepuluh", "sepuluh ribu",
      "seratus", "seratus lima puluh lima", "seratus ribu", "seratus sepuluh", "seribu",
      "tiga belas", "tiga puluh", "tiga puluh lima", "tujuh", "tujuh belas", "tujuh puluh"
    ]
  },
  {
    kode: "r",
    namaBidang: "Kata Tugas",
    deskripsi: "Preposisi, konjungsi, partikel aspek, dan keterangan waktu/deiksis (25 Glos)",
    daftarKata: [
      "akan", "atau", "belum", "besok (sehari sesudah hari ini)", "dahulu", "dari", "di luar", "di sana",
      "hari ini", "jarang", "kadang-kadang", "ke", "kemarin (sehari sebelum hari ini)", "kepada",
      "lusa (dua hari sesudah hari ini)", "pernah", "sedang", "sekarang", "selalu", "sering (sering kali)",
      "sudah", "supaya", "tadi", "tetapi", "tiba-tiba"
    ]
  }
];

export const INITIAL_KOSAKATA_BUDAYA: KosakataBudayaBidang[] = KOSAKATA_BUDAYA_DEFINISI.map(item => ({
  kode: item.kode,
  namaBidang: item.namaBidang,
  deskripsi: item.deskripsi,
  daftarKata: item.daftarKata.map((kata, idx) => ({
    id: idx + 1,
    glosIndonesia: kata,
    bentukLokal: "",
    transkripsiIPA: "",
    catatan: ""
  }))
}));

// ============================================================================
// III. STRUKTUR FRASA (A s.d. D SESUAI HALAMAN 31 s.d. 33 PDF)
// ============================================================================
export const INITIAL_STRUKTUR_FRASA = {
  // A. Frasa Nominal
  // 1. Relasi Posesif (genitif) (10 item)
  nominalPosesif: [
    "anak kambing", "hidung saya", "kepala kakak saya", "mata saya", "orang tua kawan saya",
    "pekerjaan kakak", "pemberian ayah", "permintaan ibu", "rumah ayah", "tangan adik"
  ].map((label, idx) => ({
    id: `np-${idx + 1}`,
    kategori: "Frasa Nominal",
    subKategori: "1. Relasi Posesif (genitif)",
    labelIndonesia: label,
    bentukFrasaLokal: "",
    terjemahanHarfiah: "",
    penjelasanStruktur: "N (Benda/Bagian) + N/Pron (Pemilik/Acuan)"
  })),

  // 2. Relasi Partitif (5 item)
  nominalPartitif: [
    "akhir minggu", "awal minggu", "penghabisan bulan", "pinggir jalan", "sisa makanan"
  ].map((label, idx) => ({
    id: `npart-${idx + 1}`,
    kategori: "Frasa Nominal",
    subKategori: "2. Relasi Partitif",
    labelIndonesia: label,
    bentukFrasaLokal: "",
    terjemahanHarfiah: "",
    penjelasanStruktur: "N (Bagian/Porsi) + N (Keseluruhan)"
  })),

  // 3. Relasi Asal dan Material (9 item)
  nominalAsalMaterial: [
    "anting emas", "gelang perak", "kain Bugis", "keris Yogya", "orang Bandung",
    "panah besi", "penduduk Jakarta", "peti kayu", "rumah papan"
  ].map((label, idx) => ({
    id: `nam-${idx + 1}`,
    kategori: "Frasa Nominal",
    subKategori: "3. Relasi Asal dan Material",
    labelIndonesia: label,
    bentukFrasaLokal: "",
    terjemahanHarfiah: "",
    penjelasanStruktur: "N (Benda/Insani) + N (Material/Asal Daerah)"
  })),

  // B. Frasa Verbal (8 item)
  frasaVerbal: [
    "bertanam padi", "harus istirahat", "ingin tidur", "makan nasi", "mau belajar",
    "membawa anak", "memukul anjing", "mengendarai kuda"
  ].map((label, idx) => ({
    id: `fv-${idx + 1}`,
    kategori: "Frasa Verbal",
    subKategori: "Frasa Verbal (Tindakan & Aspek)",
    labelIndonesia: label,
    bentukFrasaLokal: "",
    terjemahanHarfiah: "",
    penjelasanStruktur: "V/Aux + O/V"
  })),

  // C. Frasa Adjektival (10 item)
  frasaAdjektival: [
    "amat besar", "anak muda", "anak yang nakal", "arus yang deras", "besar sekali",
    "gunung yang tinggi", "laut yang luas", "lebih besar", "paling besar", "sama besar dengan ayah"
  ].map((label, idx) => ({
    id: `fa-${idx + 1}`,
    kategori: "Frasa Adjektival",
    subKategori: "Frasa Adjektival (Derajat, Kualitas & Komparatif)",
    labelIndonesia: label,
    bentukFrasaLokal: "",
    terjemahanHarfiah: "",
    penjelasanStruktur: "Adv/Intens + Adj / Adj + Pembanding"
  })),

  // D. Frasa Adverbial (19 item)
  frasaAdverbial: [
    "banyak anak", "beberapa orang", "dari pasar", "di belakang rumah (arah ke darat)",
    "di belakang rumah (arah ke laut)", "di dalam rumah (arah ke darat)", "di dalam rumah (arah ke laut)",
    "di rumah (arah ke barat)", "di rumah (arah ke darat)", "di rumah (arah ke laut)", "di rumah (arah ke timur)",
    "di sisi rumah", "hampir tiba", "ke pasar", "lima puluh pekerja", "sedang mandi",
    "seratus orang", "seribu rumah", "tidak makan"
  ].map((label, idx) => ({
    id: `fadv-${idx + 1}`,
    kategori: "Frasa Adverbial",
    subKategori: "Frasa Adverbial (Arah Spasial, Lokasi, Kuantitas & Waktu)",
    labelIndonesia: label,
    bentukFrasaLokal: "",
    terjemahanHarfiah: "",
    penjelasanStruktur: "Prep + Deiksis/Arah / Num + N / Adv + V"
  }))
};

// ============================================================================
// IV. KALIMAT SEDERHANA (41 KALIMAT SESUAI HALAMAN 33 s.d. 34 PDF)
// ============================================================================
export const KALIMAT_SEDERHANA_TEXTS: string[] = [
  "Adik berjalan.",
  "Adik dimandikan ibu.",
  "Agar lulus ujian kamu harus belajar.",
  "Apa yang Saudara maksud?",
  "Apakah Bapak pernah ke Jakarta?",
  "Ayah mandi.",
  "Ayah membeli baju untuk saya.",
  "Ayah membelikan saya baju.",
  "Bacalah buku itu!",
  "Bagaimana membuat kecap?",
  "Baju dibeli ayah untuk saya.",
  "Berapa harga 1 kg ubi kayu?",
  "Biarkan saja dia bermain di luar.",
  "Bilamana kamu pergi?",
  "Di kampung tidak ada listrik.",
  "Hari ini terlalu panas.",
  "Hujan turun hingga sore.",
  "Ia menangis karena dipukul.",
  "Ibu memandikan adik.",
  "Ibu pulang dari pasar.",
  "Jika tidak tahu, harap bertanya.",
  "Kakak ke sekolah.",
  "Kakak sudah pergi.",
  "Kakaknya bodoh, tetapi adiknya pandai.",
  "Kalau menolong jangan kepalang.",
  "Kambing itu hampir mati.",
  "Kamu boleh ikut asalkan membayar.",
  "Mengapa ia terlambat?",
  "Mereka tak pernah berkelahi.",
  "Negara kita berdasarkan Pancasila.",
  "Pak Bupati tidak datang sehingga upacara dibubarkan.",
  "Petani pergi ke sawah.",
  "Rumah itu besar sekali.",
  "Rumah saya di Kebayoran.",
  "Saya dibelikan ayah sebuah baju.",
  "Saya tidak suka pisang.",
  "Sejak pagi mendung.",
  "Siapa itu?",
  "Tolong belikan rokok!",
  "Untuk siapa baju itu?",
  "Walaupun diundang, ia tidak datang."
];

export const INITIAL_KALIMAT_SEDERHANA: KalimatItem[] = KALIMAT_SEDERHANA_TEXTS.map((kalimat, idx) => ({
  id: `ks-${idx + 1}`,
  kalimatIndonesia: kalimat,
  kalimatLokal: "",
  glosPerKata: "",
  analisisStruktur: ""
}));

// ============================================================================
// CATATAN PENGUMPUL DATA (SESUAI HALAMAN 35 PDF)
// ============================================================================
export const INITIAL_CATATAN_PENGUMPUL: CatatanPengumpulData = {
  tanggalWawancara: "16 Mei 2024",
  tempatLatarWawancara: "Teras Balai Adat Desa Cikondang, Kec. Cisewu",
  waktuDiperlukan: "2 jam 45 menit (pukul 09.00 - 11.45 WIB)",
  jumlahOrangHadir: "3 orang (Narasumber utama, juru bicara adat, dan sekretaris desa)",
  suasanaWawancara: "Sangat kooperatif, santai, dan narasumber sangat antusias menjelaskan istilah adat setempat. Penutur sangat fasih berbahasa ibu dan ramah.",
  namaLengkapPengumpul: "Dr. Muhammad Ridwan, M.Hum.",
  pekerjaanPengumpul: "Peneliti Dialektologi Balai Bahasa",
  tandaTanganPengumpul: "Terverifikasi Digital (M. Ridwan)",
  catatanPengumpul: "Narasumber memiliki ingatan leksikal yang tajam dan artikulatif. Pengucapan vokal dan konsonan terdengar jelas dan konsisten. Beberapa istilah fauna dan flora kuno (arkaik) dijelaskan dengan teliti tanpa keraguan.",
  catatanVerifikator: "[REKOMENDASI VERIFIKASI] Data lapangan valid dan memiliki indeks keandalan tinggi (92%). Transkripsi IPA konsisten dengan inventaris fonem bahasa setempat.",
  statusVerifikasiKualitatif: "siap_disetujui",
  tanggalVerifikasiKualitatif: "20 Mei 2024"
};

// ============================================================================
// IPA Quick Keyboard Symbols for Linguistic transcription
// ============================================================================
export const IPA_SYMBOLS = [
  { symbol: "ə", label: "pepet (schwa)" },
  { symbol: "ɛ", label: "e terbuka" },
  { symbol: "ɔ", label: "o terbuka" },
  { symbol: "ŋ", label: "ng (velar nasal)" },
  { symbol: "ɲ", label: "ny (palatal nasal)" },
  { symbol: "ʔ", label: "glottal stop" },
  { symbol: "ɣ", label: "voiced velar fricative" },
  { symbol: "ʃ", label: "sy (esh)" },
  { symbol: "ʧ", label: "c (voiceless affricate)" },
  { symbol: "ʤ", label: "j (voiced affricate)" },
  { symbol: "β", label: "bilabial fricative" },
  { symbol: "ð", label: "dental fricative" },
  { symbol: "θ", label: "voiceless dental" },
  { symbol: "ɨ", label: "central high vowel" },
  { symbol: "ɯ", label: "close back unrounded (eu Sunda)" },
  { symbol: "ʊ", label: "near-close back" },
  { symbol: "ˈ", label: "tekanan utama" },
  { symbol: "ː", label: "vokal panjang" }
];
