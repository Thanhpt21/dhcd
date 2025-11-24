// src/hooks/category/useDeleteCategory.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteCategory = () => {
  return useMutation({
    mutationFn: async (id: string | number) => {
      const res = await api.delete(`/categories/${id}`)
      return res.data // Trả về toàn bộ { success, message, data }
    },
  })
}