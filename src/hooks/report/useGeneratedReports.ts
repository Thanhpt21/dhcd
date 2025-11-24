import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { ReportListResponse } from '@/types/report.type'

export const useGeneratedReports = (params?: {
  page?: number
  limit?: number
  meetingId?: string
  templateId?: string
  search?: string
}) => {
  return useQuery({
    queryKey: ['generated-reports', params],
    queryFn: async (): Promise<ReportListResponse> => {
      const res = await api.get('/reports', { params })
      return res.data.data
    },
  })
}