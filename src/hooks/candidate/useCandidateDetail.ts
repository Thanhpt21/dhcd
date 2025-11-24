// src/hooks/candidate/useCandidateDetail.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useCandidateDetail = (id: number) => {
  return useQuery({
    queryKey: ['candidate', id],
    queryFn: async () => {
      const res = await api.get(`/resolution-candidates/${id}`)
      return res.data.data 
    },
    enabled: !!id,
  })
}