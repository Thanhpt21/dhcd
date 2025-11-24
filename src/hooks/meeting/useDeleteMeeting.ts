// src/hooks/meeting/useDeleteMeeting.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteMeeting = () => {
  return useMutation({
    mutationFn: async (id: string | number) => {
      const res = await api.delete(`/meetings/${id}`)
      return res.data // Trả về toàn bộ { success, message, data }
    },
  })
}