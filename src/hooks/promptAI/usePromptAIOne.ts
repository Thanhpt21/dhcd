// src/hooks/promptAI/usePromptAIOne.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const usePromptAIOne = (id: number | string) => {
  return useQuery({
    queryKey: ['promptAI', id],
    queryFn: async () => {
      const res = await api.get(`/prompt-ai/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}