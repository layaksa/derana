export interface ResearchAssignment {
  id: string;
  surveyorId: string;
  surveyorName: string;
  surveyorEmail: string;
  targetProvince: string;
  targetRegency: string;
  targetDistrict: string;
  targetVillage: string;
  targetLanguage: string;
  deadline: string;
  priority: 'tinggi' | 'sedang' | 'rutin';
  notes?: string;
  assignedBy: string;
  assignedByName: string;
  assignedByRole: string;
  assignedAt: string;
  status: 'active' | 'in_progress' | 'completed' | 'cancelled';
  completedSurveyId?: string;
}

export interface CreateAssignmentInput {
  surveyorId: string;
  surveyorName: string;
  surveyorEmail: string;
  targetProvince: string;
  targetRegency: string;
  targetDistrict: string;
  targetVillage: string;
  targetLanguage: string;
  deadline: string;
  priority: 'tinggi' | 'sedang' | 'rutin';
  notes?: string;
}
