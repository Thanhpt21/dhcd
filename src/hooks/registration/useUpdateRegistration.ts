// src/hooks/registration/useUpdateRegistration.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { UpdateRegistrationData } from '@/types/registration.type'

interface UpdateRegistrationParams {
  id: number | string
  data: UpdateRegistrationData
}

export const useUpdateRegistration = () => {
  return useMutation({
    mutationFn: async ({ id, data }: UpdateRegistrationParams) => {
      const res = await api.put(`/registrations/${id}`, data)
      return res.data.data
    },
  })
}