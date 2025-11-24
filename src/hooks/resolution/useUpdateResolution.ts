// src/hooks/resolution/useUpdateResolution.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { UpdateResolutionRequest } from '@/types/resolution.type'

export const useUpdateResolution = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateResolutionRequest) => {
      const res = await api.put(`/resolutions/${id}`, data)
      return res.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resolutions'] })
      queryClient.invalidateQueries({ queryKey: ['meetingResolutions'] })
      queryClient.invalidateQueries({ queryKey: ['resolution', variables.id] })
    },
  })
}