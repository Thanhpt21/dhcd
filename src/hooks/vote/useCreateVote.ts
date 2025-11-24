// src/hooks/vote/useCreateVote.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { CreateVoteRequest } from '@/types/vote.type'

export const useCreateVote = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateVoteRequest) => {
      const res = await api.post('/votes', data)
      return res.data
    },
    onSuccess: (_, variables) => {
      // Invalidate các query liên quan
      queryClient.invalidateQueries({ queryKey: ['votes'] })
      queryClient.invalidateQueries({ queryKey: ['resolutionVotes', variables.resolutionId] })
      queryClient.invalidateQueries({ queryKey: ['votingResults', variables.resolutionId] })
      queryClient.invalidateQueries({ queryKey: ['meetingResolutions', variables.meetingId] })
      queryClient.invalidateQueries({ queryKey: ['votingStatistics', variables.meetingId] })
    },
    onError: (error: any) => {
      // Có thể thêm xử lý lỗi cụ thể ở đây
      console.error('Vote creation error:', error)
    },
  })
}