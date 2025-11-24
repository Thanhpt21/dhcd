// src/hooks/resolution/useDeleteResolution.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteResolution = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/resolutions/${id}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resolutions'] })
      queryClient.invalidateQueries({ queryKey: ['meetingResolutions'] })
    },
  })
}