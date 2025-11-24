// src/hooks/category/useAllCategories.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useAllCategories = (search?: string) => {
  return useQuery({
    queryKey: ['allCategories', search],
    queryFn: async () => {
      const res = await api.get('/categories/all/list', {
        params: { search },
      })
      return res.data.data // Lấy data từ { success, message, data }
    },
  })
}