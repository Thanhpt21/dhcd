// src/hooks/meeting-setting/useDeleteMeetingSetting.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteMeetingSetting = () => {
  return useMutation({
    mutationFn: async (id: string | number) => {
      const res = await api.delete(`/meeting-settings/${id}`)
      return res.data
    },
  })
}