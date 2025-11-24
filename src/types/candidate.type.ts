// src/types/candidate.type.ts
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
  
  resolution?: {
    id: number;
    resolutionCode: string;
    title: string;
    votingMethod?: string;
    maxChoices?: number;
  };
  votingResultCount?: number;
}

export interface CreateCandidateRequest {
  resolutionId: number;
  candidateCode: string;
  candidateName: string;
  candidateInfo?: string;
  displayOrder?: number;
  isElected?: boolean;
}

export interface UpdateCandidateRequest extends Partial<CreateCandidateRequest> {
  id: number;
}