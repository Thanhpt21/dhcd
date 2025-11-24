// src/hooks/verification/useAllVerificationLinks.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useAllVerificationLinks = (
  meetingId?: string, 
  shareholderId?: string, 
  verificationType?: string, 
  isUsed?: string, 
  search?: string
) => {
  return useQuery({
    queryKey: ['allVerificationLinks', meetingId, shareholderId, verificationType, isUsed, search],
    queryFn: async () => {
      const res = await api.get('/verification-links', {
        params: { limit: 1000, meetingId, shareholderId, verificationType, isUsed, search },
      })
      return res.data.data
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })
}