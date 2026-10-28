import React, { useState, useMemo } from 'react';
import { 
  BookA, 
  Search, 
  Sparkles, 
  SlidersHorizontal, 
  Plus, 
  Trash2, 
  X, 
  Filter, 
  CheckCircle2, 
  CircleDashed, 
  Tag, 
  ArrowRight, 
  RotateCcw,
  Layers,
  HelpCircle,
  Volume2,
  Mic,
  FileSpreadsheet,
  Download,
  Calculator,
  Eye,
  Edit3,
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  Percent,
  TrendingUp,
  BarChart2,
  Activity,
  Check,
  BookOpen,
  FileText,
  AlignLeft,
  ClipboardList
} from 'lucide-react';
import { 
  KosakataLengkapData, 
  KosakataItem, 
  FrasaItem, 
  KalimatItem,
  CatatanPengumpulData,
  HasilDialektometriData,
  TitikPembandingDialektometri,
  TitikPengamatan,
  SurveyRecord
} from '../../types/linguistic';
import { IPA_SYMBOLS } from '../../data/swadeshList';
import { VocabularyAudioUploader } from '../common/VocabularyAudioUploader';
import { ExcelVocabularyImporter } from '../common/ExcelVocabularyImporter';
import { Section15LexicalDifferenceCalculator } from './Section15LexicalDifferenceCalculator';
import { PhonotacticAnalysis } from './PhonotacticAnalysis';
import { VocabularyDetailEditModal } from '../common/VocabularyDetailEditModal';
import { PhoneticSegmentVisualizer } from './PhoneticSegmentVisualizer';
import { 
  alignPhoneticSegments, 
  analyzeCorpusPhonetics, 
  AlignedPhoneticResult, 
  CorpusPhoneticSummary 
} from '../../utils/phoneticSegmentAligner';
import { getVocabularyForPoint } from '../../utils/dialectPointComparison';
import { CatatanSentimentAnalysisPanel } from './CatatanSentimentAnalysisPanel';
import { 
  analyzeQualitativeFieldNotes, 
  FIELD_NOTE_PRESETS 
} from '../../utils/qualitativeSentimentAnalyzer';

interface Section15Props {
  data: KosakataLengkapData;
  onUpdateSwadeshItem: (id: number, field: keyof KosakataItem, value: string) => void;
  onUpdateBudayaItem: (bidangKode: string, itemId: number, field: keyof KosakataItem, value: string) => void;
  onUpdateSwadeshAudio?: (id: number, url?: string, fileName?: string, duration?: string) => void;
  onUpdateBudayaAudio?: (bidangKode: string, itemId: number, url?: string, fileName?: string, duration?: string) => void;
  onUpdateFrasaItem: (subKategoriKey: string, id: string, field: keyof FrasaItem, value: string) => void;
  onUpdateKalimatItem: (id: string, field: keyof KalimatItem, value: string) => void;
  onAddKalimat: () => void;
  onRemoveKalimat: (id: string) => void;
  onUpdateCatatanPengumpul?: (field: keyof CatatanPengumpulData, value: string) => void;
  onImportExcelCustomList?: (items: KosakataItem[]) => void;
  onImportExcelUpdateSwadesh?: (items: { id?: number; glosIndonesia: string; bentukLokal: string; transkripsiIPA: string; catatan?: string }[]) => void;
  onUpdateExcelItem?: (id: number, field: keyof KosakataItem, value: string) => void;
  onUpdateExcelAudio?: (id: number, url?: string, fileName?: string, duration?: string) => void;
  onAddExcelItem?: () => void;
  onRemoveExcelItem?: (id: number) => void;
  onClearExcelList?: () => void;
  dialektometriData?: HasilDialektometriData;
  titikPengamatan?: TitikPengamatan;
  allSurveys?: SurveyRecord[];
  activeSurveyId?: string | null;
  onUpdateTitikPembanding?: (list: TitikPembandingDialektometri[]) => void;
  onNavigateToSection16?: () => void;
  onNavigateToMenuKosakata?: () => void;
}

export const Section15Kosakata: React.FC<Section15Props> = ({
  data,
  onUpdateSwadeshItem,
  onUpdateBudayaItem,
  onUpdateSwadeshAudio,
  onUpdateBudayaAudio,
  onUpdateFrasaItem,
  onUpdateKalimatItem,
  onAddKalimat,
  onRemoveKalimat,
  onUpdateCatatanPengumpul,
  onImportExcelCustomList,
  onImportExcelUpdateSwadesh,
  onUpdateExcelItem,
  onUpdateExcelAudio,
  onAddExcelItem,
  onRemoveExcelItem,
  onClearExcelList,
  dialektometriData,
  titikPengamatan,
  allSurveys,
  activeSurveyId,
  onUpdateTitikPembanding,
  onNavigateToSection16,
  onNavigateToMenuKosakata
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'swadesh' | 'budaya' | 'frasa' | 'kalimat' | 'fonotaktik' | 'catatan' | 'excel' | 'dialektometri'>('swadesh');
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [selectedBidangBudaya, setSelectedBidangBudaya] = useState<string>('a');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'filled' | 'unfilled' | 'with_audio'>('all');
  const [budayaSearchScope, setBudayaSearchScope] = useState<'all' | 'selected'>('all');
  const [focusedInput, setFocusedInput] = useState<{ id: string; field: string } | null>(null);

  // Comparative Swadesh & Phonemic Shift Detection State
  const [comparisonSurveyId, setComparisonSurveyId] = useState<string | null>(null);
  const [highlightPhonemicShifts, setHighlightPhonemicShifts] = useState<boolean>(true);
  const [shiftRuleFilter, setShiftRuleFilter] = useState<string | null>(null);
  const [expandedAlignmentId, setExpandedAlignmentId] = useState<number | null>(null);
  const [phoneticShiftFilter, setPhoneticShiftFilter] = useState<'all' | 'shifts_only' | 'identical_only' | 'lexical_only'>('all');

  // Real-time sentiment & qualitative context analysis for collector's field notes
  const fieldNotesSentiment = useMemo(() => {
    return analyzeQualitativeFieldNotes(data.catatanPengumpul, data.swadeshList);
  }, [data.catatanPengumpul, data.swadeshList]);

  // Handler to quickly apply fieldwork note presets
  const handleApplyFieldNotePreset = (preset: typeof FIELD_NOTE_PRESETS[0]) => {
    if (!onUpdateCatatanPengumpul) return;
    onUpdateCatatanPengumpul('suasanaWawancara', preset.suasana);
    onUpdateCatatanPengumpul('catatanPengumpul', preset.catatan);
    onUpdateCatatanPengumpul('waktuDiperlukan', preset.waktu);
  };

  // Quick insertion helper for IPA phonetic symbols (reliable React input value setter)
  const handleInsertIpa = (symbol: string) => {
    if (!focusedInput) return;
    const el = document.getElementById(focusedInput.id) as HTMLInputElement | null;
    if (el) {
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;
      const val = el.value;
      const newVal = val.substring(0, start) + symbol + val.substring(end);
      
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      if (nativeSetter) {
        nativeSetter.call(el, newVal);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        el.value = newVal;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      setTimeout(() => {
        el.setSelectionRange(start + symbol.length, start + symbol.length);
        el.focus();
      }, 10);
    }
  };

  // Swadesh filled statistics (Real-Time)
  const swadeshFilledCount = useMemo(() => {
    return data.swadeshList.filter(s => s.bentukLokal && s.bentukLokal.trim() !== '').length;
  }, [data.swadeshList]);

  const swadeshAudioCount = useMemo(() => {
    return data.swadeshList.filter(s => s.audioUrl && s.audioUrl.trim() !== '').length;
  }, [data.swadeshList]);

  const swadeshIpaCount = useMemo(() => {
    return data.swadeshList.filter(s => s.transkripsiIPA && s.transkripsiIPA.trim() !== '').length;
  }, [data.swadeshList]);

  const swadeshTotalCount = useMemo(() => {
    return data.swadeshList.length || 200;
  }, [data.swadeshList]);

  const swadeshFilledPercentage = useMemo(() => {
    return swadeshTotalCount > 0 
      ? Math.round((swadeshFilledCount / swadeshTotalCount) * 1000) / 10 
      : 0;
  }, [swadeshFilledCount, swadeshTotalCount]);

  const swadeshAudioPercentage = useMemo(() => {
    return swadeshTotalCount > 0 
      ? Math.round((swadeshAudioCount / swadeshTotalCount) * 1000) / 10 
      : 0;
  }, [swadeshAudioCount, swadeshTotalCount]);

  const swadeshIpaPercentage = useMemo(() => {
    return swadeshTotalCount > 0 
      ? Math.round((swadeshIpaCount / swadeshTotalCount) * 1000) / 10 
      : 0;
  }, [swadeshIpaCount, swadeshTotalCount]);

  // Cultural vocabulary filled statistics
  const budayaTotalCount = useMemo(() => {
    return data.kosakataBudaya.reduce((acc, b) => acc + b.daftarKata.length, 0);
  }, [data.kosakataBudaya]);

  const budayaFilledCount = useMemo(() => {
    return data.kosakataBudaya.reduce(
      (acc, b) => acc + b.daftarKata.filter(k => k.bentukLokal && k.bentukLokal.trim() !== '').length, 
      0
    );
  }, [data.kosakataBudaya]);

  const budayaAudioCount = useMemo(() => {
    return data.kosakataBudaya.reduce(
      (acc, b) => acc + b.daftarKata.filter(k => k.audioUrl && k.audioUrl.trim() !== '').length, 
      0
    );
  }, [data.kosakataBudaya]);

  const frasaTotalCount = useMemo(() => {
    if (!data.strukturFrasa) return 0;
    return (
      (data.strukturFrasa.nominalPosesif?.length || 0) +
      (data.strukturFrasa.nominalPartitif?.length || 0) +
      (data.strukturFrasa.nominalAsalMaterial?.length || 0) +
      (data.strukturFrasa.frasaVerbal?.length || 0) +
      (data.strukturFrasa.frasaAdjektival?.length || 0) +
      (data.strukturFrasa.frasaAdverbial?.length || 0)
    );
  }, [data.strukturFrasa]);

  // Active Cultural Category
  const activeBudaya = useMemo(() => {
    return data.kosakataBudaya.find(b => b.kode === selectedBidangBudaya) || data.kosakataBudaya[0];
  }, [data.kosakataBudaya, selectedBidangBudaya]);

  // Flattened cultural words for search across all 18 fields
  const allBudayaWords = useMemo(() => {
    return data.kosakataBudaya.flatMap(bidang => 
      bidang.daftarKata.map(kata => ({
        ...kata,
        bidangKode: bidang.kode,
        bidangNama: bidang.namaBidang
      }))
    );
  }, [data.kosakataBudaya]);

  // List of other surveys available for comparative analysis
  const availableComparisonSurveys = useMemo(() => {
    return (allSurveys || []).filter(s => s.id !== activeSurveyId);
  }, [allSurveys, activeSurveyId]);

  // Demo dialect comparison points
  const availableDemoPoints = useMemo(() => {
    return [
      { id: 'TP-02', label: 'TP-02 Cikaso (Sunda Pesisir Selatan)', desa: 'Cikaso', bahasa: 'Sunda' },
      { id: 'TP-03', label: 'TP-03 Rancabuaya (Sunda Dialek Garut Selatan)', desa: 'Rancabuaya', bahasa: 'Sunda' },
      { id: 'TP-04', label: 'TP-04 Pangandaran (Peralihan Sunda-Jawa)', desa: 'Pangandaran', bahasa: 'Sunda-Jawa' },
      { id: 'preset_jawa_banyumasan', label: 'Kamus Dialek Jawa Banyumasan (Kulonan)', desa: 'Banyumas', bahasa: 'Jawa Banyumasan' }
    ];
  }, []);

  // Currently selected comparison point target meta
  const selectedComparisonTarget = useMemo(() => {
    if (!comparisonSurveyId) return null;
    const survey = availableComparisonSurveys.find(s => s.id === comparisonSurveyId);
    if (survey) {
      return {
        id: survey.id,
        name: survey.title || `Survei Desa ${survey.desa || survey.data?.titikPengamatan?.namaDesa || 'Pembanding'}`,
        desa: survey.desa || survey.data?.titikPengamatan?.namaDesa || 'Desa Pembanding',
        bahasa: survey.bahasa || survey.data?.titikPengamatan?.bahasaDigunakan || 'Bahasa Pembanding',
        isSurvey: true
      };
    }
    const demo = availableDemoPoints.find(d => d.id === comparisonSurveyId);
    if (demo) {
      return {
        id: demo.id,
        name: demo.label,
        desa: demo.desa,
        bahasa: demo.bahasa,
        isSurvey: false
      };
    }
    return null;
  }, [comparisonSurveyId, availableComparisonSurveys, availableDemoPoints]);

  // Extract vocabulary entries for comparison point
  const comparisonVocabularyMap = useMemo(() => {
    if (!comparisonSurveyId) return {};
    return getVocabularyForPoint(
      comparisonSurveyId,
      data,
      dialektometriData?.titikPembandingList,
      allSurveys
    );
  }, [comparisonSurveyId, data, dialektometriData, allSurveys]);

  // Aligned Swadesh items with detected phonemic shifts
  const swadeshPhonemicComparisonList = useMemo(() => {
    if (!comparisonSurveyId) return [];

    return data.swadeshList.map(item => {
      const glosKey = item.glosIndonesia.toLowerCase().trim();
      const compEntry = comparisonVocabularyMap[glosKey];

      const bentuk1 = item.bentukLokal || '';
      const ipa1 = item.transkripsiIPA || (bentuk1 ? `[${bentuk1}]` : '');
      const bentuk2 = compEntry?.bentuk || '';
      const ipa2 = compEntry?.ipa || (bentuk2 ? `[${bentuk2}]` : '');

      const alignment = alignPhoneticSegments(ipa1, ipa2, bentuk1, bentuk2, item.glosIndonesia);
      const hasShifts = alignment.shifts.length > 0;

      return {
        id: item.id,
        item,
        bentuk1,
        ipa1,
        bentuk2,
        ipa2,
        compCatatan: compEntry?.catatan,
        alignment,
        hasShifts,
        shifts: alignment.shifts,
        similarityPct: alignment.similarityPct,
        similarityBadge: alignment.similarityBadge
      };
    });
  }, [comparisonSurveyId, data.swadeshList, comparisonVocabularyMap]);

  // Map by id for O(1) lookup
  const swadeshPhonemicComparisonMap = useMemo(() => {
    const map = new Map<number, (typeof swadeshPhonemicComparisonList)[0]>();
    swadeshPhonemicComparisonList.forEach(row => map.set(row.id, row));
    return map;
  }, [swadeshPhonemicComparisonList]);

  // Aggregate corpus phonetic summary
  const corpusPhoneticSummary: CorpusPhoneticSummary | null = useMemo(() => {
    if (!comparisonSurveyId || swadeshPhonemicComparisonList.length === 0) return null;

    const pairData = swadeshPhonemicComparisonList.map(row => ({
      glos: row.item.glosIndonesia,
      bentuk1: row.bentuk1,
      ipa1: row.ipa1,
      bentuk2: row.bentuk2,
      ipa2: row.ipa2
    }));

    return analyzeCorpusPhonetics(pairData);
  }, [comparisonSurveyId, swadeshPhonemicComparisonList]);

  // Total words with detected shifts
  const totalWordsWithShifts = useMemo(() => {
    return swadeshPhonemicComparisonList.filter(w => w.hasShifts).length;
  }, [swadeshPhonemicComparisonList]);

  // Filter 200 Swadesh list with search query, status filter, and phonemic shift filters
  const filteredSwadesh = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return data.swadeshList.filter(item => {
      // Comparison phonemic shift filters
      if (comparisonSurveyId) {
        const compData = swadeshPhonemicComparisonMap.get(item.id);
        if (compData) {
          if (phoneticShiftFilter === 'shifts_only' && !compData.hasShifts) return false;
          if (phoneticShiftFilter === 'identical_only' && compData.similarityPct < 99.5) return false;
          if (phoneticShiftFilter === 'lexical_only' && compData.similarityPct >= 45) return false;
          if (shiftRuleFilter && !compData.shifts.some(s => s.shiftType === shiftRuleFilter || `${s.soundA} ↔ ${s.soundB}` === shiftRuleFilter)) return false;
        }
      }

      // Status filter
      const isFilled = Boolean(item.bentukLokal && item.bentukLokal.trim() !== '');
      if (statusFilter === 'filled' && !isFilled) return false;
      if (statusFilter === 'unfilled' && isFilled) return false;
      if (statusFilter === 'with_audio' && (!item.audioUrl || item.audioUrl.trim() === '')) return false;

      // Keyword search
      if (!q) return true;

      // Check number match
      if (item.id.toString() === q || item.id.toString().startsWith(q)) return true;

      // Check text matches
      const matchGlos = item.glosIndonesia.toLowerCase().includes(q);
      const matchLokal = item.bentukLokal ? item.bentukLokal.toLowerCase().includes(q) : false;
      const matchIPA = item.transkripsiIPA ? item.transkripsiIPA.toLowerCase().includes(q) : false;
      const matchCatatan = item.catatan ? item.catatan.toLowerCase().includes(q) : false;

      // If comparison active, also check comparison target's word & IPA
      if (comparisonSurveyId) {
        const compData = swadeshPhonemicComparisonMap.get(item.id);
        if (compData) {
          const matchCompLokal = compData.bentuk2.toLowerCase().includes(q);
          const matchCompIPA = compData.ipa2.toLowerCase().includes(q);
          if (matchCompLokal || matchCompIPA) return true;
        }
      }

      return matchGlos || matchLokal || matchIPA || matchCatatan;
    });
  }, [
    data.swadeshList, 
    searchQuery, 
    statusFilter, 
    comparisonSurveyId, 
    swadeshPhonemicComparisonMap, 
    phoneticShiftFilter, 
    shiftRuleFilter
  ]);

  // Filter Cultural words (either all 18 bidang or active bidang)
  const filteredBudaya = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    
    // Choose source dataset
    const sourceList = (budayaSearchScope === 'all' || q)
      ? allBudayaWords
      : activeBudaya.daftarKata.map(kata => ({
          ...kata,
          bidangKode: activeBudaya.kode,
          bidangNama: activeBudaya.namaBidang
        }));

    return sourceList.filter(item => {
      // Status filter
      const isFilled = Boolean(item.bentukLokal && item.bentukLokal.trim() !== '');
      if (statusFilter === 'filled' && !isFilled) return false;
      if (statusFilter === 'unfilled' && isFilled) return false;
      if (statusFilter === 'with_audio' && (!item.audioUrl || item.audioUrl.trim() === '')) return false;

      // If scope is explicitly set to selected (and not 'all'), check bidang kode
      if (budayaSearchScope === 'selected' && item.bidangKode !== selectedBidangBudaya) {
        return false;
      }

      // Keyword search
      if (!q) return true;

      const matchId = item.id.toString() === q;
      const matchGlos = item.glosIndonesia.toLowerCase().includes(q);
      const matchLokal = item.bentukLokal ? item.bentukLokal.toLowerCase().includes(q) : false;
      const matchIPA = item.transkripsiIPA ? item.transkripsiIPA.toLowerCase().includes(q) : false;
      const matchCatatan = item.catatan ? item.catatan.toLowerCase().includes(q) : false;
      const matchBidang = item.bidangNama.toLowerCase().includes(q) || item.bidangKode.toLowerCase() === q;

      return matchId || matchGlos || matchLokal || matchIPA || matchCatatan || matchBidang;
    });
  }, [allBudayaWords, activeBudaya, budayaSearchScope, selectedBidangBudaya, searchQuery, statusFilter]);

  // Overall match counts for badges
  const swadeshMatchCount = filteredSwadesh.length;
  const budayaMatchCount = useMemo(() => {
    if (!searchQuery.trim()) return budayaTotalCount;
    const q = searchQuery.trim().toLowerCase();
    return allBudayaWords.filter(item => 
      item.glosIndonesia.toLowerCase().includes(q) ||
      (item.bentukLokal && item.bentukLokal.toLowerCase().includes(q)) ||
      (item.transkripsiIPA && item.transkripsiIPA.toLowerCase().includes(q)) ||
      (item.bidangNama && item.bidangNama.toLowerCase().includes(q))
    ).length;
  }, [allBudayaWords, searchQuery, budayaTotalCount]);

  // Detail & Edit Modal State for Vocabulary Items
  const [detailModalState, setDetailModalState] = useState<{
    isOpen: boolean;
    item: KosakataItem | null;
    category: 'swadesh' | 'budaya' | 'excel';
    bidangKode?: string;
    categoryName: string;
    index: number;
    mode: 'detail' | 'edit';
  }>({
    isOpen: false,
    item: null,
    category: 'swadesh',
    categoryName: 'Daftar Swadesh 200',
    index: 0,
    mode: 'detail'
  });

  const handleOpenSwadeshDetail = (item: KosakataItem, index: number, mode: 'detail' | 'edit' = 'detail') => {
    setDetailModalState({
      isOpen: true,
      item,
      category: 'swadesh',
      categoryName: 'Daftar Swadesh 200',
      index,
      mode
    });
  };

  const handleOpenBudayaDetail = (item: {
    id: number;
    glosIndonesia: string;
    bentukLokal: string;
    transkripsiIPA: string;
    catatan?: string;
    audioUrl?: string;
    audioFileName?: string;
    audioDuration?: string;
    bidangKode: string;
    bidangNama: string;
  }, index: number, mode: 'detail' | 'edit' = 'detail') => {
    setDetailModalState({
      isOpen: true,
      item: {
        id: item.id,
        glosIndonesia: item.glosIndonesia,
        bentukLokal: item.bentukLokal,
        transkripsiIPA: item.transkripsiIPA,
        catatan: item.catatan,
        audioUrl: item.audioUrl,
        audioFileName: item.audioFileName,
        audioDuration: item.audioDuration
      },
      category: 'budaya',
      bidangKode: item.bidangKode,
      categoryName: `Budaya ${item.bidangKode.toUpperCase()}: ${item.bidangNama}`,
      index,
      mode
    });
  };

  const handleOpenExcelDetail = (item: KosakataItem, index: number, mode: 'detail' | 'edit' = 'detail') => {
    setDetailModalState({
      isOpen: true,
      item,
      category: 'excel',
      categoryName: 'Kosakata Impor Excel',
      index,
      mode
    });
  };

  const handleModalSave = (updated: KosakataItem) => {
    if (detailModalState.category === 'swadesh') {
      onUpdateSwadeshItem(updated.id, 'glosIndonesia', updated.glosIndonesia);
      onUpdateSwadeshItem(updated.id, 'bentukLokal', updated.bentukLokal);
      onUpdateSwadeshItem(updated.id, 'transkripsiIPA', updated.transkripsiIPA);
      onUpdateSwadeshItem(updated.id, 'catatan', updated.catatan || '');
      if (onUpdateSwadeshAudio) {
        onUpdateSwadeshAudio(updated.id, updated.audioUrl, updated.audioFileName, updated.audioDuration);
      }
    } else if (detailModalState.category === 'budaya' && detailModalState.bidangKode) {
      onUpdateBudayaItem(detailModalState.bidangKode, updated.id, 'glosIndonesia', updated.glosIndonesia);
      onUpdateBudayaItem(detailModalState.bidangKode, updated.id, 'bentukLokal', updated.bentukLokal);
      onUpdateBudayaItem(detailModalState.bidangKode, updated.id, 'transkripsiIPA', updated.transkripsiIPA);
      onUpdateBudayaItem(detailModalState.bidangKode, updated.id, 'catatan', updated.catatan || '');
      if (onUpdateBudayaAudio) {
        onUpdateBudayaAudio(detailModalState.bidangKode, updated.id, updated.audioUrl, updated.audioFileName, updated.audioDuration);
      }
    } else if (detailModalState.category === 'excel' && onUpdateExcelItem) {
      onUpdateExcelItem(updated.id, 'glosIndonesia', updated.glosIndonesia);
      onUpdateExcelItem(updated.id, 'bentukLokal', updated.bentukLokal);
      onUpdateExcelItem(updated.id, 'transkripsiIPA', updated.transkripsiIPA);
      onUpdateExcelItem(updated.id, 'catatan', updated.catatan || '');
      if (onUpdateExcelAudio) {
        onUpdateExcelAudio(updated.id, updated.audioUrl, updated.audioFileName, updated.audioDuration);
      }
    }
    setDetailModalState(prev => ({
      ...prev,
      item: updated
    }));
  };

  const handleModalPrev = () => {
    const idx = detailModalState.index;
    if (idx <= 0) return;
    const prevIdx = idx - 1;
    if (detailModalState.category === 'swadesh') {
      const target = filteredSwadesh[prevIdx];
      if (target) handleOpenSwadeshDetail(target, prevIdx, detailModalState.mode);
    } else if (detailModalState.category === 'budaya') {
      const target = filteredBudaya[prevIdx];
      if (target) handleOpenBudayaDetail(target, prevIdx, detailModalState.mode);
    } else if (detailModalState.category === 'excel' && data.excelImportedList) {
      const target = data.excelImportedList[prevIdx];
      if (target) handleOpenExcelDetail(target, prevIdx, detailModalState.mode);
    }
  };

  const handleModalNext = () => {
    const idx = detailModalState.index;
    const nextIdx = idx + 1;
    if (detailModalState.category === 'swadesh') {
      if (nextIdx >= filteredSwadesh.length) return;
      const target = filteredSwadesh[nextIdx];
      if (target) handleOpenSwadeshDetail(target, nextIdx, detailModalState.mode);
    } else if (detailModalState.category === 'budaya') {
      if (nextIdx >= filteredBudaya.length) return;
      const target = filteredBudaya[nextIdx];
      if (target) handleOpenBudayaDetail(target, nextIdx, detailModalState.mode);
    } else if (detailModalState.category === 'excel' && data.excelImportedList) {
      if (nextIdx >= data.excelImportedList.length) return;
      const target = data.excelImportedList[nextIdx];
      if (target) handleOpenExcelDetail(target, nextIdx, detailModalState.mode);
    }
  };

  return (
    <section id="section-15" className="scroll-mt-36 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs p-5 md:p-6 transition-all">
      {/* 1. Header Seksi 15 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-100 dark:border-indigo-900/60 shadow-2xs shrink-0">
            15
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Penginputan Daftar Kosakata, Frasa, dan Kalimat</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Instrumen lengkap 200 Swadesh, 18 kategori budaya dasar, struktur frasa, dan kalimat sederhana.
            </p>
          </div>
        </div>

        {/* Action Button: Unggah Excel Kosakata */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsExcelModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/80 text-xs font-bold shadow-2xs transition-all cursor-pointer hover:shadow-xs active:scale-98"
            title="Unggah file data excel kosakata (.xlsx, .xls, .csv)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Unggah Excel Kosakata</span>
          </button>
        </div>
      </div>

      {/* 2. Menu Navigasi Kosakata & Analisis (Bento Menu Grid Tertata Rapi & Proporsional) */}
      <div className="mb-6 bg-slate-50/90 dark:bg-slate-800/40 p-3 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-2xs space-y-4">
        
        {/* SECTION A: MODUL KORPUS & PENGINPUTAN DATA LAPANGAN (1 s.d. 5) */}
        <div>
          <div className="flex items-center justify-between mb-2.5 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Modul Penginputan Data Kosakata & Korpus (1 - 5)
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
              Klik kartu untuk berpindah lembar instrumen
            </span>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${data.excelImportedList && data.excelImportedList.length > 0 ? 'lg:grid-cols-6' : 'lg:grid-cols-5'} gap-2.5`}>
            
            {/* 1. 200 Swadesh */}
            <button
              type="button"
              onClick={() => setActiveSubTab('swadesh')}
              className={`text-left p-3 rounded-xl transition-all cursor-pointer flex flex-col justify-between border relative group ${
                activeSubTab === 'swadesh'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                  : 'bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-start justify-between gap-1.5 mb-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  activeSubTab === 'swadesh'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400'
                }`}>
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 font-mono">
                  MODUL 01
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  1. 200 Swadesh
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  Daftar kosakata dasar
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  activeSubTab === 'swadesh'
                    ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                    : 'bg-slate-100 dark:bg-slate-700/70 text-slate-600 dark:text-slate-400'
                }`}>
                  {swadeshFilledCount}/200 ({swadeshFilledPercentage}%)
                </span>
                {searchQuery && swadeshMatchCount > 0 && (
                  <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded-full font-bold">
                    {swadeshMatchCount} cari
                  </span>
                )}
              </div>
            </button>

            {/* 2. Kosakata Budaya */}
            <button
              type="button"
              onClick={() => setActiveSubTab('budaya')}
              className={`text-left p-3 rounded-xl transition-all cursor-pointer flex flex-col justify-between border relative group ${
                activeSubTab === 'budaya'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                  : 'bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-start justify-between gap-1.5 mb-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  activeSubTab === 'budaya'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400'
                }`}>
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 font-mono">
                  MODUL 02
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  2. Kosakata Budaya
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  18 Kategori budaya
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  activeSubTab === 'budaya'
                    ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                    : 'bg-slate-100 dark:bg-slate-700/70 text-slate-600 dark:text-slate-400'
                }`}>
                  {budayaFilledCount}/{budayaTotalCount} Terisi
                </span>
                {searchQuery && budayaMatchCount > 0 && (
                  <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded-full font-bold">
                    {budayaMatchCount} cari
                  </span>
                )}
              </div>
            </button>

            {/* 3. Struktur Frasa */}
            <button
              type="button"
              onClick={() => setActiveSubTab('frasa')}
              className={`text-left p-3 rounded-xl transition-all cursor-pointer flex flex-col justify-between border relative group ${
                activeSubTab === 'frasa'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                  : 'bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-start justify-between gap-1.5 mb-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  activeSubTab === 'frasa'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400'
                }`}>
                  <AlignLeft className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 font-mono">
                  MODUL 03
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  3. Struktur Frasa
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  Pola sintaksis frasa
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  activeSubTab === 'frasa'
                    ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                    : 'bg-slate-100 dark:bg-slate-700/70 text-slate-600 dark:text-slate-400'
                }`}>
                  {frasaTotalCount} Frasa
                </span>
                <span className="text-[10px] text-slate-400">Nomina/Verba</span>
              </div>
            </button>

            {/* 4. Kalimat Sederhana */}
            <button
              type="button"
              onClick={() => setActiveSubTab('kalimat')}
              className={`text-left p-3 rounded-xl transition-all cursor-pointer flex flex-col justify-between border relative group ${
                activeSubTab === 'kalimat'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                  : 'bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-start justify-between gap-1.5 mb-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  activeSubTab === 'kalimat'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400'
                }`}>
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 font-mono">
                  MODUL 04
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  4. Kalimat Sederhana
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  Klausa & tipe kalimat
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  activeSubTab === 'kalimat'
                    ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                    : 'bg-slate-100 dark:bg-slate-700/70 text-slate-600 dark:text-slate-400'
                }`}>
                  {data.kalimatSederhana.length} Kalimat
                </span>
                <span className="text-[10px] text-slate-400">Klausa Dasar</span>
              </div>
            </button>

            {/* 5. Catatan Pengumpul Data */}
            <button
              type="button"
              onClick={() => setActiveSubTab('catatan')}
              className={`text-left p-3 rounded-xl transition-all cursor-pointer flex flex-col justify-between border relative group ${
                activeSubTab === 'catatan'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                  : 'bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-start justify-between gap-1.5 mb-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  activeSubTab === 'catatan'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400'
                }`}>
                  <ClipboardList className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 font-mono">
                  MODUL 05
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  5. Catatan Lapangan
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  Sentimen & Konteks Lapangan
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1 ${
                  fieldNotesSentiment.sentimentPolarity === 'positif'
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                    : fieldNotesSentiment.sentimentPolarity === 'kritis'
                    ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                    : fieldNotesSentiment.sentimentPolarity === 'waspada'
                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                    : 'bg-slate-100 dark:bg-slate-700/70 text-slate-600 dark:text-slate-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    fieldNotesSentiment.sentimentPolarity === 'positif' ? 'bg-emerald-500' :
                    fieldNotesSentiment.sentimentPolarity === 'kritis' ? 'bg-rose-500' :
                    fieldNotesSentiment.sentimentPolarity === 'waspada' ? 'bg-amber-500' : 'bg-slate-400'
                  }`} />
                  <span>{fieldNotesSentiment.reliabilityIndex}% Validitas</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400">{fieldNotesSentiment.sentimentLabel.split(' ')[0]}</span>
              </div>
            </button>

            {/* 6. Kosakata Excel (Jika ada data impor) */}
            {data.excelImportedList && data.excelImportedList.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveSubTab('excel')}
                className={`text-left p-3 rounded-xl transition-all cursor-pointer flex flex-col justify-between border relative group ${
                  activeSubTab === 'excel'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-400'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5 mb-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    activeSubTab === 'excel'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400 font-mono">
                    EKSTERNAL
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    Kosakata Excel
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    Hasil impor file
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                    {data.excelImportedList.length} Entri
                  </span>
                </div>
              </button>
            )}

          </div>
        </div>

        {/* SECTION B: MODUL ANALISIS FONOTAKTIK & DIALEKTOMETRI (KOMPUTASI OTOMATIS) */}
        <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                Fitur Analisis & Komputasi Leksikal Otomatis
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
              Perhitungan fonologis & dialektometris berbasis korpus 200 Swadesh
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            {/* Analisis Fonotaktik Swadesh */}
            <button
              type="button"
              onClick={() => setActiveSubTab('fonotaktik')}
              className={`text-left p-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-between border relative group ${
                activeSubTab === 'fonotaktik'
                  ? 'bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/60 dark:to-blue-950/60 text-slate-900 dark:text-white shadow-xs border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20'
                  : 'bg-white dark:bg-slate-800/80 hover:bg-indigo-50/50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-transform group-hover:scale-105 ${
                  activeSubTab === 'fonotaktik'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                }`}>
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Analisis Fonotaktik Swadesh
                    </h4>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/80 text-indigo-800 dark:text-indigo-200 font-mono">
                      KV / KVK
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Pola suku kata, onset, nukleus, koda & kluster bunyi 200 Swadesh
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex flex-col items-end shrink-0 pl-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeSubTab === 'fonotaktik'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {activeSubTab === 'fonotaktik' ? 'Sedang Dibuka' : 'Buka Analisis'}
                </span>
              </div>
            </button>

            {/* Hitung Beda Leksikal (Dialektometri) Auto */}
            <button
              type="button"
              onClick={() => setActiveSubTab('dialektometri')}
              className={`text-left p-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-between border relative group ${
                activeSubTab === 'dialektometri'
                  ? 'bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/60 dark:to-emerald-950/60 text-slate-900 dark:text-white shadow-xs border-teal-500 dark:border-teal-400 ring-2 ring-teal-500/20'
                  : 'bg-white dark:bg-slate-800/80 hover:bg-teal-50/50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-teal-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-transform group-hover:scale-105 ${
                  activeSubTab === 'dialektometri'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300'
                }`}>
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Hitung Beda Leksikal (Dialektometri)
                    </h4>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-teal-100 dark:bg-teal-900/80 text-teal-800 dark:text-teal-200 font-mono">
                      Auto Guiter
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Kalkulator matriks persentase beda leksikal (s/n × 100%) antar titik
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex flex-col items-end shrink-0 pl-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeSubTab === 'dialektometri'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {activeSubTab === 'dialektometri' ? 'Sedang Dibuka' : 'Buka Kalkulator'}
                </span>
              </div>
            </button>

          </div>
        </div>

      </div>

      {/* Quick IPA Keyboard Assistant */}
      <div className="mb-4 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            Papan Pintas Simbol Fonetik (IPA): Klik untuk menyisipkan ke kolom transkripsi yang aktif
          </span>
          <span className="text-[10px] text-slate-400">Standar Transkripsi Fonetis</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {IPA_SYMBOLS.map(({ symbol, label }) => (
            <button
              key={symbol}
              type="button"
              onClick={() => handleInsertIpa(symbol)}
              title={label}
              className="px-2 py-0.5 text-xs font-mono font-medium bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-md transition-colors cursor-pointer"
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>

        {/* 15.1: 200 KOSAKATA SWADESH */}
      {activeSubTab === 'swadesh' && (
        <div className="space-y-4">
          {/* INDIKATOR KETERISIAN KOSAKATA SWADESH REAL-TIME SURVEI AKTIF */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-teal-50/90 via-sky-50/70 to-indigo-50/80 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 rounded-2xl border border-teal-200 dark:border-teal-800/80 shadow-2xs space-y-3 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-teal-600 text-white tracking-wider flex items-center gap-1 shadow-2xs">
                  <Activity className="w-3 h-3 animate-spin" />
                  Keterisian Swadesh (Survei Aktif)
                </span>
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                  {titikPengamatan?.namaDesa ? `Desa ${titikPengamatan.namaDesa}` : 'Survei Ini'}
                </h4>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  ({titikPengamatan?.bahasaDigunakan || 'Bahasa Utama'})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-teal-700 dark:text-teal-300">
                  {swadeshFilledPercentage}%
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold border ${
                  swadeshFilledPercentage >= 100
                    ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : swadeshFilledPercentage >= 75
                    ? 'bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-800'
                    : swadeshFilledPercentage >= 40
                    ? 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
                    : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                }`}>
                  {swadeshFilledPercentage >= 100 ? 'Lengkap (200/200)' : `${swadeshFilledCount}/200 Kata`}
                </span>

                {onNavigateToMenuKosakata && (
                  <button
                    type="button"
                    onClick={onNavigateToMenuKosakata}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-teal-800 dark:text-teal-200 border border-teal-300 dark:border-teal-700 text-xs font-bold transition-all shadow-2xs cursor-pointer ml-1"
                    title="Buka pemantauan kelengkapan seluruh survei di menu Kosakata"
                  >
                    <BarChart2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Lihat Lintas Survei</span>
                    <ArrowRight className="w-3 h-3 text-teal-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Animated Real-Time Progress Bar */}
            <div className="space-y-1">
              <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shadow-inner">
                <div
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    swadeshFilledPercentage >= 100
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      : swadeshFilledPercentage >= 75
                      ? 'bg-gradient-to-r from-teal-500 to-sky-500'
                      : swadeshFilledPercentage >= 40
                      ? 'bg-gradient-to-r from-indigo-500 to-teal-500'
                      : 'bg-gradient-to-r from-amber-500 to-yellow-500'
                  }`}
                  style={{ width: `${Math.min(100, swadeshFilledPercentage)}%` }}
                />
              </div>
            </div>

            {/* Detail Metric Chips & Relocation Note */}
            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 gap-2 pt-0.5 border-t border-teal-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2.5">
                <span>Sudah Terisi: <strong className="text-emerald-700 dark:text-emerald-300 font-mono">{swadeshFilledCount}</strong></span>
                <span>•</span>
                <span>Belum Terisi: <strong className="text-rose-700 dark:text-rose-300 font-mono">{swadeshTotalCount - swadeshFilledCount}</strong></span>
                <span>•</span>
                <span>Audio: <strong className="text-sky-700 dark:text-sky-300 font-mono">{swadeshAudioCount} ({swadeshAudioPercentage}%)</strong></span>
                <span>•</span>
                <span>IPA: <strong className="text-purple-700 dark:text-purple-300 font-mono">{swadeshIpaCount} ({swadeshIpaPercentage}%)</strong></span>
              </div>
              <span className="text-[10px] text-teal-700 dark:text-teal-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-teal-500" />
                Matriks kelengkapan seluruh survei tersedia di menu <strong>Kosakata</strong>.
              </span>
            </div>
          </div>

          {/* KOMPARASI ANTAR-SURVEI & DETEKSI PERGESERAN FONEM BANNER */}
          <div className="bg-gradient-to-r from-purple-50/90 via-indigo-50/70 to-blue-50/80 dark:from-purple-950/40 dark:via-slate-850 dark:to-slate-900 border border-purple-200/90 dark:border-purple-800/80 rounded-2xl p-4 shadow-2xs space-y-3.5 transition-colors">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Komparasi Swadesh & Deteksi Pergeseran Fonem Otomatis
                    </h4>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-600 text-white shadow-2xs">
                      Phonemic Shifts
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Bandingkan transkripsi fonetik IPA 200 kata Swadesh antara survei ini ({titikPengamatan?.namaDesa || 'Titik Ini'}) dengan survei lain, dan sorot secara visual pergeseran segmen fonem.
                  </p>
                </div>
              </div>

              {/* Selector Controls */}
              <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                {/* Comparison Target Select */}
                <select
                  value={comparisonSurveyId || ''}
                  onChange={(e) => {
                    const val = e.target.value || null;
                    setComparisonSurveyId(val);
                    setShiftRuleFilter(null);
                    setPhoneticShiftFilter('all');
                  }}
                  className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 rounded-xl font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 shadow-2xs cursor-pointer max-w-xs truncate"
                >
                  <option value="">-- Pilih Survei Pembanding untuk Komparasi Fonem --</option>
                  {availableComparisonSurveys.length > 0 && (
                    <optgroup label="Survei Tersimpan di Database">
                      {availableComparisonSurveys.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.title || `Desa ${s.desa || s.data?.titikPengamatan?.namaDesa || s.id}`} ({s.bahasa || s.data?.titikPengamatan?.bahasaDigunakan || 'Bahasa'})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="Titik Pembanding Dialektometri (Preset Korpus)">
                    {availableDemoPoints.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </optgroup>
                </select>

                {comparisonSurveyId && (
                  <>
                    <button
                      type="button"
                      onClick={() => setHighlightPhonemicShifts(!highlightPhonemicShifts)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        highlightPhonemicShifts
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800 shadow-2xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                      title="Nyalakan/matikan penyorotan visual pergeseran fonem"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Sorot Fonem: <strong>{highlightPhonemicShifts ? 'Aktif' : 'Mati'}</strong></span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setComparisonSurveyId(null);
                        setShiftRuleFilter(null);
                        setPhoneticShiftFilter('all');
                      }}
                      className="px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors cursor-pointer"
                    >
                      Tutup Komparasi
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* When comparison is active, show the rich phonetic overview panel */}
            {comparisonSurveyId && corpusPhoneticSummary && (
              <div className="pt-3 border-t border-purple-200/80 dark:border-purple-800/60 space-y-3">
                {/* 4 Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-white/90 dark:bg-slate-800/90 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/60 shadow-2xs">
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 block uppercase tracking-wider">
                      Pergeseran Fonem
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-xl font-black font-mono text-amber-900 dark:text-amber-300">
                        {corpusPhoneticSummary.totalShiftsDetected}
                      </span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                        kasus ({totalWordsWithShifts} kata)
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/90 dark:bg-slate-800/90 p-2.5 rounded-xl border border-purple-200 dark:border-purple-900/60 shadow-2xs">
                    <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 block uppercase tracking-wider">
                      Rata-Rata Kemiripan IPA
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-xl font-black font-mono text-purple-900 dark:text-purple-300">
                        {corpusPhoneticSummary.meanSimilarityPct}%
                      </span>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                        Needleman-Wunsch
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/90 dark:bg-slate-800/90 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 shadow-2xs">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block uppercase tracking-wider">
                      100% Identik
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-xl font-black font-mono text-emerald-900 dark:text-emerald-300">
                        {corpusPhoneticSummary.identicalCount}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        kognat sama
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/90 dark:bg-slate-800/90 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 shadow-2xs">
                    <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 block uppercase tracking-wider">
                      Beda Leksikal
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-xl font-black font-mono text-rose-900 dark:text-rose-300">
                        {corpusPhoneticSummary.lexicalDifferenceCount}
                      </span>
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
                        kata berbeda
                      </span>
                    </div>
                  </div>
                </div>

                {/* Top Shift Rules Filter Chips */}
                {corpusPhoneticSummary.topShiftRules.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mr-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Filter Aturan Pergeseran Teratas:
                    </span>
                    <button
                      type="button"
                      onClick={() => setShiftRuleFilter(null)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        shiftRuleFilter === null
                          ? 'bg-purple-600 text-white shadow-2xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Semua Kata ({data.swadeshList.length})
                    </button>
                    {corpusPhoneticSummary.topShiftRules.map((rule) => {
                      const isSelected = shiftRuleFilter === rule.ruleName;
                      return (
                        <button
                          key={rule.ruleName}
                          type="button"
                          onClick={() => setShiftRuleFilter(isSelected ? null : rule.ruleName)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-amber-600 text-white shadow-2xs scale-105'
                              : 'bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                          }`}
                          title={`Tampilkan kosakata yang mengalami pergeseran ${rule.ruleName}`}
                        >
                          <span className="font-mono font-bold">{rule.ruleName}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10">
                            {rule.count} kata
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Dialectometry Calculation Banner (when comparison not active) */}
          {!comparisonSurveyId && (
            <div className="bg-gradient-to-r from-indigo-50/90 via-white to-blue-50/70 border border-indigo-200/90 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Perhitungan Otomatis Persentase Beda Leksikal (Dialektometri)
                  </p>
                  <p className="text-[11px] text-slate-600">
                    {swadeshFilledCount} dari 200 kata Swadesh telah diinput. Hitung persentase perbedaan leksikal (s/n × 100%) dan sinkronkan ke Section 16 secara otomatis.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab('dialektometri')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                <span>Hitung Beda Leksikal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* SEARCH BAR & FILTER CONTROLS FOR SWADESH */}
          <div className="bg-slate-50/80 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 transition-colors">
            <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
              {/* Search input with clean icon & clear button */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nomor (contoh: 15), kata Indonesia (air), bentuk lokal, atau IPA..."
                  className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
                    title="Hapus pencarian"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status & Phonemic Filter Chips */}
              <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto text-xs">
                {comparisonSurveyId ? (
                  <>
                    <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
                      <Filter className="w-3 h-3" />
                      Filter Komparasi:
                    </span>
                    <button
                      type="button"
                      onClick={() => setPhoneticShiftFilter('all')}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        phoneticShiftFilter === 'all'
                          ? 'bg-purple-600 text-white font-bold shadow-2xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Semua (200)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhoneticShiftFilter('shifts_only')}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                        phoneticShiftFilter === 'shifts_only'
                          ? 'bg-amber-600 text-white font-bold shadow-2xs'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Pergeseran Fonem ({totalWordsWithShifts})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhoneticShiftFilter('identical_only')}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                        phoneticShiftFilter === 'identical_only'
                          ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>Identik ({corpusPhoneticSummary?.identicalCount || 0})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhoneticShiftFilter('lexical_only')}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                        phoneticShiftFilter === 'lexical_only'
                          ? 'bg-rose-600 text-white font-bold shadow-2xs'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800 hover:bg-rose-100'
                      }`}
                    >
                      <span>Beda Leksikal ({corpusPhoneticSummary?.lexicalDifferenceCount || 0})</span>
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mr-1">
                      <Filter className="w-3 h-3 text-slate-400" />
                      Status:
                    </span>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('all')}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        statusFilter === 'all'
                          ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Semua (200)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('filled')}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                        statusFilter === 'filled'
                          ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>Terisi ({swadeshFilledCount})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('unfilled')}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                        statusFilter === 'unfilled'
                          ? 'bg-amber-600 text-white font-bold shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <CircleDashed className="w-3 h-3 text-amber-500" />
                      <span>Belum ({200 - swadeshFilledCount})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('with_audio')}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                        statusFilter === 'with_audio'
                          ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Filter hanya kosakata yang memiliki rekaman suara"
                    >
                      <Volume2 className="w-3 h-3 text-emerald-600" />
                      <span>Ada Rekaman ({swadeshAudioCount})</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Results Indicator & Reset Action */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Menampilkan {filteredSwadesh.length} dari 200 Glos Swadesh
                </span>
                {comparisonSurveyId && selectedComparisonTarget && (
                  <span className="bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded text-[11px] font-semibold border border-purple-200 dark:border-purple-800">
                    Titik Pembanding: {selectedComparisonTarget.desa} ({selectedComparisonTarget.bahasa})
                  </span>
                )}
                {shiftRuleFilter && (
                  <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                    <span>Aturan: {shiftRuleFilter}</span>
                    <button
                      type="button"
                      onClick={() => setShiftRuleFilter(null)}
                      className="hover:text-amber-950 ml-1 font-bold"
                    >
                      ×
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded text-[11px] font-medium border border-indigo-100 dark:border-indigo-800">
                    Kata kunci: "{searchQuery}"
                  </span>
                )}
              </div>

              {(searchQuery || statusFilter !== 'all' || shiftRuleFilter || phoneticShiftFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setShiftRuleFilter(null);
                    setPhoneticShiftFilter('all');
                  }}
                  className="text-indigo-600 dark:text-sky-400 hover:underline font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Filter & Pencarian</span>
                </button>
              )}
            </div>
          </div>

          {/* TABLE FOR SWADESH (COMPARATIVE OR EDITABLE) */}
          {filteredSwadesh.length > 0 ? (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-[580px] overflow-y-auto shadow-2xs bg-white dark:bg-slate-900 transition-colors">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold z-10 shadow-2xs">
                  {comparisonSurveyId ? (
                    /* COMPARATIVE TABLE HEADER */
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">No</th>
                      <th className="py-2.5 px-3 w-32">Glos Indonesia</th>
                      <th className="py-2.5 px-3 w-56">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {titikPengamatan?.namaDesa || 'Titik A (Survei Ini)'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-normal">[Bentuk & IPA]</span>
                        </div>
                      </th>
                      <th className="py-2.5 px-3 w-56">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-purple-700 dark:text-purple-300">
                            {selectedComparisonTarget?.desa || 'Titik B (Pembanding)'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-normal">[Bentuk & IPA]</span>
                        </div>
                      </th>
                      <th className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Pergeseran Fonem [IPA] & Kemiripan</span>
                        </div>
                      </th>
                      <th className="py-2.5 px-2 w-28 text-center">Penyelarasan</th>
                    </tr>
                  ) : (
                    /* STANDARD EDITABLE HEADER */
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">No</th>
                      <th className="py-2.5 px-3 w-36">Glos Indonesia</th>
                      <th className="py-2.5 px-3 w-48">Bentuk Lokal / Ortografi</th>
                      <th className="py-2.5 px-3 w-44">Transkripsi Fonetik [IPA]</th>
                      <th className="py-2.5 px-3 w-52">Rekaman Suara</th>
                      <th className="py-2.5 px-3">Catatan Morfologis / Variasi</th>
                      <th className="py-2.5 px-2 w-24 text-center">Aksi</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {filteredSwadesh.map((item, index) => {
                    const compData = comparisonSurveyId ? swadeshPhonemicComparisonMap.get(item.id) : null;
                    const isExpanded = expandedAlignmentId === item.id;

                    return (
                      <React.Fragment key={`swadesh-${item.id}`}>
                        <tr className={`hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-colors ${
                          compData?.hasShifts ? 'bg-amber-50/25 dark:bg-amber-950/15' : ''
                        }`}>
                          <td className="py-2 px-3 text-center text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                            {item.id}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                            <button
                              type="button"
                              onClick={() => handleOpenSwadeshDetail(item, index, 'detail')}
                              className="text-left hover:text-blue-600 dark:hover:text-sky-400 hover:underline cursor-pointer font-bold"
                              title="Klik untuk membuka detail kosakata"
                            >
                              {item.glosIndonesia}
                            </button>
                          </td>

                          {/* COMPARISON MODE COLUMNS */}
                          {comparisonSurveyId && compData ? (
                            <>
                              {/* Titik A: Bentuk Lokal & Aligned IPA */}
                              <td className="py-2 px-3">
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-slate-100">
                                    {compData.bentuk1 || <span className="text-slate-400 italic font-normal">Belum diisi</span>}
                                  </span>
                                  {compData.ipa1 && (
                                    <div className="mt-0.5">
                                      {highlightPhonemicShifts ? (
                                        <PhoneticSegmentVisualizer
                                          mode="inline-tokens"
                                          targetPoint={1}
                                          alignment={compData.alignment}
                                          rawIpa1={compData.ipa1}
                                          rawIpa2={compData.ipa2}
                                          word1={compData.bentuk1}
                                          word2={compData.bentuk2}
                                          glos={item.glosIndonesia}
                                          point1Label={titikPengamatan?.namaDesa || 'Titik A'}
                                          point2Label={selectedComparisonTarget?.desa || 'Titik B'}
                                        />
                                      ) : (
                                        <span className="text-xs font-mono text-purple-700 dark:text-purple-300">
                                          {compData.ipa1}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Titik B: Bentuk Lokal & Aligned IPA */}
                              <td className="py-2 px-3">
                                <div>
                                  <span className="font-bold text-purple-900 dark:text-purple-200">
                                    {compData.bentuk2 || <span className="text-slate-400 italic font-normal">Kosong di pembanding</span>}
                                  </span>
                                  {compData.ipa2 && (
                                    <div className="mt-0.5">
                                      {highlightPhonemicShifts ? (
                                        <PhoneticSegmentVisualizer
                                          mode="inline-tokens"
                                          targetPoint={2}
                                          alignment={compData.alignment}
                                          rawIpa1={compData.ipa1}
                                          rawIpa2={compData.ipa2}
                                          word1={compData.bentuk1}
                                          word2={compData.bentuk2}
                                          glos={item.glosIndonesia}
                                          point1Label={titikPengamatan?.namaDesa || 'Titik A'}
                                          point2Label={selectedComparisonTarget?.desa || 'Titik B'}
                                        />
                                      ) : (
                                        <span className="text-xs font-mono text-purple-700 dark:text-purple-300">
                                          {compData.ipa2}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Pergeseran Fonem & Kemiripan */}
                              <td className="py-2 px-3">
                                <div className="space-y-1">
                                  {/* Shift Chips */}
                                  {compData.shifts.length > 0 ? (
                                    <div className="flex flex-wrap items-center gap-1">
                                      {compData.shifts.map((s, idx) => (
                                        <span
                                          key={idx}
                                          className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 shadow-2xs"
                                          title={s.description}
                                        >
                                          <span>/{s.soundA}/ ↔ /{s.soundB}/</span>
                                        </span>
                                      ))}
                                    </div>
                                  ) : compData.similarityPct >= 99.5 ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      <span>100% Identik</span>
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-500 font-medium">
                                      {compData.similarityBadge.label}
                                    </span>
                                  )}

                                  {/* Mini similarity percentage badge */}
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-mono font-bold ${compData.similarityBadge.colorClass}`}>
                                      {compData.similarityPct}% Kemiripan
                                    </span>
                                    <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-purple-600 rounded-full"
                                        style={{ width: `${compData.similarityPct}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Toggle Accordion Ribbon Grid */}
                              <td className="py-2 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => setExpandedAlignmentId(isExpanded ? null : item.id)}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                                    isExpanded
                                      ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                                      : 'bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                                  }`}
                                  title="Buka / tutup visualisasi penyelarasan fonem pita"
                                >
                                  <span>{isExpanded ? 'Tutup' : 'Inspeksi'}</span>
                                  {isExpanded ? (
                                    <ChevronUp className="w-3 h-3" />
                                  ) : (
                                    <ChevronDown className="w-3 h-3" />
                                  )}
                                </button>
                              </td>
                            </>
                          ) : (
                            /* STANDARD EDITABLE ROW */
                            <>
                              <td className="py-1 px-2">
                                <input
                                  id={`swadesh-lokal-${item.id}`}
                                  type="text"
                                  value={item.bentukLokal}
                                  onChange={(e) => onUpdateSwadeshItem(item.id, 'bentukLokal', e.target.value)}
                                  onFocus={() => setFocusedInput({ id: `swadesh-lokal-${item.id}`, field: 'bentukLokal' })}
                                  placeholder="Isi bentuk lokal..."
                                  className="w-full px-2.5 py-1 text-xs bg-slate-50/60 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 focus:bg-white dark:focus:bg-slate-700 border border-transparent focus:border-indigo-400 rounded-md transition-colors text-slate-900 dark:text-slate-100"
                                />
                              </td>
                              <td className="py-1 px-2">
                                <input
                                  id={`swadesh-ipa-${item.id}`}
                                  type="text"
                                  value={item.transkripsiIPA}
                                  onChange={(e) => onUpdateSwadeshItem(item.id, 'transkripsiIPA', e.target.value)}
                                  onFocus={() => setFocusedInput({ id: `swadesh-ipa-${item.id}`, field: 'transkripsiIPA' })}
                                  placeholder="[...]"
                                  className="w-full px-2.5 py-1 text-xs font-mono bg-slate-50/60 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 focus:bg-white dark:focus:bg-slate-700 border border-transparent focus:border-indigo-400 rounded-md text-indigo-900 dark:text-purple-300 transition-colors"
                                />
                              </td>
                              <td className="py-1 px-2">
                                <VocabularyAudioUploader
                                  audioUrl={item.audioUrl}
                                  audioFileName={item.audioFileName}
                                  audioDuration={item.audioDuration}
                                  onAudioChange={(url, fileName, duration) => {
                                    if (onUpdateSwadeshAudio) {
                                      onUpdateSwadeshAudio(item.id, url, fileName, duration);
                                    } else {
                                      onUpdateSwadeshItem(item.id, 'audioUrl', url || '');
                                      onUpdateSwadeshItem(item.id, 'audioFileName', fileName || '');
                                    }
                                  }}
                                  itemName={`${item.id}_${item.glosIndonesia}`}
                                />
                              </td>
                              <td className="py-1 px-2">
                                <input
                                  id={`swadesh-catatan-${item.id}`}
                                  type="text"
                                  value={item.catatan || ''}
                                  onChange={(e) => onUpdateSwadeshItem(item.id, 'catatan', e.target.value)}
                                  placeholder="Keterangan..."
                                  className="w-full px-2.5 py-1 text-[11px] text-slate-500 bg-transparent border-none focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-indigo-300 rounded-md"
                                />
                              </td>
                              <td className="py-1 px-2 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenSwadeshDetail(item, index, 'detail')}
                                    className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-700 transition-colors cursor-pointer"
                                    title="Buka Tampilan Detail"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenSwadeshDetail(item, index, 'edit')}
                                    className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-700 transition-colors cursor-pointer"
                                    title="Edit Kosakata Lengkap"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>

                        {/* ACCORDION RIBBON GRID WHEN EXPANDED */}
                        {comparisonSurveyId && compData && isExpanded && (
                          <tr className="bg-purple-50/60 dark:bg-purple-950/40 border-b border-purple-200 dark:border-purple-800">
                            <td colSpan={6} className="p-4 sm:p-5">
                              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-purple-200/90 dark:border-purple-800/80 shadow-xs space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-purple-600" />
                                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                                      Penyelarasan Pita Fonetik Segmen IPA #{item.id} - "{item.glosIndonesia}"
                                    </h5>
                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                                      Skor Keselarasan: {compData.similarityPct}%
                                    </span>
                                  </div>
                                  <span className="text-xs text-slate-500">
                                    {titikPengamatan?.namaDesa || 'Titik A'} ↔ {selectedComparisonTarget?.desa || 'Titik B'}
                                  </span>
                                </div>

                                <PhoneticSegmentVisualizer
                                  mode="ribbon-grid"
                                  alignment={compData.alignment}
                                  point1Label={titikPengamatan?.namaDesa || 'Survei Ini'}
                                  point2Label={selectedComparisonTarget?.desa || 'Pembanding'}
                                  rawIpa1={compData.ipa1}
                                  rawIpa2={compData.ipa2}
                                  word1={compData.bentuk1}
                                  word2={compData.bentuk2}
                                  glos={item.glosIndonesia}
                                />
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* EMPTY STATE WITH QUICK HOP TO BUDAYA */
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl my-3">
              <Search className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-80" />
              <h4 className="text-sm font-bold text-slate-800">Tidak Ada Kosakata Swadesh yang Cocok</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Tidak ditemukan kata dengan kata kunci "<span className="font-semibold text-slate-700">{searchQuery}</span>" pada filter status saat ini.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Reset Filter & Pencarian
                </button>
                {searchQuery && budayaMatchCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('budaya')}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <span>Cari di Kosakata Budaya ({budayaMatchCount} kata cocok)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 15.2: KOSAKATA BUDAYA DASAR (18 BIDANG a-r) */}
      {activeSubTab === 'budaya' && (
        <div className="space-y-4">
          {/* SEARCH BAR & FILTER CONTROLS FOR KOSAKATA BUDAYA */}
          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kata budaya (contoh: perahu, rumah, sagu, adat, tombak, kelapa, tenun)..."
                  className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
                    title="Hapus pencarian"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Scope Selector: All 18 Bidang vs Active Bidang */}
              <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setBudayaSearchScope('all')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    budayaSearchScope === 'all'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>Semua 18 Bidang</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBudayaSearchScope('selected')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                    budayaSearchScope === 'selected'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Hanya Bidang {activeBudaya.kode.toUpperCase()}</span>
                </button>
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto text-xs">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mr-1">
                  <Filter className="w-3 h-3 text-slate-400" />
                  Status:
                </span>
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Semua ({budayaTotalCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('filled')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                    statusFilter === 'filled'
                      ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Terisi ({budayaFilledCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('unfilled')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                    statusFilter === 'unfilled'
                      ? 'bg-amber-600 text-white font-bold shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <CircleDashed className="w-3 h-3 text-amber-500" />
                  <span>Belum ({budayaTotalCount - budayaFilledCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('with_audio')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                    statusFilter === 'with_audio'
                      ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Filter hanya kosakata budaya yang memiliki rekaman suara"
                >
                  <Volume2 className="w-3 h-3 text-emerald-600" />
                  <span>Ada Rekaman ({budayaAudioCount})</span>
                </button>
              </div>
            </div>

            {/* Indicator bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 pt-1 border-t border-slate-200/60">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">
                  {budayaSearchScope === 'all'
                    ? `Menampilkan ${filteredBudaya.length} kata dari seluruh 18 bidang budaya`
                    : `Menampilkan ${filteredBudaya.length} kata dari Bidang ${activeBudaya.kode.toUpperCase()}: ${activeBudaya.namaBidang}`}
                </span>
                {searchQuery && (
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[11px] font-medium border border-indigo-100">
                    Kata kunci: "{searchQuery}"
                  </span>
                )}
                {statusFilter !== 'all' && (
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200">
                    Filter: {statusFilter === 'filled' ? 'Sudah Terisi' : 'Belum Terisi'}
                  </span>
                )}
              </div>

              {(searchQuery || statusFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Filter & Pencarian</span>
                </button>
              )}
            </div>
          </div>

          {/* 18 Bidang horizontal selector tabs (available when browsing or in active bidang mode) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-600" />
                <span>Pilih Kategori Bidang Budaya (a - r):</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Klik bidang untuk beralih fokus
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
              {data.kosakataBudaya.map((b) => {
                const filledInThis = b.daftarKata.filter(k => k.bentukLokal && k.bentukLokal.trim() !== '').length;
                return (
                  <button
                    key={b.kode}
                    type="button"
                    onClick={() => {
                      setSelectedBidangBudaya(b.kode);
                      if (budayaSearchScope === 'selected') {
                        // Keep selected scope active
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedBidangBudaya === b.kode
                        ? 'bg-indigo-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{b.kode.toUpperCase()}. {b.namaBidang}</span>
                    <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                      selectedBidangBudaya === b.kode ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {filledInThis}/{b.daftarKata.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bidang Header Banner */}
          <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-100 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-mono">
                  {activeBudaya.kode.toUpperCase()}
                </span>
                <span>Bidang {activeBudaya.kode.toUpperCase()}: {activeBudaya.namaBidang}</span>
              </h3>
              <p className="text-[11px] text-slate-600 mt-0.5">{activeBudaya.deskripsi}</p>
            </div>
            {budayaSearchScope === 'all' && (
              <span className="shrink-0 px-2 py-1 bg-white rounded border border-indigo-200 text-[10px] font-semibold text-indigo-700 shadow-2xs">
                Mode: Seluruh 18 Bidang
              </span>
            )}
          </div>

          {/* TABLE FOR CULTURAL VOCABULARY */}
          {filteredBudaya.length > 0 ? (
            <div className="border border-slate-200 rounded-lg overflow-hidden max-h-[500px] overflow-y-auto shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold z-10 shadow-2xs">
                  <tr>
                    <th className="py-2.5 px-3 w-16 text-center">No</th>
                    {budayaSearchScope === 'all' && (
                      <th className="py-2.5 px-3 w-40">Kategori Bidang</th>
                    )}
                    <th className="py-2.5 px-3 w-40">Glos Indonesia</th>
                    <th className="py-2.5 px-3 w-48">Bentuk Lokal</th>
                    <th className="py-2.5 px-3 w-44">Transkripsi Fonetik IPA</th>
                    <th className="py-2.5 px-3 w-52">Rekaman Suara</th>
                    <th className="py-2.5 px-3">Catatan Makna Budaya / Konteks</th>
                    <th className="py-2.5 px-2 w-24 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredBudaya.map((item, index) => (
                    <tr key={`${item.bidangKode}-${item.id}`} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="py-2 px-3 text-center text-slate-500 font-mono text-[11px]">
                        {item.id}
                      </td>
                      {budayaSearchScope === 'all' && (
                        <td className="py-2 px-3">
                          <button
                            type="button"
                            onClick={() => setSelectedBidangBudaya(item.bidangKode)}
                            className="text-left group cursor-pointer"
                            title="Klik untuk memilih kategori bidang ini"
                          >
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 block group-hover:bg-indigo-100 transition-colors">
                              {item.bidangKode.toUpperCase()}. {item.bidangNama}
                            </span>
                          </button>
                        </td>
                      )}
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        <button
                          type="button"
                          onClick={() => handleOpenBudayaDetail(item, index, 'detail')}
                          className="text-left hover:text-blue-600 hover:underline cursor-pointer font-bold"
                          title="Klik untuk membuka detail kosakata budaya"
                        >
                          {item.glosIndonesia}
                        </button>
                      </td>
                      <td className="py-1 px-2">
                        <input
                          id={`budaya-lokal-${item.bidangKode}-${item.id}`}
                          type="text"
                          value={item.bentukLokal}
                          onChange={(e) => onUpdateBudayaItem(item.bidangKode, item.id, 'bentukLokal', e.target.value)}
                          onFocus={() => setFocusedInput({ id: `budaya-lokal-${item.bidangKode}-${item.id}`, field: 'bentukLokal' })}
                          placeholder="Bentuk lokal..."
                          className="w-full px-2.5 py-1 text-xs bg-slate-50/60 hover:bg-white focus:bg-white border border-transparent focus:border-indigo-400 rounded-md transition-colors"
                        />
                      </td>
                      <td className="py-1 px-2">
                        <input
                          id={`budaya-ipa-${item.bidangKode}-${item.id}`}
                          type="text"
                          value={item.transkripsiIPA}
                          onChange={(e) => onUpdateBudayaItem(item.bidangKode, item.id, 'transkripsiIPA', e.target.value)}
                          onFocus={() => setFocusedInput({ id: `budaya-ipa-${item.bidangKode}-${item.id}`, field: 'transkripsiIPA' })}
                          placeholder="[...]"
                          className="w-full px-2.5 py-1 text-xs font-mono bg-slate-50/60 hover:bg-white focus:bg-white border border-transparent focus:border-indigo-400 rounded-md text-indigo-900 transition-colors"
                        />
                      </td>
                      <td className="py-1 px-2">
                        <VocabularyAudioUploader
                          audioUrl={item.audioUrl}
                          audioFileName={item.audioFileName}
                          audioDuration={item.audioDuration}
                          onAudioChange={(url, fileName, duration) => {
                            if (onUpdateBudayaAudio) {
                              onUpdateBudayaAudio(item.bidangKode, item.id, url, fileName, duration);
                            } else {
                              onUpdateBudayaItem(item.bidangKode, item.id, 'audioUrl', url || '');
                              onUpdateBudayaItem(item.bidangKode, item.id, 'audioFileName', fileName || '');
                            }
                          }}
                          itemName={`${item.bidangKode}_${item.id}_${item.glosIndonesia}`}
                        />
                      </td>
                      <td className="py-1 px-2">
                        <input
                          type="text"
                          value={item.catatan || ''}
                          onChange={(e) => onUpdateBudayaItem(item.bidangKode, item.id, 'catatan', e.target.value)}
                          placeholder="Konteks adat, bahan, atau pantangan..."
                          className="w-full px-2.5 py-1 text-[11px] text-slate-500 bg-transparent border-none focus:bg-white focus:ring-1 focus:ring-indigo-300 rounded-md"
                        />
                      </td>
                      <td className="py-1 px-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenBudayaDetail(item, index, 'detail')}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
                            title="Buka Tampilan Detail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenBudayaDetail(item, index, 'edit')}
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-pointer"
                            title="Edit Kosakata Lengkap"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* EMPTY STATE FOR BUDAYA */
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl my-3">
              <Search className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-80" />
              <h4 className="text-sm font-bold text-slate-800">Tidak Ada Kosakata Budaya yang Cocok</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Tidak ditemukan kata dengan kata kunci "<span className="font-semibold text-slate-700">{searchQuery}</span>" pada lingkup pencarian saat ini.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setBudayaSearchScope('all');
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Reset Filter & Pencarian
                </button>
                {searchQuery && swadeshMatchCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('swadesh')}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <span>Cari di 200 Swadesh ({swadeshMatchCount} kata cocok)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 15.3: STRUKTUR FRASA */}
      {activeSubTab === 'frasa' && (
        <div className="space-y-6">
          {/* Nominal Posesif */}
          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
              a. Frasa Nominal (1. Relasi Posesif Genitif, 2. Relasi Partitif, 3. Relasi Asal dan Material)
            </h3>
            
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-indigo-900">1. Relasi Posesif Genitif</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {data.strukturFrasa.nominalPosesif.map(item => (
                  <div key={item.id} className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">
                      {item.labelIndonesia}
                    </span>
                    <input
                      type="text"
                      value={item.bentukFrasaLokal}
                      onChange={(e) => onUpdateFrasaItem('nominalPosesif', item.id, 'bentukFrasaLokal', e.target.value)}
                      placeholder="Bentuk frasa lokal..."
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md mb-1.5 font-medium"
                    />
                    <input
                      type="text"
                      value={item.terjemahanHarfiah}
                      onChange={(e) => onUpdateFrasaItem('nominalPosesif', item.id, 'terjemahanHarfiah', e.target.value)}
                      placeholder="Terjemahan harfiah..."
                      className="w-full px-2.5 py-1 text-[11px] text-slate-500 border border-slate-100 rounded-md"
                    />
                  </div>
                ))}
              </div>

              <h4 className="text-xs font-semibold text-indigo-900 pt-2">2. Relasi Partitif</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {data.strukturFrasa.nominalPartitif.map(item => (
                  <div key={item.id} className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">
                      {item.labelIndonesia}
                    </span>
                    <input
                      type="text"
                      value={item.bentukFrasaLokal}
                      onChange={(e) => onUpdateFrasaItem('nominalPartitif', item.id, 'bentukFrasaLokal', e.target.value)}
                      placeholder="Bentuk frasa lokal..."
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md mb-1.5 font-medium"
                    />
                    <input
                      type="text"
                      value={item.terjemahanHarfiah}
                      onChange={(e) => onUpdateFrasaItem('nominalPartitif', item.id, 'terjemahanHarfiah', e.target.value)}
                      placeholder="Terjemahan harfiah..."
                      className="w-full px-2.5 py-1 text-[11px] text-slate-500 border border-slate-100 rounded-md"
                    />
                  </div>
                ))}
              </div>

              <h4 className="text-xs font-semibold text-indigo-900 pt-2">3. Relasi Asal dan Material</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {data.strukturFrasa.nominalAsalMaterial.map(item => (
                  <div key={item.id} className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">
                      {item.labelIndonesia}
                    </span>
                    <input
                      type="text"
                      value={item.bentukFrasaLokal}
                      onChange={(e) => onUpdateFrasaItem('nominalAsalMaterial', item.id, 'bentukFrasaLokal', e.target.value)}
                      placeholder="Bentuk frasa lokal..."
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md mb-1.5 font-medium"
                    />
                    <input
                      type="text"
                      value={item.terjemahanHarfiah}
                      onChange={(e) => onUpdateFrasaItem('nominalAsalMaterial', item.id, 'terjemahanHarfiah', e.target.value)}
                      placeholder="Terjemahan harfiah..."
                      className="w-full px-2.5 py-1 text-[11px] text-slate-500 border border-slate-100 rounded-md"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Frasa Verbal, Adjektival, Adverbial */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* b. Frasa Verbal */}
            <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 mb-2">b. Frasa Verbal</h4>
              <div className="space-y-3">
                {data.strukturFrasa.frasaVerbal.map(item => (
                  <div key={item.id} className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-700 block mb-1">{item.labelIndonesia}</span>
                    <input
                      type="text"
                      value={item.bentukFrasaLokal}
                      onChange={(e) => onUpdateFrasaItem('frasaVerbal', item.id, 'bentukFrasaLokal', e.target.value)}
                      placeholder="Bentuk lokal..."
                      className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md mb-1"
                    />
                    <input
                      type="text"
                      value={item.terjemahanHarfiah}
                      onChange={(e) => onUpdateFrasaItem('frasaVerbal', item.id, 'terjemahanHarfiah', e.target.value)}
                      placeholder="Harfiah..."
                      className="w-full px-2 py-0.5 text-[10px] text-slate-400 border border-slate-100 rounded"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* c. Frasa Adjektival */}
            <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 mb-2">c. Frasa Adjektival</h4>
              <div className="space-y-3">
                {data.strukturFrasa.frasaAdjektival.map(item => (
                  <div key={item.id} className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-700 block mb-1">{item.labelIndonesia}</span>
                    <input
                      type="text"
                      value={item.bentukFrasaLokal}
                      onChange={(e) => onUpdateFrasaItem('frasaAdjektival', item.id, 'bentukFrasaLokal', e.target.value)}
                      placeholder="Bentuk lokal..."
                      className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md mb-1"
                    />
                    <input
                      type="text"
                      value={item.terjemahanHarfiah}
                      onChange={(e) => onUpdateFrasaItem('frasaAdjektival', item.id, 'terjemahanHarfiah', e.target.value)}
                      placeholder="Harfiah..."
                      className="w-full px-2 py-0.5 text-[10px] text-slate-400 border border-slate-100 rounded"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* d. Frase Adverbial */}
            <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 mb-2">d. Frase Adverbial</h4>
              <div className="space-y-3">
                {data.strukturFrasa.frasaAdverbial.map(item => (
                  <div key={item.id} className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-700 block mb-1">{item.labelIndonesia}</span>
                    <input
                      type="text"
                      value={item.bentukFrasaLokal}
                      onChange={(e) => onUpdateFrasaItem('frasaAdverbial', item.id, 'bentukFrasaLokal', e.target.value)}
                      placeholder="Bentuk lokal..."
                      className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md mb-1"
                    />
                    <input
                      type="text"
                      value={item.terjemahanHarfiah}
                      onChange={(e) => onUpdateFrasaItem('frasaAdverbial', item.id, 'terjemahanHarfiah', e.target.value)}
                      placeholder="Harfiah..."
                      className="w-full px-2 py-0.5 text-[10px] text-slate-400 border border-slate-100 rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 15.4: KALIMAT SEDERHANA */}
      {activeSubTab === 'kalimat' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Input kalimat sederhana untuk menganalisis urutan fungsi sintaksis (S-P-O-K) bahasa setempat.
            </p>
            <button
              type="button"
              onClick={onAddKalimat}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Kalimat</span>
            </button>
          </div>

          <div className="space-y-3">
            {data.kalimatSederhana.map((k, index) => (
              <div key={k.id} className="p-4 bg-slate-50/60 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Contoh Kalimat #{index + 1}</span>
                  {data.kalimatSederhana.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveKalimat(k.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Kalimat Bahasa Indonesia</label>
                    <input
                      type="text"
                      value={k.kalimatIndonesia}
                      onChange={(e) => onUpdateKalimatItem(k.id, 'kalimatIndonesia', e.target.value)}
                      placeholder="Kalimat bahasa Indonesia..."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Terjemahan Bahasa Lokal</label>
                    <input
                      type="text"
                      value={k.kalimatLokal}
                      onChange={(e) => onUpdateKalimatItem(k.id, 'kalimatLokal', e.target.value)}
                      placeholder="Terjemahan bahasa daerah..."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-indigo-900 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Glos Kata Per Kata</label>
                    <input
                      type="text"
                      value={k.glosPerKata}
                      onChange={(e) => onUpdateKalimatItem(k.id, 'glosPerKata', e.target.value)}
                      placeholder="Misal: Saya-makan-ikan di-pantai"
                      className="w-full px-3 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Analisis Struktur Konstituen</label>
                    <input
                      type="text"
                      value={k.analisisStruktur}
                      onChange={(e) => onUpdateKalimatItem(k.id, 'analisisStruktur', e.target.value)}
                      placeholder="Contoh: S (Subjek) - P (Predikat) - O (Objek) - K (Keterangan)"
                      className="w-full px-3 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-600 font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 15.5: CATATAN PENGUMPUL DATA & ANALISIS SENTIMEN KUALITATIF (Halaman 35 Kuesioner) */}
      {activeSubTab === 'catatan' && (
        <div className="space-y-6">
          <div className="p-4 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-1">
                <ClipboardList className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Bagian V: Catatan Pengumpul Data & Analisis Sentimen Konteks Kualitatif (Halaman 35)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instrumen terintegrasi untuk mengevaluasi konteks observasi lapangan, reliabilitas tuturan informan, dan catatan kurasi verifikator linguistik.
              </p>
            </div>
          </div>

          {/* Fitur Analisis Sentimen & Audit Kualitatif untuk Verifikator */}
          <CatatanSentimentAnalysisPanel
            catatanData={data.catatanPengumpul}
            swadeshList={data.swadeshList}
            onUpdateCatatanPengumpul={onUpdateCatatanPengumpul}
            onApplyPreset={handleApplyFieldNotePreset}
          />

          {/* Form Isian Lapangan Bagian V */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <span>Formulir Baku Isian Lapangan (Halaman 35)</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">
                Seksi 15.5
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Tanggal Wawancara */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  1. Tanggal Wawancara Dilaksanakan
                </label>
                <input
                  type="text"
                  value={data.catatanPengumpul?.tanggalWawancara || ''}
                  onChange={(e) => onUpdateCatatanPengumpul && onUpdateCatatanPengumpul('tanggalWawancara', e.target.value)}
                  placeholder="Contoh: 14 Mei 2024"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* 2. Tempat/Latar Wawancara */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  2. Tempat/Latar Wawancara Dilaksanakan
                </label>
                <input
                  type="text"
                  value={data.catatanPengumpul?.tempatLatarWawancara || ''}
                  onChange={(e) => onUpdateCatatanPengumpul && onUpdateCatatanPengumpul('tempatLatarWawancara', e.target.value)}
                  placeholder="Contoh: Ruang tamu rumah narasumber 1, Desa Cikondang"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* 3. Waktu yang Diperlukan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  3. Waktu yang Diperlukan untuk Wawancara
                </label>
                <input
                  type="text"
                  value={data.catatanPengumpul?.waktuDiperlukan || ''}
                  onChange={(e) => onUpdateCatatanPengumpul && onUpdateCatatanPengumpul('waktuDiperlukan', e.target.value)}
                  placeholder="Contoh: 3 jam 30 menit (pukul 09.00 - 12.30 WIB)"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* 4. Jumlah Orang yang Hadir */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  4. Jumlah Orang yang Hadir Selama Wawancara
                </label>
                <input
                  type="text"
                  value={data.catatanPengumpul?.jumlahOrangHadir || ''}
                  onChange={(e) => onUpdateCatatanPengumpul && onUpdateCatatanPengumpul('jumlahOrangHadir', e.target.value)}
                  placeholder="Contoh: 3 orang (Narasumber utama, istri narasumber, tetua dusun)"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* 5. Suasana Selama Wawancara (Berpengaruh langsung ke Analisis Sentimen) */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>5. Suasana Selama Wawancara</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-normal">
                    *Mempengaruhi deteksi sentimen dan indeks reliabilitas
                  </span>
                </label>
                <input
                  type="text"
                  value={data.catatanPengumpul?.suasanaWawancara || ''}
                  onChange={(e) => onUpdateCatatanPengumpul && onUpdateCatatanPengumpul('suasanaWawancara', e.target.value)}
                  placeholder="Contoh: Sangat kooperatif, santai, dan narasumber sangat antusias menjelaskan istilah adat setempat"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* 6. Nama Lengkap Pengumpul Data */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  6. Nama Lengkap Pengumpul Data
                </label>
                <input
                  type="text"
                  value={data.catatanPengumpul?.namaLengkapPengumpul || ''}
                  onChange={(e) => onUpdateCatatanPengumpul && onUpdateCatatanPengumpul('namaLengkapPengumpul', e.target.value)}
                  placeholder="Nama peneliti / surveyor lapangan"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* 7. Pekerjaan Pengumpul Data */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  7. Pekerjaan Pengumpul Data
                </label>
                <input
                  type="text"
                  value={data.catatanPengumpul?.pekerjaanPengumpul || ''}
                  onChange={(e) => onUpdateCatatanPengumpul && onUpdateCatatanPengumpul('pekerjaanPengumpul', e.target.value)}
                  placeholder="Contoh: Peneliti Kebahasaan / Dosen Linguistik"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* 8. Tanda Tangan / Pengesahan */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  8. Tanda Tangan / Status Pengesahan Pengumpul Data
                </label>
                <input
                  type="text"
                  value={data.catatanPengumpul?.tandaTanganPengumpul || ''}
                  onChange={(e) => onUpdateCatatanPengumpul && onUpdateCatatanPengumpul('tandaTanganPengumpul', e.target.value)}
                  placeholder="Contoh: Terverifikasi Digital (Nama Pengumpul Data)"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* 9. Catatan Pengumpul Data (Teks Panjang) */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>9. Catatan Tambahan Pengumpul Data</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-normal">
                    *Tuliskan keraguan fonetik, varian usia, atau nuansa budaya
                  </span>
                </label>
                <textarea
                  rows={4}
                  value={data.catatanPengumpul?.catatanPengumpul || ''}
                  onChange={(e) => onUpdateCatatanPengumpul && onUpdateCatatanPengumpul('catatanPengumpul', e.target.value)}
                  placeholder="Tuliskan catatan khusus mengenai keraguan transkripsi fonetik, variasi usia penutur, atau istilah lokal yang memiliki makna budaya spesifik..."
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 15.6: KOSAKATA DARI EXCEL */}
      {activeSubTab === 'excel' && data.excelImportedList && (
        <div className="space-y-4">
          <div className="bg-emerald-50/70 p-4 rounded-lg border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                <h4 className="font-bold text-sm text-emerald-950">
                  Daftar Kosakata Impor Excel ({data.excelImportedList.length} Kosakata)
                </h4>
              </div>
              <p className="text-xs text-emerald-800 mt-0.5">
                Daftar kosakata kustom yang diekstrak langsung dari file lembar kerja Excel Anda. Lengkapi transkripsi dan rekaman audio suara per kata.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsExcelModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Impor File Baru</span>
              </button>

              {onAddExcelItem && (
                <button
                  type="button"
                  onClick={onAddExcelItem}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-700 text-white hover:bg-emerald-800 transition-colors shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Baris</span>
                </button>
              )}

              {onClearExcelList && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Yakin ingin menghapus seluruh daftar kosakata impor excel ini?')) {
                      onClearExcelList();
                      setActiveSubTab('swadesh');
                    }
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Hapus daftar excel"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Bersihkan</span>
                </button>
              )}
            </div>
          </div>

          {/* Table of Excel items */}
          <div className="border border-slate-200 rounded-lg overflow-x-auto bg-white shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">No</th>
                  <th className="py-2.5 px-3 w-1/4">Glos Indonesia</th>
                  <th className="py-2.5 px-3 w-1/4">Bentuk Lokal / Daerah</th>
                  <th className="py-2.5 px-3 w-1/4 font-mono">Transkripsi IPA</th>
                  <th className="py-2.5 px-3 w-40">Rekaman Audio</th>
                  <th className="py-2.5 px-3">Catatan</th>
                  {onRemoveExcelItem && <th className="py-2.5 px-2 w-10 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.excelImportedList.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2 px-3 text-center font-mono text-slate-400 font-semibold text-[11px]">
                      {item.id || idx + 1}
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.glosIndonesia}
                        onChange={(e) => onUpdateExcelItem && onUpdateExcelItem(item.id, 'glosIndonesia', e.target.value)}
                        placeholder="Glos Indonesia..."
                        className="w-full px-2 py-1 text-xs font-semibold text-slate-900 bg-slate-50/60 hover:bg-white focus:bg-white border border-transparent focus:border-indigo-400 rounded-md transition-colors"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.bentukLokal}
                        onChange={(e) => onUpdateExcelItem && onUpdateExcelItem(item.id, 'bentukLokal', e.target.value)}
                        placeholder="Isi bentuk lokal..."
                        className="w-full px-2 py-1 text-xs text-indigo-900 font-medium bg-slate-50/60 hover:bg-white focus:bg-white border border-transparent focus:border-indigo-400 rounded-md transition-colors"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.transkripsiIPA}
                        onChange={(e) => onUpdateExcelItem && onUpdateExcelItem(item.id, 'transkripsiIPA', e.target.value)}
                        placeholder="[...]"
                        className="w-full px-2 py-1 text-xs font-mono text-indigo-700 bg-slate-50/60 hover:bg-white focus:bg-white border border-transparent focus:border-indigo-400 rounded-md transition-colors"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <VocabularyAudioUploader
                        audioUrl={item.audioUrl}
                        audioFileName={item.audioFileName}
                        audioDuration={item.audioDuration}
                        onAudioChange={(url, fileName, duration) => {
                          if (onUpdateExcelAudio) {
                            onUpdateExcelAudio(item.id, url, fileName, duration);
                          } else if (onUpdateExcelItem) {
                            onUpdateExcelItem(item.id, 'audioUrl', url || '');
                            onUpdateExcelItem(item.id, 'audioFileName', fileName || '');
                          }
                        }}
                        itemName={`excel_${item.id}_${item.glosIndonesia}`}
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.catatan || ''}
                        onChange={(e) => onUpdateExcelItem && onUpdateExcelItem(item.id, 'catatan', e.target.value)}
                        placeholder="Keterangan..."
                        className="w-full px-2 py-1 text-[11px] text-slate-500 bg-transparent border-none focus:bg-white focus:ring-1 focus:ring-indigo-300 rounded-md"
                      />
                    </td>
                      <td className="py-2 px-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenExcelDetail(item, idx, 'detail')}
                            className="p-1 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Buka Tampilan Detail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenExcelDetail(item, idx, 'edit')}
                            className="p-1 rounded-md text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit Kosakata Lengkap"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {onRemoveExcelItem && (
                            <button
                              type="button"
                              onClick={() => onRemoveExcelItem(item.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Hapus baris"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 15.X: MODUL ANALISIS FONOTAKTIK KOSAKATA SWADESH */}
      {activeSubTab === 'fonotaktik' && (
        <PhonotacticAnalysis
          titikPengamatan={titikPengamatan}
          swadeshList={data.swadeshList}
          allSurveys={allSurveys}
          activeSurveyTitle={titikPengamatan?.namaDesa || 'Titik Acuan'}
          onNavigateToSwadesh={() => setActiveSubTab('swadesh')}
        />
      )}

      {/* 15.7: PERHITUNGAN OTOMATIS BEDA LEKSIKAL DIALEKTOMETRI (SECTION 16) */}
      {activeSubTab === 'dialektometri' && (
        <Section15LexicalDifferenceCalculator
          kosakataLengkap={data}
          titikPengamatan={titikPengamatan || {
            namaDesa: '',
            bahasaDigunakan: '',
            namaLainBahasa: '',
            kecamatan: '',
            kabupatenKota: '',
            pulau: '',
            provinsi: ''
          }}
          dialektometriData={dialektometriData || {
            titikAcuan: '',
            titikPembandingList: [],
            catatanIsoglos: '',
            kesimpulanGeolinguistik: ''
          }}
          allSurveys={allSurveys}
          activeSurveyId={activeSurveyId}
          onUpdateTitikPembanding={onUpdateTitikPembanding || (() => {})}
          onNavigateToSection16={onNavigateToSection16}
        />
      )}

      {/* Detail & Edit Modal for Selected Vocabulary Item */}
      <VocabularyDetailEditModal
        isOpen={detailModalState.isOpen}
        onClose={() => setDetailModalState(prev => ({ ...prev, isOpen: false }))}
        item={detailModalState.item}
        categoryName={detailModalState.categoryName}
        itemIndex={detailModalState.index}
        totalItems={
          detailModalState.category === 'swadesh'
            ? filteredSwadesh.length
            : detailModalState.category === 'budaya'
            ? filteredBudaya.length
            : data.excelImportedList?.length || 0
        }
        initialMode={detailModalState.mode}
        onSave={handleModalSave}
        onNavigatePrev={detailModalState.index > 0 ? handleModalPrev : undefined}
        onNavigateNext={
          (detailModalState.category === 'swadesh' && detailModalState.index < filteredSwadesh.length - 1) ||
          (detailModalState.category === 'budaya' && detailModalState.index < filteredBudaya.length - 1) ||
          (detailModalState.category === 'excel' && data.excelImportedList && detailModalState.index < data.excelImportedList.length - 1)
            ? handleModalNext
            : undefined
        }
      />

      {/* Excel Importer Modal */}
      <ExcelVocabularyImporter
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onImportCustomList={(items) => {
          if (onImportExcelCustomList) {
            onImportExcelCustomList(items);
            setActiveSubTab('excel');
          }
        }}
        onUpdateSwadeshList={(items) => {
          if (onImportExcelUpdateSwadesh) {
            onImportExcelUpdateSwadesh(items);
            setActiveSubTab('swadesh');
          }
        }}
      />
    </section>
  );
};
