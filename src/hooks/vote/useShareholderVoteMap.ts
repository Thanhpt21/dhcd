// src/hooks/vote/useShareholderVoteMap.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useShareholderVoteMap = (shareholderId: number) => {
  return useQuery({
    queryKey: ['shareholderVoteMap', shareholderId],
    queryFn: async () => {
      const res = await api.get(`/votes/shareholder/${shareholderId}`)
      const votes = res.data.data || []
      
      // Tạo map: resolutionId -> vote (nếu có)
      const voteMap = votes.reduce((acc: Record<number, any>, vote: any) => {
        acc[vote.resolutionId] = vote
        return acc
      }, {})
      
      return voteMap
    },
    enabled: !!shareholderId,
  })
}