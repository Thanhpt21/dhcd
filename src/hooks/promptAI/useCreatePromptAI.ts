// useCreatePromptAI.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useCreatePromptAI = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/prompt-ai', data)
      return res.data.data
    },
  })
}
