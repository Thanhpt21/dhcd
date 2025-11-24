// src/hooks/proxy/useValidateProxy.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useValidateProxy = () => {
  return useMutation({
    mutationFn: async ({
      meetingId,
      shareholderId,
    }: {
      meetingId: number
      shareholderId: number
    }) => {
      const res = await api.post('/proxies/validate', { meetingId, shareholderId })
      return res.data.data
    },
  })
}