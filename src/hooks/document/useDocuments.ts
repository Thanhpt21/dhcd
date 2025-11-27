// src/hooks/document/useDocuments.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseDocumentsParams {
  page?: number
  limit?: number
  meetingId?: string
  category?: string
  isPublic?: string
  search?: string
}

export const useDocuments = ({
  page = 1,
  limit = 10,
  meetingId = '',
  category = '',
  isPublic = '',
  search = ''
}: UseDocumentsParams = {}) => {
  return useQuery({
    queryKey: ['documents', page, limit, meetingId, category, isPublic, search],
    queryFn: async () => {
      const res = await api.get('/documents', {
        params: { page, limit, meetingId, category, isPublic, search },
      })
      return res.data.data 
    },
     refetchInterval: 3000, 
    refetchIntervalInBackground: true, 
  })
}