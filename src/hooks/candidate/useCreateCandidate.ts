// src/hooks/candidate/useCreateCandidate.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { CreateCandidateRequest } from '@/types/candidate.type'

export const useCreateCandidate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateCandidateRequest) => {
      const res = await api.post('/resolution-candidates', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      queryClient.invalidateQueries({ queryKey: ['resolutionCandidates'] })
    },
  })
}