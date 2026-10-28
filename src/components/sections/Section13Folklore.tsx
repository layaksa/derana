import React from 'react';
import { Scroll } from 'lucide-react';
import { FolkloreData } from '../../types/linguistic';

interface Section13Props {
  data: FolkloreData;
  onChange: (field: keyof FolkloreData, value: string) => void;
}

export const Section13Folklore: React.FC<Section13Props> = ({ data, onChange }) => {
  return (
    <section id="section-13" className="scroll-mt-36 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 md:p-6 transition-all">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">
            13
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Folklore & Sastra Lisan Lokal
            </h2>
            <p className="text-xs text-slate-500">
              Cerita rakyat, mitos, legenda toponimi, dongeng, dan tradisi lisan yang hidup di tengah masyarakat.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
          <Scroll className="w-3.5 h-3.5" />
          Tradisi Lisan
        </span>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="folklore-judul" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Judul Cerita Rakyat / Mitos Lokal
            </label>
            <input
              id="folklore-judul"
              type="text"
              value={data.judulFolklore}
              onChange={(e) => onChange('judulFolklore', e.target.value)}
              placeholder="Contoh: Sasakala Batu Karang Meja jeung Putri Candra Wulan"
              className="w-full px-3.5 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="folklore-kategori" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kategori Folklore
            </label>
            <input
              id="folklore-kategori"
              type="text"
              value={data.kategori}
              onChange={(e) => onChange('kategori', e.target.value)}
              placeholder="Contoh: Legenda Tempat / Mitos Pantangan / Fabel"
              className="w-full px-3.5 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="folklore-ringkasan" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Ringkasan Isi Cerita / Narasi Folklore
          </label>
          <textarea
            id="folklore-ringkasan"
            rows={4}
            value={data.ringkasanCerita}
            onChange={(e) => onChange('ringkasanCerita', e.target.value)}
            placeholder="Tuliskan alur cerita lisan, peristiwa gaib/ajaib, atau pesan turun-temurun yang dipercaya warga..."
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="folklore-tokoh" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tokoh-tokoh Utama dalam Folklore
            </label>
            <input
              id="folklore-tokoh"
              type="text"
              value={data.tokohUtama}
              onChange={(e) => onChange('tokohUtama', e.target.value)}
              placeholder="Nama karakter atau makhluk dalam cerita"
              className="w-full px-3.5 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="folklore-makna" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Makna Nilai Budaya / Pantangan Tradisi
            </label>
            <input
              id="folklore-makna"
              type="text"
              value={data.maknaTradisi}
              onChange={(e) => onChange('maknaTradisi', e.target.value)}
              placeholder="Contoh: Pantangan melaut pada malam Selasa Kliwon / Nilai konservasi karang laut"
              className="w-full px-3.5 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
