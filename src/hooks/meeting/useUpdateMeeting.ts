// src/hooks/meeting/useUpdateMeeting.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export interface UpdateMeetingData {
  meetingCode?: string
  meetingName?: string
  meetingType?: string
  meetingDate?: string
  meetingLocation?: string
  meetingAddress?: string
  description?: string
  registrationStart?: string
  registrationEnd?: string
  votingStart?: string
  votingEnd?: string
  totalShares?: number
  totalShareholders?: number
  status?: string
}

export const useUpdateMeeting = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string
      data: UpdateMeetingData
    }) => {
      const res = await api.put(`/meetings/${id}`, data)
      return res.data.data // Lấy data từ { success, message, data }
    },
  })
}