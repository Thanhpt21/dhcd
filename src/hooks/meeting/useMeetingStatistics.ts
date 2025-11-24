// src/hooks/meeting/useMeetingStatistics.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseMeetingStatisticsOptions {
  enabled?: boolean
}

export const useMeetingStatistics = (
  id: number | string, 
  options?: UseMeetingStatisticsOptions
) => {
  return useQuery({
    queryKey: ['meetingStatistics', id],
    queryFn: async () => {
      const res = await api.get(`/meetings/${id}/statistics`)
      return res.data.data // Lấy data từ { success, message, data }
    },
    enabled: !!id && (options?.enabled !== false),
    ...options, // Spread other options
  })
}