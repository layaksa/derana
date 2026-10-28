# PANDUAN LENGKAP FITUR KHUSUS MENU DIALEK & PETA (GIS GEOLINGUISTIK)
**Sistem Pemetaan Bahasa & Dialektometri Terkomputasi (Derana Panel Enterprise)**  
*Standar Metodologi: Dialektometri Jean Guiter (1973), Pemetaan Isoglos Geospasial Leaflet GIS, & Vitalitas Bahasa EGIDS/UNESCO*

---

## 1. Pendahuluan & Landasan Teori Geolinguistik

Geolinguistik (dialektologi spasial) adalah cabang linguistik yang meneliti variasi bahasa berdasarkan distribusi geografisnya. Pada sistem ini, menu **Dialek & Peta** mengintegrasikan dua disiplin ilmu: **Dialektometri Kuantitatif** dan **Sistem Informasi Geografis (GIS)** modern berbasis web.

### 1.1 Tujuan Fitur
1. **Memetakan Variasi Leksikal & Fonologis**: Menampilkan bagaimana kata-kata dasar (seperti 200 kosakata Swadesh) bervariasi dari satu desa ke desa lain.
2. **Menentukan Batas Wilayah Bahasa (Isoglos)**: Menghitung dan menggambar garis pemisah antar-daerah pemakaian unsur bahasa yang berbeda secara objektif.
3. **Mengukur Jarak Linguistik Matematis**: Menghitung koefisien perbedaan antar titik pengamatan menggunakan formula Jean Guiter tanpa subjektivitas peneliti.
4. **Mendeteksi Berkas Isoglos (*Bundle of Isoglosses*)**: Mengidentifikasi konsentrasi akumulasi batas leksikal yang menandai garis batas dialek atau batas bahasa yang definitif.
5. **Memvalidasi Vitalitas Bahasa**: Menghubungkan titik survei lapangan dengan data sebaran nasional Glottolog dan tingkat kepunahan bahasa (EGIDS).

---

## 2. Fitur-Fitur Khusus Peta Virtual Isoglos (Leaflet GIS)

Komponen utama: `PetaVirtualIsoglosView.tsx` dan `GlottologLanguageMap.tsx`.

### 2.1 Algoritma Perhitungan Garis Pembagi Tegak Lurus (*Perpendicular Bisector*)
Dalam geolinguistik klasik, penarikan garis isoglos antar dua desa sering kali digambar manual secara subjektif. Pada aplikasi ini, sistem menerapkan kalkulasi matematis **Garis Sumbu Pembagi Tegak Lurus (Perpendicular Bisector Segment)**:

- Diberikan dua titik koordinat: Titik Pengamatan $A (\phi_1, \lambda_1)$ dan Titik Pengamatan $B (\phi_2, \lambda_2)$.
- Sistem menentukan titik tengah (*midpoint*):
  $$\phi_m = \frac{\phi_1 + \phi_2}{2}, \quad \lambda_m = \frac{\lambda_1 + \lambda_2}{2}$$
- Vektor perpindahan dihitung dengan penyesuaian koreksi proyeksi merkator bujur terhadap lintang rata-rata ($\cos(\phi_m)$).
- Vektor ortogonal (tegak lurus) dinormalisasi dan direntangkan sepanjang rentang $spanKm$ (default 25–40 km).
- Garis ini menjadi batas pembagi objektif antara wilayah pemakaian kata di desa A versus wilayah pemakaian kata di desa B.

### 2.2 Algoritma Convex Hull 2D (*Territory Polygons*)
Untuk menampilkan wilayah kesatuan pemakaian bentuk leksikal yang homogen di beberapa desa sekaligus:
- Sistem menerapkan **Monotone Chain Algorithm** (kompleksitas $O(N \log N)$) untuk menghitung selubung cembung (*Convex Hull*) dari koordinat titik pengamatan yang memiliki kata yang sama.
- Poligon teritori diarsir transparan dengan palet warna tematik yang konsisten (`VARIANT_PALETTE`), memudahkan identifikasi kantong dialek secara visual dalam satu pandangan.

### 2.3 Tiga (3) Mode Visualisasi Peta
Pengguna dapat memilih salah satu dari 3 mode visualisasi melalui bilah kontrol di bagian atas peta:

| Mode Visualisasi | Penjelasan Teknis | Kegunaan Analisis |
| :--- | :--- | :--- |
| **1. Kata Terpilih (*Single Gloss*)** | Memvisualisasikan distribusi variasi bentuk lokal untuk satu kata tertentu (misal: "air", "mata", "rumah"). Menampilkan poligon teritori dan garis pemisah antar kelompok kata. | Analisis mikro fonetis/leksikal per kata Swadesh 1–200. |
| **2. Berkas Global (*Bundle of Isoglosses*)** | Menghitung akumulasi seluruh perbedaan dari seluruh korpus glos antara setiap pasangan titik pengamatan. Ketebalan dan kepekatan garis merefleksikan bobot akumulasi perbedaan (*bundling weight*). | Menemukan batas dialek/bahasa makro. Semakin tebal garis, semakin kuat pemisah dialeknya. |
| **3. Jaringan Kesamaan (*Concordance Network*)** | Menghubungkan titik-titik pengamatan yang berbagi bentuk kata identik dengan garis jejaring relasi (*co-lexical links*). | Menemukan jejaring kekerabatan bahasa antar-pulau atau migrasi penutur. |

### 2.4 Sistem Layer & Lapisan Peta Dasar (Multi-Basemap)
Tersedia pengalih lapisan fleksibel:
1. **Carto Positron / Light**: Peta dasar abu-abu terang minimalis, sangat kontras untuk kartografi publikasi ilmiah atau cetak hitam-putih.
2. **Carto Dark Matter**: Peta kontras tinggi gelap, ideal untuk presentasi layar proyektor.
3. **OpenStreetMap (OSM)**: Menampilkan nama jalan, sungai, batas administratif lokal, dan topografi mikro.
4. **Topografi / Kontur Bentang Alam**: Menunjukkan elevasi perbukitan/pegunungan yang kerap menjadi penghalang alami (*natural geographical barrier*) penyebaran dialek.

Lapisan data yang dapat dinyalakan/dimatikan (*Layer Toggles*):
- `[✓] Poligon Teritori Varian`: Menampilkan arsir wilayah kesamaan kata.
- `[✓] Garis Batas Pembagi (Bisector)`: Menampilkan garis isoglos pemisah.
- `[✓] Jaringan Keterhubungan`: Garis jejaring relasi leksikal.
- `[✓] Label Titik Pengamatan`: Nama desa dan bentuk lokal langsung di atas peta.

### 2.5 Fitur Tur Interaktif Otomatis (*Auto-Play Tour*)
- Tombol **"Putar Tur (Auto-Play)"** di panel peta menjalankan animasi pergantian glos Swadesh nomor 1 sampai 200 secara otomatis setiap interval 2.5 detik.
- Berguna untuk seminar ilmiah, kuliah umum, atau peninjauan cepat evolusi isoglos dari konsep biologis (anggota tubuh), fenomena alam, hingga kata kerja.
- Pengguna dapat menjeda (*Pause*), melanjutkan (*Play*), atau mengatur ulang (*Reset*) tur kapan saja.

### 2.6 Pemutar Audio Asli & Sintesis Pelafalan (Web Speech API)
- Setiap penanda desa (*marker*) memiliki tombol suara speaker.
- Jika survei memiliki rekaman suara informan asli (dari mikrofon Seksi 15), sistem memutar audio rekaman asli informan.
- Jika rekaman belum tersedia, sistem menggunakan sintesis ucapan lokal berkecepatan 0.85× agar linguis dapat mendengar perkiraan fonetis kata tersebut.

### 2.7 Drawer Analisis Pasangan Titik Pengamatan
- Mengklik salah satu garis pembagi isoglos di antara dua desa akan memunculkan laci detail (*Side Drawer*):
  - Jarak spasial garis lurus antar-titik dalam kilometer ($km$).
  - Persentase perbedaan dialektometri pasangan tersebut ($d\%$).
  - Daftar kata yang sama (*identical cognates*).
  - Daftar kata yang berbeda lengkap dengan perbandingan bentuk di Desa A vs Desa B.

---

## 3. Fitur Khusus Dialektometri & Rumus Jean Guiter (1973)

Komponen utama: `LanguageComparison.tsx` dan modul kalkulator `src/utils/dialectometryComparator.ts`.

### 3.1 Formulasi Matematis

$$d = \left( \frac{s}{n} \right) \times 100\%$$

Di mana:
- **$d$** = Derajat perbedaan dialektometri (dalam persen).
- **$s$** = Jumlah perbedaan bentuk kata (*different lexical/phonological items*).
- **$n$** = Jumlah keseluruhan glos yang diperbandingkan (*total compared items*).

### 3.2 Skala Klasifikasi Signifikansi Hubungan Kebahasaan

| Rentang Persentase ($d$) | Klasifikasi Status | Karakteristik Linguistik | Rekomendasi Isoglos |
| :---: | :---: | :--- | :---: |
| **0% – 20%** | **Dialek Sama (Homogen)** | Perbedaan sangat minim, hanya variasi idiolek perorangan. Saling memahami (*mutual intelligibility*) 100%. | Tidak ditarik garis isoglos |
| **21% – 30%** | **Beda Wicara / Subdialek** | Perbedaan fonetis minor (misal alofon vokal/konsonan akhir). Saling memahami >90%. | Garis isoglos putus-putus (Lemah) |
| **31% – 50%** | **Beda Dialek (Dialect)** | Perbedaan leksikal dan fonologis nyata. Membentuk batas isolek definitif. | Garis isoglos tegas (Solid) |
| **51% – 80%** | **Beda Bahasa (Language)** | Mayoritas kosa kata dasar berbeda secara signifikan. Komunikasi spontan terhambat. | Garis batas bahasa ganda |
| **> 80%** | **Beda Rumpun / Subkeluarga** | Perbedaan kosakata masif; struktur gramatika dan kosa kata dasar terpisah secara filogenetik. | Garis batas rumpun |

### 3.3 Matriks Segitiga (*Triangular Permutation Matrix*)
- Untuk perbandingan $N$ titik pengamatan/bahasa, sistem secara instan membangun matriks segitiga berdimensi $\frac{N \times (N-1)}{2}$.
- Menghitung koefisien perbedaan silang antar seluruh pasangan bahasa (misal: Sunda Priangan vs Jawa Banyumas vs Melayu Betawi vs Sunda Banten).
- Sel matriks diberi kode warna gradasi (hijau = dekat, kuning = subdialek, jingga = beda dialek, merah/ungu = beda bahasa).

### 3.4 Modul Perbandingan Berdampingan (*Side-by-Side Survey Comparison*)
- Menampilkan data dua survei riil berdampingan baris demi baris untuk 200 Glos Swadesh.
- Klasifikasi otomatis setiap pasang kata:
  - **IDENTICAL (Hijau)**: Kata dan ejaan identik persis.
  - **PHONOLOGICAL (Kuning)**: Kata berakar sama (kognat) namun mengalami pergeseran bunyi teratur (misal: *r/l*, vokal akhir *a/o*).
  - **LEXICAL (Merah)**: Kata menggunakan akar kata etimologis yang berbeda sama sekali.
  - **NO_DATA (Abu-abu)**: Salah satu titik survei belum menginput kata.
- **Fitur Rekayasa Manual (*Manual Override*)**: Linguis dapat mengklik tombol koreksi jika sistem komputer mengklasifikasikan kata sebagai beda leksikal padahal merupakan kognat fonologis kuno, disertai kolom catatan etimologi ilmiah.

---

## 4. Peta Persebaran Glottolog & Indikator Vitalitas Bahasa (EGIDS)

Komponen utama: `GlottologLanguageMap.tsx`.

### 4.1 Basis Data 700+ Bahasa Daerah Nusantara
- Memuat basis data bahasa-bahasa di Indonesia terintegrasi dengan kode internasional **Glottocode** dan **ISO 639-3**.
- Klasifikasi silsilah rumpun: *Austronesian (Malayo-Polynesian)*, *Trans-New Guinea*, *North Halmahera*, *South Bougainville*, dll.

### 4.2 Empat (4) Layer Tematik Glottolog
1. **Persebaran Titik Bahasa**: Penanda pin seluruh bahasa daerah di 38 provinsi Indonesia.
2. **Poligon Kepadatan Penutur**: Pewarnaan gradasi wilayah berdasarkan estimasi jumlah penutur aktif.
3. **Batas Wilayah Etnolinguistik**: Garis batas wilayah adat penutur bahasa tradisional.
4. **Titik Survei Lapangan Riil**: Menghubungkan titik survei yang telah diisi oleh tim surveyor di lapangan langsung ke peta nasional.

### 4.3 Skala Vitalitas Bahasa EGIDS / UNESCO
Sistem menyematkan klasifikasi ketahanan bahasa:
- **Aman (*Safe - EGIDS 1-5*)**: Dituturkan oleh semua generasi, dipelajari anak-anak.
- **Rentan (*Vulnerable - EGIDS 6a*)**: Dituturkan sebagian besar anak, namun terbatas pada ranah rumah tangga.
- **Mengalami Kemunduran (*Definitely Endangered - EGIDS 6b*)**: Anak-anak tidak lagi mempelajari bahasa ibu di rumah.
- **Terancam Punah (*Severely Endangered - EGIDS 7*)**: Hanya dituturkan oleh generasi kakek-nenek.
- **Kritis (*Critically Endangered - EGIDS 8*)**: Hanya beberapa penutur sepuh yang tersisa.
- **Punah (*Extinct - EGIDS 9-10*)**: Tidak ada lagi penutur hidup yang tersisa.

---

## 5. Panduan Praktis Langkah-demi-Langkah Penggunaan

### Skenario A: Menganalisis Isoglos Satu Kata Tertentu
1. Buka menu **Peta & Dialek** > **Peta Virtual Isoglos**.
2. Pada panel pencarian glos di kiri atas, ketik kata yang ingin diteliti (misal: `"air"` atau glos nomor 156).
3. Peta akan otomatis memperbarui penanda titik, pewarnaan varian bentuk lokal, dan garis pembagi tegak lurus (isoglos).
4. Aktifkan checkbox `[✓] Poligon Teritori Varian` untuk melihat wilayah homogen kata tersebut.
5. Klik pada garis isoglos di antara dua desa untuk membuka drawer perbandingan selisih kata dan jarak kilometer.

### Skenario B: Melakukan Komparasi Dialektometri Antar-Survei
1. Buka menu **Dialektometri & Komparasi**.
2. Pada dropdown **Bahasa / Titik 1**, pilih survei yang aktif atau preset bahasa (misal: *Sunda Priangan*).
3. Pada dropdown **Bahasa / Titik 2**, pilih survei pembanding (misal: *Jawa Banyumas*).
4. Sistem otomatis menampilkan:
   - Nilai persentase perbedaan $d = (s / n) \times 100\%$.
   - Kategori status (misal: *Beda Bahasa (78.5%)*).
   - Tabel perbandingan 200 kosakata Swadesh lengkap dengan status IDENTICAL, PHONOLOGICAL, atau LEXICAL.
5. Jika ada kata serapan asing yang keliru, gunakan tombol *Override* untuk mengoreksi klasifikasi.
6. Klik tombol **"Ekspor CSV"** atau **"Unduh Dokumen .DOC"** untuk mengunduh laporan analisis.

---

## 6. Format Ekspor & Integrasi

1. **Ekspor CSV Matriks Segitiga**: Berkas tabel matriks jarak dialektometri yang siap diimpor ke perangkat lunak statistik R, SPSS, atau PAUP untuk analisis filogenetika bahasa.
2. **Ekspor GeoJSON**: Data spasial koordinat titik pengamatan dan garis isoglos yang kompatibel dengan perangkat lunak GIS standar (QGIS, ArcGIS, Google Earth).
3. **Dokumen Laporan (.DOC Word & Cetak PDF)**: Laporan formal berstandar riset nasional yang siap dilampirkan dalam publikasi ilmiah Badan Bahasa atau kementerian terkait.
4. **Pencadangan Cloud Firestore**: Tersinkronisasi secara aman dengan autentikasi berbasis peran (RBAC).

---

## 7. Panduan Pengguna & User Flow 12 Modul Bento (Seksi 16)

Bagian **"Pilih Instrumen Visualisasi & Analisis Dialek (12 Modul Bento)"** pada Seksi 16 Dialektometri & Peta menyediakan 12 instrumen terintegrasi untuk eksplorasi multidimensi data geolinguistik:

### 7.1. Diagram Alur Kerja (User Flow 6 Fase)

```
[ Fase 1: Georeferensi ]
  Koordinat GPS & Administratif (Seksi 1 & 3)
         │
         ▼
[ Fase 2: Korpus 200 Swadesh ]
  Entri Glos Leksikal & Transkripsi IPA (Seksi 15)
         │
         ▼
[ Fase 3: Komputasi Indeks Guiter ]
  Tombol "Hitung Ulang Indeks" di Modul 11 -> Sinkronisasi d%
         │
         ▼
[ Fase 4: Analisis Spasial & Isoglos ]
  Modul 1 (Peta GIS), Modul 2 (Bisector), Modul 4 (Heatmap Spasial), Modul 10 (SVG)
         │
         ▼
[ Fase 5: Taksonomi & Silsilah Kekerabatan ]
  Modul 5 (Klaster UPGMA D3), Modul 6 (Pohon Filogenetik), Modul 12 (Glotokronologi)
         │
         ▼
[ Fase 6: Validasi & Publikasi Ilmiah ]
  Modul 7 (Scatter Plot IBD), Modul 8 (Klasifikasi Resmi Badan Bahasa) -> Ekspor Laporan
```

### 7.2. Rincian Spesifikasi & Panduan Penggunaan 12 Modul Bento

| No | Nama Modul | Kategori | Metodologi Ilmiah | Input Utama | Output Utama | Panduan Langkah Penggunaan |
|---|---|---|---|---|---|---|
| **1** | **Peta Tematik Leksikal** | Spasial | WebGIS Leaflet WGS84, Haversine | GPS Lat/Lng Seksi 1 & 3 | Peta sebaran titik, lingkaran radius, popup desa | Buka modul, atur basemap (Light/Dark/OSM/Topo), klik marker desa untuk ringkasan. |
| **2** | **Isoglos Otomatis** | Spasial | Orthogonal Bisector Guiter (1973) | Pasangan titik & selisih kata | Garis isoglos ortogonal, berkas tebal terakumulasi | Pilih mode "Kata Terpilih" atau "Berkas Global", klik garis batas untuk membuka drawer perbandingan. |
| **3** | **Matriks Heat-Map & Radar** | Matriks | Korelasi Segitiga & Polar Spasial | Seluruh kombinasi pasangan titik | Tabel heatmap gradasi hijau-merah, diagram radar | Arahkan kursor ke sel diagonal untuk membaca indeks presisi, cermati diagram radar arah sebaran. |
| **4** | **Heatmap Dialek Spasial** | Spasial | Inverse Distance Weighting (IDW) | Koordinat & nilai d% acuan | Kontur gradasi warna spasial bentang alam | Periksa batas gradasi cepat; cocokkan dengan rintangan topografi bukit/sungai pada basemap Topografi. |
| **5** | **Klaster & Radar D3** | Taksonomi | UPGMA Agglomerative Clustering | Matriks jarak leksikal berpasangan | Dendrogram pohon interaktif D3.js dengan cutoff | Geser slider jarak batas (cutoff threshold) untuk menguji pembagian 2, 3, atau 4 subdialek. |
| **6** | **Pohon Filogenetik** | Taksonomi | Filogenetika Leksikal Komparatif | Data kognat & retensi Swadesh | Pohon silsilah berakar (rooted tree) skala waktu | Klik node cabang untuk membaca estimasi abad pemisahan dan kognat bersama protobahasa. |
| **7** | **Grafik & Scatter Plot** | Matriks | Regresi Pearson, Model Wright IBD | Jarak km fisik & selisih leksikal d% | Grafik batang urutan beda, scatter plot garis tren R² | Cari pencilan (outlier) jauh di atas garis tren untuk mendeteksi rintangan budaya atau eksklave migrasi. |
| **8** | **Klasifikasi Kekerabatan** | Taksonomi | Skala Baku Badan Bahasa & Keraf | Nilai d% titik pembanding | Rekomendasi 5 status resmi & narasi laporan | Baca kartu taksonomi resmi, gunakan teks narasi otomatis untuk draf pembahasan publikasi. |
| **9** | **Perbandingan Dua Titik** | Leksikal | Analisis Pasangan Minimal Swadesh | 200 Glos desa 1 & desa 2, audio | Tabel perbandingan berdampingan & audio player | Pilih desa pembanding dari dropdown, aktifkan filter "Hanya Kata Berbeda", dengarkan audio bukti. |
| **10** | **Peta Isoglos Skematis** | Spasial | Teori Gelombang Johannes Schmidt | Topologi formasi berkas isoglos | Diagram poligon vektor SVG resolusi tinggi | Gunakan grafis bersih tanpa distorsi bumi ini untuk publikasi monograf atau cetak hitam-putih formal. |
| **11** | **Tabel & Kalkulator** | Leksikal | Rumus Guiter: d = (s/n)×100% | Nama desa, GPS, beda s, total n | Tabel entri data & sinkronisasi otomatis | Tambah titik pembanding baru, atau klik "Hitung Ulang Indeks Otomatis" untuk menyinkronkan data antar-survei. |
| **12** | **Glotokronologi** | Taksonomi | Leksikostatistik Swadesh (1952) | Kognat C, konstanta retensi r = 0.805 | Estimasi usia pisah (millennia) & era sejarah | Masukkan persentase kognat berpasangan, baca kedalaman waktu pisah (t) dan perkiraan abad sejarah. |

---

## 8. Matriks Tanggung Jawab Peran (Role Responsibilities)

1. **Surveyor Lapangan**:
   - Memvalidasi keakuratan koordinat GPS pada **Modul 1 (Peta Tematik)**.
   - Merekam pelafalan informan dan mengisi kosakata 200 Swadesh pada **Modul 9 (Komparasi Dua Titik)**.
   - Menginput titik-titik tetangga pada **Modul 11 (Tabel Titik)**.
2. **Verifikator Linguistik**:
   - Memverifikasi status kognat vs variasi fonologis pada **Modul 9**.
   - Memastikan tidak ada kekeliruan perhitungan pada **Modul 11** dan **Modul 3 (Matriks Heat-Map)**.
3. **Linguis Dialektolog**:
   - Menganalisis garis isoglos dan berkas pemisah pada **Modul 2** dan **Modul 4**.
   - Membaca pola pengelompokan pada **Modul 5 (Klaster UPGMA)** dan menetapkan status resmi pada **Modul 8 (Klasifikasi)**.
4. **Supervisor & Peneliti Utama**:
   - Menganalisis silsilah bahasa purba pada **Modul 6 (Filogenetik)** dan kedalaman waktu pisah pada **Modul 12 (Glotokronologi)**.
   - Menguji korelasi isolasi jarak pada **Modul 7 (Scatter Plot)**.
   - Mengesahkan ilustrasi publikasi ilmiah pada **Modul 10 (Skematis SVG)** dan mengekspor dokumen final.

---
*Dokumen ini diterbitkan sebagai bagian dari Panduan Standar Sistem Pemetaan Bahasa & Dialektometri (Derana Panel Enterprise).*

