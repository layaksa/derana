import { 
  AnalisisJenisSastraLisan, 
  AnalisisMotifSastraLisan, 
  MotifItem 
} from '../types/sastraLisan';

interface AnalysisInput {
  namaSastra: string;
  deskripsi: string;
  kutipan?: string;
  bentukTuturan?: string;
  iringanMusik?: string;
  syarat?: string;
  tujuan?: string;
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
  `.toLowerCase();

  const bentuk = (input.bentukTuturan || '').toLowerCase();
  const musik = (input.iringanMusik || '').toLowerCase();

  // 1. KLASIFIKASI JENIS / GENRE SASTRA LISAN
  let jenisUtama: AnalisisJenisSastraLisan['jenisUtama'] = 'Legenda';
  let subJenis = 'Legenda Toponimik (Asal Usul Nama Tempat / Wilayah)';
  let confidenceScore = 88;
  const ciriKhas: string[] = [];

  // Check Nyanyian Rakyat / Tembang
  if (bentuk === 'dinyanyikan' || musik.includes('suling') || musik.includes('kecapi') || musik.includes('gamelan') || combinedText.includes('tembang') || combinedText.includes('kawih') || combinedText.includes('pupuh')) {
    jenisUtama = 'Nyanyian Rakyat / Tembang';
    subJenis = 'Tembang Tradisional / Nyanyian Pengiring Upacara';
    confidenceScore = 92;
    ciriKhas.push('Bentuk tuturan ditembangkan/dinyanyikan dengan irama teratur');
    ciriKhas.push('Didukung iringan instrumen musik tradisional');
    ciriKhas.push('Mengandung pesan moral atau syair puji-pujian leluhur');
  } 
  // Check Puisi Lisan / Mantra
  else if (combinedText.includes('mantra') || combinedText.includes('rajah') || combinedText.includes('jampi') || combinedText.includes('tolak bala') || combinedText.includes('pantun') || combinedText.includes('sisindiran') || (input.syarat && input.syarat.includes('sesaji'))) {
    jenisUtama = 'Puisi Lisan / Mantra';
    subJenis = 'Mantra Ritual / Formula Magis Tradisional';
    confidenceScore = 94;
    ciriKhas.push('Bahasa berpola arkhais dan berirama magis');
    ciriKhas.push('Digunakan dalam konteks upacara keselamatan atau pengobatan');
    ciriKhas.push('Mensyaratkan kepatuhan adat dan kemurnian spiritual');
  } 
  // Check Teater / Drama Tutur
  else if (bentuk === 'dialog' || combinedText.includes('lakon') || combinedText.includes('tokoh penokohan') || combinedText.includes('wayang') || combinedText.includes('drama') || combinedText.includes('pertunjukan panggung')) {
    jenisUtama = 'Teater / Drama Tutur';
    subJenis = 'Teater Tutur Tradisional / Pertunjukan Bernarasi';
    confidenceScore = 90;
    ciriKhas.push('Menggunakan dialog antartokoh atau dalang');
    ciriKhas.push('Memiliki formasi panggung dan interaksi dengan penonton');
  } 
  // Check Mite / Mitos
  else if (combinedText.includes('dewa') || combinedText.includes('dewi') || combinedText.includes('kahyangan') || combinedText.includes('batara') || combinedText.includes('sanghyang') || combinedText.includes('penciptaan') || combinedText.includes('dunia gaib') || combinedText.includes('sakral')) {
    jenisUtama = 'Mite / Mitos';
    subJenis = 'Mite Kosmologis & Makhluk Gaib Sakral';
    confidenceScore = 91;
    ciriKhas.push('Melibatkan tokoh berkekuatan adikodrati atau dewa-dewi');
    ciriKhas.push('Dipercaya sebagai peristiwa sakral di masa azali');
    ciriKhas.push('Menjadi dasar keyakinan dan upacara adat masyarakat');
  } 
  // Check Dongeng / Fabel
  else if (combinedText.includes('kancil') || combinedText.includes('fabel') || combinedText.includes('binatang') || combinedText.includes('kabayan') || combinedText.includes('raksasa') || combinedText.includes('dongeng') || combinedText.includes('pelipur lara')) {
    jenisUtama = 'Dongeng / Fabel';
    subJenis = 'Dongeng Binatang (Fabel) / Cerita Jenaka';
    confidenceScore = 89;
    ciriKhas.push('Bersifat fiktif murni dan berfungsi sebagai pelipur lara');
    ciriKhas.push('Tokoh hewan yang dapat berbicara dan berperilaku manusia');
    ciriKhas.push('Sarat dengan sindiran sosial dan kecerdikan akal budi');
  } 
  // Default Legenda (Legenda Toponimik / Tokoh Sejarah)
  else {
    jenisUtama = 'Legenda';
    if (combinedText.includes('batu') || combinedText.includes('danau') || combinedText.includes('gunung') || combinedText.includes('sungai') || combinedText.includes('curug') || combinedText.includes('sasakala') || combinedText.includes('asal usul')) {
      subJenis = 'Legenda Toponimik (Asal Mula Tempat & Fenomena Alam)';
    } else if (combinedText.includes('makam') || combinedText.includes('keramat') || combinedText.includes('wali') || combinedText.includes('pangeran') || combinedText.includes('santang') || combinedText.includes('eyang')) {
      subJenis = 'Legenda Keagamaan & Tokoh Pejuang Setempat';
    } else {
      subJenis = 'Legenda Setempat / Perseorangan';
    }
    confidenceScore = 93;
    ciriKhas.push('Dianggap pernah benar-benar terjadi dalam kurun waktu sejarah');
    ciriKhas.push('Terkait erat dengan nama tempat, peninggalan fisik, atau makam keramat');
    ciriKhas.push('Mewariskan nilai identitas kolektif masyarakat desa');
  }

  const penjelasanJenis = `Berdasarkan analisis struktur narasi, bentuk tuturan (${input.bentukTuturan || 'tutur'}), dan konteks pertunjukan, karya sastra lisan ini terklasifikasi sebagai ${jenisUtama} (${subJenis}). Karakteristik utamanya menunjukkan hubungan organis antara teks naratif dengan memori kolektif masyarakat pemilik tradisi.`;

  // 2. DETEKSI MOTIF STITH THOMPSON
  const detectedMotifs: MotifItem[] = [];

  // Motif A: Asal-Usul / Topografi
  if (combinedText.includes('asal') || combinedText.includes('batu') || combinedText.includes('gunung') || combinedText.includes('sungai') || combinedText.includes('danau') || combinedText.includes('telaga') || combinedText.includes('curug') || combinedText.includes('sasakala')) {
    detectedMotifs.push({
      kodeThompson: 'A900',
      namaMotif: 'Topographical Origins / Asal-usul Ciri Fisik Bumi',
      kategoriMotif: 'Motif A: Mitos & Kosmologi',
      uraianTeks: 'Penjelasan asal-usul terbentuknya bukit, batu karang, sumber mata air, atau nama desa melalui peristiwa tragis/berkah leluhur.'
    });
  }

  // Motif D: Keajaiban & Transformasi
  if (combinedText.includes('berubah') || combinedText.includes('batu') || combinedText.includes('kutukan') || combinedText.includes('pusaka') || combinedText.includes('keris') || combinedText.includes('sakti') || combinedText.includes('keajaiban') || combinedText.includes('ghaib')) {
    detectedMotifs.push({
      kodeThompson: 'D100 / D231',
      namaMotif: 'Magic Transformation to Stone / Menjadi Batu',
      kategoriMotif: 'Motif D: Keajaiban & Kesaktian',
      uraianTeks: 'Tokoh atau benda yang mengalami metamorfosis ajaib atau pembatuan akibat kutukan, sumpah, atau puncak tapa brata.'
    });
  }

  // Motif C: Pantangan & Tabu
  if (combinedText.includes('pantangan') || combinedText.includes('larangan') || combinedText.includes('pamali') || combinedText.includes('tabu') || combinedText.includes('syarat') || combinedText.includes('hukuman')) {
    detectedMotifs.push({
      kodeThompson: 'C300 / C900',
      namaMotif: 'Taboo & Supernatural Sanction / Pantangan Adat',
      kategoriMotif: 'Motif C: Pantangan (Tabu)',
      uraianTeks: 'Adanya pantangan sakral yang tidak boleh dilanggar (misal larangan berucap takabur, mengambil ikan keramat, atau melewati batas waktu tertentu).'
    });
  }

  // Motif B: Binatang Penolong / Hewan Ajaib
  if (combinedText.includes('harimau') || combinedText.includes('ular') || combinedText.includes('kancil') || combinedText.includes('buaya') || combinedText.includes('burung') || combinedText.includes('ikan') || combinedText.includes('hewan')) {
    detectedMotifs.push({
      kodeThompson: 'B210 / B400',
      namaMotif: 'Helpful Animal & Speaking Beast / Hewan Penolong',
      kategoriMotif: 'Motif B: Hewan & Fabel',
      uraianTeks: 'Hewan yang bertindak sebagai penjaga batas wilayah, pembawa petunjuk gaib, atau sahabat setia tokoh cerita.'
    });
  }

  // Motif E: Roh Leluhur & Karuhun
  if (combinedText.includes('karuhun') || combinedText.includes('leluhur') || combinedText.includes('eyang') || combinedText.includes('roh') || combinedText.includes('arwah') || combinedText.includes('penjaga')) {
    detectedMotifs.push({
      kodeThompson: 'E300 / E400',
      namaMotif: 'Friendly Return from the Dead / Roh Pelindung Desa',
      kategoriMotif: 'Motif E: Arwah & Kematian',
      uraianTeks: 'Kehadiran figur leluhur (karuhun/danyang) yang senantiasa menjaga ketentraman dan kesuburan wilayah desa.'
    });
  }

  // Motif T: Cinta & Kekerabatan
  if (combinedText.includes('putri') || combinedText.includes('pangeran') || combinedText.includes('cinta') || combinedText.includes('asmara') || combinedText.includes('menikah') || combinedText.includes('lamaran') || combinedText.includes('jodoh')) {
    detectedMotifs.push({
      kodeThompson: 'T100 / T300',
      namaMotif: 'Romantic Love & Difficult Suitors / Ujian Perjodohan',
      kategoriMotif: 'Motif T: Asmara & Kekerabatan',
      uraianTeks: 'Kisah kasih asmara antara tokoh bangsawan atau manusia dengan makhluk kahyangan yang sarat dengan ujian ketulusan hati.'
    });
  }

  // Motif V: Karomah & Nilai Religius
  if (combinedText.includes('doa') || combinedText.includes('sholat') || combinedText.includes('wali') || combinedText.includes('islam') || combinedText.includes('berkah') || combinedText.includes('sedekah')) {
    detectedMotifs.push({
      kodeThompson: 'V200 / V400',
      namaMotif: 'Religious Virtues & Miracles / Karomah Kesalehan',
      kategoriMotif: 'Motif V: Religi & Moral Keagamaan',
      uraianTeks: 'Manifestasi perlindungan ilahi atas keteguhan iman dan amal kebajikan tokoh pejuang agama.'
    });
  }

  // Fallback if no specific motifs matched
  if (detectedMotifs.length === 0) {
    detectedMotifs.push({
      kodeThompson: 'J1100',
      namaMotif: 'Cleverness and Wisdom / Kearifan Akal Budi',
      kategoriMotif: 'Motif J: Kebijaksanaan & Ketangkasan Akal',
      uraianTeks: 'Resolusi konflik yang dicapai melalui kepiawaian berpikir arif dan keselarasan budi pekerti luhur.'
    });
  }

  const motifUtama = `${detectedMotifs[0].kodeThompson}: ${detectedMotifs[0].namaMotif}`;

  // 3. FUNGSI SOSIAL DAN AMANAT MORAL (BASCOM'S FOUR FUNCTIONS)
  const fungsiSosialBascom = [
    'Pendidikan Nilai & Etika Generasi Muda (Pedagogical Device)',
    'Pengesahan Pranata Sosial & Batas Wilayah Adat (Validation of Culture)',
    'Peneguh Solidaritas & Identitas Kolektif Etnis (Group Solidarity)',
    'Media Pelipur Lara & Perekat Harmoni Warga (Entertainment & Catharsis)'
  ];

  const nilaiBudaya = [
    'Penghormatan terhadap tanah air dan keseimbangan alam sekitar',
    'Keteguhan budi pekerti dan pantangan berbuat khianat',
    'Kesetiaan terhadap janji dan keutamaan kerendahan hati'
  ];

  const amanatMoral = `Cerita ini mengajarkan bahwa kesombongan dan pelanggaran terhadap pantangan tradisi akan berujung pada malapetaka, sedangkan ketulusan bakti kepada tanah leluhur membawa kemakmuran dan perlindungan bagi keturunan berikutnya.`;

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
