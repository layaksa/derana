import React, { useState } from 'react';
import { 
  Download, 
  Share2, 
  PlusSquare, 
  X, 
  Monitor, 
  Smartphone, 
  Apple, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles,
  WifiOff
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'button' | 'compact' | 'icon' | 'sidebar';
  className?: string;
  showTextOnMobile?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'button',
  className = '',
  showTextOnMobile = true
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeDeviceTab, setActiveDeviceTab] = useState<'desktop' | 'android' | 'ios'>(() => {
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) return 'ios';
      if (/android/.test(ua)) return 'android';
    }
    return 'desktop';
  });

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  const handleClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        // If dismissed or didn't trigger, show the guide
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  // If already running in standalone PWA window, we can show a small "Aplikasi Terpasang" status or return null
  if (isInstalled) {
    if (variant === 'sidebar') {
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div className="leading-tight">
            <div>Mode PWA Aktif</div>
            <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-normal">Aplikasi Terpasang (Offline)</div>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <>
      {/* Icon Variant */}
      {variant === 'icon' && (
        <button
          type="button"
          onClick={handleClick}
          title="Pasang Aplikasi ke Perangkat (Akses Offline)"
          className={`p-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 border border-blue-500 shadow-2xs transition-colors cursor-pointer flex items-center justify-center ${className}`}
        >
          <Download className="w-4 h-4" />
        </button>
      )}

      {/* Compact Variant (For Navbars & Toolbars) */}
      {variant === 'compact' && (
        <button
          type="button"
          onClick={handleClick}
          title="Pasang aplikasi di desktop/ponsel agar bisa diakses tanpa internet"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-2xs transition-all cursor-pointer ring-1 ring-blue-500/50 hover:shadow-md ${className}`}
        >
          <Download className="w-3.5 h-3.5 shrink-0 animate-bounce" />
          <span className={showTextOnMobile ? 'inline' : 'hidden sm:inline'}>
            Install App
          </span>
        </button>
      )}

      {/* Button Variant */}
      {variant === 'button' && (
        <button
          type="button"
          onClick={handleClick}
          title="Pasang aplikasi agar dapat diakses kapan saja tanpa koneksi internet (PWA)"
          className={`inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-bold shadow-2xs transition-all cursor-pointer ring-1 ring-blue-500/50 hover:shadow-md ${className}`}
        >
          <Download className="w-4 h-4 shrink-0" />
          <span>Pasang Aplikasi (Offline)</span>
        </button>
      )}

      {/* Sidebar Feature Card Variant */}
      {variant === 'sidebar' && (
        <div className="p-3 rounded-xl bg-linear-to-br from-blue-500/10 via-indigo-500/10 to-blue-600/5 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-900/60 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-blue-700 dark:text-sky-300">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold leading-tight">Install Aplikasi</div>
              <div className="text-[10px] text-blue-600/80 dark:text-sky-400/80">Siap Akses Tanpa Sinyal</div>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
            Pasang langsung di layar perangkat untuk survei lapangan tanpa internet.
          </p>
          <button
            type="button"
            onClick={handleClick}
            className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Pasang Sekarang</span>
          </button>
        </div>
      )}

      {/* Universal PWA Installation Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 bg-blue-50/60 dark:bg-blue-950/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span>Pasang Aplikasi ke Perangkat</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold">PWA</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Akses cepat langsung dari layar utama tanpa membuka browser & hemat kuota.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Offline Capability Highlight */}
            <div className="px-4 py-2.5 bg-emerald-50/60 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
              <WifiOff className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>Dukungan Offline Penuh:</strong> Data survei, kosakata, & kuesioner tetap berfungsi saat tidak ada sinyal.
              </span>
            </div>

            {/* Device Switcher Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 px-4 pt-3 gap-2">
              <button
                type="button"
                onClick={() => setActiveDeviceTab('desktop')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  activeDeviceTab === 'desktop'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Laptop / PC</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveDeviceTab('android')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  activeDeviceTab === 'android'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveDeviceTab('ios')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  activeDeviceTab === 'ios'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Apple className="w-3.5 h-3.5" />
                <span>iPhone / iPad</span>
              </button>
            </div>

            {/* Tab Instructions Content */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              {activeDeviceTab === 'desktop' && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0">1</span>
                    <div>
                      <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">Ikon Install di Address Bar</strong>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                        Perhatikan bilah alamat (URL) peramban Chrome/Edge di kanan atas. Klik ikon komputer/panah ke bawah <strong>"Install Sistem Pemetaan Bahasa"</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0">2</span>
                    <div>
                      <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">Atau Lewat Menu Browser (Titik Tiga)</strong>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                        Klik tombol menu <strong>⋮</strong> (kanan atas) &gt; pilih <strong>"Simpan dan Bagikan"</strong> / <strong>"Cast, save, and share"</strong> &gt; klik <strong>"Pasang aplikasi"</strong>.
                      </p>
                    </div>
                  </div>

                  {isInIframe && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-[11px] text-amber-800 dark:text-amber-300 space-y-2">
                      <p>
                        💡 <strong>Catatan:</strong> Saat dibuka di dalam frame pratinjau AI Studio, peramban membatasi pop-up instalasi langsung. Buka di tab baru untuk memicu prompt instalasi instan:
                      </p>
                      <button
                        type="button"
                        onClick={() => window.open(window.location.href, '_blank')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Buka di Tab Baru untuk Install</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeDeviceTab === 'android' && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0">1</span>
                    <div>
                      <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">Buka di Google Chrome</strong>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                        Akses tautan aplikasi menggunakan peramban Google Chrome di ponsel Android Anda.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0">2</span>
                    <div>
                      <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">Ketuk Menu Titik Tiga (⋮)</strong>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                        Ketuk tombol titik tiga di pojok kanan atas peramban.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0">3</span>
                    <div>
                      <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">Pilih "Install Aplikasi" / "Tambahkan ke Layar Utama"</strong>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                        Ikon aplikasi resmi akan langsung ditambahkan ke layar depan ponsel Anda seperti aplikasi Play Store.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeDeviceTab === 'ios' && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0">1</span>
                    <div>
                      <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">Gunakan Safari iOS</strong>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                        Buka tautan ini di peramban bawaan Apple Safari pada iPhone atau iPad Anda.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
                    <div className="p-1 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 shrink-0">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">2. Ketuk Tombol Share (Bagikan)</strong>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                        Ketuk ikon kotak dengan panah ke atas (Share) di bilah navigasi bawah Safari.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
                    <div className="p-1 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 shrink-0">
                      <PlusSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">3. Pilih "Add to Home Screen"</strong>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                        Gulir menu ke bawah lalu pilih opsi <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                PWA v1.0 • Akses offline didukung
              </span>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Mengerti & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
