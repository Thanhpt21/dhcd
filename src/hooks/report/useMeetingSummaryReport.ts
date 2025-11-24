import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { MeetingSummaryReport } from '@/types/report.type'

export const useMeetingSummaryReport = (meetingId: number) => {
  return useQuery({
    queryKey: ['meeting-summary-report', meetingId],
    queryFn: async (): Promise<MeetingSummaryReport> => {
      const res = await api.get(`/reports/meeting/${meetingId}/summary`)
      return res.data.data
    },
    enabled: !!meetingId,
  })
}