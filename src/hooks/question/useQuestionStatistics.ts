// src/hooks/question/useQuestionStatistics.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useQuestionStatistics = (meetingId: number) => {
  return useQuery({
    queryKey: ['question-statistics', meetingId],
    queryFn: async () => {
      const res = await api.get(`/questions/meeting/${meetingId}/statistics`)
      return res.data.data
    },
    enabled: !!meetingId,
  })
}