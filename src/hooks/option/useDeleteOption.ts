// src/hooks/option/useDeleteOption.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteOption = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/resolution-options/${id}`)
      return res.data
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['resolutionOptions'] })
      queryClient.invalidateQueries({ queryKey: ['resolutionOptionsByResolution'] })
      queryClient.removeQueries({ queryKey: ['option', id] })
    },
    onError: (error: any) => {
      console.error('Option deletion error:', error)
    },
  })
}