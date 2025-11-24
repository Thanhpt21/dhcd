// src/hooks/vote/useShareholderVotes.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useShareholderVotes = (shareholderId: number) => {
  return useQuery({
    queryKey: ['shareholderVotes', shareholderId],
    queryFn: async () => {
      const res = await api.get(`/votes/shareholder/${shareholderId}`)
      return res.data.data // Trả về array của votes
    },
    enabled: !!shareholderId,
  })
}