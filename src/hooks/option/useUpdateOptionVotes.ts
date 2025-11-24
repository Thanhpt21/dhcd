// src/hooks/option/useUpdateOptionVotes.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useUpdateOptionVotes = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, voteCount }: { id: number; voteCount: number }) => {
      const res = await api.put(`/resolution-options/${id}/votes`, { voteCount })
      return res.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resolutionOptions'] })
      queryClient.invalidateQueries({ queryKey: ['option', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['optionStatistics'] })
    },
    onError: (error: any) => {
      console.error('Option votes update error:', error)
    },
  })
}