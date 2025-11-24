// src/types/verification.type.ts

export interface VerificationLink {
  id: number
  meetingId: number
  shareholderId: number
  verificationCode: string
  verificationType: 'REGISTRATION' | 'ATTENDANCE'
  qrCodeUrl?: string
  verificationUrl?: string
  expiresAt: string
  isUsed: boolean
  usedAt?: string
  usedIp?: string
  usedDevice?: string
  emailSent: boolean
  emailSentAt?: string 
  createdAt: string
  meeting?: {
    id: number
    meetingCode: string
    meetingName: string
  }
  shareholder?: {
    id: number
    shareholderCode: string
    fullName: string
    email?: string
  }
  recentLogs?: VerificationLog[]
  logCount?: number
}

export interface VerificationLog {
  id: number
  verificationId: number
  action: string
  ipAddress?: string
  userAgent?: string
  success: boolean
  errorMessage?: string
  createdAt: string
}

export interface VerificationStatistics {
  totalLinks: number
  usedLinks: number
  activeLinks: number
  expiredLinks: number
  byVerificationType: Record<string, number>
  usageRate: string
  recentActivity: number
}

export interface CreateVerificationLinkData {
  meetingId: number
  shareholderId: number
  verificationCode: string
  verificationType?: 'REGISTRATION' | 'ATTENDANCE'
  qrCodeUrl?: string
  verificationUrl?: string
  expiresAt: string
  isUsed?: boolean
}

export interface GenerateBatchData {
  meetingId: number
  shareholderIds: number[]
  verificationType: 'REGISTRATION' | 'ATTENDANCE'
  expiresInHours: number
}

// ==================== VERIFY LINK TYPES ====================

export interface VerifyLinkData {
  verificationCode: string
  ipAddress?: string
  userAgent?: string
  email?: string
}

// Cho ATTENDANCE với meetingId trong URL (không cần verificationCode trong body)
export interface VerifyLinkWithMeetingData {
  ipAddress?: string
  userAgent?: string
  email?: string
}

// Response cho verify link thành công
export interface VerifyLinkResponse {
  verification: VerificationLink
  meeting: {
    id: number
    meetingName: string
    meetingDate: string
    meetingLocation: string
  }
  shareholder: {
    id: number
    fullName: string
    shareholderCode: string
    totalShares: number
  }
  redirectUrl: string
  attendance?: {
    id: number
    meetingName: string
    meetingDate: string
    meetingLocation: string
    shareholderName: string
    shareholderCode: string
    checkinTime: string
    checkinMethod: string
    totalShares: number
  }
  registration?: {
    id: number
    registrationCode: string
    status: string
    registrationType: string
    sharesRegistered: number
    registrationDate: string
  }
}

// Response cho get verification link với meetingId
export interface VerificationLinkWithMeetingResponse {
  verification: VerificationLink
  meeting: {
    id: number
    meetingCode: string
    meetingName: string
    meetingDate: string
    meetingLocation: string
  }
  shareholder: {
    id: number
    shareholderCode: string
    fullName: string
    email?: string
    totalShares: number
  }
  recentLogs?: VerificationLog[]
}

// ==================== EMAIL TYPES ====================

export interface SendVerificationEmailData {
  verificationLinkId: number;
}

export interface SendBatchVerificationEmailsData {
  meetingId: number;
  shareholderIds: number[];
  verificationType: 'REGISTRATION' | 'ATTENDANCE';
}

export interface ResendVerificationEmailData {
  verificationLinkId: number;
}

export interface SendVerificationSuccessEmailData {
  verificationCode: string;
}

export interface EmailStatistics {
  totalSent: number;
  successful: number;
  failed: number;
  byTemplate: Record<string, number>;
  successRate: string;
  recentActivity: number;
}

export interface EmailResult {
  success: boolean;
  message: string;
  data?: {
    messageId?: string;
    to?: string;
    subject?: string;
    total?: number;
    success?: number;
    failures?: number;
    errors?: string[];
    details?: Array<{
      shareholderId: number;
      email: string;
      success: boolean;
      messageId?: string;
      error?: string;
    }>;
  };
}

// ==================== SERVICE RESPONSE TYPES ====================

export interface ServiceResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  pageCount: number;
}

// ==================== QR CODE & BATCH TYPES ====================

export interface QRCodeResponse {
  qrCodeUrl: string;
  verificationCode: string;
  verificationType: string;
  expiresAt: string;
}

export interface BatchGenerationResult {
  total: number;
  success: number;
  errors: string[];
  links: VerificationLink[];
}

// ==================== HOOK PARAMETER TYPES ====================

export interface UseVerificationLinkByCodeParams {
  verificationCode: string
}

export interface UseVerificationLinkByCodeWithMeetingParams {
  verificationCode: string
  meetingId: number
}

export interface UseVerifyLinkParams {
  data: VerifyLinkData
}

export interface UseVerifyLinkWithMeetingParams {
  verificationCode: string
  meetingId: number
  data: VerifyLinkWithMeetingData
}