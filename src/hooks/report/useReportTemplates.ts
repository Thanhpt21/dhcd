import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { TemplateListResponse } from '@/types/report.type'

export const useReportTemplates = (params?: {
  page?: number
  limit?: number
  type?: string
  search?: string
}) => {
  return useQuery({
    queryKey: ['report-templates', params],
    queryFn: async (): Promise<TemplateListResponse> => {
      // Chuyển đổi params thành query string đúng format mà backend mong đợi
      const queryParams: Record<string, string> = {}
      
      if (params?.page) queryParams.page = params.page.toString()
      if (params?.limit) queryParams.limit = params.limit.toString()
      if (params?.type) queryParams.type = params.type
      if (params?.search) queryParams.search = params.search

      console.log('📤 Sending query params:', queryParams)

      const res = await api.get('/reports/templates', { params: queryParams })
      console.log('📥 Received response:', res.data)
      return res.data.data
    },
  })
}