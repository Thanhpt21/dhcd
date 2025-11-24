// src/hooks/verification/useVerificationLinks.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useVerificationLinks = (
  page?: number, 
  limit?: number, 
  meetingId?: string, 
  shareholderId?: string, 
  verificationType?: string, 
  isUsed?: string, 
  search?: string,
  emailSent ?: string
) => {
  return useQuery({
    queryKey: ['verificationLinks', page, limit, meetingId, shareholderId, verificationType, isUsed, search, emailSent],
    queryFn: async () => {
      const res = await api.get('/verification-links', {
        params: { page, limit, meetingId, shareholderId, verificationType, isUsed, search, emailSent  },
      })
      return res.data.data
    },
    refetchOnWindowFocus: true, 
    staleTime: 10 * 1000, 
    gcTime: 5 * 60 * 1000,
  })
}