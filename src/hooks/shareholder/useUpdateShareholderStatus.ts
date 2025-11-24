// src/hooks/shareholder/useUpdateShareholderStatus.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useUpdateShareholderStatus = () => {
  return useMutation({
    mutationFn: async ({
      id,
      isActive,
    }: {
      id: number | string
      isActive: boolean
    }) => {
      const res = await api.put(`/shareholders/${id}/status`, { isActive })
      return res.data.data
    },
  })
}