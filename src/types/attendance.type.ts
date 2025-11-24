// src/types/attendance.type.ts
import { Meeting } from "./meeting.type";
import { Shareholder } from "./shareholder.type";

export enum CheckinMethod {
  QR_CODE = 'QR_CODE',
  MANUAL = 'MANUAL',
  FACE_RECOGNITION = 'FACE_RECOGNITION'
}

export interface Attendance {
  id: number;
  meetingId: number;
  shareholderId: number;
  checkinTime: string;
  checkoutTime?: string;
  checkinMethod: CheckinMethod | string;
  ipAddress?: string;
  userAgent?: string;
  notes?: string;
  createdAt: string;

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
}

// Thêm type mới cho auto checkout
export interface AttendanceWithStatus extends Attendance {
  status?: 'WARNING' | 'EXPIRED';
  timeRemaining?: number; // phút
  timeExceeded?: number; // phút
}


export interface AttendanceStatistics {
  totalAttendances: number;
  totalRegistrations: number;
  attendanceRate: string;
  qrCodeCheckins: number;
  manualCheckins: number;
  faceRecognitionCheckins: number;
  checkedOut: number;
  stillPresent: number;
  totalSharesPresent: number;
}

export interface CreateAttendanceData {
  meetingId: number;
  shareholderId: number;
  checkinTime?: string;
  checkinMethod?: CheckinMethod | string;
  ipAddress?: string;
  userAgent?: string;
  notes?: string;
}

export interface UpdateAttendanceData {
  checkoutTime?: string;
  checkinMethod?: CheckinMethod | string;
  ipAddress?: string;
  userAgent?: string;
  notes?: string;
}

export interface AttendanceListResponse {
  data: Attendance[];
  total: number;
  page: number;
  pageCount: number;
}

export interface AttendanceSuccessData {
  id: number
  meetingId: number
  meetingName: string
  meetingDate: string
  meetingLocation: string
  shareholderId: number
  shareholderName: string
  shareholderCode: string
  checkinTime: string
  checkinMethod: 'QR_CODE' | 'MANUAL' | 'AUTO'
  totalShares: number
}