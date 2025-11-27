// src/hooks/resolution/useMeetingResolutions.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useMeetingResolutions = (meetingId: number) => {
   return useQuery({
    queryKey: ['meetingResolutions', meetingId],
    queryFn: async () => {
      const res = await api.get(`/resolutions/meeting/${meetingId}`)
      return res.data.data 
    },
    enabled: !!meetingId,
  })
}