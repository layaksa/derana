import React from 'react';
import { Users, UserCheck } from 'lucide-react';
import { PendudukData } from '../../types/linguistic';
import { calculatePercentage, parseNum } from '../../utils/calculations';
import { ValidatedInput } from '../common/ValidatedInput';
import { FormValidationStatus } from '../common/FormValidationStatus';
import { validateSection4 } from '../../utils/formValidation';

interface Section4Props {
  data: PendudukData;
  onChange: (field: keyof PendudukData, value: string | number) => void;
}

export const Section4Penduduk: React.FC<Section4Props> = ({ data, onChange }) => {
  // Hitung total penduduk & persentase
  const pria = parseNum(data.jumlahPria);
  const wanita = parseNum(data.jumlahWanita);
  const totalPenduduk = pria + wanita;

  const persenPria = calculatePercentage(pria, totalPenduduk);
  const persenWanita = calculatePercentage(wanita, totalPenduduk);

  const uBawah20 = parseNum(data.umurBawah20);
  const u20sd40 = parseNum(data.umur20sd40);
  const uDiatas40 = parseNum(data.umurDiatas40);
  const totalUmur = uBawah20 + u20sd40 + uDiatas40;

  // Hitung penutur bahasa
  const penuturP = parseNum(data.penuturPria);
  const penuturW = parseNum(data.penuturWanita);
  const totalPenutur = penuturP + penuturW;

  const persenPenuturPria = calculatePercentage(penuturP, totalPenutur);
  const persenPenuturWanita = calculatePercentage(penuturW, totalPenutur);

  const puBawah20 = parseNum(data.penuturUmurBawah20);
  const pu20sd40 = parseNum(data.penuturUmur20sd40);
  const puDiatas40 = parseNum(data.penuturUmurDiatas40);
  const totalUmurPenutur = puBawah20 + pu20sd40 + puDiatas40;

  const errors = validateSection4(data);

  return (
    <section id="section-4" className="scroll-mt-36 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs p-5 md:p-6 transition-all">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-100 dark:border-indigo-900/50">
            4
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Penduduk & Penutur Bahasa
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Demografi total penduduk dan penutur aktif bahasa berdasarkan gender, rentang usia, serta komposisi etnik.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
          <Users className="w-3.5 h-3.5" />
          Kalkulasi Otomatis (%)
        </span>
      </div>

      {/* Section Validation Status */}
      <FormValidationStatus 
        errors={errors} 
        sectionTitle="Penduduk & Penutur" 
        className="mb-5" 
      />

      <div className="space-y-6">
        {/* SUB-BAGIAN 1: TOTAL PENDUDUK */}
        <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              A. Jumlah Penduduk Desa
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Total Terhitung: <strong className="text-slate-900 dark:text-slate-100 font-semibold">{totalPenduduk.toLocaleString()} Jiwa</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <ValidatedInput
                id="penduduk-pria"
                label="Jumlah Penduduk Pria"
                type="number"
                min={0}
                integerOnly
                value={data.jumlahPria}
                onChange={(val) => onChange('jumlahPria', val)}
                placeholder="0"
                addonRight={
                  <span className="px-2.5 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold min-w-[65px] text-center border border-indigo-100 dark:border-indigo-800">
                    {persenPria}
                  </span>
                }
              />
            </div>

            <div>
              <ValidatedInput
                id="penduduk-wanita"
                label="Jumlah Penduduk Wanita"
                type="number"
                min={0}
                integerOnly
                value={data.jumlahWanita}
                onChange={(val) => onChange('jumlahWanita', val)}
                placeholder="0"
                addonRight={
                  <span className="px-2.5 py-2 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-bold min-w-[65px] text-center border border-rose-100 dark:border-rose-800">
                    {persenWanita}
                  </span>
                }
              />
            </div>
          </div>

          {/* Umur Penduduk */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-2">
              Distribusi Kelompok Usia Penduduk:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <ValidatedInput
                  id="penduduk-u20"
                  label="Umur di Bawah 20 Tahun"
                  type="number"
                  min={0}
                  integerOnly
                  value={data.umurBawah20}
                  onChange={(val) => onChange('umurBawah20', val)}
                  placeholder="0"
                  addonRight={
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 min-w-[50px]">
                      {calculatePercentage(uBawah20, totalUmur || totalPenduduk)}
                    </span>
                  }
                />
              </div>

              <div>
                <ValidatedInput
                  id="penduduk-u20sd40"
                  label="Umur Antara 20 - 40 Tahun"
                  type="number"
                  min={0}
                  integerOnly
                  value={data.umur20sd40}
                  onChange={(val) => onChange('umur20sd40', val)}
                  placeholder="0"
                  addonRight={
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 min-w-[50px]">
                      {calculatePercentage(u20sd40, totalUmur || totalPenduduk)}
                    </span>
                  }
                />
              </div>

              <div>
                <ValidatedInput
                  id="penduduk-u40"
                  label="Umur di Atas 40 Tahun"
                  type="number"
                  min={0}
                  integerOnly
                  value={data.umurDiatas40}
                  onChange={(val) => onChange('umurDiatas40', val)}
                  placeholder="0"
                  addonRight={
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 min-w-[50px]">
                      {calculatePercentage(uDiatas40, totalUmur || totalPenduduk)}
                    </span>
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* SUB-BAGIAN 2: JUMLAH PENUTUR BAHASA */}
        <div className="bg-indigo-50/30 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              B. Jumlah Penutur Bahasa yang Diteliti
            </h3>
            <span className="text-xs text-indigo-700 dark:text-indigo-300">
              Total Penutur: <strong className="font-semibold">{totalPenutur.toLocaleString()} Orang</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <ValidatedInput
                id="penutur-pria"
                label="Jumlah Penutur Pria"
                type="number"
                min={0}
                integerOnly
                value={data.penuturPria}
                onChange={(val) => onChange('penuturPria', val)}
                placeholder="0"
                addonRight={
                  <span className="px-2.5 py-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 rounded-lg text-xs font-bold min-w-[65px] text-center border border-indigo-200 dark:border-indigo-800">
                    {persenPenuturPria}
                  </span>
                }
              />
            </div>

            <div>
              <ValidatedInput
                id="penutur-wanita"
                label="Jumlah Penutur Wanita"
                type="number"
                min={0}
                integerOnly
                value={data.penuturWanita}
                onChange={(val) => onChange('penuturWanita', val)}
                placeholder="0"
                addonRight={
                  <span className="px-2.5 py-2 bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 rounded-lg text-xs font-bold min-w-[65px] text-center border border-rose-200 dark:border-rose-800">
                    {persenPenuturWanita}
                  </span>
                }
              />
            </div>
          </div>

          {/* Umur Penutur */}
          <div className="pt-3 border-t border-indigo-100 dark:border-indigo-900/50">
            <h4 className="text-[11px] font-semibold text-indigo-900 dark:text-indigo-300 mb-2">
              Distribusi Usia Penutur Bahasa:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <ValidatedInput
                  id="penutur-u20"
                  label="Penutur Usia < 20 Tahun"
                  type="number"
                  min={0}
                  integerOnly
                  value={data.penuturUmurBawah20}
                  onChange={(val) => onChange('penuturUmurBawah20', val)}
                  placeholder="0"
                  addonRight={
                    <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 min-w-[50px]">
                      {calculatePercentage(puBawah20, totalUmurPenutur || totalPenutur)}
                    </span>
                  }
                />
              </div>

              <div>
                <ValidatedInput
                  id="penutur-u20sd40"
                  label="Penutur Usia 20 - 40 Tahun"
                  type="number"
                  min={0}
                  integerOnly
                  value={data.penuturUmur20sd40}
                  onChange={(val) => onChange('penuturUmur20sd40', val)}
                  placeholder="0"
                  addonRight={
                    <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 min-w-[50px]">
                      {calculatePercentage(pu20sd40, totalUmurPenutur || totalPenutur)}
                    </span>
                  }
                />
              </div>

              <div>
                <ValidatedInput
                  id="penutur-u40"
                  label="Penutur Usia > 40 Tahun"
                  type="number"
                  min={0}
                  integerOnly
                  value={data.penuturUmurDiatas40}
                  onChange={(val) => onChange('penuturUmurDiatas40', val)}
                  placeholder="0"
                  addonRight={
                    <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 min-w-[50px]">
                      {calculatePercentage(puDiatas40, totalUmurPenutur || totalPenutur)}
                    </span>
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* SUB-BAGIAN 3: ETNIK */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Mayoritas Etnik</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <ValidatedInput
                  id="etnik-mayoritas-nama"
                  value={data.mayoritasEtnik}
                  onChange={(val) => onChange('mayoritasEtnik', val)}
                  placeholder="Nama Etnik (Misal: Sunda)"
                />
              </div>
              <div>
                <ValidatedInput
                  id="etnik-mayoritas-persen"
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  value={data.mayoritasEtnikPersen}
                  onChange={(val) => onChange('mayoritasEtnikPersen', val)}
                  placeholder="Persen %"
                />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Minoritas Etnik</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <ValidatedInput
                  id="etnik-minoritas-nama"
                  value={data.minoritasEtnik}
                  onChange={(val) => onChange('minoritasEtnik', val)}
                  placeholder="Nama Etnik (Misal: Jawa/Bugis)"
                />
              </div>
              <div>
                <ValidatedInput
                  id="etnik-minoritas-persen"
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  value={data.minoritasEtnikPersen}
                  onChange={(val) => onChange('minoritasEtnikPersen', val)}
                  placeholder="Persen %"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
