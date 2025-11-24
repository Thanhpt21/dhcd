// src/hooks/verification/useVerifyLinkWithMeeting.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { ServiceResponse, VerifyLinkResponse, VerifyLinkWithMeetingData } from '@/types/verification.type'

export const useVerifyLinkWithMeeting = () => {
  return useMutation({
    mutationFn: async ({ 
      verificationCode, 
      meetingId, 
      data 
    }: { 
      verificationCode: string; 
      meetingId: number; 
      data: VerifyLinkWithMeetingData 
    }): Promise<ServiceResponse<VerifyLinkResponse>> => {
      const res = await api.post(`/verification-links/verify/${verificationCode}/meetings/${meetingId}`, data)
      return res.data
    },
  })
}