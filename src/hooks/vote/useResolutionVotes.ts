// src/hooks/vote/useResolutionVotes.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useResolutionVotes = (resolutionId: number) => {
  return useQuery({
    queryKey: ['resolutionVotes', resolutionId],
    queryFn: async () => {
      const res = await api.get(`/votes/resolution/${resolutionId}`)
      return res.data.data 
    },
    enabled: !!resolutionId,
  })
}