// src/hooks/verification/useGenerateBatchVerificationLinks.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { GenerateBatchData } from '@/types/verification.type'

export const useGenerateBatchVerificationLinks = () => {
  return useMutation({
    mutationFn: async (data: GenerateBatchData) => {
      const res = await api.post('/verification-links/generate/batch', data)
      return res.data.data
    },
  })
}