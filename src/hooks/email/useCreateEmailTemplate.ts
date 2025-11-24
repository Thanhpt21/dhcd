// src/hooks/email/useCreateEmailTemplate.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { CreateEmailTemplateData } from '@/types/email.type'

export const useCreateEmailTemplate = () => {
  return useMutation({
    mutationFn: async (data: CreateEmailTemplateData) => {
      const res = await api.post('/email-templates', data)
      return res.data.data
    },
  })
}