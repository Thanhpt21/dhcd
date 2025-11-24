// src/hooks/email/useToggleEmailTemplateActive.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useToggleEmailTemplateActive = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.put(`/email-templates/${id}/toggle-active`)
      return res.data.data
    },
  })
}