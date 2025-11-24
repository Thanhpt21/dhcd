// src/hooks/document/useMeetingDocuments.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useMeetingDocuments = (meetingId: number) => {
  return useQuery({
    queryKey: ['meetingDocuments', meetingId],
    queryFn: async () => {
      const res = await api.get(`/documents/meeting/${meetingId}`)
      return res.data.data 
    },
    enabled: !!meetingId,
    refetchInterval: 3000, 
    refetchIntervalInBackground: true, 
  })
}