// src/hooks/registration/useRegistrationById.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useRegistrationById = (id: number | string) => {
  return useQuery({
    queryKey: ['registration', id],
    queryFn: async () => {
      const res = await api.get(`/registrations/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}