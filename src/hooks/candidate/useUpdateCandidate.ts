// src/hooks/candidate/useUpdateCandidate.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { UpdateCandidateRequest } from '@/types/candidate.type'

export const useUpdateCandidate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateCandidateRequest) => {
      const res = await api.put(`/resolution-candidates/${id}`, data)
      return res.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      queryClient.invalidateQueries({ queryKey: ['resolutionCandidates'] })
      queryClient.invalidateQueries({ queryKey: ['candidate', variables.id] })
    },
  })
}