// src/hooks/vote/useVotes.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseVotesParams {
  page?: number
  limit?: number
  resolutionId?: string
  meetingId?: string
  shareholderId?: string
}

export const useVotes = ({
  page = 1,
  limit = 10,
  resolutionId = '',
  meetingId = '',
  shareholderId = ''
}: UseVotesParams = {}) => {
  return useQuery({
    queryKey: ['votes', page, limit, resolutionId, meetingId, shareholderId],
    queryFn: async () => {
      const res = await api.get('/votes', {
        params: { page, limit, resolutionId, meetingId, shareholderId },
      })
      return res.data.data 
    },
  })
}