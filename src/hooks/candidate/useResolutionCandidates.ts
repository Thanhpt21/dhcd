// src/hooks/candidate/useResolutionCandidates.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useResolutionCandidates = (resolutionId: number) => {
  return useQuery({
    queryKey: ['resolutionCandidates', resolutionId],
    queryFn: async () => {
      const res = await api.get(`/resolution-candidates/resolution/${resolutionId}`)
      return res.data.data 
    },
    enabled: !!resolutionId,
  })
}