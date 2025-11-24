// src/hooks/document/useDocumentStatistics.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDocumentStatistics = (meetingId: number) => {
  return useQuery({
    queryKey: ['documentStatistics', meetingId],
    queryFn: async () => {
      const res = await api.get(`/documents/meeting/${meetingId}/statistics`)
      return res.data.data 
    },
    enabled: !!meetingId,
  })
}