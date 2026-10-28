import json
import math

RAW_DATA = [
    # glottocode, name, isocode, level, macroarea, lat, lon, province, family
    ("achi1257", "Acehnese", "ace", "language", "Papunesia", 3.90757, 96.6032, "Aceh", "Austronesian (Malayo-Polynesian)"),
    ("bata1292", "Batak Alas-Kluet", "btz", "language", "Papunesia", 3.4293, 97.8123, "Aceh / Sumatera Utara", "Austronesian (Batak)"),
    ("gayo1244", "Gayo", "gay", "language", "Papunesia", 4.3733, 97.3456, "Aceh", "Austronesian (Malayo-Polynesian)"),
    ("bata1290", "Batak Angkola", "akb", "language", "Papunesia", 1.66127, 99.60248, "Sumatera Utara", "Austronesian (Batak)"),
    ("bata1294", "Batak Dairi", "btd", "language", "Papunesia", 2.51438, 98.2427, "Sumatera Utara", "Austronesian (Batak)"),
    ("bata1293", "Batak Karo", "btx", "language", "Papunesia", 2.12787, 98.2517, "Sumatera Utara", "Austronesian (Batak)"),
    ("bata1291", "Batak Mandailing", "btm", "language", "Papunesia", 0.85805, 99.898, "Sumatera Utara", "Austronesian (Batak)"),
    ("bata1288", "Batak Simalungun", "bts", "language", "Papunesia", 3.04372, 98.9083, "Sumatera Utara", "Austronesian (Batak)"),
    ("bata1289", "Batak Toba", "bbc", "language", "Papunesia", 2.35498, 99.1761, "Sumatera Utara", "Austronesian (Batak)"),
    ("nias1242", "Nias", "nia", "language", "Papunesia", 0.90691, 97.4961, "Sumatera Utara (Nias)", "Austronesian (Barrier Islands)"),
    ("mina1268", "Minangkabau", "min", "language", "Papunesia", -0.896, 100.44, "Sumatera Barat", "Austronesian (Malayic)"),
    ("ment1249", "Mentawai", "mwv", "language", "Papunesia", -1.41092, 98.9401, "Sumatera Barat (Mentawai)", "Austronesian (Barrier Islands)"),
    ("keri1250", "Kerinci", "kvr", "language", "Papunesia", -1.93668, 101.403, "Jambi", "Austronesian (Malayic)"),
    ("jamb1236", "Jambi Malay", "jax", "language", "Papunesia", -2.6469, 103.13, "Jambi", "Austronesian (Malayic)"),
    ("duan1242", "Duano", "dup", "language", "Papunesia", 0.72162, 103.46759, "Riau / Kepulauan Riau", "Austronesian (Malayic)"),
    ("reja1240", "Rejang", "rej", "language", "Papunesia", -3.33056, 102.434, "Bengkulu", "Austronesian (Land Dayak-related)"),
    ("engg1245", "Enggano", "eno", "language", "Papunesia", -5.38846, 102.245, "Bengkulu (Pulau Enggano)", "Austronesian (Enggano)"),
    ("musi1241", "Musi", "mui", "language", "Papunesia", -2.93987, 103.945, "Sumatera Selatan", "Austronesian (Malayic)"),
    ("koma1266", "Komering", "kge", "language", "Papunesia", -3.79215, 105.107, "Sumatera Selatan", "Austronesian (Lampungic)"),
    ("kubu1239", "Kubu", "kvb", "language", "Papunesia", -2.42661, 102.193, "Jambi / Sumsel", "Austronesian (Malayic)"),
    ("bang1365", "Bangka", "mfb", "language", "Papunesia", -1.73288, 105.897, "Kepulauan Bangka Belitung", "Austronesian (Malayic)"),
    ("lamp1243", "Lampung Api", "ljp", "language", "Papunesia", -5.73463, 105.037, "Lampung", "Austronesian (Lampungic)"),
    ("lamp1242", "Lampung Nyo", "abl", "language", "Papunesia", -4.43957, 105.397, "Lampung", "Austronesian (Lampungic)"),
    ("haji1235", "Haji", "hji", "language", "Papunesia", -5.07781, 104.714, "Sumsel / Lampung", "Austronesian (Malayic)"),
    
    # JAWA & BALI
    ("sund1252", "Sundanese", "sun", "language", "Papunesia", -6.89708, 107.106, "Jawa Barat & Banten", "Austronesian (Malayo-Polynesian)"),
    ("badu1237", "Badui", "bac", "dialect", "Papunesia", -6.35359, 106.177, "Banten", "Austronesian (Sundanese)"),
    ("beta1252", "Betawi", "bew", "language", "Papunesia", -6.21174, 107.022, "DKI Jakarta & Bodetabek", "Austronesian (Malayic Creole)"),
    ("cire1240", "Cirebon Javanese", "", "dialect", "Papunesia", -6.74533, 108.538, "Jawa Barat (Pantura)", "Austronesian (Javanic)"),
    ("java1254", "Javanese", "jav", "language", "Papunesia", -7.001, 109.287, "Jawa Tengah & D.I. Yogyakarta", "Austronesian (Javanic)"),
    ("nucl1460", "Madurese", "mad", "language", "Papunesia", -7.0, 113.0, "Jawa Timur (Madura)", "Austronesian (Madurese)"),
    ("kane1243", "Kangean", "kkv", "language", "Papunesia", -7.98335, 112.968, "Jawa Timur (Kepulauan Kangean)", "Austronesian (Madurese)"),
    ("osin1237", "Osing", "osi", "language", "Papunesia", -8.25262, 114.292, "Jawa Timur (Banyuwangi)", "Austronesian (Javanic)"),
    ("teng1272", "Tengger", "tes", "language", "Papunesia", -7.89069, 113.037, "Jawa Timur (Bromo Tengger)", "Austronesian (Javanic)"),
    ("indo1316", "Standard Indonesian", "ind", "language", "Papunesia", -7.33458, 109.716, "Nasional (Republik Indonesia)", "Austronesian (Malayic)"),
    ("bali1278", "Balinese", "ban", "language", "Papunesia", -8.35714, 115.075, "Bali", "Austronesian (Bali-Sasak-Sumbawa)"),
    ("bali1279", "Balinese Malay", "mhp", "language", "Papunesia", -8.355884, 114.648391, "Bali Barat", "Austronesian (Malayic)"),
    
    # KALIMANTAN
    ("kend1254", "Kendayan-Belangin", "knx", "language", "Papunesia", 1.47957, 109.467, "Kalimantan Barat", "Austronesian (Malayic Dayak)"),
    ("beny1237", "Benyadu'", "byd", "language", "Papunesia", 0.78534, 109.753, "Kalimantan Barat", "Austronesian (Land Dayak)"),
    ("jang1257", "Jangkang", "djo", "language", "Papunesia", 0.29738, 110.647, "Kalimantan Barat", "Austronesian (Land Dayak)"),
    ("mual1241", "Mualang", "mtd", "language", "Papunesia", 0.31083, 111.077, "Kalimantan Barat", "Austronesian (Ibanic)"),
    ("sebe1242", "Seberuang", "sbx", "language", "Papunesia", -0.02463, 111.212, "Kalimantan Barat", "Austronesian (Ibanic)"),
    ("buka1261", "Bukat", "bvk", "language", "Papunesia", 1.29075, 113.246, "Kalimantan Barat", "Austronesian (Punan-Bukat)"),
    ("hovo1239", "Hobongan", "hov", "language", "Papunesia", 0.9841, 113.897, "Kalimantan Barat", "Austronesian (Müller-Schwaner)"),
    ("otda1235", "Ot Danum", "otd", "language", "Papunesia", -0.3955, 113.469, "Kalimantan Tengah", "Austronesian (Barito Barat)"),
    ("ngaj1237", "Ngaju", "nij", "language", "Papunesia", -1.58463, 112.794, "Kalimantan Tengah", "Austronesian (Barito Barat)"),
    ("baku1263", "Bakumpai", "bkr", "language", "Papunesia", -1.98842, 114.77, "Kalimantan Tengah / Selatan", "Austronesian (Barito Barat)"),
    ("dusu1269", "Dusun Malang", "duq", "language", "Papunesia", -0.85277, 115.392, "Kalimantan Tengah", "Austronesian (Barito Timur)"),
    ("dusu1267", "Dusun Witu", "duw", "language", "Papunesia", -1.57408, 114.979, "Kalimantan Tengah", "Austronesian (Barito Timur)"),
    ("maan1238", "Ma'anyan", "mhy", "language", "Papunesia", -2.1239, 115.092, "Kalimantan Tengah / Kalsel", "Austronesian (Barito Timur)"),
    ("lawa1257", "Lawangan", "lbx", "language", "Papunesia", -1.80261, 115.876, "Kalimantan Tengah / Timur", "Austronesian (Barito Timur)"),
    ("tawo1243", "Tawoyan", "twy", "language", "Papunesia", -1.30017, 115.204, "Kalimantan Tengah", "Austronesian (Barito Timur)"),
    ("dusu1271", "Dusun Deyah", "dun", "language", "Papunesia", -1.95514, 115.578, "Kalimantan Selatan", "Austronesian (Barito Timur)"),
    ("banj1239", "Banjar", "bjn", "language", "Papunesia", 0.747105, 115.79, "Kalimantan Selatan & Timur", "Austronesian (Malayic)"),
    ("teng1267", "Tenggarong Kutai Malay", "vkt", "language", "Papunesia", 0.71803, 117.645, "Kalimantan Timur", "Austronesian (Malayic)"),
    ("kota1275", "Kota Bangun Kutai Malay", "mqg", "language", "Papunesia", -0.27049, 116.297, "Kalimantan Timur", "Austronesian (Malayic)"),
    ("ampa1239", "Ampanang", "apg", "language", "Papunesia", -0.79259, 116.349, "Kalimantan Timur", "Austronesian (Barito Timur)"),
    ("tunj1244", "Tunjung", "tjg", "language", "Papunesia", -0.29048, 115.883, "Kalimantan Timur", "Austronesian (Barito Timur)"),
    ("baha1257", "Bahau", "bhv", "language", "Papunesia", 0.30801, 115.332, "Kalimantan Timur", "Austronesian (Kayanic)"),
    ("busa1255", "Busang Kayan", "bfg", "language", "Papunesia", 0.03494, 115.401, "Kalimantan Timur", "Austronesian (Kayanic)"),
    ("aohe1237", "Aoheng-Seputan", "pni", "language", "Papunesia", 0.87404, 114.127, "Kalimantan Timur", "Austronesian (Kayan-Kenyah)"),
    ("moda1244", "Modang", "mxd", "language", "Papunesia", 0.80793, 116.573, "Kalimantan Timur", "Austronesian (Kayanic)"),
    ("sega1243", "Segai", "sge", "language", "Papunesia", 1.97695, 116.954, "Kalimantan Timur", "Austronesian (Kayanic)"),
    ("bera1262", "Berau Malay", "bve", "language", "Papunesia", 1.6687, 117.934, "Kalimantan Timur (Berau)", "Austronesian (Malayic)"),
    ("basa1286", "Basap", "bdb", "language", "Papunesia", 1.41405, 117.942, "Kalimantan Timur (Sangkulirang)", "Austronesian (Land Dayak)"),
    ("bolo1268", "Bolongan", "blj", "language", "Papunesia", 2.75927, 117.293, "Kalimantan Utara", "Austronesian (Kayan-Murik)"),
    ("buru1304", "Burusu", "bqr", "language", "Papunesia", 3.36912, 117.012, "Kalimantan Utara", "Austronesian (Kayanic)"),
    ("abai1241", "Abai Tubu-Abai Sembuak", "", "language", "Papunesia", 3.524226, 116.162455, "Kalimantan Utara (Malinau)", "Austronesian (Murutic)"),
    ("puto1237", "Putoh", "put", "language", "Papunesia", 3.42467, 116.443, "Kalimantan Utara", "Austronesian (Lun Bawang)"),
    ("lund1271", "Lundayeh", "lnd", "language", "Papunesia", 4.25064, 115.5, "Kalimantan Utara (Krayan)", "Austronesian (Kelabitic)"),
    ("semb1240", "Sembakung Murut", "sbr", "language", "Papunesia", 4.22102, 116.799, "Kalimantan Utara (Nunukan)", "Austronesian (Murutic)"),
    ("okol1241", "Okolod", "kqv", "language", "Papunesia", 4.53989, 115.753, "Kalimantan Utara (Nunukan)", "Austronesian (Murutic)"),
    ("puna1266", "Punan Tubu", "puj", "language", "Papunesia", 2.86972, 116.26, "Kalimantan Utara", "Austronesian (Punan)"),
    
    # SULAWESI
    ("buol1237", "Buol", "blf", "language", "Papunesia", 0.97727, 121.519, "Sulawesi Tengah (Buol)", "Austronesian (Gorontalo-Mongondow)"),
    ("toli1245", "Totoli", "txe", "language", "Papunesia", 1.14995, 120.875, "Sulawesi Tengah (Tolitoli)", "Austronesian (Tomini-Tolitoli)"),
    ("dond1249", "Dondo", "dok", "language", "Papunesia", 0.80348, 120.707, "Sulawesi Tengah (Tolitoli)", "Austronesian (Tomini-Tolitoli)"),
    ("tomi1243", "Tomini", "txm", "language", "Papunesia", 0.42569, 120.89, "Sulawesi Tengah (Parigi Moutong)", "Austronesian (Tomini-Tolitoli)"),
    ("lauj1238", "Lauje", "law", "language", "Papunesia", 0.50708, 120.262, "Sulawesi Tengah (Parigi Moutong)", "Austronesian (Tomini-Tolitoli)"),
    ("taje1237", "Taje", "pee", "language", "Papunesia", -0.72583, 120.078, "Sulawesi Tengah (Sigi)", "Austronesian (Tomini-Tolitoli)"),
    ("tajio1246", "Tajio", "tdj", "language", "Papunesia", -0.31553, 120.01, "Sulawesi Tengah (Parigi Moutong)", "Austronesian (Tomini-Tolitoli)"),
    ("damp1237", "Dampelas", "dms", "language", "Papunesia", 0.70234, 120.219, "Sulawesi Tengah (Donggala)", "Austronesian (Tomini-Tolitoli)"),
    ("bala1314", "Balaesang", "bls", "language", "Papunesia", -0.05644, 119.689, "Sulawesi Tengah (Donggala)", "Austronesian (Tomini-Tolitoli)"),
    ("pend1242", "Pendau", "ums", "language", "Papunesia", -0.11396, 119.862, "Sulawesi Tengah (Donggala)", "Austronesian (Tomini-Tolitoli)"),
    ("daak1235", "Da'a Kaili", "kzf", "language", "Papunesia", -1.21051, 119.527, "Sulawesi Tengah (Palu & Sigi)", "Austronesian (Kaili-Pamona)"),
    ("ledo1238", "Ledo Kaili", "lew", "language", "Papunesia", -1.03033, 120.132, "Sulawesi Tengah (Lembah Palu)", "Austronesian (Kaili-Pamona)"),
    ("unde1235", "Unde Kaili", "unz", "language", "Papunesia", -0.85876, 119.673, "Sulawesi Tengah (Banawa)", "Austronesian (Kaili-Pamona)"),
    ("lind1248", "Tado-Lindu", "klw", "language", "Papunesia", -1.35748, 120.063, "Sulawesi Tengah (Danau Lindu)", "Austronesian (Kaili-Pamona)"),
    ("sedo1237", "Sedoa", "tvw", "language", "Papunesia", -1.37295, 120.378, "Sulawesi Tengah (Lore Utara)", "Austronesian (Kaili-Pamona)"),
    ("beso1237", "Besoa", "bep", "language", "Papunesia", -1.60095, 120.379, "Sulawesi Tengah (Lore Tengah)", "Austronesian (Kaili-Pamona)"),
    ("bada1261", "Bada (Indonesia)", "bhz", "language", "Papunesia", -1.80249, 120.319, "Sulawesi Tengah (Lembah Bada)", "Austronesian (Kaili-Pamona)"),
    ("moma1242", "Moma", "myl", "language", "Papunesia", -1.4313, 120.009, "Sulawesi Tengah (Kulawi)", "Austronesian (Kaili-Pamona)"),
    ("umaa1242", "Uma", "ppk", "language", "Papunesia", -1.70416, 119.968, "Sulawesi Tengah (Pipikoro)", "Austronesian (Kaili-Pamona)"),
    ("napu1241", "Napu", "npy", "language", "Papunesia", -1.43707, 120.338, "Sulawesi Tengah (Lore)", "Austronesian (Kaili-Pamona)"),
    ("pamo1252", "Pamona", "pmf", "language", "Papunesia", -1.62663, 121.268, "Sulawesi Tengah (Poso)", "Austronesian (Kaili-Pamona)"),
    ("salu1253", "Saluan", "loe", "language", "Papunesia", -0.873, 122.746, "Sulawesi Tengah (Luwuk Banggai)", "Austronesian (Saluan-Banggai)"),
    ("bala1315", "Balantak", "blz", "language", "Papunesia", -0.86809, 123.289, "Sulawesi Tengah (Balantak)", "Austronesian (Saluan-Banggai)"),
    ("andi1257", "Andio", "bzb", "language", "Papunesia", -0.88368, 123.174, "Sulawesi Tengah (Banggai)", "Austronesian (Saluan-Banggai)"),
    ("batu1260", "Batui", "zbt", "language", "Papunesia", -1.254442, 122.487151, "Sulawesi Tengah (Batui)", "Austronesian (Saluan-Banggai)"),
    ("bang1368", "Banggai", "bgz", "language", "Papunesia", -1.58305, 123.171, "Sulawesi Tengah (Banggai Laut)", "Austronesian (Saluan-Banggai)"),
    ("bobo1255", "Bobongko", "bgb", "language", "Papunesia", -0.36759, 121.922, "Sulawesi Tengah (Kepulauan Togean)", "Austronesian (Saluan-Banggai)"),
    ("mori1269", "Mori Atas", "mzq", "language", "Papunesia", -2.2555, 121.035, "Sulawesi Tengah (Morowali Utara)", "Austronesian (Bungku-Tolaki)"),
    ("mori1268", "Mori Bawah", "xmz", "language", "Papunesia", -2.56016, 121.37, "Sulawesi Tengah (Morowali)", "Austronesian (Bungku-Tolaki)"),
    ("baho1237", "Bahonsuai", "bsu", "language", "Papunesia", -2.22572, 121.707, "Sulawesi Tengah (Bungku Barat)", "Austronesian (Bungku-Tolaki)"),
    ("bung1269", "Bungku", "bkz", "language", "Papunesia", -3.22197, 122.212, "Sulawesi Tengah (Bungku)", "Austronesian (Bungku-Tolaki)"),
    ("koro1311", "Koroni", "xkq", "language", "Papunesia", -2.6367, 121.977, "Sulawesi Tengah (Bungku Tengah)", "Austronesian (Bungku-Tolaki)"),
    ("tola1247", "Tolaki", "lbw", "language", "Papunesia", -4.03577, 121.888, "Sulawesi Tenggara (Kendari & Konawe)", "Austronesian (Bungku-Tolaki)"),
    ("wawo1239", "Wawonii", "wow", "language", "Papunesia", -4.13587, 123.1, "Sulawesi Tenggara (Pulau Wawonii)", "Austronesian (Bungku-Tolaki)"),
    ("moro1287", "Moronene", "mqn", "language", "Papunesia", -4.62361, 121.824, "Sulawesi Tenggara (Bombana)", "Austronesian (Bungku-Tolaki)"),
    ("muna1247", "Muna", "mnb", "language", "Papunesia", -5.40419, 122.541, "Sulawesi Tenggara (Pulau Muna)", "Austronesian (Muna-Buton)"),
    ("panc1247", "Pancana", "pnp", "language", "Papunesia", -5.29587, 122.968, "Sulawesi Tenggara (Muna)", "Austronesian (Muna-Buton)"),
    ("woli1241", "Wolio", "wlo", "language", "Papunesia", -5.33, 122.67, "Sulawesi Tenggara (Baubau)", "Austronesian (Muna-Buton)"),
    ("ciac1237", "Cia-Cia", "cia", "language", "Papunesia", -5.68289, 122.791, "Sulawesi Tenggara (Buton Selatan)", "Austronesian (Muna-Buton)"),
    ("kama1364", "Kamaru", "kgx", "language", "Papunesia", -5.15696, 123.045, "Sulawesi Tenggara (Buton)", "Austronesian (Muna-Buton)"),
    ("lasa1237", "Lasalimu", "llm", "language", "Papunesia", -5.23602, 123.129, "Sulawesi Tenggara (Buton)", "Austronesian (Muna-Buton)"),
    ("kumb1274", "Kumbewaha", "xks", "language", "Papunesia", -5.34485, 123.154, "Sulawesi Tenggara (Buton)", "Austronesian (Muna-Buton)"),
    ("buso1238", "Busoa", "bup", "language", "Papunesia", -5.60524, 122.622, "Sulawesi Tenggara (Batauga)", "Austronesian (Muna-Buton)"),
    ("tuka1248", "Tukang Besi North", "khc", "language", "Papunesia", -5.30994, 123.578, "Sulawesi Tenggara (Wakatobi Utara)", "Austronesian (Muna-Buton)"),
    ("tuka1249", "Tukang Besi South", "bhq", "language", "Papunesia", -5.7478, 123.948, "Sulawesi Tenggara (Wakatobi Selatan)", "Austronesian (Muna-Buton)"),
    ("budo1241", "Budong-Budong", "bdx", "language", "Papunesia", -2.07756, 119.327, "Sulawesi Barat (Mamuju Tengah)", "Austronesian (South Sulawesi)"),
    ("mand1442", "Mandar", "mdr", "language", "Papunesia", -3.34717, 119.068, "Sulawesi Barat (Polewali & Majene)", "Austronesian (South Sulawesi)"),
    ("camp1262", "Campalagian", "cml", "language", "Papunesia", -3.47851, 119.16863, "Sulawesi Barat (Polewali Mandar)", "Austronesian (South Sulawesi)"),
    ("bamb1270", "Bambam", "ptu", "language", "Papunesia", -3.02759, 119.201, "Sulawesi Barat (Mamasa)", "Austronesian (South Sulawesi)"),
    ("mama1276", "Mamasa", "mqj", "language", "Papunesia", -3.0811, 119.484, "Sulawesi Barat (Mamasa)", "Austronesian (South Sulawesi)"),
    ("aral1243", "Aralle-Tabulahan", "atq", "language", "Papunesia", -2.78397, 119.319, "Sulawesi Barat (Mamasa)", "Austronesian (South Sulawesi)"),
    ("kalu1247", "Kalumpang", "kli", "language", "Papunesia", -2.33388, 119.474, "Sulawesi Barat (Mamuju)", "Austronesian (South Sulawesi)"),
    ("duri1242", "Duri", "mvp", "language", "Papunesia", -3.37081, 119.871, "Sulawesi Selatan (Enrekang)", "Austronesian (Massenrempulu)"),
    ("enre1239", "Enrekang", "ptt", "language", "Papunesia", -3.53848, 119.66, "Sulawesi Selatan (Enrekang)", "Austronesian (Massenrempulu)"),
    ("maiw1250", "Maiwa (Indonesia)", "wmm", "language", "Papunesia", -3.59444, 119.978, "Sulawesi Selatan (Enrekang)", "Austronesian (Massenrempulu)"),
    ("taee1237", "Tae'", "rob", "language", "Papunesia", -2.58205, 120.139, "Sulawesi Selatan (Luwu & Palopo)", "Austronesian (South Sulawesi)"),
    ("tora1261", "Toraja-Sa'dan", "sda", "language", "Papunesia", -2.97144, 119.829, "Sulawesi Selatan (Tana Toraja)", "Austronesian (South Sulawesi)"),
    ("bugi1244", "Buginese", "bug", "language", "Papunesia", -4.47, 119.977, "Sulawesi Selatan (Bone, Soppeng, Wajo)", "Austronesian (South Sulawesi)"),
    ("maka1311", "Makasar", "mak", "language", "Papunesia", -5.65551, 119.838, "Sulawesi Selatan (Gowa & Takalar)", "Austronesian (South Sulawesi)"),
    ("maka1305", "Makassar Malay", "mfp", "language", "Papunesia", -5.16108, 119.408, "Sulawesi Selatan (Kota Makassar)", "Austronesian (Malayic)"),
    ("bent1237", "Bentong", "bnu", "language", "Papunesia", -4.76004, 119.806, "Sulawesi Selatan (Maros)", "Austronesian (South Sulawesi)"),
    ("sela1260", "Selayar", "sly", "language", "Papunesia", -6.10145, 120.496, "Sulawesi Selatan (Kepulauan Selayar)", "Austronesian (South Sulawesi)"),
    ("laiy1246", "Laiyolo", "lji", "language", "Papunesia", -6.45512, 120.483, "Sulawesi Selatan (Selayar)", "Austronesian (South Sulawesi)"),
    ("goro1259", "Gorontalo", "gor", "language", "Papunesia", 0.62689, 122.288, "Gorontalo", "Austronesian (Gorontalo-Mongondow)"),
    ("suwa1241", "Suwawa", "swu", "language", "Papunesia", 0.4907, 123.362, "Gorontalo (Bone Bolango)", "Austronesian (Gorontalo-Mongondow)"),
    ("kaid1239", "Kaidipang", "kzp", "language", "Papunesia", 0.85641, 123.217, "Sulawesi Utara (Bolmut)", "Austronesian (Gorontalo-Mongondow)"),
    ("bint1245", "Bintauna", "bne", "language", "Papunesia", 0.75069, 123.486, "Sulawesi Utara (Bolmut)", "Austronesian (Gorontalo-Mongondow)"),
    ("mong1342", "Mongondow", "mog", "language", "Papunesia", 0.64616, 124.114, "Sulawesi Utara (Kotamobagu)", "Austronesian (Gorontalo-Mongondow)"),
    ("lola1250", "Lolak", "llq", "language", "Papunesia", 0.85544, 124.117, "Sulawesi Utara (Bolmong)", "Austronesian (Gorontalo-Mongondow)"),
    ("pono1240", "Ponosakan", "pns", "language", "Papunesia", 0.91716, 124.712, "Sulawesi Utara (Minahasa Tenggara)", "Austronesian (Gorontalo-Mongondow)"),
    ("tond1251", "Tondano", "tdn", "language", "Papunesia", 1.28024, 124.964, "Sulawesi Utara (Minahasa)", "Austronesian (Minahasan)"),
    ("tomb1243", "Tombulu", "tom", "language", "Papunesia", 1.39715, 124.754, "Sulawesi Utara (Tomohon)", "Austronesian (Minahasan)"),
    ("tons1240", "Tonsea", "txs", "language", "Papunesia", 1.51393, 125.052, "Sulawesi Utara (Minahasa Utara)", "Austronesian (Minahasan)"),
    ("tont1239", "Tontemboan", "tnt", "language", "Papunesia", 1.24813, 124.654, "Sulawesi Utara (Minahasa Selatan)", "Austronesian (Minahasan)"),
    ("tons1239", "Tonsawang", "tnw", "language", "Papunesia", 1.0539, 124.652, "Sulawesi Utara (Minahasa)", "Austronesian (Minahasan)"),
    ("sang1336", "Sangir", "sxn", "language", "Papunesia", 3.50554, 125.56523, "Sulawesi Utara (Kepulauan Sangihe)", "Austronesian (Sangiric)"),
    ("tala1285", "Talaud", "tld", "language", "Papunesia", 4.11846, 126.795, "Sulawesi Utara (Kepulauan Talaud)", "Austronesian (Sangiric)"),
    ("mala1481", "Manado Malay", "xmm", "language", "Papunesia", 1.48099, 124.843, "Sulawesi Utara (Kota Manado)", "Austronesian (Malayic Creole)"),

    # NUSA TENGGARA
    ("sasa1249", "Sasak", "sas", "language", "Papunesia", -8.58349, 116.284, "Nusa Tenggara Barat (Lombok)", "Austronesian (Bali-Sasak-Sumbawa)"),
    ("sumb1241", "Sumbawa", "smw", "language", "Papunesia", -8.71919, 117.472, "Nusa Tenggara Barat (Sumbawa)", "Austronesian (Bali-Sasak-Sumbawa)"),
    ("bima1247", "Bima", "bhp", "language", "Papunesia", -8.57376, 118.445, "Nusa Tenggara Barat (Bima & Dompu)", "Austronesian (Bima-Lembata)"),
    ("mang1405", "Manggarai", "mqy", "language", "Papunesia", -8.55748, 120.329, "Nusa Tenggara Timur (Manggarai)", "Austronesian (Bima-Lembata)"),
    ("weje1237", "Wewewa", "wew", "language", "Papunesia", -9.55099, 119.349, "Nusa Tenggara Timur (Sumba Barat Daya)", "Austronesian (Sumba-Hawu)"),
    ("kodi1247", "Kodi", "kod", "language", "Papunesia", -9.6373, 119.114, "Nusa Tenggara Timur (Kodi, Sumba)", "Austronesian (Sumba-Hawu)"),
    ("lamb1273", "Lamboya", "lmy", "language", "Papunesia", -9.70434, 119.344, "Nusa Tenggara Timur (Sumba Barat)", "Austronesian (Sumba-Hawu)"),
    ("anak1240", "Anakalang", "akg", "language", "Papunesia", -9.63425, 119.605, "Nusa Tenggara Timur (Sumba Tengah)", "Austronesian (Sumba-Hawu)"),
    ("wanu1241", "Wanukaka", "wnk", "language", "Papunesia", -9.69834, 119.468, "Nusa Tenggara Timur (Sumba)", "Austronesian (Sumba-Hawu)"),
    ("kamb1299", "Kambera", "xbr", "language", "Papunesia", -9.88447, 120.235, "Nusa Tenggara Timur (Sumba Timur)", "Austronesian (Sumba-Hawu)"),
    ("sabu1255", "Hawu", "hvn", "language", "Papunesia", -10.5522, 121.847, "Nusa Tenggara Timur (Sabu Raijua)", "Austronesian (Sumba-Hawu)"),
    ("dhao1237", "Dhao", "nfa", "language", "Papunesia", -10.8098, 122.658, "Nusa Tenggara Timur (Pulau Ndao)", "Austronesian (Sumba-Hawu)"),
    ("ter1237", "Termanu", "twu", "language", "Papunesia", -10.7326, 123.169, "Nusa Tenggara Timur (Rote Ndao)", "Austronesian (Timoric)"),
    ("deng1253", "Dengka", "dnk", "language", "Papunesia", -10.7866, 122.946, "Nusa Tenggara Timur (Rote Ndao)", "Austronesian (Timoric)"),
    ("bilb1242", "Bilba", "bpz", "language", "Papunesia", -10.6503, 123.307, "Nusa Tenggara Timur (Rote Ndao)", "Austronesian (Timoric)"),
    ("dela1251", "Dela-Oenale", "row", "language", "Papunesia", -10.8469, 122.852, "Nusa Tenggara Timur (Rote Ndao)", "Austronesian (Timoric)"),
    ("ring1244", "Ringgou", "rgu", "language", "Papunesia", -10.5515, 123.311, "Nusa Tenggara Timur (Rote Timur)", "Austronesian (Timoric)"),
    ("helo1243", "Helong", "heg", "language", "Papunesia", -10.2647, 123.377, "Nusa Tenggara Timur (Semau & Kupang)", "Austronesian (Timoric)"),
    ("kupa1239", "Kupang Malay", "mkn", "language", "Papunesia", -10.2526, 123.63, "Nusa Tenggara Timur (Kota Kupang)", "Austronesian (Malayic)"),
    ("uabm1237", "Uab Meto", "aoz", "language", "Papunesia", -9.77284, 124.144, "Nusa Tenggara Timur (Timor Barat)", "Austronesian (Timoric)"),
    ("tetu1245", "Tetum", "tet", "language", "Papunesia", -9.11217, 125.528, "Nusa Tenggara Timur (Belu) & Timor-Leste", "Austronesian (Timoric)"),
    ("buna1278", "Bunak", "bfn", "language", "Papunesia", -9.13618, 125.216, "Nusa Tenggara Timur (Lamaknen, Belu)", "Timor-Alor-Pantar (Papuan)"),
    ("kema1243", "Kemak", "kem", "language", "Papunesia", -9.00299, 125.159, "Nusa Tenggara Timur (Belu)", "Austronesian (Timoric)"),
    ("alor1247", "Alorese", "aol", "language", "Papunesia", -8.20382, 124.264, "Nusa Tenggara Timur (Pantar & Alor)", "Austronesian (Flores-Lembata)"),
    ("abui1241", "Abui", "abz", "language", "Papunesia", -8.31058, 124.588, "Nusa Tenggara Timur (Alor Tengah)", "Timor-Alor-Pantar (Papuan)"),
    ("adan1251", "Adang", "adn", "language", "Papunesia", -8.18958, 124.448, "Nusa Tenggara Timur (Alor Barat)", "Timor-Alor-Pantar (Papuan)"),
    ("kama1365", "Kamang", "woi", "language", "Papunesia", -8.26897, 124.792, "Nusa Tenggara Timur (Alor)", "Timor-Alor-Pantar (Papuan)"),
    ("blag1240", "Blagar", "beu", "language", "Papunesia", -8.31787, 124.251, "Nusa Tenggara Timur (Pulau Pura & Pantar)", "Timor-Alor-Pantar (Papuan)"),
    ("teiw1235", "Teiwa", "twe", "language", "Papunesia", -8.37662, 124.174, "Nusa Tenggara Timur (Pantar)", "Timor-Alor-Pantar (Papuan)"),
    ("kaer1234", "Kaera", "jka", "language", "Papunesia", -8.3287, 124.0177, "Nusa Tenggara Timur (Pantar Timur)", "Timor-Alor-Pantar (Papuan)"),
    ("lamm1241", "Western Pantar", "lev", "language", "Papunesia", -8.52787, 124.057, "Nusa Tenggara Timur (Pantar Barat)", "Timor-Alor-Pantar (Papuan)"),
    ("lama1277", "Lamaholot", "slp", "language", "Papunesia", -8.36439, 122.803, "Nusa Tenggara Timur (Flores Timur)", "Austronesian (Flores-Lembata)"),
    ("adon1237", "Adonara", "adr", "language", "Papunesia", -8.32027, 123.159, "Nusa Tenggara Timur (Pulau Adonara)", "Austronesian (Flores-Lembata)"),
    ("keda1252", "Kedang", "ksx", "language", "Papunesia", -8.23039, 123.77, "Nusa Tenggara Timur (Lembata)", "Austronesian (Flores-Lembata)"),
    ("sika1262", "Sika", "ski", "language", "Papunesia", -8.67302, 122.38, "Nusa Tenggara Timur (Maumere)", "Austronesian (Bima-Lembata)"),
    ("lioo1240", "Li'o", "ljl", "language", "Papunesia", -8.68615, 121.832, "Nusa Tenggara Timur (Ende & Sikka)", "Austronesian (Bima-Lembata)"),
    ("ende1246", "Ende", "end", "language", "Papunesia", -8.70998, 121.555, "Nusa Tenggara Timur (Kabupaten Ende)", "Austronesian (Bima-Lembata)"),
    ("ngad1261", "Ngad'a", "nxg", "language", "Papunesia", -8.79508, 120.976, "Nusa Tenggara Timur (Bajawa)", "Austronesian (Bima-Lembata)"),
    ("keoo1238", "Kéo", "xxk", "language", "Papunesia", -8.8704, 121.256, "Nusa Tenggara Timur (Nagekeo)", "Austronesian (Bima-Lembata)"),
    ("nage1237", "Nage", "nxe", "language", "Papunesia", -8.70513, 121.31, "Nusa Tenggara Timur (Boawae)", "Austronesian (Bima-Lembata)"),

    # MALUKU & MALUKU UTARA
    ("buru1303", "Buru (Indonesia)", "mhs", "language", "Papunesia", -3.43957, 126.632, "Maluku (Pulau Buru)", "Austronesian (Central Maluku)"),
    ("lise1239", "Lisela", "lcl", "language", "Papunesia", -3.27358, 126.981, "Maluku (Pulau Buru Utara)", "Austronesian (Central Maluku)"),
    ("kaye1241", "Kayeli", "kzl", "language", "Papunesia", -3.39247, 127.118, "Maluku (Teluk Kayeli, Buru)", "Austronesian (Central Maluku)"),
    ("ambe1248", "Ambelau", "amv", "language", "Papunesia", -3.85919, 127.196, "Maluku (Pulau Ambelau)", "Austronesian (Central Maluku)"),
    ("alun1238", "Alune", "alp", "language", "Papunesia", -3.11477, 128.394, "Maluku (Seram Barat)", "Austronesian (Central Maluku)"),
    ("nort2864", "Wemale", "weo", "language", "Papunesia", -3.05143, 128.839, "Maluku (Seram Barat)", "Austronesian (Central Maluku)"),
    ("amah1245", "Amahai", "amq", "language", "Papunesia", -3.32028, 128.939, "Maluku (Seram Selatan)", "Austronesian (Central Maluku)"),
    ("elpa1240", "Elpaputih", "elp", "language", "Papunesia", -3.078, 128.263, "Maluku (Teluk Elpaputih)", "Austronesian (Central Maluku)"),
    ("manu1258", "Manusela", "wha", "language", "Papunesia", -3.1109, 129.429, "Maluku (Pegunungan Seram)", "Austronesian (Central Maluku)"),
    ("lian1255", "Liana-Seti", "ste", "language", "Papunesia", -3.11832, 129.899, "Maluku (Seram Timur)", "Austronesian (Central Maluku)"),
    ("bobo1254", "Bobot", "bty", "language", "Papunesia", -3.43514, 130.179, "Maluku (Seram Timur)", "Austronesian (Central Maluku)"),
    ("gese1240", "Geser-Gorom", "ges", "language", "Papunesia", -3.8016, 130.701, "Maluku (Kepulauan Gorom)", "Austronesian (Central Maluku)"),
    ("bati1253", "Bati (Indonesia)", "bvt", "language", "Papunesia", -3.61403, 130.815, "Maluku (Seram Bagian Timur)", "Austronesian (Central Maluku)"),
    ("ambo1250", "Ambonese Malay", "abs", "language", "Papunesia", -3.71342, 128.184, "Maluku (Kota Ambon)", "Austronesian (Malayic Creole)"),
    ("hitu1239", "Hitu", "htu", "language", "Papunesia", -3.57478, 128.186, "Maluku (Ambon Utara)", "Austronesian (Central Maluku)"),
    ("tule1244", "Tulehu", "tlu", "language", "Papunesia", -3.57785, 128.31, "Maluku (Ambon Timur)", "Austronesian (Central Maluku)"),
    ("haru1244", "Haruku", "hrk", "language", "Papunesia", -3.57029, 128.476, "Maluku (Pulau Haruku)", "Austronesian (Central Maluku)"),
    ("sapa1251", "Saparua", "spr", "language", "Papunesia", -3.58314, 128.639, "Maluku (Pulau Saparua)", "Austronesian (Central Maluku)"),
    ("nusa1245", "Nusa Laut", "nul", "language", "Papunesia", -3.67727, 128.776, "Maluku (Pulau Nusa Laut)", "Austronesian (Central Maluku)"),
    ("keii1239", "Kei", "kei", "language", "Papunesia", -5.63948, 133.02, "Maluku (Kepulauan Kei / Maluku Tenggara)", "Austronesian (Central Malayo-Polynesian)"),
    ("ford1242", "Fordata", "frd", "language", "Papunesia", -7.28902, 131.511, "Maluku (Kepulauan Tanimbar Utara)", "Austronesian (Southeast Maluku)"),
    ("yamd1240", "Yamdena", "jmd", "language", "Papunesia", -7.73722, 131.44, "Maluku (Tanimbar Selatan)", "Austronesian (Southeast Maluku)"),
    ("sela1259", "Selaru", "slu", "language", "Papunesia", -8.18376, 130.961, "Maluku (Pulau Selaru)", "Austronesian (Southeast Maluku)"),
    ("luan1263", "Luang", "lex", "language", "Papunesia", -8.18378, 127.944, "Maluku Barat Daya (Pulau Luang)", "Austronesian (Babar-Luang)"),
    ("kisa1266", "Kisar", "kje", "language", "Papunesia", -8.05122, 127.18, "Maluku Barat Daya (Pulau Kisar)", "Austronesian (Timoric)"),
    ("oirr1263", "Oirata", "oia", "language", "Papunesia", -8.09044, 127.201, "Maluku Barat Daya (Kisar)", "Timor-Alor-Pantar (Papuan)"),
    ("aput1237", "Aputai", "apx", "language", "Papunesia", -7.84732, 126.496, "Maluku Barat Daya (Wetar)", "Austronesian (Timoric)"),
    ("teun1241", "Te'un", "tve", "language", "Papunesia", -6.97086, 129.143718, "Maluku (Pulau Teun)", "Austronesian (Central Malayo-Polynesian)"),
    ("nila1244", "Nila", "nil", "language", "Papunesia", -6.734956, 129.512131, "Maluku (Pulau Nila)", "Austronesian (Central Malayo-Polynesian)"),
    ("seru1245", "Serua", "srw", "language", "Papunesia", -6.31107, 130.017294, "Maluku (Pulau Serua)", "Austronesian (Central Malayo-Polynesian)"),
    ("batu1258", "Batuley", "bay", "language", "Papunesia", -5.814412, 134.784314, "Maluku (Kepulauan Aru)", "Austronesian (Aru Islands)"),
    ("dobe1238", "Dobel", "kvo", "language", "Papunesia", -6.32531, 134.638, "Maluku (Kepulauan Aru)", "Austronesian (Aru Islands)"),
    ("kola1285", "Kola", "kvv", "language", "Papunesia", -5.48833, 134.592, "Maluku (Kepulauan Aru)", "Austronesian (Aru Islands)"),
    ("sula1248", "Sula", "szn", "language", "Papunesia", -2.30765, 125.9656, "Maluku Utara (Kepulauan Sula)", "Austronesian (Sula-Bacan)"),
    ("baca1243", "Bacanese Malay", "btj", "language", "Papunesia", -0.62275, 127.49, "Maluku Utara (Pulau Bacan)", "Austronesian (Malayic)"),
    ("tern1247", "Ternate", "tft", "language", "Papunesia", 0.80562, 127.333, "Maluku Utara (Pulau Ternate)", "North Halmahera (Papuan)"),
    ("tido1248", "Tidore", "tvo", "language", "Papunesia", 0.02461, 127.746, "Maluku Utara (Pulau Tidore)", "North Halmahera (Papuan)"),
    ("gale1259", "Galela", "gbi", "language", "Papunesia", 2.31461, 128.44, "Maluku Utara (Halmahera Utara)", "North Halmahera (Papuan)"),
    ("tobe1252", "Tobelo", "tlb", "language", "Papunesia", 1.0946, 128.154, "Maluku Utara (Tobelo)", "North Halmahera (Papuan)"),
    ("sahu1245", "Sahu", "saj", "language", "Papunesia", 1.00742, 127.493, "Maluku Utara (Halmahera Barat)", "North Halmahera (Papuan)"),
    ("pagu1249", "Pagu", "pgu", "language", "Papunesia", 1.2134, 127.78, "Maluku Utara (Halmahera Utara)", "North Halmahera (Papuan)"),
    ("buli1255", "Buli (Indonesia)", "bzq", "language", "Papunesia", 1.0008, 128.443, "Maluku Utara (Halmahera Timur)", "Austronesian (South Halmahera)"),
    ("sawa1247", "Sawai", "szw", "language", "Papunesia", 0.51111, 128.086, "Maluku Utara (Weda)", "Austronesian (South Halmahera)"),
    ("gebe1237", "Gebe", "gei", "language", "Papunesia", -0.07877, 129.424, "Maluku Utara (Pulau Gebe)", "Austronesian (South Halmahera)"),

    # PAPUA (Papua, Papua Barat, Papua Tengah, Papua Pegunungan, Papua Selatan, Papua Barat Daya)
    ("biak1248", "Biak", "bhw", "language", "Papunesia", -0.9523, 135.879, "Papua (Kepulauan Biak Numfor & Supiori)", "Austronesian (South Halmahera-West New Guinea)"),
    ("roon1237", "Roon", "rnn", "language", "Papunesia", -2.43005, 134.556, "Papua Barat (Teluk Wondama)", "Austronesian (SHWNG)"),
    ("wand1267", "Wandamen", "wad", "language", "Papunesia", -2.25622, 133.996, "Papua Barat (Wasior)", "Austronesian (SHWNG)"),
    ("dusn1237", "Dusner", "dsn", "language", "Papunesia", -2.73859, 134.391, "Papua Barat (Teluk Wondama)", "Austronesian (SHWNG)"),
    ("meos1237", "Meoswar", "mvx", "language", "Papunesia", -2.07828, 134.378, "Papua Barat (Pulau Meoswar)", "Austronesian (SHWNG)"),
    ("yere1243", "Yeretuar", "gop", "language", "Papunesia", -3.01713, 134.656, "Papua Barat (Teluk Cenderawasih)", "Austronesian (SHWNG)"),
    ("ihaa1241", "Iha", "ihp", "language", "Papunesia", -2.81013, 132.271, "Papua Barat (Semenanjung Bomberai, Fakfak)", "Trans-New Guinea (West Bomberai)"),
    ("baha1258", "Baham", "bdw", "language", "Papunesia", -3.10628, 132.637, "Papua Barat (Fakfak)", "Trans-New Guinea (West Bomberai)"),
    ("kara1499", "Kalamang", "kgv", "language", "Papunesia", -3.47037, 132.678, "Papua Barat (Pulau Karas, Fakfak)", "West Bomberai"),
    ("argu1237", "Arguni", "agf", "language", "Papunesia", -2.645798, 132.5556, "Papua Barat (Fakfak)", "Austronesian (SHWNG)"),
    ("buru1308", "Buruwai", "asi", "language", "Papunesia", -3.54561, 133.327, "Papua Barat (Kaimana)", "Trans-New Guinea (Asmat-Kamoro)"),
    ("kamb1302", "North Kamrau", "irx", "language", "Papunesia", -3.53189, 133.518, "Papua Barat (Teluk Kamrau)", "Austronesian (SHWNG)"),
    ("irar1238", "Irarutu", "irh", "language", "Papunesia", -2.94438, 133.586, "Papua Barat (Kaimana)", "Austronesian (SHWNG)"),
    ("hata1243", "Hatam", "had", "language", "Papunesia", -1.13531, 134.037, "Papua Barat (Pegunungan Arfak, Manokwari)", "Hatam-Mansim"),
    ("meya1236", "Meyah", "mej", "language", "Papunesia", -1.18016, 133.618, "Papua Barat (Pegunungan Arfak)", "East Bird's Head"),
    ("mosk1236", "Moskona", "mtj", "language", "Papunesia", -1.62201, 133.145, "Papua Barat (Teluk Bintuni)", "East Bird's Head"),
    ("abun1252", "Abun", "kgr", "language", "Papunesia", -0.57073, 132.416, "Papua Barat Daya (Tambrauw)", "Isolate / West Papuan"),
    ("moii1235", "Moi (Indonesia)", "mxn", "language", "Papunesia", -0.96532, 131.52, "Papua Barat Daya (Sorong)", "West Papuan (Bird's Head)"),
    ("sege1235", "Seget", "sbg", "language", "Papunesia", -1.36931, 131.218, "Papua Barat Daya (Sorong Selatan)", "West Papuan (Bird's Head)"),
    ("tehi1237", "Tehit", "kps", "language", "Papunesia", -1.51049, 131.985, "Papua Barat Daya (Teminabuan)", "West Papuan (Bird's Head)"),
    ("kala1256", "Kalabra", "kzz", "language", "Papunesia", -1.43074, 131.617, "Papua Barat Daya (Sorong Selatan)", "West Papuan (Bird's Head)"),
    ("kais1235", "Kais", "kzm", "language", "Papunesia", -1.78077, 132.312, "Papua Barat Daya (Kais, Sorong Selatan)", "South Bird's Head"),
    ("koko1265", "Kokoda", "xod", "language", "Papunesia", -2.12872, 132.449, "Papua Barat Daya (Kokoda)", "South Bird's Head"),
    ("yaha1248", "Yahadian", "ner", "language", "Papunesia", -1.94317, 132.096, "Papua Barat Daya (Sorong Selatan)", "South Bird's Head"),
    ("maib1239", "Maybrat", "ayz", "language", "Papunesia", -1.3679, 132.591, "Papua Barat Daya (Maybrat / Ayamaru)", "West Papuan"),
    ("karo1303", "Karon Dori", "kgw", "language", "Papunesia", -0.7871, 132.663, "Papua Barat Daya (Tambrauw)", "West Papuan"),
    ("waig1244", "Ambel", "wgo", "language", "Papunesia", -0.17957, 130.917, "Papua Barat Daya (Pulau Waigeo, Raja Ampat)", "Austronesian (SHWNG)"),
    ("kawe1240", "Kawe", "kgb", "language", "Papunesia", -0.17313, 130.327, "Papua Barat Daya (Raja Ampat Barat)", "Austronesian (SHWNG)"),
    ("made1253", "Salawati", "xmx", "language", "Papunesia", -1.05325, 130.833, "Papua Barat Daya (Pulau Salawati)", "Austronesian (SHWNG)"),
    ("matb1237", "Matbat", "xmt", "language", "Papunesia", -1.8801, 130.075, "Papua Barat Daya (Pulau Misool)", "Austronesian (SHWNG)"),
    ("biga1238", "Biga", "bhc", "language", "Papunesia", -1.99574, 130.272, "Papua Barat Daya (Misool)", "Austronesian (SHWNG)"),
    ("amba1265", "Ambai", "amk", "language", "Papunesia", -1.88126, 136.526, "Papua (Kepulauan Yapen Selatan)", "Austronesian (SHWNG)"),
    ("ansu1237", "Ansus", "and", "language", "Papunesia", -1.7543, 135.866, "Papua (Pulau Yapen Barat)", "Austronesian (SHWNG)"),
    ("busa1254", "Busami", "bsm", "language", "Papunesia", -1.73681, 136.032, "Papua (Pulau Yapen Utara)", "Austronesian (SHWNG)"),
    ("mung1269", "Munggui", "mth", "language", "Papunesia", -1.66773, 135.918, "Papua (Yapen Utara)", "Austronesian (SHWNG)"),
    ("maru1247", "Marau", "mvr", "language", "Papunesia", -1.66738, 135.797, "Papua (Yapen)", "Austronesian (SHWNG)"),
    ("pomm1237", "Pom", "pmo", "language", "Papunesia", -1.64224, 135.619, "Papua (Yapen Barat)", "Austronesian (SHWNG)"),
    ("woii1237", "Woi", "wbw", "language", "Papunesia", -1.62746, 135.484, "Papua (Yapen Barat)", "Austronesian (SHWNG)"),
    ("kuru1305", "Kurudu", "kjr", "language", "Papunesia", -1.8444, 137.018, "Papua (Pulau Kurudu)", "Austronesian (SHWNG)"),
    ("nucl1454", "Yawa", "yva", "language", "Papunesia", -1.77196, 136.263, "Papua (Yapen Tengah)", "Yawa (Papuan)"),
    ("waro1242", "Waropen", "wrp", "language", "Papunesia", -2.31142, 136.633, "Papua (Waropen)", "Austronesian (SHWNG)"),
    ("bauz1241", "Bauzi", "bvz", "language", "Papunesia", -2.44717, 137.629, "Papua (Mamberamo Raya)", "Geelvink Bay (Papuan)"),
    ("duvl1242", "Duvle", "duv", "language", "Papunesia", -3.21832, 137.964, "Papua (Lembah Rouffaer / Tariku)", "Lakes Plain"),
    ("fayu1238", "Fayu", "fau", "language", "Papunesia", -3.14497, 136.867, "Papua (Mamberamo / Waropen)", "Lakes Plain"),
    ("iauu1242", "Iau", "tmu", "language", "Papunesia", -3.14537, 137.69, "Papua (Lembah Tariku)", "Lakes Plain"),
    ("obok1239", "Obokuitai", "afz", "language", "Papunesia", -2.88029, 137.924, "Papua (Mamberamo)", "Lakes Plain"),
    ("erit1239", "Eritai", "ert", "language", "Papunesia", -2.71182, 138.053, "Papua (Mamberamo)", "Lakes Plain"),
    ("sika1263", "Sikaritai", "tty", "language", "Papunesia", -2.80285, 138.287, "Papua (Mamberamo)", "Lakes Plain"),
    ("kwer1263", "Kwerba Mamberamo", "xwr", "language", "Papunesia", -2.56457, 138.436, "Papua (Mamberamo)", "Tor-Kwerba"),
    ("nucl1595", "Kwerba", "kwe", "language", "Papunesia", -2.2137, 138.486, "Papua (Sarmi)", "Tor-Kwerba"),
    ("beri1254", "Berik", "bkl", "language", "Papunesia", -2.26904, 138.866, "Papua (Tor River, Sarmi)", "Tor-Kwerba"),
    ("dabe1239", "Dabe", "dbe", "language", "Papunesia", -2.05082, 139.116, "Papua (Sarmi)", "Tor-Kwerba"),
    ("beta1253", "Betaf", "bfe", "language", "Papunesia", -2.12422, 139.255, "Papua (Sarmi)", "Tor-Kwerba"),
    ("sobe1238", "Sobei", "sob", "language", "Papunesia", -1.86998, 138.75, "Papua (Sarmi)", "Austronesian (Oceanic)"),
    ("bong1287", "Bonggo", "bpg", "language", "Papunesia", -2.28044, 139.576, "Papua (Sarmi)", "Austronesian (Oceanic)"),
    ("tarp1240", "Tarpia", "tpf", "language", "Papunesia", -2.322279, 140.115497, "Papua (Demta)", "Austronesian (Oceanic)"),
    ("demt1241", "Demta", "dmy", "language", "Papunesia", -2.38475, 140.166, "Papua (Jayapura)", "Trans-New Guinea"),
    ("tabl1243", "Tabla", "tnm", "language", "Papunesia", -2.45368, 140.396, "Papua (Tanah Merah, Jayapura)", "Sentani"),
    ("nucl1632", "Sentani", "set", "language", "Papunesia", -2.6013, 140.512, "Papua (Danau Sentani, Jayapura)", "Sentani"),
    ("nucl1633", "Nimboran", "nir", "language", "Papunesia", -2.5803, 140.179, "Papua (Genyem, Jayapura)", "Nimboran"),
    ("kemt1242", "Kemtuik", "kmt", "language", "Papunesia", -2.64894, 140.372, "Papua (Jayapura)", "Nimboran"),
    ("gres1240", "Gresi", "grs", "language", "Papunesia", -2.72229, 140.279, "Papua (Jayapura)", "Nimboran"),
    ("toba1266", "Tobati", "tti", "language", "Papunesia", -2.56434, 140.71, "Papua (Teluk Yos Sudarso, Kota Jayapura)", "Austronesian (Oceanic)"),
    ("kayu1243", "Kayupulau", "kzu", "language", "Papunesia", -2.54455, 140.72068, "Papua (Kota Jayapura)", "Austronesian (Oceanic)"),
    ("nucl1634", "Skou", "skv", "language", "Papunesia", -2.64378, 140.902, "Papua (Muara Tami, Perbatasan PNG)", "Skou"),
    ("wutu1244", "Wutung", "wut", "language", "Papunesia", -2.64636, 141.104, "Papua / PNG Border (Skou-Wutung)", "Skou"),
    ("awyi1241", "Awyi", "auw", "language", "Papunesia", -3.00564, 140.604, "Papua (Keerom)", "Border (Papuan)"),
    ("wari1266", "Waris", "wrs", "language", "Papunesia", -3.139, 140.931, "Papua (Keerom)", "Border (Papuan)"),
    ("daon1243", "Daonda", "dnd", "language", "Papunesia", -3.31443, 141.22, "Papua / PNG Border", "Border (Papuan)"),
    ("manm1266", "Manem", "jet", "language", "Papunesia", -2.99145, 141.02, "Papua (Keerom)", "Border (Papuan)"),
    ("ekar1243", "Ekari", "ekg", "language", "Papunesia", -3.88974, 136.018, "Papua Tengah (Danau Paniai / Enarotali)", "Trans-New Guinea (Wissel Lakes)"),
    ("auye1238", "Auye", "auu", "language", "Papunesia", -3.43705, 136.096, "Papua Tengah (Siriwo, Nabire)", "Trans-New Guinea (Wissel Lakes)"),
    ("moni1261", "Moni", "mnz", "language", "Papunesia", -3.72962, 136.886, "Papua Tengah (Sugapa / Intan Jaya)", "Trans-New Guinea (Wissel Lakes)"),
    ("dama1272", "Damal", "uhn", "language", "Papunesia", -4.17345, 137.496, "Papua Tengah (Ilaga, Puncak)", "Trans-New Guinea (Damal)"),
    ("kamo1255", "Kamoro", "kgq", "language", "Papunesia", -4.30433, 135.883, "Papua Tengah (Pesisir Mimika / Timika)", "Trans-New Guinea (Asmat-Kamoro)"),
    ("semp1241", "Sempan", "xse", "language", "Papunesia", -5.17582, 137.588, "Papua Tengah (Mimika Timur)", "Trans-New Guinea (Asmat-Kamoro)"),
    ("cent2117", "Central Asmat", "cns", "language", "Papunesia", -5.80391, 138.471, "Papua Selatan (Agats, Asmat)", "Trans-New Guinea (Asmat-Kamoro)"),
    ("casu1237", "Casuarina Coast Asmat", "asc", "language", "Papunesia", -6.43005, 138.566, "Papua Selatan (Pantai Kasuari, Asmat)", "Trans-New Guinea (Asmat-Kamoro)"),
    ("yaos1235", "Yaosakor Asmat", "asy", "language", "Papunesia", -5.61024, 138.582, "Papua Selatan (Sirets, Asmat)", "Trans-New Guinea (Asmat-Kamoro)"),
    ("cita1245", "Citak", "txt", "language", "Papunesia", -5.58276, 139.461, "Papua Selatan (Mappi)", "Trans-New Guinea (Asmat-Kamoro)"),
    ("tamn1235", "Tamnim Citak", "tml", "language", "Papunesia", -5.57962, 139.233, "Papua Selatan (Mappi)", "Trans-New Guinea (Asmat-Kamoro)"),
    ("yaqa1246", "Yaqay", "jaq", "language", "Papunesia", -6.66632, 139.249, "Papua Selatan (Mappi)", "Trans-New Guinea (Marind-Yaqay)"),
    ("nucl1622", "Marind", "mrz", "language", "Papunesia", -8.15651, 140.009, "Papua Selatan (Merauke)", "Trans-New Guinea (Marind)"),
    ("bian1251", "Bian Marind", "bpv", "language", "Papunesia", -7.35942, 140.568, "Papua Selatan (Sungai Bian, Merauke)", "Trans-New Guinea (Marind)"),
    ("nucl1452", "Mombum", "mso", "language", "Papunesia", -8.27141, 138.773, "Papua Selatan (Pulau Yos Sudarso)", "Kolopom"),
    ("kone1241", "Koneraw", "kdw", "language", "Papunesia", -8.37424, 138.0675, "Papua Selatan (Pulau Yos Sudarso)", "Kolopom"),
    ("rian1263", "Riantana", "ran", "language", "Papunesia", -7.50746, 138.484, "Papua Selatan (Pulau Yos Sudarso)", "Kolopom"),
    ("kima1246", "Kimaama", "kig", "language", "Papunesia", -8.01899, 138.355, "Papua Selatan (Pulau Yos Sudarso)", "Kolopom"),
    ("sota1242", "Sota Kanum", "krz", "language", "Papunesia", -8.40452, 140.969, "Papua Selatan (Sota, Perbatasan PNG)", "Yam"),
    ("smar1235", "Smärky Kanum", "kxq", "language", "Papunesia", -8.91812, 140.897, "Papua Selatan (Merauke)", "Yam"),
    ("yeii1239", "Yei", "jei", "language", "Papunesia", -7.87489, 140.863, "Papua Selatan (Merauke)", "Yam"),
    ("koro1312", "Korowai", "khe", "language", "Papunesia", -5.26952, 140.047, "Papua Selatan / Pegunungan (Kombai-Korowai)", "Trans-New Guinea (Awyu-Ndumut)"),
    ("komb1274", "Kombai", "tyn", "language", "Papunesia", -5.54543, 139.902, "Papua Selatan (Boven Digoel)", "Trans-New Guinea (Awyu-Ndumut)"),
    ("mand1444", "Mandobo Atas", "aax", "language", "Papunesia", -5.69357, 140.624, "Papua Selatan (Boven Digoel)", "Trans-New Guinea (Awyu-Ndumut)"),
    ("mand1445", "Mandobo Bawah", "bwp", "language", "Papunesia", -6.37255, 140.451, "Papua Selatan (Tanah Merah)", "Trans-New Guinea (Awyu-Ndumut)"),
    ("nort2916", "North Muyu", "kti", "language", "Papunesia", -5.55319, 140.84, "Papua Selatan (Mindiptana, Boven Digoel)", "Trans-New Guinea (Ok)"),
    ("sout2940", "South Muyu", "kts", "language", "Papunesia", -6.01385, 140.815, "Papua Selatan (Boven Digoel)", "Trans-New Guinea (Ok)"),
    ("ngal1298", "Ngalum", "szb", "language", "Papunesia", -4.67682, 141.03, "Papua Pegunungan (Oksibil, Pegunungan Bintang)", "Trans-New Guinea (Ok)"),
    ("tifa1245", "Tifal", "tif", "language", "Papunesia", -5.03899, 141.293, "Papua Pegunungan / PNG Border", "Trans-New Guinea (Ok)"),
    ("eipo1242", "Eipomek", "eip", "language", "Papunesia", -4.33691, 140.045, "Papua Pegunungan (Lembah Eipomek)", "Trans-New Guinea (Mek)"),
    ("nalc1240", "Nalca", "nlc", "language", "Papunesia", -4.26068, 139.883, "Papua Pegunungan (Mek)", "Trans-New Guinea (Mek)"),
    ("kosa1249", "Kosarek Yale", "kkl", "language", "Papunesia", -4.06603, 139.645, "Papua Pegunungan (Yahukimo)", "Trans-New Guinea (Mek)"),
    ("nips1240", "Nipsan", "nps", "language", "Papunesia", -4.14421, 139.753, "Papua Pegunungan (Yahukimo)", "Trans-New Guinea (Mek)"),
    ("angg1239", "Angguruk Yali", "yli", "language", "Papunesia", -4.0836, 139.457, "Papua Pegunungan (Angguruk, Yahukimo)", "Trans-New Guinea (Dani)"),
    ("nini1235", "Ninia Yali", "nlk", "language", "Papunesia", -4.4737, 139.39, "Papua Pegunungan (Ninia, Yahukimo)", "Trans-New Guinea (Dani)"),
    ("pass1247", "Pass Valley Yali", "yac", "language", "Papunesia", -3.76869, 139.26, "Papua Pegunungan (Pass Valley)", "Trans-New Guinea (Dani)"),
    ("lowe1415", "Lower Grand Valley Dani", "dni", "language", "Papunesia", -4.25684, 138.992, "Papua Pegunungan (Lembah Baliem Bawah)", "Trans-New Guinea (Dani)"),
    ("midg1235", "Mid Grand Valley Dani", "dnt", "language", "Papunesia", -4.06322, 138.945, "Papua Pegunungan (Wamena, Jayawijaya)", "Trans-New Guinea (Dani)"),
    ("uppe1430", "Upper Grand Valley Dani", "dna", "language", "Papunesia", -3.94368, 138.901, "Papua Pegunungan (Lembah Baliem Atas)", "Trans-New Guinea (Dani)"),
    ("west2594", "Western Dani", "dnw", "language", "Papunesia", -3.77127, 138.217, "Papua Pegunungan (Lanny Jaya & Tolikara)", "Trans-New Guinea (Dani)"),
    ("wala1269", "Walak", "wlw", "language", "Papunesia", -3.8238, 138.84, "Papua Pegunungan (Yalimo)", "Trans-New Guinea (Dani)"),
    ("ndug1245", "Nduga", "ndx", "language", "Papunesia", -4.34043, 138.411, "Papua Pegunungan (Kabupaten Nduga)", "Trans-New Guinea (Dani)"),
    ("sili1249", "Silimo", "wul", "language", "Papunesia", -4.52544, 139.003, "Papua Pegunungan (Yahukimo)", "Trans-New Guinea (Dani)"),
    ("hupl1238", "Hupla", "hap", "language", "Papunesia", -4.36349, 139.164, "Papua Pegunungan (Jayawijaya)", "Trans-New Guinea (Dani)"),
    ("wano1243", "Wano", "wno", "language", "Papunesia", -3.47858, 137.678, "Papua Tengah (Puncak Jaya)", "Trans-New Guinea (Dani)"),
    ("demm1245", "Dem", "dem", "language", "Papunesia", -3.72183, 137.632, "Papua Tengah (Sungai Rouffaer / Puncak Jaya)", "Trans-New Guinea"),

    # GLOBAL / REGIONAL NEIGHBORS FROM CSV
    ("taga1270", "Tagalog", "tgl", "language", "Papunesia", 14.06, 121.747, "Filipina (Luzon)", "Austronesian (Central Philippine)"),
    ("cebu1242", "Cebuano", "ceb", "language", "Papunesia", 8.38799, 124.367, "Filipina (Visayas & Mindanao)", "Austronesian (Central Philippine)"),
    ("ilok1237", "Iloko", "ilo", "language", "Papunesia", 15.9361, 120.993, "Filipina (Luzon Utara)", "Austronesian (Northern Luzon)"),
    ("chav1241", "Chavacano", "cbk", "language", "Papunesia", 7.435034, 122.18849, "Filipina (Zamboanga)", "Creole (Spanish-based)"),
    ("cham1312", "Chamorro", "cha", "language", "Papunesia", 13.438011, 144.74474, "Guam & Mariana Utara", "Austronesian (Malayo-Polynesian)"),
    ("fiji1243", "Fijian", "fij", "language", "Papunesia", -18.0, 178.33, "Fiji", "Austronesian (Central Pacific)"),
    ("samo1305", "Samoan", "smo", "language", "Papunesia", -13.92, -171.83, "Samoa", "Austronesian (Polynesian)"),
    ("tahi1242", "Tahitian", "tah", "language", "Papunesia", -17.6485, -149.45, "Polinesia Prancis (Tahiti)", "Austronesian (Polynesian)"),
    ("maor1246", "Maori", "mri", "language", "Papunesia", -38.2881, 176.541, "Selandia Baru (Aotearoa)", "Austronesian (Polynesian)"),
    ("hawa1245", "Hawaiian", "haw", "language", "Papunesia", 19.6297, -155.43, "Hawaii (Amerika Serikat)", "Austronesian (Polynesian)"),
    ("maga1260", "Magahi", "mag", "language", "Eurasia", 25.0915, 85.3335, "India (Bihar)", "Indo-Aryan"),
    ("bhoj1244", "Bhojpuri", "bho", "language", "Eurasia", 26.458455, 84.817115, "India / Nepal", "Indo-Aryan"),
    ("beng1280", "Bengali", "ben", "language", "Eurasia", 24.0, 90.0, "Bangladesh & India", "Indo-Aryan"),
    ("burm1310", "Burmese", "mya", "language", "Eurasia", 20.7926, 93.9665, "Myanmar", "Sino-Tibetan"),
    ("thai1261", "Thai", "tha", "language", "Eurasia", 14.192, 100.671, "Thailand", "Kra-Dai"),
    ("laoo1244", "Lao", "lao", "language", "Eurasia", 19.0, 102.46, "Laos", "Kra-Dai"),
    ("viet1252", "Vietnamese", "vie", "language", "Eurasia", 20.681188, 105.774071, "Vietnam", "Austroasiatic (Vietic)"),
    ("khme1253", "Khmer", "khm", "language", "Eurasia", 12.0515, 105.015, "Kamboja", "Austroasiatic (Khmeric)")
]

def determine_island(lat, lon, name):
    name_lower = name.lower()
    if any(k in name_lower for k in ['aceh', 'batak', 'gayo', 'nias', 'minang', 'lampung', 'rejang', 'musi', 'palembang', 'enggano', 'bangka', 'belitung', 'jambi', 'riau', 'kerinci', 'kubu']):
        return 'Sumatera'
    if any(k in name_lower for k in ['sunda', 'java', 'jawa', 'madur', 'betawi', 'badui', 'cirebon', 'kangean', 'bali', 'osing', 'tengger', 'indonesian']):
        return 'Jawa & Bali'
    if any(k in name_lower for k in ['dayak', 'banjar', 'ngaju', 'ma\'anyan', 'bakumpai', 'dusun', 'kayan', 'kenyah', 'modang', 'berau', 'tidung', 'bulungan', 'kutai', 'sampit', 'kapuas', 'seberuang', 'mualang', 'benyadu', 'jangkang', 'ot danum', 'tawoyan', 'putoh', 'lundayeh', 'sembakung', 'okolod', 'punan', 'basap', 'bolongan', 'burusu', 'abai']):
        return 'Kalimantan'
    if any(k in name_lower for k in ['bugi', 'makas', 'mandar', 'toraja', 'kaili', 'gorontalo', 'mongondow', 'minahasa', 'tondano', 'tombulu', 'tonsea', 'tontemboan', 'tolaki', 'muna', 'buton', 'cia-cia', 'wolio', 'duri', 'enrekang', 'pamona', 'mori', 'bungku', 'buol', 'sangi', 'talaud', 'totoli', 'dondo', 'tomini', 'lauje', 'taje', 'tajio', 'dampelas', 'balaesang', 'pendau', 'lindu', 'sedoa', 'besoa', 'bada', 'moma', 'uma', 'napu', 'saluan', 'balantak', 'andio', 'batui', 'bobongko', 'koroni', 'wawonii', 'moronene', 'pancana', 'kamaru', 'lasalimu', 'kumbewaha', 'busoa', 'tukang besi', 'budong', 'campalagian', 'bambam', 'mamasa', 'aralle', 'kalumpang', 'maiwa', 'tae', 'bentong', 'selayar', 'laiyolo', 'suwawa', 'kaidipang', 'bintauna', 'lolak', 'ponosakan', 'tonsawang', 'manado']):
        return 'Sulawesi'
    if any(k in name_lower for k in ['sasak', 'bima', 'sumbawa', 'manggarai', 'ngada', 'ende', 'lio', 'kambera', 'sumba', 'alor', 'pantar', 'rote', 'dhao', 'helong', 'adonara', 'lembata', 'kedang', 'timor', 'dili', 'tetun', 'bunak', 'wewewa', 'kodi', 'lamboya', 'anakalang', 'wanukaka', 'hawu', 'termanu', 'dengka', 'bilba', 'dela', 'ringgou', 'kupang', 'uab meto', 'kemak', 'alorese', 'abui', 'adang', 'kamang', 'blagar', 'teiwa', 'kaera', 'western pantar', 'lamaholot', 'sika', 'keo', 'nage', 'baikeno']):
        return 'Nusa Tenggara'
    if any(k in name_lower for k in ['buru', 'seram', 'ambon', 'haruku', 'saparua', 'kei', 'tanimbar', 'fordata', 'yamdena', 'aru', 'ternate', 'tidore', 'galela', 'tobelo', 'buli', 'sula', 'bacan', 'alune', 'wemale', 'manusela', 'lisela', 'kayeli', 'ambelau', 'amahai', 'elpaputih', 'liana', 'bobot', 'geser', 'bati', 'hitu', 'tulehu', 'nusa laut', 'selaru', 'luang', 'kisar', 'oirata', 'aputai', 'te\'un', 'nila', 'serua', 'batuley', 'dobel', 'kola', 'sahu', 'pagu', 'sawai', 'gebe']):
        return 'Maluku'
    if any(k in name_lower for k in ['papua', 'biak', 'yapen', 'ambai', 'ansus', 'asmat', 'kamoro', 'marind', 'dani', 'lani', 'yali', 'mee', 'ekari', 'abun', 'meyah', 'hatam', 'moi', 'tehit', 'korowai', 'kombai', 'sentani', 'skou', 'waropen', 'mamberamo', 'muyu', 'citak', 'fayu', 'roon', 'wandamen', 'dusner', 'meoswar', 'yeretuar', 'iha', 'baham', 'kalamang', 'arguni', 'buruwai', 'kamrau', 'irarutu', 'moskona', 'seget', 'kalabra', 'kais', 'kokoda', 'yahadian', 'maybrat', 'karon dori', 'ambel', 'kawe', 'salawati', 'matbat', 'biga', 'busami', 'munggui', 'marau', 'pom', 'woi', 'kurudu', 'yawa', 'bauzi', 'duvle', 'iau', 'obokuitai', 'eritai', 'sikaritai', 'kwerba', 'berik', 'dabe', 'betaf', 'sobei', 'bonggo', 'tarpia', 'demta', 'tabla', 'nimboran', 'kemtuik', 'gresi', 'tobati', 'kayupulau', 'wutung', 'awyi', 'waris', 'daonda', 'manem', 'auye', 'moni', 'damal', 'sempan', 'casuarina', 'yaosakor', 'tamnim', 'yaqay', 'bian marind', 'mombum', 'koneraw', 'riantana', 'kimaama', 'sota kanum', 'smärky', 'yei', 'mandobo', 'ngalum', 'tifal', 'eipomek', 'nalca', 'kosarek', 'nipsan', 'angguruk', 'ninia', 'pass valley', 'walak', 'nduga', 'silimo', 'hupla', 'wano', 'dem']):
        return 'Papua'
    return 'Lainnya'

def calculate_radius(name, island):
    name_l = name.lower()
    # Major regional languages with vast territory
    if any(k in name_l for k in ['javanese', 'sundanese', 'madurese', 'minangkabau', 'buginese', 'makasar', 'banjar', 'acehnese', 'batak toba']):
        return 65.0
    if any(k in name_l for k in ['balinese', 'sasak', 'bima', 'gorontalo', 'muna', 'tolaki', 'ngaju', 'toraja', 'biak']):
        return 48.0
    if island in ['Papua', 'Kalimantan']:
        return 38.0
    if island in ['Maluku', 'Nusa Tenggara']:
        return 28.0
    return 32.0

def make_polygon(lat, lon, r_km, seed):
    coords = []
    R = 6371.0
    vertices = 14
    for i in range(vertices):
        angle = (2.0 * math.pi * i) / vertices
        noise = 0.84 + 0.32 * math.sin(angle * 3.0 + seed * 1.5) * math.cos(angle * 2.0 + seed * 0.7)
        r = r_km * noise
        dlat = (r * math.cos(angle)) / R * (180.0 / math.pi)
        dlon = (r * math.sin(angle)) / (R * math.cos(math.radians(lat))) * (180.0 / math.pi)
        coords.append([round(lat + dlat, 5), round(lon + dlon, 5)])
    coords.append(coords[0])
    return coords

import csv

# Read raw glottolog CSV snippet
csv_entries = {}
try:
    with open("scripts/raw_glottolog_snippet.csv", "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            if r.get("latitude") and r.get("longitude"):
                csv_entries[r["glottocode"]] = r
except Exception as e:
    print("CSV read error:", e)

def classify_csv_record(r):
    lat = float(r["latitude"])
    lon = float(r["longitude"])
    name = r["name"]
    macro = r.get("macroarea", "")
    level = r.get("level", "language")
    iso = r.get("isocodes", "")
    code = r["glottocode"]

    nl = name.lower()
    if "acehnese" in nl:
        return code, name, iso, level, macro, lat, lon, "Aceh", "Austronesian (Malayo-Polynesian)", "Sumatera"
    if "abai tubu" in nl or "abai sembuak" in nl:
        return code, name, iso, level, macro, lat, lon, "Kalimantan Utara (Malinau)", "Austronesian (Murutic)", "Kalimantan"
    if "abui" in nl:
        return code, name, iso, level, macro, lat, lon, "Nusa Tenggara Timur (Alor)", "Timor-Alor-Pantar", "Nusa Tenggara"
    if "adang" in nl and macro == "Papunesia":
        return code, name, iso, level, macro, lat, lon, "Nusa Tenggara Timur (Alor)", "Timor-Alor-Pantar", "Nusa Tenggara"
    if "adonara" in nl:
        return code, name, iso, level, macro, lat, lon, "Nusa Tenggara Timur (Adonara)", "Austronesian (Central Malayo-Polynesian)", "Nusa Tenggara"
    if "adabe" in nl:
        return code, name, iso, level, macro, lat, lon, "Kepulauan Nusa Tenggara (Atauro/Timor)", "Timor-Alor-Pantar", "Nusa Tenggara"
    if "abun" in nl:
        return code, name, iso, level, macro, lat, lon, "Papua Barat Daya (Tambrauw)", "West Papuan (Abun)", "Papua"
    if "abawiri" in nl:
        return code, name, iso, level, macro, lat, lon, "Papua (Mamberamo Raya)", "Lakes Plain", "Papua"
    if "abinomn" in nl:
        return code, name, iso, level, macro, lat, lon, "Papua (Mamberamo)", "Isolate (Abinomn)", "Papua"
    if "abau" in nl:
        return code, name, iso, level, macro, lat, lon, "Papua (Perbatasan Sepik)", "Sepik", "Papua"
    if "aekyom" in nl:
        return code, name, iso, level, macro, lat, lon, "Papua (Fly River Border)", "Awin-Pa", "Papua"
    if "abai sungai" in nl:
        return code, name, iso, level, macro, lat, lon, "Kalimantan / Sabah", "Austronesian", "Kalimantan"

    if (-6.0 <= lat <= 6.0) and (95.0 <= lon <= 106.0):
        return code, name, iso, level, macro, lat, lon, "Sumatera", "Austronesian", "Sumatera"
    if (-9.0 <= lat <= -5.5) and (105.0 <= lon <= 116.0):
        return code, name, iso, level, macro, lat, lon, "Jawa / Bali", "Austronesian", "Jawa & Bali"
    if (-4.5 <= lat <= 4.5) and (108.5 <= lon <= 119.0):
        return code, name, iso, level, macro, lat, lon, "Kalimantan", "Austronesian", "Kalimantan"
    if (-6.0 <= lat <= 2.5) and (118.5 <= lon <= 125.5):
        return code, name, iso, level, macro, lat, lon, "Sulawesi", "Austronesian", "Sulawesi"
    if (-11.0 <= lat <= -7.5) and (115.5 <= lon <= 127.5):
        return code, name, iso, level, macro, lat, lon, "Nusa Tenggara", "Austronesian", "Nusa Tenggara"
    if (-9.0 <= lat <= 3.0) and (125.5 <= lon <= 132.5):
        return code, name, iso, level, macro, lat, lon, "Kepulauan Maluku", "Austronesian", "Maluku"
    if (-10.0 <= lat <= 1.0) and (130.0 <= lon <= 141.5):
        return code, name, iso, level, macro, lat, lon, "Tanah Papua", "Papuan", "Papua"

    return code, name, iso, level, macro, lat, lon, f"{macro} / Global", f"{macro} Family", "Lainnya"

# Build all entries
existing_codes = set()
languages = []

# First pass: add RAW_DATA
for idx, item in enumerate(RAW_DATA):
    glottocode, name, isocode, level, macroarea, lat, lon, prov, family = item
    island = determine_island(lat, lon, name)
    is_national = island != 'Lainnya'
    radius_km = calculate_radius(name, island)
    est_area = round(math.pi * (radius_km ** 2) * 0.92, 1)
    poly = make_polygon(lat, lon, radius_km, idx)
    is_from_csv = glottocode in csv_entries
    
    languages.append({
        "glottocode": glottocode,
        "name": name,
        "isocode": isocode,
        "level": level,
        "macroarea": macroarea,
        "latitude": lat,
        "longitude": lon,
        "isNational": is_national,
        "isFromCsv": is_from_csv,
        "island": island,
        "province": prov,
        "family": family,
        "estimatedRadiusKm": radius_km,
        "estimatedAreaKm2": est_area,
        "boundaryPolygon": poly
    })
    existing_codes.add(glottocode)

# Second pass: add any missing CSV records
for code, r in csv_entries.items():
    if code in existing_codes:
        continue
    c_code, c_name, c_iso, c_lvl, c_macro, c_lat, c_lon, c_prov, c_fam, c_island = classify_csv_record(r)
    is_national = c_island != 'Lainnya'
    radius_km = calculate_radius(c_name, c_island)
    est_area = round(math.pi * (radius_km ** 2) * 0.92, 1)
    poly = make_polygon(c_lat, c_lon, radius_km, len(languages))
    
    languages.append({
        "glottocode": c_code,
        "name": c_name,
        "isocode": c_iso,
        "level": c_lvl,
        "macroarea": c_macro,
        "latitude": c_lat,
        "longitude": c_lon,
        "isNational": is_national,
        "isFromCsv": True,
        "island": c_island,
        "province": c_prov,
        "family": c_fam,
        "estimatedRadiusKm": radius_km,
        "estimatedAreaKm2": est_area,
        "boundaryPolygon": poly
    })
    existing_codes.add(code)

# Compute neighbors for each language (within 160 km)
def distance_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

for lang in languages:
    neighbors = []
    for other in languages:
        if other["glottocode"] == lang["glottocode"]:
            continue
        dist = distance_km(lang["latitude"], lang["longitude"], other["latitude"], other["longitude"])
        if dist <= 140.0:
            neighbors.append({
                "glottocode": other["glottocode"],
                "name": other["name"],
                "distanceKm": round(dist, 1)
            })
    neighbors.sort(key=lambda x: x["distanceKm"])
    lang["neighbors"] = neighbors[:5]

# Generate TypeScript code
ts_content = """// Basis Data Atlas Bahasa Glottolog Nasional & Regional Geospasial
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
  level: 'language' | 'dialect';
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

export const GLOTTOLOG_LANGUAGES: GlottologLanguage[] = """ + json.dumps(languages, indent=2, ensure_ascii=False) + """;

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
"""

with open("src/data/glottologLanguages.ts", "w", encoding="utf-8") as f:
    f.write(ts_content)

print(f"Generated {len(languages)} languages into src/data/glottologLanguages.ts")

