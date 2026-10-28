import React from 'react';
import { BookOpen } from 'lucide-react';
import { SejarahDesaData } from '../../types/linguistic';

interface Section12Props {
  data: SejarahDesaData;
  onChange: (field: keyof SejarahDesaData, value: string) => void;
}

export const Section12SejarahDesa: React.FC<Section12Props> = ({ data, onChange }) => {
  return (
    <section id="section-12" className="scroll-mt-36 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 md:p-6 transition-all">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">
            12
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Sejarah Desa
            </h2>
            <p className="text-xs text-slate-500">
              Narasi asal-usul pendirian desa, etimologi penamaan, dan tokoh perintis permukiman.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
          <BookOpen className="w-3.5 h-3.5" />
          Historiografi Lisan
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="sejarah-ringkas" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Sejarah Ringkas Terbentuknya Desa
          </label>
          <textarea
            id="sejarah-ringkas"
            rows={4}
            value={data.sejarahSingkat}
            onChange={(e) => onChange('sejarahSingkat', e.target.value)}
            placeholder="Uraikan bagaimana desa pertama kali dibuka, kelompok masyarakat awal yang datang, gelombang migrasi, atau peristiwa bersejarah penting..."
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="sejarah-asal-nama" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Asal-usul Nama Desa (Etimologi / Toponimi)
            </label>
            <textarea
              id="sejarah-asal-nama"
              rows={2}
              value={data.asalUsulNama}
              onChange={(e) => onChange('asalUsulNama', e.target.value)}
              placeholder="Jelaskan arti kata nama desa dan latar belakang penamaannya..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="sejarah-tokoh" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tokoh Pendiri / Tokoh Bersejarah yang Dihormati
            </label>
            <textarea
              id="sejarah-tokoh"
              rows={2}
              value={data.tokohPendiri}
              onChange={(e) => onChange('tokohPendiri', e.target.value)}
              placeholder="Nama tetua cikal bakal / pendiri desa..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
