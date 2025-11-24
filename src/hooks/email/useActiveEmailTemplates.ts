// src/hooks/email/useActiveEmailTemplates.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useActiveEmailTemplates = () => {
  return useQuery({
    queryKey: ['activeEmailTemplates'],
    queryFn: async () => {
      const res = await api.get('/email-templates/active')
      return res.data.data
    },
  })
}