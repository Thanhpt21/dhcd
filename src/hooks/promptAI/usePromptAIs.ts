// src/hooks/promptAI/usePromptAIs.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UsePromptAIsParams {
  page?: number
  limit?: number
  search?: string
}

export const usePromptAIs = ({
  page = 1,
  limit = 10,
  search = '',
}: UsePromptAIsParams) => {
  return useQuery({
    queryKey: ['promptAIs', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/prompt-ai', {
        params: { page, limit, search },
      })
        return res.data.data
    },
  })
}