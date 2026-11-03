import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Plus, 
  User, 
  AlertTriangle, 
  ChevronRight, 
  BookOpen, 
  ShieldCheck, 
  Filter,
  Sparkles,
  Send,
  Trash2
} from 'lucide-react';
import { ResearchAssignment } from '../../types/assignment';
import { AppUser } from '../../types/auth';
import { 
  loadResearchAssignments, 
  updateAssignmentStatus, 
  deleteAssignment,
  ASSIGNMENT_EVENT_NAME 
} from '../../utils/assignmentStorage';

interface ResearchAssignmentsListProps {
  currentUser: AppUser | null;
  onOpenAssignModal: () => void;
  onCreateNewSurvey?: (type: 'empty') => void;
}

export const ResearchAssignmentsList: React.FC<ResearchAssignmentsListProps> = ({
  currentUser,
  onOpenAssignModal,
  onCreateNewSurvey
}) => {
  const [assignments, setAssignments] = useState<ResearchAssignment[]>(() => loadResearchAssignments());
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'in_progress' | 'completed'>('all');
  const [onlyMyAssignments, setOnlyMyAssignments] = useState(false);

  const reloadAssignments = () => {
    setAssignments(loadResearchAssignments());
  };

  useEffect(() => {
    reloadAssignments();
    window.addEventListener(ASSIGNMENT_EVENT_NAME, reloadAssignments);
    return () => {
      window.removeEventListener(ASSIGNMENT_EVENT_NAME, reloadAssignments);
    };
  }, []);

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'verifikator';

  // Filter assignments
  const filteredAssignments = assignments.filter(a => {
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (onlyMyAssignments && currentUser && a.surveyorId !== currentUser.id && a.surveyorEmail !== currentUser.email) {
      return false;
    }
    return true;
  });

  const myActiveAssignments = currentUser 
    ? assignments.filter(a => (a.surveyorId === currentUser.id || a.surveyorEmail === currentUser.email) && a.status !== 'completed')
    : [];

  const getPriorityBadge = (priority: ResearchAssignment['priority']) => {
    switch (priority) {
      case 'tinggi':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">Prioritas Tinggi</span>;
      case 'sedang':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">Prioritas Sedang</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Rutin</span>;
    }
  };

  const getStatusBadge = (status: ResearchAssignment['status']) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">Target Baru</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">Sedang Riset</span>;
      case 'completed':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">Selesai</span>;
      default:
        return null;
    }
  };

  const calculateDaysLeft = (deadline: string) => {
    try {
      const diffMs = new Date(deadline).getTime() - Date.now();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return `${Math.abs(diffDays)} hari lewat`;
      if (diffDays === 0) return 'Hari ini';
      return `${diffDays} hari lagi`;
    } catch {
      return deadline;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-4 sm:p-5 space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-2xs">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Penugasan Wilayah Riset Lapangan
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                {assignments.length} Penugasan
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Distribusi target wilayah survei linguistik untuk para surveyor lapangan
            </p>
          </div>
        </div>

        {/* Action Button: Admin only */}
        {isAdmin && (
          <button
            type="button"
            onClick={onOpenAssignModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tetapkan Wilayah Riset</span>
          </button>
        )}
      </div>

      {/* Banner Khusus Surveyor Jika Ada Penugasan Aktif */}
      {myActiveAssignments.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-transparent border border-purple-300 dark:border-purple-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Wilayah Riset yang Ditugaskan untuk Anda ({myActiveAssignments.length} target):</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900/80 text-purple-900 dark:text-purple-200 font-bold">
              Prioritas Lapangan
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {myActiveAssignments.map(asgn => (
              <div 
                key={asgn.id}
                className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-purple-200/80 dark:border-purple-700/60 flex items-center justify-between gap-2 shadow-2xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {asgn.targetDistrict}, {asgn.targetRegency}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Bahasa: {asgn.targetLanguage} • Tenggat: {asgn.deadline} ({calculateDaysLeft(asgn.deadline)})
                  </div>
                </div>
                {onCreateNewSurvey && (
                  <button
                    type="button"
                    onClick={() => onCreateNewSurvey('empty')}
                    className="px-2 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] shrink-0 cursor-pointer"
                  >
                    Mulai Survei →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Tab Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-xl transition-colors cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-purple-600 text-white font-bold shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Semua ({assignments.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1 rounded-xl transition-colors cursor-pointer ${
              filterStatus === 'active'
                ? 'bg-purple-600 text-white font-bold shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Target Baru ({assignments.filter(a => a.status === 'active').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('in_progress')}
            className={`px-3 py-1 rounded-xl transition-colors cursor-pointer ${
              filterStatus === 'in_progress'
                ? 'bg-purple-600 text-white font-bold shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Sedang Riset ({assignments.filter(a => a.status === 'in_progress').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1 rounded-xl transition-colors cursor-pointer ${
              filterStatus === 'completed'
                ? 'bg-purple-600 text-white font-bold shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Selesai ({assignments.filter(a => a.status === 'completed').length})
          </button>
        </div>

        {currentUser && (
          <label className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyMyAssignments}
              onChange={(e) => setOnlyMyAssignments(e.target.checked)}
              className="rounded text-purple-600 focus:ring-purple-500"
            />
            <span>Tampilkan hanya penugasan saya</span>
          </label>
        )}
      </div>

      {/* Assignment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredAssignments.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-slate-500 space-y-2">
            <MapPin className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="font-semibold">Tidak ada penugasan wilayah riset yang cocok dengan filter.</p>
            {isAdmin && (
              <button
                type="button"
                onClick={onOpenAssignModal}
                className="text-purple-600 font-bold hover:underline cursor-pointer"
              >
                + Buat Penugasan Wilayah Pertama
              </button>
            )}
          </div>
        ) : (
          filteredAssignments.map(asgn => {
            const isAssignedToMe = currentUser && (asgn.surveyorId === currentUser.id || asgn.surveyorEmail === currentUser.email);

            return (
              <div
                key={asgn.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 relative flex flex-col justify-between ${
                  isAssignedToMe
                    ? 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-300 dark:border-purple-800 shadow-xs'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-purple-200'
                }`}
              >
                <div className="space-y-2 text-xs">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {getStatusBadge(asgn.status)}
                        {getPriorityBadge(asgn.priority)}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white pt-1">
                        {asgn.targetDistrict}, {asgn.targetRegency}
                      </h4>
                      <p className="text-[11px] text-purple-700 dark:text-purple-300 font-semibold">
                        {asgn.targetProvince} • {asgn.targetLanguage}
                      </p>
                    </div>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => deleteAssignment(asgn.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                        title="Hapus penugasan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Surveyor Assigned */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                        Surveyor Bertugas:
                      </span>
                      {isAssignedToMe && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800">
                          Anda
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-purple-600" />
                      <span>{asgn.surveyorName}</span>
                    </div>
                  </div>

                  {/* Notes / Details */}
                  {asgn.notes && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 italic line-clamp-2">
                      "{asgn.notes}"
                    </p>
                  )}
                </div>

                {/* Footer & Controls */}
                <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1 text-slate-500">
                    <Calendar className="w-3 h-3 text-purple-600" />
                    <span>Tenggat: {calculateDaysLeft(asgn.deadline)}</span>
                  </div>

                  {isAdmin && asgn.status !== 'completed' && (
                    <div className="flex items-center gap-1">
                      {asgn.status === 'active' && (
                        <button
                          type="button"
                          onClick={() => updateAssignmentStatus(asgn.id, 'in_progress')}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer"
                        >
                          Mulai
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => updateAssignmentStatus(asgn.id, 'completed')}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 cursor-pointer"
                      >
                        Tandai Selesai
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
