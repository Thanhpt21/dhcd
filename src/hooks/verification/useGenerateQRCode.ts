// src/hooks/verification/useGenerateQRCode.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useGenerateQRCode = () => {
  return useMutation({
    mutationFn: async (verificationCode: string) => {
      const res = await api.get(`/verification-links/qr/generate/${verificationCode}`)
      return res.data.data
    },
  })
}