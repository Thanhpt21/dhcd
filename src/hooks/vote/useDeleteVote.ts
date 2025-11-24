// src/hooks/vote/useDeleteVote.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteVote = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/votes/${id}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['votes'] })
      queryClient.invalidateQueries({ queryKey: ['resolutionVotes'] })
      queryClient.invalidateQueries({ queryKey: ['votingResults'] })
      queryClient.invalidateQueries({ queryKey: ['votingStatistics'] })
    },
  })
}