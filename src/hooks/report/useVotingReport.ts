import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { VotingReport } from '@/types/report.type'

export const useVotingReport = (meetingId: number) => {
  return useQuery({
    queryKey: ['voting-report', meetingId],
    queryFn: async (): Promise<VotingReport> => {
      const res = await api.get(`/reports/meeting/${meetingId}/voting`)
      return res.data.data
    },
    enabled: !!meetingId,
  })
}