// src/hooks/resolution/useResolutionDetail.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useResolutionDetail = (id: number) => {
  return useQuery({
    queryKey: ['resolution', id],
    queryFn: async () => {
      const res = await api.get(`/resolutions/${id}`)
      return res.data.data 
    },
    enabled: !!id,
  })
}