import { RevitalisasiMonevRecord, RevitalisasiRAPRecord } from '../types/revitalisasi';
import { INITIAL_MONEV_RECORDS, INITIAL_RAP_RECORDS } from '../data/revitalisasiData';
import { 
  saveRevitalisasiMonevToFirestore, 
  deleteRevitalisasiMonevFromFirestore,
  saveRevitalisasiRAPToFirestore,
  deleteRevitalisasiRAPFromFirestore
} from '../lib/firebase';
import { offlineSyncManager } from './offlineSyncManager';

export const STORAGE_KEY_REVITALISASI_MONEV = 'linguistic_revitalisasi_monev_v1';
export const STORAGE_KEY_REVITALISASI_RAP = 'linguistic_revitalisasi_rap_v1';

// MONEV STORAGE
export function loadMonevRecords(): RevitalisasiMonevRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REVITALISASI_MONEV);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    localStorage.setItem(STORAGE_KEY_REVITALISASI_MONEV, JSON.stringify(INITIAL_MONEV_RECORDS));
    return INITIAL_MONEV_RECORDS;
  } catch (err) {
    console.error('Error loading Monev records from storage:', err);
    return INITIAL_MONEV_RECORDS;
  }
}

export function persistMonevRecords(records: RevitalisasiMonevRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_REVITALISASI_MONEV, JSON.stringify(records));
  } catch (err) {
    console.error('Error persisting Monev records:', err);
  }
}

export function saveMonevRecord(record: RevitalisasiMonevRecord): RevitalisasiMonevRecord[] {
  const currentList = loadMonevRecords();
  const existingIdx = currentList.findIndex(item => item.id === record.id);
  let updatedList: RevitalisasiMonevRecord[];

  const updatedRecord = {
    ...record,
    updatedAt: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    updatedList = [...currentList];
    updatedList[existingIdx] = updatedRecord;
  } else {
    updatedList = [updatedRecord, ...currentList];
  }

  // 1. Simpan lokal
  persistMonevRecords(updatedList);

  // 2. Sinkronkan ke Firestore
  if (offlineSyncManager.isOnline()) {
    saveRevitalisasiMonevToFirestore(updatedRecord)
      .then(() => offlineSyncManager.dequeue(updatedRecord.id))
      .catch((err) => {
        console.warn('Gagal simpan Monev ke Firestore, masuk antrean:', err);
        offlineSyncManager.enqueue(updatedRecord.id, 'revitalisasi_monev');
      });
  } else {
    offlineSyncManager.enqueue(updatedRecord.id, 'revitalisasi_monev');
  }

  return updatedList;
}

export function deleteMonevRecord(id: string): RevitalisasiMonevRecord[] {
  offlineSyncManager.dequeue(id);
  const currentList = loadMonevRecords();
  const updatedList = currentList.filter(item => item.id !== id);
  persistMonevRecords(updatedList);

  deleteRevitalisasiMonevFromFirestore(id).catch(err => {
    console.debug('Firestore delete Monev skipped:', err);
  });

  return updatedList;
}

// RAP STORAGE
export function loadRAPRecords(): RevitalisasiRAPRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REVITALISASI_RAP);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    localStorage.setItem(STORAGE_KEY_REVITALISASI_RAP, JSON.stringify(INITIAL_RAP_RECORDS));
    return INITIAL_RAP_RECORDS;
  } catch (err) {
    console.error('Error loading RAP records from storage:', err);
    return INITIAL_RAP_RECORDS;
  }
}

export function persistRAPRecords(records: RevitalisasiRAPRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_REVITALISASI_RAP, JSON.stringify(records));
  } catch (err) {
    console.error('Error persisting RAP records:', err);
  }
}

export function saveRAPRecord(record: RevitalisasiRAPRecord): RevitalisasiRAPRecord[] {
  const currentList = loadRAPRecords();
  const existingIdx = currentList.findIndex(item => item.id === record.id);
  let updatedList: RevitalisasiRAPRecord[];

  const updatedRecord = {
    ...record,
    updatedAt: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    updatedList = [...currentList];
    updatedList[existingIdx] = updatedRecord;
  } else {
    updatedList = [updatedRecord, ...currentList];
  }

  // 1. Simpan lokal
  persistRAPRecords(updatedList);

  // 2. Sinkronkan ke Firestore
  if (offlineSyncManager.isOnline()) {
    saveRevitalisasiRAPToFirestore(updatedRecord)
      .then(() => offlineSyncManager.dequeue(updatedRecord.id))
      .catch((err) => {
        console.warn('Gagal simpan RAP ke Firestore, masuk antrean:', err);
        offlineSyncManager.enqueue(updatedRecord.id, 'revitalisasi_rap');
      });
  } else {
    offlineSyncManager.enqueue(updatedRecord.id, 'revitalisasi_rap');
  }

  return updatedList;
}

export function deleteRAPRecord(id: string): RevitalisasiRAPRecord[] {
  offlineSyncManager.dequeue(id);
  const currentList = loadRAPRecords();
  const updatedList = currentList.filter(item => item.id !== id);
  persistRAPRecords(updatedList);

  deleteRevitalisasiRAPFromFirestore(id).catch(err => {
    console.debug('Firestore delete RAP skipped:', err);
  });

  return updatedList;
}

// EXPORT TO CSV
export function exportMonevToCSV(records: RevitalisasiMonevRecord[]): void {
  if (!records.length) return;

  const headers = [
    'ID',
    'Bahasa Daerah',
    'Negeri / Desa',
    'Kecamatan',
    'Kabupaten / Kota',
    'Tanggal Evaluasi',
    'Petugas Monev',
    'Skor IKRBD (0-100)',
    'Kategori Keberhasilan',
    'Status Pelaksanaan',
    'Rekomendasi Kebijakan'
  ];

  const rows = records.map(r => [
    `"${r.id}"`,
    `"${(r.bahasaDaerah || '').replace(/"/g, '""')}"`,
    `"${(r.desa || '').replace(/"/g, '""')}"`,
    `"${(r.kecamatan || '').replace(/"/g, '""')}"`,
    `"${(r.kabupatenKota || '').replace(/"/g, '""')}"`,
    `"${(r.tanggalEvaluasi || '').replace(/"/g, '""')}"`,
    `"${(r.petugasMonev || '').replace(/"/g, '""')}"`,
    r.ikrbdScore || 0,
    `"${(r.kategori || '').replace(/"/g, '""')}"`,
    `"${(r.statusPelaksanaan || '').replace(/"/g, '""')}"`,
    `"${(r.catatanRekomendasi || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Instrumen_Monev_IKRBD_Maluku_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportRAPToCSV(records: RevitalisasiRAPRecord[]): void {
  if (!records.length) return;

  const headers = [
    'ID',
    'Bahasa Daerah',
    'Pengajar Utama',
    'NIP/NIK',
    'Instansi / Unit Kerja',
    'Wilayah Target',
    'Target Guru Terimbas',
    'Target Siswa Terimbas',
    'Target Lembaga',
    'Target Karya',
    'Kompetisi / Festival Target'
  ];

  const rows = records.map(r => [
    `"${r.id}"`,
    `"${(r.bahasaDaerah || '').replace(/"/g, '""')}"`,
    `"${(r.profilPengajar.namaLengkap || '').replace(/"/g, '""')}"`,
    `"${(r.profilPengajar.nipNik || '').replace(/"/g, '""')}"`,
    `"${(r.profilPengajar.instansiUnitKerja || '').replace(/"/g, '""')}"`,
    `"${(r.profilPengajar.wilayahTarget || '').replace(/"/g, '""')}"`,
    r.sasaran.targetJumlahPengajarSejawat || 0,
    r.sasaran.targetJumlahPenuturMuda || 0,
    r.indikator.jumlahLembagaAktif || 0,
    r.indikator.targetJumlahKarya || 0,
    `"${(r.indikator.keikutsertaanKompetisi || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Rencana_Aksi_Pengimbasan_RAP_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
