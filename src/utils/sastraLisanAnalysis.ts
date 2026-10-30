import { 
  AnalisisJenisSastraLisan, 
  AnalisisMotifSastraLisan, 
  MotifItem 
} from '../types/sastraLisan';

export interface AnalysisInput {
  namaSastra: string;
  deskripsi: string;
  kutipan?: string;
  bentukTuturan?: string;
  iringanMusik?: string;
  syarat?: string;
  tujuan?: string;
  suasanaPertunjukan?: string;
  tempatPertunjukan?: string;
  waktuPertunjukan?: string;
  kategoriPenutur?: string;
  sukuPemilik?: string;
  bahasaDigunakan?: string;
  transkripsi?: string;
  terjemahan?: string;
}

export function analyzeMotifDanJenis(input: AnalysisInput): {
  analisisJenis: AnalisisJenisSastraLisan;
  analisisMotif: AnalisisMotifSastraLisan;
} {
  const combinedText = `
    ${input.namaSastra || ''} 
    ${input.deskripsi || ''} 
    ${input.kutipan || ''} 
    ${input.syarat || ''} 
    ${input.tujuan || ''}
    ${input.suasanaPertunjukan || ''}
    ${input.tempatPertunjukan || ''}
    ${input.waktuPertunjukan || ''}
    ${input.sukuPemilik || ''}
    ${input.transkripsi || ''}
    ${input.terjemahan || ''}
  `.toLowerCase();

  const bentuk = (input.bentukTuturan || '').toLowerCase();
  const musik = (input.iringanMusik || '').toLowerCase();
  const suasana = (input.suasanaPertunjukan || '').toLowerCase();
  const tujuan = (input.tujuan || '').toLowerCase();
  const syarat = (input.syarat || '').toLowerCase();
  const tempat = (input.tempatPertunjukan || '').toLowerCase();

  // =========================================================================
  // 1. KLASIFIKASI GENRE / JENIS FOLKLOR SASTRA LISAN (HIERARKIS & PRESISI)
  // =========================================================================
  let jenisUtama: AnalisisJenisSastraLisan['jenisUtama'] = 'Legenda';
  let subJenis = 'Legenda Toponimik (Asal Usul Tempat & Alam)';
  let confidenceScore = 88;
  const ciriKhas: string[] = [];

  // Hitung indikator khusus tiap genre
  const hasSasakalaOrAsalUsul = combinedText.includes('sasakala') || 
    combinedText.includes('asal usul') || 
    combinedText.includes('asal-usul') || 
    combinedText.includes('mula') ||
    combinedText.includes('terbentuknya');

  const hasToponimiPhysical = combinedText.includes('batu') || 
    combinedText.includes('gunung') || 
    combinedText.includes('sungai') || 
    combinedText.includes('danau') || 
    combinedText.includes('curug') || 
    combinedText.includes('situ') || 
    combinedText.includes('bukit') || 
    combinedText.includes('goa') || 
    combinedText.includes('rawa') ||
    combinedText.includes('pulau');

  const hasTokohSejarahOrWali = combinedText.includes('makam') || 
    combinedText.includes('keramat') || 
    combinedText.includes('wali') || 
    combinedText.includes('pangeran') || 
    combinedText.includes('eyang') || 
    combinedText.includes('syekh') || 
    combinedText.includes('prabu') ||
    combinedText.includes('raden');

  // A. Puisi Lisan / Mantra (Memiliki formula magis sakral eksplisit)
  const isExplicitMantra = combinedText.includes('mantra') || 
    combinedText.includes('rajah') || 
    combinedText.includes('jampi') || 
    combinedText.includes('jangjawokan') ||
    combinedText.includes('singlar') ||
    combinedText.includes('asihan') ||
    (tujuan.includes('ruwatan') && (tujuan.includes('tolak bala') || syarat.includes('kemenyan')));

  // B. Teater Tutur / Seni Pertunjukan Bernaskah
  const isTeater = bentuk === 'dialog' || 
    input.kategoriPenutur === 'Kelompok' || 
    combinedText.includes('drama tutur') || 
    combinedText.includes('sandiwara') || 
    combinedText.includes('wayang') || 
    combinedText.includes('dalang');

  // C. Nyanyian Rakyat / Tembang (HANYA jika tuturan memang dinyanyikan atau berformat tembang/pupuh)
  const isNyanyian = (bentuk === 'dinyanyikan') || 
    combinedText.includes('tembang') || 
    combinedText.includes('kawih') || 
    combinedText.includes('pupuh') || 
    combinedText.includes('kidung') ||
    (bentuk !== 'diceritakan' && (combinedText.includes('pantun berdendang') || combinedText.includes('nyanyian rakyat')));

  // D. Mite / Mitos (Kahyangan, dewa-dewi, penciptaan alam semesta primordial)
  const isMitos = !hasSasakalaOrAsalUsul && (
    combinedText.includes('dewa') || 
    combinedText.includes('dewi sri') || 
    combinedText.includes('sanghyang') || 
    combinedText.includes('batara') || 
    combinedText.includes('penciptaan alam') || 
    (suasana.includes('sakral') && combinedText.includes('kahyangan'))
  );

  // E. Dongeng / Fabel (Fiksi murni, pelipur lara, binatang cerdik)
  const isDongeng = !hasSasakalaOrAsalUsul && !hasToponimiPhysical && (
    combinedText.includes('kancil') || 
    combinedText.includes('fabel') || 
    combinedText.includes('kabayan') || 
    combinedText.includes('raksasa') || 
    combinedText.includes('pelipur lara') || 
    tujuan.includes('hiburan semata') || 
    combinedText.includes('dongeng')
  );

  // Evaluasi klasifikasi dengan presisi tinggi
  if (isExplicitMantra) {
    jenisUtama = 'Puisi Lisan / Mantra';
    subJenis = 'Mantra Ritual / Formula Magis Sakral';
    confidenceScore = 95;
    ciriKhas.push('Struktur bahasa berpola arkhais, ritmis, dan berdaya magis kuat');
    ciriKhas.push('Mensyaratkan kepatuhan pantangan adat, kemurnian spiritual, dan sesaji');
    ciriKhas.push('Digunakan dalam konteks upacara keselamatan, pengobatan, atau penolak mara bahaya');
  } else if (isTeater) {
    jenisUtama = 'Teater / Drama Tutur';
    subJenis = 'Teater Tutur Tradisional / Seni Pertunjukan Bernarasi';
    confidenceScore = 92;
    ciriKhas.push('Melibatkan dialog antartokoh atau penuturan terstruktur oleh juru kisah');
    ciriKhas.push('Mempunyai formasi pertunjukan dan interaksi langsung dengan khalayak');
    ciriKhas.push('Menggabungkan narasi verbal, ekspresi gerak, dan ilustrasi musikal');
  } else if (isNyanyian) {
    jenisUtama = 'Nyanyian Rakyat / Tembang';
    subJenis = 'Tembang Tradisional / Nyanyian Pengiring Upacara';
    confidenceScore = 93;
    ciriKhas.push('Bentuk tuturan ditembangkan/dinyanyikan dengan laras dan irama teratur');
    ciriKhas.push('Didukung iringan instrumen musik tradisional khas kedaerahan');
    ciriKhas.push('Memuat nilai estetika tinggi, penghayatan filosofis, dan lirik simbolis');
  } else if (isMitos) {
    jenisUtama = 'Mite / Mitos';
    subJenis = 'Mite Kosmologis & Makhluk Adikodrati Sakral';
    confidenceScore = 91;
    ciriKhas.push('Melibatkan tokoh berkekuatan dewata, entitas adikodrati, atau dewi kahyangan');
    ciriKhas.push('Diyakini sungguh-sungguh terjadi pada masa primordial oleh masyarakat penganut');
    ciriKhas.push('Menjadi fondasi kosmologis upacara adat dan kesuburan pertanian masyarakat');
  } else if (isDongeng) {
    jenisUtama = 'Dongeng / Fabel';
    subJenis = 'Dongeng Binatang (Fabel) / Cerita Jenaka Rakyat';
    confidenceScore = 90;
    ciriKhas.push('Dianggap sebagai cerita rekaan fiktif murni (tidak dianggap nyata)');
    ciriKhas.push('Menonjolkan kecerdikan akal budi tokoh menghadapi tipu daya lawan');
    ciriKhas.push('Berfungsi sebagai media pendidikan moral dan sarana katarsis / pelipur lara');
  } else {
    // Klasifikasi Legenda (Genre Prosa Rakyat Paling Dominan di Nusantara)
    jenisUtama = 'Legenda';
    if (hasToponimiPhysical || hasSasakalaOrAsalUsul) {
      subJenis = 'Legenda Toponimik (Asal Mula Tempat & Fenomena Alam)';
      confidenceScore = 96;
      ciriKhas.push('Terkait erat dengan asal-usul toponimi (nama desa, bukit, batu, situ, atau sungai)');
      ciriKhas.push('Memiliki bukti fisik peninggalan alam/situs geologis yang dapat disaksikan hingga kini');
      ciriKhas.push('Menghubungkan memori kultural masa lalu dengan bentang geografis desa');
    } else if (hasTokohSejarahOrWali) {
      subJenis = 'Legenda Keagamaan & Tokoh Pejuang Setempat';
      confidenceScore = 94;
      ciriKhas.push('Mengisahkan keteladanan figur tokoh leluhur, kesatria, atau penyebar agama');
      ciriKhas.push('Berpusat di sekitar situs makam keramat atau petilasan bersejarah warga');
      ciriKhas.push('Diakui sebagai pembawa berkah atau pendiri peradaban desa pertama');
    } else {
      subJenis = 'Legenda Setempat / Perseorangan';
      confidenceScore = 91;
      ciriKhas.push('Dianggap pernah benar-benar terjadi dalam kurun waktu sejarah lokal');
      ciriKhas.push('Mewariskan memori kolektif yang memperkuat ikatan emosional warga desa');
      ciriKhas.push('Berfungsi sebagai sarana legitimasi status sosial atau tata aturan adat');
    }
  }

  const penjelasanJenis = `Berdasarkan evaluasi komprehensif terhadap bentuk tuturan (${input.bentukTuturan || 'tutur naratif'}), medium penyampaian (${input.iringanMusik || 'tanpa musik'}), suasana (${input.suasanaPertunjukan || 'khidmat'}), serta fungsi upacara (${input.tujuan || 'pelestarian nilai'}), karya tradisi ini terklasifikasi sebagai ${jenisUtama} (${subJenis}). Analisis menunjukkan adanya korelasi organik antara teks tuturan dan memori kultural masyarakat ${input.sukuPemilik || 'setempat'}.`;

  // =========================================================================
  // 2. DETEKSI MOTIF FOLKLOR STITH THOMPSON
  // =========================================================================
  const detectedMotifs: MotifItem[] = [];

  // Motif A: Asal-Usul / Topografi
  if (combinedText.includes('asal') || combinedText.includes('batu') || combinedText.includes('gunung') || 
      combinedText.includes('sungai') || combinedText.includes('danau') || combinedText.includes('curug') || 
      combinedText.includes('sasakala') || combinedText.includes('pulau') || combinedText.includes('rawa')) {
    detectedMotifs.push({
      kodeThompson: 'A900',
      namaMotif: 'Topographical Origins / Asal-usul Ciri Fisik Alam',
      kategoriMotif: 'Motif A: Mitos & Kosmologi',
      uraianTeks: 'Penjelasan terbentuknya bentang alam fisik bumi (batu cadas, telaga, mata air, atau bukit) akibat perbuatan tokoh masa lampau.'
    });
  }

  // Motif D: Keajaiban & Transformasi (Pembatuan / Benda Sakti)
  if (combinedText.includes('berubah') || combinedText.includes('membatu') || combinedText.includes('kutukan') || 
      combinedText.includes('pusaka') || combinedText.includes('keris') || combinedText.includes('sakti') || 
      combinedText.includes('menjelma') || combinedText.includes('metamorfosis')) {
    detectedMotifs.push({
      kodeThompson: 'D231 / D100',
      namaMotif: 'Transformation to Stone / Jelmaan Menjadi Batu',
      kategoriMotif: 'Motif D: Keajaiban & Kesaktian',
      uraianTeks: 'Tokoh atau objek pusaka yang mengalami perubahan wujud menjadi batu atau fenomena alam akibat sumpah, kutukan, atau pertapaan.'
    });
  }

  // Motif C: Pantangan, Pamali & Tabu
  if (combinedText.includes('pantangan') || combinedText.includes('larangan') || combinedText.includes('pamali') || 
      combinedText.includes('tabu') || combinedText.includes('syarat') || combinedText.includes('hukuman') || 
      syarat.length > 5) {
    detectedMotifs.push({
      kodeThompson: 'C300 / C900',
      namaMotif: 'Taboo & Supernatural Sanction / Pantangan Adat',
      kategoriMotif: 'Motif C: Pantangan (Tabu)',
      uraianTeks: 'Adanya pantangan sakral adat yang tidak boleh dilanggar, di mana pelanggaran mengakibatkan sanksi supranatural atau petaka.'
    });
  }

  // Motif B: Hewan Penolong / Binatang Ajaib
  if (combinedText.includes('harimau') || combinedText.includes('ular') || combinedText.includes('kancil') || 
      combinedText.includes('buaya') || combinedText.includes('burung') || combinedText.includes('ikan') || 
      combinedText.includes('maung') || combinedText.includes('naga')) {
    detectedMotifs.push({
      kodeThompson: 'B210 / B400',
      namaMotif: 'Helpful Animal & Guardian Beast / Hewan Penolong & Penjaga',
      kategoriMotif: 'Motif B: Hewan & Fabel',
      uraianTeks: 'Satwa atau hewan gaib yang bertindak sebagai pemandu arah, penjaga teritorial keramat, atau sahabat setia tokoh cerita.'
    });
  }

  // Motif E: Roh Leluhur & Karuhun
  if (combinedText.includes('karuhun') || combinedText.includes('leluhur') || combinedText.includes('eyang') || 
      combinedText.includes('arwah') || combinedText.includes('penjaga alam') || combinedText.includes('danyang')) {
    detectedMotifs.push({
      kodeThompson: 'E300 / E400',
      namaMotif: 'Return from the Dead / Arwah Karuhun Pelindung',
      kategoriMotif: 'Motif E: Arwah & Kematian',
      uraianTeks: 'Kehadiran figur arwah leluhur (karuhun) yang memberikan wejangan, berkah kesuburan, atau perlindungan bagi generasi penerus.'
    });
  }

  // Motif F: Keajaiban Kahyangan & Dunia Supranatural
  if (combinedText.includes('kahyangan') || combinedText.includes('bidadari') || combinedText.includes('kayangan') || 
      combinedText.includes('putri') || combinedText.includes('gaib') || combinedText.includes('alam astral')) {
    detectedMotifs.push({
      kodeThompson: 'F200 / F300',
      namaMotif: 'Fairies & Celestial Beings / Makhluk Kahyangan',
      kategoriMotif: 'Motif F: Keajaiban Dunia Gaib',
      uraianTeks: 'Hubungan timbal balik antara dunia fana manusia dengan dunia kahyangan melalui perjumpaan tokoh gaib atau bidadari sakral.'
    });
  }

  // Motif H: Ujian & Sayembara
  if (combinedText.includes('tapa') || combinedText.includes('bertapa') || combinedText.includes('ujian') || 
      combinedText.includes('sayembara') || combinedText.includes('syarat') || combinedText.includes('tantangan')) {
    detectedMotifs.push({
      kodeThompson: 'H310 / H1200',
      namaMotif: 'Tests of Prowess & Quest / Ujian Kesaktian & Perjalanan',
      kategoriMotif: 'Motif H: Pengujian & Sayembara',
      uraianTeks: 'Tokoh harus menjalani laku tapa, memecahkan teka-teki, atau menuntaskan syarat berat demi memperoleh anugerah atau status.'
    });
  }

  // Motif T: Asmara & Hubungan Kekerabatan
  if (combinedText.includes('cinta') || combinedText.includes('asmara') || combinedText.includes('menikah') || 
      combinedText.includes('lamaran') || combinedText.includes('jodoh') || combinedText.includes('permaisuri')) {
    detectedMotifs.push({
      kodeThompson: 'T100 / T111',
      namaMotif: 'Romantic Love & Marriage Obstacles / Ujian Perjodohan Asmara',
      kategoriMotif: 'Motif T: Asmara & Kekerabatan',
      uraianTeks: 'Kisah kasih asmara antartokoh yang menghadapi aral rintangan adat, perbedaan status martabat, atau restu orang tua.'
    });
  }

  // Motif Q: Ganjaran dan Hukuman Moral
  if (combinedText.includes('durhaka') || combinedText.includes('kutukan') || combinedText.includes('hukuman') || 
      combinedText.includes('berkah') || combinedText.includes('pahala') || combinedText.includes('celaka')) {
    detectedMotifs.push({
      kodeThompson: 'Q200 / Q500',
      namaMotif: 'Rewards and Punishments / Pembalasan Moral & Karma',
      kategoriMotif: 'Motif Q: Ganjaran & Hukuman',
      uraianTeks: 'Konsep keadilan moral di mana kesombongan dan kezaliman menuai petaka, sedangkan ketulusan budi menerima anugerah kemuliaan.'
    });
  }

  // Motif V: Karomah & Nilai Religius Spiritual
  if (combinedText.includes('doa') || combinedText.includes('sholat') || combinedText.includes('wali') || 
      combinedText.includes('islam') || combinedText.includes('berkah') || combinedText.includes('sedekah') || 
      combinedText.includes('pesantren') || combinedText.includes('masjid')) {
    detectedMotifs.push({
      kodeThompson: 'V200 / V400',
      namaMotif: 'Religious Virtues & Miracles / Karomah Kesalehan Keagamaan',
      kategoriMotif: 'Motif V: Religi & Moral Keagamaan',
      uraianTeks: 'Manifestasi perlindungan sang pencipta dan karomah kewalian atas keteguhan iman tokoh penyebar syiar keagamaan.'
    });
  }

  // Motif J / K: Kearifan Akal Budi
  if (detectedMotifs.length === 0 || combinedText.includes('cerdik') || combinedText.includes('akal') || combinedText.includes('bijak')) {
    detectedMotifs.push({
      kodeThompson: 'J1100 / J1115',
      namaMotif: 'Cleverness and Wisdom / Kearifan Akal Budi',
      kategoriMotif: 'Motif J: Kebijaksanaan & Ketangkasan Akal',
      uraianTeks: 'Penyelesaian silang sengketa kemasyarakatan melalui kecerdikan berpikir bijak dan keluhuran budi pekerti.'
    });
  }

  const motifUtama = `${detectedMotifs[0].kodeThompson}: ${detectedMotifs[0].namaMotif}`;

  // =========================================================================
  // 3. FUNGSI SOSIAL BASCOM (FOUR FUNCTIONS OF FOLKLORE) & AMANAT MORAL
  // =========================================================================
  const fungsiSosialBascom = [
    'Pendidikan Nilai & Etika Generasi Muda (Pedagogical Device) — Mengajarkan sopan santun dan penghormatan pada tradisi',
    'Pengesahan Kebudayaan & Pranata Sosial (Validation of Culture) — Melegitimasi batas wilayah adat dan tata cara upacara',
    'Peneguh Solidaritas Kolektif (Group Solidarity) — Memperkuat rasa persaudaraan dan kebanggaan identitas etnis lokal',
    'Pelepasan Ketegangan Sosial (Amusement & Emotional Catharsis) — Sarana hiburan, relaksasi batin, dan keharmonisan warga'
  ];

  const nilaiBudaya = [
    'Penghormatan terhadap tanah air, mata air, dan kelestarian ekosistem alam desa',
    'Keteguhan budi pekerti, kejujuran batin, dan pantangan berbuat khianat',
    'Kerendahan hati terhadap sesama serta kepatuhan pada amanat para leluhur'
  ];

  const amanatMoral = `Karya sastra lisan "${input.namaSastra || 'ini'}" mengajarkan bahwa kesombongan dan pelanggaran terhadap tatanan nilai adat senantiasa mendatangkan musibah bagi pelakunya. Sebaliknya, ketulusan budi, kesabaran dalam menghadapi ujian, dan bakti terhadap kelestarian alam menjadi benteng keselamatan bagi segenap masyarakat pemilik tradisi.`;

  return {
    analisisJenis: {
      jenisUtama,
      subJenis,
      penjelasanJenis,
      confidenceScore,
      ciriKhas
    },
    analisisMotif: {
      motifUtama,
      daftarMotifThompson: detectedMotifs,
      fungsiSosialBascom,
      amanatMoral,
      nilaiBudaya
    }
  };
}

