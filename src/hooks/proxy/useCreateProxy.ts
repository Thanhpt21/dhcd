// src/hooks/proxy/useCreateProxy.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useCreateProxy = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post('/proxies', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return res.data.data
    },
  })
}