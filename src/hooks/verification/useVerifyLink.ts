// src/hooks/verification/useVerifyLink.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { ServiceResponse, VerifyLinkResponse, VerifyLinkData } from '@/types/verification.type'

export const useVerifyLink = () => {
  return useMutation({
    mutationFn: async (data: VerifyLinkData): Promise<ServiceResponse<VerifyLinkResponse>> => {
      const res = await api.post('/verification-links/verify', data)
      return res.data
    },
  })
}