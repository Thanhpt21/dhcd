// src/hooks/attendance/useAttendances.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { Attendance, AttendanceListResponse } from '@/types/attendance.type'

export const useAttendances = (params?: {
  page?: number
  limit?: number
  meetingId?: string
  shareholderId?: string
  search?: string
}) => {
  return useQuery({
    queryKey: ['attendances', params],
    queryFn: async (): Promise<AttendanceListResponse> => {
      const res = await api.get('/attendances', { params })
      return res.data.data
    },
  })
}