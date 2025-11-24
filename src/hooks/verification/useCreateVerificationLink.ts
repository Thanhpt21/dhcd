// src/hooks/verification/useCreateVerificationLink.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { CreateVerificationLinkData } from '@/types/verification.type'

export const useCreateVerificationLink = () => {
  return useMutation({
    mutationFn: async (data: CreateVerificationLinkData) => {
      const res = await api.post('/verification-links', data)
      return res.data.data
    },
  })
}