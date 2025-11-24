// src/hooks/proxy/useDeleteProxy.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteProxy = () => {
  return useMutation({
    mutationFn: async (id: string | number) => {
      const res = await api.delete(`/proxies/${id}`)
      return res.data
    },
  })
}