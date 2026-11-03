export type NotificationType = 
  | 'survey_validated' 
  | 'admin_comment' 
  | 'region_assignment' 
  | 'deadline_warning' 
  | 'system_alert';

export interface InAppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  surveyId?: string;
  surveyTitle?: string;
  authorId?: string;
  authorName?: string;
  authorRole?: string;
  targetUserId?: string; // specific user ID or 'all'
  metadata?: {
    region?: string;
    language?: string;
    deadline?: string;
    commentId?: string;
    commentText?: string;
    sectionName?: string;
    verificationStatus?: boolean;
    priority?: 'tinggi' | 'sedang' | 'rutin';
  };
}
