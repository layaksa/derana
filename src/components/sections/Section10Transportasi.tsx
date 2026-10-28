import React from 'react';
import { Car, CheckSquare, Square } from 'lucide-react';
import { AlatTransportasiData } from '../../types/linguistic';

interface Section10Props {
  data: AlatTransportasiData;
  onChange: (field: keyof AlatTransportasiData, value: any) => void;
}

export const Section10Transportasi: React.FC<Section10Props> = ({ data, onChange }) => {
  const options: { key: keyof Omit<AlatTransportasiData, 'keteranganLain'>; label: string; contoh: string }[] = [
    { key: 'bus', label: 'Bus Besar / AKAP', contoh: 'Trayek antar kota / provinsi' },
    { key: 'miniBus', label: 'Mini Bus / Angkutan Desa / Elf', contoh: 'Angkot lokal antar kecamatan' },
    { key: 'sepedaMotor', label: 'Sepeda Motor / Ojek', contoh: 'Kendaraan utama warga' },
    { key: 'kuda', label: 'Kuda / Hewan Tunggangan', contoh: 'Alat angkut barang di perbukitan terjal' },
    { key: 'kapalMotor', label: 'Kapal Motor / Klotok / Jukung', contoh: 'Perahu mesin tempel nelayan & sungai' },
    { key: 'kapalLaut', label: 'Kapal Laut / Feri Ro-Ro', contoh: 'Penyeberangan pelabuhan pulau' },
    { key: 'pesawatUdara', label: 'Pesawat Udara / Perintis', contoh: 'Lapangan terbang perintis terdekat' },
    { key: 'lainLain', label: 'Lain-lain', contoh: 'Gerobak sapi, mobil pick-up, sepeda ontel' }
  ];

  return (
    <section id="section-10" className="scroll-mt-36 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 md:p-6 transition-all">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">
            10
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Alat Transportasi yang Digunakan
            </h2>
            <p className="text-xs text-slate-500">
              Pilihan moda transportasi yang lazim dipakai warga untuk mobilitas lokal maupun ke luar desa.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
          <Car className="w-3.5 h-3.5" />
          Moda Perjalanan
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {options.map(({ key, label, contoh }) => {
          const isChecked = !!data[key];
          return (
            <button
              key={key}
              type="button"
              id={`transport-${key}`}
              onClick={() => onChange(key, !isChecked)}
              className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                isChecked
                  ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950 font-medium ring-1 ring-indigo-400'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="mt-0.5">
                {isChecked ? (
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div>
                <div className="text-xs font-semibold">{label}</div>
                <div className="text-[11px] text-slate-500">{contoh}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div>
        <label htmlFor="transport-keterangan" className="block text-xs font-medium text-slate-600 mb-1">
          Keterangan Moda Transportasi Lainnya
        </label>
        <input
          id="transport-keterangan"
          type="text"
          value={data.keteranganLain}
          onChange={(e) => onChange('keteranganLain', e.target.value)}
          placeholder="Contoh: Rakit bambu penyeberangan sungai dan mobil pick-up sayur"
          className="w-full px-3 py-2 text-xs bg-slate-50/30 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
      </div>
    </section>
  );
};
