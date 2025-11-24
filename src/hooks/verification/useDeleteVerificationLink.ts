// src/hooks/verification/useDeleteVerificationLink.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteVerificationLink = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/verification-links/${id}`)
      return res.data.data
    },
  })
}