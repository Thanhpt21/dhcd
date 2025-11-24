// src/hooks/resolution/useCreateResolution.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { CreateResolutionRequest } from '@/types/resolution.type'

export const useCreateResolution = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateResolutionRequest) => {
      const res = await api.post('/resolutions', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resolutions'] })
      queryClient.invalidateQueries({ queryKey: ['meetingResolutions'] })
    },
  })
}