// src/hooks/proxy/useApproveProxy.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useApproveProxy = () => {
  return useMutation({
    mutationFn: async ({
      id,
      approvedBy,
    }: {
      id: number | string
      approvedBy: number
    }) => {
      const res = await api.put(`/proxies/${id}/approve`, { approvedBy })
      return res.data.data
    },
  })
}