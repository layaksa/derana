import React from 'react';
import { 
  X, 
  GitCompare, 
  Compass, 
  MapPin, 
  Sparkles, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  TableProperties, 
  Volume2, 
  BookOpen,
  Split,
  Layers,
  ChevronRight,
  TrendingUp,
  Info
} from 'lucide-react';
import { KecamatanComparisonPair } from '../../utils/kecamatanDialectComparison';

interface KecamatanTransitionDrawerProps {
  pair: KecamatanComparisonPair | null;
  onClose: () => void;
  onSelectSurvey?: (surveyId: string) => void;
  onFocusCorridor?: (pair: KecamatanComparisonPair) => void;
}

export const KecamatanTransitionDrawer: React.FC<KecamatanTransitionDrawerProps> = ({
  pair,
  onClose,
  onSelectSurvey,
  onFocusCorridor
}) => {
  if (!pair) return null;

  const { kecamatanA, kecamatanB } = pair;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md md:max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* DRAWER HEADER */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-2xs shrink-0"
            style={{ backgroundColor: pair.color }}
          >
            <Split className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Inspektur Zona Transisi Bahasa
              </span>
              <span 
                className="text-[9px] font-bold px-1.5 py-0.2 rounded-full text-white"
                style={{ backgroundColor: pair.color }}
              >
                {pair.classification}
              </span>
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
              Kec. {kecamatanA.namaKecamatan} ↔ Kec. {kecamatanB.namaKecamatan}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Tutup panel inspeksi"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* DRAWER BODY (SCROLLABLE) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* 1. METER DIALEKTOMETRI GUITER */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Koefisien Beda Leksikal (Guiter)</span>
            </span>
            <span className="font-mono font-black text-base" style={{ color: pair.color }}>
              {pair.differencePercentage}%
            </span>
          </div>

          {/* Progress gauge bar */}
          <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5 relative">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, pair.differencePercentage))}%`, backgroundColor: pair.color }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            <span>≤20% (Tidak Berbeda)</span>
            <span>21-30% (Wicara)</span>
            <span>31-50% (Subdialek)</span>
            <span>51-80% (Dialek)</span>
            <span>81-100% (Bahasa)</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-center text-[11px]">
            <div className="bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block">Jarak Spasial</span>
              <strong className="text-slate-800 dark:text-slate-100 font-mono">{pair.distanceKm} km</strong>
            </div>
            <div className="bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block">Glos Beda (s)</span>
              <strong className="text-rose-600 dark:text-rose-400 font-mono">{pair.differingGlossesCount} kata</strong>
            </div>
            <div className="bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block">Total Uji (n)</span>
              <strong className="text-blue-600 dark:text-blue-400 font-mono">{pair.totalGlossesCompared} glos</strong>
            </div>
          </div>
        </div>

        {/* 2. DUA KECAMATAN HEAD-TO-HEAD COMPARISON */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* KECAMATAN A */}
          <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: kecamatanA.colorTheme.hex }} />
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                Kec. {kecamatanA.namaKecamatan}
              </h4>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
              <div><b>Wilayah:</b> {kecamatanA.kabupaten}</div>
              <div><b>Bahasa:</b> <span className="font-semibold text-blue-600 dark:text-blue-400">{kecamatanA.dominantBahasa}</span></div>
              <div><b>Titik Desa:</b> {kecamatanA.totalSurveys} desa</div>
              <div><b>Usia Rata-rata:</b> {kecamatanA.avgInformantAge ? `${kecamatanA.avgInformantAge} thn` : 'Belum terdata'}</div>
            </div>
            <div className="pt-1 border-t border-slate-100 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block mb-1">Daftar Titik Desa:</span>
              <div className="flex flex-wrap gap-1">
                {kecamatanA.points.map(pt => (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => onSelectSurvey && onSelectSurvey(pt.surveyId)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                    title={`Pilih survei Desa ${pt.desa}`}
                  >
                    Desa {pt.desa}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* KECAMATAN B */}
          <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: kecamatanB.colorTheme.hex }} />
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                Kec. {kecamatanB.namaKecamatan}
              </h4>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
              <div><b>Wilayah:</b> {kecamatanB.kabupaten}</div>
              <div><b>Bahasa:</b> <span className="font-semibold text-blue-600 dark:text-blue-400">{kecamatanB.dominantBahasa}</span></div>
              <div><b>Titik Desa:</b> {kecamatanB.totalSurveys} desa</div>
              <div><b>Usia Rata-rata:</b> {kecamatanB.avgInformantAge ? `${kecamatanB.avgInformantAge} thn` : 'Belum terdata'}</div>
            </div>
            <div className="pt-1 border-t border-slate-100 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block mb-1">Daftar Titik Desa:</span>
              <div className="flex flex-wrap gap-1">
                {kecamatanB.points.map(pt => (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => onSelectSurvey && onSelectSurvey(pt.surveyId)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                    title={`Pilih survei Desa ${pt.desa}`}
                  >
                    Desa {pt.desa}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. CONTOH KOSAKATA DIAGNOSTIK PEMBEDA */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <TableProperties className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Leksikon Diagnostik Pembeda (Isoglos)</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              {pair.differingWordsSample.length} Glos Sampel
            </span>
          </div>

          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2 px-2.5">Glos Indonesia</th>
                  <th className="py-2 px-2.5">Kec. {kecamatanA.namaKecamatan}</th>
                  <th className="py-2 px-2.5">Kec. {kecamatanB.namaKecamatan}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {pair.differingWordsSample.map((word, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-1.5 px-2.5 font-semibold text-slate-800 dark:text-slate-200 capitalize">
                      {word.glosIndonesia}
                      <span className="text-[9px] text-slate-400 block font-normal">{word.kategori}</span>
                    </td>
                    <td className="py-1.5 px-2.5 font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                      {word.kataA}
                    </td>
                    <td className="py-1.5 px-2.5 font-mono text-indigo-700 dark:text-indigo-400 font-bold">
                      {word.kataB}
                    </td>
                  </tr>
                ))}
                {pair.differingWordsSample.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-slate-400 italic">
                      Tidak ditemukan perbedaan leksikal diagnostik (Tuturan Homogen).
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. ANALISIS GEOLINGUISTIK & KONTAK BAHASA */}
        <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Karakteristik Zona Transisi Geolinguistik</span>
          </div>
          <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
            {pair.sociolinguisticNote}
          </p>
        </div>

        {/* 5. REKOMENDASI TINDAKAN SURVEYOR LAPANGAN */}
        <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 rounded-xl p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-indigo-800 dark:text-indigo-300 font-bold">
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span>Rekomendasi Pemetaan Lapangan:</span>
          </div>
          <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
            {pair.recommendedFieldActions}
          </p>
        </div>
      </div>

      {/* DRAWER FOOTER: ACTION BUTTONS */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-2">
        {onFocusCorridor && (
          <button
            type="button"
            onClick={() => onFocusCorridor(pair)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-colors cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Pusatkan Kamera ke Zona Ini</span>
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          className="py-2 px-3 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
