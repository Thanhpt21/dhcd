// src/hooks/agenda/useDeleteAgenda.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteAgenda = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/agendas/${id}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendas'] })
      queryClient.invalidateQueries({ queryKey: ['meetingAgendas'] })
      queryClient.invalidateQueries({ queryKey: ['agendaTimeline'] })
    },
  })
}