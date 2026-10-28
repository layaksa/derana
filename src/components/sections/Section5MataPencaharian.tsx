import React from 'react';
import { Briefcase } from 'lucide-react';
import { MataPencaharianData } from '../../types/linguistic';
import { calculatePercentage, parseNum } from '../../utils/calculations';

interface Section5Props {
  data: MataPencaharianData;
  onChange: (field: keyof MataPencaharianData, value: string | number) => void;
}

export const Section5MataPencaharian: React.FC<Section5Props> = ({ data, onChange }) => {
  const bertani = parseNum(data.bertani);
  const nelayan = parseNum(data.nelayan);
  const berdagang = parseNum(data.berdagang);
  const buruh = parseNum(data.buruh);
  const pegawai = parseNum(data.pegawai);
  const lainLain = parseNum(data.lainLain);

  const totalPekerja = bertani + nelayan + berdagang + buruh + pegawai + lainLain;

  const categories: { key: keyof MataPencaharianData; label: string; count: number }[] = [
    { key: 'bertani', label: 'Bertani / Berkebun', count: bertani },
    { key: 'nelayan', label: 'Nelayan / Perikanan', count: nelayan },
    { key: 'berdagang', label: 'Berdagang / Wiraswasta', count: berdagang },
    { key: 'buruh', label: 'Buruh Harian / Pekerja Kasar', count: buruh },
    { key: 'pegawai', label: 'Pegawai Negeri / Swasta / Guru', count: pegawai },
    { key: 'lainLain', label: 'Lain-lain', count: lainLain }
  ];

  return (
    <section id="section-5" className="scroll-mt-36 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 md:p-6 transition-all">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">
            5
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Mata Pencaharian Penduduk
            </h2>
            <p className="text-xs text-slate-500">
              Jumlah warga dalam mata pencaharian pokok dan persentasenya terhadap populasi usia kerja.
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500">Total Tenaga Kerja:</span>
          <div className="text-sm font-bold text-slate-800">{totalPekerja.toLocaleString()} Orang</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {categories.map(({ key, label, count }) => (
          <div key={key} className="p-3 bg-slate-50/50 rounded-lg border border-slate-200">
            <label htmlFor={`pekerjaan-${key}`} className="block text-xs font-semibold text-slate-700 mb-1.5">
              {label}
            </label>
            <div className="flex items-center gap-2">
              <input
                id={`pekerjaan-${key}`}
                type="number"
                min="0"
                value={data[key] as any}
                onChange={(e) => onChange(key, e.target.value)}
                placeholder="0"
                className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <span className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-md min-w-[55px] text-center">
                {calculatePercentage(count, totalPekerja)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div>
        <label htmlFor="pekerjaan-keterangan" className="block text-xs font-medium text-slate-600 mb-1">
          Keterangan Pekerjaan Lain-lain (Opsional)
        </label>
        <input
          id="pekerjaan-keterangan"
          type="text"
          value={data.keteranganLain || ''}
          onChange={(e) => onChange('keteranganLain', e.target.value)}
          placeholder="Misal: Pengrajin anyaman bambu, buruh petik teh, penyadap karet"
          className="w-full px-3 py-1.5 text-xs bg-slate-50/30 border border-slate-200 rounded-lg"
        />
      </div>
    </section>
  );
};
