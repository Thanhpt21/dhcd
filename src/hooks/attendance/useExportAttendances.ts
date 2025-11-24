// src/hooks/attendance/useExportAttendances.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { message } from 'antd'

export const useExportAttendances = () => {
  return useMutation({
    mutationFn: async (meetingId: number) => {
      const response = await api.get(`/attendances/export/meeting/${meetingId}`, {
        responseType: 'blob',
      })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `attendances_${meetingId}_${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      return true
    },
    onSuccess: () => {
      message.success('Export danh sách điểm danh thành công')
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Export thất bại')
    },
  })
}