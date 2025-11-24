// src/types/shareholder.type.ts
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum ShareType {
  COMMON = 'COMMON',
  PREFERRED = 'PREFERRED'
}

export interface Shareholder {
  id: number;
  shareholderCode: string;
  fullName: string;
  idNumber: string;
  idIssueDate?: string;
  idIssuePlace?: string;
  dateOfBirth?: string;
  gender?: Gender | string;
  nationality?: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  taxCode?: string;
  bankAccount?: string;
  bankName?: string;
  totalShares: number;
  shareType: ShareType | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations (optional)
  shareHistories?: ShareholderShareHistory[];
  registrations?: any[];
  feedbacks?: any[];
  questions?: any[];
}

export interface ShareholderShareHistory {
  id: number;
  shareholderId: number;
  changeDate: string;
  sharesBefore: number;
  sharesAfter: number;
  changeAmount: number;
  changeType: string;
  description?: string;
  createdAt: string;

  // Relations
  shareholder?: Shareholder;
}

export interface CreateShareholderData {
  shareholderCode: string;
  fullName: string;
  idNumber: string;
  idIssueDate?: string;
  idIssuePlace?: string;
  dateOfBirth?: string;
  gender?: Gender | string;
  nationality?: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  taxCode?: string;
  bankAccount?: string;
  bankName?: string;
  totalShares?: number;
  shareType?: ShareType | string;
  isActive?: boolean;
}

export interface UpdateShareholderData {
  shareholderCode?: string;
  fullName?: string;
  idNumber?: string;
  idIssueDate?: string;
  idIssuePlace?: string;
  dateOfBirth?: string;
  gender?: Gender | string;
  nationality?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  taxCode?: string;
  bankAccount?: string;
  bankName?: string;
  totalShares?: number;
  shareType?: ShareType | string;
  isActive?: boolean;
}