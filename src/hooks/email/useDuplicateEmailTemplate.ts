// src/hooks/email/useDuplicateEmailTemplate.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDuplicateEmailTemplate = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.post(`/email-templates/${id}/duplicate`)
      return res.data.data
    },
  })
}