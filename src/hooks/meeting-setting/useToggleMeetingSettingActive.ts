// src/hooks/meeting-setting/useToggleMeetingSettingActive.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useToggleMeetingSettingActive = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.put(`/meeting-settings/${id}/toggle-active`)
      return res.data.data
    },
  })
}