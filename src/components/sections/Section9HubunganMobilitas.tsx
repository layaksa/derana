import React from 'react';
import { Route, CheckCircle2 } from 'lucide-react';
import { HubunganMobilitasData, StatusMobilitas } from '../../types/linguistic';

interface Section9Props {
  data: HubunganMobilitasData;
  onChange: (field: keyof HubunganMobilitasData, value: string) => void;
}

export const Section9HubunganMobilitas: React.FC<Section9Props> = ({ data, onChange }) => {
  const options: { value: StatusMobilitas; label: string; desc: string; color: string }[] = [
    { value: 'sangat_lancar', label: 'Sangat Lancar', desc: 'Jalan mulus, kendaraan umum setiap jam, akses cepat ke pusat kota', color: 'border-emerald-300 bg-emerald-50/50 text-emerald-900' },
    { value: 'lancar', label: 'Lancar', desc: 'Jalan beraspal baik, transportasi reguler tersedia setiap hari', color: 'border-blue-300 bg-blue-50/50 text-blue-900' },
    { value: 'sedang', label: 'Sedang', desc: 'Jalan berbatu/sebagian rusak, transportasi terbatas jam tertentu', color: 'border-amber-300 bg-amber-50/50 text-amber-900' },
    { value: 'kurang_lancar', label: 'Kurang Lancar', desc: 'Akses sulit saat musim hujan, jalan tanah terjal/bergelombang', color: 'border-orange-300 bg-orange-50/50 text-orange-900' },
    { value: 'tidak_lancar', label: 'Tidak Lancar', desc: 'Terisolasi geografis, hanya jalan setapak atau mengandalkan perahu musiman', color: 'border-rose-300 bg-rose-50/50 text-rose-900' }
  ];

  return (
    <section id="section-9" className="scroll-mt-36 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 md:p-6 transition-all">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">
            9
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Hubungan ke Luar (Mobilitas Warga)
            </h2>
            <p className="text-xs text-slate-500">
              Tingkat kelancaran hubungan interaksi sosial dan mobilitas dengan desa tetangga atau pusat kecamatan.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
          <Route className="w-3.5 h-3.5" />
          Aksesibilitas
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        {options.map(({ value, label, desc, color }) => {
          const isSelected = data.status === value;
          return (
            <button
              key={value}
              type="button"
              id={`mobilitas-${value}`}
              onClick={() => onChange('status', value)}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                isSelected
                  ? `${color} ring-2 ring-indigo-500/30 shadow-xs font-semibold`
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">{label}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">{desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div>
        <label htmlFor="mobilitas-catatan" className="block text-xs font-medium text-slate-600 mb-1">
          Catatan Tambahan Mengenai Mobilitas dan Akses Desa
        </label>
        <textarea
          id="mobilitas-catatan"
          rows={2}
          value={data.catatan}
          onChange={(e) => onChange('catatan', e.target.value)}
          placeholder="Contoh: Jalur lintas provinsi sudah diaspal mulus, namun dusun pedalaman di seberang sungai masih membutuhkan jembatan gantung."
          className="w-full px-3 py-2 text-xs bg-slate-50/30 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
      </div>
    </section>
  );
};
