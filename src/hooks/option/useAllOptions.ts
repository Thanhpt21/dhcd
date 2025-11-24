// src/hooks/option/useAllOptions.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface OptionsQueryParams {
  page?: number
  limit?: number
  resolutionId?: string
  search?: string
}

export const useAllOptions = (params: OptionsQueryParams = {}) => {
  const { page = 1, limit = 10, resolutionId = '', search = '' } = params
  
  return useQuery({
    queryKey: ['resolutionOptions', { page, limit, resolutionId, search }],
    queryFn: async () => {
      const queryParams = new URLSearchParams()
      if (page) queryParams.append('page', page.toString())
      if (limit) queryParams.append('limit', limit.toString())
      if (resolutionId) queryParams.append('resolutionId', resolutionId)
      if (search) queryParams.append('search', search)
      
      const res = await api.get(`/resolution-options?${queryParams.toString()}`)
      return res.data.data 
    },
  })
}