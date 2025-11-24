import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { GeneratedReport } from '@/types/report.type'

export const useGeneratedReport = (id: number) => {
  return useQuery({
    queryKey: ['generated-report', id],
    queryFn: async (): Promise<GeneratedReport> => {
      const res = await api.get(`/reports/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}