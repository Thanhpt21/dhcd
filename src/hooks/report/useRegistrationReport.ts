import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { RegistrationReport } from '@/types/report.type'

export const useRegistrationReport = (meetingId: number) => {
  return useQuery({
    queryKey: ['registration-report', meetingId],
    queryFn: async (): Promise<RegistrationReport> => {
      const res = await api.get(`/reports/meeting/${meetingId}/registration`)
      return res.data.data
    },
    enabled: !!meetingId,
  })
}