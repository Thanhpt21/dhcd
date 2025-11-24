// src/hooks/verification/useEmailStatistics.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { EmailStatistics } from '@/types/verification.type'

export const useEmailStatistics = (meetingId: number) => {
  return useQuery({
    queryKey: ['emailStatistics', meetingId],
    queryFn: async () => {
      const res = await api.get(`/verification-links/email-statistics/${meetingId}`)
      return res.data.data as EmailStatistics
    },
    enabled: !!meetingId,
  })
}