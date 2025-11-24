// src/hooks/vote/useVotingStatistics.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useVotingStatistics = (meetingId: number) => {
  return useQuery({
    queryKey: ['votingStatistics', meetingId],
    queryFn: async () => {
      const res = await api.get(`/votes/meeting/${meetingId}/statistics`)
      return res.data.data 
    },
    enabled: !!meetingId,
  })
}