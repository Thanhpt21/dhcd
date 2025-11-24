// src/hooks/proxy/useProxiesByShareholder.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useProxiesByShareholder = (shareholderId: number | string) => {
  return useQuery({
    queryKey: ['proxiesByShareholder', shareholderId],
    queryFn: async () => {
      const res = await api.get(`/proxies/shareholder/${shareholderId}`)
      return res.data.data
    },
    enabled: !!shareholderId,
  })
}