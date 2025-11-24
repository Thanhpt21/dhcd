// src/hooks/attendance/useAttendanceStatistics.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { AttendanceStatistics } from '@/types/attendance.type'

export const useAttendanceStatistics = (meetingId: number) => {
  return useQuery({
    queryKey: ['attendance-statistics', meetingId],
    queryFn: async (): Promise<AttendanceStatistics> => {
      const res = await api.get(`/attendances/meeting/${meetingId}/statistics`)
      return res.data.data
    },
    enabled: !!meetingId,
  })
}