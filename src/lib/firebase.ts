import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc,
  getDocFromServer, 
  setDoc, 
  deleteDoc, 
  collection, 
  onSnapshot, 
  updateDoc 
} from 'firebase/firestore';
import { SurveyRecord } from '../types/linguistic';
import { UserRole } from '../types/auth';
const env = (import.meta as any).env || {};
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: env.VITE_FIREBASE_DATABASE_ID || '(default)'
};

export { firebaseConfig };

export const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);
auth.useDeviceLanguage();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection status state
export type FirebaseConnectionStatus = 'checking' | 'connected' | 'offline' | 'error';
let connectionStatus: FirebaseConnectionStatus = 'checking';
let lastSyncTimestamp: string | null = null;
const statusListeners = new Set<(status: FirebaseConnectionStatus) => void>();

export function getFirebaseStatus(): FirebaseConnectionStatus {
  return connectionStatus;
}

export function subscribeFirebaseStatus(listener: (status: FirebaseConnectionStatus) => void) {
  statusListeners.add(listener);
  listener(connectionStatus);
  return () => {
    statusListeners.delete(listener);
  };
}

function updateConnectionStatus(newStatus: FirebaseConnectionStatus) {
  if (connectionStatus !== newStatus) {
    connectionStatus = newStatus;
    statusListeners.forEach(listener => listener(newStatus));
  }
}

// Test connection on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection successful:', firebaseConfig.firestoreDatabaseId);
    updateConnectionStatus('connected');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network restricted. Continuing with local sync fallback.');
      updateConnectionStatus('offline');
    } else {
      console.info('Firestore initialized, ping test response handled.');
      updateConnectionStatus('connected');
    }
    return false;
  }
}

// Test connection immediately
testFirestoreConnection();

/**
 * Recursively strip undefined values from an object or array to comply with Firestore constraints.
 * Firestore strictly forbids `undefined` in field values and throws an error if present.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) {
    return null as any;
  }
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (data instanceof Date) {
    return data.toISOString() as any;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item)) as any;
  }
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    if (value !== undefined) {
      result[key] = sanitizeForFirestore(value);
    }
  }
  return result as T;
}

/**
 * Real-time listener for surveys from Firestore
 * Automatically syncs with local storage and seeds initial data if cloud is empty
 */
export function subscribeToSurveys(
  onSurveysUpdated: (surveys: SurveyRecord[]) => void,
  initialLocalSurveys?: SurveyRecord[]
) {
  const surveysPath = 'surveys';
  try {
    const unsub = onSnapshot(
      collection(db, surveysPath),
      async (snapshot) => {
        const list: SurveyRecord[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data() as SurveyRecord;
          if (d && d.id) {
            list.push(d);
          }
        });

        updateConnectionStatus('connected');
        lastSyncTimestamp = new Date().toISOString();

        if (list.length > 0) {
          // Cloud has data, pass it up
          onSurveysUpdated(list);
        } else if (initialLocalSurveys && initialLocalSurveys.length > 0) {
          // Cloud is newly provisioned / empty: seed local surveys into Firestore!
          console.info(`Inisialisasi cloud: Menyinkronkan ${initialLocalSurveys.length} data survei lokal ke Firestore...`);
          try {
            for (const s of initialLocalSurveys) {
              await setDoc(doc(db, 'surveys', s.id), sanitizeForFirestore(s), { merge: true });
            }
            console.log('Berhasil mengunggah basis data survei awal ke Firestore.');
            onSurveysUpdated(initialLocalSurveys);
          } catch (seedErr) {
            console.warn('Gagal mengunggah data survei awal ke cloud:', seedErr);
            onSurveysUpdated(initialLocalSurveys);
          }
        } else {
          onSurveysUpdated([]);
        }
      },
      (error) => {
        // Critical error callback per Firebase skill specification
        console.warn('Firestore surveys subscription notice:', error.message);
        if (error.message.includes('offline')) {
          updateConnectionStatus('offline');
        } else {
          updateConnectionStatus('error');
        }
      }
    );
    return unsub;
  } catch (err) {
    console.warn('Could not establish Firestore subscription, using local storage cache.');
    updateConnectionStatus('offline');
    return () => {};
  }
}

/**
 * Force manual sync of all local surveys to Firestore
 */
export async function syncAllSurveysToFirestore(localSurveys: SurveyRecord[]): Promise<number> {
  let count = 0;
  for (const s of localSurveys) {
    try {
      await setDoc(doc(db, 'surveys', s.id), sanitizeForFirestore(s), { merge: true });
      count++;
    } catch (e) {
      console.warn(`Gagal sinkronkan survei ${s.id}:`, e);
    }
  }
  lastSyncTimestamp = new Date().toISOString();
  updateConnectionStatus('connected');
  return count;
}

/**
 * Persist or update a survey record to Firestore
 */
export async function saveSurveyToFirestore(survey: SurveyRecord): Promise<void> {
  const path = `surveys/${survey.id}`;
  try {
    const cleanSurvey = sanitizeForFirestore(survey);
    await setDoc(doc(db, 'surveys', survey.id), cleanSurvey, { merge: true });
    console.log(`Saved survey ${survey.id} to Firestore.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetch a single survey record from Firestore
 */
export async function getSurveyFromFirestore(surveyId: string): Promise<SurveyRecord | null> {
  const path = `surveys/${surveyId}`;
  try {
    const docSnap = await getDoc(doc(db, 'surveys', surveyId));
    if (docSnap.exists()) {
      return docSnap.data() as SurveyRecord;
    }
    return null;
  } catch (error) {
    console.warn(`[Firestore] Could not fetch remote survey ${surveyId}:`, error);
    return null;
  }
}

/**
 * Delete a survey record from Firestore
 */
export async function deleteSurveyFromFirestore(surveyId: string): Promise<void> {
  const path = `surveys/${surveyId}`;
  try {
    await deleteDoc(doc(db, 'surveys', surveyId));
    console.log(`Deleted survey ${surveyId} from Firestore.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Toggle survey verification in Firestore
 */
export async function toggleVerificationInFirestore(
  surveyId: string, 
  isVerified: boolean, 
  verifierName: string
): Promise<void> {
  const path = `surveys/${surveyId}`;
  try {
    await updateDoc(doc(db, 'surveys', surveyId), {
      isVerified,
      verifiedBy: isVerified ? verifierName : null,
      verifiedAt: isVerified ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Sign in with Email and Password via Firebase Authentication
 */
export async function loginWithEmailPassword(email: string, password: string): Promise<User> {
  const cleanEmail = email.trim();
  const credential = await signInWithEmailAndPassword(auth, cleanEmail, password);
  return credential.user;
}

export interface GoogleAuthOptions {
  mode?: 'login' | 'register';
  desiredRole?: UserRole;
  institution?: string;
  assignedRegion?: string;
}

export interface GoogleAuthResult {
  user: User;
  profile: any;
  isNewUser: boolean;
}

/**
 * Sign in or register with a Google account via Firebase Authentication.
 * Configures GoogleAuthProvider with select_account and email/profile scopes.
 * Saves or updates profile in Cloud Firestore /users/{uid} while preserving roles.
 */
export async function loginWithGoogle(options: GoogleAuthOptions = {}): Promise<GoogleAuthResult> {
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  provider.setCustomParameters({ prompt: 'select_account' });

  let credential;
  try {
    credential = await signInWithPopup(auth, provider);
  } catch (error: any) {
    if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/cancelled-popup-request') {
      await signInWithRedirect(auth, provider);
      throw new Error('Google login dialihkan ke halaman autentikasi.');
    }
    throw error;
  }

  const user = credential.user;
  const isNew = Boolean((credential as any)?._tokenResponse?.isNewUser || options.mode === 'register');
  const profile = await syncUserToFirestore(
    user,
    undefined,
    options.institution,
    options.assignedRegion,
    isNew
  );

  return { user, profile, isNewUser: isNew };
}

export async function completeGoogleRedirectLogin(): Promise<User | null> {
  const result = await getRedirectResult(auth);
  if (!result?.user) return null;
  await syncUserToFirestore(result.user);
  return result.user;
}

/**
 * Register a new user with Email and Password in Firebase Authentication
 * and create their profile in Cloud Firestore /users/{uid}
 */
export async function registerWithEmailPassword(
  email: string, 
  password: string, 
  displayName: string, 
  role: UserRole = 'surveyor',
  institution?: string,
  assignedRegion?: string
): Promise<User> {
  const cleanEmail = email.trim();
  const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  const user = credential.user;

  if (displayName) {
    try {
      await updateProfile(user, { displayName });
    } catch (e) {
      console.warn('Could not update profile display name:', e);
    }
  }

  // Persist user document in Cloud Firestore /users/{uid}
  await syncUserToFirestore(user, role, institution, assignedRegion, true);
  return user;
}

/**
 * Send password reset email
 */
export async function resetPasswordEmail(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Fetch user profile from Firestore /users/{uid}
 */
export async function getUserProfileFromFirestore(uid: string): Promise<any | null> {
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (e) {
    console.warn('Could not fetch user profile from Firestore:', e);
  }
  return null;
}

/**
 * Sync authenticated user profile to Cloud Firestore /users/{uid}
 * Safely preserves existing roles unless admin email or explicit registration selection.
 */
export async function syncUserToFirestore(
  user: User,
  desiredRole?: UserRole,
  institution?: string,
  assignedRegion?: string,
  isRegistration: boolean = false
): Promise<any> {
  try {
    const userDocRef = doc(db, 'users', user.uid);
    let existingData: any = null;
    try {
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        existingData = snap.data();
      }
    } catch (readErr) {
      console.warn('Could not read existing user doc before sync:', readErr);
    }

    const email = user.email || '';
    const isAdminEmail = email.toLowerCase() === 'derana.apps@gmail.com' || email.toLowerCase().includes('admin');

    // Role resolution rules:
    // 1. derana.apps@gmail.com or admin emails -> always 'admin'
    // 2. Existing user on login -> preserve existingData.role
    // 3. New registration or no existing role -> use desiredRole (default 'surveyor')
    let finalRole: UserRole = 'tamu';
    if (isAdminEmail) {
      finalRole = 'admin';
    } else if (user.providerData.some((provider) => provider.providerId === 'google.com')) {
      finalRole = 'tamu';
    } else if (existingData?.role) {
      finalRole = (isRegistration && desiredRole) ? desiredRole : existingData.role;
    } else if (desiredRole) {
      finalRole = desiredRole;
    }

    const finalInstitution = institution 
      || existingData?.institution 
      || (isAdminEmail ? 'Badan Pengembangan dan Pembinaan Bahasa' : 'Balai Bahasa / Peneliti Mandiri');

    const finalRegion = assignedRegion 
      || existingData?.assignedRegion 
      || (isAdminEmail ? 'Nasional (Koordinator Utama)' : 'Wilayah Riset Lapangan');

    const now = new Date().toISOString();
    const createdAt = existingData?.createdAt || now;

    const profileData = {
      uid: user.uid,
      email,
      displayName: user.displayName || existingData?.displayName || email.split('@')[0] || 'Peneliti Bahasa',
      photoURL: user.photoURL || existingData?.photoURL || null,
      role: finalRole,
      institution: finalInstitution,
      assignedRegion: finalRegion,
      authProvider: 'google_oauth',
      createdAt,
      lastLoginAt: now,
      updatedAt: now
    };

    await setDoc(userDocRef, sanitizeForFirestore(profileData), { merge: true });
    return profileData;
  } catch (err) {
    console.warn('Could not sync user profile to Firestore:', err);
    return null;
  }
}

/**
 * Subscribe to Firebase Auth state changes
 */
export function subscribeToAuthUser(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Sign out
 */
export async function logoutFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Firebase Sign-Out Error:', error);
  }
}

/**
 * Save vitalitas survey response to Firestore
 */
export async function saveVitalitasToFirestore(vitalitas: any): Promise<void> {
  const path = `vitalitas/${vitalitas.id}`;
  try {
    await setDoc(doc(db, 'vitalitas', vitalitas.id), sanitizeForFirestore(vitalitas), { merge: true });
    console.log(`Saved vitalitas questionnaire ${vitalitas.id} to Firestore.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete vitalitas survey response from Firestore
 */
export async function deleteVitalitasFromFirestore(id: string): Promise<void> {
  const path = `vitalitas/${id}`;
  try {
    await deleteDoc(doc(db, 'vitalitas', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Save sastra lisan questionnaire record to Firestore
 */
export async function saveSastraLisanToFirestore(record: any): Promise<void> {
  const path = `sastra_lisan/${record.id}`;
  try {
    await setDoc(doc(db, 'sastra_lisan', record.id), sanitizeForFirestore(record), { merge: true });
    console.log(`Saved sastra lisan record ${record.id} to Firestore.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete sastra lisan questionnaire record from Firestore
 */
export async function deleteSastraLisanFromFirestore(id: string): Promise<void> {
  const path = `sastra_lisan/${id}`;
  try {
    await deleteDoc(doc(db, 'sastra_lisan', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Save revitalisasi monev record to Firestore
 */
export async function saveRevitalisasiMonevToFirestore(record: any): Promise<void> {
  const path = `revitalisasi_monev/${record.id}`;
  try {
    await setDoc(doc(db, 'revitalisasi_monev', record.id), sanitizeForFirestore(record), { merge: true });
    console.log(`Saved revitalisasi monev record ${record.id} to Firestore.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete revitalisasi monev record from Firestore
 */
export async function deleteRevitalisasiMonevFromFirestore(id: string): Promise<void> {
  const path = `revitalisasi_monev/${id}`;
  try {
    await deleteDoc(doc(db, 'revitalisasi_monev', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Save revitalisasi RAP record to Firestore
 */
export async function saveRevitalisasiRAPToFirestore(record: any): Promise<void> {
  const path = `revitalisasi_rap/${record.id}`;
  try {
    await setDoc(doc(db, 'revitalisasi_rap', record.id), sanitizeForFirestore(record), { merge: true });
    console.log(`Saved revitalisasi RAP record ${record.id} to Firestore.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete revitalisasi RAP record from Firestore
 */
export async function deleteRevitalisasiRAPFromFirestore(id: string): Promise<void> {
  const path = `revitalisasi_rap/${id}`;
  try {
    await deleteDoc(doc(db, 'revitalisasi_rap', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}


