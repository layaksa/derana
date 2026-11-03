import React, { useState, useEffect } from 'react';
import { MapPin, X, UserCheck, Calendar, AlertTriangle, Send, Sparkles, Building2, Globe2 } from 'lucide-react';
import { AppUser } from '../../types/auth';
import { loadAllUsers } from '../../utils/authStorage';
import { createResearchAssignment } from '../../utils/assignmentStorage';

interface AssignResearchRegionModalProps {
  currentUser: AppUser;
  onClose: () => void;
  onAssignmentCreated?: () => void;
}

const REGION_PRESETS = [
  { province: 'Jawa Barat', regency: 'Kabupaten Cianjur', district: 'Kecamatan Cidaun', village: 'Desa Karangwangi', language: 'Bahasa Sunda' },
  { province: 'Jawa Barat', regency: 'Kabupaten Tasikmalaya', district: 'Kecamatan Cipatujah', village: 'Desa Cikadu', language: 'Bahasa Sunda' },
  { province: 'Jawa Barat', regency: 'Kabupaten Cirebon', district: 'Kecamatan Losari', village: 'Desa Kalisari', language: 'Bahasa Cirebon' },
  { province: 'Jawa Tengah', regency: 'Kabupaten Brebes', district: 'Kecamatan Salem', village: 'Desa Bentar (Enklave Sunda)', language: 'Bahasa Sunda Brebes' },
  { province: 'Jawa Tengah', regency: 'Kabupaten Cilacap', district: 'Kecamatan Dayeuhluhur', village: 'Desa Matenggeng', language: 'Bahasa Sunda & Jawa' },
  { province: 'Maluku', regency: 'Kabupaten Maluku Tengah', district: 'Pulau Saparua', village: 'Desa Ihamahu', language: 'Bahasa Saparua' }
];

export const AssignResearchRegionModal: React.FC<AssignResearchRegionModalProps> = ({
  currentUser,
  onClose,
  onAssignmentCreated
}) => {
  const [surveyors, setSurveyors] = useState<AppUser[]>([]);
  const [selectedSurveyorId, setSelectedSurveyorId] = useState('');
  const [targetProvince, setTargetProvince] = useState('Jawa Barat');
  const [targetRegency, setTargetRegency] = useState('');
  const [targetDistrict, setTargetDistrict] = useState('');
  const [targetVillage, setTargetVillage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('Bahasa Sunda');
  const [deadline, setDeadline] = useState(() => {
    // Default 14 days from now
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [priority, setPriority] = useState<'tinggi' | 'sedang' | 'rutin'>('tinggi');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const all = loadAllUsers();
    // Prioritize surveyor role, but allow selecting any user
    const surveyorsList = all.filter(u => u.role === 'surveyor' || u.role === 'user');
    setSurveyors(surveyorsList.length > 0 ? surveyorsList : all);
    if (surveyorsList.length > 0) {
      setSelectedSurveyorId(surveyorsList[0].id);
    }
  }, []);

  const handleApplyPreset = (preset: typeof REGION_PRESETS[0]) => {
    setTargetProvince(preset.province);
    setTargetRegency(preset.regency);
    setTargetDistrict(preset.district);
    setTargetVillage(preset.village);
    setTargetLanguage(preset.language);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSurveyorId) {
      setError('Pilih surveyor yang akan ditugaskan.');
      return;
    }
    if (!targetRegency.trim() || !targetDistrict.trim()) {
      setError('Kabupaten/Kota dan Kecamatan target riset wajib diisi.');
      return;
    }

    const selectedSurveyor = surveyors.find(u => u.id === selectedSurveyorId);
    if (!selectedSurveyor) {
      setError('Data surveyor tidak valid.');
      return;
    }

    setIsSubmitting(true);
    try {
      createResearchAssignment(
        {
          surveyorId: selectedSurveyor.id,
          surveyorName: selectedSurveyor.name,
          surveyorEmail: selectedSurveyor.email,
          targetProvince,
          targetRegency: targetRegency.trim(),
          targetDistrict: targetDistrict.trim(),
          targetVillage: targetVillage.trim(),
          targetLanguage: targetLanguage.trim(),
          deadline,
          priority,
          notes: notes.trim() || undefined
        },
        currentUser
      );

      if (onAssignmentCreated) {
        onAssignmentCreated();
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Gagal menetapkan penugasan wilayah riset.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-5 sm:p-6 space-y-4 my-8 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-2xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Penugasan Wilayah Riset Surveyor
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tetapkan target wilayah pengamatan lapangan dan kirim notifikasi penugasan ke surveyor
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Presets Quick Picker */}
        <div className="p-2.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-purple-900 dark:text-purple-300">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Pilihan Cepat Wilayah Prioritas Riset:</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {REGION_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-[10px] text-slate-700 dark:text-slate-300 hover:bg-purple-100 hover:text-purple-800 cursor-pointer transition-colors"
              >
                {p.village} ({p.regency})
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Surveyor Selector */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Pilih Surveyor Lapangan yang Ditugaskan:
            </label>
            <div className="relative">
              <select
                value={selectedSurveyorId}
                onChange={(e) => setSelectedSurveyorId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500 font-medium"
                required
              >
                {surveyors.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.email}) {s.assignedRegion ? `• Wilayah saat ini: ${s.assignedRegion}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Region Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Provinsi Target:
              </label>
              <input
                type="text"
                value={targetProvince}
                onChange={(e) => setTargetProvince(e.target.value)}
                placeholder="Contoh: Jawa Barat"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kabupaten / Kota Target:
              </label>
              <input
                type="text"
                value={targetRegency}
                onChange={(e) => setTargetRegency(e.target.value)}
                placeholder="Contoh: Kabupaten Cianjur"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kecamatan Target:
              </label>
              <input
                type="text"
                value={targetDistrict}
                onChange={(e) => setTargetDistrict(e.target.value)}
                placeholder="Contoh: Kecamatan Cidaun"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Desa / Titik Pengamatan Sasaran:
              </label>
              <input
                type="text"
                value={targetVillage}
                onChange={(e) => setTargetVillage(e.target.value)}
                placeholder="Contoh: Desa Karangwangi"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Language & Deadline & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bahasa Sasaran:
              </label>
              <input
                type="text"
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                placeholder="Contoh: Bahasa Sunda"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tenggat Waktu:
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tingkat Prioritas:
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500"
              >
                <option value="tinggi">Tinggi (Mendesak)</option>
                <option value="sedang">Sedang (Prioritas Standar)</option>
                <option value="rutin">Rutin (Jadwal Reguler)</option>
              </select>
            </div>
          </div>

          {/* Notes / Special Instructions */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Instruksi Khusus / Catatan Riset Lapangan:
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Wawancara minimal 2 narasumber penutur jati. Prioritaskan rekaman kosakata budaya bidang perikanan darat dan tradisi lisan setempat."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md cursor-pointer transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Menetapkan...' : 'Tetapkan Penugasan & Kirim Notifikasi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
