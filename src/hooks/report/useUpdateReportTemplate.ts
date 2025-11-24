import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { UpdateReportTemplateData } from '@/types/report.type'

export const useUpdateReportTemplate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateReportTemplateData }) => {
      const res = await api.put(`/reports/templates/${id}`, data)
      return res.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['report-templates'] })
      queryClient.invalidateQueries({ queryKey: ['all-report-templates'] })
      queryClient.invalidateQueries({ queryKey: ['report-template', variables.id] })
    },
  })
}