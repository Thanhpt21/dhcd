// src/hooks/agenda/useMeetingAgendas.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useMeetingAgendas = (meetingId: number) => {
  return useQuery({
    queryKey: ['meetingAgendas', meetingId],
    queryFn: async () => {
      const res = await api.get(`/agendas/meeting/${meetingId}`)
      return res.data.data 
    },
    enabled: !!meetingId,
    refetchInterval: 3000, // Refetch mỗi 3 giây
    refetchIntervalInBackground: true, // Refetch cả khi tab không active
  })
}