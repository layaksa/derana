import React from 'react';
import { Clock } from 'lucide-react';
import { UsiaDesaData, KategoriUsiaDesa } from '../../types/linguistic';

interface Section11Props {
  data: UsiaDesaData;
  onChange: (field: keyof UsiaDesaData, value: string) => void;
}

export const Section11UsiaDesa: React.FC<Section11Props> = ({ data, onChange }) => {
  const options: { value: KategoriUsiaDesa; label: string; desc: string }[] = [
    { value: 'di_atas_500', label: 'Di atas 500 tahun lalu', desc: 'Pemukiman kuno era kerajaan pra-kolonial atau tradisi megalitik' },
    { value: '200_500', label: 'Antara 200 - 500 tahun lalu', desc: 'Desa terbentuk pada era kesultanan/kolonial VOC awal' },
    { value: '50_100', label: '50 - 100 tahun lalu', desc: 'Pembentukan desa era kolonial akhir atau awal kemerdekaan RI' },
    { value: 'di_bawah_50', label: 'Di bawah 50 tahun lalu', desc: 'Desa pemekaran baru, transmigrasi, atau pemukiman modern' }
  ];

  return (
    <section id="section-11" className="scroll-mt-36 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 md:p-6 transition-all">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">
            11
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Usia Desa
            </h2>
            <p className="text-xs text-slate-500">
              Perkiraan kronologis masa berdirinya desa berdasarkan tutur lisan atau naskah babad setempat.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
          <Clock className="w-3.5 h-3.5" />
          Kronologi
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {options.map(({ value, label, desc }) => {
          const isSelected = data.kategori === value;
          return (
            <button
              key={value}
              type="button"
              id={`usia-desa-${value}`}
              onClick={() => onChange('kategori', value)}
              className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                isSelected
                  ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950 ring-2 ring-indigo-500/20 font-semibold'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div>
                <div className="text-xs font-bold mb-1">{label}</div>
                <p className="text-[11px] text-slate-500 leading-snug">{desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="usia-desa-tahun" className="block text-xs font-semibold text-slate-700 mb-1">
            Estimasi Angka Tahun Berdiri (Jika Diketahui)
          </label>
          <input
            id="usia-desa-tahun"
            type="text"
            value={data.estimasiTahun}
            onChange={(e) => onChange('estimasiTahun', e.target.value)}
            placeholder="Contoh: Tahun 1785 Masehi / Sekitar abad ke-18"
            className="w-full px-3 py-1.5 text-xs bg-slate-50/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="usia-desa-sumber" className="block text-xs font-semibold text-slate-700 mb-1">
            Sumber Informasi / Rujukan Sejarah
          </label>
          <input
            id="usia-desa-sumber"
            type="text"
            value={data.catatanSumber}
            onChange={(e) => onChange('catatanSumber', e.target.value)}
            placeholder="Contoh: Tutur lisan sesepuh adat, batu nisan tertua, dokumen prasasti/arsip desa"
            className="w-full px-3 py-1.5 text-xs bg-slate-50/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>
    </section>
  );
};
