// src/hooks/shareholder/useImportShareholders.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useImportShareholders = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      
      const res = await api.post('/shareholders/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return res.data.data
    },
  })
}