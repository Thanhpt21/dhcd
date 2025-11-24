// src/hooks/agenda/useAgendaDetail.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useAgendaDetail = (id: number) => {
  return useQuery({
    queryKey: ['agenda', id],
    queryFn: async () => {
      const res = await api.get(`/agendas/${id}`)
      return res.data.data 
    },
    enabled: !!id,
  })
}