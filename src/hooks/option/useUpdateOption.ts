// src/hooks/option/useUpdateOption.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { UpdateOptionRequest } from '@/types/option.type'


export const useUpdateOption = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateOptionRequest & { id: number }) => {
      const res = await api.put(`/resolution-options/${id}`, data)
      return res.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resolutionOptions'] })
      queryClient.invalidateQueries({ queryKey: ['option', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['resolutionOptionsByResolution'] })
    },
    onError: (error: any) => {
      console.error('Option update error:', error)
    },
  })
}