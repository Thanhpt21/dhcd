// src/hooks/shareholder/useAllShareholders.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useAllShareholders = (search?: string, isActive?: string) => {
  return useQuery({
    queryKey: ['allShareholders', search, isActive],
    queryFn: async () => {
      const res = await api.get('/shareholders/all/list', {
        params: { search, isActive },
      })
      return res.data.data
    },
  })
}