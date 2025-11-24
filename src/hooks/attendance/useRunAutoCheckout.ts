// src/hooks/attendance/useRunAutoCheckout.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { message } from 'antd'

export const useRunAutoCheckout = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (meetingId: number) => {
      const res = await api.post(`/auto-checkout/meeting/${meetingId}`)
      return res.data
    },
    onSuccess: (data) => {
      message.success(data.message)
      queryClient.invalidateQueries({ queryKey: ['auto-checkout-status'] })
      queryClient.invalidateQueries({ queryKey: ['attendances'] })
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Lỗi khi chạy tự động checkout')
    }
  })
}