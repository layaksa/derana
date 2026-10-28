import React from 'react';
import { Compass, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { SituasiKebahasaan, SituasiKebahasaanPerbatasan } from '../../types/linguistic';

interface Section2Props {
  data: SituasiKebahasaan;
  onChangeDirection: (direction: keyof SituasiKebahasaan, field: keyof SituasiKebahasaanPerbatasan, value: string) => void;
}

export const Section2SituasiKebahasaan: React.FC<Section2Props> = ({ data, onChangeDirection }) => {
  const directions: { key: keyof SituasiKebahasaan; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'utara', label: 'Sebelah Utara', icon: <ArrowUp className="w-4 h-4" />, color: 'border-blue-200 bg-blue-50/30' },
    { key: 'timur', label: 'Sebelah Timur', icon: <ArrowRight className="w-4 h-4" />, color: 'border-amber-200 bg-amber-50/30' },
    { key: 'selatan', label: 'Sebelah Selatan', icon: <ArrowDown className="w-4 h-4" />, color: 'border-emerald-200 bg-emerald-50/30' },
    { key: 'barat', label: 'Sebelah Barat', icon: <ArrowLeft className="w-4 h-4" />, color: 'border-purple-200 bg-purple-50/30' }
  ];

  return (
    <section id="section-2" className="scroll-mt-36 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 md:p-6 transition-all">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">
            2
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Situasi Kebahasaan
            </h2>
            <p className="text-xs text-slate-500">
              Batas perbatasan desa serta bahasa yang dituturkan di sebelah timur, barat, utara, dan selatan.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
          <Compass className="w-3.5 h-3.5" />
          4 Arah Batas Bahasa
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {directions.map(({ key, label, icon, color }) => (
          <div key={key} className={`p-4 rounded-xl border ${color} transition-all`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-md bg-white shadow-2xs text-slate-700">
                {icon}
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {label}
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor={`kebahasaan-${key}-desa`} className="block text-xs font-medium text-slate-600 mb-1">
                  Desa / Wilayah Perbatasan
                </label>
                <input
                  id={`kebahasaan-${key}-desa`}
                  type="text"
                  value={data[key].desa}
                  onChange={(e) => onChangeDirection(key, 'desa', e.target.value)}
                  placeholder="Nama desa perbatasan"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor={`kebahasaan-${key}-bahasa`} className="block text-xs font-medium text-slate-600 mb-1">
                  Bahasa yang Digunakan di Sana
                </label>
                <input
                  id={`kebahasaan-${key}-bahasa`}
                  type="text"
                  value={data[key].bahasa}
                  onChange={(e) => onChangeDirection(key, 'bahasa', e.target.value)}
                  placeholder="Contoh: Bahasa Sunda / Jawa / Melayu"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor={`kebahasaan-${key}-kecamatan`} className="block text-xs font-medium text-slate-600 mb-1">
                  Kecamatan (Opsional)
                </label>
                <input
                  id={`kebahasaan-${key}-kecamatan`}
                  type="text"
                  value={data[key].kecamatan || ''}
                  onChange={(e) => onChangeDirection(key, 'kecamatan', e.target.value)}
                  placeholder="Nama kecamatan desa perbatasan"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
