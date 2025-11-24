// src/types/vote.type.ts
export enum VoteValue {
  YES = 'YES',
  NO = 'NO',
  ABSTAIN = 'ABSTAIN'
}

export enum VotingMethod {
  YES_NO = 'YES_NO',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  RANKING = 'RANKING'
}

export interface Vote {
  id: number;
  resolutionId: number;
  shareholderId: number;
  meetingId: number;
  voteValue: string;
  sharesUsed: number;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  
  // Relations
  resolution?: {
    id: number;
    resolutionCode: string;
    title: string;
    votingMethod: VotingMethod;
  };
  shareholder?: {
    id: number;
    shareholderCode: string;
    fullName: string;
    totalShares: number;
  };
  meeting?: {
    id: number;
    meetingCode: string;
    meetingName: string;
  };
}

export interface VotingResult {
  id: number;
  resolutionId: number;
  candidateId?: number;
  shareholderId: number;
  voteType: string;
  sharesUsed: number;
  votingMethod: string;
  createdAt: string;
  
  candidate?: {
    id: number;
    candidateCode: string;
    candidateName: string;
  };
  shareholder?: {
    id: number;
    fullName: string;
  };
}

export interface CreateVoteRequest {
  resolutionId: number
  verificationCode: string
  meetingId: number
  voteValue?: string
  candidateCodes?: string[]
  ranking?: Record<string, number>
  ipAddress?: string
  userAgent?: string
}

export interface VotingStatistics {
  totalResolutions: number;
  totalVotes: number;
  totalShareholders: number;
  participationRate: number;
  resolutions: Array<{
    id: number;
    title: string;
    totalVotes: number;
    votingMethod: VotingMethod;
    approvalStatus: string;
  }>;
}

export interface VotingResultsSummary {
  resolution: any;
  summary: any;
  detailedResults: VotingResult[];
}