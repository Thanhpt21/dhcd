// src/hooks/attendance/useMeetingAttendances.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { Attendance } from '@/types/attendance.type'

export const useMeetingAttendances = (meetingId: number) => {
  return useQuery({
    queryKey: ['attendances', 'meeting', meetingId],
    queryFn: async (): Promise<Attendance[]> => {
      const res = await api.get(`/attendances/meeting/${meetingId}`)
      return res.data.data
    },
    enabled: !!meetingId,
     refetchInterval: 3000, 
    refetchIntervalInBackground: true, 
  })
}