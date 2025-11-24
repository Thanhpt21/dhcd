// src/hooks/meeting/useUpdateMeetingStatus.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useUpdateMeetingStatus = () => {
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number | string
      status: string
    }) => {
      const res = await api.patch(`/meetings/${id}/status`, { status })
      return res.data.data // Lấy data từ { success, message, data }
    },
  })
}