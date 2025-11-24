// src/hooks/email/useEmailTemplateByName.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useEmailTemplateByName = (name: string) => {
  return useQuery({
    queryKey: ['emailTemplateByName', name],
    queryFn: async () => {
      const res = await api.get(`/email-templates/name/${name}`)
      return res.data.data
    },
    enabled: !!name,
  })
}