// src/hooks/document/usePublicDocuments.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UsePublicDocumentsParams {
  page?: number
  limit?: number
  meetingId?: string
  category?: string
}

export const usePublicDocuments = ({
  page = 1,
  limit = 10,
  meetingId = '',
  category = ''
}: UsePublicDocumentsParams = {}) => {
  return useQuery({
    queryKey: ['publicDocuments', page, limit, meetingId, category],
    queryFn: async () => {
      const res = await api.get('/documents/public', {
        params: { page, limit, meetingId, category },
      })
      return res.data.data 
    },
  })
}