export interface GlottologLanguage {
  glottocode: string;
  name: string;
  isocodes: string;
  level: 'language' | 'dialect';
  macroarea: string;
  latitude: number;
  longitude: number;
  family?: string;
  speakersEstimated?: string;
  regionDescription?: string;
  boundary?: [number, number][]; // Polygon lat-lng coordinates for territory boundary
}

// Language Family Color Palette for Map Layers
export const FAMILY_COLORS: Record<string, string> = {
  'Austronesian (Malayo-Polynesian)': '#2563eb', // Blue
  'Papuan / Trans-New Guinea': '#7c3aed', // Purple
  'Austroasiatic': '#059669', // Emerald
  'Sino-Tibetan': '#d97706', // Amber
  'Indo-European': '#dc2626', // Red
  'Afroasiatic': '#ea580c', // Orange
  'Niger-Congo': '#0284c7', // Sky
  'Australian': '#b45309', // Brown
  'Amerindian': '#0891b2', // Cyan
  'Dravidian': '#4f46e5', // Indigo
  'Lainnya / Isolat': '#64748b' // Slate
};

// Polygons for Language Territories in Indonesia & Neighboring Regions
export const LANGUAGE_TERRITORIES: {
  id: string;
  glottocode: string;
  name: string;
  family: string;
  color: string;
  center: [number, number];
  polygon: [number, number][];
  description: string;
}[] = [
  {
    id: 'sundanese-territory',
    glottocode: 'sund1252',
    name: 'Bahasa Sunda (Wilayah Tutur Jawa Barat & Banten)',
    family: 'Austronesian (Malayo-Polynesian)',
    color: '#3b82f6',
    center: [-6.89708, 107.106],
    polygon: [
      [-5.92, 105.95],
      [-5.88, 106.35],
      [-6.02, 106.85],
      [-6.18, 107.15],
      [-6.25, 107.65],
      [-6.42, 108.30],
      [-6.85, 108.75],
      [-7.15, 108.60],
      [-7.45, 108.70],
      [-7.72, 108.50],
      [-7.70, 107.80],
      [-7.50, 107.10],
      [-7.10, 106.40],
      [-6.85, 105.80],
      [-6.50, 105.60],
      [-6.10, 105.75],
      [-5.92, 105.95]
    ],
    description: 'Wilayah penggunaan bahasa Sunda mencakup provinsi Jawa Barat, sebagian besar Banten (kecuali pesisir utara Serang/Cilegon), serta wilayah perbatasan barat Jawa Tengah (Brebes & Cilacap).'
  },
  {
    id: 'javanese-territory',
    glottocode: 'java1254',
    name: 'Bahasa Jawa (Wilayah Tutur Jawa Tengah, DIY, & Jawa Timur)',
    family: 'Austronesian (Malayo-Polynesian)',
    color: '#059669',
    center: [-7.5, 110.5],
    polygon: [
      [-6.75, 108.80],
      [-6.80, 109.80],
      [-6.50, 110.70],
      [-6.65, 111.60],
      [-6.85, 112.50],
      [-7.15, 112.90],
      [-7.50, 113.80],
      [-8.15, 114.30],
      [-8.60, 114.20],
      [-8.45, 113.10],
      [-8.35, 112.00],
      [-8.15, 110.70],
      [-7.95, 109.90],
      [-7.75, 108.95],
      [-7.20, 108.80],
      [-6.75, 108.80]
    ],
    description: 'Wilayah penutur bahasa Jawa inti meliputi Jawa Tengah, D.I. Yogyakarta, dan sebagian besar Jawa Timur, dengan berbagai dialek seperti Banyumasan, Kedu, Mataraman, Arekan (Surabayan), dan Osing di Banyuwangi.'
  },
  {
    id: 'madurese-territory',
    glottocode: 'nucl1460',
    name: 'Bahasa Madura (Pulau Madura & Tapal Kuda Jawa Timur)',
    family: 'Austronesian (Malayo-Polynesian)',
    color: '#d97706',
    center: [-7.0, 113.5],
    polygon: [
      [-6.85, 112.65],
      [-6.82, 113.50],
      [-6.88, 114.05],
      [-7.05, 114.35],
      [-7.18, 113.80],
      [-7.15, 112.80],
      [-7.50, 113.20],
      [-7.85, 113.90],
      [-8.05, 114.15],
      [-7.95, 113.40],
      [-7.50, 112.80],
      [-6.85, 112.65]
    ],
    description: 'Bahasa Madura dituturkan di Pulau Madura (Bangkalan, Sampang, Pamekasan, Sumenep) serta wilayah "Tapal Kuda" Jawa Timur (Probolinggo, Pasuruan, Jember, Situbondo, Bondowoso).'
  },
  {
    id: 'balinese-territory',
    glottocode: 'bali1278',
    name: 'Bahasa Bali (Pulau Bali & Lombok Barat)',
    family: 'Austronesian (Malayo-Polynesian)',
    color: '#8b5cf6',
    center: [-8.35714, 115.075],
    polygon: [
      [-8.08, 114.45],
      [-8.10, 115.15],
      [-8.25, 115.68],
      [-8.55, 115.70],
      [-8.85, 115.20],
      [-8.75, 114.70],
      [-8.35, 114.42],
      [-8.08, 114.45]
    ],
    description: 'Wilayah penutur bahasa Bali meliputi seluruh kabupaten/kota di Provinsi Bali serta kantong penutur di Lombok Barat dan transmigran di Sulawesi & Lampung.'
  },
  {
    id: 'sasak-territory',
    glottocode: 'sasa1249',
    name: 'Bahasa Sasak (Pulau Lombok)',
    family: 'Austronesian (Malayo-Polynesian)',
    color: '#ec4899',
    center: [-8.58349, 116.284],
    polygon: [
      [-8.20, 116.05],
      [-8.25, 116.55],
      [-8.50, 116.70],
      [-8.85, 116.60],
      [-8.92, 116.25],
      [-8.75, 115.90],
      [-8.45, 115.95],
      [-8.20, 116.05]
    ],
    description: 'Bahasa Sasak merupakan bahasa mayoritas masyarakat Pulau Lombok di Nusa Tenggara Barat dengan 5 ragam dialek fonologis.'
  },
  {
    id: 'minangkabau-territory',
    glottocode: 'mina1268',
    name: 'Bahasa Minangkabau (Sumatera Barat & Riau Barat)',
    family: 'Austronesian (Malayo-Polynesian)',
    color: '#f59e0b',
    center: [-0.896, 100.44],
    polygon: [
      [0.45, 98.80],
      [0.65, 100.20],
      [0.20, 101.40],
      [-0.80, 101.80],
      [-1.85, 101.50],
      [-2.40, 101.10],
      [-2.05, 100.40],
      [-1.25, 99.80],
      [-0.30, 99.20],
      [0.45, 98.80]
    ],
    description: 'Wilayah penggunaan bahasa Minangkabau berpusat di Sumatera Barat, meluas ke Kampar (Riau), Mukomuko (Bengkulu), dan pesisir barat Aceh (Aneuk Jamee).'
  },
  {
    id: 'acehnese-territory',
    glottocode: 'achi1257',
    name: 'Bahasa Aceh (Pesisir Nanggroe Aceh Darussalam)',
    family: 'Austronesian (Malayo-Polynesian)',
    color: '#10b981',
    center: [4.5, 96.5],
    polygon: [
      [5.85, 95.20],
      [5.60, 95.90],
      [5.25, 97.20],
      [4.65, 97.90],
      [4.25, 98.10],
      [3.80, 97.60],
      [3.45, 97.10],
      [3.90, 96.20],
      [4.75, 95.40],
      [5.50, 95.10],
      [5.85, 95.20]
    ],
    description: 'Bahasa Aceh dituturkan di sepanjang jalur pesisir timur, utara, dan sebagian barat Provinsi Aceh (Aceh Besar, Pidie, Bireuen, Aceh Utara, Aceh Timur, dll.).'
  },
  {
    id: 'batak-territory',
    glottocode: 'bata1289',
    name: 'Kelompok Bahasa Batak (Danau Toba & Tapanuli, Sumut)',
    family: 'Austronesian (Malayo-Polynesian)',
    color: '#06b6d4',
    center: [2.35498, 99.1761],
    polygon: [
      [3.30, 98.10],
      [3.00, 99.30],
      [2.60, 99.80],
      [1.60, 99.95],
      [1.10, 99.50],
      [1.50, 98.70],
      [2.10, 98.40],
      [2.80, 98.00],
      [3.30, 98.10]
    ],
    description: 'Meliputi penutur Batak Toba, Karo, Pakpak/Dairi, Simalungun, Angkola, dan Mandailing di sekitar Danau Toba, dataran tinggi Karo, dan Tapanuli.'
  },
  {
    id: 'buginese-territory',
    glottocode: 'bugi1244',
    name: 'Bahasa Bugis (Sulawesi Selatan Bagian Tengah & Timur)',
    family: 'Austronesian (Malayo-Polynesian)',
    color: '#84cc16',
    center: [-4.47, 119.977],
    polygon: [
      [-3.30, 119.70],
      [-3.50, 120.40],
      [-4.00, 120.60],
      [-4.75, 120.55],
      [-5.10, 120.35],
      [-4.90, 119.70],
      [-4.30, 119.55],
      [-3.80, 119.50],
      [-3.30, 119.70]
    ],
    description: 'Wilayah tutur bahasa Bugis berpusat di Bone, Soppeng, Wajo, Sidrap, Pinrang, Barru, Sinjai, dan sebagian Luwu di Sulawesi Selatan.'
  },
  {
    id: 'makasar-territory',
    glottocode: 'maka1311',
    name: 'Bahasa Makasar (Sulawesi Selatan Bagian Selatan)',
    family: 'Austronesian (Malayo-Polynesian)',
    color: '#eab308',
    center: [-5.4, 119.6],
    polygon: [
      [-4.95, 119.45],
      [-5.15, 119.90],
      [-5.45, 120.10],
      [-5.75, 119.95],
      [-5.60, 119.40],
      [-5.15, 119.35],
      [-4.95, 119.45]
    ],
    description: 'Wilayah penutur bahasa Makasar meliputi Makassar, Gowa, Takalar, Jeneponto, Bantaeng, dan sebagian Bulukumba serta kepulauan Pangkep.'
  },
  {
    id: 'banjar-territory',
    glottocode: 'banj1239',
    name: 'Bahasa Banjar (Kalimantan Selatan & Pesisir Kalteng/Kaltim)',
    family: 'Austronesian (Malayo-Polynesian)',
    color: '#14b8a6',
    center: [-2.8, 115.3],
    polygon: [
      [-1.75, 114.80],
      [-1.90, 115.80],
      [-2.65, 116.15],
      [-3.50, 116.30],
      [-4.10, 115.40],
      [-3.60, 114.50],
      [-2.80, 114.40],
      [-2.10, 114.70],
      [-1.75, 114.80]
    ],
    description: 'Bahasa Banjar (dialek Kuala dan Hulu) merupakan lingua franca perdagangan Kalimantan bagian selatan dan timur.'
  },
  {
    id: 'dayak-ngaju-territory',
    glottocode: 'ngaj1237',
    name: 'Bahasa Ngaju & Rumpun Barito (Kalimantan Tengah)',
    family: 'Austronesian (Malayo-Polynesian)',
    color: '#6366f1',
    center: [-1.58463, 112.794],
    polygon: [
      [-0.40, 111.80],
      [-0.60, 113.80],
      [-1.20, 114.40],
      [-2.50, 114.20],
      [-3.40, 113.50],
      [-3.20, 112.00],
      [-2.20, 111.50],
      [-1.20, 111.60],
      [-0.40, 111.80]
    ],
    description: 'Daerah aliran sungai Kapuas, Kahayan, Rungan, Katingan, dan Mentaya di Kalimantan Tengah; berkerabat dekat dengan bahasa Malagasi di Madagaskar.'
  },
  {
    id: 'papuan-dani-territory',
    glottocode: 'west2594',
    name: 'Rumpun Bahasa Lembah Baliem / Dani (Papua Pegunungan)',
    family: 'Papuan / Trans-New Guinea',
    color: '#a855f7',
    center: [-4.05, 138.95],
    polygon: [
      [-3.60, 138.30],
      [-3.70, 139.40],
      [-4.30, 139.50],
      [-4.60, 138.80],
      [-4.20, 138.20],
      [-3.60, 138.30]
    ],
    description: 'Wilayah pegunungan tengah Papua (Lembah Baliem, Wamena, Bokondini, Ilaga, Puncak Jaya).'
  },
  {
    id: 'asmat-territory',
    glottocode: 'cent2117',
    name: 'Rumpun Bahasa Asmat-Kamoro (Pesisir Selatan Papua)',
    family: 'Papuan / Trans-New Guinea',
    color: '#d946ef',
    center: [-5.80391, 138.471],
    polygon: [
      [-4.60, 136.20],
      [-4.90, 138.30],
      [-5.50, 139.20],
      [-6.20, 138.90],
      [-6.50, 138.10],
      [-5.50, 136.80],
      [-4.90, 135.90],
      [-4.60, 136.20]
    ],
    description: 'Wilayah pesisir rawa dan sungai pasang surut di pesisir selatan Papua Selatan dan Mimika.'
  },
  {
    id: 'biak-territory',
    glottocode: 'biak1248',
    name: 'Bahasa Biak-Numfor (Kepulauan Teluk Cenderawasih)',
    family: 'Austronesian (Malayo-Polynesian)',
    color: '#0ea5e9',
    center: [-0.9523, 135.879],
    polygon: [
      [-0.60, 135.40],
      [-0.65, 136.30],
      [-1.15, 136.40],
      [-1.25, 135.50],
      [-1.00, 134.80],
      [-0.60, 135.40]
    ],
    description: 'Kepulauan Biak, Numfor, dan pesisir utara Papua Barat hingga Raja Ampat; bahasa maritim Austronesia berpengaruh di Papua.'
  }
];

// Rich Glottolog Languages Dataset (Synthesized and Curated from User Glottolog File)
export const GLOTTOLOG_LANGUAGES: GlottologLanguage[] = [
  // --- INDONESIA & NUSANTARA (PAPUNESIA / MALAYO-POLYNESIAN) ---
  {
    glottocode: 'sund1252',
    name: 'Sundanese (Sunda)',
    isocodes: 'sun',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -6.89708,
    longitude: 107.106,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '42.000.000',
    regionDescription: 'Jawa Barat, Banten, Pesisir Brebes & Cilacap'
  },
  {
    glottocode: 'java1254',
    name: 'Javanese (Jawa)',
    isocodes: 'jav',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -7.001,
    longitude: 109.287,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '84.000.000',
    regionDescription: 'Jawa Tengah, D.I. Yogyakarta, Jawa Timur'
  },
  {
    glottocode: 'nucl1460',
    name: 'Madurese (Madura)',
    isocodes: 'mad',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -7.0,
    longitude: 113.0,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '13.000.000',
    regionDescription: 'Pulau Madura, Tapal Kuda Jawa Timur'
  },
  {
    glottocode: 'bali1278',
    name: 'Balinese (Bali)',
    isocodes: 'ban',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -8.35714,
    longitude: 115.075,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '3.300.000',
    regionDescription: 'Pulau Bali, Lombok Barat'
  },
  {
    glottocode: 'sasa1249',
    name: 'Sasak',
    isocodes: 'sas',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -8.58349,
    longitude: 116.284,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '2.700.000',
    regionDescription: 'Pulau Lombok (Nusa Tenggara Barat)'
  },
  {
    glottocode: 'mina1268',
    name: 'Minangkabau',
    isocodes: 'min',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -0.896,
    longitude: 100.44,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '5.500.000',
    regionDescription: 'Sumatera Barat, Riau Barat'
  },
  {
    glottocode: 'achi1257',
    name: 'Acehnese (Aceh)',
    isocodes: 'ace',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: 3.90757,
    longitude: 96.6032,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '3.500.000',
    regionDescription: 'Provinsi Aceh (Pesisir Timur & Barat)'
  },
  {
    glottocode: 'bata1289',
    name: 'Batak Toba',
    isocodes: 'bbc',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: 2.35498,
    longitude: 99.1761,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '2.000.000',
    regionDescription: 'Sumatera Utara, Toba Samosir, Tapanuli Utara'
  },
  {
    glottocode: 'bata1293',
    name: 'Batak Karo',
    isocodes: 'btx',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: 2.12787,
    longitude: 98.2517,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '600.000',
    regionDescription: 'Dataran Tinggi Karo, Langkat, Dairi'
  },
  {
    glottocode: 'bata1291',
    name: 'Batak Mandailing',
    isocodes: 'btm',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: 0.85805,
    longitude: 99.898,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '1.100.000',
    regionDescription: 'Mandailing Natal, Tapanuli Selatan'
  },
  {
    glottocode: 'bugi1244',
    name: 'Buginese (Bugis)',
    isocodes: 'bug',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -4.47,
    longitude: 119.977,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '5.000.000',
    regionDescription: 'Bone, Soppeng, Wajo, Sidrap (Sulsel)'
  },
  {
    glottocode: 'maka1311',
    name: 'Makasar',
    isocodes: 'mak',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -5.65551,
    longitude: 119.838,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '2.100.000',
    regionDescription: 'Makassar, Gowa, Takalar, Jeneponto'
  },
  {
    glottocode: 'banj1239',
    name: 'Banjar',
    isocodes: 'bjn',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: 0.747105,
    longitude: 115.79,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '3.600.000',
    regionDescription: 'Kalimantan Selatan & Pesisir Kalteng/Kaltim'
  },
  {
    glottocode: 'ngaj1237',
    name: 'Ngaju',
    isocodes: 'nij',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -1.58463,
    longitude: 112.794,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '890.000',
    regionDescription: 'Kalimantan Tengah (DAS Kahayan & Kapuas)'
  },
  {
    glottocode: 'gayo1244',
    name: 'Gayo',
    isocodes: 'gay',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: 4.3733,
    longitude: 97.3456,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '300.000',
    regionDescription: 'Aceh Tengah, Bener Meriah, Gayo Lues'
  },
  {
    glottocode: 'nias1242',
    name: 'Nias (Li Niha)',
    isocodes: 'nia',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: 0.90691,
    longitude: 97.4961,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '770.000',
    regionDescription: 'Kepulauan Nias, Sumatera Utara'
  },
  {
    glottocode: 'lamp1243',
    name: 'Lampung Api',
    isocodes: 'ljp',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -5.73463,
    longitude: 105.037,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '800.000',
    regionDescription: 'Pesisir Lampung, Way Kanan, Tanggamus'
  },
  {
    glottocode: 'lamp1242',
    name: 'Lampung Nyo',
    isocodes: 'abl',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -4.43957,
    longitude: 105.397,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '700.000',
    regionDescription: 'Pedalaman Lampung Abung & Tulang Bawang'
  },
  {
    glottocode: 'reja1240',
    name: 'Rejang',
    isocodes: 'rej',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -3.33056,
    longitude: 102.434,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '350.000',
    regionDescription: 'Bengkulu & Sumatera Selatan bagian barat'
  },
  {
    glottocode: 'tora1261',
    name: "Toraja-Sa'dan",
    isocodes: 'sda',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -2.97144,
    longitude: 119.829,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '750.000',
    regionDescription: 'Tana Toraja, Toraja Utara, Enrekang'
  },
  {
    glottocode: 'muna1247',
    name: 'Muna',
    isocodes: 'mnb',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -5.40419,
    longitude: 122.541,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '300.000',
    regionDescription: 'Pulau Muna, Buton Utara (Sultra)'
  },
  {
    glottocode: 'tolk1234',
    name: 'Tolaki',
    isocodes: 'lbw',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -4.03577,
    longitude: 121.888,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '330.000',
    regionDescription: 'Kendari, Konawe, Kolaka (Sultra)'
  },
  {
    glottocode: 'goro1259',
    name: 'Gorontalo',
    isocodes: 'gor',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: 0.62689,
    longitude: 122.288,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '1.000.000',
    regionDescription: 'Provinsi Gorontalo, pesisir Teluk Tomini'
  },
  {
    glottocode: 'tond1251',
    name: 'Tondano (Minahasa)',
    isocodes: 'tdn',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: 1.28024,
    longitude: 124.964,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '100.000',
    regionDescription: 'Minahasa, Danau Tondano (Sulut)'
  },
  {
    glottocode: 'sang1336',
    name: 'Sangir',
    isocodes: 'sxn',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: 3.50554,
    longitude: 125.565,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '255.000',
    regionDescription: 'Kepulauan Sangihe & Talaud (Sulut)'
  },
  {
    glottocode: 'bima1247',
    name: 'Bima (Nggahi Mbojo)',
    isocodes: 'bhp',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -8.57376,
    longitude: 118.445,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '500.000',
    regionDescription: 'Kabupaten & Kota Bima, Dompu (NTB)'
  },
  {
    glottocode: 'sumb1241',
    name: 'Sumbawa (Basa Samawa)',
    isocodes: 'smw',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -8.71919,
    longitude: 117.472,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '300.000',
    regionDescription: 'Sumbawa Besar, Sumbawa Barat (NTB)'
  },
  {
    glottocode: 'mang1405',
    name: 'Manggarai',
    isocodes: 'mqy',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -8.55748,
    longitude: 120.329,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '900.000',
    regionDescription: 'Flores Barat (Manggarai, Labuan Bajo)'
  },
  {
    glottocode: 'sika1262',
    name: 'Sika (Sara Sikka)',
    isocodes: 'ski',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -8.67302,
    longitude: 122.38,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '175.000',
    regionDescription: 'Maumere, Flores Timur (NTT)'
  },
  {
    glottocode: 'lama1277',
    name: 'Lamaholot (Solor)',
    isocodes: 'slp',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -8.36439,
    longitude: 122.803,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '200.000',
    regionDescription: 'Flores Timur, Pulau Adonara, Lembata'
  },
  {
    glottocode: 'uabm1237',
    name: 'Uab Meto (Dawan)',
    isocodes: 'aoz',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -9.77284,
    longitude: 124.144,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '700.000',
    regionDescription: 'Timor Barat (Kupang, TTS, TTU)'
  },
  {
    glottocode: 'tetu1245',
    name: 'Tetun (Tetum)',
    isocodes: 'tet',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -9.11217,
    longitude: 125.528,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '800.000',
    regionDescription: 'Belu (NTT) dan Timor Leste'
  },
  {
    glottocode: 'tern1247',
    name: 'Ternate',
    isocodes: 'tft',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: 0.80562,
    longitude: 127.333,
    family: 'Papuan / Trans-New Guinea',
    speakersEstimated: '50.000',
    regionDescription: 'Pulau Ternate, Maluku Utara'
  },
  {
    glottocode: 'tido1248',
    name: 'Tidore',
    isocodes: 'tvo',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: 0.02461,
    longitude: 127.746,
    family: 'Papuan / Trans-New Guinea',
    speakersEstimated: '45.000',
    regionDescription: 'Pulau Tidore, Maluku Utara'
  },
  {
    glottocode: 'ambo1250',
    name: 'Ambonese Malay (Melayu Ambon)',
    isocodes: 'abs',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -3.71342,
    longitude: 128.184,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '250.000',
    regionDescription: 'Pulau Ambon, Saparua, Seram (Maluku)'
  },
  {
    glottocode: 'biak1248',
    name: 'Biak',
    isocodes: 'bhw',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -0.9523,
    longitude: 135.879,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '70.000',
    regionDescription: 'Kepulauan Biak-Numfor, Teluk Cenderawasih'
  },
  {
    glottocode: 'west2594',
    name: 'Western Dani (Lani)',
    isocodes: 'dnw',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -3.77127,
    longitude: 138.217,
    family: 'Papuan / Trans-New Guinea',
    speakersEstimated: '180.000',
    regionDescription: 'Lembah Baliem, Puncak Jaya, Tiom'
  },
  {
    glottocode: 'cent2117',
    name: 'Central Asmat',
    isocodes: 'cns',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -5.80391,
    longitude: 138.471,
    family: 'Papuan / Trans-New Guinea',
    speakersEstimated: '50.000',
    regionDescription: 'Pesisir Agats, Asmat (Papua Selatan)'
  },
  {
    glottocode: 'sent1260',
    name: 'Sentani',
    isocodes: 'set',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -2.6013,
    longitude: 140.512,
    family: 'Papuan / Trans-New Guinea',
    speakersEstimated: '30.000',
    regionDescription: 'Danau Sentani, Jayapura (Papua)'
  },
  {
    glottocode: 'abui1241',
    name: 'Abui',
    isocodes: 'abz',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -8.31058,
    longitude: 124.588,
    family: 'Papuan / Trans-New Guinea',
    speakersEstimated: '16.000',
    regionDescription: 'Pulau Alor bagian tengah (NTT)'
  },
  {
    glottocode: 'hata1243',
    name: 'Hatam',
    isocodes: 'had',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -1.13531,
    longitude: 134.037,
    family: 'Lainnya / Isolat',
    speakersEstimated: '16.000',
    regionDescription: 'Pegunungan Arfak, Manokwari (Papua Barat)'
  },
  {
    glottocode: 'maya1282',
    name: "Ma'ya",
    isocodes: 'slz',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -1.22329,
    longitude: 130.909,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '4.000',
    regionDescription: 'Pulau Misool & Salawati, Raja Ampat'
  },
  {
    glottocode: 'betawi1252',
    name: 'Betawi',
    isocodes: 'bew',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -6.21174,
    longitude: 107.022,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '5.000.000',
    regionDescription: 'DKI Jakarta, Depok, Tangerang, Bekasi'
  },
  {
    glottocode: 'badu1237',
    name: 'Baduy (Sunda Wiwitan)',
    isocodes: 'bac',
    level: 'dialect',
    macroarea: 'Papunesia',
    latitude: -6.35359,
    longitude: 106.177,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '12.000',
    regionDescription: 'Kanekes, Leuwidamar, Lebak Banten'
  },

  // --- ASIA / EURASIA EXAMPLES ---
  {
    glottocode: 'tagalog1270',
    name: 'Tagalog',
    isocodes: 'tgl',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: 14.06,
    longitude: 121.747,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '28.000.000',
    regionDescription: 'Luzon, Filipina'
  },
  {
    glottocode: 'cebu1242',
    name: 'Cebuano',
    isocodes: 'ceb',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: 8.38799,
    longitude: 124.367,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '21.000.000',
    regionDescription: 'Visayas, Mindanao, Filipina'
  },
  {
    glottocode: 'mand1415',
    name: 'Mandarin Chinese',
    isocodes: 'cmn',
    level: 'language',
    macroarea: 'Eurasia',
    latitude: 40.0209,
    longitude: 116.228,
    family: 'Sino-Tibetan',
    speakersEstimated: '920.000.000',
    regionDescription: 'Tiongkok Bagian Utara & Tengah'
  },
  {
    glottocode: 'thai1261',
    name: 'Thai (Siam)',
    isocodes: 'tha',
    level: 'language',
    macroarea: 'Eurasia',
    latitude: 14.192,
    longitude: 100.671,
    family: 'Austroasiatic',
    speakersEstimated: '40.000.000',
    regionDescription: 'Thailand Pusat'
  },
  {
    glottocode: 'viet1252',
    name: 'Vietnamese',
    isocodes: 'vie',
    level: 'language',
    macroarea: 'Eurasia',
    latitude: 20.681,
    longitude: 105.774,
    family: 'Austroasiatic',
    speakersEstimated: '85.000.000',
    regionDescription: 'Vietnam'
  },
  {
    glottocode: 'hind1269',
    name: 'Hindi',
    isocodes: 'hin',
    level: 'language',
    macroarea: 'Eurasia',
    latitude: 25.0,
    longitude: 77.0,
    family: 'Indo-European',
    speakersEstimated: '340.000.000',
    regionDescription: 'India Utara'
  },
  {
    glottocode: 'nucl1302',
    name: 'Georgian',
    isocodes: 'kat',
    level: 'language',
    macroarea: 'Eurasia',
    latitude: 41.85,
    longitude: 43.786,
    family: 'Indo-European',
    speakersEstimated: '4.000.000',
    regionDescription: 'Kaukasus, Georgia'
  },

  // --- AFRICA EXAMPLES ---
  {
    glottocode: 'swah1253',
    name: 'Swahili (Kiswahili)',
    isocodes: 'swh',
    level: 'language',
    macroarea: 'Africa',
    latitude: -8.25605,
    longitude: 37.624,
    family: 'Niger-Congo',
    speakersEstimated: '16.000.000',
    regionDescription: 'Afrika Timur (Tanzania, Kenya, Uganda, Kongo)'
  },
  {
    glottocode: 'haus1257',
    name: 'Hausa',
    isocodes: 'hau',
    level: 'language',
    macroarea: 'Africa',
    latitude: 11.1513,
    longitude: 8.7804,
    family: 'Afroasiatic',
    speakersEstimated: '50.000.000',
    regionDescription: 'Nigeria Utara & Niger'
  },
  {
    glottocode: 'yoru1245',
    name: 'Yoruba',
    isocodes: 'yor',
    level: 'language',
    macroarea: 'Africa',
    latitude: 7.15345,
    longitude: 3.67225,
    family: 'Niger-Congo',
    speakersEstimated: '45.000.000',
    regionDescription: 'Nigeria Barat Daya & Benin'
  },

  // --- PACIFIC & PAPUA NEW GUINEA ---
  {
    glottocode: 'tokp1240',
    name: 'Tok Pisin',
    isocodes: 'tpi',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -9.41971,
    longitude: 147.303,
    family: 'Lainnya / Isolat',
    speakersEstimated: '4.000.000',
    regionDescription: 'Papua Nugini (Creole Lingua Franca)'
  },
  {
    glottocode: 'maor1246',
    name: 'Maori (Te Reo Māori)',
    isocodes: 'mri',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: -38.2881,
    longitude: 176.541,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '160.000',
    regionDescription: 'Selandia Baru (Aotearoa)'
  },
  {
    glottocode: 'hawa1245',
    name: 'Hawaiian (ʻŌlelo Hawaiʻi)',
    isocodes: 'haw',
    level: 'language',
    macroarea: 'Papunesia',
    latitude: 19.6297,
    longitude: -155.43,
    family: 'Austronesian (Malayo-Polynesian)',
    speakersEstimated: '24.000',
    regionDescription: 'Kepulauan Hawaii'
  }
];
