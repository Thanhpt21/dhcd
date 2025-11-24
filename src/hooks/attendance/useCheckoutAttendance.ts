// src/hooks/attendance/useCheckoutAttendance.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { message } from 'antd'

export const useCheckoutAttendance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.put(`/attendances/${id}/checkout`)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] })
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Checkout thất bại')
    },
  })
}