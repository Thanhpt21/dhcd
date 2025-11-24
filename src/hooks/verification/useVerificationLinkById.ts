// src/hooks/verification/useVerificationLinkById.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useVerificationLinkById = (id: number) => {
  return useQuery({
    queryKey: ['verificationLink', id],
    queryFn: async () => {
      const res = await api.get(`/verification-links/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}