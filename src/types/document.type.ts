// src/types/document.type.ts
export enum DocumentCategory {
  FINANCIAL_REPORT = 'FINANCIAL_REPORT',
  RESOLUTION = 'RESOLUTION', 
  MINUTES = 'MINUTES',
  PRESENTATION = 'PRESENTATION',
  GUIDE = 'GUIDE',
  OTHER = 'OTHER'
}

export interface Document {
  id: number;
  meetingId: number;
  documentCode: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category: DocumentCategory;
  isPublic: boolean;
  displayOrder: number;
  uploadedBy: number;
  createdAt: string;
  updatedAt: string;
  
  // Optional relations
  meeting?: {
    id: number;
    meetingCode: string;
    meetingName: string;
  };
  uploadedByUser?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateDocumentRequest {
  meetingId: number;
  documentCode: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category?: DocumentCategory;
  isPublic?: boolean;
  displayOrder?: number;
  uploadedBy: number;
}

export interface CreateDocumentWithFileRequest {
  meetingId: number;
  documentCode: string;
  title: string;
  description?: string;
  category?: DocumentCategory;
  isPublic?: boolean;
  displayOrder?: number;
  uploadedBy: number;
}

export interface UpdateDocumentRequest extends Partial<CreateDocumentRequest> {
  id: number;
}

export interface DocumentStatistics {
  totalDocuments: number;
  publicDocuments: number;
  privateDocuments: number;
  totalFileSize: number;
  averageFileSize: string;
  byCategory: Record<string, number>;
  byFileType: Record<string, number>;
  largestDocument?: Document | null;
}