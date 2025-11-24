// src/hooks/agenda/useAgendas.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseAgendasParams {
  page?: number
  limit?: number
  meetingId?: string
  status?: string
  search?: string
}

export const useAgendas = ({
  page = 1,
  limit = 10,
  meetingId = '',
  status = '',
  search = ''
}: UseAgendasParams = {}) => {
  return useQuery({
    queryKey: ['agendas', page, limit, meetingId, status, search],
    queryFn: async () => {
      const res = await api.get('/agendas', {
        params: { page, limit, meetingId, status, search },
      })
      return res.data.data 
    },
  })
}