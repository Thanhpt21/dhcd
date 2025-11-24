// src/hooks/verification/useVerificationLinkByCodeWithMeeting.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { ServiceResponse, VerificationLinkWithMeetingResponse } from '@/types/verification.type'

export const useVerificationLinkByCodeWithMeeting = (verificationCode: string, meetingId: number) => {
  return useQuery({
    queryKey: ['verificationLinkByCodeWithMeeting', verificationCode, meetingId],
    queryFn: async (): Promise<ServiceResponse<VerificationLinkWithMeetingResponse>> => {
      const res = await api.get(`/verification-links/code/${verificationCode}/meetings/${meetingId}`)
      return res.data
    },
    enabled: !!verificationCode && !!meetingId,
  })
}
