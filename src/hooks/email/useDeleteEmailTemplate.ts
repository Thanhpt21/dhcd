// src/hooks/email/useDeleteEmailTemplate.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteEmailTemplate = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/email-templates/${id}`)
      return res.data.data
    },
  })
}