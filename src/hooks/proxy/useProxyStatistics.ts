// src/hooks/proxy/useProxyStatistics.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useProxyStatistics = (meetingId: number | string) => {
  return useQuery({
    queryKey: ['proxyStatistics', meetingId],
    queryFn: async () => {
      const res = await api.get(`/proxies/meeting/${meetingId}/statistics`)
      return res.data.data
    },
    enabled: !!meetingId,
  })
}