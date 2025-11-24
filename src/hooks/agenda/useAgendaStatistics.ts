// src/hooks/agenda/useAgendaStatistics.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useAgendaStatistics = (meetingId: number) => {
  return useQuery({
    queryKey: ['agendaStatistics', meetingId],
    queryFn: async () => {
      const res = await api.get(`/agendas/meeting/${meetingId}/statistics`)
      return res.data.data 
    },
    enabled: !!meetingId,
  })
}