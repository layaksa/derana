// Basis Data Atlas Bahasa Glottolog Nasional & Regional Geospasial
// Sumber: Glottolog International Linguistic Database
// Dilengkapi dengan Poligon Batas Wilayah Penggunaan Bahasa & Kluster Geografis

export interface NeighborLanguageRef {
  glottocode: string;
  name: string;
  distanceKm: number;
}

export interface GlottologLanguage {
  glottocode: string;
  name: string;
  isocode: string;
  level: 'family' | 'language' | 'dialect';
  macroarea: string;
  latitude: number;
  longitude: number;
  isNational: boolean;
  isFromCsv?: boolean;
  island: 'Sumatera' | 'Jawa & Bali' | 'Kalimantan' | 'Sulawesi' | 'Nusa Tenggara' | 'Maluku' | 'Papua' | 'Lainnya';
  province: string;
  family: string;
  estimatedRadiusKm: number;
  estimatedAreaKm2: number;
  boundaryPolygon: [number, number][]; // [latitude, longitude] array forming closed loop
  neighbors: NeighborLanguageRef[];
}

export const GLOTTOLOG_LANGUAGES: GlottologLanguage[] = [
  {
    "glottocode": "achi1257",
    "name": "Acehnese",
    "isocode": "ace",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 3.90757,
    "longitude": 96.6032,
    "isNational": true,
    "isFromCsv": true,
    "island": "Sumatera",
    "province": "Aceh",
    "family": "Austronesian (Malayo-Polynesian)",
    "estimatedRadiusKm": 65.0,
    "estimatedAreaKm2": 12211.4,
    "boundaryPolygon": [
      [
        4.3986,
        96.6032
      ],
      [
        4.45242,
        96.8662
      ],
      [
        4.20246,
        96.97384
      ],
      [
        4.04615,
        97.2118
      ],
      [
        3.76899,
        97.2118
      ],
      [
        3.61268,
        96.97384
      ],
      [
        3.36272,
        96.8662
      ],
      [
        3.41654,
        96.6032
      ],
      [
        3.56761,
        96.4391
      ],
      [
        3.59016,
        96.20425
      ],
      [
        3.82763,
        96.25213
      ],
      [
        3.98751,
        96.25213
      ],
      [
        4.22498,
        96.20425
      ],
      [
        4.24753,
        96.4391
      ],
      [
        4.3986,
        96.6032
      ]
    ],
    "neighbors": [
      {
        "glottocode": "gayo1244",
        "name": "Gayo",
        "distanceKm": 97.3
      }
    ]
  },
  {
    "glottocode": "bata1292",
    "name": "Batak Alas-Kluet",
    "isocode": "btz",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 3.4293,
    "longitude": 97.8123,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sumatera",
    "province": "Aceh / Sumatera Utara",
    "family": "Austronesian (Batak)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        3.7413,
        97.8123
      ],
      [
        3.64645,
        97.91706
      ],
      [
        3.61981,
        98.05162
      ],
      [
        3.49653,
        98.1074
      ],
      [
        3.38026,
        98.02753
      ],
      [
        3.25415,
        98.03233
      ],
      [
        3.22395,
        97.91137
      ],
      [
        3.25782,
        97.8123
      ],
      [
        3.21086,
        97.70691
      ],
      [
        3.31836,
        97.67294
      ],
      [
        3.38895,
        97.6352
      ],
      [
        3.48785,
        97.55533
      ],
      [
        3.55559,
        97.65366
      ],
      [
        3.65955,
        97.70122
      ],
      [
        3.7413,
        97.8123
      ]
    ],
    "neighbors": [
      {
        "glottocode": "bata1294",
        "name": "Batak Dairi",
        "distanceKm": 112.4
      },
      {
        "glottocode": "gayo1244",
        "name": "Gayo",
        "distanceKm": 117.0
      },
      {
        "glottocode": "bata1288",
        "name": "Batak Simalungun",
        "distanceKm": 129.0
      }
    ]
  },
  {
    "glottocode": "gayo1244",
    "name": "Gayo",
    "isocode": "gay",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 4.3733,
    "longitude": 97.3456,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sumatera",
    "province": "Aceh",
    "family": "Austronesian (Malayo-Polynesian)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        4.61725,
        97.3456
      ],
      [
        4.64258,
        97.47566
      ],
      [
        4.55594,
        97.57529
      ],
      [
        4.41893,
        97.54609
      ],
      [
        4.31466,
        97.60327
      ],
      [
        4.2386,
        97.515
      ],
      [
        4.22797,
        97.41579
      ],
      [
        4.13377,
        97.3456
      ],
      [
        4.20698,
        97.26527
      ],
      [
        4.2545,
        97.19619
      ],
      [
        4.31134,
        97.07336
      ],
      [
        4.42224,
        97.13054
      ],
      [
        4.54005,
        97.1359
      ],
      [
        4.66357,
        97.20541
      ],
      [
        4.61725,
        97.3456
      ]
    ],
    "neighbors": [
      {
        "glottocode": "achi1257",
        "name": "Acehnese",
        "distanceKm": 97.3
      },
      {
        "glottocode": "bata1292",
        "name": "Batak Alas-Kluet",
        "distanceKm": 117.0
      }
    ]
  },
  {
    "glottocode": "bata1290",
    "name": "Batak Angkola",
    "isocode": "akb",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 1.66127,
    "longitude": 99.60248,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sumatera",
    "province": "Sumatera Utara",
    "family": "Austronesian (Batak)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        1.94845,
        99.60248
      ],
      [
        1.9138,
        99.72415
      ],
      [
        1.77894,
        99.7501
      ],
      [
        1.71634,
        99.84384
      ],
      [
        1.61504,
        99.80513
      ],
      [
        1.5638,
        99.72476
      ],
      [
        1.44311,
        99.70758
      ],
      [
        1.46498,
        99.60248
      ],
      [
        1.47821,
        99.51428
      ],
      [
        1.4775,
        99.37195
      ],
      [
        1.60875,
        99.37229
      ],
      [
        1.72262,
        99.33358
      ],
      [
        1.86524,
        99.3466
      ],
      [
        1.87871,
        99.49772
      ],
      [
        1.94845,
        99.60248
      ]
    ],
    "neighbors": [
      {
        "glottocode": "bata1289",
        "name": "Batak Toba",
        "distanceKm": 90.5
      },
      {
        "glottocode": "bata1291",
        "name": "Batak Mandailing",
        "distanceKm": 95.2
      }
    ]
  },
  {
    "glottocode": "bata1294",
    "name": "Batak Dairi",
    "isocode": "btd",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 2.51438,
    "longitude": 98.2427,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sumatera",
    "province": "Sumatera Utara",
    "family": "Austronesian (Batak)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        2.78036,
        98.2427
      ],
      [
        2.67059,
        98.318
      ],
      [
        2.66061,
        98.42625
      ],
      [
        2.55986,
        98.44215
      ],
      [
        2.47943,
        98.39596
      ],
      [
        2.35858,
        98.43825
      ],
      [
        2.32355,
        98.33469
      ],
      [
        2.29689,
        98.2427
      ],
      [
        2.23499,
        98.10803
      ],
      [
        2.35917,
        98.04789
      ],
      [
        2.45228,
        97.97035
      ],
      [
        2.58702,
        97.92415
      ],
      [
        2.66002,
        98.05989
      ],
      [
        2.75914,
        98.12471
      ],
      [
        2.78036,
        98.2427
      ]
    ],
    "neighbors": [
      {
        "glottocode": "bata1293",
        "name": "Batak Karo",
        "distanceKm": 43.0
      },
      {
        "glottocode": "bata1288",
        "name": "Batak Simalungun",
        "distanceKm": 94.5
      },
      {
        "glottocode": "bata1289",
        "name": "Batak Toba",
        "distanceKm": 105.2
      },
      {
        "glottocode": "bata1292",
        "name": "Batak Alas-Kluet",
        "distanceKm": 112.4
      }
    ]
  },
  {
    "glottocode": "bata1293",
    "name": "Batak Karo",
    "isocode": "btx",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 2.12787,
    "longitude": 98.2517,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sumatera",
    "province": "Sumatera Utara",
    "family": "Austronesian (Batak)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        2.28872,
        98.2517
      ],
      [
        2.33162,
        98.34989
      ],
      [
        2.25664,
        98.41328
      ],
      [
        2.1642,
        98.41096
      ],
      [
        2.06963,
        98.50704
      ],
      [
        1.98479,
        98.43125
      ],
      [
        1.91927,
        98.35222
      ],
      [
        1.80524,
        98.2517
      ],
      [
        1.89603,
        98.13997
      ],
      [
        1.9552,
        98.03502
      ],
      [
        2.05661,
        97.93928
      ],
      [
        2.17721,
        98.03536
      ],
      [
        2.28623,
        98.05299
      ],
      [
        2.35487,
        98.14231
      ],
      [
        2.28872,
        98.2517
      ]
    ],
    "neighbors": [
      {
        "glottocode": "bata1294",
        "name": "Batak Dairi",
        "distanceKm": 43.0
      },
      {
        "glottocode": "bata1289",
        "name": "Batak Toba",
        "distanceKm": 105.8
      },
      {
        "glottocode": "bata1288",
        "name": "Batak Simalungun",
        "distanceKm": 125.3
      }
    ]
  },
  {
    "glottocode": "bata1291",
    "name": "Batak Mandailing",
    "isocode": "btm",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 0.85805,
    "longitude": 99.898,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sumatera",
    "province": "Sumatera Utara",
    "family": "Austronesian (Batak)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        1.08118,
        99.898
      ],
      [
        1.05101,
        99.99094
      ],
      [
        0.96657,
        100.03409
      ],
      [
        0.91949,
        100.16723
      ],
      [
        0.803,
        100.13923
      ],
      [
        0.70631,
        100.0883
      ],
      [
        0.55999,
        100.04155
      ],
      [
        0.59771,
        99.898
      ],
      [
        0.61542,
        99.78114
      ],
      [
        0.66512,
        99.65605
      ],
      [
        0.81191,
        99.69582
      ],
      [
        0.91058,
        99.66783
      ],
      [
        1.00775,
        99.71026
      ],
      [
        0.99559,
        99.83176
      ],
      [
        1.08118,
        99.898
      ]
    ],
    "neighbors": [
      {
        "glottocode": "bata1290",
        "name": "Batak Angkola",
        "distanceKm": 95.2
      }
    ]
  },
  {
    "glottocode": "bata1288",
    "name": "Batak Simalungun",
    "isocode": "bts",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 3.04372,
    "longitude": 98.9083,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sumatera",
    "province": "Sumatera Utara",
    "family": "Austronesian (Batak)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        3.27035,
        98.9083
      ],
      [
        3.21313,
        98.99
      ],
      [
        3.22529,
        99.1363
      ],
      [
        3.10238,
        99.16568
      ],
      [
        2.98778,
        99.15375
      ],
      [
        2.83568,
        99.16954
      ],
      [
        2.81144,
        99.02032
      ],
      [
        2.78687,
        98.9083
      ],
      [
        2.77754,
        98.77993
      ],
      [
        2.92384,
        98.75777
      ],
      [
        2.9948,
        98.69366
      ],
      [
        3.09536,
        98.68173
      ],
      [
        3.13713,
        98.79101
      ],
      [
        3.24703,
        98.81025
      ],
      [
        3.27035,
        98.9083
      ]
    ],
    "neighbors": [
      {
        "glottocode": "bata1289",
        "name": "Batak Toba",
        "distanceKm": 82.2
      },
      {
        "glottocode": "bata1294",
        "name": "Batak Dairi",
        "distanceKm": 94.5
      },
      {
        "glottocode": "bata1293",
        "name": "Batak Karo",
        "distanceKm": 125.3
      },
      {
        "glottocode": "bata1292",
        "name": "Batak Alas-Kluet",
        "distanceKm": 129.0
      }
    ]
  },
  {
    "glottocode": "bata1289",
    "name": "Batak Toba",
    "isocode": "bbc",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 2.35498,
    "longitude": 99.1761,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sumatera",
    "province": "Sumatera Utara",
    "family": "Austronesian (Batak)",
    "estimatedRadiusKm": 65.0,
    "estimatedAreaKm2": 12211.4,
    "boundaryPolygon": [
      [
        2.76817,
        99.1761
      ],
      [
        2.9132,
        99.44515
      ],
      [
        2.70501,
        99.6154
      ],
      [
        2.47,
        99.68044
      ],
      [
        2.20546,
        99.83174
      ],
      [
        2.03805,
        99.57386
      ],
      [
        1.91416,
        99.38857
      ],
      [
        1.78611,
        99.1761
      ],
      [
        2.02839,
        99.01869
      ],
      [
        2.09271,
        98.84694
      ],
      [
        2.25147,
        98.7222
      ],
      [
        2.42399,
        98.8735
      ],
      [
        2.65035,
        98.8054
      ],
      [
        2.79897,
        98.96211
      ],
      [
        2.76817,
        99.1761
      ]
    ],
    "neighbors": [
      {
        "glottocode": "bata1288",
        "name": "Batak Simalungun",
        "distanceKm": 82.2
      },
      {
        "glottocode": "bata1290",
        "name": "Batak Angkola",
        "distanceKm": 90.5
      },
      {
        "glottocode": "bata1294",
        "name": "Batak Dairi",
        "distanceKm": 105.2
      },
      {
        "glottocode": "bata1293",
        "name": "Batak Karo",
        "distanceKm": 105.8
      }
    ]
  },
  {
    "glottocode": "nias1242",
    "name": "Nias",
    "isocode": "nia",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 0.90691,
    "longitude": 97.4961,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sumatera",
    "province": "Sumatera Utara (Nias)",
    "family": "Austronesian (Barrier Islands)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        1.22266,
        97.4961
      ],
      [
        1.16313,
        97.61951
      ],
      [
        1.06402,
        97.69314
      ],
      [
        0.97868,
        97.8106
      ],
      [
        0.85378,
        97.72892
      ],
      [
        0.76781,
        97.67054
      ],
      [
        0.66793,
        97.6112
      ],
      [
        0.73918,
        97.4961
      ],
      [
        0.72754,
        97.40971
      ],
      [
        0.76258,
        97.3151
      ],
      [
        0.8711,
        97.33919
      ],
      [
        0.96136,
        97.2575
      ],
      [
        1.06926,
        97.2925
      ],
      [
        1.10352,
        97.4014
      ],
      [
        1.22266,
        97.4961
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "mina1268",
    "name": "Minangkabau",
    "isocode": "min",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -0.896,
    "longitude": 100.44,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sumatera",
    "province": "Sumatera Barat",
    "family": "Austronesian (Malayic)",
    "estimatedRadiusKm": 65.0,
    "estimatedAreaKm2": 12211.4,
    "boundaryPolygon": [
      [
        -0.31326,
        100.44
      ],
      [
        -0.44922,
        100.65519
      ],
      [
        -0.50354,
        100.93218
      ],
      [
        -0.7943,
        100.88562
      ],
      [
        -0.98887,
        100.84692
      ],
      [
        -1.21628,
        100.84167
      ],
      [
        -1.19162,
        100.58238
      ],
      [
        -1.29532,
        100.44
      ],
      [
        -1.33402,
        100.22903
      ],
      [
        -1.11585,
        100.16428
      ],
      [
        -1.01283,
        99.92807
      ],
      [
        -0.77034,
        99.88937
      ],
      [
        -0.60398,
        100.07377
      ],
      [
        -0.30682,
        100.15623
      ],
      [
        -0.31326,
        100.44
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "ment1249",
    "name": "Mentawai",
    "isocode": "mwv",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.41092,
    "longitude": 98.9401,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Sumatera Barat (Mentawai)",
    "family": "Austronesian (Barrier Islands)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -1.17924,
        98.9401
      ],
      [
        -1.14576,
        99.06783
      ],
      [
        -1.27947,
        99.10498
      ],
      [
        -1.36866,
        99.12529
      ],
      [
        -1.46534,
        99.1786
      ],
      [
        -1.51116,
        99.06584
      ],
      [
        -1.5908,
        99.02675
      ],
      [
        -1.66271,
        98.9401
      ],
      [
        -1.58136,
        98.858
      ],
      [
        -1.58092,
        98.72687
      ],
      [
        -1.47625,
        98.6538
      ],
      [
        -1.35776,
        98.7071
      ],
      [
        -1.20972,
        98.68773
      ],
      [
        -1.1552,
        98.81692
      ],
      [
        -1.17924,
        98.9401
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "keri1250",
    "name": "Kerinci",
    "isocode": "kvr",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.93668,
    "longitude": 101.403,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sumatera",
    "province": "Jambi",
    "family": "Austronesian (Malayic)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -1.65903,
        101.403
      ],
      [
        -1.75811,
        101.48904
      ],
      [
        -1.82564,
        101.54232
      ],
      [
        -1.88298,
        101.63839
      ],
      [
        -1.97355,
        101.56464
      ],
      [
        -2.06615,
        101.56544
      ],
      [
        -2.17765,
        101.51911
      ],
      [
        -2.1425,
        101.403
      ],
      [
        -2.19371,
        101.27915
      ],
      [
        -2.12709,
        101.1641
      ],
      [
        -1.99057,
        101.16677
      ],
      [
        -1.86597,
        101.09302
      ],
      [
        -1.76471,
        101.18723
      ],
      [
        -1.74205,
        101.30922
      ],
      [
        -1.65903,
        101.403
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kubu1239",
        "name": "Kubu",
        "distanceKm": 103.3
      }
    ]
  },
  {
    "glottocode": "jamb1236",
    "name": "Jambi Malay",
    "isocode": "jax",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.6469,
    "longitude": 103.13,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sumatera",
    "province": "Jambi",
    "family": "Austronesian (Malayic)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -2.45801,
        103.13
      ],
      [
        -2.4926,
        103.20439
      ],
      [
        -2.49503,
        103.32065
      ],
      [
        -2.60776,
        103.30165
      ],
      [
        -2.69572,
        103.34411
      ],
      [
        -2.82432,
        103.35272
      ],
      [
        -2.84654,
        103.22624
      ],
      [
        -2.94149,
        103.13
      ],
      [
        -2.92819,
        102.99439
      ],
      [
        -2.79647,
        102.94225
      ],
      [
        -2.71535,
        102.82979
      ],
      [
        -2.58813,
        102.87225
      ],
      [
        -2.52288,
        102.97432
      ],
      [
        -2.41094,
        103.01625
      ],
      [
        -2.45801,
        103.13
      ]
    ],
    "neighbors": [
      {
        "glottocode": "musi1241",
        "name": "Musi",
        "distanceKm": 96.2
      },
      {
        "glottocode": "kubu1239",
        "name": "Kubu",
        "distanceKm": 106.9
      },
      {
        "glottocode": "reja1240",
        "name": "Rejang",
        "distanceKm": 108.4
      }
    ]
  },
  {
    "glottocode": "duan1242",
    "name": "Duano",
    "isocode": "dup",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 0.72162,
    "longitude": 103.46759,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Riau / Kepulauan Riau",
    "family": "Austronesian (Malayic)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        0.89167,
        103.46759
      ],
      [
        0.94789,
        103.57656
      ],
      [
        0.84022,
        103.61632
      ],
      [
        0.7735,
        103.69492
      ],
      [
        0.65461,
        103.76122
      ],
      [
        0.57535,
        103.65102
      ],
      [
        0.45204,
        103.59742
      ],
      [
        0.40819,
        103.46759
      ],
      [
        0.51229,
        103.36678
      ],
      [
        0.53877,
        103.23829
      ],
      [
        0.66592,
        103.22353
      ],
      [
        0.76219,
        103.28983
      ],
      [
        0.87679,
        103.27299
      ],
      [
        0.88763,
        103.38764
      ],
      [
        0.89167,
        103.46759
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "reja1240",
    "name": "Rejang",
    "isocode": "rej",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.33056,
    "longitude": 102.434,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sumatera",
    "province": "Bengkulu",
    "family": "Austronesian (Land Dayak-related)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -3.06749,
        102.434
      ],
      [
        -3.14392,
        102.52403
      ],
      [
        -3.17652,
        102.62749
      ],
      [
        -3.26039,
        102.74195
      ],
      [
        -3.38471,
        102.67167
      ],
      [
        -3.51659,
        102.66766
      ],
      [
        -3.60904,
        102.56833
      ],
      [
        -3.55096,
        102.434
      ],
      [
        -3.57952,
        102.31391
      ],
      [
        -3.47796,
        102.24885
      ],
      [
        -3.36797,
        102.2698
      ],
      [
        -3.27713,
        102.19952
      ],
      [
        -3.21514,
        102.28903
      ],
      [
        -3.17344,
        102.35821
      ],
      [
        -3.06749,
        102.434
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kubu1239",
        "name": "Kubu",
        "distanceKm": 104.0
      },
      {
        "glottocode": "jamb1236",
        "name": "Jambi Malay",
        "distanceKm": 108.4
      }
    ]
  },
  {
    "glottocode": "engg1245",
    "name": "Enggano",
    "isocode": "eno",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -5.38846,
    "longitude": 102.245,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sumatera",
    "province": "Bengkulu (Pulau Enggano)",
    "family": "Austronesian (Enggano)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -5.16365,
        102.245
      ],
      [
        -5.15497,
        102.35794
      ],
      [
        -5.18552,
        102.5006
      ],
      [
        -5.33351,
        102.48681
      ],
      [
        -5.45341,
        102.53084
      ],
      [
        -5.57545,
        102.48052
      ],
      [
        -5.57365,
        102.33458
      ],
      [
        -5.64713,
        102.245
      ],
      [
        -5.59056,
        102.14724
      ],
      [
        -5.48697,
        102.12093
      ],
      [
        -5.4411,
        102.01336
      ],
      [
        -5.34583,
        102.0574
      ],
      [
        -5.27401,
        102.10085
      ],
      [
        -5.13805,
        102.12388
      ],
      [
        -5.16365,
        102.245
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "musi1241",
    "name": "Musi",
    "isocode": "mui",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.93987,
    "longitude": 103.945,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sumatera",
    "province": "Sumatera Selatan",
    "family": "Austronesian (Malayic)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -2.67214,
        103.945
      ],
      [
        -2.64213,
        104.08857
      ],
      [
        -2.78715,
        104.13676
      ],
      [
        -2.87748,
        104.21871
      ],
      [
        -3.00378,
        104.22539
      ],
      [
        -3.05807,
        104.09341
      ],
      [
        -3.15814,
        104.05025
      ],
      [
        -3.15562,
        103.945
      ],
      [
        -3.07773,
        103.87852
      ],
      [
        -3.08859,
        103.75826
      ],
      [
        -2.98506,
        103.74673
      ],
      [
        -2.8962,
        103.75341
      ],
      [
        -2.75663,
        103.71492
      ],
      [
        -2.72254,
        103.8402
      ],
      [
        -2.67214,
        103.945
      ]
    ],
    "neighbors": [
      {
        "glottocode": "jamb1236",
        "name": "Jambi Malay",
        "distanceKm": 96.2
      }
    ]
  },
  {
    "glottocode": "koma1266",
    "name": "Komering",
    "isocode": "kge",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.79215,
    "longitude": 105.107,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Sumatera Selatan",
    "family": "Austronesian (Lampungic)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -3.46239,
        105.107
      ],
      [
        -3.57792,
        105.2104
      ],
      [
        -3.62695,
        105.31461
      ],
      [
        -3.73146,
        105.37348
      ],
      [
        -3.83097,
        105.27746
      ],
      [
        -3.93487,
        105.28636
      ],
      [
        -3.98313,
        105.19918
      ],
      [
        -3.94586,
        105.107
      ],
      [
        -4.01351,
        105.00016
      ],
      [
        -3.92839,
        104.93579
      ],
      [
        -3.83904,
        104.9011
      ],
      [
        -3.72339,
        104.80507
      ],
      [
        -3.63343,
        104.90753
      ],
      [
        -3.54754,
        104.98894
      ],
      [
        -3.46239,
        105.107
      ]
    ],
    "neighbors": [
      {
        "glottocode": "lamp1242",
        "name": "Lampung Nyo",
        "distanceKm": 78.8
      }
    ]
  },
  {
    "glottocode": "kubu1239",
    "name": "Kubu",
    "isocode": "kvb",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.42661,
    "longitude": 102.193,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sumatera",
    "province": "Jambi / Sumsel",
    "family": "Austronesian (Malayic)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -2.20018,
        102.193
      ],
      [
        -2.2038,
        102.3004
      ],
      [
        -2.2655,
        102.39521
      ],
      [
        -2.39055,
        102.35114
      ],
      [
        -2.47557,
        102.40771
      ],
      [
        -2.55985,
        102.36023
      ],
      [
        -2.5707,
        102.26245
      ],
      [
        -2.68365,
        102.193
      ],
      [
        -2.6394,
        102.09044
      ],
      [
        -2.56694,
        102.01688
      ],
      [
        -2.49813,
        101.87936
      ],
      [
        -2.36799,
        101.93593
      ],
      [
        -2.25841,
        101.98189
      ],
      [
        -2.13511,
        102.05249
      ],
      [
        -2.20018,
        102.193
      ]
    ],
    "neighbors": [
      {
        "glottocode": "keri1250",
        "name": "Kerinci",
        "distanceKm": 103.3
      },
      {
        "glottocode": "reja1240",
        "name": "Rejang",
        "distanceKm": 104.0
      },
      {
        "glottocode": "jamb1236",
        "name": "Jambi Malay",
        "distanceKm": 106.9
      }
    ]
  },
  {
    "glottocode": "bang1365",
    "name": "Bangka",
    "isocode": "mfb",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.73288,
    "longitude": 105.897,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sumatera",
    "province": "Kepulauan Bangka Belitung",
    "family": "Austronesian (Malayic)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -1.50358,
        105.897
      ],
      [
        -1.51111,
        106.00385
      ],
      [
        -1.63691,
        106.0174
      ],
      [
        -1.6847,
        106.10818
      ],
      [
        -1.78204,
        106.1125
      ],
      [
        -1.83939,
        106.03062
      ],
      [
        -1.97709,
        106.01466
      ],
      [
        -1.98706,
        105.897
      ],
      [
        -1.94671,
        105.79398
      ],
      [
        -1.93835,
        105.63923
      ],
      [
        -1.79229,
        105.63661
      ],
      [
        -1.67446,
        105.64093
      ],
      [
        -1.53795,
        105.65245
      ],
      [
        -1.54149,
        105.80479
      ],
      [
        -1.50358,
        105.897
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "lamp1243",
    "name": "Lampung Api",
    "isocode": "ljp",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -5.73463,
    "longitude": 105.037,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sumatera",
    "province": "Lampung",
    "family": "Austronesian (Lampungic)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -5.49702,
        105.037
      ],
      [
        -5.59849,
        105.10289
      ],
      [
        -5.59836,
        105.20873
      ],
      [
        -5.68278,
        105.26533
      ],
      [
        -5.7758,
        105.21828
      ],
      [
        -5.91287,
        105.26162
      ],
      [
        -5.9784,
        105.15498
      ],
      [
        -5.98049,
        105.037
      ],
      [
        -6.03408,
        104.89207
      ],
      [
        -5.89981,
        104.82883
      ],
      [
        -5.79036,
        104.7916
      ],
      [
        -5.66821,
        104.74455
      ],
      [
        -5.61142,
        104.88173
      ],
      [
        -5.5428,
        104.94416
      ],
      [
        -5.49702,
        105.037
      ]
    ],
    "neighbors": [
      {
        "glottocode": "haji1235",
        "name": "Haji",
        "distanceKm": 81.3
      }
    ]
  },
  {
    "glottocode": "lamp1242",
    "name": "Lampung Nyo",
    "isocode": "abl",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -4.43957,
    "longitude": 105.397,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sumatera",
    "province": "Lampung",
    "family": "Austronesian (Lampungic)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -4.28558,
        105.397
      ],
      [
        -4.23622,
        105.49522
      ],
      [
        -4.2845,
        105.59203
      ],
      [
        -4.39491,
        105.59325
      ],
      [
        -4.50622,
        105.6899
      ],
      [
        -4.61638,
        105.61938
      ],
      [
        -4.66435,
        105.50557
      ],
      [
        -4.76906,
        105.397
      ],
      [
        -4.67182,
        105.28482
      ],
      [
        -4.58595,
        105.2129
      ],
      [
        -4.5025,
        105.12048
      ],
      [
        -4.39864,
        105.21713
      ],
      [
        -4.31494,
        105.24024
      ],
      [
        -4.22875,
        105.29517
      ],
      [
        -4.28558,
        105.397
      ]
    ],
    "neighbors": [
      {
        "glottocode": "koma1266",
        "name": "Komering",
        "distanceKm": 78.8
      },
      {
        "glottocode": "haji1235",
        "name": "Haji",
        "distanceKm": 103.8
      }
    ]
  },
  {
    "glottocode": "haji1235",
    "name": "Haji",
    "isocode": "hji",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -5.07781,
    "longitude": 104.714,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Sumsel / Lampung",
    "family": "Austronesian (Malayic)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -4.84096,
        104.714
      ],
      [
        -4.8379,
        104.82999
      ],
      [
        -4.94319,
        104.88348
      ],
      [
        -5.00878,
        105.01762
      ],
      [
        -5.14276,
        104.99967
      ],
      [
        -5.23218,
        104.90834
      ],
      [
        -5.36719,
        104.85391
      ],
      [
        -5.32444,
        104.714
      ],
      [
        -5.27349,
        104.61939
      ],
      [
        -5.24463,
        104.50399
      ],
      [
        -5.11637,
        104.54441
      ],
      [
        -5.03517,
        104.52646
      ],
      [
        -4.93074,
        104.52886
      ],
      [
        -4.93159,
        104.64331
      ],
      [
        -4.84096,
        104.714
      ]
    ],
    "neighbors": [
      {
        "glottocode": "lamp1243",
        "name": "Lampung Api",
        "distanceKm": 81.3
      },
      {
        "glottocode": "lamp1242",
        "name": "Lampung Nyo",
        "distanceKm": 103.8
      }
    ]
  },
  {
    "glottocode": "sund1252",
    "name": "Sundanese",
    "isocode": "sun",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -6.89708,
    "longitude": 107.106,
    "isNational": true,
    "isFromCsv": false,
    "island": "Jawa & Bali",
    "province": "Jawa Barat & Banten",
    "family": "Austronesian (Malayo-Polynesian)",
    "estimatedRadiusKm": 65.0,
    "estimatedAreaKm2": 12211.4,
    "boundaryPolygon": [
      [
        -6.32058,
        107.106
      ],
      [
        -6.47836,
        107.30912
      ],
      [
        -6.49633,
        107.61218
      ],
      [
        -6.76389,
        107.69381
      ],
      [
        -7.0057,
        107.58536
      ],
      [
        -7.28767,
        107.59935
      ],
      [
        -7.32362,
        107.31291
      ],
      [
        -7.30264,
        107.106
      ],
      [
        -7.36316,
        106.87991
      ],
      [
        -7.10864,
        106.83878
      ],
      [
        -6.98242,
        106.72939
      ],
      [
        -6.78717,
        106.62094
      ],
      [
        -6.67536,
        106.82595
      ],
      [
        -6.43881,
        106.8837
      ],
      [
        -6.32058,
        107.106
      ]
    ],
    "neighbors": [
      {
        "glottocode": "beta1252",
        "name": "Betawi",
        "distanceKm": 76.8
      },
      {
        "glottocode": "badu1237",
        "name": "Badui",
        "distanceKm": 119.1
      }
    ]
  },
  {
    "glottocode": "badu1237",
    "name": "Badui",
    "isocode": "bac",
    "level": "dialect",
    "macroarea": "Papunesia",
    "latitude": -6.35359,
    "longitude": 106.177,
    "isNational": true,
    "isFromCsv": false,
    "island": "Jawa & Bali",
    "province": "Banten",
    "family": "Austronesian (Sundanese)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -6.11585,
        106.177
      ],
      [
        -6.06775,
        106.31551
      ],
      [
        -6.1716,
        106.40662
      ],
      [
        -6.30277,
        106.40103
      ],
      [
        -6.4187,
        106.46405
      ],
      [
        -6.49012,
        106.34927
      ],
      [
        -6.51947,
        106.25738
      ],
      [
        -6.59932,
        106.177
      ],
      [
        -6.50334,
        106.10444
      ],
      [
        -6.47304,
        106.02629
      ],
      [
        -6.41035,
        105.92676
      ],
      [
        -6.31112,
        105.98978
      ],
      [
        -6.18868,
        105.96893
      ],
      [
        -6.08387,
        106.04631
      ],
      [
        -6.11585,
        106.177
      ]
    ],
    "neighbors": [
      {
        "glottocode": "beta1252",
        "name": "Betawi",
        "distanceKm": 94.7
      },
      {
        "glottocode": "sund1252",
        "name": "Sundanese",
        "distanceKm": 119.1
      }
    ]
  },
  {
    "glottocode": "beta1252",
    "name": "Betawi",
    "isocode": "bew",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -6.21174,
    "longitude": 107.022,
    "isNational": true,
    "isFromCsv": false,
    "island": "Jawa & Bali",
    "province": "DKI Jakarta & Bodetabek",
    "family": "Austronesian (Malayic Creole)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -5.89932,
        107.022
      ],
      [
        -5.95578,
        107.14599
      ],
      [
        -6.07884,
        107.18963
      ],
      [
        -6.1504,
        107.29233
      ],
      [
        -6.25765,
        107.22434
      ],
      [
        -6.31913,
        107.15746
      ],
      [
        -6.42963,
        107.12755
      ],
      [
        -6.3828,
        107.022
      ],
      [
        -6.39138,
        106.93498
      ],
      [
        -6.38029,
        106.8094
      ],
      [
        -6.25798,
        106.8182
      ],
      [
        -6.15007,
        106.7502
      ],
      [
        -6.01769,
        106.77723
      ],
      [
        -5.99403,
        106.91654
      ],
      [
        -5.89932,
        107.022
      ]
    ],
    "neighbors": [
      {
        "glottocode": "sund1252",
        "name": "Sundanese",
        "distanceKm": 76.8
      },
      {
        "glottocode": "badu1237",
        "name": "Badui",
        "distanceKm": 94.7
      }
    ]
  },
  {
    "glottocode": "cire1240",
    "name": "Cirebon Javanese",
    "isocode": "",
    "level": "dialect",
    "macroarea": "Papunesia",
    "latitude": -6.74533,
    "longitude": 108.538,
    "isNational": true,
    "isFromCsv": false,
    "island": "Jawa & Bali",
    "province": "Jawa Barat (Pantura)",
    "family": "Austronesian (Javanic)",
    "estimatedRadiusKm": 65.0,
    "estimatedAreaKm2": 12211.4,
    "boundaryPolygon": [
      [
        -6.19187,
        108.538
      ],
      [
        -6.38595,
        108.71228
      ],
      [
        -6.4167,
        108.95296
      ],
      [
        -6.65634,
        108.93059
      ],
      [
        -6.82005,
        108.86766
      ],
      [
        -7.05366,
        108.92733
      ],
      [
        -7.0769,
        108.69879
      ],
      [
        -7.17393,
        108.538
      ],
      [
        -7.27075,
        108.28321
      ],
      [
        -7.02901,
        108.1798
      ],
      [
        -6.87487,
        107.96648
      ],
      [
        -6.60152,
        107.90355
      ],
      [
        -6.44136,
        108.15417
      ],
      [
        -6.19209,
        108.26972
      ],
      [
        -6.19187,
        108.538
      ]
    ],
    "neighbors": [
      {
        "glottocode": "java1254",
        "name": "Javanese",
        "distanceKm": 87.4
      }
    ]
  },
  {
    "glottocode": "java1254",
    "name": "Javanese",
    "isocode": "jav",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -7.001,
    "longitude": 109.287,
    "isNational": true,
    "isFromCsv": false,
    "island": "Jawa & Bali",
    "province": "Jawa Tengah & D.I. Yogyakarta",
    "family": "Austronesian (Javanic)",
    "estimatedRadiusKm": 65.0,
    "estimatedAreaKm2": 12211.4,
    "boundaryPolygon": [
      [
        -6.63536,
        109.287
      ],
      [
        -6.55087,
        109.5054
      ],
      [
        -6.7578,
        109.59425
      ],
      [
        -6.92688,
        109.61419
      ],
      [
        -7.11417,
        109.78657
      ],
      [
        -7.24863,
        109.59985
      ],
      [
        -7.41239,
        109.4866
      ],
      [
        -7.61742,
        109.287
      ],
      [
        -7.43568,
        109.0761
      ],
      [
        -7.37011,
        108.82068
      ],
      [
        -7.14541,
        108.64957
      ],
      [
        -6.89565,
        108.82194
      ],
      [
        -6.63633,
        108.82628
      ],
      [
        -6.52759,
        109.0573
      ],
      [
        -6.63536,
        109.287
      ]
    ],
    "neighbors": [
      {
        "glottocode": "indo1316",
        "name": "Standard Indonesian",
        "distanceKm": 60.1
      },
      {
        "glottocode": "cire1240",
        "name": "Cirebon Javanese",
        "distanceKm": 87.4
      }
    ]
  },
  {
    "glottocode": "nucl1460",
    "name": "Madurese",
    "isocode": "mad",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -7.0,
    "longitude": 113.0,
    "isNational": true,
    "isFromCsv": false,
    "island": "Jawa & Bali",
    "province": "Jawa Timur (Madura)",
    "family": "Austronesian (Madurese)",
    "estimatedRadiusKm": 65.0,
    "estimatedAreaKm2": 12211.4,
    "boundaryPolygon": [
      [
        -6.51939,
        113.0
      ],
      [
        -6.64749,
        113.17104
      ],
      [
        -6.78691,
        113.26921
      ],
      [
        -6.88169,
        113.52226
      ],
      [
        -7.09608,
        113.42412
      ],
      [
        -7.30248,
        113.38214
      ],
      [
        -7.58109,
        113.28194
      ],
      [
        -7.50145,
        113.0
      ],
      [
        -7.53229,
        112.74174
      ],
      [
        -7.39921,
        112.49564
      ],
      [
        -7.10021,
        112.55764
      ],
      [
        -6.87755,
        112.45949
      ],
      [
        -6.69017,
        112.60857
      ],
      [
        -6.69628,
        112.85264
      ],
      [
        -6.51939,
        113.0
      ]
    ],
    "neighbors": [
      {
        "glottocode": "teng1272",
        "name": "Tengger",
        "distanceKm": 99.1
      },
      {
        "glottocode": "kane1243",
        "name": "Kangean",
        "distanceKm": 109.4
      }
    ]
  },
  {
    "glottocode": "kane1243",
    "name": "Kangean",
    "isocode": "kkv",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -7.98335,
    "longitude": 112.968,
    "isNational": true,
    "isFromCsv": false,
    "island": "Jawa & Bali",
    "province": "Jawa Timur (Kepulauan Kangean)",
    "family": "Austronesian (Madurese)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -7.78453,
        112.968
      ],
      [
        -7.8235,
        113.04573
      ],
      [
        -7.81117,
        113.18602
      ],
      [
        -7.93207,
        113.19485
      ],
      [
        -8.03924,
        113.21529
      ],
      [
        -8.18761,
        113.22664
      ],
      [
        -8.20952,
        113.07798
      ],
      [
        -8.26801,
        112.968
      ],
      [
        -8.2591,
        112.83391
      ],
      [
        -8.11261,
        112.80433
      ],
      [
        -8.03966,
        112.71888
      ],
      [
        -7.93166,
        112.73932
      ],
      [
        -7.88617,
        112.84495
      ],
      [
        -7.77392,
        112.86616
      ],
      [
        -7.78453,
        112.968
      ]
    ],
    "neighbors": [
      {
        "glottocode": "teng1272",
        "name": "Tengger",
        "distanceKm": 12.8
      },
      {
        "glottocode": "nucl1460",
        "name": "Madurese",
        "distanceKm": 109.4
      }
    ]
  },
  {
    "glottocode": "osin1237",
    "name": "Osing",
    "isocode": "osi",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.25262,
    "longitude": 114.292,
    "isNational": true,
    "isFromCsv": false,
    "island": "Jawa & Bali",
    "province": "Jawa Timur (Banyuwangi)",
    "family": "Austronesian (Javanic)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -8.06242,
        114.292
      ],
      [
        -7.98974,
        114.41992
      ],
      [
        -8.09853,
        114.48724
      ],
      [
        -8.19474,
        114.54825
      ],
      [
        -8.32663,
        114.61963
      ],
      [
        -8.40827,
        114.48922
      ],
      [
        -8.49892,
        114.41185
      ],
      [
        -8.54589,
        114.292
      ],
      [
        -8.42534,
        114.20795
      ],
      [
        -8.39998,
        114.10529
      ],
      [
        -8.30232,
        114.07197
      ],
      [
        -8.21904,
        114.14334
      ],
      [
        -8.10683,
        114.10727
      ],
      [
        -8.06332,
        114.19988
      ],
      [
        -8.06242,
        114.292
      ]
    ],
    "neighbors": [
      {
        "glottocode": "bali1279",
        "name": "Balinese Malay",
        "distanceKm": 40.9
      },
      {
        "glottocode": "bali1278",
        "name": "Balinese",
        "distanceKm": 86.9
      }
    ]
  },
  {
    "glottocode": "teng1272",
    "name": "Tengger",
    "isocode": "tes",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -7.89069,
    "longitude": 113.037,
    "isNational": true,
    "isFromCsv": false,
    "island": "Jawa & Bali",
    "province": "Jawa Timur (Bromo Tengger)",
    "family": "Austronesian (Javanic)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -7.58403,
        113.037
      ],
      [
        -7.65566,
        113.15127
      ],
      [
        -7.72589,
        113.24563
      ],
      [
        -7.81684,
        113.36364
      ],
      [
        -7.94477,
        113.2762
      ],
      [
        -8.05163,
        113.24074
      ],
      [
        -8.14168,
        113.15903
      ],
      [
        -8.06751,
        113.037
      ],
      [
        -8.09125,
        112.93949
      ],
      [
        -8.02733,
        112.86402
      ],
      [
        -7.92443,
        112.88778
      ],
      [
        -7.83719,
        112.80034
      ],
      [
        -7.75018,
        112.85913
      ],
      [
        -7.70609,
        112.94725
      ],
      [
        -7.58403,
        113.037
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kane1243",
        "name": "Kangean",
        "distanceKm": 12.8
      },
      {
        "glottocode": "nucl1460",
        "name": "Madurese",
        "distanceKm": 99.1
      }
    ]
  },
  {
    "glottocode": "indo1316",
    "name": "Standard Indonesian",
    "isocode": "ind",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -7.33458,
    "longitude": 109.716,
    "isNational": true,
    "isFromCsv": false,
    "island": "Jawa & Bali",
    "province": "Nasional (Republik Indonesia)",
    "family": "Austronesian (Malayic)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -7.0644,
        109.716
      ],
      [
        -7.09757,
        109.83108
      ],
      [
        -7.13156,
        109.97268
      ],
      [
        -7.28292,
        109.9442
      ],
      [
        -7.3881,
        109.95244
      ],
      [
        -7.49913,
        109.92405
      ],
      [
        -7.48284,
        109.78799
      ],
      [
        -7.54788,
        109.716
      ],
      [
        -7.53316,
        109.61958
      ],
      [
        -7.433,
        109.59156
      ],
      [
        -7.3905,
        109.46896
      ],
      [
        -7.28052,
        109.47719
      ],
      [
        -7.19769,
        109.54293
      ],
      [
        -7.04724,
        109.57648
      ],
      [
        -7.0644,
        109.716
      ]
    ],
    "neighbors": [
      {
        "glottocode": "java1254",
        "name": "Javanese",
        "distanceKm": 60.1
      }
    ]
  },
  {
    "glottocode": "bali1278",
    "name": "Balinese",
    "isocode": "ban",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.35714,
    "longitude": 115.075,
    "isNational": true,
    "isFromCsv": false,
    "island": "Jawa & Bali",
    "province": "Bali",
    "family": "Austronesian (Bali-Sasak-Sumbawa)",
    "estimatedRadiusKm": 48.0,
    "estimatedAreaKm2": 6659.2,
    "boundaryPolygon": [
      [
        -7.9727,
        115.075
      ],
      [
        -7.93195,
        115.28196
      ],
      [
        -8.15278,
        115.33401
      ],
      [
        -8.28287,
        115.40389
      ],
      [
        -8.44099,
        115.44632
      ],
      [
        -8.50349,
        115.26048
      ],
      [
        -8.64003,
        115.2127
      ],
      [
        -8.69791,
        115.075
      ],
      [
        -8.58535,
        114.96392
      ],
      [
        -8.60495,
        114.76093
      ],
      [
        -8.44425,
        114.68927
      ],
      [
        -8.27962,
        114.7317
      ],
      [
        -8.05132,
        114.6874
      ],
      [
        -7.98664,
        114.89466
      ],
      [
        -7.9727,
        115.075
      ]
    ],
    "neighbors": [
      {
        "glottocode": "bali1279",
        "name": "Balinese Malay",
        "distanceKm": 46.9
      },
      {
        "glottocode": "osin1237",
        "name": "Osing",
        "distanceKm": 86.9
      },
      {
        "glottocode": "sasa1249",
        "name": "Sasak",
        "distanceKm": 135.3
      }
    ]
  },
  {
    "glottocode": "bali1279",
    "name": "Balinese Malay",
    "isocode": "mhp",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.355884,
    "longitude": 114.648391,
    "isNational": true,
    "isFromCsv": false,
    "island": "Jawa & Bali",
    "province": "Bali Barat",
    "family": "Austronesian (Malayic)",
    "estimatedRadiusKm": 48.0,
    "estimatedAreaKm2": 6659.2,
    "boundaryPolygon": [
      [
        -7.90553,
        114.64839
      ],
      [
        -8.08028,
        114.78254
      ],
      [
        -8.16322,
        114.89258
      ],
      [
        -8.27506,
        115.00631
      ],
      [
        -8.40717,
        114.87552
      ],
      [
        -8.55316,
        114.89842
      ],
      [
        -8.67868,
        114.80551
      ],
      [
        -8.63074,
        114.64839
      ],
      [
        -8.73367,
        114.46451
      ],
      [
        -8.61538,
        114.3195
      ],
      [
        -8.43643,
        114.29169
      ],
      [
        -8.2458,
        114.1609
      ],
      [
        -8.101,
        114.32534
      ],
      [
        -8.02528,
        114.48747
      ],
      [
        -7.90553,
        114.64839
      ]
    ],
    "neighbors": [
      {
        "glottocode": "osin1237",
        "name": "Osing",
        "distanceKm": 40.9
      },
      {
        "glottocode": "bali1278",
        "name": "Balinese",
        "distanceKm": 46.9
      }
    ]
  },
  {
    "glottocode": "kend1254",
    "name": "Kendayan-Belangin",
    "isocode": "knx",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 1.47957,
    "longitude": 109.467,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Kalimantan Barat",
    "family": "Austronesian (Malayic Dayak)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        1.66996,
        109.467
      ],
      [
        1.65329,
        109.55069
      ],
      [
        1.62792,
        109.65309
      ],
      [
        1.5144,
        109.61967
      ],
      [
        1.43113,
        109.67932
      ],
      [
        1.32109,
        109.66579
      ],
      [
        1.30007,
        109.55347
      ],
      [
        1.18649,
        109.467
      ],
      [
        1.21769,
        109.34084
      ],
      [
        1.32648,
        109.27496
      ],
      [
        1.40682,
        109.14816
      ],
      [
        1.53871,
        109.20781
      ],
      [
        1.62253,
        109.28767
      ],
      [
        1.73566,
        109.34363
      ],
      [
        1.66996,
        109.467
      ]
    ],
    "neighbors": [
      {
        "glottocode": "beny1237",
        "name": "Benyadu'",
        "distanceKm": 83.5
      }
    ]
  },
  {
    "glottocode": "beny1237",
    "name": "Benyadu'",
    "isocode": "byd",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 0.78534,
    "longitude": 109.753,
    "isNational": true,
    "isFromCsv": false,
    "island": "Kalimantan",
    "province": "Kalimantan Barat",
    "family": "Austronesian (Land Dayak)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        1.00417,
        109.753
      ],
      [
        1.04126,
        109.87626
      ],
      [
        0.90741,
        109.90608
      ],
      [
        0.84574,
        110.01765
      ],
      [
        0.7136,
        110.06735
      ],
      [
        0.62624,
        109.95252
      ],
      [
        0.46036,
        109.90952
      ],
      [
        0.43005,
        109.753
      ],
      [
        0.52399,
        109.62713
      ],
      [
        0.54945,
        109.45717
      ],
      [
        0.71798,
        109.45787
      ],
      [
        0.84135,
        109.50756
      ],
      [
        0.98421,
        109.50361
      ],
      [
        0.97763,
        109.66039
      ],
      [
        1.00417,
        109.753
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kend1254",
        "name": "Kendayan-Belangin",
        "distanceKm": 83.5
      },
      {
        "glottocode": "jang1257",
        "name": "Jangkang",
        "distanceKm": 113.2
      }
    ]
  },
  {
    "glottocode": "jang1257",
    "name": "Jangkang",
    "isocode": "djo",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 0.29738,
    "longitude": 110.647,
    "isNational": true,
    "isFromCsv": false,
    "island": "Kalimantan",
    "province": "Kalimantan Barat",
    "family": "Austronesian (Land Dayak)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        0.58937,
        110.647
      ],
      [
        0.48755,
        110.73858
      ],
      [
        0.47653,
        110.87165
      ],
      [
        0.37371,
        110.98144
      ],
      [
        0.23706,
        110.9113
      ],
      [
        0.06783,
        110.93485
      ],
      [
        -0.02599,
        110.80273
      ],
      [
        0.01525,
        110.647
      ],
      [
        -0.02972,
        110.48947
      ],
      [
        0.11857,
        110.42278
      ],
      [
        0.24596,
        110.4217
      ],
      [
        0.36481,
        110.35156
      ],
      [
        0.42579,
        110.48597
      ],
      [
        0.49128,
        110.55362
      ],
      [
        0.58937,
        110.647
      ]
    ],
    "neighbors": [
      {
        "glottocode": "mual1241",
        "name": "Mualang",
        "distanceKm": 47.8
      },
      {
        "glottocode": "sebe1242",
        "name": "Seberuang",
        "distanceKm": 72.3
      },
      {
        "glottocode": "beny1237",
        "name": "Benyadu'",
        "distanceKm": 113.2
      }
    ]
  },
  {
    "glottocode": "mual1241",
    "name": "Mualang",
    "isocode": "mtd",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 0.31083,
    "longitude": 111.077,
    "isNational": true,
    "isFromCsv": false,
    "island": "Kalimantan",
    "province": "Kalimantan Barat",
    "family": "Austronesian (Ibanic)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        0.54086,
        111.077
      ],
      [
        0.58474,
        111.20891
      ],
      [
        0.53618,
        111.35958
      ],
      [
        0.37367,
        111.35234
      ],
      [
        0.22865,
        111.43704
      ],
      [
        0.08895,
        111.35523
      ],
      [
        0.06881,
        111.19355
      ],
      [
        -0.03327,
        111.077
      ],
      [
        0.06747,
        110.9598
      ],
      [
        0.17821,
        110.9107
      ],
      [
        0.24592,
        110.7926
      ],
      [
        0.35641,
        110.8773
      ],
      [
        0.44691,
        110.90635
      ],
      [
        0.58609,
        110.94444
      ],
      [
        0.54086,
        111.077
      ]
    ],
    "neighbors": [
      {
        "glottocode": "sebe1242",
        "name": "Seberuang",
        "distanceKm": 40.2
      },
      {
        "glottocode": "jang1257",
        "name": "Jangkang",
        "distanceKm": 47.8
      }
    ]
  },
  {
    "glottocode": "sebe1242",
    "name": "Seberuang",
    "isocode": "sbx",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -0.02463,
    "longitude": 111.212,
    "isNational": true,
    "isFromCsv": false,
    "island": "Kalimantan",
    "province": "Kalimantan Barat",
    "family": "Austronesian (Ibanic)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        0.29452,
        111.212
      ],
      [
        0.31372,
        111.37494
      ],
      [
        0.15482,
        111.43703
      ],
      [
        0.0563,
        111.56658
      ],
      [
        -0.1018,
        111.5501
      ],
      [
        -0.18118,
        111.4083
      ],
      [
        -0.3162,
        111.35241
      ],
      [
        -0.27961,
        111.212
      ],
      [
        -0.20355,
        111.12583
      ],
      [
        -0.20314,
        110.98816
      ],
      [
        -0.07146,
        111.00685
      ],
      [
        0.02596,
        110.99036
      ],
      [
        0.17678,
        110.95943
      ],
      [
        0.20107,
        111.10331
      ],
      [
        0.29452,
        111.212
      ]
    ],
    "neighbors": [
      {
        "glottocode": "mual1241",
        "name": "Mualang",
        "distanceKm": 40.2
      },
      {
        "glottocode": "jang1257",
        "name": "Jangkang",
        "distanceKm": 72.3
      }
    ]
  },
  {
    "glottocode": "buka1261",
    "name": "Bukat",
    "isocode": "bvk",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 1.29075,
    "longitude": 113.246,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Kalimantan Barat",
    "family": "Austronesian (Punan-Bukat)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        1.61398,
        113.246
      ],
      [
        1.50825,
        113.35077
      ],
      [
        1.47546,
        113.47768
      ],
      [
        1.35316,
        113.51951
      ],
      [
        1.24735,
        113.43618
      ],
      [
        1.13116,
        113.44617
      ],
      [
        1.10598,
        113.335
      ],
      [
        1.1305,
        113.246
      ],
      [
        1.07266,
        113.14094
      ],
      [
        1.17402,
        113.09959
      ],
      [
        1.24558,
        113.04804
      ],
      [
        1.35494,
        112.96471
      ],
      [
        1.4326,
        113.06808
      ],
      [
        1.54158,
        113.12518
      ],
      [
        1.61398,
        113.246
      ]
    ],
    "neighbors": [
      {
        "glottocode": "hovo1239",
        "name": "Hobongan",
        "distanceKm": 80.0
      },
      {
        "glottocode": "aohe1237",
        "name": "Aoheng-Seputan",
        "distanceKm": 108.4
      }
    ]
  },
  {
    "glottocode": "hovo1239",
    "name": "Hobongan",
    "isocode": "hov",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 0.9841,
    "longitude": 113.897,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Kalimantan Barat",
    "family": "Austronesian (Müller-Schwaner)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        1.2192,
        113.897
      ],
      [
        1.23811,
        114.01934
      ],
      [
        1.15034,
        114.10549
      ],
      [
        1.02391,
        114.07145
      ],
      [
        0.93026,
        114.13293
      ],
      [
        0.85943,
        114.05336
      ],
      [
        0.84098,
        113.96593
      ],
      [
        0.73573,
        113.897
      ],
      [
        0.80252,
        113.80954
      ],
      [
        0.8489,
        113.72744
      ],
      [
        0.91633,
        113.60003
      ],
      [
        1.03784,
        113.66151
      ],
      [
        1.16087,
        113.67531
      ],
      [
        1.27657,
        113.75613
      ],
      [
        1.2192,
        113.897
      ]
    ],
    "neighbors": [
      {
        "glottocode": "aohe1237",
        "name": "Aoheng-Seputan",
        "distanceKm": 28.3
      },
      {
        "glottocode": "buka1261",
        "name": "Bukat",
        "distanceKm": 80.0
      }
    ]
  },
  {
    "glottocode": "otda1235",
    "name": "Ot Danum",
    "isocode": "otd",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -0.3955,
    "longitude": 113.469,
    "isNational": true,
    "isFromCsv": false,
    "island": "Kalimantan",
    "province": "Kalimantan Tengah",
    "family": "Austronesian (Barito Barat)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -0.081,
        113.469
      ],
      [
        -0.12546,
        113.59905
      ],
      [
        -0.27332,
        113.62221
      ],
      [
        -0.33418,
        113.73768
      ],
      [
        -0.44841,
        113.70082
      ],
      [
        -0.51624,
        113.62041
      ],
      [
        -0.67281,
        113.60255
      ],
      [
        -0.65512,
        113.469
      ],
      [
        -0.64273,
        113.34994
      ],
      [
        -0.63128,
        113.17333
      ],
      [
        -0.46193,
        113.17794
      ],
      [
        -0.32066,
        113.14108
      ],
      [
        -0.15828,
        113.17153
      ],
      [
        -0.15554,
        113.35344
      ],
      [
        -0.081,
        113.469
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "ngaj1237",
    "name": "Ngaju",
    "isocode": "nij",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.58463,
    "longitude": 112.794,
    "isNational": true,
    "isFromCsv": false,
    "island": "Kalimantan",
    "province": "Kalimantan Tengah",
    "family": "Austronesian (Barito Barat)",
    "estimatedRadiusKm": 48.0,
    "estimatedAreaKm2": 6659.2,
    "boundaryPolygon": [
      [
        -1.22502,
        112.794
      ],
      [
        -1.37515,
        112.89492
      ],
      [
        -1.37202,
        113.06071
      ],
      [
        -1.51583,
        113.09553
      ],
      [
        -1.64213,
        113.04602
      ],
      [
        -1.84007,
        113.11444
      ],
      [
        -1.90443,
        112.94806
      ],
      [
        -1.95023,
        112.794
      ],
      [
        -2.02855,
        112.58014
      ],
      [
        -1.82418,
        112.4935
      ],
      [
        -1.67721,
        112.38823
      ],
      [
        -1.48076,
        112.33872
      ],
      [
        -1.38791,
        112.54722
      ],
      [
        -1.25103,
        112.63329
      ],
      [
        -1.22502,
        112.794
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "baku1263",
    "name": "Bakumpai",
    "isocode": "bkr",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.98842,
    "longitude": 114.77,
    "isNational": true,
    "isFromCsv": false,
    "island": "Kalimantan",
    "province": "Kalimantan Tengah / Selatan",
    "family": "Austronesian (Barito Barat)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -1.81022,
        114.77
      ],
      [
        -1.74432,
        114.88763
      ],
      [
        -1.82767,
        114.97169
      ],
      [
        -1.93949,
        114.98451
      ],
      [
        -2.06463,
        115.10409
      ],
      [
        -2.17617,
        115.00557
      ],
      [
        -2.25918,
        114.90047
      ],
      [
        -2.38435,
        114.77
      ],
      [
        -2.26159,
        114.63837
      ],
      [
        -2.18564,
        114.52255
      ],
      [
        -2.06724,
        114.42444
      ],
      [
        -1.93687,
        114.54402
      ],
      [
        -1.81821,
        114.55643
      ],
      [
        -1.74191,
        114.65122
      ],
      [
        -1.81022,
        114.77
      ]
    ],
    "neighbors": [
      {
        "glottocode": "maan1238",
        "name": "Ma'anyan",
        "distanceKm": 38.8
      },
      {
        "glottocode": "dusu1267",
        "name": "Dusun Witu",
        "distanceKm": 51.6
      },
      {
        "glottocode": "dusu1271",
        "name": "Dusun Deyah",
        "distanceKm": 89.9
      },
      {
        "glottocode": "tawo1243",
        "name": "Tawoyan",
        "distanceKm": 90.5
      },
      {
        "glottocode": "lawa1257",
        "name": "Lawangan",
        "distanceKm": 124.6
      }
    ]
  },
  {
    "glottocode": "dusu1269",
    "name": "Dusun Malang",
    "isocode": "duq",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -0.85277,
    "longitude": 115.392,
    "isNational": true,
    "isFromCsv": false,
    "island": "Kalimantan",
    "province": "Kalimantan Tengah",
    "family": "Austronesian (Barito Timur)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -0.57459,
        115.392
      ],
      [
        -0.60441,
        115.51161
      ],
      [
        -0.70462,
        115.5778
      ],
      [
        -0.77269,
        115.74289
      ],
      [
        -0.92349,
        115.70188
      ],
      [
        -1.04361,
        115.63133
      ],
      [
        -1.20871,
        115.56343
      ],
      [
        -1.14872,
        115.392
      ],
      [
        -1.12169,
        115.26248
      ],
      [
        -1.06258,
        115.12888
      ],
      [
        -0.90044,
        115.1831
      ],
      [
        -0.79574,
        115.14209
      ],
      [
        -0.68565,
        115.18241
      ],
      [
        -0.69144,
        115.3143
      ],
      [
        -0.57459,
        115.392
      ]
    ],
    "neighbors": [
      {
        "glottocode": "tawo1243",
        "name": "Tawoyan",
        "distanceKm": 54.0
      },
      {
        "glottocode": "tunj1244",
        "name": "Tunjung",
        "distanceKm": 83.0
      },
      {
        "glottocode": "dusu1267",
        "name": "Dusun Witu",
        "distanceKm": 92.4
      },
      {
        "glottocode": "busa1255",
        "name": "Busang Kayan",
        "distanceKm": 98.7
      },
      {
        "glottocode": "ampa1239",
        "name": "Ampanang",
        "distanceKm": 106.6
      }
    ]
  },
  {
    "glottocode": "dusu1267",
    "name": "Dusun Witu",
    "isocode": "duw",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.57408,
    "longitude": 114.979,
    "isNational": true,
    "isFromCsv": false,
    "island": "Kalimantan",
    "province": "Kalimantan Tengah",
    "family": "Austronesian (Barito Timur)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -1.27771,
        114.979
      ],
      [
        -1.34393,
        115.08988
      ],
      [
        -1.34071,
        115.27175
      ],
      [
        -1.5008,
        115.30018
      ],
      [
        -1.64199,
        115.27666
      ],
      [
        -1.81574,
        115.28215
      ],
      [
        -1.82955,
        115.10207
      ],
      [
        -1.85183,
        114.979
      ],
      [
        -1.8612,
        114.84068
      ],
      [
        -1.69867,
        114.82271
      ],
      [
        -1.62855,
        114.74024
      ],
      [
        -1.51424,
        114.71672
      ],
      [
        -1.45778,
        114.83311
      ],
      [
        -1.31228,
        114.85288
      ],
      [
        -1.27771,
        114.979
      ]
    ],
    "neighbors": [
      {
        "glottocode": "tawo1243",
        "name": "Tawoyan",
        "distanceKm": 39.4
      },
      {
        "glottocode": "baku1263",
        "name": "Bakumpai",
        "distanceKm": 51.6
      },
      {
        "glottocode": "maan1238",
        "name": "Ma'anyan",
        "distanceKm": 62.4
      },
      {
        "glottocode": "dusu1271",
        "name": "Dusun Deyah",
        "distanceKm": 78.9
      },
      {
        "glottocode": "dusu1269",
        "name": "Dusun Malang",
        "distanceKm": 92.4
      }
    ]
  },
  {
    "glottocode": "maan1238",
    "name": "Ma'anyan",
    "isocode": "mhy",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.1239,
    "longitude": 115.092,
    "isNational": true,
    "isFromCsv": false,
    "island": "Kalimantan",
    "province": "Kalimantan Tengah / Kalsel",
    "family": "Austronesian (Barito Timur)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -1.85281,
        115.092
      ],
      [
        -1.77807,
        115.25866
      ],
      [
        -1.91534,
        115.35371
      ],
      [
        -2.05764,
        115.3825
      ],
      [
        -2.20721,
        115.45727
      ],
      [
        -2.29083,
        115.30147
      ],
      [
        -2.35491,
        115.20333
      ],
      [
        -2.42694,
        115.092
      ],
      [
        -2.29535,
        115.00938
      ],
      [
        -2.2733,
        114.90453
      ],
      [
        -2.1854,
        114.82239
      ],
      [
        -2.07946,
        114.89715
      ],
      [
        -1.93287,
        114.85229
      ],
      [
        -1.83764,
        114.95405
      ],
      [
        -1.85281,
        115.092
      ]
    ],
    "neighbors": [
      {
        "glottocode": "baku1263",
        "name": "Bakumpai",
        "distanceKm": 38.8
      },
      {
        "glottocode": "dusu1271",
        "name": "Dusun Deyah",
        "distanceKm": 57.2
      },
      {
        "glottocode": "dusu1267",
        "name": "Dusun Witu",
        "distanceKm": 62.4
      },
      {
        "glottocode": "tawo1243",
        "name": "Tawoyan",
        "distanceKm": 92.4
      },
      {
        "glottocode": "lawa1257",
        "name": "Lawangan",
        "distanceKm": 94.2
      }
    ]
  },
  {
    "glottocode": "lawa1257",
    "name": "Lawangan",
    "isocode": "lbx",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.80261,
    "longitude": 115.876,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Kalimantan Tengah / Timur",
    "family": "Austronesian (Barito Timur)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -1.47655,
        115.876
      ],
      [
        -1.54993,
        115.99775
      ],
      [
        -1.65325,
        116.06339
      ],
      [
        -1.73569,
        116.16932
      ],
      [
        -1.84958,
        116.0819
      ],
      [
        -1.92691,
        116.03195
      ],
      [
        -2.02385,
        115.9826
      ],
      [
        -1.96002,
        115.876
      ],
      [
        -1.98552,
        115.78787
      ],
      [
        -1.95469,
        115.68521
      ],
      [
        -1.84328,
        115.69773
      ],
      [
        -1.742,
        115.61032
      ],
      [
        -1.62547,
        115.65377
      ],
      [
        -1.58826,
        115.77272
      ],
      [
        -1.47655,
        115.876
      ]
    ],
    "neighbors": [
      {
        "glottocode": "dusu1271",
        "name": "Dusun Deyah",
        "distanceKm": 37.2
      },
      {
        "glottocode": "tawo1243",
        "name": "Tawoyan",
        "distanceKm": 93.3
      },
      {
        "glottocode": "maan1238",
        "name": "Ma'anyan",
        "distanceKm": 94.2
      },
      {
        "glottocode": "dusu1267",
        "name": "Dusun Witu",
        "distanceKm": 102.9
      },
      {
        "glottocode": "dusu1269",
        "name": "Dusun Malang",
        "distanceKm": 118.5
      }
    ]
  },
  {
    "glottocode": "tawo1243",
    "name": "Tawoyan",
    "isocode": "twy",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.30017,
    "longitude": 115.204,
    "isNational": true,
    "isFromCsv": false,
    "island": "Kalimantan",
    "province": "Kalimantan Tengah",
    "family": "Austronesian (Barito Timur)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -0.97478,
        115.204
      ],
      [
        -1.05984,
        115.31977
      ],
      [
        -1.08959,
        115.46813
      ],
      [
        -1.24795,
        115.43287
      ],
      [
        -1.34933,
        115.41944
      ],
      [
        -1.47841,
        115.42756
      ],
      [
        -1.47164,
        115.2866
      ],
      [
        -1.54891,
        115.204
      ],
      [
        -1.57711,
        115.0706
      ],
      [
        -1.44755,
        115.01914
      ],
      [
        -1.3757,
        114.87299
      ],
      [
        -1.22157,
        114.85956
      ],
      [
        -1.12044,
        114.97857
      ],
      [
        -0.95437,
        115.03743
      ],
      [
        -0.97478,
        115.204
      ]
    ],
    "neighbors": [
      {
        "glottocode": "dusu1267",
        "name": "Dusun Witu",
        "distanceKm": 39.4
      },
      {
        "glottocode": "dusu1269",
        "name": "Dusun Malang",
        "distanceKm": 54.0
      },
      {
        "glottocode": "dusu1271",
        "name": "Dusun Deyah",
        "distanceKm": 83.9
      },
      {
        "glottocode": "baku1263",
        "name": "Bakumpai",
        "distanceKm": 90.5
      },
      {
        "glottocode": "maan1238",
        "name": "Ma'anyan",
        "distanceKm": 92.4
      }
    ]
  },
  {
    "glottocode": "dusu1271",
    "name": "Dusun Deyah",
    "isocode": "dun",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.95514,
    "longitude": 115.578,
    "isNational": true,
    "isFromCsv": false,
    "island": "Kalimantan",
    "province": "Kalimantan Selatan",
    "family": "Austronesian (Barito Timur)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -1.70859,
        115.578
      ],
      [
        -1.66802,
        115.71635
      ],
      [
        -1.81673,
        115.75167
      ],
      [
        -1.90828,
        115.78342
      ],
      [
        -2.01892,
        115.85759
      ],
      [
        -2.07996,
        115.73462
      ],
      [
        -2.19062,
        115.69147
      ],
      [
        -2.28272,
        115.578
      ],
      [
        -2.18529,
        115.4671
      ],
      [
        -2.17469,
        115.30254
      ],
      [
        -2.03604,
        115.22337
      ],
      [
        -1.89116,
        115.29753
      ],
      [
        -1.722,
        115.28548
      ],
      [
        -1.67335,
        115.44222
      ],
      [
        -1.70859,
        115.578
      ]
    ],
    "neighbors": [
      {
        "glottocode": "lawa1257",
        "name": "Lawangan",
        "distanceKm": 37.2
      },
      {
        "glottocode": "maan1238",
        "name": "Ma'anyan",
        "distanceKm": 57.2
      },
      {
        "glottocode": "dusu1267",
        "name": "Dusun Witu",
        "distanceKm": 78.9
      },
      {
        "glottocode": "tawo1243",
        "name": "Tawoyan",
        "distanceKm": 83.9
      },
      {
        "glottocode": "baku1263",
        "name": "Bakumpai",
        "distanceKm": 89.9
      }
    ]
  },
  {
    "glottocode": "banj1239",
    "name": "Banjar",
    "isocode": "bjn",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 0.747105,
    "longitude": 115.79,
    "isNational": true,
    "isFromCsv": false,
    "island": "Kalimantan",
    "province": "Kalimantan Selatan & Timur",
    "family": "Austronesian (Malayic)",
    "estimatedRadiusKm": 65.0,
    "estimatedAreaKm2": 12211.4,
    "boundaryPolygon": [
      [
        1.26394,
        115.79
      ],
      [
        1.07751,
        115.94913
      ],
      [
        0.96758,
        116.0665
      ],
      [
        0.85894,
        116.28001
      ],
      [
        0.66506,
        116.1495
      ],
      [
        0.45154,
        116.16066
      ],
      [
        0.21084,
        116.04827
      ],
      [
        0.28188,
        115.79
      ],
      [
        0.19271,
        115.52299
      ],
      [
        0.35528,
        115.29863
      ],
      [
        0.64041,
        115.32249
      ],
      [
        0.88359,
        115.19198
      ],
      [
        1.06385,
        115.39279
      ],
      [
        1.09564,
        115.62214
      ],
      [
        1.26394,
        115.79
      ]
    ],
    "neighbors": [
      {
        "glottocode": "baha1257",
        "name": "Bahau",
        "distanceKm": 70.5
      },
      {
        "glottocode": "moda1244",
        "name": "Modang",
        "distanceKm": 87.3
      },
      {
        "glottocode": "busa1255",
        "name": "Busang Kayan",
        "distanceKm": 90.2
      },
      {
        "glottocode": "tunj1244",
        "name": "Tunjung",
        "distanceKm": 115.8
      },
      {
        "glottocode": "kota1275",
        "name": "Kota Bangun Kutai Malay",
        "distanceKm": 126.4
      }
    ]
  },
  {
    "glottocode": "teng1267",
    "name": "Tenggarong Kutai Malay",
    "isocode": "vkt",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 0.71803,
    "longitude": 117.645,
    "isNational": true,
    "isFromCsv": false,
    "island": "Kalimantan",
    "province": "Kalimantan Timur",
    "family": "Austronesian (Malayic)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        0.9311,
        117.645
      ],
      [
        0.90686,
        117.73594
      ],
      [
        0.90922,
        117.88477
      ],
      [
        0.77025,
        117.87382
      ],
      [
        0.65265,
        117.93148
      ],
      [
        0.48969,
        117.93136
      ],
      [
        0.46214,
        117.76824
      ],
      [
        0.35697,
        117.645
      ],
      [
        0.38959,
        117.48682
      ],
      [
        0.55126,
        117.43586
      ],
      [
        0.6425,
        117.31404
      ],
      [
        0.7804,
        117.37171
      ],
      [
        0.84765,
        117.48245
      ],
      [
        0.97941,
        117.51912
      ],
      [
        0.9311,
        117.645
      ]
    ],
    "neighbors": [
      {
        "glottocode": "basa1286",
        "name": "Basap",
        "distanceKm": 84.1
      },
      {
        "glottocode": "bera1262",
        "name": "Berau Malay",
        "distanceKm": 110.5
      },
      {
        "glottocode": "moda1244",
        "name": "Modang",
        "distanceKm": 119.6
      }
    ]
  },
  {
    "glottocode": "kota1275",
    "name": "Kota Bangun Kutai Malay",
    "isocode": "mqg",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -0.27049,
    "longitude": 116.297,
    "isNational": true,
    "isFromCsv": false,
    "island": "Kalimantan",
    "province": "Kalimantan Timur",
    "family": "Austronesian (Malayic)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -0.05196,
        116.297
      ],
      [
        0.02107,
        116.43741
      ],
      [
        -0.11122,
        116.49672
      ],
      [
        -0.20171,
        116.59837
      ],
      [
        -0.35512,
        116.66778
      ],
      [
        -0.45141,
        116.52387
      ],
      [
        -0.59093,
        116.45132
      ],
      [
        -0.62609,
        116.297
      ],
      [
        -0.4962,
        116.1883
      ],
      [
        -0.46918,
        116.04785
      ],
      [
        -0.32946,
        116.03863
      ],
      [
        -0.22736,
        116.10804
      ],
      [
        -0.09345,
        116.07499
      ],
      [
        -0.07366,
        116.20221
      ],
      [
        -0.05196,
        116.297
      ]
    ],
    "neighbors": [
      {
        "glottocode": "tunj1244",
        "name": "Tunjung",
        "distanceKm": 46.1
      },
      {
        "glottocode": "ampa1239",
        "name": "Ampanang",
        "distanceKm": 58.3
      },
      {
        "glottocode": "busa1255",
        "name": "Busang Kayan",
        "distanceKm": 105.3
      },
      {
        "glottocode": "dusu1269",
        "name": "Dusun Malang",
        "distanceKm": 119.7
      },
      {
        "glottocode": "moda1244",
        "name": "Modang",
        "distanceKm": 123.8
      }
    ]
  },
  {
    "glottocode": "ampa1239",
    "name": "Ampanang",
    "isocode": "apg",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -0.79259,
    "longitude": 116.349,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Kalimantan Timur",
    "family": "Austronesian (Barito Timur)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -0.50405,
        116.349
      ],
      [
        -0.58355,
        116.44968
      ],
      [
        -0.62413,
        116.56026
      ],
      [
        -0.71977,
        116.66809
      ],
      [
        -0.84689,
        116.58694
      ],
      [
        -0.97318,
        116.57547
      ],
      [
        -1.05198,
        116.47393
      ],
      [
        -0.98752,
        116.349
      ],
      [
        -1.01914,
        116.23989
      ],
      [
        -0.92557,
        116.18223
      ],
      [
        -0.82735,
        116.19669
      ],
      [
        -0.73931,
        116.11554
      ],
      [
        -0.67174,
        116.19744
      ],
      [
        -0.61638,
        116.26414
      ],
      [
        -0.50405,
        116.349
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kota1275",
        "name": "Kota Bangun Kutai Malay",
        "distanceKm": 58.3
      },
      {
        "glottocode": "tunj1244",
        "name": "Tunjung",
        "distanceKm": 76.2
      },
      {
        "glottocode": "dusu1269",
        "name": "Dusun Malang",
        "distanceKm": 106.6
      },
      {
        "glottocode": "lawa1257",
        "name": "Lawangan",
        "distanceKm": 124.0
      },
      {
        "glottocode": "tawo1243",
        "name": "Tawoyan",
        "distanceKm": 139.2
      }
    ]
  },
  {
    "glottocode": "tunj1244",
    "name": "Tunjung",
    "isocode": "tjg",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -0.29048,
    "longitude": 115.883,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Kalimantan Timur",
    "family": "Austronesian (Barito Timur)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -0.04403,
        115.883
      ],
      [
        -0.04214,
        116.00259
      ],
      [
        -0.08554,
        116.13999
      ],
      [
        -0.23745,
        116.11536
      ],
      [
        -0.35177,
        116.15152
      ],
      [
        -0.46129,
        116.09719
      ],
      [
        -0.45183,
        115.9607
      ],
      [
        -0.5275,
        115.883
      ],
      [
        -0.47774,
        115.79282
      ],
      [
        -0.38698,
        115.76199
      ],
      [
        -0.34503,
        115.644
      ],
      [
        -0.24418,
        115.68016
      ],
      [
        -0.15984,
        115.71919
      ],
      [
        -0.01624,
        115.75093
      ],
      [
        -0.04403,
        115.883
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kota1275",
        "name": "Kota Bangun Kutai Malay",
        "distanceKm": 46.1
      },
      {
        "glottocode": "busa1255",
        "name": "Busang Kayan",
        "distanceKm": 64.7
      },
      {
        "glottocode": "ampa1239",
        "name": "Ampanang",
        "distanceKm": 76.2
      },
      {
        "glottocode": "dusu1269",
        "name": "Dusun Malang",
        "distanceKm": 83.0
      },
      {
        "glottocode": "baha1257",
        "name": "Bahau",
        "distanceKm": 90.5
      }
    ]
  },
  {
    "glottocode": "baha1257",
    "name": "Bahau",
    "isocode": "bhv",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 0.30801,
    "longitude": 115.332,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Kalimantan Timur",
    "family": "Austronesian (Kayanic)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        0.58374,
        115.332
      ],
      [
        0.60036,
        115.47279
      ],
      [
        0.4502,
        115.51031
      ],
      [
        0.3655,
        115.58387
      ],
      [
        0.25027,
        115.585
      ],
      [
        0.20491,
        115.46129
      ],
      [
        0.10382,
        115.43033
      ],
      [
        0.10026,
        115.332
      ],
      [
        0.16476,
        115.26301
      ],
      [
        0.14876,
        115.1323
      ],
      [
        0.25791,
        115.11251
      ],
      [
        0.35785,
        115.11364
      ],
      [
        0.50635,
        115.08329
      ],
      [
        0.53942,
        115.22056
      ],
      [
        0.58374,
        115.332
      ]
    ],
    "neighbors": [
      {
        "glottocode": "busa1255",
        "name": "Busang Kayan",
        "distanceKm": 31.3
      },
      {
        "glottocode": "banj1239",
        "name": "Banjar",
        "distanceKm": 70.5
      },
      {
        "glottocode": "tunj1244",
        "name": "Tunjung",
        "distanceKm": 90.5
      },
      {
        "glottocode": "kota1275",
        "name": "Kota Bangun Kutai Malay",
        "distanceKm": 125.1
      },
      {
        "glottocode": "dusu1269",
        "name": "Dusun Malang",
        "distanceKm": 129.2
      }
    ]
  },
  {
    "glottocode": "busa1255",
    "name": "Busang Kayan",
    "isocode": "bfg",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 0.03494,
    "longitude": 115.401,
    "isNational": true,
    "isFromCsv": false,
    "island": "Kalimantan",
    "province": "Kalimantan Timur",
    "family": "Austronesian (Kayanic)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        0.40928,
        115.401
      ],
      [
        0.2645,
        115.51155
      ],
      [
        0.21282,
        115.62406
      ],
      [
        0.10007,
        115.68637
      ],
      [
        -0.00613,
        115.58095
      ],
      [
        -0.12896,
        115.60652
      ],
      [
        -0.1932,
        115.51087
      ],
      [
        -0.16484,
        115.401
      ],
      [
        -0.25277,
        115.26245
      ],
      [
        -0.14514,
        115.17519
      ],
      [
        -0.02768,
        115.12664
      ],
      [
        0.12162,
        115.02122
      ],
      [
        0.229,
        115.15765
      ],
      [
        0.32407,
        115.26176
      ],
      [
        0.40928,
        115.401
      ]
    ],
    "neighbors": [
      {
        "glottocode": "baha1257",
        "name": "Bahau",
        "distanceKm": 31.3
      },
      {
        "glottocode": "tunj1244",
        "name": "Tunjung",
        "distanceKm": 64.7
      },
      {
        "glottocode": "banj1239",
        "name": "Banjar",
        "distanceKm": 90.2
      },
      {
        "glottocode": "dusu1269",
        "name": "Dusun Malang",
        "distanceKm": 98.7
      },
      {
        "glottocode": "kota1275",
        "name": "Kota Bangun Kutai Malay",
        "distanceKm": 105.3
      }
    ]
  },
  {
    "glottocode": "aohe1237",
    "name": "Aoheng-Seputan",
    "isocode": "pni",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 0.87404,
    "longitude": 114.127,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Kalimantan Timur",
    "family": "Austronesian (Kayan-Kenyah)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        1.07366,
        114.127
      ],
      [
        1.07507,
        114.22382
      ],
      [
        1.02162,
        114.31209
      ],
      [
        0.90753,
        114.27377
      ],
      [
        0.82472,
        114.34313
      ],
      [
        0.73445,
        114.30206
      ],
      [
        0.71071,
        114.20567
      ],
      [
        0.59019,
        114.127
      ],
      [
        0.63947,
        114.01403
      ],
      [
        0.72018,
        113.93405
      ],
      [
        0.79995,
        113.80236
      ],
      [
        0.9323,
        113.87172
      ],
      [
        1.03589,
        113.92402
      ],
      [
        1.1463,
        113.99587
      ],
      [
        1.07366,
        114.127
      ]
    ],
    "neighbors": [
      {
        "glottocode": "hovo1239",
        "name": "Hobongan",
        "distanceKm": 28.3
      },
      {
        "glottocode": "buka1261",
        "name": "Bukat",
        "distanceKm": 108.4
      }
    ]
  },
  {
    "glottocode": "moda1244",
    "name": "Modang",
    "isocode": "mxd",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 0.80793,
    "longitude": 116.573,
    "isNational": true,
    "isFromCsv": false,
    "island": "Kalimantan",
    "province": "Kalimantan Timur",
    "family": "Austronesian (Kayanic)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        1.05589,
        116.573
      ],
      [
        1.05561,
        116.69229
      ],
      [
        0.91993,
        116.71345
      ],
      [
        0.86799,
        116.83616
      ],
      [
        0.74488,
        116.84928
      ],
      [
        0.66247,
        116.75542
      ],
      [
        0.48879,
        116.72671
      ],
      [
        0.48176,
        116.573
      ],
      [
        0.53834,
        116.44316
      ],
      [
        0.56196,
        116.26454
      ],
      [
        0.74023,
        116.27637
      ],
      [
        0.87263,
        116.2895
      ],
      [
        1.02043,
        116.30651
      ],
      [
        1.00606,
        116.47758
      ],
      [
        1.05589,
        116.573
      ]
    ],
    "neighbors": [
      {
        "glottocode": "banj1239",
        "name": "Banjar",
        "distanceKm": 87.3
      },
      {
        "glottocode": "teng1267",
        "name": "Tenggarong Kutai Malay",
        "distanceKm": 119.6
      },
      {
        "glottocode": "kota1275",
        "name": "Kota Bangun Kutai Malay",
        "distanceKm": 123.8
      },
      {
        "glottocode": "sega1243",
        "name": "Segai",
        "distanceKm": 136.7
      }
    ]
  },
  {
    "glottocode": "sega1243",
    "name": "Segai",
    "isocode": "sge",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 1.97695,
    "longitude": 116.954,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Kalimantan Timur",
    "family": "Austronesian (Kayanic)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        2.20863,
        116.954
      ],
      [
        2.11894,
        117.02242
      ],
      [
        2.12492,
        117.13966
      ],
      [
        2.03389,
        117.2036
      ],
      [
        1.92981,
        117.16066
      ],
      [
        1.78346,
        117.19677
      ],
      [
        1.72047,
        117.07759
      ],
      [
        1.72516,
        116.954
      ],
      [
        1.68335,
        116.81252
      ],
      [
        1.82348,
        116.76144
      ],
      [
        1.9263,
        116.73197
      ],
      [
        2.03739,
        116.68903
      ],
      [
        2.0849,
        116.81855
      ],
      [
        2.15606,
        116.86769
      ],
      [
        2.20863,
        116.954
      ]
    ],
    "neighbors": [
      {
        "glottocode": "bolo1268",
        "name": "Bolongan",
        "distanceKm": 94.8
      },
      {
        "glottocode": "bera1262",
        "name": "Berau Malay",
        "distanceKm": 114.2
      },
      {
        "glottocode": "puna1266",
        "name": "Punan Tubu",
        "distanceKm": 125.7
      },
      {
        "glottocode": "basa1286",
        "name": "Basap",
        "distanceKm": 126.4
      },
      {
        "glottocode": "moda1244",
        "name": "Modang",
        "distanceKm": 136.7
      }
    ]
  },
  {
    "glottocode": "bera1262",
    "name": "Berau Malay",
    "isocode": "bve",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 1.6687,
    "longitude": 117.934,
    "isNational": true,
    "isFromCsv": false,
    "island": "Kalimantan",
    "province": "Kalimantan Timur (Berau)",
    "family": "Austronesian (Malayic)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        1.86915,
        117.934
      ],
      [
        1.93656,
        118.06305
      ],
      [
        1.87138,
        118.18826
      ],
      [
        1.72829,
        118.19518
      ],
      [
        1.58458,
        118.30272
      ],
      [
        1.45444,
        118.20279
      ],
      [
        1.40541,
        118.06085
      ],
      [
        1.29502,
        117.934
      ],
      [
        1.41929,
        117.81384
      ],
      [
        1.51342,
        117.7392
      ],
      [
        1.60053,
        117.63521
      ],
      [
        1.71233,
        117.74275
      ],
      [
        1.8124,
        117.75373
      ],
      [
        1.92268,
        117.81164
      ],
      [
        1.86915,
        117.934
      ]
    ],
    "neighbors": [
      {
        "glottocode": "basa1286",
        "name": "Basap",
        "distanceKm": 28.3
      },
      {
        "glottocode": "teng1267",
        "name": "Tenggarong Kutai Malay",
        "distanceKm": 110.5
      },
      {
        "glottocode": "sega1243",
        "name": "Segai",
        "distanceKm": 114.2
      }
    ]
  },
  {
    "glottocode": "basa1286",
    "name": "Basap",
    "isocode": "bdb",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 1.41405,
    "longitude": 117.942,
    "isNational": true,
    "isFromCsv": false,
    "island": "Kalimantan",
    "province": "Kalimantan Timur (Sangkulirang)",
    "family": "Austronesian (Land Dayak)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        1.72822,
        117.942
      ],
      [
        1.72463,
        118.09161
      ],
      [
        1.58856,
        118.1609
      ],
      [
        1.49893,
        118.314
      ],
      [
        1.33782,
        118.27608
      ],
      [
        1.23975,
        118.16063
      ],
      [
        1.09317,
        118.09657
      ],
      [
        1.15409,
        117.942
      ],
      [
        1.20735,
        117.84243
      ],
      [
        1.2306,
        117.71189
      ],
      [
        1.37118,
        117.7541
      ],
      [
        1.46558,
        117.71618
      ],
      [
        1.59771,
        117.71162
      ],
      [
        1.61044,
        117.84739
      ],
      [
        1.72822,
        117.942
      ]
    ],
    "neighbors": [
      {
        "glottocode": "bera1262",
        "name": "Berau Malay",
        "distanceKm": 28.3
      },
      {
        "glottocode": "teng1267",
        "name": "Tenggarong Kutai Malay",
        "distanceKm": 84.1
      },
      {
        "glottocode": "sega1243",
        "name": "Segai",
        "distanceKm": 126.4
      }
    ]
  },
  {
    "glottocode": "bolo1268",
    "name": "Bolongan",
    "isocode": "blj",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 2.75927,
    "longitude": 117.293,
    "isNational": true,
    "isFromCsv": false,
    "island": "Kalimantan",
    "province": "Kalimantan Utara",
    "family": "Austronesian (Kayan-Murik)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        3.1199,
        117.293
      ],
      [
        3.0173,
        117.4174
      ],
      [
        2.99503,
        117.58898
      ],
      [
        2.83387,
        117.6202
      ],
      [
        2.70089,
        117.54907
      ],
      [
        2.54949,
        117.55636
      ],
      [
        2.53941,
        117.399
      ],
      [
        2.54577,
        117.293
      ],
      [
        2.50003,
        117.16801
      ],
      [
        2.63707,
        117.13959
      ],
      [
        2.70611,
        117.05982
      ],
      [
        2.82865,
        116.98868
      ],
      [
        2.90745,
        117.10697
      ],
      [
        3.05668,
        117.14961
      ],
      [
        3.1199,
        117.293
      ]
    ],
    "neighbors": [
      {
        "glottocode": "buru1304",
        "name": "Burusu",
        "distanceKm": 74.6
      },
      {
        "glottocode": "sega1243",
        "name": "Segai",
        "distanceKm": 94.8
      },
      {
        "glottocode": "puna1266",
        "name": "Punan Tubu",
        "distanceKm": 115.4
      },
      {
        "glottocode": "puto1237",
        "name": "Putoh",
        "distanceKm": 119.9
      }
    ]
  },
  {
    "glottocode": "buru1304",
    "name": "Burusu",
    "isocode": "bqr",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 3.36912,
    "longitude": 117.012,
    "isNational": true,
    "isFromCsv": false,
    "island": "Kalimantan",
    "province": "Kalimantan Utara",
    "family": "Austronesian (Kayanic)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        3.65554,
        117.012
      ],
      [
        3.70094,
        117.17207
      ],
      [
        3.57039,
        117.26482
      ],
      [
        3.42309,
        117.24889
      ],
      [
        3.2986,
        117.32151
      ],
      [
        3.22494,
        117.19311
      ],
      [
        3.18621,
        117.10024
      ],
      [
        3.08142,
        117.012
      ],
      [
        3.18367,
        116.92254
      ],
      [
        3.21243,
        116.81517
      ],
      [
        3.29534,
        116.68819
      ],
      [
        3.42635,
        116.7608
      ],
      [
        3.5829,
        116.74346
      ],
      [
        3.70348,
        116.8507
      ],
      [
        3.65554,
        117.012
      ]
    ],
    "neighbors": [
      {
        "glottocode": "puto1237",
        "name": "Putoh",
        "distanceKm": 63.5
      },
      {
        "glottocode": "bolo1268",
        "name": "Bolongan",
        "distanceKm": 74.6
      },
      {
        "glottocode": "abai1241",
        "name": "Abai Tubu-Abai Sembuak",
        "distanceKm": 95.9
      },
      {
        "glottocode": "semb1240",
        "name": "Sembakung Murut",
        "distanceKm": 97.6
      },
      {
        "glottocode": "puna1266",
        "name": "Punan Tubu",
        "distanceKm": 100.3
      }
    ]
  },
  {
    "glottocode": "abai1241",
    "name": "Abai Tubu-Abai Sembuak",
    "isocode": "",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 3.524226,
    "longitude": 116.162455,
    "isNational": true,
    "isFromCsv": true,
    "island": "Kalimantan",
    "province": "Kalimantan Utara (Malinau)",
    "family": "Austronesian (Murutic)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        3.87715,
        116.16245
      ],
      [
        3.80094,
        116.29596
      ],
      [
        3.66293,
        116.33671
      ],
      [
        3.59094,
        116.45529
      ],
      [
        3.4745,
        116.38072
      ],
      [
        3.40015,
        116.31833
      ],
      [
        3.25921,
        116.29032
      ],
      [
        3.30302,
        116.16245
      ],
      [
        3.28367,
        116.04639
      ],
      [
        3.30497,
        115.88699
      ],
      [
        3.46318,
        115.8945
      ],
      [
        3.60226,
        115.81992
      ],
      [
        3.75812,
        115.86861
      ],
      [
        3.77648,
        116.04075
      ],
      [
        3.87715,
        116.16245
      ]
    ],
    "neighbors": [
      {
        "glottocode": "puto1237",
        "name": "Putoh",
        "distanceKm": 33.0
      },
      {
        "glottocode": "puna1266",
        "name": "Punan Tubu",
        "distanceKm": 73.6
      },
      {
        "glottocode": "buru1304",
        "name": "Burusu",
        "distanceKm": 95.9
      },
      {
        "glottocode": "semb1240",
        "name": "Sembakung Murut",
        "distanceKm": 104.8
      },
      {
        "glottocode": "lund1271",
        "name": "Lundayeh",
        "distanceKm": 109.2
      }
    ]
  },
  {
    "glottocode": "puto1237",
    "name": "Putoh",
    "isocode": "put",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 3.42467,
    "longitude": 116.443,
    "isNational": true,
    "isFromCsv": false,
    "island": "Kalimantan",
    "province": "Kalimantan Utara",
    "family": "Austronesian (Lun Bawang)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        3.71503,
        116.443
      ],
      [
        3.6088,
        116.53183
      ],
      [
        3.60367,
        116.66786
      ],
      [
        3.47404,
        116.6597
      ],
      [
        3.37979,
        116.63999
      ],
      [
        3.2337,
        116.6829
      ],
      [
        3.20803,
        116.54751
      ],
      [
        3.14091,
        116.443
      ],
      [
        3.09153,
        116.28228
      ],
      [
        3.2457,
        116.21818
      ],
      [
        3.34629,
        116.09896
      ],
      [
        3.50754,
        116.07926
      ],
      [
        3.59166,
        116.23323
      ],
      [
        3.7253,
        116.29796
      ],
      [
        3.71503,
        116.443
      ]
    ],
    "neighbors": [
      {
        "glottocode": "abai1241",
        "name": "Abai Tubu-Abai Sembuak",
        "distanceKm": 33.0
      },
      {
        "glottocode": "buru1304",
        "name": "Burusu",
        "distanceKm": 63.5
      },
      {
        "glottocode": "puna1266",
        "name": "Punan Tubu",
        "distanceKm": 65.0
      },
      {
        "glottocode": "semb1240",
        "name": "Sembakung Murut",
        "distanceKm": 97.0
      },
      {
        "glottocode": "bolo1268",
        "name": "Bolongan",
        "distanceKm": 119.9
      }
    ]
  },
  {
    "glottocode": "lund1271",
    "name": "Lundayeh",
    "isocode": "lnd",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 4.25064,
    "longitude": 115.5,
    "isNational": true,
    "isFromCsv": false,
    "island": "Kalimantan",
    "province": "Kalimantan Utara (Krayan)",
    "family": "Austronesian (Kelabitic)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        4.44101,
        115.5
      ],
      [
        4.50309,
        115.62191
      ],
      [
        4.39216,
        115.67796
      ],
      [
        4.2975,
        115.70586
      ],
      [
        4.17884,
        115.81544
      ],
      [
        4.08763,
        115.70497
      ],
      [
        3.98101,
        115.63021
      ],
      [
        3.86688,
        115.5
      ],
      [
        3.98582,
        115.37212
      ],
      [
        4.0342,
        115.22785
      ],
      [
        4.16974,
        115.14459
      ],
      [
        4.3066,
        115.25416
      ],
      [
        4.44559,
        115.25487
      ],
      [
        4.49828,
        115.38042
      ],
      [
        4.44101,
        115.5
      ]
    ],
    "neighbors": [
      {
        "glottocode": "okol1241",
        "name": "Okolod",
        "distanceKm": 42.7
      },
      {
        "glottocode": "abai1241",
        "name": "Abai Tubu-Abai Sembuak",
        "distanceKm": 109.2
      },
      {
        "glottocode": "puto1237",
        "name": "Putoh",
        "distanceKm": 139.2
      }
    ]
  },
  {
    "glottocode": "semb1240",
    "name": "Sembakung Murut",
    "isocode": "sbr",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 4.22102,
    "longitude": 116.799,
    "isNational": true,
    "isFromCsv": false,
    "island": "Kalimantan",
    "province": "Kalimantan Utara (Nunukan)",
    "family": "Austronesian (Murutic)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        4.50086,
        116.799
      ],
      [
        4.43586,
        116.90274
      ],
      [
        4.36088,
        116.97486
      ],
      [
        4.29695,
        117.13258
      ],
      [
        4.1583,
        117.07455
      ],
      [
        4.02689,
        117.04309
      ],
      [
        3.86778,
        116.96957
      ],
      [
        3.92674,
        116.799
      ],
      [
        3.91859,
        116.65296
      ],
      [
        4.00292,
        116.52477
      ],
      [
        4.1692,
        116.57133
      ],
      [
        4.28605,
        116.5133
      ],
      [
        4.38486,
        116.593
      ],
      [
        4.38505,
        116.71979
      ],
      [
        4.50086,
        116.799
      ]
    ],
    "neighbors": [
      {
        "glottocode": "puto1237",
        "name": "Putoh",
        "distanceKm": 97.0
      },
      {
        "glottocode": "buru1304",
        "name": "Burusu",
        "distanceKm": 97.6
      },
      {
        "glottocode": "abai1241",
        "name": "Abai Tubu-Abai Sembuak",
        "distanceKm": 104.8
      },
      {
        "glottocode": "okol1241",
        "name": "Okolod",
        "distanceKm": 121.3
      }
    ]
  },
  {
    "glottocode": "okol1241",
    "name": "Okolod",
    "isocode": "kqv",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 4.53989,
    "longitude": 115.753,
    "isNational": true,
    "isFromCsv": false,
    "island": "Kalimantan",
    "province": "Kalimantan Utara (Nunukan)",
    "family": "Austronesian (Murutic)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        4.79505,
        115.753
      ],
      [
        4.75707,
        115.85792
      ],
      [
        4.76417,
        116.03512
      ],
      [
        4.60653,
        116.04588
      ],
      [
        4.46907,
        116.06426
      ],
      [
        4.29438,
        116.06183
      ],
      [
        4.28021,
        115.87845
      ],
      [
        4.22092,
        115.753
      ],
      [
        4.2398,
        115.60803
      ],
      [
        4.40621,
        115.58484
      ],
      [
        4.47877,
        115.48439
      ],
      [
        4.59682,
        115.50277
      ],
      [
        4.65234,
        115.61155
      ],
      [
        4.79748,
        115.62856
      ],
      [
        4.79505,
        115.753
      ]
    ],
    "neighbors": [
      {
        "glottocode": "lund1271",
        "name": "Lundayeh",
        "distanceKm": 42.7
      },
      {
        "glottocode": "semb1240",
        "name": "Sembakung Murut",
        "distanceKm": 121.3
      },
      {
        "glottocode": "abai1241",
        "name": "Abai Tubu-Abai Sembuak",
        "distanceKm": 121.7
      }
    ]
  },
  {
    "glottocode": "puna1266",
    "name": "Punan Tubu",
    "isocode": "puj",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 2.86972,
    "longitude": 116.26,
    "isNational": true,
    "isFromCsv": false,
    "island": "Kalimantan",
    "province": "Kalimantan Utara",
    "family": "Austronesian (Punan)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        3.12825,
        116.26
      ],
      [
        3.20831,
        116.42326
      ],
      [
        3.06446,
        116.50451
      ],
      [
        2.94068,
        116.57128
      ],
      [
        2.78321,
        116.63948
      ],
      [
        2.69724,
        116.47655
      ],
      [
        2.60053,
        116.3898
      ],
      [
        2.55412,
        116.26
      ],
      [
        2.69104,
        116.17385
      ],
      [
        2.7065,
        116.05507
      ],
      [
        2.81292,
        116.01085
      ],
      [
        2.91097,
        116.07905
      ],
      [
        3.0552,
        116.02712
      ],
      [
        3.11781,
        116.14038
      ],
      [
        3.12825,
        116.26
      ]
    ],
    "neighbors": [
      {
        "glottocode": "puto1237",
        "name": "Putoh",
        "distanceKm": 65.0
      },
      {
        "glottocode": "abai1241",
        "name": "Abai Tubu-Abai Sembuak",
        "distanceKm": 73.6
      },
      {
        "glottocode": "buru1304",
        "name": "Burusu",
        "distanceKm": 100.3
      },
      {
        "glottocode": "bolo1268",
        "name": "Bolongan",
        "distanceKm": 115.4
      },
      {
        "glottocode": "sega1243",
        "name": "Segai",
        "distanceKm": 125.7
      }
    ]
  },
  {
    "glottocode": "buol1237",
    "name": "Buol",
    "isocode": "blf",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 0.97727,
    "longitude": 121.519,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tengah (Buol)",
    "family": "Austronesian (Gorontalo-Mongondow)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        1.30359,
        121.519
      ],
      [
        1.21943,
        121.63563
      ],
      [
        1.14155,
        121.72503
      ],
      [
        1.04804,
        121.82913
      ],
      [
        0.92834,
        121.73341
      ],
      [
        0.83169,
        121.70158
      ],
      [
        0.74989,
        121.62852
      ],
      [
        0.82011,
        121.519
      ],
      [
        0.78383,
        121.42583
      ],
      [
        0.8401,
        121.34697
      ],
      [
        0.94046,
        121.35771
      ],
      [
        1.03592,
        121.26198
      ],
      [
        1.13313,
        121.32352
      ],
      [
        1.18548,
        121.41872
      ],
      [
        1.30359,
        121.519
      ]
    ],
    "neighbors": [
      {
        "glottocode": "toli1245",
        "name": "Totoli",
        "distanceKm": 74.1
      },
      {
        "glottocode": "dond1249",
        "name": "Dondo",
        "distanceKm": 92.3
      },
      {
        "glottocode": "tomi1243",
        "name": "Tomini",
        "distanceKm": 93.0
      },
      {
        "glottocode": "goro1259",
        "name": "Gorontalo",
        "distanceKm": 94.0
      }
    ]
  },
  {
    "glottocode": "toli1245",
    "name": "Totoli",
    "isocode": "txe",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 1.14995,
    "longitude": 120.875,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tengah (Tolitoli)",
    "family": "Austronesian (Tomini-Tolitoli)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        1.41891,
        120.875
      ],
      [
        1.37811,
        120.9849
      ],
      [
        1.34002,
        121.11339
      ],
      [
        1.19562,
        121.07515
      ],
      [
        1.10183,
        121.08586
      ],
      [
        0.999,
        121.06432
      ],
      [
        1.01275,
        120.94108
      ],
      [
        0.93543,
        120.875
      ],
      [
        0.94251,
        120.77508
      ],
      [
        1.03858,
        120.73532
      ],
      [
        1.08804,
        120.6037
      ],
      [
        1.20942,
        120.61441
      ],
      [
        1.30044,
        120.68625
      ],
      [
        1.44835,
        120.73127
      ],
      [
        1.41891,
        120.875
      ]
    ],
    "neighbors": [
      {
        "glottocode": "dond1249",
        "name": "Dondo",
        "distanceKm": 42.8
      },
      {
        "glottocode": "buol1237",
        "name": "Buol",
        "distanceKm": 74.1
      },
      {
        "glottocode": "tomi1243",
        "name": "Tomini",
        "distanceKm": 80.6
      },
      {
        "glottocode": "damp1237",
        "name": "Dampelas",
        "distanceKm": 88.3
      },
      {
        "glottocode": "lauj1238",
        "name": "Lauje",
        "distanceKm": 98.8
      }
    ]
  },
  {
    "glottocode": "dond1249",
    "name": "Dondo",
    "isocode": "dok",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 0.80348,
    "longitude": 120.707,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tengah (Tolitoli)",
    "family": "Austronesian (Tomini-Tolitoli)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        1.04233,
        120.707
      ],
      [
        1.06423,
        120.83258
      ],
      [
        0.92256,
        120.85634
      ],
      [
        0.84837,
        120.90368
      ],
      [
        0.75089,
        120.93744
      ],
      [
        0.70807,
        120.82665
      ],
      [
        0.60553,
        120.80234
      ],
      [
        0.55885,
        120.707
      ],
      [
        0.62863,
        120.62279
      ],
      [
        0.62112,
        120.47831
      ],
      [
        0.74078,
        120.43228
      ],
      [
        0.85847,
        120.46604
      ],
      [
        1.00951,
        120.44862
      ],
      [
        1.04113,
        120.59254
      ],
      [
        1.04233,
        120.707
      ]
    ],
    "neighbors": [
      {
        "glottocode": "toli1245",
        "name": "Totoli",
        "distanceKm": 42.8
      },
      {
        "glottocode": "tomi1243",
        "name": "Tomini",
        "distanceKm": 46.7
      },
      {
        "glottocode": "damp1237",
        "name": "Dampelas",
        "distanceKm": 55.4
      },
      {
        "glottocode": "lauj1238",
        "name": "Lauje",
        "distanceKm": 59.5
      },
      {
        "glottocode": "buol1237",
        "name": "Buol",
        "distanceKm": 92.3
      }
    ]
  },
  {
    "glottocode": "tomi1243",
    "name": "Tomini",
    "isocode": "txm",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 0.42569,
    "longitude": 120.89,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tengah (Parigi Moutong)",
    "family": "Austronesian (Tomini-Tolitoli)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        0.69934,
        120.89
      ],
      [
        0.58699,
        120.96768
      ],
      [
        0.54506,
        121.03969
      ],
      [
        0.47819,
        121.12002
      ],
      [
        0.39022,
        121.0454
      ],
      [
        0.28266,
        121.06936
      ],
      [
        0.18999,
        121.00351
      ],
      [
        0.21586,
        120.89
      ],
      [
        0.1514,
        120.7579
      ],
      [
        0.24362,
        120.66168
      ],
      [
        0.37061,
        120.64865
      ],
      [
        0.49781,
        120.57403
      ],
      [
        0.5841,
        120.69135
      ],
      [
        0.62558,
        120.79373
      ],
      [
        0.69934,
        120.89
      ]
    ],
    "neighbors": [
      {
        "glottocode": "dond1249",
        "name": "Dondo",
        "distanceKm": 46.7
      },
      {
        "glottocode": "lauj1238",
        "name": "Lauje",
        "distanceKm": 70.4
      },
      {
        "glottocode": "toli1245",
        "name": "Totoli",
        "distanceKm": 80.6
      },
      {
        "glottocode": "damp1237",
        "name": "Dampelas",
        "distanceKm": 80.7
      },
      {
        "glottocode": "buol1237",
        "name": "Buol",
        "distanceKm": 93.0
      }
    ]
  },
  {
    "glottocode": "lauj1238",
    "name": "Lauje",
    "isocode": "law",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 0.50708,
    "longitude": 120.262,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tengah (Parigi Moutong)",
    "family": "Austronesian (Tomini-Tolitoli)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        0.67807,
        120.262
      ],
      [
        0.67507,
        120.3429
      ],
      [
        0.65736,
        120.45046
      ],
      [
        0.54506,
        120.4284
      ],
      [
        0.45319,
        120.49813
      ],
      [
        0.33292,
        120.4804
      ],
      [
        0.30529,
        120.35918
      ],
      [
        0.1946,
        120.262
      ],
      [
        0.23948,
        120.13312
      ],
      [
        0.35592,
        120.07245
      ],
      [
        0.43747,
        119.95702
      ],
      [
        0.56077,
        120.02676
      ],
      [
        0.63436,
        120.10239
      ],
      [
        0.74089,
        120.1494
      ],
      [
        0.67807,
        120.262
      ]
    ],
    "neighbors": [
      {
        "glottocode": "damp1237",
        "name": "Dampelas",
        "distanceKm": 22.2
      },
      {
        "glottocode": "dond1249",
        "name": "Dondo",
        "distanceKm": 59.5
      },
      {
        "glottocode": "tomi1243",
        "name": "Tomini",
        "distanceKm": 70.4
      },
      {
        "glottocode": "pend1242",
        "name": "Pendau",
        "distanceKm": 82.1
      },
      {
        "glottocode": "bala1314",
        "name": "Balaesang",
        "distanceKm": 89.4
      }
    ]
  },
  {
    "glottocode": "taje1237",
    "name": "Taje",
    "isocode": "pee",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -0.72583,
    "longitude": 120.078,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tengah (Sigi)",
    "family": "Austronesian (Tomini-Tolitoli)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -0.53873,
        120.078
      ],
      [
        -0.49954,
        120.18698
      ],
      [
        -0.61012,
        120.22311
      ],
      [
        -0.6688,
        120.32787
      ],
      [
        -0.79165,
        120.36641
      ],
      [
        -0.87219,
        120.26155
      ],
      [
        -1.01002,
        120.21487
      ],
      [
        -1.02221,
        120.078
      ],
      [
        -0.93514,
        119.9772
      ],
      [
        -0.91156,
        119.84508
      ],
      [
        -0.77639,
        119.85648
      ],
      [
        -0.68407,
        119.89502
      ],
      [
        -0.57075,
        119.88352
      ],
      [
        -0.57443,
        120.00508
      ],
      [
        -0.53873,
        120.078
      ]
    ],
    "neighbors": [
      {
        "glottocode": "ledo1238",
        "name": "Ledo Kaili",
        "distanceKm": 34.4
      },
      {
        "glottocode": "tajio1246",
        "name": "Tajio",
        "distanceKm": 46.2
      },
      {
        "glottocode": "unde1235",
        "name": "Unde Kaili",
        "distanceKm": 47.4
      },
      {
        "glottocode": "lind1248",
        "name": "Tado-Lindu",
        "distanceKm": 70.3
      },
      {
        "glottocode": "pend1242",
        "name": "Pendau",
        "distanceKm": 72.2
      }
    ]
  },
  {
    "glottocode": "tajio1246",
    "name": "Tajio",
    "isocode": "tdj",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -0.31553,
    "longitude": 120.01,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tengah (Parigi Moutong)",
    "family": "Austronesian (Tomini-Tolitoli)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -0.05036,
        120.01
      ],
      [
        -0.13315,
        120.09783
      ],
      [
        -0.14738,
        120.22086
      ],
      [
        -0.24672,
        120.31148
      ],
      [
        -0.36912,
        120.24481
      ],
      [
        -0.51052,
        120.25451
      ],
      [
        -0.57718,
        120.13601
      ],
      [
        -0.53383,
        120.01
      ],
      [
        -0.56874,
        119.88806
      ],
      [
        -0.44882,
        119.84286
      ],
      [
        -0.3543,
        119.84012
      ],
      [
        -0.26154,
        119.77345
      ],
      [
        -0.20908,
        119.87651
      ],
      [
        -0.14159,
        119.92623
      ],
      [
        -0.05036,
        120.01
      ]
    ],
    "neighbors": [
      {
        "glottocode": "pend1242",
        "name": "Pendau",
        "distanceKm": 27.8
      },
      {
        "glottocode": "bala1314",
        "name": "Balaesang",
        "distanceKm": 45.9
      },
      {
        "glottocode": "taje1237",
        "name": "Taje",
        "distanceKm": 46.2
      },
      {
        "glottocode": "unde1235",
        "name": "Unde Kaili",
        "distanceKm": 71.1
      },
      {
        "glottocode": "ledo1238",
        "name": "Ledo Kaili",
        "distanceKm": 80.6
      }
    ]
  },
  {
    "glottocode": "damp1237",
    "name": "Dampelas",
    "isocode": "dms",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 0.70234,
    "longitude": 120.219,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tengah (Donggala)",
    "family": "Austronesian (Tomini-Tolitoli)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        0.9216,
        120.219
      ],
      [
        0.95514,
        120.34075
      ],
      [
        0.90069,
        120.46774
      ],
      [
        0.75609,
        120.4545
      ],
      [
        0.63458,
        120.51592
      ],
      [
        0.52771,
        120.438
      ],
      [
        0.52032,
        120.30666
      ],
      [
        0.43812,
        120.219
      ],
      [
        0.51954,
        120.13096
      ],
      [
        0.59925,
        120.08972
      ],
      [
        0.6485,
        119.98311
      ],
      [
        0.74216,
        120.04453
      ],
      [
        0.82915,
        120.05997
      ],
      [
        0.95592,
        120.09687
      ],
      [
        0.9216,
        120.219
      ]
    ],
    "neighbors": [
      {
        "glottocode": "lauj1238",
        "name": "Lauje",
        "distanceKm": 22.2
      },
      {
        "glottocode": "dond1249",
        "name": "Dondo",
        "distanceKm": 55.4
      },
      {
        "glottocode": "tomi1243",
        "name": "Tomini",
        "distanceKm": 80.7
      },
      {
        "glottocode": "toli1245",
        "name": "Totoli",
        "distanceKm": 88.3
      },
      {
        "glottocode": "pend1242",
        "name": "Pendau",
        "distanceKm": 99.1
      }
    ]
  },
  {
    "glottocode": "bala1314",
    "name": "Balaesang",
    "isocode": "bls",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -0.05644,
    "longitude": 119.689,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tengah (Donggala)",
    "family": "Austronesian (Tomini-Tolitoli)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        0.23092,
        119.689
      ],
      [
        0.23332,
        119.82854
      ],
      [
        0.09117,
        119.8741
      ],
      [
        0.00845,
        119.97331
      ],
      [
        -0.11583,
        119.9492
      ],
      [
        -0.17202,
        119.83393
      ],
      [
        -0.28109,
        119.79718
      ],
      [
        -0.25256,
        119.689
      ],
      [
        -0.20227,
        119.61877
      ],
      [
        -0.21027,
        119.49611
      ],
      [
        -0.09913,
        119.50195
      ],
      [
        -0.00825,
        119.47785
      ],
      [
        0.12942,
        119.45594
      ],
      [
        0.15451,
        119.58741
      ],
      [
        0.23092,
        119.689
      ]
    ],
    "neighbors": [
      {
        "glottocode": "pend1242",
        "name": "Pendau",
        "distanceKm": 20.3
      },
      {
        "glottocode": "tajio1246",
        "name": "Tajio",
        "distanceKm": 45.9
      },
      {
        "glottocode": "taje1237",
        "name": "Taje",
        "distanceKm": 86.1
      },
      {
        "glottocode": "unde1235",
        "name": "Unde Kaili",
        "distanceKm": 89.2
      },
      {
        "glottocode": "lauj1238",
        "name": "Lauje",
        "distanceKm": 89.4
      }
    ]
  },
  {
    "glottocode": "pend1242",
    "name": "Pendau",
    "isocode": "ums",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -0.11396,
    "longitude": 119.862,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tengah (Donggala)",
    "family": "Austronesian (Tomini-Tolitoli)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        0.20545,
        119.862
      ],
      [
        0.09066,
        119.96054
      ],
      [
        0.05773,
        120.07729
      ],
      [
        -0.05774,
        120.10834
      ],
      [
        -0.15186,
        120.02805
      ],
      [
        -0.26241,
        120.04815
      ],
      [
        -0.28922,
        119.9464
      ],
      [
        -0.27802,
        119.862
      ],
      [
        -0.34494,
        119.75077
      ],
      [
        -0.24372,
        119.69929
      ],
      [
        -0.16532,
        119.63698
      ],
      [
        -0.04428,
        119.55669
      ],
      [
        0.03903,
        119.67015
      ],
      [
        0.14638,
        119.73663
      ],
      [
        0.20545,
        119.862
      ]
    ],
    "neighbors": [
      {
        "glottocode": "bala1314",
        "name": "Balaesang",
        "distanceKm": 20.3
      },
      {
        "glottocode": "tajio1246",
        "name": "Tajio",
        "distanceKm": 27.8
      },
      {
        "glottocode": "taje1237",
        "name": "Taje",
        "distanceKm": 72.2
      },
      {
        "glottocode": "lauj1238",
        "name": "Lauje",
        "distanceKm": 82.1
      },
      {
        "glottocode": "unde1235",
        "name": "Unde Kaili",
        "distanceKm": 85.4
      }
    ]
  },
  {
    "glottocode": "daak1235",
    "name": "Da'a Kaili",
    "isocode": "kzf",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.21051,
    "longitude": 119.527,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tengah (Palu & Sigi)",
    "family": "Austronesian (Kaili-Pamona)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -0.99668,
        119.527
      ],
      [
        -0.97848,
        119.63876
      ],
      [
        -1.06126,
        119.7142
      ],
      [
        -1.17521,
        119.68168
      ],
      [
        -1.26207,
        119.75295
      ],
      [
        -1.3343,
        119.68226
      ],
      [
        -1.36504,
        119.60143
      ],
      [
        -1.48016,
        119.527
      ],
      [
        -1.41408,
        119.42895
      ],
      [
        -1.3627,
        119.33612
      ],
      [
        -1.2828,
        119.21022
      ],
      [
        -1.15449,
        119.28149
      ],
      [
        -1.03285,
        119.30418
      ],
      [
        -0.92944,
        119.39161
      ],
      [
        -0.99668,
        119.527
      ]
    ],
    "neighbors": [
      {
        "glottocode": "unde1235",
        "name": "Unde Kaili",
        "distanceKm": 42.3
      },
      {
        "glottocode": "moma1242",
        "name": "Moma",
        "distanceKm": 58.9
      },
      {
        "glottocode": "lind1248",
        "name": "Tado-Lindu",
        "distanceKm": 61.8
      },
      {
        "glottocode": "ledo1238",
        "name": "Ledo Kaili",
        "distanceKm": 70.2
      },
      {
        "glottocode": "umaa1242",
        "name": "Uma",
        "distanceKm": 73.6
      }
    ]
  },
  {
    "glottocode": "ledo1238",
    "name": "Ledo Kaili",
    "isocode": "lew",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.03033,
    "longitude": 120.132,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tengah (Lembah Palu)",
    "family": "Austronesian (Kaili-Pamona)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -0.79024,
        120.132
      ],
      [
        -0.82413,
        120.23132
      ],
      [
        -0.93578,
        120.25059
      ],
      [
        -0.97897,
        120.35706
      ],
      [
        -1.0766,
        120.33474
      ],
      [
        -1.14452,
        120.27522
      ],
      [
        -1.28701,
        120.25563
      ],
      [
        -1.27371,
        120.132
      ],
      [
        -1.25973,
        120.02151
      ],
      [
        -1.23722,
        119.87253
      ],
      [
        -1.08655,
        119.88563
      ],
      [
        -0.96901,
        119.86331
      ],
      [
        -0.84308,
        119.89716
      ],
      [
        -0.85141,
        120.04582
      ],
      [
        -0.79024,
        120.132
      ]
    ],
    "neighbors": [
      {
        "glottocode": "taje1237",
        "name": "Taje",
        "distanceKm": 34.4
      },
      {
        "glottocode": "lind1248",
        "name": "Tado-Lindu",
        "distanceKm": 37.2
      },
      {
        "glottocode": "moma1242",
        "name": "Moma",
        "distanceKm": 46.6
      },
      {
        "glottocode": "sedo1237",
        "name": "Sedoa",
        "distanceKm": 46.9
      },
      {
        "glottocode": "napu1241",
        "name": "Napu",
        "distanceKm": 50.7
      }
    ]
  },
  {
    "glottocode": "unde1235",
    "name": "Unde Kaili",
    "isocode": "unz",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -0.85876,
    "longitude": 119.673,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tengah (Banawa)",
    "family": "Austronesian (Kaili-Pamona)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -0.63614,
        119.673
      ],
      [
        -0.72341,
        119.73819
      ],
      [
        -0.71202,
        119.85703
      ],
      [
        -0.80941,
        119.88924
      ],
      [
        -0.90269,
        119.86549
      ],
      [
        -1.04592,
        119.90772
      ],
      [
        -1.09169,
        119.78519
      ],
      [
        -1.11962,
        119.673
      ],
      [
        -1.15901,
        119.52839
      ],
      [
        -1.01346,
        119.47899
      ],
      [
        -0.91699,
        119.41783
      ],
      [
        -0.79511,
        119.39408
      ],
      [
        -0.74448,
        119.52968
      ],
      [
        -0.65609,
        119.57539
      ],
      [
        -0.63614,
        119.673
      ]
    ],
    "neighbors": [
      {
        "glottocode": "daak1235",
        "name": "Da'a Kaili",
        "distanceKm": 42.3
      },
      {
        "glottocode": "taje1237",
        "name": "Taje",
        "distanceKm": 47.4
      },
      {
        "glottocode": "ledo1238",
        "name": "Ledo Kaili",
        "distanceKm": 54.5
      },
      {
        "glottocode": "lind1248",
        "name": "Tado-Lindu",
        "distanceKm": 70.4
      },
      {
        "glottocode": "tajio1246",
        "name": "Tajio",
        "distanceKm": 71.1
      }
    ]
  },
  {
    "glottocode": "lind1248",
    "name": "Tado-Lindu",
    "isocode": "klw",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.35748,
    "longitude": 120.063,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tengah (Danau Lindu)",
    "family": "Austronesian (Kaili-Pamona)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -1.203,
        120.063
      ],
      [
        -1.13709,
        120.16916
      ],
      [
        -1.20869,
        120.24963
      ],
      [
        -1.31021,
        120.27016
      ],
      [
        -1.42725,
        120.36879
      ],
      [
        -1.52568,
        120.27397
      ],
      [
        -1.59341,
        120.17665
      ],
      [
        -1.68648,
        120.063
      ],
      [
        -1.57269,
        119.95933
      ],
      [
        -1.51013,
        119.87153
      ],
      [
        -1.41779,
        119.79868
      ],
      [
        -1.31967,
        119.8973
      ],
      [
        -1.22424,
        119.89587
      ],
      [
        -1.15781,
        119.96682
      ],
      [
        -1.203,
        120.063
      ]
    ],
    "neighbors": [
      {
        "glottocode": "moma1242",
        "name": "Moma",
        "distanceKm": 10.2
      },
      {
        "glottocode": "napu1241",
        "name": "Napu",
        "distanceKm": 31.8
      },
      {
        "glottocode": "sedo1237",
        "name": "Sedoa",
        "distanceKm": 35.1
      },
      {
        "glottocode": "ledo1238",
        "name": "Ledo Kaili",
        "distanceKm": 37.2
      },
      {
        "glottocode": "umaa1242",
        "name": "Uma",
        "distanceKm": 40.0
      }
    ]
  },
  {
    "glottocode": "sedo1237",
    "name": "Sedoa",
    "isocode": "tvw",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.37295,
    "longitude": 120.378,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tengah (Lore Utara)",
    "family": "Austronesian (Kaili-Pamona)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -1.11566,
        120.378
      ],
      [
        -1.14166,
        120.48942
      ],
      [
        -1.2319,
        120.55492
      ],
      [
        -1.301,
        120.69332
      ],
      [
        -1.43435,
        120.64711
      ],
      [
        -1.53337,
        120.57922
      ],
      [
        -1.66091,
        120.51671
      ],
      [
        -1.59914,
        120.378
      ],
      [
        -1.57725,
        120.27959
      ],
      [
        -1.53334,
        120.17682
      ],
      [
        -1.40858,
        120.22183
      ],
      [
        -1.32677,
        120.17562
      ],
      [
        -1.23193,
        120.20111
      ],
      [
        -1.22531,
        120.30688
      ],
      [
        -1.11566,
        120.378
      ]
    ],
    "neighbors": [
      {
        "glottocode": "napu1241",
        "name": "Napu",
        "distanceKm": 8.4
      },
      {
        "glottocode": "beso1237",
        "name": "Besoa",
        "distanceKm": 25.4
      },
      {
        "glottocode": "lind1248",
        "name": "Tado-Lindu",
        "distanceKm": 35.1
      },
      {
        "glottocode": "moma1242",
        "name": "Moma",
        "distanceKm": 41.5
      },
      {
        "glottocode": "ledo1238",
        "name": "Ledo Kaili",
        "distanceKm": 46.9
      }
    ]
  },
  {
    "glottocode": "beso1237",
    "name": "Besoa",
    "isocode": "bep",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.60095,
    "longitude": 120.379,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tengah (Lore Tengah)",
    "family": "Austronesian (Kaili-Pamona)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -1.32693,
        120.379
      ],
      [
        -1.38741,
        120.48188
      ],
      [
        -1.39632,
        120.63569
      ],
      [
        -1.53941,
        120.64873
      ],
      [
        -1.65603,
        120.6204
      ],
      [
        -1.79189,
        120.61853
      ],
      [
        -1.7918,
        120.47094
      ],
      [
        -1.8104,
        120.379
      ],
      [
        -1.823,
        120.27202
      ],
      [
        -1.69776,
        120.25755
      ],
      [
        -1.64699,
        120.17719
      ],
      [
        -1.54844,
        120.14886
      ],
      [
        -1.49045,
        120.24038
      ],
      [
        -1.3562,
        120.26109
      ],
      [
        -1.32693,
        120.379
      ]
    ],
    "neighbors": [
      {
        "glottocode": "napu1241",
        "name": "Napu",
        "distanceKm": 18.8
      },
      {
        "glottocode": "bada1261",
        "name": "Bada (Indonesia)",
        "distanceKm": 23.4
      },
      {
        "glottocode": "sedo1237",
        "name": "Sedoa",
        "distanceKm": 25.4
      },
      {
        "glottocode": "lind1248",
        "name": "Tado-Lindu",
        "distanceKm": 44.3
      },
      {
        "glottocode": "moma1242",
        "name": "Moma",
        "distanceKm": 45.2
      }
    ]
  },
  {
    "glottocode": "bada1261",
    "name": "Bada (Indonesia)",
    "isocode": "bhz",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.80249,
    "longitude": 120.319,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tengah (Lembah Bada)",
    "family": "Austronesian (Kaili-Pamona)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -1.55913,
        120.319
      ],
      [
        -1.50746,
        120.46115
      ],
      [
        -1.63306,
        120.53157
      ],
      [
        -1.75053,
        120.54678
      ],
      [
        -1.86714,
        120.60239
      ],
      [
        -1.92577,
        120.47366
      ],
      [
        -1.97799,
        120.40356
      ],
      [
        -2.0426,
        120.319
      ],
      [
        -1.94306,
        120.25127
      ],
      [
        -1.9345,
        120.15338
      ],
      [
        -1.85811,
        120.07519
      ],
      [
        -1.75956,
        120.1308
      ],
      [
        -1.62433,
        120.09548
      ],
      [
        -1.5424,
        120.19368
      ],
      [
        -1.55913,
        120.319
      ]
    ],
    "neighbors": [
      {
        "glottocode": "beso1237",
        "name": "Besoa",
        "distanceKm": 23.4
      },
      {
        "glottocode": "umaa1242",
        "name": "Uma",
        "distanceKm": 40.5
      },
      {
        "glottocode": "napu1241",
        "name": "Napu",
        "distanceKm": 40.7
      },
      {
        "glottocode": "sedo1237",
        "name": "Sedoa",
        "distanceKm": 48.2
      },
      {
        "glottocode": "moma1242",
        "name": "Moma",
        "distanceKm": 53.8
      }
    ]
  },
  {
    "glottocode": "moma1242",
    "name": "Moma",
    "isocode": "myl",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.4313,
    "longitude": 120.009,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tengah (Kulawi)",
    "family": "Austronesian (Kaili-Pamona)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -1.1102,
        120.009
      ],
      [
        -1.19493,
        120.12287
      ],
      [
        -1.2961,
        120.17859
      ],
      [
        -1.37024,
        120.2766
      ],
      [
        -1.47264,
        120.19019
      ],
      [
        -1.54623,
        120.15316
      ],
      [
        -1.6467,
        120.11276
      ],
      [
        -1.59368,
        120.009
      ],
      [
        -1.63052,
        119.91303
      ],
      [
        -1.59754,
        119.80048
      ],
      [
        -1.47783,
        119.8051
      ],
      [
        -1.36506,
        119.71869
      ],
      [
        -1.24478,
        119.77504
      ],
      [
        -1.2111,
        119.90293
      ],
      [
        -1.1102,
        120.009
      ]
    ],
    "neighbors": [
      {
        "glottocode": "lind1248",
        "name": "Tado-Lindu",
        "distanceKm": 10.2
      },
      {
        "glottocode": "umaa1242",
        "name": "Uma",
        "distanceKm": 30.7
      },
      {
        "glottocode": "napu1241",
        "name": "Napu",
        "distanceKm": 36.6
      },
      {
        "glottocode": "sedo1237",
        "name": "Sedoa",
        "distanceKm": 41.5
      },
      {
        "glottocode": "beso1237",
        "name": "Besoa",
        "distanceKm": 45.2
      }
    ]
  },
  {
    "glottocode": "umaa1242",
    "name": "Uma",
    "isocode": "ppk",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.70416,
    "longitude": 119.968,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tengah (Pipikoro)",
    "family": "Austronesian (Kaili-Pamona)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -1.4544,
        119.968
      ],
      [
        -1.52456,
        120.05453
      ],
      [
        -1.5422,
        120.17118
      ],
      [
        -1.66462,
        120.14132
      ],
      [
        -1.74401,
        120.14269
      ],
      [
        -1.85602,
        120.15851
      ],
      [
        -1.86067,
        120.0434
      ],
      [
        -1.93787,
        119.968
      ],
      [
        -1.96015,
        119.84466
      ],
      [
        -1.84364,
        119.79302
      ],
      [
        -1.7722,
        119.66976
      ],
      [
        -1.63643,
        119.67113
      ],
      [
        -1.55458,
        119.78035
      ],
      [
        -1.42507,
        119.83354
      ],
      [
        -1.4544,
        119.968
      ]
    ],
    "neighbors": [
      {
        "glottocode": "moma1242",
        "name": "Moma",
        "distanceKm": 30.7
      },
      {
        "glottocode": "lind1248",
        "name": "Tado-Lindu",
        "distanceKm": 40.0
      },
      {
        "glottocode": "bada1261",
        "name": "Bada (Indonesia)",
        "distanceKm": 40.5
      },
      {
        "glottocode": "beso1237",
        "name": "Besoa",
        "distanceKm": 47.1
      },
      {
        "glottocode": "napu1241",
        "name": "Napu",
        "distanceKm": 50.7
      }
    ]
  },
  {
    "glottocode": "napu1241",
    "name": "Napu",
    "isocode": "npy",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.43707,
    "longitude": 120.338,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tengah (Lore)",
    "family": "Austronesian (Kaili-Pamona)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -1.25409,
        120.338
      ],
      [
        -1.21326,
        120.44582
      ],
      [
        -1.32819,
        120.47458
      ],
      [
        -1.39712,
        120.51308
      ],
      [
        -1.49339,
        120.58484
      ],
      [
        -1.55476,
        120.48563
      ],
      [
        -1.66026,
        120.44552
      ],
      [
        -1.73757,
        120.338
      ],
      [
        -1.64885,
        120.23598
      ],
      [
        -1.62963,
        120.09646
      ],
      [
        -1.5047,
        120.04158
      ],
      [
        -1.38581,
        120.11334
      ],
      [
        -1.25332,
        120.10751
      ],
      [
        -1.22467,
        120.23568
      ],
      [
        -1.25409,
        120.338
      ]
    ],
    "neighbors": [
      {
        "glottocode": "sedo1237",
        "name": "Sedoa",
        "distanceKm": 8.4
      },
      {
        "glottocode": "beso1237",
        "name": "Besoa",
        "distanceKm": 18.8
      },
      {
        "glottocode": "lind1248",
        "name": "Tado-Lindu",
        "distanceKm": 31.8
      },
      {
        "glottocode": "moma1242",
        "name": "Moma",
        "distanceKm": 36.6
      },
      {
        "glottocode": "bada1261",
        "name": "Bada (Indonesia)",
        "distanceKm": 40.7
      }
    ]
  },
  {
    "glottocode": "pamo1252",
    "name": "Pamona",
    "isocode": "pmf",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.62663,
    "longitude": 121.268,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tengah (Poso)",
    "family": "Austronesian (Kaili-Pamona)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -1.38495,
        121.268
      ],
      [
        -1.46699,
        121.34491
      ],
      [
        -1.51108,
        121.41295
      ],
      [
        -1.5673,
        121.52803
      ],
      [
        -1.67243,
        121.46876
      ],
      [
        -1.78949,
        121.4723
      ],
      [
        -1.90943,
        121.40425
      ],
      [
        -1.86842,
        121.268
      ],
      [
        -1.90259,
        121.13505
      ],
      [
        -1.81252,
        121.03481
      ],
      [
        -1.67489,
        121.05649
      ],
      [
        -1.56485,
        120.99722
      ],
      [
        -1.48805,
        121.09415
      ],
      [
        -1.47384,
        121.19439
      ],
      [
        -1.38495,
        121.268
      ]
    ],
    "neighbors": [
      {
        "glottocode": "mori1269",
        "name": "Mori Atas",
        "distanceKm": 74.6
      },
      {
        "glottocode": "baho1237",
        "name": "Bahonsuai",
        "distanceKm": 82.6
      },
      {
        "glottocode": "beso1237",
        "name": "Besoa",
        "distanceKm": 98.9
      },
      {
        "glottocode": "sedo1237",
        "name": "Sedoa",
        "distanceKm": 102.9
      },
      {
        "glottocode": "mori1268",
        "name": "Mori Bawah",
        "distanceKm": 104.4
      }
    ]
  },
  {
    "glottocode": "salu1253",
    "name": "Saluan",
    "isocode": "loe",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -0.873,
    "longitude": 122.746,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tengah (Luwuk Banggai)",
    "family": "Austronesian (Saluan-Banggai)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -0.68775,
        122.746
      ],
      [
        -0.6968,
        122.83087
      ],
      [
        -0.69688,
        122.96688
      ],
      [
        -0.82338,
        122.96343
      ],
      [
        -0.93358,
        123.01147
      ],
      [
        -1.07428,
        122.99842
      ],
      [
        -1.09206,
        122.85151
      ],
      [
        -1.17122,
        122.746
      ],
      [
        -1.13239,
        122.62107
      ],
      [
        -0.99832,
        122.58884
      ],
      [
        -0.93096,
        122.49202
      ],
      [
        -0.826,
        122.54006
      ],
      [
        -0.77284,
        122.62038
      ],
      [
        -0.65646,
        122.64171
      ],
      [
        -0.68775,
        122.746
      ]
    ],
    "neighbors": [
      {
        "glottocode": "andi1257",
        "name": "Andio",
        "distanceKm": 47.6
      },
      {
        "glottocode": "batu1260",
        "name": "Batui",
        "distanceKm": 51.3
      },
      {
        "glottocode": "bala1315",
        "name": "Balantak",
        "distanceKm": 60.4
      },
      {
        "glottocode": "bang1368",
        "name": "Banggai",
        "distanceKm": 92.0
      },
      {
        "glottocode": "bobo1255",
        "name": "Bobongko",
        "distanceKm": 107.5
      }
    ]
  },
  {
    "glottocode": "bala1315",
    "name": "Balantak",
    "isocode": "blz",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -0.86809,
    "longitude": 123.289,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tengah (Balantak)",
    "family": "Austronesian (Saluan-Banggai)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -0.6593,
        123.289
      ],
      [
        -0.59886,
        123.41867
      ],
      [
        -0.71951,
        123.47534
      ],
      [
        -0.80594,
        123.56133
      ],
      [
        -0.94071,
        123.60721
      ],
      [
        -1.0171,
        123.47587
      ],
      [
        -1.12522,
        123.41284
      ],
      [
        -1.14277,
        123.289
      ],
      [
        -1.03446,
        123.20887
      ],
      [
        -1.02095,
        123.0973
      ],
      [
        -0.91352,
        123.08992
      ],
      [
        -0.83313,
        123.13581
      ],
      [
        -0.71565,
        123.09783
      ],
      [
        -0.68962,
        123.20304
      ],
      [
        -0.6593,
        123.289
      ]
    ],
    "neighbors": [
      {
        "glottocode": "andi1257",
        "name": "Andio",
        "distanceKm": 12.9
      },
      {
        "glottocode": "salu1253",
        "name": "Saluan",
        "distanceKm": 60.4
      },
      {
        "glottocode": "bang1368",
        "name": "Banggai",
        "distanceKm": 80.6
      },
      {
        "glottocode": "batu1260",
        "name": "Batui",
        "distanceKm": 99.0
      }
    ]
  },
  {
    "glottocode": "andi1257",
    "name": "Andio",
    "isocode": "bzb",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -0.88368,
    "longitude": 123.174,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tengah (Banggai)",
    "family": "Austronesian (Saluan-Banggai)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -0.56999,
        123.174
      ],
      [
        -0.65838,
        123.28251
      ],
      [
        -0.70834,
        123.3939
      ],
      [
        -0.81154,
        123.49011
      ],
      [
        -0.93484,
        123.39819
      ],
      [
        -1.05149,
        123.38445
      ],
      [
        -1.11821,
        123.28696
      ],
      [
        -1.05347,
        123.174
      ],
      [
        -1.09398,
        123.07271
      ],
      [
        -1.00978,
        123.01586
      ],
      [
        -0.91912,
        123.0187
      ],
      [
        -0.82726,
        122.92678
      ],
      [
        -0.75004,
        123.00641
      ],
      [
        -0.68261,
        123.07716
      ],
      [
        -0.56999,
        123.174
      ]
    ],
    "neighbors": [
      {
        "glottocode": "bala1315",
        "name": "Balantak",
        "distanceKm": 12.9
      },
      {
        "glottocode": "salu1253",
        "name": "Saluan",
        "distanceKm": 47.6
      },
      {
        "glottocode": "bang1368",
        "name": "Banggai",
        "distanceKm": 77.8
      },
      {
        "glottocode": "batu1260",
        "name": "Batui",
        "distanceKm": 86.8
      }
    ]
  },
  {
    "glottocode": "batu1260",
    "name": "Batui",
    "isocode": "zbt",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.254442,
    "longitude": 122.487151,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tengah (Batui)",
    "family": "Austronesian (Saluan-Banggai)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -0.99744,
        122.48715
      ],
      [
        -1.00437,
        122.60761
      ],
      [
        -1.05696,
        122.73485
      ],
      [
        -1.20612,
        122.69889
      ],
      [
        -1.31035,
        122.73214
      ],
      [
        -1.40828,
        122.6801
      ],
      [
        -1.39697,
        122.55581
      ],
      [
        -1.48092,
        122.48715
      ],
      [
        -1.43997,
        122.39778
      ],
      [
        -1.3584,
        122.35676
      ],
      [
        -1.31371,
        122.22743
      ],
      [
        -1.20276,
        122.26067
      ],
      [
        -1.10684,
        122.30202
      ],
      [
        -0.96138,
        122.34598
      ],
      [
        -0.99744,
        122.48715
      ]
    ],
    "neighbors": [
      {
        "glottocode": "salu1253",
        "name": "Saluan",
        "distanceKm": 51.3
      },
      {
        "glottocode": "bang1368",
        "name": "Banggai",
        "distanceKm": 84.3
      },
      {
        "glottocode": "andi1257",
        "name": "Andio",
        "distanceKm": 86.8
      },
      {
        "glottocode": "bala1315",
        "name": "Balantak",
        "distanceKm": 99.0
      },
      {
        "glottocode": "bobo1255",
        "name": "Bobongko",
        "distanceKm": 116.9
      }
    ]
  },
  {
    "glottocode": "bang1368",
    "name": "Banggai",
    "isocode": "bgz",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.58305,
    "longitude": 123.171,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Sulawesi Tengah (Banggai Laut)",
    "family": "Austronesian (Saluan-Banggai)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -1.31455,
        123.171
      ],
      [
        -1.30824,
        123.30339
      ],
      [
        -1.45693,
        123.3292
      ],
      [
        -1.53107,
        123.39883
      ],
      [
        -1.63553,
        123.40101
      ],
      [
        -1.67737,
        123.28932
      ],
      [
        -1.78579,
        123.26867
      ],
      [
        -1.79803,
        123.171
      ],
      [
        -1.74384,
        123.09354
      ],
      [
        -1.75838,
        122.95106
      ],
      [
        -1.63865,
        122.9273
      ],
      [
        -1.52794,
        122.92947
      ],
      [
        -1.37593,
        122.91118
      ],
      [
        -1.35019,
        123.05882
      ],
      [
        -1.31455,
        123.171
      ]
    ],
    "neighbors": [
      {
        "glottocode": "andi1257",
        "name": "Andio",
        "distanceKm": 77.8
      },
      {
        "glottocode": "bala1315",
        "name": "Balantak",
        "distanceKm": 80.6
      },
      {
        "glottocode": "batu1260",
        "name": "Batui",
        "distanceKm": 84.3
      },
      {
        "glottocode": "salu1253",
        "name": "Saluan",
        "distanceKm": 92.0
      }
    ]
  },
  {
    "glottocode": "bobo1255",
    "name": "Bobongko",
    "isocode": "bgb",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -0.36759,
    "longitude": 121.922,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tengah (Kepulauan Togean)",
    "family": "Austronesian (Saluan-Banggai)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -0.07704,
        121.922
      ],
      [
        -0.19888,
        122.00325
      ],
      [
        -0.23156,
        122.09258
      ],
      [
        -0.31661,
        122.14537
      ],
      [
        -0.40094,
        122.06811
      ],
      [
        -0.51039,
        122.10107
      ],
      [
        -0.57351,
        122.02117
      ],
      [
        -0.56052,
        121.922
      ],
      [
        -0.63448,
        121.79347
      ],
      [
        -0.533,
        121.71458
      ],
      [
        -0.42419,
        121.67401
      ],
      [
        -0.29335,
        121.59675
      ],
      [
        -0.20895,
        121.72307
      ],
      [
        -0.13792,
        121.81139
      ],
      [
        -0.07704,
        121.922
      ]
    ],
    "neighbors": [
      {
        "glottocode": "salu1253",
        "name": "Saluan",
        "distanceKm": 107.5
      },
      {
        "glottocode": "batu1260",
        "name": "Batui",
        "distanceKm": 116.9
      },
      {
        "glottocode": "goro1259",
        "name": "Gorontalo",
        "distanceKm": 117.8
      }
    ]
  },
  {
    "glottocode": "mori1269",
    "name": "Mori Atas",
    "isocode": "mzq",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.2555,
    "longitude": 121.035,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tengah (Morowali Utara)",
    "family": "Austronesian (Bungku-Tolaki)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -2.08148,
        121.035
      ],
      [
        -2.06936,
        121.12471
      ],
      [
        -2.1136,
        121.21307
      ],
      [
        -2.2212,
        121.1854
      ],
      [
        -2.30843,
        121.26706
      ],
      [
        -2.4084,
        121.22688
      ],
      [
        -2.44313,
        121.12543
      ],
      [
        -2.56495,
        121.035
      ],
      [
        -2.50496,
        120.91477
      ],
      [
        -2.41504,
        120.83478
      ],
      [
        -2.32878,
        120.71368
      ],
      [
        -2.20084,
        120.79534
      ],
      [
        -2.10696,
        120.84859
      ],
      [
        -2.00754,
        120.91549
      ],
      [
        -2.08148,
        121.035
      ]
    ],
    "neighbors": [
      {
        "glottocode": "mori1268",
        "name": "Mori Bawah",
        "distanceKm": 50.3
      },
      {
        "glottocode": "pamo1252",
        "name": "Pamona",
        "distanceKm": 74.6
      },
      {
        "glottocode": "baho1237",
        "name": "Bahonsuai",
        "distanceKm": 74.7
      },
      {
        "glottocode": "bada1261",
        "name": "Bada (Indonesia)",
        "distanceKm": 94.2
      },
      {
        "glottocode": "beso1237",
        "name": "Besoa",
        "distanceKm": 103.0
      }
    ]
  },
  {
    "glottocode": "mori1268",
    "name": "Mori Bawah",
    "isocode": "xmz",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.56016,
    "longitude": 121.37,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tengah (Morowali)",
    "family": "Austronesian (Bungku-Tolaki)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -2.36012,
        121.37
      ],
      [
        -2.35148,
        121.4706
      ],
      [
        -2.45815,
        121.49804
      ],
      [
        -2.50449,
        121.61414
      ],
      [
        -2.61873,
        121.62686
      ],
      [
        -2.69888,
        121.54412
      ],
      [
        -2.84771,
        121.50862
      ],
      [
        -2.84359,
        121.37
      ],
      [
        -2.78707,
        121.26062
      ],
      [
        -2.75959,
        121.11967
      ],
      [
        -2.61208,
        121.14231
      ],
      [
        -2.51114,
        121.15503
      ],
      [
        -2.39744,
        121.16575
      ],
      [
        -2.41212,
        121.29864
      ],
      [
        -2.36012,
        121.37
      ]
    ],
    "neighbors": [
      {
        "glottocode": "mori1269",
        "name": "Mori Atas",
        "distanceKm": 50.3
      },
      {
        "glottocode": "baho1237",
        "name": "Bahonsuai",
        "distanceKm": 52.8
      },
      {
        "glottocode": "koro1311",
        "name": "Koroni",
        "distanceKm": 68.0
      },
      {
        "glottocode": "pamo1252",
        "name": "Pamona",
        "distanceKm": 104.4
      },
      {
        "glottocode": "bung1269",
        "name": "Bungku",
        "distanceKm": 119.0
      }
    ]
  },
  {
    "glottocode": "baho1237",
    "name": "Bahonsuai",
    "isocode": "bsu",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.22572,
    "longitude": 121.707,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Sulawesi Tengah (Bungku Barat)",
    "family": "Austronesian (Bungku-Tolaki)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -1.98483,
        121.707
      ],
      [
        -2.06613,
        121.78391
      ],
      [
        -2.06094,
        121.91378
      ],
      [
        -2.1633,
        121.98067
      ],
      [
        -2.27775,
        121.93512
      ],
      [
        -2.42775,
        121.96053
      ],
      [
        -2.48196,
        121.83049
      ],
      [
        -2.4683,
        121.707
      ],
      [
        -2.50173,
        121.57398
      ],
      [
        -2.36238,
        121.5355
      ],
      [
        -2.27089,
        121.50896
      ],
      [
        -2.17016,
        121.46341
      ],
      [
        -2.12631,
        121.58225
      ],
      [
        -2.04637,
        121.62056
      ],
      [
        -1.98483,
        121.707
      ]
    ],
    "neighbors": [
      {
        "glottocode": "mori1268",
        "name": "Mori Bawah",
        "distanceKm": 52.8
      },
      {
        "glottocode": "koro1311",
        "name": "Koroni",
        "distanceKm": 54.7
      },
      {
        "glottocode": "mori1269",
        "name": "Mori Atas",
        "distanceKm": 74.7
      },
      {
        "glottocode": "pamo1252",
        "name": "Pamona",
        "distanceKm": 82.6
      },
      {
        "glottocode": "bung1269",
        "name": "Bungku",
        "distanceKm": 124.2
      }
    ]
  },
  {
    "glottocode": "bung1269",
    "name": "Bungku",
    "isocode": "bkz",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.22197,
    "longitude": 122.212,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tengah (Bungku)",
    "family": "Austronesian (Bungku-Tolaki)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -3.02887,
        122.212
      ],
      [
        -2.97125,
        122.33293
      ],
      [
        -3.03789,
        122.44319
      ],
      [
        -3.1684,
        122.4471
      ],
      [
        -3.29392,
        122.52772
      ],
      [
        -3.3965,
        122.4312
      ],
      [
        -3.42833,
        122.31153
      ],
      [
        -3.51235,
        122.212
      ],
      [
        -3.40685,
        122.12283
      ],
      [
        -3.33933,
        122.0646
      ],
      [
        -3.27598,
        121.975
      ],
      [
        -3.18633,
        122.05562
      ],
      [
        -3.09506,
        122.05261
      ],
      [
        -2.99273,
        122.10143
      ],
      [
        -3.02887,
        122.212
      ]
    ],
    "neighbors": [
      {
        "glottocode": "koro1311",
        "name": "Koroni",
        "distanceKm": 70.1
      },
      {
        "glottocode": "tola1247",
        "name": "Tolaki",
        "distanceKm": 97.4
      },
      {
        "glottocode": "mori1268",
        "name": "Mori Bawah",
        "distanceKm": 119.0
      },
      {
        "glottocode": "baho1237",
        "name": "Bahonsuai",
        "distanceKm": 124.2
      }
    ]
  },
  {
    "glottocode": "koro1311",
    "name": "Koroni",
    "isocode": "xkq",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.6367,
    "longitude": 121.977,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tengah (Bungku Tengah)",
    "family": "Austronesian (Bungku-Tolaki)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -2.34649,
        121.977
      ],
      [
        -2.36114,
        122.10984
      ],
      [
        -2.48554,
        122.16675
      ],
      [
        -2.56616,
        122.28637
      ],
      [
        -2.69696,
        122.24127
      ],
      [
        -2.76933,
        122.14349
      ],
      [
        -2.88345,
        122.09595
      ],
      [
        -2.82997,
        121.977
      ],
      [
        -2.79674,
        121.89985
      ],
      [
        -2.78698,
        121.78835
      ],
      [
        -2.67375,
        121.81452
      ],
      [
        -2.58937,
        121.76942
      ],
      [
        -2.46789,
        121.76509
      ],
      [
        -2.44785,
        121.88596
      ],
      [
        -2.34649,
        121.977
      ]
    ],
    "neighbors": [
      {
        "glottocode": "baho1237",
        "name": "Bahonsuai",
        "distanceKm": 54.7
      },
      {
        "glottocode": "mori1268",
        "name": "Mori Bawah",
        "distanceKm": 68.0
      },
      {
        "glottocode": "bung1269",
        "name": "Bungku",
        "distanceKm": 70.1
      },
      {
        "glottocode": "mori1269",
        "name": "Mori Atas",
        "distanceKm": 112.9
      },
      {
        "glottocode": "pamo1252",
        "name": "Pamona",
        "distanceKm": 137.2
      }
    ]
  },
  {
    "glottocode": "tola1247",
    "name": "Tolaki",
    "isocode": "lbw",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -4.03577,
    "longitude": 121.888,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tenggara (Kendari & Konawe)",
    "family": "Austronesian (Bungku-Tolaki)",
    "estimatedRadiusKm": 48.0,
    "estimatedAreaKm2": 6659.2,
    "boundaryPolygon": [
      [
        -3.5689,
        121.888
      ],
      [
        -3.71332,
        122.04367
      ],
      [
        -3.74992,
        122.24733
      ],
      [
        -3.94954,
        122.26673
      ],
      [
        -4.10102,
        122.17458
      ],
      [
        -4.27778,
        122.19223
      ],
      [
        -4.28589,
        122.00875
      ],
      [
        -4.29411,
        121.888
      ],
      [
        -4.36671,
        121.72823
      ],
      [
        -4.20209,
        121.67893
      ],
      [
        -4.11092,
        121.55794
      ],
      [
        -3.93964,
        121.46579
      ],
      [
        -3.82562,
        121.62382
      ],
      [
        -3.63249,
        121.69331
      ],
      [
        -3.5689,
        121.888
      ]
    ],
    "neighbors": [
      {
        "glottocode": "moro1287",
        "name": "Moronene",
        "distanceKm": 65.7
      },
      {
        "glottocode": "bung1269",
        "name": "Bungku",
        "distanceKm": 97.4
      },
      {
        "glottocode": "wawo1239",
        "name": "Wawonii",
        "distanceKm": 134.9
      }
    ]
  },
  {
    "glottocode": "wawo1239",
    "name": "Wawonii",
    "isocode": "wow",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -4.13587,
    "longitude": 123.1,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tenggara (Pulau Wawonii)",
    "family": "Austronesian (Bungku-Tolaki)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -3.90622,
        123.1
      ],
      [
        -3.87414,
        123.22637
      ],
      [
        -3.98353,
        123.29153
      ],
      [
        -4.09598,
        123.27523
      ],
      [
        -4.1908,
        123.3413
      ],
      [
        -4.24925,
        123.24254
      ],
      [
        -4.29128,
        123.17504
      ],
      [
        -4.38969,
        123.1
      ],
      [
        -4.30974,
        123.01605
      ],
      [
        -4.28497,
        122.91255
      ],
      [
        -4.20356,
        122.80265
      ],
      [
        -4.08322,
        122.86871
      ],
      [
        -3.9478,
        122.86356
      ],
      [
        -3.85568,
        122.96472
      ],
      [
        -3.90622,
        123.1
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kama1364",
        "name": "Kamaru",
        "distanceKm": 113.7
      },
      {
        "glottocode": "lasa1237",
        "name": "Lasalimu",
        "distanceKm": 122.4
      },
      {
        "glottocode": "panc1247",
        "name": "Pancana",
        "distanceKm": 129.8
      },
      {
        "glottocode": "kumb1274",
        "name": "Kumbewaha",
        "distanceKm": 134.6
      },
      {
        "glottocode": "tola1247",
        "name": "Tolaki",
        "distanceKm": 134.9
      }
    ]
  },
  {
    "glottocode": "moro1287",
    "name": "Moronene",
    "isocode": "mqn",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -4.62361,
    "longitude": 121.824,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tenggara (Bombana)",
    "family": "Austronesian (Bungku-Tolaki)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -4.35038,
        121.824
      ],
      [
        -4.41571,
        121.92445
      ],
      [
        -4.52014,
        121.95417
      ],
      [
        -4.57031,
        122.05826
      ],
      [
        -4.6646,
        122.00416
      ],
      [
        -4.7347,
        121.96376
      ],
      [
        -4.86399,
        121.94014
      ],
      [
        -4.83385,
        121.824
      ],
      [
        -4.8513,
        121.71399
      ],
      [
        -4.82158,
        121.57494
      ],
      [
        -4.6779,
        121.58537
      ],
      [
        -4.55701,
        121.53127
      ],
      [
        -4.43326,
        121.58453
      ],
      [
        -4.42839,
        121.72968
      ],
      [
        -4.35038,
        121.824
      ]
    ],
    "neighbors": [
      {
        "glottocode": "tola1247",
        "name": "Tolaki",
        "distanceKm": 65.7
      },
      {
        "glottocode": "muna1247",
        "name": "Muna",
        "distanceKm": 117.6
      },
      {
        "glottocode": "woli1241",
        "name": "Wolio",
        "distanceKm": 122.3
      }
    ]
  },
  {
    "glottocode": "muna1247",
    "name": "Muna",
    "isocode": "mnb",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -5.40419,
    "longitude": 122.541,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tenggara (Pulau Muna)",
    "family": "Austronesian (Muna-Buton)",
    "estimatedRadiusKm": 48.0,
    "estimatedAreaKm2": 6659.2,
    "boundaryPolygon": [
      [
        -5.07497,
        122.541
      ],
      [
        -5.19199,
        122.64365
      ],
      [
        -5.18205,
        122.8208
      ],
      [
        -5.34008,
        122.82315
      ],
      [
        -5.46707,
        122.81772
      ],
      [
        -5.66815,
        122.87348
      ],
      [
        -5.71191,
        122.68985
      ],
      [
        -5.80019,
        122.541
      ],
      [
        -5.84538,
        122.32759
      ],
      [
        -5.63421,
        122.25127
      ],
      [
        -5.50145,
        122.11296
      ],
      [
        -5.30569,
        122.10753
      ],
      [
        -5.21599,
        122.30395
      ],
      [
        -5.05851,
        122.37379
      ],
      [
        -5.07497,
        122.541
      ]
    ],
    "neighbors": [
      {
        "glottocode": "woli1241",
        "name": "Wolio",
        "distanceKm": 16.5
      },
      {
        "glottocode": "buso1238",
        "name": "Busoa",
        "distanceKm": 24.1
      },
      {
        "glottocode": "ciac1237",
        "name": "Cia-Cia",
        "distanceKm": 41.5
      },
      {
        "glottocode": "panc1247",
        "name": "Pancana",
        "distanceKm": 48.8
      },
      {
        "glottocode": "kama1364",
        "name": "Kamaru",
        "distanceKm": 62.2
      }
    ]
  },
  {
    "glottocode": "panc1247",
    "name": "Pancana",
    "isocode": "pnp",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -5.29587,
    "longitude": 122.968,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tenggara (Muna)",
    "family": "Austronesian (Muna-Buton)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -5.14241,
        122.968
      ],
      [
        -5.07869,
        123.07304
      ],
      [
        -5.1682,
        123.12878
      ],
      [
        -5.25099,
        123.16546
      ],
      [
        -5.36224,
        123.26004
      ],
      [
        -5.44762,
        123.1591
      ],
      [
        -5.54035,
        123.08624
      ],
      [
        -5.62589,
        122.968
      ],
      [
        -5.51429,
        122.86237
      ],
      [
        -5.46964,
        122.74916
      ],
      [
        -5.35858,
        122.69209
      ],
      [
        -5.25466,
        122.78667
      ],
      [
        -5.14618,
        122.77949
      ],
      [
        -5.10476,
        122.87557
      ],
      [
        -5.14241,
        122.968
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kama1364",
        "name": "Kamaru",
        "distanceKm": 17.6
      },
      {
        "glottocode": "lasa1237",
        "name": "Lasalimu",
        "distanceKm": 19.0
      },
      {
        "glottocode": "kumb1274",
        "name": "Kumbewaha",
        "distanceKm": 21.3
      },
      {
        "glottocode": "woli1241",
        "name": "Wolio",
        "distanceKm": 33.2
      },
      {
        "glottocode": "ciac1237",
        "name": "Cia-Cia",
        "distanceKm": 47.3
      }
    ]
  },
  {
    "glottocode": "woli1241",
    "name": "Wolio",
    "isocode": "wlo",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -5.33,
    "longitude": 122.67,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tenggara (Baubau)",
    "family": "Austronesian (Muna-Buton)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -5.08045,
        122.67
      ],
      [
        -5.13093,
        122.76628
      ],
      [
        -5.19517,
        122.8398
      ],
      [
        -5.26037,
        122.97641
      ],
      [
        -5.38688,
        122.92028
      ],
      [
        -5.50062,
        122.88488
      ],
      [
        -5.6254,
        122.81288
      ],
      [
        -5.56393,
        122.67
      ],
      [
        -5.56653,
        122.5556
      ],
      [
        -5.49661,
        122.46017
      ],
      [
        -5.36795,
        122.50301
      ],
      [
        -5.27929,
        122.44688
      ],
      [
        -5.19918,
        122.50524
      ],
      [
        -5.18981,
        122.60219
      ],
      [
        -5.08045,
        122.67
      ]
    ],
    "neighbors": [
      {
        "glottocode": "muna1247",
        "name": "Muna",
        "distanceKm": 16.5
      },
      {
        "glottocode": "buso1238",
        "name": "Busoa",
        "distanceKm": 31.1
      },
      {
        "glottocode": "panc1247",
        "name": "Pancana",
        "distanceKm": 33.2
      },
      {
        "glottocode": "ciac1237",
        "name": "Cia-Cia",
        "distanceKm": 41.5
      },
      {
        "glottocode": "kama1364",
        "name": "Kamaru",
        "distanceKm": 45.8
      }
    ]
  },
  {
    "glottocode": "ciac1237",
    "name": "Cia-Cia",
    "isocode": "cia",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -5.68289,
    "longitude": 122.791,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tenggara (Buton Selatan)",
    "family": "Austronesian (Muna-Buton)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -5.444,
        122.791
      ],
      [
        -5.47555,
        122.89134
      ],
      [
        -5.48063,
        123.04588
      ],
      [
        -5.62436,
        123.04872
      ],
      [
        -5.74306,
        123.05591
      ],
      [
        -5.88264,
        123.04272
      ],
      [
        -5.88256,
        122.88763
      ],
      [
        -5.92747,
        122.791
      ],
      [
        -5.91114,
        122.68054
      ],
      [
        -5.78207,
        122.66602
      ],
      [
        -5.73194,
        122.57504
      ],
      [
        -5.63547,
        122.58223
      ],
      [
        -5.5812,
        122.66286
      ],
      [
        -5.44696,
        122.67682
      ],
      [
        -5.444,
        122.791
      ]
    ],
    "neighbors": [
      {
        "glottocode": "buso1238",
        "name": "Busoa",
        "distanceKm": 20.6
      },
      {
        "glottocode": "muna1247",
        "name": "Muna",
        "distanceKm": 41.5
      },
      {
        "glottocode": "woli1241",
        "name": "Wolio",
        "distanceKm": 41.5
      },
      {
        "glottocode": "panc1247",
        "name": "Pancana",
        "distanceKm": 47.3
      },
      {
        "glottocode": "kumb1274",
        "name": "Kumbewaha",
        "distanceKm": 55.0
      }
    ]
  },
  {
    "glottocode": "kama1364",
    "name": "Kamaru",
    "isocode": "kgx",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -5.15696,
    "longitude": 123.045,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tenggara (Buton)",
    "family": "Austronesian (Muna-Buton)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -4.91549,
        123.045
      ],
      [
        -4.85849,
        123.18932
      ],
      [
        -4.99173,
        123.25304
      ],
      [
        -5.09872,
        123.30119
      ],
      [
        -5.22562,
        123.34702
      ],
      [
        -5.2861,
        123.20759
      ],
      [
        -5.36133,
        123.14382
      ],
      [
        -5.39897,
        123.045
      ],
      [
        -5.29408,
        122.9787
      ],
      [
        -5.29317,
        122.87351
      ],
      [
        -5.20631,
        122.82792
      ],
      [
        -5.11803,
        122.87375
      ],
      [
        -4.98466,
        122.82806
      ],
      [
        -4.92573,
        122.93319
      ],
      [
        -4.91549,
        123.045
      ]
    ],
    "neighbors": [
      {
        "glottocode": "lasa1237",
        "name": "Lasalimu",
        "distanceKm": 12.8
      },
      {
        "glottocode": "panc1247",
        "name": "Pancana",
        "distanceKm": 17.6
      },
      {
        "glottocode": "kumb1274",
        "name": "Kumbewaha",
        "distanceKm": 24.1
      },
      {
        "glottocode": "woli1241",
        "name": "Wolio",
        "distanceKm": 45.8
      },
      {
        "glottocode": "tuka1248",
        "name": "Tukang Besi North",
        "distanceKm": 61.4
      }
    ]
  },
  {
    "glottocode": "lasa1237",
    "name": "Lasalimu",
    "isocode": "llm",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -5.23602,
    "longitude": 123.129,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tenggara (Buton)",
    "family": "Austronesian (Muna-Buton)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -4.90335,
        123.129
      ],
      [
        -5.00043,
        123.24293
      ],
      [
        -5.0811,
        123.32408
      ],
      [
        -5.17063,
        123.41669
      ],
      [
        -5.27882,
        123.31731
      ],
      [
        -5.3677,
        123.29481
      ],
      [
        -5.44755,
        123.23129
      ],
      [
        -5.38682,
        123.129
      ],
      [
        -5.43603,
        123.03228
      ],
      [
        -5.38254,
        122.9445
      ],
      [
        -5.27821,
        122.94336
      ],
      [
        -5.17124,
        122.84398
      ],
      [
        -5.06626,
        122.91523
      ],
      [
        -5.01195,
        123.02064
      ],
      [
        -4.90335,
        123.129
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kumb1274",
        "name": "Kumbewaha",
        "distanceKm": 12.4
      },
      {
        "glottocode": "kama1364",
        "name": "Kamaru",
        "distanceKm": 12.8
      },
      {
        "glottocode": "panc1247",
        "name": "Pancana",
        "distanceKm": 19.0
      },
      {
        "glottocode": "tuka1248",
        "name": "Tukang Besi North",
        "distanceKm": 50.4
      },
      {
        "glottocode": "woli1241",
        "name": "Wolio",
        "distanceKm": 51.9
      }
    ]
  },
  {
    "glottocode": "kumb1274",
    "name": "Kumbewaha",
    "isocode": "xks",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -5.34485,
    "longitude": 123.154,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tenggara (Buton)",
    "family": "Austronesian (Muna-Buton)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -5.09176,
        123.154
      ],
      [
        -5.13577,
        123.25513
      ],
      [
        -5.1714,
        123.37245
      ],
      [
        -5.30496,
        123.32952
      ],
      [
        -5.38921,
        123.34919
      ],
      [
        -5.48993,
        123.33672
      ],
      [
        -5.4846,
        123.22159
      ],
      [
        -5.57524,
        123.154
      ],
      [
        -5.57137,
        123.04444
      ],
      [
        -5.47284,
        122.99281
      ],
      [
        -5.41255,
        122.8561
      ],
      [
        -5.28162,
        122.87578
      ],
      [
        -5.18849,
        122.95707
      ],
      [
        -5.049,
        123.0109
      ],
      [
        -5.09176,
        123.154
      ]
    ],
    "neighbors": [
      {
        "glottocode": "lasa1237",
        "name": "Lasalimu",
        "distanceKm": 12.4
      },
      {
        "glottocode": "panc1247",
        "name": "Pancana",
        "distanceKm": 21.3
      },
      {
        "glottocode": "kama1364",
        "name": "Kamaru",
        "distanceKm": 24.1
      },
      {
        "glottocode": "tuka1248",
        "name": "Tukang Besi North",
        "distanceKm": 47.1
      },
      {
        "glottocode": "woli1241",
        "name": "Wolio",
        "distanceKm": 53.6
      }
    ]
  },
  {
    "glottocode": "buso1238",
    "name": "Busoa",
    "isocode": "bup",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -5.60524,
    "longitude": 122.622,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tenggara (Batauga)",
    "family": "Austronesian (Muna-Buton)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -5.39099,
        122.622
      ],
      [
        -5.36782,
        122.73689
      ],
      [
        -5.49951,
        122.75521
      ],
      [
        -5.56241,
        122.81054
      ],
      [
        -5.65779,
        122.85333
      ],
      [
        -5.70789,
        122.75134
      ],
      [
        -5.82363,
        122.72768
      ],
      [
        -5.87447,
        122.622
      ],
      [
        -5.80341,
        122.52611
      ],
      [
        -5.80095,
        122.3754
      ],
      [
        -5.67,
        122.33693
      ],
      [
        -5.5502,
        122.37971
      ],
      [
        -5.40645,
        122.37153
      ],
      [
        -5.38803,
        122.5169
      ],
      [
        -5.39099,
        122.622
      ]
    ],
    "neighbors": [
      {
        "glottocode": "ciac1237",
        "name": "Cia-Cia",
        "distanceKm": 20.6
      },
      {
        "glottocode": "muna1247",
        "name": "Muna",
        "distanceKm": 24.1
      },
      {
        "glottocode": "woli1241",
        "name": "Wolio",
        "distanceKm": 31.1
      },
      {
        "glottocode": "panc1247",
        "name": "Pancana",
        "distanceKm": 51.5
      },
      {
        "glottocode": "kumb1274",
        "name": "Kumbewaha",
        "distanceKm": 65.6
      }
    ]
  },
  {
    "glottocode": "tuka1248",
    "name": "Tukang Besi North",
    "isocode": "khc",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -5.30994,
    "longitude": 123.578,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tenggara (Wakatobi Utara)",
    "family": "Austronesian (Muna-Buton)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -5.05829,
        123.578
      ],
      [
        -5.16158,
        123.64975
      ],
      [
        -5.19074,
        123.72811
      ],
      [
        -5.25545,
        123.81776
      ],
      [
        -5.34962,
        123.75258
      ],
      [
        -5.46975,
        123.77926
      ],
      [
        -5.56803,
        123.70283
      ],
      [
        -5.54176,
        123.578
      ],
      [
        -5.59718,
        123.43908
      ],
      [
        -5.49219,
        123.34849
      ],
      [
        -5.36303,
        123.34437
      ],
      [
        -5.24203,
        123.2792
      ],
      [
        -5.16831,
        123.39964
      ],
      [
        -5.13244,
        123.49215
      ],
      [
        -5.05829,
        123.578
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kumb1274",
        "name": "Kumbewaha",
        "distanceKm": 47.1
      },
      {
        "glottocode": "lasa1237",
        "name": "Lasalimu",
        "distanceKm": 50.4
      },
      {
        "glottocode": "kama1364",
        "name": "Kamaru",
        "distanceKm": 61.4
      },
      {
        "glottocode": "tuka1249",
        "name": "Tukang Besi South",
        "distanceKm": 63.6
      },
      {
        "glottocode": "panc1247",
        "name": "Pancana",
        "distanceKm": 67.6
      }
    ]
  },
  {
    "glottocode": "tuka1249",
    "name": "Tukang Besi South",
    "isocode": "bhq",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -5.7478,
    "longitude": 123.948,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Tenggara (Wakatobi Selatan)",
    "family": "Austronesian (Muna-Buton)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -5.5825,
        123.948
      ],
      [
        -5.57177,
        124.0332
      ],
      [
        -5.58699,
        124.15067
      ],
      [
        -5.70452,
        124.13859
      ],
      [
        -5.80793,
        124.21279
      ],
      [
        -5.93561,
        124.1847
      ],
      [
        -5.96349,
        124.05239
      ],
      [
        -6.06598,
        123.948
      ],
      [
        -6.00736,
        123.82237
      ],
      [
        -5.88843,
        123.77077
      ],
      [
        -5.8121,
        123.66485
      ],
      [
        -5.70035,
        123.73906
      ],
      [
        -5.63417,
        123.80479
      ],
      [
        -5.52789,
        123.84156
      ],
      [
        -5.5825,
        123.948
      ]
    ],
    "neighbors": [
      {
        "glottocode": "tuka1248",
        "name": "Tukang Besi North",
        "distanceKm": 63.6
      },
      {
        "glottocode": "kumb1274",
        "name": "Kumbewaha",
        "distanceKm": 98.6
      },
      {
        "glottocode": "lasa1237",
        "name": "Lasalimu",
        "distanceKm": 107.0
      },
      {
        "glottocode": "panc1247",
        "name": "Pancana",
        "distanceKm": 119.5
      },
      {
        "glottocode": "kama1364",
        "name": "Kamaru",
        "distanceKm": 119.6
      }
    ]
  },
  {
    "glottocode": "budo1241",
    "name": "Budong-Budong",
    "isocode": "bdx",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.07756,
    "longitude": 119.327,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Barat (Mamuju Tengah)",
    "family": "Austronesian (South Sulawesi)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -1.87323,
        119.327
      ],
      [
        -1.83084,
        119.44589
      ],
      [
        -1.94578,
        119.49236
      ],
      [
        -2.01476,
        119.60232
      ],
      [
        -2.14697,
        119.63131
      ],
      [
        -2.22827,
        119.51611
      ],
      [
        -2.35858,
        119.46242
      ],
      [
        -2.35671,
        119.327
      ],
      [
        -2.26643,
        119.23598
      ],
      [
        -2.24722,
        119.11412
      ],
      [
        -2.12234,
        119.13066
      ],
      [
        -2.03939,
        119.15964
      ],
      [
        -1.92683,
        119.13787
      ],
      [
        -1.92298,
        119.25251
      ],
      [
        -1.87323,
        119.327
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kalu1247",
        "name": "Kalumpang",
        "distanceKm": 32.8
      },
      {
        "glottocode": "aral1243",
        "name": "Aralle-Tabulahan",
        "distanceKm": 78.6
      },
      {
        "glottocode": "umaa1242",
        "name": "Uma",
        "distanceKm": 82.5
      },
      {
        "glottocode": "daak1235",
        "name": "Da'a Kaili",
        "distanceKm": 98.9
      },
      {
        "glottocode": "moma1242",
        "name": "Moma",
        "distanceKm": 104.4
      }
    ]
  },
  {
    "glottocode": "mand1442",
    "name": "Mandar",
    "isocode": "mdr",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.34717,
    "longitude": 119.068,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Barat (Polewali & Majene)",
    "family": "Austronesian (South Sulawesi)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -3.05638,
        119.068
      ],
      [
        -3.14273,
        119.16662
      ],
      [
        -3.16601,
        119.29556
      ],
      [
        -3.27653,
        119.37802
      ],
      [
        -3.40025,
        119.30095
      ],
      [
        -3.53458,
        119.3034
      ],
      [
        -3.58754,
        119.18395
      ],
      [
        -3.53986,
        119.068
      ],
      [
        -3.57833,
        118.95649
      ],
      [
        -3.46745,
        118.91692
      ],
      [
        -3.38412,
        118.90586
      ],
      [
        -3.29266,
        118.82879
      ],
      [
        -3.23313,
        118.92476
      ],
      [
        -3.15194,
        118.97382
      ],
      [
        -3.05638,
        119.068
      ]
    ],
    "neighbors": [
      {
        "glottocode": "camp1262",
        "name": "Campalagian",
        "distanceKm": 18.4
      },
      {
        "glottocode": "bamb1270",
        "name": "Bambam",
        "distanceKm": 38.5
      },
      {
        "glottocode": "mama1276",
        "name": "Mamasa",
        "distanceKm": 54.8
      },
      {
        "glottocode": "aral1243",
        "name": "Aralle-Tabulahan",
        "distanceKm": 68.5
      },
      {
        "glottocode": "enre1239",
        "name": "Enrekang",
        "distanceKm": 69.1
      }
    ]
  },
  {
    "glottocode": "camp1262",
    "name": "Campalagian",
    "isocode": "cml",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.47851,
    "longitude": 119.16863,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Barat (Polewali Mandar)",
    "family": "Austronesian (South Sulawesi)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -3.23915,
        119.16863
      ],
      [
        -3.21361,
        119.29643
      ],
      [
        -3.28068,
        119.41716
      ],
      [
        -3.42729,
        119.39347
      ],
      [
        -3.54201,
        119.44737
      ],
      [
        -3.63611,
        119.36662
      ],
      [
        -3.63769,
        119.24543
      ],
      [
        -3.72262,
        119.16863
      ],
      [
        -3.64921,
        119.08627
      ],
      [
        -3.58212,
        119.03847
      ],
      [
        -3.53487,
        118.92125
      ],
      [
        -3.43443,
        118.97515
      ],
      [
        -3.33467,
        118.98792
      ],
      [
        -3.20209,
        119.03527
      ],
      [
        -3.23915,
        119.16863
      ]
    ],
    "neighbors": [
      {
        "glottocode": "mand1442",
        "name": "Mandar",
        "distanceKm": 18.4
      },
      {
        "glottocode": "bamb1270",
        "name": "Bambam",
        "distanceKm": 50.3
      },
      {
        "glottocode": "enre1239",
        "name": "Enrekang",
        "distanceKm": 54.9
      },
      {
        "glottocode": "mama1276",
        "name": "Mamasa",
        "distanceKm": 56.4
      },
      {
        "glottocode": "duri1242",
        "name": "Duri",
        "distanceKm": 78.9
      }
    ]
  },
  {
    "glottocode": "bamb1270",
    "name": "Bambam",
    "isocode": "ptu",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.02759,
    "longitude": 119.201,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Barat (Mamasa)",
    "family": "Austronesian (South Sulawesi)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -2.73568,
        119.201
      ],
      [
        -2.74677,
        119.33643
      ],
      [
        -2.89182,
        119.37149
      ],
      [
        -2.96796,
        119.46263
      ],
      [
        -3.08078,
        119.43436
      ],
      [
        -3.1295,
        119.32897
      ],
      [
        -3.24037,
        119.30361
      ],
      [
        -3.21916,
        119.201
      ],
      [
        -3.18236,
        119.12636
      ],
      [
        -3.19326,
        118.99296
      ],
      [
        -3.07554,
        118.99061
      ],
      [
        -2.9732,
        118.96235
      ],
      [
        -2.82806,
        118.95045
      ],
      [
        -2.80477,
        119.09355
      ],
      [
        -2.73568,
        119.201
      ]
    ],
    "neighbors": [
      {
        "glottocode": "aral1243",
        "name": "Aralle-Tabulahan",
        "distanceKm": 30.1
      },
      {
        "glottocode": "mama1276",
        "name": "Mamasa",
        "distanceKm": 32.0
      },
      {
        "glottocode": "mand1442",
        "name": "Mandar",
        "distanceKm": 38.5
      },
      {
        "glottocode": "camp1262",
        "name": "Campalagian",
        "distanceKm": 50.3
      },
      {
        "glottocode": "tora1261",
        "name": "Toraja-Sa'dan",
        "distanceKm": 70.0
      }
    ]
  },
  {
    "glottocode": "mama1276",
    "name": "Mamasa",
    "isocode": "mqj",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.0811,
    "longitude": 119.484,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Barat (Mamasa)",
    "family": "Austronesian (South Sulawesi)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -2.77962,
        119.484
      ],
      [
        -2.89843,
        119.5721
      ],
      [
        -2.92505,
        119.67997
      ],
      [
        -3.03048,
        119.70609
      ],
      [
        -3.11549,
        119.6349
      ],
      [
        -3.22673,
        119.66688
      ],
      [
        -3.26058,
        119.57056
      ],
      [
        -3.2631,
        119.484
      ],
      [
        -3.33403,
        119.36202
      ],
      [
        -3.22649,
        119.30142
      ],
      [
        -3.13807,
        119.23406
      ],
      [
        -3.00791,
        119.16287
      ],
      [
        -2.92529,
        119.28833
      ],
      [
        -2.82498,
        119.36048
      ],
      [
        -2.77962,
        119.484
      ]
    ],
    "neighbors": [
      {
        "glottocode": "bamb1270",
        "name": "Bambam",
        "distanceKm": 32.0
      },
      {
        "glottocode": "aral1243",
        "name": "Aralle-Tabulahan",
        "distanceKm": 37.8
      },
      {
        "glottocode": "tora1261",
        "name": "Toraja-Sa'dan",
        "distanceKm": 40.2
      },
      {
        "glottocode": "duri1242",
        "name": "Duri",
        "distanceKm": 53.7
      },
      {
        "glottocode": "enre1239",
        "name": "Enrekang",
        "distanceKm": 54.5
      }
    ]
  },
  {
    "glottocode": "aral1243",
    "name": "Aralle-Tabulahan",
    "isocode": "atq",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.78397,
    "longitude": 119.319,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Barat (Mamasa)",
    "family": "Austronesian (South Sulawesi)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -2.59693,
        119.319
      ],
      [
        -2.57291,
        119.42076
      ],
      [
        -2.64696,
        119.49101
      ],
      [
        -2.75037,
        119.46639
      ],
      [
        -2.8366,
        119.54984
      ],
      [
        -2.91596,
        119.48471
      ],
      [
        -2.96002,
        119.40388
      ],
      [
        -3.0804,
        119.319
      ],
      [
        -3.00851,
        119.21074
      ],
      [
        -2.9484,
        119.11257
      ],
      [
        -2.85795,
        118.99448
      ],
      [
        -2.72901,
        119.07793
      ],
      [
        -2.61452,
        119.10626
      ],
      [
        -2.52443,
        119.19386
      ],
      [
        -2.59693,
        119.319
      ]
    ],
    "neighbors": [
      {
        "glottocode": "bamb1270",
        "name": "Bambam",
        "distanceKm": 30.1
      },
      {
        "glottocode": "mama1276",
        "name": "Mamasa",
        "distanceKm": 37.8
      },
      {
        "glottocode": "kalu1247",
        "name": "Kalumpang",
        "distanceKm": 52.9
      },
      {
        "glottocode": "tora1261",
        "name": "Toraja-Sa'dan",
        "distanceKm": 60.4
      },
      {
        "glottocode": "mand1442",
        "name": "Mandar",
        "distanceKm": 68.5
      }
    ]
  },
  {
    "glottocode": "kalu1247",
    "name": "Kalumpang",
    "isocode": "kli",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.33388,
    "longitude": 119.474,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Barat (Mamuju)",
    "family": "Austronesian (South Sulawesi)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -2.11225,
        119.474
      ],
      [
        -2.13835,
        119.56824
      ],
      [
        -2.23839,
        119.59384
      ],
      [
        -2.27948,
        119.71252
      ],
      [
        -2.38456,
        119.69623
      ],
      [
        -2.46494,
        119.63848
      ],
      [
        -2.61397,
        119.609
      ],
      [
        -2.59572,
        119.474
      ],
      [
        -2.57395,
        119.35829
      ],
      [
        -2.53984,
        119.21553
      ],
      [
        -2.38707,
        119.24078
      ],
      [
        -2.27698,
        119.22448
      ],
      [
        -2.1635,
        119.26017
      ],
      [
        -2.17838,
        119.39905
      ],
      [
        -2.11225,
        119.474
      ]
    ],
    "neighbors": [
      {
        "glottocode": "budo1241",
        "name": "Budong-Budong",
        "distanceKm": 32.8
      },
      {
        "glottocode": "aral1243",
        "name": "Aralle-Tabulahan",
        "distanceKm": 52.9
      },
      {
        "glottocode": "taee1237",
        "name": "Tae'",
        "distanceKm": 78.9
      },
      {
        "glottocode": "tora1261",
        "name": "Toraja-Sa'dan",
        "distanceKm": 81.1
      },
      {
        "glottocode": "bamb1270",
        "name": "Bambam",
        "distanceKm": 82.9
      }
    ]
  },
  {
    "glottocode": "duri1242",
    "name": "Duri",
    "isocode": "mvp",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.37081,
    "longitude": 119.871,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Selatan (Enrekang)",
    "family": "Austronesian (Massenrempulu)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -3.15098,
        119.871
      ],
      [
        -3.22603,
        119.94084
      ],
      [
        -3.211,
        120.07174
      ],
      [
        -3.31615,
        120.11091
      ],
      [
        -3.42075,
        120.09019
      ],
      [
        -3.57173,
        120.12338
      ],
      [
        -3.61384,
        119.98824
      ],
      [
        -3.63445,
        119.871
      ],
      [
        -3.66163,
        119.73071
      ],
      [
        -3.51244,
        119.69309
      ],
      [
        -3.42373,
        119.63874
      ],
      [
        -3.31317,
        119.61802
      ],
      [
        -3.27028,
        119.74473
      ],
      [
        -3.17824,
        119.7781
      ],
      [
        -3.15098,
        119.871
      ]
    ],
    "neighbors": [
      {
        "glottocode": "maiw1250",
        "name": "Maiwa (Indonesia)",
        "distanceKm": 27.6
      },
      {
        "glottocode": "enre1239",
        "name": "Enrekang",
        "distanceKm": 29.9
      },
      {
        "glottocode": "tora1261",
        "name": "Toraja-Sa'dan",
        "distanceKm": 44.7
      },
      {
        "glottocode": "mama1276",
        "name": "Mamasa",
        "distanceKm": 53.7
      },
      {
        "glottocode": "camp1262",
        "name": "Campalagian",
        "distanceKm": 78.9
      }
    ]
  },
  {
    "glottocode": "enre1239",
    "name": "Enrekang",
    "isocode": "ptt",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.53848,
    "longitude": 119.66,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Selatan (Enrekang)",
    "family": "Austronesian (Massenrempulu)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -3.36582,
        119.66
      ],
      [
        -3.2948,
        119.77758
      ],
      [
        -3.37421,
        119.86638
      ],
      [
        -3.48591,
        119.89075
      ],
      [
        -3.61171,
        119.98144
      ],
      [
        -3.70818,
        119.8732
      ],
      [
        -3.7686,
        119.77103
      ],
      [
        -3.8493,
        119.66
      ],
      [
        -3.73039,
        119.5674
      ],
      [
        -3.67565,
        119.48766
      ],
      [
        -3.5935,
        119.4185
      ],
      [
        -3.50412,
        119.50918
      ],
      [
        -3.40674,
        119.49449
      ],
      [
        -3.333,
        119.56086
      ],
      [
        -3.36582,
        119.66
      ]
    ],
    "neighbors": [
      {
        "glottocode": "duri1242",
        "name": "Duri",
        "distanceKm": 29.9
      },
      {
        "glottocode": "maiw1250",
        "name": "Maiwa (Indonesia)",
        "distanceKm": 35.8
      },
      {
        "glottocode": "mama1276",
        "name": "Mamasa",
        "distanceKm": 54.5
      },
      {
        "glottocode": "camp1262",
        "name": "Campalagian",
        "distanceKm": 54.9
      },
      {
        "glottocode": "tora1261",
        "name": "Toraja-Sa'dan",
        "distanceKm": 65.8
      }
    ]
  },
  {
    "glottocode": "maiw1250",
    "name": "Maiwa (Indonesia)",
    "isocode": "wmm",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.59444,
    "longitude": 119.978,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Selatan (Enrekang)",
    "family": "Austronesian (Massenrempulu)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -3.30942,
        119.978
      ],
      [
        -3.34284,
        120.0994
      ],
      [
        -3.4423,
        120.16915
      ],
      [
        -3.52091,
        120.30081
      ],
      [
        -3.65432,
        120.24085
      ],
      [
        -3.74568,
        120.16802
      ],
      [
        -3.86105,
        120.10665
      ],
      [
        -3.7929,
        119.978
      ],
      [
        -3.77843,
        119.88922
      ],
      [
        -3.74374,
        119.79041
      ],
      [
        -3.62849,
        119.82853
      ],
      [
        -3.54673,
        119.76857
      ],
      [
        -3.44423,
        119.78928
      ],
      [
        -3.42545,
        119.89646
      ],
      [
        -3.30942,
        119.978
      ]
    ],
    "neighbors": [
      {
        "glottocode": "duri1242",
        "name": "Duri",
        "distanceKm": 27.6
      },
      {
        "glottocode": "enre1239",
        "name": "Enrekang",
        "distanceKm": 35.8
      },
      {
        "glottocode": "tora1261",
        "name": "Toraja-Sa'dan",
        "distanceKm": 71.2
      },
      {
        "glottocode": "mama1276",
        "name": "Mamasa",
        "distanceKm": 79.2
      },
      {
        "glottocode": "camp1262",
        "name": "Campalagian",
        "distanceKm": 90.7
      }
    ]
  },
  {
    "glottocode": "taee1237",
    "name": "Tae'",
    "isocode": "rob",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.58205,
    "longitude": 120.139,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Selatan (Luwu & Palopo)",
    "family": "Austronesian (South Sulawesi)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -2.29072,
        120.139
      ],
      [
        -2.35978,
        120.24615
      ],
      [
        -2.3787,
        120.39425
      ],
      [
        -2.52396,
        120.39377
      ],
      [
        -2.63244,
        120.36001
      ],
      [
        -2.75657,
        120.35807
      ],
      [
        -2.74914,
        120.21955
      ],
      [
        -2.77419,
        120.139
      ],
      [
        -2.79538,
        120.03616
      ],
      [
        -2.68014,
        120.01587
      ],
      [
        -2.63154,
        119.92193
      ],
      [
        -2.52486,
        119.88817
      ],
      [
        -2.45513,
        119.97969
      ],
      [
        -2.31355,
        120.00956
      ],
      [
        -2.29072,
        120.139
      ]
    ],
    "neighbors": [
      {
        "glottocode": "tora1261",
        "name": "Toraja-Sa'dan",
        "distanceKm": 55.3
      },
      {
        "glottocode": "kalu1247",
        "name": "Kalumpang",
        "distanceKm": 78.9
      },
      {
        "glottocode": "bada1261",
        "name": "Bada (Indonesia)",
        "distanceKm": 89.0
      },
      {
        "glottocode": "mama1276",
        "name": "Mamasa",
        "distanceKm": 91.5
      },
      {
        "glottocode": "duri1242",
        "name": "Duri",
        "distanceKm": 92.6
      }
    ]
  },
  {
    "glottocode": "tora1261",
    "name": "Toraja-Sa'dan",
    "isocode": "sda",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.97144,
    "longitude": 119.829,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Selatan (Tana Toraja)",
    "family": "Austronesian (South Sulawesi)",
    "estimatedRadiusKm": 48.0,
    "estimatedAreaKm2": 6659.2,
    "boundaryPolygon": [
      [
        -2.60567,
        119.829
      ],
      [
        -2.54361,
        120.03531
      ],
      [
        -2.73827,
        120.12178
      ],
      [
        -2.90172,
        120.13486
      ],
      [
        -3.05982,
        120.21675
      ],
      [
        -3.13584,
        120.03543
      ],
      [
        -3.22147,
        119.94957
      ],
      [
        -3.33088,
        119.829
      ],
      [
        -3.197,
        119.72023
      ],
      [
        -3.19043,
        119.55402
      ],
      [
        -3.0631,
        119.42688
      ],
      [
        -2.89845,
        119.50876
      ],
      [
        -2.68368,
        119.46767
      ],
      [
        -2.56808,
        119.63449
      ],
      [
        -2.60567,
        119.829
      ]
    ],
    "neighbors": [
      {
        "glottocode": "mama1276",
        "name": "Mamasa",
        "distanceKm": 40.2
      },
      {
        "glottocode": "duri1242",
        "name": "Duri",
        "distanceKm": 44.7
      },
      {
        "glottocode": "taee1237",
        "name": "Tae'",
        "distanceKm": 55.3
      },
      {
        "glottocode": "aral1243",
        "name": "Aralle-Tabulahan",
        "distanceKm": 60.4
      },
      {
        "glottocode": "enre1239",
        "name": "Enrekang",
        "distanceKm": 65.8
      }
    ]
  },
  {
    "glottocode": "bugi1244",
    "name": "Buginese",
    "isocode": "bug",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -4.47,
    "longitude": 119.977,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Selatan (Bone, Soppeng, Wajo)",
    "family": "Austronesian (South Sulawesi)",
    "estimatedRadiusKm": 65.0,
    "estimatedAreaKm2": 12211.4,
    "boundaryPolygon": [
      [
        -3.85496,
        119.977
      ],
      [
        -4.03894,
        120.18522
      ],
      [
        -4.22715,
        120.28245
      ],
      [
        -4.35593,
        120.47831
      ],
      [
        -4.5472,
        120.31628
      ],
      [
        -4.70235,
        120.26924
      ],
      [
        -4.92344,
        120.19603
      ],
      [
        -4.83702,
        119.977
      ],
      [
        -4.92375,
        119.75782
      ],
      [
        -4.83946,
        119.5123
      ],
      [
        -4.57446,
        119.51796
      ],
      [
        -4.32867,
        119.35592
      ],
      [
        -4.09004,
        119.4991
      ],
      [
        -4.03863,
        119.76863
      ],
      [
        -3.85496,
        119.977
      ]
    ],
    "neighbors": [
      {
        "glottocode": "bent1237",
        "name": "Bentong",
        "distanceKm": 37.4
      },
      {
        "glottocode": "maiw1250",
        "name": "Maiwa (Indonesia)",
        "distanceKm": 97.4
      },
      {
        "glottocode": "maka1305",
        "name": "Makassar Malay",
        "distanceKm": 99.4
      },
      {
        "glottocode": "enre1239",
        "name": "Enrekang",
        "distanceKm": 109.4
      },
      {
        "glottocode": "duri1242",
        "name": "Duri",
        "distanceKm": 122.8
      }
    ]
  },
  {
    "glottocode": "maka1311",
    "name": "Makasar",
    "isocode": "mak",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -5.65551,
    "longitude": 119.838,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Selatan (Gowa & Takalar)",
    "family": "Austronesian (South Sulawesi)",
    "estimatedRadiusKm": 65.0,
    "estimatedAreaKm2": 12211.4,
    "boundaryPolygon": [
      [
        -5.2053,
        119.838
      ],
      [
        -5.33156,
        119.99477
      ],
      [
        -5.34626,
        120.22769
      ],
      [
        -5.57807,
        120.17894
      ],
      [
        -5.74023,
        120.21102
      ],
      [
        -5.98517,
        120.25341
      ],
      [
        -6.01623,
        120.01256
      ],
      [
        -6.18736,
        119.838
      ],
      [
        -6.21636,
        119.56659
      ],
      [
        -5.95856,
        119.45613
      ],
      [
        -5.7966,
        119.21682
      ],
      [
        -5.52171,
        119.2489
      ],
      [
        -5.37287,
        119.48185
      ],
      [
        -5.13143,
        119.58438
      ],
      [
        -5.2053,
        119.838
      ]
    ],
    "neighbors": [
      {
        "glottocode": "maka1305",
        "name": "Makassar Malay",
        "distanceKm": 72.7
      },
      {
        "glottocode": "sela1260",
        "name": "Selayar",
        "distanceKm": 88.1
      },
      {
        "glottocode": "bent1237",
        "name": "Bentong",
        "distanceKm": 99.6
      },
      {
        "glottocode": "laiy1246",
        "name": "Laiyolo",
        "distanceKm": 114.0
      },
      {
        "glottocode": "bugi1244",
        "name": "Buginese",
        "distanceKm": 132.7
      }
    ]
  },
  {
    "glottocode": "maka1305",
    "name": "Makassar Malay",
    "isocode": "mfp",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -5.16108,
    "longitude": 119.408,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Selatan (Kota Makassar)",
    "family": "Austronesian (Malayic)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -4.99481,
        119.408
      ],
      [
        -4.94377,
        119.51308
      ],
      [
        -5.05042,
        119.54733
      ],
      [
        -5.11741,
        119.6001
      ],
      [
        -5.22245,
        119.67797
      ],
      [
        -5.29468,
        119.57621
      ],
      [
        -5.40787,
        119.52733
      ],
      [
        -5.47828,
        119.408
      ],
      [
        -5.37936,
        119.30245
      ],
      [
        -5.35186,
        119.1678
      ],
      [
        -5.225,
        119.12683
      ],
      [
        -5.11486,
        119.20469
      ],
      [
        -4.99324,
        119.19668
      ],
      [
        -4.97227,
        119.3167
      ],
      [
        -4.99481,
        119.408
      ]
    ],
    "neighbors": [
      {
        "glottocode": "bent1237",
        "name": "Bentong",
        "distanceKm": 62.7
      },
      {
        "glottocode": "maka1311",
        "name": "Makasar",
        "distanceKm": 72.7
      },
      {
        "glottocode": "bugi1244",
        "name": "Buginese",
        "distanceKm": 99.4
      }
    ]
  },
  {
    "glottocode": "bent1237",
    "name": "Bentong",
    "isocode": "bnu",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -4.76004,
    "longitude": 119.806,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Selatan (Maros)",
    "family": "Austronesian (South Sulawesi)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -4.5163,
        119.806
      ],
      [
        -4.58999,
        119.88818
      ],
      [
        -4.63001,
        119.96962
      ],
      [
        -4.69497,
        120.09206
      ],
      [
        -4.81128,
        120.03125
      ],
      [
        -4.93615,
        120.0276
      ],
      [
        -5.05087,
        119.94654
      ],
      [
        -4.99977,
        119.806
      ],
      [
        -5.02558,
        119.67768
      ],
      [
        -4.93145,
        119.59032
      ],
      [
        -4.80256,
        119.61908
      ],
      [
        -4.70369,
        119.55827
      ],
      [
        -4.63471,
        119.64829
      ],
      [
        -4.61527,
        119.73604
      ],
      [
        -4.5163,
        119.806
      ]
    ],
    "neighbors": [
      {
        "glottocode": "bugi1244",
        "name": "Buginese",
        "distanceKm": 37.4
      },
      {
        "glottocode": "maka1305",
        "name": "Makassar Malay",
        "distanceKm": 62.7
      },
      {
        "glottocode": "maka1311",
        "name": "Makasar",
        "distanceKm": 99.6
      },
      {
        "glottocode": "maiw1250",
        "name": "Maiwa (Indonesia)",
        "distanceKm": 131.0
      },
      {
        "glottocode": "enre1239",
        "name": "Enrekang",
        "distanceKm": 136.8
      }
    ]
  },
  {
    "glottocode": "sela1260",
    "name": "Selayar",
    "isocode": "sly",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -6.10145,
    "longitude": 120.496,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Selatan (Kepulauan Selayar)",
    "family": "Austronesian (South Sulawesi)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -5.89752,
        120.496
      ],
      [
        -5.90084,
        120.59316
      ],
      [
        -5.90929,
        120.73833
      ],
      [
        -6.04733,
        120.73445
      ],
      [
        -6.16513,
        120.77659
      ],
      [
        -6.30267,
        120.74976
      ],
      [
        -6.31048,
        120.59724
      ],
      [
        -6.38099,
        120.496
      ],
      [
        -6.33644,
        120.38219
      ],
      [
        -6.21073,
        120.35818
      ],
      [
        -6.15492,
        120.26042
      ],
      [
        -6.05755,
        120.30255
      ],
      [
        -6.00122,
        120.36961
      ],
      [
        -5.87489,
        120.38627
      ],
      [
        -5.89752,
        120.496
      ]
    ],
    "neighbors": [
      {
        "glottocode": "laiy1246",
        "name": "Laiyolo",
        "distanceKm": 39.4
      },
      {
        "glottocode": "maka1311",
        "name": "Makasar",
        "distanceKm": 88.1
      }
    ]
  },
  {
    "glottocode": "laiy1246",
    "name": "Laiyolo",
    "isocode": "lji",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -6.45512,
    "longitude": 120.483,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Selatan (Selayar)",
    "family": "Austronesian (South Sulawesi)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -6.21852,
        120.483
      ],
      [
        -6.16565,
        120.62329
      ],
      [
        -6.29818,
        120.68105
      ],
      [
        -6.39184,
        120.76202
      ],
      [
        -6.52569,
        120.79417
      ],
      [
        -6.59235,
        120.65618
      ],
      [
        -6.69122,
        120.59742
      ],
      [
        -6.702,
        120.483
      ],
      [
        -6.60124,
        120.41218
      ],
      [
        -6.59962,
        120.30064
      ],
      [
        -6.49942,
        120.28766
      ],
      [
        -6.41811,
        120.31981
      ],
      [
        -6.29091,
        120.27577
      ],
      [
        -6.25562,
        120.38631
      ],
      [
        -6.21852,
        120.483
      ]
    ],
    "neighbors": [
      {
        "glottocode": "sela1260",
        "name": "Selayar",
        "distanceKm": 39.4
      },
      {
        "glottocode": "maka1311",
        "name": "Makasar",
        "distanceKm": 114.0
      }
    ]
  },
  {
    "glottocode": "goro1259",
    "name": "Gorontalo",
    "isocode": "gor",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 0.62689,
    "longitude": 122.288,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Gorontalo",
    "family": "Austronesian (Gorontalo-Mongondow)",
    "estimatedRadiusKm": 48.0,
    "estimatedAreaKm2": 6659.2,
    "boundaryPolygon": [
      [
        1.12209,
        122.288
      ],
      [
        0.97137,
        122.4539
      ],
      [
        0.88599,
        122.61292
      ],
      [
        0.72933,
        122.73683
      ],
      [
        0.55829,
        122.58858
      ],
      [
        0.39853,
        122.57437
      ],
      [
        0.30929,
        122.44096
      ],
      [
        0.39687,
        122.288
      ],
      [
        0.31797,
        122.13922
      ],
      [
        0.43383,
        122.04589
      ],
      [
        0.56795,
        122.02976
      ],
      [
        0.71966,
        121.88151
      ],
      [
        0.85069,
        122.00734
      ],
      [
        0.96269,
        122.12628
      ],
      [
        1.12209,
        122.288
      ]
    ],
    "neighbors": [
      {
        "glottocode": "buol1237",
        "name": "Buol",
        "distanceKm": 94.0
      },
      {
        "glottocode": "kaid1239",
        "name": "Kaidipang",
        "distanceKm": 106.4
      },
      {
        "glottocode": "bobo1255",
        "name": "Bobongko",
        "distanceKm": 117.8
      },
      {
        "glottocode": "suwa1241",
        "name": "Suwawa",
        "distanceKm": 120.4
      },
      {
        "glottocode": "bint1245",
        "name": "Bintauna",
        "distanceKm": 133.9
      }
    ]
  },
  {
    "glottocode": "suwa1241",
    "name": "Suwawa",
    "isocode": "swu",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 0.4907,
    "longitude": 123.362,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Gorontalo (Bone Bolango)",
    "family": "Austronesian (Gorontalo-Mongondow)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        0.74323,
        123.362
      ],
      [
        0.72929,
        123.4769
      ],
      [
        0.6736,
        123.59136
      ],
      [
        0.53301,
        123.54738
      ],
      [
        0.44,
        123.58416
      ],
      [
        0.34925,
        123.53937
      ],
      [
        0.35573,
        123.427
      ],
      [
        0.25976,
        123.362
      ],
      [
        0.29369,
        123.26712
      ],
      [
        0.37216,
        123.21335
      ],
      [
        0.42543,
        123.07601
      ],
      [
        0.54758,
        123.11279
      ],
      [
        0.6507,
        123.16136
      ],
      [
        0.79133,
        123.21722
      ],
      [
        0.74323,
        123.362
      ]
    ],
    "neighbors": [
      {
        "glottocode": "bint1245",
        "name": "Bintauna",
        "distanceKm": 32.0
      },
      {
        "glottocode": "kaid1239",
        "name": "Kaidipang",
        "distanceKm": 43.7
      },
      {
        "glottocode": "mong1342",
        "name": "Mongondow",
        "distanceKm": 85.4
      },
      {
        "glottocode": "lola1250",
        "name": "Lolak",
        "distanceKm": 93.2
      },
      {
        "glottocode": "goro1259",
        "name": "Gorontalo",
        "distanceKm": 120.4
      }
    ]
  },
  {
    "glottocode": "kaid1239",
    "name": "Kaidipang",
    "isocode": "kzp",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 0.85641,
    "longitude": 123.217,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Utara (Bolmut)",
    "family": "Austronesian (Gorontalo-Mongondow)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        1.10536,
        123.217
      ],
      [
        1.10714,
        123.33776
      ],
      [
        0.96608,
        123.35454
      ],
      [
        0.90423,
        123.42652
      ],
      [
        0.80664,
        123.43507
      ],
      [
        0.76166,
        123.33583
      ],
      [
        0.64163,
        123.32045
      ],
      [
        0.62188,
        123.217
      ],
      [
        0.67155,
        123.12797
      ],
      [
        0.66464,
        122.9765
      ],
      [
        0.79664,
        122.95511
      ],
      [
        0.91423,
        122.96366
      ],
      [
        1.0631,
        122.95779
      ],
      [
        1.07722,
        123.11065
      ],
      [
        1.10536,
        123.217
      ]
    ],
    "neighbors": [
      {
        "glottocode": "bint1245",
        "name": "Bintauna",
        "distanceKm": 32.1
      },
      {
        "glottocode": "suwa1241",
        "name": "Suwawa",
        "distanceKm": 43.7
      },
      {
        "glottocode": "lola1250",
        "name": "Lolak",
        "distanceKm": 100.1
      },
      {
        "glottocode": "mong1342",
        "name": "Mongondow",
        "distanceKm": 102.4
      },
      {
        "glottocode": "goro1259",
        "name": "Gorontalo",
        "distanceKm": 106.4
      }
    ]
  },
  {
    "glottocode": "bint1245",
    "name": "Bintauna",
    "isocode": "bne",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 0.75069,
    "longitude": 123.486,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Utara (Bolmut)",
    "family": "Austronesian (Gorontalo-Mongondow)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        1.01437,
        123.486
      ],
      [
        0.89902,
        123.55744
      ],
      [
        0.87949,
        123.64752
      ],
      [
        0.80097,
        123.70631
      ],
      [
        0.71518,
        123.64158
      ],
      [
        0.59492,
        123.68134
      ],
      [
        0.52334,
        123.59549
      ],
      [
        0.53089,
        123.486
      ],
      [
        0.46343,
        123.34765
      ],
      [
        0.57805,
        123.26949
      ],
      [
        0.69339,
        123.23492
      ],
      [
        0.82277,
        123.17018
      ],
      [
        0.89637,
        123.30331
      ],
      [
        0.95894,
        123.3857
      ],
      [
        1.01437,
        123.486
      ]
    ],
    "neighbors": [
      {
        "glottocode": "suwa1241",
        "name": "Suwawa",
        "distanceKm": 32.0
      },
      {
        "glottocode": "kaid1239",
        "name": "Kaidipang",
        "distanceKm": 32.1
      },
      {
        "glottocode": "mong1342",
        "name": "Mongondow",
        "distanceKm": 70.8
      },
      {
        "glottocode": "lola1250",
        "name": "Lolak",
        "distanceKm": 71.1
      },
      {
        "glottocode": "goro1259",
        "name": "Gorontalo",
        "distanceKm": 133.9
      }
    ]
  },
  {
    "glottocode": "mong1342",
    "name": "Mongondow",
    "isocode": "mog",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 0.64616,
    "longitude": 124.114,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Utara (Kotamobagu)",
    "family": "Austronesian (Gorontalo-Mongondow)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        0.80399,
        124.114
      ],
      [
        0.82972,
        124.2024
      ],
      [
        0.79187,
        124.29672
      ],
      [
        0.68436,
        124.28137
      ],
      [
        0.58749,
        124.37108
      ],
      [
        0.47773,
        124.32522
      ],
      [
        0.43707,
        124.2147
      ],
      [
        0.32052,
        124.114
      ],
      [
        0.39412,
        123.99262
      ],
      [
        0.49042,
        123.9187
      ],
      [
        0.57677,
        123.80998
      ],
      [
        0.69507,
        123.8997
      ],
      [
        0.77917,
        123.9472
      ],
      [
        0.87266,
        124.00491
      ],
      [
        0.80399,
        124.114
      ]
    ],
    "neighbors": [
      {
        "glottocode": "lola1250",
        "name": "Lolak",
        "distanceKm": 23.3
      },
      {
        "glottocode": "bint1245",
        "name": "Bintauna",
        "distanceKm": 70.8
      },
      {
        "glottocode": "pono1240",
        "name": "Ponosakan",
        "distanceKm": 73.0
      },
      {
        "glottocode": "tons1239",
        "name": "Tonsawang",
        "distanceKm": 75.1
      },
      {
        "glottocode": "suwa1241",
        "name": "Suwawa",
        "distanceKm": 85.4
      }
    ]
  },
  {
    "glottocode": "lola1250",
    "name": "Lolak",
    "isocode": "llq",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 0.85544,
    "longitude": 124.117,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Utara (Bolmong)",
    "family": "Austronesian (Gorontalo-Mongondow)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        1.06189,
        124.117
      ],
      [
        1.07717,
        124.22379
      ],
      [
        0.9719,
        124.26305
      ],
      [
        0.91731,
        124.3881
      ],
      [
        0.79179,
        124.39588
      ],
      [
        0.70554,
        124.30499
      ],
      [
        0.56079,
        124.25891
      ],
      [
        0.57841,
        124.117
      ],
      [
        0.64157,
        124.014
      ],
      [
        0.67046,
        123.88502
      ],
      [
        0.80973,
        123.91669
      ],
      [
        0.89938,
        123.92448
      ],
      [
        1.00698,
        123.92695
      ],
      [
        0.99638,
        124.04912
      ],
      [
        1.06189,
        124.117
      ]
    ],
    "neighbors": [
      {
        "glottocode": "mong1342",
        "name": "Mongondow",
        "distanceKm": 23.3
      },
      {
        "glottocode": "tons1239",
        "name": "Tonsawang",
        "distanceKm": 63.4
      },
      {
        "glottocode": "pono1240",
        "name": "Ponosakan",
        "distanceKm": 66.5
      },
      {
        "glottocode": "bint1245",
        "name": "Bintauna",
        "distanceKm": 71.1
      },
      {
        "glottocode": "tont1239",
        "name": "Tontemboan",
        "distanceKm": 74.0
      }
    ]
  },
  {
    "glottocode": "pono1240",
    "name": "Ponosakan",
    "isocode": "pns",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 0.91716,
    "longitude": 124.712,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Utara (Minahasa Tenggara)",
    "family": "Austronesian (Gorontalo-Mongondow)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        1.179,
        124.712
      ],
      [
        1.10016,
        124.80014
      ],
      [
        1.09858,
        124.93952
      ],
      [
        0.98353,
        125.00282
      ],
      [
        0.86292,
        124.94965
      ],
      [
        0.71593,
        124.96436
      ],
      [
        0.67451,
        124.82887
      ],
      [
        0.69552,
        124.712
      ],
      [
        0.66457,
        124.59034
      ],
      [
        0.79714,
        124.56148
      ],
      [
        0.87595,
        124.5314
      ],
      [
        0.97051,
        124.47824
      ],
      [
        1.01737,
        124.58632
      ],
      [
        1.11011,
        124.61907
      ],
      [
        1.179,
        124.712
      ]
    ],
    "neighbors": [
      {
        "glottocode": "tons1239",
        "name": "Tonsawang",
        "distanceKm": 16.6
      },
      {
        "glottocode": "tont1239",
        "name": "Tontemboan",
        "distanceKm": 37.4
      },
      {
        "glottocode": "tond1251",
        "name": "Tondano",
        "distanceKm": 49.1
      },
      {
        "glottocode": "tomb1243",
        "name": "Tombulu",
        "distanceKm": 53.6
      },
      {
        "glottocode": "mala1481",
        "name": "Manado Malay",
        "distanceKm": 64.4
      }
    ]
  },
  {
    "glottocode": "tond1251",
    "name": "Tondano",
    "isocode": "tdn",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 1.28024,
    "longitude": 124.964,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Utara (Minahasa)",
    "family": "Austronesian (Minahasan)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        1.49893,
        124.964
      ],
      [
        1.55115,
        125.0945
      ],
      [
        1.47077,
        125.20298
      ],
      [
        1.33398,
        125.19952
      ],
      [
        1.21056,
        125.26937
      ],
      [
        1.1195,
        125.16561
      ],
      [
        1.09616,
        125.05267
      ],
      [
        1.01546,
        124.964
      ],
      [
        1.11555,
        124.88467
      ],
      [
        1.16933,
        124.82489
      ],
      [
        1.2264,
        124.72805
      ],
      [
        1.31814,
        124.7979
      ],
      [
        1.42095,
        124.78752
      ],
      [
        1.53176,
        124.84285
      ],
      [
        1.49893,
        124.964
      ]
    ],
    "neighbors": [
      {
        "glottocode": "mala1481",
        "name": "Manado Malay",
        "distanceKm": 26.1
      },
      {
        "glottocode": "tomb1243",
        "name": "Tombulu",
        "distanceKm": 26.7
      },
      {
        "glottocode": "tons1240",
        "name": "Tonsea",
        "distanceKm": 27.8
      },
      {
        "glottocode": "tont1239",
        "name": "Tontemboan",
        "distanceKm": 34.6
      },
      {
        "glottocode": "tons1239",
        "name": "Tonsawang",
        "distanceKm": 42.9
      }
    ]
  },
  {
    "glottocode": "tomb1243",
    "name": "Tombulu",
    "isocode": "tom",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 1.39715,
    "longitude": 124.754,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Utara (Tomohon)",
    "family": "Austronesian (Minahasan)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        1.70293,
        124.754
      ],
      [
        1.67406,
        124.88739
      ],
      [
        1.54304,
        124.93699
      ],
      [
        1.46375,
        125.04586
      ],
      [
        1.34283,
        124.99207
      ],
      [
        1.28033,
        124.90053
      ],
      [
        1.17026,
        124.8633
      ],
      [
        1.21946,
        124.754
      ],
      [
        1.23846,
        124.67756
      ],
      [
        1.2416,
        124.55888
      ],
      [
        1.35616,
        124.57437
      ],
      [
        1.45041,
        124.52058
      ],
      [
        1.58177,
        124.52242
      ],
      [
        1.60585,
        124.65346
      ],
      [
        1.70293,
        124.754
      ]
    ],
    "neighbors": [
      {
        "glottocode": "mala1481",
        "name": "Manado Malay",
        "distanceKm": 13.6
      },
      {
        "glottocode": "tont1239",
        "name": "Tontemboan",
        "distanceKm": 20.0
      },
      {
        "glottocode": "tond1251",
        "name": "Tondano",
        "distanceKm": 26.7
      },
      {
        "glottocode": "tons1240",
        "name": "Tonsea",
        "distanceKm": 35.6
      },
      {
        "glottocode": "tons1239",
        "name": "Tonsawang",
        "distanceKm": 39.8
      }
    ]
  },
  {
    "glottocode": "tons1240",
    "name": "Tonsea",
    "isocode": "txs",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 1.51393,
    "longitude": 125.052,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Utara (Minahasa Utara)",
    "family": "Austronesian (Minahasan)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        1.81746,
        125.052
      ],
      [
        1.71394,
        125.14835
      ],
      [
        1.69018,
        125.27309
      ],
      [
        1.56515,
        125.2765
      ],
      [
        1.4755,
        125.22043
      ],
      [
        1.3624,
        125.24208
      ],
      [
        1.3535,
        125.12928
      ],
      [
        1.33399,
        125.052
      ],
      [
        1.27835,
        124.93851
      ],
      [
        1.38874,
        124.89496
      ],
      [
        1.45757,
        124.80499
      ],
      [
        1.58308,
        124.74891
      ],
      [
        1.66384,
        124.86395
      ],
      [
        1.7891,
        124.91944
      ],
      [
        1.81746,
        125.052
      ]
    ],
    "neighbors": [
      {
        "glottocode": "mala1481",
        "name": "Manado Malay",
        "distanceKm": 23.5
      },
      {
        "glottocode": "tond1251",
        "name": "Tondano",
        "distanceKm": 27.8
      },
      {
        "glottocode": "tomb1243",
        "name": "Tombulu",
        "distanceKm": 35.6
      },
      {
        "glottocode": "tont1239",
        "name": "Tontemboan",
        "distanceKm": 53.2
      },
      {
        "glottocode": "tons1239",
        "name": "Tonsawang",
        "distanceKm": 67.8
      }
    ]
  },
  {
    "glottocode": "tont1239",
    "name": "Tontemboan",
    "isocode": "tnt",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 1.24813,
    "longitude": 124.654,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Utara (Minahasa Selatan)",
    "family": "Austronesian (Minahasan)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        1.4551,
        124.654
      ],
      [
        1.48709,
        124.7691
      ],
      [
        1.38403,
        124.82446
      ],
      [
        1.28417,
        124.81194
      ],
      [
        1.19486,
        124.88745
      ],
      [
        1.13337,
        124.79794
      ],
      [
        1.07817,
        124.73587
      ],
      [
        0.97162,
        124.654
      ],
      [
        1.05149,
        124.55928
      ],
      [
        1.08259,
        124.44637
      ],
      [
        1.17659,
        124.34047
      ],
      [
        1.30244,
        124.41599
      ],
      [
        1.43481,
        124.41985
      ],
      [
        1.51376,
        124.52605
      ],
      [
        1.4551,
        124.654
      ]
    ],
    "neighbors": [
      {
        "glottocode": "tomb1243",
        "name": "Tombulu",
        "distanceKm": 20.0
      },
      {
        "glottocode": "tons1239",
        "name": "Tonsawang",
        "distanceKm": 21.6
      },
      {
        "glottocode": "mala1481",
        "name": "Manado Malay",
        "distanceKm": 33.3
      },
      {
        "glottocode": "tond1251",
        "name": "Tondano",
        "distanceKm": 34.6
      },
      {
        "glottocode": "pono1240",
        "name": "Ponosakan",
        "distanceKm": 37.4
      }
    ]
  },
  {
    "glottocode": "tons1239",
    "name": "Tonsawang",
    "isocode": "tnw",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 1.0539,
    "longitude": 124.652,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Utara (Minahasa)",
    "family": "Austronesian (Minahasan)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        1.30278,
        124.652
      ],
      [
        1.24236,
        124.74277
      ],
      [
        1.15137,
        124.77424
      ],
      [
        1.10759,
        124.88729
      ],
      [
        1.01047,
        124.84233
      ],
      [
        0.9286,
        124.80914
      ],
      [
        0.79012,
        124.77905
      ],
      [
        0.8193,
        124.652
      ],
      [
        0.80676,
        124.53297
      ],
      [
        0.84993,
        124.39618
      ],
      [
        1.00001,
        124.41586
      ],
      [
        1.11805,
        124.37089
      ],
      [
        1.23005,
        124.43108
      ],
      [
        1.22571,
        124.56925
      ],
      [
        1.30278,
        124.652
      ]
    ],
    "neighbors": [
      {
        "glottocode": "pono1240",
        "name": "Ponosakan",
        "distanceKm": 16.6
      },
      {
        "glottocode": "tont1239",
        "name": "Tontemboan",
        "distanceKm": 21.6
      },
      {
        "glottocode": "tomb1243",
        "name": "Tombulu",
        "distanceKm": 39.8
      },
      {
        "glottocode": "tond1251",
        "name": "Tondano",
        "distanceKm": 42.9
      },
      {
        "glottocode": "mala1481",
        "name": "Manado Malay",
        "distanceKm": 52.0
      }
    ]
  },
  {
    "glottocode": "sang1336",
    "name": "Sangir",
    "isocode": "sxn",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 3.50554,
    "longitude": 125.56523,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Utara (Kepulauan Sangihe)",
    "family": "Austronesian (Sangiric)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        3.71067,
        125.56523
      ],
      [
        3.64641,
        125.6332
      ],
      [
        3.66043,
        125.75982
      ],
      [
        3.55234,
        125.77066
      ],
      [
        3.45766,
        125.77541
      ],
      [
        3.3133,
        125.80674
      ],
      [
        3.28208,
        125.67304
      ],
      [
        3.22719,
        125.56523
      ],
      [
        3.21082,
        125.42303
      ],
      [
        3.35899,
        125.38111
      ],
      [
        3.44476,
        125.29843
      ],
      [
        3.56524,
        125.30317
      ],
      [
        3.61474,
        125.42804
      ],
      [
        3.71768,
        125.46288
      ],
      [
        3.71067,
        125.56523
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "tala1285",
    "name": "Talaud",
    "isocode": "tld",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 4.11846,
    "longitude": 126.795,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Utara (Kepulauan Talaud)",
    "family": "Austronesian (Sangiric)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        4.28039,
        126.795
      ],
      [
        4.35254,
        126.90802
      ],
      [
        4.26052,
        126.97359
      ],
      [
        4.1695,
        127.0192
      ],
      [
        4.04697,
        127.10904
      ],
      [
        3.95819,
        126.99649
      ],
      [
        3.86897,
        126.91546
      ],
      [
        3.79691,
        126.795
      ],
      [
        3.91694,
        126.6977
      ],
      [
        3.95907,
        126.59462
      ],
      [
        4.06192,
        126.54663
      ],
      [
        4.15455,
        126.63646
      ],
      [
        4.25964,
        126.61751
      ],
      [
        4.30457,
        126.70514
      ],
      [
        4.28039,
        126.795
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "mala1481",
    "name": "Manado Malay",
    "isocode": "xmm",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 1.48099,
    "longitude": 124.843,
    "isNational": true,
    "isFromCsv": false,
    "island": "Sulawesi",
    "province": "Sulawesi Utara (Kota Manado)",
    "family": "Austronesian (Malayic Creole)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        1.75495,
        124.843
      ],
      [
        1.70249,
        124.9497
      ],
      [
        1.63163,
        125.03196
      ],
      [
        1.55443,
        125.16488
      ],
      [
        1.42296,
        125.09732
      ],
      [
        1.31269,
        125.05411
      ],
      [
        1.20058,
        124.97808
      ],
      [
        1.27147,
        124.843
      ],
      [
        1.26689,
        124.73986
      ],
      [
        1.33019,
        124.65384
      ],
      [
        1.44685,
        124.69337
      ],
      [
        1.53055,
        124.62581
      ],
      [
        1.61413,
        124.67599
      ],
      [
        1.63618,
        124.76824
      ],
      [
        1.75495,
        124.843
      ]
    ],
    "neighbors": [
      {
        "glottocode": "tomb1243",
        "name": "Tombulu",
        "distanceKm": 13.6
      },
      {
        "glottocode": "tons1240",
        "name": "Tonsea",
        "distanceKm": 23.5
      },
      {
        "glottocode": "tond1251",
        "name": "Tondano",
        "distanceKm": 26.1
      },
      {
        "glottocode": "tont1239",
        "name": "Tontemboan",
        "distanceKm": 33.3
      },
      {
        "glottocode": "tons1239",
        "name": "Tonsawang",
        "distanceKm": 52.0
      }
    ]
  },
  {
    "glottocode": "sasa1249",
    "name": "Sasak",
    "isocode": "sas",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.58349,
    "longitude": 116.284,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Barat (Lombok)",
    "family": "Austronesian (Bali-Sasak-Sumbawa)",
    "estimatedRadiusKm": 48.0,
    "estimatedAreaKm2": 6659.2,
    "boundaryPolygon": [
      [
        -8.18993,
        116.284
      ],
      [
        -8.24535,
        116.44869
      ],
      [
        -8.27153,
        116.67962
      ],
      [
        -8.49706,
        116.66696
      ],
      [
        -8.66961,
        116.66561
      ],
      [
        -8.86174,
        116.63687
      ],
      [
        -8.84626,
        116.41198
      ],
      [
        -8.91514,
        116.284
      ],
      [
        -8.89874,
        116.13046
      ],
      [
        -8.72369,
        116.10621
      ],
      [
        -8.65844,
        115.95192
      ],
      [
        -8.50824,
        115.95057
      ],
      [
        -8.40958,
        116.06345
      ],
      [
        -8.19286,
        116.09375
      ],
      [
        -8.18993,
        116.284
      ]
    ],
    "neighbors": [
      {
        "glottocode": "sumb1241",
        "name": "Sumbawa",
        "distanceKm": 131.5
      },
      {
        "glottocode": "bali1278",
        "name": "Balinese",
        "distanceKm": 135.3
      }
    ]
  },
  {
    "glottocode": "sumb1241",
    "name": "Sumbawa",
    "isocode": "smw",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.71919,
    "longitude": 117.472,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Barat (Sumbawa)",
    "family": "Austronesian (Bali-Sasak-Sumbawa)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -8.49699,
        117.472
      ],
      [
        -8.45794,
        117.59928
      ],
      [
        -8.58173,
        117.64639
      ],
      [
        -8.67199,
        117.68121
      ],
      [
        -8.77413,
        117.71553
      ],
      [
        -8.8176,
        117.59684
      ],
      [
        -8.88302,
        117.55182
      ],
      [
        -8.92003,
        117.472
      ],
      [
        -8.83909,
        117.41358
      ],
      [
        -8.84549,
        117.31177
      ],
      [
        -8.76613,
        117.26395
      ],
      [
        -8.68,
        117.29828
      ],
      [
        -8.55384,
        117.26223
      ],
      [
        -8.50188,
        117.36612
      ],
      [
        -8.49699,
        117.472
      ]
    ],
    "neighbors": [
      {
        "glottocode": "bima1247",
        "name": "Bima",
        "distanceKm": 108.2
      },
      {
        "glottocode": "sasa1249",
        "name": "Sasak",
        "distanceKm": 131.5
      }
    ]
  },
  {
    "glottocode": "bima1247",
    "name": "Bima",
    "isocode": "bhp",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.57376,
    "longitude": 118.445,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Barat (Bima & Dompu)",
    "family": "Austronesian (Bima-Lembata)",
    "estimatedRadiusKm": 48.0,
    "estimatedAreaKm2": 6659.2,
    "boundaryPolygon": [
      [
        -8.08816,
        118.445
      ],
      [
        -8.24818,
        118.60356
      ],
      [
        -8.36355,
        118.71157
      ],
      [
        -8.48458,
        118.84012
      ],
      [
        -8.63024,
        118.69524
      ],
      [
        -8.76003,
        118.68122
      ],
      [
        -8.88633,
        118.59723
      ],
      [
        -8.81337,
        118.445
      ],
      [
        -8.90157,
        118.28535
      ],
      [
        -8.81571,
        118.13817
      ],
      [
        -8.64596,
        118.1251
      ],
      [
        -8.46886,
        117.98022
      ],
      [
        -8.30787,
        118.10782
      ],
      [
        -8.23294,
        118.27901
      ],
      [
        -8.08816,
        118.445
      ]
    ],
    "neighbors": [
      {
        "glottocode": "sumb1241",
        "name": "Sumbawa",
        "distanceKm": 108.2
      },
      {
        "glottocode": "kodi1247",
        "name": "Kodi",
        "distanceKm": 139.2
      }
    ]
  },
  {
    "glottocode": "mang1405",
    "name": "Manggarai",
    "isocode": "mqy",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.55748,
    "longitude": 120.329,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Manggarai)",
    "family": "Austronesian (Bima-Lembata)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -8.35856,
        120.329
      ],
      [
        -8.39428,
        120.40848
      ],
      [
        -8.4187,
        120.50499
      ],
      [
        -8.52586,
        120.4691
      ],
      [
        -8.59564,
        120.49806
      ],
      [
        -8.68759,
        120.49399
      ],
      [
        -8.69304,
        120.39502
      ],
      [
        -8.7816,
        120.329
      ],
      [
        -8.77543,
        120.22286
      ],
      [
        -8.68246,
        120.17051
      ],
      [
        -8.61999,
        120.05203
      ],
      [
        -8.5015,
        120.08098
      ],
      [
        -8.42383,
        120.15952
      ],
      [
        -8.31189,
        120.2094
      ],
      [
        -8.35856,
        120.329
      ]
    ],
    "neighbors": [
      {
        "glottocode": "ngad1261",
        "name": "Ngad'a",
        "distanceKm": 75.9
      },
      {
        "glottocode": "keoo1238",
        "name": "Kéo",
        "distanceKm": 107.7
      },
      {
        "glottocode": "nage1237",
        "name": "Nage",
        "distanceKm": 109.1
      },
      {
        "glottocode": "ende1246",
        "name": "Ende",
        "distanceKm": 135.8
      }
    ]
  },
  {
    "glottocode": "weje1237",
    "name": "Wewewa",
    "isocode": "wew",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -9.55099,
    "longitude": 119.349,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Sumba Barat Daya)",
    "family": "Austronesian (Sumba-Hawu)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -9.38377,
        119.349
      ],
      [
        -9.35749,
        119.44349
      ],
      [
        -9.46317,
        119.46067
      ],
      [
        -9.51237,
        119.52059
      ],
      [
        -9.59975,
        119.56561
      ],
      [
        -9.65317,
        119.47893
      ],
      [
        -9.76413,
        119.45309
      ],
      [
        -9.80681,
        119.349
      ],
      [
        -9.73864,
        119.25736
      ],
      [
        -9.72694,
        119.12527
      ],
      [
        -9.6065,
        119.10236
      ],
      [
        -9.50561,
        119.14738
      ],
      [
        -9.38941,
        119.14353
      ],
      [
        -9.38298,
        119.26695
      ],
      [
        -9.38377,
        119.349
      ]
    ],
    "neighbors": [
      {
        "glottocode": "lamb1273",
        "name": "Lamboya",
        "distanceKm": 17.1
      },
      {
        "glottocode": "wanu1241",
        "name": "Wanukaka",
        "distanceKm": 20.9
      },
      {
        "glottocode": "kodi1247",
        "name": "Kodi",
        "distanceKm": 27.5
      },
      {
        "glottocode": "anak1240",
        "name": "Anakalang",
        "distanceKm": 29.6
      },
      {
        "glottocode": "kamb1299",
        "name": "Kambera",
        "distanceKm": 103.9
      }
    ]
  },
  {
    "glottocode": "kodi1247",
    "name": "Kodi",
    "isocode": "kod",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -9.6373,
    "longitude": 119.114,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Kodi, Sumba)",
    "family": "Austronesian (Sumba-Hawu)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -9.42598,
        119.114
      ],
      [
        -9.50705,
        119.17762
      ],
      [
        -9.52502,
        119.25681
      ],
      [
        -9.58556,
        119.34393
      ],
      [
        -9.67701,
        119.29047
      ],
      [
        -9.79184,
        119.31056
      ],
      [
        -9.87751,
        119.23134
      ],
      [
        -9.84903,
        119.114
      ],
      [
        -9.8882,
        118.99144
      ],
      [
        -9.78879,
        118.92132
      ],
      [
        -9.6797,
        118.92559
      ],
      [
        -9.58287,
        118.87213
      ],
      [
        -9.52808,
        118.97508
      ],
      [
        -9.49637,
        119.04516
      ],
      [
        -9.42598,
        119.114
      ]
    ],
    "neighbors": [
      {
        "glottocode": "lamb1273",
        "name": "Lamboya",
        "distanceKm": 26.3
      },
      {
        "glottocode": "weje1237",
        "name": "Wewewa",
        "distanceKm": 27.5
      },
      {
        "glottocode": "wanu1241",
        "name": "Wanukaka",
        "distanceKm": 39.4
      },
      {
        "glottocode": "anak1240",
        "name": "Anakalang",
        "distanceKm": 53.8
      },
      {
        "glottocode": "kamb1299",
        "name": "Kambera",
        "distanceKm": 125.9
      }
    ]
  },
  {
    "glottocode": "lamb1273",
    "name": "Lamboya",
    "isocode": "lmy",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -9.70434,
    "longitude": 119.344,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Sumba Barat)",
    "family": "Austronesian (Sumba-Hawu)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -9.55139,
        119.344
      ],
      [
        -9.53315,
        119.42764
      ],
      [
        -9.55009,
        119.54023
      ],
      [
        -9.66152,
        119.53435
      ],
      [
        -9.7614,
        119.59764
      ],
      [
        -9.87465,
        119.56067
      ],
      [
        -9.89387,
        119.4366
      ],
      [
        -9.97443,
        119.344
      ],
      [
        -9.91429,
        119.24142
      ],
      [
        -9.81385,
        119.20469
      ],
      [
        -9.75565,
        119.11593
      ],
      [
        -9.66727,
        119.17921
      ],
      [
        -9.61089,
        119.22512
      ],
      [
        -9.51272,
        119.25038
      ],
      [
        -9.55139,
        119.344
      ]
    ],
    "neighbors": [
      {
        "glottocode": "wanu1241",
        "name": "Wanukaka",
        "distanceKm": 13.6
      },
      {
        "glottocode": "weje1237",
        "name": "Wewewa",
        "distanceKm": 17.1
      },
      {
        "glottocode": "kodi1247",
        "name": "Kodi",
        "distanceKm": 26.3
      },
      {
        "glottocode": "anak1240",
        "name": "Anakalang",
        "distanceKm": 29.7
      },
      {
        "glottocode": "kamb1299",
        "name": "Kambera",
        "distanceKm": 99.7
      }
    ]
  },
  {
    "glottocode": "anak1240",
    "name": "Anakalang",
    "isocode": "akg",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -9.63425,
    "longitude": 119.605,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Sumba Tengah)",
    "family": "Austronesian (Sumba-Hawu)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -9.43232,
        119.605
      ],
      [
        -9.39815,
        119.72033
      ],
      [
        -9.50691,
        119.76697
      ],
      [
        -9.57616,
        119.86313
      ],
      [
        -9.69541,
        119.87677
      ],
      [
        -9.76164,
        119.76702
      ],
      [
        -9.86662,
        119.71851
      ],
      [
        -9.85536,
        119.605
      ],
      [
        -9.7793,
        119.53415
      ],
      [
        -9.77067,
        119.43149
      ],
      [
        -9.6703,
        119.4448
      ],
      [
        -9.60127,
        119.45844
      ],
      [
        -9.49788,
        119.43155
      ],
      [
        -9.48548,
        119.53233
      ],
      [
        -9.43232,
        119.605
      ]
    ],
    "neighbors": [
      {
        "glottocode": "wanu1241",
        "name": "Wanukaka",
        "distanceKm": 16.6
      },
      {
        "glottocode": "weje1237",
        "name": "Wewewa",
        "distanceKm": 29.6
      },
      {
        "glottocode": "lamb1273",
        "name": "Lamboya",
        "distanceKm": 29.7
      },
      {
        "glottocode": "kodi1247",
        "name": "Kodi",
        "distanceKm": 53.8
      },
      {
        "glottocode": "kamb1299",
        "name": "Kambera",
        "distanceKm": 74.4
      }
    ]
  },
  {
    "glottocode": "wanu1241",
    "name": "Wanukaka",
    "isocode": "wnk",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -9.69834,
    "longitude": 119.468,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Sumba)",
    "family": "Austronesian (Sumba-Hawu)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -9.42356,
        119.468
      ],
      [
        -9.50692,
        119.56152
      ],
      [
        -9.53567,
        119.67494
      ],
      [
        -9.6379,
        119.73663
      ],
      [
        -9.74158,
        119.66019
      ],
      [
        -9.85002,
        119.66096
      ],
      [
        -9.88651,
        119.55993
      ],
      [
        -9.8466,
        119.468
      ],
      [
        -9.88807,
        119.37531
      ],
      [
        -9.79943,
        119.3394
      ],
      [
        -9.73204,
        119.31822
      ],
      [
        -9.64744,
        119.24178
      ],
      [
        -9.58626,
        119.32542
      ],
      [
        -9.50537,
        119.37372
      ],
      [
        -9.42356,
        119.468
      ]
    ],
    "neighbors": [
      {
        "glottocode": "lamb1273",
        "name": "Lamboya",
        "distanceKm": 13.6
      },
      {
        "glottocode": "anak1240",
        "name": "Anakalang",
        "distanceKm": 16.6
      },
      {
        "glottocode": "weje1237",
        "name": "Wewewa",
        "distanceKm": 20.9
      },
      {
        "glottocode": "kodi1247",
        "name": "Kodi",
        "distanceKm": 39.4
      },
      {
        "glottocode": "kamb1299",
        "name": "Kambera",
        "distanceKm": 86.6
      }
    ]
  },
  {
    "glottocode": "kamb1299",
    "name": "Kambera",
    "isocode": "xbr",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -9.88447,
    "longitude": 120.235,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Sumba Timur)",
    "family": "Austronesian (Sumba-Hawu)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -9.66828,
        120.235
      ],
      [
        -9.65397,
        120.34768
      ],
      [
        -9.71985,
        120.44454
      ],
      [
        -9.84407,
        120.41469
      ],
      [
        -9.93516,
        120.46043
      ],
      [
        -10.00791,
        120.39212
      ],
      [
        -10.00961,
        120.29617
      ],
      [
        -10.09132,
        120.235
      ],
      [
        -10.03512,
        120.16136
      ],
      [
        -9.98361,
        120.10881
      ],
      [
        -9.9382,
        119.99604
      ],
      [
        -9.84102,
        120.04178
      ],
      [
        -9.74415,
        120.05639
      ],
      [
        -9.62846,
        120.10986
      ],
      [
        -9.66828,
        120.235
      ]
    ],
    "neighbors": [
      {
        "glottocode": "anak1240",
        "name": "Anakalang",
        "distanceKm": 74.4
      },
      {
        "glottocode": "wanu1241",
        "name": "Wanukaka",
        "distanceKm": 86.6
      },
      {
        "glottocode": "lamb1273",
        "name": "Lamboya",
        "distanceKm": 99.7
      },
      {
        "glottocode": "weje1237",
        "name": "Wewewa",
        "distanceKm": 103.9
      },
      {
        "glottocode": "kodi1247",
        "name": "Kodi",
        "distanceKm": 125.9
      }
    ]
  },
  {
    "glottocode": "sabu1255",
    "name": "Hawu",
    "isocode": "hvn",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -10.5522,
    "longitude": 121.847,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Sabu Raijua)",
    "family": "Austronesian (Sumba-Hawu)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -10.30594,
        121.847
      ],
      [
        -10.32406,
        121.95876
      ],
      [
        -10.44767,
        121.98033
      ],
      [
        -10.50476,
        122.05843
      ],
      [
        -10.59448,
        122.03544
      ],
      [
        -10.63572,
        121.95354
      ],
      [
        -10.73957,
        121.93878
      ],
      [
        -10.72898,
        121.847
      ],
      [
        -10.7052,
        121.77205
      ],
      [
        -10.71143,
        121.6439
      ],
      [
        -10.59889,
        121.6389
      ],
      [
        -10.50035,
        121.61592
      ],
      [
        -10.37196,
        121.6171
      ],
      [
        -10.35842,
        121.75208
      ],
      [
        -10.30594,
        121.847
      ]
    ],
    "neighbors": [
      {
        "glottocode": "dhao1237",
        "name": "Dhao",
        "distanceKm": 93.1
      },
      {
        "glottocode": "dela1251",
        "name": "Dela-Oenale",
        "distanceKm": 114.6
      },
      {
        "glottocode": "deng1253",
        "name": "Dengka",
        "distanceKm": 122.9
      }
    ]
  },
  {
    "glottocode": "dhao1237",
    "name": "Dhao",
    "isocode": "nfa",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -10.8098,
    "longitude": 122.658,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Pulau Ndao)",
    "family": "Austronesian (Sumba-Hawu)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -10.56916,
        122.658
      ],
      [
        -10.67081,
        122.72614
      ],
      [
        -10.68442,
        122.81806
      ],
      [
        -10.76838,
        122.84276
      ],
      [
        -10.83961,
        122.79098
      ],
      [
        -10.94303,
        122.82808
      ],
      [
        -10.98091,
        122.74189
      ],
      [
        -10.99221,
        122.658
      ],
      [
        -11.05196,
        122.53928
      ],
      [
        -10.94818,
        122.48134
      ],
      [
        -10.86251,
        122.42287
      ],
      [
        -10.74548,
        122.37109
      ],
      [
        -10.67927,
        122.49136
      ],
      [
        -10.59977,
        122.55503
      ],
      [
        -10.56916,
        122.658
      ]
    ],
    "neighbors": [
      {
        "glottocode": "dela1251",
        "name": "Dela-Oenale",
        "distanceKm": 21.6
      },
      {
        "glottocode": "deng1253",
        "name": "Dengka",
        "distanceKm": 31.6
      },
      {
        "glottocode": "ter1237",
        "name": "Termanu",
        "distanceKm": 56.5
      },
      {
        "glottocode": "bilb1242",
        "name": "Bilba",
        "distanceKm": 73.1
      },
      {
        "glottocode": "ring1244",
        "name": "Ringgou",
        "distanceKm": 76.9
      }
    ]
  },
  {
    "glottocode": "ter1237",
    "name": "Termanu",
    "isocode": "twu",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -10.7326,
    "longitude": 123.169,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Rote Ndao)",
    "family": "Austronesian (Timoric)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -10.58954,
        123.169
      ],
      [
        -10.55892,
        123.25413
      ],
      [
        -10.61598,
        123.31784
      ],
      [
        -10.7017,
        123.30679
      ],
      [
        -10.78227,
        123.39048
      ],
      [
        -10.86055,
        123.33231
      ],
      [
        -10.90835,
        123.25515
      ],
      [
        -11.01258,
        123.169
      ],
      [
        -10.94007,
        123.06731
      ],
      [
        -10.87975,
        122.9812
      ],
      [
        -10.79584,
        122.88702
      ],
      [
        -10.68813,
        122.97071
      ],
      [
        -10.59679,
        122.99567
      ],
      [
        -10.52721,
        123.06833
      ],
      [
        -10.58954,
        123.169
      ]
    ],
    "neighbors": [
      {
        "glottocode": "bilb1242",
        "name": "Bilba",
        "distanceKm": 17.6
      },
      {
        "glottocode": "deng1253",
        "name": "Dengka",
        "distanceKm": 25.1
      },
      {
        "glottocode": "ring1244",
        "name": "Ringgou",
        "distanceKm": 25.4
      },
      {
        "glottocode": "dela1251",
        "name": "Dela-Oenale",
        "distanceKm": 36.9
      },
      {
        "glottocode": "dhao1237",
        "name": "Dhao",
        "distanceKm": 56.5
      }
    ]
  },
  {
    "glottocode": "deng1253",
    "name": "Dengka",
    "isocode": "dnk",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -10.7866,
    "longitude": 122.946,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Rote Ndao)",
    "family": "Austronesian (Timoric)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -10.59753,
        122.946
      ],
      [
        -10.61291,
        123.03115
      ],
      [
        -10.69434,
        123.06377
      ],
      [
        -10.73425,
        123.17946
      ],
      [
        -10.83578,
        123.16537
      ],
      [
        -10.91512,
        123.11006
      ],
      [
        -11.04571,
        123.07303
      ],
      [
        -11.02057,
        122.946
      ],
      [
        -10.99406,
        122.8443
      ],
      [
        -10.9581,
        122.72707
      ],
      [
        -10.82839,
        122.75961
      ],
      [
        -10.74165,
        122.74552
      ],
      [
        -10.65136,
        122.77336
      ],
      [
        -10.66456,
        122.88617
      ],
      [
        -10.59753,
        122.946
      ]
    ],
    "neighbors": [
      {
        "glottocode": "dela1251",
        "name": "Dela-Oenale",
        "distanceKm": 12.3
      },
      {
        "glottocode": "ter1237",
        "name": "Termanu",
        "distanceKm": 25.1
      },
      {
        "glottocode": "dhao1237",
        "name": "Dhao",
        "distanceKm": 31.6
      },
      {
        "glottocode": "bilb1242",
        "name": "Bilba",
        "distanceKm": 42.3
      },
      {
        "glottocode": "ring1244",
        "name": "Ringgou",
        "distanceKm": 47.7
      }
    ]
  },
  {
    "glottocode": "bilb1242",
    "name": "Bilba",
    "isocode": "bpz",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -10.6503,
    "longitude": 123.307,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Rote Ndao)",
    "family": "Austronesian (Timoric)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -10.44743,
        123.307
      ],
      [
        -10.50603,
        123.37769
      ],
      [
        -10.49556,
        123.50444
      ],
      [
        -10.59787,
        123.54076
      ],
      [
        -10.69794,
        123.51938
      ],
      [
        -10.83152,
        123.53822
      ],
      [
        -10.86003,
        123.40977
      ],
      [
        -10.87047,
        123.307
      ],
      [
        -10.88718,
        123.19092
      ],
      [
        -10.75932,
        123.1679
      ],
      [
        -10.692,
        123.12109
      ],
      [
        -10.6038,
        123.09972
      ],
      [
        -10.56776,
        123.20168
      ],
      [
        -10.47889,
        123.223
      ],
      [
        -10.44743,
        123.307
      ]
    ],
    "neighbors": [
      {
        "glottocode": "ring1244",
        "name": "Ringgou",
        "distanceKm": 11.0
      },
      {
        "glottocode": "ter1237",
        "name": "Termanu",
        "distanceKm": 17.6
      },
      {
        "glottocode": "deng1253",
        "name": "Dengka",
        "distanceKm": 42.3
      },
      {
        "glottocode": "helo1243",
        "name": "Helong",
        "distanceKm": 43.6
      },
      {
        "glottocode": "dela1251",
        "name": "Dela-Oenale",
        "distanceKm": 54.3
      }
    ]
  },
  {
    "glottocode": "dela1251",
    "name": "Dela-Oenale",
    "isocode": "row",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -10.8469,
    "longitude": 122.852,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Rote Ndao)",
    "family": "Austronesian (Timoric)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -10.6731,
        122.852
      ],
      [
        -10.61234,
        122.96701
      ],
      [
        -10.69261,
        123.04899
      ],
      [
        -10.79842,
        123.06825
      ],
      [
        -10.91115,
        123.13861
      ],
      [
        -10.98847,
        123.03275
      ],
      [
        -11.0332,
        122.94335
      ],
      [
        -11.09614,
        122.852
      ],
      [
        -10.99349,
        122.78012
      ],
      [
        -10.95637,
        122.71223
      ],
      [
        -10.89256,
        122.64832
      ],
      [
        -10.81701,
        122.71867
      ],
      [
        -10.72471,
        122.69599
      ],
      [
        -10.65206,
        122.75646
      ],
      [
        -10.6731,
        122.852
      ]
    ],
    "neighbors": [
      {
        "glottocode": "deng1253",
        "name": "Dengka",
        "distanceKm": 12.3
      },
      {
        "glottocode": "dhao1237",
        "name": "Dhao",
        "distanceKm": 21.6
      },
      {
        "glottocode": "ter1237",
        "name": "Termanu",
        "distanceKm": 36.9
      },
      {
        "glottocode": "bilb1242",
        "name": "Bilba",
        "distanceKm": 54.3
      },
      {
        "glottocode": "ring1244",
        "name": "Ringgou",
        "distanceKm": 60.0
      }
    ]
  },
  {
    "glottocode": "ring1244",
    "name": "Ringgou",
    "isocode": "rgu",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -10.5515,
    "longitude": 123.311,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Rote Timur)",
    "family": "Austronesian (Timoric)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -10.28143,
        123.311
      ],
      [
        -10.3215,
        123.42367
      ],
      [
        -10.41631,
        123.48344
      ],
      [
        -10.48875,
        123.59066
      ],
      [
        -10.59994,
        123.52687
      ],
      [
        -10.67092,
        123.46332
      ],
      [
        -10.7639,
        123.41505
      ],
      [
        -10.70447,
        123.311
      ],
      [
        -10.70265,
        123.23696
      ],
      [
        -10.68007,
        123.147
      ],
      [
        -10.58289,
        123.17113
      ],
      [
        -10.5058,
        123.10734
      ],
      [
        -10.40716,
        123.12689
      ],
      [
        -10.38276,
        123.22834
      ],
      [
        -10.28143,
        123.311
      ]
    ],
    "neighbors": [
      {
        "glottocode": "bilb1242",
        "name": "Bilba",
        "distanceKm": 11.0
      },
      {
        "glottocode": "ter1237",
        "name": "Termanu",
        "distanceKm": 25.4
      },
      {
        "glottocode": "helo1243",
        "name": "Helong",
        "distanceKm": 32.7
      },
      {
        "glottocode": "deng1253",
        "name": "Dengka",
        "distanceKm": 47.7
      },
      {
        "glottocode": "kupa1239",
        "name": "Kupang Malay",
        "distanceKm": 48.2
      }
    ]
  },
  {
    "glottocode": "helo1243",
    "name": "Helong",
    "isocode": "heg",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -10.2647,
    "longitude": 123.377,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Semau & Kupang)",
    "family": "Austronesian (Timoric)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -10.00636,
        123.377
      ],
      [
        -10.07456,
        123.47005
      ],
      [
        -10.0956,
        123.5925
      ],
      [
        -10.21886,
        123.5811
      ],
      [
        -10.30389,
        123.55148
      ],
      [
        -10.40443,
        123.55507
      ],
      [
        -10.39714,
        123.44182
      ],
      [
        -10.4294,
        123.377
      ],
      [
        -10.45571,
        123.28352
      ],
      [
        -10.35936,
        123.25637
      ],
      [
        -10.313,
        123.16196
      ],
      [
        -10.20975,
        123.13234
      ],
      [
        -10.14067,
        123.21895
      ],
      [
        -10.016,
        123.25528
      ],
      [
        -10.00636,
        123.377
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kupa1239",
        "name": "Kupang Malay",
        "distanceKm": 27.7
      },
      {
        "glottocode": "ring1244",
        "name": "Ringgou",
        "distanceKm": 32.7
      },
      {
        "glottocode": "bilb1242",
        "name": "Bilba",
        "distanceKm": 43.6
      },
      {
        "glottocode": "ter1237",
        "name": "Termanu",
        "distanceKm": 56.8
      },
      {
        "glottocode": "deng1253",
        "name": "Dengka",
        "distanceKm": 74.8
      }
    ]
  },
  {
    "glottocode": "kupa1239",
    "name": "Kupang Malay",
    "isocode": "mkn",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -10.2526,
    "longitude": 123.63,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Kota Kupang)",
    "family": "Austronesian (Malayic)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -10.05153,
        123.63
      ],
      [
        -10.02049,
        123.74359
      ],
      [
        -10.13187,
        123.78385
      ],
      [
        -10.2165,
        123.79071
      ],
      [
        -10.30062,
        123.84378
      ],
      [
        -10.34343,
        123.74574
      ],
      [
        -10.40265,
        123.70343
      ],
      [
        -10.47457,
        123.63
      ],
      [
        -10.40163,
        123.55707
      ],
      [
        -10.39563,
        123.44774
      ],
      [
        -10.31064,
        123.37158
      ],
      [
        -10.20648,
        123.42465
      ],
      [
        -10.07967,
        123.40963
      ],
      [
        -10.02151,
        123.51691
      ],
      [
        -10.05153,
        123.63
      ]
    ],
    "neighbors": [
      {
        "glottocode": "helo1243",
        "name": "Helong",
        "distanceKm": 27.7
      },
      {
        "glottocode": "ring1244",
        "name": "Ringgou",
        "distanceKm": 48.2
      },
      {
        "glottocode": "bilb1242",
        "name": "Bilba",
        "distanceKm": 56.6
      },
      {
        "glottocode": "ter1237",
        "name": "Termanu",
        "distanceKm": 73.4
      },
      {
        "glottocode": "uabm1237",
        "name": "Uab Meto",
        "distanceKm": 77.5
      }
    ]
  },
  {
    "glottocode": "uabm1237",
    "name": "Uab Meto",
    "isocode": "aoz",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -9.77284,
    "longitude": 124.144,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Timor Barat)",
    "family": "Austronesian (Timoric)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -9.53004,
        124.144
      ],
      [
        -9.60857,
        124.22427
      ],
      [
        -9.67846,
        124.26409
      ],
      [
        -9.72572,
        124.35349
      ],
      [
        -9.80607,
        124.29172
      ],
      [
        -9.88063,
        124.28115
      ],
      [
        -9.98456,
        124.24746
      ],
      [
        -9.95308,
        124.144
      ],
      [
        -9.98972,
        124.03802
      ],
      [
        -9.94222,
        123.92847
      ],
      [
        -9.81985,
        123.93498
      ],
      [
        -9.71193,
        123.87321
      ],
      [
        -9.61686,
        123.94553
      ],
      [
        -9.60342,
        124.06121
      ],
      [
        -9.53004,
        124.144
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kupa1239",
        "name": "Kupang Malay",
        "distanceKm": 77.5
      },
      {
        "glottocode": "helo1243",
        "name": "Helong",
        "distanceKm": 100.2
      },
      {
        "glottocode": "ring1244",
        "name": "Ringgou",
        "distanceKm": 125.7
      },
      {
        "glottocode": "bilb1242",
        "name": "Bilba",
        "distanceKm": 133.8
      },
      {
        "glottocode": "buna1278",
        "name": "Bunak",
        "distanceKm": 137.2
      }
    ]
  },
  {
    "glottocode": "tetu1245",
    "name": "Tetum",
    "isocode": "tet",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -9.11217,
    "longitude": 125.528,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Nusa Tenggara Timur (Belu) & Timor-Leste",
    "family": "Austronesian (Timoric)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -8.91373,
        125.528
      ],
      [
        -8.96313,
        125.60069
      ],
      [
        -8.96072,
        125.72034
      ],
      [
        -9.07208,
        125.7059
      ],
      [
        -9.15863,
        125.73417
      ],
      [
        -9.29001,
        125.75385
      ],
      [
        -9.31254,
        125.62573
      ],
      [
        -9.39721,
        125.528
      ],
      [
        -9.39873,
        125.38824
      ],
      [
        -9.26216,
        125.33752
      ],
      [
        -9.17966,
        125.22852
      ],
      [
        -9.05105,
        125.25679
      ],
      [
        -8.98856,
        125.37102
      ],
      [
        -8.87694,
        125.41327
      ],
      [
        -8.91373,
        125.528
      ]
    ],
    "neighbors": [
      {
        "glottocode": "buna1278",
        "name": "Bunak",
        "distanceKm": 34.4
      },
      {
        "glottocode": "kema1243",
        "name": "Kemak",
        "distanceKm": 42.3
      },
      {
        "glottocode": "adab1235",
        "name": "Adabe",
        "distanceKm": 98.6
      },
      {
        "glottocode": "kama1365",
        "name": "Kamang",
        "distanceKm": 123.8
      },
      {
        "glottocode": "abui1241",
        "name": "Abui",
        "distanceKm": 136.5
      }
    ]
  },
  {
    "glottocode": "buna1278",
    "name": "Bunak",
    "isocode": "bfn",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -9.13618,
    "longitude": 125.216,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Lamaknen, Belu)",
    "family": "Timor-Alor-Pantar (Papuan)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -8.9932,
        125.216
      ],
      [
        -8.93973,
        125.31182
      ],
      [
        -9.03029,
        125.35048
      ],
      [
        -9.09287,
        125.40819
      ],
      [
        -9.19493,
        125.4767
      ],
      [
        -9.26513,
        125.37978
      ],
      [
        -9.3652,
        125.32771
      ],
      [
        -9.41624,
        125.216
      ],
      [
        -9.32088,
        125.12591
      ],
      [
        -9.29406,
        125.01549
      ],
      [
        -9.18701,
        124.99045
      ],
      [
        -9.10079,
        125.05896
      ],
      [
        -9.00137,
        125.04478
      ],
      [
        -8.98406,
        125.1418
      ],
      [
        -8.9932,
        125.216
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kema1243",
        "name": "Kemak",
        "distanceKm": 16.1
      },
      {
        "glottocode": "tetu1245",
        "name": "Tetum",
        "distanceKm": 34.4
      },
      {
        "glottocode": "kama1365",
        "name": "Kamang",
        "distanceKm": 107.1
      },
      {
        "glottocode": "adab1235",
        "name": "Adabe",
        "distanceKm": 108.6
      },
      {
        "glottocode": "abui1241",
        "name": "Abui",
        "distanceKm": 114.9
      }
    ]
  },
  {
    "glottocode": "kema1243",
    "name": "Kemak",
    "isocode": "kem",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -9.00299,
    "longitude": 125.159,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Belu)",
    "family": "Austronesian (Timoric)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -8.77545,
        125.159
      ],
      [
        -8.83672,
        125.24007
      ],
      [
        -8.87393,
        125.32285
      ],
      [
        -8.94144,
        125.43205
      ],
      [
        -9.05095,
        125.37175
      ],
      [
        -9.16154,
        125.36029
      ],
      [
        -9.25247,
        125.28064
      ],
      [
        -9.19849,
        125.159
      ],
      [
        -9.21787,
        125.05423
      ],
      [
        -9.1377,
        124.98798
      ],
      [
        -9.03557,
        125.01447
      ],
      [
        -8.95682,
        124.95417
      ],
      [
        -8.89777,
        125.02542
      ],
      [
        -8.87132,
        125.0948
      ],
      [
        -8.77545,
        125.159
      ]
    ],
    "neighbors": [
      {
        "glottocode": "buna1278",
        "name": "Bunak",
        "distanceKm": 16.1
      },
      {
        "glottocode": "tetu1245",
        "name": "Tetum",
        "distanceKm": 42.3
      },
      {
        "glottocode": "kama1365",
        "name": "Kamang",
        "distanceKm": 91.0
      },
      {
        "glottocode": "adab1235",
        "name": "Adabe",
        "distanceKm": 97.7
      },
      {
        "glottocode": "abui1241",
        "name": "Abui",
        "distanceKm": 99.3
      }
    ]
  },
  {
    "glottocode": "alor1247",
    "name": "Alorese",
    "isocode": "aol",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.20382,
    "longitude": 124.264,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Pantar & Alor)",
    "family": "Austronesian (Flores-Lembata)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -8.00364,
        124.264
      ],
      [
        -8.00734,
        124.3596
      ],
      [
        -8.02555,
        124.48985
      ],
      [
        -8.15491,
        124.4805
      ],
      [
        -8.25933,
        124.50972
      ],
      [
        -8.37176,
        124.47676
      ],
      [
        -8.36885,
        124.3443
      ],
      [
        -8.42668,
        124.264
      ],
      [
        -8.38848,
        124.17415
      ],
      [
        -8.28931,
        124.15569
      ],
      [
        -8.24905,
        124.0638
      ],
      [
        -8.1652,
        124.09302
      ],
      [
        -8.10799,
        124.1426
      ],
      [
        -7.98771,
        124.15885
      ],
      [
        -8.00364,
        124.264
      ]
    ],
    "neighbors": [
      {
        "glottocode": "blag1240",
        "name": "Blagar",
        "distanceKm": 12.8
      },
      {
        "glottocode": "adan1251",
        "name": "Adang",
        "distanceKm": 20.3
      },
      {
        "glottocode": "teiw1235",
        "name": "Teiwa",
        "distanceKm": 21.6
      },
      {
        "glottocode": "kaer1234",
        "name": "Kaera",
        "distanceKm": 30.5
      },
      {
        "glottocode": "abui1241",
        "name": "Abui",
        "distanceKm": 37.6
      }
    ]
  },
  {
    "glottocode": "abui1241",
    "name": "Abui",
    "isocode": "abz",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.31058,
    "longitude": 124.588,
    "isNational": true,
    "isFromCsv": true,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Alor Tengah)",
    "family": "Timor-Alor-Pantar (Papuan)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -8.08423,
        124.588
      ],
      [
        -8.04854,
        124.71553
      ],
      [
        -8.17391,
        124.7612
      ],
      [
        -8.25715,
        124.82456
      ],
      [
        -8.36809,
        124.84266
      ],
      [
        -8.41631,
        124.72198
      ],
      [
        -8.49799,
        124.67921
      ],
      [
        -8.50727,
        124.588
      ],
      [
        -8.42969,
        124.53003
      ],
      [
        -8.43767,
        124.42694
      ],
      [
        -8.35129,
        124.40775
      ],
      [
        -8.27396,
        124.42585
      ],
      [
        -8.15254,
        124.38773
      ],
      [
        -8.11685,
        124.49371
      ],
      [
        -8.08423,
        124.588
      ]
    ],
    "neighbors": [
      {
        "glottocode": "adan1251",
        "name": "Adang",
        "distanceKm": 20.5
      },
      {
        "glottocode": "kama1365",
        "name": "Kamang",
        "distanceKm": 22.9
      },
      {
        "glottocode": "blag1240",
        "name": "Blagar",
        "distanceKm": 37.1
      },
      {
        "glottocode": "alor1247",
        "name": "Alorese",
        "distanceKm": 37.6
      },
      {
        "glottocode": "teiw1235",
        "name": "Teiwa",
        "distanceKm": 46.1
      }
    ]
  },
  {
    "glottocode": "adan1251",
    "name": "Adang",
    "isocode": "adn",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.18958,
    "longitude": 124.448,
    "isNational": true,
    "isFromCsv": true,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Alor Barat)",
    "family": "Timor-Alor-Pantar (Papuan)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -7.89876,
        124.448
      ],
      [
        -7.9968,
        124.54179
      ],
      [
        -8.04798,
        124.6274
      ],
      [
        -8.13491,
        124.69001
      ],
      [
        -8.22438,
        124.60205
      ],
      [
        -8.31152,
        124.60249
      ],
      [
        -8.36296,
        124.53236
      ],
      [
        -8.3218,
        124.448
      ],
      [
        -8.37795,
        124.35635
      ],
      [
        -8.31174,
        124.29324
      ],
      [
        -8.22904,
        124.27333
      ],
      [
        -8.13025,
        124.18537
      ],
      [
        -8.04776,
        124.26833
      ],
      [
        -7.98182,
        124.34692
      ],
      [
        -7.89876,
        124.448
      ]
    ],
    "neighbors": [
      {
        "glottocode": "alor1247",
        "name": "Alorese",
        "distanceKm": 20.3
      },
      {
        "glottocode": "abui1241",
        "name": "Abui",
        "distanceKm": 20.5
      },
      {
        "glottocode": "blag1240",
        "name": "Blagar",
        "distanceKm": 26.0
      },
      {
        "glottocode": "teiw1235",
        "name": "Teiwa",
        "distanceKm": 36.6
      },
      {
        "glottocode": "kama1365",
        "name": "Kamang",
        "distanceKm": 38.9
      }
    ]
  },
  {
    "glottocode": "kama1365",
    "name": "Kamang",
    "isocode": "woi",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.26897,
    "longitude": 124.792,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Alor)",
    "family": "Timor-Alor-Pantar (Papuan)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -8.0641,
        124.792
      ],
      [
        -8.07806,
        124.8849
      ],
      [
        -8.12385,
        124.97589
      ],
      [
        -8.23663,
        124.93517
      ],
      [
        -8.31056,
        124.97612
      ],
      [
        -8.38925,
        124.94441
      ],
      [
        -8.39253,
        124.85213
      ],
      [
        -8.48714,
        124.792
      ],
      [
        -8.45921,
        124.69943
      ],
      [
        -8.38761,
        124.64167
      ],
      [
        -8.33077,
        124.5184
      ],
      [
        -8.21642,
        124.55935
      ],
      [
        -8.12549,
        124.61019
      ],
      [
        -8.01138,
        124.66665
      ],
      [
        -8.0641,
        124.792
      ]
    ],
    "neighbors": [
      {
        "glottocode": "abui1241",
        "name": "Abui",
        "distanceKm": 22.9
      },
      {
        "glottocode": "adan1251",
        "name": "Adang",
        "distanceKm": 38.9
      },
      {
        "glottocode": "alor1247",
        "name": "Alorese",
        "distanceKm": 58.6
      },
      {
        "glottocode": "blag1240",
        "name": "Blagar",
        "distanceKm": 59.8
      },
      {
        "glottocode": "teiw1235",
        "name": "Teiwa",
        "distanceKm": 69.0
      }
    ]
  },
  {
    "glottocode": "blag1240",
    "name": "Blagar",
    "isocode": "beu",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.31787,
    "longitude": 124.251,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Pulau Pura & Pantar)",
    "family": "Timor-Alor-Pantar (Papuan)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -8.12179,
        124.251
      ],
      [
        -8.11846,
        124.34805
      ],
      [
        -8.23197,
        124.35985
      ],
      [
        -8.27719,
        124.43111
      ],
      [
        -8.36198,
        124.44633
      ],
      [
        -8.4091,
        124.36662
      ],
      [
        -8.52498,
        124.3518
      ],
      [
        -8.54483,
        124.251
      ],
      [
        -8.49961,
        124.16255
      ],
      [
        -8.49574,
        124.02559
      ],
      [
        -8.37133,
        124.0143
      ],
      [
        -8.26785,
        124.02951
      ],
      [
        -8.14534,
        124.03235
      ],
      [
        -8.14384,
        124.1663
      ],
      [
        -8.12179,
        124.251
      ]
    ],
    "neighbors": [
      {
        "glottocode": "teiw1235",
        "name": "Teiwa",
        "distanceKm": 10.7
      },
      {
        "glottocode": "alor1247",
        "name": "Alorese",
        "distanceKm": 12.8
      },
      {
        "glottocode": "kaer1234",
        "name": "Kaera",
        "distanceKm": 25.7
      },
      {
        "glottocode": "adan1251",
        "name": "Adang",
        "distanceKm": 26.0
      },
      {
        "glottocode": "lamm1241",
        "name": "Western Pantar",
        "distanceKm": 31.6
      }
    ]
  },
  {
    "glottocode": "teiw1235",
    "name": "Teiwa",
    "isocode": "twe",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.37662,
    "longitude": 124.174,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Pantar)",
    "family": "Timor-Alor-Pantar (Papuan)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -8.16372,
        124.174
      ],
      [
        -8.25524,
        124.23308
      ],
      [
        -8.26214,
        124.3191
      ],
      [
        -8.33035,
        124.37893
      ],
      [
        -8.41192,
        124.33033
      ],
      [
        -8.52788,
        124.36572
      ],
      [
        -8.59434,
        124.27998
      ],
      [
        -8.58676,
        124.174
      ],
      [
        -8.63639,
        124.04755
      ],
      [
        -8.5259,
        123.98479
      ],
      [
        -8.42448,
        123.96205
      ],
      [
        -8.31779,
        123.91345
      ],
      [
        -8.26412,
        124.03141
      ],
      [
        -8.21319,
        124.09445
      ],
      [
        -8.16372,
        124.174
      ]
    ],
    "neighbors": [
      {
        "glottocode": "blag1240",
        "name": "Blagar",
        "distanceKm": 10.7
      },
      {
        "glottocode": "kaer1234",
        "name": "Kaera",
        "distanceKm": 18.0
      },
      {
        "glottocode": "lamm1241",
        "name": "Western Pantar",
        "distanceKm": 21.2
      },
      {
        "glottocode": "alor1247",
        "name": "Alorese",
        "distanceKm": 21.6
      },
      {
        "glottocode": "adan1251",
        "name": "Adang",
        "distanceKm": 36.6
      }
    ]
  },
  {
    "glottocode": "kaer1234",
    "name": "Kaera",
    "isocode": "jka",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.3287,
    "longitude": 124.0177,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Pantar Timur)",
    "family": "Timor-Alor-Pantar (Papuan)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -8.19206,
        124.0177
      ],
      [
        -8.15841,
        124.10058
      ],
      [
        -8.19089,
        124.19235
      ],
      [
        -8.2903,
        124.18774
      ],
      [
        -8.38536,
        124.26861
      ],
      [
        -8.48683,
        124.21811
      ],
      [
        -8.52188,
        124.11172
      ],
      [
        -8.6151,
        124.0177
      ],
      [
        -8.53956,
        123.91507
      ],
      [
        -8.45465,
        123.85808
      ],
      [
        -8.38443,
        123.77091
      ],
      [
        -8.29123,
        123.85178
      ],
      [
        -8.22307,
        123.88383
      ],
      [
        -8.14073,
        123.92622
      ],
      [
        -8.19206,
        124.0177
      ]
    ],
    "neighbors": [
      {
        "glottocode": "teiw1235",
        "name": "Teiwa",
        "distanceKm": 18.0
      },
      {
        "glottocode": "lamm1241",
        "name": "Western Pantar",
        "distanceKm": 22.6
      },
      {
        "glottocode": "blag1240",
        "name": "Blagar",
        "distanceKm": 25.7
      },
      {
        "glottocode": "keda1252",
        "name": "Kedang",
        "distanceKm": 29.4
      },
      {
        "glottocode": "alor1247",
        "name": "Alorese",
        "distanceKm": 30.5
      }
    ]
  },
  {
    "glottocode": "lamm1241",
    "name": "Western Pantar",
    "isocode": "lev",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.52787,
    "longitude": 124.057,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Pantar Barat)",
    "family": "Timor-Alor-Pantar (Papuan)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -8.32974,
        124.057
      ],
      [
        -8.3152,
        124.16056
      ],
      [
        -8.41164,
        124.20438
      ],
      [
        -8.46905,
        124.31761
      ],
      [
        -8.58609,
        124.31493
      ],
      [
        -8.66126,
        124.22613
      ],
      [
        -8.77983,
        124.1797
      ],
      [
        -8.75278,
        124.057
      ],
      [
        -8.69635,
        123.97496
      ],
      [
        -8.6754,
        123.86994
      ],
      [
        -8.56318,
        123.90056
      ],
      [
        -8.49196,
        123.89789
      ],
      [
        -8.3975,
        123.89169
      ],
      [
        -8.39869,
        123.99409
      ],
      [
        -8.32974,
        124.057
      ]
    ],
    "neighbors": [
      {
        "glottocode": "teiw1235",
        "name": "Teiwa",
        "distanceKm": 21.2
      },
      {
        "glottocode": "kaer1234",
        "name": "Kaera",
        "distanceKm": 22.6
      },
      {
        "glottocode": "blag1240",
        "name": "Blagar",
        "distanceKm": 31.6
      },
      {
        "glottocode": "alor1247",
        "name": "Alorese",
        "distanceKm": 42.6
      },
      {
        "glottocode": "keda1252",
        "name": "Kedang",
        "distanceKm": 45.7
      }
    ]
  },
  {
    "glottocode": "lama1277",
    "name": "Lamaholot",
    "isocode": "slp",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.36439,
    "longitude": 122.803,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Flores Timur)",
    "family": "Austronesian (Flores-Lembata)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -8.11307,
        122.803
      ],
      [
        -8.18554,
        122.89005
      ],
      [
        -8.19581,
        123.01666
      ],
      [
        -8.30544,
        123.06405
      ],
      [
        -8.41082,
        123.00863
      ],
      [
        -8.53199,
        123.01542
      ],
      [
        -8.55664,
        122.89658
      ],
      [
        -8.53612,
        122.803
      ],
      [
        -8.56669,
        122.70453
      ],
      [
        -8.45957,
        122.68236
      ],
      [
        -8.39958,
        122.64719
      ],
      [
        -8.31669,
        122.59176
      ],
      [
        -8.26823,
        122.68112
      ],
      [
        -8.1755,
        122.71106
      ],
      [
        -8.11307,
        122.803
      ]
    ],
    "neighbors": [
      {
        "glottocode": "adon1237",
        "name": "Adonara",
        "distanceKm": 39.5
      },
      {
        "glottocode": "sika1262",
        "name": "Sika",
        "distanceKm": 57.8
      },
      {
        "glottocode": "keda1252",
        "name": "Kedang",
        "distanceKm": 107.4
      },
      {
        "glottocode": "lioo1240",
        "name": "Li'o",
        "distanceKm": 112.6
      },
      {
        "glottocode": "kaer1234",
        "name": "Kaera",
        "distanceKm": 133.7
      }
    ]
  },
  {
    "glottocode": "adon1237",
    "name": "Adonara",
    "isocode": "adr",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.32027,
    "longitude": 123.159,
    "isNational": true,
    "isFromCsv": true,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Pulau Adonara)",
    "family": "Austronesian (Flores-Lembata)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -8.11291,
        123.159
      ],
      [
        -8.07538,
        123.27819
      ],
      [
        -8.15613,
        123.36702
      ],
      [
        -8.27594,
        123.35527
      ],
      [
        -8.37703,
        123.41032
      ],
      [
        -8.44564,
        123.31788
      ],
      [
        -8.46253,
        123.22824
      ],
      [
        -8.53595,
        123.159
      ],
      [
        -8.45653,
        123.09268
      ],
      [
        -8.41989,
        123.03275
      ],
      [
        -8.37008,
        122.93844
      ],
      [
        -8.28289,
        122.9935
      ],
      [
        -8.18188,
        122.98361
      ],
      [
        -8.08138,
        123.04273
      ],
      [
        -8.11291,
        123.159
      ]
    ],
    "neighbors": [
      {
        "glottocode": "lama1277",
        "name": "Lamaholot",
        "distanceKm": 39.5
      },
      {
        "glottocode": "keda1252",
        "name": "Kedang",
        "distanceKm": 68.0
      },
      {
        "glottocode": "sika1262",
        "name": "Sika",
        "distanceKm": 94.2
      },
      {
        "glottocode": "kaer1234",
        "name": "Kaera",
        "distanceKm": 94.5
      },
      {
        "glottocode": "lamm1241",
        "name": "Western Pantar",
        "distanceKm": 101.4
      }
    ]
  },
  {
    "glottocode": "keda1252",
    "name": "Kedang",
    "isocode": "ksx",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.23039,
    "longitude": 123.77,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Lembata)",
    "family": "Austronesian (Flores-Lembata)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -7.96211,
        123.77
      ],
      [
        -7.99877,
        123.8827
      ],
      [
        -8.11405,
        123.9174
      ],
      [
        -8.17698,
        124.00643
      ],
      [
        -8.2726,
        123.95686
      ],
      [
        -8.32208,
        123.88617
      ],
      [
        -8.42058,
        123.86254
      ],
      [
        -8.38515,
        123.77
      ],
      [
        -8.37992,
        123.69724
      ],
      [
        -8.37781,
        123.58321
      ],
      [
        -8.27112,
        123.5897
      ],
      [
        -8.17847,
        123.54014
      ],
      [
        -8.05832,
        123.55198
      ],
      [
        -8.03943,
        123.67708
      ],
      [
        -7.96211,
        123.77
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kaer1234",
        "name": "Kaera",
        "distanceKm": 29.4
      },
      {
        "glottocode": "lamm1241",
        "name": "Western Pantar",
        "distanceKm": 45.7
      },
      {
        "glottocode": "teiw1235",
        "name": "Teiwa",
        "distanceKm": 47.3
      },
      {
        "glottocode": "blag1240",
        "name": "Blagar",
        "distanceKm": 53.8
      },
      {
        "glottocode": "alor1247",
        "name": "Alorese",
        "distanceKm": 54.4
      }
    ]
  },
  {
    "glottocode": "sika1262",
    "name": "Sika",
    "isocode": "ski",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.67302,
    "longitude": 122.38,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Maumere)",
    "family": "Austronesian (Bima-Lembata)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -8.42572,
        122.38
      ],
      [
        -8.51775,
        122.45564
      ],
      [
        -8.53252,
        122.55821
      ],
      [
        -8.63278,
        122.55835
      ],
      [
        -8.70426,
        122.51845
      ],
      [
        -8.80477,
        122.54712
      ],
      [
        -8.81987,
        122.45154
      ],
      [
        -8.84876,
        122.38
      ],
      [
        -8.89889,
        122.26997
      ],
      [
        -8.79629,
        122.22364
      ],
      [
        -8.72691,
        122.14114
      ],
      [
        -8.61012,
        122.10124
      ],
      [
        -8.54101,
        122.21255
      ],
      [
        -8.43873,
        122.26587
      ],
      [
        -8.42572,
        122.38
      ]
    ],
    "neighbors": [
      {
        "glottocode": "lama1277",
        "name": "Lamaholot",
        "distanceKm": 57.8
      },
      {
        "glottocode": "lioo1240",
        "name": "Li'o",
        "distanceKm": 60.3
      },
      {
        "glottocode": "ende1246",
        "name": "Ende",
        "distanceKm": 90.8
      },
      {
        "glottocode": "adon1237",
        "name": "Adonara",
        "distanceKm": 94.2
      },
      {
        "glottocode": "nage1237",
        "name": "Nage",
        "distanceKm": 117.7
      }
    ]
  },
  {
    "glottocode": "lioo1240",
    "name": "Li'o",
    "isocode": "ljl",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.68615,
    "longitude": 121.832,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Nusa Tenggara Timur (Ende & Sikka)",
    "family": "Austronesian (Bima-Lembata)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -8.50542,
        121.832
      ],
      [
        -8.46713,
        121.9387
      ],
      [
        -8.56087,
        121.99092
      ],
      [
        -8.65091,
        121.98818
      ],
      [
        -8.74115,
        122.07575
      ],
      [
        -8.81094,
        121.9903
      ],
      [
        -8.87942,
        121.92616
      ],
      [
        -8.9889,
        121.832
      ],
      [
        -8.90273,
        121.72649
      ],
      [
        -8.86231,
        121.60854
      ],
      [
        -8.7585,
        121.51135
      ],
      [
        -8.63356,
        121.59892
      ],
      [
        -8.5095,
        121.60791
      ],
      [
        -8.44383,
        121.71395
      ],
      [
        -8.50542,
        121.832
      ]
    ],
    "neighbors": [
      {
        "glottocode": "ende1246",
        "name": "Ende",
        "distanceKm": 30.6
      },
      {
        "glottocode": "nage1237",
        "name": "Nage",
        "distanceKm": 57.4
      },
      {
        "glottocode": "sika1262",
        "name": "Sika",
        "distanceKm": 60.3
      },
      {
        "glottocode": "keoo1238",
        "name": "Kéo",
        "distanceKm": 66.5
      },
      {
        "glottocode": "ngad1261",
        "name": "Ngad'a",
        "distanceKm": 94.9
      }
    ]
  },
  {
    "glottocode": "ende1246",
    "name": "Ende",
    "isocode": "end",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.70998,
    "longitude": 121.555,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Kabupaten Ende)",
    "family": "Austronesian (Bima-Lembata)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -8.50645,
        121.555
      ],
      [
        -8.55191,
        121.63201
      ],
      [
        -8.62164,
        121.66707
      ],
      [
        -8.65985,
        121.77718
      ],
      [
        -8.75223,
        121.74227
      ],
      [
        -8.83481,
        121.71336
      ],
      [
        -8.95988,
        121.67675
      ],
      [
        -8.92949,
        121.555
      ],
      [
        -8.93305,
        121.44632
      ],
      [
        -8.8854,
        121.33246
      ],
      [
        -8.75399,
        121.35993
      ],
      [
        -8.6581,
        121.32503
      ],
      [
        -8.57105,
        121.37876
      ],
      [
        -8.57873,
        121.49106
      ],
      [
        -8.50645,
        121.555
      ]
    ],
    "neighbors": [
      {
        "glottocode": "nage1237",
        "name": "Nage",
        "distanceKm": 26.9
      },
      {
        "glottocode": "lioo1240",
        "name": "Li'o",
        "distanceKm": 30.6
      },
      {
        "glottocode": "keoo1238",
        "name": "Kéo",
        "distanceKm": 37.4
      },
      {
        "glottocode": "ngad1261",
        "name": "Ngad'a",
        "distanceKm": 64.3
      },
      {
        "glottocode": "sika1262",
        "name": "Sika",
        "distanceKm": 90.8
      }
    ]
  },
  {
    "glottocode": "ngad1261",
    "name": "Ngad'a",
    "isocode": "nxg",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.79508,
    "longitude": 120.976,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Nusa Tenggara Timur (Bajawa)",
    "family": "Austronesian (Bima-Lembata)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -8.58938,
        120.976
      ],
      [
        -8.6414,
        121.05089
      ],
      [
        -8.62608,
        121.19044
      ],
      [
        -8.74279,
        121.20784
      ],
      [
        -8.84888,
        121.21453
      ],
      [
        -8.99929,
        121.23512
      ],
      [
        -9.026,
        121.08853
      ],
      [
        -9.07286,
        120.976
      ],
      [
        -9.07699,
        120.83862
      ],
      [
        -8.92752,
        120.80795
      ],
      [
        -8.85037,
        120.73087
      ],
      [
        -8.7413,
        120.73757
      ],
      [
        -8.69785,
        120.85263
      ],
      [
        -8.59041,
        120.87626
      ],
      [
        -8.58938,
        120.976
      ]
    ],
    "neighbors": [
      {
        "glottocode": "keoo1238",
        "name": "Kéo",
        "distanceKm": 31.9
      },
      {
        "glottocode": "nage1237",
        "name": "Nage",
        "distanceKm": 38.0
      },
      {
        "glottocode": "ende1246",
        "name": "Ende",
        "distanceKm": 64.3
      },
      {
        "glottocode": "mang1405",
        "name": "Manggarai",
        "distanceKm": 75.9
      },
      {
        "glottocode": "lioo1240",
        "name": "Li'o",
        "distanceKm": 94.9
      }
    ]
  },
  {
    "glottocode": "keoo1238",
    "name": "Kéo",
    "isocode": "xxk",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.8704,
    "longitude": 121.256,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Nusa Tenggara Timur (Nagekeo)",
    "family": "Austronesian (Bima-Lembata)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -8.68727,
        121.256
      ],
      [
        -8.6125,
        121.3817
      ],
      [
        -8.71316,
        121.45556
      ],
      [
        -8.8144,
        121.5043
      ],
      [
        -8.94453,
        121.5847
      ],
      [
        -9.03013,
        121.45872
      ],
      [
        -9.11129,
        121.37341
      ],
      [
        -9.17075,
        121.256
      ],
      [
        -9.0481,
        121.16939
      ],
      [
        -9.0146,
        121.07299
      ],
      [
        -8.92199,
        121.02724
      ],
      [
        -8.83694,
        121.10765
      ],
      [
        -8.72869,
        121.07615
      ],
      [
        -8.6757,
        121.1611
      ],
      [
        -8.68727,
        121.256
      ]
    ],
    "neighbors": [
      {
        "glottocode": "nage1237",
        "name": "Nage",
        "distanceKm": 19.3
      },
      {
        "glottocode": "ngad1261",
        "name": "Ngad'a",
        "distanceKm": 31.9
      },
      {
        "glottocode": "ende1246",
        "name": "Ende",
        "distanceKm": 37.4
      },
      {
        "glottocode": "lioo1240",
        "name": "Li'o",
        "distanceKm": 66.5
      },
      {
        "glottocode": "mang1405",
        "name": "Manggarai",
        "distanceKm": 107.7
      }
    ]
  },
  {
    "glottocode": "nage1237",
    "name": "Nage",
    "isocode": "nxe",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.70513,
    "longitude": 121.31,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Nusa Tenggara Timur (Boawae)",
    "family": "Austronesian (Bima-Lembata)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -8.44171,
        121.31
      ],
      [
        -8.49487,
        121.41243
      ],
      [
        -8.56494,
        121.48784
      ],
      [
        -8.64028,
        121.59746
      ],
      [
        -8.75395,
        121.52638
      ],
      [
        -8.84303,
        121.48494
      ],
      [
        -8.93024,
        121.41967
      ],
      [
        -8.86475,
        121.31
      ],
      [
        -8.87602,
        121.22674
      ],
      [
        -8.8287,
        121.15324
      ],
      [
        -8.73441,
        121.18022
      ],
      [
        -8.65981,
        121.10914
      ],
      [
        -8.57927,
        121.15034
      ],
      [
        -8.54909,
        121.23398
      ],
      [
        -8.44171,
        121.31
      ]
    ],
    "neighbors": [
      {
        "glottocode": "keoo1238",
        "name": "Kéo",
        "distanceKm": 19.3
      },
      {
        "glottocode": "ende1246",
        "name": "Ende",
        "distanceKm": 26.9
      },
      {
        "glottocode": "ngad1261",
        "name": "Ngad'a",
        "distanceKm": 38.0
      },
      {
        "glottocode": "lioo1240",
        "name": "Li'o",
        "distanceKm": 57.4
      },
      {
        "glottocode": "mang1405",
        "name": "Manggarai",
        "distanceKm": 109.1
      }
    ]
  },
  {
    "glottocode": "buru1303",
    "name": "Buru (Indonesia)",
    "isocode": "mhs",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.43957,
    "longitude": 126.632,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku (Pulau Buru)",
    "family": "Austronesian (Central Maluku)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -3.19719,
        126.632
      ],
      [
        -3.23701,
        126.72972
      ],
      [
        -3.26094,
        126.8564
      ],
      [
        -3.39269,
        126.83777
      ],
      [
        -3.48543,
        126.83329
      ],
      [
        -3.58709,
        126.81732
      ],
      [
        -3.57351,
        126.69662
      ],
      [
        -3.62023,
        126.632
      ],
      [
        -3.61816,
        126.54584
      ],
      [
        -3.5247,
        126.52506
      ],
      [
        -3.48682,
        126.42459
      ],
      [
        -3.3913,
        126.42011
      ],
      [
        -3.32333,
        126.48598
      ],
      [
        -3.19236,
        126.51273
      ],
      [
        -3.19719,
        126.632
      ]
    ],
    "neighbors": [
      {
        "glottocode": "lise1239",
        "name": "Lisela",
        "distanceKm": 42.9
      },
      {
        "glottocode": "kaye1241",
        "name": "Kayeli",
        "distanceKm": 54.2
      },
      {
        "glottocode": "ambe1248",
        "name": "Ambelau",
        "distanceKm": 78.1
      }
    ]
  },
  {
    "glottocode": "lise1239",
    "name": "Lisela",
    "isocode": "lcl",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.27358,
    "longitude": 126.981,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku (Pulau Buru Utara)",
    "family": "Austronesian (Central Maluku)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -3.05363,
        126.981
      ],
      [
        -3.0238,
        127.10148
      ],
      [
        -3.14934,
        127.13705
      ],
      [
        -3.23123,
        127.16687
      ],
      [
        -3.3236,
        127.2005
      ],
      [
        -3.36158,
        127.09153
      ],
      [
        -3.43235,
        127.05759
      ],
      [
        -3.47667,
        126.981
      ],
      [
        -3.40495,
        126.91763
      ],
      [
        -3.4131,
        126.80576
      ],
      [
        -3.32536,
        126.75376
      ],
      [
        -3.22946,
        126.78739
      ],
      [
        -3.09782,
        126.76024
      ],
      [
        -3.05121,
        126.87374
      ],
      [
        -3.05363,
        126.981
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kaye1241",
        "name": "Kayeli",
        "distanceKm": 20.2
      },
      {
        "glottocode": "buru1303",
        "name": "Buru (Indonesia)",
        "distanceKm": 42.9
      },
      {
        "glottocode": "ambe1248",
        "name": "Ambelau",
        "distanceKm": 69.4
      },
      {
        "glottocode": "hitu1239",
        "name": "Hitu",
        "distanceKm": 137.9
      }
    ]
  },
  {
    "glottocode": "kaye1241",
    "name": "Kayeli",
    "isocode": "kzl",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.39247,
    "longitude": 127.118,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku (Teluk Kayeli, Buru)",
    "family": "Austronesian (Central Maluku)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -3.12772,
        127.118
      ],
      [
        -3.22423,
        127.19916
      ],
      [
        -3.28297,
        127.25554
      ],
      [
        -3.34443,
        127.32883
      ],
      [
        -3.4232,
        127.25285
      ],
      [
        -3.50264,
        127.25639
      ],
      [
        -3.58381,
        127.21031
      ],
      [
        -3.55076,
        127.118
      ],
      [
        -3.60537,
        127.01529
      ],
      [
        -3.54674,
        126.92422
      ],
      [
        -3.43857,
        126.91567
      ],
      [
        -3.32906,
        126.8397
      ],
      [
        -3.23888,
        126.92506
      ],
      [
        -3.20267,
        127.02644
      ],
      [
        -3.12772,
        127.118
      ]
    ],
    "neighbors": [
      {
        "glottocode": "lise1239",
        "name": "Lisela",
        "distanceKm": 20.2
      },
      {
        "glottocode": "ambe1248",
        "name": "Ambelau",
        "distanceKm": 52.6
      },
      {
        "glottocode": "buru1303",
        "name": "Buru (Indonesia)",
        "distanceKm": 54.2
      },
      {
        "glottocode": "hitu1239",
        "name": "Hitu",
        "distanceKm": 120.3
      },
      {
        "glottocode": "ambo1250",
        "name": "Ambonese Malay",
        "distanceKm": 123.6
      }
    ]
  },
  {
    "glottocode": "ambe1248",
    "name": "Ambelau",
    "isocode": "amv",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.85919,
    "longitude": 127.196,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku (Pulau Ambelau)",
    "family": "Austronesian (Central Maluku)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -3.68441,
        127.196
      ],
      [
        -3.71185,
        127.26712
      ],
      [
        -3.7276,
        127.36139
      ],
      [
        -3.82804,
        127.33278
      ],
      [
        -3.89965,
        127.37366
      ],
      [
        -3.99953,
        127.37238
      ],
      [
        -4.01458,
        127.271
      ],
      [
        -4.10745,
        127.196
      ],
      [
        -4.093,
        127.08315
      ],
      [
        -3.99136,
        127.02989
      ],
      [
        -3.92218,
        126.9194
      ],
      [
        -3.80551,
        126.96028
      ],
      [
        -3.73577,
        127.04088
      ],
      [
        -3.63344,
        127.08704
      ],
      [
        -3.68441,
        127.196
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kaye1241",
        "name": "Kayeli",
        "distanceKm": 52.6
      },
      {
        "glottocode": "lise1239",
        "name": "Lisela",
        "distanceKm": 69.4
      },
      {
        "glottocode": "buru1303",
        "name": "Buru (Indonesia)",
        "distanceKm": 78.1
      },
      {
        "glottocode": "ambo1250",
        "name": "Ambonese Malay",
        "distanceKm": 110.8
      },
      {
        "glottocode": "hitu1239",
        "name": "Hitu",
        "distanceKm": 114.3
      }
    ]
  },
  {
    "glottocode": "alun1238",
    "name": "Alune",
    "isocode": "alp",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.11477,
    "longitude": 128.394,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku (Seram Barat)",
    "family": "Austronesian (Central Maluku)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -2.9594,
        128.394
      ],
      [
        -2.92469,
        128.48567
      ],
      [
        -3.0233,
        128.50887
      ],
      [
        -3.07233,
        128.58022
      ],
      [
        -3.16813,
        128.62815
      ],
      [
        -3.23116,
        128.54016
      ],
      [
        -3.34721,
        128.5061
      ],
      [
        -3.38244,
        128.394
      ],
      [
        -3.30584,
        128.30185
      ],
      [
        -3.28706,
        128.17764
      ],
      [
        -3.16646,
        128.16717
      ],
      [
        -3.074,
        128.21511
      ],
      [
        -2.96739,
        128.20892
      ],
      [
        -2.96606,
        128.32228
      ],
      [
        -2.9594,
        128.394
      ]
    ],
    "neighbors": [
      {
        "glottocode": "elpa1240",
        "name": "Elpaputih",
        "distanceKm": 15.1
      },
      {
        "glottocode": "nort2864",
        "name": "Wemale",
        "distanceKm": 49.9
      },
      {
        "glottocode": "haru1244",
        "name": "Haruku",
        "distanceKm": 51.5
      },
      {
        "glottocode": "tule1244",
        "name": "Tulehu",
        "distanceKm": 52.3
      },
      {
        "glottocode": "hitu1239",
        "name": "Hitu",
        "distanceKm": 56.1
      }
    ]
  },
  {
    "glottocode": "nort2864",
    "name": "Wemale",
    "isocode": "weo",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.05143,
    "longitude": 128.839,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku (Seram Barat)",
    "family": "Austronesian (Central Maluku)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -2.83575,
        128.839
      ],
      [
        -2.90944,
        128.90748
      ],
      [
        -2.9254,
        128.99726
      ],
      [
        -2.99471,
        129.08786
      ],
      [
        -3.09575,
        129.03347
      ],
      [
        -3.2161,
        129.04578
      ],
      [
        -3.29569,
        128.9568
      ],
      [
        -3.25879,
        128.839
      ],
      [
        -3.29058,
        128.72367
      ],
      [
        -3.18916,
        128.66605
      ],
      [
        -3.08885,
        128.67484
      ],
      [
        -3.00162,
        128.62045
      ],
      [
        -2.95234,
        128.71456
      ],
      [
        -2.91455,
        128.77299
      ],
      [
        -2.83575,
        128.839
      ]
    ],
    "neighbors": [
      {
        "glottocode": "amah1245",
        "name": "Amahai",
        "distanceKm": 31.9
      },
      {
        "glottocode": "alun1238",
        "name": "Alune",
        "distanceKm": 49.9
      },
      {
        "glottocode": "sapa1251",
        "name": "Saparua",
        "distanceKm": 63.2
      },
      {
        "glottocode": "elpa1240",
        "name": "Elpaputih",
        "distanceKm": 64.0
      },
      {
        "glottocode": "manu1258",
        "name": "Manusela",
        "distanceKm": 65.8
      }
    ]
  },
  {
    "glottocode": "amah1245",
    "name": "Amahai",
    "isocode": "amq",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.32028,
    "longitude": 128.939,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku (Seram Selatan)",
    "family": "Austronesian (Central Maluku)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -3.14883,
        128.939
      ],
      [
        -3.12707,
        129.0322
      ],
      [
        -3.1528,
        129.14937
      ],
      [
        -3.27387,
        129.14267
      ],
      [
        -3.3794,
        129.19845
      ],
      [
        -3.48837,
        129.15014
      ],
      [
        -3.49902,
        129.02522
      ],
      [
        -3.57187,
        128.939
      ],
      [
        -3.50821,
        128.84834
      ],
      [
        -3.41656,
        128.81807
      ],
      [
        -3.36801,
        128.72954
      ],
      [
        -3.28526,
        128.78532
      ],
      [
        -3.22461,
        128.81884
      ],
      [
        -3.11787,
        128.84136
      ],
      [
        -3.14883,
        128.939
      ]
    ],
    "neighbors": [
      {
        "glottocode": "nort2864",
        "name": "Wemale",
        "distanceKm": 31.9
      },
      {
        "glottocode": "nusa1245",
        "name": "Nusa Laut",
        "distanceKm": 43.6
      },
      {
        "glottocode": "sapa1251",
        "name": "Saparua",
        "distanceKm": 44.3
      },
      {
        "glottocode": "haru1244",
        "name": "Haruku",
        "distanceKm": 58.4
      },
      {
        "glottocode": "manu1258",
        "name": "Manusela",
        "distanceKm": 59.2
      }
    ]
  },
  {
    "glottocode": "elpa1240",
    "name": "Elpaputih",
    "isocode": "elp",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.078,
    "longitude": 128.263,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku (Teluk Elpaputih)",
    "family": "Austronesian (Central Maluku)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -2.85206,
        128.263
      ],
      [
        -2.82624,
        128.38441
      ],
      [
        -2.94476,
        128.43031
      ],
      [
        -3.01963,
        128.5191
      ],
      [
        -3.13664,
        128.52028
      ],
      [
        -3.1941,
        128.4088
      ],
      [
        -3.29093,
        128.36569
      ],
      [
        -3.2751,
        128.263
      ],
      [
        -3.20739,
        128.2006
      ],
      [
        -3.20853,
        128.09909
      ],
      [
        -3.11377,
        128.10607
      ],
      [
        -3.0425,
        128.10725
      ],
      [
        -2.93034,
        128.07757
      ],
      [
        -2.90978,
        128.18187
      ],
      [
        -2.85206,
        128.263
      ]
    ],
    "neighbors": [
      {
        "glottocode": "alun1238",
        "name": "Alune",
        "distanceKm": 15.1
      },
      {
        "glottocode": "tule1244",
        "name": "Tulehu",
        "distanceKm": 55.8
      },
      {
        "glottocode": "hitu1239",
        "name": "Hitu",
        "distanceKm": 55.9
      },
      {
        "glottocode": "haru1244",
        "name": "Haruku",
        "distanceKm": 59.6
      },
      {
        "glottocode": "nort2864",
        "name": "Wemale",
        "distanceKm": 64.0
      }
    ]
  },
  {
    "glottocode": "manu1258",
    "name": "Manusela",
    "isocode": "wha",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.1109,
    "longitude": 129.429,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku (Pegunungan Seram)",
    "family": "Austronesian (Central Maluku)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -2.82479,
        129.429
      ],
      [
        -2.91806,
        129.52201
      ],
      [
        -2.9524,
        129.62805
      ],
      [
        -3.05443,
        129.67676
      ],
      [
        -3.14924,
        129.59724
      ],
      [
        -3.24892,
        129.60233
      ],
      [
        -3.28033,
        129.51071
      ],
      [
        -3.24783,
        129.429
      ],
      [
        -3.2992,
        129.33818
      ],
      [
        -3.21616,
        129.29681
      ],
      [
        -3.14857,
        129.26372
      ],
      [
        -3.05511,
        129.1842
      ],
      [
        -2.98516,
        129.27109
      ],
      [
        -2.89918,
        129.32689
      ],
      [
        -2.82479,
        129.429
      ]
    ],
    "neighbors": [
      {
        "glottocode": "lian1255",
        "name": "Liana-Seti",
        "distanceKm": 52.2
      },
      {
        "glottocode": "amah1245",
        "name": "Amahai",
        "distanceKm": 59.2
      },
      {
        "glottocode": "nort2864",
        "name": "Wemale",
        "distanceKm": 65.8
      },
      {
        "glottocode": "bobo1254",
        "name": "Bobot",
        "distanceKm": 90.7
      },
      {
        "glottocode": "nusa1245",
        "name": "Nusa Laut",
        "distanceKm": 96.0
      }
    ]
  },
  {
    "glottocode": "lian1255",
    "name": "Liana-Seti",
    "isocode": "ste",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.11832,
    "longitude": 129.899,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku (Seram Timur)",
    "family": "Austronesian (Central Maluku)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -2.90868,
        129.899
      ],
      [
        -2.90013,
        130.00423
      ],
      [
        -2.96761,
        130.08826
      ],
      [
        -3.08308,
        130.05362
      ],
      [
        -3.16469,
        130.10245
      ],
      [
        -3.23226,
        130.04209
      ],
      [
        -3.24002,
        129.95769
      ],
      [
        -3.33172,
        129.899
      ],
      [
        -3.28127,
        129.82041
      ],
      [
        -3.23137,
        129.75702
      ],
      [
        -3.17722,
        129.64057
      ],
      [
        -3.07055,
        129.6894
      ],
      [
        -2.9685,
        129.71085
      ],
      [
        -2.85887,
        129.77387
      ],
      [
        -2.90868,
        129.899
      ]
    ],
    "neighbors": [
      {
        "glottocode": "bobo1254",
        "name": "Bobot",
        "distanceKm": 47.0
      },
      {
        "glottocode": "manu1258",
        "name": "Manusela",
        "distanceKm": 52.2
      },
      {
        "glottocode": "amah1245",
        "name": "Amahai",
        "distanceKm": 108.9
      },
      {
        "glottocode": "bati1253",
        "name": "Bati (Indonesia)",
        "distanceKm": 115.7
      },
      {
        "glottocode": "gese1240",
        "name": "Geser-Gorom",
        "distanceKm": 117.0
      }
    ]
  },
  {
    "glottocode": "bobo1254",
    "name": "Bobot",
    "isocode": "bty",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.43514,
    "longitude": 130.179,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku (Seram Timur)",
    "family": "Austronesian (Central Maluku)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -3.20768,
        130.179
      ],
      [
        -3.22881,
        130.27854
      ],
      [
        -3.34408,
        130.2934
      ],
      [
        -3.39091,
        130.37313
      ],
      [
        -3.47565,
        130.3568
      ],
      [
        -3.5213,
        130.28724
      ],
      [
        -3.63509,
        130.27547
      ],
      [
        -3.63072,
        130.179
      ],
      [
        -3.60995,
        130.09466
      ],
      [
        -3.60784,
        129.96205
      ],
      [
        -3.48505,
        129.95995
      ],
      [
        -3.38151,
        129.94362
      ],
      [
        -3.25754,
        129.95589
      ],
      [
        -3.25395,
        130.09158
      ],
      [
        -3.20768,
        130.179
      ]
    ],
    "neighbors": [
      {
        "glottocode": "lian1255",
        "name": "Liana-Seti",
        "distanceKm": 47.0
      },
      {
        "glottocode": "gese1240",
        "name": "Geser-Gorom",
        "distanceKm": 70.8
      },
      {
        "glottocode": "bati1253",
        "name": "Bati (Indonesia)",
        "distanceKm": 73.3
      },
      {
        "glottocode": "manu1258",
        "name": "Manusela",
        "distanceKm": 90.7
      },
      {
        "glottocode": "amah1245",
        "name": "Amahai",
        "distanceKm": 138.2
      }
    ]
  },
  {
    "glottocode": "gese1240",
    "name": "Geser-Gorom",
    "isocode": "ges",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.8016,
    "longitude": 130.701,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku (Kepulauan Gorom)",
    "family": "Austronesian (Central Maluku)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -3.58423,
        130.701
      ],
      [
        -3.67825,
        130.76053
      ],
      [
        -3.68092,
        130.85266
      ],
      [
        -3.76016,
        130.88298
      ],
      [
        -3.83404,
        130.84346
      ],
      [
        -3.94715,
        130.88392
      ],
      [
        -3.99206,
        130.79292
      ],
      [
        -4.00727,
        130.701
      ],
      [
        -4.0594,
        130.57658
      ],
      [
        -3.94468,
        130.52118
      ],
      [
        -3.85429,
        130.46963
      ],
      [
        -3.73991,
        130.43011
      ],
      [
        -3.68339,
        130.55244
      ],
      [
        -3.61092,
        130.60897
      ],
      [
        -3.58423,
        130.701
      ]
    ],
    "neighbors": [
      {
        "glottocode": "bati1253",
        "name": "Bati (Indonesia)",
        "distanceKm": 24.4
      },
      {
        "glottocode": "bobo1254",
        "name": "Bobot",
        "distanceKm": 70.8
      },
      {
        "glottocode": "lian1255",
        "name": "Liana-Seti",
        "distanceKm": 117.0
      }
    ]
  },
  {
    "glottocode": "bati1253",
    "name": "Bati (Indonesia)",
    "isocode": "bvt",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.61403,
    "longitude": 130.815,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku (Seram Bagian Timur)",
    "family": "Austronesian (Central Maluku)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -3.48198,
        130.815
      ],
      [
        -3.43997,
        130.89899
      ],
      [
        -3.49243,
        130.96779
      ],
      [
        -3.57912,
        130.96827
      ],
      [
        -3.66887,
        131.05573
      ],
      [
        -3.7553,
        130.9925
      ],
      [
        -3.80745,
        130.90833
      ],
      [
        -3.90502,
        130.815
      ],
      [
        -3.82112,
        130.71507
      ],
      [
        -3.75619,
        130.63638
      ],
      [
        -3.67325,
        130.55501
      ],
      [
        -3.57473,
        130.64248
      ],
      [
        -3.49154,
        130.6611
      ],
      [
        -3.4263,
        130.72441
      ],
      [
        -3.48198,
        130.815
      ]
    ],
    "neighbors": [
      {
        "glottocode": "gese1240",
        "name": "Geser-Gorom",
        "distanceKm": 24.4
      },
      {
        "glottocode": "bobo1254",
        "name": "Bobot",
        "distanceKm": 73.3
      },
      {
        "glottocode": "lian1255",
        "name": "Liana-Seti",
        "distanceKm": 115.7
      }
    ]
  },
  {
    "glottocode": "ambo1250",
    "name": "Ambonese Malay",
    "isocode": "abs",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.71342,
    "longitude": 128.184,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku (Kota Ambon)",
    "family": "Austronesian (Malayic Creole)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -3.51587,
        128.184
      ],
      [
        -3.52643,
        128.27424
      ],
      [
        -3.60739,
        128.31724
      ],
      [
        -3.65574,
        128.43723
      ],
      [
        -3.76671,
        128.41799
      ],
      [
        -3.85046,
        128.3562
      ],
      [
        -3.97555,
        128.3105
      ],
      [
        -3.93891,
        128.184
      ],
      [
        -3.90758,
        128.0903
      ],
      [
        -3.87115,
        127.98579
      ],
      [
        -3.74988,
        128.02393
      ],
      [
        -3.67258,
        128.00469
      ],
      [
        -3.5867,
        128.02476
      ],
      [
        -3.5944,
        128.12656
      ],
      [
        -3.51587,
        128.184
      ]
    ],
    "neighbors": [
      {
        "glottocode": "hitu1239",
        "name": "Hitu",
        "distanceKm": 15.4
      },
      {
        "glottocode": "tule1244",
        "name": "Tulehu",
        "distanceKm": 20.6
      },
      {
        "glottocode": "haru1244",
        "name": "Haruku",
        "distanceKm": 36.1
      },
      {
        "glottocode": "sapa1251",
        "name": "Saparua",
        "distanceKm": 52.5
      },
      {
        "glottocode": "nusa1245",
        "name": "Nusa Laut",
        "distanceKm": 65.8
      }
    ]
  },
  {
    "glottocode": "hitu1239",
    "name": "Hitu",
    "isocode": "htu",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.57478,
    "longitude": 128.186,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku (Ambon Utara)",
    "family": "Austronesian (Central Maluku)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -3.35235,
        128.186
      ],
      [
        -3.40935,
        128.26582
      ],
      [
        -3.4064,
        128.39755
      ],
      [
        -3.51942,
        128.42902
      ],
      [
        -3.62379,
        128.40116
      ],
      [
        -3.75308,
        128.41001
      ],
      [
        -3.77041,
        128.2804
      ],
      [
        -3.77539,
        128.186
      ],
      [
        -3.79049,
        128.08191
      ],
      [
        -3.67016,
        128.06616
      ],
      [
        -3.61356,
        128.01578
      ],
      [
        -3.52966,
        127.98792
      ],
      [
        -3.48931,
        128.07862
      ],
      [
        -3.38927,
        128.09649
      ],
      [
        -3.35235,
        128.186
      ]
    ],
    "neighbors": [
      {
        "glottocode": "tule1244",
        "name": "Tulehu",
        "distanceKm": 13.8
      },
      {
        "glottocode": "ambo1250",
        "name": "Ambonese Malay",
        "distanceKm": 15.4
      },
      {
        "glottocode": "haru1244",
        "name": "Haruku",
        "distanceKm": 32.2
      },
      {
        "glottocode": "sapa1251",
        "name": "Saparua",
        "distanceKm": 50.3
      },
      {
        "glottocode": "elpa1240",
        "name": "Elpaputih",
        "distanceKm": 55.9
      }
    ]
  },
  {
    "glottocode": "tule1244",
    "name": "Tulehu",
    "isocode": "tlu",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.57785,
    "longitude": 128.31,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku (Ambon Timur)",
    "family": "Austronesian (Central Maluku)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -3.38199,
        128.31
      ],
      [
        -3.32778,
        128.43066
      ],
      [
        -3.41979,
        128.50859
      ],
      [
        -3.52981,
        128.52088
      ],
      [
        -3.6394,
        128.58021
      ],
      [
        -3.70628,
        128.47136
      ],
      [
        -3.74449,
        128.3904
      ],
      [
        -3.80503,
        128.31
      ],
      [
        -3.70892,
        128.24675
      ],
      [
        -3.68355,
        128.1772
      ],
      [
        -3.62395,
        128.10764
      ],
      [
        -3.54527,
        128.16697
      ],
      [
        -3.44252,
        128.13997
      ],
      [
        -3.36334,
        128.2065
      ],
      [
        -3.38199,
        128.31
      ]
    ],
    "neighbors": [
      {
        "glottocode": "hitu1239",
        "name": "Hitu",
        "distanceKm": 13.8
      },
      {
        "glottocode": "haru1244",
        "name": "Haruku",
        "distanceKm": 18.4
      },
      {
        "glottocode": "ambo1250",
        "name": "Ambonese Malay",
        "distanceKm": 20.6
      },
      {
        "glottocode": "sapa1251",
        "name": "Saparua",
        "distanceKm": 36.5
      },
      {
        "glottocode": "alun1238",
        "name": "Alune",
        "distanceKm": 52.3
      }
    ]
  },
  {
    "glottocode": "haru1244",
    "name": "Haruku",
    "isocode": "hrk",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.57029,
    "longitude": 128.476,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku (Pulau Haruku)",
    "family": "Austronesian (Central Maluku)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -3.28964,
        128.476
      ],
      [
        -3.34205,
        128.58613
      ],
      [
        -3.4412,
        128.63819
      ],
      [
        -3.51155,
        128.73387
      ],
      [
        -3.61337,
        128.66512
      ],
      [
        -3.67644,
        128.60937
      ],
      [
        -3.76651,
        128.57068
      ],
      [
        -3.71268,
        128.476
      ],
      [
        -3.7232,
        128.40222
      ],
      [
        -3.70496,
        128.3068
      ],
      [
        -3.60568,
        128.32064
      ],
      [
        -3.51924,
        128.25188
      ],
      [
        -3.41268,
        128.27798
      ],
      [
        -3.38536,
        128.38677
      ],
      [
        -3.28964,
        128.476
      ]
    ],
    "neighbors": [
      {
        "glottocode": "sapa1251",
        "name": "Saparua",
        "distanceKm": 18.1
      },
      {
        "glottocode": "tule1244",
        "name": "Tulehu",
        "distanceKm": 18.4
      },
      {
        "glottocode": "hitu1239",
        "name": "Hitu",
        "distanceKm": 32.2
      },
      {
        "glottocode": "nusa1245",
        "name": "Nusa Laut",
        "distanceKm": 35.4
      },
      {
        "glottocode": "ambo1250",
        "name": "Ambonese Malay",
        "distanceKm": 36.1
      }
    ]
  },
  {
    "glottocode": "sapa1251",
    "name": "Saparua",
    "isocode": "spr",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.58314,
    "longitude": 128.639,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku (Pulau Saparua)",
    "family": "Austronesian (Central Maluku)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -3.33469,
        128.639
      ],
      [
        -3.40769,
        128.72366
      ],
      [
        -3.42754,
        128.8345
      ],
      [
        -3.54271,
        128.81649
      ],
      [
        -3.61833,
        128.79346
      ],
      [
        -3.71558,
        128.8054
      ],
      [
        -3.71309,
        128.7017
      ],
      [
        -3.75773,
        128.639
      ],
      [
        -3.78883,
        128.53975
      ],
      [
        -3.6913,
        128.50311
      ],
      [
        -3.63684,
        128.40324
      ],
      [
        -3.52419,
        128.38022
      ],
      [
        -3.45182,
        128.474
      ],
      [
        -3.33194,
        128.51779
      ],
      [
        -3.33469,
        128.639
      ]
    ],
    "neighbors": [
      {
        "glottocode": "haru1244",
        "name": "Haruku",
        "distanceKm": 18.1
      },
      {
        "glottocode": "nusa1245",
        "name": "Nusa Laut",
        "distanceKm": 18.5
      },
      {
        "glottocode": "tule1244",
        "name": "Tulehu",
        "distanceKm": 36.5
      },
      {
        "glottocode": "amah1245",
        "name": "Amahai",
        "distanceKm": 44.3
      },
      {
        "glottocode": "hitu1239",
        "name": "Hitu",
        "distanceKm": 50.3
      }
    ]
  },
  {
    "glottocode": "nusa1245",
    "name": "Nusa Laut",
    "isocode": "nul",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.67727,
    "longitude": 128.776,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku (Pulau Nusa Laut)",
    "family": "Austronesian (Central Maluku)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -3.49694,
        128.776
      ],
      [
        -3.46551,
        128.87819
      ],
      [
        -3.57008,
        128.91068
      ],
      [
        -3.64392,
        128.9224
      ],
      [
        -3.72439,
        128.98288
      ],
      [
        -3.77137,
        128.89424
      ],
      [
        -3.84245,
        128.85571
      ],
      [
        -3.91998,
        128.776
      ],
      [
        -3.84666,
        128.69426
      ],
      [
        -3.83385,
        128.57926
      ],
      [
        -3.73806,
        128.50912
      ],
      [
        -3.63026,
        128.56959
      ],
      [
        -3.50761,
        128.56281
      ],
      [
        -3.46131,
        128.67178
      ],
      [
        -3.49694,
        128.776
      ]
    ],
    "neighbors": [
      {
        "glottocode": "sapa1251",
        "name": "Saparua",
        "distanceKm": 18.5
      },
      {
        "glottocode": "haru1244",
        "name": "Haruku",
        "distanceKm": 35.4
      },
      {
        "glottocode": "amah1245",
        "name": "Amahai",
        "distanceKm": 43.6
      },
      {
        "glottocode": "tule1244",
        "name": "Tulehu",
        "distanceKm": 52.9
      },
      {
        "glottocode": "ambo1250",
        "name": "Ambonese Malay",
        "distanceKm": 65.8
      }
    ]
  },
  {
    "glottocode": "keii1239",
    "name": "Kei",
    "isocode": "kei",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -5.63948,
    "longitude": 133.02,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku (Kepulauan Kei / Maluku Tenggara)",
    "family": "Austronesian (Central Malayo-Polynesian)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -5.41738,
        133.02
      ],
      [
        -5.49023,
        133.09223
      ],
      [
        -5.54827,
        133.13493
      ],
      [
        -5.59144,
        133.23152
      ],
      [
        -5.67549,
        133.17853
      ],
      [
        -5.76087,
        133.17295
      ],
      [
        -5.87154,
        133.1323
      ],
      [
        -5.84042,
        133.02
      ],
      [
        -5.87137,
        132.90778
      ],
      [
        -5.81203,
        132.80258
      ],
      [
        -5.68557,
        132.81708
      ],
      [
        -5.58135,
        132.76409
      ],
      [
        -5.4971,
        132.8406
      ],
      [
        -5.49039,
        132.94785
      ],
      [
        -5.41738,
        133.02
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "ford1242",
    "name": "Fordata",
    "isocode": "frd",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -7.28902,
    "longitude": 131.511,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku (Kepulauan Tanimbar Utara)",
    "family": "Austronesian (Southeast Maluku)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -7.12512,
        131.511
      ],
      [
        -7.15595,
        131.5756
      ],
      [
        -7.14913,
        131.68784
      ],
      [
        -7.24991,
        131.68373
      ],
      [
        -7.33509,
        131.71449
      ],
      [
        -7.45808,
        131.72472
      ],
      [
        -7.47895,
        131.60321
      ],
      [
        -7.54816,
        131.511
      ],
      [
        -7.5371,
        131.39056
      ],
      [
        -7.41289,
        131.3544
      ],
      [
        -7.34405,
        131.26794
      ],
      [
        -7.24095,
        131.2987
      ],
      [
        -7.19432,
        131.39128
      ],
      [
        -7.0978,
        131.41816
      ],
      [
        -7.12512,
        131.511
      ]
    ],
    "neighbors": [
      {
        "glottocode": "yamd1240",
        "name": "Yamdena",
        "distanceKm": 50.4
      },
      {
        "glottocode": "sela1259",
        "name": "Selaru",
        "distanceKm": 116.5
      }
    ]
  },
  {
    "glottocode": "yamd1240",
    "name": "Yamdena",
    "isocode": "jmd",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -7.73722,
    "longitude": 131.44,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku (Tanimbar Selatan)",
    "family": "Austronesian (Southeast Maluku)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -7.58349,
        131.44
      ],
      [
        -7.52451,
        131.54338
      ],
      [
        -7.61803,
        131.59083
      ],
      [
        -7.68856,
        131.65515
      ],
      [
        -7.79995,
        131.71735
      ],
      [
        -7.87219,
        131.6108
      ],
      [
        -7.96785,
        131.55209
      ],
      [
        -8.00653,
        131.44
      ],
      [
        -7.90566,
        131.35814
      ],
      [
        -7.8818,
        131.25704
      ],
      [
        -7.7827,
        131.23893
      ],
      [
        -7.70581,
        131.30112
      ],
      [
        -7.60843,
        131.27702
      ],
      [
        -7.58671,
        131.36685
      ],
      [
        -7.58349,
        131.44
      ]
    ],
    "neighbors": [
      {
        "glottocode": "ford1242",
        "name": "Fordata",
        "distanceKm": 50.4
      },
      {
        "glottocode": "sela1259",
        "name": "Selaru",
        "distanceKm": 72.4
      }
    ]
  },
  {
    "glottocode": "sela1259",
    "name": "Selaru",
    "isocode": "slu",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.18376,
    "longitude": 130.961,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku (Pulau Selaru)",
    "family": "Austronesian (Southeast Maluku)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -7.93412,
        130.961
      ],
      [
        -7.99783,
        131.05146
      ],
      [
        -8.04162,
        131.14108
      ],
      [
        -8.11955,
        131.24522
      ],
      [
        -8.23213,
        131.1751
      ],
      [
        -8.33844,
        131.15695
      ],
      [
        -8.4176,
        131.07477
      ],
      [
        -8.35717,
        130.961
      ],
      [
        -8.37897,
        130.86602
      ],
      [
        -8.30538,
        130.80693
      ],
      [
        -8.21368,
        130.82854
      ],
      [
        -8.13799,
        130.75842
      ],
      [
        -8.07467,
        130.8228
      ],
      [
        -8.03646,
        130.88933
      ],
      [
        -7.93412,
        130.961
      ]
    ],
    "neighbors": [
      {
        "glottocode": "yamd1240",
        "name": "Yamdena",
        "distanceKm": 72.4
      },
      {
        "glottocode": "ford1242",
        "name": "Fordata",
        "distanceKm": 116.5
      }
    ]
  },
  {
    "glottocode": "luan1263",
    "name": "Luang",
    "isocode": "lex",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.18378,
    "longitude": 127.944,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku Barat Daya (Pulau Luang)",
    "family": "Austronesian (Babar-Luang)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -7.96409,
        127.944
      ],
      [
        -7.9733,
        128.0464
      ],
      [
        -8.00271,
        128.17339
      ],
      [
        -8.13628,
        128.15427
      ],
      [
        -8.23634,
        128.17663
      ],
      [
        -8.33802,
        128.1394
      ],
      [
        -8.32767,
        128.01401
      ],
      [
        -8.38713,
        127.944
      ],
      [
        -8.35445,
        127.86096
      ],
      [
        -8.26647,
        127.83924
      ],
      [
        -8.23041,
        127.73759
      ],
      [
        -8.1422,
        127.75996
      ],
      [
        -8.07426,
        127.80526
      ],
      [
        -7.94653,
        127.82857
      ],
      [
        -7.96409,
        127.944
      ]
    ],
    "neighbors": [
      {
        "glottocode": "oirr1263",
        "name": "Oirata",
        "distanceKm": 82.4
      },
      {
        "glottocode": "kisa1266",
        "name": "Kisar",
        "distanceKm": 85.4
      }
    ]
  },
  {
    "glottocode": "kisa1266",
    "name": "Kisar",
    "isocode": "kje",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.05122,
    "longitude": 127.18,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku Barat Daya (Pulau Kisar)",
    "family": "Austronesian (Timoric)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -7.81654,
        127.18
      ],
      [
        -7.79237,
        127.30589
      ],
      [
        -7.92314,
        127.3422
      ],
      [
        -8.00192,
        127.39814
      ],
      [
        -8.10339,
        127.41086
      ],
      [
        -8.14323,
        127.29652
      ],
      [
        -8.22543,
        127.26473
      ],
      [
        -8.23958,
        127.18
      ],
      [
        -8.17352,
        127.12052
      ],
      [
        -8.1869,
        127.00816
      ],
      [
        -8.09606,
        126.9816
      ],
      [
        -8.00926,
        126.99432
      ],
      [
        -7.87946,
        126.96248
      ],
      [
        -7.84428,
        127.07935
      ],
      [
        -7.81654,
        127.18
      ]
    ],
    "neighbors": [
      {
        "glottocode": "oirr1263",
        "name": "Oirata",
        "distanceKm": 4.9
      },
      {
        "glottocode": "aput1237",
        "name": "Aputai",
        "distanceKm": 78.7
      },
      {
        "glottocode": "luan1263",
        "name": "Luang",
        "distanceKm": 85.4
      }
    ]
  },
  {
    "glottocode": "oirr1263",
    "name": "Oirata",
    "isocode": "oia",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.09044,
    "longitude": 127.201,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku Barat Daya (Kisar)",
    "family": "Timor-Alor-Pantar (Papuan)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -7.81081,
        127.201
      ],
      [
        -7.91539,
        127.28614
      ],
      [
        -7.96217,
        127.36346
      ],
      [
        -8.04093,
        127.4201
      ],
      [
        -8.12126,
        127.33739
      ],
      [
        -8.20749,
        127.34925
      ],
      [
        -8.26358,
        127.28522
      ],
      [
        -8.23385,
        127.201
      ],
      [
        -8.29654,
        127.10075
      ],
      [
        -8.22593,
        127.02939
      ],
      [
        -8.13507,
        127.00352
      ],
      [
        -8.02712,
        126.92081
      ],
      [
        -7.94372,
        127.01518
      ],
      [
        -7.88243,
        127.09982
      ],
      [
        -7.81081,
        127.201
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kisa1266",
        "name": "Kisar",
        "distanceKm": 4.9
      },
      {
        "glottocode": "aput1237",
        "name": "Aputai",
        "distanceKm": 82.2
      },
      {
        "glottocode": "luan1263",
        "name": "Luang",
        "distanceKm": 82.4
      }
    ]
  },
  {
    "glottocode": "aput1237",
    "name": "Aputai",
    "isocode": "apx",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -7.84732,
    "longitude": 126.496,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku Barat Daya (Wetar)",
    "family": "Austronesian (Timoric)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -7.66574,
        126.496
      ],
      [
        -7.67573,
        126.57941
      ],
      [
        -7.71447,
        126.66416
      ],
      [
        -7.81758,
        126.62755
      ],
      [
        -7.88892,
        126.67999
      ],
      [
        -7.97239,
        126.65431
      ],
      [
        -7.98664,
        126.56373
      ],
      [
        -8.08878,
        126.496
      ],
      [
        -8.05688,
        126.39413
      ],
      [
        -7.97823,
        126.33029
      ],
      [
        -7.91171,
        126.21122
      ],
      [
        -7.79479,
        126.26365
      ],
      [
        -7.70863,
        126.32044
      ],
      [
        -7.60549,
        126.37844
      ],
      [
        -7.66574,
        126.496
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kisa1266",
        "name": "Kisar",
        "distanceKm": 78.7
      },
      {
        "glottocode": "oirr1263",
        "name": "Oirata",
        "distanceKm": 82.2
      },
      {
        "glottocode": "adab1235",
        "name": "Adabe",
        "distanceKm": 109.7
      }
    ]
  },
  {
    "glottocode": "teun1241",
    "name": "Te'un",
    "isocode": "tve",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -6.97086,
    "longitude": 129.143718,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku (Pulau Teun)",
    "family": "Austronesian (Central Malayo-Polynesian)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -6.79349,
        129.14372
      ],
      [
        -6.78394,
        129.23441
      ],
      [
        -6.88748,
        129.24905
      ],
      [
        -6.92837,
        129.33125
      ],
      [
        -7.01821,
        129.35271
      ],
      [
        -7.07561,
        129.27605
      ],
      [
        -7.19976,
        129.25477
      ],
      [
        -7.21653,
        129.14372
      ],
      [
        -7.16508,
        129.04949
      ],
      [
        -7.15125,
        128.91584
      ],
      [
        -7.02251,
        128.91574
      ],
      [
        -6.92407,
        128.93721
      ],
      [
        -6.81185,
        128.94284
      ],
      [
        -6.81861,
        129.06985
      ],
      [
        -6.79349,
        129.14372
      ]
    ],
    "neighbors": [
      {
        "glottocode": "nila1244",
        "name": "Nila",
        "distanceKm": 48.4
      },
      {
        "glottocode": "seru1245",
        "name": "Serua",
        "distanceKm": 121.2
      }
    ]
  },
  {
    "glottocode": "nila1244",
    "name": "Nila",
    "isocode": "nil",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -6.734956,
    "longitude": 129.512131,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku (Pulau Nila)",
    "family": "Austronesian (Central Malayo-Polynesian)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -6.52847,
        129.51213
      ],
      [
        -6.60997,
        129.57274
      ],
      [
        -6.6109,
        129.66877
      ],
      [
        -6.68435,
        129.73541
      ],
      [
        -6.77543,
        129.69069
      ],
      [
        -6.90008,
        129.72063
      ],
      [
        -6.96486,
        129.62362
      ],
      [
        -6.95151,
        129.51213
      ],
      [
        -6.99112,
        129.38791
      ],
      [
        -6.87466,
        129.33573
      ],
      [
        -6.77848,
        129.32011
      ],
      [
        -6.6813,
        129.27539
      ],
      [
        -6.63632,
        129.38759
      ],
      [
        -6.58372,
        129.43879
      ],
      [
        -6.52847,
        129.51213
      ]
    ],
    "neighbors": [
      {
        "glottocode": "teun1241",
        "name": "Te'un",
        "distanceKm": 48.4
      },
      {
        "glottocode": "seru1245",
        "name": "Serua",
        "distanceKm": 73.0
      }
    ]
  },
  {
    "glottocode": "seru1245",
    "name": "Serua",
    "isocode": "srw",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -6.31107,
    "longitude": 130.017294,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku (Pulau Serua)",
    "family": "Austronesian (Central Malayo-Polynesian)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -6.16294,
        130.01729
      ],
      [
        -6.12196,
        130.10892
      ],
      [
        -6.1596,
        130.20839
      ],
      [
        -6.26778,
        130.20813
      ],
      [
        -6.37167,
        130.28444
      ],
      [
        -6.47327,
        130.22193
      ],
      [
        -6.5027,
        130.11014
      ],
      [
        -6.58598,
        130.01729
      ],
      [
        -6.5031,
        129.92425
      ],
      [
        -6.42336,
        129.87563
      ],
      [
        -6.36191,
        129.79318
      ],
      [
        -6.27754,
        129.86949
      ],
      [
        -6.20951,
        129.88916
      ],
      [
        -6.12156,
        129.92547
      ],
      [
        -6.16294,
        130.01729
      ]
    ],
    "neighbors": [
      {
        "glottocode": "nila1244",
        "name": "Nila",
        "distanceKm": 73.0
      },
      {
        "glottocode": "teun1241",
        "name": "Te'un",
        "distanceKm": 121.2
      }
    ]
  },
  {
    "glottocode": "batu1258",
    "name": "Batuley",
    "isocode": "bay",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -5.814412,
    "longitude": 134.784314,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku (Kepulauan Aru)",
    "family": "Austronesian (Aru Islands)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -5.59224,
        134.78431
      ],
      [
        -5.58235,
        134.89665
      ],
      [
        -5.68694,
        134.94498
      ],
      [
        -5.75311,
        135.05431
      ],
      [
        -5.87231,
        135.0393
      ],
      [
        -5.94183,
        134.94492
      ],
      [
        -6.05061,
        134.89865
      ],
      [
        -6.01529,
        134.78431
      ],
      [
        -5.9635,
        134.71215
      ],
      [
        -5.9507,
        134.61253
      ],
      [
        -5.84724,
        134.63974
      ],
      [
        -5.77818,
        134.62473
      ],
      [
        -5.67807,
        134.61246
      ],
      [
        -5.66946,
        134.71415
      ],
      [
        -5.59224,
        134.78431
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kola1285",
        "name": "Kola",
        "distanceKm": 42.0
      },
      {
        "glottocode": "dobe1238",
        "name": "Dobel",
        "distanceKm": 59.1
      }
    ]
  },
  {
    "glottocode": "dobe1238",
    "name": "Dobel",
    "isocode": "kvo",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -6.32531,
    "longitude": 134.638,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku (Kepulauan Aru)",
    "family": "Austronesian (Aru Islands)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -6.0556,
        134.638
      ],
      [
        -6.13578,
        134.72983
      ],
      [
        -6.15462,
        134.85334
      ],
      [
        -6.26845,
        134.88863
      ],
      [
        -6.36814,
        134.8268
      ],
      [
        -6.47963,
        134.8327
      ],
      [
        -6.49556,
        134.72049
      ],
      [
        -6.47864,
        134.638
      ],
      [
        -6.51692,
        134.54516
      ],
      [
        -6.41839,
        134.52057
      ],
      [
        -6.36259,
        134.47367
      ],
      [
        -6.27401,
        134.41184
      ],
      [
        -6.21587,
        134.49993
      ],
      [
        -6.11442,
        134.53582
      ],
      [
        -6.0556,
        134.638
      ]
    ],
    "neighbors": [
      {
        "glottocode": "batu1258",
        "name": "Batuley",
        "distanceKm": 59.1
      },
      {
        "glottocode": "kola1285",
        "name": "Kola",
        "distanceKm": 93.2
      }
    ]
  },
  {
    "glottocode": "kola1285",
    "name": "Kola",
    "isocode": "kvv",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -5.48833,
    "longitude": 134.592,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku (Kepulauan Aru)",
    "family": "Austronesian (Aru Islands)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -5.27673,
        134.592
      ],
      [
        -5.24764,
        134.70844
      ],
      [
        -5.3344,
        134.78591
      ],
      [
        -5.44863,
        134.76675
      ],
      [
        -5.5401,
        134.81989
      ],
      [
        -5.59999,
        134.73266
      ],
      [
        -5.61898,
        134.65521
      ],
      [
        -5.69977,
        134.592
      ],
      [
        -5.62879,
        134.52405
      ],
      [
        -5.59816,
        134.45364
      ],
      [
        -5.54276,
        134.35241
      ],
      [
        -5.44597,
        134.40555
      ],
      [
        -5.33623,
        134.40039
      ],
      [
        -5.23784,
        134.47081
      ],
      [
        -5.27673,
        134.592
      ]
    ],
    "neighbors": [
      {
        "glottocode": "batu1258",
        "name": "Batuley",
        "distanceKm": 42.0
      },
      {
        "glottocode": "dobe1238",
        "name": "Dobel",
        "distanceKm": 93.2
      }
    ]
  },
  {
    "glottocode": "sula1248",
    "name": "Sula",
    "isocode": "szn",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.30765,
    "longitude": 125.9656,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku Utara (Kepulauan Sula)",
    "family": "Austronesian (Sula-Bacan)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -2.05136,
        125.9656
      ],
      [
        -2.09542,
        126.06789
      ],
      [
        -2.20551,
        126.09378
      ],
      [
        -2.25884,
        126.17961
      ],
      [
        -2.34607,
        126.13406
      ],
      [
        -2.39579,
        126.07622
      ],
      [
        -2.50138,
        126.05897
      ],
      [
        -2.4744,
        125.9656
      ],
      [
        -2.47656,
        125.88419
      ],
      [
        -2.46927,
        125.76277
      ],
      [
        -2.35298,
        125.76684
      ],
      [
        -2.25193,
        125.72129
      ],
      [
        -2.13203,
        125.7452
      ],
      [
        -2.12024,
        125.87527
      ],
      [
        -2.05136,
        125.9656
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "baca1243",
    "name": "Bacanese Malay",
    "isocode": "btj",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -0.62275,
    "longitude": 127.49,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku Utara (Pulau Bacan)",
    "family": "Austronesian (Malayic)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -0.39962,
        127.49
      ],
      [
        -0.48724,
        127.55526
      ],
      [
        -0.49243,
        127.65342
      ],
      [
        -0.58478,
        127.65639
      ],
      [
        -0.6545,
        127.62913
      ],
      [
        -0.76176,
        127.66433
      ],
      [
        -0.78556,
        127.56841
      ],
      [
        -0.82266,
        127.49
      ],
      [
        -0.86839,
        127.3717
      ],
      [
        -0.7562,
        127.32266
      ],
      [
        -0.67891,
        127.24393
      ],
      [
        -0.56037,
        127.21667
      ],
      [
        -0.498,
        127.33356
      ],
      [
        -0.40441,
        127.38485
      ],
      [
        -0.39962,
        127.49
      ]
    ],
    "neighbors": [
      {
        "glottocode": "tido1248",
        "name": "Tidore",
        "distanceKm": 77.4
      }
    ]
  },
  {
    "glottocode": "tern1247",
    "name": "Ternate",
    "isocode": "tft",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 0.80562,
    "longitude": 127.333,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku Utara (Pulau Ternate)",
    "family": "North Halmahera (Papuan)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        0.94537,
        127.333
      ],
      [
        0.98837,
        127.42101
      ],
      [
        0.91383,
        127.46871
      ],
      [
        0.83871,
        127.47799
      ],
      [
        0.7535,
        127.56139
      ],
      [
        0.68327,
        127.48644
      ],
      [
        0.61484,
        127.42488
      ],
      [
        0.52233,
        127.333
      ],
      [
        0.60722,
        127.23745
      ],
      [
        0.65007,
        127.13793
      ],
      [
        0.74457,
        127.06552
      ],
      [
        0.84763,
        127.14891
      ],
      [
        0.94703,
        127.15566
      ],
      [
        0.99599,
        127.24131
      ],
      [
        0.94537,
        127.333
      ]
    ],
    "neighbors": [
      {
        "glottocode": "sahu1245",
        "name": "Sahu",
        "distanceKm": 28.6
      },
      {
        "glottocode": "pagu1249",
        "name": "Pagu",
        "distanceKm": 67.3
      },
      {
        "glottocode": "sawa1247",
        "name": "Sawai",
        "distanceKm": 89.9
      },
      {
        "glottocode": "tobe1252",
        "name": "Tobelo",
        "distanceKm": 96.8
      },
      {
        "glottocode": "tido1248",
        "name": "Tidore",
        "distanceKm": 98.2
      }
    ]
  },
  {
    "glottocode": "tido1248",
    "name": "Tidore",
    "isocode": "tvo",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 0.02461,
    "longitude": 127.746,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku Utara (Pulau Tidore)",
    "family": "North Halmahera (Papuan)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        0.22603,
        127.746
      ],
      [
        0.18788,
        127.82463
      ],
      [
        0.12345,
        127.86994
      ],
      [
        0.07967,
        127.98723
      ],
      [
        -0.02248,
        127.95234
      ],
      [
        -0.1134,
        127.91905
      ],
      [
        -0.23661,
        127.8718
      ],
      [
        -0.19701,
        127.746
      ],
      [
        -0.19326,
        127.64108
      ],
      [
        -0.14031,
        127.53919
      ],
      [
        -0.01447,
        127.57479
      ],
      [
        0.07165,
        127.5399
      ],
      [
        0.15037,
        127.58831
      ],
      [
        0.14454,
        127.68824
      ],
      [
        0.22603,
        127.746
      ]
    ],
    "neighbors": [
      {
        "glottocode": "sawa1247",
        "name": "Sawai",
        "distanceKm": 66.0
      },
      {
        "glottocode": "baca1243",
        "name": "Bacanese Malay",
        "distanceKm": 77.4
      },
      {
        "glottocode": "tern1247",
        "name": "Ternate",
        "distanceKm": 98.2
      },
      {
        "glottocode": "sahu1245",
        "name": "Sahu",
        "distanceKm": 112.8
      },
      {
        "glottocode": "tobe1252",
        "name": "Tobelo",
        "distanceKm": 127.3
      }
    ]
  },
  {
    "glottocode": "gale1259",
    "name": "Galela",
    "isocode": "gbi",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 2.31461,
    "longitude": 128.44,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku Utara (Halmahera Utara)",
    "family": "North Halmahera (Papuan)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        2.50752,
        128.44
      ],
      [
        2.46852,
        128.51418
      ],
      [
        2.47726,
        128.64412
      ],
      [
        2.36473,
        128.65977
      ],
      [
        2.26402,
        128.66183
      ],
      [
        2.13269,
        128.66831
      ],
      [
        2.11799,
        128.53476
      ],
      [
        2.08448,
        128.44
      ],
      [
        2.08737,
        128.33048
      ],
      [
        2.2135,
        128.31311
      ],
      [
        2.2706,
        128.247
      ],
      [
        2.35816,
        128.24905
      ],
      [
        2.39645,
        128.33729
      ],
      [
        2.49914,
        128.35106
      ],
      [
        2.50752,
        128.44
      ]
    ],
    "neighbors": [
      {
        "glottocode": "tobe1252",
        "name": "Tobelo",
        "distanceKm": 139.3
      }
    ]
  },
  {
    "glottocode": "tobe1252",
    "name": "Tobelo",
    "isocode": "tlb",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 1.0946,
    "longitude": 128.154,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku Utara (Tobelo)",
    "family": "North Halmahera (Papuan)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        1.27859,
        128.154
      ],
      [
        1.34044,
        128.27241
      ],
      [
        1.24148,
        128.33821
      ],
      [
        1.14552,
        128.37714
      ],
      [
        1.03037,
        128.43545
      ],
      [
        0.96329,
        128.31869
      ],
      [
        0.90034,
        128.24757
      ],
      [
        0.85555,
        128.154
      ],
      [
        0.95929,
        128.08883
      ],
      [
        0.97771,
        128.0074
      ],
      [
        1.05138,
        127.96463
      ],
      [
        1.12451,
        128.02294
      ],
      [
        1.22705,
        127.98788
      ],
      [
        1.28148,
        128.06398
      ],
      [
        1.27859,
        128.154
      ]
    ],
    "neighbors": [
      {
        "glottocode": "buli1255",
        "name": "Buli (Indonesia)",
        "distanceKm": 33.8
      },
      {
        "glottocode": "pagu1249",
        "name": "Pagu",
        "distanceKm": 43.6
      },
      {
        "glottocode": "sawa1247",
        "name": "Sawai",
        "distanceKm": 65.3
      },
      {
        "glottocode": "sahu1245",
        "name": "Sahu",
        "distanceKm": 74.1
      },
      {
        "glottocode": "tern1247",
        "name": "Ternate",
        "distanceKm": 96.8
      }
    ]
  },
  {
    "glottocode": "sahu1245",
    "name": "Sahu",
    "isocode": "saj",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 1.00742,
    "longitude": 127.493,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku Utara (Halmahera Barat)",
    "family": "North Halmahera (Papuan)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        1.28927,
        127.493
      ],
      [
        1.22507,
        127.59783
      ],
      [
        1.14799,
        127.66929
      ],
      [
        1.06993,
        127.76691
      ],
      [
        0.96296,
        127.68784
      ],
      [
        0.88282,
        127.64927
      ],
      [
        0.80314,
        127.59139
      ],
      [
        0.86623,
        127.493
      ],
      [
        0.84392,
        127.41425
      ],
      [
        0.88422,
        127.33849
      ],
      [
        0.97579,
        127.35441
      ],
      [
        1.05709,
        127.27535
      ],
      [
        1.14658,
        127.31847
      ],
      [
        1.18429,
        127.40781
      ],
      [
        1.28927,
        127.493
      ]
    ],
    "neighbors": [
      {
        "glottocode": "tern1247",
        "name": "Ternate",
        "distanceKm": 28.6
      },
      {
        "glottocode": "pagu1249",
        "name": "Pagu",
        "distanceKm": 39.3
      },
      {
        "glottocode": "tobe1252",
        "name": "Tobelo",
        "distanceKm": 74.1
      },
      {
        "glottocode": "sawa1247",
        "name": "Sawai",
        "distanceKm": 86.0
      },
      {
        "glottocode": "buli1255",
        "name": "Buli (Indonesia)",
        "distanceKm": 105.6
      }
    ]
  },
  {
    "glottocode": "pagu1249",
    "name": "Pagu",
    "isocode": "pgu",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 1.2134,
    "longitude": 127.78,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku Utara (Halmahera Utara)",
    "family": "North Halmahera (Papuan)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        1.45612,
        127.78
      ],
      [
        1.40931,
        127.87436
      ],
      [
        1.38147,
        127.9908
      ],
      [
        1.25509,
        127.96271
      ],
      [
        1.17234,
        127.95995
      ],
      [
        1.07819,
        127.94959
      ],
      [
        1.09052,
        127.83919
      ],
      [
        1.03308,
        127.78
      ],
      [
        1.02816,
        127.69077
      ],
      [
        1.1177,
        127.65997
      ],
      [
        1.16096,
        127.55018
      ],
      [
        1.26647,
        127.54742
      ],
      [
        1.34195,
        127.61877
      ],
      [
        1.47167,
        127.6556
      ],
      [
        1.45612,
        127.78
      ]
    ],
    "neighbors": [
      {
        "glottocode": "sahu1245",
        "name": "Sahu",
        "distanceKm": 39.3
      },
      {
        "glottocode": "tobe1252",
        "name": "Tobelo",
        "distanceKm": 43.6
      },
      {
        "glottocode": "tern1247",
        "name": "Ternate",
        "distanceKm": 67.3
      },
      {
        "glottocode": "buli1255",
        "name": "Buli (Indonesia)",
        "distanceKm": 77.4
      },
      {
        "glottocode": "sawa1247",
        "name": "Sawai",
        "distanceKm": 85.2
      }
    ]
  },
  {
    "glottocode": "buli1255",
    "name": "Buli (Indonesia)",
    "isocode": "bzq",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 1.0008,
    "longitude": 128.443,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku Utara (Halmahera Timur)",
    "family": "Austronesian (South Halmahera)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        1.20641,
        128.443
      ],
      [
        1.23141,
        128.55407
      ],
      [
        1.10986,
        128.57978
      ],
      [
        1.03893,
        128.61007
      ],
      [
        0.9539,
        128.6485
      ],
      [
        0.91574,
        128.54968
      ],
      [
        0.83506,
        128.52283
      ],
      [
        0.78337,
        128.443
      ],
      [
        0.85026,
        128.37049
      ],
      [
        0.8461,
        128.24898
      ],
      [
        0.94479,
        128.19757
      ],
      [
        1.04804,
        128.236
      ],
      [
        1.1795,
        128.21888
      ],
      [
        1.2162,
        128.33925
      ],
      [
        1.20641,
        128.443
      ]
    ],
    "neighbors": [
      {
        "glottocode": "tobe1252",
        "name": "Tobelo",
        "distanceKm": 33.8
      },
      {
        "glottocode": "sawa1247",
        "name": "Sawai",
        "distanceKm": 67.4
      },
      {
        "glottocode": "pagu1249",
        "name": "Pagu",
        "distanceKm": 77.4
      },
      {
        "glottocode": "sahu1245",
        "name": "Sahu",
        "distanceKm": 105.6
      },
      {
        "glottocode": "tern1247",
        "name": "Ternate",
        "distanceKm": 125.3
      }
    ]
  },
  {
    "glottocode": "sawa1247",
    "name": "Sawai",
    "isocode": "szw",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 0.51111,
    "longitude": 128.086,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku Utara (Weda)",
    "family": "Austronesian (South Halmahera)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        0.75287,
        128.086
      ],
      [
        0.65903,
        128.15724
      ],
      [
        0.61191,
        128.21241
      ],
      [
        0.55767,
        128.28999
      ],
      [
        0.47964,
        128.22388
      ],
      [
        0.39157,
        128.23591
      ],
      [
        0.30227,
        128.18658
      ],
      [
        0.32983,
        128.086
      ],
      [
        0.27788,
        127.97368
      ],
      [
        0.34815,
        127.88165
      ],
      [
        0.46353,
        127.87754
      ],
      [
        0.57378,
        127.81143
      ],
      [
        0.65533,
        127.90515
      ],
      [
        0.68341,
        128.00302
      ],
      [
        0.75287,
        128.086
      ]
    ],
    "neighbors": [
      {
        "glottocode": "tobe1252",
        "name": "Tobelo",
        "distanceKm": 65.3
      },
      {
        "glottocode": "tido1248",
        "name": "Tidore",
        "distanceKm": 66.0
      },
      {
        "glottocode": "buli1255",
        "name": "Buli (Indonesia)",
        "distanceKm": 67.4
      },
      {
        "glottocode": "pagu1249",
        "name": "Pagu",
        "distanceKm": 85.2
      },
      {
        "glottocode": "sahu1245",
        "name": "Sahu",
        "distanceKm": 86.0
      }
    ]
  },
  {
    "glottocode": "gebe1237",
    "name": "Gebe",
    "isocode": "gei",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -0.07877,
    "longitude": 129.424,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Maluku Utara (Pulau Gebe)",
    "family": "Austronesian (South Halmahera)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        0.07785,
        129.424
      ],
      [
        0.06224,
        129.49191
      ],
      [
        0.05374,
        129.59017
      ],
      [
        -0.0452,
        129.57108
      ],
      [
        -0.12383,
        129.62141
      ],
      [
        -0.23283,
        129.61719
      ],
      [
        -0.25388,
        129.50833
      ],
      [
        -0.34519,
        129.424
      ],
      [
        -0.31891,
        129.30836
      ],
      [
        -0.21002,
        129.25942
      ],
      [
        -0.13933,
        129.15865
      ],
      [
        -0.02969,
        129.20897
      ],
      [
        0.03093,
        129.28644
      ],
      [
        0.12727,
        129.32478
      ],
      [
        0.07785,
        129.424
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kawe1240",
        "name": "Kawe",
        "distanceKm": 101.0
      }
    ]
  },
  {
    "glottocode": "biak1248",
    "name": "Biak",
    "isocode": "bhw",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -0.9523,
    "longitude": 135.879,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Kepulauan Biak Numfor & Supiori)",
    "family": "Austronesian (South Halmahera-West New Guinea)",
    "estimatedRadiusKm": 48.0,
    "estimatedAreaKm2": 6659.2,
    "boundaryPolygon": [
      [
        -0.6844,
        135.879
      ],
      [
        -0.61196,
        136.04292
      ],
      [
        -0.7773,
        136.09847
      ],
      [
        -0.87041,
        136.23784
      ],
      [
        -1.0521,
        136.3163
      ],
      [
        -1.17114,
        136.15345
      ],
      [
        -1.36883,
        136.07962
      ],
      [
        -1.40961,
        135.879
      ],
      [
        -1.26535,
        135.72822
      ],
      [
        -1.22947,
        135.5314
      ],
      [
        -1.03178,
        135.53072
      ],
      [
        -0.89072,
        135.60918
      ],
      [
        -0.71898,
        135.58638
      ],
      [
        -0.71543,
        135.76492
      ],
      [
        -0.6844,
        135.879
      ]
    ],
    "neighbors": [
      {
        "glottocode": "mung1269",
        "name": "Munggui",
        "distanceKm": 79.7
      },
      {
        "glottocode": "maru1247",
        "name": "Marau",
        "distanceKm": 80.0
      },
      {
        "glottocode": "pomm1237",
        "name": "Pom",
        "distanceKm": 82.0
      },
      {
        "glottocode": "woii1237",
        "name": "Woi",
        "distanceKm": 87.0
      },
      {
        "glottocode": "busa1254",
        "name": "Busami",
        "distanceKm": 88.9
      }
    ]
  },
  {
    "glottocode": "roon1237",
    "name": "Roon",
    "isocode": "rnn",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.43005,
    "longitude": 134.556,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Barat (Teluk Wondama)",
    "family": "Austronesian (SHWNG)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -2.11549,
        134.556
      ],
      [
        -2.21172,
        134.66123
      ],
      [
        -2.23829,
        134.79668
      ],
      [
        -2.34739,
        134.91849
      ],
      [
        -2.49383,
        134.83571
      ],
      [
        -2.65687,
        134.84068
      ],
      [
        -2.75069,
        134.71055
      ],
      [
        -2.68961,
        134.556
      ],
      [
        -2.729,
        134.41191
      ],
      [
        -2.59625,
        134.3474
      ],
      [
        -2.47514,
        134.35825
      ],
      [
        -2.36608,
        134.27547
      ],
      [
        -2.29891,
        134.39141
      ],
      [
        -2.23342,
        134.46122
      ],
      [
        -2.11549,
        134.556
      ]
    ],
    "neighbors": [
      {
        "glottocode": "dusn1237",
        "name": "Dusner",
        "distanceKm": 38.9
      },
      {
        "glottocode": "meos1237",
        "name": "Meoswar",
        "distanceKm": 43.8
      },
      {
        "glottocode": "wand1267",
        "name": "Wandamen",
        "distanceKm": 65.2
      },
      {
        "glottocode": "yere1243",
        "name": "Yeretuar",
        "distanceKm": 66.2
      },
      {
        "glottocode": "irar1238",
        "name": "Irarutu",
        "distanceKm": 122.0
      }
    ]
  },
  {
    "glottocode": "wand1267",
    "name": "Wandamen",
    "isocode": "wad",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.25622,
    "longitude": 133.996,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Barat (Wasior)",
    "family": "Austronesian (SHWNG)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -1.99338,
        133.996
      ],
      [
        -1.96686,
        134.13546
      ],
      [
        -2.01755,
        134.29551
      ],
      [
        -2.19189,
        134.27806
      ],
      [
        -2.33521,
        134.34235
      ],
      [
        -2.47088,
        134.26538
      ],
      [
        -2.47334,
        134.10064
      ],
      [
        -2.56751,
        133.996
      ],
      [
        -2.48413,
        133.88616
      ],
      [
        -2.37551,
        133.8463
      ],
      [
        -2.31965,
        133.71789
      ],
      [
        -2.20746,
        133.78218
      ],
      [
        -2.11291,
        133.81616
      ],
      [
        -1.95607,
        133.85134
      ],
      [
        -1.99338,
        133.996
      ]
    ],
    "neighbors": [
      {
        "glottocode": "meos1237",
        "name": "Meoswar",
        "distanceKm": 46.8
      },
      {
        "glottocode": "roon1237",
        "name": "Roon",
        "distanceKm": 65.2
      },
      {
        "glottocode": "dusn1237",
        "name": "Dusner",
        "distanceKm": 69.3
      },
      {
        "glottocode": "irar1238",
        "name": "Irarutu",
        "distanceKm": 89.0
      },
      {
        "glottocode": "yere1243",
        "name": "Yeretuar",
        "distanceKm": 112.0
      }
    ]
  },
  {
    "glottocode": "dusn1237",
    "name": "Dusner",
    "isocode": "dsn",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.73859,
    "longitude": 134.391,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Barat (Teluk Wondama)",
    "family": "Austronesian (SHWNG)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -2.40838,
        134.391
      ],
      [
        -2.38919,
        134.55945
      ],
      [
        -2.5609,
        134.61407
      ],
      [
        -2.66285,
        134.72321
      ],
      [
        -2.81178,
        134.71201
      ],
      [
        -2.87672,
        134.56441
      ],
      [
        -3.0023,
        134.51814
      ],
      [
        -2.98251,
        134.391
      ],
      [
        -2.90646,
        134.31006
      ],
      [
        -2.91887,
        134.16468
      ],
      [
        -2.79061,
        134.16284
      ],
      [
        -2.68402,
        134.15164
      ],
      [
        -2.51876,
        134.11503
      ],
      [
        -2.48503,
        134.26875
      ],
      [
        -2.40838,
        134.391
      ]
    ],
    "neighbors": [
      {
        "glottocode": "roon1237",
        "name": "Roon",
        "distanceKm": 38.9
      },
      {
        "glottocode": "yere1243",
        "name": "Yeretuar",
        "distanceKm": 42.7
      },
      {
        "glottocode": "wand1267",
        "name": "Wandamen",
        "distanceKm": 69.3
      },
      {
        "glottocode": "meos1237",
        "name": "Meoswar",
        "distanceKm": 73.4
      },
      {
        "glottocode": "irar1238",
        "name": "Irarutu",
        "distanceKm": 92.3
      }
    ]
  },
  {
    "glottocode": "meos1237",
    "name": "Meoswar",
    "isocode": "mvx",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.07828,
    "longitude": 134.378,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Barat (Pulau Meoswar)",
    "family": "Austronesian (SHWNG)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -1.69223,
        134.378
      ],
      [
        -1.83059,
        134.49736
      ],
      [
        -1.87786,
        134.62949
      ],
      [
        -2.00889,
        134.68223
      ],
      [
        -2.12358,
        134.57661
      ],
      [
        -2.25167,
        134.59556
      ],
      [
        -2.29526,
        134.48256
      ],
      [
        -2.26636,
        134.378
      ],
      [
        -2.34786,
        134.24809
      ],
      [
        -2.23582,
        134.18032
      ],
      [
        -2.13664,
        134.12213
      ],
      [
        -1.99583,
        134.01651
      ],
      [
        -1.89371,
        134.1464
      ],
      [
        -1.77799,
        134.23329
      ],
      [
        -1.69223,
        134.378
      ]
    ],
    "neighbors": [
      {
        "glottocode": "roon1237",
        "name": "Roon",
        "distanceKm": 43.8
      },
      {
        "glottocode": "wand1267",
        "name": "Wandamen",
        "distanceKm": 46.8
      },
      {
        "glottocode": "dusn1237",
        "name": "Dusner",
        "distanceKm": 73.4
      },
      {
        "glottocode": "yere1243",
        "name": "Yeretuar",
        "distanceKm": 108.9
      },
      {
        "glottocode": "hata1243",
        "name": "Hatam",
        "distanceKm": 111.5
      }
    ]
  },
  {
    "glottocode": "yere1243",
    "name": "Yeretuar",
    "isocode": "gop",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.01713,
    "longitude": 134.656,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Barat (Teluk Cenderawasih)",
    "family": "Austronesian (SHWNG)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -2.75692,
        134.656
      ],
      [
        -2.74657,
        134.78647
      ],
      [
        -2.83291,
        134.88733
      ],
      [
        -2.97501,
        134.84078
      ],
      [
        -3.077,
        134.91868
      ],
      [
        -3.16948,
        134.84731
      ],
      [
        -3.19393,
        134.74126
      ],
      [
        -3.33104,
        134.656
      ],
      [
        -3.26384,
        134.53702
      ],
      [
        -3.19087,
        134.43784
      ],
      [
        -3.10277,
        134.28027
      ],
      [
        -2.94925,
        134.35817
      ],
      [
        -2.81152,
        134.39782
      ],
      [
        -2.67666,
        134.49181
      ],
      [
        -2.75692,
        134.656
      ]
    ],
    "neighbors": [
      {
        "glottocode": "dusn1237",
        "name": "Dusner",
        "distanceKm": 42.7
      },
      {
        "glottocode": "roon1237",
        "name": "Roon",
        "distanceKm": 66.2
      },
      {
        "glottocode": "meos1237",
        "name": "Meoswar",
        "distanceKm": 108.9
      },
      {
        "glottocode": "wand1267",
        "name": "Wandamen",
        "distanceKm": 112.0
      },
      {
        "glottocode": "irar1238",
        "name": "Irarutu",
        "distanceKm": 119.1
      }
    ]
  },
  {
    "glottocode": "ihaa1241",
    "name": "Iha",
    "isocode": "ihp",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.81013,
    "longitude": 132.271,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Barat (Semenanjung Bomberai, Fakfak)",
    "family": "Trans-New Guinea (West Bomberai)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -2.53095,
        132.271
      ],
      [
        -2.55606,
        132.3935
      ],
      [
        -2.6977,
        132.41215
      ],
      [
        -2.75083,
        132.53112
      ],
      [
        -2.86673,
        132.51927
      ],
      [
        -2.94085,
        132.43511
      ],
      [
        -3.10866,
        132.41494
      ],
      [
        -3.10507,
        132.271
      ],
      [
        -3.07333,
        132.1441
      ],
      [
        -3.05566,
        131.96274
      ],
      [
        -2.87859,
        131.97071
      ],
      [
        -2.73897,
        131.95886
      ],
      [
        -2.58288,
        131.9857
      ],
      [
        -2.59139,
        132.16553
      ],
      [
        -2.53095,
        132.271
      ]
    ],
    "neighbors": [
      {
        "glottocode": "argu1237",
        "name": "Arguni",
        "distanceKm": 36.5
      },
      {
        "glottocode": "baha1258",
        "name": "Baham",
        "distanceKm": 52.3
      },
      {
        "glottocode": "koko1265",
        "name": "Kokoda",
        "distanceKm": 78.3
      },
      {
        "glottocode": "kara1499",
        "name": "Kalamang",
        "distanceKm": 86.2
      },
      {
        "glottocode": "yaha1248",
        "name": "Yahadian",
        "distanceKm": 98.3
      }
    ]
  },
  {
    "glottocode": "baha1258",
    "name": "Baham",
    "isocode": "bdw",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.10628,
    "longitude": 132.637,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Barat (Fakfak)",
    "family": "Trans-New Guinea (West Bomberai)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -2.83298,
        132.637
      ],
      [
        -2.94605,
        132.71427
      ],
      [
        -2.93765,
        132.84876
      ],
      [
        -3.04623,
        132.9005
      ],
      [
        -3.1567,
        132.85821
      ],
      [
        -3.32404,
        132.91046
      ],
      [
        -3.38892,
        132.77331
      ],
      [
        -3.40711,
        132.637
      ],
      [
        -3.46332,
        132.4648
      ],
      [
        -3.29562,
        132.39923
      ],
      [
        -3.17398,
        132.33994
      ],
      [
        -3.02894,
        132.29766
      ],
      [
        -2.96608,
        132.46093
      ],
      [
        -2.87165,
        132.52384
      ],
      [
        -2.83298,
        132.637
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kara1499",
        "name": "Kalamang",
        "distanceKm": 40.7
      },
      {
        "glottocode": "argu1237",
        "name": "Arguni",
        "distanceKm": 52.0
      },
      {
        "glottocode": "ihaa1241",
        "name": "Iha",
        "distanceKm": 52.3
      },
      {
        "glottocode": "buru1308",
        "name": "Buruwai",
        "distanceKm": 90.8
      },
      {
        "glottocode": "irar1238",
        "name": "Irarutu",
        "distanceKm": 106.9
      }
    ]
  },
  {
    "glottocode": "kara1499",
    "name": "Kalamang",
    "isocode": "kgv",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.47037,
    "longitude": 132.678,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Barat (Pulau Karas, Fakfak)",
    "family": "West Bomberai",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -3.28824,
        132.678
      ],
      [
        -3.21787,
        132.79982
      ],
      [
        -3.28998,
        132.90461
      ],
      [
        -3.4159,
        132.9171
      ],
      [
        -3.55166,
        133.03482
      ],
      [
        -3.67495,
        132.935
      ],
      [
        -3.74378,
        132.80991
      ],
      [
        -3.86237,
        132.678
      ],
      [
        -3.73514,
        132.55026
      ],
      [
        -3.64795,
        132.45492
      ],
      [
        -3.54365,
        132.35634
      ],
      [
        -3.42391,
        132.47406
      ],
      [
        -3.31698,
        132.48531
      ],
      [
        -3.22651,
        132.56035
      ],
      [
        -3.28824,
        132.678
      ]
    ],
    "neighbors": [
      {
        "glottocode": "baha1258",
        "name": "Baham",
        "distanceKm": 40.7
      },
      {
        "glottocode": "buru1308",
        "name": "Buruwai",
        "distanceKm": 72.5
      },
      {
        "glottocode": "ihaa1241",
        "name": "Iha",
        "distanceKm": 86.2
      },
      {
        "glottocode": "argu1237",
        "name": "Arguni",
        "distanceKm": 92.7
      },
      {
        "glottocode": "kamb1302",
        "name": "North Kamrau",
        "distanceKm": 93.5
      }
    ]
  },
  {
    "glottocode": "argu1237",
    "name": "Arguni",
    "isocode": "agf",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.645798,
    "longitude": 132.5556,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Barat (Fakfak)",
    "family": "Austronesian (SHWNG)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -2.35135,
        132.5556
      ],
      [
        -2.36598,
        132.6905
      ],
      [
        -2.48243,
        132.76067
      ],
      [
        -2.56181,
        132.92397
      ],
      [
        -2.72072,
        132.88421
      ],
      [
        -2.83254,
        132.79002
      ],
      [
        -2.98946,
        132.72128
      ],
      [
        -2.92547,
        132.5556
      ],
      [
        -2.88325,
        132.44113
      ],
      [
        -2.84039,
        132.31132
      ],
      [
        -2.68956,
        132.36365
      ],
      [
        -2.59297,
        132.32388
      ],
      [
        -2.47458,
        132.34067
      ],
      [
        -2.47219,
        132.4719
      ],
      [
        -2.35135,
        132.5556
      ]
    ],
    "neighbors": [
      {
        "glottocode": "ihaa1241",
        "name": "Iha",
        "distanceKm": 36.5
      },
      {
        "glottocode": "baha1258",
        "name": "Baham",
        "distanceKm": 52.0
      },
      {
        "glottocode": "koko1265",
        "name": "Kokoda",
        "distanceKm": 58.7
      },
      {
        "glottocode": "kara1499",
        "name": "Kalamang",
        "distanceKm": 92.7
      },
      {
        "glottocode": "yaha1248",
        "name": "Yahadian",
        "distanceKm": 93.3
      }
    ]
  },
  {
    "glottocode": "buru1308",
    "name": "Buruwai",
    "isocode": "asi",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.54561,
    "longitude": 133.327,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Papua Barat (Kaimana)",
    "family": "Trans-New Guinea (Asmat-Kamoro)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -3.30147,
        133.327
      ],
      [
        -3.36236,
        133.41542
      ],
      [
        -3.3692,
        133.54863
      ],
      [
        -3.49008,
        133.57077
      ],
      [
        -3.59304,
        133.53519
      ],
      [
        -3.71369,
        133.53817
      ],
      [
        -3.72025,
        133.41126
      ],
      [
        -3.72451,
        133.327
      ],
      [
        -3.74351,
        133.23151
      ],
      [
        -3.63297,
        133.21725
      ],
      [
        -3.58421,
        133.15755
      ],
      [
        -3.4989,
        133.12197
      ],
      [
        -3.44993,
        133.20679
      ],
      [
        -3.3391,
        133.22736
      ],
      [
        -3.30147,
        133.327
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kamb1302",
        "name": "North Kamrau",
        "distanceKm": 21.3
      },
      {
        "glottocode": "kara1499",
        "name": "Kalamang",
        "distanceKm": 72.5
      },
      {
        "glottocode": "irar1238",
        "name": "Irarutu",
        "distanceKm": 72.8
      },
      {
        "glottocode": "baha1258",
        "name": "Baham",
        "distanceKm": 90.8
      },
      {
        "glottocode": "argu1237",
        "name": "Arguni",
        "distanceKm": 131.7
      }
    ]
  },
  {
    "glottocode": "kamb1302",
    "name": "North Kamrau",
    "isocode": "irx",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.53189,
    "longitude": 133.518,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Barat (Teluk Kamrau)",
    "family": "Austronesian (SHWNG)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -3.24685,
        133.518
      ],
      [
        -3.18595,
        133.68491
      ],
      [
        -3.32355,
        133.77974
      ],
      [
        -3.47098,
        133.78539
      ],
      [
        -3.60913,
        133.85704
      ],
      [
        -3.68547,
        133.71095
      ],
      [
        -3.73444,
        133.61573
      ],
      [
        -3.82098,
        133.518
      ],
      [
        -3.70322,
        133.43533
      ],
      [
        -3.68152,
        133.33002
      ],
      [
        -3.59873,
        133.22459
      ],
      [
        -3.48137,
        133.29625
      ],
      [
        -3.32751,
        133.26122
      ],
      [
        -3.21716,
        133.36615
      ],
      [
        -3.24685,
        133.518
      ]
    ],
    "neighbors": [
      {
        "glottocode": "buru1308",
        "name": "Buruwai",
        "distanceKm": 21.3
      },
      {
        "glottocode": "irar1238",
        "name": "Irarutu",
        "distanceKm": 65.8
      },
      {
        "glottocode": "kara1499",
        "name": "Kalamang",
        "distanceKm": 93.5
      },
      {
        "glottocode": "baha1258",
        "name": "Baham",
        "distanceKm": 108.6
      },
      {
        "glottocode": "dusn1237",
        "name": "Dusner",
        "distanceKm": 131.1
      }
    ]
  },
  {
    "glottocode": "irar1238",
    "name": "Irarutu",
    "isocode": "irh",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.94438,
    "longitude": 133.586,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Papua Barat (Kaimana)",
    "family": "Austronesian (SHWNG)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -2.66643,
        133.586
      ],
      [
        -2.72935,
        133.68969
      ],
      [
        -2.82737,
        133.73292
      ],
      [
        -2.8907,
        133.82152
      ],
      [
        -2.98238,
        133.7527
      ],
      [
        -3.04156,
        133.70802
      ],
      [
        -3.13441,
        133.67764
      ],
      [
        -3.08947,
        133.586
      ],
      [
        -3.1105,
        133.5059
      ],
      [
        -3.09113,
        133.40174
      ],
      [
        -2.98483,
        133.40854
      ],
      [
        -2.88824,
        133.33972
      ],
      [
        -2.7778,
        133.37684
      ],
      [
        -2.75327,
        133.49384
      ],
      [
        -2.66643,
        133.586
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kamb1302",
        "name": "North Kamrau",
        "distanceKm": 65.8
      },
      {
        "glottocode": "buru1308",
        "name": "Buruwai",
        "distanceKm": 72.8
      },
      {
        "glottocode": "wand1267",
        "name": "Wandamen",
        "distanceKm": 89.0
      },
      {
        "glottocode": "dusn1237",
        "name": "Dusner",
        "distanceKm": 92.3
      },
      {
        "glottocode": "baha1258",
        "name": "Baham",
        "distanceKm": 106.9
      }
    ]
  },
  {
    "glottocode": "hata1243",
    "name": "Hatam",
    "isocode": "had",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.13531,
    "longitude": 134.037,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Barat (Pegunungan Arfak, Manokwari)",
    "family": "Hatam-Mansim",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -0.82581,
        134.037
      ],
      [
        -0.92426,
        134.13866
      ],
      [
        -0.94257,
        134.27873
      ],
      [
        -1.08605,
        134.25287
      ],
      [
        -1.18078,
        134.23624
      ],
      [
        -1.31611,
        134.26376
      ],
      [
        -1.32427,
        134.12802
      ],
      [
        -1.39994,
        134.037
      ],
      [
        -1.44153,
        133.8895
      ],
      [
        -1.30053,
        133.82977
      ],
      [
        -1.2138,
        133.69303
      ],
      [
        -1.05302,
        133.6764
      ],
      [
        -0.95815,
        133.8148
      ],
      [
        -0.807,
        133.87886
      ],
      [
        -0.82581,
        134.037
      ]
    ],
    "neighbors": [
      {
        "glottocode": "meya1236",
        "name": "Meyah",
        "distanceKm": 46.8
      },
      {
        "glottocode": "meos1237",
        "name": "Meoswar",
        "distanceKm": 111.5
      },
      {
        "glottocode": "mosk1236",
        "name": "Moskona",
        "distanceKm": 113.0
      },
      {
        "glottocode": "wand1267",
        "name": "Wandamen",
        "distanceKm": 124.7
      }
    ]
  },
  {
    "glottocode": "meya1236",
    "name": "Meyah",
    "isocode": "mej",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.18016,
    "longitude": 133.618,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Barat (Pegunungan Arfak)",
    "family": "East Bird's Head",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -0.96541,
        133.618
      ],
      [
        -0.91493,
        133.74575
      ],
      [
        -1.04501,
        133.78751
      ],
      [
        -1.13481,
        133.81674
      ],
      [
        -1.24689,
        133.91041
      ],
      [
        -1.32187,
        133.79573
      ],
      [
        -1.43346,
        133.74001
      ],
      [
        -1.53953,
        133.618
      ],
      [
        -1.4322,
        133.4966
      ],
      [
        -1.40297,
        133.33854
      ],
      [
        -1.26256,
        133.25689
      ],
      [
        -1.11913,
        133.35056
      ],
      [
        -0.9639,
        133.34676
      ],
      [
        -0.91619,
        133.49085
      ],
      [
        -0.96541,
        133.618
      ]
    ],
    "neighbors": [
      {
        "glottocode": "hata1243",
        "name": "Hatam",
        "distanceKm": 46.8
      },
      {
        "glottocode": "mosk1236",
        "name": "Moskona",
        "distanceKm": 72.0
      },
      {
        "glottocode": "karo1303",
        "name": "Karon Dori",
        "distanceKm": 114.8
      },
      {
        "glottocode": "maib1239",
        "name": "Maybrat",
        "distanceKm": 116.1
      },
      {
        "glottocode": "wand1267",
        "name": "Wandamen",
        "distanceKm": 126.8
      }
    ]
  },
  {
    "glottocode": "mosk1236",
    "name": "Moskona",
    "isocode": "mtj",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.62201,
    "longitude": 133.145,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Barat (Teluk Bintuni)",
    "family": "East Bird's Head",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -1.33713,
        133.145
      ],
      [
        -1.42494,
        133.23994
      ],
      [
        -1.49119,
        133.30911
      ],
      [
        -1.55197,
        133.45197
      ],
      [
        -1.67711,
        133.3865
      ],
      [
        -1.80748,
        133.37767
      ],
      [
        -1.9605,
        133.30807
      ],
      [
        -1.91126,
        133.145
      ],
      [
        -1.94221,
        132.99074
      ],
      [
        -1.84915,
        132.86006
      ],
      [
        -1.67973,
        132.89202
      ],
      [
        -1.54935,
        132.82654
      ],
      [
        -1.44952,
        132.92862
      ],
      [
        -1.44323,
        133.05887
      ],
      [
        -1.33713,
        133.145
      ]
    ],
    "neighbors": [
      {
        "glottocode": "maib1239",
        "name": "Maybrat",
        "distanceKm": 67.8
      },
      {
        "glottocode": "meya1236",
        "name": "Meyah",
        "distanceKm": 72.0
      },
      {
        "glottocode": "kais1235",
        "name": "Kais",
        "distanceKm": 94.3
      },
      {
        "glottocode": "koko1265",
        "name": "Kokoda",
        "distanceKm": 95.7
      },
      {
        "glottocode": "karo1303",
        "name": "Karon Dori",
        "distanceKm": 107.2
      }
    ]
  },
  {
    "glottocode": "abun1252",
    "name": "Abun",
    "isocode": "kgr",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -0.57073,
    "longitude": 132.416,
    "isNational": true,
    "isFromCsv": true,
    "island": "Papua",
    "province": "Papua Barat Daya (Tambrauw)",
    "family": "Isolate / West Papuan",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -0.34342,
        132.416
      ],
      [
        -0.37128,
        132.51206
      ],
      [
        -0.36323,
        132.6762
      ],
      [
        -0.51099,
        132.67773
      ],
      [
        -0.64001,
        132.71954
      ],
      [
        -0.81202,
        132.71858
      ],
      [
        -0.83422,
        132.5429
      ],
      [
        -0.91755,
        132.416
      ],
      [
        -0.88855,
        132.26294
      ],
      [
        -0.7212,
        132.22731
      ],
      [
        -0.63875,
        132.11797
      ],
      [
        -0.51225,
        132.15978
      ],
      [
        -0.45406,
        132.26969
      ],
      [
        -0.31695,
        132.29378
      ],
      [
        -0.34342,
        132.416
      ]
    ],
    "neighbors": [
      {
        "glottocode": "karo1303",
        "name": "Karon Dori",
        "distanceKm": 36.5
      },
      {
        "glottocode": "maib1239",
        "name": "Maybrat",
        "distanceKm": 90.8
      },
      {
        "glottocode": "moii1235",
        "name": "Moi (Indonesia)",
        "distanceKm": 108.9
      },
      {
        "glottocode": "tehi1237",
        "name": "Tehit",
        "distanceKm": 115.0
      },
      {
        "glottocode": "kala1256",
        "name": "Kalabra",
        "distanceKm": 130.5
      }
    ]
  },
  {
    "glottocode": "moii1235",
    "name": "Moi (Indonesia)",
    "isocode": "mxn",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -0.96532,
    "longitude": 131.52,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Barat Daya (Sorong)",
    "family": "West Papuan (Bird's Head)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -0.72848,
        131.52
      ],
      [
        -0.64832,
        131.67268
      ],
      [
        -0.78608,
        131.7448
      ],
      [
        -0.89395,
        131.83274
      ],
      [
        -1.05255,
        131.90226
      ],
      [
        -1.14557,
        131.74605
      ],
      [
        -1.26478,
        131.66423
      ],
      [
        -1.30261,
        131.52
      ],
      [
        -1.16559,
        131.42354
      ],
      [
        -1.14404,
        131.29586
      ],
      [
        -1.0217,
        131.27293
      ],
      [
        -0.9248,
        131.34244
      ],
      [
        -0.7876,
        131.29712
      ],
      [
        -0.74751,
        131.41509
      ],
      [
        -0.72848,
        131.52
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kala1256",
        "name": "Kalabra",
        "distanceKm": 52.9
      },
      {
        "glottocode": "sege1235",
        "name": "Seget",
        "distanceKm": 56.1
      },
      {
        "glottocode": "made1253",
        "name": "Salawati",
        "distanceKm": 77.0
      },
      {
        "glottocode": "tehi1237",
        "name": "Tehit",
        "distanceKm": 79.7
      },
      {
        "glottocode": "abun1252",
        "name": "Abun",
        "distanceKm": 108.9
      }
    ]
  },
  {
    "glottocode": "sege1235",
    "name": "Seget",
    "isocode": "sbg",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.36931,
    "longitude": 131.218,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Barat Daya (Sorong Selatan)",
    "family": "West Papuan (Bird's Head)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -0.99977,
        131.218
      ],
      [
        -1.09666,
        131.34934
      ],
      [
        -1.16713,
        131.4716
      ],
      [
        -1.28246,
        131.59862
      ],
      [
        -1.43155,
        131.49077
      ],
      [
        -1.56482,
        131.46323
      ],
      [
        -1.65765,
        131.35689
      ],
      [
        -1.5739,
        131.218
      ],
      [
        -1.61393,
        131.10016
      ],
      [
        -1.52509,
        131.0226
      ],
      [
        -1.41022,
        131.03872
      ],
      [
        -1.30379,
        130.93088
      ],
      [
        -1.20685,
        131.01423
      ],
      [
        -1.14037,
        131.10772
      ],
      [
        -0.99977,
        131.218
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kala1256",
        "name": "Kalabra",
        "distanceKm": 44.9
      },
      {
        "glottocode": "made1253",
        "name": "Salawati",
        "distanceKm": 55.4
      },
      {
        "glottocode": "moii1235",
        "name": "Moi (Indonesia)",
        "distanceKm": 56.1
      },
      {
        "glottocode": "tehi1237",
        "name": "Tehit",
        "distanceKm": 86.7
      },
      {
        "glottocode": "yaha1248",
        "name": "Yahadian",
        "distanceKm": 116.6
      }
    ]
  },
  {
    "glottocode": "tehi1237",
    "name": "Tehit",
    "isocode": "kps",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.51049,
    "longitude": 131.985,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Barat Daya (Teminabuan)",
    "family": "West Papuan (Bird's Head)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -1.19825,
        131.985
      ],
      [
        -1.22107,
        132.12443
      ],
      [
        -1.27225,
        132.28385
      ],
      [
        -1.45139,
        132.24401
      ],
      [
        -1.57555,
        132.27016
      ],
      [
        -1.69959,
        132.2222
      ],
      [
        -1.68205,
        132.06765
      ],
      [
        -1.77237,
        131.985
      ],
      [
        -1.73834,
        131.87524
      ],
      [
        -1.63021,
        131.83482
      ],
      [
        -1.57915,
        131.68408
      ],
      [
        -1.4478,
        131.71024
      ],
      [
        -1.34163,
        131.77318
      ],
      [
        -1.16478,
        131.81846
      ],
      [
        -1.19825,
        131.985
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kala1256",
        "name": "Kalabra",
        "distanceKm": 41.9
      },
      {
        "glottocode": "kais1235",
        "name": "Kais",
        "distanceKm": 47.2
      },
      {
        "glottocode": "yaha1248",
        "name": "Yahadian",
        "distanceKm": 49.7
      },
      {
        "glottocode": "maib1239",
        "name": "Maybrat",
        "distanceKm": 69.2
      },
      {
        "glottocode": "moii1235",
        "name": "Moi (Indonesia)",
        "distanceKm": 79.7
      }
    ]
  },
  {
    "glottocode": "kala1256",
    "name": "Kalabra",
    "isocode": "kzz",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.43074,
    "longitude": 131.617,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Barat Daya (Sorong Selatan)",
    "family": "West Papuan (Bird's Head)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -1.11903,
        131.617
      ],
      [
        -1.09867,
        131.77696
      ],
      [
        -1.27574,
        131.81142
      ],
      [
        -1.3704,
        131.88144
      ],
      [
        -1.49512,
        131.89915
      ],
      [
        -1.54393,
        131.75898
      ],
      [
        -1.66382,
        131.72928
      ],
      [
        -1.69316,
        131.617
      ],
      [
        -1.61594,
        131.52778
      ],
      [
        -1.63371,
        131.36241
      ],
      [
        -1.49816,
        131.32153
      ],
      [
        -1.36736,
        131.33925
      ],
      [
        -1.18596,
        131.30996
      ],
      [
        -1.14655,
        131.4801
      ],
      [
        -1.11903,
        131.617
      ]
    ],
    "neighbors": [
      {
        "glottocode": "tehi1237",
        "name": "Tehit",
        "distanceKm": 41.9
      },
      {
        "glottocode": "sege1235",
        "name": "Seget",
        "distanceKm": 44.9
      },
      {
        "glottocode": "moii1235",
        "name": "Moi (Indonesia)",
        "distanceKm": 52.9
      },
      {
        "glottocode": "yaha1248",
        "name": "Yahadian",
        "distanceKm": 78.0
      },
      {
        "glottocode": "kais1235",
        "name": "Kais",
        "distanceKm": 86.5
      }
    ]
  },
  {
    "glottocode": "kais1235",
    "name": "Kais",
    "isocode": "kzm",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.78077,
    "longitude": 132.312,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Barat Daya (Kais, Sorong Selatan)",
    "family": "South Bird's Head",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -1.42936,
        132.312
      ],
      [
        -1.57265,
        132.41227
      ],
      [
        -1.62355,
        132.50924
      ],
      [
        -1.71846,
        132.58513
      ],
      [
        -1.82062,
        132.48667
      ],
      [
        -1.94418,
        132.51701
      ],
      [
        -2.03082,
        132.43247
      ],
      [
        -2.00349,
        132.312
      ],
      [
        -2.08992,
        132.16305
      ],
      [
        -1.98151,
        132.06015
      ],
      [
        -1.84621,
        132.02513
      ],
      [
        -1.69286,
        131.92666
      ],
      [
        -1.58622,
        132.06793
      ],
      [
        -1.51355,
        132.18325
      ],
      [
        -1.42936,
        132.312
      ]
    ],
    "neighbors": [
      {
        "glottocode": "yaha1248",
        "name": "Yahadian",
        "distanceKm": 30.0
      },
      {
        "glottocode": "koko1265",
        "name": "Kokoda",
        "distanceKm": 41.6
      },
      {
        "glottocode": "tehi1237",
        "name": "Tehit",
        "distanceKm": 47.2
      },
      {
        "glottocode": "maib1239",
        "name": "Maybrat",
        "distanceKm": 55.4
      },
      {
        "glottocode": "kala1256",
        "name": "Kalabra",
        "distanceKm": 86.5
      }
    ]
  },
  {
    "glottocode": "koko1265",
    "name": "Kokoda",
    "isocode": "xod",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.12872,
    "longitude": 132.449,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Barat Daya (Kokoda)",
    "family": "South Bird's Head",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -1.91363,
        132.449
      ],
      [
        -1.9148,
        132.55209
      ],
      [
        -1.95619,
        132.66549
      ],
      [
        -2.08791,
        132.62791
      ],
      [
        -2.18911,
        132.71377
      ],
      [
        -2.31368,
        132.68109
      ],
      [
        -2.34615,
        132.55378
      ],
      [
        -2.48775,
        132.449
      ],
      [
        -2.43207,
        132.30281
      ],
      [
        -2.31416,
        132.21631
      ],
      [
        -2.21567,
        132.06779
      ],
      [
        -2.06136,
        132.15366
      ],
      [
        -1.95572,
        132.23191
      ],
      [
        -1.82888,
        132.30451
      ],
      [
        -1.91363,
        132.449
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kais1235",
        "name": "Kais",
        "distanceKm": 41.6
      },
      {
        "glottocode": "yaha1248",
        "name": "Yahadian",
        "distanceKm": 44.3
      },
      {
        "glottocode": "argu1237",
        "name": "Arguni",
        "distanceKm": 58.7
      },
      {
        "glottocode": "ihaa1241",
        "name": "Iha",
        "distanceKm": 78.3
      },
      {
        "glottocode": "tehi1237",
        "name": "Tehit",
        "distanceKm": 85.9
      }
    ]
  },
  {
    "glottocode": "yaha1248",
    "name": "Yahadian",
    "isocode": "ner",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.94317,
    "longitude": 132.096,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Barat Daya (Sorong Selatan)",
    "family": "South Bird's Head",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -1.71469,
        132.096
      ],
      [
        -1.69092,
        132.21755
      ],
      [
        -1.8222,
        132.24778
      ],
      [
        -1.87971,
        132.37421
      ],
      [
        -2.01387,
        132.40591
      ],
      [
        -2.10469,
        132.29866
      ],
      [
        -2.27752,
        132.25711
      ],
      [
        -2.28882,
        132.096
      ],
      [
        -2.20819,
        131.9683
      ],
      [
        -2.18016,
        131.79865
      ],
      [
        -2.00746,
        131.81416
      ],
      [
        -1.88611,
        131.84586
      ],
      [
        -1.74673,
        131.84953
      ],
      [
        -1.76025,
        132.00786
      ],
      [
        -1.71469,
        132.096
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kais1235",
        "name": "Kais",
        "distanceKm": 30.0
      },
      {
        "glottocode": "koko1265",
        "name": "Kokoda",
        "distanceKm": 44.3
      },
      {
        "glottocode": "tehi1237",
        "name": "Tehit",
        "distanceKm": 49.7
      },
      {
        "glottocode": "kala1256",
        "name": "Kalabra",
        "distanceKm": 78.0
      },
      {
        "glottocode": "maib1239",
        "name": "Maybrat",
        "distanceKm": 84.4
      }
    ]
  },
  {
    "glottocode": "maib1239",
    "name": "Maybrat",
    "isocode": "ayz",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.3679,
    "longitude": 132.591,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Barat Daya (Maybrat / Ayamaru)",
    "family": "West Papuan",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -1.07833,
        132.591
      ],
      [
        -1.17891,
        132.68204
      ],
      [
        -1.17987,
        132.82684
      ],
      [
        -1.29261,
        132.92097
      ],
      [
        -1.42881,
        132.85792
      ],
      [
        -1.60338,
        132.88636
      ],
      [
        -1.68145,
        132.74204
      ],
      [
        -1.65246,
        132.591
      ],
      [
        -1.69619,
        132.43286
      ],
      [
        -1.53784,
        132.37784
      ],
      [
        -1.42036,
        132.36108
      ],
      [
        -1.30105,
        132.29803
      ],
      [
        -1.24541,
        132.43736
      ],
      [
        -1.16418,
        132.49287
      ],
      [
        -1.07833,
        132.591
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kais1235",
        "name": "Kais",
        "distanceKm": 55.4
      },
      {
        "glottocode": "karo1303",
        "name": "Karon Dori",
        "distanceKm": 65.1
      },
      {
        "glottocode": "mosk1236",
        "name": "Moskona",
        "distanceKm": 67.8
      },
      {
        "glottocode": "tehi1237",
        "name": "Tehit",
        "distanceKm": 69.2
      },
      {
        "glottocode": "yaha1248",
        "name": "Yahadian",
        "distanceKm": 84.4
      }
    ]
  },
  {
    "glottocode": "karo1303",
    "name": "Karon Dori",
    "isocode": "kgw",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -0.7871,
    "longitude": 132.663,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Barat Daya (Tambrauw)",
    "family": "West Papuan",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -0.55833,
        132.663
      ],
      [
        -0.5004,
        132.80108
      ],
      [
        -0.56491,
        132.94164
      ],
      [
        -0.72403,
        132.93936
      ],
      [
        -0.87116,
        133.03131
      ],
      [
        -1.00145,
        132.93182
      ],
      [
        -1.03004,
        132.78
      ],
      [
        -1.13245,
        132.663
      ],
      [
        -1.01767,
        132.55195
      ],
      [
        -0.92288,
        132.49273
      ],
      [
        -0.85178,
        132.37957
      ],
      [
        -0.7434,
        132.47152
      ],
      [
        -0.64349,
        132.4829
      ],
      [
        -0.51277,
        132.53088
      ],
      [
        -0.55833,
        132.663
      ]
    ],
    "neighbors": [
      {
        "glottocode": "abun1252",
        "name": "Abun",
        "distanceKm": 36.5
      },
      {
        "glottocode": "maib1239",
        "name": "Maybrat",
        "distanceKm": 65.1
      },
      {
        "glottocode": "mosk1236",
        "name": "Moskona",
        "distanceKm": 107.2
      },
      {
        "glottocode": "tehi1237",
        "name": "Tehit",
        "distanceKm": 110.2
      },
      {
        "glottocode": "meya1236",
        "name": "Meyah",
        "distanceKm": 114.8
      }
    ]
  },
  {
    "glottocode": "waig1244",
    "name": "Ambel",
    "isocode": "wgo",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -0.17957,
    "longitude": 130.917,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Barat Daya (Pulau Waigeo, Raja Ampat)",
    "family": "Austronesian (SHWNG)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        0.15327,
        130.917
      ],
      [
        0.15355,
        131.07742
      ],
      [
        -0.00059,
        131.14143
      ],
      [
        -0.09699,
        131.27879
      ],
      [
        -0.25385,
        131.24243
      ],
      [
        -0.33611,
        131.1133
      ],
      [
        -0.47263,
        131.05813
      ],
      [
        -0.42086,
        130.917
      ],
      [
        -0.36372,
        130.82832
      ],
      [
        -0.35856,
        130.69256
      ],
      [
        -0.22475,
        130.71905
      ],
      [
        -0.12609,
        130.68269
      ],
      [
        0.02185,
        130.66443
      ],
      [
        0.04464,
        130.80903
      ],
      [
        0.15327,
        130.917
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kawe1240",
        "name": "Kawe",
        "distanceKm": 65.6
      },
      {
        "glottocode": "made1253",
        "name": "Salawati",
        "distanceKm": 97.6
      },
      {
        "glottocode": "moii1235",
        "name": "Moi (Indonesia)",
        "distanceKm": 110.1
      },
      {
        "glottocode": "sege1235",
        "name": "Seget",
        "distanceKm": 136.5
      }
    ]
  },
  {
    "glottocode": "kawe1240",
    "name": "Kawe",
    "isocode": "kgb",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -0.17313,
    "longitude": 130.327,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Barat Daya (Raja Ampat Barat)",
    "family": "Austronesian (SHWNG)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        0.20395,
        130.327
      ],
      [
        0.08284,
        130.45027
      ],
      [
        0.05027,
        130.60713
      ],
      [
        -0.10203,
        130.6385
      ],
      [
        -0.22453,
        130.55222
      ],
      [
        -0.36421,
        130.56661
      ],
      [
        -0.38103,
        130.42712
      ],
      [
        -0.37018,
        130.327
      ],
      [
        -0.43443,
        130.20116
      ],
      [
        -0.30769,
        130.15826
      ],
      [
        -0.22979,
        130.07877
      ],
      [
        -0.09678,
        129.99248
      ],
      [
        -0.00625,
        130.11773
      ],
      [
        0.13624,
        130.17802
      ],
      [
        0.20395,
        130.327
      ]
    ],
    "neighbors": [
      {
        "glottocode": "waig1244",
        "name": "Ambel",
        "distanceKm": 65.6
      },
      {
        "glottocode": "gebe1237",
        "name": "Gebe",
        "distanceKm": 101.0
      },
      {
        "glottocode": "made1253",
        "name": "Salawati",
        "distanceKm": 112.9
      }
    ]
  },
  {
    "glottocode": "made1253",
    "name": "Salawati",
    "isocode": "xmx",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.05325,
    "longitude": 130.833,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Barat Daya (Pulau Salawati)",
    "family": "Austronesian (SHWNG)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -0.7783,
        130.833
      ],
      [
        -0.74628,
        130.98086
      ],
      [
        -0.86435,
        131.06991
      ],
      [
        -1.00613,
        131.03948
      ],
      [
        -1.11802,
        131.11684
      ],
      [
        -1.19408,
        131.00963
      ],
      [
        -1.2302,
        130.91823
      ],
      [
        -1.35243,
        130.833
      ],
      [
        -1.26355,
        130.73171
      ],
      [
        -1.22231,
        130.62097
      ],
      [
        -1.13388,
        130.47966
      ],
      [
        -0.99027,
        130.55702
      ],
      [
        -0.83612,
        130.56068
      ],
      [
        -0.71293,
        130.66908
      ],
      [
        -0.7783,
        130.833
      ]
    ],
    "neighbors": [
      {
        "glottocode": "sege1235",
        "name": "Seget",
        "distanceKm": 55.4
      },
      {
        "glottocode": "moii1235",
        "name": "Moi (Indonesia)",
        "distanceKm": 77.0
      },
      {
        "glottocode": "kala1256",
        "name": "Kalabra",
        "distanceKm": 96.7
      },
      {
        "glottocode": "waig1244",
        "name": "Ambel",
        "distanceKm": 97.6
      },
      {
        "glottocode": "kawe1240",
        "name": "Kawe",
        "distanceKm": 112.9
      }
    ]
  },
  {
    "glottocode": "matb1237",
    "name": "Matbat",
    "isocode": "xmt",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.8801,
    "longitude": 130.075,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Barat Daya (Pulau Misool)",
    "family": "Austronesian (SHWNG)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -1.55986,
        130.075
      ],
      [
        -1.62199,
        130.19936
      ],
      [
        -1.75817,
        130.22798
      ],
      [
        -1.8176,
        130.349
      ],
      [
        -1.93073,
        130.29696
      ],
      [
        -2.00624,
        130.23326
      ],
      [
        -2.16247,
        130.21105
      ],
      [
        -2.13399,
        130.075
      ],
      [
        -2.13926,
        129.95013
      ],
      [
        -2.11613,
        129.77887
      ],
      [
        -1.94535,
        129.78897
      ],
      [
        -1.80298,
        129.73692
      ],
      [
        -1.64828,
        129.78415
      ],
      [
        -1.6452,
        129.96182
      ],
      [
        -1.55986,
        130.075
      ]
    ],
    "neighbors": [
      {
        "glottocode": "biga1238",
        "name": "Biga",
        "distanceKm": 25.4
      },
      {
        "glottocode": "made1253",
        "name": "Salawati",
        "distanceKm": 124.7
      },
      {
        "glottocode": "lian1255",
        "name": "Liana-Seti",
        "distanceKm": 139.1
      },
      {
        "glottocode": "sege1235",
        "name": "Seget",
        "distanceKm": 139.2
      }
    ]
  },
  {
    "glottocode": "biga1238",
    "name": "Biga",
    "isocode": "bhc",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.99574,
    "longitude": 130.272,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Barat Daya (Misool)",
    "family": "Austronesian (SHWNG)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -1.72343,
        130.272
      ],
      [
        -1.82968,
        130.35202
      ],
      [
        -1.82306,
        130.48867
      ],
      [
        -1.94326,
        130.50206
      ],
      [
        -2.04333,
        130.48064
      ],
      [
        -2.20207,
        130.53089
      ],
      [
        -2.24351,
        130.39139
      ],
      [
        -2.29756,
        130.272
      ],
      [
        -2.34695,
        130.10277
      ],
      [
        -2.18102,
        130.03953
      ],
      [
        -2.07102,
        129.94198
      ],
      [
        -1.91558,
        129.92056
      ],
      [
        -1.84411,
        130.08175
      ],
      [
        -1.72624,
        130.14214
      ],
      [
        -1.72343,
        130.272
      ]
    ],
    "neighbors": [
      {
        "glottocode": "matb1237",
        "name": "Matbat",
        "distanceKm": 25.4
      },
      {
        "glottocode": "made1253",
        "name": "Salawati",
        "distanceKm": 121.9
      },
      {
        "glottocode": "sege1235",
        "name": "Seget",
        "distanceKm": 126.1
      },
      {
        "glottocode": "lian1255",
        "name": "Liana-Seti",
        "distanceKm": 131.5
      }
    ]
  },
  {
    "glottocode": "amba1265",
    "name": "Ambai",
    "isocode": "amk",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.88126,
    "longitude": 136.526,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Kepulauan Yapen Selatan)",
    "family": "Austronesian (SHWNG)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -1.70197,
        136.526
      ],
      [
        -1.62934,
        136.64738
      ],
      [
        -1.72538,
        136.72158
      ],
      [
        -1.8302,
        136.74982
      ],
      [
        -1.95905,
        136.86699
      ],
      [
        -2.06483,
        136.75631
      ],
      [
        -2.16206,
        136.6613
      ],
      [
        -2.27609,
        136.526
      ],
      [
        -2.14661,
        136.39815
      ],
      [
        -2.08334,
        136.27246
      ],
      [
        -1.95796,
        136.18979
      ],
      [
        -1.83129,
        136.30696
      ],
      [
        -1.70686,
        136.3072
      ],
      [
        -1.64479,
        136.41206
      ],
      [
        -1.70197,
        136.526
      ]
    ],
    "neighbors": [
      {
        "glottocode": "nucl1454",
        "name": "Yawa",
        "distanceKm": 31.7
      },
      {
        "glottocode": "waro1242",
        "name": "Waropen",
        "distanceKm": 49.3
      },
      {
        "glottocode": "kuru1305",
        "name": "Kurudu",
        "distanceKm": 54.8
      },
      {
        "glottocode": "busa1254",
        "name": "Busami",
        "distanceKm": 57.2
      },
      {
        "glottocode": "mung1269",
        "name": "Munggui",
        "distanceKm": 71.6
      }
    ]
  },
  {
    "glottocode": "ansu1237",
    "name": "Ansus",
    "isocode": "and",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.7543,
    "longitude": 135.866,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Pulau Yapen Barat)",
    "family": "Austronesian (SHWNG)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -1.46595,
        135.866
      ],
      [
        -1.51225,
        135.98262
      ],
      [
        -1.60032,
        136.05918
      ],
      [
        -1.67263,
        136.22397
      ],
      [
        -1.82329,
        136.1684
      ],
      [
        -1.95114,
        136.11295
      ],
      [
        -2.10846,
        136.03664
      ],
      [
        -2.04008,
        135.866
      ],
      [
        -2.02952,
        135.7334
      ],
      [
        -1.95828,
        135.6101
      ],
      [
        -1.80039,
        135.66398
      ],
      [
        -1.69553,
        135.6084
      ],
      [
        -1.59318,
        135.66387
      ],
      [
        -1.59119,
        135.78741
      ],
      [
        -1.46595,
        135.866
      ]
    ],
    "neighbors": [
      {
        "glottocode": "mung1269",
        "name": "Munggui",
        "distanceKm": 11.2
      },
      {
        "glottocode": "maru1247",
        "name": "Marau",
        "distanceKm": 12.3
      },
      {
        "glottocode": "busa1254",
        "name": "Busami",
        "distanceKm": 18.6
      },
      {
        "glottocode": "pomm1237",
        "name": "Pom",
        "distanceKm": 30.1
      },
      {
        "glottocode": "nucl1454",
        "name": "Yawa",
        "distanceKm": 44.2
      }
    ]
  },
  {
    "glottocode": "busa1254",
    "name": "Busami",
    "isocode": "bsm",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.73681,
    "longitude": 136.032,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Pulau Yapen Utara)",
    "family": "Austronesian (SHWNG)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -1.44704,
        136.032
      ],
      [
        -1.49885,
        136.14665
      ],
      [
        -1.49924,
        136.33004
      ],
      [
        -1.66556,
        136.3443
      ],
      [
        -1.80651,
        136.3375
      ],
      [
        -1.97676,
        136.33303
      ],
      [
        -1.98206,
        136.15016
      ],
      [
        -2.02117,
        136.032
      ],
      [
        -2.01612,
        135.89743
      ],
      [
        -1.8572,
        135.88096
      ],
      [
        -1.79332,
        135.78431
      ],
      [
        -1.67875,
        135.77751
      ],
      [
        -1.6188,
        135.88395
      ],
      [
        -1.46479,
        135.90094
      ],
      [
        -1.44704,
        136.032
      ]
    ],
    "neighbors": [
      {
        "glottocode": "mung1269",
        "name": "Munggui",
        "distanceKm": 14.8
      },
      {
        "glottocode": "ansu1237",
        "name": "Ansus",
        "distanceKm": 18.6
      },
      {
        "glottocode": "nucl1454",
        "name": "Yawa",
        "distanceKm": 26.0
      },
      {
        "glottocode": "maru1247",
        "name": "Marau",
        "distanceKm": 27.2
      },
      {
        "glottocode": "pomm1237",
        "name": "Pom",
        "distanceKm": 47.1
      }
    ]
  },
  {
    "glottocode": "mung1269",
    "name": "Munggui",
    "isocode": "mth",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.66773,
    "longitude": 135.918,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Yapen Utara)",
    "family": "Austronesian (SHWNG)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -1.38911,
        135.918
      ],
      [
        -1.31648,
        136.08722
      ],
      [
        -1.46577,
        136.17135
      ],
      [
        -1.60003,
        136.21472
      ],
      [
        -1.75032,
        136.28002
      ],
      [
        -1.82712,
        136.11795
      ],
      [
        -1.90475,
        136.03219
      ],
      [
        -1.96324,
        135.918
      ],
      [
        -1.83375,
        135.83801
      ],
      [
        -1.82373,
        135.72229
      ],
      [
        -1.72779,
        135.65475
      ],
      [
        -1.62257,
        135.72005
      ],
      [
        -1.46916,
        135.66889
      ],
      [
        -1.38748,
        135.78298
      ],
      [
        -1.38911,
        135.918
      ]
    ],
    "neighbors": [
      {
        "glottocode": "ansu1237",
        "name": "Ansus",
        "distanceKm": 11.2
      },
      {
        "glottocode": "maru1247",
        "name": "Marau",
        "distanceKm": 13.4
      },
      {
        "glottocode": "busa1254",
        "name": "Busami",
        "distanceKm": 14.8
      },
      {
        "glottocode": "pomm1237",
        "name": "Pom",
        "distanceKm": 33.4
      },
      {
        "glottocode": "nucl1454",
        "name": "Yawa",
        "distanceKm": 40.1
      }
    ]
  },
  {
    "glottocode": "maru1247",
    "name": "Marau",
    "isocode": "mvr",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.66738,
    "longitude": 135.797,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Yapen)",
    "family": "Austronesian (SHWNG)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -1.27507,
        135.797
      ],
      [
        -1.37813,
        135.93635
      ],
      [
        -1.48683,
        136.0235
      ],
      [
        -1.58866,
        136.14204
      ],
      [
        -1.72041,
        136.02944
      ],
      [
        -1.81945,
        135.98778
      ],
      [
        -1.92467,
        135.92096
      ],
      [
        -1.8492,
        135.797
      ],
      [
        -1.8954,
        135.68714
      ],
      [
        -1.84479,
        135.57444
      ],
      [
        -1.71641,
        135.58207
      ],
      [
        -1.59265,
        135.46947
      ],
      [
        -1.46149,
        135.53872
      ],
      [
        -1.4074,
        135.67175
      ],
      [
        -1.27507,
        135.797
      ]
    ],
    "neighbors": [
      {
        "glottocode": "ansu1237",
        "name": "Ansus",
        "distanceKm": 12.3
      },
      {
        "glottocode": "mung1269",
        "name": "Munggui",
        "distanceKm": 13.4
      },
      {
        "glottocode": "pomm1237",
        "name": "Pom",
        "distanceKm": 20.0
      },
      {
        "glottocode": "busa1254",
        "name": "Busami",
        "distanceKm": 27.2
      },
      {
        "glottocode": "woii1237",
        "name": "Woi",
        "distanceKm": 35.1
      }
    ]
  },
  {
    "glottocode": "pomm1237",
    "name": "Pom",
    "isocode": "pmo",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.64224,
    "longitude": 135.619,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Yapen Barat)",
    "family": "Austronesian (SHWNG)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -1.33006,
        135.619
      ],
      [
        -1.39821,
        135.73657
      ],
      [
        -1.43351,
        135.88084
      ],
      [
        -1.59272,
        135.83606
      ],
      [
        -1.69318,
        135.84228
      ],
      [
        -1.81779,
        135.83922
      ],
      [
        -1.80994,
        135.69979
      ],
      [
        -1.90419,
        135.619
      ],
      [
        -1.91548,
        135.48736
      ],
      [
        -1.79147,
        135.43179
      ],
      [
        -1.72047,
        135.27609
      ],
      [
        -1.56543,
        135.28232
      ],
      [
        -1.45982,
        135.39016
      ],
      [
        -1.29267,
        135.45059
      ],
      [
        -1.33006,
        135.619
      ]
    ],
    "neighbors": [
      {
        "glottocode": "woii1237",
        "name": "Woi",
        "distanceKm": 15.1
      },
      {
        "glottocode": "maru1247",
        "name": "Marau",
        "distanceKm": 20.0
      },
      {
        "glottocode": "ansu1237",
        "name": "Ansus",
        "distanceKm": 30.1
      },
      {
        "glottocode": "mung1269",
        "name": "Munggui",
        "distanceKm": 33.4
      },
      {
        "glottocode": "busa1254",
        "name": "Busami",
        "distanceKm": 47.1
      }
    ]
  },
  {
    "glottocode": "woii1237",
    "name": "Woi",
    "isocode": "wbw",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.62746,
    "longitude": 135.484,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Yapen Barat)",
    "family": "Austronesian (SHWNG)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -1.37738,
        135.484
      ],
      [
        -1.34228,
        135.62139
      ],
      [
        -1.49622,
        135.64863
      ],
      [
        -1.57858,
        135.69826
      ],
      [
        -1.69068,
        135.76108
      ],
      [
        -1.75017,
        135.63794
      ],
      [
        -1.87561,
        135.60355
      ],
      [
        -1.9515,
        135.484
      ],
      [
        -1.85955,
        135.37218
      ],
      [
        -1.85419,
        135.19958
      ],
      [
        -1.70633,
        135.1383
      ],
      [
        -1.56292,
        135.20112
      ],
      [
        -1.39221,
        135.18889
      ],
      [
        -1.35834,
        135.35435
      ],
      [
        -1.37738,
        135.484
      ]
    ],
    "neighbors": [
      {
        "glottocode": "pomm1237",
        "name": "Pom",
        "distanceKm": 15.1
      },
      {
        "glottocode": "maru1247",
        "name": "Marau",
        "distanceKm": 35.1
      },
      {
        "glottocode": "ansu1237",
        "name": "Ansus",
        "distanceKm": 44.7
      },
      {
        "glottocode": "mung1269",
        "name": "Munggui",
        "distanceKm": 48.4
      },
      {
        "glottocode": "busa1254",
        "name": "Busami",
        "distanceKm": 62.1
      }
    ]
  },
  {
    "glottocode": "kuru1305",
    "name": "Kurudu",
    "isocode": "kjr",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.8444,
    "longitude": 137.018,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Pulau Kurudu)",
    "family": "Austronesian (SHWNG)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -1.54316,
        137.018
      ],
      [
        -1.66075,
        137.10649
      ],
      [
        -1.70909,
        137.18776
      ],
      [
        -1.77921,
        137.30379
      ],
      [
        -1.89173,
        137.22545
      ],
      [
        -2.02621,
        137.2461
      ],
      [
        -2.15483,
        137.16757
      ],
      [
        -2.11729,
        137.018
      ],
      [
        -2.17802,
        136.85725
      ],
      [
        -2.06706,
        136.73865
      ],
      [
        -1.90696,
        136.74376
      ],
      [
        -1.76397,
        136.66543
      ],
      [
        -1.66825,
        136.797
      ],
      [
        -1.63755,
        136.91834
      ],
      [
        -1.54316,
        137.018
      ]
    ],
    "neighbors": [
      {
        "glottocode": "amba1265",
        "name": "Ambai",
        "distanceKm": 54.8
      },
      {
        "glottocode": "waro1242",
        "name": "Waropen",
        "distanceKm": 67.3
      },
      {
        "glottocode": "nucl1454",
        "name": "Yawa",
        "distanceKm": 84.3
      },
      {
        "glottocode": "bauz1241",
        "name": "Bauzi",
        "distanceKm": 95.4
      },
      {
        "glottocode": "busa1254",
        "name": "Busami",
        "distanceKm": 110.2
      }
    ]
  },
  {
    "glottocode": "nucl1454",
    "name": "Yawa",
    "isocode": "yva",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.77196,
    "longitude": 136.263,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Yapen Tengah)",
    "family": "Yawa (Papuan)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -1.56833,
        136.263
      ],
      [
        -1.57288,
        136.35892
      ],
      [
        -1.58038,
        136.50335
      ],
      [
        -1.72035,
        136.48922
      ],
      [
        -1.84054,
        136.56363
      ],
      [
        -1.99797,
        136.54654
      ],
      [
        -2.02724,
        136.386
      ],
      [
        -2.14246,
        136.263
      ],
      [
        -2.09015,
        136.1097
      ],
      [
        -1.93834,
        136.05426
      ],
      [
        -1.84811,
        135.92922
      ],
      [
        -1.71279,
        136.00362
      ],
      [
        -1.64001,
        136.09746
      ],
      [
        -1.50997,
        136.13677
      ],
      [
        -1.56833,
        136.263
      ]
    ],
    "neighbors": [
      {
        "glottocode": "busa1254",
        "name": "Busami",
        "distanceKm": 26.0
      },
      {
        "glottocode": "amba1265",
        "name": "Ambai",
        "distanceKm": 31.7
      },
      {
        "glottocode": "mung1269",
        "name": "Munggui",
        "distanceKm": 40.1
      },
      {
        "glottocode": "ansu1237",
        "name": "Ansus",
        "distanceKm": 44.2
      },
      {
        "glottocode": "maru1247",
        "name": "Marau",
        "distanceKm": 53.1
      }
    ]
  },
  {
    "glottocode": "waro1242",
    "name": "Waropen",
    "isocode": "wrp",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.31142,
    "longitude": 136.633,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Waropen)",
    "family": "Austronesian (SHWNG)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -2.08063,
        136.633
      ],
      [
        -2.01833,
        136.77426
      ],
      [
        -2.15407,
        136.83047
      ],
      [
        -2.23956,
        136.9481
      ],
      [
        -2.39507,
        136.99977
      ],
      [
        -2.49082,
        136.85814
      ],
      [
        -2.63935,
        136.79105
      ],
      [
        -2.65476,
        136.633
      ],
      [
        -2.5356,
        136.52495
      ],
      [
        -2.51203,
        136.38124
      ],
      [
        -2.36732,
        136.38791
      ],
      [
        -2.26731,
        136.43959
      ],
      [
        -2.13286,
        136.40891
      ],
      [
        -2.12208,
        136.54175
      ],
      [
        -2.08063,
        136.633
      ]
    ],
    "neighbors": [
      {
        "glottocode": "amba1265",
        "name": "Ambai",
        "distanceKm": 49.3
      },
      {
        "glottocode": "kuru1305",
        "name": "Kurudu",
        "distanceKm": 67.3
      },
      {
        "glottocode": "nucl1454",
        "name": "Yawa",
        "distanceKm": 72.7
      },
      {
        "glottocode": "busa1254",
        "name": "Busami",
        "distanceKm": 92.4
      },
      {
        "glottocode": "fayu1238",
        "name": "Fayu",
        "distanceKm": 96.3
      }
    ]
  },
  {
    "glottocode": "bauz1241",
    "name": "Bauzi",
    "isocode": "bvz",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.44717,
    "longitude": 137.629,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Mamberamo Raya)",
    "family": "Geelvink Bay (Papuan)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -2.10221,
        137.629
      ],
      [
        -2.20241,
        137.74698
      ],
      [
        -2.23911,
        137.89013
      ],
      [
        -2.36187,
        138.00306
      ],
      [
        -2.51071,
        137.90765
      ],
      [
        -2.66619,
        137.9039
      ],
      [
        -2.7437,
        137.77193
      ],
      [
        -2.67633,
        137.629
      ],
      [
        -2.71968,
        137.49764
      ],
      [
        -2.59707,
        137.44085
      ],
      [
        -2.48963,
        137.44282
      ],
      [
        -2.38296,
        137.34741
      ],
      [
        -2.30823,
        137.45462
      ],
      [
        -2.22643,
        137.5226
      ],
      [
        -2.10221,
        137.629
      ]
    ],
    "neighbors": [
      {
        "glottocode": "erit1239",
        "name": "Eritai",
        "distanceKm": 55.5
      },
      {
        "glottocode": "obok1239",
        "name": "Obokuitai",
        "distanceKm": 58.3
      },
      {
        "glottocode": "iauu1242",
        "name": "Iau",
        "distanceKm": 77.9
      },
      {
        "glottocode": "sika1263",
        "name": "Sikaritai",
        "distanceKm": 83.1
      },
      {
        "glottocode": "kwer1263",
        "name": "Kwerba Mamberamo",
        "distanceKm": 90.6
      }
    ]
  },
  {
    "glottocode": "duvl1242",
    "name": "Duvle",
    "isocode": "duv",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.21832,
    "longitude": 137.964,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Lembah Rouffaer / Tariku)",
    "family": "Lakes Plain",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -2.9307,
        137.964
      ],
      [
        -2.91299,
        138.11127
      ],
      [
        -2.97886,
        138.26475
      ],
      [
        -3.15665,
        138.23461
      ],
      [
        -3.29258,
        138.28987
      ],
      [
        -3.41317,
        138.20871
      ],
      [
        -3.4077,
        138.05534
      ],
      [
        -3.50483,
        137.964
      ],
      [
        -3.43026,
        137.86177
      ],
      [
        -3.33682,
        137.81517
      ],
      [
        -3.28441,
        137.674
      ],
      [
        -3.16482,
        137.72925
      ],
      [
        -3.0552,
        137.75913
      ],
      [
        -2.89043,
        137.80585
      ],
      [
        -2.9307,
        137.964
      ]
    ],
    "neighbors": [
      {
        "glottocode": "iauu1242",
        "name": "Iau",
        "distanceKm": 31.5
      },
      {
        "glottocode": "obok1239",
        "name": "Obokuitai",
        "distanceKm": 37.8
      },
      {
        "glottocode": "wano1243",
        "name": "Wano",
        "distanceKm": 43.0
      },
      {
        "glottocode": "erit1239",
        "name": "Eritai",
        "distanceKm": 57.2
      },
      {
        "glottocode": "sika1263",
        "name": "Sikaritai",
        "distanceKm": 58.5
      }
    ]
  },
  {
    "glottocode": "fayu1238",
    "name": "Fayu",
    "isocode": "fau",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.14497,
    "longitude": 136.867,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Mamberamo / Waropen)",
    "family": "Lakes Plain",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -2.80737,
        136.867
      ],
      [
        -2.80423,
        137.03134
      ],
      [
        -2.98065,
        137.07337
      ],
      [
        -3.07529,
        137.17277
      ],
      [
        -3.21079,
        137.1558
      ],
      [
        -3.26603,
        137.01904
      ],
      [
        -3.39332,
        136.98678
      ],
      [
        -3.3815,
        136.867
      ],
      [
        -3.3215,
        136.78186
      ],
      [
        -3.33861,
        136.62382
      ],
      [
        -3.20304,
        136.61219
      ],
      [
        -3.08303,
        136.59523
      ],
      [
        -2.90807,
        136.56949
      ],
      [
        -2.87605,
        136.7373
      ],
      [
        -2.80737,
        136.867
      ]
    ],
    "neighbors": [
      {
        "glottocode": "moni1261",
        "name": "Moni",
        "distanceKm": 65.0
      },
      {
        "glottocode": "iauu1242",
        "name": "Iau",
        "distanceKm": 91.4
      },
      {
        "glottocode": "auye1238",
        "name": "Auye",
        "distanceKm": 91.5
      },
      {
        "glottocode": "waro1242",
        "name": "Waropen",
        "distanceKm": 96.3
      },
      {
        "glottocode": "wano1243",
        "name": "Wano",
        "distanceKm": 97.4
      }
    ]
  },
  {
    "glottocode": "iauu1242",
    "name": "Iau",
    "isocode": "tmu",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.14537,
    "longitude": 137.69,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Lembah Tariku)",
    "family": "Lakes Plain",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -2.77876,
        137.69
      ],
      [
        -2.92323,
        137.79714
      ],
      [
        -2.96341,
        137.91852
      ],
      [
        -3.08279,
        137.96461
      ],
      [
        -3.18609,
        137.86867
      ],
      [
        -3.31435,
        137.90222
      ],
      [
        -3.36561,
        137.79622
      ],
      [
        -3.35289,
        137.69
      ],
      [
        -3.4405,
        137.54766
      ],
      [
        -3.32137,
        137.46897
      ],
      [
        -3.21054,
        137.40403
      ],
      [
        -3.05833,
        137.3081
      ],
      [
        -2.95639,
        137.45267
      ],
      [
        -2.84834,
        137.54674
      ],
      [
        -2.77876,
        137.69
      ]
    ],
    "neighbors": [
      {
        "glottocode": "duvl1242",
        "name": "Duvle",
        "distanceKm": 31.5
      },
      {
        "glottocode": "wano1243",
        "name": "Wano",
        "distanceKm": 37.1
      },
      {
        "glottocode": "obok1239",
        "name": "Obokuitai",
        "distanceKm": 39.3
      },
      {
        "glottocode": "erit1239",
        "name": "Eritai",
        "distanceKm": 62.8
      },
      {
        "glottocode": "demm1245",
        "name": "Dem",
        "distanceKm": 64.4
      }
    ]
  },
  {
    "glottocode": "obok1239",
    "name": "Obokuitai",
    "isocode": "afz",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.88029,
    "longitude": 137.924,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Mamberamo)",
    "family": "Lakes Plain",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -2.65198,
        137.924
      ],
      [
        -2.63512,
        138.04222
      ],
      [
        -2.71138,
        138.13608
      ],
      [
        -2.84068,
        138.09775
      ],
      [
        -2.94104,
        138.1905
      ],
      [
        -3.04135,
        138.12621
      ],
      [
        -3.08143,
        138.02099
      ],
      [
        -3.22611,
        137.924
      ],
      [
        -3.15239,
        137.7928
      ],
      [
        -3.06934,
        137.68664
      ],
      [
        -2.96844,
        137.53731
      ],
      [
        -2.81328,
        137.63006
      ],
      [
        -2.68338,
        137.67677
      ],
      [
        -2.56416,
        137.77157
      ],
      [
        -2.65198,
        137.924
      ]
    ],
    "neighbors": [
      {
        "glottocode": "erit1239",
        "name": "Eritai",
        "distanceKm": 23.6
      },
      {
        "glottocode": "duvl1242",
        "name": "Duvle",
        "distanceKm": 37.8
      },
      {
        "glottocode": "iauu1242",
        "name": "Iau",
        "distanceKm": 39.3
      },
      {
        "glottocode": "sika1263",
        "name": "Sikaritai",
        "distanceKm": 41.2
      },
      {
        "glottocode": "bauz1241",
        "name": "Bauzi",
        "distanceKm": 58.3
      }
    ]
  },
  {
    "glottocode": "erit1239",
    "name": "Eritai",
    "isocode": "ert",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.71182,
    "longitude": 138.053,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Mamberamo)",
    "family": "Lakes Plain",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -2.45572,
        138.053
      ],
      [
        -2.47189,
        138.16867
      ],
      [
        -2.59974,
        138.1937
      ],
      [
        -2.64926,
        138.32739
      ],
      [
        -2.77339,
        138.32308
      ],
      [
        -2.86212,
        138.24168
      ],
      [
        -3.03887,
        138.21067
      ],
      [
        -3.02985,
        138.053
      ],
      [
        -2.98916,
        137.91929
      ],
      [
        -2.95771,
        137.74432
      ],
      [
        -2.77702,
        137.76703
      ],
      [
        -2.64564,
        137.76272
      ],
      [
        -2.50416,
        137.79231
      ],
      [
        -2.5216,
        137.96129
      ],
      [
        -2.45572,
        138.053
      ]
    ],
    "neighbors": [
      {
        "glottocode": "obok1239",
        "name": "Obokuitai",
        "distanceKm": 23.6
      },
      {
        "glottocode": "sika1263",
        "name": "Sikaritai",
        "distanceKm": 27.9
      },
      {
        "glottocode": "kwer1263",
        "name": "Kwerba Mamberamo",
        "distanceKm": 45.6
      },
      {
        "glottocode": "bauz1241",
        "name": "Bauzi",
        "distanceKm": 55.5
      },
      {
        "glottocode": "duvl1242",
        "name": "Duvle",
        "distanceKm": 57.2
      }
    ]
  },
  {
    "glottocode": "sika1263",
    "name": "Sikaritai",
    "isocode": "tty",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.80285,
    "longitude": 138.287,
    "isNational": true,
    "isFromCsv": false,
    "island": "Nusa Tenggara",
    "province": "Papua (Mamberamo)",
    "family": "Lakes Plain",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -2.60523,
        138.287
      ],
      [
        -2.67801,
        138.34719
      ],
      [
        -2.66769,
        138.45668
      ],
      [
        -2.75404,
        138.5011
      ],
      [
        -2.84526,
        138.47302
      ],
      [
        -2.976,
        138.50438
      ],
      [
        -3.02103,
        138.3922
      ],
      [
        -3.02827,
        138.287
      ],
      [
        -3.05915,
        138.16342
      ],
      [
        -2.93145,
        138.12554
      ],
      [
        -2.84818,
        138.08818
      ],
      [
        -2.75112,
        138.06009
      ],
      [
        -2.71223,
        138.17323
      ],
      [
        -2.63989,
        138.20843
      ],
      [
        -2.60523,
        138.287
      ]
    ],
    "neighbors": [
      {
        "glottocode": "erit1239",
        "name": "Eritai",
        "distanceKm": 27.9
      },
      {
        "glottocode": "kwer1263",
        "name": "Kwerba Mamberamo",
        "distanceKm": 31.2
      },
      {
        "glottocode": "obok1239",
        "name": "Obokuitai",
        "distanceKm": 41.2
      },
      {
        "glottocode": "duvl1242",
        "name": "Duvle",
        "distanceKm": 58.5
      },
      {
        "glottocode": "abin1243",
        "name": "Abinomn",
        "distanceKm": 68.4
      }
    ]
  },
  {
    "glottocode": "kwer1263",
    "name": "Kwerba Mamberamo",
    "isocode": "xwr",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.56457,
    "longitude": 138.436,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Mamberamo)",
    "family": "Tor-Kwerba",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -2.3627,
        138.436
      ],
      [
        -2.28493,
        138.5708
      ],
      [
        -2.3657,
        138.68562
      ],
      [
        -2.50366,
        138.70312
      ],
      [
        -2.65039,
        138.81238
      ],
      [
        -2.77211,
        138.69651
      ],
      [
        -2.83264,
        138.56523
      ],
      [
        -2.93683,
        138.436
      ],
      [
        -2.8022,
        138.32145
      ],
      [
        -2.72367,
        138.2363
      ],
      [
        -2.63142,
        138.14282
      ],
      [
        -2.52263,
        138.25208
      ],
      [
        -2.41415,
        138.24719
      ],
      [
        -2.31537,
        138.31587
      ],
      [
        -2.3627,
        138.436
      ]
    ],
    "neighbors": [
      {
        "glottocode": "sika1263",
        "name": "Sikaritai",
        "distanceKm": 31.2
      },
      {
        "glottocode": "nucl1595",
        "name": "Kwerba",
        "distanceKm": 39.4
      },
      {
        "glottocode": "erit1239",
        "name": "Eritai",
        "distanceKm": 45.6
      },
      {
        "glottocode": "beri1254",
        "name": "Berik",
        "distanceKm": 58.0
      },
      {
        "glottocode": "abin1243",
        "name": "Abinomn",
        "distanceKm": 64.3
      }
    ]
  },
  {
    "glottocode": "nucl1595",
    "name": "Kwerba",
    "isocode": "kwe",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.2137,
    "longitude": 138.486,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Sarmi)",
    "family": "Tor-Kwerba",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -1.88623,
        138.486
      ],
      [
        -1.90899,
        138.63285
      ],
      [
        -2.03643,
        138.70846
      ],
      [
        -2.12733,
        138.86469
      ],
      [
        -2.28723,
        138.80841
      ],
      [
        -2.39042,
        138.70777
      ],
      [
        -2.53319,
        138.63997
      ],
      [
        -2.46036,
        138.486
      ],
      [
        -2.42626,
        138.38356
      ],
      [
        -2.39439,
        138.25925
      ],
      [
        -2.25509,
        138.30454
      ],
      [
        -2.15948,
        138.24826
      ],
      [
        -2.03246,
        138.25856
      ],
      [
        -2.01591,
        138.39068
      ],
      [
        -1.88623,
        138.486
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kwer1263",
        "name": "Kwerba Mamberamo",
        "distanceKm": 39.4
      },
      {
        "glottocode": "beri1254",
        "name": "Berik",
        "distanceKm": 42.7
      },
      {
        "glottocode": "sobe1238",
        "name": "Sobei",
        "distanceKm": 48.2
      },
      {
        "glottocode": "sika1263",
        "name": "Sikaritai",
        "distanceKm": 69.1
      },
      {
        "glottocode": "dabe1239",
        "name": "Dabe",
        "distanceKm": 72.3
      }
    ]
  },
  {
    "glottocode": "beri1254",
    "name": "Berik",
    "isocode": "bkl",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.26904,
    "longitude": 138.866,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Tor River, Sarmi)",
    "family": "Tor-Kwerba",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -1.91568,
        138.866
      ],
      [
        -2.00859,
        138.99152
      ],
      [
        -2.02972,
        139.16633
      ],
      [
        -2.19739,
        139.18015
      ],
      [
        -2.32804,
        139.12472
      ],
      [
        -2.47805,
        139.1283
      ],
      [
        -2.47715,
        138.9663
      ],
      [
        -2.48981,
        138.866
      ],
      [
        -2.52586,
        138.74222
      ],
      [
        -2.38768,
        138.71711
      ],
      [
        -2.32515,
        138.61998
      ],
      [
        -2.20029,
        138.56454
      ],
      [
        -2.12009,
        138.67907
      ],
      [
        -1.95988,
        138.717
      ],
      [
        -1.91568,
        138.866
      ]
    ],
    "neighbors": [
      {
        "glottocode": "dabe1239",
        "name": "Dabe",
        "distanceKm": 36.9
      },
      {
        "glottocode": "nucl1595",
        "name": "Kwerba",
        "distanceKm": 42.7
      },
      {
        "glottocode": "beta1253",
        "name": "Betaf",
        "distanceKm": 46.1
      },
      {
        "glottocode": "sobe1238",
        "name": "Sobei",
        "distanceKm": 46.2
      },
      {
        "glottocode": "kwer1263",
        "name": "Kwerba Mamberamo",
        "distanceKm": 58.0
      }
    ]
  },
  {
    "glottocode": "dabe1239",
    "name": "Dabe",
    "isocode": "dbe",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.05082,
    "longitude": 139.116,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Sarmi)",
    "family": "Tor-Kwerba",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -1.76352,
        139.116
      ],
      [
        -1.71463,
        139.27801
      ],
      [
        -1.85831,
        139.35756
      ],
      [
        -1.99636,
        139.35474
      ],
      [
        -2.12124,
        139.42473
      ],
      [
        -2.18729,
        139.28724
      ],
      [
        -2.24119,
        139.20774
      ],
      [
        -2.33765,
        139.116
      ],
      [
        -2.2319,
        139.02874
      ],
      [
        -2.21627,
        138.9084
      ],
      [
        -2.12412,
        138.79465
      ],
      [
        -1.99349,
        138.86464
      ],
      [
        -1.82933,
        138.83808
      ],
      [
        -1.72392,
        138.95847
      ],
      [
        -1.76352,
        139.116
      ]
    ],
    "neighbors": [
      {
        "glottocode": "beta1253",
        "name": "Betaf",
        "distanceKm": 17.5
      },
      {
        "glottocode": "beri1254",
        "name": "Berik",
        "distanceKm": 36.9
      },
      {
        "glottocode": "sobe1238",
        "name": "Sobei",
        "distanceKm": 45.4
      },
      {
        "glottocode": "bong1287",
        "name": "Bonggo",
        "distanceKm": 57.1
      },
      {
        "glottocode": "nucl1595",
        "name": "Kwerba",
        "distanceKm": 72.3
      }
    ]
  },
  {
    "glottocode": "beta1253",
    "name": "Betaf",
    "isocode": "bfe",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.12422,
    "longitude": 139.255,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Sarmi)",
    "family": "Tor-Kwerba",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -1.76703,
        139.255
      ],
      [
        -1.86049,
        139.38209
      ],
      [
        -1.98428,
        139.43059
      ],
      [
        -2.05734,
        139.54823
      ],
      [
        -2.17142,
        139.46192
      ],
      [
        -2.25414,
        139.41803
      ],
      [
        -2.39,
        139.38308
      ],
      [
        -2.34115,
        139.255
      ],
      [
        -2.37776,
        139.13282
      ],
      [
        -2.34225,
        138.98142
      ],
      [
        -2.18509,
        138.98811
      ],
      [
        -2.04366,
        138.9018
      ],
      [
        -1.89618,
        138.96885
      ],
      [
        -1.87273,
        139.13381
      ],
      [
        -1.76703,
        139.255
      ]
    ],
    "neighbors": [
      {
        "glottocode": "dabe1239",
        "name": "Dabe",
        "distanceKm": 17.5
      },
      {
        "glottocode": "bong1287",
        "name": "Bonggo",
        "distanceKm": 39.7
      },
      {
        "glottocode": "beri1254",
        "name": "Berik",
        "distanceKm": 46.1
      },
      {
        "glottocode": "sobe1238",
        "name": "Sobei",
        "distanceKm": 62.8
      },
      {
        "glottocode": "nucl1595",
        "name": "Kwerba",
        "distanceKm": 86.0
      }
    ]
  },
  {
    "glottocode": "sobe1238",
    "name": "Sobei",
    "isocode": "sob",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -1.86998,
    "longitude": 138.75,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Sarmi)",
    "family": "Austronesian (Oceanic)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -1.59389,
        138.75
      ],
      [
        -1.68384,
        138.83969
      ],
      [
        -1.68955,
        138.97637
      ],
      [
        -1.82287,
        138.95651
      ],
      [
        -1.91718,
        138.95692
      ],
      [
        -2.0624,
        138.99142
      ],
      [
        -2.08295,
        138.85262
      ],
      [
        -2.16801,
        138.75
      ],
      [
        -2.20111,
        138.59045
      ],
      [
        -2.04751,
        138.52726
      ],
      [
        -1.95063,
        138.39648
      ],
      [
        -1.78943,
        138.39689
      ],
      [
        -1.70444,
        138.54231
      ],
      [
        -1.56568,
        138.60338
      ],
      [
        -1.59389,
        138.75
      ]
    ],
    "neighbors": [
      {
        "glottocode": "dabe1239",
        "name": "Dabe",
        "distanceKm": 45.4
      },
      {
        "glottocode": "beri1254",
        "name": "Berik",
        "distanceKm": 46.2
      },
      {
        "glottocode": "nucl1595",
        "name": "Kwerba",
        "distanceKm": 48.2
      },
      {
        "glottocode": "beta1253",
        "name": "Betaf",
        "distanceKm": 62.8
      },
      {
        "glottocode": "kwer1263",
        "name": "Kwerba Mamberamo",
        "distanceKm": 84.7
      }
    ]
  },
  {
    "glottocode": "bong1287",
    "name": "Bonggo",
    "isocode": "bpg",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.28044,
    "longitude": 139.576,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Sarmi)",
    "family": "Austronesian (Oceanic)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -2.08724,
        139.576
      ],
      [
        -2.02436,
        139.69942
      ],
      [
        -2.1445,
        139.74659
      ],
      [
        -2.23108,
        139.79243
      ],
      [
        -2.353,
        139.89417
      ],
      [
        -2.44076,
        139.77719
      ],
      [
        -2.56238,
        139.71188
      ],
      [
        -2.66136,
        139.576
      ],
      [
        -2.54163,
        139.45012
      ],
      [
        -2.50247,
        139.29737
      ],
      [
        -2.35883,
        139.23226
      ],
      [
        -2.22525,
        139.334
      ],
      [
        -2.0828,
        139.32797
      ],
      [
        -2.04511,
        139.46258
      ],
      [
        -2.08724,
        139.576
      ]
    ],
    "neighbors": [
      {
        "glottocode": "beta1253",
        "name": "Betaf",
        "distanceKm": 39.7
      },
      {
        "glottocode": "dabe1239",
        "name": "Dabe",
        "distanceKm": 57.1
      },
      {
        "glottocode": "tarp1240",
        "name": "Tarpia",
        "distanceKm": 60.1
      },
      {
        "glottocode": "demt1241",
        "name": "Demta",
        "distanceKm": 66.6
      },
      {
        "glottocode": "nucl1633",
        "name": "Nimboran",
        "distanceKm": 74.8
      }
    ]
  },
  {
    "glottocode": "tarp1240",
    "name": "Tarpia",
    "isocode": "tpf",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.322279,
    "longitude": 140.115497,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Demta)",
    "family": "Austronesian (Oceanic)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -2.03664,
        140.1155
      ],
      [
        -2.11456,
        140.21561
      ],
      [
        -2.17511,
        140.30019
      ],
      [
        -2.24544,
        140.45244
      ],
      [
        -2.38389,
        140.38563
      ],
      [
        -2.52428,
        140.369
      ],
      [
        -2.67221,
        140.28415
      ],
      [
        -2.61076,
        140.1155
      ],
      [
        -2.63183,
        139.9663
      ],
      [
        -2.53308,
        139.85095
      ],
      [
        -2.37319,
        139.89225
      ],
      [
        -2.25613,
        139.82544
      ],
      [
        -2.16631,
        139.91976
      ],
      [
        -2.15494,
        140.03484
      ],
      [
        -2.03664,
        140.1155
      ]
    ],
    "neighbors": [
      {
        "glottocode": "demt1241",
        "name": "Demta",
        "distanceKm": 8.9
      },
      {
        "glottocode": "nucl1633",
        "name": "Nimboran",
        "distanceKm": 29.5
      },
      {
        "glottocode": "tabl1243",
        "name": "Tabla",
        "distanceKm": 34.4
      },
      {
        "glottocode": "kemt1242",
        "name": "Kemtuik",
        "distanceKm": 46.2
      },
      {
        "glottocode": "gres1240",
        "name": "Gresi",
        "distanceKm": 48.0
      }
    ]
  },
  {
    "glottocode": "demt1241",
    "name": "Demta",
    "isocode": "dmy",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.38475,
    "longitude": 140.166,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Jayapura)",
    "family": "Trans-New Guinea",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -2.13671,
        140.166
      ],
      [
        -2.157,
        140.27577
      ],
      [
        -2.1578,
        140.45083
      ],
      [
        -2.31947,
        140.45224
      ],
      [
        -2.45808,
        140.48757
      ],
      [
        -2.6274,
        140.47053
      ],
      [
        -2.63773,
        140.28793
      ],
      [
        -2.71084,
        140.166
      ],
      [
        -2.67427,
        140.02645
      ],
      [
        -2.51576,
        140.00157
      ],
      [
        -2.44723,
        139.89203
      ],
      [
        -2.33033,
        139.92735
      ],
      [
        -2.26943,
        140.02127
      ],
      [
        -2.12045,
        140.03861
      ],
      [
        -2.13671,
        140.166
      ]
    ],
    "neighbors": [
      {
        "glottocode": "tarp1240",
        "name": "Tarpia",
        "distanceKm": 8.9
      },
      {
        "glottocode": "nucl1633",
        "name": "Nimboran",
        "distanceKm": 21.8
      },
      {
        "glottocode": "tabl1243",
        "name": "Tabla",
        "distanceKm": 26.7
      },
      {
        "glottocode": "kemt1242",
        "name": "Kemtuik",
        "distanceKm": 37.2
      },
      {
        "glottocode": "gres1240",
        "name": "Gresi",
        "distanceKm": 39.6
      }
    ]
  },
  {
    "glottocode": "tabl1243",
    "name": "Tabla",
    "isocode": "tnm",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.45368,
    "longitude": 140.396,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Tanah Merah, Jayapura)",
    "family": "Sentani",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -2.18389,
        140.396
      ],
      [
        -2.11146,
        140.56096
      ],
      [
        -2.26363,
        140.63454
      ],
      [
        -2.38054,
        140.71674
      ],
      [
        -2.53898,
        140.77005
      ],
      [
        -2.62067,
        140.6056
      ],
      [
        -2.72894,
        140.52868
      ],
      [
        -2.75802,
        140.396
      ],
      [
        -2.62873,
        140.31162
      ],
      [
        -2.62159,
        140.18525
      ],
      [
        -2.50829,
        140.1565
      ],
      [
        -2.41122,
        140.2098
      ],
      [
        -2.26271,
        140.15631
      ],
      [
        -2.21167,
        140.27935
      ],
      [
        -2.18389,
        140.396
      ]
    ],
    "neighbors": [
      {
        "glottocode": "nucl1632",
        "name": "Sentani",
        "distanceKm": 20.9
      },
      {
        "glottocode": "kemt1242",
        "name": "Kemtuik",
        "distanceKm": 21.9
      },
      {
        "glottocode": "demt1241",
        "name": "Demta",
        "distanceKm": 26.7
      },
      {
        "glottocode": "nucl1633",
        "name": "Nimboran",
        "distanceKm": 27.9
      },
      {
        "glottocode": "gres1240",
        "name": "Gresi",
        "distanceKm": 32.6
      }
    ]
  },
  {
    "glottocode": "nucl1632",
    "name": "Sentani",
    "isocode": "set",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.6013,
    "longitude": 140.512,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Danau Sentani, Jayapura)",
    "family": "Sentani",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -2.21038,
        140.512
      ],
      [
        -2.32192,
        140.64668
      ],
      [
        -2.40103,
        140.76339
      ],
      [
        -2.5186,
        140.87471
      ],
      [
        -2.65723,
        140.75731
      ],
      [
        -2.77841,
        140.73432
      ],
      [
        -2.86203,
        140.63769
      ],
      [
        -2.7845,
        140.512
      ],
      [
        -2.8392,
        140.39732
      ],
      [
        -2.75899,
        140.31406
      ],
      [
        -2.64635,
        140.3144
      ],
      [
        -2.52948,
        140.197
      ],
      [
        -2.42045,
        140.28499
      ],
      [
        -2.34476,
        140.38833
      ],
      [
        -2.21038,
        140.512
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kemt1242",
        "name": "Kemtuik",
        "distanceKm": 16.4
      },
      {
        "glottocode": "tabl1243",
        "name": "Tabla",
        "distanceKm": 20.9
      },
      {
        "glottocode": "toba1266",
        "name": "Tobati",
        "distanceKm": 22.4
      },
      {
        "glottocode": "kayu1243",
        "name": "Kayupulau",
        "distanceKm": 24.0
      },
      {
        "glottocode": "gres1240",
        "name": "Gresi",
        "distanceKm": 29.2
      }
    ]
  },
  {
    "glottocode": "nucl1633",
    "name": "Nimboran",
    "isocode": "nir",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.5803,
    "longitude": 140.179,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Genyem, Jayapura)",
    "family": "Nimboran",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -2.27157,
        140.179
      ],
      [
        -2.30304,
        140.31266
      ],
      [
        -2.3585,
        140.45741
      ],
      [
        -2.52835,
        140.40686
      ],
      [
        -2.63907,
        140.43673
      ],
      [
        -2.75395,
        140.39698
      ],
      [
        -2.74089,
        140.25641
      ],
      [
        -2.84569,
        140.179
      ],
      [
        -2.82031,
        140.0633
      ],
      [
        -2.71646,
        140.00809
      ],
      [
        -2.6561,
        139.84656
      ],
      [
        -2.51131,
        139.87643
      ],
      [
        -2.39599,
        139.94765
      ],
      [
        -2.22362,
        140.00706
      ],
      [
        -2.27157,
        140.179
      ]
    ],
    "neighbors": [
      {
        "glottocode": "gres1240",
        "name": "Gresi",
        "distanceKm": 19.3
      },
      {
        "glottocode": "demt1241",
        "name": "Demta",
        "distanceKm": 21.8
      },
      {
        "glottocode": "kemt1242",
        "name": "Kemtuik",
        "distanceKm": 22.8
      },
      {
        "glottocode": "tabl1243",
        "name": "Tabla",
        "distanceKm": 27.9
      },
      {
        "glottocode": "tarp1240",
        "name": "Tarpia",
        "distanceKm": 29.5
      }
    ]
  },
  {
    "glottocode": "kemt1242",
    "name": "Kemtuik",
    "isocode": "kmt",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.64894,
    "longitude": 140.372,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Jayapura)",
    "family": "Nimboran",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -2.35928,
        140.372
      ],
      [
        -2.34476,
        140.51864
      ],
      [
        -2.51393,
        140.54148
      ],
      [
        -2.59381,
        140.61379
      ],
      [
        -2.70975,
        140.63872
      ],
      [
        -2.76118,
        140.5129
      ],
      [
        -2.89486,
        140.49056
      ],
      [
        -2.93341,
        140.372
      ],
      [
        -2.86203,
        140.26927
      ],
      [
        -2.87189,
        140.09213
      ],
      [
        -2.72157,
        140.05346
      ],
      [
        -2.582,
        140.07839
      ],
      [
        -2.40322,
        140.06355
      ],
      [
        -2.37759,
        140.24119
      ],
      [
        -2.35928,
        140.372
      ]
    ],
    "neighbors": [
      {
        "glottocode": "gres1240",
        "name": "Gresi",
        "distanceKm": 13.2
      },
      {
        "glottocode": "nucl1632",
        "name": "Sentani",
        "distanceKm": 16.4
      },
      {
        "glottocode": "tabl1243",
        "name": "Tabla",
        "distanceKm": 21.9
      },
      {
        "glottocode": "nucl1633",
        "name": "Nimboran",
        "distanceKm": 22.8
      },
      {
        "glottocode": "demt1241",
        "name": "Demta",
        "distanceKm": 37.2
      }
    ]
  },
  {
    "glottocode": "gres1240",
    "name": "Gresi",
    "isocode": "grs",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.72229,
    "longitude": 140.279,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Jayapura)",
    "family": "Nimboran",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -2.40271,
        140.279
      ],
      [
        -2.5396,
        140.36708
      ],
      [
        -2.5747,
        140.46428
      ],
      [
        -2.6612,
        140.54694
      ],
      [
        -2.76421,
        140.46285
      ],
      [
        -2.90033,
        140.50251
      ],
      [
        -2.9973,
        140.41159
      ],
      [
        -2.97684,
        140.279
      ],
      [
        -3.05687,
        140.11769
      ],
      [
        -2.93266,
        140.0149
      ],
      [
        -2.78896,
        139.98657
      ],
      [
        -2.63645,
        139.90249
      ],
      [
        -2.54237,
        140.05313
      ],
      [
        -2.48003,
        140.1622
      ],
      [
        -2.40271,
        140.279
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kemt1242",
        "name": "Kemtuik",
        "distanceKm": 13.2
      },
      {
        "glottocode": "nucl1633",
        "name": "Nimboran",
        "distanceKm": 19.3
      },
      {
        "glottocode": "nucl1632",
        "name": "Sentani",
        "distanceKm": 29.2
      },
      {
        "glottocode": "tabl1243",
        "name": "Tabla",
        "distanceKm": 32.6
      },
      {
        "glottocode": "demt1241",
        "name": "Demta",
        "distanceKm": 39.6
      }
    ]
  },
  {
    "glottocode": "toba1266",
    "name": "Tobati",
    "isocode": "tti",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.56434,
    "longitude": 140.71,
    "isNational": true,
    "isFromCsv": false,
    "island": "Maluku",
    "province": "Papua (Teluk Yos Sudarso, Kota Jayapura)",
    "family": "Austronesian (Oceanic)",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -2.4214,
        140.71
      ],
      [
        -2.41027,
        140.78427
      ],
      [
        -2.43466,
        140.87277
      ],
      [
        -2.53117,
        140.85548
      ],
      [
        -2.61376,
        140.92673
      ],
      [
        -2.7143,
        140.89823
      ],
      [
        -2.74372,
        140.79647
      ],
      [
        -2.84444,
        140.71
      ],
      [
        -2.79141,
        140.60054
      ],
      [
        -2.69842,
        140.5417
      ],
      [
        -2.6253,
        140.44263
      ],
      [
        -2.51962,
        140.51389
      ],
      [
        -2.45054,
        140.56715
      ],
      [
        -2.36257,
        140.61274
      ],
      [
        -2.4214,
        140.71
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kayu1243",
        "name": "Kayupulau",
        "distanceKm": 2.5
      },
      {
        "glottocode": "nucl1632",
        "name": "Sentani",
        "distanceKm": 22.4
      },
      {
        "glottocode": "nucl1634",
        "name": "Skou",
        "distanceKm": 23.1
      },
      {
        "glottocode": "tabl1243",
        "name": "Tabla",
        "distanceKm": 37.0
      },
      {
        "glottocode": "kemt1242",
        "name": "Kemtuik",
        "distanceKm": 38.7
      }
    ]
  },
  {
    "glottocode": "kayu1243",
    "name": "Kayupulau",
    "isocode": "kzu",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.54455,
    "longitude": 140.72068,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Kota Jayapura)",
    "family": "Austronesian (Oceanic)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -2.31044,
        140.72068
      ],
      [
        -2.27807,
        140.84914
      ],
      [
        -2.40725,
        140.89302
      ],
      [
        -2.47372,
        141.03131
      ],
      [
        -2.62147,
        141.05802
      ],
      [
        -2.72006,
        140.94098
      ],
      [
        -2.8893,
        140.88687
      ],
      [
        -2.88457,
        140.72068
      ],
      [
        -2.79534,
        140.59979
      ],
      [
        -2.76521,
        140.4437
      ],
      [
        -2.60147,
        140.47103
      ],
      [
        -2.49372,
        140.49774
      ],
      [
        -2.3621,
        140.49167
      ],
      [
        -2.37203,
        140.63752
      ],
      [
        -2.31044,
        140.72068
      ]
    ],
    "neighbors": [
      {
        "glottocode": "toba1266",
        "name": "Tobati",
        "distanceKm": 2.5
      },
      {
        "glottocode": "nucl1634",
        "name": "Skou",
        "distanceKm": 23.0
      },
      {
        "glottocode": "nucl1632",
        "name": "Sentani",
        "distanceKm": 24.0
      },
      {
        "glottocode": "tabl1243",
        "name": "Tabla",
        "distanceKm": 37.5
      },
      {
        "glottocode": "kemt1242",
        "name": "Kemtuik",
        "distanceKm": 40.4
      }
    ]
  },
  {
    "glottocode": "nucl1634",
    "name": "Skou",
    "isocode": "skv",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.64378,
    "longitude": 140.902,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Muara Tami, Perbatasan PNG)",
    "family": "Skou",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -2.33023,
        140.902
      ],
      [
        -2.4276,
        141.00622
      ],
      [
        -2.43557,
        141.16337
      ],
      [
        -2.56346,
        141.25426
      ],
      [
        -2.70765,
        141.18211
      ],
      [
        -2.87972,
        141.19817
      ],
      [
        -2.94278,
        141.04614
      ],
      [
        -2.90436,
        140.902
      ],
      [
        -2.94487,
        140.75685
      ],
      [
        -2.79353,
        140.71402
      ],
      [
        -2.69122,
        140.69394
      ],
      [
        -2.57989,
        140.62178
      ],
      [
        -2.52175,
        140.74882
      ],
      [
        -2.42551,
        140.79677
      ],
      [
        -2.33023,
        140.902
      ]
    ],
    "neighbors": [
      {
        "glottocode": "wutu1244",
        "name": "Wutung",
        "distanceKm": 22.4
      },
      {
        "glottocode": "kayu1243",
        "name": "Kayupulau",
        "distanceKm": 23.0
      },
      {
        "glottocode": "toba1266",
        "name": "Tobati",
        "distanceKm": 23.1
      },
      {
        "glottocode": "manm1266",
        "name": "Manem",
        "distanceKm": 40.8
      },
      {
        "glottocode": "nucl1632",
        "name": "Sentani",
        "distanceKm": 43.6
      }
    ]
  },
  {
    "glottocode": "wutu1244",
    "name": "Wutung",
    "isocode": "wut",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.64636,
    "longitude": 141.104,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua / PNG Border (Skou-Wutung)",
    "family": "Skou",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -2.38716,
        141.104
      ],
      [
        -2.33451,
        141.25434
      ],
      [
        -2.41531,
        141.39404
      ],
      [
        -2.58272,
        141.38313
      ],
      [
        -2.72819,
        141.46291
      ],
      [
        -2.84517,
        141.35356
      ],
      [
        -2.86307,
        141.20847
      ],
      [
        -2.96129,
        141.104
      ],
      [
        -2.85178,
        141.00497
      ],
      [
        -2.77327,
        140.94469
      ],
      [
        -2.71047,
        140.8228
      ],
      [
        -2.60044,
        140.90258
      ],
      [
        -2.4872,
        140.90421
      ],
      [
        -2.3458,
        140.9591
      ],
      [
        -2.38716,
        141.104
      ]
    ],
    "neighbors": [
      {
        "glottocode": "nucl1634",
        "name": "Skou",
        "distanceKm": 22.4
      },
      {
        "glottocode": "manm1266",
        "name": "Manem",
        "distanceKm": 39.5
      },
      {
        "glottocode": "kayu1243",
        "name": "Kayupulau",
        "distanceKm": 44.1
      },
      {
        "glottocode": "toba1266",
        "name": "Tobati",
        "distanceKm": 44.7
      },
      {
        "glottocode": "wari1266",
        "name": "Waris",
        "distanceKm": 58.1
      }
    ]
  },
  {
    "glottocode": "awyi1241",
    "name": "Awyi",
    "isocode": "auw",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.00564,
    "longitude": 140.604,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Keerom)",
    "family": "Border (Papuan)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -2.65253,
        140.604
      ],
      [
        -2.66897,
        140.76635
      ],
      [
        -2.83194,
        140.82211
      ],
      [
        -2.92737,
        140.94741
      ],
      [
        -3.07304,
        140.8997
      ],
      [
        -3.14313,
        140.77664
      ],
      [
        -3.2745,
        140.73366
      ],
      [
        -3.22666,
        140.604
      ],
      [
        -3.18624,
        140.51691
      ],
      [
        -3.1899,
        140.37262
      ],
      [
        -3.05512,
        140.3869
      ],
      [
        -2.94528,
        140.3392
      ],
      [
        -2.78516,
        140.32715
      ],
      [
        -2.75723,
        140.48421
      ],
      [
        -2.65253,
        140.604
      ]
    ],
    "neighbors": [
      {
        "glottocode": "wari1266",
        "name": "Waris",
        "distanceKm": 39.2
      },
      {
        "glottocode": "nucl1632",
        "name": "Sentani",
        "distanceKm": 46.1
      },
      {
        "glottocode": "manm1266",
        "name": "Manem",
        "distanceKm": 46.2
      },
      {
        "glottocode": "kemt1242",
        "name": "Kemtuik",
        "distanceKm": 47.3
      },
      {
        "glottocode": "gres1240",
        "name": "Gresi",
        "distanceKm": 47.9
      }
    ]
  },
  {
    "glottocode": "wari1266",
    "name": "Waris",
    "isocode": "wrs",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.139,
    "longitude": 140.931,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Keerom)",
    "family": "Border (Papuan)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -2.76893,
        140.931
      ],
      [
        -2.89966,
        141.04643
      ],
      [
        -2.9319,
        141.19109
      ],
      [
        -3.07532,
        141.21043
      ],
      [
        -3.18413,
        141.12903
      ],
      [
        -3.31766,
        141.15537
      ],
      [
        -3.33756,
        141.02676
      ],
      [
        -3.34305,
        140.931
      ],
      [
        -3.41693,
        140.79695
      ],
      [
        -3.28986,
        140.74154
      ],
      [
        -3.20307,
        140.64986
      ],
      [
        -3.05638,
        140.56846
      ],
      [
        -2.9597,
        140.70582
      ],
      [
        -2.82028,
        140.77728
      ],
      [
        -2.76893,
        140.931
      ]
    ],
    "neighbors": [
      {
        "glottocode": "manm1266",
        "name": "Manem",
        "distanceKm": 19.2
      },
      {
        "glottocode": "daon1243",
        "name": "Daonda",
        "distanceKm": 37.5
      },
      {
        "glottocode": "awyi1241",
        "name": "Awyi",
        "distanceKm": 39.2
      },
      {
        "glottocode": "nucl1634",
        "name": "Skou",
        "distanceKm": 55.2
      },
      {
        "glottocode": "wutu1244",
        "name": "Wutung",
        "distanceKm": 58.1
      }
    ]
  },
  {
    "glottocode": "daon1243",
    "name": "Daonda",
    "isocode": "dnd",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.31443,
    "longitude": 141.22,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua / PNG Border",
    "family": "Border (Papuan)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -3.06569,
        141.22
      ],
      [
        -3.03409,
        141.35523
      ],
      [
        -3.14542,
        141.43228
      ],
      [
        -3.27227,
        141.40504
      ],
      [
        -3.37688,
        141.49407
      ],
      [
        -3.45561,
        141.39733
      ],
      [
        -3.50695,
        141.31287
      ],
      [
        -3.63982,
        141.22
      ],
      [
        -3.55136,
        141.10571
      ],
      [
        -3.50338,
        140.98266
      ],
      [
        -3.40002,
        140.84437
      ],
      [
        -3.24913,
        140.9334
      ],
      [
        -3.09765,
        140.94771
      ],
      [
        -2.98968,
        141.06335
      ],
      [
        -3.06569,
        141.22
      ]
    ],
    "neighbors": [
      {
        "glottocode": "wari1266",
        "name": "Waris",
        "distanceKm": 37.5
      },
      {
        "glottocode": "manm1266",
        "name": "Manem",
        "distanceKm": 42.2
      },
      {
        "glottocode": "abau1245",
        "name": "Abau",
        "distanceKm": 74.0
      },
      {
        "glottocode": "wutu1244",
        "name": "Wutung",
        "distanceKm": 75.4
      },
      {
        "glottocode": "awyi1241",
        "name": "Awyi",
        "distanceKm": 76.5
      }
    ]
  },
  {
    "glottocode": "manm1266",
    "name": "Manem",
    "isocode": "jet",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.99145,
    "longitude": 141.02,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua (Keerom)",
    "family": "Border (Papuan)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -2.7004,
        141.02
      ],
      [
        -2.7575,
        141.13282
      ],
      [
        -2.87797,
        141.1625
      ],
      [
        -2.92885,
        141.29464
      ],
      [
        -3.04457,
        141.25307
      ],
      [
        -3.13356,
        141.19845
      ],
      [
        -3.30154,
        141.16953
      ],
      [
        -3.27453,
        141.02
      ],
      [
        -3.27477,
        140.88337
      ],
      [
        -3.23593,
        140.71302
      ],
      [
        -3.05661,
        140.73414
      ],
      [
        -2.91682,
        140.69257
      ],
      [
        -2.7756,
        140.74896
      ],
      [
        -2.78427,
        140.92009
      ],
      [
        -2.7004,
        141.02
      ]
    ],
    "neighbors": [
      {
        "glottocode": "wari1266",
        "name": "Waris",
        "distanceKm": 19.2
      },
      {
        "glottocode": "wutu1244",
        "name": "Wutung",
        "distanceKm": 39.5
      },
      {
        "glottocode": "nucl1634",
        "name": "Skou",
        "distanceKm": 40.8
      },
      {
        "glottocode": "daon1243",
        "name": "Daonda",
        "distanceKm": 42.2
      },
      {
        "glottocode": "awyi1241",
        "name": "Awyi",
        "distanceKm": 46.2
      }
    ]
  },
  {
    "glottocode": "ekar1243",
    "name": "Ekari",
    "isocode": "ekg",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.88974,
    "longitude": 136.018,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Tengah (Danau Paniai / Enarotali)",
    "family": "Trans-New Guinea (Wissel Lakes)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -3.6361,
        136.018
      ],
      [
        -3.72647,
        136.09681
      ],
      [
        -3.70997,
        136.24394
      ],
      [
        -3.83276,
        136.26822
      ],
      [
        -3.94423,
        136.25727
      ],
      [
        -4.11577,
        136.30209
      ],
      [
        -4.16008,
        136.14849
      ],
      [
        -4.21023,
        136.018
      ],
      [
        -4.24374,
        135.84713
      ],
      [
        -4.06794,
        135.79403
      ],
      [
        -3.96052,
        135.70719
      ],
      [
        -3.81647,
        135.69624
      ],
      [
        -3.75781,
        135.85218
      ],
      [
        -3.64281,
        135.89881
      ],
      [
        -3.6361,
        136.018
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kamo1255",
        "name": "Kamoro",
        "distanceKm": 48.5
      },
      {
        "glottocode": "auye1238",
        "name": "Auye",
        "distanceKm": 51.1
      },
      {
        "glottocode": "moni1261",
        "name": "Moni",
        "distanceKm": 97.9
      },
      {
        "glottocode": "fayu1238",
        "name": "Fayu",
        "distanceKm": 125.4
      }
    ]
  },
  {
    "glottocode": "auye1238",
    "name": "Auye",
    "isocode": "auu",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.43705,
    "longitude": 136.096,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Tengah (Siriwo, Nabire)",
    "family": "Trans-New Guinea (Wissel Lakes)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -3.24996,
        136.096
      ],
      [
        -3.16617,
        136.22668
      ],
      [
        -3.2646,
        136.31263
      ],
      [
        -3.37871,
        136.35207
      ],
      [
        -3.5212,
        136.46536
      ],
      [
        -3.63163,
        136.34043
      ],
      [
        -3.72547,
        136.23515
      ],
      [
        -3.82408,
        136.096
      ],
      [
        -3.68344,
        135.97713
      ],
      [
        -3.62257,
        135.86295
      ],
      [
        -3.50646,
        135.79133
      ],
      [
        -3.39345,
        135.90462
      ],
      [
        -3.27367,
        135.89075
      ],
      [
        -3.2082,
        135.98559
      ],
      [
        -3.24996,
        136.096
      ]
    ],
    "neighbors": [
      {
        "glottocode": "ekar1243",
        "name": "Ekari",
        "distanceKm": 51.1
      },
      {
        "glottocode": "fayu1238",
        "name": "Fayu",
        "distanceKm": 91.5
      },
      {
        "glottocode": "moni1261",
        "name": "Moni",
        "distanceKm": 93.5
      },
      {
        "glottocode": "kamo1255",
        "name": "Kamoro",
        "distanceKm": 99.3
      },
      {
        "glottocode": "waro1242",
        "name": "Waropen",
        "distanceKm": 138.6
      }
    ]
  },
  {
    "glottocode": "moni1261",
    "name": "Moni",
    "isocode": "mnz",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.72962,
    "longitude": 136.886,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Tengah (Sugapa / Intan Jaya)",
    "family": "Trans-New Guinea (Wissel Lakes)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -3.41298,
        136.886
      ],
      [
        -3.46105,
        137.01561
      ],
      [
        -3.55654,
        137.1035
      ],
      [
        -3.64302,
        137.26622
      ],
      [
        -3.80037,
        137.19662
      ],
      [
        -3.92486,
        137.13134
      ],
      [
        -4.06774,
        137.04918
      ],
      [
        -3.9871,
        136.886
      ],
      [
        -3.97832,
        136.76598
      ],
      [
        -3.9145,
        136.65368
      ],
      [
        -3.77078,
        136.7053
      ],
      [
        -3.67261,
        136.6357
      ],
      [
        -3.5669,
        136.68152
      ],
      [
        -3.55047,
        136.79954
      ],
      [
        -3.41298,
        136.886
      ]
    ],
    "neighbors": [
      {
        "glottocode": "fayu1238",
        "name": "Fayu",
        "distanceKm": 65.0
      },
      {
        "glottocode": "demm1245",
        "name": "Dem",
        "distanceKm": 82.8
      },
      {
        "glottocode": "dama1272",
        "name": "Damal",
        "distanceKm": 83.8
      },
      {
        "glottocode": "wano1243",
        "name": "Wano",
        "distanceKm": 92.2
      },
      {
        "glottocode": "auye1238",
        "name": "Auye",
        "distanceKm": 93.5
      }
    ]
  },
  {
    "glottocode": "dama1272",
    "name": "Damal",
    "isocode": "uhn",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -4.17345,
    "longitude": 137.496,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Tengah (Ilaga, Puncak)",
    "family": "Trans-New Guinea (Damal)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -3.85522,
        137.496
      ],
      [
        -3.91302,
        137.62175
      ],
      [
        -3.92773,
        137.80495
      ],
      [
        -4.10288,
        137.80602
      ],
      [
        -4.24024,
        137.78939
      ],
      [
        -4.39739,
        137.77756
      ],
      [
        -4.38965,
        137.60039
      ],
      [
        -4.42935,
        137.496
      ],
      [
        -4.43029,
        137.37198
      ],
      [
        -4.28569,
        137.35488
      ],
      [
        -4.23063,
        137.2448
      ],
      [
        -4.11248,
        137.22817
      ],
      [
        -4.03943,
        137.32749
      ],
      [
        -3.87238,
        137.35062
      ],
      [
        -3.85522,
        137.496
      ]
    ],
    "neighbors": [
      {
        "glottocode": "demm1245",
        "name": "Dem",
        "distanceKm": 52.4
      },
      {
        "glottocode": "wano1243",
        "name": "Wano",
        "distanceKm": 79.9
      },
      {
        "glottocode": "moni1261",
        "name": "Moni",
        "distanceKm": 83.8
      },
      {
        "glottocode": "west2594",
        "name": "Western Dani",
        "distanceKm": 91.6
      },
      {
        "glottocode": "ndug1245",
        "name": "Nduga",
        "distanceKm": 103.1
      }
    ]
  },
  {
    "glottocode": "kamo1255",
    "name": "Kamoro",
    "isocode": "kgq",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -4.30433,
    "longitude": 135.883,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Tengah (Pesisir Mimika / Timika)",
    "family": "Trans-New Guinea (Asmat-Kamoro)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -4.00938,
        135.883
      ],
      [
        -3.95087,
        136.0537
      ],
      [
        -4.11098,
        136.12614
      ],
      [
        -4.24148,
        136.15913
      ],
      [
        -4.38015,
        136.21611
      ],
      [
        -4.44351,
        136.05802
      ],
      [
        -4.51991,
        135.98711
      ],
      [
        -4.58351,
        135.883
      ],
      [
        -4.46814,
        135.80389
      ],
      [
        -4.46894,
        135.676
      ],
      [
        -4.36924,
        135.59782
      ],
      [
        -4.25239,
        135.65479
      ],
      [
        -4.08555,
        135.60788
      ],
      [
        -4.00264,
        135.7373
      ],
      [
        -4.00938,
        135.883
      ]
    ],
    "neighbors": [
      {
        "glottocode": "ekar1243",
        "name": "Ekari",
        "distanceKm": 48.5
      },
      {
        "glottocode": "auye1238",
        "name": "Auye",
        "distanceKm": 99.3
      },
      {
        "glottocode": "moni1261",
        "name": "Moni",
        "distanceKm": 128.3
      }
    ]
  },
  {
    "glottocode": "semp1241",
    "name": "Sempan",
    "isocode": "xse",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -5.17582,
    "longitude": 137.588,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Tengah (Mimika Timur)",
    "family": "Trans-New Guinea (Asmat-Kamoro)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -4.7919,
        137.588
      ],
      [
        -4.9074,
        137.71779
      ],
      [
        -5.0125,
        137.79364
      ],
      [
        -5.10412,
        137.90342
      ],
      [
        -5.22244,
        137.79311
      ],
      [
        -5.31793,
        137.76693
      ],
      [
        -5.42783,
        137.70986
      ],
      [
        -5.36602,
        137.588
      ],
      [
        -5.42467,
        137.46767
      ],
      [
        -5.37046,
        137.34293
      ],
      [
        -5.23188,
        137.34139
      ],
      [
        -5.09469,
        137.23109
      ],
      [
        -4.95997,
        137.31622
      ],
      [
        -4.91056,
        137.45973
      ],
      [
        -4.7919,
        137.588
      ]
    ],
    "neighbors": [
      {
        "glottocode": "dama1272",
        "name": "Damal",
        "distanceKm": 111.9
      },
      {
        "glottocode": "cent2117",
        "name": "Central Asmat",
        "distanceKm": 120.1
      },
      {
        "glottocode": "yaos1235",
        "name": "Yaosakor Asmat",
        "distanceKm": 120.2
      },
      {
        "glottocode": "ndug1245",
        "name": "Nduga",
        "distanceKm": 130.2
      }
    ]
  },
  {
    "glottocode": "cent2117",
    "name": "Central Asmat",
    "isocode": "cns",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -5.80391,
    "longitude": 138.471,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Selatan (Agats, Asmat)",
    "family": "Trans-New Guinea (Asmat-Kamoro)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -5.52156,
        138.471
      ],
      [
        -5.58683,
        138.57608
      ],
      [
        -5.61315,
        138.71144
      ],
      [
        -5.75924,
        138.66771
      ],
      [
        -5.85352,
        138.68947
      ],
      [
        -5.98271,
        138.69636
      ],
      [
        -5.98794,
        138.56008
      ],
      [
        -6.09569,
        138.471
      ],
      [
        -6.1041,
        138.32569
      ],
      [
        -5.97111,
        138.26026
      ],
      [
        -5.887,
        138.10509
      ],
      [
        -5.72576,
        138.12685
      ],
      [
        -5.62474,
        138.24518
      ],
      [
        -5.47067,
        138.30969
      ],
      [
        -5.52156,
        138.471
      ]
    ],
    "neighbors": [
      {
        "glottocode": "yaos1235",
        "name": "Yaosakor Asmat",
        "distanceKm": 24.8
      },
      {
        "glottocode": "casu1237",
        "name": "Casuarina Coast Asmat",
        "distanceKm": 70.4
      },
      {
        "glottocode": "tamn1235",
        "name": "Tamnim Citak",
        "distanceKm": 87.9
      },
      {
        "glottocode": "cita1245",
        "name": "Citak",
        "distanceKm": 112.3
      },
      {
        "glottocode": "semp1241",
        "name": "Sempan",
        "distanceKm": 120.1
      }
    ]
  },
  {
    "glottocode": "casu1237",
    "name": "Casuarina Coast Asmat",
    "isocode": "asc",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -6.43005,
    "longitude": 138.566,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Selatan (Pantai Kasuari, Asmat)",
    "family": "Trans-New Guinea (Asmat-Kamoro)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -6.20833,
        138.566
      ],
      [
        -6.1652,
        138.69435
      ],
      [
        -6.30652,
        138.72189
      ],
      [
        -6.38006,
        138.78639
      ],
      [
        -6.49672,
        138.85997
      ],
      [
        -6.56869,
        138.74095
      ],
      [
        -6.70805,
        138.70072
      ],
      [
        -6.78246,
        138.566
      ],
      [
        -6.68247,
        138.44367
      ],
      [
        -6.66448,
        138.27017
      ],
      [
        -6.50782,
        138.22312
      ],
      [
        -6.36897,
        138.29669
      ],
      [
        -6.21073,
        138.28924
      ],
      [
        -6.19078,
        138.45004
      ],
      [
        -6.20833,
        138.566
      ]
    ],
    "neighbors": [
      {
        "glottocode": "cent2117",
        "name": "Central Asmat",
        "distanceKm": 70.4
      },
      {
        "glottocode": "yaqa1246",
        "name": "Yaqay",
        "distanceKm": 79.9
      },
      {
        "glottocode": "yaos1235",
        "name": "Yaosakor Asmat",
        "distanceKm": 91.2
      },
      {
        "glottocode": "tamn1235",
        "name": "Tamnim Citak",
        "distanceKm": 119.9
      },
      {
        "glottocode": "rian1263",
        "name": "Riantana",
        "distanceKm": 120.1
      }
    ]
  },
  {
    "glottocode": "yaos1235",
    "name": "Yaosakor Asmat",
    "isocode": "asy",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -5.61024,
    "longitude": 138.582,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Selatan (Sirets, Asmat)",
    "family": "Trans-New Guinea (Asmat-Kamoro)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -5.32255,
        138.582
      ],
      [
        -5.42801,
        138.67018
      ],
      [
        -5.46526,
        138.76468
      ],
      [
        -5.53973,
        138.8924
      ],
      [
        -5.66419,
        138.8195
      ],
      [
        -5.81238,
        138.83669
      ],
      [
        -5.94154,
        138.74231
      ],
      [
        -5.89667,
        138.582
      ],
      [
        -5.94528,
        138.41988
      ],
      [
        -5.82322,
        138.31365
      ],
      [
        -5.66749,
        138.32998
      ],
      [
        -5.53643,
        138.25707
      ],
      [
        -5.45442,
        138.38566
      ],
      [
        -5.42427,
        138.49201
      ],
      [
        -5.32255,
        138.582
      ]
    ],
    "neighbors": [
      {
        "glottocode": "cent2117",
        "name": "Central Asmat",
        "distanceKm": 24.8
      },
      {
        "glottocode": "tamn1235",
        "name": "Tamnim Citak",
        "distanceKm": 72.1
      },
      {
        "glottocode": "casu1237",
        "name": "Casuarina Coast Asmat",
        "distanceKm": 91.2
      },
      {
        "glottocode": "cita1245",
        "name": "Citak",
        "distanceKm": 97.3
      },
      {
        "glottocode": "semp1241",
        "name": "Sempan",
        "distanceKm": 120.2
      }
    ]
  },
  {
    "glottocode": "cita1245",
    "name": "Citak",
    "isocode": "txt",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -5.58276,
    "longitude": 139.461,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Selatan (Mappi)",
    "family": "Trans-New Guinea (Asmat-Kamoro)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -5.36992,
        139.461
      ],
      [
        -5.36167,
        139.56798
      ],
      [
        -5.37297,
        139.72532
      ],
      [
        -5.52443,
        139.7178
      ],
      [
        -5.65765,
        139.79066
      ],
      [
        -5.8181,
        139.75752
      ],
      [
        -5.84063,
        139.58578
      ],
      [
        -5.94405,
        139.461
      ],
      [
        -5.87894,
        139.31769
      ],
      [
        -5.73093,
        139.27431
      ],
      [
        -5.65218,
        139.1554
      ],
      [
        -5.52989,
        139.22826
      ],
      [
        -5.46014,
        139.30651
      ],
      [
        -5.32336,
        139.33548
      ],
      [
        -5.36992,
        139.461
      ]
    ],
    "neighbors": [
      {
        "glottocode": "tamn1235",
        "name": "Tamnim Citak",
        "distanceKm": 25.2
      },
      {
        "glottocode": "komb1274",
        "name": "Kombai",
        "distanceKm": 49.0
      },
      {
        "glottocode": "koro1312",
        "name": "Korowai",
        "distanceKm": 73.6
      },
      {
        "glottocode": "yaos1235",
        "name": "Yaosakor Asmat",
        "distanceKm": 97.3
      },
      {
        "glottocode": "cent2117",
        "name": "Central Asmat",
        "distanceKm": 112.3
      }
    ]
  },
  {
    "glottocode": "tamn1235",
    "name": "Tamnim Citak",
    "isocode": "tml",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -5.57962,
    "longitude": 139.233,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Selatan (Mappi)",
    "family": "Trans-New Guinea (Asmat-Kamoro)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -5.31827,
        139.233
      ],
      [
        -5.2587,
        139.38828
      ],
      [
        -5.40552,
        139.45236
      ],
      [
        -5.50312,
        139.56974
      ],
      [
        -5.66433,
        139.6059
      ],
      [
        -5.75392,
        139.4526
      ],
      [
        -5.89073,
        139.38354
      ],
      [
        -5.8924,
        139.233
      ],
      [
        -5.77597,
        139.13799
      ],
      [
        -5.76348,
        139.00135
      ],
      [
        -5.63088,
        139.00735
      ],
      [
        -5.53657,
        139.0435
      ],
      [
        -5.39596,
        139.0016
      ],
      [
        -5.37346,
        139.13325
      ],
      [
        -5.31827,
        139.233
      ]
    ],
    "neighbors": [
      {
        "glottocode": "cita1245",
        "name": "Citak",
        "distanceKm": 25.2
      },
      {
        "glottocode": "yaos1235",
        "name": "Yaosakor Asmat",
        "distanceKm": 72.1
      },
      {
        "glottocode": "komb1274",
        "name": "Kombai",
        "distanceKm": 74.1
      },
      {
        "glottocode": "cent2117",
        "name": "Central Asmat",
        "distanceKm": 87.9
      },
      {
        "glottocode": "koro1312",
        "name": "Korowai",
        "distanceKm": 96.5
      }
    ]
  },
  {
    "glottocode": "yaqa1246",
    "name": "Yaqay",
    "isocode": "jaq",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -6.66632,
    "longitude": 139.249,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Selatan (Mappi)",
    "family": "Trans-New Guinea (Marind-Yaqay)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -6.29262,
        139.249
      ],
      [
        -6.40344,
        139.37646
      ],
      [
        -6.45139,
        139.52034
      ],
      [
        -6.58239,
        139.61922
      ],
      [
        -6.7258,
        139.51136
      ],
      [
        -6.86935,
        139.50532
      ],
      [
        -6.93295,
        139.37828
      ],
      [
        -6.86675,
        139.249
      ],
      [
        -6.92071,
        139.12566
      ],
      [
        -6.80936,
        139.06842
      ],
      [
        -6.71015,
        139.05568
      ],
      [
        -6.59804,
        138.94782
      ],
      [
        -6.51139,
        139.0534
      ],
      [
        -6.41568,
        139.12748
      ],
      [
        -6.29262,
        139.249
      ]
    ],
    "neighbors": [
      {
        "glottocode": "casu1237",
        "name": "Casuarina Coast Asmat",
        "distanceKm": 79.9
      },
      {
        "glottocode": "tamn1235",
        "name": "Tamnim Citak",
        "distanceKm": 120.8
      },
      {
        "glottocode": "cita1245",
        "name": "Citak",
        "distanceKm": 122.7
      },
      {
        "glottocode": "rian1263",
        "name": "Riantana",
        "distanceKm": 126.0
      },
      {
        "glottocode": "cent2117",
        "name": "Central Asmat",
        "distanceKm": 128.8
      }
    ]
  },
  {
    "glottocode": "nucl1622",
    "name": "Marind",
    "isocode": "mrz",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.15651,
    "longitude": 140.009,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Selatan (Merauke)",
    "family": "Trans-New Guinea (Marind)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -7.85813,
        140.009
      ],
      [
        -7.85109,
        140.15758
      ],
      [
        -7.92733,
        140.29932
      ],
      [
        -8.10066,
        140.25618
      ],
      [
        -8.22425,
        140.30882
      ],
      [
        -8.33142,
        140.23057
      ],
      [
        -8.32516,
        140.09105
      ],
      [
        -8.43226,
        140.009
      ],
      [
        -8.36836,
        139.90593
      ],
      [
        -8.28529,
        139.84586
      ],
      [
        -8.22842,
        139.69072
      ],
      [
        -8.09649,
        139.74337
      ],
      [
        -7.97346,
        139.77712
      ],
      [
        -7.80789,
        139.8394
      ],
      [
        -7.85813,
        140.009
      ]
    ],
    "neighbors": [
      {
        "glottocode": "yeii1239",
        "name": "Yei",
        "distanceKm": 99.1
      },
      {
        "glottocode": "bian1251",
        "name": "Bian Marind",
        "distanceKm": 107.9
      },
      {
        "glottocode": "sota1242",
        "name": "Sota Kanum",
        "distanceKm": 109.2
      },
      {
        "glottocode": "smar1235",
        "name": "Smärky Kanum",
        "distanceKm": 129.3
      },
      {
        "glottocode": "nucl1452",
        "name": "Mombum",
        "distanceKm": 136.6
      }
    ]
  },
  {
    "glottocode": "bian1251",
    "name": "Bian Marind",
    "isocode": "bpv",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -7.35942,
    "longitude": 140.568,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Selatan (Sungai Bian, Merauke)",
    "family": "Trans-New Guinea (Marind)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -7.03243,
        140.568
      ],
      [
        -7.04116,
        140.72254
      ],
      [
        -7.21438,
        140.75139
      ],
      [
        -7.29622,
        140.84718
      ],
      [
        -7.41922,
        140.83216
      ],
      [
        -7.47149,
        140.7097
      ],
      [
        -7.60782,
        140.68862
      ],
      [
        -7.60656,
        140.568
      ],
      [
        -7.55843,
        140.47136
      ],
      [
        -7.57234,
        140.29879
      ],
      [
        -7.42398,
        140.2828
      ],
      [
        -7.29146,
        140.26778
      ],
      [
        -7.11353,
        140.2571
      ],
      [
        -7.09055,
        140.43744
      ],
      [
        -7.03243,
        140.568
      ]
    ],
    "neighbors": [
      {
        "glottocode": "yeii1239",
        "name": "Yei",
        "distanceKm": 65.9
      },
      {
        "glottocode": "nucl1622",
        "name": "Marind",
        "distanceKm": 107.9
      },
      {
        "glottocode": "mand1445",
        "name": "Mandobo Bawah",
        "distanceKm": 110.5
      },
      {
        "glottocode": "sota1242",
        "name": "Sota Kanum",
        "distanceKm": 124.3
      }
    ]
  },
  {
    "glottocode": "nucl1452",
    "name": "Mombum",
    "isocode": "mso",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.27141,
    "longitude": 138.773,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Selatan (Pulau Yos Sudarso)",
    "family": "Kolopom",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -7.93531,
        138.773
      ],
      [
        -8.07807,
        138.86708
      ],
      [
        -8.10519,
        138.98363
      ],
      [
        -8.21307,
        139.0313
      ],
      [
        -8.31123,
        138.9493
      ],
      [
        -8.44726,
        138.99583
      ],
      [
        -8.50948,
        138.88885
      ],
      [
        -8.50944,
        138.773
      ],
      [
        -8.59534,
        138.61536
      ],
      [
        -8.46315,
        138.53004
      ],
      [
        -8.34082,
        138.46569
      ],
      [
        -8.18348,
        138.38368
      ],
      [
        -8.0893,
        138.54224
      ],
      [
        -7.99221,
        138.63713
      ],
      [
        -7.93531,
        138.773
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kima1246",
        "name": "Kimaama",
        "distanceKm": 53.9
      },
      {
        "glottocode": "kone1241",
        "name": "Koneraw",
        "distanceKm": 78.5
      },
      {
        "glottocode": "rian1263",
        "name": "Riantana",
        "distanceKm": 90.7
      },
      {
        "glottocode": "nucl1622",
        "name": "Marind",
        "distanceKm": 136.6
      }
    ]
  },
  {
    "glottocode": "kone1241",
    "name": "Koneraw",
    "isocode": "kdw",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.37424,
    "longitude": 138.0675,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Selatan (Pulau Yos Sudarso)",
    "family": "Kolopom",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -8.17512,
        138.0675
      ],
      [
        -8.14532,
        138.17893
      ],
      [
        -8.21089,
        138.27455
      ],
      [
        -8.3331,
        138.24967
      ],
      [
        -8.43962,
        138.35702
      ],
      [
        -8.5517,
        138.29243
      ],
      [
        -8.60464,
        138.17965
      ],
      [
        -8.74925,
        138.0675
      ],
      [
        -8.66259,
        137.92714
      ],
      [
        -8.56885,
        137.82084
      ],
      [
        -8.46086,
        137.68391
      ],
      [
        -8.31186,
        137.79125
      ],
      [
        -8.19374,
        137.83872
      ],
      [
        -8.08737,
        137.92786
      ],
      [
        -8.17512,
        138.0675
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kima1246",
        "name": "Kimaama",
        "distanceKm": 50.6
      },
      {
        "glottocode": "nucl1452",
        "name": "Mombum",
        "distanceKm": 78.5
      },
      {
        "glottocode": "rian1263",
        "name": "Riantana",
        "distanceKm": 106.7
      }
    ]
  },
  {
    "glottocode": "rian1263",
    "name": "Riantana",
    "isocode": "ran",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -7.50746,
    "longitude": 138.484,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Selatan (Pulau Yos Sudarso)",
    "family": "Kolopom",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -7.25975,
        138.484
      ],
      [
        -7.26563,
        138.60147
      ],
      [
        -7.38481,
        138.63913
      ],
      [
        -7.43863,
        138.78818
      ],
      [
        -7.57558,
        138.78502
      ],
      [
        -7.67683,
        138.69822
      ],
      [
        -7.85516,
        138.65289
      ],
      [
        -7.83388,
        138.484
      ],
      [
        -7.7829,
        138.35021
      ],
      [
        -7.74277,
        138.18638
      ],
      [
        -7.56638,
        138.22361
      ],
      [
        -7.44782,
        138.22044
      ],
      [
        -7.31886,
        138.24546
      ],
      [
        -7.33789,
        138.40163
      ],
      [
        -7.25975,
        138.484
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kima1246",
        "name": "Kimaama",
        "distanceKm": 58.6
      },
      {
        "glottocode": "nucl1452",
        "name": "Mombum",
        "distanceKm": 90.7
      },
      {
        "glottocode": "kone1241",
        "name": "Koneraw",
        "distanceKm": 106.7
      },
      {
        "glottocode": "casu1237",
        "name": "Casuarina Coast Asmat",
        "distanceKm": 120.1
      },
      {
        "glottocode": "yaqa1246",
        "name": "Yaqay",
        "distanceKm": 126.0
      }
    ]
  },
  {
    "glottocode": "kima1246",
    "name": "Kimaama",
    "isocode": "kig",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.01899,
    "longitude": 138.355,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Selatan (Pulau Yos Sudarso)",
    "family": "Kolopom",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -7.7381,
        138.355
      ],
      [
        -7.82705,
        138.44835
      ],
      [
        -7.8154,
        138.61282
      ],
      [
        -7.94637,
        138.67631
      ],
      [
        -8.08212,
        138.63433
      ],
      [
        -8.26267,
        138.66359
      ],
      [
        -8.31285,
        138.49791
      ],
      [
        -8.31223,
        138.355
      ],
      [
        -8.34432,
        138.19678
      ],
      [
        -8.17336,
        138.15952
      ],
      [
        -8.07412,
        138.11105
      ],
      [
        -7.95437,
        138.06907
      ],
      [
        -7.90471,
        138.21028
      ],
      [
        -7.79558,
        138.24635
      ],
      [
        -7.7381,
        138.355
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kone1241",
        "name": "Koneraw",
        "distanceKm": 50.6
      },
      {
        "glottocode": "nucl1452",
        "name": "Mombum",
        "distanceKm": 53.9
      },
      {
        "glottocode": "rian1263",
        "name": "Riantana",
        "distanceKm": 58.6
      }
    ]
  },
  {
    "glottocode": "sota1242",
    "name": "Sota Kanum",
    "isocode": "krz",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.40452,
    "longitude": 140.969,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Selatan (Sota, Perbatasan PNG)",
    "family": "Yam",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -8.17269,
        140.969
      ],
      [
        -8.0954,
        141.11948
      ],
      [
        -8.19056,
        141.24021
      ],
      [
        -8.33992,
        141.2551
      ],
      [
        -8.49109,
        141.35241
      ],
      [
        -8.60376,
        141.22156
      ],
      [
        -8.65317,
        141.09005
      ],
      [
        -8.74682,
        140.969
      ],
      [
        -8.61267,
        140.86767
      ],
      [
        -8.54852,
        140.78647
      ],
      [
        -8.46768,
        140.68929
      ],
      [
        -8.36334,
        140.7866
      ],
      [
        -8.2458,
        140.76781
      ],
      [
        -8.1359,
        140.83824
      ],
      [
        -8.17269,
        140.969
      ]
    ],
    "neighbors": [
      {
        "glottocode": "smar1235",
        "name": "Smärky Kanum",
        "distanceKm": 57.7
      },
      {
        "glottocode": "yeii1239",
        "name": "Yei",
        "distanceKm": 60.0
      },
      {
        "glottocode": "nucl1622",
        "name": "Marind",
        "distanceKm": 109.2
      },
      {
        "glottocode": "bian1251",
        "name": "Bian Marind",
        "distanceKm": 124.3
      }
    ]
  },
  {
    "glottocode": "smar1235",
    "name": "Smärky Kanum",
    "isocode": "kxq",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.91812,
    "longitude": 140.897,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Selatan (Merauke)",
    "family": "Yam",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -8.56136,
        140.897
      ],
      [
        -8.59848,
        141.05282
      ],
      [
        -8.73699,
        141.12691
      ],
      [
        -8.83342,
        141.27264
      ],
      [
        -8.9866,
        141.20069
      ],
      [
        -9.07764,
        141.09947
      ],
      [
        -9.20943,
        141.039
      ],
      [
        -9.13549,
        140.897
      ],
      [
        -9.11575,
        140.80066
      ],
      [
        -9.09495,
        140.67254
      ],
      [
        -8.96117,
        140.70606
      ],
      [
        -8.85884,
        140.6341
      ],
      [
        -8.71967,
        140.64511
      ],
      [
        -8.69216,
        140.78685
      ],
      [
        -8.56136,
        140.897
      ]
    ],
    "neighbors": [
      {
        "glottocode": "sota1242",
        "name": "Sota Kanum",
        "distanceKm": 57.7
      },
      {
        "glottocode": "yeii1239",
        "name": "Yei",
        "distanceKm": 116.1
      },
      {
        "glottocode": "nucl1622",
        "name": "Marind",
        "distanceKm": 129.3
      }
    ]
  },
  {
    "glottocode": "yeii1239",
    "name": "Yei",
    "isocode": "jei",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -7.87489,
    "longitude": 140.863,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Selatan (Merauke)",
    "family": "Yam",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -7.51484,
        140.863
      ],
      [
        -7.61885,
        140.98747
      ],
      [
        -7.64638,
        141.15228
      ],
      [
        -7.80983,
        141.15077
      ],
      [
        -7.92719,
        141.09434
      ],
      [
        -8.06598,
        141.1049
      ],
      [
        -8.06275,
        140.95433
      ],
      [
        -8.08897,
        140.863
      ],
      [
        -8.13612,
        140.736
      ],
      [
        -8.00434,
        140.69913
      ],
      [
        -7.93758,
        140.5857
      ],
      [
        -7.79944,
        140.52928
      ],
      [
        -7.70802,
        140.65176
      ],
      [
        -7.54548,
        140.70285
      ],
      [
        -7.51484,
        140.863
      ]
    ],
    "neighbors": [
      {
        "glottocode": "sota1242",
        "name": "Sota Kanum",
        "distanceKm": 60.0
      },
      {
        "glottocode": "bian1251",
        "name": "Bian Marind",
        "distanceKm": 65.9
      },
      {
        "glottocode": "nucl1622",
        "name": "Marind",
        "distanceKm": 99.1
      },
      {
        "glottocode": "smar1235",
        "name": "Smärky Kanum",
        "distanceKm": 116.1
      }
    ]
  },
  {
    "glottocode": "koro1312",
    "name": "Korowai",
    "isocode": "khe",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -5.26952,
    "longitude": 140.047,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Selatan / Pegunungan (Kombai-Korowai)",
    "family": "Trans-New Guinea (Awyu-Ndumut)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -4.99753,
        140.047
      ],
      [
        -4.95579,
        140.19873
      ],
      [
        -5.09763,
        140.26345
      ],
      [
        -5.22147,
        140.25842
      ],
      [
        -5.3349,
        140.33465
      ],
      [
        -5.39781,
        140.20856
      ],
      [
        -5.4637,
        140.14091
      ],
      [
        -5.57166,
        140.047
      ],
      [
        -5.47306,
        139.94857
      ],
      [
        -5.4556,
        139.81268
      ],
      [
        -5.34922,
        139.69631
      ],
      [
        -5.20714,
        139.77254
      ],
      [
        -5.03985,
        139.75778
      ],
      [
        -4.94643,
        139.89075
      ],
      [
        -4.99753,
        140.047
      ]
    ],
    "neighbors": [
      {
        "glottocode": "komb1274",
        "name": "Kombai",
        "distanceKm": 34.6
      },
      {
        "glottocode": "cita1245",
        "name": "Citak",
        "distanceKm": 73.6
      },
      {
        "glottocode": "mand1444",
        "name": "Mandobo Atas",
        "distanceKm": 79.4
      },
      {
        "glottocode": "nort2916",
        "name": "North Muyu",
        "distanceKm": 93.3
      },
      {
        "glottocode": "tamn1235",
        "name": "Tamnim Citak",
        "distanceKm": 96.5
      }
    ]
  },
  {
    "glottocode": "komb1274",
    "name": "Kombai",
    "isocode": "tyn",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -5.54543,
    "longitude": 139.902,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Selatan (Boven Digoel)",
    "family": "Trans-New Guinea (Awyu-Ndumut)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -5.21758,
        139.902
      ],
      [
        -5.31122,
        140.01532
      ],
      [
        -5.42033,
        140.05961
      ],
      [
        -5.48162,
        140.18289
      ],
      [
        -5.5921,
        140.10743
      ],
      [
        -5.68461,
        140.07734
      ],
      [
        -5.83264,
        140.04097
      ],
      [
        -5.79171,
        139.902
      ],
      [
        -5.82849,
        139.76505
      ],
      [
        -5.77829,
        139.60863
      ],
      [
        -5.60937,
        139.62053
      ],
      [
        -5.46434,
        139.54507
      ],
      [
        -5.32664,
        139.62636
      ],
      [
        -5.31537,
        139.79069
      ],
      [
        -5.21758,
        139.902
      ]
    ],
    "neighbors": [
      {
        "glottocode": "koro1312",
        "name": "Korowai",
        "distanceKm": 34.6
      },
      {
        "glottocode": "cita1245",
        "name": "Citak",
        "distanceKm": 49.0
      },
      {
        "glottocode": "tamn1235",
        "name": "Tamnim Citak",
        "distanceKm": 74.1
      },
      {
        "glottocode": "mand1444",
        "name": "Mandobo Atas",
        "distanceKm": 81.6
      },
      {
        "glottocode": "nort2916",
        "name": "North Muyu",
        "distanceKm": 103.8
      }
    ]
  },
  {
    "glottocode": "mand1444",
    "name": "Mandobo Atas",
    "isocode": "aax",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -5.69357,
    "longitude": 140.624,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Selatan (Boven Digoel)",
    "family": "Trans-New Guinea (Awyu-Ndumut)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -5.44616,
        140.624
      ],
      [
        -5.52162,
        140.70722
      ],
      [
        -5.51512,
        140.84888
      ],
      [
        -5.64458,
        140.83971
      ],
      [
        -5.74608,
        140.85521
      ],
      [
        -5.90427,
        140.88952
      ],
      [
        -5.9336,
        140.74017
      ],
      [
        -6.02028,
        140.624
      ],
      [
        -6.03889,
        140.45688
      ],
      [
        -5.87309,
        140.39778
      ],
      [
        -5.77233,
        140.27721
      ],
      [
        -5.61833,
        140.2927
      ],
      [
        -5.54631,
        140.43842
      ],
      [
        -5.41633,
        140.48983
      ],
      [
        -5.44616,
        140.624
      ]
    ],
    "neighbors": [
      {
        "glottocode": "nort2916",
        "name": "North Muyu",
        "distanceKm": 28.5
      },
      {
        "glottocode": "sout2940",
        "name": "South Muyu",
        "distanceKm": 41.4
      },
      {
        "glottocode": "mand1445",
        "name": "Mandobo Bawah",
        "distanceKm": 77.9
      },
      {
        "glottocode": "koro1312",
        "name": "Korowai",
        "distanceKm": 79.4
      },
      {
        "glottocode": "komb1274",
        "name": "Kombai",
        "distanceKm": 81.6
      }
    ]
  },
  {
    "glottocode": "mand1445",
    "name": "Mandobo Bawah",
    "isocode": "bwp",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -6.37255,
    "longitude": 140.451,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Selatan (Tanah Merah)",
    "family": "Trans-New Guinea (Awyu-Ndumut)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -6.18499,
        140.451
      ],
      [
        -6.10936,
        140.57853
      ],
      [
        -6.22536,
        140.63672
      ],
      [
        -6.31648,
        140.69819
      ],
      [
        -6.45206,
        140.80152
      ],
      [
        -6.54964,
        140.67445
      ],
      [
        -6.6737,
        140.59693
      ],
      [
        -6.75912,
        140.451
      ],
      [
        -6.62663,
        140.32788
      ],
      [
        -6.58332,
        140.18506
      ],
      [
        -6.44423,
        140.13498
      ],
      [
        -6.3243,
        140.23831
      ],
      [
        -6.19168,
        140.22279
      ],
      [
        -6.15643,
        140.34628
      ],
      [
        -6.18499,
        140.451
      ]
    ],
    "neighbors": [
      {
        "glottocode": "sout2940",
        "name": "South Muyu",
        "distanceKm": 56.7
      },
      {
        "glottocode": "mand1444",
        "name": "Mandobo Atas",
        "distanceKm": 77.9
      },
      {
        "glottocode": "nort2916",
        "name": "North Muyu",
        "distanceKm": 100.8
      },
      {
        "glottocode": "komb1274",
        "name": "Kombai",
        "distanceKm": 110.2
      },
      {
        "glottocode": "bian1251",
        "name": "Bian Marind",
        "distanceKm": 110.5
      }
    ]
  },
  {
    "glottocode": "nort2916",
    "name": "North Muyu",
    "isocode": "kti",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -5.55319,
    "longitude": 140.84,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Selatan (Mindiptana, Boven Digoel)",
    "family": "Trans-New Guinea (Ok)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -5.24949,
        140.84
      ],
      [
        -5.32275,
        140.9515
      ],
      [
        -5.38546,
        141.05132
      ],
      [
        -5.46983,
        141.20694
      ],
      [
        -5.61932,
        141.1311
      ],
      [
        -5.76242,
        141.1036
      ],
      [
        -5.89837,
        141.00701
      ],
      [
        -5.82362,
        140.84
      ],
      [
        -5.84002,
        140.70122
      ],
      [
        -5.74342,
        140.60033
      ],
      [
        -5.59759,
        140.64456
      ],
      [
        -5.49156,
        140.56873
      ],
      [
        -5.40446,
        140.65262
      ],
      [
        -5.3811,
        140.75673
      ],
      [
        -5.24949,
        140.84
      ]
    ],
    "neighbors": [
      {
        "glottocode": "mand1444",
        "name": "Mandobo Atas",
        "distanceKm": 28.5
      },
      {
        "glottocode": "sout2940",
        "name": "South Muyu",
        "distanceKm": 51.3
      },
      {
        "glottocode": "tifa1245",
        "name": "Tifal",
        "distanceKm": 76.1
      },
      {
        "glottocode": "aeky1238",
        "name": "Aekyom",
        "distanceKm": 85.0
      },
      {
        "glottocode": "koro1312",
        "name": "Korowai",
        "distanceKm": 93.3
      }
    ]
  },
  {
    "glottocode": "sout2940",
    "name": "South Muyu",
    "isocode": "kts",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -6.01385,
    "longitude": 140.815,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Selatan (Boven Digoel)",
    "family": "Trans-New Guinea (Ok)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -5.73673,
        140.815
      ],
      [
        -5.75729,
        140.93923
      ],
      [
        -5.7721,
        141.11982
      ],
      [
        -5.9461,
        141.11346
      ],
      [
        -6.08734,
        141.13875
      ],
      [
        -6.24673,
        141.10863
      ],
      [
        -6.2433,
        140.92611
      ],
      [
        -6.31086,
        140.815
      ],
      [
        -6.27457,
        140.68875
      ],
      [
        -6.13006,
        140.66847
      ],
      [
        -6.07386,
        140.55063
      ],
      [
        -5.95958,
        140.57592
      ],
      [
        -5.88876,
        140.65728
      ],
      [
        -5.72603,
        140.67563
      ],
      [
        -5.73673,
        140.815
      ]
    ],
    "neighbors": [
      {
        "glottocode": "mand1444",
        "name": "Mandobo Atas",
        "distanceKm": 41.4
      },
      {
        "glottocode": "nort2916",
        "name": "North Muyu",
        "distanceKm": 51.3
      },
      {
        "glottocode": "mand1445",
        "name": "Mandobo Bawah",
        "distanceKm": 56.7
      },
      {
        "glottocode": "aeky1238",
        "name": "Aekyom",
        "distanceKm": 80.6
      },
      {
        "glottocode": "komb1274",
        "name": "Kombai",
        "distanceKm": 113.6
      }
    ]
  },
  {
    "glottocode": "ngal1298",
    "name": "Ngalum",
    "isocode": "szb",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -4.67682,
    "longitude": 141.03,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Pegunungan (Oksibil, Pegunungan Bintang)",
    "family": "Trans-New Guinea (Ok)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -4.37978,
        141.03
      ],
      [
        -4.32081,
        141.20202
      ],
      [
        -4.48655,
        141.26939
      ],
      [
        -4.60592,
        141.34167
      ],
      [
        -4.75672,
        141.38122
      ],
      [
        -4.82445,
        141.21574
      ],
      [
        -4.9258,
        141.1503
      ],
      [
        -4.95391,
        141.03
      ],
      [
        -4.83808,
        140.95208
      ],
      [
        -4.84451,
        140.81902
      ],
      [
        -4.73368,
        140.78006
      ],
      [
        -4.62896,
        140.81961
      ],
      [
        -4.46649,
        140.76537
      ],
      [
        -4.40853,
        140.90036
      ],
      [
        -4.37978,
        141.03
      ]
    ],
    "neighbors": [
      {
        "glottocode": "tifa1245",
        "name": "Tifal",
        "distanceKm": 49.7
      },
      {
        "glottocode": "abau1245",
        "name": "Abau",
        "distanceKm": 84.9
      },
      {
        "glottocode": "nort2916",
        "name": "North Muyu",
        "distanceKm": 99.7
      },
      {
        "glottocode": "eipo1242",
        "name": "Eipomek",
        "distanceKm": 115.5
      },
      {
        "glottocode": "mand1444",
        "name": "Mandobo Atas",
        "distanceKm": 121.7
      }
    ]
  },
  {
    "glottocode": "tifa1245",
    "name": "Tifal",
    "isocode": "tif",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -5.03899,
    "longitude": 141.293,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Pegunungan / PNG Border",
    "family": "Trans-New Guinea (Ok)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -4.64308,
        141.293
      ],
      [
        -4.76919,
        141.42343
      ],
      [
        -4.85081,
        141.52989
      ],
      [
        -4.96296,
        141.62738
      ],
      [
        -5.08773,
        141.50738
      ],
      [
        -5.20022,
        141.49596
      ],
      [
        -5.28225,
        141.4106
      ],
      [
        -5.21721,
        141.293
      ],
      [
        -5.28646,
        141.17336
      ],
      [
        -5.20877,
        141.07928
      ],
      [
        -5.09072,
        141.06548
      ],
      [
        -4.95998,
        140.94547
      ],
      [
        -4.84226,
        141.04535
      ],
      [
        -4.76498,
        141.16053
      ],
      [
        -4.64308,
        141.293
      ]
    ],
    "neighbors": [
      {
        "glottocode": "ngal1298",
        "name": "Ngalum",
        "distanceKm": 49.7
      },
      {
        "glottocode": "nort2916",
        "name": "North Muyu",
        "distanceKm": 76.1
      },
      {
        "glottocode": "aeky1238",
        "name": "Aekyom",
        "distanceKm": 97.7
      },
      {
        "glottocode": "mand1444",
        "name": "Mandobo Atas",
        "distanceKm": 103.8
      },
      {
        "glottocode": "abau1245",
        "name": "Abau",
        "distanceKm": 118.7
      }
    ]
  },
  {
    "glottocode": "eipo1242",
    "name": "Eipomek",
    "isocode": "eip",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -4.33691,
    "longitude": 140.045,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Pegunungan (Lembah Eipomek)",
    "family": "Trans-New Guinea (Mek)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -4.04867,
        140.045
      ],
      [
        -4.08316,
        140.16755
      ],
      [
        -4.13516,
        140.29871
      ],
      [
        -4.29157,
        140.2442
      ],
      [
        -4.39157,
        140.28518
      ],
      [
        -4.50475,
        140.25607
      ],
      [
        -4.50284,
        140.12514
      ],
      [
        -4.6228,
        140.045
      ],
      [
        -4.60043,
        139.91773
      ],
      [
        -4.49313,
        139.84855
      ],
      [
        -4.41933,
        139.68286
      ],
      [
        -4.26382,
        139.72384
      ],
      [
        -4.14679,
        139.80591
      ],
      [
        -3.98557,
        139.87532
      ],
      [
        -4.04867,
        140.045
      ]
    ],
    "neighbors": [
      {
        "glottocode": "nalc1240",
        "name": "Nalca",
        "distanceKm": 19.9
      },
      {
        "glottocode": "nips1240",
        "name": "Nipsan",
        "distanceKm": 38.8
      },
      {
        "glottocode": "kosa1249",
        "name": "Kosarek Yale",
        "distanceKm": 53.6
      },
      {
        "glottocode": "angg1239",
        "name": "Angguruk Yali",
        "distanceKm": 71.0
      },
      {
        "glottocode": "nini1235",
        "name": "Ninia Yali",
        "distanceKm": 74.2
      }
    ]
  },
  {
    "glottocode": "nalc1240",
    "name": "Nalca",
    "isocode": "nlc",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -4.26068,
    "longitude": 139.883,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Pegunungan (Mek)",
    "family": "Trans-New Guinea (Mek)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -4.00043,
        139.883
      ],
      [
        -3.98397,
        140.01663
      ],
      [
        -4.14041,
        140.03423
      ],
      [
        -4.20754,
        140.11647
      ],
      [
        -4.32187,
        140.15183
      ],
      [
        -4.38296,
        140.03676
      ],
      [
        -4.53188,
        140.01396
      ],
      [
        -4.57456,
        139.883
      ],
      [
        -4.50124,
        139.76683
      ],
      [
        -4.49838,
        139.58411
      ],
      [
        -4.33529,
        139.55519
      ],
      [
        -4.19411,
        139.59055
      ],
      [
        -4.025,
        139.58664
      ],
      [
        -4.01461,
        139.76417
      ],
      [
        -4.00043,
        139.883
      ]
    ],
    "neighbors": [
      {
        "glottocode": "nips1240",
        "name": "Nipsan",
        "distanceKm": 19.4
      },
      {
        "glottocode": "eipo1242",
        "name": "Eipomek",
        "distanceKm": 19.9
      },
      {
        "glottocode": "kosa1249",
        "name": "Kosarek Yale",
        "distanceKm": 34.1
      },
      {
        "glottocode": "angg1239",
        "name": "Angguruk Yali",
        "distanceKm": 51.2
      },
      {
        "glottocode": "nini1235",
        "name": "Ninia Yali",
        "distanceKm": 59.6
      }
    ]
  },
  {
    "glottocode": "kosa1249",
    "name": "Kosarek Yale",
    "isocode": "kkl",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -4.06603,
    "longitude": 139.645,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Pegunungan (Yahukimo)",
    "family": "Trans-New Guinea (Mek)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -3.77161,
        139.645
      ],
      [
        -3.89668,
        139.72676
      ],
      [
        -3.91725,
        139.83204
      ],
      [
        -4.00219,
        139.92539
      ],
      [
        -4.11335,
        139.85284
      ],
      [
        -4.26426,
        139.8942
      ],
      [
        -4.36709,
        139.79035
      ],
      [
        -4.34574,
        139.645
      ],
      [
        -4.41395,
        139.47703
      ],
      [
        -4.27521,
        139.38204
      ],
      [
        -4.12995,
        139.36424
      ],
      [
        -3.98559,
        139.29169
      ],
      [
        -3.9063,
        139.4442
      ],
      [
        -3.84982,
        139.54061
      ],
      [
        -3.77161,
        139.645
      ]
    ],
    "neighbors": [
      {
        "glottocode": "nips1240",
        "name": "Nipsan",
        "distanceKm": 14.8
      },
      {
        "glottocode": "angg1239",
        "name": "Angguruk Yali",
        "distanceKm": 20.9
      },
      {
        "glottocode": "nalc1240",
        "name": "Nalca",
        "distanceKm": 34.1
      },
      {
        "glottocode": "nini1235",
        "name": "Ninia Yali",
        "distanceKm": 53.4
      },
      {
        "glottocode": "eipo1242",
        "name": "Eipomek",
        "distanceKm": 53.6
      }
    ]
  },
  {
    "glottocode": "nips1240",
    "name": "Nipsan",
    "isocode": "nps",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -4.14421,
    "longitude": 139.753,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Pegunungan (Yahukimo)",
    "family": "Trans-New Guinea (Mek)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -3.95449,
        139.753
      ],
      [
        -3.92363,
        139.85951
      ],
      [
        -3.95491,
        139.991
      ],
      [
        -4.09264,
        139.97954
      ],
      [
        -4.21861,
        140.07984
      ],
      [
        -4.3631,
        140.02821
      ],
      [
        -4.40282,
        139.87786
      ],
      [
        -4.52862,
        139.753
      ],
      [
        -4.4409,
        139.60975
      ],
      [
        -4.31287,
        139.54095
      ],
      [
        -4.22039,
        139.41835
      ],
      [
        -4.09086,
        139.51864
      ],
      [
        -4.00514,
        139.57816
      ],
      [
        -3.88554,
        139.62811
      ],
      [
        -3.95449,
        139.753
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kosa1249",
        "name": "Kosarek Yale",
        "distanceKm": 14.8
      },
      {
        "glottocode": "nalc1240",
        "name": "Nalca",
        "distanceKm": 19.4
      },
      {
        "glottocode": "angg1239",
        "name": "Angguruk Yali",
        "distanceKm": 33.5
      },
      {
        "glottocode": "eipo1242",
        "name": "Eipomek",
        "distanceKm": 38.8
      },
      {
        "glottocode": "nini1235",
        "name": "Ninia Yali",
        "distanceKm": 54.4
      }
    ]
  },
  {
    "glottocode": "angg1239",
    "name": "Angguruk Yali",
    "isocode": "yli",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -4.0836,
    "longitude": 139.457,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Pegunungan (Angguruk, Yahukimo)",
    "family": "Trans-New Guinea (Dani)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -3.82723,
        139.457
      ],
      [
        -3.79226,
        139.59766
      ],
      [
        -3.92699,
        139.65389
      ],
      [
        -4.00615,
        139.79718
      ],
      [
        -4.16435,
        139.81168
      ],
      [
        -4.26316,
        139.68274
      ],
      [
        -4.42239,
        139.62057
      ],
      [
        -4.40136,
        139.457
      ],
      [
        -4.30953,
        139.34792
      ],
      [
        -4.28495,
        139.20387
      ],
      [
        -4.13391,
        139.23602
      ],
      [
        -4.03659,
        139.25053
      ],
      [
        -3.9052,
        139.23272
      ],
      [
        -3.90511,
        139.37083
      ],
      [
        -3.82723,
        139.457
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kosa1249",
        "name": "Kosarek Yale",
        "distanceKm": 20.9
      },
      {
        "glottocode": "nips1240",
        "name": "Nipsan",
        "distanceKm": 33.5
      },
      {
        "glottocode": "pass1247",
        "name": "Pass Valley Yali",
        "distanceKm": 41.3
      },
      {
        "glottocode": "nini1235",
        "name": "Ninia Yali",
        "distanceKm": 44.0
      },
      {
        "glottocode": "hupl1238",
        "name": "Hupla",
        "distanceKm": 45.0
      }
    ]
  },
  {
    "glottocode": "nini1235",
    "name": "Ninia Yali",
    "isocode": "nlk",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -4.4737,
    "longitude": 139.39,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Pegunungan (Ninia, Yahukimo)",
    "family": "Trans-New Guinea (Dani)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -4.12983,
        139.39
      ],
      [
        -4.23169,
        139.5069
      ],
      [
        -4.2511,
        139.66999
      ],
      [
        -4.39173,
        139.75023
      ],
      [
        -4.53654,
        139.66618
      ],
      [
        -4.69931,
        139.67377
      ],
      [
        -4.74631,
        139.52168
      ],
      [
        -4.70396,
        139.39
      ],
      [
        -4.74896,
        139.25704
      ],
      [
        -4.60906,
        139.21975
      ],
      [
        -4.51948,
        139.18879
      ],
      [
        -4.40879,
        139.10474
      ],
      [
        -4.34135,
        139.22353
      ],
      [
        -4.22904,
        139.27182
      ],
      [
        -4.12983,
        139.39
      ]
    ],
    "neighbors": [
      {
        "glottocode": "hupl1238",
        "name": "Hupla",
        "distanceKm": 27.9
      },
      {
        "glottocode": "sili1249",
        "name": "Silimo",
        "distanceKm": 43.3
      },
      {
        "glottocode": "angg1239",
        "name": "Angguruk Yali",
        "distanceKm": 44.0
      },
      {
        "glottocode": "lowe1415",
        "name": "Lower Grand Valley Dani",
        "distanceKm": 50.3
      },
      {
        "glottocode": "kosa1249",
        "name": "Kosarek Yale",
        "distanceKm": 53.4
      }
    ]
  },
  {
    "glottocode": "pass1247",
    "name": "Pass Valley Yali",
    "isocode": "yac",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.76869,
    "longitude": 139.26,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Pegunungan (Pass Valley)",
    "family": "Trans-New Guinea (Dani)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -3.48671,
        139.26
      ],
      [
        -3.44437,
        139.41652
      ],
      [
        -3.53979,
        139.54766
      ],
      [
        -3.7084,
        139.52471
      ],
      [
        -3.84511,
        139.59554
      ],
      [
        -3.94694,
        139.484
      ],
      [
        -3.95907,
        139.35188
      ],
      [
        -4.06083,
        139.26
      ],
      [
        -3.96164,
        139.16688
      ],
      [
        -3.89775,
        139.09782
      ],
      [
        -3.83616,
        138.96376
      ],
      [
        -3.71735,
        139.03459
      ],
      [
        -3.58898,
        139.03416
      ],
      [
        -3.4418,
        139.10224
      ],
      [
        -3.48671,
        139.26
      ]
    ],
    "neighbors": [
      {
        "glottocode": "angg1239",
        "name": "Angguruk Yali",
        "distanceKm": 41.3
      },
      {
        "glottocode": "uppe1430",
        "name": "Upper Grand Valley Dani",
        "distanceKm": 44.3
      },
      {
        "glottocode": "wala1269",
        "name": "Walak",
        "distanceKm": 47.0
      },
      {
        "glottocode": "midg1235",
        "name": "Mid Grand Valley Dani",
        "distanceKm": 47.9
      },
      {
        "glottocode": "kosa1249",
        "name": "Kosarek Yale",
        "distanceKm": 54.0
      }
    ]
  },
  {
    "glottocode": "lowe1415",
    "name": "Lower Grand Valley Dani",
    "isocode": "dni",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -4.25684,
    "longitude": 138.992,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Pegunungan (Lembah Baliem Bawah)",
    "family": "Trans-New Guinea (Dani)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -3.90062,
        138.992
      ],
      [
        -3.93288,
        139.14844
      ],
      [
        -4.09792,
        139.19183
      ],
      [
        -4.18501,
        139.30758
      ],
      [
        -4.31693,
        139.25599
      ],
      [
        -4.37909,
        139.14572
      ],
      [
        -4.51305,
        139.11573
      ],
      [
        -4.47475,
        138.992
      ],
      [
        -4.45015,
        138.89865
      ],
      [
        -4.45588,
        138.74172
      ],
      [
        -4.31276,
        138.7463
      ],
      [
        -4.18917,
        138.69471
      ],
      [
        -4.02113,
        138.69561
      ],
      [
        -3.99578,
        138.86593
      ],
      [
        -3.90062,
        138.992
      ]
    ],
    "neighbors": [
      {
        "glottocode": "midg1235",
        "name": "Mid Grand Valley Dani",
        "distanceKm": 22.2
      },
      {
        "glottocode": "hupl1238",
        "name": "Hupla",
        "distanceKm": 22.5
      },
      {
        "glottocode": "sili1249",
        "name": "Silimo",
        "distanceKm": 29.9
      },
      {
        "glottocode": "uppe1430",
        "name": "Upper Grand Valley Dani",
        "distanceKm": 36.3
      },
      {
        "glottocode": "nini1235",
        "name": "Ninia Yali",
        "distanceKm": 50.3
      }
    ]
  },
  {
    "glottocode": "midg1235",
    "name": "Mid Grand Valley Dani",
    "isocode": "dnt",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -4.06322,
    "longitude": 138.945,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Pegunungan (Wamena, Jayawijaya)",
    "family": "Trans-New Guinea (Dani)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -3.71637,
        138.945
      ],
      [
        -3.85039,
        139.04775
      ],
      [
        -3.87474,
        139.18194
      ],
      [
        -4.00598,
        139.1964
      ],
      [
        -4.10467,
        139.12706
      ],
      [
        -4.2397,
        139.16685
      ],
      [
        -4.26877,
        139.04424
      ],
      [
        -4.2905,
        138.945
      ],
      [
        -4.36766,
        138.79802
      ],
      [
        -4.2327,
        138.73194
      ],
      [
        -4.13374,
        138.63526
      ],
      [
        -3.97691,
        138.56591
      ],
      [
        -3.88173,
        138.71685
      ],
      [
        -3.7515,
        138.79451
      ],
      [
        -3.71637,
        138.945
      ]
    ],
    "neighbors": [
      {
        "glottocode": "uppe1430",
        "name": "Upper Grand Valley Dani",
        "distanceKm": 14.2
      },
      {
        "glottocode": "lowe1415",
        "name": "Lower Grand Valley Dani",
        "distanceKm": 22.2
      },
      {
        "glottocode": "wala1269",
        "name": "Walak",
        "distanceKm": 29.1
      },
      {
        "glottocode": "hupl1238",
        "name": "Hupla",
        "distanceKm": 41.3
      },
      {
        "glottocode": "pass1247",
        "name": "Pass Valley Yali",
        "distanceKm": 47.9
      }
    ]
  },
  {
    "glottocode": "uppe1430",
    "name": "Upper Grand Valley Dani",
    "isocode": "dna",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.94368,
    "longitude": 138.901,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Pegunungan (Lembah Baliem Atas)",
    "family": "Trans-New Guinea (Dani)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -3.72648,
        138.901
      ],
      [
        -3.68763,
        139.0246
      ],
      [
        -3.78824,
        139.09638
      ],
      [
        -3.90297,
        139.07978
      ],
      [
        -4.00782,
        139.18266
      ],
      [
        -4.09575,
        139.09215
      ],
      [
        -4.16295,
        139.00685
      ],
      [
        -4.30061,
        138.901
      ],
      [
        -4.2049,
        138.7749
      ],
      [
        -4.1462,
        138.64644
      ],
      [
        -4.03073,
        138.51872
      ],
      [
        -3.88006,
        138.6216
      ],
      [
        -3.73779,
        138.64221
      ],
      [
        -3.64568,
        138.75715
      ],
      [
        -3.72648,
        138.901
      ]
    ],
    "neighbors": [
      {
        "glottocode": "midg1235",
        "name": "Mid Grand Valley Dani",
        "distanceKm": 14.2
      },
      {
        "glottocode": "wala1269",
        "name": "Walak",
        "distanceKm": 14.9
      },
      {
        "glottocode": "lowe1415",
        "name": "Lower Grand Valley Dani",
        "distanceKm": 36.3
      },
      {
        "glottocode": "pass1247",
        "name": "Pass Valley Yali",
        "distanceKm": 44.3
      },
      {
        "glottocode": "hupl1238",
        "name": "Hupla",
        "distanceKm": 55.0
      }
    ]
  },
  {
    "glottocode": "west2594",
    "name": "Western Dani",
    "isocode": "dnw",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.77127,
    "longitude": 138.217,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Pegunungan (Lanny Jaya & Tolikara)",
    "family": "Trans-New Guinea (Dani)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -3.5008,
        138.217
      ],
      [
        -3.54825,
        138.32463
      ],
      [
        -3.65507,
        138.36303
      ],
      [
        -3.70471,
        138.50927
      ],
      [
        -3.82992,
        138.4745
      ],
      [
        -3.93378,
        138.42123
      ],
      [
        -4.10822,
        138.37962
      ],
      [
        -4.07492,
        138.217
      ],
      [
        -4.06552,
        138.07499
      ],
      [
        -4.01303,
        137.91319
      ],
      [
        -3.83246,
        137.94833
      ],
      [
        -3.70216,
        137.91355
      ],
      [
        -3.57582,
        137.97138
      ],
      [
        -3.59095,
        138.12997
      ],
      [
        -3.5008,
        138.217
      ]
    ],
    "neighbors": [
      {
        "glottocode": "demm1245",
        "name": "Dem",
        "distanceKm": 65.1
      },
      {
        "glottocode": "ndug1245",
        "name": "Nduga",
        "distanceKm": 66.8
      },
      {
        "glottocode": "duvl1242",
        "name": "Duvle",
        "distanceKm": 67.6
      },
      {
        "glottocode": "wano1243",
        "name": "Wano",
        "distanceKm": 68.1
      },
      {
        "glottocode": "wala1269",
        "name": "Walak",
        "distanceKm": 69.4
      }
    ]
  },
  {
    "glottocode": "wala1269",
    "name": "Walak",
    "isocode": "wlw",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.8238,
    "longitude": 138.84,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Pegunungan (Yalimo)",
    "family": "Trans-New Guinea (Dani)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -3.5714,
        138.84
      ],
      [
        -3.64718,
        138.92525
      ],
      [
        -3.62781,
        139.08631
      ],
      [
        -3.76039,
        139.11843
      ],
      [
        -3.88539,
        139.11044
      ],
      [
        -4.06509,
        139.14324
      ],
      [
        -4.10449,
        138.97547
      ],
      [
        -4.14553,
        138.84
      ],
      [
        -4.16445,
        138.67559
      ],
      [
        -3.98578,
        138.63643
      ],
      [
        -3.88815,
        138.55745
      ],
      [
        -3.75763,
        138.54946
      ],
      [
        -3.70713,
        138.69337
      ],
      [
        -3.58722,
        138.72581
      ],
      [
        -3.5714,
        138.84
      ]
    ],
    "neighbors": [
      {
        "glottocode": "uppe1430",
        "name": "Upper Grand Valley Dani",
        "distanceKm": 14.9
      },
      {
        "glottocode": "midg1235",
        "name": "Mid Grand Valley Dani",
        "distanceKm": 29.1
      },
      {
        "glottocode": "pass1247",
        "name": "Pass Valley Yali",
        "distanceKm": 47.0
      },
      {
        "glottocode": "lowe1415",
        "name": "Lower Grand Valley Dani",
        "distanceKm": 51.0
      },
      {
        "glottocode": "west2594",
        "name": "Western Dani",
        "distanceKm": 69.4
      }
    ]
  },
  {
    "glottocode": "ndug1245",
    "name": "Nduga",
    "isocode": "ndx",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -4.34043,
    "longitude": 138.411,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Pegunungan (Kabupaten Nduga)",
    "family": "Trans-New Guinea (Dani)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -4.1298,
        138.411
      ],
      [
        -4.04148,
        138.55538
      ],
      [
        -4.14976,
        138.65077
      ],
      [
        -4.27599,
        138.69412
      ],
      [
        -4.42818,
        138.79657
      ],
      [
        -4.5355,
        138.65632
      ],
      [
        -4.62021,
        138.54612
      ],
      [
        -4.70392,
        138.411
      ],
      [
        -4.55875,
        138.30556
      ],
      [
        -4.50773,
        138.20061
      ],
      [
        -4.40375,
        138.13278
      ],
      [
        -4.30043,
        138.23522
      ],
      [
        -4.17754,
        138.20616
      ],
      [
        -4.10294,
        138.2963
      ],
      [
        -4.1298,
        138.411
      ]
    ],
    "neighbors": [
      {
        "glottocode": "lowe1415",
        "name": "Lower Grand Valley Dani",
        "distanceKm": 65.1
      },
      {
        "glottocode": "midg1235",
        "name": "Mid Grand Valley Dani",
        "distanceKm": 66.8
      },
      {
        "glottocode": "west2594",
        "name": "Western Dani",
        "distanceKm": 66.8
      },
      {
        "glottocode": "sili1249",
        "name": "Silimo",
        "distanceKm": 68.8
      },
      {
        "glottocode": "uppe1430",
        "name": "Upper Grand Valley Dani",
        "distanceKm": 70.0
      }
    ]
  },
  {
    "glottocode": "sili1249",
    "name": "Silimo",
    "isocode": "wul",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -4.52544,
    "longitude": 139.003,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Pegunungan (Yahukimo)",
    "family": "Trans-New Guinea (Dani)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -4.17617,
        139.003
      ],
      [
        -4.23368,
        139.14394
      ],
      [
        -4.34009,
        139.23614
      ],
      [
        -4.43752,
        139.3894
      ],
      [
        -4.59392,
        139.30396
      ],
      [
        -4.70882,
        139.23367
      ],
      [
        -4.83702,
        139.15352
      ],
      [
        -4.7503,
        139.003
      ],
      [
        -4.75095,
        138.89406
      ],
      [
        -4.69806,
        138.78587
      ],
      [
        -4.56528,
        138.82792
      ],
      [
        -4.46616,
        138.74248
      ],
      [
        -4.35086,
        138.78339
      ],
      [
        -4.31975,
        138.90364
      ],
      [
        -4.17617,
        139.003
      ]
    ],
    "neighbors": [
      {
        "glottocode": "hupl1238",
        "name": "Hupla",
        "distanceKm": 25.4
      },
      {
        "glottocode": "lowe1415",
        "name": "Lower Grand Valley Dani",
        "distanceKm": 29.9
      },
      {
        "glottocode": "nini1235",
        "name": "Ninia Yali",
        "distanceKm": 43.3
      },
      {
        "glottocode": "midg1235",
        "name": "Mid Grand Valley Dani",
        "distanceKm": 51.8
      },
      {
        "glottocode": "uppe1430",
        "name": "Upper Grand Valley Dani",
        "distanceKm": 65.7
      }
    ]
  },
  {
    "glottocode": "hupl1238",
    "name": "Hupla",
    "isocode": "hap",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -4.36349,
    "longitude": 139.164,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Pegunungan (Jayawijaya)",
    "family": "Trans-New Guinea (Dani)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -4.02636,
        139.164
      ],
      [
        -4.09433,
        139.294
      ],
      [
        -4.12088,
        139.46911
      ],
      [
        -4.2974,
        139.4544
      ],
      [
        -4.42451,
        139.43211
      ],
      [
        -4.56758,
        139.42067
      ],
      [
        -4.55243,
        139.25525
      ],
      [
        -4.60049,
        139.164
      ],
      [
        -4.6116,
        139.04417
      ],
      [
        -4.47884,
        139.01893
      ],
      [
        -4.42515,
        138.89304
      ],
      [
        -4.29675,
        138.87075
      ],
      [
        -4.20962,
        138.97049
      ],
      [
        -4.03516,
        139.00542
      ],
      [
        -4.02636,
        139.164
      ]
    ],
    "neighbors": [
      {
        "glottocode": "lowe1415",
        "name": "Lower Grand Valley Dani",
        "distanceKm": 22.5
      },
      {
        "glottocode": "sili1249",
        "name": "Silimo",
        "distanceKm": 25.4
      },
      {
        "glottocode": "nini1235",
        "name": "Ninia Yali",
        "distanceKm": 27.9
      },
      {
        "glottocode": "midg1235",
        "name": "Mid Grand Valley Dani",
        "distanceKm": 41.3
      },
      {
        "glottocode": "angg1239",
        "name": "Angguruk Yali",
        "distanceKm": 45.0
      }
    ]
  },
  {
    "glottocode": "wano1243",
    "name": "Wano",
    "isocode": "wno",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.47858,
    "longitude": 137.678,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Tengah (Puncak Jaya)",
    "family": "Trans-New Guinea (Dani)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -3.18495,
        137.678
      ],
      [
        -3.13885,
        137.84191
      ],
      [
        -3.3026,
        137.89908
      ],
      [
        -3.42229,
        137.92509
      ],
      [
        -3.54764,
        137.98112
      ],
      [
        -3.60259,
        137.83379
      ],
      [
        -3.6856,
        137.77788
      ],
      [
        -3.75908,
        137.678
      ],
      [
        -3.65612,
        137.59234
      ],
      [
        -3.66056,
        137.44939
      ],
      [
        -3.55004,
        137.36432
      ],
      [
        -3.41988,
        137.42036
      ],
      [
        -3.24462,
        137.38409
      ],
      [
        -3.16833,
        137.52831
      ],
      [
        -3.18495,
        137.678
      ]
    ],
    "neighbors": [
      {
        "glottocode": "demm1245",
        "name": "Dem",
        "distanceKm": 27.5
      },
      {
        "glottocode": "iauu1242",
        "name": "Iau",
        "distanceKm": 37.1
      },
      {
        "glottocode": "duvl1242",
        "name": "Duvle",
        "distanceKm": 43.0
      },
      {
        "glottocode": "west2594",
        "name": "Western Dani",
        "distanceKm": 68.1
      },
      {
        "glottocode": "obok1239",
        "name": "Obokuitai",
        "distanceKm": 71.9
      }
    ]
  },
  {
    "glottocode": "demm1245",
    "name": "Dem",
    "isocode": "dem",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.72183,
    "longitude": 137.632,
    "isNational": true,
    "isFromCsv": false,
    "island": "Papua",
    "province": "Papua Tengah (Sungai Rouffaer / Puncak Jaya)",
    "family": "Trans-New Guinea",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -3.36147,
        137.632
      ],
      [
        -3.48258,
        137.74746
      ],
      [
        -3.57671,
        137.81436
      ],
      [
        -3.65575,
        137.92215
      ],
      [
        -3.76498,
        137.82146
      ],
      [
        -3.86473,
        137.81157
      ],
      [
        -3.98469,
        137.75886
      ],
      [
        -3.9356,
        137.632
      ],
      [
        -3.99985,
        137.49783
      ],
      [
        -3.93467,
        137.36454
      ],
      [
        -3.7835,
        137.36123
      ],
      [
        -3.63723,
        137.26054
      ],
      [
        -3.50677,
        137.36176
      ],
      [
        -3.46742,
        137.50922
      ],
      [
        -3.36147,
        137.632
      ]
    ],
    "neighbors": [
      {
        "glottocode": "wano1243",
        "name": "Wano",
        "distanceKm": 27.5
      },
      {
        "glottocode": "dama1272",
        "name": "Damal",
        "distanceKm": 52.4
      },
      {
        "glottocode": "iauu1242",
        "name": "Iau",
        "distanceKm": 64.4
      },
      {
        "glottocode": "west2594",
        "name": "Western Dani",
        "distanceKm": 65.1
      },
      {
        "glottocode": "duvl1242",
        "name": "Duvle",
        "distanceKm": 67.0
      }
    ]
  },
  {
    "glottocode": "taga1270",
    "name": "Tagalog",
    "isocode": "tgl",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 14.06,
    "longitude": 121.747,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Filipina (Luzon)",
    "family": "Austronesian (Central Philippine)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        14.26984,
        121.747
      ],
      [
        14.22371,
        121.82827
      ],
      [
        14.21169,
        121.94309
      ],
      [
        14.09665,
        121.91254
      ],
      [
        14.01595,
        121.94595
      ],
      [
        13.89832,
        121.95601
      ],
      [
        13.88307,
        121.83483
      ],
      [
        13.78637,
        121.747
      ],
      [
        13.78811,
        121.61202
      ],
      [
        13.91025,
        121.55342
      ],
      [
        13.98907,
        121.42663
      ],
      [
        14.12353,
        121.46004
      ],
      [
        14.19976,
        121.56634
      ],
      [
        14.31867,
        121.61858
      ],
      [
        14.26984,
        121.747
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "cebu1242",
    "name": "Cebuano",
    "isocode": "ceb",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 8.38799,
    "longitude": 124.367,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Filipina (Visayas & Mindanao)",
    "family": "Austronesian (Central Philippine)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        8.55965,
        124.367
      ],
      [
        8.60587,
        124.47306
      ],
      [
        8.49506,
        124.50271
      ],
      [
        8.43416,
        124.57146
      ],
      [
        8.32667,
        124.63856
      ],
      [
        8.25513,
        124.53541
      ],
      [
        8.13103,
        124.49208
      ],
      [
        8.07617,
        124.367
      ],
      [
        8.17028,
        124.26102
      ],
      [
        8.19361,
        124.12062
      ],
      [
        8.32657,
        124.09501
      ],
      [
        8.43425,
        124.16211
      ],
      [
        8.55657,
        124.15332
      ],
      [
        8.56663,
        124.28004
      ],
      [
        8.55965,
        124.367
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "ilok1237",
    "name": "Iloko",
    "isocode": "ilo",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 15.9361,
    "longitude": 120.993,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Filipina (Luzon Utara)",
    "family": "Austronesian (Northern Luzon)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        16.18198,
        120.993
      ],
      [
        16.10156,
        121.07587
      ],
      [
        16.07338,
        121.17202
      ],
      [
        16.0012,
        121.28962
      ],
      [
        15.88531,
        121.22441
      ],
      [
        15.75347,
        121.23116
      ],
      [
        15.65088,
        121.13585
      ],
      [
        15.69851,
        120.993
      ],
      [
        15.66597,
        120.85771
      ],
      [
        15.77193,
        120.77891
      ],
      [
        15.89362,
        120.79943
      ],
      [
        15.9929,
        120.73422
      ],
      [
        16.05491,
        120.83806
      ],
      [
        16.08647,
        120.91769
      ],
      [
        16.18198,
        120.993
      ]
    ],
    "neighbors": [
      {
        "glottocode": "aben1249",
        "name": "Abenlen Ayta",
        "distanceKm": 102.9
      }
    ]
  },
  {
    "glottocode": "chav1241",
    "name": "Chavacano",
    "isocode": "cbk",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 7.435034,
    "longitude": 122.18849,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Filipina (Zamboanga)",
    "family": "Creole (Spanish-based)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        7.63427,
        122.18849
      ],
      [
        7.64609,
        122.29099
      ],
      [
        7.62728,
        122.43161
      ],
      [
        7.48845,
        122.42451
      ],
      [
        7.36926,
        122.47912
      ],
      [
        7.23823,
        122.43737
      ],
      [
        7.22914,
        122.28848
      ],
      [
        7.15079,
        122.18849
      ],
      [
        7.2105,
        122.07944
      ],
      [
        7.32584,
        122.0504
      ],
      [
        7.38087,
        121.94915
      ],
      [
        7.47684,
        122.00377
      ],
      [
        7.53967,
        122.05617
      ],
      [
        7.66474,
        122.07693
      ],
      [
        7.63427,
        122.18849
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "cham1312",
    "name": "Chamorro",
    "isocode": "cha",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 13.438011,
    "longitude": 144.74474,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Guam & Mariana Utara",
    "family": "Austronesian (Malayo-Polynesian)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        13.68579,
        144.74474
      ],
      [
        13.7273,
        144.88797
      ],
      [
        13.59214,
        144.94345
      ],
      [
        13.50314,
        145.03812
      ],
      [
        13.36917,
        145.05483
      ],
      [
        13.30363,
        144.91799
      ],
      [
        13.19771,
        144.86372
      ],
      [
        13.20231,
        144.74474
      ],
      [
        13.2917,
        144.6723
      ],
      [
        13.2907,
        144.55481
      ],
      [
        13.39556,
        144.5535
      ],
      [
        13.47676,
        144.57021
      ],
      [
        13.60507,
        144.52936
      ],
      [
        13.63331,
        144.64804
      ],
      [
        13.68579,
        144.74474
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "fiji1243",
    "name": "Fijian",
    "isocode": "fij",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -18.0,
    "longitude": 178.33,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Fiji",
    "family": "Austronesian (Central Pacific)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -17.67068,
        178.33
      ],
      [
        -17.77572,
        178.44357
      ],
      [
        -17.82274,
        178.56371
      ],
      [
        -17.93355,
        178.63613
      ],
      [
        -18.04456,
        178.53526
      ],
      [
        -18.15536,
        178.53484
      ],
      [
        -18.20239,
        178.43248
      ],
      [
        -18.15415,
        178.33
      ],
      [
        -18.21131,
        178.223
      ],
      [
        -18.12419,
        178.16626
      ],
      [
        -18.04113,
        178.14052
      ],
      [
        -17.93697,
        178.03965
      ],
      [
        -17.85392,
        178.13739
      ],
      [
        -17.76679,
        178.21191
      ],
      [
        -17.67068,
        178.33
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "samo1305",
    "name": "Samoan",
    "isocode": "smo",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -13.92,
    "longitude": -171.83,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Samoa",
    "family": "Austronesian (Polynesian)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -13.67482,
        -171.83
      ],
      [
        -13.67566,
        -171.70877
      ],
      [
        -13.74233,
        -171.60047
      ],
      [
        -13.87894,
        -171.64466
      ],
      [
        -13.97197,
        -171.59539
      ],
      [
        -14.05567,
        -171.65473
      ],
      [
        -14.05636,
        -171.76234
      ],
      [
        -14.1583,
        -171.83
      ],
      [
        -14.11125,
        -171.92489
      ],
      [
        -14.04377,
        -171.9899
      ],
      [
        -13.98652,
        -172.13028
      ],
      [
        -13.86439,
        -172.08101
      ],
      [
        -13.75423,
        -172.04416
      ],
      [
        -13.62077,
        -171.97846
      ],
      [
        -13.67482,
        -171.83
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "tahi1242",
    "name": "Tahitian",
    "isocode": "tah",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -17.6485,
    "longitude": -149.45,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Polinesia Prancis (Tahiti)",
    "family": "Austronesian (Polynesian)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -17.39373,
        -149.45
      ],
      [
        -17.40508,
        -149.32699
      ],
      [
        -17.54229,
        -149.31024
      ],
      [
        -17.59919,
        -149.22329
      ],
      [
        -17.69649,
        -149.22934
      ],
      [
        -17.74467,
        -149.32345
      ],
      [
        -17.871,
        -149.33756
      ],
      [
        -17.87721,
        -149.45
      ],
      [
        -17.84068,
        -149.54712
      ],
      [
        -17.84373,
        -149.7069
      ],
      [
        -17.70677,
        -149.71793
      ],
      [
        -17.58891,
        -149.72398
      ],
      [
        -17.44323,
        -149.72011
      ],
      [
        -17.4354,
        -149.55769
      ],
      [
        -17.39373,
        -149.45
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "maor1246",
    "name": "Maori",
    "isocode": "mri",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -38.2881,
    "longitude": 176.541,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Selandia Baru (Aotearoa)",
    "family": "Austronesian (Polynesian)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -38.03187,
        176.541
      ],
      [
        -38.1444,
        176.62917
      ],
      [
        -38.15437,
        176.75464
      ],
      [
        -38.23929,
        176.81343
      ],
      [
        -38.32425,
        176.74276
      ],
      [
        -38.44978,
        176.79929
      ],
      [
        -38.51039,
        176.67739
      ],
      [
        -38.51534,
        176.541
      ],
      [
        -38.57999,
        176.36191
      ],
      [
        -38.45582,
        176.27306
      ],
      [
        -38.34688,
        176.21291
      ],
      [
        -38.21666,
        176.14224
      ],
      [
        -38.14833,
        176.31771
      ],
      [
        -38.0748,
        176.41013
      ],
      [
        -38.03187,
        176.541
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "hawa1245",
    "name": "Hawaiian",
    "isocode": "haw",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 19.6297,
    "longitude": -155.43,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Hawaii (Amerika Serikat)",
    "family": "Austronesian (Polynesian)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        19.78305,
        -155.43
      ],
      [
        19.8215,
        -155.33193
      ],
      [
        19.77206,
        -155.24047
      ],
      [
        19.66861,
        -155.249
      ],
      [
        19.5688,
        -155.14671
      ],
      [
        19.46487,
        -155.21055
      ],
      [
        19.41483,
        -155.32014
      ],
      [
        19.29957,
        -155.43
      ],
      [
        19.3859,
        -155.55465
      ],
      [
        19.47062,
        -155.64179
      ],
      [
        19.56103,
        -155.74944
      ],
      [
        19.67638,
        -155.64714
      ],
      [
        19.76631,
        -155.61187
      ],
      [
        19.85043,
        -155.54286
      ],
      [
        19.78305,
        -155.43
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "maga1260",
    "name": "Magahi",
    "isocode": "mag",
    "level": "language",
    "macroarea": "Eurasia",
    "latitude": 25.0915,
    "longitude": 85.3335,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "India (Bihar)",
    "family": "Indo-Aryan",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        25.30827,
        85.3335
      ],
      [
        25.30934,
        85.44934
      ],
      [
        25.20995,
        85.49751
      ],
      [
        25.15563,
        85.64374
      ],
      [
        25.02926,
        85.63463
      ],
      [
        24.93842,
        85.54546
      ],
      [
        24.7935,
        85.49196
      ],
      [
        24.8248,
        85.3335
      ],
      [
        24.87374,
        85.21771
      ],
      [
        24.90851,
        85.08012
      ],
      [
        25.04804,
        85.12327
      ],
      [
        25.13684,
        85.11416
      ],
      [
        25.23986,
        85.12807
      ],
      [
        25.2291,
        85.26033
      ],
      [
        25.30827,
        85.3335
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "bhoj1244",
    "name": "Bhojpuri",
    "isocode": "bho",
    "level": "language",
    "macroarea": "Eurasia",
    "latitude": 26.458455,
    "longitude": 84.817115,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "India / Nepal",
    "family": "Indo-Aryan",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        26.71672,
        84.81712
      ],
      [
        26.64397,
        84.9169
      ],
      [
        26.64603,
        85.07985
      ],
      [
        26.52324,
        85.13418
      ],
      [
        26.40341,
        85.08648
      ],
      [
        26.25538,
        85.10155
      ],
      [
        26.22597,
        84.94217
      ],
      [
        26.23324,
        84.81712
      ],
      [
        26.20837,
        84.68259
      ],
      [
        26.34459,
        84.65763
      ],
      [
        26.41566,
        84.60768
      ],
      [
        26.511,
        84.55998
      ],
      [
        26.55683,
        84.67933
      ],
      [
        26.66157,
        84.70786
      ],
      [
        26.71672,
        84.81712
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "beng1280",
    "name": "Bengali",
    "isocode": "ben",
    "level": "language",
    "macroarea": "Eurasia",
    "latitude": 24.0,
    "longitude": 90.0,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Bangladesh & India",
    "family": "Indo-Aryan",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        24.22068,
        90.0
      ],
      [
        24.27927,
        90.14721
      ],
      [
        24.1855,
        90.25462
      ],
      [
        24.05422,
        90.26002
      ],
      [
        23.9298,
        90.3367
      ],
      [
        23.8467,
        90.21043
      ],
      [
        23.81302,
        90.09856
      ],
      [
        23.7372,
        90.0
      ],
      [
        23.84367,
        89.91759
      ],
      [
        23.88406,
        89.84085
      ],
      [
        23.94663,
        89.74406
      ],
      [
        24.03738,
        89.82074
      ],
      [
        24.14814,
        89.79666
      ],
      [
        24.24862,
        89.86894
      ],
      [
        24.22068,
        90.0
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "burm1310",
    "name": "Burmese",
    "isocode": "mya",
    "level": "language",
    "macroarea": "Eurasia",
    "latitude": 20.7926,
    "longitude": 93.9665,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Myanmar",
    "family": "Sino-Tibetan",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        21.10682,
        93.9665
      ],
      [
        21.06133,
        94.10493
      ],
      [
        20.93896,
        94.16281
      ],
      [
        20.85964,
        94.2807
      ],
      [
        20.74099,
        94.20838
      ],
      [
        20.67376,
        94.1259
      ],
      [
        20.56647,
        94.08299
      ],
      [
        20.62334,
        93.9665
      ],
      [
        20.62573,
        93.88054
      ],
      [
        20.63751,
        93.75848
      ],
      [
        20.75206,
        93.77651
      ],
      [
        20.84857,
        93.70419
      ],
      [
        20.97521,
        93.72157
      ],
      [
        21.00207,
        93.8586
      ],
      [
        21.10682,
        93.9665
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "thai1261",
    "name": "Thai",
    "isocode": "tha",
    "level": "language",
    "macroarea": "Eurasia",
    "latitude": 14.192,
    "longitude": 100.671,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Thailand",
    "family": "Kra-Dai",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        14.48555,
        100.671
      ],
      [
        14.39167,
        100.77018
      ],
      [
        14.36951,
        100.90059
      ],
      [
        14.24055,
        100.89041
      ],
      [
        14.15277,
        100.84829
      ],
      [
        14.04014,
        100.86743
      ],
      [
        14.03833,
        100.74733
      ],
      [
        14.00207,
        100.671
      ],
      [
        13.95607,
        100.5538
      ],
      [
        14.06806,
        100.5107
      ],
      [
        14.13297,
        100.40422
      ],
      [
        14.26035,
        100.3621
      ],
      [
        14.34158,
        100.47753
      ],
      [
        14.47392,
        100.53096
      ],
      [
        14.48555,
        100.671
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "laoo1244",
    "name": "Lao",
    "isocode": "lao",
    "level": "language",
    "macroarea": "Eurasia",
    "latitude": 19.0,
    "longitude": 102.46,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Laos",
    "family": "Kra-Dai",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        19.20578,
        102.46
      ],
      [
        19.24113,
        102.58281
      ],
      [
        19.12876,
        102.63076
      ],
      [
        19.03698,
        102.63137
      ],
      [
        18.94627,
        102.70896
      ],
      [
        18.88935,
        102.60675
      ],
      [
        18.82043,
        102.55146
      ],
      [
        18.7223,
        102.46
      ],
      [
        18.80553,
        102.36095
      ],
      [
        18.82732,
        102.23099
      ],
      [
        18.9294,
        102.13285
      ],
      [
        19.05386,
        102.21044
      ],
      [
        19.19079,
        102.20697
      ],
      [
        19.25603,
        102.3296
      ],
      [
        19.20578,
        102.46
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "viet1252",
    "name": "Vietnamese",
    "isocode": "vie",
    "level": "language",
    "macroarea": "Eurasia",
    "latitude": 20.681188,
    "longitude": 105.774071,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Vietnam",
    "family": "Austroasiatic (Vietic)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        20.93324,
        105.77407
      ],
      [
        20.86012,
        105.86617
      ],
      [
        20.78179,
        105.90891
      ],
      [
        20.73567,
        106.02922
      ],
      [
        20.63905,
        105.97139
      ],
      [
        20.54903,
        105.95121
      ],
      [
        20.41596,
        105.9106
      ],
      [
        20.44977,
        105.77407
      ],
      [
        20.42452,
        105.64195
      ],
      [
        20.48035,
        105.50488
      ],
      [
        20.62809,
        105.5254
      ],
      [
        20.74664,
        105.46757
      ],
      [
        20.85047,
        105.54717
      ],
      [
        20.85155,
        105.68638
      ],
      [
        20.93324,
        105.77407
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "khme1253",
    "name": "Khmer",
    "isocode": "khm",
    "level": "language",
    "macroarea": "Eurasia",
    "latitude": 12.0515,
    "longitude": 105.015,
    "isNational": false,
    "isFromCsv": false,
    "island": "Lainnya",
    "province": "Kamboja",
    "family": "Austroasiatic (Khmeric)",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        12.24714,
        105.015
      ],
      [
        12.19763,
        105.08696
      ],
      [
        12.20944,
        105.21752
      ],
      [
        12.09711,
        105.21932
      ],
      [
        12.00118,
        105.24043
      ],
      [
        11.85824,
        105.2628
      ],
      [
        11.83189,
        105.12314
      ],
      [
        11.76367,
        105.015
      ],
      [
        11.76204,
        104.87246
      ],
      [
        11.908,
        104.831
      ],
      [
        11.98952,
        104.73734
      ],
      [
        12.10876,
        104.75846
      ],
      [
        12.15968,
        104.87629
      ],
      [
        12.26748,
        104.90864
      ],
      [
        12.24714,
        105.015
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "aari1239",
    "name": "Aari",
    "isocode": "aiw",
    "level": "language",
    "macroarea": "Africa",
    "latitude": 5.95034,
    "longitude": 36.5721,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Africa / Global",
    "family": "Africa Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        6.1188,
        36.5721
      ],
      [
        6.1898,
        36.68804
      ],
      [
        6.08913,
        36.74707
      ],
      [
        6.00371,
        36.80722
      ],
      [
        5.87856,
        36.88831
      ],
      [
        5.79355,
        36.76978
      ],
      [
        5.69337,
        36.69652
      ],
      [
        5.63532,
        36.5721
      ],
      [
        5.75421,
        36.47714
      ],
      [
        5.78768,
        36.36703
      ],
      [
        5.89613,
        36.33331
      ],
      [
        5.98614,
        36.4144
      ],
      [
        6.09499,
        36.38973
      ],
      [
        6.12897,
        36.48561
      ],
      [
        6.1188,
        36.5721
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "aasa1238",
    "name": "Aasax",
    "isocode": "aas",
    "level": "language",
    "macroarea": "Africa",
    "latitude": -4.00679,
    "longitude": 36.8648,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Africa / Global",
    "family": "Africa Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -3.72613,
        36.8648
      ],
      [
        -3.79025,
        36.96933
      ],
      [
        -3.85013,
        37.06172
      ],
      [
        -3.93318,
        37.18808
      ],
      [
        -4.06327,
        37.11285
      ],
      [
        -4.17956,
        37.08198
      ],
      [
        -4.28091,
        36.99713
      ],
      [
        -4.2096,
        36.8648
      ],
      [
        -4.22585,
        36.75905
      ],
      [
        -4.15158,
        36.6828
      ],
      [
        -4.04077,
        36.71557
      ],
      [
        -3.95568,
        36.64034
      ],
      [
        -3.87812,
        36.70306
      ],
      [
        -3.84531,
        36.78685
      ],
      [
        -3.72613,
        36.8648
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "abad1241",
    "name": "Abadi",
    "isocode": "kbt",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -9.03389,
    "longitude": 146.992,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Papunesia / Global",
    "family": "Papunesia Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -8.77764,
        146.992
      ],
      [
        -8.8008,
        147.10566
      ],
      [
        -8.82591,
        147.25608
      ],
      [
        -8.97812,
        147.2394
      ],
      [
        -9.09269,
        147.25287
      ],
      [
        -9.21497,
        147.22191
      ],
      [
        -9.20274,
        147.07433
      ],
      [
        -9.26112,
        146.992
      ],
      [
        -9.2364,
        146.89325
      ],
      [
        -9.12735,
        146.87333
      ],
      [
        -9.08571,
        146.76213
      ],
      [
        -8.98511,
        146.77559
      ],
      [
        -8.91352,
        146.83917
      ],
      [
        -8.76714,
        146.86193
      ],
      [
        -8.77764,
        146.992
      ]
    ],
    "neighbors": [
      {
        "glottocode": "aeka1244",
        "name": "Aeka",
        "distanceKm": 111.9
      }
    ]
  },
  {
    "glottocode": "abag1245",
    "name": "Abaga",
    "isocode": "abg",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -6.12028,
    "longitude": 145.665,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Papunesia / Global",
    "family": "Papunesia Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -5.85918,
        145.665
      ],
      [
        -5.82237,
        145.80929
      ],
      [
        -5.96911,
        145.85565
      ],
      [
        -6.0651,
        145.90815
      ],
      [
        -6.18156,
        145.935
      ],
      [
        -6.22841,
        145.80137
      ],
      [
        -6.31387,
        145.75876
      ],
      [
        -6.34265,
        145.665
      ],
      [
        -6.25796,
        145.59832
      ],
      [
        -6.27055,
        145.47549
      ],
      [
        -6.17268,
        145.4341
      ],
      [
        -6.07397,
        145.46095
      ],
      [
        -5.92697,
        145.4212
      ],
      [
        -5.87828,
        145.54779
      ],
      [
        -5.85918,
        145.665
      ]
    ],
    "neighbors": [
      {
        "glottocode": "adze1240",
        "name": "Adzera",
        "distanceKm": 75.9
      }
    ]
  },
  {
    "glottocode": "abai1240",
    "name": "Abai Sungai",
    "isocode": "abf",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 5.55394,
    "longitude": 118.306,
    "isNational": true,
    "isFromCsv": true,
    "island": "Kalimantan",
    "province": "Kalimantan / Sabah",
    "family": "Austronesian",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        5.9368,
        118.306
      ],
      [
        5.80058,
        118.42534
      ],
      [
        5.72426,
        118.52058
      ],
      [
        5.62292,
        118.60964
      ],
      [
        5.51096,
        118.49521
      ],
      [
        5.40042,
        118.49941
      ],
      [
        5.31264,
        118.42275
      ],
      [
        5.36268,
        118.306
      ],
      [
        5.28331,
        118.17506
      ],
      [
        5.3663,
        118.06959
      ],
      [
        5.49516,
        118.04727
      ],
      [
        5.63871,
        117.93284
      ],
      [
        5.75839,
        118.04842
      ],
      [
        5.82992,
        118.17247
      ],
      [
        5.9368,
        118.306
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "aban1242",
    "name": "Abanyom",
    "isocode": "abm",
    "level": "language",
    "macroarea": "Africa",
    "latitude": 6.30619,
    "longitude": 8.63055,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Africa / Global",
    "family": "Africa Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        6.52263,
        8.63055
      ],
      [
        6.49753,
        8.72326
      ],
      [
        6.46163,
        8.82665
      ],
      [
        6.34102,
        8.78409
      ],
      [
        6.2605,
        8.83195
      ],
      [
        6.16026,
        8.81465
      ],
      [
        6.14975,
        8.70634
      ],
      [
        6.03916,
        8.63055
      ],
      [
        6.06194,
        8.51221
      ],
      [
        6.16019,
        8.44635
      ],
      [
        6.23344,
        8.30987
      ],
      [
        6.36808,
        8.35772
      ],
      [
        6.4617,
        8.43435
      ],
      [
        6.58535,
        8.4953
      ],
      [
        6.52263,
        8.63055
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "abau1245",
    "name": "Abau",
    "isocode": "aau",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.97222,
    "longitude": 141.324,
    "isNational": true,
    "isFromCsv": true,
    "island": "Papua",
    "province": "Papua (Perbatasan Sepik)",
    "family": "Sepik",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -3.73839,
        141.324
      ],
      [
        -3.71363,
        141.44883
      ],
      [
        -3.85679,
        141.46909
      ],
      [
        -3.91704,
        141.56635
      ],
      [
        -4.03751,
        141.61074
      ],
      [
        -4.11214,
        141.49988
      ],
      [
        -4.27324,
        141.46931
      ],
      [
        -4.31252,
        141.324
      ],
      [
        -4.2309,
        141.19913
      ],
      [
        -4.21475,
        141.01914
      ],
      [
        -4.04479,
        141.00527
      ],
      [
        -3.90975,
        141.04966
      ],
      [
        -3.75418,
        141.04993
      ],
      [
        -3.75597,
        141.21961
      ],
      [
        -3.73839,
        141.324
      ]
    ],
    "neighbors": [
      {
        "glottocode": "daon1243",
        "name": "Daonda",
        "distanceKm": 74.0
      },
      {
        "glottocode": "ngal1298",
        "name": "Ngalum",
        "distanceKm": 84.9
      },
      {
        "glottocode": "wari1266",
        "name": "Waris",
        "distanceKm": 102.4
      },
      {
        "glottocode": "manm1266",
        "name": "Manem",
        "distanceKm": 114.2
      },
      {
        "glottocode": "tifa1245",
        "name": "Tifal",
        "distanceKm": 118.7
      }
    ]
  },
  {
    "glottocode": "foau1240",
    "name": "Abawiri",
    "isocode": "flh",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.04582,
    "longitude": 139.213,
    "isNational": true,
    "isFromCsv": true,
    "island": "Papua",
    "province": "Papua (Mamberamo Raya)",
    "family": "Lakes Plain",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -2.76173,
        139.213
      ],
      [
        -2.87362,
        139.29604
      ],
      [
        -2.88502,
        139.41492
      ],
      [
        -2.97627,
        139.51816
      ],
      [
        -3.10006,
        139.45097
      ],
      [
        -3.26347,
        139.48631
      ],
      [
        -3.36485,
        139.36685
      ],
      [
        -3.33585,
        139.213
      ],
      [
        -3.39089,
        139.04659
      ],
      [
        -3.24298,
        138.96542
      ],
      [
        -3.10402,
        138.95764
      ],
      [
        -2.9723,
        138.89044
      ],
      [
        -2.9055,
        139.0368
      ],
      [
        -2.84757,
        139.1174
      ],
      [
        -2.76173,
        139.213
      ]
    ],
    "neighbors": [
      {
        "glottocode": "abin1243",
        "name": "Abinomn",
        "distanceKm": 38.3
      },
      {
        "glottocode": "pass1247",
        "name": "Pass Valley Yali",
        "distanceKm": 80.5
      },
      {
        "glottocode": "bong1287",
        "name": "Bonggo",
        "distanceKm": 94.2
      },
      {
        "glottocode": "beri1254",
        "name": "Berik",
        "distanceKm": 94.6
      },
      {
        "glottocode": "wala1269",
        "name": "Walak",
        "distanceKm": 95.9
      }
    ]
  },
  {
    "glottocode": "abaz1241",
    "name": "Abaza",
    "isocode": "abq",
    "level": "language",
    "macroarea": "Eurasia",
    "latitude": 44.25,
    "longitude": 42.0,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Eurasia / Global",
    "family": "Eurasia Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        44.42119,
        42.0
      ],
      [
        44.45644,
        42.13879
      ],
      [
        44.42499,
        42.30633
      ],
      [
        44.29906,
        42.3001
      ],
      [
        44.18255,
        42.41255
      ],
      [
        44.05999,
        42.33264
      ],
      [
        44.03272,
        42.14608
      ],
      [
        43.93771,
        42.0
      ],
      [
        44.02084,
        41.84593
      ],
      [
        44.12354,
        41.77862
      ],
      [
        44.19148,
        41.64206
      ],
      [
        44.29013,
        41.75452
      ],
      [
        44.36143,
        41.80493
      ],
      [
        44.46832,
        41.85322
      ],
      [
        44.42119,
        42.0
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "abda1238",
    "name": "'Abd Al-Kuri",
    "isocode": "",
    "level": "dialect",
    "macroarea": "Africa",
    "latitude": 12.1959,
    "longitude": 52.2282,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Africa / Global",
    "family": "Africa Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        12.43886,
        52.2282
      ],
      [
        12.46389,
        52.36024
      ],
      [
        12.34108,
        52.41446
      ],
      [
        12.26432,
        52.5349
      ],
      [
        12.12787,
        52.53314
      ],
      [
        12.05072,
        52.41445
      ],
      [
        11.92743,
        52.36047
      ],
      [
        11.95539,
        52.2282
      ],
      [
        12.02829,
        52.14562
      ],
      [
        12.03964,
        52.02774
      ],
      [
        12.15674,
        52.05266
      ],
      [
        12.23545,
        52.0509
      ],
      [
        12.35216,
        52.02773
      ],
      [
        12.36303,
        52.14586
      ],
      [
        12.43886,
        52.2282
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "abee1242",
    "name": "Abé",
    "isocode": "aba",
    "level": "language",
    "macroarea": "Africa",
    "latitude": 5.59682,
    "longitude": -4.38497,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Africa / Global",
    "family": "Africa Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        5.90851,
        -4.38497
      ],
      [
        5.81386,
        -4.27995
      ],
      [
        5.78781,
        -4.14433
      ],
      [
        5.66384,
        -4.08994
      ],
      [
        5.54781,
        -4.16921
      ],
      [
        5.4215,
        -4.16408
      ],
      [
        5.39256,
        -4.28613
      ],
      [
        5.42503,
        -4.38497
      ],
      [
        5.37826,
        -4.49073
      ],
      [
        5.48637,
        -4.52413
      ],
      [
        5.55625,
        -4.56355
      ],
      [
        5.65539,
        -4.64282
      ],
      [
        5.72295,
        -4.54388
      ],
      [
        5.82815,
        -4.49691
      ],
      [
        5.90851,
        -4.38497
      ]
    ],
    "neighbors": [
      {
        "glottocode": "abid1235",
        "name": "Abidji",
        "distanceKm": 23.0
      },
      {
        "glottocode": "adio1239",
        "name": "Adioukrou",
        "distanceKm": 28.5
      },
      {
        "glottocode": "abur1243",
        "name": "Abure",
        "distanceKm": 92.6
      }
    ]
  },
  {
    "glottocode": "aben1249",
    "name": "Abenlen Ayta",
    "isocode": "abp",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 15.4131,
    "longitude": 120.2,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Papunesia / Global",
    "family": "Papunesia Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        15.65677,
        120.2
      ],
      [
        15.683,
        120.33483
      ],
      [
        15.59509,
        120.43672
      ],
      [
        15.45869,
        120.40718
      ],
      [
        15.35439,
        120.4668
      ],
      [
        15.27912,
        120.37428
      ],
      [
        15.26744,
        120.27277
      ],
      [
        15.17329,
        120.2
      ],
      [
        15.2474,
        120.11723
      ],
      [
        15.29365,
        120.04462
      ],
      [
        15.3511,
        119.91824
      ],
      [
        15.46198,
        119.97786
      ],
      [
        15.58056,
        119.98218
      ],
      [
        15.70303,
        120.05517
      ],
      [
        15.65677,
        120.2
      ]
    ],
    "neighbors": [
      {
        "glottocode": "ilok1237",
        "name": "Iloko",
        "distanceKm": 102.9
      }
    ]
  },
  {
    "glottocode": "abid1235",
    "name": "Abidji",
    "isocode": "abi",
    "level": "language",
    "macroarea": "Africa",
    "latitude": 5.65656,
    "longitude": -4.58421,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Africa / Global",
    "family": "Africa Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        5.94435,
        -4.58421
      ],
      [
        5.90813,
        -4.46247
      ],
      [
        5.77409,
        -4.43611
      ],
      [
        5.71171,
        -4.3414
      ],
      [
        5.61056,
        -4.38169
      ],
      [
        5.55881,
        -4.46103
      ],
      [
        5.43802,
        -4.47845
      ],
      [
        5.46088,
        -4.58421
      ],
      [
        5.47253,
        -4.67327
      ],
      [
        5.47265,
        -4.81596
      ],
      [
        5.60413,
        -4.81506
      ],
      [
        5.71814,
        -4.85535
      ],
      [
        5.86025,
        -4.84088
      ],
      [
        5.87361,
        -4.68925
      ],
      [
        5.94435,
        -4.58421
      ]
    ],
    "neighbors": [
      {
        "glottocode": "abee1242",
        "name": "Abé",
        "distanceKm": 23.0
      },
      {
        "glottocode": "adio1239",
        "name": "Adioukrou",
        "distanceKm": 31.2
      },
      {
        "glottocode": "abur1243",
        "name": "Abure",
        "distanceKm": 115.3
      }
    ]
  },
  {
    "glottocode": "abin1243",
    "name": "Abinomn",
    "isocode": "bsa",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -2.92281,
    "longitude": 138.891,
    "isNational": true,
    "isFromCsv": true,
    "island": "Papua",
    "province": "Papua (Mamberamo)",
    "family": "Isolate (Abinomn)",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -2.60822,
        138.891
      ],
      [
        -2.73756,
        138.98033
      ],
      [
        -2.7488,
        139.10949
      ],
      [
        -2.86905,
        139.12684
      ],
      [
        -2.96445,
        139.07367
      ],
      [
        -3.10824,
        139.12382
      ],
      [
        -3.14882,
        138.99998
      ],
      [
        -3.18234,
        138.891
      ],
      [
        -3.25483,
        138.7309
      ],
      [
        -3.10676,
        138.66003
      ],
      [
        -2.99681,
        138.56638
      ],
      [
        -2.83669,
        138.51321
      ],
      [
        -2.75027,
        138.67436
      ],
      [
        -2.63155,
        138.75056
      ],
      [
        -2.60822,
        138.891
      ]
    ],
    "neighbors": [
      {
        "glottocode": "foau1240",
        "name": "Abawiri",
        "distanceKm": 38.3
      },
      {
        "glottocode": "kwer1263",
        "name": "Kwerba Mamberamo",
        "distanceKm": 64.3
      },
      {
        "glottocode": "sika1263",
        "name": "Sikaritai",
        "distanceKm": 68.4
      },
      {
        "glottocode": "beri1254",
        "name": "Berik",
        "distanceKm": 72.7
      },
      {
        "glottocode": "nucl1595",
        "name": "Kwerba",
        "distanceKm": 90.8
      }
    ]
  },
  {
    "glottocode": "abip1241",
    "name": "Abipon",
    "isocode": "axb",
    "level": "language",
    "macroarea": "South America",
    "latitude": -29.0,
    "longitude": -61.0,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "South America / Global",
    "family": "South America Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -28.83935,
        -61.0
      ],
      [
        -28.79569,
        -60.88751
      ],
      [
        -28.87174,
        -60.81611
      ],
      [
        -28.96354,
        -60.81737
      ],
      [
        -29.05839,
        -60.70752
      ],
      [
        -29.14274,
        -60.79535
      ],
      [
        -29.20951,
        -60.88464
      ],
      [
        -29.32283,
        -61.0
      ],
      [
        -29.23129,
        -61.12735
      ],
      [
        -29.17318,
        -61.2483
      ],
      [
        -29.07113,
        -61.35629
      ],
      [
        -28.9508,
        -61.24644
      ],
      [
        -28.8413,
        -61.22753
      ],
      [
        -28.77391,
        -61.12449
      ],
      [
        -28.83935,
        -61.0
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "abkh1244",
    "name": "Abkhaz",
    "isocode": "abk",
    "level": "language",
    "macroarea": "Eurasia",
    "latitude": 43.056218,
    "longitude": 41.159115,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Eurasia / Global",
    "family": "Eurasia Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        43.2801,
        41.15911
      ],
      [
        43.24855,
        41.28587
      ],
      [
        43.16513,
        41.34603
      ],
      [
        43.11783,
        41.52852
      ],
      [
        43.00129,
        41.48846
      ],
      [
        42.9039,
        41.42051
      ],
      [
        42.75803,
        41.35564
      ],
      [
        42.79662,
        41.15911
      ],
      [
        42.81295,
        40.99879
      ],
      [
        42.86369,
        40.82871
      ],
      [
        43.01024,
        40.88343
      ],
      [
        43.10887,
        40.84338
      ],
      [
        43.20534,
        40.9032
      ],
      [
        43.19363,
        41.06855
      ],
      [
        43.2801,
        41.15911
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "abom1238",
    "name": "Abom",
    "isocode": "aob",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.42448,
    "longitude": 142.842,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Papunesia / Global",
    "family": "Papunesia Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -8.19846,
        142.842
      ],
      [
        -8.25448,
        142.92476
      ],
      [
        -8.24244,
        143.07277
      ],
      [
        -8.36596,
        143.10119
      ],
      [
        -8.4806,
        143.09057
      ],
      [
        -8.63256,
        143.10577
      ],
      [
        -8.65597,
        142.9547
      ],
      [
        -8.68193,
        142.842
      ],
      [
        -8.69008,
        142.7127
      ],
      [
        -8.54388,
        142.69065
      ],
      [
        -8.47354,
        142.6247
      ],
      [
        -8.37302,
        142.61408
      ],
      [
        -8.33112,
        142.72365
      ],
      [
        -8.22037,
        142.74264
      ],
      [
        -8.19846,
        142.842
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "abon1238",
    "name": "Abon",
    "isocode": "abo",
    "level": "language",
    "macroarea": "Africa",
    "latitude": 6.90621,
    "longitude": 10.8769,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Africa / Global",
    "family": "Africa Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        7.11024,
        10.8769
      ],
      [
        7.18171,
        11.01054
      ],
      [
        7.07808,
        11.094
      ],
      [
        6.96298,
        11.12745
      ],
      [
        6.8326,
        11.20176
      ],
      [
        6.7508,
        11.0732
      ],
      [
        6.68871,
        10.98241
      ],
      [
        6.62677,
        10.8769
      ],
      [
        6.74611,
        10.79924
      ],
      [
        6.77664,
        10.71324
      ],
      [
        6.8554,
        10.65265
      ],
      [
        6.94018,
        10.72696
      ],
      [
        7.05225,
        10.69244
      ],
      [
        7.1243,
        10.7711
      ],
      [
        7.11024,
        10.8769
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "abro1238",
    "name": "Abron",
    "isocode": "abr",
    "level": "language",
    "macroarea": "Africa",
    "latitude": 7.72094,
    "longitude": -2.50289,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Africa / Global",
    "family": "Africa Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        8.0374,
        -2.50289
      ],
      [
        7.97641,
        -2.37874
      ],
      [
        7.87838,
        -2.30366
      ],
      [
        7.7927,
        -2.18562
      ],
      [
        7.66805,
        -2.26904
      ],
      [
        7.58153,
        -2.32647
      ],
      [
        7.48245,
        -2.38699
      ],
      [
        7.55393,
        -2.50289
      ],
      [
        7.54082,
        -2.59043
      ],
      [
        7.57694,
        -2.68511
      ],
      [
        7.68512,
        -2.66128
      ],
      [
        7.77563,
        -2.7447
      ],
      [
        7.88297,
        -2.70793
      ],
      [
        7.91804,
        -2.59868
      ],
      [
        8.0374,
        -2.50289
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "abuu1241",
    "name": "Abu",
    "isocode": "ado",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -4.24027,
    "longitude": 144.474,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Papunesia / Global",
    "family": "Papunesia Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -3.95433,
        144.474
      ],
      [
        -4.01996,
        144.58038
      ],
      [
        -4.04712,
        144.71686
      ],
      [
        -4.19045,
        144.69286
      ],
      [
        -4.2861,
        144.67536
      ],
      [
        -4.39767,
        144.67192
      ],
      [
        -4.38523,
        144.544
      ],
      [
        -4.43781,
        144.474
      ],
      [
        -4.45556,
        144.37004
      ],
      [
        -4.34857,
        144.33783
      ],
      [
        -4.29804,
        144.22021
      ],
      [
        -4.17852,
        144.20271
      ],
      [
        -4.09623,
        144.29289
      ],
      [
        -3.94963,
        144.33365
      ],
      [
        -3.95433,
        144.474
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "abua1244",
    "name": "Abua",
    "isocode": "abn",
    "level": "language",
    "macroarea": "Africa",
    "latitude": 4.83057,
    "longitude": 6.61492,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Africa / Global",
    "family": "Africa Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        5.06253,
        6.61492
      ],
      [
        5.09564,
        6.74302
      ],
      [
        4.96131,
        6.77944
      ],
      [
        4.87295,
        6.80126
      ],
      [
        4.77622,
        6.8539
      ],
      [
        4.73068,
        6.74063
      ],
      [
        4.64974,
        6.70231
      ],
      [
        4.57906,
        6.61492
      ],
      [
        4.66004,
        6.5325
      ],
      [
        4.65987,
        6.4001
      ],
      [
        4.76537,
        6.32823
      ],
      [
        4.8838,
        6.38086
      ],
      [
        5.03212,
        6.36128
      ],
      [
        5.08534,
        6.49179
      ],
      [
        5.06253,
        6.61492
      ]
    ],
    "neighbors": [
      {
        "glottocode": "abur1244",
        "name": "Abureni",
        "distanceKm": 26.0
      }
    ]
  },
  {
    "glottocode": "abua1245",
    "name": "Abu' Arapesh",
    "isocode": "aah",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -3.461612,
    "longitude": 142.917031,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Papunesia / Global",
    "family": "Papunesia Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -3.18402,
        142.91703
      ],
      [
        -3.28403,
        143.0027
      ],
      [
        -3.35018,
        143.05701
      ],
      [
        -3.40795,
        143.15257
      ],
      [
        -3.49838,
        143.07841
      ],
      [
        -3.5918,
        143.08057
      ],
      [
        -3.7024,
        143.0332
      ],
      [
        -3.6675,
        142.91703
      ],
      [
        -3.71963,
        142.79255
      ],
      [
        -3.65163,
        142.67832
      ],
      [
        -3.51553,
        142.68035
      ],
      [
        -3.39079,
        142.60619
      ],
      [
        -3.29035,
        142.70189
      ],
      [
        -3.26681,
        142.82305
      ],
      [
        -3.18402,
        142.91703
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "abur1243",
    "name": "Abure",
    "isocode": "abu",
    "level": "language",
    "macroarea": "Africa",
    "latitude": 5.21534,
    "longitude": -3.64123,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Africa / Global",
    "family": "Africa Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        5.4032,
        -3.64123
      ],
      [
        5.37029,
        -3.5663
      ],
      [
        5.36721,
        -3.45
      ],
      [
        5.25438,
        -3.46946
      ],
      [
        5.16626,
        -3.42529
      ],
      [
        5.03801,
        -3.41795
      ],
      [
        5.01572,
        -3.5447
      ],
      [
        4.91972,
        -3.64123
      ],
      [
        4.93469,
        -3.77694
      ],
      [
        5.06577,
        -3.82956
      ],
      [
        5.1468,
        -3.94277
      ],
      [
        5.27384,
        -3.8986
      ],
      [
        5.33946,
        -3.79751
      ],
      [
        5.45131,
        -3.75534
      ],
      [
        5.4032,
        -3.64123
      ]
    ],
    "neighbors": [
      {
        "glottocode": "abee1242",
        "name": "Abé",
        "distanceKm": 92.6
      },
      {
        "glottocode": "adio1239",
        "name": "Adioukrou",
        "distanceKm": 99.6
      },
      {
        "glottocode": "abid1235",
        "name": "Abidji",
        "distanceKm": 115.3
      }
    ]
  },
  {
    "glottocode": "abur1244",
    "name": "Abureni",
    "isocode": "mgj",
    "level": "language",
    "macroarea": "Africa",
    "latitude": 4.62301,
    "longitude": 6.50634,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Africa / Global",
    "family": "Africa Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        4.79387,
        6.50634
      ],
      [
        4.84941,
        6.61572
      ],
      [
        4.74137,
        6.65525
      ],
      [
        4.67516,
        6.73558
      ],
      [
        4.55603,
        6.80076
      ],
      [
        4.47682,
        6.69025
      ],
      [
        4.35258,
        6.637
      ],
      [
        4.31039,
        6.50634
      ],
      [
        4.41381,
        6.40527
      ],
      [
        4.43993,
        6.27602
      ],
      [
        4.56758,
        6.26269
      ],
      [
        4.66361,
        6.32787
      ],
      [
        4.77826,
        6.31102
      ],
      [
        4.78818,
        6.42654
      ],
      [
        4.79387,
        6.50634
      ]
    ],
    "neighbors": [
      {
        "glottocode": "abua1244",
        "name": "Abua",
        "distanceKm": 26.0
      }
    ]
  },
  {
    "glottocode": "acat1239",
    "name": "Acatepec Me'phaa",
    "isocode": "tpx",
    "level": "language",
    "macroarea": "North America",
    "latitude": 17.1034,
    "longitude": -99.0602,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "North America / Global",
    "family": "North America Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        17.36673,
        -99.0602
      ],
      [
        17.28971,
        -98.96633
      ],
      [
        17.25818,
        -98.85713
      ],
      [
        17.17353,
        -98.73872
      ],
      [
        17.0493,
        -98.81222
      ],
      [
        16.91685,
        -98.81545
      ],
      [
        16.82573,
        -98.92029
      ],
      [
        16.88325,
        -99.0602
      ],
      [
        16.85411,
        -99.18581
      ],
      [
        16.95674,
        -99.25261
      ],
      [
        17.06595,
        -99.23189
      ],
      [
        17.15689,
        -99.30539
      ],
      [
        17.2183,
        -99.21094
      ],
      [
        17.26132,
        -99.13977
      ],
      [
        17.36673,
        -99.0602
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "myce1241",
    "name": "Achaean Greek",
    "isocode": "gmy",
    "level": "language",
    "macroarea": "Eurasia",
    "latitude": 37.73,
    "longitude": 22.82,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Eurasia / Global",
    "family": "Eurasia Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        37.95441,
        22.82
      ],
      [
        37.96451,
        22.96279
      ],
      [
        37.93279,
        23.14152
      ],
      [
        37.78486,
        23.12388
      ],
      [
        37.66488,
        23.18072
      ],
      [
        37.5436,
        23.11553
      ],
      [
        37.54512,
        22.93257
      ],
      [
        37.47094,
        22.82
      ],
      [
        37.52891,
        22.69756
      ],
      [
        37.63135,
        22.66359
      ],
      [
        37.67727,
        22.52791
      ],
      [
        37.77247,
        22.58476
      ],
      [
        37.84504,
        22.6376
      ],
      [
        37.98071,
        22.66734
      ],
      [
        37.95441,
        22.82
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "acha1250",
    "name": "Achagua",
    "isocode": "aca",
    "level": "language",
    "macroarea": "South America",
    "latitude": 4.38649,
    "longitude": -72.2005,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "South America / Global",
    "family": "South America Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        4.65525,
        -72.2005
      ],
      [
        4.68395,
        -72.05683
      ],
      [
        4.53886,
        -72.00887
      ],
      [
        4.44902,
        -71.92571
      ],
      [
        4.32279,
        -71.92061
      ],
      [
        4.26853,
        -72.05215
      ],
      [
        4.1678,
        -72.09488
      ],
      [
        4.17177,
        -72.2005
      ],
      [
        4.24835,
        -72.26722
      ],
      [
        4.23742,
        -72.38798
      ],
      [
        4.34144,
        -72.39845
      ],
      [
        4.43038,
        -72.39335
      ],
      [
        4.56997,
        -72.43125
      ],
      [
        4.6034,
        -72.30526
      ],
      [
        4.65525,
        -72.2005
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "ache1244",
    "name": "Ache",
    "isocode": "yif",
    "level": "language",
    "macroarea": "Eurasia",
    "latitude": 24.152,
    "longitude": 102.446,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Eurasia / Global",
    "family": "Eurasia Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        24.48137,
        102.446
      ],
      [
        24.36561,
        102.55874
      ],
      [
        24.31757,
        102.67354
      ],
      [
        24.21248,
        102.73638
      ],
      [
        24.11327,
        102.63199
      ],
      [
        24.00893,
        102.64262
      ],
      [
        23.96184,
        102.54636
      ],
      [
        23.9979,
        102.446
      ],
      [
        23.93001,
        102.32884
      ],
      [
        24.01613,
        102.25928
      ],
      [
        24.10489,
        102.21981
      ],
      [
        24.22085,
        102.11542
      ],
      [
        24.31037,
        102.22836
      ],
      [
        24.39743,
        102.31647
      ],
      [
        24.48137,
        102.446
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "ache1246",
    "name": "Aché",
    "isocode": "guq",
    "level": "language",
    "macroarea": "South America",
    "latitude": -25.5865,
    "longitude": -56.4697,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "South America / Global",
    "family": "South America Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -25.36086,
        -56.4697
      ],
      [
        -25.36318,
        -56.35046
      ],
      [
        -25.42595,
        -56.24649
      ],
      [
        -25.55052,
        -56.29491
      ],
      [
        -25.63561,
        -56.23112
      ],
      [
        -25.71925,
        -56.28513
      ],
      [
        -25.731,
        -56.39255
      ],
      [
        -25.84434,
        -56.4697
      ],
      [
        -25.79877,
        -56.58304
      ],
      [
        -25.7274,
        -56.66559
      ],
      [
        -25.6581,
        -56.81751
      ],
      [
        -25.52803,
        -56.75372
      ],
      [
        -25.41781,
        -56.70423
      ],
      [
        -25.2954,
        -56.62513
      ],
      [
        -25.36086,
        -56.4697
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "ache1245",
    "name": "Acheron",
    "isocode": "acz",
    "level": "language",
    "macroarea": "Africa",
    "latitude": 10.8827,
    "longitude": 30.3187,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Africa / Global",
    "family": "Africa Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        11.11258,
        30.3187
      ],
      [
        11.10373,
        30.42709
      ],
      [
        10.97849,
        30.44102
      ],
      [
        10.93106,
        30.53446
      ],
      [
        10.83368,
        30.53739
      ],
      [
        10.77588,
        30.4551
      ],
      [
        10.63771,
        30.43884
      ],
      [
        10.62911,
        30.3187
      ],
      [
        10.66814,
        30.21348
      ],
      [
        10.67705,
        30.0561
      ],
      [
        10.82348,
        30.05448
      ],
      [
        10.94127,
        30.0574
      ],
      [
        11.07733,
        30.07018
      ],
      [
        11.07331,
        30.22523
      ],
      [
        11.11258,
        30.3187
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "achi1256",
    "name": "Achi",
    "isocode": "acr",
    "level": "language",
    "macroarea": "North America",
    "latitude": 15.073,
    "longitude": -90.3513,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "North America / Global",
    "family": "North America Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        15.30991,
        -90.3513
      ],
      [
        15.20894,
        -90.2835
      ],
      [
        15.20986,
        -90.17357
      ],
      [
        15.12473,
        -90.11658
      ],
      [
        15.03172,
        -90.164
      ],
      [
        14.89421,
        -90.11911
      ],
      [
        14.8298,
        -90.23001
      ],
      [
        14.82644,
        -90.3513
      ],
      [
        14.77335,
        -90.50075
      ],
      [
        14.90842,
        -90.56503
      ],
      [
        15.01715,
        -90.60473
      ],
      [
        15.1393,
        -90.65215
      ],
      [
        15.19565,
        -90.51058
      ],
      [
        15.2654,
        -90.44726
      ],
      [
        15.30991,
        -90.3513
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "acht1238",
    "name": "Achterhoeks",
    "isocode": "act",
    "level": "dialect",
    "macroarea": "Eurasia",
    "latitude": 52.021,
    "longitude": 6.47521,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Eurasia / Global",
    "family": "Eurasia Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        52.17484,
        6.47521
      ],
      [
        52.2253,
        6.63509
      ],
      [
        52.17577,
        6.79058
      ],
      [
        52.06576,
        6.79391
      ],
      [
        51.95415,
        6.95115
      ],
      [
        51.84464,
        6.83458
      ],
      [
        51.79572,
        6.65151
      ],
      [
        51.69136,
        6.47521
      ],
      [
        51.78971,
        6.29421
      ],
      [
        51.87433,
        6.17633
      ],
      [
        51.95818,
        6.02795
      ],
      [
        52.06174,
        6.18518
      ],
      [
        52.14608,
        6.22032
      ],
      [
        52.23132,
        6.31062
      ],
      [
        52.17484,
        6.47521
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "achu1248",
    "name": "Achuar-Shiwiar",
    "isocode": "acu",
    "level": "language",
    "macroarea": "South America",
    "latitude": -2.82646,
    "longitude": -77.2641,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "South America / Global",
    "family": "South America Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -2.58847,
        -77.2641
      ],
      [
        -2.58694,
        -77.14861
      ],
      [
        -2.69159,
        -77.09477
      ],
      [
        -2.75725,
        -76.96049
      ],
      [
        -2.89122,
        -76.98
      ],
      [
        -2.98109,
        -77.06996
      ],
      [
        -3.11592,
        -77.12453
      ],
      [
        -3.07195,
        -77.2641
      ],
      [
        -3.02254,
        -77.35864
      ],
      [
        -2.99303,
        -77.47322
      ],
      [
        -2.86483,
        -77.43242
      ],
      [
        -2.78364,
        -77.45193
      ],
      [
        -2.67965,
        -77.44842
      ],
      [
        -2.68032,
        -77.33456
      ],
      [
        -2.58847,
        -77.2641
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "achu1247",
    "name": "Achumawi",
    "isocode": "acv",
    "level": "language",
    "macroarea": "North America",
    "latitude": 41.0979,
    "longitude": -121.191,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "North America / Global",
    "family": "North America Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        41.38128,
        -121.191
      ],
      [
        41.30431,
        -121.0591
      ],
      [
        41.29567,
        -120.86192
      ],
      [
        41.16326,
        -120.81098
      ],
      [
        41.04437,
        -120.87976
      ],
      [
        40.90558,
        -120.87098
      ],
      [
        40.88898,
        -121.05749
      ],
      [
        40.8978,
        -121.191
      ],
      [
        40.86871,
        -121.33746
      ],
      [
        40.99422,
        -121.36352
      ],
      [
        41.05568,
        -121.43646
      ],
      [
        41.15195,
        -121.50524
      ],
      [
        41.20702,
        -121.37258
      ],
      [
        41.32458,
        -121.33586
      ],
      [
        41.38128,
        -121.191
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "acol1236",
    "name": "Acoli",
    "isocode": "ach",
    "level": "language",
    "macroarea": "Africa",
    "latitude": 3.57738,
    "longitude": 32.5147,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Africa / Global",
    "family": "Africa Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        3.81528,
        32.5147
      ],
      [
        3.86383,
        32.65292
      ],
      [
        3.75872,
        32.74254
      ],
      [
        3.62823,
        32.73794
      ],
      [
        3.51226,
        32.80058
      ],
      [
        3.44159,
        32.68531
      ],
      [
        3.41108,
        32.59494
      ],
      [
        3.33181,
        32.5147
      ],
      [
        3.42824,
        32.44274
      ],
      [
        3.45728,
        32.36381
      ],
      [
        3.52065,
        32.26566
      ],
      [
        3.61984,
        32.32831
      ],
      [
        3.74303,
        32.30658
      ],
      [
        3.84667,
        32.38476
      ],
      [
        3.81528,
        32.5147
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "acro1239",
    "name": "Acroá",
    "isocode": "acs",
    "level": "language",
    "macroarea": "South America",
    "latitude": -12.20318,
    "longitude": -45.08975,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "South America / Global",
    "family": "South America Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -11.89017,
        -45.08975
      ],
      [
        -11.94823,
        -44.96413
      ],
      [
        -12.07024,
        -44.9192
      ],
      [
        -12.14182,
        -44.81471
      ],
      [
        -12.24884,
        -44.8851
      ],
      [
        -12.31091,
        -44.95154
      ],
      [
        -12.42106,
        -44.9824
      ],
      [
        -12.37365,
        -45.08975
      ],
      [
        -12.38383,
        -45.17876
      ],
      [
        -12.37168,
        -45.30593
      ],
      [
        -12.24941,
        -45.29697
      ],
      [
        -12.14125,
        -45.36735
      ],
      [
        -12.00946,
        -45.33828
      ],
      [
        -11.98546,
        -45.19702
      ],
      [
        -11.89017,
        -45.08975
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "adab1235",
    "name": "Adabe",
    "isocode": "adb",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.22674,
    "longitude": 125.576,
    "isNational": true,
    "isFromCsv": true,
    "island": "Nusa Tenggara",
    "province": "Kepulauan Nusa Tenggara (Atauro/Timor)",
    "family": "Timor-Alor-Pantar",
    "estimatedRadiusKm": 28.0,
    "estimatedAreaKm2": 2266.0,
    "boundaryPolygon": [
      [
        -7.98935,
        125.576
      ],
      [
        -8.07191,
        125.65134
      ],
      [
        -8.0851,
        125.75546
      ],
      [
        -8.18862,
        125.74477
      ],
      [
        -8.25905,
        125.71902
      ],
      [
        -8.35964,
        125.74438
      ],
      [
        -8.36916,
        125.6453
      ],
      [
        -8.41239,
        125.576
      ],
      [
        -8.45306,
        125.46588
      ],
      [
        -8.34886,
        125.42128
      ],
      [
        -8.28275,
        125.32804
      ],
      [
        -8.16491,
        125.3023
      ],
      [
        -8.09588,
        125.41019
      ],
      [
        -7.98802,
        125.45984
      ],
      [
        -7.98935,
        125.576
      ]
    ],
    "neighbors": [
      {
        "glottocode": "kama1365",
        "name": "Kamang",
        "distanceKm": 86.4
      },
      {
        "glottocode": "kema1243",
        "name": "Kemak",
        "distanceKm": 97.7
      },
      {
        "glottocode": "tetu1245",
        "name": "Tetum",
        "distanceKm": 98.6
      },
      {
        "glottocode": "buna1278",
        "name": "Bunak",
        "distanceKm": 108.6
      },
      {
        "glottocode": "abui1241",
        "name": "Abui",
        "distanceKm": 109.1
      }
    ]
  },
  {
    "glottocode": "adai1235",
    "name": "Adai",
    "isocode": "xad",
    "level": "language",
    "macroarea": "North America",
    "latitude": 31.6314,
    "longitude": -92.0059,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "North America / Global",
    "family": "North America Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        31.81141,
        -92.0059
      ],
      [
        31.85323,
        -91.88043
      ],
      [
        31.75052,
        -91.83047
      ],
      [
        31.66805,
        -91.81732
      ],
      [
        31.57562,
        -91.71887
      ],
      [
        31.50978,
        -91.82678
      ],
      [
        31.42781,
        -91.89075
      ],
      [
        31.32794,
        -92.0059
      ],
      [
        31.41764,
        -92.12681
      ],
      [
        31.44908,
        -92.27442
      ],
      [
        31.56046,
        -92.37091
      ],
      [
        31.6832,
        -92.27247
      ],
      [
        31.81122,
        -92.27073
      ],
      [
        31.8634,
        -92.13712
      ],
      [
        31.81141,
        -92.0059
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "adam1253",
    "name": "Adamawa Fulfulde",
    "isocode": "fub",
    "level": "language",
    "macroarea": "Africa",
    "latitude": 8.140326,
    "longitude": 13.077338,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Africa / Global",
    "family": "Africa Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        8.37732,
        13.07734
      ],
      [
        8.31309,
        13.16138
      ],
      [
        8.24572,
        13.21084
      ],
      [
        8.19866,
        13.33553
      ],
      [
        8.09313,
        13.28624
      ],
      [
        7.9907,
        13.26688
      ],
      [
        7.85428,
        13.21649
      ],
      [
        7.89385,
        13.07734
      ],
      [
        7.87749,
        12.94948
      ],
      [
        7.94428,
        12.829
      ],
      [
        8.09108,
        12.85938
      ],
      [
        8.20071,
        12.81009
      ],
      [
        8.29214,
        12.88503
      ],
      [
        8.28988,
        13.00458
      ],
      [
        8.37732,
        13.07734
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "adam1238",
    "name": "Adamorobe Sign Language",
    "isocode": "ads",
    "level": "language",
    "macroarea": "Africa",
    "latitude": 5.834,
    "longitude": -0.151,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Africa / Global",
    "family": "Africa Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        6.03206,
        -0.151
      ],
      [
        5.99461,
        -0.07325
      ],
      [
        6.00648,
        0.06641
      ],
      [
        5.88517,
        0.07435
      ],
      [
        5.77786,
        0.09623
      ],
      [
        5.62979,
        0.1064
      ],
      [
        5.60831,
        -0.04175
      ],
      [
        5.54858,
        -0.151
      ],
      [
        5.55901,
        -0.28412
      ],
      [
        5.70504,
        -0.31355
      ],
      [
        5.77759,
        -0.39945
      ],
      [
        5.88545,
        -0.37758
      ],
      [
        5.93124,
        -0.27356
      ],
      [
        6.0439,
        -0.25261
      ],
      [
        6.03206,
        -0.151
      ]
    ],
    "neighbors": [
      {
        "glottocode": "adan1247",
        "name": "Adangme",
        "distanceKm": 33.6
      },
      {
        "glottocode": "adan1248",
        "name": "Adangbe",
        "distanceKm": 122.5
      }
    ]
  },
  {
    "glottocode": "adan1248",
    "name": "Adangbe",
    "isocode": "adq",
    "level": "language",
    "macroarea": "Africa",
    "latitude": 6.50546,
    "longitude": 0.727155,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Africa / Global",
    "family": "Africa Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        6.69653,
        0.72715
      ],
      [
        6.76882,
        0.8548
      ],
      [
        6.65921,
        0.9212
      ],
      [
        6.56356,
        0.98336
      ],
      [
        6.43149,
        1.05334
      ],
      [
        6.35023,
        0.92307
      ],
      [
        6.25856,
        0.84682
      ],
      [
        6.21305,
        0.72715
      ],
      [
        6.33322,
        0.64367
      ],
      [
        6.35777,
        0.54075
      ],
      [
        6.45598,
        0.50895
      ],
      [
        6.53907,
        0.57893
      ],
      [
        6.65167,
        0.54262
      ],
      [
        6.69416,
        0.63569
      ],
      [
        6.69653,
        0.72715
      ]
    ],
    "neighbors": [
      {
        "glottocode": "adan1247",
        "name": "Adangme",
        "distanceKm": 90.7
      },
      {
        "glottocode": "adam1238",
        "name": "Adamorobe Sign Language",
        "distanceKm": 122.5
      }
    ]
  },
  {
    "glottocode": "adan1247",
    "name": "Adangme",
    "isocode": "ada",
    "level": "language",
    "macroarea": "Africa",
    "latitude": 5.9437,
    "longitude": 0.13243,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Africa / Global",
    "family": "Africa Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        6.25089,
        0.13243
      ],
      [
        6.17816,
        0.24595
      ],
      [
        6.10904,
        0.34087
      ],
      [
        6.0175,
        0.4575
      ],
      [
        5.8898,
        0.36986
      ],
      [
        5.78239,
        0.3358
      ],
      [
        5.69347,
        0.25358
      ],
      [
        5.76742,
        0.13243
      ],
      [
        5.74257,
        0.03505
      ],
      [
        5.80759,
        -0.03916
      ],
      [
        5.90991,
        -0.01641
      ],
      [
        5.99738,
        -0.10404
      ],
      [
        6.08383,
        -0.04424
      ],
      [
        6.12907,
        0.04268
      ],
      [
        6.25089,
        0.13243
      ]
    ],
    "neighbors": [
      {
        "glottocode": "adam1238",
        "name": "Adamorobe Sign Language",
        "distanceKm": 33.6
      },
      {
        "glottocode": "adan1248",
        "name": "Adangbe",
        "distanceKm": 90.7
      }
    ]
  },
  {
    "glottocode": "adap1234",
    "name": "Adap",
    "isocode": "adp",
    "level": "language",
    "macroarea": "Eurasia",
    "latitude": 27.141,
    "longitude": 90.3369,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Eurasia / Global",
    "family": "Eurasia Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        27.41043,
        90.3369
      ],
      [
        27.37866,
        90.46551
      ],
      [
        27.34383,
        90.62271
      ],
      [
        27.19246,
        90.59024
      ],
      [
        27.08735,
        90.60104
      ],
      [
        26.97694,
        90.56808
      ],
      [
        26.9932,
        90.41689
      ],
      [
        26.92695,
        90.3369
      ],
      [
        26.94307,
        90.22979
      ],
      [
        27.04239,
        90.19794
      ],
      [
        27.08487,
        90.06057
      ],
      [
        27.19493,
        90.07136
      ],
      [
        27.27839,
        90.14331
      ],
      [
        27.42879,
        90.18116
      ],
      [
        27.41043,
        90.3369
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "adas1235",
    "name": "Adasen",
    "isocode": "tiu",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": 17.8187,
    "longitude": 120.905,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Papunesia / Global",
    "family": "Papunesia Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        18.07558,
        120.905
      ],
      [
        18.10185,
        121.04823
      ],
      [
        17.95433,
        121.08364
      ],
      [
        17.86834,
        121.13345
      ],
      [
        17.76295,
        121.16154
      ],
      [
        17.72141,
        121.03314
      ],
      [
        17.62932,
        121.0008
      ],
      [
        17.59211,
        120.905
      ],
      [
        17.66625,
        120.82789
      ],
      [
        17.65289,
        120.6866
      ],
      [
        17.76076,
        120.63835
      ],
      [
        17.87054,
        120.66644
      ],
      [
        18.02286,
        120.6361
      ],
      [
        18.06491,
        120.78046
      ],
      [
        18.07558,
        120.905
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "adel1244",
    "name": "Adele",
    "isocode": "ade",
    "level": "language",
    "macroarea": "Africa",
    "latitude": 8.16975,
    "longitude": 0.619185,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Africa / Global",
    "family": "Africa Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        8.46963,
        0.61918
      ],
      [
        8.35259,
        0.70814
      ],
      [
        8.29858,
        0.78239
      ],
      [
        8.2235,
        0.85711
      ],
      [
        8.13564,
        0.77017
      ],
      [
        8.03761,
        0.78658
      ],
      [
        7.95499,
        0.72367
      ],
      [
        7.98616,
        0.61918
      ],
      [
        7.91699,
        0.49621
      ],
      [
        7.99714,
        0.40052
      ],
      [
        8.11592,
        0.38093
      ],
      [
        8.24322,
        0.29398
      ],
      [
        8.33905,
        0.40471
      ],
      [
        8.39058,
        0.51175
      ],
      [
        8.46963,
        0.61918
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "adha1238",
    "name": "Adhari",
    "isocode": "",
    "level": "language",
    "macroarea": "Eurasia",
    "latitude": 40.05,
    "longitude": 48.06,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Eurasia / Global",
    "family": "Eurasia Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        40.23941,
        48.06
      ],
      [
        40.22434,
        48.16968
      ],
      [
        40.19808,
        48.30257
      ],
      [
        40.08477,
        48.259
      ],
      [
        40.00131,
        48.33868
      ],
      [
        39.89177,
        48.3192
      ],
      [
        39.87021,
        48.17311
      ],
      [
        39.75593,
        48.06
      ],
      [
        39.78874,
        47.89564
      ],
      [
        39.89664,
        47.80877
      ],
      [
        39.97719,
        47.64324
      ],
      [
        40.10889,
        47.72292
      ],
      [
        40.19321,
        47.8254
      ],
      [
        40.3058,
        47.89907
      ],
      [
        40.23941,
        48.06
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "adho1243",
    "name": "Adhola",
    "isocode": "adh",
    "level": "language",
    "macroarea": "Africa",
    "latitude": 0.73235,
    "longitude": 34.0341,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Africa / Global",
    "family": "Africa Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        0.91742,
        34.0341
      ],
      [
        0.94761,
        34.13777
      ],
      [
        0.835,
        34.16283
      ],
      [
        0.78347,
        34.25811
      ],
      [
        0.67201,
        34.29847
      ],
      [
        0.59821,
        34.20231
      ],
      [
        0.45784,
        34.16631
      ],
      [
        0.43394,
        34.0341
      ],
      [
        0.51201,
        33.92798
      ],
      [
        0.53356,
        33.78481
      ],
      [
        0.67589,
        33.78672
      ],
      [
        0.7796,
        33.82708
      ],
      [
        0.89966,
        33.82429
      ],
      [
        0.89344,
        33.95652
      ],
      [
        0.91742,
        34.0341
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "utno1237",
    "name": "Adilabad Gondi",
    "isocode": "wsg",
    "level": "language",
    "macroarea": "Eurasia",
    "latitude": 18.75,
    "longitude": 80.2,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Eurasia / Global",
    "family": "Eurasia Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        18.99575,
        80.2
      ],
      [
        18.90997,
        80.28136
      ],
      [
        18.90162,
        80.40079
      ],
      [
        18.8142,
        80.49706
      ],
      [
        18.69917,
        80.43519
      ],
      [
        18.55616,
        80.45669
      ],
      [
        18.47849,
        80.33808
      ],
      [
        18.51227,
        80.2
      ],
      [
        18.47438,
        80.05983
      ],
      [
        18.60018,
        80.00161
      ],
      [
        18.70662,
        79.99929
      ],
      [
        18.80675,
        79.93742
      ],
      [
        18.8576,
        80.05751
      ],
      [
        18.91409,
        80.11655
      ],
      [
        18.99575,
        80.2
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "adio1239",
    "name": "Adioukrou",
    "isocode": "adj",
    "level": "language",
    "macroarea": "Africa",
    "latitude": 5.38228,
    "longitude": -4.52522,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Africa / Global",
    "family": "Africa Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        5.57581,
        -4.52522
      ],
      [
        5.61404,
        -4.41312
      ],
      [
        5.57182,
        -4.2865
      ],
      [
        5.43521,
        -4.29231
      ],
      [
        5.31291,
        -4.21993
      ],
      [
        5.19605,
        -4.29066
      ],
      [
        5.17846,
        -4.42663
      ],
      [
        5.09234,
        -4.52522
      ],
      [
        5.17844,
        -4.62382
      ],
      [
        5.27037,
        -4.66617
      ],
      [
        5.32762,
        -4.76575
      ],
      [
        5.42049,
        -4.69338
      ],
      [
        5.49749,
        -4.67033
      ],
      [
        5.61406,
        -4.63733
      ],
      [
        5.57581,
        -4.52522
      ]
    ],
    "neighbors": [
      {
        "glottocode": "abee1242",
        "name": "Abé",
        "distanceKm": 28.5
      },
      {
        "glottocode": "abid1235",
        "name": "Abidji",
        "distanceKm": 31.2
      },
      {
        "glottocode": "abur1243",
        "name": "Abure",
        "distanceKm": 99.6
      }
    ]
  },
  {
    "glottocode": "adiw1235",
    "name": "Adiwasi Garasia",
    "isocode": "gas",
    "level": "language",
    "macroarea": "Eurasia",
    "latitude": 24.0712,
    "longitude": 73.1426,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Eurasia / Global",
    "family": "Eurasia Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        24.34113,
        73.1426
      ],
      [
        24.35574,
        73.29268
      ],
      [
        24.22224,
        73.35003
      ],
      [
        24.1395,
        73.47035
      ],
      [
        24.00645,
        73.45329
      ],
      [
        23.93942,
        73.32359
      ],
      [
        23.82548,
        73.2722
      ],
      [
        23.85765,
        73.1426
      ],
      [
        23.92014,
        73.06293
      ],
      [
        23.92079,
        72.93603
      ],
      [
        24.03192,
        72.95411
      ],
      [
        24.11404,
        72.93705
      ],
      [
        24.24086,
        72.90959
      ],
      [
        24.26108,
        73.04245
      ],
      [
        24.34113,
        73.1426
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "adny1235",
    "name": "Adnyamathanha",
    "isocode": "adt",
    "level": "language",
    "macroarea": "Australia",
    "latitude": -30.1451,
    "longitude": 138.671,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Australia / Global",
    "family": "Australia Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -29.82237,
        138.671
      ],
      [
        -29.92785,
        138.79198
      ],
      [
        -29.96002,
        138.93938
      ],
      [
        -30.08294,
        138.98595
      ],
      [
        -30.18847,
        138.89073
      ],
      [
        -30.30486,
        138.90266
      ],
      [
        -30.32888,
        138.77335
      ],
      [
        -30.30585,
        138.671
      ],
      [
        -30.36345,
        138.5494
      ],
      [
        -30.26146,
        138.50227
      ],
      [
        -30.19052,
        138.44088
      ],
      [
        -30.08089,
        138.34566
      ],
      [
        -30.00342,
        138.46555
      ],
      [
        -29.89329,
        138.53077
      ],
      [
        -29.82237,
        138.671
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "adug1238",
    "name": "Aduge",
    "isocode": "adu",
    "level": "language",
    "macroarea": "Africa",
    "latitude": 7.64567,
    "longitude": 6.13085,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Africa / Global",
    "family": "Africa Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        7.88034,
        6.13085
      ],
      [
        7.90017,
        6.25451
      ],
      [
        7.81121,
        6.34029
      ],
      [
        7.68545,
        6.3067
      ],
      [
        7.59175,
        6.36923
      ],
      [
        7.52161,
        6.28781
      ],
      [
        7.50202,
        6.20065
      ],
      [
        7.39687,
        6.13085
      ],
      [
        7.46457,
        6.04286
      ],
      [
        7.50977,
        5.95891
      ],
      [
        7.57787,
        5.83112
      ],
      [
        7.69933,
        5.89365
      ],
      [
        7.82306,
        5.90642
      ],
      [
        7.93762,
        5.989
      ],
      [
        7.88034,
        6.13085
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "adur1234",
    "name": "Adurgari",
    "isocode": "",
    "level": "language",
    "macroarea": "Eurasia",
    "latitude": 33.79,
    "longitude": 69.32,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Eurasia / Global",
    "family": "Eurasia Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        34.05536,
        69.32
      ],
      [
        34.01643,
        69.4512
      ],
      [
        33.89281,
        69.47513
      ],
      [
        33.84175,
        69.59283
      ],
      [
        33.74564,
        69.55387
      ],
      [
        33.68791,
        69.47404
      ],
      [
        33.55598,
        69.4556
      ],
      [
        33.57189,
        69.32
      ],
      [
        33.58083,
        69.19879
      ],
      [
        33.59137,
        69.0203
      ],
      [
        33.73417,
        69.02567
      ],
      [
        33.85322,
        68.98671
      ],
      [
        33.98935,
        69.01921
      ],
      [
        33.99158,
        69.20319
      ],
      [
        34.05536,
        69.32
      ]
    ],
    "neighbors": []
  },
  {
    "glottocode": "adze1240",
    "name": "Adzera",
    "isocode": "adz",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -6.39394,
    "longitude": 146.294,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Papunesia / Global",
    "family": "Papunesia Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -6.15521,
        146.294
      ],
      [
        -6.25435,
        146.36165
      ],
      [
        -6.2518,
        146.47335
      ],
      [
        -6.34824,
        146.49546
      ],
      [
        -6.43243,
        146.4637
      ],
      [
        -6.56463,
        146.50937
      ],
      [
        -6.60666,
        146.39708
      ],
      [
        -6.63869,
        146.294
      ],
      [
        -6.68994,
        146.15056
      ],
      [
        -6.55324,
        146.09299
      ],
      [
        -6.45583,
        146.02115
      ],
      [
        -6.32485,
        145.9894
      ],
      [
        -6.26318,
        146.12901
      ],
      [
        -6.17106,
        146.186
      ],
      [
        -6.15521,
        146.294
      ]
    ],
    "neighbors": [
      {
        "glottocode": "abag1245",
        "name": "Abaga",
        "distanceKm": 75.9
      }
    ]
  },
  {
    "glottocode": "aeka1244",
    "name": "Aeka",
    "isocode": "aez",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -8.855095,
    "longitude": 147.99477,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Papunesia / Global",
    "family": "Papunesia Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        -8.70503,
        147.99477
      ],
      [
        -8.64883,
        148.0953
      ],
      [
        -8.72014,
        148.16604
      ],
      [
        -8.81373,
        148.17821
      ],
      [
        -8.91942,
        148.28
      ],
      [
        -9.01283,
        148.19495
      ],
      [
        -9.08392,
        148.1063
      ],
      [
        -9.1885,
        147.99477
      ],
      [
        -9.08443,
        147.883
      ],
      [
        -9.02158,
        147.78348
      ],
      [
        -8.92131,
        147.70117
      ],
      [
        -8.81184,
        147.80296
      ],
      [
        -8.71139,
        147.8124
      ],
      [
        -8.64833,
        147.89399
      ],
      [
        -8.70503,
        147.99477
      ]
    ],
    "neighbors": [
      {
        "glottocode": "abad1241",
        "name": "Abadi",
        "distanceKm": 111.9
      }
    ]
  },
  {
    "glottocode": "aeky1238",
    "name": "Aekyom",
    "isocode": "awi",
    "level": "language",
    "macroarea": "Papunesia",
    "latitude": -5.88478,
    "longitude": 141.532,
    "isNational": true,
    "isFromCsv": true,
    "island": "Papua",
    "province": "Papua (Fly River Border)",
    "family": "Awin-Pa",
    "estimatedRadiusKm": 38.0,
    "estimatedAreaKm2": 4173.5,
    "boundaryPolygon": [
      [
        -5.60553,
        141.532
      ],
      [
        -5.63705,
        141.65193
      ],
      [
        -5.73609,
        141.71944
      ],
      [
        -5.80452,
        141.88551
      ],
      [
        -5.95532,
        141.84271
      ],
      [
        -6.0762,
        141.7733
      ],
      [
        -6.24064,
        141.70428
      ],
      [
        -6.17966,
        141.532
      ],
      [
        -6.15432,
        141.40151
      ],
      [
        -6.09405,
        141.26819
      ],
      [
        -5.93228,
        141.32281
      ],
      [
        -5.82757,
        141.28001
      ],
      [
        -5.71823,
        141.32205
      ],
      [
        -5.72337,
        141.45386
      ],
      [
        -5.60553,
        141.532
      ]
    ],
    "neighbors": [
      {
        "glottocode": "sout2940",
        "name": "South Muyu",
        "distanceKm": 80.6
      },
      {
        "glottocode": "nort2916",
        "name": "North Muyu",
        "distanceKm": 85.0
      },
      {
        "glottocode": "tifa1245",
        "name": "Tifal",
        "distanceKm": 97.7
      },
      {
        "glottocode": "mand1444",
        "name": "Mandobo Atas",
        "distanceKm": 102.7
      },
      {
        "glottocode": "mand1445",
        "name": "Mandobo Bawah",
        "distanceKm": 131.2
      }
    ]
  },
  {
    "glottocode": "aerr1238",
    "name": "Aer",
    "isocode": "aeq",
    "level": "language",
    "macroarea": "Eurasia",
    "latitude": 25.254,
    "longitude": 69.029,
    "isNational": false,
    "isFromCsv": true,
    "island": "Lainnya",
    "province": "Eurasia / Global",
    "family": "Eurasia Family",
    "estimatedRadiusKm": 32.0,
    "estimatedAreaKm2": 2959.6,
    "boundaryPolygon": [
      [
        25.50303,
        69.029
      ],
      [
        25.44841,
        69.13252
      ],
      [
        25.45093,
        69.30203
      ],
      [
        25.31554,
        69.3271
      ],
      [
        25.19667,
        69.30674
      ],
      [
        25.05059,
        69.31103
      ],
      [
        25.03977,
        69.14307
      ],
      [
        25.01956,
        69.029
      ],
      [
        25.01281,
        68.90058
      ],
      [
        25.14948,
        68.88409
      ],
      [
        25.20795,
        68.80593
      ],
      [
        25.30425,
        68.78557
      ],
      [
        25.35203,
        68.89309
      ],
      [
        25.47537,
        68.91113
      ],
      [
        25.50303,
        69.029
      ]
    ],
    "neighbors": []
  }
];

export const GLOTTOLOG_ISLAND_OPTIONS = [
  { id: 'all', label: 'Seluruh Wilayah Nasional (Indonesia)', count: GLOTTOLOG_LANGUAGES.filter(l => l.isNational).length },
  { id: 'csv', label: 'Berkas CSV Glottolog (63 Titik Bahasa)', count: GLOTTOLOG_LANGUAGES.filter(l => l.isFromCsv).length },
  { id: 'Sumatera', label: 'Pulau Sumatera', count: GLOTTOLOG_LANGUAGES.filter(l => l.island === 'Sumatera').length },
  { id: 'Jawa & Bali', label: 'Jawa & Bali', count: GLOTTOLOG_LANGUAGES.filter(l => l.island === 'Jawa & Bali').length },
  { id: 'Kalimantan', label: 'Pulau Kalimantan', count: GLOTTOLOG_LANGUAGES.filter(l => l.island === 'Kalimantan').length },
  { id: 'Sulawesi', label: 'Pulau Sulawesi', count: GLOTTOLOG_LANGUAGES.filter(l => l.island === 'Sulawesi').length },
  { id: 'Nusa Tenggara', label: 'Kepulauan Nusa Tenggara', count: GLOTTOLOG_LANGUAGES.filter(l => l.island === 'Nusa Tenggara').length },
  { id: 'Maluku', label: 'Kepulauan Maluku', count: GLOTTOLOG_LANGUAGES.filter(l => l.island === 'Maluku').length },
  { id: 'Papua', label: 'Tanah Papua', count: GLOTTOLOG_LANGUAGES.filter(l => l.island === 'Papua').length },
  { id: 'global', label: 'Semua Bahasa (Termasuk Regional Dunia)', count: GLOTTOLOG_LANGUAGES.length }
];
