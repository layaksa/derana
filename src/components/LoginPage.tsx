import React, { useEffect, useState } from 'react';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Building,
  MapPin,
  Mail,
  Shield,
  Check,
  UserPlus,
  KeyRound,
  Sparkles,
  HelpCircle,
  GraduationCap,
  UserCheck,
  ShieldCheck,
  Scale,
  Compass
} from 'lucide-react';
import { AppUser, UserRole } from '../types/auth';
import { 
  authenticateUser, 
  registerUser, 
  loadAllUsers, 
  DEFAULT_USERS,
  loginOrRegisterGoogleUser,
  getRoleLabel
} from '../utils/authStorage';
import { 
  loginWithEmailPassword, 
  registerWithEmailPassword, 
  resetPasswordEmail,
  getUserProfileFromFirestore,
  loginWithGoogle,
  completeGoogleRedirectLogin
} from '../lib/firebase';
import { ThemeToggle } from './ThemeToggle';

// Official 4-color Google Icon SVG
const GoogleIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

interface LoginPageProps {
  onLoginSuccess: (user: AppUser) => void;
}

const getGoogleAuthErrorMessage = (error: any) => {
  switch (error?.code) {
    case 'auth/unauthorized-domain': {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'domain aplikasi';
      return `Domain ${hostname} belum diizinkan oleh Firebase Authentication. Tambahkan ${hostname} di Firebase Console > Authentication > Settings > Authorized domains, lalu muat ulang halaman.`;
    }
    case 'auth/operation-not-allowed':
      return 'Login Google belum diaktifkan. Aktifkan Google sebagai Sign-in provider di Firebase Console > Authentication > Sign-in method.';
    case 'auth/account-exists-with-different-credential':
      return 'Email ini sudah terdaftar dengan metode login lain. Masuk menggunakan metode tersebut terlebih dahulu.';
    case 'auth/popup-closed-by-user':
      return 'Jendela Google ditutup sebelum proses selesai.';
    case 'auth/popup-blocked':
      return 'Popup Google diblokir browser. Login akan dilanjutkan melalui halaman redirect.';
    default:
      return 'Login dengan Google gagal. Pastikan provider Google dan domain aplikasi sudah dikonfigurasi di Firebase.';
  }
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  
  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regInstitution, setRegInstitution] = useState('');
  const [regRegion, setRegRegion] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('surveyor');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState(false);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    let active = true;
    completeGoogleRedirectLogin()
      .then(async (firebaseUser) => {
        if (!active || !firebaseUser) return;
        const profile = await getUserProfileFromFirestore(firebaseUser.uid);
        const email = firebaseUser.email || '';
        onLoginSuccess({
          id: firebaseUser.uid,
          username: email.split('@')[0] || `google_${firebaseUser.uid.slice(0, 8)}`,
          name: firebaseUser.displayName || profile?.displayName || email.split('@')[0] || 'Peneliti Bahasa',
          email,
          role: profile?.role === 'admin' ? 'admin' : 'tamu',
          avatar: firebaseUser.photoURL || undefined,
          institution: profile?.institution || 'Balai Bahasa / Peneliti Mandiri',
          assignedRegion: profile?.assignedRegion || 'Wilayah Riset',
          createdAt: profile?.createdAt || new Date().toISOString(),
          authProvider: 'google_oauth',
          oauthConnected: true,
          oauthEmail: email,
          oauthAuthorizedAt: new Date().toISOString()
        });
      })
      .catch((error: any) => {
        if (!active) return;
        setLoginError(getGoogleAuthErrorMessage(error));
      });
    return () => { active = false; };
  }, [onLoginSuccess]);

  // Helper to quickly fill test accounts
  const handleQuickFill = (email: string, pass: string) => {
    setEmailOrUsername(email);
    setLoginPassword(pass);
    setLoginError(null);
  };

  /**
   * Universal Google authentication handler (both for Sign In and Sign Up)
   * Integrates Firebase Authentication popup and Firestore profile persistence.
   */
  const handleGoogleAuth = async (targetMode: 'login' | 'register' = mode) => {
    setLoginError(null);
    setRegError(null);
    if (targetMode === 'login') {
      setLoginLoading(true);
    } else {
      setRegLoading(true);
    }

    try {
      const result = await loginWithGoogle({
        mode: targetMode,
        institution: targetMode === 'register' ? (regInstitution.trim() || undefined) : undefined,
        assignedRegion: targetMode === 'register' ? (regRegion.trim() || undefined) : undefined
      });

      const { user: firebaseUser, profile } = result;
      const email = firebaseUser.email || '';
      const isAdminEmail = email.toLowerCase() === 'derana.apps@gmail.com' || email.toLowerCase().includes('admin');
      
      // Determine final active role
      const finalRole: UserRole = isAdminEmail 
        ? 'admin' 
        : (profile?.role || (targetMode === 'register' ? regRole : 'surveyor'));

      const displayName = firebaseUser.displayName 
        || profile?.displayName 
        || (targetMode === 'register' && regName.trim() ? regName.trim() : email.split('@')[0])
        || 'Peneliti Kebahasaan';

      const finalInstitution = profile?.institution 
        || (targetMode === 'register' && regInstitution.trim() ? regInstitution.trim() : null)
        || (isAdminEmail ? 'Badan Pengembangan dan Pembinaan Bahasa' : 'Balai Bahasa / Peneliti Mandiri');

      const finalRegion = profile?.assignedRegion 
        || (targetMode === 'register' && regRegion.trim() ? regRegion.trim() : null)
        || (isAdminEmail ? 'Nasional (Koordinator Utama)' : 'Wilayah Riset Lapangan');

      const loggedInUser: AppUser = {
        id: firebaseUser.uid,
        username: email.split('@')[0] || `google_${firebaseUser.uid.slice(0, 8)}`,
        name: displayName,
        email,
        role: profile?.role === 'admin' ? 'admin' : 'tamu',
        avatar: firebaseUser.photoURL || undefined,
        institution: finalInstitution,
        assignedRegion: finalRegion,
        createdAt: profile?.createdAt || new Date().toISOString(),
        authProvider: 'google_oauth',
        oauthConnected: true,
        oauthEmail: email,
        oauthAuthorizedAt: new Date().toISOString(),
      };

      // Keep local users registry synchronized
      loginOrRegisterGoogleUser({
        email,
        name: displayName,
        picture: firebaseUser.photoURL || undefined,
        sub: firebaseUser.uid,
        role: finalRole,
        institution: finalInstitution,
        assignedRegion: finalRegion
      });

      onLoginSuccess(loggedInUser);
    } catch (error: any) {
      const message = getGoogleAuthErrorMessage(error);
      if (targetMode === 'login') {
        setLoginError(message);
      } else {
        setRegError(message);
      }
    } finally {
      setLoginLoading(false);
      setRegLoading(false);
    }
  };

  // Handle Login with Firebase Email & Password
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const inputVal = emailOrUsername.trim();
    if (!inputVal || !loginPassword) {
      setLoginError('Mohon isi email/username dan kata sandi.');
      return;
    }

    setLoginLoading(true);

    try {
      // 1. Resolve email address: if user typed username, find their email from local registry
      let targetEmail = inputVal;
      let matchedLocalUser: AppUser | undefined = undefined;
      const allUsers = loadAllUsers();

      if (!inputVal.includes('@')) {
        matchedLocalUser = allUsers.find(
          u => u.username.toLowerCase() === inputVal.toLowerCase()
        );
        if (matchedLocalUser) {
          targetEmail = matchedLocalUser.email;
        } else {
          // Check local auth first
          const localAuth = authenticateUser(inputVal, loginPassword);
          if (localAuth.success && localAuth.user) {
            setLoginLoading(false);
            onLoginSuccess(localAuth.user);
            return;
          }
        }
      } else {
        matchedLocalUser = allUsers.find(
          u => u.email.toLowerCase() === inputVal.toLowerCase()
        );
      }

      // 2. Try Firebase Authentication with Email and Password
      let firebaseUser = null;
      let fbError: any = null;

      try {
        firebaseUser = await loginWithEmailPassword(targetEmail, loginPassword);
      } catch (err: any) {
        fbError = err;
        console.warn('Firebase email auth response:', err?.code || err?.message);
      }

      if (firebaseUser) {
        // Authenticated with Firebase! Fetch user doc from Firestore
        let profile = await getUserProfileFromFirestore(firebaseUser.uid);
        
        const email = firebaseUser.email || targetEmail;
        const displayName = firebaseUser.displayName || profile?.displayName || matchedLocalUser?.name || email.split('@')[0];
        const assignedRole: UserRole = profile?.role || matchedLocalUser?.role || (email === 'derana.apps@gmail.com' ? 'admin' : 'user');

        const loggedInUser: AppUser = {
          id: firebaseUser.uid,
          username: matchedLocalUser?.username || email.split('@')[0],
          name: displayName,
          email: email,
          role: assignedRole,
          institution: profile?.institution || matchedLocalUser?.institution || 'Badan Pengembangan dan Pembinaan Bahasa',
          assignedRegion: profile?.assignedRegion || matchedLocalUser?.assignedRegion || 'Wilayah Riset',
          createdAt: profile?.createdAt || matchedLocalUser?.createdAt || new Date().toISOString()
        };

        setLoginLoading(false);
        onLoginSuccess(loggedInUser);
        return;
      }

      // 3. Fallback: Check local auth storage if Firebase auth is in fallback/offline mode
      const localResult = authenticateUser(inputVal, loginPassword);
      if (localResult.success && localResult.user) {
        setLoginLoading(false);
        onLoginSuccess(localResult.user);
        return;
      }

      // If both failed, provide informative error
      setLoginLoading(false);
      if (fbError?.code === 'auth/user-not-found') {
        setLoginError('Akun dengan email ini belum terdaftar. Silakan beralih ke tab "Daftar Akun Baru".');
      } else if (fbError?.code === 'auth/wrong-password' || fbError?.code === 'auth/invalid-credential') {
        setLoginError('Email atau kata sandi salah. Silakan periksa kembali kata sandi Anda.');
      } else if (fbError?.code === 'auth/too-many-requests') {
        setLoginError('Terlalu banyak percobaan masuk yang gagal. Silakan tunggu beberapa saat atau atur ulang kata sandi.');
      } else if (fbError?.code === 'auth/invalid-email') {
        setLoginError('Format email tidak valid. Masukkan alamat email yang benar.');
      } else {
        setLoginError(localResult.message || 'Kombinasi email/username dan kata sandi tidak ditemukan.');
      }
    } catch (generalErr: any) {
      setLoginLoading(false);
      setLoginError(generalErr?.message || 'Terjadi kendala saat memproses masuk. Silakan coba kembali.');
    }
  };

  // Handle Register with Firebase Email & Password
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    const name = regName.trim();
    const email = regEmail.trim();
    const password = regPassword;
    const confirmPass = regConfirmPassword;

    if (!name || !email || !password) {
      setRegError('Mohon lengkapi seluruh kolom yang bertanda bintang (*).');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setRegError('Format alamat email tidak valid.');
      return;
    }

    if (password.length < 6) {
      setRegError('Kata sandi minimal terdiri dari 6 karakter.');
      return;
    }

    if (password !== confirmPass) {
      setRegError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setRegLoading(true);

    try {
      const generatedUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_.]/g, '') || `user_${Date.now()}`;

      // 1. Register in Firebase Auth & Firestore
      let firebaseUser = null;
      try {
        firebaseUser = await registerWithEmailPassword(
          email,
          password,
          name,
          regRole,
          regInstitution.trim() || 'Balai Riset Kebahasaan',
          regRegion.trim() || 'Wilayah Riset Lapangan'
        );
      } catch (fbErr: any) {
        console.warn('Firebase registration error:', fbErr?.code || fbErr?.message);
        if (fbErr?.code === 'auth/email-already-in-use') {
          setRegLoading(false);
          setRegError('Alamat email ini sudah terdaftar dalam Firebase. Silakan langsung masuk di tab "Masuk Akun".');
          return;
        } else if (fbErr?.code === 'auth/weak-password') {
          setRegLoading(false);
          setRegError('Kata sandi terlalu lemah. Gunakan minimal 6 karakter.');
          return;
        }
      }

      // 2. Register/sync into local storage for immediate cache
      registerUser({
        name,
        username: generatedUsername,
        email,
        password,
        role: regRole,
        institution: regInstitution.trim() || 'Balai Riset Kebahasaan',
        assignedRegion: regRegion.trim() || 'Wilayah Riset Lapangan'
      });

      setRegLoading(false);
      setRegSuccess(`Akun berhasil dibuat dengan Firebase! Anda dapat langsung masuk dengan email ${email}.`);
      
      // Prefill login form
      setEmailOrUsername(email);
      setLoginPassword(password);
      
      // Switch back to login view after short delay
      setTimeout(() => {
        setMode('login');
      }, 1500);

    } catch (err: any) {
      setRegLoading(false);
      setRegError(err?.message || 'Gagal mendaftarkan akun. Silakan coba kembali.');
    }
  };

  // Handle Password Reset Email
  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStatus(null);
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setForgotStatus({ type: 'error', message: 'Masukkan alamat email yang valid.' });
      return;
    }

    setForgotLoading(true);
    try {
      await resetPasswordEmail(forgotEmail.trim());
      setForgotLoading(false);
      setForgotStatus({ 
        type: 'success', 
        message: `Instruksi pengaturan ulang kata sandi telah dikirim ke ${forgotEmail}. Silakan periksa kotak masuk/spam email Anda.` 
      });
    } catch (err: any) {
      setForgotLoading(false);
      if (err?.code === 'auth/user-not-found') {
        setForgotStatus({ type: 'error', message: 'Email tidak ditemukan dalam sistem.' });
      } else {
        setForgotStatus({ type: 'error', message: err?.message || 'Gagal mengirim email reset kata sandi.' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#eef4ff_0,_transparent_42%),linear-gradient(135deg,_#f8fafc_0%,_#eef2f7_100%)] dark:bg-[radial-gradient(circle_at_top_left,_#172554_0,_transparent_42%),linear-gradient(135deg,_#0f172a_0%,_#111827_100%)] flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 relative transition-colors text-[#0a0a0a] dark:text-[#E0E0E0]">
      {/* Top Right Quick Theme Switcher */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <ThemeToggle variant="segmented" />
      </div>

      {/* Main Form Box */}
      <div className="w-full max-w-md sm:max-w-lg space-y-7">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-4 p-3.5 rounded-[1.4rem] bg-white/80 dark:bg-white/10 shadow-[0_14px_35px_-18px_rgba(37,87,214,0.7)] ring-1 ring-white/70 dark:ring-white/10">
            <img 
              src="/icons/logo.svg" 
              alt="Logo Sistem Pemetaan Bahasa" 
              className="w-12 h-12 object-contain hover:scale-105 transition-transform duration-200"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-[#E0E0E0]">
            Sistem Pemetaan Bahasa
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#B0B0B0] mt-1 max-w-sm mx-auto">
            Portal Kuesioner Dialektometri & Inventarisasi Bahasa Daerah
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white/95 dark:bg-[#121212]/95 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-[1.75rem] shadow-[0_24px_70px_-30px_rgba(15,23,42,0.55)] overflow-hidden relative transition-colors">
          
          {/* Tab Selector: Masuk Akun / Daftar Baru */}
          <div className="flex border-b border-slate-200 dark:border-[#444444]">
            <button
              type="button"
              onClick={() => { 
                setMode('login'); 
                setLoginError(null); 
              }}
              className={`flex-1 py-3 text-xs sm:text-sm font-semibold transition-colors cursor-pointer border-b-2 ${
                mode === 'login'
                  ? 'border-indigo-600 dark:border-sky-400 text-indigo-600 dark:text-sky-400 bg-slate-50/70 dark:bg-[#1E1E1E]'
                  : 'border-transparent text-slate-500 dark:text-[#B0B0B0] hover:text-slate-900 dark:hover:text-[#E0E0E0] hover:bg-slate-50/40 dark:hover:bg-[#1E1E1E]'
              }`}
            >
              Masuk Akun
            </button>
            <button
              type="button"
              onClick={() => { 
                setMode('register'); 
                setRegError(null); 
              }}
              className={`flex-1 py-3 text-xs sm:text-sm font-semibold transition-colors cursor-pointer border-b-2 ${
                mode === 'register'
                  ? 'border-indigo-600 dark:border-sky-400 text-indigo-600 dark:text-sky-400 bg-slate-50/70 dark:bg-[#1E1E1E]'
                  : 'border-transparent text-slate-500 dark:text-[#B0B0B0] hover:text-slate-900 dark:hover:text-[#E0E0E0] hover:bg-slate-50/40 dark:hover:bg-[#1E1E1E]'
              }`}
            >
              Daftar Akun Baru
            </button>
          </div>

          <div className="p-6 sm:p-8">
            
            {/* TAB 1: FORM LOGIN */}
            {mode === 'login' && (
              <div className="space-y-4">
                
                {regSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{regSuccess}</span>
                  </div>
                )}

                {loginError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Gagal Masuk Akun</div>
                      <div className="text-[11px] mt-0.5">{loginError}</div>
                    </div>
                  </div>
                )}

                {/* DEDICATED GOOGLE SIGN IN BUTTON */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleGoogleAuth('login')}
                    disabled={loginLoading || regLoading}
                    className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-300 dark:border-[#444444] bg-white dark:bg-[#1E1E1E] px-4 py-3 text-xs sm:text-sm font-semibold text-slate-800 dark:text-[#E0E0E0] shadow-xs hover:bg-slate-50 dark:hover:bg-[#252525] hover:border-slate-400 dark:hover:border-slate-500 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 group"
                  >
                    <GoogleIcon className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" />
                    <span>{loginLoading ? 'Memverifikasi Akun Google...' : 'Masuk dengan Akun Google'}</span>
                  </button>
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-[#888888]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Firebase Authentication resmi • Akses instan sesuai peran riset</span>
                  </div>
                </div>

                <div className="my-5 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                  <span className="h-px flex-1 bg-slate-200 dark:bg-[#444444]" />
                  <span>atau masuk dengan email & kata sandi</span>
                  <span className="h-px flex-1 bg-slate-200 dark:bg-[#444444]" />
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-[#E0E0E0] mb-1.5">
                      Email atau Username *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-[#888888]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={emailOrUsername}
                        onChange={e => setEmailOrUsername(e.target.value)}
                        required
                        placeholder="Contoh: derana.apps@gmail.com atau fadhillah"
                        className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-[#1E1E1E] border border-slate-300 dark:border-[#444444] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-[#E0E0E0] placeholder-slate-400 dark:placeholder-[#888888] focus:outline-hidden focus:border-indigo-600 dark:focus:border-sky-400 focus:ring-2 focus:ring-indigo-600/10 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-[#E0E0E0]">
                        Kata Sandi *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(emailOrUsername.includes('@') ? emailOrUsername : '');
                          setForgotStatus(null);
                          setIsForgotModalOpen(true);
                        }}
                        className="text-[11px] font-medium text-indigo-600 dark:text-sky-400 hover:underline cursor-pointer"
                      >
                        Lupa kata sandi?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-[#888888]">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        required
                        placeholder="Masukkan kata sandi..."
                        className="w-full pl-9 pr-10 py-2.5 bg-white dark:bg-[#1E1E1E] border border-slate-300 dark:border-[#444444] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-[#E0E0E0] placeholder-slate-400 dark:placeholder-[#888888] focus:outline-hidden focus:border-indigo-600 dark:focus:border-sky-400 focus:ring-2 focus:ring-indigo-600/10 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-[#888888] hover:text-slate-600 dark:hover:text-[#E0E0E0] cursor-pointer"
                        title={showLoginPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loginLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Memverifikasi akun Firebase...</span>
                      </span>
                    ) : (
                      <>
                        <span>Masuk ke Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Quick Test Accounts Accordion/Helper */}
                <div className="pt-3 border-t border-slate-100 dark:border-[#444444]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-[#B0B0B0] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-500 dark:text-sky-400" />
                      <span>Masuk Cepat Berdasarkan Peran Terdaftar:</span>
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      Klik untuk mengisi form
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                    <button
                      type="button"
                      onClick={() => handleQuickFill('derana.apps@gmail.com', 'admin')}
                      className="p-2 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 hover:bg-purple-100/70 dark:hover:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-left cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-1 text-[11px] font-bold text-purple-900 dark:text-purple-200 truncate">
                        <ShieldCheck className="w-3 h-3 text-purple-600 shrink-0" />
                        <span className="truncate">Admin Sistem</span>
                      </div>
                      <div className="text-[10px] text-purple-700/80 dark:text-purple-300/80 truncate font-mono">derana.apps@gmail.com</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFill('dewi.verifikator@gmail.com', 'verifikator123')}
                      className="p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-left cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-900 dark:text-emerald-200 truncate">
                        <GraduationCap className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">Verifikator Linguistik</span>
                      </div>
                      <div className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80 truncate font-mono">dewi.verifikator@gmail.com</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFill('fadhillah.surveyor', 'user123')}
                      className="p-2 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 hover:bg-blue-100/70 dark:hover:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-left cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-1 text-[11px] font-bold text-blue-900 dark:text-blue-200 truncate">
                        <UserCheck className="w-3 h-3 text-blue-600 shrink-0" />
                        <span className="truncate">Surveyor Lapangan</span>
                      </div>
                      <div className="text-[10px] text-blue-700/80 dark:text-blue-300/80 truncate font-mono">fadhillah.surveyor</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFill('aris.akademisi@gmail.com', 'tamu')}
                      className="p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 hover:bg-amber-100/70 dark:hover:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-left cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-900 dark:text-amber-200 truncate">
                        <Eye className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="truncate">Tamu / Akademisi</span>
                      </div>
                      <div className="text-[10px] text-amber-700/80 dark:text-amber-300/80 truncate font-mono">aris.akademisi@gmail.com</div>
                    </button>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <p className="text-xs text-slate-500 dark:text-[#B0B0B0]">
                    Belum memiliki akun?{' '}
                    <button
                      type="button"
                      onClick={() => { 
                        setMode('register'); 
                        setLoginError(null); 
                        setRegError(null); 
                      }}
                      className="font-semibold text-indigo-600 dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      Daftar akun baru sekarang
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: FORM REGISTER */}
            {mode === 'register' && (
              <div className="space-y-4">
                
                {regError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Pendaftaran Akun Terkendala</div>
                      <div className="text-[11px] mt-0.5">{regError}</div>
                    </div>
                  </div>
                )}

                {regSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{regSuccess}</span>
                  </div>
                )}

                {/* STEP 1: PILIHAN PERAN RISET */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 dark:text-[#E0E0E0]">
                      1. Pilih Peran Akun Riset Anda *
                    </label>
                    <span className="text-[10px] text-indigo-600 dark:text-sky-400 font-semibold">
                      Tersimpan di Cloud Firestore
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* 1. Tamu / Akademisi */}
                    <button
                      type="button"
                      onClick={() => setRegRole('tamu')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        regRole === 'tamu'
                          ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 ring-2 ring-amber-500/20 shadow-2xs'
                          : 'bg-white dark:bg-[#1E1E1E] border-slate-200 dark:border-[#444444] hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                            regRole === 'tamu' ? 'bg-amber-600 text-white shadow-2xs' : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                          }`}>
                            <Eye className="w-4 h-4" />
                          </div>
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                            Mode Hanya Baca
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-[#E0E0E0] leading-tight">
                          Tamu / Akademisi
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-[#B0B0B0] mt-1 leading-relaxed">
                          Peneliti, dosen, & mahasiswa untuk eksplorasi data empiris & peta dialektometri.
                        </p>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-amber-200/60 dark:border-amber-900/40 text-[9px] text-amber-800 dark:text-amber-300 font-medium space-y-0.5">
                        <div className="flex items-center gap-1"><span>•</span> Peta Titik Survei</div>
                        <div className="flex items-center gap-1"><span>•</span> Komparasi Bahasa</div>
                      </div>
                    </button>

                    {/* 2. Surveyor Lapangan */}
                    <button
                      type="button"
                      onClick={() => setRegRole('surveyor')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        (regRole === 'surveyor' || regRole === 'user')
                          ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 ring-2 ring-blue-500/20 shadow-2xs'
                          : 'bg-white dark:bg-[#1E1E1E] border-slate-200 dark:border-[#444444] hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                            (regRole === 'surveyor' || regRole === 'user') ? 'bg-blue-600 text-white shadow-2xs' : 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                          }`}>
                            <UserCheck className="w-4 h-4" />
                          </div>
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-blue-200/80 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200">
                            Pengumpul Data
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-[#E0E0E0] leading-tight">
                          Surveyor Lapangan
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-[#B0B0B0] mt-1 leading-relaxed">
                          Petugas pengumpul data lapangan: pengisian kuesioner 16 seksi & dialektometri.
                        </p>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-blue-200/60 dark:border-blue-900/40 text-[9px] text-blue-800 dark:text-blue-300 font-medium space-y-0.5">
                        <div className="flex items-center gap-1"><span>•</span> Kuesioner (16 Seksi)</div>
                        <div className="flex items-center gap-1"><span>•</span> Korpus Sastra Lisan</div>
                      </div>
                    </button>

                    {/* 3. Verifikator Linguistik */}
                    <button
                      type="button"
                      onClick={() => setRegRole('verifikator')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        regRole === 'verifikator'
                          ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 ring-2 ring-emerald-500/20 shadow-2xs'
                          : 'bg-white dark:bg-[#1E1E1E] border-slate-200 dark:border-[#444444] hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                            regRole === 'verifikator' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                          }`}>
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200">
                            Otoritas Validasi
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-[#E0E0E0] leading-tight">
                          Verifikator Linguistik
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-[#B0B0B0] mt-1 leading-relaxed">
                          Peneliti & kurator: otoritas mengesahkan data berstatus TERVALIDASI resmi.
                        </p>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40 text-[9px] text-emerald-800 dark:text-emerald-300 font-medium space-y-0.5">
                        <div className="flex items-center gap-1"><span>•</span> Pengesahan Tervalidasi</div>
                        <div className="flex items-center gap-1"><span>•</span> Kurasi Transkripsi IPA</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* STEP 2: INSTITUSI & WILAYAH (OPSIONAL / PELENGKAP) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Institusi / Balai Bahasa / Kampus
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-[#888888]">
                        <Building className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={regInstitution}
                        onChange={e => setRegInstitution(e.target.value)}
                        placeholder={
                          regRole === 'tamu' ? 'Fakultas / Universitas / Pusat Riset' :
                          regRole === 'verifikator' ? 'Pusat Riset Dialektologi / Balai Bahasa' :
                          'Balai Bahasa Provinsi / Kantor Bahasa'
                        }
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#1E1E1E] border border-slate-300 dark:border-[#444444] rounded-lg text-xs sm:text-sm text-slate-900 dark:text-[#E0E0E0] placeholder-slate-400 dark:placeholder-[#888888] focus:outline-hidden focus:border-indigo-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-[#E0E0E0] mb-1">
                      Wilayah Penugasan / Riset
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-[#888888]">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={regRegion}
                        onChange={e => setRegRegion(e.target.value)}
                        placeholder={
                          regRole === 'tamu' ? 'Peneliti Tamu (Nasional / Regional)' :
                          regRole === 'verifikator' ? 'Wilayah Kurasi (Misal: Maluku & Malut)' :
                          'Kabupaten / Titik Pengamatan Lapangan'
                        }
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#1E1E1E] border border-slate-300 dark:border-[#444444] rounded-lg text-xs sm:text-sm text-slate-900 dark:text-[#E0E0E0] placeholder-slate-400 dark:placeholder-[#888888] focus:outline-hidden focus:border-indigo-600"
                      />
                    </div>
                  </div>
                </div>

                {/* PRIMARY ACTION: DAFTAR DENGAN AKUN GOOGLE */}
                <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-2 mt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-950 dark:text-indigo-200">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600 dark:text-sky-400 shrink-0" />
                      <span>Pendaftaran Cepat Akun Google</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white dark:bg-[#1E1E1E] border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300">
                      Peran: {regRole === 'tamu' ? 'Tamu / Akademisi' : regRole === 'verifikator' ? 'Verifikator' : 'Surveyor'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGoogleAuth('register')}
                    disabled={regLoading || loginLoading}
                    className="w-full flex items-center justify-center gap-3 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-[#1E1E1E] px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 dark:text-[#E0E0E0] shadow-xs hover:bg-slate-50 dark:hover:bg-[#252525] hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 group"
                  >
                    <GoogleIcon className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" />
                    <span>{regLoading ? 'Mendaftarkan ke Firebase...' : `Daftar dengan Akun Google`}</span>
                  </button>

                  <p className="text-[11px] text-slate-600 dark:text-[#B0B0B0] text-center leading-relaxed">
                    Akun Google Anda akan langsung terdaftar di Firebase Authentication dan tersimpan di Cloud Firestore dengan peran <strong>{regRole === 'tamu' ? 'Tamu (Hanya Baca)' : regRole === 'verifikator' ? 'Verifikator Linguistik' : 'Surveyor Lapangan'}</strong>.
                  </p>
                </div>

                <div className="my-4 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                  <span className="h-px flex-1 bg-slate-200 dark:bg-[#444444]" />
                  <span>atau lengkapi formulir email manual</span>
                  <span className="h-px flex-1 bg-slate-200 dark:bg-[#444444]" />
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-[#E0E0E0] mb-1">
                      Nama Lengkap & Gelar *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-[#888888]">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                        required
                        placeholder="Contoh: Dr. Nurhaliza, M.Hum."
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#1E1E1E] border border-slate-300 dark:border-[#444444] rounded-lg text-xs sm:text-sm text-slate-900 dark:text-[#E0E0E0] placeholder-slate-400 dark:placeholder-[#888888] focus:outline-hidden focus:border-indigo-600 dark:focus:border-sky-400 focus:ring-2 focus:ring-indigo-600/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-[#E0E0E0] mb-1">
                      Alamat Email (Firebase Auth) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-[#888888]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        required
                        placeholder="nama@gmail.com"
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#1E1E1E] border border-slate-300 dark:border-[#444444] rounded-lg text-xs sm:text-sm text-slate-900 dark:text-[#E0E0E0] placeholder-slate-400 dark:placeholder-[#888888] focus:outline-hidden focus:border-indigo-600 dark:focus:border-sky-400 focus:ring-2 focus:ring-indigo-600/10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-[#E0E0E0] mb-1">
                        Kata Sandi *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-[#888888]">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          value={regPassword}
                          onChange={e => setRegPassword(e.target.value)}
                          required
                          placeholder="Min. 6 karakter"
                          className="w-full pl-9 pr-8 py-2 bg-white dark:bg-[#1E1E1E] border border-slate-300 dark:border-[#444444] rounded-lg text-xs sm:text-sm text-slate-900 dark:text-[#E0E0E0] placeholder-slate-400 dark:placeholder-[#888888] focus:outline-hidden focus:border-indigo-600 dark:focus:border-sky-400 focus:ring-2 focus:ring-indigo-600/10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 dark:text-[#888888] hover:text-slate-600 dark:hover:text-[#E0E0E0]"
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-[#E0E0E0] mb-1">
                        Konfirmasi Sandi *
                      </label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={e => setRegConfirmPassword(e.target.value)}
                        required
                        placeholder="Ulangi kata sandi"
                        className="w-full px-3 py-2 bg-white dark:bg-[#1E1E1E] border border-slate-300 dark:border-[#444444] rounded-lg text-xs sm:text-sm text-slate-900 dark:text-[#E0E0E0] placeholder-slate-400 dark:placeholder-[#888888] focus:outline-hidden focus:border-indigo-600 dark:focus:border-sky-400 focus:ring-2 focus:ring-indigo-600/10"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={regLoading}
                    className="w-full mt-3 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {regLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Mendaftarkan akun ke Firebase...</span>
                      </span>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Daftarkan Akun Baru dengan Email</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center pt-2">
                  <p className="text-xs text-slate-500 dark:text-[#B0B0B0]">
                    Sudah memiliki akun?{' '}
                    <button
                      type="button"
                      onClick={() => { 
                        setMode('login'); 
                        setRegError(null); 
                        setLoginError(null); 
                      }}
                      className="font-semibold text-indigo-600 dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      Masuk di sini
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* Footer Features Info */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[#444444] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-[#B0B0B0]">
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Surveyor: input & kelola survei mandiri</span>
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-sky-400" />
                <span>Super Admin: wewenang penuh & verifikasi</span>
              </span>
            </div>

          </div>
        </div>

        {/* Minimal Footer Note */}
        <p className="text-center text-[11px] text-slate-500 dark:text-[#B0B0B0]">
          Instrumen Pemetaan Bahasa & Dialektometri • Firebase Email Authentication
        </p>

      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#444444] rounded-2xl max-w-sm w-full p-5 shadow-2xl text-left">
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#E0E0E0] mb-1">
              Atur Ulang Kata Sandi
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#B0B0B0] mb-4">
              Masukkan alamat email Anda yang terdaftar pada Firebase untuk menerima tautan pemulihan kata sandi.
            </p>

            {forgotStatus && (
              <div className={`p-3 rounded-xl mb-3 text-xs flex items-center gap-2 ${
                forgotStatus.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200'
              }`}>
                {forgotStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{forgotStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleSendResetEmail} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-[#E0E0E0] mb-1">
                  Alamat Email
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  required
                  placeholder="nama@domain.com"
                  className="w-full px-3 py-2 bg-white dark:bg-[#1E1E1E] border border-slate-300 dark:border-[#444444] rounded-lg text-xs text-slate-900 dark:text-[#E0E0E0] focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-[#B0B0B0] hover:bg-slate-100 dark:hover:bg-[#1E1E1E] cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                >
                  {forgotLoading ? 'Mengirim...' : 'Kirim Tautan Reset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default LoginPage;
