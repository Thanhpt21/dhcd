// src/hooks/option/useCreateOption.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { CreateOptionRequest } from '@/types/option.type'


export const useCreateOption = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateOptionRequest) => {
      const res = await api.post('/resolution-options', data)
      return res.data
    },
    onSuccess: (_, variables) => {
      // Invalidate các query liên quan
      queryClient.invalidateQueries({ queryKey: ['resolutionOptions'] })
      queryClient.invalidateQueries({ queryKey: ['resolutionOptionsByResolution', variables.resolutionId] })
      queryClient.invalidateQueries({ queryKey: ['optionStatistics', variables.resolutionId] })
    },
    onError: (error: any) => {
      console.error('Option creation error:', error)
    },
  })
}