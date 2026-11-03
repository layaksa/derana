export interface SurveyAdminComment {
  id: string;
  surveyId: string;
  surveyTitle: string;
  authorId: string;
  authorName: string;
  authorRole: 'admin' | 'verifikator';
  authorEmail?: string;
  comment: string;
  createdAt: string;
  sectionId?: string;
  sectionName?: string;
  status?: 'open' | 'resolved';
}

export interface CreateSurveyCommentInput {
  surveyId: string;
  surveyTitle: string;
  comment: string;
  sectionId?: string;
  sectionName?: string;
}
