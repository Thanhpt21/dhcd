// src/hooks/proxy/useProxies.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseProxiesParams {
  page?: number
  limit?: number
  meetingId?: string
  shareholderId?: string
  proxyPersonId?: string
  status?: string
  search?: string
}

export const useProxies = ({
  page = 1,
  limit = 10,
  meetingId = '',
  shareholderId = '',
  proxyPersonId = '',
  status = '',
  search = ''
}: UseProxiesParams = {}) => {
  return useQuery({
    queryKey: ['proxies', page, limit, meetingId, shareholderId, proxyPersonId, status, search],
    queryFn: async () => {
      const res = await api.get('/proxies', {
        params: { page, limit, meetingId, shareholderId, proxyPersonId, status, search },
      })
      return res.data.data
    },
  })
}