// src/hooks/meeting/useCreateMeeting.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export interface CreateMeetingData {
  meetingCode: string
  meetingName: string
  meetingType: string
  meetingDate: string
  meetingLocation?: string
  meetingAddress?: string
  description?: string
  registrationStart?: string
  registrationEnd?: string
  votingStart?: string
  votingEnd?: string
  totalShares?: number
  totalShareholders?: number
  createdBy: number
  status?: string
}

export const useCreateMeeting = () => {
  return useMutation({
    mutationFn: async (data: CreateMeetingData) => {
      const res = await api.post('/meetings', data)
      return res.data.data // Lấy data từ { success, message, data }
    },
  })
}