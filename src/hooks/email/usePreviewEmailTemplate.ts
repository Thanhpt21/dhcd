// src/hooks/email/usePreviewEmailTemplate.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { PreviewTemplateData } from '@/types/email.type'

export const usePreviewEmailTemplate = () => {
  return useMutation({
    mutationFn: async (data: PreviewTemplateData) => {
      const res = await api.post('/email-templates/preview', data)
      return res.data.data
    },
  })
}