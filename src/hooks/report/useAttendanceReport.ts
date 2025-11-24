import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { AttendanceReport } from '@/types/report.type'

export const useAttendanceReport = (meetingId: number) => {
  return useQuery({
    queryKey: ['attendance-report', meetingId],
    queryFn: async (): Promise<AttendanceReport> => {
      const res = await api.get(`/reports/meeting/${meetingId}/attendance`)
      return res.data.data
    },
    enabled: !!meetingId,
  })
}