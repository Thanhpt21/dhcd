// src/hooks/option/useOptionStatistics.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useOptionStatistics = (resolutionId: number) => {
  return useQuery({
    queryKey: ['optionStatistics', resolutionId],
    queryFn: async () => {
      const res = await api.get(`/resolution-options/resolution/${resolutionId}/statistics`)
      return res.data.data 
    },
    enabled: !!resolutionId,
  })
}