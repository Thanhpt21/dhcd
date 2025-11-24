// src/hooks/verification/useSendVerificationSuccessEmail.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { SendVerificationSuccessEmailData, EmailResult } from '@/types/verification.type'

export const useSendVerificationSuccessEmail = () => {
  return useMutation({
    mutationFn: async (data: SendVerificationSuccessEmailData) => {
      const res = await api.post('/verification-links/send-verification-success', data)
      return res.data
    },
  })
}