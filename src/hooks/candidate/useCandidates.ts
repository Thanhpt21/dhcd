// src/hooks/candidate/useCandidates.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseCandidatesParams {
  page?: number
  limit?: number
  resolutionId?: string
  search?: string
}

export const useCandidates = ({
  page = 1,
  limit = 10,
  resolutionId = '',
  search = ''
}: UseCandidatesParams = {}) => {
  return useQuery({
    queryKey: ['candidates', page, limit, resolutionId, search],
    queryFn: async () => {
      const res = await api.get('/resolution-candidates', {
        params: { page, limit, resolutionId, search },
      })
      return res.data.data 
    },
     refetchInterval: 3000, 
    refetchIntervalInBackground: true, 
  })
}