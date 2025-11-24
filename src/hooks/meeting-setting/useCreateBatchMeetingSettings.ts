// src/hooks/meeting-setting/useCreateBatchMeetingSettings.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { CreateMeetingSettingData } from '@/types/meeting-setting.type'

export const useCreateBatchMeetingSettings = () => {
  return useMutation({
    mutationFn: async ({
      meetingId,
      settings,
    }: {
      meetingId: number | string
      settings: CreateMeetingSettingData[]
    }) => {
      const res = await api.post(`/meeting-settings/meeting/${meetingId}/batch`, settings)
      return res.data.data
    },
  })
}