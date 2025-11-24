// src/hooks/registration/useDeleteRegistration.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteRegistration = () => {
  return useMutation({
    mutationFn: async (id: string | number) => {
      const res = await api.delete(`/registrations/${id}`)
      return res.data
    },
  })
}