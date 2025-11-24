// src/hooks/document/useDocumentDetail.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDocumentDetail = (id: number) => {
  return useQuery({
    queryKey: ['document', id],
    queryFn: async () => {
      const res = await api.get(`/documents/${id}`)
      return res.data.data 
    },
    enabled: !!id,
  })
}