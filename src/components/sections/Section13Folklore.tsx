import React, { useMemo } from 'react';
import { Scroll, Sparkles, Check, BookOpen, Tag } from 'lucide-react';
import { FolkloreData } from '../../types/linguistic';
import { analyzeMotifDanJenis } from '../../utils/sastraLisanAnalysis';

interface Section13Props {
  data: FolkloreData;
  onChange: (field: keyof FolkloreData, value: string) => void;
}

export const Section13Folklore: React.FC<Section13Props> = ({ data, onChange }) => {
  const analysis = useMemo(() => {
    return analyzeMotifDanJenis({
      namaSastra: data.judulFolklore || '',
      deskripsi: data.ringkasanCerita || '',
      syarat: data.maknaTradisi || '',
      tujuan: data.maknaTradisi || '',
      kutipan: data.tokohUtama || ''
    });
  }, [data.judulFolklore, data.ringkasanCerita, data.maknaTradisi, data.tokohUtama]);

  const handleApplyCategory = () => {
    const suggestedCategory = `${analysis.analisisJenis.jenisUtama} (${analysis.analisisJenis.subJenis})`;
    onChange('kategori', suggestedCategory);
  };
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

        {/* HASIL ANALISIS OTOMATIS MOTIF & JENIS FOLKLOR */}
        <div className="mt-4 p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-indigo-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-950 uppercase tracking-wide">
                Hasil Analisis Otomatis Motif & Jenis Folklor
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-200 text-indigo-900">
                Akurasi {analysis.analisisJenis.confidenceScore}%
              </span>
              <button
                type="button"
                onClick={handleApplyCategory}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                title="Terapkan hasil klasifikasi otomatis ini ke kolom Kategori"
              >
                <Check className="w-3 h-3" />
                <span>Terapkan Kategori</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium block text-[11px]">Klasifikasi Genre:</span>
              <span className="font-bold text-indigo-950">
                {analysis.analisisJenis.jenisUtama} — {analysis.analisisJenis.subJenis}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block text-[11px]">Motif Dominan (Stith Thompson):</span>
              <span className="font-bold text-purple-950 font-mono">
                {analysis.analisisMotif.motifUtama}
              </span>
            </div>
          </div>

          {analysis.analisisJenis.ciriKhas.length > 0 && (
            <p className="text-[11px] text-slate-600 italic">
              Karakteristik: {analysis.analisisJenis.ciriKhas.join('; ')}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
