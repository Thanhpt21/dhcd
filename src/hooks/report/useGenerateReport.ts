import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { GenerateReportData } from '@/types/report.type'

export const useGenerateReport = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: GenerateReportData) => {
      const res = await api.post('/reports/generate', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-reports'] })
      queryClient.invalidateQueries({ queryKey: ['meeting-reports'] })
    },
  })
}