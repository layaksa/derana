import { ResearchAssignment, CreateAssignmentInput } from '../types/assignment';
import { AppUser } from '../types/auth';
import { loadAllUsers, persistUsers } from './authStorage';
import { addInAppNotification } from './notificationStorage';
import { logSurveyActivity } from './activityLogStorage';

export const STORAGE_KEY_ASSIGNMENTS = 'linguistic_research_assignments_v1';
export const ASSIGNMENT_EVENT_NAME = 'linguistic_assignment_event';

const SEED_ASSIGNMENTS: ResearchAssignment[] = [
  {
    id: 'asgn_seed_001',
    surveyorId: 'user_surveyor_budi',
    surveyorName: 'Budi Santoso, S.S.',
    surveyorEmail: 'budi@pemetaan.id',
    targetProvince: 'Jawa Barat',
    targetRegency: 'Kabupaten Cianjur',
    targetDistrict: 'Kecamatan Cidaun',
    targetVillage: 'Desa Karangwangi',
    targetLanguage: 'Bahasa Sunda',
    deadline: '2026-11-20',
    priority: 'tinggi',
    notes: 'Prioritaskan kelengkapan transkripsi fonetis leksikon maritim dan wawancara dengan narasumber usia >50 tahun.',
    assignedBy: 'user_admin_derana',
    assignedByName: 'Derana Admin (Koordinator Riset)',
    assignedByRole: 'admin',
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    status: 'in_progress'
  },
  {
    id: 'asgn_seed_002',
    surveyorId: 'user_surveyor_siti',
    surveyorName: 'Siti Aminah, M.Pd.',
    surveyorEmail: 'siti@pemetaan.id',
    targetProvince: 'Jawa Tengah',
    targetRegency: 'Kabupaten Brebes',
    targetDistrict: 'Kecamatan Salem & Bantarkawung',
    targetVillage: 'Salem (Perbatasan Enklave Sunda)',
    targetLanguage: 'Bahasa Sunda & Jawa Brebes',
    deadline: '2026-11-15',
    priority: 'tinggi',
    notes: 'Fokus pemetaan garis isoglos transisi leksikal Sunda-Jawa pada batas daerah aliran sungai.',
    assignedBy: 'user_admin_derana',
    assignedByName: 'Derana Admin (Koordinator Riset)',
    assignedByRole: 'admin',
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    status: 'active'
  },
  {
    id: 'asgn_seed_003',
    surveyorId: 'user_surveyor_fadhillah',
    surveyorName: 'Fadhillah Pandu Pradana, S.S.',
    surveyorEmail: 'fadhillah@gmail.com',
    targetProvince: 'Maluku',
    targetRegency: 'Kabupaten Maluku Tengah',
    targetDistrict: 'Pulau Saparua',
    targetVillage: 'Desa Ihamahu',
    targetLanguage: 'Bahasa Saparua (Ambon)',
    deadline: '2026-12-05',
    priority: 'sedang',
    notes: 'Dokumentasikan kosakata budaya sistem sasi adat dan variasi fonologis dengan dialek Nolloth.',
    assignedBy: 'user_admin_derana',
    assignedByName: 'Derana Admin (Koordinator Riset)',
    assignedByRole: 'admin',
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    status: 'active'
  }
];

export function dispatchAssignmentEvent(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ASSIGNMENT_EVENT_NAME));
  }
}

/**
 * Load all research assignments
 */
export function loadResearchAssignments(): ResearchAssignment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ASSIGNMENTS);
    if (raw) {
      return JSON.parse(raw);
    }
    localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(SEED_ASSIGNMENTS));
    return [...SEED_ASSIGNMENTS];
  } catch (err) {
    console.warn('Failed to load research assignments:', err);
    return SEED_ASSIGNMENTS;
  }
}

/**
 * Persist research assignments
 */
export function persistResearchAssignments(assignments: ResearchAssignment[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(assignments));
    dispatchAssignmentEvent();
  } catch (err) {
    console.error('Failed to persist research assignments:', err);
  }
}

/**
 * Create a new research assignment by Admin
 */
export function createResearchAssignment(
  input: CreateAssignmentInput,
  adminUser: AppUser
): ResearchAssignment {
  const assignments = loadResearchAssignments();

  const newAssignment: ResearchAssignment = {
    ...input,
    id: `asgn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    assignedBy: adminUser.id,
    assignedByName: adminUser.name,
    assignedByRole: adminUser.role,
    assignedAt: new Date().toISOString(),
    status: 'active'
  };

  const updated = [newAssignment, ...assignments];
  persistResearchAssignments(updated);

  // 1. Update surveyor's assignedRegion in user profile
  try {
    const allUsers = loadAllUsers();
    const targetIdx = allUsers.findIndex(u => u.id === input.surveyorId || u.email === input.surveyorEmail);
    if (targetIdx >= 0) {
      const regionText = `${input.targetVillage ? input.targetVillage + ', ' : ''}Kec. ${input.targetDistrict}, ${input.targetRegency} (${input.targetProvince})`;
      allUsers[targetIdx].assignedRegion = regionText;
      persistUsers(allUsers);
    }
  } catch (e) {
    console.warn('Could not update user assignedRegion:', e);
  }

  // 2. Dispatch dedicated in-app notification to surveyor
  addInAppNotification({
    type: 'region_assignment',
    title: `Penugasan Riset Baru: ${input.targetDistrict}, ${input.targetRegency}`,
    message: `${adminUser.name} menetapkan penugasan wilayah riset baru untuk Anda: ${input.targetVillage ? input.targetVillage + ', ' : ''}Kec. ${input.targetDistrict}, ${input.targetRegency} (${input.targetLanguage}). Batas waktu: ${new Date(input.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.`,
    authorId: adminUser.id,
    authorName: adminUser.name,
    authorRole: adminUser.role,
    targetUserId: input.surveyorId,
    metadata: {
      region: `${input.targetDistrict}, ${input.targetRegency}`,
      language: input.targetLanguage,
      deadline: input.deadline,
      priority: input.priority
    }
  });

  // 3. Log to audit trail
  logSurveyActivity({
    surveyId: newAssignment.id,
    surveyTitle: `Penugasan Wilayah: ${input.targetRegency} - ${input.targetLanguage}`,
    languageName: input.targetLanguage,
    village: input.targetVillage || input.targetDistrict,
    regency: input.targetRegency,
    action: 'update_metadata',
    actionLabel: 'Penugasan Wilayah Riset',
    sectionId: 'penugasan_riset',
    sectionName: 'Manajemen Wilayah Riset Surveyor',
    user: {
      id: adminUser.id,
      name: adminUser.name,
      role: adminUser.role,
      email: adminUser.email
    },
    details: `Admin menetapkan penugasan riset kepada ${input.surveyorName} untuk wilayah ${input.targetDistrict}, ${input.targetRegency} (${input.targetLanguage}). Prioritas: ${input.priority.toUpperCase()}, Deadline: ${input.deadline}.`,
    source: 'web'
  });

  return newAssignment;
}

/**
 * Update assignment status
 */
export function updateAssignmentStatus(
  id: string,
  status: ResearchAssignment['status'],
  completedSurveyId?: string
): void {
  const assignments = loadResearchAssignments();
  const updated = assignments.map(a => {
    if (a.id === id) {
      return {
        ...a,
        status,
        completedSurveyId: completedSurveyId || a.completedSurveyId
      };
    }
    return a;
  });
  persistResearchAssignments(updated);
}

/**
 * Delete assignment
 */
export function deleteAssignment(id: string): void {
  const assignments = loadResearchAssignments();
  const updated = assignments.filter(a => a.id !== id);
  persistResearchAssignments(updated);
}
