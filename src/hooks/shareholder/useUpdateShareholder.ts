// src/hooks/shareholder/useUpdateShareholder.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { UpdateShareholderData } from '@/types/shareholder.type'

export const useUpdateShareholder = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string
      data: UpdateShareholderData
    }) => {
      const res = await api.put(`/shareholders/${id}`, data)
      return res.data.data
    },
  })
}