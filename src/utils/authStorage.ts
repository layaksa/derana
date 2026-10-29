import { AppUser, UserRole, RoleRequest } from '../types/auth';
import { SurveyRecord } from '../types/linguistic';

export const STORAGE_KEY_USERS = 'linguistic_mapping_users_v1';
export const STORAGE_KEY_CURRENT_USER = 'linguistic_mapping_current_user_v1';
export const STORAGE_KEY_ROLE_REQUESTS = 'linguistic_mapping_role_requests_v1';

export const DEFAULT_USERS: AppUser[] = [
  // 1. ADMIN SISTEM (Koordinator Riset Balai)
  {
    id: 'user_admin_derana',
    username: 'derana',
    name: 'Derana Admin (Koordinator Riset)',
    email: 'derana.apps@gmail.com',
    role: 'admin',
    status: 'active',
    isApproved: true,
    password: 'admin',
    institution: 'Badan Pengembangan dan Pembinaan Bahasa',
    assignedRegion: 'Nasional (Koordinator Utama)',
    createdAt: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'user_admin_fadhillah',
    username: 'fadhillah.admin',
    name: 'Fadhillah Pandu Pradana, S.S.',
    email: 'fadhillah.admin@gmail.com',
    role: 'admin',
    status: 'active',
    isApproved: true,
    password: 'admin123',
    institution: 'Balai Bahasa Provinsi Maluku',
    assignedRegion: 'Kepulauan Maluku (Koordinator Wilayah)',
    createdAt: '2026-01-05T08:00:00.000Z'
  },
  // 2. VERIFIKATOR LINGUISTIK (Peneliti & Kurator Bahasa)
  {
    id: 'user_verifikator_dewi',
    username: 'dewi.verifikator',
    name: 'Dr. Dewi Sartika, M.Hum.',
    email: 'dewi.verifikator@gmail.com',
    role: 'verifikator',
    status: 'active',
    isApproved: true,
    password: 'verifikator123',
    institution: 'Pusat Riset Dialektologi & Kurasi Bahasa',
    assignedRegion: 'Wilayah Barat & Kepulauan Riau (Kurator Linguistik)',
    createdAt: '2026-01-12T09:00:00.000Z'
  },
  {
    id: 'user_verifikator_johanes',
    username: 'johanes.verifikator',
    name: 'Dr. Johanes Latuconsina, M.A.',
    email: 'johanes.verifikator@gmail.com',
    role: 'verifikator',
    status: 'active',
    isApproved: true,
    password: 'verifikator123',
    institution: 'Balai Bahasa Provinsi Maluku',
    assignedRegion: 'Wilayah Kepulauan Maluku & Papua Barat (Kurator)',
    createdAt: '2026-01-14T10:00:00.000Z'
  },
  // 3. SURVEYOR LAPANGAN (Petugas Pengumpul Data)
  {
    id: 'user_surveyor_budi',
    username: 'budi.santoso',
    name: 'Budi Santoso, S.S.',
    email: 'budi@pemetaan.id',
    role: 'surveyor',
    status: 'active',
    isApproved: true,
    password: 'user123',
    institution: 'Balai Bahasa Provinsi Jawa Barat',
    assignedRegion: 'Kabupaten Garut & Tasikmalaya (Petugas Pengumpul)',
    createdAt: '2026-02-01T09:30:00.000Z'
  },
  {
    id: 'user_surveyor_fadhillah',
    username: 'fadhillah.surveyor',
    name: 'Fadhillah Pandu Pradana, S.S.',
    email: 'fadhillah@gmail.com',
    role: 'surveyor',
    status: 'active',
    isApproved: true,
    password: 'user123',
    institution: 'Balai Bahasa Provinsi Maluku',
    assignedRegion: 'Pulau Ambon & Kepulauan Lease (Wilayah Lapangan)',
    createdAt: '2026-01-15T09:00:00.000Z'
  },
  {
    id: 'user_surveyor_siti',
    username: 'siti.aminah',
    name: 'Siti Aminah, M.Pd.',
    email: 'siti@pemetaan.id',
    role: 'surveyor',
    status: 'active',
    isApproved: true,
    password: 'user123',
    institution: 'Balai Bahasa Provinsi Jawa Tengah',
    assignedRegion: 'Kabupaten Brebes & Cilacap (Perbatasan Sunda-Jawa)',
    createdAt: '2026-02-15T11:00:00.000Z'
  },
  // 4. TAMU / AKADEMISI (Mode Hanya Baca)
  {
    id: 'user_tamu_aris',
    username: 'tamu.akademisi',
    name: 'Prof. Dr. Aris Munandar',
    email: 'aris.akademisi@gmail.com',
    role: 'tamu',
    status: 'active',
    isApproved: true,
    password: 'tamu',
    institution: 'Fakultas Ilmu Budaya / Peneliti Akademisi',
    assignedRegion: 'Peneliti Tamu (Mode Hanya Baca Data Empiris)',
    createdAt: '2026-03-01T08:00:00.000Z'
  },
  {
    id: 'user_tamu_mahasiswa',
    username: 'mahasiswa.linguistik',
    name: 'Alya Rahmawati (Mahasiswa Riset)',
    email: 'alya.riset@gmail.com',
    role: 'tamu',
    status: 'active',
    isApproved: true,
    password: 'tamu',
    institution: 'Laboratorium Dialektologi Universitas',
    assignedRegion: 'Peneliti Mahasiswa (Mode Hanya Baca)',
    createdAt: '2026-03-05T09:00:00.000Z'
  }
];

/**
 * Load all registered users from localStorage or initialize with defaults
 */
export function loadAllUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let modified = false;
        // Migrate any legacy @kemdikbud.go.id emails to @gmail.com & ensure status
        const merged: AppUser[] = parsed.map((u: any) => {
          let role: UserRole = u.role;
          if ((role as any) === 'user') role = 'surveyor';
          const email = u.email ? u.email.replace(/@([a-zA-Z0-9.-]+\.)?kemdikbud\.go\.id$/i, '@gmail.com') : u.email;
          const status: 'active' | 'pending' | 'rejected' = u.status || (role === 'surveyor' && u.isApproved === false ? 'pending' : 'active');
          const isApproved = u.isApproved ?? (status === 'active');
          return {
            ...u,
            email,
            role,
            status,
            isApproved
          };
        });

        // Ensure default key users exist and keep emails up-to-date
        for (const defUser of DEFAULT_USERS) {
          const idx = merged.findIndex(u => u.username === defUser.username || u.id === defUser.id);
          if (idx === -1) {
            merged.unshift(defUser);
            modified = true;
          } else if (merged[idx].email.includes('kemdikbud.go.id')) {
            merged[idx] = {
              ...merged[idx],
              email: defUser.email
            };
            modified = true;
          }
        }
        if (modified) {
          localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(merged));
        }
        return merged;
      }
    }
  } catch (e) {
    console.error('Failed to load users from storage:', e);
  }

  // Seed default users
  try {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(DEFAULT_USERS));
  } catch (e) {
    console.error('Failed to seed default users:', e);
  }
  return DEFAULT_USERS;
}

/**
 * Persist users list into localStorage
 */
export function persistUsers(users: AppUser[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to persist users:', e);
  }
}

/**
 * Register a new user
 * - Tamu / Akademisi: status: 'active', isApproved: true
 * - Surveyor Lapangan: status: 'pending', isApproved: false (requires Admin approval)
 */
export function registerUser(newUserData: Omit<AppUser, 'id' | 'createdAt'>): { success: boolean; message: string; user?: AppUser } {
  const users = loadAllUsers();
  
  // Check duplicate username or email
  const duplicate = users.find(
    u => u.username.toLowerCase() === newUserData.username.toLowerCase() || 
         u.email.toLowerCase() === newUserData.email.toLowerCase()
  );

  if (duplicate) {
    return {
      success: false,
      message: duplicate.email.toLowerCase() === newUserData.email.toLowerCase()
        ? 'Email sudah terdaftar dalam sistem.'
        : 'Username sudah digunakan, silakan pilih username lain.'
    };
  }

  const isSurveyor = newUserData.role === 'surveyor' || (newUserData.role as any) === 'user';
  const role: UserRole = isSurveyor ? 'surveyor' : (newUserData.role || 'tamu');
  const status: 'active' | 'pending' = isSurveyor ? 'pending' : 'active';
  const isApproved = !isSurveyor;

  const newUser: AppUser = {
    ...newUserData,
    role,
    status,
    isApproved,
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString()
  };

  const updatedUsers = [...users, newUser];
  persistUsers(updatedUsers);

  return {
    success: true,
    message: isSurveyor
      ? 'Pendaftaran akun Surveyor Lapangan berhasil! Akun Anda sedang menunggu persetujuan dari Admin Sistem.'
      : 'Pendaftaran akun Tamu/Akademisi berhasil! Akun Anda langsung aktif.',
    user: newUser
  };
}

/**
 * Update user role or profile (admin action)
 */
export function updateUserByAdmin(userId: string, updates: Partial<AppUser>): AppUser[] {
  const users = loadAllUsers();
  const updated = users.map(u => u.id === userId ? { ...u, ...updates } : u);
  persistUsers(updated);
  return updated;
}

/**
 * Update user's own profile information
 */
export function updateUserProfile(userId: string, updates: Partial<Pick<AppUser, 'name' | 'email' | 'institution' | 'assignedRegion'>>): { success: boolean; user?: AppUser; message: string } {
  const users = loadAllUsers();
  const target = users.find(u => u.id === userId);
  
  if (!target) {
    return { success: false, message: 'Pengguna tidak ditemukan.' };
  }

  // Check email conflict if email changed
  if (updates.email && updates.email.toLowerCase() !== target.email.toLowerCase()) {
    const emailConflict = users.find(u => u.id !== userId && u.email.toLowerCase() === updates.email!.toLowerCase());
    if (emailConflict) {
      return { success: false, message: 'Email sudah digunakan oleh akun lain.' };
    }
  }

  const updatedUser: AppUser = {
    ...target,
    ...updates
  };

  const updatedList = users.map(u => u.id === userId ? updatedUser : u);
  persistUsers(updatedList);

  // If this is current session user, update session
  const current = getCurrentUser();
  if (current && current.id === userId) {
    setCurrentUserSession(updatedUser);
  }

  return {
    success: true,
    user: updatedUser,
    message: 'Profil berhasil diperbarui!'
  };
}

/**
 * Change user password
 */
export function changeUserPassword(userId: string, currentPass: string, newPass: string): { success: boolean; message: string } {
  const users = loadAllUsers();
  const target = users.find(u => u.id === userId);

  if (!target) {
    return { success: false, message: 'Pengguna tidak ditemukan.' };
  }

  if (target.password && target.password !== currentPass) {
    return { success: false, message: 'Kata sandi saat ini salah.' };
  }

  if (newPass.length < 6) {
    return { success: false, message: 'Kata sandi baru minimal 6 karakter.' };
  }

  const updatedUser: AppUser = {
    ...target,
    password: newPass
  };

  const updatedList = users.map(u => u.id === userId ? updatedUser : u);
  persistUsers(updatedList);

  const current = getCurrentUser();
  if (current && current.id === userId) {
    setCurrentUserSession(updatedUser);
  }

  return {
    success: true,
    message: 'Kata sandi berhasil diubah!'
  };
}

/**
 * Get active session user
 */
export function getCurrentUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (raw) {
      const user = JSON.parse(raw) as AppUser;
      if (user.email && user.email.includes('kemdikbud.go.id')) {
        user.email = user.email.replace(/@([a-zA-Z0-9.-]+\.)?kemdikbud\.go\.id$/i, '@gmail.com');
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
      }
      return user;
    }
  } catch (e) {
    console.error('Failed to get current user:', e);
  }
  return null;
}

/**
 * Set active session user
 */
export function setCurrentUserSession(user: AppUser | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
  } catch (e) {
    console.error('Failed to set current user session:', e);
  }
}

/**
 * Authenticate user with username/email and password
 */
export function authenticateUser(identifier: string, passwordAttempt: string): { success: boolean; user?: AppUser; message: string } {
  const users = loadAllUsers();
  const cleanId = identifier.trim().toLowerCase();

  const matched = users.find(
    u => u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId
  );

  if (!matched) {
    return {
      success: false,
      message: 'Username atau email tidak ditemukan.'
    };
  }

  if (matched.password && matched.password !== passwordAttempt) {
    return {
      success: false,
      message: 'Kata sandi tidak sesuai. Silakan periksa kembali.'
    };
  }

  // Set session
  setCurrentUserSession(matched);

  return {
    success: true,
    user: matched,
    message: `Selamat datang kembali, ${matched.name}!`
  };
}

/**
 * Handle user logged in via Google (Firebase Auth or Google Identity Services)
 * Ensures roles are never downgraded for existing users, and sets correct pending status for new surveyors.
 */
export function loginOrRegisterGoogleUser(profile: {
  email: string;
  name?: string;
  picture?: string;
  sub?: string;
  role?: UserRole;
  status?: 'active' | 'pending' | 'rejected';
  isApproved?: boolean;
  institution?: string;
  assignedRegion?: string;
  username?: string;
}): AppUser {
  const users = loadAllUsers();
  const cleanEmail = profile.email.trim().toLowerCase();
  const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
  const isAdminEmail = cleanEmail === 'derana.apps@gmail.com' || cleanEmail === 'layaksa.studio@gmail.com' || cleanEmail.includes('admin');

  if (existing) {
    let changed = false;
    if (!existing.authProvider || existing.authProvider !== 'google_oauth') {
      existing.authProvider = 'google_oauth';
      existing.oauthConnected = true;
      existing.oauthEmail = cleanEmail;
      existing.oauthAuthorizedAt = new Date().toISOString();
      existing.oauthScopes = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ];
      changed = true;
    }
    // Always grant admin to verified admin emails
    if (isAdminEmail && existing.role !== 'admin') {
      existing.role = 'admin';
      existing.status = 'active';
      existing.isApproved = true;
      changed = true;
    }
    // Keep existing status and isApproved if present, otherwise default based on role
    if (!existing.status) {
      existing.status = existing.role === 'surveyor' ? 'pending' : 'active';
      existing.isApproved = existing.role !== 'surveyor';
      changed = true;
    }
    if (profile.picture && existing.avatar !== profile.picture) {
      existing.avatar = profile.picture;
      changed = true;
    }
    if (profile.name && (!existing.name || existing.name === 'Pengguna Google')) {
      existing.name = profile.name;
      changed = true;
    }
    if (profile.institution && (!existing.institution || existing.institution === 'Peneliti Mandiri (Google Auth)')) {
      existing.institution = profile.institution;
      changed = true;
    }
    if (profile.assignedRegion && (!existing.assignedRegion || existing.assignedRegion === 'Wilayah Lapangan')) {
      existing.assignedRegion = profile.assignedRegion;
      changed = true;
    }
    if (changed) {
      persistUsers(users);
    }
    setCurrentUserSession(existing);
    return existing;
  }

  // Create new user for Google Account
  const defaultUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_.]/g, '') || `google_${Date.now()}`;
  
  let newRole: UserRole = 'tamu';
  let newStatus: 'active' | 'pending' = 'active';
  let isApproved = true;

  if (isAdminEmail) {
    newRole = 'admin';
    newStatus = 'active';
    isApproved = true;
  } else if (profile.role === 'surveyor' || (profile.role as any) === 'user') {
    newRole = 'surveyor';
    newStatus = profile.status || 'pending';
    isApproved = profile.isApproved ?? false;
  } else {
    newRole = 'tamu';
    newStatus = 'active';
    isApproved = true;
  }

  const newUser: AppUser = {
    id: `google_${profile.sub || Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    username: profile.username || defaultUsername,
    name: profile.name || cleanEmail.split('@')[0],
    email: cleanEmail,
    role: newRole,
    status: newStatus,
    isApproved,
    avatar: profile.picture,
    institution: profile.institution || (isAdminEmail ? 'Badan Pengembangan dan Pembinaan Bahasa' : 'Peneliti Mandiri / Balai Bahasa'),
    assignedRegion: profile.assignedRegion || (isAdminEmail ? 'Nasional (Koordinator Utama)' : 'Wilayah Lapangan'),
    createdAt: new Date().toISOString(),
    authProvider: 'google_oauth',
    oauthConnected: true,
    oauthEmail: cleanEmail,
    oauthAuthorizedAt: new Date().toISOString(),
    oauthScopes: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  };

  users.push(newUser);
  persistUsers(users);
  setCurrentUserSession(newUser);
  return newUser;
}

/**
 * Hubungkan akun pengguna yang sedang aktif dengan otorisasi Google OAuth 2.0
 */
export function linkUserWithGoogleOAuth(userId: string, oauthEmail: string = 'derana.apps@gmail.com'): { success: boolean; user?: AppUser; message: string } {
  const users = loadAllUsers();
  const target = users.find(u => u.id === userId);

  if (!target) {
    return { success: false, message: 'Pengguna tidak ditemukan.' };
  }

  const updatedUser: AppUser = {
    ...target,
    authProvider: 'google_oauth',
    oauthConnected: true,
    oauthEmail: oauthEmail.trim().toLowerCase(),
    oauthAuthorizedAt: new Date().toISOString(),
    oauthScopes: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  };

  const updatedList = users.map(u => u.id === userId ? updatedUser : u);
  persistUsers(updatedList);

  const current = getCurrentUser();
  if (current && current.id === userId) {
    setCurrentUserSession(updatedUser);
  }

  return {
    success: true,
    user: updatedUser,
    message: `Akun berhasil diotorisasi dan terhubung dengan Google OAuth (${oauthEmail})!`
  };
}

/**
 * Human-readable label for user role
 */
export function getRoleLabel(role?: UserRole): string {
  switch (role) {
    case 'admin':
      return 'Admin Sistem (Koordinator Riset Balai)';
    case 'verifikator':
      return 'Verifikator Linguistik (Peneliti & Kurator)';
    case 'surveyor':
    case 'user':
      return 'Surveyor Lapangan (Petugas Pengumpul Data)';
    case 'tamu':
      return 'Tamu / Akademisi (Mode Hanya Baca)';
    default:
      return 'Tamu / Pengamat';
  }
}

/**
 * Visual badge styling for each role
 */
export function getRoleBadge(role?: UserRole): { label: string; shortLabel: string; bg: string; text: string; border: string; accent: string } {
  switch (role) {
    case 'admin':
      return {
        label: 'Admin Sistem',
        shortLabel: 'Admin',
        bg: 'bg-purple-50 dark:bg-purple-950/70',
        text: 'text-purple-700 dark:text-purple-300',
        border: 'border-purple-200 dark:border-purple-800',
        accent: '#9333ea'
      };
    case 'verifikator':
      return {
        label: 'Verifikator Linguistik',
        shortLabel: 'Verifikator',
        bg: 'bg-emerald-50 dark:bg-emerald-950/70',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800',
        accent: '#059669'
      };
    case 'surveyor':
    case 'user':
      return {
        label: 'Surveyor Lapangan',
        shortLabel: 'Surveyor',
        bg: 'bg-blue-50 dark:bg-blue-950/70',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
        accent: '#2563eb'
      };
    case 'tamu':
      return {
        label: 'Tamu / Akademisi',
        shortLabel: 'Hanya Baca',
        bg: 'bg-amber-50 dark:bg-amber-950/70',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800',
        accent: '#d97706'
      };
    default:
      return {
        label: 'Tamu',
        shortLabel: 'Tamu',
        bg: 'bg-slate-50 dark:bg-slate-800',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-200 dark:border-slate-700',
        accent: '#64748b'
      };
  }
}

/**
 * Functional role description
 */
export function getRoleDescription(role?: UserRole): string {
  switch (role) {
    case 'admin':
      return 'Koordinator Riset Balai: Otoritas penuh menetapkan peran (admin, verifikator, surveyor) di Pengaturan & Pengguna, monitoring sinkronisasi, dan menjamin kelancaran sistem.';
    case 'verifikator':
      return 'Peneliti & Kurator: Memiliki otoritas mengesahkan data dengan status Tervalidasi, menginspeksi transkripsi IPA, rekaman audio, dan butir pemetaan.';
    case 'surveyor':
    case 'user':
      return 'Petugas Pengumpul Data: Mengisi kuesioner kebahasaan & kesastraan, merekam audio, menghitung matriks dialektometri, dan mengunggah berkas lapangan.';
    case 'tamu':
      return 'Peneliti, Akademisi, & Mahasiswa: Mode Hanya Baca untuk eksplorasi data empiris: Peta Titik Survei, Komparasi Bahasa, dan Dialektometri tanpa hak mengubah instrumen.';
    default:
      return 'Akses data empiris umum.';
  }
}

/**
 * Check if the active user can verify survey data
 * - Admin Sistem & Verifikator Linguistik have authority to verify
 */
export function canUserVerifySurvey(currentUser: AppUser | null): boolean {
  if (!currentUser) return false;
  return currentUser.role === 'admin' || currentUser.role === 'verifikator';
}

/**
 * Check if user can create new surveys
 * - Admin, Verifikator, Surveyor (Active & Approved) can create
 * - Tamu (Read-Only) CANNOT create surveys
 * - Surveyor with status 'pending' CANNOT create surveys until approved by Admin
 */
export function canUserCreateSurvey(currentUser: AppUser | null): boolean {
  if (!currentUser) return false;
  if (currentUser.role === 'tamu') return false;
  if (currentUser.status === 'pending' || currentUser.isApproved === false) return false;
  return true;
}

/**
 * Check if the active user can modify this specific survey
 * - Admin: Can modify all surveys
 * - Verifikator: Can modify / add curation notes and verification status
 * - Surveyor (Active & Approved): Can modify their own survey
 * - Pending Users & Tamu: CANNOT edit (Read-Only Mode)
 */
export function canUserEditSurvey(survey: SurveyRecord | null | undefined, currentUser: AppUser | null): { allowed: boolean; reason?: string } {
  if (!currentUser) {
    return { allowed: false, reason: 'Silakan login terlebih dahulu untuk mengakses atau mengubah data kuesioner.' };
  }

  // Account Pending Approval Notice
  if (currentUser.status === 'pending' || currentUser.isApproved === false) {
    return {
      allowed: false,
      reason: 'Akun Anda sedang menunggu persetujuan dari Admin Sistem. Selama masa verifikasi penugasan, Anda hanya dapat melihat data dalam mode baca.'
    };
  }

  // Tamu / Akademisi is strictly read-only
  if (currentUser.role === 'tamu') {
    return { 
      allowed: false, 
      reason: 'Mode Tamu/Akademisi bersifat Hanya Baca (Read-Only). Anda dapat meninjau dan mengeksplorasi data empiris, namun hak penyuntingan instrumen dinonaktifkan.' 
    };
  }

  // Admin and Verifikator have broad editing/curating permissions
  if (currentUser.role === 'admin' || currentUser.role === 'verifikator') {
    return { allowed: true };
  }

  if (!survey) {
    return { allowed: true };
  }

  // If survey has already been verified, regular surveyor cannot modify verified data
  if (survey.isVerified && (currentUser.role === 'surveyor' || currentUser.role === 'user')) {
    return {
      allowed: false,
      reason: `Kuesioner ini telah berstatus TERVALIDASI resmi oleh ${survey.verifiedBy || 'Verifikator Linguistik'}. Surveyor Lapangan tidak diperkenankan mengubah instrumen yang telah disahkan demi menjaga integritas data ilmiah.`
    };
  }

  // If survey has no assigned creator, allow claiming or editing
  if (!survey.createdBy) {
    return { allowed: true };
  }

  // Regular surveyor can only edit their own surveys
  if (survey.createdBy === currentUser.id || survey.createdBy === currentUser.username) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Kuesioner ini diinput oleh ${survey.createdByName || 'peneliti lain'}. Sebagai Surveyor Lapangan, Anda hanya dapat melihat data ini. Hanya pembuat data, Verifikator, atau Admin yang dapat mengubahnya.`
  };
}

/**
 * Check if the active user can delete this specific survey
 * - Admin can delete any survey
 * - Verifikator can delete/manage unverified surveys
 * - Surveyor can delete their own survey (only if not yet verified)
 * - Tamu CANNOT delete
 */
export function canUserDeleteSurvey(survey: SurveyRecord, currentUser: AppUser | null): boolean {
  if (!currentUser) return false;
  if (currentUser.role === 'tamu') return false;
  if (currentUser.role === 'admin') return true;
  if (currentUser.role === 'verifikator') return true;
  if (survey.isVerified) return false; // Surveyor cannot delete an officially verified survey
  return survey.createdBy === currentUser.id || survey.createdBy === currentUser.username;
}

/**
 * Role Request Management (Mengajukan peran kepada Admin)
 */
export function loadRoleRequests(): RoleRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ROLE_REQUESTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load role requests:', e);
  }
  return [
    {
      id: 'req_sample_1',
      userId: 'user_tamu_aris',
      userName: 'Prof. Dr. Aris Munandar',
      userEmail: 'aris.akademisi@gmail.com',
      currentRole: 'tamu',
      requestedRole: 'verifikator',
      institution: 'Fakultas Ilmu Budaya / Peneliti Akademisi',
      reason: 'Memerlukan hak kurasi dan verifikasi data dialektometri untuk publikasi riset bahasa daerah.',
      status: 'pending',
      requestedAt: '2026-03-12T10:00:00.000Z'
    },
    {
      id: 'req_sample_2',
      userId: 'user_tamu_mahasiswa',
      userName: 'Alya Rahmawati',
      userEmail: 'alya.riset@gmail.com',
      currentRole: 'tamu',
      requestedRole: 'surveyor',
      institution: 'Laboratorium Dialektologi Universitas',
      reason: 'Bertugas sebagai asisten lapangan pengumpulan data kuesioner Swadesh di Jawa Barat.',
      status: 'pending',
      requestedAt: '2026-03-13T14:30:00.000Z'
    }
  ];
}

export function persistRoleRequests(requests: RoleRequest[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ROLE_REQUESTS, JSON.stringify(requests));
  } catch (e) {
    console.error('Failed to persist role requests:', e);
  }
}

export function submitRoleRequest(params: {
  userId: string;
  userName: string;
  userEmail: string;
  currentRole: UserRole;
  requestedRole: UserRole;
  institution: string;
  reason: string;
}): { success: boolean; message: string; request?: RoleRequest } {
  const allReqs = loadRoleRequests();
  const existingPending = allReqs.find(r => r.userId === params.userId && r.status === 'pending');
  if (existingPending) {
    return {
      success: false,
      message: 'Anda sudah memiliki pengajuan peran yang sedang menunggu persetujuan Admin.'
    };
  }

  const newReq: RoleRequest = {
    id: `req_${Date.now()}`,
    ...params,
    status: 'pending',
    requestedAt: new Date().toISOString()
  };

  const updated = [newReq, ...allReqs];
  persistRoleRequests(updated);

  // Update user's pendingRoleRequest field
  updateUserByAdmin(params.userId, { pendingRoleRequest: params.requestedRole });

  return {
    success: true,
    message: `Pengajuan peran sebagai ${getRoleLabel(params.requestedRole)} berhasil dikirimkan ke Admin Sistem.`,
    request: newReq
  };
}

export function approveRoleRequest(requestId: string, adminUser: AppUser): boolean {
  if (adminUser.role !== 'admin') return false;
  const allReqs = loadRoleRequests();
  const target = allReqs.find(r => r.id === requestId);
  if (!target) return false;

  target.status = 'approved';
  target.reviewedAt = new Date().toISOString();
  target.reviewedBy = adminUser.name;
  persistRoleRequests(allReqs);

  // Apply role to the user
  updateUserByAdmin(target.userId, { 
    role: target.requestedRole,
    pendingRoleRequest: undefined 
  });

  return true;
}

export function rejectRoleRequest(requestId: string, adminUser: AppUser): boolean {
  if (adminUser.role !== 'admin') return false;
  const allReqs = loadRoleRequests();
  const target = allReqs.find(r => r.id === requestId);
  if (!target) return false;

  target.status = 'rejected';
  target.reviewedAt = new Date().toISOString();
  target.reviewedBy = adminUser.name;
  persistRoleRequests(allReqs);

  // Clear pending flag
  updateUserByAdmin(target.userId, { pendingRoleRequest: undefined });
  return true;
}

/**
 * Logout user session
 */
export function logoutUser(): void {
  setCurrentUserSession(null);
}

/**
 * Switch session to a user by username (for testing/demo quick switch)
 */
export function switchUser(username: string): AppUser | null {
  const users = loadAllUsers();
  const matched = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (matched) {
    setCurrentUserSession(matched);
    return matched;
  }
  return null;
}

/**
 * Quick switch role directly for the active user (interactive role simulation)
 */
export function switchActiveUserRole(targetRole: UserRole): AppUser | null {
  const current = getCurrentUser();
  if (!current) return null;
  const updatedUser: AppUser = {
    ...current,
    role: targetRole
  };
  setCurrentUserSession(updatedUser);
  updateUserByAdmin(current.id, { role: targetRole });
  return updatedUser;
}

/**
 * Get all accounts pending approval (specifically users who registered as Surveyor)
 */
export function getPendingSurveyors(): AppUser[] {
  const users = loadAllUsers();
  return users.filter(u => u.status === 'pending' || (u.role === 'surveyor' && u.isApproved === false));
}

/**
 * Admin action: Approve a pending Surveyor Lapangan registration
 */
export function approveSurveyorUser(userId: string, adminUser: AppUser): { success: boolean; user?: AppUser; message: string } {
  if (adminUser.role !== 'admin') {
    return { success: false, message: 'Hanya Admin Sistem yang berhak menyetujui pendaftaran surveyor.' };
  }
  const users = loadAllUsers();
  const target = users.find(u => u.id === userId);
  if (!target) {
    return { success: false, message: 'Pengguna tidak ditemukan.' };
  }

  const now = new Date().toISOString();
  const updatedUser: AppUser = {
    ...target,
    role: 'surveyor',
    status: 'active',
    isApproved: true,
    approvedAt: now,
    approvedBy: adminUser.name
  };

  const updatedUsers = users.map(u => u.id === userId ? updatedUser : u);
  persistUsers(updatedUsers);

  // If approving the active session user, update session as well
  const current = getCurrentUser();
  if (current && current.id === userId) {
    setCurrentUserSession(updatedUser);
  }

  return {
    success: true,
    user: updatedUser,
    message: `Akun Surveyor "${updatedUser.name}" berhasil disetujui dan telah aktif sepenuhnya.`
  };
}

/**
 * Admin action: Reject a pending Surveyor Lapangan registration (downgrades to 'tamu')
 */
export function rejectSurveyorUser(userId: string, adminUser: AppUser): { success: boolean; user?: AppUser; message: string } {
  if (adminUser.role !== 'admin') {
    return { success: false, message: 'Hanya Admin Sistem yang berhak menolak pendaftaran surveyor.' };
  }
  const users = loadAllUsers();
  const target = users.find(u => u.id === userId);
  if (!target) {
    return { success: false, message: 'Pengguna tidak ditemukan.' };
  }

  const updatedUser: AppUser = {
    ...target,
    role: 'tamu',
    status: 'rejected',
    isApproved: false
  };

  const updatedUsers = users.map(u => u.id === userId ? updatedUser : u);
  persistUsers(updatedUsers);

  // If rejecting active session user, update session
  const current = getCurrentUser();
  if (current && current.id === userId) {
    setCurrentUserSession(updatedUser);
  }

  return {
    success: true,
    user: updatedUser,
    message: `Permohonan akun Surveyor "${updatedUser.name}" ditolak dan dialihkan ke mode Tamu/Akademisi.`
  };
}

