// src/hooks/proxy/useProxiesByMeeting.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useProxiesByMeeting = (meetingId: number | string) => {
  return useQuery({
    queryKey: ['proxiesByMeeting', meetingId],
    queryFn: async () => {
      const res = await api.get(`/proxies/meeting/${meetingId}`)
      return res.data.data
    },
    enabled: !!meetingId,
  })
}