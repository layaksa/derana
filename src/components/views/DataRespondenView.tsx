import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  ShieldCheck, 
  Plus, 
  CheckCircle2, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Clock, 
  Languages, 
  Edit3, 
  Search, 
  Check, 
  AlertCircle, 
  Building, 
  Filter, 
  Sparkles, 
  Radio, 
  Eye, 
  ChevronRight, 
  Calendar, 
  Award, 
  Activity, 
  ExternalLink,
  X,
  Share2,
  Compass,
  ArrowRight,
  Layers,
  Globe2,
  TrendingUp
} from 'lucide-react';
import { NarasumberData, InstrumenPemetaanBahasaData } from '../../types/linguistic';
import { SurveyRecord } from '../../types/linguistic';

export interface DataRespondenViewProps {
  data: InstrumenPemetaanBahasaData;
  surveys?: SurveyRecord[];
  activeSurveyId?: string;
  onSelectSurvey?: (id: string) => void;
  onUpdateNarasumber?: (index: number, updated: NarasumberData) => void;
  onGoToFormScreen: (screenNumber: number) => void;
  onNavigateToCorrelation?: () => void;
  onNavigateToAgeRegression?: () => void;
}

export const DataRespondenView: React.FC<DataRespondenViewProps> = ({
  data,
  surveys = [],
  activeSurveyId,
  onSelectSurvey,
  onUpdateNarasumber,
  onGoToFormScreen,
  onNavigateToCorrelation,
  onNavigateToAgeRegression
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState<string>('all');
  const [selectedVillageFilter, setSelectedVillageFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'pria' | 'wanita'>('all');
  const [activeModalNarasumber, setActiveModalNarasumber] = useState<{
    narasumber: NarasumberData;
    villageName: string;
    provinceName: string;
    surveyId: string;
    index: number;
  } | null>(null);

  // Group surveys and their informants by Province and Village
  const provinceGroups = useMemo(() => {
    // If no surveys array provided, create fallback from current active data
    const list: Array<Partial<SurveyRecord> & { id: string; data: InstrumenPemetaanBahasaData }> = 
      surveys.length > 0 ? surveys : [{
        id: activeSurveyId || 'active-survey',
        title: data.titikPengamatan.namaDesa ? `Survei Desa ${data.titikPengamatan.namaDesa}` : 'Survei Aktif',
        desa: data.titikPengamatan.namaDesa || 'Desa Belum Dinamai',
        kecamatan: data.titikPengamatan.kecamatan || '-',
        kabupatenKota: data.titikPengamatan.kabupatenKota || '-',
        provinsi: data.titikPengamatan.provinsi || 'Jawa Barat',
        bahasa: data.titikPengamatan.bahasaDigunakan || 'Bahasa Daerah',
        data: data,
        createdByName: 'Surveyor Aktif',
        updatedAt: new Date().toISOString()
      }];

    // Map keyed by Province Name -> Map of Village Name -> Village Info & Informants
    const provMap = new Map<string, {
      provinceName: string;
      villages: Map<string, {
        villageName: string;
        kecamatan: string;
        kabupaten: string;
        provinsi: string;
        bahasa: string;
        surveyId: string;
        surveyTitle: string;
        createdByName: string;
        informants: {
          data: NarasumberData;
          index: number;
          surveyId: string;
          surveyTitle: string;
        }[];
      }>;
    }>();

    list.forEach(survey => {
      const provName = (survey.data?.titikPengamatan?.provinsi || survey.provinsi || 'Jawa Barat').trim() || 'Provinsi Lainnya';
      const vName = (survey.data?.titikPengamatan?.namaDesa || survey.desa || 'Desa Tanpa Nama').trim();
      const surveyTitle = survey.title || (vName ? `Survei Desa ${vName}` : 'Survei Kebahasaan');

      const surveyInformants = (survey.data?.narasumberList || []).map((n, idx) => ({
        data: n,
        index: idx,
        surveyId: survey.id,
        surveyTitle: surveyTitle
      }));

      if (!provMap.has(provName)) {
        provMap.set(provName, {
          provinceName: provName,
          villages: new Map()
        });
      }

      const pGroup = provMap.get(provName)!;
      const existingVillage = pGroup.villages.get(vName);

      if (!existingVillage) {
        pGroup.villages.set(vName, {
          villageName: vName,
          kecamatan: survey.data?.titikPengamatan?.kecamatan || survey.kecamatan || '-',
          kabupaten: survey.data?.titikPengamatan?.kabupatenKota || survey.kabupatenKota || '-',
          provinsi: provName,
          bahasa: survey.data?.titikPengamatan?.bahasaDigunakan || survey.bahasa || 'Bahasa Daerah',
          surveyId: survey.id,
          surveyTitle: surveyTitle,
          createdByName: survey.createdByName || 'Surveyor Lapangan',
          informants: surveyInformants
        });
      } else {
        existingVillage.informants.push(...surveyInformants);
      }
    });

    // Convert to nested array structure
    return Array.from(provMap.values()).map(p => ({
      provinceName: p.provinceName,
      villages: Array.from(p.villages.values())
    }));
  }, [surveys, data, activeSurveyId]);

  // List of all unique provinces
  const allProvinces = useMemo(() => {
    return provinceGroups.map(p => p.provinceName);
  }, [provinceGroups]);

  // Available villages for the currently selected province (or all)
  const availableVillages = useMemo(() => {
    if (selectedProvinceFilter === 'all') {
      const vSet = new Set<string>();
      provinceGroups.forEach(p => p.villages.forEach(v => vSet.add(v.villageName)));
      return Array.from(vSet);
    }
    const prov = provinceGroups.find(p => p.provinceName === selectedProvinceFilter);
    return prov ? prov.villages.map(v => v.villageName) : [];
  }, [provinceGroups, selectedProvinceFilter]);

  // Overall Statistics across all respondents
  const overallStats = useMemo(() => {
    let totalProvinces = provinceGroups.length;
    let totalVillages = 0;
    let totalInformants = 0;
    let filledInformants = 0;
    let maleCount = 0;
    let femaleCount = 0;
    let sumAge = 0;
    let ageCount = 0;
    let validCriteriaCount = 0;

    provinceGroups.forEach(p => {
      totalVillages += p.villages.length;
      p.villages.forEach(v => {
        v.informants.forEach(({ data: n }) => {
          totalInformants++;
          const isFilled = Boolean(n.nama && n.nama.trim().length > 0);
          if (isFilled) {
            filledInformants++;
            if (n.jenisKelamin === 'pria') maleCount++;
            if (n.jenisKelamin === 'wanita') femaleCount++;

            const ageNum = parseInt(String(n.usia), 10);
            if (!isNaN(ageNum) && ageNum > 0) {
              sumAge += ageNum;
              ageCount++;
              if (ageNum >= 25 && ageNum <= 65) {
                validCriteriaCount++;
              }
            }
          }
        });
      });
    });

    const avgAge = ageCount > 0 ? Math.round(sumAge / ageCount) : 0;

    return {
      totalProvinces,
      totalVillages,
      totalInformants,
      filledInformants,
      maleCount,
      femaleCount,
      avgAge,
      validCriteriaCount
    };
  }, [provinceGroups]);

  // Filtered Province & Village Groups
  const filteredProvinceGroups = useMemo(() => {
    return provinceGroups
      .filter(p => {
        if (selectedProvinceFilter !== 'all' && p.provinceName !== selectedProvinceFilter) {
          return false;
        }
        return true;
      })
      .map(p => {
        const filteredVillages = p.villages
          .filter(v => {
            if (selectedVillageFilter !== 'all' && v.villageName !== selectedVillageFilter) {
              return false;
            }
            return true;
          })
          .map(v => {
            const matchedInformants = v.informants.filter(({ data: n }) => {
              if (genderFilter !== 'all' && n.jenisKelamin !== genderFilter) {
                return false;
              }

              if (!searchTerm.trim()) return true;

              const term = searchTerm.toLowerCase();
              const nameMatch = (n.nama || '').toLowerCase().includes(term);
              const jobMatch = `${n.pekerjaan?.sebagaiApa || ''} ${n.pekerjaan?.lokasiBekerja || ''}`.toLowerCase().includes(term);
              const langMatch = `${n.bahasaDigunakan?.diRumah || ''} ${n.bahasaDigunakan?.diMasyarakat || ''}`.toLowerCase().includes(term);
              const villageMatch = v.villageName.toLowerCase().includes(term);
              const provMatch = p.provinceName.toLowerCase().includes(term);
              const eduMatch = (n.pendidikanTertinggi || '').toLowerCase().includes(term);

              return nameMatch || jobMatch || langMatch || villageMatch || provMatch || eduMatch;
            });

            return {
              ...v,
              informants: matchedInformants
            };
          })
          .filter(v => v.informants.length > 0 || (searchTerm.trim() === '' && selectedVillageFilter === 'all'));

        return {
          ...p,
          villages: filteredVillages
        };
      })
      .filter(p => p.villages.length > 0 || (searchTerm.trim() === '' && selectedProvinceFilter === 'all'));
  }, [provinceGroups, selectedProvinceFilter, selectedVillageFilter, genderFilter, searchTerm]);

  // Helper to check dialectology informant validity
  const checkInformantCriteria = (n: NarasumberData) => {
    const age = parseInt(String(n.usia), 10);
    const isAgeValid = !isNaN(age) && age >= 25 && age <= 65;
    const isNativeBorn = Boolean(n.tempatLahir?.desa || n.lamaTinggalTahun);
    const hasLanguage = Boolean(n.bahasaDigunakan?.diRumah);
    return {
      isAgeValid,
      isNativeBorn,
      hasLanguage,
      allPassed: isAgeValid && isNativeBorn && hasLanguage
    };
  };

  const handleOpenSurvey = (surveyId: string) => {
    if (onSelectSurvey) {
      onSelectSurvey(surveyId);
    }
    onGoToFormScreen(14);
  };

  return (
    <div className="space-y-6">
      
      {/* View Header with Bento Overview Strip */}
      <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#444444] rounded-2xl p-5 sm:p-6 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-[#1E1E1E] text-indigo-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-[#444444] shadow-xs">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-[#E0E0E0]">
                  Data Responden & Narasumber Per Provinsi
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-[#1E1E1E] text-indigo-700 dark:text-sky-300 border border-indigo-200/80 dark:border-[#444444]">
                  Matriks Wilayah
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#B0B0B0] mt-1 leading-relaxed">
                Inventarisasi profil narasumber penutur asli untuk instrumen pemetaan dialektometri yang dikelompokkan secara terstruktur per provinsi dan per desa.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-auto flex-wrap">
            {onNavigateToCorrelation && (
              <button
                type="button"
                onClick={onNavigateToCorrelation}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                title="Buka Analisis Korelasi Pendidikan vs Variasi Dialek (Scatter Plot Recharts)"
              >
                <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Korelasi Pendidikan & Dialek</span>
              </button>
            )}
            {onNavigateToAgeRegression && (
              <button
                type="button"
                onClick={onNavigateToAgeRegression}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                title="Buka Analisis Regresi Usia vs Variabel Bahasa (Grafik Tren Recharts)"
              >
                <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Regresi Usia & Dialek</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onGoToFormScreen(14)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Input Narasumber di Kuesioner (Layar 14)</span>
            </button>
          </div>
        </div>

        {/* Bento Stats Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-[#444444]">
          
          {/* Card 1: Total Provinsi */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1E1E1E] border border-slate-200/80 dark:border-[#444444] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Globe2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-[#B0B0B0]">Provinsi Terdata</p>
              <p className="text-base font-bold text-slate-900 dark:text-[#E0E0E0]">{overallStats.totalProvinces} Provinsi</p>
            </div>
          </div>

          {/* Card 2: Total Desa */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1E1E1E] border border-slate-200/80 dark:border-[#444444] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Building className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-[#B0B0B0]">Titik Desa</p>
              <p className="text-base font-bold text-slate-900 dark:text-[#E0E0E0]">{overallStats.totalVillages} Desa</p>
            </div>
          </div>

          {/* Card 3: Informan Terdata */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1E1E1E] border border-slate-200/80 dark:border-[#444444] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <UserCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-[#B0B0B0]">Informan Terdata</p>
              <p className="text-base font-bold text-slate-900 dark:text-[#E0E0E0]">
                {overallStats.filledInformants} <span className="text-xs font-normal text-slate-400">/ {overallStats.totalInformants}</span>
              </p>
            </div>
          </div>

          {/* Card 4: Kriteria Dialektologi */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1E1E1E] border border-slate-200/80 dark:border-[#444444] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-[#B0B0B0]">Sesuai Kriteria (25–65 th)</p>
              <p className="text-base font-bold text-slate-900 dark:text-[#E0E0E0]">
                {overallStats.validCriteriaCount} Penutur
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* FILTER PER PROVINSI & PER DESA */}
      <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#444444] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 transition-colors">
        
        {/* Search & Gender filter row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari nama responden, provinsi, nama desa, pekerjaan, atau bahasa..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#1E1E1E] border border-slate-200 dark:border-[#444444] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-[#E0E0E0] placeholder-slate-400 dark:placeholder-[#888888] focus:outline-hidden focus:border-indigo-600 dark:focus:border-sky-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-[#E0E0E0]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Gender Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#1E1E1E] p-1 rounded-xl text-xs self-start sm:self-auto border border-slate-200/80 dark:border-[#444444]">
            <button
              type="button"
              onClick={() => setGenderFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                genderFilter === 'all'
                  ? 'bg-white dark:bg-[#121212] text-indigo-700 dark:text-sky-300 shadow-2xs'
                  : 'text-slate-600 dark:text-[#B0B0B0] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Semua Gender
            </button>
            <button
              type="button"
              onClick={() => setGenderFilter('pria')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                genderFilter === 'pria'
                  ? 'bg-white dark:bg-[#121212] text-indigo-700 dark:text-sky-300 shadow-2xs'
                  : 'text-slate-600 dark:text-[#B0B0B0] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Laki-laki
            </button>
            <button
              type="button"
              onClick={() => setGenderFilter('wanita')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                genderFilter === 'wanita'
                  ? 'bg-white dark:bg-[#121212] text-indigo-700 dark:text-sky-300 shadow-2xs'
                  : 'text-slate-600 dark:text-[#B0B0B0] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Perempuan
            </button>
          </div>

        </div>

        {/* TINGKAT 1: BILAH PILIHAN PROVINSI */}
        <div className="pt-2 border-t border-slate-100 dark:border-[#444444]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#888888] flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-indigo-500 dark:text-sky-400" />
              <span>1. Filter Berdasarkan Provinsi:</span>
            </span>
            <span className="text-[11px] text-slate-400 dark:text-[#888888]">
              {allProvinces.length} Provinsi Aktif
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* All Provinces pill */}
            <button
              type="button"
              onClick={() => {
                setSelectedProvinceFilter('all');
                setSelectedVillageFilter('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                selectedProvinceFilter === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-[#1E1E1E] text-slate-700 dark:text-[#B0B0B0] border-slate-200 dark:border-[#444444] hover:border-indigo-300'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Semua Provinsi</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedProvinceFilter === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 dark:bg-[#444444] text-slate-700 dark:text-[#B0B0B0]'
              }`}>
                {overallStats.totalVillages} Desa
              </span>
            </button>

            {/* Individual Province Pills */}
            {allProvinces.map(provName => {
              const pg = provinceGroups.find(p => p.provinceName === provName);
              const villageCount = pg?.villages.length || 0;
              let infCount = 0;
              pg?.villages.forEach(v => {
                infCount += v.informants.filter(i => i.data.nama && i.data.nama.trim().length > 0).length;
              });
              const isSelected = selectedProvinceFilter === provName;

              return (
                <button
                  key={provName}
                  type="button"
                  onClick={() => {
                    setSelectedProvinceFilter(provName);
                    setSelectedVillageFilter('all');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-[#1E1E1E] text-slate-700 dark:text-[#B0B0B0] border-slate-200 dark:border-[#444444] hover:border-indigo-300'
                  }`}
                >
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span>{provName}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  }`}>
                    {villageCount} Desa • {infCount} Informan
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TINGKAT 2: BILAH PILIHAN DESA (Disesuaikan dengan Provinsi Terpilih) */}
        {availableVillages.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-[#444444]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#888888] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>2. Pilih Desa {selectedProvinceFilter !== 'all' ? `di ${selectedProvinceFilter}` : ''}:</span>
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedVillageFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                  selectedVillageFilter === 'all'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-slate-50 dark:bg-[#1E1E1E] text-slate-600 dark:text-[#B0B0B0] border-slate-200 dark:border-[#444444] hover:bg-slate-100'
                }`}
              >
                Semua Desa ({availableVillages.length})
              </button>

              {availableVillages.map(vName => {
                const isSelected = selectedVillageFilter === vName;
                return (
                  <button
                    key={vName}
                    type="button"
                    onClick={() => setSelectedVillageFilter(vName)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-slate-50 dark:bg-[#1E1E1E] text-slate-600 dark:text-[#B0B0B0] border-slate-200 dark:border-[#444444] hover:bg-slate-100'
                    }`}
                  >
                    Desa {vName}
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* PROVINCE-BY-PROVINCE & VILLAGE BENTO SECTIONS */}
      {filteredProvinceGroups.length === 0 ? (
        <div className="bg-white dark:bg-[#121212] border border-dashed border-slate-300 dark:border-[#444444] rounded-2xl p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#1E1E1E] text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-[#E0E0E0] mb-1">
            Tidak Ada Responden di Provinsi Ini
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#B0B0B0] max-w-sm mx-auto mb-4">
            Tidak ditemukan responden untuk kata kunci pencarian atau filter provinsi yang Anda pilih.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedProvinceFilter('all');
              setSelectedVillageFilter('all');
              setGenderFilter('all');
            }}
            className="px-4 py-2 bg-indigo-50 dark:bg-[#1E1E1E] text-indigo-700 dark:text-sky-300 hover:bg-indigo-100 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {filteredProvinceGroups.map(province => {
            let totalInfInProv = 0;
            let filledInfInProv = 0;
            province.villages.forEach(v => {
              totalInfInProv += v.informants.length;
              filledInfInProv += v.informants.filter(i => i.data.nama && i.data.nama.trim().length > 0).length;
            });

            return (
              <div 
                key={province.provinceName}
                className="space-y-6"
              >
                {/* PROVINCE BANNER HEADER */}
                <div className="bg-white dark:bg-[#121212] text-slate-900 dark:text-[#E0E0E0] rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200 dark:border-[#444444] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-[#1E1E1E] flex items-center justify-center text-indigo-600 dark:text-sky-400 border border-indigo-100 dark:border-[#444444] shrink-0 shadow-2xs">
                      <Globe2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-[#1E1E1E] text-indigo-700 dark:text-sky-300 border border-indigo-200/80 dark:border-[#444444] uppercase tracking-wider">
                          Wilayah Provinsi
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-[#E0E0E0]">
                          Provinsi {province.provinceName}
                        </h2>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-[#B0B0B0] mt-1">
                        Tercakup <strong className="text-slate-800 dark:text-[#E0E0E0]">{province.villages.length} Desa Titik Pengamatan</strong> • <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{filledInfInProv} dari {totalInfInProv} Informan Lengkap</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#1E1E1E] text-slate-700 dark:text-[#B0B0B0] text-xs font-semibold border border-slate-200 dark:border-[#444444] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-sky-400" />
                      <span>{province.villages.length} Titik Kuesioner</span>
                    </span>
                  </div>
                </div>

                {/* VILLAGES UNDER THIS PROVINCE */}
                <div className="space-y-6 pl-0 sm:pl-2">
                  {province.villages.map(village => {
                    const filledCount = village.informants.filter(i => i.data.nama && i.data.nama.trim().length > 0).length;

                    return (
                      <div 
                        key={village.villageName}
                        className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#444444] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5 transition-colors"
                      >
                        
                        {/* Village Sub-Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-[#444444] gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-sky-300 border border-indigo-200/60 dark:border-[#444444]">
                                Titik Pengamatan
                              </span>
                              <h3 className="text-lg font-bold text-slate-900 dark:text-[#E0E0E0]">
                                Desa {village.villageName}
                              </h3>
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                {filledCount} dari {village.informants.length} Informan Terdata
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-600 dark:text-[#B0B0B0] mt-1.5">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-indigo-500 dark:text-sky-400 shrink-0" />
                                <span>Kec. {village.kecamatan}, Kab. {village.kabupaten}</span>
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Languages className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span className="font-semibold text-slate-800 dark:text-[#E0E0E0]">{village.bahasa}</span>
                              </span>
                              <span>•</span>
                              <span className="text-slate-400 dark:text-[#888888]">
                                Peneliti: {village.createdByName}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenSurvey(village.surveyId)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-[#1E1E1E] hover:bg-indigo-50 dark:hover:bg-[#444444] text-indigo-600 dark:text-sky-400 border border-slate-200 dark:border-[#444444] rounded-xl text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto shrink-0"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Buka Formulir</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Bento Grid Informants inside this village */}
                        <div className="space-y-4">
                          {village.informants.map(({ data: n, index, surveyId }, iIdx) => {
                            const isFilled = Boolean(n.nama && n.nama.trim().length > 0);
                            const criteria = checkInformantCriteria(n);
                            const initials = isFilled 
                              ? n.nama.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() 
                              : `N${index + 1}`;

                            if (!isFilled) {
                              return (
                                <div 
                                  key={`inf-empty-${surveyId}-${index}-${iIdx}`}
                                  className="bg-slate-50/70 dark:bg-[#1E1E1E]/60 border border-dashed border-slate-300 dark:border-[#444444] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left transition-colors"
                                >
                                  <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-[#121212] text-slate-400 flex items-center justify-center font-bold text-xs shrink-0">
                                      N{index + 1}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                                        <h4 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-[#E0E0E0]">
                                          Informan Utama #{index + 1} (Belum Diinput)
                                        </h4>
                                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                          Kosong
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 dark:text-[#B0B0B0] mt-0.5">
                                        Slot narasumber ke-{index + 1} di Desa {village.villageName}, {province.provinceName}.
                                      </p>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleOpenSurvey(surveyId)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Isi Data Informan #{index + 1}</span>
                                  </button>
                                </div>
                              );
                            }

                            {/* Bento Grid Cards */}
                            return (
                              <div 
                                key={`inf-card-${surveyId}-${index}-${iIdx}`}
                                className="bg-slate-50/60 dark:bg-[#1E1E1E]/40 border border-slate-200/90 dark:border-[#444444] rounded-2xl p-4 sm:p-5 transition-all shadow-2xs hover:shadow-xs"
                              >
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                                  
                                  {/* BENTO CARD 1: HERO IDENTITAS & STATUS (Span 4) */}
                                  <div className="lg:col-span-4 bg-white dark:bg-[#121212] border border-slate-200/90 dark:border-[#444444] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
                                    <div>
                                      <div className="flex items-start justify-between gap-2 mb-3.5">
                                        <div className="flex items-center gap-3">
                                          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                                            {initials}
                                          </div>
                                          <div>
                                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-sky-400">
                                              Informan Utama #{index + 1}
                                            </span>
                                            <h4 className="text-base font-bold text-slate-900 dark:text-[#E0E0E0] leading-tight">
                                              {n.nama}
                                            </h4>
                                          </div>
                                        </div>

                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                          n.jenisKelamin === 'pria'
                                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200'
                                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200'
                                        }`}>
                                          {n.jenisKelamin === 'pria' ? 'Laki-laki' : n.jenisKelamin === 'wanita' ? 'Perempuan' : 'Gender -'}
                                        </span>
                                      </div>

                                      <div className="space-y-2 py-2 border-t border-slate-100 dark:border-[#444444] text-xs">
                                        <div className="flex items-center justify-between">
                                          <span className="text-slate-500 dark:text-[#888888] flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-indigo-500 dark:text-sky-400" />
                                            <span>Usia:</span>
                                          </span>
                                          <span className="font-bold text-slate-800 dark:text-[#E0E0E0]">
                                            {n.usia ? `${n.usia} Tahun` : '-'} {n.tahunKelahiran ? `(Lahir ${n.tahunKelahiran})` : ''}
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-slate-500 dark:text-[#888888] flex items-center gap-1.5">
                                            <Globe2 className="w-3.5 h-3.5 text-indigo-500 dark:text-sky-400" />
                                            <span>Provinsi:</span>
                                          </span>
                                          <span className="font-semibold text-slate-800 dark:text-[#E0E0E0]">
                                            {province.provinceName}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-[#1E1E1E] border border-slate-200/80 dark:border-[#444444] space-y-1.5 text-[11px]">
                                        <div className="font-bold text-slate-700 dark:text-[#E0E0E0] flex items-center justify-between">
                                          <span>Kriteria Dialektologi</span>
                                          {criteria.allPassed ? (
                                            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                              <CheckCircle2 className="w-3.5 h-3.5" /> Memenuhi
                                            </span>
                                          ) : (
                                            <span className="text-amber-600 dark:text-amber-400 font-medium">Perlu Cek</span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-[#B0B0B0]">
                                          <Check className={`w-3 h-3 ${criteria.isAgeValid ? 'text-emerald-600' : 'text-slate-300'}`} />
                                          <span>Usia 25–65 th ({n.usia || '-'} th)</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-[#B0B0B0]">
                                          <Check className={`w-3 h-3 ${criteria.isNativeBorn ? 'text-emerald-600' : 'text-slate-300'}`} />
                                          <span>Penutur asli Desa {village.villageName}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#444444] flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setActiveModalNarasumber({
                                          narasumber: n,
                                          villageName: village.villageName,
                                          provinceName: province.provinceName,
                                          surveyId: surveyId,
                                          index
                                        })}
                                        className="flex-1 py-1.5 px-2.5 bg-indigo-50 dark:bg-[#1E1E1E] hover:bg-indigo-100 dark:hover:bg-[#444444] text-indigo-700 dark:text-sky-300 rounded-lg text-xs font-semibold text-center transition-colors cursor-pointer flex items-center justify-center gap-1"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>Lihat Detail Lengkap</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenSurvey(surveyId)}
                                        className="p-1.5 bg-slate-100 dark:bg-[#1E1E1E] hover:bg-slate-200 dark:hover:bg-[#444444] text-slate-700 dark:text-[#B0B0B0] rounded-lg transition-colors cursor-pointer"
                                        title="Edit di Kuesioner (Layar 14)"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* BENTO CARD 2: SITUASI KEBAHASAAN (Span 4) */}
                                  <div className="lg:col-span-4 bg-white dark:bg-[#121212] border border-slate-200/90 dark:border-[#444444] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
                                    <div>
                                      <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-[#444444] mb-3">
                                        <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                                          <Languages className="w-4 h-4" />
                                        </div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-[#E0E0E0]">
                                          Situasi Kebahasaan
                                        </h4>
                                      </div>

                                      <div className="space-y-2.5 text-xs">
                                        <div>
                                          <span className="text-[11px] text-slate-500 dark:text-[#888888] block">Bahasa di Rumah (B1):</span>
                                          <span className="font-bold text-indigo-600 dark:text-sky-400 text-sm">
                                            {n.bahasaDigunakan?.diRumah || village.bahasa || '-'}
                                          </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-[#444444]">
                                          <div>
                                            <span className="text-[11px] text-slate-500 dark:text-[#888888] block">Di Masyarakat:</span>
                                            <span className="font-semibold text-slate-800 dark:text-[#E0E0E0] truncate block">
                                              {n.bahasaDigunakan?.diMasyarakat || '-'}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-[11px] text-slate-500 dark:text-[#888888] block">Di Tempat Kerja:</span>
                                            <span className="font-semibold text-slate-800 dark:text-[#E0E0E0] truncate block">
                                              {n.bahasaDigunakan?.diTempatKerja || '-'}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="pt-2 border-t border-slate-100 dark:border-[#444444]">
                                          <span className="text-[11px] text-slate-500 dark:text-[#888888] block mb-1.5">
                                            Bahasa Lain yang Dikuasai:
                                          </span>
                                          {n.bahasaLainDikuasai && n.bahasaLainDikuasai.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5">
                                              {n.bahasaLainDikuasai.map((b, bIdx) => (
                                                <span 
                                                  key={bIdx}
                                                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-[#1E1E1E] text-slate-800 dark:text-[#E0E0E0] border border-slate-200 dark:border-[#444444] flex items-center gap-1"
                                                >
                                                  <span>{b.namaBahasa}</span>
                                                  <span className="text-[9px] text-indigo-600 dark:text-sky-400 font-bold uppercase">
                                                    ({b.penguasaan})
                                                  </span>
                                                </span>
                                              ))}
                                            </div>
                                          ) : (
                                            <span className="text-slate-400 dark:text-[#888888] italic text-[11px]">
                                              Hanya bahasa daerah {village.bahasa} & Indonesia.
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="mt-3 pt-2 text-[11px] text-slate-400 dark:text-[#888888] flex items-center gap-1">
                                      <Sparkles className="w-3 h-3 text-indigo-500" />
                                      <span>Rujukan glos dialektologi {province.provinceName}</span>
                                    </div>
                                  </div>

                                  {/* BENTO CARD 3: SOSIODEMOGRAFI & ASAL USUL (Span 4) */}
                                  <div className="lg:col-span-4 bg-white dark:bg-[#121212] border border-slate-200/90 dark:border-[#444444] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
                                    <div>
                                      <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-[#444444] mb-3">
                                        <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                                          <Briefcase className="w-4 h-4" />
                                        </div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-[#E0E0E0]">
                                          Sosiodemografi & Asal
                                        </h4>
                                      </div>

                                      <div className="space-y-2 text-xs">
                                        <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-[#444444]">
                                          <span className="text-slate-500 dark:text-[#888888] flex items-center gap-1.5">
                                            <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Pekerjaan:
                                          </span>
                                          <span className="font-semibold text-slate-800 dark:text-[#E0E0E0] truncate max-w-[150px]">
                                            {n.pekerjaan?.sebagaiApa || '-'}
                                          </span>
                                        </div>

                                        <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-[#444444]">
                                          <span className="text-slate-500 dark:text-[#888888] flex items-center gap-1.5">
                                            <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> Pendidikan:
                                          </span>
                                          <span className="font-semibold text-slate-800 dark:text-[#E0E0E0]">
                                            {n.pendidikanTertinggi || '-'}
                                          </span>
                                        </div>

                                        <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-[#444444]">
                                          <span className="text-slate-500 dark:text-[#888888] flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> Asal Lahir:
                                          </span>
                                          <span className="font-semibold text-slate-800 dark:text-[#E0E0E0] truncate max-w-[150px]">
                                            {n.tempatLahir?.desa ? `Desa ${n.tempatLahir.desa}` : `Desa ${village.villageName}`}
                                          </span>
                                        </div>

                                        <div className="flex items-center justify-between py-1">
                                          <span className="text-slate-500 dark:text-[#888888] flex items-center gap-1.5">
                                            <Activity className="w-3.5 h-3.5 text-slate-400" /> Lama Tinggal:
                                          </span>
                                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                            {n.lamaTinggalTahun ? `${n.lamaTinggalTahun} Tahun` : 'Sejak Lahir'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#444444] flex items-center justify-between text-[11px]">
                                      <span className="text-slate-400 dark:text-[#888888]">Media Sosial:</span>
                                      <div className="flex items-center gap-1">
                                        {n.mediaSosial?.facebook && <span className="px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[9px]">FB</span>}
                                        {n.mediaSosial?.tiktok && <span className="px-1.5 py-0.2 rounded bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 font-bold text-[9px]">TikTok</span>}
                                        {n.mediaSosial?.instagram && <span className="px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[9px]">IG</span>}
                                        {!n.mediaSosial?.facebook && !n.mediaSosial?.tiktok && !n.mediaSosial?.instagram && (
                                          <span className="text-slate-400 italic">Jarang aktif</span>
                                        )}
                                      </div>
                                    </div>

                                  </div>

                                </div>
                              </div>
                            );
                          })}
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* DETAILED BENTO MODAL INSPECTOR */}
      {activeModalNarasumber && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#444444] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-[#444444]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {activeModalNarasumber.narasumber.nama.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#E0E0E0]">
                      {activeModalNarasumber.narasumber.nama}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-[#1E1E1E] text-indigo-700 dark:text-sky-300 border border-indigo-200 dark:border-[#444444]">
                      Informan #{activeModalNarasumber.index + 1}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-[#B0B0B0] mt-0.5">
                    Titik: <strong>Desa {activeModalNarasumber.villageName}</strong>, Provinsi <strong>{activeModalNarasumber.provinceName}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalNarasumber(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-[#E0E0E0] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Bento Sections */}
            <div className="py-4 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1E1E1E] border border-slate-200/80 dark:border-[#444444] space-y-2">
                  <h4 className="font-bold text-slate-800 dark:text-[#E0E0E0] flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    <span>Identitas Responden</span>
                  </h4>
                  <div className="space-y-1 text-slate-600 dark:text-[#B0B0B0]">
                    <div><strong>Usia:</strong> {activeModalNarasumber.narasumber.usia || '-'} Tahun</div>
                    <div><strong>Tahun Lahir:</strong> {activeModalNarasumber.narasumber.tahunKelahiran || '-'}</div>
                    <div><strong>Jenis Kelamin:</strong> {activeModalNarasumber.narasumber.jenisKelamin === 'pria' ? 'Laki-laki' : 'Perempuan'}</div>
                    <div><strong>Pendidikan:</strong> {activeModalNarasumber.narasumber.pendidikanTertinggi || '-'}</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1E1E1E] border border-slate-200/80 dark:border-[#444444] space-y-2">
                  <h4 className="font-bold text-slate-800 dark:text-[#E0E0E0] flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-amber-600" />
                    <span>Pekerjaan & Mobilitas</span>
                  </h4>
                  <div className="space-y-1 text-slate-600 dark:text-[#B0B0B0]">
                    <div><strong>Pekerjaan:</strong> {activeModalNarasumber.narasumber.pekerjaan?.sebagaiApa || '-'}</div>
                    <div><strong>Lokasi Kerja:</strong> {activeModalNarasumber.narasumber.pekerjaan?.lokasiBekerja || 'Dalam Desa'}</div>
                    <div><strong>Lama Tinggal:</strong> {activeModalNarasumber.narasumber.lamaTinggalTahun ? `${activeModalNarasumber.narasumber.lamaTinggalTahun} Tahun` : 'Sejak Lahir'}</div>
                    <div><strong>Mobilitas:</strong> {activeModalNarasumber.narasumber.frekuensiMobilitas || 'Jarang merantau'}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1E1E1E] border border-slate-200/80 dark:border-[#444444] text-xs space-y-2.5">
                <h4 className="font-bold text-slate-800 dark:text-[#E0E0E0] flex items-center gap-1.5">
                  <Languages className="w-4 h-4 text-emerald-600" />
                  <span>Domain Penggunaan Bahasa</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#444444]">
                    <span className="text-[10px] text-slate-400 block">Di Rumah (B1)</span>
                    <strong className="text-indigo-600 dark:text-sky-400 truncate block">
                      {activeModalNarasumber.narasumber.bahasaDigunakan?.diRumah || '-'}
                    </strong>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#444444]">
                    <span className="text-[10px] text-slate-400 block">Di Masyarakat</span>
                    <strong className="text-slate-800 dark:text-[#E0E0E0] truncate block">
                      {activeModalNarasumber.narasumber.bahasaDigunakan?.diMasyarakat || '-'}
                    </strong>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#444444]">
                    <span className="text-[10px] text-slate-400 block">Tempat Kerja</span>
                    <strong className="text-slate-800 dark:text-[#E0E0E0] truncate block">
                      {activeModalNarasumber.narasumber.bahasaDigunakan?.diTempatKerja || '-'}
                    </strong>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#444444]">
                    <span className="text-[10px] text-slate-400 block">Di Perjalanan</span>
                    <strong className="text-slate-800 dark:text-[#E0E0E0] truncate block">
                      {activeModalNarasumber.narasumber.bahasaDigunakan?.diPerjalanan || '-'}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1E1E1E] border border-slate-200/80 dark:border-[#444444] text-xs space-y-1.5">
                <h4 className="font-bold text-slate-800 dark:text-[#E0E0E0] flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>Tempat Lahir & Asal Wilayah</span>
                </h4>
                <p className="text-slate-600 dark:text-[#B0B0B0]">
                  Lahir di: <strong>Desa {activeModalNarasumber.narasumber.tempatLahir?.desa || activeModalNarasumber.villageName}</strong>, Kec. {activeModalNarasumber.narasumber.tempatLahir?.kecamatan || '-'}, Kab. {activeModalNarasumber.narasumber.tempatLahir?.kabupatenKota || '-'}, Provinsi {activeModalNarasumber.provinceName}
                </p>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="pt-3 border-t border-slate-200 dark:border-[#444444] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setActiveModalNarasumber(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-[#B0B0B0] hover:bg-slate-100 dark:hover:bg-[#1E1E1E] transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  const sId = activeModalNarasumber.surveyId;
                  setActiveModalNarasumber(null);
                  handleOpenSurvey(sId);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Buka Formulir untuk Mengedit Data Ini</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default DataRespondenView;
