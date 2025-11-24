// src/hooks/registration/useCreateRegistration.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { CreateRegistrationData } from '@/types/registration.type'

export const useCreateRegistration = () => {
  return useMutation({
    mutationFn: async (data: CreateRegistrationData) => {
      const res = await api.post('/registrations', data)
      return res.data.data
    },
  })
}