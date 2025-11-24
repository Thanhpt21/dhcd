// src/hooks/question/useMeetingQuestions.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useMeetingQuestions = (meetingId: number) => {
  return useQuery({
    queryKey: ['meeting-questions', meetingId],
    queryFn: async () => {
      const res = await api.get(`/questions/meeting/${meetingId}`)
      return res.data.data
    },
    enabled: !!meetingId,
    refetchInterval: 3000, // Refetch mỗi 3 giây
    refetchIntervalInBackground: true, // Refetch cả khi tab không active
  })
}