import React from 'react';
import { Building2 } from 'lucide-react';
import { AgamaData } from '../../types/linguistic';
import { calculatePercentage, parseNum } from '../../utils/calculations';

interface Section8Props {
  data: AgamaData;
  onChange: (field: keyof AgamaData, value: string | number) => void;
}

export const Section8Agama: React.FC<Section8Props> = ({ data, onChange }) => {
  const islam = parseNum(data.islam);
  const protestan = parseNum(data.protestan);
  const kristen = parseNum(data.kristen);
  const katolik = parseNum(data.katolik);
  const hindu = parseNum(data.hindu);
  const buddha = parseNum(data.buddha);
  const konghucu = parseNum(data.konghucu);
  const lainLain = parseNum(data.lainLain);

  const totalAgama = islam + protestan + kristen + katolik + hindu + buddha + konghucu + lainLain;

  const agamaList: { key: keyof AgamaData; label: string; count: number }[] = [
    { key: 'islam', label: 'Islam', count: islam },
    { key: 'protestan', label: 'Kristen Protestan', count: protestan },
    { key: 'katolik', label: 'Kristen Katolik', count: katolik },
    { key: 'kristen', label: 'Kristen (Kategori Terpisah/Umum)', count: kristen },
    { key: 'hindu', label: 'Hindu', count: hindu },
    { key: 'buddha', label: 'Buddha', count: buddha },
    { key: 'konghucu', label: 'Konghucu', count: konghucu },
    { key: 'lainLain', label: 'Aliran Kepercayaan / Lain-lain', count: lainLain }
  ];

  return (
    <section id="section-8" className="scroll-mt-36 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 md:p-6 transition-all">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">
            8
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Agama Penduduk
            </h2>
            <p className="text-xs text-slate-500">
              Jumlah pemeluk agama dan kepercayaan di desa beserta persentase terhadap total penduduk beragama.
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500">Total Terdata:</span>
          <div className="text-sm font-bold text-slate-800">{totalAgama.toLocaleString()} Orang</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {agamaList.map(({ key, label, count }) => (
          <div key={key} className="p-3 bg-slate-50/50 rounded-lg border border-slate-200">
            <label htmlFor={`agama-${key}`} className="block text-xs font-semibold text-slate-700 mb-1">
              {label}
            </label>
            <div className="flex items-center gap-2">
              <input
                id={`agama-${key}`}
                type="number"
                min="0"
                value={data[key]}
                onChange={(e) => onChange(key, e.target.value)}
                placeholder="0"
                className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <span className="px-2 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-md min-w-[50px] text-center">
                {calculatePercentage(count, totalAgama)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
