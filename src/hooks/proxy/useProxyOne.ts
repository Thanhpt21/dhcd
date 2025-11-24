// src/hooks/proxy/useProxyOne.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useProxyOne = (id: number | string) => {
  return useQuery({
    queryKey: ['proxy', id],
    queryFn: async () => {
      const res = await api.get(`/proxies/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}