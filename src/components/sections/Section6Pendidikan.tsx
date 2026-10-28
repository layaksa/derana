import React from 'react';
import { GraduationCap } from 'lucide-react';
import { PendidikanData } from '../../types/linguistic';
import { calculatePercentage, parseNum } from '../../utils/calculations';

interface Section6Props {
  data: PendidikanData;
  onChange: (field: keyof PendidikanData, value: string | number) => void;
}

export const Section6Pendidikan: React.FC<Section6Props> = ({ data, onChange }) => {
  const tidakSekolah = parseNum(data.tidakSekolah);
  const sd = parseNum(data.sdSederajat);
  const smp = parseNum(data.smpSederajat);
  const sma = parseNum(data.smaSederajat);
  const pt = parseNum(data.perguruanTinggi);
  const total = tidakSekolah + sd + smp + sma + pt;

  const fields: { key: keyof PendidikanData; label: string; count: number; note?: string }[] = [
    { key: 'tidakSekolah', label: 'Tidak Bersekolah / Buta Aksara', count: tidakSekolah },
    { key: 'sdSederajat', label: 'SD / Sederajat', count: sd },
    { key: 'smpSederajat', label: 'SMP / Sederajat', count: smp },
    { key: 'smaSederajat', label: 'SMA / SMK / Sederajat', count: sma },
    { key: 'perguruanTinggi', label: 'Perguruan Tinggi (Diploma/S1/S2)', count: pt },
    { key: 'sarjanaAsalDesa', label: 'Sarana/Sarjana Asal Desa', count: parseNum(data.sarjanaAsalDesa), note: 'Warga asli desa bergelar sarjana' }
  ];

  return (
    <section id="section-6" className="scroll-mt-36 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 md:p-6 transition-all">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">
            6
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Tingkat Pendidikan Penduduk
            </h2>
            <p className="text-xs text-slate-500">
              Jumlah penduduk menurut jenjang pendidikan formal yang ditamatkan beserta persentasenya.
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500">Total Terdata:</span>
          <div className="text-sm font-bold text-slate-800">{total.toLocaleString()} Orang</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields.map(({ key, label, count, note }) => (
          <div key={key} className="p-3 bg-slate-50/50 rounded-lg border border-slate-200">
            <label htmlFor={`pendidikan-${key}`} className="block text-xs font-semibold text-slate-700 mb-1">
              {label}
            </label>
            {note && <p className="text-[10px] text-slate-400 mb-1">{note}</p>}
            <div className="flex items-center gap-2">
              <input
                id={`pendidikan-${key}`}
                type="number"
                min="0"
                value={data[key]}
                onChange={(e) => onChange(key, e.target.value)}
                placeholder="0"
                className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <span className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-md min-w-[55px] text-center">
                {calculatePercentage(count, total)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
