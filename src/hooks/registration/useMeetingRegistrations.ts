// src/hooks/registration/useMeetingRegistrations.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useMeetingRegistrations = (meetingId: number | string) => {
  return useQuery({
    queryKey: ['meetingRegistrations', meetingId],
    queryFn: async () => {
      const res = await api.get(`/registrations/meeting/${meetingId}`)
      return res.data.data
    },
    enabled: !!meetingId,
    refetchInterval: 3000, // Refetch mỗi 3 giây
    refetchIntervalInBackground: true, // Refetch cả khi tab không active
  })
}