// src/hooks/shareholder/useExportShareholders.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useExportShareholders = () => {
  return useMutation({
    mutationFn: async () => {
      const res = await api.get('/shareholders/export', {
        responseType: 'blob'
      })
      return res.data
    },
  })
}