// src/hooks/resolution/useResolutions.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseResolutionsParams {
  page?: number
  limit?: number
  meetingId?: string
  search?: string
  isActive?: string
}

export const useResolutions = ({
  page = 1,
  limit = 10,
  meetingId = '',
  search = '',
  isActive = ''
}: UseResolutionsParams = {}) => {
  return useQuery({
    queryKey: ['resolutions', page, limit, meetingId, search, isActive],
    queryFn: async () => {
      const res = await api.get('/resolutions', {
        params: { page, limit, meetingId, search, isActive },
      })
      return res.data.data 
    },
  })
}