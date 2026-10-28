# PRODUCT REQUIREMENT DOCUMENT (PRD) & DETAILED USER FLOW
## SISTEM PEMETAAN BAHASA & DIALEKTOMETRI (DERANA PANEL ENTERPRISE)
**Standar Arsitektur: Badan Pengembangan dan Pembinaan Bahasa Kemendikbudristek & UNESCO**

---

### METADATA DOKUMEN
| Atribut | Rincian Dokumen |
| :--- | :--- |
| **Nama Produk** | Sistem Pemetaan Bahasa & Dialektometri (Derana Panel Enterprise) |
| **Versi Dokumen** | 2.5 (Comprehensive Feature Catalog & Master User Flow Edition) |
| **Status Rilis** | Disetujui & Terdeploy (*Production Ready*) |
| **Klasifikasi** | Dokumen Spesifikasi Produk, Arsitektur Sistem & Alur Pengguna Terperinci |
| **Penulis** | Tim Rekayasa Perangkat Lunak & Riset Geolinguistik Derana Panel |
| **Target Pembaca** | Peneliti Dialektologi, Tim Lapangan/Surveyor, Verifikator Bahasa, Tim Pengembang, Manajer Produk |
| **Format Distribusi** | Dokumen Word (.doc), Cetak PDF (.pdf), Markdown (.md), In-App Interactive Modal |

---

## 1. PENDAHULUAN & LATAR BELAKANG (EXECUTIVE SUMMARY)

### 1.1 Latar Belakang Masalah
Indonesia memiliki kekayaan linguistik luar biasa dengan lebih dari 718 bahasa daerah yang teridentifikasi. Namun, konservasi data kebahasaan, pemetaan variasi dialek, dan penentuan garis batas dialek (*isoglos*) menghadapi kendala struktural:
1. **Kerapuhan Instrumen Kertas Konvensional:** Formulir fisik tebal puluhan halaman sangat rentan rusak akibat cuaca ekstrem, hujan tropis, dan kelembapan medan lapangan pedalaman atau pesisir.
2. **Ketiadaan Akses Internet di Wilayah 3T (Tertinggal, Terdepan, Terluar):** Aplikasi web biasa yang bergantung pada koneksi internet langsung mati kutu di lokasi penelitian terpencil.
3. **Inkonsistensi Koordinat Geografis:** Kesalahan pencatatan posisi GPS sering menyebabkan distorsi pemetaan spasial antar-desa.
4. **Kalkulasi Dialektometri Manual yang Lambat & Rentan Eror:** Membandingkan 200 konsep Swadesh secara manual antar puluhan titik pengamatan membutuhkan ribuan pasangan hitungan rumus Guiter yang memakan waktu berminggu-minggu.
5. **Ketiadaan Arsip Audio Pelafalan Asli:** Bentuk kata lokal dan transkripsi fonetis IPA (International Phonetic Alphabet) sering kali tidak disertai bukti rekaman suara penutur asli (*native speaker*).

### 1.2 Visi & Solusi Produk
**Sistem Pemetaan Bahasa & Dialektometri (Derana Panel)** dirancang sebagai platform terintegrasi modern berbasis web dan mobile dengan kapabilitas:
- **Arsitektur Offline-First PWA:** Beroperasi tanpa internet dengan penyimpanan lokal ganda (*LocalStorage* & *IndexedDB* via *OfflineSyncManager*) dan auto-sync ke Firebase Firestore saat online.
- **Kuesioner 16 Bagian Komprehensif:** Mengakomodasi toponimi, situasi perbatasan 4 arah, morfologi geografis, demografi penutur, sosioekonomi, pendidikan, agama, mobilitas, transportasi, usia & sejarah desa, cerita rakyat, 3 narasumber triangulasi, leksikon Swadesh 200, 18 bidang budaya (A–R), frasa, serta 50 kalimat berglos per kata (S-P-O-K).
- **Kalkulator Rumus Dialektometri Guiter Otomatis:** Menghitung seketika indeks persentase perbedaan $d = (s / n) \times 100\%$ dan membangun Matriks Segitiga Pembanding antar titik survei.
- **Peta Interaktif Leaflet GIS Multi-Basemap:** Menyajikan visualisasi geospasial titik survei dengan 5 lapisan peta dasar (termasuk Google Maps Roads & Google Satelit) serta pemfilteran penanda berdasarkan status validasi dan rentang usia narasumber.
- **Deteksi Kata Serapan Cerdas via Gemini AI:** Memanfaatkan model `gemini-3.8-flash` pada server backend untuk mengidentifikasi etimologi kata serapan asing/Melayu vs kognat asli warisan Proto-Austronesia.
- **Modul Tambahan Terpadu:** Modul Revitalisasi Bahasa Daerah (Model C Maluku: IKRBD & RAP), Vitalitas Bahasa UNESCO (9 Kriteria), dan Korpus Sastra Lisan.

---

## 2. USER PERSONA & MATRIKS HAK AKSES (RBAC)

Sistem menerapkan pembatasan akses berbasis peran (*Role-Based Access Control*):

| Peran (Role) | Target Pengguna | Tanggung Jawab & Hak Akses Utama |
| :--- | :--- | :--- |
| **Admin Sistem** | Koordinator Riset Balai/Pusat Bahasa | • Akses penuh ke seluruh data survei lintas surveyor.<br>• Manajemen pengguna & penetapan peran (assign role).<br>• Penghapusan permanen dan ekspor arsip nasional.<br>• Konfigurasi Firebase Cloud & model Gemini AI. |
| **Verifikator / Kurator Linguistik** | Peneliti Dialektologi Senior | • Menelaah keabsahan ilmiah 16 seksi instrumen.<br>• Mengesahkan status *✓ Tervalidasi* (Badge Hijau).<br>• Menilai keakuratan transkripsi fonetis IPA dan klasifikasi dialek.<br>• Memberi catatan batas isoglos lapangan. |
| **Surveyor Lapangan (Peneliti)** | Petugas Lapangan di Titik Pengamatan | • Membuat survei baru (mode kosong / sampel).<br>• Mengisi 16 seksi instrumen di lokasi desa.<br>• Merekam audio pelafalan narasumber per kata leksikon.<br>• Mengedit dan menyimpan data lokal offline.<br>• Melakukan sinkronisasi ke cloud saat menemukan sinyal. |
| **Viewer / Tamu (Akademisi)** | Mahasiswa, Pemerhati Bahasa, Tamu | • Mode hanya-baca (*Read-Only*) pada dashboard dan statistik.<br>• Melihat peta persebaran spasial titik survei.<br>• Melihat matriks komparasi dialektometri tanpa hak ubah. |

---

## 3. USER FLOW LENGKAP & DETAIL (END-TO-END WORKFLOW)

Diagram alur kerja pengguna secara menyeluruh mencakup 8 tahapan alur utama beserta sub-alur pendukung:

```
+----------------------------------------------------------------------------------------------------+
|                                    MASTER USER FLOW ARCHITECTURE                                   |
+----------------------------------------------------------------------------------------------------+

[ TAHAP 1: AUTENTIKASI & SETUP SESI ]
   ├── Login Google Identity OAuth 2.0
   ├── Login Akun Email/Kata Sandi Firebase
   ├── Login Cepat Profil Surveyor Lapangan (Offline Bypass)
   └── Validasi Peran (RBAC: Admin / Verifikator / Surveyor / Viewer)
         │
         ▼
[ TAHAP 2: NAVIGASI & DASBOR UTAMA ]
   ├── View 1: Ringkasan KPI & Agregat Progres 16 Seksi
   ├── View 2: Peta Titik Survei Lapangan (Leaflet GIS)
   ├── View 3: Statistik Demografi Narasumber (Piramida Usia & Pekerjaan)
   ├── View 4: Statistik Sebaran Dialek & Agregat Leksikal Guiter
   └── View 5: Daftar Titik Survei (Kartu Survei, Filter, Sort, Duplikasi)
         │
         ▼
[ TAHAP 3: MANAJEMEN MULTI-SURVEI ]
   ├── Opsi A: Buat Formulir Baru (Kosong)
   ├── Opsi B: Muat Data Sampel Acuan (Desa Karangwangi, Cikaso, Sukabumi)
   ├── Opsi C: Impor Berkas Cadangan JSON (Single / Bulk)
   └── Menetapkan Survei Aktif (activeSurveyId)
         │
         ▼
[ TAHAP 4: PENGISIAN 16 BAGIAN INSTRUMEN PEMETAAN BAHASA ]
   (Pilihan Mode: Mode 16 Layar Terfokus vs Mode Gulir Penuh)
   ├── Seksi 1: Titik Pengamatan & Toponimi (Sinkronisasi koordinat otomatis)
   ├── Seksi 2: Situasi Kebahasaan 4 Mata Angin (Batas Desa & Bahasa Tetangga)
   ├── Seksi 3: Situasi Geografis & Peta Validasi GPS (Leaflet Smooth Crossfade)
   ├── Seksi 4: Penduduk & Penutur Bahasa (Gender, Usia, Komposisi Etnik)
   ├── Seksi 5–8: Sosioekonomi, Pendidikan & Agama
   ├── Seksi 9–10: Hubungan Mobilitas & Moda Transportasi
   ├── Seksi 11–13: Usia, Sejarah Desa & Tradisi Lisan (Folklore)
   ├── Seksi 14: Data 3 Narasumber Triangulasi (Usia, Pekerjaan, Bahasa Dikuasai)
   ├── Seksi 15: Kosakata Lengkap Swadesh 200, Budaya (A-R), Audio & Deteksi AI
   └── Seksi 16: Dialektometri Guiter, Titik Pembanding & Batas Isoglos
         │
         ▼
[ TAHAP 5: ANALISIS KOMPARASI MULTIBAHASA ]
   ├── Pilih 2 atau 3 Titik Survei Pembanding
   ├── Sandingkan Glos Leksikon Berdampingan
   ├── Hitung Beda Fonemis vs Beda Leksikal
   └── Bangun Matriks Segitiga Pembanding (Formula Guiter)
         │
         ▼
[ TAHAP 6: MODUL TEMATIK TERPADU (KUESIONER HUB) ]
   ├── Sub-Modul 1: Pusat Kuesioner 4-in-1
   ├── Sub-Modul 2: Revitalisasi Bahasa Daerah (Model C Maluku: IKRBD & RAP)
   ├── Sub-Modul 3: Vitalitas Bahasa UNESCO (9 Parameter)
   └── Sub-Modul 4: Korpus Sastra Lisan & Tradisi Tutur
         │
         ▼
[ TAHAP 7: KURASI, VALIDASI & VERIFIKASI ILMIAH ]
   ├── Pemeriksaan Validasi Input Real-time
   ├── Telaah Verifikator Linguistik
   └── Pengesahan Status (Badge Hijau: ✓ Tervalidasi)
         │
         ▼
[ TAHAP 8: SINKRONISASI CLOUD & DISTRIBUSI DOKUMEN ]
   ├── Antrean Sinkronisasi Offline ke Firebase Firestore
   ├── Ekspor Buku Kerja Excel Multi-Sheet (.xlsx)
   ├── Ekspor 200 Swadesh & Rekapitulasi (.csv)
   ├── Cadangkan Koleksi Arsip (.json)
   └── Unduh Dokumen Resmi PRD & User Flow (.doc Word & Cetak PDF)
```

---

### 3.1 Rincian Alur Pengguna Setiap Tahapan

#### Alur 1: Autentikasi Pengguna & Penentuan Peran (RBAC)
1. Pengguna membuka URL aplikasi.
2. Jika sesi belum aktif, sistem menampilkan layar `LoginPage`.
3. Pengguna memilih metode masuk:
   - **Google Sign-In**: Membuka popup otentikasi Google OAuth 2.0.
   - **Login Akun Terdaftar (Email & Password)**: Autentikasi Firebase Auth.
   - **Akses Cepat Surveyor Lapangan**: Membuka profil lokal saat tidak ada koneksi internet.
4. Sistem memeriksa basis data koleksi `users` di Firebase Firestore:
   - Mengambil peran pengguna: `admin`, `verifikator`, `surveyor`, atau `viewer`.
   - Mengatur status hak akses antarmuka (`canEdit`, `canDelete`, `canVerify`).
5. Pengguna diarahkan ke Dasbor Utama.

#### Alur 2: Eksplorasi Dasbor Utama (Dashboard)
1. Pengguna disajikan ringkasan KPI tingkat tinggi:
   - Total Desa Survei Terdaftar.
   - Total Narasumber Informan Lapangan.
   - Persentase Status Verifikasi (Tervalidasi vs Menunggu Telaah).
   - Rerata Kelengkapan 16 Seksi (Agregat Nasional).
   - Total Rekaman Audio Suara Terunggah.
2. Pengguna dapat beralih di antara 5 mode tampilan dasbor:
   - **Mode Ringkasan:** Menampilkan grafik batang progres pengisian, kelengkapan 16 seksi per titik, perbandingan kosakata, diagram pie verifikasi, tabel agregat provinsi, dan kartu shortcut Peta Titik Survei.
   - **Mode Peta Titik Survei Lapangan:** Membuka peta geospasial Leaflet interaktif dengan multi-basemap dan filter penanda.
   - **Mode Statistik Narasumber:** Menampilkan piramida usia informan, tingkat pendidikan, profesi, lama tinggal, dan penguasaan bahasa.
   - **Mode Statistik Sebaran Dialek:** Menyajikan analisis agregat leksikal, statistik kognat, dan indeks Guiter komparatif.
   - **Mode Daftar Titik Survei:** Daftar kartu survei dengan kolom pencarian instan, filter status, pengurutan, checklist 16 seksi, tombol duplikasi, dan hapus survei.

#### Alur 3: Manajemen Dokumen Survei
1. Pengguna memilih aksi survei:
   - **Tombol "+ Formulir Baru"**: Membuat survei kosong dengan timestamp unik (`survey_[timestamp]_[rand]`).
   - **Tombol "+ Contoh Survei"**: Memuat instrumen sampel Desa Karangwangi untuk referensi riset.
   - **Tombol "Impor JSON"**: Membaca berkas `.json` cadangan survei tunggal atau koleksi massal.
2. Survei yang dipilih menjadi **Survei Aktif (`activeSurveyId`)**.
3. Nilai disimpan di `localStorage` dan disinkronkan secara reaktif ke formulir kuesioner.

#### Alur 4: Pengisian 16 Bagian Kuesioner (Mode 16 Layar Stepper vs Gulir Penuh)
Pengguna dapat memilih alur pengisian:
- **Mode 16 Layar Terfokus (`form-screen`)**: Satu seksi per layar, progress stepper bar, tombol navigasi "Kembali" & "Selanjutnya", serta indikator error validasi per seksi.
- **Mode Gulir Penuh (`form-all`)**: Seluruh 16 seksi berurutan dalam satu halaman panjang berkesinambungan.

**Rincian Alur 16 Seksi:**
- **Seksi 1 (Titik Pengamatan):** Pengisian nama desa, toponimi, bahasa utama, nama lain bahasa, kecamatan, kab/kota, provinsi, pulau, kode titik, dan koordinat GPS. Koordinat otomatis tersinkronisasi ke Seksi 3.
- **Seksi 2 (Situasi Kebahasaan):** Mencatat bahasa dan desa tetangga yang berbatasan di Timur, Barat, Utara, dan Selatan.
- **Seksi 3 (Situasi Geografis & Morfologi):** Jarak pantai, letak pedalaman/pesisir, dan topografi (dataran, perbukitan, pegunungan, pesisir). Dilengkapi peta interaktif Leaflet untuk verifikasi pin GPS dengan animasi *smooth crossfade* dan indikator *loading badge*.
- **Seksi 4 (Penduduk & Penutur):** Data demografi total pria/wanita, kelompok umur (<20, 20–40, >40), jumlah penutur aktif bahasa daerah, dan komposisi etnis warga.
- **Seksi 5 (Mata Pencaharian):** Statistik profesi warga: petani, nelayan, pedagang, buruh, pegawai, dan profesi kearifan lokal.
- **Seksi 6 & 7 (Pendidikan & Sarana):** Tingkat pendidikan warga dan ketersediaan gedung fisik sekolah dari tingkat SD hingga perguruan tinggi dan kursus.
- **Seksi 8 (Agama):** Komposisi pemeluk agama warga desa (Islam, Kristen, Katolik, Hindu, Buddha, Konghucu, kepercayaan lokal).
- **Seksi 9 & 10 (Mobilitas & Transportasi):** Evaluasi kelancaran mobilitas warga dan ketersediaan armada transportasi darat, laut, sungai, dan udara.
- **Seksi 11 & 12 (Usia & Sejarah Desa):** Kategori usia berdirinya desa, toponimi asal nama desa, dan tokoh pendiri.
- **Seksi 13 (Folklore & Sastra Lisan):** Dokumentasi cerita rakyat dominan (mitos, legenda, dongeng), tokoh sentral, dan nilai tradisi.
- **Seksi 14 (Data Narasumber - Triangulasi 3 Informan):** Identitas lengkap minimal 3 informan lokal (nama, usia, pekerjaan, lama tinggal, bahasa ibu, bahasa kedua, dan medsos).
- **Seksi 15 (Kosakata Swadesh 200, Budaya A-R, Audio & Deteksi AI):**
  - Mengisi 200 glos Swadesh (bentuk lokal & simbol IPA).
  - Perekaman audio suara informan per kata leksikon menggunakan Web Audio API.
  - Menekan tombol **"Deteksi Serapan (Gemini AI)"** untuk menganalisis etimologi kata serapan (Sanskerta, Arab, Belanda, Portugis, Hokkien, Melayu) vs kognat asli Proto-Austronesia.
  - Mengisi 18 bidang kosakata budaya (A–R), struktur frasa, dan 50 kalimat S-P-O-K.
  - Impor dan ekspor kosakata via berkas Excel (.xlsx).
- **Seksi 16 (Dialektometri Guiter & Isoglos):** Menentukan Titik Acuan dan Titik Pembanding. Rumus Guiter otomatis mengalkulasi persentase perbedaan dan mengklasifikasikan status hubungan kebahasaan.

#### Alur 5: Visualisasi Geospasial Titik Survei Lapangan (Leaflet GIS)
1. Pengguna membuka menu **"Peta Titik Survei Lapangan"** via Sidebar, Navbar shortcut, atau Dasbor.
2. Peta Leaflet memetakan seluruh koordinat titik survei.
3. Pengguna memilih lapisan peta dasar (*Basemap Switcher*):
   - Terang (Carto Light)
   - OSM (OpenStreetMap)
   - Gelap (Carto Dark)
   - Google Maps Jalan (Official Google Roads)
   - Google Satelit (Google Satellite & Hybrid with labels)
4. Pengguna memanfaatkan **Bilah Filter Penanda Spasial**:
   - **Filter Status Verifikasi:** Opsi *Semua*, *✓ Tervalidasi* (pin hijau), atau *Belum Diverifikasi*.
   - **Filter Rentang Usia Informan:** Opsi *Semua Usia*, *< 25 Tahun (Generasi Muda)*, *25–50 Tahun (Dewasa)*, atau *> 50 Tahun (Tetua / Sepuh Penutur)* guna menganalisis fenomena pergeseran bahasa antargenerasi.
   - Peta otomatis melakukan *auto-fit bounds* untuk memfokuskan kamera pada titik yang tersaring.
5. Interaksi Marker:
   - Tooltip nama desa, bahasa, dan progres.
   - Popup detail narasumber, status validasi, tombol edit formulir, tombol komparasi, dan tombol buka di Google Maps eksternal.
   - Toggle garis relasi spasial untuk menghubungkan titik-titik survei.

#### Alur 6: Analisis Komparasi 2–3 Bahasa
1. Pengguna membuka modul **"Komparasi 2–3 Bahasa"**.
2. Pengguna memilih Bahasa A, Bahasa B, dan (opsional) Bahasa C.
3. Tabel leksikon disandingkan berdampingan glos demi glos.
4. Sistem menghitung statistik kognat: sama, beda fonetis, beda leksikal, serta indeks Guiter pasangan bahasa.
5. Pengguna dapat mengekspor matriks segitiga komparasi ke CSV/Excel.

#### Alur 7: Modul Revitalisasi Bahasa Daerah & Vitalitas UNESCO
1. Pengguna mengakses modul **"Revitalisasi Bahasa"** atau **"Pusat Kuesioner"**.
2. Pengisian instrumen:
   - **Monev IKRBD (Model C Maluku):** Mengisi 5 dimensi (Regulasi Pemda, Guru Master & Komunitas, Ketersediaan Modul Ajar, Antusiasme Generasi Muda, Festival Tunas Bahasa Ibu). Sistem menghitung skor IKRBD komposit (0–100) dan mengelompokkan kategori ketahanan bahasa.
   - **Rencana Aksi Pengimbasan (RAP):** Menyusun target pelatihan guru master, jumlah siswa terimbas, jadwal, dan kurikulum muatan lokal.
   - **Vitalitas Bahasa UNESCO:** Evaluasi 9 parameter vitalitas bahasa internasional.

#### Alur 8: Kurasi, Validasi & Distribusi Dokumen
1. Verifikator memeriksa kelengkapan data survei (16 seksi).
2. Verifikator mengklik tombol **"Verifikasi Survei"** untuk mengesahkan data (*isVerified = true*).
3. Pengguna mengekspor data:
   - **Buku Kerja Excel (.xlsx):** Format multi-lembar (Profil Wilayah, Swadesh 200, Budaya, Frasa/Kalimat, Narasumber).
   - **Berkas CSV:** 200 kosakata Swadesh dan ringkasan survei per provinsi.
   - **Cadangan JSON:** Berkas tunggal atau seluruh arsip koleksi survei.
   - **Dokumen Resmi PRD & User Flow:** Unduh berkas Word (.doc) atau cetak PDF langsung dari modal penampil dokumen.

---

## 4. KATALOG FITUR LENGKAP APLIKASI (EXHAUSTIVE FEATURE CATALOG)

Berikut adalah katalog 100% fitur yang terdapat di dalam aplikasi, dikelompokkan menurut modul fungsional:

### 4.1 Modul Dasbor & Visualisasi Agregat
1. **Kartu Statistik Kunci (KPI Overview):** Menampilkan metrik total desa survei, total narasumber, status verifikasi, persentase kelengkapan 16 seksi, dan jumlah rekaman audio.
2. **Dashboard Ringkasan & 16 Bagian:**
   - Grafik batang progres kelengkapan per titik survei (Recharts).
   - Grafik batang kelengkapan 16 seksi per desa pengamatan.
   - Grafik komparasi rekaman kosakata Swadesh vs budaya per desa.
   - Diagram lingkaran (pie chart) distribusi status verifikasi lapangan.
   - Tabel agregat sebaran wilayah dan bahasa per provinsi.
   - Tabel daftar titik pengamatan lengkap dengan pencarian dan filter provinsi.
   - Banner jalan pintas interaktif menuju Peta Titik Survei Lapangan.
3. **Statistik Demografi Narasumber (`NarasumberStatsSummary`):**
   - Piramida rentang usia narasumber (<25, 25-50, >50 tahun).
   - Distribusi tingkat pendidikan informan (SD s.d. Perguruan Tinggi).
   - Klasifikasi profesi/mata pencaharian informan.
   - Analisis lama menetap di desa dan frekuensi mobilitas keluar wilayah.
   - Penggunaan media sosial informan (Facebook, TikTok, Instagram, Twitter).
   - Penguasaan bahasa ibu vs bahasa kedua (aktif/pasif).
4. **Statistik Sebaran Dialek & Agregat Leksikal (`DescriptiveDialectStats`):**
   - Sebaran bahasa unik yang telah disurvei.
   - Metrik kognat leksikal perbandingan berpasangan.
   - Ringkasan klasifikasi dialektometri Guiter agregat.
5. **Daftar Titik Survei (`Daftar Mode`):**
   - Kartu survei dengan detail desa, kecamatan, kab/kota, provinsi, dan surveyor.
   - Checklist interaktif 16 seksi per survei.
   - Fitur pencarian instan berdasarkan desa, kecamatan, bahasa, atau surveyor.
   - Filter status: Semua, 100% Selesai, Dalam Proses.
   - Filter kepemilikan survei: Semua, Survei Saya, Survei Pengguna Lain.
   - Pengurutan: Terakhir Diperbarui (Terbaru/Terlama), Progres (Tertinggi/Terendah), Nama Desa (A-Z).
   - Duplikasi survei cepat dalam 1 klik.
   - Hapus survei dengan modal dialog konfirmasi pencegah salah klik.
   - Unduh survei tunggal dalam format JSON atau cetak formulir instan.
6. **Glottolog Language Map Integration:** Visualisasi data atlas bahasa Glottolog.

### 4.2 Modul Peta Titik Survei Lapangan (Leaflet GIS)
7. **Peta Interaktif Leaflet Multi-Basemap:**
   - Lapisan Peta CARTO Light (Terang).
   - Lapisan Peta OpenStreetMap (OSM Standard).
   - Lapisan Peta CARTO Dark Matter (Gelap).
   - Lapisan Peta Google Maps Jalan (Official Google Roads via mt.google.com).
   - Lapisan Peta Google Satelit Hibrida (Google Satellite & Hybrid with road overlays).
   - Lapisan Citra Satelit Bentang Alam Esri World Imagery.
   - Animasi transisi halus (*smooth crossfade*) saat berganti peta dasar.
   - Indikator status pemuatan ubin (*loading badge & overlay card*).
8. **Pemfilteran Penanda Spasial (Marker Filtering):**
   - Filter Status Validasi: Semua, ✓ Tervalidasi (pin hijau), Belum Diverifikasi.
   - Filter Rentang Usia Informan: Semua Usia, < 25 Tahun (Generasi Muda), 25–50 Tahun (Dewasa Produktif), > 50 Tahun (Tetua / Sepuh Penutur).
   - Bilah filter interaktif di toolbar atas peta dan panel samping kanan.
   - Auto-fit bounds otomatis mengarahkan kamera peta ke titik-titik yang tersaring.
   - Tombol "Reset Filter" 1-klik untuk mengembalikan seluruh penanda.
   - Indikator hitungan penanda: "Menampilkan X dari Y titik penanda".
9. **Interaktivitas Penanda & Jejaring Spasial:**
   - Penanda kustom berkode warna (Biru/Indigo = aktif, Hijau = 100% selesai, Amber = dalam proses).
   - Label nama desa mengambang di bawah pin penanda (bisa di-toggle on/off).
   - Animasi denyut (*pulse/ping*) pada penanda titik survei aktif.
   - Tooltip hover menampilkan desa, bahasa, kecamatan, kabupaten, dan progres.
   - Popup klik kaya informasi: detail informan, status validasi, kelengkapan Swadesh/audio, koordinat GPS.
   - Tombol popup "⚡ Buka & Edit Formulir" untuk navigasi langsung ke kuesioner.
   - Tombol popup "⚖️ Bandingkan" untuk membuka komparasi bahasa.
   - Tombol popup "📍 Buka di Google Maps" membuka titik koordinat presisi di tab baru Google Maps.
   - Fitur toggle **Garis Relasi Spasial**: Menghubungkan seluruh titik pengamatan dengan jaring spasial poligon putus-putus untuk analisis kedekatan jarak.
   - Fitur **Pusatkan Semua (Recenter Bounds)** untuk menampilkan seluruh titik survei secara optimal.
   - Panel Samping Navigasi Cepat (Roster): Pencarian live, filter status, filter bahasa, daftar titik dengan koordinat presisi, tombol salin GPS, tombol fly-to-point, dan tombol pintas ke Google Maps.
   - Mode Perbesar Layar Penuh (Fullscreen Expand Toggle).

### 4.3 Modul Kuesioner 16 Bagian Instrumen Pemetaan Bahasa
10. **Mode Tampilan Ganda Kuesioner:**
    - Mode 16 Layar Terfokus (`form-screen`): Stepper tombol pill interaktif 1–16, indikator error validasi per seksi, tombol navigasi "Kembali" & "Selanjutnya", tombol "Selesai & Buka Dashboard".
    - Mode Gulir Penuh (`form-all`): Seluruh 16 seksi disajikan bersambung dalam satu halaman panjang.
11. **Seksi 1 (Titik Pengamatan):** Input toponimi nama desa, bahasa yang digunakan, nama lain bahasa, kecamatan, kab/kota, provinsi, pulau, kode titik, koordinat lintang & bujur. Sinkronisasi otomatis ke Seksi 3.
12. **Seksi 2 (Situasi Kebahasaan):** Input desa dan bahasa yang berbatasan langsung di 4 arah mata angin (Timur, Barat, Utara, Selatan).
13. **Seksi 3 (Situasi Geografis & Morfologi):** Input letak pantai (pantai/pedalaman), jarak dari pantai (km), topografi morfologi (dataran, pegunungan, perbukitan, pesisir), peta interaktif Leaflet mini dengan transisi basemap halus dan indikator loading.
14. **Seksi 4 (Penduduk & Penutur):** Demografi total pria/wanita, kelompok umur (<20, 20–40, >40), jumlah penutur bahasa menurut umur dan gender, serta etnis mayoritas/minoritas beserta persentase.
15. **Seksi 5 (Mata Pencaharian):** Input profesi bertani, nelayan, berdagang, buruh, pegawai, lain-lain, dan keterangan kearifan lokal.
16. **Seksi 6 (Pendidikan):** Statistik warga tidak sekolah, lulusan SD, SMP, SMA, PT, dan jumlah sarjana asal desa.
17. **Seksi 7 (Sarana Pendidikan):** Fasilitas fisik gedung sekolah SD, SMP, SMA, PT, dan lembaga kursus.
18. **Seksi 8 (Agama):** Sebaran pemeluk agama Islam, Protestan, Katolik, Hindu, Buddha, Konghucu, dan kepercayaan lokal.
19. **Seksi 9 (Hubungan Mobilitas):** Status kelancaran interaksi desa (sangat lancar s.d. tidak lancar) dan catatan kondisi aksesibilitas.
20. **Seksi 10 (Alat Transportasi):** Pilihan moda transportasi darat, laut, sungai, dan udara yang beroperasi menjangkau desa.
21. **Seksi 11 (Usia Desa):** Kategori usia desa (<50, 50–100, 200–500, >500 tahun), estimasi tahun berdiri, dan catatan sumber sejarah.
22. **Seksi 12 (Sejarah Desa):** Narasi sejarah singkat desa, toponimi asal-usul nama desa, dan tokoh pendiri.
23. **Seksi 13 (Folklore & Sastra Lisan):** Judul cerita rakyat, kategori mitos/legenda/dongeng, ringkasan cerita, tokoh sentral, dan fungsi tradisi.
24. **Seksi 14 (Data Informan Triangulasi):** Profil minimal 3 narasumber lokal (nama, gender, usia, tahun lahir, tempat lahir, pendidikan, pekerjaan, lama tinggal, frekuensi bepergian, medsos fb/tiktok/ig/twitter, bahasa di rumah/masyarakat/kerja, bahasa lain dikuasai aktif/pasif).
25. **Seksi 15 (Kosakata Swadesh 200, Budaya A-R, Audio & Gemini AI):**
    - 200 Kosakata Swadesh: Glos Indonesia, bentuk lokal, transkripsi fonetis IPA, dan catatan varian.
    - Perekam Suara Audio Terintegrasi (Web Audio API): Tombol rekam, jeda, putar ulang, dan hapus rekaman per glos. Durasi dan nama berkas tersimpan otomatis.
    - Tombol **"Deteksi Serapan (Gemini AI)"**: Mengirim kelompok kata ke endpoint `/api/ai/deteksi-kata-serapan` untuk menganalisis etimologi serapan (Sanskerta, Arab, Belanda, Portugis, Hokkien, Melayu) vs kognat asli Proto-Austronesia.
    - 18 Bidang Kosakata Budaya (A–R): Tubuh, kekerabatan, rumah, dapur, pakaian, makanan, penyakit, flora, fauna, waktu, arah, warna, ukuran, pertanian, perikanan, upacara, senjata, seni musik.
    - Struktur Frasa: Nominal posesif, partitif, asal material, verbal, adjektival, adverbial.
    - 50 Kalimat Sederhana berglos per kata (analisis S-P-O-K).
    - Catatan Pengumpul Data: Tanggal wawancara, lokasi, durasi waktu, jumlah saksi, suasana wawancara, nama pengumpul, pekerjaan, tanda tangan, catatan pengumpul.
    - Impor Berkas Excel (.xlsx): Mengunggah berkas Excel untuk memperbarui daftar kosakata Swadesh secara massal.
    - Ekspor Berkas Excel (.xlsx): Mengunduh daftar kosakata dalam format spreadsheet.
26. **Seksi 16 (Dialektometri Guiter & Titik Pembanding):**
    - Titik Pengamatan Acuan dan penambahan Titik Pembanding dinamis.
    - Input jumlah perbedaan ($s$) dan jumlah glos ($n$).
    - Kalkulasi otomatis persentase perbedaan $d = (s/n) \times 100\%$.
    - Klasifikasi otomatis status: Dialek Sama, Beda Subdialek, Beda Dialek, Beda Bahasa, Beda Rumpun.
    - Visualisasi segitiga pembanding dan perumusan batas isoglos lapangan.

### 4.4 Modul Komparasi Bahasa & Analisis Dialektometri
27. **Komparasi Multibahasa (2 atau 3 Titik):**
    - Pemilihan Titik Survei A, Titik Survei B, dan Titik Survei C.
    - Penyandingan glos kosakata berdampingan secara sinkron.
    - Kategorisasi otomatis: Kognat Sama, Beda Fonemis (perubahan bunyi teratur), Beda Leksikal (kata berbeda total).
    - Matriks perbandingan berpasangan (Pair A-B, Pair A-C, Pair B-C).
    - Kalkulasi indeks dialektometri Guiter per pasangan bahasa.
    - Ekspor matriks perbandingan ke format CSV dan Excel.

### 4.5 Modul Tematik Tambahan (Kuesioner Hub)
28. **Pusat Kuesioner Terpadu (`KuesionerHubView`):** Akses 4 instrumen dalam satu pintu (Pemetaan 16 Seksi, Vitalitas UNESCO, Sastra Lisan, Revitalisasi Model C).
29. **Revitalisasi Bahasa Daerah Model C Maluku (`RevitalisasiView`):**
    - Instrumen Monev IKRBD (5 Dimensi): Kebijakan Pemda, Keterlibatan Guru & Komunitas, Ketersediaan Modul Ajar, Antusiasme Generasi Muda, Festival Tunas Bahasa Ibu (FTBI).
    - Penghitungan skor komposit IKRBD (0–100) dan klasifikasi: Sangat Kuat, Kuat, Cukup, Rentan, Sangat Rentan.
    - Rencana Aksi Pengimbasan (RAP): Penyusunan jadwal pengimbasan, target guru master, jumlah siswa terimbas, anggaran, dan kurikulum muatan lokal.
    - Ekspor data Monev IKRBD dan RAP ke format CSV.
30. **Vitalitas Bahasa UNESCO (9 Parameter):** Dokumentasi daya hidup bahasa berdasarkan kriteria transmisi antargenerasi, proporsi penutur, respons terhadap media baru, materi literasi, dan kebijakan bahasa pemerintah.
31. **Korpus Sastra Lisan & Tradisi Tutur (`SastraLisanView`):** Dokumentasi cerita rakyat, ungkapan tradisional, pantun/syair daerah, dan sastra lisan Nusantara.

### 4.6 Modul Navigasi, Pencarian & Antarmuka Global
32. **Bilah Navigasi Samping Responsif (`AppSidebar`):**
    - Pengelompokan menu: Survei & Analisis, Korpus Kebahasaan, Pusat Kuesioner.
    - Tombol penciut desktop (Desktop Collapsible) dan laci layar geser mobile (Mobile Drawer).
    - Pintasan cepat "Dokumen PRD & Flow (.doc/PDF)".
    - Kartu profil pengguna dan tombol keluar (Logout).
33. **Bilah Navigasi Atas (`DashboardNavbar`):**
    - Breadcrumb nomor seksi dan judul halaman aktif.
    - Bilah pencarian Command Palette (⌘K / Ctrl+K).
    - Tombol jalan pintas "Peta Survei" menuju Leaflet GIS.
    - Tombol jalan pintas "PRD & Flow" membuka dokumen spesifikasi resmi.
    - Tombol alih tema visual (ThemeToggle: Terang/Gelap).
    - Tombol instalasi PWA ke perangkat desktop/ponsel.
    - Indikator status koneksi Firebase Cloud (Connected, Checking, Offline) dan jumlah antrean sync pending.
34. **Command Palette Global (`CommandSearchModal`):**
    - Pintasan keyboard ⌘K (Mac) atau Ctrl+K (Windows/Linux).
    - Pencarian live ke seluruh modul pandangan (Dashboard, Peta Survei, Responden, Datasets, Kosakata, Dialektometri, Revitalisasi, Komparasi, PRD).
    - Pencarian langsung ke 16 nomor seksi instrumen kuesioner.
    - Navigasi keyboard penuh (panah atas/bawah, Enter, Escape).
35. **Bilah Navigasi Melayang Mobile (`FloatingBottomNav`):** Navigasi mengambang di bawah layar ponsel untuk akses instan ke Dasbor, Peta Survei, Kuesioner, Kosakata, dan Dialektometri.
36. **Pengalih Bahasa Antarmuka (`LanguageSelector`):** Mendukung Bahasa Indonesia dan English.
37. **Pemeriksa Validasi Real-time (`FormValidationStatus` & `ValidationWarningModal`):**
    - Menghitung jumlah kolom yang belum diisi atau formatnya belum valid per seksi.
    - Modal peringatan interaktif sebelum menyimpan dengan rincian kolom yang perlu diperbaiki.

### 4.7 Modul Penyimpanan, Sinkronisasi & Ekspor Dokumen
38. **Offline Sync Manager & PWA Engine:**
    - Caching aset lengkap menggunakan Service Worker Workbox.
    - Antrean mutasi data saat luring (*offline mutation queue*).
    - Sinkronisasi dua arah otomatis ke Firebase Firestore saat online.
    - Tombol sinkronisasi manual ke cloud dengan feedback visual toast.
39. **Ekspor Multi-Format (`ExportModal`):**
    - Ekspor Buku Kerja Excel Multi-Sheet (.xlsx) resmi standar riset.
    - Ekspor 200 Kosakata Swadesh (.csv).
    - Ekspor format cetak bersih instrumen (Print to PDF).
    - Cadangkan seluruh koleksi survei (.json).
    - Unduh Dokumen Resmi PRD & Detailed User Flow (.doc).
40. **Penampil Dokumen PRD Interaktif (`PRDDocumentModal`):**
    - Penampil dokumen modal kaya tab (Ringkasan, User Flow, 16 Seksi, Dialektometri Guiter, Leaflet GIS, Spesifikasi Kebutuhan).
    - Tombol unduh langsung berkas Word `.doc` resmi.
    - Tombol cetak atau simpan sebagai PDF langsung dari peramban (`window.print()`).
    - Tombol salin tautan dokumen.

---

## 5. FORMULASI MATEMATIS DIALEKTOMETRI (METODE GUITER)

Sistem menggunakan formula kuantitatif standar geolinguistik komparatif Jean Guiter:

$$\mathbf{d = \left(\frac{s}{n}\right) \times 100\%}$$

*Di mana:*
- **d**: Persentase perbedaan dialektometri (Indeks Guiter)
- **s**: Jumlah perbedaan bentuk leksikal antar dua titik pengamatan yang dibandingkan
- **n**: Jumlah keseluruhan glos konsep yang diperbandingkan (misal: 200 Swadesh)

### Skala Klasifikasi Hubungan Kebahasaan:
| Rentang Indeks ($d$) | Klasifikasi Status | Interpretasi Dialektologi |
| :--- | :--- | :--- |
| **$0\% \le d \le 20\%$** | **Dialek Sama (Homogen)** | Tidak ada perbedaan dialek yang nyata; variasi hanya berupa idiolek individual atau varian bebas. |
| **$21\% \le d \le 30\%$** | **Beda Wicara / Subdialek** | Variasi fonetik dan leksikal minor; saling pemahaman (*mutual intelligibility*) masih sangat tinggi. |
| **$31\% \le d \le 50\%$** | **Beda Dialek (*Dialect*)** | Perbedaan dialek yang nyata secara leksikal dan fonologis; membentuk garis isoglos yang tegas. |
| **$51\% \le d \le 80\%$** | **Beda Bahasa (*Language*)** | Perbedaan leksikon sangat besar sehingga diklasifikasikan sebagai bahasa yang berbeda (*different languages*). |
| **$d > 80\%$** | **Beda Rumpun / Subkeluarga** | Perbedaan leksikon ekstrem yang mengindikasikan percabangan keluarga bahasa terpisah secara historis. |

---

## 6. SPESIFIKASI KEBUTUHAN FUNGSIONAL & NON-FUNGSIONAL (FR & NFR)

### Kebutuhan Fungsional (FR):
| Kode | Nama Fitur | Deskripsi Fungsional & Acceptance Criteria |
| :--- | :--- | :--- |
| **FR-01** | Multi-Survey Engine | Pembuatan survei baru kosong, duplikasi, pemulihan cadangan JSON, auto-save 500ms, dan filter pencarian. |
| **FR-02** | Kuesioner 16 Seksi | Mode stepper 16 layar dan mode gulir penuh, validasi real-time, sinkronisasi koordinat seksi 1 ke seksi 3. |
| **FR-03** | Perekam Audio Terintegrasi | Web Audio API terintegrasi pada 200 glos Swadesh; audio tersimpan dalam data URL atau tautan cloud. |
| **FR-04** | Gemini AI Loanword API | Endpoint `/api/ai/deteksi-kata-serapan` (Gemini 3.8 Flash) menganalisis etimologi serapan vs kognat Austronesia. |
| **FR-05** | Kalkulator Guiter Otomatis | Perhitungan $d=(s/n)\times 100\%$ instan (<100ms), klasifikasi otomatis status dialek, dan matriks segitiga. |
| **FR-06** | Leaflet GIS & Filtering | 5 basemap terintegrasi (termasuk Google Roads & Satelit), filter status verifikasi, filter kelompok usia informan. |
| **FR-07** | Komparasi 2–3 Bahasa | Menyandingkan glos kata, memetakan perbedaan fonemis vs leksikal, dan ekspor ke Excel/CSV. |
| **FR-08** | Modul Revitalisasi (IKRBD & RAP) | Kuesioner IKRBD 5 dimensi Model C Maluku, Rencana Aksi Pengimbasan (RAP), dan 9 parameter vitalitas UNESCO. |
| **FR-09** | Offline-First PWA | Beroperasi tanpa internet dengan Service Worker dan antrean sinkronisasi dua arah ke Firestore. |
| **FR-10** | Ekspor Multi-Format Resmi | Ekspor JSON, Excel (XLSX), CSV, serta dokumen Word (.doc) dan pencetakan PDF resmi. |

### Kebutuhan Non-Fungsional (NFR):
- **Performa & Kecepatan:** Waktu muat awal < 1.5 detik, komputasi dialektometri client-side < 100 ms untuk 200 glos.
- **Keandalan & Zero Data Loss:** Auto-save ber-debounce 500ms menjamin tidak ada data yang hilang saat peramban tertutup mendadak.
- **Keamanan:** Otorisasi RBAC Firestore rules, token JWT terenkripsi, kunci API Gemini terisolasi aman di server.
- **Responsivitas Perangkat:** Desain responsif sempurna untuk smartphone (9:16/9:19), tablet (3:4), laptop, dan desktop ultra-wide.

---

## 7. CARA MENGAKSES & MENGUNDUH DOKUMEN RESMI

Pengguna dapat mengakses dan mengunduh berkas PRD & User Flow ini melalui 4 metode:
1. **Unduh Langsung Berkas Word (.doc):**
   - Tautan langsung: `/docs/PRD_USER_FLOW_SISTEM_PEMETAAN_BAHASA.doc`
   - Berkas ini siap dibuka di Microsoft Word, Google Docs, atau LibreOffice dengan format sampul resmi, tabel terstruktur, dan tipografi rapi.
2. **Cetak atau Simpan sebagai PDF:**
   - Klik tombol **"PRD & Flow"** di Bilah Navigasi Atas atau menu **"Dokumen PRD & Flow"** di Sidebar.
   - Klik tombol **"Cetak / PDF"** di pojok kanan atas modal penampil; dialog cetak peramban akan terbuka dan pilih opsi *Save as PDF*.
3. **Melalui Modal Ekspor:**
   - Klik menu **Ekspor Data** di pojok kanan atas, lalu klik kartu **"Unduh Dokumen PRD & Detailed User Flow (.doc)"**.
4. **Repositori Kode Sumber:**
   - Berkas Markdown tersedia di `/docs/PRD_USER_FLOW_SISTEM_PEMETAAN_BAHASA.md`.

---

*Dokumen ini merupakan spesifikasi teknis dan panduan operasional resmi Sistem Pemetaan Bahasa & Dialektometri (Derana Panel Enterprise). Seluruh hak cipta dilindungi.*
