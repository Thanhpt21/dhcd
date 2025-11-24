// src/hooks/verification/useRevokeVerificationLink.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useRevokeVerificationLink = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.put(`/verification-links/${id}/revoke`)
      return res.data.data
    },
  })
}