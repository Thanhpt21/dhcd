// src/hooks/question/useSelectQuestion.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useSelectQuestion = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (questionId: number) => {
      const res = await api.put(`/questions/${questionId}/select`)
      return res.data
    },
    onSuccess: (_, questionId) => {
      // Invalidate tất cả các queries liên quan đến questions
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      queryClient.invalidateQueries({ queryKey: ['question', questionId] })
      queryClient.invalidateQueries({ queryKey: ['meeting-questions'] })
      queryClient.invalidateQueries({ queryKey: ['top-upvoted-questions'] })
      queryClient.invalidateQueries({ queryKey: ['meetingQuestions'] })
      queryClient.invalidateQueries({ queryKey: ['question-statistics'] })
    },
  })
}