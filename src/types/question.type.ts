// src/types/question.type.ts
export enum QuestionType {
  GENERAL = 'GENERAL',
  FINANCIAL = 'FINANCIAL',
  OPERATIONAL = 'OPERATIONAL',
  STRATEGIC = 'STRATEGIC',
  OTHER = 'OTHER'
}

export enum QuestionPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum QuestionStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ANSWERED = 'ANSWERED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED'
}

export interface Question {
  id: number;
  meetingId: number;
  shareholderId: number;
  questionCode: string;
  questionText: string;
  questionType: QuestionType;
  priority: QuestionPriority;
  status: QuestionStatus;
  isSelected: boolean;
  adminNotes?: string;
  answerText?: string;
  answeredBy?: string;
  answeredAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  meeting?: {
    id: number;
    meetingCode: string;
    meetingName: string;
    meetingDate: string;
  };
  shareholder?: {
    id: number;
    shareholderCode: string;
    fullName: string;
    email: string;
    totalShares: number;
  };
  upvotes?: QuestionUpvote[];
  upvoteCount?: number;
  hasUpvoted?: boolean;
}

export interface QuestionUpvote {
  id: number;
  questionId: number;
  shareholderId: number;
  createdAt: string;
  shareholder?: {
    shareholderCode: string;
    fullName: string;
  };
}

export interface CreateQuestionRequest {
  meetingId: number;
  verificationCode: string; 
  questionCode: string;
  questionText: string;
  questionType?: QuestionType;
  priority?: QuestionPriority;
  isSelected?: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export interface UpdateQuestionRequest extends Partial<CreateQuestionRequest> {
  id: number;
  adminNotes?: string;
  answerText?: string;
  answeredBy?: string;
  status?: QuestionStatus;
}

export interface QuestionStatistics {
  totalQuestions: number;
  pendingQuestions: number;
  answeredQuestions: number;
  selectedQuestions: number;
  totalUpvotes: number;
  byQuestionType: Record<string, number>;
  byPriority: Record<string, number>;
  topQuestions: Array<{
    id: number;
    questionText: string;
    upvoteCount: number;
    status: QuestionStatus;
  }>;
}