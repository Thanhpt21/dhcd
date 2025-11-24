// src/hooks/shareholder/useShareholders.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseShareholdersParams {
  page?: number
  limit?: number
  search?: string
  isActive?: string
}

export const useShareholders = ({
  page = 1,
  limit = 10,
  search = '',
  isActive = ''
}: UseShareholdersParams = {}) => {
  return useQuery({
    queryKey: ['shareholders', page, limit, search, isActive],
    queryFn: async () => {
      const res = await api.get('/shareholders', {
        params: { page, limit, search, isActive },
      })
      return res.data.data
    },
  })
}