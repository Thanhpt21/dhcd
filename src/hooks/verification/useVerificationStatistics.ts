// src/hooks/verification/useVerificationStatistics.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useVerificationStatistics = (meetingId: number) => {
  return useQuery({
    queryKey: ['verificationStatistics', meetingId],
    queryFn: async () => {
      const res = await api.get(`/verification-links/meeting/${meetingId}/statistics`)
      return res.data.data
    },
    enabled: !!meetingId,
  })
}