import React, { useState, useMemo } from 'react';
import {
  SurveyRecord,
  DifferenceCategory,
  NarasumberData,
  KosakataItem
} from '../../types/linguistic';
import { SWADESH_200_GLOS } from '../../data/swadeshList';
import { classifyWordPair } from '../../utils/dialectometryComparator';
import { alignPhoneticSegments, AlignedPhoneticResult } from '../../utils/phoneticSegmentAligner';
import { PhoneticSegmentVisualizer } from '../sections/PhoneticSegmentVisualizer';
import { calculateDistanceKm } from '../../utils/calculations';
import { categorizeEducation } from '../dashboard/NarasumberStatsSummary';
import { 
  getSampleSurveyCikaso, 
  getSampleSurveyRancabuaya, 
  getSampleSurveyPangandaran 
} from '../../data/sampleSurveyData';
import { createRecordFromData } from '../../utils/surveyStorage';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  ArrowLeftRight,
  Search,
  Filter,
  Download,
  Printer,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  FileSpreadsheet,
  Users,
  MapPin,
  Mountain,
  Waves,
  Briefcase,
  GraduationCap,
  Calendar,
  ExternalLink,
  ChevronDown,
  Volume2,
  Scale,
  Eye,
  Columns,
  Layers,
  HelpCircle,
  Clock,
  Radio,
  Check,
  Copy,
  FileText,
  Globe
} from 'lucide-react';

export interface SideBySideSurveyComparisonProps {
  surveys: SurveyRecord[];
  activeSurveyId?: string;
  onNavigateToForm?: (surveyId: string) => void;
  onOpenRegionalReport?: () => void;
  onNavigateToPetaSurvei?: () => void;
  onNavigateToPetaCarto?: () => void;
}

export interface SideBySideWordRow {
  no: number;
  glos: string;
  bentuk1: string;
  ipa1: string;
  audio1?: string;
  catatan1?: string;
  bentuk2: string;
  ipa2: string;
  audio2?: string;
  catatan2?: string;
  category: DifferenceCategory;
  note: string;
  phoneticAlignment: AlignedPhoneticResult;
  isOverridden?: boolean;
}

export const SideBySideSurveyComparison: React.FC<SideBySideSurveyComparisonProps> = ({
  surveys,
  activeSurveyId,
  onNavigateToForm,
  onOpenRegionalReport,
  onNavigateToPetaSurvei,
  onNavigateToPetaCarto
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  // Ensure we have at least 2 surveys available by supplementing with sample surveys if needed
  const availableSurveys = useMemo<SurveyRecord[]>(() => {
    if (surveys.length >= 2) {
      return surveys;
    }
    // If only 1 or 0 survey, create full sample records so user can always compare
    const samples: SurveyRecord[] = [
      createRecordFromData('sample-cikaso', getSampleSurveyCikaso(), {
        customTitle: 'Desa Cikaso - Basa Sunda Priangan Kidul'
      }),
      createRecordFromData('sample-rancabuaya', getSampleSurveyRancabuaya(), {
        customTitle: 'Desa Rancabuaya - Basa Sunda Pesisir Garut'
      }),
      createRecordFromData('sample-pangandaran', getSampleSurveyPangandaran(), {
        customTitle: 'Desa Babakan - Dialek Jawa-Sunda Pangandaran'
      })
    ];

    const combined = [...surveys];
    samples.forEach(s => {
      if (!combined.some(c => c.id === s.id || (c.desa && c.desa === s.desa))) {
        combined.push(s);
      }
    });
    return combined;
  }, [surveys]);

  // Selected Survey 1 and Survey 2 IDs
  const [survey1Id, setSurvey1Id] = useState<string>(() => {
    if (activeSurveyId && availableSurveys.some(s => s.id === activeSurveyId)) {
      return activeSurveyId;
    }
    return availableSurveys[0]?.id || '';
  });

  const [survey2Id, setSurvey2Id] = useState<string>(() => {
    if (availableSurveys.length > 1) {
      // Pick a survey different from survey 1
      const other = availableSurveys.find(s => s.id !== activeSurveyId);
      return other ? other.id : availableSurveys[1].id;
    }
    return '';
  });

  // Active sub-tab mode: 'kosakata' | 'responden' | 'ikhtisar'
  const [activeSubTab, setActiveSubTab] = useState<'kosakata' | 'responden' | 'ikhtisar'>('kosakata');

  // Search & Filters for Vocabulary
  const [wordSearch, setWordSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | DifferenceCategory | 'OVERRIDDEN'>('ALL');
  const [viewLayout, setViewLayout] = useState<'table' | 'cards'>('table');
  const [showPhoneticSegments, setShowPhoneticSegments] = useState<boolean>(true);

  // Manual category overrides: map of glossNo -> DifferenceCategory
  const [manualOverrides, setManualOverrides] = useState<{ [no: number]: DifferenceCategory }>({});
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Audio preview state
  const [playingAudioKey, setPlayingAudioKey] = useState<string | null>(null);

  // Resolve Survey 1 and Survey 2 objects
  const survey1 = useMemo(() => {
    return availableSurveys.find(s => s.id === survey1Id) || availableSurveys[0];
  }, [availableSurveys, survey1Id]);

  const survey2 = useMemo(() => {
    return availableSurveys.find(s => s.id === survey2Id) || availableSurveys[1] || availableSurveys[0];
  }, [availableSurveys, survey2Id]);

  // Swap Survey 1 and Survey 2
  const handleSwapSurveys = () => {
    const temp = survey1Id;
    setSurvey1Id(survey2Id);
    setSurvey2Id(temp);
  };

  // Helper to extract metadata
  const meta1 = useMemo(() => {
    const tp = survey1?.data?.titikPengamatan;
    const geo = survey1?.data?.situasiGeografis;
    const desa = tp?.namaDesa || survey1?.desa || 'Titik 1';
    const bahasa = tp?.bahasaDigunakan || survey1?.bahasa || 'Bahasa Daerah';
    const kec = tp?.kecamatan || survey1?.kecamatan || '-';
    const kab = tp?.kabupatenKota || survey1?.kabupatenKota || '-';
    const prov = tp?.provinsi || survey1?.provinsi || '-';
    const lat = parseFloat(String(geo?.koordinatLintang ?? tp?.koordinatLintang ?? ''));
    const lng = parseFloat(String(geo?.koordinatBujur ?? tp?.koordinatBujur ?? ''));
    const hasCoords = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

    return { desa, bahasa, kec, kab, prov, lat, lng, hasCoords, morfologi: geo?.morfologi, letakPantai: geo?.letakPantai };
  }, [survey1]);

  const meta2 = useMemo(() => {
    const tp = survey2?.data?.titikPengamatan;
    const geo = survey2?.data?.situasiGeografis;
    const desa = tp?.namaDesa || survey2?.desa || 'Titik 2';
    const bahasa = tp?.bahasaDigunakan || survey2?.bahasa || 'Bahasa Daerah';
    const kec = tp?.kecamatan || survey2?.kecamatan || '-';
    const kab = tp?.kabupatenKota || survey2?.kabupatenKota || '-';
    const prov = tp?.provinsi || survey2?.provinsi || '-';
    const lat = parseFloat(String(geo?.koordinatLintang ?? tp?.koordinatLintang ?? ''));
    const lng = parseFloat(String(geo?.koordinatBujur ?? tp?.koordinatBujur ?? ''));
    const hasCoords = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

    return { desa, bahasa, kec, kab, prov, lat, lng, hasCoords, morfologi: geo?.morfologi, letakPantai: geo?.letakPantai };
  }, [survey2]);

  // Calculate geodesic distance between the two surveyed observation points
  const distanceKm = useMemo<number | null>(() => {
    if (meta1.hasCoords && meta2.hasCoords) {
      const dist = calculateDistanceKm(meta1.lat, meta1.lng, meta2.lat, meta2.lng);
      return Math.round(dist * 10) / 10;
    }
    return null;
  }, [meta1, meta2]);

  // Vocabulary lookup map for Survey 1 and Survey 2
  const vocabMap1 = useMemo(() => {
    const map: Record<string, KosakataItem> = {};
    const swadesh = survey1?.data?.kosakataLengkap?.swadeshList || [];
    swadesh.forEach(item => {
      if (item.glosIndonesia) {
        map[item.glosIndonesia.toLowerCase().trim()] = item;
      }
    });
    return map;
  }, [survey1]);

  const vocabMap2 = useMemo(() => {
    const map: Record<string, KosakataItem> = {};
    const swadesh = survey2?.data?.kosakataLengkap?.swadeshList || [];
    swadesh.forEach(item => {
      if (item.glosIndonesia) {
        map[item.glosIndonesia.toLowerCase().trim()] = item;
      }
    });
    return map;
  }, [survey2]);

  // Build Unified Side-by-Side Vocabulary Comparison Rows (200 Swadesh Glosses)
  const comparisonRows = useMemo<SideBySideWordRow[]>(() => {
    return SWADESH_200_GLOS.map((glos, idx) => {
      const no = idx + 1;
      const key = glos.toLowerCase().trim();

      const item1 = vocabMap1[key];
      const item2 = vocabMap2[key];

      const bentuk1 = item1?.bentukLokal?.trim() || '';
      const ipa1 = item1?.transkripsiIPA?.trim() || (bentuk1 ? `[${bentuk1}]` : '');
      const audio1 = item1?.audioUrl || '';
      const catatan1 = item1?.catatan || '';

      const bentuk2 = item2?.bentukLokal?.trim() || '';
      const ipa2 = item2?.transkripsiIPA?.trim() || (bentuk2 ? `[${bentuk2}]` : '');
      const audio2 = item2?.audioUrl || '';
      const catatan2 = item2?.catatan || '';

      // Standard classification
      const pair = classifyWordPair(bentuk1, bentuk2, glos);

      // Perform phonetic segment alignment
      const phoneticAlignment = alignPhoneticSegments(ipa1, ipa2, bentuk1, bentuk2, glos);

      const isOverridden = manualOverrides[no] !== undefined;
      const effectiveCategory: DifferenceCategory = isOverridden 
        ? manualOverrides[no] 
        : pair.category;

      return {
        no,
        glos,
        bentuk1,
        ipa1,
        audio1,
        catatan1,
        bentuk2,
        ipa2,
        audio2,
        catatan2,
        category: effectiveCategory,
        note: pair.note,
        phoneticAlignment,
        isOverridden
      };
    });
  }, [vocabMap1, vocabMap2, manualOverrides]);

  // Filtered rows for vocabulary sub-tab
  const filteredRows = useMemo(() => {
    return comparisonRows.filter(row => {
      // 1. Search Query
      if (wordSearch.trim()) {
        const q = wordSearch.toLowerCase().trim();
        const matchGlos = row.glos.toLowerCase().includes(q);
        const match1 = row.bentuk1.toLowerCase().includes(q) || row.ipa1.toLowerCase().includes(q);
        const match2 = row.bentuk2.toLowerCase().includes(q) || row.ipa2.toLowerCase().includes(q);
        const matchNote = row.note.toLowerCase().includes(q);
        if (!matchGlos && !match1 && !match2 && !matchNote) {
          return false;
        }
      }

      // 2. Category Filter
      if (categoryFilter === 'ALL') return true;
      if (categoryFilter === 'OVERRIDDEN') return !!row.isOverridden;
      return row.category === categoryFilter;
    });
  }, [comparisonRows, wordSearch, categoryFilter]);

  // Dialectometry Calculations & Statistics (Guiter Formula d = (s / n) * 100%)
  const dialectStats = useMemo(() => {
    let lexicalCount = 0;
    let phonemeCount = 0;
    let sameCount = 0;
    let emptyCount = 0;
    let overriddenCount = 0;

    comparisonRows.forEach(row => {
      if (row.isOverridden) overriddenCount++;

      if (row.category === 'BEDA_LEKSIKAL') {
        lexicalCount++;
      } else if (row.category === 'BEDA_FONEM') {
        phonemeCount++;
      } else if (row.category === 'SAMA') {
        sameCount++;
      } else {
        emptyCount++;
      }
    });

    const totalCompared = lexicalCount + phonemeCount + sameCount;
    const effectiveDifference = lexicalCount + phonemeCount; // s
    const dPercentage = totalCompared > 0 
      ? Math.round((effectiveDifference / totalCompared) * 1000) / 10 
      : 0;

    // Skala Dialektometri Leksikal Guiter Resmi:
    // • 81% – 100% = Kategori perbedaan bahasa (berbeda bahasa)
    // • 51% – 80% = Kategori perbedaan dialek (berbeda dialek)
    // • 31% – 50% = Kategori perbedaan subdialek
    // • 21% – 30% = Kategori perbedaan wicara (speech difference)
    // • Kurang dari 21% (≤ 20%): Kategori tidak berbeda (masih dalam satu variasi atau wicara yang sama)
    let statusText = isEn ? 'No Difference (Same Variety)' : 'Kategori Tidak Berbeda';
    let badgeColor = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    let deskripsi = isEn 
      ? 'Under 21% (<= 20%): No difference category (within the same variation or speech variety).' 
      : 'Kurang dari 21% (≤ 20%): Kategori tidak berbeda (masih dalam satu variasi atau wicara yang sama).';

    if (dPercentage >= 81) {
      statusText = isEn ? 'Language Difference (Distinct Language)' : 'Kategori Perbedaan Bahasa (Berbeda Bahasa)';
      badgeColor = 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      deskripsi = isEn 
        ? '81% - 100%: Language difference category (distinct languages).'
        : '81% – 100%: Kategori perbedaan bahasa (berbeda bahasa).';
    } else if (dPercentage >= 51) {
      statusText = isEn ? 'Dialect Difference (Different Dialect)' : 'Kategori Perbedaan Dialek (Berbeda Dialek)';
      badgeColor = 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-800';
      deskripsi = isEn 
        ? '51% - 80%: Dialect difference category (different dialects).'
        : '51% – 80%: Kategori perbedaan dialek (berbeda dialek).';
    } else if (dPercentage >= 31) {
      statusText = isEn ? 'Subdialect Difference' : 'Kategori Perbedaan Subdialek';
      badgeColor = 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      deskripsi = isEn 
        ? '31% - 50%: Subdialect difference category.'
        : '31% – 50%: Kategori perbedaan subdialek.';
    } else if (dPercentage >= 21) {
      statusText = isEn ? 'Speech Variety Difference (Speech Difference)' : 'Kategori Perbedaan Wicara (Speech Difference)';
      badgeColor = 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800';
      deskripsi = isEn 
        ? '21% - 30%: Speech difference category (speech variety).'
        : '21% – 30%: Kategori perbedaan wicara (speech difference).';
    } else {
      statusText = isEn ? 'No Difference (Same Variety)' : 'Kategori Tidak Berbeda (Variasi/Wicara Sama)';
      badgeColor = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      deskripsi = isEn 
        ? 'Under 21% (<= 20%): No difference category (within the same variation or speech variety).'
        : 'Kurang dari 21% (≤ 20%): Kategori tidak berbeda (masih dalam satu variasi atau wicara yang sama).';
    }

    return {
      totalGloss: comparisonRows.length,
      totalCompared,
      lexicalCount,
      lexicalPct: totalCompared > 0 ? Math.round((lexicalCount / totalCompared) * 1000) / 10 : 0,
      phonemeCount,
      phonemePct: totalCompared > 0 ? Math.round((phonemeCount / totalCompared) * 1000) / 10 : 0,
      sameCount,
      samePct: totalCompared > 0 ? Math.round((sameCount / totalCompared) * 1000) / 10 : 0,
      emptyCount,
      overriddenCount,
      dPercentage,
      similarityPercentage: Math.max(0, Math.round((100 - dPercentage) * 10) / 10),
      statusText,
      badgeColor,
      deskripsi
    };
  }, [comparisonRows, isEn]);

  // Informant Roster & Demographics for Survey 1 & Survey 2
  const informants1 = useMemo<NarasumberData[]>(() => {
    return (survey1?.data?.narasumberList || []).filter(n => n.nama && n.nama.trim() !== '');
  }, [survey1]);

  const informants2 = useMemo<NarasumberData[]>(() => {
    return (survey2?.data?.narasumberList || []).filter(n => n.nama && n.nama.trim() !== '');
  }, [survey2]);

  // Helper to compute demographic metrics for an informant list
  const computeInformantStats = (list: NarasumberData[], desaName: string) => {
    if (list.length === 0) {
      return {
        count: 0,
        avgAge: 0,
        ageRange: '-',
        maleCount: 0,
        femaleCount: 0,
        malePct: 0,
        dominantEdu: '-',
        avgResidency: 0,
        criteriaConformityPct: 0
      };
    }

    let totalAge = 0;
    let minAge = 999;
    let maxAge = 0;
    let male = 0;
    let female = 0;
    let totalResidency = 0;
    let conformingCount = 0;
    const eduCounts: Record<string, number> = {};

    list.forEach(inf => {
      const age = typeof inf.usia === 'number' ? inf.usia : parseInt(String(inf.usia || '0'), 10);
      if (age > 0) {
        totalAge += age;
        if (age < minAge) minAge = age;
        if (age > maxAge) maxAge = age;
      }

      const gender = (inf.jenisKelamin || '').toLowerCase();
      if (gender.includes('pria') || gender.includes('laki')) male++;
      else if (gender.includes('wanita') || gender.includes('perempuan')) female++;

      const res = typeof inf.lamaTinggalTahun === 'number' ? inf.lamaTinggalTahun : parseInt(String(inf.lamaTinggalTahun || '0'), 10);
      if (res > 0) totalResidency += res;

      const eduCategory = categorizeEducation(inf.pendidikanTertinggi || '');
      eduCounts[eduCategory] = (eduCounts[eduCategory] || 0) + 1;

      // Dialectology informant criteria: age 40 - 65 & born in village or stayed >= 20 years
      const isAgeFit = age >= 40 && age <= 65;
      const isLocFit = (res >= 20) || (inf.tempatLahir?.desa && inf.tempatLahir.desa.toLowerCase().includes(desaName.toLowerCase()));
      if (isAgeFit && isLocFit) {
        conformingCount++;
      }
    });

    const avgAge = Math.round((totalAge / list.length) * 10) / 10;
    const ageRange = minAge !== 999 && maxAge !== 0 ? `${minAge} – ${maxAge} thn` : '-';
    const malePct = Math.round((male / list.length) * 100);
    const avgResidency = Math.round((totalResidency / list.length) * 10) / 10;
    const criteriaConformityPct = Math.round((conformingCount / list.length) * 100);

    let dominantEdu = '-';
    let maxEduCount = 0;
    Object.entries(eduCounts).forEach(([edu, cnt]) => {
      if (cnt > maxEduCount) {
        maxEduCount = cnt;
        dominantEdu = edu;
      }
    });

    return {
      count: list.length,
      avgAge,
      ageRange,
      maleCount: male,
      femaleCount: female,
      malePct,
      dominantEdu,
      avgResidency,
      criteriaConformityPct
    };
  };

  const informantStats1 = useMemo(() => computeInformantStats(informants1, meta1.desa), [informants1, meta1.desa]);
  const informantStats2 = useMemo(() => computeInformantStats(informants2, meta2.desa), [informants2, meta2.desa]);

  // Handle category override
  const handleOverrideCategory = (no: number, cat: DifferenceCategory) => {
    setManualOverrides(prev => ({ ...prev, [no]: cat }));
  };

  const handleResetSingleOverride = (no: number) => {
    setManualOverrides(prev => {
      const copy = { ...prev };
      delete copy[no];
      return copy;
    });
  };

  const handleResetAllOverrides = () => {
    if (window.confirm(isEn ? 'Reset all manual overrides back to automatic phonological analysis?' : 'Reset seluruh penyesuaian manual kembali ke analisis otomatis?')) {
      setManualOverrides({});
    }
  };

  // Export comparison to CSV
  const handleExportCSV = () => {
    const headers = [
      'No',
      'Glos_Indonesia',
      `Bentuk_${meta1.desa.replace(/\s+/g, '_')}`,
      `IPA_${meta1.desa.replace(/\s+/g, '_')}`,
      `Bentuk_${meta2.desa.replace(/\s+/g, '_')}`,
      `IPA_${meta2.desa.replace(/\s+/g, '_')}`,
      'Kategori_Perbedaan',
      'Kemiripan_Fonetik_IPA_%',
      'Catatan_Fonologis'
    ];

    const rows = comparisonRows.map(r => [
      r.no,
      `"${r.glos}"`,
      `"${r.bentuk1.replace(/"/g, '""')}"`,
      `"${r.ipa1.replace(/"/g, '""')}"`,
      `"${r.bentuk2.replace(/"/g, '""')}"`,
      `"${r.ipa2.replace(/"/g, '""')}"`,
      r.category,
      r.phoneticAlignment.similarityPct,
      `"${r.note.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Perbandingan_Survei_${meta1.desa}_vs_${meta2.desa}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="side-by-side-comparison-root" className="space-y-6 animate-fadeIn">
      {/* Top Banner & Title */}
      <div className="bg-gradient-to-r from-teal-50 via-sky-50 to-indigo-50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 rounded-2xl p-5 sm:p-7 border border-teal-200 dark:border-teal-900/60 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800 mb-2.5">
              <Columns className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{isEn ? 'Side-by-Side Dual Survey Comparison' : 'Komparasi Berdampingan Dua Titik Pengamatan'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {isEn ? 'Side-by-Side Survey & Informant Analysis' : 'Perbandingan Berdampingan Survei & Profil Responden'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {isEn
                ? 'Compare Swadesh 200 vocabulary items, IPA transcription shifts, and native respondent demographics between two observation points side by side.'
                : 'Bandingkan 200 kosakata Swadesh, korespondensi fonetik IPA segmen, serta profil sosiologis narasumber antara dua titik pengamatan secara berdampingan.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onOpenRegionalReport && (
              <button
                type="button"
                onClick={onOpenRegionalReport}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                title="Laporan Ringkasan Wilayah (Unduh PDF)"
              >
                <FileText className="w-4 h-4" />
                <span>{isEn ? 'Regional Report' : 'Laporan Wilayah'}</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 rounded font-bold">
                  PDF
                </span>
              </button>
            )}

            {onNavigateToPetaSurvei && (
              <button
                type="button"
                onClick={onNavigateToPetaSurvei}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                title="Buka Peta Survei Titik"
              >
                <MapPin className="w-4 h-4" />
                <span>{isEn ? 'Survey Map' : 'Peta Survei'}</span>
              </button>
            )}

            {onNavigateToPetaCarto && (
              <button
                type="button"
                onClick={onNavigateToPetaCarto}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                title="Buka Peta Spasial CARTO (Tri-Instrumen)"
              >
                <Globe className="w-4 h-4" />
                <span>{isEn ? 'CARTO Map' : 'Peta CARTO'}</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-teal-200 dark:bg-teal-900 text-teal-900 dark:text-teal-200 rounded font-bold">
                  CARTO
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isEn ? 'Export CSV' : 'Ekspor CSV'}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>{isEn ? 'Print' : 'Cetak'}</span>
            </button>
          </div>
        </div>

        {/* Survey Selectors Bar */}
        <div className="mt-6 pt-5 border-t border-teal-200/80 dark:border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Survey 1 Selector */}
          <div className="md:col-span-5 bg-white dark:bg-slate-850 p-3.5 rounded-xl border-2 border-teal-300 dark:border-teal-800 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-teal-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                <span>{isEn ? 'Point A (Survey 1)' : 'Titik A (Survei 1)'}</span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {informants1.length} {isEn ? 'informants' : 'narasumber'}
              </span>
            </div>

            <div className="relative">
              <select
                id="select-survey-1"
                value={survey1Id}
                onChange={e => setSurvey1Id(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 text-xs sm:text-sm font-bold rounded-lg bg-teal-50/60 dark:bg-slate-800 border border-teal-200 dark:border-teal-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-hidden cursor-pointer"
              >
                {availableSurveys.map(s => (
                  <option key={`s1_${s.id}`} value={s.id}>
                    {s.desa || s.title} ({s.bahasa || 'Bahasa Belum Terisi'}) — {s.kabupatenKota || s.provinsi || 'Jawa Barat'}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-0.5">
              <span>{meta1.desa}, Kec. {meta1.kec}, {meta1.kab}</span>
              {onNavigateToForm && (
                <button
                  type="button"
                  onClick={() => onNavigateToForm(survey1.id)}
                  className="text-teal-600 dark:text-teal-400 hover:underline font-semibold flex items-center gap-0.5"
                >
                  <span>{isEn ? 'Edit' : 'Form'}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Swap Button & Distance in Center */}
          <div className="md:col-span-2 flex flex-col items-center justify-center gap-1.5 py-1">
            <button
              type="button"
              onClick={handleSwapSurveys}
              className="p-2.5 rounded-full bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 border-2 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 shadow-xs hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title={isEn ? 'Swap Survey 1 and Survey 2' : 'Tukar posisi Titik 1 dan Titik 2'}
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            {distanceKm !== null ? (
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 whitespace-nowrap shadow-2xs">
                ~{distanceKm} km
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 italic">
                {isEn ? 'Side-by-side' : 'Berdampingan'}
              </span>
            )}
          </div>

          {/* Survey 2 Selector */}
          <div className="md:col-span-5 bg-white dark:bg-slate-850 p-3.5 rounded-xl border-2 border-indigo-300 dark:border-indigo-800 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                <span>{isEn ? 'Point B (Survey 2)' : 'Titik B (Survei 2)'}</span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {informants2.length} {isEn ? 'informants' : 'narasumber'}
              </span>
            </div>

            <div className="relative">
              <select
                id="select-survey-2"
                value={survey2Id}
                onChange={e => setSurvey2Id(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 text-xs sm:text-sm font-bold rounded-lg bg-indigo-50/60 dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
              >
                {availableSurveys.map(s => (
                  <option key={`s2_${s.id}`} value={s.id}>
                    {s.desa || s.title} ({s.bahasa || 'Bahasa Belum Terisi'}) — {s.kabupatenKota || s.provinsi || 'Jawa Barat'}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-0.5">
              <span>{meta2.desa}, Kec. {meta2.kec}, {meta2.kab}</span>
              {onNavigateToForm && (
                <button
                  type="button"
                  onClick={() => onNavigateToForm(survey2.id)}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-0.5"
                >
                  <span>{isEn ? 'Edit' : 'Form'}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Sub-Tab Switcher (Vocabulary vs Informants vs Summary) */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-1.5 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveSubTab('kosakata')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === 'kosakata'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{isEn ? 'Swadesh Vocabulary Comparison' : 'Perbandingan Kosakata Swadesh'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeSubTab === 'kosakata' ? 'bg-teal-800/60 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
            {dialectStats.dPercentage}% Beda
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('responden')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === 'responden'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{isEn ? 'Respondent & Informant Profiles' : 'Profil Responden & Narasumber'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeSubTab === 'responden' ? 'bg-indigo-800/60 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
            {informants1.length + informants2.length} Orang
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('ikhtisar')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === 'ikhtisar'
              ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>{isEn ? 'Dialectometry Summary' : 'Ikhtisar Dialektometri'}</span>
        </button>
      </div>

      {/* SUB-TAB 1: SIDE-BY-SIDE VOCABULARY COMPARISON */}
      {activeSubTab === 'kosakata' && (
        <div className="space-y-5">
          {/* Dialectometry Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Index Card */}
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/30 p-4 rounded-xl border border-teal-200 dark:border-teal-800 shadow-2xs">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                {isEn ? 'Dialectometry Index (d)' : 'Indeks Dialektometri (d)'}
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-teal-950 dark:text-teal-100 my-1">
                {dialectStats.dPercentage}%
              </div>
              <div className="mt-1">
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${dialectStats.badgeColor}`}>
                  {dialectStats.statusText}
                </span>
              </div>
            </div>

            {/* Lexical Difference Card */}
            <div className="bg-rose-50/70 dark:bg-rose-950/30 p-4 rounded-xl border border-rose-200 dark:border-rose-800 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                  {isEn ? 'Lexical Diffs (s_lek)' : 'Beda Leksikal (s_lek)'}
                </span>
                <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400">
                  {dialectStats.lexicalPct}%
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-950 dark:text-rose-100 my-1">
                {dialectStats.lexicalCount}
              </div>
              <p className="text-[10px] text-rose-800/80 dark:text-rose-300/80 line-clamp-1">
                {isEn ? 'Different word etymons' : 'Akar kata / etimon berlainan'}
              </p>
            </div>

            {/* Phonemic Shift Card */}
            <div className="bg-amber-50/70 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-200 dark:border-amber-800 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  {isEn ? 'Phonemic Diffs (s_fon)' : 'Beda Fonem (s_fon)'}
                </span>
                <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                  {dialectStats.phonemePct}%
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-950 dark:text-amber-100 my-1">
                {dialectStats.phonemeCount}
              </div>
              <p className="text-[10px] text-amber-800/80 dark:text-amber-300/80 line-clamp-1">
                {isEn ? 'Cognates with sound shifts' : 'Kognat serumpun beda 1–2 fonem'}
              </p>
            </div>

            {/* Identical Cognates Card */}
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  {isEn ? 'Identical Forms' : 'Sama / Identik'}
                </span>
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                  {dialectStats.samePct}%
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-100 my-1">
                {dialectStats.sameCount}
              </div>
              <p className="text-[10px] text-emerald-800/80 dark:text-emerald-300/80 line-clamp-1">
                {isEn ? 'Identical vocabulary forms' : 'Bentuk ortografis sama persis'}
              </p>
            </div>
          </div>

          {/* Search, Filter & Layout Toolbar */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={isEn ? "Search Swadesh gloss, word in Point 1 or Point 2..." : "Cari glos Swadesh atau kata di Titik 1 & Titik 2..."}
                  value={wordSearch}
                  onChange={e => setWordSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
                {wordSearch && (
                  <button
                    type="button"
                    onClick={() => setWordSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    &times;
                  </button>
                )}
              </div>

              {/* View Options & Phonetic Segment Toggle */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowPhoneticSegments(!showPhoneticSegments)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    showPhoneticSegments
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-700'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>{isEn ? 'Phonetic Segments' : 'Segmen Fonetik'}</span>
                </button>

                <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setViewLayout('table')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      viewLayout === 'table'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                    }`}
                  >
                    {isEn ? 'Table' : 'Tabel Kolom'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewLayout('cards')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      viewLayout === 'cards'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                    }`}
                  >
                    {isEn ? 'Cards' : 'Kartu'}
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-semibold mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                {isEn ? 'Filter:' : 'Filter:'}
              </span>
              <button
                type="button"
                onClick={() => setCategoryFilter('ALL')}
                className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                  categoryFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {isEn ? 'All' : 'Semua'} ({comparisonRows.length})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('BEDA_LEKSIKAL')}
                className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                  categoryFilter === 'BEDA_LEKSIKAL'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                }`}
              >
                🔴 {isEn ? 'Lexical' : 'Beda Leksikal'} ({dialectStats.lexicalCount})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('BEDA_FONEM')}
                className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                  categoryFilter === 'BEDA_FONEM'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                }`}
              >
                🟡 {isEn ? 'Phonemic' : 'Beda Fonem'} ({dialectStats.phonemeCount})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('SAMA')}
                className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                  categoryFilter === 'SAMA'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                }`}
              >
                🟢 {isEn ? 'Identical' : 'Sama Identik'} ({dialectStats.sameCount})
              </button>
              {dialectStats.overriddenCount > 0 && (
                <button
                  type="button"
                  onClick={() => setCategoryFilter('OVERRIDDEN')}
                  className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                    categoryFilter === 'OVERRIDDEN'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                  }`}
                >
                  ✨ {isEn ? 'Manual' : 'Penyesuaian Manual'} ({dialectStats.overriddenCount})
                </button>
              )}

              {dialectStats.overriddenCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetAllOverrides}
                  className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline ml-auto"
                >
                  {isEn ? 'Reset All Overrides' : 'Reset Semua Manual'}
                </button>
              )}
            </div>
          </div>

          {/* VIEW LAYOUT 1: SIDE-BY-SIDE TWO COLUMNS TABLE */}
          {viewLayout === 'table' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-300 dark:border-slate-700 shadow-xs backdrop-blur-md">
                    <tr>
                      <th className="p-3 w-12 text-center font-bold text-slate-700 dark:text-slate-300">No</th>
                      <th className="p-3 w-40 font-bold text-slate-800 dark:text-slate-200">Glos Swadesh</th>
                      
                      {/* Column 1: Point A / Survey 1 */}
                      <th className="p-3 bg-teal-50/90 dark:bg-teal-950/50 border-x border-teal-200 dark:border-teal-800">
                        <div className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center">1</span>
                          <span className="font-extrabold text-teal-900 dark:text-teal-200 text-sm">{meta1.desa}</span>
                        </div>
                        <div className="text-[11px] font-medium text-teal-700 dark:text-teal-400 line-clamp-1">{meta1.bahasa}</div>
                      </th>

                      {/* Column 2: Point B / Survey 2 */}
                      <th className="p-3 bg-indigo-50/90 dark:bg-indigo-950/50 border-r border-indigo-200 dark:border-indigo-800">
                        <div className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">2</span>
                          <span className="font-extrabold text-indigo-900 dark:text-indigo-200 text-sm">{meta2.desa}</span>
                        </div>
                        <div className="text-[11px] font-medium text-indigo-700 dark:text-indigo-400 line-clamp-1">{meta2.bahasa}</div>
                      </th>

                      <th className="p-3 w-44 font-bold text-slate-800 dark:text-slate-200">Kategori Beda</th>
                      <th className="p-3 font-bold text-slate-800 dark:text-slate-200">Analisis Fonologis & Korespondensi</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          {isEn ? 'No vocabulary items match your search or filter.' : 'Tidak ada kosakata yang cocok dengan pencarian atau filter.'}
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map(row => (
                        <tr 
                          key={`row_${row.no}`} 
                          className="hover:bg-slate-50/90 dark:hover:bg-slate-800/60 transition-colors"
                        >
                          {/* No */}
                          <td className="p-3 text-center font-mono text-xs text-slate-400 font-semibold">
                            {row.no}
                          </td>

                          {/* Swadesh Gloss */}
                          <td className="p-3 font-extrabold text-slate-900 dark:text-slate-100">
                            {row.glos}
                          </td>

                          {/* Point 1 Data */}
                          <td className="p-3 bg-teal-50/30 dark:bg-teal-950/15 border-x border-teal-100 dark:border-teal-900/40">
                            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                              {row.bentuk1 || <span className="text-slate-400 italic">Kosong</span>}
                            </div>
                            {row.ipa1 && (
                              <div className="font-mono text-xs text-teal-700 dark:text-teal-300 mt-0.5">
                                {row.ipa1}
                              </div>
                            )}
                            {showPhoneticSegments && row.bentuk1 && row.bentuk2 && (
                              <div className="mt-1">
                                <PhoneticSegmentVisualizer
                                  alignment={row.phoneticAlignment}
                                  glos={row.glos}
                                  point1Label={meta1.desa}
                                  point2Label={meta2.desa}
                                  mode="inline-tokens"
                                  targetPoint={1}
                                />
                              </div>
                            )}
                            {row.catatan1 && (
                              <div className="text-[10px] text-slate-400 italic mt-0.5">{row.catatan1}</div>
                            )}
                          </td>

                          {/* Point 2 Data */}
                          <td className="p-3 bg-indigo-50/30 dark:bg-indigo-950/15 border-r border-indigo-100 dark:border-indigo-900/40">
                            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                              {row.bentuk2 || <span className="text-slate-400 italic">Kosong</span>}
                            </div>
                            {row.ipa2 && (
                              <div className="font-mono text-xs text-indigo-700 dark:text-indigo-300 mt-0.5">
                                {row.ipa2}
                              </div>
                            )}
                            {showPhoneticSegments && row.bentuk1 && row.bentuk2 && (
                              <div className="mt-1">
                                <PhoneticSegmentVisualizer
                                  alignment={row.phoneticAlignment}
                                  glos={row.glos}
                                  point1Label={meta1.desa}
                                  point2Label={meta2.desa}
                                  mode="inline-tokens"
                                  targetPoint={2}
                                />
                              </div>
                            )}
                            {row.catatan2 && (
                              <div className="text-[10px] text-slate-400 italic mt-0.5">{row.catatan2}</div>
                            )}
                          </td>

                          {/* Difference Category with Override Selector */}
                          <td className="p-3">
                            <div className="relative inline-block w-full">
                              <select
                                value={row.category}
                                onChange={e => handleOverrideCategory(row.no, e.target.value as DifferenceCategory)}
                                className={`w-full text-xs font-bold px-2 py-1.5 rounded-lg border appearance-none cursor-pointer pr-6 transition-all ${
                                  row.category === 'BEDA_LEKSIKAL'
                                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800'
                                    : row.category === 'BEDA_FONEM'
                                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                                    : row.category === 'SAMA'
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                                }`}
                              >
                                <option value="BEDA_LEKSIKAL">🔴 Beda Leksikal</option>
                                <option value="BEDA_FONEM">🟡 Beda Fonem</option>
                                <option value="SAMA">🟢 Sama (Identik)</option>
                                <option value="BELUM_DIISI">⚪ Belum Diisi</option>
                              </select>
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>

                            {row.isOverridden && (
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-50 dark:bg-indigo-950 px-1 py-0.2 rounded border border-indigo-200 dark:border-indigo-800">
                                  Manual
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleResetSingleOverride(row.no)}
                                  className="text-[10px] text-slate-400 hover:text-slate-600 underline"
                                >
                                  Reset
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Phonological Notes & Shift Details */}
                          <td className="p-3 text-xs text-slate-600 dark:text-slate-300">
                            <div className="leading-snug">{row.note}</div>
                            {row.phoneticAlignment?.shifts && row.phoneticAlignment.shifts.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {row.phoneticAlignment.shifts.map((s, idx) => (
                                  <span 
                                    key={idx}
                                    className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                  >
                                    /{s.soundA}/ ↔ /{s.soundB}/
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="p-3.5 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
                <span>
                  {isEn ? 'Showing' : 'Menampilkan'} <strong className="text-slate-800 dark:text-slate-200">{filteredRows.length}</strong> dari <strong className="text-slate-800 dark:text-slate-200">{comparisonRows.length}</strong> glos kosakata Swadesh.
                </span>
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <Info className="w-3.5 h-3.5 text-teal-600" />
                  <span>{isEn ? 'Phonemic shifts indicate cognates; lexical differences indicate divergent roots.' : 'Perbedaan fonem mengindikasikan kognat; perbedaan leksikal mengindikasikan inovasi etimon.'}</span>
                </span>
              </div>
            </div>
          )}

          {/* VIEW LAYOUT 2: CARDS GRID */}
          {viewLayout === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRows.map(row => (
                <div 
                  key={`card_${row.no}`}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold text-slate-500 flex items-center justify-center">
                        {row.no}
                      </span>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                        {row.glos}
                      </h4>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                      row.category === 'BEDA_LEKSIKAL'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : row.category === 'BEDA_FONEM'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : row.category === 'SAMA'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {row.category}
                    </span>
                  </div>

                  {/* Dual Words Side-by-Side */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-teal-50/50 dark:bg-teal-950/20 rounded-lg border border-teal-200/80 dark:border-teal-900/50">
                      <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider block">
                        {meta1.desa}
                      </span>
                      <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm mt-0.5">
                        {row.bentuk1 || <span className="text-slate-400 italic">Kosong</span>}
                      </div>
                      <div className="font-mono text-xs text-teal-700 dark:text-teal-400 mt-0.5">
                        {row.ipa1}
                      </div>
                    </div>

                    <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-lg border border-indigo-200/80 dark:border-indigo-900/50">
                      <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block">
                        {meta2.desa}
                      </span>
                      <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm mt-0.5">
                        {row.bentuk2 || <span className="text-slate-400 italic">Kosong</span>}
                      </div>
                      <div className="font-mono text-xs text-indigo-700 dark:text-indigo-400 mt-0.5">
                        {row.ipa2}
                      </div>
                    </div>
                  </div>

                  {/* Phonetic Alignment Visualizer */}
                  {showPhoneticSegments && row.bentuk1 && row.bentuk2 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <PhoneticSegmentVisualizer
                        alignment={row.phoneticAlignment}
                        glos={row.glos}
                        point1Label={meta1.desa}
                        point2Label={meta2.desa}
                        mode="dual-inline"
                      />
                    </div>
                  )}

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                    {row.note}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: SIDE-BY-SIDE RESPONDENT & INFORMANT PROFILES */}
      {activeSubTab === 'responden' && (
        <div className="space-y-6">
          {/* Informant Demographics Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Demographic Card: Survey 1 */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-teal-200 dark:border-teal-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-teal-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-2xs">
                    1
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                      {meta1.desa}
                    </h3>
                    <p className="text-xs text-teal-700 dark:text-teal-400">
                      {meta1.bahasa} • Kec. {meta1.kec}, {meta1.kab}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                  {informantStats1.count} Narasumber
                </span>
              </div>

              {/* Informant Metric Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Rata-rata Usia</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                    {informantStats1.avgAge > 0 ? `${informantStats1.avgAge} tahun` : '-'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">{informantStats1.ageRange}</span>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Rasio Gender</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                    {informantStats1.maleCount} L / {informantStats1.femaleCount} P
                  </span>
                  <span className="text-[10px] text-teal-600 font-semibold">{informantStats1.malePct}% Laki-laki</span>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Masa Domisili</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                    {informantStats1.avgResidency > 0 ? `${informantStats1.avgResidency} tahun` : '-'}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Penutur Menetap</span>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 col-span-2 sm:col-span-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Pendidikan Dominan</span>
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 line-clamp-1">
                    {informantStats1.dominantEdu}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 col-span-2">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Kesesuaian Kriteria Dialektologi</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-extrabold text-emerald-600">
                      {informantStats1.criteriaConformityPct}% Memenuhi Kriteria
                    </span>
                    <span className="text-[10px] text-slate-400">(Usia 40–65 & Asli Desa)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Demographic Card: Survey 2 */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-2xs">
                    2
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                      {meta2.desa}
                    </h3>
                    <p className="text-xs text-indigo-700 dark:text-indigo-400">
                      {meta2.bahasa} • Kec. {meta2.kec}, {meta2.kab}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                  {informantStats2.count} Narasumber
                </span>
              </div>

              {/* Informant Metric Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Rata-rata Usia</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                    {informantStats2.avgAge > 0 ? `${informantStats2.avgAge} tahun` : '-'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">{informantStats2.ageRange}</span>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Rasio Gender</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                    {informantStats2.maleCount} L / {informantStats2.femaleCount} P
                  </span>
                  <span className="text-[10px] text-indigo-600 font-semibold">{informantStats2.malePct}% Laki-laki</span>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Masa Domisili</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                    {informantStats2.avgResidency > 0 ? `${informantStats2.avgResidency} tahun` : '-'}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Penutur Menetap</span>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 col-span-2 sm:col-span-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Pendidikan Dominan</span>
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 line-clamp-1">
                    {informantStats2.dominantEdu}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 col-span-2">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Kesesuaian Kriteria Dialektologi</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-extrabold text-emerald-600">
                      {informantStats2.criteriaConformityPct}% Memenuhi Kriteria
                    </span>
                    <span className="text-[10px] text-slate-400">(Usia 40–65 & Asli Desa)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-Side Informant Rosters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Column 1: Informants of Point 1 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-600" />
                  <span>Daftar Narasumber {meta1.desa}</span>
                </h4>
                <span className="text-xs text-slate-400">{informants1.length} narasumber</span>
              </div>

              {informants1.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
                  Belum ada narasumber yang terdata pada survei {meta1.desa}.
                </div>
              ) : (
                informants1.map((inf, idx) => (
                  <div
                    key={`inf1_${inf.id || idx}`}
                    className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-teal-100 dark:border-slate-800 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-[10px] flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {inf.nama}
                          </h5>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {inf.usia} tahun ({inf.jenisKelamin === 'pria' ? 'Laki-laki' : 'Perempuan'}) • Lahir di {inf.tempatLahir?.desa || meta1.desa}
                        </p>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {inf.pendidikanTertinggi || 'SD Sederajat'}
                      </span>
                    </div>

                    <div className="text-xs grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block">Pekerjaan:</span>
                        <span>{inf.pekerjaan?.sebagaiApa || '-'} ({inf.pekerjaan?.lokasiBekerja || '-'})</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block">Lama Tinggal:</span>
                        <span>{inf.lamaTinggalTahun ? `${inf.lamaTinggalTahun} tahun` : '-'}</span>
                      </div>
                    </div>

                    {inf.bahasaDigunakan?.diRumah && (
                      <div className="text-[11px] bg-teal-50/50 dark:bg-slate-800/40 p-2 rounded-lg text-slate-600 dark:text-slate-400">
                        <strong className="text-teal-800 dark:text-teal-300">Bahasa di Rumah:</strong> {inf.bahasaDigunakan.diRumah}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Column 2: Informants of Point 2 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Daftar Narasumber {meta2.desa}</span>
                </h4>
                <span className="text-xs text-slate-400">{informants2.length} narasumber</span>
              </div>

              {informants2.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
                  Belum ada narasumber yang terdata pada survei {meta2.desa}.
                </div>
              ) : (
                informants2.map((inf, idx) => (
                  <div
                    key={`inf2_${inf.id || idx}`}
                    className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-slate-800 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold text-[10px] flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {inf.nama}
                          </h5>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {inf.usia} tahun ({inf.jenisKelamin === 'pria' ? 'Laki-laki' : 'Perempuan'}) • Lahir di {inf.tempatLahir?.desa || meta2.desa}
                        </p>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {inf.pendidikanTertinggi || 'SD Sederajat'}
                      </span>
                    </div>

                    <div className="text-xs grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block">Pekerjaan:</span>
                        <span>{inf.pekerjaan?.sebagaiApa || '-'} ({inf.pekerjaan?.lokasiBekerja || '-'})</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block">Lama Tinggal:</span>
                        <span>{inf.lamaTinggalTahun ? `${inf.lamaTinggalTahun} tahun` : '-'}</span>
                      </div>
                    </div>

                    {inf.bahasaDigunakan?.diRumah && (
                      <div className="text-[11px] bg-indigo-50/50 dark:bg-slate-800/40 p-2 rounded-lg text-slate-600 dark:text-slate-400">
                        <strong className="text-indigo-800 dark:text-indigo-300">Bahasa di Rumah:</strong> {inf.bahasaDigunakan.diRumah}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Geographic & Sociolinguistic Context Comparison Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Mountain className="w-4 h-4 text-amber-500" />
              <span>Perbandingan Konteks Bentang Alam & Situasi Geografis</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Context Point 1 */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {meta1.desa} ({meta1.bahasa})
                </div>
                <div className="space-y-1 text-slate-600 dark:text-slate-400">
                  <div><strong>Morfologi Wilayah:</strong> {meta1.morfologi || 'Dataran Rendah'}</div>
                  <div><strong>Posisi Geografis:</strong> {meta1.letakPantai === 'pantai' ? 'Pesisir / Pantai' : 'Pedalaman'}</div>
                  {meta1.hasCoords && (
                    <div><strong>Koordinat GPS:</strong> {meta1.lat.toFixed(4)}, {meta1.lng.toFixed(4)}</div>
                  )}
                </div>
              </div>

              {/* Context Point 2 */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {meta2.desa} ({meta2.bahasa})
                </div>
                <div className="space-y-1 text-slate-600 dark:text-slate-400">
                  <div><strong>Morfologi Wilayah:</strong> {meta2.morfologi || 'Dataran Rendah'}</div>
                  <div><strong>Posisi Geografis:</strong> {meta2.letakPantai === 'pantai' ? 'Pesisir / Pantai' : 'Pedalaman'}</div>
                  {meta2.hasCoords && (
                    <div><strong>Koordinat GPS:</strong> {meta2.lat.toFixed(4)}, {meta2.lng.toFixed(4)}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: COMPREHENSIVE OVERVIEW & DIALECTOMETRY REPORT */}
      {activeSubTab === 'ikhtisar' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Scale className="w-5 h-5 text-teal-600" />
              <span>Ikhtisar Laporan Dialektometri Komparatif Guiraud</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Perhitungan indeks perbedaan dialektologis antara <strong>{meta1.desa}</strong> dan <strong>{meta2.desa}</strong> berdasarkan 200 kosakata dasar Swadesh dan parameter demografi responden.
            </p>
          </div>

          {/* Visual Bar Spectrum */}
          <div>
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1.5">
              <span>Komposisi Kesamaan & Perbedaan:</span>
              <span>{dialectStats.totalGloss} Total Glos Swadesh</span>
            </div>
            <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-700 shadow-inner">
              <div
                style={{ width: `${(dialectStats.lexicalCount / dialectStats.totalGloss) * 100}%` }}
                className="bg-rose-500 transition-all"
                title={`Beda Leksikal: ${dialectStats.lexicalCount}`}
              />
              <div
                style={{ width: `${(dialectStats.phonemeCount / dialectStats.totalGloss) * 100}%` }}
                className="bg-amber-500 transition-all"
                title={`Beda Fonem: ${dialectStats.phonemeCount}`}
              />
              <div
                style={{ width: `${(dialectStats.sameCount / dialectStats.totalGloss) * 100}%` }}
                className="bg-emerald-500 transition-all"
                title={`Sama Identik: ${dialectStats.sameCount}`}
              />
              <div
                style={{ width: `${(dialectStats.emptyCount / dialectStats.totalGloss) * 100}%` }}
                className="bg-slate-300 dark:bg-slate-600 transition-all"
                title={`Belum Terisi: ${dialectStats.emptyCount}`}
              />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 mt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block" />
                Beda Leksikal: {dialectStats.lexicalCount} ({dialectStats.lexicalPct}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block" />
                Beda Fonem: {dialectStats.phonemeCount} ({dialectStats.phonemePct}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
                Sama Identik: {dialectStats.sameCount} ({dialectStats.samePct}%)
              </span>
              {dialectStats.emptyCount > 0 && (
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-3 h-3 rounded-xs bg-slate-300 inline-block" />
                  Belum Terisi: {dialectStats.emptyCount}
                </span>
              )}
            </div>
          </div>

          {/* Guiraud Formula Card */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <h4 className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-500" />
              <span>Formula Dialektometri Guiraud (d = s/n × 100%)</span>
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              • <strong>s</strong> (jumlah perbedaan efektif) = {dialectStats.lexicalCount} (leksikal) + {dialectStats.phonemeCount} (fonem) = <strong>{dialectStats.lexicalCount + dialectStats.phonemeCount} kata</strong>.
              <br />
              • <strong>n</strong> (glos terbandingkan) = <strong>{dialectStats.totalCompared} glos</strong>.
              <br />
              • <strong>d%</strong> = ({dialectStats.lexicalCount + dialectStats.phonemeCount} / {dialectStats.totalCompared}) × 100% = <strong className="text-teal-700 dark:text-teal-300 text-sm">{dialectStats.dPercentage}%</strong>.
            </p>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">Hasil Klasifikasi Dialektologis:</span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${dialectStats.badgeColor}`}>
                {dialectStats.statusText}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 italic">
              {dialectStats.deskripsi}
            </p>

            {/* 5-Tier Guiter Reference Scale Grid */}
            <div className="pt-2.5 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">
                Skala Klasifikasi Dialektometri Leksikal Guiter:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                <div className={`p-2 rounded-lg border ${dialectStats.dPercentage <= 20 ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'}`}>
                  <div className="font-mono font-bold text-emerald-700 dark:text-emerald-400">≤ 20%</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Tidak Berbeda</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Variasi / wicara sama</div>
                </div>
                <div className={`p-2 rounded-lg border ${dialectStats.dPercentage > 20 && dialectStats.dPercentage <= 30 ? 'ring-2 ring-sky-500 bg-sky-50 dark:bg-sky-950/60 border-sky-300' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'}`}>
                  <div className="font-mono font-bold text-sky-700 dark:text-sky-400">21% – 30%</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Perbedaan Wicara</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Speech difference</div>
                </div>
                <div className={`p-2 rounded-lg border ${dialectStats.dPercentage > 30 && dialectStats.dPercentage <= 50 ? 'ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-300' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'}`}>
                  <div className="font-mono font-bold text-amber-700 dark:text-amber-400">31% – 50%</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Perbedaan Subdialek</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Subdialek serumpun</div>
                </div>
                <div className={`p-2 rounded-lg border ${dialectStats.dPercentage > 50 && dialectStats.dPercentage <= 80 ? 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-950/60 border-orange-300' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'}`}>
                  <div className="font-mono font-bold text-orange-700 dark:text-orange-400">51% – 80%</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Perbedaan Dialek</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Berbeda dialek</div>
                </div>
                <div className={`p-2 rounded-lg border ${dialectStats.dPercentage > 80 ? 'ring-2 ring-rose-500 bg-rose-50 dark:bg-rose-950/60 border-rose-300' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'} col-span-2 sm:col-span-1`}>
                  <div className="font-mono font-bold text-rose-700 dark:text-rose-400">81% – 100%</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Perbedaan Bahasa</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Berbeda bahasa</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {onNavigateToForm && (
                <>
                  <button
                    type="button"
                    onClick={() => onNavigateToForm(survey1.id)}
                    className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 text-xs font-bold transition-colors"
                  >
                    Buka Editor {meta1.desa}
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateToForm(survey2.id)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-colors"
                  >
                    Buka Editor {meta2.desa}
                  </button>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Unduh Spreadsheet CSV Lengkap</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
