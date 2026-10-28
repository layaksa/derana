import React from 'react';
import { 
  X, 
  Save, 
  ChevronLeft, 
  ChevronRight, 
  ListFilter, 
  Layers, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles,
  Check,
  Minimize2,
  Maximize2,
  Lock
} from 'lucide-react';
import { 
  InstrumenPemetaanBahasaData, 
  SurveyRecord,
  NarasumberData, 
  KosakataItem, 
  FrasaItem, 
  KalimatItem, 
  CatatanPengumpulData 
} from '../../types/linguistic';
import { AppUser } from '../../types/auth';
import { SECTIONS_META } from '../NavigationStepper';

// Section components
import { Section1TitikPengamatan } from '../sections/Section1TitikPengamatan';
import { Section2SituasiKebahasaan } from '../sections/Section2SituasiKebahasaan';
import { Section3SituasiGeografis } from '../sections/Section3SituasiGeografis';
import { Section4Penduduk } from '../sections/Section4Penduduk';
import { Section5MataPencaharian } from '../sections/Section5MataPencaharian';
import { Section6Pendidikan } from '../sections/Section6Pendidikan';
import { Section7SaranaPendidikan } from '../sections/Section7SaranaPendidikan';
import { Section8Agama } from '../sections/Section8Agama';
import { Section9HubunganMobilitas } from '../sections/Section9HubunganMobilitas';
import { Section10Transportasi } from '../sections/Section10Transportasi';
import { Section11UsiaDesa } from '../sections/Section11UsiaDesa';
import { Section12SejarahDesa } from '../sections/Section12SejarahDesa';
import { Section13Folklore } from '../sections/Section13Folklore';
import { Section14Narasumber } from '../sections/Section14Narasumber';
import { Section15Kosakata } from '../sections/Section15Kosakata';
import { Section16DialektometriPeta } from '../sections/Section16DialektometriPeta';

interface PemetaanKuesionerModalWindowProps {
  isOpen: boolean;
  onClose: () => void;
  activeScreenNumber: number;
  onScreenChange: (screen: number) => void;
  formMode: 'screen' | 'all';
  onChangeFormMode: (mode: 'screen' | 'all') => void;
  canEdit: boolean;
  currentUser?: AppUser | null;
  lastSavedTime: string | null;
  onSave: () => void;
  onLoadSample: () => void;
  onResetEmpty: () => void;
  validationSummary?: any;
  onOpenValidationModal?: () => void;

  data: InstrumenPemetaanBahasaData;
  surveys?: SurveyRecord[];
  activeSurveyId?: string;

  updateTitikPengamatan: (field: any, val: any) => void;
  updateSituasiKebahasaan: (dir: any, field: any, val: any) => void;
  updateSituasiGeografis: (field: any, val: any) => void;
  updatePenduduk: (field: any, val: any) => void;
  updateMataPencaharian: (field: any, val: any) => void;
  updatePendidikan: (field: any, val: any) => void;
  updateSaranaPendidikan: (field: any, val: any) => void;
  updateAgama: (field: any, val: any) => void;
  updateHubunganMobilitas: (field: any, val: any) => void;
  updateAlatTransportasi: (field: any, val: any) => void;
  updateUsiaDesa: (field: any, val: any) => void;
  updateSejarahDesa: (field: any, val: any) => void;
  updateFolklore: (field: any, val: any) => void;
  updateNarasumber: (index: number, updated: NarasumberData) => void;
  updateSwadeshItem: (id: number, field: keyof KosakataItem, val: string) => void;
  updateBudayaItem: (bidangKode: string, itemId: number, field: keyof KosakataItem, val: string) => void;
  updateSwadeshAudio: (id: number, audioUrl?: string, fileName?: string, duration?: string) => void;
  updateBudayaAudio: (bidangKode: string, itemId: number, audioUrl?: string, fileName?: string, duration?: string) => void;
  updateFrasaItem: (categoryKey: any, frasaId: string, field: keyof FrasaItem, val: string) => void;
  updateKalimatItem: (id: string, field: keyof KalimatItem, val: string) => void;
  addKalimat: () => void;
  removeKalimat: (id: string) => void;
  updateCatatanPengumpul: (field: keyof CatatanPengumpulData, val: string) => void;
  importExcelCustomList: (items: KosakataItem[]) => void;
  importExcelUpdateSwadesh: (items: any[]) => void;
  updateExcelItem: (id: number, field: keyof KosakataItem, val: string) => void;
  updateExcelAudio: (id: number, audioUrl?: string, fileName?: string, duration?: string) => void;
  addExcelItem: () => void;
  removeExcelItem: (id: number) => void;
  clearExcelList: () => void;
  updateTitikPembanding: (updatedList: any[]) => void;
  updateCatatanDialektometri: (field: any, val: string) => void;
  navigateToDialektometriSection: () => void;
}

export const PemetaanKuesionerModalWindow: React.FC<PemetaanKuesionerModalWindowProps> = ({
  isOpen,
  onClose,
  activeScreenNumber,
  onScreenChange,
  formMode,
  onChangeFormMode,
  canEdit,
  currentUser,
  lastSavedTime,
  onSave,
  onLoadSample,
  onResetEmpty,
  validationSummary,
  onOpenValidationModal,
  data,
  surveys,
  activeSurveyId,
  updateTitikPengamatan,
  updateSituasiKebahasaan,
  updateSituasiGeografis,
  updatePenduduk,
  updateMataPencaharian,
  updatePendidikan,
  updateSaranaPendidikan,
  updateAgama,
  updateHubunganMobilitas,
  updateAlatTransportasi,
  updateUsiaDesa,
  updateSejarahDesa,
  updateFolklore,
  updateNarasumber,
  updateSwadeshItem,
  updateBudayaItem,
  updateSwadeshAudio,
  updateBudayaAudio,
  updateFrasaItem,
  updateKalimatItem,
  addKalimat,
  removeKalimat,
  updateCatatanPengumpul,
  importExcelCustomList,
  importExcelUpdateSwadesh,
  updateExcelItem,
  updateExcelAudio,
  addExcelItem,
  removeExcelItem,
  clearExcelList,
  updateTitikPembanding,
  updateCatatanDialektometri,
  navigateToDialektometriSection
}) => {
  if (!isOpen) return null;

  const currentMeta = SECTIONS_META[activeScreenNumber - 1] || SECTIONS_META[0];

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handlePrev = () => {
    if (activeScreenNumber > 1) {
      onScreenChange(activeScreenNumber - 1);
    }
  };

  const handleNext = () => {
    if (activeScreenNumber < 16) {
      onScreenChange(activeScreenNumber + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-6xl h-[96vh] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden transition-colors">
        
        {/* ========================================================================= */}
        {/* 1. TOP WINDOW BAR */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-linear-to-r from-blue-50/90 via-indigo-50/50 to-white dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-900 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md flex items-center justify-center shrink-0">
                {activeScreenNumber}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider">
                    Jendela Baru
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {currentMeta.title}
                  </h2>
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-sky-300 text-[10px] font-bold uppercase tracking-wider">
                    {currentMeta.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Layar {activeScreenNumber} dari 16 • Titik: <strong>Desa {data.titikPengamatan.namaDesa || 'Belum Dinamai'}</strong> ({data.titikPengamatan.bahasaDigunakan || 'Bahasa Utama'})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={() => onChangeFormMode(formMode === 'screen' ? 'all' : 'screen')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
                title="Beralih mode tampilan"
              >
                <ListFilter className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden md:inline">{formMode === 'screen' ? 'Tampilkan Semua Seksi' : 'Layar Terfokus'}</span>
              </button>

              {canEdit ? (
                <button
                  type="button"
                  onClick={onSave}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-semibold border border-amber-300 dark:border-amber-700">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Mode Hanya Baca</span>
                </span>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer ml-1"
                title="Tutup Jendela Kuesioner (Kembali ke Ringkasan)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stepper Pill Strip for 16 Screens */}
          <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {SECTIONS_META.map((sec) => {
              const isCurrent = sec.number === activeScreenNumber;
              return (
                <button
                  key={sec.number}
                  type="button"
                  onClick={() => onScreenChange(sec.number)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                    isCurrent ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {sec.number}
                  </span>
                  <span>{sec.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. SCROLLABLE WINDOW BODY */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/50">
          
          {/* Read-Only Notice Banner if unauthorized / Tamu */}
          {!canEdit && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-xl p-3.5 flex items-start sm:items-center gap-3 text-xs text-amber-900 dark:text-amber-200">
              <Lock className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <strong className="font-bold text-amber-950 dark:text-amber-100">
                  Mode Hanya Baca (Read-Only)
                </strong>
                <p className="mt-0.5 text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed">
                  {currentUser?.role === 'tamu'
                    ? 'Akun Anda terdaftar sebagai Tamu / Akademisi. Anda dapat menelaah seluruh pertanyaan dan data isian empiris kebahasaan 16 seksi, namun formulir dikunci dari pengubahan.'
                    : 'Kuesioner ini dalam mode baca. Anda tidak memiliki hak penyuntingan instrumen atau kuesioner telah berstatus Tervalidasi.'}
                </p>
              </div>
            </div>
          )}

          {/* Focused Mode: Single Active Screen Wrapped in Fieldset Disabled */}
          <fieldset disabled={!canEdit} className="space-y-6 border-0 p-0 m-0 min-w-0 disabled:opacity-90">
          {formMode === 'screen' ? (
            <div className="space-y-6 animate-in fade-in duration-150">
              {activeScreenNumber === 1 && (
                <Section1TitikPengamatan
                  data={data.titikPengamatan}
                  onChange={updateTitikPengamatan}
                />
              )}
              {activeScreenNumber === 2 && (
                <Section2SituasiKebahasaan
                  data={data.situasiKebahasaan}
                  onChangeDirection={updateSituasiKebahasaan}
                />
              )}
              {activeScreenNumber === 3 && (
                <Section3SituasiGeografis
                  data={data.situasiGeografis}
                  onChange={updateSituasiGeografis}
                  titikPengamatan={data.titikPengamatan}
                />
              )}
              {activeScreenNumber === 4 && (
                <Section4Penduduk
                  data={data.penduduk}
                  onChange={updatePenduduk}
                />
              )}
              {activeScreenNumber === 5 && (
                <Section5MataPencaharian
                  data={data.mataPencaharian}
                  onChange={updateMataPencaharian}
                />
              )}
              {activeScreenNumber === 6 && (
                <Section6Pendidikan
                  data={data.pendidikan}
                  onChange={updatePendidikan}
                />
              )}
              {activeScreenNumber === 7 && (
                <Section7SaranaPendidikan
                  data={data.saranaPendidikan}
                  onChange={updateSaranaPendidikan}
                />
              )}
              {activeScreenNumber === 8 && (
                <Section8Agama
                  data={data.agama}
                  onChange={updateAgama}
                />
              )}
              {activeScreenNumber === 9 && (
                <Section9HubunganMobilitas
                  data={data.hubunganMobilitas}
                  onChange={updateHubunganMobilitas}
                />
              )}
              {activeScreenNumber === 10 && (
                <Section10Transportasi
                  data={data.alatTransportasi}
                  onChange={updateAlatTransportasi}
                />
              )}
              {activeScreenNumber === 11 && (
                <Section11UsiaDesa
                  data={data.usiaDesa}
                  onChange={updateUsiaDesa}
                />
              )}
              {activeScreenNumber === 12 && (
                <Section12SejarahDesa
                  data={data.sejarahDesa}
                  onChange={updateSejarahDesa}
                />
              )}
              {activeScreenNumber === 13 && (
                <Section13Folklore
                  data={data.folklore}
                  onChange={updateFolklore}
                />
              )}
              {activeScreenNumber === 14 && (
                <Section14Narasumber
                  narasumberList={data.narasumberList}
                  onUpdateNarasumber={updateNarasumber}
                />
              )}
              {activeScreenNumber === 15 && (
                <Section15Kosakata
                  data={data.kosakataLengkap}
                  onUpdateSwadeshItem={updateSwadeshItem}
                  onUpdateBudayaItem={updateBudayaItem}
                  onUpdateSwadeshAudio={updateSwadeshAudio}
                  onUpdateBudayaAudio={updateBudayaAudio}
                  onUpdateFrasaItem={updateFrasaItem}
                  onUpdateKalimatItem={updateKalimatItem}
                  onAddKalimat={addKalimat}
                  onRemoveKalimat={removeKalimat}
                  onUpdateCatatanPengumpul={updateCatatanPengumpul}
                  onImportExcelCustomList={importExcelCustomList}
                  onImportExcelUpdateSwadesh={importExcelUpdateSwadesh}
                  onUpdateExcelItem={updateExcelItem}
                  onUpdateExcelAudio={updateExcelAudio}
                  onAddExcelItem={addExcelItem}
                  onRemoveExcelItem={removeExcelItem}
                  onClearExcelList={clearExcelList}
                  dialektometriData={data.dialektometri}
                  titikPengamatan={data.titikPengamatan}
                  allSurveys={surveys}
                  activeSurveyId={activeSurveyId}
                  onUpdateTitikPembanding={updateTitikPembanding}
                  onNavigateToSection16={navigateToDialektometriSection}
                />
              )}
              {activeScreenNumber === 16 && (
                <Section16DialektometriPeta
                  data={data.dialektometri}
                  titikPengamatan={data.titikPengamatan}
                  situasiGeografis={data.situasiGeografis}
                  kosakataLengkap={data.kosakataLengkap}
                  allSurveys={surveys}
                  activeSurveyId={activeSurveyId}
                  onUpdateTitikPembanding={updateTitikPembanding}
                  onUpdateCatatan={updateCatatanDialektometri}
                />
              )}
            </div>
          ) : (
            /* Full Scroll Mode: All 16 Sections */
            <div className="space-y-8 animate-in fade-in duration-150">
              <div id="section-1"><Section1TitikPengamatan data={data.titikPengamatan} onChange={updateTitikPengamatan} /></div>
              <div id="section-2"><Section2SituasiKebahasaan data={data.situasiKebahasaan} onChangeDirection={updateSituasiKebahasaan} /></div>
              <div id="section-3"><Section3SituasiGeografis data={data.situasiGeografis} onChange={updateSituasiGeografis} titikPengamatan={data.titikPengamatan} /></div>
              <div id="section-4"><Section4Penduduk data={data.penduduk} onChange={updatePenduduk} /></div>
              <div id="section-5"><Section5MataPencaharian data={data.mataPencaharian} onChange={updateMataPencaharian} /></div>
              <div id="section-6"><Section6Pendidikan data={data.pendidikan} onChange={updatePendidikan} /></div>
              <div id="section-7"><Section7SaranaPendidikan data={data.saranaPendidikan} onChange={updateSaranaPendidikan} /></div>
              <div id="section-8"><Section8Agama data={data.agama} onChange={updateAgama} /></div>
              <div id="section-9"><Section9HubunganMobilitas data={data.hubunganMobilitas} onChange={updateHubunganMobilitas} /></div>
              <div id="section-10"><Section10Transportasi data={data.alatTransportasi} onChange={updateAlatTransportasi} /></div>
              <div id="section-11"><Section11UsiaDesa data={data.usiaDesa} onChange={updateUsiaDesa} /></div>
              <div id="section-12"><Section12SejarahDesa data={data.sejarahDesa} onChange={updateSejarahDesa} /></div>
              <div id="section-13"><Section13Folklore data={data.folklore} onChange={updateFolklore} /></div>
              <div id="section-14"><Section14Narasumber narasumberList={data.narasumberList} onUpdateNarasumber={updateNarasumber} /></div>
              <div id="section-15">
                <Section15Kosakata
                  data={data.kosakataLengkap}
                  onUpdateSwadeshItem={updateSwadeshItem}
                  onUpdateBudayaItem={updateBudayaItem}
                  onUpdateSwadeshAudio={updateSwadeshAudio}
                  onUpdateBudayaAudio={updateBudayaAudio}
                  onUpdateFrasaItem={updateFrasaItem}
                  onUpdateKalimatItem={updateKalimatItem}
                  onAddKalimat={addKalimat}
                  onRemoveKalimat={removeKalimat}
                  onUpdateCatatanPengumpul={updateCatatanPengumpul}
                  onImportExcelCustomList={importExcelCustomList}
                  onImportExcelUpdateSwadesh={importExcelUpdateSwadesh}
                  onUpdateExcelItem={updateExcelItem}
                  onUpdateExcelAudio={updateExcelAudio}
                  onAddExcelItem={addExcelItem}
                  onRemoveExcelItem={removeExcelItem}
                  onClearExcelList={clearExcelList}
                  dialektometriData={data.dialektometri}
                  titikPengamatan={data.titikPengamatan}
                  allSurveys={surveys}
                  activeSurveyId={activeSurveyId}
                  onUpdateTitikPembanding={updateTitikPembanding}
                  onNavigateToSection16={navigateToDialektometriSection}
                />
              </div>
              <div id="section-16">
                <Section16DialektometriPeta
                  data={data.dialektometri}
                  titikPengamatan={data.titikPengamatan}
                  situasiGeografis={data.situasiGeografis}
                  kosakataLengkap={data.kosakataLengkap}
                  allSurveys={surveys}
                  activeSurveyId={activeSurveyId}
                  onUpdateTitikPembanding={updateTitikPembanding}
                  onUpdateCatatan={updateCatatanDialektometri}
                />
              </div>
            </div>
          )}
          </fieldset>

        </div>

        {/* ========================================================================= */}
        {/* 3. WINDOW BOTTOM BAR / NAVIGATION FOOTER */}
        {/* ========================================================================= */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Progres Pengisian:</span>
            <div className="w-28 sm:w-36 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.round((activeScreenNumber / 16) * 100)}%` }}
              />
            </div>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
              {activeScreenNumber}/16 ({Math.round((activeScreenNumber / 16) * 100)}%)
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handlePrev}
              disabled={activeScreenNumber <= 1}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={activeScreenNumber >= 16}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors cursor-pointer shadow-xs"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer ml-1"
            >
              <span>Tutup Jendela</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
