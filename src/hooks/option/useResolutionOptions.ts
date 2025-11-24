// src/hooks/option/useResolutionOptions.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useResolutionOptions = (resolutionId: number) => {
  return useQuery({
    queryKey: ['resolutionOptionsByResolution', resolutionId],
    queryFn: async () => {
      const res = await api.get(`/resolution-options/resolution/${resolutionId}`)
      return res.data.data 
    },
    enabled: !!resolutionId,
  })
}