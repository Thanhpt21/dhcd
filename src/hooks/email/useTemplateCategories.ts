// src/hooks/email/useTemplateCategories.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useTemplateCategories = () => {
  return useQuery({
    queryKey: ['templateCategories'],
    queryFn: async () => {
      const res = await api.get('/email-templates/categories')
      return res.data.data
    },
  })
}