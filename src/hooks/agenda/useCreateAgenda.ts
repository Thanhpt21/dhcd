// src/hooks/agenda/useCreateAgenda.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { CreateAgendaRequest } from '@/types/agenda.type'

export const useCreateAgenda = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateAgendaRequest) => {
      const res = await api.post('/agendas', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendas'] })
      queryClient.invalidateQueries({ queryKey: ['meetingAgendas'] })
      queryClient.invalidateQueries({ queryKey: ['agendaTimeline'] })
    },
  })
}