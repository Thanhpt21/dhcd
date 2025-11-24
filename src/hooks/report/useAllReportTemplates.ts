import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { ReportTemplate } from '@/types/report.type'

export const useAllReportTemplates = () => {
  return useQuery({
    queryKey: ['all-report-templates'],
    queryFn: async (): Promise<ReportTemplate[]> => {
      const res = await api.get('/reports/templates/all')
      return res.data.data
    },
  })
}