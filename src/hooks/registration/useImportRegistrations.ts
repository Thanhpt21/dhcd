// src/hooks/registration/useImportRegistrations.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useImportRegistrations = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      
      const res = await api.post('/registrations/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return res.data.data
    },
  })
}