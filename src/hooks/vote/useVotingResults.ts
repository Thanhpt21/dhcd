// src/hooks/vote/useVotingResults.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useVotingResults = (resolutionId: number) => {
  return useQuery({
    queryKey: ['votingResults', resolutionId],
    queryFn: async () => {
      const res = await api.get(`/votes/resolution/${resolutionId}/results`)
      return res.data.data 
    },
    enabled: !!resolutionId,
  })
}