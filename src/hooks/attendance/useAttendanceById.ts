// src/hooks/attendance/useAttendanceById.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { Attendance } from '@/types/attendance.type'

export const useAttendanceById = (id: number) => {
  return useQuery({
    queryKey: ['attendance', id],
    queryFn: async (): Promise<Attendance> => {
      const res = await api.get(`/attendances/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}