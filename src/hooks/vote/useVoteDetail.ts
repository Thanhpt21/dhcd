// src/hooks/vote/useVoteDetail.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useVoteDetail = (voteId: number) => {
  return useQuery({
    queryKey: ['voteDetail', voteId],
    queryFn: async () => {
      const res = await api.get(`/votes/${voteId}`)
      return res.data // Trả về toàn bộ response
    },
    enabled: !!voteId,
  })
}