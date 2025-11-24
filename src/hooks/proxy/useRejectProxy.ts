// src/hooks/proxy/useRejectProxy.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useRejectProxy = () => {
  return useMutation({
    mutationFn: async ({
      id,
      rejectedReason,
    }: {
      id: number | string
      rejectedReason: string
    }) => {
      const res = await api.put(`/proxies/${id}/reject`, { rejectedReason })
      return res.data.data
    },
  })
}