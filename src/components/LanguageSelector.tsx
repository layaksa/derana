import React from 'react';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { Check, Globe, Sparkles } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'segmented' | 'cards' | 'pill';
  className?: string;
  onLanguageChanged?: (lang: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'segmented',
  className = '',
  onLanguageChanged
}) => {
  const { language, setLanguage, t } = useLanguage();

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    if (onLanguageChanged) {
      onLanguageChanged(lang);
    }
  };

  // SEGMENTED PILL VARIANT (Compact for Navbars, Dropdowns & Footers)
  if (variant === 'segmented') {
    return (
      <div 
        className={`inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ${className}`}
        role="group"
        aria-label="Pilihan Bahasa Antarmuka"
      >
        <button
          type="button"
          onClick={() => handleSelect('id')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            language === 'id'
              ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-sky-400 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title="Ubah ke Bahasa Indonesia"
        >
          <span className="text-xs">🇮🇩</span>
          <span>ID</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelect('en')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            language === 'en'
              ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-sky-400 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title="Switch to English"
        >
          <span className="text-xs">🇬🇧</span>
          <span>EN</span>
        </button>
      </div>
    );
  }

  // MINIMAL PILL VARIANT
  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={() => handleSelect(language === 'id' ? 'en' : 'id')}
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer ${className}`}
        title={language === 'id' ? 'Beralih ke Bahasa Inggris' : 'Switch to Indonesian'}
      >
        <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
        <span className="font-bold">{language.toUpperCase()}</span>
      </button>
    );
  }

  // RICH CARDS VARIANT (For ProfileModal "Pilihan Bahasa" Tab)
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Indonesian Card */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleSelect('id')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelect('id'); }}
          className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer text-left flex flex-col justify-between ${
            language === 'id'
              ? 'border-blue-600 dark:border-sky-500 bg-blue-50/40 dark:bg-sky-950/30 shadow-xs'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl" role="img" aria-label="Bendera Indonesia">🇮🇩</span>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  {t('profile.language.id.title', 'Bahasa Indonesia')}
                  {language === 'id' && (
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-blue-600 text-white">
                      Aktif
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('profile.language.id.subtitle', 'Bahasa resmi Republik Indonesia')}
                </p>
              </div>
            </div>

            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
              language === 'id'
                ? 'bg-blue-600 text-white'
                : 'border border-slate-300 dark:border-slate-700 text-transparent'
            }`}>
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
            {t('profile.language.id.desc', 'Terminologi linguistik baku, dialektometri Guiter, kosakata Swadesh, dan klasifikasi standar Badan Bahasa / BRIN.')}
          </p>

          <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Kode Bahasa: <strong>id-ID</strong></span>
            <span className="font-semibold text-blue-700 dark:text-sky-300">Nusantara Standard</span>
          </div>
        </div>

        {/* English Card */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleSelect('en')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelect('en'); }}
          className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer text-left flex flex-col justify-between ${
            language === 'en'
              ? 'border-blue-600 dark:border-sky-500 bg-blue-50/40 dark:bg-sky-950/30 shadow-xs'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl" role="img" aria-label="United Kingdom Flag">🇬🇧</span>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  {t('profile.language.en.title', 'English (Inggris)')}
                  {language === 'en' && (
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-blue-600 text-white">
                      Active
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('profile.language.en.subtitle', 'International Standard English')}
                </p>
              </div>
            </div>

            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
              language === 'en'
                ? 'bg-blue-600 text-white'
                : 'border border-slate-300 dark:border-slate-700 text-transparent'
            }`}>
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
            {t('profile.language.en.desc', 'Standard dialectological terms, Guiter dialectometry metrics, Swadesh 200-word list, and international phonetic notation.')}
          </p>

          <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Language Code: <strong>en-US / en-GB</strong></span>
            <span className="font-semibold text-blue-700 dark:text-sky-300">International Standard</span>
          </div>
        </div>
      </div>

      {/* Dynamic preview banner */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
        <Sparkles className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
        <div className="flex-1">
          <span>{t('profile.language.selected', 'Bahasa terpilih:')} </span>
          <strong className="text-slate-900 dark:text-white">
            {language === 'id' ? 'Bahasa Indonesia (ID)' : 'English (EN)'}
          </strong>
          <span className="text-slate-400 block text-[11px] mt-0.5">
            {t('profile.language.instantNotice', 'Perubahan bahasa disimpan otomatis di profil lokal Anda.')}
          </span>
        </div>
      </div>
    </div>
  );
};
