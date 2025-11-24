// src/hooks/attendance/useCreateAttendance.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { message } from 'antd'
import type { CreateAttendanceData } from '@/types/attendance.type'

export const useCreateAttendance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateAttendanceData) => {
      const res = await api.post('/attendances', data)
      return res.data.data
    },
    onSuccess: () => {
      message.success('Tạo điểm danh thành công')
      queryClient.invalidateQueries({ queryKey: ['attendances'] })
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Tạo điểm danh thất bại')
    },
  })
}