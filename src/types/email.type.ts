// src/types/email.type.ts
export interface EmailTemplate {
  id: number
  name: string
  subject: string
  content: string
  variables?: Record<string, any>
  description?: string
  category: string
  isActive: boolean
  language: string
  createdAt: string
  updatedAt: string
}

export interface CreateEmailTemplateData {
  name: string
  subject: string
  content: string
  variables?: Record<string, any>
  description?: string
  category?: string
  isActive?: boolean
  language?: string
}

export interface UpdateEmailTemplateData extends Partial<CreateEmailTemplateData> {}

export interface TemplateCategory {
  category: string
  count: number
}

export interface PreviewTemplateData {
  templateId: number
  variables: Record<string, any>
}