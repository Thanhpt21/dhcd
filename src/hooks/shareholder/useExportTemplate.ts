// src/hooks/shareholder/useExportTemplate.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useExportTemplate = () => {
  return useMutation({
    mutationFn: async () => {
      const res = await api.get('/shareholders/export/template', {
        responseType: 'blob'
      })
      return res.data
    },
  })
}