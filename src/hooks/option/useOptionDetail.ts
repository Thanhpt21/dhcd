// src/hooks/option/useOptionDetail.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useOptionDetail = (id: number) => {
  return useQuery({
    queryKey: ['option', id],
    queryFn: async () => {
      const res = await api.get(`/resolution-options/${id}`)
      return res.data.data 
    },
    enabled: !!id,
  })
}