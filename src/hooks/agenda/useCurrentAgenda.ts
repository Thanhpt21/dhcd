// src/hooks/agenda/useCurrentAgenda.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useCurrentAgenda = (meetingId: number) => {
  return useQuery({
    queryKey: ['currentAgenda', meetingId],
    queryFn: async () => {
      const res = await api.get(`/agendas/meeting/${meetingId}/current`)
      return res.data.data 
    },
    enabled: !!meetingId,
  })
}