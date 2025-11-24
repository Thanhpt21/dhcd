export enum ReportType {
  MEETING_SUMMARY = 'MEETING_SUMMARY',
  ATTENDANCE_REPORT = 'ATTENDANCE_REPORT',
  VOTING_RESULTS = 'VOTING_RESULTS',
  REGISTRATION_STATS = 'REGISTRATION_STATS',
  QUESTION_ANALYTICS = 'QUESTION_ANALYTICS',
  SHAREHOLDER_ANALYSIS = 'SHAREHOLDER_ANALYSIS',
  FINAL_SUMMARY = 'FINAL_SUMMARY'
}

export enum ReportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
  HTML = 'HTML'
}

export interface ReportTemplate {
  id: number;
  templateName: string;
  templateType: string;
  templateFile?: string;
  outputFormat: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedReport {
  id: number;
  meetingId: number;
  templateId: number;
  reportName: string;
  reportUrl: string;
  reportFormat: string;
  generatedBy: number;
  createdAt: string;

  meeting?: {
    id: number;
    meetingCode: string;
    meetingName: string;
  };

  template?: {
    id: number;
    templateName: string;
    templateType: string;
  };

  generatedByUser?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateReportTemplateData {
  templateName: string;
  templateType: string;
  templateFile?: string;
  outputFormat: string;
  isActive?: boolean;
}

export interface UpdateReportTemplateData {
  templateName?: string;
  templateType?: string;
  templateFile?: string;
  outputFormat?: string;
  isActive?: boolean;
}

export interface GenerateReportData {
  reportName: string;
  meetingId: number;
  templateId: number;
  reportFormat: string;
  filters?: Record<string, any>;
}

export interface ReportListResponse {
  data: GeneratedReport[];
  total: number;
  page: number;
  pageCount: number;
}

export interface TemplateListResponse {
  data: ReportTemplate[];
  total: number;
  page: number;
  pageCount: number;
}

// Response types for quick reports
export interface MeetingSummaryReport {
  meeting: {
    id: number;
    meetingCode: string;
    meetingName: string;
    meetingDate: string;
  };
  statistics: {
    totalRegistrations: number;
    totalAttendances: number;
    attendanceRate: string;
    totalQuestions: number;
    totalFeedbacks: number;
    totalResolutions: number;
  };
  resolutionStats: Array<{
    id: number;
    title: string;
    totalVotes: number;
    yesVotes: number;
    noVotes: number;
    approvalRate: string;
  }>;
  generatedAt: string;
}

export interface AttendanceReport {
  meeting: {
    id: number;
    meetingCode: string;
    meetingName: string;
  };
  attendanceData: Array<{
    shareholderCode: string;
    fullName: string;
    shares: number;
    registered: boolean;
    attended: boolean;
    checkinTime?: string;
    checkinMethod?: string;
  }>;
  summary: {
    totalRegistered: number;
    totalAttended: number;
    attendanceRate: string;
  };
}

export interface VotingReport {
  meeting: {
    id: number;
    meetingCode: string;
    meetingName: string;
  };
  votingResults: Array<{
    resolutionCode: string;
    title: string;
    totalVotes: number;
    yesVotes: number;
    noVotes: number;
    abstainVotes: number;
    approvalRate: string;
    candidateResults: Array<{
      candidateCode: string;
      candidateName: string;
      voteCount: number;
      votePercentage: string;
    }>;
  }>;
  generatedAt: string;
}

export interface RegistrationReport {
  meeting: {
    id: number;
    meetingCode: string;
    meetingName: string;
  };
  registrationData: Array<{
    shareholderCode: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    shares: number;
    registrationType: string;
    status: string;
    registrationDate: string;
  }>;
  summary: {
    totalRegistrations: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  };
}