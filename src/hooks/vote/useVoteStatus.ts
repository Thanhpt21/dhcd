// src/hooks/vote/useVoteStatus.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useVoteStatus = (resolutionId?: number, shareholderId?: number) => {
  return useQuery({
    queryKey: ['voteStatus', resolutionId, shareholderId],
    queryFn: async () => {
      if (!resolutionId || !shareholderId) return null
      
      // Lấy tất cả votes của shareholder và filter theo resolution
      const res = await api.get(`/votes/shareholder/${shareholderId}`)
      const votes = res.data.data || []
      const existingVote = votes.find((vote: any) => vote.resolutionId === resolutionId)
      
      return {
        hasVoted: !!existingVote,
        vote: existingVote || null
      }
    },
    enabled: !!resolutionId && !!shareholderId,
  })
}