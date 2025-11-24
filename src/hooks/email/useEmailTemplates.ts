// src/hooks/email/useEmailTemplates.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useEmailTemplates = (
  page?: number, 
  limit?: number, 
  category?: string, 
  isActive?: string, 
  language?: string, 
  search?: string
) => {
  return useQuery({
    queryKey: ['emailTemplates', page, limit, category, isActive, language, search],
    queryFn: async () => {
      const res = await api.get('/email-templates', {
        params: { page, limit, category, isActive, language, search },
      })
      return res.data.data
    },
  })
}