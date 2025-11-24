// src/hooks/proxy/useRevokeProxy.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useRevokeProxy = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.put(`/proxies/${id}/revoke`)
      return res.data.data
    },
  })
}