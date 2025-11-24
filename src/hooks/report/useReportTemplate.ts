import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { ReportTemplate } from '@/types/report.type'

export const useReportTemplate = (id: number) => {
  return useQuery({
    queryKey: ['report-template', id],
    queryFn: async (): Promise<ReportTemplate> => {
      const res = await api.get(`/reports/templates/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}