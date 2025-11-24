// src/hooks/verification/useSendBatchVerificationEmails.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { SendBatchVerificationEmailsData, EmailResult } from '@/types/verification.type'

export const useSendBatchVerificationEmails = () => {
  return useMutation({
    mutationFn: async (data: SendBatchVerificationEmailsData) => {
      const res = await api.post('/verification-links/send-batch-emails', data)
      return res.data
    },
  })
}