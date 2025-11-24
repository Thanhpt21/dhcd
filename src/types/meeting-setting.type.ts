// src/types/meeting-setting.type.ts
export enum DataType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN', 
  JSON = 'JSON',
  DATE = 'DATE'
}

export interface MeetingSetting {
  id: number;
  meetingId: number;
  key: string;
  value: string;
  dataType: DataType;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Relations (optional)
  meeting?: any;
}

export interface CreateMeetingSettingData {
  meetingId: number;
  key: string;
  value: string;
  dataType?: DataType;
  description?: string;
  isActive?: boolean;
}

export interface UpdateMeetingSettingData {
  key?: string;
  value?: string;
  dataType?: DataType;
  description?: string;
  isActive?: boolean;
}

export interface BatchCreateMeetingSettingData {
  settings: CreateMeetingSettingData[];
}