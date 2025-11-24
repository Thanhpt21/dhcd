// src/hooks/shareholder/useShareholderStatistics.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useShareholderStatistics = (id: number | string) => {
  return useQuery({
    queryKey: ['shareholderStatistics', id],
    queryFn: async () => {
      const res = await api.get(`/shareholders/${id}/statistics`)
      return res.data.data
    },
    enabled: !!id,
  })
}