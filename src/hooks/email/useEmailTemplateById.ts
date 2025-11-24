// src/hooks/email/useEmailTemplateById.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useEmailTemplateById = (id: number) => {
  return useQuery({
    queryKey: ['emailTemplate', id],
    queryFn: async () => {
      const res = await api.get(`/email-templates/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}