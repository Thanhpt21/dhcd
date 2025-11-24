// src/hooks/verification/useResendVerificationEmail.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { ResendVerificationEmailData, EmailResult } from '@/types/verification.type'

export const useResendVerificationEmail = () => {
  return useMutation({
    mutationFn: async (data: ResendVerificationEmailData) => {
      const res = await api.post(`/verification-links/${data.verificationLinkId}/resend-email`)
      return res.data
    },
  })
}