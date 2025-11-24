// src/hooks/verification/useSendVerificationEmail.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { SendVerificationEmailData, EmailResult } from '@/types/verification.type'

export const useSendVerificationEmail = () => {
  return useMutation({
    mutationFn: async (data: SendVerificationEmailData) => {
      const res = await api.post(`/verification-links/${data.verificationLinkId}/send-email`)
      return res.data
    },
  })
}