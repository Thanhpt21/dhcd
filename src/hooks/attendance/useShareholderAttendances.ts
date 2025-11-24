// src/hooks/attendance/useShareholderAttendances.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { Attendance } from '@/types/attendance.type'

export const useShareholderAttendances = (shareholderId: number) => {
  return useQuery({
    queryKey: ['attendances', 'shareholder', shareholderId],
    queryFn: async (): Promise<Attendance[]> => {
      const res = await api.get(`/attendances/shareholder/${shareholderId}`)
      return res.data.data
    },
    enabled: !!shareholderId,
  })
}