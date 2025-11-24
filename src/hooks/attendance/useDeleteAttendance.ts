// src/hooks/attendance/useDeleteAttendance.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { message } from 'antd'

export const useDeleteAttendance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/attendances/${id}`)
      return res.data.data
    },
    onSuccess: () => {
      message.success('Xóa điểm danh thành công')
      queryClient.invalidateQueries({ queryKey: ['attendances'] })
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Xóa điểm danh thất bại')
    },
  })
}