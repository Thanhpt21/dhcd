// src/hooks/shareholder/useCreateShareholder.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { CreateShareholderData } from '@/types/shareholder.type'

export const useCreateShareholder = () => {
  return useMutation({
    mutationFn: async (data: CreateShareholderData) => {
      const res = await api.post('/shareholders', data)
      return res.data.data
    },
  })
}