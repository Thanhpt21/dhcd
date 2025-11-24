// src/hooks/proxy/useUpdateProxy.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useUpdateProxy = () => {
  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: number | string
      formData: FormData
    }) => {
      const res = await api.put(`/proxies/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return res.data.data
    },
  })
}