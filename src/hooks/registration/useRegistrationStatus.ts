// src/hooks/registration/useRegistrationStatus.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useUpdateRegistrationStatus = () => {
  return useMutation({
    mutationFn: async ({ id, status }: { id: number | string; status: string }) => {
      const res = await api.put(`/registrations/${id}/status`, { status })
      return res.data.data
    },
  })
}