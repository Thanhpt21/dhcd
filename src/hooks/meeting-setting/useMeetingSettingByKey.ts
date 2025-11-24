// src/hooks/meeting-setting/useMeetingSettingByKey.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useMeetingSettingByKey = (
  meetingId: number | string, 
  key: string
) => {
  return useQuery({
    queryKey: ['meetingSettingByKey', meetingId, key],
    queryFn: async () => {
      const res = await api.get(`/meeting-settings/meeting/${meetingId}/key/${key}`)
      return res.data.data
    },
    enabled: !!meetingId && !!key,
  })
}