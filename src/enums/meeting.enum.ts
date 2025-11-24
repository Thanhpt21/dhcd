// types/meeting.enum.ts
export enum MeetingStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum MeetingType {
  AGM = 'AGM',
  EGM = 'EGM',
  BOARD = 'BOARD',
  SHAREHOLDER = 'SHAREHOLDER',
  ANNUAL_GENERAL = 'ANNUAL_GENERAL'
}