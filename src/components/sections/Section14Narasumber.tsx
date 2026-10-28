import React, { useState } from 'react';
import { UserCheck, Plus, Trash2, Globe, MessageCircle } from 'lucide-react';
import { NarasumberData, BahasaLainDikuasai } from '../../types/linguistic';
import { ValidatedInput } from '../common/ValidatedInput';
import { FormValidationStatus } from '../common/FormValidationStatus';
import { validateSection14 } from '../../utils/formValidation';

interface Section14Props {
  narasumberList: NarasumberData[];
  onUpdateNarasumber: (index: number, updated: NarasumberData) => void;
}

export const Section14Narasumber: React.FC<Section14Props> = ({ narasumberList, onUpdateNarasumber }) => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const current = narasumberList[activeTab] || narasumberList[0];

  const updateField = (field: keyof NarasumberData, value: any) => {
    const updated = { ...current, [field]: value };
    onUpdateNarasumber(activeTab, updated);
  };

  const updateTempatLahir = (field: keyof NarasumberData['tempatLahir'], value: string) => {
    const updated = {
      ...current,
      tempatLahir: {
        ...current.tempatLahir,
        [field]: value
      }
    };
    onUpdateNarasumber(activeTab, updated);
  };

  const updatePekerjaan = (field: keyof NarasumberData['pekerjaan'], value: string) => {
    const updated = {
      ...current,
      pekerjaan: {
        ...current.pekerjaan,
        [field]: value
      }
    };
    onUpdateNarasumber(activeTab, updated);
  };

  const updateMediaSosial = (field: keyof NarasumberData['mediaSosial'], value: any) => {
    const updated = {
      ...current,
      mediaSosial: {
        ...current.mediaSosial,
        [field]: value
      }
    };
    onUpdateNarasumber(activeTab, updated);
  };

  const updateBahasaDigunakan = (field: keyof NarasumberData['bahasaDigunakan'], value: string) => {
    const updated = {
      ...current,
      bahasaDigunakan: {
        ...current.bahasaDigunakan,
        [field]: value
      }
    };
    onUpdateNarasumber(activeTab, updated);
  };

  const addBahasaLain = () => {
    const updatedList = [
      ...current.bahasaLainDikuasai,
      { namaBahasa: '', dialek: '', penguasaan: 'aktif' as const }
    ];
    updateField('bahasaLainDikuasai', updatedList);
  };

  const removeBahasaLain = (index: number) => {
    const updatedList = current.bahasaLainDikuasai.filter((_, i) => i !== index);
    updateField('bahasaLainDikuasai', updatedList);
  };

  const updateBahasaLainItem = (index: number, field: keyof BahasaLainDikuasai, value: any) => {
    const updatedList = current.bahasaLainDikuasai.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    updateField('bahasaLainDikuasai', updatedList);
  };

  const errors = validateSection14(narasumberList);

  return (
    <section id="section-14" className="scroll-mt-36 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs p-5 md:p-6 transition-all">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-100 dark:border-indigo-900/50">
            14
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Profil Narasumber Data Bahasa (3 Informan)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Biodata lengkap, riwayat mobilitas, penggunaan media sosial, dan kompetensi kebahasaan narasumber.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
          <UserCheck className="w-3.5 h-3.5" />
          Kualifikasi Informan
        </span>
      </div>

      {/* Validation feedback for Section 14 */}
      <FormValidationStatus 
        errors={errors} 
        sectionTitle="Profil Narasumber" 
        className="mb-5" 
      />

      {/* Tabs Selector for 3 Narasumber */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2">
        {narasumberList.map((ns, idx) => (
          <button
            key={ns.id || idx}
            type="button"
            id={`tab-narasumber-${idx + 1}`}
            onClick={() => setActiveTab(idx)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === idx
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Narasumber {idx + 1}</span>
            {ns.nama && (
              <span className={`text-[11px] px-1.5 py-0.2 rounded font-normal ${activeTab === idx ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-700'}`}>
                {ns.nama.split(' ')[0]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content Form for Active Narasumber */}
      <div className="space-y-6">
        {/* Identitas Diri */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <ValidatedInput
              id={`ns-${activeTab}-nama`}
              label="Nama Lengkap Informan"
              value={current.nama}
              onChange={(val) => updateField('nama', val)}
              placeholder="Contoh: H. Abah Suwarna"
              required
              minLength={3}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Jenis Kelamin
            </label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => updateField('jenisKelamin', 'pria')}
                className={`py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                  current.jenisKelamin === 'pria'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800 font-bold'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                Pria
              </button>
              <button
                type="button"
                onClick={() => updateField('jenisKelamin', 'wanita')}
                className={`py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                  current.jenisKelamin === 'wanita'
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 font-bold'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                Wanita
              </button>
            </div>
          </div>

          <div>
            <ValidatedInput
              id={`ns-${activeTab}-usia`}
              label="Usia (Tahun)"
              type="number"
              min={10}
              max={120}
              integerOnly
              value={current.usia}
              onChange={(val) => updateField('usia', val)}
              placeholder="Contoh: 68"
            />
          </div>

          <div>
            <ValidatedInput
              id={`ns-${activeTab}-tahun-lahir`}
              label="Tahun Kelahiran"
              type="number"
              min={1900}
              max={2026}
              integerOnly
              value={current.tahunKelahiran}
              onChange={(val) => updateField('tahunKelahiran', val)}
              placeholder="Contoh: 1958"
            />
          </div>
        </div>

        {/* Tempat Lahir & Lama Tinggal */}
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/80">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
            Tempat Lahir & Masa Domisili di Desa Ini
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Desa Kelahiran</label>
              <input
                type="text"
                value={current.tempatLahir.desa}
                onChange={(e) => updateTempatLahir('desa', e.target.value)}
                placeholder="Desa lahir"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Kecamatan</label>
              <input
                type="text"
                value={current.tempatLahir.kecamatan}
                onChange={(e) => updateTempatLahir('kecamatan', e.target.value)}
                placeholder="Kecamatan"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Kabupaten/Kota</label>
              <input
                type="text"
                value={current.tempatLahir.kabupatenKota}
                onChange={(e) => updateTempatLahir('kabupatenKota', e.target.value)}
                placeholder="Kabupaten/Kota"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Provinsi</label>
              <input
                type="text"
                value={current.tempatLahir.provinsi}
                onChange={(e) => updateTempatLahir('provinsi', e.target.value)}
                placeholder="Provinsi"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Lama Tinggal (Tahun)</label>
              <input
                type="number"
                min="0"
                value={current.lamaTinggalTahun}
                onChange={(e) => updateField('lamaTinggalTahun', e.target.value)}
                placeholder="Tahun menetap"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-semibold text-indigo-700"
              />
            </div>
          </div>
        </div>

        {/* Pendidikan & Pekerjaan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor={`ns-${activeTab}-pendidikan`} className="block text-xs font-semibold text-slate-700 mb-1">
              Pendidikan Tertinggi
            </label>
            <input
              id={`ns-${activeTab}-pendidikan`}
              type="text"
              value={current.pendidikanTertinggi}
              onChange={(e) => updateField('pendidikanTertinggi', e.target.value)}
              placeholder="Contoh: SMA Sederajat / S1"
              className="w-full px-3 py-1.5 text-sm bg-slate-50/50 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label htmlFor={`ns-${activeTab}-lokasi-kerja`} className="block text-xs font-semibold text-slate-700 mb-1">
              Bekerja di Mana (Lokasi)
            </label>
            <input
              id={`ns-${activeTab}-lokasi-kerja`}
              type="text"
              value={current.pekerjaan.lokasiBekerja}
              onChange={(e) => updatePekerjaan('lokasiBekerja', e.target.value)}
              placeholder="Contoh: Di kebun kelapa desa"
              className="w-full px-3 py-1.5 text-sm bg-slate-50/50 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label htmlFor={`ns-${activeTab}-posisi-kerja`} className="block text-xs font-semibold text-slate-700 mb-1">
              Sebagai Apa (Pekerjaan / Jabatan)
            </label>
            <input
              id={`ns-${activeTab}-posisi-kerja`}
              type="text"
              value={current.pekerjaan.sebagaiApa}
              onChange={(e) => updatePekerjaan('sebagaiApa', e.target.value)}
              placeholder="Contoh: Petani kelapa & tetua adat"
              className="w-full px-3 py-1.5 text-sm bg-slate-50/50 border border-slate-200 rounded-lg"
            />
          </div>
        </div>

        {/* Frekuensi Mobilitas ke Luar Desa */}
        <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200/80">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Frekuensi Mobilitas ke Luar Desa
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
            {[
              { val: 'tidak_pernah', lbl: 'Tidak pernah' },
              { val: 'sangat_jarang_1_tahun', lbl: 'Sangat jarang (1 kali setahun)' },
              { val: 'jarang_1_bulan', lbl: 'Jarang (1 kali sebulan)' },
              { val: 'sering', lbl: 'Sering' }
            ].map(({ val, lbl }) => (
              <button
                key={val}
                type="button"
                onClick={() => updateField('frekuensiMobilitas', val)}
                className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-all ${
                  current.frekuensiMobilitas === val
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>

          {current.frekuensiMobilitas === 'sering' && (
            <div className="flex items-center gap-2 max-w-sm">
              <span className="text-xs text-slate-600">Berapa kali dalam sebulan?</span>
              <input
                type="number"
                min="1"
                value={current.frekuensiSeringBerapaKali || ''}
                onChange={(e) => updateField('frekuensiSeringBerapaKali', e.target.value)}
                placeholder="Misal: 4 kali"
                className="w-24 px-2 py-1 text-xs bg-white border border-slate-200 rounded-md"
              />
              <span className="text-xs text-slate-500">kali / bulan</span>
            </div>
          )}
        </div>

        {/* Penggunaan Media Sosial */}
        <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200/80">
          <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-indigo-500" />
            Penggunaan Media Sosial
          </label>
          <div className="flex flex-wrap gap-2.5 mb-3">
            {[
              { key: 'facebook', label: 'Facebook' },
              { key: 'tiktok', label: 'TikTok' },
              { key: 'instagram', label: 'Instagram' },
              { key: 'twitter', label: 'Twitter / X' }
            ].map(({ key, label }) => {
              const checked = !!current.mediaSosial[key as keyof NarasumberData['mediaSosial']];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateMediaSosial(key as any, !checked)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    checked
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {label} {checked ? '✓' : '+'}
                </button>
              );
            })}
          </div>
          <div>
            <input
              type="text"
              value={current.mediaSosial.lainLain}
              onChange={(e) => updateMediaSosial('lainLain', e.target.value)}
              placeholder="Media sosial / aplikasi komunikasi lain (contoh: WhatsApp Grup, YouTube)"
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
            />
          </div>
        </div>

        {/* Bahasa yang Digunakan pada Ranah / Domain Tertentu */}
        <div className="p-4 bg-indigo-50/30 rounded-xl border border-indigo-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950 mb-3 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            Bahasa yang Digunakan Berdasarkan Ranah Komunikasi
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">1. Di Rumah (Keluarga)</label>
              <input
                type="text"
                value={current.bahasaDigunakan.diRumah}
                onChange={(e) => updateBahasaDigunakan('diRumah', e.target.value)}
                placeholder="Misal: Bahasa Sunda Wewengkon Loma"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">2. Di Masyarakat (Tetangga / Balai)</label>
              <input
                type="text"
                value={current.bahasaDigunakan.diMasyarakat}
                onChange={(e) => updateBahasaDigunakan('diMasyarakat', e.target.value)}
                placeholder="Misal: Bahasa Sunda Lemes & Loma"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">3. Di Tempat Kerja</label>
              <input
                type="text"
                value={current.bahasaDigunakan.diTempatKerja}
                onChange={(e) => updateBahasaDigunakan('diTempatKerja', e.target.value)}
                placeholder="Misal: Bahasa Sunda & Bahasa Indonesia"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">4. Di Perjalanan / Bepergian</label>
              <input
                type="text"
                value={current.bahasaDigunakan.diPerjalanan}
                onChange={(e) => updateBahasaDigunakan('diPerjalanan', e.target.value)}
                placeholder="Misal: Bahasa Indonesia"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Bahasa Lain yang Dikuasai */}
        <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Bahasa Lain yang Dikuasai
            </h3>
            <button
              type="button"
              onClick={addBahasaLain}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Bahasa</span>
            </button>
          </div>

          <div className="space-y-2">
            {current.bahasaLainDikuasai.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item.namaBahasa}
                  onChange={(e) => updateBahasaLainItem(idx, 'namaBahasa', e.target.value)}
                  placeholder="Nama Bahasa (contoh: Bahasa Jawa)"
                  className="w-1/3 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                />
                <input
                  type="text"
                  value={item.dialek}
                  onChange={(e) => updateBahasaLainItem(idx, 'dialek', e.target.value)}
                  placeholder="Nama Dialek (contoh: Banyumasan)"
                  className="w-1/3 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                />
                <select
                  value={item.penguasaan}
                  onChange={(e) => updateBahasaLainItem(idx, 'penguasaan', e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-medium"
                >
                  <option value="aktif">Penguasaan Aktif</option>
                  <option value="pasif">Penguasaan Pasif</option>
                </select>
                {current.bahasaLainDikuasai.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBahasaLain(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
