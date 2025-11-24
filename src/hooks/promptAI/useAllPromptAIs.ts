// useAllPromptAIs.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useAllPromptAIs = (search?: string) => {
  return useQuery({
    queryKey: ['allPromptAIs', search],
    queryFn: async () => {
      const res = await api.get('/prompt-ai/all/list', {
        params: { search },
      })
      return res.data.data // Lấy data từ { success, message, data }
    },
  })
}
