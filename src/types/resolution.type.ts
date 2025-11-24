// src/types/resolution.type.ts
export enum VotingMethod {
  YES_NO = 'YES_NO',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  RANKING = 'RANKING'
}

export enum ResolutionType {
  ELECTION = 'ELECTION',
  APPROVAL = 'APPROVAL',
  POLICY = 'POLICY',
  OTHER = 'OTHER'
}

export interface ResolutionOption {
  id: number;
  resolutionId: number;
  optionCode: string;
  optionText: string;
  optionValue: string;
  description?: string;
  displayOrder: number;
  voteCount: number;
  createdAt: string;
}

export interface ResolutionCandidate {
  id: number;
  resolutionId: number;
  candidateCode: string;
  candidateName: string;
  candidateInfo?: string;
  displayOrder: number;
  voteCount: number;
  isElected: boolean;
  createdAt: string;
}

export interface Resolution {
  id: number;
  meetingId: number;
  resolutionCode: string;
  resolutionNumber: number;
  title: string;
  content: string;
  resolutionType: string;
  votingMethod: VotingMethod;
  approvalThreshold: number;
  maxChoices: number;
  displayOrder: number;
  isActive: boolean;
  totalVotes: number;
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  createdAt: string;
  updatedAt: string;
  
  // Optional relations
  meeting?: {
    id: number;
    meetingCode: string;
    meetingName: string;
    meetingDate?: string;
  };
  options?: ResolutionOption[];
  candidates?: ResolutionCandidate[];
  voteCount?: number;
  votingResultCount?: number;
}

export interface CreateResolutionRequest {
  meetingId: number;
  resolutionCode: string;
  resolutionNumber: number;
  title: string;
  content: string;
  resolutionType: string;
  votingMethod?: VotingMethod;
  approvalThreshold?: number;
  maxChoices?: number;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateResolutionRequest extends Partial<CreateResolutionRequest> {
  id: number;
}