// src/types/proxy.type.ts
export enum ProxyStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED'
}

export interface Proxy {
  id: number;
  meetingId: number;
  shareholderId: number;
  proxyPersonId: number;
  shares: number;
  startDate: string;
  endDate: string;
  status: ProxyStatus;
  reason?: string;
  documentUrl?: string | null; 
  approvedBy?: number;
  approvedAt?: string;
  rejectedReason?: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  meeting?: any;
  shareholder?: any;
  proxyPerson?: any;
  approvedByUser?: any;
}

export interface CreateProxyData {
  meetingId: number;
  shareholderId: number;
  proxyPersonId: number;
  shares: number;
  startDate: string;
  endDate: string;
  status?: ProxyStatus;
  reason?: string;
  documentUrl?: string | null; 
  approvedBy?: number;
  createdBy?: number;
}

export interface UpdateProxyData {
  shares?: number;
  startDate?: string;
  endDate?: string;
  status?: ProxyStatus;
  reason?: string;
  documentUrl?: string | null; 
}