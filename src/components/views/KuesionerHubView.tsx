import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Languages, 
  BookOpen, 
  Mic, 
  Sparkles, 
  RefreshCw, 
  Save, 
  Sparkle, 
  RotateCcw, 
  ListFilter, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  MapPin,
  HelpCircle,
  FileText,
  Filter,
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
import { KondisiKebahasaanView } from './KondisiKebahasaanView';
import { SastraLisanView } from './SastraLisanView';
import { RevitalisasiView } from './RevitalisasiView';
import { PemetaanBahasaIntroView } from './PemetaanBahasaIntroView';
import { PemetaanKuesionerModalWindow } from './PemetaanKuesionerModalWindow';
import { motion, AnimatePresence } from 'motion/react';

export type KuesionerTab = 'pemetaan' | 'vitalitas' | 'sastra-lisan' | 'revitalisasi';

interface KuesionerHubViewProps {
  activeTab: KuesionerTab;
  onChangeTab: (tab: KuesionerTab) => void;
  data: InstrumenPemetaanBahasaData;
  surveys: SurveyRecord[];
  activeSurveyId: string;
  canEdit: boolean;
  currentUser?: AppUser | null;
  lastSavedTime: string | null;
  onSave: () => void;
  
  // Pemetaan 16-Screen & All-Sections props
  activeScreenNumber: number;
  onScreenChange: (screen: number) => void;
  formMode: 'screen' | 'all';
  onChangeFormMode: (mode: 'screen' | 'all') => void;
  onLoadSample: () => void;
  onResetEmpty: () => void;
  validationSummary: any;
  onOpenValidationModal: () => void;

  // Section 1 - 16 Updaters
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
  onSelectSurvey?: (id: string) => void;
  onCreateNewSurvey?: (type: 'empty' | 'sample') => void;
  onDeleteSurvey?: (id: string) => void;
  onDuplicateSurvey?: (id: string) => void;
}

export const KuesionerHubView: React.FC<KuesionerHubViewProps> = ({
  activeTab,
  onChangeTab,
  data,
  surveys,
  activeSurveyId,
  canEdit,
  currentUser,
  lastSavedTime,
  onSave,
  activeScreenNumber,
  onScreenChange,
  formMode,
  onChangeFormMode,
  onLoadSample,
  onResetEmpty,
  validationSummary,
  onOpenValidationModal,
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
  navigateToDialektometriSection,
  onSelectSurvey,
  onCreateNewSurvey,
  onDeleteSurvey,
  onDuplicateSurvey
}) => {
  const currentSurvey = surveys.find(s => s.id === activeSurveyId);
  const [isPemetaanModalOpen, setIsPemetaanModalOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string>('all');

  // Extract all distinct provinces from survey dataset
  const availableProvinces = useMemo(() => {
    const provSet = new Set<string>();
    surveys.forEach(s => {
      const p = (s.provinsi || s.data?.titikPengamatan?.provinsi || '').trim();
      if (p) provSet.add(p);
    });
    // Add representative default provinces so user has choices
    ['Jawa Barat', 'Banten', 'Jawa Tengah', 'Jawa Timur', 'Maluku', 'Maluku Utara', 'Nusa Tenggara Timur', 'Papua'].forEach(p => provSet.add(p));
    return Array.from(provSet).sort();
  }, [surveys]);

  // Compute surveys filtered by province
  const surveysFilteredByProvince = useMemo(() => {
    if (selectedProvince === 'all') return surveys;
    return surveys.filter(s => {
      const p = (s.provinsi || s.data?.titikPengamatan?.provinsi || 'Jawa Barat').trim().toLowerCase();
      return p === selectedProvince.trim().toLowerCase();
    });
  }, [surveys, selectedProvince]);

  // Tab definitions matching user specification
  const tabs = [
    {
      id: 'pemetaan' as KuesionerTab,
      title: 'Pemetaan Bahasa',
      subtitle: '16 Seksi • Dialektometri',
      icon: Layers,
      badge: `${activeScreenNumber}/16`,
      color: 'blue'
    },
    {
      id: 'sastra-lisan' as KuesionerTab,
      title: 'Pemetaan Sastra Lisan',
      subtitle: 'Folklore & Motif Thompson',
      icon: Mic,
      badge: 'Korpus',
      color: 'purple'
    },
    {
      id: 'vitalitas' as KuesionerTab,
      title: 'Vitalitas Bahasa',
      subtitle: 'Daya Hidup & Responden',
      icon: Languages,
      badge: 'UNESCO',
      color: 'emerald'
    },
    {
      id: 'revitalisasi' as KuesionerTab,
      title: 'Revitalisasi Bahasa Daerah',
      subtitle: 'Monev IKRBD & RAP',
      icon: Sparkles,
      badge: 'Model C',
      color: 'amber'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* TOP UNIFIED KUESIONER HUB HEADER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-sky-300 border border-blue-200 dark:border-blue-800">
                Pusat Kuesioner Terpadu
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Titik: <strong>Desa {data.titikPengamatan.namaDesa || 'Belum Dinamai'}</strong> ({data.titikPengamatan.bahasaDigunakan || 'Bahasa Daerah'})
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">
              Kuesioner & Instrumen Penelitian Kebahasaan
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Seluruh formulir survei lapangan, instrumen vitalitas daya hidup, pemetaan sastra lisan, dan monev revitalisasi bahasa daerah dalam satu navigasi terpadu.
            </p>
          </div>

          {canEdit ? (
            <div className="flex items-center gap-2 self-start lg:self-center">
              <button
                type="button"
                onClick={onSave}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Formulir</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 self-start lg:self-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5" />
                <span>Mode Hanya Baca ({currentUser?.role === 'tamu' ? 'Tamu / Akademisi' : 'Tervalidasi / Terkunci'})</span>
              </span>
            </div>
          )}
        </div>

        {/* 4 PRIMARY KUESIONER TABS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 pt-4">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeTab(tab.id)}
                className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-600 dark:border-sky-400 ring-2 ring-blue-500/10 shadow-xs'
                    : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className={`p-1.5 rounded-lg ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {tab.badge}
                  </span>
                </div>
                <div>
                  <h3 className={`text-xs sm:text-sm font-bold ${
                    isActive ? 'text-blue-900 dark:text-sky-200' : 'text-slate-900 dark:text-slate-100'
                  }`}>
                    {tab.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {tab.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* GLOBAL PROVINCE FILTER BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 mt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-300">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Filter Provinsi Kuesioner:
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-sky-300 border border-blue-200 dark:border-blue-800">
                  {selectedProvince === 'all' ? 'Seluruh Indonesia' : selectedProvince}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedProvince === 'all'
                  ? `Menampilkan seluruh kuesioner (${surveys.length} survei terdata)`
                  : `Menyaring kuesioner pada wilayah ${selectedProvince} (${surveysFilteredByProvince.length} survei terdata)`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedProvince}
                onChange={e => setSelectedProvince(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
              >
                <option value="all">Semua Provinsi (Nasional)</option>
                {availableProvinces.map(prov => {
                  const count = surveys.filter(s => {
                    const p = (s.provinsi || s.data?.titikPengamatan?.provinsi || 'Jawa Barat').trim().toLowerCase();
                    return p === prov.trim().toLowerCase();
                  }).length;
                  return (
                    <option key={prov} value={prov}>
                      {prov} {count > 0 ? `(${count})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {selectedProvince !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedProvince('all')}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-blue-600 dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full"
        >
          {/* TAB 1: FORMULIR KUESIONER PEMETAAN BAHASA (16 SEKSI INSTRUMEN LAPANGAN) */}
          {activeTab === 'pemetaan' && (
        <>
          <PemetaanBahasaIntroView
            data={data}
            canEdit={canEdit}
            currentUser={currentUser}
            onOpenQuestionnaire={(screenNum) => {
              if (screenNum) onScreenChange(screenNum);
              setIsPemetaanModalOpen(true);
            }}
            onLoadSample={onLoadSample}
            onResetEmpty={onResetEmpty}
            onNavigateToDialektometri={navigateToDialektometriSection}
            surveys={surveysFilteredByProvince}
            activeSurveyId={activeSurveyId}
            onSelectSurvey={onSelectSurvey}
            onCreateNewSurvey={onCreateNewSurvey}
            onDeleteSurvey={onDeleteSurvey}
            onDuplicateSurvey={onDuplicateSurvey}
            selectedProvinceFilter={selectedProvince}
            onSelectProvinceFilter={setSelectedProvince}
          />

          <PemetaanKuesionerModalWindow
            isOpen={isPemetaanModalOpen}
            onClose={() => setIsPemetaanModalOpen(false)}
            activeScreenNumber={activeScreenNumber}
            onScreenChange={onScreenChange}
            formMode={formMode}
            onChangeFormMode={onChangeFormMode}
            canEdit={canEdit}
            currentUser={currentUser}
            lastSavedTime={lastSavedTime}
            onSave={onSave}
            onLoadSample={onLoadSample}
            onResetEmpty={onResetEmpty}
            validationSummary={validationSummary}
            onOpenValidationModal={onOpenValidationModal}
            data={data}
            surveys={surveys}
            activeSurveyId={activeSurveyId}
            updateTitikPengamatan={updateTitikPengamatan}
            updateSituasiKebahasaan={updateSituasiKebahasaan}
            updateSituasiGeografis={updateSituasiGeografis}
            updatePenduduk={updatePenduduk}
            updateMataPencaharian={updateMataPencaharian}
            updatePendidikan={updatePendidikan}
            updateSaranaPendidikan={updateSaranaPendidikan}
            updateAgama={updateAgama}
            updateHubunganMobilitas={updateHubunganMobilitas}
            updateAlatTransportasi={updateAlatTransportasi}
            updateUsiaDesa={updateUsiaDesa}
            updateSejarahDesa={updateSejarahDesa}
            updateFolklore={updateFolklore}
            updateNarasumber={updateNarasumber}
            updateSwadeshItem={updateSwadeshItem}
            updateBudayaItem={updateBudayaItem}
            updateSwadeshAudio={updateSwadeshAudio}
            updateBudayaAudio={updateBudayaAudio}
            updateFrasaItem={updateFrasaItem}
            updateKalimatItem={updateKalimatItem}
            addKalimat={addKalimat}
            removeKalimat={removeKalimat}
            updateCatatanPengumpul={updateCatatanPengumpul}
            importExcelCustomList={importExcelCustomList}
            importExcelUpdateSwadesh={importExcelUpdateSwadesh}
            updateExcelItem={updateExcelItem}
            updateExcelAudio={updateExcelAudio}
            addExcelItem={addExcelItem}
            removeExcelItem={removeExcelItem}
            clearExcelList={clearExcelList}
            updateTitikPembanding={updateTitikPembanding}
            updateCatatanDialektometri={updateCatatanDialektometri}
            navigateToDialektometriSection={navigateToDialektometriSection}
          />
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FORMULIR KUESIONER PEMETAAN SASTRA LISAN & FOLKLORE */}
      {/* ========================================================================= */}
      {activeTab === 'sastra-lisan' && (
        <div className="space-y-6">
          <SastraLisanView
            data={data}
            canEdit={canEdit}
            selectedProvinceFilter={selectedProvince}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: FORMULIR KUESIONER VITALITAS BAHASA (KONDISI KEBAHASAAN) */}
      {/* ========================================================================= */}
      {activeTab === 'vitalitas' && (
        <div className="space-y-6">
          <KondisiKebahasaanView
            data={data}
            canEdit={canEdit}
            onSave={onSave}
            lastSavedTime={lastSavedTime}
            updatePenduduk={updatePenduduk}
            updateMataPencaharian={updateMataPencaharian}
            updatePendidikan={updatePendidikan}
            updateSaranaPendidikan={updateSaranaPendidikan}
            updateAgama={updateAgama}
            updateHubunganMobilitas={updateHubunganMobilitas}
            updateAlatTransportasi={updateAlatTransportasi}
            selectedProvinceFilter={selectedProvince}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: FORMULIR KUESIONER REVITALISASI BAHASA DAERAH (MONEV IKRBD & RAP) */}
      {/* ========================================================================= */}
      {activeTab === 'revitalisasi' && (
        <div className="space-y-6">
          <RevitalisasiView
            data={data}
            canEdit={canEdit}
            selectedProvinceFilter={selectedProvince}
          />
        </div>
      )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
