// src/hooks/agenda/useUpdateAgenda.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { UpdateAgendaRequest } from '@/types/agenda.type'

export const useUpdateAgenda = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateAgendaRequest) => {
      const res = await api.put(`/agendas/${id}`, data)
      return res.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agendas'] })
      queryClient.invalidateQueries({ queryKey: ['meetingAgendas'] })
      queryClient.invalidateQueries({ queryKey: ['agendaTimeline'] })
      queryClient.invalidateQueries({ queryKey: ['agenda', variables.id] })
    },
  })
}