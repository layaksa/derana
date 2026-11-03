import { SurveyAdminComment, CreateSurveyCommentInput } from '../types/comment';
import { AppUser } from '../types/auth';
import { SurveyRecord } from '../types/linguistic';
import { addInAppNotification } from './notificationStorage';
import { logSurveyActivity } from './activityLogStorage';

export const STORAGE_KEY_SURVEY_COMMENTS = 'linguistic_survey_admin_comments_v1';
export const COMMENT_EVENT_NAME = 'linguistic_survey_comment_event';

const SEED_COMMENTS: SurveyAdminComment[] = [
  {
    id: 'comm_seed_001',
    surveyId: 'survey_sample_cikadu',
    surveyTitle: 'Desa Cikadu - Bahasa Sunda (Cianjur Selatan)',
    authorId: 'user_verifikator_dewi',
    authorName: 'Dr. Dewi Sartika, M.Hum.',
    authorRole: 'verifikator',
    authorEmail: 'dewi.verifikator@gmail.com',
    comment: 'Harap periksa kembali rekaman audio Swadesh #15-20 informan Bapak Dadang karena terdapat noise angin latar yang mengaburkan bunyi geser velar [x].',
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    sectionId: 'section-15',
    sectionName: 'Seksi 15 - Daftar Kosakata Swadesh',
    status: 'open'
  },
  {
    id: 'comm_seed_002',
    surveyId: 'survey_sample_karangwangi',
    surveyTitle: 'Desa Karangwangi - Bahasa Sunda (Cidaun)',
    authorId: 'user_admin_derana',
    authorName: 'Derana Admin (Koordinator Riset)',
    authorRole: 'admin',
    authorEmail: 'derana.apps@gmail.com',
    comment: 'Leksikon budaya kelautan dan penangkapan ikan sangat lengkap dan transkripsi IPA akurat. Berkas ini siap diajukan untuk kompilasi dialektometri nasional.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    sectionId: 'section-15',
    sectionName: 'Seksi 15 - Kosakata Budaya & Swadesh',
    status: 'resolved'
  }
];

export function dispatchCommentEvent(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(COMMENT_EVENT_NAME));
  }
}

/**
 * Load survey comments
 */
export function loadSurveyComments(surveyId?: string): SurveyAdminComment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SURVEY_COMMENTS);
    let list: SurveyAdminComment[] = [];
    if (raw) {
      list = JSON.parse(raw);
    } else {
      list = [...SEED_COMMENTS];
      localStorage.setItem(STORAGE_KEY_SURVEY_COMMENTS, JSON.stringify(list));
    }

    if (surveyId) {
      return list.filter(c => c.surveyId === surveyId);
    }
    return list;
  } catch (err) {
    console.warn('Failed to load survey comments:', err);
    return SEED_COMMENTS;
  }
}

/**
 * Add an admin comment to a survey and notify the surveyor
 */
export function addSurveyComment(
  input: CreateSurveyCommentInput,
  author: AppUser,
  survey?: SurveyRecord | null
): SurveyAdminComment {
  const existing = loadSurveyComments();

  const newComment: SurveyAdminComment = {
    id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    surveyId: input.surveyId,
    surveyTitle: input.surveyTitle,
    authorId: author.id,
    authorName: author.name,
    authorRole: (author.role === 'admin' ? 'admin' : 'verifikator'),
    authorEmail: author.email,
    comment: input.comment,
    createdAt: new Date().toISOString(),
    sectionId: input.sectionId,
    sectionName: input.sectionName,
    status: 'open'
  };

  const updated = [newComment, ...existing];
  try {
    localStorage.setItem(STORAGE_KEY_SURVEY_COMMENTS, JSON.stringify(updated));
    dispatchCommentEvent();
  } catch (e) {
    console.error('Failed to persist comment:', e);
  }

  // Target surveyor to notify
  const targetUserId = survey?.createdBy || 'all';

  // Dispatch in-app notification
  addInAppNotification({
    type: 'admin_comment',
    title: `Komentar Baru dari ${author.role === 'admin' ? 'Admin' : 'Verifikator'}`,
    message: `${author.name} memberikan catatan pada berkas survei "${input.surveyTitle}": "${input.comment.length > 90 ? input.comment.substring(0, 87) + '...' : input.comment}"`,
    authorId: author.id,
    authorName: author.name,
    authorRole: author.role,
    surveyId: input.surveyId,
    surveyTitle: input.surveyTitle,
    targetUserId,
    metadata: {
      commentId: newComment.id,
      commentText: input.comment,
      sectionName: input.sectionName
    }
  });

  // Log to audit trail
  logSurveyActivity({
    surveyId: input.surveyId,
    surveyTitle: input.surveyTitle,
    languageName: survey?.bahasa || 'Bahasa Daerah',
    village: survey?.desa || 'Titik Survei',
    regency: survey?.kabupatenKota || '',
    action: 'verify_survey',
    actionLabel: 'Catatan Review Admin/Verifikator',
    sectionId: input.sectionId || 'evaluasi',
    sectionName: input.sectionName || 'Evaluasi Berkas Survei',
    user: {
      id: author.id,
      name: author.name,
      role: author.role,
      email: author.email
    },
    details: `${author.name} memberikan catatan review: "${input.comment}"`,
    source: 'web'
  });

  return newComment;
}

/**
 * Delete a comment
 */
export function deleteSurveyComment(id: string): void {
  try {
    const list = loadSurveyComments();
    const updated = list.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY_SURVEY_COMMENTS, JSON.stringify(updated));
    dispatchCommentEvent();
  } catch (e) {
    console.warn('Failed to delete comment:', e);
  }
}
