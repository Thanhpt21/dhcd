// src/hooks/registration/useRegistrations.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseRegistrationsParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  meetingId?: string
  shareholderId?: string
}

export const useRegistrations = (params: UseRegistrationsParams = {}) => {
  return useQuery({
    queryKey: ['registrations', params],
    queryFn: async () => {
      const res = await api.get('/registrations', { params })
      return res.data.data
    },
     refetchInterval: 3000, 
    refetchIntervalInBackground: true, 
  })
}