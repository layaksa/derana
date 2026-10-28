import React, { useState, useMemo } from 'react';
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  ArrowRight, 
  Download, 
  Search, 
  UserCheck, 
  MapPin, 
  Award, 
  Info,
  TrendingUp
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { SurveyRecord, NarasumberData } from '../../types/linguistic';
import { useLanguage } from '../../contexts/LanguageContext';

export interface NarasumberStatsSummaryProps {
  surveys: SurveyRecord[];
  activeSurveyId?: string | null;
  onSelectSurvey?: (id: string) => void;
  onNavigateToSection?: (surveyId: string, sectionIndex: number) => void;
  onSwitchToEditor?: () => void;
  onNavigateToCorrelation?: () => void;
  onNavigateToAgeRegression?: () => void;
}

interface FlattenedInformant {
  id: number | string;
  surveyId: string;
  surveyTitle: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  bahasa: string;
  nama: string;
  jenisKelamin: 'pria' | 'wanita' | 'Laki-laki' | 'Perempuan' | '';
  usia: number;
  tahunKelahiran: number | null;
  pendidikanTertinggi: string;
  kategoriPendidikan: string;
  kelompokUsia: string;
  pekerjaan: string;
  lokasiKerja: string;
  lamaTinggal: number;
}

// Harmonize raw education string into standard Indonesian tiers
export function categorizeEducation(rawEdu: string): string {
  if (!rawEdu || typeof rawEdu !== 'string' || rawEdu.trim() === '') {
    return 'Belum Terdata';
  }
  const low = rawEdu.toLowerCase().trim();

  if (low.includes('tidak tamat') || low.includes('tidak sekolah') || low.includes('buta aksara') || low.includes('belum sekolah')) {
    return 'Tidak Sekolah / Tidak Tamat SD';
  }
  if (low.includes('sd') || low.includes('sr') || low.includes('sekolah dasar') || low.includes('sekolah rakyat') || low.includes('mi')) {
    return 'SD / MI Sederajat';
  }
  if (low.includes('smp') || low.includes('mts') || low.includes('sltp') || low.includes('menengah pertama')) {
    return 'SMP / MTs Sederajat';
  }
  if (low.includes('sma') || low.includes('smk') || low.includes('ma') || low.includes('slta') || low.includes('smea') || low.includes('stm') || low.includes('menengah atas')) {
    return 'SMA / SMK Sederajat';
  }
  if (low.includes('diploma') || low.includes('d1') || low.includes('d2') || low.includes('d3') || low.includes('d4') || low.includes('akademi')) {
    return 'Diploma (D1–D4)';
  }
  if (low.includes('s1') || low.includes('sarjana') || low.includes('perguruan tinggi') || low.includes('universitas') || low.includes('institut')) {
    return 'Sarjana (S1)';
  }
  if (low.includes('s2') || low.includes('s3') || low.includes('magister') || low.includes('doktor') || low.includes('master')) {
    return 'Pascasarjana (S2/S3)';
  }

  return 'Lainnya / Setara';
}

// Categorize age based on standard dialectological criteria
export function categorizeAge(age: number): {
  key: string;
  labelId: string;
  labelEn: string;
  subId: string;
  subEn: string;
  order: number;
} {
  if (age < 30) {
    return {
      key: 'under_30',
      labelId: '< 30 Tahun',
      labelEn: '< 30 Years',
      subId: 'Generasi Muda',
      subEn: 'Younger Gen',
      order: 1
    };
  }
  if (age <= 44) {
    return {
      key: '30_44',
      labelId: '30 – 44 Tahun',
      labelEn: '30 – 44 Years',
      subId: 'Dewasa Muda',
      subEn: 'Young Adults',
      order: 2
    };
  }
  if (age <= 59) {
    return {
      key: '45_59',
      labelId: '45 – 59 Tahun',
      labelEn: '45 – 59 Years',
      subId: 'Dewasa Madya (Usia Ideal Dialektologi)',
      subEn: 'Core Informants (Dialectology Target)',
      order: 3
    };
  }
  return {
    key: '60_plus',
    labelId: '≥ 60 Tahun',
    labelEn: '≥ 60 Years',
    subId: 'Lansia / Penutur Tradisional',
    subEn: 'Senior / Traditional Native Speakers',
    order: 4
  };
}

const EDU_COLORS: Record<string, string> = {
  'Tidak Sekolah / Tidak Tamat SD': '#94a3b8',
  'SD / MI Sederajat': '#f59e0b',
  'SMP / MTs Sederajat': '#3b82f6',
  'SMA / SMK Sederajat': '#6366f1',
  'Diploma (D1–D4)': '#8b5cf6',
  'Sarjana (S1)': '#10b981',
  'Pascasarjana (S2/S3)': '#06b6d4',
  'Lainnya / Setara': '#ec4899',
  'Belum Terdata': '#cbd5e1'
};

export const NarasumberStatsSummary: React.FC<NarasumberStatsSummaryProps> = ({
  surveys,
  activeSurveyId,
  onSelectSurvey,
  onNavigateToSection,
  onSwitchToEditor,
  onNavigateToCorrelation,
  onNavigateToAgeRegression
}) => {
  const { isIndonesian } = useLanguage();

  // Filters state
  const [selectedSurveyFilter, setSelectedSurveyFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'pria' | 'wanita'>('all');
  const [eduFilter, setEduFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 1. Flatten all informants across surveys
  const allInformants = useMemo<FlattenedInformant[]>(() => {
    const list: FlattenedInformant[] = [];

    surveys.forEach((survey) => {
      const nList = survey.data?.narasumberList || [];
      const desa = survey.desa || survey.data?.titikPengamatan?.namaDesa || 'Desa Tanpa Nama';
      const kec = survey.kecamatan || survey.data?.titikPengamatan?.kecamatan || '-';
      const kab = survey.kabupatenKota || survey.data?.titikPengamatan?.kabupatenKota || '-';
      const prov = survey.provinsi || survey.data?.titikPengamatan?.provinsi || 'Jawa Barat';
      const bahasa = survey.bahasa || survey.data?.titikPengamatan?.bahasaDigunakan || 'Bahasa Daerah';

      nList.forEach((n: NarasumberData, idx: number) => {
        // Must have at least a name, age, or education to be counted as recorded
        const hasName = Boolean(n.nama && n.nama.trim() !== '');
        const hasAge = Boolean(n.usia && Number(n.usia) > 0);
        const hasEdu = Boolean(n.pendidikanTertinggi && n.pendidikanTertinggi.trim() !== '');

        if (hasName || hasAge || hasEdu) {
          const ageNum = Number(n.usia) || 0;
          const birthYear = Number(n.tahunKelahiran) || null;
          const rawEdu = n.pendidikanTertinggi || '';
          const eduCat = categorizeEducation(rawEdu);
          const ageCat = ageNum > 0 ? categorizeAge(ageNum) : null;
          const residency = Number(n.lamaTinggalTahun) || ageNum;

          list.push({
            id: `${survey.id}_ns_${idx + 1}`,
            surveyId: survey.id,
            surveyTitle: survey.title,
            desa,
            kecamatan: kec,
            kabupaten: kab,
            provinsi: prov,
            bahasa,
            nama: n.nama?.trim() || `Informan #${idx + 1} (${desa})`,
            jenisKelamin: n.jenisKelamin || '',
            usia: ageNum,
            tahunKelahiran: birthYear,
            pendidikanTertinggi: rawEdu || 'Belum Diisi',
            kategoriPendidikan: eduCat,
            kelompokUsia: ageCat ? (isIndonesian ? ageCat.labelId : ageCat.labelEn) : (isIndonesian ? 'Belum Terdata' : 'Not Recorded'),
            pekerjaan: n.pekerjaan?.sebagaiApa?.trim() || 'Masyarakat Lokal',
            lokasiKerja: n.pekerjaan?.lokasiBekerja?.trim() || desa,
            lamaTinggal: residency
          });
        }
      });
    });

    return list;
  }, [surveys, isIndonesian]);

  // 2. Filter informants based on UI selections
  const filteredInformants = useMemo(() => {
    return allInformants.filter((inf) => {
      // Survey filter
      if (selectedSurveyFilter !== 'all' && inf.surveyId !== selectedSurveyFilter) {
        return false;
      }
      // Gender filter
      if (genderFilter !== 'all') {
        const normGen = inf.jenisKelamin.toLowerCase();
        if (genderFilter === 'pria' && normGen !== 'pria' && normGen !== 'laki-laki') return false;
        if (genderFilter === 'wanita' && normGen !== 'wanita' && normGen !== 'perempuan') return false;
      }
      // Education category filter
      if (eduFilter !== 'all' && inf.kategoriPendidikan !== eduFilter) {
        return false;
      }
      // Search term
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        const matches = 
          inf.nama.toLowerCase().includes(q) ||
          inf.desa.toLowerCase().includes(q) ||
          inf.pekerjaan.toLowerCase().includes(q) ||
          inf.pendidikanTertinggi.toLowerCase().includes(q) ||
          inf.bahasa.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [allInformants, selectedSurveyFilter, genderFilter, eduFilter, searchTerm]);

  // 3. Key Demographic KPIs
  const kpis = useMemo(() => {
    const total = filteredInformants.length;
    const validAges = filteredInformants.map(i => i.usia).filter(u => u > 0);

    const meanAge = validAges.length > 0 
      ? Math.round(validAges.reduce((a, b) => a + b, 0) / validAges.length) 
      : 0;

    const minAge = validAges.length > 0 ? Math.min(...validAges) : 0;
    const maxAge = validAges.length > 0 ? Math.max(...validAges) : 0;

    // Median age
    let medianAge = 0;
    if (validAges.length > 0) {
      const sorted = [...validAges].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      medianAge = sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
    }

    // Gender counts
    let maleCount = 0;
    let femaleCount = 0;
    filteredInformants.forEach(i => {
      const g = i.jenisKelamin.toLowerCase();
      if (g === 'pria' || g === 'laki-laki') maleCount++;
      else if (g === 'wanita' || g === 'perempuan') femaleCount++;
    });

    const malePct = total > 0 ? Math.round((maleCount / total) * 100) : 0;
    const femalePct = total > 0 ? Math.round((femaleCount / total) * 100) : 0;

    // Dominant Education Level
    const eduFreq = new Map<string, number>();
    filteredInformants.forEach(i => {
      const cat = i.kategoriPendidikan;
      eduFreq.set(cat, (eduFreq.get(cat) || 0) + 1);
    });

    let dominantEdu = 'Belum Ada';
    let dominantCount = 0;
    eduFreq.forEach((count, cat) => {
      if (count > dominantCount && cat !== 'Belum Terdata') {
        dominantCount = count;
        dominantEdu = cat;
      }
    });
    const dominantPct = total > 0 && dominantCount > 0 ? Math.round((dominantCount / total) * 100) : 0;

    // Average residency in village
    const validResidency = filteredInformants.map(i => i.lamaTinggal).filter(r => r > 0);
    const avgResidency = validResidency.length > 0
      ? Math.round(validResidency.reduce((a, b) => a + b, 0) / validResidency.length)
      : 0;

    // Dialectology prime age group (45–65 years)
    const primeCount = filteredInformants.filter(i => i.usia >= 40 && i.usia <= 65).length;
    const primePct = total > 0 ? Math.round((primeCount / total) * 100) : 0;

    return {
      total,
      meanAge,
      minAge,
      maxAge,
      medianAge,
      maleCount,
      femaleCount,
      malePct,
      femalePct,
      dominantEdu,
      dominantCount,
      dominantPct,
      avgResidency,
      primeCount,
      primePct
    };
  }, [filteredInformants]);

  // 4. Age Distribution Chart Data (Age Brackets)
  const ageDistributionData = useMemo(() => {
    const brackets = [
      { key: 'under_30', label: isIndonesian ? '< 30 Thn' : '< 30 Yrs', sub: isIndonesian ? 'Muda (<30)' : 'Young (<30)', total: 0, pria: 0, wanita: 0 },
      { key: '30_44', label: isIndonesian ? '30–44 Thn' : '30–44 Yrs', sub: isIndonesian ? 'Dewasa Muda' : 'Young Adult', total: 0, pria: 0, wanita: 0 },
      { key: '45_59', label: isIndonesian ? '45–59 Thn' : '45–59 Yrs', sub: isIndonesian ? 'Usia Ideal (45–59)' : 'Core Informants', total: 0, pria: 0, wanita: 0 },
      { key: '60_plus', label: isIndonesian ? '≥ 60 Thn' : '≥ 60 Yrs', sub: isIndonesian ? 'Tetua / Lansia' : 'Elders / Senior', total: 0, pria: 0, wanita: 0 }
    ];

    filteredInformants.forEach(i => {
      const u = i.usia;
      if (u <= 0) return;

      const normG = i.jenisKelamin.toLowerCase();
      const isM = normG === 'pria' || normG === 'laki-laki';
      const isF = normG === 'wanita' || normG === 'perempuan';

      if (u < 30) {
        brackets[0].total++;
        if (isM) brackets[0].pria++;
        if (isF) brackets[0].wanita++;
      } else if (u <= 44) {
        brackets[1].total++;
        if (isM) brackets[1].pria++;
        if (isF) brackets[1].wanita++;
      } else if (u <= 59) {
        brackets[2].total++;
        if (isM) brackets[2].pria++;
        if (isF) brackets[2].wanita++;
      } else {
        brackets[3].total++;
        if (isM) brackets[3].pria++;
        if (isF) brackets[3].wanita++;
      }
    });

    const totalValid = brackets.reduce((sum, b) => sum + b.total, 0);

    return brackets.map(b => ({
      ...b,
      persentase: totalValid > 0 ? Math.round((b.total / totalValid) * 100) : 0
    }));
  }, [filteredInformants, isIndonesian]);

  // 5. Educational Background Distribution Chart Data
  const educationDistributionData = useMemo(() => {
    const counts = new Map<string, number>();

    filteredInformants.forEach(i => {
      const cat = i.kategoriPendidikan;
      counts.set(cat, (counts.get(cat) || 0) + 1);
    });

    const orderedCategories = [
      'Tidak Sekolah / Tidak Tamat SD',
      'SD / MI Sederajat',
      'SMP / MTs Sederajat',
      'SMA / SMK Sederajat',
      'Diploma (D1–D4)',
      'Sarjana (S1)',
      'Pascasarjana (S2/S3)',
      'Lainnya / Setara',
      'Belum Terdata'
    ];

    const total = filteredInformants.length;

    return orderedCategories
      .map(category => {
        const count = counts.get(category) || 0;
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        return {
          category,
          shortName: category.split('/')[0].trim(),
          count,
          percentage,
          color: EDU_COLORS[category] || '#64748b'
        };
      })
      .filter(item => item.count > 0);
  }, [filteredInformants]);

  // 6. Educational Donut Chart Data (Top 5 + Lainnya)
  const educationDonutData = useMemo(() => {
    return educationDistributionData.map(item => ({
      name: item.shortName,
      value: item.count,
      percentage: item.percentage,
      color: item.color
    }));
  }, [educationDistributionData]);

  // 7. CSV Export Function
  const handleExportCSV = () => {
    if (filteredInformants.length === 0) return;

    const headers = [
      'No',
      'Nama Narasumber',
      'Desa / Titik Pengamatan',
      'Kecamatan',
      'Kabupaten / Kota',
      'Provinsi',
      'Bahasa Daerah',
      'Jenis Kelamin',
      'Usia (Tahun)',
      'Kelompok Usia',
      'Tahun Kelahiran',
      'Pendidikan Tertinggi',
      'Kategori Pendidikan',
      'Pekerjaan',
      'Lokasi Bekerja',
      'Lama Tinggal (Tahun)'
    ];

    const rows = filteredInformants.map((inf, idx) => [
      idx + 1,
      `"${inf.nama}"`,
      `"${inf.desa}"`,
      `"${inf.kecamatan}"`,
      `"${inf.kabupaten}"`,
      `"${inf.provinsi}"`,
      `"${inf.bahasa}"`,
      `"${inf.jenisKelamin}"`,
      inf.usia || '',
      `"${inf.kelompokUsia}"`,
      inf.tahunKelahiran || '',
      `"${inf.pendidikanTertinggi}"`,
      `"${inf.kategoriPendidikan}"`,
      `"${inf.pekerjaan}"`,
      `"${inf.lokasiKerja}"`,
      inf.lamaTinggal || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `statistik_narasumber_dialektometri_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInformantSurvey = (surveyId: string) => {
    if (onSelectSurvey) {
      onSelectSurvey(surveyId);
    }
    if (onNavigateToSection) {
      // Section 14 is Narasumber (index 13)
      onNavigateToSection(surveyId, 13);
    } else if (onSwitchToEditor) {
      onSwitchToEditor();
    }
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 animate-in fade-in duration-200">
      {/* 1. Header Banner & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/60 p-6 sm:p-8 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 lg:gap-8">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100/50 dark:border-indigo-900/30">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-baseline gap-3">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                  {isIndonesian ? 'Ringkasan Statistik Demografi Narasumber' : 'Informant Demographic Statistics Summary'}
                </h2>
                <span className="px-3 py-1 rounded-lg text-[10px] font-bold bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100/60 dark:border-indigo-900/40 whitespace-nowrap">
                  {kpis.total} {isIndonesian ? 'Narasumber' : 'Informants'}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed max-w-2xl">
                {isIndonesian 
                  ? 'Analisis distribusi usia, latar belakang pendidikan, dan profil demografi penutur jati bahasa daerah dari seluruh instrumen survei kuesioner.'
                  : 'Analysis of age distribution, educational background, and demographic profile of native speakers across all survey questionnaires.'}
              </p>
            </div>
          </div>

          {/* Quick Actions: Export CSV & Correlation Analysis */}
          <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end shrink-0">
            {onNavigateToCorrelation && (
              <button
                type="button"
                onClick={onNavigateToCorrelation}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors shadow-2xs cursor-pointer"
                title="Buka Analisis Korelasi Pendidikan vs Variasi Dialek (Scatter Plot Recharts)"
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Korelasi Pendidikan</span>
              </button>
            )}
            {onNavigateToAgeRegression && (
              <button
                type="button"
                onClick={onNavigateToAgeRegression}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 transition-colors shadow-2xs cursor-pointer"
                title="Buka Analisis Regresi Usia vs Variabel Bahasa (Grafik Tren Recharts)"
              >
                <TrendingUp className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Regresi Usia & Dialek</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={filteredInformants.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              title={isIndonesian ? 'Ekspor seluruh data narasumber ke format CSV' : 'Export all informant records to CSV'}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isIndonesian ? 'Ekspor CSV' : 'Export CSV'}</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/50">
          {/* Survey Point Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
              <span>{isIndonesian ? 'Titik Pengamatan' : 'Survey Point'}</span>
            </label>
            <select
              value={selectedSurveyFilter}
              onChange={(e) => setSelectedSurveyFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 text-sm font-medium focus:ring-2 focus:ring-indigo-400/50 transition-all"
            >
              <option value="all">
                {isIndonesian ? `Semua Kuesioner (${surveys.length})` : `All (${surveys.length})`}
              </option>
              {surveys.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.desa ? `Desa ${s.desa}` : s.title}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span>{isIndonesian ? 'Jenis Kelamin' : 'Gender'}</span>
            </label>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-400/50 transition-all"
            >
              <option value="all">{isIndonesian ? 'Semua' : 'All'}</option>
              <option value="pria">{isIndonesian ? 'Pria' : 'Male'}</option>
              <option value="wanita">{isIndonesian ? 'Wanita' : 'Female'}</option>
            </select>
          </div>

          {/* Education Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span>{isIndonesian ? 'Pendidikan' : 'Education'}</span>
            </label>
            <select
              value={eduFilter}
              onChange={(e) => setEduFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-400/50 transition-all"
            >
              <option value="all">{isIndonesian ? 'Semua Jenjang' : 'All'}</option>
              {educationDistributionData.map(edu => (
                <option key={edu.category} value={edu.category}>
                  {edu.shortName} ({edu.count})
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              <span>{isIndonesian ? 'Cari' : 'Search'}</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isIndonesian ? 'Nama, desa...' : 'Name, village...'}
                className="w-full px-3 py-2 rounded-lg border border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium focus:ring-2 focus:ring-slate-400/50 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-lg cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Demographic KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: Total Informants */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">{isIndonesian ? 'Total Informan' : 'Total Informants'}</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-blue-950 dark:text-blue-100">{kpis.total}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{isIndonesian ? 'orang' : 'people'}</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>{isIndonesian ? 'Rata-rata per titik' : 'Avg per survey'}:</span>
            <strong className="text-blue-700 dark:text-blue-400">
              {surveys.length > 0 ? (kpis.total / surveys.length).toFixed(1) : 0} / 3
            </strong>
          </div>
        </div>

        {/* Card 2: Rata-Rata Usia */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">{isIndonesian ? 'Rata-Rata Usia' : 'Average Age'}</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-amber-950 dark:text-amber-100">{kpis.meanAge}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{isIndonesian ? 'tahun' : 'years'}</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>{isIndonesian ? 'Rentang Usia' : 'Age Range'}:</span>
            <strong className="text-amber-700 dark:text-amber-400">
              {kpis.minAge} – {kpis.maxAge} {isIndonesian ? 'thn' : 'yrs'}
            </strong>
          </div>
        </div>

        {/* Card 3: Pendidikan Dominan */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">{isIndonesian ? 'Pendidikan Terbanyak' : 'Dominant Education'}</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-sm font-bold text-emerald-950 dark:text-emerald-100 truncate" title={kpis.dominantEdu}>
              {kpis.dominantEdu}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-between">
              <span>{isIndonesian ? 'Proporsi' : 'Share'}:</span>
              <strong className="text-emerald-700 dark:text-emerald-400">
                {kpis.dominantCount} orang ({kpis.dominantPct}%)
              </strong>
            </div>
          </div>
        </div>

        {/* Card 4: Rasio Gender */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">{isIndonesian ? 'Komposisi Gender' : 'Gender Ratio'}</span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <span className="text-base font-bold text-purple-950 dark:text-purple-100">♂ {kpis.malePct}%</span>
              <span className="text-[10px] text-slate-400 ml-1">({kpis.maleCount})</span>
            </div>
            <div>
              <span className="text-base font-bold text-purple-950 dark:text-purple-100">♀ {kpis.femalePct}%</span>
              <span className="text-[10px] text-slate-400 ml-1">({kpis.femaleCount})</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2 flex">
            <div className="bg-indigo-600 h-full" style={{ width: `${kpis.malePct}%` }} title={`Pria: ${kpis.malePct}%`} />
            <div className="bg-pink-500 h-full" style={{ width: `${kpis.femalePct}%` }} title={`Wanita: ${kpis.femalePct}%`} />
          </div>
        </div>

        {/* Card 5: Kepatuhan Usia Ideal Dialektologi */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs col-span-2 lg:col-span-1 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">{isIndonesian ? 'Kriteria Dialektologi' : 'Dialectology Criteria'}</span>
            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-sky-950 dark:text-sky-100">{kpis.primePct}%</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{isIndonesian ? 'usia ideal' : 'ideal age'}</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>{isIndonesian ? 'Rerata Domisili' : 'Avg Residency'}:</span>
            <strong className="text-sky-700 dark:text-sky-400">
              {kpis.avgResidency} {isIndonesian ? 'thn' : 'yrs'}
            </strong>
          </div>
        </div>
      </div>

      {/* 3. DUA GRAFIK UTAMA: DISTRIBUSI USIA & LATAR BELAKANG PENDIDIKAN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Chart: Grafik Distribusi Kelompok Usia */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {isIndonesian ? 'Distribusi Kelompok Usia Narasumber' : 'Informant Age Group Distribution'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isIndonesian 
                  ? 'Pengelompokan informan menurut rentang usia penutur jati (Badan Bahasa / Guiter).' 
                  : 'Categorization of informants according to dialectological age brackets.'}
              </p>
            </div>
          </div>

          <div className="h-68 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ageDistributionData}
                margin={{ top: 10, right: 15, left: -15, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b833" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 11, fill: '#94a3b8' }} 
                />
                <YAxis 
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }} 
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length > 0 && payload[0]?.payload) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-xl border border-slate-800 space-y-1.5 min-w-44">
                          <div className="font-bold text-amber-300">{d.label}</div>
                          <div className="text-[11px] text-slate-300">{d.sub}</div>
                          <div className="pt-1.5 border-t border-slate-800 flex justify-between font-semibold">
                            <span>{isIndonesian ? 'Total Informan' : 'Total Informants'}:</span>
                            <span className="text-white">{d.total} ({d.persentase}%)</span>
                          </div>
                          <div className="text-[11px] flex justify-between text-slate-400">
                            <span>♂ {isIndonesian ? 'Pria' : 'Male'}: {d.pria}</span>
                            <span>♀ {isIndonesian ? 'Wanita' : 'Female'}: {d.wanita}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                <Bar 
                  dataKey="pria" 
                  name={isIndonesian ? 'Pria / Laki-laki' : 'Male'} 
                  fill="#4f46e5" 
                  stackId="a" 
                  radius={[0, 0, 0, 0]} 
                />
                <Bar 
                  dataKey="wanita" 
                  name={isIndonesian ? 'Wanita / Perempuan' : 'Female'} 
                  fill="#ec4899" 
                  stackId="a" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Age Distribution Insight Box */}
          <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-start gap-2">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <p>
                {isIndonesian 
                  ? 'Dalam dialektologi, narasumber berusia 45–60 tahun (Dewasa Madya) dianggap paling representatif karena telah menguasai leksikon lokal secara stabil dan minim pengaruh alih-kode bahasa modern.'
                  : 'In dialectology, informants aged 45–60 years represent the most reliable baseline as they possess stable vernacular vocabulary with minimal modern code-switching.'}
              </p>
            </div>
            {onNavigateToAgeRegression && (
              <button
                type="button"
                onClick={onNavigateToAgeRegression}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] shadow-2xs transition-colors cursor-pointer"
              >
                <TrendingUp className="w-3 h-3 text-teal-200" />
                <span>Uji Regresi Usia (Grafik Tren) ↗</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Chart: Grafik Distribusi Latar Belakang Pendidikan */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {isIndonesian ? 'Distribusi Latar Belakang Pendidikan' : 'Educational Background Distribution'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isIndonesian 
                  ? 'Proporsi jenjang pendidikan formal narasumber yang diwawancarai.' 
                  : 'Proportion of formal education completed by interviewed informants.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Donut Chart: 5 Cols */}
            <div className="sm:col-span-5 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={educationDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {educationDonutData.map((entry, index) => (
                      <Cell key={`edu-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length > 0 && payload[0]?.payload) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-lg border border-slate-800">
                            <div className="font-bold">{d.name}</div>
                            <div className="text-[11px] text-emerald-300 font-semibold mt-0.5">
                              {d.value} {isIndonesian ? 'informan' : 'informants'} ({d.percentage}%)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Educational Breakdown Progress Bars: 7 Cols */}
            <div className="sm:col-span-7 space-y-2 text-xs">
              {educationDistributionData.map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]" title={item.category}>
                      {item.category}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 shrink-0 ml-2">
                      {item.count} <span className="text-slate-400 font-normal">({item.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: item.color 
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education Insight Box */}
          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-[11px] text-emerald-900 dark:text-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-start gap-2">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <p>
                {isIndonesian 
                  ? 'Informan berpendidikan dasar (SD/SMP) umumnya memiliki kosakata ragam akrab / lokal murni yang tinggi, sementara lulusan SMA / Sarjana memperkaya terminologi kebahasaan formal dan struktur frasa.'
                  : 'Informants with primary education typically preserve archaic vernacular terms, while secondary/higher education informants provide articulate formal structures.'}
              </p>
            </div>
            {onNavigateToCorrelation && (
              <button
                type="button"
                onClick={onNavigateToCorrelation}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shrink-0 cursor-pointer shadow-2xs transition-colors self-start sm:self-auto"
              >
                <span>Lihat Scatter Plot Korelasi</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. TABEL RINCI DATA NARASUMBER DENGAN FILTER & SEARCH */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {isIndonesian ? 'Daftar Rinci Narasumber Antar-Kuesioner' : 'Detailed Informant Roster Across Surveys'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isIndonesian 
                  ? `Menampilkan ${filteredInformants.length} dari total ${allInformants.length} narasumber terdata.`
                  : `Displaying ${filteredInformants.length} of ${allInformants.length} recorded informants.`}
              </p>
            </div>
          </div>

          {/* Status summary pill */}
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
            {isIndonesian ? 'Terverifikasi Lapangan' : 'Field Verified'}
          </span>
        </div>

        {filteredInformants.length === 0 ? (
          <div className="p-10 text-center text-slate-400 space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold">
              {isIndonesian ? 'Tidak ada narasumber yang cocok dengan kriteria filter.' : 'No informants match the filter criteria.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedSurveyFilter('all');
                setGenderFilter('all');
                setEduFilter('all');
                setSearchTerm('');
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 underline font-semibold cursor-pointer"
            >
              {isIndonesian ? 'Reset Filter Pencarian' : 'Reset Search Filters'}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">{isIndonesian ? 'Nama Informan' : 'Informant Name'}</th>
                  <th className="py-3 px-4">{isIndonesian ? 'Titik Desa & Bahasa' : 'Village & Language'}</th>
                  <th className="py-3 px-4">{isIndonesian ? 'Gender & Usia' : 'Gender & Age'}</th>
                  <th className="py-3 px-4">{isIndonesian ? 'Pendidikan Tertinggi' : 'Education'}</th>
                  <th className="py-3 px-4">{isIndonesian ? 'Pekerjaan / Jabatan' : 'Occupation / Role'}</th>
                  <th className="py-3 px-4">{isIndonesian ? 'Domisili' : 'Residency'}</th>
                  <th className="py-3 px-4 text-center">{isIndonesian ? 'Aksi' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInformants.map((inf, idx) => {
                  const isMale = inf.jenisKelamin.toLowerCase() === 'pria' || inf.jenisKelamin.toLowerCase() === 'laki-laki';
                  const isFemale = inf.jenisKelamin.toLowerCase() === 'wanita' || inf.jenisKelamin.toLowerCase() === 'perempuan';

                  return (
                    <tr 
                      key={inf.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-center text-slate-400 font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {inf.nama}
                        </div>
                        {inf.tahunKelahiran && (
                          <div className="text-[11px] text-slate-400">
                            {isIndonesian ? 'Lahir thn' : 'Born in'} {inf.tahunKelahiran}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-indigo-700 dark:text-indigo-400">
                          Desa {inf.desa}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {inf.bahasa} • {inf.kabupaten}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <span className={`inline-block w-2 h-2 rounded-full ${isMale ? 'bg-indigo-500' : isFemale ? 'bg-pink-500' : 'bg-slate-400'}`} />
                          <span>{inf.usia > 0 ? `${inf.usia} thn` : '-'}</span>
                          <span className="text-[10px] text-slate-400">
                            ({isMale ? 'Pria' : isFemale ? 'Wanita' : 'N/A'})
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {inf.kelompokUsia}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {inf.kategoriPendidikan}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[180px]" title={inf.pendidikanTertinggi}>
                          {inf.pendidikanTertinggi}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-700 dark:text-slate-300">
                          {inf.pekerjaan}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {inf.lokasiKerja}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {inf.lamaTinggal} {isIndonesian ? 'thn' : 'yrs'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {inf.lamaTinggal >= inf.usia && inf.usia > 0 
                            ? (isIndonesian ? 'Sejak Lahir' : 'Native Born') 
                            : (isIndonesian ? 'Menetap' : 'Resident')}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenInformantSurvey(inf.surveyId)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                          title={isIndonesian ? 'Buka formulir Seksi 14 Narasumber untuk kuesioner ini' : 'Open Section 14 Informant form for this questionnaire'}
                        >
                          <span>{isIndonesian ? 'Buka Profil' : 'View Profile'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
