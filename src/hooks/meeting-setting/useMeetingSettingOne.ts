// src/hooks/meeting-setting/useMeetingSettingOne.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useMeetingSettingOne = (id: number | string) => {
  return useQuery({
    queryKey: ['meetingSetting', id],
    queryFn: async () => {
      const res = await api.get(`/meeting-settings/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}