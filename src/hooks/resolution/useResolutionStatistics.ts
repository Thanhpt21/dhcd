// src/hooks/resolution/useResolutionStatistics.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useResolutionStatistics = (meetingId: number) => {
  return useQuery({
    queryKey: ['resolutionStatistics', meetingId],
    queryFn: async () => {
      const res = await api.get(`/resolutions/meeting/${meetingId}/statistics`)
      return res.data.data 
    },
    enabled: !!meetingId,
  })
}