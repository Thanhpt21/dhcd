// src/hooks/meeting-setting/useMeetingSettings.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseMeetingSettingsParams {
  page?: number
  limit?: number
  meetingId?: string
  isActive?: string
  search?: string
}

export const useMeetingSettings = ({
  page = 1,
  limit = 10,
  meetingId = '',
  isActive = '',
  search = ''
}: UseMeetingSettingsParams = {}) => {
  return useQuery({
    queryKey: ['meetingSettings', page, limit, meetingId, isActive, search],
    queryFn: async () => {
      const res = await api.get('/meeting-settings', {
        params: { page, limit, meetingId, isActive, search },
      })
      return res.data.data
    },
  })
}