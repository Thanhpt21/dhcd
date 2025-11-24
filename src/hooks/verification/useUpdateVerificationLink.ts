// src/hooks/verification/useUpdateVerificationLink.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { CreateVerificationLinkData } from '@/types/verification.type'

export const useUpdateVerificationLink = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CreateVerificationLinkData }) => {
      const res = await api.put(`/verification-links/${id}`, data)
      return res.data.data
    },
  })
}