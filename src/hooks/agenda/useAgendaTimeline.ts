// src/hooks/agenda/useAgendaTimeline.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useAgendaTimeline = (meetingId: number) => {
  return useQuery({
    queryKey: ['agendaTimeline', meetingId],
    queryFn: async () => {
      const res = await api.get(`/agendas/meeting/${meetingId}/timeline`)
      return res.data.data 
    },
    enabled: !!meetingId,
  })
}