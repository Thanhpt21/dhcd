// src/hooks/registration/useAllRegistrations.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useAllRegistrations = (search?: string, status?: string, meetingId?: string, shareholderId?: string) => {
  return useQuery({
    queryKey: ['allRegistrations', search, status, meetingId, shareholderId],
    queryFn: async () => {
      const res = await api.get('/registrations/all/list', {
        params: { search, status, meetingId, shareholderId },
      })
      return res.data.data
    },
     refetchInterval: 3000, 
    refetchIntervalInBackground: true, 
  })
}