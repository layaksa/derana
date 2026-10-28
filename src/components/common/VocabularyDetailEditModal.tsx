import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Eye, 
  Edit3, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  BookOpen, 
  Tag, 
  Info, 
  Sparkles, 
  CheckCircle2, 
  CircleDashed,
  RotateCcw,
  Save,
  Keyboard,
  Mic,
  FileText
} from 'lucide-react';
import { KosakataItem } from '../../types/linguistic';
import { VocabularyAudioUploader } from './VocabularyAudioUploader';
import { IPA_SYMBOLS } from '../../data/swadeshList';

export interface VocabularyDetailEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: KosakataItem | null;
  categoryName?: string;
  itemIndex?: number;
  totalItems?: number;
  onSave: (updatedItem: KosakataItem) => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  onAudioChange?: (url?: string, fileName?: string, duration?: string) => void;
  initialMode?: 'detail' | 'edit';
  readOnly?: boolean;
}

export const VocabularyDetailEditModal: React.FC<VocabularyDetailEditModalProps> = ({
  isOpen,
  onClose,
  item,
  categoryName = 'Kosakata',
  itemIndex,
  totalItems,
  onSave,
  onNavigatePrev,
  onNavigateNext,
  onAudioChange,
  initialMode = 'detail',
  readOnly = false
}) => {
  const [activeTab, setActiveTab] = useState<'detail' | 'edit'>(initialMode);
  
  // Edit form state
  const [glosIndonesia, setGlosIndonesia] = useState('');
  const [bentukLokal, setBentukLokal] = useState('');
  const [transkripsiIPA, setTranskripsiIPA] = useState('');
  const [catatan, setCatatan] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
  const [audioFileName, setAudioFileName] = useState<string | undefined>(undefined);
  const [audioDuration, setAudioDuration] = useState<string | undefined>(undefined);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showIpaKeyboard, setShowIpaKeyboard] = useState(true);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false);

  const ipaInputRef = useRef<HTMLInputElement>(null);

  // Sync form state whenever item changes
  useEffect(() => {
    if (item) {
      setGlosIndonesia(item.glosIndonesia || '');
      setBentukLokal(item.bentukLokal || '');
      setTranskripsiIPA(item.transkripsiIPA || '');
      setCatatan(item.catatan || '');
      setAudioUrl(item.audioUrl);
      setAudioFileName(item.audioFileName);
      setAudioDuration(item.audioDuration);
      setHasUnsavedChanges(false);
      setSaveSuccessMessage(false);
    }
  }, [item]);

  // Handle keyboard shortcuts (ArrowLeft / ArrowRight / Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is actively typing in an input/textarea, do not intercept arrow keys
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (!isInput) {
        if (e.key === 'ArrowLeft' && onNavigatePrev) {
          e.preventDefault();
          onNavigatePrev();
        } else if (e.key === 'ArrowRight' && onNavigateNext) {
          e.preventDefault();
          onNavigateNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNavigatePrev, onNavigateNext]);

  if (!isOpen || !item) return null;

  // Insert symbol into IPA input at cursor position
  const handleInsertIpa = (sym: string) => {
    const input = ipaInputRef.current;
    if (!input) {
      setTranskripsiIPA(prev => prev + sym);
      setHasUnsavedChanges(true);
      return;
    }

    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const current = input.value;
    const updated = current.substring(0, start) + sym + current.substring(end);

    setTranskripsiIPA(updated);
    setHasUnsavedChanges(true);

    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + sym.length, start + sym.length);
    }, 10);
  };

  const handleSave = () => {
    const updated: KosakataItem = {
      ...item,
      glosIndonesia: glosIndonesia.trim(),
      bentukLokal: bentukLokal.trim(),
      transkripsiIPA: transkripsiIPA.trim(),
      catatan: catatan.trim(),
      audioUrl,
      audioFileName,
      audioDuration
    };

    onSave(updated);
    if (onAudioChange) {
      onAudioChange(audioUrl, audioFileName, audioDuration);
    }

    setHasUnsavedChanges(false);
    setSaveSuccessMessage(true);
    setTimeout(() => {
      setSaveSuccessMessage(false);
      setActiveTab('detail');
    }, 700);
  };

  const isFilled = Boolean(item.bentukLokal && item.bentukLokal.trim() !== '');
  const hasIpa = Boolean(item.transkripsiIPA && item.transkripsiIPA.trim() !== '');
  const hasAudio = Boolean(item.audioUrl);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-850/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-mono font-bold text-xs">
              #{item.id}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {categoryName}
                </span>
                {itemIndex !== undefined && totalItems !== undefined && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    ({itemIndex + 1} dari {totalItems})
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                {item.glosIndonesia || 'Kosakata'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* View / Edit Mode Switcher */}
            <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-full text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('detail')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all cursor-pointer ${
                  activeTab === 'detail'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="Tampilkan Detail Kosakata"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Detail</span>
              </button>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activeTab === 'edit'
                      ? 'bg-blue-600 text-white shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                  title="Edit Kosakata Ini"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              )}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tutup (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {saveSuccessMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-semibold">Perubahan data kosakata berhasil disimpan!</span>
            </div>
          )}

          {/* TAB 1: TAMPILAN DETAIL */}
          {activeTab === 'detail' && (
            <div className="space-y-5">
              {/* Primary Glos & Local Form Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-slate-50 dark:from-slate-850 dark:via-slate-850 dark:to-slate-900 border border-blue-100 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Glos Bahasa Indonesia
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isFilled ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        Terisi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                        <CircleDashed className="w-3 h-3 text-amber-600" />
                        Belum Terisi
                      </span>
                    )}

                    {hasAudio ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                        <Volume2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        Ada Audio
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        Tanpa Audio
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {item.glosIndonesia}
                  </h2>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    Bentuk Lokal / Dialek Tutur
                  </span>
                  <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800">
                    <p className={`text-lg sm:text-xl font-bold ${
                      item.bentukLokal ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 italic text-base'
                    }`}>
                      {item.bentukLokal || '— (Belum diisi oleh surveyor)'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Phonetic & Audio Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Transkripsi Fonetik IPA */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      Transkripsi Fonetik [IPA]
                    </span>
                    <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-200/50">
                      International Phonetic Alphabet
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 min-h-[48px] flex items-center">
                    <span className={`font-mono text-base font-semibold ${
                      item.transkripsiIPA ? 'text-indigo-950 dark:text-indigo-200' : 'text-slate-400 italic text-xs'
                    }`}>
                      {item.transkripsiIPA ? `[ ${item.transkripsiIPA} ]` : 'Belum ada transkripsi fonetis'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Mencerminkan realisasi bunyi vokal, konsonan glotal/nasal, dan suprasegmental tutur narasumber.
                  </p>
                </div>

                {/* Rekaman Audio Penutur */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Rekaman Suara Penutur Asli
                    </span>
                  </div>

                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800">
                    <VocabularyAudioUploader
                      audioUrl={item.audioUrl}
                      audioFileName={item.audioFileName}
                      audioDuration={item.audioDuration}
                      compact={false}
                      onAudioChange={(url, fileName, duration) => {
                        if (onAudioChange) {
                          onAudioChange(url, fileName, duration);
                        } else {
                          onSave({
                            ...item,
                            audioUrl: url,
                            audioFileName: fileName,
                            audioDuration: duration
                          });
                        }
                      }}
                      itemName={`${item.id}_${item.glosIndonesia}`}
                    />
                  </div>
                </div>
              </div>

              {/* Catatan Morfologis & Variasi Dialektal */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Catatan Leksikal / Variasi Alomorf / Konteks Sosial
                </span>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 min-h-[60px]">
                  <p className={`text-xs leading-relaxed ${
                    item.catatan ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500 italic'
                  }`}>
                    {item.catatan || 'Tidak ada catatan variasi atau penjelasan tambahan untuk kosakata ini.'}
                  </p>
                </div>
              </div>

              {/* Quick Jump to Edit Button */}
              {!readOnly && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('edit')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Ubah / Edit Kosakata Ini</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MODE EDIT INTERAKTIF */}
          {activeTab === 'edit' && (
            <div className="space-y-4">
              {/* Glos Indonesia */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Glos Bahasa Indonesia
                </label>
                <input
                  type="text"
                  value={glosIndonesia}
                  onChange={e => {
                    setGlosIndonesia(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Contoh: api, air, matahari, makan..."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 focus:outline-hidden transition-colors"
                />
              </div>

              {/* Bentuk Lokal */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bentuk Lokal / Dialek Ortografi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={bentukLokal}
                  onChange={e => {
                    setBentukLokal(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Masukkan kata dialek tuturan setempat..."
                  className="w-full px-3.5 py-2.5 text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 focus:outline-hidden text-blue-600 dark:text-blue-400 transition-colors"
                />
              </div>

              {/* Transkripsi Fonetik IPA with Virtual Palette */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Transkripsi Fonetik IPA
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowIpaKeyboard(prev => !prev)}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Keyboard className="w-3.5 h-3.5" />
                    <span>{showIpaKeyboard ? 'Sembunyikan Papan Simbol' : 'Tampilkan Papan Simbol IPA'}</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    ref={ipaInputRef}
                    type="text"
                    value={transkripsiIPA}
                    onChange={e => {
                      setTranskripsiIPA(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="[ masukkan notasi IPA, misal: aˈpi, waɪ, maʔan ]"
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 focus:outline-hidden text-indigo-900 dark:text-indigo-200 transition-colors"
                  />
                  {transkripsiIPA && (
                    <button
                      type="button"
                      onClick={() => {
                        setTranskripsiIPA('');
                        setHasUnsavedChanges(true);
                        ipaInputRef.current?.focus();
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title="Hapus IPA"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Virtual IPA Keyboard */}
                {showIpaKeyboard && (
                  <div className="p-3 bg-slate-100 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <span>Klik simbol untuk menyisipkan ke posisi kursor:</span>
                      <span className="font-mono text-blue-600">Simbol IPA Standar</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {IPA_SYMBOLS.map((sym) => (
                        <button
                          key={sym.symbol}
                          type="button"
                          onClick={() => handleInsertIpa(sym.symbol)}
                          className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-800 dark:text-slate-100 font-mono font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors flex items-center justify-center cursor-pointer select-none"
                          title={`Sisipkan simbol ${sym.symbol} (${sym.label})`}
                        >
                          {sym.symbol}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Rekaman Audio Input Section */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Rekaman Audio Suara Penutur Asli
                </label>
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800">
                  <VocabularyAudioUploader
                    audioUrl={audioUrl}
                    audioFileName={audioFileName}
                    audioDuration={audioDuration}
                    compact={false}
                    onAudioChange={(url, fileName, duration) => {
                      setAudioUrl(url);
                      setAudioFileName(fileName);
                      setAudioDuration(duration);
                      setHasUnsavedChanges(true);
                    }}
                    itemName={`${item.id}_${item.glosIndonesia}`}
                  />
                </div>
              </div>

              {/* Catatan Morfologis & Variasi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Morfologis / Variasi Makna / Konteks Sosial
                </label>
                <textarea
                  rows={2}
                  value={catatan}
                  onChange={e => {
                    setCatatan(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Catatan afiksasi, etimologi, alomorf, konteks upacara/adat, atau padanan di desa tetangga..."
                  className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 focus:outline-hidden transition-colors"
                />
              </div>

              {/* Edit Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    // Reset to original
                    if (item) {
                      setGlosIndonesia(item.glosIndonesia || '');
                      setBentukLokal(item.bentukLokal || '');
                      setTranskripsiIPA(item.transkripsiIPA || '');
                      setCatatan(item.catatan || '');
                      setAudioUrl(item.audioUrl);
                      setAudioFileName(item.audioFileName);
                      setAudioDuration(item.audioDuration);
                      setHasUnsavedChanges(false);
                    }
                    setActiveTab('detail');
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar: Previous / Next item controls */}
        <div className="px-5 py-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80 flex items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={onNavigatePrev}
            disabled={!onNavigatePrev}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 font-semibold transition-colors cursor-pointer"
            title="Kosakata Sebelumnya (Shortcut: ◀)"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Sebelumnya</span>
          </button>

          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
            Gunakan tombol panah ◀ / ▶ pada keyboard untuk navigasi
          </span>

          <button
            type="button"
            onClick={onNavigateNext}
            disabled={!onNavigateNext}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 font-semibold transition-colors cursor-pointer"
            title="Kosakata Selanjutnya (Shortcut: ▶)"
          >
            <span>Selanjutnya</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
