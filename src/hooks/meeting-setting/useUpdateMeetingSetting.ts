// src/hooks/meeting-setting/useUpdateMeetingSetting.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { UpdateMeetingSettingData } from '@/types/meeting-setting.type'

export const useUpdateMeetingSetting = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string
      data: UpdateMeetingSettingData
    }) => {
      const res = await api.put(`/meeting-settings/${id}`, data)
      return res.data.data
    },
  })
}