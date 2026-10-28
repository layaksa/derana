import React from 'react';
import { School } from 'lucide-react';
import { SaranaPendidikanData } from '../../types/linguistic';

interface Section7Props {
  data: SaranaPendidikanData;
  onChange: (field: keyof SaranaPendidikanData, value: string | number) => void;
}

export const Section7SaranaPendidikan: React.FC<Section7Props> = ({ data, onChange }) => {
  const saranaList: { key: keyof SaranaPendidikanData; label: string; placeholder: string }[] = [
    { key: 'sdSederajat', label: 'SD / MI Sederajat (Unit Gedung)', placeholder: 'Jumlah unit sekolah' },
    { key: 'smpSederajat', label: 'SMP / MTs Sederajat (Unit Gedung)', placeholder: 'Jumlah unit sekolah' },
    { key: 'smaSederajat', label: 'SMA / SMK / MA Sederajat (Unit Gedung)', placeholder: 'Jumlah unit sekolah' },
    { key: 'perguruanTinggi', label: 'Perguruan Tinggi / Kampus Cabang (Unit)', placeholder: 'Jumlah unit kampus' },
    { key: 'kursusKursus', label: 'Lembaga Kursus / Pelatihan Keterampilan (Unit)', placeholder: 'Jumlah lembaga kursus' }
  ];

  return (
    <section id="section-7" className="scroll-mt-36 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 md:p-6 transition-all">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">
            7
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Sarana Pendidikan
            </h2>
            <p className="text-xs text-slate-500">
              Ketersediaan fasilitas fisik sekolah dan lembaga pendidikan nonformal di wilayah desa.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
          <School className="w-3.5 h-3.5" />
          Infrastruktur Belajar
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {saranaList.map(({ key, label, placeholder }) => (
          <div key={key} className="p-3 bg-slate-50/50 rounded-lg border border-slate-200">
            <label htmlFor={`sarana-${key}`} className="block text-xs font-semibold text-slate-700 mb-1.5">
              {label}
            </label>
            <input
              id={`sarana-${key}`}
              type="number"
              min="0"
              value={data[key] as any}
              onChange={(e) => onChange(key, e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        ))}
      </div>

      <div>
        <label htmlFor="sarana-keterangan" className="block text-xs font-medium text-slate-600 mb-1">
          Keterangan Tambahan Sarana Pendidikan
        </label>
        <textarea
          id="sarana-keterangan"
          rows={2}
          value={data.keterangan || ''}
          onChange={(e) => onChange('keterangan', e.target.value)}
          placeholder="Misal: Terdapat pondok pesantren tradisional, PAUD/TK di setiap dusun, dan PKBM paket C"
          className="w-full px-3 py-2 text-xs bg-slate-50/30 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
      </div>
    </section>
  );
};
