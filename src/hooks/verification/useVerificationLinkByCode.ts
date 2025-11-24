// src/hooks/verification/useVerificationLinkByCode.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { ServiceResponse, VerificationLink } from '@/types/verification.type'

export const useVerificationLinkByCode = (verificationCode: string) => {
  return useQuery({
    queryKey: ['verificationLinkByCode', verificationCode],
    queryFn: async (): Promise<ServiceResponse<VerificationLink>> => {
      const res = await api.get(`/verification-links/code/${verificationCode}`)
      return res.data
    },
    enabled: !!verificationCode,
  })
}