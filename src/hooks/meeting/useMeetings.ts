// src/hooks/meeting/useMeetings.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseMeetingsParams {
  page?: number
  limit?: number
  search?: string
  status?: string
}

export const useMeetings = ({
  page = 1,
  limit = 10,
  search = '',
  status = ''
}: UseMeetingsParams = {}) => {
  return useQuery({
    queryKey: ['meetings', page, limit, search, status],
    queryFn: async () => {
      const res = await api.get('/meetings', {
        params: { page, limit, search, status },
      })
      return res.data.data 
    },
  })
}