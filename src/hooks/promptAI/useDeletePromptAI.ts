// src/hooks/promptAI/useDeletePromptAI.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeletePromptAI = () => {
  return useMutation({
    mutationFn: async (id: string | number) => {
      const res = await api.delete(`/prompt-ai/${id}`)
      return res.data
    },
  })
}