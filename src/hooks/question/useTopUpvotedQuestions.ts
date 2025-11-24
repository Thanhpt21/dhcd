// src/hooks/question/useTopUpvotedQuestions.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseTopUpvotedQuestionsParams {
  meetingId?: number
  limit?: number
}

export const useTopUpvotedQuestions = (params: UseTopUpvotedQuestionsParams = {}) => {
  const { meetingId, limit = 5 } = params
  
  return useQuery({
    queryKey: ['top-upvoted-questions', { meetingId, limit }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (meetingId) params.append('meetingId', meetingId.toString())
      params.append('limit', limit.toString())
      
      const res = await api.get(`/questions/top-upvoted?${params.toString()}`)
      return res.data.data
    },
    enabled: !!meetingId, // Chỉ fetch khi có meetingId
    refetchInterval: 3000, // Refetch mỗi 3 giây
    refetchIntervalInBackground: true, // Refetch cả khi tab không active
  })
}