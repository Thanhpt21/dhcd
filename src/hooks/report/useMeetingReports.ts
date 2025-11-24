import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { GeneratedReport } from '@/types/report.type'

export const useMeetingReports = (meetingId: number) => {
  return useQuery({
    queryKey: ['meeting-reports', meetingId],
    queryFn: async (): Promise<GeneratedReport[]> => {
      const res = await api.get(`/reports/meeting/${meetingId}`)
      return res.data.data
    },
    enabled: !!meetingId,
  })
}