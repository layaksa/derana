import { 
  KuesionerVitalitasResponse, 
  SAMPLE_VITALITAS_RESPONSES, 
  calculateVitalitySummary 
} from '../data/kuesionerVitalitasData';
import { saveVitalitasToFirestore, deleteVitalitasFromFirestore } from '../lib/firebase';
import { offlineSyncManager } from './offlineSyncManager';

export const STORAGE_KEY_VITALITAS = 'linguistic_vitalitas_responses_v1';

export function loadVitalitasResponses(): KuesionerVitalitasResponse[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VITALITAS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    // Fallback to sample data
    localStorage.setItem(STORAGE_KEY_VITALITAS, JSON.stringify(SAMPLE_VITALITAS_RESPONSES));
    return SAMPLE_VITALITAS_RESPONSES;
  } catch (err) {
    console.error('Error loading vitalitas responses:', err);
    return SAMPLE_VITALITAS_RESPONSES;
  }
}

export function persistVitalitasResponses(list: KuesionerVitalitasResponse[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_VITALITAS, JSON.stringify(list));
  } catch (err) {
    console.error('Error persisting vitalitas responses:', err);
  }
}

export function saveVitalitasResponse(response: KuesionerVitalitasResponse): KuesionerVitalitasResponse[] {
  const currentList = loadVitalitasResponses();
  const summary = calculateVitalitySummary(response.answers);
  const isOnline = offlineSyncManager.isOnline();
  
  const updatedResponse: KuesionerVitalitasResponse = {
    ...response,
    totalAnswered: summary.totalAnswered,
    scoreAvg: summary.scoreAvg,
    vitalitasStatus: summary.vitalitasStatus,
    statusColor: summary.statusColor,
    updatedAt: new Date().toISOString()
  };

  const existingIndex = currentList.findIndex(item => item.id === response.id);
  let updatedList: KuesionerVitalitasResponse[];

  if (existingIndex >= 0) {
    updatedList = [...currentList];
    updatedList[existingIndex] = updatedResponse;
  } else {
    updatedList = [updatedResponse, ...currentList];
  }

  // 1. Simpan secara lokal segera agar data aman tanpa koneksi internet
  persistVitalitasResponses(updatedList);

  // 2. Unggah ke Firebase jika online, atau masukkan ke antrian sinkronisasi jika offline
  if (isOnline) {
    saveVitalitasToFirestore(updatedResponse)
      .then(() => {
        offlineSyncManager.dequeue(updatedResponse.id);
      })
      .catch((err) => {
        console.warn('[OfflineSync] Gagal unggah langsung vitalitas, masuk antrian:', err);
        offlineSyncManager.enqueue(updatedResponse.id, 'vitalitas');
      });
  } else {
    offlineSyncManager.enqueue(updatedResponse.id, 'vitalitas');
  }

  return updatedList;
}

export function deleteVitalitasResponse(id: string): KuesionerVitalitasResponse[] {
  offlineSyncManager.dequeue(id);
  const currentList = loadVitalitasResponses();
  const updatedList = currentList.filter(item => item.id !== id);
  persistVitalitasResponses(updatedList);
  deleteVitalitasFromFirestore(id).catch(err => {
    console.debug('Firestore delete vitalitas skipped/failed:', err);
  });
  return updatedList;
}

export function exportVitalitasToCSV(responses: KuesionerVitalitasResponse[]): void {
  if (!responses.length) return;

  const headers = [
    'ID Responden',
    'Nama Responden',
    'Usia',
    'Gender',
    'Pekerjaan',
    'Bahasa Daerah',
    'Desa',
    'Kecamatan',
    'Kabupaten / Kota',
    'Total Terjawab (dr 95)',
    'Rata-rata Skor Vitalitas',
    'Status Daya Hidup Bahasa',
    'Tanggal Pengisian',
    ...Array.from({ length: 95 }, (_, i) => `Q${i + 1}`)
  ];

  const rows = responses.map(r => {
    return [
      `"${r.id}"`,
      `"${r.respondenNama || ''}"`,
      r.respondenUsia || '',
      r.respondenGender || '',
      `"${r.respondenPekerjaan || ''}"`,
      `"${r.bahasaDaerah || ''}"`,
      `"${r.desa || ''}"`,
      `"${r.kecamatan || ''}"`,
      `"${r.kabupatenKota || ''}"`,
      r.totalAnswered,
      r.scoreAvg,
      `"${r.vitalitasStatus}"`,
      `"${r.createdAt}"`,
      ...Array.from({ length: 95 }, (_, i) => r.answers[i + 1] ?? '')
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Kuesioner_Vitalitas_Bahasa_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
