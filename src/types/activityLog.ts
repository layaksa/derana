import { UserRole } from './auth';

export type ActivityActionType =
  | 'create_survey'
  | 'update_section'
  | 'update_metadata'
  | 'verify_survey'
  | 'unverify_survey'
  | 'delete_survey'
  | 'duplicate_survey'
  | 'import_survey';

export interface SurveyActivityLog {
  id: string;
  timestamp: string; // ISO 8601
  surveyId: string;
  surveyTitle: string;
  languageName?: string;
  village?: string;
  regency?: string;
  action: ActivityActionType;
  actionLabel: string;
  sectionId?: string;
  sectionName?: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userEmail: string;
  details: string;
  diffSummary?: {
    field?: string;
    itemsChanged?: number;
    completionDelta?: number;
    notes?: string;
  };
  source?: 'web' | 'pwa_offline' | 'cloud_sync';
}

export interface ActivityFilterOptions {
  searchQuery: string;
  actionType: string;
  surveyorId: string;
  dateRange: 'all' | 'today' | 'week' | 'month';
}
