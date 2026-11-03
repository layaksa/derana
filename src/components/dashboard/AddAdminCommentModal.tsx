import React, { useState } from 'react';
import { MessageSquare, X, Send, ShieldCheck, User, BookOpen, AlertCircle } from 'lucide-react';
import { SurveyRecord } from '../../types/linguistic';
import { AppUser } from '../../types/auth';
import { addSurveyComment } from '../../utils/surveyCommentStorage';

interface AddAdminCommentModalProps {
  survey: SurveyRecord;
  currentUser: AppUser;
  onClose: () => void;
  onCommentAdded?: () => void;
}

const SECTION_OPTIONS = [
  { id: 'general', title: 'Catatan Umum / Seluruh Berkas' },
  { id: 'section-1', title: 'Seksi 1 - Titik Pengamatan Geografis' },
  { id: 'section-2', title: 'Seksi 2 - Situasi Kebahasaan & Kontak Bahasa' },
  { id: 'section-3', title: 'Seksi 3 - Morfologi & Situasi Geografis' },
  { id: 'section-4', title: 'Seksi 4 - Demografi & Jumlah Penduduk' },
  { id: 'section-14', title: 'Seksi 14 - Profil & Kriteria Narasumber' },
  { id: 'section-15', title: 'Seksi 15 - Swadesh & Kosakata Budaya' },
  { id: 'section-16', title: 'Seksi 16 - Dialektometri & Peta Isoglos' }
];

export const AddAdminCommentModal: React.FC<AddAdminCommentModalProps> = ({
  survey,
  currentUser,
  onClose,
  onCommentAdded
}) => {
  const [commentText, setCommentText] = useState('');
  const [selectedSection, setSelectedSection] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) {
      setError('Komentar atau catatan evaluasi tidak boleh kosong.');
      return;
    }

    setIsSubmitting(true);
    try {
      const sectionObj = SECTION_OPTIONS.find(s => s.id === selectedSection);
      addSurveyComment(
        {
          surveyId: survey.id,
          surveyTitle: survey.title,
          comment: commentText.trim(),
          sectionId: selectedSection !== 'general' ? selectedSection : undefined,
          sectionName: sectionObj?.title
        },
        currentUser,
        survey
      );

      if (onCommentAdded) {
        onCommentAdded();
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan komentar evaluasi.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-2xs">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Beri Catatan / Komentar Evaluasi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Catatan ini akan langsung terkirim sebagai notifikasi in-app ke surveyor
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

        {/* Target Survey Context Info */}
        <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-blue-900 dark:text-blue-300">
              {survey.desa} ({survey.bahasa})
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Kelengkapan: {survey.progress}%
            </span>
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-400">
            Kec. {survey.kecamatan}, {survey.kabupatenKota} • Surveyor: {survey.createdByName || 'Surveyor Lapangan'}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Fokus Bagian / Seksi Survei:
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
            >
              {SECTION_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {opt.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Pesan Catatan Review / Bimbingan Lapangan:
            </label>
            <textarea
              rows={4}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Contoh: Harap verifikasi ulang transkripsi fonetis kata nomor #23-30 dan pastikan rekaman audio narasumber bebas dari kebisingan latar."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !commentText.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md disabled:opacity-50 cursor-pointer transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Mengirim...' : 'Kirim Catatan & Beri Notifikasi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
