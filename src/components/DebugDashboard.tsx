import React, { useState, useMemo } from 'react';
import { 
  Bug, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Copy, 
  Check, 
  ChevronUp, 
  ChevronDown, 
  Clock, 
  KeyRound, 
  Globe, 
  Shield, 
  ExternalLink,
  Layers,
  X,
  AlertCircle
} from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';
import { AppUser } from '../types/auth';

export interface DebugDashboardProps {
  googleClientId?: string;
  lastSavedTime?: string | null;
  currentUser?: AppUser | null;
  activeSurveyId?: string;
  className?: string;
}

export interface ConfigMismatchReport {
  status: 'ok' | 'warning' | 'error';
  envClientId: string | null;
  activeClientId: string;
  firebaseClientId: string | null;
  isEnvDefined: boolean;
  isPlaceholder: boolean;
  isMismatch: boolean;
  currentOrigin: string;
  isIframe: boolean;
  mode: string;
  lastSavedTimeDisplay: string;
  warnings: string[];
}

export const DebugDashboard: React.FC<DebugDashboardProps> = ({
  googleClientId,
  lastSavedTime,
  currentUser,
  activeSurveyId,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [showFullClientId, setShowFullClientId] = useState<boolean>(false);

  // Read environment variable and configurations
  const envClientId = typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLIENT_ID
    ? String(import.meta.env.VITE_GOOGLE_CLIENT_ID).trim()
    : null;

  const firebaseOAuthId = (firebaseConfig as any)?.oAuthClientId 
    ? String((firebaseConfig as any).oAuthClientId).trim() 
    : null;

  const fallbackClientId = '907558852342-vf3ufhtoei8f77e4pa88up6ibcvrrjl7.apps.googleusercontent.com';

  // Determine active effective Client ID
  const activeClientId = googleClientId || envClientId || firebaseOAuthId || fallbackClientId;

  // Diagnostic analysis of configuration
  const report: ConfigMismatchReport = useMemo(() => {
    const warnings: string[] = [];
    const isEnvDefined = Boolean(envClientId && envClientId.length > 0);
    const isPlaceholder = activeClientId.includes('YOUR_GOOGLE_CLIENT_ID') || activeClientId.includes('dummy') || activeClientId.includes('example.com');
    const isMismatch = isEnvDefined && envClientId !== activeClientId;
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'unknown';
    const isIframe = typeof window !== 'undefined' && window.self !== window.top;
    const mode = typeof import.meta !== 'undefined' && import.meta.env?.MODE ? import.meta.env.MODE : 'production';

    if (!isEnvDefined) {
      warnings.push('VITE_GOOGLE_CLIENT_ID belum didefinisikan di environment; aplikasi memakai konfigurasi fallback/Firebase.');
    }

    if (isPlaceholder) {
      warnings.push('Google Client ID terdeteksi sebagai placeholder dummy (YOUR_GOOGLE_CLIENT_ID).');
    }

    if (isMismatch) {
      warnings.push(`Client ID mismatch: Environment (${envClientId?.slice(0, 12)}...) berbeda dari active Client ID.`);
    }

    if (!activeClientId.endsWith('.apps.googleusercontent.com')) {
      warnings.push('Format Google Client ID tidak berakhiran ".apps.googleusercontent.com".');
    }

    if (isIframe) {
      warnings.push('Aplikasi berjalan di dalam iframe. Pastikan Google Identity Services mengizinkan Origin ini.');
    }

    let status: 'ok' | 'warning' | 'error' = 'ok';
    if (isPlaceholder || !activeClientId) {
      status = 'error';
    } else if (warnings.length > 0 || isMismatch) {
      status = 'warning';
    }

    const lastSavedTimeDisplay = lastSavedTime 
      ? `Tersimpan: ${lastSavedTime}` 
      : 'Belum ada perubahan tersimpan';

    return {
      status,
      envClientId,
      activeClientId,
      firebaseClientId: firebaseOAuthId,
      isEnvDefined,
      isPlaceholder,
      isMismatch,
      currentOrigin,
      isIframe,
      mode,
      lastSavedTimeDisplay,
      warnings,
    };
  }, [envClientId, activeClientId, firebaseOAuthId, lastSavedTime]);

  const handleCopyDiagnostics = () => {
    const diagnosticPayload = {
      timestamp: new Date().toISOString(),
      reportStatus: report.status,
      appState: {
        lastSavedTime: lastSavedTime || 'None',
        activeSurveyId: activeSurveyId || 'None',
        currentUser: currentUser ? {
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
          username: currentUser.username,
        } : null,
      },
      oauthConfiguration: {
        activeClientId: report.activeClientId,
        envClientId: report.envClientId || '(not set)',
        firebaseClientId: report.firebaseClientId || '(not set)',
        isEnvDefined: report.isEnvDefined,
        isPlaceholder: report.isPlaceholder,
        isMismatch: report.isMismatch,
      },
      runtimeEnvironment: {
        currentOrigin: report.currentOrigin,
        isIframe: report.isIframe,
        mode: report.mode,
        protocol: typeof window !== 'undefined' ? window.location.protocol : '',
      },
      warnings: report.warnings,
    };

    navigator.clipboard.writeText(JSON.stringify(diagnosticPayload, null, 2));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const getStatusBadge = () => {
    if (report.status === 'ok') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Config OK</span>
        </span>
      );
    }
    if (report.status === 'warning') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <span>Perhatian ({report.warnings.length})</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <XCircle className="w-3 h-3 text-rose-600" />
        <span>Mismatch / Error</span>
      </span>
    );
  };

  return (
    <aside 
      aria-label="Debug Dashboard Status Panel"
      className={`fixed bottom-18 lg:bottom-6 left-16 sm:left-20 z-40 transition-all font-sans text-xs ${className}`}
    >
      {/* COLLAPSED STATUS PILL / TRIGGER BUTTON */}
      {!isExpanded && (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="group flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-lg shadow-md hover:shadow-lg hover:border-slate-300 text-slate-700 hover:text-slate-900 transition-all cursor-pointer"
          title="Buka Debug Dashboard (Status Client ID & Save State)"
        >
          <div className="relative flex items-center justify-center">
            <Bug className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-600 transition-colors" />
            <span 
              className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ring-2 ring-white ${
                report.status === 'ok' 
                  ? 'bg-emerald-500' 
                  : report.status === 'warning' 
                  ? 'bg-amber-500' 
                  : 'bg-rose-500 animate-pulse'
              }`} 
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[11px] tracking-tight">Debug</span>
            {getStatusBadge()}
          </div>

          {/* Quick preview of last saved time */}
          <div className="hidden sm:flex items-center gap-1 pl-1 border-l border-slate-200 text-[11px] text-slate-500">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{lastSavedTime || 'Auto-save aktif'}</span>
          </div>

          <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
        </button>
      )}

      {/* EXPANDED DIAGNOSTIC STATUS PANEL */}
      {isExpanded && (
        <div className="w-[330px] sm:w-[380px] max-h-[85vh] overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-2xl p-3.5 text-slate-800 transition-all animate-in fade-in slide-in-from-bottom-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-indigo-50 text-indigo-700">
                <Bug className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 leading-tight">
                  Debug Dashboard & Config
                </h4>
                <p className="text-[10px] text-slate-500">
                  Google Client ID & App State Inspector
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {getStatusBadge()}
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                title="Tutup panel"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SECTION 1: GOOGLE CLIENT ID STATUS & MISMATCH CHECK */}
          <div className="mb-3 p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-[11px]">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                <span>Google Client ID</span>
              </div>
              <button
                type="button"
                onClick={() => setShowFullClientId(!showFullClientId)}
                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
              >
                {showFullClientId ? 'Sembunyikan' : 'Lihat Lengkap'}
              </button>
            </div>

            {/* Active ID display */}
            <div className="p-2 rounded bg-white border border-slate-200/90 font-mono text-[10px] break-all leading-tight text-slate-800 select-all">
              {showFullClientId ? report.activeClientId : (
                report.activeClientId.length > 28
                  ? `${report.activeClientId.slice(0, 12)}...${report.activeClientId.slice(-16)}`
                  : report.activeClientId
              )}
            </div>

            {/* Comparison Matrix */}
            <div className="grid grid-cols-2 gap-1.5 text-[10px] pt-1">
              <div className="p-1.5 rounded bg-white/70 border border-slate-200/60">
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">Env VITE_GOOGLE_CLIENT_ID</span>
                <span className={`font-mono truncate block ${report.isEnvDefined ? 'text-slate-800' : 'text-amber-600 italic'}`}>
                  {report.isEnvDefined ? 'Tersedia (Set)' : 'Belum Disetel'}
                </span>
              </div>
              <div className="p-1.5 rounded bg-white/70 border border-slate-200/60">
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">Status Mismatch</span>
                <span className={`font-semibold block ${report.isMismatch ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {report.isMismatch ? 'Mismatch Terdeteksi' : 'Sinkron / Match'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: LAST SAVED TIME (APP STATE) */}
          <div className="mb-3 p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/80">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-[11px]">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Status Penyimpanan (lastSavedTime)</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {lastSavedTime ? 'Auto-Saved' : 'Standby'}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200/90">
              <span className="font-medium">{report.lastSavedTimeDisplay}</span>
              <span className="text-[10px] text-slate-400">Debounce 1.2s</span>
            </div>
          </div>

          {/* SECTION 3: RUNTIME & ORIGIN INFO */}
          <div className="mb-3 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between p-1.5 rounded bg-slate-50 border border-slate-200/60">
              <span className="text-slate-500 flex items-center gap-1">
                <Globe className="w-3 h-3 text-slate-400" />
                <span>Authorized Origin:</span>
              </span>
              <span className="font-mono text-[10px] text-slate-800 truncate max-w-[170px]" title={report.currentOrigin}>
                {report.currentOrigin}
              </span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded bg-slate-50 border border-slate-200/60">
              <span className="text-slate-500 flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-400" />
                <span>Iframe Context:</span>
              </span>
              <span className={`font-semibold text-[10px] ${report.isIframe ? 'text-amber-600' : 'text-slate-700'}`}>
                {report.isIframe ? 'Yes (iFrame Sandbox)' : 'No (Direct Top Window)'}
              </span>
            </div>

            {currentUser && (
              <div className="flex items-center justify-between p-1.5 rounded bg-slate-50 border border-slate-200/60">
                <span className="text-slate-500 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-slate-400" />
                  <span>Sesi Pengguna:</span>
                </span>
                <span className="font-medium text-[10px] text-slate-800 truncate max-w-[170px]">
                  {currentUser.name} ({currentUser.role})
                </span>
              </div>
            )}
          </div>

          {/* WARNINGS & FEEDBACK IF ANY */}
          {report.warnings.length > 0 && (
            <div className="mb-3 p-2 rounded-lg bg-amber-50/90 border border-amber-200 text-amber-950 text-[10px] space-y-1">
              <div className="flex items-center gap-1 font-bold text-amber-900 mb-0.5">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                <span>Pemberitahuan Konfigurasi:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 leading-relaxed text-amber-900">
                {report.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ACTION BUTTONS: COPY DIAGNOSTICS & CLOSE */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCopyDiagnostics}
              className="flex-1 py-1.5 px-2.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium text-[11px] flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Diagnostik Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Data Diagnostik</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="py-1.5 px-3 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default DebugDashboard;
