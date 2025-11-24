// src/hooks/attendance/useUpdateAttendance.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { message } from 'antd'
import type { UpdateAttendanceData } from '@/types/attendance.type'

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateAttendanceData }) => {
      const res = await api.put(`/attendances/${id}`, data)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] })
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Cập nhật điểm danh thất bại')
    },
  })
}