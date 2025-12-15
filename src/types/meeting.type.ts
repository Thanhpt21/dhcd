export enum MeetingStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum MeetingType {
  AGM = 'AGM',
  BOARD = 'BOARD',
}

export interface Meeting {
  id: number;
  meetingCode: string;
  meetingName: string;
  meetingType: MeetingType | string;
  meetingDate: string;
  meetingLocation?: string;
  meetingAddress?: string;
  description?: string;
  status: MeetingStatus | string;
  registrationStart?: string;
  registrationEnd?: string;
  votingStart?: string;
  votingEnd?: string;
  totalShares: number;
  totalShareholders: number;
  participantCount: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

// Type cho create/update meeting (không có id và timestamps)
export interface CreateMeetingRequest {
  meetingName: string;
  meetingType: MeetingType | string;
  meetingDate: string;
  meetingLocation?: string;
  meetingAddress?: string;
  description?: string;
  registrationStart?: string;
  registrationEnd?: string;
  votingStart?: string;
  votingEnd?: string;
}

export interface UpdateMeetingRequest extends Partial<CreateMeetingRequest> {
  status?: MeetingStatus | string;
}