export type UserRole = 'admin' | 'verifikator' | 'surveyor' | 'tamu' | 'user';

export interface RoleRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  currentRole: UserRole;
  requestedRole: UserRole;
  institution: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface AppUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  institution?: string;
  assignedRegion?: string;
  password?: string;
  createdAt: string;
  authProvider?: 'google_oauth' | 'local';
  oauthConnected?: boolean;
  oauthEmail?: string;
  oauthAuthorizedAt?: string;
  oauthScopes?: string[];
  pendingRoleRequest?: UserRole;
}

export interface AuthState {
  user: AppUser | null;
  isAuthenticated: boolean;
}
