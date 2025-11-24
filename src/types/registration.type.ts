import { Meeting } from "./meeting.type";
import { Shareholder } from "./shareholder.type";

// src/types/registration.type.ts
export enum RegistrationType {
  IN_PERSON = 'IN_PERSON',
  ONLINE = 'ONLINE',
  PROXY = 'PROXY',
  ABSENT = 'ABSENT'
}

export enum RegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export enum CheckinMethod {
  QR_CODE = 'QR_CODE',
  MANUAL = 'MANUAL',
  FACE_RECOGNITION = 'FACE_RECOGNITION'
}

export interface Registration {
  id: number;
  meetingId: number;
  shareholderId: number;
  registrationCode: string;
  registrationType: RegistrationType | string;
  registrationDate: string;
  status: RegistrationStatus | string;
  sharesRegistered: number;
  checkinTime?: string;
  checkinMethod?: CheckinMethod | string;
  proxyName?: string;
  proxyIdNumber?: string;
  proxyRelationship?: string;
  proxyDocumentUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;

  meeting: {
    id: number
    meetingCode: string
    meetingName: string
  }
  shareholder:{
    id: number
    email: string
    shareholderCode: string;
    fullName: string;
    idNumber: string;
    totalShares: number;
    isActive: boolean
  }
}



export interface CreateRegistrationData {
  meetingId: number;
  shareholderId: number;
  registrationCode: string;
  registrationType?: RegistrationType | string;
  registrationDate?: string;
  status?: RegistrationStatus | string;
  sharesRegistered: number;
  checkinTime?: string;
  checkinMethod?: CheckinMethod | string;
  proxyName?: string;
  proxyIdNumber?: string;
  proxyRelationship?: string;
  proxyDocumentUrl?: string;
  notes?: string;
}

export interface UpdateRegistrationData {
  meetingId?: number;
  shareholderId?: number;
  registrationCode?: string;
  registrationType?: RegistrationType | string;
  registrationDate?: string;
  status?: RegistrationStatus | string;
  sharesRegistered?: number;
  checkinTime?: string;
  checkinMethod?: CheckinMethod | string;
  proxyName?: string;
  proxyIdNumber?: string;
  proxyRelationship?: string;
  proxyDocumentUrl?: string;
  notes?: string;
}