import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { CreateReportTemplateData } from '@/types/report.type'

export const useCreateReportTemplate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateReportTemplateData) => {
      const res = await api.post('/reports/templates', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-templates'] })
      queryClient.invalidateQueries({ queryKey: ['all-report-templates'] })
    },
  })
}