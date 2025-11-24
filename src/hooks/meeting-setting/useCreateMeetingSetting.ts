// src/hooks/meeting-setting/useCreateMeetingSetting.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { CreateMeetingSettingData } from '@/types/meeting-setting.type'

export const useCreateMeetingSetting = () => {
  return useMutation({
    mutationFn: async (data: CreateMeetingSettingData) => {
      const res = await api.post('/meeting-settings', data)
      return res.data.data
    },
  })
}