// src/hooks/email/useUpdateEmailTemplate.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { UpdateEmailTemplateData } from '@/types/email.type'

export const useUpdateEmailTemplate = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateEmailTemplateData }) => {
      const res = await api.put(`/email-templates/${id}`, data)
      return res.data.data
    },
  })
}