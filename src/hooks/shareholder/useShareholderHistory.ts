// src/hooks/shareholder/useShareholderHistory.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseShareholderHistoryOptions {
  enabled?: boolean
}

export const useShareholderHistory = (
  id: number | string, 
  options?: UseShareholderHistoryOptions
) => {
  return useQuery({
    queryKey: ['shareholderHistory', id],
    queryFn: async () => {
      const res = await api.get(`/shareholders/${id}/shares-history`)
      return res.data.data.histories // ← Chỉ lấy histories array
    },
    enabled: !!id && (options?.enabled !== false),
    ...options,
  })
}