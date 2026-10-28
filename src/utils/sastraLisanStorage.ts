import { SastraLisanRecord } from '../types/sastraLisan';
import { INITIAL_SASTRA_LISAN_RECORDS } from '../data/sastraLisanSampleData';
import { analyzeMotifDanJenis } from './sastraLisanAnalysis';
import { saveSastraLisanToFirestore, deleteSastraLisanFromFirestore } from '../lib/firebase';
import { offlineSyncManager } from './offlineSyncManager';

export const STORAGE_KEY_SASTRA_LISAN = 'linguistic_sastra_lisan_records_v2';

export function loadSastraLisanRecords(): SastraLisanRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SASTRA_LISAN);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    // Seed initial sample data
    localStorage.setItem(STORAGE_KEY_SASTRA_LISAN, JSON.stringify(INITIAL_SASTRA_LISAN_RECORDS));
    return INITIAL_SASTRA_LISAN_RECORDS;
  } catch (err) {
    console.error('Error loading Sastra Lisan records from storage:', err);
    return INITIAL_SASTRA_LISAN_RECORDS;
  }
}

export function persistSastraLisanRecords(records: SastraLisanRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SASTRA_LISAN, JSON.stringify(records));
  } catch (err) {
    console.error('Error persisting Sastra Lisan records:', err);
  }
}

export function saveSastraLisanRecord(record: SastraLisanRecord): SastraLisanRecord[] {
  const currentList = loadSastraLisanRecords();
  
  // Re-run analysis on save to ensure motif & genre match latest narrative changes
  const analysis = analyzeMotifDanJenis({
    namaSastra: record.namaSastraLisan,
    deskripsi: record.deskripsiSingkat,
    kutipan: record.kutipanTuturan,
    bentukTuturan: record.bentukTuturan,
    iringanMusik: record.iringanMusik,
    syarat: record.syaratPertunjukan,
    tujuan: record.tujuanPertunjukan
  });

  const updatedRecord: SastraLisanRecord = {
    ...record,
    analisisJenis: analysis.analisisJenis,
    analisisMotif: analysis.analisisMotif,
    updatedAt: new Date().toISOString()
  };

  const existingIndex = currentList.findIndex(item => item.id === record.id);
  let updatedList: SastraLisanRecord[];

  if (existingIndex >= 0) {
    updatedList = [...currentList];
    updatedList[existingIndex] = updatedRecord;
  } else {
    updatedList = [updatedRecord, ...currentList];
  }

  // 1. Simpan segera secara lokal
  persistSastraLisanRecords(updatedList);

  // 2. Unggah ke Firebase jika online, atau jadwalkan di antrian offline
  const isOnline = offlineSyncManager.isOnline();
  if (isOnline) {
    saveSastraLisanToFirestore(updatedRecord)
      .then(() => {
        offlineSyncManager.dequeue(updatedRecord.id);
      })
      .catch((err) => {
        console.warn('[OfflineSync] Gagal unggah langsung sastra lisan, masuk antrian:', err);
        offlineSyncManager.enqueue(updatedRecord.id, 'sastra_lisan');
      });
  } else {
    offlineSyncManager.enqueue(updatedRecord.id, 'sastra_lisan');
  }

  return updatedList;
}

export function deleteSastraLisanRecord(id: string): SastraLisanRecord[] {
  offlineSyncManager.dequeue(id);
  const currentList = loadSastraLisanRecords();
  const updatedList = currentList.filter(item => item.id !== id);
  persistSastraLisanRecords(updatedList);
  deleteSastraLisanFromFirestore(id).catch((err: unknown) => {
    console.debug('Firestore delete sastra lisan skipped/failed:', err);
  });
  return updatedList;
}

export function exportSastraLisanToCSV(records: SastraLisanRecord[]): void {
  if (!records.length) return;

  const headers = [
    'ID Dokumen',
    'Nama Sastra Lisan',
    'Klasifikasi Jenis / Genre',
    'Sub-Jenis Sastra Lisan',
    'Motif Utama (Stith Thompson)',
    'Daftar Kode Motif',
    'Fungsi Sosial Bascom',
    'Nama Narasumber',
    'Komunitas',
    'Usia',
    'Gender',
    'Kategori Narasumber',
    'Pekerjaan',
    'Suku Bangsa',
    'Daerah Asal Narasumber',
    'Bahasa Dikuasai',
    'Desa / Kelurahan',
    'Kecamatan',
    'Kabupaten / Kota',
    'Provinsi',
    'Bentuk Tuturan',
    'Kategori Penutur',
    'Bahasa Digunakan',
    'Iringan Musik',
    'Tempat Pertunjukan',
    'Deskripsi Singkat Isi',
    'Kutipan Tuturan',
    'Tujuan Pertunjukan',
    'Pengambil Data',
    'Bentuk Dokumentasi',
    'Tautan Dokumentasi'
  ];

  const rows = records.map(r => {
    const motifCodes = r.analisisMotif?.daftarMotifThompson?.map(m => m.kodeThompson).join('; ') || '';
    const fungsiSosial = r.analisisMotif?.fungsiSosialBascom?.join('; ') || '';

    return [
      `"${r.id}"`,
      `"${r.namaSastraLisan}"`,
      `"${r.analisisJenis?.jenisUtama || ''}"`,
      `"${r.analisisJenis?.subJenis || ''}"`,
      `"${r.analisisMotif?.motifUtama || ''}"`,
      `"${motifCodes}"`,
      `"${fungsiSosial}"`,
      `"${r.narasumber?.namaLengkap || ''}"`,
      `"${r.narasumber?.komunitas?.status === 'Ada' ? r.narasumber?.komunitas?.namaKomunitas || 'Ada' : 'Tidak ada'}"`,
      r.narasumber?.usia || '',
      `"${r.narasumber?.jenisKelamin || ''}"`,
      `"${r.narasumber?.kategoriNarasumber || ''}"`,
      `"${r.narasumber?.pekerjaan || ''}"`,
      `"${r.narasumber?.sukuBangsa || ''}"`,
      `"${r.narasumber?.daerahAsal || ''}"`,
      `"${r.narasumber?.bahasaDikuasai || ''}"`,
      `"${r.lokasi?.desaKelurahan || ''}"`,
      `"${r.lokasi?.kecamatan || ''}"`,
      `"${r.lokasi?.kabupatenKota || ''}"`,
      `"${r.lokasi?.provinsi || ''}"`,
      `"${r.bentukTuturan || ''}"`,
      `"${r.kategoriPenutur || ''}"`,
      `"${r.bahasaDigunakan || ''}"`,
      `"${r.iringanMusik || ''}"`,
      `"${r.tempatPertunjukan || ''}"`,
      `"${(r.deskripsiSingkat || '').replace(/"/g, '""')}"`,
      `"${(r.kutipanTuturan || '').replace(/"/g, '""')}"`,
      `"${(r.tujuanPertunjukan || '').replace(/"/g, '""')}"`,
      `"${r.pengambilData?.nama || ''}"`,
      `"${r.hasilDokumentasi?.bentukDokumentasi || ''}"`,
      `"${r.hasilDokumentasi?.tautanHasilDokumentasi || ''}"`
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Pemetaan_Sastra_Lisan_dan_Motif_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
