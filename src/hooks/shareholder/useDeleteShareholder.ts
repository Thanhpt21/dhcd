// src/hooks/shareholder/useDeleteShareholder.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteShareholder = () => {
  return useMutation({
    mutationFn: async (id: string | number) => {
      const res = await api.delete(`/shareholders/${id}`)
      return res.data
    },
  })
}