// src/hooks/question/useQuestions.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseQuestionsParams {
  page?: number
  limit?: number
  meetingId?: string
  shareholderId?: string
  status?: string
  questionType?: string
  search?: string
}

export const useQuestions = (params: UseQuestionsParams = {}) => {
  const { page = 1, limit = 10, ...filters } = params
  
  return useQuery({
    queryKey: ['questions', { page, limit, ...filters }],
    queryFn: async () => {
      const res = await api.get('/questions', {
        params: { page, limit, ...filters },
      })
      return res.data.data
    },
     refetchInterval: 3000, 
    refetchIntervalInBackground: true, 
  })
}
