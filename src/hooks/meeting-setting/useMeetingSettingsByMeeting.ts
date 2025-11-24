// src/hooks/meeting-setting/useMeetingSettingsByMeeting.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useMeetingSettingsByMeeting = (meetingId: number | string) => {
  return useQuery({
    queryKey: ['meetingSettingsByMeeting', meetingId],
    queryFn: async () => {
      const res = await api.get(`/meeting-settings/meeting/${meetingId}`)
      return res.data.data
    },
    enabled: !!meetingId,
  })
}