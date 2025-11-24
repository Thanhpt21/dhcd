// src/hooks/candidate/useCandidateStatistics.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useCandidateStatistics = (resolutionId: number) => {
  return useQuery({
    queryKey: ['candidateStatistics', resolutionId],
    queryFn: async () => {
      const res = await api.get(`/resolution-candidates/resolution/${resolutionId}/statistics`)
      return res.data.data 
    },
    enabled: !!resolutionId,
  })
}