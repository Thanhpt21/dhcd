// src/hooks/meeting/useAllMeetings.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useAllMeetings = (search?: string, status?: string) => {
  return useQuery({
    queryKey: ['allMeetings', search, status],
    queryFn: async () => {
      const res = await api.get('/meetings/all/list', {
        params: { search, status },
      })
      return res.data.data 
    },
  })
}