// src/hooks/shareholder/useShareholderOne.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useShareholderOne = (id: number | string) => {
  return useQuery({
    queryKey: ['shareholder', id],
    queryFn: async () => {
      const res = await api.get(`/shareholders/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}