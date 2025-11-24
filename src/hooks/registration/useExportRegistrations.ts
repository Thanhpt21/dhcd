// src/hooks/registration/useExportRegistrations.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useExportRegistrations = () => {
  return useMutation({
    mutationFn: async (meetingId?: number) => {
      const res = await api.get('/registrations/export', {
        params: { meetingId },
        responseType: 'blob'
      })
      return res.data
    },
  })
}